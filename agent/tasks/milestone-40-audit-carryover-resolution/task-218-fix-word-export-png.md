# Task 218: Fix Word Export — Mermaid Diagrams as PNG

**Task**: task-218  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P0  
**Status**: not_started  
**Estimated**: 2 hours  
**Depends On**: task-217 (Canvas SVG→PNG utility)  
**Carryover**: audit-30-F1 (CRITICAL)  

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
   - Fall back to readable source code block if rasterization fails
3. Also replace `unescape()` with `TextEncoder`-based base64 encoding per task-220 (if any remaining base64 code paths)
4. Update the download flow to handle async processing (show loading state)
5. Ensure `setExporting(true/false)` wraps the async operation

## Verification

- [ ] Word export produces .doc file with PNG-embedded mermaid diagrams
- [ ] .doc file opened in Microsoft Word shows diagrams (not broken images)
- [ ] .doc file opened in browser shows diagrams
- [ ] Export handles multiple diagrams in a single document
- [ ] Export handles documents with NO mermaid diagrams (unchanged behavior)
- [ ] Fallback to source code block when rasterization fails
- [ ] No memory leaks (object URLs revoked)
- [ ] Export button shows loading state during async processing
