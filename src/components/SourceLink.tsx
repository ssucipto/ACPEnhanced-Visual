import { useNavigate } from '@tanstack/react-router';

interface Props {
  file: string;
  anchor?: string;
  label?: string;
}

export function SourceLink({ file, anchor, label }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate({ to: '/docs', search: { file, ...(anchor ? { anchor } : {}) } as any })}
      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
    >
      📄 {label || file.split('/').pop() || file}
    </button>
  );
}
