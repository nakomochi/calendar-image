<script lang="ts" module>
  export interface EventSaveOptions {
    // Also apply title and color to the other events sharing the original title.
    applyToSameTitle: boolean;
  }
</script>

<script lang="ts">
  import type { CalendarEvent } from '$lib/types';
  import { events } from '$lib/stores';

  interface Props {
    event: CalendarEvent | null;
    // Events sharing the edited event's original title (itself included); the
    // bulk option is offered only when > 1.
    sameTitleCount?: number;
    onclose: () => void;
    onsave: (event: CalendarEvent, options: EventSaveOptions) => void;
    ontoggleVisibility: (id: string) => void;
  }

  let { event, sameTitleCount = 0, onclose, onsave, ontoggleVisibility }: Props = $props();

  let editTitle = $state('');
  let editDescription = $state('');
  let editLocation = $state('');
  let editColor = $state('');
  let applyToSameTitle = $state(true);

  let canApplyToSameTitle = $derived(sameTitleCount > 1);

  let usedColors = $derived(
    [...new Set($events.map((e) => e.color).filter((c) => c && c !== ''))]
  );

  $effect(() => {
    if (event) {
      editTitle = event.title;
      editDescription = event.description;
      editLocation = event.location;
      editColor = event.color || '#3b82f6';
      applyToSameTitle = true;
    }
  });

  function handleSave() {
    if (!event) return;
    onsave(
      {
        ...event,
        title: editTitle,
        description: editDescription,
        location: editLocation,
        color: editColor,
      },
      { applyToSameTitle: canApplyToSameTitle && applyToSameTitle },
    );
    onclose();
  }
</script>

{#if event}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onkeydown={(e) => e.key === 'Escape' && onclose()} onclick={onclose}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6 mx-4" onclick={(e) => e.stopPropagation()}>
      <h3 class="text-lg font-bold mb-4">予定を編集</h3>

      <div class="space-y-3">
        <label class="form-control w-full">
          <div class="label"><span class="label-text">タイトル</span></div>
          <textarea class="textarea textarea-bordered w-full" rows="2" bind:value={editTitle}></textarea>
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">説明</span></div>
          <textarea class="textarea textarea-bordered w-full" rows="2" bind:value={editDescription}></textarea>
        </label>

        <label class="form-control w-full">
          <div class="label"><span class="label-text">場所</span></div>
          <input type="text" class="input input-bordered w-full" bind:value={editLocation} />
        </label>

        <div class="form-control w-full">
          <div class="label"><span class="label-text">色</span></div>
          <div class="flex flex-wrap items-center gap-2">
            <input type="color" class="w-12 h-10 cursor-pointer rounded" bind:value={editColor} />
            {#each usedColors as c}
              <button
                class="w-7 h-7 rounded-full cursor-pointer border-2 shrink-0 hover:scale-110 transition-transform"
                style="background-color: {c}; border-color: {c === editColor ? 'white' : 'transparent'}; box-shadow: {c === editColor ? '0 0 0 2px #3b82f6' : 'none'};"
                aria-label="色 {c}"
                onclick={() => { editColor = c; }}
              ></button>
            {/each}
          </div>
        </div>

        {#if canApplyToSameTitle}
          <label class="flex items-start gap-2 cursor-pointer pt-1">
            <input type="checkbox" class="checkbox checkbox-sm mt-0.5" bind:checked={applyToSameTitle} />
            <span class="text-sm">
              同じ名前の予定（{sameTitleCount} 件）にもまとめて反映
              <span class="block text-xs text-base-content/60">タイトルと色が対象です</span>
            </span>
          </label>
        {/if}
      </div>

      <div class="flex justify-between mt-6">
        <div>
          <button class="btn btn-warning btn-sm" onclick={() => { ontoggleVisibility(event!.id); onclose(); }}>
            {event.visible ? '非表示' : '表示'}
          </button>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" onclick={onclose}>キャンセル</button>
          <button class="btn btn-primary btn-sm" onclick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  </div>
{/if}
