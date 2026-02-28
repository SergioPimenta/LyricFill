export interface Blank {
    word: string;
    index: number; // word index in line
    hint: string;  // e.g. "l____"
    level: 'beginner' | 'intermediate' | 'advanced';
}

export interface LyricsLine {
    timestamp: number; // seconds from start
    text: string;
    blanks?: Blank[];
}

export interface LyricsVerse {
    label: string;
    lines: LyricsLine[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    genre: 'pop' | 'rock' | 'rnb' | 'country' | 'indie' | 'electronic';
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // seconds
    estimatedMinutes: number;
    coverColor: string; // fallback gradient color
    syncOffset?: number; // seconds — positive = shift lyrics later, negative = earlier
    verses: LyricsVerse[];
}

export interface BlankState {
    lineIdx: number;
    blankIdx: number;
    word: string;
    hint: string;
    userInput: string;
    attempts: number;
    isCorrect: boolean;
    isRevealed: boolean;
    earnedPoints: number;
}

export interface GameSession {
    songId: string;
    startedAt?: number;
    blanks?: BlankState[];
    score: number;
    combo?: number;
    maxCombo?: number;
    completedAt?: number;
    accuracy: number;
    blanksCorrect: number;
    blanksTotal: number;
    createdAt: string;
}

export interface LearnedWord {
    word: string;
    translation: string;
    context: string;
    example: string;
    formality: 'formal' | 'informal' | 'slang';
    relatedExpressions: string[];
    songId: string;
    songTitle: string;
    learnedAt: number;
}

export interface Achievement {
    key: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: number;
}

export interface UserState {
    name: string;
    level: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
    xp: number;
    streak: number;
    lastPlayedAt: number;
    songsCompleted: string[];
    learnedWords: LearnedWord[];
    achievements: Achievement[];
    weeklyActivity: number[]; // last 7 days XP
    favorites: string[];
    history: SessionResult[];
    onboardingComplete: boolean;
}

export interface SessionResult {
    songId: string;
    songTitle: string;
    songArtist: string;
    score: number;
    accuracy: number;
    blanksCorrect: number;
    blanksTotal: number;
    playedAt: number;
    learnedWords: LearnedWord[];
}

export interface ExpressionExplanation {
    word: string;
    translation: string;
    context: string;
    example: string;
    formality: 'formal' | 'informal' | 'slang';
    relatedExpressions: string[];
}

export type SongLevel = 'beginner' | 'intermediate' | 'advanced';
export type SongGenre = 'pop' | 'rock' | 'rnb' | 'country' | 'indie' | 'electronic';
export type UserLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
