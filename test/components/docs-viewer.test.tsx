import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock IntersectionObserver (not available in jsdom)
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  constructor() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Mock the server functions used by DocsViewer
vi.mock('../../server/routes/api/docs', () => ({
  listDocs: vi.fn().mockResolvedValue({
    files: [
      { name: 'README', path: 'README.md', dir: 'Root' },
      { name: 'audit-1-test', path: 'agent/reports/audit-1-test.md', dir: 'Reports' },
      { name: 'architecture', path: 'agent/wiki/architecture.md', dir: 'Wiki' },
    ],
  }),
  readDoc: vi.fn().mockResolvedValue({
    content: `# Test Document\n\nThis is a **test** markdown document.\n\n## Table\n\n| Col1 | Col2 |\n|------|------|\n| A | B |\n\n\`\`\`mermaid\ngraph TD\n  A-->B\n\`\`\``,
    path: 'README.md',
    error: null,
  }),
}));

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg>mock</svg>' }),
  },
}));

import { DocsViewer } from '../../src/components/DocsViewer';

describe('DocsViewer component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document list sidebar', async () => {
    render(<DocsViewer />);

    // Wait for loading to finish
    expect(await screen.findByText('Root (1)')).toBeInTheDocument();
    expect(screen.getByText('Reports (1)')).toBeInTheDocument();
    expect(screen.getByText('Wiki (1)')).toBeInTheDocument();
  });

  it('shows placeholder text when no document selected', async () => {
    render(<DocsViewer />);

    expect(
      await screen.findByText(/Select a document or drop a \.md file here/),
    ).toBeInTheDocument();
  });

  it('renders markdown content when a document is selected', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    // Click on README
    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Should render markdown as HTML (heading + TOC entry both have the text)
    expect(await screen.findAllByText('Test Document')).toHaveLength(2);
  });

  it('renders tables in markdown content', async () => {
    const user = userEvent.setup();
    render(<DocsViewer />);

    const readmeBtn = await screen.findByText('README');
    await user.click(readmeBtn);

    // Table should be wrapped in .table-wrapper
    expect(await screen.findByText('Col1')).toBeInTheDocument();
    expect(screen.getByText('Col2')).toBeInTheDocument();
  });
});
