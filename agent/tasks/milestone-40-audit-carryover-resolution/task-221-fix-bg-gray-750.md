# Task 221: Fix Non-Existent Tailwind Class bg-gray-750

**Task**: task-221  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P2  
**Status**: not_started  
**Estimated**: 0.25 hours  
**Carryover**: audit-29-F2  

## Objective

Replace `bg-gray-750` with a valid Tailwind gray class (`bg-gray-700`) in the DocsViewer sidebar dark mode header.

## Context

At `DocsViewer.tsx:383`:
```jsx
className={`px-3 py-1.5 text-xs font-semibold uppercase ${dark ? 'text-gray-500 bg-gray-750' : 'text-gray-400 bg-gray-100'}`}
```

Tailwind CSS gray scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950. There is no `750`. The class `bg-gray-750` produces no styling at all. Since this is used in dark mode, the intended effect is a dark background. `bg-gray-700` (#374151) is the closest valid value.

## Steps

1. Change `bg-gray-750` → `bg-gray-700` in DocsViewer.tsx line 383
2. Verify dark mode sidebar directory headers have a visible background

## Verification

- [ ] `grep -r "gray-750" src/` returns zero results
- [ ] Dark mode sidebar directory headers have visible gray background
- [ ] Light mode unaffected (uses `bg-gray-100`)
