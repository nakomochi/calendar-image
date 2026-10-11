import type { CalendarEvent, Semester, TermPart } from '../types';
import { isSameDay, minutesOfDay } from './utils';

export interface Period {
  index: number;
  label: string;
  startMinutes: number;
  endMinutes: number;
}

// All-faculty common UTokyo period table
export const PERIODS: Period[] = [
  { index: 1, label: '1限', startMinutes: 8 * 60 + 30, endMinutes: 10 * 60 + 15 },
  { index: 2, label: '2限', startMinutes: 10 * 60 + 25, endMinutes: 12 * 60 + 10 },
  { index: 3, label: '3限', startMinutes: 13 * 60, endMinutes: 14 * 60 + 45 },
  { index: 4, label: '4限', startMinutes: 14 * 60 + 55, endMinutes: 16 * 60 + 40 },
  { index: 5, label: '5限', startMinutes: 16 * 60 + 50, endMinutes: 18 * 60 + 35 },
  { index: 6, label: '6限', startMinutes: 18 * 60 + 45, endMinutes: 20 * 60 + 30 },
];

// Mon-Sat in JS getDay(); Sunday (0) is excluded
export const TIMETABLE_WEEKDAYS = [1, 2, 3, 4, 5, 6] as const;
export type TimetableWeekday = (typeof TIMETABLE_WEEKDAYS)[number];

export const MATCH_THRESHOLD = 0.5;

// Drop noise (e.g. one-off makeup lessons) but keep terms / overlapping registrations.
// A course is kept when it appears at least COURSE_MIN_COUNT times AND its count
// reaches COURSE_MIN_RATIO of the top course in the same cell.
export const COURSE_MIN_COUNT = 2;
export const COURSE_MIN_RATIO = 0.3;

export interface Course {
  id: string;
  title: string;
  location: string;
  weekday: TimetableWeekday;
  period: Period;
  count: number;
  sourceEvents: CalendarEvent[];
  earliestStartMs: number;
  latestEvent: CalendarEvent;
}

export type TimetableMatrix = Map<string, Course[]>;

export function cellKey(weekday: TimetableWeekday, periodIndex: number): string {
  return `${weekday}-${periodIndex}`;
}

// Returns overlap ratio relative to the period length (0..1).
export function overlapRatioWithPeriod(
  eventStart: Date,
  eventEnd: Date,
  period: Period,
): number {
  const evStart = minutesOfDay(eventStart);
  const evEnd = isSameDay(eventStart, eventEnd) ? minutesOfDay(eventEnd) : 24 * 60;

  const overlap = Math.max(
    0,
    Math.min(evEnd, period.endMinutes) - Math.max(evStart, period.startMinutes),
  );
  const periodLen = period.endMinutes - period.startMinutes;
  return periodLen > 0 ? overlap / periodLen : 0;
}

// UTAS replaces a cancelled session with "[休]<title>" and adds makeup
// sessions as "[補]<title>"; both belong to the regular course.
const SESSION_MARKER = /^\s*\[(休|補)\]\s*/;

function hasSessionMarker(title: string): boolean {
  return SESSION_MARKER.test(title);
}

function normalizeTitle(title: string): string {
  return title.replace(SESSION_MARKER, '').trim().replace(/\s+/g, ' ');
}

function isTimetableWeekday(n: number): n is TimetableWeekday {
  return n >= 1 && n <= 6;
}

export function buildTimetable(
  events: CalendarEvent[],
  periods: Period[] = PERIODS,
  threshold: number = MATCH_THRESHOLD,
): TimetableMatrix {
  const buckets = new Map<string, CalendarEvent[]>();

  for (const ev of events) {
    if (ev.allDay) continue;
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const weekday = start.getDay();
    if (!isTimetableWeekday(weekday)) continue;

    for (const p of periods) {
      if (overlapRatioWithPeriod(start, end, p) >= threshold) {
        const k = cellKey(weekday, p.index);
        const arr = buckets.get(k);
        if (arr) arr.push(ev);
        else buckets.set(k, [ev]);
      }
    }
  }

  const result: TimetableMatrix = new Map();

  for (const p of periods) {
    for (const wd of TIMETABLE_WEEKDAYS) {
      const k = cellKey(wd, p.index);
      const evs = buckets.get(k);
      if (!evs || evs.length === 0) continue;

      const titleGroups = new Map<string, CalendarEvent[]>();
      for (const e of evs) {
        const t = normalizeTitle(e.title);
        if (!t) continue;
        const arr = titleGroups.get(t);
        if (arr) arr.push(e);
        else titleGroups.set(t, [e]);
      }
      if (titleGroups.size === 0) continue;

      let topCount = 0;
      for (const arr of titleGroups.values()) {
        if (arr.length > topCount) topCount = arr.length;
      }

      const courses: Course[] = [];
      for (const [groupKey, src] of titleGroups) {
        if (src.length < COURSE_MIN_COUNT || src.length / topCount < COURSE_MIN_RATIO) continue;
        let earliestMs = Infinity;
        // Prefer a regular session as the representative so the cell shows
        // the plain course title rather than a [休]/[補] one.
        const regular = src.filter((e) => !hasSessionMarker(e.title));
        const candidates = regular.length > 0 ? regular : src;
        let latestMs = -Infinity;
        let latestEvent = candidates[0];
        for (const e of candidates) {
          const ms = new Date(e.start).getTime();
          if (ms > latestMs) {
            latestMs = ms;
            latestEvent = e;
          }
        }
        const locationCounts = new Map<string, number>();
        for (const e of src) {
          const ms = new Date(e.start).getTime();
          if (ms < earliestMs) earliestMs = ms;
          const loc = e.location.trim();
          if (loc) locationCounts.set(loc, (locationCounts.get(loc) ?? 0) + 1);
        }
        let location = '';
        let bestLocCount = -1;
        for (const [loc, c] of locationCounts) {
          if (c > bestLocCount) {
            location = loc;
            bestLocCount = c;
          }
        }
        const isoDay = new Date(earliestMs).toISOString().slice(0, 10);
        courses.push({
          id: `${wd}-${p.index}-${groupKey}-${isoDay}`,
          title: hasSessionMarker(latestEvent.title) ? groupKey : latestEvent.title,
          location,
          weekday: wd,
          period: p,
          count: src.length,
          sourceEvents: src,
          earliestStartMs: earliestMs,
          latestEvent,
        });
      }

      // Stable order: by count desc, tie-broken by earliest start asc
      courses.sort((a, b) => (b.count - a.count) || (a.earliestStartMs - b.earliestStartMs));

      if (courses.length > 0) result.set(k, courses);
    }
  }

  return result;
}

// UTokyo academic terms. Year refers to the calendar year of the first day:
// e.g. { year: 2025, key: 'A2' } spans Dec 2025 - early Feb 2026.
export type TermKey = 'S' | 'A' | 'S1' | 'S2' | 'A1' | 'A2';

export interface TermSpec {
  year: number;
  key: TermKey;
}

// Approximate UTokyo term boundaries (Komaba/Hongo, all-faculty common).
// End is inclusive (23:59:59.999). JS Date overflows day-of-month, so May 31 = (3, 31).
export function termRange({ year, key }: TermSpec): { start: Date; end: Date } {
  const endOf = (y: number, m: number, d: number) =>
    new Date(y, m, d, 23, 59, 59, 999);
  switch (key) {
    case 'S1':
      return { start: new Date(year, 3, 1), end: endOf(year, 4, 31) };
    case 'S2':
      return { start: new Date(year, 5, 1), end: endOf(year, 6, 31) };
    case 'S':
      return { start: new Date(year, 3, 1), end: endOf(year, 6, 31) };
    case 'A1':
      return { start: new Date(year, 8, 25), end: endOf(year, 10, 30) };
    case 'A2':
      return { start: new Date(year, 11, 1), end: endOf(year + 1, 1, 5) };
    case 'A':
      return { start: new Date(year, 8, 25), end: endOf(year + 1, 1, 5) };
  }
}

// Pick the term that contains `date`, or the next upcoming term if between.
export function currentOrNextTerm(date: Date = new Date()): TermSpec {
  const y = date.getFullYear();
  const candidates: TermSpec[] = [
    { year: y - 1, key: 'A2' },
    { year: y, key: 'S1' },
    { year: y, key: 'S2' },
    { year: y, key: 'A1' },
    { year: y, key: 'A2' },
    { year: y + 1, key: 'S1' },
  ];
  for (const c of candidates) {
    const r = termRange(c);
    if (date >= r.start && date <= r.end) return c;
  }
  for (const c of candidates) {
    const r = termRange(c);
    if (date < r.start) return c;
  }
  return { year: y, key: 'S' };
}

export function filterEventsByTerm(events: CalendarEvent[], term: TermSpec): CalendarEvent[] {
  const { start, end } = termRange(term);
  const startMs = start.getTime();
  const endMs = end.getTime();
  return events.filter((e) => {
    const t = new Date(e.start).getTime();
    return t >= startMs && t <= endMs;
  });
}

export function splitTermKey(key: TermKey): [Semester, TermPart] {
  if (key === 'S' || key === 'A') return [key, ''];
  return [key[0] as Semester, key[1] as TermPart];
}

export function joinTermKey(semester: Semester, part: TermPart): TermKey {
  if (part === '') return semester;
  return `${semester}${part}` as TermKey;
}

// Calendar years offered in the year selector — events range plus current term year.
export function listTermYears(events: CalendarEvent[]): number[] {
  const years = new Set<number>();
  years.add(currentOrNextTerm().year);
  for (const e of events) {
    years.add(new Date(e.start).getFullYear());
  }
  return [...years].sort((a, b) => b - a);
}

// A course is shown unless every one of its source events is hidden.
export function isCourseVisible(course: Course): boolean {
  return course.sourceEvents.some((e) => e.visible);
}

// The event whose color the timetable paints a course with.
export function courseColorSource(course: Course): CalendarEvent {
  return course.sourceEvents[0] ?? course.latestEvent;
}

export function visibleCourseColorSources(matrix: TimetableMatrix): CalendarEvent[] {
  return [...matrix.values()].flat().filter(isCourseVisible).map(courseColorSource);
}

export interface CellOverview {
  weekday: TimetableWeekday;
  period: Period;
  visibleCourses: Course[];
  hiddenCourses: Course[];
}

// Split a cell's courses into visible/hidden based on whether all source events are hidden.
// Caller passes a matrix built from all events (visible + hidden) so the matrix can be
// shared across cell selections.
export function buildCellOverview(
  matrix: TimetableMatrix,
  weekday: TimetableWeekday,
  period: Period,
): CellOverview {
  const courses = matrix.get(cellKey(weekday, period.index)) ?? [];
  const visibleCourses: Course[] = [];
  const hiddenCourses: Course[] = [];
  for (const c of courses) {
    if (isCourseVisible(c)) visibleCourses.push(c);
    else hiddenCourses.push(c);
  }
  return { weekday, period, visibleCourses, hiddenCourses };
}

export function formatPeriodTime(p: Period): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h1 = Math.floor(p.startMinutes / 60);
  const m1 = p.startMinutes % 60;
  const h2 = Math.floor(p.endMinutes / 60);
  const m2 = p.endMinutes % 60;
  return `${pad(h1)}:${pad(m1)}–${pad(h2)}:${pad(m2)}`;
}
