# #415 外部調査(2): 中止・継続の判定で見積りの幅のどの値と比べるか

- 作成: 2026-11-04(外部調査担当)
- 問い: 「残る予算と期間でステージのゴールに到達できるか」を判定するとき、見積りの幅(P50/P80/P90、楽観〜悲観、三点見積り)のどの値と比べるのが既存の枠組みと実務か。予算の上限を示す値と、中止の判定に使う値を分ける作法はあるか
- 表記: 〔一次〕原典を読んだ / 〔二次〕解説・二次資料 / 〔未〕原典を読めていない。取得日はすべて 2026-11-04

## 1. 調査結果(出典別)

### 1.1 英国 HM Treasury Green Book(2022、リンク更新版)〔一次〕

- URL: https://assets.publishing.service.gov.uk/media/6645c709bd01f5ed32793cbc/Green_Book_2022__updated_links_.pdf
- 6.70〜6.71: 中央推計(central estimate)の周りの不確かさを信頼区間または P90 で表してよい。P90 は「類似事業の10件に1件しか超えない上側の費用推計」と定義
- 6.72: 裾のリスク(tail risk)は信頼区間や P90 では十分に捉えられないことが多い
- 6.78: 楽観バイアス(optimism bias)は評価の冒頭で明示的に補正しなければならない(費用・期間を増やし、便益を減らす)。6.79: 補正幅は組織自身の過去の予測誤差から導く。6.80: 無ければ補足ガイダンスの汎用値
- 6.81: リスクの具体化と予防費の計上に応じて楽観バイアスの補正を減らす
- 6.82〜6.83: コンティンジェンシー = 残る楽観バイアス補正 + 予防していない残余リスク。**事業へ直接配分しない**のが通例(政府は自家保険)。組織の準備金の見積りに使う
- 含意: 「事業に渡す値(中央推計+予防費)」と「承認者が持つ準備金の値」を**分ける**。中止判定の比較値は規定していない
- 補足ガイダンス「Optimism bias」(2003): https://www.gov.uk/government/publications/green-book-supplementary-guidance-optimism-bias 〔二次で概要のみ確認。原典の数値表は〔未〕〕
- 注記: 2026 年版 Green Book の存在を示唆する二次情報(CRAN greenbook パッケージ)があるが〔未〕。上記は 2022 版の記述

### 1.2 英国 IPA(Infrastructure and Projects Authority)Cost Estimating Guidance(2021)〔一次〕

- URL: https://www.gov.uk/government/publications/cost-estimating-guidance/cost-estimating-guidance
- 2.2: 見積りはリスクと不確かさを表す**幅**で示す
- 7.4: リスクの中央値(P-50 相当)を見込み最終費用(AFC)へ配分する。楽観・中央・悲観の3点を評価する。コンティンジェンシーを同じ費用枠内でも流用しない
- 7.5: 見積りは「Median Scenario / P-50 equivalent」の費用を示さねばならない。幅は確率幅ではなく AFC に対する百分率で表す。**各ステージで見積りの幅を目標の閾値と比べる**。幅の外に出たら再ベースラインする(幅で全事象を吸収しようとしない)
- 7.5(要旨): 事業は上より下に外れるより上に外れやすいという証拠がある(非対称)
- 7.8: ステージゲートでは「合理的に楽観〜悲観」の費用の包絡を**負担可能額の閾値(affordability threshold)**と比べる。悲観側が閾値を超えれば負担不能の公算が高い、楽観側が閾値を下回れば負担可能の公算が高い、閾値が幅の中に落ちるときは追加の措置を決める
- 含意: **計画値(AFC)は P50、ゲートの判定は幅全体(とくに悲観側)を閾値と比べる**という分離が明文化されている。本問に最も直接答える一次資料
- 二次: 「P50 を基準、P80 を資金枠」とする英国実務の要約(SOMA 用語集。https://soma-website.pages.dev/resources/glossary/p50-p80-p95/)、エディンバラ・トラム調査の文書(「管理には P50 または期待値、資金には P80 が通例」https://edinburghtraminquiry.org/cec02084256_part1)〔二次〕。IPA の一次資料に「P80 = 資金枠」の明文は見当たらない

### 1.3 NASA JCL(Joint Cost and Schedule Confidence Level)〔一次(SMD 方針文書経由の NPR 引用)〕

- URL: https://discovery.larc.nasa.gov/PDF_FILES/SPD-19_PI-ledmissions_70JCL.pdf(SMD Policy Document SPD-19、2010-06-18 承認)
- NM 7120-81(NPR 7120.5D NID)2.1.8.5 の引用: (a) プログラムは信頼水準 **70%**(または決定権者が承認した水準)でベースライン化・予算化する。(c) 最低限、プロジェクトは信頼水準 **50%** 相当で資金を付ける
- 構造: Management Baseline(プロジェクトへ渡す予算)+ UFE(Unallocated Future Expenses、本部が保持)= Commitment Baseline(70% JCL、議会への約束)
- 3(g)(h): Management Baseline を超えて UFE を渡すと PI の約束の超過、Commitment Baseline を超える追加資金は**機関の約束の違反(breach)**
- 含意: **渡す予算(≒50%付近)と外部への約束(70%)を分け、差を上位の判断者が持つ**。違反は Commitment Baseline 超過で定義される(中止そのものの基準ではないが、違反時は再承認の手続きへ入る)
- 現行 NPR 7120.5F 本文は〔未〕。JWST 独立レビューは複雑・高優先度案件で 80% を勧告(https://WEBB.nasa.gov/resources/JamesWebbSpaceTelescopeIndependentComprehensiveReviewPanelReport.pdf 〔二次: 検索要約〕)。SLS では 70% 未満を長官が容認(https://spacepolicyonline.com/news/mikulski-deeply-troubled-by-nasas-budget-request-sls-wont-use-70-percent-jcl/ 〔二次〕)

### 1.4 AACE International〔二次・一部〔未〕〕

- 40R-08(Contingency Estimating – General Principles)は分類の枠組みで、特定の P 値を定めない(カタログ: https://www.pathlms.com/aace/courses/2928/documents/3825)。全文は〔未〕
- 41R-08(Range Estimating)はモンテカルロで超過確率と「選んだ信頼水準に達するコンティンジェンシー」を出す方法。写し: https://wsdot.wa.gov/sites/default/files/2021-12/risk-analysis-contingency-RangeEstimating.pdf 〔二次: 検索要約〕
- オンタリオ・エネルギー委員会での専門家証言「特定の信頼水準の使用を定めた標準はない」(https://www.rds.oeb.ca/CMWebDrawer/Record/563701/File/document)〔二次〕
- 含意: 費用工学の専門団体は**値の選択を組織のリスク許容度に委ねる**

### 1.5 米国の法令: NASA の基準超過と継続の制限(51 U.S.C. §30104)〔一次〕

- URL: https://www.law.cornell.edu/uscode/text/51/30104
- (c)(2): ベースライン報告はライフサイクル費用の見積り・予備費・日程・リスク低減計画を含む。**信頼水準の明記は条文にない**(JCL は NPR 側の規定)
- (d)(1): 開発費がベースラインの見積りを **15% 以上**超える見込み、またはマイルストーンが **6 か月以上**遅れる見込みで通知
- (f): **30% 超**と判断されたら、報告から 18 か月後以降は、議会が法で継続を認めない限り**終了費用以外を支出してはならない**。継続するなら 90 日以内に新しいベースライン報告
- 含意: 中止の判定は**パーセンタイルではなく「ベースラインからの超過率の見込み」**で引き金を引き、継続の判断を上位(議会)へ移す。予算化の値(70% JCL)と中止の引き金(+30%)は**別の物差し**
- 関連〔二次〕: 10 U.S.C. §2334 は国防の大型調達で、見積りに使った信頼水準と**その選択理由の開示**を求める(https://www.gpo.gov/fdsys/pkg/USCODE-2011-title10/html/USCODE-2011-title10-subtitleA-partIV-chap137-sec2334.htm 、検索要約。80% 未満の正当化を求めた旧規定ありとの記述は〔未〕)。GAO Cost Estimating and Assessment Guide(GAO-20-195G)の該当章は〔未〕

### 1.6 Flyvbjerg の参照クラス予測(DfT 向け、2004/2006)〔一次〕

- URL: https://arxiv.org/pdf/1302.3642(Flyvbjerg, "From Nobel Prize to Project Management: Getting Risks Right", Project Management Journal 37(3), 2006)
- 表4: 楽観バイアスの上乗せ率(資本費)。道路 50%点 15% / 80%点 32%、鉄道 40% / 57%、固定リンク 23% / 55%
- 「50% 点は大きなポートフォリオを持つ投資者向け(ある事業の超過を別の事業の余りで相殺できる)。80% 点 — 超過の危険 20% — は英国 DfT が地方交通の大型投資で**通例受け入れる**危険の水準」
- 「上側の百分位(80〜90%)は、超過が起きないことを強く確かめたい投資者、例えば**承認予算を超える追加資金にアクセスできない単独の事業**で使う」
- 上乗せは**着工の決定(go/no-go)の時点の予算**に掛ける
- 含意: P 値の選択は**資金の融通の有無とポートフォリオの大きさ**で決まる、という選択規則を示す唯一の一次資料。中止判定の値には直接触れない
- 2021 年の更新(Oxford Global Projects、DfT TAG): https://www.gov.uk/government/publications/tag-updated-evidence-for-optimism-bias-uplifts 〔ページのみ確認。本文 63 頁の百分位表は〔未〕〕

### 1.7 豪州連邦: P50 と P90 の併記〔二次〕

- Guidance Note 3B(v2.0、2023-11): 連邦資金を求める事業は **P50 と P90 の両方**の見積りを示す(https://investment.infrastructure.gov.au/sites/default/files/documents/guidance-note-3B-deterministic-contingency-v2.pdf 。取得がタイムアウトし検索要約のみ。〔未〕)
- 財務省の toolkit: P90 = 「超えない見込みが 90% となる十分なコンティンジェンシーを含む見積り」(https://www.finance.gov.au/government/commonwealth-investment-framework/commonwealth-investments-rmg-toolkit/cost-estimation-toolkit 〔二次〕)
- Grattan Institute: 近年の事業計画書で P50 と P90 の差が概ね 7% しかない(幅が狭すぎる)との指摘(https://grattan.edu.au/?p=15479 〔二次〕)
- 含意: 併記の作法はあるが、幅そのものの信頼性が別の問題になる(狭い幅への疑い — GAO 系の発表も同旨〔二次〕)

### 1.8 PMBOK のコンティンジェンシー予備と管理予備〔二次〕

- コンティンジェンシー予備 = 既知の未知に対する予備。コストベースラインの**内側**。管理予備 = 未知の未知。ベースラインの**外側**で、使うには承認と変更要求が要る。総予算 = ベースライン + 管理予備(https://pressbooks.ulib.csuohio.edu/projectmanagement2ndedition/chapter/9-4-establishing-the-project-budget/ ほか〔二次〕。PMBOK 原典は〔未〕。第7版の図での位置づけに異論ありとの議論も〔二次〕)
- 含意: 「チームが管理する値」と「上位が持つ予備」の二層。どの P 値に置くかは定めない

### 1.9 PRINCE2 の許容幅と例外〔二次〕

- 例外は**実績の逸脱ではなく、許容幅(tolerance)を超える予測**で上げる。プロジェクト・マネージャーが例外報告をプロジェクト委員会へ。委員会の選択肢は許容幅の拡大・範囲の縮小・例外計画の要求・**早期終了(premature closure)**(https://prince2.wiki/management-products/exception-report 、https://knowledgetrain.co.uk/project-management/exception-management 〔二次〕。AXELOS 原典は〔未〕)
- 含意: 判定の比較は「予測 vs 許容幅」。予測をどの確度で出すかは規定しない(許容幅自体に不確かさを織り込む設計)

### 1.10 Monte Carlo 予測と Kanban の SLE〔一次 + 二次〕

- The Kanban Guide(2025.5)〔一次〕: https://kanbanguides.org/the-kanban-guide/2025.5/pdf/kanban-guide.v2025.5.en.pdf 。SLE は「作業項目が開始から終了まで流れるのにかかる時間の予測」。経過時間と確率の2部(例「作業項目の 85% は8日以内に終わる」)。履歴のサイクルタイムに基づく。**85% は例示であり規定ではない**
- Vacanti の 85 パーセンタイルでの約束の推奨は二次資料の帰属のみ(https://www.resumelens.org/blog/kanban/monte-carlo-forecasting-kanban 〔二次〕)。著書原文は〔未〕
- Magennis: 85% は「しっくりくる」から使われる慣行で、確度の選択は利害関係者に委ねる、との二次の紹介(https://nicolas-brown-tdxj.squarespace.com/blog/tag/Forecasting 〔二次〕)
- ASOS の事後検証: 400 件で 85 パーセンタイルの予測が 361 件(90%)当たり、70 は 336 件(84%)、50 は 270 件(68%)(https://medium.com/asos-techblog/the-full-monte-901d721b8532 〔二次・単一組織〕)
- 含意: ソフトウェアの流れの予測では「中央値 = 予想、85〜95 = 約束」が慣行。**中止判定の値としての推奨は見当たらない**。検証は単一事例のみ

### 1.11 ゲート型の投資判断(Stage-Gate)〔二次〕

- Cooper の Stage-Gate はスコアカード(Project Attractiveness Score)と NPV・Productivity Index(価値 ÷ 制約資源)で Go/Kill を決める。PI の予測が下がると即時の Go/Kill ゲートを開く例(https://innovationmanagement.se/?p=64618 、https://isbm.org/wp-content/uploads/2021/11/Cooper-2021-Unlocking-pipleine-gridlock.pdf 〔二次〕)
- Cooper 自身が「Kill はめったに行使されない」と指摘(同上〔二次〕)
- 含意: Kill の比較は確率の分位点ではなく**残りの価値 ÷ 残りの資源**。残る資源の見積りの確度は定めない

### 1.12 日本の公共事業の再評価・IPA の見積り〔一次 + 二次〕

- 「国土交通省所管公共事業の再評価実施要領」〔一次〕(https://www.mlit.go.jp/tec/hyouka/public/3sai.pdf 。版の日付は抽出テキストで未確認)
  - 第1: 事業の継続が適当と認められない場合には**事業を中止する**。採択後5年・10年などの時点で再評価
  - 判断の視点: ①事業の必要性等 ②**事業進捗の見込み** ③コスト縮減・代替案。①②とも妥当なら継続、そうでなければ③で見直し、なお妥当でなければ中止
- 費用便益分析の技術指針は継続・中止の判断材料として**残事業の投資効率性(残事業 B/C)**を導入し、事業全体の B/C は説明責任の位置づけ(検索要約〔二次〕。指針の原文は〔未〕)— **既投資額(サンクコスト)を判定から外す**設計
- 財務省の予算執行調査(令和3年度)は、総事業費の上振れを避けるため新規採択時にあらかじめ費用増を見込むこと、再評価までの期間を短くすることを指摘(検索要約〔二次〕。PDF は 404 で〔未〕)
- P50/P90 などの確率的な信頼水準を定めた国の資料は見つからなかった
- IPA(情報処理推進機構)/SEC の見積り関係(先進的見積り手法の実証調査 2008 等)は手法の選択・データ活用が中心で、**判定に使う分位点の規定は確認できず**(https://www.ipa.go.jp/archive/publish/secbooks20060425.html 〔二次〕)

### 1.13 中止の判断とサンクコスト(Staw、Keil)

- Simonson & Staw (1992), "Deescalation Strategies", Journal of Applied Psychology 77(4) 419-426〔一次〕(https://gwern.net/doc/psychology/cognitive-bias/sunk-cost/1992-simonson.pdf)
  - 実験で有意に拡大(escalation)を抑えたのは3つ: (a) 悪い結果の脅威を下げる (b) **達しなければ方針を変える最低目標水準を設定する** (c) 結果ではなく決定の過程で評価する。綿密な比較検討・自己診断の告知は効果なし
  - 「目標は、どんなフィードバックも受け取る**前に**設定すべき。後の結果で歪められないように」「できるだけ精確・曖昧さなく」
  - 「事業の発起者に、下回れば失敗と認め方針変更を引き起こす具体的な最低目標水準を出させるべき」
  - 限界: 学生被験者の実験
- Staw & Ross (1987), "Knowing When to Pull the Plug", HBR 65(2) 68-74〔未〕。二次では「当初の決定者と後続の決定者を分ける」処方が紹介され、実組織での検証は条件付きの支持(Dunegan ら)〔二次〕(https://csuohio.elsevierpure.com/en/publications/an-empirical-test-of-staw-and-ross-prescriptions-for-the-manageme/)
- Keil ら (2000, MIS Quarterly) — 3か国の実験で、**サンクコストとリスク認知**が問題のある IT 事業の継続意思を有意に予測〔二次: 要約〕。Lee, Keil & Kasi (2012, JMIS) — IT 専門職 349 名の実験で、**非常に難しく具体的な予算・日程の目標**が拡大を抑えた〔二次: 要約〕(https://jmis-web.org/articles/593)
- 含意(保守的な値との関係): 拡大の偏りは**継続側**へ働く。判定の時点で楽観側の値(P50 以下)を「到達可能」の根拠にすると、楽観バイアス(§1.1・§1.2 の非対称)と継続の偏りが重なる。他方、文献は「どの分位点を使え」とは言わず、**事前に数値で定めた判定規則**と、決定者の分離・過程の評価を処方する

## 2. 立場の対立

| 論点 | 立場 A | 立場 B | 根拠 |
|---|---|---|---|
| 計画値 | 中央値(P50)で管理する | 高い分位点(P70〜P90)で約束する | A: IPA UK 7.4/7.5、NASA の 50% 資金下限、PMBOK のベースライン。B: NASA 70% JCL、DfT 80%、Kanban の 85% 例 |
| 予備の持ち主 | チームに渡す | 上位(承認者・本部)が持つ | B が多数: Green Book 6.83、NASA UFE、PMBOK 管理予備 |
| 中止判定の物差し | 分位点(P 値)で到達可能性を見る | ベースラインからの超過率・許容幅で引き金を引く | A: IPA UK 7.8(幅と閾値)。B: 51 U.S.C. §30104(15%/30%)、PRINCE2 の許容幅 |
| 判定に使う値 | 楽観〜悲観の**幅全体**で判定し、閾値が幅の中なら人が決める | 単一の値(例 P80)と比べる | A: IPA UK 7.8〔一次〕。B: 明文の一次資料は見つからず、実務の要約のみ |
| 分位点の選び方 | 文脈で決める(融通の利く資金・ポートフォリオなら P50、単独・追加資金なしなら P80〜90) | 組織で一律に固定する | A: Flyvbjerg 2006、AACE(標準なし)、10 USC 2334(理由の開示)。B: NASA の一律 70%(ただし決定権者の承認で変更可) |
| 既投資の扱い | 残りだけで判定する | 全体の効率も見る | 国交省は残事業 B/C を判定、全体 B/C を説明責任と分ける |

## 3. 本標準が採りうる選択肢と根拠の強さ

| 案 | 内容 | 根拠の強さ | 弱点 |
|---|---|---|---|
| 1 | 残る予算・期間を**中央値(P50)**の再予測と比べる | 慣行(IPA UK の AFC、NASA の資金下限) | 外れる確率 50% を黙って受け入れる。Flyvbjerg は「ポートフォリオで相殺できるときだけ」とする。継続の偏りと楽観バイアスが重なる |
| 2 | **高い分位点(P80〜P85)**の再予測と比べる | 慣行(DfT 80%、Kanban 85% の例、NASA 70%)。的中率の事後検証は単一組織のみ(ASOS) | 偽の中止(本当は到達できた)が増える。小規模チームでは分布を作るデータが乏しい |
| 3 | **幅の両端で三分する**: 楽観側でも届かない → 中止または再計画、悲観側でも届く → 継続、閾値が幅の中 → 決定者が判断し理由を記録 | 慣行・一次の明文(IPA UK 7.8) | 中間帯の判断が人に残る(ただし記録は残る)。幅が狭すぎると機能しない(Grattan の指摘) |
| 4 | 使う分位点を**案件ごとに事前に決め、理由を記録する**(追加資金の有無・ポートフォリオの大きさで選ぶ) | 慣行(Flyvbjerg 2006 の選択規則、AACE の「標準なし」、10 USC 2334 の開示) | 決め方が人に依存。事前固定を怠ると事後に都合のよい値を選ぶ |
| 5 | 分位点ではなく**基準からの超過率**(通知の閾値と中止審査の閾値の2段)で引き金を引く | 法令の慣行(51 U.S.C. §30104: 15%/6か月で通知、30% で継続に上位の承認)、PRINCE2 の許容幅 | 基準値そのものの確度を問わない。閾値の数値は文脈依存で、本標準へ転用する実証はない |
| 共通 | 判定規則(比べる値・閾値)を**フィードバックの前に**数値で決め、判定者を当初の推進者と分ける | 実証(実験室): Simonson & Staw 1992、Lee/Keil/Kasi 2012。実組織での検証は条件付き | 実験室中心。実組織での効果量は不明 |

- 予算の上限を示す値と中止判定の値を分ける作法: **ある**。NASA(Management Baseline = 渡す予算 / Commitment Baseline = 70% JCL / 中止の引き金 = +30%)、Green Book(中央推計 / 準備金は中央保持)、豪州(P50 と P90 の併記)、IPA UK(AFC = P50 / ゲートでは幅全体を閾値と比べる)。ただし「中止判定に使う分位点」を一つに定めた一次資料は見つからなかった
- 案は排他ではない。3 + 4 + 共通、または 5 + 共通の組み合わせがありうる

## 4. 要点

1. 計画・管理の値は P50(中央値)、外部への約束・資金枠は P70〜P90、という**二層の分離**は複数の一次資料で確立している(IPA UK、NASA、Green Book、豪州)
2. 中止・継続の判定で**単一の分位点と比べよ**と定めた一次資料は見つからない。最も直接の一次資料は IPA UK Cost Estimating Guidance 7.8 で、**楽観〜悲観の幅全体**を閾値と比べ、閾値が幅の中なら決定者が決める
3. 米国 NASA の法定の中止の引き金は分位点ではなく**基準からの超過率**(15% / 6 か月で通知、30% 超で議会の承認なしには終了費用以外を支出できない)
4. 分位点の選択規則を示すのは Flyvbjerg 2006: 資金の融通が利くポートフォリオなら P50、追加資金のない単独事業なら P80〜90。AACE は標準値を定めない
5. ソフトウェアの流れの予測(Kanban の SLE、Monte Carlo)は 85% が慣行だが、ガイドでは例示にすぎず、検証は単一組織
6. 継続の偏り(サンクコスト・リスク認知)は実験で確かめられている。処方は「事前に数値で決めた最低目標」「決定者の分離」「過程による評価」であり、分位点の指定ではない
7. 楽観バイアスは非対称(超過のほうが起きやすい)。判定で P50 以下を到達可能の根拠にすると偏りが重なる — これは推論であり直接の実証はない(根拠水準マークの対象)
8. 日本の公共事業の再評価は「事業進捗の見込み」と残事業 B/C で継続・中止を決め、既投資を判定から外す。確率的な信頼水準の規定は見つからない
