# #352 実装の記録(2026-11-15)

decision.md の裁定どおりに本文を実装した。template・pit-crew・zenn は触れていない。

## 変えたファイルと文

| ファイル | 変更 |
| --- | --- |
| `src/content/docs/phase4-process-design/overview.md` 1.10.2 | 「列挙に無い離脱」の表に「当たる条件」の列を足し、兼務と秘匿の行を2行に分けた(8行)。注記の1つ目の項目を「常に当たる」兼務の2組へ絞り、ほかは表の「当たる条件」による旨に置き換えた。末尾の段落(別の Issue で審議する)を「定めないと決めた」の文に置き換えた(ADR-0133、EV-0263 を引く)。EV-0263 を EV-0160 の後ろに新設。IMPL-0515 を表の後ろに新設。2名の体制の6条件は変えていない |
| `roles-responsibilities.md` 3.4.3 | 要求事項7 の末尾に、登録と受容は条件でも措置でもなく、受容しても離脱は消えない旨と定めないと決めた理由を足した。注記(1名体制)を、保持者に数えるのは確認の記録を持つ本人であり確認した者は数えない旨に置き換えた |
| 同 3.5 | 表の「3名未満」の行の「代償措置を定めていないため」を「条件と代償措置を定めない。…前提そのものが欠けるため」に置き換えた。AI維持管理者 × AI運用担当者の段落に、広げない理由を足した |
| 同 3.5.2 | 「逸脱の閉じた列挙…この例外(D-1)だけです。」の後ろに、広げない理由を足した |
| 同 3.5.3 表の3行目 | 「本標準は代償措置を定めていない」を「条件と代償措置を定めない。人数によらず席ごとに分けられるため」に置き換えた |
| `deliverable-templates.md` テンプレ11 | 「列挙に無い離脱として扱います。」の後ろに、条件と代償措置を定めない理由の1文を足した(必須欄には登録されていない段落) |
| `adr/0133-no-conditions-or-compensating-measures-for-unlisted-deviations.md` | 新規。決定1〜8、採らなかった案の表、影響。決定2 に所有者の確認(X-9)の記録(回答者は所有者、2026-11-15)を書いた |
| `adr/0035-…md`・`adr/0083-…md` | ステータスの節にだけ、ADR-0133 による一部置き換え・補いを足した。本文は変えていない |
| `src/data/impl-inventory.yaml` | 「列挙に無い離脱」の節を none から marked(IMPL-0515)へ。issue は 352 |
| 台帳 | `evidence-ledger.md`、`implementation-ledger.md` を再生成(`scope-ledger.md` は変更なし) |

phase4〜6 の見出しは足していない。見出しの「(適用: …)」も変えていない。`template:kb` は流していない。

## 仮の番号(push の前に付け直す可能性がある)

- ADR-0133(指揮役の割り当て)
- EV-0263(作業ツリーの最大は EV-0262)
- IMPL-0515(作業ツリーの最大は IMPL-0514)
- 付け直すときは、overview.md・ADR-0133・roles-responsibilities.md(ADR 番号は不変)・impl-inventory.yaml の IMPL-0515 と、本文中の EV-0263(overview.md 1.10.2 の本文と ADR-0133)を揃えて置換し、`npm run evidence:write`・`npm run impl:write` を流す

## 足したマーク

- EV-0263(暫定、見直し 2027-10)。開示した点: 1名の体制の排除に実証が無いこと、外部の出典の多くが二次情報であること、ADR-0081 との整合を条文の読みで確かめ実行では確かめていないこと、D-1 が審議の観点に照らして弱いこと。PCI DSS の出典は台帳に未登録のため、本文では名を書かず `external.md` を指した
- IMPL-0515(state=undelivered、plan=scheduled issue=354 review=2027-04)

## コメントした Issue

#354(未達マーク・T-1・T-2・検査の不在)、#329(D-3 の文案)、#356(秘匿の二重の扱い)、#351(数え方)、#340(K-4)、#353(前提と ADR 番号の誤り)。新規の起票なし。#352 へのコメントなし。

## template の直列の順へ入れる分(#354 の順)

- T-1: `scripts/init/generate-profile.mjs:3610` の「構成に欄の無い列挙に無い離脱」の注記に、欠陥注入の時期と箇所の秘匿の不成立を足す。同じ文を写す生成区間(PROCESS-PROFILE.md・CLAUDE.md)と、固定する試験があれば合わせる
- T-2: `templates/00-d0-governance.md:121` の「代償措置が定められていないため」を「本標準はこの兼務に条件と代償措置を定めないため」へ

## 試験の結果

lint:refs・lint:provisions・lint:evidence・lint:impl・lint:scope・lint:tone・lint:dekimasu・lint:text(textlint 全量)・test:fields・test:impl は通った。`npm run check` の全量とビルド、test:template は流していない。lint:provisions は「できない」の文末を1件検出し、直した。

## 残り

- 独立の突合(未実施)。見てほしい点は decision-draft.md 7.2 の (i)〜(iv)
- push の前に origin/main の最大の次へ ADR・EV・IMPL の番号を確かめる
- 寄せ先の無い論点(体制の外の共署、規模によるプロファイル分け、AI の統制の値の下限固定)は起票せず、ADR-0133 の採らなかった案と decision-draft.md 5 章に残した
