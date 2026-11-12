# #357 再開時点の状態(2026-11-12)

## 退避の所在

- 本体: ブランチ `worktree-agent-a9b5b1d90c6116a87`。origin/main(847934b)の上へ rebase 済み。push していない
- template: ブランチ `wip-357`。template の origin/main(7424b49)の上へ rebase 済み。push していない
- template の bundle: `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\57407214-235d-44fb-877e-77deb0fbb998\scratchpad\wip-357-template.bundle`(コミットのたびに作り直す。最新は wip-357 の a7d1900 まで)

## 段ごとの状態

| 段 | 状態 | 所在 |
| --- | --- | --- |
| 受付(重の判定) | 済 | `intake.md`(審議の重さ: 重) |
| 調査(内部) | 済 | `survey.md` |
| 調査(外部) | 済 | `survey-external.md` |
| 議題の整理 | 済 | `council-10-agenda.md` |
| 会議体: 起案 | 記録あり | `council-11-drafter.md` |
| 会議体: 現場 | 記録あり | `council-12-field.md` |
| 会議体: 品質監査 | 記録あり | `council-13-qa-audit.md` |
| 会議体: 規格 | 記録あり | `council-14-standards.md` |
| 会議体: 弁護 | 記録あり | `council-15-defender.md` |
| 議長の裁定 | 記録あり(裁定1〜10、採らない案のまとめ、範囲外の発見) | `decision.md` |
| 実装(標準側) | 途中。phase4 の7ページ・phase6 process-audit・`template-fields.yaml` を変更済み。**ADR-0127 の本文ファイルが未作成**、ADR 索引も未更新 | 本体 wip |
| 実装(template) | 途中。gate の config・集約・試験の追加。試験の目印が一部欠ける | template wip-357 |
| 独立の突合 | 未着手 | — |
| 突合への直し | 未着手 | — |

## 検査の現況(未完で失敗するもの)

- `lint:refs`: ADR-0127 のページが無い(assurance-case.md 261・285 行)。ADR 本文の作成で解消する
- `impl:write`: `test-roster-conditions.mjs` に IMPL-0117:ng/ok と IMPL-0184:ok の目印が無い。template の試験の追記が要る。IMPL-0513・0514 の `plan=adopter` には `decision=ADR-0127` を足した
- evidence:write・scope:write は台帳に差異なしまたは更新済み。template:kb は複製を更新(template a7d1900)

## rebase の衝突と解決

- `tailoring-guide.md` の IMPL-0462 の行: origin/main 側は #358 の issue 番号の書き換え(359 → 357)だけ。wip 側の「delivered・試験あり」の版と EV の節を採った
- `template` の参照: 再 rebase した wip-357 の先頭へ合わせた

## 番号の付け直し

| 旧(仮) | 新 |
| --- | --- |
| EV-0260 | EV-0253 |
| EV-0261 | EV-0254 |
| EV-0262 | EV-0255 |
| EV-0263 | EV-0256 |
| IMPL-0530 | IMPL-0513 |
| IMPL-0531 | IMPL-0514 |
| IMPL-0532 | IMPL-0515 |
| ADR-0127 | ADR-0127(変更なし) |

- origin/main の最大番号は ADR-0126・EV-0252・IMPL-0512。衝突しない
- 置換の範囲: research/357-deliberation、phase4 のページ。template 側に旧番号は無い

## 次の段で議長が決めること

- ADR-0127 の本文を裁定1〜10から書く(実装担当)
- template の試験に IMPL-0117・IMPL-0184 の目印を足すか、マークの降ろし先を直すか
- 実装後の独立の突合(1巡目は全体)へ進めてよいか。裁定8(3対2)は新しい義務に当たるため、重の記録どおりに扱う
