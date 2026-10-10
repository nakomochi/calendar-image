<script lang="ts">
  import { untrack } from 'svelte';
  import { events, style, viewType, exportSettings, dateRange, timeRange, eventDisplay, timetableEventDisplay, utokyoMode as utokyoModeStore, timetableConfig, patchEvents, sidebarTab } from '$lib/stores';
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
  import Toolbar from '$lib/components/editor/Toolbar.svelte';
  import CanvasViewport from '$lib/components/editor/CanvasViewport.svelte';
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

  interface Props { utokyoMode: boolean }
  let { utokyoMode }: Props = $props();

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

  // Apply utokyo mode synchronously before the first paint so the timetable
  // route doesn't flash GridView (default) before switching to TimetableView.
  // Each route mounts its own Editor, so applying once at init is enough.
  function applyUtokyoMode(mode: boolean) {
    utokyoModeStore.set(mode);
    if (mode) {
      viewType.set('timetable');
    } else {
      viewType.update((v) => (v === 'timetable' ? 'grid' : v));
    }
  }

  applyUtokyoMode(untrack(() => utokyoMode));

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
  <title>{$utokyoModeStore ? '東大カレンダー' : 'Calendar Image Generator'}</title>
</svelte:head>

{#snippet emptyState()}
  <div class="w-full h-full flex items-center justify-center bg-base-300/70 p-6">
    <div class="card bg-base-100 shadow-xl max-w-sm">
      <div class="card-body items-center text-center gap-3">
        <h2 class="card-title text-base">カレンダーを読み込んでください</h2>
        <p class="text-sm text-base-content/70">
          {#if $utokyoModeStore}
            u-tokyo.ac.jp の ICS URL を読み込むと、ここに時間割が表示されます。
          {:else}
            ICS の URL か .ics ファイルを読み込むと、ここにプレビューが表示されます。
          {/if}
        </p>
        <button type="button" class="btn btn-primary btn-sm" onclick={() => sidebarTab.set('data')}>
          データタブを開く
        </button>
      </div>
    </div>
  </div>
{/snippet}

{#snippet timetableHint()}
  <p class="text-xs text-base-content/60">マスをクリックで詳細 / 授業を右クリックで編集</p>
{/snippet}

<div class="flex h-screen bg-base-300">
  <Sidebar onclickDay={handleClickDay} />

  <main class="flex-1 flex flex-col min-w-0">
    <Toolbar {calendarEl} />
    <CanvasViewport
      width={$exportSettings.width}
      height={$exportSettings.height}
      overlay={$events.length === 0 ? emptyState : undefined}
      footer={$viewType === 'timetable' ? timetableHint : undefined}
    >
      <!-- Export target: must stay unscaled at the exact export size. -->
      <div
        bind:this={calendarEl}
        style="width: {$exportSettings.width}px; height: {$exportSettings.height}px;"
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
    </CanvasViewport>
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
