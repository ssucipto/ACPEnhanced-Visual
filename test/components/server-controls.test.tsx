import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { mockShutdown, mockGetServerInfo } = vi.hoisted(() => ({
  mockShutdown: vi.fn().mockResolvedValue({ ok: true }),
  mockGetServerInfo: vi.fn().mockResolvedValue({
    port: '3000',
    dataSource: 'agent/progress.yaml',
    sourceType: 'local',
  }),
}));

// Mock the server function
vi.mock('../../server/routes/api/shutdown', () => ({
  shutdown: mockShutdown,
  getServerInfo: mockGetServerInfo,
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  vi.clearAllMocks();
  // Mock location.port
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, port: '3002' },
    writable: true,
    configurable: true,
  });
});

import { ServerInfoDisplay, StopServerButton } from '../../src/components/ServerControls';

describe('ServerControls components', () => {
  describe('ServerInfoDisplay', () => {
    it('renders port and data source after mount', async () => {
      render(<ServerInfoDisplay />);

      // Should show server info
      expect(await screen.findByText(/:3002 · 📁 agent\/progress\.yaml/)).toBeInTheDocument();
    });

    it('shows globe icon for github source', async () => {
      mockGetServerInfo.mockResolvedValueOnce({
        port: '3000',
        dataSource: 'ssucipto/acp-enhanced',
        sourceType: 'github',
      });

      render(<ServerInfoDisplay />);

      expect(await screen.findByText(/🌐/)).toBeInTheDocument();
    });

    it('shows shortened long data source paths', async () => {
      mockGetServerInfo.mockResolvedValueOnce({
        port: '3000',
        dataSource: '/very/long/path/that/exceeds/fifty/characters/agent/progress.yaml',
        sourceType: 'local',
      });

      render(<ServerInfoDisplay />);

      const el = await screen.findByText(/📁/);
      expect(el.textContent).toContain('…');
    });
  });

  describe('StopServerButton', () => {
    it('renders Stop button initially', () => {
      render(<StopServerButton />);
      expect(screen.getByText('⏹ Stop')).toBeInTheDocument();
    });

    it('calls shutdown on click', async () => {
      const user = userEvent.setup();
      render(<StopServerButton />);

      await user.click(screen.getByText('⏹ Stop'));

      expect(mockShutdown).toHaveBeenCalled();
    });

    it('shows stopped message after click', async () => {
      const user = userEvent.setup();
      render(<StopServerButton />);

      await user.click(screen.getByText('⏹ Stop'));

      expect(await screen.findByText(/Server stopped/)).toBeInTheDocument();
    });
  });
});
