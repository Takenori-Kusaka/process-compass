# Issue #353 準拠テンプレートに及ぶ7項目の実装の記録(2026-11-17)

実装の担当による。裁定は `decision.md`(ADR-0134)、項目は `decision-draft.md` 7章。本文(標準)の条文は変えていない。template は b8-354(7be857f)の上にブランチ b8-353 を積んだ。push していない。

## 1. 項目ごとの結果

| # | 項目 | 結果 | 所在 |
| --- | --- | --- | --- |
| 1 | 例外の対応づけに期限の比較 | 降りた(IMPL-0574 を delivered・machine) | `scripts/gate/exception-expiry.mjs`、`aggregate-evidence.mjs` の `exceptionMatch`・ゲートの判定を対象とする行・台帳全体の欠落 |
| 2 | `claimForRange` の件数 | 降りた | `claim.exceptions`(範囲・未回収・期限超過・独立した人の確認を経ない出荷・日・台帳の所在)。`claimStatus` と `CLOSED_DEVIATIONS` は変えていない |
| 3 | 表明の様式・生成区間・README | 一部が降りた(IMPL-0573 を delivered・manual。IMPL-0120 は undelivered のまま) | 品質レポートの1行(併記する句の型)、`generate-profile.mjs` の PROCESS-PROFILE.md と CLAUDE.md の生成区間、README の文の型 |
| 4 | exception-paths.md | 降りた(IMPL-0575 を delivered・manual。IMPL-0011 の note に追記) | `.claude/skills/gate/reference/exception-paths.md` の節「例外承認の対象と期限」 |
| 5 | templates/03-debt-ledger.md | 降りた | 欄は変えず、「状態「失効」と期限超過」の段落を足した |
| 6 | next.mjs の注記 | 降りた | `overdueExceptionNote`。`--today YYYY-MM-DD` で日付を渡せる |
| 7 | 回帰の場面 | 降りた | `scripts/gate/test-exception-expiry.mjs`(30 件)。CI は `gate-g5.yml` に結線 |

## 2. 降りなかった部分(note で開示)

- IMPL-0120: 従う版・未達と記録の欠落の件数・逸脱と列挙に無い離脱を、例外承認の件数と組にした表明の文を出す仕組みは無い。undelivered のまま、note に例外承認の句は IMPL-0573 が出すと書いた
- IMPL-0573 の「独立した人の確認を経ない出荷」: 例外承認が変更へ対応づく経路は、台帳の行を入れた変更の帰属の確認にホスティングの記録を要する。Windows では偽の gh を置けないため、通しでは確かめていない(数え方の関数だけ確かめた)。CI の Linux の場面は足していない
- 表明・主張の文そのものに句があるか、短い引用に所在が添えてあるか: 機械で閉じない。manual(表明を述べる者が転記して確かめる)
- 承認し直しの識別が正しい行を指すか、期限の書き換えによる延長(台帳の履歴の比較): 機械にしない。IMPL-0574 の note で manual と開示

## 3. 機械にした条件(決定可能なものだけ)

- 期限の日 < 突合の日 かつ状態が有効 → 効力を失う(期限の日の当日は効力がある)。状態が失効 → 効力が無い
- 元の行の本文に別の行の識別(D-NNN)があり、その行が有効で期限内 → 承認し直された元の行として数えない(overview.md 1.10.2 の定め)
- 期限が日付として読めない有効の行 → 期限超過に数えず `undatedDue` に出す(比べられないため)
- 突合の日は `--exception-day`(既定は範囲の終点のコミットの日。実行の時計に依らない)。日付として読めない値は使わず、記録の欠落に出す
- 件数: 範囲 = 始点で有効だった行 + 範囲で足された行。未回収 = 終点で有効または失効(承認し直された元の行を除く)。終点の台帳から消えた始点の行は未回収に数える

## 4. 使った番号

IMPL は新規を使っていない(0573・0574・0575・0120・0011・0039 の state・check・test・note を改めた)。仮の IMPL-1110 は使っていない。降ろし先に `exception-expiry`(`scripts/gate/exception-expiry.mjs`)を `src/data/impl-targets.yaml` へ追加した(逆向きの追跡が求めた)。

## 5. 壊して確かめた場面(2点)

- 期限の比較を外す(`exceptionStanding` が `due < day` を見ず常に有効): 12 件が落ちた。期限の翌日・ゲートの判定を対象とする行・範囲の外の行・承認し直し・期限超過の件数・次の一手の注記・通しの欠落と件数・品質レポートの句・変更の対応づけ
- 件数の併記を外す(`claim.exceptions` を削除): 通しの3場面が落ちた(件数・品質レポートの句・突合の日の引数)。他の場面は落ちない

どちらも元へ戻し、30 件の合格を確かめた。

## 6. 通した試験

- template(node 26 / Windows のローカル): test-exception-expiry(30)、test-edition-end(71)、test-performer-account(67)、test-aggregate-records(135)、test-material-attribution(58)、test-next-records(88)、test-records-history(44)、test-aggregate-drift(25)、test-assurance-period(31)、test-material-records-more(51)、test-env-findings(23)、test-check-pr、test-g5-missing、test-direct-commit-rules(11)、test-uplift-evidence(9)、test-control-approval(48)
- 本体: lint:impl・lint:evidence・lint:scope・lint:refs・lint:provisions・lint:registry・test:impl・test:ci-wiring・test:fields・test:criteria・test:template(乖離なし)、変えた md への textlint(違反なし)。`template:kb` は commit 欄だけが変わったので戻した
- 回帰の場面(WSL の node 26.13.1。scripts/regress/suite の一部のみ): name-confirmation(54)・performer-account(13)・self-decision(131)・verify-n(37)・t288(87)が落ちた場面 0。作業ツリーの t288 は引き継ぎ文書の表の置き換えで中断したが、WSL が /mnt/e の CRLF の作業ツリーを読むためで、`--template-ref eb72483`(本件の先頭。LF)では 87 場面が通る。場面の入力は変えていない
- Windows の CRLF による偽の FAIL(test-g5-aggregate・test-discouraged-evidence)は判定に使っていない

## 7. 残り

- push の前に `npm run check` の全量(回帰の全量を含む)を1回
- 台帳の履歴で期限の書き換えを検出する検査は、決めていない(#355 のコメントに寄せた論点のまま)
- template の bundle: `E:/Github/process-compass/tmp/bundles/template-b8-353-01.bundle`・`-02.bundle`
