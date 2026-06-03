---
created: 2026-06-03
completed:
---

# Task 181: Audit Index View

**Milestone**: [M32 - Extended Visualizations](../../milestones/milestone-32-extended-visualizations.md)  
**Design**: [local.extended-visualizations](../../design/local.extended-visualizations.md) (D6)  
**Estimated Time**: 1.5 hours  

---

## Objective

Render an index of all audit reports from `agent/reports/audit-*.md` with finding counts and severity.

---

## Steps

### 1. Server function

Glob `reports/audit-*.md`, extract metadata from each (audit number, subject, date, finding count, highest severity).

### 2. AuditIndex component

Table: audit #, subject, date, findings, highest severity badge. Links to full report files.

---

## Verification

- [ ] Lists all audit-N.md files
- [ ] Extracts metadata (number, subject, findings, severity)
- [ ] Severity badges (Critical red, High orange, Medium yellow, Low green)
- [ ] Handles empty reports/ directory
