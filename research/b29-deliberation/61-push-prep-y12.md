---
title: B29 単位 Y1・Y2 の push の準備(回帰)
---

## 載せ直し
- 本体は origin/main(518a1fb9、知識グラフの自動更新)の上へ rebase 済み。衝突なし(6コミット)。
- template は fetch の結果、origin/main が 45a7162 のまま。b29(785998d)はその上の4コミットで、rebase は不要。本体の gitlink は 785998d で揃っている。bundle -rebased は作っていない(template-b29-y12-fix-01・02 が最新の退避。確認用に template-b29-y12-full.bundle も置いた)。

## 番号の確認
- origin/main の最大: EV-0345、IMPL-1035。本束の6コミットが差分に足した行に出る番号は EV-0087、IMPL-0284〜0287・0291・0517・0518・0645・0834・1006 で、いずれも既存の番号の状態変更・参照であり、新しい番号の追加は無い。重なりなし。
- impl:write・evidence:write・scope:write は差分なし。template:kb の差は生成元の版の自己参照(commit の1行)だけ。コミットせず元へ戻した(先例 60-push-prep-x.md)。

## npm run check(Windows)
- 終了 1。落ちは既知の偽の FAIL の2本だけ: test-g5-aggregate(CRLF)、test-discouraged-evidence(Windows の環境)。他は通過(ok 281 行)。
- 判定には使わない。

## 回帰の全量(WSL Ubuntu-24.04・node v26.13.1・LF の写し、npm ci 終了 0、直列)
| 条件 | 終了コード | ok 行 | FAIL |
|---|---|---|---|
| 通常 | 0 | 292 | 0 |
| TZ=UTC | 0 | 292 | 0 |

- ok 行は行頭の空白に続く `ok ` を数えたもの。60-push-prep-x.md の 449 とは数え方が異なり、単純比較しない。
- FAIL は無く、切り分けは不要。template は直していない。写しは削除した。

## 最終
- template 先頭: 785998d4e6aa5c6bc4e3b23ea67788368799bb1e(origin/main 45a7162 の上に4コミット)
- 本体の先頭: 本記録のコミット(報告に記す)
- bundle: template-b29-y12-fix-02.bundle が最新(変更なし)
