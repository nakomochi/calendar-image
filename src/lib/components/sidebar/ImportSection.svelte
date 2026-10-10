<script lang="ts">
  import { events, utokyoMode } from '$lib/stores';
  import { parseICS, fetchICS } from '$lib/ical/parser';
  import { isHostAllowed, UTOKYO_HOSTS } from '$lib/ical/hosts';

  const FILE_INPUT_ID = 'ics-file-input';

  let icsUrl = $state('');
  let loading = $state(false);
  let error = $state('');
  // Number of events from the last successful load; cleared on the next attempt.
  let loadedCount: number | null = $state(null);

  function validateUTokyoHost(u: string): string {
    let parsed: URL;
    try {
      parsed = new URL(u);
    } catch {
      return '無効な URL です';
    }
    if (!isHostAllowed(parsed.hostname, UTOKYO_HOSTS)) {
      return 'utokyo モードでは u-tokyo.ac.jp ドメインの URL のみ使用可能です';
    }
    return '';
  }

  function beginLoad() {
    loading = true;
    error = '';
    loadedCount = null;
  }

  function applyICS(text: string) {
    const parsed = parseICS(text);
    events.set(parsed);
    loadedCount = parsed.length;
  }

  function handleSubmitUrl(e: SubmitEvent) {
    e.preventDefault();
    loadFromUrl();
  }

  async function loadFromUrl() {
    if (!icsUrl.trim()) return;
    if ($utokyoMode) {
      const msg = validateUTokyoHost(icsUrl);
      if (msg) {
        error = msg;
        loadedCount = null;
        return;
      }
    }
    beginLoad();
    try {
      const text = await fetchICS(
        icsUrl,
        '/api/proxy',
        $utokyoMode ? { strict: 'utokyo' } : undefined,
      );
      applyICS(text);
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
    // Allow re-selecting the same file to reload it.
    input.value = '';
  }

  function readFile(file: File) {
    beginLoad();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        applyICS(e.target?.result as string);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to parse';
      } finally {
        loading = false;
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="space-y-2">
  <h3 class="font-bold text-sm">インポート</h3>
  <form class="flex gap-1" onsubmit={handleSubmitUrl}>
    <input
      type="url"
      class="input input-bordered input-sm flex-1"
      placeholder={$utokyoMode ? 'u-tokyo.ac.jp の ICS URL' : 'iCS URL'}
      aria-label="ICS の URL"
      bind:value={icsUrl}
    />
    <button type="submit" class="btn btn-primary btn-sm" disabled={loading}>
      {loading ? '...' : '読込'}
    </button>
  </form>
  <label
    for={FILE_INPUT_ID}
    class="block border-2 border-dashed rounded-lg p-4 text-center text-xs text-gray-400 cursor-pointer hover:border-primary focus-within:border-primary"
    ondragover={(e) => e.preventDefault()}
    ondrop={handleFileDrop}
  >
    .ics ファイルをドロップ
    <span class="block mt-1 text-primary">またはクリックしてファイルを選択</span>
    <input
      id={FILE_INPUT_ID}
      type="file"
      accept=".ics"
      class="sr-only"
      onchange={handleFileSelect}
    />
  </label>
  {#if error}
    <div class="text-error text-xs">{error}</div>
  {:else if loadedCount !== null}
    <div class="text-success text-xs">{loadedCount} 件の予定を読み込みました</div>
  {/if}
  <p class="text-[10px] text-gray-400 leading-relaxed">
    URL から読み込む場合は Cloudflare Workers で中継しますが、URL や予定の内容は保存・記録しません。URL はリクエスト本文で送るため、アクセスログやキャッシュにも残りません。ファイルを選んだ場合、データは外部に送信されません。 <a href="/#privacy" class="link" target="_blank" rel="noopener">詳細</a>
  </p>
</div>
