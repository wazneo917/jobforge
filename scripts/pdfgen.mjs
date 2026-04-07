// JobForge PDF Generator - ATS-optimized CVs from templates
import fs from 'node:fs';
import path from 'node:path';
import { ensureDir, OUTPUT, DATA } from './lib.mjs';

const LIFEOS_BASE = '/home/waz/.openclaw/workspace/lifeos/storage/jobs/haritha_dataE_germany/raw';

// Ensure directories
ensureDir(OUTPUT);

// Base templates
const TEMPLATES = {
  resume: path.join(LIFEOS_BASE, 'Resume_SriHaritha_Kanduri_2026.pdf'),
  coverLetter: path.join(LIFEOS_BASE, 'Cover_Letter_805a.pdf')
};

// Profile data (for dynamic generation)
const PROFILE = {
  name: 'Sri Haritha Kanduri',
  email: 'haritha.kanduri@gmail.com',
  phone: '+49 XXX XXXX',
  location: 'Germany',
  linkedin: 'linkedin.com/in/haritha-kanduri',
  github: 'github.com/haritha-kanduri'
};

// Load job data
function loadJob(jobId) {
  const jobsPath = path.join(DATA, 'jobs.json');
  try {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    return data.jobs?.find(j => j.id === jobId || j.job_id === jobId);
  } catch {
    return null;
  }
}

// Generate simple HTML for PDF (without external dependencies)
function generateResumeHtml(jobData = {}) {
  const desc = (jobData.description || '').toLowerCase();
  
  // Dynamic skills based on job
  let skills = ['Python', 'SQL', 'AWS', 'Airflow', 'Spark', 'Kafka'];
  if (desc.includes('gcp')) skills = ['Python', 'SQL', 'GCP', 'Airflow', 'BigQuery', 'Cloud Storage'];
  if (desc.includes('azure')) skills = ['Python', 'SQL', 'Azure', 'Databricks', 'Synapse'];
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume - ${PROFILE.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a5a9c; padding-bottom: 15px; }
    h1 { font-size: 18pt; color: #1a5a9c; margin-bottom: 5px; }
    .contact { font-size: 10pt; color: #666; }
    .contact span { margin: 0 8px; }
    h2 { font-size: 12pt; color: #1a5a9c; margin: 20px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #f0f4f8; padding: 4px 10px; border-radius: 3px; font-size: 9pt; }
    .experience { margin: 15px 0; }
    .job-title { font-weight: bold; font-size: 11pt; }
    .company { font-style: italic; color: #666; }
    .date { float: right; font-size: 10pt; color: #888; }
    ul { margin: 8px 0 8px 20px; }
    li { margin: 4px 0; font-size: 10pt; }
  </style>
</head>
<body>
  <header>
    <h1>${PROFILE.name}</h1>
    <div class="contact">
      <span>${PROFILE.email}</span> |
      <span>${PROFILE.phone}</span> |
      <span>${PROFILE.location}</span>
    </div>
    <div class="contact">
      <span>${PROFILE.linkedin}</span> |
      <span>${PROFILE.github}</span>
    </div>
  </header>
  
  <h2>Professional Summary</h2>
  <p>Data Engineer with 3+ years of experience in building scalable ETL pipelines, cloud infrastructure, and data processing systems. Proficient in Python, SQL, and AWS. Passionate about turning raw data into actionable insights.</p>
  
  <h2>Technical Skills</h2>
  <div class="skills">
    ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
  </div>
  
  <h2>Professional Experience</h2>
  <div class="experience">
    <div class="job-title">Data Engineer <span class="date">2022 - Present</span></div>
    <div class="company">Company Name, Germany</div>
    <ul>
      <li>Designed and maintained ETL pipelines using Apache Airflow processing 1M+ records daily</li>
      <li>Built data infrastructure on AWS (S3, EC2, Lambda, RDS)</li>
      <li>Developed Python scripts for data validation and transformation using pandas</li>
      <li>Optimized SQL queries reducing processing time by 40%</li>
      <li>Collaborated with data scientists to productionize ML models</li>
    </ul>
  </div>
  
  <h2>Education</h2>
  <div class="experience">
    <div class="job-title">Master's in Data Engineering</div>
    <div class="company">University Name | 2020 - 2022</div>
  </div>
</body>
</html>`;
}

function generateCoverLetterHtml(jobData) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cover Letter - ${jobData.company}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .name { font-size: 14pt; font-weight: bold; }
    .date { margin-bottom: 20px; }
    .recipient { margin-bottom: 20px; }
    .salutation { margin-bottom: 20px; }
    .body { text-align: justify; }
    .closing { margin-top: 30px; }
    .signature { margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${PROFILE.name}</div>
    <div>${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.location}</div>
  </div>
  <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  
  <div class="salutation">Dear Hiring Manager,</div>
  
  <div class="body">
    <p>I am writing to express my interest in the ${jobData.title || jobData.role} position at ${jobData.company}.</p>
    
    <p>${getCustomParagraph(jobData)}</p>
    
    <p>Thank you for considering my application. I look forward to discussing how I can contribute to your team's success.</p>
  </div>
  
  <div class="closing">
    <div class="signature">Best regards,</div>
    <div>${PROFILE.name}</div>
  </div>
</body>
</html>`;
}

function getCustomParagraph(jobData) {
  const desc = (jobData.description || '').toLowerCase();
  
  if (desc.includes('airflow')) {
    return "My experience with Apache Airflow for orchestrating ETL pipelines aligns well with your requirements. I have designed and maintained production-grade data pipelines that process large-scale datasets reliably.";
  } else if (desc.includes('aws')) {
    return "With hands-on experience in AWS ecosystem including S3, EC2, Lambda, and RDS, I am well-equipped to contribute to your cloud-based data infrastructure.";
  } else if (desc.includes('python')) {
    return "My strong Python skills enable me to build efficient data processing scripts and automation tools. I am proficient in pandas, NumPy, and PySpark for data transformation.";
  } else {
    return "I am enthusiastic about contributing to a data-driven team and believe my technical background in data engineering makes me a strong fit for this role.";
  }
}

// Try to generate PDF using Playwright (if available)
async function generatePdfWithPlaywright(html, outputPath) {
  try {
    const playwright = await import('playwright');
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4', margin: { top: '1cm', bottom: '1cm' } });
    await browser.close();
    return outputPath;
  } catch (err) {
    console.error('Playwright not available:', err.message);
    return null;
  }
}

// Main PDF generation
async function generatePdf(jobId, options = {}) {
  const jobData = loadJob(jobId);
  const date = new Date().toISOString().split('T')[0];
  const companySlug = (jobData?.company || 'unknown').toLowerCase().replace(/\s+/g, '-');
  
  ensureDir(OUTPUT);
  const results = {};
  
  // Generate Resume PDF
  if (options.resume !== false) {
    const resumeHtml = generateResumeHtml(jobData);
    const resumePath = path.join(OUTPUT, `${companySlug}-resume-${date}.pdf`);
    
    // Try Playwright, fallback to copying base template
    const pdf = await generatePdfWithPlaywright(resumeHtml, resumePath);
    if (!pdf && fs.existsSync(TEMPLATES.resume)) {
      fs.copyFileSync(TEMPLATES.resume, resumePath);
    }
    results.resume = resumePath;
    console.error(`Resume PDF: ${resumePath}`);
  }
  
  // Generate Cover Letter PDF
  if (options.coverLetter !== false && jobData) {
    const clHtml = generateCoverLetterHtml(jobData);
    const clPath = path.join(OUTPUT, `${companySlug}-cl-${date}.pdf`);
    
    const pdf = await generatePdfWithPlaywright(clHtml, clPath);
    if (!pdf && fs.existsSync(TEMPLATES.coverLetter)) {
      fs.copyFileSync(TEMPLATES.coverLetter, clPath);
    }
    results.coverLetter = clPath;
    console.error(`Cover Letter PDF: ${clPath}`);
  }
  
  return results;
}

// CLI
const command = process.argv[2];
const jobId = process.argv[3];

if (command === 'pdf' && jobId) {
  generatePdf(jobId).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else if (command === 'resume') {
  generatePdf('resume').then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.error(`Usage:
  node pdfgen.mjs pdf <jobId>    # Generate CV + CL for a job
  node pdfgen.mjs resume         # Generate base resume only`);
}