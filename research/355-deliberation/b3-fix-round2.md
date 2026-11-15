# #355 束3 独立の突合 2巡目の所見の直し(2026-11-15)

指示は `b3-fix-round2-ruling.md`。template のコミット 1e12ad2(ブランチ b6-355-b3)。bundle: `E:/Github/process-compass/tmp/bundles/template-b6-355-b3-03.bundle`(origin/main..b6-355-b3)。本体側はコミットしていない。

## 所見ごとの直し
- R2-01・R2-04(高・中): `template/scripts/gate/spec-recheck.mjs` の `effectiveUnseen` を外した。版を読めた通過の全件が先端と一致しなければ不一致。欠落の文は「変更後の版を対象とすると確かめられる効いている通過もありません」。版を読めない効いている通過が在れば、所在と「対象へ版を書けば比べられる」を併記(項目に `unseen`)。式の1文を spec-recheck.mjs の冒頭・gate-criteria.md の式・IMPL-0241 の note (2)・ADR-0136 の「不一致」へ追加。純関数の試験(旧 r5)は新しい式の期待へ改めた。通し D3(R2-01)・D4(R2-04)を足した。
- R2-02(高): ADR-0136 の84行を指示の文へ書き換え、「効いている通過に版を読めないものが在るときは未確認にする」を採らなかった案へ足した。
- R2-03: `test-aggregate-drift.mjs` の通し N を、ずれの本文(`担い手の識別: 宣言にない`)が `::error::` と「欠落」の節に出ないことと、`::error::` の件数が適合の実行と等しいことで見る形へ。
- R2-05: `why` は理由のある判定だけから作り、`record` は未確認の理由になった記録(効いているものを先に)。純関数の試験と通し D5 を足した。
- R2-06: Q2b に `recGap(...).length === 0`。R2-07: C2 の `IMPL-0241:ng` の目印を外し「分担の固定」へ。
- R2-08: EV-0267 の重複の前の1文を削った。R2-09: 前置きを「集約には次の限界がある。」へ。aggregate-evidence.mjs のコメントを式の文へ。

## 必須の確認(WSL の写しで)
- R2-03: 集約の `const drift = …` の直後へ `for (const d of drift) gaps.push(d);` を足すと、test-aggregate-drift の通し N が NG(1件落ちる)。戻して通過。
- R2-01: `effectiveUnseen` の分岐を戻すと、純関数の R2-01 の1件と通し D3 の2件が NG。戻して通過。

## 試験(WSL node 26、写しで前景に流した)
- test-spec-recheck 103 件、test-aggregate-drift 25 件、test-check-pr 214 場面、test-aggregate-records 135 件、test-direct-commit-rules 11 件。すべて合格。
- 本体側: `impl:write`(implementation-ledger の1行が変わった)・`evidence:write`(変更なし)、lint:impl・lint:evidence・lint:scope・lint:refs・textlint(0136・gate-criteria)は終了コード 0。junction は外した(b3 の node_modules は無傷)。

## 指示と違えた点
- なし。EV-0267 の対象へ R2-01 の1文は足していない(裁定は R2-08 の重複削除のみを指示)。

## 確かめていないこと
- 回帰の全量、`npm run check`。GitHub の実環境(squash 後の版の取得)。
- gate-criteria.md の表の右のセル(判定の概要)は式の1文を足していない(式の箇条書きと note が正)。
