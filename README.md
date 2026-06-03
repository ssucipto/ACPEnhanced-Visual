# 🚀 ACP Progress Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/status-active-emerald?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/ACP%20Enhanced-v6.8.2-6e47ff?style=flat-square" alt="ACP Enhanced">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/milestones-4%20complete-blueviolet?style=flat-square" alt="Milestones">
  <img src="https://img.shields.io/badge/tests-25%20passing-success?style=flat-square" alt="Tests">
</p>

> **Bring your ACP Enhanced progress.yaml to life.** A local web dashboard that turns structured YAML milestone data into an interactive, sortable, searchable UI.

---

## ✨ What It Does

ACP Progress Visualizer reads any ACP Enhanced project's `agent/progress.yaml` and renders it as a beautiful, interactive dashboard:

- 📊 **Milestone Table** — sortable columns (ID, name, status, progress, tasks, priority)
- 🌳 **Milestone Tree** — expandable milestone → task hierarchy with expand/collapse all
- 🔍 **Fuzzy Search** — fuse.js instant search across all milestones and tasks
- 🏷️ **Status Filtering** — filter by active, in progress, completed, not started
- 🔄 **Auto-Refresh** — polls file mtime every 2s, re-renders on change — no WebSocket needed
- 📈 **Progress Bars** — per-milestone and overall project completion

---

## 🚦 Quick Start

```bash
git clone https://github.com/ssucipto/agent-context-protocol-visualizer
cd agent-context-protocol-visualizer
npm install

# Point at your ACP Enhanced project:
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run dev
```

Open **http://localhost:3000** to see your project's dashboard.

---

## 📖 Usage

The visualizer is a **local development tool**. It reads any ACP Enhanced project's `agent/progress.yaml` from your filesystem.

### Point at Any ACP Project

```bash
# Absolute path
PROGRESS_YAML_PATH=/Users/you/projects/my-acp-project/agent/progress.yaml npm run dev

# Relative path
PROGRESS_YAML_PATH=../my-acp-project/agent/progress.yaml npm run dev
```

### Symlink Workflow

For frequent use, create a symlink so the default path works:

```bash
ln -sf ../acp-enhanced/agent/progress.yaml agent/progress.yaml
npm run dev
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React SSR) |
| **UI** | React 19 + [Tailwind CSS v4](https://tailwindcss.com) |
| **Table** | [TanStack Table v8](https://tanstack.com/table) |
| **Search** | [fuse.js v7](https://fusejs.io) |
| **YAML** | [js-yaml](https://github.com/nodeca/js-yaml) |
| **Validation** | [Zod](https://zod.dev) (planned — M26) |
| **Testing** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| **CI** | GitHub Actions (planned — M27) |

---

## 📐 Architecture

```
Browser (React SPA)
  │
  ├─ TanStack Start Server Functions (Node.js)
  │   ├─ fetchProgress()   — readFileSync → js-yaml → typed JSON
  │   └─ fetchWatchToken() — statSync → mtime for polling
  │
  └─ Client Components
      ├─ useProgressData()  — hook: fetch + 2s poll loop
      ├─ fuse.js index      — fuzzy search across milestones + tasks
      └─ TanStack Table     — sortable milestone grid
```

**Key decisions:**
- **ADR-001**: TanStack Start for SSR + server functions (no separate API server)
- **ADR-002**: YAML as native data format (reads ACP Enhanced progress.yaml directly)
- **ADR-003**: Polling-based auto-refresh via mtime (works on any platform, no WebSocket)

---

## 🔗 Schema Compatibility

This visualizer targets **ACP Enhanced v6.8.2**'s `progress.yaml` schema.

To verify compatibility after an ACP Enhanced update:

```bash
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run dev
npm test -- src/lib/sync.test.ts
```

If ACP Enhanced adds new fields, update `src/lib/types.ts`, `src/lib/schemas.ts`, then bump `progress_yaml_target.version` in `agent/core/identity.yml`.

See [`agent/memory/decisions.md`](agent/memory/decisions.md) for the full sync contract.

---

## 📋 Project Status

| Milestone | Status | Tasks |
|-----------|--------|-------|
| M25 — P0 MVP | ✅ Completed | 7/7 |
| M26 — Schema Hardening | ✅ Completed | 4/4 |
| M27 — CI & Quality Pipeline | ✅ Completed | 6/6 |
| M28 — ACP Sync Contract | ✅ Completed | 5/5 |

> **25 tests passing** · TypeScript strict · GitHub Actions CI · Zod validation · ACP Enhanced v6.8.2 compatible

---

## 🛠️ Development

```bash
# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Run tests
npm test

# Production build
npm run build
```

### ACP Enhanced Commands

This project uses [ACP Enhanced](https://github.com/ssucipto/acp-enhanced) for AI-assisted development:

| Command | What It Does |
|---------|-------------|
| `/acp-init` | Initialize agent context |
| `/acp-status` | Display project status |
| `/acp-plan` | Plan milestones and tasks |
| `/acp-proceed` | Continue with next task |
| `/acp-audit` | Deep-dive investigation |
| `/acp-commit` | End-of-session memory commit |

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built with <a href="https://github.com/ssucipto/acp-enhanced">ACP Enhanced</a> — Agent Context Protocol for AI-assisted development.
</p>
