'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserState } from '@/hooks/useUserState';
import Navbar from '@/components/Navbar';

export default function FlashcardsPage() {
    const { user } = useUserState();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [filter, setFilter] = useState<'all' | 'formal' | 'informal' | 'slang'>('all');

    const words = filter === 'all'
        ? user.learnedWords
        : user.learnedWords.filter(w => w.formality === filter);

    const word = words[currentIdx];
    const hasWords = words.length > 0;

    const goNext = () => {
        setFlipped(false);
        setTimeout(() => setCurrentIdx(i => (i + 1) % words.length), 100);
    };

    const goPrev = () => {
        setFlipped(false);
        setTimeout(() => setCurrentIdx(i => (i - 1 + words.length) % words.length), 100);
    };

    const FORMALITY_CONFIG: Record<string, { label: string; color: string }> = {
        formal: { label: 'Formal', color: '#60a5fa' },
        informal: { label: 'Informal', color: '#a78bfa' },
        slang: { label: 'Gíria', color: '#fbbf24' },
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <Navbar />
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px' }}>
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '3px', color: '#f0f0ff', marginBottom: '6px' }}>
                        FLASH<span style={{ color: '#e8ff47' }}>CARDS</span>
                    </h1>
                    <p style={{ color: '#8888aa', fontSize: '14px' }}>
                        Revise as {user.learnedWords.length} palavras que você aprendeu nas músicas.
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {(['all', 'formal', 'informal', 'slang'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setCurrentIdx(0); setFlipped(false); }}
                            className={`btn-ghost${filter === f ? ' active' : ''}`}
                            style={{ fontSize: '13px', padding: '6px 14px' }}
                        >
                            {f === 'all' ? `Todos (${user.learnedWords.length})` : `${FORMALITY_CONFIG[f].label} (${user.learnedWords.filter(w => w.formality === f).length})`}
                        </button>
                    ))}
                </div>

                {!hasWords ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>📚</div>
                        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: '#f0f0ff', marginBottom: '8px' }}>
                            Nenhuma palavra ainda!
                        </h2>
                        <p style={{ color: '#8888aa', fontSize: '15px', marginBottom: '24px' }}>
                            Complete algumas músicas para construir sua coleção de palavras.
                        </p>
                        <Link href="/home">
                            <button className="btn-primary">🎵 Ir para o Catálogo</button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Progress */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#8888aa' }}>
                                {currentIdx + 1} / {words.length}
                            </span>
                            <div style={{ flex: 1, height: '3px', background: '#2a2a3a', margin: '0 12px', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${((currentIdx + 1) / words.length) * 100}%`, background: '#e8ff47', borderRadius: '2px', transition: 'width 0.3s ease' }} />
                            </div>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#4a4a6a' }}>
                                {word.songTitle}
                            </span>
                        </div>

                        {/* Flashcard */}
                        <div
                            className={`flashcard-scene${flipped ? ' flipped' : ''}`}
                            onClick={() => setFlipped(f => !f)}
                            style={{ height: '220px', cursor: 'pointer', userSelect: 'none', marginBottom: '20px' }}
                        >
                            <div className="flashcard-inner">
                                {/* Front */}
                                <div className="flashcard-front" style={{
                                    background: '#12121a',
                                    border: '1px solid #2a2a3a',
                                }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '3px', color: '#e8ff47', marginBottom: '8px', animation: 'glow 2s ease-in-out infinite alternate' }}>
                                        {word.word}
                                    </div>
                                    {word.formality && (
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontFamily: "'Space Mono', monospace",
                                            color: FORMALITY_CONFIG[word.formality]?.color || '#8888aa',
                                            background: `${FORMALITY_CONFIG[word.formality]?.color || '#8888aa'}15`,
                                            border: `1px solid ${FORMALITY_CONFIG[word.formality]?.color || '#8888aa'}40`,
                                            marginBottom: '12px',
                                        }}>
                                            {FORMALITY_CONFIG[word.formality]?.label || word.formality}
                                        </span>
                                    )}
                                    <p style={{ fontSize: '13px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace" }}>
                                        Clique para ver a tradução
                                    </p>
                                </div>

                                {/* Back */}
                                <div className="flashcard-back">
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#4ade80', letterSpacing: '2px', marginBottom: '6px' }}>
                                        {word.translation}
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#8888aa', textAlign: 'center', lineHeight: '1.5', maxWidth: '400px', marginBottom: '10px' }}>
                                        {word.context}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#b0b0cc', fontStyle: 'italic', textAlign: 'center' }}>
                                        "{word.example}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Related expressions */}
                        {flipped && word.relatedExpressions && word.relatedExpressions.length > 0 && (
                            <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '14px', marginBottom: '16px', animation: 'slideDown 0.3s ease-out' }}>
                                <div style={{ fontSize: '11px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                    Expressões relacionadas
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {word.relatedExpressions.map((expr, i) => (
                                        <span key={i} style={{ background: '#1a1a28', border: '1px solid #2a2a3a', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: '#8888aa', fontFamily: "'Space Mono', monospace" }}>
                                            {expr}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={goPrev} className="btn-ghost" style={{ padding: '10px 24px', fontSize: '15px' }}>
                                ← Anterior
                            </button>
                            <button onClick={() => setFlipped(f => !f)} className="btn-ghost" style={{ padding: '10px 20px', fontSize: '15px' }}>
                                {flipped ? '👀 Esconder' : '🔍 Revelar'}
                            </button>
                            <button onClick={goNext} className="btn-primary" style={{ padding: '10px 24px', fontSize: '15px' }}>
                                Próxima →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
