# Task 220: Replace Deprecated unescape() with TextEncoder

**Task**: task-220  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P1  
**Status**: not_started  
**Estimated**: 0.5 hours  
**Carryover**: audit-29-F1  

## Objective

Replace the deprecated `unescape()` function used in the base64 encoding pattern with a `TextEncoder`-based approach.

## Context

The current code at `DocsViewer.tsx:276` uses:
```js
const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
```

`unescape()` is removed from Web standards. The replacement:
```js
const bytes = new TextEncoder().encode(svgString);
const svgBase64 = btoa(String.fromCharCode(...bytes));
```

Or for very large strings (to avoid stack overflow with spread):
```js
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const chars = Array.from(bytes, (b) => String.fromCharCode(b));
  return btoa(chars.join(''));
}
```

Note: After task-217/218/219 are implemented, SVG→base64 encoding will be replaced by Canvas PNG rasterization. But there may be other base64 encodings in the codebase, or the utility itself may encode PNG data. Ensure ALL uses of `unescape()` are removed.

## Steps

1. Search entire codebase for `unescape(` usage
2. Replace with `TextEncoder`-based approach at each location
3. Handle large strings (chunk the Uint8Array if needed)
4. Verify the base64 output is identical to the old `unescape` approach

## Verification

- [ ] `grep -r "unescape" src/` returns zero results
- [ ] Base64 encoding produces identical output to old approach
- [ ] Handles Unicode characters correctly (mermaid diagrams use Unicode)
- [ ] No stack overflow for large SVG strings (>100KB)
