# Process Compass

生成AI時代の開発プロセスを体系化し、チーム体制・事業フェーズに合わせて最適な開発プロセスを提案するツールを目指す docs-as-code プロジェクト。Webアプリ開発ではなく**ドキュメント主体**。最終的に GitHub Pages 上のインタラクティブなプロセス提案ツールへ発展させる。

## プロセスの名称(ADR-0027)

- **通称**: ピットイン方式(PIT-IN) — 口頭・検索・リポジトリ名・バッジで使う
- **正式名称**: AI協調型ソフトウェア開発プロセス標準 — 稟議・QMS 文書・規格の引用で使う
- 本文中の自己参照は「本標準」を維持する。「統合プロセス」は使わない
- 一文の要約: マシンは人間より速い。それでも、決められた場所では必ず人間が触る

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

## 準拠テンプレート(submodule)

- `template/` = [pit-in-template](https://github.com/Takenori-Kusaka/pit-in-template)。Template repository として公開済み
- 初期化: `git submodule update --init --recursive`
- テーラリングエンジン(`src/lib/tailoring-engine.mjs`)と規則データ(`src/data/tailoring/`)を複製して使う。**正本はこちら側**
- 規則データを変えたら `npm run template:kb` で複製を更新する。乖離は `npm run check` が検出する
- テンプレート側の設計判断は ADR-0028(未達と省略の区別)

## Zenn 発信(submodule)

- `zenn/` = [zenn-content](https://github.com/Takenori-Kusaka/zenn-content)。Zenn の GitHub 連携先
- **Zenn へ連携できるリポジトリは最大2つ**。記事も本もこのリポジトリへ集約する
- 本: `zenn/books/pit-in-process/`(全10章)
- `config.yaml` の `chapters` に書かれていない章は zenn.dev 上から削除される。増減したら必ず更新する
- 画像は `zenn/images/` へ置き、`/images/...` の**絶対パス**で参照する(相対パスは動かない)

## コマンド

- `npm run dev` — ローカルプレビュー
- `npm run check` — textlint + トーン + 根拠水準 + エンジンテスト + 複製の検査 + ビルド(push 前に必ず通ること。PR では CI (`ci.yml`) が同じチェックを実行)
- `npm run template:kb` — テンプレートへ複製する知識ベースを再生成する

## Claude Code 設定(.claude/)

- **skills**: `/ja-proofread`(日本語校正)、`/mermaid-diagram`(作図規約)、`/research-to-docs`(調査メモ清書)、`/generate-image`(画像生成)。手順の詳細は各 SKILL.md が正
- **agents**: `process-researcher` — フェーズ1・2の一次調査の委譲先
- **hooks**: docs 配下の md/mdx を編集すると textlint が自動実行される(違反があれば即修正する)
- `.env` は permissions.deny で Read 禁止(API キー保護)

## 意思決定の記録(ADR)

- あとから変えにくい決定(技術選定、方針、原則)は `src/content/docs/adr/` に ADR として公開記録する。テンプレートと運用ルールは `adr/index.md`
- 採用済み ADR の本文は書き換えない。決定変更は新 ADR で置き換える

## 根拠水準のマーク(ADR-0026)

- 実証に基づかない値・未検証の前提・単一事例にしか支えられない記述を書くときは、必ず `:::caution[暫定 EV-NNNN / 見直し YYYY-MM]` でマークする。書式は `community/evidence-marking.md` が正
- 識別子は連番で再利用しない。マーク追加後は `npm run evidence:write` で台帳(`community/evidence-ledger.md`)を再生成する
- 台帳は自動生成。手で編集しない

## 規定を実行層へ届ける(#222)

- 実行主体の挙動を制約する規定には、実装マーク `<!-- impl IMPL-NNNN target=... state=... note="..." -->` を付ける。書式は `community/implementation-marking.md` が正本
- 降ろし先は `src/data/impl-targets.yaml` に登録したものだけを使う。検査は降ろし先の実在まで確かめる
- マークを足したら `npm run impl:write` で台帳(`community/implementation-ledger.md`)を再生成する。台帳は自動生成。手で編集しない
- **降りていない規定(`state=undelivered`)は消さずに表示し続ける**。未達のゲートと同じ扱い

## 適用範囲の書き方(#226)

- 節全体に掛かる適用範囲は**見出しへ併記**する(`### 5.7.3 選択肢の比較(適用: R1 の決定・例外承認)`)。書式は `community/scope-marking.md` が正本
- **限定を、規範とは別の段落へ置かない**。箇条書き・表の行が限定を持つなら、その行の中に書く
- リスク区分(R)は**変更ごと**、安全重要度(CL)は**案件ごと**。案件の CL からリスク区分依存の条項の適用外を導かない(ADR-0039)
- 注記を足したら `npm run scope:write` で台帳(`community/scope-ledger.md`)を再生成する。台帳は自動生成。手で編集しない
- 誤検出は `src/data/scope-exempt.yaml` へ理由付きで登録する

## テンプレートの様式(#227 / ADR-0040)

- `template/templates/*.md` は標準の第6章の**部分集合**。全文一致は求めない。**必須欄の存在だけを検査する**
- 必須欄は `src/data/template-fields.yaml` で管理する。検査は「標準側に実在するか」と「テンプレート側に存在するか」の**両方向**
- 欄を落とすときは同ファイルの `omit` へ理由を書く。**標準と逆の指示を書く形は omit で登録できない**
- 要求事項ではなく手引きとして書かれた附属書は降ろさない。ただし附属書内の「してはならない」の規範は降ろす

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
