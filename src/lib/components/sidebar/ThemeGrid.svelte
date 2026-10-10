<script lang="ts">
  import { style } from '$lib/stores';
  import { THEMES, applyTheme, type Theme } from '$lib/themes';
  import type { CalendarStyle } from '$lib/types';
  import ThemePreview from '../ThemePreview.svelte';

  function selectTheme(theme: Theme) {
    style.update((s) => applyTheme(s, theme));
  }

  // Heuristic: a theme is "active" if its distinctive style fields all match the
  // current style. Since a user can hand-tweak colors after applying, exact match
  // is what we want — any drift = no active highlight.
  function isActive(theme: Theme, current: CalendarStyle): boolean {
    const t = theme.style;
    return (
      t.bgColor === current.bgColor &&
      t.headerBgColor === current.headerBgColor &&
      t.eventDefaultColor === current.eventDefaultColor &&
      t.eventShape === current.eventShape &&
      t.headerStyle === current.headerStyle &&
      t.borderStyle === current.borderStyle &&
      t.cellGap === current.cellGap &&
      t.borderRadius === current.borderRadius
    );
  }
</script>

<div class="grid grid-cols-3 gap-2">
  {#each THEMES as theme (theme.id)}
    {@const active = isActive(theme, $style)}
    <button
      type="button"
      class="relative p-1 rounded-lg border-2 transition hover:border-primary min-w-0"
      class:border-primary={active}
      class:border-transparent={!active}
      aria-pressed={active}
      title={theme.description}
      onclick={() => selectTheme(theme)}
    >
      <ThemePreview {theme} />
      <span class="block mt-1 text-[10px] leading-tight truncate">{theme.name}</span>
      {#if active}
        <span
          class="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center shadow"
          aria-hidden="true"
        >✓</span>
      {/if}
    </button>
  {/each}
</div>
