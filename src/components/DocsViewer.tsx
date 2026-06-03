import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import type { DocFile } from '../../server/routes/api/docs';
import { listDocs, readDoc } from '../../server/routes/api/docs';

export function DocsViewer() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDocs().then((r) => {
      setFiles(r.files);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedPath) return;
    readDoc({ data: { path: selectedPath } }).then((r) => {
      setContent(r.content);
    });
  }, [selectedPath]);

  const html = useMemo(() => {
    if (!content) return '';
    return marked(content, { breaks: true }) as string;
  }, [content]);

  // Group files by directory
  const grouped = useMemo(() => {
    const map = new Map<string, DocFile[]>();
    for (const f of files) {
      const group = map.get(f.dir) || [];
      group.push(f);
      map.set(f.dir, group);
    }
    return map;
  }, [files]);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading documents…</div>;

  return (
    <div className="flex h-full">
      {/* Sidebar file browser */}
      <aside className="w-56 shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="px-3 py-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</h2>
        </div>
        {[...grouped.entries()].map(([dir, dirFiles]) => (
          <div key={dir}>
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase bg-gray-100">
              {dir} ({dirFiles.length})
            </div>
            {dirFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedPath(f.path)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors truncate ${
                  selectedPath === f.path
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selectedPath ? (
          <div className="text-gray-400 text-sm font-mono">
            Select a document from the sidebar to view it.
          </div>
        ) : (
          <article
            className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </main>
    </div>
  );
}
