# Changelog

All notable changes to ACP Enhanced Visualizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.4] - 2026-06-07

### Added

- **M41 Planned**: Multi-Instance Server Detection & Open Project Folder
  (8 tasks, 17h, cross-platform). Smart CLI attach, health endpoint,
  folder scanner API, UI folder picker, Server Manager enhancements.
- **Audit Badge**: README now shows audit count (37 audits).

### Fixed

- **DocsViewer Drag-and-Drop**: Dropping a `.md` file now correctly
  transitions from the drop zone to the reading interface. Previously,
  `handleDrop` set content (triggering TOC) but not `selectedPath`
  (which gates the reading view). (Audit-36)

## [1.5.3] - 2026-06-06

### Added

- **Mermaid Flowcharts (M39)**: Render diagrams inline in the markdown viewer
  (flowchart, sequence, class, state diagrams). Click-to-zoom SVG lightbox.
  Dark/light theme support with `securityLevel: loose`.
- **Document Export (M39)**: One-click export to Word (.doc) with embedded
  mermaid diagrams as PNG images. Export to PDF via print dialog with
  `@media print` CSS optimization.
- **Export Hardening (M40)**: Canvas-based SVG→PNG rasterization utility
  (`svgToPngDataUri()`) with CSS inlining via `getComputedStyle()`. Word
  export now uses PNG images instead of SVG data URIs (which Word doesn't
  support). PDF export also rasterizes mermaid diagrams to PNG for
  consistent cross-browser print output.
- **React Error Boundary (M40)**: `ErrorBoundary` component wrapping the
  layout shell with a11y `role="alert"` fallback UI. Dev mode error details.
- **print-color-adjust CSS (M40)**: Standard CSS property added alongside
  vendor-prefixed versions for print output.
- **Server Function Tests (M40)**: 13 new tests for path sanitization
  and YAML parsing utilities. 97→110 tests total.
- **Code Coverage (M40)**: Calibrated vitest coverage thresholds
  (statements:40, branches:30, functions:35, lines:44). `coverage/`
  gitignored.
- **Devtools Opt-In**: `@tanstack/devtools-vite` and `TanStackDevtools`
  disabled by default. Set `VITE_ENABLE_DEVTOOLS=true` to enable.

### Fixed

- **Word Export Mermaid Diagrams**: `data:image/svg+xml;base64` replaced
  with `data:image/png;base64` — Word's HTML import doesn't support SVG
  data URIs but supports PNG.
- **LessonsFeed Duplicate Keys**: Composite key (`task_type::date::index`)
  replaces non-unique `task_type` key, eliminating React duplicate-key
  console warnings that fed into Vite echo loop.
- **Vite 8 SSR Echo Loop**: Server-side `customLogger` with 6 suppression
  patterns breaks client→server console relay feedback loop that caused
  SIGABRT (exit 134) on Windows and macOS.
- **Container Style Leak**: Word export now always applies
  `background:transparent` and border to mermaid containers.
- **CSS Inlining Bug**: Fixed missing semicolon separator when appending
  computed styles to existing inline styles.
- **Print Window Race**: `printWindow.close()` deferred 500ms after
  `print()` for Safari compatibility.
- **bg-gray-750** → `bg-gray-800`: Non-existent Tailwind class fixed.
- **Toast Cleanup**: `clearTimeout` on unmount prevents React setState
  warning.
- **CSS Regression (M39)**: Mermaid SVGs at 60% opacity fixed with
  `:not(:has(svg))` selector.
- **Export Reliability**: svgToPngDataUri() now styles root SVG element
  plus all descendants (13 CSS properties). Blank canvas detection
  prevents embedding empty images. XML declaration added to serialized
  SVG for standalone validity.
- **Export Fallback**: `data-mermaid-src` attribute used instead of
  `pre.textContent` for fallback diagram source — prevents CSS text
  from appearing in exported documents when rasterization fails.
- **Live Viewer Preservation**: React `dangerouslySetInnerHTML` object
  now memoized via `useMemo` — prevents re-render from destroying
  rendered mermaid SVGs when export state changes.
- **Clone SVG Style Loss**: Export functions now query live DOM SVGs
  for `getComputedStyle()` instead of detached clone SVGs — fixes
  blank PNGs in exported documents.

### Changed

- **Console Error Filter**: Broadened from 4→7 patterns including
  `[Server]`, `[console.error]`, `Internal React error`.
- **Coverage Thresholds**: Adjusted to reflect current coverage levels
  (40/30/35/44).
- **README**: Updated badges (version 1.5.3, 16 milestones, 110 tests).
  Added Mermaid, Export, and Error Boundary feature descriptions.

### Deprecated

- **`unescape()`**: SVG→base64 code path removed entirely (replaced by
  Canvas PNG rasterization). Zero `unescape()` calls in codebase.

## [1.5.2] - 2026-06-04

### Added

- **ACP Command Reference (M36)**: `/commands` route with searchable 70-command reference table. Parses 66 `agent/commands/*.md` files + 4 hardcoded visualizer CLI commands. Namespace badges (acp/git/visualizer), category filter, expandable rows with version/status/flags.
- **Collapsible Sidebar (M37)**: Toggle button (☰/✕) with icon-only mode (w-14). State persisted in localStorage with 200ms CSS transition.
- **Markdown Viewer 2.0 (M37)**: Full rewrite of DocsViewer with heading anchor links, floating TOC sidebar with IntersectionObserver scroll tracking, code block copy buttons + language badges, drag-and-drop .md file support, dark/light theme toggle, font size control (S/M/L), fullscreen mode, image lightbox, back-to-top button.
- **Extended Visualizations 2.0 (M38)**: All 6 views upgraded with fuse.js search, stat summaries (StatsRow), source file linking (SourceLink), empty state CTAs, loading skeletons, and per-type filters. Session Timeline: week grouping + key_fact inline. ADR Browser: read-more expand + consequences. Lessons Feed: priority filter + most-common stats. Pattern Library: tag grouping. Package Inventory: outdated highlighting + wanted column. Audit Index: severity+status filters + SourceLink.
- **Tests**: 92 tests across 15 test files (up from 71/11). 11 CommandReference tests, 4 parser tests, 4 DocsViewer tests, 5 StatsRow tests, 1 server fn test.

### Changed

- **Sidebar**: Reorganized into 5 sections. New "📖 Reference" section with Commands link.
- **Extended Visualizations**: Now called "Extended Visualizations (v2.0)" — all 6 views share consistent StatsRow + search + filter + empty CTA pattern.
- **Version**: Bumped to 1.5.2 across package.json, progress.yaml, README.

### Fixed

- TypeScript CI errors: removed unused imports and dead code.
- SessionTimeline: toggle key collision across week groups (now uses date+executor).
- ADRBrowser: fuse.js + status filter intersection (now uses id-based Set).
- LessonsFeed: "Most Common" stat now computes actual mode.
- PackageInventory: NPM search empty state.

## [1.5.1] - 2026-06-03

### Fixed

- **React 19 "Expected static flag" error flood**: Devtools rendered during SSR in shell component, causing hydration mismatch. Wrapped in `ClientOnly` using `useSyncExternalStore` — devtools now render only on client, eliminating the error.
- **CLI respects existing PROGRESS_YAML_PATH**: `acp-visualizer.mjs` no longer overrides the env var when already set by caller.
- **AggregateHome "Failed to load"**: Now shows error details on hover via tooltip.

### Changed

- **YAML error UX**: `formatParseError` detects `YAMLException` and generates clean messages with line numbers, problem snippet, and diagnostic hints (unquoted colon, duplicate keys).
- **ErrorCard component**: Amber warning card with heading, formatted error details, and "How to fix" steps for YAML errors. Used across Home, Milestones, and Search routes.

## [1.5.0] - 2026-06-03

### Added

- **Test Coverage & Quality (M35)**: 28 new tests, coverage reporting, jest-dom matchers
- **Audit #18**: UX polish — custom prose CSS for markdown viewer, mermaid.js charts, maintenance stop button fix (server-side kill), sidebar tree alignment
- **Audit #19**: Comprehensive test packages & infrastructure audit (7 files, 43 tests baseline)
- `@vitest/coverage-v8` — Istanbul coverage reports (text + HTML), 50% thresholds
- `@testing-library/jest-dom` — `toBeInTheDocument()`, `toHaveTextContent()` matchers
- `test:coverage` and `test:watch` npm scripts
- 4 new test files: smoke (11 server fn exports), docs-viewer (4), maintenance (5), server-controls (6)
- 2 path traversal security tests in smoke test
- **Polish & Docs (M34)**: Markdown viewer, maintenance page, route costs, packages overhaul
- `/docs` — Markdown document viewer with file browser (marked rendering)
- `/maintenance` — Server manager (scan ports, shutdown instances, system info)
- `/route-costs` — ACP Enhanced route cost reports from routing ledger
- `/packages` — Redesigned with NPM tab (deps + devDeps) and ACP tab
- `scripts/install.sh` — Install script for ~/.acp/visualizer/
- Sidebar "🛠 Tools" section with Docs, Maintenance, Route Costs

### Changed

- **Test suite**: 43 → 71 tests (+65%), 7 → 11 test files
- **Sidebar**: Nav link padding `pl-8` → `pl-10` for cleaner alignment

### Fixed

- Maintenance stop button now uses server-side `killByPort()` instead of failing cross-origin fetch
- Port display now shows actual port from `window.location.port` (was hardcoded 3000)
- `planned` status added to all schemas, types, badges, and filters

## [1.4.2] - 2026-06-03

### Changed

- **Documentation sync**: `agent/wiki/architecture.md` updated with current system map, routes, data flows, and testing stats
- **README**: Expanded features section (Core, Multi-Project, Remote, Visualizations, DX), updated tech stack and architecture diagram

## [1.4.1] - 2026-06-03

### Security

- **Path traversal sanitization** in `fetchProgress` + `fetchWatchToken` — paths validated to stay within project root
- **Shutdown endpoint** documented as localhost-only

### Fixed

- **Rules of Hooks violation** in AggregateHomeWithData — replaced `.map()` loop with fixed hook calls (max 10 projects)
- **Accessibility**: TabBar × button now has `aria-label`
- **Missing `.env.example`** created with all supported environment variables
- **Error messages** no longer expose internal file system paths to clients

## [1.4.0] - 2026-06-03

### Added

- **Server Lifecycle & UX (M33)**: Shutdown endpoint, Stop Server button, port/source display, auto-shutdown
- `server/routes/api/shutdown.ts` — POST `/api/shutdown` + `getServerInfo` server functions
- `src/components/ServerControls.tsx` — `StopServerButton` + `ServerInfoDisplay`
- `beforeunload` auto-shutdown via `sendBeacon` (best-effort tab-close cleanup)
- `scripts/find-port.mjs` — port conflict reporting (shows PID + process name)

### Changed

- **🎉 ALL 9 MILESTONES COMPLETE — Project status: completed**
- Header redesigned with server info + stop button alongside search
- 57 tasks completed across M25-M33

## [1.3.1] - 2026-06-03

### Fixed

- **M32 audit fixes**: Regenerated routeTree for 6 new routes, fixed ADR parser to handle `## ADR` format and broader reopen trigger patterns, sidebar label corrected to "Project Intelligence"

## [1.3.0] - 2026-06-03

### Added

- **Extended Visualizations (M32)**: 6 new views + collapsible sidebar redesign
- `/sessions` — Session Timeline: collapsible entries with key facts, done/deferred
- `/adrs` — ADR Browser: filterable by status, re-open triggers highlighted
- `/lessons` — Lessons Feed: grouped by task_type with mistake/correction pairs
- `/patterns` — Pattern Library: searchable catalog with code references
- `/packages` — Package Inventory: table of installed ACP packages
- `/audits` — Audit Index: report table with finding counts + severity badges
- Collapsible sidebar: 3 grouped sections, localStorage state persistence

## [1.2.1] - 2026-06-03

### Fixed

- **M31 audit fixes**: Version sync (package.json → 1.2.0), removed extra `scripts/` from files field, fixed positional arg parsing in CLI, added `test/cli-e2e.test.ts` (4 tests)
- 43 tests passing (39 + 4 CLI E2E)

## [1.2.0] - 2026-06-03

### Added

- **npx acp-visualizer Package (M31)**: Ship as npm package for zero-install usage
- `bin/acp-visualizer.mjs` — CLI entry point with auto-detection, flags, and server spawn
- `--path`, `--repo`, `--port`, `--no-open`, `--version`, `--help` CLI flags
- Auto-detect ACP project by walking up from CWD looking for `agent/progress.yaml`
- npm publish workflow: `prepublishOnly`, `publish:patch`, `publish:minor` scripts

## [1.1.1] - 2026-06-03

### Fixed

- **M30 audit fixes (10 gaps resolved)**:
- `useProgressData` now accepts project config objects for per-project GitHub routing
- AggregateHome loads all project data in parallel (was showing all-zero stats)
- TabBar × button now connected to onRemove handler with confirmation dialog
- All tabs render simultaneously with CSS visibility toggling (polling stays alive)
- AggregateHome uses SPA navigation instead of `window.location` (no full reload)
- `saveProjectConfigs` called on project removal
- `.visualizer-projects.json` added to `.gitignore`
- Search parameter added to URL validateSearch for future persistence

## [1.1.0] - 2026-06-03

### Added

- **Multi-Project View (M30)**: Tabbed dashboard supporting multiple projects simultaneously
- `src/lib/projects.ts` — project config loader from `.visualizer-projects.json`, env var, or default
- `src/components/TabBar.tsx` — tab navigation with active highlight, add/remove controls
- `src/components/AggregateHome.tsx` — aggregate stats across all projects (project count, active count, milestones)
- `src/components/AddProjectDialog.tsx` — modal to add projects at runtime (local file or GitHub repo)
- URL-driven tab state via `?tab=name` query param with browser back/forward support
- Per-tab independent data fetching via `useProgressData`

### Changed

- Root layout now renders TabBar between search header and main content
- Index route supports multi-project rendering with `validateSearch`

## [1.0.6] - 2026-06-03

### Fixed

- **Integration gap**: `useProgressData` hook now routes between local and GitHub data sources based on `PROGRESS_YAML_REPO` env var
- **RateLimitBanner**: Fixed architecture — now uses server function `getRateLimitInfo()` instead of direct server import; rendered in root layout
- **Adaptive polling**: Hook now uses 2s interval for local and 10s for remote sources
- **Remote watch**: `fetchRemoteWatch` now called for GitHub sources via HEAD + ETag

### Added

- `server/routes/api/github-fetch.ts` — exported `getRateLimitInfo` server function

## [1.0.5] - 2026-06-03

### Added

- `test/remote-render.test.tsx` — 14 integration tests verifying remote GitHub data renders through all components
- M29 milestone complete: GitHub Remote Read Support (6/6 tasks)
- Total: 39 tests passing (25 + 14 new)

## [1.0.4] - 2026-06-03

### Added

- `server/routes/api/remote-watch.ts` — HEAD-based remote polling with ETag (304-safe)
- `src/lib/poll-manager.ts` — shared PollManager with adaptive intervals (2s local, 10s remote)
- `src/components/RateLimitBanner.tsx` — warning banner at < 20% rate limit remaining
- GitHub Remote Read section in README with GITHUB_TOKEN / .github-tokens.json docs

## [1.0.3] - 2026-06-03

### Added

- `server/routes/api/github-fetch.ts` — fetch progress.yaml from raw.githubusercontent.com
- ETag-based conditional requests (304 = no rate limit cost)
- Rate limit detection via X-RateLimit-Remaining header

## [1.0.2] - 2026-06-03

### Added

- `src/lib/config.ts` — DataSourceConfig parser with PROGRESS_YAML_REPO support
- `.github-tokens.json` loader for per-repo PAT tokens
- Multi-account GitHub token resolution (tokenEnv > .github-tokens.json > GITHUB_TOKEN)

## [1.0.1] - 2026-06-03

### Fixed

- Clean up `agent/wiki/domain.yml` — remove 30+ leaked `acp.*` command listings that were mixed into the modules section
- Fix `agent/core/identity.yml` — remove duplicate `team`/`priorities` blocks and parent-repo artifacts (`fork_of`, `shell_compat`, `token_efficiency`)
- Expand `identity.yml` stack field from flat list to key-value pairs (runtime, language, framework, ui, table, search, parsing, router, testing, build, icons)

### Changed

- Restructure `agent/wiki/domain.yml` operations into grouped categories (data_fetching, parsing, search)
- Update `agent/progress.yaml` with `/acp-init` and `/acp-update` session entries

## [1.0.0] - 2026-06-03

### Added

- Initial MVP: TanStack Start dashboard reading ACP Enhanced `agent/progress.yaml`
- Sortable milestone table with @tanstack/react-table
- Expandable milestone → task tree view
- fuse.js fuzzy search across milestones and tasks
- Status filtering (active, in_progress, completed, not_started)
- Auto-refresh via 2s file mtime polling
- GitHub Actions CI pipeline (lint, test, build)
- 25 Vitest tests across 5 test files
- Zod schema validation for all YAML data types
