---
created: 2026-06-03
completed:
---

# Task 168: Aggregate Home Tab

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D5)  
**Estimated Time**: 1 hour  
**Depends on**: task-166

---

## Objective

Add a "Home" tab that shows aggregate stats across all configured projects: total milestones, status breakdown, combined progress, and quick-jump links.

---

## Steps

### 1. Create AggregateHome component

```tsx
function AggregateHome({ projects }: { projects: ProjectData[] }) {
  const totalMilestones = projects.reduce((sum, p) => sum + Object.keys(p.milestones).length, 0);
  const activeProjects = projects.filter(p => p.project.status === 'active').length;
  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">All Projects</h1>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Active" value={activeProjects} />
        <StatCard label="Milestones" value={totalMilestones} />
      </div>
      <ProjectList projects={projects} />
    </div>
  );
}
```

### 2. Add as first tab

The "Home" tab is always first in the tab bar and shows aggregate data.

---

## Verification

- [ ] Home tab shows total project count, active count, milestone count
- [ ] Project list shows each project's name, status, and milestone count
- [ ] Clicking a project in the list activates its tab
