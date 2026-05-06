<script lang="ts">
  import { events, timetableConfig } from '$lib/stores';
  import { listTermYears } from '$lib/calendar/timetable';

  let termYears = $derived(listTermYears($events));
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">時間割</h3>
  <div class="text-xs">集計期間</div>
  <div class="flex gap-1">
    <select class="select select-bordered select-xs flex-1 min-w-0 px-1" bind:value={$timetableConfig.termYear}>
      {#each termYears as y}
        <option value={y}>{y}</option>
      {/each}
    </select>
    <select class="select select-bordered select-xs flex-1 min-w-0 px-1" bind:value={$timetableConfig.termSemester}>
      <option value="S">S</option>
      <option value="A">A</option>
    </select>
    <select class="select select-bordered select-xs flex-1 min-w-0 px-1" bind:value={$timetableConfig.termPart}>
      <option value="">全体</option>
      <option value="1">{$timetableConfig.termSemester}1</option>
      <option value="2">{$timetableConfig.termSemester}2</option>
    </select>
  </div>
  <label class="flex items-center gap-2 text-xs">
    <input type="checkbox" class="checkbox checkbox-xs" bind:checked={$timetableConfig.showSaturday} />
    <span>土曜を表示</span>
  </label>
  <label class="flex items-center gap-2 text-xs">
    <input type="checkbox" class="checkbox checkbox-xs" bind:checked={$timetableConfig.showPeriod6} />
    <span>6限を表示</span>
  </label>
  <div class="text-[10px] text-gray-400">マスを右クリックで編集 / 左クリックで詳細</div>
</div>
