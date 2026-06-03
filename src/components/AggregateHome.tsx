import type { ProgressData } from '../lib/types';
import type { ProjectConfig } from '../lib/projects';
import { StatusBadge } from './StatusBadge';

interface ProjectSnapshot {
  config: ProjectConfig;
  data: ProgressData | null;
  error?: string | null;
}

interface Props {
  projects: ProjectSnapshot[];
  onSelectProject: (name: string) => void;
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export function AggregateHome({ projects, onSelectProject }: Props) {
  const totalMilestones = projects.reduce(
    (sum, p) => sum + (p.data ? Object.keys(p.data.milestones).length : 0), 0,
  );
  const activeProjects = projects.filter(
    (p) => p.data?.project.status === 'active' || p.data?.project.status === 'in_progress',
  ).length;
  const completedMilestones = projects.reduce(
    (sum, p) =>
      sum +
      (p.data
        ? Object.values(p.data.milestones).filter((m) => m.status === 'completed').length
        : 0),
    0,
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-900">All Projects</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Active" value={activeProjects} />
        <StatCard label="Milestones" value={totalMilestones} />
        {completedMilestones > 0 && (
          <StatCard label="Completed" value={completedMilestones} />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Project List
        </h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {projects.map((p) => (
            <button
              key={p.config.name}
              onClick={() => onSelectProject(p.config.name)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <span className="flex-1 text-sm font-medium text-gray-800">
                {p.config.name}
              </span>
              {p.data ? (
                <>
                  <StatusBadge status={p.data.project.status} />
                  <span className="font-mono text-xs text-gray-400">
                    {Object.keys(p.data.milestones).length} milestones
                  </span>
                </>
              ) : (
                <span
                  className="text-xs text-red-400 font-mono cursor-help"
                  title={p.error ?? 'Project data could not be loaded'}
                >
                  Failed to load
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
