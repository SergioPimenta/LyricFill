import { getSongById, SONGS } from './data/songs';
import { fetchAndCacheLrc } from './lib/lrclib';
import { parseLrc } from './lib/parseLrc';
import { matchLrcToVerses } from './lib/matchLrcToVerses';

import fs from 'fs';

async function testSync() {
    const report: any = {};
    for (const song of SONGS) {
        if (song.id === 'let-her-go') continue; // We know this one works
        console.log(`\n--- Testing ${song.title} ---`);
        let songReport: any = { matched: 0, total: 0, unmatchedLines: [] };

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
                songReport.error = 'No synced lyrics found';
                report[song.title] = songReport;
                continue;
            }

            const parsed = parseLrc(syncedLyrics);
            const matched = matchLrcToVerses(parsed, song.verses);

            let totalLines = 0;
            for (const v of song.verses) totalLines += v.lines.length;

            songReport.matched = matched.size;
            songReport.total = totalLines;

            console.log(`Matched ${matched.size} / ${totalLines} lines.`);

            if (matched.size < totalLines) {
                for (let vIdx = 0; vIdx < song.verses.length; vIdx++) {
                    for (let lIdx = 0; lIdx < song.verses[vIdx].lines.length; lIdx++) {
                        const lineKey = vIdx * 1000 + lIdx;
                        if (!matched.has(lineKey)) {
                            songReport.unmatchedLines.push(song.verses[vIdx].lines[lIdx].text);
                        }
                    }
                }
            }
            report[song.title] = songReport;

        } catch (e: any) {
            console.error('Error fetching', e);
            songReport.error = e.message;
            report[song.title] = songReport;
        }
    }

    fs.writeFileSync('sync_report.json', JSON.stringify(report, null, 2));
    console.log('Report saved to sync_report.json');
}

testSync();
