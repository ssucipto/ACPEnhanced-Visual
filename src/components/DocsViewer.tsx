import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { marked } from 'marked';
import type { DocFile } from '../../server/routes/api/docs';
import { listDocs, readDoc } from '../../server/routes/api/docs';

/** Wrap raw <table> elements in a scrollable container for responsive overflow */
function wrapTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

/** Convert ```mermaid fences into <pre class="mermaid"> blocks that Mermaid.js renders */
function extractMermaid(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code: string) => {
    const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return `<div class="mermaid-container"><pre class="mermaid">${decoded}</pre></div>`;
  });
}

export function DocsViewer() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

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
    const raw = marked(content, { breaks: true }) as string;
    return wrapTables(extractMermaid(raw));
  }, [content]);

  // Render mermaid diagrams after HTML is injected into DOM
  const renderMermaid = useCallback(async () => {
    const el = contentRef.current;
    if (!el) return;
    const blocks = el.querySelectorAll<HTMLElement>('pre.mermaid');
    if (blocks.length === 0) return;
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'sandbox' });
      let id = 0;
      for (const block of blocks) {
        if (block.getAttribute('data-processed')) continue;
        block.setAttribute('data-processed', 'true');
        const graphId = `mermaid-${Date.now()}-${++id}`;
        const { svg } = await mermaid.render(graphId, block.textContent || '');
        block.innerHTML = svg;
      }
    } catch { /* mermaid rendering failed — show raw code */ }
  }, []);

  useEffect(() => {
    if (!html) return;
    // Small delay for DOM to update, then render mermaid
    const timer = setTimeout(renderMermaid, 50);
    return () => clearTimeout(timer);
  }, [html, renderMermaid]);

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
            ref={contentRef}
            className="prose-doc max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </main>
    </div>
  );
}
