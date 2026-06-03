import { useState, useEffect } from 'react';
import type { SessionEntry } from '../../server/routes/api/memory-files';
import { fetchSessions } from '../../server/routes/api/memory-files';

export function SessionTimeline() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchSessions().then((r) => {
      setSessions(r.entries);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading sessions…</div>;
  if (!sessions.length) return <div className="p-6 text-gray-400">No sessions recorded yet.</div>;

  const toggle = (i: number) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Session Timeline ({sessions.length})</h1>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <span className="text-gray-400 text-xs">{expanded.has(i) ? '▼' : '▶'}</span>
              <span className="font-mono text-xs text-gray-500">{s.date}</span>
              <span className="text-sm text-gray-700">{s.executor}</span>
              <span className="font-mono text-xs text-gray-400 ml-auto">{s.tasks_completed?.length || 0} tasks</span>
            </button>
            {expanded.has(i) && (
              <div className="px-4 pb-3 pt-1 space-y-2 text-sm border-t border-gray-100">
                {s.done?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase">Done</span>
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {s.done.map((d, j) => <li key={j} className="text-gray-600 font-mono text-xs">{d}</li>)}
                    </ul>
                  </div>
                )}
                {s.deferred?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase">Deferred</span>
                    <ul className="ml-4 mt-1 space-y-0.5">
                      {s.deferred.map((d, j) => <li key={j} className="text-gray-500 font-mono text-xs">{d}</li>)}
                    </ul>
                  </div>
                )}
                {s.key_fact && (
                  <div>
                    <span className="text-xs text-gray-400 uppercase">Key Fact</span>
                    <p className="text-gray-700 mt-1 text-xs leading-relaxed">{s.key_fact}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
