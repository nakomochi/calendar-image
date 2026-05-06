<script lang="ts">
  import { eventDisplay } from '$lib/stores';
  import { DEFAULT_EVENT_DISPLAY } from '$lib/types';
  import EventDisplayEditor from '../EventDisplayEditor.svelte';
</script>

<EventDisplayEditor store={eventDisplay} defaultConfig={DEFAULT_EVENT_DISPLAY} />
