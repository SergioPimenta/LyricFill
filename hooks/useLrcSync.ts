'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/types';
import { fetchAndCacheLrc } from '@/lib/lrclib';
import { clearLrcCache } from '@/lib/lrclib';
import { parseLrc } from '@/lib/parseLrc';
import { matchLrcToVerses } from '@/lib/matchLrcToVerses';

export type LrcSyncStatus = 'loading' | 'synced' | 'unsynced' | 'error';

export interface LrcSyncResult {
    /** Current sync status */
    status: LrcSyncStatus;
    /**
     * Map from lineKey (vIdx * 1000 + lIdx) to the LRCLIB-sourced timestamp (seconds).
     * Empty when status is 'loading', 'unsynced', or 'error'.
     */
    timestamps: Map<number, number>;
    /**
     * How many lines were successfully matched.
     * Useful for showing partial-sync warnings.
     */
    matchedCount: number;
    /** Force a re-fetch by clearing the localStorage cache. */
    reload: () => void;
}

export function useLrcSync(song: Song): LrcSyncResult {
    const [status, setStatus] = useState<LrcSyncStatus>('loading');
    const [timestamps, setTimestamps] = useState<Map<number, number>>(new Map());
    const [matchedCount, setMatchedCount] = useState(0);
    // incrementing this triggers a re-fetch
    const [fetchKey, setFetchKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setStatus('loading');
        setTimestamps(new Map());
        setMatchedCount(0);

        fetchAndCacheLrc(song.id, song.title, song.artist).then((data) => {
            if (cancelled) return;

            if (data.syncedLyrics) {
                const parsed = parseLrc(data.syncedLyrics);
                const matched = matchLrcToVerses(parsed, song.verses);
                setTimestamps(matched);
                setMatchedCount(matched.size);
                setStatus(matched.size > 0 ? 'synced' : 'unsynced');
            } else {
                setTimestamps(new Map());
                setMatchedCount(0);
                setStatus(data.source === 'error' ? 'error' : 'unsynced');
            }
        });

        return () => {
            cancelled = true;
        };
    }, [song.id, fetchKey]);

    const reload = () => {
        clearLrcCache(song.id);
        setFetchKey((k) => k + 1);
    };

    return { status, timestamps, matchedCount, reload };
}
