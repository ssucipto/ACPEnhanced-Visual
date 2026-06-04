import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsRow } from '../../src/components/StatsRow';

describe('StatsRow component', () => {
  it('renders stat cards with values', () => {
    render(<StatsRow cards={[
      { icon: '📅', label: 'Sessions', value: 42 },
      { icon: '✅', label: 'Tasks', value: 300 },
    ]} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText(/Sessions/)).toBeInTheDocument();
    expect(screen.getByText(/Tasks/)).toBeInTheDocument();
  });

  it('renders correct grid columns for 3 cards', () => {
    const { container } = render(<StatsRow cards={[
      { icon: 'A', label: 'One', value: 1 },
      { icon: 'B', label: 'Two', value: 2 },
      { icon: 'C', label: 'Three', value: 3 },
    ]} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });

  it('renders 4-column grid for 4+ cards', () => {
    const { container } = render(<StatsRow cards={[
      { icon: 'A', label: 'One', value: 1 },
      { icon: 'B', label: 'Two', value: 2 },
      { icon: 'C', label: 'Three', value: 3 },
      { icon: 'D', label: 'Four', value: 4 },
    ]} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('md:grid-cols-4');
  });

  it('returns null for empty cards array', () => {
    const { container } = render(<StatsRow cards={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders string values as-is', () => {
    render(<StatsRow cards={[{ icon: '🕐', label: 'Last', value: 'Jun 2026' }]} />);
    expect(screen.getByText('Jun 2026')).toBeInTheDocument();
  });
});
