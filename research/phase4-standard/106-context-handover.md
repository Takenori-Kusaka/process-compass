# コンテキスト移管ゲート(ブートストラップ・プロセス)一次調査メモ

- 対象 Issue: #106「人事異動に対応する『コンテキスト移管ゲート(ブートストラップ・プロセス)』の策定」
- 調査日: 2026-08-05
- 位置づけ: フェーズ4(標準プロセス策定)向けの一次情報収集。清書前の下書き

本メモは事実(出典付き)と考察を分離して記述します。エージェント関連の記述は変化が速いため、原則として時点を明記します。

---

## 0. 調査サマリ(何が言えるか)

- 属人的知識の喪失は品質・生産性に測定可能な悪影響を与えるという実証研究が複数ある(第1章・第4章)
- ドキュメントだけでは移転しない知識(設計の背景、却下案、運用の勘所)の存在が繰り返し報告されている(第2章)
- 「理解しているか」を客観測定する確立した業界標準は未確認。研究レベルでは自己説明・タスク遂行・生理指標などの手法がある(第5章)
- 2026年時点で AI エージェントによるコードベース理解支援は実用段階だが、リポジトリ規模の質問応答は依然として誤答が残る(第6章)
- AI に受動的に委譲すると理解が育たないことを示す RCT が2026年1月に公表済み。引き継ぎ設計上、最重要のリスク要因(第7章)
- 制度面では ITIL・ISO/IEC 20000・GxP のいずれも「知識の移転」と「力量の評価記録」を要求しており、ゲート設計の前例として使える(第8章)
- 日本企業の転勤・異動は「従業員の育成」が最大の目的で会社主導が約8割。専門性蓄積とは構造的に矛盾する(第9章)

---

## 1. 知識継承・オンボーディングの実証研究

### 1.1 Google のランプアップ研究

- 出典: Green, Jaspan ほか「Developer Productivity for Humans, Part 5: Onboarding and Ramp-Up」IEEE Software 40巻(2023年)
  - <https://research.google/pubs/developer-productivity-for-humans-part-5-onboarding-and-ramp-up/>
- 調査規模: Google の新規エンジニア3,000名超へのサーベイと、他社エンジニアへのインタビュー
  - 二次まとめ: <https://newsletter.getdx.com/p/developer-onboarding-time>
- 主な事実
  - ランプアップの客観指標として「行あたりの正規化コーディング時間」「正規化した投入行数」を使用
  - ランプアップを阻害する上位要因は「新しい技術の学習」「不十分または欠落したドキュメント」「知見保有者を見つけられないこと」
  - リモートオンボーディングへの移行でランプアップが3〜6週間遅延
  - 個人評価に使ってはならないという明示的な警告あり。コホート単位の訓練プログラム評価にのみ妥当

### 1.2 メンター・バディの効果(Microsoft)

- 出典: Microsoft「Every new employee needs an onboarding buddy」(Workplace Insights)
  - <https://workplaceinsights.microsoft.com/employee-experience/onboarding-buddy/>
- 主な事実(600名規模のパイロット)
  - バディありの新入社員は初週時点でオンボーディング満足度が23%高い。90日時点では36%高い
  - 90日間の面談回数と「生産性が上がった」と回答した割合の関係: 1回以上=56%、2〜3回=73%、4〜8回=86%、8回超=97%
- 注意: 自己申告ベースの社内分析であり、査読論文ではない

### 1.3 OSS における新規参加者のオンボーディング

- 出典: 「From First Patch to Long-Term Contributor: Evaluating Onboarding Recommendations for OSS Newcomers」IEEE TSE(2025年)
  - <https://dl.acm.org/doi/abs/10.1109/TSE.2025.3550881> / プレプリント <https://arxiv.org/html/2407.04159>
- 主な事実
  - Gerrit ベース5プロジェクトと GitHub の1,155プロジェクトを対象とした大規模実証
  - 新規参加者が定着確率を高めるための15のタスク関連推奨事項を同定
- 未確認: 「初回コントリビューションまでの日数」の業界標準値。一般的な実務目標として「2日以内の初コミット」を掲げる記事はあるが一次情報ではない

### 1.4 トラックナンバー / バス係数

- 出典: Avelino ほか「A Novel Approach for Estimating Truck Factors」ICPC 2016
  - <https://arxiv.org/pdf/1604.06766>
- 出典: Ferreira ほか「Algorithms for estimating truck factors: a comparative study」Software Quality Journal(2019年)
  - <https://link.springer.com/article/10.1007/s11219-019-09457-2> / PDF <https://homepages.dcc.ufmg.br/~mtov/pub/2019-sqj.pdf>
- 主な事実
  - トラックファクタは「プロジェクトが機能不全に陥るまでに失える開発者の最小人数」
  - 算出には Degree of Authorship(DOA)などバージョン管理履歴由来の指標を使用
  - 人気 GitHub プロジェクト133件の分析で、65%がトラックファクタ2以下、10%未満のみが10超
- 反証的な報告: 「Myth: The loss of core developers is a critical issue for OSS communities」(2024年)は、コア開発者の離脱の致命性を疑問視
  - <https://arxiv.org/pdf/2412.00313>

---

## 2. 知識の暗黙性とドキュメント化の限界

- 出典: Mohamed ほか「Capturing Software-Engineering Tacit Knowledge」WSEAS(2008年)
  - <https://www.wseas.us/e-library/conferences/2008/malta/ecc/ecc18.pdf>
  - 事実: ドキュメントは図・コード・テストケースなどの形式知を捉えるが、熟練者の経験知は暗黙的に頭の中にあり容易に想起されない
- 出典: 「Applying empirical software engineering to software architecture: challenges and lessons learned」(2017年)
  - <https://arxiv.org/pdf/1701.06000>
  - 事実: 最終成果物は意思決定の過程(検討した代替案、トレードオフ評価、決定の根拠)を保持しない
  - 事実: 設計判断の根拠文書の有用性を評価した実証研究はごく少数
- 出典: 「Learning From Software Failures: A Case Study at a National Space Research Center」(2025年)
  - <https://arxiv.org/pdf/2509.06301>
  - 事実: 教訓の文書化は場当たり的・非公式で個人の裁量任せ。半数は「まったく文書化されない」と回答
- 文書化されない知識の類型(上記の複数出典から整理した分類。分類自体は本メモの解釈)
  - 設計の背景と制約(その時点の人員・期限・既存資産)
  - 却下された選択肢とその理由
  - 運用上の勘所(壊れやすい箇所、監視の見方、季節性の負荷)
  - 組織的文脈(誰が承認権を持つか、過去の政治的経緯、顧客との約束)

---

## 3. ADR(Architecture Decision Records)の継承価値

### 3.1 原典と標準

- 出典: Michael Nygard「Documenting Architecture Decisions」(2011年)
  - ADR コミュニティのハブ: <https://adr.github.io/>
  - テンプレート集: <https://adr.github.io/adr-templates/>
- 事実: Nygard 形式の ADR は Title / Status / Context / Decision / Consequences で構成
- 事実: MADR は Nygard のスーパーセットで、選択肢と評価を明示的な項目として持つ
  - <https://adr.github.io/madr/decisions/0000-use-markdown-architectural-decision-records.html>
- 事実: npryce/adr-tools の ADR-0001 が「アーキテクチャ決定を記録する」こと自体を最初の ADR とする定型を普及させた
  - <https://github.com/npryce/adr-tools/blob/master/doc/adr/0001-record-architecture-decisions.md>

### 3.2 却下案を書く意義と陳腐化(実務報告)

一次の査読研究は見つかりませんでした。以下は実務者による解説記事であり、証拠の強さは弱い点に注意します。

- 出典: 「Running Effective Architecture Decision Records (ADRs) Without Endless Meetings」
  - <https://developersvoice.com/blog/architecture/effective-adrs-guide-for-software-architects/>
  - 主張: 却下案を隠すのは誤り。将来のチームが同じ選択肢を再発見して議論を蒸し返す
  - 主張: 陳腐化した決定ログは、記録がない状態より悪い。誤った確信を与えるため
  - 主張: 「決定 X」と「現在の実装が実際に X であること」の乖離が陳腐化の主要経路
- 出典: 「Architecture decision record examples: 10 real ADRs」
  - <https://scribelet.app/blog/architecture-decision-record-examples>
  - 主張: 「Alternatives Considered」節が長期的に最も時間を節約する。新任者の「なぜこれを選ばなかったのか」に即答できる
- 未確認: ADR の有無が後任者の立ち上がり時間に与える効果を測った定量研究

---

## 4. コード所有権と離職の影響

### 4.1 所有権と欠陥密度

- 出典: Bird, Nagappan, Murphy, Gall, Devanbu「Don't Touch My Code! Examining the Effects of Ownership on Software Quality」ESEC/FSE 2011
  - <https://www.microsoft.com/en-us/research/publication/dont-touch-my-code-examining-the-effects-of-ownership-on-software-quality/>
  - PDF: <https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/bird2011dtm.pdf>
- 事実: Windows Vista と Windows 7 を対象に、所有権指標と障害の関係を分析
- 事実: 「低習熟開発者(minor contributor)の人数」および「筆頭所有者の所有比率」が品質と相関
- 注記: PDF から個別の係数値を機械抽出できなかったため、具体数値は原論文の Results 節を直接参照のこと(未確認)
- 追試: Greiler, Herzig, Czerwonka「Code Ownership and Software Quality: A Replication Study」MSR 2015
  - <https://www.microsoft.com/en-us/research/wp-content/uploads/2015/05/MSR-2015-Source-Code-Ownership-IEEE_camera-ready.pdf>
- 関連(2024年): 「Examining ownership models in software teams」Empirical Software Engineering
  - <https://link.springer.com/article/10.1007/s10664-024-10538-5>

### 4.2 離職と知識喪失

- 出典: Nassif, Robillard「Revisiting turnover-induced knowledge loss in software projects」/ Rigby ほか「Quantifying and mitigating turnover-induced knowledge loss: case studies of Chrome and a project at Avaya」ICSE 2016
  - <https://dl.acm.org/doi/10.1145/2884781.2884851>
  - 事実: 放棄されたソースファイルの量を定量化し、金融リスク分析の手法を転用して離職脆弱性を評価
- 出典: Foucault ほか「Impact of developer turnover on quality in open-source software」ESEC/FSE 2015
  - <https://dl.acm.org/doi/10.1145/2786805.2786870>
  - 事実: 離脱者は品質に負の影響を与える一方、新規参入者自体は品質に影響しない
- 出典: Rashid ほか「A systematic examination of knowledge loss in open source software projects」International Journal of Information Management(2019年)
  - <https://www.sciencedirect.com/science/article/abs/pii/S0268401217310095>
- 出典: Mockus「Succession: Measuring Transfer of Code and Developer Productivity」ICSE 2009(検索結果経由で言及。原典 URL 未確認)
  - 事実(二次): 離脱者の知識喪失が品質に影響する一方、新規参入者が欠陥増加の原因とはならない
- 補足: 2026年の議論として「AI 生成コードが著者性ベースの知識指標を無効化する」という指摘あり
  - <https://arxiv.org/pdf/2606.20882>
  - 解釈上の含意: バス係数を commit 著者で測る手法は、エージェント生成コードの比率が高い環境では妥当性が下がる

---

## 5. 理解度の客観的測定(#106 の核心)

### 5.1 プログラム理解の測定(研究レベル)

- 出典: Peitek ほか「Simultaneous measurement of program comprehension with fMRI and eye tracking: a case study」ESEM 2018
  - <https://dl.acm.org/doi/10.1145/3239235.3240495> / PDF <https://www.infosun.fim.uni-passau.de/publications/docs/PSP+18b.pdf>
  - 事実: 学生22名の統制実験。fMRI は時間分解能が秒単位のため、ミリ秒単位の認知下位過程は視線計測で補う
  - 事実: 高精度な視線データが完全に取得できたのは10名のみ。データ欠損と空間精度の限界あり
- 出典: Brains on Code プロジェクト <https://brains-on-code.github.io/>
- 出典: 「Source Code Comprehension: A Contemporary Definition and Conceptual Model for Empirical Investigation」(2023年)
  - <https://arxiv.org/pdf/2310.11301>
- 解釈: fMRI・視線計測は実験室手法であり、業務プロセスのゲート判定には転用できない

### 5.2 教育分野の評価手法(転用候補)

- 出典: 改訂版ブルーム・タキソノミー(University of Waterloo / UIC の教育センター資料)
  - <https://uwaterloo.ca/centre-for-teaching-excellence/resources/teaching-tips/blooms-taxonomy-learning-activities-and-assessments>
  - <https://teaching.uic.edu/cate-teaching-guides/syllabus-course-design/blooms-taxonomy-of-educational-objectives/>
  - 事実: 「理解(Understand)」は解釈・例示・分類・要約・推論・比較・説明から構成される
  - 事実: 理解レベルの評価例として「自分の言葉で説明する」「2つの手法を比較する」が挙げられる
  - 事実: 口頭での質疑応答は形成的評価手法として位置づけられる
- 出典: Chi, De Leeuw, Chiu, LaVancher「Eliciting Self-Explanations Improves Understanding」Cognitive Science 18(3), 439-477(1994年)
  - <https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1803_3>
  - 事実: 自己説明を促された群(14名)は再読群(10名)より再生課題・転移課題で顕著に高成績
  - 事実: 説明を多く生成した者ほど効果が大きい
- 解釈: 「自分の言葉で説明させる」ことは、理解の測定手段であると同時に理解を促進する介入でもある。ゲートに口頭説明を組み込む根拠になる

### 5.3 実務的な代理指標(本メモの解釈。実証は未確認)

- コードレビューでの指摘の質(表層的な指摘か、設計意図に踏み込んだ指摘か)
- 障害対応の初動における仮説の妥当性
- 既存 ADR の Context と Consequences を再構成して説明できるか
- 「なぜ他の選択肢を採らなかったか」を ADR を見ずに説明できるか

---

## 6. AI を用いたコードベース理解支援(2026-08-05 時点)

### 6.1 エージェント向けコンテキストファイル

- 出典: AGENTS.md 解説(2026年)
  - <https://www.augmentcode.com/guides/how-to-build-agents-md>
  - <https://blog.buildbetter.ai/agents-md-complete-guide-for-engineering-teams-in-2026/>
- 事実(2026年初頭時点の記述): AGENTS.md はリポジトリ直下に置くエージェント向け指示ファイルで、Claude Code、OpenAI Codex CLI、Cursor、Aider、Devin、GitHub Copilot、Gemini CLI、Windsurf、Amazon Q が読み取る
- 事実: 推奨される記載項目はプロジェクトの目的とアーキテクチャ、ビルド/テスト/リントのコマンド、ディレクトリと責務、命名規約、認証・データ取り扱い規則、触ってはならない箇所、PR と検証の要件
- 主張(実務記事): エージェントが自力で発見できない情報のみを書くべきで、自動生成ではなく人手でキュレーションした場合にのみコストに見合う
- 解釈: 本プロジェクトの CLAUDE.md も同種のコンテキスト基盤であり、移管ゲートの「書き戻し先」の第一候補になる

### 6.2 リポジトリ規模の理解の限界

- 出典: 「SWE-QA: Can Language Models Answer Repository-level Code Questions?」(2025年公開、ACL 2026採録)
  - <https://arxiv.org/abs/2509.14635>
  - 事実: 11の著名リポジトリの GitHub Issue 77,100件から構築した576件の QA ペア
  - 事実: 意図理解、ファイル横断推論、多段依存解析のカテゴリを含む
  - 事実: 6つの先進 LLM を評価。個別モデルの正答率は本メモでは未確認
- 出典: 「Beyond Code Snippets: Benchmarking LLMs on Repository-Level Question Answering」(2026年)
  - <https://arxiv.org/html/2603.26567v1>
  - 事実: 既存のプログラム理解ベンチマークは小規模スニペット中心で、複数ファイルにまたがる実務状況に適用しにくい
  - 事実: 構造化された検索と検証の仕組みなしに、非公開または高速に変化するリポジトリで LLM を単独の解として頼ることに警鐘
- 解釈: エージェントは「地図」を素早く描くが、「地図が正しいか」の検証責任は人間側に残る

---

## 7. AI を使うことによる理解の劣化

### 7.1 コーディング学習の RCT(最重要)

- 出典: Shen, Tamkin「How AI Impacts Skill Formation」Anthropic(2026年1月29日公開)
  - 解説: <https://www.anthropic.com/research/AI-assistance-coding-skills>
  - プレプリント: <https://arxiv.org/pdf/2601.20245>
- 事実
  - 被験者は52名(多くはジュニア)のソフトウェアエンジニア
  - 未知の Python ライブラリ(Trio)を使う課題を AI 支援あり/なしでランダム割付
  - 事後クイズの平均得点は AI 群50%、手作業群67%(17ポイント低い)
  - 完了時間は AI 群が約2分速いが統計的有意ではない
  - 得点差が最も大きかったのはデバッグに関する設問
  - 低得点群(40%未満)は受動的な委譲、高得点群(65%以上)は概念的な質問と確認の追問という能動的な使い方
- 解釈: 引き継ぎで AI を使うこと自体は否定されない。禁止すべきは「受動的委譲」であり、ゲート設計では「問いを立てさせる使い方」を要求すべき

### 7.2 教育分野の対照実験

- 出典: Fan ほか「Beware of Metacognitive Laziness: Effects of Generative Artificial Intelligence on Learning Motivation, Processes, and Performance」(2024年12月、British Journal of Educational Technology 掲載)
  - <https://arxiv.org/abs/2412.09315>
  - 事実: 大学生117名を ChatGPT 群、人間専門家群、ライティング分析ツール群、対照群にランダム割付
  - 事実: ChatGPT 群はエッセイ得点の改善で優位だが、知識獲得と転移では他群と有意差なし
  - 事実: 動機づけには群間差がないが、自己調整学習プロセスの頻度と系列には有意差
- 出典: Dizon ほか「Assessing AI-Driven Metacognitive Offloading: Metacognitive Laziness Scale」(2026年)
  - <https://journals.sagepub.com/doi/10.1177/20965311261450994>
  - 事実: メタ認知的怠惰を測る尺度を開発・検証

### 7.3 実務での関連知見

- 出典: METR「Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity」(2025年7月)
  - <https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/> / <https://arxiv.org/abs/2507.09089>
  - 事実: 熟練 OSS 開発者16名・246タスクの RCT。AI 利用可の条件で完了時間が19%長かった
  - 事実: 同じ開発者は事後に「AI で20%速くなった」と推定。認識と実測の乖離
  - 注記: METR 自身がこの結果を「歴史的」と位置づけ、現行ツール・現行ワークフローを必ずしも反映しないとしている
  - 解釈: 「本人が理解できていると感じること」は理解の証拠にならない。自己申告ベースのゲートは機能しない可能性が高い
- 出典: Addy Osmani「Comprehension Debt」(2026年)
  - <https://addyosmani.com/blog/comprehension-debt/>
  - 主張: 出荷されたコードと、人間が真に理解しているコードの差分を「理解負債」と呼ぶ
- 出典: Sonar「State of Code」2026年調査(二次報道)
  - <https://tech-insider.org/ie/ai-code-quality-crisis-2026/>
  - 事実(二次): professional developer 1,100名超のうち96%が AI 生成コードを完全には信頼せず、コミット前に常に確認するのは48%
  - 注記: 一次資料(Sonar 公式レポート)は未確認

---

## 8. 引き継ぎ・移管の制度的手続

### 8.1 ITIL

- 出典: ITIL v3 Service Transition 4.7 Knowledge Management(解説サイト)
  - <https://www.hci-itil.com/ITIL_v3/books/3_service_transition/service_transition_ch4_7.html>
  - 事実: 知識移転は新規・変更サービスの移行を成功させる重要要因であり、運用準備性に必須
  - 事実: 知識管理プロセスには利用者・支援要員・供給者の訓練、既知エラーと回避策の記録、実装・テスト情報の取得が含まれる
  - 事実: SKMS(Service Knowledge Management System)は既知エラーデータベースを一部として含む上位概念
- 出典: ITIL 4 Knowledge management practice guide(PDF が ServiceNow コミュニティに掲載)
  - <https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/knowledge-conference-forum/88/1/Knowledge%20Management.pdf>
  - 事実: ITIL 4 は26プロセスを34のマネジメントプラクティスに再編し、知識管理はその一つ
  - 事実: 知識管理は「利用可能・正確・信頼できる・関連する・完全・適時・準拠」な情報の提供に焦点を置く

### 8.2 ISO/IEC 20000-1:2018

- 出典: ISO 公式ページ <https://www.iso.org/standard/70636.html>
- 事実(二次解説による): 2018年版で知識管理が要求事項として追加され、箇条7(支援)の中に位置づけられる
  - <https://advisera.com/20000academy/blog/2019/09/05/iso-20000-requirements-and-structure/>
  - <https://blog.ansi.org/ansi/change-iso-iec-20000-1-2018-service-management/>
- 未確認: 箇条番号(7.6 とする解説と 7.5 の documented information を混同する解説が混在)。規格本文で要確認
- 関連: ISO/IEC TS 20000-11:2021(ISO/IEC 20000-1 と ITIL の関係の手引)
  - <https://www.iso.org/standard/81165.html>

### 8.3 規制産業(GxP)の要員交代

- 出典: GxP 訓練記録に関する実務解説(2026年)
  - <https://pharpro.co/insights/gmp-training-records-compliance/>
  - <https://www.jarmatrixpharma.com/2026/03/13/training-records-what-auditors-expect-to-see-complete-gxp-compliance-guide/>
- 事実(規制の考え方)
  - 21 CFR 211.25 など主要な GxP 規制は要員の訓練の文書化を要求
  - 訓練記録がなければ、規制上その訓練は「実施されなかった」とみなされる
  - 要員が新しい役割に移る際は「何を、誰が、いつ教え、力量をどう評価したか」の記録が必要
  - 規制当局は「訓練が実施された」だけでなく「有効であった」証拠を求める傾向。有効性評価の方法は筆記試験、実技実演、質疑応答、作業観察
  - 評価結果と評価者を記録することが求められる
- 解釈: #106 のゲート設計にそのまま転用できる型は「力量の評価方法を事前に定義し、評価結果と評価者を記録に残す」こと

---

## 9. 日本企業のジョブローテーションの実態

### 9.1 転勤・異動の実態(JILPT)

- 出典: JILPT 調査シリーズ No.174『企業の転勤の実態に関する調査』(2017年10月25日)
  - <https://www.jil.go.jp/institute/research/2017/174.html>
- 事実
  - 正社員(総合職)の大半に転勤の可能性がある企業は33.7%、一部に限る企業は27.5%、ほとんどないか無い企業は27.1%
  - 転勤の目的の最多は「従業員の人材育成」で66.4%。次いで人員配置の適正化、組織の活性化、能力開発
  - 転勤の決定はおよそ8割が会社主導。本人の希望を加味するのは19.4%
- 出典: JILPT「異動・転勤」研究領域の成果一覧
  - <https://www.jil.go.jp/activity/area/naibu/07/index.html>
  - 関連: 資料シリーズ No.179『企業における転勤の実態に関するヒアリング調査』(2016年)、『転勤に関する個人web調査』(2017年)
- 未確認: 「3年程度で異動」という周期を裏づける一次統計。検索結果では「2〜3年、場合により5年程度」という記述が二次情報として現れるが、JILPT 等の一次資料での確認は未了

### 9.2 ジョブ型への政策的転換

- 出典: 内閣官房・経済産業省・厚生労働省『ジョブ型人事指針』(2024年8月28日)
  - <https://www.cas.go.jp/jp/seisaku/atarashii_sihonsyugi/pdf/jobgatajinji.pdf>
  - 事実: 先進20社の取り組みを具体的に示した政府文書。会社主導の異動と社内公募のバランスを扱う
- 出典: 経団連「2024年人事・労務に関するトップ・マネジメント調査結果」(2025年1月21日)
  - <https://www.keidanren.or.jp/policy/2025/007.pdf>
- 出典: 経団連「2025年人事・労務に関するトップ・マネジメント調査結果」(2026年1月20日)
  - <https://www.keidanren.or.jp/policy/2026/002.pdf>
  - 注記: ジョブ型人事の導入状況の具体的な数値は本メモでは未抽出(要精読)

### 9.3 IT 部門における属人化

- 出典: IPA『DX白書2023』
  - <https://www.ipa.go.jp/publish/wp-dx/dx-2023.html>
  - 事実(二次まとめ): DX 推進上の課題として「人材の量の不足」60.7%、「人材の質の不足」59.1%
  - 注記: 一次資料での数値確認は未了
- 出典: 総務省『令和3年版 情報通信白書』ICT 人材の不足・偏在
  - <https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r03/html/nd104300.html>
- 未確認: 「情報システム部門の定期異動が属人化を招く」ことを示す公的な定量調査。ベンダーのコラム記事は多数あるが一次情報ではない

---

## 10. 調査フレームワーク別の整理(ゲート設計への入力)

以下は本メモの調査結果をゲート設計の観点に写像した整理です。ロール名・ゲート名は本プロジェクトの提案であり、出典から直接導かれるものではありません。

### 10.1 ロールモデル(案)

- 前任者(Outgoing Owner): コンテキスト基盤への書き戻しの実行責任者
- 後任者(Incoming Owner): 理解の実証責任者。書かれた内容を検証し不足を差し戻す
- 移管審査者(Handover Reviewer): 前任者でも後任者でもない第三者。理解度評価の実施と記録
- プロダクトオーナー / 責任者: ゲート通過の最終決裁
- アーキテクト / セキュリティ代表: 該当領域の ADR と運用知識の妥当性確認
- 根拠: GxP は「評価結果と評価者を記録する」ことを求める(第8.3章)

### 10.2 組織的役割

- 第三者レビューの位置づけ: 前任者と後任者の二者だけでは「わかったつもり」を検出できない。METR の認識乖離が根拠(第7.3章)
- 専門部隊の位置づけ: バス係数の測定と可視化は個別チームでなく横断組織が担う方が継続しやすい(解釈)

### 10.3 ゲート・意思決定(3階層)

- 全体プロセス階層
  1. 移管準備ゲート(異動内示時点): 対象範囲、バス係数、コンテキスト基盤の現状棚卸し
  2. 書き戻し完了ゲート: コンテキスト基盤への網羅的な書き戻しの完了確認
  3. 理解実証ゲート: 後任者の理解を第三者が評価。合格をもって移管完了
- フェーズ内ワークフロー階層(例: 理解実証ゲート)
  - 評価課題の設定 → 後任者の説明・実作業 → 評価者の採点 → 差し戻しまたは合格 → 記録
- 個別作業階層
  - ADR の Context 再構成、既知の落とし穴の口頭説明、実障害シナリオでの初動、変更 PR の自力作成

### 10.4 成果物

- インプット: 既存の CLAUDE.md / AGENTS.md、ADR 群、仕様書、運用手順、監視設定、過去インシデント記録
- アウトプット
  - 更新されたエージェント指示ファイル(第6.1章の推奨項目に準拠)
  - 追記された ADR(却下案とその時点の制約を含む。第3.2章)
  - 「暗黙知の棚卸しリスト」(第2章の4類型に沿った書き出し)
  - 理解実証の評価記録(評価者・評価方法・結果。第8.3章の型)

### 10.5 レビュープロセス

- 書き戻し内容のレビューは後任者が主担当とする(読んで理解できることが検証条件になるため)
- 理解の評価は自己申告に依存させない。説明課題と実作業課題を組み合わせる(第5.2章・第7.3章)
- AI の利用は禁止せず、能動的な問いかけとしての利用を推奨する(第7.1章)

---

## 11. 考察(本メモ執筆者の解釈。出典から直接は導けない)

- 「引き継ぎ完了」の定義を「口頭説明が終わったこと」から「コンテキスト基盤が後任者と AI エージェントの両方に読める状態になったこと」へ移すのが #106 の本質である
- 理解度の測定は完全な客観化が不可能なため、単一の合否判定ではなく「複数の代理指標の組み合わせ + 第三者の記録」に落とすのが現実的である
- ADR の「却下案」欄は、日本企業の異動サイクルにおいて特に価値が高い。前任者不在下での「なぜこうなっているのか」への唯一の回答手段になるため
- AI で引き継ぎを加速すると、短期の見かけの立ち上がりは速くなるが理解は育たない可能性がある。ゲートは「AI を使ったか」ではなく「AI なしで説明できるか」で判定すべきである
- 日本企業の「異動の目的は人材育成」という建前(66.4%)と、専門性の蓄積が阻害される実態は正面から衝突する。プロセスとして異動を止められない以上、コンテキスト基盤への投資を制度的に義務づける方が現実的である

---

## 12. 未確認・追加調査が必要な点

- Bird 2011 の具体的な統計値(所有権比率と欠陥の係数)。PDF から抽出できず
- ADR の有無と後任者の立ち上がり時間の関係を測った定量研究の有無
- SWE-QA および Repository-level QA ベンチマークにおける各モデルの正答率の具体値
- ISO/IEC 20000-1:2018 の知識管理要求の正確な箇条番号と条文
- 日本企業の「3年周期の異動」を裏づける一次統計
- 情報システム部門の異動が属人化・障害に与える影響を示す公的な定量調査
- 経団連トップ・マネジメント調査におけるジョブ型導入率の具体値
- 規制産業(電気事業法の主任技術者、金融の IT 統括責任者など)における「有資格者交代」の法令上の手続
- Google「Learning to be a software engineer in a complex organization」本文の知見
