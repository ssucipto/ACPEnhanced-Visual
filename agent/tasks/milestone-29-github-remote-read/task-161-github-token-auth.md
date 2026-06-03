---
created: 2026-06-03
completed: 2026-06-03
---

# Task 161: GITHUB_TOKEN Auth Support

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D4)  
**Estimated Time**: 0.5 hours  
**Depends on**: task-160

---

## Objective

Add GITHUB_TOKEN support so the visualizer can read progress.yaml from private repositories.

---

## Steps

### 1. Auth header in fetch

Already included in task-160's server function. Verify it works:
```typescript
if (process.env['GITHUB_TOKEN']) {
  headers['Authorization'] = `Bearer ${process.env['GITHUB_TOKEN']}`;
}
```

### 2. Document in README

Add a note about GITHUB_TOKEN for private repos.

### 3. Test

```bash
GITHUB_TOKEN=ghp_xxx PROGRESS_YAML_REPO=private-org/private-repo npm run dev
```

---

## Verification

- [ ] GITHUB_TOKEN passed as Bearer auth header
- [ ] Public repos work without token
- [ ] README documents GITHUB_TOKEN usage
