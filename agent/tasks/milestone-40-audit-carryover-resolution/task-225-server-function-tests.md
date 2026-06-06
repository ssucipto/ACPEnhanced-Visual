# Task 225: Server Function Test Coverage

**Task**: task-225  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P1  
**Status**: not_started  
**Estimated**: 4 hours  
**Carryover**: audit-19-F2  
**Validation Gaps Addressed**: G2 (estimate), G8 (metric quality)

## Objective

Add thorough test coverage for the 3 highest-risk server functions that currently have no direct tests. Focus on core data pipeline functions where regressions would have the most impact.

**Scope** (addresses G2/G8): This task covers 3 high-priority functions with thorough testing. The remaining 8 functions are deferred to a future milestone (M41 or later). Industry-standard testing takes 30min-3h per function for proper coverage including error paths.

## Context

The following 3 functions are the core data pipeline — regressions here break the entire dashboard:
1. **`progress.ts`** — Progress YAML fetching + path traversal security
2. **`github-fetch.ts`** — GitHub API raw content fetching + auth + rate limiting
3. **`memory-files.ts`** — Sessions, ADRs, lessons, patterns, packages, audits parsing

The remaining 8 functions (docs.ts, projects-config.ts, package-json.ts, maintenance.ts, shutdown.ts, watch.ts, remote-watch.ts, route-costs.ts) are deferred to a future milestone.

## Steps

1. Create `test/server/` directory for server function tests
2. **progress.ts tests** (1.5h):
   - Valid progress.yaml → correct ProgressData returned
   - Missing file → error message returned
   - Path traversal attempt (../ outside project root) → "Access denied" error
   - Invalid YAML → parse error message
   - Custom path via PROGRESS_YAML_PATH env var
3. **github-fetch.ts tests** (1.5h):
   - Successful fetch → valid ProgressData
   - HTTP 401 → auth error message
   - HTTP 403 → rate limit error message (with retry-after header)
   - HTTP 404 → not found error message
   - Network error → connection error message
   - Custom token via GITHUB_TOKEN env var
4. **memory-files.ts tests** (1h):
   - Valid sessions.md → correct SessionEntry[] with date/duration fields
   - Valid ADRs → correct ADREntry[] with status/date/consequences
   - Valid lessons → correct LessonEntry[] with date/priority
   - Missing file → empty array returned (graceful degradation)
   - Malformed YAML → empty array (no crash)
5. Use mock file system (memfs or vi.mock for node:fs) for functions that read from disk
6. Verify all new tests pass alongside existing 97 tests

## Verification

- [ ] `progress.ts`: 5 test cases covering success + all error paths (path traversal, missing file, invalid YAML)
- [ ] `github-fetch.ts`: 6 test cases covering success + 401/403/404/network/auth errors
- [ ] `memory-files.ts`: 5 test cases covering all 3 parsers + missing file + malformed data
- [ ] All 97 existing tests still pass
- [ ] TS 0 errors
