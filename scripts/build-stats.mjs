#!/usr/bin/env node
/**
 * Builds src/data/stats.json from a MapMyRun workout-history CSV export.
 *
 * Usage:
 *   npm run stats                       # reads data/workout_history.csv
 *   node scripts/build-stats.mjs <csv>  # or pass a path explicitly
 *
 * To refresh for a future date: export a fresh CSV from MapMyRun, drop it at
 * data/workout_history.csv (gitignored — it holds personal GPS/HR data), then
 * run `npm run stats` and commit the regenerated src/data/stats.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const csvPath = resolve(root, process.argv[2] || 'data/workout_history.csv');
const outPath = resolve(root, 'src/data/stats.json');

if (!existsSync(csvPath)) {
  console.error(`✗ CSV not found: ${csvPath}`);
  console.error('  Export your history from MapMyRun and save it to data/workout_history.csv');
  process.exit(1);
}

// --- Minimal RFC-4180 CSV parser (handles quoted fields, commas, newlines) ---
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const raw = readFileSync(csvPath, 'utf8');
const grid = parseCsv(raw).filter(r => r.length > 1);
const header = grid.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
const get = (r, name) => r[idx[name]] ?? '';
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

// MapMyRun mixes "June 21, 2026" and abbreviated "Jan. 4, 2025" — strip the dot.
const parseDate = (s) => {
  const d = new Date(String(s).replace(/\./g, '').trim());
  return Number.isNaN(d.getTime()) ? null : d;
};

const KM_TO_MI = 0.621371;
const records = grid.map((r) => ({
  type: get(r, 'Activity Type').trim(),
  distanceKm: num(get(r, 'Distance (km)')),
  seconds: num(get(r, 'Workout Time (seconds)')),
  calories: num(get(r, 'Calories Burned (kCal)')),
  steps: num(get(r, 'Steps')),
  date: parseDate(get(r, 'Workout Date')),
  notes: get(r, 'Notes').trim(),
}));

const sum = (sel) => records.reduce((a, r) => a + sel(r), 0);
const byType = records.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {});
const dated = records.filter((r) => r.date).sort((a, b) => a.date - b.date);
const since = dated[0]?.date ?? null;

const totalKm = sum((r) => r.distanceKm);
const runs = records.filter((r) => r.type === 'Run');
const runKm = runs.reduce((a, r) => a + r.distanceKm, 0);
// Longest *run* specifically (not any activity) — a long bike ride must never
// be labelled a run when this is regenerated on a future export.
const longest = runs.reduce((m, r) => (r.distanceKm > m.distanceKm ? r : m), runs[0]);

// Pull any YouTube links the workout notes carry, newest first.
const videos = records
  .filter((r) => /youtu\.?be|youtube\.com/i.test(r.notes))
  .sort((a, b) => (b.date ?? 0) - (a.date ?? 0))
  .map((r) => ({
    url: r.notes,
    type: r.type,
    distanceKm: Math.round(r.distanceKm * 10) / 10,
    date: r.date ? r.date.toISOString().slice(0, 10) : null,
  }));

const fmtMonthYear = (d) =>
  d ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;

const stats = {
  lastUpdated: new Date().toISOString().slice(0, 10),
  sinceDate: fmtMonthYear(since),
  sinceYear: since ? since.getFullYear() : null,
  totals: {
    workouts: records.length,
    distanceKm: Math.round(totalKm * 10) / 10,
    distanceMi: Math.round(totalKm * KM_TO_MI),
    runDistanceKm: Math.round(runKm * 10) / 10,
    runDistanceMi: Math.round(runKm * KM_TO_MI),
    hours: Math.round(sum((r) => r.seconds) / 3600),
    calories: Math.round(sum((r) => r.calories)),
    steps: Math.round(sum((r) => r.steps)),
  },
  byType,
  longest: {
    type: longest.type,
    distanceKm: Math.round(longest.distanceKm * 10) / 10,
    distanceMi: Math.round(longest.distanceKm * KM_TO_MI * 10) / 10,
    date: longest.date ? fmtMonthYear(longest.date) : null,
  },
  videosFromNotes: videos,
};

writeFileSync(outPath, JSON.stringify(stats, null, 2) + '\n');
console.log(`✓ Wrote ${outPath}`);
console.log(
  `  ${stats.totals.workouts} workouts · ${stats.totals.distanceMi} mi · ` +
    `${stats.totals.hours} h · since ${stats.sinceDate} · ${videos.length} video link(s)`
);
