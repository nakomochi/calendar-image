<script lang="ts">
  import { eventDisplay, style } from '$lib/stores';
  import { DEFAULT_EVENT_DISPLAY } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">予定の表示</h3>
  <EventDisplayEditor store={eventDisplay} defaultConfig={DEFAULT_EVENT_DISPLAY} />

  <div class="space-y-2 pt-2 border-t border-base-300">
    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">サイズと配置</h4>
    <label class="flex items-center justify-between text-xs gap-2">
      <span class="shrink-0">サイズ</span>
      <select class="select select-bordered select-xs" bind:value={$style.eventSizing}>
        <option value="equal">均等分割</option>
        <option value="fixed">固定サイズ</option>
      </select>
    </label>
    {#if $style.eventSizing === 'fixed'}
      <label class="flex items-center justify-between text-xs">
        <span>固定サイズ (px)</span>
        <input type="number" class="input input-bordered input-xs w-20" min="10" max="200" bind:value={$style.eventFixedSize} />
      </label>
    {/if}
    <label class="flex items-center justify-between text-xs gap-2">
      <span class="shrink-0">配置</span>
      <select class="select select-bordered select-xs" bind:value={$style.eventAlign}>
        <option value="start">上揃え</option>
        <option value="center">中央揃え</option>
      </select>
    </label>
  </div>
</div>
