# Audit Carryovers
# Populated by /acp-audit — findings that require follow-up in future sessions

carryovers:
  - finding_id: audit-1-F1
    finding: "Schema gap: progress.yaml has current_blockers but TypeScript types (ProgressData) do not define it"
    severity: medium
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4

  - finding_id: audit-1-F2
    finding: "Live progress.yaml is a bootstrap stub — M25 shows completed but has no tasks, recent_work, or notes"
    severity: high
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4

  - finding_id: audit-1-F4
    finding: "ACP Enhanced schema drift risk — if ACP Enhanced adds/renames fields in progress.yaml, visualizer types may silently ignore or break"
    severity: high
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4
    notes: "Sync test created (M28 T12). Version pin in identity.yml. Manual verification after /acp-version-update."

  - finding_id: audit-1-F5
    finding: "No schema validation — yaml-loader.ts uses 'as' type assertions without Zod/schema runtime validation"
    severity: medium
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4

  - finding_id: audit-1-F7
    finding: "No deploy/CI pipeline — no GitHub Actions, no Vercel config, no build verification"
    severity: medium
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4

  - finding_id: audit-1-F8
    finding: "Test coverage thin — only yaml-loader.test.ts has tests; components, hooks, server functions untested"
    severity: medium
    status: fixed
    audit_ref: audit-1-acp-visualizer-scope-and-sync
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4

  - finding_id: audit-2-P1
    finding: "Deployment model mismatch: Vercel can only serve bundled progress.yaml"
    severity: critical
    status: fixed
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4
    notes: "Local-only model established. Vercel removed. README documents local usage + symlink workflow."

  - finding_id: audit-2-P4
    finding: "Missing started and description fields on ProjectMetadata type"
    severity: medium
    status: fixed
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: 2026-06-03
    verified_in_audit: audit-4
    notes: "Fields already present in types.ts. Audit finding was incorrect."

  - finding_id: audit-2-P5
    finding: "Schema version pin (M28 T10) is documentation-only with no CI enforcement"
    severity: medium
    status: pending
    audit_ref: audit-2-m26-m28-plan-gap-analysis
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-4-G2
    finding: "ACP Enhanced fixture has YAML syntax error at M5 line 148 — upstream fix needed in ssucipto/acp-enhanced"
    severity: medium
    status: pending
    audit_ref: audit-4-m26-m28-post-impl-verification
    fix_applied_date: null
    verified_in_audit: null
    notes: "Upstream issue. Sync test handles gracefully. Not a visualizer bug."

  - finding_id: audit-18-F4
    finding: "Maintenance stop button used raw fetch() to TanStack Start RPC — wrong protocol, CORS issues, server dies before responding. Fixed with server-side killByPort()."
    severity: high
    status: fixed
    audit_ref: audit-18-ux-polish
    fix_applied_date: 2026-06-03
    verified_in_audit: null

  - finding_id: audit-18-F1
    finding: "Markdown viewer lacks table/chart styling — @tailwindcss/typography v0.5.x is Tailwind v3 plugin. Fixed with custom prose CSS + mermaid.js."
    severity: medium
    status: fixed
    audit_ref: audit-18-ux-polish
    fix_applied_date: 2026-06-03
    verified_in_audit: null

  - finding_id: audit-19-F1
    finding: "No code coverage reporting — no @vitest/coverage-v8, no coverage thresholds, no test:coverage script. 11 server functions and 6+ components untested."
    severity: medium
    status: pending
    audit_ref: audit-19-test-packages
    fix_applied_date: null
    verified_in_audit: null
    notes: "Quick win: install @vitest/coverage-v8, add test:coverage script."

  - finding_id: audit-19-F2
    finding: "All 11 server functions are untested — maintenance, shutdown, docs, github-fetch, memory-files, projects-config, progress, watch, remote-watch, route-costs, package-json"
    severity: high
    status: pending
    audit_ref: audit-19-test-packages
    fix_applied_date: null
    verified_in_audit: null
    notes: "Server functions handle file I/O, process management, network — untested regression risk."
