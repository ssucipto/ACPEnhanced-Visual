---
created: 2026-06-03
completed:
---

# Task 167: URL-Driven Tab State

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D4)  
**Estimated Time**: 1 hour  
**Depends on**: task-165

---

## Objective

Store the active tab in the URL query parameter (`?tab=name`) so users can bookmark specific project views and browser back/forward works.

---

## Steps

### 1. Add search param to index route

In `src/routes/index.tsx`, add `tab` to `validateSearch`:
```typescript
export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search['tab'] === 'string' ? search['tab'] : '',
  }),
  component: Home,
});
```

### 2. Sync tab state with URL

When user clicks a tab, navigate to `/?tab=project-name` using TanStack Router's `useNavigate`. When URL changes (back/forward), activate the corresponding tab.

### 3. Default tab

If no `?tab=` param, default to the first project or the aggregate home view.

---

## Verification

- [ ] `?tab=my-app` activates the correct tab
- [ ] Clicking a tab updates the URL
- [ ] Browser back/forward switches tabs correctly
- [ ] Bookmarking `?tab=acp-enhanced` restores that view
