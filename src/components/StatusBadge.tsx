const COLORS: Record<string, string> = {
  active:      'bg-emerald-100 text-emerald-800',
  completed:   'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  not_started: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = COLORS[status] ?? COLORS['not_started'];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
