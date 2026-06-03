---
created: 2026-06-03
completed:
---

# Task 182: Integration Test — Remote GitHub Data Renders Through Components

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D7)  
**Estimated Time**: 1 hour  
**Depends On**: task-159, task-160  

---

## Objective

Verify that `ProgressData` fetched from GitHub via `raw.githubusercontent.com` flows through the same component pipeline as local data and renders identically in MilestoneTable, MilestoneTree, SearchBar, FilterBar, and ProgressBar.

---

## Context

Audit-8 finding C3: M29's design covers fetch + parse mechanics but doesn't explicitly verify that remote data renders through all components. The type system (shared `ProgressData`) guarantees structural compatibility, but an integration test is needed to confirm visual equivalence.

---

## Steps

### 1. Create test fixture with known remote URL

```typescript
// test/remote-render.test.tsx
const REMOTE_FIXTURE = {
  repo: 'ssucipto/acp-enhanced',
  ref: 'main',
  path: 'agent/progress.yaml',
};
```

### 2. Mock raw.githubusercontent.com response

Use Vitest's `vi.fn()` to mock the fetch response with a known progress.yaml fixture, simulating what `raw.githubusercontent.com/ssucipto/acp-enhanced/main/agent/progress.yaml` returns.

### 3. Verify component pipeline

Render each component with remote data and assert:
- `MilestoneTable` — all milestone rows present, sort works
- `MilestoneTree` — expand/collapse functions, tasks nested under milestones
- `SearchBar` — fuse.js indexes remote milestones/tasks
- `FilterBar` — status filter works on remote data
- `ProgressBar` — percentage calculations correct
- `StatusBadge` — correct colors for remote status values

### 4. Verify error states render

Test: 401 (private repo without token), 404 (repo not found), network timeout.

---

## Verification

- [ ] Mocked GitHub fetch returns valid ProgressData
- [ ] MilestoneTable renders all milestones from remote data
- [ ] MilestoneTree expand/collapse works on remote data
- [ ] SearchBar finds milestones from remote data
- [ ] FilterBar filters remote data correctly
- [ ] Error states render user-friendly messages
- [ ] Test added to CI pipeline (`npm test`)
