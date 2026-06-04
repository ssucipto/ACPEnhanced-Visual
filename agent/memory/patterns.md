# Reusable Code Patterns
# Populated automatically by /acp-commit when patterns are identified
# Format: date-stamped YAML entries, max 60 days active


- date: 2026-06-03
  name: normalize-before-validate
  summary: >
    Insert a normalizeYaml() layer between raw parse (yaml.load) and schema
    validation (Zod.parse) to handle format variants across projects.
    The schema stays strict; normalization handles array→record conversion,
    status value mapping, field renaming, and null→undefined stripping.
  code_ref: src/lib/yaml-loader.ts:normalizeYaml
  tags: [yaml, zod, normalization, multi-project, format-variants]

- date: 2026-06-03
  name: clientonly-usebsyncExternalStore
  summary: >
    Use useSyncExternalStore with a noop subscribe and getServerSnapshot
    returning true to create a zero-render ClientOnly wrapper. Unlike
    useState+useEffect, this avoids triggering a second render after
    hydration — the component simply never renders during SSR.
  code_ref: src/routes/__root.tsx:ClientOnly
  tags: [react, ssr, hydration, useSyncExternalStore, client-only]

- date: 2026-06-04
  name: robust-update-script-pattern
  summary: >
    Update scripts need set -euo pipefail, shallow clone detection
    (git rev-parse --is-shallow-repository), npx cache detection
    (check paths for _npx/ or /tmp/), uncommitted change warnings,
    and npm ci preferred over npm install for deterministic updates.
  code_ref: scripts/update.sh
  tags: [bash, update, robustness, pipefail, shallow-clone, npx]
