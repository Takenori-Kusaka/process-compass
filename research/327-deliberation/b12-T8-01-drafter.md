# #327 T8: 試行前チェックリストの「差し引き」の項目(束 B12・起案委員)

## 1. 確かめたこと

- 複製の検査: `scripts/check-template-drift.mjs` の AUX_TEMPLATES(116 行)に `trial-checklist.md` が `items: true` で載る。標準 `phase4-process-design/tailoring-guide.md` の `## 試行前チェックリスト(T-1 開始条件)` の見出しから最初のフェンスの閉じまでを読み、`- [ ]` の行の**本文の集合**を作る。template の同名ファイルの集合と**両方向で全文一致**を求める(片方にだけある項目を失敗にする)。見出しや説明文は比べない。括弧の中身も比べる
- 受け側の検査: `template/scripts/gate/trial-checklist.mjs` の `itemKey` は括弧の中身だけを除いた鍵で写しの項目を照合する。写しの行が様式の鍵で始まらなければ「項目が写しにありません」と出す。**旧い文のまま写しを持つ採用者は、改め後に1件の問題が出る**(新しい文への書き換えを促す。意図した動き)
- 「上回らない」を含むこの項目は3か所にある: `tailoring-guide.md` 1314 行、`template/templates/trial-checklist.md` 35 行、**`src/content/docs/phase5-implementation/enablement.md` 119 行**(検査は結ばれていない第3の写し)。IMPL-1002 の note は前の2つしか挙げていない。chair-on-crosscheck-2.md の記録では、標準側の2か所(tailoring-guide と enablement)を同時に旧い文へ戻した。**3か所を同時に改める**
- ほかの「上回らない」(assurance-case.md・review-guide.md)は別の意味で、対象外
- `template/scripts` と `template/.claude` に旧い文の写しは無い(`artifacts/trial-checklist.md` は5群の名だけ)。`test-trial-checklist.mjs` にも旧い文は無い

## 2. 差し替えの文

旧(3か所とも同じ)

    - [ ] 導入後の判定件数が、置換前を上回らないことを確認した

新(3か所とも同じ。**括弧を使わない**。ADR-0013 決定2 の「差し引きが負」と、IMPL-1002 の note が示す文)

    - [ ] 廃止・置換する既存の承認・様式と、新設する判定の差し引きが負であることを確認した

直前の行(「廃止または置換する既存の承認・様式が特定されている」)は変えない。2行は「特定、次に差し引きが負」の順で読め、重複しない。

差し替えの対象
- `src/content/docs/phase4-process-design/tailoring-guide.md` 1314 行
- `src/content/docs/phase5-implementation/enablement.md` 119 行
- `template/templates/trial-checklist.md` 35 行(pit-in-template。コミットのたびに bundle へ退避する。template は直列)

追加(任意): `template/README.md` の更新の記録(586 行付近の書式)に1文。「『差し引き』の項目を、ゼロを許す文から差し引きが負の文へ改めました(標準 ADR-0013 決定2・ADR-0154 決定6)。旧い文の写しを持つ案件は、`trial-checklist.mjs` が項目の欠けを1件出します。新しい文へ書き換えてから確認します」

## 3. IMPL-1002 の state

- `state=delivered`、`check=presence`(note に「単位: 行」)、`issue=`・`plan=`・`review=` を外す。`target=trial-checklist` は登録済み(`templates/trial-checklist.md`)でそのまま
- 検査: 複製の検査(`test:template` の `check-template-drift`)が、標準と template の項目の一致を両方向で確かめる。意味(差し引きが負であること)は機械が確かめない。note に「確かめる者: 試行の責任者(項目に印を付ける時点)」と書く
- `machine` にしない理由: 機械が見るのは文の一致と存在だけで、差し引きの数の比較ではない(コアポリシーの統制の閉じ方: 機械は決定可能な条件だけ)。`test-trial-checklist.mjs` に対(旧い文の写しは「項目が写しにありません」が出る / 新しい文の写しは出ない)を足せば `check=machine test=template/scripts/gate/test-trial-checklist.mjs` にもできるが、起案の推奨は `presence`
- note の書き換え: 「ゼロを許す」の開示を外し、「項目は差し引きが負を求める。標準と様式は複製の検査が両方向で一致を確かめる」へ
- ADR-0154 の影響の節(74 行)は本文なので書き換えない。T8 の実装は #327 のコメントと `research/327-deliberation/implementation.md` の一覧に残す

## 4. 審議の段の判断

**編集の指摘に準じて扱ってよい**(会議体を開かない)。
- 意味の変更は既に決まっている。ADR-0013 決定2(差し引きが負)と ADR-0154 決定6(意味を負へ変える)が決めており、T8 は決定の**実装**で、新しい条項ではない。IMPL-1002 に文まで書いてある
- 採用者に新しい義務は生じない。標準の TG-1 基準4 が既に「差し引きが負」を求めており、様式が旧い文を残すのは食い違いである
- 採用者への影響は、旧い写しに1件の問題が出ることだけ。README に書く
- 手順: 議長が3か所を直す、次に独立の突合を差分に対して1回(別の文脈。3か所の一致、`test:template`、`lint:impl`、`impl:write` の台帳)
- 留意: 厳密には「意味を変えないもの」という編集の定義から外れる(ゼロを許す文から許さない文へ)。議長は記録に「決定済みの意味への揃え」と書く。意味そのものの議論が要ると議長が判断するなら軽で2委員を開く(その論点は「ゼロを許す余地を例外承認で受けるか」だけで、ADR-0013 決定2 が「ゼロは足りない」と決めている)

## 5. 検査の見通し

`npm run test:template`(複製の検査)、`npm run lint:impl`、`npm run impl:write`、`npm run lint:refs`、textlint(tailoring-guide・enablement)。全量は push の前に1回(WSL・node 26)。
