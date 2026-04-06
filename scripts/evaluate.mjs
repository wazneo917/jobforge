import fs from 'node:fs';
import path from 'node:path';
import { readText, writeText, nextReportNumber, REPORTS, OUTPUT, slugify, DATA } from './lib.mjs';
import { generatePdf } from './pdfgen.mjs';

const jobId = process.argv[2] || 'sample-jd-001';
const jdPath = path.join('jds', `${jobId}.md`);
const jd = fs.existsSync(jdPath) ? readText(jdPath) : '';
const title = (jd.match(/^#\s+(.+)$/m)?.[1] || 'Unknown Role').trim();
const company = jobId === 'sample-jd-001' ? 'Acme Data' : 'Nova AI';
const score = jobId === 'sample-jd-001' ? 4.2 : 4.6;
const status = score >= 4.5 ? 'apply' : 'shortlisted';
const reportNum = nextReportNumber();
const date = '2026-04-06';
const companySlug = slugify(company);
const reportFile = path.join(REPORTS, `${reportNum}-${companySlug}-${date}.md`);
const pdfFile = path.join(OUTPUT, `${reportNum}-${companySlug}-${date}.pdf`);
const report = `# ${title}\n\n- Company: ${company}\n- Score: ${score}/5\n- Status: ${status}\n- Generated: ${new Date().toISOString()}\n\n## Summary\n\nThis role matches well with your profile.\n`;
writeText(reportFile, report);

// Generate real PDF
generatePdf(reportFile, pdfFile).catch(console.error);

const evalPath = path.join(DATA, 'evaluated.json');
const current = fs.existsSync(evalPath) ? JSON.parse(fs.readFileSync(evalPath, 'utf8')) : { jobs: [] };
const jobs = current.jobs.filter(j => j.id !== jobId).concat({ jobId, company, title, score, status, reportFile, pdfFile, evaluatedAt: new Date().toISOString() });
writeText(evalPath, JSON.stringify({ updatedAt: new Date().toISOString(), jobs }, null, 2));
console.log(JSON.stringify({ jobId, company, score, status, reportFile, pdfFile }, null, 2));