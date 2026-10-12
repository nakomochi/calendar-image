<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CalendarAnnotations, CalendarStyle, LegendItem } from '$lib/types';
  import type { SummaryItem } from '$lib/calendar/summary';

  interface Props {
    style: CalendarStyle;
    annotations: CalendarAnnotations;
    legend: LegendItem[];
    summary: SummaryItem[];
    children: Snippet;
  }

  let { style, annotations, legend, summary, children }: Props = $props();

  let subtitle = $derived(annotations.subtitle.trim());
  let title = $derived(annotations.title.trim());
  let note = $derived(annotations.note.trim());
  let hasHeader = $derived(subtitle !== '' || title !== '' || legend.length > 0);
  // Without any annotation the view is rendered bare so output matches the plain calendar.
  let framed = $derived(hasHeader || note !== '' || summary.length > 0);
  let divider = $derived(`border-bottom: 1px solid ${style.gridLineColor};`);
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

    {#if summary.length > 0}
      <!-- Two-column grid so every row's dates start at the same x. -->
      <div
        class="shrink-0 grid"
        style="grid-template-columns: fit-content(42%) minmax(0, 1fr); border-top: 2px solid {style.textColor}; margin-top: 4px;"
      >
        {#each summary as item (item.title)}
          <div class="flex items-center min-w-0" style="gap: 9px; padding: 10px 20px 10px 0; {divider}">
            <div class="shrink-0" style="width: 12px; height: 12px; border-radius: 9999px; background-color: {item.color};"></div>
            <div class="break-words min-w-0" style="font-size: 16px; font-weight: 800; line-height: 1.3;">{item.title}</div>
          </div>
          <div class="flex flex-col justify-center min-w-0" style="padding: 10px 0; gap: 2px; {divider}">
            <div class="break-words" style="font-size: 14px; line-height: 1.4;">{item.dates}</div>
            {#if item.details}
              <div class="break-words" style="font-size: 13px; line-height: 1.4; opacity: 0.6;">{item.details}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    {#if note}
      <div class="shrink-0 break-words" style="font-size: 12px; opacity: 0.7;">{note}</div>
    {/if}
  </div>
{:else}
  <div class="w-full h-full">
    {@render children()}
  </div>
{/if}
