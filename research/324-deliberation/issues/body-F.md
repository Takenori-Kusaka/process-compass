## 背景
#324(実装マークの節の棚卸し)で、降りていない規定(`state=undelivered`)の実装マークが見つかりました(ADR-0140)。領域の合う open の Issue が無かったため、仮に #324 を名指していた分のうち「企画書・AI SLA・品質保証の方針・各種台帳の様式」に当たるものを、この Issue へまとめて送ります。実装マークの `issue=` を本 Issue へ付け替えます。#324 は条文を変えていません。

## 対象のマーク(23 件)
| マーク | 所在 | 降ろし先 | 規定の要旨 |
| --- | --- | --- | --- |
| IMPL-0798 | phase4-process-design/deliverable-templates:1179 | project-brief-template | 外部の比率(交通インフラの需要予測の過大の比率など)を自組織の補正値として用いないこと。 |
| IMPL-0950 | phase4-process-design/deliverable-templates:1261 | project-brief-template | 稟議へ提示する投影(決裁制度への提示の規定1・2)。 |
| IMPL-0857 | phase4-process-design/deliverable-templates:1346 | ai-sla-guide | 金銭措置型は、稼働率など客観的に観測できる量に限って用いること。 |
| IMPL-0957 | phase4-process-design/deliverable-templates:1519 | ai-sla-template | テンプレ8 第7項の6行のうち、「禁止するライセンス」「納品時に提出する記録」「検査で指摘が出た場合の措置」の3行と、検査を AI の利用の有無によらず全件へ適用する旨の注記を、様式に置くこと。 |
| IMPL-0807 | phase4-process-design/deliverable-templates:1553 | ai-sla-template | 独立レビュー(G-6)の置き先にかかわらず、確認者の D-0 表5-2 の区分を変えないこと(発注側に置けば発注側の「体制の内」の人または発注側が置いた外部の確認者、受注側に置けば受注側の同じ区分)。 |
| IMPL-0946 | phase4-process-design/deliverable-templates:1660 | qa-policy-template | テンプレ11 要求事項2 のうち、本標準の適用を決める時点で、本様式の5項目を文書で定め、記名すること(時点の定め)。 |
| IMPL-0945 | phase4-process-design/deliverable-templates:1668 | qa-policy-template | テンプレ11 要求事項9 のうち、受容の基準(項目4)が外枠(項目3)を下回らないこと。 |
| IMPL-0948 | phase4-process-design/deliverable-templates:1672 | qa-policy-template | テンプレ11 要求事項10 のうち、各人が自らの役割と、懸念を記録する経路(第7章 7.11 の停止の申し立て)を認識していることを求めること。 |
| IMPL-0605 | phase4-process-design/exception-escalation:105 | project-brief-template | 案件が、どの事象をどの経路へ送るかの判断基準を、企画承認(G-1)の時点で記録すること。 |
| IMPL-0607 | phase4-process-design/exception-escalation:138 | debt-ledger-template | 未解決事項に対処の担当を定めること。 |
| IMPL-0611 | phase4-process-design/exception-escalation:204 | project-brief-template | 7.4 の乱用を防ぐ制約2。 |
| IMPL-0969 | phase4-process-design/exception-escalation:403 | project-brief-template | 7.7.1: 事業仮説・価値仮説の検証に要する費用(顧客ヒアリング・市場調査・代替品の実地評価・外部への調査委託)を期間予算の内訳として明示すること。 |
| IMPL-0633 | phase4-process-design/exception-escalation:667 | qa-policy-template | 7.7.8 要求事項15。 |
| IMPL-0629 | phase4-process-design/exception-escalation:807 | project-brief-template | 7.9.5 要求事項1。 |
| IMPL-0673 | phase4-process-design/exception-escalation:890 | assumption-ledger-template | 7.10.3 の閾値の数値を、当該の前提に責任を負う者が定め、前提の台帳に記録すること。 |
| IMPL-0540 | phase4-process-design/gate-criteria:600 | adr-template | 事業影響を観測可能な事象で書き、主観的な深刻さの表現を用いないこと。 |
| IMPL-0545 | phase4-process-design/gate-criteria:886 | defect-ledger-template | 再発防止を機械の検査で失敗させる形にするのは、実効的な偽陽性が無い・検出されたものを開発者が修正できる・既存の違反を解消してある、の3つをすべて満たす場合に限ること。 |
| IMPL-0589 | phase4-process-design/gate-criteria:2414 | defect-ledger-template | Sev1・Sev2 を残して次段階へ進むときの既知の不具合の一覧(現象・影響範囲・回避策・解消予定を1件ずつ。 |
| IMPL-0977 | phase4-process-design/gate-criteria:2510 | project-brief-template | 閾値の設定と較正 要求事項1: 傾向の確認と 5.4.6 の検知条件に用いる閾値を G-1 で定め、値・観測の窓・窓の中の最小標本数・値の決め方・次の見直しの時期を記録すること。 |
| IMPL-0645 | phase4-process-design/roles-responsibilities:330 | debt-ledger-template | 3.4.3 要求事項6・7。 |
| IMPL-0902 | phase4-process-design/roles-responsibilities:1870 | project-brief-template | 3.12.7 の、チーム単位の上限に到達したときの扱いを G-1 で合意して記録すること。 |
| IMPL-0753 | phase4-process-design/tailoring-guide:670 | handover-template | 受託の構成のコア理解の維持。 |
| IMPL-0752 | phase4-process-design/tailoring-guide:724 | ai-sla-template | 知財潔白性の結果責任を受注側に負わせる場合に、検査の範囲と手段を契約で特定し、「知財潔白であること」だけを契約に書かないこと。 |

## 受け入れ条件
- [ ] マークごとに、準拠テンプレートへ降ろして `state=delivered` にするか、降ろさないと決めて理由を記録している(採用者に委ねる扱いにするかは、条項の扱いの審議で決める。解決の方法はこの Issue では前提にしない)
- [ ] 各マークの state・note・`plan=`・`review=` を結論に合わせている
- [ ] 準拠テンプレート(`template/`)に及ぶ変更は、コミットのたびに bundle へ退避し、標準側の `npm run check` と合わせて通している

## 準拠テンプレートに及ぶこと
降ろす場合は `template/` の様式・スキル・検査スクリプトに及びます。標準の条項を新設・改廃する場合は、調査・会議体・突合を経ます(コアポリシー)。

所有者の決定(2026-11-15、#324 の付け替え)で起票しました。
