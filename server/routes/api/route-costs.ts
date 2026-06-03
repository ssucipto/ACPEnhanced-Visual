import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';

export interface RouteCostEntry {
  routeId: string;
  task: string;
  executor: string;
  cost: string;
  timestamp: string;
}

/**
 * Parse ACP Enhanced's routing ledger for cost data.
 */
export const fetchRouteCosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const ledgerPath = process.cwd() + '/agent/routing/ledger.md';
    if (!existsSync(ledgerPath)) return { entries: [] as RouteCostEntry[], error: null };

    try {
      const raw = readFileSync(ledgerPath, 'utf-8');
      const entries: RouteCostEntry[] = [];
      const lines = raw.split('\n');

      for (const line of lines) {
        const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
        if (cols.length >= 5 && cols[0]?.startsWith('route-')) {
          entries.push({
            routeId: cols[0],
            task: cols[1] || '',
            executor: cols[2] || '',
            cost: cols[3] || '',
            timestamp: cols[4] || '',
          });
        }
      }
      return { entries, error: null };
    } catch {
      return { entries: [], error: null };
    }
  });
