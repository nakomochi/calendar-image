<script lang="ts">
  import { slide } from 'svelte/transition';
  import { sidebarTab, sheetOpen } from '$lib/stores';
  import SidebarTabs from '../sidebar/SidebarTabs.svelte';
  import SidebarPanel from '../sidebar/SidebarPanel.svelte';
  import { SIDEBAR_TAB_LABELS } from '../sidebar/tabs';

  interface Props {
    onclickDay: (date: Date) => void;
  }

  let { onclickDay }: Props = $props();

  function close() {
    sheetOpen.set(false);
  }
</script>

<!-- Part of the editor's flex column (not an overlay) so the preview shrinks and stays visible. -->
{#if $sheetOpen}
  <section
    class="bg-base-200 border-t border-base-300 flex flex-col max-h-[55dvh] shrink-0"
    aria-label="設定"
    transition:slide={{ duration: 150 }}
  >
    <div class="flex items-center justify-between pl-4 pr-2 py-1 shrink-0">
      <h2 class="font-bold text-sm">{SIDEBAR_TAB_LABELS[$sidebarTab]}</h2>
      <button type="button" class="btn btn-ghost btn-sm btn-square" aria-label="閉じる" onclick={close}>
        ✕
      </button>
    </div>
    <SidebarPanel {onclickDay} onloaded={close} class="flex-1 min-h-0" />
  </section>
{/if}

<nav class="bg-base-100 border-t border-base-300 shrink-0 pb-[env(safe-area-inset-bottom)]">
  <SidebarTabs variant="bar" />
</nav>
