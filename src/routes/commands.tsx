import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CommandReference } from '../components/CommandReference';
import { fetchCommands } from '../../server/routes/api/commands';
import type { CommandMeta } from '../../server/routes/api/commands';

export const Route = createFileRoute('/commands')({ component: CommandsPage });

function CommandsPage() {
  const [commands, setCommands] = useState<CommandMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommands()
      .then((r) => setCommands(r.commands))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4 text-gray-500">Loading commands…</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return <CommandReference commands={commands} />;
}
