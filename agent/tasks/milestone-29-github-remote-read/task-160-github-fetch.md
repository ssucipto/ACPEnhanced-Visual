---
created: 2026-06-03
completed:
---

# Task 160: GitHub Fetch Server Function

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D3)  
**Estimated Time**: 1.5 hours  
**Depends on**: task-159

---

## Objective

Create a TanStack Start server function that fetches progress.yaml from raw.githubusercontent.com and parses it with the existing Zod-validated parser.

---

## Steps

### 1. Create server function

In `server/routes/api/github-fetch.ts`:
```typescript
import { createServerFn } from '@tanstack/react-start';
import { parseProgressYaml } from '../../../src/lib/yaml-loader';
import { formatParseError } from '../../../src/lib/format-error';

export const fetchGitHubProgress = createServerFn({ method: 'GET' })
  .inputValidator((input: { repo: string; ref?: string; path?: string }) => input)
  .handler(async ({ data }) => {
    const { repo, ref = 'main', path = 'agent/progress.yaml' } = data;
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
    const headers: Record<string, string> = {};
    if (process.env['GITHUB_TOKEN']) {
      headers['Authorization'] = `Bearer ${process.env['GITHUB_TOKEN']}`;
    }
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return { data: null, error: `GitHub: ${res.status} — ${repo}/${ref}/${path}` };
      }
      const raw = await res.text();
      return { data: parseProgressYaml(raw), error: null };
    } catch (err) {
      return { data: null, error: formatParseError(err) };
    }
  });
```

### 2. Add tests

Test with a known public ACP repo (ssucipto/acp-enhanced).

---

## Verification

- [ ] `server/routes/api/github-fetch.ts` created
- [ ] Fetches from raw.githubusercontent.com correctly
- [ ] Returns typed ProgressData (same shape as filesystem fetch)
- [ ] Handles 404 (repo/file not found)
