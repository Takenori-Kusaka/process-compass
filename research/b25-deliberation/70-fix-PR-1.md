# 束 B25 — 単位 P の突合 1巡目の所見の直し(2026-11-19)

template のコミット 4d03424(b25。push していない)。bundle: `E:/Github/process-compass/tmp/bundles/template-b25-P-02.bundle`(`origin/main..b25`)。本体はコミットしていない(議長がコミットする)。
試験: `test-pre-review.mjs` すべて期待どおり(WSL node 26)。ほかに test-push-trigger 27/27、test-enforcement-inventory、test-base-judge-workflow 127/127、test-aggregate-wiring 61、test-delegation-wiring 27、test-agent-run-record 34、test-adoption の workflow 一覧の一致(preflight の TEMPLATE_WORKFLOWS)は ok。回帰の全量は流していない。本体: `lint:impl` 終了 0、textlint 終了 0。

## 所見ごと

| 所見 | 結果 | 直した所在 | 足した試験 | 外して落ちること |
| --- | --- | --- | --- | --- |
| 高-1 G-5 | 直した | `pre-review.mjs` の `shorteningForbidden`(G-4・G-5 と会議体)。本体 IMPL-0830 の note と 3.10.2 の図(「G-4・G-5 か」。文は変えない) | 0830(a) の題材を G-5 から G-6 へ移した。0830(b) に G-5 の ng(行があっても短縮できません)と判定関数の ok(G-3 は短縮可) | M1(G-5 を戻す)で2件落ちる |
| 高-2 R1 の導出不能 | 直した | `respondedCheck`(R1・判定資料の PR あり・`req.logins === null` のとき、指名レビュアの分を照らし、欠けは fail、揃えば unverified。「必須応答の者を導出できない(理由)。指名レビュアの分だけ照らした」を出す) | 揃っていて unverified、欠けで fail、変更ファイルを読めれば dave 欠けで fail。既存の「PR 番号でも結べる」の場面は、導出できる入力へ改めた(旧い入力は高-2 の場面そのもの) | M2 で2件落ちる |
| 中-1 paths | 直した(甲) | `pre-review-responded.yml` の `paths` を外した。記録を含まない PR は「確かめていない(記録を含まない PR)」で 0 終了。README の手順に、全 PR で動かす旨と paths を足さない旨を書いた | 既存の「記録を含まない PR は確かめていない」を、新しい文言で通す。workflow の結線は一覧の試験で確認 | workflow の契機は YAML のため、機械の試験では固定していない(README と workflow の注釈で開示) |
| 中-2 混在 | 直した | `respondedCheck` の優先を fail > unverified > pass > out にした。`respondedMain` が unverified のとき `::warning::` とジョブの要約(`GITHUB_STEP_SUMMARY`)へ出す。終了コードは fail だけ 1。記録を含まない PR は全 PR で動くため、注記と要約は出さない(裁定の「unverified のとき」の例外。理由は雑音) | 結べる記録+結べない記録 → unverified。失敗+確かめていない → fail。範囲外+確かめていない → unverified | M3(旧い優先)で2件落ちる。`::warning::` と要約の出力は main の入口で、単体の試験は無い(`node --check` と目視のみ) |
| 低-1 sync-escalation.md | 直した | 「範囲は R1 の上程の指名レビュアと、CODEOWNERS から導いた必須応答の者。起案者が判定資料へ足した者は機械は照らさず、決定者が確かめる」 | 文書のため無し | 文書のため無し |
| 低-2 祝日 | 直した(境の場面を1件) | 実装は変更なし(`publishedLate` を通している) | 公開 11-20・判定 11-27 は、祝日 11-23 を挟むと4営業日で下回り、祝日の指定が無ければ5営業日で下回らない。0830 の通知(公開 11-20、T 11-27)も同じ境で変わる | M7(祝日を無視)で落ちる。**M8(独自の営業日 < 5/10 への置換)は落ちない**。`publishedLate` が営業日数の比較と意味が同じため、挙動の試験では区別できない。受け入れる(構造の要求で、同じ関数を通すことは試験で閉じない) |
| 低-3 印のゲート | 直した | `unreadableMarkRowsFor` を足し、行なしの通知の文に「印のゲートを読めません(G-1〜G-8 の語を中黒か読点で並べて書く)」と行の ID を出す。挙動(通知する側)は変えない。範囲の書き方は読まない | 「G-3〜G-6」の行 → 通知に読めない旨と D-001。読める行が無い通知には出さない | M4 で落ちる |
| 低-4 代理と外した理由 | 直した | `fetchGateRecords` が `mergedBasis`(pr/commit)を返す。`metricsFor` が `dropped`(記録に結べない・公開の時点を読めない・判定の時点を読めない)と `proxyPr`・`proxyCommit` を数え、`metricsBody` が同じ行に出す | 理由ごとの件数(3種)と、代理の根拠の内訳 | M5・M6 で落ちる |

## 本体の変更(コミットしていない)

- `src/content/docs/phase4-process-design/roles-responsibilities.md`: 3.10.2 の図の「G-4 か」を「G-4・G-5 か」へ。IMPL-0830・0214・0216 の note を実装に合わせた(山括弧なし)。条文の文は変えていない
- `src/content/docs/community/implementation-ledger.md`: `impl:write` で再生成

## 記録に残す点

- 高-1 の起点: B22 の Issue のコメントの項目2 が G-4 だけを名指したことと、3.10.2 の図が「G-4 か」だけだったこと。本束はそれをそのまま実装した。条文(3.10.2)と ADR-0223 決定2 が正
- 見ていない点: 実物の GitHub での workflow の契機・必須チェックの挙動(中-1 の根拠は GitHub の仕様の記述。#361 で確かめる)。`::warning::` と要約の実機の表示
- SKILL.md・gate-g5.yml は触っていない(束 B23 と並行のため)
