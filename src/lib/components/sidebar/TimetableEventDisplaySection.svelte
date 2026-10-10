<script lang="ts">
  import { timetableEventDisplay } from '$lib/stores';
  import { DEFAULT_TIMETABLE_DISPLAY } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">コマの表示</h3>
  <EventDisplayEditor
    store={timetableEventDisplay}
    defaultConfig={DEFAULT_TIMETABLE_DISPLAY}
    allowAllDay={false}
  />
</div>
