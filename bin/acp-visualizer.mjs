#!/usr/bin/env node
/**
 * acp-visualizer CLI — npx acp-visualizer [options] [path]
 *
 * Auto-detects ACP projects by walking up from CWD looking for
 * agent/progress.yaml. Supports local paths, GitHub repos, port
 * selection, and --no-open flag.
 */
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync, statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const visualizerRoot = resolve(__dirname, '..');

// ── Auto-Detect ACP Project ────────────────────────────────────────────────

function isRoot(dir) {
  return dir === resolve(dir, '..');
}

function findProgressYaml(startDir) {
  let dir = resolve(startDir);
  while (!isRoot(dir)) {
    const candidate = resolve(dir, 'agent/progress.yaml');
    if (existsSync(candidate)) {
      try { statSync(candidate); return candidate; } catch { /* continue */ }
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ── CLI Flag Parsing ───────────────────────────────────────────────────────

const args = process.argv.slice(2);

const flags = {
  path: null,
  repo: null,
  port: null,
  noOpen: false,
  update: false,
  version: false,
  help: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--path':
      flags.path = args[++i];
      break;
    case '--repo':
      flags.repo = args[++i];
      break;
    case '--port':
      flags.port = args[++i];
      break;
    case '--no-open':
      flags.noOpen = true;
      break;
    case '--update':
      flags.update = true;
      break;
    case '--version':
    case '-v':
      flags.version = true;
      break;
    case '--help':
    case '-h':
      flags.help = true;
      break;
  }
}

// ── --version ──────────────────────────────────────────────────────────────

if (flags.version) {
  const pkg = JSON.parse(readFileSync(resolve(visualizerRoot, 'package.json'), 'utf-8'));
  console.log(`acp-visualizer v${pkg.version}`);
  process.exit(0);
}

// ── --help ─────────────────────────────────────────────────────────────────

if (flags.help) {
  console.log(`acp-visualizer — ACP Enhanced Progress Dashboard

Usage: npx acp-visualizer [options] [path]

Options:
  --path <file>     Local progress.yaml path
  --repo <owner/repo>  GitHub repository (e.g. ssucipto/acp-enhanced)
  --port <N>        Port number (default: auto-detect 3000+)
  --no-open         Don't open browser automatically
  --update          Update visualizer to latest version
  --version, -v     Show version number
  --help, -h        Show this help

Examples:
  npx acp-visualizer                                    # auto-detect from CWD
  npx acp-visualizer --path ../my-project/agent/progress.yaml
  npx acp-visualizer --repo ssucipto/acp-enhanced
  npx acp-visualizer --port 4000 --no-open

Repository: https://github.com/ssucipto/ACPEnhanced-Visual`);
  process.exit(0);
}

// ── --update ────────────────────────────────────────────────────────────────

if (flags.update) {
  const { execSync } = await import('node:child_process');
  const updateScript = resolve(visualizerRoot, 'scripts/update.sh');
  try {
    execSync(`bash "${updateScript}"`, { stdio: 'inherit', cwd: visualizerRoot });
    process.exit(0);
  } catch {
    console.error('Update failed. Try running manually:');
    console.error(`  bash ${updateScript}`);
    process.exit(1);
  }
}

// ── Resolve Data Source ────────────────────────────────────────────────────

const env = { ...process.env };

if (flags.repo) {
  env.PROGRESS_YAML_REPO = flags.repo;
} else if (flags.path) {
  env.PROGRESS_YAML_PATH = resolve(flags.path);
} else if (env.PROGRESS_YAML_PATH) {
  // Already set by caller (e.g. /acp-visualize) — keep it, skip auto-detect
} else {
  // Auto-detect from CWD or use positional arg (first non-flag argument)
  const positional = args.find(a => !a.startsWith('-'));
  const detected = positional
    ? resolve(positional)
    : findProgressYaml(process.cwd());

  if (detected) {
    env.PROGRESS_YAML_PATH = detected;
  } else {
    console.error('No ACP project found. Walked up from CWD but no agent/progress.yaml found.');
    console.error('Specify: npx acp-visualizer --path /path/to/agent/progress.yaml');
    console.error('Or:     npx acp-visualizer --repo owner/repo');
    process.exit(1);
  }
}

if (flags.port) {
  env.PORT = flags.port;
}

// ── Start Dev Server ───────────────────────────────────────────────────────

const viteArgs = ['vite', 'dev'];
if (flags.port) viteArgs.push('--port', flags.port);
if (!flags.noOpen) viteArgs.push('--open');

console.log(`\n🚀 acp-visualizer starting...`);
if (env.PROGRESS_YAML_PATH) console.log(`   Source: ${env.PROGRESS_YAML_PATH}`);
if (env.PROGRESS_YAML_REPO) console.log(`   Source: ${env.PROGRESS_YAML_REPO}`);
console.log('');

const child = spawn('npx', viteArgs, {
  cwd: visualizerRoot,
  env,
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('Failed to start dev server:', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
