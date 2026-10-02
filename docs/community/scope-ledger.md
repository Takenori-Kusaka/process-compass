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
| AIエージェント安全リスクアセスメント | 物理的な危険源・R1 の変更種別・本番到達・L2 以上のいずれか | 変更ごと | [phase4-process-design/deliverable-templates](/process-compass/phase4-process-design/deliverable-templates/#aiエージェント安全リスクアセスメント適用-物理的な危険源r1-の変更種別本番到達l2-以上のいずれか) |
| 委任の変更は判定の時点を事後へ移す | CL0・R3 の変更 | 変更ごと | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#委任の変更は判定の時点を事後へ移す適用-cl0r3-の変更) |
| 未達のまま出荷する場合の例外承認 | R1 の変更 | 変更ごと | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/#未達のまま出荷する場合の例外承認適用-r1-の変更) |
| 5.5.4 委任の条件 | CL0・R3 の変更 | 変更ごと | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/#554-委任の条件適用-cl0r3-の変更) |
| 5.7.3 選択肢の比較 | R1 の決定・例外承認 | 変更ごと | [phase4-process-design/human-ai-boundary](/process-compass/phase4-process-design/human-ai-boundary/#573-選択肢の比較適用-r1-の決定例外承認) |
| 委任を適用した変更 | CL0・R3 の変更 | 変更ごと | [phase4-process-design/review-guide](/process-compass/phase4-process-design/review-guide/#委任を適用した変更適用-cl0r3-の変更) |
| 入力の分離 | 確認側の担い手に AI を置く場合 | その他 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#入力の分離適用-確認側の担い手に-ai-を置く場合) |
| B-3 設計審査会 | S2 スケール、または安全・法規制の対象となる機能 | 機能ごと | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/#b-3-設計審査会適用-s2-スケールまたは安全法規制の対象となる機能) |
| 外部の確認者を高リスクの変更へ集中させる | チーム規模 1〜2名 | その他 | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#外部の確認者を高リスクの変更へ集中させる適用-チーム規模-12名) |
| 事後監査の手続 | 委任を適用した R3 の変更。体制の規模によらない | 変更ごと | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/#事後監査の手続適用-委任を適用した-r3-の変更体制の規模によらない) |

<!-- scope-ledger:end -->

## 網羅していないもの

**注記の付いていない条項に、適用範囲が無いとは限りません**。本台帳が保証するのは、注記を付けた条項について適用範囲と判定の単位が明示されていることだけです。

検査は、限定表現を地の文へ置いた節を機械的に警告しますが、**言い換えられた限定は検出できません**。[実装マークの規約](/process-compass/community/implementation-marking/)と同じ限界です。この限界を隠さずに運用します。
