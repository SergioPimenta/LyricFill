import fs from 'fs';
import path from 'path';

const songsPath = 'c:/projetos/lyricfill/data/songs.ts';
let content = fs.readFileSync(songsPath, 'utf8');

const replacements = {
    // Levitating Official Audio: xRjED0sAItg (Original Dua Lipa track)
    // Replace: TUVcZIlO7oA (Music Video - has acting at the intro)
    "TUVcZIlO7oA": "xRjED0sAItg",

    // Peaches Official Audio: rjb-o4T24mE (Original Justin Bieber track)
    // Replace: tQ0yjYUFKAE (Music Video)
    "tQ0yjYUFKAE": "rjb-o4T24mE",

    // Paint The Town Red Official Audio: U_P2z1FwT68 (Original Doja Cat track)
    // Replace: m4_9TFeMfJE (Music Video - has long intro)
    "m4_9TFeMfJE": "U_P2z1FwT68"
};

let modifiedContent = content;
let changedCount = 0;

for (const [oldId, newId] of Object.entries(replacements)) {
    if (modifiedContent.includes(`youtubeId: '${oldId}'`)) {
        modifiedContent = modifiedContent.replace(`youtubeId: '${oldId}'`, `youtubeId: '${newId}'`);
        changedCount++;
        console.log(`Replaced YouTube ID: ${oldId} -> ${newId}`);
    } else {
        console.log(`YouTube ID ${oldId} not found in the file, might have been already updated or manually changed.`);
    }
}

if (changedCount > 0) {
    fs.writeFileSync(songsPath, modifiedContent);
    console.log(`Successfully updated ${changedCount} YouTube IDs in songs.ts`);
} else {
    console.log('No modifications were needed.');
}
