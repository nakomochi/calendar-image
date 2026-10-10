<script lang="ts">
  import { getWeekdayLabel, isSameDay, getEventsForDay, getRangeGridDays, isDayInRange, getCurrentMonthGrid, hasValidRange, buildEventRows } from '$lib/calendar/utils';
  import { chipCss, headerCss, cellBorderCss, gridContainerCss, usesCellGap, weekdayAccent, todayCellTint } from '$lib/calendar/styleHelpers';
  import DateLabel from './DateLabel.svelte';
  import type { CalendarEvent, CalendarStyle, DateRange, EventDisplayConfig } from '$lib/types';

  interface Props {
    events: CalendarEvent[];
    style: CalendarStyle;
    range: DateRange;
    displayConfig: EventDisplayConfig;
    oneditEvent: (event: CalendarEvent) => void;
    onclickDay: (date: Date) => void;
  }

  let { events, style, range, displayConfig, oneditEvent, onclickDay }: Props = $props();

  let days = $derived(
    hasValidRange(range)
      ? getRangeGridDays(range)
      : getCurrentMonthGrid()
  );
  let rowCount = $derived(days.length / 7);
  let today = new Date();
</script>

<div
  class="grid grid-cols-7 w-full h-full overflow-hidden"
  style="background-color: {usesCellGap(style) ? style.gridLineColor : style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px; grid-template-rows: auto repeat({rowCount}, 1fr); {gridContainerCss(style)}"
>
  {#each Array.from({ length: 7 }) as _, i}
    {@const accent = weekdayAccent(i, style)}
    <div
      class="text-center text-sm font-bold py-2"
      style="{headerCss(style)}
        {accent ? `color: ${accent};` : ''}
        {i === 0 ? `border-top-left-radius: ${style.borderRadius}px;` : ''}
        {i === 6 ? `border-top-right-radius: ${style.borderRadius}px;` : ''}"
    >
      {getWeekdayLabel(i, style.weekdayFormat)}
    </div>
  {/each}

  {#each days as day, idx}
    {@const inRange = isDayInRange(day, range)}
    {@const outOfRange = hasValidRange(range) && !inRange}
    {@const showGrayout = outOfRange && range.grayout}
    {@const isToday = style.highlightToday && isSameDay(day, today)}
    {@const dayEvents = outOfRange && !showGrayout ? [] : getEventsForDay(events, day)}
    {@const showTodayBg = isToday && todayCellTint(style)}
    {@const dowAccent = weekdayAccent(day.getDay(), style)}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="overflow-hidden flex flex-col cursor-pointer"
      style="{cellBorderCss(style)}
        background-color: {showGrayout ? '#f3f4f6' : showTodayBg ? style.todayBgColor : style.bgColor};
        opacity: {outOfRange ? 0.3 : 1};"
      onclick={() => onclickDay(day)}
    >
      <DateLabel {day} isFirstCell={idx === 0} {isToday} {style} accent={dowAccent} />
      {#if !outOfRange || showGrayout}
        <div
          class="flex-1 flex flex-col px-0.5 pb-0.5 min-h-0"
          style="justify-content: {style.eventAlign === 'center' ? 'center' : 'flex-start'}; gap: 1px;"
        >
          {#each dayEvents as ev}
            <button
              class="leading-tight px-0.5 rounded cursor-pointer hover:opacity-80 w-full overflow-hidden text-left shrink-0"
              style="font-size: {style.eventFontSize}px; {chipCss(style, ev.color || style.eventDefaultColor)}
                {style.eventSizing === 'equal'
                  ? 'flex: 1 1 0%; shrink: 1;'
                  : `flex: none; height: ${style.eventFixedSize}px;`}"
              onclick={(e) => { e.stopPropagation(); oneditEvent(ev); }}
            >
              {#each buildEventRows(ev, displayConfig) as row}
                <div
                  class="whitespace-pre-wrap break-words"
                  class:font-bold={row.bold}
                  style={row.fontSize !== undefined ? `font-size: ${row.fontSize}px;` : ''}
                >{row.text}</div>
              {/each}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
