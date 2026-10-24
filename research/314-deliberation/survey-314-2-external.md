# #314 外部調査: 検査の強さ・未達の規定の順序・指示文の検査

- 調査日: 2026-10-24
- 対象: Issue #314(実装マークの `check` 未分類の棚卸し、浅い検査、未達の規定の扱い)
- 方法: WebSearch / WebFetch による一次資料の確認。取得できなかった原典は [未確認] とし、二次資料で補った箇所は [二次] とした
- 検証ラベル
  - [原文] — 原典(規格本文・公式仕様・公式文書)を取得して該当箇所を確認した
  - [原文・部分] — 原典の一部(要旨・抜粋・プレビュー・公式解説頁)だけを確認した
  - [二次] — 原典ではなく、ベンダー記事・解説・転載で確認した
  - [未確認] — 主張の存在は知られているが、今回は原典も信頼できる二次資料も取得できなかった
- 関連性の記号: (a) 検査の強さの棚卸しと分類 / (b) 未達の規定を降ろす順序、または降ろさないと決めること / (c) スキルの文の検査の範囲
- 既存の出典台帳(`research/sources/`)に載っている文献は SRC 番号を併記した。新規の文献は台帳へ未登録

---

## 1. 検証の方法と、要求から実装への追跡

### F1. 検証の方法は「検査・分析・実演・試験」の4種で、検査(inspection)は「有無の確認」を指す

- 主張: 要求の検証方法は Inspection / Analysis / Demonstration / Test の4種に分けるのが系統工学の通例である。Inspection は「データを直接目視して、要求された属性の**有無を確かめる**」方法であり、対象を動かさない。Test は「管理された条件で対象を動かし、計測して合否を判定する」方法である
- 出典
  - Bill Haskins, "Implementing a Structured Verification Framework to Improve Verification Requirements Quality", INCOSE International Symposium, 2016. https://www.incose.org/wp-content/uploads/legacy/presentation/IS2016-pdf/5-2-2.pdf — 「Inspection implements the use of direct visual examination of data to confirm the presence or absence」 [原文・部分]
  - OMG SysML の `VerificationMethodKind`(Analysis / Demonstration / Inspection / Test)を実装した No Magic(Dassault Systèmes)の API 文書, 2026x. https://jdocs.nomagic.com/2026x/com/nomagic/magicdraw/sysml/util/SysMLProfile.VerificationMethodKindEnum.html [二次]
  - ISO/IEC/IEEE 29148:2018 の本文 — 有償のため取得できず。29148 が同じ4分類を挙げることは複数の二次資料が述べるが、条項番号と原文は確かめていない [未確認]
- 関連: (a) 本標準の `check=presence`(降ろし先の実在だけを確かめる)は、この分類の **Inspection に相当する正当な方法**である。弱い方法だから誤りなのではない。誤りは、Inspection を Test(`machine`)として表示することである。見出しの有無を確かめる検査は Inspection に当たり、`machine` と書いてはならない根拠になる

### F2. 1つの要求には主たる検証方法を1つ定め、「方法」と「活動」を区別する

- 主張: 要求ごとに主たる検証方法を1つだけ記すべきである。複数の方法を並べる組織は、方法と、それを実施する活動(書類を調べる等)を混同している。子要求の書類を調べるのは Inspection の活動だが、親要求の方法は Test のことがある
- 出典: ArgonDigital, "Use of Multiple Verification Methods"(Ask the Experts). https://argondigital.com/blog/product-management/use-of-multiple-verification-methods [二次]
- 関連: (a) `check` を単一値に保つ現行の設計(ADR-0061)を支持する。あわせて「検査スクリプトが見出しを読む」という**活動**と、規定の中身を確かめる**方法**とを分けて記録する必要を示す。見出しの検査は活動であり、それだけで規定の方法が `machine` になるわけではない

### F3. 方法の指定は検証可能性の証拠にならない。合否の基準が要る

- 主張: 「検証方法を特定することは必要だが十分ではない」。方法の印だけが検証可能性の唯一の証拠として扱われがちである。VCRM には方法(Exam / Anal / Demo / Test)に加えて、検証の目的と合否の基準を書く
- 出典: Stephen J. Scukanec, James R. van Gaasbeek(Northrop Grumman), "A Day in the Life of a Verification Requirement", INCOSE International Symposium, 2010. https://www.incose.org/wp-content/uploads/legacy/presentation/IS2010-pdf/2010-1.pdf [原文・部分]
- 関連: (a) `check=machine` を名乗る条件として、「何を違反とみなし、何で落ちるか」(合否の基準)の記載を求める根拠になる。方法の値だけを埋める棚卸しでは、浅い検査を見分けられない

### F4. VCRM は構成管理し、方法の選択に正当化を求め、全要求の検証を確かめる

- 主張: Verification Cross Reference Matrix を系統工学の組織が維持し、構成管理する。要求ごとに適切な検証方法を割り当て、その方法が十分に正当化されていることを確かめる。類似性による検証は PDR までに正当化し、CDR で更新する。すべてのシステム要求が検証されることを確かめる
- 出典: The Aerospace Corporation, Mission Assurance Baseline (MAB) v2.10, §2.2.1-4(Requirements Development, tasks 2.2.1-4-2, -7, -8). https://mab.aerospace.org/lvl2/2_2_1_2.2.1-4 [原文・部分]
- 関連: (a) 方法の割り当てに**正当化の記載**を求める点で、`check` の値に理由を添える設計を支持する。(b) 「全要求が検証される」ことを確かめる対象が、未達の規定(`undelivered`)を含む全数である点は、未達を消さずに表示し続ける本標準の方針と整合する

### F5. NASA NPR 7150.2D: 要求から検証・不適合への双方向追跡を、ソフトウェア区分で段階づけて課す

- 主張: SWE-052 は「プロジェクト管理者は、次の要素の間の双方向の追跡を実施し、記録し、維持しなければならない」と定める。区分 A〜C には上位要求・危険源・設計・コード・検証・不適合への追跡をすべて課し、区分 D には危険源・検証・不適合への追跡だけを課す。改訂 D で「試験手順」への追跡が「検証」への追跡へ改められた
- 出典: NASA Software Engineering Handbook, "SWE-052 — Last used in rev NPR 7150.2D". https://swehb.nasa.gov/x/moHeB [原文・部分](NPR 本体ではなく、NPR の要求文を転記した NASA 公式ハンドブックで確認)
- 関連: (a) 追跡先を「試験」から「検証」へ広げたことは、試験以外の方法(Inspection・Analysis)も正規の追跡先と認める例である。(b) 追跡の義務を**区分で段階づける**点は、未達の規定の扱いをリスク区分で分ける根拠になる。ただし本標準では R は変更ごと・CL は案件ごとであり(ADR-0039)、区分の当てはめ方は突合が要る
- 見つからなかったこと: SWEHB の当該頁は、追跡の完全性をどう検査するか(全要求が検証に辿れるかの検査)を述べていない

### F6. NASA の適合マトリクス: 要求ごとに適合の手段・所在・証拠・免除・承認を書き、「適用外」の正当化を点検する

- 主張: SWE-125(NPR 7150.2 2.2.5)は、ソフトウェアを含むプロジェクトに適合マトリクスの維持を課す。マトリクスは、要求ごとの適用性、適合の手段とその所在(文書と節)、進捗に伴う証拠、承認された免除・逸脱、テーラリングの正当化、承認者の署名を持つ。技術権限者は「適用外」と記された項目が十分に正当化されているかを日常的に点検する。承認されたマトリクスは、そのままテーラリング要求・免除申請として使える
- 出典: NASA Software Engineering Handbook, "SWE-125 — Requirements Compliance Matrix"(NPR 7150.2B 版の頁). https://swehb.nasa.gov/display/SWEHBVB/SWE-125+-+Requirements+Compliance+Matrix [原文・部分](頁は 7150.2B 版。7150.2D での変更は未確認)
- 関連: (b) 「降ろさない」と決めた規定を、未記入と区別して書く形の先例である。適用外・免除には理由と承認者を書かせ、第三者が点検する。本標準の実装台帳には、`undelivered` のうち「降ろす予定」と「降ろさないと決めた」を区別する欄がない。この区別を足す根拠になる

### F7. DO-178C: 要求に基づく試験の網羅解析と構造の網羅解析を組み合わせ、隙間を4種に分類する

- 主張: 構造の網羅は、要求に基づく試験が十分かを測る尺度として使う。構造の網羅で見つかった未実行の箇所は、(1) 要求の不足(必要な処理をしているのに要求が無い)、(2) 試験の不足(要求はあるが試験が無い)、(3) 余分なコード(どの要求にも辿れず不要)、(4) 無効化コード(特定の構成でだけ動く)のいずれかに分類し、それぞれ別の是正をする
- 出典
  - Rapita Systems, "4 key benefits of structural coverage for DO-178B systems". https://www.rapitasystems.com/blog/4-key-benefits-structural-coverage-do-178b-systems [二次]
  - J. J. Chilenski ほか(Boeing), "Issues Concerning the Structural Coverage of Object-Oriented Software", DOT/FAA/AR-02/113, FAA, 2002. https://apps.dtic.mil/sti/pdfs/ADA411909.pdf — 「Structural coverage is used within DO-178B as one of the adequacy measures for the requirements-based testing」 [原文・部分](DO-178B に関する FAA 報告。DO-178C 本文ではない)
  - RTCA DO-178C 本文(6.4.4 の網羅解析、附属書 A 表 A-7)— 有償のため取得できず [未確認]
- 関連: (a) **2方向の網羅**の型を与える。規定 → 降ろし先(要求に基づく網羅)だけでなく、降ろし先 → 規定(フックや CI の検査のうち、どの規定にも辿れないもの)を見る逆方向の検査がある。逆方向で見つかった隙間を「要求の不足」「余分な強制」に分けられる。(c) スキルの文の検査を「文が規定に辿れるか」の逆方向にも掛けるかの論点になる

### F8. IEC 61508: 強く推奨される技法を使わないときは、理由を書く

- 主張: IEC 61508-2 附属書 A.3 と附属書 B は、安全度水準に対して強く推奨(HR)される技法を使わない場合、その理由の詳述を求める。推奨されない(NR)技法を使う場合も同じである。IEC 61508-3 の附属書 A・B の序文は、HR・NR の指針に従わない理由を文書化するよう推奨し、安全計画の段階で評価者と合意しておくとする
- 出典
  - OMRON Automation Knowledge Base, "Is it necessary to choose techniques and measures from those recommended in Annexes A and B of IEC 61508?". https://automation-knowledge-base.omron.eu/support/solutions/articles/103000351897 [二次]
  - IEC 61508-3:2010 プレビュー(VDE Verlag)— 目次で 7.9 ソフトウェア検証、表 A.9・A.10 の存在だけを確認。本文は未取得 https://assets.vde-verlag.de/iec-normen/preview-pdf/info_iec61508-3%7Bed2.0%7Db.pdf [原文・部分]
- 関連: (b) 「採らないと決めたことを明記する」という本標準のコアポリシーと同型の規範が、安全規格に既にある。降ろさないと決めた規定に理由の記載を義務づける根拠になる

### F9. ISO 26262: 検証方法はレビュー・分析・動的試験の3分類。表の推奨記号の規則は原典未確認

- 主張: ISO 26262 は検証方法を、レビュー(作業成果物の人による調査)・分析(定めた技法による系統的な調査)・動的試験に分ける。ソフトウェア安全要求の検証は、技術的安全要求・システム設計・HW/SW インタフェースとの整合を確かめる(Part 6 の 6.4.8 相当)
- 出典
  - Presencis, "ISO 26262 Article 6 — Software Verification". https://presencis.com/regulations/iso-26262/article-6-software-verification/ [二次]
  - R. Salay ほか, "Using Machine Learning Safely in Automotive Software: An Assessment and Adaption of Software Process Requirements in ISO 26262", arXiv:1808.01614, 2018. https://arxiv.org/abs/1808.01614 [二次]
  - 各表の「++」(強く推奨)・「+」(推奨)・「o」の解釈と、選ばなかった方法の扱いを定める節(各 Part の 4.3「表の解釈」)— ANSI のプレビューは目次だけで本文を取得できず [未確認]
- 関連: (a) レビューを独立の方法として数える点は、`check=manual` を正規の値とする現行設計と整合する。ただし表の記号規則は確かめていないため、根拠として引用しない

---

## 2. Policy as Code と Compliance as Code

### F10. NIST OSCAL: 実装の状態は5値。部分・計画には隙間と計画の記載を課す

- 主張: OSCAL の `implementation-status` の `state` は次の5値である。implemented(完全に実装)、partial(一部を実装)、planned(注記で説明した実装の計画がある)、alternative(注記で説明した代替の実装がある)、not-applicable(注記で正当化した上で、この系に適用しない)。FedRAMP はこの5値だけを受け付ける。partial と planned は併記できる。partial は注記に隙間の説明を、planned は「主要なマイルストーンを含む計画の簡潔な説明」と `planned-completion-date` を必須とする
- 出典
  - NIST, liboscal-java `ImplementationStatus`(OSCAL メタスキーマの許容値の実装). https://pages.nist.gov/liboscal-java/xref/gov/nist/secauto/oscal/lib/model/ImplementationStatus.html [原文]
  - FedRAMP Automation, "SSP — Security Controls". https://automate.fedramp.gov/documentation/ssp/6-security-controls [原文]
- 関連: (b) 本標準の `state` は delivered / undelivered の2値である。OSCAL は「計画あり(期日つき)」「代替で満たす」「適用しない(理由つき)」を、未実装と区別して持つ。降ろさないと決めた規定を `not-applicable` や `alternative` に当たる値で示し、降ろす予定の規定に期日を持たせる設計の先例になる。`state` の値を増やさない現行規約(implementation-marking.md)とは衝突するため、別の欄で持つか、規約を改めるかを議論で決める必要がある

### F11. OSCAL の評価結果は「主張された実装」と「評価で確かめた状態」を別の層に置く

- 主張: OSCAL は、系の実装の主張(SSP)と、評価の計画・結果(Assessment Plan / Assessment Results)を別のモデルに分ける。評価結果の `finding-target` は、`status/state`(satisfied: 目的を完全に満たした / not-satisfied: 完全には満たしていない、部分的に満たす場合を含む)と `reason`(pass / fail / other)を持つ。さらに任意で `implementation-status` を持ち、「評価で、統制がどの程度実装されていると判明したか」を表す。評価の活動の方法は INTERVIEW / EXAMINE / TEST のいずれかに限る
- 出典
  - NIST, OSCAL Reference, Assessment Results Model v1.0.6, JSON definitions. https://pages.nist.gov/OSCAL-Reference/models/v1.0.6/assessment-results/json-definitions/ [原文]
  - NIST, "OSCAL Assessment Plan, Assessment Results and POA&M"(発表資料). https://pages.nist.gov/OSCAL/presentations/oscal-ap-ar-poam-v3.pdf [原文・部分] — 評価の終了時に open のリスクを同じ構文で POA&M へ移す
- 関連: (a) **主張と評価を別の欄に持つ**型である。本標準の `state`(降ろし先がある)は SSP の主張に、`check`(何で確かめるか)は評価の方法に当たる。OSCAL にはさらに「評価の結果」(満たしたか)の欄がある。本標準には、検査が違反を実際に検出できたかの結果の欄がない。陽性対照(`npm run test:impl`)の結果をこの欄に当てる案の根拠になる

### F12. NIST RMF の評価は「正しく実装・意図どおり動作・望む結果」の3段を確かめる

- 主張: RMF の Assess 段階の目的は、「統制が正しく実装され、意図どおりに動作し、望む結果を生んでいるか」を、系と組織のセキュリティ・プライバシー要求に照らして判定することである
- 出典: NIST CSRC, "Risk Management Framework — Assess Step". https://csrc.nist.gov/Projects/risk-management/about-rmf/assess-step [原文]
- 関連: (a) 検査の強さの段を立てる外部の枠組みとして最も直接に使える。「降ろし先がある」(本標準の presence)は第1段の一部にすぎない。「違反を止める」は第2段、「規定の目的を達している」は第3段に当たる。`check` の値をこの3段に対応づけて定義し直すかを論点にできる

### F13. NIST SP 800-53A: 評価の方法に加え、深さと範囲を3段で開示する

- 主張: SP 800-53A の評価は、方法(examine / interview / test)に加えて、深さ(depth)と範囲(coverage)の属性を持つ。深さは文書なら Review(必要な内容があるかの概括的な確認)・Study・Analyze、活動・仕組みなら Observe・Inspect・Analyze、試験なら Basic・Focused・Comprehensive の3段である。範囲は Basic Sample・Focused Sample・Sufficiently Large Sample の3段である。これらの属性は証拠集めの手順の順序や選択を変えず、厳格さの度合いを示す
- 出典: NIST CSRC, "Assessment Cases Overview". https://csrc.nist.gov/projects/risk-management/about-rmf/assess-step/assessment-cases-overview [原文・部分](SP 800-53A Rev.5 本体の附属書 C は未取得)
- 関連: (a)(c) Issue の「浅い検査」(見出しの有無だけを確かめる)は、800-53A の語でいえば **examine / Review / Basic** に当たる。方法の値だけでは浅さを表せないため、**深さの属性を別に開示する**設計の先例になる。スキルの文の検査も、方法(examine)と深さ(Review)を明示すれば、過大な主張を避けられる

### F14. SOC 2: Type 1 は時点での設計の適切さ、Type 2 は期間を通じた運用の有効性

- 主張: SOC 2 の Type 1 報告は、ある時点で統制が適切に設計されているかを評価する。Type 2 報告は、統制の設計の適切さと運用の有効性を、一定の期間(一般に3〜12か月)にわたって評価する
- 出典
  - Cloud Security Alliance, "Cloud Security Alliance Releases Illustrative Type 2 SOC 2 Report that Incorporates its Cloud Controls Matrix Criteria", 2022(AICPA の意見を得て作成). https://cloudsecurityalliance.org/articles/cloud-security-alliance-releases-illustrative-type-2-soc-2-report-that-incorporates-its-cloud-controls-matrix-criteria — 「the suitability of the design and operating effectiveness of controls」 [原文・部分]
  - Secureframe, "SOC 2 Type 1 vs Type 2". https://secureframe.com/hub/soc-2/type-1-vs-type-2 [二次]
  - AICPA の SOC 2 の指針(Description Criteria、Attestation Guide)本文 — 取得できず [未確認]
- 関連: (a) 「統制がある」と「統制が効いている」を**別の保証の種類**として扱う、監査実務で確立した区別である。本標準の presence は Type 1 に近く、machine でも陽性対照が一度通っただけなら時点の確認にとどまる。運用の有効性に当たるのは、実運用で違反を止めた記録(件数)である

### F15. OPA / Conftest: 方針そのものを単体試験し、網羅は「評価された行」を示すだけ

- 主張: `opa test` は Rego の方針に対する単体試験を実行し、`--coverage` は評価された行と評価されなかった行を出す。規則の頭部が未網羅なら、その規則の本体が一度も真にならなかったことを意味する。公式の例は、許可される入力と拒否される入力の両方を試験する。網羅は何が実行されたかを示すもので、正しさは試験の合否が決める。Conftest は `conftest verify` で方針の単体試験を実行する
- 出典
  - Open Policy Agent, "Policy Testing". https://openpolicyagent.org/docs/policy-testing [原文]
  - Conftest 公式サイト. https://conftest.dev/ [原文]
- 関連: (a)(c) 検査そのものを試験する(policy の単体試験)実務が確立している。また「検査の規則が一度も発火していない」ことを網羅で見つけられる。本標準の検査スクリプトに、規定ごとの発火の有無を出させる案の根拠になる。網羅が正しさを示さない点は、presence を machine と読み替えない理由と同じである

### F16. Semgrep: 規則の試験に陽性(ruleid)と陰性(ok)を並べ、既知の未検出は todo で失敗させずに残す

- 主張: Semgrep の規則の試験は、`ruleid:` の注記で検出漏れを、`ok:` の注記で誤検出を防ぐ。まだ捉えられない陽性は `todoruleid:`、まだ誤って捉える陰性は `todook:` と記し、試験は失敗しないが既知の隙間として残る
- 出典: Semgrep, "Testing rules". https://docs.semgrep.dev/writing-rules/testing-rules [原文]
- 関連: (a) `check=machine` の条件(違反を検出することを実行して確かめた)を、**陽性・陰性の対で**確かめる型を与える。(b) `todoruleid` は「降りていないことを消さずに表示し、検査は失敗させない」という本標準の `undelivered` と同じ設計である。外部にも同型の先例がある

### F17. Chef InSpec: 情報だけの統制・スキップ・適用外を、失敗と区別して報告する

- 主張: InSpec の `impact` は 0.0〜1.0 で、0.0 以上 0.01 未満は「影響を持たず、情報だけを与える統制」である。`only_if` が偽ならその統制の試験は実行されず、理由の文を添えられる。`only_applicable_if` が偽なら、統制は適用外(N/A)として理由とともに報告される。集計には「not reviewed」と「not applicable」の件数が出る
- 出典: Chef, "InSpec Profiles — Controls". https://docs.chef.io/inspec/profiles/controls [原文・部分](「not reviewed」の定義は頁に無い)
- 関連: (a)(b) 検査の結果を「通過・失敗」の2値にせず、**実行しなかった・適用外・情報だけ**を件数で出す。本標準の台帳が「未分類の件数」を冒頭に出す設計と同じ方向である

### F18. CIS Benchmarks: 推奨事項を「自動」と「手動」に分け、手動の項目も基準に残す

- 主張: Automated の推奨事項は完全に自動化でき、合否の状態まで検証できる。Manual の推奨事項は完全には自動化できず、構成が期待どおりかを確かめるのに一部または全部の手作業が要る。自動の報告でも手動の項目を残し、Pass / Fail / Warn / Equivalent Control / Depends on Environment などの状態で示す
- 出典
  - Google Cloud, "CIS Benchmarks"(GKE on-prem 1.16 の文書。CIS の定義を引用). https://docs.cloud.google.com/anthos/clusters/docs/on-prem/1.16/concepts/cis-benchmarks [二次]
  - CIS の公式 FAQ(Manual と Automated の意味、Scored / Unscored の廃止)— ログインが必要で取得できず [未確認]
- 関連: (a) 手動の項目を自動の項目と同じ一覧に残し、**手動であることを表示する**。presence や manual を、検査の弱さを隠す値ではなく正規の区分として扱う先例である

### F19. SLSA: 検証の結果を、検証に使った方針の版と入力の証跡とともに記録する

- 主張: SLSA の Verification Summary Attestation(VSA)は、`verificationResult`(PASSED / FAILED)、`verifiedLevels`(検証できた最高の水準)、`policy`(照合した方針の URI と、推奨として版のダイジェスト)、`inputAttestations`(検証に使った証跡の集合とダイジェスト)、`verifier`(検証した主体)を持つ
- 出典: OpenSSF SLSA, "Verification Summary Attestation (VSA)" v1.1. https://slsa.dev/spec/v1.1/verification_summary [原文](SLSA 全般は SRC-0415・SRC-0416)
- 関連: (a) 「検査した」という記録には、**どの版の規則で、どの証跡を使ったか**を添える。本標準の `check=machine` を、検査スクリプトの所在と、陽性対照の版に結びつける案の根拠になる

---

## 3. AI エージェントへの自然言語の指示の検査

### F20. プロンプトの評価: 成功の基準を測れる形で決め、採点の手段を選ぶ

- 主張: 成功の基準は具体的で測れる形にする(例: 「1万件の保留データで F1 0.85 以上」)。採点はコードによる採点(速く決定的だが言い換えに弱い)、人による採点(精細だが遅く高価)、LLM による採点(ニュアンスを扱えるが信頼性に注意が要る。生成と別のモデルを使う)から選ぶ。少数の手採点より、自動採点の多数の問いを優先する
- 出典: Anthropic, "Define success criteria and build evaluations"(Claude Platform Docs). https://platform.claude.com/docs/en/test-and-evaluate/develop-tests [原文]
- 関連: (c) 指示文の効き目を確かめる手段は、文の存在の検査ではなく、**挙動の評価**である。スキルの文の検査は、評価の代わりにならない

### F21. スキルの単体試験: 非決定性があるため複数回の試行と、能力・信頼性の2指標を使う

- 主張: スキルの評価では、隔離した環境でエージェントにタスクを実行させ、決定的な採点(シェルで結果を確かめる)と LLM の基準表による採点を組み合わせる。挙動は非決定的なので1回の実行には意味がなく、少なくとも5回試行する。pass@k(k 回のうち1回でも解けるか)で能力を、pass^k(毎回解けるか)で信頼性を測り、両者の差が大きいスキルは不安定とみなす。手順ではなく結果を採点する
- 出典: Minko Gechev, "Unit Tests for AI Agent Skills", 個人ブログ, 2026-02-26. https://blog.mgechev.com/2026/02/26/skill-eval/ [原文](個人の実践報告。単一事例)
- 関連: (c) 指示文の遵守を確かめる検査は、試行回数と信頼性の指標を持たないと結論を出せない。CI で毎回回す決定的な検査とは別の層になる

### F22. 文書の走査だけのスキル検査は、スキルが実際に効くかを示さない

- 主張: 現行のスキルのゲートは、文書の構造・文体・安全性を走査するだけで、スキルが稼働中のエージェントを助けるかを示さない。145 のスキルで、構造の得点と LLM 判定の得点の順位相関は ρ=0.14 で、両者は別の側面を測る。スキルの有無で対にした試行(64 の本番スキルのうち 58、947 対)では、合成の向上量(Skill Lift)の平均は 0.2134(95% CI 0.1967–0.2301)で、72.8% の対で正だった。結果だけの指標は手順の飛ばしを見逃すため、軌跡の検査と組み合わせる。評価の資産(`evals/`)はスキルとともに置き、モデル更新後に評価し直す
- 出典: C. Kevin ほか(NVIDIA), "Evaluating Skills, Not Just Agents: Agentic Continuous Evaluation of Skills (ACES)", arXiv:2608.20614, 2026. https://arxiv.org/pdf/2608.20614 [原文・部分](要旨と本文の要約を確認。査読前。著者自身が、判定モデル間の一致と人による較正は未測定と述べる)
- 関連: (c) **最も直接の根拠**。スキルの文の存在・構造の検査は「補完的な側面」を測るもので、効き目の代用にならないと実測で示す。スキルの文の検査を「文がある」ことの確認(presence)に限定して表示し、遵守の主張に使わない範囲の決め方を支持する。スキルの有無で対にする試行は、F25〜F27 の変異の考え方(規則を消して結果が変わるか)を指示文へ当てはめたものとも読める

### F23. CLAUDE.md・AGENTS.md の lint は存在するが、規範の正本に対する網羅は誰も検査していない

- 主張: 指示ファイルの lint ツールは複数ある。調べたものは、存在しない経路・存在しないコマンド・ファイル間の矛盾・重複・長さ・適用範囲の無い規則・試験や開発環境の指示の欠落を検出する。いずれも正規表現・トークン比較・ファイルの照合による静的検査で、規則がエージェントに守られるかは試さない。「規則のファイル内の主張を、ビルドに対して検証しない」と自ら明記するものもある
- 出典
  - duke5am, agents-md-check(GitHub, 2026). https://github.com/duke5am/agents-md-check [原文] — 「Every check is a regular expression, a token comparison or a filesystem lookup」「has no idea whether a rule is good」
  - agentwares, agentsmd-lint(GitHub, 2026). https://github.com/agentwares/agentsmd-lint [原文]
  - 同種: agent-rules-lint、agent-rules-linter、AgentLinter、AgentLint(検索結果で存在のみ確認) [未確認]
- 関連: (c) 外部の lint は「参照先が実在するか」「ファイルが互いに矛盾しないか」までであり、**外部の規範(規格の条項)が指示文へ漏れなく降りているかを検査する道具は見つからなかった**。本標準のスキルの文の検査は、この点で先例が無い。先例の無さは、効き目の根拠も無いことを意味する(根拠水準マークの対象)

### F24. 指示文が読まれ守られる率は低く、効果も研究間で割れる(台帳の既存文献)

- 主張: AI 貢献ルールを持つ OSS 49 リポジトリで、エージェントが常時読み込まれる AGENTS.md 以外のルールファイルを自発的に読んだのは実行の 3.5% だった(SRC-0313)。文脈ファイルは課題の成功率を概して改善せず、推論費用を平均 20% 超増やした(SRC-0206)。一方で、合成のバグ修正プローブで指示書を反復修正すると、解決率が 25.5%(指示なし)から 33.0% へ上がった(SRC-0323)
- 出典: SRC-0313(arXiv:2607.26819, Peking University, 2026)、SRC-0206(arXiv:2602.11988, ETH Zurich, 2026)、SRC-0323(arXiv:2606.20512, Williams College, 2026) [二次](今回は台帳の要約で確認。原文は台帳作成時に読了済み)
- 関連: (c) 文がスキルに「ある」ことと、エージェントがそれを「読み、守る」ことの間には大きな隔たりがある。スキルの文の検査が通っても、規定が実行層へ届いたとは言えない

### F25. 変異試験: 試験集合が欠陥を検出する力を、作り込んだ変異を殺せるかで測る

- 主張: 変異試験は変異解析を試験に使う手法で、試験が殺した変異の割合(変異得点)を試験の十分さの尺度に使う。高い変異得点の試験集合は多くの欠陥を明らかにでき、他の網羅基準より反証可能性が高いとされる。前提は「有能なプログラマ仮説」(プログラムはほぼ正しい)と「結合効果」(単純な変異を見つける試験は複雑な変異も多く見つける)である
- 出典: M. Papadakis, M. Kintis, J. Zhang, Y. Jia, Y. Le Traon, M. Harman, "Mutation Testing Advances: An Analysis and Survey", プレプリント 2017(書籍の章として刊行。収録先は今回確かめていない). https://mutationtesting.uni.lu/survey.pdf [原文・部分]。LLM 生成の試験で網羅と変異得点が実効性と相関するかの追試は SRC-0022
- 関連: (a) Issue の問い「規則を消すと検査が落ちるか」は、変異試験そのものである。検査の強さを「規定の文や降ろし先を変異させたとき、検査が落ちるか」で操作的に定義できる。本標準の陽性対照(`npm run test:impl`、既知の違反を入れて検査が落ちることを確かめる)は、この型の一部を既に実装している

### F26. 変異試験は差分に絞り、コードレビューの中で見せると実用になる

- 主張: Google は、差分に基づく確率的な変異解析を使う。文の網羅の無い行と、興味の無い「乾いた」行を除いて変異の数を大きく減らし、必須のコードレビューの中で結果を見せる。約 6,000 人の技術者が使い、文の網羅を計算した差分の約 30% を処理していた
- 出典: G. Petrović, M. Ivanković, "State of Mutation Testing at Google", ICSE-SEIP 2018. https://research.google/pubs/state-of-mutation-testing-at-google/ [原文・部分](要旨のみ。提示した変異の数と有用と判定された割合は要旨に無い)
- 関連: (a)(b) 100 件の未分類を一度に変異試験にかけなくてよい。**変更された規定と、その降ろし先に絞って**変異を掛ける運用が、産業規模での先例になる

### F27. アクセス制御の方針(XACML)にも変異試験が使われている

- 主張: アクセス制御の方針の欠陥モデルを定め、それを実装する変異演算子・変異の生成・等価変異の検出・変異を殺したかの判定から成る枠組みを作った。網羅基準の評価と、構造の網羅と欠陥検出力の関係の調査に使った
- 出典: Evan Martin, Tao Xie(North Carolina State University), "A Fault Model and Mutation Testing of Access Control Policies", WWW 2007. https://www2007.cpsc.ucalgary.ca/program/paper.php?id=447 [原文・部分](要旨のみ)
- 関連: (a) コードではなく**方針・規則の集合**に変異を掛けて、その試験の検出力を測る研究は 2007 年からある。規定と実装マークの組に変異を掛ける案は、手法として新奇ではない
- 見つからなかったこと: CLAUDE.md・スキル・フックの設定に変異を掛けて、検査が落ちるかを測った報告は見つからなかった。最も近いのは、指示ファイルの有無で対にした試行(F22、SRC-0322 のアブレーション)である

---

## 4. 未達の統制の優先づけと開示

### F28. NIST SP 800-53 CA-5: 評価で見つかった弱点の是正計画を POA&M に書き、評価・監査・継続監視の結果で更新する

- 主張: CA-5 は、統制の評価で見つかった弱点・欠陥を正すために組織が計画した是正の行動を POA&M に文書化し、統制の評価・独立の監査やレビュー・継続的な監視の結果に基づいて更新することを求める。POA&M は認可パッケージに必須である
- 出典: NIST SP 800-53 Rev.5 CA-5(STIG Viewer の転載で確認). https://www.stigviewer.com/controls/nist-800-53/CA-5 [二次]
- 関連: (b) 未達の統制を、是正の計画とともに**公式の一覧へ載せる**ことが制度化されている。本標準の `undelivered` の台帳は、マイルストーン・期日・責任者の欄を持たない点で POA&M より薄い

### F29. 米国 GSA: POA&M はリスク評価で優先づけ、項目を消さず、期日の未定は1四半期まで

- 主張: POA&M の項目は、リスク評価の結果を使って是正の優先順位をつける。システム所有者は重大度で上位5件の弱点を優先し、最も重大な POA&M に資源を割り当てる。脆弱性の是正期限は、インターネットに面する Critical が15日、Critical・High が30日、Moderate が90日、Low が120日である。期日の TBD は避け、使う場合は理由を書き、1四半期に限る。POA&M の項目は削除せず、完了したものは表示から除くだけにする。是正できないリスクは、承認されたリスク受容(AOR)を作る
- 出典: U.S. General Services Administration, "Plan of Action and Milestones (POA&M)", CIO-IT Security-09-44 Rev.8, 2022-09-14. https://origin-www.gsa.gov/system/files/Plan-of-Action-and-Milestones-%28POAM%29-%5BCIO-IT-Security-09-44-Rev-8%5D-09-14-2022.pdf [原文]
- 関連: (b) 降ろす順序を**リスクで決め**、期日の無い項目を許す期間に上限を置き、項目を消さない。「消さない」は本標準の `undelivered` の方針と一致する。「降ろさない」と決める経路は、是正の項目とは別の承認つきのリスク受容として分かれている

### F30. FedRAMP: 重大度で期限を変え、High には運用上の理由による例外を認めない

- 主張: 是正の期限は発見から Critical・High が30日、Moderate が90日、Low が180日である。逸脱の申請は、リスク調整(緩和要因・補償統制)、誤検出、運用上の要件の3種で、第三者評価機関の検証か認可者の承認を要する。FedRAMP は High の脆弱性について運用上の要件による例外を承認しない。承認された運用上の要件の項目も Open に残し、定期的に再評価する
- 出典: FedRAMP, "Plan of Action and Milestones (POA&M)"(CSP Authorization Playbook、レガシー頁。2026年の統合規則へ移行中と明記). https://fedramp.gov/legacy/playbook/csp/authorization/poam/ [原文](現行規則との差は未確認)
- 関連: (b) 「降ろさない」(運用上の理由による例外)を**重大度で禁じる**線を引く先例である。降ろさないと決めた項目も閉じずに残し、定期的に見直す

### F31. CMMC: 未達のまま認証を得てよい要求を限定し、6つの要求は POA&M に載せることを禁じ、180日で閉じなければ失効する

- 主張: CMMC Level 2 で POA&M を使えるのは、評価の得点が満点の 0.8 以上の場合に限る。POA&M に載せてよいのは 1点の要求だけである(例外は、暗号を使っているが FIPS 検証済みでない SC.L2-3.13.11)。外部接続(AC.L2-3.1.20)、システムセキュリティ計画(CA.L2-3.12.4)、物理アクセスの管理など6つの要求は POA&M に載せられない。POA&M は条件付きの認証の日から180日以内の閉鎖評価で閉じる必要があり、閉じなければ条件付きの認証が失効する。Level 1 では POA&M を一切認めない
- 出典
  - 32 CFR §170.21 "Plan of Action and Milestones requirements"(eCFR). https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-G/part-170/subpart-D/section-170.21 [原文]
  - U.S. DoD CIO, "CMMC 101", 2025-11. https://dodcio.defense.gov/Portals/0/Documents/CMMC/CMMC-101-Nov2025.pdf [原文・部分]
- 関連: (b) **最も直接の先例**。未達を許す規定と許さない規定を、規格の側で**名指しで**分ける。許す規定にも期限と失効を付ける。本標準で「降ろさないまま運用してはならない規定」(例: 第5章の一律で委譲できない領域、停止の申し立て)を名指しで固定し、それ以外に期限を付ける案の根拠になる

### F32. 未実装の要求の開示は「計画(期日)・代替・適用外(理由)」を未記入と区別して書く

- 主張: F6(NASA の適合マトリクスで適用外の正当化を点検する)、F8(IEC 61508 の HR を使わない理由)、F10(OSCAL の planned に計画と完了予定日、not-applicable に理由)、F16(Semgrep の todo)、F29(GSA の TBD は1四半期まで、項目は消さない)は、いずれも「まだ満たしていない」を、**計画あり・代替あり・適用しないと決めた**に分けて書かせ、何も書かれていない状態と区別する
- 出典: F6・F8・F10・F16・F29 に同じ [原文〜二次の混在。各項を参照]
- 関連: (b) 本標準の「書かれていない」と「課さないと決めた」を区別するコアポリシーは、外部の規格・実務と整合する。実装台帳には、この3区分を表す欄がまだない

---

## 5. 見つからなかったこと

- **ISO/IEC/IEEE 29148:2018 の本文**: 検証方法の4分類と、その条項番号を原典で確かめられなかった(有償)。二次資料と SysML の列挙で代えた
- **DO-178C 本文**(6.4.4 の網羅解析、附属書 A 表 A-7)と **ISO 26262 の「表の解釈」節**(各 Part の 4.3)、**IEC 61508-3 の 7.9 と表 A.9・A.10 の本文**: いずれも有償で、プレビューは目次だけだった
- **NASA Systems Engineering Handbook(SP-2016-6105)**: nasa.gov の PDF は WebFetch で読めず、curl はプロキシに 403 で拒否された。VCRM の定義は INCOSE の発表と Aerospace Corp. の MAB で代えた
- **NASA-STD-8739.8B の作業動詞(confirm / assess / analyze / perform)の定義**: SWEHB の頁は動詞を使うが定義していなかった。「confirm(あることを確かめる)」と「assess(質を評価する)」の区別は、検査の強さの語彙として使えそうだが、原典の定義を確かめていない
- **AICPA の SOC 2 指針の原文**: 取得できず、CSA の記事と二次資料で代えた
- **CIS の Manual / Automated の公式定義**: CIS の FAQ はログインが要り、Google Cloud の文書の引用で代えた
- **検査の強さを順序つきの尺度として定める規格**: 方法の分類(IADT、examine/interview/test)と深さの3段(SP 800-53A)はあるが、「存在の確認 < 違反の検出 < 結果の達成」を一つの尺度として定めた規格は見つからなかった。最も近いのは RMF の3段の目的(F12)である
- **指示ファイル(CLAUDE.md・スキル・フック設定)へ変異を掛け、検査が落ちるかを測った報告**: 見つからなかった
- **規範の正本(規格の条項)から指示ファイルへの網羅を検査する道具**: 見つからなかった(F23)
- **自動化されていない統制(脆弱性ではなく、統制の実装そのもの)を降ろす順序を定めた規格**: POA&M の優先づけは主に脆弱性と弱点の重大度による。「どの統制から自動化するか」を定めた規範は見つからなかった

---

## 6. 示唆の要約

### (a) 検査の強さの棚卸しと分類

1. 外部の規格は、検査の**方法**と**深さ**を別の属性で持つ(F1・F13)。本標準の `check`(machine / presence / manual)は方法に当たる。見出しの有無だけを確かめる検査は、方法としては Inspection(examine)、深さとしては Review / Basic に当たる。浅さは方法の値では表せないため、深さを別に開示するかを議論にかける価値がある
2. 「統制がある」と「統制が効いている」は、監査実務で別の保証として扱われる(F11・F12・F14)。OSCAL は主張(SSP の implementation-status)と評価の結果(finding の satisfied と、評価で判明した implementation-status)を別の層に置く。本標準には、検査が違反を検出できたかの**結果の欄**が無い
3. `check=machine` を名乗る条件は、合否の基準の記載(F3)と、陽性・陰性の対の試験(F15・F16)で操作的に定められる。「規則を消すと検査が落ちるか」は変異試験そのもので(F25〜F27)、差分に絞れば実用になる(F26)。本標準の陽性対照はこの型の一部である
4. 規定から降ろし先への網羅だけでなく、降ろし先から規定への逆方向の網羅もある(F7)。どの規定にも辿れない強制は、DO-178C の語でいう余分なコードに当たる

### (b) 未達の規定を降ろす順序、または降ろさないと決めること

1. 順序はリスクで決めるのが外部の通例である(F29・F30)。ただし対象は主に脆弱性で、「どの統制から自動化するか」の規範は見つからなかった。順序の基準を本標準で決めるなら、実証の無い判断として根拠水準マークの対象になる
2. 未達を許さない規定を名指しで固定する先例がある(F31 の CMMC)。許す規定にも期限と失効を付け(F31)、期日の未定に上限を置く(F29)
3. 「降ろさない」と決めることは、外部では理由と承認を要する別の経路である(F6・F8・F10・F29・F30)。決めた後も閉じずに残し、定期的に見直す(F30)。本標準の `undelivered` は「降ろす予定」と「降ろさないと決めた」を区別しておらず、ここに先例との差がある。`state` の値を増やさない現行規約と衝突するため、欄の追加か規約の改廃かを突合で決める必要がある

### (c) スキルの文の検査の範囲

1. 文の存在・構造の検査は、指示が効くかを示さない。構造の得点と効き目の判定は相関が弱く(F22)、エージェントがルールファイルを読む率も低い(F24)。スキルの文の検査は **presence(Inspection / Review)として表示し、遵守の主張に使わない**範囲に限るのが、外部の知見と整合する
2. 遵守を確かめるには、試行を重ねる挙動の評価(F20・F21・F22)が要り、CI で毎回回す決定的な検査とは別の層になる
3. 外部の指示ファイルの lint は参照先の実在と矛盾までで、規格の条項からの網羅を検査する道具は無い(F23)。本標準の文の検査には先例が無く、効き目の根拠も無いため、根拠水準マークで開示するのが妥当である
