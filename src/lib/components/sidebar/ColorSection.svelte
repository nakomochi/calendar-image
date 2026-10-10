<script lang="ts">
  import { style } from '$lib/stores';
  import type { CalendarStyle } from '$lib/types';
  import CollapsibleSection from '../ui/CollapsibleSection.svelte';

  type ColorKey = keyof Pick<
    CalendarStyle,
    'bgColor' | 'textColor' | 'headerBgColor' | 'headerTextColor' | 'eventDefaultColor' | 'gridLineColor'
  >;

  const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
    { key: 'bgColor', label: '背景色' },
    { key: 'textColor', label: '文字色' },
    { key: 'headerBgColor', label: 'ヘッダー背景' },
    { key: 'headerTextColor', label: 'ヘッダー文字' },
    { key: 'eventDefaultColor', label: '予定の色' },
    { key: 'gridLineColor', label: '罫線' },
  ];
</script>

<CollapsibleSection title="色" open>
  {#each COLOR_FIELDS as field (field.key)}
    <label class="flex items-center justify-between text-xs">
      <span>{field.label}</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style[field.key]} />
    </label>
  {/each}
</CollapsibleSection>
