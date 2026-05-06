import type { ProjectMetadata } from '../lib/types';
import { StatusBadge } from './StatusBadge';

export function ProjectHeader({ project }: { project: ProjectMetadata }) {
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        <StatusBadge status={project.status} />
        <span className="text-xs font-mono text-gray-400">v{project.version}</span>
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span>Started: {project.started}</span>
        <span>
          Current milestone: <strong>{project.current_milestone}</strong>
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{project.description}</p>
    </div>
  );
}
