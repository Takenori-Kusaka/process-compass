# 束 B18 実装 A の push の準備(1回目)

## 直しの差分の範囲

- 件: review-A-2 の高-A(議長の裁定どおり)と低-B。
- template 5d42994: `scripts/gate/check-pr.mjs`(`decisionG3Reach`)と `test-check-pr.mjs`。
  - この PR のレビューを読めない(`reviews` が配列でない)ときは `ok: null`(注意)。
  - 記録用ブランチを読めないときは失敗を残し、理由の文に読めない旨を書く(この PR の判断記録・PR を経ない判断記録)。
  - 写しが無いときは失敗を残し、写しが無い旨を書く。衝突の記録のある写しは `ok: null`。
  - 試験: 5 場面を足し、`reviews` を渡していなかった既存の4場面に `reviews: []` を足した。
  - bundle: `E:/Github/process-compass/tmp/bundles/template-b18-a-fix2.bundle`。
- 本体 13f4cd61(rebase 後): lifecycle.md の IMPL-0972 の note、pre-review-automation.md の CODEOWNERS の構成例(先頭に `*` と説明の1句)、`impl:write`。
- 本体 beba5420: EV の付け直しと台帳の再生成。

## rebase

- origin/main は bb421d43 から 87e1a690 へ進んでいた(graphify の manifest と token-usage への1行だけ)。本体を載せ直した。衝突なし。
- template の origin/main は 9ab110b のまま。載せ直し不要。

## 付け直した番号

| 種別 | 旧 | 新 | 備考 |
| --- | --- | --- | --- |
| EV | EV-0322(ADR-0200) | EV-0326 | origin/main の最大は EV-0325。B15 側の EV-0322 は据え置き |
| IMPL | なし | なし | 本束は既存の印(0211・0384・0567・0610・0767・0972)の note を直しただけで、新設なし |
| SRC | なし | なし | research/sources の差分なし |
| ADR | ADR-0200 | ADR-0200 | origin/main に 0200 は無い |

過去の記録(research/b18-deliberation/ の他のファイル)の EV-0322 は、当時の番号のまま残した。

## 検査(終了コード)

| 検査 | 終了コード |
| --- | --- |
| impl:write・evidence:write・scope:write | 0 |
| lint:evidence | 0 |
| lint:impl | 0 |
| lint:refs | 0 |
| lint:sources | 0 |
| test:template | 0 |
| test:fields | 0 |
| template の test-check-pr(255 場面) | 0 |
| template の test-base-judge-workflow・control-approval・material-attribution・material-records-more・performer-account・roster-ids・spec-recheck・stack-coverage・init-g5 | すべて 0 |

回帰の全量(`npm run check`)は流していない。push の前に1回流す。

## 先頭の SHA

- 本体: beba5420(この文書のコミットが続く)
- template: 5d429946184f0ece64f6d9105dd19499093569c4(b18-328)
