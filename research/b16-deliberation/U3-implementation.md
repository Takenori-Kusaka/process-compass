# 束 B16 U3(様式 B と対応する手引き)の実装の記録

template のコミットは本記録の末尾に書く(bundle: `tmp/bundles/template-b16-U3.bundle`)。新しい `##` 見出しと必須欄は足していない(`template-fields.yaml` は変えない)。新しい節は太字の見出し行にした。

| 項目 | 降ろし先 | 内容 | マーク |
| --- | --- | --- | --- |
| IMPL-0569・0570 | 06 節「指標の閾値と予算区分」の行「AI 利用量の上限」 | G-1 で定める上限を分母、提供者の上限は分母にしない、未設定・測れないときは未測定 | delivered(target を budget-escalation から project-brief-template へ) |
| IMPL-0902 | 同 行「チーム単位の上限に到達したときの扱い」 | G-1 で合意して記録。提供者の上限の到達時の扱いを含む | delivered |
| IMPL-0977 | 同 行「安定性指標の閾値の記録事項」 | 窓・最小標本数・値の決め方・次の見直しの時期 | delivered |
| IMPL-0605・0611・0629 | 06 太字節「G-1 で定めて記録する例外の統制」(承認の直前) | 経路の判断基準・ファストトラックの回数の上限・例外の枠の3行 | delivered |
| IMPL-0950 | 06「稟議へ数値を出すとき」 | 列「出所の成果物」の表と、正本にしない・判定の対象にしない旨 | delivered |
| IMPL-0969 | 06「総費用の内訳」の箇条 | 検証費用を期間予算の内訳として明示。5区分の表の行は増やさない(check-g1 が5区分を数えるため) | delivered |
| IMPL-0798 | 手引き 06 の手順4・レビューの観点 | 外部の比率を自組織の補正値にしない | delivered(target を project-brief-guide へ) |
| IMPL-0752・0957 | 08 第7項 | 3行(禁止するライセンス・提出する記録・指摘時の措置)と全件適用の注記、結果責任の検査の範囲と手段の行。手引き 08 手順3 | delivered |
| IMPL-0807 | 08 第9項の箇条、手引き 08 手順5 | 置き先によらず確認者の D-0 表5-2 の区分を変えない | delivered |
| IMPL-0753 | 08 第10項(表の行と段落)。05 の分は U2 | 引き継ぎ文書の粒度を契約で規定、発注側の理解保持者 | delivered(U2 の 05 と合わせて) |
| IMPL-0857 | 手引き 08 の形式の箇条とレビューの観点 | 金銭措置型は客観的に観測できる量に限る | delivered |
| IMPL-0633 | 11 項目1 の行「評価の方針」 | 利用者ごとの集計を評価・順位・目標に使わない。案件・機能単位は妨げない | delivered |
| IMPL-0946 | 11 冒頭の箇条、手引き 11 の行「記名・連署」 | 適用を決める時点で5項目を定めて記名 | delivered |
| IMPL-0945 | 手引き 11 のレビューの観点 | 項目4 が項目3 を下回らない | delivered(target を qa-policy-guide へ) |
| IMPL-0948 | 手引き 11 の行「周知」 | 周知の文案に、各人の役割と停止の申し立ての経路の認識を含める | delivered(同上) |
| IMPL-0673 | 10 太字節「閾値の記録」(別表) | 前提・閾値の数値・定めた者・定めた日。主表の列は変えない(次の節の判断) | delivered |
| IMPL-0942 | 01 受入基準の表の後 | 異常系を書けない事実と理由を書く(spec-lint の検出語「など」を避けた) | delivered |
| IMPL-0545 | 手引き defect-ledger 手順8 | 3条件をすべて満たす場合に限る。凍結だけを理由にしない | delivered(target は defect-ledger-template のまま) |
| C-25 | 06「単一の年額を求めない理由」 | 「本様式は…欄も置きません」と主語を足した | なし |
| C-28 | 08 第2節、手引き 08 手順2 | 「定義(算出方法を含む)を書いて示し、第15項の合意の記名を得てから条件に用いる」を足した | なし |

## 検査

lint:impl・lint:refs・test:plan-issues・test:fields・lint:skills・lint:text は終了コード 0。`impl:write`・`evidence:write` を再生成。template の test-brief-thresholds・test-brief-estimates・test-defect-stages・test-handover-items・test-decisions・test-check-delegation・test-roster-conditions は通過。spec-lint で 01 の受入基準の節は検出 0 件。test-init-g5・test-edition-end は長い試験で、実行中に 1 件の失敗も出ていない(下の結果欄)。node_modules は検査の間だけ junction を張り、外した。

## 突合で見てほしい点

- 10 の閾値は主表の列にせず別表にした(主表の列の変更が他の読み手を壊さないため)。マークの旧い読み「台帳の列」と違う
- 06 の6区分目を表に足さず箇条にした(check-g1 の5区分の検査を変えないため)
- 06 の行 3つ(経路の判断基準・ファストトラックの上限・例外の枠)の置き場を、新しい太字節にした(適用: 例外承認・ファストトラックを使う案件)
- 08 第10項に「運用引き継ぎ文書」の行を足した(第10項は標準側で提出する記録の表)。標準 第6章 テンプレ8 の第10項の行の並びと矛盾しないか
- 08 第7項の5行目「結果責任の検査の範囲と手段」を足した。t8 の fields の方向(標準→様式)は変えていない
- 手引き defect-ledger.md は降ろし先 defect-ledger-template のまま(手引き用の target が無い)

template のコミット: `f6e9d70`。test-edition-end は記録時点で実行中、失敗 0 件(NG 行なし)。
