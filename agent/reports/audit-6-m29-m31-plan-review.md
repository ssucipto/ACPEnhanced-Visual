# Audit Report: M29-M31 Plan — Gaps, Auth Model & Industry Standards

**Audit**: #6  
**Date**: 2026-06-03  
**Subject**: Pre-implementation audit of M29 (GitHub remote), M30 (multi-project), M31 (npx package) with focus on GitHub auth for multi-account setups  

## Summary

M29-M31 plans are well-structured but have critical gaps in the GitHub auth model for multi-account scenarios and rate limit handling. The designs use `raw.githubusercontent.com` (HTTPS) which sidesteps SSH multi-account issues but introduces rate limit concerns. Three critical findings, two high findings identified.

## Key Findings

| # | Finding | Severity | Affects |
|---|---------|----------|---------|
| C1 | **Rate limit will be hit**: 2s polling = 1800 req/hr. Unauthenticated limit is 60/hr. Even authenticated (5000/hr), multi-project view (M30) with 3+ repos exceeds limits | 🔴 Critical | M29, M30 |
| C2 | **Single GITHUB_TOKEN for multi-account**: Users with multiple GitHub accounts (like your ssucipto + rygandev01 setup) can only authenticate as one account via GITHUB_TOKEN env var. No per-repo token support | 🔴 Critical | M29 |
| C3 | **No GitHub Enterprise support**: `raw.githubusercontent.com` only works for github.com. Teams using GHE or self-hosted GitHub cannot use remote read | 🟡 High | M29 |
| H1 | **No backoff or caching**: Polling hits GitHub on every cycle even if data hasn't changed. Should cache Last-Modified and skip fetch when unchanged | 🟡 High | M29 |
| H2 | **M30 tabs all poll independently**: No coordination between tabs. 5 projects = 5 polling loops = 9000 req/hr. Needs shared poll manager | 🟡 High | M30 |
| G1 | **npx cold-start latency**: First `npx acp-visualizer` downloads ~200KB package + dependencies. Can take 10-30s | 🟢 Low | M31 |

## GitHub Auth Deep-Dive

### Your Setup (Real-World Multi-Account)

```
~/.ssh/config:
  Host github.com         → id_ed25519 (rygandev01)
  Host github-ssucipto    → id_ed25519_ssucipto (IdentitiesOnly yes)

git remote:
  ssucipto repos      → github-ssucipto:owner/repo.git
  rygandev01 repos     → github.com:owner/repo.git
```

### How raw.githubusercontent.com Works

```
SSH config has NO effect on raw.githubusercontent.com
  → It's HTTPS, not SSH
  → Authentication is via HTTP headers (Bearer token)
  → GITHUB_TOKEN is a Personal Access Token tied to ONE account
```

### Problem: Cannot Authenticate as Both Accounts

```
Current design:
  GITHUB_TOKEN=ghp_ssucipto_token    → only reads ssucipto's private repos
  GITHUB_TOKEN=ghp_rygandev01_token  → only reads rygandev01's private repos
  Can't use BOTH simultaneously without restarting
```

### Recommended Fix: Per-Repo Token Map

```json
// .visualizer-projects.json (M30)
{
  "projects": [
    { "name": "acp-enhanced", "source": "github", "repo": "ssucipto/acp-enhanced" },
    { "name": "work-project", "source": "github", "repo": "rygandev01/work-project", "token_env": "GITHUB_TOKEN_RYGAN" }
  ]
}
```

Or use a token config file:
```json
// .github-tokens.json (gitignored)
{
  "ssucipto": "ghp_xxx",
  "rygandev01": "ghp_yyy"
}
```

### Why SSH Doesn't Apply Here

`raw.githubusercontent.com` is a CDN, not a Git server. There's no SSH endpoint. The only auth mechanism is HTTPS Bearer tokens. This is the correct approach — SSH is for `git` operations, not file fetching.

## Rate Limit Analysis

| Scenario | Requests/hr | Limit | OK? |
|----------|------------|-------|-----|
| 1 repo, unauthenticated | 1800 | 60 | ❌ |
| 1 repo, with PAT | 1800 | 5000 | ✅ |
| 3 repos, with PAT | 5400 | 5000 | ❌ |
| 5 repos, with PAT | 9000 | 5000 | ❌ |

### Fix: Poll less, cache more

```
Current:  poll every 2s → 1800 req/hr
Better:   poll every 10s for remote → 360 req/hr (easily within limits)
Best:     poll every 30s with Last-Modified caching → 120 req/hr
```

Or use conditional requests:
```
HEAD /repo/main/path HTTP/1.1
If-None-Match: "abc123"
→ 304 Not Modified (doesn't count toward rate limit!)
```

## Recommendations

### M29 Must-Fix

1. **Add per-repo token support** (C2): Extend `DataSourceConfig` to include optional `token_env` field so each repo can use a different PAT
2. **Increase polling interval for remote** (C1): Change from 2s to 10-30s for GitHub sources. Add `If-None-Match` conditional requests to avoid rate limit counting on 304 responses
3. **Add cache layer** (H1): Store `ETag` from HEAD response. Skip fetch if ETag unchanged. This dramatically reduces rate limit consumption

### M30 Must-Fix

4. **Shared poll manager** (H2): Instead of each tab polling independently, use a single poll loop that checks all sources and dispatches updates to active tabs. This cuts N polling loops to 1

### M31 Nice-to-Have

5. **Add `--install` flag**: `npx acp-visualizer --install` performs `npm install -g acp-visualizer` for permanent install with faster startup

## Revised M29 Plan

| Task | Change |
|------|--------|
| T1 (config parser) | Add `token_env` field to DataSourceConfig |
| T2 (GitHub fetch) | Add `If-None-Match` header + 304 handling |
| T3 (auth) | Support per-repo token via `token_env` + `.github-tokens.json` |
| T4 (polling) | Increase to 10s for remote, use ETag caching |
| T5 (error handling) | Add rate limit detection (403 + Retry-After header) |

## Verdict

**READY with fixes** — M29 needs rate limit + multi-token fixes before implementation. M30 needs shared poll manager. M31 is solid as-is.
