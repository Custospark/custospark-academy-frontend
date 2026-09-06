#!/usr/bin/env node
/**
 * Deploy the Custospark Academy web frontend by dropping the fresh build into
 * the Laravel backend's public folder, so a single `git pull` on the server
 * (in the app dir) ships both the API code and the web build.
 *
 *   all          → Backend/public/staging AND Backend/public/production
 *   staging      → Backend/public/staging     (build --mode staging, .env.staging API)
 *   production   → Backend/public/production  (build mode production, .env.production API)
 *
 * The asset base is relative (./) so the app works whether the server serves
 * the folder from a subdomain docroot (academy.custospark.com) or a subpath.
 *
 * Each target is built, copied, then committed + pushed to GitHub. Only the
 * backend repo carries the deploy (the fresh build under public/{target}); the
 * frontend repo is never auto-committed - frontend build output stays out of
 * git (dist/ is gitignored), and unrelated source changes are never swept in.
 *
 * The SPA .htaccess (deploy/htaccess.{target}) is copied into the build folder
 * with each deploy, so the server copy always carries it. On the server, wipe
 * + recopy with cp -rT (NEVER cp .../* - that drops the dotfile .htaccess).
 *
 * Server copy mapping (see Backend/DEPLOYMENT.md for the full runbook):
 *   public/production → /home/u214605677/domains/custospark.com/public_html/academy
 *   public/staging    → /home/u214605677/domains/custospark.com/public_html/academy-staging
 *
 * Usage:
 *   npm run build:web              # both staging + production
 *   npm run deploy:web:staging
 *   npm run deploy:web:production
 */
import { execSync } from 'child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = resolve(__dirname, '..');
const BACKEND_ROOT = resolve(FRONTEND_ROOT, '..', 'Backend');
const BACKEND_PUBLIC = resolve(BACKEND_ROOT, 'public');
const DIST = resolve(FRONTEND_ROOT, 'dist', 'web');
const APP_VERSION = JSON.parse(readFileSync(resolve(FRONTEND_ROOT, 'package.json'), 'utf8')).version;

const requested = process.argv[2] ?? 'all';
const targets = requested === 'all' ? ['staging', 'production'] : [requested];

for (const t of targets) {
  if (t !== 'staging' && t !== 'production') {
    console.error(`Unknown target "${t}". Use: all | staging | production`);
    process.exit(1);
  }
}

function step(label) {
  console.log(`\n━━━ ${label} ━━━`);
}

function run(cmd, cwd) {
  console.log(`   $ ${cmd}`);
  execSync(cmd, { cwd, stdio: ['pipe', 'inherit', 'inherit'] });
}

/** Capture-only git (status/porcelain) - never for push. */
function gitQuiet(cwd, args) {
  return execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).toString();
}

/** Interactive git (add/commit/push) - inherit stdio so credential helpers,
 *  prompts, and progress write to the terminal. Piped stdio on Windows makes
 *  `git push` fail when the credential helper needs stdin. */
function gitRun(cwd, args) {
  execSync(`git ${args}`, { cwd, stdio: 'inherit' });
}

function hasChanges(cwd, path = '.') {
  try {
    const out = gitQuiet(cwd, `status --porcelain -- ${path}`);
    return out.trim().length > 0;
  } catch {
    return true; // be safe: attempt commit if we can't tell
  }
}

/**
 * Commit ONLY `path` (the fresh build under Backend/public/{target}) and push.
 * Never `git add -A` - that would sweep unrelated backend/frontend changes into
 * the deploy commit. Frontend build files stay out of git entirely (dist/ is
 * gitignored); the backend is the single source of truth for deployed builds.
 */
function commitAndPush(cwd, label, path, message) {
  if (!hasChanges(cwd, path)) {
    console.log(`   ${label}: nothing to commit for ${path}`);
    return;
  }
  try {
    gitRun(cwd, `add -- ${path}`);
    gitRun(cwd, `commit -m "${message.replace(/"/g, '\\"')}"`);
    gitRun(cwd, 'push origin HEAD');
    console.log(`   ${label}: committed + pushed ✔`);
  } catch (err) {
    console.error(`   ${label}: git step failed:\n     ${String(err.message).split('\n')[0]}`);
    process.exitCode = 1;
  }
}

console.log(`\n🚀 Deploying web build (v${APP_VERSION}) → Backend/public/${targets.join(', ')}`);

for (const target of targets) {
  console.log(`\n🎯 TARGET: ${target.toUpperCase()}`);

  step('Clean stale dist');
  rmSync(DIST, { recursive: true, force: true });

  step('Build frontend');
  const mode = target === 'staging' ? '--mode staging' : '--mode production';
  run(`tsc -b && vite build ${mode} --base ./ --outDir dist/web`, FRONTEND_ROOT);

  if (!existsSync(DIST)) {
    console.error('Build did not produce dist/web - aborting.');
    process.exit(1);
  }

  step(`Copy build → Backend/public/${target}`);
  const dest = resolve(BACKEND_PUBLIC, target);
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dest, { recursive: true });
  cpSync(DIST, dest, { recursive: true });
  console.log(`   copied ${DIST} → ${dest}`);

  // Ship the SPA .htaccess inside the build folder so the server's copy always
  // carries it - no manual re-add after every deploy. It serves real files with
  // correct MIME types and only routes non-file paths to index.html.
  const htaccessSrc = resolve(__dirname, '..', 'deploy', `htaccess.${target}`);
  if (existsSync(htaccessSrc)) {
    copyFileSync(htaccessSrc, resolve(dest, '.htaccess'));
    console.log(`   copied .htaccess → ${dest}/.htaccess`);
  } else {
    console.warn(`   ⚠ deploy/htaccess.${target} not found - .htaccess NOT added`);
  }

  step(`Commit + push backend: public/${target}`);
  commitAndPush(
    BACKEND_ROOT,
    'backend',
    `public/${target}`,
    `deploy(web): ${target} build v${APP_VERSION} under public/${target}`,
  );
}

const COPY_MAP = {
  staging: { app: 'academy-staging-api', docroot: 'academy-staging', src: 'staging' },
  production: { app: 'academy-api', docroot: 'academy', src: 'production' },
};

console.log(`\n🎉 Done. On the server (per target):\n`);
for (const t of targets) {
  const map = COPY_MAP[t];
  console.log(`   # ${t.toUpperCase()}`);
  console.log(`   cd /home/u214605677/domains/${map.app}.custospark.com`);
  console.log(`   git fetch origin && git reset --hard origin/master`);
  console.log(`   cd /home/u214605677/domains/custospark.com/public_html`);
  console.log(`   rm -rf ${map.docroot} && mkdir -p ${map.docroot}`);
  console.log(`   cp -rT /home/u214605677/domains/${map.app}.custospark.com/public/${map.src} ${map.docroot}`);
  console.log(`   # .htaccess is inside the folder - cp -rT (NOT cp .../*) carries it\n`);
}