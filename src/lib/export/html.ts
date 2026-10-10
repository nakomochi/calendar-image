// Standalone HTML: a deep clone of the calendar with every element's computed
// style inlined (no classes, no app CSS), so it renders the same anywhere the
// web fonts are reachable.
import { downloadBlob } from './download';
import { GOOGLE_FONTS_URL } from './fonts';

// Inherited properties are only written when they differ from the parent.
const INHERITED_PROPS = [
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
  'word-break',
  'overflow-wrap',
  'visibility',
] as const;

// Non-inherited properties are skipped when they hold their initial value.
const OWN_PROPS: Record<string, string | null> = {
  // null = always written (initial value depends on the element type)
  display: null,
  position: 'static',
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto',
  'z-index': 'auto',
  'box-sizing': 'border-box',
  width: 'auto',
  height: 'auto',
  'min-width': 'auto',
  'min-height': 'auto',
  'max-width': 'none',
  'max-height': 'none',
  'margin-top': '0px',
  'margin-right': '0px',
  'margin-bottom': '0px',
  'margin-left': '0px',
  'padding-top': '0px',
  'padding-right': '0px',
  'padding-bottom': '0px',
  'padding-left': '0px',
  'border-top-left-radius': '0px',
  'border-top-right-radius': '0px',
  'border-bottom-right-radius': '0px',
  'border-bottom-left-radius': '0px',
  'background-color': 'rgba(0, 0, 0, 0)',
  'background-image': 'none',
  opacity: '1',
  'text-decoration-line': 'none',
  'overflow-x': 'visible',
  'overflow-y': 'visible',
  'text-overflow': 'clip',
  'vertical-align': 'baseline',
  'flex-direction': 'row',
  'flex-wrap': 'nowrap',
  'flex-grow': '0',
  'flex-shrink': '1',
  'flex-basis': 'auto',
  'grid-template-columns': 'none',
  'grid-template-rows': 'none',
  'grid-column-start': 'auto',
  'grid-column-end': 'auto',
  'grid-row-start': 'auto',
  'grid-row-end': 'auto',
  'row-gap': 'normal',
  'column-gap': 'normal',
  'justify-content': 'normal',
  'justify-items': 'normal',
  'justify-self': 'auto',
  'align-content': 'normal',
  'align-items': 'normal',
  'align-self': 'auto',
  transform: 'none',
};

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

const PAGE_CSS =
  '*,*::before,*::after{box-sizing:border-box}'
  + 'body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6;padding:24px}';

function inlineStyle(cs: CSSStyleDeclaration, parent: CSSStyleDeclaration | null): Map<string, string> {
  const out = new Map<string, string>();
  for (const prop of INHERITED_PROPS) {
    const v = cs.getPropertyValue(prop);
    if (!parent || parent.getPropertyValue(prop) !== v) out.set(prop, v);
  }
  for (const [prop, initial] of Object.entries(OWN_PROPS)) {
    const v = cs.getPropertyValue(prop);
    if (v !== initial) out.set(prop, v);
  }
  for (const side of SIDES) {
    const style = cs.getPropertyValue(`border-${side}-style`);
    if (style === 'none' || style === 'hidden') continue;
    out.set(`border-${side}-width`, cs.getPropertyValue(`border-${side}-width`));
    out.set(`border-${side}-style`, style);
    out.set(`border-${side}-color`, cs.getPropertyValue(`border-${side}-color`));
  }
  return out;
}

function serialize(style: Map<string, string>): string {
  return Array.from(style, ([k, v]) => `${k}: ${v}`).join('; ');
}

// Buttons vertically center their content; a plain div needs flexbox for that.
function buttonAsDiv(button: HTMLElement, style: Map<string, string>): HTMLElement {
  const div = document.createElement('div');
  while (button.firstChild) div.appendChild(button.firstChild);
  const display = style.get('display');
  if (display === 'block' || display === 'inline-block') {
    style.set('display', display === 'block' ? 'flex' : 'inline-flex');
    style.set('flex-direction', 'column');
    style.set('justify-content', 'center');
  }
  button.replaceWith(div);
  return div;
}

function stripAttributes(el: Element): void {
  for (const name of el.getAttributeNames()) el.removeAttribute(name);
}

function removeComments(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments: Node[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  for (const c of comments) c.parentNode?.removeChild(c);
}

// Walks the original and the clone in lockstep (structures are identical).
function inlineTree(original: Element, copy: Element, parent: CSSStyleDeclaration | null): Element {
  const cs = getComputedStyle(original);
  const originals = Array.from(original.children);
  const copies = Array.from(copy.children);
  originals.forEach((child, i) => inlineTree(child, copies[i], cs));

  // Inline SVG keeps its own presentation attributes.
  if (!(original instanceof HTMLElement)) return copy;

  const style = inlineStyle(cs, parent);
  stripAttributes(copy);
  const target = copy instanceof HTMLButtonElement ? buttonAsDiv(copy, style) : copy;
  target.setAttribute('style', serialize(style));
  return target;
}

export function buildStandaloneHtml(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  removeComments(clone);
  const root = inlineTree(el, clone, null) as HTMLElement;
  // The live element may sit inside a scaled preview; the export is unscaled.
  root.style.width = `${el.offsetWidth}px`;
  root.style.height = `${el.offsetHeight}px`;
  root.style.flexShrink = '0';
  root.style.transform = 'none';
  root.style.cursor = 'default';

  return [
    '<!doctype html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Calendar</title>',
    `<link rel="stylesheet" href="${GOOGLE_FONTS_URL.replace(/&/g, '&amp;')}">`,
    `<style>${PAGE_CSS}</style>`,
    '</head>',
    '<body>',
    root.outerHTML,
    '</body>',
    '</html>',
  ].join('\n');
}

export function exportToHtml(el: HTMLElement): void {
  const html = buildStandaloneHtml(el);
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), 'calendar.html');
}
