# #355 束4 独立の突合 1巡目の所見の直し(2026-11-15)

template コミット e934457(ブランチ b6-355-b4)。bundle: `E:/Github/process-compass/tmp/bundles/template-b6-355-b4-02.bundle`。標準側は未コミット(議長が行う)。

## 所見ごとの直し

- R1-01(高): `check-pr.mjs` に `isProseDocument` を新設(算定から除くもののうち、文書の置き場と直下の *.md だけ真。強制層・構成・ロックファイルは偽)。`aggregate-evidence.mjs` の `docOnly` はこれで判定。強制層・構成だけの変更は算定行数 0 として `noDenominator` へ。表示を「散文の文書だけの変更(…強制層・構成は含まない)」「算定行数が 0(強制層・構成・ロックファイルだけの変更を含む)」へ。IMPL-0136 の note も同じ語。試験: check-pr 単体 3 件、通しに #5(ワークフローだけ)
- R1-02(中): `summarizeSizeObservation(prs, { notObserved })` を足し、件名に PR 番号を持つが `prs`・`recordPrs` に入らなかった番号を「観測に入らなかったもの N 件(#…)」と出す。出せたので note の「母数は gh で読めた PR だけ」は開示として併記。試験: 通しに #7(壊れた応答)、純関数 2 件
- R1-03: test-assurance-period に結果が空欄・保留の場面
- R1-04: 通しに #6(docs と src を両方変える 450 行)
- R1-05: #6 は人の承認 2 件(60・900 分)と AI の承認。EV-0271 の対象へ AI 名義の判定の前提を追記
- R1-06: 集約・period-needed の `run:` 行の完全一致
- R1-07: ADR-0137 の表へ IMPL-0268 の行(#441 へのコメントは議長)
- R1-08: 適合側の欠落の集合 = 違反側 − 期間の欠落の1文、を確認。終了コードの検査の名前を「足場の欠落を含む…固定しない」へ。元の記録の「欠落が 18 件」は誤り(実測は違反側 6 件・適合側 5 件前後)
- R1-09: 「最後の人の承認」「人の承認の日時が記録に無い(AI 名義だけの承認を含む)」
- R1-10: 比を持たないものの行に「先頭の版への承認で、G-6 に数えた承認者のものに限る」
- R1-11: 「超過」を見出しの定型句を除き 0 回に。login の検査は観測の2節だけを切り出し、名前も合わせた
- R1-12: IMPL-0159 の note を「区間ごとの分布を保証の開示に、PR ごとの組を evidence.json に」へ
- R1-13: ADR-0137 を「規模との比を出していなかった(超過 PR の判定完了時間は出していた)」へ
- R1-14: SKIP の行は残し、冒頭に Windows で通しが抜けること・純関数の試験が補うことを明記

## 破壊(WSL の写しで1つずつ。すべて落ちた)

| 破壊 | 試験 | 結果 |
| --- | --- | --- |
| B 結果の値の検査を無効 | assurance-period | 落ちた(空欄・保留の 2 件) |
| F every を some | approval-pace | 落ちた(6 件) |
| C Math.max を Math.min | approval-pace | 落ちた(3 件) |
| D 集約の run に `|| echo failed` | assurance-period | 落ちた(完全一致の 1 件) |
| R1-01 docOnly を isExcludedFromSize へ | approval-pace | 落ちた(4 件) |

復元後は通過。落ちない破壊は無く、試験の追加は不要だった。

## 試験(WSL・node 26.13)

assurance-period 37・approval-pace 全通過・size-observation 19・check-pr 217・aggregate-records 135・direct-commit-rules 11・spec-recheck 103・aggregate-drift 25。すべて終了コード 0・失敗 0。

## 標準側の検査

`impl:write`・`evidence:write`(260 件)・`lint:impl`(template のコミット後の作業ツリーとの組で終了 0)・`lint:evidence`・`lint:scope`・`lint:refs`(終了 0)・textlint(対象 3 ファイル)すべて通過。junction は外した。変更: gate-criteria.md(IMPL-0136 note)、human-ai-boundary.md(IMPL-0159 note・EV-0271)、ADR-0137、台帳 2 つ(自動生成)。

## 指示と違えた点

- 既存の期待値 3 つを更新した。緩めではなく、足した PR による母数の変化: 前提の `total === 4` を 6、`points` に #6 を加え、`noDenominator === 0` を 1(#5 の分)。#7 は読めないため total に入らない
- 試験の前提の `broken` を state に写す修正を要した(初回は #7 が読めてしまい試験が空振りした)
- R1-02 は「出せた」ため note を倒す側には倒さず、併記にとどめた

## 確かめていないこと

実機の GitHub(is_bot・login の形、gh の失敗の形)。回帰の全量・`npm run check` 全体。件名に番号を持つが PR を経ない通常のコミット(「(#n)」を含む件名)が notObserved に混ざる場合の有無は、通しの 1 場面でしか見ていない。
