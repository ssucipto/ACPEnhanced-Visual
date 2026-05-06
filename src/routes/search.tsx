import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { useProgressData } from '../lib/data-source'
import { buildSearchIndex } from '../lib/search'

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search['q'] === 'string' ? search['q'] : '',
  }),
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()
  const { data, error, loading } = useProgressData()

  const results = useMemo(() => {
    if (!data || !q || q.length < 2) return null;
    const allMilestones = Object.values(data.milestones);
    const allTasks = Object.values(data.tasks).flat();
    const index = buildSearchIndex(allMilestones, allTasks);
    return index.search(q).map((r) => r.item);
  }, [data, q])

  if (loading) return <p className="p-4 text-gray-500">Loading…</p>
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>

  if (!q || q.length < 2) {
    return (
      <div className="p-4 text-gray-400 text-sm font-mono">
        Type at least 2 characters to search.
      </div>
    )
  }

  const milestoneResults = results?.filter((r) => r.type === 'milestone') ?? []
  const taskResults = results?.filter((r) => r.type === 'task') ?? []
  const total = (results?.length ?? 0)

  return (
    <div className="p-4 max-w-3xl">
      <h1 className="text-lg font-semibold mb-1">
        Search results for{' '}
        <span className="font-mono text-blue-600">&quot;{q}&quot;</span>
      </h1>
      <p className="text-sm text-gray-400 mb-4">{total} result{total !== 1 ? 's' : ''}</p>

      {total === 0 && (
        <p className="text-sm text-gray-500 font-mono">No results found.</p>
      )}

      {milestoneResults.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Milestones ({milestoneResults.length})
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {milestoneResults.map((r) => {
              if (r.type !== 'milestone') return null;
              const m = r.item;
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                  <span className="font-mono text-xs text-gray-400 w-10 shrink-0">{m.id}</span>
                  <span className="flex-1 text-sm text-gray-800">{m.name}</span>
                  <StatusBadge status={m.status} />
                  <span className="font-mono text-xs text-gray-400">{m.progress}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {taskResults.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Tasks ({taskResults.length})
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {taskResults.map((r) => {
              if (r.type !== 'task') return null;
              const t = r.item;
              return (
                <div key={`${t.milestoneId}-${t.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50">
                  <span className="font-mono text-xs text-gray-400 w-20 shrink-0">{t.id}</span>
                  <span className="flex-1 text-sm text-gray-800">{t.name}</span>
                  <StatusBadge status={t.status} />
                  <span className="font-mono text-xs text-gray-400 w-8 shrink-0">{t.milestoneId}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  )
}
