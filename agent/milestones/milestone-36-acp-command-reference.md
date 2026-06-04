# Milestone: M36 — ACP Command Reference (User Manual)

**Priority**: 2  
**Status**: planned  
**Progress**: 0  
**Estimated Weeks**: 0.5  
**Tasks**: 5  

## Summary

Add a `/commands` route that serves as a **user manual for both ACP Enhanced and ACP Enhanced Visualizer**. Parses `agent/commands/*.md` for 64 ACP commands and the visualizer's own CLI flags, rendering them as a searchable, filterable command reference table.

## Why No ACP Enhanced Team Needed

Same as before — command `.md` files already live in the visualizer repo. Visualizer commands are hardcoded from `--help` output.

## Data Sources

| Source | Commands | Namespace | Parser |
|--------|----------|-----------|--------|
| `agent/commands/acp.*.md` | 62 | `acp` | Metadata extraction (first 30 lines) |
| `agent/commands/git.*.md` | 2 | `git` | Same parser |
| Visualizer CLI | 7 | `visualizer` | Hardcoded from `--help` output |

## Design

### Data Flow
```
agent/commands/*.md (64 files)  →  fetchCommands → metadata extraction
visualizer CLI flags (7)        →  hardcoded list → same CommandMeta shape
                                     ↓
                              CommandReference component → searchable table
                                     ↓
                              /commands route
```

### Visualizer Commands

| Command | Purpose | Arguments |
|---------|---------|-----------|
| `acp-visualizer` | Start the progress dashboard | `--path`, `--repo`, `--port`, `--no-open` |
| `acp-visualizer --update` | Update visualizer to latest version | — |
| `acp-visualizer --version` | Show version | `-v` |
| `acp-visualizer --help` | Show usage | `-h` |

These are hardcoded in the parser and tagged `namespace: visualizer`, `category: ACP Visualizer`.

## Tasks

### task-188: Command metadata parser
- Create `server/routes/api/commands.ts` with `fetchCommands` server fn
- Read `agent/commands/*.md`, extract metadata from first 30 lines
- Exclude `command.template.md`
- Normalize categories (19 → 6 groups), handle template placeholders
- Include hardcoded visualizer commands (7)
- Return typed `CommandMeta[]`
- Estimated: 1.5h

### task-189: CommandReference component
- Create `src/components/CommandReference.tsx`
- Searchable table with columns: command, namespace, category, purpose
- Filter by category, namespace (acp, git, visualizer)
- Expandable rows showing full purpose + arguments + usage
- Color-coded namespace badges (acp=purple, git=orange, visualizer=blue)
- Estimated: 1.5h

### task-190: /commands route
- Create `src/routes/commands.tsx`
- Wire command data hook
- Add sidebar entry: "📖 Command Reference" in new "Reference" section
- Estimated: 0.5h

### task-191: Integration + tests
- Test command parser with real 64 command files + visualizer commands
- Component test for CommandReference
- Verify sidebar link and routing
- Estimated: 1h
