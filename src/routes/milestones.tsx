import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { FilterBar, type StatusFilter } from '../components/FilterBar'
import { MilestoneTable } from '../components/MilestoneTable'
import { MilestoneTree } from '../components/MilestoneTree'
import { ErrorCard } from '../components/ErrorCard'
import { useProgressData } from '../lib/data-source'

export const Route = createFileRoute('/milestones')({ component: MilestonesPage })

function MilestonesPage() {
  const { data, error, loading } = useProgressData()
  const [view, setView] = useState<'table' | 'tree'>('table')
  const [filter, setFilter] = useState<StatusFilter>('all')

  // Hooks must be called before any early returns
  const milestones = Object.values(data?.milestones ?? {})

  const filtered = useMemo(
    () => (filter === 'all' ? milestones : milestones.filter((m) => m.status === filter)),
    [filter, data],
  )

  if (loading) return <p className="p-4 text-gray-500">Loading…</p>
  if (error ?? !data) return <ErrorCard error={error ?? 'Unknown error'} />

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">Milestones ({filtered.length})</h1>
        <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
          {(['table', 'tree'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 capitalize ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'table' ? '📊 Table' : '🌳 Tree'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <FilterBar value={filter} onChange={setFilter} />
      </div>

      {view === 'table' ? (
        <MilestoneTable milestones={filtered} />
      ) : (
        <MilestoneTree milestones={filtered} tasks={data.tasks} />
      )}
    </div>
  )
}

