# Session Memory
# Format: YAML blocks, last 3 loaded per session, auto-compacted at 15 entries
# DO NOT edit manually — updated by /acp-commit

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

