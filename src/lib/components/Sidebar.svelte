<script lang="ts">
  import { events, viewType, hiddenEvents, utokyoMode, style, patchEvents } from '$lib/stores';
  import { parseICS, fetchICS } from '$lib/ical/parser';
  import { isHostAllowed, UTOKYO_HOSTS } from '$lib/ical/hosts';
  import { formatDate } from '$lib/calendar/utils';
  import type { Component } from 'svelte';
  import type { CalendarEvent, ViewType } from '$lib/types';
  import { VIEW_MODULES, type SettingModule } from '$lib/settings/capabilities';
  import DateRangeSection from './sidebar/DateRangeSection.svelte';
  import TimeRangeSection from './sidebar/TimeRangeSection.svelte';
  import TimetableConfigSection from './sidebar/TimetableConfigSection.svelte';
  import StyleSection from './sidebar/StyleSection.svelte';
  import EventDisplaySection from './sidebar/EventDisplaySection.svelte';
  import TimetableEventDisplaySection from './sidebar/TimetableEventDisplaySection.svelte';
  import AdvancedStyleSection from './sidebar/AdvancedStyleSection.svelte';
  import ExportSection from './sidebar/ExportSection.svelte';

  const SECTION_COMPONENT: Record<SettingModule, Component> = {
    dateRange: DateRangeSection,
    timeRange: TimeRangeSection,
    timetableConfig: TimetableConfigSection,
    style: StyleSection,
    eventDisplay: EventDisplaySection,
    timetableEventDisplay: TimetableEventDisplaySection,
    advancedStyle: AdvancedStyleSection,
  };

  let hiddenOpen = $state(false);

  interface Props {
    calendarEl: HTMLElement | null;
    onclickDay: (date: Date) => void;
  }

  let { calendarEl, onclickDay }: Props = $props();

  let icsUrl = $state('');
  let loading = $state(false);
  let error = $state('');

  const BASE_VIEW_OPTIONS: { value: ViewType; label: string }[] = [
    { value: 'grid', label: 'グリッド' },
    { value: 'timeline', label: 'タイムライン' },
    { value: 'list', label: 'リスト' },
  ];
  const TIMETABLE_OPTION: { value: ViewType; label: string } = { value: 'timetable', label: '時間割' };

  let viewOptions = $derived(
    $utokyoMode ? [TIMETABLE_OPTION, ...BASE_VIEW_OPTIONS] : BASE_VIEW_OPTIONS,
  );

  let activeModules = $derived(VIEW_MODULES[$viewType]);

  // Collapse repeated occurrences (e.g. weekly courses) into a single row in the hidden list.
  function hiddenGroupKey(ev: CalendarEvent): string {
    if (ev.allDay) return `allday::${ev.title}`;
    const d = new Date(ev.start);
    return `${d.getDay()}::${d.getHours()}:${d.getMinutes()}::${ev.title}`;
  }

  let hiddenGroups = $derived.by(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of $hiddenEvents) {
      const k = hiddenGroupKey(ev);
      const arr = map.get(k);
      if (arr) arr.push(ev);
      else map.set(k, [ev]);
    }
    return [...map.entries()].map(([key, evs]) => ({ key, events: evs }));
  });

  function restoreGroup(group: CalendarEvent[]) {
    patchEvents(new Set(group.map((e) => e.id)), { visible: true });
  }

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
        return;
      }
    }
    loading = true;
    error = '';
    try {
      const text = await fetchICS(
        icsUrl,
        '/api/proxy',
        $utokyoMode ? { strict: 'utokyo' } : undefined,
      );
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
</script>

<aside class="w-90 bg-base-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
  <!-- Import -->
  <div class="space-y-2">
    <h3 class="font-bold text-sm">インポート</h3>
    <form class="flex gap-1" onsubmit={handleSubmitUrl}>
      <input
        type="url"
        class="input input-bordered input-sm flex-1"
        placeholder={$utokyoMode ? 'u-tokyo.ac.jp の ICS URL' : 'iCS URL'}
        bind:value={icsUrl}
      />
      <button type="submit" class="btn btn-primary btn-sm" disabled={loading}>
        {loading ? '...' : '読込'}
      </button>
    </form>
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
    <p class="text-[10px] text-gray-400 leading-relaxed">
      URL から読み込む場合は Cloudflare Workers で中継しますが、URL や予定の内容は保存・記録しません。URL はリクエスト本文で送るため、アクセスログやキャッシュにも残りません。ファイルを選んだ場合、データは外部に送信されません。 <a href="/#privacy" class="link" target="_blank" rel="noopener">詳細</a>
    </p>
  </div>

  <!-- View Type -->
  <div class="space-y-1">
    <h3 class="font-bold text-sm">表示</h3>
    <div class="join w-full">
      {#each viewOptions as opt}
        <button
          class="join-item btn btn-sm flex-1"
          class:btn-primary={$viewType === opt.value}
          onclick={() => viewType.set(opt.value)}
        >
          {opt.label}
        </button>
      {/each}
    </div>
  </div>

  {#each activeModules as mod (mod)}
    {@const Section = SECTION_COMPONENT[mod]}
    <Section />
  {/each}

  <!-- Hidden Events -->
  {#if $hiddenEvents.length > 0}
    <div class="space-y-2">
      <button class="flex items-center gap-1 font-bold text-sm w-full text-left cursor-pointer" onclick={() => hiddenOpen = !hiddenOpen}>
        <span class="text-xs">{hiddenOpen ? '▼' : '▶'}</span>
        <span>非表示の予定 ({$viewType === 'timetable' ? hiddenGroups.length : $hiddenEvents.length})</span>
      </button>
      {#if hiddenOpen}
        <div class="space-y-1 max-h-48 overflow-y-auto">
          {#each hiddenGroups as group (group.key)}
            {@const head = group.events[0]}
            {@const showCount = $viewType !== 'timetable' && group.events.length > 1}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex items-center gap-2 text-xs bg-base-100 rounded px-2 py-1.5 w-full text-left cursor-pointer hover:bg-base-300"
              onclick={() => onclickDay(new Date(head.start))}
              onkeydown={() => {}}
              role="button"
              tabindex="0"
            >
              <div class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {head.color || $style.eventDefaultColor};"></div>
              <div class="min-w-0 flex-1">
                <div class="truncate">{head.title}{showCount ? ` × ${group.events.length}` : ''}</div>
                <div class="text-[10px] text-gray-400">{formatDate(new Date(head.start))}</div>
              </div>
              <button
                class="btn btn-ghost btn-xs px-1 shrink-0"
                onclick={(e) => { e.stopPropagation(); restoreGroup(group.events); }}
              >
                表示
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <ExportSection {calendarEl} />
</aside>
