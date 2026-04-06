import fs from 'node:fs';
import path from 'node:path';
import { DATA, writeText } from './lib.mjs';

const file = path.join(DATA, 'tracker.json');
const evalFile = path.join(DATA, 'evaluated.json');

// Valid statuses
const STATUS = {
  NEW: 'new',
  SHORTLISTED: 'shortlisted',
  APPLY: 'apply',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  OFFER: 'offer'
};

// Parse job ID from CLI
const jobId = process.argv[2];

if (!jobId) {
  // List all entries
  const current = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { entries: [] };
  console.log(JSON.stringify(current, null, 2));
  process.exit(0);
}

// Handle commands: status, apply, etc.
const cmd = process.argv[3] || 'update';

function loadTracker() {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { entries: [] };
}

function saveTracker(data) {
  data.updatedAt = new Date().toISOString();
  writeText(file, JSON.stringify(data, null, 2));
}

function findEntry(entries, id) {
  return entries.find(e => e.id === id);
}

function updateEntry(entries, id, updates) {
  const idx = entries.findIndex(e => e.id === id);
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], ...updates, updatedAt: new Date().toISOString() };
  } else {
    entries.push({ id, ...updates, updatedAt: new Date().toISOString() });
  }
  return entries;
}

// Load evaluated job data
const evaluated = fs.existsSync(evalFile) ? JSON.parse(fs.readFileSync(evalFile, 'utf8')) : { jobs: [] };
const hit = evaluated.jobs.find(j => j.jobId === jobId) || {};

const tracker = loadTracker();
let entries = tracker.entries || [];
let result = {};

if (cmd === 'status' && process.argv[4]) {
  // Update status: node tracker.mjs <id> status <new-status>
  const newStatus = process.argv[4];
  if (!Object.values(STATUS).includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}. Valid: ${Object.values(STATUS).join(', ')}`);
    process.exit(1);
  }
  entries = updateEntry(entries, jobId, { status: newStatus });
  saveTracker({ entries });
  result = { id: jobId, status: newStatus };
} else if (cmd === 'apply') {
  // Mark as applied
  entries = updateEntry(entries, jobId, { status: STATUS.APPLIED, appliedAt: new Date().toISOString() });
  saveTracker({ entries });
  result = { id: jobId, status: STATUS.APPLIED };
} else if (cmd === 'note' && process.argv[4]) {
  // Add note: node tracker.mjs <id> note "some text"
  const note = process.argv[4];
  const entry = findEntry(entries, jobId);
  const notes = entry?.notes || [];
  notes.push({ text: note, at: new Date().toISOString() });
  entries = updateEntry(entries, jobId, { notes });
  saveTracker({ entries });
  result = { id: jobId, note };
} else {
  // Default: create/update from evaluated data
  const record = {
    id: jobId,
    company: hit.company || 'Unknown',
    role: hit.title || 'Unknown',
    source: hit.source || 'local',
    status: hit.status || STATUS.SHORTLISTED,
    score: hit.score ?? 0,
    report: hit.reportFile ? path.relative(process.cwd(), hit.reportFile) : '',
    pdf: hit.pdfFile ? path.relative(process.cwd(), hit.pdfFile) : '',
    evaluatedAt: hit.evaluatedAt,
    updatedAt: new Date().toISOString()
  };
  entries = entries.filter(e => e.id !== jobId).concat(record);
  saveTracker(tracker, { entries });
  result = record;
}

console.log(JSON.stringify(result, null, 2));