import path from 'node:path';
import { ensureDir, writeText, slugify, JDS } from './lib.mjs';

ensureDir(JDS);
const out = [
  { id: 'sample-jd-001', title: 'Data Engineer', company: 'Acme Data', source: 'local', path: path.join('jds', 'sample-jd-001.md') },
  { id: 'sample-jd-002', title: 'Applied AI Engineer', company: 'Nova AI', source: 'local', path: path.join('jds', 'sample-jd-002.md') }
];
writeText(path.join('data', 'jobs.json'), JSON.stringify({ generatedAt: new Date().toISOString(), jobs: out }, null, 2));
console.log(JSON.stringify({ scanned: out.length, jobs: out }, null, 2));
