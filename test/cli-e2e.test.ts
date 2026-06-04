import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, '../bin/acp-visualizer.mjs');
const projectRoot = resolve(__dirname, '..');

function runCli(args: string, cwd?: string): string {
  try {
    return execSync(`node "${cliPath}" ${args}`, {
      cwd: cwd ?? projectRoot,
      encoding: 'utf-8',
      timeout: 5000,
      stdio: 'pipe',
    });
  } catch (e: any) {
    return e.stdout || e.stderr || e.message || '';
  }
}

describe('CLI E2E — npx acp-visualizer', () => {
  it('--version prints version', () => {
    const out = runCli('--version');
    expect(out).toContain('acp-visualizer v');
  });

  it('--help prints usage with all flags', () => {
    const out = runCli('--help');
    expect(out).toContain('Usage:');
    expect(out).toContain('--path');
    expect(out).toContain('--repo');
    expect(out).toContain('--port');
    expect(out).toContain('--no-open');
    expect(out).toContain('--update');
    expect(out).toContain('--version');
    expect(out).toContain('--help');
  });

  it('-v and -h short flags work', () => {
    expect(runCli('-v')).toContain('acp-visualizer v');
    expect(runCli('-h')).toContain('Usage:');
  });

  it('fails gracefully when no project found', () => {
    try {
      execSync(`node "${cliPath}" --no-open`, {
        cwd: '/tmp',
        encoding: 'utf-8',
        timeout: 5000,
        stdio: 'pipe',
      });
      expect.unreachable('Should have thrown');
    } catch (e: any) {
      const msg = (e.stderr || e.stdout || '').toString();
      expect(msg).toContain('No ACP project found');
    }
  });
});
