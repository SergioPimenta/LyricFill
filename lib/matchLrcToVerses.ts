import { LrcLine } from './parseLrc';
import { LyricsVerse } from '@/types';

/** Strip punctuation, lowercase, collapse whitespace. */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Count how many words from `lineText` appear in `lrcText`.
 * Returns a score between 0 and the word count of lineText.
 */
function wordOverlapScore(lrcText: string, lineText: string): number {
    const lrcWords = new Set(normalize(lrcText).split(' ').filter(Boolean));
    const lineWords = normalize(lineText).split(' ').filter(Boolean);
    let score = 0;
    for (const w of lineWords) {
        if (lrcWords.has(w)) score++;
    }
    return score;
}

/**
 * Maps each lyric line in the song's verses to the best-matching LRC timestamp.
 *
 * Returns a Map<lineKey, timeInSeconds> where lineKey = vIdx * 1000 + lIdx.
 * Lines without a good match (score < 2) are omitted โ€" the engine will fall
 * back to the hardcoded timestamp for those.
 *
 * Strategy:
 * - For each verse line, find the LRC entry with the highest word-overlap score.
 * - To prevent the same LRC line from matching two song lines, we keep track
 *   of which LRC index was last used and restrict the search to forward entries
 *   (monotonically increasing time). This also handles songs where LRC has
 *   repeat/chorus duplicates correctly.
 */
export function matchLrcToVerses(
    parsedLrc: LrcLine[],
    verses: LyricsVerse[],
): Map<number, number> {
    const timestamps = new Map<number, number>();

    // We scan LRC from the last-matched position forward to preserve order
    let lrcSearchStart = 0;

    for (let vIdx = 0; vIdx < verses.length; vIdx++) {
        for (let lIdx = 0; lIdx < verses[vIdx].lines.length; lIdx++) {
            const lineKey = vIdx * 1000 + lIdx;
            const lineText = verses[vIdx].lines[lIdx].text;

            let bestScore = 0;
            let bestLrcIdx = -1;

            // Search in a window: from lrcSearchStart to end, but limited to
            // the next 60 entries to avoid matching too far ahead for a short line
            const searchEnd = Math.min(parsedLrc.length, lrcSearchStart + 60);

            for (let i = lrcSearchStart; i < searchEnd; i++) {
                const score = wordOverlapScore(parsedLrc[i].text, lineText);
                if (score > bestScore) {
                    bestScore = score;
                    bestLrcIdx = i;
                }
            }

            // Require at least 2 matching words to accept the match
            if (bestLrcIdx >= 0 && bestScore >= 2) {
                timestamps.set(lineKey, parsedLrc[bestLrcIdx].time);
                // Next line must come from this index or later
                lrcSearchStart = bestLrcIdx;
            }
        }
    }

    return timestamps;
}
