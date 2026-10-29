# 調査 316-2: 規格策定機関は規定の表現形式をどう扱うか(外部)

- Issue: #316(規定の表現形式の残り)
- 確認日: すべて 2026-10-24(以下「確認日」は省略)
- 方法: WebSearch・WebFetch(curl は proxy で 403 になったため、全文の取得はできなかった)。WebFetch は抽出モデルを通すため、逐語の引用でも原文との突合は1回に限られる。#310 の調査(`research/302-310-deliberation/survey-310.md` 2章)が原典の全文写しで読んだ箇所は、そちらを引き、その旨を書く
- 凡例: 「逐語」= 原文から引いた。「要約経由」= 抽出モデルの要約で読み、逐語を確かめていない。「二次」= 原典ではない

## 0. 結論の先出し

1. ISO・JIS・IEEE はどれも、**種別(規定・参考)を要素の単位で決め、見出しで示す**。IEEE は箇条・細分箇条に「参考」の札を付けることも禁じる。ISO・JIS は**参考の附属書に要求の形を置くことを許す**が、置いても適合の条件にならない(JIS 20.2「参考要素とみなす」)
2. 文末の扱いは ISO と JIS で違う。**JIS は平叙の「…する。」を要求の表現形式に数える**。ISO の表3 に現在形の平叙文(is / does)は無く、平叙文は「statement」(情報を伝える表現)に当たる。IEEE は will を「事実の記述」に限る
3. **注記と例には、要求・推奨・許容を書かない**。ISO・JIS・IEEE の3者が一致する。W3C は「例・注記・図は常に参考」と宣言する
4. 要求の識別子は「**廃止しても番号を再利用しない**」(NIST SP 800-53 Rev.5)と「**版を前置して引く**」(OWASP ASVS)の2つの作法がある。NASA は NPR 7150.2 の要求に SWE-NNN を振り、手引き(SWEHB)が同じ番号で引く
5. 「逸脱」の語は、規格の世界で**少なくとも4つの意味**で使われる。ISO 9000 の逸脱許可(実現の前に認める)、ISO 指針の要求の定義(「no deviation is permitted」)、CENELEC の A-deviation(国内法令との衝突)、NASA の deviation(要求が構成管理に入る前の免除)。本標準 1.4 の定義はどれとも一致しない

---

## 1. 規定と参考

### 1.1 ISO/IEC 専門業務用指針 第2部(第9版 2021)

- URL: <https://www.iso.org/sites/directives/current/part2/index.xhtml>(既存カード SRC-0633)
- 版: まえがき「This ninth edition of the ISO/IEC Directives, Part 2 cancels and replaces the eighth edition published in 2018.」「… applicable to all enquiry drafts and to all final drafts registered after 2021-10-01.」(逐語)。第10版は見つからなかった
- ISO の案内ページ <https://www.iso.org/directives-and-policies.html> は、第2部を「together with the 2026 amendment covering management system standards drafting rules」と紹介する(要約経由)。**2026 年の追補の本文は読んでいない**。表現形式の箇条7 を変えたかは未確認
- 定義(逐語)
  - 3.2.1 normative element「element that describes the scope of the document or sets out provisions」
  - 3.2.2 informative element「element intended to assist the understanding or use of the document」
  - 3.3.1 provision の注記1: 規定の種類は文の形で区別する(指示は命令法、推奨は should、要求は shall)(要約経由)
  - 3.3.2 statement「expression, in the content of a document, that conveys information」
- 附属書(20.2、#310 が全文写しで読んだ逐語): 「Informative annexes may contain optional requirements. For example, a test method that is optional may contain requirements but it is not necessary to follow these requirements to claim conformance with the document. The status of the annex (informative or normative) shall be made clear by the way in which it is referred to in the text and shall be stated under the heading of the annex.」
- 他の文書種別(逐語)
  - 1「As far as practicable, these principles and rules also apply to Technical Reports and Guides.」
  - 3.1.8 の注記3「The content of a Technical Report is not permitted to include requirements」
  - 3.1.5 の注記2「A Technical Specification is not allowed to conflict with an existing International Standard.」
- 標準への含意
  - 「参考の附属書に要求の形を置いてよい」は ISO・JIS の両方が認める。ただし ISO の言い方は「optional requirements」で、**適合の条件にはならない**。参考の附属書に置いた「してはならない」を適合に効かせたいなら、その附属書を規定にするしかない
  - 種別は「見出しの下」と「本文からの引き方」の**2か所**で示す。本文が「附属書X による」と引けば規定、「附属書X 参照」なら参考と読まれる

### 1.2 手引きの文書と規格の関係(ISO/IEC/IEEE 24748-3:2020)

- URL: <https://www.iso.org/standard/77698.html>、<https://iteh.es/catalog/standards/iso/71a606f9-9681-4ef6-b389-fe051c8a83a0/iso-iec-ieee-24748-3-2020>
- 種別は International Standard(第1版、2020-10)。適用範囲は「This document is a guideline for the application of ISO/IEC/IEEE 12207:2017.」(逐語)
- 「this document does not repeat the detailed requirements and recommendations for purposes, outcomes, activities, and tasks」(逐語。iteh のプレビュー)
- 標準への含意
  - 手引きは、**同じ規格の形式で別の文書として発行**し、本体の要求を繰り返さない。手引きが本体と矛盾しうる箇所を、本体の要求の写しで作らない
  - TR は要求を含められない(1.1)。本標準のフェーズ5・6 を「手引き」とするなら、その中に要求の形を置かない作法と対になる

### 1.3 JIS Z 8301:2019(規格票の様式及び作成方法)

- 原本の所在: JISC の「JIS 検索」で現行 JIS の本文を閲覧できる。ただし利用者登録が要り、ダウンロード・印刷はできない
  - 国立国会図書館リサーチ・ナビ <https://ndlsearch.ndl.go.jp/rnavi/kansai-kan/post_400392>「日本産業標準調査会(JISC)のホームページで、現在有効なJISの本文を閲覧することができます。(要・利用者登録)」「ダウンロードや印刷はできません。」(逐語)
  - JISC の検索の頁は 2026-10-24 に「障害が発生しました」を返した。**本調査も JISC の原本では読めていない**。日本規格協会のプレビュー(webdesk.jsa.or.jp)は緊急保守中で開けなかった
- 本文は、第三者の転載 <https://kikakurui.com/z8/Z8301-2019-01.html> で読み直した(#310 と同じ転載。照合は2度目だが、同じ転載に依る)。2019 年版より新しい版・追補は、検索では見つからなかった(確かめきれていない)
- 定義(転載の逐語)
  - 3.2.1 本体「規格の構成要素のうち,附属書及び参考文献を除く部分」
  - 3.2.3 本文の定義は「例,注記,注釈,注,図,表などは含まない。」を含む
  - 3.2.5 注記「本文,図,表などの内容に対して,関連する補足事項を別に分けて記載するもの」
  - 3.3.1 規定要素「規格の適用範囲及び技術的内容を規定する構成要素」
  - 3.3.2 参考要素「規格の理解若しくは利用を助けることを意図する構成要素,又は規格の内容,背景若しくは他の規格などとの関係についての補足情報の提供を意図する構成要素」
  - 3.5.2 解説「規格の一部ではないが,本体及び附属書に記載した事柄並びにこれらに関連した事柄について説明するもの」
- 構成要素の表(表2。転載は列が崩れており、対応は文脈から読んだ): まえがき・序文・引用規格・目次・索引・参考文献は参考要素。適用範囲・用語及び定義は規定要素。附属書は「規定要素又は参考要素」
- 附属書(20.2、#310 の逐語): 「参考の附属書の中で,誤解が生じない限り,要求事項,推奨事項及び許容事項の表現を使用してもよい。ただし,規格を適用する場合,当該附属書は参考要素とみなす。」20.4 は見出しの下に「(規定)」又は「(参考)」を表記する
- 標準への含意
  - JIS は3層で分ける。**本体(規定要素の箇条)/附属書(規定・参考を個別に表示)/解説(規格の一部ではない)**。本標準のフェーズ5・6 は、この3層のどれにも当てはめられていない
  - 説明を規格から出す先として、JIS は「解説」を持つ。本文の段落の中の説明は「注記」へ分ける(本文の定義が注記を含まない)

---

## 2. 文末の形

### 2.1 JIS Z 8301:2019 箇条7(転載の再読)

| 種類 | 表現形式(転載) | 用いない形(転載) |
| --- | --- | --- |
| 要求(表3) | …する。/…(し)なければならない。/…とする。/…による。/…を行う。 禁止は …(し)てはならない。/…(し)ない。 | こと止め(…すること。)。「物」「者」「事柄」を規定しない場合の …ものとする。/…こととする。 |
| 推奨(表4) | …することが望ましい。/…するのがよい。/…することを推奨する。 緩い禁止は …望ましくない。/…しない方がよい。 | …すべきである。/…すべきでない。(「べき」は名詞の修飾にだけ使う) |
| 許容(表5) | …(し)てもよい。/…差し支えない。 不必要は …する必要がない。/…(し)なくてもよい。 | …できる。/…できない。 |
| 可能性・能力(表6) | …可能性がある。/…場合がある。/…ことがある。/…可能である。/…能力がある。 否定は …可能性がない。/…不可能である。 | …できる。/…できない。(能力を示す場合に限り、文の途中では用いてもよい) |
| 外部の制約(表7) | …に従わなければならないとされている。/…と定められている。 | 法規の名称・条項番号を直接引いて要求事項などの一部にしない(7.6) |

- 7.1(#310 の逐語)「推奨事項,許容事項及び可能性・能力事項は,要求事項とは明確に区別できるように記載する。文末の表現形式は,表3〜表6又はこれらと同等の表現形式とする。」
- 表3 の説明の欄「規格に適合するためには,厳密にこれによっており,これから外れてはならないことを示す。」(転載の断片をつないだ)
- **「〜することができない」は、転載の中に該当の文が無い**。JIS が定めるのは「…できない」を許容(の否定)と可能性・能力の文末に使わないことだけである。禁止は表3 の「…(し)てはならない。/…(し)ない。」で書く。したがって JIS の作法では、**文末の「できない」は禁止にも不許可にも能力の否定にも使えない**(能力の否定は「…不可能である。」)
- 標準への含意
  - 本文の「〜できません」(約114件)は、JIS の作法ではどの種類にも当たらない。禁止の意味なら「〜してはなりません/〜しません」、能力の否定なら「〜不可能です/〜場合はありません」へ書き分ける必要がある
  - 「…する。」が要求の筆頭にあるので、**本体の規定要素の中の説明の平叙文は、要求と読まれる**。JIS はこれを、説明を注記・参考の附属書・解説へ出すことで防いでいる
  - 転載に依る点は残る(EV-0096 は解消しない)。原本の確認は、JISC へ利用者登録した人が画面で読むしかない

### 2.2 ISO 指針 第2部 箇条7 と、平叙文の扱い

- 表3〜表7 の形は #310 の調査(survey-310 2.1)のとおり。今回の再読で確かめた点(逐語)
  - 7.1「verbal forms that are not defined in Table 3 to Table 7 shall not be used for the expression of provisions.」
  - 表3 の注記「The imperative mood is frequently used in English to express requirements in procedures or test methods.」「Do not use "may not" instead of "shall not" to express a prohibition.」。表3 は「do not」を shall not の同等の形に挙げる
  - 表6 は cannot を不可能の優先形に挙げる。「cannot」を禁止に使うなという明文は、表6 の注記には無い(要約経由)。禁止は表3 の shall not であり、cannot は表6(可能性・能力)にしか現れない
  - 3.3.8 external constraint の注記2「Use of the word "must" does not imply that the external constraint referred to is a requirement」(要約経由)
- 平叙文: 表3〜表7 に現在形の平叙文(is / does)は無い。3.3.1 の注記は規定を4種(statement・instruction・recommendation・requirement)に分け、3.3.2 statement は「情報を伝える表現」である。適用範囲(14.5)は「shall be worded as a series of statements of fact」(逐語)。**規定要素の中に事実の記述(statement)を置くことは禁じていない**が、それは要求ではない
- 標準への含意: ISO の作法では「The system does X」は要求ではなく記述である。JIS とは向きが逆になる。本標準が両方に整合すると主張するなら、平叙の「〜します」を要求に数えるか(JIS 側)、数えないか(ISO 側)を、1.7 で宣言する必要がある

### 2.3 IEEE SA Standards Style Manual(2021)

- URL: <https://mentor.ieee.org/myproject/Public/mytools/draft/styleman.pdf>(表題「2021 IEEE SA Standards Style Manual」。新しい版は見つからなかった)
- 箇条9(#310 の逐語): shall = 「is required to」。must は「unavoidable situations」に限る。「The word will is deprecated and shall not be used when stating mandatory requirements; will is only used in statements of fact.」can は可能性と能力
- 12.1(#310 の逐語): 本文の箇条・図・表・式、表と図の脚注、「(normative)」の附属書が規定。まえがき、本文・表・図の注記、「(informative)」の附属書が参考。「**Interspersed normative and informative text is not allowed. As such, neither clauses nor subclauses shall be labeled as informative.**」
- 文書の種類(要約経由): Standard は必須の要求、Recommended Practice は推奨、Guide は情報を与える。「its rules apply generically to guides and recommended practices as well」
- 標準への含意
  - IEEE の作法では、本文の箇条の中の事実の記述は許されるが、**箇条ごとに「参考」とする札は許されない**。フェーズ5・6 を「本文に従属する参考のページ」とする形は、IEEE の作法では書けない
  - 推奨を主とする文書は、規格とは別の種類(Recommended Practice / Guide)として発行する

### 2.4 IETF RFC 2119・RFC 8174(BCP 14)

- URL: <https://www.rfc-editor.org/rfc/rfc2119.txt>、<https://www.rfc-editor.org/rfc/rfc8174.txt>(#310 が全文を読んだ)
- RFC 8174「only UPPERCASE usage of the key words have the defined special meanings」「normative text does not require the use of these key words … a lot of normative text does not use them and is still normative.」(逐語)
- 標準への含意: IETF では**印を付けた語だけが定義された強さを持ち**、印の無い平叙文も規範でありうる。強さを持つ文と持たない文の区別を、文末ではなく印(大文字)で付ける作法である。日本語の文末には大文字に当たる印が無いので、そのまま移せない

---

## 3. 様式と例

### 3.1 注記と例(ISO・JIS・IEEE・W3C)

| 出典 | 規則 | 読んだ形 |
| --- | --- | --- |
| ISO 指針 第2部 24.5・25.5 | 「Notes shall not contain requirements (e.g. use of "shall" …) or any information considered indispensable for the use of the document, for example instructions (imperative mood), recommendations … or permission …」「Notes should be written as a statement of fact.」例も同文 | #310 の逐語 |
| ISO 指針 第2部 16.5.7 | 用語の項目の例について「Examples should be written as a statement of fact.」 | 今回の逐語 |
| JIS Z 8301:2019 | 「注記には,要求事項,推奨事項及び許容事項を含めてはならない。」「例には,要求事項,推奨事項及び許容事項を含めてはならない。」 | #310 の転載の逐語 |
| IEEE Style Manual 18.3 | 「Examples are not a normative part of the standard.」「requirements shall not be included in the text of the example.」 | 今回の要約経由(逐語の断片) |
| IEEE Style Manual 注記 | 「Notes to text, tables, and figures are for information only and do not contain requirements needed to implement the standard.」 | 今回の逐語 |
| W3C Manual of Style | 「Figures, examples and notes are assumed to always be informative.」 | #310 の WebFetch 経由 |

- 様式(テンプレート・記入例)そのものの規則は、ISO・IEEE のどちらにも見つからなかった。IEEE Style Manual は、追補・正誤表の冒頭に置く**定型文**(20.2)を「shall appear」で課すだけである(要約経由)。ISO は定型文を文言ごと示す(15.5.2「There are no normative references in this document.」16.5.3 など。逐語)
- 標準への含意
  - 様式の**記入例は「例」に当たり、参考である**。記入例の中に「〜しなければならない」を置くのは、3者の規則のどれでも許されない
  - ただし、記入例が「利用者が書く仕様の文」の見本(本標準の `01-feature-spec.md` の受入基準の例)である場合、その「しなければならない」は**標準の規定ではなく、利用者の文書の中の文の見本**である。ISO も JIS もこの場合を区別して定めていない。区別するなら、本標準の側で「記入例の文は利用者の文書の文であり、本標準の規定ではない」と宣言する必要がある(根拠水準: 外部に先例を見つけられなかった)
  - 附属書B のひな形の「〜すること」(こと止め)は、JIS の表3 で要求に用いない形である。ひな形が利用者の文書の見本なら JIS の拘束は及ばないが、本標準の規定として読ませるなら書き換えが要る

---

## 4. 禁止・要求の番号を文書をまたいで保つ

| 出典 | 作法 | 読んだ形 |
| --- | --- | --- |
| NIST SP 800-53 Rev.5 <https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf> 2.2 | 「A two-character identifier uniquely identifies each control family」「**Control designations are not re-used when a control is withdrawn.**」 | 逐語 |
| 同 | 評価手順(800-53A)とベースライン(800-53B、既存 SRC-0544)が同じ統制を扱う。同じ識別子を使うとの明文は、今回読んだ範囲には無かった | 要約経由 |
| OWASP ASVS「Using the ASVS」 <https://github.com/OWASP/ASVS/blob/master/5.0/en/0x03-Using-ASVS.md> | 「Each requirement has an identifier in the format <chapter>.<section>.<requirement>」。版を前置して「v<version>-<chapter>.<section>.<requirement>」で引く。「the identifiers may change between versions of the standard」。版を省くと最新版を指すと見なす | 逐語の断片。取得した頁の例は v4.0.2-1.11.3 で、5.0 用の頁かは確かめきれていない |
| OWASP ASVS 5.0 序文 | 「A two-way mapping between v4.0 and v5.0 is provided to facilitate migration.」 | 逐語 |
| NASA NPR 7150.2 と SWEHB <https://swehb.nasa.gov/x/3AP7> | 要求ごとに SWE-NNN を振り、手引き(Software Engineering Handbook)が同じ番号の頁で解説する。例: SWE-126 は NPR 7150.2 の 6.3.3 に対応する(既存 SRC-0560 は NPR 7150.2D 第2章) | 要約経由 |
| DO-178C 附属書A(既存 SRC-0529・SRC-0530・SRC-0437) | 目標を附属書A の表(A-1〜A-10)へ番号付きで並べ、ソフトウェアレベルごとの適用を示す。補足文書(DO-331〜DO-333)は、DO-178C の目標と活動への「additions, modifications, and deletions」を自分の附属書A で示す。AC 20-115D は附属書A の表の目標の充足を求める | SRC-0530・SRC-0529 の要約経由 |

- 標準への含意
  - 番号の安定には2つの型がある。**番号を永続させる型**(NIST: 廃止しても再利用しない)と、**版で修飾する型**(ASVS: 番号は変わりうる、引く側が版を書く)
  - 手引き・補足文書は、**本体の番号をそのまま引き、自前の番号を振らない**(NASA の SWE-NNN、DO-178C の補足文書)。本標準の禁止事項が 5.8.5(1〜5)・テンプレート(7〜9)・第8章(7〜9)で重なるのは、手引きの側が独自の連番を持ったことによる。外部の作法に合わせるなら、正本(第5章)に識別子を1つ持たせ、テンプレートと第8章はそれを引く
  - 廃止した禁止事項の番号を再利用しない規則は、本標準の根拠水準マーク(EV-NNNN)・実装マーク(IMPL-NNNN)が既に採っている作法と同じである

---

## 5. 「逸脱」と不適合・特別採用・例外

### 5.1 ISO 9000:2015 / JIS Q 9000:2015

- ISO OBP(<https://www.iso.org/obp/ui/>)は JavaScript が要り、読めなかった。英語の定義は欧州鉄道機関(ERA)の用語集が ISO 9000:2015 を出典として載せるもので読んだ(二次)
  - deviation permit <https://www.era.europa.eu/era-railway-terminology-collection/deviationpermit/term/sms_safety_culture_human_and_organisational_factor>: 「permission to depart from the originally specified requirements of a product or service prior to its realization」。注記1「A deviation permit is generally given for a limited quantity of products and services or period of time, and for a specific use.」
  - concession <https://www.era.europa.eu/era-railway-terminology-collection/concession/term/sms_safety_culture_human_and_organisational_factor>: 「permission to use or release a product or service that does not conform to specified requirements」
  - nonconformity: 「non-fulfilment of a requirement」
- JIS Q 9000:2015 の転載 <https://kikakurui.com/q/Q9000-2015-01.html>(逐語): 3.6.4 要求事項「明示されている,通常暗黙のうちに了解されている又は義務として要求されている,ニーズ又は期待。」、3.6.9 不適合「要求事項(3.6.4)を満たしていないこと。」。3.12.5 特別採用・3.12.6 逸脱許可は、転載の後半の頁が取得できず今回は読めていない。本プロジェクトの既存調査 `research/phase4-standard/236b-conditional-gate-approval.md` 2.1 が逐語を載せている(3.12.6 逸脱許可「製品又はサービスの当初の規定要求事項からの逸脱を,製品又はサービスの実現に先立ち認めること。」)
- 標準への含意: JIS Q 9000 の「逸脱」は**行為(当初の要求事項から外れること)**であり、「逸脱許可」はそれを**事前に認める手続**の名である。本標準 1.4 の「逸脱」(本標準が条項で条件と代償措置を定めて認めた、要求事項を満たさない状態)は、JIS Q 9000 の「逸脱許可を得た逸脱」に近いが、**許可を与えるのが組織の権限者ではなく標準の条項**である点が違う

### 5.2 規格の作法の中の deviation

| 出典 | 意味 | 読んだ形 |
| --- | --- | --- |
| ISO 指針 第2部 3.3.3 requirement | 「… from which no deviation is permitted if conformance with the document is to be claimed」。適合を主張するなら外れてはならない、の意 | 逐語 |
| ISO 指針 第2部 5.7 | 見出し「Avoidance of duplication and unnecessary deviations」。規格間の不要な食い違いの意 | 逐語 |
| IEEE Style Manual 箇条9 | shall の説明「from which no deviation is permitted」 | #310 の逐語 |
| JIS Z 8301 表3 の説明 | 「これから外れてはならない」 | 転載 |
| CENELEC BOSS <https://boss.cenelec.eu/homegrowndeliverables/EN/Pages/Adev> | 「Information that the provisions of an EN are in conflict with national regulation shall be included in an Annex to the European Standard, called A-deviation.」参考の附属書に置く | 逐語 |
| NASA SWEHB SWE-126 <https://swehb.nasa.gov/x/3AP7> | deviation =「documented authorization releasing a program or project from meeting a requirement」で、要求が構成管理に入る**前**。waiver は入った**後** | 要約経由(逐語の断片) |
| Wikipedia「Request for waiver」 <https://en.wikipedia.org/wiki/Request_for_waiver> | ECSS-M-ST-40C は deviation を「planned departure」、waiver を「unplanned departure」とする。MIL-HDBK-61A は「the term "waiver" is no longer used」 | 二次 |

- IEEE 730-2014 の本文は、取得できる経路が非公式の写しだけで、取得も失敗した。**IEEE 730 の deviation・nonconformance の定義は確かめていない**
- 規格が定義語を別の意味で使わないための作法: ISO 指針 5.6「Identical wording should be used to express identical provisions.」(要約経由の逐語)。用語の定義(箇条3)に置いた語は、文書全体でその意味に限る、というのが規格の作法の前提である。ISO 指針自身は「deviation」を箇条3 で定義せず、一般語として使う
- 標準への含意
  - 本標準 1.4 は「逸脱」を**定義語**にした。外部では deviation は一般語(外れること)としても、手続の名(逸脱許可、NASA の deviation)としても使われる。本標準の中で「委任の範囲の逸脱」「意図的な逸脱」のように一般語の用法を残すと、定義語との衝突が起きる(#313 のコメント)。定義語にした以上、一般語の用法は「離脱」「外れること」など別の語へ移すのが規格の作法に合う
  - 外部の語と対応を付けるなら、本標準の「逸脱」は ISO 9000 の deviation permit(事前・限定)に、「例外承認」は concession(事後・限定)に寄る。対応表を注記で示すと、ISO 9001 の監査員が読み替えられる。ただし対応は近似であり、一致とは書けない

---

## 6. 読めなかったもの

- JIS Z 8301:2019 の原本(JISC の閲覧は登録制で画面閲覧のみ。当日は障害)。日本規格協会のプレビューは保守中
- ISO 指針 第2部 の 2026 年の追補の本文。箇条24・25 の逐語は今回の WebFetch で範囲外になり、#310 の全文写しに依った
- IEEE 730-2014 の本文、ISO/IEC/IEEE 24765(SEVOCAB は取得失敗)
- DO-178C の附属書A の表そのもの(有償)
- OWASP ASVS 5.0 の識別子の規則の頁の版(取得した頁の例は v4.0.2)

---

## 7. 含意の一覧

1. **フェーズ5・6 の種別**: ISO・JIS・IEEE はいずれも種別を要素の単位で見出しに示す。IEEE は箇条単位の「参考」札を禁じる。「本文に従属する参考のページ」という形は外部に先例が無い。規定にするか、手引き(24748-3 型の別文書、または JIS の解説に当たるもの)として要求の形を置かないかの、どちらかに寄せるのが作法に合う
2. **参考の附属書の規範**: ISO・JIS は参考の附属書に要求の形を置くことを許すが、適合の条件にはならない。附属書C・E の手順を適合の条件に戻すなら、その部分を本文か規定の附属書へ移すしかない
3. **平叙の「〜します」**: JIS は要求、ISO は記述(statement)。本標準は 1.7 でどちらに立つかを宣言する必要がある。JIS に立つなら、本文の説明の文を注記・参考の附属書・解説へ出す作業が前提になる
4. **「〜できない/できません」**: JIS は文末の「できない」を許容・可能性のどちらにも使わない。禁止は「…(し)てはならない/…(し)ない」、能力の否定は「…不可能である」。約114件を、禁止・能力・可能性のどれかへ書き分けることになる
5. **記入例の文末**: 注記・例は要求を含まない(3者一致)。記入例が利用者の文書の文の見本であることを、本標準の側で宣言しないと、`01-feature-spec.md` の「しなければならない」は規則違反に見える。外部に先例は見つからなかった(宣言を置くなら根拠水準マークの対象)
6. **こと止め**: 附属書B のひな形の「〜すること」は、JIS が要求に用いない形。ひな形を規定として読ませるなら書き換えが要る
7. **禁止事項の番号**: 正本に1つの識別子を持たせ、テンプレートと第8章は引くだけにする(NASA SWE-NNN、DO-178C の補足文書)。廃止した番号は再利用しない(NIST)。テンプレートの版と標準の版が別に進むなら、ASVS 型の版の前置も要る
8. **「逸脱」の語**: 定義語にした以上、一般語の用法を別の語へ移す。ISO 9000 の逸脱許可・特別採用との対応は近似として注記に置ける
9. **JIS Z 8301 の原本確認(EV-0096)**: 本調査でも解消しない。転載の再読では #310 の対応表と矛盾は見つからなかった。原本は JISC へ利用者登録した人が画面で確かめるしかない

---

## 8. 出典カードの候補(作成していない)

### 8.1 既存のカード(重複させない)

| ID | 対象 |
| --- | --- |
| SRC-0633 | ISO/IEC Directives, Part 2(第9版 2021) |
| SRC-0492 | ISO/IEC Directives, Part 1 統合版 ISO 補足指針 |
| SRC-0544 | NIST SP 800-53B(統制ベースライン) |
| SRC-0529 | FAA AC 20-115D(DO-178C の附属書A の表を引く) |
| SRC-0530 | NASA の DO-178C・DO-278A 解説論文(附属書A・補足文書) |
| SRC-0437 | FAA DO-178B/C Differences Tool |
| SRC-0560 | NPR 7150.2D 第2章(テーラリング) |
| SRC-0643 / SRC-0648 | ISO 9001:2015 / JIS Q 9001:2015(目録・プレビュー) |
| SRC-0644 | ISO/IEC/IEEE 90003:2018 |
| SRC-0642 | ISO/IEC/IEEE 12207:2017 |
| SRC-0568 | SEBoK ライフサイクルステージ(24748-1 に触れる二次) |
| SRC-0632 | Wikipedia「Quality assurance」(ISO 9000 の定義の二次) |

- RFC 2119・RFC 8174・IEEE Style Manual・JIS Z 8301・W3C Manual of Style のカードは無い(#310 の調査が読んだが未登録)

### 8.2 新規の候補

| 候補 ID | 対象 | URL | 種別 / readLevel の見込み |
| --- | --- | --- | --- |
| SRC-0670 | JIS Z 8301:2019 規格票の様式及び作成方法(第三者の転載) | <https://kikakurui.com/z8/Z8301-2019-01.html> | standard / partial(原本未照合を明記) |
| SRC-0671 | RFC 2119 Key words for use in RFCs to Indicate Requirement Levels | <https://www.rfc-editor.org/rfc/rfc2119.txt> | standard / full |
| SRC-0672 | RFC 8174 Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words | <https://www.rfc-editor.org/rfc/rfc8174.txt> | standard / full |
| SRC-0673 | 2021 IEEE SA Standards Style Manual | <https://mentor.ieee.org/myproject/Public/mytools/draft/styleman.pdf> | standard / section |
| SRC-0674 | W3C Manual of Style | <https://www.w3.org/guide/manual-of-style/> | community / section |
| SRC-0675 | ISO/IEC/IEEE 24748-3:2020(12207 の適用の手引き、目録とプレビュー) | <https://www.iso.org/standard/77698.html> | standard / partial |
| SRC-0676 | NIST SP 800-53 Rev.5(2.2 統制の構造) | <https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf> | public-agency / section |
| SRC-0677 | OWASP ASVS「Using the ASVS」(識別子の書式) | <https://github.com/OWASP/ASVS/blob/master/5.0/en/0x03-Using-ASVS.md> | community / section |
| SRC-0678 | NASA SWEHB SWE-126 Waiver and Deviation Considerations | <https://swehb.nasa.gov/x/3AP7> | public-agency / section |
| SRC-0679 | ERA 用語集(ISO 9000:2015 の deviation permit・concession・nonconformity を出典つきで収録) | <https://www.era.europa.eu/era-railway-terminology-collection/deviationpermit/term/sms_safety_culture_human_and_organisational_factor> | public-agency / 二次 |
| SRC-0680 | JIS Q 9000:2015(第三者の転載、3.6.4・3.6.9) | <https://kikakurui.com/q/Q9000-2015-01.html> | standard / partial |
| SRC-0681 | CENELEC BOSS「A-deviations」 | <https://boss.cenelec.eu/homegrowndeliverables/EN/Pages/Adev> | standard / section |
| SRC-0682 | Wikipedia「Request for waiver」(ECSS-M-ST-40C・MIL-HDBK-61A の二次) | <https://en.wikipedia.org/wiki/Request_for_waiver> | community / 二次 |
| SRC-0683 | 国立国会図書館リサーチ・ナビ(JISC の JIS 閲覧の条件) | <https://ndlsearch.ndl.go.jp/rnavi/kansai-kan/post_400392> | public-agency / full |
| SRC-0684 | ISO「Directives and policies」(第2部の 2026 年の追補への言及) | <https://www.iso.org/directives-and-policies.html> | standard / page |

- SRC-0670・SRC-0680 は転載であり、原典の代わりにならない。カードには `derivedFrom` 相当で原本(JISC)の所在と未照合を書く
- 番号は他の調査と衝突しうる。登録の時点で `research/sources/` の最大番号を確かめてから振る
