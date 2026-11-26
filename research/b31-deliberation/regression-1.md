---
title: 束 B33 の push の準備(回帰)
---

## 載せ直し
- 本体: origin/main(45b2d6e7)が 3 コミット先行していたため rebase した(20 コミット、衝突なし)。差は知識グラフの自動更新と token-usage の1行だけ。
- template: origin/main は祖先で、rebase は不要(先頭 d5d2d86)。

## 番号
- origin/main の最大: EV-0346、IMPL-1036、SRC-0768。本束の新しい EV は 0347・0348 で重ならない。IMPL-1036 は既存の予約番号。付け直しなし。
- impl:write で実装台帳の「平叙の否定で終わる行」が 530 から 531 になった(コミット 53f11125)。evidence:write・scope:write は差分なし。template:kb の差は生成元の commit の自己参照だけで、コミットしていない。

## 回帰の全量(WSL Ubuntu-24.04・node v26.13.1・LF の写し、npm ci 終了 0、直列)
本体は bundle の履歴を autocrlf=false で clone、template は git archive の1コミット。

| 条件 | 終了コード | ok 行 | FAIL | build |
|---|---|---|---|---|
| 通常 | 0 | 292 | 0 | 406 ページ |
| TZ=UTC | 0 | 292 | 0 | 同じ |

- `npm run impl:issues` に 445 は出ない(0 件)。
- FAIL なし。修正なし。写しは削除してよい。
