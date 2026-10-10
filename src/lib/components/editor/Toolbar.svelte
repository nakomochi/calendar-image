<script lang="ts">
  import { viewType, utokyoMode, exportSettings, previewFit } from '$lib/stores';
  import { SIZE_PRESETS, type ExportFormat, type ExportSettings, type ViewType } from '$lib/types';
  import { exportCalendar } from '$lib/export';

  interface Props {
    calendarEl: HTMLElement | null;
  }

  let { calendarEl }: Props = $props();

  const BASE_VIEW_OPTIONS: { value: ViewType; label: string }[] = [
    { value: 'grid', label: 'グリッド' },
    { value: 'timeline', label: 'タイムライン' },
    { value: 'list', label: 'リスト' },
  ];
  const TIMETABLE_OPTION: { value: ViewType; label: string } = { value: 'timetable', label: '時間割' };

  const EXPORT_OPTIONS: { format: ExportFormat; label: string; hint: string }[] = [
    { format: 'png', label: 'PNG', hint: '画像・高画質' },
    { format: 'jpg', label: 'JPG', hint: '画像・軽量' },
  ];

  const CUSTOM_PRESET = 'custom';
  const MIN_SIZE = 100;
  const MAX_SIZE = 4000;

  let viewOptions = $derived(
    $utokyoMode ? [TIMETABLE_OPTION, ...BASE_VIEW_OPTIONS] : BASE_VIEW_OPTIONS,
  );

  let presetId = $derived(
    SIZE_PRESETS.find((p) => p.width === $exportSettings.width && p.height === $exportSettings.height)?.id
      ?? CUSTOM_PRESET,
  );

  let exportMenu: HTMLDetailsElement | null = $state(null);
  let busy = $state(false);
  let error = $state('');

  function selectPreset(e: Event) {
    const preset = SIZE_PRESETS.find((p) => p.id === (e.currentTarget as HTMLSelectElement).value);
    if (preset) exportSettings.set({ width: preset.width, height: preset.height });
  }

  // Committed on change (blur / Enter) so intermediate keystrokes don't resize the canvas.
  function commitDimension(key: keyof ExportSettings, e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const n = Math.round(Number(input.value));
    const next = input.value !== '' && Number.isFinite(n)
      ? Math.min(MAX_SIZE, Math.max(MIN_SIZE, n))
      : $exportSettings[key];
    exportSettings.update((s) => ({ ...s, [key]: next }));
    input.value = String(next);
  }

  async function handleExport(format: ExportFormat) {
    if (exportMenu) exportMenu.open = false;
    if (!calendarEl || busy) return;
    busy = true;
    error = '';
    try {
      await exportCalendar(calendarEl, $exportSettings, format);
    } catch (e) {
      error = e instanceof Error ? e.message : '書き出しに失敗しました';
    } finally {
      busy = false;
    }
  }

  function closeMenuOnOutsideClick(e: MouseEvent) {
    if (exportMenu?.open && !exportMenu.contains(e.target as Node)) exportMenu.open = false;
  }
</script>

<svelte:document onclick={closeMenuOnOutsideClick} />

<div class="bg-base-100 border-b border-base-300 px-3 py-2 flex items-center gap-3 flex-wrap shrink-0">
  <div class="join" role="group" aria-label="表示形式">
    {#each viewOptions as opt (opt.value)}
      <button
        type="button"
        class="join-item btn btn-sm"
        class:btn-primary={$viewType === opt.value}
        aria-pressed={$viewType === opt.value}
        onclick={() => viewType.set(opt.value)}
      >
        {opt.label}
      </button>
    {/each}
  </div>

  <div class="flex items-center gap-1">
    <select class="select select-sm w-36" aria-label="サイズ" value={presetId} onchange={selectPreset}>
      {#each SIZE_PRESETS as preset (preset.id)}
        <option value={preset.id}>{preset.label}</option>
      {/each}
      {#if presetId === CUSTOM_PRESET}
        <option value={CUSTOM_PRESET} disabled>カスタム</option>
      {/if}
    </select>
    <input
      type="number"
      class="input input-sm w-20"
      min={MIN_SIZE}
      max={MAX_SIZE}
      aria-label="幅"
      value={$exportSettings.width}
      onchange={(e) => commitDimension('width', e)}
    />
    <span class="text-xs text-base-content/60">×</span>
    <input
      type="number"
      class="input input-sm w-20"
      min={MIN_SIZE}
      max={MAX_SIZE}
      aria-label="高さ"
      value={$exportSettings.height}
      onchange={(e) => commitDimension('height', e)}
    />
  </div>

  <div class="join" role="group" aria-label="プレビューの倍率">
    <button
      type="button"
      class="join-item btn btn-sm"
      class:btn-active={$previewFit}
      aria-pressed={$previewFit}
      onclick={() => previewFit.set(true)}
    >
      フィット
    </button>
    <button
      type="button"
      class="join-item btn btn-sm"
      class:btn-active={!$previewFit}
      aria-pressed={!$previewFit}
      onclick={() => previewFit.set(false)}
    >
      100%
    </button>
  </div>

  <div class="ml-auto flex items-center gap-2">
    {#if error}
      <span class="text-error text-xs">{error}</span>
    {/if}
    <details class="dropdown dropdown-end" bind:this={exportMenu}>
      <summary class="btn btn-primary btn-sm" class:btn-disabled={busy || !calendarEl}>
        {#if busy}
          <span class="loading loading-spinner loading-xs"></span>
        {/if}
        書き出し
      </summary>
      <ul class="menu dropdown-content bg-base-100 rounded-box z-30 mt-1 w-48 p-2 shadow-lg">
        {#each EXPORT_OPTIONS as opt (opt.format)}
          <li>
            <button type="button" class="flex justify-between" onclick={() => handleExport(opt.format)}>
              <span class="font-bold">{opt.label}</span>
              <span class="text-xs text-base-content/60">{opt.hint}</span>
            </button>
          </li>
        {/each}
      </ul>
    </details>
  </div>
</div>
