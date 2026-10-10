<script lang="ts">
  import { style, viewType, themePanelOpen } from '$lib/stores';

  let open = $state(false);
</script>

<div class="space-y-2">
  <div class="flex items-center justify-between">
    <button
      type="button"
      class="flex items-center gap-1 font-bold text-sm cursor-pointer"
      onclick={() => (open = !open)}
    >
      <span class="text-xs">{open ? '▼' : '▶'}</span>
      <span>見た目</span>
    </button>
    <button
      type="button"
      class="btn btn-primary btn-xs gap-1"
      onclick={() => themePanelOpen.set(true)}
    >
      <span>🎨</span>
      <span>テーマを適用</span>
    </button>
  </div>

  {#if open}
    <div class="space-y-3 pl-1">
      <div class="space-y-2">
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
      </div>

      <div class="space-y-2 pt-2 border-t border-base-300">
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
    </div>
  {/if}
</div>
