<script lang="ts">
  import { untrack } from 'svelte';
  import { get } from 'svelte/store';
  import { events, style, viewType, viewTypeByMode, exportSettings, dateRange, timeRange, eventDisplay, timetableEventDisplay, utokyoMode as utokyoModeStore, timetableConfig, timetableMatrix, annotations, legendItems, summaryItems, patchEvents, openSidebarTab, type EditorMode } from '$lib/stores';
  import { visibleEvents } from '$lib/stores';
  import { desktop } from '$lib/media.svelte';
  import { eventIdsWithTitle, getEventsForDay } from '$lib/calendar/utils';
  import CalendarFrame from '$lib/components/CalendarFrame.svelte';
  import GridView from '$lib/components/GridView.svelte';
  import TimelineView from '$lib/components/TimelineView.svelte';
  import ListView from '$lib/components/ListView.svelte';
  import TimetableView from '$lib/components/TimetableView.svelte';
  import EventEditModal, { type EventSaveOptions } from '$lib/components/EventEditModal.svelte';
  import DayEventsModal from '$lib/components/DayEventsModal.svelte';
  import CellCoursesModal from '$lib/components/CellCoursesModal.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MobileSheet from '$lib/components/editor/MobileSheet.svelte';
  import Toolbar from '$lib/components/editor/Toolbar.svelte';
  import CanvasViewport from '$lib/components/editor/CanvasViewport.svelte';
  import type { CalendarEvent } from '$lib/types';
  import {
    buildCellOverview,
    isCourseVisible,
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

  let cellOverview: CellOverview | null = $derived.by(() => {
    const sc = selectedCell;
    if (!sc) return null;
    return buildCellOverview($timetableMatrix, sc.weekday, sc.period);
  });

  // Courses already save to all their source events, so the bulk option is for single events only.
  let sameTitleIds = $derived.by(() => {
    const ev = editingEvent;
    return ev && !editingCourse ? eventIdsWithTitle($events, ev.title) : new Set<string>();
  });

  // Each route mounts its own Editor and remembers its own view. Restore it
  // synchronously before the first paint so the wrong view never flashes.
  const mode: EditorMode = untrack(() => utokyoMode) ? 'utokyo' : 'editor';
  utokyoModeStore.set(mode === 'utokyo');
  viewType.set(get(viewTypeByMode)[mode]);

  $effect(() => {
    const current = $viewType;
    if (get(viewTypeByMode)[mode] === current) return;
    viewTypeByMode.update((prefs) => ({ ...prefs, [mode]: current }));
  });

  // First-time mobile users land on the import UI.
  if (!desktop.current && get(events).length === 0) openSidebarTab('data');

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
    patchCourseEvents(course, { visible: !isCourseVisible(course) });
  }

  function handleSaveEvent(updated: CalendarEvent, { applyToSameTitle }: EventSaveOptions) {
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
    if (applyToSameTitle) patchEvents(sameTitleIds, { title: updated.title, color: updated.color });
  }

  function handleToggleVisibility(id: string) {
    if (editingCourse) {
      patchCourseEvents(editingCourse, { visible: !isCourseVisible(editingCourse) });
      return;
    }
    const target = $events.find((e) => e.id === id);
    if (!target) return;
    patchEvents(new Set([id]), { visible: !target.visible });
  }

</script>

<svelte:head>
  <title>{$utokyoModeStore ? '大学の時間割 — みせカレ' : 'みせカレ'}</title>
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
        <button type="button" class="btn btn-primary btn-sm" onclick={() => openSidebarTab('data')}>
          データタブを開く
        </button>
      </div>
    </div>
  </div>
{/snippet}

{#snippet timetableHint()}
  <p class="text-xs text-base-content/60">
    {desktop.current ? 'マスをクリックで詳細 / 授業を右クリックで編集' : 'マスをタップで詳細・編集'}
  </p>
{/snippet}

<!-- Desktop: sidebar | main. Mobile: main (toolbar + canvas) above the settings sheet and tab bar.
     Only one variant is mounted since the sidebar content holds state and fixed ids. -->
<div class={['flex h-dvh bg-base-300', !desktop.current && 'flex-col']}>
  {#if desktop.current}
    <Sidebar onclickDay={handleClickDay} />
  {/if}

  <main class="flex-1 flex flex-col min-w-0 min-h-0">
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
        <CalendarFrame style={$style} annotations={$annotations} legend={$legendItems} summary={$summaryItems}>
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
              matrix={$timetableMatrix}
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
        </CalendarFrame>
      </div>
    </CanvasViewport>
  </main>

  {#if !desktop.current}
    <MobileSheet onclickDay={handleClickDay} />
  {/if}
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
  sameTitleCount={sameTitleIds.size}
  onclose={() => {
    editingEvent = null;
    editingCourse = null;
  }}
  onsave={handleSaveEvent}
  ontoggleVisibility={handleToggleVisibility}
/>
