# Changelog

All notable changes to ACP Enhanced Visualizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
