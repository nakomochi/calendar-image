<script lang="ts">
  import { style } from '$lib/stores';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">今日の表示</h3>
  <label class="flex items-center gap-2 text-xs">
    <input type="checkbox" class="checkbox checkbox-xs" bind:checked={$style.highlightToday} />
    <span>今日をハイライト</span>
  </label>
  <label class="flex items-center justify-between text-xs" class:opacity-50={!$style.highlightToday}>
    <span>今日の背景</span>
    <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.todayBgColor} disabled={!$style.highlightToday} />
  </label>
</div>
