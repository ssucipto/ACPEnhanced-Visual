---
created: 2026-06-07
completed:  # Set by /acp-commit automatically — do not edit manually
---

# Task 232: UI Folder Picker in AddProjectDialog

<!-- @acp.meta.task
topic: ui, folder-picker, add-project, dialog, auto-detect
description: Add "Browse folder…" button to AddProjectDialog that calls folder scanner API and auto-fills the form
milestone: M41
status: draft
updated: 2026-06-07
@acp.meta.end -->

**Milestone**: [M41 - Multi-Instance Server Detection & Open Project Folder](../milestones/milestone-41-multi-instance-server-detection.md)  
**Design Reference**: None  
**Estimated Time**: 1.5 hours  

---

## Objective

Enhance the `AddProjectDialog` component with a "Browse folder…" option. When the user selects a folder, the UI calls `POST /api/scan-folder`, and if an ACP project is found, auto-fills the project name, source type, and path fields.

---

## Context

The current dialog has only text inputs. Users must know and type the exact path to `agent/progress.yaml`. With the folder scanner API (task-231), we can offer a much friendlier flow:

1. User clicks "Browse folder…"
2. A folder selection dialog opens (via a server-mediated picker or a text input with autocomplete)
3. Server scans the folder
4. Form auto-fills: project name, path, source type
5. User reviews and clicks Add

Since browsers can't access the filesystem directly (outside of the File System Access API which is Chrome-only), we'll use a server-mediated approach: a text input where users can paste a path, plus a "Scan" button that calls the scanner API.

---

## Steps

### 1. Add scan state and handler

In `src/components/AddProjectDialog.tsx`:

```typescript
import { useState } from 'react';
import { scanFolder } from '../../server/routes/api/scan-folder';
// ... existing imports

// Inside AddProjectDialog component:
const [scanPath, setScanPath] = useState('');
const [scanning, setScanning] = useState(false);
const [scanResult, setScanResult] = useState<{
  found: boolean;
  progressYamlPath?: string;
  projectName?: string;
  error?: string;
} | null>(null);

const handleScan = async () => {
  if (!scanPath.trim()) return;
  setScanning(true);
  setScanResult(null);
  try {
    const result = await scanFolder({ data: { path: scanPath.trim() } });
    setScanResult(result);
    if (result.found && result.progressYamlPath) {
      setName(result.projectName || '');
      setPath(result.progressYamlPath);
      setSource('local');
    }
  } catch (err: unknown) {
    setScanResult({
      found: false,
      error: err instanceof Error ? err.message : 'Scan failed',
    });
  } finally {
    setScanning(false);
  }
};
```

### 2. Add "Browse folder…" section to the form

Add a new section in the Local File area of the dialog:

```tsx
{source === 'local' && (
  <>
    <div className="border-t border-gray-200 pt-4 mt-2">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        Or browse a project folder
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={scanPath}
          onChange={(e) => setScanPath(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="/path/to/your-project"
        />
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning || !scanPath.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {scanning ? 'Scanning…' : 'Scan'}
        </button>
      </div>
    </div>

    {/* Scan result feedback */}
    {scanResult && (
      <div className={`text-xs p-2 rounded ${
        scanResult.found
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        {scanResult.found
          ? `✓ Found ACP project "${scanResult.projectName}" — form auto-filled.`
          : `✗ ${scanResult.error || 'No ACP project found.'}`
        }
      </div>
    )}
  </>
)}
```

### 3. Polish the UX

- When scan succeeds, auto-fill is immediate — user just clicks "Add Project"
- The manual path input is still available below for power users
- Scan button is disabled while scanning or when input is empty
- Clear scan result when user starts typing a new path

---

## Verification Checklist

- [ ] "Scan" button calls `POST /api/scan-folder` with the entered path
- [ ] On success, project name and path fields are auto-filled
- [ ] Source type switches to "Local File" on successful scan
- [ ] Error message shown when no ACP project found
- [ ] Scan button disabled while scanning
- [ ] Manual path input still works alongside the scanner
- [ ] Adding the project after scan works correctly (appears in tab bar)
- [ ] TS 0 errors, no lint warnings
