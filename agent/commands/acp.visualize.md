# Command: visualize

> **🤖 Agent Directive**: If you are reading this file, the command `/acp-visualize` has been invoked.
> Follow the steps below to launch the ACP Progress Visualizer.

**Namespace**: acp  
**Version**: 1.0.0  
**Created**: 2026-05-06  
**Last Updated**: 2026-06-03  
**Status**: Active  
**Requires**: agent-context-protocol-visualizer repository cloned locally

---

**Purpose**: Launch the ACP Progress Visualizer dashboard for the current project  
**Category**: Workflow  
**Frequency**: As Needed  

---

## What This Command Does

Launches the TanStack Start development server for `agent-context-protocol-visualizer`
and opens the browser dashboard pointed at the current project's `progress.yaml`.

---

## Prerequisites

- [ ] `agent-context-protocol-visualizer` cloned locally
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install` in visualizer directory)

---

## Steps

### 1. Locate the visualizer repository

Check for the visualizer in these locations (in order):
1. `VISUALIZER_PATH` environment variable (if set)
2. `~/.acp/visualizer/` (default global install path)
3. Sibling directory: `../agent-context-protocol-visualizer/`
4. Current user's `~/code/agent-context-protocol-visualizer/`

If not found, display:
```
⚠️  Visualizer not found. Install it:
  git clone https://github.com/ssucipto/agent-context-protocol-visualizer ~/.acp/visualizer
  cd ~/.acp/visualizer && npm install
```

### 2. Resolve progress.yaml path

Use the current project's `progress.yaml`:
```
PROGRESS_YAML_PATH = <cwd>/agent/progress.yaml
```

Verify the file exists before launching.

### 3. Launch with auto port detection

The visualizer auto-detects available ports starting from 3000. Multiple projects
can run simultaneously — each gets its own port (3000, 3001, 3002, etc.).

```bash
cd <visualizer-path>
PROGRESS_YAML_PATH=<cwd>/agent/progress.yaml npm run visualize
```

The found port is written to `.visualizer-port` in the visualizer directory.

### 4. Open the browser

The `npm run visualize` script uses `vite --open` to auto-open the browser at
the correct port. No manual port resolution needed.

### 5. Report

Display:
```
✅ ACP Progress Visualizer launched
   Dashboard: http://localhost:<port>
   Data: <resolved progress.yaml path>
   Auto-refresh: enabled (2s polling)
   Multi-project: supported (port auto-detection)

   Press Ctrl+C to stop.
```

---

## Arguments

| Argument | Description |
|----------|-------------|
| `--path <file>` | Use a specific progress.yaml path instead of current project |
| `--port <N>` | Run dev server on a different port (default: 3000) |
| `--no-open` | Start server but don't open browser |

---

## Related Commands

- [`@acp.status`](acp.status.md) — Text-based status (no browser required)
- [`@acp.report`](acp.report.md) — Generate a text report

---

## Notes

- The visualizer auto-refreshes when `progress.yaml` changes — no manual reload needed
- P1 features (GitHub remote, kanban, multi-project) are in a future milestone
- To use with a different project: `@acp.visualize --path /path/to/other/agent/progress.yaml`
