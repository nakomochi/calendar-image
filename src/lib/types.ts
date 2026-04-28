export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description: string;
  location: string;
  visible: boolean;
  color: string;
}

export type ViewType = 'month' | 'week' | 'day' | 'list';

export type EventSizing = 'equal' | 'fixed';
export type EventAlign = 'start' | 'center';

export interface CalendarStyle {
  bgColor: string;
  textColor: string;
  headerBgColor: string;
  headerTextColor: string;
  eventDefaultColor: string;
  gridLineColor: string;
  todayBgColor: string;
  fontFamily: string;
  borderRadius: number;
  eventSizing: EventSizing;
  eventFixedSize: number;
  eventAlign: EventAlign;
}

export interface ExportSettings {
  format: 'png' | 'jpg';
  width: number;
  height: number;
}

export const DEFAULT_STYLE: CalendarStyle = {
  bgColor: '#ffffff',
  textColor: '#1f2937',
  headerBgColor: '#3b82f6',
  headerTextColor: '#ffffff',
  eventDefaultColor: '#3b82f6',
  gridLineColor: '#e5e7eb',
  todayBgColor: '#eff6ff',
  fontFamily: "'Noto Sans JP', sans-serif",
  borderRadius: 8,
  eventSizing: 'equal',
  eventFixedSize: 20,
  eventAlign: 'start',
};

export const DEFAULT_EXPORT: ExportSettings = {
  format: 'png',
  width: 1200,
  height: 900,
};
