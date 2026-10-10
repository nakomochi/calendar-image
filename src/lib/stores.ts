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
  SidebarTab,
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
import { persisted, isPlainObject } from './persist';

const VIEW_TYPES: ReadonlyArray<ViewType> = ['grid', 'timeline', 'list', 'timetable'];

function validateViewType(_initial: ViewType, saved: unknown): ViewType | null {
  return VIEW_TYPES.includes(saved as ViewType) ? (saved as ViewType) : null;
}

// Rows/hidden are replaced wholesale (no shallow merge) since a partial config
// would be meaningless; anything malformed falls back to the default.
function validateEventDisplay(_initial: EventDisplayConfig, saved: unknown): EventDisplayConfig | null {
  if (!isPlainObject(saved)) return null;
  const { rows, hidden, allDayMode } = saved;
  if (!Array.isArray(rows) || !Array.isArray(hidden)) return null;
  if (allDayMode !== 'label' && allDayMode !== 'omit') return null;
  return saved as unknown as EventDisplayConfig;
}

// Persisted user preferences (localStorage). Event data, date range, timetable
// term and the ICS URL are intentionally session-only.
export const style = persisted<CalendarStyle>('style', { ...DEFAULT_STYLE });
export const viewType = persisted<ViewType>('viewType', 'grid', { merge: validateViewType });
export const timeRange = persisted<TimeRange>('timeRange', { ...DEFAULT_TIME_RANGE });
export const exportSettings = persisted<ExportSettings>('exportSize', { ...DEFAULT_EXPORT });
export const eventDisplay = persisted<EventDisplayConfig>(
  'eventDisplay',
  structuredClone(DEFAULT_EVENT_DISPLAY),
  { merge: validateEventDisplay },
);
export const timetableEventDisplay = persisted<EventDisplayConfig>(
  'timetableEventDisplay',
  structuredClone(DEFAULT_TIMETABLE_DISPLAY),
  { merge: validateEventDisplay },
);

export const events = writable<CalendarEvent[]>([]);
export const dateRange = writable<DateRange>({ ...DEFAULT_DATE_RANGE });

export const visibleEvents = derived(events, ($events) =>
  $events.filter((e) => e.visible)
);

export const hiddenEvents = derived(events, ($events) =>
  $events.filter((e) => !e.visible)
);

export const utokyoMode = writable<boolean>(false);

// Kept in stores so the canvas empty state and toolbar can drive the sidebar/preview.
export const sidebarTab = writable<SidebarTab>('data');
export const previewFit = writable<boolean>(true);

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
