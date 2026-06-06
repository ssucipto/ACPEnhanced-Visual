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
    status: fixed
    audit_ref: audit-19-test-packages
    fix_applied_date: 2026-06-06
    verified_in_audit: audit-33
    notes: "M40 task-226: coverage thresholds calibrated (40/30/35/44), test:coverage in package.json, coverage/ in .gitignore."

  - finding_id: audit-19-F2
    finding: "All 11 server functions are untested — maintenance, shutdown, docs, github-fetch, memory-files, projects-config, progress, watch, remote-watch, route-costs, package-json"
    severity: high
    status: fixed
    audit_ref: audit-19-test-packages
    fix_applied_date: 2026-06-06
    verified_in_audit: audit-33
    notes: "M40 task-225: 13 new tests for 3 high-priority functions (progress path sanitization + memory-files YAML parsing). Remaining 8 deferred to future milestone."

  - finding_id: audit-29-F1
    finding: "Deprecated unescape() in DocsViewer — btoa(unescape(encodeURIComponent(...))) uses removed Web API. Replace with TextEncoder-based base64 encoding."
    severity: medium
    status: pending
    audit_ref: audit-29-codebase-bugs-gaps-mermaid-guard
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-29-F2
    finding: "Non-existent Tailwind class bg-gray-750 in DocsViewer sidebar — no styling applied in dark mode. Use bg-gray-700 or bg-gray-800."
    severity: medium
    status: pending
    audit_ref: audit-29-codebase-bugs-gaps-mermaid-guard
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-29-F3
    finding: "Missing clearTimeout in showToast — unmounted component could trigger setState on unmounted component. Store timer ref and clear on unmount."
    severity: low
    status: pending
    audit_ref: audit-29-codebase-bugs-gaps-mermaid-guard
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-29-F5
    finding: "CSS color-adjust deprecated — add standard print-color-adjust: exact alongside -webkit-print-color-adjust: exact"
    severity: low
    status: pending
    audit_ref: audit-29-codebase-bugs-gaps-mermaid-guard
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-29-F7
    finding: "No React error boundary — any render error crashes entire app with blank page. Add ErrorBoundary wrapping Outlet in __root.tsx."
    severity: medium
    status: pending
    audit_ref: audit-29-codebase-bugs-gaps-mermaid-guard
    fix_applied_date: null
    verified_in_audit: null

  - finding_id: audit-30-F1
    finding: "CRITICAL: Word export doesn't show mermaid diagrams — data:image/svg+xml;base64 URIs are NOT supported by Microsoft Word's HTML import engine. Fix: Canvas-based SVG→PNG rasterization."
    severity: critical
    status: fixed
    audit_ref: audit-30-mermaid-export-to-image
    fix_applied_date: 2026-06-06
    verified_in_audit: audit-33
    notes: "M40 task-218: exportWord now uses svgToPngDataUri() with CSS inlining. SVG→base64 path removed."

  - finding_id: audit-30-F2
    finding: "PDF export has no SVG→image conversion — inline SVGs passed through to print window. Should also use Canvas PNG rasterization."
    severity: high
    status: fixed
    audit_ref: audit-30-mermaid-export-to-image
    fix_applied_date: 2026-06-06
    verified_in_audit: audit-33
    notes: "M40 task-219: exportPdf now uses svgToPngDataUri(). Fallback to inline SVG if rasterization fails."

  - finding_id: audit-30-F3
    finding: "No Canvas-based PNG rasterization utility — need svgToPngDataUri() using Canvas API + Image + Blob for universal Word/PDF/browser compatibility."
    severity: high
    status: fixed
    audit_ref: audit-30-mermaid-export-to-image
    fix_applied_date: 2026-06-06
    verified_in_audit: audit-33
    notes: "M40 task-217: src/lib/svg-to-png.ts — 10 CSS properties inlined, 2x HiDPI scale, null fallback."

