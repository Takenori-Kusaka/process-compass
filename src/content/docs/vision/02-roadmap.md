---
title: ロードマップ(6フェーズ)
description: プロジェクト全体の進め方
sidebar:
  order: 2
---

本プロジェクトは以下の6フェーズで進めます。

```mermaid
graph LR
  P1[1. 現状調査] --> P3[3. ギャップ分析]
  P2[2. AIDLC・理想形調査] --> P3
  P3 --> P4[4. 詳細プロセス策定]
  P4 --> P5[5. プロセス実装]
  P5 --> P6[6. プロセス運用]
  click P1 "/process-compass/phase1-current-state/overview/" "フェーズ1の詳細へ"
  click P2 "/process-compass/phase2-aidlc/overview/" "フェーズ2の詳細へ"
  click P3 "/process-compass/phase3-gap-analysis/overview/" "フェーズ3の詳細へ"
  click P4 "/process-compass/phase4-process-design/overview/" "フェーズ4の詳細へ"
  click P5 "/process-compass/phase5-implementation/overview/" "フェーズ5の詳細へ"
  click P6 "/process-compass/phase6-operation/overview/" "フェーズ6の詳細へ"
```

図の各フェーズはクリックすると詳細ページへ移動できます(ドリルダウン閲覧の様式は [ADR-0006](/process-compass/adr/0006-representation-policy/) で定義)。

| フェーズ | 内容 | 期間目安 |
| --- | --- | --- |
| 1. 現状調査 | 既存の開発プロセス(ウォーターフォール、アジャイル、スクラム、TDD、DDD、イベント駆動、仕様駆動、AIDLC)を、ロール・ゲート・成果物・レビューまで踏み込んで体系化 | 3〜4ヶ月 |
| 2. AIDLC・理想形調査 | 生成AIを組み込んだときに期待される理想の開発プロセスを整理 | — |
| 3. ギャップ分析 | フェーズ1と2を突合し、差分と生成AIが入る余地を整理 | — |
| 4. 詳細プロセス策定 | 現実的な統合プロセスを詳細に定義 | — |
| 5. プロセス実装 | Git戦略、CI/CDゲート、AI実行環境、コンピューティングリソースなど、プロセスを動かす仕組みの設計 | — |
| 6. プロセス運用 | 策定したプロセスを継続運用するための運用プロセス・運用作業の定義 | — |

フェーズ1と2は並行して進められます。各フェーズの成果は随時このサイトで公開し、フィードバックを反映します。
