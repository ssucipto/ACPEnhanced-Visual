---
created: 2026-06-03
completed:
---

# Task 164: Project Config Loader

**Milestone**: [M30 - Multi-Project View](../../milestones/milestone-30-multi-project-view.md)  
**Design**: [local.multi-project-view](../../design/local.multi-project-view.md) (D2)  
**Estimated Time**: 1 hour  

---

## Objective

Load project configurations from `.visualizer-projects.json` or `VISUALIZER_PROJECTS` env var, producing a typed array of project configs.

---

## Steps

### 1. Define types

```typescript
interface ProjectConfig {
  name: string;
  source: 'local' | 'github';
  path?: string;
  repo?: string;
  branch?: string;
}
```

### 2. Load from JSON file

Read `.visualizer-projects.json` from visualizer root:
```json
{
  "projects": [
    { "name": "acp-enhanced", "source": "local", "path": "../acp-enhanced/agent/progress.yaml" },
    { "name": "my-app", "source": "github", "repo": "ssucipto/my-app" }
  ]
}
```

### 3. Fallback to env var

If no JSON file, parse `VISUALIZER_PROJECTS=name1:path1,name2:repo2`.

### 3. Default to single project

If nothing configured, use current `PROGRESS_YAML_PATH` or `PROGRESS_YAML_REPO` as a single project.

---

## Verification

- [ ] `.visualizer-projects.json` parsed correctly
- [ ] `VISUALIZER_PROJECTS` env var fallback works
- [ ] Defaults to single project if nothing configured
