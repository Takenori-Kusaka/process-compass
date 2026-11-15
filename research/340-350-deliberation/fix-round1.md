# #350・#349・#348・#340(事象2) 独立の突合(1巡目)への対応

議長の裁定(`ruling-round1.md`)のとおりに直した。裁定と違えた点は無い。template のコミットは d054f7a(`rebuild-b1`、未 push。退避は `tmp/bundles/template-b1r-07.bundle`)。

| 所見 | 対応(変えた所) | 試験 |
| --- | --- | --- |
| 高-1 発効日の遡り | `template/scripts/init/generate-profile.mjs` の窓・基準値の履歴の `recordedAt` を `today`(`localDay()`)にした。コメントで発効日との違いを明記 | `test-loosening-decider.mjs` の末尾に、`date` を過去に置いた窓の延長・基準値の設定の対を追加。`recordedAt` が `localDay()` と等しく、過去の評価の日・実行日には前の値が効く。旧い実装(`recordedAt: day`)に戻すと 2 件 NG になることを確かめた |
| 高-2 現在の窓 | `template/scripts/gate/autonomy.mjs` の現在の窓を `observationWindowAt(config, monthStart(asOf))` で数えた。`config.mjs` に `observationWindowPending` を足し、`windowLengthText` が「次の評価の日(YYYY-MM-01)から N か月」を併記する。`out.window` に `pending` を持たせた | `test-check-delegation.mjs` の即時の解除の場面を対に改めた。判定の日 09-20・記録 09-01 では前の値(2)で判定不能が残り、判定の日 10-05 では新しい窓(4)で解ける |
| 中-1 :241 | `human-ai-boundary.md` の末尾の1文を外した。開示は IMPL-0517 の note(`human-ai-boundary.md:285`)、IMPL-0516 の note(`gate-criteria.md:2370`)、`template-repository.md` の手戻り率の行に書いた(四半期より短い・判定不能になりやすい・判定不能のあいだは止まらない・`observationWindow` を 3 にすると差し戻し率の窓も同じ長さになる) | 本文の変更。textlint 合格 |
| ADR-0129 | 決定2 を「構成の欄の設計」と読む旨、記録した日が実行日であること、現在の窓の読み方を足した。採らない案 3 件を追記(未公開の ADR のため書き換え) | |
| 低-1 | `rejectionText` の履歴を読めない分岐でも窓の長さを出す(型に `windowText` を持たせた) | `test-check-delegation.mjs` に追加 |
| 低-2 | `template/README.md`・`templates/00-d0-governance.md` の固定の文を「観測の窓の長さの継続(既定2か月)」にした。D-0 の生成区間は、日付に依らない形で「構成の最新の値は N か月で、YYYY-MM-01 の評価から効く」と書き分ける | `test-init-g5.mjs` 通過 |
| 低-3 | `REWORK_UNCOUNTED`・IMPL-0517 の note・`template-repository.md` にトレーラの読み方の範囲を開示。#441 へのコメントは議長が行う | |
| 低-4 | 件数の文に「書き手の名義・席を問わない」を添えた。期待を改めた | `test-check-delegation.mjs` の 2 件の期待を更新 |
| #354 低-1 | `04-traceability.md` を「目録・プレビューで見た現行の版である」にした | |

## 検査

- template: `test-check-delegation.mjs`(68 場面と付随の確認が一致)、`test-loosening-decider.mjs`(すべて通過)、`test-aggregate-records.mjs`(129 件一致)、`test-init-g5.mjs`(146 件一致)。NG 0
- 本体: `check-impl.mjs`・`lint:refs`・`check-template-drift.mjs`・`check-template-fields.mjs`・`lint:scope`・`lint:evidence`・textlint 合格。`impl:write` で台帳を再生成
- 直せなかった点: 無い
