# Milestone 32: Extended Visualizations

**Goal**: Visualize sessions, ADRs, lessons, patterns, packages, and audits — the full ACP project history beyond milestones and tasks  
**Duration**: ~11 hours  
**Design**: [local.extended-visualizations](../design/local.extended-visualizations.md)

---

## Overview

Extend the visualizer beyond progress.yaml to render the full ACP project history. Six new views: session timeline, ADR browser, lessons feed, pattern library, package inventory, and audit index. Each view reads its own data source via server functions, following the same architecture as existing milestone views.

---

## Deliverables

### 1. Session Timeline
- Chronological list of development sessions from `memory/sessions.md`
- Shows date, executor, persona, tasks completed, key facts, deferred items

### 2. ADR Browser
- Filterable list of architectural decisions from `memory/decisions.md`
- ADR ID, title, status, date, context summary, decision, re-open triggers

### 3. Lessons Feed
- Grouped by task_type from `memory/lessons.md`
- What went wrong, correct behavior, priority, date learned

### 4. Pattern Library
- Searchable catalog from `memory/patterns.md`
- Pattern name, description, code reference (file:line)

### 5. Package Inventory
- Table of installed ACP packages from `manifest.yaml`
- Package name, source repo, version, install date, last updated

### 6. Audit Index
- Index of audit reports from `reports/audit-*.md`
- Audit number, subject, date, finding count, highest severity

---

## Tasks

| Task | D-ID | Description | Est. |
|------|------|-------------|------|
| 176 | D1 | Session Timeline view | 2h |
| 177 | D2 | ADR Browser view | 2h |
| 178 | D3 | Lessons Feed view | 1.5h |
| 179 | D4 | Pattern Library view | 1.5h |
| 180 | D5 | Package Inventory view | 1h |
| 181 | D6 | Audit Index view | 1.5h |
| 183 | — | Sidebar redesign with collapsible sections | 1.5h |

## Success Criteria

- Each view reads its data source via server function
- Views handle missing files gracefully (not all projects have audits, patterns, etc.)
- Navigation links added to sidebar for new views
- Lazy loading: data fetched when view is activated
