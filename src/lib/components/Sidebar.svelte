<script lang="ts">
  import { style, viewType, exportSettings, currentDate, events } from '$lib/stores';
  import { exportToImage } from '$lib/export/image';
  import { parseICS, fetchICS } from '$lib/ical/parser';
  import { formatMonthYear } from '$lib/calendar/utils';
  import type { ViewType, EventSizing, EventAlign } from '$lib/types';

  interface Props {
    calendarEl: HTMLElement | null;
  }

  let { calendarEl }: Props = $props();

  let icsUrl = $state('');
  let loading = $state(false);
  let error = $state('');

  const viewOptions: { value: ViewType; label: string }[] = [
    { value: 'month', label: '月' },
    { value: 'week', label: '週' },
    { value: 'day', label: '日' },
    { value: 'list', label: 'リスト' },
  ];

  async function loadFromUrl() {
    if (!icsUrl.trim()) return;
    loading = true;
    error = '';
    try {
      const text = await fetchICS(icsUrl, '/api/proxy');
      const parsed = parseICS(text);
      events.set(parsed);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load';
    } finally {
      loading = false;
    }
  }

  function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) readFile(file);
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) readFile(file);
  }

  function readFile(file: File) {
    loading = true;
    error = '';
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseICS(text);
        events.set(parsed);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to parse';
      } finally {
        loading = false;
      }
    };
    reader.readAsText(file);
  }

  function navigate(delta: number) {
    currentDate.update((d) => {
      const next = new Date(d);
      if ($viewType === 'month') {
        next.setMonth(next.getMonth() + delta);
      } else if ($viewType === 'week') {
        next.setDate(next.getDate() + delta * 7);
      } else {
        next.setDate(next.getDate() + delta);
      }
      return next;
    });
  }

  async function handleExport() {
    if (!calendarEl) return;
    try {
      await exportToImage(calendarEl, $exportSettings);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Export failed';
    }
  }
</script>

<aside class="w-72 bg-base-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
  <!-- Import -->
  <div class="space-y-2">
    <h3 class="font-bold text-sm">インポート</h3>
    <div class="flex gap-1">
      <input type="text" class="input input-bordered input-sm flex-1" placeholder="iCS URL" bind:value={icsUrl} />
      <button class="btn btn-primary btn-sm" onclick={loadFromUrl} disabled={loading}>
        {loading ? '...' : '読込'}
      </button>
    </div>
    <div
      class="border-2 border-dashed rounded-lg p-4 text-center text-xs text-gray-400 cursor-pointer hover:border-primary"
      role="button"
      tabindex="0"
      ondragover={(e) => e.preventDefault()}
      ondrop={handleFileDrop}
      onkeydown={() => {}}
    >
      .ics ファイルをドロップ
      <input type="file" accept=".ics" class="hidden" onchange={handleFileSelect} id="file-input" />
      <label for="file-input" class="block mt-1 text-primary cursor-pointer">またはファイルを選択</label>
    </div>
    {#if error}
      <div class="text-error text-xs">{error}</div>
    {/if}
  </div>

  <!-- Navigation -->
  <div class="flex items-center justify-between">
    <button class="btn btn-ghost btn-sm" onclick={() => navigate(-1)}>◀</button>
    <span class="text-sm font-medium">{formatMonthYear($currentDate)}</span>
    <button class="btn btn-ghost btn-sm" onclick={() => navigate(1)}>▶</button>
  </div>

  <!-- View Type -->
  <div class="space-y-1">
    <h3 class="font-bold text-sm">表示</h3>
    <div class="join w-full">
      {#each viewOptions as opt}
        <button
          class="join-item btn btn-sm flex-1"
          class:btn-active={$viewType === opt.value}
          onclick={() => viewType.set(opt.value)}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Style -->
  <div class="space-y-2">
    <h3 class="font-bold text-sm">スタイル</h3>

    <label class="flex items-center justify-between text-xs">
      <span>背景色</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.bgColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>文字色</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.textColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>ヘッダー背景</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.headerBgColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>ヘッダー文字</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.headerTextColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>予定の色</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.eventDefaultColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>罫線</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.gridLineColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>今日の背景</span>
      <input type="color" class="w-8 h-6 cursor-pointer rounded" bind:value={$style.todayBgColor} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>角丸</span>
      <input type="range" class="range range-xs range-primary w-24" min="0" max="24" bind:value={$style.borderRadius} />
    </label>
  </div>

  <!-- Event Block -->
  <div class="space-y-2">
    <h3 class="font-bold text-sm">予定ブロック</h3>
    <label class="flex items-center justify-between text-xs">
      <span>サイズ</span>
      <select class="select select-bordered select-xs" bind:value={$style.eventSizing}>
        <option value="equal">均等分割</option>
        <option value="fixed">固定サイズ</option>
      </select>
    </label>
    {#if $style.eventSizing === 'fixed'}
      <label class="flex items-center justify-between text-xs">
        <span>固定サイズ (px)</span>
        <input type="number" class="input input-bordered input-xs w-20" min="10" max="200" bind:value={$style.eventFixedSize} />
      </label>
    {/if}
    <label class="flex items-center justify-between text-xs">
      <span>配置</span>
      <select class="select select-bordered select-xs" bind:value={$style.eventAlign}>
        <option value="start">上揃え</option>
        <option value="center">中央揃え</option>
      </select>
    </label>
  </div>

  <!-- Export -->
  <div class="space-y-2">
    <h3 class="font-bold text-sm">エクスポート</h3>
    <label class="flex items-center justify-between text-xs">
      <span>形式</span>
      <select class="select select-bordered select-xs" bind:value={$exportSettings.format}>
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
      </select>
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>幅</span>
      <input type="number" class="input input-bordered input-xs w-20" bind:value={$exportSettings.width} />
    </label>
    <label class="flex items-center justify-between text-xs">
      <span>高さ</span>
      <input type="number" class="input input-bordered input-xs w-20" bind:value={$exportSettings.height} />
    </label>
    <button class="btn btn-primary btn-sm w-full" onclick={handleExport}>画像をダウンロード</button>
  </div>
</aside>
