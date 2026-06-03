import { useState, useEffect } from 'react';
import type { PatternEntry } from '../../server/routes/api/memory-files';
import { fetchPatterns } from '../../server/routes/api/memory-files';

export function PatternLibrary() {
  const [patterns, setPatterns] = useState<PatternEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchPatterns().then((r) => { setPatterns(r.entries); setLoading(false); });
  }, []);

  const filtered = query
    ? patterns.filter((p) => (p.name + p.description).toLowerCase().includes(query.toLowerCase()))
    : patterns;

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading patterns…</div>;
  if (!patterns.length) return <div className="p-6 text-gray-400">No patterns recorded yet.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Pattern Library ({patterns.length})</h1>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patterns…"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4 font-mono
                   focus:outline-none focus:ring-2 focus:ring-blue-400" />
      <div className="space-y-3">
        {filtered.map((p, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              {p.date && <span className="font-mono text-xs text-gray-400">{p.date}</span>}
            </div>
            {p.description && <p className="text-xs text-gray-600 mb-1">{p.description}</p>}
            {p.code_ref && <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.code_ref}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
