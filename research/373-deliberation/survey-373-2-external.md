# #373 外部調査: 安全度水準の判定の確認に求める独立の度合い

- 調査時点: 2026-11-05
- 担当: 外部調査(既存規格と業界の現在の実務)
- 論点: 案件ごとの安全重要度 CL の判定と安全リスクアセスメントの確認者に、組織上の距離の段を求めるか。CL0(安全に関係しない)と判定した判定そのものを、誰がどの距離で確かめるか
- 読みの区分
  - **一次**: 規格の本文(翻訳採用版・草案・公開プレビューを含む)、規制当局・規格団体の文書
  - **二次**: 解説記事・論文・ベンダーのブログ
  - **未確認**: 原文で確かめられず、記憶または二次の記述に依る
- 既存調査との関係: ISO 26262-2 表1・IEC 61508 表5・EN 50128/50716 の独立性は #318 の外部調査(`research/318-deliberation/survey-318-2-external.md`)で読んでいる。本メモはそこから「判定(HARA・SIL 割当・クラス分け・DAL 割当)の確認」と「低い判定そのものの確認」に絞って再整理し、新しい出典を足す

---

## 1. ISO 26262-2:2018 表1(HARA の確認レビューは ASIL に依らず I3)

- URL: https://www.catarc.org.cn/upload/202104/29/202104291547457908.pdf (SRC-0675)
- 取得日: #318 の調査で取得(2026-10)。本件では #318 のメモの逐語を再掲する。本日の再取得はしていない
- 文書: GB/T 34590.2 征求意见稿(ISO 26262-2:2018 の修正採用の意見募集草案)
- 読み: 一次(翻訳採用版の草案)。ISO 原文は有償で未読
- 該当箇所: 6.4.9.1 表1 と脚注 a、6.4.9 注3
- 原文の引用(中国語、括弧内は訳)
  - I3: 「认可措施应由在管理、资源和发布权限方面与负责创建对应工作产品的部门独立的人员执行」(管理・資源・リリース権限の点で、作成部門から独立した人が行う)
  - I2: 「…即由不向同一个直接上级报告的人员执行」(同じ直属の上長に報告しない人が行う)
  - 注3: 「本文中所用的“独立性”一词指的是组织独立性」(独立性は組織上の独立性を指す)
- 表1 の行(列は QM / A / B / C / D)
  - 影響分析の確認レビュー: I3 / I3 / I3 / I3 / I3
  - HARA の確認レビュー: I3 / I3 / I3 / I3 / I3
  - 安全計画・機能安全コンセプトなどの確認レビュー: — / I1 / I1 / I2 / I3
  - 機能安全監査・機能安全アセスメント: — / — / I0 / I2 / I3
- 事実として読めること
  - 表1 は **QM の列を持ち**、HARA の確認レビューは QM の列でも I3
  - 後段の成果物(安全計画など)は QM の列が「—」(確認措置を課さない)。HARA と影響分析だけが QM でも I3
- 本件への示唆
  - ISO 26262 は、判定の結果が最も低い(QM)場合にも、**判定の成果物そのもの**を最も遠い距離(I3)で確かめさせる。低い判定によって確認を逃れる循環を、表の行の作り方で塞いでいる
  - 距離の軸は「管理(指揮命令)・資源・リリース権限」の3つ。人数の軸は無い
  - CL0 の判定の確認を、CL に依らない段で定める案は、この構造と同型になる
- 未確認: ISO 26262-3 の HARA の節に「全ハザードが QM でも HARA の成果物を作り、確認レビューに付す」旨の文言があるか(ANSI のプレビューは 403 で取得できず)

### 1.1 業界の実務(二次)

- Kugler Maag「HARA」(https://www.kuglermaag.com/functional-safety/hara/ 。本日は証明書の不一致で本文を取得できず、検索結果の抜粋で読んだ。取得日 2026-11-05)
  - 抜粋: "Ultimately, a HARA depends on the people who carry it out, however, despite the specifically prescribed method. To prevent misinterpretation and cheating, ISO requires HARA reviews and confirmations from an independent body."
  - 示唆: 実務家は、HARA を I3 にする理由を「**判定者の解釈と不正(低く付ける動機)を防ぐ**」と説明している。本件の「低い判定で独立の要求を逃れる循環」と同じ問題意識
- Kugler Maag「FSA」(#318 で読んだ。https://www.kuglermaag.com/functional-safety/fsa/ 、二次): 「ASIL C は別チーム、ASIL D は別部門または社外」。評価者の資格証は ISO では求められない(検索結果の抜粋)
- DNV「Automotive safety concept development and review」(https://www.dnv.com/services/automotive-safety-concept-development-and-review/ 。検索結果に出たのみで本文未読): 第三者機関が HARA・安全コンセプトのレビューをサービスとして提供している
- 推測(未確認): 自動車の OEM・Tier1 では、I3 の確認者は品質・機能安全の専門部門(社内の別部門)か、外部の評価機関が担う。社内の別部門が無い小規模な供給者は外部に委ねる

## 2. 医療機器ソフトウェア(IEC 62304 と FDA の文書化水準)

### 2.1 IEC 62304:2006+A1:2015 4.3 ソフトウェア安全クラス

- 本文は有償で未読。IEC Webstore のプレビュー(https://webstore.iec.ch/preview/info_iec62304{ed1.1}en.pdf)は本文を返さなかった(取得日 2026-11-05)
- 二次で確かめた範囲
  - URL: https://blog.johner-institute.com/iec-62304-medical-software/safety-class-iec-62304/ (Johner Institute、Claudia Schmitt、2025-10-15 全面改稿。取得日 2026-11-05)
  - 要旨(要約経由): 製造業者が分類しなければ、ソフトウェアとすべてのソフトウェア要素は最上位のクラス C に入る。クラスを下げられるのはソフトウェアの外の手段だけで、その外部手段は実装と有効性の検証が要る。分類の確認は設計レビューで行うことを勧める
  - 承認者・確認者を誰とするかは、この記事には書かれていない
  - 同研究所は、改訂版 IEC 62304(草案)がクラスを3つから2つへ減らす計画と伝える(検索結果の抜粋。https://johner-institute.com/articles/software-iec-62304/safety-classes-level-of-concern 。未読)
- 記憶に依る内容(**未確認**。原文の照合が要る)
  - 4.3 a): 製造業者は各ソフトウェアシステムにクラス A・B・C を割り当てる
  - 初版 2006 の 4.3 f) 相当: 「クラスを割り当てるまでは、クラス C の要求事項を適用する」旨
  - クラスと根拠はリスクマネジメントファイル(ISO 14971)に文書化する旨
- 本件への示唆
  - IEC 62304 は、低い判定の循環を「**未判定・未文書化なら最上位**」という既定値で塞ぐ(未確認の箇所を含む)。確認者の独立性で塞ぐ ISO 26262 とは別の型である
  - 62304 自体は分類の確認者に組織上の距離を課していない(読めた範囲)。確認は ISO 13485 の設計レビュー(7.3.5)と、規制当局の審査へ委ねられる

### 2.2 FDA「Content of Premarket Submissions for Device Software Functions」(2023-06-14)

- URL: https://www.fda.gov/media/153781/download
- 取得日: 2026-11-05
- 読み: 一次(規制当局の最終ガイダンス。拘束力の無い推奨)
- 該当箇所と原文
  - §V(p.8): "Enhanced Documentation should be provided for any premarket submission that includes device software function(s) where a failure or flaw of any device software function(s) could present a hazardous situation with a probable risk of death or serious injury ... These risks should be assessed prior to implementation of risk control measures."
  - §V(p.8): "Basic Documentation should be provided for any premarket submission that includes device software function(s) where Enhanced Documentation does not apply."
  - §V(p.9): "It is the sponsor's responsibility to proactively and comprehensively consider risks as part of the device's risk assessment."
  - §V(p.9、クラス III・複合製品について): "a sponsor may determine that an Enhanced Documentation level does not apply. In such cases, the sponsor should provide an appropriately detailed rationale as to why Basic Documentation instead of Enhanced Documentation is appropriate ... FDA may request additional information if needed"
  - §VI.A(p.12): "A statement indicating the Documentation Level for the device and a description of the rationale for such Documentation Level. The rationale should account for the device's intended use, and include references ... (such as Risk Management File, Software Description, etc.)"
  - 脚注45(p.16): ソフトウェア故障の確率を見積もれないときは "the probability for the software failure occurring should be set to 1"
  - §VI.C(3)(p.18): リスクマネジメント報告書は "Demonstrate that the risk management file has been assessed by the appropriate personnel"
  - 付録 A 例1(p.29): ソフトウェアを含まない機器も "Rationale: The device does not contain software. Outcome: No Documentation Level" と、**理由と結果を書く形**で示す
- 事実として読めること
  - 判定(Basic / Enhanced)は申請者が行い、**低い方(Basic)を選ぶ場合も理由を書かせる**。理由は判定の様式の必須欄(表1 の最初の行)
  - 判定はリスクコントロール措置の**前**のリスクで行う。対策で下げてから低い判定を取ることを封じる
  - 申請者の判定を確かめるのは**規制当局の審査**(FDA が追加情報を求められる)。事前相談(Pre-Submission)で判定への意見を得る道もある
  - 組織内の確認者の独立性は、このガイダンスは定めていない
- 本件への示唆
  - 「安全に関係しない」側の判定にも、**判定の記述と理由の欄を必須にする**のが規制当局の型。CL0 を「何も書かなくてよい」区分にしない根拠になる
  - 「対策前のリスクで判定する」は、CL の判定基準を緩める抜け道(対策を前提にして CL を下げる)を塞ぐ規定として参考になる
  - 外部の審査者(当局)がいる業界では、判定の最終確認は組織の外に置かれる。本標準が想定する外部の審査者のいない案件では、その代わりを組織内に置くかが論点になる

## 3. 航空(DO-178C の DAL と、その承認)

### 3.1 EASA AMC 20-115D(ED Decision 2017/020/R)

- URL: https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-acceptable-means?page=22
- 取得日: 2026-11-05
- 読み: 一次(規制当局の適合方法。FAA AC 20-115D と調和)。FAA の AC 20-115D・Order 8110.49A の PDF は 403 で取得できず
- 原文の引用(要約ツール経由の逐語)
  - ¶9.b.2: "The system safety process assigns the minimum development assurance level based on the severity"
  - ¶6.a: "satisfy all of the objectives associated with the software level assigned to the software"
  - ¶6.b: "The applicant should submit to EASA the life cycle data specified in Section 9.3 of ED-12C/DO-178C"
  - ¶6.e: EASA は "stating the required relationship between the criticality of the software-based systems and the software levels" の AMC を出しうる
- 事実として読めること
  - ソフトウェアレベルは**ソフトウェア開発の外(システム安全評価)**で、故障状態の重大度から割り当てられる。ソフトウェア側が自分のレベルを決めない
  - 申請者は DO-178C 9.3 の生涯データ(PSAC を含むと理解。9.3 の中身は未確認)を当局へ提出する
  - Level E(安全上の影響なし)の扱いは、この AMC には書かれていない
- 二次で補う内容(未確認)
  - DO-178C 11.1 の PSAC は「提案するソフトウェアレベルと、システム安全評価による正当化の要約」を書く欄を持つ、と複数の解説が伝える(Visure Solutions https://visuresolutions.com/do-178-guide/ ほか。本文未読)
  - FAA の Order 8110.49A は当局の関与度(SOI)を定める(同上、未読)
- 本件への示唆
  - 航空は、判定(DAL)を**作る主体を開発から切り離す**(システム安全評価)ことで、低い判定の循環を塞ぐ。さらに PSAC で当局が合意する
  - 判定の確認の独立性は「組織上の距離の段」ではなく、「判定を作る工程を別にする」と「当局が計画段階で同意する」の二重で表される

## 4. IEC 61508(機能安全評価の独立性と、評価の範囲)

- 本文は有償で未読。#318 で読んだ二次(Bell 2014、exida 2006、safecontrols 2015)を再掲する
  - 表4(結果の重大さ別、ライフサイクルの段階 1〜8・12〜16)と表5(SIL 別、段階 9〜10)の2表で、評価者の独立性を「独立した人・独立した部門・独立した組織」の三段で決める
  - Bell: "If a lower level of independence is adopted, then the rationale has to be specified."
- 新しく確かめたこと
  - URL: https://www.intertek.com/blog/2026/05-26-functional-safety-iec-61508-1-clause-8/ (Intertek、James Lynskey、2026-05-26。取得日 2026-11-05、二次)
  - 引用: "Information on this can be found in IEC 61508-1, cl. 8.2.18, tables 4 and 5."(#318 で未確認だった条項番号 8.2.18 を二次で裏付けた)
  - 独立性は "not binary" で、低い SIL は社内の役割の分離、高い SIL は組織・管理の分離と開発組織から独立した評価、と説明する
- 範囲の論点(未確認)
  - 表4 が扱う段階 1〜8 には段階 3「ハザードとリスクの分析」が含まれる、と理解している(全体の安全ライフサイクル図による)。この理解が正しければ、IEC 61508 は**ハザード分析の段階を、結果の重大さ(SIL ではない)で決まる独立性の評価に付す**。判定した SIL を使わずに独立性を決めるので、低い SIL の判定で評価の独立性が下がる循環を避けている
  - 原文での確認が要る。IEC 61508-1 の 1997 草案(https://www.mdcpp.com/doc/standard/IEC61508-1-1997.pdf)は取得が時間切れで読めなかった
  - 第3版(IEC 61508-1 ED3)は独立性の段階を附属書 B に足す計画と伝えられる(https://genorma.com/en/standards/iec-61508-1-ed3/amp 、検索結果の抜粋のみ)
- 本件への示唆
  - 「判定に使う尺度とは別の尺度(結果の重大さ)で、判定の確認の独立性を決める」設計は、CL の判定の確認の段を CL から切り離す案の先例になりうる(未確認の前提あり)

## 5. 鉄道(EN 50126・EN 50128 / EN 50716)

- 本文は有償で未読。以下はすべて二次
- MathWorks「Build Railway Applications to EN 50716 with Model-Based Design」(Abu-Alqumsan・Erkkinen、2026、https://ch.mathworks.com/company/technical-articles/build-railway-applications-en-50716.html 。取得日 2026-11-05)
  - 引用: "the required software integrity level is determined and assessed at the system level" / "based on the system safety integrity level (SIL)"
  - 引用: "Software integrity is specified as one of five defined levels ranging from Basic Integrity (lowest) to SIL 4 (highest)."
- AdaCore「AdaCore Technologies For Railway Software」第2章(https://learn-latest.adacore.com/booklets/adacore-technologies-for-railway-software/chapters/cenelec.html 、取得日 2026-11-05): Basic Integrity は "pertains to software that is not safety related"(EN 50716 第4章の説明)
- CSA Engineering(#318 で読んだ。https://www.csa.ch/en/blog/the-new-en-50716-rules-for-project-organisation): 基本完全性(旧 SIL0)では評価者は要らない。SIL1 以上で独立した評価者を置く
- 事実として読めること(二次)
  - ソフトウェアの SIL は**ソフトウェアの規格の外(システム側、EN 50126・50129)**で決まり、そこで評価される
  - 「安全に関係しない」ソフトウェアにも Basic Integrity という**明示の区分**を置き、品質保証の要求を残す。旧来の SIL0 も同じ位置づけ
  - Basic Integrity の案件には評価者が要らない。したがって、ソフトウェアの規格の内側では、Basic Integrity とする判定を独立の評価者が確かめる仕組みは無い。確認はシステム側の工程に委ねられる
- 未確認: EN 50126-2 で、SIL の割当(ハザードログ)を評価者が確かめるか、その独立性

## 6. 横断の整理

- 低い判定による循環の塞ぎ方は、規格ごとに次の5つの型に分かれる
  - **型A: 判定の成果物の確認を、判定の結果に依らない最上段にする**
    - ISO 26262-2 表1: HARA・影響分析は QM でも I3(一次・翻訳草案)
  - **型B: 判定の確認の独立性を、判定とは別の尺度で決める**
    - IEC 61508-1 表4: 段階 1〜8 の評価は結果の重大さで独立性を決める(段階 3 を含むかは未確認)
  - **型C: 判定を作る工程を開発から切り離す**
    - DO-178C / AMC 20-115D: システム安全評価が DAL を割り当てる(一次)
    - EN 50716: SIL はシステム側で決め、評価する(二次)
  - **型D: 未判定・未文書化の既定値を最上位にする**
    - IEC 62304: 分類しなければクラス C(二次。原文未確認)
  - **型E: 低い判定にも理由の記述を必須にし、外部の審査者が確かめる**
    - FDA ガイダンス: Basic でも判定と理由を書く。クラス III で Basic を採るなら詳しい理由。対策前のリスクで判定(一次)
    - DO-178C: PSAC で当局が合意(二次)
- 確認者の担い手
  - 組織内の別部門: ISO 26262 の I3、IEC 61508 の独立した部門
  - 外部の組織: ISO 26262 の I3 の一部(社外の評価機関)、IEC 61508 の独立した組織、EN 50716 の評価者(顧客・供給者・第三者のいずれでもよい、#318 のメモ)
  - 規制当局: FDA の審査、EASA・FAA の PSAC 合意
- 規格が**課していない**こと(読めた範囲)
  - 判定の確認に関わる人数の下限
  - 判定者の資格証(ISO 26262 は評価者の資格証を求めない、検索結果の抜粋)

## 7. 考察(推測を含む。事実と区別する)

- 本件の論点のうち「CL0 の判定そのものを確かめるか」について、調べた規格は**どれも、最も低い判定を確認の外に置かない**。塞ぎ方は型 A〜E と異なるが、「低い判定だから確認が要らない」とした規格は見つからなかった
  - ただし、EN 50716 の Basic Integrity と ISO 26262 の QM は、**後段の成果物**の確認・評価を外す。外さないのは判定の成果物(HARA・SIL 割当)だけ
- 本標準の CL に当てはめる案(会議体へ渡す材料)
  - 案1(型A): CL の判定と安全リスクアセスメントの確認者には、CL に依らず最も遠い段を課す。CL0 も同じ段で確かめる。ISO 26262 と同型
  - 案2(型B): 判定の確認の段を、判定に使う CL ではなく、案件の別の属性(想定される最悪の結果、対象の領域)で決める
  - 案3(型D+E): CL0 の判定にも理由の欄を必須にし、未判定なら最上位の CL として扱う。確認の段は課さない
  - 推測: 案3 だけでは、外部の審査者(当局)のいない案件で理由の質を確かめる者がいない。FDA・EASA の型は当局の審査を前提にしている
- 人数の少ない体制での到達可能性(推測)
  - I3 相当(管理・資源・リリース権限の分離)は、1〜2名の組織では社内で満たせない。ISO 26262 の実務では外部の評価機関に委ねる。本標準で案1 を採ると、小規模の案件では CL0 の判定のたびに外部の確認者が要る
  - 型C(判定を作る工程を分ける)と型D(既定値を最上位)は、人数に依らず到達できる
- 根拠水準: 本節の案はいずれも外部規格の構造からの類推で、本標準の案件での実証は無い。採るときは ADR-0026 のマークで開示する必要がある

## 8. 埋められなかった穴(追加調査が要る)

- ISO 26262-3:2018 の HARA の節の原文(QM だけの結果でも HARA を作り、確認に付す旨の文言の有無)。ISO 26262-2 の発行版 GB/T 34590.2-2022 と草案の差
- IEC 62304:2006+A1:2015 4.3 の原文(クラス C の既定値、リスクマネジメントファイルへの文書化)。ISO 14971 との接続の条項
- IEC 61508-1:2010 の表4 の対象段階に段階 3(ハザードとリスクの分析)が含まれるか。8.2.18 の本文
- DO-178C 2.3・11.1 の原文、FAA Order 8110.49A の SOI#1 で当局が DAL に同意する手続き、ARP4754A・ARP4761 の FHA・PSSA の確認者
- EN 50126-2 の SIL 割当の確認と評価者の独立性。EN 50716 の Basic Integrity の判定の確認
- 業界の実務: OEM・医療機器メーカーで、判定の確認を誰(安全管理者・社内の別部門・外部機関)が担うかの一次資料(社内規程・監査報告)。日本の企業での実態(建前と運用の乖離)は今回の範囲で見つけられなかった

## 出典の一覧

| 出典 | URL | 読み | 取得日 |
|---|---|---|---|
| GB/T 34590.2 征求意见稿(ISO 26262-2 の修正採用) | https://www.catarc.org.cn/upload/202104/29/202104291547457908.pdf | 一次(翻訳草案) | #318 で取得 |
| FDA Content of Premarket Submissions for Device Software Functions | https://www.fda.gov/media/153781/download | 一次 | 2026-11-05 |
| EASA AMC 20-115D | https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-acceptable-means?page=22 | 一次 | 2026-11-05 |
| Johner Institute「Safety class IEC 62304」 | https://blog.johner-institute.com/iec-62304-medical-software/safety-class-iec-62304/ | 二次 | 2026-11-05 |
| Intertek「IEC 61508-1 clause 8」 | https://www.intertek.com/blog/2026/05-26-functional-safety-iec-61508-1-clause-8/ | 二次 | 2026-11-05 |
| MathWorks「EN 50716」 | https://ch.mathworks.com/company/technical-articles/build-railway-applications-en-50716.html | 二次 | 2026-11-05 |
| AdaCore「Railway Software」第2章 | https://learn-latest.adacore.com/booklets/adacore-technologies-for-railway-software/chapters/cenelec.html | 二次 | 2026-11-05 |
| Kugler Maag「HARA」 | https://www.kuglermaag.com/functional-safety/hara/ | 二次(抜粋のみ) | 2026-11-05 |
| CSA Engineering「EN 50716 project organisation」 | https://www.csa.ch/en/blog/the-new-en-50716-rules-for-project-organisation | 二次 | #318 で取得 |
