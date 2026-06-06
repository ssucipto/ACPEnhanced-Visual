# Task 217: Canvas SVG→PNG Rasterization Utility

**Task**: task-217  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 2.5 hours  
**Carryover**: audit-30-F3  
**Validation Gaps Addressed**: G1 (CSS inlining), G5 (subtask tracking)

## Objective

Create a reusable `svgToPngDataUri()` utility function that converts an SVG DOM element to a `data:image/png;base64` data URI using the HTML Canvas API. This produces PNG images that work universally — in Word (.doc), PDF print output, and all browsers — unlike the current `data:image/svg+xml;base64` approach which fails in Microsoft Word.

**⚠️ Critical Pre-Requisite — 30-Minute Spike**: Before writing any code, verify the Canvas approach works with real mermaid SVGs:
1. Open the running app, inspect a rendered mermaid diagram
2. Copy the SVG element, attempt Canvas→PNG conversion in browser console
3. Verify the resulting PNG has visible colors, text, borders, and arrows
4. If it works: proceed. If not: investigate `dom-to-image` or `html-to-image` libraries as alternatives

## Context

The current Word export converts mermaid SVGs to `data:image/svg+xml;base64` data URIs. This works in browsers but NOT in Microsoft Word, which doesn't support SVG or data URIs. Converting to PNG via Canvas produces `data:image/png;base64` URIs that Word's HTML import engine does support.

**Key Challenge — CSS Inlining**: Mermaid SVGs rely on CSS classes from the mermaid theme stylesheet (e.g., `.node rect`, `.edgePath .path`, `.label text`). When the SVG is extracted from the DOM and loaded as a standalone Image, external CSS references are lost. The resulting PNG would have no fill colors, no borders, and invisible text. See validation report G1.

**Solution**: Before serialization, traverse the SVG DOM and inline all computed styles into each element as inline `style` or presentation attributes (`fill`, `stroke`, `font-family`, `font-size`).

The utility will be used by both `exportWord` and `exportPdf` in `DocsViewer.tsx`.

## Steps

1. Create `src/lib/svg-to-png.ts` with `svgToPngDataUri(svgElement: SVGSVGElement, scale = 2): Promise<string>`
2. **CSS Inlining** (critical — addresses G1/G5):
   - Clone the SVG element to avoid mutating the displayed DOM
   - Traverse all child elements recursively
   - For each element, call `window.getComputedStyle()` on the original live element
   - Read: `fill`, `stroke`, `stroke-width`, `font-family`, `font-size`, `font-weight`, `text-anchor`, `dominant-baseline`, `opacity`
   - Write as inline `style` attribute on the cloned element
   - Also copy any existing inline styles and presentation attributes
3. **Rasterization**:
   - Serialize the style-inlined SVG clone to string via `XMLSerializer().serializeToString()`
   - Create `Blob` with `image/svg+xml;charset=utf-8` type
   - Create object URL via `URL.createObjectURL()`
   - Load via `new Image()` with `onload`/`onerror` handlers
   - On load: create `<canvas>`, draw image at 2x scale with white background
   - Return `canvas.toDataURL('image/png')`
   - Revoke object URL in both success and error paths
   - Determine SVG dimensions from `viewBox` or `getBoundingClientRect()`
4. **Fallback**: If Canvas approach fails entirely (e.g., tainted canvas), return `null` — callers handle fallback to source code block
5. Export the function and its type signature

## Verification

- [ ] 30-minute spike completed — real mermaid SVG converts to visible PNG ✅
- [ ] Function produces valid `data:image/png;base64,...` string
- [ ] PNG renders correctly when used as `<img src>` (colors, text, borders visible)
- [ ] CSS inlining works: mermaid theme colors preserved in PNG
- [ ] Object URL cleaned up (no memory leak)
- [ ] White background filled (handles dark theme transparency)
- [ ] Works with mermaid-generated SVGs (complex namespaces, styles)
- [ ] Handles edge cases: zero-dimension SVG, missing viewBox
- [ ] Falls back gracefully on Canvas failure (returns null)
