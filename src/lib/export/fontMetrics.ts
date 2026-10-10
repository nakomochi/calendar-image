import type { SceneText } from './scene';

export interface FontMetrics {
  ascent: number;
  descent: number;
}

const cache = new Map<string, FontMetrics>();
let ctx: CanvasRenderingContext2D | null = null;

function cssFont(t: Pick<SceneText, 'fontStack' | 'fontSize' | 'fontWeight' | 'italic'>): string {
  return `${t.italic ? 'italic ' : ''}${t.fontWeight} ${t.fontSize}px ${t.fontStack}`;
}

// Font-box ascent/descent of the font the browser actually uses for this stack.
export function fontMetrics(t: Pick<SceneText, 'fontStack' | 'fontSize' | 'fontWeight' | 'italic'>): FontMetrics {
  const font = cssFont(t);
  const hit = cache.get(font);
  if (hit) return hit;

  let metrics: FontMetrics = { ascent: 0.88 * t.fontSize, descent: 0.12 * t.fontSize };
  ctx ??= document.createElement('canvas').getContext('2d');
  if (ctx) {
    ctx.font = font;
    const m = ctx.measureText('Mg');
    if (m.fontBoundingBoxAscent > 0) {
      metrics = { ascent: m.fontBoundingBoxAscent, descent: m.fontBoundingBoxDescent };
    }
  }
  cache.set(font, metrics);
  return metrics;
}

// Baseline of a line whose glyph boxes span [top, top + height].
export function baselineOf(top: number, height: number, m: FontMetrics): number {
  return top + (height - (m.ascent + m.descent)) / 2 + m.ascent;
}
