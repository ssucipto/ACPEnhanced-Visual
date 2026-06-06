# 🚀 ACP Progress Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/version-1.5.2-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/status-completed-success?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/ACP%20Enhanced-v6.9.1-6e47ff?style=flat-square" alt="ACP Enhanced">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/milestones-14%20complete-blueviolet?style=flat-square" alt="Milestones">
  <img src="https://img.shields.io/badge/tests-92%20passing-success?style=flat-square" alt="Tests">
</p>

> **Bring your ACP Enhanced progress.yaml to life.** A web dashboard that turns structured YAML milestone data into an interactive, sortable, searchable UI. Supports local filesystem and GitHub remote sources, multi-project tabs, and extended ACP memory visualizations.

---

## ✨ Features

### Core Dashboard
- 📊 **Milestone Table** — sortable columns (ID, name, status, progress, tasks, priority)
- 🌳 **Milestone Tree** — expandable milestone → task hierarchy with expand/collapse all
- 🔍 **Fuzzy Search** — fuse.js instant search across all milestones and tasks
- 🏷️ **Status Filtering** — filter by active, in progress, completed, not started, planned, blocked
- 🔄 **Auto-Refresh** — adaptive polling (2s local, 10s remote) — no WebSocket needed
- 📈 **Progress Bars** — per-milestone and overall project completion

### Multi-Project
- 📑 **Tabbed Dashboard** — monitor multiple projects simultaneously
- 🏠 **Aggregate Home** — cross-project stats (total milestones, active projects)
- ➕ **Add/Remove at Runtime** — no restart needed
- 🔗 **URL-Driven State** — bookmarkable tabs (`?tab=name`)

### Remote Sources
- 🌐 **GitHub Remote Read** — fetch progress.yaml from any public/private repo
- 🔐 **GITHUB_TOKEN** support for private repos
- 📡 **ETag Caching** — 304 responses don't count toward rate limits
- ⚠️ **Rate Limit Awareness** — warning banner when approaching limits

### Extended Visualizations (v2.0)
- 📅 **Session Timeline** — search, stats, week grouping, key facts inline
- 📋 **ADR Browser** — search, read-more expand, consequences, source links
- 📝 **Lessons Feed** — search, priority filter, most-common stats, per-lesson dates
- 🧩 **Pattern Library** — search, tag grouping, usage counts, code references
- 📦 **Package Inventory** — search, outdated highlighting, wanted versions, NPM+ACP tabs
- 📊 **Audit Index** — search, severity+status filters, source links, finding stats badges

### Developer Experience
- ⏹ **Stop Server Button** — one-click shutdown from the browser
- 🚀 **npx acp-visualizer** — zero-install CLI with auto-detect
- 📂 **Collapsible Sidebar** — icon-only mode (w-14) saves space, organized into 5 sections
- 📖 **Command Reference** — searchable /commands page with 70 ACP + visualizer commands
- 📄 **Markdown Viewer 2.0** — syntax highlighting, TOC, dark mode, fullscreen, drag-and-drop
- ⚠️ **Error Card** — amber warnings for YAML parse/Zod errors with fix steps
- 🌐 **Multi-Project Normalization** — supports ACP format variants (array milestones, alt statuses)

---

## 🚦 Quick Start

### One-liner install
```bash
curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash
```
Installs to `~/.acp/visualizer/`, links `acp-visualizer` globally.

Then from any ACP Enhanced project:
```bash
acp-visualizer                              # auto-detect
acp-visualizer --repo owner/repo            # GitHub remote
acp-visualizer --path /custom/path.yaml     # custom path
```

### Or via npx (zero-install)
```bash
npx acp-visualizer
```

### Manual clone
```bash
git clone https://github.com/ssucipto/ACPEnhanced-Visual
cd ACPEnhanced-Visual && npm install
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run visualize
```

---

## 📦 Installation (Alongside ACP Enhanced)

The visualizer works alongside any ACP Enhanced project. Three install options:

### Option A: curl one-liner (recommended)
```bash
curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash
```
This clones to `~/.acp/visualizer/`, installs dependencies, and links `acp-visualizer` to `~/.local/bin/`. Make sure `~/.local/bin` is in your PATH.

### Option B: npx (zero-install)
```bash
npx acp-visualizer
```
No install needed. Downloads and runs on the fly.

### Option C: Manual clone
```bash
git clone https://github.com/ssucipto/ACPEnhanced-Visual ~/.acp/visualizer
cd ~/.acp/visualizer && npm install && npm link
```

### 🔄 Updating

Same command as install — the script auto-detects and updates:
```bash
curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash
```
Or manually:
```bash
cd ~/.acp/visualizer && git pull && npm install
```

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
| **Router** | [TanStack Router](https://tanstack.com/router) (file-based) |
| **UI** | React 19 + [Tailwind CSS v4](https://tailwindcss.com) |
| **Table** | [TanStack Table v8](https://tanstack.com/table) |
| **Search** | [fuse.js v7](https://fusejs.io) |
| **YAML** | [js-yaml](https://github.com/nodeca/js-yaml) |
| **Validation** | [Zod](https://zod.dev) |
| **Testing** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| **CI** | GitHub Actions (lint + test + build) |
| **Icons** | [Lucide React](https://lucide.dev) |

## 📐 Architecture

```
Browser (React SPA)
  │
  ├─ TanStack Start Server Functions (Node.js)
  │   ├─ progress.ts       — readFileSync → sanitizeDates → Zod → typed JSON
  │   ├─ github-fetch.ts   — raw.githubusercontent.com with ETag caching
  │   ├─ memory-files.ts   — Parse sessions, ADRs, lessons, patterns, packages, audits
  │   ├─ shutdown.ts       — POST /api/shutdown + getServerInfo
  │   └─ 4 more server functions
  │
  └─ Client (17 routes, 25+ components)
      ├─ useProgressData()  — dual-source (local/GitHub), adaptive polling
      ├─ fuse.js index      — fuzzy search across milestones + tasks
      ├─ TabBar + Tabs      — multi-project dashboard (M30)
      ├─ Memory Views       — SessionTimeline, ADRBrowser, LessonsFeed, etc.
      └─ Server Controls    — Stop button, port display, rate limit banner
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

This visualizer targets **ACP Enhanced v6.9.1**'s `progress.yaml` schema.

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
| M29-M38 — 10 more milestones | ✅ Completed | 92/92 |

> **92 tests passing** · TypeScript strict · GitHub Actions CI · Zod validation · ACP Enhanced v6.9.1 compatible

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

## � Troubleshooting

### Windows: Dashboard hangs / terminal error flood

**Symptom**: After starting the visualizer on Windows 10/11, the browser tab freezes and the terminal floods with repeating `[vite] (client) [console.error] ...` messages until the process crashes.

**Cause**: React 19 + TanStack Start SSR produces internal errors that Vite 8 relays from browser→server→browser in an exponential feedback loop. The default devtools plugin amplifies this.

**Fix** (applied in v1.5.3+):
- Server-side log filter breaks the relay loop at the Vite level
- TanStack Devtools are disabled by default (opt-in)
- Client-side console filter broadened to catch relay prefixes

**To enable devtools** (for debugging only):
```powershell
# Windows PowerShell
$env:VITE_ENABLE_DEVTOOLS="true"
npm run dev

# macOS / Linux
VITE_ENABLE_DEVTOOLS=true npm run dev
```

**Still seeing issues?** Verify:
- Visualizer version ≥ 1.5.3: `npx acp-visualizer --version`
- No stale install: `rm -rf ~/.acp/visualizer && npx acp-visualizer@latest`
- Node.js ≥ 18: `node --version`

---

## �📄 License

MIT — see [LICENSE](LICENSE).

---

<p align="center">
  Built with <a href="https://github.com/ssucipto/acp-enhanced">ACP Enhanced</a> — Agent Context Protocol for AI-assisted development.
</p>
