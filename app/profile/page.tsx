'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserState } from '@/hooks/useUserState';
import { getLevelByXp, getLevelProgress, ALL_ACHIEVEMENTS, USER_LEVELS } from '@/data/constants';
import Navbar from '@/components/Navbar';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ProfilePage() {
    const { user, resetUser } = useUserState();
    const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'achievements'>('stats');

    const level = getLevelByXp(user.xp);
    const progress = getLevelProgress(user.xp);
    const nextLevel = USER_LEVELS[USER_LEVELS.findIndex(l => l.key === level.key) + 1];

    const maxActivity = Math.max(...user.weeklyActivity, 1);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
                {/* Profile header */}
                <div style={{
                    background: 'linear-gradient(135deg, #12121a, #1a1a28)',
                    border: '1px solid #2a2a3a',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '24px',
                    animation: 'fadeIn 0.5s ease-out',
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '72px', height: '72px',
                            background: `linear-gradient(135deg, ${level.color}22, ${level.color}44)`,
                            border: `2px solid ${level.color}`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            flexShrink: 0,
                        }}>
                            🎵
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '2px', color: '#f0f0ff', marginBottom: '4px' }}>
                                {user.name || 'Learner'}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <span style={{ color: level.color, fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: '700' }}>
                                    {level.label}
                                </span>
                                {user.streak > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#fbbf24' }}>
                                        🔥 {user.streak} dias seguidos
                                    </span>
                                )}
                            </div>

                            {/* XP Progress */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#8888aa', fontFamily: "'Space Mono', monospace" }}>
                                        {user.xp} XP
                                    </span>
                                    {nextLevel && (
                                        <span style={{ fontSize: '12px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace" }}>
                                            {nextLevel.minXp - user.xp} XP para {nextLevel.label}
                                        </span>
                                    )}
                                </div>
                                <div style={{ height: '8px', background: '#2a2a3a', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progress}%`,
                                        background: `linear-gradient(90deg, ${level.color}88, ${level.color})`,
                                        borderRadius: '4px',
                                        transition: 'width 0.8s ease',
                                    }} />
                                </div>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', minWidth: '200px' }}>
                            {[
                                { label: 'Músicas', value: user.songsCompleted.length, icon: '🎵' },
                                { label: 'Palavras', value: user.learnedWords.length, icon: '📚' },
                                { label: 'XP Total', value: user.xp.toLocaleString(), icon: '⭐' },
                                { label: 'Conquistas', value: user.achievements.length, icon: '🏆' },
                            ].map(stat => (
                                <div key={stat.label} style={{ background: '#0a0a0f', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{stat.icon}</div>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', color: '#e8ff47', letterSpacing: '1px' }}>{stat.value}</div>
                                    <div style={{ fontSize: '10px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly activity */}
                <div style={{
                    background: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                }}>
                    <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px', color: '#f0f0ff', marginBottom: '16px' }}>
                        ATIVIDADE <span style={{ color: '#e8ff47' }}>SEMANAL</span>
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                        {user.weeklyActivity.map((xp, i) => {
                            const today = new Date().getDay();
                            const isToday = i === today;
                            const height = maxActivity > 0 ? Math.max(4, (xp / maxActivity) * 70) : 4;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${height}px`,
                                        background: xp > 0
                                            ? isToday ? '#e8ff47' : `linear-gradient(180deg, #e8ff4788, #b8cc1a88)`
                                            : '#2a2a3a',
                                        borderRadius: '3px',
                                        transition: 'height 0.5s ease',
                                    }} />
                                    <span style={{
                                        fontSize: '10px',
                                        fontFamily: "'Space Mono', monospace",
                                        color: isToday ? '#e8ff47' : '#4a4a6a',
                                    }}>
                                        {DAYS[i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {(['stats', 'history', 'achievements'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn-ghost${activeTab === tab ? ' active' : ''}`}
                            style={{ fontSize: '13px', padding: '8px 18px' }}
                        >
                            {tab === 'stats' ? '📊 Estatísticas' : tab === 'history' ? '🕐 Histórico' : '🏆 Conquistas'}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'stats' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                        {[
                            { label: 'Músicas completadas', value: user.songsCompleted.length, icon: '🎵', color: '#4ade80' },
                            { label: 'Palavras aprendidas', value: user.learnedWords.length, icon: '📖', color: '#60a5fa' },
                            { label: 'XP total ganho', value: user.xp.toLocaleString(), icon: '⭐', color: '#e8ff47' },
                            { label: 'Sequência atual', value: `${user.streak} dias`, icon: '🔥', color: '#fbbf24' },
                            { label: 'Sessões jogadas', value: user.history.length, icon: '🎮', color: '#a78bfa' },
                            { label: 'Conquistas', value: `${user.achievements.length}/${ALL_ACHIEVEMENTS.length}`, icon: '🏆', color: '#f87171' },
                        ].map((item) => (
                            <div key={item.label} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '44px', height: '44px', background: `${item.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: item.color, letterSpacing: '1px' }}>{item.value}</div>
                                    <div style={{ fontSize: '12px', color: '#8888aa' }}>{item.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        {user.history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#4a4a6a' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
                                <p>Você ainda não jogou nenhuma música.</p>
                                <Link href="/home">
                                    <button className="btn-primary" style={{ marginTop: '16px' }}>Explorar Catálogo</button>
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {user.history.map((session, i) => (
                                    <div key={i} style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#f0f0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.songTitle}</div>
                                            <div style={{ fontSize: '12px', color: '#8888aa' }}>{session.songArtist} • {new Date(session.playedAt).toLocaleDateString('pt-BR')}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', color: '#e8ff47', fontWeight: '700' }}>{session.score} pts</div>
                                            <div style={{ fontSize: '11px', color: '#8888aa' }}>{session.accuracy}% precisão</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', animation: 'fadeIn 0.3s ease-out' }}>
                        {ALL_ACHIEVEMENTS.map(ach => {
                            const unlocked = user.achievements.find(a => a.key === ach.key);
                            return (
                                <div key={ach.key} style={{
                                    background: unlocked ? 'linear-gradient(135deg, #1a2a10, #12121a)' : '#12121a',
                                    border: `1px solid ${unlocked ? 'rgba(232, 255, 71, 0.2)' : '#2a2a3a'}`,
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: unlocked ? 1 : 0.5,
                                    filter: unlocked ? 'none' : 'grayscale(1)',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <span style={{ fontSize: '28px' }}>{ach.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: unlocked ? '#f0f0ff' : '#8888aa' }}>{ach.title}</div>
                                        <div style={{ fontSize: '11px', color: '#4a4a6a', lineHeight: '1.4' }}>{ach.description}</div>
                                        {unlocked && (
                                            <div style={{ fontSize: '10px', color: '#e8ff47', fontFamily: "'Space Mono', monospace", marginTop: '2px' }}>
                                                ✓ Desbloqueado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reset button */}
                <div style={{ marginTop: '32px', borderTop: '1px solid #2a2a3a', paddingTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => { if (confirm('Tem certeza? Todo o progresso será perdido.')) resetUser(); }}
                        style={{ background: 'transparent', border: '1px solid #2a2a3a', color: '#4a4a6a', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#f87171')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a3a')}
                    >
                        🗑 Resetar Progresso
                    </button>
                </div>
            </div>
        </div>
    );
}
