<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CalendarAnnotations, CalendarStyle, LegendItem } from '$lib/types';

  interface Props {
    style: CalendarStyle;
    annotations: CalendarAnnotations;
    legend: LegendItem[];
    children: Snippet;
  }

  let { style, annotations, legend, children }: Props = $props();

  let subtitle = $derived(annotations.subtitle.trim());
  let title = $derived(annotations.title.trim());
  let note = $derived(annotations.note.trim());
  let hasHeader = $derived(subtitle !== '' || title !== '' || legend.length > 0);
  // Without any annotation the view is rendered bare so output matches the plain calendar.
  let framed = $derived(hasHeader || note !== '');
</script>

{#if framed}
  <div
    class="w-full h-full flex flex-col overflow-hidden"
    style="background-color: {style.bgColor}; color: {style.textColor}; font-family: {style.fontFamily};
      padding: 16px 18px 12px; gap: 10px; border-radius: {style.borderRadius}px;"
  >
    {#if hasHeader}
      <div class="shrink-0 flex flex-col" style="gap: 4px;">
        {#if subtitle}
          <div class="break-words" style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; opacity: 0.6;">
            {subtitle}
          </div>
        {/if}
        {#if title}
          <div class="break-words" style="font-size: {annotations.titleSize}px; font-weight: 800; line-height: 1.2;">
            {title}
          </div>
        {/if}
        {#if legend.length > 0}
          <div class="flex flex-wrap" style="gap: 4px 14px; margin-top: 2px;">
            {#each legend as item (item.color)}
              <div class="flex items-center" style="gap: 6px; font-size: 12px;">
                <div class="shrink-0" style="width: 10px; height: 10px; border-radius: 3px; background-color: {item.color};"></div>
                <div>{item.label}</div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <div class="flex-1 min-h-0">
      {@render children()}
    </div>

    {#if note}
      <div class="shrink-0 break-words" style="font-size: 12px; opacity: 0.7;">{note}</div>
    {/if}
  </div>
{:else}
  <div class="w-full h-full">
    {@render children()}
  </div>
{/if}
