import { createServerFn } from '@tanstack/react-start';
import { execSync } from 'node:child_process';
import { platform, totalmem, freemem, version as nodeVersion } from 'node:os';

export interface ServerInstance {
  port: number;
  pid: string;
  process: string;
}

export interface SystemInfo {
  nodeVersion: string;
  os: string;
  totalMemMB: number;
  freeMemMB: number;
}

/**
 * Scan ports for running Node/Vite processes.
 * Uses lsof on macOS/Linux, netstat fallback on Windows.
 */
export const scanServers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const instances: ServerInstance[] = [];
    const isWindows = platform() === 'win32';

    for (let port = 3000; port <= 3020; port++) {
      try {
        let pid = '';
        if (isWindows) {
          const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', timeout: 2000 });
          const match = out.match(/:(\d+)\s+.*LISTENING\s+(\d+)/);
          if (match) pid = match[2];
        } else {
          pid = execSync(`lsof -ti :${port}`, { encoding: 'utf8', timeout: 2000 }).trim();
        }

        if (pid) {
          let process = 'unknown';
          try {
            if (isWindows) {
              process = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf8', timeout: 2000 }).split(',')[0]?.replace(/"/g, '') || 'node';
            } else {
              process = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8', timeout: 2000 }).trim();
            }
          } catch { /* ignore */ }

          instances.push({
            port,
            pid: pid.split('\n')[0], // first PID if multiple
            process,
          });
        }
      } catch { /* port not in use */ }
    }

    return { instances };
  });

/**
 * Get system information.
 */
export const getSystemInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    return {
      nodeVersion: nodeVersion(),
      os: `${platform()} ${process.arch}`,
      totalMemMB: Math.round(totalmem() / 1024 / 1024),
      freeMemMB: Math.round(freemem() / 1024 / 1024),
    } as SystemInfo;
  });
