# エージェント型開発(自律・マルチエージェント)の現在地 調査メモ

- Issue: #33
- 作成日: 2026-07-10
- 状態: 清書済み → src/content/docs/phase2-aidlc/agentic-development.md

> 本メモの位置づけ: [AIDLC 調査メモ](../phase1/20260710-aidlc.md)が前提とする「AIエージェントが自律的に開発を回す(AI orchestrates the whole process)」の**中身=エージェント型開発の現在地**を整理する。
> 記述は2層に厳密に分ける:
> - **建前(何ができると語られるか)**: 各ツール/フレームワークの公式が主張する能力。
> - **現実(実際の到達点と限界)**: ベンチマーク値・第三者評価・失敗事例・限界論。
> すべての主張に出典 URL を付け、一次情報(各社公式・原典論文・ベンチマーク公式)を最優先する。技術動向調査のため TEMPLATE.md の6+2要素には縛られず、下記の独自構成で書く。

---

## 0. 概要

### 0-1. エージェント型開発とは(定義の整理)

- **コーディングエージェント**: GitHub Issue やプロンプトを入力に、リポジトリの読解・環境構築・コード編集・テスト実行・PR 作成までを、人間の逐次介入なしに自律的に進める LLM ベースのシステム。従来の「補完(Copilot 型)」との差は、**タスク全体を自分で計画し、複数ステップの試行錯誤を回す**点にある。
  - 出典(建前): [OpenAI "Introducing Codex"](https://openai.com/index/introducing-codex/)、[GitHub Blog "Meet the new coding agent"](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)
- **マルチエージェント**: 単一エージェントでは扱いきれない複雑タスクを、役割を分けた複数エージェントの協調(オーケストレーター/ワーカー、ハンドオフ等)で解く構成。
  - 出典(建前): [Anthropic "Building Effective AI Agents"](https://www.anthropic.com/research/building-effective-agents)、[Anthropic "How we built our multi-agent research system"](https://www.anthropic.com/engineering/multi-agent-research-system)
- **Anthropic による重要な区別**: 「**ワークフロー(workflows)**=LLM とツールが事前定義されたコードパスで統制される系」と「**エージェント(agents)=LLM が自らのプロセスとツール使用を動的に制御する系**」。前者は予測可能性・一貫性、後者は柔軟性を得るがコストと不確実性が上がる。**「必要になるまで複雑にするな(まず最も単純な解を探せ)」が公式の推奨**。
  - 出典: [Anthropic "Building Effective AI Agents"](https://www.anthropic.com/research/building-effective-agents)

### 0-2. AIDLC との接続(なぜ本テーマを調べるか)

- AIDLC の中核主張「AI agents orchestrate the whole process, generating plans, code, tests, and infrastructure configurations at each stage(AWS)」は、技術的には次の3能力に依存している:
  1. **長期タスクの自律遂行能力**(計画→実装→自己修正を数百〜数千ステップ回せること)。
  2. **オーケストレーション能力**(タスク分解と複数ワーカーへの委譲・統合)。
  3. **自己検証能力**(生成物をテストで検証し自己修正)。
- 本メモは、この3能力が2026年時点で**どこまで到達し、どこで壁に当たっているか**を一次情報で確定させる。結論を先取りすると、いずれも「単純で明確なタスク」では機能するが、「大規模既存コードベース・長期・曖昧要件」では信頼性が急落する(§4・§5)。

---

## 1. 自律コーディングエージェントの主要実装例

各ツールを「建前(公式の主張)」と「現実(到達点・限界)」に分けて整理する。

### 1-1. Devin(Cognition)

- **建前**: 「世界初の完全自律型 AI ソフトウェアエンジニア(the first fully autonomous AI software engineer)」。GitHub Issue のリンクだけで、環境構築・バグ再現・修正コーディング・テストまで自力で行う。シェル/エディタ/ブラウザをサンドボックス内で操作し、「数千の意思決定を要する複雑なエンジニアリングタスクを計画・実行」できるとする。発表時に SWE-bench で **13.86%** を解決し、当時の SOTA(1.96%)を大きく更新したと主張。
  - 出典: [Cognition "Introducing Devin"](https://www.cognition-labs.com/introducing-devin)、[Cognition "SWE-bench technical report"](https://cognition.ai/blog/swe-bench-technical-report)
- **建前の発展(マルチエージェント化)**: 「Devin can now Manage Devins」で、1つの Devin が複数の Devin を管理・並列化する構成へ。
  - 出典: [Cognition "Devin can now Manage Devins"](https://cognition.ai/blog/devin-can-now-manage-devins)
- **現実(第三者評価)**: Answer.AI が Devin 1.0 を**実タスク20件**で1か月検証した結果、**成功3件/失敗14件/判定不能3件**。失敗の中心は「既存コードベースの理解」で、コンテキスト把握や既存パターンへの整合が必要な場面で破綻。Railway へのデプロイでは「非対応であることを理解できず、1日以上、存在しない機能をハルシネーションしながら無効なアプローチを試行し続けた」。著者結論は「**できるタスクは小さく明確すぎて、自分でやった方が速い**」「Cursor のような**監督型ツールの方が優れる**(人間が制御を保ち逐次誘導できる)」。
  - 出典: [Answer.AI "Thoughts On A Month With Devin"](https://www.answer.ai/posts/2025-01-08-devin)、[The Register(二次)](https://www.theregister.com/2025/01/23/ai_developer_devin_poor_reviews/)

### 1-2. SWE-agent(Princeton NLP)

- **建前/技術的核心**: GitHub Issue を受け取り、任意の LLM(発表時は GPT-4)で自動修正を試みる**学術発の OSS エージェント**。核心は **ACI(Agent-Computer Interface)**=LLM がリポジトリ閲覧・ファイル閲覧/編集/実行をしやすいように設計した「LM 中心のコマンドとフィードバック様式」。この ACI 設計が性能を左右することを示した点が学術的貢献。
- **到達点**: SWE-bench で **12.29%** を解決(発表時 SOTA)、1件あたり約1.5分。NeurIPS 2024 採択。攻撃的サイバーセキュリティや競技プログラミングにも転用可能。
  - 出典: [GitHub SWE-agent/SWE-agent(NeurIPS 2024)](https://github.com/SWE-agent/SWE-agent)、[SWE-agent docs](https://github.com/princeton-nlp/SWE-agent/blob/main/docs/index.md)
- **意義**: 「モデルの賢さ」だけでなく「**エージェントとツールの接面(足場=scaffold/harness)の設計**」が性能を決めるという、以後のエージェント工学の基本認識を確立。

### 1-3. OpenAI Codex / Operator

- **建前**: クラウドベースのソフトウェアエンジニアリングエージェント。**多数のタスクを並列**に処理し、機能実装・コードベースへの質問応答・バグ修正・PR 提案を、各タスク専用のクラウドサンドボックス(リポジトリをプリロード)で実行。初期モデルは **codex-1(OpenAI o3 をソフトウェア工学向けに最適化)**。
  - 出典: [OpenAI "Introducing Codex"](https://openai.com/index/introducing-codex/)
- **タイムライン(公式)**: 2025年5月にリサーチプレビュー → ChatGPT Plus/Pro/Business/Enterprise へ展開 → 2025年9月に **GPT-5-Codex**(GPT-5 のエージェント型コーディング最適化版)。その後 GA 化・エディタ/ターミナル/クラウド横断へ拡張。
  - 出典: [OpenAI "Codex is now generally available"](https://openai.com/index/codex-now-generally-available/)、[OpenAI "Introducing upgrades to Codex"](https://openai.com/index/introducing-upgrades-to-codex/)

### 1-4. GitHub Copilot coding agent

- **建前**: **GitHub Actions で動く環境**で自律稼働。Issue を Copilot に**アサインする**と、計画立案 → ブランチと PR を同時に開く → コード記述 → テスト実行 → レビュー依頼、までを実行。Issue をチェックリストに分解し、完了項目をチェックしながらコミットを push する。
  - 出典: [GitHub Blog "Meet the new coding agent"](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)、[GitHub Docs "About Copilot coding agent"](https://docs.github.com/en/copilot/concepts/coding-agent/about-copilot-coding-agent)
- **注目すべき統制設計**: 「**PR 作成を依頼した開発者は、その PR を承認できない**」。承認レビュー必須のリポジトリでは、**少なくとも1人の独立した開発者が Copilot の成果をレビューする**ことを保証する。→ AIDLC の「human verify/approve」を**プラットフォーム側で強制する**具体実装であり、日本の第三者レビュー文化との親和点(§6・§7)。
  - 出典: [GitHub Blog "Meet the new coding agent"](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

### 1-5. Google Jules

- **建前**: **非同期(asynchronous)コーディングエージェント**。「コパイロットでも補完サイドキックでもなく、コードを読み、意図を理解し、作業に取りかかる自律エージェント」。安全なクラウド VM 上で動き、GitHub 連携、複数ファイル変更・並行タスク、音声チェンジログ等を持つ。Gemini 2.5(後に Gemini 3)を基盤。
  - 出典: [Google "Build with Jules"](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules/)、[Google "Jules now available"](https://blog.google/technology/google-labs/jules-now-available/)
- **タイムライン**: 2024年12月に Google Labs で実験公開 → 2025年に公開ベータ → 2025年9月に一般提供(GA)。CLI 連携(Jules Tools / Gemini CLI 拡張)や API も追加。
  - 出典: [Google Developers Blog "Meet Jules Tools"](https://developers.googleblog.com/en/meet-jules-tools-a-command-line-companion-for-googles-async-coding-agent/)

### 1-6. Claude Code / Claude Agent SDK(Anthropic)

- **建前**: Agent SDK は「ファイル読解・コマンド実行・Web 検索・コード編集を自律的に行う AI エージェント」を構築でき、Claude Code を支えるのと同じツール・エージェントループ・コンテキスト管理を Python/TypeScript で利用可能にする。**サブエージェント(subagents)**=メインエージェントがオーケストレートする専門特化 AI 群で、(a)専用システムプロンプト、(b)**隔離コンテキスト**(情報過多を防ぐ)、(c)**並行実行**、(d)ツールアクセス制限、を持つ。「auto mode」で権限確認をスキップしつつ安全性を保つ長時間自律実行も。
  - 出典: [Anthropic "Building agents with the Claude Agent SDK"](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)、[Claude Docs "Subagents in the SDK"](https://docs.claude.com/en/docs/agent-sdk/subagents)、[Anthropic "Enabling Claude Code to work more autonomously"](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- **接続**: サブエージェント構成は §2 のオーケストレーター/ワーカー・パターンの製品実装であり、AIDLC の「AI がプロセス全体をオーケストレート」の技術的裏付けの1つ。

### 1-7. 一覧(建前 vs 現実の要約)

| ツール | 提供者 | 実行形態 | 建前(主張) | 現実の到達/限界 |
| --- | --- | --- | --- | --- |
| Devin | Cognition | クラウド自律 | 完全自律エンジニア、数千の意思決定 | 既存コードベースで破綻、20件中成功3件(第三者検証) |
| SWE-agent | Princeton NLP | OSS/研究 | ACI で LM を SW エージェント化 | SWE-bench 12.29%、足場設計の重要性を実証 |
| Codex | OpenAI | クラウド並列 | 並列タスク、PR 提案 | GA 化・モデル更新で信頼性向上、なお人間レビュー前提 |
| Copilot coding agent | GitHub | GH Actions | Issue→PR 自律、テスト実行 | 独立レビュー強制で統制、範囲は明確タスク中心 |
| Jules | Google | 非同期クラウド VM | 自律・並行・複数ファイル | GA 済み、テスト作成/バグ修正が主用途 |
| Claude Code/Agent SDK | Anthropic | CLI/SDK | サブエージェント並列、長時間自律 | オーケストレーター/ワーカーの製品実装 |

---

## 2. マルチエージェント・オーケストレーションのパターンとフレームワーク

### 2-1. Anthropic による協調パターンの分類(設計語彙の基準点)

図解の骨格として、Anthropic の分類を基準に置く。ワークフロー(定型)からエージェント(動的)への段階:

- **① Prompt chaining(逐次連鎖)**: タスクを固定的な部分タスク列に分解し、各 LLM 呼び出しが前段の出力を処理。明確に分解できるタスク向け。レイテンシと引き換えに精度を上げる。
- **② Routing(振り分け)**: 入力を分類し専門化された後続へ振り分ける。関心の分離。
- **③ Parallelization(並列化)**: 部分タスクを並列実行し集約(sectioning / voting)。
- **④ Orchestrator-workers(オーケストレーター/ワーカー)**: 中央 LLM が**動的に**タスクを分解しワーカー LLM へ委譲、結果を統合。**部分タスクを事前予測できない複雑タスク向け**。並列化との差は「部分タスクが固定でなくオーケストレーターが入力に応じて決める」柔軟性。
- **⑤ Evaluator-optimizer(評価者/最適化者)**: 一方が生成、他方が評価・フィードバックし反復改善。明確な評価基準があり反復で改善が測れる場合に有効。
  - 出典: [Anthropic "Building Effective AI Agents"](https://www.anthropic.com/research/building-effective-agents)

- **実運用例(オーケストレーター/ワーカーの具体)**: Anthropic の Research 機能は**リードエージェント**がクエリを分析・戦略立案し、**並列で動く専門サブエージェント**を spawn。オーケストレーターは直接ツールを持たず「サブエージェントを spawn する能力だけ」を持ち、各サブエージェントに(目的/出力形式/使用ツール指針/タスク境界)を与える。全体を**リサーチ予算(エージェント数・ツール使用・推論深度)**で制御。
  - 出典: [Anthropic "How we built our multi-agent research system"](https://www.anthropic.com/engineering/multi-agent-research-system)

### 2-2. 主要フレームワーク

| フレームワーク | 提供 | 協調モデル | 特徴 | 状態(重要) |
| --- | --- | --- | --- | --- |
| **AutoGen** | Microsoft Research | 会話(conversable agents)/ group chat | LLM・ツール・人間を自動エージェントチャットで統合する多エージェント会話の抽象化 | **メンテナンスモード**。後継は **Microsoft Agent Framework(MAF)** |
| **CrewAI** | CrewAI(OSS) | ロールプレイ協調 | Agent / Task / Tool / **Crew** を構成要素に、役割・目標・ツールを定義して協働 | 活発 |
| **LangGraph** | LangChain | グラフ(有向)ワークフロー | **ループ・制御可能性・永続メモリ**。状態機械的に多エージェントを記述 | 活発 |
| **MetaGPT** | OSS(論文) | ソフトウェア会社の役割分担 | 人間のワークフロー(**SOP=標準作業手順**)をプロンプト列に符号化し、PM/設計/実装等の役割で協働 | 研究/OSS |
| **OpenAI Swarm → Agents SDK** | OpenAI | **handoff(引き継ぎ)+ routine** | Swarm は教育用軽量実験。**Agents SDK が本番版の後継**。ステートレスで「handoff」を単一プリミティブに、各エージェントが自コンテキストで実行し適任者へ制御移譲 | Swarm は Agents SDK へ移行 |

- 出典: [AutoGen(GitHub)](https://github.com/microsoft/autogen)、[AutoGen(Microsoft Research)](https://www.microsoft.com/en-us/research/project/autogen/)、[MetaGPT(arXiv 2308.00352)](https://arxiv.org/abs/2308.00352)、[LangGraph: Multi-Agent Workflows](https://www.langchain.com/blog/langgraph-multi-agent-workflows)、[OpenAI Agents SDK: Agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/)、[Orchestrating Agents: Routines and Handoffs](https://developers.openai.com/cookbook/examples/orchestrating_agents)、[Agentic AI Frameworks(arXiv 2508.10146)](https://arxiv.org/abs/2508.10146)

- **設計上の対立軸(図解に効く)**: フレームワークは「**コードによる決定的オーケストレーション(LangGraph・handoff)** ↔ **LLM 主導の動的協調(AutoGen group chat・オーケストレーター/ワーカー)**」の軸で整理できる。OpenAI の見解は「コードでオーケストレートする方が速度・コスト・性能が決定的/予測可能」。Anthropic も「まず単純に」。**業界の合流点は『無制限の自律より、制約された協調』**。
  - 出典: [Orchestrating Agents: Routines and Handoffs](https://developers.openai.com/cookbook/examples/orchestrating_agents)、[Anthropic "Building Effective AI Agents"](https://www.anthropic.com/research/building-effective-agents)

- **注意(建前の減速シグナル)**: AutoGen がメンテナンスモードに入り MAF へ再編されたこと、OpenAI が Swarm を「教育用」と位置づけ Agents SDK へ寄せたことは、**2024年の「多エージェントが自動で協働する」熱狂から、2025-26年の「制御可能・本番運用可能な足場」への収束**を示す。

---

## 3. 到達点(定量): ベンチマークと実運用のギャップ

### 3-1. SWE-bench とその派生

- **SWE-bench(原典)**: 「Can Language Models Resolve Real-World GitHub Issues?」(Jimenez, Yang ら, ICLR 2024, arXiv 2310.06770)。12 の人気 Python リポジトリの実 Issue と対応 PR から作った **2,294 問**。コードベース+Issue 記述を与え、モデルがコードを編集して解決。複数ファイル/関数横断・長文脈・実行環境との対話を要する。
  - **発表時(2023末)の最良は Claude 2 で 1.96%**。
  - 出典: [SWE-bench 原典ページ](https://www.swebench.com/original.html)、[arXiv 2310.06770](https://arxiv.org/abs/2310.06770)
- **SWE-bench Verified**: OpenAI と協働し、**問題の明確さ・テストパッチの正しさ・解決可能性**を人手検証した **500 インスタンス**の部分集合。以後、実質的な業界標準の比較軸。
  - 出典: [SWE-bench Verified](https://www.swebench.com/verified.html)

### 3-2. 到達点の推移(SWE-bench Verified、公式発表値)

図解用の推移(いずれも各提供元の主張値):

| 時期 | システム/モデル | ベンチ | 解決率 | 出典 |
| --- | --- | --- | --- | --- |
| 2023末 | Claude 2 | SWE-bench(full) | 1.96% | [原典](https://www.swebench.com/original.html) |
| 2024春 | SWE-agent(GPT-4) | SWE-bench(full) | 12.29% | [SWE-agent](https://github.com/SWE-agent/SWE-agent) |
| 2024春 | Devin | SWE-bench(subset) | 13.86% | [Cognition](https://cognition.ai/blog/swe-bench-technical-report) |
| 2025 | Claude Opus 4 | Verified | 72.5% | [Anthropic](https://www.anthropic.com/news/claude-4) |
| 2025 | Claude Opus 4.1 | Verified | 74.5% | [Anthropic](https://www.anthropic.com/news/claude-opus-4-1) |
| 2025末 | Claude Opus 4.5 | Verified | 80.9% | [Anthropic](https://www.anthropic.com/news/claude-opus-4-5) |
| 2026初 | Claude Opus 4.6 | Verified | 80.84% | [Anthropic](https://www.anthropic.com/claude-opus-4-6-system-card) |

- **観察**: 2年で 1.96% → 80% 超へ。ただし**80%前後で伸びが緩む**兆候(4.5→4.6 でほぼ横ばい)。これは「Verified の残り問題が本質的に難しい/曖昧」ことを示唆。
- **重要な解釈上の留保**: 上位フロンティアのスコアは**汚染(contamination)やテスト設計**の観点から割引いて解釈すべき、という監査上の指摘がある(特に極端に高いスコア同士の比較時)。**公開ベンチのスコア=実務の自動解決率ではない**。
  - 出典: [SWE-bench Verified](https://www.swebench.com/verified.html)(注記)、および §4 の実地評価。
- **注記(信頼性)**: SEO 型リーダーボード集約サイトには実在確認できないモデル名(例: 架空の "Mythos 5" / "Fable 5" 等)を掲げるものがあり、本メモでは採用しない。数値は各提供元公式または SWE-bench 公式のみ採用した。

### 3-3. 「時間地平(time horizon)」という別軸の到達点(METR)

- SWE-bench が「Issue 解決率」なのに対し、METR は「**AI が自律で完了できるタスクの長さ**」で測る。指標は **50%-task-completion time horizon**(人間がその時間かかるタスクを AI が 50% の成功率でこなせる長さ)。
- **中心的発見**: この時間地平は過去約6年で**指数増加し、倍加時間は約7か月**(2024年は約4か月へ加速の可能性)。o3 の 50% 時間地平は**約110分**。外挿すると10年以内に「人間が数日〜数週かかるタスクの多く」を自律遂行、と予測。
  - 出典: [METR "Measuring AI Ability to Complete Long Tasks"](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)、[arXiv 2503.14499](https://arxiv.org/pdf/2503.14499)
- **AIDLC への含意**: AIDLC の「bolt=数時間〜1日」の時間箱は、この時間地平が数時間規模に達しつつある現状と符合する。ただし**50% 成功率**という定義自体が、後述の信頼性問題(§4)を内包する。

---

## 4. 限界と課題(現実の到達点の裏面)

### 4-1. 信頼性: エラーの累積(複利的失敗)

- 長期タスクは各ステップの成功率が高くても、**ステップ数が増えると全体成功率が幾何級数的に低下**する(0.95^n 問題)。エージェント成功率に「半減期」的な性質があるとする研究も。METR の 50% 定義自体、「長いタスクほど成功率が落ちる」ことの裏返し。
  - 出典: [METR "Measuring AI Ability to Complete Long Tasks"](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)、[Is there a half-life for the success rates of AI agents?(arXiv 2505.05115)](https://arxiv.org/pdf/2505.05115)
- Anthropic 自身も、長時間稼働エージェントは足場(harness)・コンテキスト管理の工学がなければ破綻するとし、専用の設計指針を公開。
  - 出典: [Anthropic "Effective harnesses for long-running agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)、[Anthropic "Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### 4-2. 長期タスク・既存コードベースでの一貫性欠如

- Answer.AI の Devin 検証(§1-1)が最も具体的。**新規プロジェクト生成では過剰複雑化(spaghetti code)**、**研究タスクでは核心を外し表層的**、**既存コード分析では「トンネル視野」で誤った前提に固執**。「動くように見えて実は動かない」出力(見かけ倒しの DaisyUI テーマ等)も。
  - 出典: [Answer.AI "Thoughts On A Month With Devin"](https://www.answer.ai/posts/2025-01-08-devin)

### 4-3. ハルシネーション・検証の難しさ

- 存在しない機能を「ある」と捏造し、無効なアプローチを1日以上続ける(Devin の Railway 事例)。エージェントの障害は「**計画の順守失敗**」と「**新情報の捏造(ハルシネーション)**」に大別されデバッグが難しい。
  - 出典: [Answer.AI](https://www.answer.ai/posts/2025-01-08-devin)、[アットマークIT「ハルシネーションか、計画順守失敗か」](https://atmarkit.itmedia.co.jp/ait/articles/2604/27/news057.html)
- **自己検証の循環依存**: 「AI が自らテストで検証・自己修正」は、テスト自体の正しさを誰が保証するかが未解決。評価設計そのものが難所であることを Anthropic も認める。
  - 出典: [Anthropic "Demystifying evals for AI agents"](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

### 4-4. コンテキスト長・コスト

- マルチエージェントは並列で強力な反面、**トークン消費が単一エージェントの数倍〜十数倍**になり得る。Anthropic はリサーチ予算(エージェント数・ツール使用・推論深度)で明示的に制御する必要があると述べる。サブエージェントの隔離コンテキストは「情報過多を防ぐ」ための必須設計。
  - 出典: [Anthropic "How we built our multi-agent research system"](https://www.anthropic.com/engineering/multi-agent-research-system)

### 4-5. セキュリティ

- 自律エージェントが外部ツール・シェル・ブラウザを操作することは、新たな攻撃面(プロンプトインジェクション、権限昇格、意図しない破壊的操作)を生む。GitHub は「PR 作成者は自分の PR を承認不可」で最低限の独立レビューを強制し、Anthropic は auto mode を「安全に権限確認をスキップする」設計として別建てで解説する。
  - 出典: [GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)、[Anthropic "Claude Code auto mode"](https://www.anthropic.com/engineering/claude-code-auto-mode)、[マルチエージェント LLM の安全リスク(arXiv 2605.13851)](https://arxiv.org/pdf/2605.13851)

### 4-6. 「人が管理できる賢さ/速さの上限」との接続

- 上記すべては、AIDLC メモ §7-2 で挙げた「**人間が受動的承認者(rubber stamp)に堕すリスク**」に収束する。生成速度と自律性が上がるほど、人間の検証帯域が律速点になる。GitHub の独立レビュー強制はこの帯域問題への**プラットフォーム側の回答**の一例だが、レビュー対象量そのものは減らない。
  - 出典: [AIDLC 調査メモ §7](../phase1/20260710-aidlc.md)、[GitHub Blog](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/)

---

## 5. AIDLC との接続(依存関係の明示)

- AIDLC の「AI orchestrates the whole process」は、技術的に次へ分解して依存を確認できる:

| AIDLC の主張 | 依存するエージェント技術 | 現在地(§1-4) |
| --- | --- | --- |
| AI が計画を立てる | 長期タスクの計画・分解能力 | 明確タスクで機能。曖昧要件・既存大規模で不安定 |
| AI がプロセス全体をオーケストレート | オーケストレーター/ワーカー、handoff | 製品化済み(Claude サブエージェント等)だがコスト・制御が課題 |
| 各段でコード/テスト/IaC を生成 | コーディングエージェント | SWE-bench Verified 80% だが実務ギャップ大 |
| AI が自己検証・自己修正 | evaluator-optimizer / テスト自動化 | テストの正しさ保証が循環依存 |
| 人間が検証・承認 | Human-in-the-loop 統制 | 帯域律速で形骸化リスク(§4-6) |

- **結論**: AIDLC の理想像は、エージェント技術の「単純明確タスクでの成功」を「ライフサイクル全域の自律」へ**外挿**したものである。外挿の成立は §4 の限界がどこまで解消されるかに依存し、2026年時点では「**足場(harness)・制約された協調・人間の統制**を厚く設計して初めて部分的に成立する」段階。無制約の全自律は未到達。

---

## 6. 日本での受け止め・実導入

- **総論(建前)**: 2026年を「自律型 AI(Agentic AI)元年」と位置づける言説が多く、「指示待ちの従属型から、目標を共有すれば自らプロセスを構築する自律型へ」の移行として語られる。コーディングエージェントは「CLI 型/IDE 組込み型/フルマネージド自律型」で設計思想が異なり、「どの作業をどこまで任せるか」で選ぶべきとされる。
  - 出典(二次): [センターエッジ「2026年、日本市場における AI エージェントの予測」](https://www.centeredge.co.jp/dx_media/blog/ai-agent-2026)、[Uravation「AI コーディングエージェント比較(6製品を実務検証)」](https://uravation.com/media/ai-coding-agents-comparison-2026/)
- **実導入の実態(現実)**:
  - **Human-in-the-loop の常態化**: 多くの企業が重要アクション前に人間の最終承認ステップを設け、完全自律への全面移行には躊躇。**データへの信頼性が最大のボトルネック**とされる。
  - **非機能要件の壁**: フルマネージド自律エージェントは「クラウド利用者が設定できない箇所があり、セキュリティ等の非機能要件を満たせない/複雑エージェントで挙動制限」の懸念。→ 日本の SIer/事業会社の厳格な非機能・セキュリティ要件と衝突しやすい。
  - **セキュリティ/ガバナンス**: 自律的な外部ツール操作が新たなリスクを生み、「自律型セキュリティ」構築を迫られる。
  - 出典(二次): [センターエッジ](https://www.centeredge.co.jp/dx_media/blog/ai-agent-2026)、[JIPDEC「AI エージェントの実用化に向けた論点の整理」](https://www.jipdec.or.jp/library/itreport/20260422jipdecreport.html)
- **注意**: 日本語一次情報は「ツール紹介・比較記事」が中心で、**自律コーディングエージェントを本番導入し決裁・検収・QA 部門とどう折り合ったかの実体験一次事例は依然として乏しい**(§8 追加調査)。

---

## 7. 考察(事実と分離)

- **業界のメタトレンド=「全自律」から「制約された協調」へ**: 2024年の Devin/AutoGen 的な「エージェントが勝手に協働する」熱狂は、2025-26年に「決定的にオーケストレートし、人間が独立レビューし、足場を厚くする」方向へ収束した。AutoGen のメンテナンスモード化、Swarm の教育用格下げ、Anthropic/OpenAI の「まず単純に/コードで統制」推奨がその証左。**Process Compass が描く To は『全自律 AIDLC』ではなく『制約された協調 + 人間統制』であるべき**、という設計示唆。
- **ベンチマークと実務の二重帳簿**: SWE-bench Verified 80% と Devin 3/20(15%)は矛盾しない。前者は「明確に定義された単発 Issue」、後者は「曖昧・既存コード・長期」。**Process Compass の図解では、この2軸(タスクの明確さ × 期間/規模)で『エージェントが効く領域』のヒートマップを描く**と、AIDLC の適用可能範囲を誠実に示せる。
- **日本文脈での効きどころ**: GitHub の「自分の PR を承認できない」設計は、日本の第三者レビュー(品質保証部門・独立検証)文化と**構造的に整合**する。AIDLC の Mob(同席レビュー)より、むしろ**プラットフォームによる独立レビュー強制**の方が日本の統制文化に載せやすい可能性がある。ここはフェーズ3の写像設計の有力な足場。
- **最大の律速は依然「人間の検証帯域」**: エージェントの生成速度・自律時間地平は伸び続ける(METR 7か月倍加)が、人間の承認能力は伸びない。理想像の脆弱点はモデル性能でなく**組織の検証キャパシティ設計**にある。

---

## 8. 埋められなかった観点(追加調査項目)

- **SWE-bench Verified の2026年最新 SOTA の一次確定**: 本メモは Anthropic 公式値(〜80.9%)まで。OpenAI/Google の最新モデルの Verified 公式値、および複数エージェント足場(scaffold)込みの最高値の一次出典が未取得。
- **実務での自動解決率の一次データ**: 公開ベンチでなく、実企業リポジトリでのエージェント PR マージ率・手戻り率の一次統計(各社の内部指標公表があれば)。
- **マルチエージェントのコスト定量**: 単一 vs マルチのトークン/コスト比の公式ベンチ値(Anthropic は「数倍」と定性的にのみ言及)。
- **日本企業の本番導入一次事例**: 自律コーディングエージェント導入と、稟議・検収・QA 部門・瑕疵担保責任との衝突を語る一次レポート(現状は紹介記事中心)。
- **セキュリティインシデントの実例**: 自律エージェント起因の実障害・インシデントの一次事例(プロンプトインジェクション等)。
- **AIDLC 実装(awslabs/aidlc-workflows)がどのエージェント/協調パターンを前提にしているか**: リポジトリのステアリングルールとオーケストレーション想定の突き合わせ(#28 と分担)。

---

## 9. 出典一覧

### 一次情報(各社公式・原典論文・ベンチマーク公式)

- [Cognition "Introducing Devin"](https://www.cognition-labs.com/introducing-devin) / [SWE-bench technical report](https://cognition.ai/blog/swe-bench-technical-report) / [Devin can now Manage Devins](https://cognition.ai/blog/devin-can-now-manage-devins)
- [SWE-agent(GitHub, NeurIPS 2024)](https://github.com/SWE-agent/SWE-agent)
- [OpenAI "Introducing Codex"](https://openai.com/index/introducing-codex/) / [Codex is now generally available](https://openai.com/index/codex-now-generally-available/)
- [GitHub Blog "Meet the new coding agent"](https://github.blog/news-insights/product-news/github-copilot-meet-the-new-coding-agent/) / [GitHub Docs "About Copilot coding agent"](https://docs.github.com/en/copilot/concepts/coding-agent/about-copilot-coding-agent)
- [Google "Build with Jules"](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules/) / [Jules now available](https://blog.google/technology/google-labs/jules-now-available/)
- [Anthropic "Building agents with the Claude Agent SDK"](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) / [Subagents in the SDK](https://docs.claude.com/en/docs/agent-sdk/subagents) / [Enabling Claude Code to work more autonomously](https://www.anthropic.com/news/enabling-claude-code-to-work-more-autonomously)
- [Anthropic "Building Effective AI Agents"](https://www.anthropic.com/research/building-effective-agents) / [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) / [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) / [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [AutoGen(GitHub)](https://github.com/microsoft/autogen) / [AutoGen(Microsoft Research)](https://www.microsoft.com/en-us/research/project/autogen/)
- [MetaGPT(arXiv 2308.00352)](https://arxiv.org/abs/2308.00352) / [LangGraph: Multi-Agent Workflows](https://www.langchain.com/blog/langgraph-multi-agent-workflows) / [OpenAI Agents SDK: Agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/) / [Orchestrating Agents: Routines and Handoffs](https://developers.openai.com/cookbook/examples/orchestrating_agents)
- [SWE-bench 原典](https://www.swebench.com/original.html) / [arXiv 2310.06770](https://arxiv.org/abs/2310.06770) / [SWE-bench Verified](https://www.swebench.com/verified.html)
- Anthropic モデル発表(SWE-bench Verified 値): [Claude 4](https://www.anthropic.com/news/claude-4) / [Opus 4.1](https://www.anthropic.com/news/claude-opus-4-1) / [Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) / [Opus 4.6 System Card](https://www.anthropic.com/claude-opus-4-6-system-card)
- [METR "Measuring AI Ability to Complete Long Tasks"](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) / [arXiv 2503.14499](https://arxiv.org/pdf/2503.14499)

### 二次情報(第三者評価・調査・日本文脈)

- [Answer.AI "Thoughts On A Month With Devin"](https://www.answer.ai/posts/2025-01-08-devin) / [The Register(報道)](https://www.theregister.com/2025/01/23/ai_developer_devin_poor_reviews/)
- [Agentic AI Frameworks(arXiv 2508.10146)](https://arxiv.org/abs/2508.10146) / [Is there a half-life for the success rates of AI agents?(arXiv 2505.05115)](https://arxiv.org/pdf/2505.05115) / [マルチエージェント LLM の安全リスク(arXiv 2605.13851)](https://arxiv.org/pdf/2605.13851)
- [アットマークIT「ハルシネーションか、計画順守失敗か」](https://atmarkit.itmedia.co.jp/ait/articles/2604/27/news057.html)
- [センターエッジ「2026年、日本市場における AI エージェントの予測」](https://www.centeredge.co.jp/dx_media/blog/ai-agent-2026) / [Uravation「AI コーディングエージェント比較」](https://uravation.com/media/ai-coding-agents-comparison-2026/) / [JIPDEC「AI エージェントの実用化に向けた論点の整理」](https://www.jipdec.or.jp/library/itreport/20260422jipdecreport.html)
