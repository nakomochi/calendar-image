<script lang="ts">
  import { events, style, viewType, exportSettings, viewRange } from '$lib/stores';
  import { visibleEvents } from '$lib/stores';
  import GridView from '$lib/components/GridView.svelte';
  import TimelineView from '$lib/components/TimelineView.svelte';
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
      {#if $viewType === 'grid'}
        <GridView
          events={$visibleEvents}
          style={$style}
          range={$viewRange}
          oneditEvent={handleEditEvent}
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

<EventEditModal
  event={editingEvent}
  onclose={() => (editingEvent = null)}
  onsave={handleSaveEvent}
  ondelete={handleDeleteEvent}
  ontoggleVisibility={handleToggleVisibility}
/>
