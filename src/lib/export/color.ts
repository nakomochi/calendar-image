export interface SceneColor {
  hex: string; // '#rrggbb'
  alpha: number; // 0..1, already multiplied by inherited opacity
}

type Rgba = readonly [r: number, g: number, b: number, a: number];

const RGB_RE = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/;
const GRADIENT_COLOR_RE =
  /(rgba?\([^)]*\)|hsla?\([^)]*\)|okl(?:ch|ab)\([^)]*\)|(?:lch|lab|color)\([^)]*\)|#[0-9a-fA-F]{3,8}\b)/;

const cache = new Map<string, Rgba | null>();
let probe: CanvasRenderingContext2D | null = null;

function parseRgb(css: string): Rgba | null {
  const m = RGB_RE.exec(css.trim());
  if (!m) return null;
  let a = m[4] === undefined ? 1 : Number(m[4]);
  if (m[5] === '%') a /= 100;
  return [Number(m[1]), Number(m[2]), Number(m[3]), a];
}

// Modern computed colors (oklch(), color(srgb ...), ...) are resolved by letting
// the browser paint them onto a 1×1 canvas and reading the pixel back.
function rasterize(css: string): Rgba | null {
  if (!CSS.supports('color', css)) return null;
  if (!probe) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    probe = canvas.getContext('2d', { willReadFrequently: true });
    if (!probe) return null;
  }
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

function resolve(css: string): Rgba | null {
  let rgba = cache.get(css);
  if (rgba === undefined) {
    rgba = parseRgb(css) ?? rasterize(css);
    cache.set(css, rgba);
  }
  return rgba;
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

// Returns null for fully transparent or unparsable colors.
export function toSceneColor(css: string, opacity = 1): SceneColor | null {
  const rgba = resolve(css);
  if (!rgba) return null;
  const alpha = Math.round(rgba[3] * opacity * 1000) / 1000;
  if (alpha <= 0) return null;
  return { hex: `#${toHex(rgba[0])}${toHex(rgba[1])}${toHex(rgba[2])}`, alpha: Math.min(1, alpha) };
}

// Gradients are approximated by their first color stop.
export function firstGradientColor(backgroundImage: string, opacity = 1): SceneColor | null {
  if (!backgroundImage.includes('gradient(')) return null;
  const m = GRADIENT_COLOR_RE.exec(backgroundImage);
  return m ? toSceneColor(m[1], opacity) : null;
}
