# Task 223: Add React Error Boundary

**Task**: task-223  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P2  
**Status**: not_started  
**Estimated**: 1.5 hours  
**Carryover**: audit-29-F7  
**Validation Gaps Addressed**: G7 (TanStack Router compatibility)

## Objective

Add a React error boundary to prevent the entire app from crashing to a blank page when a component throws a render error. The error boundary should catch errors in layout shell components and display a user-friendly fallback with recovery options, while preserving TanStack Router's built-in error handling.

## Context

Currently, if any component in the React tree throws during render, the entire app crashes with a blank white page. This is especially problematic because TanStack Start SSR amplifies the impact — errors propagate through both server and client rendering.

**TanStack Router compatibility** (addresses G7): TanStack Router has its own error handling (`errorComponent`, `notFoundComponent`, `defaultErrorComponent`). The React error boundary must NOT wrap `<Outlet>` directly, as this would catch and suppress TanStack Router's route-level error recovery. Instead, the error boundary should wrap the app shell content OUTSIDE the router outlet — the sidebar, header, and layout chrome. Router-level errors should continue to be handled by TanStack Router's `errorComponent`.

**Placement strategy**:
- Wrap the sidebar + layout shell with an error boundary (protects navigation)
- Use TanStack Router's `defaultErrorComponent` for route-level errors
- DO NOT wrap `<Outlet>` — let router errors propagate to TanStack's handler

## Steps

1. Create `src/components/ErrorBoundary.tsx` — a class component with `componentDidCatch` and `getDerivedStateFromError`
2. Display fallback UI with:
   - ⚠️ Warning icon + "Something went wrong" heading (with `role="alert"` for a11y)
   - Error message (in dev mode only — `import.meta.env.DEV`)
   - "Reload page" button (`window.location.reload()`)
   - "Go Home" link (`<Link to="/">` from TanStack Router)
3. **Placement** (addresses G7):
   - Wrap the sidebar/layout shell in `__root.tsx` (the `<aside>`, `<main>`, floating controls)
   - Do NOT wrap `<Outlet>` — let TanStack Router handle route errors
   - Add TanStack Router's `defaultErrorComponent` in `router.tsx` for route-level errors
4. Ensure the error boundary doesn't catch the intentional SSR streaming errors (those are already filtered by the console.error script)
5. Test: throw in a route component → TanStack error component renders. Throw in sidebar → React error boundary renders.

## Verification

- [ ] Throwing an error in a route component shows TanStack Router's error page (not blank)
- [ ] Throwing an error in sidebar shows React error boundary fallback with reload button
- [ ] "Reload page" button refreshes the app
- [ ] "Go Home" link navigates to /
- [ ] Error boundary has `role="alert"` for screen reader accessibility
- [ ] Other routes continue working after an error in one route
- [ ] SSR error filter still works (no regressions)
- [ ] Error boundary does NOT interfere with TanStack Router's `errorComponent`
