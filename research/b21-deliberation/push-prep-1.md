# 束 B21 push の準備(1)

作成 2026-11-18。

## 直し(突合 2巡目の高 H2-1、議長の裁定: 採る)
- template `scripts/gate/pre-review.mjs` の `prRefOf`: owner/repo を照らす正規表現のスキームを任意にした。スキームの無い `github.com/other/repo/pull/77` も別のリポジトリとして読まず、foreign に出す。同じリポジトリのものは読む
- 試験 `test-pre-review.mjs` に M-3b を1件足した(スキーム無しの別・同リポジトリ、Markdown リンク、山括弧、`/pull/N`)
- 流した試験(Windows の node 26): test-pre-review・test-review-order・test-enforcement-inventory・test-review-queue・test-flow-observation。すべて期待どおり
- 中 M2-1(所在が外部 URL の上程は検出しない)は、note と出力で開示済みを確かめた。直さない。低は開示で閉じた
- IMPL の note は「別のリポジトリの PR の URL は読まない」で実態と一致したため、手を入れていない

## rebase
- 本体: origin/main(735a5b8d)から進んでおらず、rebase なし
- template: origin/main は 961eaac のまま、rebase なし

## 番号の重なり
- origin/main が進んでいないため、origin/main の最大より後ろで重ならない。ブランチ内の重複は lint:impl・lint:sources・evidence:write が通ることで確かめた。ADR は足していない

## 検査
| 検査 | 結果 |
| --- | --- |
| impl:write・evidence:write | 差分なし |
| scope:write | 失敗(IMPL-0219 の note の限定を地の文と検出)。scope-exempt.yaml へ理由付きで登録し、通過 |
| lint:impl・impl:issues・test:fields・lint:refs・lint:sources | 通過 |
| template:kb | tailoring-kb.json の source.commit だけが、本体の HEAD に合わせて変わる(内容の差分なし)。コミットに含めず、元の値へ戻した。本体の最終 HEAD で出る差は、並行の束の領分として報告する |
| コミットのメッセージの語 | 本体・template とも該当なし |
| textlint(変えた docs の md 6件) | 違反なし |

## 先頭
- template: 0f5f83d(基点 961eaac)
- 本体: 末尾に記す(この記録のコミット)

## template の変更の要約(961eaac..b21)
29 files changed, 3498 insertions(+), 9 deletions(-)
