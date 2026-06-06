/**
 * SVG to PNG rasterization utility.
 *
 * Converts an SVG DOM element to a `data:image/png;base64` data URI
 * using the HTML Canvas API. Tries two approaches:
 * 1. Blob URL (clean, modern) → draw to canvas → PNG
 * 2. Data URI fallback (if blob fails)
 *
 * @param svgElement - The LIVE SVG element (must be in DOM for getComputedStyle)
 * @param scale - Output scale factor (default 2x for HiDPI)
 * @returns PNG data URI or null on failure
 */
export async function svgToPngDataUri(
  svgElement: SVGSVGElement,
  scale = 2,
): Promise<string | null> {
  try {
    // Quick sanity check — SVG must have child content
    if (!svgElement.querySelector('*') && !svgElement.textContent?.trim()) {
      console.warn('[svgToPng] SVG has no child elements — skipping');
      return null;
    }

    // 1. Clone and inline computed styles on ALL elements including root
    const clone = svgElement.cloneNode(true) as SVGSVGElement;

    // Collect all elements: root + descendants
    const allOriginal: SVGElement[] = [svgElement as SVGElement];
    svgElement.querySelectorAll('*').forEach((el) => allOriginal.push(el as SVGElement));

    const allCloned: SVGElement[] = [clone as SVGElement];
    clone.querySelectorAll('*').forEach((el) => allCloned.push(el as SVGElement));

    // CSS properties to inline
    const PROPS = [
      'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
      'stroke-dasharray', 'font-family', 'font-size', 'font-weight',
      'opacity', 'text-anchor', 'dominant-baseline', 'color',
    ];

    const SKIP_VALUES = new Set([
      'normal', 'auto', 'none', 'rgba(0, 0, 0, 0)', '0',
    ]);

    for (let i = 0; i < allOriginal.length; i++) {
      const orig = allOriginal[i];
      const cln = allCloned[i];
      if (!orig || !cln) continue;

      const computed = window.getComputedStyle(orig);
      const styles: string[] = [];
      for (const prop of PROPS) {
        const val = computed.getPropertyValue(prop);
        if (val && !SKIP_VALUES.has(val) && !val.startsWith('rgba(0, 0, 0, 0')) {
          styles.push(`${prop}:${val}`);
        }
      }
      if (styles.length) {
        const existing = cln.getAttribute('style') || '';
        cln.setAttribute('style', existing ? `${existing};${styles.join(';')}` : styles.join(';'));
      }
    }

    // 2. Dimensions
    const vb = clone.viewBox?.baseVal;
    let w = vb?.width || svgElement.getBoundingClientRect().width || 800;
    let h = vb?.height || svgElement.getBoundingClientRect().height || 400;
    if (w <= 0) w = 800;
    if (h <= 0) h = 400;

    // 3. Serialize SVG to string
    const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      new XMLSerializer().serializeToString(clone);

    // 4. Try loading as Image via Blob URL and draw to Canvas
    const png = await tryRenderViaBlob(svgString, w, h, scale);
    if (png) return png;

    // 5. Fallback: try data URI approach (some environments block blob URLs)
    console.warn('[svgToPng] blob approach failed — trying data URI fallback');
    const png2 = await tryRenderViaDataUri(svgString, w, h, scale);
    if (png2) return png2;

    console.warn('[svgToPng] both approaches failed');
    return null;
  } catch (err) {
    console.warn('[svgToPng] exception:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function tryRenderViaBlob(
  svgString: string, w: number, h: number, scale: number,
): Promise<string | null> {
  try {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const png = await renderImageToCanvas(url, w, h, scale);
    URL.revokeObjectURL(url);
    return png;
  } catch { return null; }
}

async function tryRenderViaDataUri(
  svgString: string, w: number, h: number, scale: number,
): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(svgString);
    const url = `data:image/svg+xml,${encoded}`;
    return await renderImageToCanvas(url, w, h, scale);
  } catch { return null; }
}

function renderImageToCanvas(
  src: string, w: number, h: number, scale: number,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // crossOrigin prevents canvas tainting from SVGs with foreignObject/use elements
    img.crossOrigin = 'anonymous';
    const done = (result: string | null) => {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      resolve(result);
    };
    img.onload = () => {
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        console.warn('[svgToPng] image zero dimensions');
        done(null); return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) { done(null); return; }
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      // toDataURL throws SecurityError on tainted canvases — catch gracefully
      try {
        done(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('[svgToPng] tainted canvas — cannot export:', e instanceof Error ? e.message : e);
        done(null);
      }
    };
    img.onerror = (e) => {
      console.warn('[svgToPng] load error:', typeof e === 'string' ? e : 'event');
      done(null);
    };
    img.src = src;
  });
}
