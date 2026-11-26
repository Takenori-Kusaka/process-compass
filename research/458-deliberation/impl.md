# #458 実装の記録(2026-11-27、束 D2)

## 変えたファイル
- phase4: proposal-template.md(L22・見本 §1・§4・§7 の表・想定問答、IMPL-1046)、executive-projection.md(G.1)、tailoring-guide.md(第8章。署名の意味の置き換え・期限の後の読み・中止の段落)、deliverable-templates.md(テンプレ11 の層1 なしの参照)、adoption-guide.md(I.12)
- phase5: enablement.md(衝突の決着の表の後の箇条・承認者の勧め・合意書 節5 と「3者の承認」)
- adr/0265-*.md(新規)、adr/0116 のステータスへ一部置き換えの行、src/data/impl-inventory.yaml(IMPL-1045・1046 を登録)
- 台帳(evidence-ledger・implementation-ledger)は再生成、issue-index.tsv は変更なし

## 使った番号(push の前に議長が付け直す)
- ADR-0265
- IMPL-1045(TBD-458-1。trial-checklist・undelivered・check=manual。presence は降りていないと試験の目印を求められるため manual。D1 で presence へ)、IMPL-1046(TBD-458-2。proposal-record・adopter)
- IMPL-TBD-458-3 は立てていない。template に合意書の写しが無く、enablement.md は phase5(手引きで実装マークの対象外)のため。節5 は D2 で改めた
- EV-0354(TBD-458-1)、EV-0355(TBD-458-2)、EV-0356(TBD-458-3)

## 判断
- 変えない: template/・チェックリストの行(tailoring-guide L1358 付近・enablement の写し)。check-template-drift(test:template)は通る
- enablement「数えない」の後半は、第8章の本文から導けないため置かず、前半だけを置いた(裁定の注に従う)
- IMPL-1046 は、inventory 上「提案書テンプレート」の節が none のため、「提案の戦略」の節の IMPL-0961 の隣へ置いた
- ADR index は自動生成のため追記なし
- template:kb は実行していない

## 検査
- 通過: lint:impl・refs・evidence・scope・provisions・tone、test:fields、test:template、変えた md の textlint(誤りなし)
- 全量の回帰・npm run check の全体は流していない
