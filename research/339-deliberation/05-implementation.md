# #339 実装の記録(2026-11-15)

裁定 04-ruling.md の 2(A′)・3(F の本文側)・4(再審議の条件)を本文だけで実装した。

## 変更

- `src/content/docs/phase4-process-design/human-ai-boundary.md`
  - 5.5.4 の表「登録の根拠の記録」の行に、機械が確かめる範囲(記入の有無まで)、確かめないもの(所在の形・実在・登録時の算出の実行)、「課さないと決めたものであり、書かれていないだけではない」、内容の確認の担い手(登録する者と席の責任者。manual)、実行時の計測は 5.4.6 が出し記入は集計に読まれないこと、#348 の結論による再審議の条件を、同じ行の中に書いた
  - IMPL-0035 の note を実態に合わせた(任意の文字列が通ること、集計に読まれないこと、内容の確認は manual、再審議の条件)。state=delivered・check=presence は変えない
  - 新規 IMPL-0983(target=assurance-period-workflow、undelivered、plan=scheduled、issue=339、review=2027-05): 「内容は未確認」の表示
  - 新規 EV-0279(E0、見直し 2027-05): 内容の確認の担い手の根拠水準
- `src/data/impl-inventory.yaml`: 5.5.4 登録の節に IMPL-0983 を追加
- 台帳(implementation-ledger・evidence-ledger)を再生成

## 内部監査の項目の有無

プロセス内部監査(phase6-operation/process-audit.md)に、basis.detection の内容を照らす専用の項目は無い(観点23 は監査自体の形骸化の検知)。そのため adopter ではなく、登録する者と席の責任者による manual とし、専用の項目が無いことと未確認として扱うことを EV-0279 で開示した。IMPL-0518 の note が観点23 を引いている点は本件の範囲外(別途の食い違いの可能性として申し送る)。

## 使った番号(議長が付け直す)

- IMPL-0983(前の最大は IMPL-0980)
- EV-0279(前の最大は EV-0274)

## 検査

lint:impl・lint:evidence・lint:scope・lint:refs・lint:provisions・test:impl・textlint(対象ファイル)を実行し通過。回帰の全量と check の全体は流していない。
注意: この作業ツリーに node_modules が無かったため、`node_modules` を主リポジトリへの junction で作った(未追跡。コミットに含めない)。template/・pit-crew/ は触れていない。
