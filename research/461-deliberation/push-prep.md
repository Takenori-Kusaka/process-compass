# push の準備(束 P1)

- rebase: 不要。origin/main は HEAD(e0d8431a)の祖先で、衝突なし
- 番号: 本束の SRC の新番(0900〜0918、0930〜0941、0960〜0981)は、origin/main の台帳に1件もない。重ならない。付け直しなし
- 回帰(WSL・node 26.13.1・LF の写し・template は cfd4ff4): `npm run check` を通常と `TZ=UTC` で各1回。両方とも exit 0(ok の行 452、FAIL 0)
- 写しの作り方: `git archive` の写しに、本体の履歴と template の履歴を fetch して `git reset`(作業ツリーは写しのまま)。履歴の無い写しでは、判定基準の複製の検査(生成元の版が標準の履歴の上にあるか)が「未確認」で落ちる。これは本束によらない写しの不備で、履歴を足して解消した(1回目の通常の check は、これで exit 1 だった)
- `npm run impl:issues`: issue= を持つ実装マーク 13件(番号 2件)。計画の Issue はすべて open。issue=461 のマークは無い
- 確かめていないこと: push 後の CI。Windows での regress・build
- WSL の写し(`~/p1w`)は後始末する

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
