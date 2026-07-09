# イベント駆動(Event-Driven Architecture / イベント駆動開発)調査メモ

- Issue: #25
- 作成日: 2026-07-10
- 状態: 清書済み → src/data/processes/event-driven.yaml(公開: /process-compass/processes/event-driven/)

> 記述様式: [調査フレームワーク](https://takenori-kusaka.github.io/process-compass/phase1-current-state/research-framework/)(6+2要素)に従う。
> すべての主張に出典 URL を付ける。一次情報(原典・公式ガイド・規格)を最優先。
> 「建前(規定・原典の定義)」と「実運用(日本の現場実態)」は必ず分けて書く。
> 関連メモ: [DDD 調査メモ(#26)](./20260709-ddd.md) — §8 でイベントストーミング/ドメインイベント経由の接点あり。本メモと相互リンク。

## 0. プロセスの概要 — イベント駆動は「ライフサイクル」ではなく「アーキテクチャスタイル/設計パラダイム」である

**IMPORTANT: 「イベント駆動」は開発ライフサイクル(工程列)ではない。**
その中心は **Event-Driven Architecture(EDA)** — 「ソフトウェアコンポーネントがイベント通知の受信に反応して実行される設計パラダイム」というアーキテクチャスタイル/設計パラダイムである。スクラム(反復のリズム)やウォーターフォール(工程列)とは層が異なり、いつ何を承認するかを定める工程モデルではない。したがって本メモの 6+2 要素は「開発工程」ではなく「設計・実装アプローチ(category = design-method 相当)」として当てはめる。

ただし本 Issue の趣旨に沿い、単なるアーキテクチャ図の説明にとどめず、**「イベント駆動開発」= イベントストーミングで協働モデリング → 境界とイベントの発見 → 実装、という開発の進め方**まで含めて扱う。この読み替えは以下のとおり。

- フェーズ = イベント発見・モデリング(イベントストーミング)→ アーキテクチャ設計(パターン選定・トポロジ決定)→ 実装・運用(ブローカー実装・結果整合性の作り込み)
- ロール = ドメインエキスパート・アーキテクト・開発者の協働(承認者・決裁者は原典に存在しない)
- 成果物 = ドメインイベント一覧・イベントカタログ/スキーマ・コンテキストマップ・トポロジ図(パブ/サブ配線)
- ゲート = 決裁ゲートは存在せず、「イベント設計の妥当性を継続的に検査する」inspection 型として表現する

そのため EDA は、DDD 同様、任意のライフサイクル(ウォーターフォール/アジャイル/スクラム)の**内部で採用される横断的な設計・実装スタイル**として位置づく。DDD が「業務モデルの中身」を、EDA が「その業務モデルをどう疎結合・非同期に連携させるか」を与える補完関係にある(§8)。

- 提唱者・原典・成立年: 単一の提唱者を持たない。用語 EDA は 2000 年代に Gartner が普及させ、実務上の概念整理は Martin Fowler の記事群、モデリング手法としては Alberto Brandolini の EventStorming(2013 頃)が原典的位置を占める。
  - 出典: [Gartner on EDA(Solace まとめ)](https://solace.com/blog/gartner-on-event-driven-architecture/)、[Martin Fowler: What do you mean by "Event-Driven"?(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[EventStorming 公式](https://www.eventstorming.com/)
- 一言でいうと: システム内で起きた「イベント(検知可能な出来事をデータ化したもの)」を生産者(Producer)が発行し、ブローカー(Broker/イベントルーター)を介して消費者(Consumer)が非同期に受信・反応することで、生産者と消費者を疎結合に保つ設計パラダイム。
  - 出典: [Gartner の EDA 定義(Solace まとめ)](https://solace.com/blog/gartner-on-event-driven-architecture/)
- Gartner の定義(引用): EDA は "a design paradigm in which a software component executes in response to receiving one or more event notifications." また Gartner アナリスト Gary Olliffe による「イベント」の定義は "An event is anything I can detect within an IT system, with hardware or software, that can be captured and represented as a piece of data."
  - 出典: [Gartner on EDA(Solace まとめ)](https://solace.com/blog/gartner-on-event-driven-architecture/)、[Wikipedia: Event-driven architecture](https://en.wikipedia.org/wiki/Event-driven_architecture)
- ISO/IEC/IEEE 12207:2017 の4プロセス群のうち厚くカバーする領域(解釈): テクニカルプロセス群の「アーキテクチャ定義」「設計定義」、および統合・検証にまたがる。マネジメント系(合意・意思決定管理・進捗管理)は対象外(EDA は決裁・契約を規定しない)。
- モダンな位置づけ: マイクロサービス間の非同期連携の主要手段として再評価され、Kafka 等のイベントストリーミング基盤、イベントソーシング/CQRS、Saga と結びつく。DDD の境界づけられたコンテキストがイベントの発生源/消費先の単位を与える。
  - 出典: [Apache Kafka: Introduction](https://kafka.apache.org/intro)、[Microservices.io: Saga](https://microservices.io/patterns/data/saga.html)

## 1. title / purpose / outcomes

| 要素 | 記述 | 出典 |
| --- | --- | --- |
| title | イベント駆動アーキテクチャ(Event-Driven Architecture, EDA)/イベント駆動開発 | [Gartner on EDA(Solace)](https://solace.com/blog/gartner-on-event-driven-architecture/) |
| purpose | システムの状態変化を「イベント」として表現し、生産者と消費者をブローカー経由で疎結合・非同期に連携させることで、リアルタイム応答性・拡張性・スケーラビリティ・(イベントログによる)無損失の業務分析を実現する | [Gartner on EDA(Solace)](https://solace.com/blog/gartner-on-event-driven-architecture/)、[Apache Kafka: Introduction](https://kafka.apache.org/intro) |
| outcomes(観察可能な結果) | ・生産者は誰が消費するかを知らずにイベントを発行できる(送信側と受信側の脱結合) ・新しい消費者をシステム改修なしに追加できる(拡張性) ・非同期処理により片方の障害が他方を直接止めない(復元力) ・状態変化がイベントログとして残り監査・再構築が可能(イベントソーシング採用時) | [Gartner on EDA(Solace)](https://solace.com/blog/gartner-on-event-driven-architecture/)、[Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[Apache Kafka: Introduction](https://kafka.apache.org/intro) |

## 2. 階層構造(process → activities → tasks)

EDA は工程列を持たないが、「イベント駆動開発」として捉えると、モデリング→設計→実装の反復として整理できる。フェーズ間は一方通行ではなく、実装で得た知見(消費者の増加・スキーマ変更)がモデリングへ戻る反復を持つ。

- **Process: イベント駆動開発(業務の出来事を軸に疎結合・非同期なシステムを育てる営み・継続的)**
  - **Phase A: イベント発見・モデリング(何が起きるか=ドメインイベントを洗い出す)**
    - **Activity A-1: イベントストーミング(協働モデリングワークショップ)**
      - Task: ドメインエキスパート・開発者・IT設計者が一堂に会し、業務で起きる「ドメインイベント(過去形で表す出来事:『注文が確定した』等)」を時系列に付箋で貼り出す
      - Task: イベントを引き起こす「コマンド」、イベントを生む「集約(アグリゲート)」、外部システム・ポリシー(反応ルール)を追加していく
      - Task: イベントの塊から「境界づけられたコンテキスト」の候補線を引く(DDD との合流点)
      - 出典: [EventStorming 公式](https://www.eventstorming.com/)、[Brandolini インタビュー(codecentric)](https://blog.codecentric.de/alberto-brandolini-domain-driven-design-eventstorming)
    - **Activity A-2: イベントの粒度・意味の合意**
      - Task: 各イベントが「業務上意味のある確定した事実」を表すか検査する(技術イベントとドメインイベントを区別)
      - Task: イベントに載せる情報(状態転送か通知か)の方針を暫定的に決める(§Phase B へ引き継ぎ)
      - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)
  - **Phase B: アーキテクチャ設計(どのパターンで連携させるか)**
    - **Activity B-1: イベント駆動パターンの選定(§下記4パターン)**
      - Task: Event Notification / Event-Carried State Transfer / Event Sourcing / CQRS のどれを、どの箇所に適用するか判断する(混同しないことが最重要)
      - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)
    - **Activity B-2: トポロジとブローカーの決定**
      - Task: メディエータ型(オーケストレーション)かブローカー型(コレオグラフィ)かを選ぶ
      - Task: メッセージング基盤を選定する(Pub/Sub、イベントストリーミング=Kafka 等)
      - Task: プロデューサー/コンシューマー、トピック/パーティション、ブローカーの配置を設計する
      - 出典: [Wikipedia: EDA(topology)](https://en.wikipedia.org/wiki/Event-driven_architecture)、[Apache Kafka: Introduction](https://kafka.apache.org/intro)
    - **Activity B-3: イベントスキーマ(契約)とカタログの設計**
      - Task: イベントのペイロード構造・バージョニング方針・スキーマ互換性ルールを定義する
      - Task: 分散トランザクションが必要な業務フローに Saga(補償トランザクション)を設計する
      - 出典: [Apache Kafka: Introduction](https://kafka.apache.org/intro)、[Microservices.io: Saga](https://microservices.io/patterns/data/saga.html)
  - **Phase C: 実装・運用(結果整合性を作り込み、観測する)**
    - **Activity C-1: プロデューサー/コンシューマー実装**
      - Task: イベント発行(状態変更→イベント発行の原子性:Outbox 等)を実装する
      - Task: 冪等な消費・順序保証(同一キー→同一パーティション)を実装する
      - 出典: [Apache Kafka: Introduction](https://kafka.apache.org/intro)
    - **Activity C-2: 結果整合性と可観測性の作り込み**
      - Task: 補償トランザクション(Saga)・リトライ・デッドレターを実装する
      - Task: 分散トレーシングで「暗黙的な論理フロー」を追跡可能にする(デバッグ困難への対処)
      - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[Microservices.io: Saga](https://microservices.io/patterns/data/saga.html)

## 3. roles(ロール)

EDA/イベント駆動開発は公式な「役職」ではなく協働の関係と設計責任をロールとして持つ。決裁者・承認者は原典に存在しない(DDD と同型)。

| ロール | 責任 | 兼務の実態(日本の現場) | 出典 |
| --- | --- | --- | --- |
| ドメインエキスパート(Domain Expert) | 業務で「何が起きるか」の知識源。ドメインイベントの意味・粒度の妥当性を判定する。イベントストーミングの中核参加者 | 業務部門・企画・PdM が兼務。多忙で継続参加できず、開発者が想像でイベントを定義してしまう失敗が起きやすい(§7) | [EventStorming 公式](https://www.eventstorming.com/) |
| アーキテクト | パターン選定(4パターン)・トポロジ(メディエータ/ブローカー)・ブローカー基盤・スキーマ契約を設計する。疎結合と結果整合性の設計責任 | テックリードが戦略設計から実装まで一人で抱えがち。EDA 経験者が社内に不足すると設計が属人化 | [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[Wikipedia: EDA](https://en.wikipedia.org/wiki/Event-driven_architecture) |
| 開発者 | プロデューサー/コンシューマーの実装、冪等性・順序保証・補償トランザクション(Saga)・可観測性の作り込み | サービスごとにチームが分かれ、イベント契約の変更調整が組織横断の負担になる | [Apache Kafka: Introduction](https://kafka.apache.org/intro)、[Microservices.io: Saga](https://microservices.io/patterns/data/saga.html) |
| ファシリテーター(イベントストーミング) | 部門・専門の壁を越えたワークショップを進行し、イベント・境界・集約の発見を促す。Brandolini がこの形式を提唱 | 外部コンサル/経験者が務めることが多い。社内に経験者がいないと成立しにくい(DDD メモと共通) | [EventStorming 公式](https://www.eventstorming.com/)、[Brandolini インタビュー(codecentric)](https://blog.codecentric.de/alberto-brandolini-domain-driven-design-eventstorming) |

- 組織的側面: EDA の品質は「レビューゲートでの承認」ではなく、**イベント設計(粒度・スキーマ・境界)の一貫性**で守られる。DDD と同じく、業務知識を持たない第三者による外形レビューではイベントの妥当性を判定しにくい。

## 4. information items(成果物・文書)

| 成果物 | 作成者(ロール) | 用途・後続への引き渡し先 | 出典 |
| --- | --- | --- | --- |
| ドメインイベント一覧(イベントストーミングの付箋の壁) | 全ステークホルダー(ワークショップ) | 境界・集約・パターン選定の入力。DDD の境界づけられたコンテキスト発見材料 | [EventStorming 公式](https://www.eventstorming.com/) |
| イベントカタログ/スキーマ定義(契約) | アーキテクト+開発者 | プロデューサー/コンシューマー間の契約。バージョニング・互換性管理の基盤 | [Apache Kafka: Introduction](https://kafka.apache.org/intro) |
| トポロジ図(パブ/サブ配線・ブローカー配置) | アーキテクト | 実装のブループリント。メディエータ/ブローカー方式の合意 | [Wikipedia: EDA](https://en.wikipedia.org/wiki/Event-driven_architecture) |
| Saga 定義(手順+補償トランザクション) | アーキテクト+開発者 | 分散トランザクション実装。結果整合性の作り込み単位 | [Microservices.io: Saga](https://microservices.io/patterns/data/saga.html) |
| コンテキストマップ(DDD 成果物を流用) | アーキテクト | イベントの発生源/消費先の境界。マイクロサービス分割へ引き渡し | [DDD メモ(#26)](./20260709-ddd.md) |

## 5. gates(ゲート・決裁)

EDA/イベント駆動開発には決裁ゲート(DR・マイルストーン承認)の概念が存在しない。代わりに「イベント設計の妥当性を継続的に検査する」inspection 型の確認点として表現する。すべて当事者による継続確認であり、第三者承認ではない。

| ゲート名(inspection 型) | Deliverables | Criteria(判定基準) | 判定者 | 判定結果の種類 | 出典 |
| --- | --- | --- | --- | --- | --- |
| イベントの業務妥当性検査 | ドメインイベント一覧 | 各イベントが業務上意味のある確定事実を表すか。粒度が適切か(技術イベントとドメインイベントの分離) | ドメインエキスパート+開発者 | 妥当/イベント再定義 | [EventStorming 公式](https://www.eventstorming.com/)、[Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html) |
| パターン適合検査 | パターン選定表 | 4パターン(Notification/State Transfer/Event Sourcing/CQRS)が混同されず、文脈に合っているか | アーキテクト | 妥当/パターン差し替え | [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html) |
| 疎結合・境界検査 | トポロジ図・コンテキストマップ | イベント連携が過度な同期依存(分散モノリス)を生んでいないか | アーキテクト | 妥当/境界・連携の引き直し | [Wikipedia: EDA](https://en.wikipedia.org/wiki/Event-driven_architecture) |
| 結果整合性/一貫性検査 | Saga 定義・スキーマ | 補償トランザクションで異常系を戻せるか。スキーマ互換性が保たれるか | アーキテクト+開発者 | 妥当/Saga・スキーマ再設計 | [Microservices.io: Saga](https://microservices.io/patterns/data/saga.html) |

- 含意: ゲートが「決裁」でなく「検査と修正」である点は DDD/スクラムの経験主義と親和的。イベント契約(スキーマ)だけは、消費者が多数に広がると事実上の「凍結ポイント」に近づき、後方互換ルールという形で軽い統制が発生する(§8)。

## 6. レビュープロセス

- **誰が**: ドメインエキスパート(イベントの意味)・アーキテクト(パターン/境界/契約)・開発者(実装の冪等性・順序・補償)。独立した第三者 QA レビューは EDA の枠組みには存在しない。
- **何を**: (1)イベントが業務事実を正しく表すか、(2)4パターンが混同なく適用されているか、(3)疎結合が保たれ分散モノリス化していないか、(4)結果整合性が破綻しないか。
- **形式**: イベントストーミング(協働合意)、アーキテクチャレビュー(パターン/トポロジ)、スキーマレビュー(契約の後方互換)、コードレビュー(冪等性・順序保証)。
- **ゲートとの関係**: レビュー=独立した承認イベントではなく、日常の協働と契約管理に埋め込まれた継続的検査。ただしスキーマ契約は消費者への影響が広いため、変更レビューが最も「ゲートらしく」なる。
  - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[EventStorming 公式](https://www.eventstorming.com/)、[Apache Kafka: Introduction](https://kafka.apache.org/intro)

## 7. 日本的観点(標準がカバーしない領域)

- 稟議・多段決裁の有無と形: EDA 自体は決裁を規定しない。大企業ではアーキテクチャ審査会にトポロジ図・パターン選定を載せる運用が起こるが、これは EDA 由来ではなく組織のガバナンス由来(DDD メモと同型)。
- 品質保証部門など第三者レビューの制度: EDA と相性が悪い。非同期・結果整合の妥当性は業務知識とシステム全体像がないと判定できず、外形的な QA レビューでは捉えにくい。
- 受発注構造とレビューの二重性: 受託開発ではイベント契約(スキーマ)がサービス=ベンダー境界と一致しがちで、契約変更がそのまま「見積・検収の再交渉」になり、俊敏なイベント設計の見直しが商流の壁で止まりやすい(解釈)。
- 建前と実運用の乖離(形骸化パターン):
  - **「分散モノリス」アンチパターン** — サービスを分割したが、イベントの裏で同期呼び出し(RPC/HTTP)依存が残り、独立してデプロイ・障害分離できない状態。「分散システムのコストを払いながらマイクロサービスの利点を享受できない」と国内でも典型的失敗として語られる。
    - 出典: [分散されたモノリスになってしまうマイクロサービス(yinlei.org)](https://yinlei.org/it-iot/2016/03/services-distributed-monolith.html)、[分散モノリスに対するアプローチ(IzumiSy)](https://izumisy.work/entry/2020/04/17/002511)
  - **結果整合性の理解不足** — 「即時に整合する」前提で UI/業務を作り、遅延・重複・順序の乱れを想定しない。開発者が補償トランザクションと異常系を明示設計する必要がある点が軽視されがち。
    - 出典: [Microservices.io: Saga(自動ロールバック欠如・分離レベル欠如)](https://microservices.io/patterns/data/saga.html)
  - **過剰な複雑性/デバッグ困難** — Fowler の指摘どおり「複数の通知にまたがる論理フローが暗黙的になりデバッグが困難」。可観測性(分散トレーシング)を後回しにすると運用で破綻。
    - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)
- ロールの兼務の実態: EDA 経験者(アーキテクト)が希少で、モデリング(イベントストーミング)を省いて技術先行(Kafka を入れる)で始め、境界設計が甘くなる。段階的移行として「モジュラーモノリス」で境界を先に固める国内アプローチが増えている。
  - 出典: [モジュラモノリスに移行する理由(AMBI/アソビュー)](https://en-ambi.com/itcontents/entry/2022/07/25/093000/)、[サービス分割に備えたモノリス(ラクス)](https://tech-blog.rakus.co.jp/entry/20201026/microservice)

## 8. 考察(事実と分離)

- **ライフサイクルとの直交性**: EDA は「いつ作るか」を決めるスクラム/ウォーターフォールと直交し、「どう連携させるか(疎結合・非同期)」を埋める。DDD が「設計の中身」を、EDA が「連携方式」を与える。Process Compass の体系化上は、DDD と並べて**「設計・実装アプローチ」レイヤ**に置くのが正確(§0)。
- **DDD との連結(#26 相互リンク)**: イベントストーミング(Brandolini)は DDD とEDA の橋。ドメインイベント → 境界づけられたコンテキスト発見(DDD)→ そのコンテキストをイベントで疎結合連携(EDA)、という**「業務モデリング(DDD)→ イベント駆動実装(EDA)」の連続性**を描ける。DDD メモ §8 と対になる。
  - 出典: [EventStorming 公式](https://www.eventstorming.com/)、[DDD メモ(#26)§8](./20260709-ddd.md)
- **4パターンの混同が最大の落とし穴(Fowler)**: 「イベント駆動」という語が Event Notification / Event-Carried State Transfer / Event Sourcing / CQRS の別物を一括りにするため、議論が噛み合わない。図解では**この4パターンを分けて提示する**のが本プロジェクトの価値になる(下表)。
- **ゲート観の対比**: EDA も DDD 同様「決裁ゲートなし・inspection 型」。ただしイベント契約(スキーマ)は消費者が広がるほど変更コストが上がり、**後方互換ルールという軽いガバナンスが自然発生**する。これは「決裁ゲートを持つプロセス」と「inspection 型プロセス」の中間例としてフェーズ3の対比軸に使える。
- **主要パターン整理(図解の骨子)**:
  - Event Notification: 変化を知らせるだけ。ペイロード最小、結合最弱、論理フローが暗黙化しデバッグ困難。
  - Event-Carried State Transfer: イベントに状態を載せ、受信側が問い合わせ不要に。復元力・低遅延だがデータ重複と複雑性増。
  - Event Sourcing: 状態変化そのものをイベントログとして永続化し、再生で状態復元。監査・履歴に強いが外部連携が難しい。
  - CQRS: 読み/書きのモデルを分離。複雑ドメインを簡素化するが複雑性を追加。
  - (実装基盤)Pub/Sub と イベントストリーミング(Kafka): ブローカー経由で生産者と消費者を脱結合。Kafka はイベントを「key/value/timestamp/metadata headers」で表しトピック/パーティションに分散。
  - (分散一貫性)Saga: 複数サービスにまたがるトランザクションをローカルトランザクション列+補償で実現。コレオグラフィ(各サービスがイベントで連鎖)/オーケストレーション(オーケストレータが指示)の2方式。
    - 出典: [Martin Fowler(2017)](https://martinfowler.com/articles/201701-event-driven.html)、[Apache Kafka: Introduction](https://kafka.apache.org/intro)、[Microservices.io: Saga](https://microservices.io/patterns/data/saga.html)

## 9. 埋められなかった観点(追加調査項目)

- **Brandolini『Introducing EventStorming』原著の一次記述**: 本メモは公式サイト・インタビューに依拠。書籍本文(Big Picture/Process Modeling/Software Design の各手順・記号法)の一次確認は未実施。
- **Kafka 以外のイベントストリーミング/メッセージング基盤の一次比較**: AWS EventBridge、Google Pub/Sub、RabbitMQ、Solace、NATS 等の公式定義・トポロジ差は未深掘り(Kafka のみ一次確認済み)。
- **CQRS/Event Sourcing の一次原典**: Greg Young(Event Sourcing/CQRS)の一次資料、Fowler の個別 bliki(EventSourcing, CQRS)の直接確認は未実施(本メモは 2017 統合記事に依拠)。
- **Gartner 一次文献**: Gartner 定義は二次まとめ(Solace)経由。Gartner レポート原典(Maturity Model 等)の直接確認は未済(有料資料)。
- **日本の建前/実運用の定量データ**: 分散モノリス失敗率や結果整合性起因の障害の定量調査は未取得(技術ブログの定性記述に依拠)。
- **生成AIとの接点(本プロジェクト固有)**: LLM によるイベント抽出・イベントストーミング支援・スキーマ生成の実態は未調査(DDD メモと共通の穴)。
- **EDA と Saga オーケストレーションのツール実態**: Temporal / AWS Step Functions 等のワークフローエンジンとの関係は未調査。

## 10. 出典一覧

### 一次情報

- Martin Fowler『What do you mean by "Event-Driven"?』(2017): [martinfowler.com](https://martinfowler.com/articles/201701-event-driven.html)
- Alberto Brandolini: [EventStorming 公式](https://www.eventstorming.com/)、[Brandolini インタビュー(codecentric)](https://blog.codecentric.de/alberto-brandolini-domain-driven-design-eventstorming)
- Apache Kafka『Introduction』(公式ドキュメント): [kafka.apache.org/intro](https://kafka.apache.org/intro)
- Microservices.io(Chris Richardson)『Pattern: Saga』: [microservices.io](https://microservices.io/patterns/data/saga.html)

### 二次情報

- [Gartner on Event-Driven Architecture(Solace まとめ・Gartner 定義引用)](https://solace.com/blog/gartner-on-event-driven-architecture/)
- [Wikipedia: Event-driven architecture](https://en.wikipedia.org/wiki/Event-driven_architecture)
- [分散されたモノリスになってしまうマイクロサービス(yinlei.org)](https://yinlei.org/it-iot/2016/03/services-distributed-monolith.html)
- [分散モノリスに対するアプローチ(IzumiSy)](https://izumisy.work/entry/2020/04/17/002511)
- [モジュラモノリスに移行する理由(AMBI/アソビュー)](https://en-ambi.com/itcontents/entry/2022/07/25/093000/)
- [サービス分割に備えたモノリス(ラクス Developers Blog)](https://tech-blog.rakus.co.jp/entry/20201026/microservice)

### 関連メモ

- [DDD 調査メモ(#26)](./20260709-ddd.md) — イベントストーミング/ドメインイベントで接続。§8 相互リンク。
