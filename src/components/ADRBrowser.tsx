import { useState, useEffect } from 'react';
import type { ADREntry } from '../../server/routes/api/memory-files';
import { fetchADRs } from '../../server/routes/api/memory-files';

const STATUS_COLORS: Record<string, string> = {
  Accepted: 'bg-green-100 text-green-800',
  Proposed: 'bg-blue-100 text-blue-800',
  Deprecated: 'bg-red-100 text-red-800',
  Superseded: 'bg-gray-100 text-gray-600',
};

export function ADRBrowser() {
  const [adrs, setADRs] = useState<ADREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchADRs().then((r) => { setADRs(r.entries); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? adrs : adrs.filter((a) => a.status === filter);
  const statuses = [...new Set(adrs.map((a) => a.status))];

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading ADRs…</div>;
  if (!adrs.length) return <div className="p-6 text-gray-400">No ADRs found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Architecture Decisions ({filtered.length})</h1>
      <div className="flex gap-1 mb-4">
        {['all', ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs rounded-md ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((adr) => (
          <div key={adr.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-gray-500">{adr.id}</span>
              <span className="text-sm font-medium text-gray-800">{adr.title}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${STATUS_COLORS[adr.status] || 'bg-gray-100 text-gray-600'}`}>{adr.status}</span>
            </div>
            {adr.context && <p className="text-xs text-gray-500 mb-1">{adr.context.slice(0, 200)}{adr.context.length > 200 ? '…' : ''}</p>}
            {adr.decision && <p className="text-xs text-gray-700"><strong>Decision:</strong> {adr.decision.slice(0, 200)}{adr.decision.length > 200 ? '…' : ''}</p>}
            {adr.reopened && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                ⚠️ DO NOT re-open unless: {adr.reopened}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
