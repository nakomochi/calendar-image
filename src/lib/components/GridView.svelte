<script lang="ts">
  import { getWeekdayLabel, isSameDay, getEventsForDay, gridViewDays, firstShownIndex, showsEvents, isFaded, buildEventRows } from '$lib/calendar/utils';
  import { chipCss, headerCss, cellBorderCss, gridContainerCss, usesCellGap, weekdayAccent, todayCellTint, GRAYOUT_BG } from '$lib/calendar/styleHelpers';
  import { usedColors } from '$lib/calendar/legend';
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

  let days = $derived(gridViewDays(range));
  let firstShown = $derived(firstShownIndex(days));
  let rowCount = $derived(days.length / 7);
  let markDates = $derived(displayConfig.gridMarks === 'dates');
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

  {#each days as { date: day, state }, idx}
    {#if state === 'hide'}
      <!-- Empty placeholder keeps the borders so the grid stays aligned. -->
      <div style="{cellBorderCss(style)} background-color: {style.bgColor};"></div>
    {:else}
      {@const isToday = style.highlightToday && isSameDay(day, today)}
      {@const dayEvents = showsEvents(state) ? getEventsForDay(events, day) : []}
      {@const markColors = markDates ? usedColors(dayEvents, style.eventDefaultColor) : undefined}
      {@const showTodayBg = isToday && todayCellTint(style) && !markColors?.length}
      {@const dowAccent = weekdayAccent(day.getDay(), style)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="overflow-hidden flex flex-col cursor-pointer"
        style="{cellBorderCss(style)}
          background-color: {state === 'gray' ? GRAYOUT_BG : showTodayBg ? style.todayBgColor : style.bgColor};
          opacity: {isFaded(state) ? 0.3 : 1};
          {markDates && style.dateAlign === 'center-large' ? 'justify-content: center;' : ''}"
        onclick={() => onclickDay(day)}
      >
        <DateLabel {day} isFirstCell={idx === firstShown} {isToday} {style} accent={dowAccent} {markColors} />
        {#if !markDates && showsEvents(state)}
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
    {/if}
  {/each}
</div>
