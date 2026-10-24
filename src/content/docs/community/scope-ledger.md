---
title: 適用範囲の台帳
description: 適用範囲が限定される条項の一覧と、その判定が案件ごとか変更ごとかの区別
sidebar:
  order: 9
---

本ページは自動生成です。**手で編集しないでください**。更新は `npm run scope:write` によります。書式と運用は[適用範囲の書き方](/process-compass/community/scope-marking/)によります。

## 読み方

**「判定の単位」を先に見てください**。ここを取り違えると、適用範囲を機械的に外す誤りが起きます。

| 単位 | 意味 | 案件単位で適用外にできるか |
| --- | --- | --- |
| 案件ごと | 安全重要度(CL)など、案件の構成で確定する条件による | できる |
| 変更ごと | リスク区分(R)など、変更ごとに判定する条件による | **できない**。変更のたびに判定する |

**案件の安全重要度から、リスク区分に依存する条項の適用外を導いてはなりません**([ADR-0039](/process-compass/adr/0039-scope-in-heading-and-unit-of-judgement/))。CL0 の案件でも、認証・認可・個人データ・外部インタフェースに触れる変更は R1 です。

## 一覧

<!-- scope-ledger:start -->

| 条項 | 適用範囲 | 判定の単位 | 記載箇所 |
| --- | --- | --- | --- |
| 置く場合の規定 | プロダクトの原則を置いた場合 | その他 | [phase4-process-design/deliverable-templates](/process-compass/phase4-process-design/deliverable-templates/#置く場合の規定適用-プロダクトの原則を置いた場合) |
| AIエージェント安全リスクアセスメント | 物理的な危険源・R1 の変更種別・本番到達・L2 以上のいずれか | 変更ごと | [phase4-process-design/deliverable-templates](/process-compass/phase4-process-design/deliverable-templates/#aiエージェント安全リスクアセスメント適用-物理的な危険源r1-の変更種別本番到達l2-以上のいずれか) |
| 承認レビューを判定記録とする条件 | G-6。規制業の監査対応書式を除く | その他 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#承認レビューを判定記録とする条件適用-g-6規制業の監査対応書式を除く) |
| 委任の変更は判定の時点を事後へ移す | CL0・R3 の変更 | 変更ごと | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#委任の変更は判定の時点を事後へ移す適用-cl0r3-の変更) |
| 未達のまま出荷する場合の例外承認 | R1 の変更 | 変更ごと | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#未達のまま出荷する場合の例外承認適用-r1-の変更) |
| 変更の要求を経ないコミット | PR を経ずに既定ブランチへ入れるコミット | その他 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#変更の要求を経ないコミット適用-pr-を経ずに既定ブランチへ入れるコミット) |
| 基準値を超えた変更の扱い | 規模の基準値を超えた PR | その他 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#基準値を超えた変更の扱い適用-規模の基準値を超えた-pr) |
| AI 品質指標の扱い | AI が関与した成果物の品質を比率で扱う場合。傾向の確認と第5章 5.4.6 の検知条件を含む | その他 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#ai-品質指標の扱い適用-ai-が関与した成果物の品質を比率で扱う場合傾向の確認と第5章-546-の検知条件を含む) |
| 新規に変更した範囲へ限定する | G-5 基準3 以外の定量条件 | その他 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#新規に変更した範囲へ限定する適用-g-5-基準3-以外の定量条件) |
| 登録した変更種別での停止 | 5.5.4 で登録した変更種別 | その他 | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/#登録した変更種別での停止適用-554-で登録した変更種別) |
| 5.5.4 委任の条件 | CL0・R3 の変更 | 変更ごと | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/#554-委任の条件適用-cl0r3-の変更) |
| 5.7.3 選択肢の比較 | R1 の決定・例外承認 | 変更ごと | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/#573-選択肢の比較適用-r1-の決定例外承認) |
| 2.10.2 規模の合意 | 事業ステージのスコープ3層の規模の合意 | ステージごと | [phase4-process-design/lifecycle](/process-compass/phase4-process-design/lifecycle/#2102-規模の合意適用-事業ステージのスコープ3層の規模の合意) |
| 既存のリポジトリで適用を始める場合 | 既存のコードと履歴を持つリポジトリで適用を始める案件 | その他 | [phase4-process-design/overview](/process-compass/phase4-process-design/overview/#既存のリポジトリで適用を始める場合適用-既存のコードと履歴を持つリポジトリで適用を始める案件) |
| 委任を適用した変更 | CL0・R3 の変更 | 変更ごと | [phase4-process-design/review-guide](/process-compass/phase4-process-design/review-guide/#委任を適用した変更適用-cl0r3-の変更) |
| 席の責任者でない確認者の力量 | 承認を独立した人の確認に数える人 | その他 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#席の責任者でない確認者の力量適用-承認を独立した人の確認に数える人) |
| 入力の分離 | 確認側の担い手に AI を置く場合 | その他 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#入力の分離適用-確認側の担い手に-ai-を置く場合) |
| B-3 設計審査会 | S2 スケール、または安全・法規制の対象となる機能 | 機能ごと | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#b-3-設計審査会適用-s2-スケールまたは安全法規制の対象となる機能) |
| 3.12.12 能力依存の定数の再評価 | 能力依存として登録した定数 | その他 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#31212-能力依存の定数の再評価適用-能力依存として登録した定数) |
| 外部の確認者を高リスクの変更へ集中させる | チーム規模 1〜2名 | その他 | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#外部の確認者を高リスクの変更へ集中させる適用-チーム規模-12名) |
| 事後監査の手続 | 委任を適用した R3 の変更。体制の規模によらない | 変更ごと | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#事後監査の手続適用-委任を適用した-r3-の変更体制の規模によらない) |
| S0 の省略が成立する前提 | 事業ステージ S0 で、標準品質かつ CL0 の構成 | ステージごと | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#s0-の省略が成立する前提適用-事業ステージ-s0-で標準品質かつ-cl0-の構成) |
| 判定の結果を受け取る者を決める | 判定を置いた組織と、判定の対象を作成した組織が異なる場合 | その他 | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#判定の結果を受け取る者を決める適用-判定を置いた組織と判定の対象を作成した組織が異なる場合) |
| 既存規程との併存(移行期の措置) | 既存の規程を持つ組織 | その他 | [phase5-implementation/enablement](/process-compass/phase5-implementation/enablement/#既存規程との併存移行期の措置適用-既存の規程を持つ組織) |
| 規模の基準値 | 規模の基準値を超えた PR | その他 | [phase5-implementation/pr-workflow](/process-compass/phase5-implementation/pr-workflow/#規模の基準値適用-規模の基準値を超えた-pr) |

<!-- scope-ledger:end -->

## 網羅していないもの

**注記の付いていない条項に、適用範囲が無いとは限りません**。本台帳が保証するのは、注記を付けた条項について適用範囲と判定の単位が明示されていることだけです。

検査は、限定表現を地の文へ置いた節を機械的に警告しますが、**言い換えられた限定は検出できません**。[実装マークの規約](/process-compass/community/implementation-marking/)と同じ限界です。この限界を隠さずに運用します。
