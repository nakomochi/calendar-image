<script lang="ts">
  import { buildEventRows, getWeekdayLabel } from '$lib/calendar/utils';
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
      const visible = courses.filter((c) => c.sourceEvents.some((e) => e.visible));
      if (visible.length > 0) result.set(key, visible);
    }
    return result;
  });

  let cellBg = $derived(withAlpha(style.eventDefaultColor, 0.14));

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
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex-1 flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden"
              style="background-color: {cellBg};"
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
                  style="font-size: {fs}px; color: {style.textColor};"
                >{row.text}</div>
              {/each}
            </div>
          {/each}
        </div>
      {/each}
    {/each}
  </div>
</div>
