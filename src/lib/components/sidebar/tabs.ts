import type { SidebarTab } from '$lib/types';

export const SIDEBAR_TAB_LABELS: Record<SidebarTab, string> = {
  data: 'データ',
  layout: 'レイアウト',
  design: 'デザイン',
};

export const SIDEBAR_TABS = Object.keys(SIDEBAR_TAB_LABELS) as SidebarTab[];

export const SIDEBAR_PANEL_ID = 'sidebar-tabpanel';

export function sidebarTabId(tab: SidebarTab): string {
  return `sidebar-tab-${tab}`;
}
