'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserState } from '@/hooks/useUserState';
import { getLevelByXp } from '@/data/constants';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

type DBUser = {
    id: string;
    name: string;
    email: string;
    profile: {
        xp: number;
        level: number;
        streak: number;
    }
};

export default function Navbar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { user } = useUserState();
    const [dbUser, setDbUser] = useState<DBUser | null>(null);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/me')
                .then(r => r.json())
                .then(data => setDbUser(data))
                .catch(e => console.error(e));
        } else {
            setDbUser(null);
        }
    }, [session]);

    const level = getLevelByXp(user.xp);

    const navLinks = [
        { href: '/home', label: 'Home', icon: '🎵' },
        { href: '/profile', label: 'Perfil', icon: '👤' },
        { href: '/flashcards', label: 'Flashcards', icon: '📚' },
    ];

    return (
        <nav style={{
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #2a2a3a',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    {/* Logo */}
                    <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <span style={{ fontSize: '28px' }}>🎶</span>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: '#e8ff47', letterSpacing: '2px' }}>
                            LyricFill
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    color: pathname === link.href ? '#e8ff47' : '#8888aa',
                                    background: pathname === link.href ? 'rgba(232, 255, 71, 0.08)' : 'transparent',
                                    border: pathname === link.href ? '1px solid rgba(232, 255, 71, 0.2)' : '1px solid transparent',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span>{link.icon}</span>
                                <span style={{ display: 'none' }} className="md:inline">{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User info / Auth */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {status === 'loading' ? (
                            <div style={{ width: '80px', height: '32px', background: '#1a1a28', borderRadius: '16px', animation: 'pulse 2s infinite' }} />
                        ) : session ? (
                            <>
                                {/* Logged IN State */}
                                {dbUser && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: '#12121a',
                                        border: '1px solid #2a2a3a',
                                        borderRadius: '10px',
                                        padding: '6px 12px',
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: level.color }} />
                                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', color: '#e8ff47', fontWeight: '700' }}>
                                            {dbUser.profile.xp.toLocaleString()} XP
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={() => signOut()}
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Logged OUT State */}
                                <Link href="/login" style={{ color: '#f0f0ff', fontSize: '14px', textDecoration: 'none', padding: '8px 12px' }}>
                                    Entrar
                                </Link>
                                <Link href="/register" style={{ background: '#e8ff47', color: '#0a0a0f', fontSize: '14px', fontWeight: '600', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                                    Criar Conta
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
