'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const FEATURES = [
    {
        icon: '🎵',
        title: 'Músicas Reais',
        desc: 'Ouça hits reais no YouTube e preencha as lacunas enquanto a música toca.',
    },
    {
        icon: '🤖',
        title: 'IA Explicativa',
        desc: 'Claude AI gera explicações contextuais, exemplos e traduções para cada palavra.',
    },
    {
        icon: '🏆',
        title: 'Gamificado',
        desc: 'Ganhe XP, suba de nível, mantenha streaks e desbloqueie conquistas.',
    },
    {
        icon: '📚',
        title: 'Flashcards',
        desc: 'Revise as palavras aprendidas com flashcards 3D sempre que quiser.',
    },
    {
        icon: '⚡',
        title: 'Bônus de Velocidade',
        desc: 'Acerte antes da linha passar e ganhe pontos extras.',
    },
    {
        icon: '📊',
        title: 'Progresso Real',
        desc: 'Acompanhe sua evolução com gráficos, histórico e estatísticas detalhadas.',
    },
];

const STEPS = [
    { num: '01', title: 'Escolha uma música', desc: 'Filtre por nível (Beginner → Advanced) e gênero musical.' },
    { num: '02', title: 'Ouça e preencha', desc: 'A letra aparece sincronizada. Preencha as lacunas enquanto a música toca.' },
    { num: '03', title: 'Aprenda expressões', desc: 'Ao final, a IA explica cada palavra com contexto, exemplos e traduções.' },
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0ff' }}>
            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: scrolled ? 'rgba(10, 10, 15, 0.95)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid #2a2a3a' : '1px solid transparent',
                transition: 'all 0.3s ease',
                padding: '0 24px',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>🎶</span>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#e8ff47', letterSpacing: '2px' }}>LyricFill</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/home" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}>
                            Catálogo
                        </Link>
                        <Link href="/onboarding">
                            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
                                Começar Grátis
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '120px 24px 80px',
                background: 'radial-gradient(ellipse at top, #1a1a3a 0%, #0a0a0f 60%)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
                }}>
                    {['🎸', '🎤', '🎹', '🎺', '🥁', '🎻'].map((icon, i) => (
                        <span key={i} style={{
                            position: 'absolute',
                            fontSize: `${24 + i * 8}px`,
                            opacity: 0.04,
                            top: `${10 + i * 15}%`,
                            left: `${(i % 3) * 30 + 5}%`,
                            animation: `float ${3 + i}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`,
                        }}>
                            {icon}
                        </span>
                    ))}
                </div>

                {/* Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(232, 255, 71, 0.08)',
                    border: '1px solid rgba(232, 255, 71, 0.2)',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    marginBottom: '32px',
                    animation: mounted ? 'fadeIn 0.6s ease-out' : 'none',
                }}>
                    <span>✨</span>
                    <span style={{ fontSize: '13px', color: '#e8ff47', fontWeight: '600', letterSpacing: '0.5px' }}>
                        Inglês através de músicas reais
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 'clamp(52px, 10vw, 100px)',
                    letterSpacing: '4px',
                    lineHeight: '0.95',
                    marginBottom: '16px',
                    animation: mounted ? 'slideUp 0.7s ease-out' : 'none',
                }}>
                    APRENDA INGLÊS<br />
                    <span style={{ color: '#e8ff47', animation: 'glow 2s ease-in-out infinite alternate' }}>
                        CANTANDO
                    </span>
                </h1>

                <p style={{
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    color: '#8888aa',
                    maxWidth: '560px',
                    lineHeight: '1.6',
                    marginBottom: '40px',
                    animation: mounted ? 'slideUp 0.8s ease-out' : 'none',
                }}>
                    Ouça músicas reais no YouTube, preencha as lacunas e aprenda expressões com explicações por IA. Gamificado, interativo e viciante.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', animation: mounted ? 'slideUp 0.9s ease-out' : 'none', marginBottom: '60px' }}>
                    <Link href="/onboarding">
                        <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
                            🚀 Começar Grátis
                        </button>
                    </Link>
                    <Link href="/home">
                        <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: '16px' }}>
                            Ver Catálogo
                        </button>
                    </Link>
                </div>

                {/* Preview card */}
                <div style={{
                    background: '#12121a',
                    border: '1px solid #2a2a3a',
                    borderRadius: '20px',
                    padding: '24px',
                    maxWidth: '520px',
                    width: '100%',
                    textAlign: 'left',
                    animation: mounted ? 'slideUp 1s ease-out' : 'none',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#1a2a3a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🎵
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Let Her Go — Passenger</div>
                            <div style={{ fontSize: '12px', color: '#4ade80' }}>● Beginner</div>
                        </div>
                        <div style={{ marginLeft: 'auto', background: 'rgba(232, 255, 71, 0.1)', border: '1px solid rgba(232, 255, 71, 0.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '13px', color: '#e8ff47', fontFamily: "'Space Mono', monospace" }}>
                            150 pts
                        </div>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', lineHeight: '2.2', color: '#8888aa' }}>
                        Well you only need the{' '}
                        <span style={{ background: 'rgba(232, 255, 71, 0.1)', border: '1.5px solid rgba(232, 255, 71, 0.4)', borderRadius: '6px', padding: '2px 10px', color: '#e8ff47', fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '13px' }}>
                            l____
                        </span>
                        {' '}when it's burning low
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', lineHeight: '2.2', color: '#b0b0cc', background: 'rgba(232, 255, 71, 0.03)', borderLeft: '3px solid #e8ff47', paddingLeft: '12px', borderRadius: '4px', marginTop: '4px' }}>
                        Only miss the sun when it starts to{' '}
                        <span style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1.5px solid #4ade80', borderRadius: '6px', padding: '2px 10px', color: '#4ade80', fontFamily: "'Space Mono', monospace", fontWeight: '700', fontSize: '13px' }}>
                            snow ✓
                        </span>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '3px', textAlign: 'center', marginBottom: '16px' }}>
                    POR QUE O <span style={{ color: '#e8ff47' }}>LYRICFILL</span>?
                </h2>
                <p style={{ textAlign: 'center', color: '#8888aa', fontSize: '16px', marginBottom: '56px' }}>
                    A forma mais natural de aprender inglês: através da música.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{
                            background: '#12121a',
                            border: '1px solid #2a2a3a',
                            borderRadius: '16px',
                            padding: '24px',
                            transition: 'all 0.25s ease',
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(232, 255, 71, 0.3)';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(232, 255, 71, 0.06)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a3a';
                                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                            }}>
                            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>{f.icon}</span>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#f0f0ff' }}>{f.title}</h3>
                            <p style={{ fontSize: '14px', color: '#8888aa', lineHeight: '1.6' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: '80px 24px', background: '#12121a', borderTop: '1px solid #2a2a3a', borderBottom: '1px solid #2a2a3a' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '3px', marginBottom: '56px' }}>
                        COMO <span style={{ color: '#e8ff47' }}>FUNCIONA</span>
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px', textAlign: 'left' }}>
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '56px', color: 'rgba(232, 255, 71, 0.15)', lineHeight: 1 }}>
                                    {s.num}
                                </span>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f0f0ff' }}>{s.title}</h3>
                                <p style={{ fontSize: '14px', color: '#8888aa', lineHeight: '1.6' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '100px 24px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: '3px', marginBottom: '20px' }}>
                    PRONTO PARA <span style={{ color: '#e8ff47' }}>COMEÇAR</span>?
                </h2>
                <p style={{ color: '#8888aa', fontSize: '16px', marginBottom: '36px' }}>
                    Faça o teste de nível e comece sua jornada musical.
                </p>
                <Link href="/onboarding">
                    <button className="btn-primary" style={{ padding: '16px 48px', fontSize: '18px' }}>
                        🎵 Começar Agora
                    </button>
                </Link>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #2a2a3a', padding: '24px', textAlign: 'center' }}>
                <p style={{ color: '#4a4a6a', fontSize: '13px' }}>
                    🎶 LyricFill — Aprenda inglês através da música • 2024
                </p>
            </footer>
        </div>
    );
}
