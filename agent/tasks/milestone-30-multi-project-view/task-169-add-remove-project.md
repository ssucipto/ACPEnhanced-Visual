---
created: 2026-06-03
completed:
---

# Task 169: Add/Remove Project Dialog

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D6)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-164, task-165

---

## Objective

Add a dialog that lets users add and remove projects at runtime without restarting the server. New projects appear as tabs immediately.

---

## Steps

### 1. Create AddProjectDialog

Modal with form fields:
- Project name (text input)
- Source type (radio: local file / GitHub repo)
- Path or repo (text input, context-sensitive)
- Branch (optional, for GitHub)

### 2. Write to config

On submit, append to `.visualizer-projects.json` and update the in-memory project list. New tab appears immediately.

### 3. Remove project

Each tab has a small "×" button (visible on hover). Clicking it removes the project from config and closes its tab.

### 4. Confirm before remove

Show a confirmation dialog: "Remove my-app from the dashboard? Data will still exist in the repo."

---

## Verification

- [ ] "+" button opens AddProjectDialog
- [ ] Adding a project creates a new tab immediately
- [ ] "×" button removes a project after confirmation
- [ ] `.visualizer-projects.json` updated on add/remove
