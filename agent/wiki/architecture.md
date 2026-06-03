# System Architecture
# Update monthly or when service boundaries change
# last_verified: 2026-06-03

## System Map

```
Browser (React SPA)
  │
  ├─ TanStack Start Server Functions (Node.js)
  │   ├─ fetchProgress()   — readFileSync → Zod parse → typed JSON
  │   └─ fetchWatchToken() — statSync → mtime for polling
  │
  └─ Client Components
      ├─ useProgressData()  — hook: fetch + 2s poll loop with cleanup
      ├─ fuse.js index      — fuzzy search across milestones + tasks
      ├─ TanStack Table     — sortable milestone grid
      └─ StatusBadge        — emerald (active), green (completed), blue (in_progress), gray (not_started)
```

## Service Boundaries

| Layer | Responsibility |
| --- | --- |
| `server/routes/api/` | Server functions: read YAML, return typed JSON with formatted errors |
| `src/lib/types.ts` | TypeScript interfaces: ProgressData, Milestone, Task, WorkEntry |
| `src/lib/schemas.ts` | Zod schemas replacing `as` assertions — runtime validation |
| `src/lib/yaml-loader.ts` | Parse YAML → Zod validate → inject IDs → typed ProgressData |
| `src/lib/format-error.ts` | Human-readable ZodError → UI-friendly messages |
| `src/lib/data-source.ts` | React hook: fetch + 2s mtime poll + cleanup |
| `src/lib/search.ts` | fuse.js index builder for client-side fuzzy search |
| `src/components/` | 10 components: table, tree, badges, filters, search, progress |

## Key Data Flows

1. **Page load** → `useProgressData()` calls `fetchProgress()` → readFileSync → js-yaml → Zod validate → inject milestone/task IDs → typed ProgressData → render
2. **Polling** → every 2s, calls `fetchWatchToken()` → statSync mtime → if changed, re-fetch
3. **Search** → user types → `SearchBar` → fuse.js on indexed milestones+tasks → filter results
4. **Filtering** → user clicks status → `FilterBar` supports active, in_progress, completed, not_started
5. **Error handling** → ZodError → `formatParseError()` → field-path messages → `whitespace-pre-wrap` UI

## Testing & CI

| Layer | Tool | Coverage |
| --- | --- | --- |
| Unit | Vitest + jsdom | yaml-loader (10), hooks (4), components (6), integration (3), sync (2) |
| CI | GitHub Actions | lint (tsc), test (vitest), build (vite) on push/PR |
| Schema sync | sync.test.ts | Validates against real ACP Enhanced 5354-line progress.yaml |

## External Dependencies

- **ACP Enhanced's progress.yaml** — the data source (local filesystem, no network)
- **TanStack Start** — SSR framework with server functions + file-based routing
- **fuse.js** — client-side fuzzy search
- **js-yaml** — YAML parser (server-side)
- **Zod** — runtime schema validation
- **@tanstack/react-table** — headless table with sorting
- **Vitest + Testing Library** — test framework
| git commit touching >5 files | Treat as phase boundary → write sessions.md |

**Corollary**: `/acp-commit` is NOT an end-of-session-only command. It runs at every phase boundary.
The session-end `/acp-commit` finalises a session that already has most entries written.

## Dispatch Script Flow (Persona B/C)

```
npx ts-node scripts/acp-dispatch.ts agent/routing/tasks/task-NNN.md
     ↓
  Read task frontmatter (gray-matter)
  Look up executor in taxonomy.yml
  Assemble system prompt (Layer 1 + skill) — STATIC for caching
  Assemble user message (sessions + lessons + task) — dynamic
  Enforce 6,500 token budget
  Update agent/core/routing.yml with executor
  Call OpenRouter API (streaming)
  Append row to agent/routing/ledger.md
```
