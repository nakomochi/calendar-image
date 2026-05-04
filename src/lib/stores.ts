import { writable, derived } from 'svelte/store';
import type { CalendarEvent, CalendarStyle, ExportSettings, ViewType, ViewRange, EventDisplayConfig } from './types';
import { DEFAULT_STYLE, DEFAULT_EXPORT, DEFAULT_VIEW_RANGE, DEFAULT_EVENT_DISPLAY } from './types';

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
