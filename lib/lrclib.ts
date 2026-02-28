const CACHE_KEY_PREFIX = 'lrclib_v1_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface LrcCacheEntry {
    syncedLyrics: string | null;
    plainLyrics: string | null;
    source: 'lrclib' | 'error';
    fetchedAt: number;
}

function getCacheKey(songId: string): string {
    return CACHE_KEY_PREFIX + songId;
}

function readCache(songId: string): LrcCacheEntry | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(getCacheKey(songId));
        if (!raw) return null;
        const entry: LrcCacheEntry = JSON.parse(raw);
        if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null; // expired
        return entry;
    } catch {
        return null;
    }
}

function writeCache(songId: string, entry: LrcCacheEntry): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(getCacheKey(songId), JSON.stringify(entry));
    } catch {
        // localStorage might be full โ€" ignore silently
    }
}

export function clearLrcCache(songId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getCacheKey(songId));
}

/**
 * Fetches synced (LRC) and plain lyrics from LRCLIB for a song.
 * Results are cached in localStorage for 30 days to avoid repeated fetches.
 *
 * API docs: https://lrclib.net/docs
 */
export async function fetchAndCacheLrc(
    songId: string,
    title: string,
    artist: string,
): Promise<LrcCacheEntry> {
    // 1. Serve from cache if fresh
    const cached = readCache(songId);
    if (cached) return cached;

    // 2. Fetch from LRCLIB
    try {
        const params = new URLSearchParams({
            track_name: title,
            artist_name: artist,
        });
        const res = await fetch(`https://lrclib.net/api/search?${params.toString()}`);

        if (!res.ok) throw new Error(`LRCLIB responded with HTTP ${res.status}`);

        const results: Array<{
            syncedLyrics?: string | null;
            plainLyrics?: string | null;
        }> = await res.json();

        // Prefer first result that has syncedLyrics; fall back to any plainLyrics
        let syncedLyrics: string | null = null;
        let plainLyrics: string | null = null;

        for (const r of results) {
            if (r.syncedLyrics) {
                syncedLyrics = r.syncedLyrics;
                plainLyrics = r.plainLyrics ?? null;
                break;
            }
        }
        if (!syncedLyrics && results.length > 0) {
            plainLyrics = results[0].plainLyrics ?? null;
        }

        const entry: LrcCacheEntry = {
            syncedLyrics,
            plainLyrics,
            source: 'lrclib',
            fetchedAt: Date.now(),
        };

        writeCache(songId, entry);
        return entry;
    } catch (err) {
        console.error('[LRCLIB] Fetch failed:', err);
        const fallback: LrcCacheEntry = {
            syncedLyrics: null,
            plainLyrics: null,
            source: 'error',
            fetchedAt: Date.now(),
        };
        // Do NOT cache errors โ€" allow retry on next page load
        return fallback;
    }
}
