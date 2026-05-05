<script lang="ts">
  import { getWeekdayLabel } from '$lib/calendar/utils';
  import {
    PERIODS,
    TIMETABLE_WEEKDAYS,
    cellKey,
    formatPeriodTime,
    type Course,
    type Period,
    type TimetableMatrix,
    type TimetableWeekday,
  } from '$lib/calendar/timetable';
  import type { CalendarStyle, TimetableConfig } from '$lib/types';

  interface Props {
    matrix: TimetableMatrix;
    style: CalendarStyle;
    config: TimetableConfig;
    oneditCourse?: (course: Course) => void;
    onclickCell?: (weekday: TimetableWeekday, period: Period) => void;
  }

  let { matrix, style, config, oneditCourse, onclickCell }: Props = $props();

  let weekdays = $derived(
    config.showSaturday ? TIMETABLE_WEEKDAYS : TIMETABLE_WEEKDAYS.filter((w) => w !== 6),
  );
  let periods = $derived(
    config.showPeriod6 ? PERIODS : PERIODS.filter((p) => p.index !== 6),
  );

  function visibleCoursesAt(wd: TimetableWeekday, periodIndex: number): Course[] {
    const courses = matrix.get(cellKey(wd, periodIndex));
    if (!courses) return [];
    return courses.filter((c) => c.sourceEvents.some((e) => e.visible));
  }

  function withAlpha(hex: string, alpha: number): string {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
    if (!m) return hex;
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function handleCourseContextmenu(e: MouseEvent, course: Course) {
    e.preventDefault();
    oneditCourse?.(course);
  }
</script>

<div
  class="w-full h-full overflow-hidden flex flex-col"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px;"
>
  <div
    class="grid flex-1 min-h-0"
    style="grid-template-columns: 72px repeat({weekdays.length}, 1fr); grid-template-rows: auto repeat({periods.length}, 1fr); gap: 1px; background-color: {style.gridLineColor};"
  >
    <div
      class="flex items-center justify-center text-xs font-bold"
      style="background-color: {style.headerBgColor}; color: {style.headerTextColor}; border-top-left-radius: {style.borderRadius}px;"
    ></div>

    {#each weekdays as wd, i}
      <div
        class="flex items-center justify-center text-sm font-bold py-2"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor};
          {i === weekdays.length - 1 ? `border-top-right-radius: ${style.borderRadius}px;` : ''}"
      >
        {getWeekdayLabel(wd)}
      </div>
    {/each}

    {#each periods as p, pi}
      <div
        class="flex flex-col items-center justify-center text-center py-1 px-1"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor};
          {pi === periods.length - 1 ? `border-bottom-left-radius: ${style.borderRadius}px;` : ''}"
      >
        <div class="text-sm font-bold leading-tight">{p.label}</div>
        <div class="leading-tight" style="font-size: {Math.max(9, style.dateFontSize - 2)}px; opacity: 0.85;">
          {formatPeriodTime(p)}
        </div>
      </div>

      {#each weekdays as wd, wi}
        {@const courses = visibleCoursesAt(wd, p.index)}
        {@const isLastCol = wi === weekdays.length - 1}
        {@const isLastRow = pi === periods.length - 1}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="flex flex-col items-stretch overflow-hidden cursor-pointer"
          style="background-color: {style.bgColor};
            {isLastCol && isLastRow ? `border-bottom-right-radius: ${style.borderRadius}px;` : ''}"
          onclick={() => onclickCell?.(wd, p)}
        >
          {#each courses as course}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex-1 flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden"
              style="background-color: {withAlpha(style.eventDefaultColor, 0.14)};"
              oncontextmenu={(e) => handleCourseContextmenu(e, course)}
              title="右クリックで編集"
            >
              <div
                class="font-bold leading-snug w-full break-words"
                style="font-size: {style.eventFontSize + 2}px; color: {style.textColor};"
              >
                {course.title}
              </div>
              {#if course.location}
                <div
                  class="leading-tight w-full break-words mt-0.5 opacity-80"
                  style="font-size: {style.eventFontSize}px;"
                >
                  {course.location}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    {/each}
  </div>
</div>
