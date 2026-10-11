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

export type ViewType = 'grid' | 'timeline' | 'list' | 'timetable';

export type EventSizing = 'equal' | 'fixed';
export type EventAlign = 'start' | 'center';
export type EventShape = 'fill' | 'outline' | 'left-bar';
export type HeaderStyle = 'solid' | 'minimal' | 'underline';
export type BorderStyle = 'solid' | 'dashed' | 'none';
export type WeekdayFormat = 'ja1' | 'ja-full' | 'en1' | 'en3' | 'en-full';
// 'traditional' colors the header (and cell date numbers) Sun=red, Sat=blue —
// the Japanese wall-calendar convention.
export type WeekendStyle = 'none' | 'traditional';
// 'bg'    — current: fill the whole cell with todayBgColor
// 'circle'— wrap the date number in a filled circle (Apple-like)
// 'bold'  — thicken and recolor just the number
// 'badge' — append a small "今日" pill next to the number
export type TodayMarker = 'bg' | 'circle' | 'bold' | 'badge';
export type DateAlign = 'top-left' | 'top-right' | 'center-large';

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
  eventShape: EventShape;
  headerStyle: HeaderStyle;
  borderStyle: BorderStyle;
  cellGap: number;
  weekdayFormat: WeekdayFormat;
  weekendStyle: WeekendStyle;
  todayMarker: TodayMarker;
  dateAlign: DateAlign;
}

export interface DateRange {
  start: string; // 'YYYY-MM-DD'
  end: string;
  grayout: boolean;
}

export interface TimeRange {
  startTime: string; // 'HH:mm'
  endTime: string;
}

export const DEFAULT_DATE_RANGE: DateRange = {
  start: '',
  end: '',
  grayout: false,
};

export const DEFAULT_TIME_RANGE: TimeRange = {
  startTime: '08:00',
  endTime: '22:00',
};

// Text drawn around the calendar. Content (like events), so it is not persisted.
export interface CalendarAnnotations {
  subtitle: string; // small line above the title, e.g. organization name
  title: string;
  note: string; // footer line below the calendar
  titleSize: number; // px
  showLegend: boolean;
  legendLabels: Record<string, string>; // lowercase '#rrggbb' -> label
}

export const DEFAULT_ANNOTATIONS: CalendarAnnotations = {
  subtitle: '',
  title: '',
  note: '',
  titleSize: 28,
  showLegend: false,
  legendLabels: {},
};

export interface LegendItem {
  color: string;
  label: string;
}

export type SidebarTab = 'data' | 'layout' | 'design';

export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pptx' | 'html';

// Output canvas size in CSS pixels. The preview renders at exactly this size.
export interface ExportSettings {
  width: number;
  height: number;
}

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'standard', label: '標準 4:3', width: 1200, height: 900 },
  { id: 'wide', label: 'スライド 16:9', width: 1600, height: 900 },
  { id: 'a4-landscape', label: 'A4 横', width: 1123, height: 794 },
  { id: 'a4-portrait', label: 'A4 縦', width: 794, height: 1123 },
  { id: 'square', label: '正方形', width: 1080, height: 1080 },
  { id: 'phone', label: 'スマホ壁紙', width: 390, height: 844 },
];

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
  eventShape: 'fill',
  headerStyle: 'solid',
  borderStyle: 'solid',
  cellGap: 0,
  weekdayFormat: 'ja1',
  weekendStyle: 'none',
  todayMarker: 'bg',
  dateAlign: 'top-left',
};

export const DEFAULT_EXPORT: ExportSettings = {
  width: 1200,
  height: 900,
};

export type Semester = 'S' | 'A';
// '' = whole semester, '1' = S1/A1, '2' = S2/A2
export type TermPart = '' | '1' | '2';

export interface TimetableConfig {
  showSaturday: boolean;
  showPeriod6: boolean;
  termYear: number;
  termSemester: Semester;
  termPart: TermPart;
}

export type EventField = 'startTime' | 'endTime' | 'title' | 'location' | 'description' | 'allDayLabel';

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
  hidden: ['endTime', 'description', 'allDayLabel'],
  allDayMode: 'label',
};

// Period times are already in the row header; allDayMode is unused (courses are never all-day).
export const DEFAULT_TIMETABLE_DISPLAY: EventDisplayConfig = {
  rows: [
    { items: [{ type: 'field', field: 'title' }], bold: true },
    { items: [{ type: 'field', field: 'location' }] },
  ],
  hidden: ['startTime', 'endTime', 'description'],
  allDayMode: 'omit',
};

export const EVENT_FIELD_LABELS: Record<EventField, string> = {
  startTime: '開始時刻',
  endTime: '終了時刻',
  title: 'タイトル',
  location: '場所',
  description: '説明',
  allDayLabel: '終日ラベル',
};
