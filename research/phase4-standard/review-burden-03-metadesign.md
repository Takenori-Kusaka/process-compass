# 陳腐化しない基準(criteria)の設計手法 — 一次調査メモ

調査日: 2026-08-07
調査目的: フェーズ4「タスクの分割基準」改稿にあたり、「固定の閾値を書くと数年でレガシー化する」問題への対処法を、標準・規格・実務フレームワークの一次情報から整理する。

---

## 1. 標準・規格における「閾値を組織が自ら定める」設計の実例

### 1.1 ISO/IEC/IEEE 12207・15288 の tailoring(仕立て)

- ISO/IEC/IEEE 12207(ソフトウェアライフサイクルプロセス)は、要求を示す助動詞を厳密に使い分けている。"shall"(必須要求)、"will"(宣言)、"should"(推奨)、"may"(許容行為)の4種で、規範性の強さを文言レベルで書き分ける設計になっている。
  - 出典: [ISO/IEC/IEEE 12207:2008 全文PDF](https://wildart.github.io/MISG5020/standards/IEEE-12207-2008.pdf)
- 12207 には Tailoring(仕立て)に関する附属書があり、そこは informative(参考、非規範)として位置づけられている。仕立て判断の際に考慮すべき要因は列挙されるが、「どの条項を残す・削る・変更すべきか」についての規範的なルールは規定されていない — つまり閾値そのものを標準側では決め切らず、組織・プロジェクトの判断に委ねる設計。
  - 出典: [ISO/IEC 12207 全文PDF](https://globalgbc.org/wp-content/uploads/2022/08/ISO-IEC12207.pdf)、[arc42 Quality Model による12207解説](https://quality.arc42.org/standards/iso12207)
- ISO/IEC/IEEE 15288(システムライフサイクルプロセス)2023年版では、Tailoring Process が附属書Aとして「normative(規範)」に格上げされている点が12207と異なる。つまり「仕立てという行為自体を行うこと」は必須(shall)だが、仕立ての結果(具体的な閾値・省略する条項)は組織が決める、という二層構造になっている。
  - 出典: [ISO/IEC/IEEE 15288-2023 Annex A(normative）参照ページ](https://coe.qualiware.com/wp-content/uploads/2016/11/42020annexes.pdf)、[IEEE Standards Association 15288-2023](https://standards.ieee.org/ieee/15288/10424/)
- **考察**: 12207/15288 の設計思想は「規範化するのは"閾値を決める手続きの実施義務"であり、"閾値の数値そのもの"は規範化しない」という分離。これは本プロジェクトの ADR 運用(「決定を記録する義務」は固定だが「決定の中身」は新ADRで置換可能)と構造的に相似形であり、フェーズ4の基準設計にそのまま応用できる考え方。

### 1.2 ISO 26262(ASIL)/ IEC 61508(SIL) — 要求強度を可変にする設計

- IEC 61508 の SIL(Safety Integrity Level)は SIL1〜4 の4段階で、定量的な故障率目標値と結び付いた業種横断の分類。
- ISO 26262 の ASIL(Automotive Safety Integrity Level)は、severity(重大度)・exposure(発生頻度)・controllability(運転者による制御可能性)の3変数から算出される自動車業界固有の分類で、SILとは1:1に変換できない。ISO 26262 自体は「信頼性標準ではない」— 故障確率の精密な数値目標を設定せず、目標(ゴール)ベースの標準になっている。
  - 出典: [Ketryx: ISO 26262 と IEC 61508-3 の比較](https://www.ketryx.com/blog/navigating-iso-26262-and-iec-61508-3-functional-safety-standards)、[Wikipedia: Automotive Safety Integrity Level](https://en.wikipedia.org/wiki/Automotive_Safety_Integrity_Level)
- ASIL のレベルに応じて、要求される開発プロセスの厳格さ(独立検証の要否、テスト網羅度、文書化レベルなど)が段階的に変わる。高い ASIL(D)を要素分解し、複数の低い ASIL(B(D)など)に分割して要求の厳しさを下げる「ASIL分解」という手法も実務に存在する。
  - 出典: [itemis: What is ASIL?](https://www.itemis.com/en/glossary/asil/)
- **考察**: ASIL/SIL の本質は「基準値そのもの」ではなく「リスクの大きさに応じて要求強度(レビュー厳格さ・証跡量)を段階的に切り替える関数」を規格として定義している点。固定の閾値(例:「PRは300行まで」)を書く代わりに、「リスクレベル×要求強度のマトリクス」を書けば、リスクレベルの評価基準は普遍的なまま、対応する具体的な数値だけを時代・組織に応じて後から差し替えられる。

### 1.3 CMMI の「組織のプロセス性能ベースライン」

- CMMI の Organizational Process Performance(OPP、成熟度レベル4相当)は、「組織の標準プロセス群の性能について定量的な理解を確立・維持し、プロジェクトを定量的に管理するためのプロセス性能データ・ベースライン・モデルを提供する」ことを目的とする。
  - 出典: [wibas: Organizational Process Performance (OPP)](https://www.wibas.com/cmmi/organizational-process-performance-opp-cmmi-dev)
- Process Performance Baseline(PPB)は「そのプロセスに従った場合の過去の実績結果」を文書化したものであり、実際のプロセス性能を「期待される性能」と比較するベンチマークとして使われる。イベントレベルの計測データからベースラインを構築し、そのベースラインからプロセス性能モデルを構築する、という積み上げ構造。
  - 出典: [SEI: Exactly What are Process Performance Baselines and Models](https://resources.sei.cmu.edu/asset_files/Presentation/2007_017_001_23934.pdf)、[flylib: Process Performance Baseline 解説](https://flylib.com/books/en/1.570.1.121/1/)
- **考察**: CMMIは「規格が閾値を与える」のではなく「組織が自分自身の実測データから閾値(ベースライン)を導出し、かつ定期的に再計測して更新する」ことをプロセスの一部として制度化している。これは「一度書いた数値が陳腐化する」問題そのものへの標準側の回答であり、フェーズ4に転用しやすい。

### 1.4 ISO/IEC 25010 — 品質特性とターゲット値の分離

- ISO/IEC 25010 は8つの品質特性(副特性を含む)を定義する品質モデルであり、副特性を測定可能なメトリクスに対応づける役割を担うが、副特性とメトリクスの網羅的・体系的な対応表までは提供していない。
  - 出典: [emergentmind: ISO/IEC 25010 Quality Model](https://www.emergentmind.com/topics/iso-iec-25010-quality-model)
- 品質評価のワークフローは「品質属性要求の特定 → 各品質属性要求のメトリクス定義 → 各品質属性要求の受け入れ基準(acceptance criteria)定義」という別工程に分かれており、目標値(受け入れ基準)はメトリクス定義そのものとは別に、組織・プロジェクトが個別に設定するものとして扱われている。ISO/IEC 25023 が示す測定例も「抽象的すぎて実装にそのまま使えない」ことが指摘されている。
  - 出典: [IOP: Building a Catalogue of ISO/IEC 25010 Quality Measures](https://iopscience.iop.org/article/10.1088/1742-6596/1828/1/012077/pdf)
- **考察**: 「何を測るか(特性・メトリクス)」は普遍的に規格化できるが、「いくつなら合格か(ターゲット値)」は規格化せず組織に委ねる、という分離パターンが25010でも踏襲されている。1.1〜1.4の4例に共通するのは、規格側が担うのは「評価軸・段階・手続き」であり、「具体的な数値」は組織側の責務として明確に切り出している点。

---

## 2. 自組織の実測から閾値を較正する手法

### 2.1 統計的工程管理(SPC)— 管理限界と規格限界の違い

- 管理限界(control limits)は工程自身の過去データから統計的に導出される監視用の限界であり、典型的には工程平均から標準偏差の3倍(3σ)の位置に設定される。恣意的な数値ではなく、その工程固有の実績を反映する。
- 規格限界(specification limits)は、設計者・業界ガイドライン・顧客仕様など外部から与えられる固定要求である。
- 両者に直接の関係はない。工程が統計的に安定していても仕様を満たさない場合があり、逆に仕様を満たしていても工程が不安定(将来的に外れる恐れがある)場合もある。
  - 出典: [Advantive: SPC 101 Control Limits](https://www.advantive.com/solutions/spc-software/spc-101/control-limits/)、[SPC for Excel: Control Limits and Specifications](https://www.spcforexcel.com/knowledge/variation/four-process-states/)
- **考察**: 「規格限界(=固定の閾値。例:レビュー時間◯分以内)」と「管理限界(=自組織の実測から動的に算出される監視ライン)」を明確に区別して書く、という発想が使える。フェーズ4の基準を「外部から借りてきた固定値」ではなく「自チームの実測分布から算出し直せる計算式」として提示すれば、数値自体は古くなっても計算式は古くならない。

### 2.2 パーセンタイル方式の閾値設定(DORA の方針転換)

- DORA(Google Cloud DevOps Research and Assessment)は、2025年にElite/High/Medium/Lowという階層区分(ティア)を廃止し、パーセンタイル分布と7つのチームアーキタイプによる表現に切り替えた。これは「過去の実績の記録」として読むべきものであり、目指すべき固定目標として読むべきではない、という位置づけの明確化。
  - 出典: [ClimsTech: DORA's four keys: a guardrail for the AI era, not a leaderboard](https://climstech.com/blog/dora-metrics)
- 2026年のDORA調査では、AIがスループットを押し上げる一方で安定性を測定可能なレベルで悪化させることが示されており、「4キーメトリクスの本当の役割は、AIによる変更速度の加速に安定性が追いつかなくなることを防ぐガードレールである」という位置づけに変化している。
  - 出典: [同上](https://climstech.com/blog/dora-metrics)
- SPACE フレームワーク(Forsgren他)についても、示された指標例は「例示(illustrative examples)」であって「規範的な標準(prescriptive standards)」ではなく、組織は画一的な指標運用を避けるべきとされている。
  - 出典: [GetDX: What is the SPACE framework](https://getdx.com/blog/space-metrics/)
- **考察**: 業界ベンチマーク(DORA/SPACE/DevEx)に共通する近年の姿勢は「ベンチマーク数値は過去の分布の記録であり、規範的な目標値ではない」という明確な線引き。フェーズ4で外部ベンチマークを引用する場合も「◯◯社の調査によれば分布はこうだった(年・出典明記)」という形にとどめ、「だからこの数値を守れ」という規範化はしない書き方が陳腐化耐性を高める。

---

## 3. 能力成熟度・段階的導入で基準を可変にする設計

- CMMI型の成熟度モデルは「各レベルが次のレベルの土台になる」という積み上げ構造を持ち、段階を飛ばすことはできない(ある回の成功ではなく、日常的な挙動の一貫性で成熟度が定義される)という設計原則がある。
  - 出典: [UX Tigers: The Capability Maturity Model for AI in Design](https://www.uxtigers.com/post/ai-maturity)
- 一方で成熟度モデルという概念自体への批判は多く、「モデルとしての欠陥」と「モデル設計プロセスの欠陥」の両面が指摘されている。多くの成熟度モデルは実務主導で作られており、理論的な裏付けを欠くため「理論駆動というよりコンサルティングの論理を反映している」という批判がある。
  - 出典: [AISeL ECIS 2011: What makes a useful maturity model?](https://aisel.aisnet.org/ecis2011/28/)
- **考察**: 成熟度モデル型の基準設計(段階1→2→3で要求を強める)は「固定閾値問題」への部分的な解にはなるが、モデル自体の恣意性・段階飛ばし不可という硬直性という別の副作用を持つ。フェーズ4で採用するなら「段階の数値」より「段階を上げる/下げる判断基準(=enablerの有無)」を明文化し、段階そのものを固定教義にしないことが重要(4章のenabler型ゲートと組み合わせるのが妥当)。

---

## 4. 「条件付き基準」の書き方

### 4.1 decision table(決定表)

- decision table は「与えられた条件に応じてどのアクションを取るか」を可視化する手法。条件記述部(condition stub)・アクション記述部(action stub)・条件エントリ(condition entries)から構成され、各行に条件・アクションを1つずつ配置する。
  - 出典: [GeeksforGeeks: Decision Table](https://www.geeksforgeeks.org/software-engineering-decision-table/)
- 複雑な業務ロジックの条件の組み合わせを網羅的にカバーできる点が要件定義・テスト設計での利点として挙げられている。
  - 出典: [testRigor: Decision Table in Software Testing](https://testrigor.com/blog/decision-table-in-software-testing/)
- **考察**: フェーズ4のゲート条件を「固定閾値」ではなく「前提条件(例:自動テストカバレッジ計測基盤の有無、ペアプロ文化の有無)×リスクレベル」のdecision tableとして表現すれば、前提条件が変わった(=enablerが整った/失われた)時点で表の該当行だけを差し替えられ、表全体の構造(=規範)は保たれる。これはISO 26262のASIL段階設計(1.2)と同型の発想。

### 4.2 Assurance Case(GSN)— 主張・根拠・前提の分離

- GSN(Goal Structuring Notation)は安全論証で最も広く使われるグラフィカルな論証記法。Goal(主張)、Strategy(論証の性質)、Solution(証拠)、Context(文脈)、Assumption(前提)、Justification(論拠の理由)という要素をノードとして明示的に分離し、要素間の関係を構造化する。
  - 出典: [ASEMS: Goal Structuring Notation and Claim Trees](https://www.asems.mod.uk/toolkit/goal-structuring-notation-and-claim-trees)
- 主張(Claim)が初期段階でAssumption(前提)によって支えられている場合、その後のテスト・分析などの保証活動によって、そのAssumptionを実際のEvidence(証拠)に置き換えていくべきとされる。矛盾する証拠が出た場合、GSNはその主張のどこに欠陥があるかを可視化し、是正措置の必要性を示すことができる。
  - 出典: [arXiv: A Methodology for Automating Assurance Case Generation](https://arxiv.org/pdf/2003.05388)
- **考察**: 「この基準(閾値)は、こういう前提(組織のCI環境・人員体制・ドメインのリスク特性)の下でのみ妥当である」という構造をGSN的に(主張=基準の妥当性、根拠=実測データやベンチマーク、前提=環境条件)明示的に切り分けて書けば、前提が崩れたときに「基準そのものが失効している」ことを機械的に検知しやすくなる。フェーズ4の各基準に「この基準が成立する前提」を1〜2行添えるだけでも、暗黙の前提が言語化され、レビュー時に無効化を判断しやすくなる。

---

## 5. 陳腐化検知の仕組み

### 5.1 ADR の supersede 運用と「生きた文書ではない」という原則

- 決定が変わったら「新しいレコードを書いて元のレコードをsupersede(置換)し、両者をリンクする」ことで思考の経緯を保存する。ADRが一度採用されたら、唯一許される変更は「supersedeする新ADRを書くこと」であり、両ファイルを相互リンクする。サイレントな本文編集は経緯を隠すことになるため避けるべきとされる。
  - 出典: [Microsoft Learn: Maintain an architecture decision record (ADR)](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
- ADRは「(ユーザー要求文書のような)長期にわたって存在し続ける生きた文書」ではなく、特定時点のスナップショットを捉えるものであり、決定は妥当な期間内に到達すべきものとされる。
  - 出典: [同上](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record)
- ADRのステータス分類(Proposed / Accepted / Deprecated / Superseded / Rejected)が示され、元のADRのステータスをDeprecated→Supersededに変え、新ADRへのリンクを張り、新ADRから元ADRへも逆リンクする、という双方向リンク運用が推奨される。
  - 出典: [gist: ADR — Documentation Pattern](https://gist.github.com/thedavidyoungblood/bccce859af7a476e44a290a2230e0913)
- **考察**: この運用は本プロジェクトの ADR ルール(`src/content/docs/adr/index.md`: 「一度採用したADRの本文は書き換えない。決定を変えるときは新しいADRで置き換える」)と完全に一致しており、既に採用済みの設計。フェーズ4の基準に「この基準はADR-NNNNで採用」という形でADRへの参照を持たせておけば、基準見直し時に新ADRを起票してsupersedeするだけで、docs本文側は「現在有効な基準」を指し続けられる(本文は都度書き換えが必要になるが、経緯はADR側に残る)。

### 5.2 「この数値が依拠する前提」を明示する運用の実例

- 明確に「基準の有効期限つき記述」や「前提の失効監視」を制度化した一次情報(標準文書・公式ガイド)は、今回の調査範囲では十分に確認できなかった。CMMIのPPB(2.1参照)は定期的な再計測によって暗黙的にこれを実現しているが、「前提が崩れたら基準を見直す」という明文化されたレビュー期日つきの運用実例は、GSNのAssumption→Evidence置換の考え方(4.2)から類推する形にとどまる。(この観点は7章の追加調査で一部埋まっている)

---

## 6. フェーズ4への示唆(考察のまとめ)

1. **基準は「数値」ではなく「数値の導出手続き」として書く**(CMMI PPB、SPC管理限界)。固定の「PRは300行まで」ではなく、「直近N件のPRのレビュー時間分布の第◯パーセンタイルを基準として、四半期ごとに再計算する」という手続きを規定する。
2. **規範(shall)と参考値(informative/should)を文言で明確に分離する**(12207のshall/should/may使い分け、DORAのベンチマーク非規範化)。「◯◯すべき」と書く箇所と「参考として、外部調査ではこうだった(年・出典明記)」と書く箇所を混在させない。
3. **リスクレベル×要求強度のマトリクス(decision table)で条件付き基準を書く**(ASIL/SIL、decision table)。「タスクの複雑度や影響範囲に応じて要求されるレビュー厳格さが変わる」構造にすれば、マトリクスの軸(リスクレベルの定義)は普遍的なまま、セルの中身(具体的な閾値)だけを更新できる。
4. **各基準に「成立する前提」を短く明示する**(GSNのAssumption)。前提が崩れたことをレビュー時に判定しやすくする。
5. **基準の変更はADRのsupersede運用に乗せる**。本プロジェクトは既にこの仕組みを持っており、新規に設計する必要はない。フェーズ4の基準本文からADR番号への参照を持たせるだけでよい。

---

## 7. 基準・文書に有効期限や見直しサイクルを持たせる制度の実例(追加調査)

調査日: 2026-08-07(追記)

### 7.1 ISOマネジメントシステム規格の「マネジメントレビュー」と「システマティックレビュー」

- ISO 9001(品質)・ISO 27001(情報セキュリティ)は、いずれも箇条9.3「マネジメントレビュー」で、トップマネジメントが「計画された間隔」でマネジメントシステムをレビューすることを要求している。ただし頻度そのものは規格側が固定値で指定しておらず、組織が自ら間隔を定める(実務上は四半期〜年1回が多い)。
  - 出典: [Advisera: ISO 27001 Clause 9.3 – Management review](https://advisera.com/iso27001/clause-9-3-management-review/)、[9001simplified: ISO 9001 Management Review](https://www.9001simplified.com/learn/iso-9001-management-review.php)
- これとは別に、ISO規格そのもの(規格文書自体)にも見直し制度がある。ISOのルールでは、国際規格(International Standard)は発行から**5年後**にシステマティックレビュー(systematic review)を受けることが義務づけられている(技術仕様書 Technical Specification は3年、技術報告書 Technical Report には期限指定なし)。レビューの結果は各国代表団体の投票により「確認(Confirm、変更なし継続)」「改訂(Amend/Revise)」「廃止(Withdraw)」の3択で決まる。廃止は自動ではなく、8週間の廃止投票(Withdraw Ballot)を経る。
  - 出典: [ISO公式: Guidance on the Systematic Review process in ISO(PDF)](https://www.iso.org/files/live/sites/isoorg/files/store/en/PUB100413.pdf)、[QMS Certification: How does the revision of ISO standards work?](https://qms-certification.com/how-does-the-revision-of-iso-standards-work/)
- **考察**: ISOのシステマティックレビューは「規格という文書自体に固定の再検査周期(5年)を組み込む」制度であり、"個々の基準値"ではなく"基準を書いた文書そのもの"に有効期限的な仕組みを持たせている点が今回のテーマに直結する。「マネジメントレビュー」(運用の点検、間隔は組織が決める)と「システマティックレビュー」(文書の点検、間隔は規格側が決める)という二階建てになっている点も参考になる。

### 7.2 IETF RFC — 文書ステータスの遷移とInternet-Draftの自動失効

- RFC(標準トラック文書)は Proposed Standard → (Draft Standard、現行プロセスでは省略されることが多い) → Internet Standard という成熟度の階段を持ち、Proposed Standardの段階には最低6か月留まることが規定されている。より新しい仕様に置き換えられた、あるいは他の理由で陳腐化したと判断された仕様は "Historic" ステータスに降格される。
  - 出典: [RFC 2026: The Internet Standards Process](https://www.rfc-editor.org/rfc/rfc2026.txt)
- 個々のRFC間には "Obsoletes"(旧文書を廃止して置き換える)、"Updates"(旧文書を廃止しないが一部更新する)という明示的な関係メタデータが付与され、読者は最新の状態をたどれるようになっている。
  - 出典: [RFC 2026](https://www.rfc-editor.org/rfc/rfc2026.html)
- 標準化前段階の草稿である Internet-Draft は最大6か月間のみ有効とされ、6か月間更新がなければ自動的に "Expired" とマークされ、公開の一覧から除外される。つまり「明示的に更新されない文書は、放置するだけで自動的に無効化される」設計。
  - 出典: [RFC 2026](https://www.rfc-editor.org/rfc/rfc2026.html)
- **考察**: RFCの設計思想は「文書に有効期限のデフォルト値(6か月)を持たせ、明示的な更新がなければ自動的に失効させる」という"opt-in for continuation"型。これはADRのsupersede運用(明示的に新ADRを書かない限り有効なまま)とは逆方向の設計であり、「基準本文側」に採用するなら「この基準はYYYY-MM-DDまで有効。更新されなければ執筆者に見直しを促す」という期限つき記述との相性がよい。

### 7.3 ソフトウェア実務での類例

- **feature flag(フィーチャーフラグ)の有効期限**: 一時的なフラグは作成時に「実際のカレンダー日付」としての失効日を設定すべきとされ、100%ロールアウト後30日以内に削除する、といった具体的な運用が推奨される。フラグ管理システムには失効日を設定し、期限が来たらSlack通知やビルド失敗、あるいは削除PRの自動作成といったワークフローに繋げる実装例がある。四半期ごとの棚卸し(quarterly flag audits)を推奨する例もある。
  - 出典: [ConfigCat: Feature Flag Retirement](https://configcat.com/blog/2024/01/30/feature-flag-retirement/)、[LaunchDarkly: Reducing technical debt from feature flags](https://launchdarkly.com/docs/guides/flags/technical-debt)
- **SLO(Service Level Objective)のレビュー周期**: Google SREのプラクティスでは、運用開始初期は毎月レビューし、SLOの妥当性が確立してくるにつれて四半期以下の頻度に落とすという段階的な減衰が推奨される。四半期レビューでは「目標は達成可能か」「継続的な未達なら目標が厳しすぎるか、信頼性投資が不足しているか」を判定する。エラーバジェットポリシーには「4週間でエラーバジェットを使い切ったらリリースを止める」「単一障害でバジェットの20%以上を消費したらポストモーテム必須」といった、閾値超過時に取るアクションまでセットで明文化されている。
  - 出典: [Google SRE Workbook: Implementing SLOs](https://sre.google/workbook/implementing-slos/)、[Google SRE Workbook: Error Budget Policy](https://sre.google/workbook/error-budget-policy/)
- **ドキュメントの鮮度(freshness)管理**: Giant Swarmは公開ドキュメントのfrontmatterに `last_review_date` を持たせ、`REVIEW_TOO_LONG_AGO` という設定可能な閾値期間を超えたページを自動検知してレビューを促す仕組みをOSSのfrontmatter-validatorとして運用している。ページごとに `ttl_days`(例: クイックスタートは90日、アーキテクチャ概要は365日)のように、文書の性質に応じて有効期間を変える設計も紹介されている。
  - 出典: [dosu.dev: How Fresh Are Your Docs? Score Documentation Freshness in CI](https://dosu.dev/blog/score-documentation-freshness-in-ci)

### 7.4 「前提の失効」を自動検知する実装例

- 依存パッケージのEOL(End-of-Life)監視には endoflife.date というコミュニティ運営のデータベース(480以上の製品、8000以上のバージョンのEOL日・CVEリスクスコアを収録)があり、RenovateなどのCI連携ツールやCLIツール(eol-check等)から参照して、依存関係が期限切れになる前にアラートを出す運用が実務で普及している。
  - 出典: [endoflife.date × Renovate CLI 連携ページ](https://endoflife.date/renovate)、[Aikido: Best Tools for End-of-Life Detection: 2025 Rankings](https://www.aikido.dev/blog/best-end-of-life-detection-tools)
- **考察**: 依存関係のEOL監視は「前提(このライブラリはサポートされている)が崩れる日付があらかじめ分かっている」ケースへの自動検知であり、GSNのAssumption失効パターン(本メモ4.2)を実装レベルで体現した例といえる。フェーズ4の基準がもし「特定のツール・慣行の存在」を前提にしている場合、その前提の性質によっては同様の外部データソース(ツールの公式サポート終了予定など)を根拠に「見直しトリガー」を設定できる。

### 7.5 ADRのsupersede運用と二重にならない、本文側での提案

本プロジェクトは既にADRのsupersede運用(決定の変更は新ADRで置換、本文は書き換えない)を持っている。そのため7章の知見は「ADRの仕組みをどう変えるか」ではなく、「フェーズ4の**本文(docs側)に書く基準の記述形式**」への適用として位置づける。

- **本文の各基準に「見直しトリガー」を1行添える**(RFCのExpires、Giant Swarmの `last_review_date` /`ttl_days` に相当)。例: 「この基準は 20XX-XX を目安に見直す(契機: 主要CI/レビューツールの世代交代、外部ベンチマークの改訂等)」という短い注記を基準の直後に置く。数値そのものではなく「いつ・何をきっかけに古くなるか」を明示することが目的であり、厳密な失効日管理システムを新設する必要はない。
- **見直しトリガーが発火したら、既存のADR運用に橋渡しする**。「本文の基準に疑義が生じた」→「ADRを新規起票して決定し直す」→「本文を新ADRの内容に合わせて更新し、ADR番号の参照も更新する」という一本の流れにする。7.1のISOの二階建て(運用のレビューと文書自体のレビューを分ける)に倣い、「基準の運用上の妥当性を都度確認する」層(=気づいたら随時issueを立てる、といった軽量な運用)と、「基準を書いた文書自体を定期的に棚卸しする」層(=年1回など固定周期でフェーズ4全体を通読し、見直しトリガーが来ている基準を洗い出す)を分けて設計するのが実務的と考えられる。
- **数値ではなく前提・トリガーの明示に留める**ことで、フェーズ4の本文自体が「いつか誰かが読んで気づく」受動的な陳腐化検知ではなく、「見直し時期が来たことが読み手に分かる」能動的な仕組みに近づく。ただし、RFCのInternet-Draftのように「更新がなければ自動的に無効化する」仕組みまでは、静的なdocs-as-codeサイトの性質上、追加のCIツール(7.3のfrontmatter-validator相当)なしには実現しにくく、その導入要否は別途の判断が必要。

---

## 埋められなかった観点(追加調査が必要な穴)

- ISO/IEC/IEEE 12207・15288 の一次規格文書そのもの(有償の正式版)には未アクセスであり、shall/should/mayの厳密な使い分け箇所や tailoring 附属書の正確な条文番号は二次情報(PDF転載・要約サイト)経由の確認にとどまる。正確な引用が必要な場合は正規購入版での確認を推奨する。
- CMMI v3.0(最新版)における Process Performance Baseline の具体的な算出手順(統計的にどう再較正するか)の一次情報(CMMI Institute公式ガイド本体)には未アクセス。二次情報(wibas、flylib、SEI旧資料)からの再構成にとどまる。
- IEC 61508における具体的な数値目標(SIL別の故障率確率など)と、その数値が業界内でどう定期的に再較正されているかの一次情報(IEC本体規格文書)は未確認。
- DORA・SPACE・DevExの2026年最新版レポート本体(Google Cloud公式)へは未アクセスで、二次記事(ブログ等)経由の情報。正確な出典として使う場合は一次レポートの確認を推奨する。
- 日本企業における「建前としての基準」と「実運用の乖離」の実態に関する一次情報は、今回のテーマ(標準・規格の設計手法)の性質上、直接該当する情報が見つからなかった。この観点は別テーマ(フェーズ1系)の調査で扱うのが適切と考えられる。
- ISO 27001の「文書化情報のレビューと更新」に関する個別の箇条(附属書A・箇条7.5)の一次条文までは未確認で、9.3マネジメントレビューの範囲での確認にとどまる。より厳密な引用が必要な場合は規格本体の確認を推奨する。
- 「セキュリティ例外(exception)の期限管理」の一次情報(具体的な社内規程のテンプレート等)は今回発見できなかった。一般的にはISO 27001の是正処置・リスク受容プロセスの一部として運用される例が多いと推測されるが未確認。
