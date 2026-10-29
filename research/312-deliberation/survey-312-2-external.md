# #312 外部調査 2: 兼務と職務分離(規模別の席の兼務・出荷判定と独立レビュー・人員名簿)

- 調査日: 2026-10-23。WebSearch / WebFetch による。本リポジトリのファイルは本書以外を変更していない
- 対象: 席(価値責任者・技術判断者・独立レビュア・出荷判定者ほか)の兼務を、体制の規模でどう許すか。外部の規格と実務だけを扱う
- 内部の現状(第何章で「5名未満は可」「10名以上は不可」と書いているか)は扱わない。会議体の資料を参照

## 0. 読み方

### 0.1 検証の区分

| 記号 | 意味 |
| --- | --- |
| **[原文]** | 一次資料の本文を取得し、引用を原文で確かめた。引用は原文のまま(英語) |
| **[原文・部分]** | 一次資料の一部(プレビュー・抜粋・一次資料を転載した二次サイト)だけを確かめた |
| **[二次]** | 解説サイト・ベンダー記事・要約でしか確かめていない |
| **[未確認]** | 記憶・一般的な知識に依る。取得して確かめられなかった。**条項の根拠にしない** |

取得には要約を返すツール(WebFetch)を使った。**[原文]の引用も、ツールが抜き出した文字列である**。条項に引くときは、出典台帳(`research/sources/`)へ登録する段階で再取得して照合すること。

### 0.2 3つの問い

- **Q1 価値と技術の兼務**: 価値責任者と技術判断者を同じ人が兼ねてよい体制の規模はどこまでか(現行は章によって「5名未満は可」「10名以上は不可」)
- **Q2 出荷判定と独立レビュー**: 出荷判定者を独立レビュアと別の人にするか
- **Q3 人員名簿**: 名前の付いた人と席の対応(名簿)を記録として要求するか

### 0.3 既存の出典台帳との対応

| 本書の項 | 既存の SRC |
| --- | --- |
| Scrum Guide 2020 | SRC-0640 |
| NIST SP 800-53B(小規模組織の代替統制の脚注) | SRC-0544 |
| GAO Green Book 2025(小規模組織の職務分離) | SRC-0419 |
| AICPA TSC 2017(SOC 2 CC5.1・CC8.1) | SRC-0538 |
| J-SOX 実施基準 2023 改訂(職務分掌) | SRC-0537 |
| ISO/IEC 29110(VSE = 25名以下) | SRC-0329、SRC-0533 |
| ISO/IEC/IEEE 12207:2026 プレビュー | SRC-0491 |
| IEC 62304 AMD1 プレビュー | SRC-0525 |
| ISO 26262-6 / IEC 61508-3 プレビュー | SRC-0527、SRC-0528 |
| FAA AC 20-115D(DO-178C) | SRC-0529 |
| makerchecker「Segregation of duties for AI agents」 | SRC-0541 |
| Rewind「AI approve pull requests」(書き手と出荷者の分離) | SRC-0248 |

以下で「新規」とした出典は台帳に無い。

## 1. 安全・医療の規格: 独立性は「誰が」ではなく「どの活動に・どの水準で」

### F1. DO-178C: 独立性は目標(objective)単位で、ソフトウェアレベルに応じて数が増える

- **主張**: DO-178C は附属書 A の表で、目標ごとに「独立性をもって満たす」かを指定する。独立性の要求数は Level A で最多、D で最少。独立性の定義は「作成者以外の者が行う」こと。SQA は全レベルで「権限・責任・独立性」を持つ要員が行う
- **出典**:
  - Wikipedia「DO-178C」(参照 2026-10) https://en.wikipedia.org/wiki/DO-178C — 独立性を要する目標数 A:30 / B:18 / C:5 / D:2。検証者は "may not be the person who authored the item" と説明 **[二次]**
  - LDRA「Safety Assurance Through Independent Verification」White Paper v3.3 https://ldra.com/d/independence/Safety_Assurance_Through_Independent_Verification_White_Paper_v3.3.pdf — "Verification independence means the activity is performed by someone other than the developer"(§6.2.e の引用として)、SQA は "personnel with authority, responsibility, and independence" **[二次]**(ベンダー文書が規格を引用)
  - Modern Requirements「DO-178C Compliance Guide」 https://www.modernrequirements.com/resources/modern-requirements-whitepapers/do-178c-compliance-guide/ — A:33 / B:21 / C:8 / D:5 **[二次]**。**Wikipedia と 3 件ずつ食い違う**(SQA の目標の数え方の差と推測。未確認)
- **検証**: DO-178C 本文(RTCA 有償)は未取得。附属書 A の表は確かめていない。AC 20-115D(SRC-0529)は目標の全充足を求めるが、独立性の表は含まない
- **関連**: Q2 — 独立性の単位は「人の席」ではなく「活動(目標)」。**出荷(型式証明の申請)の判断者を検証者と分けよとは書かれていない**(本書の範囲では見つからない)。Q1 — 規模の閾値は無い。重大度(レベル)で独立性の数が変わる

### F2. IEC 61508-1: 機能安全評価の独立性を SIL と帰結で 3 段階に分ける

- **主張**: 機能安全評価(FSA)の最小独立性を、独立した個人 / 独立した部署 / 独立した組織の 3 段階で、SIL(と帰結)に応じて定める(IEC 61508-1 第 8 節、表 5)。SIL 1 は独立した個人、SIL 2 は個人(部署を推奨)、SIL 3 は部署(組織を推奨)、SIL 4 は独立した組織のみ
- **出典**:
  - Yokogawa「Functional Safety Assessments」 https://www.yokogawa.com/solutions/products-and-services/consulting/functional-safety-consultancy-services/functional-safety-assessments/ — "SIFs with a SIL4 can only be assessed by an independent organization." 等 **[二次]**
  - ABB「Functional Safety Assessment」(社内方針) https://library.e.abb.com/public/94e085279ca00c3085257625006f6de4/Functional%20Safety%20Assessment.pdf — "IEC 61508 has very clear and mandatory (shall) requirements for independence based on consequences or SIL"。IEC 61511 は "a more relaxed approach not dependent on consequences or SIL" **[二次]**
  - Omron 知識ベース https://automation-knowledge-base.omron.eu/support/solutions/articles/103000351916 — 独立した個人・部署・組織の定義は IEC 61508-4 3.8.10〜3.8.12、社内資源で満たせる場合がある(61508-1 8.2.12 注 2) **[二次]**
- **検証**: 表 5 の原文は取得できなかった(IEC プレビューは別ページへ遷移)
- **関連**: Q1 — 独立性の段階を決めるのは**危険の大きさ**であり、**体制の人数ではない**。小さな組織は「外部の組織を使う」ことで高い段階を満たす(Omron)。Q2 — 評価者の独立性であって、出荷の決定者との分離は扱わない

### F3. ISO 26262-2: 確証方策の独立性を I0〜I3 で、ASIL ごとに定める

- **主張**: 確証レビュー・機能安全監査・機能安全アセスメントに、ASIL に応じた独立性(I0〜I3)を課す(ISO 26262-2:2018 表 1)。独立性の観点に「資源・管理・リリースの権限(release authority)」を含む
- **出典**:
  - Synopsys「ISO 26262 に準拠した車載製品開発における確証方策の役割」 https://www.synopsys.com/ja-jp/japan/today-tomorrow/tt119-art3-automotive-iso26262-confirmation-measures.html — 確証方策は ASIL に応じて資源・管理・リリース権限の独立性を要する。機能安全監査は ASIL B〜D、機能安全アセスメントは ASIL C・D **[二次]**
  - Presencis「ISO 26262 Article 2」 https://presencis.com/regulations/iso-26262/article-2-safety-management/ — ASIL 別の表を掲げるが、I0〜I3 の語を使わず「Independent person / team」と簡略化しており、規格の表と一致しているか疑わしい **[二次・信頼性低]**
- **[未確認] 記憶による I0〜I3 の定義**: I0 = 実施する(別人でなくてよい)、I1 = 作成者と別の人、I2 = 作成チームから独立した人(同じ直属上長に報告しない)、I3 = 管理・資源・リリース権限について部署から独立。条項に引く前に規格本文で確かめること
- **関連**: Q2 — **最上位の独立性(I3)の定義に「リリース権限からの独立」が入る**。すなわち、高 ASIL では評価者が出荷を決める系統から独立していることを求める。これは「独立レビュアと出荷判定者を分ける」方向の根拠の候補だが、[未確認]。Q1 — 人数の閾値は無い

### F4. FDA 21 CFR 820.30(e)(旧 QSR): 設計レビューに「その段階に直接の責任を持たない者」を含める。QMSR で明文は消えた

- **主張**: 旧 QSR は設計レビューの参加者に "an individual(s) who does not have direct responsibility for the design stage being reviewed" を含めることを求めた。2026-02-02 施行の QMSR は ISO 13485 を参照する形に改め、**この明文要求を引き継がなかった**。ただし FDA は前文で同様の取り組みを期待している
- **出典**:
  - Cornell LII「21 CFR 820.30」 https://www.law.cornell.edu/cfr/text/21/820.30 — 上記の文言 **[原文]**(旧条文)
  - Greenlight Guru「What's left of the QSR in QMSR?」 https://www.greenlight.guru/blog/qmsr-your-guide-to-part-820 — FDA 前文 "does not include the explicit requirement that each stage of design review must include an individual(s)…" と、"will require a similar approach to design review" を引用 **[二次]**
  - MedDeviceGuide(設計レビューの独立性) https://meddeviceguide.com/blog/design-review-evidence-medical-device-agenda-minutes-independence-guide — 同じチーム内で交代するレビュアは「文言は満たすが趣旨は満たさないことがある」 **[二次]**
- **関連**: Q2 — 独立性は**レビュー**に掛かり、出荷の決定者には掛からない。Q1 — 人数の閾値は無い。少人数では他機能(QA・RA)や外部の専門家を独立の担い手にする実務がある

### F5. ISO 13485 / IEC 62304: 出荷を承認した者の記録は求めるが、レビュアとの分離は求めない

- **主張**: ISO 13485:2016 は 5.5.1 で品質に影響する業務を管理・実施・検証する要員の相互関係を文書化し、8.2.6 で**製品のリリースを承認した者を記録**することを求める。7.3.5 の設計レビューは「関係する機能の代表者」を求め、独立した個人の明文要求は無い。IEC 62304 5.8(ソフトウェアのリリース)は完了の確認と記録を求め、リリースの承認者の独立は求めない
- **出典**:
  - ISO 13485 ギャップ分析チェックリスト(npm パッケージ内) https://cdn.jsdelivr.net/npm/@saibolla/ada@0.1.3/skills/iso-13485-certification/references/gap-analysis-checklist.md — "Interrelation of personnel identified"、"Authority responsible for release recorded" **[二次]**(規格本文ではない)
  - MedDeviceGuide(前掲) — 13485 7.3.5 は 820.30(e) の明文要求を "does not contain" **[二次]**
  - OpenRegulatory「Software Release IEC 62304」 https://openregulatory.com/articles/software-release-iec-62304 — 5.8 の活動の列挙。承認者の独立には触れない **[二次]**
  - Elsmar Cove「ISO 13485 5.5.1 — Small Company Independence」 https://elsmar.com/elsmarqualityforum/threads/iso-13485-5-5-1-responsibility-and-authority-small-company-independence.79436/page-2 — 製造者が製造とリリースを兼ねる事例。「独立」は ISO 9000 で未定義で、判断を条件づける誘因(出来高払い・ノルマ)の有無で見るという実務家の見解 **[二次]**(フォーラム)
- **[未確認]**: 13485 5.5.1 の原文 "document the interrelation of all personnel who manage, perform and verify work affecting quality, and shall ensure the independence and authority necessary to perform these tasks"。末尾の "independence" の句は記憶による。取得できれば Q3 と Q2 の両方に効く
- **関連**: Q3 — **医療機器の QMS は、検証する要員の相互関係とリリース承認者の識別を記録として求める**。名簿の先例として最も直接的。Q2 — 出荷の承認者を検証者と分けよという要求は見つからない

## 2. 情報セキュリティ・内部統制: 職務分離と小規模組織の代替統制

### F6. NIST SP 800-53 AC-5 と SP 800-53B: 分離すべき職務を識別・文書化。小規模組織は代替統制を置ける

- **主張**: AC-5 は「分離を要する個人の職務を識別し文書化する」「職務分離を支えるアクセス権限を定める」。AC-5 は Moderate・High ベースラインに含まれ、Low には含まれない。800-53B は小規模組織で職務分離の代わりに監査頻度の増加・役割別訓練・人員審査の強化を置けると注記する
- **出典**:
  - STIG Viewer「NIST 800-53 Rev 5 AC-5」 https://www.stigviewer.com/controls/nist-800-53/AC-5 — "Identify and document {{ insert: param, ac-05_odp }}"、"Define system access authorizations to support separation of duties." **[原文・部分]**(OSCAL を転載した二次サイト)
  - NIST SP 800-53B(SRC-0544 c4) — "In a small organization, more frequent auditing, targeted role-based training, or stronger personnel screening may be implemented in lieu of separation of duties." **[原文]**(台帳で確認済み)
- **関連**: Q3 — **AC-5 は分離の対象となる職務の「識別と文書化」を求める**。名簿そのものではないが、席と職務の対応表を要求する先例。Q1 — 「小規模組織」に人数の定義は無い。分離を外す代わりに**代替統制と理由の記録**を求める(SRC-0544 c1・c5)

### F7. ISO/IEC 27001:2022 附属書 A 5.3 / 27002: 相反する職務と責任範囲を分離する。困難なら代替統制

- **主張**: 27001 A.5.3 は相反する職務・責任範囲の分離を求める。27002 の手引きは共謀を考慮すること、分離が困難な場合は代替統制(活動の監視・監査証跡・管理者の監督)を置くことを述べる
- **出典**:
  - Advisera「Segregation of duties」 https://advisera.com/27001academy/?p=10589 — 組織が "too small to designate functions to different persons" の場合、代替統制として監視・監査証跡・管理者の監督 **[二次]**(2013 年版の番号 A.6.1.2 で解説)
  - UpGuard「ISO 27001 5.3」 https://www.upguard.com/compliance/iso-27001/5-3/ — "common in teams under 20 people"、"'we're too small' is not an acceptable justification on its own"、"The standard does not prescribe a specific organizational structure or a minimum team size." **[二次]**
- **検証**: 27001:2022 A.5.3 の原文は取得できなかった
- **関連**: Q1 — **規格は最小人数を定めない**(UpGuard の明言)。「20名未満」はベンダーの経験則で、規格の値ではない

### F8. COSO 2006 小規模公開会社向けガイダンス / GAO Green Book: 「小規模」を人数で定義しない

- **主張**: COSO の小規模会社ガイダンスは職務分離の資源不足と経営者による無効化を課題に挙げ、経営者のレビュー・取引の抽出確認・監視で補うことを認める。「小規模」を定義せず、特徴を挙げるだけで決定的なものは無いとする。Green Book も追加のレビュー段階などで対応できるとする
- **出典**:
  - Cooley「New COSO Guidance for Smaller Companies」(2006) https://www.cooley.com/news/insight/2006/new-coso-guidance-for-smaller-companies — "While the guidance does not define "smaller," it does identify characteristics common to smaller companies, none of which is definitive."、"Insufficient resources to segregate duties" **[二次]**
  - GAO Green Book 2025(SRC-0419 c3) — "adding additional levels of review for key processes" **[原文]**(台帳)。同 c2 "cost alone is not an acceptable reason to avoid implementing internal controls."
- **関連**: Q1 — **内部統制の枠組みは人数の閾値を置かず、特徴(人員が少なく職務が広い)で小規模を捉える**。費用だけを理由に統制を外すことは認めない(本標準のコアポリシーの「判断軸は信頼性」と整合)

### F9. J-SOX 実施基準: 職務分掌を例示。小規模組織の代替統制の原文は確かめられなかった

- **主張**: 実施基準は承認・記録・資産管理を別の者に担当させる職務分掌を例示する(SRC-0537 c1、[原文])。2011 年改訂で「事業規模が小規模で、比較的簡素な構造を有している組織等」について、職務分掌に代わる代替的な統制(経営者による直接的なモニタリング等)を認める旨が加わった、と理解している
- **出典**: 金融庁「意見書」(2023) https://www.fsa.go.jp/news/r4/sonota/20230407/1.pdf **[原文]**(職務分掌の例示のみ)
- **検証**: 小規模組織の代替統制の文言は、金融庁資料 3 点・解説記事 3 点を当たったが取得できなかった。**[未確認]**。人数の基準は、当たった範囲には無い(僅少な業務プロセスの「売上高 5%」はあるが人数ではない)
- **関連**: Q1 — 国内の枠組みでも人数の閾値は見つからない

### F10. SOC 2(AICPA TSC)と小規模企業の実務: 分離が実際的でなければ代替の統制活動。ピアレビューが中心

- **主張**: TSC CC5.1 の着眼点は、相反する職務を分離し、分離が実際的でない場合は代替の統制活動を選ぶことを求める(SRC-0538 c1、[原文])。小規模企業の実務では、本番コードへのピアレビューの必須化・保護されたチェック・改ざんされにくい監査ログ・本番の変更と承認済みデプロイ記録の突合が代替統制として挙がる。監査人が代替統制を認めるとは限らない
- **出典**:
  - OneUptime「SOC 2 Access Reviews When Everyone Has Production Access」(2026-08) https://oneuptime.com/blog/post/2026-08-03-soc-2-access-reviews-five-person-startup/markdown — "Require peer review and protected checks for production code and infrastructure changes."、"Do not promise that compensating safeguards automatically satisfy a criterion or eliminate an exception." 最も権限の大きい者の自己レビューは別の者(役員・取締役・2名の共同)へ回す **[二次]**
  - Sensiba「Independent code review / systematically enforced segregation of duties」 https://knowledge.sensiba.com/independent-code-review-systematically-enforced-segregation-of-duties — 4 つの方法として「ピアレビューの強制」「デプロイ前のリリース承認の強制」「開発と運用の完全分離」「変更とデプロイの通知」。最後は "generally a last resort for small organisations where the other three are not feasible" **[二次]**(監査法人の記事)
- **関連**: Q2 — **実務では「コードレビュー(書き手 ≠ 承認者)」と「リリース承認」は別の方法として並べられるが、両者を別の人にせよという要求ではない**。小規模では前者で後者を兼ねるのが通例。Q1 — 5名規模の企業でも完全な分離は求められず、代替統制の設計と説明が問われる

## 3. ソフトウェア実務: チームの大きさと役割の兼務

### F11. Scrum Guide 2020: チームは通常 10 名以下。PO は 1 人。PO が開発者として働くことは想定されている

- **主張**: スクラムチームは "typically 10 or fewer people"。"The Product Owner is one person, not a committee." "If the Product Owner or Scrum Master are actively working on items in the Sprint Backlog, they participate as Developers." リリースを決める役割は指定しない。完成の定義を満たさない項目はリリースできない
- **出典**: Schwaber & Sutherland「The Scrum Guide」2020 https://scrumguides.org/scrum-guide.html **[原文]**(SRC-0640)
- **関連**: Q1 — **PO が開発作業を担う兼務は明示的に許されている**。ただし「10名以下」はチームの大きさの目安で、兼務の閾値ではない。Q2 — 出荷判定の席は無く、完成の定義(品質基準)がゲートになる

### F12. 兼務についての実務家の見解: 一般論として可、ただし「緊張関係」の喪失を警告

- **主張**:
  - Marty Cagan は、強い技術リードがプロダクトオーナーを兼ねることを "definitely worth encouraging" とする。条件は能力と意思で、規模の条件は述べない。兼ねる者を置くなら別の PM は置かない
  - Mike Cohn は、PO と SM の間に "a natural tension should exist" とし、兼務は小規模組織で見たことがあるが長期に続けるべきでないとする。小規模チームでは一人の個性の影響が大きい
- **出典**:
  - SVPG「Lead Engineer as Product Owner」 https://svpg.com/lead-engineer-as-product-owner **[二次]**(著者本人の記事だが規範ではない)
  - Mountain Goat Software「ScrumMasters Should Not Also Be Product Owners」 https://learn.mountaingoatsoftware.com/blog/scrummasters-should-not-also-be-product-owners **[二次]**
- **関連**: Q1 — **価値と技術の兼務の可否を、実務家は人数でなく「誰が誰を牽制するか」で論じる**。Cagan は価値と技術の兼務に肯定的、Cohn は牽制の役(SM)との兼務に否定的。本標準の文脈では、価値と技術の兼務は「価値の要求と技術上の制約の緊張」を一人の中に閉じる

### F13. Team Topologies: チームは 8 名前後(Dunbar の数に基づく)

- **主張**: "Team Topologies recommends teams of around 8 people"。5(親密な関係)・15(高い信頼の関係)を根拠に挙げ、15 名を超えると信頼の維持が難しくなるとする
- **出典**: Team Topologies Newsletter「When Teams Grow Too Large」(2025-05) https://teamtopologies.com/news-blogs-newsletters/when-teams-grow-too-large-solving-cognitive-load-issues **[二次]**(著者団体の記事。書籍本文は未確認)
- **関連**: Q1 — 「5」「15」は信頼関係の数で、**役割の分離の閾値ではない**。本標準の「5名」「10名」に転用できる根拠ではない

### F14. Google / GitHub: 書き手以外の承認を機械で強制する。レビュアと出荷者の分離は求めない

- **主張**:
  - Google の Binary Authorization for Borg は、本番のコードに "review and approval from at least one engineer other than the author" と、システムの所有者の承認を求める。ビルドはビルドを起動する従業員から分離された基盤で行う。**レビュアとデプロイする者を別にする記述は無い**
  - Go プロジェクトは 2022 年に、変更ごとに Google 社員 2 名の関与を求めた(アップロード者またはレビュアのどちらでもよい)。理由は "For compliance and supply chain security reasons"
  - GitHub のブランチ保護 "Require approval of the most recent reviewable push" は、最後の push を "someone other than the person who pushed it" が承認することを求める
- **出典**:
  - Google Cloud「Binary Authorization for Borg」 https://docs.cloud.google.com/security/binary-authorization-for-borg **[原文]**(新規)
  - The Register「Google Go double sign-off」(2022-04-05) https://www.theregister.com/2022/04/05/google_go_double_sign_off/ **[二次]**
  - GitHub Docs「About protected branches」 https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches **[原文]**(新規)
  - 参考: Rewind(SRC-0248)は、AI が作成した PR は人がボタンを押さない限りマージできないとして、書き手と出荷者を AI が兼ねない分離をツールで強制する
- **関連**: Q2 — **大規模な実務でも、分離の単位は「書き手 ≠ 承認者」の 2 者**。承認者と出荷者(デプロイする者)の分離は標準的な要求として現れない。出荷の統制は「誰が」よりも「レビュー済みの成果物だけが本番に入る」(来歴・ビルドの分離)で担保している

## 4. ライフサイクル規格と名簿(Q3)

### F15. ISO 9001:2015 5.3 / 7.5: 責任と権限の割り当て・伝達・理解は要求。文書化は必須ではない

- **主張**: 5.3 は、関連する役割の責任と権限が割り当てられ、伝達され、理解されることをトップマネジメントが確実にすることを求める。5.3 自体は文書化した情報を要求しない。組織図・職務記述書は推奨の実装
- **出典**:
  - ISMS.online「ISO 9001 Clause 5.3」 https://isms.online/iso-9001/clause-5-3-organizational-roles-responsibilities-and-authorities **[二次]**
  - The Core Solution「ISO 9001 Clause 5.3 explained」 https://www.thecoresolution.com/iso-9001-clause-5-3-explained — "documented where necessary" **[二次]**
- **[未確認]**: 原文 "Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization." は記憶による
- **関連**: Q3 — **一般の QMS は名簿の文書化を必須にしない**。13485(F5)・AC-5(F6)は識別と文書化を求める。分野で分かれる

### F16. 安全規格の計画書: 責任者の識別を計画に含める

- **主張**: ISO 26262 の安全計画は活動ごとの責任者を含み、安全マネージャを任命する。IEC 61508-1 第 6 節は機能安全の責任を負う人・部署・組織の識別を求める。DO-178C の PSAC はライフサイクルを担う組織の記述を含む
- **出典**: Presencis(前掲)— 安全計画の "Responsibilities"(Who is accountable for each activity)、委任は "must be formally documented" **[二次]**。IEC 61508-1 第 6 節・DO-178C PSAC の内容は **[未確認]**
- **関連**: Q3 — 安全分野では、**活動と責任者の対応を計画書に書く**ことが通例。独立性の要求(F2・F3)を満たしたことを示すにも、誰が何を行ったかの記録が前提になる

### F17. ISO/IEC/IEEE 12207 / 15288、IPA 共通フレーム 2013

- **主張**: 12207:2026 はライフサイクルモデル・方法論を規定しない(SRC-0491、[原文・部分])。品質保証プロセスの「客観性・独立性」の文言、役割の兼務の可否は、公開プレビューの範囲では確かめられなかった
- **[未確認]**: 12207:2017 の品質保証プロセスは、QA を行う者に客観性を求める(組織上の独立は必須でない)と理解している。15288 も同様。IPA 共通フレーム 2013 の役割と兼務の記述は当たっていない
- **関連**: Q1〜Q3 いずれも、**基幹のライフサイクル規格からは人数の閾値も名簿の要求も見つからなかった**(本書の範囲)

## 5. 人数の閾値(5名・10名)の根拠

**役割の分離・兼務について、人数の閾値を定める規格・枠組みは見つからなかった。**

| 見つかった数値 | 出典 | 何の数か | 兼務の閾値に使えるか |
| --- | --- | --- | --- |
| 10名以下 | Scrum Guide(F11) | スクラムチームの大きさの目安 | 使えない。兼務(PO が開発者として働く)はむしろ許している |
| 8名前後(5・15) | Team Topologies(F13) | チームの大きさ・信頼関係の数 | 使えない |
| 25名以下 | ISO/IEC 29110(SRC-0329) | VSE の定義(規格の適用対象) | 使えない。適用対象の定義で、分離の要否ではない |
| 20名未満 | UpGuard(F7) | ベンダーが「完全な分離が困難な」規模として挙げた経験則 | 根拠にならない(規格自身は最小人数を定めないと同じ記事が明言) |
| — | COSO 2006(F8) | 「小規模」を定義しないと明言 | — |
| — | NIST 800-53B(F6) | 「小規模組織」に人数の定義なし | — |

- 安全規格(F1〜F3)は独立性の段階を**危険の大きさ(SIL・ASIL・ソフトウェアレベル)**で決め、人数で決めない。人数が足りない組織は外部を使う
- 内部統制の枠組み(F6〜F10)は、分離できない場合に**代替統制と理由の記録**を求め、人数で免除しない。費用だけを理由に外すことは認めない(Green Book)
- したがって、本標準の「5名未満は可」「10名以上は不可」は、**外部の根拠を持たない値**である。残すなら根拠水準マーク(ADR-0026)が要る

## 6. 見つけられなかったこと

- DO-178C 附属書 A の表の原文(独立性の目標数は二次資料で 2 系統の食い違い)
- IEC 61508-1 表 5、ISO 26262-2 表 1(I0〜I3 の定義)の原文
- ISO 13485:2016 5.5.1・8.2.6、ISO 9001:2015 5.3、ISO/IEC 27001:2022 A.5.3 の原文
- J-SOX 実施基準の小規模組織の代替統制の原文
- IPA 共通フレーム 2013 の役割の記述
- Microsoft のリリース承認者の分離に関する公開資料(当たっていない)
- **出荷(リリース)の判定者を独立レビュアと別の人にせよと定める規格**。ISO 26262 の I3(リリース権限からの独立)が最も近いが [未確認]
- 価値責任者と技術判断者(PO とアーキテクト)の兼務を、規模で禁じる規格・実証研究

## 7. 3つの問いへの示唆

### Q1 価値責任者と技術判断者の兼務

- 外部に**人数の閾値は無い**。「5名」「10名」を残すなら、根拠水準マークで暫定と開示するか、閾値をやめて別の軸へ置き換える
- 外部の規格・枠組みが使う軸は 2 つ。(a) **危険の大きさ**(SIL・ASIL・レベル、本標準ではリスク区分 R)で独立性の段階を上げる。(b) 分離できないときは**代替統制と理由の記録**で補い、費用(人が足りない)だけを理由に外さない
- 実務家は価値と技術の兼務に肯定的な見解もある(Cagan)。問題は兼務そのものより、**牽制の役が消えること**(Cohn)。兼務を許すなら、失われる牽制をどこで補うか(例: 独立レビュアや外部への上申)を条項にする形が、外部の作法に近い
- 章の間の食い違い(5名未満は可 / 10名以上は不可、5〜9名は未規定)は、外部に照らしても一方を正とする根拠が無い。突合では「どちらの値が正しいか」より「人数を軸にするか」を先に決める

### Q2 出荷判定者と独立レビュアの分離

- 外部の主流は**「作成者 ≠ 確認者」の 2 者分離**(DO-178C、GitHub、Google、SOC 2 実務)。確認者と出荷者を別の人にする一般的な要求は見つからなかった
- 例外の候補は ISO 26262 の I3(リリース権限からの独立)で、**高い危険度に限って**評価者を出荷の系統から切り離す。これは「分けよ」ではなく「評価者が出荷の権限者に従属しない」こと([未確認])
- 医療(ISO 13485 8.2.6)は**リリースを承認した者の記録**を求めるが、レビュアとの分離は求めない
- 本標準で分離を課すなら、全変更ではなく高リスク区分(R1)に限定し、根拠水準マークを付けるのが外部の作法と整合する。全面的に課すなら外部に先例が無いことを明記する

### Q3 人員名簿

- 名簿(人と席・職務の対応)を記録として求める先例はある: ISO 13485 5.5.1(要員の相互関係の文書化)と 8.2.6(リリース承認者の記録)、NIST AC-5(分離を要する職務の識別と文書化)、安全規格の計画書(活動ごとの責任者)
- 一般の QMS(ISO 9001 5.3)は割り当て・伝達・理解を求め、文書化は必須にしない
- 独立性・兼務の制約を課す標準であれば、**それを満たしたことを示すために名簿が必要になる**(誰が誰と別人かを記録が示せないと、分離は検査できない)。外部の先例は、名簿を独立した様式としてではなく、計画書や品質マニュアルの一部として求める形が多い
