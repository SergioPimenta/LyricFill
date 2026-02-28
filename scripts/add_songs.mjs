import fs from 'fs';
import path from 'path';

const SONGS_TO_ADD = [
    { title: "Someone Like You", artist: "Adele", youtubeId: "hLQl3WQQoQ0", level: "intermediate", genre: "pop", coverColor: "#333333" },
    { title: "Yellow", artist: "Coldplay", youtubeId: "yKNxeF4KMsY", level: "beginner", genre: "rock", coverColor: "#eab308" },
    { title: "All of Me", artist: "John Legend", youtubeId: "450p7goxZqg", level: "beginner", genre: "rnb", coverColor: "#525252" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", youtubeId: "lp-EO5I60KA", level: "intermediate", genre: "pop", coverColor: "#22c55e" },
    { title: "Believer", artist: "Imagine Dragons", youtubeId: "7wtfhZwyrcc", level: "advanced", genre: "rock", coverColor: "#dc2626" },
    { title: "Just The Way You Are", artist: "Bruno Mars", youtubeId: "LjhCEhWiKXk", level: "beginner", genre: "pop", coverColor: "#a855f7" },
    { title: "Bad Guy", artist: "Billie Eilish", youtubeId: "DyDfgMOUjCI", level: "intermediate", genre: "pop", coverColor: "#facc15" },
    { title: "Don't Start Now", artist: "Dua Lipa", youtubeId: "oygrmJFKYZY", level: "advanced", genre: "pop", coverColor: "#ec4899" },
    { title: "Watermelon Sugar", artist: "Harry Styles", youtubeId: "E0kb1A9R0lQ", level: "intermediate", genre: "pop", coverColor: "#f43f5e" },
    { title: "Stay", artist: "The Kid LAROI, Justin Bieber", youtubeId: "kTJczUoc26U", level: "intermediate", genre: "pop", coverColor: "#3b82f6" },
    { title: "Levitating", artist: "Dua Lipa", youtubeId: "TUVcZfQe-Kw", level: "intermediate", genre: "pop", coverColor: "#8b5cf6" },
    { title: "Peaches", artist: "Justin Bieber", youtubeId: "tQ0yjYUFKAE", level: "beginner", genre: "pop", coverColor: "#fb923c" },
    { title: "As It Was", artist: "Harry Styles", youtubeId: "H5v3kku4y6Q", level: "intermediate", genre: "pop", coverColor: "#ef4444" },
    { title: "Flowers", artist: "Miley Cyrus", youtubeId: "G7KNmW9a75Y", level: "intermediate", genre: "pop", coverColor: "#d946ef" },
    { title: "Paint The Town Red", artist: "Doja Cat", youtubeId: "m4_9TFeMf7U", level: "advanced", genre: "pop", coverColor: "#b91c1c" }
];

async function fetchLyrics(title, artist) {
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    console.log('Fetching:', url);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
        return data[0];
    }
    return null;
}

function parseLrc(lrcString) {
    const lines = lrcString.split('\n');
    const result = [];
    const regex = /^\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/;

    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            const min = parseInt(match[1], 10);
            const sec = parseFloat(match[2]);
            const text = match[3].trim();
            const timeInSeconds = min * 60 + sec;
            if (text) {
                result.push({ time: Number(timeInSeconds.toFixed(1)), text });
            }
        }
    }
    return result;
}

function generateVerses(lrcLines, level) {
    const verses = [];
    let currentVerse = { label: "Verse 1", lines: [] };
    let verseCounter = 1;

    for (let i = 0; i < lrcLines.length; i++) {
        const line = lrcLines[i];

        // Blank generation logic
        const words = line.text.split(' ');
        const blanks = [];

        // Pick one random word longer than 3 chars
        const validWords = words.map((w, index) => ({ word: w.replace(/[^a-zA-Z]/g, ''), index }))
            .filter(w => w.word.length > (level === 'beginner' ? 2 : level === 'intermediate' ? 4 : 5));

        if (validWords.length > 0 && Math.random() > 0.3) {
            const picked = validWords[Math.floor(Math.random() * validWords.length)];
            blanks.push({
                word: picked.word.toLowerCase(),
                index: picked.index,
                hint: picked.word[0].toLowerCase() + '_'.repeat(picked.word.length - 1),
                level
            });
        }

        currentVerse.lines.push({
            timestamp: line.time,
            text: line.text,
            blanks
        });

        // Split verses every 6 lines or if there is a big time gap
        const nextLine = lrcLines[i + 1];
        const isBigGap = nextLine && (nextLine.time - line.time) > 10;

        if (currentVerse.lines.length >= 6 || isBigGap) {
            verses.push(currentVerse);
            verseCounter++;
            currentVerse = { label: `Section ${verseCounter}`, lines: [] };
        }
    }

    if (currentVerse.lines.length > 0) {
        verses.push(currentVerse);
    }
    return verses;
}

async function main() {
    const newSongs = [];

    for (const songInfo of SONGS_TO_ADD) {
        try {
            const lrcData = await fetchLyrics(songInfo.title, songInfo.artist);
            if (!lrcData || !lrcData.syncedLyrics) {
                console.log(`Skipping ${songInfo.title} - No synced lyrics found.`);
                continue;
            }

            const lrcLines = parseLrc(lrcData.syncedLyrics);
            if (lrcLines.length === 0) {
                console.log(`Skipping ${songInfo.title} - Parsed lyrics empty.`);
                continue;
            }

            const verses = generateVerses(lrcLines, songInfo.level);

            const newSong = {
                id: songInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                title: songInfo.title,
                artist: songInfo.artist,
                youtubeId: songInfo.youtubeId,
                genre: songInfo.genre,
                level: songInfo.level,
                duration: Math.ceil(lrcData.duration || lrcLines[lrcLines.length - 1].time + 10),
                estimatedMinutes: Math.ceil((lrcData.duration || 200) / 60) + 1,
                coverColor: songInfo.coverColor,
                verses
            };

            newSongs.push(newSong);
            console.log(`✅ Processed ${songInfo.title}`);
            // Add a small delay so we don't get IP banned
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            console.error(`Error processing ${songInfo.title}`, e);
        }
    }

    // Append to songs.ts
    const filePath = path.join(process.cwd(), 'data', 'songs.ts');
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find where the array ends
    const arrayEndIndex = content.lastIndexOf('];');
    if (arrayEndIndex !== -1) {
        const comma = content[arrayEndIndex - 1] === '}' ? ',' : '';
        const newContent = content.slice(0, arrayEndIndex) +
            (newSongs.length > 0 ? ',\n    ' : '') +
            newSongs.map(s => JSON.stringify(s, null, 4).replace(/\n/g, '\n    ')).join(',\n    ') +
            '\n];\n';

        fs.writeFileSync(filePath, newContent);
        console.log(`\n🎉 Successfully appended ${newSongs.length} songs to data/songs.ts!`);
    } else {
        console.log('Could not find end of array in songs.ts');
        fs.writeFileSync(path.join(process.cwd(), 'data', 'songs_generated.json'), JSON.stringify(newSongs, null, 2));
    }
}

main();
