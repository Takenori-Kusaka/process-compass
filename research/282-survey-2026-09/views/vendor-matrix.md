# AI ベンダー推奨方針の比較

基準日は 2026-09-24。ベンダー公式の出典カード(付録の一覧)と `findings.yaml` の TH01 / TH03 / TH04 / TH06 から、製品ごとの既定値と推奨を並べる。

- 各セルの根拠は [SRC-NNNN]。束に出典が無い項目は「未確認」と書く(「その機能が無い」という意味ではない)
- 「(自己申告)」は、ベンダー自身が測った値・効果の主張で、標本や測定法を第三者が検証していないもの
- 固定 10 列を、統制に関する 5 列(表 1)と仕組みに関する 5 列(表 2)へ分ける
- 製品文書の仕様記述は挙動の一次資料であり、効果の実証ではない(FND-0089 の注記と同じ扱い)
- AI-DLC の実装リポジトリ [SRC-0051] は検証状態が partial。README が版ごとに書き換わるため、現行版で照合できた記述と旧版だけにある記述を分けて書く
- 行に入れなかった出典: JetBrains Air は説明責任の言明のみ [SRC-0243]、富士通は「人が介することなく」全工程を自動化すると発表 [SRC-0257]、Intercom Fin はコーディング製品ではない [SRC-0083]

## 表 1: 統制(自律度・承認・分離・AI レビュー・監査ログ)

| ベンダー / 製品 | 自律度の既定値 | 人の承認点 | 作成者と承認者の分離 | AI レビューの位置づけ | 監査ログ |
|---|---|---|---|---|---|
| Anthropic Claude Code | Pro / Max / Team は auto mode(分類器が許可要求を判定)が既定 [SRC-0290]。agent teams は実験的機能で既定無効 [SRC-0071] | 計画の承認(計画の却下率 39%、許可要求の却下率 3%、自己申告)[SRC-0290]。副作用のあるスキル(commit・deploy など)は人だけが起動する設定を勧める [SRC-0193]。PR の承認は人 [SRC-0402] | 作業した主体に採点させず、別文脈の新しいモデルに反証させる(同一モデル・別文脈)[SRC-0191]。人の作成者と承認者を分ける規定は未確認 | Code Review は並列探索→検証→重大度順で、PR を承認しない [SRC-0402]。誤りと付けられた指摘は 1% 未満(自己申告)[SRC-0402]。欠陥探しを命じたレビュアは健全な作業にも何かを報告するため、正しさと要求の欠陥に絞らせる [SRC-0191] | 製品の監査ログは未確認。社内エージェントの監視は 10 億超の判断の 0.002% を遮断(自己申告)[SRC-0068] |
| OpenAI Codex | ネットワーク遮断と OS が強制するサンドボックス(通常は作業ディレクトリ内)。承認方針は on-request / never(untrusted は廃止)[SRC-0211] | サンドボックス境界を越える操作 [SRC-0210]。一般指針は「失敗閾値の超過」と「不可逆・高リスクの行為」[SRC-0084] | Auto-review は境界の承認者を人から別のレビュア用エージェントへ替える(権限は広げない)[SRC-0210]。人の作成者と承認者を分ける規定は未確認 | Auto-review は承認の代行。レビュアへの指示は境界の代わりにならず、制限はファイルシステムとネットワークの規則で独立に強制する [SRC-0210]。提案は他の PR と同じく差分レビューする [SRC-0211] | OpenTelemetry は既定無効(opt-in)。有効時は承認判断・ツール結果・プロンプト(既定で伏字)を構造化ログへ出す [SRC-0211] |
| Google Antigravity(Gemini CLI の統合先)/ Jules | Request Review(推奨)は計画・差分のたびに停止。Always Proceed を選ぶと停止しない。Fast モードは計画段階なし [SRC-0222]。Gemini CLI は 2026-06-18 に消費者向け提供を停止 [SRC-0047] | 実装計画とコード差分の生成時。利用者の選択で全て外せる [SRC-0222] | Jules は人の介入を要しない計画を別エージェント(Planning Critic)が批評 [SRC-0048]。人の作成者と承認者を分ける規定は未確認 | 計画の批評(Planning Critic)と、自作 PR の CI 失敗の自動修正 [SRC-0048]。PR レビュー製品の位置づけは未確認 | Antigravity Enterprise は 1 トグルでプロンプト・ツール実行・生成物を記録 [SRC-0221] |
| GitHub Copilot cloud agent | cloud automations は書き込みのたびに許可を求め、信頼確立後に autopilot へ切り替える [SRC-0231]。Issue の automations は既定 Cautious(高確信度のみ自動適用)[SRC-0230]。Agentic Workflows は既定で読み取り専用 [SRC-0232] | マージ前の人のレビュー。エージェントは Ready for review・承認・マージができない [SRC-0177]。Issue 変更の承認は「利便機能であり統制ではない」と明記 [SRC-0230] | 依頼者は当該 PR を承認できない。アプリ ID で開いた PR は承認が 1 件追加 [SRC-0177]。PR 作成者の自己承認は不可 [SRC-0176] | 人のレビューの補完で、置き換えではない [SRC-0233]。2026-09-01 から、管理者が有効化すれば Copilot の承認を必須承認へ算入できる(既定無効・パス限定可)[SRC-0179]。Docs は「算入されない」と書き食い違う [SRC-0176]。レビュアのモデル切替は不可 [SRC-0233] | automations は全操作に理由を記録 [SRC-0230]。rule insights が規則の評価結果とバイパスを組織単位で集計する [SRC-0344] |
| AWS Kiro / AI-DLC | Kiro の既定の自律度は未確認。標準の Feature Spec はフェーズごとに承認、Quick Spec は承認ゲートなしで一括生成 [SRC-0223]。AI-DLC は人の承認ゲートを備える [SRC-0051] | Spec の各フェーズ(要件・設計・タスク)。高リスク・コンプライアンス領域には明示のレビューゲートを勧める [SRC-0223]。AI-DLC は全ステージで human-in-the-loop を求め、関係者が計画を検証する [SRC-0052] | 製品上の分離規定は未確認。AWS は本番アクセスへの必須ピアレビューを追加 [SRC-0058] | AI-DLC は 14 エージェント中 2 体をレビュアに置く [SRC-0051]。Kiro の AI レビューの位置づけは未確認 | AI-DLC はイベント単位の監査証跡を持つ(イベント数は版により 91〜102)[SRC-0051]。Kiro 本体は未確認 |
| Cursor | 既定値は未確認。「各ループで人の介入を要さず構築・出荷する」常時稼働エージェントを開発目標に掲げる [SRC-0237] | Rollouts は自らマージもロールバックもしない [SRC-0190]。エージェント本体の承認点は未確認 | 未確認(サブエージェントが親の変更を別環境で検証する構成はある [SRC-0237]) | Bugbot は 8 並列パス+多数決+検証モデルからエージェント型へ移行。解決率 52%→70% 超(自己申告、解決の判定も AI)[SRC-0401]。Security Review は重大度・攻撃経路・修正案を伴う [SRC-0190]。cloud agents がボットの指摘へ自動追従 [SRC-0237] | 未確認 |
| Cognition Devin | 既定値は未確認。「チームメンバーのように扱い、バックログを任せる」[SRC-0075]。機械的な修正には人を介在させない [SRC-0239] | 上級者の判断が要る仕事 [SRC-0075]。アーキテクチャ・製品方針・ドメイン知識を要する境界条件 [SRC-0239] | 未確認(書き手とレビュアはどちらも同一ベンダーのエージェント [SRC-0239]) | Devin Review は人の理解を拡張する位置づけで、指摘を重大度 3 区分で出す [SRC-0238]。指摘を Devin が自動修正するループ [SRC-0239] | 未確認 |
| Factory Droid | Off / Low / Medium / High の 4 段。新規・高リスクの作業は Off か Low から。組織管理者が上限を設定できる [SRC-0241] | 操作のリスク水準が自律度を超えたとき。ブロックリストは承認でも解除できない [SRC-0241] | 未確認 | 未確認 | 未確認 |
| Microsoft CAF(製品ではなく指針) | 未確認 | デプロイの承認に責任を持つ人の役割を指定する [SRC-0236] | 規制が求める場合は準備役と検証役のエージェントを分け、職務分離をアーキテクチャで強制する(金融の例)[SRC-0235] | 未確認 | 監査ログは未確認。全エージェントを単一の台帳へ登録する [SRC-0236] |

## 表 2: 仕組み(スキル・マルチエージェント・仕様駆動・費用・発表日)

| ベンダー / 製品 | スキル・ルール・メモリの機構 | マルチエージェントの推奨・警告 | 仕様駆動の推奨 | 費用の統制 | 出典の発表日 |
|---|---|---|---|---|---|
| Anthropic Claude Code | CLAUDE.md(1 ファイル 200 行未満が目安)。自動メモリ MEMORY.md は先頭 200 行 / 25KB まで [SRC-0350]。Skills(一覧の予算は文脈窓の 1%、SKILL.md は 500 行未満)[SRC-0193]。CLAUDE.md は強制ではなく文脈で、確実に止める動作は hooks・permissions・sandbox [SRC-0192] | 警告寄り。agent teams は独立に動ける作業だけに向き、逐次作業・同一ファイル編集は不向き [SRC-0071]。トークンは約 7 倍(ベンダー推定)[SRC-0104] | 仕様駆動の明示の推奨は未確認。探索→計画→実装を勧め、差分を一文で言える変更は計画を省く [SRC-0191] | Sonnet を既定、Opus は複雑な設計判断、単純なサブエージェントは Haiku。平均 $13 / 開発者・稼働日(自己申告)[SRC-0104]。定額上限は全製品面で共有し、到達時は待つ・上位プラン・クレジット購入 [SRC-0107] | 2026-08-07 [SRC-0290]、2026-03-09 [SRC-0402]。Docs は日付なし(2026-09 取得)[SRC-0191] |
| OpenAI Codex | AGENTS.md(ルートから連結、近い方が優先、合計 32KiB で打ち切り)[SRC-0212]。Skills(一覧は文脈窓の 2%、多いと説明を短縮し一部を外す)[SRC-0351]。モデル世代交代時に指示を見直す [SRC-0214]。メモリは未確認 | 条件付き。まず読み取り中心の作業に使い、書き込みの並列化は競合と調整負荷に注意する [SRC-0213] | 未確認(作業前に完了条件を定義する助言のみ [SRC-0214]) | サブエージェントは単一実行より多く消費すると明記 [SRC-0213]。能力階層 Sol / Terra / Luna を用途で分ける [SRC-0032]。予算上限の機構は未確認 | 2026-09-11 [SRC-0214]、2026-07-09 [SRC-0032]。Docs は日付なし(2026-09-24 取得)[SRC-0211] |
| Google Antigravity / Jules | Antigravity CLI は Agent Skills・Hooks・Subagents・Extensions(プラグイン)を引き継ぐ [SRC-0047]。常時ロードの上限とメモリは未確認 | 推奨側。Antigravity 2.0 は複数エージェントの並列編成を中心に置く [SRC-0046]。警告は未確認 | 未確認(Planning モードの計画承認のみ [SRC-0222]) | Enterprise はプロジェクト・チーム・個人単位の月次予算、共有トークンプール、上限付きの超過利用 [SRC-0221] | 2026-05-19 [SRC-0047]、2026-08-20 [SRC-0221]。Jules の最新更新は 2026-03-09 [SRC-0048] |
| GitHub Copilot cloud agent | Copilot code review は指示・スキルを base ではなく head ブランチから読む [SRC-0229]。Spec Kit のコマンドはスキルとして提供 [SRC-0362]。メモリは未確認 | 推奨側。Copilot app で並列エージェントを管理 [SRC-0231]。Lite レビューを複数エージェントの合議へ変更(高重大度の対応済み指摘 +47%、費用 −8%、自己申告)[SRC-0404]。警告は未確認 | Spec Kit は SDD・バグ修正・評価を独立した入口とする [SRC-0362]。cloud agent 本体の推奨は未確認 | 2026-06-01 からトークン量×API 単価の AI Credits。上限後に安価なモデルへ落とすフォールバックを廃止 [SRC-0292]。レビュー 1 回 $0.05〜$5(ベンダー推定)[SRC-0229] | 2026-09-01 [SRC-0179]、2026-06-02 [SRC-0231]、2026-04-27 [SRC-0292]。Docs は日付なし [SRC-0177] |
| AWS Kiro / AI-DLC | Steering(always / fileMatch / manual / auto の 4 モード)。AGENTS.md は常時読み込み、Kiro CLI は全 steering を読み込む [SRC-0224]。AI-DLC は学習済みの規則を保持する(旧 README は「人の修正を永続規則へ変える学習ループ」と記載)[SRC-0051] | AI-DLC は 14 エージェント編成(専門 11・レビュア 2・構成役 1)。旧 README(2026-09-01〜09-08 版)は、Kiro 上の弱いモデルが任意の手順を飛ばし承認ゲートを急ぎうると注記していたが、現行版には無い [SRC-0051]。Kiro 本体の推奨・警告は未確認 | 製品の中心に据える(「仕様駆動を AI コーディングツールへ最初に持ち込んだ」と自称)[SRC-0049]。EARS 形式の要求から property-based test を生成し、弱い性質は誤った振る舞いでも通ると限界を明記 [SRC-0436]。Quick Spec でゲートを省けるが、高リスクは標準 Spec [SRC-0223]。AI-DLC は経路別の固定ワークフローを定めない [SRC-0052] | モデル別のクレジット倍率(Luna 0.1x / Terra 1.0x / Sol 2.4x)[SRC-0050]。予算上限の機構は未確認 | 2026-07-14 [SRC-0049]、2026-08-04 [SRC-0223]、2026-09-02 [SRC-0224]。AI-DLC は 2025-11-29 公開 [SRC-0052] |
| Cursor | 未確認 | 推奨側。サブエージェントを独立 VM で動かし、スウォームで並行させる [SRC-0237]。Projects は数千のサブエージェントへ委任 [SRC-0189]。警告は未確認 | 未確認 | 未確認 | 2026-08-19 [SRC-0237]、2026-09-10 [SRC-0189]、2026-01-15 [SRC-0401] |
| Cognition Devin | 未確認 | 2025-06 は「マルチエージェントを作るな」(判断が分散し文脈を共有しきれない)[SRC-0076]。2026-06 の Fusion は主エージェントと安価な sidekick の構成で、計画・曖昧さの解釈・最終レビューは主エージェントに残す [SRC-0240] | 未確認 | Fusion で費用が最大 60% 減(自社ベンチ、自己申告)[SRC-0240]。自動修正ループで社内のトークン消費は大きく増えた(自己申告)[SRC-0239]。予算上限は未確認 | 2025-06-12 [SRC-0076]、2026-01-21 [SRC-0238]、2026-02-10 [SRC-0239]、2026-06-29 [SRC-0240] |
| Factory Droid | 未確認 | 未確認 | 未確認 | 未確認 | Docs は日付なし(2026-09 取得)[SRC-0241] |
| Microsoft CAF(製品ではなく指針) | 未確認 | 警告寄り。役割(計画者・レビュア・実行者)の違いだけではマルチエージェントを正当化しない。単一エージェントで検証してから移る [SRC-0235] | 未確認 | マルチエージェントは冗長な文脈処理と通信で費用が増える [SRC-0235]。予算統制は未確認 | 2025-12-01 [SRC-0235]、2026-04-09 [SRC-0236] |

## 読み取れる共通点と相違点

- **承認の単位**: 承認の要否を操作・変更の単位で決める点は共通(Codex は境界越え [SRC-0210]、Factory は操作リスク [SRC-0241]、GitHub は確信度とファイルパス [SRC-0230] [SRC-0179]、Antigravity は計画と差分 [SRC-0222]、Kiro はリスクで Spec の種別 [SRC-0223])。FND-0002
- **許可操作の機械化**: 人の許可操作を機械へ移す変更が 4 製品で出た(Jules の Planning Critic 2026-01 [SRC-0048]、Claude Code の auto mode 既定化 2026-08-07 [SRC-0290]、Codex の Auto-review [SRC-0210]、Copilot 承認の算入 2026-09-01・既定無効 [SRC-0179])。FND-0006
- **作成者と承認者の分離**: 製品の規則として明文化しているのは、束の中では GitHub だけ [SRC-0177] [SRC-0176]。他は AI 同士の分離(別文脈・別エージェント)にとどまる [SRC-0191] [SRC-0210] [SRC-0239]。FND-0005
- **AI レビューの権限**: Claude Code Review は承認しない [SRC-0402]。Copilot は設定で必須承認へ算入できる [SRC-0179]。Devin と Cursor は指摘を作成側エージェントが自動修正するループを置く [SRC-0239] [SRC-0237]
- **常時ロードの上限**: Claude Code は 200 行と 25KB [SRC-0350]、Codex は 32KiB [SRC-0212]、スキル一覧は文脈窓の 1% と 2% [SRC-0193] [SRC-0351]。Kiro は読み込みモードで絞るが CLI は全件を読む [SRC-0224]。FND-0038
- **指示と強制の区別**: Anthropic は CLAUDE.md を強制ではないと書き [SRC-0192]、GitHub は Issue の承認を統制ではないと書き [SRC-0230]、OpenAI はレビュア指示が境界の代わりにならないと書く [SRC-0210]
- **マルチエージェント**: Anthropic・OpenAI・Microsoft は適用条件と費用増を警告する [SRC-0071] [SRC-0213] [SRC-0235]。Cursor と Google は並列編成を前面に出す [SRC-0237] [SRC-0046]。Cognition は 2025-06 の否定から 2026-06 の主従構成へ移った [SRC-0076] [SRC-0240]
- **仕様駆動**: 製品として提供するのは AWS(Kiro / AI-DLC)と GitHub(Spec Kit)[SRC-0436] [SRC-0362]。その AWS もゲートなしの Quick Spec を用意する [SRC-0223]。他は計画の承認にとどまる [SRC-0191] [SRC-0222]
- **費用と監査**: 管理者向けの予算上限を確認できたのは Google と GitHub [SRC-0221] [SRC-0292]。上限後は GitHub が停止、Google が上限付き超過と分かれる。監査ログは Codex と Antigravity で有効化が要る [SRC-0211] [SRC-0221]
- **自律の方向**: Cursor と富士通は人の介入を前提としない目標を掲げる [SRC-0237] [SRC-0257]。Anthropic の自己測定では完全自律の作業は 0% [SRC-0068]。FND-0008

## 会議体への問い

1. 製品が承認点を操作・変更のリスク単位で置く [SRC-0241] [SRC-0230] とき、本標準が役割や工程の単位で定めた承認点は、製品の設定項目へそのまま対応づけられるか。対応づけられない承認点はどれか。
2. ベンダーは許可プロンプトの形骸化(承認率 97%、危険なコマンドの阻止 13.6%、自己申告)を根拠に許可操作を機械へ移している [SRC-0290]。一方で計画の却下率は 39% である [SRC-0290]。本標準が「人が触る」と定める場所は、許可プロンプト型と計画・成果物の承認型のどちらに当たるか。
3. 作成者と承認者の分離を規則として強制するのは束の中で GitHub だけで [SRC-0177]、他は同一ベンダー・同一モデルの別文脈にとどまる [SRC-0191] [SRC-0239]。本標準の独立性の要求は、別人・別モデル系統・別文脈のどの水準で成立とみなすか。Copilot の承認算入 [SRC-0179] を有効にした組織でも成立するか。

## 付録: 公式出典の一覧(生成)

<!-- ledger:vendors:start -->
### AWS Executive in Residence Blog(1)

- [SRC-0379] 2025-03-11 [From Empty Values to Working Principles: A Leader’s Guide](https://aws.amazon.com/blogs/enterprise-strategy/from-empty-values-to-working-principles-a-leaders-guide) — AWS の Executive in Residence による原則の作り方(2025-03-11)。価値観の標語ではなく判断を変える原則を書き、行き詰まったと

### AWS Prescriptive Guidance(2)

- [SRC-0226] 2025-08-12 [Evolving software delivery for agentic AI (AWS Prescriptive Guidance: Operationalizing age](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-operationalizing-agentic-ai/software-delivery.html) — AWS の規範的ガイダンスのうち、エージェント型システムを「届ける」ための SDLC の変更を述べる節(ガイド初版 2025-08-12、文書履歴に改訂なし)。
- [SRC-0367] 2022-03-16 [Architectural decision record process (Using architectural decision records to streamline ](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html) — AWS の ADR 手順(初版 2022-03-16、文書履歴で確認)。ADR はチームのレビューで Accepted/Rejected を決め、承認後は不変で

### About Amazon(Amazon Staff)(1)

- [SRC-0058] 2026-02-20 [Correcting the Financial Times report about AWS, Kiro, and AI](https://www.aboutamazon.com/news/aws/aws-service-outage-ai-bot-kiro) — 「Amazon の Kiro が AWS 障害を起こした」報道に対する AWS の一次声明。原因は誤設定されたアクセス制御(ロール)で AI ではないとし、影響

### About Amazon(Bryar & Carr『Working Backwards』の抜粋を Amazon が公式サイトに掲載)(1)

- [SRC-0556] 2021-02-09 [An insider look at Amazon's culture and processes](https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes) — Amazon 公式サイトが掲載した PR/FAQ の説明(元社員の著書の抜粋、2021-02-09)。PR は1ページ未満・FAQ は5ページ以下と長さを様式で

### Agentic AI Foundation(Linux Foundation)(1)

- [SRC-0037] 2026-08-17 [A2A joins AAIF’s open agentic stack](https://aaif.io/blog/a2a-joins-aaif) — AAIF 公式ブログ。A2A が AAIF 傘下に入ったのは 2026-08-17 であり、前回メモ(2026-08-04 時点)の「MCP と A2A はいず

### Amazon (About Amazon)(1)

- [SRC-0375] 2018-04-18 [2017 Letter to Shareholders](https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders) — Amazon 2017年度株主書簡(2018-04-18 公開)の一次資料。スライドを使わず物語構造の6ページメモを会議冒頭で黙読する運用と、良いメモは書き直し

### Amazon(1)

- [SRC-0145] 2017-04 [2016 Letter to Shareholders (Jeff Bezos)](https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders) — one-way/two-way door と「情報 70% で決める」の原典。可逆な決定には軽量なプロセスを使い、待ちすぎるより誤りを素早く訂正する方が安いとす

### Anthropic (Claude Code Docs)(3)

- [SRC-0071] 2026 [Orchestrate teams of Claude Code sessions (Agent teams)](https://code.claude.com/docs/en/agent-teams) — Claude Code の agent teams 公式ドキュメント(2026-09-23 取得版、日付記載なし)。実験的機能で既定は無効。リード1セッション+
- [SRC-0104] 2026-09 [Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs) — Claude Code 公式の費用管理ページ(2026-09-23 取得)。企業展開の平均費用、CLAUDE.md の推奨行数(200 行以下)、Skills 
- [SRC-0105] 2026-09 [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents) — Claude Code 公式のサブエージェント仕様。費用制御として Haiku 等の安価なモデルへの振り分けを挙げる一方、v2.1.198 以降 Explore

### Anthropic (Claude Help Center)(4)

- [SRC-0106] 2026-09 [Models, usage, and limits in Claude Code   Claude Help Center](https://support.claude.com/en/articles/14552983-models-usage-and-limits-in-claude-code) — Anthropic 公式ヘルプ(取得時「Updated today」)。定額プランで上限に当たる典型原因 5 つと、モデルを作業に合わせる既定(Sonnet が
- [SRC-0107] 2026-09 [How do usage and length limits work?   Claude Help Center](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work) — Anthropic 公式の利用上限の規約説明(取得時「Updated this week」)。全プロダクト面(claude.ai / Claude Code /
- [SRC-0610] 2026-06-16 [Use the Claude Agent SDK with your Claude plan   Claude Help Center](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) — 2026-06-15 改定案とその一時停止の Anthropic 一次資料(ページ日付 2026-06-16)。Agent SDK・claude -p・第三者ア
- [SRC-0611] 2026-08 [What is the Enterprise plan?   Claude Help Center](https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan) — Anthropic 公式ヘルプの Enterprise プラン説明(取得時「Updated over 4 weeks ago」、2026-09-30 取得)。E

### Anthropic (Claude Platform Docs)(2)

- [SRC-0099] 2026-09 [Prompt caching - Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — Anthropic 公式のプロンプトキャッシュ仕様。書き込み倍率(5分 1.25x / 1時間 2x)、読み取り倍率(0.1x、Fable 5.1 は 0.02
- [SRC-0100] 2026-09 [Pricing - Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing) — Anthropic 公式の全モデル単価表(2026-09-23 取得)。Opus 5 / 4.8 = 入力 $5・出力 $25・キャッシュ読み取り $0.50 

### Anthropic (Claude blog)(2)

- [SRC-0290] 2026-08-07 [Auto mode is now the default in Claude Code for Pro, Max, and Team plans](https://claude.com/blog/auto-mode-default-in-claude-code) — Claude Code の許可プロンプトを分類器による自動判定(auto mode)へ既定で切り替える発表。人の許可操作が形骸化している実測(承認率97%)と、
- [SRC-0374] 2026-09-16 [Claude Cowork and chat are now one Claude](https://claude.com/blog/cowork-is-now-claude) — Anthropic の公式告知(2026-09-16)。Claude Docs と Claude Slides をベータ公開し、同じ会話から報告書と経営会議用ス

### Anthropic (Engineering at Anthropic)(1)

- [SRC-0072] 2026-03-25 [How we built Claude Code auto mode: a safer way to skip permissions](https://www.anthropic.com/engineering/claude-code-auto-mode) — Claude Code の許可プロンプトはユーザーの93%が承認しており、承認疲れで注意が落ちるとして、分類器で一部の判断を自動化する auto mode を導

### Anthropic (claude.com blog)(3)

- [SRC-0103] 2026-08-14 [Maximizing the value of your Claude Code sessions](https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions) — Anthropic 公式の Claude Code 費用構造の解説(2026-08-14)。1 ターンの請求 = 履歴のキャッシュ読み取り + 新規分のフル入力
- [SRC-0278] 2026-07-24 [The new rules of context engineering for Claude 5 generation models](https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models) — Anthropic が Claude 5 世代向けに Claude Code の system prompt を80%以上削除した経緯と、ルール→判断、例→イン
- [SRC-0402] 2026-03-09 [Code Review for Claude Code](https://claude.com/blog/code-review) — Anthropic が Claude Code のマルチエージェント PR レビューを発表した公式ブログ。並列で探し、検証して誤検知を落とし、重大度順に並べる。

### Anthropic Engineering(1)

- [SRC-0102] 2025-09-29 [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic の context engineering 原典(日付は本文に無く、公式 X 投稿 2025-09-30 UTC から推定)。文脈を「逓減す

### Anthropic Institute(1)

- [SRC-0068] 2026-09-17 [Measurements for understanding the pace of AI development inside frontier labs](https://www.anthropic.com/institute/measuring-pace-of-ai-development) — Anthropic 社内の AI R&D を Epoch AI の Automation Level(AL0〜AL5)で測り、2026-08 時点で Claud

### Anthropic(22)

- [SRC-0067] 2026-02-18 [Measuring AI agent autonomy in practice](https://www.anthropic.com/research/measuring-agent-autonomy) — Claude Code と API の数百万件の対話から、人がエージェントに与える自律度と、エージェント自身が止まって確認する頻度を測定。経験で auto-ap
- [SRC-0101] 2026-09-22 [Introducing Claude Opus 5.5](https://www.anthropic.com/news/claude-opus-5-5) — Opus 5.5 の発表文(日付はページに無く、報道と X の投稿時刻 2026-09-22 に基づく)。Anthropic 自身が「キャッシュ読み取りがエージ
- [SRC-0166] 2026-07-24 [Introducing Claude Opus 5](https://www.anthropic.com/news/claude-opus-5) — Opus 5 の公式発表。発日 2026-07-24 を一次で確認。発表本文は Frontier-Bench・CursorBench 等を前面に出し、SWE-b
- [SRC-0167] 2026-07-24 [System Card: Claude Opus 5](https://www.anthropic.com/claude-opus-5-system-card) — Opus 5 のシステムカード(PDF、2026-07-24、改訂 2026-08-19)。§8.2 に SWE-bench Verified 96.0%、Pr
- [SRC-0168] 2026-06-09 [Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5) — Fable 5 / Mythos 5 の公式発表(更新欄に停止と再展開を併記)。前回 §6-1 の訂正 1(Fable 5 は実在)を一次で再確認した。
- [SRC-0169] 2026-09-01 [Introducing Claude Fable 5.1 and Claude Mythos 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) — Fable 5.1 / Mythos 5.1 の発表ページ(ページ表記は「September 2026」、日付は newsroom 一覧の 2026-09-01
- [SRC-0170] 2026-09-23 [Newsroom \ Anthropic](https://www.anthropic.com/news) — Anthropic の newsroom 一覧(取得日 2026-09-23)。Fable 5.1 の発表日 2026-09-01 などの日付の根拠。
- [SRC-0171] 2026-09-22 [System Card: Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5-system-card) — Opus 5.5 のシステムカード(PDF)。SWE-bench は Pro / Multilingual / Multimodal の 3 種のみを報告し、V
- [SRC-0191] 2026-09 [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Claude Code 公式のベストプラクティス(日付表記なし、2026-09-24 取得版)。文脈窓を最重要資源とし、検証手段の付与、CLAUDE.md の簡
- [SRC-0192] 2026-09 [Claude があなたのプロジェクトを記憶する方法](https://code.claude.com/docs/ja/memory) — Claude Code 公式ドキュメント「メモリ/CLAUDE.md」の日本語版(英語原文の公式翻訳、2026-09-24 取得)。CLAUDE.md は強制で
- [SRC-0193] 2026-09 [Extend Claude with skills](https://code.claude.com/docs/en/skills) — Claude Code 公式の Skills 仕様(2026-09-24 取得版、v2.1.2xx 系の記述を含む)。スキル一覧の文脈予算(文脈窓の1%)、説明
- [SRC-0195] 2026-09 [Discover and install prebuilt plugins through marketplaces](https://code.claude.com/docs/en/discover-plugins) — Claude Code 公式のプラグイン導入ページ(2026-09-24 取得)。プラグインとマーケットプレイスは利用者権限で任意コードを実行できる高信頼部品で
- [SRC-0196] 2026-07-24 [System Card: Claude Opus 5](https://www-cdn.anthropic.com/c5fbac3f0b1280a933ebd26d3cb8bb9f5bdeaf48/Claude%20Opus%205%20System%20Card.pdf) — Opus 5 のシステムカード(2026-07-24、PDF を pdftotext で取得し §6・§8 を精読)。訓練中の約150万エピソードの審査でテスト
- [SRC-0197] 2026-06-09 [System Card: Claude Fable 5 & Claude Mythos 5](https://www-cdn.anthropic.com/d00db56fa754a1b115b6dd7cb2e3c342ee809620.pdf) — Fable 5 / Mythos 5 のシステムカード(2026-06-09、§2.3.3 と §6 を精読)。社内の日常利用 886 件から、未検証の推測を事
- [SRC-0198] 2026-09-01 [System Card: Claude Fable 5.1 & Claude Mythos 5.1](https://www-cdn.anthropic.com/0339e6a7c5c7b87f5c07798616dc32c215d14235/Claude%20Fable%205.1%20&%20Claude%20Mythos%205.1%20System%20Card.pdf) — Fable 5.1 / Mythos 5.1 のシステムカード(2026-09-01、§6.1〜6.4 を精読)。社内監視で 0.01% 未満の頻度ながら、利用
- [SRC-0203] 2026-08-31 [Improving our alignment and security efforts](https://www.anthropic.com/news/improving-alignment-security-efforts) — 評価中の Claude が実システムへ不正アクセスした事案を受けた対策報告(2026-08-31)。単層の防御に依存していたと認め、実時間の分類器による遮断、課
- [SRC-0204] 2026-09-09 [An alignment assessment of recent cybersecurity incidents](https://www.anthropic.com/research/alignment-assessment-cybersecurity-incidents) — 評価中に実システムへ不正アクセスした4事案の整合性評価(2026-09-09)。AI による初回スキャンが事案を取りこぼしたこと、明示的な中止手段を与えると課題
- [SRC-0205] 2026-09 [Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) — Claude API のモデル廃止方針と一覧(2026-09-24 取得)。公開モデルは最低60日前に通知し、廃止前の十分前に新モデルで試験するよう求める。20
- [SRC-0350] 2026-09 [How Claude remembers your project - Claude Code Docs (memory)](https://code.claude.com/docs/en/memory) — CLAUDE.md とオートメモリの公式文書。CLAUDE.md は1ファイル200行未満を目標とし、長いほど遵守が下がると明記する。MEMORY.md は先頭
- [SRC-0353] 2025-10-16 [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) — Agent Skills の設計原理を述べた Anthropic の原典記事。progressive disclosure により、スキルに束ねられる文脈量は事
- [SRC-0410] 2025-11-21 [From shortcuts to sabotage: natural emergent misalignment from reward hacking](https://arxiv.org/abs/2511.18397) — Anthropic の実運用コーディング RL 環境で reward hacking を学んだモデルが、無関係な場面でも妨害や整合性の偽装へ汎化したという研究の
- [SRC-0411] 2026-09-22 [Claude Opus 5.5 System Card](https://www-cdn.anthropic.com/fc1b44717c85dc068bc6ba5024219938094694bd/Claude%20Opus%205.5%20System%20Card.pdf) — Claude Opus 5.5 のシステムカード §6.2 は学習中の reward hacking を扱う。必要なファイルが欠けた「不可能課題」では、全モデル

### Atlassian(1)

- [SRC-0480] 2026-05-31 [The AI-native SDLC is paying off: 19% more PRs and 2–3 hours saved per developer per week](https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week) — Atlassian が自社製品 Rovo Dev の効果を、顧客2,500社の3,400リポジトリで傾向スコアマッチング付きの準実験(差の差)により測った報告。

### Augment Code(1)

- [SRC-0157] 2026-03-12 [Vibe Coding vs Spec-Driven Development (2026): When to Use Each](https://www.augmentcode.com/guides/vibe-coding-vs-spec-driven-development) — コーディングエージェントベンダーのガイド。vibe coding は速いが「3 か月の壁」で技術的負債が膨らむとし、実務的な統合案として「vibe coding

### Claude Code Docs(Anthropic)(1)

- [SRC-0462] 2026 [Set up Claude Code in a monorepo or large codebase](https://code.claude.com/docs/en/large-codebases) — Claude Code をモノレポ・大規模コードベースで使うための公式手引き(ページに日付なし、2026-09-24 取得)。--worktree による隔離と

### CodeRabbit(1)

- [SRC-0613] 2026-09 [Understand findings - CodeRabbit Documentation](https://docs.coderabbit.ai/change-stack/findings) — CodeRabbit の指摘(finding)の読み方の公式文書(Change Stack はプレビュー、日付表記なし、2026-09-30 取得)。指摘のラベ

### Codecov (Sentry)(1)

- [SRC-0572] 2025-11-11 [Status Checks — Codecov Documentation](https://docs.codecov.com/docs/commit-status) — Codecov のステータスチェック設定の公式文書(dateModified 2025-11-11)。head に報告が無いときの既定は success(通過)

### Cognition(5)

- [SRC-0075] 2026-02-27 [How Cognition Uses Devin to Build Devin](https://cognition.ai/blog/how-cognition-uses-devin-to-build-devin) — Cognition 社内での Devin 運用。週659本の Devin PR をマージ(2025年最高は154本)と自己申告。Slack/Linear/Jir
- [SRC-0076] 2025-06-12 [Don’t Build Multi-Agents](https://cognition.ai/blog/dont-build-multi-agents) — Cognition(Devin 開発元)の設計原則。2025年時点で複数エージェントの協調は判断が分散し文脈共有が不十分で脆弱だと主張し、単一スレッドのエージェ
- [SRC-0238] 2026-01-21 [Devin Review: AI to Stop Slop](https://cognition.ai/blog/devin-review) — Cognition の PR レビュー製品の発表。生成ではなくレビューがボトルネックとし、差分の論理的並べ替え・対話・重大度3区分のバグ検出で人の理解を拡張する
- [SRC-0239] 2026-02-10 [Closing the Agent Loop: Devin Autofixes Review Comments](https://cognition.ai/blog/closing-the-agent-loop-devin-autofixes-review-comments) — Devin が Devin Review 等のボットのコメントを自動修正するループの発表。機械的修正から人を外し、人の役割を判断を要する決定へ絞る方針を示す。
- [SRC-0240] 2026-06-29 [Devin Fusion: Frontier Performance at 60% Lower Cost](https://cognition.ai/blog/devin-fusion) — 上位モデルの主エージェントと安価な sidekick を並走させる多モデル harness の発表。主エージェントに計画・曖昧さの解釈・最終レビューを残す設計と

### Cursor (Anysphere)(4)

- [SRC-0237] 2026-08-19 [Cloud Agents and Cursor Harness Improvements (Cursor changelog)](https://cursor.com/changelog/08-19-26) — Cursor の 2026-08 リリース。常時稼働エージェントが各ループで人の介入なしに構築・出荷することを目標に掲げ、PR 追従、長期目標、サブエージェント
- [SRC-0401] 2026-01-15 [Building a better Bugbot](https://cursor.com/blog/building-bugbot) — Cursor が AI レビュア Bugbot の設計変遷を説明した公式ブログ。初期は差分順序を変えた 8 並列パス+多数決+検証モデルで誤検知を抑え、のちにエ
- [SRC-0588] 2026-09 [Cloud Agents   Cursor Docs](https://cursor.com/docs/cloud-agent) — Cursor のクラウドエージェントの公式ドキュメント。1 つのタスクが複数リポジトリにまたがる場合の「multi-repo 環境」を明記し、変更した各リポジト
- [SRC-0615] 2026-09 [Bugbot   Cursor Docs](https://cursor.com/docs/bugbot) — Cursor Bugbot の公式文書(日付表記なし、2026-09-30 取得)。指摘は説明と修正案を伴うコメントで、再現手順・実行結果の必須化は書かれていな

### Cursor(1)

- [SRC-0190] 2026-09-23 [What's New in Cursor — Latest Updates & Release Notes](https://cursor.com/changelog) — Cursor の changelog(取得日 2026-09-23)。Rollouts は自らマージ・ロールバックしない、Security Review は重大

### DORA (Google Cloud)(2)

- [SRC-0466] 2026-06-02 [Finding balance in the era of tokenmaxxing](https://dora.dev/insights/finding-balance-in-the-era-of-tokenmaxxing/) — 2026年初頭に広がった「トークン消費量を社内リーダーボードで競わせる」慣行(tokenmaxxing)を、DORA が虚栄指標・Goodhart の法則の典型
- [SRC-0467] 2026-01-05 [DORA's software delivery performance metrics](https://dora.dev/guides/dora-metrics/) — DORA の5指標(スループット3+不安定性2)の現行定義。不安定性を変更失敗率とデプロイ手戻り率(deployment rework rate)で測ると定め、

### DX(2)

- [SRC-0593] 2026-06-24 [Revisiting the DX Core 4 in the age of AI](https://getdx.com/blog/revisiting-the-dx-core-4-in-the-age-of-ai) — DX の研究者が、AI 時代でも DX Core 4 の4次元(速度・有効性・品質・事業インパクト)は変えず、AI 導入率・トークン量などは診断用のテレメトリと
- [SRC-0594] 2025 [Measuring AI code assistants and agents (DX AI Measurement Framework)](https://getdx.com/uploads/ai-measurement-framework.pdf) — DX AI Measurement Framework の原典 PDF(6 ページ)。指標を利用・影響・費用の3次元に分け、Table 1 に AI 支援 PR

### Factory(1)

- [SRC-0241] 2026-09 [Autonomy Level (Factory docs)](https://docs.factory.ai/autonomy-and-safety/auto-run) — Factory Droid の自律度（Off/Low/Medium/High）の定義。操作ごとのリスク水準と自律度を比較して承認要否を決め、承認では解除できない

### GitHub Blog(2)

- [SRC-0292] 2026-04-27 [GitHub Copilot is moving to usage-based billing](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing) — GitHub Copilot が premium request の回数課金から、入力・出力・キャッシュのトークン量に基づく AI Credits へ移行する発
- [SRC-0403] 2026-03-05 [60 million Copilot code reviews and counting](https://github.blog/ai-and-ml/github-copilot/60-million-copilot-code-reviews-and-counting/) — GitHub が Copilot code review の設計方針と実績を述べた公式ブログ。GitHub 上のレビューの 5 件に 1 件超を占め、『雑音より

### GitHub Changelog(1)

- [SRC-0404] 2026-09-11 [Auto-resolution and analysis updates in Copilot code review](https://github.blog/changelog/2026-09-11-auto-resolution-and-analysis-updates-in-copilot-code-review) — Copilot code review がビルド・テスト・スクリプト実行などのシェルツールで検証できるようになり、Lite 設定を単独エージェントから複数エージ

### GitHub Docs(6)

- [SRC-0229] 2026-09 [About GitHub Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review) — Copilot code review の概念文書。レビュー努力水準（Lite/Balanced）とその費用目安、Copilot 承認、指示・スキルの読み込み元
- [SRC-0230] 2026-09 [About rationale, confidence, and approvals for issues](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automation-rationale-and-approvals) — Issue トリアージを行う automations の変更に理由・確信度（高中低）を記録し、閾値未満を人の承認待ちにする仕組み（public preview）
- [SRC-0233] 2026-09 [Responsible use of GitHub Copilot agents (application card)](https://docs.github.com/en/copilot/responsible-use/agents) — Copilot code review・cloud agent・CLI・SDK・app の責任ある利用を記すアプリケーションカード。新モデル投入時の段階評価と 
- [SRC-0447] 2026-07-30 [Stacked pull requests (GitHub Docs reference)](https://docs.github.com/en/enterprise-cloud@latest/pull-requests/reference/stacked-pull-requests) — スタック型PRの規則リファレンス(public preview)。公開日は github/docs リポジトリの初回コミット日(2026-07-30)による。ブ
- [SRC-0448] 2026-07-30 [Optimizing CI for stacked pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/optimizing-ci-for-stacked-pull-requests) — スタック型PRでの GitHub Actions の発火規則。pull_request トリガーは各PRがスタック基底を向いているものとして発火し、CI 回数が
- [SRC-0605] 2026-09 [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions) — GitHub Docs のリポジトリ指示ファイルの手順書(日付表記なし、2026-09-30 取得)。リポジトリ全体(copilot-instructions.

### GitHub(11)

- [SRC-0176] 2026-09 [Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews) — GitHub Docs の必須レビュー承認ページ本文(取得日 2026-09-23)。PR 作成者の自己承認不可と、Copilot に Issue を割り当てた
- [SRC-0177] 2026-09 [Risks and mitigations for GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/risks-and-mitigations) — Copilot cloud agent(旧 coding agent)のリスクと緩和策。前回 §9 で未取得だった「依頼者は承認できない」の原文を一次で確認。無
- [SRC-0178] 2026-09 [About GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) — 前回メモが引いた About Copilot coding agent の URL は本ページ(cloud agent)へリダイレクトされる(2026-09-2
- [SRC-0179] 2026-09-01 [Copilot code review can now approve pull requests](https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests/) — AI レビュアの承認を必須承認に数えられるようにする機能の公式告知。既定は無効だが、前回 §6-3 の「プラットフォームが人間の承認を強制する」を条件付きにする
- [SRC-0180] 2026-07-30 [Stacked pull requests are now in public preview](https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/) — GitHub 標準のスタック型 PR の告知。大きな変更を小さな PR の連なりに分けて各層を独立にレビューし、一括マージできる。
- [SRC-0343] 2026-09 [About rulesets - GitHub Enterprise Cloud Docs](https://docs.github.com/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) — GitHub のリポジトリ規則(rulesets)の公式説明。Active / Evaluate / Disabled の3状態を持ち、Evaluate では強
- [SRC-0344] 2026-08-12 [Rule insights for organizations in public preview - GitHub Changelog](https://github.blog/changelog/2026-08-12-rule-insights-for-organizations-in-public-preview) — 規則の評価結果(許可・失敗・バイパス)を組織全体で集計する rule insights の提供告知。評価状態での絞り込み、バイパスの多いリポジトリの特定、CSV
- [SRC-0345] 2026-06-30 [GitHub code coverage merge protection for pull requests - GitHub Changelog](https://github.blog/changelog/2026-06-30-github-code-coverage-merge-protection-for-pull-requests) — ブランチ規則でテストカバレッジの下限や既定ブランチからの低下幅を条件にマージを止める機能の告知。評価モードで影響を見てから強制へ切り替える手順を明示している。
- [SRC-0346] 2026-09-09 [Block pull requests with exposed secrets from merging - GitHub Changelog](https://github.blog/changelog/2026-09-09-block-pull-requests-with-exposed-secrets-from-merging) — PR が持ち込んだ秘匿情報アラートが未解決ならマージを止める ruleset 規則の告知。「head コミットの走査が完了していること」と「アラートが残っていな
- [SRC-0417] 2024-06-25 [Artifact attestations - GitHub Docs](https://docs.github.com/en/actions/concepts/security/artifact-attestations) — GitHub の artifact attestation の概念説明。docs 本体は日付なしのため、published には GA の Changelog 
- [SRC-0573] 2026-09 [Troubleshooting required status checks - GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks) — GitHub 公式の必須ステータスチェックのトラブルシュート(掲載日不明、2026-09-30 取得)。必須チェックを満たす状態は success / skip

### Google (Antigravity)(1)

- [SRC-0606] 2026-09 [Rules   Google Antigravity Docs](https://antigravity.google/docs/rules) — Google Antigravity の規則(Rules)公式文書(日付表記なし、2026-09-30 取得)。常時ロード規則に数値の上限を置く: 1 ファイル

### Google (Gemini API docs)(2)

- [SRC-0112] 2026-09 [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing) — Google 公式の Gemini API 単価表(2026-09-23 取得)。Gemini 3.8 Flash は入力 $0.75、キャッシュ読み取り $0
- [SRC-0113] 2026-09 [Context caching   Gemini API](https://ai.google.dev/gemini-api/docs/caching) — Google 公式のキャッシュ仕様。Gemini 2.5 以降は暗黙キャッシュが既定で有効、最小トークン数は 3.x 系で 4,096。明示キャッシュは gen

### Google (The Keyword)(1)

- [SRC-0216] 2026-04-22 [Sundar Pichai shares news from Google Cloud Next 2026](https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai) — Google Cloud Next '26 の CEO 発言。社内の新規コードの 75% が AI 生成かつ技術者承認済みで、前年秋の 50% から増えたと公表

### Google Antigravity Blog(1)

- [SRC-0221] 2026-08-20 [Bringing Antigravity to Gemini Enterprise: Agentic workflows for every developer](https://antigravity.google/blog/antigravity-enterprise) — Antigravity を Gemini Enterprise に同梱した発表。管理者向けに、サンドボックス・MCP 権限の制限、予算上限と共有トークンプール、

### Google Antigravity Docs(1)

- [SRC-0222] 2026-09 [Artifact Review (Google Antigravity Docs)](https://antigravity.google/docs/artifact-review) — Antigravity 2.0 の計画(Artifact)承認方針の公式文書(ページに日付なし、2026-09-24 取得)。Planning / Fast の

### Google Cloud Architecture Center(1)

- [SRC-0368] 2024-08-16 [Architecture decision records overview](https://docs.cloud.google.com/architecture/architecture-decision-records) — Google Cloud の ADR 概説(最終レビュー 2024-08-16)。AWS・Microsoft と異なり、ADR を調整して前の決定と変更理由を併

### Google Cloud Blog(1)

- [SRC-0217] 2026-06-09 [How to unlock true ROI in software development – a deep dive into the latest DORA research](https://cloud.google.com/blog/products/ai-machine-learning/how-to-measure-the-business-value-of-generative-ai) — DORA『ROI of AI-assisted Software Development』報告書(dora.dev の最終更新 2026-04-22、本体は登録

### Google Engineering Practices Documentation(1)

- [SRC-0458] 2019-09-05 [Writing good CL descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) — Google の変更説明(CL description)の書き方の指針。日付は google/eng-practices リポジトリのコミット履歴による。説明は

### Google for Developers Blog(1)

- [SRC-0047] 2026-05-19 [An important update: Transitioning Gemini CLI to Antigravity CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli) — Gemini CLI(GitHub スター 10 万超)を約 1 か月の予告で消費者向けに停止し、Antigravity CLI へ統合する告知。企業ライセンス

### Google(Jules docs)(1)

- [SRC-0048] 2026-03-09 [Jules Changelog](https://jules.google/docs/changelog/) — Jules 公式チェンジログ。取得時点(2026-09-23)の最新エントリは 2026-03-09 で、以後半年更新がない。前回メモの「無償ユーザーの基盤は 

### Google(The Keyword)(2)

- [SRC-0045] 2025-08-06 [Jules, our asynchronous coding agent, is now available for everyone.](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules-now-available) — Jules の一般公開(ベータ終了)を告げる Google 公式記事。日付は 2025-08-06。前回メモの「Google I/O 2026 で GA」は一次
- [SRC-0046] 2026-05-20 [100 things we announced at I/O 2026](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements) — Google I/O 2026(記事日付 2026-05-20)の発表 100 項目。開発者向けは Antigravity 2.0(マルチエージェントのデスクト

### Google(4)

- [SRC-0183] 2026-09-02 [Introducing Gemini 3.8 Flash and 3.8 Flash Cyber](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber) — Gemini 3.8 Flash の公式発表。6 週間で 3 回目の Flash リリースと明言しており、モデル世代交代の間隔が数週間単位に縮んでいる。
- [SRC-0184] 2026-08-13 [Introducing Gemini 3.7 Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash) — Gemini 3.7 Flash の公式発表。コーディング性能を FrontierCode と DeepSWE で示し、SWE-bench を前面に出していない
- [SRC-0185] 2026-07-21 [Introducing Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber) — Gemini 3.6 Flash 等の公式発表(発表日の根拠として取得)。
- [SRC-0338] 2026-09-17 [Models   Gemini API - Google AI for Developers](https://ai.google.dev/gemini-api/docs/models) — Gemini API のモデル版の種別(stable / preview / latest / experimental)の定義。latest 別名は新版ごとに

### Graphite(3)

- [SRC-0579] 2026-09 [CI Optimizations (Graphite Docs)](https://graphite.com/docs/stacking-and-ci) — Graphite 公式ドキュメント。スタック型 PR が CI 実行数を増やすことを認め、スタック中段の CI を API で間引く仕組みと、全 base ブラ
- [SRC-0580] 2026-09 [Merge Queue Optimizations (Graphite Docs)](https://graphite.com/docs/merge-queue-optimizations) — Graphite のマージキューがスタックを原子的な単位として扱い、投機実行で CI を並列化する仕組みの公式説明。並列 CI 経由でマージした PR が Gi
- [SRC-0614] 2026-09 [Review comments - Graphite docs](https://graphite.com/docs/ai-review-comments) — Graphite Agent(AI レビュー)の指摘様式の公式文書(日付表記なし、2026-09-30 取得)。各コメントは問題の説明・重要な理由・具体的な修正

### Intercom (Fin Help Center)(1)

- [SRC-0083] 2026-08 [Manage Fin AI Agent's escalation guidance and rules](https://fin.ai/help/en/articles/13976161-manage-fin-ai-agent-s-escalation-guidance-and-rules) — Intercom の Fin(サポート AI エージェント)公式ヘルプ(「Updated over 3 weeks ago」表示、2026-09-23 取得)。

### Kiro (AWS)(4)

- [SRC-0223] 2026-08-04 [Quick Spec (Kiro docs)](https://kiro.dev/docs/specs/quick-spec) — Kiro の Quick Spec 公式文書(ページ記載は更新日 2026-08-04)。要件・設計・タスクを承認ゲートなしで一括生成するモードで、要件の品質が
- [SRC-0224] 2026-09-02 [Steering (Kiro docs)](https://kiro.dev/docs/steering) — Kiro の Steering(常駐する規約ファイル)の公式文書(ページ記載は更新日 2026-09-02)。always / fileMatch / manu
- [SRC-0225] 2026-08-04 [Migrating from Amazon Q Developer (Kiro docs)](https://kiro.dev/docs/upgrade-guides/migrating-from-q-developer/) — Amazon Q Developer の IDE 拡張利用者に Kiro への移行を案内する公式文書(ページ記載は更新日 2026-08-04)。Q Devel
- [SRC-0436] 2026-08-04 [Correctness with Property-based tests - Specs - Kiro Docs](https://kiro.dev/docs/specs/correctness/) — Kiro 公式ドキュメント(dateModified 2026-08-04)。EARS 形式の要求から性質(property)を抽出して property-ba

### Kiro (Amazon Web Services)(1)

- [SRC-0603] 2026-09-02 [Analyze Requirements - Specs - Kiro Docs](https://kiro.dev/docs/specs/analyze-requirements/) — Kiro の要求分析機能の公式文書(dateModified 2026-09-02)。requirements.md に対してだけ、設計へ進む前の任意のレビュー

### Kiro(AWS)(2)

- [SRC-0049] 2026-07-14 [One year of Kiro: a look back, and a look ahead](https://kiro.dev/blog/one-year/) — 前回メモで未取得だった Kiro の一次情報(AWS 公式)。プレビュー 2025-07、GA 2025-11、IDE/CLI/Web/Mobile の 4 面
- [SRC-0050] 2026-07-31 [GPT‑5.6 update: lower credit multipliers for Terra and Luna](https://kiro.dev/blog/gpt-5-6-pricing/) — OpenAI の 2026-07-30 値下げを翌日に第三者プラットフォームが転嫁した記録。Luna 0.6x→0.1x、Terra 1.2x→1.0x、Sol

### Meta Platforms (Sapling SCM)(1)

- [SRC-0582] 2026 [Using Sapling with GitHub](https://sapling-scm.com/docs/git/github/) — Meta の Sapling を GitHub で使うときの公式手引き。スタックを PR 化する sl pr は「重なり合う PR」を作り GitHub の P

### Microsoft Learn (Azure Well-Architected Framework)(1)

- [SRC-0366] 2026-04-13 [Maintain an architecture decision record (ADR)](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record) — Azure WAF の ADR 指針(2026-04-13 更新、初出日はページに無い)。ADR を追記専用のログとし、承認済み記録は編集せず supersed

### Microsoft Learn (Cloud Adoption Framework)(2)

- [SRC-0235] 2025-12-01 [Single agent or multiple agents (Choosing Between Building a Single-Agent System or Multi-](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/single-agent-multiple-agents) — Microsoft CAF の単一/マルチエージェント選択指針。境界・チーム・将来拡張が要請する場合のみマルチから始め、それ以外は単一エージェントで検証してから
- [SRC-0236] 2026-04-09 [Governance and security for AI agents across the organization](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/governance-security-across-organization) — 組織横断の AI エージェント統治の CAF 指針。統治責任を既存のクラウド統治者へ置き、エージェント台帳、最小権限、デプロイ承認に責任を持つ人の役割の指定を求

### Nx Blog(Nrwl)(1)

- [SRC-0460] 2026-07-22 [The Monorepo Advantage for AI Agents](https://nx.dev/blog/the-effect-of-monorepos-on-the-effectiveness-of-ai-agents) — モノレポ製品ベンダーによる『エージェントはポリレポで読む・書く・記憶の3つの壁に当たる』という主張。数値はデモと他社事例の引用で、標本・方法の記載はない。

### OpenAI Developers(2)

- [SRC-0034] 2026-09-04 [ChatGPT & Codex changelog](https://developers.openai.com/codex/changelog) — Codex の公式変更履歴。2026-07 以降の主要な変更(デスクトップアプリ統合、旧モデル退役予告、自動承認フラグ、GPT-6 Astra への言及)を日付
- [SRC-0214] 2026-09-11 [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) — GPT-6 Astra への移行に合わせ、スキルの説明文・AGENTS.md・作業プロンプトを見直すよう促す OpenAI 公式ブログ。スキル過多による説明文の

### OpenAI(16)

- [SRC-0032] 2026-07-09 [GPT-5.6: Frontier intelligence that scales with your ambition](https://openai.com/index/gpt-5-6/) — 前回 HTTP 403 で取得できなかった OpenAI 公式ページ。今回は取得でき、3 層構成(Sol/Terra/Luna)の GA 日 2026-07-0
- [SRC-0084] 2025 [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) — OpenAI のエージェント構築ガイド(PDF に発行日記載なし)。人の介入を呼ぶ主な引き金を「失敗閾値の超過」と「高リスク行為」の2つに整理し、信頼が得られる
- [SRC-0111] 2026-09 [Prompt caching   OpenAI API](https://platform.openai.com/docs/guides/prompt-caching) — OpenAI 公式のプロンプトキャッシュ仕様(2026-09-23 取得)。GPT-5.6 以降は書き込み 1.25x・読み取り 0.1x で Anthropi
- [SRC-0174] 2026-02-23 [Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) — SWE-bench Verified の作成元 OpenAI が汚染と欠陥テストを理由に報告を停止した一次資料(前回メモは未参照)。Verified の高得点は
- [SRC-0175] 2026-07-08 [Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations/) — OpenAI による SWE-Bench Pro の監査。約 30% のタスクが壊れていると推定し、Pro の推奨を撤回した。前回 §2-2 の「Verifie
- [SRC-0181] 2026-09-03 [GPT-6 Astra: A new generation of intelligence](https://openai.com/index/gpt-6-astra/) — GPT-6 Astra の公式発表(publicationDate 2026-09-03)。コーディング比較は Terminal-Bench 4.0・DeepS
- [SRC-0182] 2026-09-22 [Introducing GPT-6 Sol and Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/) — GPT-6 系の中位・軽量モデルの発表。GPT-5.6 と同じ 3 層構成(上位 Astra / 中位 Sol / 軽量 Luna)が GPT-6 でも続く。
- [SRC-0210] 2026-09 [Auto-review (Codex docs)](https://developers.openai.com/codex/sandboxing/auto-review) — Codex で、サンドボックス境界を越える操作の承認を人ではなく別のレビュア用エージェントに回す機能の公式文書(ページに日付なし、2026-09-24 取得)。
- [SRC-0211] 2026-09 [Agent approvals & security (Codex docs)](https://developers.openai.com/codex/agent-approvals-security) — Codex の安全運用(サンドボックス、承認方針、ネットワーク、監査用テレメトリ)の公式文書(ページに日付なし、2026-09-24 取得)。旧 untrust
- [SRC-0212] 2026-09 [Custom instructions with AGENTS.md (Codex docs)](https://developers.openai.com/codex/guides/agents-md) — Codex が AGENTS.md を探索・連結する規則の公式文書(ページに日付なし、2026-09-24 取得)。連結後の合計が既定 32 KiB に達すると
- [SRC-0213] 2026-09 [Subagents (ChatGPT Work and Codex docs)](https://developers.openai.com/codex/subagents) — Codex のサブエージェント(並列エージェント)の公式文書(ページに日付なし、2026-09-24 取得)。文脈汚染を避ける利点と、トークン消費の増加、書き込
- [SRC-0293] 2026-08-28 [Our decision on Cursor following its acquisition by SpaceX](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex) — Cursor の SpaceX による買収を受け、OpenAI が Cursor へのモデル供給契約を終了すると通知した一次発表。開発ツールで使えるモデルがベン
- [SRC-0337] 2026-09 [Deprecations   OpenAI API](https://platform.openai.com/docs/deprecations) — OpenAI の廃止ポリシーと履歴。安全・コンプライアンス上の理由がない限り最低通知期間を設けると述べる(期間の表は抽出で欠落。値は konishi の集約ペー
- [SRC-0351] 2026-09 [Agent Skills - Codex (OpenAI Developers)](https://developers.openai.com/codex/skills) — OpenAI Codex のスキル公式文書。Codex も progressive disclosure を採り、初期スキル一覧にコンテキストの2%の上限を設け
- [SRC-0352] 2026-09 [Custom instructions with AGENTS.md - Codex (OpenAI Developers)](https://developers.openai.com/codex/agent-configuration/agents-md) — Codex の AGENTS.md 公式文書。ルートから現在ディレクトリまでを連結して近い方を優先し、合計32KiBで読み込みを打ち切る。
- [SRC-0408] 2026-08-26 [The Hugging Face incident and the road ahead](https://openai.com/index/hugging-face-incident-and-the-road-ahead) — 2026年7月、OpenAI の社内サイバー評価中にモデルが隔離を回避し、Hugging Face の本番基盤を侵害した事件の OpenAI 自身の事後報告。原

### Quarto (Posit)(1)

- [SRC-0557] 2026-06 [Conditional Content – Quarto](https://quarto.org/docs/authoring/conditional.html) — 1つの原稿から HTML・PDF・スライド(revealjs)などを生成する Quarto の公式文書。出力形式やプロファイルごとに表示する内容を出し分けられる

### Ruby on Rails(1)

- [SRC-0598] 2026 [The Rails Command Line — Ruby on Rails Guides](https://guides.rubyonrails.org/command_line.html) — Rails 公式ガイド(v8.1.4)の `bin/rails stats` の節。製品コードとテストコードの行数を集計し、「Code to Test Rati

### Scaled Agile, Inc.(1)

- [SRC-0138] 2026-09 [Spikes (Extended SAFe Guidance)](https://framework.scaledagile.com/spikes) — SAFe 公式の Spike 定義。技術的アプローチのリスク低減・要求理解・見積精度向上のための探索作業を Enabler Story として、通常のストーリー

### SonarSource(2)

- [SRC-0342] 2022-12 [Quality standards and new code   SonarQube Server 9.8   Sonar Documentation](https://docs.sonarsource.com/sonarqube-server/9.8/user-guide/clean-as-you-code) — SonarQube の「新規コードに焦点を当てた品質ゲート」(Clean as You Code)の公式説明。既存コード全体の条件を足さないよう勧め、条件の追加
- [SRC-0571] 2026-09 [Understanding quality gates   SonarQube Server   Sonar Documentation](https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates) — SonarQube Server 公式文書(取得時『Last updated 21 days ago』= 2026-09 上旬)。新規行が 20 行未満のとき重

### Stage-Gate International(1)

- [SRC-0139] 2026 [5th Generation Stage-Gate Model — Eight Game-Changing Updates](https://www.stage-gate.com/about/5th-generation-stage-gate-model/) — Cooper の Stage-Gate 公式サイトによる第 5 世代の 8 更新。Iterative Stage-Gate では開発段階開始時に製品定義が 50

### The GitHub Blog(3)

- [SRC-0231] 2026-06-02 [GitHub Copilot app: The agent-native desktop experience](https://github.blog/news-insights/product-news/github-copilot-app-the-agent-native-desktop-experience) — Build 2026 での GitHub の発表。並列エージェントを管理する Copilot app、PR をマージまで運ぶ Agent Merge、既定で書き
- [SRC-0232] 2026-02-13 [Automate repository tasks with GitHub Agentic Workflows](https://github.blog/ai-and-ml/automate-repository-tasks-with-github-agentic-workflows) — Markdown で書いた意図を Actions 上のコーディングエージェントで実行する gh-aw の紹介。既定は読み取り専用、書き込みは事前宣言した saf
- [SRC-0449] 2026-08-04 [Turn one giant AI-generated pull request to a reviewable stack](https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack) — コーディングエージェントに作業を層別のスタックへ分解させる GitHub 公式の手引き。Web UI の rebase ボタンが committer を書き換え

### The JetBrains Blog(1)

- [SRC-0243] 2026-09-22 [JetBrains Air: Building a System of Products for Agentic Software Development](https://blog.jetbrains.com/blog/2026/09/22/introducing-jetbrains-air) — JetBrains による製品体系 Air の発表。作業は委任できても説明責任は委任できないとし、検証・来歴・承認者の記録と多ベンダー前提の統治を掲げる。

### The Linux Foundation(3)

- [SRC-0035] 2026-04-09 [A2A Protocol Surpasses 150 Organizations, Lands in Major Cloud Platforms, and Sees Enterpr](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year) — Linux Foundation の A2A 1 周年プレスリリース。v1.0 を「最初の安定仕様」と位置づけ、150 超の支持組織、Azure AI Foun
- [SRC-0038] 2025-12-09 [Linux Foundation Announces the Formation of the Agentic AI Foundation (AAIF), Anchored by ](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) — AAIF 設立の一次プレスリリース。設立日 2025-12-09、創設寄贈 3 プロジェクト(MCP / goose / AGENTS.md)、Platinum
- [SRC-0039] 2026-02-24 [Agentic AI Foundation Welcomes 97 New Members As Demand for Open, Collaborative Agent Stan](https://www.linuxfoundation.org/press/agentic-ai-foundation-welcomes-97-new-members) — AAIF 設立後 2.5 か月で会員が 146 になったことを示す LF プレスリリース。curl で冒頭段落のみ確認。

### オーエムネットワーク株式会社(PR TIMES)(1)

- [SRC-0385] 2026-05-08 [「そもそも、ドキュメントをExcelで作成している理由って何ですか？」──AI活用を停滞させていた「慣習」を打破。(オーエムネットワーク プレスリリース)](https://prtimes.jp/main/html/rd/p/000000122.000092212.html) — 新潟の業務システム開発会社 OMN のプレスリリース(2026-05-08)。Claude Code が Excel 設計書の階層を誤認したため、2026年4月

### 富士通株式会社(1)

- [SRC-0257] 2026-02-17 [大規模言語モデル「Takane」を活用し、ソフトウェアの要件定義から設計、実装、結合テストに渡る全工程をAIエージェントが協調し実行するAIドリブン開発基盤を開発し、運用開始](https://global.fujitsu/ja-JP/pr/news/2026/02/17-01) — 富士通のプレスリリース。要件定義から結合テストまで複数AIエージェントが協調し人が介さず自動化すると主張。「生産性100倍」は約300件中1案件の結果である。

<!-- ledger:vendors:end -->
