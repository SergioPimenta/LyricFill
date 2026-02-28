'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSongById } from '@/data/songs';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useUserState } from '@/hooks/useUserState';
import { useLrcSync } from '@/hooks/useLrcSync';
import Navbar from '@/components/Navbar';
import YouTubePlayer from '@/components/YouTubePlayer';
import ScoreHUD from '@/components/ScoreHUD';
import BlankInput from '@/components/BlankInput';

export default function PlayPage() {
    const params = useParams();
    const router = useRouter();
    const songId = params.songId as string;
    const song = getSongById(songId);
    const { user } = useUserState();

    const [isFinished, setIsFinished] = useState(false);
    const lyricsRef = useRef<HTMLDivElement>(null);

    if (!song) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '64px' }}>🎵</div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#f0f0ff' }}>Música não encontrada</h2>
                <Link href="/home"><button className="btn-primary">← Voltar ao Catálogo</button></Link>
            </div>
        );
    }

    const lrcSync = useLrcSync(song);
    const engine = useGameEngine(song, lrcSync.timestamps);
    const {
        score, combo, maxCombo, currentTime, setCurrentTime, setIsPlaying,
        activeLineKey, allLines, justCorrect, justWrong, comboAnimation, setComboAnimation,
        playerRef, submitBlank, revealBlank, revealAll, getAccuracy, getBlankKey, getBlankState, getMultiplier,
    } = engine;

    const totalBlanks = engine.blanks.length;
    const answeredBlanks = engine.blanks.filter(b => b.isCorrect || b.isRevealed).length;

    // Scroll active lyric line into view
    useEffect(() => {
        if (lyricsRef.current) {
            const active = lyricsRef.current.querySelector('[data-active="true"]');
            if (active) {
                active.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeLineKey]);

    const handleFinish = () => {
        setIsFinished(true);
        const correctBlanks = engine.blanks.filter(b => b.isCorrect);
        const result = {
            songId: song.id,
            score,
            accuracy: getAccuracy(),
            blanksCorrect: correctBlanks.length,
            blanksTotal: totalBlanks,
            words: correctBlanks.map(b => b.word),
        };
        sessionStorage.setItem('lastResult', JSON.stringify(result));
        router.push(`/results/${songId}`);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
                {/* Song header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8888aa', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                        onMouseEnter={(e: React.MouseEvent) => ((e.currentTarget as HTMLElement).style.color = '#e8ff47')}
                        onMouseLeave={(e: React.MouseEvent) => ((e.currentTarget as HTMLElement).style.color = '#8888aa')}>
                        ← Catálogo
                    </Link>
                    <span style={{ color: '#4a4a6a' }}>›</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', color: '#f0f0ff', letterSpacing: '1px' }}>{song.title}</span>
                    <span style={{ color: '#4a4a6a' }}>—</span>
                    <span style={{ fontSize: '14px', color: '#8888aa' }}>{song.artist}</span>
                    <span style={{
                        marginLeft: '4px',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontFamily: "'Space Mono', monospace",
                        background: song.level === 'beginner' ? 'rgba(74,222,128,0.12)' : song.level === 'intermediate' ? 'rgba(167,139,250,0.12)' : 'rgba(232,255,71,0.12)',
                        color: song.level === 'beginner' ? '#4ade80' : song.level === 'intermediate' ? '#a78bfa' : '#e8ff47',
                        border: `1px solid ${song.level === 'beginner' ? '#4ade8040' : song.level === 'intermediate' ? '#a78bfa40' : '#e8ff4740'}`,
                        textTransform: 'capitalize' as const,
                    }}>
                        {song.level}
                    </span>
                </div>

                {/* Score HUD */}
                <div style={{ marginBottom: '20px', animation: 'slideUp 0.4s ease-out' }}>
                    <ScoreHUD
                        score={score}
                        combo={combo}
                        maxCombo={maxCombo}
                        totalBlanks={totalBlanks}
                        answeredBlanks={answeredBlanks}
                        currentTime={currentTime}
                        duration={song.duration}
                        comboAnimation={comboAnimation}
                    />
                </div>

                {/* Main layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' }}>
                    {/* Lyrics */}
                    <div style={{
                        background: '#12121a',
                        border: '1px solid #2a2a3a',
                        borderRadius: '20px',
                        padding: '28px',
                        maxHeight: '65vh',
                        overflowY: 'auto',
                        animation: 'fadeIn 0.5s ease-out',
                    }} ref={lyricsRef}>
                        {song.verses.map((verse, vIdx) => (
                            <div key={vIdx} style={{ marginBottom: '24px' }}>
                                {/* Verse label */}
                                <div style={{ fontSize: '11px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>
                                    {verse.label}
                                </div>
                                {verse.lines.map((line, lIdx) => {
                                    const lineKey = vIdx * 1000 + lIdx;
                                    const isActive = lineKey === activeLineKey;
                                    const isPast = allLines.findIndex(l => l.key === lineKey) < allLines.findIndex(l => l.key === activeLineKey);

                                    return (
                                        <div
                                            key={lIdx}
                                            data-active={isActive}
                                            style={{
                                                padding: '8px 14px 8px 12px',
                                                borderRadius: '8px',
                                                borderLeft: isActive ? '3px solid #e8ff47' : '3px solid transparent',
                                                background: isActive ? 'rgba(232, 255, 71, 0.04)' : 'transparent',
                                                marginBottom: '4px',
                                                transition: 'all 0.3s ease',
                                                fontSize: isActive ? '1.15rem' : '1rem',
                                                lineHeight: '2.2',
                                                color: isActive ? '#f0f0ff' : isPast ? 'rgba(136, 136, 170, 0.4)' : '#8888aa',
                                                fontFamily: "'DM Sans', sans-serif",
                                            }}
                                        >
                                            {renderLineWithBlanks(line, lineKey, isActive, engine)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        {/* Finish button */}
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a3a', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={revealAll} className="btn-ghost" style={{ fontSize: '13px', padding: '8px 16px' }}>
                                👁 Revelar Todas
                            </button>
                            <button
                                onClick={handleFinish}
                                className="btn-primary"
                                style={{ fontSize: '14px', padding: '8px 20px' }}
                            >
                                ✅ Concluir Música
                            </button>
                        </div>
                    </div>

                    {/* Player panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.5s ease-out' }}>
                        <YouTubePlayer
                            videoId={song.youtubeId}
                            playerRef={playerRef}
                            onTimeUpdate={(t) => setCurrentTime(t)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Seek controls */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    if (playerRef.current) {
                                        const t = playerRef.current.getCurrentTime();
                                        playerRef.current.seekTo(Math.max(0, t - 5), true);
                                    }
                                }}
                                className="btn-ghost"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '13px', padding: '8px' }}
                                title="Repetir últimos 5 segundos"
                            >
                                ↩ -5s
                            </button>
                            <button
                                onClick={() => {
                                    if (playerRef.current) {
                                        const t = playerRef.current.getCurrentTime();
                                        playerRef.current.seekTo(Math.max(0, t - 15), true);
                                    }
                                }}
                                className="btn-ghost"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '13px', padding: '8px' }}
                                title="Repetir trecho (15s)"
                            >
                                ↩ -15s
                            </button>
                        </div>

                        {/* LRCLIB Sync Status */}
                        <div style={{
                            background: 'rgba(136, 136, 170, 0.06)',
                            border: '1px solid #2a2a3a',
                            borderRadius: '12px',
                            padding: '14px 16px',
                        }}>
                            <div style={{ fontSize: '12px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                🎵 Sincronização
                            </div>

                            {lrcSync.status === 'loading' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8888aa', fontSize: '13px' }}>
                                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #8888aa', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                                    Buscando letra sincronizada...
                                </div>
                            )}

                            {lrcSync.status === 'synced' && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>✅</span>
                                        <div>
                                            <div style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>LRCLIB sincronizado</div>
                                            <div style={{ color: '#4a4a6a', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>{lrcSync.matchedCount} linhas mapeadas</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={lrcSync.reload}
                                        style={{ background: 'none', border: 'none', color: '#4a4a6a', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                                        title="Recarregar do LRCLIB"
                                    >
                                        ↺
                                    </button>
                                </div>
                            )}

                            {(lrcSync.status === 'unsynced' || lrcSync.status === 'error') && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '16px' }}>⚠️</span>
                                        <div>
                                            <div style={{ color: '#e8ff47', fontSize: '13px', fontWeight: 700 }}>
                                                {lrcSync.status === 'error' ? 'Erro ao buscar' : 'Sem letra sincronizada'}
                                            </div>
                                            <div style={{ color: '#4a4a6a', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>Usando timestamps manuais</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={lrcSync.reload}
                                        style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: '13px', cursor: 'pointer', padding: '4px' }}
                                        title="Tentar novamente"
                                    >
                                        ↺
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tips card */}
                        <div style={{
                            background: 'rgba(232, 255, 71, 0.04)',
                            border: '1px solid rgba(232, 255, 71, 0.12)',
                            borderRadius: '12px',
                            padding: '16px',
                        }}>
                            <div style={{ fontSize: '12px', color: '#e8ff47', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                💡 Dicas
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[
                                    ['Enter', 'Verificar resposta'],
                                    ['Combo ×2', '10+ acertos seguidos'],
                                    ['⚡ Bônus', 'Acerte antes da linha passar'],
                                ].map(([key, desc]) => (
                                    <li key={key} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                        <span style={{ background: '#1a1a28', border: '1px solid #2a2a3a', borderRadius: '4px', padding: '1px 6px', fontFamily: "'Space Mono', monospace", color: '#e8ff47', flexShrink: 0, fontSize: '11px' }}>
                                            {key}
                                        </span>
                                        <span style={{ color: '#8888aa' }}>{desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Stats */}
                        <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ fontSize: '12px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                                Estatísticas
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { label: 'Precisão', value: `${getAccuracy()}%` },
                                    { label: 'Multiplicador', value: `×${getMultiplier(combo).toFixed(1)}` },
                                    { label: 'Melhor combo', value: `${maxCombo}` },
                                ].map(stat => (
                                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#8888aa' }}>{stat.label}</span>
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#f0f0ff', fontWeight: '700' }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderLineWithBlanks(
    line: { text: string; blanks?: Array<{ word: string; index: number; hint: string; level: string }> },
    lineKey: number,
    isActive: boolean,
    engine: ReturnType<typeof useGameEngine>
) {
    const { submitBlank, revealBlank, getBlankKey, getBlankState } = engine;
    const words = line.text.split(' ');

    return (
        <span>
            {words.map((word, wordIdx) => {
                const blank = line.blanks?.find(b => b.index === wordIdx);
                if (!blank) {
                    return <span key={wordIdx}>{word} </span>;
                }

                const blankIdx = line.blanks!.indexOf(blank);
                const state = getBlankState(lineKey, blankIdx);
                const blankKey = getBlankKey(lineKey, blankIdx);
                const isJustCorrect = engine.justCorrect === blankKey;
                const isJustWrong = engine.justWrong === blankKey;

                return (
                    <span key={wordIdx}>
                        <BlankInput
                            word={blank.word}
                            hint={blank.hint}
                            isCorrect={state?.isCorrect || false}
                            isRevealed={state?.isRevealed || false}
                            isWrong={isJustWrong}
                            attempts={state?.attempts || 0}
                            onSubmit={(val) => submitBlank(lineKey, blankIdx, val, isActive)}
                            onReveal={() => revealBlank(lineKey, blankIdx)}
                            autoFocus={isActive && blankIdx === 0 && !state?.isCorrect && !state?.isRevealed}
                        />
                        {' '}
                    </span>
                );
            })}
        </span>
    );
}
