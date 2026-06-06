# Task 218: Fix Word Export — Mermaid Diagrams as PNG

**Task**: task-218  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 2 hours  
**Depends On**: task-217 (Canvas SVG→PNG utility)  
**Carryover**: audit-30-F1 (CRITICAL)  
**Validation Gaps Addressed**: G3 (E2E verification), G6 (async risk)

## Objective

Fix the Word export so mermaid diagrams appear as embedded PNG images in the .doc file. Replace the current `data:image/svg+xml;base64` approach (which Word doesn't support) with PNG rasterization via the `svgToPngDataUri()` utility from task-217.

## Context

The current `exportWord` function in `DocsViewer.tsx` (lines 259-315):
1. Clones the DOM
2. Finds `.mermaid-container` elements
3. Serializes SVGs to base64 SVG data URIs
4. Embeds them as `<img src="data:image/svg+xml;base64,...">` tags
5. Downloads as `application/msword` blob

Microsoft Word does NOT render `data:image/svg+xml;base64` URIs. Word's HTML import supports:
- ✅ `data:image/png;base64,...` (PNG is universally supported)
- ❌ `data:image/svg+xml;base64,...` (SVG not supported in Word)
- ❌ Inline `<svg>` elements (not supported in Word)

## Steps

1. Make `exportWord` async to support `svgToPngDataUri()` calls
2. In the `.mermaid-container` loop, replace the SVG→base64 block with:
   - Call `svgToPngDataUri(svgElement)` for each SVG found
   - Use the returned PNG data URI as `img.src`
   - Fall back to readable source code block if rasterization fails (returns null)
3. **Async robustness** (addresses G6):
   - Use `Promise.allSettled()` for parallel PNG conversion of multiple diagrams
   - Set 5-second timeout per diagram via `Promise.race([svgToPngDataUri(...), timeout])`
   - Show progress indicator: "Converting 2/3 diagrams…" while async work runs
   - Handle partial failures: if 2 of 3 diagrams convert, export shows 2 PNGs + 1 source code block
   - If ALL conversions fail, fall back to source code blocks for all diagrams
4. Also replace `unescape()` with `TextEncoder`-based base64 encoding per task-220 (if any remaining base64 code paths)
5. Update the download flow to handle async processing (show loading state)
6. Ensure `setExporting(true/false)` wraps the async operation

## E2E Verification Procedure (addresses G3)

After implementation, verify the fix works end-to-end:
1. Open the app, navigate to a document containing mermaid diagrams (e.g., milestone-39 doc)
2. Click "Export to Word" — wait for conversion to complete
3. Open the downloaded `.doc` file in **Microsoft Word 365** (or Word 2021+)
   - If Word is unavailable, test in **LibreOffice Writer** as secondary check
4. Verify each mermaid diagram is visible as a rendered image with:
   - Visible shapes (boxes, diamonds, circles)
   - Visible text labels inside shapes
   - Visible arrows/connectors between shapes
   - Correct colors (not all black/white)
5. Take screenshots of the Word document showing diagrams for the PR description
6. Also test: open the same `.doc` file in a browser (drag into Chrome) — diagrams should render

## Verification

- [ ] Word export produces .doc file with PNG-embedded mermaid diagrams
- [ ] .doc file opened in Microsoft Word shows diagrams (not broken images) — screenshot attached
- [ ] .doc file opened in LibreOffice Writer shows diagrams (secondary verification)
- [ ] .doc file opened in browser shows diagrams
- [ ] Export handles multiple diagrams in a single document (parallel conversion)
- [ ] Export handles partial failures (2/3 diagrams convert, 1 shows source code)
- [ ] Export handles documents with NO mermaid diagrams (unchanged behavior)
- [ ] Fallback to source code block when rasterization fails for all diagrams
- [ ] No memory leaks (object URLs revoked)
- [ ] Export button shows loading state + progress during async processing
- [ ] 5-second timeout per diagram prevents indefinite hang
