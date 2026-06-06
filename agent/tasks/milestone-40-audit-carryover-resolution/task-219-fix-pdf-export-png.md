# Task 219: Fix PDF Export — Mermaid Diagrams as PNG

**Task**: task-219  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 1.5 hours  
**Depends On**: task-217 (Canvas SVG→PNG utility)  
**Carryover**: audit-30-F2  
**Validation Gaps Addressed**: G3 (E2E verification), G6 (async risk)

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

1. Make `exportPdf` async to support `svgToPngDataUri()` calls
2. Before writing to the new window, process mermaid containers:
   - Find all `.mermaid-container svg` elements in the clone
   - Call `svgToPngDataUri(svgElement)` for each
   - Replace SVG with `<img src="data:image/png;base64,...">`
   - Fall back to inline SVG if rasterization fails (returns null)
3. **Async robustness** (addresses G6):
   - Use `Promise.allSettled()` with 5-second timeout per diagram
   - Handle partial failures: converted diagrams show as PNG, failed ones keep inline SVG
   - Show progress indicator while converting
4. Update the print window's CSS to style PNG images appropriately
5. Keep the existing print-optimized CSS (`@page`, page-break rules)

## E2E Verification Procedure (addresses G3)

After implementation, verify the fix works across browsers:
1. Open the app, navigate to a document containing mermaid diagrams
2. Click "Export to PDF" — wait for conversion to complete
3. In the print dialog:
   - **Chrome**: Save as PDF → open the PDF → verify diagrams visible
   - **Firefox**: Save as PDF → open the PDF → verify diagrams visible
   - **Safari**: Save as PDF → open the PDF → verify diagrams visible
4. For each browser, verify:
   - Diagrams are visible (not blank spaces)
   - Labels and text are readable
   - Colors are preserved (not all black)
5. Take screenshots of the PDF output for the PR description

## Verification

- [ ] PDF/print output shows mermaid diagrams in Chrome — screenshot attached
- [ ] PDF/print output shows mermaid diagrams in Firefox — screenshot attached
- [ ] PDF/print output shows mermaid diagrams in Safari — screenshot attached
- [ ] Print dialog opens correctly after PNG processing
- [ ] Fallback to inline SVG when rasterization fails
- [ ] Works with multiple diagrams (parallel conversion)
- [ ] Works with documents without mermaid diagrams
- [ ] 5-second timeout per diagram prevents indefinite hang
