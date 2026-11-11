# #434 経路2 外部調査: 規則変更前の記録(レガシー記録)の有効性

- 調査時点: 2026-11-11
- 審議の重さ: 重
- 論点: 確認の記録を持たない古い構成で「確認済み」の旗だけが立っている状態を、規則の変更後にどう扱うか
  - (2-B) 旧い旗を、既存の記録の照合に限って有効とみなす
  - (2-D) その後の本人以外の確認を、既存の記録の照合に遡って数える
- 凡例: 【事実】は原文で確かめたもの。【示唆】【推測】は調査者の解釈
- 対象は医薬品 GxP の規制文書である。ソフトウェア開発の標準へ持ち込むのは類推であり、直接の根拠にはならない(全体に掛かる限定)

---

## S1. FDA Guidance for Industry「Part 11, Electronic Records; Electronic Signatures — Scope and Application」(2003-08)

- URL: https://www.fda.gov/media/75414/download
- 取得日: 2026-11-11(PDF 本文を読んだ)
- 位置づけ: 拘束力のない指針(冒頭「Contains Nonbinding Recommendations」)。規則(21 CFR Part 11)そのものではない

### 原文の引用(III.C.3 Legacy Systems、行 259-274)

> The Agency intends to exercise enforcement discretion with respect to all part 11 requirements for systems that otherwise were operational prior to August 20, 1997, the effective date of part 11, under the circumstances specified below.
>
> This means that the Agency does not intend to take enforcement action to enforce compliance with any part 11 requirements if all the following criteria are met for a specific system:
> - The system was operational before the effective date.
> - The system met all applicable predicate rule requirements before the effective date.
> - The system currently meets all applicable predicate rule requirements.
> - You have documented evidence and justification that the system is fit for its intended use (including having an acceptable level of record security and integrity, if applicable).
>
> If a system has been changed since August 20, 1997, and if the changes would prevent the system from meeting predicate rule requirements, Part 11 controls should be applied to Part 11 records and signatures pursuant to the enforcement policy expressed in this guidance.

脚注7: 「we use the term legacy system to describe systems already in operation before the effective date of part 11.」

### 原文の引用(I. Introduction、行 40-42、49-50)

> However, records must still be maintained or submitted in accordance with the underlying predicate rules, and the Agency can take regulatory action for noncompliance with such predicate rules.

> Note that part 11 remains in effect and that this exercise of enforcement discretion applies only as identified in this guidance.

### 原文の引用(III.A、行 128-130、146-149)

> It is important to note that FDA's exercise of enforcement discretion as described in this guidance is limited to specified part 11 requirements (setting aside legacy systems, as to which the extent of enforcement discretion, under certain circumstances, will be more broad).

> requirements related to electronic signatures (e.g., §§ 11.50, 11.70, 11.100, 11.200, and 11.300)
> We expect continued compliance with these provisions, and we will continue to enforce them.

### 事実の整理

- レガシーの扱いは「有効とみなす」ではなく「執行しない(enforcement discretion)」。規則は効いたまま(「part 11 remains in effect」)
- 4条件はすべて満たす必要がある(「all the following criteria」)
  - 施行前に稼働
  - 施行前に当時の規則(predicate rule)を満たした
  - 現在も predicate rule を満たす
  - 目的適合の**文書化された証拠と正当化**がある
- 変更が入り、predicate rule を満たせなくなったら、新しい規則の管理を適用する
- 基底の規則(predicate rule)は免除されない
- レガシー以外では、電子署名の規定(11.50、11.70 ほか)は裁量の外で、執行が続く

### 示唆

- 【示唆】FDA の型は「旧い記録を、作られた時点の規則で照らす」+「現在も基底の要件を満たす」+「文書化された正当化」の3つが揃うことを条件にする。旗だけ(証拠なし)は第2・第4条件を満たさない。2-B を採るなら、「旗が立った時点の規則で正当に立てられた」ことの証拠と、救済の判断を書面に残すことが条件になる
- 【示唆】救済の範囲は「レガシーのシステム」に限られ、変更後は新しい規則に戻る。2-B の「既存の記録の照合に限る」という限定は、この「変更されたら新規則」と同じ形を取る
- 【推測】「有効とみなす」と「咎めない」は別の効果である。FDA は後者しか言っていない。2-B の文言を「確認済みとみなす」とすると、FDA より強い効果を与えることになる

---

## S2. EudraLex Volume 4 Annex 11「Computerised Systems」(rev.1、2011-06-30 施行)

- URL: https://health.ec.europa.eu/system/files/2016-11/annex11_01-2011_en_0.pdf
- 取得日: 2026-11-11(PDF 本文を読んだ)
- 注: 2025 年に改訂案(draft)が公開されている。本調査では読んでいない(後述の穴)

### 原文の引用

- Principle:
  > Where a computerised system replaces a manual operation, there should be no resultant decrease in product quality, process control or quality assurance. There should be no increase in the overall risk of the process.
- 4.8:
  > If data are transferred to another data format or system, validation should include checks that data are not altered in value and/or meaning during this migration process.
- 12.4:
  > Management systems for data and for documents should be designed to record the identity of operators entering, changing, confirming or deleting data including date and time.
- 14 Electronic Signature:
  > Electronic signatures are expected to: a. have the same impact as hand-written signatures within the boundaries of the company, b. be permanently linked to their respective record, c. include the time and date that they were applied.
- 9 Audit Trails:
  > For change or deletion of GMP-relevant data the reason should be documented.

### 事実の整理

- Annex 11 rev.1 には、レガシーのシステムや施行前の記録を救済する明文の経過措置は**見当たらない**(全文 5 頁を読んだ範囲)
- 「確認(confirming)」の行為には、行った者の識別と日時の記録を求める(12.4)
- 電子署名は「適用した日時」を含む(14c)。署名の日時は、署名した時点を表す

### 示唆

- 【示唆】14c と 12.4 から、後から付けた確認は「後の日時の確認」として記録されるべきで、元の記録の時点へ日付を戻して数えることは想定されていない。2-D を採るなら、遡った確認を「元の時点の確認」ではなく「後の時点に行った照合の確認」として、日時と行為者を残す形に限る必要がある
- 【推測】Principle の「置き換えで品質保証が下がらないこと」は、規則の切り替えにも類推できる。旧い旗を無条件で有効とみなすと、確認の保証水準が下がる

---

## S3. MHRA「'GXP' Data Integrity Guidance and Definitions」Revision 1(2018-03)

- URL: https://assets.publishing.service.gov.uk/media/5aa2b9ede5274a3e391e37f3/MHRA_GxP_data_integrity_guide_March_edited_Final.pdf
- 取得日: 2026-11-11(PDF 本文 21 頁を読んだ)
- 位置づけ: 英国規制当局の指針。PIC/S・WHO・EMA の「companion document」(2.1)

### 原文の引用(ALCOA+)

- 3.10:
  > ALCOA being Attributable, Legible, Contemporaneous, Original, and Accurate and the '+' referring to Complete, Consistent, Enduring, and Available.
- 6.1 Data:
  > A - attributable to the person generating the data / L – legible and permanent / C – contemporaneous / O – original record (or certified true copy) / A - accurate
- 6.11.1 Original record:
  > The first or source capture of data or information ... and all subsequent data required to fully reconstruct the conduct of the GXP activity.
- 6.3 Metadata:
  > Metadata also permit data to be attributable to an individual ... Without the context provided by metadata the data has no meaning.

### 原文の引用(レガシーのシステム)

- 6.13 Audit Trail:
  > Where relevant audit trail functionality does not exist (e.g. within legacy systems) an alternative control may be achieved for example defining the process in an SOP, and use of log books. Alternative controls should be proven to be effective.
  >
  > Where add-on software or a compliant system does not currently exist, continued use of the legacy system may be justified by documented evidence that a compliant solution is being sought and that mitigation measures temporarily support the continued use.
  >
  > Where systems do not meet the audit trail and individual user account expectations, demonstrated progress should be available to address these shortcomings. ... Where remediation has not been identified or subsequently implemented in a timely manner a deficiency may be cited.
- 6.16:
  > It is expected that companies should be implementing systems that comply with current regulatory expectations.

### 原文の引用(後から付ける署名・確認)

- 5.2(代筆者 scribe):
  > the records should identify both the person performing the task and the person completing the record. The person performing the task should countersign the record wherever possible, although it is accepted that this countersigning step will be retrospective.
- 6.14 Electronic signatures:
  > An inserted image of a signature or a footnote indicating that the document has been electronically signed (where this has been entered by a means other than the validated electronic signature process) is not adequate.
- 6.15 Data review and approval:
  > Data review should be documented and the record should include a positive statement regarding whether issues were found or not, the date that review was performed and the signature of the reviewer.
  >
  > This procedure should enable data corrections or clarifications to provide visibility of the original record, and traceability of the correction, using ALCOA principles

### 事実の整理

- レガシーの扱い
  - 不足する機能(監査証跡・個人アカウント)は、代替の管理(SOP、記録簿)で補ってよい。ただし**効果の実証**が要る
  - 継続使用は「適合する解決を探している」ことと「緩和策」の**文書化された証拠**で正当化できる。**一時的**であり、是正が遅れれば指摘(deficiency)になる
  - つまり、恒久的に旧い状態を有効とみなす扱いではなく、期限付きの猶予と是正の義務の組
- 後から付ける署名
  - 遡った副署(retrospective countersign)を認めるのは、代筆者の例外に限り、かつ「作業者」と「記録者」の両方を識別する条件つき
  - 署名を示すだけの表示(画像・脚注)は、署名とは認めない
  - 確認(review)の記録には、確認を行った日付と確認者の署名を含める。訂正は元の記録を見えるまま残す

### 示唆

- 【示唆】「確認済みの旗」は、MHRA 6.14 の「署名されたことを示す脚注」と同じ性格を持つ(誰が・いつ・何を確認したかのメタデータを欠く)。ALCOA の Attributable の観点では、旗だけでは確認として成立しない
- 【示唆】2-B は MHRA の「代替の管理+効果の実証+一時的+是正の計画」の型に寄せれば整合する。無期限・無条件で有効とみなす形は、MHRA の型から外れる
- 【示唆】2-D について、MHRA は遡った署名そのものを禁じてはいない(5.2)。ただし、(a) 遡ったことが記録上見える、(b) 実際の行為者と記録者を区別する、(c) 確認した日付は確認を行った日、の3つが条件として読める
- 【推測】「後の本人以外の確認」を元の記録の時点の確認として数える(日付を戻す)形は、Contemporaneous と 6.15 の日付の要求に反する
- 【示唆】後の確認を「現在時点での照合の記録」として新たに作る(元の記録を書き換えず、新しい記録を足す)なら、MHRA の訂正の原則(元の記録を見えるまま残す)と整合する

---

## S4. PIC/S PI 041-1「Good Practices for Data Management and Integrity in Regulated GMP/GDP Environments」(2021-07-01 施行)

- URL: https://picscheme.org/docview/4234
- 取得日: 2026-11-11(PDF 本文 63 頁を読んだ)
- 位置づけ: 査察官向けの指針。「This guide is not mandatory or enforceable under law.」(3.7)。新たな規制負担を課さず、既存要件の解釈を示す(3.4)

### 原文の引用(ALCOA+ の定義、7.5 の表)

- Attributable:
  > It should be possible to identify the individual or computerised system that performed a recorded task and when the task was performed. This also applies to any changes made to records, such as corrections, deletions, and changes where it is important to know who made a change, when, and why.
- Contemporaneous:
  > The evidence of actions, events or decisions should be recorded as they take place. This documentation should serve as an accurate attestation of what was done, or what was decided and why, i.e. what influenced the decision at that time.
- Original:
  > The original record can be described as the first-capture of information, whether recorded on paper (static) or electronically ...

### 原文の引用(レガシーのシステム)

- 9.1.4:
  > Legacy systems are expected to meet the same basic requirements; however, full compliance may necessitate the use of additional controls, e.g. supporting administrative procedures or supplementary security hardware/software.
- 9.3 Item 1:
  > Legacy systems (existing systems in use) should be evaluated to determine whether existing system configuration and functionality permits the appropriate control of data ... Where system functionality or design of these systems does not provide an appropriate level of control, additional controls should be considered and implemented.
  >
  > Assessments of existing systems should be available and provide an overview of any vulnerabilities and list any additional controls implemented to assure data integrity. Additional controls should be appropriately validated
- 9.3 Item 3(検証の要約):
  > For existing systems, documents specifying the above requirements should be available; however, need not be compiled into the Validation Summary report.
- 9.3 Item 4:
  > It would be expected that a prospective validation for computerised systems is conducted. Appropriate validation data should be available for systems already in-use.
- 9.6 Item 1:
  > If no electronic audit trail system exists a paper based record to demonstrate changes to data may be acceptable until a fully audit trailed ... system becomes available.
- 5.3.3:
  > Where long term measures are identified in order to achieve the desired state of control, interim measures should be implemented to mitigate risk, and should be monitored for effectiveness. ... residual data integrity risk should be communicated to senior management, and kept under review.

### 原文の引用(後から付ける署名・確認)

- 8.6 脚注8(代筆者):
  > The person performing the observed task should countersign the record wherever possible, although it is accepted that this countersigning step will be retrospective.
- 8.6 Item 4:
  > Ensure that all key entries are signed & dated, particularly if steps occur over time, i.e. not just signed at the end of the page and/or process.
- 8.8 Item 1(二次確認):
  > Records of critical process steps ... should be: reviewed/witnessed by independent and designated personnel at the time of operations occurring
  >
  > This verification should be conducted after performing production-related tasks and activities and be signed or initialled and dated by the appropriate persons.
- 9.5 Item 4(電子署名):
  > Electronic signatures should be permanently linked to their respective record, i.e. if a later change is made to a signed record; the record should indicate the amendment and appear as unsigned.
  >
  > Any changes to data after an electronic signature has been assigned should invalidate the signature until the data has been reviewed again and re-signed.
- 12.1.1.1(是正の調査):
  > Identify omissions, alterations, deletions, record destruction, non-contemporaneous record completion, and other deficiencies
  >
  > A comprehensive retrospective evaluation of the nature of the data integrity deficiencies

### 事実の整理

- レガシーは**同じ基本要件**を満たすことを求められる。救済ではなく「追加の管理で埋める」型
  - 既存システムの評価(脆弱性の一覧と追加の管理の一覧)が要る
  - 追加の管理は検証されたものに限る
  - 監査証跡がない場合の紙の記録は「完全なシステムが使えるようになるまで」の暫定
- 既存システムでも、検証データは「available であるべき」(9.3 Item 4)。記録の欠けを旗で代えることは書かれていない
- 二次確認には「独立した者」「操作時点」「署名と日付」が求められる(8.8)。後の確認は「操作の後に行い、日付を付ける」形
- 記録を後から作ること(non-contemporaneous record completion)は、是正の調査で**欠陥として洗い出す対象**に挙がる(12.1.1.1)
- 遡る調査(retrospective evaluation)は、欠陥の性質を評価する活動として位置づけられる。元の記録を有効に戻す行為としては書かれていない
- 署名後に記録が変わったら、署名は無効になり、再確認と再署名が要る(9.5 Item 4)

### 示唆

- 【示唆】PIC/S は「規則の前の記録は、その時点の規則で有効」という考え方を明文で取らない。既存システムにも同じ基本要件を当て、足りない分は追加の管理と暫定措置で埋め、残余リスクを経営層へ上げる。2-B を採る場合、「旧い旗を有効とみなす」の代わりに「旧い旗は確認の記録ではないと明示し、照合の判断に使うことを暫定的に許し、残余リスクを記録する」と書くほうが PIC/S の型に近い
- 【示唆】2-D の「後の本人以外の確認を遡って数える」は、8.8 の「独立した者による確認」の要件には合いうる。ただし「操作時点の確認」(at the time of operations occurring)の代わりにはならない。数えるなら「後の時点の独立した照合」として、その日付で記録する必要がある
- 【推測】記録の時点を偽る(後の確認を前の時点の確認に見せる)形は、12.1.1.1 の「non-contemporaneous record completion」に当たり、規制の文脈では欠陥として扱われる
- 【示唆】9.5 Item 4 の「変更後は未署名に戻る」は、「確認済み」の旗が、確認した後に名簿が変わった場合に無効になるべきことの類推の根拠になる

---

## 横断の整理

### 記録を作った時点の規則で照らすのか、後の規則で照らし直すのか

- FDA(S1): 時点の規則で照らす要素を持つ。ただし「現在も基底の要件を満たす」ことも同時に求める。両方。効果は「執行しない」に留まる
- Annex 11(S2): 明文の経過措置は見当たらない
- MHRA(S3): 現在の期待に合う系へ移ることを求める。旧い状態は一時的な猶予のみ
- PIC/S(S4): レガシーにも同じ基本要件を当てる。足りない分は追加の管理。後の規則で照らし直す側に寄る
- 【示唆】4文書とも、「旧い記録を時点の規則だけで無条件に有効とみなす」立場は取っていない。最も緩い FDA でも、時点の適合+現在の適合+文書化された正当化の3つを要する

### 後から付けた確認・署名を遡って効かせる扱い

- 遡った副署は、代筆者の例外に限り認める(MHRA 5.2、PIC/S 8.6 脚注8)。実際の行為者と記録者の両方を識別する条件つき
- 確認には、確認を行った日時と確認者を残す(Annex 11 12.4・14c、MHRA 6.15、PIC/S 8.8)
- 記録の後付けは、是正調査で欠陥として洗い出す対象(PIC/S 12.1.1.1)
- 署名を示すだけの表示は署名にならない(MHRA 6.14)
- 【示唆】「後の確認を、その後の時点の確認として新たに記録する」ことは各文書と整合する。「後の確認を、元の時点の確認として数える」ことは、各文書の Contemporaneous と日時の要求と衝突する

### 2-B・2-D への含意(すべて調査者の解釈)

- 2-B(旧い旗を照合に限って有効とみなす)
  - 規制の型に合わせるなら、少なくとも次の条件が要る
    - 旗の時点で、当時の規則に従って立てられたという証拠(FDA 第2条件)
    - 救済の判断を文書化する(FDA 第4条件、PIC/S 9.3 Item 1 の既存システムの評価)
    - 救済は一時的とし、是正の道筋を持つ(MHRA 6.13、PIC/S 5.3.3)
    - 構成が変われば救済が外れる(FDA III.C.3 末尾、PIC/S 9.5 Item 4 の類推)
  - 「有効とみなす」という効果は、規制文書より強い。規制文書は「咎めない」「暫定で使ってよい」に留まる
- 2-D(後の本人以外の確認を遡って数える)
  - 後の独立した確認を「その時点の照合の確認」として記録し、日付を戻さないなら、各文書と整合する
  - 元の記録の時点の確認として数える(遡及の効果を与える)なら、Contemporaneous と衝突する
  - 「本人以外」は PIC/S 8.8 の「independent」に対応する

---

## 調査で埋められなかった穴

- EU GMP Annex 11 の改訂案(2025 年の公開協議版)を読んでいない。レガシーや経過措置の新しい扱いがあるかもしれない
- 21 CFR Part 11 の条文そのもの(11.1、11.10(e)、11.70)は eCFR が取得を拒んだため原文を確かめていない。指針の引用で代えた
- FDA「Data Integrity and Compliance With Drug CGMP: Questions and Answers」(2018-12)を読んでいない。後付けの記録(backdating)の扱いが Q&A にある可能性がある
- WHO TRS 1033 Annex 4(2021)のデータ完全性の指針を読んでいない
- ソフトウェア開発の標準(ISO/IEC/IEEE 12207、ISO 9001 7.5 の文書化した情報)での、規則の変更前の記録の扱いを調べていない。本調査は医薬品の GxP に偏っている
- 日本の実務(ER/ES 指針〔平成17年 薬食発第0401022号〕、PMDA のデータインテグリティの指摘事例)での建前と運用の乖離を拾えていない
