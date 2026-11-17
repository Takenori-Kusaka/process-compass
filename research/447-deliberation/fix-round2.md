# #447 独立の突合 2巡目の直し(2026-11-17)

議長の裁定: 6件とも案どおり。義務は増やしていない。

| 所見 | 直した所在 |
| --- | --- |
| R2-1 | human-ai-boundary.md 数える行の定め(実施者の名が1つ以上あり、すべて人の名簿にあって AI の名義を含まない)、IMPL-1022 の note、deliverable-templates.md の様式の注記(実施者が空欄の行を数えない) |
| R2-2 | human-ai-boundary.md の頻度の箇条(1期間に2回以上を求める値は読めない値)、deliverable-templates.md のテンプレ11 の行・IMPL-1021(parseInterval を流用しない)。IMPL-1020 は既存 |
| R2-3 | human-ai-boundary.md 5.4.5 条件5(基準日は引き上げの判定の日) |
| R2-4 | human-ai-boundary.md の末日の定め(年は12か月として加算)、IMPL-1022(intervalEnd は降ろすとき末日へ揃える) |
| R2-5 | decision.md 1.3 の表の直下と 2.1 の冒頭に、改めた旨と正の所在の注記 |
| R2-6 | deliverable-templates.md の D-0 の説明と様式の注記に「(第5章 5.4.7 の判定による)」 |

ADR-0179 決定2 は本文が定義を持つので変えない。検査の結果は下の追記。

検査: textlint 違反なし。lint:refs・lint:impl・test:impl・lint:evidence・lint:scope・lint:tone・lint:provisions・test:fields すべて終了コード 0。台帳を再生成済み。
