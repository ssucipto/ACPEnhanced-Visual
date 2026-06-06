---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 228: Port File Management

<!-- @acp.meta.task
topic: server, port-file, lifecycle, instance-discovery
description: Write ~/.acp-visualizer/port on server startup, remove on shutdown, for CLI instance discovery
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 1.5 hours  
**Audit Fixes**: audit-34-F10 (PID + timestamp in port file for stale detection without health ping)

---

## Objective

The server writes its port, PID, and start timestamp as JSON to `~/.acp-visualizer/port` on startup and removes it on graceful shutdown. The CLI reads this file to find the running instance and can detect stale files by checking if the PID is still alive (`process.kill(pid, 0)`) without needing a health ping.

---

## Context

Port scanning (trying 3000, 3001, 3002…) is slow, noisy, and unreliable. A port file in a predictable location is a standard Unix pattern (like `.pid` files). The file lives at `~/.acp-visualizer/port`.

**Audit-34 finding (L3)**: The original plan stored only a port number. Including PID and timestamp enables the CLI to detect stale files instantly by checking `process.kill(pid, 0)` — no HTTP health ping needed for the common case of a crashed server. On Windows, `process.kill(pid, 0)` also works (sends no signal, just checks existence).

The server must clean up this file on shutdown — both graceful (Stop Server button → `/api/shutdown`) and on process exit (SIGTERM, SIGINT). On Windows, listen for `exit` event as SIGTERM is not supported.

---

## Steps

### 1. Create port file utility with JSON format

Create `server/lib/port-file.ts`:

```typescript
// server/lib/port-file.ts
import { homedir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, readFileSync } from 'node:fs';

const PORT_DIR = join(homedir(), '.acp-visualizer');
const PORT_FILE = join(PORT_DIR, 'port');

interface PortData {
  port: number;
  pid: number;
  started: string; // ISO 8601
}

export function writePortFile(port: number): void {
  if (!existsSync(PORT_DIR)) {
    mkdirSync(PORT_DIR, { recursive: true });
  }
  const data: PortData = {
    port,
    pid: process.pid,
    started: new Date().toISOString(),
  };
  writeFileSync(PORT_FILE, JSON.stringify(data) + '\n', 'utf-8');
}

export function removePortFile(): void {
  try {
    if (existsSync(PORT_FILE)) {
      unlinkSync(PORT_FILE);
    }
  } catch {
    // Best-effort cleanup — ignore errors
  }
}

export function readPortFile(): PortData | null {
  try {
    if (existsSync(PORT_FILE)) {
      const raw = readFileSync(PORT_FILE, 'utf-8').trim();
      const data = JSON.parse(raw) as PortData;
      if (typeof data.port === 'number' && typeof data.pid === 'number') {
        return data;
      }
    }
  } catch {
    // Ignore parse/read errors
  }
  return null;
}

/** Check if a PID is alive without a health ping. Works on Windows too. */
export function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0); // signal 0 = just check existence, no signal sent
    return true;
  } catch {
    return false;
  }
}
```

### 2. Integrate with server startup

In the Vite config or entry point, after the server starts and the port is known, call `writePortFile(port)`.

For Vite dev server, hook into the `configureServer` plugin in `vite.config.ts`:

```typescript
// vite.config.ts addition
import { writePortFile, removePortFile } from './server/lib/port-file';

// In configureServer:
configureServer(server) {
  server.httpServer?.once('listening', () => {
    const address = server.httpServer?.address();
    const port = typeof address === 'object' && address ? address.port : 3000;
    writePortFile(port);
  });
}
```

### 3. Clean up on shutdown

Register cleanup handlers:

```typescript
// In shutdown handler (server lifecycle)
process.on('SIGTERM', () => { removePortFile(); process.exit(0); });
process.on('SIGINT', () => { removePortFile(); process.exit(0); });
process.on('beforeExit', () => { removePortFile(); });
```

And in the existing `/api/shutdown` handler (from M33), call `removePortFile()` before killing the server.

### 4. Update Stop Server button flow

Ensure the shutdown API endpoint calls `removePortFile()` so clicking Stop Server in the UI cleans up properly.

---

## Verification Checklist

- [ ] `~/.acp-visualizer/port` created on server start with correct port number
- [ ] File removed on Stop Server button click
- [ ] File removed on Ctrl+C (SIGINT)
- [ ] File removed on `kill <pid>` (SIGTERM)
- [ ] `readPortFile()` returns `null` when no file exists
- [ ] `readPortFile()` returns correct port when file exists
- [ ] Directory `~/.acp-visualizer/` created if it doesn't exist
- [ ] TS 0 errors (`npx tsc --noEmit`)
