import { useState, useEffect, useMemo } from 'react';
import type { PackageEntry } from '../../server/routes/api/memory-files';
import { fetchPackages } from '../../server/routes/api/memory-files';
import { fetchPackageJson, type NpmDependency } from '../../server/routes/api/package-json';
import { StatsRow } from './StatsRow';
import Fuse from 'fuse.js';

export function PackageInventory() {
  const [acpPkgs, setAcpPkgs] = useState<PackageEntry[]>([]);
  const [npmDeps, setNpmDeps] = useState<{ deps: NpmDependency[]; devDeps: NpmDependency[] }>({ deps: [], devDeps: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'npm' | 'acp'>('npm');
  const [query, setQuery] = useState('');

  useEffect(() => {
    Promise.all([fetchPackages(), fetchPackageJson()]).then(([acp, pkg]) => {
      setAcpPkgs(acp.entries);
      setNpmDeps({ deps: pkg.deps, devDeps: pkg.devDeps });
      setLoading(false);
    });
  }, []);

  const allNpm = useMemo(() => [...npmDeps.deps, ...npmDeps.devDeps], [npmDeps]);
  const fuse = useMemo(() => new Fuse([...allNpm.map(d => ({ ...d, _kind: 'npm' })), ...acpPkgs.map(p => ({ ...p, _kind: 'acp', name: p.name }))], { keys: ['name'], threshold: 0.3 }), [allNpm, acpPkgs]);

  const filteredNpm = query.length >= 2
    ? fuse.search(query).filter(r => r.item._kind === 'npm').map(r => r.item as any)
    : allNpm;
  const filteredAcp = query.length >= 2
    ? fuse.search(query).filter(r => r.item._kind === 'acp').map(r => r.item as any)
    : acpPkgs;

  if (loading) return <div className="p-6 max-w-3xl mx-auto space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>;

  const totalNpm = npmDeps.deps.length + npmDeps.devDeps.length;
  const outdated = allNpm.filter(d => d.wanted && d.wanted !== d.version).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StatsRow cards={[
        { icon: '📦', label: 'NPM Packages', value: totalNpm },
        { icon: '⚠️', label: 'Outdated', value: outdated },
        { icon: '🧩', label: 'ACP Packages', value: acpPkgs.length },
        { icon: '📋', label: 'Direct Deps', value: npmDeps.deps.length },
      ]} />
      <h1 className="text-lg font-semibold mb-4">Packages</h1>
      <div className="flex gap-1 mb-2">
        {(['npm','acp'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md ${tab===t?'bg-blue-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t==='npm'?'📦 NPM':'🧩 ACP'} ({t==='npm'?totalNpm:acpPkgs.length})
          </button>
        ))}
      </div>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder="Search packages…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      {tab === 'npm' ? (
        <div className="space-y-4">
          {npmDeps.deps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dependencies ({filteredNpm.filter((d: any) => d.type === 'prod').length})</h2>
              <DepTable deps={filteredNpm.filter((d: any) => d.type === 'prod')} />
            </div>
          )}
          {npmDeps.devDeps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dev Dependencies ({filteredNpm.filter((d: any) => d.type === 'dev').length})</h2>
              <DepTable deps={filteredNpm.filter((d: any) => d.type === 'dev')} />
            </div>
          )}
          {totalNpm === 0 && <div className="text-gray-400 text-sm">No npm dependencies found.</div>}
        </div>
      ) : (
        acpPkgs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">🧩 No ACP packages</p>
            <p className="text-sm">Run <code className="bg-gray-100 px-1 rounded">/acp-package-install</code> to add packages.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full text-left text-sm"><thead className="bg-gray-50"><tr>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Package</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Version</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Source</th>
            </tr></thead><tbody className="divide-y divide-gray-100">
              {filteredAcp.map((p: any) => (
                <tr key={p.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-800">{p.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.version}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">{p.source}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )
      )}
    </div>
  );
}

function DepTable({ deps }: { deps: NpmDependency[] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full text-left text-sm"><thead className="bg-gray-50"><tr>
        <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Package</th>
        <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Version</th>
        <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Wanted</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {deps.map((d) => (
          <tr key={d.name} className={`hover:bg-gray-50 ${d.wanted && d.wanted !== d.version ? 'bg-amber-50' : ''}`}>
            <td className="px-4 py-2 font-mono text-xs text-gray-800">{d.name}</td>
            <td className="px-4 py-2 font-mono text-xs text-gray-500">{d.version}</td>
            <td className="px-4 py-2 font-mono text-xs text-gray-400">{d.wanted || '—'}</td>
          </tr>
        ))}
      </tbody></table>
    </div>
  );
}
