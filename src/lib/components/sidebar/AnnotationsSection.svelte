<script lang="ts">
  import { annotations, explainMode, legendColors, viewType } from '$lib/stores';
  import { explainModes } from '$lib/settings/capabilities';
  import type { ExplainMode } from '$lib/types';

  const EXPLAIN_LABELS: Record<ExplainMode, string> = {
    none: 'なし',
    legend: '凡例',
    list: '一覧',
  };
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">タイトル・説明</h3>
  <label class="flex items-center justify-between text-xs gap-2">
    <span class="shrink-0">小見出し</span>
    <input
      type="text"
      class="input input-bordered input-xs w-44"
      placeholder="例: 天文サークル"
      bind:value={$annotations.subtitle}
    />
  </label>
  <label class="flex items-center justify-between text-xs gap-2">
    <span class="shrink-0">タイトル</span>
    <input
      type="text"
      class="input input-bordered input-xs w-44"
      placeholder="例: 4月の新歓日程"
      bind:value={$annotations.title}
    />
  </label>
  <label class="flex items-center justify-between text-xs gap-2">
    <span class="shrink-0">注記</span>
    <input
      type="text"
      class="input input-bordered input-xs w-44"
      placeholder="例: 集合は 1 号館前"
      bind:value={$annotations.note}
    />
  </label>
  <label class="flex items-center justify-between text-xs">
    <span>タイトル文字サイズ</span>
    <input type="number" class="input input-bordered input-xs w-20" min="12" max="96" bind:value={$annotations.titleSize} />
  </label>

  <!-- Shows the mode in effect for this view, so a 'list' left over from another view reads as なし. -->
  <label class="flex items-center justify-between text-xs gap-2">
    <span class="shrink-0">予定の説明</span>
    <select
      class="select select-bordered select-xs w-44"
      value={$explainMode}
      onchange={(e) => ($annotations.explain = e.currentTarget.value as ExplainMode)}
    >
      {#each explainModes($viewType) as mode (mode)}
        <option value={mode}>{EXPLAIN_LABELS[mode]}</option>
      {/each}
    </select>
  </label>
  {#if $explainMode === 'legend'}
    {#if $legendColors.length === 0}
      <p class="text-xs text-base-content/60">予定を読み込むと色が表示されます</p>
    {:else}
      <div class="space-y-1.5 pl-1">
        {#each $legendColors as color (color)}
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded shrink-0 border border-base-300" style="background-color: {color};"></span>
            <input
              type="text"
              class="input input-bordered input-xs flex-1 min-w-0"
              placeholder="凡例名"
              aria-label="{color} の凡例名"
              bind:value={$annotations.legendLabels[color]}
            />
          </div>
        {/each}
      </div>
      <p class="text-xs text-base-content/60">名前を入れた色だけが凡例に表示されます</p>
    {/if}
  {:else if $explainMode === 'list'}
    <p class="text-xs text-base-content/60">
      同じ名前の予定をまとめて、日付・時間・場所を自動で並べます。名前や色は予定の編集から変えられます。
    </p>
  {/if}
</div>
