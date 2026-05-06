<script lang="ts">
  import { timeRange } from '$lib/stores';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">時間帯</h3>
  <label class="flex items-center justify-between text-xs">
    <span>開始時刻</span>
    <input type="time" class="input input-bordered input-xs w-28" bind:value={$timeRange.startTime} />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>終了時刻</span>
    <input type="time" class="input input-bordered input-xs w-28" bind:value={$timeRange.endTime} />
  </label>
</div>
