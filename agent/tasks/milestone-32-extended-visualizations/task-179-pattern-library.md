---
created: 2026-06-03
completed:
---

# Task 179: Pattern Library View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D4)  
**Estimated Time**: 1.5 hours  

---

## Objective

Render `agent/memory/patterns.md` as a searchable catalog of reusable code patterns.

---

## Steps

### 1. Server function

Parse `patterns.md` YAML blocks.

### 2. PatternLibrary component

Searchable list with pattern name, description, code reference (file:line), date.

---

## Verification

- [ ] Parses patterns.md YAML blocks
- [ ] Searchable by name/description
- [ ] Shows code references as file:line
- [ ] Handles missing patterns.md
