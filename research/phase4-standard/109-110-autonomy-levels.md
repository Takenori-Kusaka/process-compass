# 調査メモ: AI自律レベルの動的境界と開発者役割の移行（Issue #109 / #110）

- 調査日: 2026-08-05
- 対象 Issue:
  - #109「2026年のエージェント自律性を起点とする『AI自律レベル動的境界』の規定」
  - #110「開発者の役割を『コードの書き手』から『仕様プランナー＆レビューア』へ移行する作業規定」
- 目的: 自律レベルの分類軸、レベル移行の判定指標、および開発者の作業手順の再定義に必要な一次情報を収集する

## 0. 本メモの鮮度と読み方

本テーマは陳腐化が極めて速い領域です。以下の原則で記述しています。

- すべての事実記述に公表年月を付与する。断定できない点は「未確認」と明記する
- 2026-01 以降の情報を最優先とする。2025年以前の情報は「歴史的経緯」として節を分ける
- 出典の信頼度を区別する。一次情報（規格原文、研究機関、ベンダー公式、査読前論文）と、二次情報（ブログ・まとめ記事）を明示する
- 検索で発見した二次情報のうち、著者・組織が不明瞭なコンテンツ農場的なサイトは「低信頼度の二次情報」と注記する

**重要な限界**: 本調査は Web 検索と要約に基づきます。有料レポート本体（DORA 報告書 PDF、富士経済、Stack Overflow 2026 生データ等）は未取得です。数値は二次要約経由のものを含み、原典での再確認が必要です。

---

## 1. 自律性レベルの既存分類体系

### 1.1 原型としての SAE J3016（歴史的経緯 / 2014年初版・2021年改訂）

SAE J3016 は運転自動化を Level 0〜5 の6段階で定義します。AI エージェントの自律レベル論の事実上の原型です。

- Level 1: 縦方向または横方向のいずれか一方の運動制御を、ODD 限定で持続実行する
- Level 2: 縦横両方の運動制御を行うが、対象・事象の検知と応答（OEDR）と監視は人間の運転者が担う
- Level 3: ADS が動的運転タスク（DDT）全体を ODD 限定で実行する。ただし人間は介入要求（request to intervene）への応答準備を求められる
- Level 4: ADS が DDT 全体を実行し、フォールバックも ADS が担う。人間の介入要求応答は前提としない
- Level 5: ODD の限定がない（unlimited ODD）

この分類の構造上の要点は、レベル番号そのものではなく、次の3つの独立変数にあります。

- **誰が監視するか**（Level 2 までは人間、Level 3 以上はシステム）
- **フォールバックの担い手は誰か**（Level 3 は人間、Level 4 以上はシステムが最小リスク状態へ移行）
- **ODD（動作設計領域）の限定範囲**（Level 4 まで限定あり、Level 5 のみ無限定）

出典（一次・準一次）:
- SAE J3016_202104 本文 PDF（UNECE wiki ミラー）: https://wiki.unece.org/download/attachments/128418539/SAE%20J3016_202104.pdf
- SAE Standards Summary（UNECE ITS/AD 提出資料）: https://wiki.unece.org/download/attachments/56591466/(ITS_AD-14-10)%20SAE%20Standards%20Summary.pdf?api=v2
- ANSI Blog によるレベル解説（二次、2021年）: https://blog.ansi.org/ansi/sae-levels-driving-automation-j-3016-2021/

### 1.2 AI エージェントへの転用（2025年6月 / 学術）

Feng・McDonald・Zhang（ワシントン大学）の "Levels of Autonomy for AI Agents"（2025年6月、Knight First Amendment Institute 掲載、arXiv:2506.12469）は、「ユーザーの役割」を軸に5段階を定義します。

- L1 Operator（操作者）: ユーザーが計画を主導し、エージェントは要求に応じて支援する
- L2 Collaborator（協働者）: 計画を共有し、双方が並行して作業する。頻繁な相互通信を伴う
- L3 Consultant（相談相手）: エージェントが計画・実行し、ユーザーは間接的にフィードバックする。エージェント側から専門判断を仰ぐ
- L4 Approver（承認者）: エージェントが自律実行し、ブロッカーまたは重大な行為の承認時のみ人間が関与する
- L5 Observer（観察者）: 完全自律。人間はログでの監視と緊急停止のみ可能

重要な点として、**この論文自体は SAE J3016 を引用していません**（本文確認済み）。「SAE が AI エージェント自律レベルの原型である」という言説は、主に二次情報側の類推です。ただし同論文は「autonomy case（自律性ケース）」という概念を提示し、これは安全工学の safety case（安全性ケース）を範型としています。すなわち「あるエージェントが最大でも特定の自律レベルでしか振る舞わないこと」を証拠付きで論証する文書、という発想です。

出典:
- Knight First Amendment Institute 掲載版: https://knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1
- arXiv:2506.12469（HTML v2）: https://arxiv.org/html/2506.12469v2

### 1.3 コーディングエージェント向けの実務的5段階（2026年3月 / ベンダーブログ）

Swarmia のブログ「Five levels of AI coding agent autonomy, and why higher isn't always better」（2026-03-19）は、開発現場に近い5段階を示します。

- L1 Assistive: 単一ファイル内の補完・リファクタ・クイックフィックス
- L2 Conversational: リポジトリ横断の対話的作業。人間が随時舵を取る
- L3 Task Agent: タスクを渡すと PR が返る。自律的タスク完了
- L4 Autonomous Teammate: バックログから自発的に着手する。定期メンテナンス等
- L5 Agentic Avalanche: オーケストレーターによる複数エージェント協調。監督は最小限

同記事の主張（ベンダー見解であり実証データではない点に注意）:

- レベルが高いほど良いわけではない。タスク特性に応じて適正レベルが決まる
- L3 は「完了の定義」が曖昧さなく書けることが前提条件である
- L3 のエージェントは、弱いエンジニアリング基盤のボトルネックを増幅する
- 多くのチームは L2〜L3 で頭打ちになる。原因はタスク記述の不明確さである
- L5 のオーケストレーターパターンは、大半の組織にとって依然として実験段階である

出典: https://www.swarmia.com/blog/five-levels-ai-agent-autonomy/

### 1.4 「レベル」ではなく「連続量」で測る立場（2026年2月 / Anthropic）

Anthropic「Measuring AI agent autonomy in practice」（2026-02-18）は、離散レベルではなく実測可能な次元で自律性を捉えます。

- ターン継続時間（エージェントが停止せずに作業する長さ）
- ユーザーの監督パターン（自動承認率、割り込み頻度）
- エージェント発の停止（明確化のための質問頻度）
- リスクと自律性の同時評価（各行為を1〜10で二軸採点）

報告された実測値（Claude Code のテレメトリに基づく）:

- ターン継続時間の 99.9 パーセンタイルは、2025-10 から 2026-01 の間に約25分から45分超へほぼ倍増した
- 熟練ユーザーは自動承認率を 20% から 40% へ引き上げる一方、割り込み頻度も増やす。監督の放棄ではなく能動的監視への移行と解釈されている
- 複雑タスクでは、最小複雑度タスクの2倍以上の頻度でモデル側から確認質問が発生する
- 利用の約 50% がソフトウェアエンジニアリング。行為の約 80% に何らかのセーフガードがある

出典: https://www.anthropic.com/news/measuring-agent-autonomy

**#109 への含意（事実ではなく本メモの解釈は §10 に分離）**: レベル定義に使える独立変数は、SAE 由来の「監視者・フォールバック担い手・ODD」と、Feng らの「ユーザーの役割」と、Anthropic の「連続量としての実測次元」の3系統が存在します。

---

## 2. エージェント型コーディングの2026年時点の実力

### 2.1 SWE-bench Verified の飽和と信頼性崩壊（2026年前半）

- Claude Opus 4.6（2026-02-05 リリース）は SWE-bench Verified で 80.84%、SWE-bench Multilingual で 77.83% と報告される（Anthropic システムカード、2026-02）
- 2026年前半時点で、フロンティアモデル群は 80% 前後に密集していると複数の二次情報が報じる（Gemini 3.1 Pro 80.6%、GPT-5.2 80.0% 等）。ただし個別数値は二次情報経由であり未確認
- OpenAI は「Why we no longer evaluate SWE-bench Verified」（2026-02-23 公開とされる）で SWE-bench Verified の報告を停止した。内部監査で 138 の問題タスクのうち 6割超がテスト不備により「記述どおりには解けない」こと、およびタスク ID のみからゴールドパッチを逐語再現できる汚染の痕跡を報告したとされる（当該 URL は 403 で本文未取得。以下は二次情報経由であり **一次確認が必要**）
- 独立研究として、SWE-bench Verified の成功パッチの 32.67% に解答リークが関与し、モデルが正解ファイルパスを最大 76% の確率で訓練データから想起する、という報告がある（二次情報経由、原典未特定）

SWE-bench が測れていないもの（複数の批判研究の共通点）:

- バグ修正に偏っており、新規機能設計・アーキテクチャ設計を評価しない
- Python リポジトリに限定され、言語多様性を代表しない
- 単発（single-shot）評価であり、IDE 環境や長期的な文脈保持を評価しない
- 成功率のみでステップ数・時間効率を評価しないため、コスト膨張を隠す
- 「マージ可能性（merge readiness）」と高スコアは同義ではない

出典:
- Claude Opus 4.6 システムカード（一次、2026-02）: https://www-cdn.anthropic.com/14e4fb01875d2a69f646fa5e574dea2b1c0ff7b5.pdf
- OpenAI 記事（本文未取得・要再確認）: https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/
- UTBoost（SWE-bench の厳密再評価、arXiv:2506.09289）: https://arxiv.org/pdf/2506.09289
- SWE-Bench+（arXiv:2410.06992）: https://arxiv.org/pdf/2410.06992
- SWE-Bench Pro（長期タスク、arXiv:2509.16941）: https://arxiv.org/pdf/2509.16941
- SWE-EVO（長期ソフトウェア進化、arXiv:2512.18470）: https://arxiv.org/pdf/2512.18470
- 二次情報（低信頼度、数値の裏取り未実施）: https://www.digitalapplied.com/blog/swe-bench-verified-june-2026-benchmark-vs-scaffolding-analysis

### 2.2 後継ベンチマーク: Terminal-Bench 2.0 / 2.1（2026年）

- Terminal-Bench 2.0 は端末環境の89タスク・16カテゴリで構成される
- Terminal-Bench 2.1 は 2.0 の 89 タスク中 28 タスクを修正し、継続的検証を導入した。**2.0 と 2.1 のスコアは互換ではない**
- 2026年時点のスコアは、モデル単体で 65〜73%、スキャフォールド込みの上位構成で 81〜82% 程度と報告される（いずれも二次情報経由。要一次確認）

出典（いずれも二次）:
- Terminal-Bench 2.0 リーダーボード: https://llm-stats.com/benchmarks/terminal-bench-2
- Terminal-Bench 2.1（Snorkel AI）: https://snorkel.ai/leaderboard/terminal-bench-2-1/

**SWE-Lancer の 2026 年時点のスコア推移は本調査では取得できませんでした（未確認）。**

### 2.3 METR の時間地平（time horizon）研究 — 最重要の定量指標

METR は「モデルが 50% の成功率で完了できるタスクの、人間換算所要時間」を測定しています。

歴史的経緯（2025-03）: 初報では 2019〜2024 年にわたり約7か月で倍増するトレンドを報告しました（arXiv:2503.14499）。

最新（2026-01-29、Time Horizon 1.1）:

- タスク数を 34% 増（170 → 228）し、8時間以上のタスクを 14 → 31 に倍増した
- 全期間の倍加時間は約 196 日（別集計で 188 日）
- 2023 年以降に限れば約 129〜131 日（約 4.3 か月）
- 2024 年以降に限れば約 89 日（約 3 か月）
- 50% 時間地平の実測値: Claude Opus 4.5 = 320 分、GPT-5 = 214 分、o3 = 121 分、Claude Opus 4 = 101 分

METR 自身が明示する限界:

- 信頼区間は依然として非常に広い
- 最長 31 タスクのうち人間ベースライン実測は 5 件のみ。残りは推定値である
- 「16 時間超の測定は現行タスクスイートでは信頼できない」
- TH1 と TH1.1 の成長率は期間全体では直接比較できない

出典（一次）:
- Time Horizon 1.1（2026-01-29）: https://metr.org/blog/2026-1-29-time-horizon-1-1/
- 時間地平トラッカー: https://metr.org/time-horizons/
- 初報（2025-03-19、歴史的経緯）: https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/

### 2.4 生産性の実証（歴史的経緯 + 2026年の更新）

- METR RCT（2025-07-10、arXiv:2507.09089）: 経験豊富な OSS 開発者16名・246タスクで、AI 利用可群はタスク完了が 19% **遅かった**。開発者の事前予測は 24% 短縮、事後自己評価は 20% 短縮であり、主観と実測が逆転した
- **重要**: METR 自身が 2026-02-24 に実験設計の変更を公表し、2025年の結果を「歴史的」と位置づけている。現在のツール・ワークフローを必ずしも反映しないとしている

出典（一次）:
- METR RCT（2025-07）: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ / https://arxiv.org/abs/2507.09089
- 実験設計変更（2026-02-24）: https://metr.org/blog/2026-02-24-uplift-update/

---

## 3. マルチエージェント構成の実務

### 3.1 オーケストレーター／サブエージェント（2025年6月〜、Anthropic）

Anthropic のマルチエージェント研究システムはオーケストレーター・ワーカー型です。Lead Researcher が中央調整し、サブエージェントが分割された部分を担当します。報告された知見は次のとおりです。

- エージェントは投入努力量の判断が苦手である。ゆえに明示的なスケーリング規則を埋め込む
  - 単純な事実確認: 1エージェント・3〜10ツール呼び出し
  - 直接比較: 2〜4サブエージェント・各10〜15呼び出し
  - 複雑な調査: 10 超のサブエージェントに責務を明確分割
- ツール設計はプロンプト設計と同等に重要である。貧弱なツール説明はエージェントを完全に誤った経路へ導く
- 長時間・多ツール呼び出しの状態を持つため、**小さな障害が連鎖して振る舞い全体を破壊しうる**。通常のソフトウェアのようにバグが性能劣化にとどまらない

出典: https://www.anthropic.com/engineering/harness-design-long-running-apps および二次まとめ https://blog.bytebytego.com/p/how-anthropic-built-a-multi-agent

### 3.2 長時間実行ハーネス（2025-11-26、Anthropic）

「Effective harnesses for long-running agents」は、コンテキストウィンドウを跨ぐ長時間作業の設計を示します。

- 課題の本質は「各セッションが前シフトの記憶を持たない交代要員である」こと
- 二層構成: Initializer エージェント（`init.sh`、進捗ファイル、初期コミット、機能リスト生成）と Coding エージェント（進捗ログと git 履歴を最初に読む）
- 一度に1機能のみ扱う。説明的メッセージで逐次コミットする
- JSON 形式の機能リストによる構造化追跡が、「早すぎる完了宣言」を減らす
- ブラウザ自動化（Puppeteer 等）による E2E テストが、単体テストで捕捉できない不具合を検出する
- 各セッションはクリーンな状態で終了し、次のエージェントが作業可能な状態を引き継ぐ

出典（一次）: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

### 3.3 並列実行とワークツリー分離（2026年、実務報告）

- 並列サブエージェントの前提インフラは git worktree である。worktree なしで複数エージェントが同一ディレクトリを触ると、ファイル上書きと git インデックス破壊が即座に発生する
- 各サブエージェントは独立したコンテキスト・作業ディレクトリ・ツール権限を持ち、オーケストレーターがタスク割当と結果統合を行う

報告されている失敗モード:

- **コンテキスト汚染**: N 個の同時エージェントの部分出力・状態・保留判断が単一コンテキストを奪い合う（フラットコンテキスト構成の場合）
- **ホットスポット衝突**: ルーティング、設定、レジストリなど共有ファイルで並列エージェントがコンフリクトを起こす
- **重複実装**: 同じ機能を複数エージェントが別々に作る
- **意味的不整合**: コンパイルは通るが実行時に前提が食い違う（"compiles but disagrees at runtime"）
- **リソース衝突**: DB・ポートの競合

出典（いずれも二次、実務者ブログ）:
- https://addyosmani.com/blog/code-agent-orchestra/
- https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace
- https://www.gptfrontier.com/preventing-database-and-port-collisions-with-concurrent-ai-agents/
- コンテキストスコープ限定の研究（arXiv:2604.07911）: https://arxiv.org/pdf/2604.07911

### 3.4 「分割しすぎない」方向の反証（2026年）

- 単一エージェントが同等の思考トークン予算でマルチエージェント系を上回るという報告がある（arXiv:2604.02460、多段推論領域）
- 実行時に構造化する分解（runtime-structured decomposition）は、静的分解に比べ再試行コストを 73.2%、モノリシックに比べ 51.7% 削減したとの報告がある（arXiv:2605.15425）。**静的な事前分解は再試行コストを確実には減らさない**
- 基盤モデルの能力向上に伴い、分解と調整の必要性はむしろ減る方向という見解がある

出典:
- https://arxiv.org/pdf/2604.02460
- https://arxiv.org/pdf/2605.15425

### 3.5 仕様駆動（spec-driven）ワークフロー

- SDD は仕様を「再生成可能なコードの源泉となる一次成果物」として扱う方法論である
- 2025 年に GitHub Spec Kit（2025-09 OSS 公開）、AWS Kiro（2025-07）、BMAD-METHOD 等で AI 中心の形が固まった（歴史的経緯）
- 仕様は固定スキーマを取る。ユーザーストーリー、EARS 記法の受入基準、アーキテクチャ制約、プロジェクト全体規約（"constitution"）
- 学術側の整理として arXiv:2602.00180「Spec-Driven Development: From Code to Contract in the Age of AI Coding Assistants」（2026-02）がある

出典:
- arXiv:2602.00180: https://arxiv.org/pdf/2602.00180
- VS Code の EARS 自動生成 Issue（一次、実装事例）: https://github.com/microsoft/vscode/issues/261160
- Wikipedia（概観）: https://en.wikipedia.org/wiki/Spec-driven_development

---

## 4. 自己修復・自律進化（L3相当）の現状

### 4.1 実運用に入っているもの

- **CI 失敗からの自己修正ループ**: ジョブ失敗時に失敗コンテキストとテスト出力をコーディングエージェントへ渡し、修正 PR を自動生成する構成が実運用にある。GitHub は "Continuous AI" を 2026-02 に technical preview として公開したと報じられる（二次情報、一次未確認）
- **Sentry Seer × GitHub Copilot**: Seer の根本原因分析結果を Copilot エージェントに渡し、修正 PR を生成する連携が公式ドキュメントに存在する（一次）
- **インシデント調査の自律化**: Microsoft は Azure SRE Agent を自社サービスに 1,300+ エージェント規模で展開し、35,000+ 件のインシデント緩和、20,000+ 時間の削減を報告したとされる（二次情報経由。**一次未確認**）

### 4.2 研究段階・限定運用にとどまるもの

- **無人での本番変更（autonomous remediation）**: 2026年時点では「自律的な調査は実用段階、自律的な是正は依然として監督下」という整理が複数の実務観測で共通しています。ベンダー横断のパターンは「調査は自律・是正は監督付き」です
- **マージ権限**: 主要コーディングエージェントは 2026 年時点で PR 作成とレビューコメント応答まで自律化する一方、**マージには人間の承認を要する**構成が標準です。Datadog の Bits Code は「エージェントは PR を提案するが、マージの判断はエンジニアが行う」と明示していると報じられます
- **精度の前提条件**: シャドーモード期間やランブックの索引化を省略した組織では、精度が 50〜60% 帯にとどまり「人間より悪い」という報告があります

出典:
- Sentry 公式ドキュメント（一次）: https://docs.sentry.io/integrations/coding-agents/copilot/
- Azure SRE Agent と Copilot の自己修復構成（二次、2026-04-29）: https://stochasticcoder.com/2026/04/29/beyond-the-alert-building-self-healing-pipelines-with-azure-sre-agent-and-github-copilot/
- 自律 SRE エージェント研究（arXiv:2604.03933）: https://arxiv.org/pdf/2604.03933
- インシデント対応のマルチエージェント研究（arXiv:2511.15755）: https://arxiv.org/pdf/2511.15755
- 二次まとめ（低信頼度、数値の裏取り未実施）: https://www.augmentcode.com/guides/autonomous-engineering-loop / https://nerdleveltech.com/ai-sre-agents-autonomous-incident-remediation

---

## 5. 人間が担保すべき領域の議論

### 5.1 EU AI Act 第14条（human oversight）— 一次規範

高リスク AI システムは、使用期間中に自然人が実効的に監督できるよう設計・開発されなければなりません。監督措置は「リスク、自律性の水準、利用文脈に見合ったもの」であることが要求されます。

第14条4項が監督者に可能としなければならない事項:

- (a) システムの能力と限界を適切に理解し、異常・機能不全を監視する
- (b) **自動化バイアス**（出力へ自動的に依存・過度依存する傾向）を自覚し続ける
- (c) 利用可能な解釈ツールを用いて出力を正しく解釈する
- (d) システムを使わない、あるいは出力を無視・上書き・取消しする判断を行う
- (e) 運転に介入する、または「停止」ボタン等の手続でシステムを中断する

第14条5項は、遠隔生体識別について「2名以上の自然人による別個の検証・確認」がない限り行為・決定を行わないことを求めます（法執行等の例外あり）。

出典（一次テキスト）: https://artificialintelligenceact.eu/article/14/

### 5.2 ISO/IEC 42001:2023（AI マネジメントシステム）

- 箇条8（運用）が AI の開発・展開・監視に対する統制を定め、妥当性確認・変更管理・人間による監督を含みます
- 附属書 A は 38 の参照管理策を提示し、透明性と人間による監督を主題の一つとします

**限界**: 具体的な「どのタスクを人間が担うか」の粒度までは規定していません。詳細条文は本調査では原文未取得（ISO は有償）であり、**要一次確認**です。

出典: https://www.iso.org/standard/42001 / https://learn.microsoft.com/en-us/compliance/regulatory/offering-iso-42001

### 5.3 日本: AI 事業者ガイドライン 第1.2版（2026-03-31、総務省・経済産業省）

- 2026-03-31 に第1.2版が公表されました。2024-04 の初版から2度目の改定です
- 最大の変更点として、**自律的に業務を遂行する AI エージェント**と、物理世界で動作するフィジカル AI が正式に対象へ追加されました
- これらの AI が**外部に影響を与える操作を行う前に「人間の判断を必須とする仕組み（Human-in-the-Loop）」を組み込むこと**が明記されました
- 同ガイドラインは法的拘束力を持たない。ただし日本における AI 事業のルール基盤として機能します

**注記**: PDF 本文の直接取得は 403 で失敗しました。上記は二次解説に基づきます。**条文の正確な文言は要一次確認**です。

出典:
- 原典 PDF（本文未取得）: https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20260331_1.pdf
- PwC 解説: https://www.pwc.com/jp/ja/knowledge/column/ai-governance/ai-guideline-03.html
- 森・濱田松本法律事務所ニュースレター: https://www.morihamada.com/ja/insights/newsletters/137701

### 5.4 自動化バイアスと「人間による監督」の実効性への疑義

規格が要求する human oversight は、実証研究では効果が限定的とされています。

- 人間は正確なシステムを信頼し、検証をやめ、既定で承認する（rubber-stamping）方向へ漂流する。書類上は人間が判断したことになる
- 自動化バイアスには、警告が出ないため行動しない「見落とし誤り（omission）」と、反証があるのに自動出力に従う「実行誤り（commission）」がある
- ある評価では、問題が実際に人間の目の前に提示された場合でも、人間がそれを捕捉して止められた割合は、試したどの監督戦略でも 9〜26% にとどまり、約4回に3回は承認されたと報告されます（**出典が二次情報のため、原典特定が必要**）
- 逆説的な知見として、**明確な説明を受けた人間ほど AI 推奨へ強く追従する**。説明性の向上が監督を支えるのではなく監督を代替してしまう（MIT SMR）
- EU AI Act の自動化バイアス条項自体の法的含意を論じた研究（arXiv:2502.10036）が存在します

出典:
- Green「The Flaws of Policies Requiring Human Oversight of Government Algorithms」（arXiv:2109.05067）: https://arxiv.org/pdf/2109.05067
- 「On the Quest for Effectiveness in Human Oversight」（arXiv:2404.04059）: https://arxiv.org/pdf/2404.04059
- 「Automation Bias in the AI Act」（arXiv:2502.10036）: https://arxiv.org/pdf/2502.10036
- MIT Sloan Management Review「AI Explainability: How to Avoid Rubber-Stamping Recommendations」: https://sloanreview.mit.edu/article/ai-explainability-how-to-avoid-rubber-stamping-recommendations/
- Melanie Fink「Human Oversight under Article 14」（SSRN）: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5147196
- 「Designing meaningful human oversight in AI」（AI and Ethics, 2026）: https://link.springer.com/article/10.1007/s43681-026-01147-7

### 5.5 スキル劣化（deskilling / knowledge atrophy）

「人間が理解を維持できなくなる」ことのリスクについて、2026年前半に複数の実証研究が出ています。

- AI 支援を用いた開発者は、同一タスク後の理解度テストで非利用群より **17% 低い**スコアだった。コーディングを AI に完全委譲した群でスキル形成の低下が最も急峻だった
- 無制限に AI を使った群は、初期構築では足場（scaffold）付き群と同等の生産性を示したが、**AI なしの後続保守タスクで 77% の失敗率**（足場付き群は 39%）
- 「認知的負債（cognitive debt）」概念: コードが開発者の理解速度を超えて生産されるときに蓄積される理解の欠損
- 難易度の高いタスクほど劣化が顕著であり、独力での問題解決と検証への自信の双方が低下する
- 「熟練オーケストレーターのパラドックス」: AI を有効に管理するために必要なスキルは、AI への依存継続によって萎縮するスキルと同一である
- 開発者コミュニティの言説分析として「An Endless Stream of AI Slop」（arXiv:2603.27249）がある
- 保守性への下流影響として「Echoes of AI」（arXiv:2507.00788）がある

**注記**: 上記の 17%、77% 等の数値は検索結果経由であり、各原典での再確認が必要です（**要一次確認**）。

出典:
- 「Agents That Teach」（arXiv:2607.06101、2026-07）: https://arxiv.org/html/2607.06101
- 「The Productivity-Reliability Paradox」（arXiv:2605.01160）: https://arxiv.org/pdf/2605.01160
- 「AI, Metacognition, and the Verification Bottleneck」（arXiv:2601.17055）: https://arxiv.org/pdf/2601.17055
- 「Echoes of AI」（arXiv:2507.00788）: https://arxiv.org/pdf/2507.00788
- 「An Endless Stream of AI Slop」（arXiv:2603.27249）: https://arxiv.org/html/2603.27249v3
- Scientific American（一般向け解説）: https://www.scientificamerican.com/article/is-ai-ruining-our-skills-early-results-are-in-and-theyre-not-good/

### 5.6 DORA が指摘する3つのトレードオフ（2026-03-10）

- **検証税（Verification Tax）**: コードを書く時間は減るが、AI の子守（babysitting）に時間を使う
- **専門性のパラドックス（Expertise Paradox）**: 参入障壁を下げる一方、深い専門性に必要な「生産的な苦闘（productive struggle）」を迂回させる
- **ワークフローギャップ**: 試作の高速化が本番統合の複雑さで相殺される。ツールの乱立が意思決定の摩擦を生む

出典（一次）: https://dora.dev/insights/balancing-ai-tensions/

---

## 6. レベル移行の客観的判定指標（#109 の核心）

### 6.1 重要な発見: 公開された「レベル移行判定基準」の一次事例は未確認

本調査の範囲では、**組織が AI 自律レベルを引き上げ／引き下げする定量基準を公開している一次事例を発見できませんでした**。存在するのは次の3種の断片です。

1. リスク階層（blast radius tier）による**静的な**権限割当
2. エージェント評価指標（成功率、介入率、コスト）
3. 組織のデリバリー健全性指標（DORA、コード品質指標）

これらを「移行判定」として結合した公開規程は未確認です。#109 は、この空白を埋める設計になります。

### 6.2 リスク階層（blast radius tier）による割当

実務ブログ横断で共通に観察される4階層構成（**一次規格ではない**点に注意）:

- Tier 0: 読み取り専用・低リスク → 自動許可（出力スキャン付き）
- Tier 1: 非本番環境への書き込み → 制約付き許可（再試行回数の上限あり）
- Tier 2: 本番環境への書き込み → 人間承認を要する
- Tier 3: 権限・インフラ変更 → 多段承認を要する

判定に使われる軸:

- **可逆性（reversibility）**: 不可逆性が human-in-the-loop を必須化する引き金である。ロールバック手順が定義されていることを要件とする
- **影響範囲（blast radius）**: 誤った場合に影響しうる顧客トラフィックの割合。設定した上限を超える提案を禁止する
- **提案元エージェントの確信度（confidence）**

出典（二次）:
- https://www.sophos.com/en-us/blog/inside-the-lethal-trifecta-blast-radius-reduction-in-ai-agent-deployments
- https://www.baytechconsulting.com/blog/engineering-patterns-secure-agentic-ai-2026
- https://beyondscale.tech/blog/agentic-ai-blast-radius-containment-guide
- https://agenticrisks.com/the-pre-deployment-agentic-risk-assessment/

### 6.3 エージェント側の性能指標

2026年時点で「価値を予測する」とされる指標群:

- タスク成功率（task success rate）
- 成功1件あたりのコスト（cost per successful task）
- レイテンシ
- 正確性・忠実性（faithfulness）
- **自律性と介入率（autonomy and intervention rate）**

閾値の目安（**根拠は実務者見解であり実証データではない**）:

- 低リスクかつ範囲が明確なタスク: 本番投入前に 90% 以上の成功率を期待する例が多い
- 複雑な多段自律作業: 50〜70% でも十分に強いとされる
- 絶対値ではなく**同一タスクの人間ベースラインとの比較**で評価すべきとされる

信頼性フレームワークの3要件（出力品質、周期・エッジケースを跨ぐ安定性、可逆性）も提示されています。

出典（二次）:
- https://www.confident-ai.com/blog/llm-agent-evaluation-complete-guide
- https://www.brthls.com/magazine/agent-reliability-score-autonomy-en

### 6.4 組織側のデリバリー指標

- DORA 2025 / 2026 の一貫した知見として、AI 採用はスループットと**不安定性の双方**と正相関します。すなわち速度指標だけでレベル移行を判断すると失敗します
- DORA 2025 は7つのチームプロファイルを提示します（Harmonious high-achievers 20%、Pragmatic performers 20%、Constrained by process 17%、Stable and methodical 15%、Legacy bottleneck 11%、High impact low cadence 7%、Foundational challenges）。**組織の型によって AI の効き方が変わる**という主張です
- DORA AI Capabilities Model（2025-11-25 公開）は AI の便益を増幅する7つのケイパビリティを整理します（**個別項目名は本調査では未取得**）
- DORA 2026-01「The ROI of AI-Assisted Software Development」は J カーブ型の価値実現モデルを提示するとされます（**本文未取得**）

コード品質側の指標（GitClear、2026-01 公開、2023〜2026 の 6.23 億変更を分析）:

- ブロック重複が 2023 年比 81% 増（変更100万行あたり 40.3 → 73.0）
- コミット内コピペが 41% 増
- 2週間コードチャーン（手戻り）が 15% 増。別集計では AI 以前の 3.3% から 2025 年 7.1% へ
- リファクタリングによる行移動が 2022 年比 70% 減。移動コードの比率は 21%（2022）→ 3.8%（2026）
- ファイル横断の関数呼び出し（再利用の指標）が 2023 年比 35% 減
- 長期レガシー保守が 2023 年比 74% 減
- エラー隠蔽構文（error-masking constructs）が 47% 増

出典:
- DORA 2025 レポート（一次）: https://dora.dev/dora-report-2025/
- DORA 出版物一覧（一次）: https://dora.dev/research/publications/
- DORA AI Capabilities Model（一次）: https://dora.dev/research/ai/ai-capabilities-model/
- DORA インサイト（一次、2026-03-10）: https://dora.dev/insights/balancing-ai-tensions/
- GitClear「The Maintainability Gap」（一次、2026-01）: https://www.gitclear.com/the_ai_code_quality_maintainability_gap
- IT Revolution によるチームプロファイル解説（二次）: https://itrevolution.com/articles/ais-mirror-effect-how-the-2025-dora-report-reveals-your-organizations-true-capabilities/

### 6.5 Anthropic 型の「実測による境界調整」

§1.4 の指標は、レベル移行の**動的**判定に直接使えます。

- 自動承認率（人間がどれだけ確認を省いているか）
- 割り込み率（人間が能動的に監視できているか）
- ターン継続時間の分布（実際にどこまで無介入で走っているか）
- エージェント発の確認質問頻度（不確実性の自己申告）

**#109 が「動的境界」を名乗る根拠**は、これらが日次で観測可能な運用テレメトリであり、静的なレベル表よりも実態に近い点にあります（この評価は本メモの解釈）。

---

## 7. 開発者の作業手順の変化（#110）

### 7.1 受入基準の記述方法

**EARS 記法（Easy Approach to Requirements Syntax）**:

- Alistair Mavin が 2009 年に Rolls-Royce で考案した（歴史的経緯）
- 5つの文型からなる。Ubiquitous（恒常）、Event-driven（事象駆動）、State-driven（状態駆動）、Unwanted behaviour（望ましくない挙動）、Optional feature（任意機能）
- 曖昧な要求を、検証可能で一意な文へ変換する
- 2026 年時点では「人間にもモデルにも曖昧でない受入基準」の事実上の標準とされます（ベンダー言説を含むため、標準化の実態は**未確認**）

**Given-When-Then** については、本調査で 2026 年時点の新しい一次知見を発見できませんでした（**未確認**）。EARS の Event-driven 文型（When <trigger>, the <system> shall <response>）が実質的に同一構造である点のみ確認できます。

出典:
- Jama Software（EARS 解説）: https://www.jamasoftware.com/requirements-management-guide/writing-requirements/adopting-the-ears-notation-to-improve-requirements-engineering/
- 「EARS, Fifteen Years On」（2026、実務者論考）: https://joshmcdonald.medium.com/ears-fifteen-years-on-the-requirements-format-built-for-the-agent-era-0f78f8ff35a0
- VS Code の EARS 自動生成 Issue（一次）: https://github.com/microsoft/vscode/issues/261160

### 7.2 タスク分解の粒度

- サブタスクは「LLM やツールが実行可能な程度に具体的」かつ「計画が過度に長くならない程度に粗い」必要がある
- **静的な事前分解は再試行コストを確実には減らさない**。実行時に構造化する分解が有効である（arXiv:2605.15425、再試行コスト 51.7〜73.2% 削減）
- 基盤モデルの能力向上に伴い、分解と調整が価値を生む領域は縮小していく可能性がある
- Anthropic の実務規則は「タスクの複雑度に応じてエージェント数とツール呼び出し数を明示的に指定する」ことである（§3.1）

**「AI が迷わず自律実行できる粒度」を定量的に示した一次研究は未確認です。** 現時点では Swarmia の「完了の定義が曖昧さなく書けること」（§1.3）が最も実務的な基準です。

### 7.3 CI/CD と自己修正ループの連携

- 失敗コンテキスト（ジョブログ、テスト出力）をエージェントへ自動供給し、修正 PR を生成する構成が実運用にある（§4.1）
- 安全ゲートとして PR を用い、「調査は自律、是正は監督付き」に保つ設計が主流である
- 長時間実行では、E2E テスト（ブラウザ自動化等）が単体テストの穴を埋める（§3.2）

### 7.4 「1行ずつ読む」ことの非効率と、代わりに見るべきもの

実務側の共通認識（**一次の実証研究ではなく実務者言説である**点に注意）:

- エージェントは人間が読める速度を超えてコードを生成する。5分で400行が出る状況では行単位レビューは成立しない
- 400 行を超えた時点でそれはレビューではなく承認印（rubber stamp）になる

代替として提案されている手法:

- **4チェックポイント方式**: 実行前のスコープ限定 → 実行中の承認ゲート → 実行後の差分ゲート → マージ前のテスト検証
- **振る舞い基準の検証**: 起票時の受入基準を数え上げ、各基準について「違反したら落ちるテスト」が外側から1本以上存在することを確認する
- **敵対的思考**: 「これが誤りだと確信させる証拠は何か」を問う。異常入力を試し、ハッピーパスを疑う
- **同期的協働**: ペア／モブプログラミングの併用

学術側では「Human-AI Synergy in Agentic Code Review」（arXiv:2603.15911）および「3100 Opinions on Code Review in an AI World」（arXiv:2607.07980、Agarwal・Miller・Kästner・Vasilescu、2026-07）があります。後者は PDF が機械可読でなく**本文未読**です。**要追加調査**。

出典:
- https://arxiv.org/pdf/2603.15911
- https://arxiv.org/pdf/2607.07980
- Thoughtworks「The code review is dead; long live the code review」: https://www.thoughtworks.com/en-us/insights/blog/testing/code-review-dead-long-live-code-review
- Bryan Finster「AI Broke Your Code Review」: https://bryanfinster.substack.com/p/ai-broke-your-code-review-heres-how
- リスクベース検証ワークフロー（実務者ブログ）: https://www.ai.joaoqueiros.com/blog/read-less-code-verify-ai-generated-software-test-harnesses

---

## 8. AI の実行トレースのレビュー

### 8.1 標準化: OpenTelemetry GenAI セマンティック規約

- v1.41 時点で agent / workflow / tool / model の各スパンと、レイテンシ・トークン使用量のメトリクスを定義します
- エージェントのトレースは `invoke_agent` スパンを頂点に、各 LLM 呼び出しの `chat` スパン、各ツール呼び出しの `execute_tool` スパンを子として持つ木構造になります
- 対象領域は LLM クライアントスパン、エージェントスパン、イベント（プロンプト／生成内容）、メトリクスの4つです
- **重要な限界**: ほぼすべての `gen_ai.*` 属性は Development 安定性であり、メジャーバージョンを上げずに属性名が変わりうる。2026-06 のリポジトリ分割が示すとおり、作業は進行中で未完成です

出典:
- OpenTelemetry 公式ブログ（一次、2026）: https://opentelemetry.io/blog/2026/genai-observability/
- Datadog による対応表明（ベンダー一次）: https://www.datadoghq.com/blog/llm-otel-semantic-convention/

### 8.2 「コードではなく振る舞いをレビューする」実務

- AI エージェント可観測性は、プロンプト／応答ログ・トークン・レイテンシで止まる従来の LLM 可観測性を超えて、**本番における意思決定経路全体**を捕捉・評価する実務と定義されます
- 監査はリクエスト単位ではなく**ツール呼び出し単位**の証跡として取得し、SIEM（Splunk、Sentinel、Datadog 等）へ流してコンプライアンス証跡とする構成が報告されます
- 監査観点の整理例として、トレース網羅性・スパン深度・評価シグナル・ドリフト検知・コスト追跡・インシデント対応準備の6軸があります（二次）

出典（いずれも二次、ベンダー系）:
- https://www.strac.io/blog/monitor-ai-agents
- https://www.braintrust.dev/articles/best-ai-agent-observability-tools-2026
- https://www.confident-ai.com/knowledge-base/compare/best-ai-agent-observability-tools-2026

**組織のプロセス規程として「トレースレビューを成果物レビューに組み込む」ことを定めた一次事例は未確認です。**

---

## 9. 役割変化に関する実証データ

### 9.1 DORA（2025-09 / 2026-03）

- 技術専門職の 90% が業務で AI を利用する。80% 超が生産性向上を実感する
- 開発者の 30% が AI 生成コードを「ほとんど、または全く信頼していない」
- AI 採用はデリバリースループットと正相関する。同時に不安定性とも正相関する（変更失敗、手戻り、解決サイクルタイムの増加）
- AI は下流のテスト・コードレビュー・品質保証のボトルネックを露呈させる
- 用途頻度の順は、コード生成 → 情報探索 → コードレビュー → テストである
- 60% 超の開発者がデプロイ後に AI 起因の誤りを発見したと報告される（**二次情報経由、要一次確認**）
- 中心命題は「AI は増幅器（amplifier）である」。強い組織の流れを加速し、脆い組織の痛点を露呈させる

出典:
- https://dora.dev/dora-report-2025/
- https://dora.dev/insights/balancing-ai-tensions/
- https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report

### 9.2 GitHub Octoverse 2025（2025-10-31）

- コーディングエージェントは 2025-05〜09 の5か月で **100万件超の PR** を作成した。対象は実験的リポジトリではなく、確立された高スター数リポジトリに偏った
- PR 作成は 20.4% 増、マージ済み PR は 23% 増（月間 4,320 万件）
- コミットは約 10 億件（25% 増）。一方で**コミットへのコメントは 27% 減**。生成量が増える一方でレビューの実質が減っている兆候である
- Broken Access Control が Injection を抜いて最多の脆弱性となり、15.1 万超のリポジトリで検出された（前年比 172% 増）

出典（一次）: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/

### 9.3 Stack Overflow Developer Survey

2025 年版（一次）:

- 84% 超が AI ツールを利用中または利用予定である
- AI の正確性を信頼する層は 29%。前年比 11 ポイント減である
- 「不信」（46%）が「信頼」（33%）を上回る。「強く信頼する」はわずか 3% である
- 経験豊富な開発者ほど慎重である。「強く信頼」2.6%、「強く不信」20%
- 不信の理由: 75.3% が AI の回答を信頼しない、61.7% が倫理・セキュリティ懸念、61.3% が「自分のコードを完全に理解したい」

2026 年版（2026-02 の Stack Overflow ブログが「AI 信頼ギャップ」を扱う）は本調査で数値本体を取得できませんでした（**未確認**）。二次情報に「AI 利用 84%、強い信頼 3%」という 2026 年版の記述がありますが、2025 年版と同一値であり、混同の可能性が高いため採用しません。

出典:
- 2025 年版（一次）: https://survey.stackoverflow.co/2025/ai
- Stack Overflow ブログ（2026-02-18）: https://stackoverflow.blog/2026/02/18/closing-the-developer-ai-trust-gap/

### 9.4 日本国内の実態

- 総務省・経済産業省「AI 事業者ガイドライン 第1.2版」（2026-03-31）が AI エージェントを対象に加え、外部影響操作の前に人間判断を挟む仕組みを求めた（§5.3）
- PwC「生成AIに関する実態調査2026 春」（2026-02 実施、6か国比較）は、日本企業の活用が既存業務の効率化・個別タスク支援中心であり、ツール利用の域を出ない面があると指摘するとされます（**本文 403 で未取得、要一次確認**）
- 富士経済「国内ユーザー企業における生成AI/AIエージェント利用実態調査 2026」が存在します（有償、**未取得**）

出典:
- https://www.pwc.com/jp/ja/knowledge/thoughtleadership/generative-ai-survey2026.html
- https://www.fuji-keizai.co.jp/report/detail.html?code=832601719&la=ja

**日本企業における「建前と実運用の乖離」を直接扱う一次データは、本調査では発見できませんでした（未確認）。** 間接的な材料は次のとおりです。

- AI 事業者ガイドラインは法的拘束力を持たない。ゆえに「HITL を組み込むこと」が規程上は明記されつつ、実運用では自動承認が常態化する余地がある（本メモの解釈）
- 自動化バイアス研究が示す rubber-stamping（§5.4）は、承認印文化と親和性が高い（本メモの解釈）

---

## 10. 考察（本メモの解釈。事実ではない）

### 10.1 #109 のレベル軸は「番号」ではなく「3変数」で定義すべき

SAE J3016 の本質は 0〜5 の番号ではなく、監視者・フォールバック担い手・ODD の3変数です。AI 開発プロセスに転用するなら次の対応が自然です。

- 監視者 = 誰がエージェントの出力を常時見ているか（人間 / 別のエージェント / 誰も見ていない）
- フォールバック = 失敗時に誰が回復するか（人間 / 自己修正ループ / ロールバック自動化）
- ODD = エージェントが動作を許される領域（リポジトリ、環境、変更種別、影響範囲）

このうち **ODD が #109 の「動的境界」の実体**になります。レベルを上下させるとは、ODD を広げる／狭めることと同義に定義できます。

### 10.2 「動的」であるべき根拠は3つある

1. モデル能力が3か月で倍増している（METR、2024年以降 89 日で倍加）。年次改訂の静的規程は追随できない
2. ベンチマークが信頼を失っている（SWE-bench 汚染）。外部スコアではなく自組織のテレメトリで判断せざるをえない
3. 監督の実効性は人間側の疲労・慣れで劣化する（自動化バイアス）。境界は引き上げだけでなく**引き下げ**も規定する必要がある

### 10.3 レベル移行の判定は「二軸」で組むのが妥当

公開事例が存在しない以上、#109 は次の合成を提案する形になります。

- **前提条件（gate）**: リスク階層（可逆性・影響範囲）による上限。ここは実績に関係なく引き上げない
- **実績条件（evidence）**: エージェントのタスク成功率・介入率、およびレビュー差し戻し率・手戻り率・変更失敗率。一定期間の実測で上限内の昇格を判断する
- **引き下げ条件（trip）**: 自動承認率の急上昇（監督の形骸化）、AI 起因インシデント、チャーン率の上昇

### 10.4 #110 の「見るべきもの」の優先順位

実証データが揃っていないため断定はできませんが、収集した情報からは次の順序が支持されます。

1. 受入基準とテストの対応（各基準に対し「違反すると落ちるテスト」が存在するか）
2. 外部インタフェースの差分（API、スキーマ、権限、設定）
3. 差分の性質（追加か / 移動か / コピペか。GitClear の指標がここに直結する）
4. 実行トレース（何を読み、何を実行したか。特に想定外のツール呼び出し）
5. 実装コードの逐行確認（最後。範囲を絞って実施する）

### 10.5 スキル劣化は「プロセス規程で扱うべきリスク」である

deskilling は個人の心がけではなく、プロセス設計の問題として現れます。§5.5 の「AI なしの保守タスクで 77% 失敗」は、レビューア役の人間が数年後にレビュー能力を失うことを示唆します。#109/#110 は、レベルを上げるほど**人間側の能力維持措置**（AI 不使用での実装機会、理解度の確認、ローテーション）を義務化する構造にすると整合します。

---

## 11. 埋められなかった観点（追加調査が必要な穴）

- **OpenAI の SWE-bench 撤退記事の一次確認**: URL が 403。公表日・監査対象数・汚染率の数値は二次情報経由であり未確定
- **SWE-Lancer の 2026 年時点スコア**: 未取得
- **DORA AI Capabilities Model の7ケイパビリティ個別名**: 未取得（レポート PDF 本体が必要）
- **DORA 2026「ROI of AI-Assisted Software Development」の J カーブモデル詳細**: 未取得
- **Stack Overflow Developer Survey 2026 の実数値**: 未取得。2025 年版との混同に注意が必要
- **AI 事業者ガイドライン 第1.2版の条文原文**: PDF が 403。HITL 要求の正確な文言・適用条件が未確認
- **ISO/IEC 42001 の該当箇条・附属書 A 管理策の原文**: 有償のため未取得
- **「人間の捕捉率 9〜26%」の原典**: 二次情報のみ。原典特定が必要
- **deskilling 研究の数値（17%、77%）の原典照合**: 各論文本体での確認が未了
- **「3100 Opinions on Code Review in an AI World」（arXiv:2607.07980）の本文**: PDF が機械可読でなく未読。#110 の中核証拠になりうるため優先度が高い
- **レベル移行判定基準を公開している組織の一次事例**: 発見できず。仮に存在しないなら「#109 が先行事例になる」という位置づけを明記すべき
- **日本企業の建前と実運用の乖離に関する一次データ**: 発見できず。PwC・富士経済のレポート本体、または国内 SIer の事例発表を当たる必要がある
- **Given-When-Then の 2026 年時点の位置づけ**: 新規の一次知見なし
- **Microsoft Azure SRE Agent の実績値（1,300 エージェント / 35,000 インシデント）**: Microsoft 公式発表の一次確認が未了

---

## 12. 出典一覧（信頼度別）

### 一次情報（規格・研究機関・ベンダー公式）

- SAE J3016_202104: https://wiki.unece.org/download/attachments/128418539/SAE%20J3016_202104.pdf
- EU AI Act Article 14: https://artificialintelligenceact.eu/article/14/
- ISO/IEC 42001:2023: https://www.iso.org/standard/42001
- AI 事業者ガイドライン 第1.2版（2026-03-31）: https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20260331_1.pdf
- METR Time Horizon 1.1（2026-01-29）: https://metr.org/blog/2026-1-29-time-horizon-1-1/
- METR 時間地平: https://metr.org/time-horizons/
- METR RCT（2025-07-10）: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- METR 実験設計変更（2026-02-24）: https://metr.org/blog/2026-02-24-uplift-update/
- Anthropic「Measuring AI agent autonomy in practice」（2026-02-18）: https://www.anthropic.com/news/measuring-agent-autonomy
- Anthropic「Effective harnesses for long-running agents」（2025-11-26）: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Anthropic「Harness design for long-running application development」: https://www.anthropic.com/engineering/harness-design-long-running-apps
- Claude Opus 4.6 システムカード（2026-02）: https://www-cdn.anthropic.com/14e4fb01875d2a69f646fa5e574dea2b1c0ff7b5.pdf
- DORA 2025 レポート: https://dora.dev/dora-report-2025/
- DORA インサイト（2026-03-10）: https://dora.dev/insights/balancing-ai-tensions/
- DORA AI Capabilities Model（2025-11-25）: https://dora.dev/research/ai/ai-capabilities-model/
- GitHub Octoverse 2025（2025-10-31）: https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/
- Stack Overflow Developer Survey 2025（AI 章）: https://survey.stackoverflow.co/2025/ai
- GitClear「The Maintainability Gap」（2026-01）: https://www.gitclear.com/the_ai_code_quality_maintainability_gap
- OpenTelemetry GenAI 可観測性（2026）: https://opentelemetry.io/blog/2026/genai-observability/
- Sentry × Copilot 連携ドキュメント: https://docs.sentry.io/integrations/coding-agents/copilot/
- microsoft/vscode Issue #261160（EARS 自動生成）: https://github.com/microsoft/vscode/issues/261160

### 査読前論文・学術

- Feng et al.「Levels of Autonomy for AI Agents」（2025-06、arXiv:2506.12469）: https://arxiv.org/html/2506.12469v2
- Knight First Amendment Institute 掲載版: https://knightcolumbia.org/content/levels-of-autonomy-for-ai-agents-1
- METR「Measuring AI Ability to Complete Long Software Tasks」（arXiv:2503.14499）: https://arxiv.org/pdf/2503.14499
- METR RCT 論文（arXiv:2507.09089）: https://arxiv.org/abs/2507.09089
- UTBoost（arXiv:2506.09289）: https://arxiv.org/pdf/2506.09289
- SWE-Bench+（arXiv:2410.06992）: https://arxiv.org/pdf/2410.06992
- SWE-Bench Pro（arXiv:2509.16941）: https://arxiv.org/pdf/2509.16941
- SWE-EVO（arXiv:2512.18470）: https://arxiv.org/pdf/2512.18470
- Spec-Driven Development（arXiv:2602.00180）: https://arxiv.org/pdf/2602.00180
- Runtime-Structured Task Decomposition（arXiv:2605.15425）: https://arxiv.org/pdf/2605.15425
- Single-Agent vs Multi-Agent（arXiv:2604.02460）: https://arxiv.org/pdf/2604.02460
- Dynamic Attentional Context Scoping（arXiv:2604.07911）: https://arxiv.org/pdf/2604.07911
- 自律 SRE エージェント（arXiv:2604.03933）: https://arxiv.org/pdf/2604.03933
- インシデント対応マルチエージェント（arXiv:2511.15755）: https://arxiv.org/pdf/2511.15755
- Human-AI Synergy in Agentic Code Review（arXiv:2603.15911）: https://arxiv.org/pdf/2603.15911
- 3100 Opinions on Code Review in an AI World（arXiv:2607.07980）: https://arxiv.org/pdf/2607.07980
- Green「Flaws of Policies Requiring Human Oversight」（arXiv:2109.05067）: https://arxiv.org/pdf/2109.05067
- On the Quest for Effectiveness in Human Oversight（arXiv:2404.04059）: https://arxiv.org/pdf/2404.04059
- Automation Bias in the AI Act（arXiv:2502.10036）: https://arxiv.org/pdf/2502.10036
- Agents That Teach（arXiv:2607.06101）: https://arxiv.org/html/2607.06101
- Productivity-Reliability Paradox（arXiv:2605.01160）: https://arxiv.org/pdf/2605.01160
- AI, Metacognition, and the Verification Bottleneck（arXiv:2601.17055）: https://arxiv.org/pdf/2601.17055
- Echoes of AI（arXiv:2507.00788）: https://arxiv.org/pdf/2507.00788
- An Endless Stream of AI Slop（arXiv:2603.27249）: https://arxiv.org/html/2603.27249v3
- Designing meaningful human oversight in AI（AI and Ethics, 2026）: https://link.springer.com/article/10.1007/s43681-026-01147-7
- Fink「Human Oversight under Article 14」（SSRN）: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5147196

### 二次情報（実務者ブログ・ベンダー解説。裏取り未了を含む）

- Swarmia「Five levels of AI coding agent autonomy」（2026-03-19）: https://www.swarmia.com/blog/five-levels-ai-agent-autonomy/
- Addy Osmani「The Code Agent Orchestra」: https://addyosmani.com/blog/code-agent-orchestra/
- Augment Code（マルチエージェントワークスペース）: https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace
- Augment Code（自律エンジニアリングループ）: https://www.augmentcode.com/guides/autonomous-engineering-loop
- Thoughtworks（コードレビュー論）: https://www.thoughtworks.com/en-us/insights/blog/testing/code-review-dead-long-live-code-review
- Bryan Finster（AI とコードレビュー）: https://bryanfinster.substack.com/p/ai-broke-your-code-review-heres-how
- MIT SMR（説明性と rubber-stamping）: https://sloanreview.mit.edu/article/ai-explainability-how-to-avoid-rubber-stamping-recommendations/
- Sophos（blast radius 削減）: https://www.sophos.com/en-us/blog/inside-the-lethal-trifecta-blast-radius-reduction-in-ai-agent-deployments
- IT Revolution（DORA チームプロファイル）: https://itrevolution.com/articles/ais-mirror-effect-how-the-2025-dora-report-reveals-your-organizations-true-capabilities/
- Jama Software（EARS）: https://www.jamasoftware.com/requirements-management-guide/writing-requirements/adopting-the-ears-notation-to-improve-requirements-engineering/
- PwC Japan（AI 事業者ガイドライン第1.2版解説）: https://www.pwc.com/jp/ja/knowledge/column/ai-governance/ai-guideline-03.html
- 森・濱田松本法律事務所（同上）: https://www.morihamada.com/ja/insights/newsletters/137701
- Datadog（OTel GenAI 規約対応）: https://www.datadoghq.com/blog/llm-otel-semantic-convention/
- Terminal-Bench 2.0 リーダーボード: https://llm-stats.com/benchmarks/terminal-bench-2
- Terminal-Bench 2.1（Snorkel AI）: https://snorkel.ai/leaderboard/terminal-bench-2-1/
- Stochastic Coder（Azure SRE Agent 自己修復、2026-04-29）: https://stochasticcoder.com/2026/04/29/beyond-the-alert-building-self-healing-pipelines-with-azure-sre-agent-and-github-copilot/
- Confident AI（エージェント評価指標）: https://www.confident-ai.com/blog/llm-agent-evaluation-complete-guide
- Scientific American（スキル劣化）: https://www.scientificamerican.com/article/is-ai-ruining-our-skills-early-results-are-in-and-theyre-not-good/
