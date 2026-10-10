<script lang="ts">
  import { style, viewType } from '$lib/stores';
  import CollapsibleSection from '../ui/CollapsibleSection.svelte';
</script>

<CollapsibleSection title="文字と形">
  <label class="flex items-center justify-between text-xs">
    <span>角丸</span>
    <input type="range" class="range range-xs range-primary w-24" min="0" max="24" bind:value={$style.borderRadius} />
  </label>
  {#if $viewType !== 'timetable'}
    <label class="flex items-center justify-between text-xs">
      <span>日付文字サイズ</span>
      <input type="number" class="input input-bordered input-xs w-20" min="6" max="48" bind:value={$style.dateFontSize} />
    </label>
  {/if}
  <label class="flex items-center justify-between text-xs">
    <span>予定文字サイズ</span>
    <input type="number" class="input input-bordered input-xs w-20" min="6" max="48" bind:value={$style.eventFontSize} />
  </label>
</CollapsibleSection>
