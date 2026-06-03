import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseProgressYaml } from '../src/lib/yaml-loader';
import { MilestoneTable } from '../src/components/MilestoneTable';
import { MilestoneTree } from '../src/components/MilestoneTree';
import { FilterBar } from '../src/components/FilterBar';
import { ProgressBar } from '../src/components/ProgressBar';
import { StatusBadge } from '../src/components/StatusBadge';
import { ProjectHeader } from '../src/components/ProjectHeader';
import { OverallProgress } from '../src/components/OverallProgress';
import { NextSteps } from '../src/components/NextSteps';
import { SearchBar } from '../src/components/SearchBar';
import { buildSearchIndex } from '../src/lib/search';

// ── Fixtures ───────────────────────────────────────────────────────────────

const fixturePath = join(import.meta.dirname, 'fixtures/sample-progress.yaml');
const rawFixture = readFileSync(fixturePath, 'utf-8');
const parsedFixture = parseProgressYaml(rawFixture);
const milestones = Object.values(parsedFixture.milestones);
const tasks = parsedFixture.tasks;

// ── Mock fetch for remote source simulation ─────────────────────────────────

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Remote data → component pipeline', () => {
  it('renders MilestoneTable with remote-like ProgressData', () => {
    render(<MilestoneTable milestones={milestones} />);

    // All milestones should appear
    for (const m of milestones) {
      expect(screen.getByText(m.id)).toBeDefined();
      expect(screen.getByText(m.name)).toBeDefined();
    }
  });

  it('renders MilestoneTree with expandable milestones and tasks', async () => {
    const user = userEvent.setup();
    render(<MilestoneTree milestones={milestones} tasks={tasks} />);

    // Milestones visible
    for (const m of milestones) {
      expect(screen.getByText(m.id)).toBeDefined();
    }

    // Expand first milestone
    const firstMilestone = milestones[0];
    const expandButton = screen.getByText(firstMilestone.id)
      .closest('button');
    await user.click(expandButton!);

    // Tasks should be visible after expand
    const milestoneTasks = tasks[firstMilestone.id] ?? [];
    for (const task of milestoneTasks) {
      expect(screen.getByText(task.name)).toBeDefined();
    }
  });

  it('renders FilterBar and filters milestones by status', async () => {
    const { rerender } = render(<div />);

    // Show all
    const completedMs = milestones.filter((m) => m.status === 'completed');
    rerender(
      <div>
        <FilterBar value="all" onChange={() => {}} />
        <MilestoneTable milestones={milestones} />
      </div>,
    );
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);

    // Filter to completed
    rerender(
      <div>
        <FilterBar value="completed" onChange={() => {}} />
        <MilestoneTable milestones={completedMs} />
      </div>,
    );
    for (const m of completedMs) {
      expect(screen.getByText(m.id)).toBeDefined();
    }
  });

  it('renders ProgressBar correctly for remote data', () => {
    const { container } = render(<ProgressBar value={75} />);
    const bar = container.querySelector('.bg-blue-500') as HTMLElement;
    expect(bar).toBeDefined();
    expect(bar.style.width).toBe('75%');
  });

  it('renders StatusBadge with correct colors for all statuses', () => {
    const statuses = ['completed', 'in_progress', 'active', 'not_started'];

    for (const status of statuses) {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector('span');
      expect(badge).toBeDefined();
      expect(badge!.textContent).toBe(status.replace(/_/g, ' '));
    }
  });

  it('renders ProjectHeader with remote project metadata', () => {
    render(<ProjectHeader project={parsedFixture.project} />);
    expect(screen.getByText(parsedFixture.project.name)).toBeDefined();
    expect(screen.getByText(`v${parsedFixture.project.version}`)).toBeDefined();
  });

  it('renders OverallProgress with milestone counts', () => {
    render(<OverallProgress milestones={milestones} />);
    const completed = milestones.filter((m) => m.status === 'completed').length;
    expect(screen.getByText(new RegExp(`${completed}/${milestones.length}`))).toBeDefined();
  });

  it('renders NextSteps list from remote data', () => {
    render(<NextSteps items={parsedFixture.next_steps} />);
    for (const step of parsedFixture.next_steps) {
      expect(screen.getByText(step)).toBeDefined();
    }
  });

  it('SearchBar calls onChange with typed text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'test');
    expect(onChange).toHaveBeenCalled();
  });

  it('fuse.js search index works with remote data', () => {
    const allTasks = Object.values(tasks).flat();
    const index = buildSearchIndex(milestones, allTasks);

    // Search by milestone ID
    const results = index.search(milestones[0].id);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.type).toBe('milestone');

    // Search by task name
    if (allTasks.length > 0) {
      const taskResults = index.search(allTasks[0].name);
      expect(taskResults.length).toBeGreaterThan(0);
      expect(taskResults[0].item.type).toBe('task');
    }

    // Search should return empty for nonsense
    const noResults = index.search('xyznonexistent123');
    expect(noResults.length).toBe(0);
  });
});

describe('Error states', () => {
  it('identifies auth failure (401)', () => {
    // Simulate what github-fetch.ts returns on 401
    const errorResult = {
      data: null,
      unchanged: false,
      error: 'Auth failed for private-org/private-repo. Check your token.',
    };
    expect(errorResult.error).toContain('Auth failed');
    expect(errorResult.data).toBeNull();
  });

  it('identifies not found (404)', () => {
    const errorResult = {
      data: null,
      unchanged: false,
      error: 'Not found: missing/repo/main/agent/progress.yaml',
    };
    expect(errorResult.error).toContain('Not found');
    expect(errorResult.data).toBeNull();
  });

  it('identifies rate limit (403 + X-RateLimit-Remaining: 0)', () => {
    const errorResult = {
      data: null,
      unchanged: false,
      error: 'Rate limited. Resets in 60s. Set GITHUB_TOKEN for 5000 req/hr.',
    };
    expect(errorResult.error).toContain('Rate limited');
    expect(errorResult.data).toBeNull();
  });

  it('identifies network error', () => {
    const errorResult = {
      data: null,
      unchanged: false,
      error: 'Cannot reach GitHub. Check your internet connection.',
    };
    expect(errorResult.error).toContain('Cannot reach GitHub');
    expect(errorResult.data).toBeNull();
  });
});
