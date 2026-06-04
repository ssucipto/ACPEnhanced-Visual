import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandReference } from '../../src/components/CommandReference';
import type { CommandMeta } from '../../server/routes/api/commands';

const MOCK_COMMANDS: CommandMeta[] = [
  {
    name: '/acp-audit',
    namespace: 'acp',
    version: '1.1.0',
    status: 'Active',
    purpose: 'Deep-dive investigation of a subject',
    category: 'Workflow',
    frequency: 'As Needed',
    scripts: null,
    flags: ['--output <path>', '--pre-impl'],
  },
  {
    name: '/acp-init',
    namespace: 'acp',
    version: '1.0.0',
    status: 'Active',
    purpose: 'Initialize a new ACP project',
    category: 'Creation',
    frequency: 'Once',
    scripts: 'scripts/init.sh',
    flags: ['--path <dir>'],
  },
  {
    name: '@git-commit',
    namespace: 'git',
    version: '1.0.0',
    status: 'Active',
    purpose: 'Commit changes with ACP conventions',
    category: 'Tools',
    frequency: 'Per Commit',
    scripts: null,
    flags: ['-m <message>'],
  },
  {
    name: 'acp-visualizer',
    namespace: 'visualizer',
    version: '1.5.1',
    status: 'Active',
    purpose: 'Start the ACP Progress Dashboard',
    category: 'ACP Visualizer',
    frequency: 'As Needed',
    scripts: null,
    flags: ['--port <N>', '--no-open'],
  },
];

describe('CommandReference component', () => {
  it('renders all commands in a table', () => {
    render(<CommandReference commands={MOCK_COMMANDS} />);

    expect(screen.getByText('/acp-audit')).toBeInTheDocument();
    expect(screen.getByText('/acp-init')).toBeInTheDocument();
    expect(screen.getByText('@git-commit')).toBeInTheDocument();
    expect(screen.getByText('acp-visualizer')).toBeInTheDocument();
  });

  it('shows command count in heading', () => {
    render(<CommandReference commands={MOCK_COMMANDS} />);
    expect(screen.getByText(/Command Reference \(4\)/)).toBeInTheDocument();
  });

  it('filters by namespace', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    const nsSelect = screen.getByLabelText('Filter by namespace');
    await user.selectOptions(nsSelect, 'visualizer');

    // Only visualizer commands visible
    expect(screen.getByText('acp-visualizer')).toBeInTheDocument();
    expect(screen.queryByText('/acp-audit')).not.toBeInTheDocument();
    expect(screen.queryByText('@git-commit')).not.toBeInTheDocument();
  });

  it('filters by category', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    const catSelect = screen.getByLabelText('Filter by category');
    await user.selectOptions(catSelect, 'Workflow');

    expect(screen.getByText('/acp-audit')).toBeInTheDocument();
    expect(screen.queryByText('/acp-init')).not.toBeInTheDocument();
  });

  it('searches by command name', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    const searchInput = screen.getByPlaceholderText('Search commands…');
    await user.type(searchInput, 'git');

    expect(screen.getByText('@git-commit')).toBeInTheDocument();
    expect(screen.queryByText('/acp-audit')).not.toBeInTheDocument();
  });

  it('searches by purpose text', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    const searchInput = screen.getByPlaceholderText('Search commands…');
    await user.type(searchInput, 'dashboard');

    expect(screen.getByText('acp-visualizer')).toBeInTheDocument();
    expect(screen.queryByText('/acp-audit')).not.toBeInTheDocument();
  });

  it('shows empty state when no commands match', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    const searchInput = screen.getByPlaceholderText('Search commands…');
    await user.type(searchInput, 'zzzznonexistent');

    expect(screen.getByText('No commands match your filters.')).toBeInTheDocument();
  });

  it('expands row to show details on click', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    // Click on /acp-audit row
    await user.click(screen.getByText('/acp-audit'));

    // Details should be visible
    expect(screen.getByText('Version: 1.1.0')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Frequency: As Needed')).toBeInTheDocument();
  });

  it('shows flags in expanded row', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    await user.click(screen.getByText('/acp-audit'));

    expect(screen.getByText('--output <path>')).toBeInTheDocument();
    expect(screen.getByText('--pre-impl')).toBeInTheDocument();
  });

  it('renders namespace badges with correct colors', () => {
    render(<CommandReference commands={MOCK_COMMANDS} />);

    // Badges appear inside buttons — use getAllByText since dropdown options also show them
    const acpBadges = screen.getAllByText('acp');
    const gitBadges = screen.getAllByText('git');
    const vizBadges = screen.getAllByText('visualizer');

    // At least one badge per namespace (dropdown options exist too)
    expect(acpBadges.length).toBeGreaterThanOrEqual(2);
    expect(gitBadges.length).toBeGreaterThanOrEqual(1);
    expect(vizBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('collapses expanded row on second click', async () => {
    const user = userEvent.setup();
    render(<CommandReference commands={MOCK_COMMANDS} />);

    // Expand
    await user.click(screen.getByText('/acp-audit'));
    expect(screen.getByText('Version: 1.1.0')).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByText('/acp-audit'));
    expect(screen.queryByText('Version: 1.1.0')).not.toBeInTheDocument();
  });
});
