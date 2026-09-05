#!/usr/bin/env node

/**
 * Vera Fast for Custospark Academy frontend.
 * - oxlint on changed files (staged + unstaged vs HEAD, fallback: src/)
 * - type-check (tsc --noEmit) + build
 * - logic gates: file size <= 500 lines, no em/en dashes
 *
 * Usage: npm run vera:fast
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out: out.trim() };
  } catch (e) {
    return { code: 1, out: `${e.stdout || ''}${e.stderr || ''}`.trim() };
  }
}

const problems = [];
const fail = (msg) => problems.push(msg);

// 1) changed files (ts/tsx/css)
let changed = [];
try {
  const raw = execSync('git diff --name-only HEAD; git diff --cached --name-only HEAD', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  changed = raw ? raw.split(/\r?\n/) : [];
} catch {
  changed = [];
}

let targets = changed.filter(
  (f) => /\.(ts|tsx)$/.test(f) && existsSync(path.join(root, f)) && !f.startsWith('node_modules'),
);

if (targets.length === 0) {
  // fallback: all of src/ (fresh repo without commits)
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) targets.push(full.replace(/\\/g, '/'));
    }
  };
  walk(path.join(root, 'src'));
}

// 2) lint (changed files, or src/ on fallback)
if (targets.length > 0) {
  const { code, out } = run(`npx oxlint ${targets.map((f) => JSON.stringify(f)).join(' ')}`);
  if (code !== 0) fail(out || 'oxlint failed');
}

// 3) type-check
const { code: tscCode, out: tscOut } = run('npx tsc --noEmit -p tsconfig.app.json');
if (tscCode !== 0) fail(tscOut || 'tsc --noEmit failed');

// 4) logic: file size + no long dashes
const logicFiles = changed.filter((f) => /\.(ts|tsx|css)$/.test(f) && existsSync(path.join(root, f)));
for (const f of logicFiles) {
  const content = readFileSync(path.join(root, f), 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length > 500) fail(`[file-size-500] ${f} has ${lines.length} lines (max 500)`);
  if (/[\u2013\u2014]/u.test(content)) fail(`[no-long-dashes] ${f} - use a plain hyphen instead`);
}

problems.forEach((p) => console.error(p));
console.log(
  problems.length === 0
    ? `\n\u2705 Vera fast: passed (oxlint + tsc + logic, ${targets.length} source file(s))`
    : `\n\u274c Vera fast: FAILED (${problems.length} issue(s))`,
);
process.exit(problems.length === 0 ? 0 : 1);