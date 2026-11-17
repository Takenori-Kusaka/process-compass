# #327 T8 実装の記録(束 B12)

指示書: `b12-T8-01-drafter.md` と、条件を付けた `b12-T8-02-review.md`。審議の段は編集の指摘に準じる(決定済みの意味(ADR-0013 決定2・ADR-0154 決定6)への揃え)。

## 変えたもの

- 3か所の「導入後の判定件数が、置換前を上回らないことを確認した」を「廃止・置換する既存の承認・様式と、新設する判定の差し引きが負であることを確認した」へ: `tailoring-guide.md`、`phase5-implementation/enablement.md`、`template/templates/trial-checklist.md`
- `template/README.md` に「### 12. process-compass #327 の更新を取り込むとき」を足した(反対委員の条件1。必須)。template のコミット: bundle `E:/Github/process-compass/tmp/bundles/template-b12-327-01.bundle`
- IMPL-1002 を `state=delivered check=presence`(単位: 行)へ。note に、複製の検査が比べるのは標準と template の2つで enablement.md の写しは比べないこと、確かめる者(試行の責任者。enablement.md の写しは本文を改める者)を書いた(条件2)

## 採らなかったこと

- `check=machine`(機械が見るのは文の一致で、差し引きの数ではない)。enablement.md を複製の検査へ結ぶこと(検査の拡張。T8 の範囲外)

## 検査

`lint:impl`・`impl:write`・`lint:refs`・textlint・`npm run check`(結果は 354 の記録の末尾に同じ)。

## npm run check の結果

テンプレートの試験 2 件が落ちた: test-g5-aggregate(CRLF の偽の FAIL)と test-discouraged-evidence(origin/main の template でも同じ 2 件が落ちる。Windows の既存の失敗。本件の変更とは無関係)。ほかは通過
