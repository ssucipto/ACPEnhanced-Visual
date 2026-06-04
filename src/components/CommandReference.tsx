import { useState, useMemo } from 'react';
import type { CommandMeta } from '../../server/routes/api/commands';

const NS_COLORS: Record<string, string> = {
  acp: 'bg-purple-100 text-purple-800',
  git: 'bg-orange-100 text-orange-800',
  visualizer: 'bg-blue-100 text-blue-800',
};

interface Props {
  commands: CommandMeta[];
}

export function CommandReference({ commands }: Props) {
  const [search, setSearch] = useState('');
  const [nsFilter, setNsFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const namespaces = useMemo(
    () => ['all', ...new Set(commands.map((c) => c.namespace))],
    [commands],
  );
  const categories = useMemo(
    () => ['all', ...new Set(commands.map((c) => c.category))].sort(),
    [commands],
  );

  const filtered = useMemo(() => {
    let list = commands;
    if (nsFilter !== 'all') list = list.filter((c) => c.namespace === nsFilter);
    if (catFilter !== 'all') list = list.filter((c) => c.category === catFilter);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.purpose.toLowerCase().includes(q),
      );
    }
    return list;
  }, [commands, nsFilter, catFilter, search]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-lg font-semibold">Command Reference ({filtered.length})</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search commands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          value={nsFilter}
          onChange={(e) => setNsFilter(e.target.value)}
          aria-label="Filter by namespace"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md"
        >
          {namespaces.map((ns) => (
            <option key={ns} value={ns}>
              {ns === 'all' ? 'All Namespaces' : ns}
            </option>
          ))}
        </select>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          aria-label="Filter by category"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_120px_1fr] gap-2 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span>Command</span>
          <span>NS</span>
          <span>Category</span>
          <span>Purpose</span>
        </div>
        <div className="divide-y divide-gray-100">
          {filtered.map((cmd) => (
            <div key={cmd.name}>
              <button
                onClick={() => setExpanded(expanded === cmd.name ? null : cmd.name)}
                className="w-full grid grid-cols-[1fr_80px_120px_1fr] gap-2 px-4 py-2.5 text-left hover:bg-gray-50 text-sm"
              >
                <span className="font-mono font-medium text-gray-800 truncate">
                  {cmd.name}
                </span>
                <span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${NS_COLORS[cmd.namespace] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {cmd.namespace}
                  </span>
                </span>
                <span className="text-xs text-gray-500 truncate">{cmd.category}</span>
                <span className="text-xs text-gray-600 truncate">{cmd.purpose}</span>
              </button>
              {expanded === cmd.name && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2 text-sm">
                  <p className="text-gray-700">{cmd.purpose}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Version: {cmd.version}</span>
                    <span>Status: {cmd.status}</span>
                    <span>Frequency: {cmd.frequency}</span>
                    {cmd.scripts && <span>Scripts: {cmd.scripts}</span>}
                  </div>
                  {cmd.flags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {cmd.flags.map((f) => (
                        <code
                          key={f}
                          className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono text-gray-700"
                        >
                          {f}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No commands match your filters.</p>
      )}
    </div>
  );
}
