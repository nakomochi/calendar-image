<script lang="ts">
  import { fly } from 'svelte/transition';
  import { style } from '$lib/stores';
  import { THEMES, applyTheme, type Theme } from '$lib/themes';
  import type { CalendarStyle } from '$lib/types';
  import ThemePreview from './ThemePreview.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  let { open, onclose }: Props = $props();

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

{#if open}
  <aside
    class="fixed inset-y-0 right-0 w-80 bg-base-100 shadow-2xl z-40 flex flex-col border-l border-base-300"
    transition:fly={{ x: 320, duration: 200 }}
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-base-300 shrink-0">
      <h2 class="font-bold text-base">テーマ</h2>
      <button class="btn btn-ghost btn-sm btn-square" aria-label="閉じる" onclick={onclose}>✕</button>
    </div>
    <div class="flex-1 overflow-y-auto p-3">
      <div class="grid grid-cols-2 gap-3">
        {#each THEMES as theme (theme.id)}
          {@const active = isActive(theme, $style)}
          <button
            type="button"
            class="relative p-1 rounded-lg border-2 transition hover:border-primary"
            class:!border-primary={active}
            style={active ? '' : 'border-color: transparent;'}
            aria-label={theme.name}
            title={theme.name}
            onclick={() => selectTheme(theme)}
          >
            <ThemePreview {theme} />
            {#if active}
              <span
                class="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center shadow"
                aria-hidden="true"
              >✓</span>
            {/if}
          </button>
        {/each}
      </div>
      <p class="text-[10px] text-gray-400 mt-4 leading-relaxed">
        テーマを選ぶと配色・フォント・イベントの形が一括で切り替わります。個別に設定した予定の色は保持されます。
      </p>
    </div>
  </aside>
{/if}
