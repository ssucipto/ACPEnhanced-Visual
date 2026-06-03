---
created: 2026-06-03
completed: 2026-06-03
---

# Task 160: GitHub Fetch with ETag Caching & Rate Limit Awareness

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D3)  
**Estimated Time**: 2 hours  
**Depends on**: task-159

---

## Objective

Fetch progress.yaml from raw.githubusercontent.com with `If-None-Match`/`ETag` conditional requests. 304 responses don't count toward rate limits. Support per-repo tokens. Detect rate limit via `X-RateLimit-Remaining` header.

---

## Steps

### 1. Server function with ETag cache

```typescript
const etagCache = new Map<string, string>();

export const fetchGitHubProgress = createServerFn({ method: 'GET' })
  .handler(async ({ data }) => {
    const headers: Record<string, string> = {};
    if (data.token) headers['Authorization'] = `Bearer ${data.token}`;
    
    const etag = etagCache.get(data.repo);
    if (etag) headers['If-None-Match'] = etag;
    
    const res = await fetch(url, { headers });
    
    if (res.status === 304) return { data: null, unchanged: true };
    if (res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0') {
      return { data: null, error: `Rate limited. Retry after ${res.headers.get('Retry-After')}s` };
    }
    
    const newEtag = res.headers.get('ETag');
    if (newEtag) etagCache.set(data.repo, newEtag);
    
    return { data: parseProgressYaml(await res.text()), error: null };
  });
```

### 2. Key features
- `If-None-Match` → 304 when unchanged (no rate limit cost)
- ETag cached per repo in memory
- Rate limit header detection with `Retry-After`
- Per-repo token from config

---

## Verification

- [ ] 304 response → returns `unchanged: true`
- [ ] 403 + rate limit → clear error with retry seconds
- [ ] ETag stored and reused across requests
- [ ] Per-repo token passed from config
