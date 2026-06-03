# Multi-Project View

<!-- @acp.meta.design
topic: multi-project, tabs, dashboard, aggregate-view
description: View multiple ACP projects side-by-side in tabs, each with independent data sources and auto-refresh
status: draft
updated: 2026-06-03
@acp.meta.end -->

**Concept**: Render multiple ACP projects in a single dashboard with tabbed navigation, each tab independently fetching and polling its own data source  
**Created**: 2026-06-03  

---

## Overview

The visualizer currently shows one project at a time. This design adds multi-project support — configure multiple data sources (local files or GitHub repos) and view them in tabs. Each tab is an independent dashboard with its own milestones, tasks, search, and auto-refresh.

---

## Problem Statement

- **Challenge**: Developers working on multiple ACP projects must run separate visualizer instances (or restart with different `PROGRESS_YAML_PATH`). No unified view exists.
- **Why solve**: Teams with multiple repos need a single dashboard to monitor all projects. Switching between browser tabs is friction.
- **Consequences**: Without this, the visualizer doesn't scale beyond single-project usage.

---

## Solution

### D1: Tab-based multi-project layout

```
┌──────────────────────────────────────────────┐
│  acp-enhanced │ my-app │ api-server │ + Add  │  ← project tabs
├──────────────────────────────────────────────┤
│  [active tab content: milestones, tree, etc] │
└──────────────────────────────────────────────┘
```

Each tab is an independent `useProgressData()` instance with its own data source, polling interval, and state.

### D2: Project configuration

Projects are configured via a JSON file or env var:

```json
// .visualizer-projects.json (in visualizer root)
{
  "projects": [
    { "name": "acp-enhanced", "source": "local", "path": "../acp-enhanced/agent/progress.yaml" },
    { "name": "my-app", "source": "github", "repo": "ssucipto/my-app" },
    { "name": "api-server", "source": "github", "repo": "ssucipto/api-server", "branch": "develop" }
  ]
}
```

Or via env var:
```
VISUALIZER_PROJECTS=acp-enhanced:../acp-enhanced/agent/progress.yaml,my-app:ssucipto/my-app
```

### D3: Independent data fetching per tab

```typescript
// Each tab gets its own useProgressData instance
function ProjectTab({ config }: { config: ProjectConfig }) {
  const { data, error, loading } = useProgressData(
    config.source === 'local' ? config.path : undefined
  );
  // ... render milestone table, tree, search for this project
}
```

### D4: URL-driven tab state

Tab selection is stored in the URL:
```
http://localhost:3000/?tab=my-app
http://localhost:3000/?tab=acp-enhanced&search=Zod
```

This enables bookmarking specific project views and sharing links.

### D5: Aggregate overview

A home tab shows aggregate stats across all projects:
- Total milestones across all projects
- Projects by status (active/completed)
- Combined progress percentage
- Quick jump to any project

### D6: Add/remove projects at runtime

A "+" button in the tab bar opens a dialog to add a new project:
- Local file: file picker or path input
- GitHub repo: owner/repo input
- Removes the need to restart the server

---

## Key Decisions

- **Tabs, not split panes** — keeps the UI simple; each project gets full screen real estate
- **Independent polling** — each tab polls its own data source; no shared state between tabs
- **Config file over env var** — `.visualizer-projects.json` is easier to manage for 5+ projects
- **URL state** — enables deep linking to specific project views

## Trade-offs

- Memory usage scales linearly with project count (each tab has its own data + fuse.js index)
- Polling interval applies per-tab — 10 projects × 2s = 20 requests/2s (acceptable for local files, may hit GitHub rate limits for remote)
- Tab state resets on page refresh (unless URL-driven with `?tab=` param)
