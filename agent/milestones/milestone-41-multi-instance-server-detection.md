# Milestone 41: Multi-Instance Server Detection & Open Project Folder

**Milestone**: M41  
**Priority**: P1  
**Status**: planned  
**Estimated**: 1 week  
**Depends On**: M30 (Multi-Project View), M31 (npx CLI), M33 (Server Lifecycle & UX)  

## Goal

Make `npx acp-visualizer` smart: when a visualizer server is already running, attach the new project to it instead of starting a second server. Add a folder picker in the web UI so users can open ACP projects by pointing to a directory — no need to type paths. Keep server lifecycle controls (Stop Server, port visibility) in the Maintenance tab.

## Deliverables

1. **Health endpoint** (`GET /api/health`) — lightweight endpoint returning port, PID, project count, uptime. Used by CLI for instance discovery and by Maintenance UI for status display.
2. **Port file** (`~/.acp-visualizer/port`) — server writes port on startup, removes on graceful shutdown. CLI reads this to find the running instance without port scanning.
3. **Add-project API** (`POST /api/projects`) — CLI calls this on a running instance to register a new project dynamically, without restarting the server.
4. **CLI detect-and-attach flow** — `npx acp-visualizer` checks port file → pings health endpoint → if alive, calls add-project API → opens browser to the new project's tab. If not running, starts server as before.
5. **Folder scanner API** (`POST /api/scan-folder`) — accepts a directory path, walks up looking for `agent/progress.yaml`, returns discovered ACP project files + inferred project name.
6. **UI folder picker** — "Browse folder…" button in `AddProjectDialog` that calls the scanner API and auto-fills the form.
7. **Server Manager enhancements** — Maintenance page shows real-time port, PID, uptime from health endpoint. Stop Server button retained.
8. **Integration tests** — verify CLI detect-and-attach, health endpoint, add-project API, folder scanner. Update README.

## Architecture Notes

```text
┌─────────────────────────────────────────────────────────┐
│  npx acp-visualizer [path]                               │
│    │                                                      │
│    ├─ Read ~/.acp-visualizer/port ─────────┐              │
│    │                                        │              │
│    ├─ GET :port/api/health ◄────────────────┤              │
│    │  ├─ 200 → POST :port/api/projects ────┤ attached!    │
│    │  │       → open browser to new tab     │              │
│    │  └─ fail → start new server (existing) │              │
│    │                                        │              │
│    └─ No port file → start new server ──────┘              │
│                                                           │
│  Web UI AddProjectDialog:                                  │
│    └─ "Browse folder…" → POST /api/scan-folder            │
│       → { progressYamlPath, projectName } → auto-fill     │
└───────────────────────────────────────────────────────────┘
```

## Recommended Workflow

```text
Phase 1 — Foundation (2h): task-227 (health endpoint) + task-228 (port file)
Phase 2 — API (3h): task-229 (add-project API) + task-230 (CLI detect-and-attach)
Phase 3 — UI (2.5h): task-231 (folder scanner API) + task-232 (UI folder picker)
Phase 4 — Polish (1.5h): task-233 (Server Manager enhancements)
Phase 5 — Verify (2h): task-234 (integration tests + docs)
```

Total: ~11h ≈ 1 week

## Shared Definition of Done

All tasks in this milestone are considered complete when:

- [ ] TS 0 errors (`npx tsc --noEmit` clean)
- [ ] All existing tests pass (`npx vitest run`)
- [ ] Build succeeds (`npx vite build`)
- [ ] `npx acp-visualizer` detects running instance and attaches (manual test with two terminals)
- [ ] `npx acp-visualizer` starts fresh server when no instance running (manual test)
- [ ] Folder picker in AddProjectDialog auto-discovers ACP project from selected directory
- [ ] Stop Server button still works and cleans up port file
- [ ] Maintenance page shows live port, PID, uptime from health endpoint
