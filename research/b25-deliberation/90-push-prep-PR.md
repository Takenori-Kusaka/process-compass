# 束 B25 の単位 P・R の push の準備(担当の記録。push はしていない)

## 載せ直し
- template: origin/main(ad21a42。B23 の push)へ b25 の5コミットを rebase。衝突なし。`.claude/skills/gate/SKILL.md` は自動で合流し、判定の原則は 1〜10(B23 が 9、本束の追加が 10)。本束の文は最初から項10を指しており(IMPL-1031 の note)、番号の付け直しは不要。README・sync-escalation.md に項番号の参照なし。
- template の先頭: 6711635。bundle: `E:/Github/process-compass/tmp/bundles/template-b25-PR-rebased.bundle`(origin/main..b25 の5コミット)。
- 本体: origin/main(77468b7c)へ rebase。衝突は `implementation-ledger.md` のみ(各コミットで origin 側を採った)。その後 `npm run impl:write` で再生成(evidence・scope は変更なし)。graphify-out の衝突なし。
- 本体の先頭: 4c20cb54(参照を進めるコミット+台帳の再生成)。origin/main から 9 コミット。bundle(本体): `tmp/bundles/b25-main-PR-regress.bundle`。
- `npm run template:kb` は template の `tailoring-kb.json` の生成元コミット欄だけを変える(規則データの差なし)。反映しない(B23 の chore が別途行う型)。

## 番号
- origin/main の最大は IMPL-1030・EV-0341。仮番号 IMPL-1031・EV-0342 は衝突せず、そのまま確定。対応: IMPL-1031 → IMPL-1031、EV-0342 → EV-0342(変更なし)。

## npm run check
- Windows(node、CRLF): 1件 FAIL `scripts/gate/test-discouraged-evidence.mjs`(記録の欠落を出す場面の出力)。同じ試験は WSL(LF)の2通りとも通過しており、Windows の環境差(CRLF 由来の偽の FAIL)として判定に使わない。
- WSL・node 26.13.1・LF の写し(bundle から clone。template は `git archive b25`): 通常 exit 0、TZ=UTC exit 0(build 403 ページ)。

## 回帰の全量(WSL。GitHub への操作なし)
- template の試験 76 本: 通常・UTC とも 74 本 exit 0。残り2つは試験ではない(`scripts/check-decisions.mjs` は MISSING=リストの作り方、`scripts/gate/test-results.mjs` は引数なしの CLI の使い方表示。B22 の記録と同じ型)。FAIL 0。
- 通し実行が GitHub の一時リポジトリを要する試験は、流していない(列挙にも含まれず、GitHub 上の操作は行っていない)。
- UTC の run は最初の実行が時間制限で check の途中で止まったため、UTC の check のみ流し直した(template の試験は最初の run で完了)。
- 本束が原因の FAIL: なし。

## push の命令の案(フラグなし。template を先)
- `git -C template push origin b25:main`
- `git push origin HEAD:main`

## 残った点
- template の作業ツリーで `scripts/vendor/tailoring-kb.json` が M(CRLF の差のみ。コミットしない)。
- push 後の CI、Windows 上の全量、pit-crew を含む検査は確かめていない。一時ディレクトリは消した。
