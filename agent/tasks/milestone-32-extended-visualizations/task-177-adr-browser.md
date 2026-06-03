---
created: 2026-06-03
completed:
---

# Task 177: ADR Browser View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D2)  
**Estimated Time**: 2 hours  

---

## Objective

Render `agent/memory/decisions.md` as a filterable list of architectural decisions with status, context, and decision summaries.

---

## Steps

### 1. Server function

Parse `decisions.md` markdown sections into structured ADR entries (regex extraction).

### 2. ADRBrowser component

Filterable list with ADR ID, title, status badge, context, decision, re-open triggers.

### 3. Sidebar link

Add "ADRs" to sidebar.

---

## Verification

- [ ] Parses decisions.md markdown into typed ADR entries
- [ ] Renders status badges (Accepted, Proposed, Deprecated)
- [ ] Shows DO NOT re-open triggers
- [ ] Handles missing decisions.md
