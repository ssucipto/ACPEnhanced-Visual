# Service Integrations — XML-tagged sections, load one section at a time
# last_verified: 2026-06-03

<filesystem>
  type: Local filesystem (Node.js fs)
  reads: agent/progress.yaml (configurable via PROGRESS_YAML_PATH env var)
  polling: mtime check every 2s via fs.statSync
</filesystem>

<ci>
  platform: GitHub Actions
  triggers: push, pull_request
  steps: lint (tsc --noEmit), test (vitest run), build (vite build)
  config: .github/workflows/ci.yml
</ci>

<testing>
  framework: Vitest + @testing-library/react + jsdom
  files: 5 test files, 25 tests
  coverage: yaml-loader (10), hooks (4), components (6), integration (3), sync (2)
</testing>

<deployment>
  model: Local dev tool — no cloud deployment
  primary: npm run dev (reads local progress.yaml)
  future: npx acp-visualizer (P2 roadmap — starts local server)
  demo: Vercel could serve this repo's own progress.yaml as a self-hosting status page (not primary)
</deployment>
