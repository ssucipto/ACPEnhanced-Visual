# Extended Visualizations — Sessions, ADRs, Lessons, Patterns & More

<!-- @acp.meta.design
topic: sessions, adr, lessons, patterns, packages, audits, dashboard
description: Visualize sessions, ADRs, lessons, patterns, packages, and audits — the full ACP project history beyond milestones
status: draft
updated: 2026-06-03
@acp.meta.end -->

**Concept**: Extend the visualizer beyond progress.yaml to render the full ACP project history — sessions, architectural decisions, lessons learned, reusable patterns, packages, and audit findings  
**Created**: 2026-06-03  

---

## Overview

The visualizer currently renders only `progress.yaml` (milestones + tasks). But an ACP project contains rich structured data in other files: session history, ADR log, correction lessons, reusable patterns, installed packages, and audit reports. This design adds views for each, making the visualizer a complete project intelligence dashboard.

---

## Problem Statement

- **Challenge**: Developers must manually open and read individual markdown/YAML files to understand project history, decisions, and patterns. No unified view exists.
- **Why solve**: A dashboard should show the full picture — not just "what's done" but "who did it, what was decided, what was learned, and what's reusable."
- **Consequences**: Without this, the visualizer is a milestone tracker, not a project intelligence tool.

---

## Solution

### D1: Session Timeline

**Source**: `agent/memory/sessions.md` (YAML blocks)

Render a chronological timeline of all development sessions:
- Date, executor, persona
- Tasks completed (linked)
- Key facts learned
- Deferred items

```
┌────────────────────────────────────────────┐
│ 📅 Session Timeline                        │
│                                            │
│ 2026-06-03 · copilot (A)                   │
│   ✅ 11 items done                         │
│   🔑 Key fact: visualizer is local tool    │
│   📋 Deferred: M26-M28 (15 tasks)          │
│                                            │
│ 2026-06-02 · deepseek-v4-pro (B)          │
│   ✅ audit-035 complete                    │
│   ...                                      │
└────────────────────────────────────────────┘
```

### D2: ADR Browser

**Source**: `agent/memory/decisions.md` (markdown sections)

Filterable, searchable list of architectural decisions:
- ADR ID, title, status, date
- Context summary
- Decision summary
- "DO NOT re-open" triggers

```
┌────────────────────────────────────────────┐
│ 🏗️ Architecture Decisions (3)              │
│                                            │
│ ADR-001 · TanStack Start · Accepted        │
│   SSR + server functions for filesystem I/O │
│   DO NOT re-open unless migrating framework │
│                                            │
│ ADR-002 · YAML format · Accepted           │
│   ...                                      │
└────────────────────────────────────────────┘
```

### D3: Lessons Feed

**Source**: `agent/memory/lessons.md` (YAML blocks)

Grouped by task_type, showing mistakes and corrections:
- What went wrong
- Correct behavior
- Priority
- Date learned

### D4: Pattern Library

**Source**: `agent/memory/patterns.md` (date-stamped YAML)

Searchable catalog of reusable code patterns:
- Pattern name, date
- Code reference (file:line)
- Description

### D5: Package Inventory

**Source**: `agent/manifest.yaml`

Table of installed ACP packages:
- Package name, source, version
- Installation date
- Last updated

### D6: Audit Index

**Source**: `agent/reports/audit-*.md` (file listing + metadata)

Index of audit reports:
- Audit number, subject, date
- Finding count
- Highest severity
- Link to full report

---

## Data Sources

| Source | Format | Parser | View |
|--------|--------|--------|------|
| `memory/sessions.md` | YAML blocks | js-yaml | Timeline |
| `memory/decisions.md` | Markdown | Regex extraction | ADR Browser |
| `memory/lessons.md` | YAML blocks | js-yaml | Lessons Feed |
| `memory/patterns.md` | YAML blocks | js-yaml | Pattern Library |
| `manifest.yaml` | YAML | js-yaml | Package Inventory |
| `reports/audit-*.md` | File listing + metadata | Glob + regex | Audit Index |

---

## Key Decisions

- **Read-only**: All views are read-only — no writes to ACP memory files
- **Same architecture**: Each view is a React component consuming data via server functions, same as existing milestone views
- **Lazy loading**: Views load data on-demand (when tab is activated), not all at startup
- **Navigation**: Add sidebar links for each view under a "Project Intelligence" section

## Trade-offs

- Parsing markdown (decisions.md) is less structured than YAML — regex extraction is less reliable
- File count scales with project age — audit index for 34 reports is fine, but 100+ may need pagination
- Some files may not exist (not all projects have audits, patterns, etc.) — views must handle missing data gracefully
