import type { CalendarEvent, DateRange, EventDisplayConfig, EventField, TimeRange, WeekdayFormat } from '../types';

export function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days: Date[] = [];

  // Fill leading days from previous month
  for (let i = startDay; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Days of current month
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDate; d++) {
    days.push(new Date(year, month, d));
  }

  // Fill trailing days to complete 6 rows
  while (days.length < 42) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }

  return days;
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return start < dayEnd && end > dayStart;
  });
}

// Ids of events titled `title` (compared trimmed). Untitled events never match.
export function eventIdsWithTitle(events: CalendarEvent[], title: string): Set<string> {
  const key = title.trim();
  if (!key) return new Set();
  return new Set(events.filter((e) => e.title.trim() === key).map((e) => e.id));
}

export function getEventsForWeek(events: CalendarEvent[], weekStart: Date): CalendarEvent[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return events.filter((e) => {
    const start = new Date(e.start);
    const end = new Date(e.end);
    return start < weekEnd && end > weekStart;
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
}

// Format day label: "M/D" for 1st of month or first visible cell, "D" otherwise
export function formatDayLabel(day: Date, isFirstCell: boolean): string {
  if (day.getDate() === 1 || isFirstCell) {
    return `${day.getMonth() + 1}/${day.getDate()}`;
  }
  return `${day.getDate()}`;
}

const WEEKDAY_LABELS: Record<WeekdayFormat, readonly string[]> = {
  'ja1': ['日', '月', '火', '水', '木', '金', '土'],
  'ja-full': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  'en1': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  'en3': ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  'en-full': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export function getWeekdayLabel(index: number, format: WeekdayFormat = 'ja1'): string {
  return WEEKDAY_LABELS[format][index];
}

export function getHourLabels(): string[] {
  return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
}

export function parseDateRange(range: DateRange): { start: Date | null; end: Date | null } {
  if (!range.start || !range.end) return { start: null, end: null };
  return {
    start: new Date(range.start),
    end: new Date(range.end),
  };
}

export function hasValidRange(range: DateRange): boolean {
  return !!range.start && !!range.end;
}

export function isDayInRange(day: Date, range: DateRange): boolean {
  const { start, end } = parseDateRange(range);
  if (!start || !end) return true;
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  return dayStart < end && dayEnd > start;
}

export function eventOverlapsRange(ev: CalendarEvent, range: DateRange): boolean {
  const { start, end } = parseDateRange(range);
  if (!start || !end) return true;
  return new Date(ev.start) < end && new Date(ev.end) > start;
}

export function getRangeDays(range: DateRange): Date[] {
  const { start, end } = parseDateRange(range);
  if (!start || !end) return [];
  const days: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (current <= endDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Build grid that covers the range, padded to full weeks
export function getRangeGridDays(range: DateRange): Date[] {
  const { start, end } = parseDateRange(range);
  if (!start || !end) return [];

  const firstDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  // Pad to week boundaries
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const gridEnd = new Date(lastDay);
  if (gridEnd.getDay() !== 6) {
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
  }

  const days: Date[] = [];
  const current = new Date(gridStart);
  while (current <= gridEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Fallback: current month grid when no range is set
export function getCurrentMonthGrid(): Date[] {
  const now = new Date();
  return getMonthDays(now.getFullYear(), now.getMonth());
}

export function getTimeRangeHours(range: TimeRange): { startHour: number; endHour: number } {
  const [sh, sm] = range.startTime.split(':').map(Number);
  const [eh, em] = range.endTime.split(':').map(Number);
  const startHour = sh + sm / 60;
  const endHour = eh + em / 60;
  if (startHour >= endHour) return { startHour: 0, endHour: 24 };
  return { startHour, endHour };
}

export interface LayoutedEvent {
  event: CalendarEvent;
  column: number;
  totalColumns: number;
}

function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function layoutEvents(events: CalendarEvent[]): LayoutedEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Build overlap groups using union-find approach
  const groupMap = new Map<string, number>();
  const groups: CalendarEvent[][] = [];

  for (const ev of sorted) {
    let assignedGroup = -1;
    for (let g = 0; g < groups.length; g++) {
      if (groups[g].some((other) => eventsOverlap(ev, other))) {
        if (assignedGroup === -1) {
          assignedGroup = g;
          groups[g].push(ev);
        } else {
          // Merge groups
          groups[assignedGroup].push(...groups[g]);
          groups.splice(g, 1);
          g--;
        }
      }
    }
    if (assignedGroup === -1) {
      groups.push([ev]);
    }
  }

  const result: LayoutedEvent[] = [];

  for (const group of groups) {
    group.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Assign columns greedily
    const columns: CalendarEvent[][] = [];
    for (const ev of group) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const lastInCol = columns[c][columns[c].length - 1];
        if (!eventsOverlap(ev, lastInCol)) {
          columns[c].push(ev);
          groupMap.set(ev.id, c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groupMap.set(ev.id, columns.length);
        columns.push([ev]);
      }
    }

    const totalColumns = columns.length;
    for (const ev of group) {
      result.push({
        event: ev,
        column: groupMap.get(ev.id)!,
        totalColumns,
      });
    }
  }

  return result;
}

export interface EventRow {
  text: string;
  hasTitle: boolean;
  fontSize?: number;
  bold: boolean;
}

function resolveField(ev: CalendarEvent, field: EventField, allDayMode: 'label' | 'omit'): string {
  if (ev.allDay) {
    if (allDayMode === 'omit') {
      if (field === 'startTime' || field === 'endTime' || field === 'allDayLabel') return '';
    } else {
      if (field === 'startTime' || field === 'endTime') return '';
      if (field === 'allDayLabel') return '終日';
    }
  } else {
    if (field === 'allDayLabel') return '';
  }

  switch (field) {
    case 'startTime':
      return formatTime(new Date(ev.start));
    case 'endTime':
      return formatTime(new Date(ev.end));
    case 'title':
      return ev.title;
    case 'location':
      return ev.location;
    case 'description':
      return ev.description;
  }
}

export function buildEventRows(ev: CalendarEvent, config: EventDisplayConfig): EventRow[] {
  const result: EventRow[] = [];
  for (const row of config.rows) {
    let text = '';
    let hasTitle = false;
    let hasField = false;
    let anyFieldRendered = false;
    for (const item of row.items) {
      if (item.type === 'field') {
        hasField = true;
        const v = resolveField(ev, item.field, config.allDayMode);
        if (v) {
          anyFieldRendered = true;
          if (item.field === 'title') hasTitle = true;
        }
        text += v;
      } else {
        text += item.text;
      }
    }
    text = text.trim();
    if (!text) continue;
    if (hasField && !anyFieldRendered) continue;
    result.push({
      text,
      hasTitle,
      fontSize: row.fontSize,
      bold: row.bold ?? hasTitle,
    });
  }
  return result;
}
