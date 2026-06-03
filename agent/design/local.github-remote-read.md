# GitHub Remote Read Support

<!-- @acp.meta.design
topic: github-api, remote-fetch, progress-yaml, multi-repo
description: Fetch progress.yaml from GitHub repositories via API, enabling remote project monitoring without local clones
status: draft
updated: 2026-06-03
@acp.meta.end -->

**Concept**: Enable the visualizer to read `agent/progress.yaml` from any public (or authenticated) GitHub repository via the GitHub API  
**Created**: 2026-06-03  

---

## Overview

Currently the visualizer only reads `progress.yaml` from the local filesystem. This design adds GitHub API support so users can monitor ACP projects without cloning them locally. The visualizer becomes a true dashboard — point it at any ACP repo and see live progress.

---

## Problem Statement

- **Challenge**: Users must clone ACP projects locally to visualize progress. For teams with many repos, this means maintaining local clones just for the dashboard.
- **Why solve**: A dashboard should be able to monitor projects remotely. GitHub is where ACP projects live. Reading directly from GitHub removes the clone requirement.
- **Consequences**: Without this, the visualizer is limited to local-only usage. Teams with 10+ repos find it impractical.

---

## Solution

### D1: Dual data source — filesystem or GitHub API

The visualizer supports two data sources:

| Source | When | Config |
|--------|------|--------|
| **Filesystem** | Local ACP projects | `PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml` |
| **GitHub API** | Remote ACP projects | `PROGRESS_YAML_REPO=ssucipto/acp-enhanced` |

### D2: URL-based config

Replace the single `PROGRESS_YAML_PATH` env var with a more flexible config:

```
# Local file (backward compatible)
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml

# GitHub repo (new)
PROGRESS_YAML_REPO=ssucipto/acp-enhanced
PROGRESS_YAML_REPO=ssucipto/acp-enhanced:main        # specific branch
PROGRESS_YAML_REPO=ssucipto/acp-enhanced:agent/progress.yaml  # specific path
```

### D3: Server-side GitHub fetch

```typescript
// New server function: server/routes/api/github-fetch.ts
export const fetchGitHubProgress = createServerFn({ method: 'GET' })
  .inputValidator((input: { repo: string; ref?: string; path?: string }) => input)
  .handler(async ({ data }) => {
    const { repo, ref = 'main', path = 'agent/progress.yaml' } = data;
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
    const res = await fetch(url);
    if (!res.ok) return { data: null, error: `GitHub: ${res.status} ${res.statusText}` };
    const raw = await res.text();
    return { data: parseProgressYaml(raw), error: null };
  });
```

### D4: Auth for private repos

Support `GITHUB_TOKEN` env var for private repos:
```typescript
const headers: Record<string, string> = {};
if (process.env['GITHUB_TOKEN']) {
  headers['Authorization'] = `Bearer ${process.env['GITHUB_TOKEN']}`;
}
```

### D5: Polling for remote sources

Remote repos use the same 2s polling model but check via HTTP HEAD for `Last-Modified` header instead of `fs.statSync` mtime. This keeps the polling architecture consistent.

### D6: Error handling for remote

| Error | UI Message |
|-------|-----------|
| Repo not found | `Repository not found: ssucipto/missing-repo` |
| File not found | `No progress.yaml in ssucipto/my-app (branch: main)` |
| Rate limited | `GitHub API rate limit reached. Try again in N minutes or set GITHUB_TOKEN` |
| Network error | `Cannot reach GitHub. Check your internet connection.` |

---

## Key Decisions

- **Use raw.githubusercontent.com** (not the GitHub API v3) — no rate limits for public repos, simpler, returns raw file content
- **Keep filesystem support** — backward compatible, `PROGRESS_YAML_PATH` still works
- **Polling model unchanged** — remote sources poll `Last-Modified` header via HEAD request
- **No repo cloning** — fetch single file, not the whole repo

## Trade-offs

- Remote sources are read-only (can't watch file changes in real-time — polling is best effort)
- GitHub raw content is cached (up to 5 min delay) — acceptable for a dashboard
- Private repos require `GITHUB_TOKEN` — user must configure this
