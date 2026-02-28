const https = require('https');
const fs = require('fs');

const SONGS_META = [
    { id: 'let-her-go', title: 'Let Her Go', artist: 'Passenger', youtubeId: 'RBumgq5yVrA', genre: 'indie', level: 'beginner', duration: 252, estimatedMinutes: 5, coverColor: '#1a2a3a' },
    { id: 'shape-of-you', title: 'Shape of You', artist: 'Ed Sheeran', youtubeId: '_dK2tDK9grQ', genre: 'pop', level: 'intermediate', duration: 234, estimatedMinutes: 5, coverColor: '#2a1a3a' },
    { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', youtubeId: 'fHI8X4OXluQ', genre: 'pop', level: 'advanced', duration: 200, estimatedMinutes: 4, coverColor: '#3a1010' },
    { id: 'someone-like-you', title: 'Someone Like You', artist: 'Adele', youtubeId: 'hLQl3WQQoQ0', genre: 'pop', level: 'beginner', duration: 285, estimatedMinutes: 5, coverColor: '#1a1a2a' },
    { id: 'hotel-california', title: 'Hotel California', artist: 'Eagles', youtubeId: 'BciS5krYL80', genre: 'rock', level: 'advanced', duration: 391, estimatedMinutes: 7, coverColor: '#2a1a0a' }
];

function fetchLrc(title, artist) {
    return new Promise((resolve, reject) => {
        const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
        https.get(url, { headers: { 'User-Agent': 'LyricFill/1.0.0' } }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    const lrc = results.find(r => r.syncedLyrics);
                    resolve(lrc ? lrc.syncedLyrics : null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

function parseLrc(lrc) {
    const lines = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    let match;
    while ((match = regex.exec(lrc)) !== null) {
        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const cent = parseInt(match[3].padEnd(3, '0')) / 1000;
        const text = match[4].trim();
        if (text) {
            lines.push({ time: Math.round(min * 60 + sec + cent), text });
        }
    }
    return lines;
}

const COMMON_WORDS = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']);

function cleanWord(w) {
    return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function generateBlanks(text, level) {
    const words = text.split(' ');
    // Try to pick 1 reasonable word per line
    const candidates = [];
    words.forEach((w, idx) => {
        const cleaned = cleanWord(w);
        if (cleaned.length > 3 && !COMMON_WORDS.has(cleaned)) {
            candidates.push({ original: w, cleaned, index: idx });
        }
    });

    // Fallback if no valid non-common word > 3 letters
    if (candidates.length === 0) {
        words.forEach((w, idx) => {
            const cleaned = cleanWord(w);
            if (cleaned.length > 2) candidates.push({ original: w, cleaned, index: idx });
        });
    }

    if (candidates.length === 0) return [];

    // Pick the longest word or randomly
    candidates.sort((a, b) => b.cleaned.length - a.cleaned.length);
    const chosen = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];

    if (!chosen) return [];

    const hint = chosen.cleaned[0] + '_'.repeat(chosen.cleaned.length - 1);

    return [{
        word: chosen.cleaned,
        index: chosen.index,
        hint,
        level: level
    }];
}

async function main() {
    const finalSongs = [];

    for (const meta of SONGS_META) {
        console.log(`Generating ${meta.title}...`);
        const lrc = await fetchLrc(meta.title, meta.artist);
        if (!lrc) {
            console.error(`ERROR: No LRC for ${meta.title}`);
            continue;
        }

        const parsed = parseLrc(lrc);
        const verses = [];
        let currentVerse = { label: 'Verse 1', lines: [] };
        let verseCount = 1;

        // Group every 4-6 lines, break on large time gaps
        for (let i = 0; i < parsed.length; i++) {
            const line = parsed[i];
            const prevLine = i > 0 ? parsed[i - 1] : null;

            // If gap > 10 seconds or stanza has 6 lines, break
            if (currentVerse.lines.length > 0 &&
                (currentVerse.lines.length >= 6 || (prevLine && (line.time - prevLine.time) >= 10))) {
                verses.push(currentVerse);
                verseCount++;
                currentVerse = { label: `Section ${verseCount}`, lines: [] };
            }

            // Max 1 blank per line, but let's only do blanks on 60% of lines so it's not too crowded
            const blanks = Math.random() > 0.4 ? generateBlanks(line.text, meta.level) : [];

            currentVerse.lines.push({
                timestamp: line.time,
                text: line.text,
                blanks
            });
        }
        if (currentVerse.lines.length > 0) verses.push(currentVerse);

        finalSongs.push({ ...meta, verses });
    }

    const output = `// Auto-generated full lyrics from LRCLIB
import { Song } from '@/types';

export const SONGS: Song[] = ${JSON.stringify(finalSongs, null, 4)};

export function getSongById(id: string): Song | undefined {
    return SONGS.find(s => s.id === id);
}

export function getSongsByLevel(level: string): Song[] {
    if (level === 'all') return SONGS;
    return SONGS.filter(s => s.level === level);
}

export function getSongsByGenre(genre: string): Song[] {
    if (genre === 'all') return SONGS;
    return SONGS.filter(s => s.genre === genre);
}

export function getDailyChallenge(): Song {
    return SONGS[0];
}

export function getRecommendedSongs(): Song[] {
    return SONGS.slice(0, 3);
}
`;

    fs.writeFileSync('data/songs.ts', output);
    console.log('Saved data/songs.ts!');
}

main();
