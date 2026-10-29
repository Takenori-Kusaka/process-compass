# #313 外部調査 2: 版の付け方・改訂時の適合主張・適用の終了・他規格の引用

- 調査日: 2026-10-24。WebSearch / WebFetch による。本リポジトリのファイルは本書以外を変更していない
- 対象: 外部の規格・認証制度・公開仕様が、(1) 版の付け方と改訂時の適合主張、(2) 適用の終了、(3) 逸脱・テーラリングを伴う適合主張、(4) 他規格の版の引用、をどう規定しているか
- 内部の現状(本標準が現在どう書いているか)は扱わない。会議体の資料を参照

## 0. 読み方

### 0.1 検証の区分

| 記号 | 意味 |
| --- | --- |
| **[原文]** | 一次資料の本文を取得し、引用を原文で確かめた。引用は原文のまま(英語) |
| **[原文・部分]** | 一次資料の一部(プレビュー・抜粋・一次資料を転載した二次サイト)だけを確かめた |
| **[二次]** | 解説サイト・認証機関の手引き・要約でしか確かめていない |
| **[未確認]** | 取得して確かめられなかった。**条項の根拠にしない** |

取得には要約を返すツール(WebFetch)を使った。**[原文]の引用も、ツールが抜き出した文字列である**。条項に引くときは、出典台帳(`research/sources/`)へ登録する段階で再取得して照合すること。

### 0.2 4つの問い

- **Q1 版と改訂時の適合主張**: 版番号の付け方、移行期間、版に紐づく主張、発行年付き/なしの引用
- **Q2 適用の終了**: 認証の取消し・案件の終結・適用範囲の変更を、どう「終了」と定義するか
- **Q3 逸脱・テーラリングを伴う適合主張**: 完全適合と修整適合、代替措置、開示義務
- **Q4 他規格の版の引用**: 規格が他規格を引くときの書式

---

## 1. ISO/IEC Directives Part 2 — 発行年付き引用と発行年なし引用(Q1・Q4)

出典: *ISO/IEC Directives, Part 2 — Principles and rules for the structure and drafting of ISO and IEC documents*, Ninth edition, 2021, ISO/IEC, <https://www.iso.org/sites/directives/current/part2/index.xhtml>(既存 SRC-0633)

### 1.1 引用の2方式 **[原文]**

- 箇条2(引用規格の導入文の定型): "For dated references, only the edition cited applies."(発行年付きの引用は、引いた版だけが適用される)
- 箇条10.4(発行年なしの引用): 発行年なしの引用は "only to a complete document"(文書全体に対してだけ)可能であり、"when it is understood that the reference will include all amendments to and revisions of the referenced document" のときに限る
- 箇条10.4: "The date of publication or dash (see 10.5) shall not be given for undated references."
- 箇条10.5(発行年付きの引用): 引用は "a specific edition, indicated by the date of publication" または草案を示すダッシュのいずれかを指す。"For dated references, each shall be given with its year of publication."
- 箇条10.5: **部分を引くときは必ず発行年を付ける** — "References to specific elements such as clauses, tables, or figures shall always be dated, because these elements are sometimes renumbered in subsequent editions."
- 箇条10.5: "If the referenced document is amended or revised, the dated references to it shall be reviewed"(改訂されたら、発行年付き引用を見直す義務がある)
- 箇条10.2: "The committees shall validate all referenced documents when a document is revised."
- 箇条10.6: "Such undated references are understood to include all amendments and revisions to the referenced document."

### 1.2 適合主張の前提 **[原文]**

- 箇条3.3.3(requirement の定義): 要求事項とは "from which no deviation is permitted if conformance with the document is to be claimed"(適合を主張するなら逸脱が許されない事項)
- 箇条7.1: 利用者は "the requirements he/she is obliged to satisfy in order to claim conformance to a document" を識別できなければならない
- 箇条4: "A document does not in itself impose any obligation upon anyone to follow it." 義務は法令または契約が規格を引くことで生じる

### 1.3 Q1〜Q4 への関わり

- **Q4 の中核**。本標準が他規格を引くときの既定書式の根拠になる。**部分(節・表・図)を引くなら発行年必須、文書全体なら発行年なしも可(ただし全改訂を取り込む覚悟が要る)** という二分が、そのまま採れる
- **Q1 にも効く**。「発行年付き引用は引いた版だけが適用される」という規則は、適合主張を版に紐づける書式(例: 「本標準 2026-10 版に適合」)の正当化に使える
- **Q3 に効く**。「要求事項とは、適合を主張するなら逸脱が許されない事項」は、逸脱を伴う主張を「適合」と呼べない根拠になる。逆に、逸脱を許す設計にするなら、要求事項以外の層(推奨・手引き)として書く必要がある
- 取得できなかった: 箇条33「Aspects of conformity assessment」の本文。ページが長く、2回のオフセット取得でも該当箇所に届かなかった **[未確認]**

---

## 2. ISO/IEC/IEEE 12207・15288・42020 — 完全適合と修整適合(Q1・Q3)

### 2.1 条項の構造 **[原文・部分]**

- ISO/IEC/IEEE 12207:2017 の箇条4は「4 Conformance / 4.1 Intended usage / 4.2 Full conformance(4.2.1 Full conformance to outcomes、4.2.2 Full conformance to tasks)/ 4.3 Tailored conformance」。附属書Aは "Tailoring process"(規範)
  - 出典: *BS ISO/IEC/IEEE 12207:2017* プレビュー, BSI, 2017, <https://webstore.ansi.org/preview-pages/BSI/preview_30295695.pdf>
  - 同プレビューの箇条1.2: "Annex A provides normative direction regarding the tailoring of these software life cycle processes."
  - 序文: "An organization, depending on its purpose, can select and apply an appropriate subset to fulfill that purpose."
- ISO/IEC/IEEE 12207:2026(第2版、2026-04)の箇条4は「4.1 General / 4.2 Full conformance(outcomes / tasks)/ 4.3 Tailored conformance」。2017 年版の "4.1 Intended usage" が "4.1 General" に変わっている
  - 出典: *ISO/IEC/IEEE 12207:2026* プレビュー, ISO/IEC/IEEE, 2026, <https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed2.0%7Den.pdf>(既存 SRC-0491)
  - まえがき: "This second edition cancels and replaces the first edition (ISO/IEC/IEEE 12207:2017), which has been technically revised."
  - 引用規格: "There are no normative references in this document."
- ISO/IEC/IEEE 15288:2023 も同じ構造(4 Conformance / 4.1 Intended usage / 4.2 Full conformance / 4.3 Tailored conformance)。まえがき: "This second edition cancels and replaces the first edition (ISO/IEC/IEEE 15288:2015), which has been technically revised." 出典: <https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee15288%7Bed2.0%7Den.pdf>
- ISO/IEC/IEEE 42020:2019 は「4.1 General / 4.2 Approach to conformance / 4.3 Full conformance cases / 4.4 Tailored conformance」(目次のみ)
- **箇条4の本文は、無料プレビューでは一切公開されていない**。12207(2017/2026)・15288(2023)・42020(2019)の4文書すべてで目次だけが見える。有償購入が要る **[未確認]**

### 2.2 テーラリングの手続き(42020 附属書A 経由) **[原文]**

ISO/IEC 42020 の附属書A(規範「Tailoring process」)は "adapts annex A of ISO/IEC/IEEE 15288" と自ら述べており、15288 系のテーラリング手続きの文面が読める唯一の無償経路だった。

出典: *ISO/IEC 42020 Annexes*(Annex A (normative) Tailoring process), QualiWare COE 掲載 PDF, 2019, <https://coe.qualiware.com/wp-content/uploads/2016/11/42020annexes.pdf>

- 成果(A.3.2): "Justification for tailoring is provided in support of ensuring a successful outcome to the architecture processes."
- 作業(A.3.3): テーラリングの事情(環境の不安定性・リスク・安全やセキュリティの完全性)を**識別し記録する**
- 作業(A.3.3 e): "Record the rationale for the tailoring in terms of the reason for tailoring" — 理由・影響を受けるプロセス・影響の性質と程度を記録する
- 作業(A.3.3 g): "Provide explanation for why a life cycle process was tailored or why an outcome, activity, or task was deleted."
- 作業(A.3.3 c): 影響を受ける利害関係者から意見を得る。(d) テーラリングの決定は決定管理プロセスを通す
- **完全適合を主張する場合はテーラリングが許されない。修整適合の主張にはこのプロセスの適用が要る**(ツールによる本文要約。条項番号の特定は未了) **[原文・部分]**

### 2.3 Q1〜Q4 への関わり

- **Q3 の中核**。「完全適合」と「修整適合」を2段に分け、修整適合には**削除した成果・活動・作業ごとの理由の記録**を課す、という設計が国際規格の既定路線である。本標準が「代替措置つきの逸脱があっても適合と呼べるか」を決めるとき、**呼べるが名前を変える(修整適合)** という解が先例を持つ
- **Q1 に効く**。「第2版は第1版を取消し置き換える(cancels and replaces)」という定型が、改訂時の旧版の扱いの既定である。**旧版は併存しない**。移行期間は規格本文ではなく認証制度側(第4節)が持つ
- **Q4 に効く**。12207:2026 は「引用規格なし」。プロセス規格が他規格を規範として引かない設計もあり得る
- 本調査の最大の空白: **12207/15288 の箇条4本文を原文で取れていない**。本標準が「完全適合/修整適合」の語を借りるなら、購入して文面を照合する必要がある

---

## 3. ISO/IEC 33001 系 — 適合性と適合性評価の切り分け(Q3)

出典: *ISO/IEC 33001:2015 Information technology — Process assessment — Concepts and terminology* プレビュー, ISO/IEC, 2015, <https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiec33001%7Bed2.0%7Den.pdf>

- 序文 **[原文]**: "General issues relating to the application of conformity assessment to process capability and organizational process maturity are addressed in ISO/IEC 29169."
- まえがき **[原文]**: "This second edition cancels and replaces ISO/IEC 15504-1:2004, which has been technically revised."(33xxx 系が 15504 系を置き換えたことの一次確認)
- 箇条7「Conformance」と箇条8「Conformity assessment」は目次にあるが本文はプレビューに無い **[未確認]**
- Automotive SPICE 4.0 は自ら "The Automotive SPICE process reference model and process assessment model are conformant with the ISO/IEC 33004:2015" と宣言し、測定枠組を "An ISO/IEC 33003:2015 compliant Measurement Framework" と述べる **[原文・部分]**(出典は第6節)

### Q1〜Q4 への関わり

- **Q3 に効く**。33001 系は「規格文書そのものの適合性(conformance)」と「組織の適合性評価(conformity assessment)」を**別の箇条・別の規格(29169)に分けている**。本標準も、(a) 文書が標準に適合しているかと (b) 組織の運用が標準に適合しているか、を別語彙で書き分ける先例になる
- **Q1 に効く**。33001 が 15504-1 を「取消し置き換え」した例は、**体系の番号ごと変える改訂**(マイナー改訂ではなく系列の付け替え)の実例である

---

## 4. 認証制度の移行期間 — IAF / ISO 9001 / ISO 27001(Q1・Q2)

### 4.1 ISO/IEC 27001:2022 — IAF MD 26 **[原文]**

出典: *IAF MD 26:2022 (Issue 2, 15 January 2023) Transition Requirements for ISO/IEC 27001:2022*, International Accreditation Forum, 2023, <https://www.sac-accreditation.gov.sg/files/Documents/iaf_md26_issue_2_15012023.pdf>

- 移行期間: "Transition Period: 3 Years (36 months)" — "CAB transitions of certified clients completed by 36 months from the last day of publication month of ISO/IEC 27001:2022"(= 2025-10-31)
- 新規・更新審査の切替期限: "Initial certification and recertification by CAB to ISO/IEC 27001:2022 only, to begin no later than 18 months from the last day of publication month of ISO/IEC 27001:2022 (i.e. 30 April 2024)"
- 旧版の認証の終期: **"All certifications based on ISO/IEC 27001:2013 shall expire or be withdrawn at the end of the transition period."**
- 移行審査の工数: 更新審査と併せるなら "Minimum of 0.5 auditor day"、維持審査と併せるか単独なら "Minimum of 1.0 auditor day"
- 移行審査だけで証書を更新した場合: "the expiration of its current certification cycle will not be changed."(**移行は認証サイクルの期日を動かさない**)
- 認定機関側の期限: 認証機関の 2013 年版に対する認定の "expiry date ... shall not be later than the end of the transition period."

補足 **[二次]**: NSAI の移行方針は、期間終了後に旧版証書が「expire」し "certification formally withdrawn" となると述べる(<https://www.nsai.ie/certification/management-systems/iso-iec-27001-information-security-management-system/iso-iec-270012022-transition-policy/>, NSAI, 2023)。

### 4.2 ISO 9001:2015 — 3年移行の原型 **[原文・部分] / [二次]**

- ISO/TC 176 の告知 **[原文・部分]**: "The 3 year transition period that was agreed for accredited certification" / **"Accredited certification to ISO 9001:2008 is no longer valid."**(2018-09-18 付)
  - 出典: *The ISO 9001:2015 transition period has ended*, ISO/TC 176, 2018, <https://committee.iso.org/sites/tc176/home/news/content-left-area/news-and-updates/the-iso-90012015-transition-peri.html>
- UKAS の技術情報 **[二次]**: 移行期間は "3-year transition period (from date of publication of the standard)"、終期は 2018-09。根拠文書として "IAF ID 9: 2015 – Transition Planning Guidance for ISO 9001: 2015"(2015-01-12)を挙げる
  - 出典: *ISO 9001:2015 – status and transition planning*, UKAS, 2015, <https://www.ukas.com/resources/technical-bulletins/iso-9001-2015-status-and-transition-planning-2/>
  - IAF ID 9 の一次 PDF は Accredia 掲載 URL が 404 で取得できなかった **[未確認]**

### 4.3 ISO 9001:2026 — 現行の移行(直近事例) **[二次]**

出典: *ISO 9001:2026 is live – the transition period has begun*, LRQA, 2026, <https://www.lrqa.com/en/latest-news/iso-9001-2026-live/>

- 発行: "ISO 9001:2026 was published today, 16 September 2026."
- 移行: "have three years to complete their transition, with the period running to the 30 September 2029."
- 旧版: 2015 年版の証書は移行期間中は有効("remains valid throughout the transition period")で、期間後は "ISO 9001:2026 certifications will expire or be withdrawn"(原文は 2015 の意。記事の記述に揺れがある点を注意)

### 4.4 Q1〜Q4 への関わり

- **Q1 の中核**。改訂時の既定は「**発行月末から36か月の移行期間**」「**18か月で新規・更新の受付を新版のみに切る**」「**期間終了で旧版の主張は失効または取消し**」の3点セットである。数字が制度横断で揃っている(ISO 9001:2015、27001:2022、9001:2026 すべて3年)
- **Q2 に効く**。「失効(expire)」と「取消し(withdrawn)」が並記されており、**終了には2経路がある**(期日到来による自然失効と、能動的な取消し)
- 移行は認証サイクルの期日を動かさない、という規則は、**移行を「新たな適合主張」ではなく「既存主張の版の差し替え」として扱う**設計である

---

## 5. 適用の終了 — 認証の取消し・適用範囲の縮小(Q2)

### 5.1 ISO/IEC 17065 の条項構成 **[原文・部分]**

出典: *ISO/IEC 17065:2012 Conformity assessment — Requirements for bodies certifying products, processes and services* プレビュー, ISO/IEC, 2012, <https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiec17065%7Bed1.0%7Den.pdf>

- 箇条7.10 "Changes affecting certification"、箇条7.11 "Termination, reduction, suspension or withdrawal of certification" が存在する(目次で確認。本文はプレビューに無い) **[未確認]**
- 序文 **[原文]**: 適合の表明は "can be in the form of certificates and/or marks of conformity"
- **「終了」「縮小」「一時停止」「取消し」の4語が1つの箇条にまとめられている**という構成そのものが、Q2 の設計に直接使える

### 5.2 認証機関の運用規程(17021 系の実装例) **[二次]**

出典: *P008 Certification Reduction of Scope, Suspension or Withdrawal*(rev 3, 2016-03-16), TUV USA, <https://www.tuv-nord.com/fileadmin/Content/TUV_NORD_COM/TUV_USA/Documents/Quality_Management_Documents/P008_Certification_Reduction_of_Scope_Suspension__or_Withdrawal_rev_3_03162016.pdf>

- 一時停止は顧客が無応答・是正が無効な場合(4.5.1)、原因が継続するなら取消し(4.5.7)、一時停止は "In most cases, suspension does not exceed 6 months."(4.5.8)、適用範囲の縮小は十分な証拠が集まり顧客が措置を取らない場合(4.4.2)
- 取消し後の義務: "the decertified client must cease to display or otherwise use the certificate and the logos."(4.6.3)。顧客への通知義務(4.6.4)

### 5.3 CMMI — 評定結果の有効期限 **[原文]**

出典: *Appraisal Types*, ISACA / CMMI Institute, <https://cmmiinstitute.com/learning/appraisals/types>

- Benchmark Appraisal の結果有効期間: "3 years"
- Sustainment Appraisal の結果有効期間: "2 years"。"To maintain the previous rating validity, a Sustainment Appraisal must be completed and accepted by ISACA" を期限前に済ませる必要がある
- "No more than three Sustainment Appraisals in a row may be conducted before another Benchmark Appraisal is required."
- このページにはモデル版(V2.0 / V3.0)の移行・サンセットの記載が**無い** **[未確認]**。V2.0 → V3.0 の移行期限を述べる一次文書は見つけられなかった(ITG の解説ページにも日付が無かった)

### 5.4 Q1〜Q4 への関わり

- **Q2 の中核**。外部の制度は「適用の終了」を**3つの異なる事象**として別々に規定している
  1. **期日到来による失効**(CMMI の3年/2年、認証サイクルの満了、移行期間の終了)
  2. **能動的な取消し・一時停止**(原因・猶予・最大期間・解除条件つき)
  3. **適用範囲の縮小**(主張は残るが対象が狭まる)
- 取消し後の「**表示をやめる義務**」が明文であることは重要。本標準が適合バッジ・リポジトリ記載を持つなら、終了後の表示撤去を規定する先例になる
- 「案件の終結」を終了事由として明記した一次資料は見つけられなかった。認証制度は組織を対象にするため、案件単位の終結は MISRA(第7節)のような**案件ごとの適合主張**の側にある

---

## 6. Automotive SPICE 3.1 → 4.0(Q1・Q4)

出典: *Automotive SPICE Process Assessment / Reference Model Version 4.0*, VDA Quality Management Center (VDA WG 13), 2023, <https://vda-qmc.de/wp-content/uploads/2023/12/Automotive-SPICE-PAM-v40.pdf>(既存 SRC-0554)

- 版の表示 **[原文・部分]**: 表紙 "Version: 4.0" / "Status: Released"。著作権表示 "This document is a revision of the Automotive SPICE process assessment model and process reference model 3.1"
- 改訂履歴: "4.0 2023-10-20 VDA QMC WG13 Complete revision of PAM"。表紙の日付(2023-11-29)と履歴表の日付(2023-10-20)が食い違うが、文書に説明は無い
- 他規格の引用はすべて**発行年付き**: ISO/IEC 33004:2015、ISO/IEC 33003:2015、ISO/IEC 33020:2019、ISO/SAE 21434、ISO 26262-8:2018、PAS 1883:2020 等
- **移行期間・施行日の規定は PAM 本文に無い** **[原文・部分]**。アセスメントの移行規則は intacs / VDA QMC 側の運用文書にあると見られるが、intacs の該当ページはログイン必須で取得できなかった **[未確認]**
- 二次 **[二次]**: "The latest version ... released in November 2023 as Automotive SPICE 4.0" / "This latest version replaces the Automotive SPICE 3.1"(<https://en.wikipedia.org/wiki/Automotive_SPICE>)。アセスメント結果の有効期間の記載は無い

### Q1〜Q4 への関わり

- **Q1 に効く**。モデル側は「全面改訂」「3.1 を置き換える」とだけ書き、**移行の期日は運用(認証・アセスメント)側に置く**。規格本文と移行規則の分離は ISO/IAF と同じ構造である
- **Q4 の実例**。プロセスアセスメントモデルが他規格を引くとき、**全件発行年付き**という実務が確認できる

---

## 7. MISRA Compliance:2020 — 逸脱つき適合の最良の先例(Q3)

出典: *MISRA Compliance:2020 — Achieving compliance with MISRA Coding Guidelines*, MISRA / HORIBA MIRA, 2020, <https://misra.org.uk/app/uploads/2021/06/MISRA-Compliance-2020.pdf>

### 7.1 逸脱(deviation) **[原文]**

- 用語集: 逸脱とは "A violation which has been formally accepted and approved."
- 逸脱記録に含めるもの(4.2): "A concise description of the circumstances in which a violation is acceptable" / "The reason why the deviation is required" / **"A set of requirements to include any risk assessment procedures and precautions which must be observed."**
- 逸脱を認めてはならない場合(4.4): "Simply to satisfy the convenience of the developer" / "Without the support of a suitable process" / **"Without the consent of a designated technical authority."**
- 正当化の理由は4種に類型化(4.4): Reason 1 Code quality / Reason 2 Access to hardware / Reason 3 Adopted code integration / Reason 4 Non-compliant adopted code
- 逸脱許可(4.3): "A deviation permit defines a use case under which a violation may be justified." 注記 "Publication of common use cases as deviation permits by MISRA does not imply that they are acceptable"
- **「compensating measures(代替措置)」という語は使っていない**。最も近いのは 4.2 の risk assessment / precautions の要求

### 7.2 再分類計画(GRP)と逸脱できない層 **[原文]**

- 分類(5): Mandatory = "Guidelines for which violation is never permitted" / Required = "Guidelines which can only be violated when supported by a deviation" / Advisory = "Violations are identified but are not required to be supported by a deviation."
- 再分類の制限(5.1): "A Mandatory guideline may not be re-categorized in any way" / "A Required guideline may not be re-categorized as Advisory or Disapplied"
- Disapplied(5.1): "Violations of guidelines re-categorized as Disapplied are disregarded altogether."
- GRP は**着手時に取得者と供給者が合意する**(5.1): "the acquirer and supplier shall agree a guideline recategorization plan (GRP)"

### 7.3 適合の主張 **[原文]**

- 前提(7 冒頭): **"A project cannot be described as 'MISRA Compliant' unless development has been conducted in accordance"** with the process and principles in the document
- 適合要約(7.3): **"a guideline compliance summary (GCS) shall be produced to record the final compliance level claimed"**
- GCS の水準(7.3)は4値: **Compliant**("There are no violations of the guideline within the project")/ **Deviations**("There are violations of the guideline within the project which are all supported ... by deviations")/ **Violations**(逸脱に支えられていない違反がある)/ **Disapplied**("No checks have been made for compliance with the guideline.")
- 引き渡し(7.4): 供給者は GCS を "declaring the level of compliance which is being claimed" とともに、承認済みの逸脱許可と逸脱記録を提供する
- 自由と責任(1): "The freedom to deviate does not necessarily compromise claims of compliance, but it does carry with it great ..."(responsibility。文は途中で切れている)
- 取り込みコード(6.1): "adopted code" を区別し、"Compliance with MISRA Guidelines is neither a necessary nor a sufficient condition to ensure the quality of adopted code."
- 版への言及(4.4): "Similar considerations may arise when adopted code has been written to be compliant with a different version of The Guidelines."
- **GCS に「どの版のガイドラインに対する主張か」を書く明文の要求は見つからなかった**。文書は MISRA C:2012 を例示するが、版の明記そのものを義務づける文は確認できていない **[未確認]**

### 7.4 Q1〜Q4 への関わり

- **Q3 の中核かつ最良の先例**。「逸脱があっても適合」を実現する仕組みが、次の4点に分解されている
  1. **条項を3層に分ける**(絶対に逸脱できない / 逸脱記録があれば可 / 記録不要)
  2. **逸脱の要件を定める**(状況の記述・理由・リスク評価と予防措置・指名された技術権威の同意)
  3. **着手時に再分類計画を合意する**(事後に緩めない)
  4. **主張を条項ごとの表(GCS)で開示する**。「適合」と「逸脱あり」を**別の水準として表示する**
- 「適合」と「逸脱あり」を同じ語で呼ばない設計は、12207 の「完全適合/修整適合」と同型であり、**2つの独立した系統が同じ結論に達している**
- 「開発者の都合のため」「適切なプロセスの支えなしに」「指名された技術権威の同意なしに」逸脱を認めてはならない、という3つの禁止は、本標準の例外承認の条項へほぼそのまま移せる

---

## 8. DO-178C と FAA AC — 版の切替と「同じ版で続ける」許容(Q1・Q3)

出典: *AC 20-115C — Airborne Software Assurance*, U.S. Federal Aviation Administration, 2013, <https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115C.pdf>(後継は AC 20-115D。既存 SRC-0529)

- **[原文]** 旧版の継続使用を許す: "Applicants who have used DO-178B in the past... may still be able to use the same means of compliance for certification projects."(§5)
- **[原文]** ただし推奨は新版: "We recommend, however, that you upgrade your processes to DO-178C." / "New applicants or developers who are establishing software life cycle processes should do so in accordance with DO-178C."(§5)
- **[原文]** 改修時の扱い: "you may accomplish all modifications to the software using the same DO-178( ) version as the original approval."(§9.b(8))
- **[原文]** その代わりの制限: **"However, you may not declare your software as having satisfied DO-178C."**(§9.b(8))
- **[原文]** 条件を満たさないなら新版へ: §9.b(9)。条件には「改修で初めてモデルベース開発・オブジェクト指向・形式手法を導入しないこと」が含まれる(§9.b(7))
- **[原文]** 版の読み替えには逸脱申請が要る: "you should request a deviation in accordance with the requirements of 14 CFR part 21, subpart O." 承認は "The project ACO may approve this type of deviation without ... (AIR-100) coordination."(§7.b)
- 期日による一律の切替は無い。適用は**案件の条件**で決まる
- DO-178C 本文 §11.20(Software Accomplishment Summary の内容。計画・標準からの逸脱の記載を含む)は原文を取得できなかった **[未確認]**

### Q1〜Q4 への関わり

- **Q1 に効く**。**「旧版のまま続けてよいが、新版への適合を主張してはならない」**という分離は、移行期間を置かない代わりの設計として極めて使える。期日で切るのではなく、**主張できる文言を制限する**
- **Q3 に効く**。版の読み替え自体を「逸脱申請」として扱い、承認権限の階層(プロジェクト審査室で可／本部調整不要)まで定めている

---

## 9. IEC 62304 / IEC 61508 / ISO 26262 — 改訂中の案件と「技術水準」(Q1・Q3)

### 9.1 IEC 62304 **[原文・部分]**

出典: *IEC 62304:2006/AMD1:2015* プレビュー, IEC, 2015, <https://cdn.standards.iteh.ai/samples/21252/f7905e39d6514a4da0bb6592596afd44/IEC-62304-2006-AMD1-2015.pdf>(既存 SRC-0525)

- 改正は箇条1.4(Compliance)に注記を追加する: "NOTE 5 For compliance of LEGACY SOFTWARE see 4.4." また第2段落の "See Annex D." を削除する
- 箇条4.4(LEGACY SOFTWARE): "As an alternative to applying Clauses 5 through 9 of this standard, compliance of LEGACY SOFTWARE ..."(箇条5〜9の適用に代わる経路)。注記 "Fulfilling 4.4 enables further use of LEGACY SOFTWARE in accordance with IEC 62304."
- 改正の対象: "IEC 62304:2006-05/AMD1:2015-06(en-fr)" / "The first edition of IEC 62304 was published in 2006."
- **箇条1.4 の適合の定義文そのもの(「すべてのプロセス・活動・作業の実施をもって適合とする」)は原文で取得できなかった** **[未確認]**。検索でも全文を公開している一次資料に当たらなかった

### 9.2 欧州の整合規格と「どの版を使うか」 **[二次]**

- CE マーキング実務の解説: 整合規格として引用されると官報(OJ)が移行期間を示し、"Once harmonised, the OJ will indicate a 'Transition Period' during which either revision of the Standard may be used."、旧版は "the previous revision only ceasing to offer presumption of conformity at the end of this transition period"
  - 出典: *Which revision of a Standard should I use?*, CE Marking Association, <https://cemarkingassociation.co.uk/which-revision-of-a-standard-should-i-use>
- EU 司法裁判所の判断(Global Garden 事件、一般裁判所)についての要約: 旧版は "until its date of withdrawal" まで適合推定を与え続け、新版が引用されても "unless explicitly decided by the European Commission" それは失われない。指令の改訂が自動的に引用を打ち消すことはなく、"legal vacuum created by such a mechanism would not be acceptable"
  - 出典: *Decision of the Court of Justice of the European Union on successive versions of a harmonised standard*, Eurogip, 2018-07-27, <https://eurogip.fr/en/decision-of-the-court-of-justice-of-the-european-union-on-successive-versions-of-a-harmonised-standard>
  - 判決本文(事件番号・日付)は確認していない **[未確認]**

### 9.3 「技術水準(state of the art)」 **[未確認]**

- 「規格が案件の途中で改訂されたとき、旧版に従っていても技術水準を満たさないと評価され得る」という論点について、IEC 61508 / ISO 26262 の**本文にその旨を述べる条項を見つけられなかった**。ISO 26262 第2版(2018)の移行規定を述べる一次資料にも当たらなかった
- 代替として使えるのは 9.2 の整合規格の仕組み(**旧版は取り下げ日まで有効、ただし新版が出た後は移行期間が走る**)である

### Q1〜Q4 への関わり

- **Q1 に効く**。「併存期間はどちらの版でもよい、旧版の推定は取り下げ日で失われる」という二段構えは、IAF の3年移行と同じ形をとりつつ、**旧版の有効性を明示的に打ち消すまでは有効**という点でより保守的
- **Q3 に効く**。62304 の LEGACY SOFTWARE 条項は、**「通常経路の代わりに別経路で適合を示す」**という設計の実例。既存資産に対し条項を丸ごと免除せず、代替経路を規定する

---

## 10. 公開仕様の版の付け方 — ASVS / SLSA / OpenAPI / W3C(Q1)

### 10.1 OWASP ASVS **[原文・部分]**

出典: *OWASP Application Security Verification Standard* リポジトリ, OWASP, 2025, <https://github.com/OWASP/ASVS>

- 最新安定版は "version 5.0.0 (dated May 2025)"。ASVS 4.0 は 2019、v4.0.3 は 2021
- 版は major.minor.patch。次回は "a patch release, version 5.0.1" を予定
- **参照の書式**: `v<version>-<chapter>.<section>.<requirement>`(例 `v5.0.0-1.2.5`)。版を省いた識別子は最新内容を指すものとして扱われる。**規格は時とともに変わるため、版を含めることを推奨している**
- master ブランチは未発行の "bleeding edge version"
- 旧版を「廃止」とする明文は無い。1.0〜5.0 のフォルダが並存する

### 10.2 SLSA **[原文]**

出典: *Specification Stages and Versioning*, OpenSSF SLSA, <https://slsa.dev/spec-stages>(既存 SRC-0494)

- 版は MAJOR.MINOR のみ。Core Specification と Attestation Formats に "a single version number" を与える
- MAJOR を上げるのは、添付形式の後方非互換な変更、または既存レベルへの要求事項の追加
- 段階は Draft / Candidate / Approved / Retired。Draft は "not suitable for reference or for implementation beyond experimentation"。Retired は "It has been either rendered obsolete by a newer version or" 放棄された
- レベルの意味は版を越えて保つ: "we will never change a level's high-level meaning after publication"
- **主張の書式**: 精度が要るときは `SLSA [Track] [Level] ([Version])`(例 `SLSA Build L3 (v1.0)`)

### 10.3 OpenAPI のパッチ版の方針 **[原文・部分]**

出典: *Announcing OpenAPI Specification patch releases*, OpenAPI Initiative, 2024-10-25, <https://www.openapis.org/blog/2024/10/25/announcing-openapi-specification-patch-releases>

- パッチ版が変えるのは文面のみ: "the specification wording itself contains many updates, expansions, and clarifications"
- 変えないもの: **"In patch releases, no changes are made to the way that APIs are described."** / "the patch releases does not contain structure changes"
- 実装への影響: "Tooling that supports 3.1.0 is expected to work without problems on 3.1.1."

### 10.4 W3C Process **[未確認]**

- W3C Process Document は §6.2.3 "Classes of Changes"、§6.3.10 "Revising a W3C Recommendation"(編集上・実質的・新機能の3区分)、§6.3.12.4 "Process for Rescinding, Obsoleting, Superseding, Restoring a Recommendation" を持つ(目次で確認)
- **本文はツールのページ取得が途中で切れ、オフセットを変えても該当箇所に到達できなかった**。curl は外向きが遮断された。条項の根拠にはしない
  - 出典(目次のみ): *W3C Process Document*, W3C, <https://www.w3.org/policies/process/>

### 10.5 OASIS の適合性条項の手引き **[原文]**

出典: *OASIS Conformance Guidelines*, OASIS, 2014-04-25, <https://docs.oasis-open.org/templates/TCHandbook/ConformanceGuidelines-25-04-2014.html>

- "A Conformance Clause identifies that to which a Conformance Target MUST conform" / "Conformance clauses MUST be defined within a separate Conformance section of an OASIS specification"。適合主張とは "a declaration that a product or artifact meets the requirements of one or more Conformance Clauses."
- **版の明記を求める規定は無い**

### 10.6 Q1〜Q4 への関わり

- **Q1 に効く**。公開仕様の実務は3点で一致している
  1. **主張には版を含める**(SLSA は書式を定義、ASVS は版入り識別子を推奨)
  2. **パッチ版は意味を変えない**(OpenAPI は「記述方法は変えない」と明言、SLSA は「レベルの意味は公開後に変えない」と明言)
  3. **段階(Draft/Candidate/Approved/Retired)を明示し、Draft を参照に使わせない**
- **ASVS の `v5.0.0-1.2.5` 形式は、本標準の条項参照の書式として直接採れる**。節番号だけの参照が改訂で壊れる問題(ISO Directives 箇条10.5 の「部分の引用には発行年必須」と同じ論点)に、版を識別子へ埋め込む解を与える
- 認証制度(第4節)が期日で切るのに対し、公開仕様は**旧版を残したまま主張の表記で区別する**。本標準が認証機関を持たない以上、後者が現実的である

---

## 11. 日本の事例(Q1・Q4)

### 11.1 JIS の引用規格の書式 **[未確認]**

- JIS Z 8301(規格票の様式及び作成方法)は ISO/IEC Directives Part 2 に対応し、引用規格に「発行年を付記した引用」と「付記しない引用」の区別を持つ
- **JSA Webdesk が 2026-10-22 16:00 から緊急メンテナンス中で、JIS Z 8301 のプレビュー PDF(2008 年版・2019 年版とも)が取得できなかった**。同じ理由で JIS X 0160:2021 のプレビューも取れなかった
- したがって**日本語での書式の定型文は原文で確認できていない**。条項に引く前に再取得が必要
  - 取得を試みた URL: <https://webdesk.jsa.or.jp/preview/pre_jis_z_08301_000_000_2019_j_ed10_ch.pdf>、<https://webdesk.jsa.or.jp/preview/pre_jis_x_00160_000_000_2021_j_ed10_ch.pdf>

### 11.2 JIS の改正と経過措置 **[未確認]**

- 「JIS の改正に伴う経過措置」を定める一次文書(JISC / 経済産業省)を特定できなかった。検索で出たのは個別分野の通知・自治体の調達文書で、制度としての経過措置の規則ではなかった
- JIS Q 9001(= ISO 9001)の認証移行については、実質的に IAF / JAB の移行規則(第4節)が働く。JAB の一次告知は取得できなかった

### 11.3 IPA 共通フレーム **[原文・部分]**

出典: *共通フレーム(SLCP)*, 情報処理推進機構(IPA), <https://www.ipa.go.jp/digital/kaihatsu/slcp/index.html> および <https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html>

- 共通フレーム2013 は「国際規格ソフトウェアライフサイクルプロセス ISO/IEC12207 : 2008(JIS X 0160 : 2012)を包含し」たものと書かれている(**基にした国際規格の版を明記している**)
- 現在の位置づけ: 「本書は、現行の国際規格SLCPで割愛されている『ソフトウェア固有プロセス』が解説されているため、ソフトウェア開発を重視する場合のプロセス標準として国内では継続して参照されています。」
- IPA のページが挙げる現行の国際規格は ISO/IEC/IEEE 12207:2017(JIS X 0160:2021)および ISO/IEC/IEEE 15288:2023(JIS X 0170:2025)
- **つまり共通フレーム2013 は、基にした国際規格が2世代進んだ後も改訂されず、「国際規格が落とした部分を補う文書」として参照され続けている** — 版の追随をしない選択の実例
- SLCP-JCF98・2007・2007第2版の各版の関係と旧版の扱いを述べる一次記述は、両ページには無かった **[未確認]**

### Q1〜Q4 への関わり

- **Q1 に効く**。共通フレームは「**上位規格の改訂に追随しない**」という選択を実際に取り、その代わりに**自分が包含した上位規格の版を明記している**。本標準が ISO 系の改訂に追随しないなら、同じく「どの版を踏まえたか」を明記する必要がある
- **Q4 に効く**。日本語圏の実務でも「ISO/IEC12207 : 2008(JIS X 0160 : 2012)」のように**国際規格と JIS の両方を発行年付きで併記する**書式が使われている

---

## 12. 見つけられなかったもの

| 探したもの | 状況 |
| --- | --- |
| ISO/IEC/IEEE 12207・15288 箇条4(完全適合・修整適合)の**本文** | 4文書のプレビューすべてで目次のみ。有償購入が必要 **[未確認]** |
| ISO/IEC Directives Part 2 箇条33(適合性評価の側面) | ページが長く、2回のオフセット取得で該当箇所に到達できず |
| ISO/IEC 33001 箇条7(Conformance)・箇条8(Conformity assessment)の本文 | プレビューは目次のみ |
| ISO/IEC 17065 箇条7.10・7.11 の本文、ISO/IEC 17021-1 の条項本文 | プレビューは目次のみ。認証機関の運用規程([二次])で代替 |
| IAF ID 9:2015 の一次 PDF | 掲載 URL が 404 |
| CMMI V2.0 → V3.0 の移行期限・サンセット日 | ISACA の一次ページに記載が無く、解説記事にも日付が無い |
| Automotive SPICE 3.1 → 4.0 のアセスメント移行規則 | intacs の該当ページはログイン必須 |
| DO-178C §11.20(SAS の内容。計画・標準からの逸脱) | 原文 PDF に到達できず。FAA AC で代替 |
| IEC 62304 箇条1.4 の適合の定義文 | 改正(AMD1)の差分のみ確認。基の 2006 年版本文は未取得 |
| IEC 61508 / ISO 26262 の「改訂中の案件」「技術水準」に関する条項 | 該当条項を特定できず。EU 整合規格の移行期間の仕組みで代替 |
| W3C Process §6.2.3 / §6.3.10 / §6.3.12 の本文 | ページ取得が途中で切れる。curl は外向き遮断 |
| JIS Z 8301 の引用規格の定型文、JIS X 0160:2021 のまえがき | JSA Webdesk が緊急メンテナンス中(2026-10-22 16:00 開始、終了未定) |
| JIS の改正に伴う制度としての経過措置の一次規則 | 特定できず |
| MISRA GCS に「ガイドラインの版」を書く明文の要求 | 見つからず。版違いの取り込みコードへの言及(4.4)はある |

---

## 13. 含意のまとめ

### 13.1 Q1(版の付け方と改訂時の適合主張)

1. **版は規格本文が、移行は運用側が持つ**。12207・15288・Automotive SPICE はいずれも「新版は旧版を取消し置き換える」とだけ書き、移行期間を本文に書かない。期日は IAF・認定機関の側にある。本標準は認証機関を持たないため、**移行規則を自分で書かなければ誰も書かない**
2. **認証制度の既定値は「発行月末から36か月、18か月で新規受付を新版のみに切る、期間終了で旧版の主張は失効または取消し」**。ISO 9001:2015、ISO/IEC 27001:2022、ISO 9001:2026 の3件で数字が一致している
3. **期日で切らない選択もある**。FAA AC 20-115C は「旧版のまま続けてよいが、新版に適合したと**宣言してはならない**」とした。認証機関を持たない標準にはこちらが現実的である。採るなら、**主張できる文言の制限**として書く
4. **主張には版を含める書式を定める**。SLSA の `SLSA Build L3 (v1.0)`、ASVS の `v5.0.0-1.2.5` が直接使える先例。条項参照に版を埋め込むことは、ISO Directives 箇条10.5 の「部分を引くなら発行年必須」と同じ問題への解である
5. **パッチ版の意味を先に決める**。OpenAPI「記述方法は変えない」、SLSA「レベルの意味は公開後に変えない」。**主張をやり直さなくてよい変更の範囲**を定義しておけば、改訂が主張を壊さない
6. **追随しない選択も実例がある**。共通フレーム2013 は上位規格が2世代進んだ後も改訂されず、「包含した版」を明記したまま参照され続けている

### 13.2 Q2(適用の終了)

7. 外部の制度は終了を**3事象に分けて**規定している。(a) **期日到来による失効**(CMMI Benchmark 3年/Sustainment 2年、認証サイクル満了、移行期間終了)、(b) **能動的な取消し・一時停止**(原因・猶予・最大6か月・解除条件)、(c) **適用範囲の縮小**(主張は残り対象が狭まる)。ISO/IEC 17065 は4語(termination / reduction / suspension / withdrawal)を1箇条に束ねている
8. **終了後の表示撤去が明文である**。「証書とロゴの使用をやめなければならない」。本標準が適合バッジやリポジトリ記載を持つなら、同じ規定が要る
9. **移行は主張の期日を動かさない**(IAF MD 26)。版の差し替えを「新たな適合主張」にしない設計
10. 「案件の終結」を終了事由に挙げる一次資料は見つからなかった。認証制度は組織を対象にするためである。案件単位の終了は MISRA 型(**案件ごとに適合要約を作り、引き渡しで完結する**)に求めるほうが筋が通る

### 13.3 Q3(逸脱・テーラリングを伴う適合主張)

11. **「適合」と「逸脱つき適合」を同じ語で呼ばない**。12207/15288 の「完全適合 / 修整適合」、MISRA GCS の「Compliant / Deviations / Violations / Disapplied」。**独立した2系統が同じ結論に達している**。これは本調査で最も強い一致点である
12. **条項を逸脱可能性で層化する**。MISRA の Mandatory(逸脱不可・再分類不可)/ Required(逸脱記録があれば可)/ Advisory / Disapplied。**どの条項が絶対に逸脱できないかを、標準の側が先に決めている**
13. **逸脱の要件を定め、禁止される逸脱を名指しする**。MISRA 4.4 の3禁止(開発者の都合のため・適切なプロセスの支えなしに・指名された技術権威の同意なしに)は、そのまま例外承認の条項に移せる
14. **代替措置は「リスク評価手順と予防措置の集合」として記録させる**(MISRA 4.2)。MISRA は compensating measures という語を使わない
15. **再分類は着手時に合意し、事後に緩めない**(MISRA 5.1 の GRP)。本標準の運用形態の宣言と同じ構造
16. **テーラリングは削除ごとに理由を残す**(42020 附属書A = 15288 附属書A の翻案)。「なぜその成果・活動・作業を削除したかの説明を与える」。**完全適合を主張するならテーラリングは許されない**
17. **代替経路を用意する手もある**。IEC 62304 4.4 の LEGACY SOFTWARE は、箇条5〜9 の適用に代えて別経路で適合を示す。既存資産に対し条項を免除せず、別の道を規定した

### 13.4 Q4(他規格の版の引用)

18. **既定は発行年付き**。ISO/IEC Directives 箇条10.5 は、部分(節・表・図)を引くなら発行年必須と規定する(後続版で番号が振り直されるため)。Automotive SPICE 4.0 は全件発行年付きで引いている
19. **発行年なしの引用は、文書全体に対してのみ、かつ全改訂を自動的に取り込む覚悟があるときだけ**(箇条10.4)
20. **改訂されたら発行年付き引用を見直す義務が生じる**(箇条10.5・10.2)。本標準が ISO 系を発行年付きで引くなら、**引用の棚卸しを改訂時の作業として規定する**必要がある
21. **引用規格を持たない設計もある**。12207:2026 は "There are no normative references in this document."
22. 日本語圏では「ISO/IEC12207 : 2008(JIS X 0160 : 2012)」のように**国際規格と JIS を発行年付きで併記する**書式が使われている(IPA)

### 13.5 条項を書く前に埋めるべき空白

- **12207/15288 箇条4の本文**。「完全適合 / 修整適合」の語を借りるなら購入して文面を照合する。本調査では構造(箇条番号と見出し)までしか確認できていない
- **JIS Z 8301 の引用規格の定型文**。日本語の標準として書くなら、日本語の定型文に合わせるべきである。JSA のメンテナンス終了後に再取得する
- **IEC 62304 箇条1.4 の適合の定義文**。「すべてのプロセス・活動・作業の実施をもって適合とする」型の定義を引くなら原文が要る
