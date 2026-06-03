---
created: 2026-06-03
completed:
---

# Task 147: Regenerate progress.yaml with M25 History

**Milestone**: [M26 - Schema Hardening](../milestones/milestone-26-schema-hardening.md)  
**Estimated Time**: 0.5 hours  
**Depends on**: task-145

---

## Objective

Replace the bootstrap stub `agent/progress.yaml` with real data reflecting M25's actual development history (tasks 137-143 from git log) plus M26-M28 planning.

---

## Context

The current progress.yaml is a bootstrap stub — M25 shows as completed with no tasks. The git history shows 8 commits for M25 (tasks 137-143). This task populates progress.yaml with the actual task history so the visualizer shows real data when run locally.

---

## Steps

### 1. Update project section

```yaml
project:
  name: ACPEnhanced-Visual
  version: 1.0.0
  started: 2026-06-03
  status: active
  current_milestone: M26
  description: >
    Web dashboard that renders ACP Enhanced's agent/progress.yaml into an
    interactive, sortable, searchable UI with milestone tables, task trees,
    fuzzy search, status filtering, and auto-refresh via file watcher.
```

### 2. Add M25 task entries

Add tasks 137-143 under `tasks.M25` based on git history:
- task-137: Bootstrap TanStack Start + Tailwind
- task-138: YAML Parser + TypeScript Data Model
- task-139: Server Functions + Data-Source Hook
- task-140: Milestone Table View
- task-141: Milestone Tree View
- task-142: Search + Status Filter
- task-143: Dashboard Shell + Sidebar Layout

All marked `status: completed` with estimated hours.

### 3. Add M26-M28 milestones

Add milestone entries with `status: not_started` for M26, M27, M28 referencing their milestone documents.

### 4. Add recent_work

Document the ACP Enhanced bootstrap, audits, and planning work done today.

### 5. Update next_steps

Replace with current priorities from M26-M28.

---

## Verification

- [ ] `npm run dev` shows M25 (completed, 7/7 tasks) + M26-M28 (not started)
- [ ] Project status shows `active` with emerald badge
- [ ] Milestone table is sortable and filterable with real data
- [ ] Tree view expands M25 to show 7 completed tasks
