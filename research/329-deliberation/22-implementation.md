# #329 実装の記録

作成 2026-11-17。入力: `21-ruling.md`。template/ には書き込んでいない。

## 1. 変えた所在

| ファイル | 節 | 内容 |
| --- | --- | --- |
| `src/content/docs/adr/0141-g8-by-record-and-deploy-credential-unlisted-deviation.md` | 新設 | ADR-0141(裁定 3 節の文案。採用日 2026-11-17。EV は EV-0282〜EV-0285)。ADR の一覧は autogenerate のため `adr/index.md` に行は無い |
| `phase5-implementation/qms-document-control.md` | G-8 の行 | 操作を判定記録の基底ブランチへの投入へ。必須レビュアは成立に数えない。記名者の条件を追加 |
| `phase5-implementation/ci-gates.md` | デプロイゲート | 「定めていない」を削除し、判定記録で成立と書いた(EV-0282)。表を 2026-11-15 時点へ更新。「未達として記録」を列挙に無い離脱へ揃えた |
| 同上 | 統制と資格情報の置き場の末尾 | 「記録例」節を新設(手引き。7.3 の書き方を含む) |
| 同上 | PR 単位の検査(pr-rules) | 手動の起動の段落(EV-0285) |
| `phase4-process-design/gate-criteria.md` | G-8「判定記録と配備の順序」(新設) | 配備は判定記録の後。EV-0283、IMPL-0985 |
| 同上 | G-8「配備の統制と資格情報の置き場」 | 区分を列挙に無い離脱へ。契約の条件は区分を変えない(EV-0284)。7.3 の例外承認の段落と IMPL-0986。IMPL-0237 の note を改めた |
| 同上 | G-5「判定のコードの読み元」 | PR を評価した起動の結果に限る 1 項と IMPL-0987 |
| `phase4-process-design/overview.md` | 1.10.2 | 「未達」の二義の箇条。列挙に無い離脱の表に 1 行(括弧を外した)。note と IMPL-0521 の note(5 つ) |
| `phase4-process-design/exception-escalation.md` | 7.3 | G-8 の配備の統制を名指す 1 文。IMPL-0603 の note |
| `phase6-operation/risk-catalog.md` | 配備の自動化の不備の行 | 受け止めを実在する統制へ |
| `community/project-management.md` | 標準の規定との関係 | 「未達として開示」を「列挙に無い離脱として開示」 |
| `src/data/impl-inventory.yaml` | 登録簿 | IMPL-0985・0986・0987 を節へ登録 |
| `research/sources/SRC-0748.yaml`・`SRC-0749.yaml` | 新設 | GitHub Docs 2 件(草案の SRC-T329-01・02)。SRC-T329-03 以降は条文が引かないため登録していない |
| 台帳 | 再生成 | evidence-ledger・implementation-ledger、research/sources/catalog.md と 282 の by-issue ほか(index) |

## 2. 付けた番号

- EV-0282(ci-gates デプロイゲート)・EV-0283(gate-criteria 判定記録と配備の順序)・EV-0284(gate-criteria 契約の条件)・EV-0285(ci-gates 手動の起動)。見直しは 2027-05(0285 のみ 2027-03)
- IMPL-0985(deploy-workflow、adopter)・IMPL-0986(evidence-aggregation、issue=354)・IMPL-0987(evidence-aggregation、issue=329)。いずれも undelivered
- SRC-0748・SRC-0749

## 3. 裁定との差と注意

- 書式の検査(textlint、根拠水準マークの呼称)に合わせ、文言を次のとおり直した。意味は変えていない。(1) ci-gates の箇条は「である」調 (2) 根拠の水準は `E0(なし)`・`E1(間接)` の呼称に揃え、補足は本文へ (3) 一部の長い文を分割
- 「1.10.2 の箇条」は 656 行付近(列挙に無い離脱の表の前の箇条の後)に置いた
- `m template`(`template/scripts/vendor/tailoring-kb.json` の作業ツリーの差)は本担当の変更ではない(template:kb は流していない。コミットに含めない)
- #329 は IMPL-0987 が delivered になるまで閉じない(裁定 4.2)

## 4. template の項目(Issue のコメントへ貼る形)

| # | 変更 | 閉じ方 | 寄せ先 |
| --- | --- | --- | --- |
| T-1 | 述べられる名(`config.mjs` の `claimStatus`)が、配備の資格情報の離脱を数える。構成に欄を新設する(`/process-change` の種別)。有効な例外承認(台帳の区分「例外」で対象が配備のワークフロー)がある構成は離脱に数えず、例外承認の件数へ数える | 欄の値と台帳の行の照合は機械(値の一致・存在)。欄が実態と合うかは manual | #354(IMPL-0986) |
| T-2 | `README.md:641-653` の「未達として保証の開示へ記録する」の語を「列挙に無い離脱として記録する。7.3 の例外承認を経た場合を除く」へ揃える | 手引き | #354 |
| T-3 | `/gate G-8` の補助ファイル(`.claude/skills/gate/gates/G-8.md`)に、配備の環境の承認は成立に数えないこと、配備は判定記録の後であること、緊急の修正にも G-8 を経ない経路が無いことを書く | 手引き | #445 |
| T-4 | `.claude/skills/gate/reference/exception-paths.md` に、構成の条件のうち G-8 の配備の統制だけが例外承認の対象であること、台帳の行の対象の書き方(配備のワークフローの所在と配備先)を書く | 手引き | #445(IMPL-0603 と同じ) |
| T-5 | 配備の実行記録と G-8 の判定記録の突き合わせ(IMPL-0985) | 採用者 | `plan=adopter`。template の作業は無い |
| T-6 | env-check の読みで狭める措置の欄を埋める | — | #361 |
| T-7 | ADR-0123 の経路: 出荷の証跡の集約が、PR ごとの `gate-g5` の結果のうち、起動の事象が `pull_request`(または `pull_request_target`)のものだけを G-5 の通過に数える。あわせて、成功した手動の起動がルールセットの必須チェックを満たすかを実機で確かめる。塞ぐ形は実機の結果を見て template 側で選ぶ。skipped の check run は必須チェックを満たすので、ジョブを飛ばす形は採らない | 機械(起動の事象の値)。強制層の変更なので AI維持管理者の承認を経る | #329(IMPL-0987) |

## 5. 流した検査と結果

| 検査 | 結果 |
| --- | --- |
| textlint(変えた md 8 件) | 問題なし |
| lint:evidence | 269 件、期限到来 0 |
| lint:impl / test:impl / test:plan-issues | 通過(IMPL-0985〜0987 は undelivered として台帳に出る) |
| lint:scope / lint:refs / lint:provisions / lint:dekimasu / lint:skills / lint:tone / lint:ci | 通過 |
| lint:sources | 問題なし(SRC-0748・0749 追加) |
| lint:citations / lint:registry / lint:stage-table / test:criteria / test:fields / lint:figures | 通過 |
| npm run check の全量・build | 流していない(push の前に 1 回) |
