import type { ViewType } from '$lib/types';

// Per-view setting sections rendered between Sidebar's always-shown blocks
// (Import / View Type / Hidden Events / Export). Order in each array is the render order.
export type SettingModule =
  | 'dateRange'
  | 'timeRange'
  | 'timetableConfig'
  | 'style'
  | 'todayHighlight'
  | 'eventDisplay'
  | 'timetableEventDisplay'
  | 'eventBlock';

export const VIEW_MODULES: Record<ViewType, ReadonlyArray<SettingModule>> = {
  grid:      ['dateRange', 'style', 'todayHighlight', 'eventDisplay', 'eventBlock'],
  timeline:  ['dateRange', 'timeRange', 'style', 'todayHighlight', 'eventDisplay', 'eventBlock'],
  list:      ['dateRange', 'style', 'eventDisplay'],
  timetable: ['timetableConfig', 'style', 'timetableEventDisplay'],
};
