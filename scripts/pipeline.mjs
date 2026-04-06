import fs from 'node:fs';
import path from 'node:path';
import { parsePipelineMd, savePipelineMd } from './lib.mjs';
import { execSync } from 'node:child_process';

const { file, text } = parsePipelineMd();
const pending = text.includes('local:sample-jd-001') ? ['sample-jd-001', 'sample-jd-002'] : [];
let next = text;
for (const id of pending) {
  execSync(`node scripts/evaluate.mjs ${id}`, { stdio: 'inherit' });
  next = next.replace(`- [ ] local:${id}`, `- [x] local:${id}`);
}
savePipelineMd(next);
execSync('node scripts/merge.mjs', { stdio: 'inherit' });
execSync('node scripts/dedup.mjs', { stdio: 'inherit' });
execSync('node scripts/normalize.mjs', { stdio: 'inherit' });
execSync('node scripts/verify.mjs', { stdio: 'inherit' });
console.log(JSON.stringify({ processed: pending.length }, null, 2));
