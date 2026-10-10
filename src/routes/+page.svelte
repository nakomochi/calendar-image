<script lang="ts">
  import ThemePreview from '$lib/components/ThemePreview.svelte';
  import { THEMES, type Theme } from '$lib/themes';

  const PREVIEW_THEME_IDS = ['ocean', 'sakura', 'midnight', 'editorial'];
  const previewThemes = PREVIEW_THEME_IDS
    .map((id) => THEMES.find((t) => t.id === id))
    .filter((t): t is Theme => t !== undefined);
  // Gentle collage offsets, indexed like previewThemes.
  const PREVIEW_TILTS = ['-rotate-2', 'rotate-1 translate-y-4', 'rotate-1', '-rotate-1 translate-y-4'];

  const STEPS = [
    {
      title: 'ICS を用意する',
      body: 'Google カレンダーなら「設定 › (カレンダー名) › カレンダーの統合 › iCal 形式の非公開アドレス」の URL をコピー。.ics ファイルでも OK。',
    },
    {
      title: '読み込んでデザインする',
      body: 'グリッド・タイムライン・リストから表示を選び、テーマや表示項目を調整。',
    },
    {
      title: '書き出す',
      body: 'PNG / JPG / SVG / PowerPoint (編集可能) / HTML で保存。',
    },
  ];

  const UNIVERSITIES = [
    {
      name: '東京大学',
      description:
        '全学共通の時限 (1〜6限) に合わせて、S1 / S2 / A1 / A2 ごとに授業を集計。u-tokyo.ac.jp の ICS URL に対応。',
      href: '/timetable/utokyo',
    },
  ];
</script>

<svelte:head>
  <title>Calendar Image — ICS カレンダーを画像・スライドに</title>
  <meta
    name="description"
    content="Google カレンダーなどの ICS を読み込んで、テーマを選ぶだけ。PNG・SVG・PowerPoint・HTML に書き出せるカレンダー画像ジェネレーター。大学の時間割にも対応。"
  />
</svelte:head>

<div data-theme="light" class="min-h-screen bg-base-100 text-base-content">
  <header class="sticky top-0 z-40 border-b border-base-200 bg-base-100/85 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
      <a href="/" class="text-lg font-bold tracking-tight">Calendar Image</a>
      <nav aria-label="ページ内リンク" class="flex items-center gap-1">
        <a href="#how" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">使い方</a>
        <a href="#universities" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">対応大学</a>
        <a href="#privacy" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">プライバシー</a>
        <a href="/editor" class="btn btn-primary btn-sm ml-1">エディタを開く</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="mx-auto grid max-w-5xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div class="space-y-6">
        <h1 class="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          ICS カレンダーを、そのまま<br class="hidden sm:inline" />見せられる画像に。
        </h1>
        <p class="text-base leading-relaxed text-base-content/70 sm:text-lg">
          Google カレンダーなどの ICS を読み込んで、テーマを選ぶだけ。PNG・SVG・PowerPoint・HTML に書き出せます。
        </p>
        <div class="flex flex-wrap gap-3">
          <a href="/editor" class="btn btn-primary">エディタを開く</a>
          <a href="#universities" class="btn btn-outline">大学の時間割を作る</a>
        </div>
      </div>

      <div class="mx-auto grid w-full max-w-md grid-cols-2 gap-5 pb-4" aria-hidden="true">
        {#each previewThemes as theme, i (theme.id)}
          <div class="rounded-2xl bg-base-100 p-2 shadow-lg ring-1 ring-base-200 {PREVIEW_TILTS[i]}">
            <ThemePreview {theme} />
          </div>
        {/each}
      </div>
    </section>

    <section id="how" class="scroll-mt-20 bg-base-200">
      <div class="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">使い方</h2>
        <ol class="mt-8 grid gap-5 md:grid-cols-3">
          {#each STEPS as step, i (step.title)}
            <li class="card bg-base-100 shadow-sm">
              <div class="card-body gap-3">
                <span
                  class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 class="card-title text-base">{step.title}</h3>
                <p class="text-sm leading-relaxed text-base-content/70">{step.body}</p>
              </div>
            </li>
          {/each}
        </ol>
        <p class="mt-6 text-sm text-base-content/60">
          URL 読み込み対応: Google カレンダー・Outlook・iCloud・東京大学 (u-tokyo.ac.jp)
        </p>
        <p class="mt-2 text-xs text-base-content/50">
          ※ PowerPoint・SVG は、Noto Sans JP などのフォントが入っていない環境では代わりのフォントで表示されます。
        </p>
      </div>
    </section>

    <section id="universities" class="scroll-mt-20">
      <div class="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">大学の時間割に対応</h2>
        <p class="mt-3 text-base-content/70">
          以下の大学では、授業の予定から曜日×時限の時間割を自動で組み立てます。
        </p>
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {#each UNIVERSITIES as uni (uni.href)}
            <article class="card border border-base-200 bg-base-100 shadow-sm">
              <div class="card-body">
                <h3 class="card-title">{uni.name}</h3>
                <p class="text-sm leading-relaxed text-base-content/70">{uni.description}</p>
                <div class="card-actions mt-2 justify-end">
                  <a href={uni.href} class="btn btn-primary btn-sm">時間割を作る</a>
                </div>
              </div>
            </article>
          {/each}
          <div
            class="card flex items-center justify-center border-2 border-dashed border-base-300 p-8 text-center text-sm text-base-content/50"
          >
            他の大学も順次対応予定
          </div>
        </div>
      </div>
    </section>

    <section id="privacy" class="scroll-mt-20 bg-base-200">
      <div class="mx-auto max-w-5xl px-5 py-16 md:py-20">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">プライバシーと通信について</h2>
        <div class="card mt-8 bg-base-100 shadow-sm">
          <div class="card-body">
            <ul class="list-disc space-y-3 pl-5 text-sm leading-relaxed text-base-content/80 marker:text-base-content/40">
              <li><strong>.ics ファイル</strong>を選んだ場合、データはブラウザ内だけで処理され、外部に送信されません。</li>
              <li>
                <strong>URL から読み込む場合</strong>、ブラウザの制約 (CORS) で直接取得できないため、Cloudflare Workers 上の中継サーバーを経由します。中継サーバーは URL や予定の内容を保存・記録しません。
              </li>
              <li>URL は通信の本文 (POST) で送るため、アクセスログに残らず、レスポンスもキャッシュされません (no-store)。</li>
              <li>
                障害調査のため、リクエストの日時やステータスなどの基本的な記録が Cloudflare に残る場合がありますが、URL や予定の内容は含まれません。
              </li>
              <li>中継できるのは Google カレンダー・Outlook・iCloud・u-tokyo.ac.jp のみです。</li>
              <li>画像・PowerPoint・SVG・HTML の生成はすべてブラウザ内で行います。</li>
              <li>デザインなどの設定はブラウザ (localStorage) に保存されます。予定データと URL は保存しません。</li>
            </ul>
          </div>
        </div>
        <div role="alert" class="alert alert-warning alert-soft mt-6 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>
            非公開 URL はパスワードと同じです。他人に共有しないでください。漏れた場合は Google カレンダーの設定から非公開アドレスをリセットできます。
          </span>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t border-base-200">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-base-content/50">
      <p>© Calendar Image</p>
      <nav aria-label="フッター" class="flex gap-4">
        <a href="/editor" class="link link-hover">エディタ</a>
        <a href="/timetable/utokyo" class="link link-hover">東大 時間割</a>
      </nav>
    </div>
  </footer>
</div>
