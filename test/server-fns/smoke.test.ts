import { describe, it, expect } from 'vitest';

/**
 * Server function smoke tests: verify all server functions exist,
 * are callable functions, and have the correct export shape.
 *
 * Note: TanStack Start server functions use RPC and can't be
 * directly invoked in vitest. These tests verify that functions
 * export correctly and their handlers are well-formed.
 */

describe('server functions — exports verification', () => {
  it('shutdown.ts exports shutdown and getServerInfo', async () => {
    const mod = await import('../../server/routes/api/shutdown');
    expect(mod.shutdown).toBeDefined();
    expect(mod.getServerInfo).toBeDefined();
    expect(typeof mod.shutdown).toBe('function');
    expect(typeof mod.getServerInfo).toBe('function');
  });

  it('maintenance.ts exports scanServers, getSystemInfo, killByPort', async () => {
    const mod = await import('../../server/routes/api/maintenance');
    expect(mod.scanServers).toBeDefined();
    expect(mod.getSystemInfo).toBeDefined();
    expect(mod.killByPort).toBeDefined();
    expect(typeof mod.scanServers).toBe('function');
    expect(typeof mod.getSystemInfo).toBe('function');
    expect(typeof mod.killByPort).toBe('function');
  });

  it('docs.ts exports listDocs and readDoc', async () => {
    const mod = await import('../../server/routes/api/docs');
    expect(mod.listDocs).toBeDefined();
    expect(mod.readDoc).toBeDefined();
    expect(typeof mod.listDocs).toBe('function');
    expect(typeof mod.readDoc).toBe('function');
  });

  it('progress.ts exports fetchProgress', async () => {
    const mod = await import('../../server/routes/api/progress');
    expect(mod.fetchProgress).toBeDefined();
    expect(typeof mod.fetchProgress).toBe('function');
  });

  it('memory-files.ts exports all memory fetch functions', async () => {
    const mod = await import('../../server/routes/api/memory-files');
    expect(mod.fetchSessions).toBeDefined();
    expect(mod.fetchADRs).toBeDefined();
    expect(mod.fetchLessons).toBeDefined();
    expect(mod.fetchPatterns).toBeDefined();
    expect(mod.fetchPackages).toBeDefined();
    expect(mod.fetchAudits).toBeDefined();
  });

  it('projects-config.ts exports loadProjectConfigs and saveProjectConfigs', async () => {
    const mod = await import('../../server/routes/api/projects-config');
    expect(mod.loadProjectConfigs).toBeDefined();
    expect(mod.saveProjectConfigs).toBeDefined();
    expect(typeof mod.loadProjectConfigs).toBe('function');
    expect(typeof mod.saveProjectConfigs).toBe('function');
  });

  it('github-fetch.ts exports fetchGitHubProgress and getRateLimitInfo', async () => {
    const mod = await import('../../server/routes/api/github-fetch');
    expect(mod.fetchGitHubProgress).toBeDefined();
    expect(mod.getRateLimitInfo).toBeDefined();
    expect(typeof mod.fetchGitHubProgress).toBe('function');
    expect(typeof mod.getRateLimitInfo).toBe('function');
  });

  it('watch.ts exports fetchWatchToken', async () => {
    const mod = await import('../../server/routes/api/watch');
    expect(mod.fetchWatchToken).toBeDefined();
    expect(typeof mod.fetchWatchToken).toBe('function');
  });

  it('remote-watch.ts exports fetchRemoteWatch', async () => {
    const mod = await import('../../server/routes/api/remote-watch');
    expect(mod.fetchRemoteWatch).toBeDefined();
    expect(typeof mod.fetchRemoteWatch).toBe('function');
  });

  it('route-costs.ts exports fetchRouteCosts', async () => {
    const mod = await import('../../server/routes/api/route-costs');
    expect(mod.fetchRouteCosts).toBeDefined();
    expect(typeof mod.fetchRouteCosts).toBe('function');
  });

  it('package-json.ts exports fetchPackageJson', async () => {
    const mod = await import('../../server/routes/api/package-json');
    expect(mod.fetchPackageJson).toBeDefined();
    expect(typeof mod.fetchPackageJson).toBe('function');
  });
});

/**
 * Security: path traversal protection in docs.ts and progress.ts.
 * The path sanitization logic (resolve + startsWith) is tested here
 * using Node's built-in path module directly.
 */
describe('path traversal protection (pure logic)', () => {
  it('resolve + startsWith prevents traversal', () => {
    const { resolve } = require('node:path');
    const cwd = process.cwd();

    // Normal path: inside project
    const safe = resolve(cwd, 'README.md');
    expect(safe.startsWith(cwd)).toBe(true);

    // Traversal attempt: blocked
    const unsafe = resolve(cwd, '../../../etc/passwd');
    expect(unsafe.startsWith(cwd)).toBe(false);
  });

  it('resolve nullifies .. segments within project', () => {
    const { resolve } = require('node:path');
    const cwd = process.cwd();

    // Deep traversal within project still resolves inside
    const deep = resolve(cwd, 'agent/memory/../../README.md');
    expect(deep.startsWith(cwd)).toBe(true);
  });
});
