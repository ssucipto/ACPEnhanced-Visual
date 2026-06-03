# Audit Report: M29-M32 — Gaps, Resource Management & Server Lifecycle

**Audit**: #8  
**Date**: 2026-06-03  
**Subject**: M29-M32 plan audit — GitHub remote visualization, extended views, resource/port management, server lifecycle  

## Summary

M29-M32 plans are structurally sound but have a critical operational gap: no server lifecycle management. Users can accumulate orphaned servers with no way to stop them from the browser. Additionally, M29's design focuses on fetch mechanics but doesn't explicitly address how remote data renders. M32's extended views need a navigation redesign. Three critical, two medium findings.

## Key Findings

| # | Finding | Severity | Affects |
|---|---------|----------|---------|
| C1 | **No server lifecycle management**: `npm run visualize` starts a server but there's no way to stop it from the browser. Closing the tab leaves the server running. Over multiple sessions, ports accumulate orphaned servers | 🔴 Critical | All |
| C2 | **No port visibility**: Users can't see which ports are in use or which projects are running. Starting `npm run visualize` twice for the same project creates two servers on different ports | 🔴 Critical | All |
| C3 | **M29 doesn't explicitly show rendering**: The design covers fetch + parse but doesn't confirm the data flows through the same component pipeline. Need to verify that remote data renders identically to local data | 🟡 Medium | M29 |
| M1 | **M32 needs navigation redesign**: Adding 6 new views to the current sidebar would make it cluttered. Need collapsible sections or a secondary nav | 🟡 Medium | M32 |
| M2 | **No port conflict resolution report**: When `find-port.mjs` skips a port, there's no feedback about WHY. User doesn't know if 3000 is their other project or something else | 🟢 Low | M29-M31 |

## Server Lifecycle Deep-Dive

### Current Flow

```
User: npm run visualize
  → find-port.mjs picks port 3001 (3000 busy)
  → vite dev --port 3001 --open
  → Dashboard opens in browser
  → User closes browser tab
  → Server keeps running (orphaned) 💀
  
Next day:
  → npm run visualize again
  → find-port.mjs picks port 3002 (3000+3001 busy)
  → Another orphaned server 💀💀
```

### Proposed: Server Lifecycle with Shutdown Button

```
┌─────────────────────────────────────────────────┐
│ 🚀 ACP Progress Visualizer    ⏹ Stop Server    │  ← header bar
│─────────────────────────────────────────────────│
│                                                 │
│  [dashboard content]                            │
│                                                 │
└─────────────────────────────────────────────────┘

Clicking "⏹ Stop Server":
  1. Client: POST /api/shutdown
  2. Server: process.exit(0)
  3. Browser: shows "Server stopped. You can close this tab."
```

### Implementation

**D1: Shutdown endpoint**

```typescript
// server/routes/api/shutdown.ts
export const shutdown = createServerFn({ method: 'POST' })
  .handler(async () => {
    // Schedule exit after response is sent
    setTimeout(() => process.exit(0), 100);
    return { ok: true };
  });
```

**D2: Stop button in header**

```tsx
function StopServerButton() {
  const [stopped, setStopped] = useState(false);
  
  const handleStop = async () => {
    await shutdown();
    setStopped(true);
  };
  
  if (stopped) return <span className="text-gray-400">Server stopped · Close this tab</span>;
  
  return (
    <button onClick={handleStop} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm">
      ⏹ Stop Server
    </button>
  );
}
```

**D3: Port status in UI**

Show active port and data source in the header:
```
🚀 ACP Progress Visualizer · :3001 · ../acp-enhanced/agent/progress.yaml
```

**D4: Auto-shutdown on browser close** (via `beforeunload`)

```typescript
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/api/shutdown');
});
```

This best-effort cleans up when the tab is closed.

## M29 Visualization Verification

M29's design covers data fetching but the rendering is implicit — it uses the same `ProgressData` type and components. Verification needed:

| Check | Status |
|-------|--------|
| GitHub fetch returns `ProgressData` | ✅ Same type |
| Data flows through `useProgressData` | ⚠️ Hook needs to dispatch to correct fetch fn |
| Components render remote data | ⚠️ Need test with real GitHub source |

**Recommendation**: Add an integration test to M29 that fetches from a public repo and renders components.

## M32 Navigation Redesign

Current sidebar (8 links will become 14+ with M32):
```
Home
Milestones
Search
───
Sessions        ← new
ADRs            ← new
Lessons         ← new
Patterns        ← new
Packages        ← new
Audits          ← new
```

**Fix**: Group into collapsible sections:
```
📊 Dashboard
  Home
  Milestones
  Search
  
📋 Project Intelligence
  Sessions
  ADRs
  Lessons
  Patterns
  
📦 Management
  Packages
  Audits
```

## Revised M32 Tasks

| Task | Change |
|------|--------|
| T1 (176) | Unchanged — Session Timeline |
| T2 (177) | Unchanged — ADR Browser |
| T3 (178) | Unchanged — Lessons Feed |
| T4 (179) | Unchanged — Pattern Library |
| T5 (180) | Unchanged — Package Inventory |
| T6 (181) | Unchanged — Audit Index |
| **T7 (new)** | Sidebar redesign with collapsible sections |
| **T8 (new)** | Server lifecycle: shutdown button + endpoint + port display |

## Recommendations

1. **Add M33 milestone**: "Server Lifecycle & UX" with shutdown button, port visibility, auto-shutdown on tab close, and sidebar redesign
2. **Add integration test to M29**: Verify remote data renders correctly through all components
3. **Update M29 task T5 (163)**: Include rate limit warning banner in the dashboard header bar
