<script lang="ts">
  import { viewType, hiddenEvents, style, patchEvents } from '$lib/stores';
  import { formatDate } from '$lib/calendar/utils';
  import type { CalendarEvent } from '$lib/types';
  import CollapsibleSection from '../ui/CollapsibleSection.svelte';

  interface Props {
    onclickDay: (date: Date) => void;
  }

  let { onclickDay }: Props = $props();

  // Collapse repeated occurrences (e.g. weekly courses) into a single row in the hidden list.
  function hiddenGroupKey(ev: CalendarEvent): string {
    if (ev.allDay) return `allday::${ev.title}`;
    const d = new Date(ev.start);
    return `${d.getDay()}::${d.getHours()}:${d.getMinutes()}::${ev.title}`;
  }

  let hiddenGroups = $derived.by(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of $hiddenEvents) {
      const k = hiddenGroupKey(ev);
      const arr = map.get(k);
      if (arr) arr.push(ev);
      else map.set(k, [ev]);
    }
    return [...map.entries()].map(([key, evs]) => ({ key, events: evs }));
  });

  let isTimetable = $derived($viewType === 'timetable');
  let count = $derived(isTimetable ? hiddenGroups.length : $hiddenEvents.length);

  function restoreGroup(group: CalendarEvent[]) {
    patchEvents(new Set(group.map((e) => e.id)), { visible: true });
  }
</script>

<CollapsibleSection title="非表示の予定 ({count})">
  <div class="space-y-1 max-h-48 overflow-y-auto">
    {#each hiddenGroups as group (group.key)}
      {@const head = group.events[0]}
      {@const showCount = !isTimetable && group.events.length > 1}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex items-center gap-2 text-xs bg-base-100 rounded px-2 py-1.5 w-full text-left cursor-pointer hover:bg-base-300"
        onclick={() => onclickDay(new Date(head.start))}
        onkeydown={() => {}}
        role="button"
        tabindex="0"
      >
        <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {head.color || $style.eventDefaultColor};"></div>
        <div class="min-w-0 flex-1">
          <div class="truncate">{head.title}{showCount ? ` × ${group.events.length}` : ''}</div>
          <div class="text-[10px] text-gray-400">{formatDate(new Date(head.start))}</div>
        </div>
        <button
          class="btn btn-ghost btn-xs px-1 shrink-0"
          onclick={(e) => { e.stopPropagation(); restoreGroup(group.events); }}
        >
          表示
        </button>
      </div>
    {/each}
  </div>
</CollapsibleSection>
