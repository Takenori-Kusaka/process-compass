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
| IMPL-0018 | 未解決事項を技術負債台帳の区分欄で 7.3 由来と区別する | 成果物テンプレート テンプレ3(技術負債台帳) | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |

### 全件

| 識別子 | 規定 | 降ろし先 | 検査 | 状態 | 記載箇所 |
| --- | --- | --- | --- | --- | --- |
| IMPL-0001 | 兼務を禁止する組み合わせ | process.config.json の roles[] | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0002 | 出荷判定者の兼務に限った例外と代償措置 | process.config.json の deviations[] | `verify-gate-contract` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0003 | 実行主体が起動時に参照する内容(判定するゲート・担ってはならない工程・引き渡し先) | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0004 | 指示資産の統合・削除の権限を AI維持管理者へ集約する | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0005 | エスカレーションの発火条件と段階に対応するラベル | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0006 | 目的を達成する構成を示せないゲートを未達として宣言する | process.config.json の unmet[] | `verify-gate-contract` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0007 | ポーリングの対象を自ロールの受信箱に限る | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0008 | 判定記録の作成をもって判定が成立する | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0009 | 工程ゲートの判定の語彙を通過と差し戻しの2値に限る | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0010 | 判定は当該ゲートの判定基準のみで行い次工程の材料の未完成を理由にしない | ゲート判定記録のスキル | `aggregate-evidence` | 降りている | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| IMPL-0011 | 条件を付して先へ進める場合は例外承認の5要求事項を満たす | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |
| IMPL-0012 | ラベルの遷移は判定の成立要件ではなく順序は記録が先 | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0013 | ロールとレーンの写像および受信箱のラベル | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| IMPL-0014 | 統制の弱化を性質で定義し検知の対象とする | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0015 | 検知者は許容可否を判断せず引き渡し先が不明なら価値責任者へ回す | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase5-implementation/label-mailbox](/process-compass/phase5-implementation/label-mailbox/) |
| IMPL-0016 | 選択肢の比較を求める範囲を R1 と例外承認に限る | 成果物テンプレート テンプレ4(ゲート判定記録) | `aggregate-evidence` | 降りている | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/) |
| IMPL-0017 | リスク区分に依存する条項を案件単位で適用外にしない | CLAUDE.md の構成依存部分 | `check-process-rules` | 降りている | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| IMPL-0018 | 未解決事項を技術負債台帳の区分欄で 7.3 由来と区別する | 成果物テンプレート テンプレ3(技術負債台帳) | `aggregate-evidence` | **降りていない** | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |

<!-- implementation-ledger:end -->
