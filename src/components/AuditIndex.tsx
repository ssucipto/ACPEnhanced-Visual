import { useState, useEffect, useMemo } from 'react';
import type { AuditEntry } from '../../server/routes/api/memory-files';
import { fetchAudits } from '../../server/routes/api/memory-files';
import { StatsRow } from './StatsRow';
import { SourceLink } from './SourceLink';
import Fuse from 'fuse.js';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800', resolved: 'bg-green-100 text-green-800',
};

export function AuditIndex() {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sevFilter, setSevFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => { fetchAudits().then((r) => { setAudits(r.entries); setLoading(false); }); }, []);

  const fuse = useMemo(() => new Fuse(audits, { keys: ['subject'], threshold: 0.3 }), [audits]);

  const filtered = useMemo(() => {
    let list = query.length >= 2 ? fuse.search(query).map(r => r.item) : audits;
    if (sevFilter !== 'all') list = list.filter(a => a.highestSeverity === sevFilter);
    if (statusFilter !== 'all') list = list.filter(a => (a.status || 'open') === statusFilter);
    return list;
  }, [audits, query, fuse, sevFilter, statusFilter]);

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />)}</div>;

  const totalFindings = audits.reduce((s, a) => s + a.findings, 0);
  const openCount = audits.filter(a => (a.status || 'open') === 'open').length;
  const criticalCount = audits.filter(a => a.highestSeverity === 'critical').length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '📊', label: 'Audits', value: audits.length },
        { icon: '🔍', label: 'Findings', value: totalFindings },
        { icon: '🔴', label: 'Critical', value: criticalCount },
        { icon: '📂', label: 'Open', value: openCount },
      ]} />
      <h1 className="text-lg font-semibold mb-4">Audit Reports ({filtered.length})</h1>
      <div className="flex flex-wrap gap-1 mb-2">
        {['all','critical','high','medium','low'].map(s => (
          <button key={s} onClick={() => setSevFilter(s)}
            className={`px-3 py-1 text-xs rounded-md ${sevFilter===s?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
        <span className="mx-2 text-gray-300">|</span>
        {['all','open','resolved'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs rounded-md ${statusFilter===s?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search audits…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      {!audits.length ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">📊 No audit reports</p>
          <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-audit</code> to investigate a subject.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-left text-sm"><thead className="bg-gray-50"><tr>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">#</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Subject</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Findings</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Severity</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Source</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={a.number} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-500">#{a.number}</td>
                <td className="px-4 py-2 text-xs text-gray-800">{a.subject}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{a.date}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{a.findings}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${SEVERITY_COLORS[a.highestSeverity] || ''}`}>{a.highestSeverity}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${STATUS_COLORS[a.status || 'open'] || ''}`}>{a.status || 'open'}</span>
                </td>
                <td className="px-4 py-2">
                  <SourceLink file={`agent/reports/${a.file}`} />
                </td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
