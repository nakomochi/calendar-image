<script lang="ts">
  import { formatDate, parseViewRange, buildEventRows } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle, EventDisplayConfig, ViewRange } from '$lib/types';

  interface Props {
    events: CalendarEvent[];
    style: CalendarStyle;
    range: ViewRange;
    displayConfig: EventDisplayConfig;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { events, style, range, displayConfig, oneditEvent }: Props = $props();

  let subFontSize = $derived(Math.max(style.eventFontSize - 2, 8));

  let filteredEvents = $derived.by(() => {
    const { start, end } = parseViewRange(range);
    if (!start || !end) return events;
    return events.filter((e) => {
      const evStart = new Date(e.start);
      const evEnd = new Date(e.end);
      return evStart < end && evEnd > start;
    });
  });

  let sortedEvents = $derived(
    [...filteredEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  );

  interface GroupedEntry {
    dateKey: string;
    label: string;
    events: CalendarEvent[];
  }

  let grouped = $derived.by(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of sortedEvents) {
      const key = new Date(ev.start).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    const result: GroupedEntry[] = [];
    for (const [dateKey, evts] of map) {
      result.push({
        dateKey,
        label: formatDate(new Date(dateKey)),
        events: evts,
      });
    }
    return result;
  });
</script>

<div
  class="w-full h-full overflow-y-auto p-4"
  style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily}; border-radius: {style.borderRadius}px;"
>
  {#if grouped.length === 0}
    <div class="text-center text-gray-400 py-8">予定がありません</div>
  {/if}

  {#each grouped as group}
    <div class="mb-4">
      <div
        class="font-bold px-3 py-2 rounded-t"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor}; font-size: {style.dateFontSize}px;"
      >
        {group.label}
      </div>
      {#each group.events as ev}
        <button
          class="flex items-start gap-2 w-full text-left px-3 py-2 border-b cursor-pointer hover:bg-black/5"
          style="border-color: {style.gridLineColor};"
          onclick={() => oneditEvent(ev)}
        >
          <div
            class="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style="background-color: {ev.color || style.eventDefaultColor};"
          ></div>
          <div class="min-w-0" style="font-size: {style.eventFontSize}px;">
            {#each buildEventRows(ev, displayConfig) as row}
              {@const fs = row.fontSize ?? (row.hasTitle ? style.eventFontSize : subFontSize)}
              {#if row.hasTitle}
                <div class="truncate whitespace-pre" class:font-bold={row.bold} style="font-size: {fs}px;">{row.text}</div>
              {:else}
                <div class="text-gray-400 whitespace-pre-wrap" class:font-bold={row.bold} style="font-size: {fs}px;">{row.text}</div>
              {/if}
            {/each}
          </div>
        </button>
      {/each}
    </div>
  {/each}
</div>
