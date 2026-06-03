import { useState, useEffect } from 'react';
import type { AuditEntry } from '../../server/routes/api/memory-files';
import { fetchAudits } from '../../server/routes/api/memory-files';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export function AuditIndex() {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits().then((r) => { setAudits(r.entries); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading audits…</div>;
  if (!audits.length) return <div className="p-6 text-gray-400">No audit reports found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Audit Reports ({audits.length})</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">#</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Subject</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Findings</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {audits.map((a) => (
              <tr key={a.number} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-500">#{a.number}</td>
                <td className="px-4 py-2 text-xs text-gray-800">{a.subject}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{a.date}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{a.findings}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${SEVERITY_COLORS[a.highestSeverity] || ''}`}>
                    {a.highestSeverity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
