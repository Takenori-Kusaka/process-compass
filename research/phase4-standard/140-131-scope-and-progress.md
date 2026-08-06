# 140/131 一次調査: スコープの確約・進捗の観測・仕様ドリフトの検知

- 作成日: 2026-08-06
- 対象 Issue: #140(スケジュール調整・規模の合意・次回マイルストーンのスコープ定義)、#131(外殻と内側の仕様ドリフト検知)
- 目的: 通常運転時の進捗確認とスコープ調整の手続を、**会議体と判定を増やさずに**規定するための根拠を集める

> 本メモは調査記録である。規定の正本はフェーズ4の各章にある。

## 0. 調査の問い

| # | 問い | 対応 Issue |
| --- | --- | --- |
| Q1 | 規模の合意を、根拠のない精度を装わずに行う方法はあるか | #140 |
| Q2 | 進捗を自己申告に依らずに観測する方法はあるか | #140 |
| Q3 | スコープを削る判断を、通常運転として回す仕組みはあるか | #140 |
| Q4 | 「合意した範囲の内か外か」を機械が判定できるか | #131 |
| Q5 | 外殻(契約・要件合意)と内側(AI協調ループ)の速度差は、何によって実害になるか | #131 |

## 1. Q1 規模の合意 — 見積りではなく実測で置く

### 1.1 見積り精度は工程の進行では改善しない

Todd Little, "Schedule Estimation and Uncertainty Surrounding the Cone of Uncertainty", *IEEE Software* 23(3), pp.48-54, 2006。Landmark Graphics 社の実案件データを用い、工程が進むほど不確実性が収束するという通説(Cone of Uncertainty)に反する分布を報告した論文である。Kruchten・McConnell からの応答が併載されている。

**留意**: 原論文の本文は今回入手できていない。掲載誌・巻号・ページと論旨の方向のみを確認した。**具体的な比率を本標準へ引用してはならない**。

- 出典: [dblp: Todd Little](https://dblp.org/pid/03/1294.html) / [ResearchGate 書誌](https://www.researchgate.net/publication/3248373_Schedule_estimation_and_uncertainty_surrounding_the_cone_of_uncertainty)

### 1.2 実測スループットに基づく予測

Kanban Guide(v2025.5、2025-05-01 更新。John Coleman、Daniel Vacanti、Colleen Johnson ほか)は、4つの必須のフロー指標を定義している。**原文の定義は次のとおり**。

| 指標 | 原文の定義 |
| --- | --- |
| WIP | "The number of work items started but not finished." |
| Throughput | "The number of work items finished per unit of time. Note the measurement of throughput is the exact count of work items." |
| Work Item Age | "The elapsed time between when a work item started and the current date." |
| Cycle Time | "The elapsed time between when a work item started and when a work item finished." |

Service Level Expectation(SLE)は "a forecast of how long it should take a work item to flow from started to finished" と定義され、**期間と確率の対**で表す(例: "85% of work items will be finished in eight days or less")。SLE は過去のサイクルタイム実測から導く、とされている。

- 出典: [The Kanban Guide (v2025.5)](https://kanbanguides.org/the-kanban-guide/)

**重要**: スループットの測定は「作業単位の**個数**」であり、工数でも規模点でもない。これは #140 の「根拠のない精度を装う見積り手法を持ち込まない」という要求と一致する。

### 1.3 モンテカルロ予測について

throughput 実測を入力とする確率的予測(モンテカルロ)を推す解説は多数あるが、**今回確認できた範囲では、精度を主張する数値の出所がいずれも事業者の記事であり、査読された比較実験を特定できなかった**(「85〜95%の精度」「2023年の研究で97%」等)。

→ **これらの数値は本標準へ引用しない**。手法としての「実測分布からの確率つき予測」は採るが、精度の主張は載せない。

### 1.4 確約する範囲の上限 — DSDM の 60%

Agile Business Consortium(DSDM Project Framework)の MoSCoW 優先順位付けは、次を推奨している。**原文**:

> "Getting the percentage of project/Project Increment Must Haves (in terms of effort to deliver) to a level where the team's confidence to deliver them is high – typically no more than 60% Must Have effort"

> "a pool of Could Haves for the project/Project Increment that reflects a sensible level of contingency – typically around 20% Could Have effort."

> "Levels of Must Have effort above 60% introduce a risk of failure, unless the team are working in a project where all of these criteria are true:"(正確な見積り・十分に理解された進め方・成熟したチーム・低リスクな環境の4条件)

Must Have は Minimum Usable SubseT(MUST)を成し、**それがなければ期日に配備する意味がない**要求と定義される。割合は要求の**件数ではなく工数**で計算する。

- 出典: [What is MoSCoW Prioritization? — Agile Business Consortium](https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html)

**評価**: 60% という値は実証研究ではなく、フレームワークの推奨値である。本標準へ持ち込む場合、**「DSDM の推奨値を初期値として採る」と出所を明示し、自組織の実測で置き換えることを求める**必要がある。

## 2. Q2 進捗の観測 — 自己申告は使えない

### 2.1 90%シンドローム

Abdel-Hamid, T. K., "Understanding the '90% syndrome' in software project management: A simulation-based case study", *Journal of Systems and Software*, 1988。NASA の案件を対象としたシステムダイナミクスによる分析で、**進捗の自己申告が長期にわたり高い完了率を示し続ける現象**の原因を、規模の過小見積りと進捗の可視性の低さ(下流のテスト工程まで設計の欠陥を検出できない)の相互作用に帰している。

- 出典: [ScienceDirect(1988)](http://www.sciencedirect.com/science/article/pii/0164121288900155/pdf) / [MIT Sloan WP: Overcoming the 90% Syndrome](https://dspace.mit.edu/bitstream/handle/1721.1/2753/SWP-4081-45184517.pdf)

**含意**: 進捗を「担当者が申告する完了率」で測ってはならない。本標準は既に 7.7.2 で進捗率を「完了した受入基準の数 ÷ 計画した受入基準の数」と定義しており、この作法と整合する。

### 2.2 先行指標としての滞留期間

Work Item Age は**未完了の項目にのみ意味を持つ先行指標**であり、Cycle Time(完了後にしか得られない遅行指標)と対になる。運用は、進行中の項目の age を SLE(サイクルタイムのパーセンタイル)と突き合わせ、超過しつつある項目を早期に特定する形をとる。

- 出典: [Kanban Guide](https://kanbanguides.org/the-kanban-guide/) / [Flow Metrics for Scrum — Scrum.org](https://www.scrum.org/resources/blog/4-key-flow-metrics-and-how-use-them-scrums-events)

**本標準との関係**: 第4章の「ゲート滞留時間(提出→判定)」とは対象が違う。ゲート滞留時間は判定者の帯域を測り、滞留期間は作業単位そのものの停滞を測る。**両者を同じ指標として扱ってはならない**。

## 3. Q3 スコープを削る判断 — 柔軟なスコープは成功要因である

Jørgensen, M., "A survey on the characteristics of projects with success in delivering client benefits", *Information and Software Technology*, 2016(Simula Research Laboratory)。83名の実務者から、比較的新しい案件 73 件と古い案件 74 件について、便益管理の実践・アジャイル実践・契約形態・顧客便益の実現度を収集した調査である。

報告されている所見:

- アジャイルな案件は全体として他より成功していたが、**利用者の要望の変化や学習を反映できる柔軟なスコープを持たない案件、および顧客への頻繁な提供を行わない案件は、顧客便益の実現において平均を下回った**
- 固定価格契約は、実費精算型に比べ失敗のリスクが高いという所見が別の2研究でも得られている

- 出典: [ScienceDirect 書誌](https://www.sciencedirect.com/science/article/abs/pii/S0950584916300945) / [Simula 出版一覧](https://www.simula.no/publications/survey-characteristics-projects-success-delivering-client-benefits) / [Direct and indirect connections between type of contract and software project outcome](https://www.sciencedirect.com/science/article/abs/pii/S0263786317301813)

**留意**: 出版社サイトが 403 を返したため、**抄録の逐語確認はできていない**。所見の方向のみを採用し、比率や効果量は引用しない。

**含意**: スコープの削減は逸脱ではなく、便益を実現するための通常の操作である。したがって**スコープの調整を一律に例外・エスカレーションとして扱う設計は誤り**である。例外にすべきなのは、**確約した範囲**を動かす場合に限られる。

## 4. Q4 スコープ内外の機械判定 — できない

### 4.1 自動生成されたトレースリンクを人が検証すると、品質が下がる場合がある

Cuddeback, D., Dekhtyar, A., Hayes, J. H., "Automated Requirements Traceability: The Study of Human Analysts", *RE 2010*(IEEE International Requirements Engineering Conference)。自動生成した要求トレーサビリティ行列(候補 RTM)を人手で検証させる実験である。

報告されている所見:

- **初期の精度・再現率が低い候補行列を与えられた分析者は、両方を大きく改善した**
- **初期の精度が高い候補行列を与えられた分析者は、品質を下げた**
- 分析者の最終的な行列は、初期状態によらず精度・再現率空間の一点へ収束する傾向を示した

- 出典: [RE2010 論文 PDF(Cal Poly)](http://users.csc.calpoly.edu/~dekhtyar/publications/RE2010.pdf) / [IEEE Xplore](https://ieeexplore.ieee.org/document/5636537/) / [Cal Poly Digital Commons](https://digitalcommons.calpoly.edu/csse_fac/108/)

**留意**: PDF は証明書エラーで取得できず、書誌情報と要旨のみを確認した。**具体的な数値は引用しない**。

**含意**: 「機械が範囲内外を判定し、人が追認する」構成は、人の判断を機械の出力へ引き寄せる。**判定は人が行い、機械は判定の記入の有無だけを検査する**構成にする。これは本標準が第5章 5.7.4 で既に定めている「記述の質を機械判定して承認可否を自動決定しない」と同じ結論である。

### 4.2 LLM による意味的判定

LLM を要求工学へ適用する研究は 2025〜2026 に急増しているが、**「合意した範囲の内か外か」という契約的判断について、人間の専門家との一致率を報告した査読研究を特定できなかった**。トレーサビリティ支援(TraceLLM 等)は候補リンクの提示を対象としており、**判定の代替ではない**。

→ 本標準では 4.1 の結論を採り、LLM の判定能力に関する記述は行わない。

## 5. Q5 外殻と内側の速度差が実害になる条件

### 5.1 生成量の増加は安定性を悪化させる

DORA, *State of AI-assisted Software Development*(2025-09-24 公開、約5,000名の回答と100時間超の定性データ)。**原文**:

> "Unlike last year, we observe a positive relationship between AI adoption on both software delivery throughput and product performance."

> "However, AI adoption does continue to have a negative relationship with software delivery stability."

- 出典: [Announcing the 2025 DORA Report — Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) / [報告書 PDF](https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf)

**含意**: 変更の量が増えても、統制の側が追随しなければ不安定さが増す。**外殻の合意を更新しないまま内側の生成量だけが増える構成は、この所見の一例**にあたる。

### 5.2 要求の変動そのものは避けられない

要求の変動(requirements volatility)がスケジュール超過・費用超過と有意に関連することは、複数の実証研究で報告されている。変動の量は「変更・削除・置換された要求の数 ÷ 全要求の数」で算出される例がある。

- 出典: [A study of the impact of requirements volatility on software project performance (IEEE)](https://ieeexplore.ieee.org/document/1182970/) / [Quantifying requirements volatility effects (VU)](https://www.cs.vu.nl/~x/qrv/qrv.pdf) / [Causes and Mitigation Practices of Requirement Volatility in Agile Software Development (MDPI, 2024)](https://www.mdpi.com/2227-9709/11/1/12)

**含意**: 変動を抑え込む設計ではなく、**変動を測り、確約した範囲に当たったときだけ外殻を起動する**設計にする。

### 5.3 2026-08-06 時点の業界動向: 仕様駆動開発

2025年以降、AI コーディングエージェントの「もっともらしいが意図と食い違う実装」への対処として、実行可能な仕様を単一の情報源に置く手法(spec-driven development)が各ツールから提供されている。2026年時点で主要なエージェント系ツールが同種の機能を備えている。

- 出典: [Spec-Driven Development in 2026 (DevToolLab)](https://devtoollab.com/blog/spec-driven-development-ai-agents) / [Spec-Driven Development with AI Coding Agents (2026)](https://tryzeroshot.com/blog/spec-driven-development-with-ai-coding-agents)

**留意**: いずれも事業者・個人の記事であり、**効果を示す実証はない**。「2026-08-06 時点でこうした手法が提供されている」という事実の記録に留め、**本標準の根拠としては用いない**。

## 6. 未確認の事項

| 事項 | 状態 |
| --- | --- |
| Little (2006) の原論文本文 | 未入手。書誌と論旨の方向のみ確認 |
| Jørgensen (2016) の抄録の逐語 | 出版社サイトが 403。所見の方向のみ確認 |
| Cuddeback et al. (2010) の本文と数値 | PDF の取得に失敗。要旨のみ確認 |
| ISO/IEC/IEEE 12207 の構成管理・変更管理の条項番号 | 未入手。**条項を引用してはならない** |
| DSDM 60% の実証的裏づけ | 存在しない。フレームワークの推奨値である |
| 確率的予測(モンテカルロ)の精度を示す査読研究 | 特定できず |
| 「範囲内外」の意味的判定に関する LLM の一致率 | 特定できず |

## 7. 設計への反映(結論)

| # | 結論 | 反映先 |
| --- | --- | --- |
| 1 | スコープを3層(確約・計画・調整枠)で合意し、確約は容量の 60% を上限とする(DSDM を出典として明示) | 第2章 2.10 |
| 2 | 規模の合意は工数の絶対値ではなく、直近の実測スループットに対する件数で行う。実測がない場合は確約を置かない | 第2章 2.10 |
| 3 | 進捗は自己申告で測らない。受入基準の充足件数(遅行)と作業単位の滞留期間(先行)の対で観測する | 第2章 2.10、フェーズ6 |
| 4 | 計画範囲・調整枠の増減は価値責任者の単独判定。**確約範囲を動かすときだけ**例外・エスカレーションとする | 第2章 2.10、第7章 7.6 |
| 5 | 期日に間に合わない見込みが立った場合の選択の順序は「範囲を削る → 期日を動かす → 基準を下げる」。基準の引き下げは 7.3 の例外承認を経る | 第2章 2.10 |
| 6 | 範囲内外の判定は人が行う。機械は**記入の有無だけ**を検査する | 第4章 G-4 |
| 7 | 範囲外と判定された変更は、内側のループを止めずに外殻の変更管理を非同期で起動する | 第2章 2.10、第4章 G-4 |
| 8 | 新しい会議体・ゲート・様式を設けない。差し引きとして、7.6 のスコープ発火条件を確約範囲の変動へ限定し、報告の総数を減らす | 第7章 7.6 |
