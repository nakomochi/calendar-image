import type { CalendarStyle } from '$lib/types';
import { normalizeColor } from './legend';

// Background of out-of-range days when DateRange.outside is 'gray'.
export const GRAYOUT_BG = '#f3f4f6';

function parseHex6(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) as [number, number, number];
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = parseHex6(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

// Text color for content drawn on a solid `color` fill: white unless the fill
// is light (YIQ brightness), so mid-tone accents like orange keep white text.
export function contrastText(color: string): string {
  const rgb = parseHex6(normalizeColor(color));
  if (!rgb) return '#ffffff';
  const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return yiq >= 180 ? '#1f2937' : '#ffffff';
}

// CSS for an event chip (fill / outline / left-bar). Preserves per-event color.
export function chipCss(style: CalendarStyle, color: string): string {
  switch (style.eventShape) {
    case 'outline':
      return `background-color: transparent; color: ${color}; border: 1.5px solid ${color};`;
    case 'left-bar':
      return `background-color: ${withAlpha(color, 0.14)}; color: ${style.textColor}; border-left: 3px solid ${color}; padding-left: 4px;`;
    case 'fill':
    default:
      return `background-color: ${color}; color: #ffffff;`;
  }
}

// Timetable course cells fill the whole grid slot, so a straight fill chip
// looks too heavy. Keep the tinted feel by default but honor eventShape.
export function courseCellCss(style: CalendarStyle, color: string): string {
  switch (style.eventShape) {
    case 'outline':
      return `background-color: ${style.bgColor}; color: ${color}; border: 1.5px solid ${color};`;
    case 'left-bar':
      return `background-color: ${withAlpha(color, 0.08)}; color: ${style.textColor}; border-left: 4px solid ${color};`;
    case 'fill':
    default:
      return `background-color: ${withAlpha(color, 0.14)}; color: ${style.textColor};`;
  }
}

// CSS for the header row (solid bg / transparent / underline).
export function headerCss(style: CalendarStyle): string {
  switch (style.headerStyle) {
    case 'minimal':
      return `background-color: transparent; color: ${style.headerBgColor};`;
    case 'underline':
      return `background-color: transparent; color: ${style.headerBgColor}; border-bottom: 2px solid ${style.headerBgColor};`;
    case 'solid':
    default:
      return `background-color: ${style.headerBgColor}; color: ${style.headerTextColor};`;
  }
}

// Whether cell separation is drawn via gap+bg (card look) or per-cell borders.
export function usesCellGap(style: CalendarStyle): boolean {
  return style.cellGap > 0;
}

// Border CSS for an individual grid cell. Skipped when cellGap > 0 (gap handles
// separation) or borderStyle is 'none'.
export function cellBorderCss(style: CalendarStyle): string {
  if (usesCellGap(style) || style.borderStyle === 'none') return 'border: none;';
  return `border: 1px ${style.borderStyle} ${style.gridLineColor};`;
}

// Container CSS for the grid: enables gap-based cell separation when cellGap > 0.
export function gridContainerCss(style: CalendarStyle): string {
  if (usesCellGap(style)) {
    return `gap: ${style.cellGap}px; background-color: ${style.gridLineColor};`;
  }
  return '';
}

// Traditional Japanese wall-calendar convention: Sunday red, Saturday blue.
// Returns null when the theme doesn't opt in — caller keeps inherited color.
export function weekdayAccent(dow: number, style: CalendarStyle): string | null {
  if (style.weekendStyle !== 'traditional') return null;
  if (dow === 0) return '#dc2626';
  if (dow === 6) return '#2563eb';
  return null;
}

// Whether today's cell should tint its background. Only 'bg' marker uses cell
// tint; other markers (circle/bold/badge) decorate the number instead.
export function todayCellTint(style: CalendarStyle): boolean {
  return style.todayMarker === 'bg';
}
