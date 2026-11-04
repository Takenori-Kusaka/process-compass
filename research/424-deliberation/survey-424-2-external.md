# 外部調査 424-2: 評価用基準集合の正解を AI の合議・多数決・LLM-as-a-judge で作ってよいか

- 調査日: 2026-11-04
- 調査者: process-researcher(サブエージェント)
- 議題: AI モデルの回帰評価・導入評価に使う基準集合(評価用データセット)の正解ラベル・期待する出力を、複数 AI の合議・多数決・LLM-as-a-judge で作ってよいか。人が正解を確定することを要求すべきか
- 読み方: 「1〜4」は**確かめられた事実**(出典付き)。各節の末尾に「確かめられなかったこと」を置く。本標準への含意は「考察」節にだけ書く
- 注意: 規格の本文(ISO/IEC 有償規格、FDA・NIST の PDF)は今回の取得経路では本文を読めなかったものがある。読めなかったものは「確かめられなかったこと」に明記した

---

## 1. 研究: AI による判定・ラベル付けの信頼性(2023〜2026)

### 1.1 人との一致率(高いと報告されたもの・低いと報告されたもの)

- **MT-Bench / Chatbot Arena**(Zheng ほか、NeurIPS 2023)
  - GPT-4 の判定と人の判定の一致は 80% 超で、人と人の一致と同水準と報告
  - 同時に、位置の偏り・冗長さの偏り・自己優遇の偏り・推論能力の限界を指摘
  - 出典: https://neurips.cc/virtual/2023/poster/73434
- **Judging the Judges: Evaluating Alignment and Vulnerabilities in LLMs-as-Judges**(Thakur ほか、arXiv 2406.12624、2024-06。GEM 2025)
  - 判定モデル 9 種 × 受験モデル 9 種。多くの判定モデルは人との整合が低い
  - 高い整合は GPT-4 Turbo と Llama-3 70B のみ(Cohen's κ 約 0.84 / 0.79)。人と人の κ は約 0.96
  - **一致率(percent agreement)が高くても点数が大きく食い違う**ことがあり、κ のほうが適切。整合指標が高くても過信するなと警告
  - 失敗の型: 不完全な答えへの寛容さ(lenient)
  - 出典: https://arxiv.org/html/2406.12624v2 / https://preview.aclanthology.org/setup/2025.gem-1.33
- **LLMs instead of Human Judges? JUDGE-BENCH**(Bavaresco ほか、ACL 2025 short)
  - 人の注釈つき 20 データセット、11 モデル。**データセットごとの人との相関のばらつきが大きい**
  - 人が書いた文の評価のほうが、機械が書いた文の評価より人と一致しやすい
  - **専門家より非専門家の判断と一致しやすい**
  - 結論: 使う前に、その作業に固有の人の注釈で判定モデルを検証すべき
  - 出典: https://aclanthology.org/2025.acl-short.20 / https://arxiv.org/html/2406.18403v3
- **専門知識の作業での限界**(Szymanski ほか、arXiv 2410.20266、2024-10)
  - 専門家と LLM 判定の一致: 栄養学 68%、メンタルヘルス 64%(総合的な選好)
  - 出典: https://arxiv.org/abs/2410.20266
- **日本語での報告**
  - NII LLMC の llm-jp-judge(言語処理学会 2025): 日本語 LLM-as-a-Judge ツールを人手ラベルでメタ評価して妥当性を検証
    - 出典: https://anlp.jp/proceedings/annual_meeting/2025/pdf_dir/Q2-4.pdf
  - 法廷通訳の検証(言語処理学会 2026): LLM-as-a-Judge と人手評価の相関が低く、現段階での実用は困難と示唆
    - 出典: https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/TS3-4.pdf
    - 注: 検索結果の要約による。本文は未読

### 1.2 系統的な偏り

- **自己優遇(self-preference)**
  - Panickssery・Bowman・Feng(NeurIPS 2024): GPT-3.5 Turbo・GPT-4・Llama 2 は、人が同等と判断する場合でも自分の生成した要約を高く評価する。**自己認識能力と自己優遇の強さに線形の相関**があり、微調整で自己認識を変えると自己優遇も変わる(因果的な関係を示唆)
  - 出典: https://papers.nips.cc/paper_files/paper/2024/hash/7f1f0218e45f5414c79c0679633e47bc-Abstract-Conference.html
- **類似モデルの優遇**
  - Goel ほか「Great Models Think Alike and this Undermines AI Oversight」(ICML 2025、arXiv 2502.04313、v1 2025-02-06 / v2 2025-06-12): **LLM-as-a-judge は判定モデルに似たモデルを高く採点する**
  - 出典: https://arxiv.org/abs/2502.04313
- **位置の偏り**
  - Shi ほか「Judging the Judges: A Systematic Study of Position Bias in LLM-as-a-Judge」(arXiv 2406.07791、最新版 2025-11): 有能な判定モデルでも位置の偏りは偶然ではない。判定モデル・作業ごとに大きく異なる。**比べる 2 つの解の品質差が小さいほど偏りが強く出る**
  - 出典: https://arxiv.org/html/2406.07791v9
- **冗長さ(長さ)の偏り**
  - OpenAI の評価ガイドが、位置の偏りと冗長さの偏りを明記し、応答の長さを統制するよう推奨(3.2 節)
- **自分で解けない問題の判定が弱い**
  - Krumdick ほか「No Free Labels」(arXiv 2503.05061、2025-03): 判定モデルが自分でその問題に正答できるかどうかが、その問題の判定の正しさを強く予測する。**全体の一致率が高くても、判定モデルが解けない問題では判定が弱いことが隠れる**
  - **人が書いた正しい参照解**を与えると、人との一致が上がり自己優遇が減る。高品質な人の参照解を与えた弱い判定モデル(Qwen 2.5 7B)が、合成の参照解を与えた強い判定モデル(GPT-4o)より人と一致した(二次要約による)
  - 出典: https://arxiv.org/html/2503.05061v1

### 1.3 同系統のモデルの誤りの相関(correlated errors)

- **Correlated Errors in Large Language Models**(Kim・Garg・Peng・Garg、ICML 2025、PMLR v267)
  - 349 モデル × 12,032 問(HuggingFace leaderboard)、71 モデル × 14,042 問(HELM)
  - **2 つのモデルが両方とも誤るとき、同じ誤答に一致する割合が 60%**
  - 同じ設計(アーキテクチャ)・同じ提供者で相関が強い。**大きく正確なモデルほど、設計・提供者が違っても誤りの相関が高い**
  - 出典: https://proceedings.mlr.press/v267/kim25e.html / https://icml.cc/virtual/2025/poster/44225
- **Great Models Think Alike**(上掲)
  - 誤りの重なりに基づく類似度指標 CAPA を提案。**能力が上がるほどモデルの誤りが似てくる**。AI による監督に共通の盲点が生じる危険
  - 出典: https://arxiv.org/abs/2502.04313

### 1.4 合議・多数決の効果の限界

- **Replacing Judges with Juries(PoLL)**(Verga ほか、Cohere、arXiv 2404.18796、2024-04)
  - 3 系統の小型モデルの合議(Command R・Haiku・GPT-3.5)は、単一の GPT-4 判定より人との相関が高く、モデル内の偏りが小さく、費用は 7 分の 1 以下
  - 二値は最大得票、1〜5 点は平均で集約
  - 出典: https://arxiv.org/abs/2404.18796
- **Nine Judges, Two Effective Votes: Correlated Errors Undermine LLM Evaluation Panels**(Kohli、Apple、arXiv 2605.29800、2026-06。NeurIPS 2026 の掲載ページあり)
  - 7 系統 9 つの最前線モデルの合議。3 つの NLI データセット、各項目 100 人の人の注釈
  - **9 人の合議は独立な票で約 2 票分の情報しか持たない**(名目上の独立性の約 4 分の 3 が共通の誤りで失われる)
  - 合議の正答率は独立な投票の理論値より 8〜22 ポイント低い
  - **最良の単独判定モデルが、すべての条件で合議と同等以上**
  - 既存の集約法は、正解を知っていても差の最大 11% しか埋められない
  - 出典: https://machinelearning.apple.com/research/correlated-llm-evaluation-panels / https://huggingface.co/papers/2605.29800
- **モデル間の一致は外部検証の代わりにならない**
  - Said・Villaneau(CAS 2026): 子どもの感情の注釈で、LLM 同士の一致が高くても人による外部検証の代わりにならない
  - 出典: https://aclanthology.org/2026.cas-1.11/
  - 注: 検索結果の要約による。本文は未読

### 1.5 人のラベルを減らせる量の理論的上限と統計的補正

- **Limits to scalable evaluation at the frontier: LLM as Judge won't beat twice the data**(Dorner・Nastl・Hardt、arXiv 2410.13341、v3 2026-01。ICLR 2025)
  - **判定モデルが評価対象のモデルより正確でないとき、どの偏り補正法を使っても、必要な正解ラベル(人のラベル)の量を半分より減らせない**
  - 判定モデルの正答率が高くても、LLM ラベルを使うと順位が大きく乱れることがある
  - 判定モデルと正解の一致率は、判定の偏りや節約量を意味のある形で制限しない
  - 2 倍を超える節約が出るのは、最先端モデルで大幅に弱いモデルを判定する狭い場合だけ
  - 出典: https://arxiv.org/abs/2410.13341v3
- **Prediction-Powered Inference(PPI)系**: 少数の人のラベル + 大量の AI ラベルで、偏りを補正した推定と妥当な信頼区間を得る
  - StratPPI(Fisch ほか、NeurIPS 2024): 層別で区間を狭める。自動ラベラーへの仮定なし
    - 出典: https://proceedings.neurips.cc/paper_files/paper/2024/hash/c9fcd02e6445c7dfbad6986abee53d0d-Abstract.html
  - Confidence-driven inference(Gligorić ほか、NAACL 2025): LLM の自信度で人が注釈する項目を選ぶ。人の注釈を 25% 超削減。**LLM ラベルを人のデータとして素朴に扱うと推定が不正確で、信頼区間の被覆も悪い**
    - 出典: https://arxiv.org/html/2408.15204v2
  - Calibeating PPI(arXiv 2604.21260、2026-04): 代理の採点を素朴に使うと、人のラベルだけの推定より大幅に悪くなることがある。較正しても節約は約 2.5〜3.1%(PPE Human Preference)
    - 出典: https://arxiv.org/pdf/2604.21260
  - Augmenting Human Evaluation with LLM Judges: How Many Human Reviews Do You Need?(Kim、arXiv 2605.16354、2026-05)
    - **LLM 判定の役割を「代替」から「補助」へ移す**。LLM は全件、人は部分標本(2 段抽出 + 二重頑健推定)
    - 検出力の目標から、人と LLM の必要件数を決められる。**LLM の判定が予測しにくい種類の評価へ人のラベルを多く割り当てる**
    - 「基準集合を検証するときに人の監督をどれだけ残すべきかについての指針はほとんどない」と明記
    - 出典: https://arxiv.org/abs/2605.16354
- **人の注釈者を LLM で置き換えてよいかの統計的検定**
  - Alternative Annotator Test(Calderon・Reichart・Dror、ACL 2025): 人の注釈者を 1 人ずつ外し、LLM と外した人のどちらが残りの人をよく代表するかを比べる。**一部の注釈済み標本が要る**(人の注釈が前提)。LLM が人を置き換えられる場合もある
  - 出典: https://arxiv.org/abs/2501.10970v3 / https://github.com/nitaytech/alttest

### 1.6 正解そのものの誤り(人が作った正解も誤る)

- **Pervasive Label Errors in Test Sets**(Northcutt・Athalye・Mueller、NeurIPS 2021 D&B)
  - 主要 10 データセットのテスト集合に平均 3.3〜3.4% のラベル誤り(ImageNet 検証集合で約 6%)
  - **手順: アルゴリズム(confident learning)が候補を挙げ、人(クラウドワーカー)が確認**。候補の約 54% が誤りと確定
  - 誤りの比率が数ポイント変わるだけでモデルの順位が逆転する(ResNet-18 と ResNet-50 など)
  - 出典: https://arxiv.org/abs/2103.14749v1
- **Do Large Language Model Benchmarks Test Reliability?(platinum benchmarks)**(Vendrow ほか、MIT、arXiv 2502.03461、2025-02)
  - 15 の基準集合を改訂。**いずれかのモデルが誤った問題を人が手で点検し、ラベルを直すか除く**
  - GSM8K の約 5% など、誤った問題の比率がモデルの誤り率を超える基準集合もある
  - 出典: https://arxiv.org/abs/2502.03461
- **Are LLMs Better than Reported?**(Nahum ほか、arXiv 2410.18889、v2 2025-09)
  - LLM の合議で誤ラベルの候補を挙げる。専門家・クラウド・LLM の注釈を比較。誤りを直すと報告性能が上がる
  - 出典: https://arxiv.org/abs/2410.18889
  - 注: 「信頼度 95% 超で挙げた候補の 3 分の 2 超を専門家が確認」という数値は二次要約による。要旨では確かめられなかった

### 1.7 AI の下書きを人が確認するときの偏り(自動化バイアス・係留)

- **Bias in the Loop**(Beck・Eckman・Kern・Kreuter、arXiv 2509.08514、Harvard Data Science Review 2026)
  - 2,784 人の無作為化実験(AI が抽出した排出量の値を人が検証)
  - AI に懐疑的な人ほど誤りを見つけ正確。自動化に好意的な人ほど誤った提案を受け入れる
  - **誤りを指摘するのに正しい値の入力が必要な設計だと、人は事前注釈を直さなくなる**
  - 出典: https://arxiv.org/abs/2509.08514
- **LLM の提案を見せたクラウドワーカー**(arXiv 2507.15821)
  - 作業は速くならず、自信だけが上がった。**注釈者は LLM の提案に強く引きずられ、ラベル分布が大きく変わった**
  - 出典: https://arxiv.org/abs/2507.15821
  - 注: 検索結果の要約による

### 1.8 確かめられなかったこと(研究)

- 「位置を入れ替えると最大 75% 先頭を選ぶ」「GPT-4 は自分の出力を約 10%、Claude-v1 は約 25% 優遇」という数値は二次記事にしかなく、原論文で確かめられなかった
- 「Judge's Verdict」(2025)、「The Geometry of LLM-as-Judge」(2026)は所在を確かめられなかった
- 「人の注釈 + AI 事前注釈」と「人だけ」を同じデータセットで直接比べ、最終ラベルの品質を測った研究は見つけられなかった
- コード生成・エージェントの評価に特化した、判定モデルの人との一致の大規模研究は今回は見つけられなかった

---

## 2. 規格・規制・公的ガイド

### 2.1 ISO/IEC

- **ISO/IEC 42001:2023 附属書 A.7(AI システムのためのデータ)**
  - データの取得・品質・来歴・準備を扱う管理策群(A.7.4 がデータ品質)。**品質の次元と閾値は組織が決めて記録する。規格は値を定めない**。測定は ISO/IEC 5259 系を参照(二次解説による)
  - 出典: https://isms.online/iso-42001/annex-a-controls/a-7-data-for-ai-systems
- **ISO/IEC 5259-2:2024(データ品質の測定量)**
  - ラベルの正確さ(Acc-ML-7「data label accuracy」)、ラベルの完全性(Com-ML-5)、ラベルの一貫性(Con-ML-2: 似た項目に同じラベルが付くか)を測定量として定義(二次解説による)
  - 出典: https://blog.pebblous.ai/project/ISO5259/5259-2-cheetsheet-01/en/ / https://scc-ccn.ca/standardsdb/standards/2056381
- **ISO/IEC 5259-4:2024(データ品質のプロセス枠組み)**
  - 学習データと**評価データ**の品質を確保する組織的な取り組みを規定。教師あり学習のラベル付けと、その組織的な進め方を扱う。ラベルの不正確さは偏りや重大な誤りを招く
  - サービス・基盤・道具は規定しない
  - 出典: https://www.iso.org/standard/81093.html
- **ISO/IEC 25059:2023(AI システムの品質モデル)**
  - ISO/IEC 25010 に 6 つの副特性を追加し、**機能正確性の定義を変更**(機械学習の AI はすべての状況で正確とは限らないため、正確さ・不正確さを慎重に測る必要がある)
  - 出典: https://iso25000.com/index.php/en/iso-25000-standards/iso-25059 / https://store.standards.org.au/product/as-iso-iec-25059-2024
- **ISO/IEC TS 42119-2:2025(AI の試験 第 2 部)**
  - ISO/IEC/IEEE 29119 を AI システムへ適用する要求事項と手引き。目次にデータ品質の試験の型を含む
  - 出典: https://standards.iteh.ai/catalog/standards/iso/84238ac8-ab61-4c6d-956f-7db8f961b8b9/iso-iec-ts-42119-2-2025

### 2.2 NIST

- **NIST AI 600-1(生成 AI プロファイル、2024-07)**
  - Measure の推奨行動に、TEVV(試験・評価・検証・妥当性確認)として正解との比較(ground-truth comparison)・事実確認・レッドチームを含む
  - MS-1.3-003: 構造化された評価(レッドチームなど)を行う者を、同じモデルの開発に直接関わらない者とする(独立性)
  - 任意の資源であり認証の項目表ではない
  - 出典: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf(本文は今回は直接読めず、二次解説 https://www.anaconda.com/blog/nist-ai-600-1-generative-ai-profile-guide で確認)
- **NIST AI 800-2 初期公開草案「Practices for Automated Benchmark Evaluations of Language Models」**(CAISI、2026-01-30 公開、意見募集 2026-03-31 まで)
  - 3 部構成(評価目的の定義と基準集合の選定 / 実装と実行 / 分析と報告)。不確かさを信頼区間・標準誤差で示すよう推奨
  - 自動の基準集合は、構造化され検証可能で安定した作業に向き、主観的・動的・人が介在する評価には向かない(報道による)
  - 市民団体の意見書: 高リスクの評価は人の確認・レッドチーム・実地試験と組み合わせるべき。CDT の意見書: LLM-as-a-judge の自己中心の偏り・長さの偏り・実装の細部への感度を指摘
  - 出典: https://www.nist.gov/node/1905466 / https://cdt.org/insights/cdt-submits-comments-on-nists-draft-guidance-for-automated-benchmark-evaluations-of-language-models/ / https://rail.nationalfairhousing.org/wp-content/uploads/2026/04/Civil-Coalition-Letter_NIST-Draft-Guidance-on-Automated-Benchmark-Evaluations-of-Language-Models_03-31-2026.pdf

### 2.3 EU AI Act(Regulation (EU) 2024/1689)第 10 条

- 第 1 項: 高リスク AI は、第 2〜4 項の品質基準を満たす**学習・検証・試験のデータ集合**に基づいて開発する
- 第 2 項(c): データ準備の処理として「annotation, labelling, cleaning …」を挙げ、データガバナンスの対象にする
- 第 2 項(f)(g): 偏りの検査と、検出・防止・緩和の措置
- 第 2 項(h): 適合を妨げるデータの欠落・不備の特定
- 第 3 項: 学習・検証・**試験**のデータ集合は、関連性があり、十分に代表的で、可能な限り誤りがなく完全で、適切な統計的性質を持つこと
- 第 6 項: AI モデルの学習を伴わない高リスク AI では、第 2〜5 項は**試験データ集合にだけ**適用する
- 試験データの定義: 市場投入・供用の前に AI システムを独立に評価し、期待される性能を確かめるためのデータ
- 2026 年の Digital Omnibus on AI(2026-07-27 発効と記載)で第 4a 条(偏り検出のための特別カテゴリーのデータの処理)が新設。第 10 条第 5 項は改正後の掲載では「存在しない」と表示
- 出典: https://artificialintelligenceact.eu/article/10/ / https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4a / https://www.artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/
- **条文が言っていないこと**: 誰がラベルを付けるか(人か AI か)は規定していない。規定しているのは、ラベル付けをガバナンスの対象にすること、試験データの誤りのなさ・代表性・偏りの検査

### 2.4 医療機器(FDA・IMDRF)と医療画像の reference standard

- **FDA / Health Canada / MHRA の GMLP 指導原則(2021-10)→ IMDRF N88 FINAL:2025(2025-01)**
  - 原則 4「学習データ集合は試験データ集合から独立している」: 患者・取得・施設などの依存の源を考え、適切に独立させる
  - 原則 5「選んだ参照データ集合は、利用できる最良の方法に基づく」: 参照データ集合(reference standard)の開発に、受け入れられた最良の方法を使い、**参照の限界を理解する**
  - 拘束力はない。FDA のページは 2025-12-19 時点で IMDRF N88 へ案内
  - 出典: https://www.fda.gov/media/153486/download / https://imdrf.org/sites/default/files/2025-02/IMDRF_AIML%20WG_GMLP_N88%20Final.pdf / https://www.fda.gov/medical-devices/artificial-intelligence-enabled-medical-devices/good-machine-learning-practice-medical-device-development-guiding-principles
- **FDA 草案「Artificial Intelligence-Enabled Device Software Functions: Lifecycle Management and Marketing Submission Recommendations」**(2025-01-07、草案、拘束力なし、docket FDA-2024-D-4488)
  - 試験データの開発データからの独立性、開発に使った reference standard、データの代表性の説明を求める
  - reference standard を「各患者・症例・記録の真の状態を定めるのに最も適した基準」と定義(法律事務所の要約による)
  - **臨床的な解釈を reference standard にする場合、解釈する臨床医の資格・人数・与えるデータ・結果の結合方法を定めること**(二次要約による)
  - 性能検証で、装置の出力を reference standard の作成者と開発者の双方から隠す(masking)(法律事務所の要約による)
  - 2026-02 時点の要約でも草案のまま。2026 年度の指針の予定に含まれる
  - 出典: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/artificial-intelligence-enabled-device-software-functions-lifecycle-management-and-marketing / https://www.venable.com/insights/publications/2025/01/ai-on-the-prize-decoding-fdas-latest-guidance / https://hlc.com/en/publications/fda-device-guidance-agenda-what-to-watch-in-2026
- **FDA「Clinical Performance Assessment: Considerations for Computer-Assisted Detection Devices Applied to Radiology Images」**(最終、2022-09 版)
  - 目次に「Reference Standard」「Training of Clinical Readers」の節がある
  - 出典: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-performance-assessment-considerations-computer-assisted-detection-devices-applied-radiology
- **CLAIM 2024 Update**(Tejani ほか、Radiology: AI 6(4):e240300)
  - 「ground truth」を「reference standard」へ置き換え
  - 項目 14〜18: reference standard の定義・選定理由・注釈の出所・**試験集合の注釈**・注釈者間 / 注釈者内のばらつきの測定
  - 2020 版: 注釈者の人数と資格、独立に注釈したか、不一致の解決方法を記載させる
  - 出典: https://pubs.rsna.org/doi/suppl/10.1148/ryai.240300/suppl_file/ryai240300_CLAIMchecklist.docx / https://pmc.ncbi.nlm.nih.gov/articles/PMC8017414
- **医療画像の実務の研究**
  - 胸部 X 線 AI の検証(Br J Radiol 2021、Google): 正解がないときの reference standard として **3 人の専門家の合議**がよく使われる。合議の多数決は個人の読影より一致を改善。非同期の裁定 2 回でほとんどの不一致が解ける。最良の方法は所見ごとに異なる。専門医同士でも一致しにくいことを考慮すべき
    - 出典: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8248225/
  - 肺結節検出(Korean J Radiol 2023): **専門家の合議で決めた基準は AI の診断性能の測定に偏りを生む**。病理で確かめた臨床的な基準が最も良かった
    - 出典: https://koreascience.kr/article/JAKO202318057776689.page?lang=ko
- **医療の考え方の要点(事実の整理)**: 医療では「正解」を人の判断(専門家の合議)で作ることが通例だが、それ自体が誤差を持つ参照(reference standard)と扱われ、**誰が・何人で・どう結合したか・限界は何か**の記録が求められる。可能なら人の判断より強い外部基準(病理・追跡結果)を使う

### 2.5 日本

- **機械学習品質マネジメントガイドライン 第 4 版**(産総研、2023-12-12、DigiARC-TR-2023-03、CC BY 4.0)
  - 内部品質 8 項目に「データセットの被覆性」「データセットの均一性」「機械学習モデルの正確性」を含む
  - 出典: https://aist.repo.nii.ac.jp/record/2000532/files/%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92%E5%93%81%E8%B3%AA%E3%83%9E%E3%83%8D%E3%82%B8%E3%83%A1%E3%83%B3%E3%83%88%E3%82%AC%E3%82%A4%E3%83%89%E3%83%A9%E3%82%A4%E3%83%B3%E7%AC%AC4%E7%89%88.pdf
- **AISI「AI セーフティに関する評価観点ガイド」**(初版 2024-09、第 1.10 版 2025-03-28)
  - 評価の実施者・実施時期の考え方、評価手法の概要を示す
  - 出典: https://aisi.go.jp/output/output_information/250328_1/

### 2.6 確かめられなかったこと(規格・規制)

- ISO/IEC 42001 A.7.4、ISO/IEC 5259-2/-3/-4、ISO/IEC 25059、ISO/IEC TS 42119-2 の**本文の文言**(有償規格。今回は公開プレビューも読めなかった)。特に 5259-4 がラベル付けの主体(人 / 自動)をどう扱うか、裁定・二重注釈を要求するか
- FDA AI 機器草案(PDF)の本文。「臨床医の資格・人数・結合方法」の記述は二次要約からで、原文の節番号を確かめられなかった。AI が生成したラベルを試験データの reference standard に使うことへの言及があるかも未確認
- FDA CADe ガイダンスの「Reference Standard」節の本文(truther の人数・読影者からの独立性)
- NIST AI 600-1・NIST AI 800-2 草案の本文(PDF を読めなかった)。800-2 が LLM 判定の検証(人との比較・判定者間一致・複数判定)をどう書いているかは、二次記事の記述(「新たな実務として紹介、必須ではない」)しかない
- EU AI Act の整合規格(CEN-CENELEC JTC 21 のデータ品質規格)の状況
- 機械学習品質マネジメントガイドラインが、ラベルの正しさ(アノテーション品質)・AI による注釈をどう扱うか(該当章を読めなかった)
- AISI のガイドが LLM-as-a-Judge・評価データの作り方を扱うか

---

## 3. 業界の実務・主要ベンダの評価ガイド

### 3.1 主要ベンダ

- **OpenAI「Evaluation best practices」**(https://developers.openai.com/api/docs/guides/evaluation-best-practices、2026-11-04 取得)
  - 人の判定は最高品質だが遅く高価。人の専門家同士の不一致を課題として挙げる
  - 「人のフィードバックで自動採点を較正し、一致を保つ」。判定モデルが人の注釈と一貫して一致してから規模を広げる。**費用・遅延の最適化の前に、人のラベルとの一致を検証する**
  - 正解の作り手: 要約の例では**専門家(書き手)が作ったデータ集合**、Q&A の例では**専門家が作った固定の正答**。試験データには「人の専門家のラベラーを使う」
  - モデルで評価例・境界事例を生成することも勧める(生成は入力の多様化の用途)
  - 位置の偏り・冗長さの偏りを明記。複数の査読者の集約に合意投票(consensus votes)を使う
- **Anthropic「Demystifying evals for AI agents」**(2026-01-09、https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  - 各タスクに**参照解**(すべての採点器を通る既知の正しい出力)を作る。タスクが解けること・採点器の設定が正しいことの証明
  - 「LLM-as-judge の採点器は**人の専門家と密に較正**し、人と機械の採点の乖離が小さいことの確信を得る」
  - **良いタスクの条件: 2 人の専門家が独立に同じ合否に達すること**。達しないならタスクを直す。仕様の曖昧さは指標の雑音になる
  - 体系的な人の研究は、LLM 採点器の較正か主観的な出力の評価に取っておく。仕組みが安定したら人の確認は時々でよい。抜き取り(spot-check)と A/B を人の採点方法に挙げる
  - 実行記録(transcript)を多数読まなければ採点器が機能しているかわからない
- **Google Vertex AI「Evaluate a judge model」**(https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/evaluate-judge-model)
  - 判定モデル(autorater)を評価するには「**人の評点を ground truth とする評価用データ集合を用意する**」
  - 一致の指標: 二値は 2 クラスの balanced accuracy・balanced F1、多クラスはその拡張、混同行列
  - 推奨件数の記載なし

### 3.2 公開ベンチマークの正解の作り方(実例)

- **SWE-bench Verified**(OpenAI、2024-08)
  - Python 経験のある開発者 93 人が、SWE-bench のテスト集合から無作為に選んだ 1,699 件を人手で選別し、500 件を採用
  - **各件に 3 人が独立にラベル**。不一致のときは平均せず**最も深刻な問題の評定を採る**
  - 出典: https://openai.com/index/introducing-swe-bench-verified/(本体は 403 で読めず、検索結果の抜粋と二次記事 https://wandb.ai/byyoung3/ml-news/reports/OpenAI-Releases-SWE-bench-Verified--Vmlldzo5MDI3NzU0 で確認)
- **platinum benchmarks・Northcutt**(1.6 節): 機械が候補を挙げ、人が確定する形

### 3.3 評価基盤ベンダの実務(二次情報)

- Arize: 判定モデルの乖離を見るには 20〜50 件の人のラベルで足りることが多い。固定の標本は 50〜数百件、境界事例を含める
  - 出典: https://arize.com/docs/ax/cookbooks/improve/align-llm-evals-with-human-judgment
- Evidently: 数値の点数より二値・少数クラスを推奨。狭く定義した判定器が良い
  - 出典: https://www.evidentlyai.com/blog/how-to-align-llm-judge-with-human-labels
- 注: これらの件数に統計的な根拠は示されていない

### 3.4 確かめられなかったこと(実務)

- OpenAI evals(オープンソースの枠組み)・Anthropic の公式ドキュメント(develop-tests)の本文。今回は英語本文を取得できなかった
- 二重注釈・裁定の比率、AI 事前注釈の抜き取り比率の業界標準(公開された規範は見つけられなかった)
- 日本企業での実態(評価データの正解を誰が作っているか、建前と実運用の乖離)を示す一次資料は見つけられなかった。一創の解説記事(https://www.issoh.co.jp/tech/details/8712/)は本文未読

---

## 4. AI が下書きして人が確定する形

### 4.1 確かめられたこと

- **研究の基準集合の改訂では標準的な形**: 機械(confident learning・モデルの誤答・LLM の合議)が候補を挙げ、人が確定する(Northcutt 2021、Vendrow 2025、Nahum 2024/2025)。この形では**機械が挙げなかった項目は人が見ない**ため、機械と人の両方が見落とす誤りは残る(手順からの帰結。各論文の手順記述による)
- **確認の深さが結果を左右する**: 事前注釈を見せると人は引きずられる(arXiv 2507.15821)。修正に手間がかかる設計だと直さない。AI に好意的な人ほど誤りを通す(Beck ほか 2026)
- **抜き取りの比率の根拠**
  - 固定の比率(何 % を見ればよい)を規範として定めた一次資料は見つけられなかった
  - 統計的には、必要な人のラベルの量は「目標とする精度・検出力」と「判定モデルの予測しにくさ」から決まる(Kim 2026、PPI 系)。**判定モデルが評価対象より強くない限り、人のラベルは半分より減らせない**(Dorner ほか)
  - 層別に割り当てる(LLM が予測しにくい種類へ人を多く)のが効率的(StratPPI、Kim 2026、confidence-driven inference)
- **人の確認自体も誤差を持つ**: 医療画像では専門家の合議の基準が AI の性能測定に偏りを生む例があり(Korean J Radiol 2023)、注釈者間のばらつきの測定と記録が求められる(CLAIM 2024)

### 4.2 確かめられなかったこと

- 「AI の下書き → 人が全件確認」と「人がゼロから注釈」で、最終の正解の誤り率を比べた研究
- 抜き取りの比率について、規格・規制が数値を示した例

---

## 5. 考察(解釈。事実ではない)

- **判断軸の整理**: 研究の大勢は「AI の判定・合議は、人の正解に照らして較正・検証されたときに限り、補助として使える」。根拠となる人の正解を AI で作ると、検証の基準そのものが失われる。主要ベンダ 3 社の公式ガイドも、いずれも**人の評点・専門家の正解を判定モデルの較正の基準**に置いている
- **合議・多数決は独立性の代わりにならない**: 誤りの相関(Kim 2025: 両方誤るとき 60% が同じ誤答、Kohli 2026: 9 票が実質 2 票)から、系統の違う複数モデルを並べても、人の正解の代わりになる独立性は得られない。PoLL の改善は「単一の判定より良い」の比較であり、「人の代わりになる」の証拠ではない
- **回帰評価に固有の危険**: 評価対象と同系統のモデルが正解を作ると、自己優遇・類似モデル優遇(Panickssery 2024、Goel 2025)により、評価対象に有利な基準集合になる。モデル更新の回帰評価・導入評価はまさにこの構図になりやすい
- **規格・規制は「人が付けよ」とは書いていない**: EU AI Act 第 10 条も GMLP も、ラベル付けの主体を指定せず、**ガバナンス・誤りのなさ・独立性・参照の限界の理解と記録**を求めている。FDA 草案(二次要約)は臨床医の資格・人数・結合方法の定義を求めており、「人が作る」を前提にしつつ、その手順の記録を要求する形。本標準で「人が確定する」を要求するなら、それは規格の直写ではなく本標準の判断になる(根拠水準マークの対象になりうる)
- **議論の候補となる選択肢(会議体で競わせる素材)**
  - 案 A: 正解は人が確定する(AI の下書きは可)。確定者・人数・不一致の解き方・確認の深さを記録する
  - 案 B: AI の合議で作ってよいが、人が確定した部分標本で判定モデルとの一致を測り(κ・balanced accuracy、信頼区間付き)、閾値を満たすときに限る
  - 案 C: 用途で分ける。合否・出荷判断に使う基準集合は人の確定、探索的な比較は AI ラベル可
  - 各案の弱点: A は人の誤り・係留の偏りを消せない(確認の深さの規定が要る)。B は人の部分標本が前提で、評価対象が判定モデルより強いと節約が効かない(Dorner)。C は用途の境界が曖昧になりやすい
- **日本の実態について**: 建前(人がレビュー済み)と実運用(AI の下書きを通し読みで承認)の乖離を示す一次資料は見つけられなかった。ただし Beck ほか 2026 の結果は、形式的な承認では誤りが残ることを示しており、日本の稟議・押印型の承認文化で同じことが起きる可能性はある(推測。実証なし)

---

## 6. 追加調査が必要な穴

- ISO/IEC 5259-3 / -4 の本文(ラベル付けの主体・検証の要求)と、ISO/IEC TS 42119-2 のデータ品質の試験の型
- FDA AI 機器草案・CADe ガイダンスの reference standard の節の原文(PDF の本文抽出が必要)
- NIST AI 800-2 草案の本文(LLM 判定の扱い)
- AI 事前注釈と人だけの注釈の、最終品質の直接比較研究
- 日本企業での評価データの正解づくりの実態(建前と運用の乖離)
- コード生成・エージェント評価に特化した判定モデルと人の一致の研究
