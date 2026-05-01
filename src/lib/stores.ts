import { writable, derived } from 'svelte/store';
import type { CalendarEvent, CalendarStyle, ExportSettings, ViewType, ViewRange } from './types';
import { DEFAULT_STYLE, DEFAULT_EXPORT, DEFAULT_VIEW_RANGE } from './types';

export const events = writable<CalendarEvent[]>([]);
export const style = writable<CalendarStyle>({ ...DEFAULT_STYLE });
export const viewType = writable<ViewType>('grid');
export const viewRange = writable<ViewRange>({ ...DEFAULT_VIEW_RANGE });
export const exportSettings = writable<ExportSettings>({ ...DEFAULT_EXPORT });

export const visibleEvents = derived(events, ($events) =>
  $events.filter((e) => e.visible)
);
