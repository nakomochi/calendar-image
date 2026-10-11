// Converts the rendered calendar DOM into a flat, renderer-neutral list of
// boxes and text lines (in paint order) that vector exporters can translate.
//
// Supported: background colors, per-side solid/dashed/dotted borders, per-corner
// radii, opacity, overflow clipping (incl. rounded clip corners) and text as
// laid out by the browser (incl. letter spacing). Approximated: gradients (first color stop only).
// Ignored: box-shadow, background images, transforms below the root, inline SVG.
import { firstGradientColor, toSceneColor, type SceneColor } from './color';

export type { SceneColor } from './color';

export interface SceneRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SceneBorder {
  width: number;
  color: SceneColor;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface SceneRadii {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

export interface SceneBorders {
  top: SceneBorder | null;
  right: SceneBorder | null;
  bottom: SceneBorder | null;
  left: SceneBorder | null;
}

export interface SceneBox {
  kind: 'box';
  rect: SceneRect;
  fill: SceneColor | null;
  borders: SceneBorders;
  radii: SceneRadii; // px, clamped to half of min(w, h)
}

export interface SceneTextLine {
  text: string;
  rect: SceneRect;
}

export interface SceneText {
  kind: 'text';
  rect: SceneRect;
  lines: SceneTextLine[];
  fontFamily: string; // primary concrete family (quotes stripped), for single-font consumers
  fontStack: string; // full computed font-family list, for CSS-aware consumers
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  color: SceneColor;
  lineHeight: number; // px distance between successive line tops
  letterSpacing: number; // px added after each character, 0 for normal
  align: 'left' | 'center' | 'right';
}

export type SceneNode = SceneBox | SceneText;

export interface Scene {
  width: number;
  height: number;
  nodes: SceneNode[];
}

interface Clip {
  rect: SceneRect;
  radii: SceneRadii;
}

type Side = keyof SceneBorders;
type Corner = keyof SceneRadii;

const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];
const CORNERS: readonly Corner[] = ['tl', 'tr', 'br', 'bl'];
const CORNER_PROPS: Record<Corner, string> = {
  tl: 'border-top-left-radius',
  tr: 'border-top-right-radius',
  br: 'border-bottom-right-radius',
  bl: 'border-bottom-left-radius',
};
const ZERO_RADII: SceneRadii = { tl: 0, tr: 0, br: 0, bl: 0 };
const EPS = 0.5;
const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif',
  'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
  '-apple-system', 'blinkmacsystemfont',
]);

export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ---------------------------------------------------------------------------
// Geometry helpers shared by the exporters

function intersectRect(a: SceneRect, b: SceneRect): SceneRect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const r = Math.min(a.x + a.w, b.x + b.w);
  const bt = Math.min(a.y + a.h, b.y + b.h);
  if (r - x <= 0 || bt - y <= 0) return null;
  return { x, y, w: r - x, h: bt - y };
}

export function insetRect(r: SceneRect, d: number): SceneRect {
  return { x: r.x + d, y: r.y + d, w: Math.max(0, r.w - 2 * d), h: Math.max(0, r.h - 2 * d) };
}

export function insetRadii(radii: SceneRadii, d: number): SceneRadii {
  return {
    tl: Math.max(0, radii.tl - d),
    tr: Math.max(0, radii.tr - d),
    br: Math.max(0, radii.br - d),
    bl: Math.max(0, radii.bl - d),
  };
}

export function hasRadius(radii: SceneRadii): boolean {
  return CORNERS.some((c) => radii[c] > 0);
}

export function uniformRadius(radii: SceneRadii): number | null {
  return CORNERS.every((c) => Math.abs(radii[c] - radii.tl) < 0.01) ? radii.tl : null;
}

function sameBorder(a: SceneBorder, b: SceneBorder): boolean {
  return a.width === b.width && a.style === b.style && a.color.hex === b.color.hex && a.color.alpha === b.color.alpha;
}

// The border to draw as a single shape outline: all four sides identical and
// solid. Dashed/dotted outlines would run clockwise, putting the dash phase of
// the left/bottom sides out of step with CSS (visible where cells touch), so
// those are drawn per side (top→bottom, left→right) instead.
export function outlineBorder(borders: SceneBorders): SceneBorder | null {
  const { top } = borders;
  if (!top || top.style !== 'solid') return null;
  return SIDES.every((s) => borders[s] && sameBorder(borders[s], top)) ? top : null;
}

// ---------------------------------------------------------------------------
// Computed-style readers

function px(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function readFill(cs: CSSStyleDeclaration, opacity: number): SceneColor | null {
  return toSceneColor(cs.backgroundColor, opacity) ?? firstGradientColor(cs.backgroundImage, opacity);
}

function readBorder(cs: CSSStyleDeclaration, side: Side, opacity: number): SceneBorder | null {
  const width = px(cs.getPropertyValue(`border-${side}-width`));
  const style = cs.getPropertyValue(`border-${side}-style`);
  if (width <= 0 || style === 'none' || style === 'hidden') return null;
  const color = toSceneColor(cs.getPropertyValue(`border-${side}-color`), opacity);
  if (!color) return null;
  return { width, color, style: style === 'dashed' || style === 'dotted' ? style : 'solid' };
}

function readRadius(value: string, rect: SceneRect): number {
  // Elliptical radii ("8px 4px") are reduced to their horizontal component.
  const first = value.trim().split(/\s+/)[0] ?? '0';
  return first.endsWith('%') ? (parseFloat(first) / 100) * rect.w : px(first);
}

// Resolves radii like CSS does (overlapping radii are scaled down together).
function readRadii(cs: CSSStyleDeclaration, rect: SceneRect): SceneRadii {
  const r = {} as SceneRadii;
  for (const c of CORNERS) r[c] = Math.max(0, readRadius(cs.getPropertyValue(CORNER_PROPS[c]), rect));
  const ratio = (len: number, a: number, b: number) => (a + b > len ? len / (a + b) : 1);
  const f = Math.min(
    ratio(rect.w, r.tl, r.tr),
    ratio(rect.w, r.bl, r.br),
    ratio(rect.h, r.tl, r.bl),
    ratio(rect.h, r.tr, r.br),
  );
  const cap = Math.min(rect.w, rect.h) / 2;
  for (const c of CORNERS) r[c] = round2(Math.min(r[c] * f, cap));
  return r;
}

function primaryFamily(stack: string): string {
  const families = stack.split(',').map((f) => f.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return families.find((f) => !GENERIC_FAMILIES.has(f.toLowerCase())) ?? families[0] ?? 'sans-serif';
}

function textAlign(value: string): SceneText['align'] {
  if (value === 'center') return 'center';
  if (value === 'right' || value === 'end') return 'right';
  return 'left';
}

function applyTextTransform(text: string, transform: string): string {
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/(^|\s)(\S)/g, (_, sp: string, ch: string) => sp + ch.toUpperCase());
    default:
      return text;
  }
}

// ---------------------------------------------------------------------------
// Clipping

function cornerPoint(r: SceneRect, c: Corner): [number, number] {
  return [c === 'tl' || c === 'bl' ? r.x : r.x + r.w, c === 'tl' || c === 'tr' ? r.y : r.y + r.h];
}

function sameCorner(a: SceneRect, b: SceneRect, c: Corner): boolean {
  const [ax, ay] = cornerPoint(a, c);
  const [bx, by] = cornerPoint(b, c);
  return Math.abs(ax - bx) < EPS && Math.abs(ay - by) < EPS;
}

// Corners that sit exactly on a rounded clip corner inherit its rounding, which
// is how `overflow: hidden` + `border-radius` visually trims square children.
function inheritClipRadii(rect: SceneRect, radii: SceneRadii, clip: Clip): SceneRadii {
  const out = { ...radii };
  for (const c of CORNERS) {
    if (clip.radii[c] > 0 && sameCorner(rect, clip.rect, c)) out[c] = Math.max(out[c], clip.radii[c]);
  }
  const cap = Math.min(rect.w, rect.h) / 2;
  for (const c of CORNERS) out[c] = Math.min(out[c], cap);
  return out;
}

function clipBox(box: SceneBox, clip: Clip): SceneBox | null {
  const rect = intersectRect(box.rect, clip.rect);
  if (!rect) return null;
  const o = box.rect;
  const cut = {
    left: rect.x > o.x + EPS,
    top: rect.y > o.y + EPS,
    right: rect.x + rect.w < o.x + o.w - EPS,
    bottom: rect.y + rect.h < o.y + o.h - EPS,
  };
  const borders = { ...box.borders };
  for (const s of SIDES) if (cut[s]) borders[s] = null;
  const radii = { ...box.radii };
  if (cut.left || cut.top) radii.tl = 0;
  if (cut.right || cut.top) radii.tr = 0;
  if (cut.right || cut.bottom) radii.br = 0;
  if (cut.left || cut.bottom) radii.bl = 0;
  return { ...box, rect, borders, radii: inheritClipRadii(rect, radii, clip) };
}

function childClip(cs: CSSStyleDeclaration, rect: SceneRect, parent: Clip): Clip | null {
  const bt = px(cs.borderTopWidth);
  const br = px(cs.borderRightWidth);
  const bb = px(cs.borderBottomWidth);
  const bl = px(cs.borderLeftWidth);
  const padding: SceneRect = { x: rect.x + bl, y: rect.y + bt, w: rect.w - bl - br, h: rect.h - bt - bb };
  const clipped = intersectRect(padding, parent.rect);
  if (!clipped) return null;
  const outer = readRadii(cs, rect);
  const inner: SceneRadii = {
    tl: Math.max(0, outer.tl - Math.max(bl, bt)),
    tr: Math.max(0, outer.tr - Math.max(br, bt)),
    br: Math.max(0, outer.br - Math.max(br, bb)),
    bl: Math.max(0, outer.bl - Math.max(bl, bb)),
  };
  const radii = { ...ZERO_RADII };
  for (const c of CORNERS) if (sameCorner(clipped, padding, c)) radii[c] = inner[c];
  return { rect: clipped, radii: inheritClipRadii(clipped, radii, parent) };
}

// ---------------------------------------------------------------------------
// Text measurement

interface MeasuredChar {
  ch: string;
  rect: SceneRect;
  space: boolean;
}

function unionRect(rects: SceneRect[]): SceneRect {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const r = Math.max(...rects.map((r) => r.x + r.w));
  const b = Math.max(...rects.map((r) => r.y + r.h));
  return { x: round2(x), y: round2(y), w: round2(r - x), h: round2(b - y) };
}

// Groups visible characters into rendered lines by their vertical position.
function groupLines(chars: MeasuredChar[]): MeasuredChar[][] {
  const lines: MeasuredChar[][] = [];
  let current: MeasuredChar[] | null = null;
  let top = 0;
  let height = 0;
  for (const c of chars) {
    if (c.space) {
      // Whitespace rects are unreliable at wrap points; keep them only as inner text.
      current?.push(c);
      continue;
    }
    if (!current || Math.abs(c.rect.y - top) > Math.min(c.rect.h, height) / 2) {
      current = [];
      lines.push(current);
      top = c.rect.y;
      height = c.rect.h;
    }
    current.push(c);
  }
  return lines;
}

function buildLine(chars: MeasuredChar[], clip: SceneRect, transform: string): SceneTextLine | null {
  const visible = chars.filter((c) => {
    const cx = c.rect.x + c.rect.w / 2;
    return cx >= clip.x && cx <= clip.x + clip.w;
  });
  const glyphs = visible.filter((c) => !c.space);
  if (glyphs.length === 0) return null;
  const rect = unionRect(glyphs.map((c) => c.rect));
  const overlap = Math.min(rect.y + rect.h, clip.y + clip.h) - Math.max(rect.y, clip.y);
  if (overlap < rect.h * 0.5) return null;
  const raw = visible.map((c) => c.ch).join('').replace(/[\r\n]/g, ' ').trim();
  const text = applyTextTransform(raw, transform);
  return { text, rect };
}

// ---------------------------------------------------------------------------

export function buildScene(root: HTMLElement): Scene {
  const rootRect = root.getBoundingClientRect();
  // The preview may scale the canvas with a CSS transform; measurements are
  // normalized back to unscaled CSS pixels.
  const scale = root.offsetWidth > 0 ? rootRect.width / root.offsetWidth : 1;
  const width = root.offsetWidth;
  const height = root.offsetHeight;
  const nodes: SceneNode[] = [];
  const range = document.createRange();

  const toLocal = (r: DOMRectReadOnly): SceneRect => ({
    x: round2((r.left - rootRect.left) / scale),
    y: round2((r.top - rootRect.top) / scale),
    w: round2(r.width / scale),
    h: round2(r.height / scale),
  });

  function readText(node: Text, cs: CSSStyleDeclaration, opacity: number, clip: Clip): SceneText | null {
    const data = node.data;
    if (!data.trim()) return null;
    const color = toSceneColor(cs.color, opacity);
    if (!color) return null;

    const chars: MeasuredChar[] = [];
    for (let i = 0; i < data.length; ) {
      const len = (data.codePointAt(i) ?? 0) > 0xffff ? 2 : 1;
      range.setStart(node, i);
      range.setEnd(node, i + len);
      const r = range.getBoundingClientRect();
      // Collapsed whitespace has no box.
      if (r.width > 0 && r.height > 0) {
        const ch = data.slice(i, i + len);
        chars.push({ ch, rect: toLocal(r), space: /^\s$/.test(ch) });
      }
      i += len;
    }

    const lines = groupLines(chars)
      .map((l) => buildLine(l, clip.rect, cs.textTransform))
      .filter((l): l is SceneTextLine => l !== null);
    if (lines.length === 0) return null;

    const fontSize = px(cs.fontSize);
    const lineHeight = lines.length > 1
      ? round2((lines[lines.length - 1].rect.y - lines[0].rect.y) / (lines.length - 1))
      : cs.lineHeight === 'normal' ? lines[0].rect.h : px(cs.lineHeight);

    return {
      kind: 'text',
      rect: unionRect(lines.map((l) => l.rect)),
      lines,
      fontFamily: primaryFamily(cs.fontFamily),
      fontStack: cs.fontFamily,
      fontSize,
      fontWeight: parseInt(cs.fontWeight, 10) || 400,
      italic: cs.fontStyle === 'italic' || cs.fontStyle.startsWith('oblique'),
      color,
      lineHeight,
      letterSpacing: px(cs.letterSpacing),
      align: textAlign(cs.textAlign),
    };
  }

  function readBox(cs: CSSStyleDeclaration, rect: SceneRect, opacity: number, clip: Clip): SceneBox | null {
    if (rect.w <= 0 || rect.h <= 0) return null;
    const fill = readFill(cs, opacity);
    const borders: SceneBorders = {
      top: readBorder(cs, 'top', opacity),
      right: readBorder(cs, 'right', opacity),
      bottom: readBorder(cs, 'bottom', opacity),
      left: readBorder(cs, 'left', opacity),
    };
    if (!fill && SIDES.every((s) => !borders[s])) return null;
    return clipBox({ kind: 'box', rect, fill, borders, radii: readRadii(cs, rect) }, clip);
  }

  function walk(el: Element, parentOpacity: number, clip: Clip): void {
    // Inline SVG/MathML is not converted; the calendar views don't use it.
    if (!(el instanceof HTMLElement)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none') return;
    const opacity = parentOpacity * px(cs.opacity);
    if (opacity <= 0) return;

    // visibility:hidden hides only this element's own painting; children may override it.
    const painted = cs.visibility === 'visible';
    const rect = toLocal(el.getBoundingClientRect());
    if (painted) {
      const box = readBox(cs, rect, opacity, clip);
      if (box) nodes.push(box);
    }

    const clipsChildren = cs.overflowX !== 'visible' || cs.overflowY !== 'visible';
    const inner = clipsChildren ? childClip(cs, rect, clip) : clip;
    if (!inner) return;

    for (const child of el.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child as Element, opacity, inner);
      } else if (painted && child.nodeType === Node.TEXT_NODE) {
        const text = readText(child as Text, cs, opacity, inner);
        if (text) nodes.push(text);
      }
    }
  }

  walk(root, 1, { rect: { x: 0, y: 0, w: width, h: height }, radii: { ...ZERO_RADII } });
  return { width, height, nodes };
}
