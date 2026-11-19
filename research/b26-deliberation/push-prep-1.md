# B26 push の準備(1回目。担当の記録)

## 載せ直し
- 基点: origin/main 本体 a880f2d0、template 6711635(B25 が進めた版)。退避: 両方に b26-pre-rebase。
- template: ad21a42..b51bf6c の10コミットを rebase。衝突なし。bundle `template-b26-rebased-01`(93baf21)。
- 本体: 17コミットを rebase。衝突は台帳(implementation-ledger・evidence-ledger)と template の参照だけ。台帳は origin/main 側を取り `impl:write`・`evidence:write` で再生成して解いた。template の参照は載せ直し後の template の先頭にした。手で混ぜた箇所は無い。

## 番号(詳細は fix-renumber.md)
- EV: B26 の EV-0343(様式の外観の慣れ)→ EV-0344、EV-0342(保持期間の観測)→ EV-0343。main の EV-0342 は B25 の tailoring-guide.md で、そちらは変えない。
- SRC-0768: main の最大は 0767 で衝突なし。IMPL: B26 は新設していない。変更なし。
- `evidence:write`・`impl:write`・`lint:sources`: 通過。

## コミット・bundle
- template: ac5a5ba(知識ベースの複製の生成元を更新)。bundle `template-b26-rebased-02`。
- 本体: b678fb1a(EV の付け直し・台帳・template の参照)。bundle `main-b26-rebased-01`。
- template:kb の再実行: 生成元の版が HEAD を指すため再実行のたびに差が出る(自己参照)。コミット済みの版 48e7ffd9 は HEAD の祖先で、`test:criteria` は通る。これ以外の差は無い。

## 回帰の全量(WSL・node v26.13.1・bundle からの clone・autocrlf=false・pit-crew 未初期化)
| 条件 | 結果 |
|---|---|
| 通常 | `npm run check` 終了コード 0(291 本の試験が ok、落ち 0。test:template-suite・test:regress・build を含む) |
| TZ=UTC | `npm run check` 終了コード 0(同上) |
- 順に直列で流した。落ちは無く、直した試験も無い。時計・CRLF 由来の偽の落ちも出ていない。

## impl:issues の要点
- 終了 0。issue= を持つ実装マーク 43件(番号 10件)、すべて open の Issue。
- 降りていないマークの数(Issue ごと): #446: 15、#361: 10、#445: 8、#356: 3、#348: 2、#452・#450・#443・#441・#326・#123: 各1。

## 状態
作業ツリーは本体・template とも空。push 可(template を先に、続けて本体)。WSL の一時の写しは削除済み。
