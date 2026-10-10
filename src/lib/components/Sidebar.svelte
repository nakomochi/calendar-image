<script lang="ts">
  import { sidebarTab, utokyoMode } from '$lib/stores';
  import type { SidebarTab } from '$lib/types';
  import DataTab from './sidebar/DataTab.svelte';
  import LayoutTab from './sidebar/LayoutTab.svelte';
  import DesignTab from './sidebar/DesignTab.svelte';

  interface Props {
    onclickDay: (date: Date) => void;
  }

  let { onclickDay }: Props = $props();

  const TABS: { id: SidebarTab; label: string }[] = [
    { id: 'data', label: 'データ' },
    { id: 'layout', label: 'レイアウト' },
    { id: 'design', label: 'デザイン' },
  ];

  const PANEL_ID = 'sidebar-tabpanel';
</script>

<aside class="w-90 bg-base-200 flex flex-col h-full shrink-0">
  <div class="px-4 pt-4 pb-3 space-y-3 shrink-0">
    <div class="flex items-center gap-2">
      <a href="/" class="font-bold">Calendar Image</a>
      {#if $utokyoMode}
        <span class="badge badge-sm">東大 時間割</span>
      {/if}
    </div>

    <div role="tablist" aria-label="設定" class="tabs tabs-box tabs-sm">
      {#each TABS as tab (tab.id)}
        <button
          type="button"
          role="tab"
          id="sidebar-tab-{tab.id}"
          class="tab flex-1"
          class:tab-active={$sidebarTab === tab.id}
          aria-selected={$sidebarTab === tab.id}
          aria-controls={PANEL_ID}
          onclick={() => sidebarTab.set(tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  <div
    id={PANEL_ID}
    role="tabpanel"
    aria-labelledby="sidebar-tab-{$sidebarTab}"
    class="flex-1 overflow-y-auto p-4 pt-1 space-y-5"
  >
    {#if $sidebarTab === 'data'}
      <DataTab {onclickDay} />
    {:else if $sidebarTab === 'layout'}
      <LayoutTab />
    {:else}
      <DesignTab />
    {/if}
  </div>
</aside>
