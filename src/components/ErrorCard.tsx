interface ErrorCardProps {
  title?: string;
  error: string;
  /** Show raw js-yaml snippet inline */
  onDismiss?: () => void;
}

/** Clean the "Error: " prefix that sometimes gets prepended */
function cleanMessage(error: string): string {
  return error.startsWith('Error: ') ? error.slice(7) : error;
}

export function ErrorCard({ title, error, onDismiss }: ErrorCardProps) {
  const message = cleanMessage(error);
  const isYamlError = message.includes('YAML parse error');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-amber-600 text-xl mt-0.5 shrink-0">⚠️</span>
          <div className="flex-1 space-y-2">
            <h2 className="text-sm font-semibold text-amber-800">
              {title ?? (isYamlError ? 'YAML Parse Error' : 'Failed to Load Data')}
            </h2>

            {/* Error message */}
            <pre className="text-xs text-amber-900 font-mono whitespace-pre-wrap bg-amber-100/50 rounded p-3 border border-amber-200 max-h-96 overflow-auto">
              {message}
            </pre>

            {/* Actionable advice for YAML errors */}
            {isYamlError && (
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-medium">How to fix:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Check the line shown above in your <code className="bg-amber-100 px-1 rounded text-amber-900">agent/progress.yaml</code></li>
                  <li>The most common cause is an <strong>unquoted colon</strong> (<code className="bg-amber-100 px-1 rounded text-amber-900">:</code>) inside a value</li>
                  <li>Wrap values containing colons in quotes: <code className="bg-amber-100 px-1 rounded text-amber-900">notes: &quot;text with: colon&quot;</code></li>
                  <li>After fixing, the dashboard auto-refreshes within 2 seconds</li>
                </ul>
              </div>
            )}

            {/* Dismiss button */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
