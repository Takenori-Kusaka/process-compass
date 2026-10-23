# #298 外部調査: 既存の反復手法・規格は「他手法との関係」をどう書いているか

- 作成: 2026-10-23(取得日はすべて 2026-10-23)。調査者: サブエージェント(外部調査担当)
- 目的: 会議体が選ぶ (A) 比較・対応づけの節 / (B) 短い併用条件の節 / (C) 「主張しない」の明記 / (D) 派生物へ委ねる、の判断材料
- 区分: 【一次】= 規定主体自身の文書・公式サイト、【二次】= 第三者の解説・記事・プレビュー以外の要約
- 注意: WebFetch は要約モデルを経由する。引用は取得結果に現れた原文の断片であり、全文の通読ではない。有料規格は出版社のプレビュー(目次・序文・適用範囲)までしか読めていない

---

## 1. スクラムガイド 2020

出典: https://scrumguides.org/scrum-guide.html 【一次】(2026-10-23 取得。2020年11月版が現行。Scrum.org のニュース一覧にも 2025〜2026 年の改訂の告知は無い: https://www.scrum.org/About/News 【一次】)

### 規定するもの

- 責任(accountabilities): 開発者・プロダクトオーナー・スクラムマスター
- イベント: スプリント・スプリントプランニング・デイリースクラム・スプリントレビュー・スプリントレトロスペクティブ
- 作成物: プロダクトバックログ・スプリントバックログ・インクリメント
- 確約(commitments): プロダクトゴール・スプリントゴール・完成の定義
- スプリント中の制約: "No changes are made that would endanger the Sprint Goal;" "Quality does not decrease;"
- スプリントの中止: "Only the Product Owner has the authority to cancel the Sprint."
- 自己管理: "They are also self-managing, meaning they internally decide who does what, when, and how."
- 開発者の責任: "Instilling quality by adhering to a Definition of Done;"

### 明示的に開けているもの・外部を受け入れる接点

- 不完全性の宣言: "The Scrum framework is purposefully incomplete, only defining the parts required to implement Scrum theory."
- 他の実践の受け入れ: "Various processes, techniques and methods can be employed within the framework."
- 組織標準の受け入れ: 完成の定義が組織の標準の一部であれば "all Scrum Teams must follow it as a minimum"。無ければチームが作る
- リリースとの関係: "The Sprint Review should never be considered a gate to releasing value."(レビューはゲートではない、と自ら書く)

### 改変の禁止(End Note)

- "The Scrum framework, as outlined herein, is immutable." 部分的な採用はスクラムではない、という趣旨が続く(取得結果の要約による)

### 本件への含意

- スクラム側は「枠の中に他の手法を入れてよい」「組織標準の完成の定義を下限として受け入れる」と書いている。本標準のゲートの判定基準を**組織標準として完成の定義へ入れる**経路は、スクラムガイドの文言の内側で説明できる
- 逆に、本標準がスクラムのイベントや責任を**変える**形(例: スプリントレビューを出荷のゲートにする、PO 以外がスプリントを中止する)で書くと、immutable 条項によりスクラムではなくなる。「併用できる」と書くなら、どの規定がスクラムの規定に触れないかを示す必要がある
- 「スプリントレビューはリリースのゲートではない」は、本標準の G-7・G-8 をスプリントレビューへ重ねる読みを明確に否定する材料になる(重ねるなら別の場として置く)
- 本標準とは規定の対象が違う: スクラムはチーム内の経験的プロセスと責任を定め、チーム外の管理階層・第三者レビュー・出荷判定の席を定めない(既存メモ `research/phase1/20260709-scrum.md` と整合)

### スクラムガイド拡張パック(Scrum Guide Expansion Pack)

- https://scrumexpansion.org 【一次】(サイト表示 v2.0.9)、AI の章: https://scrumexpansion.org/ai-and-scrum/ 【一次】(v2026.1、2026-01-18 更新、著者 Ralph Jocham・Jeff Sutherland、CC BY-NC-ND 4.0)
- 2025年6月公開。著者は Jocham・John Coleman・Sutherland。スクラムガイド 2020 を**置き換えない**任意の補遺。リポジトリ: https://github.com/ScrumGuides/ScrumGuide-ExpansionPack 【一次】
- 共著者 Coleman 自身が "All additions and suggestions listed in the SGEP Expansion Pack are optional"、研修・試験・認定は変わらないと書く(https://johncolemanirl.medium.com/optionality-in-the-scrum-guide-expansion-pack-2cb135cabafc 【二次・著者本人のブログ】)
- Scrum.org の見解: フォーラムで Eric Naiburg が "it doesn't change Scrum and provides additional practices that you may choose to use" と回答(https://www.scrum.org/node/99309 【二次・フォーラム】、2025-08-22)。公式声明としては確認できない
- 含意: スクラム陣営でも「枠を変えずに上へ足す」型(Nexus・拡張パック)が採られている。本標準が併用を語るなら、同じ型(スクラムを変えずに外側・上側へ置く)で書くのが整合する

---

## 2. 他の手法・フレームワーク

### 2.1 SAFe

- 現行: SAFe 6.0(原則のページの最終更新 2023-05-04: https://framework.scaledagile.com/safe-lean-agile-principles 【一次】)。加えて **AI-Native SAFe** を 2026-06-16 に発表(Early Access、Core SAFe と並行して維持): https://framework.scaledagile.com/blog/ai-native-safe-is-the-operating-model-for-the-ai-native-organization 【一次】、日本語の配信: https://zaikei.co.jp/releases/3538438/ 【二次】
  - AI-Native SAFe は「ガバナンスと倫理、仕様と意図、キュレートされたデータ管理」を構成要素に入れ、「AI バリューアーキテクト」の役割を新設(配信文)。ボトルネックが「作ること」から「検証すること」へ移ったと書く。人の責任範囲・AI エージェントの自律の水準・ゲートの具体は、取得した告知には無い
- 規定するもの: 10 原則、構成(Essential / Large Solution / Portfolio / Full)、ART・PI の行事、リーン・ポートフォリオ管理(LPM)
- ゲート・マイルストーン
  - 原則5 "Base milestones on objective evaluation of working systems"。フェーズゲートについて Oosterwal を引き "There was in fact no correlation between exiting phase gates on time and project success"、"the phase-gated model does not mitigate risk as intended" と書く(https://scaledagileframework.com/base-milestones-on-objective-evaluation-of-working-systems/ 【一次】、更新 2023-03-14)。置き換えは統合点ごとの動くシステムの評価(PI システムデモ)
  - LPM のポートフォリオ・カンバンは Funnel → Reviewing → Analyzing → Portfolio Backlog → Implementing → Done。Analyzing で LPM がエピックの承認・中止(go/no-go)を判断し、リーン・ビジネスケースを使う(https://agility-at-scale.com/safe/lpm/portfolio-kanban/ 【二次】。framework 側の該当ページは robots で取得不可)
  - コンプライアンス: 規制領域(医療機器・自動車・航空・金融)を挙げ、既存の QMS が "traditional, phase-gated development models" に依存していると書く。特定規格(IEC 62304 等)への対応表は取得部分に無い(https://framework.scaledagile.com/compliance 【一次】)
- 他手法との関係: チームの層にスクラム(SAFe 用語で ScrumXP)とカンバンを内包する。つまり SAFe は**スクラムを部品として取り込み、その上にポートフォリオのゲート(エピックの承認)を置く**構造で、本標準と最も構造が似ている
- 含意: 「チームはスクラム、上位に判断の関門」という構造は SAFe が既に商用で示している。ただし SAFe は**フェーズゲートを否定**し、関門を投資判断(エピック)と定期のデモに限っている。本標準のゲート(変更単位の G-5、出荷の G-7・G-8)は SAFe の原則5とは粒度・目的が違う。比較表を作ると、この違いを説明する責任が生じる

### 2.2 Shape Up(Basecamp / 37signals、Ryan Singer)

- https://basecamp.com/shapeup/4.5-appendix-06 【一次】(用語集)
- 規定するもの: 6 週間のサイクル、2 週間のクールダウン、ベッティングテーブル(クールダウン中に関係者が次のサイクルに賭けるピッチを選ぶ)、アペタイト(見積りではなく「費やしてよい時間」)、サーキットブレーカー("Cancel projects that don't ship in one cycle by default instead of extending them by default.")、シェーピング、ヒルチャート
- 他手法との関係: 序文で "we're not into waterfall or agile or scrum"、本書は "a book of basic truths" と "a toolbox full of techniques that you can apply in your own way to your own process"(https://attachments.are.na/10908583/55f757181580c55e479465b5ba203392.pdf 【一次の写し】)。付録「Adjust to Your Size」の本文は取得できず
- 含意: Shape Up は**スクラムと並ぶ代替**として書かれ、併用の主張はしない。ベッティングテーブルは本標準の価値判断(G-1・G-2 相当)と機能が重なり、サーキットブレーカーは「延長しない既定」という停止規則で、本標準の自己修正ループの上限・保留と発想が近い。ただし Shape Up は記録・承認・独立性を一切規定しない

### 2.3 カンバン(2 系統)

- The Kanban Guide(ProKanban 系、kanbanguides.org)【一次】
  - 2025年5月版(living document): https://kanbanguides.org/the-kanban-guide/2025.5/pdf/kanban-guide.v2025.5.en.pdf 。版の履歴: https://kanbanguides.org/the-kanban-guide/history/
  - 定義: "Kanban is a strategy for optimizing the flow of value through a process." 3 実践(ワークフローの定義と可視化・項目の能動的管理・ワークフローの改善)、ワークフローの定義(DoW)の必須要素6つ(価値の単位・開始と完了の定義・状態・WIP の制御方法・明示的な方針・SLE)、4 つのフロー指標(WIP・スループット・仕掛り年齢・サイクルタイム)
  - 他手法との関係: "Because Kanban can work with virtually any workflow, its application is not limited to any specific industry or context." "Kanban can and should be used to augment those delivery techniques."
  - **2025年版の変更点に "Deleted reference to immutability of Kanban."** スクラムガイドの immutable と対照的に、不変性の主張を取り下げた
- Kanban Method(Kanban University、David Anderson 系)は別系統。原則(「今やっていることから始める」等)の一次文書は今回取得できず(https://kanban.university/new-to-kanban-get-the-official-guide-to-the-kanban-method/ 【一次】は案内ページのみ)
- 含意: カンバンは「既存のどのワークフローにも重ねる」ことを自ら主張する。本標準のゲートを DoW の「明示的な方針」として書く対応づけは、カンバンガイドの語で無理なく書ける。逆に、カンバンはイテレーションを持たないため「スクラムの反復」を前提にした本標準の記述(参照モデルの `origin`)はカンバン採用者に当てはまらない

### 2.4 XP

- http://www.extremeprogramming.org/rules.html 【一次・Wells のサイト。Beck『XP Explained』2版の本文は未取得】
- 規定するもの: 計画(ユーザーストーリー・リリース計画・小さなリリース・イテレーション)、管理(持続可能なペース・スタンドアップ・ベロシティ・オンサイト顧客)、設計(シンプル・スパイク・リファクタリング)、コーディング(標準・ペア・頻繁な統合・共同所有)、テスト(テスト先行・全コードに単体テスト・リリース前に全通過・バグごとにテスト・受入テストの頻繁な実行)
- 自己改変: "Fix XP when it breaks."
- 含意: XP は工学的実践の集合で、ゲートや判定の席を持たない。本標準のテスト関連の規定(テストの失敗をテスト側で解消しない等)は XP の実践と内容が重なる。HELENA(後述)ではハイブリッド利用者の 52.8% が XP を使う

### 2.5 Disciplined Agile(PMI)

- https://www.pmi.org/disciplined-agile/agile/milestones 【一次】
- 共通マイルストーン: Stakeholder vision / Proven architecture / Continued viability(任意) / Sufficient functionality / Production ready / Delighted stakeholders
- 要点の引用: "We can have common governance across teams without enforcing a common process." "This has the advantage of enabling teams to choose their way of working (WoW), including an appropriate life cycle, while enabling leadership to govern them in a consistent manner." レビューの形式は "will vary according to your situation"
- 状態: 2019 年に PMI が買収、PMI が保守を継続(https://scottambler.com/disciplined-agile/ 【二次・創始者本人】)。2022 年以降、創始者は関与していない
- 含意: **「共通の統治、共通でないプロセス」**は本標準の層構造(内側のループは自由、決められた場所で人が触る)とほぼ同じ主張であり、既存の公的な先例として最も近い。DA はスクラム・カンバン・XP 等を「選べる WoW」の部品として扱い、その上にマイルストーンを置く。比較するなら、本標準の固有部分は「マイルストーンの判定者・記録・独立性・AI への委任の限界を要求事項として書く」点に絞られる

---

## 3. 既存の規格はアジャイル手法との関係をどう書いているか

| 文書 | 関係の書き方 | 対応表 | 根拠の提示 | 出典 |
| --- | --- | --- | --- | --- |
| ISO/IEC/IEEE 12207:2017 | 方法中立。"does not prescribe a specific software life cycle model, development methodology"(1.4)。プロセスは "concurrently, iteratively and recursively" に適用できる(1.3)。**附属書H「Application of Agile」(参考)** を持つ | 附属書H の本文は未取得 | 未確認 | https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed1.0%7Den.pdf 【一次・プレビュー】 |
| ISO/IEC/IEEE 15288:2023 | 方法中立("does not prescribe a specific system life cycle model, development methodology, method")。附属書は A テーラリング(規定)、B〜D(参考、D は MBSSE)。**アジャイルの附属書は無い**(プレビューの目次による) | 無し | — | https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee15288%7Bed2.0%7Den.pdf 【一次・プレビュー】 |
| ISO/IEC/IEEE 26515:2018(第2版) | "neither encourages nor discourages the use of any particular agile methodology"、"independent of the agile development methods and tools"。一般的なアジャイル用語だけを使う。12207・15288・26514 の利用者を支援 | 附属書A にアジャイル実践の説明(本文未取得) | 未確認 | https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee26515%7Bed2.0%7Den.pdf 【一次・プレビュー】 |
| IEEE 2675-2021 / ISO/IEC/IEEE 32675:2022(DevOps) | 12207:2017 のプロセスモデルに "closely aligned"。アジャイルは変化の速さの背景として触れるだけ。方法中立の明言は取得部分に無い。構成管理(IEEE 828)を基盤と書く | 12207 のプロセス群で章立て。条項単位の対応表は取得部分に無い | 未確認 | https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee32675%7Bed1.0%7Den.pdf 【一次・プレビュー】 |
| ISO/IEC/IEEE 29119-6:2021 | スクラムガイド → 29119-2 の対応表(附属書A)を持つ(既存メモ `research/phase4-standard/236-test-planning-standards.md` による。本文未入手) | **有り(規格がスクラムと対応表を持つ先例)** | 未確認 | 既存メモ |
| AAMI TIR45:2023(第2版、初版 2012) | アジャイルは QMS の内側で行えば適合し得る、という立場。IEC 62304 の条項番号に沿って活動を説明し、設計入力 = ユーザーストーリーと受入基準、設計レビュー = インクリメント・リリースの終わり(どれを正式な設計レビューとするかは開発計画で決める)。層: 製品 / リリース / インクリメント / ストーリー。**特定の手法(スクラム等)を名指ししない**(二次資料による) | 62304 の条項に沿う説明(対応づけ) | 委員会の合意文書(TIR = 技術情報報告)。実証データの提示は確認できず | https://aami.org/training/training-suites/software-cybersecurity/key-updates-aami-tir45-2023-guidance-on-agile-practices 【一次・告知】、https://blog.johner-institute.com/iec-62304-medical-software/tir-45-agile-software-development/ 【二次】 |
| IPA モデル契約(アジャイル開発版)2020-03-31 | **スクラムを明示的に前提**("本版ではアジャイル開発手法としてスクラムを採用しています")。準委任。PO はユーザ企業、スクラムマスターはベンダ。詳細な進め方は別紙「アジャイル開発進め方の指針」(チーム内の合意で変更可能な位置づけ) | 契約条項とスクラムの役割の対応 | 法的整理(偽装請負の疑義応答集) | https://www.ipa.go.jp/digital/model/agile20200331.html 【一次】 |
| IPA ITSS+ アジャイル領域へのスキル変革の指針(2020-02 版、「アジャイル開発の進め方」は 2024-05-28 一部改訂) | "代表的な手法であるスクラムを例にして"。"アジャイル開発の進め方には厳格な決まりごとや規範はありません"、"「唯一の正しい」アジャイル開発というものはありません"。ゲート・ガバナンスの章は無い | 無し(例示) | 無し(解説) | https://www.ipa.go.jp/digital/hjuojm000000gwoo-att/000065606.pdf 、https://www.ipa.go.jp/jinzai/skill-standard/plus-it-ui/itssplus/agile.html 【一次】 |
| V-Modell XT(独連邦) | 組織固有の適合(テーラリング)の一種としてスクラムを統合。決定点(Entscheidungspunkte)を残しつつ、「設計〜統合」の4決定点を「スプリント完了」1つへ畳む。V-Modell が巨視の統制、スクラムが微視の統制。プロダクトバックログに V-Modell の文書作成を入れ、完成の定義に文書更新を含める | 決定点の読み替え(対応づけ) | 実務者の記事(2011)。公式の版の記述は未確認 | https://www.computerwoche.de/article/2625101/sprinten-mit-dem-v-modell-xt.html 【二次】 |
| PMBOK 第8版(2025-11 刊) | 予測型・アジャイル・ハイブリッドのすべてに適用(二次資料の記述)。7 パフォーマンス領域(ガバナンスを含む)の各々にテーラリングの手引き。AI の扱いを拡充 | 無し(取得範囲) | — | https://www.4pmti.com/?p=1006110 【二次】 |

### 規格の書き方の分類

1. **方法中立を宣言するだけ**(15288:2023、PMBOK 8): 手法名を出さない。適合はプロセスの成果で判定する
2. **方法中立 + 参考の附属書で一般論**(12207:2017 附属書H、26515): 「アジャイル」という一般名で語り、特定の商標的手法(スクラム)に依存しない
3. **特定手法との対応表**(29119-6 附属書A、TIR45 の 62304 条項への沿わせ、V-Modell XT の決定点の読み替え): 規制・監査の場で「この活動はどの条項を満たすか」を問われる文脈で出てくる
4. **特定手法を前提に組み込む**(IPA モデル契約): 契約の役割分担を決める必要から、スクラムの役割名を契約の主体へ割り当てる

- どの規格も、**併用の有効性を実証データで示していない**(取得範囲内)。示しているのは「矛盾しない読み方」であって「併用すると良い結果になる」ではない
- 15288 が 2023 年改訂でアジャイルの附属書を置かなかった(12207:2017 にはある)ことは、規格が個別の手法への言及を増やす方向には一様に動いていないことを示す。ただし理由は未確認

---

## 4. ゲート型の統治とスクラムを組み合わせたときの既知の緊張

### 4.1 Water-Scrum-Fall(West / Forrester 2011)

- https://www.infoq.com/news/2011/12/water-scrum-fall-is-the-norm 【二次】、Forrester 報告書本体(RES60109)は robots で取得不可
- 構成: Water(事業と IT の事前計画)/ Scrum(開発の反復)/ Fall(組織の方針と基盤に縛られた低頻度のリリース)
- 指摘: アジャイルが開発チームで止まり、計画とリリースは従来型のまま。"Documents are a poor proxy for working software." 一方で記事は、これを過渡期と見るか実務上の現実解と見るかを問いとして開いている
- 含意: 本標準の G-7・G-8(出荷判定・事業決裁)を低頻度のバッチとして運用すると、典型的な "Fall" になる。併用を語る節を置くなら、この失敗の型を名指しで避ける条件(例: 判定の頻度を反復の頻度に合わせる)を書くかどうかが論点になる

### 4.2 HELENA 調査(Kuhrmann ほか)

- Klünder ほか "Catching up with Method and Process Practice"(ICSE-SEIP 2019): https://arxiv.org/pdf/2101.12383v1.pdf 【一次・論文】
  - 732 件(46 か国、2017 年、便宜抽出)。**76.8% がハイブリッド**を使う。ハイブリッド利用者の手法: スクラム 84.7%、反復開発 80.9%、カンバン 66.7%、古典的ウォーターフォール 60.5%、DevOps 56.0%、XP 52.8%
  - 組み合わせは 78.5% が「過去の経験から進化した」、37.8% が SPI として計画、8.5% が状況に応じて考案(複数回答)
  - 適合性の自己評価は約 66%。小規模組織が高く(70.2%)、超大規模が低い(62.7%)。**効果量は小さく、著者自身が追試を要すると書く**
  - "Companies usually do not apply development approaches by the book."
- Kuhrmann ほか "What Makes Agile Software Development Agile?"(IEEE TSE 2021、DOI 10.1109/TSE.2021.3099532): https://arxiv.org/pdf/2109.11435 【一次・論文】
  - 556 件。"there are no methods or practices that explicitly guarantee or prevent agility." "No method or practice determines whether a project is traditional or agile." "agility cannot be defined solely at the process level."
  - すべての領域で一貫してアジャイル・従来型・均衡のいずれかを実施したのは約 15%
- 含意
  - 「スクラムと併用できる」は、実務では既に**標準的な状態**(ハイブリッドが多数派)であり、主張しても情報量が小さい。逆に「併用すると成果が上がる」は HELENA でも支えられない(効果量が小さい・自己評価)
  - 手法名で agile/traditional を分けられないという TSE 2021 の結論は、**手法名を単位にした比較表(A)の妥当性を弱める**。比較するなら手法名ではなく「何を規定するか(席・判定・記録)」の軸で書く必要がある

### 4.3 Agile-Stage-Gate(Cooper & Sommer)

- Cooper, R. G. & Sommer, A. F. (2018) "Agile–Stage-Gate for Manufacturers", Research-Technology Management 61(2):17–26: https://www.five-is.com/download/agile-stage-gate-for-manufacturers 【一次の写し】
  - 6 社の聞き取りで市場投入期間 約 30% 短縮・生産性 約 30% 向上の**推定**(知覚ベース)。客観指標を入れていたのは 1 社だけ
  - 緊張: アジャイルの変わり続ける計画と、ステージゲートの固定された定義・事前承認の衝突。アジャイルのプロジェクトは「めったに止められない」。経営層の「アジャイル = ステージゲートの放棄」という誤解。専任チームの確保の難しさ
- SAFe 原則5 が引く Oosterwal: フェーズゲートの期日どおりの通過とプロジェクトの成功に相関が無い(前掲 2.1)
- 含意: ゲートと反復の併用研究は製造業の新製品開発が中心で、ソフトウェア変更単位のゲート(本標準の G-5)に当てはまる証拠ではない。「止められない」問題は、本標準の停止の申し立て・自己修正ループの上限と接点がある

### 4.4 規制領域での先例

- SafeScrum(Hanssen・Stålhane・Myklebust、Springer 2018、IEC 61508 向け): https://link.springer.com/10.1007/978-3-319-99334-8 【一次・書誌のみ】。スクラムを安全規格の外枠の内側に置く設計の先例。本文は未取得
- TIR45・V-Modell XT も同じ型: **規格・統制の枠が外側、スクラムが内側**。逆(スクラムの中に規格を入れる)は見当たらない

---

## 5. AI コーディングエージェントとスクラム(2025〜2026)

- **スクラムガイド本体は 2020 年版のまま。AI の記述は無い**(Scrum.org ニュース一覧 2025〜2026 に改訂の告知無し)。Scrum.org は AI の研修(PSPO-AI Essentials 2025-06、PSM-AI Essentials 2026-02、AI Fluency 2026-09)を出しているが、枠組みの規定は変えていない
- スクラムガイド拡張パック「AI and Scrum」v2026.1(https://scrumexpansion.org/ai-and-scrum/ 【一次】)
  - "Product Developers remain fully accountable for the quality of the increment." "every AI-supported result is owned by a person or team." "AI may recommend, but humans decide."
  - 完成の定義へ "AI outputs must be reviewed and tested" を足すことを提案。"Every piece of AI-generated code must be reviewed with the same rigor as if a teammate wrote it."
  - AI エージェントが「開発者」(責任の保持者)になれるかは書かない。自律の水準も定義しない。最も近いのは「許される範囲の境界を定める」「素早い手動の停止・上書きの仕組みを置く」
  - 統治: "Keep the organization's governance adaptable"、"Leaders must define strategic intent and guardrails"
- Scrum.org ブログ(個人寄稿、公式見解ではない)
  - Sanjay Saini "AI-Augmented Scrum Framework: When Half Your Team Are Autonomous Agents"(2026-03-08): "human accountability cannot be delegated"、人の開発者は "Agent Orchestrators"(https://www.scrum.org/resources/blog/ai-augmented-scrum-framework-when-half-your-team-autonomous-agents 【二次】)
  - 同 "Definition of Done for AI Agents"(2026-01-15): 完成の定義へゴールデンセット・PII 遮断・サーキットブレーカー(手数と費用の上限)・人への退避を追加(https://www.scrum.org/resources/blog/definition-done-ai-agents 【二次】)。これは「AI を製品に組み込む」話で、「AI が開発する」話とは別
- Xebia(Robbin Schuurman、2026-06-19 更新、PST の議論に基づく): スクラムの 3 つの責任は残る、"The AI did it" は抗弁にならない、エージェントの成果物ごとに説明・弁護・再現できる人を付ける「Accountability Test」(https://xebia.com/articles/ai-accountability-product-development/ 【二次】)
- Jeff Sutherland『OpenClaw Scrum and Scrum@Scale』(Leanpub 告知 2026-06-05): AI エージェントを "first-class team members" として扱うと主張(https://leanpub.com/blog/leanpub-book-launch-first-principles-in-scrum-openclaw-scrum-and-scrum-scale-create-trust-at-machine-speed-by-jeff-sutherland/ 【二次・告知】)。中身は未確認
- 実務の幅
  - 一方の端: エージェントは道具。責任は人の開発者(拡張パック・Xebia・Saini)
  - 他方の端: エージェントをチームの一員として扱う(Sutherland の新著の主張)
  - 共通: 完成の定義を AI の出力にも同じ基準で適用し、人のレビューを残す。**自律の水準・判定の席・独立性・停止の権限を規定する文書は、スクラム陣営には見当たらない**
- 含意: 本標準が規定する「AI に委譲できない判断」「自律の水準」「入力の分離」「停止の申し立て」は、スクラム陣営の現行文書が**空けている場所**にある。ここが規定範囲の重なりではなく補完になる根拠。ただし拡張パックは任意の補遺で、Sutherland 系の新著は逆向き(エージェントを一員化)の主張もあり、スクラム陣営が一枚岩ではない

---

## 6. (A)〜(D) への含意と選択肢

| 案 | 支える材料 | 弱める材料 |
| --- | --- | --- |
| (A) 比較・対応づけの節 | 29119-6 附属書A・TIR45・V-Modell XT は特定手法との対応づけを持つ。規制・監査の文脈では「どの活動がどの条項を満たすか」を問われる。DA・SAFe は構造が近く、差分を示せば本標準の固有部分(判定の席・記録・AI の委任の限界)が明確になる | 手法名で agile/traditional を分けられない(TSE 2021)。対応表は相手の改訂(拡張パックは四半期更新、AI-Native SAFe は 2 週ごと更新)に追随する保守義務を負う。ADR-0017 の「比較の公平性」の懸念。スクラムガイドは immutable で、対応づけの誤りは「スクラムではない」の指摘を招く。SAFe・Scrum は商標であり、比較表は相手の公式見解ではない |
| (B) 短い併用条件の節 | スクラムガイド自身が「他の手法を枠内で使える」「組織標準の完成の定義を下限とする」「スプリントレビューはリリースのゲートではない」と書く。この3文だけで、本標準のゲートを**スクラムを変えずに外側に置く**条件が書ける。DA の「共通の統治、共通でないプロセス」、TIR45・V-Modell XT・SafeScrum の「規格が外枠、スクラムが内側」は同じ型の先例 | 併用の有効性の実証は無い(HELENA は効果量小・自己評価、Cooper は知覚ベース)。書くなら EV マークが必須。条件を書くと「その条件を満たせば適合」と読まれる危険(ADR-0068 の適用の表明と適合の主張の区別に抵触しうる) |
| (C) 「主張しない」の明記 | 15288:2023・PMBOK 8 は手法名を出さない方法中立。規格の多数派の書き方。本標準も実証を持たない。ADR-0042・0051 の「扱わないと決めた」型がある | 読者の既知との接続が無い。派生物(概要記事)が「正本に無い比較」として止まる問題(#298 の契機)が解消しない。12207 附属書H・26515 のように**一般名(反復手法)での方法中立の宣言**までは書ける余地がある |
| (D) 派生物へ委ねる | 対応表の保守を正本から切り離せる | #298 の契機そのもの(派生物は正本に無いことを書けない)と矛盾。CLAUDE.md の「正本は GitHub Pages、派生物は正本を参照」の運用と両立しない |

- 規格の実例から見ると、(C) の方法中立の宣言と (B) の「外枠と内側」の型は排他ではない。12207:2017 は本文で方法中立を宣言し(C 相当)、参考の附属書H でアジャイルへの適用を述べる(B 相当)。この**二段の型**が最も多くの先例に支えられる
- (A) を採るなら、手法名ではなく「規定の対象」(責任・イベント/判定の場・作成物・確約/基準・停止の権限・AI の扱い)を軸にし、相手の版と取得日を固定し、「相手の公式見解ではない」と書く必要がある
- いずれの案でも、スクラムガイドの immutable 条項に触れない書き方(スクラムの規定を変えない)が前提条件になる

---

## 確認できなかったこと

- ISO/IEC/IEEE 12207:2017 附属書H「Application of Agile」の本文(有料。目次の存在だけ確認)。スクラム等を名指しするか、対応表を持つか、根拠を挙げるかは不明
- ISO/IEC/IEEE 15288:2023 がアジャイルの附属書を置かなかった理由。12207 の改訂作業(ISO のプロジェクト 90219 と思われる)の段階と内容(iso.org の取得に失敗)
- ISO/IEC/IEEE 26515:2018 附属書A・ISO/IEC/IEEE 29119-6:2021 附属書A の本文
- IEEE 2675 の 12207 への条項単位の対応の有無と適合の条項(4 章)の本文
- AAMI TIR45:2023 の本文(手法の名指しの有無は二次資料の記述に依る)。FDA の合意規格としての認定の有無と番号
- SAFe のマイルストーン・LPM・コンプライアンスの各ページの全文(framework.scaledagile.com は一部 robots で取得不可)。AI-Native SAFe の本文(告知のみ。人の責任・ゲート・AI エージェントの扱いは未確認)
- Shape Up 付録「Adjust to Your Size」と「Basic truths vs. specific practices」の本文
- Kanban Method(Kanban University)の公式ガイドの原則・一般実践の一次テキスト
- V-Modell XT の公式版(2.x)が持つアジャイルのプロジェクト実施戦略の有無と内容(2011 年の実務記事だけ取得)
- PMBOK 第8版の一次テキスト(二次資料のみ)
- Forrester「Water-Scrum-Fall」報告書の本体
- Scrum.org または Ken Schwaber による、AI エージェントの扱いに関する**公式の**声明(個人寄稿と研修の告知しか見つからない)。Sutherland の新著の本文
- スクラムとゲート型統治の併用について、客観指標で効果を測った研究(見つかったのは自己評価・知覚ベースのみ)
