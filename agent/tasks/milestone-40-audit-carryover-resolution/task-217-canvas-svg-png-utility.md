# Task 217: Canvas SVG→PNG Rasterization Utility

**Task**: task-217  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 2 hours  
**Carryover**: audit-30-F3  

## Objective

Create a reusable `svgToPngDataUri()` utility function that converts an SVG DOM element to a `data:image/png;base64` data URI using the HTML Canvas API. This produces PNG images that work universally — in Word (.doc), PDF print output, and all browsers — unlike the current `data:image/svg+xml;base64` approach which fails in Microsoft Word.

## Context

The current Word export converts mermaid SVGs to `data:image/svg+xml;base64` data URIs. This works in browsers but NOT in Microsoft Word, which doesn't support SVG or data URIs. Converting to PNG via Canvas produces `data:image/png;base64` URIs that Word's HTML import engine does support.

The utility will be used by both `exportWord` and `exportPdf` in `DocsViewer.tsx`.

## Steps

1. Create `src/lib/svg-to-png.ts` with `svgToPngDataUri(svgElement: SVGSVGElement, scale = 2): Promise<string>`
2. Implementation:
   - Serialize SVG to string via `XMLSerializer().serializeToString()`
   - Create `Blob` with `image/svg+xml;charset=utf-8` type
   - Create object URL via `URL.createObjectURL()`
   - Load via `new Image()` with `onload`/`onerror` handlers
   - On load: create `<canvas>`, draw image at 2x scale with white background
   - Return `canvas.toDataURL('image/png')`
   - Revoke object URL in both success and error paths
   - Determine SVG dimensions from `viewBox` or `getBoundingClientRect()`
3. Export the function and its type signature

## Verification

- [ ] Function produces valid `data:image/png;base64,...` string
- [ ] PNG renders correctly when used as `<img src>`
- [ ] Object URL cleaned up (no memory leak)
- [ ] White background filled (handles dark theme transparency)
- [ ] Works with mermaid-generated SVGs (complex namespaces, styles)
- [ ] Handles edge cases: zero-dimension SVG, missing viewBox
- [ ] Falls back gracefully on Canvas failure (returns null or throws descriptive error)
