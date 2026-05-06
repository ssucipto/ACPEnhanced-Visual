import { createFileRoute } from '@tanstack/react-router'
import { NextSteps } from '../components/NextSteps'
import { OverallProgress } from '../components/OverallProgress'
import { ProjectHeader } from '../components/ProjectHeader'
import { useProgressData } from '../lib/data-source'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { data, error, loading } = useProgressData()
  if (loading)
    return <div className="p-6 text-gray-400 animate-pulse">Loading…</div>
  if (error ?? !data)
    return <div className="p-6 text-red-500">Error: {error}</div>

  const milestones = Object.values(data.milestones)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ProjectHeader project={data.project} />
      <OverallProgress milestones={milestones} />
      <NextSteps items={data.next_steps} />
    </div>
  )
}

