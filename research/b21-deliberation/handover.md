# 束 B21 — 引き継ぎ(2026-11-18 時点)

## 済み(main: 本体 496bad99 と消費の記録 f96943c2、template 392ff93。CI・gate-g5-push とも緑)

- 単位8(#443): IMPL-0500 を delivered。IMPL-0374・0377・0614 は実装済みだが undelivered(様式 04 の「完了の条件」の欄と、`next.mjs` の `flowSection` がそれを読む処理が要る)
- 単位9・10(#445・#443): IMPL-0680・0681・0682・0136・0212 を delivered。IMPL-0979・0283 は一部だけ降りているため undelivered
- 単位11・12(#325): IMPL-0571・0215・0213・0219 を delivered(check=machine)、IMPL-0210・0218 を delivered(check=manual)。IMPL-0216 は5指標のうち2つが未集計で undelivered
- P1〜P4: IMPL-0231・0877 を delivered(手引き)。IMPL-0175・0145・0217・0830 は実装済みだが undelivered(一部だけ降りている、または B22 の審議待ち)
- 結線: `gate-g5.yml` のジョブ contract の末尾に、新しい試験5本の run の行を足した
- 後回しの群の裁定: 案は `ruling-deferred-draft.md`、議長の裁定と所有者の回答は `ruling-deferred.md`

## 残り(B20 の push の知らせの後。直列。順は `ruling-deferred-draft.md` §7.2)

- 様式 04 の「完了の条件」の欄と読む処理(0374・0377・0614 を上げる。0954 と1回で)
- 単位4(0801・0878・0884)、単位5(0594・0291。B20 の 0919 の後)、単位7(0643・0980・0645・0497)。裁定は `research/b18-deliberation/ruling-a1.md` §3
- 単位15〜22(0834・1006、0664・0840・0597・0636・0640・0599、1011・0630(Q1 は N)、0761・0268・0954・0645 の残り・1003・1004、0771・0772・0651・0709・0900、0191、0225、0899)
- 一部だけ降りている項目の残り: 0216(2指標)、0979(PR を持たないゲートと会議体)、0283(G-1 で合意した値の側)、0175(表現・強調)、0145(保持期間の区別)
- 低の残り: `/gate` の SKILL.md の語の直し(`fix-wiring-1.md` の R-8)、定期の workflow の契機と呼び出しを見る静的な試験(候補)
- 新しい試験を足す単位は、`gate-g5.yml` の run の行を同じ単位に含める(含めないと `test:template-suite` が push の前に止める)

## 束 B22 へ切り出したもの(重の審議。本束では実装しない)

- Q2(IMPL-0830 の短縮の経路と下限)、Q3(IMPL-0214・0217 の強制)、Q4(IMPL-0763・0930・0931・0836)、Q5(1.10.2 と 3.5.3)。論点は `ruling-deferred-draft.md` §4・§5
- このため #325・#445・#446 は B21 では閉じられない

## Issue ごとの降りていないマークの残り(2026-11-18、`npm run impl:issues`)

#445: 11 / #446: 15 / #443: 7 / #325: 5 / #356: 3 / #326: 2 / #348: 2 / #450: 1 / #441: 1。閉じた Issue は無い

## 実物で確かめていない点

- 新しい3つの workflow(レビューの滞留・滞留期間の観測・事前レビュー)は、実物の GitHub で動かしていない。各項目の note に開示してある

## 作業ツリー

- `E:/Github/orca/workspace/process-compass/b21` の `node_modules` は `E:/Github/process-compass/node_modules` への junction。作業ツリーを消す前に `cmd //c rmdir node_modules` でリンクだけを外す
- template の未 push のコミットは無い。bundle は `E:/Github/process-compass/tmp/bundles/template-b21-17.bundle`・`b21-body-06.bundle`(どちらも main に入った)
