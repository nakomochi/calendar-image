import type { ViewType } from '$lib/types';

// Sections shown in the sidebar's Layout tab for each view. Design settings live
// in the Design tab and apply to every view, so they are not listed here.
// Order in each array is the render order.
export type LayoutModule =
  | 'dateRange'
  | 'timeRange'
  | 'timetableConfig'
  | 'eventDisplay'
  | 'timetableEventDisplay';

export const LAYOUT_MODULES: Record<ViewType, ReadonlyArray<LayoutModule>> = {
  grid:      ['dateRange', 'eventDisplay'],
  timeline:  ['dateRange', 'timeRange', 'eventDisplay'],
  list:      ['dateRange', 'eventDisplay'],
  timetable: ['timetableConfig', 'timetableEventDisplay'],
};
