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

function configFromProject(project?: {
  source: 'local' | 'github';
  path?: string;
  repo?: string;
  branch?: string;
}): DataSourceConfig {
  if (!project) return getConfig();
  if (project.source === 'github' && project.repo) {
    return {
      type: 'github',
      repo: project.repo,
      ref: project.branch ?? 'main',
      filePath: 'agent/progress.yaml',
    };
  }
  return {
    type: 'local',
    path: project.path ?? 'agent/progress.yaml',
  };
}

/**
 * React hook for fetching and auto-refreshing progress.yaml data.
 *
 * @param pathOrProject   Local path string (backward compat) or project config
 *                        { source, path?, repo?, branch? } for multi-project routing.
 */
export function useProgressData(
  pathOrProject?: string | { source: 'local' | 'github'; path?: string; repo?: string; branch?: string },
) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const lastTokenRef = useRef<number | null>(null);

  const config: DataSourceConfig =
    typeof pathOrProject === 'string'
      ? { type: 'local', path: pathOrProject }
      : pathOrProject && typeof pathOrProject === 'object'
        ? configFromProject(pathOrProject)
        : getConfig();

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
          data: config.path ? { path: config.path } : {},
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
            data: config.path ? { path: config.path } : {},
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
  }, [typeof pathOrProject === 'string' ? pathOrProject : JSON.stringify(pathOrProject)]);

  return { data, error, loading, reload: load };
}

