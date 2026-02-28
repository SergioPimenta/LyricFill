import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'songs.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The original array ended at index of getSongById
const getSongByIdIndex = content.indexOf('export function getSongById');
const arrayEndIndex = content.lastIndexOf('];', getSongByIdIndex);

// Where the injection happened:
const injectionMarker = 'return SONGS[0,';
const injectionIndex = content.lastIndexOf(injectionMarker);

if (injectionIndex !== -1) {
    // Extract the injected objects
    const injectedData = content.substring(injectionIndex + injectionMarker.length).trim();
    // InjectedData looks like `\n    {\n        "id": "someone-like-you"... \n];\n`

    // First, restore the bottom half correctly
    const bottomHalf = `
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
`;

    // Now insert the injectedData before `];`
    const oldArrayBody = content.substring(0, arrayEndIndex).trim();
    // Note injectedData ends with `];` or `];\n` because it matched `];` when generating
    const newFileRaw = oldArrayBody + ',\n    ' + injectedData;

    // BUT injectedData ends with `];` because it appended `\n];\n` to the end of the generator.
    // However, it didn't end with getting new functions. It just straight up ended with `];`

    const finalContent = newFileRaw + '\n\n' + bottomHalf.trim() + '\n';
    fs.writeFileSync(filePath, finalContent);
    console.log("Restored songs.ts completely!");
}
