# プロセス記述に関する国際標準の調査メモ

- Issue: #20
- 作成日: 2026-07-09
- 目的: フェーズ1「現状の開発プロセスの体系化」で使う調査フレームワークの骨格として、プロセスを記述・構造化するための国際標準(ISO/IEC/IEEE 24774、ISO/IEC/IEEE 12207、SPEM 2.0)と、ゲート型意思決定モデル(Stage-Gate、デザインレビュー)を整理する。

> **出典に関する注記**: ISO/IEC/IEEE 規格および OMG 仕様の本文は有料(または大部)のため、本メモは公式アブストラクト・公式概要ページ・信頼できる解説記事から再構成しています。規格本文の逐語的な規則(例: アウトカム数の推奨値)は未確認の箇所があり、その旨を各所に明記しています。

---

## 1. ISO/IEC/IEEE 24774:2021 — プロセス記述の仕様

### 1.1 位置づけ

- 正式名称: *Systems and software engineering — Life cycle management — Specification for process description*
- プロセスを定義する際の考慮事項を説明し、**プロセス記述を構成する要素(elements)とその記述規則(rules)** を特定することで、プロセス記述への要件と推奨事項を与える規格([ISO 公式ページ](https://www.iso.org/standard/78981.html)、[IEC Webstore](https://webstore.iec.ch/en/publication/68995))
- 2021年版は初の国際規格(IS)版。前身は技術報告書 **ISO/IEC TR 24774:2010**(*Guidelines for process description*)であり、2021年版はこれを技術的に改訂して IEEE と共同で IS 化したもの([iTeh プレビュー検索結果](https://cdn.standards.iteh.ai/samples/78981/5c068220670742f98a48d5cd7ad4d050/ISO-IEC-IEEE-24774-2021.pdf)、[IEEE SA](https://standards.ieee.org/ieee/24774/10126/))
- プロセス記述の一貫性を確保する「メタ規格」であり、12207(ソフトウェア)・15288(システム)のプロセス定義はこの規約に従って書かれている([ISO 公式ページ](https://www.iso.org/standard/78981.html))
- **カバーしない範囲**(スコープ外として明記): プロセスをより大きなフレームワークやライフサイクルモデルへ合成する方法、プロセス実施のパフォーマンス評価、プロセスの産出物(プロダクト)の評価([ISO 公式ページ](https://www.iso.org/standard/78981.html))

### 1.2 プロセス記述の要素一覧

前身の TR 24774:2010 の公式アブストラクトが、プロセス記述に最も頻繁に使われる要素として以下の6つを明示している([ISO: TR 24774:2010](https://www.iso.org/standard/53815.html))。2021年版はこれを引き継ぎ、加えて **process view(プロセスビュー)** の使い方と、本規格に従って記述されたプロセスへの**適合(conformance)の定義方法**を規定している([ISO: 24774:2021](https://www.iso.org/standard/78981.html))。

| 要素 | 英語名 | 内容(解説からの再構成) |
|---|---|---|
| 題名 | title | プロセス全体のスコープを表す短い名詞句 |
| 目的 | purpose | プロセスを実施する目標(goal)の記述 |
| 成果 | outcomes | プロセスをうまく実施したときに期待される**観察可能な結果** |
| アクティビティ | activities | 成果(outcomes)を達成するために用いる行為のまとまりのリスト |
| タスク | task | 成果の達成を支援する要求事項・推奨事項・許容される行為 |
| 情報項目 | information item | プロセスの入出力となる情報(文書類)。内容の詳細は ISO/IEC/IEEE 15289 が規定 |

- 各要素の性格づけ(「outcomes は観察可能な結果」「tasks は要求・推奨・許容行為として表現」)は、12207/15288 のプロセス記述規約の解説として複数の二次情報で一貫して説明されている(例: [arc42 Quality Model の 12207 解説](https://quality.arc42.org/standards/iso12207)、[Konfirmity 15288 解説](https://www.konfirmity.com/glossary/15288))
- **未確認事項(規格本文が必要)**: purpose を単一文で書く、outcomes の推奨個数、outcomes を「成果物の産出/状態の変化/制約の充足」のいずれかで表現する、といった細則の正確な文言。TR 24774:2010 由来の規則として知られるが、本調査では一次情報で裏を取れなかった。フレームワーク確定前に JIS X 0170/JIS X 0160 等の入手可能な邦訳・関連規格で確認したい

### 1.3 フェーズ1調査への含意

- 「プロセスを1個記述する」ときの最小テンプレートは **title / purpose / outcomes / activities / tasks / information items** の6点セットで良い、という強い根拠になる
- outcomes(観察可能な結果)と information items(成果物)を分離する発想は、「成果物レビュー」と「状態のゲート判定」を混同しないための鍵になる

---

## 2. ISO/IEC/IEEE 12207:2017 — ソフトウェアライフサイクルプロセス

### 2.1 位置づけと2017年版の変更

- 正式名称: *Systems and software engineering — Software life cycle processes*([ISO 公式ページ](https://www.iso.org/standard/63712.html))
- 2017年版の最大の変更は、**ISO/IEC/IEEE 15288:2015(システムライフサイクルプロセス)と同一のプロセスモデルを採用**したこと。この整合により、旧版(2008)の43プロセスは **15288 と共通の30プロセス** に統合された([Wikipedia: ISO/IEC 12207](https://en.wikipedia.org/wiki/ISO/IEC_12207))
- 30プロセスは **4つのプロセス群** に分類される([iTeh 標準ガイド](https://standards.iteh.ai/catalog/standards/iso/6b5ad16c-6696-447d-aa76-18202d695a05/iso-iec-ieee-12207-2017)ほか)

### 2.2 4プロセス群と30プロセスの一覧

以下は 15288:2015 の30プロセス一覧([Wikipedia: ISO/IEC 15288](https://en.wikipedia.org/wiki/ISO/IEC_15288))。12207:2017 は「15288:2015 と同一のプロセスモデル」を採用しているため([Wikipedia: ISO/IEC 12207](https://en.wikipedia.org/wiki/ISO/IEC_12207))、この一覧がそのまま 12207:2017 の構成に対応する(注: 12207 では一部プロセス名が "System/Software requirements definition" のようにソフトウェア文脈で読み替えられる)。

- **合意プロセス群(Agreement Processes)** — 組織間の取引・契約: 2プロセス
  - Acquisition(取得)
  - Supply(供給)
- **組織のプロジェクトイネーブリングプロセス群(Organizational Project-Enabling Processes)** — 組織がプロジェクトを支える能力の提供: 6プロセス
  - Life Cycle Model Management(ライフサイクルモデル管理)
  - Infrastructure Management(インフラストラクチャ管理)
  - Portfolio Management(ポートフォリオ管理)
  - Human Resource Management(人的資源管理)
  - Quality Management(品質管理)
  - Knowledge Management(知識管理)
- **テクニカルマネジメントプロセス群(Technical Management Processes)** — プロジェクトの計画・評価・制御: 8プロセス
  - Project Planning(プロジェクト計画)
  - Project Assessment and Control(プロジェクトアセスメントと制御)
  - Decision Management(意思決定管理)
  - Risk Management(リスク管理)
  - Configuration Management(構成管理)
  - Information Management(情報管理)
  - Measurement(測定)
  - Quality Assurance(品質保証)
- **テクニカルプロセス群(Technical Processes)** — エンジニアリング作業そのもの: 14プロセス
  - Business or Mission Analysis(事業・ミッション分析)
  - Stakeholder Needs and Requirements Definition(利害関係者ニーズ・要求事項定義)
  - System/Software Requirements Definition(システム/ソフトウェア要求事項定義)
  - Architecture Definition(アーキテクチャ定義)
  - Design Definition(設計定義)
  - System Analysis(システム分析)
  - Implementation(実装)
  - Integration(統合)
  - Verification(検証)
  - Transition(移行)
  - Validation(妥当性確認)
  - Operation(運用)
  - Maintenance(保守)
  - Disposal(廃棄)

### 2.3 日本での展開: 共通フレーム(SLCP-JCF)

- IPA の **共通フレーム2013(SLCP-JCF2013)** は、12207:2008(JIS X 0160:2012)を包含しつつ「日本のソフトウェア産業界で必要とされるプロセスや作業項目を追加」した日本独自の枠組み([IPA: 国際規格SLCPの進化とそのポイント](https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html))
- 発注者(ユーザー企業)と受注者(ベンダー)の間で「言葉の物差し」を合わせる、日本の多段請負構造を前提とした利用が想定されている点が国際規格との運用上の違い([IPA 共通フレーム2013 第3部 PDF](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf)、[Wikipedia: 共通フレーム](https://ja.wikipedia.org/wiki/%E5%85%B1%E9%80%9A%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0))
- 日本独自追加(企画プロセス・要件定義プロセスなどの「超上流」)の正確な範囲は本調査では一次情報で確認しきれておらず、追加調査項目とする

### 2.4 フェーズ1調査への含意

- 「開発プロセス」を洗い出すときのチェックリストとして、30プロセス×4群は網羅性の担保に使える
- 特に **Organizational Project-Enabling(組織側)** と **Technical Management(プロジェクト側)** の分離は、本プロジェクトの調査観点「組織的役割」と「ゲート・意思決定」をそれぞれ受け止める器になる

---

## 3. SPEM 2.0 — OMG ソフトウェア・システムプロセス工学メタモデル

### 3.1 位置づけ

- 正式名称: *Software & Systems Process Engineering Meta-Model Specification, Version 2.0*(OMG、2008)([OMG 仕様 PDF](https://www.omg.org/spec/SPEM/2.0/PDF)、[OMG 仕様ページ](https://www.omg.org/spec/SPEM/2.0/))
- 開発プロセスを**モデルとして定義するためのメタモデル**(かつ UML プロファイル)。「あらゆるソフトウェア・システム開発プロセスを定義するのに必要な最小限の要素」に意図的に限定されており、汎用の挙動モデリングは UML 2.0 アクティビティや BPMN に委ねる設計([Modeling Languages: Software process modeling with SPEM](https://modeling-languages.com/process-software-modeling-spem/))
- 実装としては Eclipse Process Framework(EPF)が知られる([Eclipse EPF](https://projects.eclipse.org/projects/technology.epf))

### 3.2 コア概念と関係

SPEM 2.0 の最大の特徴は **Method Content(方法知識)と Process(プロセス=時系列への配置)の分離**。

- **Method Content(方法コンテンツ)** — 特定プロジェクト・特定ライフサイクルに依存しない再利用可能な知識ベース([Modeling Languages](https://modeling-languages.com/process-software-modeling-spem/)、[OMG 仕様](https://www.omg.org/spec/SPEM/2.0/PDF))
  - **Role Definition(ロール)**: スキルと責任の定義。タスクの実行責任を持つ
  - **Task Definition(タスク)**: ロールに割り当てられる作業単位。**Step(ステップ)** に分解でき、Work Product を入出力に持つ
  - **Work Product Definition(作業成果物)**: タスクの入出力。特化型として Artifact など
  - **Guidance(ガイダンス)**: 補助情報。特化型に Guideline、Roadmap、Tool Mentor、White Paper など
- **Process(プロセス)** — Method Content の要素を時系列・プロジェクト文脈に配置したもの
  - **Activity(アクティビティ)**: 作業のまとまり。入れ子にでき、プロセス構造の基本単位
  - **Phase(フェーズ)/ Iteration(イテレーション)/ Milestone(マイルストーン)**: ライフサイクル上の時間構造を表す挙動要素
  - Task Use / Role Use など「定義の使用(occurrence)」を表す要素で、同じ定義を複数の文脈で再利用する
- 要素の性格による3分類([LinkedIn: Figay の SPEM 解説](https://www.linkedin.com/pulse/how-can-agile-modeled-dr-nicolas-figay)ほか)
  - 能動要素(active): Role、Role Set
  - 受動要素(passive): Work Product、Guidance
  - 挙動要素(behavioral): Phase、Iteration、Milestone、Activity、Task Definition、Step

### 3.3 メタモデルの7パッケージ構造

SPEM 2.0 仕様は7つのメタモデルパッケージで構成される([OMG 仕様 PDF](https://www.omg.org/spec/SPEM/2.0/PDF)、[SJSU 講義資料](http://www.cs.sjsu.edu/~pearce/modules/topics/uml/spem.pdf))。

1. **Core** — 全パッケージの基盤となる共通クラスと抽象
2. **Process Structure** — アクティビティの入れ子など静的なプロセス構造
3. **Process Behavior** — 外部の挙動モデル(UML アクティビティ等)との接続
4. **Managed Content** — 自然言語による記述コンテンツ(ガイダンス等)の管理
5. **Method Content** — プロセス非依存の再利用可能な方法知識(Role/Task/Work Product)
6. **Process with Methods** — Method Content をプロセスへ結びつける仕組み
7. **Method Plugin** — メソッドライブラリの部品化・拡張・差し替え機構

### 3.4 フェーズ1調査への含意

- 本プロジェクトの調査観点「ロールモデル」「成果物」を、Role — Task — Work Product の三角関係として図解する語彙をそのまま提供してくれる
- 「Method Content と Process の分離」は、"標準プロセス(建前)" と "プロジェクトごとの適用(実運用)" を分けて記述するのに使える構図

---

## 4. ステージゲート法とデザインレビュー(DR)

### 4.1 Cooper の Stage-Gate(原典定義)

- 提唱者は Robert G. Cooper。1980年代に概念化され、1990年の論文 *"Stage-Gate Systems: A New Tool for Managing New Products"*(Business Horizons)で体系化された([CIO Wiki: Stage-Gate](https://cio-wiki.org/wiki/Stage-Gate)、[Wiley: The Stage-Gate Idea to Launch System](https://onlinelibrary.wiley.com/doi/full/10.1002/9781444316568.wiem05014))
- 定義: 「新製品プロジェクトをアイデアから上市まで動かすための概念的・運用的ロードマップであり、作業を明確なステージに分割し、経営判断のゲート(gatekeeping)で区切るもの」([CIO Wiki](https://cio-wiki.org/wiki/Stage-Gate)、[Stage-Gate International 公式ブログ](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/))
- **標準的なステージ構成**(Discovery + 5ステージ)([Stage-Gate International](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/))
  - Discovery(機会発見・アイデア創出)
  - Stage 1: Scoping / Concept(初期評価)
  - Stage 2: Build the Business Case(事業性の証拠固め)
  - Stage 3: Development(開発)
  - Stage 4: Testing and Validation(製品・マーケ・生産システムの検証)
  - Stage 5: Launch(市販化)
- **ゲートの3要素構造**([Stage-Gate International](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/))
  - Deliverables(インプット): プロジェクトリーダーがゲートに持ち込む、前ステージの定義済み成果物
  - Criteria(判定基準): プロジェクトの成熟度(次ステージへの準備完了度)と事業価値。戦略適合・競争優位・市場魅力度・技術実現性・財務リターンとリスクなど([Mindtools](https://www.mindtools.com/a5qzdsk/what-is-stage-gate-innovation/))
  - Outputs(アウトプット): **Go / Kill / Hold / Recycle** の明確な判定と、合意された次ステージ計画
- **ゲートキーパー**: 各機能領域のシニアマネージャーで、次ステージに必要な**リソースを所有・管理する者**。大型案件のゲート3〜5では事業のリーダーシップチームが担当([Stage-Gate International](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/))
- ポイント: ゲート判定者の資格要件が「役職」ではなく「**リソースをコミットできること**」で定義されている。ここが日本的 DR との対比軸になる

### 4.2 デザインレビュー(DR)の定義 — JIS

- **JIS Z 8115:2019「ディペンダビリティ(総合信頼性)用語」** が用語 **192J-12-101「デザインレビュー」** を定義している(J 付き番号=IEC 60050-192 にない日本独自追加用語)([kikakurui.com による JIS Z 8115:2019 全文](https://kikakurui.com/z8/Z8115-2019-01.html)、[JSA 規格ページ](https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+8115:2019))
  - 定義: 「当該アイテムのライフサイクル全体にわたる既存又は新規に要求される設計活動に対する、文書化された計画的な審査」
  - 注記の要点(同上)
    - 要求事項および設計活動中の不具合を検出・修正する目的のすべての審査活動を含む
    - 目的には、仕様要求を満たす設計能力の確認、実際・潜在的な不足の顕在化、向上要求の評価を含む
    - 設計活動には製品・プロセスの両方を含み得る
    - 技術レビュー、公式デザインレビュー、チームレビュー、プロジェクトレビュー、ステータスレビューの中で実施され得る
- DR が「デザインレビュー」として日本独自の用語登録になっていること自体が、日本の製造業文化における DR の重み(信頼性管理の中核制度)を示す

### 4.3 日本の製造業における DR の段階(DR0〜DR6)

段階の数と名称は企業ごとに異なる(DR0〜DR5、DR1〜DR6 など)が、「開発の節目ごとに関係部門を集めて審査し、次工程への移行を判定する」構造は共通([Skillnote: デザインレビューとは](https://skillnote.jp/knowledge/designreview/)、[ものづくりドットコム: DR とは](https://www.monodukuri.com/gihou/article/4732)、[キーエンス: DR の理想的な運用方法](https://www.keyence.co.jp/ss/products/marker/housing-design/approach/design-review.jsp))。

典型的な段階構成(Skillnote の DR1〜DR6 モデルに基づく。[出典](https://skillnote.jp/knowledge/designreview/)):

| 段階 | フェーズ | 主な判定内容 |
|---|---|---|
| DR1 | 開発企画 | 市場規模・顧客ニーズ・技術的実現可能性・競合・収益性から開発テーマの妥当性を審査 |
| DR2 | 構想設計 | 採用技術・基本構造・開発方針とリスクを審査し、詳細設計への移行を判定 |
| DR3 | 詳細設計 | 部品選定・製造工程・図面・仕様書・FMEA を確認し、試作可能かを判定 |
| DR4 | 試作評価 | 試作品の性能評価結果を審査し、量産に向けた課題を明確化 |
| DR5 | 量産前 | 製造ライン妥当性・品質管理体制・作業者教育を最終確認する**量産移行の最終ゲート** |
| DR6 | 初期流動 | 量産直後の品質評価と製造プロセス改善 |

- 参加者: 設計・企画・品質保証・生産技術・設備・製造・営業・購買など関連部署の横断参加が原則([Skillnote](https://skillnote.jp/knowledge/designreview/))
- 企画段階を DR0 と呼ぶ流儀もある(段階名は各社の社内規定で定義され、業界統一標準は見当たらない。[東海モデル](https://www.tokaimodel.com/news/1510/)、[富士フイルムBI コラム](https://www.fujifilm.com/fb/ja/solutions/columns/monozukuri-3522) などの解説でも段数・呼称が揺れている)

### 4.4 日本の SIer における工程レビュー

- SIer のウォーターフォール開発では、要件定義 → 基本設計 → 詳細設計 → 製造 → テストの各工程末に、成果物(設計書)レビューと**工程完了判定**を置く運用が一般的([Geekly: SIer の工程解説](https://www.geekly.co.jp/column/cat-technology/sier_jobdescription/)、[BOLD: 基本設計の進め方](https://www.bold.ne.jp/engineer-club/basic-design))
- 基本設計書は自チームに加えて**顧客側レビュアー**の承認を受ける(多段請負・受発注構造ゆえに、レビューが品質活動と契約上の検収行為を兼ねる)([BOLD](https://www.bold.ne.jp/engineer-club/basic-design))
- 「欠陥の修正コストは下流ほど増大する(テスト工程での修正は要件・基本設計段階の最大40倍)」というコスト論が工程末レビューの正当化根拠として使われる([IPA: ソフトウェアテスト見積りガイドブック](https://www.ipa.go.jp/archive/publish/qv6pgp0000000yho-att/000005132.pdf))
- 建前と実運用の乖離に関する示唆: 日経クロステックは日本メーカーの開発ステップ運用を「間違いだらけ」と批判する連載を掲載しており、DR が形骸化しやすい実態への言及がある([日経クロステック: 間違いだらけの開発ステップ](https://xtech.nikkei.com/atcl/nxt/column/18/00041/00008/))。記事本文は未精読のため、乖離の具体パターンは追加調査項目

---

## 5. 考察(解釈を含む)

### 5.1 フェーズ1の7観点と各標準の概念対応表

| フェーズ1の調査観点 | ISO/IEC/IEEE 24774 | ISO/IEC/IEEE 12207:2017 | SPEM 2.0 | Stage-Gate / DR |
|---|---|---|---|---|
| 1. ロールモデル | (直接の要素なし。tasks の主語として暗黙) | プロセスごとの責任は定義するが職務ロールは規定しない | **Role Definition**(Task への責任割当てで最も精緻) | Project Leader / **Gatekeeper**(リソース所有者) |
| 2. 組織的役割 | 対象外 | **Organizational Project-Enabling プロセス群**(QM/HR/インフラ/ポートフォリオ/知識) | Method Plugin(組織標準プロセスの部品化)が近い | ゲートキーパー会議体。日本の DR では品証・生技など部門横断参加 |
| 3. ゲート・意思決定 | 対象外 | **Decision Management プロセス**、Project Assessment and Control | **Milestone**(Phase の区切り) | **Gate そのもの**(Deliverables / Criteria / Go-Kill-Hold-Recycle)。日本では DR1〜DR6・工程完了判定 |
| 4. 成果物(マイルストーン成果物) | **information item**(詳細は 15289) | 各プロセスの outcomes に紐づく情報項目 | **Work Product**(Task の入出力) | **Gate Deliverables**、DR ではフェーズ別の図面・FMEA・評価報告 |
| 5. レビュープロセス | 対象外 | **Verification / Validation / Quality Assurance プロセス** | Guidance(Checklist 等)+ Task として表現可能 | DR(JIS Z 8115 192J-12-101)、SIer の設計書レビュー・顧客承認 |
| 6. 品質基準 | **outcomes**(観察可能な結果=達成判定の基準) | Quality Management(組織)+ Quality Assurance(プロジェクト)の二層 | (弱い。Guidance で補う) | **Gate Criteria**(成熟度+事業価値の採点) |
| 7. 階層構造 | **process → activities → tasks** の3階層 | プロセス群 → プロセス → アクティビティ → タスクの4階層 | **Phase → Activity(入れ子) → Task → Step** | 全体フロー → ステージ → ステージ内作業、ゲートが階層の継ぎ目 |

### 5.2 フレームワーク骨格への提案(解釈)

- **記述テンプレートは 24774 の6要素**(title / purpose / outcomes / activities / tasks / information items)を採用し、そこに SPEM 由来の **Role**(誰が)と Stage-Gate 由来の **Gate**(誰がどんな基準で通すか)を追加した「6+2要素」をフェーズ1のヒアリング・記述フォーマットにするのが合理的。国際標準だけではロールとゲートが弱く、この2つこそ日本企業の実態調査で最も重要な観点だから
- 3階層整理(全体プロセス → フェーズ内ワークフロー → 個別作業)は、24774 の process/activity/task、SPEM の Phase/Activity/Task-Step と自然に対応づく。図解時の語彙は SPEM に寄せると図式(アイコン)資産も流用できる

### 5.3 国際標準がカバーしない観点(日本的な決裁・組織論)

以下はどの国際標準にも直接対応する概念がなく、フェーズ1で独自に調査・記述する必要がある。

- **稟議・多段決裁**: Stage-Gate のゲートキーパーは「リソースを出せる者」だが、日本企業の DR・工程完了判定は職位階層に沿った承認(担当 → 課長 → 部長 → 役員)や稟議書ベースの合議になりがち。標準には稟議に相当する概念がない
- **品質保証部門による第三者レビューの制度化**: 12207 の QA プロセスは活動を定義するが、「独立部門としての品証が DR の合否署名権を持つ」という日本製造業の組織構造そのものは規定しない
- **受発注構造とレビューの二重性**: SIer では設計書レビューが品質活動と契約上の検収・責任分界の確認を兼ねる。共通フレームが「取引の可視化」を主目的に日本で独自発展した事実がこの特殊性の傍証([IPA](https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html))
- **建前(規定上の DR)と実運用(形骸化)の乖離**: 標準は「あるべき記述」のみを扱う。DR が儀式化する・資料作成が目的化するといった実態は日本語の実務記事に断片的にしかなく、フェーズ1のヒアリング設計で重点的に拾うべき領域
- **ロールの兼務・曖昧さ**: SPEM の Role は1人1役を前提に描けるが、日本の現場では PM が品証を兼ねる等の兼務が常態。Role と人の多対多対応を記述できるフォーマットが必要

---

## 6. 追加調査が必要な項目(残課題)

1. **24774:2021 の各要素の記述規則の正確な文言**(purpose の単文規則、outcomes の個数目安・表現形式など)。規格本文または JIS 邦訳の入手が必要
2. **12207:2017 の 12207 固有の読み替え**(15288 の30プロセスに対し、ソフトウェア固有の注記・プロセス名差分)の一次確認
3. **共通フレーム2013 の日本独自追加プロセスの正確な一覧**(企画・要件定義プロセス、「超上流」の範囲)。IPA 公式 PDF の精読で確認可能
4. **DR0〜DR5 型の段階定義の企業別バリエーション**と、日経クロステック連載が指摘する DR 形骸化の具体パターン
5. **SIer の工程完了判定の判定基準の実例**(レビュー指摘密度・テスト密度などの定量基準)。IPA の定量的品質管理関連資料(ESQR 等)が候補
6. ISO/IEC/IEEE **15289**(情報項目=ドキュメントの内容規定)と **24748**(ライフサイクル管理ガイド)の調査。成果物観点の裏付けとして必要

---

## 7. 主要出典一覧

### 一次情報(公式ページ・公式文書)

- ISO: [ISO/IEC/IEEE 24774:2021](https://www.iso.org/standard/78981.html) / [ISO/IEC TR 24774:2010](https://www.iso.org/standard/53815.html) / [ISO/IEC/IEEE 12207:2017](https://www.iso.org/standard/63712.html)
- IEEE SA: [24774-2021](https://standards.ieee.org/ieee/24774/10126/) / [12207-2017](https://standards.ieee.org/ieee/12207/5672/)
- IEC Webstore: [ISO/IEC/IEEE 24774:2021](https://webstore.iec.ch/en/publication/68995)
- OMG: [SPEM 2.0 仕様 PDF](https://www.omg.org/spec/SPEM/2.0/PDF) / [仕様ページ](https://www.omg.org/spec/SPEM/2.0/)
- IPA: [国際規格SLCPの進化とそのポイント](https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html) / [共通フレーム2013 第3部 PDF](https://www.ipa.go.jp/publish/qv6pgp000000107j-att/000062659.pdf) / [ソフトウェアテスト見積りガイドブック](https://www.ipa.go.jp/archive/publish/qv6pgp0000000yho-att/000005132.pdf)
- JIS Z 8115:2019: [JSA 規格ページ](https://webdesk.jsa.or.jp/books/W11M0090/index/?bunsyo_id=JIS+Z+8115:2019) / [kikakurui.com 全文](https://kikakurui.com/z8/Z8115-2019-01.html)(民間サイトによる JIS 本文の転載であり、引用時は原典参照が望ましい)
- Stage-Gate International(Cooper 設立の公式組織): [The Stage-Gate Model: An Overview](https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/)
- Cooper 原典書誌: [Wiley: The Stage-Gate Idea to Launch System](https://onlinelibrary.wiley.com/doi/full/10.1002/9781444316568.wiem05014)

### 二次情報(解説)

- [arc42 Quality Model: ISO/IEC/IEEE 12207](https://quality.arc42.org/standards/iso12207)(注: 同ページのプロセス一覧は2008年版寄りの記述が混在しており、本メモでは30プロセス一覧の典拠には使っていない)
- [Wikipedia: ISO/IEC 12207](https://en.wikipedia.org/wiki/ISO/IEC_12207) / [Wikipedia: ISO/IEC 15288](https://en.wikipedia.org/wiki/ISO/IEC_15288) / [Wikipedia: 共通フレーム](https://ja.wikipedia.org/wiki/%E5%85%B1%E9%80%9A%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0)
- [Modeling Languages: Software process modeling with SPEM](https://modeling-languages.com/process-software-modeling-spem/) / [SJSU 講義資料](http://www.cs.sjsu.edu/~pearce/modules/topics/uml/spem.pdf) / [Figay: Agile with SPEM](https://www.linkedin.com/pulse/how-can-agile-modeled-dr-nicolas-figay)
- [CIO Wiki: Stage-Gate](https://cio-wiki.org/wiki/Stage-Gate) / [Mindtools: What Is Stage-Gate Innovation](https://www.mindtools.com/a5qzdsk/what-is-stage-gate-innovation/)
- DR 解説: [Skillnote](https://skillnote.jp/knowledge/designreview/) / [ものづくりドットコム](https://www.monodukuri.com/gihou/article/4732) / [キーエンス](https://www.keyence.co.jp/ss/products/marker/housing-design/approach/design-review.jsp) / [東海モデル](https://www.tokaimodel.com/news/1510/) / [富士フイルムBI](https://www.fujifilm.com/fb/ja/solutions/columns/monozukuri-3522) / [日経クロステック](https://xtech.nikkei.com/atcl/nxt/column/18/00041/00008/)
- SIer 工程: [Geekly](https://www.geekly.co.jp/column/cat-technology/sier_jobdescription/) / [BOLD](https://www.bold.ne.jp/engineer-club/basic-design)
