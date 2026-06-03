# System Architecture
# Update monthly or when service boundaries change
# last_verified: 2026-06-03

## System Map

```
Browser (React SPA)
  │
  ├─ TanStack Start Server Functions (Node.js)
  │   ├─ progress.ts       — readFileSync → js-yaml → sanitizeDates → Zod → typed JSON
  │   ├─ watch.ts          — statSync → mtime for polling
  │   ├─ github-fetch.ts   — raw.githubusercontent.com with ETag caching
  │   ├─ remote-watch.ts   — HEAD + ETag for remote change detection
  │   ├─ memory-files.ts   — Parse sessions, ADRs, lessons, patterns, packages, audits
  │   ├─ shutdown.ts       — POST /api/shutdown + getServerInfo
  │   └─ projects-config.ts — Load/save .visualizer-projects.json
  │
  └─ Client Components
      ├─ useProgressData()     — hook: dual-source fetch + adaptive polling (2s/10s)
      ├─ fuse.js index         — fuzzy search across milestones + tasks
      ├─ TanStack Table        — sortable milestone grid
      ├─ PollManager           — shared adaptive polling (M30)
      ├─ TabBar + ProjectTabs  — multi-project dashboard (M30)
      └─ 20+ components across Dashboard, Intelligence, Management sections
```

## Service Boundaries

| Layer | Responsibility |
| --- | --- |
| `server/routes/api/` | 7 server functions: progress, watch, github-fetch, remote-watch, memory-files, shutdown, projects-config |
| `src/lib/types.ts` | TypeScript interfaces: ProgressData, ProjectMetadata, Milestone, Task, WorkEntry |
| `src/lib/schemas.ts` | Zod schemas with nullable current_milestone, date coercion, item preprocessors |
| `src/lib/yaml-loader.ts` | Parse YAML → sanitizeDates → Zod validate → inject IDs → typed ProgressData |
| `src/lib/data-source.ts` | React hook: dual-source (local/GitHub), adaptive polling (2s/10s), per-project config |
| `src/lib/search.ts` | fuse.js index builder for client-side fuzzy search |
| `src/lib/config.ts` | DataSourceConfig parser, token resolution (client-safe, no fs) |
| `src/lib/projects.ts` | ProjectConfig types, client-safe env parsing |
| `src/lib/poll-manager.ts` | Shared PollManager with adaptive intervals (M30) |
| `src/lib/format-error.ts` | Human-readable ZodError → UI-friendly messages |
| `src/components/` | 20+ components: table, tree, badges, filters, search, progress, tabs, dialogs, aggregate, timeline, ADR browser, lessons feed, pattern library, package inventory, audit index, server controls, rate limit banner |

## Key Data Flows

1. **Page load** → `useProgressData(config)` → detects source type → routes to `fetchProgress` or `fetchGitHubProgress` → sanitizeDates → Zod validate → inject IDs → typed ProgressData → render
2. **Polling** → adaptive: 2s local (`statSync`), 10s remote (`HEAD + ETag`) → if mtime/ETag changed → re-fetch
3. **Search** → user types → fuse.js on indexed milestones+tasks → filter results
4. **Filtering** → user clicks status → supports active, in_progress, completed, not_started
5. **Multi-project** → TabBar with URL-driven state (`?tab=name`) → all tabs rendered simultaneously (CSS visibility)
6. **Memory views** → server functions parse agent/memory/*.md → typed data → SessionTimeline, ADRBrowser, etc.
7. **Server lifecycle** → Stop button → POST /api/shutdown → beforeunload sendBeacon for auto-cleanup

## Routes (13)

| Route | Component | Section |
|-------|-----------|---------|
| `/` | AggregateHome / ProjectTab | Dashboard |
| `/milestones` | MilestoneTable / MilestoneTree | Dashboard |
| `/search` | SearchPage (fuse.js) | Dashboard |
| `/sessions` | SessionTimeline | Intelligence |
| `/adrs` | ADRBrowser | Intelligence |
| `/lessons` | LessonsFeed | Intelligence |
| `/patterns` | PatternLibrary | Intelligence |
| `/packages` | PackageInventory | Management |
| `/audits` | AuditIndex | Management |

## Testing & CI

| Layer | Tool | Coverage |
| --- | --- | --- |
| Unit | Vitest + jsdom | yaml-loader (10), hooks (4), components (6), integration (3), sync (2), remote-render (14), CLI E2E (4) = 43 tests |
| CI | GitHub Actions | lint (tsc --noEmit), test (vitest run), build (vite build) on push/PR |
| Schema sync | sync.test.ts | Validates against real ACP Enhanced 5354-line progress.yaml |

## External Dependencies

- **ACP Enhanced's progress.yaml** — primary data source (local filesystem or GitHub remote)
- **TanStack Start** — SSR framework with server functions + file-based routing
- **TanStack Router** — file-based routing with SSR
- **TanStack Table** — headless table with sorting
- **fuse.js** — client-side fuzzy search
- **js-yaml** — YAML parser (server-side with Date sanitization)
- **Zod** — runtime schema validation
- **Vitest + Testing Library** — test framework
- **Vite** — build tool with TanStack Start plugin
