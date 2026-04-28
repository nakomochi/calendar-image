<script lang="ts">
  import { getMonthDays, getWeekdayLabel, isSameDay, getEventsForDay, formatTime } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle } from '$lib/types';

  interface Props {
    year: number;
    month: number;
    events: CalendarEvent[];
    style: CalendarStyle;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { year, month, events, style, oneditEvent }: Props = $props();

  let days = $derived(getMonthDays(year, month));
  let today = new Date();
</script>

<div
  class="grid grid-cols-7 w-full h-full"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px; grid-template-rows: auto repeat(6, 1fr);"
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

  {#each days as day, i}
    {@const dayEvents = getEventsForDay(events, day)}
    {@const isCurrentMonth = day.getMonth() === month}
    {@const isToday = isSameDay(day, today)}
    <div
      class="border overflow-hidden flex flex-col"
      style="border-color: {style.gridLineColor};
        background-color: {isToday ? style.todayBgColor : style.bgColor};
        opacity: {isCurrentMonth ? 1 : 0.4};"
    >
      <div class="text-xs font-medium px-1 pt-0.5 shrink-0">{day.getDate()}</div>
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
    </div>
  {/each}
</div>
