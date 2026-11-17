# 束 B16 U1〜U3 の突合(1巡目)の直し

直した所(template のパスは template/ 配下)。

| 所見 | 直した所 |
| --- | --- |
| H-1 | templates/03-debt-ledger.md 欄「返却の目安」の括弧を「出荷判定者が突合の日と比べるため。集約による比較は降りていない」へ。区分表の「出荷を止める」に主語(出荷判定者)を足した。IMPL-1008 は未達のまま(B15) |
| H-2 | templates/06-project-brief.md 太字節「例外の統制」の適用の注記を外した。7.3.1・7.4 制約2・7.9.5 要求事項1 はいずれも全案件に G-1 の時点の記録を求め、例外を使うかは G-1 で決まらないため。IMPL-0605・0611・0629 の note は変えない |
| M-1 | .claude/skills/gate/gates/G-7.md 基準6 を「G-1 で承認した企画書の『指標の閾値と予算区分』に、閾値と記録事項が書かれていること」へ |
| M-2 | templates/04-gate-record.md の3つの太字節を `##` の節に独立させ、適用を見出しに置いた。src/data/template-fields.yaml の extra へ3件登録(kind: structure)。必須欄は足していない。lint:scope・test:fields は通過 |
| M-3 | 04 の継続の表の導入文に、必達基準2 が乙・丙の状態での保留(7.7.5)を足した |
| M-4 | 04 会議体の判定の欄に、SG では差し戻しを用いないこと(3.7.3)と、AI の利用の評価の判定と同じ値を書くことを足した。IMPL-1000 を delivered へ(note は実態に合わせた。check=manual、plan・issue・review は外した) |
| M-5 | 03「ゲートでない決定の未達」: 調達先を「内容」へ、「返却の目安」は見直しの期日と担当者へ。区分「未解決」の扱いに「ゲートでない決定の未達の行は、見直しの期日に再び宣言し直す」を足した。作成の手順(artifacts/03-debt-ledger.md)も同じに揃えた |
| M-6 | .claude/skills/gate/SKILL.md 項8 の括弧を「会議体 B-1〜B-4 の判定。工程ゲートは判定会議を開かないため当たらない」へ |
| L-1 | 06「AI 利用量の上限」を「…働かないことを開示する」へ |
| L-2 | 03 ファストトラックの節に、短縮できる対象は 7.4 の限定列挙(exception-paths.md)に限る旨の箇条を足した |
| L-3 | artifacts/03-debt-ledger.md の手順 4a・4b を 5・6 に振り直し、回収の手順を 7 にした |
| E-1 | artifacts/defect-ledger.md 手順8 の出典を「標準 第4章 G-5『是正の起動』」へ |
| E-2 | G-6.md 項8・9 の出典を「第4章『タスクの分割基準』の規範」「第4章『帯域を理由に判定を省略しない』」へ |
| E-3 | G-5.md 項9 を「G-5『秘匿情報の混入(基準7)』」へ |

直さなかった所見: なし。M-2 は template-fields.yaml(brief の「新しい必須欄を足さない」の対象外の extra)を触った。議長の裁定を要する点として残す。

検査: lint:impl・lint:scope・lint:refs・lint:skills・test:fields は終了コード0。template の試験 test-brief-thresholds・test-reach-forecast-record・test-defect-stages・test-brief-estimates・test-spec-lint は通過。test-spec-recheck は実行が長く未確認。
