import { writeText, slugify, REPORTS, OUTPUT } from './lib.mjs';
import path from 'node:path';

const company = process.argv[2] || 'Acme Data';
const role = process.argv[3] || 'Data Engineer';
const date = '2026-04-06';
const num = '002';
const companySlug = slugify(company);
const reportFile = path.join(REPORTS, `${num}-${companySlug}-${date}.md`);
const pdfFile = path.join(OUTPUT, `${num}-${companySlug}-${date}.pdf`);
writeText(reportFile, `# ${role}\n\nDraft application package for ${company}.\n`);
writeText(pdfFile, `%PDF-1.4\n% JobForge application PDF placeholder\n`);
console.log(JSON.stringify({ company, role, reportFile, pdfFile }, null, 2));
