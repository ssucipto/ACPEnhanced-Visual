import { useState, useEffect } from 'react';
import type { RouteCostEntry } from '../../server/routes/api/route-costs';
import { fetchRouteCosts } from '../../server/routes/api/route-costs';

export function RouteCostsPage() {
  const [entries, setEntries] = useState<RouteCostEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRouteCosts().then((r) => { setEntries(r.entries); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading route costs…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Route Cost Reports ({entries.length})</h1>
      {entries.length === 0 ? (
        <div className="text-gray-400 text-sm">
          No route cost data found. This project may not use ACP Enhanced routing.<br />
          Route costs are recorded in <code className="bg-gray-100 px-1 rounded">agent/routing/ledger.md</code>.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Route</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Task</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Executor</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Cost</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-blue-600">{e.routeId}</td>
                  <td className="px-4 py-2 text-xs text-gray-800">{e.task}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{e.executor}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">{e.cost}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">{e.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
