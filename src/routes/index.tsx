import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { NextSteps } from '../components/NextSteps'
import { OverallProgress } from '../components/OverallProgress'
import { ProjectHeader } from '../components/ProjectHeader'
import { AggregateHome } from '../components/AggregateHome'
import { AddProjectDialog } from '../components/AddProjectDialog'
import { useProgressData } from '../lib/data-source'
import { loadProjectConfigs, saveProjectConfigs, type ProjectConfig } from '../lib/projects'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search['tab'] === 'string' ? search['tab'] : 'Home',
    add: typeof search['add'] === 'string' ? search['add'] : '',
    search: typeof search['search'] === 'string' ? search['search'] : '',
  }),
  component: Home,
})

/** Per-project hook — loads data for a single config */
function useProjectData(config: ProjectConfig) {
  return useProgressData({
    source: config.source,
    path: config.path,
    repo: config.repo,
    branch: config.branch,
  });
}

function ProjectTab({ config, visible }: { config: ProjectConfig; visible: boolean }) {
  const { data, error, loading } = useProjectData(config);

  return (
    <div style={{ display: visible ? undefined : 'none' }}>
      {loading && <div className="p-6 text-gray-400 animate-pulse">Loading {config.name}…</div>}
      {error && <div className="p-6 text-red-500 whitespace-pre-wrap">Error: {error}</div>}
      {data && (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <ProjectHeader project={data.project} />
          <OverallProgress milestones={Object.values(data.milestones)} />
          <NextSteps items={data.next_steps} />
        </div>
      )}
    </div>
  );
}

function Home() {
  const { tab, add } = Route.useSearch()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectConfig[]>(() => loadProjectConfigs())
  const [showAddDialog, setShowAddDialog] = useState(add === '1')

  const handleAdd = useCallback((config: ProjectConfig) => {
    const updated = [...projects, config];
    setProjects(updated);
    try { saveProjectConfigs(updated); } catch { /* ignore */ }
    // Switch to new project's tab
    void navigate({ to: '/', search: { tab: config.name } as any });
  }, [projects, navigate]);

  // Aggregate home view — load all project data
  if (tab === 'Home') {
    return (
      <>
        <AggregateHomeWithData projects={projects} onSelectProject={(name) => {
          void navigate({ to: '/', search: { tab: name } as any });
        }} />
        <AddProjectDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAdd}
        />
      </>
    );
  }

  // Render ALL tabs simultaneously (CSS visibility toggle) — keeps polling alive
  return (
    <>
      {projects.map((p) => (
        <ProjectTab key={p.name} config={p} visible={p.name === tab} />
      ))}
      {!projects.find((p) => p.name === tab) && tab !== 'Home' && (
        <div className="p-6 text-gray-500">Project "{tab}" not found.</div>
      )}
      <AddProjectDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAdd}
      />
    </>
  );
}

/** Loads all project data in parallel for the aggregate home view */
function AggregateHomeWithData({ projects, onSelectProject }: {
  projects: ProjectConfig[];
  onSelectProject: (name: string) => void;
}) {
  // Load all projects in parallel
  const snapshots = projects.map((config) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useProjectData(config);
    return { config, data: data ?? null };
  });

  return <AggregateHome projects={snapshots} onSelectProject={onSelectProject} />;
}


