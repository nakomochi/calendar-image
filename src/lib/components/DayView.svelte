<script lang="ts">
  import { getEventsForDay, formatTime, getWeekdayLabel, layoutEvents } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle } from '$lib/types';

  interface Props {
    date: Date;
    events: CalendarEvent[];
    style: CalendarStyle;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { date, events, style, oneditEvent }: Props = $props();

  let dayEvents = $derived(getEventsForDay(events, date));
  let allDayEvents = $derived(dayEvents.filter((e) => e.allDay));
  let timedEvents = $derived(dayEvents.filter((e) => !e.allDay));
  let layouted = $derived(layoutEvents(timedEvents));
  let hours = Array.from({ length: 24 }, (_, i) => i);

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
  <div
    class="text-center py-3 font-bold shrink-0"
    style="background-color: {style.headerBgColor}; color: {style.headerTextColor}; border-radius: {style.borderRadius}px {style.borderRadius}px 0 0;"
  >
    <div class="text-sm">{getWeekdayLabel(date.getDay())}</div>
    <div class="text-2xl">{date.getDate()}</div>
  </div>

  <!-- All-day -->
  {#if allDayEvents.length > 0}
    <div class="p-2 border-b shrink-0" style="border-color: {style.gridLineColor};">
      <div class="text-xs text-gray-400 mb-1">終日</div>
      <div
        class="flex gap-1"
        style="flex-direction: column; align-items: {style.eventAlign === 'center' ? 'center' : 'flex-start'};"
      >
        {#each allDayEvents as ev}
          <button
            class="text-left text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80"
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
    </div>
  {/if}

  <!-- Timeline -->
  <div class="flex-1 overflow-y-auto">
    <div class="flex" style="height: {24 * HOUR_HEIGHT}px;">
      <!-- Hour labels -->
      <div class="w-14 shrink-0 relative">
        {#each hours as hour}
          <div
            class="absolute left-0 right-0 text-[10px] text-gray-400 text-right pr-2 pt-0.5 border-t"
            style="top: {hour * HOUR_HEIGHT}px; height: {HOUR_HEIGHT}px; border-color: {style.gridLineColor};"
          >
            {hour.toString().padStart(2, '0')}:00
          </div>
        {/each}
      </div>

      <!-- Event area -->
      <div class="flex-1 relative">
        {#each hours as hour}
          <div
            class="absolute left-0 right-0 border-t"
            style="top: {hour * HOUR_HEIGHT}px; border-color: {style.gridLineColor};"
          ></div>
        {/each}

        {#each layouted as { event: ev, column, totalColumns }}
          {@const top = getEventTop(ev)}
          {@const height = getEventHeight(ev)}
          <button
            class="absolute text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 z-10 overflow-hidden text-left"
            style="background-color: {ev.color || style.eventDefaultColor}; color: white;
              top: {top}px; height: {height}px;
              left: {(column / totalColumns) * 100}%; width: {100 / totalColumns}%;"
            onclick={() => oneditEvent(ev)}
          >
            {formatTime(new Date(ev.start))} - {formatTime(new Date(ev.end))} {ev.title}
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
