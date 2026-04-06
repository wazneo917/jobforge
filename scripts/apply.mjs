import fs from 'node:fs';
import path from 'node:path';
import { writeText, slugify, REPORTS, OUTPUT, DATA } from './lib.mjs';

const company = process.argv[2] || 'Acme Data';
const role = process.argv[3] || 'Data Engineer';
const date = '2026-04-06';
const num = '002';
const companySlug = slugify(company);
const reportFile = path.join(REPORTS, `${num}-${companySlug}-${date}.md`);
const pdfFile = path.join(OUTPUT, `${num}-${companySlug}-${date}.pdf`);
writeText(reportFile, `# ${role}\n\nDraft application package for ${company}.\n`);
writeText(pdfFile, `%PDF-1.4\n% JobForge application PDF placeholder\n`);
const applyPath = path.join(DATA, 'applications.generated.json');
const current = fs.existsSync(applyPath) ? JSON.parse(fs.readFileSync(applyPath, 'utf8')) : { entries: [] };
const entries = current.entries.filter(e => e.company !== company).concat({ company, role, reportFile, pdfFile, createdAt: new Date().toISOString() });
writeText(applyPath, JSON.stringify({ updatedAt: new Date().toISOString(), entries }, null, 2));
console.log(JSON.stringify({ company, role, reportFile, pdfFile }, null, 2));
