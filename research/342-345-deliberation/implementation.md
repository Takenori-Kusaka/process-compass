# 実装の記録(Issue #342・#345、2026-11-12)

## D-1(a) 第8章への引き先

採れた。tailoring-guide.md「会議体と体制図の調整」(1142 行)に、会議体を既存の場へ対応づける規定がある。
- 1144 行: 「第3章の会議体は、組織の規模によって**設置ではなく対応づけ**で扱います。」
- B-2 の行(3〜9名): 「月次の定例へ対応づける」。B-4 の行(3〜9名): 「既存のリリース会議へ対応づける」。B-1 の行: 「既存の決裁制度へ対応づける」
- B-3 設計審査会の行は「必要時のみ招集」で、DR との対応づけを直接は書かない。前文の「確定します」は、この節の対応づけの枠に置く確定である(留意点)

## template の DR0〜DR2

template/ に別称 DR0〜DR2 の語は無い(grep 0 件)。

## 逸脱・留意

- `retiredPhrases` の `by` は、検査6 が ADR を要求する(Issue は追加としてだけ可)。別称を決めた ADR は無いため、規約の書式に合わせ `"#342、ADR-0063"`(規定の表現形式と注記の規則)とした。ADR の新設はしていない。議長の確認を要する
- `npm run template:kb` は template/scripts/vendor/tailoring-kb.json の provenance の commit 値だけを変えた(内容の差分なし)。元へ戻し、template はコミットしていない
- 2.10.5 の 3.7.5 の引用は、表明の文の直後に置いた(O-4)
- SRC-0633 に claim c8(24.5)を足した。verification の note は c1〜c7 の確認を述べたままで、c8 は調査の逐語(research/316-deliberation/survey-316-2-external.md:123)による
- 変えたもの: lifecycle.md・overview.md・tailoring-guide.md・gate-criteria.md(334 行も「定めません」へ)・roles-responsibilities.md(3.7.3・1454)・vision/04-traceability.md(対応の目安)・content.config.ts(注記)・integrated.yaml(alias)・provision-forms.yaml・impl-targets.yaml(flow-observation)・impl-inventory.yaml・implementation-ledger.md(再生成)・SRC-0633.yaml

## 追補: ADR

- #342 の別称 DR0〜DR2 を廃する決定を ADR-0128 に記録した。retiredPhrases 4語の by を "#342、ADR-0128" へ改めた（旧 ADR-0063 は別称を廃した決定でなく、検査13の趣旨と食い違っていた）
- 検査: lint:provisions、lint:refs、textlint は通過
