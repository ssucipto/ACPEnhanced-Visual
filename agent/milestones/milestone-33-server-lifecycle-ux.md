---
created: 2026-06-03
completed:
---

# Milestone 33: Server Lifecycle & UX

**Goal**: Give users full control over the visualizer server from the browser — start, see port, stop — eliminating orphaned servers and making resource management transparent  
**Duration**: ~3 hours  

---

## Overview

Audit-8 findings C1, C2: The visualizer has no server lifecycle management. Each `npm run visualize` starts a server on an auto-detected port, but there's no way to stop it from the browser. Closing the tab leaves the server running. Over multiple sessions, orphaned servers accumulate on sequential ports.

This milestone adds:
- A `/api/shutdown` endpoint that gracefully terminates the server
- A "Stop Server" button in the dashboard header
- Port number and data source display in the header bar
- Auto-shutdown via `beforeunload` when the tab is closed
- A port conflict resolution report when `find-port.mjs` skips busy ports

---

## Deliverables

### 1. Shutdown Endpoint
- `POST /api/shutdown` server function using `process.exit(0)`
- Delayed exit to allow HTTP response to complete
- Returns `{ ok: true }` before shutting down

### 2. Stop Server Button
- Red "⏹ Stop Server" button in the ProjectHeader
- Calls `/api/shutdown` on click
- Transitions to "Server stopped · Close this tab" after shutdown

### 3. Port & Source Display
- Header shows: `🚀 · :3001 · ../acp-enhanced/agent/progress.yaml`
- Auto-detects port from `window.location.port`
- Shows data source type (local path or GitHub repo)

### 4. Auto-Shutdown on Tab Close
- `beforeunload` event listener with `navigator.sendBeacon('/api/shutdown')`
- Best-effort cleanup — no guarantee if browser crashes

### 5. Port Conflict Report
- `find-port.mjs` reports WHY a port was skipped
- Example output: `Port 3000: busy (acp-visualizer PID 12345)` or `Port 3000: busy (unknown process)`

---

## Tasks

| Task | Description | Est. |
|------|-------------|------|
| 184 | Shutdown endpoint `/api/shutdown` | 0.5h |
| 185 | Stop Server button in ProjectHeader | 0.5h |
| 186 | Port + data source display in header | 0.5h |
| 187 | Auto-shutdown on tab close + port conflict report | 1h |

## Success Criteria

- [ ] Clicking "Stop Server" terminates the process and frees the port
- [ ] Header displays current port and data source path
- [ ] `beforeunload` sends shutdown beacon when tab is closed
- [ ] `find-port.mjs` reports which process occupies each busy port
- [ ] No orphaned servers after normal usage workflow
- [ ] Works with both local and GitHub data sources
