import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseProgressYaml } from './yaml-loader';

const fixtureRaw = readFileSync(
  join(import.meta.dirname, '../../test/fixtures/sample-progress.yaml'),
  'utf-8',
);

describe('parseProgressYaml', () => {
  it('parses valid progress.yaml without error', () => {
    const result = parseProgressYaml(fixtureRaw);
    expect(result).toBeDefined();
    expect(result.project).toBeDefined();
  });

  it('injects milestone id from YAML key', () => {
    const result = parseProgressYaml(fixtureRaw);
    expect(result.milestones['M25']).toBeDefined();
    expect(result.milestones['M25'].id).toBe('M25');
    expect(result.milestones['M33']).toBeDefined();
    expect(result.milestones['M33'].id).toBe('M33');
  });

  it('injects milestoneId into task items', () => {
    const result = parseProgressYaml(fixtureRaw);
    expect(result.tasks['M25']).toBeDefined();
    expect(result.tasks['M25'].length).toBeGreaterThan(0);
    for (const task of result.tasks['M25']) {
      expect(task.milestoneId).toBe('M25');
    }
    for (const task of result.tasks['M33']) {
      expect(task.milestoneId).toBe('M33');
    }
  });

  it('returns correct milestone data', () => {
    const result = parseProgressYaml(fixtureRaw);
    const m25 = result.milestones['M25'];
    expect(m25.name).toBe('ACP Progress Visualizer (P0 MVP)');
    expect(m25.status).toBe('in_progress');
    expect(m25.progress).toBe(13);
    expect(m25.tasks_completed).toBe(1);
    expect(m25.tasks_total).toBe(8);
  });

  it('defaults empty recent_work to []', () => {
    const result = parseProgressYaml('project:\n  name: test\n  version: "1.0"\n  started: "2026-01-01"\n  status: not_started\n  current_milestone: ""\n  description: ""\nmilestones: {}\ntasks: {}');
    expect(result.recent_work).toEqual([]);
  });

  it('defaults empty next_steps to []', () => {
    const result = parseProgressYaml('project:\n  name: test\n  version: "1.0"\n  started: "2026-01-01"\n  status: not_started\n  current_milestone: ""\n  description: ""\nmilestones: {}\ntasks: {}');
    expect(result.next_steps).toEqual([]);
  });

  it('defaults empty notes to []', () => {
    const result = parseProgressYaml('project:\n  name: test\n  version: "1.0"\n  started: "2026-01-01"\n  status: not_started\n  current_milestone: ""\n  description: ""\nmilestones: {}\ntasks: {}');
    expect(result.notes).toEqual([]);
  });

  it('throws a descriptive error on invalid YAML', () => {
    expect(() => parseProgressYaml('invalid: yaml: [unclosed')).toThrow();
  });

  it('handles null dates on tasks', () => {
    const result = parseProgressYaml(fixtureRaw);
    const task138 = result.tasks['M25'].find((t) => t.id === 'task-138');
    expect(task138).toBeDefined();
    expect(task138!.started).toBeNull();
    expect(task138!.completed_date).toBeNull();
    expect(task138!.actual_hours).toBeNull();
  });

  it('parses project metadata correctly', () => {
    const result = parseProgressYaml(fixtureRaw);
    expect(result.project.name).toBe('Agent Context Protocol');
    expect(result.project.version).toBe('6.4.5');
    expect(result.project.current_milestone).toBe('M25');
  });
});
