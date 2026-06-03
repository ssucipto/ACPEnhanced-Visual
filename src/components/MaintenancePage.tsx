import { useState, useEffect } from 'react';
import type { ServerInstance, SystemInfo } from '../../server/routes/api/maintenance';
import { scanServers, getSystemInfo, killByPort } from '../../server/routes/api/maintenance';

export function MaintenancePage() {
  const [instances, setInstances] = useState<ServerInstance[]>([]);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stoppingPorts, setStoppingPorts] = useState<Set<number>>(new Set());

  const refresh = async () => {
    setLoading(true);
    const [servers, system] = await Promise.all([scanServers(), getSystemInfo()]);
    setInstances(servers.instances);
    setSysInfo(system);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleShutdown = async (port: number) => {
    setStoppingPorts((prev) => new Set(prev).add(port));
    try {
      await killByPort({ data: { port } });
    } catch {
      // Process may already be gone
    }
    // Wait for OS to release the port, then refresh
    setTimeout(() => {
      setStoppingPorts((prev) => {
        const next = new Set(prev);
        next.delete(port);
        return next;
      });
      refresh();
    }, 800);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Server Manager</h1>
        <button onClick={refresh} className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">
          🔄 Refresh
        </button>
      </div>

      {/* Running Instances */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700">
            Running Instances ({instances.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400 animate-pulse text-sm">Scanning ports…</div>
        ) : instances.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">No running instances detected on ports 3000-3020.</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Port</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">PID</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Process</th>
                <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {instances.map((inst) => (
                <tr key={inst.port} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-blue-600">:{inst.port}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{inst.pid}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">{inst.process}</td>
                  <td className="px-4 py-2">
                    {stoppingPorts.has(inst.port) ? (
                      <span className="text-xs text-gray-400 italic font-mono">⏳ Stopping…</span>
                    ) : (
                      <button
                        onClick={() => handleShutdown(inst.port)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 font-mono"
                      >
                        ⏹ Stop
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* System Info */}
      {sysInfo && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">System Info</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-gray-400">Node.js</span>
              <p className="font-mono text-xs text-gray-700">{sysInfo.nodeVersion}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">OS</span>
              <p className="font-mono text-xs text-gray-700">{sysInfo.os}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Total Memory</span>
              <p className="font-mono text-xs text-gray-700">{sysInfo.totalMemMB} MB</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Free Memory</span>
              <p className="font-mono text-xs text-gray-700">{sysInfo.freeMemMB} MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
