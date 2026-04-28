<script lang="ts">
  import { getWeekDays, getWeekdayLabel, getEventsForDay, formatTime, isSameDay, layoutEvents } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle } from '$lib/types';

  interface Props {
    date: Date;
    events: CalendarEvent[];
    style: CalendarStyle;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { date, events, style, oneditEvent }: Props = $props();

  let weekDays = $derived(getWeekDays(date));
  let hours = Array.from({ length: 24 }, (_, i) => i);
  let today = new Date();
  const HOUR_HEIGHT = 48;

  function getEventTop(ev: CalendarEvent): number {
    const start = new Date(ev.start);
    return (start.getHours() + start.getMinutes() / 60) * HOUR_HEIGHT;
  }

  function getEventHeight(ev: CalendarEvent): number {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const duration = (end.getTime() - start.getTime()) / 3600000;
    return Math.max(duration * HOUR_HEIGHT, 18);
  }
</script>

<div
  class="flex flex-col w-full h-full overflow-hidden"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px;"
>
  <!-- Header -->
  <div class="grid grid-cols-[60px_repeat(7,1fr)] shrink-0">
    <div style="background-color: {style.headerBgColor}; border-top-left-radius: {style.borderRadius}px;" class="p-1"></div>
    {#each weekDays as day, i}
      <div
        class="text-center text-xs font-bold py-2"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor};
          {i === 6 ? `border-top-right-radius: ${style.borderRadius}px` : ''}"
      >
        <div>{getWeekdayLabel(day.getDay())}</div>
        <div class="text-lg" class:underline={isSameDay(day, today)}>{day.getDate()}</div>
      </div>
    {/each}
  </div>

  <!-- All-day events -->
  {#if events.some((e) => e.allDay)}
    <div class="grid grid-cols-[60px_repeat(7,1fr)] shrink-0 border-b" style="border-color: {style.gridLineColor};">
      <div class="text-[10px] text-gray-400 p-1 flex items-center">終日</div>
      {#each weekDays as day}
        {@const allDayEvents = getEventsForDay(events, day).filter((e) => e.allDay)}
        <div
          class="p-0.5 flex min-h-[28px]"
          style="flex-direction: column; align-items: {style.eventAlign === 'center' ? 'center' : 'flex-start'}; gap: 2px;"
        >
          {#each allDayEvents as ev}
            <button
              class="text-left text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
              style="background-color: {ev.color || style.eventDefaultColor}; color: white;
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
      {#each hours as hour}
        <div class="text-[10px] text-gray-400 text-right pr-1 border-t" style="height: {HOUR_HEIGHT}px; border-color: {style.gridLineColor};">
          {hour.toString().padStart(2, '0')}:00
        </div>
      {/each}
    </div>

    <!-- Day columns -->
    {#each weekDays as day}
      {@const timedEvents = getEventsForDay(events, day).filter((e) => !e.allDay)}
      {@const layouted = layoutEvents(timedEvents)}
      <div
        class="flex-1 relative border-l"
        style="height: {24 * HOUR_HEIGHT}px; border-color: {style.gridLineColor}; background-color: {isSameDay(day, today) ? style.todayBgColor : 'transparent'};"
      >
        <!-- Hour lines -->
        {#each hours as hour}
          <div
            class="absolute left-0 right-0 border-t"
            style="top: {hour * HOUR_HEIGHT}px; border-color: {style.gridLineColor};"
          ></div>
        {/each}

        <!-- Events -->
        {#each layouted as { event: ev, column, totalColumns }}
          {@const top = getEventTop(ev)}
          {@const height = getEventHeight(ev)}
          <button
            class="absolute text-[9px] leading-tight px-1 rounded cursor-pointer hover:opacity-80 z-10 overflow-hidden text-left"
            style="background-color: {ev.color || style.eventDefaultColor}; color: white;
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
