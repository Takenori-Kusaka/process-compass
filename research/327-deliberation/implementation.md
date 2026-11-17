# Issue #327 実装の記録(2026-11-17)

裁定: decision.md(c633f3b6)。番号: ADR-0153・ADR-0154、EV-0291(旧 EV-TMP-327-1)・EV-0292(旧 EV-TMP-327-2)、IMPL-0993(旧 IMPL-TMP-327-1)・IMPL-0994(旧 IMPL-TMP-327-2)。push の直前に衝突があれば付け直す。

## 変えた所在

- 第7章 exception-escalation.md 7.3: 対象の限定の項へ2項(判定の記録と記名、7.4 の禁止対象)と、課さないと決めた1項。EV-0271 から該当の2文を削り、EV-0292 を新設。IMPL-0603・IMPL-0567 の note を広げ、IMPL-0993 を新設
- 第4章 gate-criteria.md: G-1 前提条件の行3(SR4)、G-2 基準1 の確認方法へ数え上げを移し外の段落を削除、G-2 基準5 の後に S0 の1文、G-4 基準5 の確認方法(案D)、「判定の総数は増えません。」を削除。IMPL-0542 を undelivered へ
- 第8章 tailoring-guide.md 軸B: S0 の統合の段落、EV-0291、IMPL-0994
- 第2章 lifecycle.md: 2.4 に 2.8 を引く1文。IMPL-0849・IMPL-0951 の note を改めた(状態は undelivered のまま)
- 第5章 enablement.md(TG-1 基準4 の括弧)、ci-gates.md(D-0 の検査の表の行4 を「G-1 の審議を開始できない」へ。check-d0.mjs が全ての失敗を G-1 の文で出すことを読んで確かめた)
- ADR-0153・ADR-0154 を新設。src/data/impl-inventory.yaml(7.3 と軸B の登録に IMPL-0993・0994)。台帳 evidence-ledger.md・implementation-ledger.md を再生成

## 流した検査(全て通過)

textlint(変えた md)、lint:evidence、lint:impl、lint:scope、lint:refs、lint:tone、lint:provisions、lint:stage-table、lint:skills、test:impl、test:criteria。全量の npm run check は流していない。scope-ledger は変化なし。`criteria:write`・`template:kb` は要らない(判定基準の列の文は不変)。

## 裁定から外れた点

- IMPL-0993 は裁定で check=machine だが、`check=machine` は違反と適合の対の試験(test=)が必須で、未実装のため check=manual とし、note に機械の検査がまだ無い旨を書いた
- EV マークの「根拠の水準」行は書式検査が `E0(なし)` だけを許すため、外部の型の未確認の説明を差し替え条件の後の段落へ移した(内容は同じ)
- 「行わないまま」は textlint(dict5)の冗長表現に当たるため、本文では「実施しないまま」とした
- G-2 基準5 の後の S0 の1文は、scope 検査の限定語に当たらないよう「S0 で G-2 を G-4 へ統合した場合、…」の形にした

## 準拠テンプレートへ及ぶ項目(本 Issue では触っていない。#327・#445 へコメント)

T1 規則データ r-b-poc の注記(template:kb が template を変える)。T2 gates/G-4.md の S0 の手順(IMPL-0994)。T3 gates/G-4.md 基準5 の「空欄なら判定を始めない」(IMPL-0542)。T4 check-g1 の SR4(IMPL-0849)。T5 check-d0 と gates/SG.md(IMPL-0951)。T6 exception-paths.md(IMPL-0603)。T7 集約の gateExceptions(IMPL-0993・IMPL-0567)。T8 templates/trial-checklist.md の「差し引き」の項目(IMPL-0999。2巡目の突合 M2-2。ゼロを許す旧い文が残る)。

範囲の外の所見: ci-gates.md の D-0 の検査の例が `scripts/governance/check-d0.mjs` を書き、準拠テンプレートの所在は `scripts/gate/check-d0.mjs` である(採否は未決。ADR-0154 の影響に記録)。G-5 基準1「例外なし」が 7.3 の「例外を認めない基準」に当たるかは未決(ADR-0153 の影響に記録)。論点5 は Issue のコメントで閉じる(議長の作業)。
