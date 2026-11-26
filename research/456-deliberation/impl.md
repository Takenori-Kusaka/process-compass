# #456 実装の記録(2026-11-27)

- 変えたもの: `assurance-case.md`(H.3 の新しい節と表、H.9 問25・EV-0272・EV-0058、H.11 の歯止めの1句)、`proposal-template.md`(§5 と想定問答の1行)、`adoption-guide.md`(Q7 の根拠)、`adr/0266-failure-projection-in-appendix-h-with-hand-written-stop-categories.md`、`scripts/check-failure-projection.mjs`・`scripts/test-failure-projection.mjs`、`package.json`(`lint:refs` の末尾)、`src/data/impl-inventory.yaml`(key を1件。status none・elsewhere・location は 5.8.1)、台帳(evidence・implementation)の再生成。template は変えていない
- 使った番号: ADR-0266、EV-0357(裁定の EV-TBD-456-1)。IMPL は使っていない(実装マークは要らない。裁定 §4.7)
- 表の IMPL・state の確かめ: 表の23件のマークを作業ツリーの本文で読み、裁定の §2 の state・check と一致した(IMPL-1037〜1049 は表に無い)
- 番号の付け直しで検査が壊れるか: 壊れない。検査は表の中の既存の IMPL 番号(0142 ほか)を本文のマークと突き合わせる。付け直すのは新しい番号(EV-0357 と、表に無い IMPL-1050 以降)だけ。EV を付け直したら、assurance-case.md の EV-0357 の4か所(H.3 のマーク、H.9 の EV-0272 の下の1文、問25 の行、ADR の本文)と ADR-0266 の根拠水準を同時に直し、`npm run evidence:write` を再実行する。ADR 番号を付け直すときは、ファイル名・title・sidebar.order を直す
- 検査: lint:refs(新しい検査と試験17件を含む)・lint:evidence・lint:impl・lint:scope・lint:provisions・lint:ci・test:fields・lint:tone は通過。変えた md の textlint は違反なし
- 行4(ブラックボックス化)は「審議中(#457、2026-11-27 時点)」のまま。#457 の実装の段で改める
- 申し送り: proposal-template.md の想定問答で、問25 の行は表の末尾の1つ前(「事故が起きたときの契約上の責任」の前)に置いた
