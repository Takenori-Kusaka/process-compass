# 254 検証の独立性水準 — 一次調査メモ

調査日: 2026-08-14 / 担当: 規格一次調査
調査目的: 「実装する主体の内側に、成果物を否定しにいく担当を置く」構成が、既存規格でどう扱われているか。独立レビュー(第三者検証)の代替ではなく、**その前段の自己検証**としての位置づけを知る。

出典の等級は各項目に **[一次]** / **[二次]** で明示する。取得できなかったものは「取得できなかった」と書く。

---

## 1. ISO/IEC/IEEE 29119 — テストにおける独立性の度合い

### 1.1 独立性の記述がある場所

**[一次]** ISO/IEC/IEEE 29119-2:2021(第2版, 2021-10)の公開プレビュー(iTeh, 全文目次 + 1〜8ページ)を確認した。29119-2 の目次は Clause 4 Conformance / 5 Multi-layer test process model / 6 Organizational test process / 7 Test management processes / 8 Dynamic test processes、附属書 A〜E(A: test design 適用例, B: 12207:2017 との対応, C: ISO/IEC 17025 との対応, D: BS 7925-2 との対応, E: Test models)であり、**独立性(independence)を扱う節・附属書は存在しない**。用語定義(3.1〜3.61)にも independence の項目はない。

- 出典: `https://cdn.standards.iteh.ai/samples/79428/67463a92e52c4b5da67536f7143dd25a/ISO-IEC-IEEE-29119-2-2021.pdf`(ISO/IEC/IEEE 29119-2:2021(E), Contents pp. iii–iv)

独立性は **29119-1(概念と定義)の Annex E.3 "Independence in Testing"** にある。29119-1 は informative(規範ではない)であることが本文に明記されている。

**[一次]** 29119-1:2013(E) Clause 2 Conformance:
> "ISO/IEC/IEEE 29119-1 is informative and no conformance with it is required."

### 1.2 Annex E.3 の全文(独立性の段階)

**[一次]** ISO/IEC/IEEE 29119-1:2013(E), Annex E.3 "Independence in Testing"(p. 54–55)。原文:

> "Testing should be as objective as possible. The closer the test analyst is to the author of the test item, the more difficult it is to be objective. It is generally accepted that is more difficult for an author to find defects in their own work than it is for an independent tester to find the same defects."
>
> "The level of independence increases between the author and the tester:
> a) Author tests his or her own product;
> b) Tests are designed and executed by a different person than the author, but one with the same responsibilities, typically another author who is a member of the same organizational unit as the author, reporting to the same manager;
> c) Tests are designed and executed by a tester who is a member of the same organizational unit as the author, reporting to the same manager;
> d) Tests are designed and executed by testers independent of the producing organizational unit, though still in-house;
> e) Tests are designed and executed by testers employed by an external organization (consultants), but working in the same organization as the author;
> f) Tests are designed and executed by testers in an external organization (third party testing)."

続く段落(同 p. 55):

> "The intention is to achieve as much independence between those who design the tests and those who produced the test item as possible, within the project's constraints of time, budget, quality and risk. The Organizational Test Strategy should determine the necessary degree of independence in the organization... Higher risk situations usually lead to a higher degree of independence."
>
> "The degree of independence usually varies for the different test sub-processes. **In dynamic component testing the lowest level of independence (i.e. no independence) is often seen, even though the same degree of independence applied in peer reviews (static testing done by developers) is not usually considered acceptable.**"
>
> "If testing in an agile project, the concept of an integrated team of developers and testers normally means that the higher levels of independence can be hard to achieve. In such situations care should be taken to ensure that as much independence as possible is achieved."

- 出典: ISO/IEC/IEEE 29119-1:2013(E), Annex E.3, pp. 54–55(IEEE Xplore 版 PDF 全文)。`https://wildart.github.io/MISG5020/standards/ISO-IEC-IEEE-29119-1.pdf`

### 1.3 訳と読み取り

- 段階は **6段階(a〜f)**。**a) は「作成者が自分の成果物をテストする」段階として定義として実在する**。
- ただし規格は a) を「the lowest level of independence (i.e. **no independence**)」と呼び、**独立性ゼロの点**として位置づける。a) に対して固有の手続・要求(視点を変える、否定しにいく等)は**一切課していない**。求めているのは「制約の範囲で可能な限り独立性を上げること」だけである。
- 重要な非対称: **動的なコンポーネントテストでは a) が「よく見られる」と容認**する一方、**ピアレビュー(開発者が行う静的テスト)で同じ独立性ゼロを適用することは「通常、受け入れられるとは考えられていない」**と明記する。すなわち「自分でテストする」は動的テストに限って黙認され、レビューには持ち込めない。
- 独立性の必要度合いを決めるのは Organizational Test Strategy であり、**リスクが高いほど高い段階を要求する**。
- 29119-1 は独立性について IEEE 1012 を参照している(同 E.3 末尾: "The IEEE 1012–2004... addresses the concept of independence in verification and validation activities, including testing.")。

**[一次]** 29119-1 5.1.1 は、29119 が V&V 活動のうち testing のみを扱い、他の V&V 活動は ISO/IEC 12207 と IEEE 1012 が扱うと明記する:
> "This standard addresses only some of the verification and validation activities. Specifically it addresses software testing, which is a major activity of verification and validation. Other standards, e.g. ISO/IEC 12207 and IEEE 1012, address other verification or validation activities."

---

## 2. IEEE 1012(V&V)— technical / managerial / financial の3側面

### 2.1 得られたこと

**[二次]** IEEE 1012 が独立性を **technical(技術的)/ managerial(管理的)/ financial(財務的)** の3つのパラメータで規定すること、および **この3つすべてを開発努力から独立して満たすとき IV&V と呼ばれる**ことは、複数の二次資料で一致して記述されている。

> "Whenever V&V activities are performed by those having technical, managerial and financial independence from the development effort it is known as independent verification and validation (IV&V)."
> — IV&V Group(コンサルティング事業者), `https://ivvgroup.com/ivv-pm-and-you/`

> "IEEE 1012, the industry standard for verification and validation, sets forth three parameters for independence: technical, managerial, and financial. If a team achieves these areas of independence, there is less chance of outside influence over the analysis and findings, removing potential organizational conflicts of interest..."
> — CMU SEI ブログ "Incorporating Agile Principles into Independent Verification and Validation", `https://www.sei.cmu.edu/blog/incorporating-agile-principles-into-independent-verification-and-validation/`

### 2.2 得られなかったこと(明示)

- **IEEE 1012 の原文(規格本文・Annex C 相当)は取得できなかった。** 無償公開されている PDF 3件(chaseplace.com の 1012-1998、ETS Montréal の講義資料、NRC RG 1.168)は、それぞれ接続拒否(ECONNREFUSED)・404・403 で取得に失敗した。Web 検索の予算(200件)を使い切ったため、代替ミラーの探索も打ち切った。
- したがって **technical / managerial / financial それぞれの規格上の定義文は、一次資料として確認できていない。**
- **"Classical IV&V" / "Modified IV&V" / "Internal IV&V" / "Embedded V&V" という形態区分が IEEE 1012 の本文に規定されているのかどうかも確認できなかった。** 検索結果のスニペット段階では「IEEE 1012 が IV&V の異なる形態に言及している」という記述が見えたが、当たった二次資料本文(SEI, IV&V Group)はいずれもこの区分を挙げていない。**この区分を IEEE 1012 由来として引用してはならない。**
- **「独立していない V&V」を IEEE 1012 が何と呼ぶか(self-verification / embedded V&V 等)は、一次・二次いずれでも確認できなかった。**

---

## 3. IEC 61508-1 — 独立性の3水準(独立した人 / 部門 / 組織)

### 3.1 表の内容

**[一次テキストの許諾転載]** Ron Bell(IEC 61508 メンテナンスチーム議長、Engineering Safety Consultants)"IEC61508: Assessment, Certification and Other Assurance Measures", Safety-Critical Systems Club, 2014。同論文は末尾で **IEC から IEC 61508 ed.2.0 Parts 1–7 (2010) の内容転載許諾を明記**しており、以下の表は規格本文の転載である。

> "Those undertaking a functional safety assessment have to meet specific independence requirements. There are three levels of independence which are:
> - independent person
> - independent department
> - independent organization.
>
> The criteria for the above three levels of independence are specified in IEC 61508-1."

> "'X' is the level of independence specified is the minimum for the specified consequence (Table 4) or safety integrity level or systematic capability (Table 5). If a lower level of independence is adopted, then the rationale has to be specified.
> 'Y' is the level of independence specified that is considered insufficient..."

**Table 5**(全体安全ライフサイクル フェーズ9・10、E/E/PE システムおよびソフトウェア安全ライフサイクル全フェーズ):

| 最小の独立性水準 | SIL/systematic capability 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Independent person | X | X1 | Y | Y |
| Independent department | | X2 | X1 | Y |
| Independent organization | | | X2 | X |

**Table 4**(フェーズ1〜8, 12〜16)は同形で、列が Consequence A/B/C/D になる。

- 出典: `https://esc.uk.net/wp-content/uploads/2012/09/IEC-61508-Assessment-Certification-and-Other-Assurance-Measures-October-2014.pdf` pp. 11(Tables 4, 5)

### 3.2 読み取り

- **段階は3つで、最下位が「independent person(独立した人)」である。「実施者本人」に相当する水準は表に存在しない。** 独立性の目盛りは「別人であること」から始まる。
- この表が掛かるのは **functional safety assessment(機能安全アセスメント)** であって、verification ではない。
- **[一次テキストの許諾転載]** 61508 の verification の定義は独立性に言及しない:
  > "In IEC 61508, verification is the activity of demonstrating for each phase of the relevant safety lifecycle (overall, E/E/PE system and software), by analysis, mathematical reasoning and/or tests, that, for the specific inputs, the outputs meet in all respects the objectives and requirements set for the specific phase."(同論文 10.3)
- 一方 **functional safety audit の定義には independent が入る**: "Systematic and independent examination to determine whether the procedures... are implemented effectively"(同 10.2)。
- つまり 61508 は **verification(独立性の要求なし)/ audit・assessment(独立性を段階で要求)** を工程として分けている。verification は実施者側の活動として成立する。
- 61508-1 における independent person / department / organization の**定義文そのもの**は、この転載には含まれていない(「criteria は IEC 61508-1 に規定」と述べるにとどまる)。**定義文は取得できなかった。**

---

## 4. ISO 26262 — 独立性水準 I0〜I3

### 4.1 得られたこと

**[二次]** ISO 26262:2018 Part 2, Clause 6.4.9, Table 1 が confirmation measures に対して独立性水準 I0〜I3 を割り当てる。二次資料の記述(引用符内は当該資料が規格文言として引用している部分):

- **I0**: "the confirmation measure should be performed; however, if the confirmation measure is performed, it shall be performed by a different person" — 実施は推奨にとどまるが、実施するなら**作成者とは別人**であること
- **I1**: "the confirmation measure shall be performed, by a different person in relation to the person(s) responsible for the creation" — 実施必須、**別人**
- **I2**: 作成チームから独立、**同じ直属上長に報告しない**
- **I3**: 作成部門から**管理・資源・リリース権限において独立**

さらに、confirmation review(ASIL に応じて I0〜I3)と verification review(ASIL に依存せず I0/I1 固定、Part 8 Clause 9.4.3.2 により**作成者以外による評価**)を区別し、Part 2 Clause 6.4.10.5 が高い方の独立性を満たす場合の統合を許す、とする。

- 出典: Quiddity Tech "Difference between Confirmation and Verification Review", `https://www.quidditytech.io/post/confirmation-vs-verification-review`
- 補足(**[二次]**): ASIL との対応は「A では社内レビュー、C では別部門、D では独立組織」に向かって上がる、との記述が複数の解説記事で一致する。

### 4.2 得られなかったこと(明示)

- **ISO 26262-2:2018 の原文プレビューは取得できなかった。** 上記 I0〜I3 の文言はすべて二次資料経由であり、規格原文との一字一句の一致は未確認である。
- 依頼にあった **ISO 26262-8** については、Part 8 Clause 9.4.3.2(verification review は作成者以外)が上記二次資料に現れたのみで、**Part 8 の原文は確認できていない**。

### 4.3 読み取り(注意して扱うこと)

- **最下位の I0 ですら「別人であること」を条件にしている。** 「作成者本人が視点を変えて確認する」に相当する水準は I0〜I3 の目盛りに存在しない。
- ただし 26262 は **confirmation(規格適合の確認)と verification(技術的な正しさの確認)を別工程として並置**しており、verification の独立性は ASIL に依存しない低い固定値に置かれている。ここが「実装側の内部で回る検証」に最も近い位置づけである。

---

## 5. ISO/IEC/IEEE 12207:2017 — Verification / Validation プロセス

### 5.1 得られたこと

**[一次]** ISO/IEC/IEEE 29119-2:2021 は 12207 を**引用規格(normative reference)**として挙げ、Annex B に "ISO/IEC/IEEE 29119-2 and ISO/IEC/IEEE 12207:2017 process alignment"(pp. 47–50)を置く。Introduction:
> "Users of ISO/IEC/IEEE 12207 perform several activities and tasks which are related to software testing. Annex B provides a mapping for such users between the clauses and subclauses of ISO/IEC/IEEE 12207 and the clauses and subclauses of this document."

**[一次]** 29119-1:2013 5.6.2 は、requirements-based testing が 12207 の verification outcomes の達成に使えると述べる:
> "Note that Requirements-based testing can be used, in part, to accomplish the requirements verification outcomes outlined in ISO/IEC 12207."

**[一次]** 29119-1 が示す verification / validation の区別(5.1 Testing considerations):
> "Verification is confirmation, through the provision of objective evidence, that specified requirements have been fulfilled in a given work item."
> "Validation demonstrates that the work item can be used by the users for their specific tasks."

### 5.2 得られなかったこと(明示)

- **ISO/IEC/IEEE 12207:2017 の本文(6.4.6 Verification process / 6.4.9 Validation process 等)は取得できなかった。** Web 検索予算を使い切っており、無償プレビューへ到達できなかった。
- したがって **「12207 の Verification が実施者側の活動として定義されているか(=独立でなくても成立する工程か)」は、12207 の原文では確認できていない。**
- 間接証拠としては、(a) 12207 が Verification process と Validation process を**別プロセス**として持つこと、(b) 29119-2 の Annex B が両者を testing プロセスへ対応づけていること、(c) 29119-1 5.1.1 が「29119 は testing のみ、他の V&V 活動は 12207 と IEEE 1012」と述べること、の3点にとどまる。**12207 の Verification に独立性要求が付いているか否かは未確認である。**

---

## 6. DO-178C — independence をもって達成する目標

### 6.1 得られたこと

**[二次]** LDRA(ツールベンダ)技術白書 "Safety Assurance Through Independent Verification. A Focus on RTCA DO-178C & DO-248C" v3.3 (2025-05)。同白書は DO-248C の Discussion Paper #19 "Independence in DO-178C/DO-278A" の要約を掲載しており、DO-178C/DO-248C の記述として次を挙げる:

> - **Definition of Independence:** Separation of responsibilities to ensure objective evaluation.
>   - **Software Verification:** Performed by someone other than the developer, with tools possibly used for equivalence.
>   - **Software Quality Assurance (SQA):** Includes authority to ensure corrective actions.
> - **Section 6.2.e:** Verification independence means the activity is performed by someone other than the developer, with tools possibly used for equivalence.
> - **Test Cases and Source Code:** The person creating test cases should not be the same person developing the source code.
> - **No Different Organisation Needed:** A different reporting structure or company is not required.
> - **Purpose of Independence:** Prevents a single misinterpretation from affecting both design and verification.
> - **Annex A:** Defines which objectives need independence by software/assurance level.

さらに DP#19 の細目として:
> "Objectives 3 & 4 (Table A-6) require that low-level requirements-based tests be developed by someone other than the Source Code developer to maintain independence. **However, high-level requirements-based tests may be created by the same person responsible for Software Design or Source Code**, as high-level requirements development is generally more collaborative."

Annex A のうち independence 欄を持つ表は **A-3, A-4, A-5, A-6, A-7, A-9**、対象は主に DAL A / B。

- 出典: `https://www.isit.fr/documents/2114/safety_assurance_through_independent_verification_white_paper_v3.3.pdf` pp. 4–6

### 6.2 得られなかったこと(明示)

- **DO-178C / DO-248C の原文は有償かつ無償プレビューが存在せず、取得できなかった。** 上記はすべて二次資料(ベンダ白書)経由である。NASA NTRS の DO-178C 解説論文(Jacklin 2012)も確認したが、independence の用語定義は載っていない。

### 6.3 読み取り

- DO-178C の独立とは **「責任の分離(separation of responsibilities)」**であり、**別人であれば足りる**。異なる報告系統・異なる会社は要求されない(DP#19 "No Different Organisation Needed")。**適格化されたツールが人の代替になり得る**点も特徴的である。
- したがって DO-178C の independence は **実装組織の内側で成立する**。第三者検証(IV&V)とは別概念である。
- 一方で **「同一人物」は明確に排除される**(低位要求ベースのテストは source code 開発者以外が作る)。ただし高位要求ベースのテストは設計・コード担当と同一人物でもよい、という**部分的な例外**を置いている。

---

## 7. 問いへの回答

> **問い**: 「実装した主体と同じ主体(同一人物・同一チーム)が、視点を変えて自らの成果物を否定しにいく活動」に、規格上の名前と位置づけはあるか。あるとすれば、それは独立検証の代替として扱われているか、それとも別工程として並置されているか。

### 7.1 同一人物の場合

**規格上の固有の名前は、調べた範囲では見つからなかった。**「視点を変えて自らの成果物を否定しにいく」という活動を独立した工程・技法として定義する条項は、ISO/IEC/IEEE 29119、IEC 61508、ISO 26262、DO-178C のいずれにも見つからなかった。

存在するのは**名前ではなく目盛りの原点**である。ISO/IEC/IEEE 29119-1 Annex E.3 の **a) "Author tests his or her own product"** が唯一、同一人物による自己検証を定義として持つ。だが規格はこれを "the lowest level of independence (i.e. **no independence**)" と呼び、**独立性がゼロである状態の記述**として置いている。この段階に固有の要求(視点の切替、否定の観点、チェックリスト等)は課されていない。

他の3規格は、目盛りの下端すら「別人」に置いている。

- IEC 61508-1: 最下位が **independent person**。実施者本人の水準は存在しない。
- ISO 26262-2 Table 1: 最下位の **I0** ですら「実施するなら作成者とは別人」。
- DO-178C 6.2.e: independence とは「開発者以外が実施すること」。ただし高位要求ベースのテストのみ同一人物を許す例外あり(**[二次]**)。

したがって、**同一人物による自己検証は、どの規格でも独立検証の代替として扱われていない。** 29119 では「独立性ゼロ」として目盛りに載るだけであり、他の3規格では目盛りに載らない。

さらに 29119-1 E.3 は**適用場面によって扱いを変えている**: 動的コンポーネントテストでは a) が「よく見られる」と黙認する一方、**ピアレビュー(開発者が行う静的テスト)で同じ独立性ゼロを適用することは「通常、受け入れられるとは考えられていない」**と明記する。「自分でテストする」の黙認は動的テストに限定され、レビューには及ばない。

### 7.2 同一チーム(実施者本人ではない別の人)の場合

こちらは **明確に名前と位置づけがある**。しかもそれは**独立検証の代替ではなく、別工程として並置**されている。

- **ISO/IEC/IEEE 29119-1 E.3 の b) と c)**: 同一組織単位・同一上長配下の別人が設計・実行する段階。b) は「同じ責任を負う別の作成者」、c) は「同一組織単位のテスター」。
- **IEC 61508**: **verification** は独立性の表が掛からない工程として定義され(「各フェーズの出力が目的と要求を満たすことを解析・数学的推論・試験で示す活動」)、**functional safety assessment / audit** の側に独立性の3水準が掛かる。両者は並置されており、verification は実施者側の活動として成立する。
- **ISO 26262**: **verification review**(ASIL に依存しない I0/I1 固定、作成者以外)と **confirmation review**(ASIL に応じて I0〜I3)を別工程として並置する(**[二次]**)。前者が実装側の内部検証、後者が独立性を段階的に上げる確認である。
- **DO-178C**: independence は「責任の分離」であり、**別の報告系統も別の会社も要求されない**。つまり実装組織・実装チームの内側に検証担当を置く構成が、そのまま DO-178C の independence を満たす(**[二次]**)。DO-178C の independence と IV&V(第三者)は別概念である。

### 7.3 本標準への含意(この節は調査ではなく整理)

- 「実装主体の内側に否定担当を置く」構成は、**同一チーム・別人であれば** IEC 61508 の verification、ISO 26262 の verification review、DO-178C の independence に対応づけられる。規格上の裏付けを持つ。
- **同一人物のままでは**、どの規格の目盛りにも載らない(29119 の「独立性ゼロ」を除く)。同一人物の自己検証を条項にする場合、それが独立検証の代替でも下位互換でもないことを明記する必要がある。
- 「レビューだけは自己では不可」という非対称(29119-1 E.3)は、動的テストとレビューで扱いを分ける根拠として使える。

---

## 8. 未取得・未確認の一覧(そのまま残す)

| 項目 | 状態 |
|---|---|
| IEEE 1012 本文の technical / managerial / financial の定義文 | **取得できなかった**(無償 PDF 3件が ECONNREFUSED / 404 / 403) |
| IEEE 1012 における IV&V の形態区分(Classical / Modified / Internal / Embedded) | **規格由来かどうか確認できなかった**。当たった二次資料本文には現れない。引用してはならない |
| IEEE 1012 が「独立していない V&V」を何と呼ぶか | **一次・二次とも確認できなかった** |
| IEC 61508-1 の independent person / department / organization の定義文 | **取得できなかった**(表と3水準の名称のみ許諾転載で確認) |
| ISO 26262-2:2018 Table 1 の原文 | **取得できなかった**。I0〜I3 の文言は二次資料経由 |
| ISO 26262-8 の原文 | **取得できなかった**。Clause 9.4.3.2 の存在のみ二次資料で確認 |
| ISO/IEC/IEEE 12207:2017 の Verification / Validation プロセス本文 | **取得できなかった**。Verification が独立性を要求するか否かは未確認 |
| DO-178C / DO-248C 原文 | **取得できなかった**(有償・無償プレビューなし)。DP#19 の内容はベンダ白書経由 |

Web 検索の予算(200件/セッション)を使い切ったため、代替経路の探索は打ち切っている。上記を埋めるには検索上限の引き上げ、または規格の購入が要る。
