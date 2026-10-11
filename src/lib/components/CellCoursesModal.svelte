<script lang="ts">
  import type { CalendarStyle } from '$lib/types';
  import { getWeekdayLabel } from '$lib/calendar/utils';
  import {
    courseColorSource,
    formatPeriodTime,
    type CellOverview,
    type Course,
  } from '$lib/calendar/timetable';

  interface Props {
    overview: CellOverview | null;
    style: CalendarStyle;
    onclose: () => void;
    oneditCourse: (course: Course) => void;
    ontoggleCourse: (course: Course) => void;
  }

  let { overview, style, onclose, oneditCourse, ontoggleCourse }: Props = $props();
</script>

{#snippet courseRow(course: Course, hidden: boolean)}
  <div
    class="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-black/5"
    class:opacity-50={hidden}
  >
    <div
      class="w-3 h-3 rounded-full shrink-0"
      style="background-color: {courseColorSource(course).color || style.eventDefaultColor};"
    ></div>
    <div class="min-w-0 flex-1">
      <div class="text-sm font-medium whitespace-pre-wrap break-words">{course.title}</div>
      {#if course.location}
        <div class="text-xs text-gray-400 whitespace-pre-wrap break-words">{course.location}</div>
      {/if}
    </div>
    <button
      class="btn btn-ghost btn-xs px-2 shrink-0"
      onclick={() => { oneditCourse(course); onclose(); }}
    >
      編集
    </button>
    <button
      class="btn btn-ghost btn-xs px-2 shrink-0"
      onclick={() => ontoggleCourse(course)}
    >
      {hidden ? '表示' : '非表示'}
    </button>
  </div>
{/snippet}

{#if overview}
  {@const total = overview.visibleCourses.length + overview.hiddenCourses.length}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    onkeydown={(e) => e.key === 'Escape' && onclose()}
    onclick={onclose}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-sm p-5 mx-4" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-bold mb-1">
        {getWeekdayLabel(overview.weekday)}曜 {overview.period.label}
      </h3>
      <div class="text-xs text-gray-400 mb-3">{formatPeriodTime(overview.period)}</div>

      {#if total === 0}
        <div class="text-sm text-gray-400 py-4 text-center">コースがありません</div>
      {:else}
        <div class="space-y-1 max-h-80 overflow-y-auto">
          {#each overview.visibleCourses as course (course.id)}
            {@render courseRow(course, false)}
          {/each}

          {#if overview.hiddenCourses.length > 0}
            <div class="text-xs text-gray-400 font-medium px-3 pt-2">非表示</div>
            {#each overview.hiddenCourses as course (course.id)}
              {@render courseRow(course, true)}
            {/each}
          {/if}
        </div>
      {/if}

      <div class="flex justify-end mt-4">
        <button class="btn btn-ghost btn-sm" onclick={onclose}>閉じる</button>
      </div>
    </div>
  </div>
{/if}
