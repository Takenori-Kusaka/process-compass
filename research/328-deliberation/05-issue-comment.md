議長の裁定(research/328-deliberation/04-ruling.md)を記録し、本文を直しました(ADR-0142)。

- C-3: 3.5.5 に1文と根拠水準マーク(EV-0286)。C-4: 往路の表と label-mailbox を「変更(追加・改修・統合・削除)」へそろえました
- C-14: 遷移の表に ready-to-merge → dev-done を足し、dev-done の付ける席に出荷判定者(適用: 要求事項5)を足しました
- C-10: 改名しません。3.5.1 に1文、ADR-0142(#347 と共通)、ADR-0082 に案内
- C-6: integrated.yaml の成果物の名を様式名へ。C-17: 附属書B の題を表示名へ(台帳キーを付け替え。baseline は凍結のため触っていません)
- C-15・C-16: 1.4 に「記録の欠落」「不変条件」「RACI」「担保水準」の行。外殻・内殻は lifecycle.md:717 の用法が食い違うため残りの項目です
- 見つけた点: 1.4 の「不変条件」は safety-verification.md:141 の語と重なります。突合で確かめます

template の残り(本束では触っていません)
1. template/CLAUDE.md:132 の承認の範囲を 3.11.2(指示資産の変更)へそろえるかの確認
2. template/CLAUDE.md・handoff.md に、判定記録の無い ready-to-merge を dev-done へ戻す行があるかの確認

残りの項目と template の項目があるため、開いたままにします。

独立の突合(1巡目)の所見を直しました(research/328-deliberation/08-fixes-1.md)。
- 1.4 の「不変条件」を 5.4.3 の意味に限定し、公式用語の決め方を 1.4 と ADR-0118 の案内へ出しました
- IMPL-0984 の note に判断の仕方を足しました。出典の示し方を直しました
