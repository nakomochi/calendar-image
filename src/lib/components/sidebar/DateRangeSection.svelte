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
  <label class="flex items-center gap-2 text-xs">
    <input type="checkbox" class="checkbox checkbox-xs" bind:checked={$dateRange.grayout} />
    <span>範囲外をグレーアウト表示</span>
  </label>
</div>
