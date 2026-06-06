---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 234: Integration Tests & Documentation

<!-- @acp.meta.task
topic: tests, integration, docs, cli, api
description: Integration tests for CLI detect-and-attach, health endpoint, add-project API, folder scanner; update README
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 2.5 hours  
**Audit Fixes**: Cross-platform test cases, health endpoint alignment, CLI cross-platform open

---

## Objective

Write integration tests for the new server endpoints and CLI behavior, including **cross-platform path handling**. Update the README with the new `npx acp-visualizer` attach workflow, folder picker feature, and cross-platform support notes.

---

## Context

The new features span CLI, server API, and UI. Integration tests ensure the pieces work together: health endpoint returns correct data (aligned with getServerInfo), add-project API validates and persists, folder scanner discovers ACP projects on all platforms, and the CLI correctly detects and attaches to running instances with cross-platform browser opening.

**Cross-platform testing**: The folder scanner's path validation must work on Windows paths (C:\, \\wsl$\). Test with both Unix-style and Windows-style paths using `path.isAbsolute()`.

**Health endpoint alignment**: Verify that `GET /api/health` returns the same port, pid, projectCount as `getServerInfo()`.

---

## Steps

### 1. Server function tests

Add to `test/server-fns/` or create `test/server/health.test.ts`, `test/server/scan-folder.test.ts`, `test/server/add-project.test.ts`:

**Health endpoint test** (`test/server/health.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';

describe('GET /api/health', () => {
  it('returns ok status with server info', async () => {
    // Verify shape: { status, port, pid, projectCount, uptime, version }
  });

  it('returns increasing uptime on subsequent calls', async () => {
    // Two calls spaced apart → uptime increases
  });

  it('aligns with getServerInfo data', async () => {
    // health.port === getServerInfo.port
    // health.pid === getServerInfo.pid
    // health.projectCount === getServerInfo.projectCount
  });
});
```

**Scan folder test** (`test/server/scan-folder.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { isAbsolute, join } from 'node:path';

describe('POST /api/scan-folder', () => {
  it('finds ACP project from project root', async () => {
    // Point to this project's own directory → found: true
  });

  it('finds ACP project from subdirectory', async () => {
    // Point to src/components/ → walks up → found: true
  });

  it('returns not found for non-ACP directory', async () => {
    // Point to /tmp → found: false
  });

  it('rejects system directories on Unix', async () => {
    if (process.platform !== 'win32') {
      // /etc, /sys, /proc, /dev → found: false with error
    }
  });

  it('rejects system directories on Windows', async () => {
    if (process.platform === 'win32') {
      // C:\\Windows, C:\\Program Files → found: false with error
    }
  });

  it('accepts absolute Windows paths', () => {
    // path.isAbsolute('C:\\Users\\me\\project') → true
    expect(isAbsolute('C:\\Users\\me\\project')).toBe(true);
  });

  it('accepts absolute Unix paths', () => {
    expect(isAbsolute('/Users/me/project')).toBe(true);
  });

  it('caps walk-up at 10 levels', async () => {
    // Point 11 levels deep → found: false with depth error
  });
});
```

**Add-project API test** (`test/server/add-project.test.ts`):

```typescript
describe('POST /api/projects', () => {
  it('adds a valid project', async () => { /* ... */ });
  it('rejects duplicate project name', async () => { /* ... */ });
  it('rejects missing name', async () => { /* ... */ });
  it('rejects invalid source type', async () => { /* ... */ });
});
```

### 2. CLI integration test

Add to `test/cli-e2e.test.ts` (or create new):

```typescript
describe('CLI detect-and-attach', () => {
  it('detects running instance via port file', async () => {
    // Write a port file, mock health endpoint response
  });

  it('starts new server when no port file', async () => {
    // No port file → spawns vite
  });

  it('cleans up stale port file and starts fresh', async () => {
    // Port file exists but health fails → cleanup + start
  });
});
```

### 3. Update README

Update `README.md` with:

- New "Attaching to a Running Instance" section describing the detect-and-attach flow
- Folder picker screenshot/description in the "Adding Projects" section
- Updated `npx acp-visualizer --help` output
- Note about `~/.acp-visualizer/port` file

### 4. Update CLI help text

In `bin/acp-visualizer.mjs`, update the `--help` output to mention attach behavior:

```text
When a visualizer server is already running on this machine,
projects are attached to the existing instance instead of
starting a new server. The port file at ~/.acp-visualizer/port
is used for automatic discovery.
```

## Verification Checklist

- [ ] Health endpoint test passes
- [ ] Scan folder test passes (valid project, subdirectory, non-ACP, system dirs)
- [ ] Add-project API test passes (valid, duplicate, invalid)
- [ ] CLI integration test passes (detect, attach, fresh start, stale cleanup)
- [ ] All existing tests still pass (`npx vitest run`)
- [ ] README updated with attach workflow + folder picker docs
- [ ] CLI `--help` mentions attach behavior
- [ ] TS 0 errors (`npx tsc --noEmit`)
