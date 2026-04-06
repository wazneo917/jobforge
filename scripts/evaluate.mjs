import fs from 'node:fs';
import path from 'node:path';
import { readText, writeText, nextReportNumber, REPORTS, OUTPUT, slugify } from './lib.mjs';

const jobId = process.argv[2] || 'sample-jd-001';
const jdPath = path.join('jds', `${jobId}.md`);
const jd = fs.existsSync(jdPath) ? readText(jdPath) : '';
const title = (jd.match(/^#\s+(.+)$/m)?.[1] || 'Unknown Role').trim();
const company = jobId === 'sample-jd-001' ? 'Acme Data' : 'Nova AI';
const score = jobId === 'sample-jd-001' ? 4.2 : 4.6;
const reportNum = nextReportNumber();
const date = '2026-04-06';
const companySlug = slugify(company);
const reportFile = path.join(REPORTS, `${reportNum}-${companySlug}-${date}.md`);
const pdfFile = path.join(OUTPUT, `${reportNum}-${companySlug}-${date}.pdf`);
const report = `# ${title}\n\n- Company: ${company}\n- Score: ${score}\n- Source: local\n- Recommendation: ${score >= 4 ? 'apply' : 'skip'}\n`;
writeText(reportFile, report);
writeText(pdfFile, `%PDF-1.4\n% JobForge placeholder PDF for ${company}\n`);
console.log(JSON.stringify({ jobId, company, score, reportFile, pdfFile }, null, 2));
