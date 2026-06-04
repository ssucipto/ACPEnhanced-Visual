import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { marked } from 'marked';
import type { DocFile } from '../../server/routes/api/docs';
import { listDocs, readDoc } from '../../server/routes/api/docs';

// ── Syntax highlighting helpers ───────────────────────────────────────────
let highlighter: ((code: string, lang: string) => string) | null = null;
async function getHighlighter() {
  if (highlighter) return highlighter;
  try {
    const { common } = await import('lowlight');
    const { toHtml } = await import('hast-util-to-html');
    highlighter = (code: string, lang: string) => {
      try {
        const tree = common.highlight(lang, code);
        return tree.children.length > 0 ? toHtml(tree) : code;
      } catch {
        return code;
      }
    };
  } catch {
    highlighter = (code: string) => code;
  }
  return highlighter;
}

// ── Markdown rendering ────────────────────────────────────────────────────

function wrapTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

function extractMermaid(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code: string) => {
    const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return `<div class="mermaid-container"><pre class="mermaid">${decoded}</pre></div>`;
  });
}

/** Add anchor links to headings and collect TOC entries */
function addAnchors(html: string): { html: string; toc: { id: string; text: string; level: number }[] } {
  const toc: { id: string; text: string; level: number }[] = [];
  const result = html.replace(/<h([1-3])([^>]*)>(.*?)<\/h\1>/g, (_, level, attrs, text) => {
    const id = text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, text: text.replace(/<[^>]+>/g, ''), level: parseInt(level) });
    return `<h${level} id="${id}"${attrs}><a href="#${id}" class="heading-anchor" title="Link to section">#</a>${text}</h${level}>`;
  });
  return { html: result, toc };
}

/** Add copy buttons and language badges to code blocks */
function enhanceCodeBlocks(html: string): string {
  return html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-lang">${lang}</span>
        <button class="code-copy-btn" data-code="${escaped}" onclick="navigator.clipboard.writeText(this.dataset.code).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',2000)})">Copy</button>
      </div>
      <pre><code class="language-${lang}">${code}</code></pre>
    </div>`;
  });
}

// ── Component ─────────────────────────────────────────────────────────────

export function DocsViewer() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showToc, setShowToc] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listDocs().then((r) => { setFiles(r.files); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedPath) return;
    readDoc({ data: { path: selectedPath } }).then((r) => setContent(r.content));
  }, [selectedPath]);

  // Image click → lightbox (event delegation)
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const img = (e.target as HTMLElement).closest('img');
    if (img instanceof HTMLImageElement && img.src) {
      setLightboxSrc(img.src);
    }
  }, []);

  // Esc key to close lightbox / exit fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxSrc) { setLightboxSrc(null); return; }
        if (fullscreen) setFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxSrc, fullscreen]);

  const { html, toc } = useMemo(() => {
    if (!content) return { html: '', toc: [] };
    const raw = marked(content, { breaks: true, gfm: true }) as string;
    const withMermaid = extractMermaid(raw);
    const withCode = enhanceCodeBlocks(withMermaid);
    const withTables = wrapTables(withCode);
    return addAnchors(withTables);
  }, [content]);

  // Track active heading on scroll
  const [activeId, setActiveId] = useState('');
  useEffect(() => {
    if (!html) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { setActiveId(e.target.id); break; }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('h1[id],h2[id],h3[id]').forEach((h) => observer.observe(h));
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [html]);

  // Mermaid rendering
  const renderMermaid = useCallback(async () => {
    const el = contentRef.current; if (!el) return;
    const blocks = el.querySelectorAll<HTMLElement>('pre.mermaid');
    if (!blocks.length) return;
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', securityLevel: 'sandbox' });
      let id = 0;
      for (const block of blocks) {
        if (block.getAttribute('data-processed')) continue;
        block.setAttribute('data-processed', 'true');
        const { svg } = await mermaid.render(`mermaid-${Date.now()}-${++id}`, block.textContent || '');
        block.innerHTML = svg;
      }
    } catch {}
  }, [dark]);

  useEffect(() => {
    if (!html) return;
    const t = setTimeout(renderMermaid, 50);
    return () => clearTimeout(t);
  }, [html, renderMermaid]);

  // Drag-and-drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file?.name.endsWith('.md')) return;
    const reader = new FileReader();
    reader.onload = () => setContent(reader.result as string);
    reader.readAsText(file);
  }, []);

  const fontSizeClass = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[fontSize];

  const grouped = useMemo(() => {
    const map = new Map<string, DocFile[]>();
    for (const f of files) { const g = map.get(f.dir) || []; g.push(f); map.set(f.dir, g); }
    return map;
  }, [files]);

  if (loading) return <div className="p-6 text-gray-400 animate-pulse">Loading documents…</div>;

  return (
    <div className={`flex h-full ${dark ? 'bg-gray-900 text-gray-200' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-xl px-8 py-6 shadow-2xl text-lg font-semibold">
            📄 Drop .md file to view
          </div>
        </div>
      )}

      {/* File browser sidebar */}
      {!fullscreen && (
      <aside className={`w-56 shrink-0 border-r overflow-y-auto ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className={`px-3 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</h2>
        </div>
        {[...grouped.entries()].map(([dir, dirFiles]) => (
          <div key={dir}>
            <div className={`px-3 py-1.5 text-xs font-semibold uppercase ${dark ? 'text-gray-500 bg-gray-750' : 'text-gray-400 bg-gray-100'}`}>
              {dir} ({dirFiles.length})
            </div>
            {dirFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedPath(f.path)}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors truncate ${
                  selectedPath === f.path
                    ? dark ? 'bg-blue-900 text-blue-200 font-medium' : 'bg-blue-50 text-blue-700 font-medium'
                    : dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        ))}
      </aside>
      )}

      {/* Content area */}
      <main className="flex-1 flex overflow-hidden">
        <div ref={contentRef} onClick={handleContentClick} className={`flex-1 overflow-y-auto p-6 ${fontSizeClass}`}>
          {!selectedPath ? (
            <div className={`font-mono ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a document or drop a .md file here.
            </div>
          ) : !html ? (
            <div className="animate-pulse text-gray-400">Rendering…</div>
          ) : (
            <div
              className={`prose-doc max-w-4xl ${dark ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>

        {/* TOC sidebar */}
        {!fullscreen && toc.length > 0 && (
          <aside className={`w-48 shrink-0 border-l overflow-y-auto p-3 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">On this page</span>
              <button onClick={() => setShowToc(!showToc)} className="text-gray-400 text-xs hover:text-gray-600">
                {showToc ? '−' : '+'}
              </button>
            </div>
            {showToc && (
              <nav className="space-y-0.5">
                {toc.map(({ id, text, level }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block text-xs truncate transition-colors hover:text-blue-500 ${
                      level === 1 ? 'pl-0 font-medium' : level === 2 ? 'pl-3' : 'pl-6'
                    } ${activeId === id ? 'text-blue-600 font-semibold' : dark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {text}
                  </a>
                ))}
              </nav>
            )}
          </aside>
        )}
      </main>

      {/* Floating controls */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-40">
        {selectedPath && (
          <>
            <button onClick={() => setDark(!dark)} title="Toggle theme"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:shadow-lg transition-shadow">
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setFontSize(f => f === 'sm' ? 'md' : f === 'md' ? 'lg' : 'sm')} title="Font size"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold hover:shadow-lg transition-shadow">
              {fontSize === 'sm' ? 'S' : fontSize === 'md' ? 'M' : 'L'}
            </button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Back to top"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:shadow-lg transition-shadow">
              ↑
            </button>
            <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-sm hover:shadow-lg transition-shadow">
              {fullscreen ? '↙' : '⛶'}
            </button>
          </>
        )}
      </div>

      {/* Image lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white text-xl hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
