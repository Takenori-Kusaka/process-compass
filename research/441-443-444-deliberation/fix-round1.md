# #441・#443・#444 突合 1巡目の所見の直し(2026-11-17)

| 所見 | 扱い | 理由 | 所在 |
| --- | --- | --- | --- |
| R1-1 高 | 直した | 2.10.6 の記録の義務の1文を消した。IMPL-0899 の note を「記録する条文は無い。重の候補として #443 に残す」に戻した。ADR-0173 決定3 にも「課さない」と明記 | lifecycle.md 2.10.5 の段落・IMPL-0899、ADR-0173、decision.md §6 |
| R1-2 中 | 直した | 書き先を実在する欄「決断の記録」に改めた。結果の読み替え(通過を調整を行ったと読む)を注記に足した。準拠テンプレートの節の整備は IMPL-0954 の note で開示(template の項目) | lifecycle.md、deliverable-templates.md 注記、IMPL-0954 |
| R1-3 中 | 直した | 「担当自身の識別子が入る」を「どの識別子が入るかは確かめていない」に改めた。CLAUDE_CODE_CHILD_SESSION は根拠に使わない | human-ai-boundary.md EV-0318 の本文、agent-trace-control.md |
| R1-4 中 | 直した | 照らす先を要求事項4 の置き場(企画書、SG の後は判定記録)と書き、準拠テンプレートが企画書だけを読む点を note で開示。template の項目として残す | lifecycle.md IMPL-0374、ADR-0173 決定2 |
| R1-5 低 | 直さない | rebase で履歴を書き換えない。#444 へのコメントに「IMPL-0743 の変更はコミット 68b43df0 にある」と1行書く(文案のみ。投稿は議長) | - |
| R1-6 低 | 直した | 調整の記録を 5.7.4 の抽出の母集団に含める、と注記に書いた(「価値責任者の判断」と同じ扱い) | deliverable-templates.md 注記 |
| R1-7 低 | 直した | 別の1文は維持。R1-2 の結果の扱いをその文に足した | deliverable-templates.md 注記 |
| R1-8 低 | 直さない | E1 は弱い向きの表示で、実態より強くない。本文に単一の基盤と書いてある | - |
| R1-9 低 | 直した | T3 を `--resume <識別子>` にした | agent-trace-control.md |

検査: lint:impl・lint:refs・lint:evidence・lint:scope・test:plan-issues は通過。変えた md の textlint は指摘なし。
