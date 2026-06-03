import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('renders all filter options', () => {
    render(<FilterBar value="all" onChange={() => {}} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Completed')).toBeDefined();
    expect(screen.getByText('Not Started')).toBeDefined();
  });

  it('highlights active filter', () => {
    render(<FilterBar value="completed" onChange={() => {}} />);
    const btn = screen.getByText('Completed');
    expect(btn.className).toContain('bg-blue-600');
  });

  it('calls onChange on click', async () => {
    const onChange = vi.fn();
    render(<FilterBar value="all" onChange={onChange} />);
    await userEvent.click(screen.getByText('Active'));
    expect(onChange).toHaveBeenCalledWith('active');
  });
});

import { render as renderTable } from '@testing-library/react';
import { MilestoneTable } from './MilestoneTable';

describe('MilestoneTable', () => {
  const milestones = [
    { id: 'M1', name: 'Foundation', priority: 1, status: 'completed' as const, progress: 100, started: null, completed: '2026-01-01', estimated_weeks: '1', tasks_completed: 2, tasks_total: 2, file: '', notes: '' },
    { id: 'M2', name: 'Features', priority: 2, status: 'in_progress' as const, progress: 50, started: '2026-01-02', completed: null, estimated_weeks: '2', tasks_completed: 1, tasks_total: 2, file: '', notes: '' },
  ];

  it('renders milestone names', () => {
    renderTable(<MilestoneTable milestones={milestones} />);
    expect(screen.getByText('Foundation')).toBeDefined();
    expect(screen.getByText('Features')).toBeDefined();
  });

  it('renders task counts', () => {
    renderTable(<MilestoneTable milestones={milestones} />);
    expect(screen.getByText('2 / 2')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
  });
});

import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search milestones and tasks…')).toBeDefined();
  });
});
