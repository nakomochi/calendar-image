<script lang="ts">
  import { buildEventRows, getWeekdayLabel } from '$lib/calendar/utils';
  import { headerCss, courseCellCss, weekdayAccent } from '$lib/calendar/styleHelpers';
  import {
    PERIODS,
    TIMETABLE_WEEKDAYS,
    cellKey,
    courseColorSource,
    formatPeriodTime,
    isCourseVisible,
    type Course,
    type Period,
    type TimetableMatrix,
    type TimetableWeekday,
  } from '$lib/calendar/timetable';
  import type { CalendarStyle, EventDisplayConfig, TimetableConfig } from '$lib/types';

  interface Props {
    matrix: TimetableMatrix;
    style: CalendarStyle;
    config: TimetableConfig;
    displayConfig: EventDisplayConfig;
    oneditCourse?: (course: Course) => void;
    onclickCell?: (weekday: TimetableWeekday, period: Period) => void;
  }

  let { matrix, style, config, displayConfig, oneditCourse, onclickCell }: Props = $props();

  let weekdays = $derived(
    config.showSaturday ? TIMETABLE_WEEKDAYS : TIMETABLE_WEEKDAYS.filter((w) => w !== 6),
  );
  let periods = $derived(
    config.showPeriod6 ? PERIODS : PERIODS.filter((p) => p.index !== 6),
  );

  let visibleMatrix = $derived.by(() => {
    const result = new Map<string, Course[]>();
    for (const [key, courses] of matrix) {
      const visible = courses.filter(isCourseVisible);
      if (visible.length > 0) result.set(key, visible);
    }
    return result;
  });

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
      style="{headerCss(style)} border-top-left-radius: {style.borderRadius}px;"
    ></div>

    {#each weekdays as wd, i}
      {@const accent = weekdayAccent(wd, style)}
      <div
        class="flex items-center justify-center text-sm font-bold py-2"
        style="{headerCss(style)}
          {accent ? `color: ${accent};` : ''}
          {i === weekdays.length - 1 ? `border-top-right-radius: ${style.borderRadius}px;` : ''}"
      >
        {getWeekdayLabel(wd, style.weekdayFormat)}
      </div>
    {/each}

    {#each periods as p, pi}
      <div
        class="flex flex-col items-center justify-center text-center py-1 px-1"
        style="{headerCss(style)}
          {pi === periods.length - 1 ? `border-bottom-left-radius: ${style.borderRadius}px;` : ''}"
      >
        <div class="text-sm font-bold leading-tight">{p.label}</div>
        <div class="leading-tight" style="font-size: {Math.max(9, style.eventFontSize - 1)}px; opacity: 0.85;">
          {formatPeriodTime(p)}
        </div>
      </div>

      {#each weekdays as wd, wi}
        {@const courses = visibleMatrix.get(cellKey(wd, p.index)) ?? []}
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
            {@const courseColor = courseColorSource(course).color || style.eventDefaultColor}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex-1 flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden"
              style={courseCellCss(style, courseColor)}
              oncontextmenu={(e) => handleCourseContextmenu(e, course)}
              title="右クリックで編集"
            >
              {#each buildEventRows(course.latestEvent, displayConfig) as row}
                {@const fs = row.fontSize ?? (row.hasTitle ? style.eventFontSize + 2 : style.eventFontSize)}
                <div
                  class="leading-snug w-full whitespace-pre-wrap break-words"
                  class:font-bold={row.bold}
                  class:mt-0.5={!row.hasTitle}
                  class:opacity-80={!row.hasTitle}
                  style="font-size: {fs}px;"
                >{row.text}</div>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
    {/each}
  </div>
</div>
