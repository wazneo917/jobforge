// JobForge Apply - Generate CVs & Cover Letters + Form Auto-Fill
import fs from 'node:fs';
import path from 'node:path';
import { writeText, slugify, ensureDir, DATA, REPORTS, OUTPUT } from './lib.mjs';

const LIFEOS_BASE = '/home/waz/.openclaw/workspace/lifeos/storage/jobs/haritha_dataE_germany/raw';

// Profile data
const PROFILE = {
  name: 'Sri Haritha Kanduri',
  email: 'haritha.kanduri@gmail.com',
  phone: '+49 XXX XXXX',
  location: 'Germany',
  linkedin: 'linkedin.com/in/haritha-kanduri',
  github: 'github.com/haritha-kanduri',
  summary: 'Data Engineer with experience in Python, SQL, AWS, and ETL pipelines.',
  skills: ['Python', 'SQL', 'AWS', 'Airflow', 'Spark', 'Kafka', 'PostgreSQL', 'Docker']
};

// Ensure directories exist
ensureDir(DATA);
ensureDir(REPORTS);
ensureDir(OUTPUT);

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

// Generate tailored cover letter content
function generateClContent(jobData) {
  const paragraphs = [];
  
  // Opening - specific to company/role
  paragraphs.push(`Dear Hiring Manager,`);
  paragraphs.push(`I am writing to express my interest in the ${jobData.title || jobData.role} position at ${jobData.company}.`);
  
  // Custom paragraph based on job requirements
  const desc = (jobData.description || '').toLowerCase();
  let customPara = '';
  
  if (desc.includes('airflow')) {
    customPara = `My experience with Apache Airflow for orchestrating ETL pipelines aligns well with your requirements. I have designed and maintained production-grade data pipelines that process large-scale datasets reliably.`;
  } else if (desc.includes('aws')) {
    customPara = `With hands-on experience in AWS ecosystem including S3, EC2, Lambda, and RDS, I am well-equipped to contribute to your cloud-based data infrastructure.`;
  } else if (desc.includes('python')) {
    customPara = `My strong Python skills enable me to build efficient data processing scripts and automation tools. I am proficient in pandas, NumPy, and PySpark for data transformation.`;
  } else if (desc.includes('sql') || desc.includes('postgresql')) {
    customPara = `I have extensive experience writing complex SQL queries and optimizing database performance. I am comfortable designing schemas and working with PostgreSQL, MySQL, and cloud databases.`;
  } else {
    customPara = `I am enthusiastic about contributing to a data-driven team and believe my technical background in data engineering makes me a strong fit for this role.`;
  }
  paragraphs.push(customPara);
  
  // Closing
  paragraphs.push(`Thank you for considering my application. I look forward to discussing how I can contribute to your team's success.`);
  paragraphs.push(`Best regards,`);
  paragraphs.push(`${PROFILE.name}`);
  
  return paragraphs.join('\n\n');
}

// Generate resume sections tailored to job
function generateResumeSections(jobData) {
  const sections = [];
  const desc = (jobData.description || '').toLowerCase();
  
  // Summary
  sections.push({
    title: 'Professional Summary',
    content: PROFILE.summary
  });
  
  // Skills - prioritize job-relevant ones
  let relevantSkills = [...PROFILE.skills];
  if (desc.includes('airflow')) relevantSkills.unshift('Apache Airflow');
  if (desc.includes('aws')) relevantSkills.unshift('AWS');
  if (desc.includes('spark')) relevantSkills.unshift('PySpark');
  if (desc.includes('kafka')) relevantSkills.unshift('Kafka');
  
  sections.push({
    title: 'Technical Skills',
    content: relevantSkills.slice(0, 10).join(' • ')
  });
  
  // Experience (placeholder - real impl would pull from profile)
  sections.push({
    title: 'Professional Experience',
    content: `Data Engineer • Company Name • 2022-Present
• Designed and maintained ETL pipelines using Airflow
• Processed 1M+ records daily using Python and SQL
• AWS cloud infrastructure management`
  });
  
  return sections;
}

// Main apply function - generates CV/CL for a job
async function apply(jobId, options = {}) {
  const jobData = loadJob(jobId);
  
  if (!jobData) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  const date = new Date().toISOString().split('T')[0];
  const companySlug = slugify(jobData.company || 'unknown');
  const roleSlug = slugify(jobData.title || jobData.role || 'role');
  
  const results = {};
  
  // Generate cover letter
  if (options.coverLetter !== false) {
    const clContent = generateClContent(jobData);
    const clPath = path.join(OUTPUT, `${jobId}-${companySlug}-cl-${date}.md`);
    writeText(clPath, clContent);
    results.coverLetter = clPath;
    console.error(`Generated cover letter: ${clPath}`);
  }
  
  // Generate resume sections
  if (options.resume !== false) {
    const sections = generateResumeSections(jobData);
    const resumePath = path.join(OUTPUT, `${jobId}-${companySlug}-resume-${date}.md`);
    let resumeContent = `# ${PROFILE.name}\n`;
    resumeContent += `${PROFILE.email} | ${PROFILE.phone} | ${PROFILE.location}\n`;
    resumeContent += `${PROFILE.linkedin}\n\n`;
    
    sections.forEach(s => {
      resumeContent += `## ${s.title}\n${s.content}\n\n`;
    });
    
    writeText(resumePath, resumeContent);
    results.resume = resumePath;
    console.error(`Generated resume: ${resumePath}`);
  }
  
  // Generate full report
  const reportPath = path.join(REPORTS, `${jobId}-${companySlug}-report.md`);
  let report = `# Job Application Report\n\n`;
  report += `**Company:** ${jobData.company}\n`;
  report += `**Role:** ${jobData.title || jobData.role}\n`;
  report += `**Location:** ${jobData.location}\n`;
  report += `**Score:** ${jobData.score || 'N/A'}\n`;
  report += `**Priority:** ${jobData.priority || 'N/A'}\n`;
  report += `**URL:** ${jobData.url}\n\n`;
  report += `## Match Reason\n${jobData.matchReason || 'N/A'}\n\n`;
  report += `## Cover Letter\n\n${clContent}\n`;
  writeText(reportPath, report);
  results.report = reportPath;
  console.error(`Generated report: ${reportPath}`);
  
  return results;
}

// Form auto-fill function (placeholder for Playwright)
async function autofill(jobId, formUrl) {
  const jobData = loadJob(jobId);
  
  if (!jobData) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  // Generate form field answers
  const answers = {
    'name': PROFILE.name,
    'email': PROFILE.email,
    'phone': PROFILE.phone,
    'linkedin': PROFILE.linkedin,
    'github': PROFILE.github,
    'years_experience': '3',
    'current_company': 'Current Company',
    'notice_period': '2 weeks',
    'Visa': 'Yes, I have valid work authorization',
    'relocation': 'Open to remote and hybrid'
  };
  
  console.error(`\n=== Form Auto-Fill Ready ===`);
  console.error(`Job: ${jobData.company} - ${jobData.title}`);
  console.error(`Form URL: ${formUrl}`);
  console.error(`\nCopy these answers:\n`);
  
  Object.entries(answers).forEach(([field, value]) => {
    console.error(`${field}: ${value}`);
  });
  
  console.error(`\nCover letter:\n${generateClContent(jobData)}\n`);
  
  return { formUrl, answers, coverLetter: generateClContent(jobData) };
}

// CLI
const command = process.argv[2];
const arg1 = process.argv[3];

if (command === 'apply' && arg1) {
  apply(arg1).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else if (command === 'autofill' && arg1) {
  autofill(arg1, arg2).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else if (command === 'list') {
  const jobsPath = path.join(DATA, 'jobs.json');
  try {
    const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
    console.log(JSON.stringify(data.jobs?.slice(0, 20) || [], null, 2));
  } catch {
    console.log('[]');
  }
} else {
  console.error(`Usage:
  node scan.mjs                  # Scan jobs from LifeOS
  node apply.mjs apply <jobId>   # Generate CV/CL for job
  node apply.mjs autofill <jobId> # Get form answers
  node apply.mjs list           # List available jobs`);
}