<script lang="ts">
  import { dateRange } from '$lib/stores';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">表示範囲</h3>
  <label class="flex items-center justify-between text-xs">
    <span>開始日</span>
    <input type="date" class="input input-bordered input-xs w-36" bind:value={$dateRange.start} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>終了日</span>
    <input type="date" class="input input-bordered input-xs w-36" bind:value={$dateRange.end} />
  </label>
  <label class="flex items-center justify-between text-xs gap-2">
    <span class="shrink-0">範囲外の日</span>
    <select class="select select-bordered select-xs w-36" bind:value={$dateRange.outside}>
      <option value="dim">薄く表示</option>
      <option value="gray">グレーで表示</option>
      <option value="hide">表示しない</option>
    </select>
  </label>
</div>
