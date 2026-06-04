import { describe, it, expect, afterAll } from 'vitest';
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseCommandContent } from '../../server/routes/api/commands';

const TMP = join(import.meta.dirname || __dirname, '.tmp-cmd-test');
const CMD_DIR = join(TMP, 'agent', 'commands');

function setup() { if (!existsSync(CMD_DIR)) mkdirSync(CMD_DIR, { recursive: true }); }
function cleanup() { if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true }); }
function writeCmd(name: string, content: string) { const p = join(CMD_DIR, name); writeFileSync(p, content, 'utf-8'); return p; }
function parseFile(filePath: string) {
  return parseCommandContent(readFileSync(filePath, 'utf-8'), filePath.split('/').pop()!);
}
afterAll(cleanup);

describe('parseCommandContent', () => {
  it('parses a basic acp command', () => {
    setup();
    const fp = writeCmd('acp.audit.md',
      '# Command: audit\n\n**Namespace**: acp\n**Version**: 1.1.0\n**Status**: Active\n**Purpose**: Deep-dive investigation\n**Category**: Workflow\n**Frequency**: As Needed\n**Scripts**: None\n'
    );
    const cmd = parseFile(fp);
    expect(cmd).not.toBeNull();
    expect(cmd!.name).toBe('/acp-audit');
    expect(cmd!.namespace).toBe('acp');
    expect(cmd!.version).toBe('1.1.0');
    expect(cmd!.purpose).toBe('Deep-dive investigation');
    expect(cmd!.category).toBe('Workflow');
  });

  it('parses a git command', () => {
    setup();
    const fp = writeCmd('git.commit.md',
      '# Directive: commit\n\n**Namespace**: git\n**Version**: 1.0.0\n**Status**: Active\n**Purpose**: Commit with ACP conventions\n**Category**: version control\n**Frequency**: Per Commit\n**Scripts**: None\n'
    );
    const cmd = parseFile(fp);
    expect(cmd).not.toBeNull();
    expect(cmd!.name).toBe('@commit');
    expect(cmd!.namespace).toBe('git');
  });

  it('extracts CLI flags', () => {
    setup();
    const fp = writeCmd('acp.f.md',
      '# Command: f\n\n**Namespace**: acp\n**Version**: 1.0.0\n**Status**: Active\n**Purpose**: Has flags\n**Category**: Tools\n**Frequency**: As Needed\n**Scripts**: None\n\n## Arguments\n\n- `--output <path>` or `-o <path>`\n- `--pre-impl`\n'
    );
    const cmd = parseFile(fp);
    expect(cmd).not.toBeNull();
    expect(cmd!.flags).toContain('--output <path>');
    expect(cmd!.flags).toContain('-o <path>');
    expect(cmd!.flags).toContain('--pre-impl');
  });

  it('returns null for empty content', () => {
    expect(parseCommandContent('', 'empty.md')).toBeNull();
  });
});
