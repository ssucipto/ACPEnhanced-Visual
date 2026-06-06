import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { marked } from 'marked';
import type { DocFile } from '../../server/routes/api/docs';
import { listDocs, readDoc } from '../../server/routes/api/docs';
import { svgToPngDataUri } from '../lib/svg-to-png';

// ── Markdown rendering ────────────────────────────────────────────────────

function wrapTables(html: string): string {
  return html.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');
}

function extractMermaid(html: string): string {
  return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, code: string) => {
    const decoded = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
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
  const [mermaidZoom, setMermaidZoom] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mermaidRetryRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  // Memoize innerHTML object — prevents React from re-applying innerHTML
  // on unrelated re-renders (e.g. setExporting), which destroys mermaid SVGs.
  const innerHtml = useMemo(() => ({ __html: html }), [html]);

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

  // Mermaid rendering — re-query DOM after async import (avoids stale NodeList)
  const renderMermaid = useCallback(async () => {
    const el = contentRef.current;
    if (!el) return;

    // Persist source before any DOM mutation
    for (const block of el.querySelectorAll<HTMLElement>('pre.mermaid')) {
      if (!block.getAttribute('data-mermaid-src')) {
        const src = (block.textContent || '').trim();
        if (src && !src.includes('Rendering diagram')) {
          block.setAttribute('data-mermaid-src', src);
        }
      }
      block.removeAttribute('data-processed');
    }

    const pending = el.querySelectorAll<HTMLElement>('pre.mermaid:not([data-mermaid-done])');
    if (!pending.length) return;

    for (const block of pending) {
      if (block.querySelector('svg')) {
        block.setAttribute('data-mermaid-done', 'true');
        continue;
      }
      block.innerHTML = '<div class="mermaid-loading">🔄 Rendering diagram…</div>';
    }

    try {
      const mermaidMod = await Promise.race([
        import('mermaid'),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      const mermaid = mermaidMod.default;
      mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', securityLevel: 'loose' });

      // Re-query live nodes — the NodeList from before import may be detached
      const blocks = el.querySelectorAll<HTMLElement>('pre.mermaid:not([data-mermaid-done])');
      let id = 0;

      for (const block of blocks) {
        const code = (block.getAttribute('data-mermaid-src') || block.textContent || '').trim();
        if (!code || code.includes('Rendering diagram')) continue;

        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}-${++id}`, code);
          block.innerHTML = svg;
          block.setAttribute('data-mermaid-done', 'true');
          block.removeAttribute('data-processed');
          const svgEl = block.querySelector('svg');
          if (svgEl && !svgEl.hasAttribute('data-zoom-bound')) {
            svgEl.setAttribute('data-zoom-bound', 'true');
            svgEl.style.cursor = 'pointer';
            svgEl.setAttribute('title', 'Click to zoom');
            svgEl.addEventListener('click', () => setMermaidZoom(svgEl.outerHTML));
          }
        } catch (err) {
          block.setAttribute('data-mermaid-done', 'true');
          block.removeAttribute('data-processed');
          const msg = err instanceof Error ? err.message : String(err);
          block.innerHTML = `<div class="mermaid-error"><span>⚠️ Diagram rendering failed</span><pre><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre><p class="text-xs text-red-500 mt-1">${msg.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p></div>`;
        }
      }

      const containers = el.querySelectorAll('.mermaid-container');
      const svgCount = el.querySelectorAll('.mermaid-container svg').length;
      if (containers.length > svgCount && mermaidRetryRef.current < 5) {
        mermaidRetryRef.current += 1;
        console.warn(`[DocsViewer] mermaid: ${containers.length - svgCount} diagram(s) missing SVG — retry ${mermaidRetryRef.current}/5`);
        for (const block of el.querySelectorAll<HTMLElement>('pre.mermaid:not(:has(svg))')) {
          block.removeAttribute('data-mermaid-done');
          block.removeAttribute('data-processed');
        }
        setTimeout(renderMermaid, 500);
      } else if (containers.length <= svgCount) {
        mermaidRetryRef.current = 0;
      }
    } catch (err) {
      console.warn('[DocsViewer] Mermaid import failed:', err instanceof Error ? err.message : err);
      for (const block of el.querySelectorAll<HTMLElement>('pre.mermaid:not([data-mermaid-done])')) {
        const code = block.getAttribute('data-mermaid-src') || '';
        block.setAttribute('data-mermaid-done', 'true');
        block.removeAttribute('data-processed');
        block.innerHTML = `<div class="mermaid-error"><span>⚠️ Mermaid library failed to load</span><pre><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre></div>`;
      }
    }
  }, [dark]);

  useEffect(() => {
    if (!html) return;
    mermaidRetryRef.current = 0;
    let t: ReturnType<typeof setTimeout>;
    const raf = requestAnimationFrame(() => {
      t = setTimeout(renderMermaid, 0);
    });
    return () => { cancelAnimationFrame(raf); if (t!) clearTimeout(t); };
  }, [html, renderMermaid]);

  // Theme change → clear mermaid state and re-render
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !html) return;
    const blocks = el.querySelectorAll<HTMLElement>('pre.mermaid[data-mermaid-done]');
    if (!blocks.length) return;
    mermaidRetryRef.current = 0;
    for (const block of blocks) {
      block.removeAttribute('data-mermaid-done');
      block.removeAttribute('data-processed');
      block.removeAttribute('data-zoom-bound');
      const src = block.getAttribute('data-mermaid-src');
      if (src) block.textContent = src;
    }
    const raf = requestAnimationFrame(() => { setTimeout(renderMermaid, 0); });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

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

  // ── Export helpers ──────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const exportWord = useCallback(async () => {
    const el = contentRef.current; if (!el) return;
    setExporting(true);
    try {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.heading-anchor, .code-copy-btn, .code-block-header, .mermaid-loading, .mermaid-error span:first-child').forEach(e => e.remove());

      // Convert mermaid SVGs to PNG images (Word doesn't support inline SVG or SVG data URIs)
      // IMPORTANT: Query live SVGs for getComputedStyle (clone SVGs are detached)
      const liveContainers = el.querySelectorAll<HTMLElement>('.mermaid-container');
      const containers = clone.querySelectorAll<HTMLElement>('.mermaid-container');
      if (containers.length) {
        const conversions = Array.from(containers).map(async (container, i) => {
          (container as HTMLElement).style.background = 'transparent';
          (container as HTMLElement).style.border = '1px solid #d1d5db';

          const svg = container.querySelector('svg');
          if (!svg) {
            const pre = container.querySelector('pre.mermaid');
            if (pre) {
              const code = pre.getAttribute('data-mermaid-src') || pre.textContent || '';
              const codeBlock = document.createElement('pre');
              codeBlock.style.cssText = 'background:#f3f4f6;padding:8px;border:1px solid #d1d5db;font-size:11px;overflow-x:auto;white-space:pre-wrap;color:#374151;';
              codeBlock.textContent = code;
              pre.replaceWith(codeBlock);
            }
            return;
          }

          // Use LIVE SVG for getComputedStyle (clone SVG is detached → no styles)
          const liveSvg = liveContainers[i]?.querySelector('svg') as SVGSVGElement | null;
          const pngDataUri = await Promise.race([
            svgToPngDataUri(liveSvg || (svg as unknown as SVGSVGElement)),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
          ]);


          const pre = container.querySelector('pre.mermaid');
          if (pngDataUri) {
            const img = document.createElement('img');
            img.src = pngDataUri;
            img.style.cssText = 'max-width:650px;width:100%;height:auto;display:block;margin:1em auto;';
            if (pre) pre.replaceWith(img);
            else container.appendChild(img);
          } else {
            // Rasterization failed — show source code
            if (pre) {
              const code = pre.getAttribute('data-mermaid-src') || pre.textContent || '';
              const codeBlock = document.createElement('pre');
              codeBlock.style.cssText = 'background:#f3f4f6;padding:8px;border:1px solid #d1d5db;font-size:11px;overflow-x:auto;white-space:pre-wrap;color:#374151;';
              codeBlock.textContent = code;
              pre.replaceWith(codeBlock);
            }
          }
        });
        await Promise.allSettled(conversions);
      }
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:system-ui,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;color:#1f2937}
        h1{font-size:1.5em;margin-top:1em}h2{font-size:1.25em;border-bottom:1px solid #e5e7eb;padding-bottom:.25em}
        pre{background:#f3f4f6;padding:1em;border-radius:4px;overflow-x:auto}code{font-family:monospace;font-size:.875em}
        table{border-collapse:collapse;width:100%}th,td{border:1px solid #d1d5db;padding:4px 8px;text-align:left}
        blockquote{border-left:3px solid #3b82f6;padding-left:1em;color:#4b5563;margin:1em 0}
        img{max-width:100%}svg{max-width:100%;height:auto;display:block;margin:1em 0}
        .mermaid-container{text-align:center;padding:1em;margin:1em 0;border:1px solid #d1d5db;border-radius:4px}
        @page{margin:1in}
      </style></head><body>${clone.innerHTML}</body></html>`;
      const blob = new Blob([html], { type: 'application/msword' });
      const name = selectedPath?.split('/').pop()?.replace(/\.md$/, '') || 'document';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${name}.doc`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`✅ Exported as ${name}.doc`);
    } catch { showToast('⚠️ Export failed'); }
    finally { setExporting(false); }
  }, [selectedPath, showToast]);

  const exportPdf = useCallback(async () => {
    const el = contentRef.current; if (!el) return;
    showToast('📄 Preparing PDF…');
    try {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.heading-anchor, .code-copy-btn, .code-block-header, .mermaid-loading, .mermaid-error span:first-child').forEach(e => e.remove());

      // Convert mermaid SVGs to PNG for consistent cross-browser print output
      // Use live SVGs for getComputedStyle (clone SVGs are detached)
      const liveSvgs = el.querySelectorAll<SVGSVGElement>('.mermaid-container svg');
      const svgs = clone.querySelectorAll<SVGSVGElement>('.mermaid-container svg');
      if (svgs.length) {
        const conversions = Array.from(svgs).map(async (svg, i) => {
          const liveSvg = liveSvgs[i] || svg;
          const pngDataUri = await Promise.race([
            svgToPngDataUri(liveSvg),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
          ]);
          if (pngDataUri) {
            const img = document.createElement('img');
            img.src = pngDataUri;
            img.style.cssText = 'max-width:650px;width:100%;height:auto;display:block;margin:1em auto;';
            svg.replaceWith(img);
          }
          // If rasterization fails, inline SVG stays (graceful degradation)
        });
        await Promise.allSettled(conversions);
      }

      const name = selectedPath?.split('/').pop()?.replace(/\.md$/, '') || 'document';
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) { showToast('⚠️ Popup blocked — allow popups for PDF export'); return; }
      printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name}</title><style>
        body{font-family:system-ui,sans-serif;line-height:1.6;max-width:800px;margin:40px auto;color:#1f2937;padding:20px}
        h1{font-size:1.5em;margin-top:1em;page-break-before:always}h1:first-child{page-break-before:avoid}
        h2{font-size:1.25em;border-bottom:1px solid #e5e7eb;padding-bottom:.25em;page-break-after:avoid}
        h3{page-break-after:avoid}
        pre{background:#f3f4f6;padding:1em;border:1px solid #d1d5db;border-radius:4px;overflow-x:auto;font-size:.8em}
        code{font-family:monospace;font-size:.875em}
        table{border-collapse:collapse;width:100%;page-break-inside:avoid}th,td{border:1px solid #d1d5db;padding:4px 8px;text-align:left}
        blockquote{border-left:3px solid #3b82f6;padding-left:1em;color:#4b5563;margin:1em 0}
        img{max-width:100%}svg{max-width:100%;height:auto;display:block;margin:1em 0;page-break-inside:avoid}
        .mermaid-container{text-align:center;padding:1em;margin:1em 0;border:1px solid #d1d5db;border-radius:4px;page-break-inside:avoid}
        .mermaid-error{background:#fef2f2;border:1px solid #fecaca;padding:1em;border-radius:4px}
        .table-wrapper{overflow-x:auto}
        @page{margin:1in}
      </style></head><body>${clone.innerHTML}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      // print() is modal in most browsers but Safari may not block —
      // defer close to ensure the dialog gets focus first
      setTimeout(() => printWindow.close(), 500);
    } catch { showToast('⚠️ PDF export failed'); }
  }, [selectedPath, showToast]);

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
        <div className="fixed inset-0 z-50 bg-blue-500/15 flex items-center justify-center pointer-events-none backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl px-10 py-8 shadow-2xl text-center border-2 border-blue-400 border-dashed">
            <div className="text-5xl mb-3">📄</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Drop .md file to view</div>
            <div className="text-sm text-gray-400 mt-1">Release to render markdown</div>
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
            <div className={`px-3 py-1.5 text-xs font-semibold uppercase ${dark ? 'text-gray-500 bg-gray-800' : 'text-gray-400 bg-gray-100'}`}>
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
            <div className="flex items-center justify-center h-full">
              <div className={`text-center max-w-sm p-8 border-2 border-dashed rounded-xl transition-colors ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                  : dark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="text-4xl mb-3">📄</div>
                <p className={`text-sm font-medium mb-1 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Drop a <code className="px-1 rounded bg-gray-100 dark:bg-gray-700 text-xs">.md</code> file here
                </p>
                <p className={`text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                  or select a document from the sidebar →
                </p>
              </div>
            </div>
          ) : !html ? (
            <div className="animate-pulse text-gray-400">Rendering…</div>
          ) : (
            <div
              className={`prose-doc max-w-4xl ${dark ? 'prose-invert' : ''}`}
              dangerouslySetInnerHTML={innerHtml}
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
            <button onClick={exportWord} title="Export to Word" disabled={exporting}
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs hover:shadow-lg transition-shadow disabled:opacity-50">
              {exporting ? '⏳' : '📥'}
            </button>
            <button onClick={exportPdf} title="Export to PDF"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs hover:shadow-lg transition-shadow">
              📄
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
          <button onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white text-xl hover:bg-white/30 transition-colors">✕</button>
          <img src={lightboxSrc} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Mermaid zoom lightbox */}
      {mermaidZoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
          onClick={() => setMermaidZoom(null)}>
          <button onClick={() => setMermaidZoom(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white text-xl hover:bg-white/30 transition-colors">✕</button>
          <div className="max-w-[95vw] max-h-[95vh] overflow-auto bg-white rounded-lg shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: mermaidZoom }} />
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
