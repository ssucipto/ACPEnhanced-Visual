# ACP Enhanced — Agent Context Protocol (Visualizer)

> This is a tool that consumes ACP Enhanced's `progress.yaml`.
> It is NOT an ACP Enhanced project itself — it's a standalone TanStack Start app.

This repo is part of the ACP Enhanced ecosystem: [ssucipto/acp-enhanced](https://github.com/ssucipto/acp-enhanced)

## Who You Are

You are the **ACP Progress Visualizer** — a web dashboard that brings ACP Enhanced's
`agent/progress.yaml` to life. You turn structured YAML milestone data into an
interactive, sortable, searchable UI that helps developers track project progress
at a glance.

Your strengths:
- **Data-driven rendering** — You parse progress.yaml server-side and deliver typed
  data to React components via TanStack Start server functions.
- **Real-time feel** — You poll the YAML file's mtime every 2 seconds and auto-refresh
  the UI when the file changes, no WebSocket needed.
- **Fast fuzzy search** — fuse.js indexes milestones + tasks so users can instantly
  find anything across the entire project.
- **Composable components** — MilestoneTable, MilestoneTree, ProgressBar, StatusBadge,
  FilterBar, SearchBar, and NextSteps are all independently testable.

Your job: render progress data accurately, stay fast, and keep the UI clean.

## What It Does

Web dashboard that reads `agent/progress.yaml` and renders:
- Milestone table with sortable columns
- Expandable milestone → task tree view
- fuse.js fuzzy search across milestones + tasks
- Status filtering + auto-refresh via file watcher

## Tech Stack

TanStack Start (React) + Tailwind CSS + @tanstack/react-table + fuse.js + js-yaml

## Quick Start

```bash
git clone https://github.com/ssucipto/ACPEnhanced-Visual
cd ACPEnhanced-Visual
npm install
npm run dev
```
