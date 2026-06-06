# Task 220: Replace Deprecated unescape() with TextEncoder

**Task**: task-220  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P3  
**Status**: not_started  
**Estimated**: 0.5 hours  
**Carryover**: audit-29-F1  
**Validation Gaps Addressed**: G4 (scope clarification), G10 (priority alignment)

## Objective

Replace ALL deprecated `unescape()` function calls in the codebase with a `TextEncoder`-based approach. If tasks 217-219 remove all SVG→base64 code paths, this task may become a no-op — verify and close accordingly.

## Context

**Scope note** (addresses G4): After tasks 217-219 replace the SVG→base64 encoding with Canvas PNG rasterization, there may be zero remaining `unescape()` calls in the codebase. This task should:
1. Run AFTER tasks 217-219 are complete
2. Search for `unescape(` across the entire codebase
3. If no results: mark complete immediately (no-op)
4. If results found: replace each with TextEncoder approach

The original target was `DocsViewer.tsx:276` which used:
```js
const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
```

`unescape()` is removed from Web standards. The replacement for any remaining usage:
```js
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const chars = Array.from(bytes, (b) => String.fromCharCode(b));
  return btoa(chars.join(''));
}
```

## Steps

1. After tasks 217-219 are implemented, search entire codebase: `grep -r "unescape(" src/`
2. If zero results: mark task complete, document as "obsoleted by PNG rasterization"
3. If results found: replace each occurrence with `TextEncoder`-based approach
4. Handle large strings (chunk the Uint8Array if needed to avoid stack overflow)
5. Verify the base64 output is identical to the old `unescape` approach

## Verification

- [ ] `grep -r "unescape" src/` returns zero results (either removed or never existed)
- [ ] If replacements made: base64 encoding produces identical output to old approach
- [ ] If replacements made: handles Unicode characters correctly
- [ ] If replacements made: no stack overflow for large strings (>100KB)
