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
**Estimated Time**: 2 hours  

---

## Objective

Enhance `bin/acp-visualizer.mjs` so that when invoked, it first checks for a running instance. If found, it attaches the new project via the add-project API and opens the browser to that tab. If no instance is running, it starts a new server as before.

---

## Context

The current CLI always spawns `npx vite dev`. With the health endpoint (task-227), port file (task-228), and add-project API (task-229) in place, the CLI can now be smart:

1. Read `~/.acp-visualizer/port`
2. Ping `GET http://localhost:{port}/api/health`
3. If alive → `POST http://localhost:{port}/api/projects` with the project config → open browser to the returned `tabUrl`
4. If not alive or no port file → start new server (existing flow)

This makes `npx acp-visualizer` feel instant when a server is already running.

---

## Steps

### 1. Add health-check helper

In `bin/acp-visualizer.mjs`, add:

```javascript
import { readPortFile } from '../server/lib/port-file.js';

async function checkHealth(port) {
  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function attachProject(port, config) {
  try {
    const res = await fetch(`http://localhost:${port}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}
```

### 2. Resolve project config for attach

From the CLI flags (`--path`, `--repo`, or auto-detected), build a project config object:

```javascript
function buildProjectConfig(flags, detectedPath) {
  const name = flags.repo
    ? flags.repo.split('/').pop()
    : (detectedPath ? path.basename(path.dirname(path.dirname(detectedPath))) : 'unnamed');

  return {
    name,
    source: flags.repo ? 'github' : 'local',
    path: flags.repo ? undefined : (flags.path || detectedPath),
    repo: flags.repo || undefined,
  };
}
```

### 3. Rewrite main flow

Replace the current "always spawn vite" logic with detect-then-attach-or-spawn:

```javascript
// ── Main: Detect → Attach or Spawn ──────────────────────────────

const portFile = readPortFile();

if (portFile) {
  const health = await checkHealth(portFile);
  if (health && health.status === 'ok') {
    // Server is alive — attach project
    const projectConfig = buildProjectConfig(flags, detectedProgressYaml);
    const result = await attachProject(portFile, projectConfig);

    if (result.success) {
      console.log(`📎 Attached to running instance on port ${portFile}`);
      console.log(`   Project: ${projectConfig.name}`);
      // Open browser to the new project's tab
      const tabUrl = `http://localhost:${portFile}${result.tabUrl || '/'}`;
      const { execSync } = await import('node:child_process');
      if (!flags.noOpen) {
        execSync(`open "${tabUrl}"`, { stdio: 'ignore' });
      }
      process.exit(0);
    } else {
      console.error(`❌ Failed to attach: ${result.message}`);
      console.error(`   Server is running on port ${portFile} but rejected the project.`);
      process.exit(1);
    }
  } else {
    // Port file exists but server is dead — clean up and start fresh
    console.log('⚠ Stale port file found, starting new server...');
    const { removePortFile } = await import('../server/lib/port-file.js');
    removePortFile();
  }
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
