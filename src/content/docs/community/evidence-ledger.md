---
title: 根拠水準の台帳
description: 実証に基づかない値や未検証の前提として本サイトにマークされた記述の一覧。見直し期限の早い順に並ぶ
sidebar:
  order: 6
---

本サイトの規程のうち、**根拠の水準が E3(独立した複数の測定)に達していない記述**の一覧です。書式と運用は[根拠水準のマーク規約](/process-compass/community/evidence-marking/)によります。

このページは `scripts/check-evidence.mjs` が自動生成します。**直接編集しないでください**。

<!-- evidence-ledger:start -->

| 識別子 | 対象 | 根拠 | 見直し | 差し替え条件 | 記載箇所 |
| --- | --- | --- | --- | --- | --- |
| EV-0001 | 連続失敗3回・無進捗2回という停止条件の初期値 | E0(なし) | 2027-02 | 3か月分の停止記録と、そこから算出した誤検知率 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0002 | 同一論点の応酬3往復というエスカレーションの閾値 | E0(なし) | 2027-08 | 自組織における、往復回数と合意到達率の記録 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0003 | 締切の2営業日前・前営業日という督促の時点 | E0(なし) | 2027-08 | 自組織における、督促の時点別の応答率 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0004 | 抜き取り数(当月の全件と5件のいずれか少ないほう)と、切替を停止する条件(逸脱が2期連続) | E0(なし) | 2027-08 | 自組織における、抜き取り数別の逸脱検出率 | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| EV-0005 | L0 の既定値(変更行数・ファイル数・層数) | E1(間接) | 2027-08 | 自組織の実測4四半期分、または行数上限そのものを検証した研究 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| EV-0006 | L2 において行数上限を規範から外せるという判断 | E2(単一事例) | 2027-08 | モノレポ・大規模テスト基盤を前提としない組織からの一次事例 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| EV-0007 | 母数の下限(各群30件・2四半期)と、判別の目標(中央値2倍差) | E0(なし) | 2027-08 | 自組織で得た審査時間の分散と、そこから算出した必要標本数 | [phase5-implementation/review-burden-measurement](/process-compass/phase5-implementation/review-burden-measurement/) |
| EV-0008 | 教育の階層構成と、任命基準の確認手続の設計全体 | E0(なし) | 2027-08 | 確認を通過した者と通過しなかった者の、実務での判定品質の差の記録 | [phase5-implementation/enablement](/process-compass/phase5-implementation/enablement/) |
| EV-0009 | 初期の合格水準を分布の下位四分位に置くという手続 | E0(なし) | 2027-08 | 3期分の較正記録と、水準の変更がテストの検出力へ与えた影響の観測 | [phase5-implementation/test-effectiveness](/process-compass/phase5-implementation/test-effectiveness/) |

<!-- evidence-ledger:end -->

## 読み方

- **根拠 E0(なし)** — 運用を開始するために置いた値・設計。自組織で採用する場合、この値をそのまま基準にしないでください
- **根拠 E1(間接)** — 隣接領域の知見はあるが、この文脈での測定はない
- **根拠 E2(単一事例)** — 一次事例が1件。前提条件が異なる組織では成立しない可能性がある

**見直し期限は、その時点で内容を変えるという意味ではありません**。差し替え条件が満たされたかどうかを確認する時期です。満たされていなければ、期限を延ばして記録を続けます。
