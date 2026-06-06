# Milestone 40: Audit Carryover Resolution & Export Hardening

**Milestone**: M40  
**Priority**: P0  
**Status**: planned  
**Estimated**: 1.5 weeks  
**Depends On**: M39 (Mermaid Flowcharts + Document Export)  

## Goal

Resolve all pending actionable audit carryovers from audits #19, #29, and #30. Fix the critical Word export bug where mermaid diagrams don't appear, implement Canvas-based SVG→PNG rasterization for universal export compatibility, close 4 medium-severity code quality gaps, and add server function test coverage.

## Deliverables

1. **Canvas SVG→PNG rasterization utility** — `svgToPngDataUri()` using Canvas API + Image + Blob, producing `data:image/png;base64` URIs that work universally in Word, PDF, and browsers
2. **Fixed Word export** — Mermaid diagrams render as embedded PNG images in .doc files
3. **Fixed PDF export** — Mermaid diagrams render as embedded PNG images in print output
4. **Replaced deprecated `unescape()`** — TextEncoder-based UTF-8 safe base64 encoding
5. **Fixed `bg-gray-750`** → `bg-gray-700` in dark mode sidebar
6. **Toast timer cleanup** — No more setState on unmounted component
7. **React error boundary** — Graceful fallback instead of blank page on crash
8. **CSS `print-color-adjust`** — Standard property alongside vendor prefix
9. **Server function tests** — Coverage for 11 server functions
10. **Coverage reporting** — Vitest coverage thresholds + test:coverage script verification

## Success Criteria

- [ ] Word export: mermaid diagrams visible when .doc opened in Microsoft Word
- [ ] PDF export: mermaid diagrams visible in print output across Chrome, Firefox, Safari
- [ ] `unescape()` removed from codebase — zero deprecated API usage
- [ ] `bg-gray-750` removed — all Tailwind classes valid
- [ ] No React warnings about state updates on unmounted components
- [ ] React error boundary catches render errors and shows fallback UI
- [ ] All 97 existing tests still pass; new server function tests added
- [ ] Coverage thresholds met (50% statements, 40% branches, 50% functions, 50% lines)
- [ ] TS 0 errors, build clean
