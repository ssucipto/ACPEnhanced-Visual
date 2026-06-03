---
created: 2026-06-03
completed:
---

# Task 185: Stop Server Button in ProjectHeader

**Milestone**: [M33 - Server Lifecycle & UX](../../milestones/milestone-33-server-lifecycle-ux.md)  
**Estimated Time**: 0.5 hours  
**Depends On**: task-184  

---

## Objective

Add a "⏹ Stop Server" button to the dashboard header that calls `/api/shutdown` and transitions to a confirmation state.

---

## Context

Users need a visible, one-click way to stop the server. The button lives in the header bar alongside the project title, making it always accessible regardless of which view is active.

---

## Steps

### 1. Create StopServerButton component

```tsx
// src/components/StopServerButton.tsx
import { useState } from 'react';
import { shutdown } from '../../server/routes/api/shutdown';

export function StopServerButton() {
  const [stopped, setStopped] = useState(false);

  const handleStop = async () => {
    try {
      await shutdown();
    } catch {
      // Server already shutting down, response may not arrive
    }
    setStopped(true);
  };

  if (stopped) {
    return (
      <span className="text-xs text-gray-400 italic">
        Server stopped · Close this tab
      </span>
    );
  }

  return (
    <button
      onClick={handleStop}
      className="text-red-500 hover:bg-red-50 hover:text-red-700 
                 px-3 py-1 rounded text-xs font-medium
                 border border-red-200 hover:border-red-300
                 transition-colors"
      title="Stop the visualizer server"
    >
      ⏹ Stop Server
    </button>
  );
}
```

### 2. Integrate into ProjectHeader

Place the button on the right side of the header bar, opposite the project title.

### 3. Handle error state

If the shutdown request fails (server already shutting down), transition to stopped state anyway — the server is likely already exiting.

---

## Verification

- [ ] "⏹ Stop Server" button visible in header on all routes
- [ ] Clicking button calls `/api/shutdown`
- [ ] Button transitions to "Server stopped · Close this tab"
- [ ] Button styling consistent with rest of header
- [ ] Button has accessible `title` attribute
