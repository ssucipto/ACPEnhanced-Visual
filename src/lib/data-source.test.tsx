import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProgressData } from './data-source';

const mockFetchProgress = vi.fn();
const mockFetchWatchToken = vi.fn();

vi.mock('../../server/routes/api/progress', () => ({
  fetchProgress: (...args: unknown[]) => mockFetchProgress(...args),
}));
vi.mock('../../server/routes/api/watch', () => ({
  fetchWatchToken: (...args: unknown[]) => mockFetchWatchToken(...args),
}));

const sampleData = {
  project: { name: 'test', version: '1.0', started: '2026-01-01', status: 'active' as const, current_milestone: 'M1', description: 'test' },
  milestones: {},
  tasks: {},
  recent_work: [],
  next_steps: [],
  notes: [],
  current_blockers: [],
};

describe('useProgressData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads data on mount', async () => {
    mockFetchProgress.mockResolvedValue({ data: sampleData, error: null });
    mockFetchWatchToken.mockResolvedValue({ mtime: 100, error: null });

    const { result } = renderHook(() => useProgressData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(sampleData);
  });

  it('handles fetch error', async () => {
    mockFetchProgress.mockResolvedValue({ data: null, error: 'File not found' });
    mockFetchWatchToken.mockResolvedValue({ mtime: null, error: null });

    const { result } = renderHook(() => useProgressData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('File not found');
  });

  it('passes custom path to server functions', async () => {
    mockFetchProgress.mockResolvedValue({ data: sampleData, error: null });
    mockFetchWatchToken.mockResolvedValue({ mtime: 100, error: null });

    renderHook(() => useProgressData('/custom/path.yaml'));
    await waitFor(() => {});
    expect(mockFetchProgress).toHaveBeenCalledWith({ data: { path: '/custom/path.yaml' } });
  });

  it('returns loading state initially', () => {
    mockFetchProgress.mockReturnValue(new Promise(() => {})); // never resolves
    mockFetchWatchToken.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useProgressData());
    expect(result.current.loading).toBe(true);
  });
});

