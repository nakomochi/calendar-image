<script lang="ts">
  import { eventDisplay, style } from '$lib/stores';
  import { DEFAULT_EVENT_DISPLAY } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';

  let open = $state(false);
</script>

<div class="space-y-2">
  <button
    type="button"
    class="flex items-center gap-1 font-bold text-sm w-full text-left cursor-pointer"
    onclick={() => (open = !open)}
  >
    <span class="text-xs">{open ? '▼' : '▶'}</span>
    <span>予定の表示</span>
  </button>

  {#if open}
    <div class="space-y-3 pl-1">
      <EventDisplayEditor store={eventDisplay} defaultConfig={DEFAULT_EVENT_DISPLAY} hideHeading />

      <div class="space-y-2 pt-2 border-t border-base-300">
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">サイズと配置</h4>
        <label class="flex items-center justify-between text-xs">
          <span>サイズ</span>
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
        <label class="flex items-center justify-between text-xs">
          <span>配置</span>
          <select class="select select-bordered select-xs" bind:value={$style.eventAlign}>
            <option value="start">上揃え</option>
            <option value="center">中央揃え</option>
          </select>
        </label>
      </div>
    </div>
  {/if}
</div>
