# #355 束1 独立の突合2巡目の所見の直し(2026-11-17)

裁定は `b1-fix-round2-ruling.md`。3巡目の突合は行わない。

| 所見 | 結果 |
| --- | --- |
| R2-01(高) | `G-3.md` の述語「は通る」を戻した |
| R2-02(中) | 連絡先の語から「エスカレーション」を外した(`handover-items.mjs`・標準 `gate-criteria.md`・IMPL-0985 の note・`05-handover.md`)。試験へ2場面を足した(白紙の連絡先の節と記入のある別のエスカレーションの節は unfilled、エスカレーションだけを見出しに持つ文書は missing) |
| R2-03 | IMPL-0985 の note に「切り戻し」の表の行を足した。補助ファイルの機械の検査の2つ目の箇条を揃えた |
| R2-04 | `check-decisions.mjs` と `G-3.md` の参照を「事業影響の欄の検査が加わった版への移行」へ改めた |
| R2-05 | README の同段落へ、旧い様式の記録は「置き換える決定」の欄も足す旨を足した |
| R2-06 | `check-decisions.mjs` の注から「言い換えた写し」を外した |

試験(Windows, node v26.13.0): test-handover-items 25 件、test-decisions 61 件、test-g5-missing、test-aggregate-records 135 件、test-aggregate-drift 25 件が通過。test-g5-aggregate の 4 件は CRLF による偽の FAIL で判定に使わない。本体の impl:write・evidence:write・scope:write・lint:refs・lint:impl・lint:evidence は通過。
