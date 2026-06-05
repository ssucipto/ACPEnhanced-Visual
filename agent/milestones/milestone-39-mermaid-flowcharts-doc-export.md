# Milestone: M39 — Mermaid Flowcharts + Document Export

**Priority**: 2
**Status**: planned
**Progress**: 0
**Estimated Weeks**: 1
**Tasks**: 8

## Summary

Upgrade the DocsViewer with reliable, impressive Mermaid diagram rendering and add one-click export to Word (.docx) and PDF with full diagram fidelity. Mermaid diagrams render as interactive SVGs with zoom/pan, and exports embed diagrams as vector graphics so they remain crisp at any zoom level.

## Why This Matters

Current Mermaid integration is unreliable — diagrams sometimes don't render, the pipeline has ordering issues, and there's no fallback UI. Export capability is entirely missing — users can't share rendered documents outside the browser. M39 makes the DocsViewer a complete document viewing AND sharing tool.

## Design Principles

1. **Mermaid must always render** — if the library fails, show the raw code gracefully
2. **Exports must be pixel-perfect** — diagrams embed as SVG in Word/PDF, not screenshots
3. **Zero new heavy dependencies** — use browser APIs (print, Blob, canvas) where possible
4. **Progressive enhancement** — export buttons appear only when content is loaded

---

## Part 1: Mermaid Rendering Engine

### Current Problems

1. `extractMermaid()` regex runs BEFORE `enhanceCodeBlocks()` — this is actually the correct order. Mermaid blocks (`language-mermaid`) are converted to `<div class="mermaid-container"><pre class="mermaid">` first, so `enhanceCodeBlocks` (which matches `language-*`) won't double-process them. No ordering change needed — just verify the regex is robust.

2. `securityLevel: 'sandbox'` blocks many common diagram types (sequence, class, state).

3. `renderMermaid` is called with a 50ms timeout — if the DOM hasn't settled, `querySelectorAll('pre.mermaid')` returns nothing and diagrams are silently skipped.

4. No retry: if `import('mermaid')` fails (network, bundle error), diagrams are silently dropped.

5. No loading indicator — users see blank space where diagrams should be.

### task-209: Fix Mermaid rendering pipeline

**Objective**: Make mermaid rendering reliable — every diagram renders or shows a clear fallback.

**Implementation**:

- **Verify current ordering is correct**: `extractMermaid` → `enhanceCodeBlocks` (mermaid first avoids double-wrapping). No ordering change needed.
- Change `securityLevel` from `'sandbox'` to `'loose'` for full diagram type support
- Replace 50ms timeout with `requestAnimationFrame(() => setTimeout(renderMermaid, 0))` for reliable post-paint execution
- Add retry: if `import('mermaid')` fails, retry once after 2s, then show fallback
- Add loading spinner overlay on mermaid containers: "🔄 Rendering diagram…"
- Add error fallback for each diagram: show the raw mermaid code in a styled `<pre>` block with "⚠️ Diagram rendering failed" header
- **Large diagram guard**: if SVG output exceeds 500KB, wrap in scrollable container with zoom controls instead of inline rendering

**Files**: `src/components/DocsViewer.tsx`

**Estimated**: 1.5h

### task-210: Mermaid interactive UX

**Objective**: Diagrams look impressive and are interactive.

**Implementation**:

- **Click to zoom**: Click any mermaid diagram → opens in the existing image lightbox (reuse `lightboxSrc` pattern, but for SVG content)
- **Pan support**: In zoomed view, mouse drag pans the diagram
- **Copy diagram source**: "Copy Mermaid" button on each diagram — copies the raw mermaid code to clipboard
- **Download as SVG**: "Download SVG" button — downloads the rendered SVG file
- **Dark mode integration**: Already configured (`theme: dark ? 'dark' : 'neutral'`), verify all diagram types respect it
- **Responsive scaling**: Diagrams scale to fit container width, horizontal scroll on overflow

**Files**: `src/components/DocsViewer.tsx`, `src/styles.css`

**Estimated**: 1.5h

---

## Part 2: Export Engine

### Architecture

```
Rendered HTML + Mermaid SVGs (in DOM)
        │
        ├─→ Export to Word: wrap HTML in Word-compatible template
        │   └─→ Embed SVGs as inline vector graphics
        │   └─→ Blob with application/msword MIME → download
        │
        └─→ Export to PDF: clone content area into print-friendly layout
            └─→ window.print() with @media print CSS
            └─→ SVGs render as vector in PDF (browser print handles this)
```

### Key Decision: SVG embedding in Word

Word (.docx) doesn't natively support inline SVG in its HTML import. Two approaches:

**Option A (chosen)**: Use `html-docx-js` approach — serialize the DOM to an HTML blob with `application/msword` MIME type. Modern Word (2016+) opens this correctly. SVGs are included as `<svg>` tags directly in the HTML — Word 2016+ renders them.

**Option B**: Use the `docx` npm package for proper .docx generation. Heavier dependency (~200KB) but produces standards-compliant .docx files with embedded images.

**Chosen: Option A** — minimal dependency, works in all modern Word versions, SVGs stay as vectors.

### task-211: Export to Word (.doc)

**Objective**: One-click export of the rendered document to a Word-compatible file with all diagrams preserved.

**Implementation**:

- Add "📥 Word" button to DocsViewer floating controls (visible when content is loaded)
- On click:
  1. Clone the content area DOM
  2. Remove UI elements (TOC sidebar, code copy buttons, heading anchors, floating controls)
  3. **Inline all CSS styles** into the cloned DOM (Word ignores external stylesheets — must use inline `style=""` attributes or embedded `<style>`)
  4. Convert relative links to absolute
  5. Wrap in Word-compatible HTML template: `<!DOCTYPE html>` with `@page` directive for margins
  6. Create Blob with `application/msword` MIME type
  7. Trigger download as `{document-name}.doc` (filename from sidebar selection or "document")
- Preserve: headings, paragraphs, tables, code blocks (monospace), blockquotes, mermaid SVGs (inline), images
- Word-compatible styling: embedded `<style>` block with Word-supported CSS properties (margin, padding, font-size, border, color, background)

**Files**: `src/components/DocsViewer.tsx`, new `src/lib/export-word.ts`

**Estimated**: 1.5h

### task-212: Export to PDF

**Objective**: One-click export to PDF with all diagrams at print quality.

**Implementation**:

- Add "📄 PDF" button to DocsViewer floating controls
- On click: trigger `window.print()`
- Existing `@media print` CSS already handles:
  - Hide sidebars, floating controls, TOC
  - Black text on white background
  - Code blocks with light background + border
  - Full-width content
- Add `@media print` rules for:
  - Mermaid SVGs: ensure they fit page width, prevent page breaks inside diagrams
  - Tables: repeat headers on page breaks
  - Page margins: 1-inch all sides
  - Forced page breaks before H1 headings

**Files**: `src/components/DocsViewer.tsx`, `src/styles.css`

**Estimated**: 1h

---

## Part 3: Integration & Tests

### task-213: Export pipeline tests

**Objective**: Verify mermaid rendering and export work correctly.

**Implementation**:

- Test mermaid block extraction: verify `<code class="language-mermaid">` → `<svg>` in DOM
- Test mermaid fallback: corrupt diagram → "Rendering failed" + raw code shown
- Test Word export: Blob created with correct MIME type, contains SVG elements
- Test PDF export: print CSS rules exist, content area cloned correctly
- Test export buttons visible only when content loaded

**Files**: `test/components/docs-viewer.test.tsx`

**Estimated**: 1h

### task-214: Mermaid + export visual polish

**Objective**: Export controls look native and professional.

**Implementation**:

- Export buttons grouped in floating controls: "📥 Word | 📄 PDF"
- Loading spinner during Word export generation
- Toast notification: "✅ Document exported as {name}.doc"
- Keyboard shortcuts: Ctrl+Shift+E → Export menu
- Mobile-friendly: buttons stack vertically on narrow screens
- Empty state: buttons hidden when no document selected

**Files**: `src/components/DocsViewer.tsx`, `src/styles.css`

**Estimated**: 0.5h

---

## task-215: Pre-implementation audit

**Objective**: Catch gaps before coding starts.

**Actions**: Run `/acp-audit --pre-impl M39` to verify:
- Mermaid 11.15.0 API compatibility with the plan
- SVG-to-Word compatibility across Word 2016/2019/365
- Print CSS coverage for all prose elements
- No missing edge cases (empty diagrams, invalid syntax, very large diagrams)

**Estimated**: 0.5h

---

## task-216: Implementation

**Objective**: Implement all tasks 209-214.

**Actions**: Run `/acp-proceed --complete M39` after audit passes.

**Estimated**: 6h implementation + 1h tests = 7h total

---

## Files Affected

### Modified
- `src/components/DocsViewer.tsx` — mermaid pipeline fix, export buttons, zoom UI
- `src/styles.css` — print styles, mermaid zoom, export button styles

### New
- `src/lib/export-word.ts` — Word document generator

### Test files
- `test/components/docs-viewer.test.tsx` — new mermaid + export tests

---

## Data Flow

```
Markdown content
     │
     ├─ marked() → HTML
     ├─ enhanceCodeBlocks() → code wrappers
     ├─ extractMermaid() → mermaid containers
     ├─ wrapTables() → responsive tables
     └─ addAnchors() → heading links + TOC
           │
     DOM rendered (dangerouslySetInnerHTML)
           │
     ┌─────┴─────────────────────┐
     │                           │
  renderMermaid()           Export Engine
     │                           │
     ├─ import('mermaid')        ├─ clone DOM for Word
     ├─ querySelectorAll         ├─ strip UI chrome
     │   ('pre.mermaid')         ├─ embed SVGs inline
     ├─ mermaid.render()         ├─ Blob → download .doc
     └─ inject SVG into DOM      │
                                 └─ window.print() → PDF
```

## Acceptance Criteria

- [ ] Mermaid diagrams render reliably on first load (no 50ms race condition)
- [ ] Failed diagrams show raw code + error message (not silently dropped)
- [ ] Click-to-zoom works on mermaid diagrams
- [ ] "Copy Mermaid" and "Download SVG" buttons work
- [ ] Export to Word produces a valid .doc file with embedded SVGs
- [ ] Export to PDF via print produces correctly formatted output
- [ ] Export buttons hidden when no document selected
- [ ] Toast notification on successful export
- [ ] Dark mode mermaid diagrams match theme
- [ ] All 92 existing tests pass
- [ ] ~5 new tests pass
- [ ] TypeScript compiles with zero errors
