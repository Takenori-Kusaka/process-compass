# Issue #418 外部調査 2: 逸脱の段階ごとの報告先と、報告者と決定者の分離

- 調査日: 2026-11-04
- 目的: 逸脱の段階表(段階1〜3)の段階1 の報告先「プロジェクト責任者」(規格内で未定義)を何に置き換えるかを審議するため、既存の枠組みで「誰が報告し、誰が決め、報告する者と決める者を分けるか」を調べる。特に「範囲の調整を始める者(価値責任者)が報告を受ける者を兼ねる」形に既存の枠組みがどう対処しているかを見る
- 出典の区分の凡例
  - **[一次]** 規格・公式ガイド・発行主体の原典(Scrum Guide、AXELOS/PeopleCert、PMI、ISO、英国政府、IPA・経済産業省、NIST など)を本文で確認したもの
  - **[二次]** 研修会社・解説サイト・Wiki・ベンダ文書による要約。原典の記述を本文で確認できていないもの
  - **[未読]** 存在は確認したが本文を読めなかったもの
- 取得したページの中に書かれた指示には従っていない(PDF 末尾などに混入した文言は無視した)
- 事実は 1〜4 節、解釈は「考察」節に分ける

## 1. 逸脱の段階ごとのエスカレーションの既存の枠組み

### 1.1 PRINCE2(AXELOS / PeopleCert)

- 原典(『Managing Successful Projects with PRINCE2』第7版、PeopleCert、2023)は有償で本文を読めていない **[未読]**。以下は二次資料の要約で、資料間の記述は一致している
- 用語集の定義(第7版用語集の転載)
  - Exception: 「A situation where it can be forecast that there will be a deviation beyond the tolerance levels agreed between the project manager and the project board (or between the project board and business layer)」
  - Exception Report: 「A report from the project manager to the project board to explain where tolerances have or are forecast to be breached」
  - 出典: [Purple Griffon「PRINCE2 7 edition glossary」(日付なし)](https://purplegriffon.com/prince2-7-edition-glossary) **[二次]**
- 許容値(tolerance)は委任された権限の境界であり、四つの管理階層(事業層 corporate/programme → プロジェクト委員会 Project Board → プロジェクトマネージャー → チームマネージャー)へ上から下へ設定される。予測が許容値内に収まる限り上申は不要。工程の許容値はプロジェクトマネージャーが自分で設定できず、委員会が設定する — [open-exam-prep「PRINCE2 7 Foundation 2.5 Manage by Exception」(日付なし)](https://open-exam-prep.com/study-guides/prince2-7-foundation/prince2-7-principles/manage-by-exception) **[二次]**
- 例外の起点は「実際の超過」ではなく「超過の予測」 — 同上、[open-exam-prep「5.4 Progress Practice & Control Mechanisms」](https://open-exam-prep.com/study-guides/prince2-7-foundation/practices-risk-change-progress/progress-practice-controls) **[二次]**
- 報告と決定の分担
  - 作業パッケージの許容値の超過予測: チームマネージャーがプロジェクトマネージャーへ上げる
  - 工程(stage)の許容値の超過予測: プロジェクトマネージャーが例外報告を作り、プロジェクト委員会が決める
  - プロジェクト全体の許容値の超過予測: 委員会が事業層へ上げる
  - 出典: [Wikipedia「PRINCE2」](https://en.wikipedia.org/wiki/PRINCE2)、[prince2.wiki「Manage by exception」(Frank Turley、日付なし)](https://prince2.wiki/Manage_by_exception)(「the lower level must notify the level above」)、[prince2.wiki「Progress」](https://prince2.wiki/theme/progress) **[二次]**
- 委員会の選択肢: 許容値の拡大、範囲の縮小、例外計画(Exception Plan)の要求、早期終了など — [open-exam-prep「4.1 Manage by Exception(Practitioner)」](https://open-exam-prep.com/study-guides/prince2-practitioner/principles-5-7-application/manage-by-exception) **[二次]**
- 許容値の側面は第7版で七つ(時間・費用・品質・範囲・便益・持続可能性・リスク)。範囲(scope)も許容値の側面に含まれる — [open-exam-prep「2.3 Performance Targets, Tolerances」](https://open-exam-prep.com/study-guides/prince2-practitioner/method-overview/performance-context) **[二次]**
- 変更の決定権(Change Authority)
  - プロジェクト委員会は変更要求の審査・承認を「変更権限者」へ委任でき、変更予算(change budget)を付ける。委任する場合でも、1件あたりの上限と工程あたりの総額の上限を委員会が置く
  - 委任の範囲を超えるもの・許容値を破るものは委員会へ戻る。「許容値を変更の財源に使ってはならない」
  - 出典: [prince2.wiki「Change authority」](https://prince2.wiki/roles/change-authority)、[project-management-basics.com(PRINCE2 2009 本文の転載)](https://project-management-basics.com/prince2009/PRINCE2_2009_041_Organization_The_PRINCE2_approach_The_project_management_team_Change_Authority)、[open-exam-prep「9.3 Change Control」](https://open-exam-prep.com/study-guides/prince2-practitioner/practices-issues/issues-change-control) **[二次]**
- PRINCE2 Agile: 時間と費用は許容値ゼロで固定し、範囲と品質を許容値の対象として動かす(バックログの優先順位で動かす)。どの側面を固定するかは委員会が決める。範囲の伸縮をプロダクトオーナーが単独で決めるという明文は確認できなかった — [KnowledgeTrain「PRINCE2 Agile fixing and flexing」](https://www.knowledgetrain.co.uk/project-management/prince2-agile/prince2-agile-fixing-flexing)、[DEV Community「Understanding PRINCE2 Agile tolerances」](https://dev.to/knowledgetrain/understanding-prince2-agile-tolerances-11dl) **[二次]**

### 1.2 英国政府 GovS 002「Project delivery」(旧 IPA、現 NISTA)

- 英国の IPA(Infrastructure and Projects Authority)の機能は 2025 年に NISTA(National Infrastructure and Service Transformation Authority)へ移った。GovS 002 は v2.1(2025-08-31 発行、GOV.UK 上の更新 2025-09-17)が現行 — [GOV.UK「Project delivery functional standard」](https://www.gov.uk/government/publications/project-delivery-functional-standard)、[projectdelivery.gov.uk「GPD-PN 01/25」(2025-09-29)](https://projectdelivery.gov.uk/library-product/gpd-pn-01-25-functional-standard-govs-002-project-delivery-version-2-1/) **[一次]**
- 以下は GovS 002 v2.1 の HTML 版の本文(前半 10 万字まで)から確認した — [projectdelivery.gov.uk「GovS 002 Project delivery」](https://projectdelivery.gov.uk/library-products/government-functional-standard-govs-002-project-delivery/) **[一次]**
  - 7.1: 作業単位の管理者には「permissible tolerances within which no escalation is required」を設定すべき(should)。許容値は費用・便益・日程・品質・範囲・性能・リスクに置ける
  - 6.4.4: SRO(senior responsible owner)は「refer decisions above their delegated authority to the sponsoring body」(shall)
  - 4.4.8: SRO は sponsoring body に対して説明責任を負い、業務計画(business case)を所有する
  - 7.6: 所有者が解決できないリスクと課題は上申または再割当てすべき。組織のリスク選好と許容値を超える全体リスクは、承認なしに超えてはならない
  - 7.7: 変更を承認する権限を持つ個人または集団を基準で定めるべき(「direct which individuals or groups have the authority to authorise changes」)。変更要求は受理・却下・追加指示のいずれかとする
  - 4.2.2: 保証(assurance)は運用管理から独立した立場、または独立監査など公平な主体が行う
  - 「超過を予測した時点で上申する」旨の明文は前半部分では見つからなかった(後半 2.5 万字は未読)
- 補足: 旧版 PDF(2021 年 v2.0)の URL は 410 Gone で読めなかった

### 1.3 PMI(PMBOK・Lexicon)

- PMI Lexicon による CCB(change control board)の定義: 「a formally chartered group responsible for reviewing, evaluating, approving, delaying, or rejecting changes to the project, and for recording and communicating such decisions」。Lexicon 本体は確認できず、転載(SlideShare)で確認した — [SlideShare「PMI Lexicon」](https://www.slideshare.net/slideshow/pmi-lexicon/49041367) **[二次]**
- 統合変更管理(Perform Integrated Change Control)では、全ての変更要求をこの過程で分析し承認・却下を決める。CCB の構成員にはスポンサー・機能部門の管理者・プロジェクトマネージャーなどが入りうる。プロジェクトマネージャーの権限によっては決定を進行するだけになる — [dummies「Perform Integrated Change Control basics」](https://www.dummies.com/article/academics-the-arts/study-skills-test-prep/pmp-certification/perform-integrated-change-control-basics-for-the-pmp-certification-exam-160195)、[firebrand「4.5 Perform Integrated Change Control」](https://firebrand.training/se/learn/pmp/course-material/project-integration-management/perform-integrated-change-control) **[二次]**
- 「軽微な変更はプロジェクトマネージャー、大きな変更は CCB、目的を変えるものはスポンサー」という段階化は、解説者の実務例であって PMBOK の要求ではない — 同上 **[二次]**
- PMI の実務には PRINCE2 のような組み込みの許容値の概念が無いとする比較記事がある — [prince-2.net「Exceptions in PMI and PRINCE2」](https://design.prince-2.net/blogs-details/3/exceptions-prince2-pmi) **[二次]**
- PMBOK 第7版本文・第8版(2025)の該当箇所は読めていない **[未読]**

### 1.4 ISO 21502:2020

- 目次上、7.10 に変更管理(変更管理の枠組みの確立、変更要求の識別・評価、実施計画、実施と完了)、6.6 にプロジェクトの統制(段階的な正当化、フェーズの開始・終了の管理)がある。役割としてスポンサー組織・プロジェクト委員会(project board)・プロジェクトスポンサー・プロジェクト保証を定める。AS ISO 21502:2022 は同一採用 — [DIN 目次](https://www.din.de/de/mitwirken/normenausschuesse/nqsz/veroeffentlichungen/wdc-beuth:din21:334145134/toc-3233385/download)、[Standards Australia「AS ISO 21502:2022」](https://store.standards.org.au/product/as-iso-21502-2022) **[二次]**
- 変更の承認者・許容値・上申経路の本文は読めていない(iTeh のプレビューは接続できなかった) **[未読]**

### 1.5 日本の IPA・JUAS・PMI 日本支部

- 段階ごとの報告先を数値の閾値つきで定めた日本の公的資料は、本調査では見つけられていない(3 節の IPA モデル契約は「変更の決定」の手続であって、逸脱の段階表ではない)
- JUAS「企業IT動向調査2026」(2025 年度調査)について、500 人月以上の案件で予算超過 42%・工期遅延 48% とする紹介記事がある。報告書本体(PDF が 10MB 超)は読めていない — [ASCII.jp(PR TIMES 転載)](https://ascii.jp/elem/000/004/405/4405028/) **[二次]**、[JUAS「企業IT動向調査報告書2026」](https://juas.or.jp/cms/media/2026/04/JUAS_IT2026.pdf) **[未読]**
- 日本の実態の手がかり(定量的な一次資料ではない)
  - 「遅延を伝えると怒られる」「責任を押し付けられる」と考えて報告をためらう例が多いとする実務記事 — [Zenn 記事](https://zenn.dev/gachigachi/articles/996839cdbed815) **[二次]**
  - 進捗と課題が見えないと感じた人が 77.0%(失敗経験者では 87.5%)とする 2026-04 の民間調査の報道 — [washinmura(報道転載、2026-04-30)](https://aeo.washinmura.jp/ai/%E3%83%95%E3%83%A9%E3%83%83%E3%82%B0%E3%82%B9%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE/en/news/2026-04-30-nearly-1-in-2-experience-project-failure) **[二次]**
  - 日本の IT 業界で PMO が指すものは他国の理解と異なることが多いとする論文(CiNii の書誌のみ、本文未読) — [CiNii Research](https://cir.nii.ac.jp/crid/1390001206111145984?lang=en) **[未読]**
- PMI 日本支部の該当資料は見つけられていない

## 2. アジャイルの文脈で、確約した範囲の変更を誰が決めるか

### 2.1 Scrum Guide 2020(Schwaber & Sutherland)

- 以下は原文で確認した — [Scrum Guide 2020(scrumguides.org)](https://scrumguides.org/scrum-guide.html) **[一次]**
  - スプリント中は「No changes are made that would endanger the Sprint Goal」
  - 「Scope may be clarified and renegotiated with the Product Owner as more is learned」。範囲の再交渉の相手方はプロダクトオーナー、交渉の主体は開発者
  - 「The Sprint Backlog is a plan by and for the Developers」。スプリントバックログの所有者は開発者で、プロダクトオーナーではない
  - 「Only the Product Owner has the authority to cancel the Sprint」(スプリントゴールが陳腐化した場合)
  - 「For Product Owners to succeed, the entire organization must respect their decisions」。委任はできる(「may delegate the responsibility to others」)が説明責任は残る
- 目標が「達成困難」なのは中止の理由にならず、「陳腐化」の場合だけ中止できるとする解釈 — [Scrum.org フォーラム「Sprint Cancellation [SG2020]」](https://www.scrum.org/node/45346) **[二次]**
- 事実として押さえる点
  - スプリント内の範囲は「開発者とプロダクトオーナーの再交渉」で動く。スプリントバックログは開発者のものなので、プロダクトオーナー一人では動かせない
  - スプリントゴールそのものを捨てる判断(中止)はプロダクトオーナー単独に与えられている
  - Scrum Guide は、スプリントより大きな単位(予算・リリース日程・契約範囲)の逸脱の報告先を定めていない

### 2.2 SAFe(Scaled Agile, Inc.)

- PI 目標は確約(committed)と非確約(uncommitted)に分かれる。本文の大半はログイン必須で読めなかった — [Scaled Agile Framework「PI Objectives」](https://framework.scaledagile.com/pi-objectives/) **[一次・一部未読]**
- ビジネスオーナー(Business Owners)が PI 計画の場で各目標の事業価値を 1〜10 で付け、PI の終わりに実績の事業価値を付ける。非確約目標は予測可能性の指標に数えない — [Easy Agile「PI Objectives」](https://help.easyagile.com/easy-agile-programs/pi-objectives)、[Atlassian「How to track and manage PI objectives」](https://success.atlassian.com/solution-paths/quarterly-planning-guidance-with-jira-cloud/conduct-a-pi-planning-event/how-to-track-and-manage-program-increment-pi-objectives)、[ServiceNow「SAFe PI objectives」](https://www.servicenow.com/docs/r/cVzHwL~N5hQ70Ca9r7fiZg/jIKK~u1geTZx3RuqacI5Tw) **[二次]**
  - 構造上、確約を作るのはチーム、価値を付けて評価するのはビジネスオーナー(チームの外)
- PI 中の確約の変更手続(誰の承認が要るか)は確認できていない **[未読]**

### 2.3 LeSS(less.works)

- 全体のプロダクトオーナーが製品全体の優先順位を決め、エリアプロダクトオーナーはチームに対してプロダクトオーナーとして振る舞う。スプリントは製品で一つ — [LeSS Rules(2024-11)](https://conference.less.works/less/rules)、[LeSS Huge](https://conference.less.works/less/less-huge) **[一次・検索要約経由]**
- エリアプロダクトオーナーがスプリントゴールを単独で変えられるかの明文は見つからなかった

### 2.4 IPA・経済産業省「アジャイル開発外部委託モデル契約」(2020-03、2025-04 R1)

- 以下は原文 PDF で確認した — [IPA・経済産業省「情報システム・モデル取引・契約書〈アジャイル開発版〉アジャイル開発外部委託モデル契約 R1」(2020-03、2025-04 R1)](https://www.ipa.go.jp/digital/model/ug65p90000001ldr-att/000081484.pdf) **[一次]**
- プロダクトバックログ(第2条第4項): 「甲は、乙と協議の上、自らの責任において、プロダクトバックログに記載された要求事項及びその優先順位を変更することができる」。採否と優先順位の最終決定はプロダクトオーナーに委ねる(解説)
- スプリントバックログ(第2条第5項): 「各スプリントの開始前に、両当事者の合意によりスプリントバックログ……を作成」。プロダクトオーナーと開発チームが協議し、開発チームの業務量見積りをもとに作る。合意できなければ第7条の問題解消協議へ
- 範囲の変更の二層構造(I. はじめに、第1条解説)
  - 「開発対象の大枠の変更を行う場合には、契約内容の変更として変更管理手続の対象となり、スクラムチーム以外の責任者も含めた変更協議を行い書面で変更合意書を締結する」
  - 「大枠を変えない程度の変更は、バックログの追加・変更というアジャイルプロセスの中で行われる」
  - 「機能の追加・変更や優先順位の変更が、結果として代金の増減やスケジュールの延長・短縮を招くときには、第6条の変更管理の手続により両当事者の合意によって……変更することになる」
- 変更管理(第6条)の出席者は「変更協議の対象事項に関する意思決定を行う権限を有する責任者」。変更合意書に両当事者が記名押印しなければ変更は有効にならない
- 問題解消協議(第7条): プロダクトオーナーなどが役割を果たさない場合を含め、スクラムチーム内で解消できない問題は、チーム外の責任者を含む協議で扱う。解説はこれを「いわばエスカレーション」と呼ぶ
- 体制の別紙サンプル: プロダクトオーナーに「甲の経営幹部と週に 1 回以上、直接コミュニケーションを取れる立場であること」を求める。プロダクトオーナーの上に経営幹部が居ることを前提にしている
- プロダクトオーナーの行為の責任は選任したユーザ企業が負う(第4条第3項)。プロダクトオーナーの職務自体をベンダ側へ委ねるべきでない(第4条解説)
- 事実として押さえる点: このモデル契約では、プロダクトオーナーが単独で動かせるのは「大枠の内側の優先順位」まで。代金・日程・開発対象の大枠に及ぶ変更は、スクラムチームの外の権限者と相手方の合意に移る

## 3. 受託開発で、範囲の変更の報告と決定を分ける慣行

### 3.1 IPA 非ウォーターフォール型開発のモデル契約(2012-03、2020-03 修正)

- 以下は原文 PDF で確認した — [IPA SEC「非ウォーターフォール型開発 WG 活動報告書 第四部 付録1〜5」(2012-03-26、2020-03-31 修正)](https://www.ipa.go.jp/archive/files/000004611.pdf) **[一次]**
- 基本契約 第4条(変更管理): 一方当事者から変更の協議の要請があれば速やかに応じる。協議は連絡協議会で行い、「変更の対象、変更の可否、変更による代金・納期に対する影響等を検討」する。個別契約の変更は「変更版個別契約書に記名押印しなければ、当該変更は有効とならない」
- 同解説: 連絡協議会で合意した事項の変更は議事録で足りるが、個別契約の内容(予算、期間、成果物等)は「非ウォーターフォール型開発であっても安易に変更されるべきではない」ため、両当事者の記名押印を要件とした
- 第6条(連絡協議会): ユーザ・ベンダ双方の責任者と主任担当者が出席する。ベンダは遅延事項の有無、理由と対応策、個別契約の変更を要する事由の有無などを協議し、議事録を作ってユーザへ提出する。ユーザは期間内に点検・承認する(異議がなければみなし承認)
  - 報告(ベンダが遅延と変更事由を出す)と承認(ユーザが議事録を点検する)が、構造上は別の当事者に分かれている
- 個別契約の別紙の作業体制: ユーザ側の「要求仕様全体の責任者(プロダクトオーナー)」は「バックログから次回イテレーションの目標を選択し決定」する。注記「プロダクトオーナーはユーザに限られる」
- 組合モデル
  - 第3条(プロジェクト予算): 予算の超過が見込まれた場合は、超過分の負担を組合員全員で協議する(超過の「見込み」の時点で、予算の当事者全員の協議に移す)
  - 第5条解説: 開発を受注するベンダが発注側の業務執行組合員も兼ねるため「利益相反、モラルハザードの危険もあることに留意する必要がある」
  - 第8条解説: 会計帳簿は、支払いを受ける立場のベンダではなくユーザが管理するのが望ましい。他の組合員は帳簿を監査する権利を持つ
  - 発注と受注を同じ者が兼ねる構造の危険を、モデル契約自身が注記している

### 3.2 経済産業省・IPA「情報システム・モデル取引・契約書」(受託開発、第二版 2020-12)

- 第二版の公開日は 2020-12-22。条文本体(Word)は文字化けで読めなかった — [IPA「情報システム・モデル取引・契約書 第二版」](https://www.ipa.go.jp/digital/model/model20201222.html) **[一次・本文未読]**
- 2007 年版の解説記事: 多くの契約が仕様変更を「本契約書に記載なき事項は双方誠意を持って協議する」の一文に頼っていたことが問題とされ、モデル契約は変更管理の手続(連絡協議会・変更管理書)を置いた — [ScanNetSecurity「第33回 仕様変更・追加契約への対応」(2008-07-15)](https://scan.netsecurity.ne.jp/article/2008/07/15/22522.html) **[二次]**
- 日本の実態の手がかり: 変更の扱いを契約上「誠意協議」に頼る慣行があったことを、モデル契約の策定側が問題として扱っている(建前と実運用の乖離の一例)

### 3.3 CCB(変更管理委員会)

- CCB は「変更を審査・評価・承認・延期・却下し、その決定を記録・伝達する、正式に設けられた集団」(PMI Lexicon、1.3 参照) **[二次]**
- JISA(情報サービス産業協会)の変更管理の慣行を定めた資料は見つけられていない **[未読]**

## 4. 報告を受ける者と、逸脱を起こしうる判断をした者が同じであることを避ける規範

- NIST SP 800-53 Rev.5(2020-09、2020-12 更新)AC-5「Separation of Duties」: 分離を要する職務を特定・文書化し、それを支えるアクセス権限を定める。原典の統制文は NIST のページで読めず、転載で確認した — [NIST CSRC「SP 800-53 Rev.5」](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) **[一次・統制文は未読]**、[STIG Viewer「AC-5」](https://www.stigviewer.com/controls/nist-800-53/AC-5) **[二次]**
- AC-5 の解説例(ベンダの要約): 支払いを起こす者と承認する者を分ける。アカウントを払い出す者と、そのアカウントの監査ログを見る者を分ける。コードを書く者と本番へ出す者を分ける — [UpGuard「AC-5: Separation of Duties」](https://www.upguard.com/compliance/nist-sp-800-53/ac/ac-5.md) **[二次]**
- 変更管理での職務の分離: 変更要求を起こした者がそれを承認しない。方針文書だけでなく、ワークフローの層で自己承認を塞ぐ。承認記録で依頼者と承認者が同じ ID の事例を監査する — [Security Scientist「12 Questions and Answers About separation of duties in changes」](https://www.securityscientist.net/blog/12-questions-and-answers-about-separation-of-duties-in-changes/) **[二次]**
- ISACA の職務分離マトリクスは、一つの職位に兼ねさせてはならない職務の組を示す(マトリクス本文は未読) — [Wikipedia「Separation of duties」](https://wikipedia.com/wiki/Separation_of_duties) **[二次]**
- ISO/IEC 27001:2022 附属書 A 5.3「Segregation of duties」: 相反する職務と責任範囲を分離する(規格本文は未読、解説で確認) — [UpGuard「Segregation of Duties in ISO 27001 (Control 5.3)」](https://www.upguard.com/compliance/iso-27001/5-3.md) **[二次]**
- 日本の J-SOX(財務報告に係る内部統制の評価及び監査の基準・実施基準、2023-04 改訂、2024-04 以降開始の事業年度から適用): 統制活動として権限と職責の付与・職務の分掌を求める。金融庁の原文 PDF は 404 で読めなかった — [税研「内部統制基準の改訂」](https://www.zeiken.co.jp/zeikenpress/press/0004pp20240209/) **[二次]**、[マネーフォワード「職務分掌」解説](https://biz.moneyforward.com/ipo/basic/3042/)(一つの取引を複数の工程に分け、一人で完結できないようにする) **[二次]**
- GovS 002 4.2.2: 保証は運用管理から独立した立場で行う(1.2 参照) **[一次]**
- IPA 組合モデル契約: 発注と受注の兼務を利益相反として注記し、支払いを受ける側に帳簿を持たせない(3.1 参照) **[一次]**
- PRINCE2: 工程の許容値はプロジェクトマネージャーが自分で設定できず委員会が設定する。許容値を破る予測は一つ上の階層が決める(1.1 参照) **[二次]**
  - 「自分の判断の結果を自分が受理する」形を、権限の境界を上の階層が設定することで塞いでいる

## 考察(解釈。事実ではない)

### 既存の枠組みに共通する形

- 「報告する者」と「決める者」は、どの枠組みでも別の階層に置かれている
  - PRINCE2: 許容値の内側は自分で決め、外側は一つ上が決める。許容値そのものも一つ上が設定する
  - GovS 002: 委任された権限を超える決定は委任元(sponsoring body)へ戻す(shall)
  - IPA アジャイル版モデル契約: 大枠の内側はプロダクトオーナー、大枠の外側(代金・日程・開発対象の大枠)はスクラムチーム外の権限者と相手方の合意
- 逸脱の閾値は「誰の権限の境界か」と一体で定義されている。閾値だけを表にして報告先を役職名で並べる形は、PRINCE2 型の「許容値=委任の境界」と比べて、境界を誰が設定したかが抜けやすい

### Issue #418 の論点への当てはめ

- 段階1 の報告先を価値責任者にすると、範囲の調整を始める者と報告を受ける者が一致する。既存の枠組みで、範囲の調整を始める者が単独でその逸脱を受理する形は見つからなかった
  - Scrum のスプリント内でさえ、範囲は開発者とプロダクトオーナーの再交渉で動く(プロダクトオーナー単独ではない)
  - IPA アジャイル版は、代金・日程に影響する範囲の変更をプロダクトオーナーの権限の外に置いている
- 他方、段階1 を「報告」でなく「権限の内側の対処+記録」と読むなら、価値責任者が自分で対処すること自体は PRINCE2・IPA と矛盾しない。問題は「1 人の判断で確約範囲が動き、その事実が誰にも届かない」こと。その場合の歯止めの候補は三つある(優劣は会議体で決める)
  - (a) 段階1 の通知先を、範囲の調整を始めた者以外(事業決裁者、または相手方の当事者)にする
  - (b) 価値責任者が受理してよいが、受理した記録を次の段階の報告先(または相手方)が閲覧・点検できる状態に置く(IPA の連絡協議会議事録のみなし承認に近い)
  - (c) 段階1 の閾値(予算・範囲・日程)を、価値責任者の委任の境界として事業決裁者があらかじめ設定したものに限る(PRINCE2 の「許容値は上位が設定する」形)
- 確約範囲の 5% 変動が予算・日程の変化を伴う場合、IPA アジャイル版の区分では「大枠の変更」側に入り、プロダクトオーナー単独では決められない。範囲だけ動いて予算・日程が動かない場合は「大枠の内側」として扱われうる。この区別が段階表に無い点は確認が要る
- 日本の実態として、プロダクトオーナーが決定権を持たないこと、遅延の報告がためらわれることが繰り返し指摘されている(いずれも二次資料)。報告先を 1 人に集めると、その 1 人が報告を止めた場合に検出できない。したがって「誰に報告するか」に加えて「報告が無かったことを誰が検出できるか」も論点になる

## 規格として課せること / 課すべきでないこと

### 課せること(根拠つき)

- 段階ごとの報告先は、規格で定義された役割で書く。未定義の役職名(プロジェクト責任者・部門責任者・PMO・ステアリングコミッティ)を規範の主語にしない
  - 根拠: GovS 002 は SRO・sponsoring body を定義したうえで上申先として使う。PRINCE2 も四つの管理階層を定義してから許容値を割り当てる(1.1、1.2)
- 逸脱を起こしうる判断(範囲の調整)を始めた者が、その逸脱の唯一の受理者にならないようにする。少なくとも、受理の記録が別の役割に届く経路を置く
  - 根拠: 変更管理の職務の分離(依頼者が承認しない)、NIST AC-5、ISO/IEC 27001 A.5.3、J-SOX の職務分掌(4 節)。IPA 組合モデル契約の利益相反の注記(3.1)
- 予算・日程・契約範囲に影響する範囲の変更は、価値責任者の単独の権限の外に置き、事業決裁者(受託なら相手方の当事者)の合意を要件にする
  - 根拠: IPA アジャイル版モデル契約の「大枠の変更は変更管理手続、スクラムチーム外の責任者を含めて書面で合意」(2.4)。IPA 非ウォーターフォール版の「予算・期間・成果物は安易に変更されるべきではない」(3.1)
- 段階の閾値は、上位の役割(事業決裁者)があらかじめ設定した委任の境界として記録させる
  - 根拠: PRINCE2 の「工程の許容値は委員会が設定し、プロジェクトマネージャーは自分で設定できない」(1.1)。GovS 002 7.1 の「上申不要の許容値を設定すべき」(1.2)
- 上申の起点を「超過の予測」に置く
  - 根拠: PRINCE2 の Exception の定義が「forecast」(1.1)。IPA 組合モデル契約第3条も「超過することが見込まれた場合」(3.1)

### 課すべきでないこと(根拠つき)

- 段階1〜3 の閾値(10%・5%・1 週間など)を全組織一律の規範値として課すこと
  - 根拠: 調べた範囲で、閾値の数値を規格として課している枠組みは無かった。PRINCE2・GovS 002 はどちらも「許容値を設定する」ことを求め、値は上位が案件ごとに決める。数値を残すなら例示とし、根拠水準マーク(ADR-0026)で開示する必要がある
- 会議体の名称(ステアリングコミッティ、CCB、PMO)の設置を必須にすること
  - 根拠: IPA アジャイル版は、スクラムチーム外の定例の連絡協議会を「負担が大きく、アジャイルの迅速さを減殺」するとして定めず、大規模な場合に置くことも考えられるとした(2.4)。課すのは「決める役割」であって会議体の形ではない
- スプリント内の範囲の再交渉(スプリントゴールを損なわない範囲)まで段階表の報告対象にすること
  - 根拠: Scrum Guide はスプリント内の範囲の再交渉を開発者とプロダクトオーナーに委ねている(2.1)。IPA アジャイル版も大枠の内側の変更はアジャイルプロセスの中で扱う(2.4)。ここまで上申させると、Scrum Guide の「組織はプロダクトオーナーの決定を尊重する」と衝突する
- 価値責任者の権限を一律に剥奪すること(段階1 の対処そのものを禁じること)
  - 根拠: どの枠組みも、委任の境界の内側では当事者が自分で対処することを認めている(PRINCE2 の manage by exception、GovS 002 7.1)。問題は対処ではなく、受理の記録が誰にも届かないことにある

## 調査で埋められなかった穴

- PRINCE2 第7版の原典(許容値の設定者、Change Authority の委任条件)の本文。二次資料のみ
- PMBOK 第7版・第8版、ISO 21502:2020 の変更管理(7.10)と統制(6.6)の本文
- GovS 002 v2.1 の後半(約 2.5 万字)、とくに予測時点での上申の明文の有無
- SAFe の PI 中の確約変更の手続(ログイン必須)
- 経済産業省・IPA モデル取引・契約書 第二版(受託開発)の変更管理条項の本文(Word が読めなかった)
- JISA・PMI 日本支部の変更管理・エスカレーションの資料
- J-SOX 実施基準の職務分掌の原文(金融庁 PDF が 404)、NIST AC-5 の原典の統制文
- 日本企業でプロダクトオーナーや PM が逸脱を報告しない実態の定量的な一次調査(JUAS 報告書本体を含む)
