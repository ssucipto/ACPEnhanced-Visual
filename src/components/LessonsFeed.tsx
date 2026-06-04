import { useState, useEffect, useMemo } from 'react';
import type { LessonEntry } from '../../server/routes/api/memory-files';
import { fetchLessons } from '../../server/routes/api/memory-files';
import { StatsRow } from './StatsRow';
import Fuse from 'fuse.js';

const PRIORITY_COLORS: Record<string, string> = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-gray-500' };

export function LessonsFeed() {
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => { fetchLessons().then((r) => { setLessons(r.entries); setLoading(false); }); }, []);

  const fuse = useMemo(() => new Fuse(lessons, {
    keys: ['task_type', 'mistakes.mistake', 'mistakes.correction'],
    threshold: 0.3,
  }), [lessons]);

  const filtered = useMemo(() => {
    let list = query.length >= 2 ? fuse.search(query).map(r => r.item) : lessons;
    if (priorityFilter !== 'all') {
      list = list.filter(l => l.mistakes?.some(m => m.priority === priorityFilter));
    }
    return list;
  }, [lessons, query, fuse, priorityFilter]);

  const toggle = (key: string) => {
    setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}</div>;

  const totalMistakes = lessons.reduce((sum, l) => sum + (l.mistakes?.length || 0), 0);
  const highPriorities = lessons.reduce((sum, l) => sum + (l.mistakes?.filter(m => m.priority === 'high').length || 0), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '📝', label: 'Total Lessons', value: totalMistakes },
        { icon: '🔴', label: 'High Priority', value: highPriorities },
        { icon: '📂', label: 'Categories', value: lessons.length },
        { icon: '📋', label: 'Most Common', value: lessons[0]?.task_type || '—' },
      ]} />
      <h1 className="text-lg font-semibold mb-4">Lessons Learned ({filtered.length} categories)</h1>
      <div className="flex flex-wrap gap-1 mb-2">
        {['all','high','medium','low'].map(p => (
          <button key={p} onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 text-xs rounded-md ${priorityFilter === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{p}</button>
        ))}
      </div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search lessons…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      {!lessons.length ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">📝 No lessons recorded</p>
          <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-commit</code> with lessons learned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => {
            const key = l.task_type;
            return (
              <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => toggle(key)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                  <span className="text-gray-400 text-xs">{expanded.has(key) ? '▼' : '▶'}</span>
                  <span className="text-sm font-medium text-gray-700">{key}</span>
                  <span className="font-mono text-xs text-gray-400 ml-auto">{l.mistakes?.length || 0} lessons</span>
                </button>
                {expanded.has(key) && (
                  <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
                    {(l.mistakes || []).map((m, j) => (
                      <div key={j} className="pl-6 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono uppercase ${PRIORITY_COLORS[m.priority] || ''}`}>{m.priority}</span>
                          <span className="text-xs text-red-500">❌ {m.mistake}</span>
                          {m.date && <span className="font-mono text-xs text-gray-400 ml-auto">{m.date}</span>}
                        </div>
                        <p className="text-xs text-green-600">✅ {m.correction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
