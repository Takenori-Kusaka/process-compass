# 288 追加調査03: AI を使う開発組織の継続性

- Issue: #288(採用判断シートの組織継続命題 Q10〜Q18 への回答)
- 調査日・取得日: 2026-10-03(出典はすべて同日に取得。発表日は出典一覧に記載)
- 位置づけ: コアポリシー「取り込みの前に議論する」の**調査**段階。標準の条項は変えていない。要求事項の案は会議体へ渡す材料であり、採否は未決
- 読み方: 冒頭の結論 → 第7節の要求事項案一覧 → 必要な項目だけ第1〜6節。各節は (a) 出典ごとの要点と原文抜粋 (b) シートの問いと即時不採用条件への含意 (c) 要求事項の案、の順
- 根拠水準: ADR-0026 の語彙(E0〜E3)。規格・法令・当局文書が「定めていること」は E1(規範)と書く。既存の外部調査の知見は `[FND-NNNN]` で引く(`research/282-survey-2026-09/findings.yaml`)
- 一次で読めた範囲と二次情報を出典ごとに区別した。読めていないものは「未読」と書き、「無い」とは判定していない

## 結論

1. 依存・退出・縮退は、規格と規制が具体的な要求を持つ領域です。DORA は依存先の台帳、代替の難しさ(集中)の評価、試験済みの退出計画を法的義務にしています。NIST AI 600-1 は第三者 AI への過度の依存の文書化と、手作業を含む代替手段の試験を求めます。**本標準は依存先を1つの台帳で持たず、縮退時に処理できる量も見積もっていない**。この2点は最小の追加で埋められます(案 R-1・R-2)
2. ISO 22301 は事業継続を「**あらかじめ定めた能力で**」提供し続ける力と定義しています。3.12.5 の「人へ戻す」は経路を定めていますが、能力は定めていません。Q13 の △ の正体はこの欠落です
3. 退出は「別製品へ切り替えられます」と書くだけでは証拠になりません。DORA は退出計画の試験を求めています。本標準では、3.12.3 の回帰評価と評価用の基準集合が、そのまま退出の予行の記録になります。新しい機構は要りません(案 R-3)
4. 技能の空洞化には、40年の理論と規範の蓄積があります(Bainbridge 1983、FAA SAFO 13002)。そこへ AI 固有の実証(内視鏡の観察研究、コーディングの無作為化実験)が加わりました。ただし実証は E2 の単発です。それでも「判断を担う席が、AI なしで判断できる力を維持する計画」は、本標準の構成そのものが生むリスクへの歯止めです。最低限を本標準が持つべきです(案 R-4。Q16 の × を解消)
5. 金融庁は「納品されたコードを見てその品質を判断・管理する」体制(コントローラビリティ)を、依存の統制の前提に置いています。さらに、社内にノウハウが無ければ委託先の監視は形骸化すると明言しています。AI への依存にもそのまま当てはまる構造です
6. AI 投資の効果は、自己申告では測れないことが実証されています(METR: 19% 遅くなったのに 20% 速くなったと信じた)。費用には検証の負担(DORA の言う verification tax)を含める必要があります。全社の投資判断は範囲外とし、案件と開発ラインの単位で費用欄と停止基準を持つ案を推します(案 R-5)
7. 止める権限についての国内の最重要の教訓は、ダイハツ第三者委員会の報告です。日程延長の問題提起は経営トップの会議体に**届いていました**。しかし2週間の追加で退けられ、現場は「できて当たり前」の圧力で不正へ至りました。異議の経路を置くだけでは足りません。**異議を退けた決定の記録と上位報告**、そして止めたことを罰しない評価構造が必要です(案 R-6)
8. 採らないと決めた案は第7.2節に書きました。複数ベンダーの常時並行運用、全社の AI 投資判断、AI 不使用日の一律の数値、全構成員への一律教育の4つです

## 0. 前提: 現状の判定と既存条項

`council-02-qa.md` の判定(Q10〜Q15・Q17・Q18 は △、Q16 は ×)と、関連する既存条項は次のとおりです。本調査はこの差分だけを埋める要求事項を探しました。

| 問い | 既存の条項(本標準) | 欠けているもの(council-02 の判定) |
|---|---|---|
| Q10・Q11 | G-1 基準1・3、7.7.1〜7.7.3、3.12.7(実行予算) | AI 利用の拡大・停止の基準、総費用の計上 |
| Q12 | 3.12.3(適合性評価)、5.8.2、運用メトリクス「コア理解カバレッジ」 | 重要度と代替性つきの依存先台帳 |
| Q13 | 3.12.4〜3.12.6、D-0 表7「AI が使えないときの扱い」 | 縮退時の処理能力の見積り |
| Q14 | コンテキスト基盤、ADR、仕様、テスト、指示資産 | 指示資産の提供者依存の確認 |
| Q15 | 挙動要約(G-6)、コア理解維持タスク、`incident-response.md` | 保持者1名以下が計測項目にとどまり、要求事項でない |
| Q16 | 3.4・3.4.1(任命時の力量確認と有効期間) | AI に依存しない判断力の維持と後継の計画 |
| Q17 | G-7 の差し戻し、7.9、3.12.10、7.7.3 | 異議を退けた受容の上位報告、止めたことを罰しない評価構造 |
| Q18 | インシデント対応(Sev1 は事業決裁者へ)、3.12.5 | 契約変更・規制変更時の決定者、顧客説明の決定者 |

既存条項の確認: 3.12.5 は「人間が自ら実装する手順へ縮退する経路を確保する」と定めています(`roles-responsibilities.md` 3.12.5)。3.4.1 は確認に有効期間を置き、その理由に「AI生成コードの読解に必要な能力は、モデルの世代交代によって変わります」を挙げています。どちらも**経路と任命時点の確認**であり、能力の量と維持は扱っていません。

---

## 1. 第三者 AI・ベンダーへの依存の統制

### 1(a) 出典ごとの要点

**NIST AI RMF 1.0 Core(GOVERN 6・MAP 4・MANAGE 3)** — E1(規範、任意の枠組み)

- "GOVERN 6.2: Contingency processes are in place to handle failures or incidents in third-party data or AI systems deemed to be high-risk."
- "MANAGE 3.1: AI risks and benefits from third-party resources are regularly monitored, and risk controls are applied and documented."
- "MANAGE 3.2: Pre-trained models which are used for development are monitored as part of AI system regular monitoring and maintenance."
- "MAP 4.2: Internal risk controls for components of the AI system, including third-party AI technologies, are identified and documented."
- 要点: 第三者の AI 技術を構成要素として洗い出すこと、監視すること、障害時の代替手順を持つことを求めている。ただし「高リスクと判断したもの」に限る(GV 6.2)

**NIST AI 600-1(生成 AI プロファイル、2024-07 最終版)** — E1(規範)

- "GV-6.1-007 Inventory all third-party entities with access to organizational content and establish approved GAI technology and service provider lists."
- "GV-6.2-001 Document GAI risks associated with system value chain to identify over-reliance on third-party data and to identify fallbacks."
- "GV-6.2-006 Establish policies and procedures to test and manage risks related to rollover and fallback technologies for GAI systems, acknowledging that rollover and fallback may include manual processing."
- "GV-6.2-007 Review vendor contracts and avoid arbitrary or capricious termination of critical GAI technologies or vendor services ... Consider: Clear assignment of liability and responsibility for incidents, GAI system changes over time (e.g., fine-tuning, drift, decay); Request: Notification and disclosure for serious incidents ..."
- 要点: 「過度の依存(over-reliance)」の文書化、承認済み提供者の一覧、**手作業を含む代替手段の試験**、モデルの経時変化(drift、decay)の契約上の扱い。本標準の 3.12.3(承認済みモデル)と 3.12.4(品質監視)は GV-6.1-007・MG-3.2 に対応している。GV-6.2-001(依存と代替の文書化)と GV-6.2-006(代替手段の試験)に当たる条項は無い

**ISO/IEC 42001:2023** — E1(規範)。読めたのは iTeh 公開プレビュー(序文〜3章)と、NIST の対応表(FDIS 版との対応)

- 序文: "processes for the management of suppliers, partners and third parties that provide or develop AI systems for the organization."
- NIST の対応表は GOVERN 6.1・6.2 と MANAGE 3.1 を、附属書B の "B.10.2 Allocating responsibilities"・"B.10.3 Suppliers" に対応づけている(附属書A の A.10 は同じ番号構成の管理策)
- 限界: A.10 の管理策本文は未読。対応表で、GV 6.2(障害時の代替手順)の対応先が責任の割り当てと供給者の節であることは確認できた。42001 が退出や縮退を独立した管理策として持つかは判定していない

**EU DORA(規則 (EU) 2022/2554)第28〜30条** — E1(規範。金融機関には法的義務)

- 台帳(28条3項): "financial entities shall maintain and update ... a register of information in relation to all contractual arrangements on the use of ICT services provided by ICT third-party service providers."
- 契約前の評価(28条4項(c)): "identify and assess all relevant risks ... including the possibility that such contractual arrangement may contribute to reinforcing ICT concentration risk"
- 集中リスク(29条1項): "(a) contracting an ICT third-party service provider that is not easily substitutable; or (b) having in place multiple contractual arrangements ... with the same ICT third-party service provider or with closely connected ICT third-party service providers." さらに "Financial entities shall weigh the benefits and costs of alternative solutions"
- 責任の所在(28条1項(a)): 委託しても金融機関が "at all times, remain fully responsible"
- 比例原則(28条1項(b)): 依存の "nature, scale, complexity and importance" に応じる
- 要点: 台帳を持つこと、**代替の難しさ**と**同じ提供者への重なり**を評価すること。ただし上限や禁止は課さず、代替案の費用と便益を比べよと定める

**金融庁「オペレーショナル・レジリエンス確保に向けた基本的な考え方」(2023-04-27)** — E1(当局の考え方。監督指針へ反映済みと二次情報)

- 集中リスクへの対応(p.20): 「①個別金融機関によるサードパーティへのモニタリング強化、②代替手段・出口戦略の確保、③内製化、④業界横断的な取組の強化に分類することができる。」
- 監視の形骸化(p.21): 「外部委託先の業務を把握し、問題を検知し、対応できる人的資源を抱え続けるだけのインセンティブが欠如しやすい ... そもそも社内の人材にノウハウが無いため、モニタリングが形骸化していくおそれがある。」
- 重要度に応じた差(p.20): 「こうした先全てについて、一律の基準を要求することは実務上困難であり、重要度やリスク評価の区分に応じたメリハリのあるモニタリングで対応せざるを得ない」
- 要点: 依存の統制は**監視する側の能力**に依存する。この論点は第4節の人材の空洞化と同じ問題である

**金融庁「AIディスカッションペーパー(第1.0版)」概要(2025-03)** — E1(当局の論点整理。第1.1版は 2026-03-03 に公表されたが未読)

- 「システミック・リスクを増大させる可能性があるAI関連の脆弱性としてサードパーティ依存および特定のサービスプロバイダーの集中を指摘(FSB報告書)」
- 取組事例: 「特定ベンダーへの過度な依存を回避するため、オープンソース基盤を活用してモデル開発を実施」

**既存の外部調査(#282)**

- モデルの退役・差し替え・設定を変えないままの挙動変化が、2026-05〜09 に複数社で起きた。供給者・利用者の双方に、変更管理として扱う実務がある [FND-0022](E1)[FND-0023](E2)
- 指定したモデルが実際に動くとは限らない [FND-0059](E2)
- 定額のみで稼働を保証する規約は無く、上限は数か月単位で変動する [FND-0054](E1)

### 1(b) シートへの含意

- **Q12**: 規格・規制の共通項は「依存先の一覧」「重要度(どの機能が止まるか)」「代替性(容易に替えられるか)」「集中(同じ提供者への重なり)」の4つ。本標準の材料は 3.12.3(承認済みモデル)、表7(席ごとの担い手)、コア理解カバレッジ(個人)に分散している。1つの台帳に束ねる要求が無いため、シートの「隠れた単一障害点」に答えられない
- 依存先は**モデルだけではない**。NIST GV-6.1-007 は「組織の内容にアクセスする第三者」全般を対象にする。本標準の文脈では、エージェント実行基盤、接続経路、評価用の基準集合、指示資産、コア理解の保持者(個人)も単一障害点になりうる

### 1(c) 要求事項の案 → R-1(第7節)

---

## 2. AI 停止時の継続と縮退

### 2(a) 出典ごとの要点

**ISO 22301:2019** — E1(規範)。読めたのは iTeh 公開プレビュー(序文〜3.20)

- 3.3 business continuity: "capability of an organization to continue the delivery of products and services within acceptable time frames at predefined capacity during a disruption"
- 3.5 business impact analysis: "process of analysing the impact over time of a disruption on the organization" / "Note 1 to entry: The outcome is a statement and justification of business continuity requirements."
- 目次で 8.4.2 "Response structure"、8.5 "Exercise programme" を確認した。本文は未読
- 要点: 継続とは「止まらないこと」ではない。**許容できる時間内に、あらかじめ定めた能力で**提供し続けることである

**ISO 22300:2021 の用語(RTO・MBCO)** — 二次情報(コンサルタントの解説が引く定義。原文は OBP で未読)

- RTO: "period of time following an incident within which a product or service or an activity is resumed, or resources are recovered"(Riskonnect の引用)
- MBCO(最低限の事業継続目標): 中断時に受け入れられる最低限の提供水準(spedan の解説)。MTPD(最大許容停止期間)の内側に RTO を置くのが一般的な構成とされる

**DORA 第11条(ICT 事業継続)** — E1(規範)

- 11条5項: BIA は "the criticality of identified and mapped business functions, support processes, third-party dependencies and information assets, and their interdependencies" を考慮する

**NIST AI 600-1** — E1(規範)

- GV-6.2-006(前掲): 代替手段は "may include manual processing"。試験を求める
- GV-6.2-003: "Rehearse third-party GAI incident response plans at a regular cadence"

**金融庁 オペレジ(2023)** — E1

- 耐性度とは「業務中断が必ず起こることを前提に最低限維持すべき水準」である(概要図表1)
- マルチクラウドについて(p.22): 「クラウドごとに異なる仕様に対してそれぞれ対応できる人員の育成・採用コストがボトルネックとなり、現状では困難との声が多く聞かれている。」

**既存の外部調査(#282)**

- 定額枠の枯渇で作業が止まった一次事例が複数ある(いずれも n=1。止まったのはセッション・タスクの単位で、リリースが止まった外部事例は束に無い)[FND-0055](E2)
- Enterprise は全利用が API 単価の別課金で、統制点は支出上限になる [FND-0210](E1)
- 予算の枯渇による利用停止の報道(Microsoft の一部門)は孫引きで一次未確認 [FND-0210 の note](E0)

### 2(b) シートへの含意

- **Q13**: 「何が止まり」は表7(席ごとの担い手)から導ける。足りないのは「**どこまで縮退運転できるか**」の量である。人へ戻す経路があっても、AI 前提の体制規模で人が処理できる量は、AI ありの数分の一になりうる。その量を見積もっていなければ、ISO 22301 の「あらかじめ定めた能力」も、金融庁の「耐性度」も設定できない
- **即時不採用条件「AI 停止時に重要業務を継続・縮退・復旧する方法がない」**: 3.12.5 で「方法」はある。シートの5要素のうち「証拠」(演習・実績の記録)と「限界」(縮退時の能力)が欠けている
- AI の停止は**体制の変化点に数えない**(3.13.2)。この既存の判断とは矛盾しない。縮退能力の見積りは事前の計画であり、変化点の再判定とは別のものである

### 2(c) 要求事項の案 → R-2(第7節)

---

## 3. 退出と資産の移管(ロックインの回避)

### 3(a) 出典ごとの要点

**DORA 第28条8項・第30条3項(f)** — E1(規範)

- 28条8項: "For ICT services supporting critical or important functions, financial entities shall put in place exit strategies. The exit strategies shall take into account ... a deterioration of the quality of the ICT services provided ..."
- 同: "Exit plans shall be comprehensive, documented and ... shall be sufficiently tested and reviewed periodically."
- 同: "Financial entities shall identify alternative solutions and develop transition plans enabling them to remove the contracted ICT services and the relevant data from the ICT third-party service provider and to securely and integrally transfer them to alternative providers or reincorporate them in-house."
- 28条7項(解約できる状況): "(b) circumstances identified throughout the monitoring of ICT third-party risk that are deemed capable of altering the performance of the functions provided ..., including material changes that affect the arrangement or the situation of the ICT third-party service provider"
- 30条3項(f): 契約に "exit strategies, in particular the establishment of a mandatory adequate transition period" を含める
- 要点: 退出の契機に「**品質の劣化**」が明記されている。生成 AI のモデル差し替えや挙動の変化 [FND-0023] は、まさにこの契機に当たる。また退出計画は**試験すること**が条件である

**NIST AI 600-1** — E1

- GV-6.2-005: "Establish policies and procedures that address GAI data redundancy, including model weights and other system artifacts."

**金融庁 AIDP(2025-03)** — E1

- 「ベンダーに社内データ等を提供してAIモデルの開発を委託する際には、モデルの知的財産権が当社に帰属するように契約を締結」

**既存の外部調査(#282)**

- Anthropic は公開モデルの退役を最低60日前に通知する。OpenAI も最低通知期間を設ける。両社とも通知期間を後継モデルでの試験と移行に充てるよう求めている [FND-0022](E1)
- ベンダー2社が、旧世代モデル向けに書いた指示は新世代モデルを過剰に縛ると述べている [FND-0043](E0〜E1)。**指示資産は同じ提供者の世代間でも移植性が低い**ことを示す材料である

**EU データ法(規則 (EU) 2023/2854)の事業者切替の章** — 未取得(EUR-Lex の取得に失敗)。データ処理サービスの切替義務が生成 AI の API に及ぶかは判定していない

### 3(b) シートへの含意

- **Q14**: 本標準の構成では、仕様・ADR・テスト・評価用の基準集合・指示資産はリポジトリ(自社の管理下)に残る。資産の**所在**は答えられる。答えられないのは、資産が**別の提供者・別の世代で機能するか**である。FND-0043 が示すとおり、指示資産は世代交代だけで書き直しが要る
- 退出の証拠は「切り替えられる」という主張ではない。**試した記録**である(DORA 28条8項)。本標準の 3.12.3(新モデルの回帰評価と差分の記録)と 3.12.6(廃止への追随)は、実施すれば退出の予行の記録になる。ただし現行の 3.12.3 は「同じ提供者の新モデル」を想定した書き方で、別の提供者を試すことを求めていない
- **即時不採用条件「業務知識・評価基準・運用知識を自社へ取り出せない」**: 評価用の基準集合を自社が持つことは 3.12.3 の前提になっている。ただし、基準集合が自社の管理下にあることを明示的に要求してはいない

### 3(c) 要求事項の案 → R-3(第7節)

---

## 4. 人材の空洞化(deskilling)と能力の維持

### 4(a) 出典ごとの要点

**Bainbridge, "Ironies of Automation", Automatica 19(6), 1983** — E1(理論・規範として広く引かれる。測定ではない)

- "Unfortunately, physical skills deteriorate when they are not used ... This means that a formerly experienced operator who has been monitoring an automated process may now be an inexperienced one."
- "There is some concern that the present generation of automated systems, which are monitored by former manual operators, are riding on their skills, which later generations of operators cannot be expected to have."
- 監視役について: "the supervisor too will not be able to take-over if he has not been reviewing his relevant knowledge, or practising a crucial manual skill."
- 対策: "One possibility is to allow the operator to use hands-on control for a short period in each shift. If this suggestion is laughable then simulator practice must be provided."
- "Perhaps the final irony is that it is the most successful automated systems, with rare need for manual intervention, which may need the greatest investment in human operator training."
- 要点: Q16 の「10年後の後継者」はこの "later generations" の問題そのものである。**現世代は手作業時代の技能で監視できている。次の世代はその技能を持たない**

**FAA SAFO 13002 "Manual Flight Operations"(2013-01-04)** — E1(規制当局の勧告。背景に運航データの分析あり)

- Background: "A recent analysis of flight operations data (including normal flight operations, incidents, and accidents) identified an increase in manual handling errors."
- Discussion: "continuous use of autoflight systems could lead to degradation of the pilot's ability to quickly recover the aircraft from an undesired state."
- "Operational policies should be developed or reviewed to ensure there are appropriate opportunities for pilots to exercise manual flying skills, such as in non-RVSM airspace and during low workload conditions."
- 要点: 対策を**通常業務(line operations)と訓練の両方**に組み込めと勧める。手動の機会を作る場面として「負荷の低いとき」を指定している

**Budzyń ら, Lancet Gastroenterology & Hepatology 10(10):896-903, 2025(内視鏡医の技能低下)** — E2(多施設の観察研究、1件)。原論文は未読で、ACG の構造化抄録と ASCO Post の要約から引く

- AI 非使用の大腸内視鏡での腺腫発見率が、AI の日常使用の開始前 28.4%(226/795)から開始後 22.4%(145/648)へ低下した。絶対差 −6.0%(95% CI −10.5〜−1.6、P=0.009)
- 著者自身が「仮説を生む、非確証的な研究」と位置づけている(オスロ大学の記事)
- 要点: **AI が誤りを捕まえるはずの人の技能が、AI の常用で下がりうる**ことを示す医療での最初期の実測。観察研究で交絡の可能性がある

**Anthropic「How AI assistance impacts the formation of coding skills」(2026-01-29)** — E2(無作為化実験1件、主に若手52名、実施者は AI ベンダー)

- "the AI group averaged 50% on the quiz, compared to 67% in the hand-coding group"(Cohen's d=0.738、p=0.01)
- 速度: "Participants in the AI group finished about two minutes faster, although the difference was not statistically significant."
- 学習が保たれた使い方: 理解のための追加質問、生成コードと説明の同時要求、概念の質問だけをして誤りは自力で解く
- 限界(著者): 標本が小さい。直後の理解度テストが長期の技能を予測するかは不明
- 推奨: "Managers should think intentionally about how to deploy AI tools at scale, and consider systems or intentional design choices that ensure engineers continue to learn as they work."

**Lee ら(Microsoft Research / CMU), CHI 2025** — E2(自己申告の調査、知識労働者319名・936事例)

- "higher confidence in GenAI is associated with less critical thinking, while higher self-confidence is associated with more critical thinking."

**既存の外部調査(#282)**

- 人の承認は、経験とセッション長に沿って通りやすくなる(慣れ・自動化バイアス)[FND-0084](E2)[FND-0160](E2)
- AI 支援下では要求の内容検査の精度が下がる。LLM 支援で学ぶと技能習得が遅れうる(学生対象)[FND-0115](E2)

**ダイハツ第三者委員会 調査報告書(要約版)(2023-12-20)** — E2(単一事例の調査報告)。第6節でも使う

- 「管理職が認証試験の実務や現場の状況に精通しておらず、また、報告や相談を行っても認証試験の担当者が抱える問題の解決が期待できない結果、現場の担当者レベルで問題を抱え込まざるを得ない状況が生じた」(p.7)
- 「専門性の高さから属人化により衝突安全試験の領域が外部から目の届きにくいブラックボックス化した職場環境にあった」(p.7)
- 「人員削減により法規認証に精通した人員が不足している状況であり、教育研修体制も不十分であった」(p.8)
- 要点: 監督する側が実務の判断力を失うと、問題を検出できない。報告も上がらなくなる。AI の文脈でいえば、出荷判定者や独立レビュアが AI なしで判断できなくなる状態である

**金融庁 オペレジ(2023)BOX8「内製化」** — E1(当局の考え方)

- 「IT システム開発について自前で判断できる体制(コントローラビリティ)を確保することが重要である。具体的には、そもそも何を作るのか、ソフトウェアの設計をどうするか、どの技術を使うか、どのサービス構成とするか、誰に開発(コーディング)してもらうかを金融機関が主体的に決定し、IT ベンダーから納品されたコードを見てその品質を判断・管理する必要がある。」(p.22〜23)
- 「当該レガシーシステムを扱えるエンジニアの高齢化・定年退職とともに、システム更改ができる人材が社内にもベンダーにもいなくなる、という危機が迫っている。」(p.23)
- 要点: 「IT ベンダー」を「AI」に置き換えると、Q16 の要求がほぼそのまま書かれている

**金融庁 AIDP(2025-03)** — E1

- 「外部ベンダーを活用して開発や運用を進めた場合、ノウハウや知財が組織内に蓄積されにくく、内部人材の育成が進まない懸念」

**ISO 管理システム規格の調和構造(HS)7.2 力量(ISO/TMBG, 2026-07-01 版)** — E1(規範)。ISO の配布 PDF を検索結果の抜粋で確認した(全文は未読)

- "determine the necessary competence of person(s) doing work under its control that affects its XXX performance; ensure that these persons are competent on the basis of appropriate education, training, or experience; where applicable, take actions to acquire the necessary competence, and evaluate the effectiveness of the actions taken."
- ISO/IEC 42001 は HS に基づく規格であり、7.2 はこの共通文に沿うと推定する(42001 の 7.2 本文は未読。プレビューで読めたのは 3.9 の定義 "ability to apply knowledge and skills to achieve intended results" まで)
- 要点: HS の 7.2 は力量を「確保する」ことを求める。**維持の仕組みと後継**までは共通文に無い

**EU AI 法 第4条(AI リテラシー)** — E1(規範)

- artificialintelligenceact.eu は改正後の文言を示し、旧文言に "amended" と表示している: "Providers and deployers of AI systems shall take measures to support the development of AI literacy of their staff ... This obligation does not require providers or deployers to guarantee any specific level of AI literacy of any individual."
- 旧文言: "shall take measures to ensure, to their best extent, a sufficient level of AI literacy of their staff"
- 改正規則は Regulation (EU) 2026/1744(Digital Omnibus on AI、2026-07-08 採択、官報 2026-07-24)と第三者のサイトが引いている。官報の本文は未読
- 要点: 第4条は**利用の理解**の水準であり、AI なしで判断する力を求めるものではない。しかも改正で「支援する措置」へ弱まった。Q16 の根拠には使えない。本標準 3.4.1 の教育の第2区分(業務で AI を利用する者への統制の教育)が対応する範囲である

### 4(b) シートへの含意

- **Q15(生成に関与しない人が理解・変更・復旧できるか)**: 「コア理解カバレッジ」(`metrics.md`)は保持者1名以下を「逸脱の兆候」として計測するだけである。Bainbridge・ダイハツの「属人化・ブラックボックス化」が示すとおり、計測だけでは是正が起きない。逸脱として扱い、是正の期限を持たせる必要がある
- **Q16(AI に依存しない技術判断力)**: 根拠の構造は次のとおり
  - 理論・規範(Bainbridge、FAA)は「使わない技能は落ちる。通常業務と訓練の両方で使う機会を作れ」で一致する(E1)
  - AI 固有の実測は、医療(観察)とコーディング学習(無作為化、若手、短期)で同じ向きを示す。ただしいずれも1件である(E2)
  - 熟練開発者の判断力が AI の常用で落ちるかを、長期に測った研究は今回見つからなかった。この点を本標準は暫定マークで開示する必要がある
- 本標準の構成上の理由: 本標準は、実装の大半を AI が担い、人は判断の席に座る構成を想定している。これは Bainbridge のいう「監視へ移された操作員」の状況そのものである。**このリスクは本標準を採用すること自体から生じる**。生む側が歯止めを持つべきという council-02 の推論は、上の出典で裏づけられる
- 3.4.1 の「有効期間」は、確認を**繰り返す**仕組みとしては既にある。足りないのは確認の**中身**で、AI の支援なしの判断を確かめていない。新しい仕組みを足すより、3.4.1 の確認方法へ1行足す方が既存条項と重ならない
- **即時不採用条件「生成物を理解・変更できる人材を維持する計画がない」**: 3.4.1(任命時の確認と有効期間)と、コア理解維持タスクがある。「計画」として欠けているのは、後継(次に誰がその席に就けるか)と、維持のための非 AI の実務の機会である

### 4(c) 要求事項の案 → R-4(第7節)

---

## 5. AI 投資の効果と総費用の評価

### 5(a) 出典ごとの要点

**DORA「ROI of AI-assisted Software Development」(2026.01)** — E1(枠組みの提案。報告書の本体は登録制で未読。Google Cloud の紹介ページと InfoQ 2026-05-11 の記事から引く。InfoQ は二次情報)

- Google Cloud の紹介: "Navigate the J-Curve: Learn why explicitly budgeting for this 'tuition cost' is a necessary investment in learning before long-term ROI materializes." / "Reinvest capacity, don't reduce headcount"
- InfoQ: 生産性の一時的な落ち込み(J カーブ)の原因は3つある。学習曲線、AI 生成コードのレビューが課す "verification tax"、テストや変更承認など下流の工程の適応である
- InfoQ: 推定は "conservative, realistic, and optimistic" の3通りで行う。"Treat these calculations as a high-uncertainty estimate meant to spark a conversation, rather than a rigid mathematical formula."
- 要点: 費用側に**検証の負担**と**学習期間**を明示的に入れる枠組みである。著者自身が不確実性の高い推定だと断っている

**METR(2025-07-10)** — E2(無作為化実験、熟練 OSS 開発者16名・246課題)

- "When developers are allowed to use AI tools, they take 19% longer to complete issues"
- "even after experiencing the slowdown, they still believed AI had sped them up by 20%."
- 著者の留保: AI が多くの開発者を速くしないことの証拠ではない。2025 年初頭の能力の一場面である
- 2026 年の追試では、課題単位の時間計測から信頼できる信号を得られないと METR 自身が判断した [FND-0157](E2)

**金融庁 AIDP(2025-03)** — E1

- 「効果が見通しづらいため投資対効果の説明が難しく、社内での合意形成に時間がかかる」/「外部事業者が提供する生成AIについては、多くの場合従量課金であるため、使用頻度によっては制限なくコストが増加」
- 対応の方向性: 「収益化の目途が立つまでの間、特性に応じたKPI(定量的指標)を設定して計画対比をモニタリングすることも選択肢」

**既存の外部調査(#282)**

- AI の導入でスループット系の指標は上がり、安定性・品質系は悪化するという観測が独立に3系統ある(観察・相関)[FND-0151](E3、方法節未読のため E2 扱いが未決)
- 作業量の増加は下流ほど縮む(コミット +240% がリリースでは +30%)[FND-0154](E3)
- 増えた出力は、人のレビューの迂回で吸収されている [FND-0156](E3)
- トークン消費量・生成行数・PR 本数を成果指標にすることには、複数の機関が慎重である [FND-0159](E0)[FND-0267](E1)。利用量ランキングの停止の報道がある [FND-0212](E1)
- 国内では、開発組織の 35.9% が AI 生成コード起因の不具合を比較できるデータを持たない [FND-0165](E2)。期待どおりの効果を得た企業の割合は限定的である [FND-0135](E2)
- 損益分岐を直接扱う出典は公開単価からの試算1件のみである [FND-0211](E0)

### 5(b) シートへの含意

- **Q11(総費用を差し引いても価値があるか)**: 本標準の統制(独立検証、挙動要約、コア理解維持、AI 運用担当者)は、それ自体が費用を生む。DORA の verification tax はこの費用の名前である。本標準が費用欄を持たなければ、採用者は統制の費用を見落とすか、成果と取り違える
- **Q10(導入しない場合との比較と停止・拡大基準)**: METR の結果から、比較の基準は**自己申告であってはならない**。FND-0154・0156 から、測る位置は個人の作業量ではなく下流(リリース、安定性、手戻り)である
- 範囲の判断: 全社の AI 投資のポートフォリオは開発プロセス標準の範囲を超える(council-02 案 (c))。ただし**案件・開発ラインの単位**での効果の評価と停止の基準は、G-1(企画承認)と 7.7(費用)の延長として本標準が持てる
- **即時不採用条件「利用停止を決める基準と権限者がいない」**: 「基準」の側はここで答える。費用・品質の下限を割ったときに、AI の利用を縮小・停止する条件である。「権限者」の側は第6節で答える

### 5(c) 要求事項の案 → R-5(第7節)

---

## 6. 速度と品質が衝突したときに止める権限、有事の意思決定

### 6(a) 出典ごとの要点

**トヨタ生産方式(トヨタ公式サイト)** — E1(実務の原則。効果の測定ではない)

- "When an abnormality occurs, such as a machine or equipment abnormality, quality abnormality, or a work delay, the machine or equipment can detect the abnormality and stop automatically, or the operator can stop the line by pulling the stop cord themselves."
- "When equipment stops, the andon (problem display board) lights up to notify workers of the abnormality."
- 要点: 止める主体は**機械の自動停止**と**作業者の手動停止**の2系統である。本標準の 3.12.10(サーキットブレーカー)は前者に当たる。後者、つまり席の担い手が止める権限の明文は無い

**Edmondson, "Psychological Safety and Learning Behavior in Work Teams", ASQ 44(2), 1999** — E2(製造業1社・51チームの現場研究)。Harvard DASH の抄録から引く

- "team psychological safety—a shared belief held by members of a team that the team is safe for interpersonal risk taking"
- "team psychological safety is associated with learning behavior, but team efficacy is not, when controlling for team psychological safety. As predicted, learning behavior mediates between team psychological safety and team performance."

**ダイハツ第三者委員会 調査報告書(要約版)(2023-12-20)** — E2(単一事例。147名へのヒアリング・アンケートに基づく)

- 問題提起は経営に届いていた(p.10): 「全ての設計変更を認証試作車に織り込むためには開発日程の延長が必要との問題提起を経営トップも参加する会議体において行った。しかし、結果的には、現状のプロセスを維持したままの再発防止策が検討され ... 開発日程に 2 週間が追加される形で日程の見直しが行われた。」
- 組織風土(p.10): 「『できて当たり前』の発想が強く、何か失敗があった場合には、部署や担当者に対する激しい叱責や非難が見られること」
- 圧力(p.7): 「『認証試験は合格して当たり前。不合格となって開発、販売のスケジュールを変更するなどということはあり得ない。』というような考えが強く」
- 内部通報(p.9): 1,968 件の利用実績がありながら本件を示唆する通報は無かった。報告は「『社員の声』制度、さらにはダイハツの自浄作用に従業員が期待や信頼を寄せていなかったことの証左」とする
- 責任の所在(p.10): 「本件問題でまずもって責められるべきは、不正行為を行った現場の従業員ではなく、ダイハツの経営幹部である。」
- 提言(p.11): 「余裕をもったスケジュール、あるいは多少窮屈でも問題発生時に柔軟に変更できるスケジュールが実現できるように開発・認証プロセスの見直しを行うべき」。また評価と認証の分離(相互牽制)を求める(p.11〜12)
- 要点: 異議を言える経路(会議体・通報制度)は**あった**。失敗したのは、異議を退けた決定に歯止めが無かったこと、そして失敗を叱責する評価構造である

**NIST AI RMF MANAGE 2.4** — E1(規範)

- "Mechanisms are in place and applied, and responsibilities are assigned and understood, to supersede, disengage, or deactivate AI systems that demonstrate performance or outcomes inconsistent with intended use."

**EU AI 法 第14条4項** — E1(規範。高リスク AI システムに限る。開発支援ツールが該当するかは判定できない [FND-0168])

- "(b) to remain aware of the possible tendency of automatically relying or over-relying on the output produced by a high-risk AI system (automation bias)"
- "(d) to decide, in any particular situation, not to use the high-risk AI system or to otherwise disregard, override or reverse the output"
- "(e) to intervene in the operation of the high-risk AI system or interrupt the system through a 'stop' button or a similar procedure that allows the system to come to a halt in a safe state"

**DORA 第28条7項(前掲)** — E1

- 解約できる状況として、法令・契約の重大な違反、機能の遂行を変えうる重大な変化、データ保護の弱点、当局が監督できなくなる場合を列挙する。**どの事象で切り替えを検討するか**を事前に列挙する先例である

**ISO 22301:2019 8.4.2 "Response structure"** — 目次のみ確認。本文は未読

**既存の外部調査(#282)**

- 報告経路の明示は不正な回避を減らす(エージェント側の測定)[FND-0013](E2)

### 6(b) シートへの含意

- **Q17(速度目標と品質が衝突したとき、誰が止められるか)**: 本標準には止める手段が複数ある(G-7 の差し戻し、3.12.10、7.9)。council-02 の指摘どおり、異議は止める権限ではない(H.5)。ダイハツの事例は、まさに「異議は届いたが退けられた」型である。必要なのは異議の経路の追加ではない。**異議を退けて進める決定を、記名で、一段上の受容権限者へ上げること**である
- 評価構造: Edmondson と、ダイハツの「激しい叱責」が同じ向きを示す。差し戻し・停止・所見を担当者やチームの減点指標にすると、リスクは隠れる。H.7 は「成立しない」と注記するだけで、要求していない
- **Q18(有事の停止・切替・顧客説明の決定者)**: 障害(Sev1)の決定者は既にある。足りない事象は、提供者の契約・規約・価格の変更、モデルの退役、規制の変更、情報漏えいである。DORA 28条7項のように**事象を先に列挙し**、事象ごとに決定者を役割名で決めておく形が先例になる
- **即時不採用条件「利用停止を決める基準と権限者がいない」**: 「権限者」の側はここで答える

### 6(c) 要求事項の案 → R-6(第7節)

---

## 7. 要求事項の案(会議体への材料)

各案は「最小限で、既存の条項と重ならない」ことを条件に書きました。置き場所は案です。値(頻度・期間・閾値)を本標準が定める案はありません。値は組織が定め、本標準は**定めて記録すること**を求めます(3.12.7 と同じ型)。

### 7.1 案の一覧

| 案 | 内容(要求事項の文案) | 置き場所(案) | 答える問い・条件 | 根拠と水準 |
|---|---|---|---|---|
| **R-1 依存先台帳** | AI運用担当者は、開発ラインが依存する対象を1つの台帳に記録する。対象はモデル(版)、提供者、エージェント実行基盤・接続経路、評価用の基準集合、指示資産、コア機能の理解保持者(個人)とする。各行に (1) 重要度: 停止したときに止まる席・ゲート、(2) 代替性: 適合性評価(3.12.3)を通過した代替の有無と切替の所要、(3) 集中: 同じ提供者への重なり、を持たせる。台帳は四半期ごと(3.12.6 の棚卸しと同時)に見直す | 3.12 に新節。表7 は席の側から台帳の行を参照する | Q12。不採用条件「依存先」 | DORA 28(3)・28(4)(c)・29、NIST GV-6.1-007・GV-6.2-001、金融庁オペレジ(E1 規範)。台帳の項目の妥当性を測った研究は無い(E0〜E1) |
| **R-2 縮退時の能力** | 表7「AI が使えないときの扱い」に次の欄を足す。(1) 縮退先(人へ戻す/止める)、(2) 縮退時に処理できる量の見積り(例: 週あたりに人が検証まで終えられる変更の数、優先して続ける作業)、(3) 許容できる停止期間と再開の目標、(4) 見積りを確かめた最後の記録(演習または実際の停止)。出荷判定に必要な席は、組織が定めた間隔で見積りを確かめる | D-0 表7 の欄、3.12.5 の「基盤が利用できない期間」の項 | Q13。不採用条件「AI 停止時に継続・縮退・復旧する方法がない」 | ISO 22301 3.3「predefined capacity」、NIST GV-6.2-006・GV-6.2-003、DORA 11(5)・28(8)「tested」、金融庁「耐性度」(E1 規範)。AI 開発での縮退能力の実測は無い(E0)。値には暫定マークが要る |
| **R-3 退出の予行** | (1) 評価用の基準集合、仕様、テスト、指示資産、運用手順は、自社が管理するリポジトリに置き、提供者の環境だけに置かない。(2) 指示資産のうち、特定の提供者・世代に固有の書式や機能に依存するものを台帳(R-1)で識別する。(3) 出荷判定に必要な席が依存するモデルについて、提供者を替える場合の回帰評価(3.12.3 の手順)を、組織が定めた間隔で少なくとも1回は**現行と異なる提供者または世代**で実施し、差分を記録する。この記録を退出計画の試験とみなす。(4) 退出を検討する事象を R-6 の事象表に含める | 3.12.3 の要求事項の追加、3.12.6 | Q14。不採用条件「業務知識・評価基準・運用知識を自社へ取り出せない」 | DORA 28(8)「sufficiently tested」・30(3)(f)、NIST GV-6.2-005(E1 規範)。指示資産の世代間の移植性の低さ [FND-0043](E0〜E1) |
| **R-4 判断席の非 AI 判断力と後継** | (1) 3.4.1 の確認(任命時と有効期間の更新時)のうち、独立レビュア・技術判断者・QA(出荷判定者)の確認には、**AI の支援なしで作成した**成果物を少なくとも1件含める(例: AI を使わずに書いた挙動要約、AI の所見を見ずに行った差し戻し)。(2) コア機能の理解保持者が1名以下の状態を逸脱として扱い、是正の期限と責任者を記録する(運用メトリクスの「コア理解カバレッジ」を要求事項へ上げる)。(3) 判断を担う席ごとに、後継の候補(確認済み/暫定任命の候補)を表5に記録する。候補がいない席を表示し続ける | 3.4.1「確認に用いるもの」、`metrics.md` の該当行、D-0 表5 | Q15・Q16。不採用条件「生成物を理解・変更できる人材を維持する計画がない」 | Bainbridge 1983・FAA SAFO 13002(E1)、Budzyń 2025(E2 観察)、Anthropic 2026(E2 RCT、若手・短期)、Lee 2025(E2 自己申告)、金融庁「コントローラビリティ」(E1)、ダイハツ報告(E2 単一事例)。熟練者の長期の技能低下を測った研究は見つからない。暫定マークが要る |
| **R-5 AI 利用の効果と停止基準** | G-1 の効果試算に次の欄を置く。(1) 費用: AI 実行費用に加え、検証(レビュー・テスト)の工数、手戻り、力量の確認・維持(R-4)、統制の運用(AI運用担当者・AI維持管理者)の工数。(2) 比較の基準: AI 利用を拡大しない場合の現行の基準値。自己申告の速度を基準にしない。(3) 測る位置: 下流の指標(リリース、変更失敗、手戻り)。利用量(トークン、生成行数、PR 本数)を成果指標にしない。(4) 拡大・縮小・停止の条件と判定者。(5) 再評価の時期 | G-1 基準3、7.7 | Q10・Q11。不採用条件「利用停止を決める基準」 | METR 2025(E2)、DORA ROI 2026(E1 枠組み、二次で確認)、金融庁 AIDP(E1)、[FND-0151](E3/E2)[FND-0154](E3)[FND-0156](E3)[FND-0159]。費用欄の構成で判断が改善するかを測った研究は無い(E0) |
| **R-6 止める権限と有事の決定者** | (1) 品質・安全の異常を認めた席の担い手は、マージ・出荷・自律実行の停止を申し立てられる。停止の解除は、その変更の受容権限者が記名で行う。(2) 異議または停止の申し立てを退けて進める決定は、記録したうえで受容権限の一段上へ報告する。(3) 差し戻し・停止・所見の件数を、担当者やチームの評価の減点指標にしてはならない。(4) 受容基準方針に有事の決定者表を置く。事象(重大インシデント、情報漏えい、提供者の契約・規約・価格の変更、モデルの退役、規制の変更)ごとに、決定(停止/切替/継続/顧客説明)と決定者(役割名)と期限を記録する | 7.x(受容基準方針)、附属書H の H.5・H.7 | Q17・Q18。不採用条件「利用停止を決める権限者」 | トヨタ生産方式(E1)、Edmondson 1999(E2)、ダイハツ報告(E2)、NIST MANAGE 2.4・EU AI 法 14(4)(d)(e)(E1 規範、14条は高リスクに限る)、DORA 28(7)(E1)。「上位報告で隠蔽が減る」を測った研究は今回確認していない |

既存条項との突合(重なりの確認):

- R-1 は 3.12.3(承認済みモデルの一覧)を置き換えない。一覧は台帳の1区分になる。3.12.6 の四半期の棚卸しに相乗りさせ、新しい周期を作らない
- R-2 は 3.12.5 の「人間が自ら実装する手順へ縮退する経路を確保する」を前提にし、経路の**量**だけを足す。3.13.2(AI の停止は体制の変化点に数えない)とは矛盾しない
- R-3 の (3) は 3.12.3 の手順の再利用であり、新しい評価の機構を作らない
- R-4 は 3.4.1 の「筆記試験を確認の主たる手段としません」を維持する。成果物による確認の中に、AI なしの成果物を含めるだけである。3.4.1 の有効期間の値は引き続き組織が定める
- R-5 は 3.12.7(実行予算の配給)と重ならない。3.12.7 は消費の総量の統制、R-5 は効果と費用の比較である
- R-6 の (1) は 3.12.10(機械による停止)と別系統の、人による停止である。G-7 の差し戻しはゲートでの判定であり、R-6 はゲートの間でも止められる点が異なる。(2) は council-02 の「決めること2 の上位報告」と同じものを指す

### 7.2 採らないと決めた案

| 案 | 判断 | 理由 |
|---|---|---|
| 複数の AI 提供者の常時並行運用(マルチベンダー化)を要求する | 課さない | DORA 29条も上限や禁止を課さず、代替案の費用と便益を比べよと定めるにとどまる。金融庁は、マルチクラウドは対応できる人員の育成・採用の費用がボトルネックで「現状では困難」と記す。本標準は代替**可能性**の証拠(R-3 の予行)を求め、並行運用は求めない |
| 全社の AI 投資のポートフォリオ判断を本標準で定める | 範囲外 | 開発プロセス標準の範囲を超える。ISO/IEC 42001 と経営の判断に委ねる。本標準は案件・開発ラインの単位(R-5)に限る |
| 「AI を使わない作業日」など、非 AI の実務の頻度を数値で定める | 値を定めない | FAA も Bainbridge も「機会を作れ」とし、頻度は運用者に委ねる。AI 開発で頻度と技能の維持の関係を測った研究は無い。R-4 は確認の中身で担保し、頻度は組織が定める |
| 組織の全構成員に AI リテラシー教育を課す | 追加しない | 3.4.1「教育の対象範囲」の既存の判断を維持する。EU AI 法 第4条も改正後は「支援する措置」で、特定の水準の保証を求めない(改正の官報は未読) |

## 8. 未取得・限界

- ISO/IEC 42001 の附属書A(A.10)と 7.2 の本文、ISO 22301 の 8.2.2(BIA)・8.4.2(対応体制)の本文、ISO 22300 の用語原文は未読。いずれも「規定が無い」とは判定していない
- ISO/IEC 27036、FISC 安全対策基準・コンティンジェンシープラン手引書は今回取得していない(金融庁オペレジが FISC の手引書の存在に言及していることのみ確認)
- EU データ法の事業者切替の章は取得に失敗した
- DORA ROI 報告書の本体は登録制で未読。InfoQ の記事(二次情報)に依っている
- Budzyń 2025 は原論文を読んでいない。学会の構造化抄録と報道の要約に依っている
- 熟練開発者の判断力が AI の常用で長期に落ちるかを測った研究は、今回の検索では見つからなかった。R-4 は理論・規範・隣接領域の実測からの推論であり、暫定マーク(ADR-0026)が必要である
- 日野自動車など、ダイハツ以外の国内の品質不正の報告書は今回読んでいない。止める権限の論点は単一事例に依っている

## 出典一覧(取得日はすべて 2026-10-03)

| # | 出典 | 発表 | 種別 | 読んだ範囲 | URL |
|---|---|---|---|---|---|
| 1 | NIST AI RMF 1.0 Core | 2023-01 | 規格(任意) | GOVERN 6、MAP 4、MANAGE 2・3 の小分類 | https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ |
| 2 | NIST AI 600-1 Generative AI Profile | 2024-07 | 規格(任意) | 12 リスクの定義、GV-6.1・GV-6.2・MG-3 の推奨行動 | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf |
| 3 | NIST AI RMF to ISO/IEC FDIS 42001 Crosswalk | — | 公的機関 | GOVERN 6・MANAGE 3 の対応行 | https://airc.nist.gov/docs/NIST_AI_RMF_to_ISO_IEC_42001_Crosswalk.pdf |
| 4 | ISO/IEC 42001:2023(iTeh 公開プレビュー) | 2023-12 | 規格 | 序文〜3章 | https://cdn.standards.iteh.ai/samples/81230/4c1911ebc9a641fcb6ee21aa09c28ad3/ISO-IEC-42001-2023.pdf |
| 5 | Regulation (EU) 2022/2554(DORA) | 2022-12 | 規制 | 前文(67)周辺、11条、28〜30条 | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2554 |
| 6 | ISO 22301:2019(iTeh 公開プレビュー) | 2019-10 | 規格 | 序文〜3.20、目次 | https://cdn.standards.iteh.ai/samples/75106/d11801a9bab045a88d59cd321519ecf1/ISO-22301-2019.pdf |
| 7 | ISO 22300:2021 の用語(二次) | — | コンサルタント解説 | RTO・MBCO の引用 | https://riskonnect.com/business-continuity-resilience/rto-rpo-differences-and-uses / https://spedan.co.uk/blog/iso-22301-business-continuity/5-business-continuity-terms-you-must-know |
| 8 | 金融庁「オペレーショナル・レジリエンス確保に向けた基本的な考え方」 | 2023-04-27 | 公的機関 | 図表1、BOX6〜9(p.19〜24) | https://www.fsa.go.jp/news/r4/ginkou/20230427/02.pdf |
| 9 | 金融庁「AIディスカッションペーパー(第1.0版)」概要 | 2025-03-04 | 公的機関 | 外部事業者、投資対効果、人材の各頁 | https://www.fsa.go.jp/news/r6/sonota/20250304/aidp_summary.pdf |
| 10 | Bainbridge, Ironies of Automation, Automatica 19(6) | 1983 | 査読論文 | 全文(5頁) | https://davidjusth.com/s/Ironies-of-Automation_Bainbridge_1983.pdf |
| 11 | FAA SAFO 13002 Manual Flight Operations | 2013-01-04 | 規制当局 | 全文 | https://www.faa.gov/sites/faa.gov/files/other_visit/aviation_industry/airline_operators/airline_safety/SAFO13002.pdf |
| 12 | Budzyń ら, Lancet Gastroenterol Hepatol 10(10) | 2025-08 | 査読論文(二次で確認) | ACG 構造化抄録、ASCO Post、オスロ大学の記事 | https://gi.org/journals-publications/ebgi/zhou_sep2025 / https://ascopost.com/news/august-2025/routine-ai-assistance-may-lead-to-loss-of-skills-in-endoscopists-study-shows / https://www.med.uio.no/helsam/english/research/groups/clinical-effectiveness/news/2025/ai-colonoscopy.html |
| 13 | Anthropic, How AI assistance impacts the formation of coding skills | 2026-01-29 | ベンダー研究 | 記事全文 | https://www.anthropic.com/research/AI-assistance-coding-skills |
| 14 | Lee ら, The Impact of Generative AI on Critical Thinking(CHI 2025) | 2025 | 査読論文 | 抄録 | https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/ |
| 15 | EU AI 法 第4条・第14条(AI Act Explorer) | 2024 / 改正 2026 | 規制(第三者の整理サイト) | 第4条(改正後と旧文言)、第14条4項 | https://artificialintelligenceact.eu/article/4/ / https://artificialintelligenceact.eu/article/14/ |
| 16 | 改正規則 (EU) 2026/1744 の書誌(二次) | 2026-07-24 | 第三者サイト | 脚注の書誌のみ | https://eu-kidsact.com/impact-analysis |
| 17 | ISO/IEC Harmonized Structure for MSS(ISO/TMBG 2026-07-01) | 2026-07 | 規格 | 7.2 の共通文(検索結果の抜粋) | https://www.iso.org/sd/fetch/2EVmNRpfMEK8NcTL_uoAJceDlxYmmqpQWNk3r1MeLNWCXk6i10vZ-R5FEjIK-UOe |
| 18 | METR, Early-2025 AI on experienced OSS developer productivity | 2025-07-10 | 研究機関 | 記事の結果と留保 | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ |
| 19 | DORA, ROI of AI-assisted Software Development(紹介ページ) | 2026-01 | ベンダー(Google Cloud) | 紹介ページ | https://cloud.google.com/resources/content/dora-roi-of-ai-assisted-software-development |
| 20 | InfoQ, New DORA Report Claims Strong Engineering Foundations Drive AI ROI | 2026-05-11 | ニュース(二次) | 記事全文 | https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report |
| 21 | トヨタ生産方式(トヨタ公式) | — | 企業 | 自働化・アンドンの節 | https://global.toyota/en/company/vision-and-philosophy/production-system/ |
| 22 | Edmondson, Psychological Safety and Learning Behavior in Work Teams, ASQ 44(2) | 1999 | 査読論文 | 抄録(Harvard DASH) | https://dash.harvard.edu/entities/publication/13a7b031-0fdd-45ec-a7e0-2b80e2bc679f |
| 23 | ダイハツ工業 第三者委員会 調査報告書(要約版) | 2023-12-20 | 調査報告 | 全14頁 | https://www.daihatsu.com/jp/news/2023/report_1.pdf |
| 24 | 既存の外部調査 #282 の知見 | 2026-09-30 | リポジトリ内 | FND-0013・0022・0023・0043・0054・0055・0059・0084・0115・0135・0151・0154・0156・0157・0159・0160・0165・0168・0210・0211・0212・0267 | `research/282-survey-2026-09/findings.yaml` |
