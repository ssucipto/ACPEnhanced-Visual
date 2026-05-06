import Fuse from 'fuse.js';
import type { Milestone, Task } from './types';

export type SearchResult =
  | { type: 'milestone'; item: Milestone }
  | { type: 'task'; item: Task };

export function buildSearchIndex(
  milestones: Milestone[],
  tasks: Task[],
): Fuse<SearchResult> {
  const items: SearchResult[] = [
    ...milestones.map((m) => ({ type: 'milestone' as const, item: m })),
    ...tasks.map((t) => ({ type: 'task' as const, item: t })),
  ];
  return new Fuse(items, {
    keys: [
      { name: 'item.id',   weight: 0.3 },
      { name: 'item.name', weight: 0.7 },
    ],
    threshold: 0.35,
    includeScore: true,
  });
}
