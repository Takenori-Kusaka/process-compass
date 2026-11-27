---
title: 束 D1(#455・#454)の push の準備
---

## 載せ直し
- 本体は origin/main(4936a404、知識グラフの自動更新)の上に既にある(祖先)。template は origin/main の上に7コミット(祖先)。rebase 不要・衝突なし。本体の gitlink は template の HEAD 8e3bad6 と一致。

## 番号
- origin/main の最大: EV-0350、IMPL-1036、SRC-0796。本束は IMPL-1037〜1044・EV-0351〜0356。重なりなし、付け直し不要。ADR-0261・0262 も origin/main に同番号なし。
- evidence:write・impl:write・scope:write は差分なし。template:kb の差は生成元の版の自己参照(commit の1行)だけで、戻した。impl:issues は「issue= を持つ実装マーク 13件(番号 2件)、計画の Issue はすべて open」。

## 回帰の全量(WSL・node v26.13.1・LF の写し、npm ci 終了 0、直列)
写し: 本体は bundle の clone、template は git archive の1コミット(LF)。

| 条件 | 終了コード | 内容 |
|---|---|---|
| 通常 | 1 | lint:tone で停止 |
| TZ=UTC | 1 | 同じ |
| 通常(lint:tone を写しだけで除く) | 0 | 残りの検査すべて通過(30 件 exit 0) |
| TZ=UTC(同上) | 0 | 同じ |

## 本束の欠陥(直していない)
`npm run lint:tone` が「未完成の痕跡 "TODO"」で落ちる。3か所:
- src/content/docs/adr/0262-...md の15行目・23行目(IMPL-0788 の「妥協・TODO・仮実装」の引用ほか)
- src/content/docs/community/implementation-ledger.md の1204行目(IMPL-1042 の注記が出どころ。台帳は生成物なので、元の注記の側を直す)
直し方の案: 引用の行末に `<!-- tone-ok: 理由 -->` を付ける(台帳側は元の IMPL マークの note を言い換えるか、除外の置き場を確かめる)。lint:tone 以外の検査は通る。
