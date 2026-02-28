const https = require('https');
const fs = require('fs');

// We'll just read songs.ts text since it's a JS-like structure, or we can compile it.
// Actually, let's just use ts-node via a child_process that doesn't clear the terminal.
const { execSync } = require('child_process');
const output = execSync('npx tsx test-sync.ts', { stdio: 'pipe' }).toString();
fs.writeFileSync('sync-results.txt', output);
console.log('Wrote results to sync-results.txt');
