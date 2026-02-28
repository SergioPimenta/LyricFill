import fs from 'fs';
import path from 'path';
import ytSearch from 'yt-search';

const filePath = path.join(process.cwd(), 'data', 'songs.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Find the boundaries of the SONGS array
const arrayStartIndex = content.indexOf('export const SONGS: Song[] = [');
const getSongByIdIndex = content.indexOf('export function getSongById');
const arrayEndIndex = content.lastIndexOf('];', getSongByIdIndex) + 1;

async function main() {
    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
        const header = content.substring(0, arrayStartIndex + 'export const SONGS: Song[] = '.length);
        const arrayContentStr = content.substring(arrayStartIndex + 'export const SONGS: Song[] = '.length, arrayEndIndex + 1);
        const footer = content.substring(arrayEndIndex + 1).trimStart();

        let songsArray;
        eval(`songsArray = ${arrayContentStr};`);

        console.log(`Starting YouTube audio search for ${songsArray.length} songs...`);

        for (const song of songsArray) {
            // We want the pure audio to avoid Music Video acting/silence intros
            const query = `${song.artist} ${song.title} audio`;
            console.log(`Searching: "${query}"...`);

            try {
                const r = await ytSearch(query);
                const videos = r.videos;

                // Prioritize "Audio", "Lyric Video", or "Lyrics" to avoid MVs
                let bestVideo = videos.find(v =>
                    v.title.toLowerCase().includes('audio') ||
                    v.title.toLowerCase().includes('lyric')
                );

                if (!bestVideo && videos.length > 0) {
                    bestVideo = videos[0]; // fallback to top result
                }

                if (bestVideo) {
                    console.log(`[${song.title}] Found: ${bestVideo.title} (${bestVideo.videoId})`);
                    if (song.youtubeId !== bestVideo.videoId) {
                        song.youtubeId = bestVideo.videoId;
                    }
                } else {
                    console.log(`[${song.title}] No results found. Keeping old ID.`);
                }
            } catch (error) {
                console.error(`Error searching for ${song.title}:`, error.message);
            }
            // slight delay to prevent rate limits
            await new Promise(res => setTimeout(res, 800));
        }

        const newArrayStr = JSON.stringify(songsArray, null, 4);
        const newContent = header + newArrayStr + ';\n\n' + footer;

        fs.writeFileSync(filePath, newContent);
        console.log(`Finished rewriting youtubeIds in data/songs.ts!`);

    } else {
        console.error("Could not locate the SONGS array bounds.");
    }
}

main();
