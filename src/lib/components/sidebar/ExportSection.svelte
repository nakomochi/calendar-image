<script lang="ts">
  import { exportSettings } from '$lib/stores';
  import { exportToImage } from '$lib/export/image';

  interface Props {
    calendarEl: HTMLElement | null;
  }

  let { calendarEl }: Props = $props();
  let error = $state('');

  async function handleExport() {
    if (!calendarEl) return;
    try {
      await exportToImage(calendarEl, $exportSettings);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Export failed';
    }
  }
</script>

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
  {#if error}
    <div class="text-error text-xs">{error}</div>
  {/if}
</div>
