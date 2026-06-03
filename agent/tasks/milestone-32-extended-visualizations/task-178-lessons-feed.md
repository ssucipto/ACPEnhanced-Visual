---
created: 2026-06-03
completed:
---

# Task 178: Lessons Feed View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D3)  
**Estimated Time**: 1.5 hours  

---

## Objective

Render `agent/memory/lessons.md` grouped by task_type, showing mistakes and corrections.

---

## Steps

### 1. Server function

Parse `lessons.md` YAML blocks grouped by task_type.

### 2. LessonsFeed component

Grouped accordion: task_type → list of mistakes with corrections and priority.

---

## Verification

- [ ] Parses lessons.md YAML blocks
- [ ] Groups by task_type
- [ ] Shows mistake, correction, priority per entry
- [ ] Handles missing lessons.md
