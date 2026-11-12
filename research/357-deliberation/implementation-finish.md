# #357 実装の仕上げ(2026-11-12)

## 実装した裁定

- 裁定1〜10 の標準側の変更と template 側の実装は、前の段までに入っていた(phase4 の7ページ・phase6 process-audit・`template-fields.yaml`、template の gate)
- 本段で足したもの: ADR-0127 の本文(`src/content/docs/adr/0127-external-reviewer-seats-restriction-scope-and-organizational-distance.md`。決定1〜10 は裁定1〜10 と同じ番号)
- ADR 索引(`adr/index.md`)は運用の説明とテンプレートだけで、ADR の一覧を持たない。sidebar は autogenerate のため、追加の編集は不要
- 責任者・承認者の欄: ADR の承認者と承認日は未記入のまま(ADR-0126 と同じ形)。AI の名義は書いていない

## IMPL-0117・IMPL-0184 の原因と対処

- 原因: もともとの不整合ではなく、wip の途中の欠け。origin/main では IMPL-0117 が `undelivered` で試験の目印が無かった。wip が `delivered`・`test=` に改めたが、試験側の目印を足していなかった。IMPL-0184 は `ng / ok` を1行に並べており、検査は `ng` と `ok` を別の行の目印として探すため `ok` が見つからなかった
- 対処: `template/scripts/gate/test-roster-conditions.mjs` に `IMPL-0117:ng`・`IMPL-0117:ok` を足し(本人が確認した記録の拒否と、力量の記録を持つ確認者の受け付けの対。後者は検査を1件追加)、IMPL-0184 を2行に分けた。マークの target は変えていない。template wip-357 にコミットし bundle を作り直した

## 検査

- `lint:refs` 通過、`evidence:write`・`scope:write` 差異なし、`impl:write` 成功(降りていないのは IMPL-0513・0514 などの `plan=adopter` を表示)、`template:kb` 更新済み、ADR-0127 に textlint 通過
- template の試験: roster-conditions(44件)・loosening-decider・edition-end(50件)・cl-judgment(87件)通過。回帰の全量と `npm run check` は流していない

## 議長への問い

- なし。独立の突合(1巡目は全体)へ進める状態。裁定8(3対2)は新しい義務のため、重の記録どおりに突合へ渡す
- 補足: ADR-0127 本文の「影響」「見直しの契機」は裁定に無い見出しだが、ADR の標準様式(影響)と ADR-0126 の形に揃えて、裁定の内容だけで書いた
