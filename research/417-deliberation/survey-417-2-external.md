# #417 外部調査 2: 計画容量の単位・スループットに数える完了・見積と実績の対応

- 調査日: 2026-11-04(取得日はすべて同日)
- 担当: 外部調査(標準・枠組み・実務)
- 凡例: 〔一次〕原典を読んだ / 〔二次〕二次情報・要約・検索結果の抜粋 / 〔未〕原典を読めていない
- 根拠の強さ: 【実証】査読研究・計測データ / 【慣行】枠組みの規定・ツールの仕様・広い実務 / 【意見】個人・ベンダー・実務家の主張
- 本メモは調査であり、条項案ではない。採否は会議体で決める(コアポリシー)

---

## 問1 計画容量の単位

### 1.1 枠組みごとの立場

| 枠組み | 容量・配分の単位 | 根拠の所在 | 確度 |
|---|---|---|---|
| DSDM(MoSCoW) | **effort(提供に要する工数)**。Must は「典型的に Must の effort が 60% 以下」、Could は「典型的に約 20%」。件数ではない | Agile Business Consortium "MoSCoW Prioritisation"。原文 "(in terms of effort to deliver)" | 〔一次〕【慣行】 |
| DSDM の 60% を超えてよい条件 | 次の**すべて**が真のとき: 見積が正確と分かっている / 進め方がよく理解されている / チームが performing(Tuckman)/ 環境が理解され外部要因の遅延リスクが低い。満たさないと 60% 超は「失敗のリスクをもたらす」 | 同上 | 〔一次〕【慣行】 |
| Scrum Guide 2020 | **単位を定めない**。「過去の実績、今後の容量、完成の定義を知るほど予測に自信が持てる」。velocity・story point・estimate の語は無い。リファインメントで「size」を加えるとだけ書く。予測手法は burn-down・burn-up・累積フロー図を例示 | scrumguides.org | 〔一次〕【慣行】 |
| Kanban Guide(2025.5 版) | 容量の語を持たない。**Throughput = 単位時間あたりに finished となった作業項目の数**。「throughput の測定は作業項目の正確な件数」 | kanbanguides.org | 〔一次〕【慣行】 |
| Vacanti『Actionable Agile Metrics for Predictability』10周年版 | Throughput = 「単位時間あたりに完了した WIP の量(作業項目の件数)」。velocity(points/iteration)とは**同義でない**と明言。予測に WIP を story point や理想時間で見積る必要はないと主張 | Leanpub 公開サンプル PDF(本文を抽出して確認) | 〔一次〕【意見〜慣行】 |
| SAFe | 反復計画は「チームの容量と過去の velocity」に基づく(2026-03-18 更新の Iteration Planning)。**「開発者1人あたり2週間で 8 点、休暇1日で 1 点減」の正規化**は公式記事の現行本文では確認できず、二次情報(wibas、試験対策サイト)では「最初の反復の起点としてのみ使う」と解されている | framework.scaledagile.com/iteration-planning/ 〔一次〕/ wibas 〔二次〕 | 【慣行】 |
| PMBOK 第7版 | 測定パフォーマンス領域で velocity・throughput・story point(相対見積)を道具として扱う、と要約される。本文未確認 | 二次(試験対策教材) | 〔未〕【慣行】 |
| ISO/IEC/IEEE 16326:2019 | 6.8 測定プロセス、7.7 プロジェクト計画(7.7.3 作業計画)、7.10.8 測定の節が存在することまで目次で確認。**見積の単位を規定する文言は確認できず** | iteh 公開プレビュー(目次のみ) | 〔未〕 |
| ISO/IEC/IEEE 12207 | プロジェクト計画プロセスで「作業量・資源の見積」を要求することは周知だが、本調査では原文を再確認していない | — | 〔未〕 |
| IPA/SEC | 見積の基本は**規模(FP・SLOC)→工数→工期**。前提と算出根拠を明確にし、再現性を確保し、複数の方法で確かめる。ソフトウェア開発データ白書は規模・工数の実績を数千件規模で収集(2016-2017 年版で 3,541 件) | IPA 白書 PDF、「ソフトウェア開発見積りの基本的な考え方」紹介記事 | 〔二次〕【慣行・実証(記述統計)】 |
| CMMI V2.0 | EST(見積)は規模・工数・期間・コストを見積る。見積モデルを過去データで校正・更新。MPM 1.1「測定値を集め、実績を記録する」 | 二次(抜粋・クロスウォーク) | 〔二次〕【慣行】 |
| Linear(ツール) | Capacity = **直近3サイクルの velocity**から算出(velocity は「完了した issue 数または estimate 点数」)。完了サイクルが無いときはメンバー数から概算 | linear.app/docs/use-cycles | 〔一次〕【慣行】 |

### 1.2 「件数で予測する」立場の根拠

- Vacanti・Magennis・ProKanban: スループット(件数)を Monte Carlo にかけて「いつ終わるか/いくつ終わるか」を確率で出す。項目の大きさをそろえる要求は無いが、**ばらつきが大きいと予測は広がる**(Vacanti は「同じ大きさである必要はない」と主張)。【意見〜慣行】
- 実務家の報告: ThoughtWorks と Nader Talai は「件数でも story point でも同程度の予測可能性」、Ian Carroll は 25 チームで story point とリードタイムの相関が低いと報告(Battiston & Young『Team Guide to Metrics for Business Decisions』経由)。〔二次〕【実証(非査読・小規模)】
- Vasco Duarte(#NoEstimates): 件数の方が story point より予測が当たったと主張。初出の 2012 年のブログは**単一プロジェクト**。書籍の約 2,000 件という数は二次情報で、表を確認できていない。Allan Kelly は「両者は強く相関するので差が出ないだけ」と批判。〔二次〕【意見】
- 査読研究で「件数予測 対 story point 予測」の精度を直接比べたものは本調査では**見つからなかった**。

### 1.3 「工数(effort)で配分する」立場の根拠

- DSDM の 60% は**工数比**である。60% という数自体の実証研究は見つからない(コンソーシアムも「典型的に」「ガイドライン」と書く)。【慣行】
- 見積誤差の研究: Jørgensen(IEEE Software 2014)「平均の超過は約 30%、1980 年代から精度はあまり変わっていない」。Moløkken & Jørgensen の調査レビューでは 60〜80% のプロジェクトが工数か工期を超過。〔二次(抄録)〕【実証】
  - 含意: 工数で 60% と置いても、その工数が平均 30% 外れるなら、工数比の上限は「見積の不確かさを吸収する緩衝」として働く。DSDM の 40% の余白はこの誤差の水準と整合する(**整合するというのは本メモの解釈であり、DSDM がそう述べているわけではない**)。

### 1.4 AI エージェントが実装を担うとき(2025〜2026 年時点)

- METR の RCT(2025-07、arXiv 2507.09089): 熟練 OSS 開発者 16 名・246 タスク。AI 使用時は **19% 遅く**、本人の事前予測は 24% 速くなるだった。**体感と実測が逆向き**であることが要点。初期 2025 年の道具での結果で、学習効果の可能性を著者が留保。〔二次(報道・要約)、原典 arXiv は未読〕【実証】
- METR の time horizon: AI が 50% の確率で完了できるタスクの長さを「熟練者が要する時間」で測り、約7か月で倍増と報告(2025)。2026-01 の TH 1.1 で更新。**タスクの大きさの尺度として、AI の実行時間ではなく人の時間を使っている**点が本問に関係する。〔二次〕【実証(ベンチマーク)】
- DORA 2025(約 5,000 人): AI 採用はスループット向上と関係するが、不安定性(instability)も増す。「AI は増幅器」。〔二次〕【実証(調査)】
- 実務の論調(2026): 「人のレビュー・監督の時間が律速となり、容量はそちらで見積る」(Augment Code のガイド)、「story point は捨てずに再校正し、コーディングとデリバリーの工数を分ける」(実務家ブログ)、「AI に確約を決めさせない」。いずれもベンダー・実務家の主張で、実証は無い。〔二次〕【意見】

### 1.5 本標準が採りうる選択肢

| 案 | 内容 | 根拠の強さ | 弱点 |
|---|---|---|---|
| A 工数比 | 確約範囲の上限を「見積工数の合計 ÷ 容量(人の時間)」で測る。DSDM に忠実 | 【慣行】(DSDM・IPA・CMMI・PSP の系譜) | 見積誤差が平均 30%。AI 実装では「誰の工数か」が崩れる |
| B 件数比 | 「確約に入れた件数 ÷ 過去のスループット(件数)」で測る | 【慣行】(Kanban・Vacanti・Linear)、精度比較の実証は非査読のみ | DSDM の 60% は工数比なので、**60% を件数比へそのまま持ち込むのは出典の誤用**になる。大きさのばらつきに弱い |
| C 人の律速資源で測る | 容量を「人が判断・レビューに使える時間」で測り、AI の実行は容量に数えない | 【意見】(2026 の実務論)+ METR の「体感は当てにならない」【実証】 | 定量の実証が無い。根拠水準マーク(ADR-0026)が要る |
| D 単位を定めず、記録だけ求める | Scrum Guide のように単位を規定せず、どの単位で測ったかの記名を求める | 【慣行】(Scrum Guide) | 60% のような数を課すなら単位なしでは判定できない |

- 本メモの観察: **「60%」と「件数」を組み合わせると、どの出典にも支えられない**。60% を残すなら単位は工数、件数を採るなら 60% の出典は DSDM ではなくなる(新たな値としての根拠開示が要る)。

---

## 問2 スループットに数える完了の定義

### 2.1 枠組みの定義

| 出典 | 定義・扱い | 確度 |
|---|---|---|
| Kanban Guide 2025.5 | Throughput = finished な作業項目の件数。**finished は各チームの Definition of Workflow(DoW)で決める**。「作業項目によっては started・finished の点が複数あってよい」 | 〔一次〕【慣行】 |
| Vacanti(AAMFP 10周年版) | Throughput = 完了した件数。Little の法則の前提2「始めた作業はすべて最終的に完了してシステムを出る」。放棄は「通常は例外」とし、**正常に終わらなかった項目(放棄)にタグを付けて分けて見る**ことを勧める(放棄だけを表示すると無駄にした時間が見える) | 〔一次〕【意見〜慣行】 |
| Andy Carmichael(2015 ブログ) | **Delivery Rate**(complete で出た率)と **Throughput**(破棄・完了を問わず出た率)を分けるべきと提案。Vacanti の語用を受けた議論 | 〔一次(ブログ)〕【意見】 |
| Flow Framework / Planview Viz | Flow Velocity = 種類ごとの完了 flow item の件数(throughput とも呼ぶ)。別ページでは「完了 − 再オープン」。Viz は道具の状態を flow state へ写像し、**Canceled を独立の flow state として持つ**。Canceled Work Insights で完了と取り下げの比を別に出す。Done/Canceled に達した後に範囲外にされた項目も Flow Velocity に数え続ける、と FAQ にある(取り下げそのものを velocity に含めるかは文面からは断定できない) | 〔一次(製品文書)〕【慣行】 |
| Kersten『Project to Product』 | 原典の定義文は未確認 | 〔未〕 |
| DORA | 4指標(デプロイ頻度・変更のリードタイム・変更失敗率・復旧時間)は**デプロイ単位**で、issue の完了件数を数えない。本問の直接の答えにはならない | 【慣行】 |
| SPACE(Forsgren ほか 2021) | 単一の指標では測れない。活動量(コミット数・PR 数など)だけに寄ると意図しない行動変化を招く(InfoQ でのインタビュー)。少なくとも3次元を使う(二次) | 〔二次(ACM Queue は 403 で未読)〕【意見(研究者)】 |

### 2.2 ツールの仕様

| ツール | 仕様 | 確度 |
|---|---|---|
| GitHub Issues | 2022-05-19 に close の理由「complete(既定)」と「not planned」を導入、`reason:"not planned"` で絞れる。2024-12-12 に「Close as duplicate」を追加(重複先を選び、タイムラインに表示)。REST の `state_reason` は `completed` / `not_planned` / `duplicate` / `reopened` / `null`、状態を変えないときは無視される。GraphQL では `duplicate` を返させるのに `enableDuplicate: true` が要る(二次) | 〔一次〕(changelog・REST 文書)【慣行】 |
| GitHub の注意 | **既定が completed**なので、理由を選ばずに閉じたものは完了として記録される。2022-05 より前に閉じた issue は理由を持たない | 〔一次〕からの推論 |
| Jira | velocity・スプリントレポートは**ボードの最右列に写像された状態**で完了を数え、resolution(Won't Do・Duplicate など)は数え方に効かない、とコミュニティ回答。除外には状態の分離か point の消去が要る | 〔二次(Atlassian Community)〕【慣行】 |
| Linear | canceled は独立の状態型。cooldown 中に canceled にした issue は次サイクルへ持ち越さない。Insights の既定は completed のみを数える、と二次情報 | 〔一次(cycle 文書)/二次(Insights)〕【慣行】 |

### 2.3 立場の対立

1. **除外派(主流)**: 完了 = 価値を届けた項目。取り下げ・重複は数えない。Kanban Guide の "finished" と DoW、Linear Insights の既定、Jira 利用者の除外要望、Scrum.org の実務記事(二次)がこの読み方。【慣行】
2. **出口派**: システムを出たものはすべて数える(Carmichael の Throughput、Little の法則の整合)。そのかわり完了と破棄を別の率として出す。【意見】
3. **共通点**: どちらも**完了と取り下げを区別して記録する**ことは一致する。不一致は「どちらを予測の母数にするか」だけ。

- 計画外(確約外から差し込まれた)項目の扱い: どの一次資料も「スループットから除く」とは書いていない。Kanban・Vacanti の定義は**完了した件数**であって、計画の内外を問わない。計画外を分けるのは「確約の達成率」の側の話で、スループットの定義とは別物として扱われている(本メモの整理)。
- 重複: GitHub が 2024-12 に not planned から分けたことは、重複を「計画しなかった」とも「完了」とも数えない第3の理由として扱う実務の現れ。

### 2.4 本標準が採りうる選択肢

| 案 | 内容 | 根拠の強さ |
|---|---|---|
| A completed のみ数える | 取り下げ・重複を除く。計画外の完了は数える | 【慣行】(Kanban の finished、Linear 既定) |
| B 出口をすべて数え、内訳を併記 | 完了率と破棄率を分ける | 【意見】(Carmichael)。予測には使いにくい |
| C 完了の理由の記録を必須にし、数え方は DoW で宣言 | Kanban Guide 型。GitHub の既定 completed の罠を塞ぐため、理由の選択を求める | 【慣行】(Kanban Guide・GitHub の仕様) |

- 本メモの観察: GitHub の既定が completed である以上、**A を課しても close の理由を記録させなければ A は成り立たない**。A と C は対立せず、C は A の前提になる。
- 計画外を除くかは、スループット(予測の母数)と確約の達成率(約束の信頼性)のどちらの話かを分けないと決められない。

---

## 問3 見積と実績の対応の記録

### 3.1 既存の作法

| 出典 | 作法 | 確度 |
|---|---|---|
| PSP(Humphrey 1995)/PROBE | 時間記録ログ(開始・終了・中断時間・正味時間)を工程ごとに付け、過去の「代理規模→実績時間」の回帰で次を見積る。見積精度と予測区間を計算する | 〔二次〕(Wikipedia・SEI の PSP 教材の抜粋)。SEI TR(DTIC)は 403 で〔未〕【慣行】 |
| PSP の自己記録の品質 | Johnson & Disney(IEEE Software 1998、Empirical SE 1999)が PSP の手記録データの誤りを分析した。結論の具体は未確認 | 〔未〕(書誌のみ確認)【実証】 |
| CMMI V2.0 | 見積モデルを過去データで校正し、データが増えたら更新(EST)。測定値を集め実績を記録(MPM 1.1)。組織の測定リポジトリを使う(EST 3.2・MPM 3.4) | 〔二次〕【慣行】 |
| IPA/SEC | 前提と算出根拠を明確にしないと妥当性の確認も再見積もできない。精度は実績÷見積で見る。白書の分析データ集 2022 では、コスト実績が計画±10% 未満に収まったのは 1,308 件中 998 件(76.3%)(二次) | 〔二次〕【慣行・実証(記述統計)】 |
| Jørgensen(IEEE Software 2014 の要約) | 局所に合わせた単純なモデルを専門家見積と組み合わせる。**過去の見積誤差を使って最小〜最大の幅を決める**。最小〜最大の幅は狭すぎる傾向 | 〔二次(抄録・AcaWiki)〕【実証(レビュー)】 |
| Jørgensen(2007 レビュー、16 研究) | 専門家見積の平均精度はモデルより高い研究が 16 中 10。組織に校正されていないモデルは不利 | 〔一次(本文抽出)〕【実証】 |
| Jørgensen & Gruschke(IEEE TSE 2009) | 20 名の無作為割付で、タスクごとの**振り返り(lessons-learned)をしても見積精度も不確かさの見積も改善しなかった**。追試(83 名)では、自分の見積の成績より**他者の見積の成績をフィードバックされた方が**不確かさの評価が現実的になった | 〔二次(抄録)〕【実証】 |
| Halkjelsvik & Jørgensen(Psychological Bulletin 2012) | 作業時間の予測(工数)と完了日の予測(納期)を区別すべきと指摘 | 〔二次(抄録)〕【実証(レビュー)】 |

### 3.2 実績の時間を記録させる弊害

- Austin『Measuring and Managing Performance in Organizations』(1996): 測定を**情報目的**と**動機づけ目的**に分け、動機づけに使うと人は「文字どおりには満たすが趣旨は満たさない」行動を取る(測定の機能不全)。〔二次(書評)〕【意見(理論)】
- Goodhart の法則: 指標が目標になると指標として機能しなくなる。【意見(通説)】
- 電子的な業績監視のメタ分析: Ravid ほか(Personnel Psychology 2023、94 標本・N=23,461)は**監視が業績を改善する証拠は無い**とした。Siegel・König・Lazar(2022)は業績との相関 r=−0.01、非生産的行動と r=0.09、満足度をわずかに下げる。〔二次(抄録)〕【実証】
- SPACE: 活動量指標だけに寄ると意図しない行動変化を招く。〔二次〕【意見(研究者)】
- PSP 側の反論: 自己記録は本人の見積改善のための**個人の道具**であり、管理者の評価には使わない前提(Humphrey の設計思想として広く紹介される)。〔未〕【慣行】

### 3.3 AI が実装する時代の「人の時間」と「AI の実行」

- METR の RCT では、AI 使用時の**人の体感の速さと実測が逆**だった。人の申告による時間記録は AI 利用時に特に偏る可能性がある。【実証(単一研究)】
- METR の time horizon はタスクの大きさを「熟練者の所要時間」で測る。AI の実行時間(壁時計・トークン)と、人が判断・レビューに使う時間は別の量として扱われている。【実証(ベンチマーク)】
- 実務(2026): 容量の律速を人のレビュー・監督に置き、AI の生成量とは独立に扱う論が多い。【意見】
- 自動で取れる量(AI のセッション時間、PR の作成から merge までの時間)は記録の手間も申告の偏りも無いが、**人の時間ではない**。人の時間は申告に頼る限り、上の弊害を伴う。

### 3.4 本標準が採りうる選択肢

| 案 | 内容 | 根拠の強さ | 弱点 |
|---|---|---|---|
| A 人の実績時間を作業ごとに記録 | PSP・CMMI・IPA 型。予実比で目安を校正 | 【慣行】 | 監視・機能不全の懸念【実証】。手記録の誤り(Johnson & Disney)。AI 利用時の申告の偏り |
| B 見積と、完了までの経過(自動で取れる量)を対応づける | 着手〜完了の経過時間・サイクルタイムを記録し、見積との対応を見る。人の時間は取らない | 【慣行】(Kanban・Vacanti のサイクルタイム) | 経過時間は工数ではない。「8 時間の目安」の妥当性を直接は確かめられない |
| C 区分で記録 | 見積の当否を「目安内/超過/大幅超過」の区分で完了時に記名させ、時間は取らない | 【意見】 | 区分の境界に根拠が要る |
| D 記録を目安の校正にだけ使い、個人評価へ使わないと明記 | Austin の情報目的。A〜C のどれとも組み合わせる | 【意見(理論)】+ 監視のメタ分析【実証】 | 宣言だけでは守られない |
| E 人の時間と AI の実行を別の欄に分ける | AI の実行は自動記録、人の判断・レビューは別に扱う | 【意見】+ METR【実証】 | 2026 時点で確立した作法は無い |

- 本メモの観察: Jørgensen & Gruschke(2009)は「自分の予実を振り返るだけでは見積は良くならない」ことを示す。**予実を記録すること自体は目安の妥当性を保証しない**。過去の誤差を幅(区間)へ反映させる使い方(Jørgensen 2014)の方が実証に近い。

---

## 要点

1. **DSDM の 60% は工数比**(「effort to deliver」)で、件数比ではない。60% を件数で運用するなら、DSDM を出典にできない。60% そのものに実証は無い(「典型的に」)。
2. Scrum Guide 2020 は単位を定めない。Kanban Guide・Vacanti は**件数**(スループット)を使い、story point と区別する。件数と point の予測精度の比較は非査読の報告しか無い。
3. 見積は平均約 30% 超過する(Jørgensen)【実証】。工数の上限は誤差の緩衝として読める。
4. AI 実装下の容量は「人のレビュー・判断の時間」を律速に置く論が多いが【意見】、METR の RCT は人の体感が実測と逆向きになることを示した【実証】。
5. Kanban Guide は finished を DoW に委ねる。主流の読み方は取り下げ・重複を除くことで、Vacanti も放棄を分けて見ることを勧める。計画外の完了を除く根拠は一次資料に無い。
6. GitHub は close の理由を completed(**既定**)・not_planned・duplicate(2024-12〜)で持つ。理由の記録を求めない限り、除外の規則は効かない。Jira は resolution では数え方が変わらない(二次)。
7. PSP・CMMI・IPA は実績を記録して見積を校正する系譜【慣行】。ただし振り返りだけでは見積は改善しない(Jørgensen & Gruschke 2009)【実証】。過去の誤差を幅に反映させる方が実証に近い。
8. 実績時間の記録は、監視が業績を改善しない(Ravid 2023 ほか)【実証】・測定の機能不全(Austin)【意見】の懸念を伴う。記録の目的を目安の校正に限ると明記する案がある。

## 出典(取得日はすべて 2026-11-04)

- Agile Business Consortium, MoSCoW Prioritisation: https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html 〔一次〕
- Scrum Guide 2020: https://scrumguides.org/scrum-guide.html 〔一次〕
- The Kanban Guide v2025.5: https://kanbanguides.org/english/ 〔一次〕
- Vacanti, Actionable Agile Metrics for Predictability 10th Anniversary sample: https://s3.amazonaws.com/samples.leanpub.com/aamfp-10th-sample.pdf 〔一次(サンプル範囲)〕
- SAFe Iteration Planning(2026-03-18 更新): https://framework.scaledagile.com/iteration-planning/ 〔一次〕
- wibas, A tricky slide about story points and capacity in SAFe: https://www.wibas.com/en/blog/articles-1/a-tricky-slide-about-story-points-and-capacity-in-safe-r-and-how-to-get-it-right-344 〔二次〕
- ISO/IEC/IEEE 16326:2019 preview: https://cdn.standards.iteh.ai/samples/75276/71cc99bccfa54c96a89b31e2d0dbab5a/ISO-IEC-IEEE-16326-2019.pdf 〔一次(目次のみ)〕
- Linear, Cycles: https://linear.app/docs/use-cycles 〔一次〕
- GitHub changelog 2022-05-19: https://github.blog/changelog/2022-05-19-the-new-github-issues-may-19th-update/ 〔一次〕
- GitHub changelog 2024-12-12(Close as duplicate): https://github.blog/changelog/2024-12-12-github-issues-projects-close-issue-as-a-duplicate-rest-api-for-sub-issues-and-more/ 〔一次〕
- GitHub REST API, Issues: https://docs.github.com/en/rest/issues/issues 〔一次〕
- Planview Viz, Flow Metrics / Canceled Work Insights / descoped artifacts FAQ: https://success.planview.com/Planview_Viz/Getting_Started/030Flow_Metrics , https://success.planview.com/Planview_Viz/Getting_Started/Managing_your_Portfolio/Executive_Insights/Canceled_Work_Insights , https://success.planview.com/Planview_Viz/FAQs/General/What_do_I_need_to_know_about_descoped_artifacts_in_Viz%3F 〔一次(製品文書)〕
- Atlassian Community(resolution と velocity): https://community.atlassian.com/t5/Jira-questions/How-to-exclude-issues-with-Resolution-of-Duplicate-Won-t-Do-from/qaq-p/1853501 〔二次〕
- Carmichael, Postscript on Throughput and Delivery Rate(2015): https://xprocess.blogspot.com/2015/07/postscript-on-throughput-and-delivery.html 〔一次(ブログ)〕
- Battiston & Young, Team Guide to Metrics for Business Decisions, Throughput 章: https://leanpub.com/read/metricsforbusinessdecisions/leanpub-auto-throughput-how-fast-are-we-going 〔二次〕
- Duarte, A better way to predict project release(2012): https://softwaredevelopmenttoday.blogspot.com/2012/07/a-better-way-to-predict-project-release.html 〔二次(検索要約)〕/ Allan Kelly の批判: https://www.allankelly.net/archives/683/story-points-2-of-4-duarte-arguments/ 〔二次〕
- Magennis, Forecasting using Data(Agile 2016): https://www.hanssamios.com/dokuwiki/_media/forecasting_using_data_-_troy_magennis_agile_2016_.pdf 〔未〕
- Jørgensen, Forecasting of Software Development Work Effort(2007): https://cms.simula.no/sites/default/files/publications/Jorgensen.2007.2.pdf 〔一次(本文抽出)〕
- Jørgensen, What We Do and Don't Know about Software Development Effort Estimation, IEEE Software 31(2), 2014: https://www.simula.no/research/what-we-do-and-dont-know-about-software-development-effort-estimation 〔二次(抄録)〕
- Jørgensen & Gruschke, IEEE TSE 35(3), 2009: https://www.simula.no/research/impact-lessons-learned-sessions-effort-estimation-and-uncertainty-assessments 〔二次(抄録)〕
- Halkjelsvik & Jørgensen, Psychological Bulletin 138(2), 2012: https://www.simula.no/research/origami-software-development-review-studies-judgment-based-predictions-performance-time 〔二次(抄録)〕
- Proxy-based estimating(PROBE): https://en.wikipedia.org/wiki/Proxy-based_estimating 〔二次〕/ SEI PSP TR(DTIC): https://apps.dtic.mil/sti/html/tr/ADA387268/index.html 〔未(403)〕
- Johnson & Disney, A Critical Analysis of PSP Data Quality, Empirical SE 4, 1999: https://link.springer.com/article/10.1023/A:1009801218527 〔未〕
- CMMI V2.0 の EST・MPM(二次の抜粋): https://processgroup.com/benchmark-team-files-release/TPG-cmmi-V3-SVC-condensed-practices-v1.pdf 〔二次〕
- IPA/SEC ソフトウェア開発データ白書: https://www.ipa.go.jp/publish/wp-sd/cdk3vs0000006t4y-att/000072711.pdf 〔二次(検索要約)〕/ 見積りの基本的な考え方の紹介: https://www.issoh.co.jp/md/column/11019 〔二次〕
- METR, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity: https://arxiv.org/abs/2507.09089 〔未(報道・要約経由)〕
- METR time horizon(要約): https://muratbuffalo.blogspot.com/2026/03/measuring-ai-ability-to-complete-long.html 〔二次〕
- DORA 2025 State of AI-assisted Software Development: https://dora.dev/research/ai 〔二次(公式ページの要約)〕
- Forsgren ほか, The SPACE of Developer Productivity, ACM Queue 2021: https://queue.acm.org/detail.cfm?id=3454124 〔未(403)〕/ InfoQ: https://www.infoq.com/news/2021/03/space-developer-productivity 〔二次〕
- Ravid ほか, Personnel Psychology 76, 2023(EPM のメタ分析): https://www.econbiz.de/Record/a-meta-analysis-of-the-effects-of-electronic-performance-monitoring-on-work-outcomes/10014311126 〔二次(抄録)〕/ Siegel・König・Lazar 2022: https://scidok.sulb.uni-saarland.de/bitstream/20.500.11880/34042/1/1-s2.0-S2451958822000616-main.pdf 〔二次(抄録)〕
- Austin, Measuring and Managing Performance in Organizations(1996)の書評: https://codearcana.com/posts/2018/09/07/a-review-of-measuring-and-managing-performance-in-organizations.html 〔二次〕
- Augment Code, Engineering capacity planning with AI agents: https://www.augmentcode.com/guides/engineering-capacity-planning-with-ai-agents 〔二次・ベンダー〕

## 読めなかった・確かめられなかったもの

- PMBOK 第7版本文、ISO/IEC/IEEE 16326 の 6.8・7.7.3 本文、12207 の該当節、CMMI V2.0 公式本文、Kersten『Project to Product』の Flow Velocity 定義、SEI の PSP TR、ACM Queue の SPACE 論文、METR の arXiv 本文、Duarte の書籍の表
- SAFe の「1人あたり 8 点」は公式現行記事に見当たらない(過去版・研修資料にある可能性)
