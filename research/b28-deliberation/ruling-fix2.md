# 束 B28 U4a・U4b 独立の突合2巡目への裁定

裁定 2026-11-20。対象は `review-2.md`(高0・中1・低2)。3巡目は開かない。

| 所見 | 裁定 | 中身 |
| --- | --- | --- |
| M2-1 `changeListBetween` を check-pr 自身が呼ばず、同じ作り方の一覧が check-pr.mjs に3つある | **U5 で直す。それまで開示** | check-pr.mjs の2か所も同じ関数を通す直しは、check-pr.mjs を触る単位 U5 に入れ、U5 の独立の突合で見る(突合の無いまま check-pr の中身を組み替えない)。今は IMPL-1029 の note に「段の変更の一覧は check-pr.mjs の `changeListBetween`。check-pr 自身の2か所は同じ作り方の別の実装で、一致を固定する試験は無い」と開示する |
| L2-1 settings.md の「R1 の変更の PR と案件の条件でだけ走り」 | 採る | push の経路と手動の実行(必須の側)を落とさない文へ |
| L2-2 IMPL-0930・0763 の note に足した試験が載っていない | 採る | test-aggregate-wiring・test-init-g5 を note に足す。`impl:write` |

- (f) の「想定外の1件」は集計の行の数え違いで、試験の失敗ではない(2巡目で確認)。直しは要らない
- 採らない: M2-1 を今の差分で直す(2巡目の後に check-pr.mjs の既存の2か所を組み替えると、突合を経ない変更が全 PR の規則の検査に入る)
