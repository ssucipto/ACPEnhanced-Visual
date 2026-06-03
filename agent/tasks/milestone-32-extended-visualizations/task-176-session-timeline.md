---
created: 2026-06-03
completed:
---

# Task 176: Session Timeline View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D1)  
**Estimated Time**: 2 hours  

---

## Objective

Render `agent/memory/sessions.md` as a chronological timeline showing date, executor, tasks completed, key facts, and deferred items for each session.

---

## Steps

### 1. Server function

Parse `sessions.md` YAML blocks into typed session entries.

### 2. SessionTimeline component

Chronological list with collapsible entries.

### 3. Sidebar link

Add "Sessions" to sidebar navigation.

---

## Verification

- [ ] Parses sessions.md YAML blocks
- [ ] Renders date, executor, tasks, key facts per session
- [ ] Gracefully handles missing sessions.md
