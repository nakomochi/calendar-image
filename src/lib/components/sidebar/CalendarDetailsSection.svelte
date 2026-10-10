<script lang="ts">
  import { style, viewType } from '$lib/stores';
  import CollapsibleSection from '../ui/CollapsibleSection.svelte';

  const WEEKDAY_OPTIONS = [
    { value: 'ja1', label: '日本語 (日月火)' },
    { value: 'ja-full', label: '日本語フル (日曜日)' },
    { value: 'en1', label: '英語1字 (S M T)' },
    { value: 'en3', label: '英語3字 (SUN MON)' },
    { value: 'en-full', label: '英語フル (Sunday)' },
  ] as const;

  const WEEKEND_OPTIONS = [
    { value: 'none', label: 'なし' },
    { value: 'traditional', label: '日=赤・土=青' },
  ] as const;

  const TODAY_OPTIONS = [
    { value: 'bg', label: 'セル背景' },
    { value: 'circle', label: '数字を丸で囲む' },
    { value: 'bold', label: '数字を太字＋色' },
    { value: 'badge', label: '「今日」ラベル' },
  ] as const;

  const DATE_ALIGN_OPTIONS = [
    { value: 'top-left', label: '左上' },
    { value: 'top-right', label: '右上' },
    { value: 'center-large', label: '中央・大 (壁掛け風)' },
  ] as const;

  // Timetable has no dates and no today marker; only weekday format / weekend
  // coloring apply there.
  let isTimetable = $derived($viewType === 'timetable');
</script>

<CollapsibleSection title="今日・曜日">
  {#if !isTimetable}
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">今日</h4>
      <label class="flex items-center gap-2 text-xs">
        <input type="checkbox" class="checkbox checkbox-xs" bind:checked={$style.highlightToday} />
        <span>ハイライトする</span>
      </label>
      <label
        class="flex items-center justify-between text-xs gap-2"
        class:opacity-50={!$style.highlightToday}
      >
        <span class="shrink-0">表示方法</span>
        <select
          class="select select-bordered select-xs flex-1 min-w-0"
          bind:value={$style.todayMarker}
          disabled={!$style.highlightToday}
        >
          {#each TODAY_OPTIONS as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>
      <label
        class="flex items-center justify-between text-xs gap-2"
        class:opacity-50={!$style.highlightToday || $style.todayMarker !== 'bg'}
      >
        <span class="shrink-0">背景色</span>
        <input
          type="color"
          class="w-8 h-6 cursor-pointer rounded"
          bind:value={$style.todayBgColor}
          disabled={!$style.highlightToday || $style.todayMarker !== 'bg'}
        />
      </label>
    </div>
  {/if}

  <div class="space-y-2" class:pt-2={!isTimetable} class:border-t={!isTimetable} class:border-base-300={!isTimetable}>
    <label class="flex items-center justify-between text-xs gap-2">
      <span class="shrink-0">曜日表記</span>
      <select class="select select-bordered select-xs flex-1 min-w-0" bind:value={$style.weekdayFormat}>
        {#each WEEKDAY_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>

    <label class="flex items-center justify-between text-xs gap-2">
      <span class="shrink-0">週末の色分け</span>
      <select class="select select-bordered select-xs flex-1 min-w-0" bind:value={$style.weekendStyle}>
        {#each WEEKEND_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </label>

    {#if !isTimetable}
      <label class="flex items-center justify-between text-xs gap-2">
        <span class="shrink-0">日付の位置</span>
        <select class="select select-bordered select-xs flex-1 min-w-0" bind:value={$style.dateAlign}>
          {#each DATE_ALIGN_OPTIONS as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>
    {/if}
  </div>

  <p class="text-[10px] text-gray-400 leading-relaxed">
    テーマ側で指定した値の上書きに使えます。テーマを切り替えると各テーマの推奨値に戻ります。
  </p>
</CollapsibleSection>
