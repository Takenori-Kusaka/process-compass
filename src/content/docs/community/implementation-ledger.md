---
title: 実装台帳
description: 標準の規定と、案件の実行層における降ろし先の対応。降りていない規定を含む
sidebar:
  order: 7
---

本ページは、標準の規定と案件の実行層の対応を一覧にしたものです。書式と運用は[実装マークの規約](/process-compass/community/implementation-marking/)によります。

**自動生成です。手で編集しないでください**。更新は `npm run impl:write` によります。

規定が実行層へ降りていない場合、案件からは「規定がない」ものとして扱われます。降りていない規定は削除せず、**降りていない事実を表示し続けます**。

マークの付いていない規定は本台帳に現れません。**網羅性は保証しません**。

<!-- implementation-ledger:start -->

### 降りていない規定

次の規定は、実行層に対応する記述がありません。**案件からは「規定がない」ものとして扱われます**。

| 識別子 | 規定 | 降ろし先(予定) | 記載箇所 |
| --- | --- | --- | --- |
| IMPL-0023 | 宣言と実態のずれの検出。D-0 の版の不一致は、証跡の集約が記録の欠落として出す。人数と担い手の識別のずれは警告に留まり、変化点の起票へつなぐ処理は降りていない | 出荷判定の証跡の集約(保証の開示) | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0026 | 委任の該当は機械の規則で判定し、行為する AI 自身に判定させない。判定の規則と構成は基底ブランチから読む。AI の確認を承認にも合否条件にもしない。該当の判定は実装、マージの実行は既定で無効、実環境で未確認 | process.config.json の delegation | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0040 | G-7 基準1。計画したテストの消化率を、出荷の証跡の集約で確かめる。計画数と消化数の取り込みが降りていない | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0041 | G-7 基準2。未解決の欠陥を欠陥トリアージ基準と突合する。欠陥の台帳の取り込みが降りていない | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0042 | G-7 基準3。受容した負債の記録漏れの検出。台帳の有無だけを確かめており、変更との突合が降りていない | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0043 | G-7 基準4。運用引き継ぎ文書の3項目の記載の確認。文書の有無だけを確かめている | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0044 | G-7 基準6。AI 品質指標の確認の記録を集約へ取り込む | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0045 | G-7 基準7。安全適合性の検証記録の欠落を集約で確かめる | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0046 | G-7 基準8。類似の検知の実施記録と、期限を超過した未処理の指摘を集約で確かめる。ライセンス検査の実施記録の有無だけを確かめている | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0047 | 欠陥注入の残存を、出荷の証跡の集約で確かめる | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0048 | 委任の期間ごとの保証の開示を、期間を指定して出力し、期間の受容と異議の記録を確かめる。定期の実行は、実際の GitHub 上で確かめていない | 出荷判定の証跡の集約(保証の開示) | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |

### 全件

| 識別子 | 規定 | 降ろし先 | 検査 | 状態 | 記載箇所 |
| --- | --- | --- | --- | --- | --- |
| IMPL-0001 | 兼務を禁止する組み合わせ | process.config.json の roles[] | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0002 | 出荷判定者の兼務に限った例外と代償措置 | process.config.json の deviations[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0003 | 実行主体が起動時に参照する内容(判定するゲート・担ってはならない工程・引き渡し先) | 次の一手のスクリプト(ロールの詳細) | — | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0004 | 指示資産の統合・削除の権限を AI維持管理者へ集約する | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0005 | エスカレーションの発火条件と段階に対応するラベル | 次の一手のスクリプト(ロールの詳細) | — | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0006 | 目的を達成する構成を示せないゲートを未達として宣言する | process.config.json の unmet[] | `verify-gate-contract` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0007 | ポーリングの対象を自ロールの受信箱に限る | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0008 | 判定記録の作成をもって判定が成立する | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0009 | 工程ゲートの判定の語彙を通過と差し戻しの2値に限る | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0010 | 判定は当該ゲートの判定基準のみで行い次工程の材料の未完成を理由にしない | ゲート判定記録の入口のスキル(/gate) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0011 | 条件を付して先へ進める場合は例外承認の5要求事項を満たす | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |
| IMPL-0012 | ラベルの遷移は判定の成立要件ではなく順序は記録が先 | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0013 | ロールとレーンの写像および受信箱のラベル | 次の一手のスクリプト(ロールの詳細) | — | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0014 | 統制の弱化を性質で定義し検知の対象とする | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0015 | 検知者は許容可否を判断せず引き渡し先が不明なら価値責任者へ回す | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0016 | 選択肢の比較を求める範囲を R1 と例外承認に限る | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0017 | リスク区分に依存する条項を案件単位で適用外にしない | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0018 | 未解決事項を技術負債台帳の区分欄で 7.3 由来と区別する | 成果物テンプレート テンプレ3(技術負債台帳) | `aggregate-evidence` | 降りている | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |
| IMPL-0019 | 4種類の判断の確定は席の責任者(人)が行い、AI の担い手へ移さないことを実行層へ書く | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0020 | AI を担い手に置くときの適合性確認(確認を経ない担い手は協働を上限とする) | process.config.json の seats[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0021 | 確認側への入力の分離(3.5.3)と、独立・分離の語の使い分け(3.5.4) | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0022 | 体制の変化点の手続(最初のゲート判定より前に D-0 と構成を改める)と、D-0 の改訂履歴への記録 | process.config.json の changeLog[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0023 | 宣言と実態のずれの検出。D-0 の版の不一致は、証跡の集約が記録の欠落として出す。人数と担い手の識別のずれは警告に留まり、変化点の起票へつなぐ処理は降りていない | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0024 | 承認済みの受入基準とスコープの内側にある作業上の選択は、協働の席でも担い手が決めて記録する。人へ戻す場合(人が確定する判断、基準・公開インタフェース・データ形式を変える選択、取り消せない操作)と経路を担い手へ明示する | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0025 | 席ごとの運用形態の宣言は上限であり、変更ごとのリスク区分が下げる。案件単位で引き上げない | process.config.json の seats[] | `verify-gate-contract` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0026 | 委任の該当は機械の規則で判定し、行為する AI 自身に判定させない。判定の規則と構成は基底ブランチから読む。AI の確認を承認にも合否条件にもしない。該当の判定は実装、マージの実行は既定で無効、実環境で未確認 | process.config.json の delegation | `verify-gate-contract` | **降りていない** | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0027 | G-6 の判定を事後へ移した変更を G-6 の通過として記録せず、人の事前確認を経ていない変更として変更単位で識別する。開発者の席だけが委任で、独立レビュアが事前に承認した変更は G-6 の承認の記録を持ち、委任の識別を別に残す | ゲート判定記録のスキルの G-6 の補助ファイル | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0028 | 体制の変化点の種別を入力として構成の差分・失効と発生の一覧・残作業を出力する | 体制の変化点を反映するスキル | `verify-gate-contract` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0029 | D-0 へ席ごとの責任者・担い手・運用形態・委任の範囲・適合性確認と、体制の変化点の改訂履歴を書く | 成果物テンプレート D-0(体制図) | `check-d0` | 降りている | [phase4-process-design/deliverable-templates](/process-compass/phase4-process-design/deliverable-templates/) |
| IMPL-0030 | 運用形態の上限を案件単位で引き上げず、適合性確認が失効した担い手の確認を検出の層に数えない | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0031 | AI の推定による判定を判定に数えず、記録には指摘の内容と採否を残す | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/assurance-case](/process-compass/phase4-process-design/assurance-case/) |
| IMPL-0032 | 保証の開示を既存の記録からの投影として出力し、未達と未測定を値として表示する。承認は、名簿の人へ対応づき、作成を指示した者でない場合にだけ、独立した人の確認に数える | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | 降りている | [phase4-process-design/assurance-case](/process-compass/phase4-process-design/assurance-case/) |
| IMPL-0033 | 即時に知らせる事象では、通知する者が通知先と通知日を変化点の記録へ書く。未記入の即時通知は記録の欠落として扱う | process.config.json の changeLog[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0034 | 変化点の手続を経ない構成の書き換えを検出する。変更記録は要約値の連鎖を持ち、契約検査が現在の構成との一致と、取り込む先の版の変更記録が保たれていることを確かめる | process.config.json の changeLog[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0035 | 変更種別の登録に、登録の根拠(5.4.6 の検知条件の計測手段、取り消しの実績の所在、既存のテストで検出できることの根拠)を持たせ、未記入の種別は登録を受け付けない。機械が確かめるのは記入の有無まで。テンプレート担当の実装後に主担当が改める | process.config.json の delegation | `verify-gate-contract` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0036 | 席の責任者の任命と交代は D-0 表1 の決定者の記名と理由を要する。決定者の交代は前任の決定者または組織上の任命権者の記名を要する。離脱は発生として記名を待たない。テンプレート担当の実装後に主担当が改める | process.config.json の changeLog[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0037 | 即時通知の事象5・6(G-6 が未達へ変わる変化、出荷判定者の席の責任者の交代)、前任者と品質保証部門の通知先、通知する者と通知先が同一の場合の記録。テンプレート担当の実装後に主担当が改める | process.config.json の changeLog[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0038 | 例外承認の記録が、対象・状態・承認した者・理由・期限を持つ。承認した者の欄を記録者の欄と分ける。テンプレート担当の実装後に主担当が改める | 成果物テンプレート テンプレ3(技術負債台帳) | `aggregate-evidence` | 降りている | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |
| IMPL-0039 | G-6 を適用する体制で、独立した人の確認を経ておらず G-6 を事後へ移してもいない変更を記録の欠落として扱う。挙動要約を伴わない承認を独立した人の確認に数えない。例外承認は、対象の明示・有効な状態・承認した者と理由と期限の記入がある記録だけを対応づける。委任の識別を持つ R3 でない変更を範囲の逸脱として扱う。テンプレート担当の実装後に主担当が改める | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0040 | G-7 基準1。計画したテストの消化率を、出荷の証跡の集約で確かめる。計画数と消化数の取り込みが降りていない | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0041 | G-7 基準2。未解決の欠陥を欠陥トリアージ基準と突合する。欠陥の台帳の取り込みが降りていない | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0042 | G-7 基準3。受容した負債の記録漏れの検出。台帳の有無だけを確かめており、変更との突合が降りていない | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0043 | G-7 基準4。運用引き継ぎ文書の3項目の記載の確認。文書の有無だけを確かめている | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0044 | G-7 基準6。AI 品質指標の確認の記録を集約へ取り込む | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0045 | G-7 基準7。安全適合性の検証記録の欠落を集約で確かめる | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0046 | G-7 基準8。類似の検知の実施記録と、期限を超過した未処理の指摘を集約で確かめる。ライセンス検査の実施記録の有無だけを確かめている | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0047 | 欠陥注入の残存を、出荷の証跡の集約で確かめる | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0048 | 委任の期間ごとの保証の開示を、期間を指定して出力し、期間の受容と異議の記録を確かめる。定期の実行は、実際の GitHub 上で確かめていない | 出荷判定の証跡の集約(保証の開示) | `aggregate-evidence` | **降りていない** | [phase5-implementation/ci-gates](/process-compass/phase5-implementation/ci-gates/) |
| IMPL-0049 | 上限を超える変更を差し戻しの既定とし、例外承認の記録(基底ブランチの台帳の行)がある場合だけ超過を通す。ロックファイル・印のある自動生成ファイル・空白だけの一括整形と、判断記録・機能仕様・設計文書を算定から除く。印の無い生成物と機械的な変換は機械で識別しない | G-5 の PR 単位の検査(pr-rules) | — | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |

<!-- implementation-ledger:end -->
