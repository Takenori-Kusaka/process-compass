# #362 実装の記録

- 日付: 2026-11-11〜12
- 入力: `decision.md`(R-1〜R-6)、`survey.md`、`council-01-drafter.md`、`council-02-opponent.md`
- 基点: 本体 main `af7bbf2`、template `89d02d6`(origin/main と同じ)
- 使った番号: ADR-0123、EV-0245、IMPL-0485、SRC-0730

## 承認の記録(人が書く)

準拠テンプレートの変更は強制層(`.github/workflows/**`・`scripts/gate/**`)に当たり、AI維持管理者の承認を要します。

- 承認者:
- 承認日:

## 変更したもの

### 準拠テンプレート(ブランチ `wip-362`)

| ファイル | 変更 |
| --- | --- |
| `.github/workflows/gate-g5.yml` | `on.push`(`branches: [main]`)を外し、`on.workflow_call` を足す。contract のジョブの試験に `test-push-trigger.mjs` を足す |
| `.github/workflows/gate-g5-push.yml`(新規) | `on.push.branches: ['**']`。ジョブ `default-push`(ID と名)、条件 `github.ref == format('refs/heads/{0}', github.event.repository.default_branch)`、`uses: ./.github/workflows/gate-g5.yml`。権限は gate-g5.yml と同じ |
| `scripts/gate/push-trigger.mjs`(新規) | 契機の形の検査 `pushTriggerProblems`。裁定 R-2 の5つの条件 |
| `scripts/gate/verify-gate-contract.mjs` | 「6. CI の設定」で `pushTriggerProblems` を失敗にする |
| `scripts/gate/preflight.mjs` | 止める項目 `default-branch` を外し、`push-trigger` を置く。`TEMPLATE_WORKFLOWS` に `gate-g5-push.yml`。既定ブランチを `origin` の HEAD から読めていないときの事実の行 |
| `scripts/gate/next.mjs` | `defaultBranchOf`: `origin` の HEAD を先に読む。手元に無ければ `origin/<名>` |
| `.github/workflows/ship-evidence.yml` | 取り込みの2か所で、`gate-g5-push.yml` → `gate-g5.yml` の順に成功した実行を探す |
| `scripts/gate/adoption-trial.mjs` | env-check の項目3 で、同じ順に探す |
| `scripts/gate/test-push-trigger.mjs`(新規) | 実物の適合(IMPL-0485:ok)と変異 15 件(IMPL-0485:ng)、`/pit` の既定ブランチの読み方 3 件 |
| `scripts/gate/test-adoption.mjs` | 「既定ブランチが main でなければ止める」を、trunk で止めない・旧版の gate-g5.yml で止める・gate-g5-push.yml が無ければ止めるの3件へ置き換え |
| `scripts/vendor/tailoring-kb.json` | `npm run template:kb` の再生成(本体のコミットの記録だけが変わった) |

### 本体

| ファイル | 変更 |
| --- | --- |
| `src/content/docs/adr/0123-default-branch-agnostic-push-trigger.md`(新規) | ADR-0123 |
| `src/content/docs/phase5-implementation/template-repository.md` | 事前点検の表の行を置き換え、本文の採らない案に1文。新しい節「既定ブランチの名を問わない push の契機」(図・表・EV-0245)。EV-0167 の対象から「既定ブランチが `main` でないリポジトリを止めること」を外す |
| `src/content/docs/phase4-process-design/gate-criteria.md` | IMPL-0238 の注記を改め、IMPL-0485 を足す |
| `src/content/docs/phase5-implementation/ci-gates.md` | 「既定ブランチへの push を契機とする契約検査は実行していない」を、2026-11-11 の確認の範囲に改める。取り込みの探す順を足す |
| `src/data/impl-targets.yaml` | 降ろし先 `gate-g5-push-workflow`・`push-trigger` を足す。`gate-g5-workflow`・`adoption-preflight` の説明を改める |
| `src/data/impl-inventory.yaml` | 節「変更の要求を経ないコミット」に IMPL-0485 |
| `research/sources/SRC-0730.yaml`(新規) | GitHub Docs の Contexts reference |
| 台帳 | `evidence:write`・`impl:write`・`scope:write`(変更なし)・`template:kb`・`sources:index` で再生成 |

## 読み方を決めた点

1. **IMPL のマークの置き場**: 規定「変更の要求を経ない体制でも、G-5 の検査を、既定ブランチへの取り込みを契機に実行する」(第4章 G-7「変更の要求を経ないコミット」)を降ろす形の検査として、IMPL-0238 の隣に IMPL-0485 を置いた。`/pit` の既定ブランチの読み方は規定を運ばない欠陥の修正なので、IMPL を付けず、試験だけを置いた
2. **既定ブランチを読めないときの事実の行**: 止めない。適用の開始の境と出荷の範囲は既定ブランチの主系列の上に置くので、人が確かめるよう添えるだけにした(裁定 R-2)
3. **名の式に `gate-g5` を含むジョブ**: 検査は、名が `${{ … }}` の式で、その中に `'gate-g5'` の文字列があるジョブも、名が `gate-g5` のジョブに数える。式の評価の結果を読まずに、評価の結果が `gate-g5` になりうる名を止めるためである

## 実行での確認(一時のリポジトリ)

一時のリポジトリ2つ(public。既定ブランチを `trunk` に改名)で確かめた。

- `pit-in-trial-73fbe93c`: 最小のワークフローで方式を比べた(`survey.md` の O1〜O8)
- `pit-in-trial-5534b5`: テンプレートから作り、`wip-362` の変更 10 ファイルを1つのコミット(01b2392)で持ち込んだ。ルールセットはテンプレートの `checks-only.json` をそのまま適用した(必須チェック `gate-g5`・`gate-g5-base`)。構成は未設定(`configured: false`)のまま

| 番号 | 確かめたこと | 観測 |
| --- | --- | --- |
| T1 | 機能ブランチ `feat-a` へ構成を壊すコミット(7f48fed)を push し、PR #1 を開いて直ちにマージを試みる | 拒否(「the base branch policy prohibits the merge」)。push の実行(gate-g5-push、skipped)の check run は `default-push`(skipped)の1件だけ。PR の `gate-g5` は失敗 |
| T2 | push の実行を再実行してからマージを試みる | `default-push` の skipped が最新になっても拒否 |
| T3 | `trunk` への push(01b2392)で、呼ばれた側の契約検査の手順 | `default-push / gate-contract` で、push の分岐(`BEFORE: 192a578…`、`git fetch … "$BEFORE"`、`verify-gate-contract.mjs --base "$BEFORE"`)が実行された。構成が未設定のため、比較の中身(構成の書き換えの検出)は判定されていない |
| T4 | `trunk` への push の実行 | gate-g5-push の実行 43047227959 が success。check run は `default-push / config`・`/ gate-contract`・`/ spec-lint`・`/ context-format`・`/ gate-g5` ほか。Linux の上で contract の試験一式(`test-push-trigger.mjs` の 20 件を含む)が通った |
| T5(一部) | 出荷の証跡の探し方 | `gh run list --workflow gate-g5-push.yml --commit 01b2392 --status success` が 43047227959 を返した。機能ブランチのコミット(7f48fed)では 0 件。成果物は、構成が未設定で test・ip-clearance が skipped のため無く、呼び出し側の実行に付くかは確かめていない |
| T6 | 名が `trunk` のタグを push する | gate-g5-push の実行は起動しなかった |
| T11 | 機能ブランチ `feat-d` で `gate-g5.yml` を手動で起動する(`gh workflow run`) | 名が `gate-g5` の check run が `feat-d` の先頭のコミット(fcd3f5f)に付いた(この実行は、試行のために足した `note.txt` が資産の一覧に無いことで contract が失敗し、`failure`)。手動の起動が成功した場合に、PR の前に必須チェックを満たすかは確かめていない |

行わなかったこと: 構成を設定済みにした通し(T3 の検出の中身、T5 の成果物)、既定ブランチの改名への追随(T8)、既定ブランチが `main` のリポジトリでの回帰(T9。静的な試験と Windows・WSL の試験一式で代える)、旧来のブランチ保護(T10)、委任の判定の実機(T7)。EV-0245 の本文に開示した。

一時のリポジトリの削除: **未了**。`gh repo delete` は `delete_repo` の権限の範囲を要し、手元の gh の token はそれを持たない(2026-11-11 の実行で「This API operation needs the "delete_repo" scope」)。所有者が `gh auth refresh -h github.com -s delete_repo` の後に、2つのリポジトリを削除する。

## 範囲の外として申し送ること

- 既定ブランチでないブランチでの `workflow_dispatch`(T11): 名が `gate-g5` の check run が付く。#362 より前からある経路で、裁定 R-3 のとおり本件では塞がない。成功した手動の起動が、PR の `gate-g5` より前に必須チェックを満たすかは未確認。統制の迂回を扱う既存の open Issue へ寄せる
- 常駐の規則の核の文言「main は常にリリース可能に保つ」: 既定ブランチが `main` でない案件では字義どおりに読めない。ADR-0123 と第5章に既知の食い違いとして記録した

## 独立の突合への対応

`crosscheck.md` の X-1〜X-12(高 0・中 4・低 8)への裁定は `decision.md` の R-7 にある。採った指摘の実装は次のとおり。

- テンプレートの2つ目のコミット: `push-trigger.mjs` にジョブの鍵と最上位の鍵の検査(X-6)、`test-push-trigger.mjs` に変異 2 件、`test-env-check.mjs` の模擬に `--workflow gate-g5-push.yml`(X-2。後退の経路の実行 88 は成果物の模擬を持たない)、`README.md` と `/process-init` の手順(X-4)
- 本体: ADR-0085 のステータスに後継(X-3)、第5章の未実行の記述(X-5)、EV-0245 の本文と差し替え条件(X-7・X-11)、出荷の系列のブランチに統制が掛からないこと(X-12)、IMPL-0238 の降ろし先(X-8)、IMPL-0485 の注記に読む書き方の範囲(X-6)

## 確かめた検査

| 検査 | 結果 |
| --- | --- |
| `npm run check` の各段(Windows) | `test:template-suite` と `test:regress` を除き、すべて通過(`build` を含む)。`test:template-suite` は `test-g5-aggregate.mjs` だけが落ちる(作業ツリーの CRLF による既知の失敗。WSL の LF の写しでは 23 件通過) |
| テンプレートの試験一式(`gate-g5.yml` の contract が実行する `test-*.mjs` 44 本。WSL の LF の写し、node 18.19.1) | 43 本が通過。`test-init-g5.mjs` の 1 件(「1名: テストが0件の段階で npm test が通る」)は、node 18 の `node --test` が glob を解かないための環境の差で、Windows(node 26.13.0)では 146 件、GitHub の実行(`.github/gate-node-version` の版)でも通過 |
| `test-push-trigger.mjs` | 22/22(Windows・WSL) |
| `test-adoption.mjs` | 69 件(Windows・WSL) |
| `test-env-check.mjs` | 63 件(WSL。Windows では模擬の gh を置けず省かれる) |
| 一時のリポジトリの GitHub の実行 | `pit-in-trial-5534b5` の `trunk` への push の実行 43047227959 で、contract の試験一式が Linux の上で通過 |
| `test:regress` | 下記 |
