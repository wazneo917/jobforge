import fs from 'node:fs';
import path from 'node:path';
const file = path.join('data', 'applications.md');
const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
fs.writeFileSync(file, text.replace(/\s+$/m, ''));
console.log('normalized');
