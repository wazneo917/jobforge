import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = join(__dirname, 'data');

// Helper to read JSON safely
const readJSON = (filename, defaultVal = {}) => {
  const path = join(DATA_DIR, filename);
  if (!existsSync(path)) return defaultVal;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch { return defaultVal; }
};

// Helper to write JSON safely
const writeJSON = (filename, data) => {
  const path = join(DATA_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2));
};

// Serve static files from dashboard
app.use(express.static(join(__dirname, 'dashboard')));
app.use(express.static(join(__dirname, 'data')));

// API: Get all jobs
app.get('/api/jobs', (req, res) => {
  const tracker = readJSON('tracker.json', { entries: [] });
  const apps = readJSON('applications.json', { entries: [] });
  
  const entries = [...(tracker.entries || []), ...(apps.entries || [])];
  const unique = {};
  for (const e of entries) {
    unique[e.id] = e;
  }
  res.json(Object.values(unique));
});

// API: Get single job
app.get('/api/jobs/:id', (req, res) => {
  const tracker = readJSON('tracker.json', { entries: [] });
  const apps = readJSON('applications.json', { entries: [] });
  
  const all = [...tracker.entries || [], ...apps.entries || [] ];
  const job = all.find(e => e.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

// API: Update job status
app.patch('/api/jobs/:id', express.json(), (req, res) => {
  const { status, notes, score } = req.body;
  const tracker = readJSON('tracker.json', { entries: [] });
  const apps = readJSON('applications.json', { entries: [] });
  
  const all = [...tracker.entries, ...apps.entries];
  const idx = all.findIndex(e => e.id === req.params.id);
  
  if (idx === -1) {
    // Create new entry
    const newEntry = {
      id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    tracker.entries.push(newEntry);
    writeJSON('tracker.json', tracker);
    return res.json(newEntry);
  }
  
  // Update existing
  const entry = all[idx];
  if (status) entry.status = status;
  if (notes !== undefined) entry.notes = notes;
  if (score !== undefined) entry.score = score;
  entry.updatedAt = new Date().toISOString();
  
  // Save to appropriate file
  const inTracker = tracker.entries.findIndex(e => e.id === req.params.id) !== -1;
  if (inTracker) {
    writeJSON('tracker.json', tracker);
  } else {
    writeJSON('applications.json', apps);
  }
  
  res.json(entry);
});

// API: Get stats
app.get('/api/stats', (req, res) => {
  const jobs = readJSON('tracker.json', { entries: [] }).entries;
  const stats = {
    total: jobs.length,
    new: jobs.filter(j => j.status === 'new').length,
    apply: jobs.filter(j => j.status === 'apply').length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
    offer: jobs.filter(j => j.status === 'offer').length
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`JobForge server running at http://localhost:${PORT}`);
});