import { Achievement } from '@/types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    {
        key: 'first_song',
        title: 'First Notes',
        description: 'Complete your first song',
        icon: '🎵',
    },
    {
        key: 'perfect_score',
        title: 'Perfect Pitch',
        description: 'Get 100% accuracy on a song',
        icon: '⭐',
    },
    {
        key: 'combo_10',
        title: 'Combo Master',
        description: 'Get a 10x combo streak',
        icon: '🔥',
    },
    {
        key: 'streak_7',
        title: 'Week Warrior',
        description: 'Play 7 days in a row',
        icon: '📅',
    },
    {
        key: 'songs_5',
        title: 'Playlist',
        description: 'Complete 5 different songs',
        icon: '🎶',
    },
    {
        key: 'words_50',
        title: 'Vocabulary Builder',
        description: 'Learn 50 different words',
        icon: '📚',
    },
    {
        key: 'daily_challenge',
        title: 'Daily Grind',
        description: 'Complete the daily challenge',
        icon: '🏆',
    },
    {
        key: 'speed_demon',
        title: 'Speed Demon',
        description: 'Get 5 speed bonuses in one song',
        icon: '⚡',
    },
    {
        key: 'advanced_song',
        title: 'Advanced Scholar',
        description: 'Complete an advanced level song',
        icon: '🎓',
    },
    {
        key: 'songs_same_artist_3',
        title: 'Super Fan',
        description: 'Complete 3 songs from the same artist',
        icon: '🌟',
    },
];

export const USER_LEVELS = [
    { key: 'beginner', label: 'Beginner', minXp: 0, maxXp: 200, color: '#4ade80' },
    { key: 'elementary', label: 'Elementary', minXp: 200, maxXp: 600, color: '#60a5fa' },
    { key: 'intermediate', label: 'Intermediate', minXp: 600, maxXp: 1500, color: '#a78bfa' },
    { key: 'upper-intermediate', label: 'Upper Intermediate', minXp: 1500, maxXp: 3000, color: '#f59e0b' },
    { key: 'advanced', label: 'Advanced', minXp: 3000, maxXp: 999999, color: '#e8ff47' },
];

export function getLevelByXp(xp: number) {
    return USER_LEVELS.reduce((acc, level) => {
        if (xp >= level.minXp) return level;
        return acc;
    }, USER_LEVELS[0]);
}

export function getLevelProgress(xp: number) {
    const level = getLevelByXp(xp);
    const range = level.maxXp - level.minXp;
    const progress = xp - level.minXp;
    return Math.min((progress / range) * 100, 100);
}
