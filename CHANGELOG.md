# Changelog

All notable changes to ACP Enhanced Visualizer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
