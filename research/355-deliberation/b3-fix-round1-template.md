# #355 束3 独立の突合 1巡目 template 側の直しの記録

- 日付 2026-11-15。template ブランチ `b6-355-b3`。コミット: 02。bundle: `E:/Github/process-compass/tmp/bundles/template-b6-355-b3-02.bundle`(push していない)
- 実行は WSL の node 26.13.1。本体側(src/)は触っていない

## 所見ごとの直し

- R1-01: `spec-recheck.mjs` の `specRecheck` の式を裁定の1〜5へ。通過に `effective` の印を付けて受け取る。効いている一致 → 一致 / 一致が無く不一致が確定 → 不一致(打ち消された通過だけが根拠なら `cancelled`)/ 打ち消された通過が先端と一致 → 未確認(`CANCELLED_REASON`)/ 通過の記録が無い → 未確認(`NO_PASS_REASON`、実態の文)。`judgeOk=false`・headMatch 偽は集約が渡さない。欠落の文に打ち消された記録の旨を足した
- R1-02: 集約の本体を通しで流す場面を `test-spec-recheck.mjs`(IMPL-0241)と `test-aggregate-drift.mjs`(IMPL-0023)へ足した。場面 A・B・C・C2・D・D2・M・E・H・Q1・Q1b・Q2・Q3・Q2b・Q2c・Q2d・Q4・P2・N。`IMPL-0241:ng/:ok`・`IMPL-0023:ng/:ok` の目印は各ファイルの場面に付けた。常に通っていた「打ち消し」の純関数の試験は、`effective:false` を渡す入力へ直した
- R1-03: PR に `specFilesTouched`(`SPEC_FILE`)を足し、再確認の対象をそれに限った。`specsTouched` は変えていない(場面 Q1 適合 / Q1b 違反)
- R1-04: 目印を上のとおり付けた。`spec-recheck.mjs` の登録は標準側の担当(template 側は何もしていない)
- R1-05: 場面 H(スコープ外の節だけ無い仕様で、背景だけ変更 → 未確認)を足した
- R1-06: 品質レポート(`renderAssurance`)に「確定した版の再確認」の件数と、未確認の機能・判定記録の所在・理由の一覧を出す。外部向けは件数だけ(場面 E で固定)。`.claude/skills/gate/gates/G-7.md` に、未確認の機能の突合とずれの起票の確認の2行を足した
- R1-08: `g4Passes(spec)` を1つ置き、`g4Approved` と再確認が使う。`g4ByReview` は削除

## 3点の破壊(複製 scratchpad/tpl-r1 で `aggregate-evidence.mjs` を壊す)

- (1) `gaps.push(specRecheckGapText(it))` の行を削除 → A・D・Q1b・Q3・P2 が落ちる
- (2) 本体の `drift` を `[]` に固定 → N の3件が落ちる
- (3a) 写しの通過の条件から `result`・`headMatch`・`judgeOk` を外す → Q2b・Q2c・Q2d が落ちる(足す前は Q2b だけだった。headMatch と結果は足した Q2c・Q2d で捕まえた)
- (3b) 打ち消し(`effective`)を常に真 → 静的確認・D・D2・M が落ちる
- 破壊の前は全部通る。落ちない破壊は残っていない

## 流した試験(node 26)

test-spec-recheck 95、test-aggregate-drift 25、test-check-pr 214 場面、test-aggregate-records 135、test-direct-commit-rules 11、test-records 93、test-control-approval 48。すべて NG 0。`node --check` は変えた .mjs すべて通過

## 指示と違えた点

- 打ち消された通過だけが不一致の根拠のとき、効いている通過に「版を読めないもの」が在れば不一致にせず未確認にした(読めない版が先端と一致するかもしれないため。裁定の2の「版を読めた通過のすべて」を、安全側へ狭めた)
- 通しの試験を新しいファイルにせず、`test-spec-recheck.mjs`・`test-aggregate-drift.mjs` へ足した(`test=` が1ファイルしか名指せず、標準側の登録を変えずに済ませるため)。このため2ファイルの実行が長い(WSL の /mnt で約10分)
- 場面 A の「終了コード」は、B が無関係の欠落で既に 0 でないため、B より `::error::` が増え終了コードが 0 でないことで確かめた

## 確かめていないこと

- GitHub の実環境(squash・rebase の後の版の取得)。test-adoption(基線から落ちる)・test-g5-aggregate・回帰の全量
- 写しの経路のトレーラ Spec だけで対応づいた PR(Q5)
