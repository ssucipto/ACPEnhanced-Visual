# Session Memory
# Format: YAML blocks, last 3 loaded per session, auto-compacted at 15 entries
# DO NOT edit manually — updated by /acp-commit

- date: 2026-06-05
  executor: copilot
  persona: A
  tasks_completed:
    - bugfix-ssr-sigabrt-console-error-filter
    - bugfix-sessiontimeline-hooks-violation
    - bugfix-node-fs-client-bundle-leak
    - ux-docsviewer-visible-drop-zone
    - audit-post-fix-verification
  done:
    - ssr-broadened-console-error-filter-from-1-to-4-patterns
    - sessiontimeline-usememo-moved-above-conditional-return
    - commands-ts-dynamic-node-imports-parsecommandcontent-split
    - docsviewer-visible-drop-zone-card-with-icon-and-instructions
    - post-fix-audit-29-components-0-hooks-violations-11-server-files-0-node-leaks
    - all-routes-http-200-no-ssr-errors
    - build-310ms-ts-0-errors-92-tests-passing
    - progress-update-recent-work-entry
  deferred:
    - npm-publish
    - e2e-tests-playwright
  key_fact: >
    Three classes of bugs slip through tests: (1) SSR streaming errors
    that only manifest after ~50 poll cycles as SIGABRT, (2) React hooks
    ordering violations that only error on client hydration, (3) Vite
    bundle leaks where node:fs top-level imports get pulled into client
    code. Each requires a different detection strategy — console.error
    filtering, manual hooks-audit scanning, and build verification.

- date: 2026-06-05
  executor: copilot
  persona: A
  tasks_completed:
    - M38-task-199-statsrow-sourcelink
    - M38-task-200-server-fn-enhancements
    - M38-task-201-session-timeline-2.0
    - M38-task-202-adr-browser-2.0
    - M38-task-203-lessons-feed-2.0
    - M38-task-204-pattern-library-2.0
    - M38-task-205-package-inventory-2.0
    - M38-task-206-audit-index-2.0
    - M38-task-207-visual-polish
    - M38-task-208-tests
  done:
    - m38-all-10-tasks-autonomous-mode-with-statsrow-sourcelink-shared-components
    - all-6-extended-visualization-views-upgraded-with-fusejs-search-filter-stats-empty-ctas
    - session-timeline-week-grouping-key-fact-inline
    - adr-browser-read-more-expand-consequences-date-id-based-fuse-filter-intersection
    - lessons-feed-priority-filter-most-common-stat-actual-mode
    - pattern-library-tag-grouping-usage-count
    - package-inventory-outdated-highlighting-wanted-column-npm-search-empty-state
    - audit-index-severity-status-filters-sourcelink
    - server-fn-8-new-fields-duration-consequences-date-tags-status-wanted-latest-license
    - post-impl-audit-4-bugs-found-and-fixed-session-toggle-collision-fuse-intersection-most-common-npm-empty
    - version-bump-1.5.2-package-json-progress-yaml-readme-changelog
    - progress-yaml-fixed-orphan-recent-work-lines-bad-indentation
    - validate-version-consistency-wiki-sync-all-docs-current
    - tests-92-passing-15-files-ts-0-errors
  deferred:
    - npm-publish
    - e2e-tests-playwright
    - accessibility-audit-axe-core
    - visual-regression-tests
  key_fact: >
    When implementing autonomous milestone completion (10 tasks), build
    cross-cutting shared components first (StatsRow, SourceLink) — then
    all 6 view rewrites benefit from the same pattern. Post-implementation
    audits are essential: found 4 bugs that would have shipped otherwise
    (toggle key collision, fuse.js reference equality in filter intersection,
    wrong stat computation, missing empty state).

- date: 2026-06-03
  executor: copilot
  persona: A
  tasks_completed:
    - audit-20-cwd-vs-project-root
    - install-script-fix
    - project-root-fixes
  done:
    - audit-20-process-cwd-audit-12-usages-6-fixed
    - install-script-symlink-instead-of-npm-link
    - docs-ts-getProjectRoot-from-PROGRESS_YAML_PATH
    - memory-files-ts-getProjectRoot-sessions-adrs-lessons-patterns-packages-audits
    - package-json-ts-getProjectRoot-npm-deps
    - route-costs-ts-getProjectRoot-ledger
    - progress-ts-sanitizePath-relative-path-resolution
    - watch-ts-sanitizePath-relative-path-resolution
    - readme-install-update-curl-one-liner
    - acp-update-progress-yaml
  deferred:
    - npm-publish-v1.5.0
    - visual-regression-tests-screenshot-diffs
    - e2e-tests-playwright
  key_fact: >
    When a tool is installed globally (not run from its own directory),
    process.cwd() points to the install location, not the target project.
    Always derive the project root from PROGRESS_YAML_PATH env var
    (set by CLI --path or auto-detect) instead of relying on CWD.
    Also: npm link on macOS ignores user-level prefix configuration
    and always tries /usr/local/lib/ — use ln -s directly instead.

- date: 2026-06-03
    - m35-11-server-function-export-verification-tests
    - m35-10-component-tests-docsviewer-maintenance-servercontrols
    - m35-28-new-tests-43-to-71-total
    - acp-update-progress-yaml-v1.5.0-11-milestones-71-tests
  deferred:
    - m35-t12-split-vitest-environments-node-vs-jsdom
  key_fact: >
    TanStack Start server functions use an RPC protocol and cannot be called
    directly in vitest — they require a running server. For unit tests, verify
    exports exist and are callable, but actual invocation needs component-level
    integration tests with vi.mock. Also: @tailwindcss/typography v0.5.x is
    a Tailwind v3 PostCSS plugin and does not work with Tailwind v4's
    @tailwindcss/vite — custom CSS is the reliable fallback.
    - domain-yml-cleaned-removed-leaked-command-listings
    - identity-yml-fixed-removed-parent-repo-duplicates
    - identity-yml-stack-expanded-to-key-value-pairs
    - integrations-md-verified-accurate-no-changes-needed
    - acp-update-progress-yaml-synced-with-recent-work
  deferred: []
  key_fact: >
    Wiki hygiene matters. The existing domain.yml had 30+ leaked acp.* command
    entries from a prior session mixed into the modules section. Identity.yml
    had duplicate team/priorities blocks and content from the parent
    ssucipto/acp-enhanced repo (fork_of, shell_compat, token_efficiency) that
    don't apply to this standalone visualizer. Always verify inherited ACP
    framework files don't carry parent-project artifacts.

- date: 2026-06-03
  executor: copilot
  persona: A
  tasks_completed: []
  done:
    - acp-enhanced-v6.8.2-bootstrapped-and-configured
    - project-identity-taxonomy-wiki-customized
    - 3-adrs-written-tanstack-start-yaml-format-polling
    - 3-audits-completed-scope-plan-gap-final-check
    - 9-carryovers-tracked
    - m26-m28-planned-3-milestones-15-tasks
    - progress-yaml-regenerated-with-m25-history
    - readme-rewritten-with-badges-and-docs
    - github-repo-created-ssucipto-public
    - ssh-git-configured-for-ssucipto-identity
    - 4-commits-pushed
  deferred:
    - "M26 T1-T4 → task-144..147: schema hardening (active status, Zod, errors, progress.yaml)"
    - "M27 T5-T10 → task-148..153: CI, hooks, component/integration tests, npm packaging"
    - "M28 T10-T14 → task-154..158: schema version pin, fixture, sync test, docs"
  key_fact: >
    The visualizer is fundamentally a local dev tool — it reads progress.yaml
    from the local filesystem via Node.js server functions. Vercel deployment
    only makes sense as a self-hosting demo, not as the primary usage model.
    Primary distribution: npm run dev (today), npx acp-visualizer (P2 roadmap).


- date: 2026-06-03
  executor: copilot
  persona: A
  tasks_completed:
    - react-19-ssr-fix-devtools-clientonly
    - yaml-error-ux-improvements
    - multi-project-normalization
    - blocked-status-across-ui
    - audit-21-normalization-gaps
    - version-1.5.1-commit
  done:
    - __root-tsx-clientonly-wrapper-usebsyncExternalStore-for-devtools
    - format-error-ts-yamlexception-detection-with-diagnostic-hints
    - errorcard-tsx-amber-warning-card-with-how-to-fix-steps
    - routes-index-milestones-search-updated-to-errorcard
    - aggregatehome-failed-to-load-error-tooltip-on-hover
    - yaml-loader-ts-normalizeYaml-milestones-array-to-record
    - yaml-loader-ts-normalizeStatus-superseded-draft-mapping
    - schemas-ts-blocked-status-in-3-zod-enums
    - types-ts-blocked-status-in-3-interfaces
    - statusbadge-tsx-blocked-red-badge
    - filterbar-tsx-blocked-filter-option
    - yaml-loader-ts-file-null-strip-for-milestones
    - yaml-loader-ts-recent-work-date-null-guard
    - audit-21-normalization-gaps-report
    - acp-update-progress-yaml-normalization-entry
    - version-1.5.1-package-json-changelog-commit
  deferred:
    - npm-publish-v1.5.0
    - e2e-tests-playwright
  key_fact: >
    A normalizeYaml() layer between yaml.load() and Zod.parse() cleanly
    handles ACP format variants across projects — array→record conversion,
    status value mapping (superseded→completed), and field name aliasing
    (summary→description). The Zod schema stays strict; normalization
    handles the mess. Also: useSyncExternalStore provides a zero-render
    ClientOnly wrapper that avoids useState+useEffect hydration cycles.

- date: 2026-06-04
  executor: copilot
  persona: A
  tasks_completed:
    - ssr-crash-fix-console-error-filter
    - doc-dir-support-in-docs-viewer
    - acp-enhanced-v6.9.1-update
    - acp-visualizer-update-command
    - audit-22-update-gaps-fixed
    - audit-23-push-readiness
  done:
    - __root-tsx-inline-script-suppress-static-flag-error
    - docs-ts-added-doc-dirs-to-DOC_DIRS
    - acp-version-update-v6.8.2-to-v6.9.1
    - scripts-update-sh-robust-update-with-pipefail-shallow-npx-guard
    - bin-acp-visualizer-mjs-update-flag-and-help
    - scripts-install-sh-mentions-update
    - test-cli-e2e-ts-update-flag-assertion
    - audit-22-7-findings-all-fixed
    - audit-23-push-readiness-verified
  deferred:
    - npm-publish-v1.5.1
  key_fact: >
    set -euo pipefail is essential for update scripts. Without pipefail,
    git fetch 2>&1 | head -1 silently swallows fetch failures and the
    script continues as if it succeeded. Also: npx caches packages in
    throwaway dirs — --update must detect this and redirect to the
    persistent ~/.acp/visualizer install.
