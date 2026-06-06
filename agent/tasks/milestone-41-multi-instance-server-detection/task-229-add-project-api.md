---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 229: Add-Project API

<!-- @acp.meta.task
topic: api, projects, multi-instance, server
description: Add POST /api/projects endpoint so CLI can register new projects on a running server instance
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 1.5 hours  

---

## Objective

Create a `POST /api/projects` server function that accepts a `ProjectConfig` payload and registers it with the running server's project list — persisted via the existing `projects-config` store. The CLI calls this when it detects a running instance, instead of spawning a new server.

---

## Context

Currently, adding a project is only possible through the web UI's `AddProjectDialog`, which calls `saveProjectConfigs` client-side. The CLI has no way to tell a running server "add this project."

This endpoint bridges that gap. The CLI sends a POST with the project details, and the server adds it to its persistent project list. The CLI then opens the browser to the new project's tab.

The existing `projects-config.ts` server function handles persistence (reading/writing a JSON file or env-based config). This new endpoint wraps that with HTTP validation.

---

## Steps

### 1. Create the add-project server function

Create `server/routes/api/projects.ts`:

```typescript
// server/routes/api/projects.ts
import { createServerFn } from '@tanstack/react-start';

interface AddProjectPayload {
  name: string;
  source: 'local' | 'github';
  path?: string;
  repo?: string;
  branch?: string;
}

interface AddProjectResponse {
  success: boolean;
  message: string;
  tabUrl?: string;
}

export const addProject = createServerFn({ method: 'POST' })
  .validator((data: unknown): AddProjectPayload => {
    if (!data || typeof data !== 'object') throw new Error('Invalid payload');
    const d = data as Record<string, unknown>;
    if (typeof d.name !== 'string' || !d.name.trim()) throw new Error('name is required');
    if (d.source !== 'local' && d.source !== 'github') throw new Error('source must be local or github');
    return {
      name: d.name as string,
      source: d.source as 'local' | 'github',
      path: typeof d.path === 'string' ? d.path : undefined,
      repo: typeof d.repo === 'string' ? d.repo : undefined,
      branch: typeof d.branch === 'string' ? d.branch : undefined,
    };
  })
  .handler(async ({ data }) => {
    const { loadProjectConfigs, saveProjectConfigs } = await import('./projects-config');

    // Load existing projects
    const { projects } = await loadProjectConfigs({ data: {} });

    // Check for duplicate name
    if (projects.some(p => p.name === data.name)) {
      return {
        success: false,
        message: `Project "${data.name}" already exists.`,
      } as AddProjectResponse;
    }

    // Build new project config
    const newProject = {
      name: data.name,
      source: data.source,
      path: data.path,
      repo: data.repo,
      branch: data.branch,
    };

    // Save
    const updated = [...projects, newProject];
    await saveProjectConfigs({ data: { projects: updated } });

    return {
      success: true,
      message: `Project "${data.name}" added successfully.`,
      tabUrl: `/?tab=${encodeURIComponent(data.name)}`,
    } as AddProjectResponse;
  });
```

### 2. Wire up route

Ensure TanStack Start picks this up as `POST /api/projects`. In TanStack Start, server functions are automatically exposed as RPC endpoints. The CLI will call it via HTTP fetch.

### 3. Test manually

```bash
# With server running on port 3000:
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"my-test-project","source":"local","path":"/path/to/agent/progress.yaml"}'

# Expected: {"success":true,"message":"Project \"my-test-project\" added successfully.","tabUrl":"/?tab=my-test-project"}
```

### 4. Handle edge cases

- Duplicate project name → return `success: false` with message
- Invalid source type → validation error
- Missing name → validation error

---

## Verification Checklist

- [ ] `POST /api/projects` with valid payload returns `success: true` + `tabUrl`
- [ ] Duplicate project name returns `success: false`
- [ ] Missing `name` returns validation error
- [ ] Invalid `source` returns validation error
- [ ] New project appears in web UI tab bar after adding
- [ ] Project persisted across server restarts (via projects-config store)
- [ ] TS 0 errors (`npx tsc --noEmit`)
