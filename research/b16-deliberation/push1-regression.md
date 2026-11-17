# 束 B16 push 1 の前の回帰の全量(担当の記録。push はしていない)

対象: 本体 14c3b914、template 6fe1f20(b16 の祖先)。WSL・node 26.13.1。LF の写し(`git -c core.autocrlf=false archive`)を /tmp/pcb16(本体)・/tmp/pctpl(template)に展開し、`npm ci` 後に順に流した。template の写しは git init して 1 コミットにした(test-template-suite が git status を使うため)。

| 条件 | 終了コード | 結果 |
|---|---|---|
| 回帰スイート `--kb keep --template <写し>` 通常 | 0 | すべて通った(落ちた場面 0) |
| 同 `TZ=UTC` | 0 | すべて通った |
| `npm run check` 通常(template の試験一式・regress[rebuild]・build を含む) | 0 | template の試験 63 本通過、regress 29 本通過、build 389 ページ |
| `TZ=UTC npm run check` | 0 | 同上 |

- 落ちたものは 0。本束の変更との関係を見分ける対象は無い
- 時計依存・CRLF の偽の FAIL は出なかった(WSL の LF)
- 1 回目の `npm run check` は、template の写しが git の作業ツリーでなかったため test:template-suite の前提で止まった(束の欠陥ではない)。template を git init して流し直し、上の表の結果を得た
- 確かめていないこと: push 後の CI、Windows での regress・build、作業ツリーで編集中の U4
- 後始末: /tmp/pcb16・/tmp/pctpl・/tmp/pcb16-out・/tmp/pcb16-*.sh を消す
