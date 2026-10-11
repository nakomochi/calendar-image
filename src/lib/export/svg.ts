import { downloadBlob } from './download';
import { GOOGLE_FONTS_URL } from './fonts';
import { baselineOf, fontMetrics } from './fontMetrics';
import {
  buildScene,
  hasRadius,
  insetRadii,
  insetRect,
  outlineBorder,
  round2,
  uniformRadius,
  type Scene,
  type SceneBorder,
  type SceneBox,
  type SceneColor,
  type SceneRadii,
  type SceneRect,
  type SceneText,
} from './scene';

const num = (v: number): string => String(round2(v));

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fillAttrs(c: SceneColor): string {
  return c.alpha < 1 ? `fill="${c.hex}" fill-opacity="${c.alpha}"` : `fill="${c.hex}"`;
}

function strokeAttrs(b: SceneBorder): string {
  const parts = [`stroke="${b.color.hex}"`, `stroke-width="${num(b.width)}"`];
  if (b.color.alpha < 1) parts.push(`stroke-opacity="${b.color.alpha}"`);
  if (b.style === 'dashed') parts.push(`stroke-dasharray="${num(b.width * 3)} ${num(b.width * 3)}"`);
  if (b.style === 'dotted') parts.push(`stroke-dasharray="${num(b.width)} ${num(b.width)}"`);
  return parts.join(' ');
}

function roundedRectPath(r: SceneRect, radii: SceneRadii): string {
  const { x, y, w, h } = r;
  const { tl, tr, br, bl } = radii;
  const arc = (rad: number, ex: number, ey: number) => (rad > 0 ? `A${num(rad)} ${num(rad)} 0 0 1 ${num(ex)} ${num(ey)}` : '');
  return [
    `M${num(x + tl)} ${num(y)}`,
    `H${num(x + w - tr)}`,
    arc(tr, x + w, y + tr),
    `V${num(y + h - br)}`,
    arc(br, x + w - br, y + h),
    `H${num(x + bl)}`,
    arc(bl, x, y + h - bl),
    `V${num(y + tl)}`,
    arc(tl, x + tl, y),
    'Z',
  ].filter(Boolean).join('');
}

// <rect> when the corners agree (best editability), <path> otherwise.
function shape(r: SceneRect, radii: SceneRadii, attrs: string): string {
  const rx = uniformRadius(radii);
  if (rx !== null) {
    const round = rx > 0 ? ` rx="${num(rx)}"` : '';
    return `<rect x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}"${round} ${attrs}/>`;
  }
  return `<path d="${roundedRectPath(r, radii)}" ${attrs}/>`;
}

// Each side is drawn inside the border box, like CSS borders.
function sideLines(box: SceneBox): string[] {
  const { x, y, w, h } = box.rect;
  const { top, right, bottom, left } = box.borders;
  const line = (b: SceneBorder, x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" ${strokeAttrs(b)}/>`;
  const out: string[] = [];
  if (top) out.push(line(top, x, y + top.width / 2, x + w, y + top.width / 2));
  if (right) out.push(line(right, x + w - right.width / 2, y, x + w - right.width / 2, y + h));
  if (bottom) out.push(line(bottom, x, y + h - bottom.width / 2, x + w, y + h - bottom.width / 2));
  if (left) out.push(line(left, x + left.width / 2, y, x + left.width / 2, y + h));
  return out;
}

function boxToSvg(box: SceneBox, nextId: () => string): string {
  const border = outlineBorder(box.borders);
  if (border) {
    // Stroke centered on a rect inset by half the width = CSS inside border.
    const inset = border.width / 2;
    const inner = insetRect(box.rect, inset);
    const radii = insetRadii(box.radii, inset);
    // An opaque border fully covers the outer half of the fill, so fill and
    // stroke can share one element (a single editable shape in design tools).
    if (box.fill && border.color.alpha === 1) {
      return shape(inner, radii, `${fillAttrs(box.fill)} ${strokeAttrs(border)}`);
    }
    const fill = box.fill ? shape(box.rect, box.radii, fillAttrs(box.fill)) : '';
    return fill + shape(inner, radii, `fill="none" ${strokeAttrs(border)}`);
  }

  const fill = box.fill ? shape(box.rect, box.radii, fillAttrs(box.fill)) : '';
  const lines = sideLines(box);
  if (lines.length === 0) return fill;
  if (!hasRadius(box.radii)) return fill + lines.join('');
  // Rounded corners: clip the side strokes to the box outline (e.g. left-bar chips).
  const id = nextId();
  return `${fill}<clipPath id="${id}">${shape(box.rect, box.radii, '')}</clipPath>`
    + `<g clip-path="url(#${id})">${lines.join('')}</g>`;
}

function textToSvg(t: SceneText): string {
  const metrics = fontMetrics(t);
  const anchor = t.align === 'center' ? 'middle' : t.align === 'right' ? 'end' : 'start';
  const attrs = [
    `font-family="${escapeXml(t.fontStack)}"`,
    `font-size="${num(t.fontSize)}"`,
    t.fontWeight !== 400 ? `font-weight="${t.fontWeight}"` : '',
    t.italic ? 'font-style="italic"' : '',
    t.letterSpacing ? `letter-spacing="${num(t.letterSpacing)}"` : '',
    fillAttrs(t.color),
    anchor !== 'start' ? `text-anchor="${anchor}"` : '',
  ].filter(Boolean).join(' ');

  return t.lines.map((line) => {
    const r = line.rect;
    const x = t.align === 'center' ? r.x + r.w / 2 : t.align === 'right' ? r.x + r.w : r.x;
    const y = baselineOf(r.y, r.h, metrics);
    return `<text x="${num(x)}" y="${num(y)}" ${attrs} xml:space="preserve">${escapeXml(line.text)}</text>`;
  }).join('');
}

export function sceneToSvg(scene: Scene): string {
  let clipCount = 0;
  const nextId = () => `clip${++clipCount}`;
  const body = scene.nodes
    .map((n) => (n.kind === 'box' ? boxToSvg(n, nextId) : textToSvg(n)))
    .join('\n');
  const { width, height } = scene;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<style>@import url('${escapeXml(GOOGLE_FONTS_URL)}');</style>`,
    body,
    '</svg>',
  ].join('\n');
}

export function exportToSvg(el: HTMLElement): void {
  const svg = sceneToSvg(buildScene(el));
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'calendar.svg');
}
