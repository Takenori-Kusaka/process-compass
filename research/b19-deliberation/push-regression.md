# 束 B19 の push の前の回帰の全量(担当の記録。push はしていない)

対象: 本体 03eb164a(作業ツリーは clean)、template ef60cda。WSL(Ubuntu-24.04)・node 26.13.1。LF の写しを `git -c core.autocrlf=false archive` で作り(本体は /tmp/pc19b、template は /tmp/pc19b/template に展開して git init し 1 コミット)、`npm ci` 後に順に流した(並行なし)。

| 条件 | 終了コード | 結果 |
|---|---|---|
| 回帰スイート `node scripts/regress/run.mjs --kb keep --template <写し>` 通常 | 0 | すべて通った |
| 同 `TZ=UTC` | 0 | すべて通った |
| `npm run check` 通常 | 0 | regress 29 本通過、build 392 ページ |
| `TZ=UTC npm run check` | 0 | 同上 |

- 落ちたものは 0。本束の差分に起因する失敗は無い。CRLF・時計依存の偽の FAIL も出なかった
- 1 回目の `npm run check` は、本体の写しが `git archive` のため .git を持たず、test:criteria(check-gate-criteria の「生成元の版が標準の履歴の上にあるか」)が「未確認は失敗」で止まった。束の欠陥ではなく写しの作り方の不足である。Windows 側で `git clone -n` した .git を写しへ重ね(`git reset -q`、core.autocrlf=false)、check を 2 通りとも流し直して上の結果を得た。次の担当は、本体の写しに履歴の入った .git を載せること(B16 までの記録には書かれていない前提)
- 確かめていないこと: push 後の CI、Windows での regress・build
- 後始末: WSL の /tmp/pc19b・/tmp/pc19-*.log・/tmp/pit-regress-*、Windows 側の一時ディレクトリ(pc19FLPd)を消す
