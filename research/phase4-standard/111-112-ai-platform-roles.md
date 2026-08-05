# 調査メモ: AI 維持管理責任者（AI Maintainer）と AI 運用担当者（AIOps）の職掌（Issue #111 / #112）

- 調査日: 2026-08-05
- 対象 Issue: #111「AI 維持管理責任者（AI Maintainer）の職掌規定」/ #112「AI 運用担当者（AIOps）のインターフェース規定」
- 目的: 2 ロールの責任範囲・ゲート・成果物・レビュー手順を規定するための一次情報を収集する
- **鮮度に関する注意**: 本領域は陳腐化が速い。以下の記述はすべて **2026-08-05 時点**で確認した内容である。半年で前提が変わる前提で読むこと

---

## 0. 用語の整理（本メモでの定義）

- **AI Maintainer（#111）**: リポジトリ内の「エージェントへの指示資産」（`CLAUDE.md` / `AGENTS.md` / rules / skills / MCP 設定）を保守し、その一貫性・鮮度・品質に責任を持つ役割である。
- **AIOps 担当（#112）**: モデル API・LLM ゲートウェイ・トークン配給・障害時フェイルオーバーなど、AI 実行基盤の可用性とコストに責任を持つ役割である。
- 上記は本プロジェクトの造語であり、業界標準の職名としては未確立である（2026-08-05 時点で標準職名の一次情報は**未確認**）。近い既存概念は「Platform Engineering の Platform Team / Enabling Team」である（第 5 節）。

---

## 1. エージェント設定ファイルの標準化状況（2026-08-05 時点）

### 1.1 AGENTS.md

- AGENTS.md は「エージェント向けの README」として位置づけられ、ビルド手順・テスト・コード規約などをエージェントへ渡す専用の場所を提供する。出典: <https://agents.md/>
- 2026-08-05 時点の公式サイト記載として、以下を確認した。出典: <https://agents.md/>
  - 6 万を超えるオープンソースプロジェクトが採用している。
  - Linux Foundation 傘下の Agentic AI Foundation が仕様を統括している。
  - OpenAI Codex、Google Jules、Cursor、Aider、VS Code、Devin、GitHub Copilot Coding Agent、Zed、Warp、Windsurf、Gemini CLI など 20 以上のツールが対応している。
  - **ネスト時の優先順位は「編集対象ファイルに最も近い AGENTS.md が優先」**である。モノレポではパッケージごとに配置でき、OpenAI 本体リポジトリは 88 ファイルを運用している。

### 1.2 CLAUDE.md（Anthropic 公式ドキュメント）

出典: <https://code.claude.com/docs/en/memory>（2026-08-05 取得）

- 読み込み階層は「広い順」に以下である。表の順序がそのまま読み込み順（＝コンテキストへの投入順）である。
  1. **管理ポリシー（Managed policy）**: macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`、Linux/WSL `/etc/claude-code/CLAUDE.md`、Windows `C:\Program Files\ClaudeCode\CLAUDE.md`。IT / DevOps が MDM・Group Policy・Ansible 等で配布する。**個人設定で除外できない**。
  2. **ユーザー指示**: `~/.claude/CLAUDE.md`
  3. **プロジェクト指示**: `./CLAUDE.md` または `./.claude/CLAUDE.md`
  4. **ローカル指示**: `./CLAUDE.local.md`（`.gitignore` 対象）
- ディレクトリツリー上は「ルートに近い側が先、作業ディレクトリに近い側が後」に連結される。同一ディレクトリ内では `CLAUDE.md` の後に `CLAUDE.local.md` が続く。
- **重要**: 発見された全ファイルは**上書きではなく連結**される。すなわち厳密な優先順位（override）は存在しない。「2 つのルールが矛盾する場合、Claude はどちらかを恣意的に選ぶことがある（Claude may pick one arbitrarily）」と公式に明記されている。出典: <https://code.claude.com/docs/en/memory>
- CLAUDE.md はシステムプロンプトではなく、システムプロンプト後の**ユーザーメッセージとして配信**される。したがって「厳密な遵守の保証はない」と公式に明記されている。強制したい場合は PreToolUse フックや `permissions.deny` などの設定側（クライアントが強制する層）を使うよう案内されている。
- **AGENTS.md との関係**: Claude Code は `AGENTS.md` を読まない。既存の AGENTS.md がある場合は `CLAUDE.md` に `@AGENTS.md` としてインポートするか、シンボリックリンクを張る運用が公式に案内されている。
- モノレポ対策として `claudeMdExcludes`（グロブで特定 CLAUDE.md をスキップ）が用意される。ただし管理ポリシー配下の CLAUDE.md は除外不可である。
- `.claude/rules/*.md` により指示をトピック分割でき、YAML frontmatter の `paths` でファイルパターンにスコープできる（該当ファイルを読むときだけロードされる）。ユーザーレベル rules はプロジェクト rules より先に読まれる。
- 組織全体の指示は `managed-settings.json` の `claudeMd` キーに直接埋め込むこともできる。ユーザー / プロジェクト / ローカル設定に書いても効果はない。

### 1.3 その他

- Gemini CLI の `GEMINI.md` については、2026-08-05 時点で一次情報を確認していない（**未確認**）。ただし Gemini CLI が AGENTS.md 対応ツールとして公式サイトに列挙されている点は確認済みである。出典: <https://agents.md/>

### 1.4 #111 への含意（事実からの帰結）

- 「優先順位で解決する」設計は**成立しない**。CLAUDE.md 系は連結モデルであり、矛盾は非決定的に解決される。したがって AI Maintainer の職掌は「優先順位表の整備」ではなく「**矛盾そのものの除去**」に置くべきである。
- 強制力が必要なルールは指示ファイルではなくフック / 権限設定 / CI へ降ろす、という層分けが公式ドキュメントの立場である。

---

## 2. 指示ファイルの保守と競合（#111 の核心）

### 2.1 実証研究

- **Agent READMEs: An Empirical Study of Context Files for Agentic Coding**（2025-11-17、arXiv:2511.12884）。出典: <https://arxiv.org/abs/2511.12884>
  - 1,925 リポジトリの 2,303 個のコンテキストファイル（CLAUDE.md / AGENTS.md / copilot-instructions.md）を分析した最初の実証研究である。
  - コンテキストファイルは「静的なドキュメントではなく、**設定コードのように進化する、読みにくい成果物**」であり、頻繁な小刻みの追記によって保守されている。
  - 記載内容の偏り: ビルド・実行コマンド 62.3%、実装詳細 69.9%、アーキテクチャ 67.7% に対し、**セキュリティ 14.5%、パフォーマンス 14.5%** と非機能要件の記載が著しく少ない。
- **Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?**（ETH Zurich、初版 2026-02-12 / 改訂 2026-06-23、arXiv:2602.11988）。出典: <https://arxiv.org/abs/2602.11988>
  - SWE-bench タスク（LLM 生成のコンテキストファイル）と、開発者が手書きしたコンテキストファイルを持つリポジトリの新規データセットの 2 系統で評価した。
  - 結果: **コンテキストファイルの提供はタスク成功率を一般には改善せず、推論コストを平均 20% 超増加させた**。
  - モデルプロバイダが推奨する「リポジトリ概要（repository overview）」は有用ではなかった。
  - 一方で「コンテキストファイル内の指示自体はエージェントによく従われている」とされ、価値は**非標準的な慣行の明文化**にあると結論づけている。
- 反対方向の報告として **On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents**（arXiv:2601.20404）は、AGENTS.md の存在が実行時間中央値と出力トークン消費の低減と相関したと報告している。出典: <https://arxiv.org/abs/2601.20404>
  - **注**: 成功率への効果と効率への効果は別指標である。両者は必ずしも矛盾しない。

### 2.2 コンテキスト長による性能劣化（context rot）

- Chroma の研究「Context Rot: How Increasing Input Tokens Impacts LLM Performance」（2025 年 7 月公開）は、18 のフロンティアモデルを対象に、入力長の増加に伴い精度が**非一様に**低下することを報告した。出典: <https://research.trychroma.com/context-rot>（トップページ: <https://www.trychroma.com/research/context-rot>）
  - needle と question の類似度、distractor の有無、haystack の構造などが性能に非一様な影響を与える。
  - 公称コンテキスト長に達するはるか手前で精度が低下する事例が報告されている。
- Anthropic 公式も「200 行未満を目標にせよ。長いファイルはコンテキストを消費し、**遵守率を下げる（reduce adherence）**」と明記している。出典: <https://code.claude.com/docs/en/memory>
- 「安全なコンテキスト予算は公称値よりかなり小さい（例: 2M 窓のモデルで 150K〜400K）」といった具体的な数値は二次情報であり、一次の裏付けは**未確認**である。

### 2.3 公式が示す保守プラクティス（Anthropic）

出典: <https://code.claude.com/docs/en/memory>

- サイズ: 1 ファイル 200 行未満を目標とする。超える場合は `paths` スコープ付き rules へ分割する。`@` インポートによる分割は整理には役立つが、起動時に全部ロードされるため**コンテキスト削減にはならない**。
- 一貫性: CLAUDE.md、サブディレクトリのネスト CLAUDE.md、`.claude/rules/` を**定期的にレビューし、陳腐化・矛盾した指示を削除する**ことが公式に推奨されている。
- 具体性: 「コードを適切にフォーマットする」ではなく「2 スペースインデントを使う」のように**検証可能な粒度**で書く。
- 診断手段:
  - `/context` で実際にロードされたメモリファイルを確認する。
  - `InstructionsLoaded` フックで「どのファイルが、いつ、なぜロードされたか」をログ出力できる。
  - `/doctor` は チェックイン済み CLAUDE.md の削減案を提示する（コードベースから導出可能な内容—ディレクトリ構成、依存一覧、アーキテクチャ概要—を削り、落とし穴・根拠・ツール既定と異なる規約を残す）。Claude Code v2.1.206 以降。
- 追記の判断基準（公式）: 「同じ間違いを 2 回した」「レビューで指摘された」「前セッションと同じ訂正を打っている」「新メンバーが同じ説明を必要とする」。

### 2.4 「instruction drift」等の用語

- 「context rot」は 2025 年 6 月に Hacker News のコメントで生まれ、Chroma の研究で広まった語である（二次情報）。出典: <https://www.understandingai.org/p/context-rot>
- 「instruction drift」については、2026-08-05 時点で確立した一次定義を確認できなかった（**未確認**）。本プロジェクトで使う場合は独自定義であることを明記すべきである。

---

## 3. MCP サーバーの統治

### 3.1 仕様の状況（2026-08-05 時点）

- 最新仕様は **2026-07-28 版**である（`schema/2026-07-28/schema.ts` が権威）。出典: <https://modelcontextprotocol.io/specification/latest>
- 構成要素: Hosts / Clients / Servers、JSON-RPC 2.0、サーバ機能（Resources / Prompts / Tools）、クライアント機能（Elicitation）。
- 拡張（opt-in、初期化時にネゴシエート）として Tasks（長時間実行の非同期処理）、Skills over MCP、MCP Apps がある。
- **セキュリティ原則（仕様本文の記述）**:
  - ユーザーの同意と制御: 全データアクセス・操作に明示的同意が必要である。
  - データプライバシー: ホストはユーザーデータをサーバへ晒す前に明示的同意を得なければならない。
  - **ツール安全性: ツールは任意コード実行を意味する。ツールの挙動記述（annotations を含む）は、信頼できるサーバから得たものでない限り、信頼できない（untrusted）ものとして扱う**。ツール呼び出し前に明示的同意が必要である。
  - ただし「MCP はプロトコルレベルではこれらを強制できない」と明記されており、実装者への SHOULD にとどまる。

### 3.2 クライアント側の統制（Claude Code の例）

出典: <https://code.claude.com/docs/en/security>（2026-08-05 取得）

- 許可する MCP サーバのリストは、ソース管理へチェックインされる Claude Code 設定の一部として構成される。
- 「自作の MCP サーバか、信頼できる提供元の MCP サーバを使うことを推奨する」とされる。**Anthropic はディレクトリ掲載時に掲載基準の審査は行うが、MCP サーバのセキュリティ監査や管理は行わない**と明記されている。
- 新規 MCP サーバは初回に信頼確認（trust verification）を要求する。ただし `-p` の非対話実行では信頼確認が無効化される。
- 関連統制: 既定は読み取り専用権限、作業ディレクトリ境界、Bash サンドボックス（ファイルシステム / ネットワーク隔離）、`curl` / `wget` の非自動承認、WebFetch の隔離コンテキスト窓、コマンドインジェクション検知、fail-closed マッチング、`ConfigChange` フックによる設定変更の監査 / ブロック、OpenTelemetry によるモニタリング。

### 3.3 既知のリスクと業界の対策（二次情報を含む）

- OWASP は 2026 年版の **Top 10 for Agentic Applications** を公開しており、Agent Goal Hijack、Tool Misuse & Exploitation、Agent Identity & Privilege Abuse、Agentic Supply Chain Compromise、Unexpected Code Execution、Memory & Context Poisoning、Insecure Inter-Agent Communication、Cascading Agent Failures、Human-Agent Trust Exploitation、Rogue Agents を挙げる。tool poisoning は間接プロンプトインジェクションと構造的に等価であり ASI01（Agent Goal Hijack）に分類される。出典: <https://genai.owasp.org/>、二次: <https://www.trydeepteam.com/docs/frameworks-owasp-top-10-for-agentic-applications>
- Cloud Security Alliance が「Agentic MCP Security Best Practices」および「NIST AI RMF Agentic Profile」のドラフトを公開している。出典: <https://labs.cloudsecurityalliance.org/agentic/agentic-mcp-security-best-practices-v1/>
- 企業実務として、公開レジストリのフィードを取り込み、allow / deny リストを適用して**社内カタログ（プライベートレジストリ）**を持つ構成が報告されている。MCP 公式レジストリには Anthropic、GitHub、Microsoft 等が関与する。出典（二次）: <https://mcpmanager.ai/blog/mcp-gateway-registry/>、<https://www.gentoro.com/blog/what-is-anthropics-new-mcp-registry/>
  - **注**: レジストリ運用の具体像はベンダーブログ由来であり、宣伝的主張を含む。一次仕様での要求ではない。

---

## 4. AI 生成コードの品質劣化

### 4.1 GitClear（2026 年）

出典: <https://www.gitclear.com/the_ai_code_quality_maintainability_gap>（"The Maintainability Gap: 2026 AI Code Quality Research"、2026 年 1 月公開）

- 分析規模: 2023〜2026 年の 6 億 2,300 万件の変更。
- 主要数値（2023 → 2026 年 YTD）:

| 指標 | 2023 | 2026 YTD | 変化 |
| --- | --- | --- | --- |
| ブロック複製（5 行以上の連続重複） | 40.3 | 73.0 | +81% |
| Moved code（リファクタリング率） | 13% | 3.8% | −70%（2022 年は 21%） |
| Copy/paste 率 | 9.4%（2022） | 15.7%（2026 上期） | +約 41% |
| 関数接続性（呼び出し/千行） | 343 | 223 | −35% |
| 長期メンテナンスされるコード比率 | 1.7% | 0.46% | −74% |

- コードチャーンは AI 以前の約 3.3% から 2024 年 5.7%、2025 年 7.1% へ上昇したと報告される（二次情報経由での要約であり、原典の該当章は**未確認**）。
- 2024 年は「コミット内 copy/paste が moved code を上回った最初の年」である。
- **限界**: 原典に方法論上の限界（統計的信頼性、交絡要因の統制）の明示的記載は確認できなかった。GitClear は自社の差分解析製品を持つベンダーであり、相関を因果として読まないよう注意が必要である。

### 4.2 DORA

- DORA の 2025 年版レポート「State of AI-assisted Software Development」は、AI 採用が**個人の生産性・フロー・満足度を上げる一方で、デリバリの安定性とスループットには負の影響**を与えると報告している。出典: <https://dora.dev/dora-report-2025/>
- 2026 年に DORA は「強固なエンジニアリング基盤が AI の ROI を左右する」旨のレポートを公開している。出典: <https://dora.dev/ai/>、二次: <https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/>

### 4.3 AI slop（低品質生成物の氾濫）

- 論文「"AI Slop is DDoSing Open Source"」（2026 年 7 月、arXiv:2607.04003）。出典: <https://arxiv.org/html/2607.04003>
  - 定量: 294 リポジトリ、200 万件超の PR / issue を分析。
  - 2025 年に PR 量が約 6.80% 増加、マージ率が 1.06% 低下、**一度限りの貢献者の PR マージ率は 18.18% 低下**。
  - 「生成 AI はコード生成コストを下げ、**評価コストを上げた**」という非対称性を「AI-DDoS」と呼ぶ。
- 事例: cURL は 2026 年 1 月にバグバウンティを終了した。AI 生成報告により有効提出比率が 2025 年 7 月時点で約 5% まで低下し、トリアージが持続不能になったためである（二次情報）。出典: <https://www.coderabbit.ai/blog/ai-is-burning-out-the-people-who-keep-open-source-alive>
- 検知手段の実務（重複検出、複雑度、静的解析）については、GitClear の指標（ブロック複製、moved code 比率）が測定可能な代理指標として使える。汎用ツール（jscpd、SonarQube 等）の一次情報は本調査では**未確認**。

---

## 5. プラットフォームエンジニアリングのロール定義

- Team Topologies はプラットフォームチームを「ストリームアラインドチームのデリバリを加速させる、魅力的な内部プロダクトを提供するチーム群」と定義する。出典: <https://teamtopologies.com/platform-engineering>
- Team Topologies は Platform as a Product の考え方を広め、Thinnest Viable Platform（最も薄い実用最小プラットフォーム）を提唱した。出典: <https://teamtopologies.com/videos-slides/what-is-platform-as-a-product-clues-from-team-topologies>
- Golden Path（paved road）は Netflix / Spotify / Google 由来の概念で、最も一般的な作業（CI/CD、可観測性、認証など）について推奨経路を用意する考え方である（二次情報）。出典: <https://thenewstack.io/how-team-topologies-supports-platform-engineering/>
- AI 基盤運用の位置づけに関する 2026 年の議論（いずれも二次情報・意見記事）:
  - 「多くの組織で、プラットフォームチームが計画の有無にかかわらず AI イネーブルメントチームになりつつある」。出典: <https://thenewstack.io/in-2026-ai-is-merging-with-platform-engineering-are-you-ready/>
  - 内部開発者プラットフォームが「AI ベースの変更の配布層」となり、モデル提供・ガードレール・プロンプト管理・コスト管理を含むようになる。
  - Platform Engineering の State of Platform Engineering Report Vol.4 では、Head of Platform Engineering へレポートするチームが 32.9%（2023 年は 12%）とされる。出典: <https://platformengineering.org/blog/announcing-the-state-of-platform-engineering-vol-4>
- **注**: 「AI Platform Engineering」を職掌として定義した標準文書は、2026-08-05 時点で**未確認**である。上記はいずれもベンダー / コミュニティの主張である。

---

## 6. LLM ゲートウェイとトークン配給（#112）

いずれも一次のプロダクトドキュメントで裏づけるべき領域だが、本調査で確認できたのは主に二次情報である。

- 構成要素として共通して挙がる機能: 統一 API、プロバイダ横断のルーティング、フォールバックチェーン、レート制限、キャッシュ、予算 / クォータ、使用量の可視化、監査ログ、ガードレール（PII マスキング等）。
- LiteLLM: 100 以上のプロバイダを単一インタフェースで扱うオープンソースのゲートウェイである。チーム単位のキーに `max_budget_usd` と `budget_duration` を設定でき、支出カウンタを Postgres に保持し、予算超過時は 429 と説明的なエラーボディを返す。出典（二次）: <https://www.truefoundry.com/blog/litellm-pricing-guide>、一次: <https://docs.litellm.ai/>
- Portkey: リアルタイムの支出追跡とアラート、PII 秘匿・ジェイルブレイクフィルタ・監査証跡をゲートウェイ層に持つ。2026 年 3 月に Apache 2.0 化したとの報告がある（**要一次確認**）。出典（二次）: <https://lushbinary.com/blog/ai-gateway-llm-routing-comparison-litellm-portkey-cloudflare/>
- Cloudflare AI Gateway: OpenAI / Anthropic / Bedrock / Workers AI 等へプロキシし、分析・キャッシュ・レート制限・フォールバックをモデル費用へのマークアップなしで提供する。一次: <https://developers.cloudflare.com/ai-gateway/>
- API キー管理の実務として、Anthropic は 90 日ローテーション、キー単位の支出上限（漏洩時の影響範囲の限定）、GitHub のシークレットスキャン連携を推奨しているとの報告がある（**一次ページ未確認**）。出典（二次）: <https://stacklok.com/blog/the-enterprise-it-security-guide-to-claude-and-mcp/>
- **注意**: この節のツール比較記事はアフィリエイト / ベンダー主導のものが多い。導入判断には各製品の公式ドキュメントで再確認すべきである。

---

## 7. セキュリティ・データプライバシーのガードレール

### 7.1 標準・フレームワーク

- **OWASP Top 10 for LLM Applications**: 2026 年版が **2026-08-03 に公開**された。出典: <https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/>
  - 「更新されたランキング」「脅威カバレッジの拡張」を掲げ、数千件の実世界 AI セキュリティインシデントに基づくとされる。10 項目の具体名はランディングページには記載がなく、PDF の参照が必要である（本調査では**未取得**）。
  - 直前版（2025 年の v2.0）は、プロンプトインジェクション、機微情報の開示、サプライチェーン、データ / モデルポイズニング、不適切な出力処理、過剰なエージェンシー、システムプロンプト漏洩、ベクトル / 埋め込みの弱点、誤情報、無制限消費の 10 項目である（二次情報）。出典: <https://repello.ai/blog/owasp-llm-top-10-2026>
- **NIST AI RMF Generative AI Profile（NIST AI 600-1）**: 2024 年 7 月公開。AI RMF 1.0（NIST AI 100-1）の分野横断プロファイルであり、生成 AI に固有 / 増悪する **12 のリスクカテゴリ**と、Govern / Map / Measure / Manage に沿った **200 超の推奨アクション**を提示する。任意適用のガイダンスである。出典: <https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf>
- **ISO/IEC 42001:2023**: AI マネジメントシステム（AIMS）の要求事項を定める世界初の規格である。リスクマネジメント、AI システム影響評価、**システムライフサイクル管理**、第三者サプライヤ監督を含み、構想から開発・テスト・デプロイ・監視・**廃止**までを対象とする。出典: <https://www.iso.org/standard/42001>
  - モデル変更管理の具体的な条項レベルの要求は、規格本文を参照しないと確定できない（**未確認**）。

### 7.2 データ利用ポリシー（モデルプロバイダ）

- Anthropic: Claude for Work / Enterprise / Education / Gov ではデータをモデル学習に使用しない（商用規約に基づき、opt-in / opt-out トグルの対象外）。2025-09-14 より API ログ保持を 30 日から 7 日へ短縮し、要件を満たす企業顧客には Zero Data Retention 契約を提供する。出典: <https://platform.claude.com/docs/en/manage-claude/api-and-data-retention>
- OpenAI: API の標準保持期間は 30 日であり、より厳格な要件には Zero Data Retention の契約オプションがある。ビジネス向け製品では既定で入出力を学習に使用しないとしている。出典: <https://platform.openai.com/docs/guides/your-data>
- Claude Code のプライバシー面の統制（保持期間、セッションデータへのアクセス制限、学習利用設定）は公式セキュリティページに記載がある。出典: <https://code.claude.com/docs/en/security>

### 7.3 日本の状況（2026 年）

- デジタル庁「デジタル社会推進標準ガイドライン DS-920 行政の進化と革新のための生成 AI の調達・利活用に係るガイドライン」が **2026-06-12** に公表された。出典: <https://www.digital.go.jp/assets/contents/node/information/field_ref_resources/decb64eb-f26e-41cb-8d37-f3dd173108b8/59054b35/20260612_resources_standard_guidelines_guideline_01.pdf>
  - クラウド事業者が生成 AI モデルの提供を受け、自らの生成 AI 開発基盤でサービス提供する場合、当該基盤の **ISMAP 登録**が必要とされる（二次要約であり、原典該当箇所は**未確認**）。
- 日本のアプローチは、厳格な規制よりも事業者が自律的に管理する「AI ガバナンス」の構築を重視する、と整理されている（二次情報）。出典: <https://gvalaw.jp/blog/i20260303/>
- **建前と実運用の乖離に関する示唆**: 「ガイドラインを策定したが現場は個人 API キーや個人アカウントで利用している」といった実態の一次調査は、本調査では**未確認**である。追加調査が必要である。

---

## 8. 障害・レート制限・モデル廃止への対処（#112 の核心）

### 8.1 実際の障害事例

- **Anthropic「A postmortem of three recent issues」（2025-09-17 公開）**: 2025 年 8 月〜9 月初頭にかけて Claude の応答品質が断続的に劣化した原因は 3 つのインフラ不具合であった。出典: <https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues>
  - バグ 1: コンテキスト窓のルーティング誤り。8/5 に一部 Sonnet 4 リクエストが 1M トークン窓向けサーバへ誤送された。当初 0.8% の影響が、8/31 の最悪時には Sonnet 4 リクエストの **16%** に達した。
  - バグ 2: Claude API の TPU サーバ設定ミスによる出力破損。
  - バグ 3: コンパイルパイプラインの不具合。
  - **検知が困難だった理由**: 社内のプライバシー / セキュリティ統制により、エンジニアが問題のあるユーザ対話へアクセスできず、再現・特定が阻まれた。
  - 対策として、正常挙動と不具合挙動を識別できる評価手法と、プライバシーを損なわずデバッグできる基盤 / ツールを整備したとされる。
  - **#112 への含意**: 「API は 200 を返しているのに品質が落ちる」という**サイレントな性能劣化**が実在する。可用性監視だけでは検知できない。
- **2026 年の連続障害**: 2026 年 6 月に短期間で複数回の Claude 障害が報告された（6/5 以降 12 日間で 10 回目、との報道）。Anthropic は 2026 年のこれらの障害について公開ポストモーテムを出していない、との指摘がある。ステータスページ由来として 90 日稼働率が claude.ai 99.12%、Claude Code 99.28%、API 99.41% と報じられた（いずれも**報道ベースの二次情報**、一次未確認）。出典: <https://www.ibtimes.co.uk/claude-ai-faces-repeated-outages-1811601>、<https://statusgator.com/services/anthropic/outage-history>
  - 一次で確認する場合は <https://status.anthropic.com/> を参照すること。

### 8.2 モデル廃止（deprecation）

- Anthropic: モデルを active → legacy → deprecated → retired と扱い、公開済みモデルについて**最低 60 日前の通知**を約束している。各 active モデルに「これより早くは廃止しない（not sooner than）」日付を公開している。モデルウェイトの保存も表明している。出典: <https://www.anthropic.com/research/deprecation-updates-opus-3>、一次補足: <https://platform.claude.com/docs/en/about-claude/model-deprecations>
  - Claude Opus 3 は 2026-01-05 に退役し、これらのコミットメント下で完全な退役プロセスを経た最初のモデルとなった。
- OpenAI: GA モデルは最低 6 か月、特殊バリアントは 3 か月、プレビューは 2 週間程度の猶予とされる（二次情報）。出典: <https://presenc.ai/research/ai-model-deprecation-tracker-2026>
- 2026 年の主な退役（二次情報）: GPT-4o が 2026-04-03、Claude 3.7 Sonnet が 5/11、Claude 3.5 Haiku が 7/5、Assistants API が 8/26。出典: <https://benchr.org/deprecations>
- 廃止スケジュールを追跡するツールとして quora/model-deprecation-tracker 等が存在する。出典: <https://github.com/quora/model-deprecation-tracker>
- **#112 への含意**: モデル ID の固定（バージョンピン）と、廃止カレンダーの定期棚卸しが運用タスクとして必要である。60 日〜6 か月の猶予は「移行 + 回帰評価」を回すには短い場合がある。

### 8.3 フェイルオーバー

- ゲートウェイ層のフォールバックチェーン（プロバイダがクォータ超過 / 障害のときに別プロバイダへ流す）が標準的な対策として挙げられる（第 6 節、二次情報）。
- ただし**別モデルへ切り替えた際の品質変動**（性能回帰）を検出する仕組みが伴わなければ、可用性は保てても成果物品質は保てない。この点を扱った一次の実務報告は本調査では**未確認**であり、第 9 節の評価基盤で補う必要がある。

---

## 9. モデルの適合性評価（model qualification）

- 実務として報告されている構成（いずれも二次情報。ベンダーブログが中心である点に注意）:
  - ベースラインデータセット（gold set）に対する回帰テストを、モデル更新 / プロンプト変更 / 検索パイプライン変更のたびに自動実行する。
  - 多層構成: ミリ秒で走る単体テスト的なサニティチェック → LLM-as-judge / 埋め込み類似度 / ヒューリスティック（正規表現、JSON 検証）→ レッドチームデータセットによるリリース前テスト（OWASP LLM Top 10 の失敗モードを含む）。
  - CI/CD への統合: ベースラインからの回帰がしきい値を下回るとマージ / デプロイをブロックする品質ゲート。
  - 出典: <https://testquality.com/llm-regression-testing-pipeline/>、<https://www.adaline.ai/blog/complete-guide-llm-ai-agent-evaluation-2026>
- Anthropic のポストモーテムも、対策として「正常挙動と不具合挙動を識別できる評価手法の開発」を挙げており、**評価基盤が障害検知の一次手段になる**という点で一次情報の裏づけがある。出典: <https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues>
- 規制対応: ISO/IEC 42001 はライフサイクル管理と第三者サプライヤ監督を要求するため、モデル差し替えは**変更管理の対象**として記録・承認が必要になる。ただし条項レベルの具体的要求は**未確認**（第 7.1 節）。

---

## 10. 考察（本メモ執筆者の解釈。事実ではない）

### 10.1 #111 AI Maintainer の職掌設計への示唆

- **役割の核**: 「指示資産のプロダクトオーナー」である。追記は誰でもできるが、**削除と統合の権限を 1 か所に集める**ことが要である。連結モデル（第 1.2 節）である以上、放置すれば矛盾は必ず蓄積する。
- **強制力の層分け**（公式ドキュメントの立場に整合）:
  1. 強制が必要 → `permissions.deny` / フック / CI（クライアント / パイプラインが強制）
  2. 振る舞いの誘導 → CLAUDE.md / rules（非決定的、遵守は保証されない）
  3. 手順の再利用 → skills（オンデマンドロード）
- **定量的な保守基準の候補**: 1 ファイル 200 行未満（公式目標値）、`@` インポートはコンテキスト削減にならない、パススコープ rules へ切り出す、`/doctor` の削減提案を定期適用、`InstructionsLoaded` フックでロード実績を監査。
- **レビュープロセスの候補**: 指示ファイルの変更は通常のコードレビューに加え、(a) 既存指示との矛盾チェック、(b) 総行数の予算超過チェック、(c) 「コードベースから導出可能な内容ではないか」の確認を必須項目にする。
- **測定**: GitClear 指標（ブロック複製率、moved code 比率）をリポジトリで自前計測し、AI 生成物の劣化を早期に検知する。DORA の「個人生産性は上がるがデリバリ安定性は下がる」という知見と併せ、**個人指標とデリバリ指標を必ず対で見る**。
- **AGENTS.md との関係**: 標準としての勢いは AGENTS.md にあるが（6 万リポジトリ、Linux Foundation）、Claude Code は読まない。したがって「AGENTS.md を正本とし、CLAUDE.md は `@AGENTS.md` インポート + ツール固有の差分だけ」という構成が、二重管理を避ける現実解と考えられる。

### 10.2 #112 AIOps 担当のインターフェース設計への示唆

- **可用性と品質を分けて監視する**必要がある。Anthropic の 2025 年ポストモーテムが示すとおり、HTTP レベルは正常でも品質が劣化しうる。したがって #112 のインタフェースには「品質メトリクスの定期実行（カナリア eval）」を含めるべきである。
- **フェイルオーバーは「切り替えたあとの品質」までがスコープ**である。切替先モデルの適合性評価（第 9 節）が済んでいないプロバイダへ自動フォールバックする構成は、可用性のために品質を暗黙に犠牲にする。
- **廃止カレンダーの棚卸し**を定例タスク化する。60 日通知（Anthropic）は、回帰評価 → 差分修正 → 展開のリードタイムに対して余裕が小さい。
- **コスト配賦**はチーム単位キー + 予算上限が実装可能な単位である（LiteLLM の例）。予算超過時に 429 を返す設計は、開発を止める代わりに事故を防ぐトレードオフであり、ファストトラック規程（#101）との接続を検討すべきである。

### 10.3 日本の企業文化における留意点（解釈）

- ガイドライン（AI 事業者ガイドライン、DS-920 等）は整備が進む一方、現場での**シャドー AI**（個人契約のアカウント / キーでの利用）の実態を扱った一次調査は本調査では見つからなかった。#112 のゲートウェイ集約は「統制」だけでなく「正規経路のほうが速く便利である」という Golden Path の設計にしないと、迂回される可能性が高い。
- 「承認プロセスを作ったが、実運用ではレビューが形骸化する」というリスクは、指示ファイルのレビュー（#111）でも同じ形で現れる。**機械可読な基準（行数、重複率、矛盾検出）に落とすことが、形骸化への唯一の実効的な防御**であると考える。

---

## 11. 未確認・追加調査が必要な点

1. OWASP Top 10 for LLM Applications **2026 年版の 10 項目の具体名**（PDF ダウンロードが必要）
2. `GEMINI.md` の一次仕様（Google 公式ドキュメント）
3. ISO/IEC 42001 の**条項レベル**でのモデル変更管理要求（規格本文が有償）
4. Portkey の Apache 2.0 化（2026-03）の一次確認
5. Anthropic の API キー運用推奨（90 日ローテーション等）の一次ページ
6. 2026 年の Claude 障害に関する**一次のステータス / ポストモーテム**（status.anthropic.com の履歴）
7. 「別モデルへ切り替えた際の性能回帰」を扱った**実証研究**
8. 日本企業における**シャドー AI の実態調査**（IPA、JEITA 等の一次調査）
9. コード重複 / 複雑度の検知ツール（jscpd、SonarQube 等）の一次ドキュメントと閾値設定の実務
10. 「instruction drift」に相当する現象の学術的な定義

---

## 参考文献一覧（主要出典）

- AGENTS.md 公式: <https://agents.md/>
- Claude Code メモリ（CLAUDE.md）: <https://code.claude.com/docs/en/memory>
- Claude Code セキュリティ: <https://code.claude.com/docs/en/security>
- MCP 仕様（2026-07-28 版）: <https://modelcontextprotocol.io/specification/latest>
- OWASP GenAI LLM Top 10 2026: <https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/>
- NIST AI 600-1: <https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf>
- ISO/IEC 42001:2023: <https://www.iso.org/standard/42001>
- Anthropic ポストモーテム（2025-09-17）: <https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues>
- Anthropic モデル廃止コミットメント: <https://www.anthropic.com/research/deprecation-updates-opus-3>
- Anthropic API とデータ保持: <https://platform.claude.com/docs/en/manage-claude/api-and-data-retention>
- GitClear "The Maintainability Gap"（2026-01）: <https://www.gitclear.com/the_ai_code_quality_maintainability_gap>
- DORA State of AI-assisted Software Development 2025: <https://dora.dev/dora-report-2025/>
- Agent READMEs（arXiv:2511.12884、2025-11）: <https://arxiv.org/abs/2511.12884>
- Evaluating AGENTS.md（arXiv:2602.11988、2026-02）: <https://arxiv.org/abs/2602.11988>
- On the Impact of AGENTS.md Files（arXiv:2601.20404）: <https://arxiv.org/abs/2601.20404>
- AI Slop is DDoSing Open Source（arXiv:2607.04003、2026-07）: <https://arxiv.org/html/2607.04003>
- Chroma Context Rot（2025-07）: <https://www.trychroma.com/research/context-rot>
- Team Topologies Platform Engineering: <https://teamtopologies.com/platform-engineering>
- デジタル庁 DS-920（2026-06-12）: <https://www.digital.go.jp/assets/contents/node/information/field_ref_resources/decb64eb-f26e-41cb-8d37-f3dd173108b8/59054b35/20260612_resources_standard_guidelines_guideline_01.pdf>
