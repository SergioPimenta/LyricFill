'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SONGS, getDailyChallenge } from '@/data/songs';
import { useUserState } from '@/hooks/useUserState';
import Navbar from '@/components/Navbar';
import SongCard from '@/components/SongCard';

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const GENRES = ['all', 'pop', 'rock', 'rnb', 'indie', 'country', 'electronic'];

const LEVEL_LABELS: Record<string, string> = {
    all: 'Todos', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
};
const GENRE_LABELS: Record<string, string> = {
    all: 'Todos', pop: 'Pop', rock: 'Rock', rnb: 'R&B', indie: 'Indie', country: 'Country', electronic: 'Eletrônico',
};

export default function HomePage() {
    const router = useRouter();
    const { user, toggleFavorite } = useUserState();
    const [levelFilter, setLevelFilter] = useState('all');
    const [genreFilter, setGenreFilter] = useState('all');
    const [search, setSearch] = useState('');

    const dailyChallenge = getDailyChallenge();

    const filtered = useMemo(() => {
        let songs = SONGS;
        if (levelFilter !== 'all') songs = songs.filter(s => s.level === levelFilter);
        if (genreFilter !== 'all') songs = songs.filter(s => s.genre === genreFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            songs = songs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
        }
        return songs;
    }, [levelFilter, genreFilter, search]);

    const getPlayCount = (songId: string) =>
        user.history.filter(h => h.songId === songId).length;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px', animation: 'slideUp 0.4s ease-out' }}>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 6vw, 52px)', letterSpacing: '3px', color: '#f0f0ff', marginBottom: '6px' }}>
                        {user.onboardingComplete ? `OLÁ, ${user.name.toUpperCase()}!` : 'CATÁLOGO DE MÚSICAS'}
                    </h1>
                    <p style={{ color: '#8888aa', fontSize: '15px' }}>
                        Escolha uma música e comece a aprender inglês agora.
                    </p>
                </div>

                {/* Daily Challenge Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #1a2a0a 0%, #0f1a08 100%)',
                    border: '1px solid rgba(232, 255, 71, 0.2)',
                    borderRadius: '20px',
                    padding: '24px 28px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    flexWrap: 'wrap',
                    animation: 'slideUp 0.5s ease-out',
                    cursor: 'pointer',
                }}
                    onClick={() => router.push(`/play/${dailyChallenge.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '40px', animation: 'float 3s ease-in-out infinite' }}>🏆</div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#e8ff47', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                                ⚡ Desafio do Dia
                            </div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '1.5px', color: '#f0f0ff' }}>
                                {dailyChallenge.title}
                            </div>
                            <div style={{ fontSize: '13px', color: '#8888aa' }}>{dailyChallenge.artist}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#8888aa', fontFamily: "'Space Mono', monospace" }}>Bônus</div>
                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: '#e8ff47', letterSpacing: '2px' }}>
                                +50 XP
                            </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={e => e.stopPropagation()}>
                            <Link href={`/play/${dailyChallenge.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                Jogar →
                            </Link>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="🔍  Buscar música ou artista..."
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            background: '#12121a',
                            border: '1px solid #2a2a3a',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            color: '#f0f0ff',
                            fontSize: '14px',
                            outline: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#e8ff47')}
                        onBlur={e => (e.target.style.borderColor = '#2a2a3a')}
                    />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                        NÍVEL:
                    </span>
                    {LEVELS.map(l => (
                        <button
                            key={l}
                            onClick={() => setLevelFilter(l)}
                            className={`btn-ghost${levelFilter === l ? ' active' : ''}`}
                            style={{ padding: '6px 14px', fontSize: '13px' }}
                        >
                            {LEVEL_LABELS[l]}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
                    <span style={{ fontSize: '12px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                        GÊNERO:
                    </span>
                    {GENRES.map(g => (
                        <button
                            key={g}
                            onClick={() => setGenreFilter(g)}
                            className={`btn-ghost${genreFilter === g ? ' active' : ''}`}
                            style={{ padding: '6px 14px', fontSize: '13px' }}
                        >
                            {GENRE_LABELS[g]}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <div style={{ fontSize: '13px', color: '#4a4a6a', fontFamily: "'Space Mono', monospace", marginBottom: '16px' }}>
                    {filtered.length} música{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                </div>

                {/* Song grid */}
                {filtered.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '20px',
                    }}>
                        {filtered.map((song, i) => (
                            <div key={song.id} style={{ animation: `slideUp 0.4s ease-out ${i * 0.05}s both` }}>
                                <SongCard
                                    song={song}
                                    isFavorite={user.favorites.includes(song.id)}
                                    onFavorite={toggleFavorite}
                                    playCount={getPlayCount(song.id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#4a4a6a' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
                        <p style={{ fontSize: '16px' }}>Nenhuma música encontrada com esses filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
