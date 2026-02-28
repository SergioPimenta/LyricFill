'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (result?.error) {
            setError('Credenciais inválidas. Tente novamente.');
            setLoading(false);
        } else {
            router.push('/home');
            router.refresh();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0ff' }}>
            <Navbar />
            <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#e8ff47', textAlign: 'center', marginBottom: '8px' }}>
                    BEM-VINDO DE VOLTA
                </h1>
                <p style={{ textAlign: 'center', color: '#8888aa', marginBottom: '32px' }}>
                    Faça login para continuar seu progresso.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8888aa', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                            EMAIL
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '12px', color: '#f0f0ff', fontSize: '16px', outline: 'none' }}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8888aa', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                            SENHA
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '12px', color: '#f0f0ff', fontSize: '16px', outline: 'none' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '16px', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Entrando...' : 'ENTRAR'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', color: '#8888aa', fontSize: '14px' }}>
                    Não tem uma conta?{' '}
                    <Link href="/register" style={{ color: '#e8ff47', textDecoration: 'none', fontWeight: 'bold' }}>
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
