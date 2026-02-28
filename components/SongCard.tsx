'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Song } from '@/types';

interface SongCardProps {
    song: Song;
    isFavorite?: boolean;
    onFavorite?: (id: string) => void;
    playCount?: number;
}

const LEVEL_COLORS: Record<string, string> = {
    beginner: '#4ade80',
    intermediate: '#a78bfa',
    advanced: '#e8ff47',
};

const GENRE_LABELS: Record<string, string> = {
    pop: 'Pop',
    rock: 'Rock',
    rnb: 'R&B',
    country: 'Country',
    indie: 'Indie',
    electronic: 'Electronic',
};

export default function SongCard({ song, isFavorite, onFavorite, playCount = 0 }: SongCardProps) {
    const blanksCount = song.verses.reduce((acc, v) =>
        acc + v.lines.reduce((a, l) => a + (l.blanks?.length || 0), 0), 0
    );

    return (
        <div style={{
            background: '#12121a',
            border: '1px solid #2a2a3a',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.25s ease',
            position: 'relative',
            cursor: 'pointer',
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#e8ff47';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(232, 255, 71, 0.1)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a3a';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '56.25%', background: song.coverColor || '#1a1a28', overflow: 'hidden' }}>
                <img
                    src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                    alt={`${song.title} by ${song.artist}`}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Overlay gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 50%)' }} />

                {/* Favorite button */}
                {onFavorite && (
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(song.id); }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(10, 10, 15, 0.7)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '16px',
                            lineHeight: 1,
                        }}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>
                )}

                {/* Level badge */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: `rgba(10, 10, 15, 0.8)`,
                    border: `1px solid ${LEVEL_COLORS[song.level]}40`,
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: '700',
                    color: LEVEL_COLORS[song.level],
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    {song.level}
                </div>

                {/* Play overlay */}
                <Link href={`/play/${song.id}`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(232, 255, 71, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                    }}
                        className="play-btn"
                    >
                        <span style={{ fontSize: '18px', marginLeft: '3px' }}>▶</span>
                    </div>
                </Link>
            </div>

            {/* Content */}
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: '18px',
                            letterSpacing: '1px',
                            color: '#f0f0ff',
                            lineHeight: '1.2',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {song.title}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#8888aa', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {song.artist}
                        </p>
                    </div>
                    <span style={{
                        background: '#1a1a28',
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        color: '#8888aa',
                        fontFamily: "'Space Mono', monospace",
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}>
                        {GENRE_LABELS[song.genre]}
                    </span>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #2a2a3a' }}>
                    <span style={{ fontSize: '12px', color: '#8888aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⏱️ ~{song.estimatedMinutes}min
                    </span>
                    <span style={{ fontSize: '12px', color: '#8888aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📝 {blanksCount} lacunas
                    </span>
                    {playCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#8888aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ▶ {playCount}x
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
