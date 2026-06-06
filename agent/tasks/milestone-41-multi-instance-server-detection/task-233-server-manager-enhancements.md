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
**Estimated Time**: 1.5 hours  

---

## Objective

Update the Maintenance page's Server Manager section to display real-time server info (port, PID, uptime, project count) from the `GET /api/health` endpoint. Keep the Stop Server button functional. Also show a note if multiple instances are somehow detected (edge case visibility).

---

## Context

The current Maintenance page (`/maintenance`) has a Server Manager section but it shows static or limited info. With the new health endpoint (task-227), we can display live data that updates on page load and on a manual refresh button.

This also serves as a debugging aid — if users report issues, they can check the Maintenance page to see the server's state.

---

## Steps

### 1. Create a health hook

Add to `src/lib/data-source.ts` or create `src/lib/use-health.ts`:

```typescript
// src/lib/use-health.ts
import { useState, useEffect } from 'react';
import type { HealthResponse } from '../../server/routes/api/health';

export function useHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealth(data as HealthResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return { health, error, loading, refresh: fetch };
}
```

### 2. Enhance the Server Manager section

In `src/routes/maintenance.tsx`, add/update the Server Manager card:

```tsx
import { useHealth } from '../lib/use-health';
import { StopServerButton, ServerInfoDisplay } from '../components/ServerControls';

function ServerManagerCard() {
  const { health, error, loading, refresh } = useHealth();

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Server Manager</h3>
        <button
          onClick={refresh}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-400 animate-pulse">Loading server info…</div>}

      {error && <div className="text-red-500 text-sm">⚠ {error}</div>}

      {health && (
        <div className="grid grid-cols-2 gap-3 text-sm">
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
          <div>
            <span className="text-gray-500">Version:</span>{' '}
            <span className="font-mono text-xs">{health.version}</span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200">
        <StopServerButton />
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
```

### 3. Keep existing controls

Ensure `ServerInfoDisplay` and `StopServerButton` from `src/components/ServerControls.tsx` are still rendered and functional. These were built in M33.

### 4. Edge case: multi-instance note

Add a subtle note if somehow multiple instances are detected (e.g., if another port file exists):

```tsx
{/* Optional: multi-instance warning */}
{health && (
  <p className="text-xs text-gray-400 mt-2">
    Only one server instance is expected. If you have multiple terminals running
    <code className="text-xs">npx acp-visualizer</code>, the first one started
    serves all projects.
  </p>
)}
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
