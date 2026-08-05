# Issue #124 一次調査メモ: IT投資委員会・SteerCo 接続用の予算・リソース配賦(FinOps)と Kill ゲート基準

- 調査日: 2026-08-05
- 対象 Issue: #124(フェーズ4 標準プロセス)
- 目的: 開発プロセスの各ゲートを、経営側の IT 投資委員会・ステアリングコミッティ(SteerCo)へ接続するための「金の流れ」と「止める基準」を、一次情報ベースで整理する
- 注記: 本メモは事実(出典付き)と考察を分離している。断定できない点は「未確認」と明記する

---

## 0. サマリ(結論の骨子)

本調査で確認できた要点は以下のとおりです。

- FinOps Foundation の Framework は 2025 年改訂で **Scopes** を中核要素に格上げし、2026 年改訂で定義自体を「テクノロジーのビジネス価値最大化」へ拡張。AI は独立した Technology Category として扱われる
- AI/LLM コストは **Unit Economics(cost per inference / cost per query / cost per workflow)** で語るのが公式ガイダンスの方向。開発現場では **cost per merged PR / cost per resolved issue** が実務指標として立ち上がりつつある
- Kill 判断は「基準を先に決めておく」ことが本質。Stage-Gate の **Must-meet(ノックアウト) / Should-meet(スコアカード)** 構成が最も再利用しやすい
- 中止できない現象には確立した理論(エスカレーション・オブ・コミットメント)がある。de-escalation は当事者ではなく**外部トリガー(上位管理者・内部監査・外部コンサル)**で起きるという実証結果がある
- 自動上程トリガーの実装モデルは、EVM の CPI/SPI 閾値、FinOps の Anomaly Management、SRE のエラーバジェットポリシーの3系統が参照可能

---

## 1. FinOps Framework の最新状況(2025→2026)

### 1.1 フレームワークの構成要素

FinOps Framework は運用モデルとして以下の要素で構成されます([FinOps Framework Overview](https://www.finops.org/framework/), 2026 年時点)。

- **Principles(6原則)**: チーム協働、ビジネス価値が技術判断を駆動、全員が利用に対するオーナーシップを持つ、データはアクセス可能かつ適時かつ正確、FinOps は中央で有効化される、変動費モデルを活用する
- **Personas**: Core = FinOps Practitioner / Engineering / Finance / Leadership / Procurement / Product、Allied = ITAM / ITFM / ITSM / Security / Sustainability
- **Phases**: Inform → Optimize → Operate
- **Maturity**: Crawl / Walk / Run
- **Scopes**: Custom Scope / Product / Cost Center
- **Technology Categories**: AI / Public Cloud / SaaS / Data Platform / Private Cloud / Licenses / Data Center

Domain と Capability の対応は次のとおりです(出典: 同上)。

- **Understand Usage & Cost**: Data Ingestion、Allocation、Reporting & Analytics、Anomaly Management
- **Quantify Business Value**: Planning & Estimating、Forecasting、Budgeting、KPIs & Benchmarking、Unit Economics
- **Optimize Usage & Cost**: Architecting & Workload Placement、Usage Optimization、Rate Optimization、Licensing & SaaS、Sustainability
- **Manage the FinOps Practice**: Executive Strategy Alignment、FinOps Practice Operations、Governance, Policy & Risk、FinOps Education & Enablement、Invoicing & Chargeback、FinOps Assessment、Automation, Tools & Services、Intersecting Disciplines

3フェーズの役割分担は以下です([FinOps Phases](https://www.finops.org/framework/phases/))。

- **Inform**: 配賦・可視化・予測・単位経済性により現状把握を行う段階
- **Optimize**: Inform で得た全体像をもとに効率と価値の改善機会を特定する段階
- **Operate**: 変更を実行する権限を個人へ委ね、継続運用へ落とす段階

### 1.2 Scopes の格上げ(2025 改訂)

- 2025 年3月承認の Framework 2025 改訂で **Scope** が中核要素として定義。「FinOps の概念を適用する技術関連支出のセグメント」と定義される([2025 FinOps Framework](https://www.finops.org/insights/2025-finops-framework/))
- 当初の Scope は Public Cloud / SaaS / Data Center。実務者は Private Cloud、Licensing、**AI コスト**の Scope を独自に定義し始めている(同上)
- State of FinOps では **AI 支出を管理する実務者が 63%(前年 31%)** へ急増([The State of FinOps Report 2025](https://data.finops.org/2025-report/))

### 1.3 Framework 2026 改訂(2026-03-19 公表)

[2026 FinOps Framework](https://www.finops.org/insights/2026-finops-framework/) の要点は以下です。

- 定義の拡張: "FinOps is an operational framework and cultural practice which maximizes the business value of technology"
- Scope が「支出の分類」から「事業戦略実行の実践的メカニズム」へ位置づけ変更。ビジネス上の問い(business questions)から Scope を構成する
- Technology Category ガイダンスを5本新規公開(Public Cloud / SaaS / Data Center / Data Cloud Platforms / **AI**)
- **Executive Strategy Alignment** を Manage the FinOps Practice ドメインの新 Capability として追加

Executive Strategy Alignment の中身は投資委員会接続の観点で重要です([Capability: Executive Strategy Alignment](https://www.finops.org/framework/capabilities/executive-strategy-alignment/))。

- 構成4領域: Executive Priority Alignment / Multi-Year Investment Strategy / Facilitate Product Prioritization Strategy / Enable Strategic Decision Support
- ペルソナ別責務: Leadership = スポンサーシップとガバナンス設定、Finance = ITFM 整合とシナリオ分析、Product = ユニット経済性との接続、Procurement = 予測活用と契約管理
- 成熟度: Crawl = 軽量ガバナンス・単一 Scope・アドホックな関連付け / Walk = 複数カテゴリ Scope・定期ガバナンス / Run = 運用モデル確立・戦略入力が必須・変化イベント対応

### 1.4 FOCUS 仕様

- FOCUS は クラウド / SaaS / データセンター等を横断する請求・使用量データの共通スキーマ([FOCUS](https://focus.finops.org/), [What is FOCUS?](https://focus.finops.org/what-is-focus/))
- **FOCUS 1.3 は 2025-12-05 に承認**。契約条件(開始日・終了日・残ユニット等)を切り出す Contract Commitment データセット、共有コスト按分用カラム、データ鮮度・完全性フラグを追加([Linux Foundation プレスリリース](https://www.linuxfoundation.org/press/finops-foundation-launches-focus-1.3-to-deepen-cloud-and-saas-billing-transparency-announces-expanded-vendor-support-for-focus-1.2), [FOCUS Specification v1.3](https://focus.finops.org/focus-specification/v1-3/))
- FOCUS 1.4 が 2026-06-04 に承認されたとの記述あり(2データセット・47カラム追加)。ただし検索結果経由の情報であり、**一次ページでの再確認が未了(未確認)**

### 1.5 FinOps for AI 公式ガイダンス

[FinOps for AI Overview](https://www.finops.org/wg/finops-for-ai-overview/)(最終更新 2026-02-17)の要点です。

- **コスト段階**: Training / Inference(最頻のコストドライバー) / Fine-tuning / Data preparation
- **配賦の困難**: モデル出力の消費者特定が困難(同一モデルを複数インターフェース・機能モジュールが利用)、ベンダー請求情報の不統一、多層アーキテクチャによる追跡性低下
- **単位経済性メトリクス**: Cost Per Inference、トークンあたりコスト、Training Cost Efficiency、Cost Per API Call、ROI
- **推奨アクション**: 部門別 showback、利用上限・クォータ・スロットリング、モデルの pruning / quantization / distillation、予測可能ワークロードへのリザーブド適用

[Token Economics: Managing AI Value in SaaS Model Token Costs](https://www.finops.org/wg/token-economics-saas/)(最終更新 2026-06-03)の要点です。

- 出発点は API キーガバナンス、プロキシ/可観測性レイヤー導入、ワークロード単位の属性付け
- 最適化レバー: モデルサイズ最適化(最大 90% 削減)、Batch API(50% 割引)、プロンプトキャッシング(キャッシュ部分で最大 90% 削減)、コンテキストウィンドウ管理
- 単位メトリクス: クエリあたりコスト、ユーザーあたり月次コスト、ワークフロー完了あたりコスト、業務トランザクションあたりコスト
- 課題の根因として **開発者主導の購買、不透明な請求、ネイティブな配賦機構の欠如、モデル階層ごとに大きく異なる価格体系** を指摘

関連ワーキンググループとして [Choosing an AI Approach and Infrastructure Strategy](https://www.finops.org/wg/choosing-an-ai-approach-and-infrastructure-strategy/) と [Unlocking AI Business Value with FinOps](https://www.finops.org/wg/unlocking-ai-business-value-with-finops/) が公開されています。

### 1.6 Unit Economics Capability

[Capability: Unit Economics](https://www.finops.org/framework/capabilities/unit-economics/) の定義です。

- 技術利用と技術マネジメントが製品・サービス・活動の価値へ与える影響を理解するための指標を開発・追跡するケイパビリティ
- 単位の例: 売上あたり、認証ユーザー 100 万あたり、トランザクションあたり、顧客あたり、**解決ケースあたり(per case resolved)**
- 実践指針: 目標の文書化、意思決定を駆動する指標の定義、**リソース効率メトリクスとビジネス単位メトリクスの区別**、全ペルソナ向けにデータソースと算出方法を文書化

---

## 2. LLM/エージェント利用のコスト管理実務(2026-08 時点)

### 2.1 コスト可観測性ツールの分業構造

2026 年時点で、ツールは大きく2層に分かれます([Helicone vs Langfuse vs LangSmith 2026](https://particula.tech/blog/helicone-vs-langfuse-vs-langsmith-llm-observability), [Best LLM Cost Tracking Tools 2026](https://leanlm.ai/blog/llm-cost-tracking-tools))。

- **ゲートウェイ層(事前の予算強制)**: LiteLLM、Helicone、Portkey、OpenRouter。トークンを消費する前にバジェットを強制できる
- **可観測性/トレース層(事後の配賦)**: Langfuse、LangSmith、Braintrust。ユーザー別・機能別のコスト帰属をトレース粒度で行う
- Helicone は OpenAI 互換ゲートウェイとして base URL 変更のみでリクエスト・レスポンス・トークン量・コスト・エラーを記録([Helicone Cost Tracking](https://docs.helicone.ai/guides/cookbooks/cost-tracking))
- 規模別の使い分け目安(月次 LLM 支出): 約 3 万ドル未満は Helicone、3 万〜20 万ドルは Langfuse、20 万ドル超かつ LangGraph 投資が深い場合は LangSmith(出典: 上記比較記事、ベンダー中立性は要留意)

注記: 上記の規模別推奨は二次情報(ブログ)であり、**一次ベンダードキュメントによる裏付けは未確認**です。

### 2.2 コスト最適化レバー(一次情報)

- **プロンプトキャッシング**: キャッシュヒットは標準入力価格の 10%。長いプロンプトで最大 90% のコスト削減と 85% のレイテンシ削減([Anthropic Prompt caching](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching), [Pricing](https://docs.anthropic.com/en/docs/about-claude/pricing))
- **バッチ処理**: Message Batches API は入力・出力トークンともに 50% 割引。プロンプトキャッシングとの併用(スタック)が可能([Batch processing](https://docs.anthropic.com/en/docs/build-with-claude/message-batches))
- **モデル階層化**: FinOps Token Economics ガイダンスがモデルサイズ最適化で最大 90% 削減と記載(出典は 1.5 節)

### 2.3 単位あたりコスト指標(cost per task / cost per resolved issue)

- 単位の定義方法は「PR merged」または「ticket closed」を単位に置き、配賦済み AI 支出をその件数で割る。結果は cost-per-PR / cost-per-ticket としてチーム別・個人別に更新される([Multi-Model LLM Cost Tracking](https://www.buildmvpfast.com/blog/cost-tracking-multi-model-ai-token-usage-attribution-2026))
- Jellyfish が 2026 Q1 に 200 社・1.2 万人の開発者を分析し、**cost per merged PR がトークン利用ティアで大きく変動**すると報告(二次情報経由。[AI Coding Costs Are Now a Board Metric](https://www.joinnextdev.com/blog/ai-coding-costs-are-now-a-board-metric))
- 開発者1人あたりの実額レンジ: インライン補完とエージェント併用のチームで **月 200〜600 ドル/人**。エージェント型(Claude Code、高自律 Cursor、独自 LLM パイプライン)は **月 200〜2,000 ドル超/人** のレンジ(同上、[AI coding assistant pricing and ROI guide 2026](https://getdx.com/blog/ai-coding-assistant-pricing/))
- 生産性側の効果として DX の調査は PR スループット中央値 +7.76%、多くの組織は 5〜15% レンジと報告(同上)

注記: これらの数値はベンダー系ブログ・調査会社発信であり、**一次データの原典確認は未了(未確認)**です。ROI 判断にそのまま使う場合は自社実測が必要です。

### 2.4 AI コーディングツールの課金モデル(シート課金 vs 従量課金)

- GitHub は Copilot の従量課金移行を公式に告知([GitHub Copilot is moving to usage-based billing](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/))
- 2026-06-01 に全プランが従量課金へ移行し、premium requests は月次の GitHub AI Credits 割当に置き換わったとされる。Business は 19 ドル/席(月 19 ドル分クレジット)、Enterprise は 39 ドル/席(月 39 ドル分クレジット)。1 クレジット = 0.01 ドル。コード補完と next-edit suggestions はクレジットを消費せず、chat・agent mode・code review・coding agent・Copilot CLI が消費対象(二次情報: [CloudZero](https://www.cloudzero.com/blog/github-copilot-cost/)、[UsageBox](https://usagebox.com/articles/github-copilot-usage-based-billing-2026))
- 上記の 2026-06-01 移行の詳細条件は二次情報のため、**GitHub 公式 Docs での再確認が必要(未確認)**

構造として押さえるべき点は次のとおりです。

- 課金が「席数(予測可能・固定費)」から「トークン消費(変動費)」へ移行するため、**年次予算の前提が崩れる**
- 固定費前提の稟議・予算枠と、変動費前提の実消費との間にギャップが生じる。ここが FinOps 導入の実務的な必要性

---

## 3. Kill 判断の理論と実務

### 3.1 エスカレーション・オブ・コミットメント

- 概念の源流は Barry M. Staw の 1976 年論文 "Knee deep in the big muddy: A study of escalating commitment to a chosen course of action"(組織的コミットメント・バイアス研究の起点)
- 失敗しつつある行動方針へのコミットメント継続は、オーバーコミットメントまたはサンクコスト効果とも呼ばれる([Escalation of Commitment: When to Stay the Course?](http://homepages.se.edu/cvonbergen/files/2013/01/Escalation-of-Commitment-When-to-Stay-the-Course.pdf))
- IS プロジェクトの **30〜40%** が明白な障害に直面してもなお不合理な継続を示すとされる(同上)
- Keil, Truex, Mixon (1995) は、絶対額ではなく **相対的なサンクコスト**が追加投資意思に影響し、**代替プロジェクトが存在するとサンクコスト効果が弱まる**ことを示した(出典: 上記レビュー論文および [Why Software Projects Escalate](https://www.researchgate.net/publication/220260274_Why_Software_Projects_Escalate_An_Empirical_Analysis_and_Test_of_Four_Theoretical_Models))

### 3.2 de-escalation(引き返し)の実証研究

- Keil & Robey (1999) "Turning Around Troubled Software Projects: An Exploratory Study of the Deescalation of Commitment to Failing Courses of Action", *Journal of Management Information Systems* 15(4), pp.63-87([JMIS](https://www.jmis-web.org/articles/531), [Taylor & Francis](https://www.tandfonline.com/doi/abs/10.1080/07421222.1999.11518222))
  - 常に立て直しに効く単一要因は存在しない
  - **多数のケースで de-escalation のトリガーは、上位管理者・内部監査・外部コンサルタントという「当事者以外のアクター」**であった
  - de-escalation は既存リソースのより良い管理と、投入リソース水準の変更の双方で達成された
- プロセス視点の後続研究として [De-escalation of commitment to information systems projects: a process perspective](https://www.sciencedirect.com/science/article/abs/pii/S0963868704000344)、および DMM モデル([De-escalating IT projects: the DMM model, CACM 52(10)](https://dl.acm.org/doi/abs/10.1145/1562764.1562797))がある
- プロジェクトマネジメントにおける行動バイアスの整理は [Top Ten Behavioral Biases in Project Management](https://arxiv.org/pdf/2202.00125)(arXiv, 2022)

### 3.3 ゾンビプロジェクト

- HBR (2015-03-04, Scott D. Anthony / David S. Duncan / Pontus M.A. Siren) "Zombie Projects: How to Find Them and Kill Them"([HBR](https://hbr.org/2015/03/zombie-projects-how-to-find-them-and-kill-them))。約束を果たさないまま資源を吸い続けるプロジェクトを指す
- ある IT 企業の分析では全プロジェクトの約 20% がゾンビ、また多くの組織はアクティブなプロジェクトの 50% を削減しても悪影響がないとされる(二次情報経由の HBR 引用: [PA Consulting](https://www.paconsulting.com/insights/the-curse-of-zombie-projects-how-they-erode-value-for-money-and-what-we-can-do-about-them))
- 2024-06 の調査として、月次でプロジェクトレビューを行う組織は 8% のみ、44% は「たまにしか止めない」、7% は「まったく止めない」(同上)
- 構造的診断: ゾンビ化は「悪い企画が承認されること」の症状ではなく、**始めるプロセスは堅牢なのに止めるプロセスがほぼ存在しない組織構造**の症状(同上)
- 継続理由としてサンクコストを挙げたチームは3分の1(同上)

注記: HBR 記事本文はペイウォールのため、上記の数値は二次引用です。**原典での数値確認は未了(未確認)**。

---

## 4. Stage-Gate における Kill 基準

Robert G. Cooper の Stage-Gate は Kill 基準の設計テンプレートとして最も参照しやすい枠組みです。

### 4.1 ゲート criteria の二層構造

- **Must-meet(必達 / ノックアウト)**: Yes/No 形式の設問群。1つでも合意された "No" が出れば Kill。ミスフィットや非スターターを早期に落とすためのチェックリスト
- **Should-meet(望ましい / スコアカード)**: 点数化して合算する。Go/Kill だけでなく**優先順位付け**にも用いる。1問の低評価では Kill にならない
- スコアリング手順: ゲート会議でゲートキーパーが**独立に採点**し、集計・表示したうえで差異を議論して合意形成する
- 出典: [Stage-Gate International - The Stage-Gate Model: An Overview](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/)、[Improving Go/Kill Decision Culture](https://www.stage-gate.com/blog/improving-go-kill-decision-culture/)、[The Stage-Gate Idea to Launch System (Cooper, 2010, Wiley)](https://onlinelibrary.wiley.com/doi/full/10.1002/9781444316568.wiem05014)

### 4.2 ゲートの判定種別とゲートキーパー

- 判定は **Go / Kill / Hold / Recycle** の4種
- ゲートキーパーは各ゲートごとに事前定義された、次ステージに必要なリソースを保有・統制する各機能部門のシニアマネージャー群([What Gatekeeping REALLY is](https://www.stage-gate.com/blog/what-gatekeeping-really-is-a-management-perspective/))
- ゲートキーピングの定義的行為は「有望性の低い案件を早期に見抜き、資源を再配分して Kill すること」(同上)
- 失敗モード: **Kill が一度も出ないゲート**。その場合ゲートは意思決定点ではなく単なるマイルストーンに退化し、パイプラインが詰まる(同上)
- 基準が曖昧だと、エビデンスに基づく判断ではなく政治的判断になる(同上)

---

## 5. 予算管理手法

### 5.1 Timebox 予算(固定予算・可変スコープ)

- 日本では IPA が「アジャイル開発版 モデル契約書」を公開し、準委任契約を前提とする方向を示した([Publickey 報道](https://www.publickey1.jp/blog/20/ipa_1.html))。準委任は「完成」ではなく「業務遂行」に対価を払うため、スコープ可変と整合する
- NTT 研究所の事例: 準委任契約(履行割合型)ベースの受託アジャイル開発を設計し、1年6か月のトライアルで 27 案件が契約締結、2020 年度から本格運用へ([情報処理学会 デジタルプラクティス](https://www.ipsj.or.jp/dp/contents/publication/45/0002/TR0201-02.html))
- いわゆる「ラボ契約」は月額単価 × 期間で構成され、成果物・完成責任は負わないが業務品質の責任を負う形態(出典: 上記解説記事群)

### 5.2 Beyond Budgeting

- Beyond Budgeting Institute の 12 原則は、リーダーシップ原則6+マネジメントプロセス原則6で構成([Principles (PDF)](https://bbrt.org/wp-content/uploads/bb_principles.pdf), [Beyond Budgeting Institute](https://bbrt.org/))
- リソース配分の原則は「詳細な年次予算配分ではなく、必要に応じて計画しリソースを利用可能にする(just-in-time)」(同上)
- Rolling Forecast は四半期ごとに更新し、5四半期程度のローリングホライズンを持つのが典型([FP&A Trends: Rolling Forecast (PDF)](https://fpa-trends.com/sites/default/files/resources/e-book/oct-19-issue-1-rolling-forecast.pdf))
- 設備投資計画へ Beyond Budgeting を適用すると、年次 capex 予算を継続的な意思決定プロセスへ置き換え、有望な案件へ随時資金を出せる「銀行が常に開いている」状態になる([Finario](https://www.finario.com/free-yourself-from-capital-planning-constraints-by-going-beyond-budgeting/)、[BCG: Going Beyond Budgeting](https://www.bcg.com/publications/2021/the-future-is-beyond-budgeting), 2021)

### 5.3 SAFe の Lean Budget Guardrails(VC 型トランシェの実装形)

- LPM は「戦略と投資資金」「アジャイル・ポートフォリオ運営」「リーンガバナンス」の3領域で戦略と実行を整合させる([Scaled Agile: Lean Portfolio Management](https://framework.scaledagile.com/lean-portfolio-management))
- Lean Budget Guardrails は4つ: 投資ホライズンによる誘導、キャパシティ配分、重要イニシアチブの承認、ビジネスオーナーの継続的関与([Extended Guidance - Lean Budget Guardrails](https://framework.scaledagile.com/guardrails))
- 投資ホライズン: H1 = 既存ソリューションへの短期投資、H2 = 新規開発への中期投資、H3 = 将来機会への長期投資
- キャパシティ配分は新機能・技術改善・保守などへの割合目標をイテレーション単位で設定する
- Participatory Budgeting により、ガードレールの範囲内でバリューストリームが分散的に配分を決める
- Epic の承認要件は **MVP の定義・Lean Business Case・コスト見積の3点セット**。Portfolio Leadership が WSJF で競合 Epic と比較し Go/No-Go を決める。No-Go は Epic を done へ移す([Lean Business Case: From Epic Hypothesis to Go/No-Go](https://agility-at-scale.com/safe/lpm/lean-business-case/), [SAFe Epics](https://agility-at-scale.com/safe/lpm/epics/))
- MVP は「仮説を検証するために必要な最小スコープ」であり、MVP コストは**仮説の証明/反証に十分な予算を確保するため**に見積もる(同上)

注記: `framework.scaledagile.com` の詳細ページは一部ログイン必須のため、Epic 承認手順の細部は二次解説サイト(agility-at-scale.com)に依拠しています。**一次確認は未了(未確認)**。

---

## 6. EVM による定量ゲートと自動アラート

- 基本式: CPI = EV ÷ AC、SPI = EV ÷ PV、CV = EV − AC、SV = EV − PV、EAC = BAC ÷ CPI([EVM Formulas and Metrics Explained](https://www.profit.co/blog/earned-value-management/evm-formulas-and-metrics-explained/), [Guide to Earned Value Management](https://www.projectengineer.net/guide-to-earned-value-management/))
- VAC(Variance at Completion)は完了時点の最終的なコスト差異の予測値(同上)
- EVM は 1998 年に ANSI/EIA-748 として標準化され、PMI の PMBOK Guide に組み込まれている(同上)
- 閾値運用の実務例: CPI / SPI が 0.9〜0.99 なら「やや遅延」として次回チェックインでフラグし回復可能性を判定、0.9 未満ならキャパシティ前提やスコープクリープの見直しへ進む。深刻な場合はスポンサーへ上程しリベースラインまたはスコープ削減を検討(同上、二次情報)
- 実務閾値 0.9 は**業界慣行としての例示であり、規格が定めた値ではない(未確認)**。自社の許容度に応じた設定が必要

ISO 系のゲート規定は以下です。

- ISO 21502:2020 はプロジェクトガバナンスを「戦略と整合した価値提供を保証する権限・説明責任・意思決定の枠組み」と定義。各フェーズの前に決定点(ゲート)を置き、レビューして継続・方向転換・**終了**を判断する([ISO 21502:2020](https://standards.iteh.ai/catalog/standards/iso/f3deaa3a-e424-42fe-aa82-99fad5c395f5/iso-21502-2020), [解説: Clause 4.4 Project life cycle](https://preteshbiswas.com/2024/01/18/iso-215022020-clause-4-4-project-life-cycle/))
- 単一のライフサイクルを規定せず、組織が文脈・業種・リスクプロファイルに合わせてテーラリングする方針(同上)

---

## 7. ポートフォリオ管理と上位ガバナンス

### 7.1 ISO/IEC 38500:2024

- IT ガバナンスの国際規格。取締役会・経営層が IT の利用を **Evaluate(評価)→ Direct(指示)→ Monitor(モニタ)** のサイクルで統治するモデル([ISO/IEC 38500:2024](https://www.iso.org/standard/81684.html))
- 6原則: Responsibility、Strategy、Acquisition、Performance、Conformance、Human Behaviour
- 2024 年改訂でクラウド移行、**AI ガバナンス**、リモートワーク、デジタル倫理、サステナビリティを反映([Pacific Certifications 解説](https://pacificcert.com/iso-iec-38500-2024-information-technology-governance/), [arc42 Quality Model](https://quality.arc42.org/standards/iso-38500))
- ガバナンスモデルは Engage stakeholders → Evaluate → Direct → Monitor の連鎖として整理される(同上)

### 7.2 日本の公的基準(経済産業省)

[システム管理基準(令和5年4月26日改訂)](https://www.meti.go.jp/policy/netsecurity/sys-kansa/sys-kanri-2023.pdf) は、システム監査人の判断尺度としてガバナンスとマネジメントの基準を規定します。IT 投資ゲートの観点で重要な規定は以下です(出典: 同 PDF および [改訂概要](https://public-comment.e-gov.go.jp/pcm/download?seqNo=0000247395))。

- IT 戦略に従い、プロジェクトの時期・投資額・必要性等を評価する方法を確立する
- プロジェクト開始前を含め、組織体のプロジェクト全体を**定期的に評価して優先順位を見直す**
- 価値創出への貢献度や利用度による評価が低い情報システムについて、**廃止プロジェクトの検討**を行う

参考として、IT 投資マネジメントの評価指針の調査研究は [JIPDEC 18-H001](https://www.jipdec.or.jp/library/publications/u71kba0000002i4l-att/18_h001.pdf) にまとまっています。

---

## 8. 客観メトリクスによる自動上程トリガーの実例

### 8.1 FinOps: Anomaly Management

[Capability: Anomaly Management](https://www.finops.org/framework/capabilities/anomaly-management/) の要点です。

- 定義: 予期しないコストイベントを適時に検知・特定・明確化・アラート・管理し、事業影響を最小化する能力
- 閾値の種類: 支出変化率、単一項目の支出上限、**予測(forecast)超過アラート**など文脈に応じた閾値
- 予算(月次・四半期・年次)とは別物として運用する。異常検知は日次または連続日単位のタイムスケールで最も機能する
- 自動化: 検知・解決提案・解決までを重大度に応じて自動化し、Slack・チャット・メール・JIRA 等へ自動ルーティングする
- アンチパターン: アカウント/プロジェクト単位のみの粗い検知(タグや論理グルーピングを使わない)は洞察の文脈を損なう

### 8.2 SRE: エラーバジェットポリシー

[Google SRE Workbook - Error Budget Policy](https://sre.google/workbook/error-budget-policy/) と [Embracing Risk](https://sre.google/sre-book/embracing-risk/) の要点です。

- エラーバジェットを使い切った場合、緊急のセキュリティ修正とエラー原因の是正を除き、**変更を凍結**する。バジェットが回復するか期間がリセットされるまで継続する
- 典型的なポリシー上のアクション: 信頼性関連バグの最優先化、開発チームが SLO 内に戻るまで信頼性課題に専念、プロダクションフリーズ
- 極端な状況では高位承認のもとで「緊急事態」を宣言し、**明示的な exit criteria** を満たすまで外部要求を後回しにする
- SLO アラートの設計論は [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)(バーンレートに基づく多段アラート)

考察としての含意は、「閾値 → 自動的に発火する事前合意済みのアクション」という形式が、人間の裁量による上程よりもエスカレーション・バイアスに強いという点です(3.1 節参照)。

---

## 9. 調査フレームワーク6観点での整理

### 9.1 ロールモデル(定義されるロールと責任)

- **Leadership / 投資委員会・SteerCo**: スポンサーシップとガバナンス設定。Go/Kill の最終決裁(FinOps Executive Strategy Alignment、Stage-Gate ゲートキーパー、SAFe Portfolio Leadership)
- **Gatekeepers(ゲートキーパー)**: 次ステージのリソースを保有・統制する各機能部門シニアマネージャー。ゲートごとに事前定義される(Stage-Gate)
- **Epic Owner / プロダクト責任者**: Lean Business Case、MVP 定義、コスト見積の作成責任(SAFe)
- **FinOps Practitioner**: Scope 定義、統合ビュー構築、配賦・単位経済性の整備
- **Finance**: ITFM 整合、シナリオ分析、予算・予測の管理
- **Procurement**: 契約・コミットメント管理(FOCUS 1.3 の Contract Commitment データセットが対応)
- **Engineering**: コストのオーナーシップ、アーキテクチャによる最適化
- **Product**: 単位経済性とビジネス価値の接続
- **内部監査・外部コンサルタント**: de-escalation のトリガー役として実証されたアクター(Keil & Robey 1999)

### 9.2 組織的役割(第三者レビュー・専門部隊)

- FinOps は「中央で有効化される(centrally enabled)」原則を持つ。中央 FinOps チームが基盤・データ・ポリシーを提供し、意思決定は分散する
- SAFe はガードレールという中央のポリシーと、Participatory Budgeting という分散的な配分決定を組み合わせる
- Kill 判断の客観性確保には、当事者から独立した第三者(内部監査、ポートフォリオ PMO、外部レビュー)の関与が実証的に有効

### 9.3 ゲート・意思決定

- 判定種別: **Go / Kill / Hold / Recycle**(Stage-Gate)、**Go / No-Go**(SAFe Epic)
- 基準構造: Must-meet(ノックアウト、1件の No で Kill)+ Should-meet(スコアカード、優先順位付けにも使用)
- 定量トリガー: EVM の CPI/SPI 閾値、FinOps の予算・異常検知閾値、SLO エラーバジェット枯渇
- 上位規範: ISO/IEC 38500 の Evaluate-Direct-Monitor、ISO 21502 のフェーズ前決定点、経産省システム管理基準の定期的な優先順位見直しと廃止プロジェクト検討

### 9.4 成果物(インプット/アウトプット)

- 投資判断のインプット: Lean Business Case(仮説・成果指標・MVP スコープ)、コスト見積、WSJF スコア、Must/Should スコアカード
- 継続監視のインプット: 配賦済みコストレポート(FOCUS 準拠)、単位経済性メトリクス(cost per inference / per query / per PR)、EVM 指標、SLO/エラーバジェット状況
- ゲートのアウトプット: 判定記録(Go/Kill/Hold/Recycle)、次ステージのリソース割当、Kill 時の資源再配分計画、エラーバジェットポリシー上の凍結宣言と exit criteria

### 9.5 レビュープロセス

- ゲート会議ではゲートキーパーが**独立採点 → 集計・可視化 → 差異の議論 → 合意**という手順を踏む(Stage-Gate)
- ポートフォリオレビューの頻度が Kill 実行率を左右する(月次レビュー実施は 8% のみという調査)
- FinOps は Crawl/Walk/Run の成熟度で、ガバナンスの軽重を段階的に上げる

### 9.6 階層構造(全体 → フェーズ内 → 個別作業)

- **L1 全体プロセス(ポートフォリオ層)**
  - ISO/IEC 38500 の Evaluate → Direct → Monitor
  - 投資ホライズン配分(H1/H2/H3)とキャパシティ配分の設定
  - 年次/四半期のローリング予測と資金トランシェの再配分
- **L2 フェーズ内ワークフロー(プロジェクト/Epic 層)**
  - Epic 起票 → Lean Business Case + MVP + コスト見積 → 投資委員会で Go/No-Go
  - 各フェーズ前のゲート: Must-meet 判定 → Should-meet スコアリング → Go/Kill/Hold/Recycle
  - MVP 実施後の仮説検証結果に基づく継続判断(Persevere / Pivot / Kill)
- **L3 個別作業(チーム/スプリント層)**
  - トークンバジェット設定とゲートウェイでの事前強制
  - 日次のコスト異常検知アラート → 担当へ自動ルーティング
  - CPI/SPI・バーンレート・エラーバジェット消費率の定点観測と閾値超過時の自動上程

---

## 10. 考察(本プロジェクトへの適用案。事実ではなく解釈)

以下は調査結果からの筆者の解釈であり、出典に直接記載された内容ではありません。

- **Kill ゲートの設計原則は「基準の事前合意」と「発火の自動化」の2点に集約できます。** エスカレーション・オブ・コミットメント研究が示すのは、意思決定時点の人間は止められないという事実です。したがって、止める条件はプロジェクト開始時点(まだ誰も愛着を持っていない時点)に文書化しておく必要があります
- **Must-meet / Should-meet の二層構造は、そのまま AI 時代のゲートへ転用できます。** 例として、Must-meet に「単位あたりコストが目標上限以内」「セキュリティレビュー完了」を置き、Should-meet に「cost per resolved issue の改善率」「ユーザー価値仮説の検証度」を置く形が考えられます
- **AI コストの従量課金化は、ゲート設計に「予算バーンレート」という新しい軸を持ち込みます。** 従来の EVM は工数ベースの CPI で足りましたが、エージェント型開発では「トークン消費 ÷ 完了タスク数」が実質的な生産性指標になります。cost per merged PR は EVM の CPI に対応する AI 時代の指標と解釈できます
- **VC 型トランシェ投資の社内適用は、SAFe の MVP + Lean Budget Guardrails がすでに実装形を与えています。** MVP コストを「仮説の証明/反証に必要な最小額」と定義する考え方は、シードラウンドの発想そのものです
- **日本企業の実態上の論点(建前と実運用の乖離)** として、以下が想定されます。ただし本調査では裏付けとなる一次データを確保できませんでした(未確認)
  - 稟議で承認した予算は年度内に使い切る前提で運用されがちで、途中返上(Kill)が評価上不利になる構造
  - ステアリングコミッティが「報告会」化し、Kill 判定が議題に上がらない。Stage-Gate が指摘する「Kill が一度も出ないゲート」の典型
  - 準委任契約でスコープ可変を実現しても、社内の予算稟議が固定スコープ前提のままだと、契約形態だけ変えても効果が出ない
  - de-escalation のトリガーが内部監査・外部コンサルという知見は、日本企業でも「第三者による棚卸し」が有効という示唆になる

---

## 11. 追加調査が必要な穴

- FOCUS 1.4(2026-06-04 承認)の一次ページ確認と差分内容
- GitHub Copilot の 2026-06-01 従量課金移行の公式 Docs による裏取り。Cursor、Claude Code の企業向け課金モデルの一次情報
- Jellyfish / DX の cost per merged PR 調査の原典レポート
- HBR ゾンビプロジェクト記事の原典(ペイウォール)
- SAFe 公式(framework.scaledagile.com)の Epic 承認・Lean Business Case ページの一次確認(ログイン必須)
- ISO 21502:2020 および ISO/IEC 38500:2024 の規格本文(有償)による条項番号レベルの確認
- 日本企業における IT プロジェクト中止率・中止判断プロセスの定量データ(JUAS 企業IT動向調査 2026 報告書 PDF の該当章の精読が未了)
- PMI 実務標準 "The Standard for Earned Value Management" における閾値運用の公式記述
- Beyond Budgeting 12 原則の全文(bbrt.org の PDF 直接取得が未了)
