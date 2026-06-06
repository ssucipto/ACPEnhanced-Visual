# Task 219: Fix PDF Export — Mermaid Diagrams as PNG

**Task**: task-219  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 1.5 hours  
**Depends On**: task-217 (Canvas SVG→PNG utility)  
**Carryover**: audit-30-F2  

## Objective

Fix the PDF export so mermaid diagrams render reliably in print output across all browsers. Replace inline SVGs (which have inconsistent browser print support) with PNG images via the `svgToPngDataUri()` utility from task-217.

## Context

The current `exportPdf` function in `DocsViewer.tsx` (lines 318-347):
1. Clones the DOM
2. Removes UI elements
3. Opens a new window with inline CSS
4. Writes `clone.innerHTML` directly — SVGs passed through as-is
5. Calls `window.print()`

Inline SVGs in print mode have inconsistent support:
- Chrome/Edge: Generally good but can fail with complex mermaid SVGs
- Safari: Variable, often strips SVG styles
- Firefox: Good
- System print-to-PDF: Depends on OS print pipeline

PNG images render consistently across all print engines.

## Steps

1. Make relevant parts of `exportPdf` async to support `svgToPngDataUri()` calls
2. Before writing to the new window, process mermaid containers:
   - Find all `.mermaid-container svg` elements in the clone
   - Call `svgToPngDataUri(svgElement)` for each
   - Replace SVG with `<img src="data:image/png;base64,...">` 
   - Fall back to inline SVG if rasterization fails
3. Update the print window's CSS to style PNG images appropriately
4. Keep the existing print-optimized CSS (`@page`, page-break rules)

## Verification

- [ ] PDF/print output shows mermaid diagrams in Chrome
- [ ] PDF/print output shows mermaid diagrams in Firefox  
- [ ] PDF/print output shows mermaid diagrams in Safari
- [ ] Print dialog opens correctly after PNG processing
- [ ] Fallback to inline SVG when rasterization fails
- [ ] Works with multiple diagrams
- [ ] Works with documents without mermaid diagrams
