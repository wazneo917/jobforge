// JobForge Apply Module - Generate tailored resumes & cover letters
import fs from 'node:fs';
import path from 'node:path';
import { writeText, slugify, REPORTS, OUTPUT, DATA } from './lib.mjs';

// Configuration
const TEMPLATES = {
  resume: 'Resume_SriHaritha_Kanduri_2026.pdf',
  coverLetter: 'Cover_Letter_805a.pdf'
};

const LIFEOS_BASE = '/home/waz/.openclaw/workspace/lifeos/storage/jobs/haritha_dataE_germany/raw';
const OUTPUT_DIR = 'output';
const REPORTS_DIR = 'reports';

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Load base templates
function loadTemplates() {
  return {
    resume: path.join(LIFEOS_BASE, TEMPLATES.resume),
    coverLetter: path.join(LIFEOS_BASE, TEMPLATES.coverLetter)
  };
}

// Generate tailored resume (placeholder - copies base for now)
async function generateResume(jobData, outputPath) {
  const templates = loadTemplates();
  if (fs.existsSync(templates.resume)) {
    fs.copyFileSync(templates.resume, outputPath);
    return outputPath;
  }
  // Fallback placeholder
  writeText(outputPath.replace('.pdf', '.txt'), `Resume for ${jobData.company} - ${jobData.role}`);
  return outputPath;
}

// Generate tailored cover letter
async function generateCoverLetter(jobData, outputPath) {
  const templates = loadTemplates();
  const content = generateClContent(jobData);
  
  // For now, create a text file - real impl would use PDF lib
  const txtPath = outputPath.replace('.pdf', '.txt');
  writeText(txtPath, content);
  
  if (fs.existsSync(templates.coverLetter)) {
    fs.copyFileSync(templates.coverLetter, outputPath);
  }
  return outputPath;
}

function generateClContent(jobData) {
  return `# Cover Letter

Dear Hiring Manager,

I am writing to express my interest in the ${jobData.role} position at ${jobData.company}.

${getCustomParagraph(jobData)}

Thank you for considering my application.

Best regards,
Sri Haritha Kanduri
`;
}

function getCustomParagraph(jobData) {
  // Customize based on job requirements
  if (jobData.skills?.includes('Python')) {
    return "With strong Python skills and experience in data engineering, I am excited about the opportunity to contribute to your team.";
  }
  if (jobData.skills?.includes('AWS')) {
    return "My experience with AWS cloud infrastructure aligns well with your technical requirements.";
  }
  return "I am enthusiastic about this opportunity and believe my skills in data engineering make me a strong fit.";
}

// Main apply function
async function apply(jobId, options = {}) {
  const { resume = true, coverLetter = true } = options;
  
  // Load job data
  const jobsFile = path.join(DATA, 'jobs.json');
  const jobs = fs.existsSync(jobsFile) ? JSON.parse(fs.readFileSync(jobsFile, 'utf8')).jobs : [];
  const jobData = jobs.find(j => j.id === jobId) || {};
  
  ensureDir(OUTPUT_DIR);
  ensureDir(REPORTS_DIR);
  
  const date = new Date().toISOString().split('T')[0];
  const companySlug = slugify(jobData.company || 'unknown');
  const roleSlug = slugify(jobData.role || 'role');
  
  const results = {};
  
  if (resume) {
    const resumePath = path.join(OUTPUT_DIR, `${jobId}-${companySlug}-resume-${date}.pdf`);
    results.resume = await generateResume(jobData, resumePath);
  }
  
  if (coverLetter) {
    const clPath = path.join(OUTPUT_DIR, `${jobId}-${companySlug}-cl-${date}.pdf`);
    results.coverLetter = await generateCoverLetter(jobData, clPath);
  }
  
  // Update applications tracker
  const applyFile = path.join(DATA, 'applications.json');
  const current = fs.existsSync(applyFile) ? JSON.parse(fs.readFileSync(applyFile, 'utf8')) : { entries: [] };
  const entries = current.entries.filter(e => e.jobId !== jobId).concat({
    jobId,
    company: jobData.company,
    role: jobData.role,
    ...results,
    status: 'generated',
    generatedAt: new Date().toISOString()
  });
  writeText(applyFile, JSON.stringify({ updatedAt: new Date().toISOString(), entries }, null, 2));
  
  return results;
}

// CLI
const jobId = process.argv[2];
if (jobId) {
  apply(jobId).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  // List applications
  const applyFile = path.join(DATA, 'applications.json');
  const current = fs.existsSync(applyFile) ? JSON.parse(fs.readFileSync(applyFile, 'utf8')) : { entries: [] };
  console.log(JSON.stringify(current, null, 2));
}