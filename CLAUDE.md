# Process Compass

生成AI時代の開発プロセスを体系化し、チーム体制・事業フェーズに合わせて最適な開発プロセスを提案するツールを目指す docs-as-code プロジェクト。Webアプリ開発ではなく**ドキュメント主体**。最終的に GitHub Pages 上のインタラクティブなプロセス提案ツールへ発展させる。

## プロジェクト構造

- `src/content/docs/` — 公開ドキュメント(Starlight)。`vision/`(目的・ロードマップ・ツール構想)、`phase1-current-state/` 〜 `phase6-operation/`(6フェーズの成果物)、`community/`
- `research/` — 一次調査メモ・下書き。体系化できたら docs 配下へ清書して公開する
- `astro.config.mjs` — サイト設定。sidebar は各ディレクトリの autogenerate

## 執筆規約

- **言語**: ドキュメントは日本語。ルートロケール = ja、将来 `locales.en` を追加できる構造を維持する
- **図解ファースト**: 新規概念を未経験者に伝えるプロジェクトなので、文章より図(Mermaid、UML、生成画像)を優先する。プロセスは階層構造(全体 → フェーズ内ワークフロー → 個別作業)で図解する
- ページには必ず frontmatter の `title` と `description` を書く。並び順は `sidebar.order` で制御
- 内部リンクは base パス `/process-compass/` を含める(例: `/process-compass/vision/01-goal/`)

## コマンド

- `npm run dev` — ローカルプレビュー
- `npm run build` — ビルド(公開前に必ず通ること)

## Git 戦略

- 現在はソロ期のため `main` へ直接 push でよい。コントリビューターが現れたら PR フローへ移行する
- `main` への push で `.github/workflows/deploy.yml` が GitHub Pages へ自動デプロイ

## 既知の TODO

- Mermaid のビルド時レンダリング未導入(現状 ```mermaid ブロックはコードとして表示される)。rehype-mermaid か astro-mermaid の導入を検討
- 画像生成基盤(Gemini 画像モデル等)はユーザー側で準備予定

## ライセンス

ドキュメント = CC-BY-4.0、コード = MIT。この二重構成を崩さない。
