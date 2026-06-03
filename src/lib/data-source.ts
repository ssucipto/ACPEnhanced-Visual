import { useEffect, useRef, useState } from 'react';
import type { ProgressData } from './types';
import { fetchProgress } from '../../server/routes/api/progress';
import { fetchWatchToken } from '../../server/routes/api/watch';
import { fetchGitHubProgress } from '../../server/routes/api/github-fetch';
import { fetchRemoteWatch } from '../../server/routes/api/remote-watch';
import { resolveDataSourceConfig, type DataSourceConfig } from './config';

// Default polling intervals
const POLL_LOCAL = 2000;
const POLL_REMOTE = 10000;

// Resolve config once at module level — env vars don't change at runtime
let _config: DataSourceConfig | null = null;
function getConfig(): DataSourceConfig {
  if (!_config) _config = resolveDataSourceConfig();
  return _config;
}

/**
 * React hook for fetching and auto-refreshing progress.yaml data.
 *
 * Supports dual data sources:
 *   - Local filesystem (PROGRESS_YAML_PATH)
 *   - GitHub remote (PROGRESS_YAML_REPO)
 *
 * Auto-detects source from environment and routes to correct server functions.
 * Uses adaptive polling: 2s local, 10s remote.
 */
export function useProgressData(path?: string) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastTokenRef = useRef<number | null>(null);
  const config = path ? { type: 'local' as const, path } : getConfig();

  const load = async () => {
    try {
      setLoading(true);

      let result: { data: ProgressData | null; error: string | null };
      if (config.type === 'github' && config.repo) {
        const ghResult = await fetchGitHubProgress({
          data: {
            repo: config.repo,
            ref: config.ref ?? 'main',
            filePath: config.filePath ?? 'agent/progress.yaml',
            tokenEnv: config.tokenEnv,
          },
        });
        result = { data: ghResult.data, error: ghResult.error };
      } else {
        result = await fetchProgress({
          data: path ? { path } : {},
        });
      }

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();

    const pollInterval = config.type === 'local' ? POLL_LOCAL : POLL_REMOTE;

    const intervalId = setInterval(async () => {
      try {
        let mtime: number | null = null;

        if (config.type === 'github' && config.repo) {
          const remoteResult = await fetchRemoteWatch({
            data: {
              repo: config.repo,
              ref: config.ref ?? 'main',
              filePath: config.filePath ?? 'agent/progress.yaml',
              tokenEnv: config.tokenEnv,
            },
          });
          mtime = remoteResult.mtime;
        } else {
          const localResult = await fetchWatchToken({
            data: path ? { path } : {},
          });
          mtime = localResult.mtime;
        }

        if (mtime !== null) {
          if (
            lastTokenRef.current !== null &&
            lastTokenRef.current !== mtime
          ) {
            void load();
          }
          lastTokenRef.current = mtime;
        }
      } catch {
        // Silently ignore polling errors — data remains stale
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { data, error, loading, reload: load };
}

