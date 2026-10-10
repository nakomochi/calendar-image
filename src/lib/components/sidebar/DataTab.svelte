<script lang="ts">
  import { events, hiddenEvents } from '$lib/stores';
  import ImportSection from './ImportSection.svelte';
  import HiddenEventsSection from './HiddenEventsSection.svelte';

  interface Props {
    onclickDay: (date: Date) => void;
    onloaded?: () => void;
  }

  let { onclickDay, onloaded }: Props = $props();
</script>

<ImportSection {onloaded} />

{#if $events.length > 0}
  <p class="text-xs text-gray-500">全 {$events.length} 件 / 非表示 {$hiddenEvents.length} 件</p>
{/if}

{#if $hiddenEvents.length > 0}
  <HiddenEventsSection {onclickDay} />
{/if}
