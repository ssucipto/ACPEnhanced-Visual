import { useState, useEffect, useMemo } from 'react';
import type { PatternEntry } from '../../server/routes/api/memory-files';
import { fetchPatterns } from '../../server/routes/api/memory-files';
import { StatsRow } from './StatsRow';
import Fuse from 'fuse.js';

export function PatternLibrary() {
  const [patterns, setPatterns] = useState<PatternEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => { fetchPatterns().then((r) => { setPatterns(r.entries); setLoading(false); }); }, []);

  const fuse = useMemo(() => new Fuse(patterns, { keys: ['name','description','code_ref'], threshold: 0.3 }), [patterns]);
  const filtered = query.length >= 2 ? fuse.search(query).map(r => r.item) : patterns;

  // Group by category if tags exist
  const grouped = useMemo(() => {
    const map = new Map<string, PatternEntry[]>();
    let hasTags = false;
    for (const p of filtered) {
      const cats = p.tags?.length ? p.tags : ['General'];
      if (p.tags?.length) hasTags = true;
      for (const cat of cats) {
        const g = map.get(cat) || [];
        g.push(p); map.set(cat, g);
      }
    }
    if (!hasTags) return null;
    return map;
  }, [filtered]);

  const withRefs = patterns.filter(p => p.code_ref).length;

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />)}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '🧩', label: 'Patterns', value: patterns.length },
        { icon: '📎', label: 'With Code Refs', value: withRefs },
        { icon: '🕐', label: 'Latest', value: patterns[patterns.length-1]?.date || '—' },
      ]} />
      <h1 className="text-lg font-semibold mb-4">Pattern Library ({filtered.length})</h1>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search patterns…"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
      {!patterns.length ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">🧩 No patterns yet</p>
          <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-commit</code> — reusable patterns are auto-detected.</p>
        </div>
      ) : grouped ? (
        [...grouped.entries()].map(([cat, catPatterns]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">{cat} ({catPatterns.length})</h2>
            <div className="space-y-3">
              {catPatterns.map((p, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    {p.date && <span className="font-mono text-xs text-gray-400">{p.date}</span>}
                    {p.usage_count && <span className="text-xs text-gray-400 ml-auto">Used {p.usage_count}×</span>}
                  </div>
                  {p.description && <p className="text-xs text-gray-600 mb-1">{p.description}</p>}
                  {p.code_ref && <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.code_ref}</span>}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                {p.date && <span className="font-mono text-xs text-gray-400">{p.date}</span>}
                {p.usage_count && <span className="text-xs text-gray-400 ml-auto">Used {p.usage_count}×</span>}
              </div>
              {p.description && <p className="text-xs text-gray-600 mb-1">{p.description}</p>}
              {p.code_ref && <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{p.code_ref}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
