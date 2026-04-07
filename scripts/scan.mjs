// JobForge Scanner - Uses LifeOS pipeline data
import fs from 'node:fs';
import path from 'node:path';
import { writeText, ensureDir, DATA, JDS } from './lib.mjs';

const LIFEOS_JOBS = '/home/waz/.openclaw/workspace/lifeos/storage/jobs/haritha_dataE_germany/raw/jobs.json';
const LIFEOS_ANALYSIS = '/home/waz/.openclaw/workspace/lifeos/storage/jobs/haritha_dataE_germany/runs';

// Ensure directories exist
ensureDir(DATA);
ensureDir(JDS);

// Load jobs from LifeOS pipeline
function loadJobsFromLifeOS() {
  try {
    const data = JSON.parse(fs.readFileSync(LIFEOS_JOBS, 'utf8'));
    return data.jobs || [];
  } catch (err) {
    console.error('Failed to load LifeOS jobs:', err.message);
    return [];
  }
}

// Simple CSV parser (handles basic quoted fields)
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Get latest analysis CSV
function getLatestAnalysis() {
  try {
    const runsDir = LIFEOS_ANALYSIS;
    const runs = fs.readdirSync(runsDir)
      .filter(f => fs.existsSync(path.join(runsDir, f, 'analysis.csv')))
      .filter(f => f.match(/^20\d{6}[_T]/) || f.match(/^20\d{2}-\d{2}-\d{2}[_T]/))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    
    if (runs.length === 0) return [];
    
    const latestRun = runs[0];
    const csvPath = path.join(runsDir, latestRun, 'analysis.csv');
    if (!fs.existsSync(csvPath)) return [];
    
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.trim().split('\n');
    const headers = parseCsvLine(lines[0]);
    
    const jobs = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCsvLine(lines[i]);
      const job = {};
      headers.forEach((h, idx) => job[h] = values[idx] || '');
      jobs.push(job);
    }
    return jobs;
  } catch (err) {
    console.error('Failed to load analysis:', err.message);
    return [];
  }
}

// Main scan function
async function scan(query = 'data engineer', location = 'Germany') {
  console.error(`Loading jobs from LifeOS pipeline...`);
  
  const jobs = loadJobsFromLifeOS();
  const analysis = getLatestAnalysis();
  
  console.error(`Loaded ${jobs.length} jobs from ${LIFEOS_JOBS}`);
  console.error(`Loaded ${analysis.length} analyzed jobs`);
  
  // Filter by query
  const queryLower = query.toLowerCase();
  const filteredJobs = jobs.filter(j => {
    const title = (j.job_title || j.title || '').toLowerCase();
    return title.includes(queryLower);
  });
  
  // Merge with analysis scores
  const scoredJobs = filteredJobs.map(job => {
    // Match by job_title + company
    const analysisEntry = analysis.find(a => 
      (a.job_title === job.job_title && a.company === job.company) ||
      (a.job_url && job.job_id && a.job_url.includes(job.job_id.split('_')[1]))
    );
    return {
      ...job,
      id: job.job_id,
      title: job.job_title,
      role: job.job_title,
      description: '',
      score: analysisEntry?.relevance_score ? parseFloat(analysisEntry.relevance_score) : 0,
      priority: analysisEntry?.application_priority || (analysisEntry?.relevance_score >= 80 ? 'HIGH' : analysisEntry?.relevance_score >= 60 ? 'MEDIUM' : 'LOW'),
      matchReason: analysisEntry?.match_reason || '',
      salaryRange: analysisEntry?.salary_range || job.salary || ''
    };
  }).sort((a, b) => b.score - a.score);
  
  // Save to JobForge data
  const jobsPath = path.join(DATA, 'jobs.json');
  writeText(jobsPath, JSON.stringify({
    scannedAt: new Date().toISOString(),
    query,
    location,
    jobs: scoredJobs
  }, null, 2));
  
  // Save pipeline markdown
  let pipeline = '# Pipeline\n\n';
  pipeline += `## Scanned: ${new Date().toISOString()}\n`;
  pipeline += `## Query: ${query} | Location: ${location}\n`;
  pipeline += `## Total: ${scoredJobs.length} jobs\n\n`;
  
  pipeline += '### High Priority\n';
  scoredJobs.filter(j => j.priority === 'HIGH' || j.score >= 80).forEach(j => {
    pipeline += `- [ ] ${j.company}: ${j.title} (${j.score}/100)\n`;
  });
  
  pipeline += '\n### Medium Priority\n';
  scoredJobs.filter(j => j.priority === 'MEDIUM' || (j.score >= 60 && j.score < 80)).forEach(j => {
    pipeline += `- [ ] ${j.company}: ${j.title} (${j.score}/100)\n`;
  });
  
  pipeline += '\n### Low Priority\n';
  scoredJobs.filter(j => j.priority === 'LOW' || j.score < 60).slice(0, 20).forEach(j => {
    pipeline += `- [ ] ${j.company}: ${j.title} (${j.score}/100)\n`;
  });
  
  const pipelinePath = path.join(DATA, 'pipeline.md');
  writeText(pipelinePath, pipeline);
  
  console.log(JSON.stringify({
    scanned: scoredJobs.length,
    query,
    location,
    highPriority: scoredJobs.filter(j => j.priority === 'HIGH').length,
    mediumPriority: scoredJobs.filter(j => j.priority === 'MEDIUM').length,
    jobs: scoredJobs.slice(0, 10)
  }, null, 2));
}

// CLI
const query = process.argv[2] || 'data engineer';
const location = process.argv[3] || 'Germany';
scan(query, location).catch(err => {
  console.error(err);
  process.exit(1);
});