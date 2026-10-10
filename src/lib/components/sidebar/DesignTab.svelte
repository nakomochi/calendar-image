<script lang="ts">
  import { style } from '$lib/stores';
  import { DEFAULT_STYLE } from '$lib/types';
  import ThemeGrid from './ThemeGrid.svelte';
  import ColorSection from './ColorSection.svelte';
  import TypographySection from './TypographySection.svelte';
  import CalendarDetailsSection from './CalendarDetailsSection.svelte';

  function resetDesign() {
    if (!confirm('デザインを初期設定に戻しますか？')) return;
    style.set({ ...DEFAULT_STYLE });
  }
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">テーマ</h3>
  <ThemeGrid />
  <p class="text-[10px] text-gray-400 leading-relaxed">
    テーマを選ぶと配色・フォント・イベントの形が一括で切り替わります。個別に設定した予定の色は保持されます。
  </p>
</div>

<ColorSection />
<TypographySection />
<CalendarDetailsSection />

<button type="button" class="btn btn-ghost btn-xs" onclick={resetDesign}>
  デザインを初期設定に戻す
</button>
