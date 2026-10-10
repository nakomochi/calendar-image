<script lang="ts">
  import { untrack, type Snippet } from 'svelte';

  interface Props {
    title: string;
    // Initial state only; the section owns its open state afterwards.
    open?: boolean;
    children: Snippet;
    actions?: Snippet;
  }

  let { title, open: initialOpen = false, children, actions }: Props = $props();

  let open = $state(untrack(() => initialOpen));
</script>

<section class="space-y-2">
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="flex flex-1 items-center gap-1.5 text-left cursor-pointer"
      aria-expanded={open}
      onclick={() => (open = !open)}
    >
      <svg
        class="size-3 shrink-0 transition-transform"
        class:rotate-90={open}
        viewBox="0 0 12 12"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 2.5 8.5 6 4 9.5z" />
      </svg>
      <span class="font-bold text-sm">{title}</span>
    </button>
    {#if actions}
      {@render actions()}
    {/if}
  </div>

  {#if open}
    <div class="space-y-2 pt-1">
      {@render children()}
    </div>
  {/if}
</section>
