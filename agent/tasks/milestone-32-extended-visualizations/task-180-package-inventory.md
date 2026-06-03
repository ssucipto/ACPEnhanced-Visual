---
created: 2026-06-03
completed:
---

# Task 180: Package Inventory View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D5)  
**Estimated Time**: 1 hour  

---

## Objective

Render `agent/manifest.yaml` as a table of installed ACP packages with versions and dates.

---

## Steps

### 1. Server function

Parse `manifest.yaml` — extract packages with name, source, version, install date.

### 2. PackageInventory component

Table: package name, source repo, version, installed date, last updated.

---

## Verification

- [ ] Parses manifest.yaml
- [ ] Shows package name, source, version, dates
- [ ] Handles missing manifest.yaml
