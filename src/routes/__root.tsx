import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { useState } from 'react'
import { SearchBar } from '../components/SearchBar'

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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}

const NAV_LINKS = [
  { to: '/' as const, label: '🏠 Dashboard' },
  { to: '/milestones' as const, label: '📊 Milestones' },
  { to: '/search' as const, label: '🔍 Search' },
]

function RootLayout() {
  const [query, setQuery] = useState('')

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-48 shrink-0 bg-gray-900 text-gray-100 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <span className="text-sm font-semibold tracking-tight">ACP Visualizer</span>
        </div>
        <nav className="flex-1 py-3">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === '/' }}
              activeProps={{ className: 'bg-gray-700 text-white' }}
              inactiveProps={{ className: 'text-gray-400 hover:bg-gray-800 hover:text-white' }}
              className="block px-4 py-2 text-sm transition-colors rounded-sm mx-1"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="shrink-0 border-b border-gray-200 px-4 py-2 bg-white">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v)
              // Navigation to /search is handled by the search page reading the URL
              // Here we just keep local state for the bar value
            }}
            placeholder="Search milestones and tasks…"
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

