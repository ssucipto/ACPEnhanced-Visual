---
created: 2026-06-03
completed:
---

# Task 162: Remote Polling via Last-Modified

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D5)  
**Estimated Time**: 1 hour  
**Depends on**: task-160

---

## Objective

Add a server function that polls `raw.githubusercontent.com` via HEAD request to check `Last-Modified` header, enabling the existing 2s polling model to work with remote sources.

---

## Steps

### 1. Create watch server function

In `server/routes/api/github-watch.ts`:
```typescript
export const fetchGitHubWatchToken = createServerFn({ method: 'GET' })
  .inputValidator((input: { repo: string; ref?: string; path?: string }) => input)
  .handler(async ({ data }) => {
    const { repo, ref = 'main', path = 'agent/progress.yaml' } = data;
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const lastMod = res.headers.get('last-modified');
      return { mtime: lastMod ? new Date(lastMod).getTime() : Date.now(), error: null };
    } catch (err) {
      return { mtime: null, error: formatParseError(err) };
    }
  });
```

### 2. Update data-source hook

Extend `useProgressData` to accept a `source` param and call the appropriate watch function (filesystem vs GitHub).

---

## Verification

- [ ] `server/routes/api/github-watch.ts` created
- [ ] HEAD request returns Last-Modified timestamp
- [ ] Polling re-fetches when Last-Modified changes
- [ ] Filesystem polling still works (backward compatible)
