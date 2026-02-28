'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/hooks/useUserState';
import { UserState } from '@/types';

const QUESTIONS = [
    {
        id: 1,
        question: "What does 'overwhelmed' mean?",
        options: ['Surprised', 'Overloaded / having too much to handle', 'Happy', 'Confused'],
        correct: 1,
        level: 'intermediate',
    },
    {
        id: 2,
        question: "Choose the correct sentence:",
        options: [
            "She don't like coffee.",
            "She doesn't likes coffee.",
            "She doesn't like coffee.",
            "She not like coffee.",
        ],
        correct: 2,
        level: 'elementary',
    },
    {
        id: 3,
        question: "What is a 'phrasal verb'?",
        options: [
            "A verb with an adjective",
            "A verb combined with a preposition or adverb (e.g. give up)",
            "A verb in past tense",
            "A verb in the future",
        ],
        correct: 1,
        level: 'intermediate',
    },
    {
        id: 4,
        question: "Translate: 'Ele desistiu de fumar'",
        options: [
            "He stopped to smoke.",
            "He gave up smoking.",
            "He quit to smoke.",
            "He abandoned the smoke.",
        ],
        correct: 1,
        level: 'upper-intermediate',
    },
    {
        id: 5,
        question: "What does 'notwithstanding' mean?",
        options: ['Nevertheless / despite', 'As a result', 'In addition', 'Instead of'],
        correct: 0,
        level: 'advanced',
    },
];

const LEVEL_THRESHOLDS: Record<number, UserState['level']> = {
    0: 'beginner',
    1: 'beginner',
    2: 'elementary',
    3: 'intermediate',
    4: 'upper-intermediate',
    5: 'advanced',
};

export default function OnboardingPage() {
    const router = useRouter();
    const { completeOnboarding } = useUserState();
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [name, setName] = useState('');
    const [step, setStep] = useState<'name' | 'quiz' | 'result'>('name');
    const [assignedLevel, setAssignedLevel] = useState<UserState['level']>('beginner');

    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        const correct = QUESTIONS[currentQ].correct === idx;

        setTimeout(() => {
            const newAnswers = [...answers, idx];
            setAnswers(newAnswers);

            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(currentQ + 1);
                setSelected(null);
            } else {
                // Calculate score
                const correctCount = newAnswers.filter((a, i) => a === QUESTIONS[i].correct).length;
                const level = LEVEL_THRESHOLDS[correctCount];
                setAssignedLevel(level);
                completeOnboarding(level, name || 'Learner');
                setStep('result');
            }
        }, 1000);
    };

    const handleStartQuiz = () => {
        if (name.trim()) setStep('quiz');
    };

    const LEVEL_LABELS: Record<string, { label: string; desc: string; color: string; emoji: string }> = {
        beginner: { label: 'Beginner', desc: 'Você está começando. Vamos do básico ao avançado com músicas simples!', color: '#4ade80', emoji: '🌱' },
        elementary: { label: 'Elementary', desc: 'Você tem o básico. Hora de expandir seu vocabulário!', color: '#60a5fa', emoji: '📗' },
        intermediate: { label: 'Intermediate', desc: 'Bom nível! Vamos trabalhar expressões e phrasal verbs.', color: '#a78bfa', emoji: '📘' },
        'upper-intermediate': { label: 'Upper Intermediate', desc: 'Impressionante! Músicas desafiadoras vão elevar ainda mais seu inglês.', color: '#f59e0b', emoji: '🎓' },
        advanced: { label: 'Advanced', desc: 'Excelente! Você tem um nível avançado. Vamos explorar nuances e gírias.', color: '#e8ff47', emoji: '🏆' },
    };

    const q = QUESTIONS[currentQ];
    const progress = ((currentQ) / QUESTIONS.length) * 100;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundImage: 'radial-gradient(ellipse at top, #1a1a3a 0%, #0a0a0f 60%)',
        }}>
            <div style={{ width: '100%', maxWidth: '560px', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#e8ff47', letterSpacing: '3px' }}>
                        🎶 LYRICFILL
                    </span>
                </div>

                {/* Name Step */}
                {step === 'name' && (
                    <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '20px', padding: '40px' }}>
                        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', letterSpacing: '2px', textAlign: 'center', marginBottom: '8px' }}>
                            BEM-VINDO!
                        </h2>
                        <p style={{ color: '#8888aa', textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>
                            Vamos fazer um teste rápido para definir seu nível inicial.
                        </p>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#8888aa', marginBottom: '8px', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Seu nome
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleStartQuiz()}
                                placeholder="Como devo te chamar?"
                                style={{
                                    width: '100%',
                                    background: '#0a0a0f',
                                    border: '1px solid #2a2a3a',
                                    borderRadius: '10px',
                                    padding: '12px 16px',
                                    color: '#f0f0ff',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                                onFocus={e => (e.target.style.borderColor = '#e8ff47')}
                                onBlur={e => (e.target.style.borderColor = '#2a2a3a')}
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={handleStartQuiz}
                            disabled={!name.trim()}
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', opacity: name.trim() ? 1 : 0.5 }}
                        >
                            Começar Teste de Nível →
                        </button>
                        <p style={{ textAlign: 'center', color: '#4a4a6a', fontSize: '12px', marginTop: '16px' }}>
                            5 perguntas • ~1 minuto • Sem cadastro necessário
                        </p>
                    </div>
                )}

                {/* Quiz Step */}
                {step === 'quiz' && (
                    <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '20px', padding: '40px' }}>
                        {/* Progress */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <span style={{ fontSize: '12px', color: '#8888aa', fontFamily: "'Space Mono', monospace" }}>
                                {currentQ + 1} / {QUESTIONS.length}
                            </span>
                            <div style={{ flex: 1, height: '4px', background: '#2a2a3a', borderRadius: '2px', margin: '0 12px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #b8cc1a, #e8ff47)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#e8ff47', fontFamily: "'Space Mono', monospace" }}>
                                {Math.round(progress)}%
                            </span>
                        </div>

                        {/* Question */}
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f0ff', marginBottom: '24px', lineHeight: '1.4' }}>
                            {q.question}
                        </h3>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.options.map((opt, idx) => {
                                const isSelected = selected === idx;
                                const isCorrect = idx === q.correct;
                                let bg = '#0a0a0f';
                                let border = '#2a2a3a';
                                let color = '#f0f0ff';

                                if (selected !== null) {
                                    if (isCorrect) { bg = 'rgba(74, 222, 128, 0.12)'; border = '#4ade80'; color = '#4ade80'; }
                                    else if (isSelected && !isCorrect) { bg = 'rgba(248, 113, 113, 0.12)'; border = '#f87171'; color = '#f87171'; }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={selected !== null}
                                        style={{
                                            background: bg,
                                            border: `1px solid ${border}`,
                                            borderRadius: '10px',
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            cursor: selected !== null ? 'default' : 'pointer',
                                            color,
                                            fontSize: '14px',
                                            fontFamily: "'DM Sans', sans-serif",
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, color }}>
                                            {selected !== null && isCorrect ? '✓' : selected !== null && isSelected ? '✗' : String.fromCharCode(65 + idx)}
                                        </span>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Result Step */}
                {step === 'result' && (
                    <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '20px', padding: '40px', textAlign: 'center', animation: 'scaleIn 0.4s ease-out' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                            {LEVEL_LABELS[assignedLevel]?.emoji}
                        </div>
                        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '2px', color: LEVEL_LABELS[assignedLevel]?.color, marginBottom: '4px' }}>
                            {LEVEL_LABELS[assignedLevel]?.label}
                        </h2>
                        <p style={{ fontSize: '14px', color: '#8888aa', marginBottom: '8px' }}>
                            Nível definido para <strong style={{ color: '#f0f0ff' }}>{name}</strong>
                        </p>
                        <p style={{ fontSize: '14px', color: '#8888aa', maxWidth: '380px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                            {LEVEL_LABELS[assignedLevel]?.desc}
                        </p>
                        <button
                            onClick={() => router.push('/home')}
                            className="btn-primary"
                            style={{ padding: '14px 36px', fontSize: '16px' }}
                        >
                            🎵 Ver Catálogo de Músicas →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
