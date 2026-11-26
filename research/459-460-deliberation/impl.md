# #459・#460 実装の記録(2026-11-27、束 D2)

## 変えたファイル
- src/content/docs/phase4-process-design/overview.md(1.4: 記名・組織の決裁の仕組みを足し、帰属の確認を拡張、注記、判定の証跡の例示)
- src/content/docs/phase4-process-design/gate-criteria.md(判定の成立の性質1〜5、記録の媒体、人が書く欄の受け皿と事前の定義・所在の参照、基底ブランチへ入れる操作の第3の経路・照合なし・抜き取り・不一致、G-1、保証の開示 項目1、成立条件4、EV-0109 の文の改訂)
- src/content/docs/phase4-process-design/exception-escalation.md(7.3)
- src/content/docs/phase4-process-design/adoption-guide.md(I.12 の後に手引きの節)、proposal-template.md(「本人の承認の記録」)
- src/content/docs/adr/0264-gate-record-by-property-and-reference-attribution.md(新規)、adr/0070・0106 のステータスへ一部置き換えの行
- src/data/impl-inventory.yaml(IMPL の登録)、src/data/issue-index.tsv(npm run issues:snapshot の更新。lint:impl が issue=460 を引くため)
- 台帳(evidence-ledger・implementation-ledger)は再生成

## 使った番号(push の前に議長が付け直す)
- ADR-0264
- IMPL-1037〜1044(裁定 4.4 の IMPL-TBD-460-1〜8 の順。1041・1042・1043 は machine を予定するが、降りていない状態では試験の目印を検査が求めるため check=manual で置いた。note に明記。D1 で template の試験とともに machine へ改める)
- EV-0351(外部の決裁の記録による帰属の確認。TBD-460-1)、EV-0352(性質の充足の申告。TBD-460-2)、EV-0353(抜き取りの率。TBD-460-3)
- SRC: 使っていない。ISO 9001 7.5.3 は ADR に「未確認の転載」と書いただけ
- 既存の EV-0109 は番号を再利用せず、対象の文(媒体別の数え方に決裁の仕組みを足す・追加後の分布は未測定)を改訂した

## 判断
- 変えない: template/・deliverable-templates.md・ci-gates.md・template-fields.yaml(束 D1)。欄名は変えていないので test:fields は通る
- ADR index は自動生成(個別の一覧が無い)ため追記なし
- 手引き(adoption-guide I.12 の後)は附属書のため実装マークを置かない
- template:kb は実行していない(規則データを変えていない)

## 検査
- 通過: lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・lint:ci・lint:tone・test:fields、変えた md の textlint(誤りなし)
- 環境: worktree に node_modules が無く、npm ci --ignore-scripts と git submodule update --init template(中は変更なし)を行った
- 全量の回帰・npm run check の全体は流していない
