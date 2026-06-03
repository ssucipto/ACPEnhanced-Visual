# Session Memory
# Format: YAML blocks, last 3 loaded per session, auto-compacted at 15 entries
# DO NOT edit manually — updated by /acp-commit

- date: 2026-06-03
  executor: copilot
  persona: A
  tasks_completed:
    - audit-18-ux-polish
    - audit-19-test-packages
    - m35-test-coverage-quality-hardening
  done:
    - audit-18-markdown-viewer-custom-prose-css-tables-charts
    - audit-18-mermaid-js-integrated-for-diagram-rendering
    - audit-18-maintenance-stop-button-server-side-killByPort
    - audit-18-sidebar-alignment-pl8-to-pl10
    - audit-19-test-packages-audit-7-files-43-tests
    - m35-vitest-coverage-v8-installed-with-thresholds
    - m35-test-coverage-test-watch-scripts-added
    - m35-testing-library-jest-dom-matchers-added
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

