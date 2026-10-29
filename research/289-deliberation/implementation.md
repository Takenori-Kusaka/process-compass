# 反映の記録(Issue #289 成果物の構造、論点 D-1〜D-15)

- 日付: 2026-10-23
- 正とした文書: `research/289-deliberation/decision.md`(D-1〜D-15、根拠水準のマークの表、反映の担当への指示)
- 迷ったときに引いた材料: `council-01-drafter.md`(D-15 の各行の所在)、`survey-289-1`(要約5・6、ADR-0034 の行)、`survey-289-4`(1.1 の 15 か所の表)、`issues-context.md`
- 様式の手本: `research/302-310-deliberation/implementation-A.md`
- git の操作はしていない。`template/`(submodule)の中も、編集しただけで commit していない

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号は「2. 番号の割り当て」にある。**次に使える番号は、ADR-0074、EV-0126、IMPL-0142**(IMPL-0141 は 7 章の対応で使った)。使う前に、既存の最大を自分で確かめること。

### 0.2 語の決まり(今回足したもの)

| 語 | 決まり | 所在 |
| --- | --- | --- |
| 判定の対象 / 判定の材料 / 判定の証跡 | 対象 = ゲートが通過か差し戻しかを決める事柄。材料 = 判定者が読む成果物。証跡 = 判定記録(テンプレ4)に限る。G-3 は対象 = 技術上の選択、材料 = 判断記録 | 第1章 1.4、第6章の一覧、第4章 G-3 |
| 設計の有効性 / 運用の有効性 | 設計 = 設定の値が規定どおり。運用 = その設定で止まるべきものが止まる | 第1章 1.4、第4章 G-5 |
| 判断記録の状態 | 採用 / 一部置き換え(→ ADR-MMM の決定 n) / 置き換え(→ ADR-MMM) / 廃止 の4つだけ | 第6章 テンプレ2、`adr/index.md` 運用ルール3 |
| 廃した言い回し | 「G-3 の判定対象」「設計案の非機能欄」「『戻せない選択』欄」(`provision-forms.yaml`、by ADR-0071) | 検査は `npm run lint:provisions` |

### 0.3 機械の決まり(今回足したもの)

| 決まり | 実装 | 試験 |
| --- | --- | --- |
| 判断記録の両側の参照・状態と置き場の一致 | `template/scripts/gate/check-decisions.mjs`(新設。G-5 の contract ジョブで実行) | `test-decisions.mjs`(新設、22 件) |
| 期限つきの実験の期限超過の一覧 | 同 `--overdue`(失敗にしない) | 同 |
| 保管領域の読み込みの拒否 | `.claude/settings.json` の `permissions.deny: ["Read(./context/_archive/**)"]`。初期化(`generate-profile.mjs`)も全タグで出す | `test-decisions.mjs`、`test-init-g5.mjs`(タグごと) |
| 行数の算定: 置き場の外の `*.md` を数える | `check-pr.mjs` の `isExcludedFromSize`(`classifySize` が使う)。同時変更・Spec の判定(`isNonProduct`)は変えていない | `test-check-pr.mjs`(4 場面を追加) |
| 統制の設定の陰性の確認の記録 | `check-pr.mjs` の 3b(`CONTROL_FILES`・`negativeCheckOf`・`negativeCheckProblems`)、`.github/PULL_REQUEST_TEMPLATE.md` の節 | `test-check-pr.mjs`(8 場面を追加。既存の「閾値だけの PR」の本文に記録を足した) |
| 証跡の集約の判断記録の表示 | `aggregate-evidence.mjs` が状態ごとの件数と不一致の件数を出す(JSON は `decisions: {counts, problems}`) | 実行して出力を確認(空の構成で 0 件 / 不一致 0 件) |

## 1. 論点ごとの記録

### D-1 立ち戻る先(原則)

- 第6章 `deliverable-templates.md`: 一覧に「プロダクトの原則(テンプレ12)」の行。「## テンプレ12: プロダクトの原則」を新設(義務でない旨を太字、4欄、技術判断者の記名、改廃は判断記録、ゲートの判定の対象にしない、事業の軸を再掲しない、様式のコードブロック)。EV-0121(E1)、IMPL-0138(principles-template、delivered、presence)
- 第4章 G-3 基準2 の確認方法を決定どおりに改めた
- テンプレート: `templates/12-product-principles.md`(新設)、`templates/README.md`(13 種へ)、`template-fields.yaml` に t12
- 図: 第6章「原則・判断記録・判定記録の関係」に Mermaid の図(原則 → 判断記録 → 判定記録、判定の対象・材料・証跡の矢印)を置いた

### D-2 判定の対象・材料・証跡

- 第1章 `overview.md` 1.4: 判定の対象・判定の材料・判定の証跡の3行
- 第6章の一覧: 「ゲートとの関係」の列の語を 1.4 の定義に従わせ、G-3 = 材料、G-7 の運用引き継ぎ文書 = 材料に改めた。ほかの行は成果物が対象であることを確かめて残した
- 第4章 G-3: 前文(対象・材料・証跡、判断記録の番号と版)、IMPL-0133(gate-record-template、delivered、presence)。基準1 =「非機能への影響」欄、基準3 =「可逆性」欄
- テンプレ4(本文の様式とテンプレート `04-gate-record.md`): 「判定した判断記録(G-3 のみ)」の行
- テンプレートの G-3 補助ファイル(`gate/gates/G-3.md`): 判定の対象・材料・証跡を書き分けた

### D-3 判断記録の置き場

- テンプレ2 の前文(本文とテンプレート `02-adr.md`)に、独立の文書・統合しない・判定記録は再掲しないを書いた。理由は ADR-0018 決定8 を引いた

### D-4 判断記録の範囲

- 第2章 `lifecycle.md` 2.6 に「### 判断記録の範囲」(例示 5 つ、網羅でない、既存の対象 3 つ、原則・規約は恒久層、可逆性で省いてはならない)
- テンプレート: `/adr-write` の「何を記録するか」から「方針、原則」と「作り直しに近ければ」の目安を外し、2.6 の例示に替えた。description の「判定対象」を「判定の材料」へ
- 機械で下限を導く案は先送り(決定どおり。何も足していない)

### D-5 索引と保管

- テンプレ2 に「### 判断記録の索引」(課さない。置くなら機械生成で、手で保守してはならない)、EV-0122(E1)
- テンプレ2 の「### 置き換えと廃止」に、全部の置き換え・廃止を保管領域へ移す規定、IMPL-0137(adr-template、delivered、presence)
- 第3章 3.11.4: 保管を判断記録へ及ぼす段落(契機は状態だけ、判定者が移す)。要求事項7 に IMPL-0130(agent-settings、delivered、presence)
- フェーズ5 `context-base.md`: 判断記録の保管の文
- テンプレート: `context/_archive/README.md`(7 行目と食い違っていた「移すもの」へ判断記録を足し、「移さないもの」を置いた)、`context/decisions/README.md`、`.claude/settings.json`、`generate-profile.mjs`

### D-6 状態の語彙と両側の参照

- テンプレ2 の様式の冒頭(本文とテンプレート): 状態・置き換える決定・判定者・対象・期限。決定に番号を付ける注記
- 第4章 G-3「記載の検査」の表: 両側の参照と置き場の行(IMPL-0131、decisions-check、delivered、machine)
- `adr/index.md` 運用ルール3〜5: 4 語彙、状態の節だけ書き換え可・本文に含めない、置き換える側が置き換える決定を書く
- 本プロジェクトの ADR 6 件の状態の行(本文は変えていない)

| ADR | 改めた状態の行(要旨) | 突合した置き換える側 |
| --- | --- | --- |
| 0009 | 一部置き換え(→ ADR-0063 の決定2): 決定7 | ADR-0063 の置き換えの表 |
| 0017 | 一部置き換え(→ ADR-0020 の決定2・決定4): 決定2 と決定1 の配置 | ADR-0020 決定2・4 と影響の節 |
| 0032 | 一部置き換え(→ ADR-0063 の決定1): 決定7 | ADR-0063 の置き換えの表 |
| 0035 | 一部置き換え(→ ADR-0060 の決定1): 決定1 の適用範囲 | ADR-0060 のステータスと決定1 |
| 0040 | 一部置き換え(→ ADR-0063 の決定1): 決定5 のただし書き | ADR-0063 の置き換えの表 |
| 0054 | 一部置き換え(→ ADR-0059 の決定1・決定5): 決定4 の一部 | ADR-0059 のステータスと決定1・5 |

### D-7 判断記録の総量・参照実績

- フェーズ6 `metrics.md` に「### 採用しない指標」(3 行の表)と集約の表示の文。IMPL-0139(evidence-aggregation、delivered、machine)
- テンプレート `aggregate-evidence.mjs`: 「判断記録 N 件」を、状態ごとの件数と不一致の件数へ(README を数えない)

### D-8・D-9 文書の量

- 同じ「採用しない指標」の表と文。EV-0123(E1)

### D-10 行数の算定の除外

- 第4章「タスクの分割基準」の除外の箇条を、置き場の散文 + 置き場の外は算定 + 散文の量に基準を置かない、へ。IMPL-0049 の注記を改めた(delivered のまま)。「SLA で判定する」の句に IMPL-0136(evidence-aggregation、**undelivered**、manual)
- フェーズ5 `ci-gates.md` の設計の要点の箇条
- テンプレート `check-pr.mjs`: `isExcludedFromSize`。置き場は `DOC_ONLY_DIRS`(docs・specs・context・templates・evidence・profiles)とリポジトリの直下。強制層・構成(.claude・.github・scripts/gate ほか)の `*.md` は、強制層として従来どおり除く

### D-11 探索の記録の量

- 第2章のステージの表の後に、量は課さない・置き場は #294 で決める、の文

### D-12 減らす手続

- フェーズ6 `improvement-cycle.md` の外側ループに、結果を状態へ反映する手順と、期限超過を四半期の入力にする手順。IMPL-0140(decisions-check、delivered、machine)。件数の削除義務を課さない文
- テンプレ2 の様式に「期限(期限つきの実験として導入した場合)」の欄(→ 5.2)

### D-13 是正の起動

- 第4章 G-5 に「#### 是正の起動」(正本、起点 3、記録 4 項目、3 条件、装置を含む、足す・直す・外す、件数を起動条件にしないを太字)。IMPL-0135(defect-ledger-template、**undelivered**、manual)
- 3.11.4 要求事項2 の注記(追記の条件であり昇格の起動ではない)
- フェーズ5 `ci-gates.md`・フェーズ6 `operations-catalog.md`・テンプレート `review-checklist.md` の「3回」を目安とし、正本を引く形に。EV-0124(E0)は `ci-gates.md` に置いた

### D-14 設計の有効性と運用の有効性

- 第1章 1.4 に2行
- 第4章 G-5 に「#### 統制の設定の陰性の確認」。IMPL-0134(pr-checks、delivered、presence)、EV-0125(E1)。製品の設定は課さない。周期は定めていない
- フェーズ5 `ci-gates.md` の PR 単位の検査の表に行
- 附属書H `assurance-case.md` 項目4 の参照先を G-5 の新設の節へ。I.11 ⑦は手順の例として引く
- テンプレート: `check-pr.mjs` の 3b、PR テンプレートの節

### D-15 範囲の外と食い違い

| # | 反映 |
| --- | --- |
| 原則5・6 | ADR-0071 決定9 に記録(原則6 は閉じる、原則5 は #290) |
| 1 | D-4 のとおり |
| 2 | D-2 のとおり |
| 3 | 本文の欄名を「可逆性」欄へ。テンプレートの値を2値(戻せる選択か: はい / いいえ、戻せなくなるもの)へ。旧い3つ目の欄(変えるとしたら必要なこと等)は任意の補足表に残した |
| 4 | `integrated.yaml` の G-1〜G-4・G-6〜G-8 の `decisions` を `[通過 / 差し戻し]` へ。G-5 は既に `通過 / 差し戻し(マージ不可)` で ADR-0036 の2値に沿うため変えていない。hybrid・waterfall の yaml は対象外(G 番号のゲートでない) |
| 5 | ADR-0071 決定9 に記録 |
| 6・7 | D-5 のとおり |
| 8 | D-6 の表のとおり |
| 9 | D-7 と IMPL-0132(undelivered) |
| 10 | D-10 のとおり |
| 11 | 別 Issue(6 章) |
| 12 | 要求事項7 に IMPL-0130 を付け、テンプレートで実装。要求事項6 は #292 |
| 13 | D-13 のとおり |
| 02-adr.md の理由欄 | 「理由欄は人が書く」を 5.7.3 の限定(R1 の決定と例外承認)へ合わせた |

## 2. 番号の割り当て(この担当が使ったもの)

| 番号 | 所在 | 対象 |
| --- | --- | --- |
| ADR-0071 | `adr/0071-structure-of-principles-decisions-and-gate-records.md` | D-1〜D-6、D-15 の記録 |
| ADR-0072 | `adr/0072-document-volume-is-not-a-metric.md` | D-7〜D-12 |
| ADR-0073 | `adr/0073-corrective-action-by-impact-and-control-effectiveness.md` | D-13・D-14 |
| EV-0121 | 第6章 テンプレ12 | D-1 原則を義務にしない(E1) |
| EV-0122 | 第6章 テンプレ2「判断記録の索引」 | D-5 索引を課さない(E1) |
| EV-0123 | フェーズ6 運用メトリクス「採用しない指標」 | D-8・D-9(と D-7)文書の量を指標にしない(E1) |
| EV-0124 | フェーズ5 CI ゲート「人が毎回指摘すること」 | D-13 件数の目安「3回」(E0) |
| EV-0125 | 第4章 G-5「統制の設定の陰性の確認」 | D-14(E1) |
| IMPL-0130 | 第3章 3.11.4 要求事項7 | agent-settings / delivered / presence |
| IMPL-0131 | 第4章 G-3 記載の検査 | decisions-check / delivered / machine |
| IMPL-0132 | 第4章 G-3 記載の検査 | decisions-check / **undelivered** / manual |
| IMPL-0133 | 第4章 G-3 前文 | gate-record-template / delivered / presence |
| IMPL-0134 | 第4章 G-5 統制の設定の陰性の確認 | pr-checks / delivered / presence |
| IMPL-0135 | 第4章 G-5 是正の起動 | defect-ledger-template / **undelivered** / manual |
| IMPL-0136 | 第4章 タスクの分割基準(SLA の句) | evidence-aggregation / **undelivered** / manual |
| IMPL-0137 | 第6章 テンプレ2 置き換えと廃止 | adr-template / delivered / presence |
| IMPL-0138 | 第6章 テンプレ12 | principles-template / delivered / presence |
| IMPL-0139 | フェーズ6 運用メトリクス | evidence-aggregation / delivered / machine |
| IMPL-0140 | フェーズ6 改善サイクル | decisions-check / delivered / machine |

`src/data/impl-targets.yaml` に足した降ろし先: agent-settings、decisions-check、adr-template、principles-template、defect-ledger-template、pr-template(pr-template は今回のマークでは使っていない。PR テンプレートの節は pr-checks のマーク IMPL-0134 が覆う)。

## 3. 変更したファイル

本体:

- `src/content/docs/phase4-process-design/overview.md`(1.4)
- `src/content/docs/phase4-process-design/lifecycle.md`(2.6)
- `src/content/docs/phase4-process-design/roles-responsibilities.md`(3.11.4)
- `src/content/docs/phase4-process-design/gate-criteria.md`(G-3、G-5、タスクの分割基準)
- `src/content/docs/phase4-process-design/deliverable-templates.md`(一覧、関係の図、テンプレ2・4・12)
- `src/content/docs/phase4-process-design/assurance-case.md`(附属書H 項目4)
- `src/content/docs/phase5-implementation/ci-gates.md`、`context-base.md`
- `src/content/docs/phase6-operation/metrics.md`、`improvement-cycle.md`、`operations-catalog.md`
- `src/content/docs/adr/0071-*.md`・`0072-*.md`・`0073-*.md`(新設)、`adr/index.md`
- `src/content/docs/adr/0009・0017・0032・0035・0040・0054`(状態の行だけ)
- `src/content/docs/community/evidence-ledger.md`・`implementation-ledger.md`(自動生成)
- `src/data/impl-targets.yaml`、`provision-forms.yaml`、`template-fields.yaml`、`processes/integrated.yaml`
- `scripts/check-template-drift.mjs`(`TEMPLATE_FILES` にテンプレ12 の1行)

テンプレート(`template/`):

- 新設: `scripts/gate/check-decisions.mjs`、`scripts/gate/test-decisions.mjs`、`templates/12-product-principles.md`
- 変更: `.claude/settings.json`、`.claude/skills/adr-write/SKILL.md`、`.claude/skills/artifact/artifacts/02-adr.md`、`.claude/skills/gate/gates/G-3.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/workflows/gate-g5.yml`、`context/_archive/README.md`、`context/decisions/README.md`、`context/standards/review-checklist.md`、`scripts/gate/aggregate-evidence.mjs`、`scripts/gate/check-pr.mjs`、`scripts/gate/test-check-pr.mjs`、`scripts/gate/test-init-g5.mjs`、`scripts/init/generate-profile.mjs`、`scripts/vendor/tailoring-kb.json`(`npm run template:kb` の再生成)、`templates/02-adr.md`、`templates/04-gate-record.md`、`templates/README.md`

## 4. 検査と試験の結果

| 検査・試験 | 結果 |
| --- | --- |
| `npm run check`(本体) | 下の「4.1」 |
| `template/scripts/gate/test-check-pr.mjs` | 93 場面と付随の確認が一致(作業前 81) |
| `test-check-delegation.mjs` | 39 件一致(変わらず) |
| `test-recalibration.mjs` | 14 件一致(変わらず) |
| `test-roster-rules.mjs` | 69 件一致(変わらず) |
| `test-init-g5.mjs` | 80 件一致(作業前 78。保管領域の拒否の確認をタグごとに足した) |
| `test-decisions.mjs`(新設) | 22 件一致 |
| `check-decisions.mjs`(テンプレート自身) | 不一致 0 件、終了コード 0 |
| `aggregate-evidence.mjs`(テンプレート自身) | 出力に「判断記録(状態ごと): 採用 0 件 / …」「不一致件数: 0 件」が出ることを確認。終了時の `::error::`(PR を経ていないコミット ec8ecd6 のトレーラ欠落)は作業前からの既存の指摘で、本変更と無関係 |

### 4.1 `npm run check`

- 1 回目: textlint の 9 件(本変更の文。助詞の重複・読点・文の長さ)で失敗。文を直した
- 2 回目: 複製の検査(`check-template-drift.mjs`)が、テンプレ12 の配布ファイルを対応表に持たないとして失敗。`TEMPLATE_FILES` に `12: '12-product-principles.md'` を足した(様式を配布した以上、対応表へ載せるのが同ファイルの規約)
- 3 回目: **通過**(終了コード 0)。末尾は「All internal links are valid.」「302 page(s) built」「Complete!」

## 5. 決定どおりにできなかった箇所、決定に明記が無く帰結として書いたもの

### 5.1 決定どおりにできなかった・降ろしていないもの

- IMPL-0132(G-3 の欄が空・単一の値・「なし」の機械の検査): テンプレートに実装していない。決定の D-15 #9 が `undelivered` を指示したとおり
- IMPL-0135(是正の記録の様式): テンプレートに様式を置いていない。決定は様式の新設を指示していないため、降りていないことを表示した
- IMPL-0136(文書だけの変更の SLA): 決定どおり `undelivered`

### 5.2 決定に明記が無く、帰結として書いたもの

- **D-14 の置き場**: 決定は「第5章 PR 単位の検査に置く」と書く。PR 単位の検査の規定は第4章 G-5 にあり(第5章に該当の節は無い)、フェーズ5 の CI ゲート構成はそれを参照する側である。会議体の意見書も G-5 に置く案だった。規定は第4章 G-5 に置き、フェーズ5 の表に行を足した。ADR-0073 決定6 にこの読みを書いた
- **G-3 基準2 の「状態が採用の判断記録」**: 決定の文のとおりにした。一部置き換えの判断記録にも効いている決定が残るが、突合先に含めていない(6 章へ)
- **テンプレ2 の「期限」の欄**: D-12 の「期限の記録があるので機械で拾える」の帰結として、様式の冒頭に任意の欄を置いた。継続の書き方「採用(日付)。継続(日付)」も帰結として定めた
- **3.11.4 要求事項3 を判断記録の保管に掛けない**: 要求事項3(期間の経過で移す)を判断記録に掛けると、効いている判断記録が期間で移る。D-5 の「同じ変更で移す」から、契機は状態だけとした
- **リポジトリの直下の `*.md`**: D-10 の「構成が宣言する文書の置き場」に、README などのリポジトリの直下を含めた。構成ファイルで置き場を宣言する鍵は足していない(置き場はテンプレートの `DOC_ONLY_DIRS` が宣言する)
- **統制の設定のファイルの範囲**: 決定の列挙(閾値・除外・必須の検査・ルールセット・フック・権限)を、テンプレートでは閾値・除外設定のファイル(アダプタの分を含む)、構成の `ci`・`task`・`guard`、`.claude/settings.json`・`.claude/guard.json`・`.claude/hooks/**`、`.github/workflows/**`・`.github/rulesets/**`、`CODEOWNERS` に当てた。区分の下限の規則(`riskFloor`)は含めていない(既存の R2 の下限と同時変更の禁止が掛かる)
- **IMPL-0132 の束ね方**: 記載の検査の機械の3行(欄が空・単一の値・「なし」)を1つのマークにまとめた
- **check-gate-criteria の再生成**: `node scripts/check-gate-criteria.mjs --write` が、G-4 の基準4 の文を第4章の現行の文へ書き戻した。作業前から `integrated.yaml` と第4章がずれていたもので、本変更の判断ではない

### 5.3 決定が前提にした事実との違い

- D-6 の「0021・0047・0056 が既にこの語彙で運用している」: 0021 は「一部を置き換え(日付): …」の形で、語彙は近いが矢印の形ではない。状態の行は変えていない(決定の対象 6 件に入っていないため)
- D-15 #4 の「G-8 の Go / Hold」: G-8 のほか G-1・G-2・G-4・G-6・G-7 も2値と異なっていた。決定どおり全ゲートを直した

## 6. 別 Issue へ送るもの

- G-3 基準2 の突合先に、一部置き換えの判断記録の効いている決定を含めるか(5.2)
- Label Mailbox(`label-mailbox.md`)の「ADRの起草・採否」の語を、「技術上の選択の採否と、判断記録の起草」へ改めるか(起草の意見書が指摘。決定に無いため触れていない)
- `integrated.yaml` の `g-tech-design.deliverables`「判断記録(ADR)案」「アーキテクチャ設計・技術選定案」の語を、判断記録 1 つへ寄せるか(同上)
- 第8章 引き下げの要求事項3 のリンク先が本標準自身の ADR 集を指している(`tailoring-guide.md`。起草の意見書が指摘)
- `rule-candidate` のラベルと、運用メトリクス「ルール化の進み」の「レビュー指摘由来」ラベルが準拠テンプレートに無い(#290。ADR-0073 の影響に記した)
- 本プロジェクト自身の ADR の両側の参照を検査する仕組みが、本体の `npm run check` に無い(D-6 はテンプレートで実装した。本プロジェクトの ADR は旧い様式で、`check-decisions.mjs` の読みをそのまま当てられない)
- 第3章 3.11.4 要求事項7 の記録の4項目(移した理由など)を、判断記録の保管にも求めるか
- 運用メトリクスの正式指標の数(上限 20、表 22)。本文の「この範囲に収まります」は誤り(D-15 #11。#296 と同じ会議体)
- 3.11.4 要求事項6(読み込みのログ)の実装マーク(#292)
- `adr/index.md` 運用ルール1(対象に「プロセス上の原則」を含む)は本プロジェクト自身の運用であり、採用組織向けの 2.6 と書き分けている。触れていない。テンプレートの側の写しは直した

## 7. 突合の指摘への対応(`crosscheck.md` X-1〜X-8、Y-1〜Y-7、R-1〜R-10)

議長の裁定(コーディネーター経由)に従って直した。`decision.md` は触っていない(X-3 の文は議長が直す)。

### 7.1 要修正

| # | 対応 |
| --- | --- |
| X-1 | ADR-0072 のステータスに「ADR-0047 の決定5 のうち、除く散文を列挙で定める部分を、本 ADR の決定3 で置き換える。ADR-0058 は変えない」を書いた。ADR-0047 の状態の行を「一部置き換え(→ ADR-0058 の決定1・決定3、→ ADR-0072 の決定3)」の形へ改めた(状態の行だけ。ADR-0058 の分は ADR-0058 のステータスと決定1・3 に照らした) |
| X-2 | 第4章 G-3「記載の検査」に「前の判断記録と記述が一致している」の行を戻し(ADR-0024 決定12)、両側の参照の行は別の行にした。IMPL-0132 の注記へ「前の判断記録と記述の一致」を足した(undelivered のまま。実装は無い)。テンプレートの `G-3.md` も同じ |
| X-3 | 基準2 の確認方法を「恒久層(用語集・設計標準・プロダクトの原則)のうち存在するものと、判断記録の置き場に残る判断記録(状態が採用または一部置き換え)との突合」へ。ADR-0071 決定2(見出しと本文。判断記録を恒久層に含めない理由を足した)、第6章の関係図(「置き場に残るほかの判断記録」の節点と矢印)と箇条、テンプレ4 の注記、テンプレートの 5 か所(`G-3.md`・`artifacts/02-adr.md`・`04-gate-record.md`・`12-product-principles.md`)を揃えた |
| X-4 | `roles-responsibilities.md` の「要求事項3 の集約は…掛かりません」と「移す判断は状態を決めた判定者が行います」を削り、裁定の文(G-3 の帰結の事務であり ADR-0025 決定8・10・11 の忘却の判断ではない、決定9 は及ぼす)と、記録の4項目の所在の表を置いた。`context-base.md` の判断記録の段落に「次の『誰が外すか』が扱う判断ではない。外した者はその G-3 の判定者」を足した。ADR-0071 決定7 に同じ関係を記録した。テンプレートの `/adr-write` 手順3 と `context/_archive/README.md` も同じ形へ。5.2 の「要求事項3 を期間の経過と読んだ」記述は誤読であり、この対応で置き換えた |
| X-5 | 第4章 G-5「是正の起動」に、出荷後の Sev1・Sev2 の是正の記録はインシデント対応のポストモーテムとし、4項目を含めること、別の記録を作らないことを置いた。`incident-response.md` のポストモーテムの様式に「是正の起動(第4章 G-5)」の節(4項目)を足した。`qms-document-control.md` の是正処置の行の先頭に G-5「是正の起動」を置いた。降ろし先 `incident-artifact`(`.claude/skills/artifact/artifacts/incident.md`)を登録し、IMPL-0141(delivered、presence)を置いた。テンプレートの補助ファイルの手順に4項目を足した。IMPL-0135 は、欠陥注入の見逃しと統制の弱化の検知を起点とする記録に限り、undelivered のまま残した(様式が無い)。ADR-0073 決定2 と影響に記した |
| X-6 | テンプレートの 3 か所(`templates/05-handover.md`、`artifacts/05-handover.md`、`scripts/gate/next.mjs`)を「G-7 の判定の材料(基準4。判定の対象は出荷)」へ。廃した言い回しに「G-7 の判定対象」「(G-7)の判定対象」の2形を足した |
| X-7 | `.github/ISSUE_TEMPLATE/adr.yml` の description を 2.6 の範囲へ、可逆性の欄の説明をテンプレ2 の2値へ。`context/projects/README.md` の書き戻し先を「設計上の選択 → decisions」「原則・規約 → standards」へ |
| X-8 | 第6章 テンプレ12 に「### 置く場合の規定(適用: プロダクトの原則を置いた場合)」を立て、箇条の各行にも「原則を置いた場合」を書いた。テンプレートの「## 書き方」の見出しに適用を併記した。適用範囲の台帳を再生成した(18 件) |

### 7.2 推奨

| # | 対応 |
| --- | --- |
| Y-1 | 直した。ADR-0021(→ ADR-0069 の決定7)、ADR-0047(X-1)、ADR-0056(→ ADR-0057 の決定2・決定7・決定13。決定3 の一部の置き換えは ADR-0057 決定13 の表が定めるため 13 を挙げた)の状態の行だけを改めた |
| Y-2 | 第1章 1.4「工程ゲート」の定義だけを「判定の対象(本表『判定の対象』)を次工程へ進めてよいか」へ改めた。第4章冒頭の表・共通ルール・第2章の表の「この成果物を次工程へ進めてよいか」は直していない。ADR-0036 決定2 が定めた問いの文言そのものであり、D-2 の議論で「語彙の決定であって対象の定義ではない」と決着している。用語の表の中の字面の衝突だけを解いた |
| Y-3 | 本文と ADR-0072 の「構成が宣言する文書の置き場」を「準拠の構成が文書の置き場と定める場所」へ改めた(構成ファイルで宣言するとは限らないため)。構成ファイルに置き場の鍵は足していない。ci-gates の設計の要点に、直下と強制層の `*.md` を除く理由を一文で足した |
| Y-4 | G-5 の文を「起点に当たるものは是正の起動の記録で、当たらないものは CI ゲートの見直し(運用カタログ)で技術判断者が決める。いずれも件数を義務の起動条件にしない」へ改めた |
| Y-5 | 検査は緩めていない(D-6 は欄を必須にした)。`context/decisions/README.md` に既存の判断記録の移行の手順(各判断記録へ `- 置き換える決定: なし` を足す)を書いた |
| Y-6 | 直した。`/artifact` の一覧に `12` の行と補助ファイル `artifacts/12-product-principles.md`(新設)を足した。`templates/12-product-principles.md` に `owner`・`scope` の前付けを置いた |
| Y-7 | ADR-0072 決定5 に期限の欄と継続の書き方を一文で足した。ci-gates の陰性の確認の行の「失敗させない」の列に「基底の構成が未設定」を足した。`CONTROL_FILES` の範囲は ci-gates の行に既に列挙しているため、ADR には足していない |

### 7.3 記録のみ

R-1〜R-10 は確認した。R-5(運用メトリクスの指標の数)の別 Issue の起票は、議長の作業として残す。R-6(テンプレートの可逆性の補足の表)は作業前からある欄で、本 Issue では変えていない。

### 7.4 再実行の結果

- テンプレートの試験: test-check-pr 93、test-check-delegation 39、test-recalibration 14、test-roster-rules 69、test-init-g5 80、test-decisions 22、いずれも一致。`check-decisions.mjs` 不一致 0 件
- `npm run check`: 1 回目は textlint の 2 件(ADR-0071・0072 の今回の文)で失敗し、文を直した。2 回目は**通過**(終了コード 0。「302 page(s) built」「Complete!」)
- 台帳: `evidence:write`(103 件、変化なし)、`impl:write`(IMPL-0141 を追加)、`scope:write`(18 件)、`check-gate-criteria --write`、`template:kb` を再実行した

### 7.5 番号

| 番号 | 所在 | 対象 |
| --- | --- | --- |
| IMPL-0141 | 第4章 G-5 是正の起動 | incident-artifact / delivered / presence |
