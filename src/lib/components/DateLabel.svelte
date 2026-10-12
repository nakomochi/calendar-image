<script lang="ts">
  import type { CalendarStyle } from '$lib/types';
  import { formatDayLabel } from '$lib/calendar/utils';
  import { contrastText } from '$lib/calendar/styleHelpers';

  interface Props {
    day: Date;
    isFirstCell: boolean;
    isToday: boolean;
    style: CalendarStyle;
    // Weekend accent color (Sun red / Sat blue) — null keeps inherited color.
    accent?: string | null;
    // "Mark dates" grid mode: distinct colors of the day's events, first event first.
    // The first fills a circle behind the number, the next few become dots below it.
    markColors?: string[];
  }

  let { day, isFirstCell, isToday, style, accent = null, markColors }: Props = $props();

  const MAX_DOTS = 3;

  let label = $derived(formatDayLabel(day, isFirstCell));

  // center-large doubles the effective font size for a wall-calendar look;
  // circle/badge sizing must scale off the actual rendered size.
  let effectiveFs = $derived(
    style.dateAlign === 'center-large' ? style.dateFontSize * 2 : style.dateFontSize,
  );
  let circleSize = $derived(`${effectiveFs * 1.6}px`);
  let markSize = $derived(`${effectiveFs * 1.8}px`);
  let dotSize = $derived(Math.max(4, Math.round(effectiveFs * 0.22)));

  let markColor = $derived(markColors?.[0] ?? null);
  let dotColors = $derived(markColors?.slice(1, 1 + MAX_DOTS) ?? []);

  let containerStyle = $derived.by(() => {
    const parts: string[] = ['padding: 2px 4px;', `font-size: ${effectiveFs}px;`];
    if (style.dateAlign === 'top-right') parts.push('text-align: right;');
    if (style.dateAlign === 'center-large') parts.push('text-align: center; line-height: 1.1;');
    if (accent) parts.push(`color: ${accent};`);
    return parts.join(' ');
  });

  let dotsJustify = $derived(
    style.dateAlign === 'top-right' ? 'flex-end' : style.dateAlign === 'center-large' ? 'center' : 'flex-start',
  );
</script>

<!-- Unmarked days get the same (transparent) box so every number lines up. -->
{#snippet mark(color: string | null)}
  <span
    class="inline-flex items-center justify-center font-bold"
    style="min-width: {markSize}; height: {markSize}; padding: 0 0.2em; border-radius: 9999px; line-height: 1;
      {color ? `background-color: ${color}; color: ${contrastText(color)};` : ''}"
  >{label}</span>
{/snippet}

<div class="font-medium shrink-0" style={containerStyle}>
  {#if markColor}
    <!-- The event circle wins over today's marker; today keeps a thin ring around it. -->
    {#if isToday}
      <span
        class="inline-flex"
        style="padding: 2px; border: 2px solid {style.headerBgColor}; border-radius: 9999px; vertical-align: middle;"
      >{@render mark(markColor)}</span>
    {:else}
      {@render mark(markColor)}
    {/if}
  {:else if isToday && style.todayMarker === 'circle'}
    <span
      class="inline-flex items-center justify-center font-bold"
      style="width: {circleSize}; height: {circleSize}; border-radius: 9999px; background-color: {style.headerBgColor}; color: {style.bgColor}; line-height: 1;"
    >{label}</span>
  {:else if isToday && style.todayMarker === 'bold'}
    <span class="font-black" style="color: {style.headerBgColor};">{label}</span>
  {:else if isToday && style.todayMarker === 'badge'}
    <span>{label}</span>
    <span
      class="ml-1 px-1 py-0.5 rounded font-bold align-middle"
      style="font-size: 0.65em; background-color: {style.headerBgColor}; color: {style.bgColor}; line-height: 1;"
    >今日</span>
  {:else if markColors}
    {@render mark(null)}
  {:else}
    {label}
  {/if}
  {#if markColors}
    <!-- Always reserved in mark mode so numbers line up whether or not a day has dots. -->
    <div class="flex" style="justify-content: {dotsJustify}; gap: {Math.ceil(dotSize / 2)}px; height: {dotSize}px; margin-top: 3px;">
      {#each dotColors as color (color)}
        <span class="shrink-0" style="width: {dotSize}px; height: {dotSize}px; border-radius: 9999px; background-color: {color};"></span>
      {/each}
    </div>
  {/if}
</div>
