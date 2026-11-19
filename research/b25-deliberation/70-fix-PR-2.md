# 束 B25 — 単位 P の突合2巡目の所見の直し(2026-11-19)

template コミット 15ae798(b25)。bundle: `E:/Github/process-compass/tmp/bundles/template-b25-P-03.bundle`。push していない。

## 所見ごとの扱い

| 所見 | 扱い | 所在 |
| --- | --- | --- |
| 高-N1 | 直した | pre-review.mjs: `fetchPrRecordFiles` が読めないファイルを `{path, text:null, why}` で返し、一覧を読めないときは例外。`respondedMain` が一覧の失敗を `listUnreadable` として渡す。`respondedCheck` は text:null を unverified の行にし、一覧不能は「確かめていない(変更ファイルを読めない)」。「記録を含まない PR」は一覧を読めて記録のパスが無いときだけ(`noRecords:true`、注記なし)。終了コードは fail だけ 1 |
| 1巡目 低-4 の残り | 直した | `metricsFor` に `dropped.badFields` を足し、リスク区分を読めない・欄に不備のある上程を「判定の記録に結べない」から分けた(出力は「欄に不備(リスク区分を含む) N」)。IMPL-0216 の note も4種に改めた |
| 低-N1 注記が合格の行も拾う | 直した | `respondedCheck` が `flagged`(確かめていない行だけ)を返し、`::warning::` はそれを使う。合格の行は入らない |
| 低-N2 総合の文 | 直した | `VERDICTS.unverified` を「確かめていない(理由は個別の行を見よ。失敗にはしない)」へ |
| 低-N3 CODEOWNERS 無し | 開示 | README の当該の文、IMPL-0214 の note |
| 低-N4 欄の不備 | 低-4 の残りと同じ(直した) | 上記 |
| 低-N5 paths を外した影響 | 開示 | README の必須にする手順の行、workflow の注釈、IMPL-0214 の note |

低-N5 の確認: 高-N1 の直しの後は、記録の一覧と記録ファイルの読み取りの失敗は unverified で 0 終了(止めない)。ただし `main` の `fetchIssues`(上程の一覧)の失敗は respondedMain の前で例外になり非 0 終了のまま。この部分は当たるので、そう限定して開示した。順序の入れ替え(記録の一覧を先に読む)は挙動の新しい分岐として足していない。

## 足した試験(test-pre-review.mjs)

- 記録ファイルを読めないとき text:null と理由で返す
- 読めない記録だけの PR は「記録を含まない」と出さず、flagged 1 件
- 記録2件のうち1件を読めない PR は pass にしない。flagged は読めない行だけ
- fail と読めない記録の混在は fail
- 変更ファイルの一覧を読めない(listUnreadable)は「変更ファイルを読めない」で flagged、noRecords false
- 一覧を読めて記録が無いときだけ noRecords true・flagged 0
- 混在の flagged に合格の行を含めない
- リスク区分を読めない上程は badFields に数える(内訳の合計が unbound に一致)

## 外して落ちることの確認

`respondedCheck` の text:null の分岐を `if (false)` に変えて流すと、「読めない記録だけの PR は…」が NG(終了 1、「1 件が期待と違う」)。戻して全件 ok。

## 高-N1 の場面(直しの後の出力。試験の変数を印字)

```
## 読めない記録1件: status=unverified → ::warning:: あり
  docs/gates/g6-x.md: 記録を読めない(HTTP 500)。確かめていない
  確かめていない(理由は個別の行を見よ。失敗にはしない)
## 記録2件のうち1件を読めない: status=unverified → ::warning:: あり
  docs/gates/g6-x-2026-11-27.md: 上程 #5(R1)。宣言行が揃った(判定日 2026-11-27 まで。2 名)。応答の中身は確かめていない
  docs/gates/b.md: 記録を読めない(HTTP 500)。確かめていない
## 変更ファイルを読めない: status=unverified → ::warning:: あり
  確かめていない(変更ファイルを読めない): PR の変更ファイルの一覧を読めないため、判定の記録(docs/gates/*.md)の有無を確かめていない(HTTP 500)
## 記録を含まない: status=unverified → 注記なし
  確かめていない(記録を含まない PR): 判定の記録(docs/gates/*.md)を含まない PR のため、この検査の対象ではない
```

注記の対象は「記録2件のうち1件」の場面では b.md の行だけ。

## 実行

WSL node 26 の test-pre-review.mjs: すべて期待どおり。`npm run lint:impl` 終了 0(降りていないマークの表示は既存)。`impl:write` で台帳を再生成。

## 残った点

- `main` の `fetchIssues` の失敗は、記録を含まない PR も止めうる(開示済み。順序は変えていない)
- respondedMain / main の通し実行(gh 差し替え)は流していない。実物の GitHub は #361
- 本体の変更(roles-responsibilities.md の IMPL-0214・0216 の note、implementation-ledger.md)はコミットしていない
