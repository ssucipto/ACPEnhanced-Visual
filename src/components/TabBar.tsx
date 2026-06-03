import type { ProjectConfig } from '../lib/projects';

interface Props {
  projects: ProjectConfig[];
  activeTab: string;
  onSelect: (name: string) => void;
  onAdd: () => void;
  onRemove?: (name: string) => void;
}

export function TabBar({ projects, activeTab, onSelect, onAdd, onRemove }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-4 bg-white shrink-0">
      {projects.map((p) => (
        <div key={p.name} className="relative group">
          <button
            onClick={() => onSelect(p.name)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === p.name
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.name}
          </button>
          {onRemove && p.name !== 'Home' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Remove "${p.name}" from the dashboard? Data will still exist in the repo.`)) {
                  onRemove(p.name);
                }
              }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gray-300 text-white text-xs
                         flex items-center justify-center opacity-0 group-hover:opacity-100
                         hover:bg-red-500 transition-all"
              title={`Remove ${p.name}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAdd}
        className="px-2 py-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
        title="Add project"
      >
        +
      </button>
    </div>
  );
}
