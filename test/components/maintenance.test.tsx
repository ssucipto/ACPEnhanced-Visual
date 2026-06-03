import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the server functions
vi.mock('../../server/routes/api/maintenance', () => ({
  scanServers: vi.fn().mockResolvedValue({
    instances: [
      { port: 3001, pid: '12345', process: 'node' },
      { port: 3002, pid: '67890', process: 'node' },
    ],
  }),
  getSystemInfo: vi.fn().mockResolvedValue({
    nodeVersion: 'v22.10.0',
    os: 'darwin arm64',
    totalMemMB: 8192,
    freeMemMB: 1024,
  }),
  killByPort: vi.fn().mockResolvedValue({ ok: true, pid: '12345' }),
}));

import { MaintenancePage } from '../../src/components/MaintenancePage';

describe('MaintenancePage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Server Manager heading', async () => {
    render(<MaintenancePage />);
    expect(await screen.findByText('Server Manager')).toBeInTheDocument();
  });

  it('displays running instances after scan', async () => {
    render(<MaintenancePage />);

    expect(await screen.findByText('Running Instances (2)')).toBeInTheDocument();
    expect(screen.getByText(':3001')).toBeInTheDocument();
    expect(screen.getByText(':3002')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('67890')).toBeInTheDocument();
  });

  it('displays system info', async () => {
    render(<MaintenancePage />);

    expect(await screen.findByText('System Info')).toBeInTheDocument();
    expect(screen.getByText('v22.10.0')).toBeInTheDocument();
    expect(screen.getByText('8192 MB')).toBeInTheDocument();
    expect(screen.getByText('1024 MB')).toBeInTheDocument();
  });

  it('shows Stop buttons for each instance', async () => {
    render(<MaintenancePage />);

    await screen.findByText('Running Instances (2)');
    const stopButtons = screen.getAllByText('⏹ Stop');
    expect(stopButtons.length).toBe(2);
  });

  it('shows Stopping state after clicking Stop', async () => {
    const user = userEvent.setup();
    render(<MaintenancePage />);

    await screen.findByText('Running Instances (2)');
    const stopButtons = screen.getAllByText('⏹ Stop');
    await user.click(stopButtons[0]);

    // Should show stopping state
    expect(await screen.findByText('⏳ Stopping…')).toBeInTheDocument();
  });
});
