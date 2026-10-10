<script lang="ts">
  import type { Theme } from '$lib/themes';
  import { themeStyle } from '$lib/themes';
  import { chipCss, headerCss, cellBorderCss, usesCellGap, gridContainerCss, weekdayAccent } from '$lib/calendar/styleHelpers';

  interface Props { theme: Theme; }
  let { theme }: Props = $props();

  let s = $derived(themeStyle(theme));
  // Sample events per cell (row-major index). null = empty.
  const SAMPLE: (0 | 1 | null)[] = [
    1,    null, 1,    null,
    null, 1,    null, 1,
    1,    null, null, 1,
  ];
  // Preview shows Sun–Wed so weekendStyle=traditional colors the first column.
  const PREVIEW_DOWS = [0, 1, 2, 3];
  // Localized weekday letter picked to fit the preview's tiny width.
  const PREVIEW_LABELS: Record<string, string[]> = {
    'ja1': ['日', '月', '火', '水'],
    'ja-full': ['日', '月', '火', '水'],
    'en1': ['S', 'M', 'T', 'W'],
    'en3': ['SUN', 'MON', 'TUE', 'WED'],
    'en-full': ['Sun', 'Mon', 'Tue', 'Wed'],
  };
  let labels = $derived(PREVIEW_LABELS[s.weekdayFormat] ?? PREVIEW_LABELS['ja1']);
</script>

<div
  class="w-full aspect-[4/3] overflow-hidden grid grid-cols-4 shrink-0"
  style="background-color: {usesCellGap(s) ? s.gridLineColor : s.bgColor}; border-radius: {Math.min(s.borderRadius, 10)}px; font-family: {s.fontFamily}; grid-template-rows: 18px repeat(3, 1fr); {gridContainerCss(s)}"
>
  {#each PREVIEW_DOWS as dow, i}
    {@const accent = weekdayAccent(dow, s)}
    <div
      class="text-[8px] font-bold flex items-center justify-center leading-none"
      style="{headerCss(s)}
        {accent ? `color: ${accent};` : ''}
        {i === 0 ? `border-top-left-radius: ${Math.min(s.borderRadius, 10)}px;` : ''}
        {i === PREVIEW_DOWS.length - 1 ? `border-top-right-radius: ${Math.min(s.borderRadius, 10)}px;` : ''}"
    >
      {labels[i]}
    </div>
  {/each}
  {#each SAMPLE as ev, idx}
    <div
      class="flex items-center justify-center p-[2px]"
      style="{cellBorderCss(s)} background-color: {s.bgColor};"
    >
      {#if ev !== null}
        <div
          class="w-full h-[6px] rounded-[2px]"
          style="{chipCss(s, s.eventDefaultColor)}"
        ></div>
      {/if}
    </div>
  {/each}
</div>
