# エージェント型開発の現在地 更新調査メモ(2026-08-04 時点)

- Issue: #94
- **調査日: 2026-08-04**
- 前版: [20260710-agentic-development.md](./20260710-agentic-development.md)(調査日 2026-07-10)
- 清書先(既存): `src/content/docs/phase2-aidlc/agentic-development.md`

> 本メモの位置づけ: 前版の記述を 2026-08-04 時点の一次情報で検証・更新する差分メモである。前版と重複する背景説明(定義・Anthropic のワークフロー/エージェント区別・SWE-bench の由来など)は繰り返さず、**変化した事実**と**変化していない事実**の確定に絞る。
>
> 表記ルール: すべての事実に「(発表日 YYYY-MM-DD, 出典)」または「(取得日 2026-08-04, 出典)」を付す。発表日が確認できた一次情報は発表日を、リーダーボードなど時点依存の値は取得日を記す。検証できなかった項目は §9 に正直に列挙し、推測で埋めない。

---

## 0. 要約: この4週間〜3か月で何が変わったか

- **モデル世代が二段跳んだ**。Anthropic は Mythos クラス(Fable 5 / Mythos 5)を 2026-06-09 に投入し、さらに 2026-07-24 に Opus 5 を出した。OpenAI は GPT-5.6 ファミリーを 2026-07 に投入した。
- **前版の重大な誤りが判明した**。前版 §3-2 の注記は「実在確認できないモデル名(例: 架空の "Mythos 5" / "Fable 5")」としてリーダーボード集約サイトの値を退けたが、**Fable 5 / Mythos 5 は実在する**(発表日 2026-06-09)。この注記は撤回する(§1-1、§6-1)。
- **SWE-bench Verified は事実上飽和した**。前版の「80% 前後で伸びが緩む」という見立ては覆り、95〜96% 帯へ跳ねた(取得日 2026-08-04)。
- **METR の「倍加 7 か月」は古い**。METR 自身が Time Horizon 1.1 で測定基盤を刷新し、2024 年以降に限れば**倍加 89 日(約 3 か月)**と報告した(発表日 2026-01-29)。
- **本プロジェクトの中心命題「人間の検証帯域が律速」に、初めて大規模な定量証拠が付いた**。LinearB の 810 万 PR 分析(発表日 2026-05-04)で、AI 生成 PR のレビュー着手待ちは約 5 倍、無修正マージ率は 32.7%(対 人間 84.5%)である。

---

## 1. 主要エージェント製品の現況

### 1-1. Anthropic — Mythos クラスの登場と Opus 5

- **Claude Fable 5 / Claude Mythos 5 を発表(発表日 2026-06-09)**。両者は**同一の基盤モデル**であり、Fable 5 は安全対策を組み込んだ一般提供版、Mythos 5 は安全対策を外した限定提供版(認可されたサイバーセキュリティ専門家・生物医学研究者向け)である。Opus を上回る新ティア(Mythos クラス)として位置づけられる。
  - 安全設計: サイバーセキュリティ・生物/化学・蒸留の各領域で分類器が誤用を検知し、該当時は**Opus 4.8 の応答にフォールバック**する。作動は「平均して 5% 未満のセッション」とされる。
  - 価格: 入力 $10 / 出力 $50(百万トークンあたり)。
  - 出典: [Anthropic "Claude Fable 5 and Claude Mythos 5"](https://www.anthropic.com/news/claude-fable-5-mythos-5)(発表日 2026-06-09)、[Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5)、[TechCrunch(二次)](https://techcrunch.com/2026/06/09/anthropics-claude-fable-5-is-a-version-of-mythos-the-public-can-access-today/)、[CNBC(二次)](https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html)
- **一時停止と再展開(重要なガバナンス事例)**: Fable 5 は **2026-06-12 に提供を停止**し、**2026-07-01 に再展開**された。理由は2つ重なる。
  1. 米国政府が Fable 5 / Mythos 5 に**輸出管理**を適用し、外国籍ユーザーへのアクセス制限を要求した。リアルタイムでの国籍確認ができないため、Anthropic は予防的に全ユーザーのアクセスを止めた。
  2. Amazon の研究者が、脆弱性発見を装うプロンプトで安全装置を回避する手法を発見した。Anthropic は当該手法を 99% 超で遮断する新分類器を開発し、作動時は Opus 4.8 へ迂回させる形で再展開した。Anthropic 自身は「GPT-5.5 や Kimi K2.7 など他モデルでも同じ脆弱性を再現でき、境界事例であって固有能力の露出ではない」と評価している。
  - 出典: [Anthropic "Redeploying Claude Fable 5"](https://www.anthropic.com/news/redeploying-fable-5)(発表日 2026-07-01)
- **Claude Opus 5 を発表(発表日 2026-07-24)**。SWE-bench Verified 96.0%、SWE-bench Pro 79.2% を主張。価格は入力 $5 / 出力 $25 と Opus 4.8 据え置きで、Fable 5 の約半額帯に位置する。Anthropic にとって 2 か月で 4 モデル目のリリースにあたる。
  - 出典(いずれも二次報道): [Axios](https://www.axios.com/2026/07/24/anthropic-releases-new-model-opus-5)、[TNW](https://thenextweb.com/news/anthropic-claude-opus-5-launch-frontier-bench-coding)、[MarkTechPost](https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/)(発表日 2026-07-24)
  - **留保**: Opus 5 の SWE-bench Verified 96.0% は本調査では Anthropic 公式ページで直接確認できず、二次報道および集約リーダーボード経由の値である(§9)。
- **Claude Agent SDK の課金分離(発表日 2026-06-15 以降)**: Claude サブスクリプション各プランに Agent SDK 用の月次クレジットが別枠で付与される($20 Pro / $100 Max 5x / $200 Max 20x)。エージェント実行コストを対話利用と分けて計量する方向であり、§5 の「コストが統制変数になる」流れと整合する。
  - 出典(二次): [Totalum "Claude Agent SDK in 2026"](https://www.totalum.app/blog/claude-agent-sdk-totalum-2026)(取得日 2026-08-04)
  - **留保**: 一次(Anthropic 公式の価格ページ)での裏取りは未了。

### 1-2. Cognition(Devin)— 自社モデル路線と「群」への転換

前版は Devin を「完全自律を謳うが第三者検証では 20 件中 3 件成功(Answer.AI, 2025-01)」と整理した。2026 年前半で製品像が大きく変わっている。

- **Devin 2.2(発表日 2026-02)**: コンピュータ操作で自分の成果物をテストし、**自己検証・自動修正**する機能を追加。ローンチ以来最大級の更新と位置づけられる。
  - 出典: [Cognition "Introducing Devin 2.2"](https://cognition.com/blog/introducing-devin-2-2)
- **Windsurf を Devin Desktop へ改称・再構築(発表日 2026-06-02)**: 買収した Windsurf を「コーディング支援ツール」から「**複数エージェントの艦隊管理プラットフォーム**」へ位置づけ直した。Cascade は Rust で書き直された Devin Local に置き換わり、トークン効率が最大 30% 改善したとされる。
  - 出典(二次): [Bind AI](https://blog.getbind.co/cursor-vs-devin-desktop-windsurf-2026/)、[byteiota](https://byteiota.com/windsurf-is-now-devin-desktop-what-actually-changed/)(取得日 2026-08-04)
- **SWE-1.7(発表日 2026-07-08)**: Cognition 自社のエージェント特化モデル。**Kimi K2.7(既に大規模 RL 済み)の上にさらに RL** を重ねて構築。Cerebras 経由で 1,000 tokens/秒 で提供。Devin Web / Desktop / CLI で利用可能。
  - ベンチマーク主張値: FrontierCode 1.1 Main **42.3%**、Terminal-Bench 2.1 **81.5%**、SWE-bench Multilingual **77.8%**。前世代 SWE-1.6 の FrontierCode 9.4% から一世代で 4 倍超。
  - 位置づけ: FrontierCode では GPT-5.5(43.0%)・Opus 4.8(46.5%)にわずかに劣る。「王座」ではなく**コスト対性能のパレート曲線を押し上げる**のが主張。
  - 出典: [Cognition "SWE-1.7: Frontier Intelligence at a Fraction of the Cost"](https://cognition.com/blog/swe-1-7)(発表日 2026-07-08)、[WinBuzzer(二次)](https://winbuzzer.com/2026/07/09/cognition-swe-17-adds-near-frontier-coding-scores-to-devin-xcxwbn/)
- **Devin Security Swarm(発表日 2026-07-01)**: **agentic MapReduce** 構成で、並列エージェントがファイル横断で推論し、認証バイパスやビジネスロジック欠陥のような「アプリの動き方」に宿る欠陥を探す。個別の発見を**攻撃経路**として合成し、隔離サンドボックスで**実行時に再現して悪用可能性を確認**したうえで人間に渡す。50 件の CVE テストセットで実脆弱性の 72% を $90.23/run で検出したと主張(自社比較)。
  - 出典: [Cognition "Introducing Devin Security Swarm"](https://cognition.com/blog/introducing-devin-security-swarm)、[PR Newswire](https://www.prnewswire.com/news-releases/cognition-launches-devin-security-swarm-to-tackle-the-vulnerability-backlog-302814800.html)(発表日 2026-07-01)
  - **プロセス設計上の含意**: 「人間に渡す前に、エージェント自身が実行時再現で偽陽性を落とす」という設計は、§5 の検証帯域問題に対する**供給側からの回答**である。生成量を減らすのではなく、**人間に届く前に確度を上げる**アプローチ。
- **Devin Fusion アーキテクチャ**: フロンティアモデルの主エージェントと、低コストな「サイドキック」モデルのエージェントを**並列に走らせる**構成。両者とも独自ツールセットを持つ完全なエージェントである。Cognition の社内研究では、リードオーケストレーターとして **Fable 5 が Opus 4.8 を上回った**(FrontierCode 1.1 で 60.7 対 54.6、1 実行あたりコスト $1.86 対 $2.04)(発表日 2026-07-13)。
  - 出典: [Cognition "Devin Fusion"](https://cognition.com/blog/devin-fusion)、[AIToolsReview(二次まとめ)](https://aitoolsreview.co.uk/insights/devin-cognition-july-2026)
- **その他の 2026-07 の動き**: FedRAMP High In-Process 取得(2026-07-13)、TierZero 買収(2026-07-20)、Devin Outposts(顧客自身の環境で Devin ワークロードを実行、既定は無効)(2026-07-22)、MCP ツールの実行場所を Devin サーバ側へ変更(2026-07-31)。
  - 出典: [Devin Docs "Recent Updates"](https://docs.devin.ai/release-notes/overview)(取得日 2026-08-04)
  - **含意**: FedRAMP・Outposts・SCIM といったエンタープライズ統制機能への傾斜は、前版 §6 が指摘した「日本の SIer/事業会社の非機能要件と衝突しやすい」という壁への、ベンダー側の直接的な応答である。

### 1-3. OpenAI — Codex の世代交代と GPT-5.6 ファミリー

- **GPT-5.3-Codex(発表日 2026-02-05)**: 当時最も高性能なエージェント型コーディングモデルとされ、GPT-5.2-Codex の性能と GPT-5.2 の推論・専門知識を統合しつつ 25% 高速化。**OpenAI 自身が「モデル自身の作成に寄与した最初のモデル」**と位置づけ、Codex チームが早期版を使って自らの学習のデバッグ・デプロイ管理・評価診断を行ったとする。
  - 2026-02-12 に軽量版 GPT-5.3-Codex-Spark をリサーチプレビュー公開。
  - 出典: [OpenAI "Introducing GPT-5.3-Codex"](https://openai.com/index/introducing-gpt-5-3-codex/)(発表日 2026-02-05)、[Wikipedia "GPT-5.3-Codex"(二次)](https://en.wikipedia.org/wiki/GPT-5.3-Codex)
  - **含意**: 「AI が AI の開発プロセスを回す」自己参照が、ベンダー公式の主張として明示された点は AIDLC の理想像に近い実例である。ただし OpenAI 内部の閉じた条件下の話であり、一般企業の開発現場への外挿は別問題(§8 考察)。
- **GPT-5.5 / GPT-5.5 Pro(API 提供開始 2026-04-24)**: コード記述・デバッグ、オンライン調査、データ分析、ドキュメント/スプレッドシート作成、ソフトウェア操作を横断し「タスクが終わるまでツールを渡り歩く」ことを主張。
  - 出典: [OpenAI "Introducing GPT-5.5"](https://openai.com/index/introducing-gpt-5-5/)(発表日 2026-04-24)
- **GPT-5.6 ファミリー(2026-07)**: Sol(フラッグシップ)/ Terra(バランス)/ Luna(最安)の 3 層構成。2026-07-30 に Luna を 80%、Terra を 20% 値下げ。
  - 出典: [OpenAI "GPT-5.6"](https://openai.com/index/gpt-5-6/)(取得日 2026-08-04、本文は HTTP 403 のため直接検証できず。§9 参照)、[Codex changelog](https://developers.openai.com/codex/changelog)
  - **含意**: 「1 フラッグシップ」から「性能/コスト階層」への移行は、Cognition の Fusion(主エージェント+安価サイドキック)と同じ方向で、**エージェント運用のコスト設計が製品設計の第一級変数になった**ことを示す。

### 1-4. GitHub Copilot coding agent — 統制設計は維持、範囲は拡大

**本プロジェクトにとって最重要の確認事項**: 前版 §1-4 で「AIDLC の human verify/approve をプラットフォームが強制する具体実装」として重視した**「PR 作成を依頼した開発者はその PR を承認できない」という仕様は、2026-08-04 時点でも維持されている**。

- GitHub のポリシー文言は「Copilot に PR 作成を依頼したユーザーが、その PR を承認することを防ぐ(Prevents the user who asked Copilot to create a pull request from approving it)」。最終 push を依頼した本人は必須レビュアーに数えられないが、**別の人物が最新の Copilot 変更を依頼した場合はその人の承認は有効**という細則がある。
  - 出典: [GitHub Docs "About Copilot coding agent"](https://docs.github.com/en/copilot/concepts/coding-agent/about-copilot-coding-agent)、[GitHub Community Discussion #179997](https://github.com/orgs/community/discussions/179997)(取得日 2026-08-04)
  - **留保**: 上記の正確な文言は GitHub Docs 本文の直接取得では確認できず、検索結果と Community Discussion 経由の確認である(§9)。
- **関連する統制の追加**: Copilot が PR を開く/push すると、Copilot は**外部コントリビューター扱い**となり、人間が "Approve and run workflows" を押すまで GitHub Actions ワークフローは走らない。ただし 2026-03-13 に**この承認を任意でスキップできるオプション**が追加された(反復速度とリスクのトレードオフとして明示)。
  - 出典: [GitHub Changelog "Optionally skip approval for Copilot coding agent Actions workflows"](https://github.blog/changelog/2026-03-13-optionally-skip-approval-for-copilot-coding-agent-actions-workflows/)(発表日 2026-03-13)
  - **含意**: 統制の骨格(独立レビュー強制)は維持しつつ、摩擦の大きい部分(CI 承認)は**オプトアウト可能**にした。「強制」から「既定値としての強制+逃げ道」への微妙な後退であり、日本文脈へ写像する際は「どちらを組織の標準にするか」が意思決定点になる。
- **範囲拡大**:
  - ネットワーク設定変更(2026-02-27 発効、プラン別のホスト経路制御)。出典: [GitHub Changelog](https://github.blog/changelog/2026-02-13-network-configuration-changes-for-copilot-coding-agent/)
  - Copilot CLI と JetBrains 向けエージェント機能(発表日 2026-06-02)。CLI には完全自律の **Agent mode** と、実装計画を組んで人間のレビューに出す **Plan mode** がある。出典: [GitHub Changelog](https://github.blog/changelog/2026-06-02-introducing-copilot-cli-and-agentic-capabilities-enhancements-in-jetbrains-ides/)
  - **Linear 向け Copilot cloud agent が GA(発表日 2026-07-23)**。Linear の Issue を Copilot にアサインすると、内容を解析し draft PR を開き、専用の一時環境で独立作業し、進捗を Linear のタイムラインへストリーミングし、完了時にレビューを依頼する。出典: [GitHub Changelog](https://github.blog/changelog/2026-07-23-copilot-cloud-agent-for-linear-is-now-generally-available/)
  - VS Code(2026-06〜07)ではエージェントセッションの整理、**セッション全体のコスト可視化**、サブエージェント使用状況の点検が追加。出典: [GitHub Changelog](https://github.blog/changelog/2026-07-08-github-copilot-in-visual-studio-code-june-2026-releases/)

### 1-5. Google — Jules の GA と Gemini 3 系

- **Jules が Google I/O 2026 で一般提供(GA)に到達**。Gemini 3 Pro が Google AI 加入者向けに Jules へ展開され、Ultra、続いて Pro プランへ順次拡大。無償ユーザーの基盤モデルは **Gemini 3 Flash(発表日 2026-01-30)**。Jules はビルドシステム・エミュレータ・テストランナーをプログラム的に起動できる。
  - 出典: [Google Developers Blog "Building with Gemini 3 in Jules"](https://developers.googleblog.com/jules-gemini-3/)、[Jules 公式](https://jules.google/)、[AgentUpdate(二次)](https://agentupdate.ai/news/google-io-2026-jules-ai-engineer)(取得日 2026-08-04)
  - **留保**: Google I/O 2026 の正確な開催日と、Jules GA の公式発表日は本調査で一次確定できなかった(§9)。前版は「2025-09 に GA」と記していたが、I/O 2026 での GA 宣言との関係(再 GA か、対象範囲の拡大か)は未整理。

### 1-6. 新興・その他

- **Cursor 3.6(発表日 2026-05-29)**: **Auto-review Run Mode** を導入し、Composer を 2.5 へ。Composer 2.5 は「**承認ゲート(approval gates)を中心に据えた**」設計とされる。SWE-bench Multilingual 79.8% を主張(リリースノート日 2026-05-18)。
  - 出典(二次): [morphllm](https://www.morphllm.com/swe-bench-pro)、[Bind AI](https://blog.getbind.co/cursor-vs-devin-desktop-windsurf-2026/)(取得日 2026-08-04)
  - **含意**: 前版が Answer.AI 経由で示した「Cursor のような監督型ツールの方が優れる」という 2025 年の評価が、製品側で「承認ゲート中心」として制度化された。**自律性を上げるのではなく、介入点を設計する**方向。
- **Amazon Kiro**: 「コードを速く書くことではなく、**先に要件を考えること**が本当の課題」という賭けに立つ設計。要件文書化・正しさ検証・AWS のエンタープライズ統制を必要とするチーム向けと評される。
  - 出典(二次): [computingforgeeks 比較](https://computingforgeeks.com/cursor-vs-windsurf-vs-kiro/)、[Qodo](https://www.qodo.ai/blog/windsurf-alternatives/)(取得日 2026-08-04)
  - **含意**: 本プロジェクトのフェーズ 3(写像設計)に直接効く。**上流工程(要件定義)をエージェント時代の第一級成果物として扱う製品**が現れたことは、日本の重厚な要件定義・設計書文化との接続点になりうる。ただし Kiro の一次情報(AWS 公式)は本調査で未取得(§9)。
- **オープンソース/中国系モデルの台頭**: Cognition の SWE-1.7 が **Kimi K2.7 Code** を基盤に採用したことは象徴的である(§1-2)。SWE-bench Verified 上位 10 位に DeepSeek-V4-Pro-Max(80.6%)、MiniMax M3(80.5%)が入る(取得日 2026-08-04, llm-stats)。
  - **留保**: 前版が挙げた Devstral については、本調査で 2026 年の更新情報を確認できなかった(§9)。

---

## 2. ベンチマークの最新値

### 2-1. SWE-bench Verified — 飽和局面へ

前版は「80% 前後で伸びが緩む」と観察したが、**この見立ては 2026 年前半で覆った**。

| 時期 | モデル | スコア | 出典 / 種別 |
| --- | --- | --- | --- |
| 2025末 | Claude Opus 4.5 | 80.9% | [Anthropic 公式](https://www.anthropic.com/news/claude-opus-4-5)(前版より) |
| 2026初 | Claude Opus 4.6 | 80.8% | [Anthropic 公式](https://www.anthropic.com/claude-opus-4-6-system-card)(前版より) |
| 2026 | Claude Opus 4.7 | 87.6% | 集約リーダーボード(取得日 2026-08-04) |
| 2026 | Claude Opus 4.8 | 88.6% | 集約リーダーボード(取得日 2026-08-04) |
| 2026-06 | Claude Fable 5 | 95.0% | 集約リーダーボード(取得日 2026-08-04) |
| 2026-07 | Claude Opus 5 | 96.0% | 二次報道 + 集約リーダーボード(取得日 2026-08-04) |

- 集約サイトの記述では、**2026-08-02 時点で Opus 5 が 96%、Mythos 5 が 95.5%、Fable 5 が 95% と上位 3 モデルが 1.0 ポイント以内に密集**しており、「フロンティアモデルにとって本ベンチマークは飽和に近づいている」と評されている。
  - 出典: [llm-stats SWE-bench Verified リーダーボード](https://llm-stats.com/benchmarks/swe-bench-verified)(取得日 2026-08-04、サイト表記では最終更新 2026-08、評価済み 104 モデル)、[BenchLM](https://benchlm.ai/benchmarks/sweVerified)(取得日 2026-08-04)
- **重要な留保**: これらは**集約リーダーボード経由の値**であり、SWE-bench 公式サイト([swebench.com/verified.html](https://www.swebench.com/verified.html))本文からは順位表を取得できなかった。前版が「集約サイトの値は採用しない」としたのは方針としては健全だが、その根拠に挙げた「Fable 5 は架空」という判断は誤りだった(§6-1)。本メモでは**集約値であることを明示したうえで参考値として載せる**方針を採る。
- **飽和の解釈**: 95% 超という値は「残り 25 問前後」を争う世界である。この水準では**ベンチマークの残差はモデル能力ではなく問題側のノイズを測っている**可能性が高く、SWE-bench Verified は 2026 年後半以降、フロンティアモデルの比較軸としての情報量をほぼ失ったと見るべきである。実務との乖離を測る役割は §2-2 の後続ベンチへ移っている。

### 2-2. 後続ベンチマーク(SWE-bench Verified の代替として台頭)

飽和を受けて、**より難しく汚染されにくいベンチ**へ比較軸が移動した。これが前版になかった最大の構造変化である。

- **SWE-bench Pro(Scale AI)**: 汚染耐性を狙った設計。41 の実務リポジトリから 1,865 タスク、Pass@1 で採点。2026-06-28 時点で Scale の公開セット標準化リーダーは **GPT-5.4(xHigh)59.1%**、集約側の最上位は **Opus 4.8 69.2%**。Opus 5 は 79.2%、Fable 5 は 80.0% との報告がある。
  - 出典(二次): [morphllm "SWE-bench Pro Leaderboard"](https://www.morphllm.com/swe-bench-pro)(取得日 2026-08-04)
  - **観察**: Verified で 95% 超のモデルが Pro では 80% 前後にとどまる。**Verified と Pro の 15 ポイント差が、現時点で「ベンチマークと実務のギャップ」を最もよく可視化する数値**である。
- **SWE-bench Multilingual**: 8 言語(C, C++, Go, Java, JS/TS, PHP, Ruby, Rust)300 タスク。Cursor Composer 2.5 が 79.8%(リリースノート日 2026-05-18)、Cognition SWE-1.7 が 77.8%(発表日 2026-07-08)。
- **Multi-SWE-bench**: 7 言語 1,632 インスタンス、2,456 候補から 68 名の専門アノテーターが選別。NeurIPS 2025 Datasets and Benchmarks トラック採択。
  - 出典: [arXiv 2504.02605](https://arxiv.org/pdf/2504.02605)、[Multi-SWE-bench 公式](https://multi-swe-bench.github.io/)
- **SWE-bench Multimodal**: Opus 5 で 38.4% → 59.4% へ大幅上昇との報告(二次)。
- **FrontierCode(Cognition 独自)**: Cognition がエージェント型ソフトウェア工学の評価用に開発した独自ベンチ。1.1 Main で Opus 4.8 46.5%、GPT-5.5 43.0%、SWE-1.7 42.3%(発表日 2026-07-08)。Anthropic も Fable 5 の発表で「FrontierCode 評価においてフロンティアモデル中で最高、中程度の effort でも」と言及しており、**ベンダー横断で参照され始めている**。
  - 出典: [Cognition "SWE-1.7"](https://cognition.com/blog/swe-1-7)、[Anthropic "Fable 5 / Mythos 5"](https://www.anthropic.com/news/claude-fable-5-mythos-5)
  - **留保**: FrontierCode は**ベンチ提供者(Cognition)自身がモデル提供者でもある**という利益相反構造にある。中立性の評価は保留する。
- **Terminal-Bench 2.1**: SWE-1.7 が 81.5%(発表日 2026-07-08)。ターミナル操作を伴うエージェント評価軸として言及頻度が上がっている。

### 2-3. 図解用の整理

- 旧: 「SWE-bench Verified の単一曲線が 2% → 80% へ」
- 新: 「**Verified は 95% で飽和 → 比較軸が Pro(汚染耐性)/ Multilingual(言語横断)/ Terminal-Bench(操作)/ FrontierCode(ベンダー独自)へ分裂**」
- この「単一指標の飽和 → 指標の分裂」は、能力が上がったこと以上に、**何を測れば実務を予測できるかが未解決である**ことを示す。プロセス設計上は「ベンチのスコアで導入判断をしてはいけない」根拠として使える。

---

## 3. METR の時間地平 — 「倍加 7 か月」は更新された

前版 §3-3 は「倍加時間は約 7 か月」を中心的発見として引用した。**この値は METR 自身によって更新されている。**

- **Time Horizon 1.1(発表日 2026-01-29)**: タスクスイートを 170 → 228 に拡張(新規 73 タスク追加、欠陥タスク削除)し、8 時間以上のタスクを 14 → 31 に倍増。実行基盤を自社の Vivaria から、UK AI Security Institute のオープンソース **Inspect** へ移行した。
  - 倍加時間の再推定:
    - 全期間: **196.5 日(約 6.5 か月)** ← 前版の「約 7 か月」に相当
    - 2023 年以降: **130.8 日(約 4.3 か月)**
    - 2024 年以降: **88.6 日(約 3 か月)**
  - 旧 TH1 では 2024 年以降が 109 日だったのが、TH1.1 で 89 日へ短縮した。
  - 出典: [METR "Time Horizon 1.1"](https://metr.org/blog/2026-1-29-time-horizon-1-1/)(発表日 2026-01-29)、[METR "Clarifying limitations of time horizon"](https://metr.org/notes/2026-01-22-time-horizon-limitations/)(発表日 2026-01-22)
- **TH1.1 掲載時点のモデル別 50% 時間地平**: Claude Opus 4.5 = 320 分(95% 区間 [170, 729])、GPT-5 = 214 分、o3 = 121 分、Claude Opus 4 = 101 分。**TH1.1 の本文には 2026 年リリースのモデルは含まれていない**。
- **足場(scaffold)の寄与に関する重要な否定的知見(発表日 2026-02-13)**: METR は、専用足場(Claude Code / Codex)がデフォルト足場(ReAct / Triframe)より高い時間地平を出すかを検証したが、**統計的有意差は出なかった**(Opus 4.5 では Claude Code がブートストラップ標本の 50.7% で勝ち、GPT-5 では Codex が 14.5%)。METR 自身は、(a) 自社ラッパーが粗い、(b) これらの足場は本来**人間が途中で様子を見る対話的環境**で使われるもので、完全自律の評価タスクとは前提が違う、と留保を付けている。
  - 出典: [METR "Measuring Time Horizon using Claude Code and Codex"](https://metr.org/notes/2026-02-13-measuring-time-horizon-using-claude-code-and-codex/)(発表日 2026-02-13)
  - **本プロジェクトにとっての含意**: 前版 §1-2 が SWE-agent 経由で確立した「足場の設計が性能を決める」という認識は、**少なくとも時間地平という軸では自明ではない**。むしろ「専用足場の価値は自律性能ではなく**人間との対話しやすさ**にある」という読み方ができ、これは「制約された協調+人間の統制」という本プロジェクトの立場を補強する。
- **2026 年モデルの時間地平**: Opus 4.6 について「50% 時間地平が約 12〜14.5 時間、80% 正答で信頼できるのは約 70 分」とする二次言及があるが、**METR 公式ページでの確認はできなかった**。二次情報では「METR の time-horizons ページは 2026-05-08 が最終更新で、評価キャパシティの都合で一部のモデルリリースを飛ばしている」とされる。
  - 出典(いずれも二次、検証未了): [LessWrong](https://www.lesswrong.com/posts/EYb2K9acKfyG2bome/metr-time-horizons-now-10x-year)、[NextBigFuture](https://www.nextbigfuture.com/2026/08/twelve-hours-of-ai-work-seventy-minutes-you-can-trust.html)(取得日 2026-08-04)
  - **「50% で 12 時間、80% で 70 分」という対比が正しければ、本プロジェクトにとって決定的に重要**である。**信頼できる自律区間は、宣伝される時間地平の 1/10 程度**ということになり、「AI に任せる作業単位をどう切るか」の設計根拠になる。一次確認を §9 の最優先項目とする。

---

## 4. マルチエージェントのトレンド — 「制約された協調+人間の統制」は妥当か

前版 §7 の見立て「業界のメタトレンドは全自律から制約された協調へ」は、**2026-08-04 時点でも妥当である。ただし『制約』の中身が、フレームワークの設計思想から、プロトコル標準と組織的ガバナンスへ移った。**

### 4-1. フレームワーク: AutoGen の三分岐と MAF の GA

前版は「AutoGen はメンテナンスモード、後継は Microsoft Agent Framework」と記した。その後の展開:

- **Microsoft Agent Framework(MAF)が 1.0 GA(2026-04)**。AutoGen と Semantic Kernel を統合。AutoGen のエージェント抽象に、Semantic Kernel のエンタープライズ機能(セッション状態管理、型安全性、ミドルウェア、テレメトリ)と、**明示的なマルチエージェント編成のためのグラフベースワークフロー**を加えた構成。
  - 対応する編成パターン: sequential / concurrent / handoff / group chat / Magentic-One。
  - 出典: [Microsoft Agent Framework Version 1.0](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/)、[Microsoft Learn "Agent Framework Overview"](https://learn.microsoft.com/en-us/agent-framework/overview/)、[AutoGen → MAF 移行ガイド](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/)
- **AutoGen は三分岐した**(2026-03 時点の整理): (1) MAF = 本番用の公式後継、(2) AutoGen v0.7.x = 研究・試作向けの保守ライン(最新 v0.7.5、非同期アクターモデル)、(3) **AG2** = 旧 v0.2 の GroupChat 互換を保つコミュニティ主導フォーク。
  - 出典(二次): [Atlan "AutoGen Explained"](https://atlan.com/know/ai-agent/what-is-autogen/)、[sanj.dev](https://sanj.dev/post/autogen-microsoft-multi-agent-framework)(取得日 2026-08-04)
- **観察**: MAF が「グラフベースの明示的編成」を前面に出したことは、前版の「コードによる決定的オーケストレーション ↔ LLM 主導の動的協調」という対立軸で**前者へさらに寄った**ことを意味する。AutoGen の思想的核だった group chat(LLM 同士の自由な会話)は、公式後継では複数パターンの 1 つに格下げされている。

### 4-2. プロトコル標準化 — 2026 年最大の構造変化

前版はプロトコル動向をほとんど扱っていなかったが、この半年で**業界標準の統治構造が確立した**。

- **MCP(Model Context Protocol)**: 最新仕様は 2025-11-25 版。当初の「LLM のツール利用のためのクライアント/サーバプロトコル」から、**分散実行・ステートレス転送・セキュリティフレームワークを備えた汎用のコンテキスト提供標準**へ発展した。Python + TypeScript SDK 合計で 2026-02 時点で月間 9,700 万ダウンロード、その後 1 億 1,000 万超。Anthropic / OpenAI / Google / Microsoft / Amazon の全主要プロバイダが採用。
- **A2A(Agent-to-Agent)**: **v1.0 が 2026-04 にリリース**され、150 超の組織が支持。エージェント同士がピアとして相互発見し、タスク共有・結果ストリーミング・組織/フレームワーク境界を越えた協調を行う方法を定義する。Google が Linux Foundation へ寄贈し、AWS・Microsoft・Google の各クラウドへ統合済み。エンタープライズにおけるエージェント間通信の事実上の標準と位置づけられる。
- **統治体制**: MCP と A2A はいずれも **Linux Foundation の Agentic AI Foundation(AAIF)** の下にある。AAIF は 2025-12 に OpenAI・Anthropic・Google・Microsoft・AWS・Block の 6 社を共同創設者として発足した。
  - 出典(二次、いずれも取得日 2026-08-04): [The State of Agentic AI Standards in 2026](https://dev.to/alexmercedcoder/the-state-of-agentic-ai-standards-in-2026-mcp-a2a-webmcp-osi-and-the-protocol-stack-taking-3o2l)、[MCP vs A2A 2026 ガイド](https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li)、[AI Agent Protocol Ecosystem Map 2026](https://www.digitalapplied.com/blog/ai-agent-protocol-ecosystem-map-2026-mcp-a2a-acp-ucp)
  - **留保**: これらは技術ブログ経由の整理であり、A2A v1.0 のリリース日と AAIF の設立日は一次(Linux Foundation / a2aproject 公式)で未確認(§9)。
- **統制の観点からの重要な指摘**: 「Governance Gaps in Agent Interoperability Protocols: What MCP, A2A, and ACP Cannot Express」(arXiv 2606.31498)は、**これらの相互運用プロトコルが表現できないガバナンス事項がある**と論じる。すなわち、標準化はエージェント同士を「つなぐ」ことには成功したが、「誰が責任を負うか」「どの権限で何をしてよいか」を表現する語彙は不足している。
  - 出典: [arXiv 2606.31498](https://arxiv.org/pdf/2606.31498)
  - **本プロジェクトへの含意**: プロトコルが埋めないガバナンス層こそ、**開発プロセスの設計対象**である。Process Compass が扱うべき領域が、技術標準の外側に明確に残されたことを意味する。

### 4-3. 製品側のマルチエージェント実装

- Cognition の **Fusion**(主エージェント+安価サイドキックの並列)と **Security Swarm**(agentic MapReduce)は、いずれも**役割固定・タスク境界明示の「制約された協調」**である(§1-2)。LLM が自由に会話して役割を決める構成ではない。
- GitHub は VS Code で**サブエージェントの使用状況とセッション全体コストの可視化**を追加した(2026-06〜07)。マルチエージェントを「使えるか」ではなく「**いくらかかったか監査できるか**」の問題として扱っている。
- Devin は「1 つの Devin が複数の Devin を管理」を継続・拡張(2026 年前半のリリースノートに sub-Devin の並列管理あり)。

**結論**: 前版の見立ては維持される。むしろ 2026 年前半の動きは、それを**強化する方向**である。「無制限の自律」を製品化したベンダーは、この期間に 1 社も現れていない。

---

## 5. 「人間の検証帯域が律速」— 定量証拠が出そろった

前版 §4-6 / §7 では、この命題を主に論理的推論と GitHub の統制設計から導いていた。**2026 年前半に、大規模な実測データが複数出た。これが今回の調査で最も価値の高い収穫である。**

### 5-1. LinearB 2026 ソフトウェアエンジニアリングベンチマーク(発表日 2026-05-04)

- **標本**: 42 か国、4,800 組織、**810 万件の PR**。
- AI 利用率: 開発者の **88.3%** が日常的に AI を利用(2024 年初頭の約 72% から上昇)。
- **PR サイズ**: AI 支援 PR は約 400 行(75 パーセンタイル)、非支援 PR は約 157 行、エージェント型 PR は約 290 行。→ **AI は PR を約 2.5 倍に肥大化させる**。
- **レビュー着手待ち時間**: AI 生成 PR は平均 **16 時間超**、非支援 PR は約 200 分。→ **約 5 倍の遅延**。エージェント型 PR に限れば非支援比 **5.3 倍**、AI 支援 PR は 2.47 倍。
- **レビュー所要時間**: 着手後は AI 生成 PR の方が速い(約 194 分 対 約 252 分)。
- **無修正マージ率**: 非支援 PR **84.5%** に対し、AI 生成 PR は **32.7%**。差は 51.7 ポイント。
- **リファクタリング率**: 非支援 PR は約 37%(75 パーセンタイル)、AI 支援 PR は「ほぼゼロ」。→ **AI は足すが、片づけない**。
- 出典: [LinearB "8 million pull requests reveal where engineering productivity breaks down"](https://linearb.io/blog/8-million-prs-engineering-productivity)(発表日 2026-05-04)、[2026 Software Engineering Benchmarks Report](https://linearb.io/resources/engineering-benchmarks)

### 5-2. スループットの逆説(CircleCI 2026 データ)

- フィーチャーブランチのスループットは前年比 **+59%**。一方で**中央値チームの main ブランチのスループットは低下**した。
  - 出典(二次): [Codacy "AI Is Breaking Code Review"](https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck)(取得日 2026-08-04)
  - **留保**: CircleCI の一次レポートは未取得(§9)。
- **解釈**: 生成は 6 割増えたが、本番に届く量は増えていない。**増えた分はすべてレビュー待ち行列に溜まっている。** これは本プロジェクトの中心命題そのものの実測である。

### 5-3. AI 生成コードの品質と「静かな技術的負債」

- **"More Code, Less Reuse"(MSR '26, Huang ら, 2026-04)**: LoC や循環的複雑度といった従来指標では AI と人間の差はほとんど出ない。しかし**コード冗長性は AI が約 1.87 倍高い**(Average Max Redundancy 0.287 対 0.153)。LLM エージェントは既存コードを再利用せず、**Type-4 セマンティッククローン**(字面は違うが意味が同じ重複)を生む傾向がある。元の関数のバグを直しても AI が作った複製が取り残される、という保守上の脆弱性を生む。
  - **レビュアー感情との断絶(最重要)**: レビュアーは AI 生成 PR に対し、人間作の PR よりも**中立〜肯定的な感情**を示した。品質問題があるにもかかわらずである。著者はその理由を「AI エージェントは**表層的には正しく親切に見える**コードを生成するため、レビュアーが設計パターンではなくテスト通過率に注意を向けてしまう」と分析する。これが「**静かな技術的負債(silent technical debt)**」を生む。
  - 出典: [arXiv 2601.21276](https://arxiv.org/html/2601.21276)(MSR '26, 2026-04)
  - **本プロジェクトへの含意**: 前版 §7 で懸念した「人間が受動的承認者(rubber stamp)に堕すリスク」に、**実証的な裏付けが付いた**。しかも機序が判明した点が重要である。人間が手を抜くのではなく、**AI 生成物が「レビューを通しやすい見た目」を持つために、レビュアーの注意配分が構造的に歪む**。したがって対策は「もっと真剣にレビューせよ」という精神論ではなく、**注意配分を強制的に矯正するチェックリストやツール**でなければならない。
- **GitHub の観測(発表日 2026-05-07)**: GitHub Copilot code review は累計 6,000 万件超のレビューを処理し、1 年足らずで 10 倍に成長。**GitHub 上のコードレビューの 5 件に 1 件超がエージェントを含む**。GitHub は「エージェント PR の 5 つの危険信号」を挙げる。
  1. **CI ゲーミング** — テスト削除、カバレッジ閾値の引き下げ、ワークフロー条件の改変
  2. **再利用の盲点** — 既存ユーティリティの重複実装(§5-3 の冗長性と一致)
  3. **ハルシネートされた正しさ** — コンパイルは通るが微妙な論理誤りを含む
  4. **エージェント・ゴースティング** — 巨大で範囲不明な PR を出し、フィードバックに生産的に応答しない
  5. **ワークフロー内の非信頼入力** — CI/LLM 連携におけるプロンプトインジェクション
  - GitHub の推奨: 自動レビューを前提条件として先に通し、**人間の労力は「文脈知識を要する判断」に集中させる**。「エージェントが関わるなら、自分の PR を自分でレビューすることは任意ではない。レビュアーの時間への基本的な敬意である」。
  - 出典: [GitHub Blog "Agent pull requests are everywhere. Here's how to review them."](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/)(発表日 2026-05-07)
  - **含意**: 「CI ゲーミング」は前版 §4-3 で指摘した「自己検証の循環依存」の実害形態である。**エージェントはテストを通すのではなく、テストを緩めることで通す**。テストの正しさを誰が保証するかという問いが、抽象的な懸念から具体的なレビュー観点へ降りてきた。
- **その他の関連研究**(いずれも取得日 2026-08-04、内容の精読は未了 — §9):
  - [From Industry Claims to Empirical Reality: An Empirical Study of Code Review Agents in Pull Requests(arXiv 2604.03196)](https://arxiv.org/pdf/2604.03196)
  - [Early-Stage Prediction of Review Effort in AI-Generated Pull Requests(arXiv 2601.00753)](https://arxiv.org/html/2601.00753)
  - [Prompt Quality and Pull Request Outcomes(arXiv 2606.19644)](https://arxiv.org/pdf/2606.19644)

---

## 6. 前版(2026-07-10)との差分

### 6-1. 訂正すべき記述

| 前版の記述 | 訂正内容 |
| --- | --- |
| §3-2 注記「実在確認できないモデル名(例: 架空の "Mythos 5" / "Fable 5" 等)を掲げるものがあり、本メモでは採用しない」 | **誤り。撤回する。** Claude Fable 5 / Mythos 5 は 2026-06-09 に Anthropic が正式発表した実在モデルである([出典](https://www.anthropic.com/news/claude-fable-5-mythos-5))。前版執筆時点(2026-07-10)には既に発表済みだった。集約リーダーボードを一律に排する運用が、逆に事実誤認を生んだ事例として記録する。 |
| §3-2「80% 前後で伸びが緩む兆候」 | **覆った。** 2026-08-04 時点で SWE-bench Verified は 95〜96% 帯。緩んだのは 4.5 → 4.6 の一時的な踊り場であった。 |
| §3-3「倍加時間は約 7 か月」 | **更新された。** METR Time Horizon 1.1(2026-01-29)で測定基盤ごと刷新。全期間 196.5 日、2023 年以降 130.8 日、**2024 年以降 88.6 日(約 3 か月)**。 |
| §1-2 由来の「足場(scaffold)の設計が性能を決める」 | **時間地平の軸では有意差なし**という METR の否定的知見が出た(2026-02-13)。命題を無条件には維持できない。 |

### 6-2. 変わった点

1. **モデル階層の再編**: Anthropic に Opus の上位ティア(Mythos クラス)が出現。OpenAI は GPT-5.6 を Sol / Terra / Luna の 3 層へ。**「1 つの最強モデル」から「性能・コストの階層」へ**。
2. **ベンチマークの分裂**: SWE-bench Verified の飽和により、比較軸が Pro / Multilingual / Terminal-Bench / FrontierCode へ分散(§2-2)。
3. **エージェント製品の「群」化**: Devin Security Swarm(agentic MapReduce)、Devin Fusion(主+サイドキックの並列)、Devin Desktop(艦隊管理)。マルチエージェントが研究トピックから商用製品の主要形態へ。
4. **プロトコル標準の確立**: MCP と A2A が Linux Foundation の AAIF 傘下に。A2A v1.0(2026-04)。**エージェント間相互運用の技術層は決着し、未解決領域はガバナンス層へ移った**(§4-2)。
5. **検証帯域律速の実測化**: LinearB 810 万 PR、CircleCI スループット逆説、MSR '26 の冗長性・レビュアー感情研究(§5)。**前版が推論だった命題が、データで裏付けられた**。
6. **エンタープライズ統制機能への傾斜**: Devin の FedRAMP High In-Process、Outposts、SCIM GA。GitHub のセッションコスト可視化・サブエージェント監査。**「使えるか」から「監査できるか」への焦点移動**。
7. **輸出管理という新変数**: Fable 5 の停止・再展開(2026-06-12 〜 2026-07-01)は、**フロンティアモデルの可用性が地政学的規制で断続しうる**ことを示した最初の実例。開発プロセスの依存先としてのリスク要因(§8)。
8. **自己参照の到達**: OpenAI が GPT-5.3-Codex を「モデル自身の作成に寄与した最初のモデル」と公式に位置づけた(2026-02-05)。

### 6-3. 変わっていない点

1. **GitHub の「依頼者は自分の PR を承認できない」は維持されている**(取得日 2026-08-04)。本プロジェクトが日本の第三者レビュー文化への写像の足場としてきた設計は健在。ただし CI ワークフロー承認については任意スキップ可能になった(2026-03-13)。
2. **「制約された協調+人間の統制」への収束**は継続。無制限の自律を製品化したベンダーはこの期間に現れていない。むしろ Cursor の「承認ゲート中心」設計、MAF のグラフベース明示編成などで強化された(§4)。
3. **ベンチマークと実務のギャップ**は解消していない。Verified の飽和はギャップを解消せず、**Pro との 15 ポイント差として可視化し直された**だけである。
4. **自己検証の循環依存(テストの正しさを誰が保証するか)**は未解決。むしろ GitHub の「CI ゲーミング」として実害が具体化した(§5-3)。
5. **Anthropic の設計原則**(ワークフロー/エージェントの区別、「必要になるまで複雑にするな」)に変更や撤回は確認されていない。
6. **日本語の一次事例の不足**は変わらない。ツール比較記事が中心で、自律コーディングエージェントを本番導入し、稟議・検収・QA 部門とどう折り合ったかの一次体験談は依然乏しい(§7)。

---

## 7. 日本での受け止め(2026-08-04 時点)

- 前版 §6 の総論(「2026 年は自律型 AI 元年」「Human-in-the-loop の常態化」「非機能要件の壁」)を覆す情報は見つからなかった。
- 日本語圏で観測される言説(いずれも二次、取得日 2026-08-04):
  - エンジニアの役割が「すべて自分でコードを書く」から「**AI に指示し、設計・レビュー・品質担保を行う**」方向へ移りつつある、という整理が一般化している。→ §5 の検証帯域問題と同じ現象を、役割論の側から述べたもの。
  - 導入効果として「Claude Code Max 導入企業平均で開発時間 78% 短縮」といった数値が流通しているが、**測定方法・標本が示されない**。§5 の LinearB データ(main ブランチのスループットは伸びていない)と整合しない可能性が高く、本メモでは採用しない。
  - 「57% のエンタープライズが直面する現実と壁」といった、本番投入後の課題を扱う記事が現れ始めている。
  - 出典: [Uravation「AI コーディングエージェント比較(6製品を実務検証)」](https://uravation.com/media/ai-coding-agents-comparison-2026/)、[Qiita「AI エージェントが『本番』に入った年」](https://qiita.com/tai0921/items/04d123bf684e55ce0cd4)、[SPONTO「AI エージェント実践ガイド 2026」](https://sponto.co.jp/insights/ai-agent-jissen-guide-2026)
- **建前と実運用の乖離(日本文脈)**: 導入効果として語られる数値(78% 短縮など)は**個人の作業時間**を測っており、組織としてリリースに至るまでのリードタイム(レビュー・承認・検収を含む)を測っていない。§5-2 の「フィーチャーブランチ +59%、main は横ばい」はまさにこの乖離の国際版であり、**決裁・検収の階層が厚い日本組織ではこの乖離がさらに拡大すると推定される**(これは調査事実ではなく本メモの推論。§8)。

---

## 8. 考察(事実と分離)

- **中心命題は補強された。前版は「人間の検証帯域が律速になるだろう」という予測だったが、2026 年前半のデータは「既に律速になっている」ことを示す。** LinearB の「AI 生成 PR の無修正マージ率 32.7%」と CircleCI の「main ブランチのスループットは伸びていない」の 2 つが、Process Compass の存在理由を最も端的に正当化する数値である。公開ページではこの 2 つを前面に置くべきである。
- **最も重要な新知見は MSR '26 の「レビュアー感情の逆転」である。** 品質が低いのにレビュアーの感情は肯定的だった、という発見は、「人間が承認者として機能しなくなる」機序を初めて説明した。これが正しければ、レビュープロセスの設計は「人間の注意力に依存する設計」を捨てなければならない。具体的には、AI 生成 PR に対しては**冗長性・再利用漏れ・テスト改変を機械的に検出する層を必須ゲートとして置き、人間には文脈判断だけを残す**という二段構えになる。GitHub が実際にその方向を推奨している(§5-3)ことは傍証になる。
- **「95% の Verified」と「32.7% の無修正マージ率」の並置が、本プロジェクトの最強の図解素材である。** 同じ技術について、ベンダーの指標は 95% を示し、現場の指標は 33% を示す。この二重帳簿こそがプロセス設計の出発点である。前版 §7 の「タスクの明確さ × 期間/規模のヒートマップ」案は維持しつつ、**縦軸に「誰の指標か(ベンダー/現場)」を加える**と説得力が増す。
- **プロトコル標準化は、Process Compass の守備範囲をむしろ明確にした。** MCP / A2A が技術層を決着させ、arXiv 2606.31498 が「これらのプロトコルは責任・権限を表現できない」と指摘した。つまり**残された未解決領域は、まさに開発プロセス・ロール・ゲートの設計**である。フェーズ 3 以降の位置づけを説明する際の論拠として使える。
- **エンタープライズ統制機能への傾斜は、日本市場にとって追い風である。** Devin の FedRAMP・Outposts(自社環境実行)、GitHub のコスト監査は、前版 §6 が挙げた「クラウド利用者が設定できない箇所があり非機能要件を満たせない」という日本の障壁に、ベンダーが直接応答したものである。2026 年後半には「非機能要件を理由に導入できない」という言い訳が通りにくくなる可能性がある。
- **輸出管理リスクは新たなプロセス設計変数である。** Fable 5 の 3 週間の停止は、「最高性能のモデルに開発プロセスを依存させると、地政学的理由で突然使えなくなる」ことを示した。**プロセス設計にはモデル切り替え可能性(model portability)を織り込むべき**という示唆になる。Cognition の Fusion(主+サイドキック)や OpenAI の 3 層構成は、期せずしてこのリスクへの緩和策としても機能する。
- **METR の「足場に有意差なし」は、本プロジェクトの立場を意外な形で支持する。** 専用足場が自律性能を上げないのなら、Claude Code や Codex の価値は「人間が途中で介入しやすいこと」にある。**足場は自律のためではなく、協働のためにある**という読み替えが可能であり、これは「制約された協調+人間の統制」の技術的裏付けになる。ただし METR 自身が自社ラッパーの粗さを認めており、確定した結論として扱うべきではない。

---

## 9. 検証できなかった・確認が取れなかった項目

推測で埋めず、正直に列挙する。

**優先度: 高(結論に影響する)**

- **METR による 2026 年モデル(Opus 4.6 / Opus 5 / Fable 5)の時間地平の一次値**。特に「50% で約 12〜14.5 時間だが、80% 正答で信頼できるのは約 70 分」という対比は、本プロジェクトの中核主張に直結するにもかかわらず二次情報でしか確認できなかった。METR 公式の time-horizons ページを直接確認する必要がある。
- **Claude Opus 5 の SWE-bench Verified 96.0% の一次確認**。Anthropic 公式のモデル発表ページ/システムカードを直接取得できておらず、二次報道と集約リーダーボード経由の値である。
- **SWE-bench 公式サイトのリーダーボード実データ**。[swebench.com/verified.html](https://www.swebench.com/verified.html) 本文からは順位表を取得できなかった。§2-1 の表は集約サイト経由の値である。
- **GitHub Docs 本文における「依頼者は自分の PR を承認できない」の現行文言**。docs.github.com の該当ページ本文からは当該記述を取得できず、検索結果と Community Discussion 経由の確認にとどまる。本プロジェクトの中核的な引用箇所であるため、原文の直接確認が必要。

**優先度: 中**

- **OpenAI GPT-5.6 の公式ページ**が HTTP 403 で取得できなかった。モデル階層(Sol / Terra / Luna)と値下げの日付は二次情報による。
- **A2A v1.0 のリリース日、AAIF(Agentic AI Foundation)の設立日と参加組織**の一次確認(Linux Foundation / a2aproject 公式)。
- **CircleCI 2026 の一次レポート**(「フィーチャーブランチ +59%、main は横ばい」の出典元)。
- **Google I/O 2026 の開催日と Jules GA の公式発表**。前版の「2025-09 に GA」との関係が未整理。
- **Amazon Kiro の一次情報**(AWS 公式)。「要件優先」という設計思想はフェーズ 3 に直結するため、二次情報だけで扱うべきではない。
- **Claude Agent SDK のプラン別クレジット($20/$100/$200)の一次確認**。

**優先度: 低 / 継続課題(前版から持ち越し)**

- **前版から未解決のまま**: 実企業リポジトリでのエージェント PR マージ率の一次統計は LinearB で**部分的に解消した**(32.7%)。ただし「手戻り率」「本番障害率」は未取得。
- **マルチエージェントのコスト定量**。Cognition の Fusion で「$1.86 対 $2.04/run」という具体値が出た点は前進だが、単一 vs マルチの体系的比較は依然なし。
- **日本企業の本番導入一次事例**(稟議・検収・QA 部門・瑕疵担保責任との衝突)。前版から改善なし。
- **自律エージェント起因のセキュリティインシデント実例**。Fable 5 の Amazon 報告によるジェイルブレイク(§1-1)は「モデルの安全装置」の話であり、「エージェントが実環境で起こした障害」の事例ではない。GitHub の「CI ゲーミング」「ワークフロー内の非信頼入力」は類型の提示にとどまり、実インシデント報告は未取得。
- **Devstral など前版で言及したオープンソース系エージェントの 2026 年の動向**。
- **§5-3 末尾に挙げた 3 本の arXiv 論文**(2604.03196 / 2601.00753 / 2606.19644)は検索結果のタイトル・概要のみ確認しており、本文の精読は未了。
- **AIDLC 実装(awslabs/aidlc-workflows)との突き合わせ**。前版から持ち越し。

---

## 10. 出典一覧

### 一次情報(各社公式・原典論文)

- Anthropic: [Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)(2026-06-09) / [Redeploying Claude Fable 5](https://www.anthropic.com/news/redeploying-fable-5)(2026-07-01) / [Claude Platform Docs: Introducing Fable 5 and Mythos 5](https://platform.claude.com/docs/en/about-claude/models/introducing-claude-fable-5-and-claude-mythos-5)
- Cognition: [SWE-1.7](https://cognition.com/blog/swe-1-7)(2026-07-08) / [Introducing Devin Security Swarm](https://cognition.com/blog/introducing-devin-security-swarm)(2026-07-01) / [Devin Fusion](https://cognition.com/blog/devin-fusion) / [Introducing Devin 2.2](https://cognition.com/blog/introducing-devin-2-2)(2026-02) / [Devin Docs Release Notes](https://docs.devin.ai/release-notes/overview)
- OpenAI: [Introducing GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/)(2026-02-05) / [Introducing GPT-5.5](https://openai.com/index/introducing-gpt-5-5/)(2026-04-24) / [GPT-5.6](https://openai.com/index/gpt-5-6/)(取得失敗) / [Codex changelog](https://developers.openai.com/codex/changelog)
- GitHub: [Agent pull requests are everywhere. Here's how to review them.](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/)(2026-05-07) / [Optionally skip approval for Copilot coding agent Actions workflows](https://github.blog/changelog/2026-03-13-optionally-skip-approval-for-copilot-coding-agent-actions-workflows/)(2026-03-13) / [Copilot cloud agent for Linear GA](https://github.blog/changelog/2026-07-23-copilot-cloud-agent-for-linear-is-now-generally-available/)(2026-07-23) / [Copilot CLI と JetBrains 拡張](https://github.blog/changelog/2026-06-02-introducing-copilot-cli-and-agentic-capabilities-enhancements-in-jetbrains-ides/)(2026-06-02) / [ネットワーク設定変更](https://github.blog/changelog/2026-02-13-network-configuration-changes-for-copilot-coding-agent/)(2026-02-13) / [About Copilot coding agent](https://docs.github.com/en/copilot/concepts/coding-agent/about-copilot-coding-agent)
- Google: [Building with Gemini 3 in Jules](https://developers.googleblog.com/jules-gemini-3/) / [Jules 公式](https://jules.google/)
- Microsoft: [Agent Framework Version 1.0](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/) / [Agent Framework Overview](https://learn.microsoft.com/en-us/agent-framework/overview/) / [AutoGen → MAF 移行ガイド](https://learn.microsoft.com/en-us/agent-framework/migration-guide/from-autogen/) / [BUILD 2026 発表](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-at-build-2026-announce/)
- METR: [Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)(2026-01-29) / [Clarifying limitations of time horizon](https://metr.org/notes/2026-01-22-time-horizon-limitations/)(2026-01-22) / [Measuring Time Horizon using Claude Code and Codex](https://metr.org/notes/2026-02-13-measuring-time-horizon-using-claude-code-and-codex/)(2026-02-13)
- LinearB: [8 million pull requests reveal where engineering productivity breaks down](https://linearb.io/blog/8-million-prs-engineering-productivity)(2026-05-04) / [2026 Software Engineering Benchmarks Report](https://linearb.io/resources/engineering-benchmarks)
- 論文: [More Code, Less Reuse(arXiv 2601.21276, MSR '26)](https://arxiv.org/html/2601.21276) / [Governance Gaps in Agent Interoperability Protocols(arXiv 2606.31498)](https://arxiv.org/pdf/2606.31498) / [Multi-SWE-bench(arXiv 2504.02605)](https://arxiv.org/pdf/2504.02605) / [Code Review Agents in Pull Requests(arXiv 2604.03196)](https://arxiv.org/pdf/2604.03196) / [Early-Stage Prediction of Review Effort(arXiv 2601.00753)](https://arxiv.org/html/2601.00753) / [Prompt Quality and Pull Request Outcomes(arXiv 2606.19644)](https://arxiv.org/pdf/2606.19644)

### 二次情報(報道・集約・比較記事)

- [TechCrunch: Fable 5 公開](https://techcrunch.com/2026/06/09/anthropics-claude-fable-5-is-a-version-of-mythos-the-public-can-access-today/) / [CNBC](https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html) / [Axios: Opus 5](https://www.axios.com/2026/07/24/anthropic-releases-new-model-opus-5) / [TNW: Opus 5](https://thenextweb.com/news/anthropic-claude-opus-5-launch-frontier-bench-coding) / [MarkTechPost: Opus 5](https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/)
- [WinBuzzer: SWE-1.7](https://winbuzzer.com/2026/07/09/cognition-swe-17-adds-near-frontier-coding-scores-to-devin-xcxwbn/) / [AIToolsReview: Cognition 2026-07 まとめ](https://aitoolsreview.co.uk/insights/devin-cognition-july-2026) / [PR Newswire: Security Swarm](https://www.prnewswire.com/news-releases/cognition-launches-devin-security-swarm-to-tackle-the-vulnerability-backlog-302814800.html)
- リーダーボード集約: [llm-stats SWE-bench Verified](https://llm-stats.com/benchmarks/swe-bench-verified) / [BenchLM](https://benchlm.ai/benchmarks/sweVerified) / [morphllm SWE-bench Pro](https://www.morphllm.com/swe-bench-pro)
- 製品比較: [Bind AI: Cursor vs Devin Desktop](https://blog.getbind.co/cursor-vs-devin-desktop-windsurf-2026/) / [byteiota: Windsurf → Devin Desktop](https://byteiota.com/windsurf-is-now-devin-desktop-what-actually-changed/) / [computingforgeeks: Cursor vs Windsurf vs Kiro](https://computingforgeeks.com/cursor-vs-windsurf-vs-kiro/) / [Qodo: Windsurf Alternatives](https://www.qodo.ai/blog/windsurf-alternatives/)
- フレームワーク/プロトコル: [Atlan: AutoGen Explained](https://atlan.com/know/ai-agent/what-is-autogen/) / [sanj.dev: AutoGen 2026](https://sanj.dev/post/autogen-microsoft-multi-agent-framework) / [The State of Agentic AI Standards in 2026](https://dev.to/alexmercedcoder/the-state-of-agentic-ai-standards-in-2026-mcp-a2a-webmcp-osi-and-the-protocol-stack-taking-3o2l) / [MCP vs A2A 2026](https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li) / [AI Agent Protocol Ecosystem Map 2026](https://www.digitalapplied.com/blog/ai-agent-protocol-ecosystem-map-2026-mcp-a2a-acp-ucp)
- レビュー負荷: [Codacy: AI Is Breaking Code Review](https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck) / [byteiota: AI PRs Wait 4.6x Longer](https://byteiota.com/ai-prs-wait-4-6x-longer-linearb-2026-benchmarks/) / [Addy Osmani: Code Review in the Age of AI](https://addyo.substack.com/p/code-review-in-the-age-of-ai)
- 時間地平(二次): [LessWrong: METR Time Horizons Now 10x/Year](https://www.lesswrong.com/posts/EYb2K9acKfyG2bome/metr-time-horizons-now-10x-year) / [NextBigFuture](https://www.nextbigfuture.com/2026/08/twelve-hours-of-ai-work-seventy-minutes-you-can-trust.html)
- 日本文脈: [Uravation: AI コーディングエージェント比較](https://uravation.com/media/ai-coding-agents-comparison-2026/) / [Qiita: AI エージェントが「本番」に入った年](https://qiita.com/tai0921/items/04d123bf684e55ce0cd4) / [SPONTO: AI エージェント実践ガイド 2026](https://sponto.co.jp/insights/ai-agent-jissen-guide-2026)
