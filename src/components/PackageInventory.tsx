import { useState, useEffect } from 'react';
import type { PackageEntry } from '../../server/routes/api/memory-files';
import { fetchPackages } from '../../server/routes/api/memory-files';
import { fetchPackageJson, type NpmDependency } from '../../server/routes/api/package-json';

export function PackageInventory() {
  const [acpPkgs, setAcpPkgs] = useState<PackageEntry[]>([]);
  const [npmDeps, setNpmDeps] = useState<{ deps: NpmDependency[]; devDeps: NpmDependency[] }>({ deps: [], devDeps: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'npm' | 'acp'>('npm');

  useEffect(() => {
    Promise.all([
      fetchPackages(),
      fetchPackageJson(),
    ]).then(([acp, pkg]) => {
      setAcpPkgs(acp.entries);
      setNpmDeps({ deps: pkg.deps, devDeps: pkg.devDeps });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading packages…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Packages</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        {(['npm', 'acp'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-md ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'npm' ? '📦 NPM' : '🧩 ACP'} {t === 'npm' ? `(${npmDeps.deps.length + npmDeps.devDeps.length})` : `(${acpPkgs.length})`}
          </button>
        ))}
      </div>

      {tab === 'npm' ? (
        <div className="space-y-4">
          {npmDeps.deps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dependencies ({npmDeps.deps.length})</h2>
              <DepTable deps={npmDeps.deps} />
            </div>
          )}
          {npmDeps.devDeps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Dev Dependencies ({npmDeps.devDeps.length})</h2>
              <DepTable deps={npmDeps.devDeps} />
            </div>
          )}
          {npmDeps.deps.length === 0 && npmDeps.devDeps.length === 0 && (
            <div className="text-gray-400 text-sm">No npm dependencies found.</div>
          )}
        </div>
      ) : (
        acpPkgs.length === 0 ? (
          <div className="text-gray-400 text-sm">No ACP packages installed. This project may not use ACP Enhanced.</div>
        ) : (
          <table className="min-w-full text-left text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Package</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Version</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Source</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {acpPkgs.map((p) => (
                <tr key={p.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-800">{p.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.version}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-400">{p.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

function DepTable({ deps }: { deps: NpmDependency[] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50"><tr>
          <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Package</th>
          <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Version</th>
        </tr></thead>
        <tbody className="divide-y divide-gray-100">
          {deps.map((d) => (
            <tr key={d.name} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs text-gray-800">{d.name}</td>
              <td className="px-4 py-2 font-mono text-xs text-gray-500">{d.version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
