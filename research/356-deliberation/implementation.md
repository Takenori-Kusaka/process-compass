# #356 部分 A の実装の記録

- 日付: 2026-11-17。指示の正本は `decision-draft.md` の 2 章と 8 章
- template: ブランチ `b8-356`。コミット 345f5f6(T-1〜T-8)、255f6fe(試験の目印・基準の行の場面・gate-g5 への結線)。退避: `tmp/bundles/template-b8-356-01.bundle`・`-02.bundle`
- 本体: d24949b4(S-1〜S-9)。番号は仮で、IMPL-0987・EV-0284・ADR-0139 を使った。議長が push の前に付け直す

## 実装した内容

| 指示 | 内容 |
| --- | --- |
| T-1・T-2・T-3 | `scripts/gate/seeded-error-scan.mjs`。標識は定数 `MARKER` の1か所。範囲の全コミットの本文(`%B`)を行頭の空白を許して照合。`--ledger` はリポジトリの外の台帳だけ(中にあれば拒否)。記録 `evidence/seeded-error-scan.json`。失敗のときも記録を書く。失敗の文に議長の裁定の文を入れた |
| T-4 | `ship-evidence.yml` の `evidence` ジョブで、集約の前に条件なしの手順「標識の残存を走査する」。verify ジョブにも「標識の残存を走査し直す」。成果物と証跡の一式の写しに記録を加えた |
| T-5 | `aggregate-evidence.mjs` の `readSeededScan`。欠落・JSON 不正・`scanRun`・`residual`・終点と起点の SHA を欠落にする。品質レポートに別の行、`evidence.json` に `seededErrorScan`。期間の集約は対象外 |
| T-6 | `scripts/gate/test-seeded-error-scan.mjs`(gate-g5.yml の contract ジョブへ結線) |
| T-7 | 基準の様式に行と用途の限定・事前周知の注意書き。`adoption-trial.mjs` の基準の読み取りに行を登録(行が無い旧い様式は止めない。`env` の行と同じ) |
| T-8 | スキル `adoption-trial.md` に項目15〜18、レビューの観点、機械の検査の例 |
| S-1〜S-9 | `impl-targets.yaml`(`seeded-error-scan` を template-file へ、`defect-ledger-template` の説明の誤りを直す)、マーク 20 件の改訂、IMPL-0987 の新設と `impl-inventory.yaml` への登録、ADR-0139、フェーズ5 の手引きと EV-0284、台帳の再生成 |

## 確かめていないことの結果

1. `adoption-trial.mjs run` が足した行を未記入の検査に乗せるか: **乗せる**。基準の読み取り(`readCriteria`)は、行の一覧に登録した行を `isFilledValue` で検査する。`env` の行の前例にならい、行を持たない旧い様式は止めずに記録の節に出す。試験で、説明のまま=問題を返す、記入済み=返さない、行なし=返さない、を確かめた
2. タグの実行の中で集約の前に走査を挟めるか: **挟める**。`evidence` ジョブの手順の順序と、`if:`・`continue-on-error` が無いことを試験が確かめ、手順の本文を bash -e で動かして記録ができ `residual` が 0 になることを確かめた。実機の GitHub では確かめていない
3. verify ジョブ: **走査し直さないと落ちる**。verify は別のジョブで `evidence/` を持たず、集約の再実行が走査の記録の欠落で落ちる。そこで verify にも、本文の印の `from`・`to` で走査し直す手順を足した。裁定の前提(記録を同じジョブで渡す)は崩れていない。実機では未確認
4. GitHub 上の squash(文の書き換え)は確かめていない(EV-0284 で開示済み)。手元では merge・rebase・既定の文の squash・cherry-pick の4通りで拾う

## 通した試験

- `test-seeded-error-scan.mjs`: 全件通過(T-1 の4通りの ng と ok の対、行頭の空白、T-2 の台帳の ng 2・ok・台帳なし・リポジトリ内の拒否、T-5 の ng 7 と ok と期間、T-4 の順序と本文の実行、T-7 の3場面)
- 壊して確かめる場面(落ちる記録): 標識の照合を外した版では4通りの ng がすべて通ってしまう。集約の欠落・`scanRun`・`residual`・終点の判定を外した版では、それぞれの ng が通ってしまう。各版で「通ってしまう」ことを期待する場面を `check` にしてあり、試験は全件ok。記録の欠落の判定は読めない JSON の判定が二重に守るため、壊す版は両方を外した
- 関係する既存の試験(template): adoption・aggregate-drift・aggregate-records・approval-pace・assurance-period・check-delegation・cl-judgment・control-approval・coverage-scope・defect-stages・direct-commit-rules・edition-end・env-check・g5-missing・handover-items・material-attribution・material-records-more・reach-forecast-record・records-history・records・roster-conditions・roster-ids・spec-recheck・tailoring-declaration・uplift-evidence・ship-evidence-steps が通過
- `test-discouraged-evidence.mjs` の2件の FAIL は、変更前の 03a315e でも同じ2件(Windows の CRLF による既存の偽の FAIL)。判定に使わない
- 本体: `template:kb`・`impl:write`・`evidence:write`・`scope:write`・`lint:refs`・`lint:impl`・`lint:evidence` と、`lint:scope`・`lint:provisions`・`lint:skills`・`lint:tone`・`lint:text`・`lint:dekimasu`・`lint:ci`・`lint:registry`・`test:fields`・`test:ci-wiring`・`test:template`・`test:impl`・`test:plan-issues`・`test:provisions` が通過。直した md に textlint を通した
- `npm run check` の全量と `test-g5-aggregate` は流していない

## 議長への申し送り

- `template:kb` が書き換える `tailoring-kb.json` の `source.commit` は、規則データを変えていないため元の値に戻した
- IMPL-0987 は `impl-inventory.yaml` の「事前の周知」の節と、要求事項1・3 の行に登録した
- EV-0284 の見直しは 2027-02 にした(S-5 の review と合わせた)
- 走査は、標識の行が `Seeded-Error:` で始まる行に限る(大文字小文字は問わない)。引用符つきの行(`> Seeded-Error:`)や文中の語は拾わない。偽の失敗の範囲は議長の裁定の文のとおり開示した
- verify ジョブの走査し直しは、裁定にない追加の手順だが、足さないと出荷の PR の再検査が落ちるため、実装の範囲として足した
- ADR-0139 と template の変更は、承認者・承認日を未記入にしてある(人が書く欄)
- 既存の採用者の `criteria.md` は、行を足すまで「様式に行なし」と記録に出る(実行は止まらない)。行のある様式では未記入を受け付けない
