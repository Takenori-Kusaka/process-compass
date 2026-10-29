# #294 外部調査メモ(2): 既存規格と業界実務の8論点

- 取得日: 2026-10-23(本文中の URL はすべてこの日に取得)
- 調査者: サブエージェント survey-294-2
- 凡例
  - 【一次】= 規格本文・ベンダー公式ドキュメント・公式 changelog を直接読んだもの
  - 【二次】= 解説記事・第三者の要約経由のもの
  - 【既知】= 今回の取得では本文を確認できず、調査者の事前知識に依拠するもの(要裏取り)
- 規格本文の多く(ISO/IEC/IEEE 12207・15288・29119・24748、IEC 61508・62304、ISO 9001)は有償で本文未取得。該当箇所は【既知】または【二次】と明示

---

## 1. 設計ベースライン後の技術スパイク・実現性検証と設計判断の再開

### 主な知見

- ベースラインの定義(ISO/IEEE 12207:2008、SEBoK 経由)【二次】
  - 「正式にレビュー・合意され、以後の開発の基礎となり、正式な変更管理手続きによってのみ変更できる仕様または製品」
  - https://sebokwiki.org/wiki/Baseline_(glossary)
  - 含意: ベースライン後の発見は「変更管理手続き」の入口へ流すのが規格の前提
- 12207:2017 / 15288:2023 のアーキテクチャ定義・設計定義プロセスは反復を前提とし、構成管理プロセスの変更要求(change request)で基礎線を変える構造【既知】
- ADR の原典(Nygard 2011)【一次】
  - Status は proposed / accepted。後続 ADR が変更・反転した場合は deprecated または superseded とし、置き換え先を参照
  - 「決定が反転されたら、古いものは残し superseded と記す」
  - https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- 英国 GDS Way(政府の実務標準)【一次】
  - 実装後に誤りが判明した場合、明確化なら既存 ADR の更新も可。**未実装で関係者が合意すれば既存 ADR を書き換えてよい**。**実装が一部でも進んでいれば新 ADR を書く**
  - superseded の旧 ADR は明確に印を付ける(MUST)
  - main ブランチ上の ADR は accepted とみなし、proposed は PR の状態で表す
  - https://gds-way.digital.cabinet-office.gov.uk/standards/architecture-decisions.html
- SAFe【一次(部分取得)】
  - スパイクは Enabler Story の一種。探索・アーキテクチャ・調査・設計・プロトタイピングを含み、技術リスク低減・要求明確化・見積り信頼性向上が目的。「他のストーリーと同様に見積り・実装・デモされる」
  - Epic の実現可能性判断の仕組みとして位置付け
  - Architectural Runway = 近い将来の機能を最小の再設計で実装するための既存コード・コンポーネント・基盤。Enabler が runway を「舗装」する
  - https://framework.scaledagile.com/spikes / https://framework.scaledagile.com/architectural-runway
  - スパイク結果の記録先・runway の再計画手順はページ本文から取得できず

### 実務の幅(不一致点)

- 再開の記録手段
  - ADR supersession(新 ADR で置換、旧 ADR は残す)— Nygard・adr-tools 系
  - 未実装なら既存 ADR を書き換え可 — GDS Way(本プロジェクトの「採用済み ADR の本文は書き換えない」より緩い)
  - 変更管理委員会(CCB)による変更要求の承認 — 12207・ISO 10007 系の重い形【既知】
- スパイクの位置付け
  - SAFe: 計画対象の作業項目(Enabler)、成果はデモ
  - 多くのチーム: スパイク結果は Issue コメント・Wiki に散逸しがち(定量根拠なし、調査者の観察)
- 「スパイクの結論が設計判断を覆す」ときの手続きを明文化した規格は確認できず

### 標準への含意・選択肢

- A: スパイク結論が既存 ADR と矛盾したら、新 ADR(supersedes 付き)を必須化。旧 ADR は残す(Nygard 準拠、本プロジェクトの ADR 規則と整合)
- B: GDS 型の「未実装なら書き換え可」例外を設ける — 本プロジェクト既存ルールと衝突するため採否を明示的に決める必要
- C: スパイク自体を作業項目として計画し、成果物(結論・証拠・影響する ADR 番号)を必須欄に — SAFe 寄り
- 留意: ベースライン後の変更を「変更管理手続き」経由とする点は 12207 系と一致させやすい

---

## 2. 自動化・AI エージェントによる不可逆操作の停止条件

### 主な知見

- Claude Code auto mode(2026-03-24 公開、2026-07-10 GA)【一次】
  - 各ツール呼び出し前に分類器が潜在的に破壊的な操作(大量削除・機微データ持ち出し・悪意あるコード実行)を検査し、危険なものはブロック。ブロックが続くと最終的に利用者へ許可を求める
  - 「--dangerously-skip-permissions よりリスクを減らすが除去はしない」「分類器が一部の危険な操作を許す可能性がある」と明記
  - 隔離環境での利用を引き続き推奨
  - https://claude.com/blog/auto-mode
- OpenAI Codex【一次】
  - ツールが destructive 注釈を持つ app/MCP 呼び出しは**常に承認が必要**
  - 自動レビュアは critical リスクの操作を拒否、失敗時は fail closed
  - danger-full-access(サンドボックスなし・承認なし)は「非推奨」
  - 安全監視は「サンドボックス・権限・成果物のレビューを置き換えない」— 多層防御の明示
  - 旧 approval_policy = "untrusted" は廃止
  - https://learn.chatgpt.com/docs/agent-approvals-security.md(developers.openai.com/codex/agent-approvals-security からリダイレクト)
- GitHub Environments(デプロイ承認)【一次】
  - required reviewers は最大6名、**1名の承認で進む**
  - prevent self-review: デプロイを起動した者は承認不可
  - 既定では管理者が保護規則を bypass 可能。bypass 禁止も設定可
  - https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- SLSA v1.2 Source Track L4【一次】
  - 「保護ブランチへの全変更を2名の信頼された者がレビューすることを要求」「最終リビジョンに適用」
  - https://slsa.dev/spec/v1.2/source-requirements
- NIST SP 800-53 CM-5(変更へのアクセス制限)【二次】、CM-5(4) 二重承認・AC-3(2) 二重承認・AC-5 職務分離【既知】
  - https://www.upguard.com/compliance/nist-sp-800-53/cm/cm-5
- OWASP Top 10 for Agentic Applications(2025-12)【二次】
  - ASI09 人間とエージェントの信頼悪用 — 緩和策としてリスク閾値超の操作カテゴリに明示的人間レビュー(HITL ゲート)
  - **承認者自身が操作されること(承認疲れ・誘導)をリスクとして挙げる点が重要**
  - https://www.speakeasy.com/blog/owasp-agentic-top-10-explained(一次: https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/ は未読)

### 実務の幅(不一致点)

- 「破壊的操作は常に確認」(Codex の destructive 注釈、Claude Code 既定モード)vs「分類器で自動判断、隔離環境前提」(auto mode)
- 後段ゲートの存在を根拠に前段を緩める設計は実務で一般的(サンドボックス+PR レビュー+デプロイ承認)。ただしベンダー自身が「置き換えない」と明記
- 後段ゲートが実在しても bypass 可能(GitHub の管理者既定 bypass)。「後段が存在する」ことと「後段が効く」ことは別
- 不可逆性そのもの(本番 DB 削除、force push、外部送信)は後段ゲートでは取り消せない — 後段ゲートは「次の操作」を止めるだけ

### 標準への含意・選択肢

- A: 不可逆操作は後段ゲートの有無に関わらず実行直前に人間確認(無条件)— Codex の destructive 規則に近い
- B: 「後段に人間専用ゲートがあり、その操作がゲートの手前で可逆」な場合に限り前段確認を省略可。条件として bypass 不可設定・prevent self-review 相当を要求
- C: 二者原則(SLSA L4・CM-5(4))を高リスク区分にだけ課す
- 判定軸の候補: 操作の可逆性(取り消せるか)、後段ゲートの bypass 可能性、承認者と起動者の分離
- 留意: OWASP ASI09 の指摘どおり、確認の乱発は承認疲れを生む。確認対象の絞り込みと確認内容の提示形式も規定対象

---

## 3. ゼロコンテキスト読者(コールドリード)レビュー

### 主な知見

- ISO/IEC/IEEE 26513(利用者向け情報の試験者・レビュー者への要求)【二次】
  - 実際の利用者による開発中の試験を重視。2011 改訂で評価戦略・ユーザビリティ試験・アクセシビリティ試験・翻訳レビューを追加
  - 記事は 2017-07、tcworld
  - https://www.tcworld.info/e-magazine/technical-writing/iso-iec-ieee-standard-26513-calls-for-early-testing-of-user-documentation-805
  - レビュー者の独立性・前提知識の扱いは記事から確認できず
- 米国連邦 Plain Language ガイド(digital.gov)【一次】
  - 言い換えテスト: 読者が文書をどう理解したかを確かめる。6〜9件の面談。少数にしか届かない文書には割に合わない
  - https://digital.gov/guides/plain-language/test/paraphrase-testing
- 技術文書実務【二次】
  - SME レビュー(正確性)と編集レビュー(一貫性)の分離が主流。「文脈を持たない読者」を独立のレビュー種別として扱う記述は少数
  - https://idratherbewriting.com/learnapidoc/docapis_review_processes.html — 外部フィードバック(初期利用者・ベータ)に依拠
  - https://www.tcworld.info/news/five-common-challenges-in-technical-reviews-and-how-to-address-them
- AI をコールドリーダーとして使う場合【一次】
  - Claude Agent SDK のサブエージェントは「親の会話履歴を受け取らない新しい文脈」で始まる。**ただし project CLAUDE.md・ツール定義・Agent 呼び出しのプロンプトは受け取る**
  - 含意: 「サブエージェント = ゼロコンテキスト」ではない。プロジェクト規約・呼び出し側の誘導が混入する
  - https://code.claude.com/docs/en/agent-sdk/subagents.md

### 実務の幅(不一致点)

- 人間の代表読者による試験(26513・言い換えテスト)vs 社内の別チーム・別担当者による「新鮮な目」レビュー vs AI による擬似読者
- 費用対効果: digital.gov は少数配布文書の試験を割に合わないとする。組織外へ出る文書は配布範囲が広く適用根拠になる
- AI コールドリードの有効性を実証した一次研究は今回確認できず

### 標準への含意・選択肢

- A: 組織外へ出る成果物に限り、文脈を持たない読者によるレビューを必須化。読者の条件(当該案件の資料・会話に触れていない)を定義
- B: AI を読者に使う場合、渡した文脈(プロンプト・自動読込される規約ファイル)を記録させる。「ゼロコンテキスト」を主張する条件として、自動読込の無効化または列挙を要求
- C: AI 読者を人間の代表読者試験の代替とは認めず、前段のふるい分けと位置付ける
- 実証不足のため根拠水準マークが必要

---

## 4. スタック PR と CI

### GitHub ネイティブのスタック PR(確認結果)

- **実在を確認**【一次】
  - 2026-07-30 パブリックプレビュー: https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/
  - 2026-10-06 GA(github.com 全プラン。GHES は今後のリリース): https://github.blog/changelog/2026-10-06-stacked-pull-requests-generally-available/
  - Issue 本文の「2026-07」はパブリックプレビュー開始を指すと推定。GA は 2026-10
- 仕組み【一次】
  - 各 PR は一つ下の層を対象とする(each pull request targets the layer below it)
  - 最上位の準備済み PR をマージすると、その下の未マージ層をまとめて一度にマージ
  - 下位だけマージすると、上位 PR は自動 rebase・retarget
  - 作成手段: Web・GitHub CLI 拡張 `gh extension install github/gh-stack`・モバイル・コーディングエージェント(gh-stack skill)
- CI・規則の評価【一次】
  - 「スタック内の全 PR は、スタックの基底(例 main)を対象とするものとして評価される」
  - `pull_request` で main 対象に絞ったワークフローは**スタック内の全 PR で実行**される。ワークフロー変更は不要
  - 必須レビュー・必須ステータスチェック・code scanning はスタック基底に対して評価。CODEOWNERS もスタック基底から評価
  - マージ可能条件: その PR と下位全 PR が基底の保護規則を満たし、ブランチ間が完全に線形な履歴
  - CI 費用はスタックの高さに比例して増える。`github.event.pull_request.stack`(position・size・base.ref)で重いジョブを最下位/最上位だけに絞る例を公式が提示
  - GA 時に `pull_request` webhook へ `stacked` アクションを追加
  - https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests
  - https://docs.github.com/en/pull-requests/reference/stacked-pull-requests
- マージキュー【一次】
  - プレビュー時は「数週間かけて段階的に展開」。GA で「スタックは単一の merge group としてキューに入り着地」
  - スタックの全 PR が正しい順でキューに入る。途中の PR が外れると上位も外れる。merge group の最大サイズを最大50%超過可、超大スタックは連続する merge group に分割
  - merge commit 方式では PR ごとに1つのマージコミット
- GA での追加【一次】
  - Rebase stack が stale approval を棄却する設定下でも承認を保持(基底が進んだだけで内容不変の場合)
  - rebase 時に署名付き置換コミットを生成
  - bypass 権限者は最下位の未マージ PR をマージ可
  - 自動マージは「全 PR が準備できたら一斉にマージ」(数週間かけて展開)
- 制約【一次】
  - 全ブランチが同一リポジトリ。フォーク跨ぎ不可。GitHub Desktop 非対応
  - 下位ブランチへの push や trunk の前進で線形履歴を失う
- **文書間の不整合**: reference ページは取得時点でも「public preview であり変更の可能性あり」と記載。changelog は GA。どちらが最新か未確定
- `merge_group` イベントの扱い、必須チェックがスタック内のどの PR の実行結果で判定されるかの細部は CI 最適化ページに記載なし

### 既存ツール

- Graphite【一次】
  - スタック化は CI 実行回数を増やすと明記。「スタック下位の何本で CI を回すか」「最上位で回すか」をリポジトリ単位で設定し上位 PR の CI を省略
  - 省略判定 API の失敗時は fail open(CI を省略しない)
  - マージキュー内・スタックとしてマージ中は省略しない
  - 全基底ブランチに保護規則を掛けて上位の CI を省略すると「必須 CI 欠落」になると警告
  - https://graphite.com/docs/stacking-and-ci.md
- ghstack【既知】: `gh/<user>/<n>/base`・`head` の合成ブランチを PR の基底にするため、`branches: [main]` で絞ったワークフローは走らない。PyTorch 等で使用
- Sapling【既知】: `sl pr` でスタックの各コミットを PR 化。GitHub 上では下位コミットを含む差分になり、ReviewStack 等で閲覧
- GitHub の一般規則【一次、GHES 3.8 版文書】: パス・ブランチ・コミットメッセージのフィルタでワークフローがスキップされると、関連チェックは Pending のまま残り、必須ならマージを妨げる。ジョブの条件スキップは Success 扱い
  - https://docs.github.com/en/enterprise-server@3.8/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks

### 実務の幅(不一致点)

- GitHub ネイティブ: 全層で CI(規則は基底基準)、費用削減は利用者が stack メタデータで絞る
- Graphite: 上位層の CI を既定で省略可能(費用優先)、マージ時に必ず回す
- ghstack: 基底が合成ブランチのため、ワークフロー設定次第で CI が走らない危険

### 標準への含意・選択肢

- A: 「マージ対象となる最終状態(基底へ着地する内容)に対して必須チェックが通ったこと」を要求し、層ごとの CI 実行は任意 — GitHub GA のマージキュー挙動・Graphite の方針と両立
- B: 全層で必須チェック通過を要求 — GitHub ネイティブの既定挙動と一致、費用増
- C: ツール非依存に「PR の基底がトランクでない場合に必須チェックが走るか」を導入時に検証する項目を置く(ghstack 型の抜けを防ぐ)
- 留意: 必須チェックとパスフィルタの組合せで Pending 固着が起き得る(論点8と共通)

---

## 5. 定額サブスクリプションの利用上限と従量課金、プロンプトキャッシュの費用構造

### 主な知見

- Anthropic(Claude サブスクリプション)【一次】
  - Max プラン: セッション単位の上限が5時間ごとにリセット。5x/20x は5時間あたり少なくとも225/900メッセージ(短い会話の目安)
  - Anthropic の裁量で週次・月次の上限を課す可能性
  - 上限は Claude と Claude Code で共有
  - 消費量はメッセージ長・添付サイズ・モデル・機能・会話長で変動 — **固定のトークン数上限は公開されていない**
  - https://support.claude.com/en/articles/11014257-about-claude-s-max-plan-usage
  - 上限到達後は usage credits(従量)へ移行可能。**標準 API 料金で課金**、月次の支出上限を設定可、Claude Code にも適用。セッション5時間・週次のリセットは不変
  - https://support.claude.com/en/articles/12429409-using-extra-usage-and-resets
- Anthropic API のプロンプトキャッシュ【一次】
  - キャッシュ書込: 5分 TTL = 基本入力単価の1.25倍、1時間 TTL = 2倍
  - キャッシュ読込: 基本入力の0.1倍(例外: Fable 5.1・Mythos 5.1 は0.025倍、Opus 5.5・Sonnet 5.5 は0.05倍)
  - 既定 TTL 5分、ヒットごとに無料で更新。TTL は要求開始時点から計測
  - 最小キャッシュ長はモデル依存(512〜4,096トークン)。ブレークポイント最大4
  - キャッシュヒットはレート制限から差し引かれない(1時間キャッシュ節の記述)
  - https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- OpenAI のプロンプトキャッシュ【一次】
  - 既定で有効。キャッシュ済み入力は最大95%割引
  - 旧モデル: 書込追加料金なし、メモリ内保持は概ね5〜10分(最大1時間)、拡張保持は最大24時間(ZDR なし組織の既定)
  - GPT-5.6 以降: 書込は標準入力の1.25倍(既定30分 TTL)/2.5倍(12時間)。明示ブレークポイントを選択可。最小1,024トークン
  - https://developers.openai.com/api/docs/guides/prompt-caching
- GitHub Copilot【一次】
  - 2026-06-01 に全プランが使用量課金へ移行。premium request units を GitHub AI Credits に置換。入力・出力・**キャッシュトークンを含む**トークン消費を各モデルの公開 API 料金で課金
  - Pro $10(含 $10 クレジット)、Pro+ $39、Business $19/人、Enterprise $39/人。企業・コストセンター・利用者単位で予算設定、超過分を許すか上限で止めるか選択
  - https://github.blog/changelog/2026/04/27/github-copilot-is-moving-to-usage-based-billing/
  - 旧方式(年額プランの既存契約のみ): Pro 300/月・Pro+ 1500/月の premium request、超過 $0.04/件、クラウドエージェントは1セッション1リクエスト×モデル倍率
  - https://docs.github.com/en/copilot/reference/copilot-billing/request-based-billing-legacy/copilot-requests

### 実務の幅(不一致点)

- 定額側: Anthropic は上限が非公開・可変(裁量の週次上限)。予測可能性が低い
- 従量側への収斂: Copilot が2026-06 に使用量課金へ移行、Anthropic も超過分は API 料金。定額と従量の境界は「含まれる枠+超過従量」の形へ寄っている
- キャッシュ: Anthropic は書込に割増(1.25倍/2倍)、OpenAI は旧モデル割増なし→新モデルで割増ありへ変化。TTL は 5分/1時間(Anthropic)vs 30分/12時間(OpenAI 新)/最大24時間(旧拡張)
- キャッシュがサブスクリプションの利用上限消費にどう効くかは、どのベンダーも公開していない

### 標準への含意・選択肢

- A: 費用見積りの規定は「単価」ではなく「課金方式(定額枠・超過従量・キャッシュ割増割引)」を記録させる形にする。単価はベンダー改定が頻繁(Copilot は半年内に方式変更)
- B: 定額プランの上限は非公開・可変であることを前提に、上限到達時の挙動(停止か従量移行か、支出上限)を事前に決めることを要求
- C: キャッシュ前提の費用試算は TTL を跨ぐ作業間隔(人間の承認待ち等)でキャッシュが失効し書込割増が再発する点を明記 — 人間ゲートの待ち時間と費用の連動
- 数値を条項に書く場合は根拠水準マークと見直し時期が必須

---

## 6. AI の異議・不同意理由の構造化出力

### 主な知見

- SARIF 2.1.0(OASIS)【一次・部分】
  - GitHub code scanning は SARIF 2.1.0 のみ受理。result の `level` がルール既定の重大度を上書き(既定 warning)。`properties.precision` は very-high/high/medium/low。`partialFingerprints` が必須で、コミット・ブランチ間の同一性判定に使用
  - ルールの `security-severity`・`problem.severity` は例示のみ
  - https://docs.github.com/en/enterprise-server@3.1/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning
  - suppression オブジェクト(§3.35): `kind`・`status` は列挙、`justification` は「なぜ抑止したかを説明する利用者記述の文字列」【二次: agentpatterns.ai 経由。列挙値は未確認。【既知】では kind = inSource/external、status = accepted/underReview/rejected】
- reviewdog Diagnostic Format(rdjson/rdjsonl)【一次・部分】
  - message・location(path・range)・severity(例示は ERROR/WARNING)・source(name・url)・code(value・url)・suggestions(range・text)
  - 理由・根拠専用の欄はない
  - https://github.com/reviewdog/reviewdog/tree/master/proto/rdf
- Conventional Comments【一次】
  - `<label> [decorations]: <subject>` + `[discussion]`
  - label: praise・nitpick・suggestion・issue・todo・question・thought・chore・note
  - decoration: blocking(解決まで受理しない)・non-blocking・if-minor
  - https://conventionalcomments.org/
- GitHub Copilot code review(2026-05-12)【一次】
  - コメントに High/Medium/Low の重大度ラベル、類似コメントのグループ化。スキーマ・API 出力の記載なし
  - https://github.blog/changelog/2026-05-12-copilot-code-review-comment-experience-improvements
- CodeRabbit【一次】
  - 重大度 Critical/Major/Minor/Trivial/Info、内容カテゴリ6種(Security & Privacy 等)
  - https://docs.coderabbit.ai/guides/code-review-overview.md
- 却下理由の記録【二次】
  - code scanning の `dismissed_reason` は列挙で API 照会可能。Copilot の解決理由(Addressed / Won't fix / Incorrect)が 2026-08-27 に追加、code scanning に "mitigated" が 2026-08-20 に追加との記述
  - 「指摘が誤り」と「指摘は正しいが今回は見送る」を分ける語彙を推奨
  - https://agentpatterns.ai/code-review/dismissal-reason-capture/(著者不明、AI 生成と自称。changelog 一次は未読)

### 実務の幅(不一致点)

- 重大度の段数: 3段(Copilot・SARIF level)、5段(CodeRabbit)、2段+ブロック有無(Conventional Comments)
- 「ブロックするか」と「重大度」を分ける流儀(Conventional Comments の decoration)と、重大度で暗黙に決める流儀(多くのボット)
- 指摘する側の「理由」欄を構造化した形式は少ない。構造化されているのは**却下する側の理由**(SARIF suppression・dismissed_reason)
- AI が人間の指示・判断に異議を唱える場合の形式を定めた規格・公式仕様は確認できず

### 標準への含意・選択肢

- A: 異議を「対象・主張・根拠・重大度・ブロック有無・推奨行動」の必須欄で出させる。ブロック有無は重大度と独立した欄(Conventional Comments に倣う)
- B: 機械可読性が要るなら SARIF 2.1.0 の result + suppression(justification)に写像。新形式を発明しない
- C: 却下側の語彙を「誤り」「正しいが見送り(理由付き)」「既に対処済み」に分け、照会可能に保存 — 本標準の「却下は成果」方針と整合
- 留意: 段数の統一は既存ツール間で一致しないため、写像表を持つ方が現実的

---

## 7. PR に付随する証跡の保存先

### 主な知見

- GitHub Actions の保持期間【一次】
  - 既定90日。公開リポジトリは1〜90日、非公開は1〜400日で設定可。変更は既存物へ遡及しない
  - 2026-10-01 まではチェック・ワークフロー実行・コミットステータスは設定に関わらず400日以上保持
  - https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization
  - 含意: **CI アーティファクトはそのままでは監査証跡として長期保存されない**
- GitHub artifact attestations【一次】
  - ビルドの出所(どこで・どう作られたか)を確立。`actions/attest@v4`、`id-token: write`・`attestations: write` 権限が必要
  - Free/Pro/Team は公開リポジトリのみ。非公開・internal は Enterprise Cloud が必要
  - `gh attestation verify` で検証。SBOM も SPDX/CycloneDX で attest 可能
  - 保持期間の記載なし。不要な attestation の削除を推奨
  - https://docs.github.com/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds
  - GitHub は SLSA Build L3 到達を謳う【二次: https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/ 未読】
- SLSA v1.2【一次】
  - Build L1 出所情報が存在(偽造容易)/L2 ホスト型ビルド基盤が署名/L3 強化ビルド基盤
  - https://slsa.dev/spec/v1.2/build-track-basics
  - Source L2: ブランチ履歴が連続・不変・保持され、新リビジョンごとに Source Provenance を発行。参照の全変更(いつ・誰が・新リビジョン ID)を記録
  - **保存場所は規定しない**。「リビジョンにアクセスできる利用者は対応する Source Provenance・VSA にアクセスできなければならない」という到達性要求
  - https://slsa.dev/spec/v1.2/source-requirements
- NIST SP 800-218 SSDF PS.3【二次(CD Foundation 経由の引用)】
  - PS.3 各リリースを保管・保護 — リリース後に発見された脆弱性の特定・分析・除去のため
  - PS.3.1 リリースごとに必要なファイルと支援データ(完全性検証情報、出所データ等)を安全に保管
  - PS.3.2 全構成要素の出所データを収集・保護・維持・共有(例: SBOM)
  - https://cybersecurity.cd.foundation/docs/phase-1/ssdf/ssdf-ps/
- ISO 9001:2015 7.5.3 文書化した情報の管理(保持・廃棄を含む)【既知】— 期間は組織が決める

### 実務の幅(不一致点)

- PR に紐づく証跡の置き場: CI アーティファクト(短期・自動削除)/PR コメント・チェック結果(プラットフォーム依存)/リポジトリへコミット(恒久だが肥大)/attestation(署名付き・プラン依存)/外部ストレージ・証跡管理基盤
- 規格側(SSDF・SLSA)は「何を・誰が到達できるか」を求め、置き場は規定しない
- 保持期間を定める一般規格は見当たらない(規制分野・契約で決まる)

### 標準への含意・選択肢

- A: 保存先ではなく「保持期間 ≥ 当該成果物の保守期間」と「改ざん検知可能性」を要求(SSDF・SLSA の要求形式に倣う)
- B: CI アーティファクトの既定保持(90日)を証跡保存とみなさないことを明記
- C: 署名付き attestation を高リスク区分で要求 — ただし非公開リポジトリでは有償プラン依存のため、代替(リポジトリへのハッシュ記録等)を認める必要
- 留意: 2026-10-01 の GitHub 保持方針の変更で、従来400日以上残っていたチェック履歴も設定値で消えるようになる

---

## 8. 実装時のチェック適用の最小規模・閾値

### 主な知見

- ISO/IEC/IEEE 29119-2 テストプロセス【既知・二次】
  - テスト計画プロセスの中でリスクの識別・分析と緩和方針を定め、それに基づいてテスト戦略(技法・完了基準・テスト強度)を設計する構造。リスクは計画の一部として扱う
  - https://arxiv.org/pdf/1801.06812(「29119 はリスク考慮をテスト計画プロセスの不可欠な部分として明示的に規定」)
  - 本文の条番号・具体的閾値は未確認
- IEC 62304(医療機器ソフトウェア)【二次】
  - 安全クラス A/B/C で適用要求が段階化。B 以上でアーキテクチャ設計・ユニット試験、C で詳細設計・ユニット検証を含む全要求
  - ソフトウェアアイテム単位でクラス分け可能。ただし高クラスの安全上の懸念に寄与するアイテムは高クラス水準で開発。分類はリスクコントロール適用前の最悪結果で行う
  - https://www.greenlight.guru/blog/iec-62304-software-safety-classes
- IEC 61508-3【既知】: 附属書 A・B の表で技法ごとに SIL 別の HR/R/—/NR を指定。規模ではなく安全度水準で適用強度を決める
- ISO/IEC 29110(VSE: 25人以下の組織向けプロファイル)【既知】: 組織規模で軽量プロファイルを用意。12207:2017 附属書 A はテーラリングプロセスを規定【既知】
- IPA 共通フレーム2013(SLCP-JCF2013)も 12207 系に倣いテーラリングを前提とする【既知】
- 業界実務【一次】
  - GitHub: パスフィルタでワークフローを省くと必須チェックが Pending 固着、ジョブ条件スキップは Success 扱い — 「変更内容に応じた省略」は実装方法次第で必須チェックを形骸化または阻害
  - https://docs.github.com/en/enterprise-server@3.8/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks
  - GitHub スタック PR 公式も CI をスタック内位置で絞る例を提示(論点4)
- 行数など規模の数値閾値でチェック要否を決める規格は確認できず。Google の small CL 推奨など規模は「レビュー容易性」の文脈で語られ、チェック免除の根拠にはされていない【二次・未精査】

### 実務の幅(不一致点)

- 規格: 規模でなく**リスク・安全度・影響**で強度を段階化(29119・62304・61508)。規模で分けるのは組織規模(29110)であって変更規模ではない
- 実務: パス・変更種別(docs のみ等)で CI を省く運用が広い。規模(行数)閾値は lint・レビュー人数等で散見されるが標準的な値はない
- 62304 は分割による低クラス化を認めつつ、寄与関係で高クラスへ引き上げる歯止めを置く

### 標準への含意・選択肢

- A: チェックの必須/任意は変更の規模ではなくリスク区分で決める(29119・62304・61508 と整合、本標準の R は変更ごと・CL は案件ごとの既存方針とも整合)
- B: 規模閾値を置くなら「下回ると省略可」ではなく「上回ると追加要求」の片方向に限る — 分割による回避(62304 の寄与規則に相当する歯止め)を要する
- C: 省略の実装方法を規定(ジョブ条件スキップで成功扱いになる箇所を明示し、省略した事実を記録)
- 数値閾値は実証が乏しく、置くなら根拠水準マーク必須

---

## 確認できなかったこと

- GitHub ネイティブのスタック PR
  - 存在・時期(2026-07-30 プレビュー、2026-10-06 GA)は一次で確認済み
  - reference ページが取得時点でも「public preview」表記のままで、changelog の GA と食い違う
  - `merge_group` イベントでスタックがどう見えるか、必須チェックがスタックのどの実行結果で判定されるかの細部
  - gh.io/stacks は robots で取得不可
  - スタック深さの上限
- SARIF 2.1.0 suppression の `kind`・`status` 列挙値(OASIS 本文未取得、事前知識のみ)
- reviewdog の severity 全列挙値・`original_output`・`related_locations` の定義
- Copilot code review の解決理由(2026-08-27)・code scanning "mitigated"(2026-08-20)の changelog 一次
- ISO/IEC/IEEE 12207・15288・29119・24748、IEC 61508・62304、ISO 9001、JIS X 0160、IPA 共通フレーム2013 の本文(有償・未取得)。該当記述は【既知】【二次】
- NIST SP 800-53 CM-5(4)・AC-3(2) の本文(二次サイトに記載なし)
- OWASP Agentic Top 10 の一次文書
- SAFe におけるスパイク結果の記録先・runway の再計画手順(ページ本文が途中で切れて取得不可)
- Claude Code auto mode が force push・本番デプロイを具体的にどう扱うか
- Anthropic サブスクリプションの具体的トークン上限・週次上限の値、キャッシュがサブスクリプション消費に与える効果(非公開)
- AI をコールドリーダーとして使うことの有効性を示す一次研究
- 変更規模(行数等)でチェック要否を定める規格の存在(見つからず。不存在の証明ではない)
- GitHub artifact attestations の保持期間
