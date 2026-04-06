// LifeOS Pipeline Integration for JobForge
// Bridges JobForge evaluation with LifeOS job_pipeline_v5

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// LifeOS pipeline paths
const LIFEOS_PIPELINE = '/home/waz/lifeos/scripts/job_pipeline_v5_deep.py';
const LIFEOS_OUTPUT = '/home/waz/lifeos/storage/jobs/haritha_dataE_germany';

export function lifeosAvailable() {
  return fs.existsSync(LIFEOS_PIPELINE);
}

export function getLifeOSJobs() {
  // Read from LifeOS pipeline output
  const jobsFile = path.join(LIFEOS_OUTPUT, 'raw', 'jobs.json');
  const shortlistFile = path.join(LIFEOS_OUTPUT, 'raw', 'shortlist.json');
  
  const jobs = fs.existsSync(jobsFile) ? JSON.parse(fs.readFileSync(jobsFile, 'utf8')) : [];
  const shortlist = fs.existsSync(shortlistFile) ? JSON.parse(fs.readFileSync(shortlistFile, 'utf8')) : [];
  
  return { jobs, shortlist };
}

export function syncToJobForge() {
  const { jobs, shortlist } = getLifeOSJobs();
  
  const jds = shortlist.map(j => ({
    id: `lifeos:${j.job_id || j.id}`,
    title: j.title || j.job_title,
    company: j.company,
    location: j.location,
    source: 'lifeos',
    url: j.url || j.link,
    score: j.relevance_score || 0,
    status: 'shortlisted'
  }));
  
  // Write to JobForge data/jobs.json
  const outFile = path.join(process.cwd(), 'data', 'jobs.json');
  fs.writeFileSync(outFile, JSON.stringify({
    syncedAt: new Date().toISOString(),
    source: 'lifeos',
    jobs: jds
  }, null, 2));
  
  return { synced: jds.length, jobs: jds };
}

export function runLifeOSPipeline() {
  if (!lifeosAvailable()) {
    throw new Error('LifeOS pipeline not found');
  }
  
  console.error('Running LifeOS pipeline...');
  execSync(`cd /home/waz/lifeos && python3 scripts/job_pipeline_v5_deep.py --profile haritha_dataE_germany`, {
    stdio: 'inherit'
  });
  
  return syncToJobForge();
}

// CLI
const cmd = process.argv[2];
if (cmd === 'sync') {
  console.log(JSON.stringify(syncToJobForge(), null, 2));
} else if (cmd === 'run') {
  console.log(JSON.stringify(runLifeOSPipeline(), null, 2));
} else if (cmd === 'check') {
  console.log(JSON.stringify({ available: lifeosAvailable() }, null, 2));
}