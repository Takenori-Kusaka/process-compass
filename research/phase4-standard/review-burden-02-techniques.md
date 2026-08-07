# レビュー負荷削減の手法・ツール棚卸し(新規観点編)

- 調査日: 2026-08-07(追記: 2026-08-07 同日、Meta RADAR/DRS の精査と Google LSC の追加調査)
- 位置づけ: フェーズ4(標準策定)「タスクの分割基準」改稿向けの一次情報収集メモ。清書前の素材
- 既存メモ `research/phase4-standard/118-119-stack-pr.md`(スタック型 PR、PR サイズ実証、コンフリクト自動解消)と**重複しない範囲**に絞って調査した
- ツール・製品の現況記述はすべて **2026-08-07 時点** の公開情報に基づく。ベンダー自身の発信(ブログ・比較記事)は「ベンダー主張」と明示し、一次研究(学術論文・公式ドキュメント)と区別する

---

## 1. 可視化によるレビュー支援

### 1.1 何をするものか

- 「差分をテキスト(`git diff`)で読む」代わりに、変更が及ぼす構造的な影響を図・グラフで示し、レビュアーが行数を追わずに影響範囲を把握できるようにする手法群である
- 主なアプローチ
  - アーキテクチャ図(C4 モデル等)を diagrams-as-code 化し、変更をテキスト差分として可視化する
  - コードベースの変更頻度・複雑度・依存関係をグラフ化し、影響範囲やホットスポットを示す
  - 依存グラフ/コールグラフの差分を計算し、影響を受けるモジュールを列挙する

### 1.2 実在する製品・OSS

| ツール | 何をするか | 現況(2026-08-07) |
| --- | --- | --- |
| Structurizr | C4 モデルのアーキテクチャ図を DSL(テキスト)として記述し、バージョン管理・diff 可能にする。「models as code」の原型実装 | 稼働中。C4 モデル考案者自身による実装 |
| PlantUML / Mermaid | UML・シーケンス図等をテキストで記述しレンダリングする軽量ツール。PR 内でテキスト diff としてレビュー可能 | 稼働中(広く普及) |
| CodeScene X-Ray / Change Coupling | ファイル内のメソッド単位で「一緒に変更されがちなペア」を検出し、リーキーアブストラクションや重複ロジックの兆候として提示する。Delta Analysis を PR に webhook 連携し、リスクに応じたレビューレベルを推奨する | 稼働中(商用) |
| Sourcegraph Batch Changes | 複数リポジトリにまたがる変更をバッチ生成し、レビュー状況(Approved/Changes requested 等)を一元ダッシュボードで追跡する。個々の diff の構造可視化そのものではなく、大量変更の**レビュー進捗管理**に強い | 稼働中(商用) |
| CodeSee | コードベースの対話的な可視化マップ・変更の伝播トレース・オンボーディング向けコードツアーを提供していた | **終了**。2024 年に GitKraken に買収され、スタンドアロン製品・ブランドは廃止された。可視化技術の一部は GitKraken 製品に統合 |
| Graphite Diff View | スタック型 PR ツール Graphite が提供する差分表示 UI。既存メモ(118-119)でスタック運用の文脈は扱い済みのため本メモでは詳述しない | 稼働中(商用) |

- 出典:
  - [Why "as code"? — Structurizr](https://docs.structurizr.com/as-code)
  - [X-Ray — CodeScene Documentation](https://docs.enterprise.codescene.io/latest/guides/technical/xray.html)
  - [Identify Refactoring Targets — CodeScene](https://codescene.com/use-cases/refactoring-targets)
  - [Batch Changes — Sourcegraph docs](https://sourcegraph.com/docs/batch-changes)
  - CodeSee 終了の経緯は一次発表(プレスリリース等)を直接確認できず、Web 検索の複数の二次情報([Best Codebase Visualization Tools — repowise.dev](https://www.repowise.dev/blog/comparisons/best-codebase-visualization-tools) 等)からの推定である(= 一次情報未確認)

### 1.3 導入コスト

- Structurizr / PlantUML / Mermaid: DSL の学習コストのみ。CI に組み込めば追加インフラ不要
- CodeScene: 商用ライセンス、リポジトリの解析基盤の導入が必要
- Sourcegraph Batch Changes: 商用ライセンス、コードホスト連携設定が必要

### 1.4 効果の根拠

- Structurizr / diagrams-as-code については「レビューしやすい」という主張が複数の技術ブログで見られるが、**定量的な効果測定(レビュー時間短縮など)の一次研究は本調査では確認できなかった**(= 未確認)
- CodeScene Change Coupling は「予測可能な変更パターンの発見」を機能として説明するが、レビュー負荷削減の定量効果(削減率等)を示す一次資料は確認できなかった(= 未確認)

---

## 2. セマンティック差分・変更の意味単位への再構成

### 2.1 AST 差分・構文認識差分

- GumTree: ソースコードを AST として比較し、テキスト diff では表現できない「移動」「リネーム」を検出する。C / Java / JavaScript / Python / R / Ruby 等に対応。研究コミュニティで広く使われる標準的な AST diff ツールである
  - 出典: [GumTreeDiff/gumtree — GitHub](https://github.com/GumTreeDiff/gumtree)
  - 限界: 2024 年の後続研究により、GumTree を含む既存 AST diff ツールは「重複コードが関わる変更で頻出するマルチマッピング(1つの要素が複数の対応先を持つケース)を扱えない」ことが指摘されている
    - 出典: "A Novel Refactoring and Semantic Aware Abstract Syntax Tree Differencing Tool", ACM TOSEM 2024 — [ACM](https://dl.acm.org/doi/10.1145/3696002)
- difftastic: tree-sitter による構文木ベースの構造 diff CLI。30 以上の言語に対応し、フォーマット変更(改行位置の変化等)をノイズとして扱わず、実際に意味が変わった箇所だけを表示する。構造的差分をグラフ問題として扱い Dijkstra 法で解く
  - 出典: [Wilfred/difftastic — GitHub](https://github.com/Wilfred/difftastic) / [difftastic.wilfred.me.uk](https://difftastic.wilfred.me.uk/)
  - 導入コスト: CLI ツールで git の diff ドライバとして設定するだけで使える。低コスト

### 2.2 変更のクラスタリング・自動分解(commit untangling)

- 課題設定: 1 コミット/PR に複数の意図が混在する「tangled changes」を、意図ごとに自動分割してレビュー単位を意味的にそろえる研究領域である
- 主要な研究手法とその現況
  - ClusterChanges: diff-region 間の def-use / use-use 関係に基づきクラスタリングする
  - SmartCommit: diff ハンクをグラフノードとして表現し、hard / soft / refactoring / cosmetic の意味リンクを付与してグラフ分割する。**分解精度(developer の実際の分割との一致度)は中央値 71〜84%**と報告されている
    - 出典: SmartCommit, ESEC/FSE 2021 — [ACM](https://dl.acm.org/doi/abs/10.1145/3468264.3468551)
  - UTANGO: グラフベースのコード変更クラスタリング学習モデル
    - 出典: ESEC/FSE 2022 — [ACM](https://dl.acm.org/doi/abs/10.1145/3540250.3549171)
  - 2025〜2026 年は LLM ベースの untangling へ研究の重心が移っている(Atomizer: LLM ベースのマルチエージェント intent-driven commit untangling、2026-01)
    - 出典: [arXiv:2601.01233](https://arxiv.org/html/2601.01233)
  - 判定: 研究は活発で精度も 70〜80% 台まで到達しているが、**PR 作成前後にこれを組み込んだ実運用製品は本調査では確認できなかった**(= 未確認)。研究段階のツールが中心である

### 2.3 Change Impact Analysis(CIA)

- 定義: 変更がコールグラフ上でどこまで波及するかを解析し、レビュアーに「この変更が影響する範囲」を提示する手法
- 一次研究: "Enhanced code reviews using pull request based change impact analysis"(Empirical Software Engineering, 2024)は、コールグラフベースの依存解析と履歴マイニングを組み合わせ、**PR 粒度**での影響分析を提案している(認証壁のため要旨レベルの確認にとどまり、評価指標の詳細数値は本調査では未取得 = 一部未確認)
  - 出典: [Springer, DOI: 10.1007/s10664-024-10600-2](https://link.springer.com/article/10.1007/s10664-024-10600-2)
- 導入コスト: 静的解析基盤(コールグラフ抽出)の構築が前提であり、言語ごとに解析器の精度が異なる

---

## 3. AI によるレビュー支援(PR 要約・変更意図の説明生成)

### 3.1 何をするものか

- レビュアーの作業を「差分を読んで理解する」から「AI が生成した要約・指摘を検証する」へ移す設計。PR 要約生成、自動コメント、ルールベースのポリシー適用、コードベース全体を踏まえた文脈付きレビューなどを含む

### 3.2 実在する製品

| 製品 | 特徴 | 出典 |
| --- | --- | --- |
| GitHub Copilot code review | PR に対する自動レビューコメント・要約生成 | [DEV: GitHub Copilot Code Review 完全ガイド 2026](https://dev.to/rahulxsingh/github-copilot-code-review-complete-guide-2026-255h) |
| CodeRabbit | 40 以上の決定論的リンタと AI レビュー層を組み合わせたハイブリッド構成。PR の説明・リンクされた Issue(Jira/Linear)・過去のレビュー会話まで文脈として使用する | [morphllm 比較記事](https://www.morphllm.com/comparisons/coderabbit-vs-copilot) |
| Graphite Diamond | Graphite 社の AI レビューツール。「低い誤検知率・低い検出率」で、主力の AI レビューツールを補完する位置づけとされる(ベンダー系比較記事の記述) | [Greptile: Best Code Review Tools 2026](https://www.greptile.com/content-library/best-ai-code-review-tools) |
| Greptile | フルコードベースのインデックス化による文脈理解を強みとする | 同上 |
| Qodo(旧 Codium) | チケット準拠・エンジニアリング標準の適用を軸としたルールベースレビュー | 同上 |
| Cursor BugBot | Cursor エディタに統合。選択的で「1 PR あたり 0.91 コメント」とベンダー系記事は報告 | 同上 |

### 3.3 有効性・誤検知の実測報告(出典の質に注意)

- **重要な留意点**: 以下の数値の多くは、ベンダーのブログや第三者比較サイト(morphllm、Greptile 自身、aicoderscope 等)が発表したベンチマークであり、査読付き学術研究ではない。**ベンダー主張として扱い、独立した第三者による再現性は本調査では確認できていない**
- CodeRabbit vs Copilot(比較記事の報告値)
  - 検出率: CodeRabbit 52.5% 対 Copilot 36.7%
  - 精度(precision): CodeRabbit 50.5% 対 Copilot 56.5%(Copilot は保守的で誤検知が少ない)
  - 別のベンチマークでは CodeRabbit が意図的に仕込んだ問題の 87% を検出、誤検知率 8%、修正精度 85% と報告
  - 出典: [morphllm 比較記事](https://www.morphllm.com/comparisons/coderabbit-vs-copilot)
- 2026 年の独立ベンチマーク(Martian、比較記事経由の言及)では CodeRabbit が F1 51.2% で首位、Qodo は 2026 年 2 月時点の別テストで F1 60.1% と報告されている。ツール間で順位が一致しないことから、**ベンチマーク条件依存性が高い**ことが示唆される(考察)
  - 出典: [Greptile: Best Code Review Tools 2026](https://www.greptile.com/content-library/best-ai-code-review-tools)
- 学術的な実測として既存メモに記載済みのもの(重複回避のため詳細は割愛): RovoDev(Atlassian, arXiv:2601.01129)、agentic code review の品質への非寄与(arXiv:2607.13196)

### 3.4 レビュアー負荷を「読む」から「検証する」へ移す設計としての Meta RADAR(重要な一次事例)

- RADAR: Meta が構築した diff リスク予測ベースの自動レビュー・自動承認システム
  - 発表: arXiv 2026-05-28(v1)/ 2026-06-12(v2)。出典: "Automating Low-Risk Code Review at Meta: RADAR, Risk Calibration, and Review Efficiency" — [arXiv:2605.30208](https://arxiv.org/abs/2605.30208)
  - 規模: 535,000 件超の diff を評価し、331,000 件超を自動着地(automated landing)させた
  - リスク閾値を 25 パーセンタイルから 50 パーセンタイルへ緩和すると自動承認率は 60.31% に上昇
  - **精査した詳細は §6.1「Meta RADAR/DRS の精査」を参照**(2026-08-07 追記)。数値の比較対象・単位は当初の速報より正確に記述し直した

---

## 4. レビュー観点の階層化(仕様レベル / 実装レベルの分離)

### 4.1 何をするものか

- 「インタフェース・契約・設計」を先にレビューして固め、その後の「実装」は契約に沿っているかどうかの検証に縮小するという二段階の考え方
- 前倒しレビューの代表形態が ADR(Architecture Decision Record)レビューである

### 4.2 ADR レビューの実務

- ADR は Proposed 状態でレビューの対象になり、レビュー会議は「読む時間」を明示的に確保する(1 人あたり 10〜15 分が目安)ことが推奨される
- レビューの結果は「承認(Accepted)」「要修正」「却下」の三分岐で扱われる
- 出典: [How to review Architectural Decision Records (ADRs) — and how not to](https://ozimmer.ch/practices/2023/04/05/ADRReview.html) / [ADR process — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)
- Process Compass 自体もこの方式を採用しており(`src/content/docs/adr/`)、CLAUDE.md に「決定変更は新 ADR で置き換える」ルールがある(これはリポジトリの既存規約であり、本調査の新規発見ではない)

### 4.3 EARS 等の仕様記法との接続

- EARS(Easy Approach to Requirements Syntax)は要求を「前提条件・トリガー・システム名・システム応答」の定型パターンで書く記法。標準化により**レビュー・監査を単純化する**ことが目的の一つとされる
  - 出典: [Adopting EARS Notation for Requirements Specification — Visure Solutions](https://visuresolutions.com/alm-guide/adopting-ears-notation/)
- 2026 年時点では EARS が spec-driven development(仕様駆動開発)の文脈で AI エージェント向けの契約記述として再注目されている。AWS の Kiro は 1 つのプロンプトから EARS 記法の `requirements.md`・`design.md`・`tasks.md` の 3 文書を生成する構成を持つ
  - 出典: ["EARS, Fifteen Years On" — Medium](https://joshmcdonald.medium.com/ears-fifteen-years-on-the-requirements-format-built-for-the-agent-era-0f78f8ff35a0)(個人ブログであり一次情報としての厳密性は限定的。Kiro の実在自体は AWS 公式情報での裏取りを本調査では行っていない = 未確認)
- 判定: 「仕様レベルレビューと実装レベルレビューを分離し、EARS のような形式で契約を先に固定する」という設計思想は存在するが、**この分離がレビュー負荷を定量的にどれだけ削減するかを示す実証研究は本調査では確認できなかった**(= 未確認)

### 4.4 Google の readability 認定制度(階層化の別形態)

- Google は「コードの正しさ」のレビューとは別に、「読みやすさ(readability)」の認定を持つレビュアーだけが readability 承認を出せる制度を運用している
  - 認定を持つ著者は自分の CL(変更)に対して readability 承認を暗黙に与えられる。持たない場合は認定レビュアーの明示的承認が必要
  - 認定は言語ごとに取得する。認定を得るには readability 専門家チームへ自分のコードレビュー実践そのものを提出し、細部まで精査を受ける
  - 出典: [Software Engineering at Google — Code Review](https://abseil.io/resources/swe-book/html/ch09.html) / [Getting the Certification to Review Code at Google — PullRequest/HackerOne](https://www.pullrequest.com/blog/google-code-review-readability-certification/)
- OWNERS との関係: レビュー承認には「コード所有権(OWNERS)を持つ人」の承認が最低 1 件必要という制約が別途あり、readability 承認と所有権承認は独立した 2 軸のゲートである
  - 出典: 同上

---

## 5. 実行可能な保証でレビューを代替する手段

### 5.1 何をするものか

- 「人間が目で読んで確認する」代わりに、型・契約・テストなど**機械的に検証可能な保証**を積み、レビュアーが確認すべき範囲を絞り込む考え方

### 5.2 Design by Contract(契約による設計)

- Bertrand Meyer が提唱。事前条件(precondition)・事後条件(postcondition)・不変条件(invariant)により、コンポーネント間の責務を明示的な実行可能仕様として記述する
- Eiffel 言語がコヒーレントなエンドツーエンド実装を持つ唯一の環境とされる。継承時の契約整合性(サブクラスで契約を弱めてはならない等)も言語機構でチェックされる
  - 出典: [Design by Contract™ — Eiffel Software](https://www.eiffel.com/values/design-by-contract/) / Meyer, "Applying 'Design by Contract'"(原著論文 PDF)[ETH Zurich](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf)
- レビューとの関係(考察): 契約が実行時にチェックされる設計では、レビュアーは「契約を満たしているか」を実装ではなく**契約定義そのもの**に対して検証すればよく、実装詳細のレビュー負荷を型・契約側に移せる。ただし本調査では、この効果を定量測定した実証研究は確認できなかった(= 未確認)

### 5.3 プロパティベーステスト

- 外部入力を解析・検証・変換する関数には少なくとも 1 つのプロパティテストを持つべき、という運用指針が実務記事で示されている(Hypothesis、fast-check 等)
- 出典: [Comparing Code Coverage Techniques — Sven Ruppert](https://svenruppert.com/2024/05/31/comparing-code-coverage-techniques-line-property-based-and-mutation-testing/)
- 位置づけ: カバレッジ(実行の有無)ではなく、入力空間に対する性質の充足を保証するため、**手動レビューで境界値を1つずつ確認する必要性を減らす**設計思想である(考察)

### 5.4 変異テスト(mutation testing)によるカバレッジの質保証

- 定義: ソースコードに人工的な欠陥(mutant)を注入し、テストスイートがそれを検出(kill)できるかを測定する。行カバレッジは「実行されたか」しか測らないが、変異テストは「バグが入ったらテストが落ちるか」を測る
- 指標: Mutation Coverage(全 mutant のうち kill された割合)、Test Strength(カバー済みコード内の mutant のうち kill された割合)
- ツール: JVM 向け pitest、JavaScript 向け Stryker、Python 向け mutmut
- 実務事例: ある組織が Test Strength 80% 超を目標にした品質ゲートを新設した例が報告されている(具体的な組織名・出典の一次性は限定的)
  - 出典: [Mutation Testing: How to Ensure Code Coverage Isn't a Vanity Metric — Codecov](https://about.codecov.io/blog/mutation-testing-how-to-ensure-code-coverage-isnt-a-vanity-metric/)
- 位置づけ(考察): 変異テストのスコアが高いモジュールについては、レビュアーが「テストで担保されている」と信頼して実装レビューの深度を下げる、というリスクベース運用(次節)の入力指標として使える

### 5.5 形式検証(軽量含む)

- 本調査では、コードレビュー負荷削減の文脈で形式検証(TLA+ 等)を扱った一次資料を確認できなかった(= 未確認)。Design by Contract の延長として言及されることはあるが、レビュー負荷削減を主目的に据えた実務事例は見つからなかった

---

## 6. リスクベースのレビュー深度可変化

### 6.1 Meta RADAR/DRS の精査(2026-08-07 追記、原文再確認済み)

チームリードから指摘のあった論点(「行数に縛られないレビューが実在するか」)における最重要の一次事例のため、arXiv:2605.30208 の本文を再取得し、原文の定義に沿って数値を書き直した。

**(1) 「クローズ時間削減」の正確な定義**

- 原文: "Compared to human-reviewed diffs, RADAR reduces median time to close by over 330% and median diff review wall time by 35%."
- 訂正: 前回の速報で「クローズ時間 -330%」と書いたのは減少率としては定義上おかしい表現だった。原文は **"reduces... by over 330%"** という言い回しであり、これは「人間レビューのみの diff の中央値クローズ時間」を基準(100%)としたときの **相対的な削減幅の表現(3倍超の高速化に相当する言い回し)** である。厳密な定義(例えば (旧中央値-新中央値)/旧中央値 の式か、旧中央値/新中央値の倍率か)は本文の当該箇所には数式として明示されておらず、著者の言い回しをそのまま引用するにとどめる(= 定義の完全な一意性は未確認)
- 比較対象: 「RADAR 経由の diff」対「人間がレビューした diff」(RADAR 導入前後の時系列比較ではなく、**同時期における処理経路の違いによる比較**)
- 出典: 4.3 節(RQ3)、Table 6 — [arXiv:2605.30208](https://arxiv.org/abs/2605.30208)

**(2) リバート率・本番インシデント(PI)率**

- 原文: "The revert rate for RADAR-reviewed diffs is ⅓ that of non-RADAR diffs"(RADAR レビュー diff のリバート率は、非 RADAR diff の 1/3)
- 原文: "the Production Incident (PI) rate is 1/50 that of non-RADAR diffs"(PI 率は非 RADAR diff の 1/50)
- 比較対象: **「RADAR が判定対象とした(=低リスクと分類された)diff」対「RADAR の対象にならなかった(=それ以外の経路をたどった)diff」** であり、RADAR 導入前後の比較ではない。母集団は 535,000 件超の RADAR 対象 diff 全体
- 解釈上の注意(考察): RADAR が「低リスク」と判定した diff 自体が元々リバートやインシデントを起こしにくい性質を持つ可能性があり、比較には**選択バイアス**が内在する。論文自身も後述の Internal Validity で無作為割り付けでないことを認めている

**(3) 自動着地(auto-land)33.1 万件の内実 — 人間レビューは省略されたのか**

- 原文: "RADAR Approval…meaning no human review is required—not even deferred"(RADAR 承認を得た diff は「人間レビュー不要」であり、これは**先送りされたレビューさえない**という意味である)
- 対象条件(原文): "only the lowest-risk 5% of diffs qualify"(DRS の P5 デフォルト設定では、最もリスクが低い上位 5% の diff のみが対象)。また "require a confidence score of at least 8 out of 10"(信頼度スコア 10 点満点中 8 点以上が要件)
- 代替される保証: 論文 2.1 節で、自動テスト・段階的ロールアウト(staged rollout)・本番監視(production monitoring)に依存する旨が言及されている
- **改稿への含意(考察)**: これは「レビューを省略しても大丈夫な変更をリスクスコアで特定し、その分の保証を自動テスト・段階的ロールアウト・本番監視へ完全に移す」設計である。つまり RADAR は「レビューをしない」だけでなく、**その代わりに実行可能な保証(テスト・ロールアウト・監視)を積み増している**ことが前提になっている。Process Compass の改稿で引用する場合は、「レビューを省略する」ではなく「レビューを他の保証に置き換える」という枠組みで書くのが正確である

**(4) DRS(Diff Risk Score)の入力特徴**

- 論文本文は DRS の入力特徴量を明示的に列挙していない。確認できたのは "optimized for high recall…flagging…PI-causing changes"(本番インシデントを引き起こす変更を取りこぼさないよう高再現率で最適化されている)という設計方針の記述のみ
- 判定: **DRS の具体的な入力特徴(障害履歴・所有者・テストカバレッジ・変更種別など)は本論文からは確認できなかった(= 未確認)**。関連研究(JIT 欠陥予測、§6.5 参照)から類推できる特徴カテゴリ(diffusion・size・purpose・history・experience)を参考情報として示すにとどめる

**(5) Limitations / Threats to Validity(第6章)**

- Generalizability(一般化可能性)への言及: "large monorepo, standardized tooling, and high automation coverage for testing and rollout"(大規模モノレポ、標準化されたツールチェーン、テストとロールアウトにおける高い自動化カバレッジという Meta 固有の前提に依存する)
- Internal Validity(内的妥当性)への言及: "diffs are not randomly assigned to RADAR, unobserved confounding can influence observed changes"(diff は RADAR に無作為割り付けされていないため、観測されていない交絡因子が結果に影響しうる)
- **含意(考察)**: 論文自身が「モノレポ・高度な自動テスト・段階的ロールアウト基盤」という前提を明示しており、これらを持たない組織(Process Compass が想定するような中小規模チーム)への一般化には注意が必要である。RADAR の成果を引用する際は「Meta 規模の自動化基盤があって初めて成立する」という限定を必ず添えるべきである

### 6.2 CodeScene の Hotspot / Review Level

- CodeScene は変更頻度と Code Health(保守性指標)を組み合わせてホットスポットを特定し、Delta Analysis によりコードベース固有の「リスクプロファイル」を算出、それに応じた推奨レビューレベルを PR に提示する
- PR に対する webhook 連携で Delta Analysis を自動実行し、品質ゲートとしても使える
  - 出典: [CodeScene Terminology](https://docs.enterprise.codescene.io/versions/6.0.8/terminology/codescene-terminology.html) / [Reduce business risk — CodeScene](https://codescene.com/reduce-risks-improve-delivery)

### 6.3 Google の OWNERS / readability(既存の階層構造を再解釈)

- OWNERS モデル自体は「誰が承認できるか」を静的に定義するものだが、GitHub の CODEOWNERS は Chromium の OWNERS ファイルに着想を得たものであり、リスクベースというより**所有権ベース**のゲートである(既存メモ §7 に詳細あり、重複のため詳述は避ける)
- readability 認定制度(§4.4)は、変更の内容ではなく**レビュアーの資格**でゲートの厳密さを変える設計であり、リスクベース(変更側の属性で深度を変える)とは軸が異なる点に注意(考察)

### 6.4 Google の Large-Scale Changes(LSC) — 「行数上限が成立しない類型」の一次事例(2026-08-07 追記)

チームリードから指摘のあった論点(「行数上限が成立しない類型」の一次事例)として、Google の `Software Engineering at Google` 書籍の Large-Scale Changes 章(第22章)を確認した。

**(1) 定義**

- 原文の要旨: LSC とは「論理的には関連しているが、実務上ひとつのアトミックな単位として提出できない変更群」である。ファイル数が多すぎて基盤ツールが一度にコミットできない、または変更が大きすぎて常にマージコンフリクトを起こす、といった理由による
  - 出典: [Software Engineering at Google — Large-Scale Changes (ch22)](https://abseil.io/resources/swe-book/html/ch22.html)

**(2) 通常のレビュールールからの逸脱**

- グローバル承認者(global approver)の存在: "a 'global approver': someone who has ownership rights to approve _any_ change throughout the repository"(リポジトリ全体のどの変更でも承認できる所有権を持つ人)
- パターンベースの自動承認: グローバルレビュアーは "a separate set of pattern-based tooling to review each of the changes and automatically approve ones that meet their expectations"(パターンベースのツールで各変更をレビューし、期待に合致するものを自動承認する)ツールセットを使う
- ローカル所有者への転送は限定的: "we only send changes to local owners for which their review is required for context, not just approval permissions"(承認権限のためだけでなく、文脈理解のためにレビューが必要な場合に限りローカル所有者へ送る) — これは、通常の「変更行数に応じてレビューを求める」ルールとは異なり、**変更の性質(機械的か否か、文脈理解が必要か否か)でレビューの要否を決める**設計である
- 委員会による審査: LSC の実施には委員会がフィードバックを与えるプロセスがあり、"the committee has been very liberal with their approval"(委員会は承認に非常に寛大である)と記述されている

**(3) 規模の実例**

- "a double-digit percentage (10% to 20%) of the changes in a project to be the result of LSCs"(プロジェクトにおける変更の 10〜20% という二桁パーセンテージが LSC によるものである)
- scoped_ptr のケーススタディ: "more than 700 independent changes, touching more than 15,000 files per day"(1 日あたり 700 件超の独立した変更が、15,000 ファイル超に触れる)

**(4) 人手レビューの代わりに何が品質を担保しているか**

- テストインフラへの信頼: "we are now much more confident in the correctness of a single change than a test with any recent history of flakiness"(最近フレーキーだったテストよりも、単一の変更の正しさの方に自信が持てるようになった、という趣旨の記述。テストの信頼性が担保基盤であることを示唆)
- 独立してコミット可能なシャーディング: "individual shards should be committable independently"(個々のシャード(変更の断片)は独立してコミット可能であるべき)という設計原則により、1つのシャードの問題が全体をブロックしない
- 機械的変換への依存: "machines rely upon consistent environments to apply the proper code transformations to the correct places"(機械は一貫した環境に依存して、正しい場所に正しいコード変換を適用する) — 人間の判断ではなく、決定論的なツール(codemod 等)による変換の再現性が保証の源泉になっている

**(5) 改稿への含意(考察)**

- LSC は「行数が多いから危険」ではなく、「**変更が機械的(自動化ツールによる決定論的変換)かどうか**」でレビュー深度を変える一次事例である。これは RADAR(統計的リスク予測モデルによる自動化)とは異なる根拠に基づく点に注意したい
  - RADAR: 統計的リスクスコアが低い変更のレビューを省略し、テスト・ロールアウト・監視で代替する
  - LSC: 変更の生成過程が決定論的・機械的であることを根拠に、人手レビューを「文脈理解が必要な場合のみ」に限定し、残りはパターンマッチングによる自動承認とグローバル承認者の一括承認に委ねる
- 両者は「行数を主軸にレビュー要否を決めない」という共通点を持つが、**担保のロジックが異なる(統計的リスク予測 vs 変更生成過程の決定論性)**ため、改稿では区別して記述するのが妥当である

### 6.5 Just-In-Time defect prediction(学術的基盤)

- JIT(Just-In-Time)欠陥予測モデルは、diffusion(変更の分散度)・size・purpose・history・experience の 5 カテゴリの特徴量からコミット単位の欠陥リスクを予測する、リスクベースレビューの学術的基盤である
  - 出典: [A Preliminary Study on Explaining Risk of Code Changes using LLM-Based Prediction Models](https://arxiv.org/html/2607.02782v1)
- レビュアー推薦への応用として「高リスク diff 向けのレビュアー推薦」を扱う研究(FSE 2026 採択)が存在する
  - 出典: "Code Reviewer Recommendation for High Risk Diffs at Scale" — [ACM DOI: 10.1145/3803437.3805220](https://doi.org/10.1145/3803437.3805220)

### 6.6 Netflix / Shopify の公開事例(確認できず)

- Netflix・Shopify のエンジニアリングブログを検索したが、ホットスポットやリスクスコアに基づくレビュー深度可変化を明示的に説明した記事は本調査では見つからなかった
- Shopify のブログでは「小さく一貫した PR がレビューへの恐怖を減らす」という一般的な主張は見られたが、リスクベースの仕組みには言及がない
  - 出典: [Great Code Reviews — Shopify Engineering](https://shopify.engineering/great-code-reviews)
- 判定: この論点における公開の一次事例は **Meta(RADAR/DRS)、CodeScene、Google(LSC)に限られる**(2026-08-07 時点、本調査の範囲内)

---

## 7. 調査フレームワーク観点での整理

### 7.1 階層構造(3 階層への当てはめ)

- 全体プロセス: 仕様レベルレビュー(ADR / EARS 契約の承認)→ 実装 → リスク判定(DRS 等)/ 変更の性質判定(機械的か否か、LSC 相当か)→ 高リスク・文脈依存のみ人手レビュー、それ以外は自動承認・スキップ → マージ
- フェーズ内ワークフロー(1 PR のレビュー):
  1. 変更のリスクスコア算出(CodeScene Delta Analysis / DRS 相当)、または機械的変更(LSC 相当)かどうかの判定
  2. AI レビューによる一次スクリーニング(要約・指摘生成)
  3. 変異テスト・プロパティテストで担保された範囲は人手レビューを縮小
  4. 契約(interface)違反がないかを構造 diff(difftastic 等)/ アーキテクチャ diff(Structurizr 等)で可視化して確認
  5. readability / OWNERS 双方の承認取得(通常経路)、または global approver によるパターンベース自動承認(LSC 経路)
- 個別作業: AST 差分の確認、コンフリクトの意味的競合チェック(既存メモ参照)、mutation score のしきい値判定

### 7.2 レビュー観点の階層化とゲートの対応(考察)

- 「仕様(契約)ゲート」と「実装(コード)ゲート」を分離すると、実装ゲートの一部は変異テスト・プロパティテストという**実行可能な保証で代替**でき、人手レビューは「契約からの逸脱」と「契約自体の妥当性」に集中できる、という設計思想が本調査で確認した複数の要素(DbC、EARS、mutation testing、RADAR)に共通して見られる
- ただしこの統合的な設計を単一の枠組みとして提示している一次資料は見つからず、**各要素は個別の研究・製品として存在するのみ**であり、統合の効果測定は本調査では未確認である
- RADAR と LSC の対比(§6.4(5))から、「行数に縛られないレビュー」を実現する根拠は少なくとも2種類ある: (a) 統計的リスク予測により低リスクと判定された変更のレビューを省略し他の保証で代替する方式、(b) 変更の生成過程が決定論的・機械的であることを根拠に大量の変更を一括で扱う方式。Process Compass の改稿ではこの2軸を区別して提示すべきである(考察)

---

## 8. 埋められなかった観点(追加調査が必要な穴)

- Reviewable、Gerrit といった従来型レビューツールの現況調査は未実施(時間配分の都合で優先度を下げた)。既存メモが Graphite/ghstack/Sapling/git-branchless/spr に集中しているため、Gerrit 系(Google 系企業での実運用)の現在の位置づけは別途調査が必要
- コールグラフ差分・依存グラフ差分を専業で行うツール(Sourcegraph 以外)の横断調査(例: 商用の依存関係可視化 SaaS)は不十分
- CodeSee 終了の一次発表(プレスリリース等)は未確認。二次情報からの推定にとどまる
- Change Impact Analysis 論文(Springer, 10.1007/s10664-024-10600-2)は認証壁により要旨レベルの確認にとどまり、評価指標の具体的な数値(精度・再現率等)は未取得
- Netflix / Shopify のリスクベースレビュー深度可変化の公開一次事例は発見できなかった(Meta・CodeScene・Google LSC 以外の企業事例)
- EARS × AI エージェント(Kiro 等)の実在性・仕様は AWS 公式情報での裏取りをしていない
- Design by Contract・プロパティベーステスト・変異テストが「レビュー負荷をどれだけ定量的に削減したか」を直接測定した実証研究は本調査の範囲では確認できなかった
- **RADAR の "reduces median time to close by over 330%" の厳密な算出式(何を分母にした何パーセントか)は論文本文からは数式として確認できず、著者の言い回しの引用にとどまっている(= 完全解明には至らず)**
- **DRS(Diff Risk Score)の具体的な入力特徴量は RADAR 論文からは列挙できず、関連研究(JIT 欠陥予測)からの類推にとどまる(= 未確認)**
- 日本企業における本調査対象手法の導入実態(建前と実運用の乖離)に関する情報は今回収集できなかった

---

## 出典一覧

- [Why "as code"? — Structurizr](https://docs.structurizr.com/as-code)
- [X-Ray — CodeScene 7.3.8 Documentation](https://docs.enterprise.codescene.io/latest/guides/technical/xray.html)
- [Identify Refactoring Targets — CodeScene](https://codescene.com/use-cases/refactoring-targets)
- [CodeScene Terminology](https://docs.enterprise.codescene.io/versions/6.0.8/terminology/codescene-terminology.html)
- [Reduce business risk and improve delivery accuracy — CodeScene](https://codescene.com/reduce-risks-improve-delivery)
- [Batch Changes — Sourcegraph docs](https://sourcegraph.com/docs/batch-changes)
- [Best Codebase Visualization Tools — repowise.dev](https://www.repowise.dev/blog/comparisons/best-codebase-visualization-tools)
- [GumTreeDiff/gumtree — GitHub](https://github.com/GumTreeDiff/gumtree)
- [A Novel Refactoring and Semantic Aware AST Differencing Tool — ACM TOSEM 2024](https://dl.acm.org/doi/10.1145/3696002)
- [Wilfred/difftastic — GitHub](https://github.com/Wilfred/difftastic)
- [Difftastic — difftastic.wilfred.me.uk](https://difftastic.wilfred.me.uk/)
- [SmartCommit — ESEC/FSE 2021](https://dl.acm.org/doi/abs/10.1145/3468264.3468551)
- [UTANGO — ESEC/FSE 2022](https://dl.acm.org/doi/abs/10.1145/3540250.3549171)
- [Atomizer (arXiv:2601.01233)](https://arxiv.org/html/2601.01233)
- [Enhanced code reviews using pull request based change impact analysis — Empirical Software Engineering (Springer)](https://link.springer.com/article/10.1007/s10664-024-10600-2)
- [GitHub Copilot Code Review 完全ガイド 2026 — DEV](https://dev.to/rahulxsingh/github-copilot-code-review-complete-guide-2026-255h)
- [CodeRabbit vs GitHub Copilot Code Review (2026) — morphllm](https://www.morphllm.com/comparisons/coderabbit-vs-copilot)
- [Best Code Review Tools 2026 — Greptile](https://www.greptile.com/content-library/best-ai-code-review-tools)
- [Automating Low-Risk Code Review at Meta: RADAR (arXiv:2605.30208)](https://arxiv.org/abs/2605.30208)
- [How to review Architectural Decision Records (ADRs) — and how not to](https://ozimmer.ch/practices/2023/04/05/ADRReview.html)
- [ADR process — AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)
- [Adopting EARS Notation for Requirements Specification — Visure Solutions](https://visuresolutions.com/alm-guide/adopting-ears-notation/)
- [EARS, Fifteen Years On — Medium](https://joshmcdonald.medium.com/ears-fifteen-years-on-the-requirements-format-built-for-the-agent-era-0f78f8ff35a0)
- [Software Engineering at Google — Code Review (abseil.io)](https://abseil.io/resources/swe-book/html/ch09.html)
- [Software Engineering at Google — Large-Scale Changes (ch22, abseil.io)](https://abseil.io/resources/swe-book/html/ch22.html)
- [Getting the Certification to Review Code at Google — PullRequest/HackerOne](https://www.pullrequest.com/blog/google-code-review-readability-certification/)
- [Design by Contract™ — Eiffel Software](https://www.eiffel.com/values/design-by-contract/)
- [Applying "Design by Contract" — Bertrand Meyer(原著論文 PDF, ETH Zurich)](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf)
- [Comparing Code Coverage Techniques: Line, Property-Based, and Mutation Testing — Sven Ruppert](https://svenruppert.com/2024/05/31/comparing-code-coverage-techniques-line-property-based-and-mutation-testing/)
- [Mutation Testing: How to Ensure Code Coverage Isn't a Vanity Metric — Codecov](https://about.codecov.io/blog/mutation-testing-how-to-ensure-code-coverage-isnt-a-vanity-metric/)
- [A Preliminary Study on Explaining Risk of Code Changes using LLM-Based Prediction Models (arXiv:2607.02782)](https://arxiv.org/html/2607.02782v1)
- [Code Reviewer Recommendation for High Risk Diffs at Scale — FSE 2026 (ACM DOI)](https://doi.org/10.1145/3803437.3805220)
- [Great Code Reviews — Shopify Engineering](https://shopify.engineering/great-code-reviews)
