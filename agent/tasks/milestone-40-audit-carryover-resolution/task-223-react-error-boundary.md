# Task 223: Add React Error Boundary

**Task**: task-223  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P2  
**Status**: not_started  
**Estimated**: 1 hour  
**Carryover**: audit-29-F7  

## Objective

Add a React error boundary to prevent the entire app from crashing to a blank page when a component throws a render error. The error boundary should catch errors in any route component and display a user-friendly fallback with recovery options.

## Context

Currently, if any component in the React tree throws during render, the entire app crashes with a blank white page. This is especially problematic because TanStack Start SSR amplifies the impact — errors propagate through both server and client rendering.

The error boundary should wrap `<Outlet>` in `__root.tsx` to catch errors from any route. It should:
1. Display a friendly error message
2. Show the error details in development
3. Offer a "Reload" button to recover
4. Not interfere with the existing SSR error filter

## Steps

1. Create `src/components/ErrorBoundary.tsx` — a class component with `componentDidCatch` and `getDerivedStateFromError`
2. Display fallback UI with:
   - Warning icon + "Something went wrong" heading
   - Error message (in dev mode)
   - "Reload page" button
   - "Go Home" link
3. Wrap `<Outlet />` in `__root.tsx` with the error boundary
4. Ensure the error boundary doesn't catch the intentional SSR streaming errors (those are already filtered by the console.error script)

## Verification

- [ ] Throwing an error in a route component shows the fallback UI instead of blank page
- [ ] "Reload page" button refreshes the app
- [ ] "Go Home" link navigates to /
- [ ] Other routes continue working after an error in one route
- [ ] SSR error filter still works (no regressions)
- [ ] Error boundary doesn't interfere with TanStack Router error handling
