<script lang="ts">
  import { timetableEventDisplay } from '$lib/stores';
  import { DEFAULT_TIMETABLE_DISPLAY } from '$lib/types';
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
    <span>コマの表示</span>
  </button>

  {#if open}
    <div class="pl-1">
      <EventDisplayEditor
        store={timetableEventDisplay}
        defaultConfig={DEFAULT_TIMETABLE_DISPLAY}
        allowAllDay={false}
        hideHeading
      />
    </div>
  {/if}
</div>
