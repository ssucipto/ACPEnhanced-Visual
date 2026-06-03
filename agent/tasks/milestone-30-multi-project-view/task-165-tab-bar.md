---
created: 2026-06-03
completed:
---

# Task 165: TabBar Component

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D1)  
**Estimated Time**: 2 hours  
**Depends on**: task-164

---

## Objective

Create a `TabBar` component that renders project tabs with active state highlighting and a "+" button to add projects.

---

## Steps

### 1. Create TabBar component

In `src/components/TabBar.tsx`:
```tsx
interface Props {
  projects: ProjectConfig[];
  activeTab: string;
  onSelect: (name: string) => void;
  onAdd: () => void;
}

export function TabBar({ projects, activeTab, onSelect, onAdd }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-4">
      {projects.map((p) => (
        <button
          key={p.name}
          onClick={() => onSelect(p.name)}
          className={`px-4 py-2 text-sm border-b-2 -mb-px ${
            activeTab === p.name
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {p.name}
        </button>
      ))}
      <button onClick={onAdd} className="px-2 py-2 text-gray-400 hover:text-gray-600">+</button>
    </div>
  );
}
```

### 2. Integrate into root layout

Add TabBar above the `<Outlet />` in `__root.tsx`, passing project configs from the loader.

### 3. Style

Use Tailwind for tab styling with underline indicator.

---

## Verification

- [ ] `src/components/TabBar.tsx` created
- [ ] Renders all project names as tabs
- [ ] Active tab highlighted with blue underline
- [ ] "+" button calls onAdd
- [ ] Integrated in root layout
