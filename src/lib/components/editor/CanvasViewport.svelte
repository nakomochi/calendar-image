<script lang="ts">
  import type { Snippet } from 'svelte';
  import { previewFit } from '$lib/stores';

  interface Props {
    // Unscaled canvas size (= export size).
    width: number;
    height: number;
    children: Snippet;
    // Rendered over the viewport (outside the canvas, so never exported).
    overlay?: Snippet;
    footer?: Snippet;
  }

  let { width, height, children, overlay, footer }: Props = $props();

  // Matches the container's p-6 on both sides.
  const PADDING = 48;
  const FOOTER_RESERVE = 32;

  let viewportWidth = $state(0);
  let viewportHeight = $state(0);

  let scale = $derived.by(() => {
    if (!$previewFit) return 1;
    const reserve = footer ? FOOTER_RESERVE : 0;
    const s = Math.min(
      1,
      (viewportWidth - PADDING) / width,
      (viewportHeight - PADDING - reserve) / height,
    );
    return Number.isFinite(s) && s > 0 ? s : 1;
  });
</script>

<div class="relative flex-1 min-h-0">
  <!-- m-auto (not justify-center) keeps oversized content scrollable from its top-left edge. -->
  <div
    class="absolute inset-0 overflow-auto flex p-6"
    bind:clientWidth={viewportWidth}
    bind:clientHeight={viewportHeight}
  >
    <div class="m-auto shrink-0 flex flex-col items-center gap-3">
      <div class="shrink-0 shadow-lg" style="width: {width * scale}px; height: {height * scale}px;">
        <div style="width: {width}px; height: {height}px; transform: scale({scale}); transform-origin: top left;">
          {@render children()}
        </div>
      </div>
      {#if footer}
        <div class="text-center">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>

  {#if overlay}
    <div class="absolute inset-0 z-10">
      {@render overlay()}
    </div>
  {/if}
</div>
