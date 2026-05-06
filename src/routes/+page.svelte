<script lang="ts">
  import { page } from '$app/state';
  import { events, style, viewType, exportSettings, dateRange, timeRange, eventDisplay, timetableEventDisplay, utokyoMode, timetableConfig, patchEvents } from '$lib/stores';
  import { visibleEvents } from '$lib/stores';
  import { getEventsForDay } from '$lib/calendar/utils';
  import GridView from '$lib/components/GridView.svelte';
  import TimelineView from '$lib/components/TimelineView.svelte';
  import ListView from '$lib/components/ListView.svelte';
  import TimetableView from '$lib/components/TimetableView.svelte';
  import EventEditModal from '$lib/components/EventEditModal.svelte';
  import DayEventsModal from '$lib/components/DayEventsModal.svelte';
  import CellCoursesModal from '$lib/components/CellCoursesModal.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import type { CalendarEvent } from '$lib/types';
  import {
    buildCellOverview,
    buildTimetable,
    filterEventsByTerm,
    joinTermKey,
    type CellOverview,
    type Course,
    type Period,
    type TimetableWeekday,
  } from '$lib/calendar/timetable';

  let calendarEl: HTMLElement | null = $state(null);
  let editingEvent: CalendarEvent | null = $state(null);
  let editingCourse: Course | null = $state(null);
  let selectedDay: Date | null = $state(null);
  let selectedCell: { weekday: TimetableWeekday; period: Period } | null = $state(null);

  let activeTermSpec = $derived({
    year: $timetableConfig.termYear,
    key: joinTermKey($timetableConfig.termSemester, $timetableConfig.termPart),
  });

  let timetableAllEvents = $derived(filterEventsByTerm($events, activeTermSpec));
  let timetableAllMatrix = $derived(buildTimetable(timetableAllEvents));

  let cellOverview: CellOverview | null = $derived.by(() => {
    const sc = selectedCell;
    if (!sc) return null;
    return buildCellOverview(timetableAllMatrix, sc.weekday, sc.period);
  });

  let lastUtokyoMode: boolean | null = null;
  $effect(() => {
    const mode = page.data?.utokyoMode === true;
    if (mode === lastUtokyoMode) return;
    utokyoMode.set(mode);
    if (mode) {
      viewType.set('timetable');
    } else {
      viewType.update((v) => (v === 'timetable' ? 'grid' : v));
    }
    lastUtokyoMode = mode;
  });

  let selectedDayEvents = $derived(
    selectedDay ? getEventsForDay($events, selectedDay) : []
  );

  function patchCourseEvents(course: Course, patch: Partial<CalendarEvent>) {
    patchEvents(new Set(course.sourceEvents.map((e) => e.id)), patch);
  }

  function handleEditEvent(event: CalendarEvent) {
    editingCourse = null;
    editingEvent = event;
  }

  function handleEditCourse(course: Course) {
    editingCourse = course;
    editingEvent = course.latestEvent;
  }

  function handleClickDay(date: Date) {
    selectedDay = date;
  }

  function handleClickCell(weekday: TimetableWeekday, period: Period) {
    selectedCell = { weekday, period };
  }

  function handleToggleCourse(course: Course) {
    const next = course.sourceEvents.every((e) => !e.visible);
    patchCourseEvents(course, { visible: next });
  }

  function handleSaveEvent(updated: CalendarEvent) {
    if (editingCourse) {
      patchCourseEvents(editingCourse, {
        title: updated.title,
        description: updated.description,
        location: updated.location,
        color: updated.color,
      });
      return;
    }
    patchEvents(new Set([updated.id]), updated);
  }

  function handleToggleVisibility(id: string) {
    if (editingCourse) {
      const next = editingCourse.sourceEvents.every((e) => !e.visible);
      patchCourseEvents(editingCourse, { visible: next });
      return;
    }
    const target = $events.find((e) => e.id === id);
    if (!target) return;
    patchEvents(new Set([id]), { visible: !target.visible });
  }

</script>

<svelte:head>
  <title>{$utokyoMode ? '東大カレンダー' : 'Calendar Image Generator'}</title>
</svelte:head>

<div class="flex h-screen bg-base-300">
  <Sidebar {calendarEl} onclickDay={handleClickDay} />

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
          range={$dateRange}
          displayConfig={$eventDisplay}
          oneditEvent={handleEditEvent}
          onclickDay={handleClickDay}
        />
      {:else if $viewType === 'timeline'}
        <TimelineView
          events={$visibleEvents}
          style={$style}
          range={$dateRange}
          timeRange={$timeRange}
          displayConfig={$eventDisplay}
          oneditEvent={handleEditEvent}
        />
      {:else if $viewType === 'timetable'}
        <TimetableView
          matrix={timetableAllMatrix}
          style={$style}
          config={$timetableConfig}
          displayConfig={$timetableEventDisplay}
          oneditCourse={handleEditCourse}
          onclickCell={handleClickCell}
        />
      {:else}
        <ListView
          events={$visibleEvents}
          style={$style}
          range={$dateRange}
          displayConfig={$eventDisplay}
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

<CellCoursesModal
  overview={cellOverview}
  style={$style}
  onclose={() => (selectedCell = null)}
  oneditCourse={handleEditCourse}
  ontoggleCourse={handleToggleCourse}
/>

<EventEditModal
  event={editingEvent}
  onclose={() => {
    editingEvent = null;
    editingCourse = null;
  }}
  onsave={handleSaveEvent}
  ontoggleVisibility={handleToggleVisibility}
/>
