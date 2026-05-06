<script lang="ts">
  import { timetableEventDisplay } from '$lib/stores';
  import { DEFAULT_TIMETABLE_DISPLAY } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';
</script>

<EventDisplayEditor
  store={timetableEventDisplay}
  defaultConfig={DEFAULT_TIMETABLE_DISPLAY}
  title="コマの表示"
  allowAllDay={false}
/>
