import { getSongById, SONGS } from './data/songs';
import { fetchAndCacheLrc } from './lib/lrclib';
import { parseLrc } from './lib/parseLrc';
import { matchLrcToVerses } from './lib/matchLrcToVerses';

async function testSync() {
    for (const song of SONGS) {
        if (song.id === 'let-her-go') continue; // We know this one works
        console.log(`\n--- Testing ${song.title} ---`);

        try {
            const params = new URLSearchParams({
                track_name: song.title,
                artist_name: song.artist,
            });
            const res = await fetch(`https://lrclib.net/api/search?${params.toString()}`);
            const results = await res.json();

            let syncedLyrics = null;
            for (const r of results) {
                if (r.syncedLyrics) {
                    syncedLyrics = r.syncedLyrics;
                    break;
                }
            }

            if (!syncedLyrics) {
                console.log(`Failed: No synced lyrics found for ${song.title}`);
                continue;
            }

            const parsed = parseLrc(syncedLyrics);
            const matched = matchLrcToVerses(parsed, song.verses);

            let totalLines = 0;
            for (const v of song.verses) totalLines += v.lines.length;

            console.log(`Matched ${matched.size} / ${totalLines} lines.`);

            // Print out the unmatched lines to see why they failed
            if (matched.size < totalLines) {
                for (let vIdx = 0; vIdx < song.verses.length; vIdx++) {
                    for (let lIdx = 0; lIdx < song.verses[vIdx].lines.length; lIdx++) {
                        const lineKey = vIdx * 1000 + lIdx;
                        if (!matched.has(lineKey)) {
                            console.log(`  [UNMATCHED] ${song.verses[vIdx].lines[lIdx].text}`);
                        }
                    }
                }
            }

        } catch (e) {
            console.error('Error fetching', e);
        }
    }
}

testSync();
