---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 233: Server Manager Enhancements

<!-- @acp.meta.task
topic: maintenance, server-manager, health, ui
description: Enhance Maintenance > Server Manager to show live port, PID, uptime from health endpoint; keep Stop Server button
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 2 hours  
**Audit Fixes**: audit-34-F5 (integrate with existing MaintenancePage, do not create parallel component)

---

## Objective

Enhance the **existing** Maintenance page's Server Manager section (`src/components/MaintenancePage.tsx`) to display real-time server health data (port, PID, uptime, project count) from the `GET /api/health` endpoint. Keep the Stop Server button and port scanning table. Do NOT create a parallel component.

---

## Context

The current Maintenance page (`/maintenance`) already has a Server Manager section with:
- Port scanning table (ports 3000-3020) via `scanServers()` from `server/routes/api/maintenance.ts`
- PID and process display per instance
- Stop buttons per instance via `killByPort()`
- System Info section (node version, platform, etc.)
- Refresh button

**Audit-34 finding (M5)**: The original task-233 proposed a parallel `ServerManagerCard` component with its own `useHealth` hook, ignoring the existing `MaintenancePage`. Instead, we should enhance the existing page by:

1. Adding an "uptime" column to the port scanning table (sourced from health endpoint for the current process)
2. Showing the health endpoint data at the top as a "Current Instance" card
3. Keeping the existing multi-instance port scanning (useful for edge cases where other instances are running)
4. Integrating `StopServerButton` from `ServerControls` into the existing Stop column

---

## Steps

### 1. Add health data to existing MaintenancePage

In `src/components/MaintenancePage.tsx`, add a "Current Instance" card at the top using the health endpoint:

```typescript
import { fetchHealth } from '../../server/routes/api/health';

// Inside MaintenancePage component:
const [health, setHealth] = useState<HealthResponse | null>(null);

useEffect(() => {
  fetchHealth({ data: {} }).then(setHealth).catch(() => {});
}, []);
```

### 2. Add Current Instance card

Add above the existing port scanning table:

```tsx
{/* Current Instance (from health endpoint) */}
{health && (
  <div className="border border-blue-200 rounded-lg overflow-hidden mb-6">
    <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
      <h2 className="text-sm font-semibold text-blue-700">Current Instance</h2>
    </div>
    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      <div>
        <span className="text-gray-500">Port:</span>{' '}
        <span className="font-mono font-medium">{health.port}</span>
      </div>
      <div>
        <span className="text-gray-500">PID:</span>{' '}
        <span className="font-mono font-medium">{health.pid}</span>
      </div>
      <div>
        <span className="text-gray-500">Uptime:</span>{' '}
        <span className="font-medium">{formatUptime(health.uptime)}</span>
      </div>
      <div>
        <span className="text-gray-500">Projects:</span>{' '}
        <span className="font-medium">{health.projectCount}</span>
      </div>
    </div>
  </div>
)}
```

### 3. Add uptime column to existing port table

In the existing port scanning table (the one from `scanServers()`), add an "Uptime" column. For the current instance (matching PID), show uptime from the health endpoint. For other instances, show "unknown" (since we can't query their health endpoint from this server).

### 4. Keep existing Stop button + Refresh

The existing Stop button column and the Refresh button are preserved as-is. The `StopServerButton` from `ServerControls` continues to work independently in the header.

### 5. Format helper

```typescript
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
```

---

## Verification Checklist

- [ ] Maintenance page shows live port, PID, uptime, project count
- [ ] "Refresh" button re-fetches health data
- [ ] Uptime formatted as human-readable (e.g., "2h 15m 30s")
- [ ] Stop Server button still works and cleans up port file
- [ ] Health data loads correctly on page mount
- [ ] Graceful error state if health endpoint is unreachable
- [ ] TS 0 errors (`npx tsc --noEmit`)
