import type { CalendarEvent, WeekdayFormat } from '$lib/types';
import { formatTime, getWeekdayLabel, isSameDay } from './utils';
import { normalizeColor } from './legend';

// One row of the event summary list drawn under the calendar.
export interface SummaryItem {
  title: string;
  color: string;
  dates: string; // e.g. "6(火)・13(火)"
  details: string; // shared time range and/or location, '' when nothing is common
}

export interface SummaryOptions {
  defaultColor: string;
  weekdayFormat: WeekdayFormat;
}

const DATE_SEPARATOR = '・';
const DETAIL_SEPARATOR = '　';

function byStart(a: CalendarEvent, b: CalendarEvent): number {
  return new Date(a.start).getTime() - new Date(b.start).getTime();
}

// Groups by trimmed title in order of first occurrence, each group sorted by start.
// Untitled events are skipped, matching eventIdsWithTitle.
export function groupByTitle(events: CalendarEvent[]): CalendarEvent[][] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const ev of [...events].sort(byStart)) {
    const key = ev.title.trim();
    if (!key) continue;
    const group = groups.get(key);
    if (group) group.push(ev);
    else groups.set(key, [ev]);
  }
  return [...groups.values()];
}

// Last calendar day an event covers; the end instant is exclusive.
function lastDay(ev: CalendarEvent): Date {
  const start = new Date(ev.start);
  const last = new Date(new Date(ev.end).getTime() - 1);
  return last < start ? start : last;
}

// "6(火)・13(火)"; "3/30(火)・4/6(火)" when the dates span months; multi-day events as "1(木)〜3(土)".
export function formatDates(events: CalendarEvent[], weekdayFormat: WeekdayFormat): string {
  const spans = events.map((ev) => [new Date(ev.start), lastDay(ev)] as const);
  const months = new Set(spans.flat().map((d) => d.getFullYear() * 12 + d.getMonth()));
  const prefixMonth = months.size > 1;
  const label = (d: Date) =>
    `${prefixMonth ? `${d.getMonth() + 1}/` : ''}${d.getDate()}(${getWeekdayLabel(d.getDay(), weekdayFormat)})`;
  const labels = spans.map(([first, last]) => (isSameDay(first, last) ? label(first) : `${label(first)}〜${label(last)}`));
  return [...new Set(labels)].join(DATE_SEPARATOR);
}

function common(values: string[]): string {
  return values.every((v) => v === values[0]) ? (values[0] ?? '') : '';
}

// Time range and location, each only when identical across the group (time is omitted for all-day events).
export function formatDetails(events: CalendarEvent[]): string {
  const time = events.some((ev) => ev.allDay)
    ? ''
    : common(events.map((ev) => `${formatTime(new Date(ev.start))}–${formatTime(new Date(ev.end))}`));
  const place = common(events.map((ev) => ev.location.trim()));
  return [time, place].filter(Boolean).join(DETAIL_SEPARATOR);
}

export function buildSummary(events: CalendarEvent[], { defaultColor, weekdayFormat }: SummaryOptions): SummaryItem[] {
  return groupByTitle(events).map((group) => ({
    title: group[0].title.trim(),
    color: normalizeColor(group[0].color || defaultColor),
    dates: formatDates(group, weekdayFormat),
    details: formatDetails(group),
  }));
}
