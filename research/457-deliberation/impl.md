# #457 実装の記録(2026-11-27。束 D2)

- 変えたもの: `human-ai-boundary.md` 5.5.1(段落・表の第1行・理由の記録の箇条・暫定マーク・実装マーク3件)、`pr-workflow.md`(様式の注記・手引き4項目)、`review-guide.md`(L106 の ed)、`assurance-case.md` H.3 投影表の「なぜそう作ったか」の行(審議中を外し、未達 IMPL-1050〜1052 と開示を表示)、`adr/0267-...md`(新規)、`src/data/impl-inventory.yaml`(5.5.1 の ids)、`research/sources/SRC-0769.yaml`(arXiv:2505.05410 の要旨)、`scripts/test-failure-projection.mjs`(審議中の試験の例を #457 の行から #455 の行へ)、台帳(evidence・implementation・sources catalog・by-issue ほか)の再生成。template は変えていない
- 番号: ADR-0267、EV-0358(裁定の EV-TBD-457-1)、IMPL-1050(claude-md-resident)・IMPL-1051(pr-template)・IMPL-1052(implement-skill)、SRC-0769。IMPL はすべて `state=undelivered check=manual plan=scheduled issue=457 review=2027-01`。IMPL-1050 の note に「束 D1 で presence へ移す」と書いた
- 付け直しの手掛かり: EV-0358 は human-ai-boundary.md のマーク1か所と ADR-0267 の2か所。IMPL-1050〜1052 は human-ai-boundary.md のマーク・impl-inventory.yaml の ids・assurance-case.md H.3 の行の3か所。ADR は ファイル名・title・sidebar.order
- 投影表: 行は「AI の作業がブラックボックスになる(なぜそう作ったか)」。区分は 人 / 未達 / 開示、最も弱い止め方は 開示。審議中の表示は「—」。表の試験が #457 の行を例に使っていたので #455 の行へ移した(試験の意味は変えていない)
- 検査: textlint(変えた md)・lint:evidence・lint:impl・lint:scope・lint:refs(check-failure-projection と試験17件を含む)・lint:provisions・lint:tone・lint:sources・test:fields・test:template は通過。全量の回帰は流していない
- 範囲外: review-guide L106 は本束で直した。テンプレートのレビューの様式に同じ文があるかは template 未初期化のため確かめていない(束 D1 で `grep`)。軽の2件のコメントは議長が投稿
- 採らなかったこと: ADR の index には ADR の一覧が無いため更新なし(ADR-0266 と同じ)
