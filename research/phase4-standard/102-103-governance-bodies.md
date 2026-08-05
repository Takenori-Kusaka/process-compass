# 調査メモ: 4大会議体と決裁権限マトリクス／デジタル根回し（Issue #102・#103）

- 調査日: 2026-08-05
- 対象 Issue:
  - #102 「4大会議体（IT投資委員会・SteerCo・デザインレビュー会・リリース判定会）の役割と決裁権限マトリクス」
  - #103 「デジタル根回し（非同期事前レビュー期間）の標準化」
- 目的: 会議体ごとの決定権限・判定類型・SLA、および非同期の事前レビュー（デジタル根回し）の設計根拠を一次情報で固める
- 注記: 本メモの「事実」節は出典に基づく記述、「考察」節は本プロジェクトの解釈である。断定できない点は「未確認」と明記する

---

## 1. IT ガバナンスにおける意思決定権限モデル（観点1）

### 1.1 ISO/IEC 38500: Evaluate–Direct–Monitor（EDM）

- ISO/IEC 38500 は「組織のための IT のガバナンス」を扱う規格であり、第3版が 2024 年に発行された。ISO 37000（組織のガバナンス）と整合している
- 統治機関（governing body）の任務は Evaluate（評価）・Direct（指示）・Monitor（監視）の3つである
- 3つの任務は、その下位にあるマネジメント層と相互作用する。マネジメント層は提案と計画を統治機関に上げ、統治機関はそれを評価する。統治機関は報告を通じて IT の実績と方針適合を監視する
- 6原則: Responsibility（責任）、Strategy（戦略）、Acquisition（取得）、Performance（実績）、Conformance（適合）、Human Behaviour（人間行動）

出典:
- https://standards.iteh.ai/catalog/standards/iso/4a0ca982-9f16-4acd-8a14-0a7a72c46416/iso-iec-38500-2024 （ISO/IEC 38500:2024）
- https://quality.arc42.org/standards/iso-38500
- https://www.linkedin.com/pulse/governance-iso-38500-more-detailed-view-dolf-van-der-haven

### 1.2 COBIT 2019: EDM ドメイン（ISACA, 2018–2019）

- COBIT 2019 では、ガバナンス目標が EDM（Evaluate, Direct and Monitor）ドメインに集約される。統治機関が戦略選択肢を評価し、選んだ選択肢について経営層へ指示し、達成状況を監視する
- ガバナンス目標は5つ: EDM01（ガバナンスの枠組みの設定と維持）、EDM02（便益提供の確保）、EDM03（リスク最適化の確保）、EDM04（資源最適化の確保）、EDM05（ステークホルダー・エンゲージメントの確保）
- マネジメント目標（APO/BAI/DSS/MEA）とは階層が分かれる。すなわち「決める場（EDM）」と「回す場（管理ドメイン）」が明示的に分離されている

出典:
- https://www.isaca.org/resources/news-and-trends/industry-news/2019/governing-digital-transformation-using-cobit-2019
- https://www.isaca.org/resources/news-and-trends/industry-news/2019/employing-cobit-2019-for-enterprise-governance-strategy

### 1.3 Weill & Ross の IT ガバナンス・アーキタイプ（MIT CISR, 2004）

- IT ガバナンスの定義は「IT の利用における望ましい行動を促すための、決定権限（decision rights）と説明責任の枠組みを特定すること」である
- 意思決定アーキタイプは6種類である
  - Business Monarchy: 上級経営層が決定
  - IT Monarchy: IT 専門家が決定
  - Feudal: 各事業部が独立に決定
  - Federal: 全社中枢と事業部の組み合わせ（IT の関与有無を問わない）
  - IT Duopoly: IT グループともう1グループの2者
  - Anarchy: 個人または小集団による孤立した決定
- 決定領域は5つである: IT 原則、IT アーキテクチャ、IT インフラ、業務アプリケーション・ニーズ、IT 投資と優先順位付け
- ガバナンス設計は「5つの決定領域 × アーキタイプ」のマトリクスとして表現する。領域ごとに、さらに「インプット（意見を出す者）」と「デシジョン（決める者）」を分けて記述する

出典:
- https://cio-wiki.org/wiki/Weill_Ross_Framework
- https://sloanreview.mit.edu/article/a-matrixed-approach-to-designing-it-governance/
- https://www.researchgate.net/publication/236973378_IT_Governance_How_Top_Performers_Manage_IT_Decision_Rights_for_Superior_Results

### 1.4 考察（#102 への含意）

- IT 投資委員会は Weill & Ross でいう「IT 投資と優先順位付け」領域の decision 権限保持者と位置づけると整理しやすい。多くの日本企業では Business Monarchy か Federal に相当すると考えられる（実データは未確認）
- 「インプット」と「デシジョン」を分離する記法は、決裁権限マトリクスの列設計（起案・審議・承認・報告先）にそのまま使える

---

## 2. Stage-Gate におけるゲートキーパー会議体（観点2）

- Stage-Gate は Robert G. Cooper が実証研究から構築した新製品開発の枠組みであり、ステージ（作業）とゲート（判定点）を交互に並べる
- ゲート判定は4類型である
  - Go: 次ステージへ進める水準に達している
  - Kill: 開発を続ける水準になく、即時に中止する
  - Hold: 現時点では進められないが中止するほどではなく、将来の再開に向けて保留する
  - Recycle: 一定の修正を条件に、前ステージへ差し戻して再提出させる
- ゲートキーパーは、次ステージで必要になる資源を保有・統制する複数機能の上級管理者であり、ゲートごとに事前定義された固定メンバーである
- ゲート基準には「主要タスクが完了しているか」「必要な成果物が揃っているか」を問う Yes/No 形式の必須条件が含まれる
- Go 判定では、次ステージの資源（予算・要員・人日）、日程、主要成果物、次ゲートの開催日を同時に確定する
- 早期ゲートでは相当数の案件が Kill されることが前提として設計される

出典:
- https://www.stage-gate.com/blog/the-stage-gate-model-an-overview/
- https://onlinelibrary.wiley.com/doi/full/10.1002/9781444316568.wiem05014 （Cooper, 2010）
- https://www.toolshero.com/innovation/stage-gate-process/
- https://umbrex.com/resources/frameworks/project-management-frameworks/stage-gate-phase-gate/

判定所要時間の実務基準について: Stage-Gate 公式資料の範囲では「ゲート判定は会議中に結論を出し、資源配分まで確定する」ことが要件として書かれているものの、「何時間以内」「何営業日以内」という数値基準は確認できなかった（未確認）。

### 考察（#102 への含意）

- 判定を Go / Kill / Hold / Recycle の4値にすることで、「継続」と「差し戻し」と「凍結」を混同しない。日本企業の会議体では「継続扱いで宿題」に流れやすく、Kill が事実上使われない点が論点になる
- 「Go の条件に次ゲート日と資源配分を含める」設計は、会議体を"報告会"に劣化させない歯止めとして有効である

---

## 3. 決裁権限マトリクス（DoA）と日本企業の稟議（観点3）

### 3.1 一般的な構成

- 職務権限規程では、金額の閾値によって決裁者を切り替える。例として「10万円未満は課長決裁、それ以上は役員決裁」といった段階設定が挙げられる
- 最終決裁者を明確に特定することが、差し戻しと再申請を減らす鍵である
- 大企業では、業種・規模に応じて数十から数百種類の承認パターンが権限規程から派生する
- ワークフローシステムによる電子化の効果は、経路の自動判定、変更履歴の保持、申請漏れの防止、複数拠点での所要時間短縮である
- 電子化の障壁は、権限規程が複雑すぎて既存のワークフロー製品では表現できない点にある。「自社の規程は特殊で電子化できない」という認識のまま紙運用を続ける企業が残る
- 職務権限規程の新設・改定時によく起きる問題として、「実現したい承認・決裁の流れを社内のワークフローシステムが表現できない」ことが挙げられている

出典:
- https://kickflow.com/blog/duties_and_authority
- https://biz.moneyforward.com/payroll/basic/60675/
- https://www.createwebflow.jp/workflow-lab/approval-route.html
- https://it-notes.stylemap.co.jp/word/word%E3%81%A7%E4%BD%9C%E3%82%8B%E7%A8%9F%E8%AD%B0%E3%83%BB%E6%B1%BA%E8%A3%81%E6%A8%A9%E9%99%90%E8%A6%8F%E7%A8%8B%EF%BD%9C%E9%87%91%E9%A1%8D%E5%88%A5%E3%81%AE%E6%89%BF%E8%AA%8D%E8%80%85%E4%B8%80/
- 実物の規程例（公開文書）: https://www.kyoto-u.ac.jp/sites/default/files/embed/jaaboutorganizationotherrevisiondocumentspastzai-1-4-20-2.pdf （京都大学 職務権限一覧表）

### 3.2 稟議制度と根回し（日本の実態）

- 稟議書（稟議書＝ringisho）は、問題、推奨する打ち手、想定される影響、必要資源、リスクを文書化するボトムアップの承認様式である
- 根回しは、公式の会議・提案の前に行う非公式の事前調整であり、関係者が公開の場で対立を表面化させずに懸念を表明できるようにする仕組みである
- 根回しは「提案前の非公式な合意形成」、稟議は「提案後の文書化された説明責任」として、時間軸で役割が分かれる
- 学術的には、集団を合意へ導く調整役（coordinator/facilitator）の存在が根回し型意思決定の中核であると整理されている

出典:
- https://onlinelibrary.wiley.com/doi/abs/10.1002/9781118339893.wbeccp380 （Machizawa, "Nemawashi", Wiley）
- https://www.sciencedirect.com/science/article/abs/pii/0167923692900049 （Decision Support Systems, 1992）
- https://www.academia.edu/11695950/Ringi_System_The_Decision_Making_Process_in_Japanese_Management_Systems_An_Overview
- https://globis.eu/nemawashi-in-japanese-culture/

### 3.3 考察（#102・#103 への含意）

- 決裁権限マトリクスの軸は最低3軸が必要である: 金額閾値 × リスク区分（不可逆性・顧客影響・セキュリティ）× 決裁者階層
- 根回しは「悪しき慣行」ではなく、非同期の事前レビューとして形式化できる実務である。#103 の「デジタル根回し」は、非公式・不可視だった事前調整を、記録が残る非同期レビュー期間として制度化する試みと位置づけられる
- 建前と実運用の乖離: 会議体の議事録上は会議当日に決定した形をとるが、実際には根回し段階で結論が固まっている。この乖離を「悪」とせず、事前レビュー期間を正規のプロセス段階として明記する方が実態に合う（本プロジェクトの解釈）

---

## 4. デザインレビュー会（観点4）

### 4.1 定義と段階

- デザインレビュー（DR）は、JIS Z 8115 において「設計段階で、設計が要求事項を満たしているかどうかを評価し、問題点を識別し、解決策を提案するために実施する検討」と定義される
- 製造業の典型的な段階構成は DR1〜DR4 である
  - DR1: 企画審査
  - DR2: 構想審査（開発計画と構想を評価し、詳細設計へ進む前に設計案を確定させる）
  - DR3: 詳細審査（部品・製造プロセス・図面・仕様書の完成度を確認し、量産設備での試作可否を判断する）
  - DR4: 試作評価（試作品の性能評価結果と量産時の課題をレビューする。結果によっては再試作となる）

出典:
- https://www.monodukuri.com/gihou/article/4732
- https://www.tokaimodel.com/news/1510/
- https://skillnote.jp/knowledge/designreview/
- https://www.fujifilm.com/fb/ja/solutions/columns/monozukuri-3522

注記: JIS Z 8115 の原文（日本産業標準調査会 JISC のデータベース）による一次確認は未実施である（未確認）。上記は二次情報による引用である。

### 4.2 ISO 9001:2015 8.3.4 における レビュー／検証／妥当性確認

- 8.3.4「設計・開発の管理」は、要求事項を満たすことを確実にするため、レビュー・検証・妥当性確認の活動を含めることを求める
- ISO 9001:2008 では 7.3.4（レビュー）・7.3.5（検証）・7.3.6（妥当性確認）と3項に分かれていたものが、2015 年版で 8.3.4 に統合された。要求の意図は変わっていない
- 3者の関係は次のとおりである
  - レビュー: 設計・開発の節目で行う審査・確認活動の総称
  - 検証（verification）: アウトプットがインプット要求を満たすことをデータで示す活動。量産試作、環境試験、信頼性試験、耐久試験、性能測定などが典型例
  - 妥当性確認（validation）: 意図した用途・使用条件で要求を満たすことの確認
- 複雑でない製品・サービスでは、検証と妥当性確認を1つの活動にまとめてよい

出典:
- https://iso.iwa-k.net/iso9001-2015/iso90012015%E3%80%8C8-3-%E8%A3%BD%E5%93%81%E5%8F%8A%E3%81%B3%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E8%A8%AD%E8%A8%88%E3%83%BB%E9%96%8B%E7%99%BA%E3%80%8D%E3%81%AE%E8%A7%A3%E8%AA%AC%EF%BC%88-2/
- https://iatf-iso.net/iso9001-y/834.html
- https://qcplanets.com/practice/iso/design/

注記: ISO 9001:2015 の規格本文は有償であり、原文の直接引用は行っていない。

### 4.3 考察

- 「レビュー＝会議体」「検証＝テスト」「妥当性確認＝実利用条件での確認」と対応づけると、DR 会と QA/テスト工程の責任境界が引ける
- DR 会が検証エビデンスの読み合わせに終始すると、レビュー本来の「問題点の識別と解決策の提案」が失われる。DR 会のインプットに検証結果を事前配布し、会議は判定と論点に絞る設計が妥当である（本プロジェクトの解釈）

---

## 5. リリース判定会（変更承認）（観点5）

### 5.1 ITIL 4 Change Enablement の3分類

- Standard change: 低リスクで反復可能な、事前承認済みの変更。都度の CAB 関与は不要である
- Normal change: standard にも emergency にも該当しない変更。完全なアセスメント、リスク分析、CAB 承認、スケジューリング、テスト、文書化を要する
- Emergency change: 重大インシデント・セキュリティ問題・重大な事業リスクへの対処として即時実施する変更。承認は簡略化した緊急手順を用い、実施後レビューを行う
- ITIL 4 では、すべての変更が CAB のレビューを要するわけではないと明記される。低リスク変更や standard change は自動承認、または委任された change authority による承認が可能である
- ITIL 4 は、変更権限を事業ステークホルダーやピアのレベルへ分散させ、独立の委員会ではなく通常のワークフローに変更管理を組み込むことを推奨する

出典:
- https://itsm.tools/change-enablement/
- https://www.atlassian.com/itsm/change-management
- https://www.novelvista.com/blogs/it-service-management/itil-change-types
- https://virima.com/blog/understanding-itil-types-of-changes-a-comprehensive-guide

注記: ITIL 4 の公式書籍（PeopleCert/AXELOS）原文の直接確認は未実施である（未確認）。

### 5.2 CAB ボトルネック批判と DORA の実証結果

- DORA（2019 State of DevOps Report）は、CAB や上級管理者といった外部組織の承認を要する形式的な変更管理プロセスが、ソフトウェア・デリバリー性能に負の影響を与えることを示した
- 外部承認は、リードタイム・デプロイ頻度・復旧時間と負の相関を示し、変更失敗率とは無相関であった
- 外部承認を用いる組織は、低パフォーマー群に属する確率が 2.6 倍高いと報告された
- 「より形式的な承認プロセスが変更失敗率の低下に結びつく」という仮説を支持する証拠は見つからなかった
- DORA の推奨は、開発プロセス内のピアレビューによる承認と、悪い変更を早期に検出・防止・修正する自動化（継続的テスト、CI、包括的な監視）の組み合わせである
- CAB の役割は「ゲートキーパー」から「プロセス設計者」へ転換すべきとされる
- よくある落とし穴として、すべての変更を同一プロセスで扱うことでリスク差に対応できなくなる点が挙げられる

出典:
- https://dora.dev/capabilities/streamlining-change-approval/
- https://dora.dev/research/2019/dora-report/
- https://dora.dev/research/2019/dora-report/2019-dora-accelerate-state-of-devops-report.pdf
- https://octopus.com/blog/change-advisory-boards-dont-work

### 5.3 考察（#102 への含意）

- リリース判定会は「全リリースを通す関門」ではなく、「リスク区分の判定と、standard change カタログの維持」を担う会議体として定義するのが、DORA と ITIL 4 の双方に整合する
- 決裁権限マトリクス上は、standard change は自動承認（会議体を通さない）、normal change は委任された change authority、重大変更のみ判定会という3層構造が妥当である（本プロジェクトの解釈）

---

## 6. 非同期意思決定の実務（観点6・#103 の中核）

### 6.1 Amazon: 6ページ・ナラティブと silent reading

- Amazon は PowerPoint を用いず、ナラティブ構造の6ページ・メモを書き、会議冒頭で全員が黙読する「study hall（自習室）」形式をとる
- 2017 年の株主への手紙では、メモに著者名を書かない慣行（"The memo is from the whole team."）が述べられている
- 優れたメモは「書かれ、書き直され、同僚に共有して改善を求め、数日寝かせ、頭を切り替えて再度編集される」と記述されている

出典:
- https://www.aboutamazon.com/news/company-news/2017-letter-to-shareholders （2017年）
- https://s2.q4cdn.com/299287126/files/doc_financials/annual/Amazon_Shareholder_Letter.pdf

### 6.2 Amazon: High-Velocity Decision Making（2016年 株主への手紙）

- 可逆な決定（two-way doors）には軽量なプロセスを適用する: "Many decisions are reversible, two-way doors. Those decisions can use a light-weight process."
- 大半の決定は「欲しい情報の 70% 程度」で下すべきであるとされる
- 合意に至らない場合の作法として "disagree and commit" が示される。Bezos 自身が Amazon Studios の企画に異議を述べつつ、チームを信頼して disagree and commit と応じた事例が挙げられている
- 根本的な不一致は、消耗による決着（decision by exhaustion）ではなく、速やかなエスカレーション（quick escalation）で解くべきとされる
- 2015 年の手紙では Type 1（不可逆、one-way door）と Type 2（可逆、two-way door）の区別が示され、組織が大きくなるほど Type 2 に重量級プロセスを適用しがちであり、その結果は「遅さ、思慮に欠けるリスク回避、実験不足、発明の減少」であると述べられている

出典:
- https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders （2016年）
- https://s2.q4cdn.com/299287126/files/doc_financials/annual/2015-Letter-to-Shareholders.PDF （2015年）

Amazon の Leadership Principle「Have Backbone; Disagree and Commit」の定義文は「異なる意見があるときは、たとえ不快で消耗する場面でも敬意をもって決定に異議を唱える義務がある。信念を持ち、粘り強い。社会的な結束のために妥協しない。決定が下されたら、全面的にコミットする」である。

出典: https://en.wikipedia.org/wiki/Disagree_and_commit （公式定義の転載。Amazon 公式ページの直接確認は未実施）

### 6.3 GitLab / Automattic

- GitLab はハンドブック・ファーストを掲げ、コミュニケーションの既定を文書化された書き言葉に置く。All-Remote 配下に「Asynchronous communication for remote work」「The complete guide to asynchronous and non-linear working」「The importance of a handbook-first approach to communication」の各節を持つ
- GitLab の価値観には Bias for action、Everything is in draft、Boring solutions が含まれ、DRI（Directly Responsible Individual）モデルで単独の意思決定者を置く
- Automattic は P2（社内ブログ）を用い、意思決定プロセス自体を非同期・公開で行う。チームが「決定は非同期かつオープンに下せる」と学ぶと、会議と通話の必要性が大幅に減るとされる
- P2 の意思決定ガイドは、単一スレッドで決着する「スポット型」と、洗練に時間を要する「反復型」を区別する。決定者は一定期間の経過後に分析・評価を行う
- P2 ガイドでは consensus（合意）と consent（同意・反対がないこと）を使い分けている。ただし「沈黙＝同意」の明示規定は当該ページには確認できなかった（未確認）

出典:
- https://handbook.gitlab.com/handbook/company/culture/all-remote/asynchronous/
- https://handbook.gitlab.com/handbook/values/
- https://p2guides.wordpress.com/p2-decision-making/decision-making-with-p2/
- https://p2guides.wordpress.com/p2-decision-making/how-to-make-decisions-in-p2/
- https://distributed.blog/2020/03/27/remote-work-tools-p2-communication/

### 6.4 RFC / ADR プロセス

Rust RFC（一次情報）:

- 手順は、RFC リポジトリのフォーク → テンプレートに沿った Markdown 作成 → PR 提出 → ファイル名を PR 番号に更新 → 担当サブチームによるトリアージと担当割当 → 合意形成とフィードバック統合 → Final Comment Period（FCP）への移行、である
- FCP は 10 暦日間続き、最低 5 営業日は開かれている必要がある。全ステークホルダーに異議申立ての機会を与えるための期間である
- FCP 開始前に、サブチームの全メンバーの署名（sign off）が必要である
- 最終的に RFC はマージまたはクローズされる

出典: https://rust-lang.github.io/rfcs/

IETF RFC 7282（"On Consensus and Humming in the IETF", 2014年6月）:

- rough consensus は「すべての論点が扱われた（addressed）ときに成立する。必ずしも受け入れられた（accommodated）必要はない」
- ハミングは投票ではなく議論の出発点である: "Humming should be the start of a conversation, not the end"
- 沈黙は同意ではない。未対応の異議が残る限り、誰も新たに異議を追加しなくても rough consensus は成立しない
- 少数派の技術的異議は多数決で無視できない。"If the open issue hasn't been addressed, there's still no consensus"
- 投票を避ける理由は、ゲーミング・政治的妥協・少数意見の軽視を招き、技術的により良い結果から遠ざかるためである

出典: https://www.rfc-editor.org/rfc/rfc7282.txt

Apache Software Foundation の投票と lazy consensus（一次情報）:

- 投票は -1 から +1 の数値で表現する。-1 が「否」、+1 が「可」である。+0 は「強い意見はないが、これで構わない」、-0 は「邪魔はしないが、やらない方がよいと思う」を意味する
- lazy consensus とは「沈黙は同意を与える（silence gives assent）」ことの宣言にすぎない
- 実装例: "The patch below fixes bug #8271847; if no-one objects within three days, I'll assume lazy consensus and commit it."（3日以内に異議がなければ lazy consensus とみなしてコミットする）
- 投票期間は、地理的な所在を問わず関係者全員が参加できるよう、原則として最低 72 時間開いておくべきである
- 有資格者による -1 はコード変更提案を停止させる（veto）。恣意的な veto を防ぐため、投票者は変更が不適切である理由を示す技術的な正当化を添えなければならない。正当化のない veto は無効であり、効力を持たない

出典:
- https://www.apache.org/foundation/voting.html
- https://community.apache.org/committers/decisionMaking.html
- https://community.apache.org/blog/how_apache_projects_use_consensus.html

ADR（Architecture Decision Records）:

- Michael Nygard のブログ記事 "Documenting Architecture Decisions"（2011年11月15日, Cognitect）が起点である
- 原テンプレートは Status フィールドを持ち、値は proposed / accepted / deprecated / superseded である。決定は書き換えず、新しい ADR で置き換える運用が基本である

出典:
- https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html
- https://adr.github.io/

---

## 7. サイレント承認（ラバースタンプ）防止（観点7）

### 7.1 沈黙の扱いの2系統

一次情報を突き合わせると、沈黙の扱いには相反する2つの規範が存在します。

- 「沈黙＝同意」型: Apache の lazy consensus は明示的に "silence gives assent" を採用する。期限（例: 3日、投票なら最低72時間）を切って異議がなければ可決とする
- 「沈黙≠同意」型: IETF RFC 7282 は、未対応の異議が残る限り合意は成立しないとし、沈黙を同意とみなさない立場をとる。ハミング（場の空気の測定）は議論の起点であって結論ではない

両者の違いは対象の可逆性にあります。Apache の lazy consensus は個別パッチなど可逆性の高い変更を対象とし、IETF は標準仕様という不可逆性の高い決定を対象としている点が異なります（本プロジェクトの解釈）。

### 7.2 コードレビューにおけるラバースタンプ問題

- ラバースタンプとは、実質的なレビューを行わずに PR を承認する行為であり、差分を一瞥して 30 秒以内に Approve を押すような挙動を指す。品質管理の実体がないまま外形だけが整う
- 発生条件として、PR が大きすぎる場合、出荷への時間的圧力がある場合、レビュアーがそのコードをレビューする資格がないと感じる場合が挙げられる
- Google の内部研究では 400 行未満の変更が有意に高品質なレビューを受ける。Microsoft のデータも同様の傾向を示す。SmartBear の研究では 400 行を超えると欠陥検出密度が急落する
- 近年の研究では、不安（anxiety）が先延ばしやラバースタンプといった回避行動と強く関連することが示されている
- コードレビューのカバレッジ、参加度（participation）、専門性（expertise）はソフトウェア品質と明確な関連を持つ

出典:
- https://research.google/pubs/modern-code-review-a-case-study-at-google/ （Sadowski et al., ICSE-SEIP 2018）
- https://sback.it/publications/icse2018seip.pdf
- https://dl.acm.org/doi/10.1145/3585004 （Modern Code Reviews—Survey of Literature and Practice, TOSEM）
- https://dev.to/rahulxsingh/code-review-best-practices-the-complete-guide-for-engineering-teams-2026-52a4
- https://www.awesomecodereviews.com/research/code-review-research-overview/

### 7.3 コメント必須化・veto の正当化義務

- Apache は veto に技術的正当化を義務づけ、正当化のない veto を無効とする。これは「反対側」にコメント必須を課す設計である
- IETF は「論点が扱われた（addressed）こと」を合意の条件とする。これは「賛成側」に対して、異議へ応答したエビデンスを求める設計である
- Amazon の "Have Backbone; Disagree and Commit" は、異議を述べることを義務として明文化する。社会的結束のための妥協を明示的に否定する

出典: 上記6.2・6.4 と同じ

### 7.4 考察（#103 への含意）

- ラバースタンプ対策は「承認者を増やす」ではなく「1回の判断対象を小さくする」が最も実証的な裏づけを持つ（400行の知見）
- 会議体の事前レビューでも同様に、レビュー単位（1論点＝1スレッド）を小さく切ることが有効と考えられる（本プロジェクトの解釈）
- 沈黙の扱いは、決定の可逆性で切り替える設計が妥当である。可逆（two-way door）は lazy consensus、不可逆（one-way door）は明示的な承認とコメント必須、という対応づけが Amazon の Type 1/Type 2 とも整合する（本プロジェクトの解釈）

---

## 8. 判定 SLA と自動エスカレーション（観点8）

### 8.1 一次情報として確認できた期限規定

| 主体 | 期限 | 期限到来時の扱い | 出典 |
| --- | --- | --- | --- |
| Apache（投票） | 最低 72 時間 | 期間内に参加できるよう開放を継続 | https://www.apache.org/foundation/voting.html |
| Apache（lazy consensus 例） | 3 日 | 異議がなければ可決とみなしてコミット | 同上 |
| Rust RFC（FCP） | 10 暦日かつ最低 5 営業日 | 期間終了後にマージまたはクローズ | https://rust-lang.github.io/rfcs/ |

### 8.2 承認ワークフローにおける SLA エスカレーション設計（実務ツール側）

- 自動エスカレーションは、事前設定した SLA・時間閾値を超過した時点で、承認依頼を指定の代理者または上位者へ自動的に再ルーティングする仕組みである
- 一般的な間隔として、高優先度は 24 時間、標準は 48 時間までが用いられる
- 設計の4本柱は、測定可能な SLA、段階的なエスカレーション経路、完全な追跡可能性（traceability）、ガバナンス統制である
- エスカレーション経路は多段かつ漸進的に構成し、一次担当 → バックアップ → 管理者のキューへ時間経過に応じて自動的に送る
- リマインドの規定回数に応答がない場合にエスカレーションする実装例がある（Oracle Enterprise Data Management Cloud）

出典:
- https://www.sirion.ai/library/contract-insights/auto-escalation-stalled-approvals/
- https://snohai.com/sla-escalation-workflows/
- https://precoro.com/blog/approval-sla/
- https://docs.oracle.com/en/cloud/saas/enterprise-data-management-cloud/dmcaa/managing_request_approvals_100x0627b715.html
- https://www.conductorone.com/blog/how-sla-escalation-policies-work-in-conductorone/

注記: 「SteerCo が 48 時間以内に判定する」といった、企業の運営委員会レベルでの SLA を明文化した一次情報は発見できなかった（未確認）。上記の 24/48 時間はワークフロー製品ベンダーの一般的な設定例であり、統治会議体の実例ではない。

---

## 9. 階層構造の整理（図解用の骨格）

### 9.1 全体プロセス階層（4会議体の位置づけ）

- 統治層（Evaluate–Direct–Monitor / COBIT EDM）
  - IT 投資委員会: ポートフォリオ選定と資源配分。Weill & Ross の「IT 投資と優先順位付け」領域の決定権限
  - SteerCo（運営委員会）: 個別案件の Go/Kill/Hold/Recycle 判定と、権限を超えた課題の裁定
- 実装層（開発プロセス内）
  - デザインレビュー会: 設計の要求適合性の審査（ISO 9001 8.3.4 のレビュー）。DR1〜DR4 に相当する段階判定
  - リリース判定会: 変更のリスク区分判定と、standard change カタログの維持（ITIL 4 change enablement）
- 作業層
  - ピアレビュー（PR レビュー）と自動化された検証。DORA が推奨する承認の主経路

### 9.2 各会議体の共通ワークフロー（フェーズ内）

1. 起案: 提案文書（ナラティブ／稟議書／RFC）の作成
2. 事前レビュー期間（デジタル根回し）: 非同期でコメント・異議を集約。期限を明示する
3. 論点の解決: 異議への応答を文書に反映（addressed の状態を作る）
4. 判定: 会議当日は黙読 → 論点討議 → 4値判定（Go / Kill / Hold / Recycle）
5. 記録: 決定と根拠を ADR / 決定ログに残す。Status は proposed → accepted → superseded
6. 監視: 便益実現の事後レビュー（COBIT EDM02）

### 9.3 個別作業レベル

- 提案文書のテンプレート適用
- レビュアー指名と期限設定
- 異議への1件ずつの応答記録
- 判定結果の反映と次ゲート日の確定

---

## 10. 未確認・追加調査が必要な点

- ISO/IEC 38500:2024 および ISO 9001:2015 の規格本文（有償）の直接引用
- JIS Z 8115 の原文における DR の定義（JISC データベースでの一次確認）
- ITIL 4 公式書籍における change authority の正式な定義と委任基準
- Stage-Gate におけるゲート判定の所要時間の数値基準（公式資料では未発見）
- 日本企業の IT 投資委員会・SteerCo における実際の開催頻度、判定 SLA、金額閾値の統計（JUAS 企業IT動向調査に該当データがあるかは未確認）
- Amazon 公式サイトでの Leadership Principles の原文（今回は二次情報経由）
- GitLab ハンドブックの非同期コミュニケーション本文（取得できたのは目次構造のみ）
- 「レビュー不参加を承認とみなす／差し戻す」を明文化した企業の社内規程の実例
