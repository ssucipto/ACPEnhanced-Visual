---
created: 2026-06-03
completed:
---

# Task 163: Error Handling + Rate Limit Detection

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D6)  
**Estimated Time**: 1 hour  
**Depends on**: task-160

---

## Objective

Clear error messages for all remote failure modes. Rate limit detection via `X-RateLimit-Remaining` + `Retry-After` headers. Warning banner when approaching limits.

---

## Steps

### 1. Error classifier

```typescript
function classifyGitHubError(status: number, headers: Headers, repo: string): string {
  const remaining = headers.get('X-RateLimit-Remaining');
  if (status === 403 && remaining === '0') {
    return `Rate limited. Resets in ${headers.get('Retry-After')}s. Set GITHUB_TOKEN for 5000 req/hr.`;
  }
  switch (status) {
    case 404: return `Not found: ${repo}`;
    case 401: return `Auth failed for ${repo}. Check token.`;
    default: return `GitHub error ${status}`;
  }
}
```

### 2. Rate limit banner

Show warning when < 20% remaining:
```
⚠️ GitHub API: 10/60 requests remaining. Resets in 12 min.
```

---

## Verification

- [ ] 403 + rate limit → clear message with retry time
- [ ] 401 → auth failure message
- [ ] Warning banner at < 20% remaining
- [ ] Network errors → connection failure message
