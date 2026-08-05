# Graph Report - process-compass  (2026-08-04)

## Corpus Check
- 116 files · ~83,218 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1074 nodes · 1013 edges · 100 communities (93 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ff3bd36e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- スクラム(Scrum)調査メモ
- エージェント型開発の現在地 更新調査メモ(2026-08-04 時点)
- プロセス表示のスキーマ駆動化: 既存 OSS / DSL 調査
- package.json
- 日本企業のガバナンス・決裁ゲートの実態 調査メモ
- エージェント型開発(自律・マルチエージェント)の現在地 調査メモ
- process-diagrams.ts
- ドメイン駆動設計(DDD)調査メモ
- コンテキストエンジニアリング手法 調査メモ
- プロセス記述に関する国際標準の調査メモ
- プロダクトオーナー中心のチーム編成論 調査メモ
- simulator.astro
- Process Compass 🧭
- テスト駆動開発(TDD)調査メモ
- AIDLC(AI-Driven Development Life Cycle)調査メモ
- ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ
- 仕様駆動開発(SDD, Specification-Driven Development)調査メモ
- [プロセス名] 調査メモ
- jp-governance.md
- アジャイル(Agile)調査メモ
- agentic-development.md
- 各ゲートの判定チェックリスト
- content.config.ts
- review-guide.md
- requirements.md
- Process Compass
- research-framework.md
- deliverable-templates.md
- tailoring-guide.md
- 分類別の指標と警戒サイン
- 表現ポリシーの複数案検討と批評ループの記録
- phase1-current-state/overview.md
- po-centric-team.md
- 設計判断のポイント
- Claude Code 開発リポジトリとしての整備 — ディープリサーチ結果(2026-07-08)
- .github コミュニティ標準・サイト品質ゲートの整備 — リサーチ結果(2026-07-09)
- tsconfig.json
- phase1-current-state/summary.md
- aidlc-lifecycle.md
- 前提条件の一覧
- git-strategy.md
- pr-workflow.md
- 定常作業カタログ
- proposal-logic.md
- user-testing.md
- 20260710-phase1-zenn.md
- style-guide-diagrams.md
- context-engineering.md
- context-infrastructure.md
- 分析の切り口(候補)
- phase3-gap-analysis/summary.md
- ears-guide.md
- integrated-process.md
- roles-responsibilities.md
- ai-environment.md
- ci-gates.md
- context-base.md
- 台帳駆動の返却サイクル
- 画像生成ワークフロー
- Mermaid 作図規約
- セキュリティポリシー
- 作図規約の検討メモ(2026-07-08)
- generate-image.mjs
- 0001-public-adr.md
- 0002-astro-starlight.md
- 0003-dual-license.md
- 0004-research-framework.md
- 0005-ai-out-of-scope-phase1.md
- 0006-representation-policy.md
- 0007-schema-driven-process-data.md
- 0008-tailoring-rules-as-data.md
- project-management.md
- phase2-aidlc/summary.md
- insourcing-bcp.md
- role-mapping.md
- compute-strategy.md
- nonfunctional-verify.md
- improvement-cycle.md
- incident-response.md
- 03-tool-concept.md
- 日本語校正ワークフロー
- gap-map.md
- proposal-template.md
- 01-goal.md
- process-researcher.md
- 調査メモ → 公開ドキュメント清書ワークフロー
- PULL_REQUEST_TEMPLATE.md
- research/ — 調査メモ置き場
- list-image-models.mjs
- index.md
- phase2-aidlc/overview.md
- phase4-process-design/overview.md
- textlint-on-save.mjs
- contributing.md
- index.mdx
- phase5-implementation/overview.md
- phase6-operation/overview.md
- astro.config.mjs
- GEMINI.md

## God Nodes (most connected - your core abstractions)
1. `アジャイル(Agile)調査メモ` - 13 edges
2. `日本企業のガバナンス・決裁ゲートの実態 調査メモ` - 13 edges
3. `ドメイン駆動設計(DDD)調査メモ` - 12 edges
4. `ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ` - 12 edges
5. `スクラム(Scrum)調査メモ` - 12 edges
6. `テスト駆動開発(TDD)調査メモ` - 12 edges
7. `ウォーターフォール開発プロセス 調査メモ` - 12 edges
8. `AIDLC(AI-Driven Development Life Cycle)調査メモ` - 12 edges
9. `イベント駆動(Event-Driven Architecture / イベント駆動開発)調査メモ` - 12 edges
10. `仕様駆動開発(SDD, Specification-Driven Development)調査メモ` - 12 edges

## Surprising Connections (you probably didn't know these)
- `buildMarkdown()` --calls--> `visibleQuestions()`  [EXTRACTED]
  src/pages/tool/simulator.astro → src/lib/tailoring-engine.mjs

## Import Cycles
- None detected.

## Communities (100 total, 7 thin omitted)

### Community 0 - "スクラム(Scrum)調査メモ"
Cohesion: 0.05
Nodes (30): 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(process → activities → tasks), 3. roles(ロール), 4. information items(成果物・文書), 5. gates(ゲート・決裁), 6. レビュープロセス (+22 more)

### Community 1 - "エージェント型開発の現在地 更新調査メモ(2026-08-04 時点)"
Cohesion: 0.06
Nodes (32): 0. 要約: この4週間〜3か月で何が変わったか, 10. 出典一覧, 1-1. Anthropic — Mythos クラスの登場と Opus 5, 1-2. Cognition(Devin)— 自社モデル路線と「群」への転換, 1-3. OpenAI — Codex の世代交代と GPT-5.6 ファミリー, 1-4. GitHub Copilot coding agent — 統制設計は維持、範囲は拡大, 1-5. Google — Jules の GA と Gemini 3 系, 1-6. 新興・その他 (+24 more)

### Community 2 - "プロセス表示のスキーマ駆動化: 既存 OSS / DSL 調査"
Cohesion: 0.06
Nodes (35): 1. BPMN 2.0(OMG 標準)+ bpmn-js, 2. SPEM 2.0 / Eclipse Process Framework (EPF) Composer, 3. Structurizr DSL / C4 model, 4.1 Mermaid, 4.2 PlantUML, 4.3 D2, 4.4 Kroki, 4. テキスト DSL 勢(Mermaid / PlantUML / D2 / Kroki) (+27 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (34): astro, astro-mermaid, @astrojs/starlight, mermaid, dependencies, astro, astro-mermaid, @astrojs/starlight (+26 more)

### Community 4 - "日本企業のガバナンス・決裁ゲートの実態 調査メモ"
Cohesion: 0.06
Nodes (33): 0. このメモの位置づけと全体像, 10. 埋められなかった観点(追加調査項目), 11. 出典一覧, 1.1 定義と仕組み(建前), 1.2 歴史的背景, 1.3 責任分散という機能(建前と実態の核心), 1.4 デジタル化(ワークフローシステム)の現状, 1. 稟議制度(りんぎ) (+25 more)

### Community 5 - "エージェント型開発(自律・マルチエージェント)の現在地 調査メモ"
Cohesion: 0.06
Nodes (33): 0-1. エージェント型開発とは(定義の整理), 0-2. AIDLC との接続(なぜ本テーマを調べるか), 0. 概要, 1-1. Devin(Cognition), 1-2. SWE-agent(Princeton NLP), 1-3. OpenAI Codex / Operator, 1-4. GitHub Copilot coding agent, 1-5. Google Jules (+25 more)

### Community 6 - "process-diagrams.ts"
Cohesion: 0.08
Nodes (21): Activity, esc(), Gate, l1Diagram(), l2Diagram(), Phase, ADR-0006, ADR-0007 (+13 more)

### Community 7 - "ドメイン駆動設計(DDD)調査メモ"
Cohesion: 0.06
Nodes (29): 0. プロセスの概要 — DDD は「ライフサイクル」ではなく「設計手法/思想」である, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(process → activities → tasks), 3. roles(ロール), 4. information items(成果物・文書), 5. gates(ゲート・決裁), 6. レビュープロセス (+21 more)

### Community 8 - "コンテキストエンジニアリング手法 調査メモ"
Cohesion: 0.07
Nodes (30): 0. このメモの全体像, 1.1 一次定義(Anthropic), 1.2 プロンプトエンジニアリングとの違い(建前上の切り分け), 1. 定義:コンテキストエンジニアリングとは何か, 2.1 システムプロンプト・指示の設計, 2.2 Few-shot 例示(手本による誘導), 2.3 RAG(検索拡張生成)による外部知識の注入, 2.4 ステアリングファイル / ルール(プロジェクト文脈の永続化) (+22 more)

### Community 9 - "プロセス記述に関する国際標準の調査メモ"
Cohesion: 0.07
Nodes (28): 1.1 位置づけ, 1.2 プロセス記述の要素一覧, 1.3 フェーズ1調査への含意, 1. ISO/IEC/IEEE 24774:2021 — プロセス記述の仕様, 2.1 位置づけと2017年版の変更, 2.2 4プロセス群と30プロセスの一覧, 2.3 日本での展開: 共通フレーム(SLCP-JCF), 2.4 フェーズ1調査への含意 (+20 more)

### Community 10 - "プロダクトオーナー中心のチーム編成論 調査メモ"
Cohesion: 0.08
Nodes (26): 0. このメモの位置づけと全体像, 1.1 AWS AI-DLC(AI-Driven Development Life Cycle), 1.2 Sean Grove(OpenAI)「The New Code」— 仕様を書く人が最も価値ある programmer, 1.3 「Product Engineer」への収束論(everyone becomes a product owner の実像), 1. 理想像の出所(建前=そう語られる), 2.1 スクラムガイド 2020 の PO 定義(建前=原典), 2.2 「全員が PO 化する」の意味論(定義からの含意), 2. プロダクトオーナーの本来の責任(スクラムガイド=土台の定義) (+18 more)

### Community 11 - "simulator.astro"
Cohesion: 0.12
Nodes (21): integrated, kb, knownIds, optionIds, rules, evaluate(), ADR-0008, ruleMatches() (+13 more)

### Community 12 - "Process Compass 🧭"
Cohesion: 0.10
Nodes (18): 報告と執行, 帰属, 私たちの基準, 私たちの誓い, 行動規範(Code of Conduct), Pull Request のルール, コントリビューションガイド, ライセンスへの同意 (+10 more)

### Community 13 - "テスト駆動開発(TDD)調査メモ"
Cohesion: 0.10
Nodes (20): 0-0. 重要な前提: TDD は「開発ライフサイクル」ではなく「開発プラクティス/技法」である, 0-1. 基本情報, 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2-1. 3階層のズーム(nano / micro / 上位ライフサイクルとの接続), 2. 階層構造(process → activities → tasks), 3-A. 関連技法との役割拡張(TDD → ATDD/BDD) (+12 more)

### Community 14 - "AIDLC(AI-Driven Development Life Cycle)調査メモ"
Cohesion: 0.10
Nodes (21): 0-0. 本メモの位置づけ(重要), 0-1. 基本情報, 0-2. 実装(重要): 方法論とツールの2層, 0-3. 類義概念との異同(各社・各論者), 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(process → phase → activity → task) (+13 more)

### Community 15 - "ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ"
Cohesion: 0.10
Nodes (20): 0. 概要, 10. 出典一覧, 1. title / purpose / outcomes(このアンチパターン群を「観察対象」として定義), 2. 階層構造(process → activities → tasks)— Water-Scrum-Fall の典型構造, 3. アンチパターン各論(本メモの中心), 4. バランス論: ハイブリッドは必ずしも「悪」ではない, 5. gates(このアンチパターン群に固有の擬似ゲート), 6. レビュープロセス(逸脱の観点) (+12 more)

### Community 16 - "仕様駆動開発(SDD, Specification-Driven Development)調査メモ"
Cohesion: 0.11
Nodes (17): 0-0. 最重要の前提: 「SDD」という語は新旧2つの文脈で使われる, 0-1. 新しい SDD(B)の基本情報, 0-2. 位置づけの注意(粒度), 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(Process → Phase → Activity → Task), 3. roles(ロール) (+9 more)

### Community 17 - "[プロセス名] 調査メモ"
Cohesion: 0.13
Nodes (14): 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(process → activities → tasks), 3. roles(ロール), 4. information items(成果物・文書), 5. gates(ゲート・決裁), 6. レビュープロセス (+6 more)

### Community 18 - "jp-governance.md"
Cohesion: 0.13
Nodes (14): Stage-Gate と日本の決裁の構造的違い, デザインレビュー(DR)と品質保証部門, デジタル化しても構造は残る, ハイコンテキスト文化: 明文化を阻む土台, メンバーシップ型雇用とロールの曖昧さ, 仕組みと責任分散という機能, 全体像: 共通DNAは「責任の非集中」, 参考文献 (+6 more)

### Community 19 - "アジャイル(Agile)調査メモ"
Cohesion: 0.12
Nodes (17): 0. プロセスの概要, 10. 出典一覧, 1. title / purpose / outcomes, 2. 階層構造(process → activities → tasks), 2b. 傘下の主要手法の位置づけ(俯瞰), 3. roles(ロール), 4. information items(成果物・文書), 5. gates(ゲート・決裁) (+9 more)

### Community 20 - "agentic-development.md"
Cohesion: 0.15
Nodes (12): 2026年3月→8月で何が変わったか, 2026年8月時点の現在地, エージェント型開発とは, ベンチマークは飽和し、指標が分裂した, モデルは二段跳んだ(2026年6月〜7月), 主要製品の現況(2026-08-04 時点), 参考文献(主要な一次情報), 日本文脈での効きどころ (+4 more)

### Community 21 - "各ゲートの判定チェックリスト"
Cohesion: 0.15
Nodes (12): G-1 企画承認(事業決裁者・既存規程どおり), G-2 要件合意(価値責任者・48時間), G-3 技術設計判断(技術判断者・48時間), G-4 機能仕様承認(価値責任者または委譲先・24時間), G-5 自動検証 CI(機械判定・即時), G-6 独立レビュー(独立レビュア・2営業日), G-7 出荷判定(QA・3営業日), G-8 リリース決裁(事業決裁者・48時間) (+4 more)

### Community 22 - "content.config.ts"
Cohesion: 0.17
Nodes (11): ADR-0004, activitySchema, adjustmentSchema, collections, phaseSchema, processSchema, questionSchema, ruleSchema (+3 more)

### Community 23 - "review-guide.md"
Cohesion: 0.17
Nodes (11): AI をレビューに使う場合, パス1: 仕様突合(10分), パス2: 品質確認(10分), パス3: 理解(10分), レビューの目的(2つ), 実施手順: 3パス方式, 差し戻しの作法, 挙動要約の書式 (+3 more)

### Community 24 - "requirements.md"
Cohesion: 0.17
Nodes (11): シナリオ1: スタートアップの技術リード(2名・PoC), シナリオ2: 事業会社のエンジニアリングマネージャー(8名・グロース), シナリオ3: SIer のプロジェクトマネージャー(15名・受託・規制業), スコープ外(v1 では扱わない), ツールの位置づけ, 入力項目, 出力形式, 利用シナリオ (+3 more)

### Community 25 - "Process Compass"
Cohesion: 0.17
Nodes (11): Claude Code 設定(.claude/), Git 戦略, graphify, Process Compass, コマンド, プロジェクト構造, プロジェクト運営(Issue 駆動), ライセンス (+3 more)

### Community 26 - "research-framework.md"
Cohesion: 0.18
Nodes (10): 7観点との対応, スコープ外: 生成AIの現場利用実態, 参考文献, 日本的観点の補強(標準がカバーしない領域), 比較表の共通軸, 記述テンプレート: 6+2要素, 記述例(ミニサンプル), 調査の進め方 (+2 more)

### Community 27 - "deliverable-templates.md"
Cohesion: 0.18
Nodes (10): AI への指示との関係, テンプレ1: 機能仕様書(spec), テンプレ2: 判断記録(ADR), テンプレ3: 技術負債台帳, テンプレ4: ゲート判定記録, テンプレ5: 運用引き継ぎ文書, テンプレ6: 企画書(intent-brief), テンプレ7: 実装計画(plan) (+2 more)

### Community 28 - "tailoring-guide.md"
Cohesion: 0.18
Nodes (10): テーラリングの禁止事項, 例1: スタートアップの PoC(2名・PoC・標準品質・内製), 例2: 事業会社のグロース期プロダクト(8名・グロース・高品質・内製), 例3: SIer の受託開発(15名・安定運用・規制業・受託受注側), 入力: 4つの調整軸, 組み合わせ例(3つの典型), 軸A: チーム規模による調整, 軸B: 事業フェーズによる調整 (+2 more)

### Community 29 - "分類別の指標と警戒サイン"
Cohesion: 0.18
Nodes (10): AI協調(委譲の効き), ダッシュボード化, 事業継続性(理解の維持), 分類別の指標と警戒サイン, 収集の実装(3つのデータソース), 品質(欠陥と負債), 指標が示す「次の一手」の早見表, 指標体系の全体像 (+2 more)

### Community 30 - "表現ポリシーの複数案検討と批評ループの記録"
Cohesion: 0.20
Nodes (9): 3案, リサーチから得た設計制約(検証済み事実), 合成結果(採用案), 批評から得た修正点(ループ2周目), 批評ループ(3レンズ × 3案), 案A: 読み物主導型(Diátaxis 解説ページ+図は挿絵), 案B: データ駆動ドリルダウン型(スキーマ+3ズームレベル), 案C: ビューア埋め込み型(bpmn-js アイランド) (+1 more)

### Community 31 - "phase1-current-state/overview.md"
Cohesion: 0.20
Nodes (9): ゲート・意思決定, ロール・組織, 成果物, 成果物・レビュー, 期間目安, 目的, 調査対象プロセス, 調査観点 (+1 more)

### Community 32 - "po-centric-team.md"
Cohesion: 0.20
Nodes (9): 全員がPOになれるのか(スキルの偏在), 前提条件の依存ツリー, 参考文献, 従来編成との対比, 日本の組織文化との衝突, 本プロジェクトへの含意, 現実の懸念, 理想像の正体は「ボトルネックの上流移動」 (+1 more)

### Community 33 - "設計判断のポイント"
Cohesion: 0.20
Nodes (9): 1. 規則は「参照モデルからの逸脱」だけを書く(差分方式), 2. 説明のない調整は型レベルで書けない, 3. 条件は「質問→回答」の等値照合だけ, 4. 調整操作は6動詞に限定する, 5. 優先度は初期値のみ定義する, 全体構造, 収録済みの規則, 検証と版管理 (+1 more)

### Community 34 - "Claude Code 開発リポジトリとしての整備 — ディープリサーチ結果(2026-07-08)"
Cohesion: 0.22
Nodes (8): 4層の役割分担(最重要の設計原則), Claude Code 開発リポジトリとしての整備 — ディープリサーチ結果(2026-07-08), その他の確定事項, 主要ソース, 未検証領域(実装時に公式ページ要確認), 本リポジトリへの適用(P1〜P5), 標準構成, 確定した公式仕様(すべて code.claude.com/docs で逐語確認済み)

### Community 35 - ".github コミュニティ標準・サイト品質ゲートの整備 — リサーチ結果(2026-07-09)"
Cohesion: 0.22
Nodes (8): .github コミュニティ標準・サイト品質ゲートの整備 — リサーチ結果(2026-07-09), コミュニティヘルスファイル, サイト品質・SEO, ソロ → 複数人移行, 併せて実施したアップグレード, 出典(主要), 導入 / 見送りの判断, 確定した事実(公式ドキュメントで逐語確認済み)

### Community 36 - "tsconfig.json"
Cohesion: 0.25
Nodes (7): **/*, astro/tsconfigs/strict, .astro/types.d.ts, dist, exclude, extends, include

### Community 37 - "phase1-current-state/summary.md"
Cohesion: 0.25
Nodes (7): 3つの発見, フィードバックのお願い, フェーズ2・3への橋渡し, 何を整理したか, 発見1: 意思決定は「集中」か「分散」かで二分される, 発見2: 生成AI時代のプロセスは「決裁型」に回帰している, 発見3: 日本のガバナンスの共通DNAは「責任の非集中」

### Community 38 - "aidlc-lifecycle.md"
Cohesion: 0.25
Nodes (7): 2つの新しい単位: Bolt と Mob, 3つのフェーズ, なぜこれが「To(理想)」なのか, ライフサイクルの全体像, ロールの分担, 一言でいうと, 参考文献

### Community 39 - "前提条件の一覧"
Cohesion: 0.25
Nodes (7): この一覧の使いみち, 個人・スキルの前提(人間に残る部分), 前提の全体像: AIが解くのは一部だけ, 前提条件の一覧, 情報・知識の前提(明文化コストが残る部分), 技術の前提(AIが解こうとしている部分), 組織・責任の前提(組織に残る部分)

### Community 40 - "git-strategy.md"
Cohesion: 0.25
Nodes (7): AI 生成コミットの扱い, main への追従とコンフリクト解消, ブランチモデル: トランクベース+タスク単位ブランチ, ブランチ保護: ゲートの機械的強制, ブランチ命名の語彙, マージ後の扱い, 段階導入(テーラリング)

### Community 41 - "pr-workflow.md"
Cohesion: 0.25
Nodes (7): Draft PR の扱い, PR のライフサイクル, アンチパターン, サイズ上限, レビュー対応とマージ, 本文の必須欄(PR テンプレート), 誰が PR を作るか(自律度別)

### Community 42 - "定常作業カタログ"
Cohesion: 0.25
Nodes (7): 四半期, 定常作業カタログ, 日次〜随時, 月次, 週次, 運用の原則, 運用開始時のチェックリスト

### Community 43 - "proposal-logic.md"
Cohesion: 0.25
Nodes (7): トレース(調整の根拠), 優先度の設計, 処理の流れ, 後続 Issue との接続, 検証, 決定性, 競合解決の規則

### Community 44 - "user-testing.md"
Cohesion: 0.25
Nodes (7): 1. 同じ結論どうしを「衝突」として警告していた, 2. 省略したゲートに矛盾する設定が残っていた, このテストの限界, フィードバックのお願い, 検証の方法, 検証項目と結果, 発見した問題と修正

### Community 45 - "20260710-phase1-zenn.md"
Cohesion: 0.29
Nodes (6): この記事は何か, やったこと: 9手法 + 日本のガバナンスを同じ様式で地図化, 次のフェーズと、フィードバックのお願い, 発見1: 意思決定は「集中」か「分散」かで二分される, 発見2: 生成AI時代のプロセスは「決裁型」に回帰している, 発見3: 日本のガバナンスの共通DNAは「責任の非集中」

### Community 46 - "style-guide-diagrams.md"
Cohesion: 0.29
Nodes (6): Mermaid 記法の選択表, スタイル規約, プロセスの階層図解パターン, 手段の使い分け, 生成画像の規約, 記法サンプル

### Community 47 - "context-engineering.md"
Cohesion: 0.29
Nodes (6): CE の本質は「注意の配分の設計」, コンテキストの層, コンテキストエンジニアリングとは, 参考文献, 暗黙知の形式知化: どこまで越えられるか, 本プロジェクトへの含意

### Community 48 - "context-infrastructure.md"
Cohesion: 0.29
Nodes (6): フェーズ4への引き渡し, 副次効果: ナレッジマネジメントの強制執行, 基盤の要件, 最大の論点: 明文化の責任は誰が持つか, 補完のレイヤ: 何を一度書き、何をAIが補うか, 課題: 人間が同じ文脈を何度も書きたくない

### Community 49 - "分析の切り口(候補)"
Cohesion: 0.29
Nodes (6): コンテキストの明文化, ロールの置き換え vs 支援, 内製/外注の再構成, 分析の切り口(候補), 成果物, 目的

### Community 50 - "phase3-gap-analysis/summary.md"
Cohesion: 0.29
Nodes (6): もう一つの発見: 事業継続性の責任が社内に戻る, フィードバックのお願い, フェーズ4への引き渡し, 何を整理したか, 埋めるべき5つのギャップと打ち手, 核心の発見: ギャップは技術ではなく組織にある

### Community 51 - "ears-guide.md"
Cohesion: 0.29
Nodes (6): 5つのパターン, なぜ形式を決めるのか, チェックリスト(G-2 提出前のセルフチェック), 出典, 書き方の手順(formalize-criteria タスクの実施手順), 良い例・悪い例

### Community 52 - "integrated-process.md"
Cohesion: 0.29
Nodes (6): 4つの設計原則と5つのギャップへの対応, このモデルの前提と限界, 人間の検証帯域を守る設計, 全体像: 二層構造, 各要素の由来(何をどこから借りたか), 変えるもの・変えないもの

### Community 53 - "roles-responsibilities.md"
Cohesion: 0.29
Nodes (6): RACI マトリクス(フェーズ × ロール), 任命基準, 兼務ルール(許可 / 禁止), 委譲ルール, 異動・引き継ぎへの備え(日本文脈), 責任の種類: A と R を分ける

### Community 54 - "ai-environment.md"
Cohesion: 0.29
Nodes (6): ガードレールの符号化(steering), モデルアクセスの管理, 実行形態の3層, 権限設計(最小権限+強制層), 段階導入の目安, 監査ログとトレーサビリティ

### Community 55 - "ci-gates.md"
Cohesion: 0.29
Nodes (6): G-5(自動検証)のパイプライン構成, デプロイゲート, 「人が毎回指摘すること」を CI へ移す運用, 出荷判定(G-7)エビデンスの自動集約, 様式・データの検証もゲートに載せる, 集約スクリプトの入出力仕様

### Community 56 - "context-base.md"
Cohesion: 0.29
Nodes (6): オーナーシップの実装(R5), リポジトリ配置(恒久層・案件層), 書き戻しワークフロー(R3), 段階導入(テーラリング), 要件との対応, 陳腐化の検知

### Community 57 - "台帳駆動の返却サイクル"
Cohesion: 0.29
Nodes (6): AIが生みやすい負債の類型, AIを返却に使う, トリアージ(月次), 健全性の判断, 台帳駆動の返却サイクル, 返却枠の確保

### Community 58 - "画像生成ワークフロー"
Cohesion: 0.33
Nodes (5): コマンド, ビジュアル規約(サイト全体の統一感), 使い分けと出力先, 後処理(必須), 画像生成ワークフロー

### Community 59 - "Mermaid 作図規約"
Cohesion: 0.33
Nodes (5): Mermaid 作図規約, スタイル規約, 書き方, 記法の選択ガイド, 階層構造の表現(本プロジェクトの核)

### Community 60 - "セキュリティポリシー"
Cohesion: 0.33
Nodes (4): セキュリティポリシー, 対象, 脆弱性の報告方法, サポート

### Community 61 - "作図規約の検討メモ(2026-07-08)"
Cohesion: 0.33
Nodes (5): 作図規約の検討メモ(2026-07-08), 手段の整理, 未決事項, 検討の背景, 決定事項(規約の骨子)

### Community 62 - "generate-image.mjs"
Cohesion: 0.53
Nodes (5): loadEnv(), main(), mimeOf(), parseArgs(), repoRoot

### Community 63 - "0001-public-adr.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 64 - "0002-astro-starlight.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 65 - "0003-dual-license.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 66 - "0004-research-framework.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 67 - "0005-ai-out-of-scope-phase1.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 68 - "0006-representation-policy.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 69 - "0007-schema-driven-process-data.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 70 - "0008-tailoring-rules-as-data.md"
Cohesion: 0.33
Nodes (5): コンテキスト, ステータス, 影響, 検討した選択肢, 決定

### Community 71 - "project-management.md"
Cohesion: 0.33
Nodes (5): PR フロー移行チェックリスト(コントリビューター参加時), バックログの構造, マイルストーン(期限は目安), 完了の定義(コンテンツ共通), 進め方のルール

### Community 72 - "phase2-aidlc/summary.md"
Cohesion: 0.33
Nodes (5): もう一つの発見: 生成AIは「人が承認し責任を持つ」構造を要求する, フィードバックのお願い, フェーズ3への橋渡し, 一貫して見えた発見: 前提の非対称性, 何を整理したか

### Community 73 - "insourcing-bcp.md"
Cohesion: 0.33
Nodes (5): 従来の内製/外注の判断軸, 打ち手: 何を人が理解し続けるか, 新しい事業継続性リスク, 日本の受発注構造との関係, 生成AIが変えること

### Community 74 - "role-mapping.md"
Cohesion: 0.33
Nodes (5): 3つの分類と判断基準, worked example: セキュリティのトリアージ, ロール × 分類の整理表, 日本の組織文化への注意, 次のページへ

### Community 75 - "compute-strategy.md"
Cohesion: 0.33
Nodes (5): AI トークン予算の管理, クラウド CI のコスト最適化, ローカルファーストの多段検査, ローカル実行環境の整備, 規模別の目安

### Community 76 - "nonfunctional-verify.md"
Cohesion: 0.33
Nodes (5): CI への組み込み, テーラリング, 原則, 検証の全体フロー, 種類別の検証手段と実施手順

### Community 77 - "improvement-cycle.md"
Cohesion: 0.33
Nodes (5): プロセス定義の版管理, モデル更新への追従(随時), 二重の改善ループ, 四半期振り返りの進め方, 本プロジェクト自体の追従

### Community 78 - "incident-response.md"
Cohesion: 0.33
Nodes (5): AI と人の分担, ポストモーテム(Sev1・Sev2 は必須), 対応フロー, 運用への組み込み, 重大度の判定基準

### Community 79 - "03-tool-concept.md"
Cohesion: 0.33
Nodes (5): コンセプト, 入力(チーム・プロダクトのコンテキスト), 出力(最適プロセスの提案), 実装方針(暫定), 想定する入出力

### Community 80 - "日本語校正ワークフロー"
Cohesion: 0.40
Nodes (4): ルール別の対処表, 手順, 日本語校正ワークフロー, 本プロジェクト固有の注意

### Community 81 - "gap-map.md"
Cohesion: 0.40
Nodes (4): 5つのギャップ(導入障壁), ギャップを一枚で, トレーサビリティ, 生成AIの組み込みポイント(工程別・障壁レベル)

### Community 82 - "proposal-template.md"
Cohesion: 0.40
Nodes (4): 想定問答(提案時に必ず出る質問), 提案の戦略: 「変えない」から入る, 提案の進め方, 提案書テンプレート

### Community 83 - "01-goal.md"
Cohesion: 0.40
Nodes (4): 公開・発信方針, 最終ゴール: プロセス提案ツール, 目的, 背景

### Community 84 - "process-researcher.md"
Cohesion: 0.50
Nodes (3): 執筆ルール, 最終報告, 調査観点(フェーズ1の調査フレームワーク)

### Community 85 - "調査メモ → 公開ドキュメント清書ワークフロー"
Cohesion: 0.50
Nodes (3): 前提, 手順, 調査メモ → 公開ドキュメント清書ワークフロー

### Community 86 - "PULL_REQUEST_TEMPLATE.md"
Cohesion: 0.50
Nodes (3): チェックリスト, 変更内容, 概要

### Community 87 - "research/ — 調査メモ置き場"
Cohesion: 0.50
Nodes (3): research/ — 調査メモ置き場, 構成, 運用ルール(実運用で確定済み)

### Community 88 - "list-image-models.mjs"
Cohesion: 0.50
Nodes (3): envPath, imageModels, repoRoot

### Community 89 - "index.md"
Cohesion: 0.50
Nodes (3): なぜ公開するのか, テンプレート, 運用ルール

### Community 90 - "phase2-aidlc/overview.md"
Cohesion: 0.50
Nodes (3): 成果物, 目的, 調査観点(候補)

### Community 91 - "phase4-process-design/overview.md"
Cohesion: 0.50
Nodes (3): 成果物の全体像, 次のフェーズとの関係, 読む順序

## Knowledge Gaps
- **803 isolated node(s):** `normalized`, `res`, `ADR-0006`, `name`, `type` (+798 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `エージェント型開発(自律・マルチエージェント)の現在地 調査メモ` connect `エージェント型開発(自律・マルチエージェント)の現在地 調査メモ` to `スクラム(Scrum)調査メモ`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `日本企業のガバナンス・決裁ゲートの実態 調査メモ` connect `日本企業のガバナンス・決裁ゲートの実態 調査メモ` to `スクラム(Scrum)調査メモ`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ` connect `ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ` to `スクラム(Scrum)調査メモ`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `normalized`, `res`, `ADR-0006` to the rest of the system?**
  _803 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `スクラム(Scrum)調査メモ` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `エージェント型開発の現在地 更新調査メモ(2026-08-04 時点)` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `プロセス表示のスキーマ駆動化: 既存 OSS / DSL 調査` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._