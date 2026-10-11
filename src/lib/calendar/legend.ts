import type { CalendarEvent, LegendItem } from '$lib/types';

const SHORT_HEX = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/;

// Lowercase '#rrggbb' ('#rgb' is expanded) so the same color always maps to one legend key.
export function normalizeColor(c: string): string {
  const v = c.trim().toLowerCase();
  const m = SHORT_HEX.exec(v);
  return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}` : v;
}

// Distinct event colors, ordered by the first event (by start time) that uses each.
export function usedColors(events: CalendarEvent[], defaultColor: string): string[] {
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return [...new Set(sorted.map((e) => normalizeColor(e.color || defaultColor)))];
}

// Only labeled colors make it into the legend; order follows `colors`.
export function buildLegend(colors: string[], labels: Record<string, string>): LegendItem[] {
  return colors.flatMap((color) => {
    const label = labels[color]?.trim();
    return label ? [{ color, label }] : [];
  });
}
