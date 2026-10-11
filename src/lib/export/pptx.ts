import type PptxGenJS from 'pptxgenjs';
import { downloadBlob } from './download';
import {
  buildScene,
  insetRadii,
  insetRect,
  outlineBorder,
  uniformRadius,
  type SceneBorder,
  type SceneBox,
  type SceneColor,
  type SceneRadii,
  type SceneRect,
  type SceneText,
} from './scene';

type Slide = PptxGenJS.Slide;
type ShapeProps = PptxGenJS.ShapeProps;

const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const PX_PER_INCH = 96;
const PT_PER_PX = 0.75;
// Extra text-box width (px per side) so PowerPoint's own font metrics never
// clip or shift text; with wrap disabled the slack has no layout effect.
const TEXT_SLACK = 6;
// Not listed in pptxgenjs' SHAPE_NAME typings, but supported at runtime.
const CUSTOM_GEOMETRY = 'custGeom' as PptxGenJS.SHAPE_NAME;
const GENERIC_FONT_FALLBACKS: Record<string, string> = {
  'sans-serif': 'Arial',
  serif: 'Times New Roman',
  monospace: 'Courier New',
};

const inch = (px: number): number => px / PX_PER_INCH;
const pt = (px: number): number => Math.round(px * PT_PER_PX * 100) / 100;

function color(c: SceneColor): { color: string; transparency?: number } {
  const transparency = Math.round((1 - c.alpha) * 100);
  return transparency > 0 ? { color: c.hex.slice(1), transparency } : { color: c.hex.slice(1) };
}

function lineProps(b: SceneBorder): PptxGenJS.ShapeLineProps {
  return {
    ...color(b.color),
    width: pt(b.width),
    dashType: b.style === 'dashed' ? 'dash' : b.style === 'dotted' ? 'sysDot' : 'solid',
  };
}

function position(r: SceneRect): Pick<ShapeProps, 'x' | 'y' | 'w' | 'h'> {
  return { x: inch(r.x), y: inch(r.y), w: inch(r.w), h: inch(r.h) };
}

// Rounded rectangle with independent corners, as shape-relative points (inches).
function roundedRectPoints(r: SceneRect, radii: SceneRadii): NonNullable<ShapeProps['points']> {
  const w = inch(r.w);
  const h = inch(r.h);
  const [tl, tr, br, bl] = [radii.tl, radii.tr, radii.br, radii.bl].map(inch);
  const arc = (rad: number, stAng: number) =>
    ({ x: 0, y: 0, curve: { type: 'arc' as const, hR: rad, wR: rad, stAng, swAng: 90 } });
  const points: NonNullable<ShapeProps['points']> = [{ x: tl, y: 0, moveTo: true }, { x: w - tr, y: 0 }];
  if (tr > 0) points.push(arc(tr, 270));
  points.push({ x: w, y: h - br });
  if (br > 0) points.push(arc(br, 0));
  points.push({ x: bl, y: h });
  if (bl > 0) points.push(arc(bl, 90));
  points.push({ x: 0, y: tl });
  if (tl > 0) points.push(arc(tl, 180));
  points.push({ close: true });
  return points;
}

// Picks the simplest native shape that reproduces the corner rounding.
function geometry(r: SceneRect, radii: SceneRadii): { name: PptxGenJS.SHAPE_NAME; props: ShapeProps } {
  const rx = uniformRadius(radii);
  if (rx === 0) return { name: 'rect', props: {} };
  if (rx !== null) {
    const half = Math.min(r.w, r.h) / 2;
    if (Math.abs(r.w - r.h) < 0.5 && rx >= half - 0.01) return { name: 'ellipse', props: {} };
    // rectRadius is in inches (pptxgenjs converts it relative to the shorter side).
    return { name: 'roundRect', props: { rectRadius: inch(Math.min(rx, half)) } };
  }
  return { name: CUSTOM_GEOMETRY, props: { points: roundedRectPoints(r, radii) } };
}

function addSideLines(slide: Slide, box: SceneBox): void {
  const { x, y, w, h } = box.rect;
  const { top, right, bottom, left } = box.borders;
  const add = (b: SceneBorder, x1: number, y1: number, x2: number, y2: number) =>
    slide.addShape('line', { ...position({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 }), line: lineProps(b) });
  if (top) add(top, x, y + top.width / 2, x + w, y + top.width / 2);
  if (right) add(right, x + w - right.width / 2, y, x + w - right.width / 2, y + h);
  if (bottom) add(bottom, x, y + h - bottom.width / 2, x + w, y + h - bottom.width / 2);
  if (left) add(left, x + left.width / 2, y, x + left.width / 2, y + h);
}

function addBox(slide: Slide, box: SceneBox): void {
  const border = outlineBorder(box.borders);
  // PowerPoint centers outlines on the shape edge; inset so the stroke stays
  // inside the border box like CSS.
  const inset = border ? border.width / 2 : 0;
  const rect = insetRect(box.rect, inset);
  const radii = insetRadii(box.radii, inset);
  const { name, props } = geometry(rect, radii);
  slide.addShape(name, {
    ...position(rect),
    ...props,
    fill: box.fill ? color(box.fill) : undefined,
    line: border ? lineProps(border) : { type: 'none' },
  });
  if (!border) addSideLines(slide, box);
}

function fontFace(t: SceneText): string {
  return GENERIC_FONT_FALLBACKS[t.fontFamily.toLowerCase()] ?? t.fontFamily;
}

function addText(slide: Slide, t: SceneText): void {
  const first = t.lines[0].rect;
  // Line boxes are centered on the glyph boxes in CSS; align the PowerPoint
  // line box (exact spacing = CSS line pitch) to the same top.
  const top = first.y - (t.lineHeight - first.h) / 2;
  const left = t.align === 'left' ? t.rect.x : t.align === 'center' ? t.rect.x - TEXT_SLACK : t.rect.x - 2 * TEXT_SLACK;
  slide.addText(t.lines.map((l) => l.text).join('\n'), {
    ...position({ x: left, y: top, w: t.rect.w + 2 * TEXT_SLACK, h: t.lineHeight * t.lines.length }),
    margin: [0, 0, 0, 0],
    valign: 'top',
    wrap: false,
    lineSpacing: pt(t.lineHeight),
    fontFace: fontFace(t),
    fontSize: pt(t.fontSize),
    charSpacing: t.letterSpacing ? pt(t.letterSpacing) : undefined,
    ...color(t.color),
    bold: t.fontWeight >= 600,
    italic: t.italic,
    align: t.align,
    lang: 'ja-JP',
  });
}

export async function exportToPptx(el: HTMLElement): Promise<void> {
  const scene = buildScene(el);
  // Loaded on demand: pptxgenjs is large and only needed for this format.
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'CALENDAR', width: inch(scene.width), height: inch(scene.height) });
  pptx.layout = 'CALENDAR';
  const slide = pptx.addSlide();
  for (const node of scene.nodes) {
    if (node.kind === 'box') addBox(slide, node);
    else addText(slide, node);
  }
  const zip = (await pptx.write({ outputType: 'blob' })) as Blob;
  downloadBlob(new Blob([zip], { type: PPTX_MIME }), 'calendar.pptx');
}
