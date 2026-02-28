export interface LrcLine {
    time: number; // seconds (float)
    text: string;
}

/**
 * Parses an LRC-format string into an array of timed lyrics lines.
 * Handles both 2-digit and 3-digit centisecond precision.
 *
 * Format: [mm:ss.xx] Lyric text
 * Example: [01:12.40] Well you only need the light
 */
export function parseLrc(lrc: string): LrcLine[] {
    const lines: LrcLine[] = [];
    // Regex: [mm:ss.xx] or [mm:ss.xxx]
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
    let match;

    while ((match = regex.exec(lrc)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        // Normalize to milliseconds then divide to get fractional seconds
        const centStr = match[3].padEnd(3, '0'); // ensure 3 digits
        const millis = parseInt(centStr, 10);
        const time = minutes * 60 + seconds + millis / 1000;
        const text = match[4].trim();

        // Skip empty lines (instrumental breaks, etc.)
        if (text) {
            lines.push({ time, text });
        }
    }

    return lines.sort((a, b) => a.time - b.time);
}
