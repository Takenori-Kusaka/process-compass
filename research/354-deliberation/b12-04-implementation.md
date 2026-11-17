# #354 の残り3マーク 実装の記録(束 B12)

指示書: `b12-03-ruling-proposal.md`(議長の裁定を含む)。

## 変えたもの

template(pit-in-template。コミット済み、push していない。bundle: `E:/Github/process-compass/tmp/bundles/template-b12-354-01.bundle`)
- `scripts/gate/config.mjs`: `statementFactsLine`・`STATEMENT_FACTS_NOTE` を足して export。`claimStatus` の注記を改めた
- `scripts/gate/aggregate-evidence.mjs`: `claim.statementFacts`(版・コミット・未達・欠落の件数。欠落は名を下げる式と同じ `gaps.length`)を足し、品質レポート項目5 の名の行の直後に1行を出す。`external` の形は離脱の内容を出さず件数だけ
- `scripts/gate/test-edition-end.mjs`: IMPL-0120 の ng/ok の対4つと、集約の値(statementFacts)の1つ。76 件が通過
- `scripts/init/generate-profile.mjs`(3654 行): 数えない項目に配備の資格情報の結び付けを足した(この文を固定する試験は無かった)
- `README.md`: 460 行(再開)と 659 行(T-2。「未達」を「列挙に無い離脱」・例外承認の語へ)

本体
- `overview.md` IMPL-0120(delivered・machine)、IMPL-0309(undelivered・adopter・ADR-0165)
- `gate-criteria.md` IMPL-0986(undelivered・adopter・ADR-0165)
- `src/content/docs/adr/0165-statement-facts-by-aggregation-and-adopter-confirmed-resume-and-deploy-credential.md`(`b12-adr-draft.md` から。EV-0312 は仮の番号)。adr/index.md は一覧を持たないため更新なし
- 台帳(evidence-ledger・implementation-ledger)を再生成

## 検査

- `node template/scripts/gate/test-edition-end.mjs`: 76 件通過
- `npm run impl:issues -- --issue 354`: 0 件・終了コード 0
- `lint:impl`・`lint:refs`・textlint(ADR)通過。`npm run check` の結果は末尾

## 指示書と違えた点

- 根拠水準マークの書式検査が「根拠の水準」の行への付記を認めないため、ADR の「判断であり、採用者の観測は無い」を「備考」の行へ分けた
- 離脱の一覧は、`external` の形では件数だけにした(label に保持者の名が入りうるため)
- 申し送りのコメント(#329・#354)は議長が出す(担当は Issue を操作していない)

## npm run check の結果

テンプレートの試験 2 件が落ちた: test-g5-aggregate(CRLF の偽の FAIL)と test-discouraged-evidence(origin/main の template でも同じ 2 件が落ちる。Windows の既存の失敗。本件の変更とは無関係)。ほかは通過
