import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const DATA = path.join(ROOT, 'data');
export const REPORTS = path.join(ROOT, 'reports');
export const OUTPUT = path.join(ROOT, 'output');
export const JDS = path.join(ROOT, 'jds');

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

export function writeText(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

export function listReports() {
  if (!fs.existsSync(REPORTS)) return [];
  return fs.readdirSync(REPORTS).filter(f => /^\d+-.*\.md$/.test(f));
}

export function nextReportNumber() {
  const nums = listReports().map(f => Number(f.split('-')[0])).filter(Boolean);
  return String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
}

export function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function loadProfile() {
  const profile = path.join(ROOT, 'config', 'profile.yml');
  if (!fs.existsSync(profile)) return null;
  return readText(profile);
}

export function parsePipelineMd() {
  const file = path.join(DATA, 'pipeline.md');
  const text = fs.existsSync(file) ? readText(file) : '';
  const lines = text.split(/\r?\n/);
  const items = [];
  let section = '';
  for (const line of lines) {
    const header = line.match(/^##\s+(.*)$/);
    if (header) section = header[1].trim();
    const pending = line.match(/^- \[ \] (.+)$/);
    if (section === 'Pendientes' && pending) items.push({ raw: pending[1].trim(), status: 'pending' });
  }
  return { file, text, items };
}

export function savePipelineMd(text) {
  writeText(path.join(DATA, 'pipeline.md'), text);
}
