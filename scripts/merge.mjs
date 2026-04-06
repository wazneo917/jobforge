import fs from 'node:fs';
import path from 'node:path';
const add = path.join('batch', 'tracker-additions');
const files = fs.existsSync(add) ? fs.readdirSync(add).filter(f => f.endsWith('.tsv')) : [];
const out = [];
for (const f of files) out.push(fs.readFileSync(path.join(add, f), 'utf8').trim());
if (out.length) fs.appendFileSync(path.join('data', 'applications.md'), '\n' + out.join('\n') + '\n');
console.log(`merged ${files.length}`);
