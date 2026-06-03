---
created: 2026-06-03
completed:
---

# Task 183: Sidebar Redesign with Collapsible Sections

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Estimated Time**: 1.5 hours  
**Depends On**: task-176, task-177, task-178, task-179, task-180, task-181  

---

## Objective

Redesign the sidebar navigation to group 11+ links into collapsible sections with smooth expand/collapse animations, preventing the sidebar from becoming cluttered as new views are added.

---

## Context

Audit-8 finding M1: Adding 6 new views (sessions, ADRs, lessons, patterns, packages, audits) to the current 5-link sidebar would create an unorganized list of 11+ links. Grouping into collapsible sections improves scannability and scales for future views.

---

## Steps

### 1. Define section structure

```typescript
const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    icon: '📊',
    defaultOpen: true,
    links: [
      { to: '/', label: 'Home' },
      { to: '/milestones', label: 'Milestones' },
      { to: '/search', label: 'Search' },
    ],
  },
  {
    label: 'Project Intelligence',
    icon: '📋',
    defaultOpen: false,
    links: [
      { to: '/sessions', label: 'Sessions' },
      { to: '/adrs', label: 'ADRs' },
      { to: '/lessons', label: 'Lessons' },
      { to: '/patterns', label: 'Patterns' },
    ],
  },
  {
    label: 'Management',
    icon: '📦',
    defaultOpen: false,
    links: [
      { to: '/packages', label: 'Packages' },
      { to: '/audits', label: 'Audits' },
    ],
  },
];
```

### 2. Create CollapsibleSection component

Toggle open/close with chevron icon. Animate height with CSS transition. Persist open state in localStorage.

### 3. Update current sidebar in `__root.tsx`

Replace flat link list with `CollapsibleSection` components. Highlight active link. Maintain existing active-route detection.

### 4. Responsive behavior

On mobile (< 768px): sidebar collapses to icon-only. On desktop: full sidebar with section headers.

---

## Verification

- [ ] Sections expand/collapse with smooth animation
- [ ] Active route highlighted within its section
- [ ] Open/closed state persists across page navigation
- [ ] Mobile: icons only, desktop: full labels
- [ ] No layout shift when toggling sections
- [ ] Keyboard accessible (Enter/Space to toggle)
