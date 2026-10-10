<script lang="ts">
  import type { CalendarStyle } from '$lib/types';
  import { formatDayLabel } from '$lib/calendar/utils';

  interface Props {
    day: Date;
    isFirstCell: boolean;
    isToday: boolean;
    style: CalendarStyle;
    // Weekend accent color (Sun red / Sat blue) — null keeps inherited color.
    accent?: string | null;
  }

  let { day, isFirstCell, isToday, style, accent = null }: Props = $props();

  let label = $derived(formatDayLabel(day, isFirstCell));

  // center-large doubles the effective font size for a wall-calendar look;
  // circle/badge sizing must scale off the actual rendered size.
  let effectiveFs = $derived(
    style.dateAlign === 'center-large' ? style.dateFontSize * 2 : style.dateFontSize,
  );
  let circleSize = $derived(`${effectiveFs * 1.6}px`);

  let containerStyle = $derived.by(() => {
    const parts: string[] = ['padding: 2px 4px;', `font-size: ${effectiveFs}px;`];
    if (style.dateAlign === 'top-right') parts.push('text-align: right;');
    if (style.dateAlign === 'center-large') parts.push('text-align: center; line-height: 1.1;');
    if (accent) parts.push(`color: ${accent};`);
    return parts.join(' ');
  });
</script>

<div class="font-medium shrink-0" style={containerStyle}>
  {#if isToday && style.todayMarker === 'circle'}
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
  {:else}
    {label}
  {/if}
</div>
