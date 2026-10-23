---
title: プロジェクト運営(Issue 駆動)
description: Epic・ユーザーストーリーによるバックログ管理と進め方のルール
sidebar:
  order: 2
---

本プロジェクトは、すべての作業を GitHub Issue として起票し、計画的に進めます。
「計画のないプロダクトは存在しない」——このページはスプリントプランニングゼロの成果物です。

進捗の全体像は [Process Compass Roadmap ボード](https://github.com/users/Takenori-Kusaka/projects/1) で公開しています。

## バックログの構造

```mermaid
graph TD
  M[マイルストーン<br>フェーズ = 期限付きの目標] --> E[Epic Issue<br>フェーズ単位の大目標]
  E --> S[ユーザーストーリー Issue<br>読者・利用者への価値単位]
  E --> T[タスク Issue<br>価値に直結しない作業]
```

| 階層 | ラベル | 説明 |
| --- | --- | --- |
| Epic | `epic` | フェーズ単位の大目標。本文の子 Issue リストで進捗を追跡 |
| ユーザーストーリー | `user-story` | 「(誰)として(何)がほしい。それは(理由)のためだ」形式。受け入れ条件付き |
| タスク | `task` | 環境整備など、価値に直結しない作業 |

補助ラベル: `phase-0`〜`phase-6`(フェーズ)、`tool`(提案ツール)、`outreach`(発信)。

## マイルストーン(期限は目安)

| マイルストーン | 期限 | 対応 Epic |
| --- | --- | --- |
| M0: リポジトリ基盤 | 2026-07-31 | [#6](https://github.com/Takenori-Kusaka/process-compass/issues/6) |
| M1: フェーズ1 現状調査 | 2026-10-31 | [#7](https://github.com/Takenori-Kusaka/process-compass/issues/7) |
| M2: フェーズ2 AIDLC調査 | 2026-10-31(M1と並行) | [#8](https://github.com/Takenori-Kusaka/process-compass/issues/8) |
| M3: フェーズ3 ギャップ分析 | 2026-12-31 | [#9](https://github.com/Takenori-Kusaka/process-compass/issues/9) |
| M4: フェーズ4 詳細策定 | 2027-02-28 | [#10](https://github.com/Takenori-Kusaka/process-compass/issues/10) |
| M5: フェーズ5 プロセス実装 | 2027-04-30 | [#11](https://github.com/Takenori-Kusaka/process-compass/issues/11) |
| M6: フェーズ6 プロセス運用 | 2027-06-30 | [#12](https://github.com/Takenori-Kusaka/process-compass/issues/12) |
| M7: プロセス提案ツール | 2027-09-30 | [#13](https://github.com/Takenori-Kusaka/process-compass/issues/13) |

発信・コミュニティ運営([#14](https://github.com/Takenori-Kusaka/process-compass/issues/14))は全期間の継続活動のため、マイルストーンに紐付けません。

## 進め方のルール

1. **Issue にない作業はしない** — 思いついた作業もまず Issue 化してから着手する
2. **着手順序** — 「期限が近いマイルストーン → Epic 本文の子 Issue リストの上から」を基本とし、例外は Issue コメントに理由を残す
3. **週次レビュー** — 週1回、進行中 Issue の棚卸しとバックログの見直しを行う(ソロ + AI 体制のためスプリントは固定しない)
4. **完了の定義(DoD)** — 各 Issue の受け入れ条件をすべて満たし、`npm run check` が通り、成果がサイトに公開されていること
5. **フィードバックの取り込み** — Issue / Discussion で受けた意見は、トリアージのうえ既存 Issue への反映または新規起票を行う

## 完了の定義(コンテンツ共通)

- 受け入れ条件のチェックボックスがすべて埋まっている
- 図解(Mermaid 等)を中心に説明している
- `npm run check` が通る(検査の一覧の正本は `package.json` の `check`)
- サイトの該当ディレクトリ配下に公開されている

## PR フロー移行チェックリスト(コントリビューター参加時)

現在はソロ期のため `main` へ直接 push しています。継続的なコントリビューターが現れたら、次の手順で PR フローへ移行します。

1. GitHub の**ルールセット**で `main` への直接 push を禁止し、PR 必須にする(ルールセットは read 権限者にも公開されるため、貢献者がルールを事前に把握できる)
2. ルールセットで **Require review from Code Owners** を有効化する(`.github/CODEOWNERS` は設定済み。オーナーのうち1名の承認でマージ可能)
3. CI の `check` ジョブ(`.github/workflows/ci.yml`)を必須ステータスチェックにし、基底ブランチへの追随を求める(strict)
4. Environment `dist-standard` に必須レビュアを置くかを見直す(ソロ期は置いていない。後掲「公開と配布の経路」)
5. 本ページと CLAUDE.md の Git 戦略の記述を更新する

## 本リポジトリの運用

本リポジトリは、標準の本文を書くリポジトリです。本標準に従うソフトウェア開発の案件ではありません。準拠テンプレートの構成(契約検査、トレーラ `Risk`・`Verification`)は持ちません。[Git 戦略](/process-compass/phase5-implementation/git-strategy/)の段階導入の表の 1名の行を、本リポジトリが満たしているわけではありません。

- ソロ期は `main` へ直接 push する。ルールセットは `main` に置いていない
- push ごとに CI(`ci.yml` のジョブ `check`)が `npm run check` を実行する。push そのものは止めない
- サイトの公開(ジョブ `deploy`)と `dist/standard` への配布(ジョブ `publish`)は、`check` の通過の後にだけ走る。公開するのは `check` が作ったビルドそのもの
- 検査の一覧の正本は `package.json` の `check`。本ページ・README・CONTRIBUTING・PR テンプレート・CLAUDE.md は列挙しない
- 検査器の入力(`template/` のサブモジュール)が無ければ、手元でも CI でも `npm run check` は失敗する。取得は `git submodule update --init --recursive`
- 結線(契機・`npm run check` の手順・サブモジュールの取得・`needs: check`・最上位の権限・配布の `environment:`)は `scripts/check-ci-wiring.mjs` が確かめる。決定の記録は [ADR-0077](/process-compass/adr/0077-repository-ci-wiring-and-distribution/)

### 公開と配布の経路

```mermaid
graph LR
  P["main への push"] --> C["check<br>npm run check"]
  C -->|通過| D["deploy<br>check のビルドを Pages へ"]
  C -->|通過| U["publish<br>Environment dist-standard"]
  U --> K["配る KB を検査<br>件数・版"]
  K --> B["dist/standard へ積む<br>強制 push しない"]
  C -->|失敗| X["公開も配布もしない"]
```

| 防ぎたいこと | 止めているもの |
| --- | --- |
| 検査に落ちた版の公開・配布 | `needs: check`。結線は `check-ci-wiring.mjs` が確かめる(公開・配布のジョブの `if` に `always()` などの状態の関数と `\|\|` を置かない) |
| 検査したものと別の生成物の公開 | `check` が作った `dist/` をそのまま配る。2回目のビルドをしない |
| `main` 以外からの配布 | Environment `dist-standard` の配備のブランチの限定(`main` だけ)。配布の資格情報(deploy key)がその Environment の秘密情報にだけあること。ジョブ先頭の起動元の確認(事故の歯止め) |
| `dist/standard` の書き換え・強制 push・削除 | `dist/standard` のルールセット。更新は deploy key のバイパスだけに限る |
| 配る知識ベースの誤り | push の前に `check-gate-criteria.mjs --kb` が、判定基準の件数と生成元の版(40桁の16進で、起動したコミットと一致)を確かめる |
| 古い版での上書き | 配布は、配布済みの版がこの実行のコミットの子孫なら配らない。公開は、`main` がサイトに入るファイルの変更で先へ進んでいれば配らない(新しいコミットの実行が成功することに依る。後掲「止まらない経路」) |

配布は前回の `dist/standard` の上へコミットを積みます。配るかどうかは、配布済みの版(`dist/standard` の知識ベースの生成元の版)と今回の生成物の中身(`VERSION.md` と知識ベースの生成元の版を除く)を比べて決めます。差が無ければ配りません。前の配布が失敗していても、次の main への push で取り戻します。案件が submodule で固定した旧版は、このブランチの履歴から取り直せます。配る中身は、本文・知識ベース・`VERSION.md`・`LICENSE` だけです。`VERSION.md` には、起動の契機・ref・コミット・実行の番号を書きます。

`dist-standard` に必須レビュアは置きません。ソロ期の自己承認は独立した確認ではなく、記録が承認として誤読されるためです。承認の代わりに残すのは、配布の実行の記録(ref・コミット・実行の番号)と、下の管理者の設定の事実です。Issue #293 の受入条件3 の「Environments の承認」は「Environment の配備のブランチの限定」と読み替えました。

### 止まらない経路

- 管理者は、Environment の保護とルールセットを設定画面で外せる。外した場合、残るのはワークフローの中の確認だけで、起動元のブランチでファイルを書き換えれば外れる
- 保護の規則(配備のブランチの限定)だけを外した場合、ワークフローは検出しない。秘密情報が無い場合だけ、配布が失敗する
- 管理者の設定(後掲の手順)が済むまでの間は、保護の無い Environment `dist-standard` が自動で作られる。秘密情報が無いため、配布は失敗する(配布が止まる側に倒れる)
- `main` へ push できる者は、`ci.yml` を書き換えて検査を外したうえで公開できる。結線の検査も、同じ push の中で書き換えられる。ソロ期に `main` へ push できるのは保守者1名である
- 結線の検査は、ワークフローの構造と文字列を読むだけである。変数や別の手順で隠した `dist/standard` への push、`npm run check` の中身を手順の中で書き換える形は拾わない。`dist/standard` への書き込みを止めるのは、ルールセット(deploy key だけがバイパス)である
- `graphify-update.yml` の `[skip ci]` のコミットは、CI・公開・配布を起動しない。対象(`graphify-out/`)はサイトと配布物に入らない
- 古い版での上書きの防止は、新しいコミットの実行が成功することに依る。後のコミットの検査が落ちる、または人が `[skip ci]` を付けて push すると、その前に通過した版も公開されず、サイトは最後に公開した版のまま残る。公開し直すには、検査を通る版を push する
- 検査が通るまで公開と配布は遅れる。textlint の違反1件でサイトの更新が止まる。完了の定義の「サイトに公開されている」の遅れは、信頼性の代償として受け入れた
- 強制 push で配った過去の 14 回分の `dist/standard` は、どの参照からも辿れない。取り戻さない
- 公開と配布のジョブは、2026-10-23 時点で実際の GitHub 上で実行して確かめていない。構文は actionlint で確かめた

### 管理者の設定(保守者が設定画面で行う)

ワークフローの外にある設定です。AI のセッションは行いません。

1. 配布専用の SSH 鍵を作る(`ssh-keygen -t ed25519 -N "" -f dist-standard-key`)。公開鍵をリポジトリの deploy key として登録し、書き込みを許す(Settings → Deploy keys → Allow write access)。この鍵を他の用途に使わない
2. **配布のジョブが走る前に**、Environment `dist-standard` を作る(Settings → Environments)。配備のブランチは「Selected branches」で `main` だけに限る。必須レビュアは置かない。Environment の秘密情報 `DIST_STANDARD_DEPLOY_KEY` へ秘密鍵を置く。リポジトリの秘密情報には置かない
3. `dist/standard` にルールセットを置く(Settings → Rules → Rulesets)。対象は `dist/standard`。削除の禁止・強制 push の禁止・更新の制限を有効にし、バイパスの一覧には deploy key だけを入れる。GitHub Actions(`GITHUB_TOKEN`)と管理者のロールはバイパスに入れない
4. 設定した日付と、`main` 以外のブランチから配布できないことを確かめた結果を Issue #293 に記録する

