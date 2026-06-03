import { ZodError } from 'zod';
import type { YAMLException } from 'js-yaml';

/**
 * Format parse/validation errors into user-friendly messages.
 *
 * Handles:
 * - js-yaml YAMLException → line-aware message with hint
 * - ZodError → bullet list of validation issues
 * - generic Error → raw message
 */
export function formatParseError(err: unknown): string {
  // YAML parse errors from js-yaml
  if (isYamlException(err)) {
    return formatYamlError(err);
  }
  // Zod schema validation errors
  if (err instanceof ZodError) {
    return err.issues
      .map((i) => `• ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
  }
  // Generic JS errors (file not found, permission denied, etc.)
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}

/** Type guard for js-yaml YAMLException without importing it directly */
function isYamlException(err: unknown): err is YAMLException {
  return (
    !!err &&
    typeof err === 'object' &&
    (err as Record<string, unknown>).name === 'YAMLException' &&
    typeof (err as Record<string, unknown>).reason === 'string' &&
    !!(err as Record<string, unknown>).mark
  );
}

/** Build a clean, actionable YAML error message */
function formatYamlError(err: YAMLException): string {
  const line = (err.mark?.line ?? 0) + 1; // js-yaml uses 0-indexed lines
  const col = (err.mark?.column ?? 0) + 1;
  const reason = err.reason ?? 'parse error';

  // Extract the problematic line for context
  let problemLine = '';
  if (err.mark?.buffer) {
    const lines = err.mark.buffer.split('\n');
    problemLine = lines[err.mark.line]?.trim() ?? '';
  }

  // Try to diagnose common causes
  let hint = '';
  if (reason.includes('bad indentation') || reason.includes('mapping values')) {
    hint = `\n💡 The value at this position may contain an unquoted colon (:) character.
   Wrap the value in quotes: notes: "CO-124 resolved: CI pipeline..."`;
  } else if (reason.includes('duplicated mapping key')) {
    hint = '\n💡 This key appears more than once. Remove the duplicate entry.';
  } else if (reason.includes('unknown')) {
    hint = '\n💡 Check for unexpected characters or missing quotes around special values.';
  }

  return `YAML parse error at line ${line}, column ${col}: ${reason}\n\n${err.message.split('\n').slice(1).join('\n')}${hint}`;
}
