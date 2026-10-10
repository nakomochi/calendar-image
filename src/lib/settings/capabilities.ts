import type { ViewType } from '$lib/types';

// Per-view setting sections rendered between Sidebar's always-shown blocks
// (Import / View Type / Hidden Events / Export). Order in each array is the render order.
export type SettingModule =
  | 'dateRange'
  | 'timeRange'
  | 'timetableConfig'
  | 'style'
  | 'eventDisplay'
  | 'timetableEventDisplay'
  | 'advancedStyle';

export const VIEW_MODULES: Record<ViewType, ReadonlyArray<SettingModule>> = {
  grid:      ['dateRange', 'style', 'eventDisplay', 'advancedStyle'],
  timeline:  ['dateRange', 'timeRange', 'style', 'eventDisplay', 'advancedStyle'],
  list:      ['dateRange', 'style', 'eventDisplay', 'advancedStyle'],
  timetable: ['timetableConfig', 'style', 'timetableEventDisplay', 'advancedStyle'],
};
