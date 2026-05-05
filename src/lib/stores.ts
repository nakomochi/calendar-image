import { writable, derived } from 'svelte/store';
import type {
  CalendarEvent,
  CalendarStyle,
  ExportSettings,
  ViewType,
  ViewRange,
  EventDisplayConfig,
  TimetableConfig,
} from './types';
import {
  DEFAULT_STYLE,
  DEFAULT_EXPORT,
  DEFAULT_VIEW_RANGE,
  DEFAULT_EVENT_DISPLAY,
} from './types';
import { currentOrNextTerm, splitTermKey } from './calendar/timetable';

export const events = writable<CalendarEvent[]>([]);
export const style = writable<CalendarStyle>({ ...DEFAULT_STYLE });
export const viewType = writable<ViewType>('grid');
export const viewRange = writable<ViewRange>({ ...DEFAULT_VIEW_RANGE });
export const exportSettings = writable<ExportSettings>({ ...DEFAULT_EXPORT });
export const eventDisplay = writable<EventDisplayConfig>(structuredClone(DEFAULT_EVENT_DISPLAY));

export const visibleEvents = derived(events, ($events) =>
  $events.filter((e) => e.visible)
);

export const hiddenEvents = derived(events, ($events) =>
  $events.filter((e) => !e.visible)
);

export const utokyoMode = writable<boolean>(false);

export function patchEvents(ids: ReadonlySet<string>, patch: Partial<CalendarEvent>) {
  events.update((evts) => evts.map((e) => (ids.has(e.id) ? { ...e, ...patch } : e)));
}

function buildDefaultTimetableConfig(): TimetableConfig {
  const t = currentOrNextTerm();
  const [semester, part] = splitTermKey(t.key);
  return {
    showSaturday: true,
    showPeriod6: true,
    termYear: t.year,
    termSemester: semester,
    termPart: part,
  };
}

export const timetableConfig = writable<TimetableConfig>(buildDefaultTimetableConfig());
