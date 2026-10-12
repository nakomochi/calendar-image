<script lang="ts">
  import { annotations, eventDisplay, style, viewType } from '$lib/stores';
  import { DEFAULT_EVENT_DISPLAY, type GridMarks } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';

  const GRID_MARK_OPTIONS: ReadonlyArray<{ value: GridMarks; label: string }> = [
    { value: 'names', label: 'マスに名前' },
    { value: 'dates', label: '日付に印' },
  ];

  // Only the grid can mark dates instead of drawing chips; other views always show chips.
  let markDates = $derived($viewType === 'grid' && $eventDisplay.gridMarks === 'dates');
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">予定の表示</h3>

  {#if $viewType === 'grid'}
    <div class="flex items-center justify-between text-xs gap-2">
      <span class="shrink-0">予定の表示方法</span>
      <div class="join" role="group" aria-label="予定の表示方法">
        {#each GRID_MARK_OPTIONS as opt (opt.value)}
          <button
            type="button"
            class="join-item btn btn-xs"
            class:btn-active={$eventDisplay.gridMarks === opt.value}
            aria-pressed={$eventDisplay.gridMarks === opt.value}
            onclick={() => ($eventDisplay.gridMarks = opt.value)}
          >{opt.label}</button>
        {/each}
      </div>
    </div>
  {/if}

  {#if markDates}
    <p class="text-xs text-base-content/60">予定のある日の数字に色を付けます。</p>
    {#if $annotations.explain === 'none'}
      <div class="rounded-box border border-base-300 bg-base-100 p-2 space-y-1.5">
        <p class="text-xs">名前が見えないので、下に一覧を付けると伝わりやすくなります</p>
        <button type="button" class="btn btn-xs btn-primary" onclick={() => ($annotations.explain = 'list')}>
          一覧を表示する
        </button>
      </div>
    {/if}
  {:else}
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
  {/if}
</div>
