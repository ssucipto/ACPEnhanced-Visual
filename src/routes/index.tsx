import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { NextSteps } from '../components/NextSteps'
import { OverallProgress } from '../components/OverallProgress'
import { ProjectHeader } from '../components/ProjectHeader'
import { AggregateHome } from '../components/AggregateHome'
import { AddProjectDialog } from '../components/AddProjectDialog'
import { ErrorCard } from '../components/ErrorCard'
import { useProgressData } from '../lib/data-source'
import { loadProjectConfigs, saveProjectConfigs } from '../../server/routes/api/projects-config'
import type { ProjectConfig } from '../lib/projects'
import type { ProgressData } from '../lib/types'

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
      {error && <ErrorCard error={error} />}
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
  const [projects, setProjects] = useState<ProjectConfig[]>([])
  useEffect(() => {
    loadProjectConfigs().then((r) => setProjects(r.projects)).catch(() => {});
  }, []);
  const [showAddDialog, setShowAddDialog] = useState(add === '1')

  const handleAdd = useCallback((config: ProjectConfig) => {
    const updated = [...projects, config];
    setProjects(updated);
    try { saveProjectConfigs({ data: { projects: updated } }); } catch { /* ignore */ }
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
  // Use a fixed number of hook calls — React requires hooks to not be conditional/looped.
  // For up to 10 projects, call useProjectData for each slot. Unused slots return null.
  const empty = { data: null as ProgressData | null, error: null as string | null };
  const data0 = projects[0] ? useProjectData(projects[0]) : empty;
  const data1 = projects[1] ? useProjectData(projects[1]) : empty;
  const data2 = projects[2] ? useProjectData(projects[2]) : empty;
  const data3 = projects[3] ? useProjectData(projects[3]) : empty;
  const data4 = projects[4] ? useProjectData(projects[4]) : empty;
  const data5 = projects[5] ? useProjectData(projects[5]) : empty;
  const data6 = projects[6] ? useProjectData(projects[6]) : empty;
  const data7 = projects[7] ? useProjectData(projects[7]) : empty;
  const data8 = projects[8] ? useProjectData(projects[8]) : empty;
  const data9 = projects[9] ? useProjectData(projects[9]) : empty;

  const allData = [data0, data1, data2, data3, data4, data5, data6, data7, data8, data9];
  const snapshots = projects.map((config, i) => ({
    config,
    data: allData[i]?.data ?? null,
    error: allData[i]?.error ?? null,
  }));

  return <AggregateHome projects={snapshots} onSelectProject={onSelectProject} />;
}


