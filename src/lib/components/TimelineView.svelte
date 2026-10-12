<script lang="ts">
  import { getWeekdayLabel, getEventsForDay, isSameDay, layoutEvents, getTimeRangeHours, timelineViewDays, firstShownIndex, showsEvents, isFaded, buildEventRows, minutesOfDay } from '$lib/calendar/utils';
  import { chipCss, headerCss, weekdayAccent, todayCellTint, GRAYOUT_BG } from '$lib/calendar/styleHelpers';
  import DateLabel from './DateLabel.svelte';
  import type { CalendarEvent, CalendarStyle, DateRange, EventDisplayConfig, TimeRange } from '$lib/types';

  interface Props {
    events: CalendarEvent[];
    style: CalendarStyle;
    range: DateRange;
    timeRange: TimeRange;
    displayConfig: EventDisplayConfig;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { events, style, range, timeRange, displayConfig, oneditEvent }: Props = $props();

  let days = $derived(timelineViewDays(range));
  let firstShown = $derived(firstShownIndex(days));
  let today = new Date();

  let timeBounds = $derived(getTimeRangeHours(timeRange));
  let visibleStartHour = $derived(Math.floor(timeBounds.startHour));
  let visibleEndHour = $derived(Math.ceil(timeBounds.endHour));
  let visibleHours = $derived(
    Array.from({ length: visibleEndHour - visibleStartHour }, (_, i) => visibleStartHour + i)
  );
  let gridContainerHeight = $state(0);
  let hourHeight = $derived(
    visibleHours.length > 0 ? gridContainerHeight / visibleHours.length : 0
  );
  let totalHeight = $derived(gridContainerHeight);

  function getEventTop(ev: CalendarEvent): number {
    const minutes = minutesOfDay(new Date(ev.start));
    return ((minutes - visibleStartHour * 60) / (visibleHours.length * 60)) * totalHeight;
  }

  function getEventHeight(ev: CalendarEvent): number {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const duration = (end.getTime() - start.getTime()) / 60000;
    return Math.max((duration / (visibleHours.length * 60)) * totalHeight, 18);
  }
</script>

<div
  class="flex flex-col w-full h-full overflow-hidden"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px;"
>
  <!-- Header -->
  <div class="flex shrink-0">
    <div class="w-[60px] shrink-0 p-1" style="{headerCss(style)} border-top-left-radius: {style.borderRadius}px;"></div>
    {#each days as { date: day, state }, i}
      {@const isToday = style.highlightToday && isSameDay(day, today)}
      {@const accent = weekdayAccent(day.getDay(), style)}
      <div
        class="flex-1 text-center text-xs font-bold py-2"
        style="{headerCss(style)}
          {accent ? `color: ${accent};` : ''}
          opacity: {isFaded(state) ? 0.3 : 1};
          {i === days.length - 1 ? `border-top-right-radius: ${style.borderRadius}px;` : ''}"
      >
        {#if state !== 'hide'}
          <div>{getWeekdayLabel(day.getDay(), style.weekdayFormat)}</div>
          <DateLabel {day} isFirstCell={i === firstShown} {isToday} {style} accent={accent} />
        {/if}
      </div>
    {/each}
  </div>

  <!-- All-day events -->
  {#if events.some((e) => e.allDay)}
    <div class="flex shrink-0 border-b" style="border-color: {style.gridLineColor};">
      <div class="w-[60px] shrink-0 text-[10px] text-gray-400 p-1 flex items-center">終日</div>
      {#each days as { date: day, state }}
        {@const allDayEvents = showsEvents(state) ? getEventsForDay(events, day).filter((e) => e.allDay) : []}
        <div
          class="flex-1 p-0.5 flex min-h-[28px]"
          style="flex-direction: column; align-items: {style.eventAlign === 'center' ? 'center' : 'flex-start'}; gap: 2px;
            opacity: {isFaded(state) ? 0.3 : 1}; background-color: {state === 'gray' ? GRAYOUT_BG : 'transparent'};"
        >
          {#each allDayEvents as ev}
            <button
              class="text-left px-1 py-0.5 rounded cursor-pointer hover:opacity-80 overflow-hidden"
              style="font-size: {style.eventFontSize}px; {chipCss(style, ev.color || style.eventDefaultColor)}
                {style.eventSizing === 'equal'
                  ? 'width: 100%; flex: 1 1 0%;'
                  : `width: 100%; height: ${style.eventFixedSize}px; flex: none;`}"
              onclick={() => oneditEvent(ev)}
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
      {/each}
    </div>
  {/if}

  <!-- Time grid -->
  <div class="flex flex-1 overflow-hidden min-h-0" bind:clientHeight={gridContainerHeight}>
    <!-- Hour labels -->
    <div class="w-[60px] shrink-0">
      {#each visibleHours as hour}
        <div class="text-[10px] text-gray-400 text-right pr-1 border-t" style="height: {hourHeight}px; border-color: {style.gridLineColor};">
          {hour.toString().padStart(2, '0')}:00
        </div>
      {/each}
    </div>

    <!-- Day columns -->
    {#each days as { date: day, state }}
      {@const isToday = style.highlightToday && isSameDay(day, today)}
      {@const timedEvents = showsEvents(state) ? getEventsForDay(events, day).filter((e) => !e.allDay) : []}
      {@const layouted = layoutEvents(timedEvents)}
      {@const showTodayCol = isToday && todayCellTint(style) && state !== 'hide'}
      <div
        class="flex-1 relative border-l"
        style="height: {totalHeight}px; border-color: {style.gridLineColor};
          background-color: {state === 'gray' ? GRAYOUT_BG : showTodayCol ? style.todayBgColor : 'transparent'};
          opacity: {isFaded(state) ? 0.3 : 1};"
      >
        <!-- Hour lines -->
        {#each visibleHours as hour, idx}
          <div
            class="absolute left-0 right-0 border-t"
            style="top: {idx * hourHeight}px; border-color: {style.gridLineColor};"
          ></div>
        {/each}

        <!-- Events -->
        {#each layouted as { event: ev, column, totalColumns }}
          {@const top = getEventTop(ev)}
          {@const height = getEventHeight(ev)}
          <button
            class="absolute leading-tight px-1 rounded cursor-pointer hover:opacity-80 z-10 overflow-hidden text-left"
            style="font-size: {style.eventFontSize}px; {chipCss(style, ev.color || style.eventDefaultColor)}
              top: {top}px; height: {height}px;
              left: {(column / totalColumns) * 100}%; width: {100 / totalColumns}%;"
            onclick={() => oneditEvent(ev)}
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
    {/each}
  </div>
</div>
