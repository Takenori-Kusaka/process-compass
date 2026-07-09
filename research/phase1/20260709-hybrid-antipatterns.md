# ハイブリッド開発アンチパターン(なんちゃってアジャイル/ウォーター・スクラム・フォール)調査メモ

- Issue: #74
- 作成日: 2026-07-09
- 状態: 調査中

> 記述様式: [調査フレームワーク](https://takenori-kusaka.github.io/process-compass/phase1-current-state/research-framework/)(6+2要素)に準じつつ、本メモは **アンチパターンカタログ** の性格が強いため、§3 を「アンチパターン各論(症状 / 建前 / 実態 / なぜ起きるか / 弊害 / 出典)」の中心節に据える。
> このメモの目的は理想プロセスの記述ではなく、日本企業で実際に起きている「建前はスクラム、実態は混乱」という **From の実態** をアンチパターンとして直視し、出典付きで整理することにある。
> 既存メモ [20260709-scrum.md](./20260709-scrum.md) の §7(日本的観点)と重複させず、そこで触れた論点を深掘りする位置づけ。

## 0. 概要

- 本メモが扱う対象: 「スクラム/アジャイルを名乗るが、原典の設計から逸脱し価値を生まない運用形態」の総称。学術・実務で複数の呼称がある。
  - **Water-Scrum-Fall(ウォーター・スクラム・フォール)**: Dave West / Forrester(2011)。要件を「水(WF)」、開発を「スクラム」、リリースを「滝(WF)」で挟む混成形。「大半の組織にとってアジャイルの現実」と指摘された。出典: [Forrester: Water-Scrum-Fall Is The Reality Of Agile For Most Organizations Today](https://www.forrester.com/report/water-scrum-fall-is-the-reality-of-agile-for-most-organizations-today/RES60109)、[同 PDF ミラー](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf)、[ADTmag: Analyst: 'Water-Scrum-Fall' Is Current Agile Reality](https://adtmag.com/articles/2011/06/24/water-scrum-fall-agile-reality.aspx)、[InfoQ: Water-Scrum-Fall Is the Norm](https://www.infoq.com/news/2011/12/water-scrum-fall-is-the-norm/)
  - **なんちゃってアジャイル / なんちゃってスクラム**: 日本語圏の俗称。イベントだけ形式実施し価値・原則が伴わない状態。出典: [NTTデータ先端技術: アンチパターンから学ぶ「なんちゃってアジャイル」からの脱却方法](https://www.intellilink.co.jp/column/agile-devops/2022/011300.aspx)
  - **ゾンビスクラム(Zombie Scrum)**: Christiaan Verwijs / The Liberators。「見た目はスクラムだが心拍(=動くソフトウェア)がない」。出典: [Medium/The Liberators: The Rise Of Zombie Scrum](https://medium.com/the-liberators/the-rise-of-zombie-scrum-cd98741015d5)
  - **ダークスクラム(Dark Scrum)**: Ron Jeffries。スクラムが権力保持者の道具に転化し開発者を抑圧する状態。出典: [ronjeffries.com: Dark Scrum](https://ronjeffries.com/articles/016-09ff/defense/)
- 一言でいうと: **「フレームワークの構造(イベント・ロール名)だけを輸入し、経験主義・自己組織化・単一責任という中核を輸入し損ねた状態」**。日本ではこれに稟議・合議・品質ゲート文化が接ぎ木され固有の形になる。

## 1. title / purpose / outcomes(このアンチパターン群を「観察対象」として定義)

| 要素 | 記述 | 出典 |
| --- | --- | --- |
| title | ハイブリッド開発アンチパターン群(Water-Scrum-Fall / なんちゃってアジャイル / ゾンビスクラム / ダークスクラム) | [Forrester RES60109](https://www.forrester.com/report/water-scrum-fall-is-the-reality-of-agile-for-most-organizations-today/RES60109) 他 |
| purpose(実際に果たしている機能) | 既存のWF型ガバナンス・決裁構造を維持したまま、開発工程だけを反復化して「アジャイルをやっている」という体裁を得る | [Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf) |
| outcomes(観察可能な結果=負の成果) | ・イベントは実施されるがリリース可能なインクリメントが稀(ゾンビスクラム) ・意思決定が合議で滞留しスプリントが空回り ・開発は速くなってもリリース前決裁がボトルネック化 ・開発者の疲弊・モラール低下(ダークスクラム) | [Medium: Zombie Scrum](https://medium.com/the-liberators/the-rise-of-zombie-scrum-cd98741015d5)、[メンバーズ: アジャイルでDXを成功に導くハイブリッド戦略](https://www.members.co.jp/column/20241226-agile-dx)、[ronjeffries.com: Dark Scrum](https://ronjeffries.com/articles/016-09ff/defense/) |

## 2. 階層構造(process → activities → tasks)— Water-Scrum-Fall の典型構造

「反復するのは真ん中だけ、両端はWFのゲート」という接ぎ木構造。後で図解する際の骨格。

- **Process: Water-Scrum-Fall(混成プロセス)**
  - **Phase A: Water(前段=ウォーターフォール)** — 反復しない
    - Activity: 事業計画・予算化・フィージビリティ検討
    - Activity: 要件定義(先に確定させる)
      - Task: 要件定義書の作成・承認(**決裁ゲート①**)
    - 特徴: アジャイルチームが関与する前に、範囲・予算・スケジュールが固定される([Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf))
  - **Phase B: Scrum(中段=反復)** — スプリントで開発・テスト
    - Activity: スプリント群(プランニング → 開発 → レビュー → レトロ)
    - 特徴: 開発チーム内部はスクラム。ただしバックログの優先順位は上流のWF成果物に縛られ、PO の裁量が実質ない場合が多い([age-of-product: Product Owner Anti-Patterns](https://age-of-product.com/product-owner-anti-patterns/))
  - **Phase C: Fall(後段=ウォーターフォール)** — 反復しない
    - Activity: 統合テスト・受入テスト・リリース承認
      - Task: 各種レビュー・検収・リリース判定(**決裁ゲート②③**)
    - 特徴: リリースは低頻度で、運用・インフラ部門の承認プロセスを通過する必要がある([Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf)、[メンバーズ](https://www.members.co.jp/column/20241226-agile-dx))
- **West の重要な留保**: この構造自体が必ずしも「悪」ではない。問題は「water と Scrum」「Scrum と fall」の境界線をどこに引くかを意識的に設計しないこと。境界を無自覚に放置するとアジャイルの便益は得られない(§4 のバランス論参照)([ADTmag](https://adtmag.com/articles/2011/06/24/water-scrum-fall-agile-reality.aspx))

## 3. アンチパターン各論(本メモの中心)

> スキーマ転記メモ: 各パターンは後で `jpRealities`(症状群)、`roles`(過剰ロール列挙)、`gates`(接ぎ木ゲートを inspection でなく **decision 型** で列挙)へ落とす。

### AP-1. Water-Scrum-Fall(要件とリリースをWFで挟む)

- **症状**: 開発工程だけがスプリント化。上流(要件確定)と下流(リリース承認)はWFの直列ゲートのまま。
- **建前(あるべき姿)**: スクラムはフェーズ列を持たず、意思決定は PO の並び替え・DoD・スプリントゴールに分散・常時化される。スプリントレビューは「価値をリリースするためのゲートと見なしてはならない」([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態**: 予算・範囲・スケジュールを先に固定し、真ん中だけ反復。Forrester は「大半の組織にとってこれがアジャイルの現実」と観測([Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf)、[InfoQ](https://www.infoq.com/news/2011/12/water-scrum-fall-is-the-norm/))。
- **なぜ起きるか(日本的背景)**: 一括請負・検収の商慣行、年度予算主義、上流で承認を固めないと稟議が通らない構造(§7)。
- **弊害**: 反復で得た学習を要件・リリース計画に還流できない。「開発は速いがリリースは遅い」乖離([メンバーズ](https://www.members.co.jp/column/20241226-agile-dx))。
- **出典**: [Forrester RES60109](https://www.forrester.com/report/water-scrum-fall-is-the-reality-of-agile-for-most-organizations-today/RES60109)、[ADTmag](https://adtmag.com/articles/2011/06/24/water-scrum-fall-agile-reality.aspx)、[SD Times](https://sdtimes.com/agile/analyst-watch-water-scrum-fall-is-the-reality-of-agile/)

### AP-2. 単一PO原則の崩壊(複数PO / PO委員会 / 企画部によるPO代行 / プロキシPO)

- **症状**: PO が複数名いる。あるいは「企画部」「商品企画」などの部署単位でPO機能を運用。現場には決定権のない「プロキシPO(代理PO)」だけが座る。
- **建前(あるべき姿)**: スクラムガイドは明文で「**プロダクトオーナーは1人の人間であり、委員会ではない(The Product Owner is one person, not a committee.)**」と規定。PO は価値最大化の**結果責任(accountability)**を負い、バックログの内容を変えたい者は「PO を説得する」形でのみ関与できる。作業は委譲できるが結果責任は PO に残る([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態**:
  - **Prioritization by proxy(代理による優先順位付け)**: 単一のステークホルダー、または**ステークホルダーの委員会**がバックログの優先順位を決める。Wolpers は「その権限を奪うと、スクラムは強力な waterfall 2.0 プロセスに変わる」と指摘([age-of-product: Product Owner Anti-Patterns](https://age-of-product.com/product-owner-anti-patterns/)、[Scrum.org: How to Sabotage A Product Owner](https://www.scrum.org/resources/blog/how-sabotage-product-owner-53-anti-patterns-trenches))。
  - **Proxy Product Owner**: 決定権も顧客への直接アクセスも持たない代理POがボトルネック化し、優先順位のズレ・意思決定遅延を招く([age-of-product](https://age-of-product.com/product-owner-anti-patterns/))。
  - **Product ownership by committee**: 方向性の欠如・利害相反・意思決定遅延を生む([Scrum.org: Product Owner Anti-Patterns](https://www.scrum.org/resources/blog/product-owner-anti-patterns))。
  - 日本の俗語表現では「PMをPOという別称で呼ぶだけ」という指摘もある([Raccoon Tech Blog: なんちゃってアジャイルからの脱却](https://techblog.raccoon.ne.jp/archives/1681969962.html))。
- **なぜ起きるか(日本的背景)**: 稟議・合議文化。単独者に重要決定の権限と責任を集中させることを組織が忌避し、部門横断の合意形成を正とする。合議は「誰が最終責任を負うのか不明確になり責任の所在が曖昧になる」構造そのもの([kickflow: 合議とは](https://kickflow.com/blog/gougi))。稟議はハンコで「責任の所在を分散させつつ組織の総意を可視化する」ボトムアップ承認文化([Jugaad: 根回しと稟議の歴史的背景](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/))。この文化が「1人のPO」を制度的に拒む。
- **弊害**: 意思決定の滞留、優先順位の一貫性喪失、開発チームのエンゲージメント低下、スクラムの「waterfall 2.0」化([age-of-product](https://age-of-product.com/product-owner-anti-patterns/))。
- **出典**: 建前=[スクラムガイド2020](https://scrumguides.org/scrum-guide.html) / 実態=[age-of-product](https://age-of-product.com/product-owner-anti-patterns/)、[Scrum.org: Product Owner Anti-Patterns](https://www.scrum.org/resources/blog/product-owner-anti-patterns)、[Scrum.org: 53 Anti-Patterns from the Trenches](https://www.scrum.org/resources/blog/how-sabotage-product-owner-53-anti-patterns-trenches) / 背景=[kickflow](https://kickflow.com/blog/gougi)、[Jugaad](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/)

### AP-3. 役割肥大・関係者過多(スクラム3ロール外に大量の関係者)

- **症状**: スクラムを名乗るのに PO/SM/開発者の3責任以外に、承認者・調整役・レビュアー・部門代表が大量に存在する。
- **建前(あるべき姿)**: スクラムチームは通常10名以下で、**サブチームも階層もない**。ガイドはチーム外の管理階層・第三者レビュー部門・PMO を一切定義しない。ステークホルダーはスプリントレビューの協働相手としてのみ登場([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態**: 部門横断調整のため関係者・承認者が増殖。パートタイムPO、複数の「上司」がデイリーやレビューに参加し監視・命令の場になる。
- **なぜ起きるか(日本的背景)**: 責任分散文化(合議で誰も単独責任を負わない)、稟議の多段承認、深いピラミッド構造。「日本企業の意思決定が遅いのは階層が深くスピードが落ちるため」と指摘される([ITmedia: なぜ日本企業の意思決定は遅いのか](https://www.itmedia.co.jp/business/articles/2103/23/news043.html))。各部門が「関与しないと責任問題になる」ため関係者が積み上がる。
- **弊害**: ステークホルダー過多で意思決定が進まない。会議コスト増大。自己組織化の阻害。
- **出典**: 建前=[スクラムガイド2020](https://scrumguides.org/scrum-guide.html) / 実態・背景=[ITmedia](https://www.itmedia.co.jp/business/articles/2103/23/news043.html)、[kickflow: 合議とは](https://kickflow.com/blog/gougi)、[豆蔵: プロダクトオーナーの煩悩](https://developer.mamezou-tech.com/agile/agile-po-complaints_01/)

### AP-4. ゾンビスクラム(Zombie Scrum)— 心拍のないスクラム

- **症状**: 全イベントを実施するが「リリース可能なインクリメント」がスプリントの成果として稀にしか生まれない。見た目はスクラム、中身は空虚。
- **建前(あるべき姿)**: スプリントごとに「完成の定義」を満たす利用可能なインクリメントが少なくとも1つ生まれる([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態(4つの症状)**: Verwijs / The Liberators による4症状:
  1. **動くソフトウェアがほぼ無い** — 完成機能が「あればいい」程度に扱われ先送りされる
  2. **貧弱な完成の定義(DoD)** — 「バージョン管理にコミット済」「開発者がクリックして確認」程度の技術的最低限に留まり拡張意欲がない
  3. **外の世界との接触を望まない** — ステークホルダー・顧客から隠れ、慣れた環境に閉じこもる
  4. **低いモラールと諦め** — スプリントの成否に無反応。改善への意欲も喜びもない
- **なぜ起きるか(日本的背景)**: 上流でスコープが固定され開発が「作業消化」化(AP-1と連動)、レビューが承認プレゼン化して顧客との真の対話がない。
- **弊害**: 「アジャイルなメリットを感じたことがない」状態が固定化([Raccoon Tech Blog](https://techblog.raccoon.ne.jp/archives/1681969962.html))。
- **出典**: [Medium/The Liberators: The Rise Of Zombie Scrum](https://medium.com/the-liberators/the-rise-of-zombie-scrum-cd98741015d5)、[Medium: The Four Symptoms of Zombie Scrum](https://medium.com/the-liberators/the-four-symptoms-of-zombie-scrum-f107f2e86b3f)、[Scrum.org: Zombie Scrum - Symptoms, Causes and Treatment](https://www.scrum.org/resources/blog/zombie-scrum-symptoms-causes-and-treatment)、[zombiescrum.org](https://www.zombiescrum.org/)

### AP-5. ダークスクラム(Dark Scrum)— 開発者を抑圧する道具への転化

- **症状**: スクラムの器を使って権力保持者(管理職・PO・SM・チームリーダー)が開発者を監視・強制する。
- **建前(あるべき姿)**: SM は「真のリーダー」でありチームの自己管理・障害物除去を支援する。管理者・進捗報告者ではない([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態**: Ron Jeffries の指摘:
  - 「あまりに多くの場合、スクラムは人々を抑圧しているように見える」。スクラムが本来ほど速く・確実に・安定して価値を届けず、結果として皆が苦しむ。
  - **power holders(権力保持者)** が開発者に対し権力を行使する。デイリースクラムが監視・命令の場に、スプリントプランニングが要件の一方的押し付けに、レビューが達成不能目標の失敗糾弾に、レトロが改善提案却下と脅迫的動機づけに転化する。
  - Kent Beck は XP を「プログラマにとって世界を安全にするため」に作ったが、「世界はまだプログラマにとって安全ではない。スクラムはプログラマにとって非常に危険になりうる」。
  - Jeffries は 2018年に「開発者は(名ばかりの)アジャイルを見捨てるべき」とまで論じた([InfoQ: Ron Jeffries Says Developers Should Abandon "Agile"](https://www.infoq.com/news/2018/06/developers-should-abandon-agile/))。
- **なぜ起きるか(日本的背景)**: 旧来のコマンド&コントロール型管理を温存したままロール名だけ変える。上司がPO/SMを兼ね権力構造が温存される。
- **弊害**: 開発者の疲弊・離職・心理的安全性の欠如。「持続可能な開発」原則の破壊([NTTデータ先端技術](https://www.intellilink.co.jp/column/agile-devops/2022/011300.aspx))。
- **出典**: [ronjeffries.com: Dark Scrum](https://ronjeffries.com/articles/016-09ff/defense/)、[ronjeffries.com: Dark-Scrum カテゴリ](https://ronjeffries.com/categories/dark-scrum/)、[InfoQ 2018](https://www.infoq.com/news/2018/06/developers-should-abandon-agile/)

### AP-6. WFの決裁ゲートのスクラムへの接ぎ木

- **症状**: 要件承認・設計承認・リリース承認といったWFの直列決裁ゲートが、スプリントの前後や途中に差し込まれる。スプリントレビューが事実上の検収・承認ゲートになる。
- **建前(あるべき姿)**: スクラムには Go/Kill 型のフェーズゲートが存在しない。「スプリントレビューを、価値をリリースするためのゲートと見なしてはならない」と明文で禁止されている([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- **実態**: 全体計画・要件確定・総合テスト・受入をWF型で決裁し、実装だけ反復する(=AP-1の構造)。リリース前の社内決裁・承認がボトルネックになる([SBビットタイムズ: ハイブリッド開発とは何か](https://www.sbbit.jp/article/cont1/88907)、[メンバーズ](https://www.members.co.jp/column/20241226-agile-dx))。品質保証部門・第三者検証会社がスプリント外から関与するモデルも提案されている([ベリサーブ: 品質重視のアジャイル開発](https://www.veriserve.co.jp/asset/approach/column/agile/agile04.html))。
- **なぜ起きるか(日本的背景)**: 品質ゲートは「日本の品質レベルを支えてきた技術」と位置づけられ手放しにくい。稟議による多段決裁が制度化されている。
- **弊害**: 「承認待ち」滞留の復活。反復のリズムが決裁サイクルに律速される。スクラムが設計上排除したはずのボトルネックを再導入。
- **出典**: 建前=[スクラムガイド2020](https://scrumguides.org/scrum-guide.html) / 実態=[SBビットタイムズ](https://www.sbbit.jp/article/cont1/88907)、[スパイスファクトリー: ハイブリッドアジャイル開発とは](https://spice-factory.co.jp/development/hybrid-agile-development-about/)、[ベリサーブ](https://www.veriserve.co.jp/asset/approach/column/agile/agile04.html)、[メンバーズ](https://www.members.co.jp/column/20241226-agile-dx)

## 4. バランス論: ハイブリッドは必ずしも「悪」ではない

- **段階的移行としての正当性**: West 自身が Water-Scrum-Fall を「必ずしも悪ではない(not necessarily bad)」と述べている。問題は境界線の設計を怠ること。意識的に境界を設計すれば有効な過渡形になりうる([ADTmag](https://adtmag.com/articles/2011/06/24/water-scrum-fall-agile-reality.aspx)、[Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf))。
- **組織の空白への構造的必然**: スクラムが意図的に規定しない領域(契約・第三者品質保証・組織決裁)を、日本企業は既存の品質ゲート文化と IPA モデル契約で埋めている。これは単なる「なんちゃって化」ではなく構造的反応であり、「スクラム+日本型ガバナンス」を一つのバリアントとして扱う価値がある(既存 scrum.md §8 考察と整合)([IPA: モデル取引・契約書(アジャイル開発版)](https://www.ipa.go.jp/digital/model/agile20200331.html))。
- **判別の要点**: 「意図的に設計されたハイブリッド(過渡形・リスク管理)」と「無自覚なアンチパターン(建前と実態の乖離)」は区別する必要がある。前者は境界を明示し学習を還流させる、後者は境界が惰性で放置される。この判別軸がフェーズ3の推薦ロジックで効く。

## 5. gates(このアンチパターン群に固有の擬似ゲート)

> スキーマ注意: スクラム本体の gates は「inspection 型(判定結果=適応)」だが、ハイブリッドでは **decision 型(Go/Kill)** のWFゲートが接ぎ木される。両者を別タイプで並べることがこのメモの図解上の肝。

| 擬似ゲート名 | Deliverables | Criteria | 判定者 | 判定結果 | 出典 |
| --- | --- | --- | --- | --- | --- |
| 要件承認ゲート(前段WF) | 要件定義書 | 範囲・予算の合意 | 企画部門/決裁階層(合議) | Go/差戻し | [Forrester PDF](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf) |
| スプリントレビューの検収化 | インクリメント | 発注側の受入基準 | 発注側ステークホルダー | 承認/手戻り | 建前で禁止: [スクラムガイド2020](https://scrumguides.org/scrum-guide.html) / 実態: [ベリサーブ](https://www.veriserve.co.jp/asset/approach/column/agile/agile04.html) |
| リリース承認ゲート(後段WF) | リリース判定資料 | 品質ゲート・QA部門承認 | 品質保証部門/運用部門(多段決裁) | Go/Hold | [メンバーズ](https://www.members.co.jp/column/20241226-agile-dx)、[SBビットタイムズ](https://www.sbbit.jp/article/cont1/88907) |

## 6. レビュープロセス(逸脱の観点)

- スクラムの「レビュー=検査(inspection)イベント」が、日本のハイブリッドでは「承認レビュー/検収」に転化する。ガイドが明示的に禁じるパターンそのもの([スクラムガイド2020](https://scrumguides.org/scrum-guide.html))。
- 品質保証部門・第三者検証会社によるスプリント外レビューが追加される(スクラムの「品質は開発者がDoDで内製」建付けとの明確な差分)([ベリサーブ](https://www.veriserve.co.jp/asset/approach/column/agile/agile04.html))。

## 7. 日本的観点(標準がカバーしない領域)

> 既存 scrum.md §7 と重複する契約・品質ゲート論はそちらに譲り、本メモは「**なぜロールと承認者が増え、単一POが崩れるか**」の文化的機序に絞る。

- **稟議・合議・根回しが単一PO原則を制度的に拒む**:
  - 合議は「複数部門・関係者の意見調整に時間を要し、責任の所在が曖昧になる」構造([kickflow: 合議とは](https://kickflow.com/blog/gougi))。
  - 稟議は「責任の所在を分散させつつ組織の総意を可視化するボトムアップ承認文化」([Jugaad](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/))。
  - この2つは「1人のPOが単独で価値判断し、その決定を組織が尊重する」という単一PO原則と真っ向から対立する。だから「企画部がPO機能を持つ」「PO委員会」が自然に生まれる。
- **責任分散文化がロール肥大を生む**: 各部門が「関与しないと責任問題になる」ため承認者・レビュアーが積み上がる。深い階層が意思決定を遅くする([ITmedia](https://www.itmedia.co.jp/business/articles/2103/23/news043.html))。
- **建前と実運用の乖離パターン(症状群)**:
  - PMをPOと呼び替えただけ / イベントをやったりやらなかったり / メリットを感じたことがない([Raccoon Tech Blog](https://techblog.raccoon.ne.jp/archives/1681969962.html))
  - デイリー・レトロでは問題が報告されないのに、非公式の場では不満が渦巻く(透明性の形骸化)([Raccoon Tech Blog](https://techblog.raccoon.ne.jp/archives/1681969962.html))
  - スコープ固定への無理な対応(スプリント延長・増員)、DoDの技術的最低限化([NTTデータ先端技術](https://www.intellilink.co.jp/column/agile-devops/2022/011300.aspx))

## 8. 考察(事実と分離)

- **共通の病理は「構造の輸入・中核の非輸入」**: 4つの呼称(Water-Scrum-Fall / なんちゃって / ゾンビ / ダーク)は視点が違うが、根は同じ。イベント・ロール名という「観察可能な形」だけを移植し、経験主義・自己組織化・単一責任という「観察しにくい中核」を移植し損ねている。図解では「形は移った/魂は移らなかった」の対比が有効。
- **日本固有の増幅要因は稟議・合議・品質ゲート**: 海外のアンチパターン(Jeffries/Verwijs/Wolpers)は「権力の誤用」「動機の欠如」を主因とするが、日本ではこれに**制度化された合議・多段決裁**が加わり、単一PO崩壊とロール肥大が「個人の失敗」ではなく「組織構造の既定値」として現れる。ここが Process Compass で日本文脈を扱う独自価値。
- **フェーズ3への含意(推薦軸)**: 「意図的ハイブリッド(過渡形)」と「無自覚アンチパターン」を分ける判別軸=(a)境界線が明示設計されているか、(b)反復の学習が上流・リリースに還流するか、(c)単一の価値判断者が実在するか。この3軸でハイブリッドの健全度を診断できる。
- **スキーマ転記の設計**: `roles` に過剰ロール(プロキシPO、PO委員会、複数承認者)を「anti-role」フラグ付きで、`gates` に接ぎ木ゲートを `type: decision` で、`jpRealities` に症状群(AP-1〜6の症状行)を格納する三分割が素直。

## 9. 埋められなかった観点(追加調査項目)

- **定量的実態**: 日本での「なんちゃってスクラム/ゾンビスクラム」の発生率や定量調査(Scrum Inc. Japan・アジャイルジャパン等の悉皆調査)は未発見。State of Agile の日本セグメント切り出しも要確認。
- **Wolpers の体系の全量**: 書籍 *The Scrum Anti-Patterns Guide*(160超のアンチパターン)と PO Interview Guide(76問)の一次内容は目次レベルまで。ロール別(SM/開発者)のアンチパターン網羅は未取得。
- **ゾンビスクラムの「原因(causes)」節**: 症状4つは一次確認済みだが、Verwijs が挙げる根本原因(組織要因)の一次抽出が未完。書籍 *Zombie Scrum Survival Guide* の該当章要確認。
- **ダークスクラムの個別記事**: Jeffries の Dark Scrum シリーズは複数記事(defense 以外に scrum-scot, time-was 等)。各記事の固有主張は未網羅。
- **スプリントレビューの検収化の一次条文**: IPA モデル契約(アジャイル版)の「成果物の確認」条項が実務で検収に使われている実態の条文レベル確認(既存 scrum.md §9 と共通の宿題)。
- **SAFe 等スケーリング時のゲート肥大**: PI Planning が準ゲート化し関係者過多を増幅するか(別プロセスとして要調査)。

## 10. 出典一覧

### 一次情報

- [スクラムガイド2020(英語版)](https://scrumguides.org/scrum-guide.html) — 単一PO原則「one person, not a committee」、スプリントレビューのゲート化禁止条項
- [Forrester: Water-Scrum-Fall Is The Reality Of Agile For Most Organizations Today (RES60109)](https://www.forrester.com/report/water-scrum-fall-is-the-reality-of-agile-for-most-organizations-today/RES60109)
- [同レポート PDF ミラー](https://www.verheulconsultants.nl/water-scrum-fall_Forrester.pdf)
- [ronjeffries.com: Dark Scrum(原典)](https://ronjeffries.com/articles/016-09ff/defense/)
- [ronjeffries.com: Dark-Scrum カテゴリ](https://ronjeffries.com/categories/dark-scrum/)
- [Medium/The Liberators: The Rise Of Zombie Scrum(Christiaan Verwijs 原典)](https://medium.com/the-liberators/the-rise-of-zombie-scrum-cd98741015d5)
- [Medium/The Liberators: The Four Symptoms of Zombie Scrum](https://medium.com/the-liberators/the-four-symptoms-of-zombie-scrum-f107f2e86b3f)
- [IPA: 情報システム・モデル取引・契約書(アジャイル開発版)](https://www.ipa.go.jp/digital/model/agile20200331.html)

### 二次情報(実務・解説)

- [ADTmag: Analyst: 'Water-Scrum-Fall' Is Current Agile Reality](https://adtmag.com/articles/2011/06/24/water-scrum-fall-agile-reality.aspx)
- [InfoQ: Water-Scrum-Fall Is the Norm](https://www.infoq.com/news/2011/12/water-scrum-fall-is-the-norm/)
- [SD Times: Water-Scrum-fall is the reality of agile](https://sdtimes.com/agile/analyst-watch-water-scrum-fall-is-the-reality-of-agile/)
- [InfoQ: Ron Jeffries Says Developers Should Abandon "Agile"](https://www.infoq.com/news/2018/06/developers-should-abandon-agile/)
- [Scrum.org: Zombie Scrum - Symptoms, Causes and Treatment](https://www.scrum.org/resources/blog/zombie-scrum-symptoms-causes-and-treatment)
- [zombiescrum.org](https://www.zombiescrum.org/)
- [Scrum.org: Product Owner Anti-Patterns](https://www.scrum.org/resources/blog/product-owner-anti-patterns)
- [Scrum.org: How to Sabotage A Product Owner — 53 Anti-Patterns](https://www.scrum.org/resources/blog/how-sabotage-product-owner-53-anti-patterns-trenches)
- [age-of-product (Stefan Wolpers): Product Owner Anti-Patterns](https://age-of-product.com/product-owner-anti-patterns/)
- [age-of-product: The Scrum Anti-Patterns Guide(160+ patterns)](https://age-of-product.com/scrum-anti-patterns/)
- [NTTデータ先端技術: アンチパターンから学ぶ「なんちゃってアジャイル」からの脱却方法](https://www.intellilink.co.jp/column/agile-devops/2022/011300.aspx)
- [Raccoon Tech Blog: なんちゃってアジャイルからの脱却](https://techblog.raccoon.ne.jp/archives/1681969962.html)
- [豆蔵デベロッパーサイト: プロダクトオーナーの煩悩](https://developer.mamezou-tech.com/agile/agile-po-complaints_01/)
- [SBビットタイムズ: ハイブリッド開発とは何か](https://www.sbbit.jp/article/cont1/88907)
- [スパイスファクトリー: ハイブリッドアジャイル開発とは](https://spice-factory.co.jp/development/hybrid-agile-development-about/)
- [ベリサーブ: 品質重視のアジャイル開発](https://www.veriserve.co.jp/asset/approach/column/agile/agile04.html)
- [メンバーズ: アジャイルでDXを成功に導くハイブリッド戦略](https://www.members.co.jp/column/20241226-agile-dx)
- [kickflow: 合議とは](https://kickflow.com/blog/gougi)
- [Jugaad: 根回しは日本の悪しき文化か(稟議の歴史的背景)](https://jugaad.co.jp/workflow/ringi/nemawashi-japanese-culture/)
- [ITmedia: なぜ日本企業の意思決定は遅いのか](https://www.itmedia.co.jp/business/articles/2103/23/news043.html)
