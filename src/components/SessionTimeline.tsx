import { useState, useEffect, useMemo } from 'react';
import type { SessionEntry } from '../../server/routes/api/memory-files';
import { fetchSessions } from '../../server/routes/api/memory-files';
import { StatsRow } from './StatsRow';
import Fuse from 'fuse.js';

export function SessionTimeline() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchSessions().then((r) => { setSessions(r.entries); setLoading(false); });
  }, []);

  const fuse = useMemo(() => new Fuse(sessions, {
    keys: ['executor', 'done', 'deferred', 'key_fact'],
    threshold: 0.3,
  }), [sessions]);

  const filtered = query.length >= 2 ? fuse.search(query).map((r) => r.item) : sessions;

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}
    </div>
  );

  const toggle = (i: number) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, SessionEntry[]>();
    for (const s of filtered) {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) {
        const g = map.get('All') || [];
        g.push(s); map.set('All', g);
        continue;
      }
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const g = map.get(key) || [];
      g.push(s); map.set(key, g);
    }
    return map;
  }, [filtered]);

  const totalTasks = sessions.reduce((sum, s) => sum + (s.tasks_completed?.length || 0), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '📅', label: 'Sessions', value: sessions.length },
        { icon: '✅', label: 'Tasks Done', value: totalTasks },
        { icon: '⚡', label: 'Avg/Session', value: sessions.length ? (totalTasks / sessions.length).toFixed(1) : '0' },
        { icon: '🕐', label: 'Last', value: sessions[0]?.date || '—' },
      ]} />

      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-lg font-semibold">Session Timeline ({filtered.length})</h1>
      </div>

      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions…"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />

      {!sessions.length ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">📅 No sessions yet</p>
          <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-commit</code> to record your first session.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([week, weekSessions]) => (
            <div key={week}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">{week}</h2>
              <div className="space-y-2">
                {weekSessions.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => toggle(i)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                      <span className="text-gray-400 text-xs">{expanded.has(i) ? '▼' : '▶'}</span>
                      <span className="font-mono text-xs text-gray-500">{s.date}</span>
                      <span className="text-sm text-gray-700">{s.executor}</span>
                      {s.key_fact && <span className="text-xs text-gray-400 italic truncate hidden sm:inline">— {s.key_fact.slice(0, 60)}</span>}
                      <span className="font-mono text-xs text-gray-400 ml-auto">{s.tasks_completed?.length || 0} tasks</span>
                    </button>
                    {expanded.has(i) && (
                      <div className="px-4 pb-3 pt-1 space-y-2 text-sm border-t border-gray-100">
                        {s.key_fact && (
                          <div>
                            <span className="text-xs text-gray-400 uppercase">Key Fact</span>
                            <p className="text-gray-700 mt-1 text-xs leading-relaxed">{s.key_fact}</p>
                          </div>
                        )}
                        {s.done?.length > 0 && (
                          <div><span className="text-xs text-gray-400 uppercase">Done</span>
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {s.done.map((d, j) => <li key={j} className="text-gray-600 font-mono text-xs">{d}</li>)}
                            </ul>
                          </div>
                        )}
                        {s.deferred?.length > 0 && (
                          <div><span className="text-xs text-gray-400 uppercase">Deferred</span>
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {s.deferred.map((d, j) => <li key={j} className="text-gray-500 font-mono text-xs">{d}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
