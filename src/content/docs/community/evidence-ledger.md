---
title: 根拠水準の台帳
description: 実証に基づかない値や未検証の前提として本サイトにマークされた記述の一覧。見直し期限の早い順に並ぶ
sidebar:
  order: 6
---

本サイトの規程のうち、**根拠の水準が E3(独立した複数の測定)に達していない記述**の一覧です。書式と運用は[根拠水準のマーク規約](/process-compass/community/evidence-marking/)によります。

このページは `scripts/check-evidence.mjs` が自動生成します。**直接編集しないでください**。

<!-- evidence-ledger:start -->

| 識別子 | 対象 | 根拠 | 根拠とした事例 | 見直し | 差し替え条件 | 記載箇所 |
| --- | --- | --- | --- | --- | --- | --- |
| EV-0001 | 連続失敗3回・無進捗2回という停止条件の初期値 | E0(なし) | 未記載 | 2027-02 | 3か月分の停止記録と、そこから算出した誤検知率 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0013 | 応答の期限(A は1週間、B〜D は2週間で区分を返す、E は2週間)と、同種の誤りが3回でルール化を検討するという回数 | E0(なし) | 未記載 | 2027-02 | 本プロジェクトにおける、区分別の応答所要時間の実績 | [community/feedback-workflow](/process-compass/community/feedback-workflow/) |
| EV-0015 | 生成AI起因リスクの一覧の網羅性 | E1(間接) | 未記載 | 2027-02 | 公的なガイドラインの次期改訂と、自組織で観測した生成AI 起因の事象の記録 | [phase6-operation/risk-catalog](/process-compass/phase6-operation/risk-catalog/) |
| EV-0020 | 文脈の同一性によって分離が崩れるという診断、および分離の成立条件3項目 | E2(単一事例) | 未記載 | 2027-02 | 3案件以上での分離の崩れの記録と、崩れた時点で3項目のどれが同一であったかの集計 | [adr/0035-separation-by-execution-context](/process-compass/adr/0035-separation-by-execution-context/) |
| EV-0021 | 決定3(条件付き通過を設けない)。条件を付して進める要求を 7.3 の例外承認だけで受けきれるという判断 | E2(単一事例) | 未記載 | 2027-02 | 案件ごとに次の3つを数える | [adr/0036-gate-closure-by-record](/process-compass/adr/0036-gate-closure-by-record/) |
| EV-0022 | 決定2(追加を一種に限る)。技術判断者ではないロールが引き渡しの経路を必要としないという判断 | E2(単一事例) | 未記載 | 2027-02 | 3案件分の受信箱の運用記録。文脈オーナー・AI運用担当者・移行支援担当あてに、ラベルの無い口頭やコメントでの依頼が観測されれば、経路の欠落として扱う | [adr/0037-label-points-to-lane-not-role](/process-compass/adr/0037-label-points-to-lane-not-role/) |
| EV-0023 | 決定1(性質による定義)。遮断の解除・閾値の緩和・強制層の縮小という3つの性質で、統制の弱化を過不足なく捉えられるという判断 | E2(単一事例) | 未記載 | 2027-02 | 3案件分の引き渡し記録。3つの性質のいずれにも当てはまらない弱化が検知された場合、または当てはまるが弱化ではない変更が多く引き渡された場合は、定義を見直す | [adr/0038-detection-handoff-of-control-weakening](/process-compass/adr/0038-detection-handoff-of-control-weakening/) |
| EV-0024 | 決定2 の検査(限定表現を地の文へ置いた節の警告)。既知の記号を含む限定表現の検出で、過剰適用を招く記述を実用的に拾えるという判断 | E2(単一事例) | 未記載 | 2027-02 | 半年分の検査結果。除外の登録が検出の件数を上回る場合は、検出の条件が広すぎることになる。逆に、過剰適用の申し立てが再び上がり、その条項が検出されていなかった場合は、条件が狭すぎることになる | [adr/0039-scope-in-heading-and-unit-of-judgement](/process-compass/adr/0039-scope-in-heading-and-unit-of-judgement/) |
| EV-0025 | 決定2 の対応表による管理。様式ごとの必須欄を人が選んで登録する方式で、実行層へ降ろすべき欄を実用的に押さえられるという判断 | E2(単一事例) | 未記載 | 2027-02 | 半年分の検査結果と、対応表に載せていなかった欄の欠落に起因する申し立ての件数。申し立てが登録済みの欄の検出件数を上回る場合は、対応表の粒度が粗すぎることになる | [adr/0040-template-forms-as-subset-of-standard](/process-compass/adr/0040-template-forms-as-subset-of-standard/) |
| EV-0026 | 決定3(漏れの向きを併記すれば、読み手が外を見に行けるという判断) | E1(間接) | 未記載 | 2027-02 | 分類の外にある危険源が案件で同定された件数と、そのうち本標準の併記した性質から導かれたものの件数。後者が0件であり続ける場合、併記は機能していないことになります | [adr/0041-scope-is-not-exhaustive](/process-compass/adr/0041-scope-is-not-exhaustive/) |
| EV-0028 | 決定1(参照先を移せば、体系の説明可能性が回復するという判断) | E2(単一事例) | 2026-08-13 の規格突合1回分 | 2027-02 | 稟議・監査の場で本表を提示し、要求の写像を問われた事例。説明できなかった項目が生じた場合、帰属の記述が不足していることになります | [adr/0043-safety-attribution-to-iec61508](/process-compass/adr/0043-safety-attribution-to-iec61508/) |
| EV-0030 | 7.3.2(判定の外に置き場を設ければ、判定へ持ち込まれなくなるという判断) | E1(間接) | JAXA JMR-004D / 英国 Gateway レビュー / NASA の RID/RFA | 2027-02 | 未解決事項として記録された件数と、そのうち期限までに解消した件数。**解消率の低いまま件数が積み上がる状態は、置き場を「判定を避ける先」として使っていることを示します** | [phase4-process-design/exception-escalation](/process-compass/phase4-process-design/exception-escalation/) |
| EV-0031 | 決定5(期限の到来時に検査すれば足りるという判断) | E0(なし) | 未記載 | 2027-02 | 見直し期限が到来したマークのうち、判別不能と判定された件数。**期限到来分の半数を超えて判別不能であった場合、期限を待つ方式では遅すぎることになります** | [adr/0045-replacement-conditions-must-discriminate](/process-compass/adr/0045-replacement-conditions-must-discriminate/) |
| EV-0002 | 同一論点の応酬3往復というエスカレーションの閾値 | E0(なし) | 未記載 | 2027-08 | 自組織における、往復回数と合意到達率の記録 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0003 | 締切の2営業日前・前営業日という督促の時点 | E0(なし) | 未記載 | 2027-08 | 自組織における、督促の時点別の応答率 | [phase4-process-design/roles-responsibilities](/process-compass/phase4-process-design/roles-responsibilities/) |
| EV-0004 | 抜き取り数(当月の全件と5件のいずれか少ないほう)と、切替を停止する条件(逸脱が2期連続) | E0(なし) | 未記載 | 2027-08 | 自組織における、抜き取り数別の逸脱検出率 | [phase4-process-design/tailoring-guide](/process-compass/phase4-process-design/tailoring-guide/) |
| EV-0005 | L0 の既定値(変更行数・ファイル数・層数) | E1(間接) | 未記載 | 2027-08 | 自組織の実測4四半期分、または行数上限そのものを検証した研究 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| EV-0006 | L2 において行数上限を規範から外せるという判断 | E2(単一事例) | 未記載 | 2027-08 | モノレポ・大規模テスト基盤を前提としない組織からの一次事例 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| EV-0007 | 母数の下限(各群30件・2四半期)と、判別の目標(中央値2倍差) | E0(なし) | 未記載 | 2027-08 | 自組織で得た審査時間の分散と、そこから算出した必要標本数 | [phase5-implementation/review-burden-measurement](/process-compass/phase5-implementation/review-burden-measurement/) |
| EV-0008 | 教育の階層構成と、任命基準の確認手続の設計全体 | E0(なし) | 未記載 | 2027-08 | 確認を通過した者と通過しなかった者の、実務での判定品質の差の記録 | [phase5-implementation/enablement](/process-compass/phase5-implementation/enablement/) |
| EV-0009 | 初期の合格水準を分布の下位四分位に置くという手続 | E0(なし) | 未記載 | 2027-08 | 3期分の較正記録と、水準の変更がテストの検出力へ与えた影響の観測 | [phase5-implementation/test-effectiveness](/process-compass/phase5-implementation/test-effectiveness/) |
| EV-0010 | 監査の頻度(四半期)、抽出数(1回あたり5件以上)、無作為とリスクに基づく抽出の半々という配分 | E0(なし) | 未記載 | 2027-08 | 2期分の監査記録から得た、抽出方法別の所見検出率 | [phase6-operation/process-audit](/process-compass/phase6-operation/process-audit/) |
| EV-0011 | レビュアあたりの同時保有数の上限を置くという制御と、その初期値(1人あたり3件) | E0(なし) | 未記載 | 2027-08 | 自組織で測った、同時保有数と審査時間・差し戻し率の関係 | [phase4-process-design/gate-criteria](/process-compass/phase4-process-design/gate-criteria/) |
| EV-0012 | 指標の総数に上限を置くという規定と、その初期値(正式指標20件) | E0(なし) | 未記載 | 2027-08 | 2期分の運用記録から得た、指標ごとの参照回数と打ち手への接続率 | [phase6-operation/metrics](/process-compass/phase6-operation/metrics/) |
| EV-0014 | 本カタログの網羅性、およびカテゴリを内部5・外部5とした分割 | E1(間接) | 未記載 | 2027-08 | 自組織で1年分の事象記録を分類した結果と、どのカテゴリにも収まらなかった件数 | [phase6-operation/risk-catalog](/process-compass/phase6-operation/risk-catalog/) |
| EV-0016 | 演習の所要時間(90分)、inject の間隔(15分)、実施の頻度(半年に1回) | E0(なし) | 未記載 | 2027-08 | 2回分の演習記録から得た、時間内に完了した判断の割合と、参加者の可用性の実績 | [phase6-operation/incident-drill](/process-compass/phase6-operation/incident-drill/) |
| EV-0017 | 本 ADR の決定1〜8 の全体。とくに「体制の欠落が作文の原因である」という因果の主張 | E2(単一事例) | 未記載 | 2027-08 | 決定1〜3 を適用した案件3件分の企画書と G-1 判定記録。および、適用しなかった案件との記述の質の比較 | [adr/0031-market-hypothesis-by-structure-not-fields](/process-compass/adr/0031-market-hypothesis-by-structure-not-fields/) |
| EV-0018 | 稟議へ出す数値を幅の下限値に限るという決定 | E0(なし) | 未記載 | 2027-08 | 下限値の提示で決裁が通った案件と通らなかった案件の内訳。3件以上 | [adr/0032-executive-summary-as-projection](/process-compass/adr/0032-executive-summary-as-projection/) |
| EV-0019 | 投影の8項目の構成と、G.3 の提示の順序 | E0(なし) | 未記載 | 2027-08 | 投影を用いた決裁3件分の記録と、決裁者が不足を指摘した項目の一覧 | [phase4-process-design/executive-projection](/process-compass/phase4-process-design/executive-projection/) |
| EV-0027 | 決定2(SR を手続の入口としてのみ使えば、順序づけを主張せずに運用が成立するという判断) | E1(間接) | NIST SP 800-30 Rev.1 表I-2 | 2027-08 | SR を根拠に低減の優先順位を決めた記録の件数。件数が積み上がる場合、決定2 は守られておらず、実質的に順序づけとして使われていることになります | [adr/0042-sr-does-not-claim-ordering](/process-compass/adr/0042-sr-does-not-claim-ordering/) |
| EV-0029 | 決定1(義務を課さなくても、実務上の不利益が許容範囲に収まるという判断) | E1(間接) | 未記載 | 2027-08 | 既存の部品があったにもかかわらず自前実装したことが事後に判明した件数と、それによる手戻りの規模。**この観測は現在どこにも記録されないため、まず観測の経路を決める必要があります** | [adr/0044-no-search-obligation-for-existing-parts](/process-compass/adr/0044-no-search-obligation-for-existing-parts/) |

<!-- evidence-ledger:end -->

## 読み方

- **根拠 E0(なし)** — 運用を開始するために置いた値・設計。自組織で採用する場合、この値をそのまま基準にしないでください
- **根拠 E1(間接)** — 隣接領域の知見はあるが、この文脈での測定はない
- **根拠 E2(単一事例)** — 一次事例が1件。前提条件が異なる組織では成立しない可能性がある

**見直し期限は、その時点で内容を変えるという意味ではありません**。差し替え条件が満たされたかどうかを確認する時期です。満たされていなければ、期限を延ばして記録を続けます。
