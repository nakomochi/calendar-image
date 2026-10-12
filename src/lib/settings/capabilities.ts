import type { ExplainMode, ViewType } from '$lib/types';

// The summary list describes dated events, which the timetable doesn't show.
export function explainModes(view: ViewType): ReadonlyArray<ExplainMode> {
  return view === 'timetable' ? ['none', 'legend'] : ['none', 'legend', 'list'];
}

// Sections shown in the sidebar's Layout tab for each view. Design settings live
// in the Design tab and apply to every view, so they are not listed here.
// Order in each array is the render order.
export type LayoutModule =
  | 'annotations'
  | 'dateRange'
  | 'timeRange'
  | 'timetableConfig'
  | 'eventDisplay'
  | 'timetableEventDisplay';

export const LAYOUT_MODULES: Record<ViewType, ReadonlyArray<LayoutModule>> = {
  grid:      ['annotations', 'dateRange', 'eventDisplay'],
  timeline:  ['annotations', 'dateRange', 'timeRange', 'eventDisplay'],
  list:      ['annotations', 'dateRange', 'eventDisplay'],
  timetable: ['annotations', 'timetableConfig', 'timetableEventDisplay'],
};
