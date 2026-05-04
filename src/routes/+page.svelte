<script lang="ts">
  import { events, style, viewType, exportSettings, viewRange } from '$lib/stores';
  import { visibleEvents } from '$lib/stores';
  import { getEventsForDay } from '$lib/calendar/utils';
  import GridView from '$lib/components/GridView.svelte';
  import TimelineView from '$lib/components/TimelineView.svelte';
  import ListView from '$lib/components/ListView.svelte';
  import EventEditModal from '$lib/components/EventEditModal.svelte';
  import DayEventsModal from '$lib/components/DayEventsModal.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import type { CalendarEvent } from '$lib/types';

  let calendarEl: HTMLElement | null = $state(null);
  let editingEvent: CalendarEvent | null = $state(null);
  let selectedDay: Date | null = $state(null);

  let selectedDayEvents = $derived(
    selectedDay ? getEventsForDay($events, selectedDay) : []
  );

  function handleEditEvent(event: CalendarEvent) {
    editingEvent = event;
  }

  function handleClickDay(date: Date) {
    selectedDay = date;
  }

  function handleSaveEvent(updated: CalendarEvent) {
    events.update((evts) => evts.map((e) => (e.id === updated.id ? updated : e)));
  }

  function handleToggleVisibility(id: string) {
    events.update((evts) =>
      evts.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
    );
  }

  function handleRestoreEvent(id: string) {
    events.update((evts) =>
      evts.map((e) => (e.id === id ? { ...e, visible: true } : e))
    );
  }
</script>

<svelte:head>
  <title>Calendar Image Generator</title>
</svelte:head>

<div class="flex h-screen bg-base-300">
  <Sidebar {calendarEl} onclickDay={handleClickDay} onrestoreEvent={handleRestoreEvent} />

  <main class="flex-1 p-6 overflow-auto flex items-center justify-center">
    <div
      bind:this={calendarEl}
      style="width: {$exportSettings.width}px; height: {$exportSettings.height}px;"
      class="shadow-lg shrink-0"
    >
      {#if $viewType === 'grid'}
        <GridView
          events={$visibleEvents}
          style={$style}
          range={$viewRange}
          oneditEvent={handleEditEvent}
          onclickDay={handleClickDay}
        />
      {:else if $viewType === 'timeline'}
        <TimelineView
          events={$visibleEvents}
          style={$style}
          range={$viewRange}
          oneditEvent={handleEditEvent}
        />
      {:else}
        <ListView
          events={$visibleEvents}
          style={$style}
          range={$viewRange}
          oneditEvent={handleEditEvent}
        />
      {/if}
    </div>
  </main>
</div>

<DayEventsModal
  date={selectedDay}
  events={selectedDayEvents}
  style={$style}
  onclose={() => (selectedDay = null)}
  oneditEvent={handleEditEvent}
/>

<EventEditModal
  event={editingEvent}
  onclose={() => (editingEvent = null)}
  onsave={handleSaveEvent}
  ontoggleVisibility={handleToggleVisibility}
/>
