'use client';

import { useState, useCallback, useRef } from 'react';
import { Song, BlankState, GameSession } from '@/types';
import { useRouter } from 'next/navigation';

const POINTS_FIRST = 10;
const POINTS_SECOND = 5;
const POINTS_SPEED = 5;
const COMBO_MULTIPLIER_1 = 1.5;
const COMBO_MULTIPLIER_2 = 2.0;

function buildBlanks(song: Song): BlankState[] {
    const blanks: BlankState[] = [];
    song.verses.forEach((verse, vIdx) => {
        verse.lines.forEach((line, lIdx) => {
            (line.blanks || []).forEach((blank, bIdx) => {
                blanks.push({
                    lineIdx: vIdx * 1000 + lIdx, // unique key per line
                    blankIdx: bIdx,
                    word: blank.word,
                    hint: blank.hint,
                    userInput: '',
                    attempts: 0,
                    isCorrect: false,
                    isRevealed: false,
                    earnedPoints: 0,
                });
            });
        });
    });
    return blanks;
}

const saveProgress = async (songId: string, score: number, accuracy: number, blanksCorrect: number, blanksTotal: number) => {
    try {
        await fetch('/api/progress/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId, score, accuracy, blanksCorrect, blanksTotal })
        });
    } catch (e) {
        console.error("Failed to save progress remotely", e);
    }
};

export function useGameEngine(song: Song, externalTimestamps?: Map<number, number>) {
    const router = useRouter();
    const [blanks, setBlanks] = useState<BlankState[]>(() => buildBlanks(song));
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [justCorrect, setJustCorrect] = useState<string | null>(null);
    const [justWrong, setJustWrong] = useState<string | null>(null);
    const [comboAnimation, setComboAnimation] = useState(false);
    const playerRef = useRef<YT.Player | null>(null);

    const getSession = useCallback((): GameSession => {
        const totalCount = blanks.length;
        const correctCount = blanks.filter(b => b.isCorrect).length;
        const currentScore = blanks.reduce((sum, b) => sum + b.earnedPoints, 0);
        const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

        return {
            songId: song.id,
            score: currentScore,
            accuracy,
            blanksCorrect: correctCount,
            blanksTotal: totalCount,
            createdAt: new Date().toISOString()
        };
    }, [song.id, blanks]);

    // Flat list of all lines across all verses
    const allLines = song.verses.flatMap((verse, vIdx) =>
        verse.lines.map((line, lIdx) => ({
            ...line,
            verseIdx: vIdx,
            lineIdx: lIdx,
            key: vIdx * 1000 + lIdx,
        }))
    );

    // Current active line based on timestamp.
    // Prefers LRCLIB-sourced timestamps (externalTimestamps) when available,
    // falling back to the hardcoded song timestamp for unmatched lines.
    const activeLineKey = (() => {
        let active = allLines[0]?.key ?? 0;
        for (const line of allLines) {
            const ts = externalTimestamps?.get(line.key) ?? line.timestamp;
            if (currentTime >= ts) active = line.key;
            else break;
        }
        return active;
    })();

    const getBlankKey = (lineKey: number, blankIdx: number) => `${lineKey}-${blankIdx}`;

    const getMultiplier = (c: number) => {
        if (c >= 10) return COMBO_MULTIPLIER_2;
        if (c >= 5) return COMBO_MULTIPLIER_1;
        return 1;
    };

    const submitBlank = useCallback(
        (lineKey: number, blankIdx: number, input: string, isSpeedBonus: boolean) => {
            const key = getBlankKey(lineKey, blankIdx);
            setBlanks(prev => {
                const idx = prev.findIndex(b => b.lineIdx === lineKey && b.blankIdx === blankIdx);
                if (idx === -1 || prev[idx].isCorrect || prev[idx].isRevealed) return prev;

                const blank = prev[idx];
                const isCorrect = input.trim().toLowerCase() === blank.word.toLowerCase();
                const updated = [...prev];

                if (isCorrect) {
                    let pts = blank.attempts === 0 ? POINTS_FIRST : POINTS_SECOND;
                    if (isSpeedBonus && blank.attempts === 0) pts += POINTS_SPEED;
                    const multiplier = getMultiplier(combo + 1);
                    const earned = Math.round(pts * multiplier);

                    updated[idx] = { ...blank, isCorrect: true, userInput: input, earnedPoints: earned };
                    setScore(s => s + earned);
                    setCombo(c => {
                        const next = c + 1;
                        setMaxCombo(m => Math.max(m, next));
                        if (next === 5 || next === 10) setComboAnimation(true);
                        return next;
                    });
                    setJustCorrect(key);
                    setTimeout(() => setJustCorrect(null), 700);
                } else {
                    updated[idx] = { ...blank, attempts: blank.attempts + 1, userInput: input };
                    setCombo(0);
                    setJustWrong(key);
                    setTimeout(() => setJustWrong(null), 600);
                }

                return updated;
            });
        },
        [combo]
    );

    const revealBlank = useCallback((lineKey: number, blankIdx: number) => {
        setBlanks(prev => {
            const idx = prev.findIndex(b => b.lineIdx === lineKey && b.blankIdx === blankIdx);
            if (idx === -1 || prev[idx].isCorrect) return prev;
            const updated = [...prev];
            updated[idx] = { ...prev[idx], isRevealed: true, userInput: prev[idx].word };
            return updated;
        });
        setCombo(0);
    }, []);

    const revealAll = useCallback(() => {
        setBlanks(prev =>
            prev.map(b =>
                b.isCorrect ? b : { ...b, isRevealed: true, userInput: b.word }
            )
        );
        setCombo(0);
    }, []);

    const checkAll = useCallback(() => {
        // Trigger visual feedback for all unanswered blanks
    }, []);

    const handleFinish = useCallback(() => {
        const totalCount = blanks.length;
        const correctCount = blanks.filter(b => b.isCorrect).length;
        const currentScore = blanks.reduce((sum, b) => sum + b.earnedPoints, 0);
        const accuracy = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);

        const finishedSession: GameSession = {
            songId: song.id,
            score: currentScore,
            accuracy,
            blanksCorrect: correctCount,
            blanksTotal: totalCount,
            createdAt: new Date().toISOString()
        };

        // Fire async remote save
        saveProgress(song.id, currentScore, accuracy, correctCount, totalCount);

        setTimeout(() => {
            router.push(`/results/${song.id}`);
        }, 3000);
    }, [song.id, blanks, router]);

    const getAccuracy = () => {
        const answered = blanks.filter(b => b.isCorrect || b.isRevealed);
        const correct = blanks.filter(b => b.isCorrect);
        if (answered.length === 0) return 0;
        return Math.round((correct.length / blanks.length) * 100);
    };

    const getBlankState = (lineKey: number, blankIdx: number) =>
        blanks.find(b => b.lineIdx === lineKey && b.blankIdx === blankIdx);

    return {
        blanks,
        score,
        combo,
        maxCombo,
        currentTime,
        setCurrentTime,
        isPlaying,
        setIsPlaying,
        activeLineKey,
        allLines,
        justCorrect,
        justWrong,
        comboAnimation,
        setComboAnimation,
        playerRef,
        submitBlank,
        revealBlank,
        revealAll,
        checkAll,
        getSession,
        getAccuracy,
        getBlankKey,
        getBlankState,
        getMultiplier,
    };
}
