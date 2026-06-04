import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useState, useMemo, useEffect, useSyncExternalStore } from 'react'
import { SearchBar } from '../components/SearchBar'
import { RateLimitBanner } from '../components/RateLimitBanner'
import { TabBar } from '../components/TabBar'
import { StopServerButton, ServerInfoDisplay } from '../components/ServerControls'
import { loadProjectConfigs, saveProjectConfigs } from '../../server/routes/api/projects-config'
import type { ProjectConfig } from '../lib/projects'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ACP Progress Visualizer' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

/** Subscribes to a never-changing store — `getSnapshot` runs only on client */
const subscribe = () => () => {}
function ClientOnly({ children }: { children: React.ReactNode }) {
  const isServer = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  )
  return isServer ? null : <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Suppress the known React 19 + TanStack Start SSR streaming quirk.
            Without this, ~60 poll cycles × 1 error each = Node SIGABRT at 2 min. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var e=console.error;console.error=function(){for(var i=0;i<arguments.length;i++){if(typeof arguments[i]==='string'&&arguments[i].indexOf('Expected static flag was missing')!==-1)return}e.apply(console,arguments)}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <ClientOnly>
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
          />
        </ClientOnly>
        <Scripts />
      </body>
    </html>
  )
}

const NAV_SECTIONS = [
  {
    label: 'Dashboard', icon: '📊', defaultOpen: true,
    links: [
      { to: '/' as const, label: 'Home' },
      { to: '/milestones' as const, label: 'Milestones' },
      { to: '/search' as const, label: 'Search' },
    ],
  },
  {
    label: 'Project Intelligence', icon: '📋', defaultOpen: false,
    links: [
      { to: '/sessions' as const, label: 'Sessions' },
      { to: '/adrs' as const, label: 'ADRs' },
      { to: '/lessons' as const, label: 'Lessons' },
      { to: '/patterns' as const, label: 'Patterns' },
    ],
  },
  {
    label: 'Tools', icon: '🛠', defaultOpen: false,
    links: [
      { to: '/docs' as const, label: 'Docs' },
      { to: '/maintenance' as const, label: 'Maintenance' },
      { to: '/route-costs' as const, label: 'Route Costs' },
    ],
  },
  {
    label: 'Reference', icon: '📖', defaultOpen: false,
    links: [
      { to: '/commands' as const, label: 'Commands' },
    ],
  },
  {
    label: 'Management', icon: '📦', defaultOpen: false,
    links: [
      { to: '/packages' as const, label: 'Packages' },
      { to: '/audits' as const, label: 'Audits' },
    ],
  },
];

function CollapsibleSection({ section, collapsed }: { section: typeof NAV_SECTIONS[0]; collapsed: boolean }) {
  const storageKey = `nav-${section.label}`;
  const [open, setOpen] = useState(section.defaultOpen);

  // Hydrate from localStorage AFTER mount — avoids SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) setOpen(stored === 'true');
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* ignore */ }
  };

  // In collapsed mode: icon-only with tooltip, no expand/collapse
  if (collapsed) {
    return (
      <div className="mb-1" title={section.label}>
        <div className="flex justify-center py-2 text-gray-400 hover:text-white transition-colors cursor-default">
          <span className="text-sm">{section.icon}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-200 transition-colors"
      >
        <span className="text-gray-400 text-xs">{open ? '▼' : '▶'}</span>
        <span>{section.icon}</span>
        <span>{section.label}</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? `${section.links.length * 36}px` : '0px', opacity: open ? 1 : 0 }}
      >
        {section.links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === '/' }}
            activeProps={{ className: 'bg-gray-700 text-white' }}
            inactiveProps={{ className: 'text-gray-400 hover:bg-gray-800 hover:text-white' }}
            className="block pl-10 pr-4 py-1.5 text-sm transition-colors rounded-sm mx-1"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RootLayout() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { tab?: string }

  // Sidebar collapse state — persisted in localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true'; } catch { return false; }
  });

  // Load project configs via server function
  const [projects, setProjects] = useState<ProjectConfig[]>([])
  useEffect(() => {
    loadProjectConfigs().then((r) => setProjects(r.projects)).catch(() => {});
  }, []);
  const activeTab = search.tab || 'Home'
  const allTabs = useMemo(() => {
    const homeFirst = { name: 'Home', source: 'local' as const };
    return [homeFirst, ...projects];
  }, [projects]);

  const handleRemove = (name: string) => {
    const updated = projects.filter((p) => p.name !== name);
    setProjects(updated);
    try { saveProjectConfigs({ data: { projects: updated } }); } catch { /* ignore */ }
    // If removing the active tab, switch to Home
    if (activeTab === name) {
      void navigate({ to: '/', search: {} as any });
    }
  };

  // Auto-shutdown on tab close (best-effort via sendBeacon)
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon('/api/shutdown');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`shrink-0 bg-gray-900 text-gray-100 flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-14' : 'w-48'}`}>
        <div className="px-3 py-4 border-b border-gray-700 flex items-center gap-2">
          <button
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              try { localStorage.setItem('sidebar-collapsed', String(next)); } catch {}
            }}
            className="text-gray-400 hover:text-white transition-colors shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold tracking-tight truncate">ACP Visualizer</span>
          )}
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <CollapsibleSection key={section.label} section={section} collapsed={sidebarCollapsed} />
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="shrink-0 border-b border-gray-200 px-4 py-2 bg-white flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={(v) => { setQuery(v) }}
              placeholder="Search milestones and tasks…"
            />
          </div>
          <ServerInfoDisplay />
          <StopServerButton />
        </header>

        {/* Tab bar for multi-project navigation */}
        <TabBar
          projects={allTabs}
          activeTab={activeTab}
          onSelect={(name) => {
            void navigate({ to: '/', search: { tab: name === 'Home' ? undefined : name } as any });
          }}
          onAdd={() => {
            void navigate({ to: '/', search: { tab: activeTab, add: '1' } as any });
          }}
          onRemove={handleRemove}
        />

        {/* Rate limit warning (only visible when approaching GitHub limits) */}
        <RateLimitBanner />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

