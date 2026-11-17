# #332 直し(1巡目、2026-11-17)

所見: review-round1.md。変えたのは standard-editions.md・ADR-0157・ADR-0090 のステータスの節・SRC-0757/0759・implementation.md・evidence-ledger(再生成)。

## 直した所見

- 高-1: scratchpad(`t8/`)の使い捨てリポジトリで T8(`docs/` 同一、`source.commit`=S のまま kb だけ差し替え、`dist/standard` の外)を再現。S の祖先=0、kb の source.commit=0、条件2=0 で通り、`git merge-base --is-ancestor D origin/dist/standard`=1 で落ちた。T1(正常)は4つとも0。手引きの条件1 に D の確認を足し、実行での確認の段落と EV-0301 の対象を直した。ADR-0157 の決定1 と選択肢の表にも反映。限界: 保守者が dist/standard へ直接書く場合は従来どおり検出しない(開示済み)。
- 高-2: 本文は開示済みを確認。implementation.md に、B8 の順に載ったこと(指揮役の了承 2026-11-17)を追記。標準の側の祖先の検査(`check-gate-criteria.mjs`)の導入は、B8 の再生成と同時に行う。
- 中-1: 「未達」を「未実装(降りていない、undelivered)」へ替え、ゲートの状態の「未達」でないと明記。
- 中-2: ADR-0090・ADR-0157 のステータスの「残り」を4項目の実態に合わせた。
- 中-3: 正本の URL の clone に限り、fork と配布物内の「出所」を使わないと明記。
- 中-4: implementation.md の記述を訂正。SRC-0757/0759 の L36 を二重引用符に替え(内容は不変)、yaml で構文を確認。`lint:citations` 通過。`lint:sources` は SRC-0757/0759 の誤りが消え、残る誤りは SRC-0764(別の担当のカード)のみ。
- 低-1: SRC-0459#c1・SRC-0415#c1・E1 に直した。低-2/3/4: ADR-0090 の追記を表の後へ移し、ADR-0052 の行を直し、ADR-0141 の後継指示を足した。低-5: 「定めないこと」に1行。低-6: 題の形への依存と複数の D の扱いを手引きに追記。

## 採らなかった所見

なし。ただし高-1 の「条件2 に kb のバイト一致を足す」案は採らず、祖先の確認だけで代えた(D が CI の書いた履歴の上にあれば kb も CI の生成物であり、保守者の権限の書き込みは既に検出しないと開示済みのため)。

## 検査

textlint(変更4ファイル)・lint:refs・lint:evidence(289件)・lint:citations 通過。evidence:write 実施。
