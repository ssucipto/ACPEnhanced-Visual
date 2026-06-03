---
created: 2026-06-03
completed:
---

# Task 159: Config Parser for PROGRESS_YAML_REPO

**Milestone**: [M29 - GitHub Remote Read](../../milestones/milestone-29-github-remote-read.md)  
**Design**: [local.github-remote-read](../../design/local.github-remote-read.md) (D1, D2)  
**Estimated Time**: 1 hour  

---

## Objective

Parse `PROGRESS_YAML_REPO=owner/repo:branch:path` into a structured config object that the data-source hook can use.

---

## Steps

### 1. Create config parser

In `src/lib/config.ts`:
```typescript
export interface DataSourceConfig {
  type: 'local' | 'github';
  path?: string;       // local file path
  repo?: string;        // owner/repo
  ref?: string;         // branch (default: main)
  filePath?: string;    // path within repo (default: agent/progress.yaml)
}

export function parseDataSource(env: NodeJS.ProcessEnv): DataSourceConfig {
  if (env.PROGRESS_YAML_REPO) {
    const [repo, rest] = env.PROGRESS_YAML_REPO.split(':');
    const [ref, filePath] = (rest || '').split('/') ;
    return {
      type: 'github',
      repo,
      ref: ref || 'main',
      filePath: filePath || 'agent/progress.yaml',
    };
  }
  return {
    type: 'local',
    path: env.PROGRESS_YAML_PATH || 'agent/progress.yaml',
  };
}
```

### 2. Add unit tests

Test parsing: `ssucipto/acp-enhanced`, `ssucipto/acp-enhanced:develop`, `ssucipto/acp-enhanced:main/custom/path.yaml`.

---

## Verification

- [ ] `src/lib/config.ts` created with `parseDataSource()`
- [ ] Local config returns type=local with path
- [ ] GitHub config parses repo, ref, path correctly
- [ ] Defaults: ref=main, path=agent/progress.yaml
