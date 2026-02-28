'use client';

import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
    videoId: string;
    onTimeUpdate?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onReady?: (player: YT.Player) => void;
    playerRef?: React.MutableRefObject<YT.Player | null>;
}

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubePlayer({
    videoId,
    onTimeUpdate,
    onPlay,
    onPause,
    onReady,
    playerRef,
}: YouTubePlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalPlayerRef = useRef<YT.Player | null>(null);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const cancelSync = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };

        const startSync = () => {
            cancelSync();
            const loop = () => {
                if (internalPlayerRef.current && onTimeUpdate) {
                    const ct = internalPlayerRef.current.getCurrentTime();
                    if (typeof ct === 'number') onTimeUpdate(ct);
                }
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        };

        const initPlayer = () => {
            if (!containerRef.current) return;

            const player = new window.YT.Player(containerRef.current, {
                videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    iv_load_policy: 3,
                    cc_load_policy: 0,
                },
                events: {
                    onReady: (e: YT.PlayerEvent) => {
                        internalPlayerRef.current = e.target;
                        if (playerRef) playerRef.current = e.target;
                        if (onReady) onReady(e.target);
                    },
                    onStateChange: (e: YT.OnStateChangeEvent) => {
                        if (e.data === window.YT.PlayerState.PLAYING) {
                            if (onPlay) onPlay();
                            // Immediately sync highlight on play/seek, then start RAF loop
                            if (internalPlayerRef.current && onTimeUpdate) {
                                const ct = internalPlayerRef.current.getCurrentTime();
                                if (typeof ct === 'number') onTimeUpdate(ct);
                            }
                            startSync();
                        } else {
                            if (onPause) onPause();
                            cancelSync();
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            // Load the API script
            const existing = document.getElementById('youtube-iframe-api');
            if (!existing) {
                const script = document.createElement('script');
                script.id = 'youtube-iframe-api';
                script.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(script);
            }
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            cancelSync();
            if (internalPlayerRef.current) {
                try { internalPlayerRef.current.destroy(); } catch { }
                internalPlayerRef.current = null;
            }
        };
    }, [videoId]);

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #2a2a3a',
            background: '#12121a',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <div
                    ref={containerRef}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
}
