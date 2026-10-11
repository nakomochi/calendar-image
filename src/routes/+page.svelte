<script lang="ts">
  import ThemePreview from '$lib/components/ThemePreview.svelte';
  import { THEMES, type Theme } from '$lib/themes';

  const PREVIEW_THEME_IDS = ['ocean', 'sakura', 'midnight', 'editorial'];
  const previewThemes = PREVIEW_THEME_IDS
    .map((id) => THEMES.find((t) => t.id === id))
    .filter((t): t is Theme => t !== undefined);
  // Gentle collage offsets, indexed like previewThemes.
  const PREVIEW_TILTS = ['-rotate-2', 'rotate-1 translate-y-4', 'rotate-1', '-rotate-1 translate-y-4'];

  const STEPS: { title: string; body: string; hint?: string }[] = [
    {
      title: 'カレンダーをつなぐ',
      body: 'ICS の URL を貼るか、.ics ファイルを選ぶだけ。Google カレンダー・Outlook・iCloud に対応。',
      hint: 'Google カレンダー: 設定 › (カレンダー名) › カレンダーの統合 › iCal 形式の非公開アドレス',
    },
    {
      title: '見た目を選ぶ',
      body: '表示形式とテーマを選んで、細部を調整。',
    },
    {
      title: '書き出す',
      body: 'PNG・JPG・SVG・PowerPoint・HTML。',
    },
  ];

  const PRIVACY_POINTS = [
    '.ics ファイルはブラウザ内で処理し、外部に送信しません。',
    'URL は Cloudflare Workers で中継しますが、URL や予定は保存・記録しません。URL は通信の本文で送るため、ログやキャッシュにも残りません。',
    '設定はこのブラウザにだけ保存します。予定と URL は保存しません。',
  ];
</script>

<svelte:head>
  <title>Calendar Image — いつものカレンダーを画像・スライドに</title>
  <meta
    name="description"
    content="Google カレンダーなどの ICS をそのまま読み込んで、カレンダー画像や編集できる PowerPoint・SVG に書き出せます。"
  />
</svelte:head>

<div data-theme="light" class="min-h-screen bg-base-100 text-base-content">
  <header class="sticky top-0 z-40 border-b border-base-200 bg-base-100/85 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
      <a href="/" class="text-lg font-bold tracking-tight">Calendar Image</a>
      <nav aria-label="ページ内リンク" class="flex items-center gap-1">
        <a href="#how" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">使い方</a>
        <a href="#utokyo" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">東大 時間割</a>
        <a href="#privacy" class="btn btn-ghost btn-sm hidden font-normal sm:inline-flex">プライバシー</a>
        <a href="/editor" class="btn btn-primary btn-sm ml-1">エディタを開く</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="mx-auto grid max-w-5xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div class="space-y-6">
        <h1 class="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          いつものカレンダーを、<br />そのまま画像に。
        </h1>
        <p class="text-base leading-relaxed text-base-content/70 sm:text-lg">
          Google カレンダーなどをつなぐだけ。PNG のほか、あとから編集できる PowerPoint・SVG にも書き出せます。
        </p>
        <div class="flex flex-wrap gap-3">
          <a href="/editor" class="btn btn-primary">エディタを開く</a>
          <a href="/timetable/utokyo" class="btn btn-outline">東大の時間割を作る</a>
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
      <div class="mx-auto max-w-5xl px-5 py-14 md:py-16">
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
                {#if step.hint}
                  <p class="text-xs leading-relaxed text-base-content/50">{step.hint}</p>
                {/if}
              </div>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <section id="utokyo" class="scroll-mt-20">
      <div class="mx-auto max-w-5xl px-5 py-14 md:py-16">
        <div class="card border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
            <div class="space-y-2">
              <h2 class="text-xl font-bold tracking-tight sm:text-2xl">東大の時間割</h2>
              <p class="text-sm leading-relaxed text-base-content/70">
                UTAS の授業カレンダーから、曜日×時限の時間割を自動で作れます。
              </p>
              <p class="text-xs leading-relaxed text-base-content/50">
                URL は UTAS › 休講・スケジュール › カレンダー連携 › 授業・定期試験カレンダー から取得できます。
              </p>
            </div>
            <a href="/timetable/utokyo" class="btn btn-primary shrink-0">時間割を作る</a>
          </div>
        </div>
      </div>
    </section>

    <section id="privacy" class="scroll-mt-20 bg-base-200">
      <div class="mx-auto max-w-5xl px-5 py-14 md:py-16">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">プライバシー</h2>
        <ul class="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-base-content/80 marker:text-base-content/40">
          {#each PRIVACY_POINTS as point (point)}
            <li>{point}</li>
          {/each}
        </ul>
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
