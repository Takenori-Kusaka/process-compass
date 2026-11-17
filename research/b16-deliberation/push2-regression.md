# 束 B16 push 2 の前の回帰の全量(担当の記録。push はしていない)

対象: 本体 35ff6407、template 9fb3dcda。手順は push1-regression.md と同じ(WSL・node 26.13.1、LF の写しを `git archive` で作成、template の写しは git init して 1 コミット、`npm ci` 後に順に流した)。本体は worktree の gitdir が Windows パスのため、Windows 側で tar を作り WSL で展開した。

| 条件 | 終了コード | 結果 |
|---|---|---|
| 回帰スイート `--kb keep --template <写し>` 通常 | 0 | すべて通った |
| 同 `TZ=UTC` | 0 | すべて通った |
| `npm run check` 通常 | 0 | build 390 ページ |
| `TZ=UTC npm run check` | 0 | build 390 ページ |

- 落ちたものは 0。本束の変更との関係を見分ける対象は無い
- CRLF・時計依存の偽の FAIL は出なかった
- 確かめていないこと: push 後の CI、Windows での regress・build
- 後始末: WSL の /tmp/pc2b・/tmp/pc2t・/tmp/pc2-*.log、Windows 側の一時ファイル(b.tar・t.tar・p2tmp.sh・p2out.log)を消した
