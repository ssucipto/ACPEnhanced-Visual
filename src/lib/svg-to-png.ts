/**
 * SVG to PNG rasterization utility.
 *
 * Converts an SVG DOM element to a `data:image/png;base64` data URI
 * using the HTML Canvas API. Produces PNG images that work universally
 * in Word (.doc), PDF print output, and all browsers — unlike
 * `data:image/svg+xml;base64` which fails in Microsoft Word.
 *
 * Key challenge: mermaid SVGs use CSS classes from theme stylesheets.
 * We inline computed styles (fill, stroke, font) before rasterization
 * so the standalone Image retains all visual properties.
 *
 * @param svgElement - The live SVG element from the DOM
 * @param scale - Output scale factor (default 2x for HiDPI)
 * @returns PNG data URI or null on failure
 */
export async function svgToPngDataUri(
  svgElement: SVGSVGElement,
  scale = 2,
): Promise<string | null> {
  try {
    // 1. Clone and inline computed styles
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    const originalElements = svgElement.querySelectorAll('*');
    const clonedElements = clone.querySelectorAll('*');

    for (let i = 0; i < originalElements.length; i++) {
      const orig = originalElements[i] as SVGElement;
      const cln = clonedElements[i] as SVGElement;
      if (!orig || !cln) continue;

      const computed = window.getComputedStyle(orig);
      const styles: string[] = [];

      // Inline key presentation attributes — mermaid uses these for text positioning
      for (const prop of ['fill', 'stroke', 'stroke-width', 'font-family',
        'font-size', 'font-weight', 'opacity', 'text-anchor', 'dominant-baseline', 'color']) {
        const val = computed.getPropertyValue(prop);
        if (val && val !== 'normal' && val !== 'auto' && val !== 'rgba(0, 0, 0, 0)') {
          styles.push(`${prop}:${val}`);
        }
      }

      if (styles.length) {
        const existing = cln.getAttribute('style') || '';
        const newStyles = styles.join(';');
        cln.setAttribute('style', existing ? `${existing};${newStyles}` : newStyles);
      }
    }

    // 2. Determine dimensions
    const vb = clone.viewBox?.baseVal;
    let w = vb?.width || svgElement.getBoundingClientRect().width || 800;
    let h = vb?.height || svgElement.getBoundingClientRect().height || 400;
    if (w <= 0) w = 800;
    if (h <= 0) h = 400;

    // 3. Serialize to string and create blob URL
    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // 4. Load as Image and draw to Canvas
    const png = await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); resolve(null); return; }

        ctx.scale(scale, scale);
        // White background — SVGs may be transparent (dark theme)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });

    return png;
  } catch {
    return null;
  }
}
