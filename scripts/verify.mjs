import fs from 'node:fs';
const must = ['README.md', 'LICENSE', 'package.json', 'data/applications.md', 'data/pipeline.md'];
const missing = must.filter(f => !fs.existsSync(f));
if (missing.length) {
  console.error(JSON.stringify({ ok: false, missing }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checked: must.length }, null, 2));
