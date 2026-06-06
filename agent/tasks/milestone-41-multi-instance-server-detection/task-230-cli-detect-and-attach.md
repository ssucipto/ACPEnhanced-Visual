---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 230: CLI Detect-and-Attach Flow

<!-- @acp.meta.task
topic: cli, detect, attach, instance, npx
description: Enhance npx acp-visualizer to detect running instance via port file + health endpoint, attach projects instead of spawning new servers
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 3 hours  
**Audit Fixes**: audit-34-F3 (cross-platform browser open), audit-34-F7 (project name from progress.yaml), audit-34-F9 (--status flag)

---

## Objective

Enhance `bin/acp-visualizer.mjs` so that when invoked, it first checks for a running instance via the port file. If found (PID alive check first, then health ping), it attaches the new project via the add-project API and opens the browser to that tab. If no instance is running, it starts a new server as before. Works on **macOS, Linux, and Windows**.

---

## Context

The current CLI always spawns `npx vite dev`. With the health endpoint (task-227), port file with PID (task-228), and add-project API (task-229) in place, the CLI can now be smart:

1. Read `~/.acp-visualizer/port` → get `{port, pid, started}`
2. Check `isPidAlive(pid)` — instant, no network
3. If PID alive → `POST /api/projects` → open browser to `tabUrl`
4. If PID dead → clean up stale port file → start new server
5. If no port file → start new server (existing flow)

**Audit-34 finding (H4)**: The original plan used `execSync('open "..."')` which is macOS-only. Must detect `process.platform` and use `open` (macOS), `xdg-open` (Linux), or `start` (Windows).

**Audit-34 finding (M4)**: Project name should be read from the target progress.yaml's `project.name` field, not inferred from directory structure. Fall back to directory name if YAML is unreadable.

**Audit-34 finding (L2)**: Add `--status` flag so users can see what's running without opening a browser.

---

## Steps

### 1. Add cross-platform browser open helper

```javascript
import { execSync } from 'node:child_process';

function openBrowser(url) {
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore', shell: true });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
  } catch {
    console.error(`⚠ Could not open browser. Visit: ${url}`);
  }
}
```

### 2. Add project name resolver from progress.yaml

```javascript
import { readFileSync, existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';

function resolveProjectName(progressYamlPath) {
  // Try reading project.name from progress.yaml
  try {
    if (existsSync(progressYamlPath)) {
      const content = readFileSync(progressYamlPath, 'utf-8');
      const match = content.match(/^\s*name:\s*(.+)$/m);
      if (match) return match[1].trim().replace(/['"]/g, '');
    }
  } catch { /* fall through */ }
  // Fallback: directory name of project root (2 levels up from agent/progress.yaml)
  return basename(dirname(dirname(progressYamlPath)));
}
```

### 3. Add --status flag

```javascript
// Parse --status flag
case '--status':
  flags.status = true;
  break;
```

### 4. Rewrite main flow with PID check + cross-platform open

```javascript
// ── Main: Detect → Attach or Spawn ──────────────────────────────

import { readPortFile, isPidAlive, removePortFile } from '../server/lib/port-file.js';

// --status: show running instance info without attaching
if (flags.status) {
  const portData = readPortFile();
  if (portData && isPidAlive(portData.pid)) {
    const health = await checkHealth(portData.port);
    if (health && health.status === 'ok') {
      console.log(`✅ Visualizer server running on port ${portData.port}`);
      console.log(`   PID: ${portData.pid}`);
      console.log(`   Started: ${portData.started}`);
      console.log(`   Projects: ${health.projectCount}`);
      console.log(`   Uptime: ${Math.floor(health.uptime / 60)}m ${health.uptime % 60}s`);
      process.exit(0);
    }
  }
  console.log('No visualizer server running.');
  process.exit(0);
}

const portData = readPortFile();

if (portData && isPidAlive(portData.pid)) {
  const health = await checkHealth(portData.port);
  if (health && health.status === 'ok') {
    const projectConfig = buildProjectConfig(flags, detectedProgressYaml);
    const result = await attachProject(portData.port, projectConfig);

    if (result.success) {
      console.log(`📎 Attached to running instance on port ${portData.port}`);
      console.log(`   Project: ${projectConfig.name}`);
      if (!flags.noOpen) {
        const tabUrl = `http://localhost:${portData.port}${result.tabUrl || '/'}`;
        openBrowser(tabUrl);
      }
      process.exit(0);
    } else {
      console.error(`❌ Failed to attach: ${result.message}`);
      process.exit(1);
    }
  }
  // PID alive but health failed — server may be starting up. Clean up and start fresh.
  console.log('⚠ Server PID exists but health check failed, cleaning up stale port file...');
  removePortFile();
} else if (portData && !isPidAlive(portData.pid)) {
  console.log('⚠ Stale port file found (PID not running), starting new server...');
  removePortFile();
}

// No running instance — start new server (existing flow)
console.log('🚀 Starting new server...');
spawn('npx', viteArgs, { cwd: visualizerRoot, env, stdio: 'inherit' });
```

### 4. Update help text

Add a note to `--help` output:

**When a visualizer server is already running, acp-visualizer
attaches the new project to the existing instance instead of
starting a second server. The port file at ~/.acp-visualizer/port
is used for discovery.**

---

## Verification Checklist

- [ ] `npx acp-visualizer --path /some/project` attaches to running instance
- [ ] Browser opens to the new project's tab (e.g., `/?tab=project-name`)
- [ ] Project appears in the web UI tab bar
- [ ] `npx acp-visualizer` starts fresh server when no instance running
- [ ] Stale port file (server crashed) is cleaned up and new server started
- [ ] Duplicate project name returns error from CLI
- [ ] `--no-open` flag still respected in attach mode
- [ ] TS 0 errors, lint clean
