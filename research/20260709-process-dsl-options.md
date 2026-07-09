# プロセス表示のスキーマ駆動化: 既存 OSS / DSL 調査

- Issue: #72
- 作成日: 2026-07-09
- 目的: 複数の開発プロセス(ウォーターフォール、スクラム、ISO 12207 プロセス群など)を「全体図 → クリックで階層的に詳細へ」と閲覧できる UI を、個別ページの手書きではなく**共通スキーマのデータ + 描画の分離**で実現するための既存技術調査
- 前提要件(Issue #72 の背景から抽出)
  - Astro + Starlight の静的サイト(GitHub Pages)に組み込めること
  - 階層構造(全体プロセス → フェーズ内ワークフロー → 個別作業)のドリルダウン表示
  - 同じデータを将来「チーム体制入力 → 最適プロセス提案ツール」の知識ベースとして再利用できること(= データがパース可能な構造化形式であること)
  - ロール・成果物・ゲート(DR)・レビューといった開発プロセス固有の概念を表現できること

---

## 1. BPMN 2.0(OMG 標準)+ bpmn-js

### 何ができるか

- OMG 標準のビジネスプロセス記法・交換形式(ISO/IEC 19510 としても標準化)。タスク、ゲートウェイ(分岐)、イベント、レーン(担当ロール)、データオブジェクト(成果物)、サブプロセスを表現できる
- 開発プロセスへの当てはめ: DR・承認ゲート → 排他ゲートウェイ+マイルストーンイベント、ロール → プール/レーン、成果物 → データオブジェクト、フェーズ内ワークフロー → サブプロセスで表現可能

### データ形式

- XML(BPMN 2.0 XML 交換形式)。図形の座標情報(BPMN DI)も同じファイルに含まれる
- 手書きは現実的でなく、編集には Camunda Modeler などの GUI エディタが事実上必須

### ビューア・レンダラ OSS

- [bpmn-js](https://github.com/bpmn-io/bpmn-js)(bpmn.io プロジェクト)がデファクト。Viewer / NavigatedViewer / Modeler の 3 段階のパッケージ構成
- **ドリルダウン対応あり**: bpmn-js 9.0(2022 年)で折りたたみサブプロセス(collapsed subprocess)への drill down が実装された。サブプロセス上のオーバーレイボタンで下位プレーンへ移動し、パンくず(breadcrumbs)で任意の祖先階層へ戻れる([公式ブログ](https://bpmn.io/blog/posts/2022-bpmn-js-900-collapsed-subprocesses)、[実装詳細](https://deepwiki.com/bpmn-io/bpmn-js/7.1-project-setup))。閲覧専用の navigated-viewer パッケージでも動作する([フォーラム](https://forum.bpmn.io/t/how-can-i-expand-a-collapsed-bpmn-subprocess-to-expanded-with-just-navigated-viewer-package/8255))
- 本プロジェクトの「全体図 → クリックで詳細」要件に対し、単一 BPMN ファイル内のサブプロセス階層という形でそのまま応えられる唯一の既製ビューア

### Astro 静的サイトへの組み込み現実性

- bpmn-js は純クライアントサイド JS。`<script>` で XML を読み込んで `Viewer#importXML` するだけなので、Astro のアイランド(またはプレーンな `<script>`)として静的サイトに埋め込み可能。SSR 不要
- ただし Starlight のライト/ダークテーマ切替への追従、Mermaid と見た目の統一は自前対応になる

### ライセンス

- **bpmn.io License**(MIT ベースの独自ライセンス)。商用含め利用・改変・再配布可だが、**描画内の bpmn.io ウォーターマーク(右下ロゴ)の削除・隠蔽が禁止**([公式ライセンスページ](https://bpmn.io/license/)、[LICENSE 原文](https://github.com/bpmn-io/bpmn-js/blob/main/LICENSE)、[フォーラム回答](https://forum.bpmn.io/t/bpmn-js-license-watermark-doubt/11267))。CC-BY-4.0 / MIT の本プロジェクトと共存はできるが、図の隅にロゴが常時出る

### 懸念(事実)

- BPMN XML は「実行・交換」用であり、ロール定義・成果物定義・ガイダンス文書といった**プロセスエンジニアリングのメタデータを持たない**(レーン名・データオブジェクト名は文字列にすぎない)。提案ツールの知識ベースとして使うには XML から情報を抽出する層が別途必要

---

## 2. SPEM 2.0 / Eclipse Process Framework (EPF) Composer

### 何ができるか

- SPEM(Software & Systems Process Engineering Metamodel)は OMG の**開発プロセス定義専用**メタモデル。Role / Task / Work Product / Activity / Phase / Guidance / Milestone を第一級概念として持ち、「メソッドコンテンツ(再利用可能な部品)」と「プロセス(部品の組み立て)」を分離する設計([解説記事](https://modeling-languages.com/process-software-modeling-spem/))
- 本プロジェクトが調査フレームワークで求める観点(ロールモデル、ゲート、成果物、レビュー、階層構造)と概念的に最も一致する標準

### ツール(EPF Composer)の現状

- EPF Composer は SPEM 系メタモデル(UMA)でプロセスライブラリを編集し、**静的 HTML サイトとして publish** できるツール。OpenUP の公開サイトがその出力例([Eclipse プロジェクトページ](https://projects.eclipse.org/projects/technology.epf))
- **プロジェクトは Eclipse でアーカイブ済み**。最終版 1.5.2 は 2018 年リリースで、事実上メンテ停止([eclipse.org/epf](https://www.eclipse.org/epf/)、[Wikipedia](https://en.wikipedia.org/wiki/Eclipse_process_framework))
- 出力 HTML はフレームベースの旧世代デザインで、Starlight サイトへの統合やモバイル対応は望めない
- 他ツールへエクスポートする試みとして [EPF-plugin-SPEM-export](https://github.com/ReliSA/EPF-plugin-SPEM-export)(大学発プラグイン)が存在する程度

### 評価に関わる事実の整理

- ツールとしては採用不可(アーカイブ済み・出力品質)。ただし**メタモデル(概念語彙)は自作スキーマの設計指針として一級の参考資料**

---

## 3. Structurizr DSL / C4 model

### 何ができるか

- C4 モデル(Context → Container → Component → Code)の「ズームレベルを分けて同一モデルを複数ビューで見せる」発想の代表例。テキスト DSL でモデルを 1 か所に定義し、複数ビューを導出する([DSL ドキュメント](https://docs.structurizr.com/dsl))
- 挙動(プロセス)記述は **dynamic view** が担当。ただし「静的モデルに定義済みの要素間の、順序付き相互作用」を示すもので、ユースケース単位のシーケンス図に近い([dynamic view cookbook](https://docs.structurizr.com/dsl/cookbook/dynamic-view/))
- 並列シーケンスのサポートは限定的で、複雑な分岐・並列は明示的な順序番号での回避が必要([parallel cookbook](https://docs.structurizr.com/dsl/cookbook/dynamic-view-parallel/)、[Issue #53](https://github.com/structurizr/dsl/issues/53))。フェーズ・ゲート・成果物といったプロセスエンジニアリング概念は語彙にない

### Astro 組み込み・ライセンス

- structurizr/dsl は Apache-2.0([LICENSE](https://github.com/structurizr/dsl/blob/master/LICENSE))
- 静的サイト生成の先行事例として [structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr)(Apache-2.0)があり、「DSL モデル → ナビゲーション付き静的サイト」というアーキテクチャの参考になる。ただし独立サイトを生成するため Starlight への埋め込みには向かない

### 評価に関わる事実の整理

- プロセス記述用途には力不足。「単一モデル + ズームレベル別ビュー + 静的サイト生成」という**アーキテクチャパターンの参照実装**として価値がある

---

## 4. テキスト DSL 勢(Mermaid / PlantUML / D2 / Kroki)

### 4.1 Mermaid

- flowchart で `subgraph`(入れ子可)と `click nodeId "url"` によるノードへのリンク付与が可能。ツールチップ、`_self`/`_blank` などのターゲット指定にも対応([公式 flowchart 構文](https://mermaid.js.org/syntax/flowchart.html))
- 疑似ドリルダウン = 「全体図の各フェーズノードに click リンクを張り、フェーズ詳細ページへ遷移」というページ間ナビゲーション方式。ビューア内でのプレーン切替(BPMN 式)はできない
- 制約: click 機能は `securityLevel: 'strict'`(デフォルト)では無効で、`'loose'` が必要(同上公式ドキュメント)。astro-mermaid はクライアントサイドレンダリングなので initialize 設定で対応可能(要検証)
- ライセンス MIT。**本プロジェクトは astro-mermaid 導入済み**で追加コストが最小

### 4.2 PlantUML

- アクティビティ図・ステート図で `[[url]]` ハイパーリンクを埋め込め、SVG 出力ならリンクが生きる
- ライセンスは GPL / LGPL / Apache / EPL / MIT から選択可能。**生成された画像はソース作者の所有物でライセンス制約なし**([公式 FAQ](https://plantuml.com/faq)、[license ページ](https://plantuml.com/license))
- 実行に Java が必要なため、Astro ではビルド時生成(CI 上で jar 実行)か Kroki 経由になる。クライアントサイドレンダラはない

### 4.3 D2

- **layers / scenarios / steps によるマルチボード合成がネイティブ機能**。1 つの `.d2` ファイルに抽象度の異なる層(layers)を定義し、ズームイン/アウトでドリルダウンできる([Composition 公式ドキュメント](https://d2lang.com/tour/composition/)、[GitHub](https://github.com/terrastruct/d2))。テキスト DSL の中では階層要件への適合が最も高い
- ただしボード間のインタラクティブなナビゲーションは D2 Studio(商用)や `d2 --watch` の機能で、静的 SVG 出力では各ボードを個別 SVG にし、リンクでページ遷移させる形になる
- Astro 統合: [astro-d2](https://github.com/HiDeoo/astro-d2)(MIT)がビルド時に d2 CLI を実行して SVG 化する。CI に D2 のインストールが必要([Starlight での利用手順](https://hideoo.dev/notes/starlight-add-diagrams-using-d2/))。D2 本体は MPL-2.0
- 見た目の質は高いが、Mermaid と二重運用になる点、CI 依存が増える点はコスト

### 4.4 Kroki

- 約 25 種の図法(PlantUML、D2、Structurizr、Graphviz ほか)を統一 HTTP API で SVG/PNG 化するゲートウェイ。MIT、セルフホスト可(Docker)([kroki.io](https://kroki.io/)、[GitHub](https://github.com/yuzutech/kroki))
- Astro では「ビルド時に Kroki サーバへ POST して SVG を取得」する自作 remark プラグインか事前生成スクリプトが必要。GitHub Actions ビルドなら公式サーバ利用かサービスコンテナ起動で対応可能
- 位置づけ: DSL の選択肢を広げる基盤であり、DSL そのものではない

---

## 5. ワークフロー/プロセス定義スキーマ系(YAML/JSON)

### 5.1 Serverless Workflow DSL(CNCF)

- CNCF Sandbox(2020 年〜)のベンダー中立ワークフロー定義言語。YAML/JSON で記述し、JSON Schema で検証できる。現行 1.0 系。タスク、switch(分岐)、fork(並列)、イベントトリガーなどを持つ([serverlessworkflow.io](https://serverlessworkflow.io/)、[specification リポジトリ](https://github.com/serverlessworkflow/specification/)、[CNCF](https://www.cncf.io/projects/serverless-workflow/))
- ビューア: Apache KIE(旧 Kogito)の [Serverless Workflow Diagram Editor](https://github.com/apache/incubator-kie-tools/blob/main/packages/serverless-workflow-diagram-editor/sw-editor/README.md) や [workflow-diagram-service](https://github.com/serverlessworkflow/workflow-diagram-service)(Quarkus ベースの SVG 生成サービス)があるが、いずれも実行基盤・IDE 向けで静的サイト埋め込み用途には重い
- 本質的に**機械実行用 DSL**であり、ロール・成果物・ゲート承認・ガイダンスという人間系プロセスの語彙がない

### 5.2 CACAO Security Playbooks(OASIS)

- セキュリティ対応手順(プレイブック)を JSON で標準化したもの。playbook / workflow step / command / target などのオブジェクトクラスと公式 JSON Schema を持つ([v2.0 仕様](https://docs.oasis-open.org/cacao/security-playbooks/v2.0/security-playbooks-v2.0.html)、[JSON Schema リポジトリ](https://github.com/cyentific-rni/cacao-json-schemas))
- ドメインがセキュリティオペレーションに特化しており、開発プロセス記述への流用は不自然

### この系統からの収穫(事実)

- そのまま流用できる標準は見つからなかった。ただし「**JSON Schema を公開してデータを検証可能にする**」「workflow step をオブジェクトグラフ(id 参照)で表す」という設計パターンは、自作スキーマ設計にそのまま輸入できる

---

## 6. 自作スキーマ + Astro Content Collections

### 何ができるか

- Astro 5 の Content Layer API では、`file()` ローダーで **YAML / JSON / TOML の構造化データをコレクション化**し、Zod スキーマで検証、`getCollection()` / `getStaticPaths()` でデータ駆動のページ生成ができる([Content collections 公式ガイド](https://docs.astro.build/en/guides/content-collections/)、[Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/))
- スキーマ違反はビルド時にエラーになるため、「プロセスデータの品質ゲート」を CI(既存の `npm run check`)に自然に組み込める
- 先行事例: 構造化データ(レシピ等)を collection 化してページ群を生成するパターンは確立されている([Raymond Camden の実例](https://www.raymondcamden.com/2026/01/05/turning-recipe-data-into-an-astro-content-collection)、[SitePoint 入門](https://www.sitepoint.com/getting-started-with-content-collections-in-astro/))。「プロセスモデル専用」の著名な先行 OSS は今回の調査では見つからなかった(= 穴、後述)
- 描画は 2 通り
  - データ → Mermaid コード文字列を生成し、既存 astro-mermaid でレンダリング(click リンクで階層ページへ遷移)
  - データ → カスタム Astro コンポーネント(HTML/SVG)で描画(将来のインタラクティブ化に有利)

### ライセンス・組み込み現実性

- すべて自前(MIT / CC-BY-4.0 のまま)。外部ランタイム依存なし。組み込み現実性は当然最も高いが、**スキーマ設計と描画コンポーネントの実装コストを全額自己負担**する

---

## 本プロジェクトへの適合度 比較表

| 候補 | プロセス表現力(ロール/成果物/ゲート) | 階層ドリルダウン | 知識ベース再利用性 | Astro 組込現実性 | メンテ状況 | ライセンス適合 | 総合 |
|---|---|---|---|---|---|---|---|
| BPMN 2.0 + bpmn-js | ○(レーン・データオブジェクト・ゲートウェイ。ただしメタデータは弱い) | ◎(viewer 内サブプロセス drill down + パンくず) | △(XML パース必要、プロセス知識の語彙なし) | ○(クライアント JS、テーマ統一は自前) | ◎(活発) | △(ウォーターマーク必須) | **○** |
| SPEM 2.0 / EPF Composer | ◎(概念モデルは完全一致) | ○(Phase/Activity/Task 階層) | △(XMI/UMA、パーサ自作は重い) | ×(アーカイブ済み、旧式 HTML 出力) | ×(2018 年で停止) | ○(EPL) | **×**(ただし語彙は参考◎) |
| Structurizr DSL / C4 | ×(挙動は dynamic view のみ、並列・分岐が弱い) | ○(ズームレベル設計は優秀) | △ | △(独立サイト生成が主) | ◎ | ◎(Apache-2.0) | **△** |
| Mermaid | △(汎用 flowchart、語彙なし) | △(click リンクによるページ間疑似ドリルダウン) | ×(単体では描画コードのみ) | ◎(**導入済み**) | ◎ | ◎(MIT) | **○**(描画層として) |
| PlantUML(+ Kroki) | △(汎用図法) | △(`[[url]]` リンク) | × | △(Java/Kroki が必要) | ◎ | ○(選択可・生成物は自由) | **△** |
| D2 | △(汎用図法) | ○(layers/scenarios がネイティブ。静的出力ではリンク遷移) | × | ○(astro-d2、CI に D2 必要) | ◎ | ○(MPL-2.0 / astro-d2 は MIT) | **○**(描画層として) |
| Serverless Workflow / CACAO | ×(実行・セキュリティ特化、人間系語彙なし) | △ | △(JSON Schema はある) | ×(ビューアが重量級) | ○ | ◎(Apache/OASIS) | **×**(設計パターンのみ参考) |
| 自作スキーマ + Content Collections | ◎(必要な語彙を過不足なく定義できる) | ○(データ構造とルーティング次第) | ◎(**提案ツール要件を満たす唯一の案**) | ◎ | —(自前) | ◎ | **◎** |

---

## 考察(筆者の解釈)

以下は事実ではなく、上記調査に基づく解釈・推奨である。

### 単一の既製 DSL では要件を満たせない

- 「図のドリルダウン」だけなら BPMN + bpmn-js が最短だが、本プロジェクトの本丸は「同じデータを提案ツールの知識ベースに使う」ことにある。BPMN XML にはロール定義・成果物定義・適用条件(チーム規模・事業フェーズ)を載せる標準的な場所がなく、知識ベース要件で破綻する
- 逆に SPEM 2.0 は語彙が完璧だがツールが死んでおり、Serverless Workflow / CACAO はドメイン違い。**「開発プロセスを人間向けに記述する、現役でメンテされた交換形式」は 2026 年時点で空白地帯**であり、ここは自作スキーマで埋めるのが合理的と判断する

### 推奨の組み合わせ案

1. **データ層(正)= 自作 YAML スキーマ + Astro Content Collections**
   - 語彙は SPEM 2.0 のメタモデルを簡約して借用する: `Process` → `Phase` → `Activity` → `Task` の 3+1 階層、横串に `Role`、`WorkProduct`(成果物)、`Gate`(DR/承認、承認者ロールと判定基準を持つ)、`Guidance`
   - これは本プロジェクトの調査フレームワーク(ロールモデル/ゲート/成果物/レビュー/3 階層)とそのまま同型になる
   - Zod スキーマで検証し、`npm run check` に統合。将来は JSON Schema としても公開(CACAO 方式)
2. **描画層(第一段)= データ → Mermaid 生成 + click リンク**
   - ビルド時にデータから Mermaid flowchart 文字列を組み立て、フェーズノードに click リンク(またはノードを `<a>` 化できるカスタムコンポーネント)を付けて詳細ページへ遷移する「ページ遷移型ドリルダウン」。astro-mermaid 導入済みのため追加依存ゼロで、Starlight のテーマ切替にも既に追従している
   - 注意点: click 有効化には `securityLevel: 'loose'` が必要。リンクだけならビルド時に SVG 内 `<a>` を生成する自作コンポーネント案も検討余地あり
3. **描画層(将来の拡張)= 差し替え可能にしておく**
   - データと描画を分離しておけば、表現力不足になった時点で D2(layers)、カスタム SVG コンポーネント、あるいは特定プロセスの詳細フローに限定して bpmn-js viewer(ウォーターマーク許容の上でアイランド埋め込み)へ移行できる
4. **参照アーキテクチャ**: structurizr-site-generatr の「単一モデル → ナビゲーション付きサイト」、EPF Composer の「メソッドコンテンツとプロセスの分離」(ロール・成果物定義を再利用部品化し、各プロセスから id 参照する)を設計に取り込む

### この構成のリスク(解釈)

- スキーマ設計を誤ると全ページ生成に波及する。最初はウォーターフォール+スクラムの 2 プロセスだけで小さく検証し、スキーマをバージョニングする(`schemaVersion` フィールドを最初から入れる)ことを推奨する
- Mermaid flowchart は大規模図でレイアウトが崩れやすい。1 図あたりのノード数上限(目安 15 前後)をスキーマ側の設計原則にしたほうがよい

---

## 追加調査が必要な穴

- astro-mermaid 環境での `securityLevel: 'loose'` 設定可否と、click リンクが Starlight のクライアントルーティング/base パス(`/process-compass/`)配下で正しく動くかの実機検証
- SPEM 2.0 仕様書(OMG formal/2008-04-01)本体の精読。今回は二次情報(解説記事・EPF 資料)ベースであり、Phase/Iteration/Milestone まわりの正確な定義は原典未確認
- ISO/IEC/IEEE 12207 のプロセス一覧を自作スキーマに載せる際の粒度設計(12207 は「プロセス → アクティビティ → タスク」の 3 階層で、自作スキーマ案と同型かの確認)
- 「開発プロセスを YAML で定義して静的サイト化」した直接の先行 OSS の再探索(今回の検索では発見できず。GitHub topic 検索など別アングルが必要)
- bpmn-js を Starlight に埋め込んだ場合のダークテーマ対応・パフォーマンスの実測(採用する場合のみ)

## 主要出典一覧

- BPMN / bpmn-js: [bpmn.io drill down ブログ](https://bpmn.io/blog/posts/2022-bpmn-js-900-collapsed-subprocesses) / [bpmn.io License](https://bpmn.io/license/) / [bpmn-js LICENSE](https://github.com/bpmn-io/bpmn-js/blob/main/LICENSE) / [navigated-viewer での drill down(フォーラム)](https://forum.bpmn.io/t/how-can-i-expand-a-collapsed-bpmn-subprocess-to-expanded-with-just-navigated-viewer-package/8255)
- SPEM / EPF: [Eclipse EPF プロジェクト(アーカイブ)](https://projects.eclipse.org/projects/technology.epf) / [eclipse.org/epf](https://www.eclipse.org/epf/) / [Wikipedia: Eclipse process framework](https://en.wikipedia.org/wiki/Eclipse_process_framework) / [SPEM 解説(Modeling Languages)](https://modeling-languages.com/process-software-modeling-spem/)
- Structurizr: [DSL ドキュメント](https://docs.structurizr.com/dsl) / [dynamic view](https://docs.structurizr.com/dsl/cookbook/dynamic-view/) / [parallel の制約](https://docs.structurizr.com/dsl/cookbook/dynamic-view-parallel/) / [structurizr-site-generatr](https://github.com/avisi-cloud/structurizr-site-generatr)
- テキスト DSL: [Mermaid flowchart(click/subgraph)](https://mermaid.js.org/syntax/flowchart.html) / [PlantUML FAQ](https://plantuml.com/faq) / [PlantUML license](https://plantuml.com/license) / [D2 Composition](https://d2lang.com/tour/composition/) / [D2 GitHub](https://github.com/terrastruct/d2) / [astro-d2](https://github.com/HiDeoo/astro-d2) / [Kroki](https://kroki.io/) / [Kroki GitHub](https://github.com/yuzutech/kroki)
- ワークフロースキーマ: [Serverless Workflow](https://serverlessworkflow.io/) / [同 specification](https://github.com/serverlessworkflow/specification/) / [CNCF プロジェクトページ](https://www.cncf.io/projects/serverless-workflow/) / [KIE SW Diagram Editor](https://github.com/apache/incubator-kie-tools/blob/main/packages/serverless-workflow-diagram-editor/sw-editor/README.md) / [CACAO v2.0](https://docs.oasis-open.org/cacao/security-playbooks/v2.0/security-playbooks-v2.0.html) / [CACAO JSON Schemas](https://github.com/cyentific-rni/cacao-json-schemas)
- Astro: [Content collections](https://docs.astro.build/en/guides/content-collections/) / [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) / [データ駆動ページ生成の実例](https://www.raymondcamden.com/2026/01/05/turning-recipe-data-into-an-astro-content-collection)
