# コードレビューの負荷と有効性に関する実証的知見 ── 「行数」は何の代理変数か

- 調査日: 2026-08-07(追加調査分含む)
- 対象: フェーズ4「タスクの分割基準」([gate-criteria.md](/process-compass/phase4-process-design/gate-criteria.md) 253〜283行)の改稿素材
- 位置づけ: 一次情報収集メモ。清書前の素材。**既存メモ([118-119-stack-pr.md](./118-119-stack-pr.md))で既出の内容は再掲を避け、無い観点・更新が必要な観点のみを記す**
- 事実と考察は節を分けて区別する
- 追加調査(団長指示): SmartBear/Cisco 原典書籍(*Best Kept Secrets of Peer Code Review*)を全文取得し一次確認した。DORA 2025 一次資料の数値確定、Krutauz et al. 2020 の threats to validity は取得を試みたが十分な原文を得られず、その旨を正直に記す

> 重要な結論(先出し)
>
> - **SmartBear/Cisco(2006年)の原典を全文精読した結果、「200行未満で検出率87%、1000行超で28%」という数値は原典に存在しないことを確認した**。二次資料側で作成・流布された数値である。原典が実際に述べる結論は「LOC under review should be under 200, not to exceed 400」「Total review time should be less than 60 minutes, not to exceed 90」であり、既存文書の引用の仕方は妥当だった
> - 「60分/90分」は単一研究の値ではなく、原典が独自に整理した**3件の異なる調査(Dunsmore 2000・Blakely 1991/HP・Cohen 2006/Cisco)の収束**である。ただしいずれも2000年代までの調査で、2010年代以降の独立した再検証は見つからなかった
> - 2020年の追試研究(Krutauz et al.)では**レビュー指標そのものが事後欠陥をほとんど説明しない**という反証が出ている。さらに原典自身が引用する Laitenberger 1999 のパス解析でも、**行数の影響(8〜16%)より読解時間の影響(35%)のほうが大きい**と報告されており、「行数」を分割基準の根拠として使う場合はこの限界を無視してはならない
> - 行数と並んで実証的な支持がある要因は「**変更の分散度(ファイル数・ディレクトリ数)**」であり、既存メモの「10ファイル未満」基準はこの系統の研究で補強できる
> - 「コードレビューへの認知負荷理論(Sweller)の直接適用」を主張する確立した実証研究は、本調査の範囲では**見つからなかった**(EEG・fMRI・視線計測による近接領域の研究はある)
> - DORA 2025年版は、AI 導入後に**PR サイズが51.3%、PR 数が98%増加した一方、レビュー時間が91%、インシデントが242.7%増加した**と複数の二次要約が報告している。ただし**dora.dev の一次資料本体で正確な数値を確認することはできなかった**(要追加確認)

---

## 1. 「行数」が代理変数として持つ限界(反証研究)

### 1.1 レビュー指標は事後欠陥をほとんど説明しない(2020年の追試)

- Krutauz, Dey, Rigby, Mockus, "Do code review measures explain the incidence of post-release defects?: Case study replications and Bayesian networks", *Empirical Software Engineering* 25号, 2020年(ESEC/FSE 2020 Journal First track)
  - Qt プロジェクトを対象にした先行研究(McIntosh et al.)の追試に加え、**Google Chrome を新規に分析**。両プロジェクトについてバージョン管理・イシュートラッキングシステムからコード・プロセス・コードレビュー指標を抽出
  - 主要な知見: **「レビュー指標を含まないモデルの方が、含むモデルと同等かそれ以上の適合度を示した」**("Models without code review predictors had as good or better fit than those with review predictors")
  - 事後欠陥を最も強く説明するのは、**先行する欠陥・モジュールサイズ・著者の属性**である
  - コードレビュー関連指標(レビュー時間・行数など)の影響は**直接的ではなく間接的**である可能性が示唆されている。例えば「レビュー議論がない変更」は、もともと欠陥が多いファイルに集中する傾向があり、それが後続欠陥の増加と相関する(交絡)
  - ベイズネットワーク分析により、**結果は変数選択手続きに高感度で不安定である**ことも報告されている
  - 出典: [ResearchGate](https://www.researchgate.net/publication/342537827_Do_code_review_measures_explain_the_incidence_of_post-release_defects_Case_study_replications_and_bayesian_networks) / [NSF Public Access](https://par.nsf.gov/biblio/10177641) / [ACM](https://dl.acm.org/doi/abs/10.1007/s10664-020-09837-4) / [ESEC/FSE 2020 掲載ページ](https://2020.esec-fse.org/details/esecfse-2020-journal-first/22/Do-Code-Review-Measures-Explain-the-Incidence-of-Post-Release-Defects-Case-Study-Rep) / [arXiv:2005.09217(アブストラクトのみ確認)](https://arxiv.org/abs/2005.09217)
- **含意**: 「変更行数を基準に分割すればレビュー品質が上がる」という主張は、この追試研究の対象データでは支持されない。**「行数」は独立した原因変数ではなく、モジュールサイズ・欠陥履歴・著者属性という別の要因の代理指標である可能性が高い**(考察)

#### 1.1.1 この反証の射程(過剰一般化しないための線引き、団長指示への回答)

- **「レビュー指標が事後欠陥の予測に寄与しない」ことは、「レビュー粒度の基準として行数が無意味」を直接意味しない**。この区別は重要である
  - Krutauz et al. が検証したのは**「レビュー時に観測される指標(行数・レビュー時間・レビュアー数など)が、リリース後に発見される欠陥数を統計的に予測できるか」**という**予測モデルの妥当性**である
  - 一方、本標準の分割基準が問題にしているのは**「レビュー時点でレビュアーが実際に欠陥を発見できるか(=そのレビューが機能するか)」**という**レビュー実施時の運用上の妥当性**である。両者は異なる問いである
- 論文自体が明示する限界(本調査で確認できた範囲)
  - 対象は **Qt と Chrome の2プロジェクトのみ**であり、いずれも大規模オープンソースの C++ 系プロダクトである。商用クローズドソース・小規模プロジェクト・多言語混在プロジェクトへの一般化は検証されていない
  - 分析はベイズネットワークによる**相関構造の推定**であり、無作為化実験ではない。「レビューを行わなかった場合にどうなったか」という反実仮想は観測できていない
  - 著者ら自身が「結果は変数選択手続きに高度に不安定」と述べており、**この不安定性自体が、単純な線形モデルで『行数が効くか効かないか』を断定すること自体の危うさ**を示している(考察)
  - 本調査では論文本文の "Threats to Validity" 節を一次で直接確認することができなかった(証明書エラー・アクセス制限により全文PDFを取得できず、アブストラクトと二次要約のみ確認。**未確認**)
- **線引きの結論(考察)**: この反証研究は「行数を分割基準に使うこと自体が無意味」とまでは主張していない。主張しているのは**「行数(や他のレビュー指標)を『リリース後品質の予測変数』として過信してはならない」**という限定的な範囲である。分割基準としての行数は、①レビュアーの認知的な処理可能量を超えないための**運用上の目安**、②Laitenberger 1999(§1.2.1)が示す「十分な読解時間を確保する」ための**代理指標**、として位置づける限りでは、この反証と矛盾しない。**「行数を守れば欠陥が減る」という短絡的な因果を主張する記述を改稿で書かないこと**が、この反証を踏まえた最も安全な扱い方である

### 1.2 SmartBear/Cisco(2006年)の原典確証(全文精読、団長指示への回答)

- 今回、原典書籍 *Best Kept Secrets of Peer Code Review*(Cohen, Teleki, Brown ほか; SmartBear刊、2011年版PDF、Cisco調査を収録)の**全文を一次確認した**
- 対象条件(原典 p.65 の直接引用): **"2500 reviews of 3.2 million lines of code written by 50 developers"**。Cisco MeetingPlace 製品グループ、2005年7月開始・2006年5月終了の10か月間の調査。ツールは SmartBear CodeCollaborator(レビューコメント・欠陥ログ・所要時間を自動収集)
- **「200行未満で検出率87%、1000行超で28%」という具体数値は、原典に存在しない**。全文を精読した結果、この形の記述・表は原典中に見当たらず、**二次資料(ブログ記事)側で作成・流布された数値**であると判断できる(該当二次資料例: [tekin.co.uk](https://tekin.co.uk/2020/05/proof-your-thousand-line-pull-requests-create-more-bugs))
- 原典が実際に述べているのは以下(いずれも原文を直接引用):
  - (p.80)"Reviewers are most effective at reviewing small amounts of code. Anything below 200 lines produces a relatively high rate of defects"
  - (p.80)"no review larger than 250 lines produced more than 37 defects per 1000 lines of code"
  - Conclusions(p.87): **"LOC under review should be under 200, not to exceed 400. Anything larger overwhelms reviewers and defects are not uncovered."**
  - **"Inspection rates less than 300 LOC/hour result in best defect detection. Rates under 500 are still good; expect to miss significant percentage of defects if faster than that."**
  - **"Total review time should be less than 60 minutes, not to exceed 90. Defect detection rates plummet after that time."**
  - "Expect defect rates around 15 per hour. Can be higher only with less than 175 LOC under review."
- **「60分/90分」の根拠は単一研究ではなく、原典が独自にまとめた3件の異なる調査の比較(Figure 10, p.60)である**。原文の表をそのまま示す:

  | 調査 | 頭打ちとなるレビュー時間 |
  | --- | --- |
  | Dunsmore, 2000(学術研究、ICSE 2000) | 60分 |
  | Blakely, 1991(Hewlett-Packard、HP Journal) | 90分 |
  | Cohen, 2006(Cisco/SmartBear、本調査) | 90分 |

  原典はこの一致を「他の複数の研究でも反復されている結果」("This result has been echoed in other studies not covered by this survey")と位置づけている。**3組織・異なる調査手法での収束**という点で単発の実験より根拠強度は高いが、いずれも2000年代までの調査であり、**2010年代以降の独立した追試は本調査でも見つからなかった**(引き続き**未確認**)
- **defects/kLOC(欠陥密度)の絶対値そのものは研究間で大きくばらつく**ことも原典が明示している(p.62〜63、原文の表を引用):

  | 調査 | 欠陥密度(defects/kLOC) |
  | --- | --- |
  | Kelly, 2003 | 0.27 |
  | Laitenberger, 1999 | 7.00 |
  | Blakely, 1991 | 105.28 |
  | Cohen, 2006 | 10〜120 |

  原典自身が「パターンは……ない」("The pattern is… there is no pattern.")と結論しており、**「行数から欠陥数を予測する」という発想そのものを原典が明示的に否定している**。この点は §1.1 の Krutauz et al. 2020 の反証と方向性が一致する
- **改稿への含意**: 既存文書がすでに「これを超えると成立しなくなる線」として慎重に扱っている姿勢は妥当。**「60分/90分」は3件の独立した調査の収束という形で根拠強度を明示でき、依拠の強度は『単一研究の孫引き』より高いと確定できる**。一方「87%→28%」のような二次資料由来の扇情的な数値は**原典に基づかないため、改稿で新たに引用しないこと**を推奨する

#### 1.2.1 行数より「読解時間」と「外部要因」が支配的(Laitenberger 1999のパス解析)

- 原典(p.56〜59)が紹介する Laitenberger, Leszak, Stoll, El-Emam, "Evaluating a Causal Model of Review Factors in an Industrial Setting"(Lucent Product Realization Center for Optical Networking、300件のレビューを分析、1999年)のパス解析結果を、原典から直接引用する
  - コードサイズが欠陥数に与える直接的な影響: **8%**(コードサイズが読解時間に与える間接効果を含めても計16%)
  - 読解時間が欠陥数に与える影響: **35%**(コードサイズの直接効果の4倍以上)
  - **「外部要因」(コードの種類、著者・レビュアーの経験、言語、新規/保守コードの別など)が残りの過半を占め、単独の要因としては最大**
  - 原典の結論: "reading time is twice as influential as code size"「行数ではなく、どれだけ時間をかけて見たかが欠陥数を決める」
- **含意**: この1999年の産業データによるパス解析は、§1.1 の Krutauz et al. 2020(「レビュー指標は事後欠陥をほとんど説明しない」)と方向性が一致する。**行数を分割基準の主軸に置くよりも、「十分な読解時間を確保できる規模か」を基準にするほうが、1999年から2020年まで一貫して支持される設計思想である**(考察)

### 1.3 DORA 2025年版: 組織全体でのPRサイズ増加とレビュー負荷の実測

- DORA, *State of AI-assisted Software Development 2025*(2025年公表)
  - AI 導入後の変化(複数の二次集計記事による報告値)
    - PR サイズ: **+51.3%**
    - マージされる PR 数: **+98%**
    - レビュー時間(中央値): **+91%**
    - PR あたりのインシデント: **+242.7%**
  - 出典(二次集計): [Faros AI 要約](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025) / [Aviator Blog 要約](https://www.aviator.co/blog/ai-2025-dora-report/)
- **一次資料での確認結果(団長指示への回答)**: dora.dev のランディングページ([dora.dev/dora-report-2025/](https://dora.dev/dora-report-2025/))、および DORA メトリクス方法論ページ([dora.dev/guides/dora-metrics-four-keys/](https://dora.dev/guides/dora-metrics-four-keys/))を確認したが、**いずれも上記の具体的な数値(PRサイズ・PR数・レビュー時間・インシデントの変化率)を直接記載していなかった**。ランディングページは概要とレポート本体(Google Cloud経由のPDF)へのリンクのみで、本体PDFの内容までは本調査のツールで取得できなかった。**したがって、これらの数値は一次資料で確認できていない**(**未確認**)
  - 各要約記事間でも数値の丸め方に不一致がある(例:あるまとめでは「PRサイズ+154%」という異なる数値も見られた。参照している集計期間・定義の違いによる可能性がある)
  - パフォーマンスのティア区分(Elite/High/Medium/Low)の扱いの変更、パーセンタイル方式への転換の有無についても、**一次資料で確認できなかった**(**未確認**)
- **改稿への方針(団長指示に従う)**: 上記の事情により、**一次で確認できない数値は本文へ引用しない**。改稿では「DORA 2025年版はAI導入後にPRサイズ・PR数・レビュー時間・インシデントがいずれも増加したと報告している(数値の一次確認未了)」という定性的な言及にとどめるか、二次資料からの引用である旨を明記した上で参考値として使うことを推奨する
- **含意(定性的な部分は妥当)**: 個々の数値の精度は不確かだが、**方向性(AIでPRが大きくなり、レビュー時間もインシデントも悪化する)は複数の独立した要約記事で一致している**。これは「AIエージェント時代にレビュー帯域で分割基準を決める」という既存文書の設計方針(gate-criteria.md 255行)を支持する、2026年時点で最も新しい傍証である

---

## 2. 行数以外にレビュー負荷を規定する要因

### 2.1 変更の分散度(ファイル数・ディレクトリ数、change entropy)

- 既存メモにある「Google 2018年実測: 200行の変更でも1ファイルなら妥当、50ファイルに分散すれば大きすぎる」(Small CLs ガイド)の実証的な裏づけとして、**変更エントロピー(change entropy)**研究がある
- Hassan(2009年)が Shannon エントロピーをソフトウェア変更履歴に応用し、**ファイル変更の「散らばり」が欠陥傾向(fault-proneness)と相関する**ことを示した
  - "Systems where changes are scattered across many files during a given period have been found to be more prone to defects in the future."
  - 出典: [How changes affect software entropy: an empirical study — Empirical Software Engineering](https://link.springer.com/article/10.1007/s10664-012-9214-z)
- 後続研究(Co-Change Graph Entropy, 2025年)は、変更エントロピーを共変更グラフへ拡張し、欠陥予測の新しいプロセス指標として提案している
  - 出典: [arXiv:2504.18511](https://arxiv.org/pdf/2504.18511)(2025年)
- McIntosh et al., "An Empirical Study of the Impact of Modern Code Review Practices on Software Quality"(EMSE 2016)
  - レビュー中の**効果はコードの提出内容と、著者・レビュアー双方の経験に強く依存する**
  - レビュー環境内でファイルの提示順序を並び替える介入により、コメント数が**+23%**増加し、ファイル単位のホットスポット特定の精度・再現率が向上した(review environment 上の実験)
  - 出典: [rebels.cs.uwaterloo.ca PDF](https://rebels.cs.uwaterloo.ca/papers/emse2016_mcintosh.pdf)
- **改稿への含意**: 既存の「変更ファイル数10未満・上限15」という基準(gate-criteria.md 260行)は目安の数値自体の実証はないが、**「行数だけでなく分散度を見る」という設計思想自体は change entropy 研究群で支持できる**

### 2.2 レビュアーの馴染み(familiarity)・所有権(ownership)

- コード所有権比率(ownership ratio)は欠陥発生と逆相関する傾向が報告されている。ファイルレベルの所有権が低い開発者ほど、欠陥を含むコードの責任者になりやすい
- 著者・レビュアーの双方が当該コードの執筆・レビュー経験を欠く場合、そのモジュールは欠陥傾向になりやすいという知見がある
- 開発者の定性的な報告として、「ドメイン知識の欠如が表面的なレビューの原因になる」という指摘がある
  - 出典(まとめて WebSearch 経由。個別論文の一次確認は未実施 = 要追加確認): [Code review effectiveness — Jureczko, IET Software 2020](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2020.0134) / [A Roadmap on Modern Code Review, arXiv:2405.18216](https://arxiv.org/pdf/2405.18216)
- **含意**: 「誰がレビューするか」(所有権・馴染み)は行数と独立にレビュー品質を左右する要因として実証的支持がある。既存文書の「レビュアーは所有者定義から導出してよいが、静的な対応であり負荷・不在・専門性の変化を反映しない」という記述(gate-criteria.md 303行)は、この知見と整合する

### 2.3 レビュー持続時間と検出率低下の再検証状況

- §1.2 の原典確証により、「60分/90分」は SmartBear 単独の値ではなく Dunsmore 2000・Blakely 1991・Cohen 2006 の**3件の収束**であることが確認できた。ただし**2010年代以降の独立した追試は本調査でも見つからなかった**(**未確認**、既存メモの評価から更新)
- 疲労(フェイティーグ)と集中力低下の一般的知見(認知心理学の周辺領域)として「集中を要する作業は概ね60分を境に成績が低下し始める」という記述はあるが、コードレビューに特化した2010年代以降の検証ではない(**未確認**)
- **改稿への含意**: 既存文書がすでに「これを超えると成立しなくなる線」と慎重に位置づけている扱いを変更する必要はない。「3件の異なる調査の収束」という根拠強度を明記した上で、「2010年代以降の再検証は確認できていない」ことも併記するのが誠実である

---

## 3. 認知負荷理論(Sweller)のコードレビューへの適用

### 3.1 直接適用を主張する確立研究は見つからなかった

- Sweller の認知負荷理論(Cognitive Load Theory, CLT)は本来、教育心理学(instructional design)の理論であり、内在的負荷(intrinsic)・外在的負荷(extraneous)・学習関連負荷(germane)の3分類を持つ
  - 出典: [The Evolution of Cognitive Load Theory and the Measurement of Its Intrinsic, Extraneous and Germane Loads: A Review](https://www.researchgate.net/publication/331280470_The_Evolution_of_Cognitive_Load_Theory_and_the_Measurement_of_Its_Intrinsic_Extraneous_and_Germane_Loads_A_Review)
- コードレビューへ**直接**CLTの3分類を適用し、実験的に検証した査読付き実証論文は、本調査の範囲では**見つからなかった**(**埋められなかった観点**)
- 見つかったのは実務者ブログレベルの応用: 「外在的負荷を減らし学習関連負荷へ振り向けるのがCLTの主張であり、コードを大きいがクリアに相互作用する『チャンク』へ分解する発想は昔からある」という論考
  - 出典: [Cognitive Loads in Programming — Infrequent, Pragmatic, Lambda Blog](https://rpeszek.github.io/posts/2022-08-30-code-cognitiveload.html)(査読なし、実務者の考察記事)
- **考察**: CLT の枠組み自体は「タスクを小さく理解可能な単位に分割する」という本標準の分割基準の思想と整合的だが、**現時点でコードレビューへの適用を実証した学術研究がないため、「認知負荷理論に基づく」という表現で分割基準を正当化するのは根拠として弱い**。理論的な比喩としてのみ扱うべきである

### 3.2 近接領域: 生理指標によるコード理解の負荷測定

- EEGを用いてコード理解タスク中の実際の認知負荷を「グラウンドトゥルース」として測定する研究がある。参加者にJavaプログラムを最大10分間読ませ、理解度を質問紙で評価する設計
  - 出典: [NRevisit: A Cognitive Behavioral Metric for Code Understandability Assessment, arXiv:2504.18345](https://arxiv.org/pdf/2504.18345)(2025年)
- fMRIと視線計測(eye tracking)を同時計測してプログラム理解を調べた研究がある(2018年の ESEM 発表が起点、以降複数の追試)
  - 出典: [Simultaneous measurement of program comprehension with fMRI and eye tracking, ESEM 2018](https://dl.acm.org/doi/10.1145/3239235.3240495) / [Program Comprehension and Code Complexity Metrics: An fMRI Study, ICSE 2021](https://www.semanticscholar.org/paper/Program-Comprehension-and-Code-Complexity-Metrics:-Peitek-Apel/70c3be778323b896f5575a5770f934ee6f399441)
- 視線計測の細粒度分析(ICPC 2022): 開発者の認知負荷を細かい粒度で推定する手法を提示
  - 出典: [Estimating developers' cognitive load at a fine-grained level using eye-tracking measures, ICPC 2022](https://dl.acm.org/doi/abs/10.1145/3524610.3527890)
- 2024年の追加知見: コード要約を読む際、初心者はすべての意味要素にわたって注視回数・注視時間が多く、熟練者は変数・メソッド宣言に注視を集中させる(Karas et al., 2024年)
- 2025年: 生成AI利用時のコード要約タスクにおける視線情報を用いた新しいプロンプト設計の評価研究がある
  - 出典: [Design of An Eye-Tracking Study Towards Assessing the Impact of Generative AI Use on Code Summarization, ETRA 2025](https://dl.acm.org/doi/10.1145/3715669.3725868)
- **コードレビューに特化した視線計測研究(一次確認できた事例)**: 奈良先端科学技術大学院大学の研究チームが、レビュー中の眼球運動をコード行と対応づけて記録し、欠陥検出のパフォーマンスとの関係を調べた
  - "It turns out that certain eye scanning patterns during review correlate with being better at finding the defect."
  - 「最初のスキャン(first scan)」に時間をかけた被験者ほど、その後の欠陥検出が速いという負の相関が報告されている。レビュアーが最初に候補箇所を広く洗い出すことで、その後の集中的な精査が効率化されるという解釈が示されている
  - 出典: Uwano, Nakamura, Monden, Matsumoto, "Analyzing individual performance of source code review using reviewers' eye movement", ETRA 2006(前掲 SmartBear 原典 p.51〜55 に要約が収録されている一次情報)
- **注意**: EEG・fMRI研究の多くは「単体でのコード理解(comprehension)」を対象にしており、**「コードレビュー」という社会的・判断的タスクに特化した生理計測研究は限られる**(Uwano 2006 が数少ない例外。**埋められなかった観点**として明示)

---

## 4. AI生成コードのレビューに固有の負荷(2024〜2026年)

### 4.1 生成量の増大とレビュー負荷の実測(組織レベル)

- §1.3 の DORA 2025 データが該当。ただし**数値は一次資料で確認できていない**点に注意(§1.3参照)

### 4.2 自動化バイアス(automation bias)・過信

- 96%の開発者はAI生成コードを完全には信頼していないと回答する一方、**マージ前に一貫して検証しているのは48%にとどまる**という2025年末の調査結果がある
  - 出典: [Blind Trust in AI: Most Devs Use AI-Generated Code They Don't Understand — Clutch.co](https://clutch.co/resources/devs-use-ai-generated-code-they-dont-understand)
- 「権威的に見えるシステムが承認シグナルを出すと、人間は自身の吟味を減らす」という自動化バイアスの機序が指摘されている。**自動化システムが概ね正しい場合、人間は体系的に過信し、これは単純な訓練や指示では克服できない**という認知心理学の一般的知見が、AIコードレビューの文脈で援用されている
  - 出典: [The AI Code Review Trap: Why Faster Reviews Are Making Your Codebase Worse — TianPan.co](https://tianpan.co/blog/2026-04-14-ai-code-review-automation-bias)(2026年4月)
- 2025年6月時点の調査(800名のソフトウェア専門家対象)では、**59%が「完全には理解していないAI生成コードを使用している」**と回答
  - 出典: [Clutch.co](https://clutch.co/resources/devs-use-ai-generated-code-they-dont-understand)
- Stack Overflow(2026年2月)による信頼ギャップの報告: AIツールを使用/使用予定の開発者は84%超だが、**信頼していると答えた割合は2025年時点で29%(前年比-11ポイント)**
  - 出典: [Mind the gap: Closing the AI trust gap for developers — Stack Overflow](https://stackoverflow.blog/2026/02/18/closing-the-developer-ai-trust-gap/)

### 4.3 AIコードの欠陥傾向

- CodeRabbit「State of AI vs Human Code Generation」(2025年12月公表): GitHub の実オープンソースPR 470件(AI協働320件、人間のみ150件)を構造化した issue taxonomy で分析
  - AI協働PRは人間のみのPRと比べ、**issue数全体で約1.7倍**
  - ロジック・正当性の問題: **1.75倍**
  - セキュリティ脆弱性: **最大2.74倍**
  - 可読性の問題: **約3倍**
  - フォーマット問題: **2.66倍**
  - エラー処理の欠落: **約2倍**
  - パフォーマンス非効率(過剰なI/O操作など): **約8倍**
  - 出典: [businesswire プレスリリース](https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code) / [CodeRabbit ブログ](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) / [Help Net Security 要約](https://www.helpnetsecurity.com/2025/12/23/coderabbit-ai-assisted-pull-requests-report/)
  - **注意**: これはCodeRabbit(AIレビューツールのベンダー)自身の調査であり、**利益相反(自社ツールの必要性を裏づける結果になりうる)がある**。数値は参考値として扱い、独立した再現研究の有無を継続確認する必要がある(考察)

### 4.4 レビュー時間の変化に関する報告

- §1.3 の DORA 2025(レビュー時間 +91%との報告)が組織横断の数値だが、一次資料未確認
- レビュー疲労(review fatigue)に関する実務者の指摘: AIによるコード生成速度の向上に対し、レビュー側の処理能力が追いつかず、**「レビューはより速くなったが、レビューされる量自体が増えたため実質的な負荷は増している」**という論調
  - 出典: [AI Writes Better Code. We're Getting Worse at Reviewing It. — Atomic Robot](https://atomicrobot.com/blog/ai-review-fatigue/)(実務者記事、査読なし)
- 既存メモに記録済みの学術研究(重複調査せず): [Rethinking Code Review in the Age of AI, arXiv:2605.17548](https://arxiv.org/abs/2605.17548)(2026年5月)、[From Human-Centric to Agentic Code Review, arXiv:2607.13196](https://arxiv.org/abs/2607.13196)(2026年7月、102万PR分析、**エージェント関与は判断を速くするが品質向上には結びつかない**)

---

## 5. 「小さいPR」の副作用の実証

### 5.1 スタック管理コスト・待ち時間の総量(既存メモとの重複を避けた追加分)

- 既存メモは「PR数の増加がレビュアーの総負荷を悪化させることを直接定量した一次研究は未確認」と記録済み。今回の追加調査でも、**PRを細分化した場合の「総待ち時間」を直接測定した実証研究は見つからなかった**(**埋められなかった観点**、既存メモと同じ結論)
- 間接的な参考値として、DORA 2025(§1.3、一次未確認)の「PR数+98%だがレビュー時間も+91%」という二次報告は、**PRを増やすこと自体がレビュー側の総処理時間を線形以上に押し上げている可能性**を示唆する(考察。DORAの数値は分割の意図的な実施ではなく、AI利用による自然増の結果であり、因果の向きは異なる点に注意)

### 5.2 コンテキスト分断コスト

- 開発者が中断から作業へ復帰する際の「メンタル残留(mental residue)」は30〜60分に及ぶという指摘がある
  - 出典: [Mitigating Context Switching in Software Development — Jellyfish](https://jellyfish.co/library/developer-productivity/context-switching/)(実務者記事、一次研究の引用は限定的)
- **レビュー特有の中断コスト**: 「昨日書いたコードのレビュー」や「同じコードベース内の関連機能間の切り替え」は5〜10分程度で済むが、**まったく異なる問題領域間の切り替えは30〜60分**を要するという整理がある(出典同上、一次研究の引用元は不明瞭 = 要追加確認)
- PRレビューサイクルにおける典型的な悪循環の記述: 「開発者がPRを提出→別タスクへ移行→レビュアーが数日後に着手→修正依頼→開発者がコンテキストを再構築して対応→また別タスクへ戻る」というサイクルが、**平均4日**のレビュー待ちと結びつけて説明されている(出典同上)
- 一次研究として比較的確度が高いもの
  - Carnegie Mellon の研究: 短い中断でもタスク完了時間が最大23%増加する(**孫引きのみ確認。原論文の直接特定はできず = 要追加確認**)
  - Microsoft の研究: 中断された開発者は完了までの時間が延び、バグも増加する(**同上、原論文未特定**)
  - Meakins & Storey(意訳)"Two Sides of the Same Coin: Software Developers' Perceptions of Task Switching and Task Interruption"(2018年、質的研究)は開発者自身の認識を扱う一次研究として確認できた
    - 出典: [arXiv:1805.05504](https://arxiv.org/pdf/1805.05504)
- **改稿への含意**: 「スタック運用のコンテキスト分断コスト」は実務者コンセンサスとしては強いが、**査読付きの定量研究による直接の裏づけは薄い**。既存の「タスクの分割基準」節に追記する場合、この弱さを明記した上で「小さすぎる分割は中断コストを増やす」という定性的な注記に留めるのが誠実である

---

## 6. 改稿にあたっての示唆(考察)

- 「行数(100行/400行)」を分割基準の主軸に置く現行の記述は、**原典を精読した結果、既存の引用の仕方(「これを超えると成立しなくなる線」)自体は妥当だったことが確認できた**。ただし §1.1・§1.1.1 の反証(Krutauz et al. 2020)を踏まえ、「行数を守れば欠陥が減る」という短絡的な因果を新たに書き加えないよう注意する必要がある
- 「60分/90分」は単一研究ではなく3件の調査の収束であることを明記できると、依拠の強度が上がる(§1.2)。同時に「2010年代以降の独立した再検証は確認できていない」ことも併記するのが誠実
- 改稿では「行数は変更の規模を測る簡便な代理指標にすぎず、単独では欠陥率を説明しない」という限定を明示し、**変更の分散度(ファイル数・エントロピー、§2.1)とレビュアーの馴染み(§2.2)、十分な読解時間の確保(§1.2.1)を並置する**設計が実証的支持を得やすい
- DORA 2025(§1.3)は、AI時代のレビュー負荷を裏づける**組織レベルの傍証**として使えるが、**一次資料で数値を確認できなかったため、定性的な言及にとどめるか、二次資料からの引用である旨を明記して使う**べきである
- 「認知負荷理論(Sweller)」を分割基準の理論的根拠として明示的に引用するのは避けるべきである。直接適用を実証した研究がないため(§3.1)。コードレビュー特化の視線計測研究(Uwano 2006, §3.2)は理論的根拠ではなく実務的示唆(「じっくり見る初回スキャンが速い欠陥発見につながる」)として使える
- AI生成コード固有の欠陥傾向(§4.3)は、ベンダー調査という利益相反を明記した上で参考値として使うことはできるが、**独立研究による再現待ち**という留保が必要
- 小さいPRの副作用(コンテキスト分断、§5.2)は定性的な注記として使えるが、定量的な基準(例: 「スタック3層まで」)の根拠には使えない

---

## 7. 埋められなかった観点(追加調査が必要な穴)

- コードレビューへの認知負荷理論(Sweller)の**直接適用を実証した査読付き研究**(§3.1)。実務者ブログ以外に見つからなかった
- 「60分/90分」の時間閾値そのものを、2000年代の3研究(Dunsmore 2000・Blakely 1991・Cohen 2006)以外の**2010年代以降の一次研究**が再検証した事例(§1.2・§2.3)
- Krutauz et al. 2020 論文本文の "Threats to Validity" 節の直接確認(§1.1.1)。証明書エラー・アクセス制限により全文PDFを取得できず、アブストラクトと二次要約のみの確認にとどまった
- **DORA 2025 の一次資料本体(Google Cloud 経由の PDF)における正確な数値と定義**(§1.3)。dora.dev のランディングページ・方法論ページでは数値を確認できず、Google Cloud 経由の本体PDFは本調査のツールで取得できなかった
- 「PRを細分化した場合の総待ち時間」を直接測定した実証研究(§5.1)。既存メモと同じ結論(未確認)
- コンテキスト分断コストの一次研究(Carnegie Mellon・Microsoft の研究として孫引きされているものの原論文特定。§5.2)
- 日本企業における「行数上限」「レビューSLA」の建前と実運用の乖離に関する一次情報。今回の調査でも収集できていない(既存メモ(118-119)と同じ欠落)
- 変更の分散度(§2.1)とレビュー負荷の関係を、AI生成コード特有の文脈(1PRあたりの平均変更ファイル数がAIでどう変化したか)で扱った研究

---

## 出典一覧

- [Do code review measures explain the incidence of post-release defects? (ResearchGate)](https://www.researchgate.net/publication/342537827_Do_code_review_measures_explain_the_incidence_of_post-release_defects_Case_study_replications_and_bayesian_networks) / [NSF Public Access](https://par.nsf.gov/biblio/10177641) / [ACM](https://dl.acm.org/doi/abs/10.1007/s10664-020-09837-4) / [ESEC/FSE 2020 掲載ページ](https://2020.esec-fse.org/details/esecfse-2020-journal-first/22/Do-Code-Review-Measures-Explain-the-Incidence-of-Post-Release-Defects-Case-Study-Rep) / [arXiv:2005.09217](https://arxiv.org/abs/2005.09217)
- *Best Kept Secrets of Peer Code Review*(Cohen, Teleki, Brown; SmartBear刊)全文PDF — [Best Kept Secrets of Peer Code Review PDF](https://static1.smartbear.co/support/media/resources/cc/book/best-kept-secrets-of-peer-code-review.pdf)(本調査で全文精読。Cisco調査・Laitenberger 1999パス解析・Uwano 2006視線計測を収録)
- [Cisco case study 単体PDF (SmartBear, 2006)](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf)
- [Proof your thousand-line pull requests result in more bugs — tekin.co.uk(87%/28%の出所と推定される二次資料)](https://tekin.co.uk/2020/05/proof-your-thousand-line-pull-requests-create-more-bugs)
- [SDS 410 講義資料 — Code Review](https://beanumber.github.io/sds410/lectures/dev_code_review.html)
- [DORA: State of AI-assisted Software Development 2025(ランディングページ、数値未掲載)](https://dora.dev/dora-report-2025/)
- [DORA メトリクス方法論(数値未掲載)](https://dora.dev/guides/dora-metrics-four-keys/)
- [DORA 2025 要約 — Faros AI](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025)
- [DORA 2025 要約 — Aviator Blog](https://www.aviator.co/blog/ai-2025-dora-report/)
- [How changes affect software entropy: an empirical study — Empirical Software Engineering](https://link.springer.com/article/10.1007/s10664-012-9214-z)
- [Co-Change Graph Entropy (arXiv:2504.18511)](https://arxiv.org/pdf/2504.18511)
- [An Empirical Study of the Impact of Modern Code Review Practices on Software Quality (McIntosh et al., EMSE 2016) PDF](https://rebels.cs.uwaterloo.ca/papers/emse2016_mcintosh.pdf)
- [Code review effectiveness — Jureczko, IET Software 2020](https://ietresearch.onlinelibrary.wiley.com/doi/full/10.1049/iet-sen.2020.0134)
- [A Roadmap on Modern Code Review (arXiv:2405.18216)](https://arxiv.org/pdf/2405.18216)
- [The Evolution of Cognitive Load Theory... A Review (ResearchGate)](https://www.researchgate.net/publication/331280470_The_Evolution_of_Cognitive_Load_Theory_and_the_Measurement_of_Its_Intrinsic_Extraneous_and_Germane_Loads_A_Review)
- [Cognitive Loads in Programming — 実務者ブログ](https://rpeszek.github.io/posts/2022-08-30-code-cognitiveload.html)
- [NRevisit: A Cognitive Behavioral Metric for Code Understandability Assessment (arXiv:2504.18345)](https://arxiv.org/pdf/2504.18345)
- [Simultaneous measurement of program comprehension with fMRI and eye tracking (ESEM 2018)](https://dl.acm.org/doi/10.1145/3239235.3240495)
- [Program Comprehension and Code Complexity Metrics: An fMRI Study (ICSE 2021, Semantic Scholar)](https://www.semanticscholar.org/paper/Program-Comprehension-and-Code-Complexity-Metrics:-Peitek-Apel/70c3be778323b896f5575a5770f934ee6f399441)
- [Estimating developers' cognitive load at a fine-grained level using eye-tracking measures (ICPC 2022)](https://dl.acm.org/doi/abs/10.1145/3524610.3527890)
- [Design of An Eye-Tracking Study... Generative AI Use on Code Summarization (ETRA 2025)](https://dl.acm.org/doi/10.1145/3715669.3725868)
- Uwano, Nakamura, Monden, Matsumoto, "Analyzing individual performance of source code review using reviewers' eye movement", ETRA 2006(前掲 Best Kept Secrets of Peer Code Review 収録の要約を一次確認)
- [Blind Trust in AI: Most Devs Use AI-Generated Code They Don't Understand — Clutch.co](https://clutch.co/resources/devs-use-ai-generated-code-they-dont-understand)
- [The AI Code Review Trap — TianPan.co (2026-04-14)](https://tianpan.co/blog/2026-04-14-ai-code-review-automation-bias)
- [Mind the gap: Closing the AI trust gap for developers — Stack Overflow (2026-02-18)](https://stackoverflow.blog/2026/02/18/closing-the-developer-ai-trust-gap/)
- [CodeRabbit「State of AI vs Human Code Generation」プレスリリース](https://www.businesswire.com/news/home/20251217666881/en/CodeRabbits-State-of-AI-vs-Human-Code-Generation-Report-Finds-That-AI-Written-Code-Produces-1.7x-More-Issues-Than-Human-Code) / [CodeRabbit ブログ本体](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report) / [Help Net Security 要約](https://www.helpnetsecurity.com/2025/12/23/coderabbit-ai-assisted-pull-requests-report/)
- [AI Writes Better Code. We're Getting Worse at Reviewing It. — Atomic Robot](https://atomicrobot.com/blog/ai-review-fatigue/)
- [Mitigating Context Switching in Software Development — Jellyfish](https://jellyfish.co/library/developer-productivity/context-switching/)
- [Two Sides of the Same Coin: Software Developers' Perceptions of Task Switching and Task Interruption (arXiv:1805.05504)](https://arxiv.org/pdf/1805.05504)
