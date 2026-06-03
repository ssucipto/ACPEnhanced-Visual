---
created: 2026-06-03
completed:
---

# Task 163: Error Handling for Remote Sources

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D6)  
**Estimated Time**: 1 hour  
**Depends on**: task-160, task-162

---

## Objective

Add clear, user-friendly error messages for all remote fetch failure modes: repo not found, file not found, rate limited, network errors.

---

## Steps

### 1. Error mapping

Create error classifier:
```typescript
function classifyGitHubError(status: number, repo: string): string {
  switch (status) {
    case 404: return `Repository or file not found: ${repo}`;
    case 403: return `GitHub API rate limit reached. Set GITHUB_TOKEN or try again later.`;
    default: return `GitHub error ${status} for ${repo}`;
  }
}
```

### 2. Network error handling

Catch fetch errors and return: `Cannot reach GitHub. Check your internet connection.`

### 3. Test error states

Mock fetch responses for 404, 403, 500, and network failure.

---

## Verification

- [ ] 404 → "Repository or file not found"
- [ ] 403 → "Rate limit reached. Set GITHUB_TOKEN..."
- [ ] Network failure → "Cannot reach GitHub..."
- [ ] Errors use `whitespace-pre-wrap` in UI (already from M26 T3)
