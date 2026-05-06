import yaml from 'js-yaml';
import type { ProgressData, Milestone, Task, WorkEntry } from './types';

export function parseProgressYaml(raw: string): ProgressData {
  const doc = yaml.load(raw) as Record<string, unknown>;

  // Normalise milestones: inject 'id' from the YAML key
  const milestonesRaw = (doc['milestones'] ?? {}) as Record<string, unknown>;
  const milestones: Record<string, Milestone> = {};
  for (const [id, data] of Object.entries(milestonesRaw)) {
    milestones[id] = { id, ...(data as object) } as Milestone;
  }

  // Normalise tasks: inject 'milestoneId' from the YAML key
  const tasksRaw = (doc['tasks'] ?? {}) as Record<string, unknown[]>;
  const tasks: Record<string, Task[]> = {};
  for (const [milestoneId, taskList] of Object.entries(tasksRaw)) {
    tasks[milestoneId] = (taskList ?? []).map((t) => ({
      milestoneId,
      ...(t as object),
    })) as Task[];
  }

  return {
    project: doc['project'] as ProgressData['project'],
    milestones,
    tasks,
    recent_work: (doc['recent_work'] as WorkEntry[]) ?? [],
    next_steps: (doc['next_steps'] as string[]) ?? [],
    notes: (doc['notes'] as string[]) ?? [],
  };
}
