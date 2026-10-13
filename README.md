# みせカレ

使っているカレンダーから、見せるカレンダーへ。

Google カレンダーなどの予定（ICS）をそのまま読み込んで、告知用のカレンダー画像やファイルを作る Web アプリです。

https://misekare.nakomochi.dev

## できること

- ICS の URL（Google カレンダー・Outlook・iCloud）または .ics ファイルを読み込む
- 月間グリッド・タイムライン・リストで表示し、テーマや表示項目を調整する
- タイトル・注記・凡例・予定の一覧を付ける
- PNG・JPG・PPTX・SVG・HTML で書き出す
- 大学の時間割（東京大学）: UTAS の授業カレンダーから曜日×時限の時間割を作る

## プライバシー

- .ics ファイルはブラウザ内で処理し、外部に送信しません。
- URL から読み込む場合は Cloudflare Workers 上の中継サーバーを経由しますが、URL や予定は保存・記録しません。URL は POST の本文で送るため、アクセスログやキャッシュにも残りません。
- 設定はブラウザ（localStorage）にだけ保存します。予定と URL は保存しません。

## 開発

```sh
bun install
bun run dev      # 開発サーバー
bun run check    # 型チェック
bun run build    # ビルド
bun run deploy   # Cloudflare Workers にデプロイ
```

SvelteKit（Svelte 5）+ Tailwind CSS + daisyUI、Cloudflare Workers で動いています。

## ライセンス

[MIT](./LICENSE)
