# 130 一次調査: 独立レビューのパッケージング

- 作成日: 2026-08-07
- 対象 Issue: #130（#96 提言3）
- 目的: 文脈を共有しない外部レビュアが G-6 の SLA 内でレビューを成立させるための支援を設計する。ただし支援が検出能力を下げない構成にする

> 本メモは調査記録である。規定の正本はフェーズ4・5の各ページにある。

## 0. 調査の問い

| # | 問い |
| --- | --- |
| Q1 | レビュアが実際に困っているのは何か。支援は必要か |
| Q2 | 手がかりを与えると検出能力は上がるのか、下がるのか |
| Q3 | 「手がかりまで」と「結論」の境界は成立するか |
| Q4 | 提示の順序は結果を変えるか |
| Q5 | 支援の副作用を訓練で防げるか |

## 1. Q1 レビュアが困っているのは「理解」である

Bacchelli, A., Bird, C., "Expectations, Outcomes, and Challenges of Modern Code Review", *ICSE 2013*, pp.712-721。Microsoft において観察・面談・調査・レビューコメントの分類を行った研究である。

報告されている中心的な所見は次のとおりである。

> code and change understanding is the key aspect of code reviewing

開発者は理解のために多様な手段を用いているが、**その多くは既存のツールでは満たされていない**とされる。

- 出典: [Expectations, Outcomes, and Challenges of Modern Code Review (Microsoft Research)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ICSE202013-codereview.pdf) / [ACM DL](https://dl.acm.org/doi/10.5555/2486788.2486882)

**含意**: 支援の必要性そのものは裏づけられる。ただし満たすべきは「理解」であり、**理解の代行ではない**。

## 2. Q2・Q4 手がかりは、提示の時期によって効果の符号が変わる

### 2.1 一次情報

Zheng, B., Swensson, R.G., Golla, S., Hakim, C.M., Shah, R., Wallace, L., Gur, D., "Detection and classification performance levels of mammographic masses under different computer-aided detection cueing environments", *Academic Radiology*, 2004 Apr;11(4):398-406。

放射線科医8名が110症例(生検で確認された腫瘤 45例、陰性 65例)を6条件で読影した実験である。条件には、コンピュータによる検出の手がかり(cue)を**初回の読影の後に提示する**条件と、**画像の表示と同時に提示する**条件が含まれる。

原文の記述。

> Providing cues after initial interpretation had little effect on the overall performance in detecting masses.

> viewing CAD cues immediately upon display of images significantly reduced average performance for both detection and classification tasks (P < .05)

> Viewing CAD cues during the initial display consistently resulted in fewer abnormalities being identified in noncued regions.

- 出典: [PubMed 15109012](https://pubmed.ncbi.nlm.nih.gov/15109012/)（2026-08-07 取得）

### 2.2 所見

**手がかりを最初に見せると、手がかりのない領域での検出が一貫して減る**。全体の性能も、偽陽性率が高い条件では有意に低下した。一方、**初回の解釈を終えた後に提示した場合の影響は小さかった**。

:::caution
本研究は乳房 X 線画像の読影を対象としており、**コードレビューへの外挿は検証されていない**。共通するのは「限られた時間で、広い対象から異常を探す視覚的な探索課題」という構造である。**検出率の数値を本標準へ引用してはならない**。採るのは提示の順序に関する方向のみとする。
:::

## 3. Q5 副作用は訓練で防げない

Skitka, L.J., Mosier, K.L., Burdick, M. らによる一連の研究(1996〜2000年頃)。自動化された補助を用いる意思決定では、次の2種類の誤りが生じるとされる。

| 誤り | 定義 |
| --- | --- |
| 見落とし(omission) | 補助が検出も表示もしなかった事象に対して、対応しない |
| 追従(commission) | 他の有効な情報や訓練内容に反していても、補助の推奨に従う |

報告されている重要な所見は次のとおりである。

> training that focused on automation bias and associated errors successfully reduced commission, but not omission, errors

**追従は訓練で減らせたが、見落としは減らせなかった**。

- 出典: [Does automation bias decision-making? (International Journal of Human-Computer Studies)](https://www.sciencedirect.com/science/article/abs/pii/S1071581999902525) / [Automation Bias, Accountability, and Verification Behaviors (1996)](https://journals.sagepub.com/doi/10.1177/154193129604000413) / [Automation bias and errors: are crews better than individuals?](https://pubmed.ncbi.nlm.nih.gov/11543300/)

**含意**: 「パッケージを鵜呑みにしないこと」という注意書きや教育では、見落としを防げない。**構造で防ぐしかない**。すなわち、提示の順序・内容の制限・網羅性を主張しないことの3点で設計する。

## 4. Q3 観点を与える方式には先例がある

Basili, V.R. らによる Perspective-Based Reading(PBR)は、レビュアに**視点と読み方の手順**を与え、読みながら成果物(テストケース・利用シナリオ等)を作らせる方式である。NASA SEL の実務者を対象とした実験では、PBR のチームが対象文書のカバレッジで有意に優れたと報告されている(1996年)。

一方、UML 設計文書を対象とした後続の比較実験(被験者59名)では、**検出の有効性は PBR 69%、チェックリスト方式 70% と同等**であり、PBR のほうが所要時間が短かった一方、欠陥あたりのコストはチェックリスト方式のほうが小さかったと報告されている。

- 出典: [The Empirical Investigation of Perspective-Based Reading (Basili et al.)](https://www.cs.umd.edu/~mvz/handouts/emp_pbr.pdf) / [An experimental comparison of checklist-based reading and perspective-based reading for UML design document inspection](https://www.researchgate.net/publication/3998247_An_experimental_comparison_of_checklist-based_reading_and_perspective-based_reading_for_UML_design_document_inspection)

**含意**: **視点と読み方を与える方向は先例があり、否定されていない**。ただし効果は一貫しておらず、**効果量を主張してはならない**。本標準が採るのは「与えるのは読み方であって、読んだ結果ではない」という設計の方向のみとする。

## 5. 結論

### 5.1 「手がかりまで」と「結論」の境界(Q3 への回答)

境界は成立する。3区分で規定する。

| 区分 | 内容の例 | 扱い |
| --- | --- | --- |
| 対応関係(事実) | 受入基準と差分の対応、変更が触れる設計標準、影響範囲、同一箇所の過去の指摘 | 含めてよい。機械的に導出でき、真偽を検証できる |
| 観点(読み方) | 「この変更は認可の判定に触れる。認可の観点で読む」 | 含めてよい。どこを見るかの指示であり、何が起きているかを述べない |
| 結論(判断) | 「受入基準を満たしている」「問題は見つからなかった」「この実装は安全である」 | **含めてはならない** |

**判定の規則**: その記述が「レビュアが自分で確認しなくてよい」と読める場合、それは結論である。

### 5.2 提示の順序(Q4 への回答)

2.2 の所見から、**情報を「範囲を広げるもの」と「注意を狭めるもの」に分け、前者を先、後者を後に置く**。

| 部位 | 性質 | 提示の時期 |
| --- | --- | --- |
| 索引部(受入基準と差分の対応、影響範囲) | 探索の範囲を**広げる** | パス1の開始時 |
| 注意喚起部(過去の指摘、触れている設計標準、リスクの高い箇所) | 注意を**狭める** | パス1の完了後 |

これは第5章 5.7.5 の認知強制機能(段階1で方針を記述してから段階2で生成物を参照する)と同じ構造である。

### 5.3 網羅性を主張しない

3の所見から、**パッケージは「ここに挙げた箇所以外に問題がないこと」を意味しない旨を必ず併記する**。注意書きだけでは見落としを防げないが、**併記しない場合は網羅の主張と読まれる**。

### 5.4 パッケージの妥当性は誰が保証するか

生成を**機械的な導出に限る**ことで、妥当性の問題を「導出が正しいか」へ還元する。要約・評価を含めないため、内容の妥当性を人が保証する必要がなくなる。

- 導出の正しさは生成スクリプトのテストで担保する
- **パッケージの誤りをレビュアの責任にしない**。誤りを見つけた場合は生成の不具合として記録する

### 5.5 効果の検証

第5章 5.6.2 の欠陥注入による検出率で、導入の前後を比較する。**検出率が下がった場合、そのパッケージは有害であり撤去する**。個人単位の検出率を算出しない(第5章の禁止事項)ため、比較は工程単位で行う。

### 5.6 限界

パッケージが出せるのは**恒久層コンテキストに記録されている情報だけ**である。設計標準も過去の判断も記録されていない組織では、パッケージは索引部しか生成できない。**パッケージは恒久層の整備を代替しない**。

## 6. 未確認の事項

| 事項 | 状態 |
| --- | --- |
| コードレビューにおける手がかりの提示時期を扱った実験 | 特定できず。2.2 は放射線読影の研究である |
| レビュー支援ツールの導入が欠陥検出率へ与える影響を測った対照実験 | 特定できず |
| Basili (1996) の原論文本文 | 配布資料のみ確認。効果量は引用していない |
| Skitka らの各研究の被験者数・効果量 | 抄録のみ確認。数値は引用していない |
| 大規模言語モデルが生成したレビュー要約の、検出率への影響 | 特定できず |
