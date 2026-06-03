---
created: 2026-06-03
completed:
---

# Task 159: Config Parser with Per-Repo Token Support

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D1, D2)  
**Estimated Time**: 1.5 hours  

---

## Objective

Parse `PROGRESS_YAML_REPO=owner/repo:branch:path` into structured config. Support per-repo tokens via `token_env` and `.github-tokens.json` for multi-account GitHub setups.

---

## Steps

### 1. Config with token support

```typescript
export interface DataSourceConfig {
  type: 'local' | 'github';
  path?: string;
  repo?: string;
  ref?: string;
  filePath?: string;
  tokenEnv?: string;  // env var for PAT (e.g. GITHUB_TOKEN_SSUCIPTO)
}
```

### 2. Load .github-tokens.json

```json
{ "ssucipto": "ghp_xxx", "rygandev01": "ghp_yyy" }
```

Map repo owner → token automatically. File is gitignored.

### 3. Backward compatible

If no token config, public repos work without auth. Private repos return 401 with clear message.

---

## Verification

- [ ] `tokenEnv` field in DataSourceConfig
- [ ] `.github-tokens.json` loaded and mapped to repo owners
- [ ] Backward compatible: no token = public access only
- [ ] Multi-account: different tokens for different repos
