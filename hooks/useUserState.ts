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

            if (session?.user?.id) {
                try {
                    const res = await fetch('/api/user/state');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.state) {

                            // Check streak expiration
                            const now = Date.now();
                            const lastPlayed = data.state.lastPlayedAt || 0;
                            const daysSince = Math.floor((now - lastPlayed) / 86400000);
                            if (daysSince > 1) {
                                data.state.streak = 0;
                            }

                            // Calculate Level key by xp if needed (DB stores integer, we need string key for frontend UI)
                            const levelKey = getLevelByXp(data.state.xp).key;

                            setUser({
                                ...DEFAULT_USER,
                                ...data.state,
                                level: levelKey,
                                onboardingComplete: true
                            });
                        }
                    } else if (res.status === 404) {
                        // User exists but has no profile/state yet, fallback to default for new users
                        setUser({
                            ...DEFAULT_USER,
                            name: session.user.name || 'Player'
                        });
                    }
                } catch (e) {
                    console.error('Failed to load user state from DB', e);
                }
            }
            setIsLoaded(true);
        };
        loadUser();
    }, [session, status]);

    const save = useCallback((updated: UserState) => {
        setUser(updated); // Optimistic UI update

        if (session?.user?.id) {
            fetch('/api/user/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            }).catch(e => console.error('Failed to save user state to DB', e));
        }
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
        const weeklyActivity = [...user.weeklyActivity];
        const todayIdx = new Date().getDay();
        weeklyActivity[todayIdx] = (weeklyActivity[todayIdx] || 0) + result.score;

        const currentXp = user.xp; // Backend will receive this and can add score, but we do it optimistically here too to avoid lag
        // Since we removed /api/progress/save or if we kept it, we must ensure we don't double count XP.
        // Actually, the new state overrides the DB, so we must add the score here.
        const newXp = currentXp + result.score;

        let currentStreak = user.streak;
        const lastPlayed = user.lastPlayedAt || 0;
        const daysSince = Math.floor((now - lastPlayed) / 86400000);

        if (daysSince === 1) {
            currentStreak += 1;
        } else if (daysSince > 1) {
            currentStreak = 1; // reset streak if missed a day, but played today
        } else if (currentStreak === 0) {
            currentStreak = 1; // Play first time
        }

        const currentLevel = getLevelByXp(newXp);

        const existingWords = new Set(user.learnedWords.map(w => w.word));
        const newWords = result.learnedWords.filter(w => !existingWords.has(w.word));

        const songsCompleted = Array.from(new Set([...user.songsCompleted, result.songId]));

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
            xp: newXp,
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
        setUser({ ...DEFAULT_USER, name: session?.user?.name || 'Player' });
        if (session?.user?.id) {
            fetch('/api/user/state', { method: 'POST', body: JSON.stringify(DEFAULT_USER) });
        }
    }, [session]);

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
