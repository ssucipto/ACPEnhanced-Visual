import { useState, useEffect } from 'react';
import type { PackageEntry } from '../../server/routes/api/memory-files';
import { fetchPackages } from '../../server/routes/api/memory-files';

export function PackageInventory() {
  const [packages, setPackages] = useState<PackageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages().then((r) => { setPackages(r.entries); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading packages…</div>;
  if (!packages.length) return <div className="p-6 text-gray-400">No packages installed.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Package Inventory ({packages.length})</h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Package</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Source</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Version</th>
              <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {packages.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-800">{p.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.source}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-500">{p.version}</td>
                <td className="px-4 py-2 font-mono text-xs text-gray-400">{p.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
