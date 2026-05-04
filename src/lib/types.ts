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

export type ViewType = 'grid' | 'timeline' | 'list';

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
  highlightToday: boolean;
  fontFamily: string;
  borderRadius: number;
  eventSizing: EventSizing;
  eventFixedSize: number;
  eventAlign: EventAlign;
  dateFontSize: number;
  eventFontSize: number;
}

export interface ViewRange {
  start: string; // 'YYYY-MM-DD'
  end: string;
  grayout: boolean;
  startTime: string; // 'HH:mm' (timeline only)
  endTime: string;
}

export const DEFAULT_VIEW_RANGE: ViewRange = {
  start: '',
  end: '',
  grayout: false,
  startTime: '00:00',
  endTime: '24:00',
};

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
  highlightToday: true,
  fontFamily: "'Noto Sans JP', sans-serif",
  borderRadius: 8,
  eventSizing: 'equal',
  eventFixedSize: 20,
  eventAlign: 'start',
  dateFontSize: 12,
  eventFontSize: 10,
};

export const DEFAULT_EXPORT: ExportSettings = {
  format: 'png',
  width: 1200,
  height: 900,
};

export type EventField = 'startTime' | 'endTime' | 'title' | 'location' | 'allDayLabel';

export type RowItem =
  | { type: 'field'; field: EventField }
  | { type: 'text'; text: string };

export interface RowConfig {
  items: RowItem[];
  fontSize?: number;
  bold?: boolean;
}

export interface EventDisplayConfig {
  rows: RowConfig[];
  hidden: EventField[];
  allDayMode: 'label' | 'omit';
}

export const DEFAULT_EVENT_DISPLAY: EventDisplayConfig = {
  rows: [
    {
      items: [
        { type: 'field', field: 'startTime' },
        { type: 'text', text: ' ' },
        { type: 'field', field: 'title' },
      ],
      bold: true,
    },
    {
      items: [{ type: 'field', field: 'location' }],
    },
  ],
  hidden: ['endTime', 'allDayLabel'],
  allDayMode: 'label',
};

export const EVENT_FIELD_LABELS: Record<EventField, string> = {
  startTime: '開始時刻',
  endTime: '終了時刻',
  title: 'タイトル',
  location: '場所',
  allDayLabel: '終日ラベル',
};
