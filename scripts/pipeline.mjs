import { parsePipelineMd, savePipelineMd } from './lib.mjs';
import { execSync } from 'node:child_process';

const { text } = parsePipelineMd();
const pending = [];
for (const id of ['sample-jd-001', 'sample-jd-002']) {
  if (text.includes(`- [ ] local:${id}`)) pending.push(id);
}
let next = text;
for (const id of pending) {
  execSync(`node scripts/evaluate.mjs ${id}`, { stdio: 'inherit' });
  execSync(`node scripts/tracker.mjs ${id}`, { stdio: 'inherit' });
  next = next.replace(`- [ ] local:${id}`, `- [x] local:${id}`);
}
savePipelineMd(next);
execSync('node scripts/merge.mjs', { stdio: 'inherit' });
execSync('node scripts/dedup.mjs', { stdio: 'inherit' });
execSync('node scripts/normalize.mjs', { stdio: 'inherit' });
execSync('node scripts/verify.mjs', { stdio: 'inherit' });
console.log(JSON.stringify({ processed: pending.length }, null, 2));
