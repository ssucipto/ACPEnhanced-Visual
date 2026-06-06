# Task 225: Server Function Test Coverage

**Task**: task-225  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P1  
**Status**: not_started  
**Estimated**: 3 hours  
**Carryover**: audit-19-F2  

## Objective

Add test coverage for the 11 server functions that currently have no tests, reducing regression risk for file I/O, process management, and network operations.

## Context

Server functions handle critical operations but are untested:
- `server/routes/api/maintenance.ts` — File system health checks
- `server/routes/api/shutdown.ts` — Server process termination
- `server/routes/api/docs.ts` — Document listing and reading (partially tested via component tests)
- `server/routes/api/github-fetch.ts` — GitHub API raw content fetching
- `server/routes/api/memory-files.ts` — Sessions, ADRs, lessons, patterns, packages, audits parsing
- `server/routes/api/projects-config.ts` — Multi-project configuration read/write
- `server/routes/api/progress.ts` — Progress YAML fetching
- `server/routes/api/watch.ts` — File modification polling
- `server/routes/api/remote-watch.ts` — Remote GitHub polling
- `server/routes/api/route-costs.ts` — Route cost estimation
- `server/routes/api/package-json.ts` — NPM dependency parsing

## Steps

1. Create `test/server/` directory for server function tests
2. Prioritize functions by complexity and risk:
   - High: progress.ts, github-fetch.ts, memory-files.ts (core data pipeline)
   - Medium: docs.ts, projects-config.ts, package-json.ts (data access)
   - Low: maintenance.ts, shutdown.ts, watch.ts, remote-watch.ts, route-costs.ts (utility)
3. Write tests for high-priority functions first
4. Use mock file system (memfs or manual mock) for functions that read from disk
5. Test error paths: missing files, invalid YAML, network errors, path traversal
6. Verify all new tests pass alongside existing 97 tests

## Verification

- [ ] At least 5 new test files created for server functions
- [ ] High-priority functions (progress, github-fetch, memory-files) have coverage
- [ ] Error path tests: missing files, invalid YAML, path traversal guards
- [ ] All 97 existing tests still pass
- [ ] TS 0 errors
