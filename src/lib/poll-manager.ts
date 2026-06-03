import type { DataSourceConfig } from './config';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PollSource {
  id: string;
  config: DataSourceConfig;
  onChange: () => void;
}

// ── Intervals ──────────────────────────────────────────────────────────────

const POLL_LOCAL = 2000;   // 2s — filesystem is cheap
const POLL_REMOTE = 10000; // 10s — 360 req/hr, safe within 5000/hr limit

// ── Poll Manager ───────────────────────────────────────────────────────────

/**
 * Shared PollManager for M30 multi-project support.
 *
 * Single poll loop for all data sources instead of per-component loops.
 * Adaptive intervals: 2s local, 10s remote.
 */
class PollManager {
  private sources = new Map<string, PollSource>();
  private lastMtimes = new Map<string, number | null>();
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private pollFn: ((source: PollSource) => Promise<{ mtime: number | null }>) | null = null;

  /** Register the poll function (called once by data-source hook) */
  setPollFn(fn: (source: PollSource) => Promise<{ mtime: number | null }>) {
    this.pollFn = fn;
  }

  addSource(source: PollSource) {
    this.sources.set(source.id, source);
    this.startIfNeeded();
  }

  removeSource(id: string) {
    this.sources.delete(id);
    this.lastMtimes.delete(id);
    if (this.sources.size === 0) {
      this.stop();
    }
  }

  private startIfNeeded() {
    if (this.timerId !== null) return;
    this.scheduleNext();
  }

  private stop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNext() {
    // Use the shortest interval among active sources
    const interval = this.getMinInterval();
    this.timerId = setTimeout(() => {
      void this.pollAll();
    }, interval);
  }

  private getMinInterval(): number {
    let min = POLL_REMOTE;
    for (const source of this.sources.values()) {
      if (source.config.type === 'local') {
        return POLL_LOCAL; // local is always fastest — no need to check further
      }
    }
    return min;
  }

  private async pollAll() {
    if (!this.pollFn) return;
    const promises: Promise<void>[] = [];

    for (const source of this.sources.values()) {
      promises.push(
        this.pollFn(source).then((result) => {
          if (result.mtime !== null) {
            const prev = this.lastMtimes.get(source.id);
            if (prev !== null && prev !== result.mtime) {
              source.onChange();
            }
            this.lastMtimes.set(source.id, result.mtime);
          }
        }).catch(() => {
          // Silently ignore polling errors
        }),
      );
    }

    await Promise.all(promises);
    this.scheduleNext();
  }

  /** Get the appropriate poll interval for a config */
  static getInterval(config: DataSourceConfig): number {
    return config.type === 'local' ? POLL_LOCAL : POLL_REMOTE;
  }
}

/** Singleton instance */
export const pollManager = new PollManager();
