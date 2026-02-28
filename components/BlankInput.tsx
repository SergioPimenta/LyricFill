'use client';

import { useState, useRef, useEffect } from 'react';

interface BlankInputProps {
    word: string;
    hint: string;
    isCorrect: boolean;
    isRevealed: boolean;
    isWrong: boolean;
    attempts: number;
    onSubmit: (value: string) => void;
    onReveal: () => void;
    autoFocus?: boolean;
}

export default function BlankInput({
    word,
    hint,
    isCorrect,
    isRevealed,
    isWrong,
    attempts,
    onSubmit,
    onReveal,
    autoFocus,
}: BlankInputProps) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isCorrect || isRevealed) {
            setValue(word);
        }
    }, [isCorrect, isRevealed, word]);

    const inputWidth = Math.max(50, word.length * 12 + 20);

    const getStatus = () => {
        if (isCorrect) return 'correct';
        if (isRevealed) return 'revealed';
        if (isWrong) return 'wrong';
        return 'default';
    };

    const status = getStatus();

    const borderColor = {
        correct: '#4ade80',
        wrong: '#f87171',
        revealed: '#8888aa',
        default: value ? 'rgba(232, 255, 71, 0.5)' : 'rgba(232, 255, 71, 0.25)',
    }[status];

    const bgColor = {
        correct: 'rgba(74, 222, 128, 0.15)',
        wrong: 'rgba(248, 113, 113, 0.12)',
        revealed: 'rgba(136, 136, 170, 0.08)',
        default: 'rgba(232, 255, 71, 0.06)',
    }[status];

    const textColor = {
        correct: '#4ade80',
        wrong: '#f87171',
        revealed: '#8888aa',
        default: '#e8ff47',
    }[status];

    const animation = status === 'wrong' ? 'shakeWrong 0.4s ease-in-out' :
        status === 'correct' ? 'pulseCorrect 0.6s ease-in-out' : 'none';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (value.trim()) {
                onSubmit(value.trim());
                if (!isCorrect) setValue('');
            }
        }
    };

    const disabled = isCorrect || isRevealed;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', verticalAlign: 'baseline', margin: '0 3px' }}>
            {/* Hint shown above */}
            {!isCorrect && !isRevealed && (
                <span style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '10px',
                    fontFamily: "'Space Mono', monospace",
                    color: '#4a4a6a',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}>
                    {hint}
                </span>
            )}
            <input
                ref={inputRef}
                type="text"
                value={value}
                disabled={disabled}
                autoFocus={autoFocus}
                onChange={e => {
                    if (!disabled) setValue(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={hint}
                style={{
                    width: `${inputWidth}px`,
                    background: bgColor,
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: '6px',
                    color: textColor,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.88em',
                    fontWeight: '700',
                    padding: '2px 8px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    animation,
                    textAlign: 'center',
                    cursor: disabled ? 'default' : 'text',
                }}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
            />
            {/* Correct badge */}
            {isCorrect && (
                <span style={{ position: 'absolute', top: '-8px', right: '-6px', fontSize: '10px' }}>✅</span>
            )}
        </span>
    );
}
