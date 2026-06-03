---
created: 2026-06-03
completed:
---

# Task 157: README — Local Usage Documentation

**Milestone**: [M28 - ACP Enhanced Sync Contract](../milestones/milestone-28-acp-sync-contract.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Document how to use the visualizer as a local dev tool pointed at any ACP Enhanced project.

---

## Context

The visualizer is a local tool. Users need clear instructions for pointing it at their ACP projects. This task adds usage docs covering `PROGRESS_YAML_PATH`, symlink workflows, and troubleshooting.

---

## Steps

### 1. Update README

Replace the current "Quick Start" with a "Usage" section:

```markdown
## Usage

The ACP Progress Visualizer is a local development tool. It reads any
ACP Enhanced project's `agent/progress.yaml` and renders it in the browser.

### Quick Start

```bash
git clone https://github.com/ssucipto/ACPEnhanced-Visual
cd ACPEnhanced-Visual
npm install

# Point at your ACP Enhanced project:
PROGRESS_YAML_PATH=../acp-enhanced/agent/progress.yaml npm run dev
```

Open http://localhost:3000 to see your project's dashboard.

### Pointing at Any ACP Project

Set the `PROGRESS_YAML_PATH` environment variable:

```bash
# Absolute path
PROGRESS_YAML_PATH=/Users/you/projects/my-acp-project/agent/progress.yaml npm run dev

# Relative path (from visualizer root)
PROGRESS_YAML_PATH=../my-acp-project/agent/progress.yaml npm run dev
```

### Symlink Workflow

For frequent use, create a symlink so the default path works:

```bash
ln -sf ../acp-enhanced/agent/progress.yaml agent/progress.yaml
npm run dev
```
```

---

## Verification

- [ ] README has clear local usage instructions
- [ ] Documents `PROGRESS_YAML_PATH` env var
- [ ] Documents symlink workflow
- [ ] Quick Start works as documented
