'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserState, SessionResult, LearnedWord, Achievement } from '@/types';
import { ALL_ACHIEVEMENTS, getLevelByXp } from '@/data/constants';

const STORAGE_KEY = 'lyricfill_user';

const DEFAULT_USER: UserState = {
    name: 'Learner',
    level: 'beginner',
    xp: 0,
    streak: 0,
    lastPlayedAt: 0,
    songsCompleted: [],
    learnedWords: [],
    achievements: [],
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    favorites: [],
    history: [],
    onboardingComplete: false,
};

export function useUserState() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserState>(DEFAULT_USER);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            if (status === 'loading') return;

            if (status === 'unauthenticated') {
                setUser(DEFAULT_USER);
                setIsLoaded(true);
                return;
            }

            // Priority 1: DB data if logged in
            if (session?.user?.id) {
                const storageKey = `lyricfill_user_${session.user.id}`;
                try {
                    const res = await fetch('/api/user/me');
                    let dbXp = 0;
                    let dbStreak = 0;
                    let dbName = session.user.name || 'Player';

                    if (res.ok) {
                        const dbUser = await res.json();
                        dbXp = dbUser.profile.xp;
                        dbStreak = dbUser.profile.streak;
                        dbName = dbUser.name || session.user.name || 'Player';
                    }

                    // Priority 2: Local storage scoped to User ID
                    let localData = {};
                    const stored = localStorage.getItem(storageKey);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const now = Date.now();
                        const lastPlayed = parsed.lastPlayedAt || 0;
                        const daysSince = Math.floor((now - lastPlayed) / 86400000);
                        if (daysSince > 1) {
                            parsed.streak = 0;
                        }
                        localData = parsed;
                    }

                    setUser({
                        ...DEFAULT_USER,
                        ...localData,
                        name: dbName,
                        xp: dbXp, // DB is the source of truth for XP/Streak
                        streak: dbStreak,
                        onboardingComplete: true
                    });
                } catch (e) {
                    console.error('Failed to load user state', e);
                }
            }
            setIsLoaded(true);
        };
        loadUser();
    }, [session, status]);

    const save = useCallback((updated: UserState) => {
        try {
            if (session?.user?.id) {
                const storageKey = `lyricfill_user_${session.user.id}`;
                localStorage.setItem(storageKey, JSON.stringify(updated));
            }
        } catch (e) {
            console.error('Failed to save user state', e);
        }
        setUser(updated);
    }, [session]);

    const completeOnboarding = useCallback((level: UserState['level'], name?: string) => {
        const updated = {
            ...user,
            level,
            name: name || user.name,
            onboardingComplete: true,
        };
        save(updated);
    }, [user, save]);

    const recordSession = useCallback((result: SessionResult) => {
        const now = Date.now();

        // Update weekly activity locally (db is only tracked for pure xp)
        const weeklyActivity = [...user.weeklyActivity];
        const todayIdx = new Date().getDay();
        weeklyActivity[todayIdx] = (weeklyActivity[todayIdx] || 0) + result.score;

        // DB is the source of truth for XP and Streak. We do not increment it locally here,
        // because /api/progress/save already did. Next session fetch will sync it anyway.
        const currentXp = user.xp;
        const currentStreak = user.streak;
        const currentLevel = getLevelByXp(currentXp);

        // Update learned words (deduplicate)
        const existingWords = new Set(user.learnedWords.map(w => w.word));
        const newWords = result.learnedWords.filter(w => !existingWords.has(w.word));

        // Update songs completed
        const songsCompleted = Array.from(new Set([...user.songsCompleted, result.songId]));

        // Check achievements
        const unlockedKeys = new Set(user.achievements.map(a => a.key));
        const newAchievements = [...user.achievements];

        const checkAchievement = (key: string, condition: boolean) => {
            if (condition && !unlockedKeys.has(key)) {
                const ach = ALL_ACHIEVEMENTS.find(a => a.key === key);
                if (ach) {
                    newAchievements.push({ ...ach, unlockedAt: now });
                }
            }
        };

        checkAchievement('first_song', songsCompleted.length >= 1);
        checkAchievement('perfect_score', result.accuracy === 100);
        checkAchievement('songs_5', songsCompleted.length >= 5);
        checkAchievement('words_50', user.learnedWords.length + newWords.length >= 50);
        checkAchievement('streak_7', currentStreak >= 7);
        checkAchievement('advanced_song', result.songId === 'blinding-lights' || result.songId === 'hotel-california');

        const updated: UserState = {
            ...user,
            xp: currentXp,
            level: currentLevel.key as UserState['level'],
            streak: currentStreak,
            lastPlayedAt: now,
            songsCompleted,
            learnedWords: [...user.learnedWords, ...newWords],
            achievements: newAchievements,
            weeklyActivity,
            history: [result, ...user.history].slice(0, 50),
        };

        save(updated);
        return updated;
    }, [user, save]);

    const toggleFavorite = useCallback((songId: string) => {
        const favorites = user.favorites.includes(songId)
            ? user.favorites.filter(id => id !== songId)
            : [...user.favorites, songId];
        save({ ...user, favorites });
    }, [user, save]);

    const addLearnedWords = useCallback((words: LearnedWord[]) => {
        const existingWords = new Set(user.learnedWords.map(w => w.word));
        const newWords = words.filter(w => !existingWords.has(w.word));
        if (newWords.length > 0) {
            save({ ...user, learnedWords: [...user.learnedWords, ...newWords] });
        }
    }, [user, save]);

    const resetUser = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(DEFAULT_USER);
    }, []);

    return {
        user,
        isLoaded,
        completeOnboarding,
        recordSession,
        toggleFavorite,
        addLearnedWords,
        resetUser,
    };
}
