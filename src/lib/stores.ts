import { writable, derived } from 'svelte/store';
import type { CalendarEvent, CalendarStyle, ExportSettings, ViewType } from './types';
import { DEFAULT_STYLE, DEFAULT_EXPORT } from './types';

export const events = writable<CalendarEvent[]>([]);
export const style = writable<CalendarStyle>({ ...DEFAULT_STYLE });
export const viewType = writable<ViewType>('month');
export const currentDate = writable<Date>(new Date());
export const exportSettings = writable<ExportSettings>({ ...DEFAULT_EXPORT });

export const visibleEvents = derived(events, ($events) =>
  $events.filter((e) => e.visible)
);
