import { useState, useEffect } from 'react';
import type { LessonEntry } from '../../server/routes/api/memory-files';
import { fetchLessons } from '../../server/routes/api/memory-files';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600', medium: 'text-amber-600', low: 'text-gray-500',
};

export function LessonsFeed() {
  const [lessons, setLessons] = useState<LessonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLessons().then((r) => { setLessons(r.entries); setLoading(false); });
  }, []);

  const toggle = (key: string) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading lessons…</div>;
  if (!lessons.length) return <div className="p-6 text-gray-400">No lessons recorded yet.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Lessons Learned ({lessons.length} categories)</h1>
      <div className="space-y-3">
        {lessons.map((l) => {
          const key = l.task_type;
          return (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => toggle(key)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
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
    </div>
  );
}
