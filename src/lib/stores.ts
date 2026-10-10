import { writable, derived } from 'svelte/store';
import type {
  CalendarEvent,
  CalendarStyle,
  ExportSettings,
  ViewType,
  DateRange,
  TimeRange,
  EventDisplayConfig,
  TimetableConfig,
} from './types';
import {
  DEFAULT_STYLE,
  DEFAULT_EXPORT,
  DEFAULT_DATE_RANGE,
  DEFAULT_TIME_RANGE,
  DEFAULT_EVENT_DISPLAY,
  DEFAULT_TIMETABLE_DISPLAY,
} from './types';
import { currentOrNextTerm, splitTermKey } from './calendar/timetable';

export const events = writable<CalendarEvent[]>([]);
export const style = writable<CalendarStyle>({ ...DEFAULT_STYLE });
export const viewType = writable<ViewType>('grid');
export const dateRange = writable<DateRange>({ ...DEFAULT_DATE_RANGE });
export const timeRange = writable<TimeRange>({ ...DEFAULT_TIME_RANGE });
export const exportSettings = writable<ExportSettings>({ ...DEFAULT_EXPORT });
export const eventDisplay = writable<EventDisplayConfig>(structuredClone(DEFAULT_EVENT_DISPLAY));
export const timetableEventDisplay = writable<EventDisplayConfig>(structuredClone(DEFAULT_TIMETABLE_DISPLAY));

export const visibleEvents = derived(events, ($events) =>
  $events.filter((e) => e.visible)
);

export const hiddenEvents = derived(events, ($events) =>
  $events.filter((e) => !e.visible)
);

export const utokyoMode = writable<boolean>(false);

// Right-side theme panel — kept in a store so the sidebar can open it from
// anywhere without threading callbacks through view-specific section wrappers.
export const themePanelOpen = writable<boolean>(false);

export function patchEvents(ids: ReadonlySet<string>, patch: Partial<CalendarEvent>) {
  events.update((evts) => evts.map((e) => (ids.has(e.id) ? { ...e, ...patch } : e)));
}

function buildDefaultTimetableConfig(): TimetableConfig {
  const t = currentOrNextTerm();
  const [semester, part] = splitTermKey(t.key);
  return {
    showSaturday: false,
    showPeriod6: false,
    termYear: t.year,
    termSemester: semester,
    termPart: part,
  };
}

export const timetableConfig = writable<TimetableConfig>(buildDefaultTimetableConfig());
