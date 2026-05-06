import { createFileRoute } from '@tanstack/react-router'
import { useProgressData } from '../lib/data-source'
import { MilestoneTable } from '../components/MilestoneTable'

export const Route = createFileRoute('/milestones')({ component: MilestonesPage })

function MilestonesPage() {
  const { data, error, loading } = useProgressData()
  if (loading) return <p className="p-4 text-gray-500">Loading…</p>
  if (error ?? !data) return <p className="p-4 text-red-500">Error: {error}</p>
  const milestones = Object.values(data.milestones)
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Milestones ({milestones.length})</h1>
      <MilestoneTable milestones={milestones} />
    </div>
  )
}
