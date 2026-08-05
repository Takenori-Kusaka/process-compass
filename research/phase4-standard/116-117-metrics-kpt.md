# 調査メモ: 三識メトリクス・ダッシュボードとKPT改善サイクルの制度化（Issue #116 / #117）

- 調査日: 2026-08-05
- 対象 Issue:
  - #116「三識（知識・見識・胆識）メトリクス・ダッシュボードの設計」
  - #117「三識データを用いたスプリントKPT改善サイクルの制度化」
- 目的: 開発生産性メトリクスの原典、メトリクス悪用の理論、AI協調開発固有の測定、非難なき振り返りの制度設計に関する一次情報を収集する

## 0. 本メモの鮮度と読み方

本テーマは、原典が安定している領域（Goodhart、Edmondson、Kerth）と、極めて陳腐化が速い領域（AI 利用の測定、LLM 評価）が混在します。以下の原則で記述しています。

- すべての事実記述に公表年を付与する。断定できない点は「未確認」と明記する
- エージェント・AI 関連の記述は「2026-08-05 時点」を明示する
- 出典の信頼度を区別する。一次情報（原論文、標準文書、公式ドキュメント）と二次情報（ブログ・要約記事）を明示する
- 「事実」と「本プロジェクトへの含意」を節で分離する

**重要な限界**: ACM Digital Library（SPACE 原論文 PDF、DevEx 原論文 PDF）、Etsy Code as Craft の blameless postmortem 原文、DORA 2025 報告書 PDF 本体は、取得時に HTTP 403 またはサイズ超過で本文未取得です。これらの内容は公式要約ページ・著者所属機関ページ経由で確認しており、逐語引用の正確性は原典で再確認が必要です。該当箇所は「本文未取得」と明記します。

---

## 1. 開発生産性メトリクスのフレームワーク

### 1.1 DORA メトリクス（2018年初出 / 2026-01-05 更新版を確認）

DORA は現在、ソフトウェアデリバリー性能を5指標で定義します。公式ガイド（最終更新 2026-01-05）の定義は以下です。

スループット系:

- **変更のリードタイム（Change Lead Time）**: 「変更がバージョン管理にコミットされてから本番環境にデプロイされるまでの時間」
- **デプロイ頻度（Deployment Frequency）**: 一定期間のデプロイ回数、またはデプロイ間隔
- **障害復旧時間（Failed Deployment Recovery Time）**: 即時対応を要するデプロイ失敗からの復旧時間

不安定性系:

- **変更失敗率（Change Fail Rate）**: デプロイ後に即時対応を要した割合
- **デプロイ手戻り率（Deployment Rework Rate）**: 本番インシデント起因で発生した計画外デプロイの割合

「4指標＋信頼性」という従来整理は、現在の公式ガイドでは「スループット3＋不安定性2」の5指標構成に再編されています。信頼性（reliability）は別途「ユーザー中心の成果指標」として扱われます。

**個人評価・チーム間比較への警告**（公式ガイド本文より）:

- 「これらの指標はアプリケーションまたはサービス単位で適用されることを意図する。まったく異なるアプリケーション（例: モバイルアプリとメインフレーム）間で比較することは誤解を招きうる」
- 避けるべきアンチパターンとして「Making disparate comparisons（異質な比較）」を明記
- 「Competing（競争）」の項で「目標は自チームの性能を時間とともに改善することであり、他チームや他組織と競うことではない」と明記
- 「Having siloed ownership（サイロ化した所有）」を避け、5指標すべてを開発・運用・リリースで共有すべきとする

出典（一次）:
- DORA 公式ガイド「DORA's software delivery performance metrics」（最終更新 2026-01-05）: https://dora.dev/guides/dora-metrics/

**未確認**: 「DORA チームが2023年10月に個々のチーム評価への使用を明示的に警告した」という言説を検索結果で確認しましたが、当該一次文書の URL は特定できていません。引用時は再確認が必要です。

### 1.2 SPACE フレームワーク（2021年）

Nicole Forsgren、Margaret-Anne Storey、Chandra Maddila、Tom Zimmermann、Brian Houck、Jenna Butler による論文「The SPACE of Developer Productivity: There's more to it than you think」（ACM Queue, Vol.19 No.1, 2021年2月, pp.20-48）。

5次元:

- **S: Satisfaction and well-being**（満足度と幸福）
- **P: Performance**（成果）
- **A: Activity**（活動量）
- **C: Communication and collaboration**（コミュニケーションと協働）
- **E: Efficiency and flow**（効率とフロー）

論文アブストラクトの主張として「開発者の生産性は、個人の活動量やエンジニアリングシステムの効率だけの問題ではない」と述べています。

**個人評価への警告について**: 検索要約レベルでは「個人の生産性測定は倒錯したインセンティブを生み、心理的安全性と協働を損ない、しばしば誤ったものを測る」「フレームワークはチーム・組織レベルの全体像を示すためのもの」という趣旨が確認できます。ただし ACM Queue 本文（HTTP 403）および Microsoft Research の PDF（404）は本文未取得のため、**逐語引用は未確認**です。

**運用上の要諦**（二次要約より、原典要確認）:

- 単一指標・単一次元での測定を禁じる
- 異なる次元から最低3つの指標を組み合わせる
- 知覚指標（サーベイ）とシステム指標を併用する

出典:
- Microsoft Research 公開ページ（書誌情報・アブストラクト、一次）: https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/
- ACM Queue 掲載ページ（本文未取得 / DOI 10.1145/3454122.3454124）: https://queue.acm.org/detail.cfm?id=3454124

### 1.3 DevEx フレームワーク（2023年）

Abi Noda、Margaret-Anne Storey、Nicole Forsgren、Michaela Greiler による「DevEx: What Actually Drives Productivity」（ACM Queue, 2023年11-12月号 / DOI 10.1145/3639443）。25の社会技術的要因を3次元に集約します。

- **Feedback loops（フィードバックループ）**: ツールと人からの応答の速さと質。ビルド、テスト、CI、レビュー、デプロイを含む
- **Cognitive load（認知負荷）**: 作業遂行に要する精神的努力。コードベースの複雑性、ドキュメント、オンボーディングを含む
- **Flow state（フロー状態）**: 深い集中に入り、それを守れること

測定の指針として、ワークフローの定量指標と開発者サーベイ（知覚指標）の併用を求めます。

**注意**: 公式配布ページには**個人単位測定への明示的な警告文は見当たりません**（2026-08-05 時点で確認）。ACM Queue 本文 PDF は HTTP 403 のため本文未取得です。

出典:
- DX 公式配布ページ（一次）: https://getdx.com/report/devex-productivity/
- CACM 掲載ページ（本文未取得）: https://cacm.acm.org/practice/devex-what-actually-drives-productivity/

### 1.4 DX Core 4（2024年末〜2025年）

DX 社（Abi Noda、Laura Tacho、Margaret-Anne Storey、Michaela Greiler）による、DORA・SPACE・DevEx を統合した実務フレームワーク。4次元は Speed / Effectiveness / Quality / Business Impact です。

本プロジェクトにとって重要なのは、キー指標のひとつ「diffs per engineer（エンジニアあたりの差分数）」に付された注意書きです。公式ページは以下3条件を満たす場合にのみ有用としています。

- Developer Experience Index など**対抗する指標と相殺的に配置**する
- **目標値（target）として設定せず、報酬に紐づけない**
- 誤用を避けるため**透明性のあるコミュニケーション**とともに導入する

出典（一次）: https://getdx.com/research/measuring-developer-productivity-with-the-dx-core-4/

### 1.5 考察（本プロジェクトへの含意）

- 「三識メトリクス」も、単一指標では必ず歪む。知識・見識・胆識のそれぞれに**対抗指標**を置く設計が必須である
- DORA 公式が「他チームと競うな」と明記している以上、三識ダッシュボードでも**チーム間ランキング表示を機能として持たない**設計が正当化できる
- DX Core 4 の「目標値にしない・報酬に紐づけない・透明に説明する」の3条件は、そのまま #116 の設計原則として転用できる

---

## 2. メトリクスの悪用と行動歪曲

### 2.1 Goodhart の法則（1975年）

Charles Goodhart による原文の記述は次のとおりです。

> "Any observed statistical regularity will tend to collapse once pressure is placed upon it for control purposes."
> （観測されたいかなる統計的規則性も、制御目的で圧力がかけられると崩壊する傾向がある）

出典: Goodhart, Charles (1975). "Problems of Monetary Management: The UK Experience." *Papers in Monetary Economics*, Vol.1, Reserve Bank of Australia, pp.1-20.

### 2.2 Strathern による一般化（1997年）

人類学者 Marilyn Strathern が英国大学の監査制度を論じた論文で定式化した、現在最も流布している表現です。

> "When a measure becomes a target, it ceases to be a good measure."
> （測定尺度が目標になると、それは良い尺度ではなくなる）

出典: Strathern, Marilyn (1997). "'Improving ratings': audit in the British University system." *European Review*, 5(3), 305-321. PDF: https://gwern.net/doc/statistics/decision/1997-strathern.pdf

### 2.3 Campbell の法則（1979年）

心理学者 Donald T. Campbell による定式化です。

> "The more any quantitative social indicator is used for social decision-making, the more subject it will be to corruption pressures and the more apt it will be to distort and corrupt the social processes it is intended to monitor."
> （定量的な社会指標が社会的意思決定に使われるほど、それは腐敗圧力にさらされ、監視対象の社会過程そのものを歪め腐敗させやすくなる）

出典: Campbell, Donald T. (1979). "Assessing the Impact of Planned Social Change." *Evaluation and Program Planning*, 2(1), 67-90. 参考解説: https://en.wikipedia.org/wiki/Campbell%27s_law

Goodhart と Campbell の差異について、Rodamar（2018年, *Significance*）は両者の成立経緯と適用範囲を比較しています。Goodhart は金融統計の因果構造の崩壊を、Campbell は指標使用による社会過程そのものの腐敗を論じており、後者のほうが**人の行動歪曲**の議論に近いと整理できます。

出典: Rodamar, Jeffrey (2018). "There ought to be a law! Campbell versus Goodhart." *Significance*. PDF: https://maritimesafetyinnovationlab.org/wp-content/uploads/2023/05/Significance-2018-Rodamar-There-ought-to-be-a-law-Campbell-versus-Goodhart.pdf

### 2.4 ソフトウェア開発におけるゲーミング

**ベロシティ / ストーリーポイント**: ストーリーポイントの考案者とされる Ron Jeffries は2019年に公開の場で次のように述べています。

> "I may have invented story points, and if I did, I'm sorry now."

さらに Jeffries は「見積り品質やベロシティでチームを比較することは有害である（comparing teams on quality of estimates or velocity is harmful）」と明言し、ベロシティ自体を推奨しない立場を示しています。

なお Scrum Guide 2020 には「velocity」という語は登場しません（本文確認済み）。ベロシティはスクラムの構成要素ではなく XP 由来の補完的プラクティスです。

出典:
- Jeffries の発言をまとめた二次情報: https://www.linkedin.com/posts/svpino_story-points-dont-work-even-ron-jeffries-activity-7103016412868165632-S3pS （**一次 URL は Jeffries 本人の X 投稿およびブログ。未確認**）
- Scrum Guide 2020（一次）: https://scrumguides.org/scrum-guide.html

**AI 時代のコード量指標**（2026-08-05 時点）: DX 社は「コード生成量のような指標は特にゲーミングされやすい。成果ではなく指標を最適化する行動を促すと、悪意ある遵守（malicious compliance）のリスクを生む」と明記しています。

出典（一次）: https://getdx.com/research/measuring-ai-code-assistants-and-agents/

### 2.5 考察

- 三識メトリクスは「胆識＝意思決定の質」のような**測りにくい構成概念**を扱うため、代理指標（proxy）に依存せざるを得ない。代理指標は Goodhart 的崩壊の典型的な餌食である
- したがって #116 は「指標の正しさ」より「**指標が壊れたことを検知する仕組み**」に設計資源を割くべきである

---

## 3. AI 協調開発に固有の測定（2026-08-05 時点）

### 3.1 DX AI Measurement Framework（2025年〜）

Abi Noda と Laura Tacho による枠組みで、3次元 **Utilization（利用）/ Impact（効果）/ Cost（費用）** を AI 導入のライフサイクルに対応させます。

- **Utilization**: 導入率・アクティブ利用率。公式ページは「先進的な組織でもアクティブ利用率は約60%程度」と記述
- **Impact**: AI 由来の時間削減（開発者1人あたり週何時間の削減か）、および DX Core 4 指標（PR スループット、体感デリバリー速度、Developer Experience Index）への回帰分析
- **Cost**: 利用量追跡と ROI 分析

**重要な警告文**（一次、逐語）:

> "Metrics like code generation volume are particularly susceptible to gaming."

> "organizations must balance these efficiency measures with quality metrics to avoid undermining long-term velocity."

出典（一次）: https://getdx.com/research/measuring-ai-code-assistants-and-agents/

### 3.2 「AI 生成率の高さ自体は良し悪しを示さない」という議論

DX 社の立場として、「AI が書いたコードの割合」を事業成果に接続せずに強調すると誤った結論に至る、という趣旨の主張が確認できます。推奨は時間削減・開発者満足度・品質指標などの成果指標への接続です。

出典: https://getdx.com/blog/ai-measurement-hub/ および https://newsletter.getdx.com/p/ai-generated-merged-code-holds-steady

**未確認**: 「AI 生成率が高いこと自体は良し悪しを示さない」という趣旨の**逐語表現**は、公式ページ本文からは確認できていません。二次要約に依拠しています。

### 3.3 GitHub Copilot の受容率（acceptance rate）

GitHub の Copilot Metrics API（API バージョン 2026-03-10 を確認）は、利用統計・ユーザーエンゲージメント・機能採用率のレポートを提供します。2026-08-05 時点で確認したドキュメントには次の特徴があります。

- レポートは2025年10月10日以降のデータを提供し、最大1年分を保持する
- Copilot Coding Agent（CCA）および Copilot Code Review（CCR）のリポジトリ単位 PR 指標を含む
- **限界**: 当該ページには「suggestions shown / acceptances / acceptance rate」等の**明示的な指標定義は記載されていない**（本調査時点）。またプライバシー保護のための最小集計人数（例: 5名以上）の記述も**確認できなかった**

出典（一次）: https://docs.github.com/en/rest/copilot/copilot-metrics

**含意**: 受容率は「提示された補完のうち採用された割合」であり、**採用後に書き換えられたか、レビューで差し戻されたか、本番で障害を起こしたかを一切含みません**。受容率単体を三識ダッシュボードに載せることは推奨できません。

### 3.4 DORA 2025 報告書「State of AI-assisted Software Development」（2025年9月24日公開）

主要な発見（Google Cloud 公式ブログおよび dora.dev 公式ページより）:

- 回答者の **90%** が業務で AI を利用している（回答者約5,000名、定性データ100時間超）
- **80%超**が AI により生産性が向上したと考えている
- AI 生成コードを信頼する回答者は **70%**（裏を返せば30%はほとんど信頼していない）
- AI 導入はデリバリーの**スループットおよびプロダクト成果と正の関係**を持つ
- AI 導入はデリバリーの**安定性と負の関係**を持ち続けている
- 中核メッセージ: 「AI の主たる役割は**増幅器（amplifier）**であり、組織の既存の強みと弱みを拡大する」
- 「AI 投資の最大のリターンはツールそのものではなく、組織システムへの戦略的な注力から得られる」
- クラスタ分析により**7つのチーム類型**を提示（例: Foundational Challenges＝低性能・高不安定・高バーンアウト、Harmonious High Achievers＝多面的に良好）

DORA AI Capabilities Model の能力（公式ブログで確認できた範囲）:

1. AI ポリシーの明確化と周知
2. AI を社内コンテキストに接続する
3. 基礎的プラクティスを優先する
4. セーフティネットを強化する
5. 内部プラットフォームへの投資
6. エンドユーザーへの注力
7. （7項目目は図中のみで本文未取得）

出典:
- Google Cloud 公式ブログ（2025-09-24）: https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
- DORA 公式レポートページ: https://dora.dev/dora-report-2025/
- 報告書 PDF（サイズ超過で本文未取得）: https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf

### 3.5 考察

- 2026-08-05 時点で、「AI 利用の測定」は**利用率 → 効果 → 費用**の順に成熟する、という段階モデルが実務のコンセンサスに近い
- 三識メトリクスに AI 指標を組み込むなら、「AI 生成率」は**単独では意味を持たない補助情報**として、必ず品質指標と対で提示すべきである
- DORA の「増幅器」フレーミングは #117 の設計根拠になる。AI 導入それ自体ではなく、**振り返りと改善のループの質**が成果を決める

---

## 4. メトリクスのハック検知（#116 の核心）

### 4.1 相互矛盾の検出という考え方

一次情報として明確なのは、DORA が5指標を**スループット系と不安定性系の対で**設計している点です。公式ガイドは5指標すべてを共有することを求めています。片方だけを最適化すると他方が悪化するため、**指標間の矛盾が歪曲のシグナルになります**。

適用例（本プロジェクトの解釈）:

- デプロイ頻度が急増し、同時に変更失敗率とデプロイ手戻り率が悪化 → 速度のためのゲーミングを疑う
- PR 数が増え、同時に PR あたり平均サイズが激減 → PR 分割による数の水増しを疑う
- AI 生成率が上昇し、同時にレビュー時間が短縮 → レビューの形骸化を疑う

### 4.2 対抗指標（counter-metric）の明示的配置

DX Core 4 は「diffs per engineer」に対して Developer Experience Index を**対抗指標として配置する**ことを条件に挙げています。これは実務上最も具体的なハック抑止の設計指針です。

出典（一次）: https://getdx.com/research/measuring-developer-productivity-with-the-dx-core-4/

### 4.3 LLM-as-a-judge の既知バイアス（2023年 / 2026-08-05 時点でも有効）

Zheng らの「Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena」（arXiv:2306.05685、初版2023年6月9日、v4 2023年12月24日、NeurIPS 2023）は、LLM を評価者として使う際の失敗モードを体系化しました。

- **Position bias（位置バイアス）**: 提示順序によって評価が変わる
- **Verbosity bias（冗長性バイアス）**: 品質に関わらず長い回答を高く評価する
- **Self-enhancement bias（自己選好バイアス）**: 自身または類似モデルの出力を高く評価する
- **Limited reasoning ability（推論能力の限界）**: 数学・推論課題の採点で誤る

同論文は GPT-4 を判定者とした場合、人間の選好と **80%超の一致**を示し、これは人間同士の一致率と同水準であると報告しています。つまり「使えるが偏る」という位置づけです。

出典（一次）: https://arxiv.org/abs/2306.05685

**「長文を投げるほど高評価になる」問題への設計上の対処**（本プロジェクトの解釈。原典に個別の推奨として明記されているのは順序入れ替えによる位置バイアス緩和のみ）:

- 評価対象を**長さで正規化**する。文字数・トークン数を評価入力から除去、または明示的に長さを無視するよう指示する
- **ペアワイズ評価で提示順を入れ替えて2回**実行し、結果が反転する場合は「判定不能」とする
- **絶対評価ではなくルーブリック**（観点別の有無判定）に落とし、自由記述の印象評価を避ける
- 評価者モデルと被評価対象の生成モデルを**分離**する（自己選好バイアスの回避）
- LLM 判定は**スクリーニング**に限定し、閾値を超えた事例のみ人間がレビューする

**未確認**: ソフトウェア開発の対話ログに LLM-as-a-judge を適用した際の信頼性を検証した査読済み研究は、本調査では特定できていません。追加調査が必要です。

### 4.4 質的レビューとの併用

DevEx フレームワークは、システムから得られるワークフロー指標と、開発者サーベイによる知覚指標の**併用**を求めています。定量指標が良好でも知覚指標が悪化している場合、それ自体が歪曲のシグナルになります。

出典（一次）: https://getdx.com/report/devex-productivity/

**未確認**: 「開発メトリクスに対する異常検知アルゴリズムの適用」に関する一次研究・実務報告は、本調査では特定できていません。統計的プロセス管理（管理図）の転用が候補ですが、ソフトウェア開発文脈での検証事例は未確認です。

---

## 5. 心理的安全性

### 5.1 Edmondson (1999) 原論文

Amy C. Edmondson「Psychological Safety and Learning Behavior in Work Teams」*Administrative Science Quarterly*, Vol.44, No.2 (1999), pp.350-383。

定義: **チーム心理的安全性**とは「対人的なリスクを取っても安全であるという、チームメンバーが共有する信念（a shared belief held by members of a team that the team is safe for interpersonal risk taking）」です。

構造上の要点:

- 分析単位は**チーム**であり、個人ではない。「共有された信念」という定義自体が集団レベルの構成概念である
- 論文はチーム心理的安全性とチーム効力感（team efficacy）を併せてモデル化し、学習行動を媒介として性能に影響すると論じる

**7項目尺度**（広く流通している版。逐語の完全な確認は未達）:

- 「このチームでミスをすると、しばしば咎められる」（逆転項目）
- 「このチームのメンバーは、問題や困難な課題を提起できる」
- 「このチームでリスクを取るのは安全である」
- （残り4項目の逐語は**未確認**）

原論文 PDF は取得したもののテキスト抽出に失敗しました（4MB、抽出不可）。逐語引用時は原典の Appendix を再確認してください。

出典:
- SAGE 掲載ページ（一次、DOI 10.2307/2666999）: https://journals.sagepub.com/doi/10.2307/2666999
- Harvard DASH: https://dash.harvard.edu/entities/publication/13a7b031-0fdd-45ec-a7e0-2b80e2bc679f
- MIT 配布 PDF（テキスト抽出不可）: https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf
- 7項目尺度の図表（二次）: https://www.researchgate.net/figure/The-7-item-scale-of-psychological-safety-developed-by-Edmondson-1999-Items-with_fig1_386340705

### 5.2 Google Project Aristotle（2012-2015年）

Google が180超の社内チームを調査し、チーム効果性を決める5つの要因を特定しました。心理的安全性が**最も重要**と結論づけています。5要因の順序は以下と報告されています。

1. Psychological safety（心理的安全性）
2. Dependability（相互信頼）
3. Structure and clarity（構造と明確さ）
4. Meaning（仕事の意味）
5. Impact（インパクト）

**重要な限界**: Google の re:Work サイト（rework.withgoogle.com）は 2026-08-05 時点で該当 URL が **404** を返し、一次ページを確認できませんでした。上記の順序・内容は二次情報に依拠しています。引用時は Google の公式アーカイブまたは論文版を再確認してください。

### 5.3 心理的安全性を毀損しない可視化の運用

一次情報として確立している設計原則は次の2点です。

- **チーム単位で集計する**。SPACE・DevEx・DORA いずれも分析単位はチームまたはサービスである（DORA 公式は「アプリケーションまたはサービス単位」と明記）
- **他チームとの比較を目的にしない**（DORA 公式「他チームや他組織と競うことではない」）

**未確認 / 追加調査が必要**: 「最小集計人数（k匿名性の閾値）」「サーベイ回答の匿名化粒度」「閾値超過時のアラート通知先」に関する、開発生産性測定領域の一次的な実務基準は特定できていません。GitHub Copilot Metrics API のドキュメントにも最小人数の記述は確認できませんでした。

### 5.4 考察

- 三識ダッシュボードは、**個人ドリルダウン機能を実装しない**ことを設計仕様として明文化すべきである。「見られる」という可能性そのものが行動を歪める
- 心理的安全性そのものを Edmondson 尺度で定期測定し、**三識メトリクスの対抗指標**として配置する案が有力である。三識スコアが上がり心理的安全性が下がるなら、それは制度の失敗を意味する

---

## 6. 振り返り（レトロスペクティブ）の実務と失敗モード

### 6.1 Scrum Guide 2020 におけるスプリントレトロスペクティブ

一次情報（本文確認済み）:

> "The purpose of the Sprint Retrospective is to plan ways to increase quality and effectiveness."

- 検査対象は「individuals, interactions, processes, tools, and their Definition of Done」
- タイムボックスは1か月スプリントで最大3時間。短いスプリントではより短い
- **「最も影響の大きい改善は可能なかぎり早く対処される。次スプリントのスプリントバックログに追加されることもある」**（"The most impactful improvements are addressed as soon as possible. They may even be added to the Sprint Backlog for the next Sprint."）
- スプリントレトロスペクティブがスプリントを終結させる

出典（一次）: https://scrumguides.org/scrum-guide.html

### 6.2 KPT の由来

KPT（Keep / Problem / Try）は Alistair Cockburn の「Reflection Workshop」における Keep/Try 形式を原型とし、日本で独自に定着した形式です。

平鍋健児氏の2005年10月26日のブログ記事が、日本語圏における初期の一次的記述です。記事本文には「Alistair Cockburn から教えてもらったもので、ぼくはこのフォーマットのヘビーユーザー」と記載されています。

定義（同記事より）:

- **Keep**: このまま続けること。今回のイテレーションで良かった事、今後も続けたいこと
- **Problem**: 問題点として感じていること
- **Try**: 次に試してみたいこと。問題点の解決法や新しい実践項目のアイディア

進め方の要点（同記事より）:

- **ブレインストーミング形式**で行う
- **マネジャやリーダーが一方的に記述してはいけない**
- 各人が感じていること（個人知・暗黙知）を、リラックスしたムードの中で言葉として表現する
- 全員で共有する

出典（一次に近い日本語記述）: https://blogs.itmedia.co.jp/hiranabe/2005/10/kpt_cc45.html

補足（二次）: KPT の起源整理として https://tbpgr.hatenablog.com/entry/2017/12/17/235632

### 6.3 Retrospective Prime Directive（Norm Kerth, 2001年）

原文（逐語）:

> "Regardless of what we discover, we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand."

出典: Norm Kerth『Project Retrospectives: A Handbook for Team Review』（2001年）。ウィキ掲載: https://retrospectivewiki.org/index.php?title=The_Prime_Directive

この宣言をレトロスペクティブ冒頭で読み上げる運用が、非難のないトーンを設定する標準的手法として普及しています。

### 6.4 犯人探しへの変質を防ぐファシリテーション手法

**一次情報で裏づけられる手法**:

- **Prime Directive の読み上げ**（Kerth, 2001年）。開始時に全員で共有し、議論の前提を明示する
- **リーダーが先に書かない / 一方的に記述しない**（平鍋, 2005年）。発言順の設計としてリーダー最後発を含意する
- **ブレインストーミング形式**（平鍋, 2005年）。批判の保留を前提とする
- **人ではなくシステムへの言い換え**（Google SRE, 2017年）。後述6.5参照

**本プロジェクトの解釈として補える手法**（一次情報の裏づけは限定的）:

- 発言順を**役職の逆順**にする。最も権限の弱い者から発言する
- **匿名の付箋収集を先に行い、その後に議論**する。書き出しフェーズと議論フェーズを分離する
- **データを個人に紐づかない形で提示**する。チーム集計値のみをスクリーンに出す
- ファシリテーターは**チーム外の第三者**が務める。当事者兼務を避ける
- 主語を人にする問いを**「どの仕組みが」に置換**するルールを明文化する

**未確認**: 上記の「発言順を役職の逆順にする」等について、実証研究による効果検証は本調査では特定できていません。

### 6.5 Blameless Postmortem（Google SRE, 2017年）

『Site Reliability Engineering: How Google Runs Production Systems』（O'Reilly, 2017年）の Postmortem Culture 章より。

定義:

> 非難なきポストモーテムとは「インシデントの寄与原因を特定することに集中し、悪い、または不適切な振る舞いについて個人やチームを糾弾しないもの」である。参加者は「善意を持ち、その時点で持っていた情報のもとで正しいことをした」と仮定する。

ポストモーテムを書くトリガー（Google の例）:

- 閾値を超えるユーザー可視のサービス障害
- あらゆるデータ損失
- オンコールエンジニアによる介入（ロールバック、トラフィック迂回など）
- 解決時間が規定の閾値を超えた場合
- 監視が機能せず手動で発見された場合

非難なき文化を強化する実務:

- **シニアリーダーシップの率先垂範**。経営層がレビューに参加し、創業者が全社フォーラムで優れたインシデント対応を称賛する
- **報奨と公開の称賛**。優れた対応と徹底したポストモーテムに対しボーナスと公的な承認を与える
- **知識共有**。月次ニュースレターで興味深いポストモーテムを紹介し、読書会やロールプレイ演習（Wheel of Misfortune）を実施する
- **プロセス自体のサーベイ**。ポストモーテムプロセスの有効性を定期的に調査する

出典（一次）: https://sre.google/sre-book/postmortem-culture/

### 6.6 Etsy の blameless postmortem（2012年）

John Allspaw による「Blameless PostMortems and a Just Culture」（Code as Craft, 2012年5月22日）が、業界における blameless postmortem 普及の起点とされます。中心概念は「second story（第2の物語）」で、「人的エラーが原因である」という第1の物語の背後にある、システム的要因の記述を求めるものです。

**本文未取得**: 2026-08-05 時点で当該 URL は HTTP 403 を返します。URL のリダイレクト（codeascraft.com → etsy.com/codeascraft）と公開日は確認しましたが、**逐語引用は未確認**です。

出典: https://www.etsy.com/codeascraft/blameless-postmortems/

---

## 7. インシデント後レビューの制度設計

### 7.1 NASA ASRS（航空安全報告制度）

ASRS は報告者を保護する制度設計の代表例です。公式ページ（一次）より。

**守秘・匿名化**:

> "The FAA will not seek, and NASA will not release or make available to the FAA, any report filed with NASA under the ASRS or any other information that might reveal the identity of any party involved."

報告は NASA 受領後、速やかに個人特定情報を除去（de-identify）されます。

**免責（enforcement immunity）の条件**: FAA は以下すべてを満たす場合に民事制裁金と資格停止を免除します。

- 違反が**故意ではなく不注意（inadvertent）**であること
- 事象発生から**10日以内**に報告されていること
- 過去**5年間に FAA の違反歴がない**こと
- **犯罪行為や事故を伴わない**こと

**免責の除外**:

- 犯罪行為に関する情報は、速やかに司法省と FAA に付託される
- 事故関連の報告は NTSB と FAA に送られる
- 49 U.S.C. § 44709 に基づく適格性の欠如を示す事案
- **除外カテゴリの報告は、付託前に匿名化されない**

根拠文書: FAA Advisory Circular **AC 00-46F**（Aviation Safety Reporting Program）

出典（一次）: https://asrs.arc.nasa.gov/overview/immunity.html

### 7.2 Just Culture の3分類（David Marx, 2001年）

David Marx（エンジニアかつ弁護士）が2001年の報告書「Patient Safety and the 'Just Culture': A Primer for Health Care Executives」で医療分野に導入した枠組みです。

- **Human error（ヒューマンエラー）**: 意図せず、あるべき行動と異なることをしてしまうこと。slip / lapse / mistake を含む
  - 対応: **慰める（console）**。プロセスの改善、設計変更、訓練
- **At-risk behavior（リスクを取る行動）**: リスクを認識せずに行動する、またはリスクが正当化されると誤って信じて行動すること
  - 対応: **指導する（coach）**。リスクの可視化、インセンティブの是正
- **Reckless behavior（無謀な行動）**: 「実質的かつ正当化できないリスク」を意識的に無視して行動すること
  - 対応: **懲戒する（punish）**

要諦は「**結果ではなく行動と状況に応じて対応を変える**」ことです。同じ結果でも行動類型が異なれば対応は異なります。

出典:
- ECRI / ISMP 解説（準一次）: https://home.ecri.org/blogs/ismp-alerts-and-articles-library/the-differences-between-human-error-at-risk-behavior-and-reckless-behavior-are-key-to-a-just-culture
- AHRQ PSNet: https://psnet.ahrq.gov/issue/differences-between-human-error-risk-behavior-and-reckless-behavior-are-key-just-culture

**未確認**: Marx (2001) の原典 PDF は本調査で取得できていません。

### 7.3 考察

- ASRS の設計は #117 にそのまま転用可能である。すなわち「**報告の速やかな匿名化**」「**期限内報告に対する免責**」「**故意・犯罪的行為は免責対象外**」の3点セットである
- Just Culture の3分類は、KPT の Problem を「システム起因」「リスク認識不足」「意図的逸脱」に**仕分ける基準**として使える。仕分けなしに「非難しない」だけを掲げると、意図的逸脱まで免責され制度が形骸化する

---

## 8. 測定から改善アクションへの接続

### 8.1 一次情報で裏づけられる原則

- Scrum Guide 2020: 「最も影響の大きい改善は可能なかぎり早く対処される。次スプリントのスプリントバックログに追加されることもある」。すなわち**改善項目を作業バックログに載せる**ことが公式の推奨である
- Google SRE (2017年): ポストモーテムには**アクションアイテム**を含め、プロセス自体の有効性を定期的にサーベイする
- DORA 公式（2026-01-05 更新）: 5指標を開発・運用・リリースで共有し、**共同所有**とする（サイロ化した所有を避ける）

出典: 各節の URL 参照

### 8.2 改善サイクルが形骸化する条件

**日本語一次に近い情報**として、なぜなぜ分析の失敗パターンに「**実行に移さない**（原因究明で満足し、改善策を講じない）」が挙げられています（カイゼンベース, 2018年1月23日公開 / 2026年8月2日更新）。

出典: https://kaizen-base.com/column/32150

**未確認 / 追加調査が必要**: 「レトロスペクティブの改善アクション実施率」に関する定量的な実証研究（例: Andriyani、Lehtinen らの研究）は、Web 検索の回数上限により本調査では取得できませんでした。#117 の設計根拠として重要なため、追加調査を推奨します。

### 8.3 考察（本プロジェクトの解釈）

形骸化を防ぐ実務的な設計要素として、以下が導出できます。一次情報の直接の裏づけは限定的です。

- 改善アクションに**責任者（1名）と期限**を必ず付ける
- 改善アクションを**プロダクトバックログと同一の管理系**に載せる。別管理にすると不可視化する
- 次回レトロスペクティブの冒頭で**前回アクションの実施状況を最初に確認**する
- **同時進行の改善は1〜2件に制限**する。多すぎると全部が未完了になる
- **改善アクション実施率**そのものを指標化する。ただしこれも Goodhart の対象になるため、目標値化は避ける

---

## 9. ダッシュボードの設計

### 9.1 Google SRE Workbook の原則（2018年）

『The Site Reliability Workbook』Monitoring 章より（一次、本文確認済み）。

- **指標には目的を持たせる**: 「Each exposed metric should serve a purpose. Resist the temptation of exporting a handful of metrics just because they are easy to generate.」（生成が容易だという理由だけで指標を出力する誘惑に抗え）
- **一貫性**: 「For each set of dashboards, displaying the same types of data consistently is valuable for communication.」
- **対象読者ごとの設計**: 「高レベルのマネジメントは、SRE とはまったく異なる情報を見たいと考えるかもしれない」
- **アラート抑制**: 「Alert suppression functionality lets you avoid unnecessary noise from distracting on-call engineers.」同一アラートの集約、上流障害時の下流アラート抑制を例示
- アラート指標から診断指標へ**掘り下げられる経路**を用意する
- 指標選定時は**4つのゴールデンシグナル**を念頭に置く（詳細は SRE 本 第6章）

**未確認**: 同章には「先行指標（leading indicator）と遅行指標（lagging indicator）」の明示的な議論、および「ダッシュボードが見られなくなる原因」に関する記述は**確認できませんでした**。

出典（一次）: https://sre.google/workbook/monitoring/

### 9.2 考察（本プロジェクトの解釈）

- #116 のダッシュボードには「**何を見せないか**」の設計を明記すべきである。具体的には個人別ドリルダウン、チーム間ランキング、単独指標の目標達成率である
- 指標の階層化は「**先行指標（レビュー密度、対話の質、心理的安全性スコア）→ 遅行指標（変更失敗率、手戻り率、リードタイム）**」の2層で整理できる。ただしこの分類自体の一次的裏づけは未確認である
- ダッシュボードが見られなくなる原因として、指標過多・更新停止・アクションに接続しない設計が考えられるが、**一次情報による裏づけは未確認**である

---

## 10. 日本企業の振り返り文化

### 10.1 なぜなぜ分析の原典と本来の意図

大野耐一『トヨタ生産方式』（1978年）に「なぜを五回繰り返すことができるか」の節があり、機械故障から潤滑ポンプの軸摩耗に至る事例で段階的な真因追及が示されています（同書 pp.33-34 と紹介されています）。

本来の意図として、以下が繰り返し解説されています。

- 原因を**特定の個人のミスや注意不足に求めないことは鉄則**である
- 本質は**システムやプロセスの問題を探ること**である
- 「5回」は絶対値ではない。真因に到達するまでの回数は必ずしも5回とは限らず、再発防止のメドが立つ基準として「5回」を挙げている

出典（日本語解説、二次）:
- カイゼンベース（2018年公開 / 2026年更新）: https://kaizen-base.com/column/32150
- ものづくりドットコム: https://www.monodukuri.com/gihou/article/821 （2026-08-05 時点で HTTP 403、本文未取得）
- 日経ビジネス: https://business.nikkei.com/atcl/gen/19/00299/051900003/

**未確認**: トヨタ自動車の公式サイトによる一次解説ページは、本調査では特定できていません。

### 10.2 「人を責めるな、仕組みを責めろ」

トヨタの現場規範として広く引用される言い回しです。要旨は次のとおりです。

- ミスやトラブル発生時に個人の責任を追及せず、原因となった仕組みやプロセスの改善余地を追及する
- 個人を責めて行動を改めさせても一時的な解決にしかならない。再発防止には仕組みそのものの改善が必要である

**未確認**: この言い回しの**一次的な出典**（大野耐一の著作における該当箇所、またはトヨタ公式文書）は特定できていません。二次情報でのみ流通している可能性があります。引用時は注意が必要です。

出典（二次）: https://anagrams.jp/blog/do-not-blame-people-blame-the-system-practice/

### 10.3 建前と実運用の乖離

日本語圏の実務解説が指摘する、なぜなぜ分析の典型的な失敗パターン（カイゼンベース, 2018年公開）:

- **表面的で終わる**: 真因に到達せず、浅い原因で対策を立てる
- **個人攻撃化する**: 個人のミスを詰問する形になり、パワーハラスメント化する恐れがある
- **実行に移さない**: 原因究明で満足し、改善策を講じない

出典: https://kaizen-base.com/column/32150

**考察（本プロジェクトの解釈）**:

- 日本企業の「反省会」は、Kerth の Prime Directive に相当する**前提宣言を持たない**まま運用されることが多い。結果として、原典が「仕組みを問え」と定めているにもかかわらず、実運用は個人の責任追及に流れやすい
- 「人を責めるな」というスローガンだけでは不十分である。ASRS の免責規定や Just Culture の3分類のような、**手続き的な保護と仕分け基準**が伴って初めて機能する
- なぜなぜ分析の「なぜ」という問いは、日本語では主語を人に取りやすい。人を主語にする問いではなく「**どの仕組みが**」へ言い換えるルールの明文化が、実務上の最小の対策になる

**未確認**: 日本企業の反省会文化に関する学術的な実態調査（アンケート、事例研究）は、本調査では特定できていません。

---

## 11. #116 / #117 への設計上の含意（本プロジェクトの解釈）

### 11.1 階層構造での整理

- **全体プロセス層（制度）**
  - 三識メトリクスの定義と収集方針（#116）
  - 測定・可視化の禁止事項（個人特定、ランキング、目標値化、報酬連動）
  - 報告者保護規程（ASRS 型の免責・匿名化）
  - Just Culture の3分類による対応の使い分け
- **フェーズ内ワークフロー層（スプリント）**
  - スプリント中: 指標の自動収集、閾値超過の検知
  - スプリント末: KPT（#117）。Prime Directive 読み上げ → 匿名収集 → 議論 → 改善アクション化
  - 改善アクションを次スプリントバックログへ投入（Scrum Guide 2020 準拠）
- **個別作業層**
  - 匿名付箋の収集手順
  - データ提示の粒度ルール（チーム集計のみ）
  - LLM 判定の実行手順（順序入れ替え2回、ルーブリック評価、スクリーニング限定）
  - 改善アクションの責任者・期限の記入テンプレート

### 11.2 ロール（示唆）

- **ダッシュボード運営者**: 指標定義の管理、禁止事項の遵守監査
- **ファシリテーター**: KPT の進行。チーム外の第三者が望ましい
- **改善アクションオーナー**: 各改善項目に1名。期限を持つ
- **報告者保護の責任者**: 匿名化と免責判断。Just Culture の3分類を適用する

**未確認**: 上記ロール設計に対応する既存の一次的な標準（例: 業界標準の役割定義）は特定できていません。本プロジェクト独自の設計として位置づける必要があります。

---

## 12. 追加調査が必要な穴

以下は本調査で埋められなかった観点です。

1. SPACE 原論文の逐語（「個人評価に使うな」の明示箇所）。ACM Queue 本文が HTTP 403
2. DevEx 原論文（ACM Queue 2023）の逐語。同じく HTTP 403
3. Edmondson (1999) の7項目尺度の完全な逐語。PDF テキスト抽出不可
4. Google Project Aristotle の一次ページ。re:Work サイトが 404
5. Etsy blameless postmortem 原文（Allspaw, 2012年）。HTTP 403
6. DORA 2025 報告書 PDF 本体。ファイルサイズ超過
7. David Marx (2001) の Just Culture 原典
8. レトロスペクティブの改善アクション実施率に関する定量的実証研究
9. ソフトウェア開発メトリクスへの異常検知適用の一次事例
10. 開発対話ログへの LLM-as-a-judge 適用の信頼性検証研究
11. 開発生産性測定における最小集計人数（k匿名性閾値）の実務基準
12. ダッシュボードの先行指標・遅行指標の分類に関する一次的裏づけ
13. トヨタ公式による「なぜなぜ分析」解説ページ、および「人を責めるな、仕組みを責めろ」の一次出典
14. 日本企業の反省会文化に関する学術的実態調査
15. GitHub Copilot の acceptance rate の公式定義（現行ドキュメントに記載なし）

**制約事項**: 本調査は Web 検索の回数上限（200回）に到達したため、8〜15 の一部は検索自体を実行できていません。追加調査時は上記を優先してください。
