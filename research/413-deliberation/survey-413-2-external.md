# #413 会議体のための外部調査(2): 欠陥の検出工程・流出の集計で AI の指摘を区別するか

- 調査日: 2026-11-04
- 調査者: process-researcher(サブエージェント)
- 議題: 欠陥の検出工程と工程外への流出の集計で、AI の指摘(AI コードレビュー、AI 静的解析、AI エージェントが自動起票した Issue)から起票されたものと、人が欠陥と確定したものを区別するか。AI の大量起票による上流検出の見かけの増加(指標の水増し)をどう扱うか
- 凡例: 【確認】一次資料の本文で確かめた。【二次】二次資料・要約でのみ確かめた。【未確認】確かめられなかった
- 本メモは調査記録であり、本標準の条項案ではない。採否は会議体で決める

---

## 1. 既存規格・体系における「欠陥」の定義と確定

### 1.1 ISO/IEC/IEEE 24765(用語)と SWEBOK

- 定義の連鎖(SWEBOK V3 第10章「Defect Characterization」が 24765 を引用)【確認(SWEBOK 経由)】
  - error: 誤った結果を生む人の行為
  - defect: 作業成果物の不完全さ・欠如で、要求・仕様を満たさず、修復または置換を**要する**もの。人が error を犯すことで生じる
  - fault: ソースコード中の defect(bug の正式名)
  - failure: システム・構成要素が規定の限界内で要求機能を果たさない事象。fault にプロセッサが遭遇して生じる
  - 出典: https://swebokwiki.org/Chapter_10:_Software_Quality
- 同章の記述【確認】
  - 「defect」は語が多義的で、文化・規格により用法が異なる
  - 分類なしの情報だけでは根本原因の特定に不十分。組織にとって意味のある欠陥分類を確立せよ
  - 品質管理技法で見つかった不備・欠陥のデータは、記録しなければ失われる
  - インスペクションでは記録者が anomaly(異常)を記録し、その一覧はチームが完全性・正確性をレビューする
  - SQM の管理者は報告の正確性を確保しなければならない
  - 出典: 同上
- 24765 の原文の文言(版 2017 か新版か)は ISO/IEEE の本文で照合できていない【未確認】。二次の用語集は「work product」版と「project component」(IEEE 1490 由来)版が混在している
  - 出典: https://www.imbus.de/en/glossar/term/defect 、 https://support.squoring.com/documentation/17.0/reference_manual/gloss_defect.html
- SWEBOK V4(2024)の対応箇所の文言は確かめていない。上記は V3 の Wiki【未確認(V4)】
  - 出典: https://www.computer.org/education/bodies-of-knowledge/software-engineering/topics

### 1.2 IEEE 1044(ソフトウェア異常の分類)

- 範囲: ソフトウェアと文書で見つかった anomaly(異常)の分類を統一する。どのライフサイクル段階で見つかった異常も対象とする。分類スキームの手順・様式の要求は定めない【二次】
  - 出典: https://standards.ieee.org/ieee/1044/4607/
- 状態: IEEE の一覧で 1044-2009 は Inactive-Reserved(2020-03-05 に不活性化)【二次(IEEE の一覧ページの要約)】
  - 出典: https://standards.ieee.org/ieee/1044/4607/
- 1993 年版の処理段階(認識 Recognition → 調査 Investigation → 処置 Action → 処分 Disposition)【二次。段階名の一部は検索要約が途中で切れている】
  - 認識: 異常を記録し、観察できる属性で分類する
  - 調査: 何をするかを決める
  - 処置: 是正措置
  - 処分: 記録の締め
  - 出典: https://www.softwaretestinggenius.com/?p=3348 (学習サイト。一次ではない)
- **議題への含意(事実の範囲)**: 1044 は「anomaly(起票されたもの)」と「defect(調査で確定したもの)」を段階で分ける枠組みを持つ。ただし 2009 年版の本文で「誰が確定するか」の規定を確かめられていない【未確認】

### 1.3 ODC(Orthogonal Defect Classification、Chillarege ら 1992)

- 原典の記述【確認】
  - defect type は「修正の意味」を捉える。選択は最終的な修正によって含意される。通常は修正するプログラマが選ぶ
  - defect trigger は「欠陥が表面化することを許す条件」。trigger は欠陥のライフサイクルの早期に特定される。開発工程ではなく検証工程への洞察を与える
  - 単体テスト・機能テストでは trigger は適用されない(テストケースそのものが trigger となる)
  - trigger の分布で、インスペクションやテストの有効性・完了性を評価する
  - 出典: https://chillarege.com/docs/Papers/concept
- 実装上の属性の区分(opener / closer)【二次】
  - opener(検出時に確定): activity(検出したときの活動)、trigger、impact
  - closer(修正時に確定): target、defect type、qualifier、age、source
  - 出典: https://jasst.jp/symposium/jasst15tokyo/pdf/A5-1.pdf (JASST'15 Tokyo の講演資料)
- **議題への含意(事実の範囲)**: ODC では検出側の属性(activity/trigger)と確定側の属性(defect type = 修正の意味)が別の時点に別の人が付ける。修正されなかった指摘は defect type を持たない

### 1.4 ISO/IEC 25010・25023

- 25023 の信頼性測定量に「fault correction(検出した fault のうち設計・コーディング・テストで修正された割合)」がある【二次】
  - 出典: https://arxiv.org/pdf/2108.02921
- 25023 の各測定量(fault density 等)が「fault を誰が確定したか」「誤検出をどう除くか」を規定しているかは確かめていない【未確認】
- 25010(2023 年版)は品質モデルであり、検出工程・流出の集計規則は対象外とみられる【未確認(本文で確認していない)】

### 1.5 IPA(SEC)の定量的品質管理・ソフトウェア開発データ白書

- データ白書は検出バグを「現象数」と「原因数」に分けて集計している、と解説記事が述べる。1 原因が複数画面に出れば現象数は増え原因数は 1 件のまま【二次】
  - 出典: https://www.issoh.co.jp/md/tech/9894 (取得時 403。検索要約による)
  - 分析データ集 2022 の本体: https://www.ipa.go.jp/files/000102171.pdf (PDF の本文を読めず【未確認】)
- 白書 2016-2017 は信頼性指標に発生不具合密度(件/KSLOC)を使い、上流工程での不具合摘出比率との関係を分析している【二次】
  - 出典: https://www.ipa.go.jp/archive/files/000060438.pdf
- SEC BOOKS『組込みソフトウェア開発における品質向上の勧め[バグ管理手法編]』(2013-03)は、第2章で「バグ」「故障」などの用語を整理し、第5章でバグのカウント方法の指針を示す【確認(書誌ページ)】
  - 出典: https://www.ipa.go.jp/sec/publish/tn12-005.html
  - 本文(重複の数え方、「バグでなかったもの」の扱い、確定者)は PDF を読めず【未確認】
- IPA 資料は、バグ密度などの代替指標で品質を断定・保証できず、標準より高ければ問題が疑われる、という位置づけと整理されている【二次】
  - 出典: https://www.ipa.go.jp/files/000005434.pdf (本文は暗号化 PDF で読めず、検索要約による)
- 白書の「摘出工程」「発生不具合(稼働後の集計期間)」の公式定義の文言は確かめられなかった【未確認】

### 1.6 CMMI

- V2.0 で Peer Reviews が独立のプラクティス領域となり、PR 3.1 でピアレビューの結果とデータを分析する。VV 3.2 で検証・妥当性確認の結果を分析・伝達する【二次】
  - 出典: https://cmmiinstitute.com/getattachment/5b16e5f1-acd2-4b86-aa4c-c9bc353a669f/attachment.aspx
- モデル自体は欠陥密度の目標値・数え方を規定せず、測定量の選択を組織に委ねるとみられる【未確認(モデル本文を見ていない)】

---

## 2. 封じ込め・除去効率の指標と「欠陥として数える条件」

- DRE(Defect Removal Efficiency、Capers Jones): リリース前に発見・修復した欠陥の割合。顧客報告の欠陥を一定期間後に足して分母とする【二次】
  - Jones は実測を難しくする要因として invalid defects(無効な欠陥)、bad fix、前リリース由来の欠陥を挙げる【二次】
  - 出典: https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Defect-Removal-Efficiency.pdf (PDF 本文を読めず、検索要約による)
  - 無効・重複を DRE の分子・分母から除く明文の規則は一次資料で確かめられなかった【未確認】
- DDP(Defect Detection Percentage、ISTQB 用語集): あるテストレベルが見つけた欠陥数 ÷(そのレベルと以降の手段で見つけた欠陥数)【二次】
  - 出典: https://softwaretestpilot.com/istqb/glossary/defect-detection-percentage
  - 分母を「全工程の合計」とする別流儀の解説もあり、定義が揺れている【二次】
- 封じ込め(phase containment)/フェーズ yield(PSP)
  - フェーズ yield = 100 ×(そのフェーズで見つけた欠陥)÷(見つけた欠陥 + 見逃した欠陥)【二次】
  - yield は、テストと製品の使用で全欠陥が明らかになるまで推定しかできない【二次】
  - 出典: https://teaching.csse.uwa.edu.au/units/CITS5502//lectures/wk08--personal.pdf
- **確かめられたことの要約**: どの指標も分子・分母の単位は「欠陥」であり、指摘(報告)ではない。ただし「誤検出・重複・無効を除いた後の数である」と明記した一次資料には到達できなかった【未確認】
- 日本の実務(NTT データ、2024-01 加筆)【確認】
  - バグ密度・テスト密度は 5M(材料・設備・作業者など)が揃わないと比較の意味が薄く、「意味がない」という批判を招く
  - AI・ノーコードの普及で人がコードを書かない場合、SLOC を規模に使うのは不適切
  - 閾値の内外で OK/NG を単純判定するのは誤り。一次評価にとどめる
  - DDP のモニタリングを提案。アジャイルではバグを記録せず即修正することが多く、記録の義務化はアジリティを損なう
  - 出典: https://www.nttdata.com/jp/ja/trends/data-insight/2021/0204/

---

## 3. AI コードレビュー・AI 静的解析の指摘の扱い(業界実務)

### 3.1 指摘の採否の記録

- GitHub Copilot code review(利用メトリクス API)【確認】
  - 2026-05-08: コメント種別ごとの `total_copilot_suggestions`(投稿数)と `total_copilot_applied_suggestions`(開発者が適用した数)を追加
  - 種別(`security`、`bug_risk` など)は投稿時に Copilot が付けた区分で、重大度ではない。人のレビューコメントは含まない
  - 「却下」の件数の項目は見当たらない。採否のうち記録されるのは「適用」だけ
  - 出典: https://github.blog/changelog/2026-05-08-copilot-code-review-comment-types-now-in-usage-metrics-api
  - 2026-04-08: Copilot がレビューしたマージ済み PR の件数とマージまでの時間を追加: https://github.blog/changelog/2026-04-08-copilot-reviewed-pull-request-merge-metrics-now-in-the-usage-metrics-api
  - 2026-07-17: リポジトリ単位の内訳が GA: https://github.blog/changelog/2026-07-17-repository-level-github-copilot-usage-metrics-generally-available/
- GitHub code scanning(静的解析のアラート)【確認】
  - 却下理由は `false positive` / `won't fix` / `used in tests` / `mitigated` から選ぶ。却下の状態では理由が必須。コメントは 280 字まで
  - 却下理由は記録され、以後の解析にそのクエリを含めるかに影響しうる。却下コメントは監査・報告で正当化に使える
  - 出典: https://docs.github.com/en/rest/code-scanning/code-scanning 、 https://docs.github.com/en/code-security/how-tos/manage-security-alerts/manage-code-scanning-alerts/resolving-code-scanning-alerts
- CodeRabbit(ダッシュボード)【確認】
  - 受理率 =(受理されたコメント ÷ 投稿されたコメント)× 100。重大度別・カテゴリ別
  - 「受理」は CodeRabbit が指摘への対処を**検証できた**ときだけ。手動で会話を解決した、`@coderabbitai resolve` を使った、部分修正、無視は受理に数えない。判定は Git ホスティングのスレッド状態でなく CodeRabbit の検証ロジックによる
  - 集計対象は CodeRabbit がレビューし、かつマージされた PR だけ。重大度・カテゴリのデータは 2025-11-10 以降
  - 出典: https://docs.coderabbit.ai/guides/dashboard-metrics
- Graphite(Diamond / Graphite Agent)【確認(Braintrust の事例ページ)】
  - 受理率 = 開発者の行動につながったコメント。上票率・下票率を別に測る。目標は受理率 90% 以上
  - 出典: https://www.braintrust.dev/customers/graphite
  - 人のレビューコメントの変更率が約 50%、Diamond が調整後に約 52% という講演の数値は二次のみ【二次】: https://ai.engineer/talks/TswQeKftnaw-ai-powered-entomology-lessons-from-millions-ai

### 3.2 誤検出率の公表値と測り方

- Anthropic Code Review(2026-03-09)【確認】
  - 「指摘のうち incorrect とマークされたものは 1% 未満」。測り方はエンジニアの判断(マーク)
  - 社内で実質的なレビューコメントを受ける PR が 16% → 54%。1,000 行超の PR は 84% で指摘、平均 7.5 件
  - エージェントがバグを検証して誤検出を除く段を持つ。重大度で順位づけ
  - 「PR を承認しない。それは人の判断である」
  - 出典: https://claude.com/blog/code-review
  - 1% 未満は Anthropic 社内のコードベースでの値【二次】: https://thenewstack.io/?p=22816662
- Google AutoCommenter(2024、arXiv 2405.13565)【確認】
  - useful ratio = 肯定的フィードバック ÷ フィードバックの付いた全コメント。開発者のフィードバックで約 54% で頭打ち、独立評価者で 60%。対処できない URL を抑止した後に 66%/74%
  - 明示的なフィードバックが付いたのはコードレビューコメントの約 10%、IDE 診断の 2%
  - スナップショット比較で推定したコメントの解消率は約 40%
  - 「正しいが価値の低いコメント」は正味で負の価値になりうる
  - コメントを欠陥として分類していない。「Please fix」はレビュアーがマージ前に対処必須とみなした信号
  - 出典: https://arxiv.org/html/2405.13565
- Google「Resolving Code Review Comments with ML」(ICSE 2024 SEIP)
  - 作者がレビューコメントの 7.5% を ML の修正提案の適用で対処【二次】
  - 出典: https://research.google/pubs/resolving-code-review-comments-with-machine-learning/ (取得時タイムアウト)
- Meta Infer(CACM 2019)【二次】
  - 差分時に動かした解析は修正率 70%、バッチ運用では 0%
  - 「action」を、報告を消す差分の変更と定義。真陽性率・偽陰性率の主張を避け、action rate と観測された見逃しに焦点
  - 誤検出は警告への無関心を招く。大規模コードベースで人が全報告にラベルを付けるのは時間がかかりすぎ、誤検出率の測定は難しい
  - 出典: https://cacm.acm.org/magazines/2019/8/238344-scaling-static-analyses-at-facebook/pdf
- Meta Just-in-Time Catching Test Generation(FSE Companion 2026、arXiv 2601.22832)【確認】
  - weak catch(現リビジョンで失敗するテスト)と strong catch(真陽性)を区別。strictly weak catch は誤検出
  - 真偽は**エンジニアへの問い合わせ**で確定。41 名に問い合わせ、8 件が strong catch(19.5%)。ただし本文中で 7 件とする箇所もあり内部で不整合
  - LLM 判定で人のレビュー負荷を約 70% 削減。却下は数分
  - 出典: https://arxiv.org/html/2601.22832
- 学術・産業の実証(定義が揃わないため比較不可)【確認(抄録)】
  - Beko の産業事例(ICSE 2025 SEIP): 自動コメントの 73.8% が解消。PR のクローズ時間が 5 時間 52 分 → 8 時間 20 分に伸長。誤ったレビュー・不要な修正・無関係なコメントの欠点: https://arxiv.org/abs/2412.18531
  - Atlassian(ASE 2025): 人と LLM のコメントの解消を比較。可読性・バグ・保守性は解消されやすく設計は解消されにくい: https://arxiv.org/abs/2510.05450
  - GitHub Actions の AI レビュー 22,000 件超(2025-08): https://arxiv.org/abs/2508.18771v1
- ベンダー比較の誤検出数(Signal65、2026-03)は CodeRabbit 関連のインフォグラフィックと同じ発行元であり、独立性を確かめていない【二次】: https://signal65.com/wp-content/uploads/2026/03/Signal65-Insights_Evaluating-AI-Code-Review-Tools.pdf

### 3.3 AI が起票した報告(Issue・脆弱性報告)の扱い

- curl(Daniel Stenberg、2025-07-14)【確認】
  - 2025 年の提出の約 20% が AI slop。確認された脆弱性は約 5% に低下
  - 1 件に 3〜4 名が関わり、各人 30 分〜数時間
  - 出典: https://daniel.haxx.se/blog/2025/07/14/death-by-a-thousand-slops/
- curl はバグ報奨金を 2026-01 末で終了。でっち上げの報告の誘因を除くため【確認(報道)】
  - 出典: https://www.theregister.com/2026/01/21/curl_ends_bug_bounty/
  - 2026-05 には報告の質が上がり確認率が 2024 年水準を超えたとの報道【二次】: https://www.helpnetsecurity.com/2026/05/18/problems-with-ai-assisted-vulnerability-research/
- Google Big Sleep(2025-08)【二次】
  - 「各脆弱性は AI エージェントが人の介入なしに発見・再現した」一方、報告の前に人の専門家が確認する
  - 出典: https://techcrunch.com/2025/08/04/google-says-its-ai-based-bug-hunter-found-20-security-vulnerabilities/
  - FFmpeg は修正なしの大量報告を「CVE slop」と批判(2025-11): https://thenewstack.io/ffmpeg-to-google-fund-us-or-stop-sending-bugs/

### 3.4 AI の承認と人の判断(2026 年の変化)

- GitHub Copilot code review は 2026-09-01 に承認(パブリックプレビュー)、2026-10-28 に GA【確認】
  - 既定では承認しない。有効化すると、Copilot の承認が必須承認数の規則に**数えられる**。リポジトリ管理者は承認可能なファイルパスを選べる
  - 「approval assessment」単体はマージ要件に数えない。承認後に新しいコミットが積まれると承認は取り消される
  - 出典: https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests 、 https://github.blog/changelog/2026-10-28-copilot-code-review-merge-with-confidence-with-max-and-approvals 、 https://docs.github.com/en/copilot/concepts/agents/code-review
- 対照: Anthropic Code Review は承認しない(2026-03 時点)【確認】: https://claude.com/blog/code-review

### 3.5 指標の汚染(Goodhart)の議論

- 受理率を目標にすると、品質でなく「提案を受け入れる速さ」を測るようになる、という論考が複数ある【二次。ブログ】
  - 出典: https://www.braintrust.dev/blog/graphite 、 https://buttondown.com/critical-path/archive/stop-reading-engineering-metrics-like-a-balance/
- 2026 時点で「コメント数・受理率が捕捉した欠陥を予測するか」を直接検証した権威ある研究は見つからなかった【未確認】
- 日本の実態(建前と実運用の乖離)【確認】
  - 修正が容易で本質的でない指摘だけをして、レビュー実施のエビデンスを形式的に作るレビューは「意図的に形骸化させている」(森崎修司、2010-08-23)
  - 出典: https://blogs.itmedia.co.jp/morisaki/2010/08/post-31c3.html
  - 指標値のみでレビュー・テストの妥当性を推測するのは危険(同氏): https://blogs.itmedia.co.jp/morisaki/2007/06/post_de05.html
  - 同じ原因の不具合を 1 件として数える、バグでない指摘の扱いを組織で決めておく(MONOist、2012-03-19。講演者名の判読不能)【二次】: https://monoist.itmedia.co.jp/mn/articles/1203/19/news001_3.html

---

## 4. DORA の指標の数え方(2025〜2026)

- 定義(dora.dev、最終更新 2026-01-05)【確認】
  - change fail rate: デプロイ後に即時の介入(ロールバック・ホットフィックス)を要したデプロイの比率
  - deployment rework rate: 本番のインシデントの結果として行われた計画外のデプロイの比率
  - failed deployment recovery time: 即時の介入を要したデプロイからの回復時間
  - 出典: https://dora.dev/guides/dora-metrics/
- 5 指標化: 4 指標を 5 指標へ正式に発展させた(2025 年の振り返り、2026-01-07)【確認】: https://dora.dev/insights/dora-2025-year-in-review/
- 2025 DORA レポート(2025-09-24、Harvey・DeBellis)【確認】
  - AI の採用はスループット・製品性能と正の関係、デリバリーの安定性とは引き続き負の関係
  - 自動テスト・版管理・速いフィードバックなどの制御がなければ、変更量の増加は不安定化につながる
  - 単純なデリバリー指標だけでは不十分(何が起きているかは分かるが、なぜかは分からない)。7 つのチーム類型を導入
  - 出典: https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report
- 「1 人あたりマージ PR +98%、PR あたりインシデント +242.7%」などの数値は二次でのみ流通しており、原典で確かめていない【未確認】: https://tianpan.co/blog/2026-05-07-dora-metrics-ai-era-deployment-frequency-lies
- **事実の範囲での含意**: DORA の不安定性の 2 指標は、いずれも「本番で介入を要した/インシデントになった」という事後の事象で数える。指摘・報告の件数では数えない

---

## 5. 確かめられたこと/確かめられなかったこと

### 確かめられたこと

- 用語体系(24765 を引く SWEBOK)では defect は「修復または置換を要する」不備であり、anomaly(報告されたもの)はより広い傘の語である
- ODC では検出側の属性(trigger)と確定側の属性(defect type = 修正の意味)を別の時点で付け、defect type は通常、修正するプログラマが選ぶ
- 主要な AI レビュー製品は、指摘の「投稿数」と「受理(適用・検証済みの対処)」を分けて記録する。GitHub は「適用」だけを数え却下数を出さない。CodeRabbit は手動解決を受理に数えない。GitHub code scanning は却下理由(誤検出など)を必須で記録する
- 公表された誤検出率・有用率は、いずれも人の判断(マーク・フィードバック・問い合わせ)を真値とする。測り方は製品ごとに異なり比較できない
- AutoCommenter はフィードバック付きコメントが約 10% に限られ、解消率(約 40%)と肯定的フィードバック率がずれる
- Meta の JiT テストは、真陽性を人(エンジニアへの問い合わせ)で確定してから数える。AI の候補(weak catch)と確定(strong catch)を明確に分ける
- curl の事例は、AI 起票が大量化すると確認率が下がり、トリアージの工数を食うことを示す(2025 年は約 20% が slop、確認は約 5%)
- 2026-09 以降、Copilot の承認が必須承認数に数えられる構成が可能になった(既定は無効)
- DORA の不安定性指標は本番の事後事象で数える

### 確かめられなかったこと(追加調査が要る穴)

- ISO/IEC/IEEE 24765 の現行版の defect・anomaly の原文
- IEEE 1044-2009 の本文: 処理段階の正式な名称、「確定」の主体と状態属性(例: 調査の結果「欠陥でない」と処分する区分)
- IPA データ白書・バグ管理手法編の本文: 摘出工程の定義、現象数と原因数の計上単位、重複・「バグでなかったもの」の扱い(PDF を本ツールで読めなかった)
- DRE・DDP・PCE で、誤検出・重複・無効を分子・分母から除くと明記した一次資料
- ISO/IEC 25023 の各測定量の算式と、fault の確定条件
- CMMI のモデル本文の測定量の扱い
- ODC v5.2(IBM)の activity の正式な定義
- Google の 7.5%(ML の修正提案)の原典の文言
- AI 起票の指摘を「欠陥数」から除く/区別すると明文化した規格・業界ガイド。調べた範囲では見当たらない(「無い」とは断定できない)
- Goodhart 型の水増し(AI 指摘の増加で上流検出率が見かけ上上がる)を実測した研究

---

## 6. 考察(解釈。事実と分離)

- 規格の語彙は、「報告されたもの(anomaly・指摘)」と「確定した欠陥(defect)」を、すでに別の概念として持つ。議題の区別は新しい概念を発明するものではなく、既存の段階(認識 → 調査 → 処分)のどこで数えるかの問題として書ける可能性がある
- 封じ込め・DRE・DDP は分母に「後工程・運用で見つかった欠陥」を取るため、上流で**未確定の指摘**を数えると分子だけが膨らみ、指標が構造的に上振れする。数える単位を「確定した欠陥」に固定しない限り、AI の起票量が指標を直接動かす
- 業界の実務は、AI の指摘の真偽を人の判断(受理・マーク・問い合わせ)で決めている。一方で、その判断の記録率は低い(AutoCommenter で約 10%)、または却下が記録されない(Copilot の API)。「人が確定した」ことを集計の条件にするなら、確定の記録が落ちる経路を塞ぐ規定が要る
- 「適用された=欠陥だった」とは限らない。AutoCommenter が示すとおり、正しいが価値の低いコメントや好みの指摘も適用される。受理を欠陥の確定と同一視すると、軽微な指摘で上流検出数が増える(森崎の言う形骸化の AI 版)
- 確定者の観点では、ODC の「修正するプログラマが defect type を選ぶ」が参照点になる。他方、Copilot の承認が必須承認に数えられるようになった 2026-10 以降、「人が確定した」の「人」を機械の承認で代替できる構成が技術的に可能になった。確定の主体を人に限るかは、本標準の既存の規定(人が触る場所)と突合すべき論点である
- AI 起票の大量化はトリアージ工数(curl の例)という費用も伴う。区別しない集計は、検出の増加を品質の向上と誤読させるうえ、確定にかかる人の工数を見えなくする
