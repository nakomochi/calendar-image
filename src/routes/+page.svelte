<script lang="ts">
  import afterImage from '$lib/assets/lp-after-shinkan.png';

  // Intrinsic size of the exported image (510x520 canvas at pixelRatio 2).
  const AFTER_IMAGE_WIDTH = 1020;
  const AFTER_IMAGE_HEIGHT = 1040;

  const BTN =
    'inline-flex items-center justify-center whitespace-nowrap border-[1.5px] font-bold transition-colors';
  const BTN_MD = `${BTN} rounded-[10px] px-[18px] py-[11px] text-sm`;
  const BTN_SM = `${BTN} rounded-lg px-3 py-[7px] text-[13px]`;
  const BTN_PRIMARY = 'border-transparent bg-indigo-600 text-white shadow-[0_2px_0_#3730a3] hover:bg-indigo-700';
  const BTN_OUTLINE = 'border-gray-800 bg-white text-gray-800 hover:bg-gray-50';

  const SECTION_TITLE = 'text-[21px] font-extrabold tracking-[-0.01em] md:text-[26px]';

  const BEFORE_ROWS = [
    { date: '4月6日 (火)', time: '18:00', title: '新歓説明会' },
    { date: '4月8日 (木)', time: '16:00', title: '活動体験' },
    { date: '4月13日 (火)', time: '18:00', title: '新歓説明会' },
    { date: '4月17日 (土)', time: '19:00', title: '新歓観望会' },
  ];

  type UseIcon = 'people' | 'store' | 'book';

  const USES: { icon: UseIcon; tile: string; title: string; body: string }[] = [
    { icon: 'people', tile: 'bg-amber-100', title: 'サークル・部活の活動予定', body: '活動日や新歓の日程を SNS で共有' },
    { icon: 'store', tile: 'bg-green-100', title: 'お店の営業日カレンダー', body: '定休日や臨時休業をまとめてお知らせ' },
    { icon: 'book', tile: 'bg-blue-100', title: '教室・レッスンの日程', body: '開講日や振替日を生徒さんに共有' },
  ];

  const FORMATS = [
    { name: 'PNG・JPG', body: '画像としてそのまま共有・印刷' },
    { name: 'PPTX', body: 'PowerPoint・Google スライド・Canva で手直し' },
    { name: 'SVG', body: 'Figma・Illustrator で手直し' },
    { name: 'HTML', body: 'Web ページに埋め込み' },
  ];

  const UNIVERSITIES = [{ name: '東京大学', href: '/timetable/utokyo' }];

  // Sentences are split into phrases that never break internally (see `phrases`).
  const TIMETABLE_LEAD = ['授業カレンダーを読み込むと、', '曜日×時限の時間割を', '自動で作れます。'];

  const PRIVACY_POINTS = [
    ['.ics ファイルは', 'ブラウザ内で処理し、', '外部に送信しません。'],
    ['URL は', '中継サーバーを経由しますが、', 'URL や予定は', '保存・記録しません。'],
    ['設定はこのブラウザにだけ', '保存します。', '予定と URL は', '保存しません。'],
  ];

  const REPO_URL = 'https://github.com/nakomochi/calendar-image';
</script>

<svelte:head>
  <title>Calendar Image — 使っているカレンダーから、見せるカレンダーへ</title>
  <meta
    name="description"
    content="Google カレンダーなどの予定をそのまま読み込んで、カレンダー画像や PowerPoint・SVG・HTML に書き出せます。登録不要。"
  />
  <!-- Heavier Noto Sans JP weights used only by the landing headings. -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@800;900&display=swap" />
</svelte:head>

{#snippet phrases(parts: string[])}
  {#each parts as part, i (i)}<span class="inline-block">{part}</span>{/each}
{/snippet}

{#snippet useIcon(icon: UseIcon)}
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if icon === 'people'}
      <g stroke="#b45309">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <circle cx="17" cy="9" r="2.3" />
        <path d="M16 14.2c2.6 0 4.5 1.6 4.5 4.3" />
      </g>
    {:else if icon === 'store'}
      <g stroke="#15803d">
        <path d="M4.5 10.5V19.5h15v-9" />
        <path d="M3 10l2-5h14l2 5" />
        <path d="M3 10a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0" />
        <path d="M10 19.5v-4.5h4v4.5" />
      </g>
    {:else}
      <g stroke="#1d4ed8">
        <path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z" />
        <path d="M12 6.5v13" />
      </g>
    {/if}
  </svg>
{/snippet}

<div data-theme="light" class="jp-wrap min-h-screen bg-white text-gray-800">
  <header class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-[1040px] items-center justify-between gap-3 px-5 py-3 md:px-6">
      <a href="/" class="text-[17px] font-extrabold tracking-[-0.01em]">Calendar Image</a>
      <nav aria-label="ページ内リンク" class="flex items-center gap-1">
        <a href="#timetable" class="hidden px-2.5 py-1.5 text-[13px] text-gray-500 hover:text-gray-800 sm:inline">大学の時間割</a>
        <a href="#privacy" class="hidden px-2.5 py-1.5 text-[13px] text-gray-500 hover:text-gray-800 sm:inline">プライバシー</a>
        <a href="/editor" class="{BTN_SM} {BTN_PRIMARY}">はじめる</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="mx-auto max-w-[1040px] px-5 pt-11 pb-9 md:px-6 md:pt-[72px] md:pb-16">
      <div class="@container text-center">
        <h1
          class="text-[length:min(27px,calc(100cqw/13))] leading-[1.35] font-black tracking-[-0.02em] md:text-[48px] md:leading-[1.25]"
        >
          <span class="inline-block">使っているカレンダーから、</span><span class="inline-block">見せるカレンダーへ。</span>
        </h1>
        <p class="mx-auto mt-3.5 max-w-[34em] text-[14.5px] leading-[1.85] text-gray-500 md:mt-[18px] md:text-[17px]">
          Google カレンダーなどの予定を<wbr />そのまま読み込んで、<wbr />すぐに画像やファイルに。<wbr />あとから手直しも<wbr />できます。
        </p>
        <div class="mt-[26px] flex flex-wrap justify-center gap-2.5">
          <a href="/editor" class="{BTN_MD} {BTN_PRIMARY}">作り始める</a>
          <a href="#timetable" class="{BTN_MD} {BTN_OUTLINE}">大学の時間割を作る</a>
        </div>
        <p class="mt-2.5 text-xs text-gray-400">登録不要・ブラウザだけで使えます</p>
      </div>

      <div class="mt-10 grid grid-cols-1 items-center gap-1.5 md:grid-cols-[1fr_56px_1.25fr] md:gap-2">
        <div>
          <p class="mb-2 text-xs font-bold text-gray-500">いつものカレンダー（Google カレンダーなど）</p>
          <div class="overflow-hidden rounded-xl border border-gray-200 bg-white text-xs shadow-[0_8px_20px_rgba(17,24,39,0.06)]">
            <div class="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-[#5f6368]">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="3.5" y="5" width="17" height="15" rx="2" />
                <path d="M3.5 10h17M8 3v4M16 3v4" />
              </svg>
              カレンダー
            </div>
            <ul>
              {#each BEFORE_ROWS as row (row.date)}
                <li class="grid grid-cols-[70px_1fr] gap-2.5 border-b border-[#f1f3f4] px-3 py-2 last:border-b-0">
                  <span class="text-[11px] text-[#70757a]">{row.date}</span>
                  <span class="flex items-center gap-2 text-[#3c4043]">
                    <span class="size-2 flex-none rounded-full bg-blue-500" aria-hidden="true"></span>
                    <span class="w-11 flex-none text-[11px] whitespace-nowrap text-[#70757a]">{row.time}</span>
                    {row.title}
                  </span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="flex justify-center text-indigo-600" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            class="size-[34px] rotate-90 md:rotate-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>

        <div>
          <p class="mb-2 text-xs font-bold text-gray-500">見せるカレンダー</p>
          <img
            src={afterImage}
            width={AFTER_IMAGE_WIDTH}
            height={AFTER_IMAGE_HEIGHT}
            alt="天文サークルの4月の新歓日程カレンダー"
            class="h-auto w-full rounded-2xl shadow-[0_18px_50px_rgba(17,24,39,0.16)] ring-1 ring-[#eef0f3]"
          />
        </div>
      </div>
    </section>

    <section class="bg-[#f8f8fa]">
      <div class="mx-auto max-w-[1040px] px-5 py-11 md:px-6 md:py-16">
        <h2 class={SECTION_TITLE}>こんなときに</h2>
        <ul class="mt-6 grid grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-3.5">
          {#each USES as use (use.title)}
            <li class="flex items-center gap-3.5 rounded-[14px] border border-gray-200 bg-white p-4">
              <div class="flex size-11 flex-none items-center justify-center rounded-xl {use.tile}">
                {@render useIcon(use.icon)}
              </div>
              <div>
                <h3 class="text-[14.5px] font-bold">{use.title}</h3>
                <p class="mt-[3px] text-[12.5px] leading-[1.6] text-gray-500">{use.body}</p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-[1040px] px-5 py-11 md:px-6 md:py-16">
        <h2 class={SECTION_TITLE}>書き出せる形式</h2>
        <dl class="mt-[18px] max-w-[560px]">
          {#each FORMATS as format (format.name)}
            <div
              class="grid grid-cols-[96px_1fr] gap-3 border-b border-gray-200 py-3 text-[13.5px] first:border-t md:grid-cols-[120px_1fr] md:text-sm"
            >
              <dt class="font-extrabold">{format.name}</dt>
              <dd class="text-gray-500">{format.body}</dd>
            </div>
          {/each}
        </dl>
      </div>
    </section>

    <section id="timetable" class="scroll-mt-16 bg-[#f8f8fa]">
      <div class="mx-auto max-w-[1040px] px-5 py-11 md:px-6 md:py-16">
        <h2 class={SECTION_TITLE}>大学の時間割</h2>
        <p class="mt-2 text-sm leading-[1.8] text-gray-500">{@render phrases(TIMETABLE_LEAD)}</p>
        <ul class="mt-5 grid gap-2.5">
          {#each UNIVERSITIES as uni (uni.href)}
            <li
              class="flex flex-col items-stretch gap-4 rounded-[14px] border border-gray-200 bg-white px-[18px] py-4 md:flex-row md:items-center md:justify-between"
            >
              <h3 class="text-base font-extrabold">{uni.name}</h3>
              <a href={uni.href} class="{BTN_SM} {BTN_PRIMARY}">時間割を作る</a>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <section id="privacy" class="scroll-mt-16">
      <div class="mx-auto max-w-[1040px] px-5 py-11 md:px-6 md:py-16">
        <h2 class={SECTION_TITLE}>プライバシー</h2>
        <ul class="mt-3.5 grid list-disc gap-1 pl-[1.2em] text-[13.5px] leading-[1.8] text-gray-700">
          {#each PRIVACY_POINTS as point (point.join(''))}
            <li>{@render phrases(point)}</li>
          {/each}
          <li>
            {@render phrases(['オープンソースです。', '中継サーバーの処理も含めて、'])}<span class="inline-block"
              ><a href={REPO_URL} class="text-indigo-600 hover:underline" target="_blank" rel="noopener">GitHub</a
              > で</span
            >{@render phrases(['ソースコードを', '確認できます。'])}
          </li>
        </ul>
      </div>
    </section>
  </main>

  <footer class="border-t border-gray-100">
    <div class="mx-auto flex max-w-[1040px] flex-wrap justify-between gap-3 px-5 py-5 text-xs text-gray-400 md:px-6">
      <p>© Calendar Image</p>
      <nav aria-label="フッター" class="flex items-center gap-1.5">
        <a href="/editor" class="hover:text-gray-600">作り始める</a>
        <span aria-hidden="true">・</span>
        <a href="/timetable/utokyo" class="hover:text-gray-600">大学の時間割</a>
      </nav>
    </div>
  </footer>
</div>
