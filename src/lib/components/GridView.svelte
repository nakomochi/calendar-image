<script lang="ts">
  import { getWeekdayLabel, isSameDay, getEventsForDay, formatTime, getRangeGridDays, isDayInRange, getCurrentMonthGrid, hasValidRange } from '$lib/calendar/utils';
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
      ? getRangeGridDays(range)
      : getCurrentMonthGrid()
  );
  let rowCount = $derived(days.length / 7);
  let today = new Date();
</script>

<div
  class="grid grid-cols-7 w-full h-full"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px; grid-template-rows: auto repeat({rowCount}, 1fr);"
>
  {#each Array.from({ length: 7 }) as _, i}
    <div
      class="text-center text-sm font-bold py-2"
      style="background-color: {style.headerBgColor}; color: {style.headerTextColor};
        {i === 0 ? `border-top-left-radius: ${style.borderRadius}px` : ''}
        {i === 6 ? `border-top-right-radius: ${style.borderRadius}px` : ''}"
    >
      {getWeekdayLabel(i)}
    </div>
  {/each}

  {#each days as day}
    {@const inRange = isDayInRange(day, range)}
    {@const outOfRange = hasValidRange(range) && !inRange}
    {@const showGrayout = outOfRange && range.grayout}
    {@const isToday = isSameDay(day, today)}
    {@const dayEvents = outOfRange && !showGrayout ? [] : getEventsForDay(events, day)}
    <div
      class="border overflow-hidden flex flex-col"
      style="border-color: {style.gridLineColor};
        background-color: {showGrayout ? '#f3f4f6' : isToday ? style.todayBgColor : style.bgColor};
        opacity: {outOfRange ? 0.3 : 1};"
    >
      <div class="text-xs font-medium px-1 pt-0.5 shrink-0">{day.getDate()}</div>
      {#if !outOfRange || showGrayout}
        <div
          class="flex-1 flex flex-col px-0.5 pb-0.5 min-h-0"
          style="justify-content: {style.eventAlign === 'center' ? 'center' : 'flex-start'}; gap: 1px;"
        >
          {#each dayEvents as ev}
            <button
              class="text-[10px] leading-tight px-0.5 rounded truncate cursor-pointer hover:opacity-80 w-full overflow-hidden text-left shrink-0"
              style="background-color: {ev.color || style.eventDefaultColor}; color: white;
                {style.eventSizing === 'equal'
                  ? 'flex: 1 1 0%; shrink: 1;'
                  : `flex: none; height: ${style.eventFixedSize}px;`}"
              onclick={() => oneditEvent(ev)}
            >
              {#if !ev.allDay}
                <span class="font-medium">{formatTime(new Date(ev.start))}</span>
              {/if}
              {ev.title}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
