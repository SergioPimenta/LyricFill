const https = require('https');

https.get('https://lrclib.net/api/search?track_name=Shape+of+You&artist_name=Ed+Sheeran', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        const results = JSON.parse(data);
        const lrc = results.find(r => r.syncedLyrics);
        if (lrc) {
            require('fs').writeFileSync('shape-of-you-lrc.txt', lrc.syncedLyrics);
            console.log('Saved to shape-of-you-lrc.txt');
        } else {
            console.log('NO SYNCED LYRICS');
        }
    });
});
