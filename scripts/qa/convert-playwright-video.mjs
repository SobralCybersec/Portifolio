import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const resultsDir = resolve('test-results');
const output = resolve(process.argv[2] ?? 'test-results/user-journey.mp4');

function findVideos(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findVideos(path);
    return entry.name === 'video.webm' ? [path] : [];
  });
}

const input = findVideos(resultsDir)
  .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)[0];

if (!input) {
  console.error(`No Playwright video found under ${resultsDir}`);
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
const result = spawnSync('ffmpeg', [
  '-y', '-i', input,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output,
], { stdio: 'inherit' });

if (result.error) {
  console.error(`FFmpeg is required to create ${output}: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
