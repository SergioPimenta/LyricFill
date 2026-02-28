import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'songs.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Find the boundaries of the SONGS array
const arrayStartIndex = content.indexOf('export const SONGS: Song[] = [');
const getSongByIdIndex = content.indexOf('export function getSongById');
const arrayEndIndex = content.lastIndexOf('];', getSongByIdIndex) + 1; // get the ']'

if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
    const header = content.substring(0, arrayStartIndex + 'export const SONGS: Song[] = '.length);
    const arrayContentStr = content.substring(arrayStartIndex + 'export const SONGS: Song[] = '.length, arrayEndIndex + 1);
    const footer = content.substring(arrayEndIndex + 1).trimStart();

    try {
        // Parse the array
        // The array contains JS objects, but since it was generated via JSON.stringify essentially, 
        // and has no functions, we can try to evaluate it carefully.
        // Or if it's strict JSON inside, we can JSON.parse it? No, it doesn't have quotes on keys if it was hand-written. 
        // Wait, the new ones do, but the old ones might not.

        let songsArray;
        // Using eval is safe here because we control the local file and it's just data
        eval(`songsArray = ${arrayContentStr};`);

        // Deduplicate
        const uniqueSongs = [];
        const seenIds = new Set();

        for (const song of songsArray) {
            if (!seenIds.has(song.id)) {
                seenIds.add(song.id);
                uniqueSongs.push(song);
            } else {
                console.log(`Removed duplicate: ${song.title} (${song.id})`);
            }
        }

        // Re-stringify the array
        const newArrayStr = JSON.stringify(uniqueSongs, null, 4);

        // Put it back together
        // JSON.stringify will use double quotes for keys, which is fine for TS
        const newContent = header + newArrayStr + ';\n\n' + footer;

        // Write the file
        fs.writeFileSync(filePath, newContent);
        console.log(`Deduplication complete. Remaining unique songs: ${uniqueSongs.length}`);
    } catch (e) {
        console.error("Error processing array logic:", e);
    }
} else {
    console.error("Could not locate the SONGS array bounds.");
}
