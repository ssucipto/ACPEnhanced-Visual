---
created: 2026-06-03
completed:
---

# Task 187: Auto-Shutdown on Tab Close + Port Conflict Report

**Milestone**: [M33 - Server Lifecycle & UX](../../milestones/milestone-33-server-lifecycle-ux.md)  
**Estimated Time**: 1 hour  
**Depends On**: task-184  

---

## Objective

Add `beforeunload` auto-shutdown so closing the browser tab triggers server cleanup, and improve `find-port.mjs` to report why ports are busy.

---

## Context

Audit-8: Users close the browser tab thinking the server stops, but it doesn't. `beforeunload` with `sendBeacon` provides best-effort cleanup. Additionally, `find-port.mjs` silently skips busy ports with no explanation — users don't know if port 3000 is their other project or something else.

---

## Steps

### 1. Add beforeunload listener

```typescript
// In __root.tsx or a useEffect in the app shell
useEffect(() => {
  const handleBeforeUnload = () => {
    navigator.sendBeacon('/api/shutdown');
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

### 2. Handle sendBeacon limitations

`sendBeacon` sends a POST but can't read the response. This is best-effort — if the browser crashes, the server stays running. That's acceptable.

### 3. Improve find-port.mjs with port conflict report

```javascript
// scripts/find-port.mjs — add process detection
import { execSync } from 'child_process';

function checkPort(port) {
  try {
    const result = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (result) {
      const pids = result.split('\n');
      for (const pid of pids) {
        try {
          const cmd = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
          console.log(`  Port ${port}: busy (${cmd}, PID ${pid})`);
        } catch {
          console.log(`  Port ${port}: busy (PID ${pid}, unknown process)`);
        }
      }
      return true;
    }
  } catch {
    // lsof returns non-zero if port is free
  }
  return false;
}
```

Report format:
```
🔍 Scanning ports from 3000...
  Port 3000: busy (node, PID 12345)
  Port 3001: free
✅ Using port 3001
```

### 4. Keep existing auto-detect behavior

`find-port.mjs` still returns the first free port. The conflict report is informational only — printed to stdout so users understand which ports are in use.

---

## Verification

- [ ] Closing browser tab sends `sendBeacon` to `/api/shutdown`
- [ ] Server process exits within ~1 second of tab close
- [ ] `find-port.mjs` reports process name + PID for busy ports
- [ ] `find-port.mjs` reports "free" for available ports
- [ ] Auto-detect still picks first free port ≥ 3000
