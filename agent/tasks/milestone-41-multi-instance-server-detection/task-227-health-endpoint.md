---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 227: Health Endpoint

<!-- @acp.meta.task
topic: server, health, api, instance-discovery
description: Add GET /api/health endpoint returning port, pid, projectCount, uptime for CLI instance discovery and maintenance UI
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 1.5 hours  

---

## Objective

Extend the existing `getServerInfo()` in `server/routes/api/shutdown.ts` to return full health data (PID, uptime, projectCount) and expose it as `GET /api/health`. Do NOT create a parallel API — extend what already exists.

---

## Context

The codebase already has `getServerInfo()` (`server/routes/api/shutdown.ts:19`) which returns `{ port, dataSource, sourceType }`. Instead of creating a separate health endpoint that duplicates this, extend `getServerInfo()` to include PID, uptime, projectCount, and version. The new `fetchHealth()` server function in a `health.ts` file delegates to the extended `getServerInfo()` so the CLI and Maintenance UI have a single source of truth for server status.

This avoids the API fragmentation identified in audit-34 (finding M1).

---

## Steps

### 1. Extend existing `getServerInfo()` with health fields

In `server/routes/api/shutdown.ts`, extend the `getServerInfo` handler to return additional health fields:

```typescript
// Add to server/routes/api/shutdown.ts — extend getServerInfo:

const SERVER_START_TIME = Date.now();

export const getServerInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const dataSource = process.env['PROGRESS_YAML_PATH'] || process.env['PROGRESS_YAML_REPO'] || 'unknown';
    const sourceType = process.env['PROGRESS_YAML_REPO'] ? 'github' : 'local';
    
    // Load project count from config store
    let projectCount = 0;
    try {
      const { loadProjectConfigs } = await import('./projects-config');
      const { projects } = await loadProjectConfigs({ data: {} });
      projectCount = projects.length;
    } catch { /* default 0 */ }

    return {
      port: process.env['PORT'] || '3000',
      dataSource,
      sourceType: sourceType as 'local' | 'github',
      // NEW health fields:
      pid: process.pid,
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      projectCount,
      version: '1.5.3', // or read from package.json
    };
  });
```

### 2. Create thin health endpoint delegating to getServerInfo

Create `server/routes/api/health.ts`:

```typescript
// server/routes/api/health.ts
import { createServerFn } from '@tanstack/react-start';

export interface HealthResponse {
  status: 'ok';
  port: number;
  pid: number;
  projectCount: number;
  uptime: number;
  version: string;
}

export const fetchHealth = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Delegate to the extended getServerInfo
    const { getServerInfo } = await import('./shutdown');
    const info = await getServerInfo({ data: {} });
    
    return {
      status: 'ok' as const,
      port: parseInt(info.port || '3000', 10),
      pid: info.pid,
      projectCount: info.projectCount,
      uptime: info.uptime,
      version: info.version,
    };
  });
```

This keeps `getServerInfo()` as the single source of truth. `fetchHealth()` is a thin wrapper that returns a standardized `{ status: 'ok', ... }` shape for CLI consumption.

### 3. Verify

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"ok","port":3000,"pid":12345,"projectCount":1,"uptime":5,"version":"1.5.3"}
```

Also verify `getServerInfo` is backward-compatible — existing callers (`ServerControls.tsx`) still work with the extended response.

---

## Verification Checklist

- [ ] `GET /api/health` returns 200 with valid JSON
- [ ] `port` matches the actual server port
- [ ] `pid` is a positive integer (the node process)
- [ ] `projectCount` reflects the number of configured projects
- [ ] `uptime` increases on subsequent calls
- [ ] Endpoint responds in <10ms (lightweight)
- [ ] TS 0 errors (`npx tsc --noEmit`)
