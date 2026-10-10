<script lang="ts">
  import { sidebarTab, sheetOpen, openSidebarTab } from '$lib/stores';
  import type { SidebarTab } from '$lib/types';
  import { SIDEBAR_TABS, SIDEBAR_TAB_LABELS, SIDEBAR_PANEL_ID, sidebarTabId } from './tabs';

  interface Props {
    // 'box': desktop sidebar tabs (panel always visible).
    // 'bar': mobile bottom bar; tabs also open/close the bottom sheet.
    variant: 'box' | 'bar';
  }

  let { variant }: Props = $props();

  let panelVisible = $derived(variant === 'box' || $sheetOpen);

  function select(tab: SidebarTab) {
    if (variant === 'box') sidebarTab.set(tab);
    else if ($sheetOpen && $sidebarTab === tab) sheetOpen.set(false);
    else openSidebarTab(tab);
  }
</script>

<div
  role="tablist"
  aria-label="設定"
  class={variant === 'box' ? 'tabs tabs-box tabs-sm' : 'grid grid-cols-3'}
>
  {#each SIDEBAR_TABS as tab (tab)}
    {@const selected = panelVisible && $sidebarTab === tab}
    <button
      type="button"
      role="tab"
      id={sidebarTabId(tab)}
      class={variant === 'box'
        ? ['tab flex-1', selected && 'tab-active']
        : [
            'h-12 text-sm border-t-2 transition-colors',
            selected ? 'border-primary text-primary font-bold' : 'border-transparent text-base-content/70',
          ]}
      aria-selected={selected}
      aria-controls={panelVisible ? SIDEBAR_PANEL_ID : undefined}
      onclick={() => select(tab)}
    >
      {SIDEBAR_TAB_LABELS[tab]}
    </button>
  {/each}
</div>
