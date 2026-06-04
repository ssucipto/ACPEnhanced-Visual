import { useState, useEffect, useMemo } from 'react';
import type { ADREntry } from '../../server/routes/api/memory-files';
import { fetchADRs } from '../../server/routes/api/memory-files';
import { StatsRow } from './StatsRow';
import Fuse from 'fuse.js';

const STATUS_COLORS: Record<string, string> = {
  Accepted: 'bg-green-100 text-green-800', Proposed: 'bg-blue-100 text-blue-800',
  Deprecated: 'bg-red-100 text-red-800', Superseded: 'bg-gray-100 text-gray-600',
};

export function ADRBrowser() {
  const [adrs, setADRs] = useState<ADREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { fetchADRs().then((r) => { setADRs(r.entries); setLoading(false); }); }, []);

  const fuse = useMemo(() => new Fuse(adrs, { keys: ['title','context','decision','consequences'], threshold: 0.3 }), [adrs]);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? adrs : adrs.filter((a) => a.status === filter);
    if (query.length >= 2) list = fuse.search(query).map(r => r.item).filter(a => list.includes(a));
    return list;
  }, [adrs, filter, query, fuse]);

  const statuses = [...new Set(adrs.map((a) => a.status))];

  const toggle = (id: string) => {
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />)}</div>;

  const accepted = adrs.filter(a => a.status === 'Accepted').length;
  const deprecated = adrs.filter(a => a.status === 'Deprecated').length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '📋', label: 'Total ADRs', value: adrs.length },
        { icon: '✅', label: 'Accepted', value: accepted },
        { icon: '🗑️', label: 'Deprecated', value: deprecated },
        { icon: '🕐', label: 'Latest', value: adrs[0]?.date || '—' },
      ]} />
      <h1 className="text-lg font-semibold mb-4">Architecture Decisions ({filtered.length})</h1>
      <div className="flex flex-wrap gap-1 mb-2">
        {['all', ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs rounded-md ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ADRs…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      {!adrs.length ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">📋 No ADRs found</p>
          <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-decide</code> to record architecture decisions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((adr) => (
            <div key={adr.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-gray-500">{adr.id}</span>
                <span className="text-sm font-medium text-gray-800">{adr.title}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono ${STATUS_COLORS[adr.status] || 'bg-gray-100 text-gray-600'}`}>{adr.status}</span>
                {adr.date && <span className="font-mono text-xs text-gray-400 ml-auto">{adr.date}</span>}
              </div>
              {adr.context && (
                <div>
                  <p className="text-xs text-gray-500">{expanded.has(adr.id) ? adr.context : adr.context.slice(0, 120)}{adr.context.length > 120 && !expanded.has(adr.id) ? '…' : ''}</p>
                </div>
              )}
              {adr.decision && expanded.has(adr.id) && (
                <p className="text-xs text-gray-700 mt-2"><strong>Decision:</strong> {adr.decision}</p>
              )}
              {adr.consequences && expanded.has(adr.id) && (
                <p className="text-xs text-gray-600 mt-1"><strong>Consequences:</strong> {adr.consequences}</p>
              )}
              {(adr.context.length > 120 || adr.decision || adr.consequences) && (
                <button onClick={() => toggle(adr.id)} className="text-xs text-blue-600 mt-1 hover:underline">
                  {expanded.has(adr.id) ? 'Show less' : 'Read more'}
                </button>
              )}
              {adr.reopened && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">⚠️ DO NOT re-open unless: {adr.reopened}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
