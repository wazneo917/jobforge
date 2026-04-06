import { writeText, ensureDir, slugify, DATA, JDS } from './lib.mjs';
import { SOURCES, getSource, listSources } from './sources.mjs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const SEARCH_QUERY = process.argv[2] || 'data engineer';
const LOCATION = process.argv[3] || 'Germany';
const LIMIT = parseInt(process.argv[4]) || 20;

ensureDir(JDS);
ensureDir(DATA);

// Generate unique job ID
function genJobId(source, extId) {
  return `${source}:${extId}`;
}

// Parse job from source (simplified - real impl would use browser)
function parseJob(source, raw) {
  return {
    id: genJobId(source.id, raw.id),
    source: source.id,
    sourceName: source.name,
    externalId: raw.id,
    title: raw.title,
    company: raw.company,
    location: raw.location,
    url: raw.url,
    scrapedAt: new Date().toISOString()
  };
}

// Load existing jobs to avoid duplicates
function loadExisting() {
  try {
    return require('./jobs.json')?.jobs || [];
  } catch {
    return [];
  }
}

// Main scan function
async function scan() {
  const jobs = loadExisting();
  const existingIds = new Set(jobs.map(j => j.id));
  const newJobs = [];
  
  console.error(`Scanning for "${SEARCH_QUERY}" in ${LOCATION}...`);
  
  for (const source of listSources()) {
    try {
      console.error(`  Scanning ${source.name}...`);
      const url = source.searchUrl(SEARCH_QUERY, LOCATION);
      
      // Use web_fetch for lightweight pages, browser for JS-heavy ones
      // For now, just log the URLs - real scraping needs browser
      console.error(`    URL: ${url}`);
      
      // Placeholder: in production, we'd use browser automation here
      // For now, show how the pipeline would work
      newJobs.push({
        source: source.id,
        url: url,
        note: 'URL generated - needs browser for actual scraping'
      });
      
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }
  }
  
  // Save job URLs to pipeline
  const pipelinePath = path.join(DATA, 'pipeline.md');
  let pipeline = '# Pendentes\n';
  for (const j of newJobs) {
    pipeline += `- [ ] ${j.source}:${j.url}\n`;
  }
  writeText(pipelinePath, pipeline);
  
  // Save jobs.json
  const jobsPath = path.join(DATA, 'jobs.json');
  writeText(jobsPath, JSON.stringify({
    scannedAt: new Date().toISOString(),
    query: SEARCH_QUERY,
    location: LOCATION,
    jobs: jobs.concat(newJobs)
  }, null, 2));
  
  console.log(JSON.stringify({
    scanned: newJobs.length,
    query: SEARCH_QUERY,
    location: LOCATION,
    jobs: newJobs
  }, null, 2));
}

scan().catch(err => {
  console.error(err);
  process.exit(1);
});