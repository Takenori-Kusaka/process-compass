# コンテキストエンジニアリング手法 調査メモ

- Issue: #35
- 作成日: 2026-07-10
- 状態: 下書き(phase2 = 理想像 To の調査)。清書先未定
- フェーズ: フェーズ2(理想像 To)。本プロジェクトの中核論点に直結

> 位置づけ: フェーズ1の[日本ガバナンス調査](../phase1/20260710-jp-governance.md) §7・§9 で特定した「**明文化の壁**」——人のハイコンテキストな暗黙知をどうやって生成AIに渡すか——への技術的回答が、コンテキストエンジニアリングである。本メモはその手法体系を一次情報で整理し、暗黙知の形式知化という観点(SECI/ポランニー)と接続し、原理的限界まで押さえる。
> すべての主張に出典 URL を付ける。一次情報(Anthropic 公式・各プロトコル公式・原典論文・知識経営論の原典)を最優先。事実と解釈(考察)は明確に分ける。
> 清書時に図解しやすいよう、「コンテキストの層」「暗黙知→形式知の流れ」を構造として整理する。

## 0. このメモの全体像

- コンテキストエンジニアリング(以下 CE)= 生成AIエージェントに与える**文脈全体**を設計・管理する工学。単発の指示文を練るプロンプトエンジニアリング(以下 PE)の上位概念。
- 本メモの構成:
  - §1 定義(CE とは何か / PE との違い)
  - §2 主要手法(7 系統)を「コンテキストの層」として整理
  - §3 暗黙知の形式知化(SECI / ポランニー)との接続
  - §4 限界(context window / context rot / ポランニーの逆説)
  - §5 本プロジェクトへの含意(明文化の壁を越える技術的手段とそのコスト)
  - §6 考察 / §7 追加調査項目 / §8 出典一覧
- 図解の核(清書時): (a) コンテキストの同心円/層図、(b) 暗黙知→形式知の変換フロー(SECI と CE 手法の対応)、(c) context rot の性能勾配グラフ、(d) 明文化の壁を越えるコスト・限界の対応表。

## 1. 定義:コンテキストエンジニアリングとは何か

### 1.1 一次定義(Anthropic)

- Anthropic は CE を「推論中(LLM inference)の**最適なトークン集合(情報)を厳選・維持する戦略群**」と定義する([Anthropic「Effective context engineering for AI agents」2025-09-29](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 中心的な問い: 「**どのようなコンテキストの構成が、モデルの望ましい挙動を最も高い確率で生むか**(What configuration of context is most likely to generate our model's desired behavior?)」([同上](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- ここでの「コンテキスト」= LLM がサンプリング時に参照するトークン集合の総体。システム指示・ツール定義・MCP・外部データ・メッセージ履歴など、プロンプト以外に紛れ込むあらゆる情報を含む([同上](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。

### 1.2 プロンプトエンジニアリングとの違い(建前上の切り分け)

- **PE**: LLM への指示を最適な結果が出るように書く・整理する技法。多くは単発・自己完結的なやり取りで、「どう言い回せば有用な出力が返るか」を扱う([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)、[Redis「Context engineering vs prompt engineering」](https://redis.io/blog/context-engineering-vs-prompt-engineering/))。
- **CE**: 推論の各ステップでコンテキストウィンドウを満たす**すべての情報を統制**する。Anthropic は CE を「PE の自然な発展形(the natural progression of prompt engineering)」と位置づける([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 包含関係: 「**PE は CE の一構成要素**であり、逆ではない。CE はプロンプトが働く"容れ物"を作る」([MindStudio](https://www.mindstudio.ai/blog/what-is-context-engineering-vs-prompt-engineering-3))。
- なぜエージェントで CE が必須になるか: エージェントは複数ターンで動作し、コンテキストを**使うだけでなく、ツール出力・中間計画・保存メモリを通じて自ら生成・改変する**。単発プロンプト最適化から「コンテキスト状態の管理」へ問題がシフトする([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 本プロジェクトとの接続(先取り): PE は「1回の指示文をうまく書く」= 属人的・その場限り。CE は「文脈を永続的に設計・管理する」= **組織の暗黙知を持続的に AI へ供給する基盤**。フェーズ1の「明文化の壁」に対しては、単発の PE ではなく CE の永続化手法(§2.4)が本命の回答になる。

## 2. 主要手法:コンテキストの層としての整理

> 図解方針: 以下 7 系統を「モデルに近い内側 → 外部から動的に引く外側」の同心円/層として描くと未経験者に伝わる。内側=常駐(システムプロンプト/ルール)、中間=呼び出し(ツール/MCP/RAG)、外側=蓄積・分離(メモリ/サブエージェント)。

### 2.1 システムプロンプト・指示の設計

- Anthropic は「ゴルディロックス・ゾーン(ちょうどよい高さ)」を推奨。二つの失敗モードの中間を狙う([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)):
  - 過度に具体的: 複雑で脆い if-else ロジックをプロンプトに硬コーディング → 保守性が崩れる。
  - 過度に抽象的: 曖昧な高レベル指針・偽りの文脈共有 → 信号が不足する。
  - 最適: 「行動を効果的に誘導するほど具体的、かつ柔軟な発見的方法(heuristics)を残す」高さ。
- 実装指針: `<background_information>` `<instructions>` などのセクション分割、XML タグ/Markdown 見出しで構造化。**最小限のプロンプトから始め、失敗モードに基づいて反復追加**する([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。

### 2.2 Few-shot 例示(手本による誘導)

- エッジケースの網羅列挙は非推奨。代わりに「期待する挙動を効果的に描く**多様で正規的(canonical)な例**」を厳選する([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- Anthropic の位置づけ: 「例は LLM にとって"千の言葉に値する図"」([同上](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。暗黙知の伝達(後述 SECI の共同化=模倣)に近い性格を持つ。

### 2.3 RAG(検索拡張生成)による外部知識の注入

- 原典: Lewis et al. 「Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks」NeurIPS 2020(vol.33, pp.9459–9474)。事前学習済み seq2seq モデルを Wikipedia の密ベクトルインデックスと結合し、**パラメトリック知識(重み)と非パラメトリック知識(外部データ)の二つの記憶**を組み合わせる枠組みを提示([Lewis et al. 2020 / arXiv:2005.11401](https://arxiv.org/abs/2005.11401))。
- 解決する課題: モデル単体は学習データ外の最新・固有情報にアクセスできない。RAG はモデルを肥大化させずに外部知識を注入し、知識集約タスクで当時の SOTA を達成([Lewis et al. 2020](https://arxiv.org/abs/2005.11401))。
- CE 上の役割: 組織固有の文書(規程・設計標準・過去案件)を**モデルを再学習せずに文脈へ供給**する主要手段。暗黙知の形式知化(文書化)を前提に、その形式知を検索して差し込む。
- 補足(下記 2.6 との対比): Anthropic は「事前計算した埋め込みで全データを前処理する」古典 RAG より、実行時に必要分だけ引く "just-in-time" を推奨する立場を示す([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。両者はハイブリッドで使うのが実務。

### 2.4 ステアリングファイル / ルール(プロジェクト文脈の永続化)

> 本プロジェクトの「明文化の壁」に最も直接効く層。組織の暗黙知を**リポジトリに常駐する形式知**として置く手法。

- **CLAUDE.md**: プロジェクト直下の Markdown。セッション開始時にコンテキストへ読み込まれ、セッション中ずっと常駐する「**永続的なシステムプロンプト**」として機能する([Anthropic「Using CLAUDE.md files」](https://claude.com/blog/using-claude-md-files))。自動メモリ機能が有効だと、エージェントがセッション中に学んだことを CLAUDE.md へ書き戻し、知識ベースを蓄積できる([同上](https://claude.com/blog/using-claude-md-files))。
- **AGENTS.md**: コーディングエージェント向けの「エージェント用 README」。標準 Markdown で、ビルド手順・テスト・規約など README には煩雑だがエージェントに必要な文脈を置く([agents.md 公式](https://agents.md/)、[GitHub agentsmd/agents.md](https://github.com/agentsmd/agents.md))。2025-08 に OpenAI 主導(Google・Cursor・Factory 参加)でオープン仕様として策定。2025-12 時点で 6 万超の OSS が採用、20 以上のツールが対応し、Linux Foundation 傘下 Agentic AI Foundation が運営([agents.md 公式](https://agents.md/))。
- **ルール(rules)/スコープ**: Claude Code は 7 つの指示手段(CLAUDE.md・rules・skills・subagents・hooks・output styles・システムプロンプト追記)を持ち、各手段は「コンテキストコスト」と「権威(強制力)」をトレードオフする([Anthropic「Steering Claude Code」](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more))。
  - スコープ付きルール(例: `src/api/**` にのみ適用)は無関係な作業中は文脈から外れる。スコープなしルールは「常時ロード・常時トークン消費」で機構的に CLAUDE.md へ書くのと同一([同上](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more))。
- 設計規律(重要): 「600 行の CLAUDE.md は 600 個の指針を与えるのではなく、モデルが一部だけを選択的に注目し、**最も大事なルールを無視しうるファイル**を与える。規律は網羅性ではなく**容赦ない優先順位付け**である」([Anthropic「Steering Claude Code」](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more))。→ §4 の context rot と直結。
- 良い構造の型: WHAT(技術スタック・構成・主要ディレクトリ)/ WHY(目的・各要素の役割・コードから自明でない判断)/ HOW(コマンド・ワークフロー・例外)([Anthropic](https://claude.com/blog/using-claude-md-files))。

### 2.5 MCP(Model Context Protocol)によるツール・データ接続

- 定義: Anthropic が 2024-11 に公開したオープン標準。LLM アプリと外部データ・ツールを**安全な双方向接続**で繋ぐためのプロトコル。断片化した個別統合を単一の標準に置き換える([Anthropic「Introducing the Model Context Protocol」](https://www.anthropic.com/news/model-context-protocol)、[modelcontextprotocol.io 仕様](https://modelcontextprotocol.io/specification/2025-11-25))。
- 3 つのコアプリミティブ: **Tools(実行できる関数)/ Resources(読めるデータ)/ Prompts(定型プロンプト)**([modelcontextprotocol.io](https://modelcontextprotocol.io/specification/2025-11-25))。開発者は自社データを MCP サーバとして公開するか、MCP クライアント(AI アプリ)を作ってサーバに接続する。
- 普及: 公開後 OpenAI・Google DeepMind など主要各社が採用([Wikipedia「Model Context Protocol」](https://en.wikipedia.org/wiki/Model_Context_Protocol))。
- CE 上の役割: RAG が「知識(データ)」の注入なら、MCP は「**ツールとデータソースへの接続規格**」。組織の基幹システム・チケット・ドキュメントを標準化された口でエージェントに開く = 暗黙知が宿る"生きたシステム"への動的アクセス手段。

### 2.6 コンテキストの圧縮・要約・選択(ウィンドウ管理)

- 長期タスク向けの三手法(Anthropic)([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)):
  - **Compaction(圧縮)**: ウィンドウ限界に近づいた会話を要約し、新ウィンドウで再開。例では「アーキテクチャ決定・未解決バグ・実装詳細は保持し、冗長なツール出力は破棄」して性能低下を最小化。
  - **Structured note-taking(構造化メモ=メモリ)**: コンテキスト外に構造化メモを定期的に書き出す(→ §2.7 と一体)。
  - **Sub-agent architectures(サブエージェント)**: → §2.8。
- Just-in-time context(必要時ロード): 全データを事前投入せず、軽量な識別子(ファイルパス・クエリ・URL)だけ保持し、実行時にツールで動的にロードする。ファイルシステムのメタデータ(階層・命名規則・タイムスタンプ)自体が重要な信号として働き、「段階的開示(progressive disclosure)」でエージェントが層ごとに理解を構築する([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- ハイブリッド(Claude Code の例): CLAUDE.md は前処理で投入し、`glob`/`grep` で just-in-time にファイルを探す。これにより陳腐化したインデックスや複雑な構文木の問題を回避([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。

### 2.7 メモリ(短期/長期、エージェントメモリ)

- 短期(ワーキング)メモリ: エージェントがその場で保持する一時文脈 = 直近の対話履歴/コンテキストウィンドウ。人間のワーキングメモリと同様、即アクセス可だが**容量はトークン長で制限**される([Towards Data Science「A Practical Guide to Memory for Autonomous LLM Agents」](https://towardsdatascience.com/a-practical-guide-to-memory-for-autonomous-llm-agents/))。
- 長期メモリの分類(認知科学の借用):
  - **意味記憶(semantic)**: エージェントの世界知識・環境理解(事実)。
  - **手続き記憶(procedural)**: ルール・手順。LLM の重みに暗黙的に宿るか、ガイドラインとして明示的に定義される。
  - **エピソード記憶(episodic)**: タスク固有の経験・過去のやり取り([Towards Data Science](https://towardsdatascience.com/a-practical-guide-to-memory-for-autonomous-llm-agents/))。
- 代表実装 **MemGPT(2023)**: OS のページングに着想を得て、コンテキストへメモリを出し入れ(swap)する。意味・エピソード・手続きの各記憶を扱う([MemGPT / arXiv:2310.08560](https://arxiv.org/abs/2310.08560))。
- メモリ管理の中核機能: 生成・保存・検索・統合・更新・**削除(忘却)**([Towards Data Science](https://towardsdatascience.com/a-practical-guide-to-memory-for-autonomous-llm-agents/))。忘却=能動的な context 選択であり、context rot(§4)対策でもある。
- CE 上の役割: メモリは「エージェントが自ら書き足す形式知」。人間が書く CLAUDE.md(2.4)が**トップダウンの明文化**なら、エージェントメモリは**ボトムアップの経験蓄積**(= SECI の内面化→再表出化に近い)。

### 2.8 サブエージェントへのコンテキスト分離

- 設計: 単一エージェントではなく専門化したサブエージェントが協調。各サブエージェントは深い技術作業に数万トークンを費やすが、親には **1,000〜2,000 トークンの要約だけを返す**([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 効果: 詳細な探索文脈をサブエージェント内に隔離し、リード(親)エージェントは高レベルな統合に専念できる。汚染・膨張を局所化する context 分離手法([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 本メモ自体がこの構造の実例(調査サブエージェントが一次情報を集約し要約を親へ返す)。

## 3. 暗黙知の形式知化という観点(SECI / ポランニー)

> フェーズ1「明文化の壁」への理論的接続点。CE の各手法を知識経営論の座標に置く。

### 3.1 ポランニー:暗黙知の原典

- マイケル・ポランニー『個人的知識(Personal Knowledge)』(1958)・『暗黙知の次元(The Tacit Dimension)』(1966)で「暗黙知(tacit knowing)」を提示。中心命題は「**我々は語れる以上のことを知っている(We can know more than we can tell)**」([Wikipedia「Tacit knowledge」](https://en.wikipedia.org/wiki/Tacit_knowledge)、[Wikipedia「Polanyi's paradox」](https://en.wikipedia.org/wiki/Polanyi%27s_paradox))。
- 主張の二層: (1) 言語で十分に articulate できない知識が存在する、(2) **すべての知識は暗黙知に根ざす**([Wikipedia「Tacit knowledge」](https://en.wikipedia.org/wiki/Tacit_knowledge))。
- 例: 「人の顔を数百万の中から見分けられるが、どう見分けているかは語れない」([Wikipedia「Tacit knowledge」](https://en.wikipedia.org/wiki/Tacit_knowledge))。→ この「言語化不能な残余」が §4 の原理的限界の根拠。

### 3.2 野中の SECI モデル:暗黙知⇄形式知の変換サイクル

- 野中郁次郎が 1990 年に提示(のち竹内弘高と発展)。ポランニーの暗黙知概念に強く影響を受け、暗黙知と形式知の相互変換で組織的知識創造を説明する([SECIモデル Wikipedia](https://ja.wikipedia.org/wiki/SECI%E3%83%A2%E3%83%87%E3%83%AB)、[GLOBIS 学び放題](https://globis.jp/article/dic_55lu8__iqv/))。
- 4 プロセス([SECIモデル Wikipedia](https://ja.wikipedia.org/wiki/SECI%E3%83%A2%E3%83%87%E3%83%AB)):
  - **共同化(Socialization)**: 暗黙知→暗黙知。経験共有・観察・模倣・対話(徒弟制・OJT)。
  - **表出化(Externalization)**: 暗黙知→**形式知**。メタファー・アナロジー・概念・仮説・モデルで暗黙知を明示的コンセプトに変換。**明文化の壁の核心プロセス**。
  - **連結化(Combination)**: 形式知→形式知。文書・会議・ネットワークで既存形式知を組み合わせ新形式知を創る。
  - **内面化(Internalization)**: 形式知→暗黙知。マニュアル学習・訓練で個人の身体知に落とす。
- 暗黙知=経験・勘・直感など言葉にしにくい知識、形式知=文章・データなど形にできる知識([GLOBIS](https://globis.jp/article/dic_55lu8__iqv/))。

### 3.3 CE 手法と SECI プロセスの対応(本メモの統合。→ 考察扱い)

- 以下は一次文献の直接主張ではなく、本メモによる **CE 手法と SECI の対応づけ(解釈)**:
  - 表出化(暗黙知→形式知) ≒ 人が CLAUDE.md/AGENTS.md/ルール(2.4)・few-shot 例(2.2)を書く行為。組織の勘所を明示テキストへ落とす。
  - 連結化(形式知→形式知) ≒ RAG(2.3)・MCP(2.5)で既存の形式知(文書・システム)を検索・結合してモデルへ供給。
  - 内面化(形式知→暗黙知) ≒ ファインチューニング/モデル重みへの取り込み(本メモは CE の範囲外として扱うが対応物)。エージェント側ではメモリへの経験蓄積(2.7)。
  - 共同化(暗黙知→暗黙知) ≒ 原理的に AI へ最も渡しにくい。few-shot の「手本を見せる」がわずかに近いが、言語化を経ない身体知の共有は AI では未達(→ §4)。
- 含意: CE が確実に扱えるのは **表出化以降(形式知になった後)**。SECI の起点である「共同化」と、表出化の"変換行為そのもの"(暗黙知を言葉にする作業)は依然として人間の仕事。CE は「表出化された形式知を効率よく AI に届ける配管」であり、表出化を自動で肩代わりはしない。

## 4. 限界

### 4.1 コンテキストウィンドウの有限性

- 短期メモリ=ウィンドウはトークン長で物理的に上限がある([Towards Data Science](https://towardsdatascience.com/a-practical-guide-to-memory-for-autonomous-llm-agents/))。ゆえに §2.6-2.8(圧縮・メモリ・分離)が必要になる。

### 4.2 Context Rot(長い文脈での劣化)

- 定義: コンテキスト内のトークン数が増えるほど、その情報を正確に想起する能力が下がる現象。Chroma の研究で確認([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 原因(Anthropic の説明):
  - トランスフォーマー構造: n トークンに n² のペア関係が生じ、長くなるほど注意機構が関係を捉えきれない。
  - 学習分布: 短いシーケンスでの学習が多く、長距離依存に対応する専門的パラメータが不足。
- 帰結: 「硬い崖」ではなく**段階的な性能勾配**として現れ、長文ほど検索・長距離推論の精度が落ちる([Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))。
- 実務含意: 「全部入れれば安心」は誤り。§2.4 の「容赦ない優先順位付け」「トークンは有限資源」という規律の技術的根拠がこれ([Anthropic「Steering Claude Code」](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more))。

### 4.3 ポランニーの逆説(原理的・言語化不能の限界)

- 「語れる以上を知っている」ため、暗黙知には**そもそも言語化(=表出化)できない残余**が原理的に残る([Wikipedia「Polanyi's paradox」](https://en.wikipedia.org/wiki/Polanyi%27s_paradox))。
- CE はテキスト(形式知)を運ぶ技術であるから、言語化されない暗黙知はどんなに配管を整えても AI へ渡らない。これは工学的改善では突破できない**理論上の天井**。
- フェーズ1との整合: ハイコンテキスト文化の「空気・忖度・以心伝心」([phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md) §7)の一部は、この言語化不能領域に属する。CE で埋められるのは「書けば書けるが今まで書いてこなかった暗黙の前提」までで、「書こうにも書けない身体知」は残る。

### 4.4 明文化コスト(組織的コスト)

- CE が要求する形式知(CLAUDE.md・ルール・RAG 用文書)は誰かが書かねばならない。優先順位付けの規律([Anthropic](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more))も継続的な保守コストになる。これは技術的限界ではなく**運用コストとしての限界**(→ §5)。

## 5. 本プロジェクトへの含意

> フェーズ1「明文化の壁」に対する技術的回答の輪郭と、その適用範囲・限界。

- **CE は明文化の壁を越える主要な技術的手段である(ただし部分的)**:
  - 越えられる部分: 「書けば書けるのに、ハイコンテキスト文化ゆえ書いてこなかった暗黙の前提」(要件の勘所・レビュー基準・設計判断の理由)。これを CLAUDE.md/ルール(表出化)+ RAG/MCP(連結化)で AI に持続的に供給できる。
  - 越えられない部分: ポランニーの逆説に属する言語化不能な身体知・共同化領域(§4.3)。
- **手段の使い分け(図解用の対応)**:
  - トップダウンの明文化 = ステアリングファイル/ルール(2.4)。組織が「これは守れ」を書き下す層。
  - 既存資産の接続 = RAG(2.3)+ MCP(2.5)。規程・設計標準・基幹システムを再学習なしに繋ぐ層。
  - 経験の蓄積 = メモリ(2.7)。運用の中で AI 自身が学びを書き戻す層。
  - 規模への対処 = 圧縮/分離(2.6/2.8)。壁を越えた後の"量"の問題への対処。
- **コスト面の含意(フェーズ1 §9 との接続)**:
  - CE は「暗黙知の外部化(表出化)を人間が行うこと」を前提とする。日本企業では従来"書かずに済ませてきた"ため、この表出化コストが新規発生する。これはフェーズ1で指摘した「AI 利用のための追加コスト = 暗黙知の形式知化」そのもの([phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md) §7.3・§9-1)。
  - 責任主体の問題(フェーズ1 §9-2): CLAUDE.md/ルールを「誰が書き、誰が保守し、誰が正しさを保証するか」は、責任分散文化では宙に浮きやすい。CE の永続ファイルは**単一の責任主体(オーナー)を必要とする**点で、稟議的責任分散と再度衝突しうる(→ 本プロジェクトの提案余地)。
- **プロセス提案ツールへの落とし込み(構想)**: 事業フェーズ/チーム体制に応じて「どの CE 層をどの粒度で整備すべきか」を推奨する形にできる。例: 小規模初期は CLAUDE.md 中心、規模拡大で RAG/MCP・サブエージェント分離を追加、という段階設計。

## 6. 考察(事実と分離)

- **CE の本質は「注意の配分の設計」**: context rot(§4.2)が示すのは、LLM の弱点が知識量ではなく"有限な注意をどこに向けるか"にある点。CE は知識を足す技術というより、**引き算(選択・圧縮・分離・忘却)の技術**として理解すると一貫する。CLAUDE.md の「容赦ない優先順位付け」もメモリの「忘却」もサブエージェント分離も、すべて引き算である。
- **CE と SECI の噛み合わせ**: CE が強いのは表出化以降(形式知の流通)。SECI の駆動源である共同化(身体知の共有)と、表出化の"変換労働"そのものは人間に残る。つまり CE は知識創造サイクルを**代替せず加速する**——形式知になった瞬間からの伝播速度を上げるが、暗黙知を形式知に変える最初の一歩は人が踏む。この切り分けは本プロジェクトの提案の芯になりうる。
- **日本文脈での逆説**: ハイコンテキスト文化は「表出化を怠っても回る」ように最適化された組織である。CE の導入は、その組織に「表出化を強制する外圧」として働く。これは負担であると同時に、暗黙知の棚卸し・属人性の解消という副次効果をもたらしうる(建前=AI 活用、実効=ナレッジマネジメントの強制執行)。
- 上記はいずれも一次文献の直接主張ではなく、本メモによる統合的解釈。

## 7. 埋められなかった観点(追加調査項目)

- **一次論文の原文精読**: Lewis et al. 2020(RAG)/ MemGPT(arXiv:2310.08560)を要旨・二次紹介で確認。原論文本文の主張・限界の直接引用は未取得。
- **ポランニー原典の精読**: 『暗黙知の次元』本文を Wikipedia 経由で確認。原著の articulation 論の詳細・野中による解釈のズレ(SECI がポランニーを"操作的に単純化した"という批判の系譜)は未確認。
- **野中の英語原典**: Nonaka & Takeuchi "The Knowledge-Creating Company"(1995)原典・"ba(場)"論文の一次確認が未了(日本語 Wikipedia は「場」に明確な言及なし)。表出化と CE の対応は本メモの解釈にとどまる。
- **context rot の一次研究**: Chroma の原レポート URL を未特定(Anthropic 記事の二次言及に依拠)。定量データ(トークン長×想起精度の曲線)の一次取得が必要。
- **MCP 仕様の技術詳細**: primitives(tools/resources/prompts)の粒度で確認。トランスポート・認可・セキュリティ(prompt injection 経路)の仕様精読は未了。エンタープライズ導入時のガバナンス論点として要追調。
- **RAG の失敗様式**: 検索ミス・幻覚・古い文書の混入など RAG 固有の限界の一次整理が未着手(§4 は主に context 側の限界に寄っている)。
- **ファインチューニング/継続事前学習との境界**: 「内面化(形式知→暗黙知/重み)」の対応物を CE 範囲外として除外したが、CE とファインチューニングの使い分け基準は本プロジェクトで別途要整理。
- **日本企業での CE 実践事例**: 実際に CLAUDE.md/RAG で社内暗黙知を形式知化した国内事例・効果測定は未取得(フェーズ2 後半の実証パートで補完すべき穴)。

## 8. 出典一覧

### 一次情報(公式・原典)

- [Anthropic「Effective context engineering for AI agents」(2025-09-29)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — CE の定義、context rot、システムプロンプト設計、compaction/note-taking/sub-agent、just-in-time context
- [Anthropic「Introducing the Model Context Protocol」(2024-11)](https://www.anthropic.com/news/model-context-protocol) / [modelcontextprotocol.io 仕様(2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25) — MCP の定義・3 プリミティブ
- [Anthropic「Using CLAUDE.md files」](https://claude.com/blog/using-claude-md-files) / [Anthropic「Steering Claude Code」](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more) — CLAUDE.md/ルール/7 手段/優先順位付けの規律
- [agents.md 公式](https://agents.md/) / [GitHub agentsmd/agents.md](https://github.com/agentsmd/agents.md) — AGENTS.md オープン仕様・採用状況
- [Lewis et al.「Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks」NeurIPS 2020 / arXiv:2005.11401](https://arxiv.org/abs/2005.11401) — RAG 原典
- [MemGPT / arXiv:2310.08560](https://arxiv.org/abs/2310.08560) — エージェントメモリのページング実装
- [SECIモデル Wikipedia](https://ja.wikipedia.org/wiki/SECI%E3%83%A2%E3%83%87%E3%83%AB) — 野中の 4 プロセス(共同化/表出化/連結化/内面化)
- [Wikipedia「Tacit knowledge」](https://en.wikipedia.org/wiki/Tacit_knowledge) / [Wikipedia「Polanyi's paradox」](https://en.wikipedia.org/wiki/Polanyi%27s_paradox) — ポランニー『個人的知識』(1958)・『暗黙知の次元』(1966)、「語れる以上を知る」
- [Wikipedia「Model Context Protocol」](https://en.wikipedia.org/wiki/Model_Context_Protocol) — MCP 各社採用状況

### 二次情報(解説)

- [Redis「Context engineering vs prompt engineering」](https://redis.io/blog/context-engineering-vs-prompt-engineering/) / [MindStudio「What Is Context Engineering?」](https://www.mindstudio.ai/blog/what-is-context-engineering-vs-prompt-engineering-3) — CE と PE の包含関係
- [Towards Data Science「A Practical Guide to Memory for Autonomous LLM Agents」](https://towardsdatascience.com/a-practical-guide-to-memory-for-autonomous-llm-agents/) — 短期/長期(意味・手続き・エピソード)メモリ、管理機能
- [GLOBIS 学び放題「SECIモデルとは」](https://globis.jp/article/dic_55lu8__iqv/) — 暗黙知/形式知の定義

### 関連(本プロジェクト内)

- [phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md) §7(ハイコンテキスト)・§9(明文化の壁・生成AI衝突点)
