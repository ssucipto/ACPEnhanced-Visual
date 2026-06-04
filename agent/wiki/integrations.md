# Service Integrations — XML-tagged sections, load one section at a time
# last_verified: 2026-06-05

<filesystem>
  type: Local filesystem (Node.js fs)
  reads: agent/progress.yaml (configurable via PROGRESS_YAML_PATH env var)
  project_root: Derived from PROGRESS_YAML_PATH (set by CLI --path or auto-detect)
  polling: mtime check every 2s via fs.statSync
</filesystem>

<ci>
  platform: GitHub Actions
  triggers: push, pull_request
  steps: lint (tsc --noEmit), test (vitest run), build (vite build)
  config: .github/workflows/ci.yml
</ci>

<testing>
  framework: Vitest + @testing-library/react + @testing-library/jest-dom + jsdom
  coverage: @vitest/coverage-v8 (50% thresholds)
  files: 15 test files, 92 tests
  breakdown: yaml-loader (10), integration (3), sync (2), data-source (4), components (5), remote-render (14), cli-e2e (4), docs-viewer (4), maintenance (5), server-controls (6), smoke (14), command-reference (11), commands (4), stats-row (5), memory-files (1)
</testing>

<deployment>
  model: Local dev tool — npm run dev, npx acp-visualizer, or curl install
  install: curl -fsSL https://raw.githubusercontent.com/ssucipto/ACPEnhanced-Visual/main/scripts/install.sh | bash
  cli: npx acp-visualizer --path, --repo, --port, --no-open
  demo: Vercel could serve this repo's own progress.yaml as a self-hosting status page (not primary)
</deployment>
