<script lang="ts">
  import { events, style, viewType, currentDate, exportSettings } from '$lib/stores';
  import { visibleEvents } from '$lib/stores';
  import MonthView from '$lib/components/MonthView.svelte';
  import WeekView from '$lib/components/WeekView.svelte';
  import DayView from '$lib/components/DayView.svelte';
  import ListView from '$lib/components/ListView.svelte';
  import EventEditModal from '$lib/components/EventEditModal.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import type { CalendarEvent } from '$lib/types';

  let calendarEl: HTMLElement | null = $state(null);
  let editingEvent: CalendarEvent | null = $state(null);

  function handleEditEvent(event: CalendarEvent) {
    editingEvent = event;
  }

  function handleSaveEvent(updated: CalendarEvent) {
    events.update((evts) => evts.map((e) => (e.id === updated.id ? updated : e)));
  }

  function handleDeleteEvent(id: string) {
    events.update((evts) => evts.filter((e) => e.id !== id));
  }

  function handleToggleVisibility(id: string) {
    events.update((evts) =>
      evts.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e))
    );
  }
</script>

<svelte:head>
  <title>Calendar Image Generator</title>
</svelte:head>

<div class="flex h-screen bg-base-300">
  <Sidebar {calendarEl} />

  <main class="flex-1 p-6 overflow-auto flex items-center justify-center">
    <div
      bind:this={calendarEl}
      style="width: {$exportSettings.width}px; height: {$exportSettings.height}px;"
      class="shadow-lg shrink-0"
    >
      {#if $viewType === 'month'}
        <MonthView
          year={$currentDate.getFullYear()}
          month={$currentDate.getMonth()}
          events={$visibleEvents}
          style={$style}
          oneditEvent={handleEditEvent}
        />
      {:else if $viewType === 'week'}
        <WeekView
          date={$currentDate}
          events={$visibleEvents}
          style={$style}
          oneditEvent={handleEditEvent}
        />
      {:else if $viewType === 'day'}
        <DayView
          date={$currentDate}
          events={$visibleEvents}
          style={$style}
          oneditEvent={handleEditEvent}
        />
      {:else}
        <ListView
          events={$visibleEvents}
          style={$style}
          oneditEvent={handleEditEvent}
        />
      {/if}
    </div>
  </main>
</div>

<EventEditModal
  event={editingEvent}
  onclose={() => (editingEvent = null)}
  onsave={handleSaveEvent}
  ondelete={handleDeleteEvent}
  ontoggleVisibility={handleToggleVisibility}
/>
