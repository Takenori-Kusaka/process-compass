# 束 B33(B31 の続き)U6b・U7 の実装の記録

実装 2026-11-26。template のブランチ `wip/b33`、コミット e68b20f(push しない。`E:/Github/process-compass/template` の `refs/heads/wip/b33` へ退避済み)。本体は Takenori-Kusaka/b33 のコミット(この記録と同じ)。裁定 `ruling-1.md`・`ruling-2-u6a-returns.md` に従った。

## 変えた挙動

- **U6b(手引き・様式・README)**: 閾値割れを台帳の行で受ける書き方を、手引き `exception-paths.md`(対象の表に1行と、節「段 mutation の閾値割れを台帳の行で受ける」)、様式 `03-debt-ledger.md`(区分「例外」の説明に1文)、README(項21 の「別の更新で降ります」を項目23 を指す文へ。項目23 を新設)に書いた。手引きに、裁定 §1.2 の「承認した者は宣言行のレビューの前に段の出力のスコアを読み、受容した理由の欄に書く」、ruling-2 の 2 の「`@` で書いた指示者の PR では受けられない」、道具の側の閾値の結び(`thresholds.break`)で受けられないこと、返却の目安に上限が無いこと、受けない3つの場合を置いた。印に下限は書かせない。U6c の前の差(段で受けた行が G-7 で欠落になりうる・印の無い行は gate-g5 が失敗のまま)は、README 項目23 と IMPL-0996・0931 の note に開示した。
- **U7(週次の型)**: `mutation-stage.mjs` に `weeklyModeOf(env)`(`PIT_IN_MUTATION_MODE=weekly` かつイベントが schedule か workflow_dispatch のときだけ真)と `evaluateWeeklyMutation`(閾値割れも ok。出力の行が壊れているときだけ ok=false。要約の1行を返す)。`adapter.mjs` は週次の型のとき、必須の判定をせず、空のコマンドは「何も測っていません」と注意を出して終了 0、閾値割れは終了 0 で段の出力の1行と `GITHUB_STEP_SUMMARY` へ、コマンドの終了コードが 0 でない・行の壊れは失敗。比較の起点は置かない。新規 `.github/workflows/mutation-weekly.yml`(schedule は日曜 18:00 UTC・workflow_dispatch・権限 contents: read・ジョブ名 mutation-weekly・gate-g5 の集約に入れない)。
- 冒頭コメント(`mutation-stage.mjs`)を、U6a(台帳の行で受ける範囲・受けないもの)と U7(週次の型)の両方で更新し、機械が見ない範囲(manual)を列挙した。
- **本体**: ADR-0243 を新設(決定9 つ。決定6 は ADR-0222 決定1 の一文を「置き換える」と書き、ADR-0224 決定7 の原文をコンテキストに引いた。決定7 は ADR-0217 の影響の節。課さないこと・採らない案を表にした)。IMPL-0996・0931・0763・0930・1029 の note を改めた(**IMPL-0931・1029 は undelivered のまま**)。IMPL-1036 は delivered・check=manual・target=mutation-weekly-workflow(plan・issue・review を外した)。`impl-targets.yaml` に `mutation-weekly-workflow` を登録。根拠水準マーク EV-0347(squash 以外のマージ・実 GitHub の応答・権限)・EV-0348(週次の所要時間・費用・実際の cron)を足した。台帳(impl・evidence)を再生成した。

## 関数とファイル

- template: `scripts/gate/mutation-stage.mjs`(`weeklyModeOf`・`evaluateWeeklyMutation`・冒頭コメント)、`scripts/gate/adapter.mjs`(`weekly`・`summarize`)、`.github/workflows/mutation-weekly.yml`(新規)、`scripts/gate/test-adapter.mjs`、`scripts/gate/preflight.mjs`(`TEMPLATE_WORKFLOWS` に `mutation-weekly.yml` を追加。test-adoption が一致を確かめる)、`.claude/skills/gate/reference/exception-paths.md`・`templates/03-debt-ledger.md`・`README.md`。
- 本体: `src/content/docs/adr/0243-g5-mutation-breach-accepted-by-ledger-row-and-weekly-run.md`、`phase4-process-design/{exception-escalation,safety-verification,assurance-case,tailoring-guide}.md`(マークと根拠水準マーク)、`src/data/impl-targets.yaml`・`impl-untraced.yaml`、`community/{implementation-ledger,evidence-ledger}.md`。

## 試験の結果(LF の複製 `tmp/pos` で Windows の node 26 により実行)

- test-adapter 225 件通過(U6a の 198 件から新規 27 件)。週次の型: weeklyModeOf の真偽、schedule・workflow_dispatch の各々で空 → 終了 0・閾値割れ → 終了 0 かつ出力と要約に1行・閾値以上 → 終了 0・終了コード 3 / 行なし / スコア不正 / 所在空 → 失敗、起点が壊れていても走る、pull_request・push・型の指定なしでは無視(R1 の空は失敗・閾値割れは失敗のまま)、評価関数の単体、workflow の形(schedule+dispatch・pull_request/push/workflow_call なし・環境変数・gate-g5 でない名・権限・`continue-on-error`/`|| true` なし・gate-g5.yml に週次を入れない)。
- test-exception-expiry 108/108、test-push-trigger 27/27、test-init-g5 208 件、test-adoption 123 件、test-enforcement-inventory・test-handover-items 25 件・test-context-refs すべて通過。
- 本体: lint:ci・test:ci-wiring 38・test:impl 56・test:plan-issues 22・lint:impl・lint:evidence・lint:scope・lint:refs・lint:tone・lint:dekimasu・lint:skills・lint:provisions・lint:registry・test:fields 11・test:template(複製の検査)通過。textlint は ADR-0243 と4つの docs で違反なし。回帰の全量は流していない。

## 陰性の確認(判定を外した複製。tmp/neg1・neg2)

- 週次の型のイベントの条件を外す(`weeklyModeOf` が型の指定だけで真): 4 件が落ちた(weeklyModeOf の無効の場合・pull_request で R1 の空が通る・push で必須の側に倒れない・pull_request で閾値割れが通る)。
- 閾値割れで `evaluateWeeklyMutation` を `ok:false`(失敗)にする: 2 件が落ちた(schedule・workflow_dispatch の閾値割れが終了 0)。
- 正の複製 `tmp/pos` は 225/225。

## 議長へ返す点

1. `scripts/gate/preflight.mjs` の `TEMPLATE_WORKFLOWS` に `mutation-weekly.yml` を足した(指示の範囲外のファイル。足さないと test-adoption が落ちる。事前点検が新しい workflow を「既存の資産」と誤読しないため)。可否を確かめてほしい。
2. `mutation-pr-context.mjs`(U6a)が逆向きの追跡に載っていなかったため、`impl-untraced.yaml` に library として登録した(降ろし先の変種にせず、規定は IMPL-0931 の note で追う)。U6a の突合の観点でも見てほしい。
3. 根拠水準マークの番号は仮(EV-0347・EV-0348)。push の直前に付け直す。
4. IMPL-1036 は check=manual のため `test=` を書けない書式で、試験の所在(test-adapter.mjs)と機械が見る範囲は note に書いた。これで足りるか。

## 未確認

- 実際の GitHub 上の cron・手動起動・週次の所要時間と費用・gate-g5.yml の段のジョブの権限(EV-0347・0348)。
- 本体の独立の突合は未実施(裁定 §1.1 の順で、突合の1巡目は U6a・U6b・U7 の全体を見る)。回帰の全量(WSL の node を含む)は push の前に1回。
- U6c(集約)・U8 は B30 の push の後。IMPL-0931・1029 は undelivered のまま。
