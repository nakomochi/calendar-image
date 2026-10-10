<script lang="ts">
  import { sidebarTab } from '$lib/stores';
  import DataTab from './DataTab.svelte';
  import LayoutTab from './LayoutTab.svelte';
  import DesignTab from './DesignTab.svelte';
  import { SIDEBAR_PANEL_ID, sidebarTabId } from './tabs';

  interface Props {
    onclickDay: (date: Date) => void;
    // Called after an ICS import succeeds.
    onloaded?: () => void;
    class?: string;
  }

  let { onclickDay, onloaded, class: className = '' }: Props = $props();
</script>

<div
  id={SIDEBAR_PANEL_ID}
  role="tabpanel"
  aria-labelledby={sidebarTabId($sidebarTab)}
  class="overflow-y-auto p-4 pt-1 space-y-5 {className}"
>
  {#if $sidebarTab === 'data'}
    <DataTab {onclickDay} {onloaded} />
  {:else if $sidebarTab === 'layout'}
    <LayoutTab />
  {:else}
    <DesignTab />
  {/if}
</div>
