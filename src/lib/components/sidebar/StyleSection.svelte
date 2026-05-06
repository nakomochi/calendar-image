<script lang="ts">
  import { style, viewType } from '$lib/stores';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">スタイル</h3>

  <label class="flex items-center justify-between text-xs">
    <span>背景色</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.bgColor} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>文字色</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.textColor} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>ヘッダー背景</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.headerBgColor} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>ヘッダー文字</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.headerTextColor} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>予定の色</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.eventDefaultColor} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>罫線</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.gridLineColor} />
  </label>
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
</div>
