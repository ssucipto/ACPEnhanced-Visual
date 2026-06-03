---
created: 2026-06-03
completed:
---

# Task 184: Shutdown Endpoint `/api/shutdown`

**Milestone**: [M33 - Server Lifecycle & UX](../../milestones/milestone-33-server-lifecycle-ux.md)  
**Estimated Time**: 0.5 hours  

---

## Objective

Create a server function that gracefully terminates the visualizer process, allowing users to stop the server from the browser without hunting for the terminal.

---

## Context

Currently the only way to stop the visualizer is `Ctrl+C` in the terminal where it was started. If the terminal was closed or the server was started in the background, the port remains occupied. This endpoint gives browser-based control.

---

## Steps

### 1. Create server route

```typescript
// server/routes/api/shutdown.ts
import { createServerFn } from '@tanstack/start';

export const shutdown = createServerFn({ method: 'POST' })
  .handler(async () => {
    // Schedule exit after response is sent back to client
    setTimeout(() => {
      console.log('🛑 Server stopped via /api/shutdown');
      process.exit(0);
    }, 100);
    return { ok: true };
  });
```

### 2. Ensure route is registered

Add to server route manifest so TanStack Start picks it up.

### 3. Test manually

```bash
curl -X POST http://localhost:3001/api/shutdown
# Server process exits, port freed
```

---

## Verification

- [ ] `POST /api/shutdown` returns `{ ok: true }`
- [ ] Server process terminates within ~100ms of response
- [ ] Port is freed (verify with `lsof -i :<port>`)
- [ ] Console logs "Server stopped via /api/shutdown"
