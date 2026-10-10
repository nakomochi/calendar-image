<script lang="ts">
  import type { Component } from 'svelte';
  import { viewType } from '$lib/stores';
  import { LAYOUT_MODULES, type LayoutModule } from '$lib/settings/capabilities';
  import DateRangeSection from './DateRangeSection.svelte';
  import TimeRangeSection from './TimeRangeSection.svelte';
  import TimetableConfigSection from './TimetableConfigSection.svelte';
  import EventDisplaySection from './EventDisplaySection.svelte';
  import TimetableEventDisplaySection from './TimetableEventDisplaySection.svelte';

  const SECTION_COMPONENT: Record<LayoutModule, Component> = {
    dateRange: DateRangeSection,
    timeRange: TimeRangeSection,
    timetableConfig: TimetableConfigSection,
    eventDisplay: EventDisplaySection,
    timetableEventDisplay: TimetableEventDisplaySection,
  };
</script>

{#each LAYOUT_MODULES[$viewType] as mod (mod)}
  {@const Section = SECTION_COMPONENT[mod]}
  <Section />
{/each}
