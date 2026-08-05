# 調査メモ: Seeded Errors による自動化バイアス検知と、承認権限の一時制限・例外決裁（Issue #113 / #114）

- 調査日: 2026-08-05
- 対象 Issue:
  - #113「Seeded Errors（意図的バグ注入）による自動化バイアスの検知・測定」
  - #114「形骸化レビュー検知時の承認権限の一時制限と例外決裁」
- 目的: 欠陥注入によるレビュー能力測定の理論的裏付けと、検知後の処遇（訓練か制限か）・例外決裁の設計に必要な一次情報を収集する

## 0. 本メモの鮮度と読み方

- エージェント／AI レビューに関する記述は「YYYY-MM-DD 時点」を明記する。当該領域は 2026 年に入って急速に変化しているためである
- 事実と解釈を分離する。解釈は各節末または「考察」節に置く
- 出典の信頼度を区別する。一次情報（規格原文、査読論文、政府監査報告、公式ドキュメント）を優先し、二次情報はその旨を注記する
- **重要な限界**: 本調査は Web 検索・公開 PDF の取得に基づく。有料論文（IEEE TSE、Applied Ergonomics、ScienceDirect 収録論文の一部）は本文未取得であり、数値は要約経由を含む。原典での再確認が必要な箇所は「未確認」と明記する

---

## 1. 欠陥注入の理論的基盤

### 1.1 Mills の error seeding とキャプチャ・リキャプチャ（1972年〜）

ソフトウェア工学におけるキャプチャ・リキャプチャ（capture-recapture, CR）の最初の適用は Mills（1972年）とされます。既知個数の擬似欠陥（seeded faults）をコードへ注入し、テストで見つかった「擬似欠陥の数」と「本物の欠陥の数」の比から、残存欠陥総数を推定する手続きです。

- 基本形は生態学の Lincoln–Petersen 推定量の転用である
- 推定式（Mills 型）: 総欠陥数の推定値 ≒ （注入欠陥数 × 発見された本物欠陥数）÷ 発見された注入欠陥数
- 前提は「注入欠陥と本物欠陥の発見されやすさが等しい」ことである。この前提が崩れると推定は大きく偏る

批判・限界:

- CR 法はテスト終了判断に用いると残存バグ数を過大推定する、また終盤フェーズでは「残存欠陥と同等の難度の擬似欠陥」を十分な数だけ作れないため適用困難である、という批判が存在する（Journal of Systems and Software 掲載の批判論文、1998年）
- 一方でソフトウェアインスペクション分野では 10 年以上にわたり CR モデルの評価が積み重ねられ、モデル選択（M0/Mt/Mh/Mth）と推定誤差の実証比較が行われている（Petersson・Thelin・Runeson・Wohlin、JSS、2004年）

出典:
- Mills 由来の CR サンプリング（IEEE 論文）: https://ieeexplore.ieee.org/document/1702812
- CR 法への批判（ScienceDirect、1998年）: https://www.sciencedirect.com/science/article/abs/pii/S0164121298100171
- 「Capture–recapture in software inspections after 10 years research」（Wohlin ら、2004年、著者公開 PDF）: https://wohlin.eu/jss04-1.pdf
- CR モデルの包括評価（ResearchGate 経由）: https://www.researchgate.net/publication/3188084_A_Comprehensive_Evaluation_of_Capture-Recapture_Models_for_Estimating_Software_Defect_Content
- Mills' Error Seeding Model 解説（二次情報・教材サイト）: https://www.geeksforgeeks.org/software-engineering/software-engineering-mills-error-seeding-model/

**解釈（考察）**: 「注入欠陥の検出率から全体の検出能力を推定する統計的手続き」は 1972 年以来確立しており、式そのものは単純です。ただし成立条件（注入欠陥と実欠陥の等難度性）が現実にはほぼ満たされないため、**残存バグ数の絶対推定に使うのは危険**である一方、**同一集団の時系列比較（レビューの形骸化が進んでいないかのトレンド監視）には使える**、という使い分けが妥当と考えます。#113 は後者の用途に限定すべきです。

### 1.2 ミューテーションテストの理論（1978年〜）

DeMillo・Lipton・Sayward（1978年、"Hints on Test Data Selection: Help for the Practicing Programmer"）が二つの仮説を提示しました。

- **competent programmer hypothesis（有能なプログラマ仮説）**: プログラマは正解に「近い」プログラムを書く。残る欠陥は少数の単純な構文的差分で修正可能である
- **coupling effect（結合効果）**: 単純な誤りを検出できるテストは、それに結合したより複雑な誤りも検出する

実証状況:

- coupling effect は Offutt（1989年、1992年）、Langdon ら（2010年）の理論解析・実験で比較的強い支持がある
- competent programmer hypothesis は決着していない。Andrews らは「ミュータントは実バグに類似」と報告する一方、Gopinath らは「実バグはミュータントと有意に異なる」と報告している
- 2024年の研究（Ahmed ら、STVR）は「反復ミューテーションによる実バグ再現」という観点から同仮説を再検討している

出典:
- DeMillo ら 1978（ResearchGate 経由）: https://www.researchgate.net/publication/2957629_Hints_on_Test_Data_Selection_Help_for_the_Practicing_Programmer
- ミューテーションテストの発展のサーベイ（Jia & Harman、大学公開 PDF）: https://web.eecs.umich.edu/~weimerw/2022-481F/readings/mutation-testing.pdf
- Mutation Testing Repository（UCL CREST、理論整理）: http://crestweb.cs.ucl.ac.uk/resources/mutation_testing_repository/theory.php
- competent programmer hypothesis の再検討（Ahmed ら、STVR、2024年）: https://onlinelibrary.wiley.com/doi/full/10.1002/stvr.1874
- 同プレプリント（arXiv、2021年）: https://arxiv.org/pdf/2104.02517

**解釈（考察）**: ミューテーションテストは「テストスイートの検出能力」を測る道具として実務適用が進んでいます（人ではなく自動テストが対象）。#113 が測りたいのは「人（および AI）のレビュー検出能力」なので、注入欠陥の生成にミューテーション演算子を流用できますが、**演算子由来の欠陥はレビューで見つけやすい単純欠陥に偏る**恐れがあります。設計・仕様レベルの欠陥（省略誤り）を混ぜる必要があります。

### 1.3 テスト・インスペクション実験での seeded faults の使われ方

- Basili & Selby（IEEE TSE、SE-13(12), 1987年）は、コードリーディング（段階的抽象化）・機能テスト・構造テストの 3 手法を、プロ 32 名＋上級学生 42 名、4 プログラムの分割要因計画で比較した。評価軸は「欠陥検出有効性」「検出コスト」「検出できた欠陥クラス」の 3 つである
  - 注記: 各手法の具体的検出率と、欠陥クラス別の検出率差の数値は本メモでは**未確認**（原典未取得）
- Porter・Votta・Basili らの要求仕様インスペクション実験（IEEE TSE 21(6), 1995年ほか）では、シナリオ法・チェックリスト法・アドホック法を比較し、個人検出率／チーム検出率／会議での増分（meeting gain rate）／会議での損失（meeting loss rate）を測定した
  - 報告されている検出率の水準はチェックリスト法 36.5%、アドホック法 32.5% 程度（二次要約経由、**要原典確認**）
  - 重要な知見として、**検出率のばらつきの最大要因は「検出手法」ではなく「対象となった仕様書そのもの」**であったと報告されている

出典:
- Basili & Selby 1987（Semantic Scholar）: https://www.semanticscholar.org/paper/Comparing-the-Effectiveness-of-Software-Testing-Basili-Selby/3953558e92b1397c778cd450b4ca58da45932bcc
- Porter・Votta・Basili「Comparing Detection Methods for Software Requirements Inspections: A Replicated Experiment」（IEEE TSE 1995、ACM DL）: https://dl.acm.org/doi/abs/10.1109/32.391380
- 拡張再現実験（Empirical Software Engineering）: https://link.springer.com/article/10.1023/A:1009724120285
- インスペクションのばらつき要因分析（ACM TOSEM 1998）: https://dl.acm.org/doi/10.1145/268411.268421

**解釈（考察）**: 「検出率のばらつきの主因は対象物である」という知見は #113 の設計に直結します。**個人間比較（誰が見逃したか）よりも、同一難度の注入欠陥セットを固定して時系列で追う設計**でなければ、測定はノイズに埋もれます。

### 1.4 実運用コードへの欠陥注入の倫理的限界（2021年、必読の反面教師）

ミネソタ大学の研究者が Linux カーネルへ「一見有益に見えるが脆弱性を混入するパッチ（hypocrite commits）」を偽名で投稿し、メンテナのレビュー体制の脆弱性を実証しようとした事案があります（2020年8月〜2021年4月）。

- Linux 側は当該大学のメールドメインからの投稿を一括禁止（ban）とした
- 大学 CS&E 学科は当該研究ラインを即時停止すると声明した
- 争点は「非同意の被験者実験」であった。レビュアーの同意なしに欺瞞的な注入を行った点が問題視された

出典:
- ミネソタ大 CS&E 公式声明（2021-04-21）: https://cse.umn.edu/cs/statement-cse-linux-kernel-research-april-21-2021
- LKML 上の Breach-of-Trust 調査報告: https://lkml.iu.edu/hypermail/linux/kernel/2105.0/04009.html
- 同意の観点からの論評（Help Net Security、2021年）: https://www.helpnetsecurity.com/2021/05/19/understand-consent/

**解釈（考察）**: #113 を制度化する際、**「注入が行われうること」を事前に全員へ周知し同意を得る（=TIP 型の告知済み抜き打ち）**か、**外部コミュニティへ注入を流出させない技術的境界**を設けるかの、いずれかが必須です。無告知の注入は Linux 事案と同型のガバナンス事故になります。

---

## 2. 他分野の類似手法

### 2.1 航空保安検査の Threat Image Projection（TIP）

TIP は、実運用中の X 線画像に脅威物（銃・ナイフ・IED など）の画像を合成投影し、検査員が指摘できたかを記録する仕組みです。これは #113 の最も近い先行事例です。

事実:

- 投影頻度は監督者が設定可能なパラメータであり、EU 規則に「毎時 N 件」といった固定値がある事実は**確認できず（未確認）**
- TIP のヒット率は空港実測で約 88%、先行研究では約 90% とされる（Riz à Porta・Sterchi・Schwaninger、Sensors、2022年）
- 同研究は TIP 画像の品質問題を指摘する。**24% がアーティファクトあり、26% が非現実的なシナリオ**と評価され、およそ 1/3 が問題ありであった
- そのため「TIP のヒット率は実脅威に対するヒット率を過大評価しがち」と著者自身が明記している
- 一方、TIP 成績は隠密テスト（covert test）の成績を予測した（474 名の検査員による 1,184 回の隠密テスト）ため、TIP は検出性能の妥当な指標であると報告されている（2025年、ScienceDirect 掲載論文。掲載誌名は**未確認**）
- 同 2025年研究は**信頼性（reliability ≥ 0.7）を得るには約 100 回の TIP イベントが必要**であり、かつ TIP が十分難しい（平均ヒット率 0.9 未満）ことが条件であるとする

出典:
- 「How Realistic Is Threat Image Projection for X-ray Baggage Screening?」（Sensors、2022年、オープンアクセス）: https://pmc.ncbi.nlm.nih.gov/articles/PMC8952858/
- 「Reliability and validity of threat image projection data as a measure of performance in X-ray baggage screening」（2025年）: https://www.sciencedirect.com/science/article/pii/S096585642500268X
- TIP による保安性能向上（IEEE、2009年）: https://ieeexplore.ieee.org/document/5335565
- ベンダー実装例（Rapiscan、投影頻度が設定可能である旨の記載）: https://www.rapiscansystems.com/en/products/rapiscan-threat-image-projection
- 英国 CAA International による TIP 実装・分析研修コース（運用が制度化されている証左）: https://caainternational.com/course/threat-image-projection-implementation-analysis/

### 2.2 TSA の隠密テスト（covert testing）と公表の限界

- TSA は TIP とは別に、覆面テスターが実際の禁止物品を持ち込む隠密テストを実施している
- **隠密テストの検出率は機密（classified / Sensitive Security Information）であり公表されていない**。報道ベースで極端に低い合格率が伝えられたことがあるが、本調査では一次確認できず「**未確認**」とする
- GAO は「TIP を含むテストデータが不完全で、訓練・運用改善に十分活用されていない」と指摘した（GAO-16-704、2016年）
- GAO は隠密テストについて「改善したが、よりリスクベースのテストを増やし、判明した脆弱性へ対処すべき」と指摘した（GAO-19-374、2019年）
- DHS OIG も検問所の有効性に関する隠密テストを実施している（OIG-17-112、2017年）

出典:
- GAO-16-704「TSA Should Ensure Testing Data Are Complete and Fully Used to Improve Screener Training and Operations」: https://www.gao.gov/products/gao-16-704 ／ 本文 PDF: https://www.gao.gov/assets/680/679606.pdf
- GAO-19-374「TSA Improved Covert Testing but Needs to Conduct More Risk-Informed Tests」: https://www.gao.gov/products/gao-19-374 ／ 本文 PDF: https://www.gao.gov/assets/700/698987.pdf
- GAO-08-958（リスクベース隠密テストプログラムの評価、2008年）: https://www.gao.gov/assets/a279539.html
- DHS OIG-17-112（2017年9月）: https://www.oig.dhs.gov/reports/2017/covert-testing-tsas-screening-checkpoint-effectiveness/oig-17-112-sep17

**解釈（考察）**: GAO の指摘（データが訓練にフィードバックされていない）は、#113 が陥りやすい失敗そのものです。**測定して終わり**にせず、注入結果を「どのタイプの欠陥が見逃されたか」の分類とレビュー観点の改訂へ結びつける経路を規程に明記すべきです。

### 2.3 医療の proficiency testing（CLIA）— 「見逃したら権限を止める」制度の実例

米国の臨床検査規制 CLIA（42 CFR Part 493 Subpart H）は、外部から送られる既知検体（proficiency testing, PT）の判定成績で検査室の実施権限を制御します。#114 の「承認権限の一時制限」に最も近い法制度です。

- 非 waived 検査を行う検査室は、認定を受けた項目ごとに CMS 承認の PT プログラムへ**成功裏に参加する義務**を負う
- **unsuccessful participation の定義は「連続 2 回、または直近 3 回中 2 回の不合格」**である
- 該当した場合、当該項目・専門分野について**患者検体の検査を停止（cease testing）しなければならない**
- 復帰には**2 回の成功（successful performance for two events）が必要**である
- CMS は制裁（sanctions）を課し、Medicare/Medicaid の支払停止や、制裁対象検査室の年次レジストリ公表を行いうる（42 CFR 493.1840 ほか）

出典:
- eCFR 42 CFR Part 493 Subpart H（一次情報）: https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-493/subpart-H
- 42 CFR 493.1840（証明書の停止・制限・取消、Cornell LII）: https://www.law.cornell.edu/cfr/text/42/493.1840
- CLIA PT の実務解説（MLO、二次情報）: https://www.mlo-online.com/home/article/13005661/clia-requirements-for-proficiency-testing-the-basics-for-laboratory-professionals
- PT 規制の近年の改正動向（法律事務所解説、二次情報）: https://www.bassberry.com/news/clia-proficiency-testing/
- CMS/連邦官報による PT 規則改正（2022年）: https://www.federalregister.gov/documents/2022/07/11/2022-14513/clinical-laboratory-improvement-amendments-of-1988-clia-proficiency-testing-regulations-related-to

**設計上の学び（事実からの抽出）**:

- 単発の失敗では権限を止めない。**「連続 2 回 / 3 回中 2 回」という反復条件**でノイズを排除する
- 制限の対象は人ではなく**「項目（analyte）単位の実施権限」**である。全権剥奪ではなく範囲限定である
- **回復条件が事前に明文化**されている（2 回連続成功）。期間ではなく実績で戻る設計である

### 2.4 金融の不正検知テスト

- 本調査では、金融機関のトランザクション監視に対する「合成不正取引の注入テスト」に関する一次情報を確保できなかった。**未確認**（追加調査が必要）

---

## 3. セキュリティ分野の模擬フィッシング訓練（#113 の直接の先行事例）

### 3.1 大規模 RCT による効果の否定（2025年、査読済み）

Ho ら「Understanding the Efficacy of Phishing Training in Practice」（2025 IEEE Symposium on Security and Privacy、第 46 回、2025年5月）は、大規模医療機関での 8 か月・10 キャンペーンの無作為化実験を報告しました。

- 対象は **19,500 名超**の従業員、期間 8 か月、模擬フィッシング 10 キャンペーン
- **年次セキュリティ教育の受講歴と模擬フィッシング失敗率の間に有意な関係は見られなかった**
- 埋め込み型訓練（クリックした人にその場で教材を出す方式）の効果は統計的に有意だが**平均失敗率の低下はわずか 2%**であった
- 訓練教材への関与は低い。**75% のユーザーが 1 分以下**しか教材を見ず、**1/3 は内容を見ずに即座に閉じた**
- 累積では、初月のクリック率 10%、8 か月後には**50% 超が少なくとも 1 回クリック**した
- ルアー（誘い文句）依存が大きい。休暇ポリシー系 30.8% に対し、Outlook パスワード更新系は 1.82% であった
- 著者らの結論は「現在一般的に展開されている形の訓練プログラムは、フィッシングリスク低減の実用的価値をほとんど持たない可能性が高い」であり、**多要素認証やドメイン制約付きパスワードマネージャなど技術的対策への資源移転**を推奨する

出典:
- 論文 PDF（著者公開）: https://people.cs.uchicago.edu/~grantho/papers/oakland2025_phishing-training.pdf
- IEEE Xplore 収録: https://ieeexplore.ieee.org/document/11023357/
- UC San Diego 公式リリース（数値の出典として引用可）: https://today.ucsd.edu/story/cybersecurity-training-programs-dont-prevent-employees-from-falling-for-phishing-scams
- MIT CSAIL 講演告知（同研究）: https://www.csail.mit.edu/event/understanding-efficacy-phishing-training-practice

先行する大規模研究として Lain ら（2022年）も同様に効果が乏しいことを報告しているとされます（二次情報経由、**原典未取得**）。

### 3.2 訓練設計の代替案（2025年）

- MIS Quarterly（2025年）の研究は、埋め込み型フィードバックよりも**非埋め込み型（後日別途の）訓練**のほうが有望であるとする現場実験結果を報告している
  - 出典: https://misq.umn.edu/misq/article/doi/10.25300/MISQ/2025/19354/3629/Learning-by-Phishing-via-Post-Simulation-Feedback

### 3.3 懲罰的運用の副作用

- 「懲罰的プログラムは逆効果であり、報告を抑制し、士気を損ない、文化を侵食する」との指摘がベンダー系・専門メディアで繰り返されている（二次情報）
  - Proofpoint（ベンダー、二次）: https://www.proofpoint.com/us/blog/security-awareness-training/phishing-training-efficacy-maximize-simulation-learning
  - Expert Insights による Ho ら研究の解説（二次）: https://expertinsights.com/security-awareness-training/phishing-training-study-bh25
- 「報復を恐れることが報告を抑制する」という因果は、患者安全分野で実証的に議論されている（次節）

**解釈（考察）**: #113 の注入結果を個人の評価・懲罰へ結び付けると、**フィッシング訓練が辿った失敗（形式的通過・報告の抑制）を再現する**可能性が高いと考えます。注入は「レビュープロセスの健全性指標」であり、「レビュアーの成績表」ではない、という位置づけを規程冒頭に明記すべきです。

---

## 4. Just Culture（公正な文化）

### 4.1 3 分類とそれぞれへの対応

Just Culture は James Reason（1997年）の安全文化論に起源を持ち、David Marx により医療分野の実務モデルへ具体化されました。行動を 3 つに分類し、対応を変えます。

- **human error（ヒューマンエラー）**: 意図せず、あるべき行為と異なることをしてしまうこと。slip / lapse / mistake を含む → 対応は **console（慰め）とシステム改善**
- **at-risk behavior（リスクを取る行動）**: リスクを認識していない、またはリスクが正当化されると誤って信じて行動すること → 対応は **coach（動機づけ・是正コーチング）とインセンティブ設計の見直し**
- **reckless behavior（無謀な行動）**: 「実質的かつ正当化されないリスク」を認識しながら意識的に無視して行動すること → 対応は **discipline（懲戒）**

また、Just Culture は従業員の「3 つの義務」（成果を出す義務、他者を危険に晒さない義務、手順に従う義務）を前提としますが、本調査では 3 義務の正確な条文を一次資料で確認できず、内容は**一部未確認**です。

出典:
- ISMP「The differences between human error, at-risk behavior, and reckless behavior are key to a just culture」（ISMP Medication Safety Alert! Acute Care Edition, 2020年6月, 25(12)）／AHRQ PSNet 収録: https://psnet.ahrq.gov/issue/differences-between-human-error-risk-behavior-and-reckless-behavior-are-key-just-culture
- 米国退役軍人省 Just Culture Decision Support Tool（2022年、一次・公式ツール。PDF はテキスト抽出に失敗したため本文未確認）: https://patientsafety.va.gov/PATIENTSAFETY/docs/Just-Culture-Decision-Support-Tool-2022.pdf
- IHS 研修資料（Just Culture 概説、公的機関スライド）: https://www.ihs.gov/sites/telebehavioral/themes/responsive2017/display_objects/documents/slides/2016combinedcouncils/justculturencc16.pdf
- 3 行動分類の解説（EBSCO Research Starters、二次）: https://www.ebsco.com/research-starters/law/just-culture

### 4.2 懲罰と報告の関係

- Reason（1997年、"Managing the Risks of Organizational Accidents"）は、あらゆるエラーを罰する文化は報告を抑止し、結果として安全リスクの可視性を下げると論じた
- 患者安全分野では「エラーへの懲罰的対応が自発的な安全報告を有意に抑止し、組織の Just Culture への信頼を損なう」と報告されている

出典:
- 有害事象報告と Just Culture（Patient Safety Learning hub、二次）: https://www.pslhub.org/learn/culture/occupational-health-and-safety/adverse-event-reporting-and-patient-safety-the-role-of-a-just-culture-r12504/
- Just Culture 原則による報告促進（Patient Safety journal、査読誌）: https://patientsafetyj.com/article/137737-promoting-a-culture-of-patient-safety-using-the-principles-of-just-culture-to-improve-transparency-and-risk-reporting-in-the-hospital-setting
- 航空分野の Just Culture ロードマップ（EUROCONTROL/SKYbrary 収録、2018年頃。取得は 403 で失敗したため内容**未確認**）: https://skybrary.aero/sites/default/files/bookshelf/233.pdf
- 航空の Just Culture 概説（二次）: https://www.aviatorlegacies.com/post/james-reason-s-just-culture-enhancing-safety-reporting-in-aviation

補足として、EU の航空事象報告規則（Regulation (EU) 376/2014）が報告者保護と「故意の違反・重大な過失」を除外する枠組みを定めている点は広く知られていますが、本調査では EUR-Lex 本文の取得に失敗し、条文の正確な引用は**未確認**です（追加調査項目）。

**設計上の学び**: #113 で見逃しが検出された場合、まず「human error か at-risk か reckless か」を判別する意思決定木を規程に入れるべきです。**注入欠陥の見逃しの大半は human error か at-risk に該当し、懲戒対象になるのは「レビューしていないのに承認した（意図的な形骸化）」という reckless のみ**、という切り分けが Just Culture の帰結です。

---

## 5. 自動化バイアス・警戒水準の実証研究

### 5.1 自動化バイアスの測定

- Skitka・Mosier ら（1996年、1999年、2000年）は自動化バイアスを **omission error（自動化が示さなかった異常を見逃す）** と **commission error（他のより信頼できる情報に反するのに自動化の指示に従う）** の 2 種で測定した
- commission error は「情報を確認しない」ことと「自動化の判断が優れているという信念」の組み合わせで生じる
- **アカウンタビリティ（全体成績または判断正確性に対する説明責任）を課すと自動化バイアスが低下した**
- 近年の臨床研究では、自動化バイアスを「negative consultation の受容率（当初正しかった人間の判断が誤ったシステム出力で覆された割合）」で定量化する手法が用いられる

出典:
- Skitka・Mosier「Accountability and automation bias」（IJHCS、2000年）: https://www.sciencedirect.com/science/article/abs/pii/S107158199990349X ／ Semantic Scholar: https://www.semanticscholar.org/paper/Accountability-and-automation-bias-Skitka-Mosier/31bcf5e3fd797544d33651d2aad28e62769ac4c1
- Skitka ら「Does automation bias decision-making?」（1999年）: https://www.semanticscholar.org/paper/Does-automation-bias-decision-making-Skitka-Mosier/8580dc7ba0f0d7eb1c2495ceb23af9491a805849
- Mosier・Skitka ら「Automation Bias, Accountability, and Verification Behaviors」（HFES Proceedings、1996年）: https://journals.sagepub.com/doi/10.1177/154193129604000413
- LLM 支援診断における自動化バイアス（medRxiv、2025年8月）: https://www.medrxiv.org/content/10.1101/2025.08.23.25334280.full.pdf
- 行動ナッジによる自動化バイアス緩和の臨床試験プロトコル（ClinicalTrials.gov、2026年時点で登録）: https://cdn.clinicaltrials.gov/large-docs/15/NCT07328815/Prot_SAP_000.pdf

### 5.2 cry wolf 効果（誤警報による信頼低下）

- Breznitz（1984年、"Cry Wolf: The Psychology of False Alarms"）が、反復する誤警報が生理的・行動的な警戒低下を招くことを示した
- Bliss らは応答率低下（cry-wolf 効果）の逆転手法を検討し（1995年）、高負荷下で応答性能がさらに劣化すること、オペレータが**システムの信頼度に応答確率を合わせる（probability matching）**傾向を示した
- 航空管制の衝突警報でも cry wolf 効果が検証されている（Wickens ら、Human Factors、2009年）

出典:
- Breznitz 1984（Semantic Scholar）: https://www.semanticscholar.org/paper/Cry-Wolf:-The-Psychology-of-False-Alarms-Breznitz/3d3fe849069e172b8038c7239a6adb70bb316f17
- Bliss・Dunn・Fuller（1995年）: https://journals.sagepub.com/doi/abs/10.2466/pms.1995.80.3c.1231
- Bliss 博士論文「The Cry-Wolf Phenomenon and its Effect on Alarm Responses」: https://stars.library.ucf.edu/rtd/3614/
- Wickens ら（Human Factors、2009年）: https://journals.sagepub.com/doi/10.1177/0018720809344720
- 故障検知システムの警報疲労の定量化と緩和（Reliability Engineering & System Safety、2025年）: https://www.sciencedirect.com/science/article/abs/pii/S0951832025010907

### 5.3 低頻度（低有病率）効果 — 注入頻度設計の理論的根拠

- Wolfe・Horowitz・Kenner（Nature 435:439–440、2005年、"Rare items often missed in visual searches"）は、**ターゲット出現率 50% では見逃し率 0.07 だが、出現率 1% では 0.30 に跳ね上がる**ことを示した
- この劣化は速度・正確性のトレードオフではなく、**判断基準（criterion c）のシフト**であり、感度（d'）の低下ではないとされる（Wolfe ら、2007年）
- 現実の低有病率タスクでは見逃し率が極端に高くなりうる

出典:
- Wolfe ら 2005（PubMed）: https://pubmed.ncbi.nlm.nih.gov/15917795/
- 低有病率効果の頑健性（PMC オープンアクセス）: https://pmc.ncbi.nlm.nih.gov/articles/PMC2662480/
- 補正手法の検討（Van Wert・Horowitz・Wolfe、著者公開 PDF）: https://search.bwh.harvard.edu/new/pubs/VanWertEtAl_2ndChanceAP&PInPress.pdf
- 臨床への展開（Horowitz、Japanese Psychological Research、2017年）: https://onlinelibrary.wiley.com/doi/10.1111/jpr.12153

**解釈（考察）**: これは #113 の**最も強い理論的正当化**です。実欠陥の出現率が低い（＝AI 生成コードの品質が上がるほど低くなる）ほど、レビュアーの見逃し率は基準シフトによって急上昇します。**欠陥注入は「有病率を人為的に引き上げる介入」でもあり、測定装置であると同時に対策でもある**という二重の性格を持ちます。この論点は Issue 本文に明記する価値があります。

### 5.4 vigilance decrement と休憩の実効性

- EU の航空保安規則は、X 線画像の連続判読を 20 分に制限し、その後 10 分の休憩または他業務へのローテーションを求めている
- ただし、この 20 分制限は**明確な実証根拠に基づくものではない**と研究者が指摘している
- 60 分の X 線判読課題での実験では、休憩群・非休憩群とも 60 分にわたる成績低下が見られず、休憩は成績に影響しなかったが**主観的ストレスは低減**した

出典:
- 「Why stop after 20 minutes? Breaks and target prevalence in a 60-minute X-ray baggage screening task」（International Journal of Industrial Ergonomics、2019年頃）: https://www.sciencedirect.com/science/article/pii/S0169814118305845
- 「Time on task and task load in visual inspection: A four-month field study with X-ray baggage screeners」（Applied Ergonomics、2023年）: https://www.sciencedirect.com/science/article/pii/S0003687023000339
- 医療画像読影の疲労・警戒（PMC、2024年）: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10945845/

---

## 6. AI レビューにおける自動化バイアス（2026-08-05 時点）

**鮮度注記**: 以下は 2026-08-05 時点で確認できた情報です。この領域は数か月単位で変動します。

- 2026年2月時点の実験（arXiv:2602.16741、著者 Scott Thornton）は、Python/JavaScript/Java の脆弱コード 100 検体 × 8 コメント変種 × 8 モデルの計 14,012 評価を行った
  - コメントなし基線の検出率は商用モデルで 89.0〜96.1%（Claude Opus 4.6 が 95.0%、GPT-5.2 が 93.0%）、オープンソースモデルで 53.0〜72.0% と、**20〜40 ポイントの差**があった
  - 権威詐称・注意散漫化などの敵対的コメントによる検出率変化は -5%〜+4% で、全モデルで統計的に有意でなかった（McNemar 検定 p>0.21）
  - 著者の結論は「AI コードレビューの真の弱点は敵対的コメントではなく、レース条件・タイミング攻撃・複雑な認可ロジックといった**本質的に難しい脆弱性パターン**である」
  - 出典: https://arxiv.org/html/2602.16741v1
- 「Measuring and Exploiting Contextual Bias in LLM-Assisted Security Code Review」（arXiv:2603.18740、2026年3月）: 自然言語文脈がコード意味論を凌駕しうることを示す
  - 出典: https://arxiv.org/pdf/2603.18740
- 「Are LLMs reliable code reviewers? systematic overcorrection in requirement conformance judgement」（Automated Software Engineering、2026年）: 正しい実装を誤って却下する偽陰性率と、バグのある実装を受容する偽陽性率という**双方向のバイアス**を特徴づける
  - 出典: https://link.springer.com/article/10.1007/s10515-026-00638-5
- 実務でのボット導入研究（arXiv:2412.18531、2024年12月）は、「他に問題があればボットが指摘したはず」という思い込みにより開発者が他の問題を見落とす**過依存リスク**を指摘する
  - 出典: https://arxiv.org/pdf/2412.18531
- 視線計測研究では、AI 生成コードに対する視覚的注意が減少し、検査品質を損なう過信の可能性が示唆される（上記ロードマップ論文等で言及、**原典未特定**）
- エージェント PR に対するレビューボットの挙動（arXiv:2604.24450、2026年4月）: https://arxiv.org/pdf/2604.24450

**解釈（考察）**: 2026-08-05 時点で、AI レビュアーの検出率にはモデル間で 40 ポイント級の差があり、しかも「難しいパターン」で系統的に落ちます。つまり **AI レビューを通したという事実は検出保証にならない**ため、#113 の注入は「人間の形骸化」だけでなく「AI レビュー層の実効検出率」の両方を同一の物差しで測る設計にすべきです。

---

## 7. 承認権限の段階的制限と例外決裁（#114）

### 7.1 権限制限の実例（前掲 CLIA を含む）

| 分野 | 発動条件 | 制限内容 | 回復条件 | 出典 |
|---|---|---|---|---|
| 臨床検査（CLIA） | 連続 2 回、または 3 回中 2 回の PT 不合格 | 当該項目の患者検査の停止 | 2 回連続の成功 | https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-493/subpart-H |
| 臨床検査（CLIA 制裁） | 不遵守の継続 | 証明書の停止・制限・取消、支払停止、レジストリ公表 | 是正計画の受理等 | https://www.law.cornell.edu/cfr/text/42/493.1840 |
| 航空保安（TIP） | TIP 成績の低下 | 再訓練・追加曝露（権限停止ではなく訓練が主） | 成績回復 | https://www.gao.gov/products/gao-16-704 |

- パイロットの技能審査不合格に伴う資格制限・再訓練の制度（EASA/FAA）については、本調査では一次情報を確認できず**未確認**（追加調査項目）

### 7.2 例外決裁（Bypass）のインフレ防止

**Google SRE の silver bullet（一次情報、2020-06-23、Jesus Climent）**

- エラーバジェット枯渇によるリリース凍結に対し、「truly business-critical emergency launches」のための**ごく少数の例外（silver bullets）**を定義する
- silver bullet の行使は、短時間かつ極めて対象を絞ったメンテナンス窓を開き、**重大バグ修正のみ**をリリースできる
- 明示的な警告として「これ以外の例外を作ることは推奨しない。信頼性維持の失敗が受容される文化を生み、エスカレーションで結果を回避できるため信頼性向上の動機が失われる」と述べる
- 出典: https://cloud.google.com/blog/products/management-tools/sre-error-budgets-and-maintenance-windows
- 関連する Google Cloud の CRE Life Lessons 記事（エスカレーションポリシーの例）: https://cloud.google.com/blog/products/gcp/an-example-escalation-policy-cre-life-lessons ／ 適用編: https://cloud.google.com/blog/products/gcp/applying-the-escalation-policy-cre-life-lessons/
- 「エラーバジェットの整理整頓」（SRE at Google）: https://cloud.google.com/blog/products/devops-sre/good-housekeeping-error-budgetscre-life-lessons

**トークン制**（実務例、二次情報）:

- ステークホルダーに「silver bullet トークン」を配布し、**補充されない（don't refresh）**運用とすることで、行使回数に事実上の上限を設ける
- 行使は「失敗」とみなし、ポストモーテムで原因と再発防止を分析する（この「行使＝失敗扱い＋ポストモーテム必須」の記述は二次要約経由であり、Google の一次文書での**再確認が必要**）

**ITIL の緊急変更**:

- 緊急変更（emergency change）は緊急 CAB（ECAB）で承認する運用が一般的である
- 「全変更に占める緊急変更の比率（emergency change ratio / percentage）」はプロセス成熟度の主要 KPI として広く挙げられる。比率が高い＝計画性の欠如、と解釈される
- ただし **ITIL 公式に「緊急変更は N% 以下」という数値上限が定められている事実は確認できず（未確認）**。上限値は各組織が設定する運用実務である
- 出典（いずれも二次情報）:
  - ITIL v3 推奨 KPI 一覧: https://www.itilnews.com/index.php?pagename=ITIL_v3_Suggested_Change_Management_KPIs
  - 変更管理 KPI ガイド: https://www.givainc.com/blog/how-to-measure-change-management-kpis-itil/
  - 変更管理メトリクス 20 選: https://www.walkme.com/blog/change-management-metrics/
  - ITIL 変更タイプ解説: https://www.novelvista.com/blogs/it-service-management/itil-change-types

**解釈（考察）**: 「例外の比率に明示的な上限を置く公式規格」は本調査では見つかりませんでした。代わりに実効性のある機構は次の 3 つです。

- **有限トークン制**（補充されない配布数が実質的な上限。Google SRE）
- **行使コストの意図的な高さ**（決裁者の階層を上げる、ポストモーテムを必須にする）
- **比率の可視化と定期レビュー**（ITIL の emergency change ratio。上限ではなくトレンド監視）

#114 では「上限比率」を規程に書くより、**トークン制＋事後レビュー必須＋比率のダッシュボード化**の 3 点セットのほうが先行事例に忠実です。

---

## 8. 注入頻度・サンプル数の設計

事実として使える数値:

- TIP で信頼性 0.7 以上を得るには**約 100 回の TIP イベント**が必要であり、かつ平均ヒット率 0.9 未満となる難度が必要（2025年、前掲）
- 空港での TIP ヒット率は 88〜90% 程度（2022年、前掲）
- 出現率 1% では見逃し率が 0.30 に達する（Wolfe ら 2005、前掲）。出現率 50% では 0.07
- 投影頻度は「監督者が設定するパラメータ」であり、固定の業界標準値は確認できない（未確認）
- 模擬フィッシングは 8 か月に 10 回（約 3〜4 週に 1 回）という実施頻度の実例がある（Ho ら 2025、前掲）

頻度が極端な場合の弊害（文献からの整理）:

- **低すぎる場合**: 低有病率効果により基準がシフトし見逃しが増える（Wolfe ら 2005）。加えて評価に必要なサンプル数（TIP で約 100 件）が貯まらず、統計的に意味のある検出率を出せない
- **高すぎる場合**: cry wolf 効果と警報疲労により、注入そのものへの反応が鈍化する（Breznitz 1984、Bliss ら）。またレビュー工数の純増と、注入欠陥を実バグと誤認する運用コストが生じる
- **注入の質が低い場合**: TIP の 1/3 が「アーティファクトあり／非現実的」と評価された事例（2022年）が示すように、**見分けやすい注入は検出率を過大評価させる**

**解釈（考察）**: 上記から、#113 の初期設計値としては「レビュー 1 件あたりの注入確率」ではなく「**レビュアー 1 名あたり四半期で 100 件程度の注入イベントを蓄積できる頻度**」を出発点にするのが、TIP の信頼性知見に整合します。ただし本プロジェクトの想定チーム規模では 100 件/四半期は現実的でない可能性が高く、**個人単位の判定は諦め、チーム単位・プロセス単位の指標に留める**という帰結になりそうです。この点は #113 の受け入れ条件に反映すべきです。

---

## 9. 測定を個人評価に使うことの問題

- **Goodhart の法則**: Marilyn Strathern（1997年、"'Improving Ratings': Audit in the British University System", European Review 5:305–321）が「when a measure becomes a target, it ceases to be a good measure」（p.308）と定式化した。原型は Goodhart の金融政策に関する観察である
  - 原論文 PDF: https://gwern.net/doc/statistics/decision/1997-strathern.pdf
  - Goodhart 本人の講演資料（ケンブリッジ大 DAMTP 収録）: https://www.damtp.cam.ac.uk/user/mem2//papers/LHCE/goodhart.html
- **Campbell の法則**（社会指標の腐敗）も同種の警告である: https://www.nngroup.com/articles/campbells-law/
- **DORA**: DORA レポートはメトリクスの誤用に警告を発しており、**個人のパフォーマンス評価に用いるとゲーミングを招く**と指摘される。Nathen Harvey（DORA/Google Cloud）は「最速のチームではなく最も改善したチームを称える」ことを推奨している
  - TechTarget による DORA レポートの誤用警告の報道（二次）: https://www.techtarget.com/searchsoftwarequality/news/366555052/Googles-DORA-DevOps-report-warns-against-metrics-misuse
  - Google Cloud 公式ブログ（DORA メトリクスの使い方）: https://cloud.google.com/blog/products/devops-sre/using-the-dora-metrics-to-measure-DevOps-performance
  - 注記: **DORA 公式レポート本文（dora.dev の PDF）で該当文言を直接確認できておらず、一次確認は未完了**
- **SPACE フレームワーク**（Forsgren ら、ACM Queue、2021年）は多次元での測定を説き、個人評価への転用は心理的安全性を損ないメトリクス・ゲーミングを招くと整理されている
  - 注記: 「個人評価に使うな」という文言の ACM Queue 原典での確認は**未完了**。二次解説では一貫してそう記述される
  - 二次解説例: https://getdx.com/blog/space-metrics/ ／ https://www.aviator.co/blog/whats-wrong-with-using-space-to-measure-developer-productivity/
- DORA メトリクスのアンチパターン整理（InfoQ、二次）: https://www.infoq.com/articles/dora-metrics-anti-patterns

---

## 10. 構造整理（プロセス階層への写像）

### 10.1 ロールモデル（提案の素材）

- **注入設計者（Seeding Designer）**: 注入欠陥カタログの作成・難度較正を担う。被測定者（レビュアー）と分離する
- **注入運用者（Injection Operator）**: 実際の注入と結果記録を担う。CLIA の PT プロバイダ、TIP の監督者に相当する
- **被測定者（Reviewer / AI Review Layer）**: 人間レビュアーと AI レビュアーの双方
- **判定者（Just Culture 判定）**: 見逃し発生時に human error / at-risk / reckless を判別する。直属上長ではなく品質保証機能が担うのが安全（ISMP の 3 分類に基づく）
- **例外決裁者（Bypass Approver）**: silver bullet 相当のトークンを保有し、行使に責任を負う
- **第三者レビュー**: 注入プログラム自体の妥当性（注入欠陥が現実的か、TIP の 1/3 問題を回避できているか）を定期監査する役割

### 10.2 ゲート・意思決定

- **G1 注入プログラム承認ゲート**: 注入対象範囲・告知方法・データの用途制限（個人評価に使わない旨）を承認する
- **G2 見逃し検知ゲート**: 反復条件（CLIA 型の「連続 2 回 / 3 回中 2 回」）を満たしたときのみ発動する
- **G3 権限制限ゲート**: 対象範囲を限定した承認権限の一時制限を発動する。回復条件は期間ではなく実績で定義する
- **G4 例外決裁ゲート**: 制限中でも業務継続が必要な場合の bypass。トークン制・上位決裁・事後レビュー必須

### 10.3 成果物

- 注入欠陥カタログ（欠陥タイプ別、難度較正済み）
- 注入イベントログ（誰の、どのレビューに、どの欠陥を、いつ）
- 検出率レポート（チーム単位・プロセス単位。個人単位は非公開または生成しない）
- 見逃し分析記録（Just Culture 3 分類の判定結果と根拠）
- 権限制限記録と回復記録
- 例外決裁記録（トークン消費、事後レビュー結果、比率トレンド）

### 10.4 レビュープロセス

- 注入カタログの妥当性レビュー（第三者、年次）
- 検出率トレンドのレビュー（品質保証、四半期）
- 例外行使比率のレビュー（変更諮問体・SRE 相当、月次）

---

## 11. 日本の企業文化における実態（建前と実運用の乖離）

- 本調査では、日本企業における欠陥注入型のレビュー監査、模擬フィッシングの懲罰運用、緊急変更比率の実態に関する**一次情報を確保できなかった。未確認**であり、追加調査が必要である
- 一般論として指摘されうる懸念（本メモ執筆者の解釈であり、出典なし）:
  - 「見逃しゼロ」を目標値として掲げると、注入イベントの事前察知・共有（内部での申し送り）が起こり、TIP における「TIP と分かる画像は当てやすい」問題と同型の無効化が生じる
  - 権限の一時制限は日本の職場文化では人事評価・面子の問題として受け取られやすく、Just Culture の「console / coach」段階が機能せず即座に懲罰と解釈される恐れがある
  - 例外決裁は「上位者の一声」で通りやすく、トークン制のような有限資源設計がないとインフレする

---

## 12. 追加調査が必要な穴（未確認事項の一覧）

1. Basili & Selby（1987年）の欠陥クラス別検出率の具体値（IEEE TSE 原典）
2. Porter らのインスペクション実験における seeded defects の作り方と難度較正手法（原典）
3. TSA 隠密テストの検出率の公表値と、報道値の一次確認
4. TIP 投影頻度の規制上の下限・上限（EU 規則 2015/1998 実施規則の該当条項）
5. 金融分野の不正検知テスト（合成不正取引注入）の実務事例
6. EU Regulation 376/2014 の just culture 定義および Article 16 条文（EUR-Lex 本文取得に失敗）
7. VA Just Culture Decision Support Tool（2022年）の本文（PDF テキスト抽出失敗）
8. パイロットの技能審査不合格時の資格制限・再訓練制度の一次情報（EASA Part-FCL / FAA 14 CFR 121）
9. DORA 公式レポート／dora.dev における「個人評価に使うな」の直接引用箇所
10. SPACE 論文（ACM Queue、2021年）原文における同種の記述の直接引用箇所
11. Marx の Just Culture における「3 つの義務」の正確な定義（一次資料）
12. 日本企業における本テーマの実態（模擬フィッシングの処遇運用、緊急変更比率の実測値）
13. Lain ら（2022年）のフィッシング訓練大規模研究の原典
14. 「AI 生成コードへの視線が減る」眼球運動研究の原典特定
