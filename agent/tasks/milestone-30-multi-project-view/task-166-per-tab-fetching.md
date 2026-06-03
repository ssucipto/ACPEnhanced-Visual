---
created: 2026-06-03
completed:
---

# Task 166: Per-Tab Independent Data Fetching

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D3)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-164, task-165

---

## Objective

Each tab runs its own independent `useProgressData` instance with its own data source, polling, and state. Switching tabs doesn't lose data.

---

## Steps

### 1. Create ProjectTab component

```tsx
function ProjectTab({ config }: { config: ProjectConfig }) {
  const source = config.source === 'local'
    ? config.path
    : config.repo; // GitHub source handled by extended hook
  
  const { data, error, loading } = useProgressData(source);
  
  if (loading) return <Loading />;
  if (error ?? !data) return <Error message={error} />;
  
  return (
    <div className="p-6">
      <ProjectHeader project={data.project} />
      <OverallProgress milestones={Object.values(data.milestones)} />
      {/* ... */}
    </div>
  );
}
```

### 2. Keep tabs mounted

Use CSS `display: none` instead of unmounting inactive tabs so polling continues and data persists. Only the active tab is visible.

### 3. Handle source types

Extend `useProgressData` to accept a `DataSourceConfig` and dispatch to the appropriate fetch function (local filesystem or GitHub).

---

## Verification

- [ ] Each tab independently fetches its data source
- [ ] Switching tabs doesn't lose data or reset state
- [ ] Polling continues for inactive tabs
- [ ] Local and GitHub sources both work per-tab
