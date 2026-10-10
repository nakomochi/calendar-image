<script lang="ts">
  import { utokyoMode } from '$lib/stores';
</script>

<div class="flex items-center gap-2">
  <a href="/" class="font-bold">Calendar Image</a>
  {#if $utokyoMode}
    <span class="badge badge-sm">東大 時間割</span>
  {/if}
</div>
