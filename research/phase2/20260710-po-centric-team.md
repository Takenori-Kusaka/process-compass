# プロダクトオーナー中心のチーム編成論 調査メモ

- Issue: #34
- 作成日: 2026-07-10
- 状態: 一次調査メモ(未清書)
- フェーズ: フェーズ2(理想像 To の調査)

> 目的: 本プロジェクトの元ネタ音声メモにある理想像「AIDLC では、人は本当に決めることだけをやり、プロダクトオーナー(PO)として動くチームだけが存在する」を掘り下げ、この「PO だけのチーム」という理想が暗黙に置いている**前提条件**を明らかにする。
> 記述方針: すべての主張に出典 URL を付け、一次情報(AWS 公式ブログ、スクラムガイド、提唱者一次資料、組織論の原典)を最優先する。**建前(そう語られる理想)と現実(成立条件・崩れる点)を必ず分ける**。フェーズ1の日本ガバナンス調査([research/phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md))と接続する。
> 清書時に図解しやすいよう、流れ・階層・依存関係は入れ子の箇条書きで構造化する。

## 0. このメモの位置づけと全体像

- 扱う問い(3層):
  1. **理想像の出所**: 「AI が実装を担い、人間の役割は WHAT/WHY(意思決定・価値定義)に集約される」という言説は誰がどう語っているか。
  2. **PO の本来の責任**: スクラムガイドの PO 定義を土台に、「全員が PO 化する」とは何を意味するか。
  3. **前提条件と現実の懸念**: この編成が成立するために暗黙に仮定されること、崩れる点、日本の組織文化との衝突。
- 結論の骨子(詳細は §7 考察):
  - 「PO だけのチーム」は、**実装コストがゼロに近づく**という仮定の上に立つ「ボトルネックの上流移動」論である。実装が commodity 化すると律速要因は「何を作るべきか(評価・判断)」に移る、という主張が共通の論理。
  - この理想は、少なくとも4つの能力(価値判断・言語化・検証・権限)が**個人に揃っている**ことを暗黙に仮定する。この仮定が崩れる点が現実の懸念であり、とりわけ日本のメンバーシップ型・合議文化(フェーズ1)と系統的に衝突する。

## 1. 理想像の出所(建前=そう語られる)

### 1.1 AWS AI-DLC(AI-Driven Development Life Cycle)

- 位置づけ: AWS が提唱する「AI をソフトウェア開発の中核に組み込む」新方法論。元ネタ音声メモの「AIDLC」に対応する一次資料([AWS DevOps Blog "AI-Driven Development Life Cycle: Reimagining Software Engineering"](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
- 中核原理「**AI Powered Execution with Human Oversight**」(AI が実行し、人間が監督する):
  - 原文: "AI systematically creates detailed work plans, actively seeks clarification and guidance, and **defers critical decisions to humans**"([AWS AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
  - 人間が保持する根拠: "**only humans possess the contextual understanding and knowledge of business requirements** needed to make informed choices"(業務要件の文脈理解を持つのは人間だけ)([同上](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
  - 協働サイクル: "AI creates a plan, asks clarifying questions to seek context, and **implements solutions only after receiving human validation**"([同上](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
- 人間=判断者への役割集約(理想像の核心):
  - "AI orchestrates the development process; **humans retain oversight, decision-making authority, and accountability**"(AI がプロセスを統率し、人間は監督・意思決定権・説明責任を保持する)([AWS 検索要約](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
  - "humans **verify and approve before execution proceeds**"。
- チーム編成・作業様式の変化(図解の核):
  - **Mob Elaboration**(要件精緻化): "the entire team actively validates AI's questions and proposals"(チーム全員が AI の問い・提案を検証)。
  - **Mob Construction**(構築): "the team provides clarification on technical decisions and architectural choices in real time"。
  - スプリント → **Bolts** への転換: "Traditional 'sprints' are replaced by 'bolts' – shorter, more intense work cycles measured in **hours or days rather than weeks**"([同上](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
- 生産性・編成インパクトの提示例(建前として引かれる数字):
  - 欧州の金融機関事例: 「1 PO + 12 開発者で 15 機能/スプリント」から「1 PO + **3 開発者**で **35 機能**/スプリント」へ移行したとされる([AWS 検索要約 / AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
    - ※これは AWS 側の提示する事例であり、独立検証データではない。「そう語られる」レベルとして扱う(§7 で批判)。
- **重要な含意**: AWS AI-DLC の一次記述は「人間 = **意思決定・検証・承認**、AI = **計画生成・実装**」という分業を明示する。ただし AWS 自身は「全員が PO になる」とは書いておらず、**PO と開発者は依然として区別されている**(1 PO + 3 開発者)。「PO だけのチーム」は AI-DLC の記述を音声メモ側が**理念的に極限化**した表現である点に注意(→ §7 考察)。

### 1.2 Sean Grove(OpenAI)「The New Code」— 仕様を書く人が最も価値ある programmer

- 位置づけ: AI Engineer World's Fair の基調講演(22 分)。理想像を最も先鋭に言語化した一次資料([トランスクリプト](https://lawwu.github.io/transcripts/8rABwKRsec4.html)、[YouTube](https://www.youtube.com/watch?v=8rABwKRsec4))。
- 中核テーゼ(価値配分の再定義):
  - "**Code is sort of 10% to 20% of the value** that you bring. The other 80% to 90% is in **structured communication**"([トランスクリプト](https://lawwu.github.io/transcripts/8rABwKRsec4.html))。
  - ボトルネックは実装ではなく "knowing what to build, talking to people and gathering requirements"(何を作るか・人と話し要件を集めること)。
- 価値あるスキルの予言(理想像の標語):
  - "**The person who communicates most effectively is the most valuable programmer**"([同上](https://lawwu.github.io/transcripts/8rABwKRsec4.html))。プログラミングの能力を「構文の熟達」から「仕様の明晰さ」へ再定義。
- 仕様が真実の源(source of truth):
  - "Code itself is actually a **lossy projection from the specification**"(コードは仕様からの劣化投影)([同上](https://lawwu.github.io/transcripts/8rABwKRsec4.html))。仕様が意図を直接コード化し、複数の実装対象(TypeScript, Rust, ドキュメント…)を生成できる。
- 「プログラミングの民主化」(全員が PO 化の理論的根拠):
  - OpenAI の Model Spec を例に: "Because it is **natural language, everyone, not just technical people, can contribute**, including product, legal, safety, research, policy"(自然言語なので技術者以外も貢献できる)([同上](https://lawwu.github.io/transcripts/8rABwKRsec4.html))。
  - 含意: 未来の「プログラマー」は**仕様を書ける者**(PM、法務、政策担当、エンジニアを問わず)。=「全員が仕様の書き手 = 価値定義者」という主張。
- **批判的対抗言説(建前への疑義)**: この主張を「PM の言うことを聞いて要件定義書を書け = ウォーターフォールの回帰」と皮肉る論評がある([36Kr "the Return of the Waterfall Model"](https://eu.36kr.com/en/p/3388182127870345))。仕様先行は目新しくなく、上流工程重視の反復であるという指摘(→ §7)。

### 1.3 「Product Engineer」への収束論(everyone becomes a product owner の実像)

- 業界言説の実態: 「全員が文字通り PO になる」というより、役割が **Product Engineer**(製品を仕様化・構築・出荷まで一人で担うハイブリッド職)へ収束する、という整理が主流([CIO "The rise of the product engineer"](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html)、[Atlassian "AI turns software engineers into product engineers"](https://www.atlassian.com/blog/artificial-intelligence/how-ai-turns-software-engineers-into-product-engineers))。
- ボトルネックの上流移動(共通論理):
  - "the time between 'I know what we should build' and 'here is working prototype' has **compressed from weeks to hours**"。実装が commodity 化する([CIO](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html))。
  - "the bottleneck **shifts from execution to evaluation**. The hard question stops being 'can we build this?' and becomes '**should we?**'"(律速が実装から評価へ。問いが「作れるか」から「作るべきか」へ)([同上](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html))。
- 残る価値: "understanding the problem, user empathy, **judgment, and taste**"(問題理解・ユーザー共感・判断・センス)([CIO](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html))。
- **含意**: 「everyone becomes a product owner」は正確には「エンジニアと PM が中間で出会い、両者の判断能力を併せ持つ一人格に収束する」論。PO 化 = **価値判断・評価の能力を個人が内在化する**こと。

## 2. プロダクトオーナーの本来の責任(スクラムガイド=土台の定義)

### 2.1 スクラムガイド 2020 の PO 定義(建前=原典)

- 単一責任: "The Product Owner is **accountable for maximizing the value** of the product resulting from the work of the Scrum Team"([The 2020 Scrum Guide](https://scrumguides.org/scrum-guide.html))。
- **一人であり委員会ではない**: "The Product Owner is **one person, not a committee**"([Scrum Guide 2020](https://scrumguides.org/scrum-guide.html))。
- 委任しても責任は残る: "The Product Owner may do the above work or may **delegate the responsibility to others**. Regardless, the Product Owner **remains accountable**"([同上](https://scrumguides.org/scrum-guide.html))。
- 組織の尊重が成立条件: "for Product Owners to succeed, **the entire organization must respect their decisions**"(PO の決定を組織全体が尊重せねばならない)([同上](https://scrumguides.org/scrum-guide.html))。
- PO の主要責務: プロダクトゴールの策定・明示、プロダクトバックログ項目の作成・明確化、順序付け、バックログの透明性・可視性の確保([Scrum.org "What is a Product Owner?"](https://www.scrum.org/resources/what-is-a-product-owner))。

### 2.2 「全員が PO 化する」の意味論(定義からの含意)

- スクラムの PO は本来 **1 チームに 1 人**の単一 accountability 主体。よって「PO だけのチーム = 全員が PO」は、スクラム原典の「単一責任」原則を**そのまま拡張すると矛盾**する(全員が accountable なら誰も一意には accountable でない)。
- 音声メモの理想像を原典と整合させる読み筋は2通り:
  - (a) **各人が自分の担当領域の PO** = 一人一プロダクト(または一機能)の単一責任者になる(Amazon の single-threaded owner の極小版。§4)。
  - (b) PO の**能力**(価値定義・順序付け・受け入れ判断)を全員が**内在化**する(役割ではなく能力の普遍化。§1.3 の Product Engineer 論)。
- いずれの読みでも、PO 化とは「**成果物への説明責任を個人が引き受ける**」ことを核とする。ここに現実の懸念(§5)が集中する。

## 3. 前提条件(この編成が暗黙に仮定していること)

「PO だけのチーム」が成立するために、明示されないまま仮定されている条件を、依存関係として構造化する(図解: 前提条件の依存ツリー)。

- **前提A: 実装コストの限界的ゼロ化**(最上位の仮定)
  - AI が実装・テスト・インフラ構成を高速生成できる("AI creates plans, code, tests, and infrastructure configurations", [AWS AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
  - これが崩れると律速は実装に戻り、「PO だけ」は成立しない。**全編成論の土台**。
- **前提B: 個人に4能力が揃っていること**(A の上に乗る)
  - **B1 価値判断能力**: 「作るべきか(should we?)」を判断できる。センス・taste([CIO](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html))。
  - **B2 言語化能力**: 意図を曖昧さなく仕様に落とせる。Grove の "structured communication"([Grove](https://lawwu.github.io/transcripts/8rABwKRsec4.html))。
  - **B3 検証能力**: AI 生成物が仕様を満たすか評価できる(AI-DLC の human validation。[AWS](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。AI は "confidently state a competitor has a feature they don't have or suggest architecturally unsound approaches" と誤るため、誤りを見抜く能力が要る([Context and Chaos 経由の批判](https://contextandchaos.substack.com/p/production-ai-and-the-false-finish))。
  - **B4 意思決定の権限**: その個人が実際に決めてよい(スクラムガイド「組織全体が PO の決定を尊重せねばならない」[Scrum Guide](https://scrumguides.org/scrum-guide.html))。
- **前提C: 説明責任が一意に紐づく設計**(B4 の裏面)
  - 出荷される変更ごとに「名前のついた人間」が紐づく(→ §5.2 の chain of human accountability)。
- **依存関係の要点**: A(実装ゼロ化)→ ボトルネックが評価/判断へ移動 → B(個人の判断能力)と C(責任の一意性)が新たな律速。**A だけが AI で解決され、B・C は人間・組織の問題として残る**。ここが理想と現実のギャップの源泉。

## 4. 組織論的な論点(従来編成 vs PO中心編成)

### 4.1 従来のチーム編成との対比(図解の中核: 対比表)

| 観点 | 従来編成(役割分担・専門分化) | PO中心編成(理想像) |
|---|---|---|
| 分業原理 | 職能で水平分業(PO/SM/開発/QA/インフラ) | 実装は AI へ委譲、人間は判断へ集約 |
| 律速 | 実装capacity | 評価・判断("should we?") |
| 人数 | 1 PO + 多数の専門職 | 少人数化(1 PO + 少数、または PO のみ) |
| 階層 | ロール階層・承認階層 | フラット化・単一責任者 |
| 価値の源泉 | コードを書く能力 | 仕様を書く/判断する能力([Grove](https://lawwu.github.io/transcripts/8rABwKRsec4.html)) |
| 作業単位 | 週単位スプリント | 時間〜日単位 bolts([AWS](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)) |

### 4.2 Amazon の two-pizza team / single-threaded owner(既存の少人数・単一責任論)

- Two-pizza team: "If you can't feed a team with two pizzas, it's too large"。2003 年に Bezos が「製品/サービスを端から端まで(end-to-end)所有する小規模独立チーム」へ再編。理想人数 10〜12 名([AWS Executive Insights "Amazon's Two Pizza Teams"](https://aws.amazon.com/executive-insights/content/amazon-two-pizza-team/))。
- **Single-Threaded Owner / Leader**: "someone whose only job is to make that team successful"。"ultimate control and absolute accountability over their success or failure"(唯一の責任者が全責任を負う)([Medium "From Two Pizzas to Single-Threaded Leadership"](https://medium.com/@diabolikss/small-teams-big-ownership-from-two-pizzas-to-single-threaded-leadership-51dfd8980e85)、[AWS](https://aws.amazon.com/executive-insights/content/amazon-two-pizza-team/))。
- **PO 中心編成との接続**: 「PO だけのチーム」= two-pizza team を AI で極小化(1〜数名)し、single-threaded owner の「単一の全責任」原則を各人に適用した姿と読める。single-threaded owner はスクラム PO の「one person, not a committee」と同型(単一 accountability)。
- 注意(建前 vs 実態): two-pizza team は万能ではなく、Amazon 自身がのちに「two-pizza team だけでは不足」として STL(single-threaded leader)モデルへ補正した経緯がある([Inc. "When Bezos's 2-Pizza Teams Fell Short"](https://www.inc.com/jeff-haden/when-jeff-bezoss-two-pizza-teams-fell-short-he-turned-to-brilliant-model-amazon-uses-today.html))。小規模化それ自体が成果を保証しない。

### 4.3 コンウェイの法則との関係

- 原典: Melvin E. Conway "How Do Committees Invent?"(Datamation, 1968)。"Any organization that designs a system … will produce a design whose structure is a **copy of the organization's communication structure**"([Mel Conway 本人サイト](https://www.melconway.com/Home/Conways_Law.html)、[martinfowler.com "Conway's Law"](https://martinfowler.com/bliki/ConwaysLaw.html))。命名は Brooks『人月の神話』(1975)。
- PO 中心編成への含意(考察寄りだが論点として):
  - コンウェイの法則を素直に適用すると、「PO だけの少人数フラットチーム」は**モジュール分割の少ない、統合的で単純なシステム**を生みやすい(=コミュニケーション構造が単純だから)。逆に、複雑な大規模システムは依然として複数チーム = 複数の通信境界を要求し、「PO だけ」に収まらない可能性。
  - **逆コンウェイ戦略(Inverse Conway Maneuver)**: 望むアーキテクチャに合わせて組織を設計する手法([martinfowler.com](https://martinfowler.com/bliki/ConwaysLaw.html))。PO 中心編成は「小さく独立したチーム = 小さく独立したサービス」を志向する点で two-pizza team と同じ逆コンウェイの系譜。

## 5. 現実の懸念(理想が崩れる点)

### 5.1 全員が PO になれるのか(スキルの偏在)

- 前提 B(4能力が個人に揃う)は強い仮定。判断・taste・言語化・検証はいずれも希少で、教育コストが高い。業界言説も「PM は技術寄りに、エンジニアは製品寄りに"中間で出会う"」と述べるが、これは**両方向のスキル獲得が必要**という重い条件を意味する([CIO](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html)、[Atlassian](https://www.atlassian.com/blog/artificial-intelligence/how-ai-turns-software-engineers-into-product-engineers))。
- 「名目上の所有」問題: ガバナンス文書で個人を owner に指名しても、その人が「なぜその結果になったか診断・介入できない」場合、**能力と説明責任が分離した空虚な所有**になる("governance creates nominal ownership without … the real thing, separating accountability from capability")([Big Agile 経由](https://big-agile.com/blog/who-owns-ai-generated-code-when-it-ships-building-a-chain-of-human-accountability))。

### 5.2 責任の所在(誰が本番の AI 生成コードを所有するか)

- 核心の指摘: "AI didn't remove accountability from your engineering organization. It **diffused it**"(AI は説明責任を消さず、**拡散させた**)([Big Agile "Who Owns AI-Generated Code When It Ships"](https://big-agile.com/blog/who-owns-ai-generated-code-when-it-ships-building-a-chain-of-human-accountability))。
- 品質・セキュリティの実データ(懸念の裏づけ):
  - Apiiro 調査: 開発速度 3〜4 倍の一方、月間セキュリティ問題が 1,000 件 → 10,000 件超へ急増([Big Agile 経由](https://big-agile.com/blog/who-owns-ai-generated-code-when-it-ships-building-a-chain-of-human-accountability))。
  - 91% の ML モデルは時間とともに劣化するが、"by day 90 … no one is accountable for catching it because no one was ever put in charge"([検索要約 / Context and Chaos](https://contextandchaos.substack.com/p/production-ai-and-the-false-finish))。
- 提案される対策 = **三層の human accountability**: 個人(各変更に審査者名を明記)/チーム(AI 使用可否の線引き)/組織(ポリシー・四半期レビュー)([Big Agile](https://big-agile.com/blog/who-owns-ai-generated-code-when-it-ships-building-a-chain-of-human-accountability))。
- **含意**: 理想像は「人間 = 意思決定・説明責任」と言うが、実装が速くなるほど**説明責任を一意に保つ設計努力**(前提C)を明示的に作り込まないと責任が霧散する。「PO だけ」でも、その PO に責任が一意に落ちる仕組みが要る。

### 5.3 意思決定の質と「false finish line」

- AI が要件を捏造・追従する危険: "some teams start using AI to generate roadmaps, and six months later realize they **haven't talked to a customer in months** because the tool told them what to build"([検索要約 / Context and Chaos](https://contextandchaos.substack.com/p/production-ai-and-the-false-finish))。判断を AI に委ねると PO の価値判断そのものが空洞化する逆説。

### 5.4 日本の組織文化との衝突(フェーズ1と接続)

「PO 中心編成」は**単一個人への決定権・責任の集中**を要求する。これはフェーズ1で整理した日本的ガバナンスの「責任の非集中」DNA と系統的に衝突する([research/phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md) §9)。

- **合議・稟議との衝突**: スクラム PO は "one person, not a committee"([Scrum Guide](https://scrumguides.org/scrum-guide.html))だが、稟議・根回し・合議は「皆で決めた = 誰も単独では決めていない」責任分散装置(jp-governance §1.3, §2)。PO 中心の単一責任を制度的に拒む。
- **権限の欠落(前提B4 が崩れる)**: 日本の決裁は金額×職位で承認者が決まる(jp-governance §3)。現場の「PO 化した個人」に実際の決裁権が降りていなければ、判断しても承認は職位階層で滞留し、「決めるだけの人」になれない。スクラムガイドの成立条件「組織全体が PO の決定を尊重する」が満たされない。
- **メンバーシップ型雇用との衝突**: 職務無限定・兼務・異動(jp-governance §6)は「一貫した単一責任主体」を保持しにくく、PO の継続性・専門性蓄積を阻む。
- **ハイコンテキスト文化との衝突(前提B2 が崩れる)**: PO 中心編成は「仕様を言語化して AI に渡す」ことを核とするが、暗黙知・忖度・以心伝心を前提とする日本の現場では、そもそも仕様化されない情報が多い(jp-governance §7)。Grove の "structured communication" が最も成立しにくい土壌。
- **速度差の顕在化**: AI で生成が速くなるほど、多段承認(稟議)の遅さがボトルネックとして際立つ(jp-governance §9-5)。「決めるだけの人」の理想と、実際には「決められない/決裁が降りない」現実の乖離が拡大する。

## 6. 階層構造で見た PO 中心編成(全体 → フェーズ内 → 個別作業)

図解用に、AI-DLC の記述を3階層で整理。

- **全体プロセス層**: 従来 SDLC(要件→設計→実装→テスト→運用の直列)を、AI オーケストレーションによる反復サイクルへ再構成。人間は各段のゲート(validation/approval)に立つ([AWS AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
- **フェーズ内ワークフロー層**: 各フェーズが「AI が計画生成 → 明確化の質問 → 人間が文脈提供・検証 → AI が実装」という同一パターンの反復。作業単位は bolts(時間〜日)([同上](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。
- **個別作業層**: Mob Elaboration(全員で要件検証)/ Mob Construction(全員で技術判断をリアルタイム提供)。ここで「チーム全員が価値判断・検証に参加 = 全員 PO 的に振る舞う」姿が具体化する([同上](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/))。

## 7. 考察(事実と分離)

- **理想像の正体は「ボトルネックの上流移動」論**: 「PO だけのチーム」は独立した組織論ではなく、「実装が commodity 化すれば律速は評価・判断へ移る(A → B)」という因果の帰結。AWS・Grove・CIO/Atlassian が別々の言葉で同じ論理を語っている(事実として一致)。
- **AWS は「PO だけ」とは言っていない**: 一次資料(AI-DLC)は「1 PO + 3 開発者」と PO と開発者を区別しており、「PO だけのチーム」は音声メモ側の**理念的極限化**。この差は重要で、清書時は「AI-DLC の記述」と「その理念的極限としての PO 単独チーム」を分けて提示すべき(解釈)。
- **理想が置く前提の非対称性**: AI が解くのは前提A(実装コスト)だけで、B(個人の判断能力)・C(責任の一意性)は人間・組織の問題として残る。理想像は「A が解ければ全部解ける」かのように語るが、現実の律速は B・C に移るだけで消えない(解釈)。
- **「全員 PO」はスキルの民主化を仮定するが、希少性は移動するだけ**: Grove の「自然言語だから誰でも仕様を書ける」は、書ける人と**良い仕様を書ける人**(判断・taste・検証込み)を混同している疑い。希少資源がコード能力から仕様・判断能力へ移るだけで、偏在は解消しない(解釈)。
- **日本での成立条件は最も厳しい**: PO 中心編成の前提(単一責任・権限集中・言語化)は、日本的ガバナンスの前提(責任分散・職位決裁・暗黙知)とほぼ全項目で逆。したがって本プロジェクトの介入点は「PO 中心の理想をそのまま輸入する」ではなく、「責任分散文化の中で AI 成果物の説明責任を一意化する軽量な仕組み」を設計することにある(解釈、フェーズ2→3 への橋渡し)。
- **図解方針(清書時)**: (a) 従来編成 vs PO中心編成 の対比表(§4.1)、(b) 前提条件の依存ツリー(A→B/C、§3)、(c) AI-DLC の3階層フロー(§6)、(d) 「PO 中心の前提」×「日本ガバナンスの前提」の衝突マトリクス(§5.4)、の4点セットを解説記事の骨格にする。

## 8. 埋められなかった観点(追加調査項目)

- **AI-DLC の一次仕様の精読**: 本メモは AWS DevOps Blog(概説)と検索要約に依存。[open-sourcing AI-DLC](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/) と [GitHub aws-samples](https://github.com/aws-samples/sample-ai-driven-development-lifecycle-platform) のワークフロー定義・ロール定義原文を未精読。「PO の責務」が AI-DLC 内でどう明文化されているかの一次確認が必要。
- **金融機関事例(1 PO + 3 devs → 35 features)の検証可能性**: AWS 提示の単一事例で、測定条件・機能の粒度・再現性が不明。独立した実証データ(生産性・欠陥率の前後比較)は未取得。
- **Sean Grove トークの全文精読と反論の体系**: [36Kr のウォーターフォール回帰批判](https://eu.36kr.com/en/p/3388182127870345)、[Medium "The Emperor's New Code"](https://medium.com/@delimiterbob/the-emperors-new-code-hype-vs-reality-of-ai-executable-specs-ff64d961e8ab) の反論を要約止まりでしか拾えていない。「executable spec」の実現可能性への技術的批判の精査が未了。
- **scrum.org「PO as Orchestrator(第7のスタンス)」**: フェッチ失敗。AI 時代の PO 役割変質を扱う一次寄り資料で、清書前に本文確認が必要([該当記事](https://www.scrum.org/resources/blog/product-owner-orchestrator-seventh-stance-age-ai))。
- **日本企業での AI-DLC/PO 中心編成の実適用事例**: 日本の現場で「PO だけのチーム」を志向した事例・失敗談の一次情報を未取得。フェーズ1の理論的衝突(§5.4)を裏づける具体事例が欲しい。
- **組織論の原典の直接確認**: two-pizza team・single-threaded owner は Amazon 公式(AWS Executive Insights)とニ次記事で確認したが、Colin Bryar & Bill Carr『Working Backwards』(一次に近い)の該当章は未精読。コンウェイ原典 Datamation 1968 の全文も未確認(本人サイト・Fowler 経由の引用に依拠)。
- **「Product Engineer」への収束が本当に少人数化を生むかの実証**: 「45% 速度向上」等の数値([CIO](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html))の出所・測定法が未確認。

## 9. 出典一覧

### 一次情報(公式ブログ・原典・提唱者一次資料)

- [AWS DevOps Blog "AI-Driven Development Life Cycle: Reimagining Software Engineering"](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/) — AI-DLC の中核原理、Mob Elaboration/Construction、bolts、金融機関事例
- [AWS DevOps Blog "Open-Sourcing Adaptive Workflows for AI-DLC"](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/)(未精読、追加調査)
- [GitHub: aws-samples/sample-ai-driven-development-lifecycle-platform](https://github.com/aws-samples/sample-ai-driven-development-lifecycle-platform)(未精読、追加調査)
- [Sean Grove "The New Code" トランスクリプト](https://lawwu.github.io/transcripts/8rABwKRsec4.html) / [YouTube](https://www.youtube.com/watch?v=8rABwKRsec4) — 仕様が source of truth、コードは lossy projection、communication が最も価値
- [The 2020 Scrum Guide(scrumguides.org)](https://scrumguides.org/scrum-guide.html) / [PDF](https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf) — PO の accountability、"one person, not a committee"、組織の尊重
- [Scrum.org "What is a Product Owner?"](https://www.scrum.org/resources/what-is-a-product-owner) — PO の主要責務
- [Melvin Conway 本人サイト "Conway's Law"](https://www.melconway.com/Home/Conways_Law.html) — 1968 原典の法則本文
- [AWS Executive Insights "Amazon's Two Pizza Teams"](https://aws.amazon.com/executive-insights/content/amazon-two-pizza-team/) — two-pizza team / single-threaded ownership の公式説明

### 二次情報(解説・論評・批判)

- [CIO "The rise of the product engineer"](https://www.cio.com/article/4190086/the-rise-of-the-product-engineer-how-ai-is-reshaping-modern-tech-teams.html) — ボトルネックの上流移動、Product Engineer 収束論
- [Atlassian "How AI turns software engineers into product engineers"](https://www.atlassian.com/blog/artificial-intelligence/how-ai-turns-software-engineers-into-product-engineers)
- [Big Agile "Who Owns AI-Generated Code When It Ships"](https://big-agile.com/blog/who-owns-ai-generated-code-when-it-ships-building-a-chain-of-human-accountability) — 説明責任の拡散、三層 human accountability、Apiiro/Ox Security データ
- [Context and Chaos "Production AI & The False Finish Line"](https://contextandchaos.substack.com/p/production-ai-and-the-false-finish) — モデル劣化と責任者不在、AI が要件を捏造する危険
- [martinfowler.com "Conway's Law"](https://martinfowler.com/bliki/ConwaysLaw.html) — 逆コンウェイ戦略、Brooks の命名
- [36Kr "the Return of the Waterfall Model"](https://eu.36kr.com/en/p/3388182127870345) / [Medium "The Emperor's New Code"](https://medium.com/@delimiterbob/the-emperors-new-code-hype-vs-reality-of-ai-executable-specs-ff64d961e8ab) — 仕様先行 = ウォーターフォール回帰という批判
- [Inc. "When Bezos's 2-Pizza Teams Fell Short"](https://www.inc.com/jeff-haden/when-jeff-bezoss-two-pizza-teams-fell-short-he-turned-to-brilliant-model-amazon-uses-today.html) — two-pizza team の限界と STL への補正
- [Medium "From Two Pizzas to Single-Threaded Leadership"](https://medium.com/@diabolikss/small-teams-big-ownership-from-two-pizzas-to-single-threaded-leadership-51dfd8980e85)
- [Scrum.org "Product Owner as Orchestrator: A Seventh Stance"](https://www.scrum.org/resources/blog/product-owner-orchestrator-seventh-stance-age-ai)(フェッチ失敗、追加調査)

### 接続する既存メモ

- [research/phase1/20260710-jp-governance.md](../phase1/20260710-jp-governance.md) — 日本的ガバナンスの「責任の非集中」DNA、稟議・合議・職位決裁・メンバーシップ型・ハイコンテキスト(§5.4 の衝突分析の土台)
