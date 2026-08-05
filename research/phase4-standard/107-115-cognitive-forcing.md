# 認知強制機能とゲート承認設計の一次調査（Issue #107 / #115）

- 調査日: 2026-08-05
- 対象 Issue: #107「人間の胆識（決断力）を確立するゲート承認設計」、#115「認知強制機能（CFF / 段階的開示・対比説明）のインタラクション設計」
- 目的: 「承認ゲートで人間に実質的な判断をさせる」ための設計根拠と、その反証・副作用を一次情報で押さえる
- 注記: 生成AI・エージェント関連の記述はすべて「2026-08-05 時点」の理解である。この領域は数か月単位で状況が変わるため、再利用時は日付を確認すること

---

## 1. 認知強制機能（cognitive forcing function）の原典と実証

### 1.1 医療における原典（Croskerry）

- Pat Croskerry, "The Importance of Cognitive Errors in Diagnosis and Strategies to Minimize Them", *Academic Medicine* 78(8):775-780, 2003
  - 診断エラーの重要な一群は認知エラーであり、知覚の失敗・ヒューリスティクスの失敗・バイアスに起因する。これらを cognitive dispositions to respond（CDRs）と総称する
  - 対策の中心は metacognition（メタ認知）。目の前の問題からいったん退き、自分の思考プロセス自体を点検する反省的アプローチ
  - 出典: <https://academic.oup.com/academicmedicine/article-abstract/78/8/775/8355718>
- Pat Croskerry, "Cognitive forcing strategies in clinical decisionmaking", *Annals of Emergency Medicine*, 2003
  - cognitive forcing strategy を 3 階層に分類する
    - universal（普遍的）: あらゆる意思決定に共通して適用する自己点検
    - generic（一般的）: 特定のバイアス群に対する汎用的な対策
    - specific（特異的）: 個別の臨床的落とし穴に紐づく形式的なデバイアス手順
  - 「訓練によって教えられる」「事前に接種（inoculate）できる」という設計思想である
  - 出典: <https://www.annemergmed.com/article/S0196-0644(02)84945-9/fulltext>
- Croskerry, "Diagnostic Failure: A Cognitive and Affective Approach"（AHRQ, Advances in Patient Safety, 2005）も同系統の一次情報である
  - 出典: <https://www.ncbi.nlm.nih.gov/books/NBK20487/>

### 1.2 人間とAIの協働における実証（Buçinca et al., CSCW 2021）

- Zana Buçinca, Maja Barbara Malaya, Krzysztof Z. Gajos, "To Trust or to Think: Cognitive Forcing Functions Can Reduce Overreliance on AI in AI-Assisted Decision-Making", *Proc. ACM Hum.-Comput. Interact.* 5, CSCW1, 2021
  - 出典（著者ページ）: <https://www.eecs.harvard.edu/~kgajos/papers/2021/bucinca2021trust.shtml>
  - 出典（arXiv, 2102.09692）: <https://arxiv.org/abs/2102.09692>
- 設計: 二重過程理論に基づく 3 種の認知強制介入
  - **On demand**: AI の推薦を既定では表示せず、ボタンを押して初めて表示する（見に行くかどうかを人間に選ばせる）
  - **Update**: まず人間が AI なしで自分の判断を確定し、その後に AI の推薦を見せて更新の機会を与える
  - **Wait**: 「AI が処理中」の待機時間（約 30 秒）を挿入し、その間に人間が自分の仮説を形成させる
- 対象タスク: 栄養学的な食材置換タスク。参加者 199 名（Amazon Mechanical Turk）
- 主要な結果（数値は ar5iv 版本文・図表からの抽出。厳密な引用時は原典 PDF での再確認が必要）
  - AI が誤っている場合の過度な依存（overreliance）: 単純な説明可能AI（simple XAI）条件で約 64%、認知強制条件で約 48%
  - AI が誤っている場合に人間が正答できた割合: simple XAI 約 3% → 認知強制 約 9%
  - 主観評価（5 件法）: 信頼 3.91 → 3.72、選好 3.78 → 3.62、システム複雑性 2.64 → 2.95（認知強制側が不利）
- **トレードオフ（本研究の最重要の含意）**
  - 「過度な依存を最も減らした設計に、人々は最も低い主観評価を与えた」
  - すなわち、効果と使い心地は逆相関する。満足度アンケートで設計を選ぶと、効く介入は淘汰される
- **公平性の問題**
  - 認知強制の恩恵は Need for Cognition（熟慮への動機づけ）が高い参加者ほど大きい
  - 著者の結論は「人間の認知的動機づけが、説明可能AI の有効性を調整する」である
  - つまり同じ仕組みを全員に課しても、効果は均一にならない

### 1.3 後続研究（2025 年）

- "Cognitive Forcing for Better Decision-Making: Reducing Overreliance on AI Systems Through Partial Explanations", *Proc. ACM Hum.-Comput. Interact.*, 2025（DOI: 10.1145/3710946）
  - 説明を「部分的にのみ」提示することで認知強制を作動させ、関与を高めるアプローチ
  - 出典: <https://dl.acm.org/doi/10.1145/3710946>
  - 注: 本文本体は 403 で取得できず、詳細な効果量は **未確認**
- "Measuring and mitigating overreliance to build human-compatible AI"（arXiv, 2025）
  - 出典: <https://arxiv.org/pdf/2509.08010>
  - 注: 内容の精読は **未確認**

---

## 2. 説明可能性（XAI）は過信を減らさない

- Gagan Bansal ほか, "Does the Whole Exceed its Parts? The Effect of AI Explanations on Complementary Team Performance", CHI 2021
  - 説明は「AI の確信度（confidence）を表示するだけ」の条件と比べて追加の便益を示さなかった
  - 説明は AI が誤っている場合でも人間の追従を増やしうる（説明が納得感を作ってしまう）
  - 出典: <https://dl.acm.org/doi/10.1145/3411764.3445717> / <https://arxiv.org/pdf/2006.14779>
- Yunfeng Zhang, Q. Vera Liao, Rachel K. E. Bellamy, "Effect of Confidence and Explanation on Accuracy and Trust Calibration in AI-Assisted Decision Making", FAT* 2020
  - 確信度スコアの提示は信頼の較正（trust calibration）に寄与する
  - ただし較正だけでは AI 支援下の意思決定の質は改善しない
  - 出典: <https://dl.acm.org/doi/10.1145/3351095.3372852> / <https://arxiv.org/pdf/2001.02114>
- "You Can Only Verify When You Know the Answer: Feature-Based Explanations Reduce Overreliance on AI for Easy Decisions, but Not for Hard Ones", Mensch und Computer 2024
  - 説明による過度な依存の低減は「人間が自力で検証できる易しい課題」に限られ、難しい課題では効かない
  - ゲート設計にとって致命的な制約である。判断が難しいところでこそ効かない
  - 出典: <https://dl.acm.org/doi/10.1145/3670653.3670660>
- Hao-Ping Lee ほか（Microsoft Research / CMU）, "The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers", CHI 2025
  - 知識労働者 319 名、936 件の実例
  - **生成AI への信頼が高いほど批判的思考は減り、自分自身への自信が高いほど批判的思考は増える**
  - 生成AI 下では批判的思考の性質が「情報の検証」「回答の統合」「タスクの管理（stewardship）」へ移行する
  - 出典: <https://dl.acm.org/doi/full/10.1145/3706598.3713778> / <https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/>
- 補足（2026-08-05 時点）: 2026 年公開の追試・反証論文を網羅的には確認できていない。arXiv 上に 2026 年の関連プレプリント（例: provocations、Socratic questioning による批判的思考の回復）が複数存在するが、査読状況を含め **未確認**

---

## 3. 判断を先に行わせる設計（アンカリングの回避）

- Charvi Rastogi ほか, "Deciding Fast and Slow: The Role of Cognitive Biases in AI-assisted Decision-making", CSCW 2022
  - AI の助言に対するアンカリング効果を対象とし、**時間ベースの脱アンカリング戦略**を実装
  - ユーザー実験でその有効性を確認。資源制約下の時間配分戦略（易しい事例は AI に速く任せ、難しい事例に人間の時間を割く）を提案
  - 第 2 実験では、時間配分戦略と説明の併用が脱アンカリングと協働性能の改善に有効
  - 出典: <https://arxiv.org/abs/2010.07938> / <https://dl.acm.org/doi/10.1145/3512930> / PDF: <https://krvarshney.github.io/pubs/RastogiZWVDT_cscw2022.pdf>
- Buçinca et al. 2021 の **Update 条件**が、まさに「人間が先に判断を確定してから AI を見る」構成である（1.2 参照）
  - 運用コストとして、判断が二段階になるため所要時間が増え、主観的な使い勝手が下がる点が同論文で示されている
- 独立判断の確保という発想の系譜: デルファイ法
  - 匿名の反復アンケートと統計的フィードバックにより意見を収束させる。参加者は隔離され、個別に独立して回答する
  - 同調圧力とグループシンクを構造的に排除することを狙う
  - 出典（概説）: <https://ja.wikipedia.org/wiki/デルファイ法> / <https://www.itmedia.co.jp/im/articles/0805/26/news130.html>
  - 注: デルファイ法の原典（RAND の Dalkey & Helmer 1963）は本調査では **未確認**。予測市場における独立性の要件に関する一次文献も **未確認**

---

## 4. 摩擦（friction）の設計と、その形骸化

### 4.1 意図的な摩擦の考え方

- 「positive friction」「design friction」は、ユーザーを意図的に減速させ内省を促す設計選択である
  - 重大な結果を伴う操作での確認ダイアログ、アルゴリズム的スピードバンプなどが例
  - 過剰な摩擦は不満と離脱を招くという副作用が一貫して指摘される
  - 出典（実務系の整理）: <https://www.ux-republic.com/en/positive-friction-in-the-user-experience/> / <https://humanebydesign.com/principles/intentional>
- "Better AI with Designed Friction: Theories, Applications and Research Agenda"（2025, IOS Press / FAIA）
  - AI 利用文脈での設計された摩擦を理論・応用・研究課題として整理
  - 出典: <https://journals.sagepub.com/doi/10.3233/FAIA250680>
  - 注: 本文未取得、主張の詳細は **未確認**

### 4.2 摩擦が無視される・形骸化する実証

- Devdatta Akhawe, Adrienne Porter Felt, "Alice in Warningland: A Large-Scale Field Study of Browser Security Warning Effectiveness", USENIX Security 2013
  - 2013 年 5〜6 月、2,500 万件超の警告表示を実地観測
  - クリックスルー率: Firefox マルウェア警告 7.2%、Firefox フィッシング警告 9.1%、Chrome マルウェア警告 23.2%、Chrome フィッシング警告 18.0%
  - Chrome の SSL 警告は約 70% が回避された
  - 著者の結論は「警告は実務上有効でありうる」であり、警告の種類と設計で効果が大きく変わる
  - 出典: <https://www.usenix.org/conference/usenixsecurity13/technical-sessions/presentation/akhawe> / PDF: <https://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/41323.pdf>
- Bonnie Brinton Anderson ほか, "How Polymorphic Warnings Reduce Habituation in the Brain—Insights from an fMRI Study", CHI 2015
  - **形骸化までの時間に関する最重要の知見**: 警告の視覚処理に関わる脳活動は、**2 回目の呈示ですでに劇的に低下**し、以降さらに低下する
  - 警告の「内容」を変えても慣化は防げない。外観を変える多形性（polymorphic）の警告のみが慣化に耐性を示した
  - 出典: <https://dl.acm.org/doi/10.1145/2702123.2702322> / <https://scholarsarchive.byu.edu/facpub/9306/> / 解説: <https://www.schneier.com/blog/archives/2015/03/how_we_become_h.html>
- Anthony Vance ほか, "What Do We Really Know about How Habituation to Warnings Occurs Over Time?", CHI 2017
  - 慣化の時間的経過（日をまたぐ蓄積、自発的回復）を扱う続報
  - 出典: <https://neurosecurity.net/media/CHI_Vance_et_al._2017.pdf>
  - 注: PDF のテキスト抽出に失敗したため、具体的な数値・期間は **未確認**（再調査が必要）

---

## 5. 記述の質を機械的に判定できるか（#107・#115 の核心）

### 5.1 自動採点（automated essay scoring）の限界

- Les Perelman らの BABEL Generator
  - 1〜3 語の入力から「完全な意味不明文（gibberish）」の小論文を生成し、複数の自動採点エンジンから高得点を得た
  - 根本的な批判は「作文に関わる実際の構成概念を測定していない」「意味を読めず、事実確認もできない」
  - 多くのエンジンで最強の単一予測子は**長さ**であり、長く書けば得点が上がるというゲーミングに脆弱
  - 出典: <https://lesperelman.com/writing-assessment-robo-grading/> / <https://lesperelman.com/wp-content/uploads/2021/01/Perelman-BABEL-Generator-e-rater.pdf>
- "Automatic Essay Scoring Systems Are Both Overstable And Oversensitive"（arXiv 2109.11728）
  - 大幅な改変にスコアが動かない（overstable）一方、些細な摂動に過敏でもある（oversensitive）
  - 出典: <https://arxiv.org/pdf/2109.11728>
- 含意: 「無内容だが形式が整った記述」は自動採点で高評価になりうる。逆に短く鋭い記述は低評価になりうる。**長さや形式で「実質性」を測る設計は逆効果**である

### 5.2 コードレビューコメントの有用性の自動判定

- Amiangshu Bosu ほか（Microsoft での実証, 2015）
  - 有用性を「近傍のソースコード変更につながったか」で操作的に定義し、決定木分類器を構築
  - 用いた特徴量の多くはコメント投稿**後**にしか得られず、投稿時点の予測には使えない
- Mohammad Masudur Rahman ほか, "Predicting Usefulness of Code Review Comments using Textual Features and Developer Experience"（RevHelper, MSR 2017）
  - 商用プロジェクトの 1,116 件のコメントを対象に、テキスト特徴と開発者経験から投稿時点で有用性を予測
  - 出典: <https://web.cs.dal.ca/~masud/papers/masud-MSR2017a.pdf> / <https://arxiv.org/pdf/1807.04485>
- サーベイ: "Exploring the Advances in Identifying Useful Code Review Comments"（arXiv 2307.00692）
  - 出典: <https://arxiv.org/pdf/2307.00692>
- 近年の動向（2026 年公開分、査読状況は **未確認**）
  - "Automated Classification of Human Code Review Comments with Large Language Models"（arXiv 2604.23667）: <https://arxiv.org/html/2604.23667>
  - "Characterizing the Usefulness of Code Review Comments in Scientific Software"（arXiv 2604.23832）: <https://arxiv.org/pdf/2604.23832>
  - CRScore（arXiv 2409.19801）: レビューコメントの自動評価をコードの主張とスメルに接地させる試み: <https://arxiv.org/pdf/2409.19801>

### 5.3 LLM-as-a-judge の信頼性と既知のバイアス

- 位置バイアス: 提示順を入れ替えるだけで判定が変わる。コードのペア比較では精度が 10 ポイント超動く報告がある
  - 出典: <https://arxiv.org/abs/2406.07791>（"Judging the Judges: A Systematic Study of Position Bias in LLM-as-a-Judge", 2024）/ <https://openreview.net/forum?id=y3jJmrKWQ4>
- 冗長性バイアス: 実質にかかわらず、長く流暢で形式的な出力を好む
- 自己選好バイアス: 自身の生成分布に近い（perplexity が低い）出力を高く評価する
  - 出典: "Self-Preference Bias in LLM-as-a-Judge"（arXiv 2410.21819）: <https://arxiv.org/pdf/2410.21819>
- 体系的な定量化: "Justice or Prejudice? Quantifying Biases in LLM-as-a-Judge"（arXiv 2410.02736）: <https://arxiv.org/pdf/2410.02736>
- Gu ほか（2024）のサーベイが、位置・冗長性・自己強化の 3 バイアスを整理している（**原典 URL 未確認**）

### 5.4 「問題なし」「確認した」を検出できるか

- 本調査の範囲では、**「無内容な承認コメントの検出」を直接扱った研究は発見できなかった（未確認）**
- 間接的に言えること（事実に基づく推論であり、5.4 は解釈を含む）
  - 冗長性バイアスと長さ依存の存在から、「短さ」だけを根拠に無内容と判定する方式は成立しうるが、逆に「長く書けば通る」ゲーミングを即座に誘発する
  - コードレビュー有用性研究の操作的定義（「後続の変更につながったか」）は、承認記述にも転用可能な発想である。すなわち**記述そのものを採点せず、記述が後続の行動変化を伴ったかで事後評価する**方式
  - LLM-as-a-judge を門番に置く場合、位置・冗長性・自己選好バイアスにより、判定の一貫性は保証されない。**通す／止めるの自動決定には使えず、人間へのフラグ提示にとどめるのが妥当**（解釈）

---

## 6. チェックリストと読み合わせの実証

### 6.1 効果と再現失敗

- WHO 手術安全チェックリストは大規模観察研究で劇的な死亡率・合併症の低下を示した
- David R. Urbach ほか, "Introduction of Surgical Safety Checklists in Ontario, Canada", *NEJM* 370:1029-1038, 2014
  - オンタリオ州の急性期病院 101 施設での義務的導入の前後比較
  - 合併症発生率 3.86% → 3.82%、術後 30 日死亡率 0.71% → 0.65%。**いずれも統計的に有意でない**
  - 手術アウトカムは 1 つも改善せず、先行観察研究と鋭く対照的
  - 出典: <https://www.nejm.org/doi/full/10.1056/NEJMsa1308261> / <https://pubmed.ncbi.nlm.nih.gov/24620866/>
  - 反論（Gawande らの方法論的批判を含む書簡）: <https://www.nejm.org/doi/10.1056/NEJMc1404583>
- スコットランドでは導入後に死亡率 37% 低下という報告もあり、結果は文脈依存である
  - 出典（二次情報）: <https://www.patientsafetysolutions.com/docs/May_2019_WHO_Surgical_Safety_Checklist_Cut_Mortality_37_Percent_in_Scotland.htm>

### 6.2 形骸化する条件

- Ken Catchpole, Stephanie Russ, "The problem with checklists", *BMJ Quality & Safety* 24:545-549, 2015
  - チェックリストは「安全問題を解決する」と広く信じられているが、確実に使うことは難しい
  - 無思考な確認（mindless checking）を助長し、自動性を促し、思慮ある適用を阻害しうる
  - 成功には設計だけでなく**社会文化的要素**の考慮が必要。医療と航空のチェックリストの差異がその根拠
  - 出典: <https://pubmed.ncbi.nlm.nih.gov/26089207/> / <https://psnet.ahrq.gov/issue/problem-checklists>

### 6.3 航空の challenge-response 方式

- Asaf Degani, Earl L. Wiener, "Human Factors of Flight-Deck Checklists: The Normal Checklist", NASA Contractor Report 177549, 1990
  - challenge-response（正確には challenge-verification-response）方式では、**まず記憶に基づいて機体を設定し、チェックリストはバックアップとして機能する**
  - すなわち「チェックリストが作業手順そのもの」ではなく「独立に行った作業の検証」である点が設計の要である
  - scroll / mechanical / vocal など他方式との対比、長さ・書式・運用・人間の限界を検討
  - 出典: <https://ntrs.nasa.gov/api/citations/19910017830/downloads/19910017830.pdf> / <https://www.faa.gov/sites/faa.gov/files/2022-11/NASA%20Ames%20Rpt%20CR%20177549%20.pdf>
- Degani & Wiener, "Cockpit Checklists: Concepts, Design, and Use", *Human Factors* 35(2):28-43, 1993
  - 出典: <https://journals.sagepub.com/doi/10.1177/001872089303500209>

---

## 7. コミットメントの心理学 — 署名冒頭効果は撤回済み

**この節は #107 の設計根拠として使ってはならない反証事例である。**

- 原論文: Lisa L. Shu, Nina Mazar, Francesca Gino, Dan Ariely, Max H. Bazerman, "Signing at the beginning makes ethics salient and decreases dishonest self-reports in comparison to signing at the end", *PNAS*, 2012
  - 書類の**冒頭**に正直の誓約への署名を置くと、末尾に置く場合より虚偽報告が減るという 3 研究
  - 保険会社・企業・政府機関で広く実務に採用された
  - 出典（RETRACTED 表示付き）: <https://www.pnas.org/doi/10.1073/pnas.1209746109>
- 再現失敗: Kristal, Whillans ほか（原著者 5 名を含む）, "Signing at the beginning versus at the end does not decrease dishonesty", *PNAS*, 2020
  - 6 件の研究（直接再現 1 件、概念的再現 5 件）すべてで再現に失敗
  - 出典: <https://www.pnas.org/doi/abs/10.1073/pnas.1911695117> / <https://pubmed.ncbi.nlm.nih.gov/32179683/>
- 撤回: 2021 年
  - Study 3（フィールド実験）のデータに不正の証拠があるとして、Shu・Gino・Bazerman が 2021 年 7 月 22 日に PNAS へ撤回を要請
  - Simonsohn, Simmons, Nelson（Data Colada）がデータの妥当性を疑う証拠を提示
  - 出典（撤回通知）: <https://www.pnas.org/doi/10.1073/pnas.2115397118> / Data Colada [98]: <https://datacolada.org/98>
- 含意: 「署名欄の位置を変えるだけで正直さが上がる」という主張は**現時点で支持されていない**。記名や宣誓の形式的操作に効果を期待する設計は、より強い根拠を別途必要とする
- 注: 公開コミットメント効果一般（Cialdini の commitment and consistency など）の一次文献は本調査では **未確認**

---

## 8. 意思決定の質の記録

- Gary Klein, "Performing a Project Premortem", *Harvard Business Review*, 2007 年 9 月号
  - プロジェクト開始時点で「このプロジェクトは失敗した」と仮定し、その理由を列挙させる手法
  - 根拠は prospective hindsight（先行的後知恵）。Deborah J. Mitchell（Wharton）, Jay Russo（Cornell）, Nancy Pennington（Colorado）による 1989 年の研究で、将来の結果の理由を正しく特定する能力が **約 30% 向上**すると報告された
  - 出典: <https://hbr.org/2007/09/performing-a-project-premortem> / PDF: <http://homepages.se.edu/cvonbergen/files/2013/01/Performing-a-Project-Premortem.pdf>
  - 補助解説: <https://corporate.jasoncollins.blog/premortem>
- decision journal（決定時点の前提・予測・理由を記録し、後で結果と突き合わせる実務）、Kahneman らの decision hygiene / mediating assessments protocol、赤チーム、キャリブレーション訓練については、**一次文献を本調査では確認できていない（未確認）**。追加調査が必要
  - premortem との組み合わせ（決定時に「失敗理由」と「成功の判定基準」を同時に記録する）が #107 のゲート記録に最も接続しやすい（解釈）

---

## 9. 段階的開示（progressive disclosure）

- Jakob Nielsen, "Progressive Disclosure", Nielsen Norman Group, 2006 年 12 月 3 日
  - 定義: 「最初は最重要の少数の選択肢のみを見せる」「求めに応じてより大きな専門的選択肢群を提供する」
  - 目的は、力（機能の豊富さ）と単純さという相反する要求の両立
  - 記事内に定量的な効果データは示されていない（30〜50% 高速化などの数値は本記事には **存在しない**。二次情報での誤伝播に注意）
  - 出典: <https://www.nngroup.com/articles/progressive-disclosure/>
- AI 支援ツールへの適用（2026-08-05 時点）
  - Buçinca et al. の **On demand 条件**が、AI 出力の段階的開示そのものの実験的実装である（1.2 参照）
  - **「生成コードを見る前に意図を書かせる」構成を標準機能として実装している商用ツールは、本調査では確認できなかった（未確認）**
  - 近接する研究系プロトタイプは 2026 年に複数存在するが、査読状況・再現性は **未確認**
    - "Critical Inker: Scaffolding Critical Thinking in AI-Assisted Writing Through Socratic Questioning"（arXiv 2604.07167）: <https://arxiv.org/pdf/2604.07167>
    - "It makes you think: Provocations Help Restore Critical Thinking to AI-Assisted Knowledge Work"（arXiv 2501.17247）: <https://arxiv.org/pdf/2501.17247>
    - "VizCopilot: Fostering Appropriate Reliance on Enterprise Chatbots with Context Visualization"（arXiv 2510.11954）: <https://arxiv.org/pdf/2510.11954>
    - "The Impact of Response Latency and Task Type on Human-LLM Interaction and Perception"（arXiv 2604.06183、Wait 条件の現代版に相当）: <https://arxiv.org/pdf/2604.06183>

---

## 10. 日本の決裁文化との接続

- 政府による押印慣行の見直し（2020 年）
  - 規制改革推進会議「行政手続における書面主義、押印原則、対面主義の見直しについて（再検討依頼）」令和 2 年 5 月 22 日
    - 出典: <https://www8.cao.go.jp/kisei-kaikaku/kisei/meeting/committee/20200622/200622honkaigi03.pdf>
  - 内閣府規制改革推進室「押印手続の見直しに向けた取組について」令和 2 年 7 月 15 日
    - 出典: <https://www.fsa.go.jp/singi/shomen_oin/shiryou/20200715/01.pdf>
  - 「地方公共団体における押印見直しマニュアル」令和 2 年 12 月 18 日（初版）
    - 出典: <https://www8.cao.go.jp/kisei-kaikaku/kisei/imprint/document/manual/201218manual_ver01.pdf>
  - 押印を義務付ける規定について「本人確認・意思確認等の観点から」横断的に見直す、という整理がなされた
    - 出典: <https://www.njr.or.jp/data/law/mlit_dt_gaiyo.pdf>
  - 総覧ページ: <https://www8.cao.go.jp/kisei-kaikaku/kisei/imprint/i_index.html>
- 法務省民事局「押印についてのＱ＆Ａ」（2020 年）
  - テレワーク推進の障害と指摘される民間の押印慣行について、自律的な見直しを促す目的で作成
  - 出典: <https://www.moj.go.jp/MINJI/minji07_00095.html>
- 第三者委員会（日本特有の制度、日弁連「企業等不祥事における第三者委員会ガイドライン」2010 年）
  - 出典（概説）: <https://corporate.vbest.jp/columns/6673/> / 日本取締役協会「第三者委員会の有用性と限界を考える」: <https://www.jacd.jp/news/column/column-opinion/251110_post-359.html>
- **「押印・決裁が実質的な確認を伴わない形式に堕している」ことを定量的に示す調査データは、本調査では確認できなかった（未確認）**
  - 政府文書は「押印廃止の可否」を本人確認・意思確認の観点から論じており、「押印はしているが確認していない」実態の統計には踏み込んでいない
  - 個別の不祥事に関する第三者委員会報告書には「決裁が形骸化していた」旨の記載が見られる可能性が高いが、具体的な報告書の特定と引用は追加調査が必要

---

## 考察（本調査からの解釈。事実とは区別すること）

### A. 「効く介入は嫌われる」を設計前提に置く

- Buçinca et al. の最大の含意は、効果と主観評価が逆相関することである
- したがって、ゲート設計の評価指標に「開発者満足度」を単独で置くと、**効く仕組みほど廃止圧力を受ける**
- 対策の方向性（仮説）
  - 満足度ではなく「AI が誤っていた事例を人間が捕捉した率」を主指標にする
  - 摩擦を全ゲートに一律に課さず、リスクの高い決定に限定して総量を管理する

### B. 摩擦は 2 回目から効果が落ちる

- Anderson et al. 2015 の「2 回目の呈示で脳活動が劇的に低下」は、承認ダイアログ型の設計に対する強い警告である
- 内容ではなく**外観・形式の変化**が慣化への耐性を生んだという知見は、「毎回同じテンプレートの承認欄」は最短で形骸化することを示唆する（解釈）
- チェックリストの形骸化（Catchpole & Russ 2015）と同じ現象の異なる観測面と見なせる

### C. 「先に判断させる」が最も根拠が厚い

- Update 条件（Buçinca 2021）と時間ベース脱アンカリング（Rastogi 2022）は、いずれも独立判断の先行確定を支持する
- 航空の challenge-response が「記憶で作業 → チェックリストで検証」という順序である点も同型である
- #115 の段階的開示は、この順序を UI として強制する実装と位置づけられる（解釈）

### D. 記述の質の自動判定は「通す／止める」に使えない

- AES のゲーミング脆弱性（長さが最強の予測子）と LLM-as-a-judge の冗長性・位置・自己選好バイアスから、自由記述の実質性を機械が門番として判定する設計は現時点で成立しない
- 代替案（仮説）
  - 事前の判定ではなく、**事後の突き合わせ**（決定記録と実際の結果を後から照合する decision journal 型）に軸足を移す
  - 記述の採点ではなく、記述の**構造**を要求する（何を確認したか、何を確認しなかったか、どの条件なら判断が変わるか）
  - 自動判定は「人間へのフラグ」にとどめ、決裁の可否は人間が持つ

### E. 記名・署名の形式操作に効果を期待しない

- Shu et al. 2012 の撤回は、「署名の位置を変える」類の軽い介入への期待を大きく引き下げる
- 日本の押印文化の議論と接続すると、**記名欄を増やすこと自体は実質性を担保しない**という結論になる（解釈）

---

## 追加調査が必要な穴

1. Buçinca et al. 2021 の正確な効果量（原典 PDF が 403/抽出失敗。ACM DL 経由での再取得が必要）
2. Vance et al. CHI 2017 の慣化の時間経過（何日で、何回で慣化が蓄積するか）の具体値
3. decision journal / Kahneman の decision hygiene・mediating assessments protocol の一次文献
4. 公開コミットメント効果一般の一次文献（Shu 2012 以外）と、その再現性の現況
5. デルファイ法の原典（RAND, Dalkey & Helmer 1963）および予測市場における独立性要件の一次文献
6. 「生成コードを見る前に意図を書かせる」実装を持つ 2026 年時点のツール・実務例
7. 日本の決裁・押印の形骸化を示す定量データ、および第三者委員会報告書における「決裁の形骸化」記述の具体的な特定
8. 2025〜2026 年の cognitive forcing の追試・反証（10.1145/3710946 の効果量を含む）
