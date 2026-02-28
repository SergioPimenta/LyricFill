'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao criar conta');
            }

            // Immediately sign them in
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (!result?.error) {
                router.push('/home');
                router.refresh();
            } else {
                router.push('/login');
            }

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0ff' }}>
            <Navbar />
            <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 20px' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#e8ff47', textAlign: 'center', marginBottom: '8px' }}>
                    CRIAR CONTA
                </h1>
                <p style={{ textAlign: 'center', color: '#8888aa', marginBottom: '32px' }}>
                    Salve seu progresso e suba de nível.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8888aa', marginBottom: '8px', fontFamily: "'Space Mono', monospace" }}>
                            NOME
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: '100%', background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px', padding: '12px', color: '#f0f0ff', fontSize: '16px', outline: 'none' }}
                            placeholder="Seu nome"
                        />
                    </div>

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
                        {loading ? 'Criando...' : 'CRIAR CONTA'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '32px', color: '#8888aa', fontSize: '14px' }}>
                    Já tem uma conta?{' '}
                    <Link href="/login" style={{ color: '#e8ff47', textDecoration: 'none', fontWeight: 'bold' }}>
                        Faça Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
