---
created: 2026-06-03
completed:
---

# Task 186: Port + Data Source Display in Header

**Milestone**: [M33 - Server Lifecycle & UX](../../milestones/milestone-33-server-lifecycle-ux.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Show the active port number and data source path in the dashboard header so users always know which server they're connected to and where the data is coming from.

---

## Context

Audit-8 finding C2: Users can't see which port they're on or which project is loaded. Running `npm run visualize` twice starts two servers on different ports with no visual distinction. This display eliminates confusion.

---

## Steps

### 1. Detect port and data source on client

```typescript
// Server function to return runtime info
export const getServerInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    return {
      port: process.env.PORT || '3000',
      dataSource: process.env.PROGRESS_YAML_PATH || process.env.PROGRESS_YAML_REPO || 'unknown',
      sourceType: process.env.PROGRESS_YAML_REPO ? 'github' : 'local',
    };
  });
```

### 2. Display in header

```
🚀 ACP Progress Visualizer · :3001 · ../acp-enhanced/agent/progress.yaml
```

For GitHub sources:
```
🚀 ACP Progress Visualizer · :3001 · ssucipto/acp-enhanced (main)
```

### 3. Add subtle badge for source type

Local source: grey badge. GitHub source: purple badge with repo icon.

---

## Verification

- [ ] Port number displayed and matches `window.location.port`
- [ ] Local data source path truncated to relative path
- [ ] GitHub source shows owner/repo (branch)
- [ ] Info updates if server is restarted on different port
- [ ] No layout break on narrow viewports
