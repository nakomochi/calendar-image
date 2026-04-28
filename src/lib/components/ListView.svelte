<script lang="ts">
  import { formatTime, formatDate } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle } from '$lib/types';

  interface Props {
    events: CalendarEvent[];
    style: CalendarStyle;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { events, style, oneditEvent }: Props = $props();

  let sortedEvents = $derived(
    [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
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
        class="text-sm font-bold px-3 py-2 rounded-t"
        style="background-color: {style.headerBgColor}; color: {style.headerTextColor};"
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
          <div class="min-w-0">
            <div class="text-sm font-medium truncate">{ev.title}</div>
            {#if !ev.allDay}
              <div class="text-xs text-gray-400">
                {formatTime(new Date(ev.start))} - {formatTime(new Date(ev.end))}
              </div>
            {:else}
              <div class="text-xs text-gray-400">終日</div>
            {/if}
            {#if ev.location}
              <div class="text-xs text-gray-400">{ev.location}</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/each}
</div>
