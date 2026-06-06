# Task 222: Add clearTimeout Cleanup to showToast

**Task**: task-222  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P3  
**Status**: not_started  
**Estimated**: 0.25 hours  
**Carryover**: audit-29-F3  

## Objective

Prevent React "setState on unmounted component" warning by cleaning up the `showToast` setTimeout on component unmount.

## Context

At `DocsViewer.tsx:254-256`:
```js
const showToast = useCallback((msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(null), 3000);
}, []);
```

If the DocsViewer component unmounts before the 3-second timeout fires, `setToast(null)` triggers a React 19 warning about updating state on an unmounted component.

## Steps

1. Add a `useRef<ReturnType<typeof setTimeout>>` to store the timer
2. In `showToast`, clear any existing timer before setting a new one
3. Add a `useEffect` cleanup that clears the timer on unmount
4. Ensure the timer ref is included in the `useCallback` dependency (or use a ref-based approach to avoid dependency issues)

## Verification

- [ ] Toast appears and auto-dismisses after 3 seconds (existing behavior preserved)
- [ ] No React warning when navigating away while toast is visible
- [ ] Rapid successive toasts work correctly (only latest timer fires)
