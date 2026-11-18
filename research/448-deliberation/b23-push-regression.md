# 束 B23 push の前の回帰の全量(担当の記録。ファイルは直していない・commit/push していない)

## 条件
- WSL・node v26.13.1。写しは `~/b23-regress/`(ext4、LF、autocrlf=false)。Windows の worktree は git の worktree で WSL から読めないため、git bundle から clone した。本体 0d0873942e33、template 795cbb7f89ef(別 clone を template/ に置いた)。流す前の git status は空。pit-crew 未初期化。
- node_modules は Windows のものを複写。linux 用の rolldown の native binding が無く build が落ちたため、写しにだけ `npm i --no-save @rolldown/binding-linux-x64-gnu@1.2.15` を足した(環境の補い。リポジトリは触っていない)。
- 通常(TZ 未設定)→ TZ=UTC の順に流した(並行なし)。`npm run check` は最初の失敗で止まるため、check の連鎖 31 本を 1 本ずつ失敗しても続けて流した。

## 結果(通常・TZ=UTC で同一)
| 検査 | 結果 |
|---|---|
| template の試験(scripts 配下の test-*.mjs と check-decisions.mjs)74 本 | 73 通過、NG 0。残り 1 本 `scripts/gate/test-results.mjs` は引数が要る CLI(exit 2、使い方の表示)で試験ではない。判定に使わない |
| `npm run check` の連鎖 31 本 | 28 通過、**3 落ちた**: lint:text、test:regress、build |
| test:template-suite | 通過(新規の結線に漏れなし) |

## 落ちた 3 本(いずれも真。偽ではない)
### 1. lint:text(textlint)
`src/content/docs/adr/0221-b20-safety-record-checks-for-shape-only-and-component-table.md` 24 行目が 1 文 290 文字で上限 150 を超える(ja-technical-writing/sentence-length)。決定的で環境に依らない。

### 2. build(astro)
starlight-links-validator が 1 件の無効リンクを報告。`adr/0217-b20-exception-use-display-and-record-checks.md` 12 行目の `/process-compass/adr/0153-assign-0996-gate-exception-targets/`。実在する ADR-0153 のファイル名は `0153-safety-judgment-and-ship-prohibitions-outside-exception-approval.md`(スラッグ違い)。決定的。

### 3. test:regress(回帰スイート。落ちた場面 acquire 2・cl-judgment 5・matrix-sweep 24・new 15・replay 3・scenarios 11・v3 7・v3b 1・verify-n 13、stages は宣言と実行の不一致)
- 原因の見立て: template の cl-judgment.mjs が ADR-0221 で「構成要素ごとの判定」の表を全 CL に求めるようになった。回帰スイートの fixture はこの表を埋めず、様式の雛形のまま(`<構成要素。単一なら「システム全体」>`、区分 `<CL0 / CL1 / CL2 / CL3>`)なので、「区分を CL0〜CL3 のどれか1つとして読めません」の error が出て D-0 の検査が落ちる。ログ中の同 error は 40 件超。
- stages の「宣言した場面が実行されなかった 136 件」は、D-0 の検査が前段で落ちて後続の場面に進まないことの二次的な結果と見る(未確認。fixture を直した後に再実行して確かめる必要がある)。
- 偽の判定の根拠: 通常と TZ=UTC で落ちた場面の数が全て同じ。ログの日付は固定(2026-10-01・10-02)で、時計や TZ に依らない。CRLF は LF の写しなので無関係。tpl2 trial.mjs・r3 scen.mjs の時計依存の失敗は出ていない(置き換えは不要だった)。よって時計・CRLF 由来の偽ではなく、真の欠陥。直し先は fixture(本体 scripts/regress/ 側)か、ADR-0221 の要求を満たす様式の埋め。

## 判定
**push してはならない**(check が 3 本落ちる)。直しは別の担当。

## 確かめていないこと
Windows の node での check、push 後の CI、pit-crew を含む検査、直した後の再実行。

## 後始末
WSL の `~/b23-regress`・`~/b23-out`・`/tmp/pit-regress-*` を削除した。Windows の作業ツリーと node_modules の junction には触れていない。
