<script lang="ts">
  import { style } from '$lib/stores';
</script>

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
