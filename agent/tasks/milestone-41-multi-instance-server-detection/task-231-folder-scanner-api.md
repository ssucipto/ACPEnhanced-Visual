---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 231: Folder Scanner API

<!-- @acp.meta.task
topic: api, folder-scanner, auto-detect, filesystem
description: Add POST /api/scan-folder server function that walks up a directory tree to auto-discover ACP project files
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 1.5 hours  

---

## Objective

Create a `POST /api/scan-folder` server function that accepts a directory path, walks up from it looking for `agent/progress.yaml` (and other ACP files), and returns what it found — including an inferred project name.

---

## Context

The `AddProjectDialog` currently requires users to manually type the full path to `agent/progress.yaml`. This is error-prone and unfriendly. A folder scanner API lets the UI offer a "Browse folder…" experience: user picks a project folder, the server scans it, auto-discovers the ACP project structure, and auto-fills the form.

The scanner walks **up** from the given path (mimicking the CLI's `findProgressYaml` logic) because users might point to a subdirectory within an ACP project.

---

## Steps

### 1. Create the scanner server function

Create `server/routes/api/scan-folder.ts`:

```typescript
// server/routes/api/scan-folder.ts
import { createServerFn } from '@tanstack/react-start';
import { resolve, dirname, basename } from 'node:path';
import { existsSync, statSync, readdirSync } from 'node:fs';

interface ScanFolderPayload {
  path: string;
}

interface ScanFolderResponse {
  found: boolean;
  progressYamlPath?: string;
  projectName?: string;
  acpFiles?: string[];
  error?: string;
}

/** ACP files we look for to confirm it's an ACP project */
const ACP_INDICATOR_FILES = [
  'agent/progress.yaml',
  'agent/manifest.yaml',
  'agent/package.yaml',
  'agent/commands/',
  'agent/milestones/',
  'agent/tasks/',
];

function isRoot(dir: string): boolean {
  return dir === resolve(dir, '..');
}

export const scanFolder = createServerFn({ method: 'POST' })
  .validator((data: unknown): ScanFolderPayload => {
    if (!data || typeof data !== 'object') throw new Error('Invalid payload');
    const d = data as Record<string, unknown>;
    if (typeof d.path !== 'string' || !d.path.trim()) throw new Error('path is required');
    return { path: d.path };
  })
  .handler(async ({ data }): Promise<ScanFolderResponse> => {
    let dir = resolve(data.path);

    // Validate the directory exists
    try {
      const st = statSync(dir);
      if (!st.isDirectory()) {
        dir = dirname(dir); // user might have pointed to a file
      }
    } catch {
      return { found: false, error: `Directory not found: ${data.path}` };
    }

    // Walk up looking for agent/progress.yaml
    let foundDir: string | null = null;
    let currentDir = dir;

    while (!isRoot(currentDir)) {
      const progressYaml = resolve(currentDir, 'agent/progress.yaml');
      if (existsSync(progressYaml)) {
        try {
          statSync(progressYaml);
          foundDir = currentDir;
          break;
        } catch { /* continue */ }
      }
      const parent = resolve(currentDir, '..');
      if (parent === currentDir) break;
      currentDir = parent;
    }

    if (!foundDir) {
      return {
        found: false,
        error: 'No ACP project found. Walked up from the given path but no agent/progress.yaml was discovered.',
      };
    }

    // Collect ACP indicator files present
    const acpFiles: string[] = [];
    for (const indicator of ACP_INDICATOR_FILES) {
      const fullPath = resolve(foundDir, indicator);
      try {
        if (existsSync(fullPath)) {
          acpFiles.push(indicator);
        }
      } catch { /* skip */ }
    }

    // Infer project name from directory name or progress.yaml
    const projectName = basename(foundDir);

    return {
      found: true,
      progressYamlPath: resolve(foundDir, 'agent/progress.yaml'),
      projectName,
      acpFiles,
    };
  });
```

### 2. Add security: path traversal prevention

Ensure the path doesn't escape reasonable bounds:

```typescript
// Validate the resolved path is absolute and sane
if (!resolvedPath.startsWith('/')) {
  return { found: false, error: 'Absolute path required.' };
}

// Prevent scanning system directories
const forbidden = ['/etc', '/sys', '/proc', '/dev'];
if (forbidden.some(f => resolvedPath.startsWith(f))) {
  return { found: false, error: 'Cannot scan system directories.' };
}
```

### 3. Test manually

```bash
curl -X POST http://localhost:3000/api/scan-folder \
  -H "Content-Type: application/json" \
  -d '{"path":"/Users/suryosucipto/Project/ACPEnhanced/ACPEnhanced-Visual"}'

# Expected: {"found":true,"progressYamlPath":"/Users/.../agent/progress.yaml","projectName":"ACPEnhanced-Visual","acpFiles":["agent/progress.yaml","agent/manifest.yaml",...]}
```

---

## Verification Checklist

- [ ] Scanning a valid ACP project folder returns `found: true` with `progressYamlPath`
- [ ] Scanning a subdirectory of an ACP project still finds the root (walks up)
- [ ] Scanning a non-ACP directory returns `found: false` with error message
- [ ] Scanning a non-existent path returns `found: false`
- [ ] `projectName` is inferred from the project root directory name
- [ ] `acpFiles` lists discovered ACP indicator files
- [ ] Path traversal to system directories is blocked
- [ ] TS 0 errors (`npx tsc --noEmit`)
