import { describe, it, expect } from 'vitest';
import { parseCommandContent } from '../../server/routes/api/commands';

describe('command parser regression', () => {
  it('parseCommandContent exported and callable', () => {
    expect(typeof parseCommandContent).toBe('function');
    // Empty content returns null
    expect(parseCommandContent('', 'test.md')).toBeNull();
  });
});
