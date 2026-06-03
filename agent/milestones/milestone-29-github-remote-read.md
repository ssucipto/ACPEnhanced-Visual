# Milestone 29: GitHub Remote Read Support

**Goal**: Enable the visualizer to fetch progress.yaml from GitHub repositories via raw.githubusercontent.com, removing the local-clone requirement  
**Duration**: ~6 hours  
**Design**: [local.github-remote-read](../design/local.github-remote-read.md)

---

## Overview

Currently the visualizer only reads progress.yaml from the local filesystem. This milestone adds GitHub API support via `raw.githubusercontent.com` so users can monitor ACP projects without cloning them locally. Implements D1-D6 from the design: dual data source config, server-side fetch, auth for private repos, remote polling via Last-Modified header, and error handling.

---

## Deliverables

### 1. Config Parser
- Parse `PROGRESS_YAML_REPO=owner/repo:branch:path` into structured config
- Backward compatible: `PROGRESS_YAML_PATH` still works
- Defaults: branch=main, path=agent/progress.yaml

### 2. GitHub Fetch Server Function
- New server function: `fetchGitHubProgress` using raw.githubusercontent.com
- Returns typed ProgressData (same as filesystem fetch)
- GITHUB_TOKEN auth for private repos

### 3. Remote Polling
- HEAD request for Last-Modified header (instead of fs.statSync)
- Re-fetch when header changes
- Same 2s polling interval

### 4. Error Handling
- Repo not found, file not found, rate limited, network error
- Clear error messages with recovery suggestions

---

## Tasks

| Task | D-ID | Description | Est. |
|------|------|-------------|------|
| 159 | D1, D2 | Config parser for PROGRESS_YAML_REPO | 1h |
| 160 | D3 | GitHub fetch server function | 1.5h |
| 161 | D4 | GITHUB_TOKEN auth support | 0.5h |
| 162 | D5 | Remote polling via Last-Modified | 1h |
| 163 | D6 | Error handling for remote sources | 1h |
| 182 | D7 | Integration test — remote data renders through components | 1h |

## Success Criteria

- `PROGRESS_YAML_REPO=ssucipto/acp-enhanced npm run dev` shows the ACP Enhanced dashboard
- Private repos work with GITHUB_TOKEN
- Remote polling detects changes and auto-refreshes
- Network errors show clear messages
