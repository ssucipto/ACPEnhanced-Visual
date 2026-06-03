import { createServerFn } from '@tanstack/react-start';
import { parseProgressYaml } from '../../../src/lib/yaml-loader';
import { formatParseError } from '../../../src/lib/format-error';
import { resolveToken } from '../../../src/lib/config';

// ── ETag Cache ─────────────────────────────────────────────────────────────

const etagCache = new Map<string, string>();

// ── Rate Limit Tracking ────────────────────────────────────────────────────

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetEpoch: number; // Unix seconds
}

let lastRateLimit: RateLimitInfo | null = null;

export function getLastRateLimit(): RateLimitInfo | null {
  return lastRateLimit;
}

// ── Server Function ────────────────────────────────────────────────────────

export const fetchGitHubProgress = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: {
      repo: string;
      ref?: string;
      filePath?: string;
      tokenEnv?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { repo, ref = 'main', filePath = 'agent/progress.yaml', tokenEnv } = data;
    const url = `https://raw.githubusercontent.com/${repo}/${ref}/${filePath}`;

    const owner = repo.split('/')[0];
    const token = resolveToken(owner, tokenEnv);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Conditional request: send ETag if cached
    const etag = etagCache.get(repo);
    if (etag) {
      headers['If-None-Match'] = etag;
    }

    try {
      const res = await fetch(url, { headers });

      // Track rate limit info from response headers
      const remaining = res.headers.get('X-RateLimit-Remaining');
      const limit = res.headers.get('X-RateLimit-Limit');
      const resetEpoch = res.headers.get('X-RateLimit-Reset');
      if (remaining !== null && limit !== null) {
        lastRateLimit = {
          remaining: parseInt(remaining, 10),
          limit: parseInt(limit, 10),
          resetEpoch: resetEpoch ? parseInt(resetEpoch, 10) : 0,
        };
      }

      // 304 — not modified, no body
      if (res.status === 304) {
        return { data: null, unchanged: true as const, error: null };
      }

      // Rate limited
      if (res.status === 403 && remaining === '0') {
        const retryAfter = res.headers.get('Retry-After') ?? 'unknown';
        return {
          data: null,
          unchanged: false as const,
          error: `Rate limited. Resets in ${retryAfter}s. Set GITHUB_TOKEN for 5000 req/hr.`,
        };
      }

      // Auth failure
      if (res.status === 401) {
        return {
          data: null,
          unchanged: false as const,
          error: `Auth failed for ${repo}. Check your token.`,
        };
      }

      // Not found
      if (res.status === 404) {
        return {
          data: null,
          unchanged: false as const,
          error: `Not found: ${repo}/${ref}/${filePath}`,
        };
      }

      // Other errors
      if (!res.ok) {
        return {
          data: null,
          unchanged: false as const,
          error: `GitHub error ${res.status}: ${res.statusText}`,
        };
      }

      // Cache ETag for next request
      const newEtag = res.headers.get('ETag');
      if (newEtag) {
        etagCache.set(repo, newEtag);
      }

      const raw = await res.text();
      return {
        data: parseProgressYaml(raw),
        unchanged: false as const,
        error: null,
      };
    } catch (err: unknown) {
      const message = formatParseError(err);
      // Network errors: check if it's a fetch error vs parse error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        return {
          data: null,
          unchanged: false as const,
          error: `Cannot reach GitHub. Check your internet connection.`,
        };
      }
      return { data: null, unchanged: false as const, error: message };
    }
  });
