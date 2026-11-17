# 束 B14 の #447 の push の準備(担当の記録。push はしていない)

- HEAD: bb6d1b4a。origin/main: d0bbb613(HEAD の祖先)。本束は origin/main の上に 14 コミット
- 番号: 本束が新設した EV-0322・0322、IMPL-1022・1023、ADR-0179 は origin/main に無い(origin/main の最大は EV-0319・IMPL-1019・ADR-0175)。重ならない
- template の参照は e9f5590f のまま(origin/main と同じ)。template は触っていない

## 検査と回帰

| 条件 | 結果 |
|---|---|
| Windows `npm run check` | 終了コード 1。`test:template`(複製の乖離)で止まった。下の「template の追随」を参照。CRLF による偽の FAIL の試験には到達していない |
| WSL・node v26.13.1・LF の写し・通常 | 全段通過(regress は「すべて通った」、build 390 ページ)。終了コードの行は取り損ねたが、`&&` 連鎖の最後の build まで完走している |
| WSL・同・`TZ=UTC` | 終了コード 0、390 ページ |

- 写し: 本体と template(e9f5590f)を `git archive` から展開。template には後述の知識ベースの差分を当てた。通常・UTC は直列に流した(実行前に、別の束の WSL 実行が終わるのを待った)
- 写し側の偽の FAIL を2件直した(本物の欠陥ではない): 実行権限が全ファイルへ付く(cp 経由)ため、test-adoption の併合が add/add で衝突した。権限を外して直り、gh の代役の実行権限だけを戻した

## template の追随(要対応)

- 本束の #447(5.4.7 の新設)で、知識ベースに規則「AI を用いない実施の記録を書く」(L2 以上を適用する範囲がある場合)が増えた。`npm run template:kb` で複製を作ると、template の `scripts/vendor/tailoring-kb.json` に 7 行追加・1 行削除の差分が出る(commit の識別だけでなく内容が変わる)
- 作業ツリーの template は触らず戻した。差分は担当の一時ファイルにしか残していない
- push の前に、template 側へブランチと PR で追随を入れ、参照を進めるまで、origin/main 上の `test:template` は落ちる。この順序の決定は所有者または指揮のセッションに委ねる
- LF の写しでは同じ差分を template へ当てた状態で、check が通ることを確かめた
