<script lang="ts">
  import { formatTime, formatDate } from '$lib/calendar/utils';
  import type { CalendarEvent, CalendarStyle } from '$lib/types';

  interface Props {
    date: Date | null;
    events: CalendarEvent[];
    style: CalendarStyle;
    onclose: () => void;
    oneditEvent: (event: CalendarEvent) => void;
  }

  let { date, events, style, onclose, oneditEvent }: Props = $props();

  let visibleEvts = $derived(events.filter((e) => e.visible));
  let hiddenEvts = $derived(events.filter((e) => !e.visible));
</script>

{#snippet eventRow(ev: CalendarEvent, dimmed: boolean)}
  <button
    class="flex items-center gap-2 w-full text-left px-3 py-2 rounded cursor-pointer hover:bg-black/5"
    class:opacity-50={dimmed}
    onclick={() => { oneditEvent(ev); onclose(); }}
  >
    <div
      class="w-3 h-3 rounded-full shrink-0"
      style="background-color: {ev.color || style.eventDefaultColor};"
    ></div>
    <div class="min-w-0 flex-1">
      <div class="text-sm font-medium truncate">{ev.title}</div>
      {#if !ev.allDay}
        <div class="text-xs text-gray-400">
          {formatTime(new Date(ev.start))} - {formatTime(new Date(ev.end))}
        </div>
      {:else}
        <div class="text-xs text-gray-400">終日</div>
      {/if}
    </div>
  </button>
{/snippet}

{#if date}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onkeydown={(e) => e.key === 'Escape' && onclose()} onclick={onclose}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-sm p-5 mx-4" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-bold mb-3">{formatDate(date)}</h3>

      {#if events.length === 0}
        <div class="text-sm text-gray-400 py-4 text-center">予定がありません</div>
      {:else}
        <div class="space-y-1 max-h-80 overflow-y-auto">
          {#each visibleEvts as ev}
            {@render eventRow(ev, false)}
          {/each}

          {#if hiddenEvts.length > 0}
            <div class="text-xs text-gray-400 font-medium px-3 pt-2">非表示</div>
            {#each hiddenEvts as ev}
              {@render eventRow(ev, true)}
            {/each}
          {/if}
        </div>
      {/if}

      <div class="flex justify-end mt-4">
        <button class="btn btn-ghost btn-sm" onclick={onclose}>閉じる</button>
      </div>
    </div>
  </div>
{/if}
