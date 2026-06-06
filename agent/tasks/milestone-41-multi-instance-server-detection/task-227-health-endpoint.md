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
**Estimated Time**: 1 hour  

---

## Objective

Add a lightweight `GET /api/health` endpoint that returns server status information. This endpoint serves two purposes: (1) the CLI uses it to discover whether a visualizer server is already running, and (2) the Maintenance UI uses it to display live server info (port, PID, uptime).

---

## Context

Currently there is no way for the CLI (`bin/acp-visualizer.mjs`) to know if a server is already running on a port. The CLI always spawns a new Vite dev server. By adding a health endpoint, the CLI can ping `http://localhost:{port}/api/health` to determine if a server is alive before deciding whether to attach or start fresh.

The endpoint should be lightweight — no heavy computation, no disk I/O beyond reading the current project count.

---

## Steps

### 1. Create the health server function

Create `server/routes/api/health.ts` with a TanStack Start server function:

```typescript
// server/routes/api/health.ts
import { createServerFn } from '@tanstack/react-start'

export interface HealthResponse {
  status: 'ok';
  port: number;
  pid: number;
  projectCount: number;
  uptime: number; // seconds since server start
  version: string;
}

const SERVER_START_TIME = Date.now();

export const fetchHealth = createServerFn({ method: 'GET' })
  .validator((data: unknown) => data as {})
  .handler(async () => {
    const health: HealthResponse = {
      status: 'ok',
      port: parseInt(process.env.PORT || '3000', 10),
      pid: process.pid,
      projectCount: 0, // populated from projects-config
      uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      version: '1.5.3', // read from package.json or hardcoded
    };

    // Load current project count from config store
    try {
      const { loadProjectConfigs } = await import('./projects-config');
      const { projects } = await loadProjectConfigs({ data: {} });
      health.projectCount = projects.length;
    } catch {
      // If projects-config isn't available yet, default to 0
    }

    return health;
  });
```

### 2. Register as a route

Ensure the file is under `server/routes/api/` so TanStack Start picks it up automatically as an API route, or add it to the route tree if needed.

### 3. Verify

```bash
# Start the dev server, then:
curl http://localhost:3000/api/health
# Expected: {"status":"ok","port":3000,"pid":12345,"projectCount":1,"uptime":5,"version":"1.5.3"}
```

---

## Verification Checklist

- [ ] `GET /api/health` returns 200 with valid JSON
- [ ] `port` matches the actual server port
- [ ] `pid` is a positive integer (the node process)
- [ ] `projectCount` reflects the number of configured projects
- [ ] `uptime` increases on subsequent calls
- [ ] Endpoint responds in <10ms (lightweight)
- [ ] TS 0 errors (`npx tsc --noEmit`)
