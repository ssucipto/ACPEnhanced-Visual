# npx acp-visualizer Package

<!-- @acp.meta.design
topic: npm-package, npx, distribution, cli, zero-install
description: Ship visualizer as an npm package so users can run npx acp-visualizer without cloning the repo
status: draft
updated: 2026-06-03
@acp.meta.end -->

**Concept**: Distribute the visualizer as an npm package — `npx acp-visualizer` starts the dashboard without cloning  
**Created**: 2026-06-03  

---

## Overview

Currently users must `git clone` the visualizer and `npm install` to use it. This design enables zero-install usage via `npx acp-visualizer` — a single command that downloads, installs, and starts the dashboard pointing at the current project's `progress.yaml`.

---

## Problem Statement

- **Challenge**: Installing the visualizer requires git clone + npm install — friction for first-time users and multi-project setups
- **Why solve**: `npx` is the standard for "try before you clone" in the Node.js ecosystem. A one-command experience dramatically reduces adoption friction
- **Consequences**: Without this, every user must manually clone and maintain the visualizer repo

---

## Solution

### D1: Package as a CLI tool

```bash
# Zero-install usage
npx acp-visualizer

# With explicit path
npx acp-visualizer --path ../acp-enhanced/agent/progress.yaml

# With GitHub repo
npx acp-visualizer --repo ssucipto/acp-enhanced
```

### D2: CLI entry point

Create `bin/acp-visualizer.mjs`:
```javascript
#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const progressPath = args[0] || 'agent/progress.yaml';

const child = spawn('npx', ['vite', 'dev', '--port', '3000', '--open'], {
  cwd: resolve(import.meta.dirname, '..'),
  env: { ...process.env, PROGRESS_YAML_PATH: resolve(progressPath) },
  stdio: 'inherit',
});
```

### D3: package.json bin field

```json
{
  "name": "acp-visualizer",
  "bin": {
    "acp-visualizer": "bin/acp-visualizer.mjs"
  },
  "files": [
    "dist/", "server/", "src/", "public/", "bin/",
    "package.json", "vite.config.ts", "tsconfig.json"
  ]
}
```

### D4: Auto-detect ACP project

When run without arguments, walk up from CWD looking for `agent/progress.yaml`. If found, use it. If not, show:
```
No ACP project found. Run from an ACP project directory or specify:
  npx acp-visualizer --path /path/to/agent/progress.yaml
  npx acp-visualizer --repo owner/repo
```

### D5: CLI flags

| Flag | Description |
|------|-------------|
| `--path <file>` | Local progress.yaml path |
| `--repo <owner/repo>` | GitHub repo (future — M29) |
| `--port <N>` | Port (default: auto-detect) |
| `--no-open` | Don't open browser |
| `--version` | Show version |
| `--help` | Show help |

### D6: npm publish workflow

1. `npm run build` — production build
2. `npm version patch` — bump version
3. `npm publish` — publish to npm registry
4. Tag with `latest` for stable, `next` for pre-releases

---

## Key Decisions

- **`npx` over global install** — zero friction, always latest, no cleanup needed
- **Ships pre-built** — `dist/` included in package so `npx` doesn't need to build
- **Auto-detect CWD** — walk up directories to find `agent/progress.yaml`
- **Same codebase** — the npm package is the same TanStack Start app, just with a CLI entry point

## Trade-offs

- Package size: includes `dist/` (~200KB) + `node_modules/` (npm handles this)
- `npx` caches packages — first run is slow (download), subsequent runs are instant
- Requires Node.js 18+ on user's machine
