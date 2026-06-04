# Milestone: M38 — Extended Visualizations 2.0

**Priority**: 1
**Status**: planned
**Progress**: 0
**Estimated Weeks**: 2
**Tasks**: 10

## Summary

Upgrade all 6 "Extended Visualizations" views (Session Timeline, ADR Browser, Lessons Feed, Pattern Library, Package Inventory, Audit Index) from minimal read-only displays into rich, interactive analytical dashboards. Each view gets search, filtering, stat summaries, source file linking, and consistent visual polish. The result: these views become genuinely useful for daily ACP workflow — not just checkboxes on a feature list.

## Why This Matters

These 6 views are the visualizer's window into ACP Enhanced's memory layer — sessions, decisions, lessons, patterns, packages, and audits. Currently they render raw data with minimal interaction. Real-world ACP projects accumulate hundreds of entries across these domains. Without search, filtering, and summaries, the views are only useful for projects with <10 entries. M38 makes them scale.

## Design Principles

1. **Progressive disclosure** — show summaries first, let users drill down
2. **Consistent UX** — all 6 views share the same layout pattern (stats → filters → list/table)
3. **Source-linked** — every entry links back to its `.md` source file in the DocsViewer
4. **Keyboard-friendly** — search autofocus, Esc to clear, arrow key navigation
5. **Responsive** — stat cards collapse gracefully, tables scroll horizontally

---

## Part 1: Cross-Cutting Infrastructure

These two tasks build shared components used by all 6 views. They must be completed first.

### StatsRow component

A horizontal row of stat cards (like AggregateHome but reusable). Each card: icon, label, value, optional trend indicator. Supports 2-4 cards that collapse to 2-column on narrow screens.

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 📅 47       │ ✅ 312      │ ⚡ 6.6 avg   │ 🕐 Jun 2026  │
│ Sessions    │ Tasks Done   │ Tasks/Sess  │ Last Active  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### SourceLink component

A small button/link that opens the source `.md` file in the DocsViewer at the relevant section. Parses `agent/memory/*.md` paths and anchor IDs. Falls back to opening in a new tab if DocsViewer route isn't available.

---

## Part 2: Per-View Upgrades

### Session Timeline (`/sessions`)

**Current state**: Flat list, collapsible entries with done/deferred, executor + task count.

**Target state**:

- **Stats bar**: total sessions, total tasks completed across all sessions, avg tasks/session, most recent session date
- **fuse.js search**: across executor name, done/deferred item text, key_fact content
- **key_fact display**: show `key_fact` inline in collapsed row header (currently only visible when expanded)
- **Date grouping**: group sessions by week with `### Week of Jun 2` headers, collapsible week groups
- **Session duration**: compute and show duration if start/end timestamps available
- **Empty state CTA**: "No sessions yet. Run `/acp-commit` to record your first session."

**Real-world workflow**: Developer finishes a session, runs `/acp-commit`, then opens the visualizer to verify it was recorded. They search for a specific task to confirm it appears in done/deferred.

### ADR Browser (`/adrs`)

**Current state**: Status filter buttons, truncated context/decision at 200 chars, reopen warnings.

**Target state**:

- **Stats bar**: total ADRs, accepted count, deprecated count, most recent
- **fuse.js search**: across title, context, decision, consequences
- **Full-text expand**: "Read more" / "Show less" toggle instead of hard 200-char truncation
- **Consequences field**: parse and display `**Consequences**:` from ADR body
- **Date display**: parse date from ADR header or metadata
- **Source link**: each ADR links to its section in `agent/memory/decisions.md`
- **Empty state CTA**: "No ADRs found. Run `/acp-decide` to record architecture decisions."

**Real-world workflow**: Team member asks "why did we choose TanStack Start?" Developer opens ADR Browser, searches "tanstack", finds ADR-001, reads full decision + consequences.

### Lessons Feed (`/lessons`)

**Current state**: Grouped by task_type, mistake/correction pairs, priority colors.

**Target state**:

- **Stats bar**: total lessons, high-priority count, unique task_types, most common mistake category
- **fuse.js search**: across task_type, mistake text, correction text
- **Priority filter**: toggle buttons for high/medium/low (like ADR status filter)
- **Date per lesson**: if available in source data, show when lesson was recorded
- **Frequency indicator**: "Seen 3 times" if same mistake appears across multiple sessions
- **Empty state CTA**: "No lessons recorded. Run `/acp-commit` with lessons learned."

**Real-world workflow**: Developer about to start a task type they've struggled with before. Opens Lessons Feed, filters by that task_type, reads past mistakes to avoid repeating them.

### Pattern Library (`/patterns`)

**Current state**: Text search, name + description + code_ref badges.

**Target state**:

- **Stats bar**: total patterns, patterns with code refs, most recent addition
- **Category/tag grouping**: parse tags from pattern metadata, group by category with section headers
- **Clickable code refs**: `code_ref` becomes a link that opens the DocsViewer at that file/path
- **Copy code button**: if pattern includes a code snippet, add copy-to-clipboard
- **Usage count**: if pattern metadata includes usage frequency, display it
- **Empty state CTA**: "No patterns yet. Run `/acp-commit` — reusable patterns are auto-detected."

**Real-world workflow**: Developer needs to implement error handling. Opens Pattern Library, searches "error", finds the error-handling pattern with code refs, clicks through to see actual implementation.

### Package Inventory (`/packages`)

**Current state**: Two tabs (NPM/ACP), DepTable with version/wanted/latest columns.

**Target state**:

- **Stats bar**: total packages (NPM+ACP), outdated count, ACP packages count, direct deps count
- **fuse.js search**: across package names (both tabs simultaneously)
- **Outdated highlighting**: amber background on rows where installed ≠ latest, with upgrade arrow
- **License column**: show license type from package.json where available
- **"Check for updates" button**: triggers re-fetch with fresh data
- **Empty state**: "No ACP packages installed. Run `/acp-package-install` to add packages."

**Real-world workflow**: Developer runs `npm outdated`, then opens Package Inventory to see both NPM and ACP package status in one view. Spots an outdated ACP package, clicks through to its source.

### Audit Index (`/audits`)

**Current state**: Table with #, subject, date, findings, severity badge. No interaction.

**Target state**:

- **Stats bar**: total audits, total findings, open findings (from report status), critical count
- **fuse.js search**: across subject and report content
- **Severity filter**: toggle buttons (critical/high/medium/low)
- **Status column**: parse open/resolved from report metadata, color-coded badge
- **Source links**: each row links to its `agent/reports/audit-N-*.md` file in DocsViewer
- **Trend sparkline** (optional): mini bar chart showing findings per audit over time
- **Empty state CTA**: "No audit reports. Run `/acp-audit` to investigate a subject."

**Real-world workflow**: Project manager asks "are there any open critical findings?" Developer opens Audit Index, filters by critical + open, sees 2 items, clicks through to read full reports.

---

## Part 3: Visual Polish & Consistency

### task-207: Visual polish — consistent design language

- **Unified layout pattern**: Every view: `StatsRow → FilterBar → Content`. Same spacing, same max-width.
- **Loading skeletons**: Replace "Loading…" text pulses with Tailwind `animate-pulse` skeleton cards that match the actual content shape.
- **Empty states**: Every empty state: icon + heading + description + CTA button. No dead "No X found" messages.
- **Responsive**: Stat cards 4-col → 2-col at `md` breakpoint → 1-col at `sm`. Tables get `overflow-x-auto` wrapper.
- **Dark mode**: All new components support `dark:` variants.
- **Print styles**: Hide sidebars, show full content.

### task-208: Tests

- Minimum 2 component tests per enhanced view (12 total)
- Test search/filter interactions (type → results update)
- Test stat card calculations (correct counts)
- Test empty states render with CTA
- Test source links render with correct href
- Server function tests for any new parser logic
- All existing 86 tests must still pass

---

## Tasks

### task-199: StatsRow shared component + SourceLink

Create two reusable components:
- `src/components/StatsRow.tsx` — horizontal stat cards (icon, label, value, optional trend). Supports 2-4 cards, responsive collapse.
- `src/components/SourceLink.tsx` — button that links to DocsViewer at specific file + anchor. Parses file paths, generates `#anchor-id` from section title.

**Estimated**: 2h

### task-200: Server function enhancements

Add missing data fields to server functions in `server/routes/api/memory-files.ts`:
- SessionEntry: parse `key_fact`, `duration`, `start_time`/`end_time` if available
- ADREntry: parse `consequences`, `date` fields
- LessonEntry: parse `date` per mistake entry, deduplicate for frequency count
- PatternEntry: parse `tags`/`categories`, `usage_count`
- AuditEntry: parse `status` (open/resolved) from report metadata
- PackageEntry: add `license` field parsing

**Estimated**: 1.5h

### task-201: Session Timeline 2.0

- Add `StatsRow` with session count, total tasks, avg tasks/session, last active date
- Add fuse.js search bar across executor, done/deferred items, key_fact
- Show `key_fact` in collapsed row header (subtle italic text)
- Group sessions by week with date headers
- Add empty state CTA

**Estimated**: 2h

### task-202: ADR Browser 2.0

- Add `StatsRow` with total, accepted, deprecated counts
- Add fuse.js search across title, context, decision, consequences
- Replace 200-char truncation with "Read more" / "Show less" toggle
- Display consequences and date fields
- Add SourceLink to `agent/memory/decisions.md`
- Add empty state CTA

**Estimated**: 1.5h

### task-203: Lessons Feed 2.0

- Add `StatsRow` with total lessons, high-priority count, unique task_types
- Add fuse.js search across task_type, mistake, correction
- Add priority filter toggle buttons (high/medium/low)
- Show date per lesson entry if available
- Add duplicate frequency indicator ("Seen N times")
- Add empty state CTA

**Estimated**: 1.5h

### task-204: Pattern Library 2.0

- Add `StatsRow` with total patterns, with-code-refs count
- Add category/tag grouping with section headers
- Make `code_ref` a clickable SourceLink
- Add copy-to-clipboard for code snippets
- Add empty state CTA

**Estimated**: 1.5h

### task-205: Package Inventory 2.0

- Add `StatsRow` with total packages, outdated count, ACP count
- Add fuse.js search across NPM + ACP tabs
- Highlight outdated rows with amber background
- Add license column to NPM dep table
- Add "Check for updates" refresh button
- Add empty state CTA

**Estimated**: 1.5h

### task-206: Audit Index 2.0

- Add `StatsRow` with total audits, total findings, open count, critical count
- Add fuse.js search across subject
- Add severity filter toggle buttons
- Add status column (open/resolved) with color badge
- Add SourceLink to `agent/reports/audit-N-*.md`
- Add empty state CTA

**Estimated**: 2h

### task-207: Visual polish — consistent design language

- Apply unified layout to all 6 views
- Loading skeletons for all views
- Consistent empty states with CTAs
- Responsive stat cards (4→2→1 col)
- Dark mode support
- Print styles

**Estimated**: 1.5h

### task-208: Tests

- 2 component tests per view (12 tests)
- Test search, filter, stat calculations, empty states, source links
- Server function parser tests
- Verify full suite passes (86 existing + ~15 new = ~101 tests)

**Estimated**: 2h

---

## Data Flow

```
agent/memory/sessions.md  ──→  fetchSessions()  ──→  SessionTimeline
agent/memory/decisions.md ──→  fetchADRs()       ──→  ADRBrowser
agent/memory/lessons.md   ──→  fetchLessons()    ──→  LessonsFeed
agent/memory/patterns.md  ──→  fetchPatterns()   ──→  PatternLibrary
agent/manifest.yaml       ──→  fetchPackages()   ──→  PackageInventory
agent/reports/audit-*.md  ──→  fetchAudits()     ──→  AuditIndex
                                      │
                              StatsRow + SourceLink (shared)
                                      │
                              fuse.js search indexes (per-view)
```

## Files Affected

### New files
- `src/components/StatsRow.tsx`
- `src/components/SourceLink.tsx`

### Modified files
- `server/routes/api/memory-files.ts` — enhanced data fields
- `src/components/SessionTimeline.tsx` — full rewrite
- `src/components/ADRBrowser.tsx` — full rewrite
- `src/components/LessonsFeed.tsx` — full rewrite
- `src/components/PatternLibrary.tsx` — full rewrite
- `src/components/PackageInventory.tsx` — full rewrite
- `src/components/AuditIndex.tsx` — full rewrite
- `src/styles.css` — skeleton + dark mode additions

### New test files
- `test/components/stats-row.test.tsx`
- `test/components/source-link.test.tsx`

### Modified test files
- Existing view tests (if any exist)
- `test/server-fns/memory-files.test.ts` (if created)

## Acceptance Criteria

- [ ] All 6 views render stat cards with correct counts
- [ ] fuse.js search works on every view (type → filtered results)
- [ ] Every view has per-type filters where applicable (status, priority, severity)
- [ ] SourceLink opens DocsViewer at correct file + section
- [ ] Empty states show helpful CTAs, not dead text
- [ ] Loading skeletons match content shape, not generic spinners
- [ ] Responsive: stat cards collapse, tables scroll on mobile
- [ ] Dark mode: all new components respect `dark:` variants
- [ ] Print: content visible, sidebars hidden
- [ ] All 86 existing tests pass
- [ ] ~15 new component tests pass
- [ ] TypeScript compiles with zero errors
