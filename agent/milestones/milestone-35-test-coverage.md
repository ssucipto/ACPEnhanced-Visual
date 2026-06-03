# Milestone 35: Test Coverage & Quality Hardening

**ID**: M35  
**Priority**: 1  
**Status**: active  
**Started**: 2026-06-03  
**Estimated**: 1 week  

## Goal

Close test coverage gaps identified in audit #19. Add coverage infrastructure, test all 11 server functions (security + regression), and test 3 untested components (functionality). Target: 80%+ server coverage, 60%+ component coverage.

## Deliverables

- [ ] `@vitest/coverage-v8` installed with coverage thresholds
- [ ] `test:coverage` and `test:watch` npm scripts
- [ ] `@testing-library/jest-dom` for cleaner DOM assertions
- [ ] Security tests for shutdown, docs, progress (path traversal, auth)
- [ ] Regression tests for maintenance, memory-files, github-fetch
- [ ] Functionality tests for DocsViewer, MaintenancePage, ServerControls
- [ ] Split test environments (node for CLI/YAML, jsdom for components)

## Success Criteria

- All 12 tasks completed
- Coverage reports generated via `npm run test:coverage`
- Server functions: >80% line coverage
- Components: >60% line coverage
- All existing 43 tests still pass
- Zero security regressions
