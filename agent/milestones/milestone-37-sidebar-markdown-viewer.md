# Milestone: M37 — Collapsible Sidebar & Markdown Viewer 2.0

**Priority**: 2  
**Status**: planned  
**Progress**: 0  
**Estimated Weeks**: 1  
**Tasks**: 8  

## Summary

Two UX upgrades: (1) collapsible sidebar with icon-only mode, (2) best-in-class markdown viewer with syntax highlighting, table of contents, anchor links, dark theme, copy buttons, and drag-and-drop file support. Targets GitHub + Docusaurus feature parity.

## Part 1: Collapsible Sidebar

Collapse the main sidebar to icon-only mode, saving ~160px of horizontal space.

### Features
- Toggle button (☰/✕) at top of sidebar
- Collapsed: icons only with tooltips on hover
- Expanded: current layout (icons + labels)
- State persisted in localStorage
- Smooth CSS transition (200ms)
- Works independently of per-section `CollapsibleSection` expand/collapse

## Part 2: Markdown Viewer 2.0

Upgrade from basic `marked` rendering to a full-featured markdown viewer.

### Core Rendering
- Syntax highlighting via `rehype-highlight` (10 common languages, tree-shakeable ~40KB)
- GitHub-Flavored Markdown: task lists, strikethrough, auto-linked URLs
- Responsive tables with horizontal scroll
- Heading anchor links (`#`) on hover (copy section URL)

### Navigation
- Auto-generated floating table of contents (right sidebar)
- Active section highlighting on scroll via IntersectionObserver
- Back-to-top floating button

### Code Blocks
- Language badge (top-right of code block)
- One-click copy button with "Copied!" feedback

### Document Controls
- Drag-and-drop any `.md` file onto viewer to open
- Dark/light theme toggle
- Font size control (S/M/L)
- Fullscreen mode

### Visual Polish
- Professional typography (system font stack, proper line-height)
- Blockquote styling with colored left border
- Image lightbox on click
- Print-friendly styles

## Tasks

### task-192: Collapsible sidebar
- Add toggle state + localStorage persistence in `__root.tsx`
- Collapse to icon-only with CSS transition
- Tooltips on hover in collapsed mode
- Estimated: 1h

### task-193: Markdown core upgrade (rehype-highlight, GFM)
- Install `rehype-highlight` + `lowlight` with 10 languages (js, ts, bash, yaml, json, md, css, html, python, sql)
- Configure `marked` with GFM, breaks, smartLists
- Add highlight.js CSS theme (github-dark)
- Estimated: 1h

### task-194: Table of contents + anchor links
- Parse headings from rendered HTML, generate TOC tree
- Floating TOC sidebar (right side, collapsible)
- Active section tracking on scroll via IntersectionObserver
- Heading anchor links: `#` appears on hover, click copies URL
- Estimated: 1h

### task-195: Code block enhancements
- Language badge (top-right of code block, extracted from fence info)
- Copy-to-clipboard button with "Copied!" feedback
- Estimated: 0.5h

### task-196: Drag-and-drop + document controls
- Drop zone overlay for external `.md` files
- FileReader → parse → display
- Theme toggle (light/dark), font size (S/M/L), fullscreen
- Back-to-top floating button
- Estimated: 1h

### task-197: Visual polish + responsive
- Typography: system font stack, proper heading scales
- Blockquotes, image lightbox, link styling
- Print styles (@media print)
- Responsive layout (TOC collapses on narrow screens)
- Estimated: 0.5h

### task-198: Tests
- Component test for upgraded DocsViewer
- Test syntax highlighting output
- Test drag-and-drop acceptance
- Estimated: 0.5h
