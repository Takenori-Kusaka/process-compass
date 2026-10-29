---
title: こんなときどうする
description: 開発と運用でよく起きる困りごとを症状から逆引きし、最初の一手・決める人・参照すべき規定・やってはいけないことを示す実務ガイド
sidebar:
  order: 4
---

規程は**引ける状態にあって初めて働きます**。本ページは、困っている人が症状から引ける逆引き表です。原因の分類は[リスクカタログ](/process-compass/phase6-operation/risk-catalog/)が扱います。

## 全体に共通する3つの原則

| # | 原則 | 意味 |
| --- | --- | --- |
| 1 | **報告が先、調査は後** | 報告の時点で原因と経緯の説明を求めない。報告を遅らせる唯一最大の要因が説明の負担である |
| 2 | **迷ったら重いほうへ倒す** | 重大度の判定は当番が単独で即断する。合議にかけない |
| 3 | **上げた先には応答の義務がある** | エスカレーションは丸投げではない。受けた側には期限内に応答する義務が生じる |

原則3を欠く組織では、**エスカレーションしても結局は現場で対応する**状態が定着します。この状態はエスカレーションを名目化させ、次からは誰も上げなくなります。期限と措置は[7.5 判定の滞留に対する措置](/process-compass/phase4-process-design/exception-escalation/)に規定します。

## 壊れた・止まった

| こんなとき | まず何をするか | 決める人 | 参照 |
| --- | --- | --- | --- |
| 本番でサービスが止まった | 重大度を単独で判定し、Sev1・Sev2 なら即時に連絡する | 当番 | [インシデント対応](/process-compass/phase6-operation/incident-response/) |
| データの破損・漏えいが疑われる | Sev1 として扱う。**証拠を消さずに**アクセスを遮断する | 当番 → 事業決裁者 | 同上、[避難訓練の類型D](/process-compass/phase6-operation/incident-drill/) |
| CI が壊れて誰も検証できない | 復旧を当日の最優先の作業に置く。検査を無効化して先へ進めない | 技術判断者 | [CI ゲート](/process-compass/phase5-implementation/ci-gates/) |
| 直せば直すほど壊れる | 修正を止め、変更を戻す。原因の特定を修正より先に置く | 技術判断者 | [挙動検証](/process-compass/phase4-process-design/developer-guide/) |
| 復旧を急いでいて手順を飛ばしたい | 飛ばさない。hotfix でも PR と CI を通す | 技術判断者 | [Git 戦略](/process-compass/phase5-implementation/git-strategy/) |

**検査の除外設定を復旧のために広げてはなりません**。一度広げた除外は、以後すべての通過を無効化します。やむを得ず広げた場合、[内部監査](/process-compass/phase6-operation/process-audit/)の観点4で検出される対象になります。

## 間に合わない

| こんなとき | まず何をするか | 決める人 | 参照 |
| --- | --- | --- | --- |
| リリース直前に重大な不具合が出た | 出荷判定を「未達」として記録する。**「省略」と区別する** | 出荷判定者 | [ADR-0028](/process-compass/adr/0028-unmet-gate-distinct-from-omitted/)、[ゲート判定基準](/process-compass/phase4-process-design/gate-criteria/) |
| 期日に間に合わないと分かった | 増員と残業より先に**スコープの削減を検討する** | 価値責任者 | [スコープの三層](/process-compass/adr/0019-scope-commitment-three-layers/) |
| 期日制約でどうしても手順を縮めたい | ファストトラックを申請する。後回しにできる対象は限定される | 事業決裁者 | [7.4 ファストトラック](/process-compass/phase4-process-design/exception-escalation/) |
| ここまで投じたので中止できない | 中止の判断基準に当てはめる。判断は当事者以外が行う | 事業決裁者 | [7.7.3 中止の判断基準](/process-compass/phase4-process-design/exception-escalation/) |
| レビューが追いつかず滞留している | 負荷を測り、束ねる単位を小さくする | 技術判断者 | [レビュー負荷の測定](/process-compass/phase5-implementation/review-burden-measurement/)、[スタック PR](/process-compass/phase5-implementation/stacked-pr/) |

### 遅延は人の問題ではありません

遅延に対する既定の対処を「もっと働く」に置くと、疲弊が誤りを増やし、遅延がさらに広がります。**遅延はスコープの問題として扱います**。残業で吸収した事実は記録に残らないため、後から検証もできません。

判断の順序を次に固定します。

1. 削れる範囲を出す(削れないという結論も、根拠とともに記録する)
2. 期日を動かせるかを確かめる
3. 上の2つが尽きた場合に限り、要員の追加を検討する

## 人がいない・判断が返ってこない

| こんなとき | まず何をするか | 決める人 | 参照 |
| --- | --- | --- | --- |
| 承認者が不在で先へ進めない | 滞留の措置を適用する。待ち続けない | 価値責任者 | [7.5 判定の滞留に対する措置](/process-compass/phase4-process-design/exception-escalation/) |
| 中核の開発者が抜けた | 引き継ぎの期限を通知日からの相対で決める | 技術判断者 | [ADR-0022](/process-compass/adr/0022-handover-deadlines-relative-to-notice/) |
| 任命基準を満たす人がいない | 期限付きの暫定任命とし、期限を記録する | 価値責任者 | [3.4 任命基準](/process-compass/phase4-process-design/roles-responsibilities/) |
| 独立レビュアを立てられない | 兼務の可否を確認する。禁止の組み合わせは崩さない | 技術判断者 | [3.5 兼務ルール](/process-compass/phase4-process-design/roles-responsibilities/) |
| 規模が小さく手順が重すぎる | テーラリングで縮約する。**縮約した事実を記録する** | 価値責任者 | [第8章 テーラリングガイド](/process-compass/phase4-process-design/tailoring-guide/) |

## 言い出しにくい

ここが本ページの中心です。**報告されない事象は、存在しない事象として扱われます**。

| こんなとき | まず何をするか | やってはいけないこと |
| --- | --- | --- |
| 自分の操作が原因かもしれない | 事実だけを時系列で報告する。原因の推定を待たない | 原因が確定するまで黙る |
| 報告すると責められそう | 報告する。ポストモーテムは責めを問わない前提で書く | 個人名を主語にした説明を先に用意する |
| 上位から強行の圧力がある | 圧力の有無ではなく**基準**で判定する。判定と理由を記録に残す | 口頭の合意だけで通す |
| 会議で全員が賛成していて言い出せない | 反対の観点を明示的に求める場を使う。異論は記録する | 全員一致を「問題なし」と読む |
| 小さな逸脱なので今回も見逃したい | 逸脱を記録に残す。判定は4値のいずれかで示す | 「今回も大丈夫だった」を根拠にする |

### 報告の様式に自己弁護を求めません

報告の様式が「なぜ起きたか」の説明を報告者へ求める構成であると、報告は自己弁護の作業になります。**様式は事実の記述だけを求めます**。原因の分析は、報告を受けた後の別の工程です。

分析の際は、原因を[改善サイクル](/process-compass/phase6-operation/improvement-cycle/)の3区分(システム起因・リスク認識の不足・意図的な逸脱)へ仕分けます。**この区分を報告者に選ばせません**。

### 割り込みたくない・割り込まれたくない

言い出しにくさの一部は、**相手の作業を止める負い目**から生じます。緊急でない申し送りには、非割込型の受け渡しを使います。手順は[ラベルメールボックス](/process-compass/phase5-implementation/label-mailbox/)に規定します。

## AI が原因かもしれない

| こんなとき | まず何をするか | 決める人 | 参照 |
| --- | --- | --- | --- |
| 生成されたコードの挙動を説明できない | 取り込まない。説明できるまで差し戻す | 開発者(検証者) | [ADR-0012](/process-compass/adr/0012-ai-output-as-unverified-input/) |
| 機密の情報を指示に入力してしまった | 事象として即時に報告する。入力の取り消しを待たない | AI 運用担当者 | [AI 実行環境](/process-compass/phase5-implementation/ai-environment/) |
| エージェントが想定外の操作をした | 実行の記録から範囲を確定する。権限を先に絞る | AI 運用担当者 | [エージェント実行の追跡](/process-compass/phase5-implementation/agent-trace-control/) |
| AI の要約を信じて判断してしまった | 判断の前提を記録し、一次資料と突き合わせる | 価値責任者 | [レビューパッケージ](/process-compass/phase5-implementation/review-package/) |
| AI が同じ誤りを繰り返す | 個別に直さず、恒久層のコンテキストへ書き戻す | 文脈オーナー | [コンテキスト基盤](/process-compass/phase5-implementation/context-base/) |
| 生成物の権利関係が不安 | 証跡を残す。**証跡は保証ではない**ことを前提に判断する | 事業決裁者 | [ADR-0021](/process-compass/adr/0021-ip-clearance-evidence-not-guarantee/) |

## 外から来た

| こんなとき | まず何をするか | 決める人 | 参照 |
| --- | --- | --- | --- |
| 依存ライブラリの重大な脆弱性が公表された | 使用の有無ではなく**どの環境にどの版があるか**を先に確定する | 技術判断者 | [避難訓練の類型B](/process-compass/phase6-operation/incident-drill/) |
| 外部 API・SaaS が仕様変更または停止した | 前提の失効として扱い、影響範囲を出す | 技術判断者 | [前提台帳](/process-compass/adr/0018-assumption-ledger/) |
| 苦情が急増した・炎上した | 事実と未確定を分けた暫定の回答を出す | 事業決裁者 | [避難訓練の類型D](/process-compass/phase6-operation/incident-drill/) |
| 規制・業界基準への非準拠を指摘された | 出荷を止める判断を先に行う | 出荷判定者 | [安全性の検証](/process-compass/phase4-process-design/safety-verification/) |
| 企画の前提が市場の変化で崩れた | 前提台帳を更新し、中止の判断基準に当てはめる | 事業決裁者 | [7.7.3 中止の判断基準](/process-compass/phase4-process-design/exception-escalation/) |

## 表に載っていないとき

該当する行がない場合の手順を次に定めます。

1. 影響先(ヒト・モノ・カネ・時間)を1つ以上選ぶ
2. [リスクカタログ](/process-compass/phase6-operation/risk-catalog/)で同じ影響先の行を探し、リスクオーナーを特定する
3. オーナーへ事実だけを報告する。原因が分からない状態でよい
4. 事象が収束した後、本ページへ行を追加する提案を出す

**本ページに行がないことは、対応しなくてよいことを意味しません**。行の追加は[改善サイクル](/process-compass/phase6-operation/improvement-cycle/)で扱います。

## このページの限界

- 逆引きの表であり、**手順の詳細を持たない**。詳細は参照先の規定にある
- 症状の分類は例示である。実際の事象は複数の行にまたがる
- 本ページを読む余裕がない状況(重大な障害の最中)では機能しない。その状況に備えるのが[開発避難訓練](/process-compass/phase6-operation/incident-drill/)である

## 関連するページ

- [リスクカタログ](/process-compass/phase6-operation/risk-catalog/) — 症状の背後にあるリスクの分類
- [インシデント対応](/process-compass/phase6-operation/incident-response/) — Sev 判定とポストモーテム
- [開発避難訓練](/process-compass/phase6-operation/incident-drill/) — 本ページを引く練習
- [第7章 例外・エスカレーション](/process-compass/phase4-process-design/exception-escalation/) — 滞留・例外・中止の規定
