<script lang="ts">
  import Brand from './editor/Brand.svelte';
  import SidebarTabs from './sidebar/SidebarTabs.svelte';
  import SidebarPanel from './sidebar/SidebarPanel.svelte';

  interface Props {
    onclickDay: (date: Date) => void;
  }

  let { onclickDay }: Props = $props();
</script>

<aside class="w-90 bg-base-200 flex flex-col h-full shrink-0">
  <div class="px-4 pt-4 pb-3 space-y-3 shrink-0">
    <Brand />
    <SidebarTabs variant="box" />
  </div>

  <SidebarPanel {onclickDay} class="flex-1" />
</aside>
