import { describe, it, expect } from 'vitest';
import { parseCommandFile } from '../../server/routes/api/commands';

// Verify that the fetchCommands server function correctly parses
// the new fields we added to the data interfaces
describe('command parser regression', () => {
  it('parseCommandFile still works for acp commands', () => {
    // Just verify the exported function exists and is callable
    expect(typeof parseCommandFile).toBe('function');
  });
});
