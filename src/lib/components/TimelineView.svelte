<script lang="ts">
  import { getWeekdayLabel, getEventsForDay, formatTime, formatDayLabel, isSameDay, layoutEvents, isDayInRange, getTimeRangeHours, getRangeDays, getWeekDays, hasValidRange } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle, ViewRange } from '$lib/types';

  interface Props {
    events: CalendarEvent[];
    style: CalendarStyle;
    range: ViewRange;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { events, style, range, oneditEvent }: Props = $props();

  let days = $derived(
    hasValidRange(range)
      ? getRangeDays(range)
      : getWeekDays(new Date())
  );
  let today = new Date();
  const HOUR_HEIGHT = 48;

  let timeRange = $derived(getTimeRangeHours(range));
  let visibleStartHour = $derived(Math.floor(timeRange.startHour));
  let visibleEndHour = $derived(Math.ceil(timeRange.endHour));
  let visibleHours = $derived(
    Array.from({ length: visibleEndHour - visibleStartHour }, (_, i) => visibleStartHour + i)
  );
  let totalHeight = $derived(visibleHours.length * HOUR_HEIGHT);

  function getEventTop(ev: CalendarEvent): number {
    const start = new Date(ev.start);
    const minutes = start.getHours() * 60 + start.getMinutes();
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
    <div class="w-[60px] shrink-0 p-1" style="background-color: {style.headerBgColor}; border-top-left-radius: {style.borderRadius}px;"></div>
    {#each days as day, i}
      {@const inRange = isDayInRange(day, range)}
      {@const outOfRange = hasValidRange(range) && !inRange}
      <div
        class="flex-1 text-center text-xs font-bold py-2"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor};
          opacity: {outOfRange ? 0.3 : 1};
          {i === days.length - 1 ? `border-top-right-radius: ${style.borderRadius}px` : ''}"
      >
        <div>{getWeekdayLabel(day.getDay())}</div>
        <div style="font-size: {style.dateFontSize}px;" class:underline={isSameDay(day, today)}>{formatDayLabel(day, i === 0)}</div>
      </div>
    {/each}
  </div>

  <!-- All-day events -->
  {#if events.some((e) => e.allDay)}
    <div class="flex shrink-0 border-b" style="border-color: {style.gridLineColor};">
      <div class="w-[60px] shrink-0 text-[10px] text-gray-400 p-1 flex items-center">終日</div>
      {#each days as day}
        {@const inRange = isDayInRange(day, range)}
        {@const outOfRange = hasValidRange(range) && !inRange}
        {@const showGrayout = outOfRange && range.grayout}
        {@const allDayEvents = outOfRange && !showGrayout ? [] : getEventsForDay(events, day).filter((e) => e.allDay)}
        <div
          class="flex-1 p-0.5 flex min-h-[28px]"
          style="flex-direction: column; align-items: {style.eventAlign === 'center' ? 'center' : 'flex-start'}; gap: 2px;
            opacity: {outOfRange ? 0.3 : 1}; background-color: {showGrayout ? '#f3f4f6' : 'transparent'};"
        >
          {#each allDayEvents as ev}
            <button
              class="text-left px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
              style="font-size: {style.eventFontSize}px; background-color: {ev.color || style.eventDefaultColor}; color: white;
                {style.eventSizing === 'equal'
                  ? 'width: 100%; flex: 1 1 0%;'
                  : `width: 100%; height: ${style.eventFixedSize}px; flex: none;`}"
              onclick={() => oneditEvent(ev)}
            >
              {ev.title}
            </button>
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Time grid -->
  <div class="flex flex-1 overflow-y-auto min-h-0">
    <!-- Hour labels -->
    <div class="w-[60px] shrink-0">
      {#each visibleHours as hour}
        <div class="text-[10px] text-gray-400 text-right pr-1 border-t" style="height: {HOUR_HEIGHT}px; border-color: {style.gridLineColor};">
          {hour.toString().padStart(2, '0')}:00
        </div>
      {/each}
    </div>

    <!-- Day columns -->
    {#each days as day}
      {@const inRange = isDayInRange(day, range)}
      {@const outOfRange = hasValidRange(range) && !inRange}
      {@const showGrayout = outOfRange && range.grayout}
      {@const timedEvents = outOfRange && !showGrayout ? [] : getEventsForDay(events, day).filter((e) => !e.allDay)}
      {@const layouted = layoutEvents(timedEvents)}
      <div
        class="flex-1 relative border-l"
        style="height: {totalHeight}px; border-color: {style.gridLineColor};
          background-color: {showGrayout ? '#f3f4f6' : isSameDay(day, today) ? style.todayBgColor : 'transparent'};
          opacity: {outOfRange ? 0.3 : 1};"
      >
        <!-- Hour lines -->
        {#each visibleHours as hour, idx}
          <div
            class="absolute left-0 right-0 border-t"
            style="top: {idx * HOUR_HEIGHT}px; border-color: {style.gridLineColor};"
          ></div>
        {/each}

        <!-- Events -->
        {#each layouted as { event: ev, column, totalColumns }}
          {@const top = getEventTop(ev)}
          {@const height = getEventHeight(ev)}
          <button
            class="absolute leading-tight px-1 rounded cursor-pointer hover:opacity-80 z-10 overflow-hidden text-left"
            style="font-size: {style.eventFontSize}px; background-color: {ev.color || style.eventDefaultColor}; color: white;
              top: {top}px; height: {height}px;
              left: {(column / totalColumns) * 100}%; width: {100 / totalColumns}%;"
            onclick={() => oneditEvent(ev)}
          >
            {formatTime(new Date(ev.start))} {ev.title}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>
