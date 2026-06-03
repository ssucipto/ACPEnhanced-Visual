# Milestone 30: Multi-Project View

**Goal**: View multiple ACP projects in a single dashboard with tabbed navigation, independent data sources, and URL-driven state  
**Duration**: ~8 hours  
**Design**: [local.multi-project-view](../design/local.multi-project-view.md)

---

## Overview

The visualizer currently shows one project at a time. This milestone adds multi-project support — configure multiple data sources (local files or GitHub repos) and view them in tabs. Each tab is an independent dashboard with its own milestones, tasks, search, and auto-refresh. Implements D1-D6 from the design.

---

## Deliverables

### 1. Project Configuration
- `.visualizer-projects.json` file format for defining multiple projects
- `VISUALIZER_PROJECTS` env var for quick config
- Each project: name, source type, path/repo

### 2. Tabbed Layout
- Tab bar with project names + active state
- "+" button to add projects at runtime
- Each tab independently fetches and polls its data source

### 3. URL State
- `?tab=name` param for deep linking
- Browser back/forward support
- Bookmarks persist the active project

### 4. Aggregate Overview
- Home tab showing all projects at a glance
- Total milestones, status summary, quick-jump links

---

## Tasks

| Task | D-ID | Description | Est. |
|------|------|-------------|------|
| 164 | D2 | Project config loader | 1h |
| 165 | D1 | TabBar component | 2h |
| 166 | D3 | Per-tab independent data fetching | 1.5h |
| 167 | D4 | URL-driven tab state | 1h |
| 168 | D5 | Aggregate home tab | 1h |
| 169 | D6 | Add/remove project dialog | 1.5h |

## Success Criteria

- 3+ projects configured, each in its own tab with independent data
- URL `?tab=my-app` navigates to the correct tab
- Home tab shows aggregate stats across all projects
- Adding a project at runtime creates a new tab without restart
