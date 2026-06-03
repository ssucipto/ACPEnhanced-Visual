# 🚀 ACP Progress Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.6-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/status-active-emerald?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/ACP%20Enhanced-v6.8.2-6e47ff?style=flat-square" alt="ACP Enhanced">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/milestones-5%20complete-blueviolet?style=flat-square" alt="Milestones">
  <img src="https://img.shields.io/badge/tests-39%20passing-success?style=flat-square" alt="Tests">
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
git clone https://github.com/ssucipto/ACPEnhanced-Visual
cd ACPEnhanced-Visual
npm install

# Point at your ACP Enhanced project and open browser:
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run visualize
```

Or use the one-liner:
```bash
npm run visualize
```
(uses default `agent/progress.yaml` in the visualizer's own directory)

---

## 📦 Installation (Alongside ACP Enhanced)

The visualizer works alongside any ACP Enhanced project. Two install options:

### Option A: Global install (recommended)

```bash
git clone https://github.com/ssucipto/ACPEnhanced-Visual ~/.acp/visualizer
cd ~/.acp/visualizer && npm install
```

Then from any ACP Enhanced project:
```bash
PROGRESS_YAML_PATH=$(pwd)/agent/progress.yaml ~/.acp/visualizer/npm run visualize
```

### Option B: Sibling directory

```bash
# From your ACP Enhanced project:
cd ..
git clone https://github.com/ssucipto/ACPEnhanced-Visual
cd ACPEnhanced-Visual && npm install

# Then:
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run visualize
```

### Via ACP Enhanced command

If you have the visualizer installed at `~/.acp/visualizer/`, ACP Enhanced's `/acp-visualize` slash command auto-detects it:

```
/acp-visualize                    # Opens your current project
/acp-visualize --path /other/project/agent/progress.yaml
```

### Multi-Project Support

The visualizer auto-detects available ports starting from 3000. Run `/acp-visualize`
in multiple VS Code windows and each project gets its own port:

```
Project A → :3000
Project B → :3001
Project C → :3002
```

No configuration needed — `npm run visualize` handles port resolution automatically.

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

## 🌐 GitHub Remote Read

> **New in v1.0.2+**: Read progress.yaml directly from GitHub repos — no local clone needed.

### Remote Repo

```bash
# Public repo
PROGRESS_YAML_REPO=ssucipto/acp-enhanced npm run dev

# Specific branch
PROGRESS_YAML_REPO=ssucipto/acp-enhanced:develop npm run dev

# Custom path
PROGRESS_YAML_REPO=ssucipto/acp-enhanced:main:agent/progress.yaml npm run dev
```

### Private Repos

Set `GITHUB_TOKEN` for private repo access:

```bash
GITHUB_TOKEN=ghp_xxx PROGRESS_YAML_REPO=private-org/private-repo npm run dev
```

For multi-account setups, use `.github-tokens.json` (gitignored):

```json
{ "ssucipto": "ghp_xxx", "other-org": "ghp_yyy" }
```

Or per-repo token env vars:
```bash
PROGRESS_YAML_TOKEN_ENV=GITHUB_TOKEN_SSUCIPTO \
  PROGRESS_YAML_REPO=ssucipto/private-project npm run dev
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
