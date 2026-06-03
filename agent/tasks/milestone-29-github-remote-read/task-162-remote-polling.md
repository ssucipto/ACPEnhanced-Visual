---
created: 2026-06-03
completed: 2026-06-03
---

# Task 162: Adaptive Polling — 10s Remote, 2s Local + Shared Manager

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D5)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-160

---

## Objective

Adaptive polling: 2s for local filesystem, 10s for GitHub remote (360 req/hr — safe within rate limits). HEAD requests with `If-None-Match` for remote. Shared PollManager for M30 multi-project support.

---

## Steps

### 1. Adaptive intervals

```typescript
const POLL_LOCAL = 2000;   // 2s
const POLL_REMOTE = 10000; // 10s (360 req/hr, safe with 5000 limit)
```

### 2. HEAD with ETag for remote

```typescript
// HEAD request with If-None-Match → 304 when unchanged
const res = await fetch(url, { method: 'HEAD', headers: { 'If-None-Match': etag } });
if (res.status === 304) return { unchanged: true };
```

### 3. Shared PollManager (M30)

Single poll loop for all sources instead of per-tab loops:
```typescript
class PollManager {
  private sources = new Map();
  addSource(id, config, onChange) { ... }
  removeSource(id) { ... }
  private async pollAll() { /* iterate all sources */ }
}
```

---

## Verification

- [ ] Local: 2s interval (unchanged)
- [ ] Remote: 10s interval (rate-limit safe)
- [ ] HEAD + If-None-Match → 304 when unchanged
- [ ] Shared PollManager design for M30
