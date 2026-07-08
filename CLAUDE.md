# Process Compass

生成AI時代の開発プロセスを体系化し、チーム体制・事業フェーズに合わせて最適な開発プロセスを提案するツールを目指す docs-as-code プロジェクト。Webアプリ開発ではなく**ドキュメント主体**。最終的に GitHub Pages 上のインタラクティブなプロセス提案ツールへ発展させる。

## プロジェクト構造

- `src/content/docs/` — 公開ドキュメント(Starlight)。`vision/`(目的・ロードマップ・ツール構想)、`phase1-current-state/` 〜 `phase6-operation/`(6フェーズの成果物)、`community/`
- `research/` — 一次調査メモ・下書き。体系化できたら docs 配下へ清書して公開する
- `astro.config.mjs` — サイト設定。sidebar は各ディレクトリの autogenerate

## 執筆規約

- **言語**: ドキュメントは日本語。ルートロケール = ja、将来 `locales.en` を追加できる構造を維持する
- **図解ファースト**: 新規概念を未経験者に伝えるプロジェクトなので、文章より図(Mermaid、UML、生成画像)を優先する。プロセスは階層構造(全体 → フェーズ内ワークフロー → 個別作業)で図解する。```mermaid ブロックは astro-mermaid が自動レンダリングする(テーマ切替対応)
- **日本語校正**: textlint(preset-ja-technical-writing)を通すこと。箇条書きは「である調 / 体言止め」、本文は「ですます調」。ルール調整は `.textlintrc.json`
- ページには必ず frontmatter の `title` と `description` を書く。並び順は `sidebar.order` で制御
- 内部リンクは base パス `/process-compass/` を含める(例: `/process-compass/vision/01-goal/`)

## コマンド

- `npm run dev` — ローカルプレビュー
- `npm run check` — textlint + ビルド(push 前に必ず通ること。PR では CI (`ci.yml`) が同じチェックを実行)

## Claude Code 設定(.claude/)

- **skills**: `/ja-proofread`(日本語校正)、`/mermaid-diagram`(作図規約)、`/research-to-docs`(調査メモ清書)、`/generate-image`(画像生成)。手順の詳細は各 SKILL.md が正
- **agents**: `process-researcher` — フェーズ1・2の一次調査の委譲先
- **hooks**: docs 配下の md/mdx を編集すると textlint が自動実行される(違反があれば即修正する)
- `.env` は permissions.deny で Read 禁止(API キー保護)

## プロジェクト運営(Issue 駆動)

- **Issue にない作業はしない**。作業前に必ず対応する Issue を確認・起票する
- バックログ構造: マイルストーン(M0〜M7)→ Epic Issue(#6〜#14)→ ユーザーストーリー/タスク。ルールの詳細は `src/content/docs/community/project-management.md`
- 着手順序は「期限が近いマイルストーン → Epic 本文の子 Issue リストの上から」
- Issue 完了時は受け入れ条件のチェックボックスを埋め、Epic 本文の該当項目にチェックを入れる

## Git 戦略

- 現在はソロ期のため `main` へ直接 push でよい。コントリビューターが現れたら PR フローへ移行する
- `main` への push で `.github/workflows/deploy.yml` が GitHub Pages へ自動デプロイ

## 既知の TODO

- 画像生成基盤(Gemini 画像モデル等)はユーザー側で準備予定

## ライセンス

ドキュメント = CC-BY-4.0、コード = MIT。この二重構成を崩さない。
