import fs from 'node:fs';
import path from 'node:path';
const file = path.join('data', 'applications.md');
const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : [];
const seen = new Set();
const out = [];
for (const line of lines) {
  if (!line.startsWith('|')) { out.push(line); continue; }
  const key = line.split('|').slice(1, 4).join('|');
  if (seen.has(key)) continue;
  seen.add(key);
  out.push(line);
}
fs.writeFileSync(file, out.join('\n'));
console.log('deduped');
