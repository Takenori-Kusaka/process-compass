# 束 B25 の単位 C・S・D の push の準備(担当の記録。push はしていない)

## 載せ直し
- template: origin/main(ac5a5ba。B26 の push)へ b25 の18コミットを rebase。衝突なし。作業ツリーの `scripts/vendor/tailoring-kb.json` の M(CRLF の差だけ)は、`git restore` を hook が止めるため、HEAD の内容を書き戻して `git add`(正規化で差が消える)ことで解いた。README の節は B26 が足しておらず、本束の 14〜16 節はそのまま(番号の付け直しなし)。
- template の先頭: 31e783a。bundle: `E:/Github/process-compass/tmp/bundles/template-b25-CSD-rebased.bundle`(origin/main..b25 の18コミット)。
- 本体: origin/main(e3aaa9d7)へ rebase。衝突は `implementation-ledger.md`(6回)と `evidence-ledger.md`(1回)のみ。各コミットで origin 側を採り、最後に `npm run impl:write`・`evidence:write`・`scope:write` で再生成した(scope は変更なし)。graphify-out の衝突なし。`research/token-usage-2026-11.md` の衝突なし。

## 番号
- origin/main の最大は IMPL-1031・EV-0344。仮番号 IMPL-1032 は空いており、そのまま確定(変更なし。対応: IMPL-1032 → IMPL-1032)。EV・SRC は本束の後半で新しく足していない。

## コミット(本体)
- 0ef4b3b8 template の参照を進める(b25 の先頭 31e783a)。`npm run template:kb` は `tailoring-kb.json` の生成元コミット欄だけを変える(規則データの差なし)ので、template へ反映しない(前回と同じ型)。
- 台帳の再生成のコミット。
- 2d7673e6 `fix(regress)`: 下の「回帰で出た本束が原因の FAIL」。
- 本体の先頭: 記録のコミット(本ファイルを含む)。origin/main からの差は最終報告のとおり。

## 本束が原因の FAIL(npm run check の test:regress)
- 最初の実行(通常・UTC とも)で `test:regress` が落ちた。unit(4)・v3(4)・v3b(2)・name-confirmation(10)・new(15)・replay(1)・scenarios(3)・tz(場面の外で中断)。原因は、契約検査が登録の根拠の4点目(`enforcement`: 強制の手段の所在。IMPL-0834)の欠けを止めるようになったのに、`scripts/regress/suite/` の見本の根拠(`BASIS`・`BASIS2`・unit の直書き4か所)が4点目を持たなかったこと。標準・template 側の意味は変えていない。
- 直し: 見本の根拠へ `enforcement: { selfCorrection: 'e1', aiReviewRound: '該当なし(往復を使わない)' }` を足した(`lib.mjs`・`name-confirmation.mjs`・`unit.mjs` の6行)。何を失敗にするかは変えない(「根拠の一部が空」の試験は従来どおり1件)。template の試験は影響なし(template 側は修正不要)。直したあと `test:regress` はすべて通った。
- 注意: 前の束(P・R)の push の準備は regress を落とさなかった。4点目を必須にしたのは本束の C(契約検査)で、C の実装の担当が本体の regress を流していなかった。

## npm run check(WSL・node 26.13.1・LF の写し。bundle から clone、template は b25 の clone)
- 直しの前: 通常・UTC とも `test:regress` で失敗(上記)。
- 直しの後: 通常 exit 0、TZ=UTC exit 0(build 403 ページ)。
- Windows(CRLF)の `npm run check` は流していない(前回の記録のとおり、CRLF 由来の偽の FAIL を判定に使わない)。
- `npm run -s impl:issues -- --issue 446`: 「#446 を issue= に持つマークは 0 件」。閉じてよい。

## 回帰の全量(template の試験。WSL・LF。GitHub への操作なし)
- 76 本を列挙。通常・UTC とも 74 本 exit 0。残り2つは試験ではない(`scripts/check-decisions.mjs` は MISSING=リストの作り方、`scripts/gate/test-results.mjs` は引数なしの CLI の使い方表示。前回と同じ)。FAIL 0。
- 通し実行が GitHub の一時リポジトリを要する試験は、流していない。
- 本束が原因の template 試験の FAIL: なし。

## push の命令の案(フラグなし。template を先)
- `git -C template push origin b25:main`
- `git push origin HEAD:main`

## 残った点
- template の参照(31e783a)は b25 の先頭。template を先に push しないと、本体の `test:fields` などが落ちる。続けて push する。
- 「直した regress の見本」は本体側の変更で、template の bundle には含まれない。
- Windows 上の全量、push 後の CI、pit-crew を含む検査は確かめていない。作った一時ディレクトリ(WSL の `~/b25csd-regress`)は消した。bundle は `tmp/bundles/` に残る(`main-csd-full.bundle`・`tpl-csd-full.bundle`・`template-b25-CSD-rebased.bundle`)。ただし main-csd-full は regress の直しの前の版。
