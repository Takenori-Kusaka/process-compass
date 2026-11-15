# #355 束4 push の準備(担当の記録。push はしていない)

## 載せ直し

- `git fetch` の後 `git rebase origin/main`。origin/main の 1 コミット(知識グラフの自動更新、束3 の記録を含む)の上へ 11 コミットを載せた。衝突なし
- 本体の先頭: 464a580(`chore(#355): template の参照を進める(束4)`)。その前は ea40dfd(束4 の独立の突合 2巡目の直し)
- template の先頭: 26999ff(ブランチ b6-355b4。origin/main の 1e12ad2 から 3 コミット先。未 push)。`git ls-tree HEAD template` と一致
- `src/data/tailoring/`・`src/lib/tailoring-engine.mjs` は origin/main と差なし。`template:kb` は不要

## 番号の確認(origin/main の最大)

- IMPL-0524、EV-0269、ADR-0136。こちらの新設は IMPL-0525、EV-0270〜0272、ADR-0137。重なりなし。付け直しなし

## 回帰(WSL・node 26.13.1・LF の写し。`npm ci` 後)

| 条件 | 終了コード | build |
|---|---|---|
| 本体 `npm run check` 通常 | 0 | 366 ページ |
| 本体 `TZ=UTC npm run check` | 0 | 366 ページ |

- template の全量は check 内の test:template-suite と test:template に含まれる。別に流していない
- test-discouraged-evidence・test-g5-aggregate・test-adoption は通常で ok。時計に依る偽の FAIL は出なかった。基線の照合は要らなかった

## 失敗の切り分け

- 1回目の写しは check が rc=1。原因は写しの作り方で、template/ を `git archive` の展開(.git なし)にしたため test-template-suite の `git -C template status` が失敗した。template を LF の git リポジトリ(26999ff の archive を git init しコミット、core.autocrlf=false)にして解消。コード・本文は変えていない
- 写しの CRLF の混入は、PNG のバイナリ 8 件(偶然の 0d)だけ。テキストは 0 件

## 確かめていないこと

- Windows の node での全量
- 写しの template は 26999ff の内容を新規リポジトリにしたもので、実 clone ではない(履歴・remote は無い)
- push 後の CI(ホスティング側)の結果

## 議長が打つ push

template を先に、本体を後に。push の前に両方で `git fetch` し、origin/main が進んでいないことを確かめる。WSL の写しは消した。
