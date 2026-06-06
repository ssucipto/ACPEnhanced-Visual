# Task 226: Code Coverage Reporting Setup

**Task**: task-226  
**Milestone**: M40 (Audit Carryover Resolution & Export Hardening)  
**Priority**: P3  
**Status**: not_started  
**Estimated**: 1 hour  
**Depends On**: task-225 (needs server function tests to measure coverage)  
**Carryover**: audit-19-F1  
**Validation Gaps Addressed**: G10 (dependency ordering)  

## Objective

Verify and enhance the code coverage reporting setup. Ensure `@vitest/coverage-v8` is properly configured with meaningful thresholds that gate on regressions.

## Context

The `vite.config.ts` already has coverage configuration:
```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  include: ['server/routes/api/**', 'src/components/**', 'src/lib/**'],
  thresholds: {
    statements: 50, branches: 40, functions: 50, lines: 50,
  },
},
```

And `package.json` has `test:coverage` script. This task verifies the setup works correctly, adjusts thresholds to match current coverage levels, and ensures the coverage report provides actionable insights.

## Steps

1. Run `npm run test:coverage` and review the output
2. Check if current coverage meets the thresholds
3. If thresholds are too aggressive for current state, adjust to current levels + 5%
4. If thresholds are met, consider increasing incrementally
5. Add `test:coverage` to CI workflow (if GitHub Actions exists) or document manual usage
6. Ensure coverage HTML report opens correctly in browser
7. Add `.gitignore` entry for `coverage/` directory

## Verification

- [ ] `npm run test:coverage` runs successfully
- [ ] Coverage thresholds are met
- [ ] Coverage HTML report is generated and viewable
- [ ] `coverage/` is in `.gitignore`
