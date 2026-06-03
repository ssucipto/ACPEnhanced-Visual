import { useEffect, useState } from 'react';
import { getLastRateLimit, type RateLimitInfo } from '../../server/routes/api/github-fetch';

/**
 * Displays a warning banner when GitHub API rate limit is below 20%.
 * Polls rate limit info every 30s.
 */
export function RateLimitBanner() {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  useEffect(() => {
    const check = () => {
      const info = getLastRateLimit();
      if (info && info.remaining / info.limit < 0.2) {
        setRateLimit(info);
      } else {
        setRateLimit(null);
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  if (!rateLimit) return null;

  const pct = Math.round((rateLimit.remaining / rateLimit.limit) * 100);
  const resetIn = rateLimit.resetEpoch
    ? Math.max(0, Math.round((rateLimit.resetEpoch * 1000 - Date.now()) / 60000))
    : null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 font-mono">
      ⚠️ GitHub API: {rateLimit.remaining}/{rateLimit.limit} requests remaining ({pct}%).
      {resetIn !== null && ` Resets in ~${resetIn} min.`}{' '}
      Set GITHUB_TOKEN for 5,000 req/hr.
    </div>
  );
}
