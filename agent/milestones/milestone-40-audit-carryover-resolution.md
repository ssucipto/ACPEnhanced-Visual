# Milestone 40: Audit Carryover Resolution & Export Hardening

**Milestone**: M40  
**Priority**: P0  
**Status**: planned  
**Estimated**: 1.5 weeks  
**Depends On**: M39 (Mermaid Flowcharts + Document Export)  
**Validation**: Gaps addressed per validate-m40-plan-gaps.md (G1-G11)

## Goal

Resolve all pending actionable audit carryovers from audits #19, #29, and #30. Fix the critical Word export bug where mermaid diagrams don't appear, implement Canvas-based SVG→PNG rasterization with CSS inlining for universal export compatibility, close medium-severity code quality gaps, and add server function test coverage for the core data pipeline.

## Deliverables

1. **Canvas SVG→PNG rasterization utility** — `svgToPngDataUri()` with CSS inlining via `getComputedStyle()`, producing `data:image/png;base64` URIs that preserve mermaid theme colors
2. **Fixed Word export** — Mermaid diagrams render as embedded PNG images in .doc files with async progress, timeout handling, and partial failure recovery
3. **Fixed PDF export** — Mermaid diagrams render as embedded PNG images in print output across all browsers
4. **Replaced deprecated `unescape()`** — Zero `unescape()` calls in codebase (may be no-op if PNG rasterization removes all SVG→base64 paths)
5. **Fixed `bg-gray-750`** → `bg-gray-700` in dark mode sidebar
6. **Toast timer cleanup** — No more setState on unmounted component
7. **React error boundary** — Graceful fallback for layout shell errors, compatible with TanStack Router's errorComponent
8. **CSS `print-color-adjust`** — Standard property alongside vendor prefix
9. **Server function tests** — Thorough coverage for 3 high-priority functions (progress, github-fetch, memory-files) with error path testing
10. **Coverage reporting** — Verified vitest coverage thresholds + test:coverage script

## Recommended Workflow (per validation G9-G11)

```
Phase 1 — Spike (30 min): POC Canvas SVG→PNG with real mermaid SVG
Phase 2 — Foundation (2.5h): task-217 (Canvas utility with CSS inlining)
Phase 3 — Export Fixes (3.5h): task-218 (Word) + task-219 (PDF)
Phase 4 — Quick Wins (0.75h): task-221 (bg-gray-750) + task-222 (toast) + task-224 (print-color-adjust) — parallel
Phase 5 — Hardening (5.5h): task-223 (error boundary) + task-225 (server tests) + task-220 (unescape cleanup)
Phase 6 — Verification (1h): task-226 (coverage) + E2E Word/PDF screenshots
```

Total: ~13.75h ≈ 1.5 weeks

## Shared Definition of Done (addresses G11)

All tasks in this milestone are considered complete when:
- [ ] TS 0 errors (`npx tsc --noEmit` clean)
- [ ] All tests pass (`npx vitest run` 97+ tests, 0 failures)
- [ ] Build succeeds (`npx vite build`)
- [ ] No `unescape()` calls in codebase (`grep -r "unescape" src/` empty)
- [ ] No invalid Tailwind classes (`grep -r "gray-750" src/` empty)
- [ ] Manual Word verification screenshot attached (mermaid diagrams visible in Word)
- [ ] Manual PDF verification screenshots attached (mermaid diagrams visible in Chrome/Firefox/Safari PDF output)

## Success Criteria

- [ ] Word export: mermaid diagrams visible when .doc opened in Microsoft Word 365/2021+ (screenshot required)
- [ ] Word export: mermaid diagrams visible when .doc opened in LibreOffice Writer (secondary)
- [ ] PDF export: mermaid diagrams visible in print output across Chrome, Firefox, Safari (screenshots required)
- [ ] `unescape()` removed from codebase — zero deprecated API usage
- [ ] `bg-gray-750` removed — all Tailwind classes valid
- [ ] No React warnings about state updates on unmounted components
- [ ] React error boundary catches layout shell errors, preserves TanStack Router error handling
- [ ] All 97 existing tests still pass; 16+ new server function tests added
- [ ] Coverage thresholds met (50% statements, 40% branches, 50% functions, 50% lines)
- [ ] TS 0 errors, build clean
