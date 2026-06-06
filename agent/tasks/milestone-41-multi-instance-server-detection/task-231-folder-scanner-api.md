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
**Estimated Time**: 2.5 hours  
**Audit Fixes**: audit-34-F1 (depth limit on walk-up), audit-34-F2 (Windows path.isAbsolute), audit-34-F3 (Windows forbidden dirs)

---

## Objective

Create a `POST /api/scan-folder` server function that accepts a directory path, walks up from it (capped at 10 levels) looking for `agent/progress.yaml` (and other ACP files), and returns what it found. Works on **macOS, Linux, and Windows**.

---

## Context

The `AddProjectDialog` currently requires users to manually type the full path to `agent/progress.yaml`. This is error-prone and unfriendly. A folder scanner API lets the UI offer a "Browse folder…" experience: user picks a project folder, the server scans it, auto-discovers the ACP project structure, and auto-fills the form.

**Audit-34 finding (H1)**: The walk-up loop had no depth limit. An attacker could scan to the filesystem root. Cap at 10 directory levels.

**Audit-34 finding (H2)**: `!resolvedPath.startsWith('/')` rejects all Windows paths (C:\, \\wsl$\). Use `path.isAbsolute()` instead.

**Audit-34 finding (H3)**: Forbidden directories list was Linux-only. Add Windows system dirs and use an allowlist approach where possible.

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

    // Walk up looking for agent/progress.yaml (capped at 10 levels — audit-34-F1)
    const MAX_DEPTH = 10;
    let foundDir: string | null = null;
    let currentDir = dir;
    let depth = 0;

    while (depth < MAX_DEPTH && !isRoot(currentDir)) {
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
      depth++;
    }

    if (!foundDir && depth >= MAX_DEPTH) {
      return {
        found: false,
        error: `Reached maximum scan depth (${MAX_DEPTH} levels). No ACP project found.`,
      };
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

### 2. Add cross-platform security validation

Replace the Linux-only check with cross-platform path validation (audit-34-F2, F3):

```typescript
import { isAbsolute } from 'node:path';
import { homedir } from 'node:os';

function validateScanPath(resolvedPath: string): string | null {
  // Must be an absolute path (works on Windows: C:\, \\wsl$\; macOS/Linux: /)
  if (!isAbsolute(resolvedPath)) {
    return 'Absolute path required.';
  }

  // Block system directories (cross-platform)
  const platform = process.platform;
  const forbiddenPrefixes: string[] = [];

  if (platform === 'win32') {
    forbiddenPrefixes.push(
      'C:\\Windows',
      'C:\\Windows\\System32',
      'C:\\Program Files',
      'C:\\Program Files (x86)',
    );
  } else {
    forbiddenPrefixes.push(
      '/etc',
      '/sys',
      '/proc',
      '/dev',
      '/bin',
      '/sbin',
      '/usr/bin',
      '/usr/sbin',
      '/System',
      '/Library/System',
    );
  }

  const normalized = resolvedPath.toLowerCase();
  if (forbiddenPrefixes.some(prefix => normalized.startsWith(prefix.toLowerCase()))) {
    return 'Cannot scan system directories.';
  }

  // Recommend scanning within home directory for safety
  const home = homedir();
  if (!normalized.startsWith(home.toLowerCase())) {
    // Not blocking — just a soft warning in the response
    // User may have projects on external drives, etc.
  }

  return null; // Path is valid
}
```

Use `validateScanPath(resolvedPath)` early in the handler — if it returns an error string, return `{ found: false, error }`.

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
