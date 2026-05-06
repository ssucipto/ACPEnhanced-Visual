import type { Milestone } from '../lib/types';
import { ProgressBar } from './ProgressBar';

export function OverallProgress({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in_progress').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Overall Progress</h2>
        <span className="text-sm font-mono text-gray-500">
          {completed}/{total} milestones
        </span>
      </div>
      <ProgressBar value={pct} />
      <div className="flex gap-4 mt-2 text-xs text-gray-400">
        <span>✅ {completed} completed</span>
        <span>🔄 {inProgress} in progress</span>
        <span>⬚ {total - completed - inProgress} not started</span>
      </div>
    </div>
  );
}
