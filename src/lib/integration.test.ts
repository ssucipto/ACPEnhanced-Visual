import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseProgressYaml } from './yaml-loader';

const fixturePath = join(import.meta.dirname, '../../test/fixtures/sample-progress.yaml');

describe('integration: YAML → parse → typed data', () => {
  it('parses sample fixture with milestones and tasks', () => {
    const raw = readFileSync(fixturePath, 'utf-8');
    const data = parseProgressYaml(raw);

    expect(data.project.name).toBe('Agent Context Protocol');
    expect(data.project.status).toBe('in_progress');
    expect(Object.keys(data.milestones)).toHaveLength(2);
    expect(data.milestones['M25'].name).toBe('ACP Progress Visualizer (P0 MVP)');
  });

  it('injects milestone IDs and task milestoneIds', () => {
    const raw = readFileSync(fixturePath, 'utf-8');
    const data = parseProgressYaml(raw);

    expect(data.milestones['M25'].id).toBe('M25');
    expect(data.tasks['M25']).toBeDefined();
    expect(data.tasks['M25'].length).toBeGreaterThan(0);
    for (const task of data.tasks['M25']) {
      expect(task.milestoneId).toBe('M25');
    }
  });

  it('has typed project metadata with active status support', () => {
    const raw = readFileSync(fixturePath, 'utf-8');
    const data = parseProgressYaml(raw);

    expect(data.project.name).toBeDefined();
    expect(data.project.version).toBeDefined();
    expect(data.project.status).toBeDefined();
    expect(data.project.current_milestone).toBeDefined();
  });
});
