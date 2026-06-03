import yaml from 'js-yaml';
import type { ProgressData, Milestone, Task } from './types';
import { progressDataSchema } from './schemas';

export function parseProgressYaml(raw: string): ProgressData {
  // Use json:true to allow duplicate keys (progress.yaml is user-edited)
  // Last value wins for duplicates — this is lenient but practical
  const rawDoc = yaml.load(raw, { json: true });

  // Zod validates the raw structure
  const doc = progressDataSchema.parse(rawDoc);

  // Normalise milestones: inject 'id' from the YAML key
  const milestones: Record<string, Milestone> = {};
  for (const [id, data] of Object.entries(doc.milestones)) {
    milestones[id] = { ...data, id } as Milestone;
  }

  // Normalise tasks: inject 'milestoneId' from the YAML key
  const tasks: Record<string, Task[]> = {};
  for (const [milestoneId, taskList] of Object.entries(doc.tasks)) {
    tasks[milestoneId] = (taskList ?? []).map((t) => ({
      ...t,
      milestoneId,
    })) as Task[];
  }

  return {
    project: doc.project,
    milestones,
    tasks,
    recent_work: doc.recent_work,
    next_steps: doc.next_steps,
    notes: doc.notes,
    current_blockers: doc.current_blockers,
  };
}
