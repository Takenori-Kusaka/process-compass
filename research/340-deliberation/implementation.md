# 実装の記録: #340 要求事項5 の L2 への適用(ADR-0170)

- 日付: 2026-11-17。仕様は decision.md。番号は仮(push の前に付け直す): EV-0312・EV-0313、IMPL-1013・IMPL-1014、ADR-0170

## 変えたファイル

- `src/content/docs/adr/0170-l2-promotion-requires-enforcement-location-in-safety-risk-assessment.md`(新設)
- `src/content/docs/adr/0158-…md`(ステータスの節に1文)
- `src/content/docs/phase4-process-design/roles-responsibilities.md`(3.12.10 の表5行目、L2 の段落、IMPL-0519・0279 の note)
- `src/content/docs/phase4-process-design/human-ai-boundary.md`(5.4.5 の条件7、移行の段落、EV-0312・0313、IMPL-1013)
- `src/content/docs/phase4-process-design/deliverable-templates.md`(テンプレ9 の記入時の注意、IMPL-1014)
- `src/content/docs/phase4-process-design/assurance-case.md`(観点23 の不適合の例)
- `src/data/impl-inventory.yaml`(5.4.5 を marked にし、条件1〜7 の区分を足した。テンプレ9 の記入時の注意に IMPL-1014)
- `src/content/docs/community/evidence-ledger.md`、`implementation-ledger.md`(再生成)

## 未実装・理由

- 仕様の「IMPL-0834 の note」は変えていない(仕様は IMPL-0519・0279 だけを挙げる)
- T-1・T-2(template の記入時の注意・手引き)は仕様どおり #448 へ。template/ は触っていない
- 仕様にない変更: impl-inventory.yaml の登録(lint:impl が要求)。5.4.5 の条件1〜5 を elsewhere、条件6 を elsewhere、条件7 を marked で区分した。reason の文は実装の段で書いた短い説明であり、突合で見てほしい
- ADR-0170 の文は textlint(である調、助詞の重複)のため、仕様の文を言い回しだけ直した。意味は変えていない
- 本束の ADR の索引は adr/index.md に一覧が無く、更新していない

## 検査の結果

- evidence:write・impl:write・scope:write: 実行(scope は変更なし)
- lint:impl・lint:refs・lint:provisions・lint:tone・lint:evidence・lint:scope・test:impl・test:plan-issues・textlint(変更したファイル): すべて通過
- `impl:issues --issue 448`: IMPL-1014 が #448 を指す(open のため問題なし)。IMPL-0766 の付け替えは本束と無関係
- lint:text 全量・npm run check は流していない(push の前に1回)
