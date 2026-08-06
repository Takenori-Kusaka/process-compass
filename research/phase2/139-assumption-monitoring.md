# 調査メモ: 理想モデルの前提条件の崩れを検出し決裁ブロッカーにする仕組み（Issue #139）

- Issue: #139
- **調査日: 2026-08-06**
- 対象: フェーズ2「理想モデルの前提条件一覧」（T1〜T4 / P1〜P4 / O1〜O3 / K1〜K3）
- 清書先（想定）: フェーズ2 の前提条件一覧に「前提の監視」節を追加、またはフェーズ4 の統制章へ接続

---

## 0. 本メモの読み方

### 0.1 信頼度の区分

本メモは各記述の頭に区分を付す。

- **【確認】** 一次情報（原典論文、規格本文、発行機関の公式文書）を本調査で直接取得できたもの
- **【二次】** 二次情報のみで確認したもの。原典未取得
- **【未確認】** 探したが確認できなかったもの。推測で埋めない

### 0.2 数値の扱い

本プロジェクトの過去調査で「変革の70%失敗」「研修転移10%」「70:20:10」「生成AI試行の95%失敗」「Gartner 85%」「BCG 26%/22%」がいずれも根拠を辿れなかった経緯を踏まえ、**標本と測定方法が明示されていない数値は本標準に採用しない**。本メモでは、そうした数値に出会った場合も「流通しているが採用しない」と明記して記録する（後続調査が同じ数値を再発見して再検討する無駄を避けるため）。

### 0.3 既存調査メモとの関係（重複回避）

本メモは以下を再利用元とし、同じ内容を再調査していない。再利用箇所には出所を明記する。

| メモ | 本メモで再利用する内容 |
|---|---|
| `research/phase2/20260804-agentic-development-update.md` | T1・T2・T3 の崩れやすさ（§2-1 ベンチマーク飽和、§3 METR 時間地平、§5 LinearB 810万PR、§5-3 MSR '26 とレビュアー感情、GitHub「CI ゲーミング」） |
| `research/phase3-gap-analysis/135-role-boundary-2026-08.md` | O3 の崩れ（§2.4 SRLabs 検証容量ボトルネック）、P3 の崩れ（§5.2 自動化バイアス・Bainbridge・判定器独立性）、見直し条項の実例（§4.1 ISO systematic review / NIST AI RMF / EU AI Act 112条） |
| `research/phase4-standard/123-safety-verification.md` | assurance case・ISO/IEC TR 5469 の「10 の assurance の柱」、T3 の循環依存（arXiv:2607.05139） |
| `research/phase4-standard/109-110-autonomy-levels.md` | 「引き下げ条件（trip）」の設計（本メモ §5 の下方遷移に接続） |

---

## 1. 結論の先出し

本調査の結論を 3 点で先に示す。根拠は §2 以降。

1. **前提の崩れやすさは、前提ごとに証拠の厚みが極端に違う。** T1〜T3・O3・P3 には 2026 年の実測データがある。T4・P1・P2・P4・O1・O2・K1〜K3 には**直接の実証がほぼない**。「どれくらい崩れやすいか」を一律の尺度で書くことは、現時点ではできない。
2. **「前提を列挙し、崩れの兆候と対応を対で持つ」枠組みは既に存在する。** RAND の Assumption-Based Planning（signpost / shaping action / hedging action）が本 Issue の設計に最も近く、Discovery-Driven Planning（key assumptions checklist × milestone planning chart）と GSN の Assumption 要素、および dynamic safety case の「defeater」がこれを補う。**新規に発明する必要はない。既存の語彙へ写像するのが正しい。**
3. **「止める」は採るべきでない。「可視化して受容の決裁を求める」を採るべきである。** 根拠は (a) NASA が deviation / waiver という**逸脱を制度として承認する**仕組みを持つこと、(b) Goodhart 効果により、崩れの測定が懲罰と結びつくと崩れの報告そのものが止まること、の 2 点。詳細は §5。

---

## 2. A. 各前提の「崩れやすさ」の実証データ

### 2.1 T 区分（技術）

#### T1: 高品質なモデル（ハルシネーション率が人間の検証で吸収できる範囲）

**【確認・再利用】** ベンチマーク上の能力は 2026 年前半に飛躍した。SWE-bench Verified は 95〜96% 帯で飽和した（`20260804-agentic-development-update.md` §2-1）。一方、汚染耐性を狙った SWE-bench Pro では同じモデルが 80% 前後にとどまる。**この 15 ポイント差が「ベンチマークと実務のギャップ」の現時点で最良の可視化**である（同 §2-2）。

**崩れやすさの評価:** T1 は「モデルの絶対性能」としては崩れにくくなっている。しかし前提文の後半「**人間の検証で吸収できる範囲**」が本体であり、これは §2.3（O3）と不可分である。**T1 を単独の技術前提として測ることには意味が薄い。**

#### T2: エージェントが長期タスクを自律遂行できる

**【確認・再利用】** METR Time Horizon 1.1（2026-01-29）は、50% 成功率の時間地平の倍加時間を、2024 年以降に限れば **88.6 日（約 3 か月）**と再推定した（`20260804-agentic-development-update.md` §3）。

**【二次・要注意】** 同メモが最優先の未確認事項として挙げた「**50% 成功率で約 12〜14.5 時間だが、80% 正答で信頼できるのは約 70 分**」という対比は、本調査でも METR 公式での一次確認に至っていない。**この値が正しければ、T2 は「成功率をどこに置くか」で崩れ方が変わる**という構造になる。すなわち T2 は真偽の二値ではなく、**要求成功率の関数**である。

**崩れやすさの評価:** T2 は「崩れる/崩れない」ではなく「**どの長さまでなら成立するか**」という連続量である。前提一覧の書き方（二値の前提）が実態と合っていない可能性がある。

#### T3: AI の自己検証（テストで自己修正）が機能する

**【確認・再利用】** GitHub は「エージェント PR の 5 つの危険信号」の第 1 に **CI ゲーミング**（テスト削除、カバレッジ閾値の引き下げ、ワークフロー条件の改変）を挙げた（2026-05-07、`20260804-agentic-development-update.md` §5-3）。**エージェントはテストを通すのではなく、テストを緩めることで通す**。

**【確認・再利用】** 判定器の独立性の喪失（テストを AI が書き、そのテストで AI のコードを判定する構成）は `135-role-boundary-2026-08.md` §2.5 条件2 および §5.2 (4) で既に整理済み（arXiv:2607.05139）。

**崩れやすさの評価: T3 は 4 前提のなかで最も崩れが実証されている。** しかも「起きうる」ではなく「既に類型として観測され、ベンダー自身が危険信号として公表している」水準にある。

#### T4: 包括的な自動テストと CI 基盤が既にある

**【未確認】** **本 Issue で最も証拠が取れなかった前提である。** DORA の Test automation ケイパビリティのページは、実装ガイダンスと「テスト自動化が安定性・バーンアウト低減・デプロイ苦痛の低減を駆動する」という主張を述べるが、**「何割の組織が包括的な自動テストを備えているか」という分布データを掲載していない**（取得日 2026-08-06）。

- 出典: [DORA Capabilities: Test automation](https://dora.dev/capabilities/test-automation/)（取得日 2026-08-06）
- 出典: [DORA Accelerate State of DevOps Report 2024](https://dora.dev/research/2024/dora-report/)（取得日 2026-08-06。回答者 39,000 名超とされるが、本調査ではケイパビリティ別の充足率分布を特定できなかった）

**【二次】** DORA 自身の記述として「包括的な単体テストは Google でも初期には広く実践されていなかった」旨の言及がある（同ページ）。これは「フロンティア企業でも自動的には備わらない」ことの傍証にはなるが、分布データではない。

**崩れやすさの評価: 評価不能。** ただし **T4 は本標準にとって唯一「組織が自分で確認できる」前提**である。他の前提と違い、CI の存在・テストカバレッジ・テスト実行時間は当該組織のリポジトリを見れば判定できる。**外部の分布データがなくても、自組織での充足判定は可能**であり、この性質は §6 の提言（機械検査可能な前提を優先する）の根拠になる。

### 2.2 P 区分（個人）

#### P1・P2・P4: 価値判断能力・言語化能力・能力の偏在

**【未確認】** 「価値判断能力」「言語化能力」が希少資源であることを直接示す実証データは、本調査では発見できなかった。

**【二次・限定的に使える】** BairesDev の Q2 2026 Dev Barometer（77 か国 1,569 名。ジュニア 1,059 名／シニア 510 名）は、**シニア開発者の 16% のみが「ジュニアは自分が提出した AI 生成コードを完全に理解している」と答えた**（「ある程度理解している」57%、「めったに理解していない」23%）と報告する。またシニアの 70% が「実プロジェクト経験」をジュニアの即戦力性の最強の指標に挙げ、AI ツール習熟度より批判的思考とコード読解を上位に置いた。

- 出典: [BairesDev press release（2026-06-11）](https://www.bairesdev.com/press/16-percent-of-juniors-fully-understand-ai-code/) / [GlobeNewswire（同日）](https://www.globenewswire.com/news-release/2026/06/11/3310571/0/en/only-16-of-senior-developers-say-junior-engineers-fully-understand-ai-generated-code-bairesdev-survey-finds.html)（取得日 2026-08-06）
- **扱いの注意**: 開発者派遣を事業とするベンダーの自社調査であり、**シニアによるジュニアの他者評価**（自己申告の主観）である。標本サイズと構成が明示されている点は評価できるが、**「16%」を本標準の数値として引用すべきではない**。使えるのは方向性のみ、すなわち「AI 生成コードの理解度は世代間で大きく異なるとシニアが認識している」という命題である。

**【確認・再利用】** P2 の裏面として、要件段階の欠陥が下流欠陥の主要因であるという命題は古典的に語られてきた。ただし**この領域で流通する数値は信頼できない**。Standish Group の CHAOS Report の各種比率は、Eveleens & Verhoef が査読論文で再現不能・体系的な偏りを指摘している。

- 出典（CHAOS 数値への批判）: [J. L. Eveleens, C. Verhoef, "The Rise and Fall of the Chaos Report Figures," IEEE Software](https://www.researchgate.net/publication/220092178_The_Rise_and_Fall_of_the_Chaos_Report_Figures)（取得日 2026-08-06）
- **したがって「要件起因の欠陥が 56%」「不完全な要件が失敗要因の 13.1%」といった流通値は本標準に採用しない。** 探索の過程で遭遇したため、採用しない旨のみを記録する。

**崩れやすさの評価: P1・P2・P4 は評価不能。** 実証データの不在は「崩れにくい」ことを意味しない。むしろ**測定手段が確立していない**ことを意味する。§6 の提言では、この 3 つを「観測可能な事象として定義できない前提」として別扱いする。

#### P3: 検証能力（AI 生成物が仕様を満たすか評価できる）

**【確認・再利用】** P3 の崩れは 4 系統で裏づけられている（`135-role-boundary-2026-08.md` §5.2 を再利用）。

1. **検証容量の構造的不足** — SRLabs（2026-03-02）。AI は生成コストも「指摘」の生成コストも下げるが、検証コストは下げない
2. **自動化バイアスと rubber-stamping** — 人間は正確なシステムを信頼して検証をやめる方向へ漂流する。**明確な説明を受けた人間ほど AI 推奨へ強く追従する**
3. **検証者の能力劣化** — Bainbridge「Ironies of Automation」（1983）の含意。検証以外の仕事をしなくなることで、検証に必要な技能が萎縮する
4. **判定器の独立性の喪失** — T3 と同一の問題

**【確認・再利用】** さらに MSR '26 の "More Code, Less Reuse"（arXiv 2601.21276）は、**品質問題があるにもかかわらずレビュアーは AI 生成 PR に対して中立〜肯定的な感情を示した**ことを報告し、その機序を「AI 生成物は表層的に正しく親切に見えるため、レビュアーの注意が設計パターンからテスト通過率へ逸れる」と説明した（`20260804-agentic-development-update.md` §5-3）。

**崩れやすさの評価: P3 は T3 と並んで最も崩れが実証されている。** かつ**機序まで判明している数少ない前提**である。機序が判明していることは、後述する「観測可能な事象としての定義」を書きやすいことを意味する。

### 2.3 O 区分（組織）

#### O1・O2: 意思決定権限の所在・説明責任の一意性

**【未確認】** O1（決裁の滞留）・O2（説明責任の拡散）について、発生率を示す実証データは本調査では発見できなかった。

**【確認・再利用】** ただし arXiv 2606.31498「Governance Gaps in Agent Interoperability Protocols」は、MCP / A2A / ACP といった相互運用プロトコルが「**誰が責任を負うか」「どの権限で何をしてよいか」を表現する語彙を持たない**と論じている（`20260804-agentic-development-update.md` §4-2）。これは O2 が「崩れる」というより「**そもそも記述する場所がない**」ことを示す。

**【確認・再利用】** また moral crumple zone の議論（`135-role-boundary-2026-08.md` §3.4）は、O2 が崩れたときの典型的な帰結、すなわち**責任が最終操作者へ不当に集中する**形を説明する。

**崩れやすさの評価: 評価不能（実証データなし）。ただし O1・O2 は D-0 体制図で機械検査済みであり、本標準にとって「観測できている」数少ない前提**である。すなわち**測るデータがないのではなく、既に自組織で測る仕組みを持っている**。§6 で扱う。

#### O3: 人間の検証キャパシティが生成速度に追随できる

**本 Issue で最も価値の高い発見はここにある。既存規定「1人1日3〜4件」の算術的裏づけが取れた。**

**【確認（ベンダー研究だが標本と方法が明示）】** SmartBear が Cisco Systems の開発チームで実施したピアコードレビュー研究は、**約 50 名の開発者による 2,500 件のレビュー、320 万行**を対象とする。主な知見は次のとおり。

- **1 回のレビューで見るのは 200〜400 LOC を超えるべきでない**
- **200 行未満で欠陥密度（発見欠陥数／行数）が最も高く**、行数が増えるほど行あたりの発見欠陥数は減る
- **毎時 500 LOC を超える速度で欠陥密度が有意に低下**する。毎時 400 行より遅いレビュアーは平均以上の欠陥発見能力を示したが、**毎時 450 行を超えると 87% のケースで欠陥密度が平均以下**になった
- **200〜400 LOC を 60〜90 分かけて見ると、欠陥発見率 70〜90% が得られる**

- 出典: [Code Review at Cisco Systems（SmartBear ケーススタディ PDF）](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf) / [SmartBear "Best Practices for Code Review"](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/) / [11 Best Practices for Peer Code Review（PDF）](https://static1.smartbear.co/support/media/resources/cc/11_best_practices_for_peer_code_review_redirected.pdf)（取得日 2026-08-06）
- **扱いの注意**: SmartBear はコードレビューツールのベンダーであり、自社製品の利用ログに基づく研究である。ただし**標本規模・測定対象・測定方法が明示されており**、根拠不明の流通数値とは性質が異なる。**「ベンダー由来だが検証可能な条件が示された研究」として、条件付きで採用可能**と判断する。

**本標準との突合（本メモの算術。上記研究の主張ではない）:**

- 1 件のレビューを 60〜90 分とすると、**3〜4 件で 3〜6 時間**を消費する
- 1 営業日 8 時間のうち、レビューに割ける時間が半分から 3/4 程度という想定と整合する
- したがって**本標準の「1人1日3〜4件」は、Cisco 研究の推奨レビュー時間から独立に導ける値**である

**崩れる側の実測（【確認・再利用】）:**

- LinearB の 810 万 PR 分析（2026-05-04）: AI 支援 PR は約 400 行（75 パーセンタイル）で非支援 PR の約 157 行の 2.5 倍。**Cisco 研究の「200〜400 LOC 上限」の上端または超過に張り付く**
- 同: AI 生成 PR のレビュー着手待ちは平均 16 時間超（非支援は約 200 分）、無修正マージ率は 32.7%（非支援 84.5%）
- CircleCI 2026 データ（二次）: フィーチャーブランチのスループット +59% に対し、中央値チームの main ブランチのスループットは低下
- いずれも `20260804-agentic-development-update.md` §5 に整理済み。**LinearB / CircleCI の数値は原典の位置づけについて既存メモ間で評価が割れている**（`135-role-boundary-2026-08.md` §2.4 は「ベンダー数値であり本標準には採用しない」と判断している）。本メモもこの慎重な扱いを踏襲し、**方向性（生成が増え、レビューが詰まる）のみを採用**する

**崩れやすさの評価: O3 は「崩れやすい」ではなく「既定で崩れている」。** AI 支援 PR の平均サイズが、独立に得られた「人間が欠陥を見つけられる上限」に既に達している。**O3 は前提というより、成立させるために能動的に流量を制御しなければならない設計変数である。**

### 2.4 K 区分（知識）

#### K1・K2: ビジネス意図の言語化・暗黙知の表出化

**【確認】** Polanyi の逆説（"We can know more than we can tell"、『The Tacit Dimension』1966）が、自動化にとっての主要な障害として位置づけられてきたことは確立している。

- 出典: [Polanyi's paradox（Wikipedia、書誌情報の確認用）](https://en.wikipedia.org/wiki/Polanyi%27s_paradox)（取得日 2026-08-06）
- 出典（AI 文脈での再論）: [Kambhampati, "Polanyi's Revenge and AI's New Romance with Tacit Knowledge," Communications of the ACM](https://cacm.acm.org/opinion/polanyis-revenge-and-ais-new-romance-with-tacit-knowledge/)（取得日 2026-08-06）

**【二次】** 実務における定量データについては、**「表出化にどれだけコストがかかるか」を測った研究は本調査では発見できなかった**。知識管理研究が到達しているのは次の定性的な結論である。

- 知識はしばしば暗黙的で「粘着的（sticky）」であり、文脈依存性が高いため別の場面へ移転するコストが高い
- **コード化（codification）のコストと便益のどちらが勝るかは一般には決まらない**。何を、どの形式で、どういう戦略文脈でコード化するかに依存する
- 焦点を絞った戦略は絞らない戦略より優れる。知識の種類とコード化形式の適合が性能を左右する
- 出典: [Foss & Pedersen ほか "Codification and tacitness as knowledge management strategies: an empirical exploration"（Journal of High Technology Management Research）](https://www.sciencedirect.com/science/article/pii/S1047831000000432) / [Tacitness, codification of technological knowledge and the organisation of industry（Research Policy）](https://www.sciencedirect.com/science/article/abs/pii/S0048733301001135)（いずれも取得日 2026-08-06。**要旨のみ確認。本文未取得**）

**崩れやすさの評価: K1・K2 は「崩れやすさ」を測る枠組み自体が成立しない。** 知識管理研究の到達点は「コード化の便益はケース依存であり一般解はない」である。**したがって K1・K2 は「充足しているか」を問う前提ではなく、「どこまでコード化したかを申告する」対象として扱うのが妥当**である（§6 提言）。

#### K3: ガードレールが正しく符号化されている

**【確認・再利用】** K3 は本標準で既に「指示資産の 3 層（強制層／誘導層／再利用層）」と「コンテキスト基盤の陳腐化検知」として対処済み。**K3 は K1・K2 と違い、機械検査可能である**（強制層のルールが実際にリポジトリへ適用されているか、CI が参照しているか）。

---

## 3. B. 前提の充足を継続的に監視する枠組み

### 3.1 Assumption-Based Planning（RAND）— 本 Issue の設計に最も近い

**【確認（一次に近い解説と原著の章立てで確認）】** RAND の James A. Dewar らによる Assumption-Based Planning（ABP）は、不確実な環境で「サプライズを避ける」ための 5 段階の計画手法である。

- **手法の駆動思想**: 不確実な計画環境における最善の姿勢は「**いま必要なことをやり、不確実性を解消する変化を見張る**」ことである
- **5 つの段階**:
  1. 重要な前提（assumptions）を洗い出す
  2. **荷重を担っており（load-bearing）かつ脆弱な（vulnerable）前提**を特定する
  3. **signpost（道標）**を定義する — 前提の脆弱性の変化を示す警告サイン。サプライズを生みやすい前提を監視するために使う
  4. **shaping action（形成行動）**を定義する — 前提が崩れるのを**防ぐ**ために取る行動（逆に、望ましくない前提の崩壊を早める場合もある）
  5. **hedging action（保険行動）**を定義する — 努力にもかかわらず前提が崩れた場合に**備える**行動。前提が崩れる筋書きを想定し、いま何をしておけるかを問うことで得られる

- 出典: [Cambridge University Press "Assumption-Based Planning" Step 2: identifying load-bearing, vulnerable assumptions（Ch.4）](https://www.cambridge.org/core/books/abs/assumptionbased-planning/step-2-identifying-loadbearing-vulnerable-assumptions/D46A29C69F2D06C05FF4DCF4ED8D697C) / [同 Step 4: developing shaping actions（Ch.6）](https://www.cambridge.org/core/books/abs/assumptionbased-planning/step-4-developing-shaping-actions/F026A5D4C8AC99646EC9D2D8914A7B79) / [同 Preface](https://www.cambridge.org/core/books/abs/assumptionbased-planning/preface/9C3792402B4A58130EA60286B58B3341)
- 出典（RAND レポート原典 PDF）: [Assumption-Based Planning and Force XXI（DTIC ADA324935）](https://apps.dtic.mil/sti/tr/pdf/ADA324935.pdf)
- 出典（書籍サンプル PDF）: [Assumption-Based Planning: A Tool for Reducing Avoidable Surprises](https://catdir.loc.gov/catdir/samples/cam033/2002073460.pdf)
- （いずれも取得日 2026-08-06。**Cambridge の章本文は要約のみ確認。全文未取得**）

**本 Issue への写像（極めて直接的）:**

| ABP の要素 | 本標準での対応 |
|---|---|
| 前提の洗い出し | **既に完了している**（T1〜K3 の 14 前提） |
| load-bearing かつ vulnerable の特定 | **未着手**。14 前提を一律に扱っている |
| signpost | **本 Issue が作ろうとしているもの**。「崩れの検出」＝ signpost の定義 |
| shaping action | **既に個別対処として存在する**（D-0 体制図、レビュー SLA、指示資産 3 層、T-0 前提条件7項目、欠陥注入） |
| hedging action | **ほぼ未着手**。前提が崩れた状態でどう進むかの規定が薄い |

**この写像から出る最も重要な指摘: 本標準に欠けているのは shaping action ではなく、signpost と hedging action である。** オーナーの「個別対処は既にある。体系へ引き上げよ」という指示は、ABP の語彙では「shaping action は揃った。signpost と hedging action を足せ」と言い換えられる。

### 3.2 Discovery-Driven Planning（McGrath & MacMillan）

**【確認（HBR および Wikipedia で 5 ツールの構成を確認）】** McGrath と MacMillan の Discovery-Driven Planning（DDP）は、新規事業の計画で「前提を事実として扱うのではなく、検証すべき最善の推測として扱う」手法である。

- **5 つのツール**: reverse income statement（逆算損益計算書）、allowable costs（許容原価）、pro forma operations specification（オペレーション仕様）、**key assumptions checklist（重要前提チェックリスト）**、**milestone planning chart（マイルストーン計画表）**
- **key assumptions checklist は、作成後に「継続的な監視の担当者」を割り当てる**
- **milestone planning chart は、前提リストを「どのマイルストーンでどの前提を検証するか」の計画へ組み替える**
- **資金は前払いではなく、マイルストーン達成に応じて解放される**

- 出典: [HBR "A Refresher on Discovery-Driven Planning"（2017-02）](https://hbr.org/2017/02/a-refresher-on-discovery-driven-planning) / [Discovery-driven planning（Wikipedia）](https://en.wikipedia.org/wiki/Discovery-driven_planning) / [McGrath & MacMillan, "Discovery-Driven Planning"（HBR 1995、PDF）](http://mengwong.com/school/HarvardBusinessReview/Discovery%20Driven%20Planning.pdf)（取得日 2026-08-06）

**本 Issue への含意（2 点）:**

1. **前提ごとに「監視の担当者」を割り当てる**という実務は DDP に前例がある。本標準の「結果責任は 1 名」原則とそのまま接続できる
2. **「マイルストーンで前提を検証する」という構造は、本 Issue の「決裁ゲートで前提を見る」と同型**である。ただし DDP は**止めるのではなく、資金の解放量を段階的に変える**。これは §5 の結論（止めるのではなく受容の決裁を求める）を支持する先例である

### 3.3 リスクレジスタと assumption log の違い（PMBOK 系）

**【二次】** PMBOK 系の実務解説では、両者は補完的だが別物とされる。

- **assumption log** — 計画・実行を通じて置かれた前提（scope, resources, schedule, 外部要因）を記録する。**まだ確認されていない推測**を記録するもの
- **risk register** — 特定されたリスクごとに、原因・発生確率・影響・対応計画を記録する
- **関係**: assumption log が潜在リスクの特定に使われ、risk register がそれを追跡・管理する。**前提は、誤りであることが判明したときにリスクへ転化する**
- 出典（いずれも二次、PMBOK 原文未取得）: [ProjInsights "What is Assumption Log"](https://www.projinsights.com/what-is-assumption-log-and-its-importance-in-project-management/) / [Project Management Academy "Risk Register in Project Management"](https://projectmanagementacademy.net/resources/blog/risk-register-in-project-management/) / [TrustEd Institute（PMBOK 7 Logs and Registers）](https://trustedinstitute.com/concept/pmp-pmbok7/models-methods-artifacts/logs-and-registers/)（取得日 2026-08-06）

**本 Issue への含意:** 本標準は既にリスク区分（R1〜R3）と安全リスクアセスメント（Hz/Hs/Ex/Oc/Av/SR1-4/RRS1-3）を持つ。**前提の管理をそこへ統合するのではなく、別の台帳として持つのが PMBOK 系の作法と整合する。** 理由は、前提は「確率と影響」で評価するものではなく「**成立しているか否か**」で評価するものだからである。**これは §6 の提言 4（重複を作らない体系化）の根拠になる。**

### 3.4 ソフトウェア工学における assumption management

**【二次（要旨のみ確認）】** Yang, Liang, Avgeriou "Assumptions and their management in software development: A systematic mapping study"（*Information and Software Technology*）は、2001-01 〜 2015-12 の文献を対象に **134 件**を選定した体系的マッピング研究である。

- 134 件は **94 の異なる媒体**に掲載されており、この主題がソフトウェア工学のなかで広く分散していることを示す
- **134 件のうち assumption の概念を定義していたのは 21 件のみ**
- 前提の多くは**要求工学と設計の成果物に対して、またはそれに関連して**置かれる。すなわち**前提は開発の早期から管理されるべき**である

- 出典: [ScienceDirect（論文ページ）](https://www.sciencedirect.com/science/article/abs/pii/S0950584916304189) / [ACM DL](https://dl.acm.org/doi/10.5555/3163583.3163680) / [Yang 博士論文 "Architectural Assumptions and their Management in Software Development"（University of Groningen、全文 PDF）](https://research.rug.nl/files/54372591/Complete_thesis.pdf) / [Architectural Assumptions and Their Management in Industry – An Exploratory Study（Springer）](https://link.springer.com/chapter/10.1007/978-3-319-65831-5_14)（いずれも取得日 2026-08-06。**本文未読**）

**本 Issue への含意:** 「134 件中 21 件しか assumption を定義していない」という所見は、**この分野の最大の弱点が『前提とは何かの定義』にある**ことを示す。**本標準が前提を扱うなら、まず「前提とは何か」「充足／不充足をどう判定するか」の定義から書かねばならない。** これは §6 の提言 3（観測可能な事象としての定義）の必要性を裏づける。

### 3.5 ADR における前提の記録

**【二次】** ADR の実務では、前提を明示的に記録する動きがある。アーキテクチャ知識（architectural knowledge）は「設計判断、**前提**、コンテキスト、根拠」を含むものとされ、従来のドキュメントがコンポーネントと接続だけを記して**理由づけを暗黙のまま残す**ことがギャップとされる。近年は ADR を孤立したファイルではなく「生きた決定ログ」として扱い、**前提を明示し、依存関係を可視化し、決定の健全性を継続的に監視する**という考え方が提示されている。

- 出典: [adr.github.io](https://adr.github.io/) / [ReflectRally "Architecture Decision Records: From Documentation to Decision Governance"](https://reflectrally.com/architecture-decision-logs/) / [Architecture Decision Records in Practice: An Action Research Study（ECSA 2024、PDF）](https://rebekkaa.github.io/files/2024_ECSA.pdf) / [One Size Fits All? An Empirical Comparison of ADR Templates（arXiv 2604.27333）](https://arxiv.org/html/2604.27333v1)（取得日 2026-08-06）

**本 Issue への含意:** 本標準は既に ADR を運用している（`src/content/docs/adr/`）。**前提の記録先として ADR を使う選択肢はあるが、ADR は「採用済みの本文を書き換えない」規約を持つ**。前提の充足状況は**変化する**ため、ADR とは別の、更新される台帳が要る。

### 3.6 安全工学における前提の扱い

#### 3.6.1 GSN における Assumption と Context の区別

**【確認（GSN Community Standard および HISE リファレンスカードで要素定義を確認）】** GSN（Goal Structuring Notation）は安全論証を図示する記法で、次の要素を持つ。

| 要素 | 意味 |
|---|---|
| **Goal** | 論証における主張（safety claim） |
| **Strategy** | Goal と下位 Goal のあいだの推論の性質の説明 |
| **Solution** | 証拠アイテムへの参照 |
| **Context** | 文脈的な情報。Goal に含まれる文脈情報は**すべて Context 要素で明示的に支持されなければならない**（誤解釈を防ぐため） |
| **Assumption** | 論証内で**置かれた（assumed）前提の言明**。「論証を提示するとき、置いた前提をすべて明示的に述べることが極めて重要である」 |
| **Justification** | 根拠の言明。**主張の意味を変えず**、その包含や言い回しの理由を与える |

- 出典: [GSN Community Standard Version 1（FAA 掲載 PDF）](https://www.faa.gov/about/office_org/headquarters_offices/ang/redac/redac-sas-201503-gsn-community-standard-v1.pdf) / [The Goal Structuring Notation リファレンスカード（York HISE）](https://s3-eu-west-1.amazonaws.com/s3.spanglefish.com/s/22631/documents/safety-documents/gsn-reference-card.pdf) / [Applied R&M Manual for Defence Systems Ch.26 GSN（PDF）](https://www.sars.org.uk/BOK/Applied%20R&M%20Manual%20for%20Defence%20Systems%20(GR-77)/p3c26.pdf) / [ASEMS Online: GSN and Claim Trees](https://www.asems.mod.uk/toolkit/goal-structuring-notation-and-claim-trees)（取得日 2026-08-06）

**Context と Assumption の実務上の区別（本メモの整理）:**

- **Context は「主張が何について述べているかを確定させるもの」**。取り違えると主張の意味が変わる
- **Assumption は「真であると仮定したが、検証していないもの」**。偽なら**論証そのものが崩れる**
- **Justification は主張の意味を変えない**

**本 Issue への含意（重要）:** T1〜K3 の 14 項目は、GSN の語彙では明確に **Assumption** である。すなわち「**偽であれば理想モデルという論証全体が成立しない**」もの。この位置づけを明示すると、なぜ決裁で見る必要があるかが論理的に説明できる。

#### 3.6.2 Dynamic safety case（前提を実行時に監視する）

**【二次（PDF 取得、ただし書誌情報に不整合あり）】** "Dynamic Safety Cases for Frontier AI"（Ben Smith, Francesca Rossi）は、安全ケースを静的な文書ではなく**継続的に更新されるもの**として扱う枠組みを提案する。

- 安全論証の基礎にある**前提は、システムと文脈の変化により無効化されうる**
- 必要な要素は 3 つ: (1) 安全推論における**重要な前提の特定**、(2) 前提が崩れたことを検出する**継続的な監視**、(3) 前提が崩れたときに**作動する仕組み（triggering mechanism）**
- **defeater**（論駁子）— 安全上重要な前提の妥当性を掘り崩す条件や証拠。検出されれば、その前提はもはや成立しないことを示す
- 前提が崩れた場合の**対応プロトコル**を用意する
- 出典: [arXiv 2412.17618](https://arxiv.org/pdf/2412.17618)（取得日 2026-08-06）
- **【要注意】** 取得した PDF 本文中の日付表記は 2023-12-23 だが、arXiv ID は 2412 系（2024-12 投稿を示す）である。**書誌情報に不整合があるため、日付を引用する場合は再確認が必要**（§7）。内容の骨子（前提の特定・監視・作動）は本メモの用途には十分だが、**査読を経た文献ではない可能性がある**

**本 Issue への含意:** **「前提 → 監視 → 崩れの検出 → 作動」という 4 段構成は、ABP の「前提 → signpost → shaping/hedging」と実質的に同型**である。異なる 2 分野（戦略計画と安全工学）が独立に同じ構造へ到達していることは、この構造の妥当性の傍証になる。

#### 3.6.3 ISO/IEC TR 5469 の「10 の assurance の柱」

**【二次・再利用】** `123-safety-verification.md` §2.1 が記録するとおり、ISO/IEC TR 5469:2024 は「10 の assurance の柱（pillars of assurance）」を提示し、AI システムの assurance case を支える構成としている（同メモでも二次情報による記述）。**本メモではこれ以上の一次確認を行っていない。**

### 3.7 先行指標（leading indicator）と遅行指標（lagging indicator）

**【二次】** 労働安全分野の整理は次のとおり。

- **先行指標** — 能動的監視（active monitoring）の一形態。**望ましい安全成果を出すために不可欠なプロセスや投入の測定**であり、少数の重要なリスク管理システムに焦点を当ててその継続的な有効性を確認する
- **遅行指標** — 反応的監視（reactive monitoring）の一形態。特定の事象・事故の報告と調査を要し、**望ましい安全成果が失敗した／達成されなかったときに判明する**
- **設計原則**: OSHA は先行指標を **SMART**（Specific, Measurable, Achievable, Relevant, Time-bound）で設計することを推奨する
- **統合の原則**: 良い安全衛生プログラムは「**先行指標で変化を駆動し、遅行指標で有効性を測定する**」
- 出典: [OSHA Leading Indicators](https://www.osha.gov/leading-indicators) / [Using leading and lagging indicators to select safe contractors（PMC6225369）](https://pmc.ncbi.nlm.nih.gov/articles/PMC6225369/)（取得日 2026-08-06）
- **【未確認】** HSE / OECD の一次ガイダンス（HSG254 等）は本調査では取得していない

**本 Issue への含意:** 前提の崩れを測る指標は、**遅行指標では役に立たない**。「本番障害が起きた」「手戻りが発生した」は前提が崩れた**結果**であり、そのときには既に決裁を通過している。**signpost は定義上、先行指標でなければならない。** ただし SMART の "Measurable" を満たせるのは §2 で見たとおり T4・O1・O2・O3・K3 に限られる。

---

## 4. C. 「決裁ブロッカーにする」ことの是非

### 4.1 逸脱を制度として承認する枠組み — NASA の deviation / waiver

**【確認（NASA NODIS の規程本文および NASA Software Engineering Handbook で確認）】** NASA は要求への不適合を「例外」ではなく**制度化された手続**として扱う。

- **deviation（デビエーション）** — 要求が、実装される階層で構成管理下に置かれる**前**に、その要求を満たさないことを文書で認可するもの
- **waiver（ウェーバー）** — 要求が構成管理下に置かれた**後**に、その要求を満たさないことを文書で認可するもの
- **より広く**: deviation と waiver は、特定の要求に影響する**文書化された合意**であり、要求の修正または要求からの解放を意図的に許すもの
- **救済の 4 類型**: NASA の SMA 要求に対する救済は 4 種類あり、プログラム／プロジェクト／施設のライフサイクルの異なる時点で申請されうる。**nonapplicable determination（非適用判定）／ tailoring（テーラリング）／ deviation ／ waiver**
- **承認権限**: deviation / waiver の承認権限は、**免除される当該要求について責任と監督を正式に委任された個人**である。委任は文書化されなければならない
- **申請先**: NPR 7120.5C の要求に対する deviation / waiver の要請は、文書化のうえ、センター長、プログラムマネージャ、ミッション本部（またはミッション支援室）、および該当する GPMC の承認へ提出される

- 出典: [NASA Software Engineering Handbook SWE-126 "Waiver and Deviation Considerations"](https://swehb.nasa.gov/spaces/7150/pages/16450524/SWE-126+-+Waiver+and+Deviation+Considerations) / [NPR 7120.5C Chapter 3（NODIS）](https://nodis3.gsfc.nasa.gov/displayCA.cfm?Internal_ID=N_PR_7120_005C_&page_name=Chapter3) / [NPR 7150.2A Chapter 6（NODIS）](https://nodis3.gsfc.nasa.gov/displayCA.cfm?Internal_ID=N_PR_7150_002A_&page_name=Chapter6) / [NPR 8715.3C NASA General Safety Program Requirements（NODIS）](https://nodis3.gsfc.nasa.gov/displayAll.cfm?Internal_ID=N_PR_8715_003C_&page_name=ALL)（取得日 2026-08-06）

**本 Issue への含意（決定的）:**

1. **世界で最も安全に厳格な組織の一つが、「要求を満たさないまま進む」ことを禁止していない。** 禁止しているのは「**承認なしに**満たさないまま進むこと」である
2. **4 類型の区別が有用である。** 「非適用（そもそも当てはまらない）」「テーラリング（要求の形を変える）」「デビエーション（事前の免除）」「ウェーバー（事後の免除）」。**本標準の前提の崩れも、少なくとも「そもそも当該前提が関係しない工程」と「関係するが充足していない工程」を区別すべき**である
3. **承認権限は「当該要求の責任者」に紐づく。** 職位ではなく責任の所在に紐づけている点は、本標準の D-0 体制図・決裁権限マトリクスと同じ設計思想である
4. **deviation と waiver の分岐点は「構成管理下に入ったか」である。** 本標準に写像すると「**その前提を含む計画がゲートを通過したか**」が分岐点になる

### 4.2 測定が懲罰と結びつくと測定が無効化される

**【二次】** Goodhart の法則（「測度が目標になると、それは良い測度でなくなる」。Charles Goodhart、1975 年の金融政策に関する講演に由来）は、前提の崩れの測定にも当てはまる。

- **ゼロディフェクト文化との強い結びつき**: 理由を問わず指標未達が許容されない組織では、指標が目標になり未達に負の帰結が伴うため、人々は単に「相手が聞きたいことを言う」ようになる
- **複雑系の反作用**: 指標に強く依存して系を操縦すると、系は行動を変え、誘因をゲームし、努力を測定可能なものへ移し、**失敗を影へ押しやる**ことで押し返す。指標が地位・賞与・存続に結びついているとき、この歪みは穏やかには現れない
- **明示的な帰結**: 目標達成で報酬、未達で懲罰と分かっていれば、人は他の悪影響を伴ってでもその目標に合わせて行動を最適化する
- 出典: [Psych Safety "Goodhart's Law, Campbell's Law, and the Cobra Effect"](https://psychsafety.com/goodharts-law-campbells-law-and-the-cobra-effect/) / [Splunk "What is Goodhart's Law?"](https://www.splunk.com/en_us/blog/learn/goodharts-law/)（取得日 2026-08-06）
- **【未確認】** Goodhart の 1975 年講演原文、および Campbell（1979）の原典は本調査では未取得

**本 Issue への含意:** 本標準は既に「欠陥注入による検出能力の測定は工程単位で行い、個人単位の算出は禁止」という規定を持つ。**前提の崩れの測定にも同じ配慮が必要**である。とくに危険なのは次の構造である。

- 「前提が崩れていると決裁が止まる」 → 「前提が崩れていると報告すると自分のプロジェクトが止まる」 → **「崩れていない」と報告する** → 前提監視の仕組みが「充足している」という虚偽の記録を生産する装置になる

**これは §5 の結論「止めるのではなく可視化して受容の決裁を求める」を、実効性の観点から支持する最も強い論拠である。**

### 4.3 「前提が崩れている組織は多い」ことへの対処

**【本メモの解釈。実証ではない】** §2 の整理から、次が言える。

- **O3 は既定で崩れている**（AI 支援 PR のサイズが人間の検出能力の上限に達している）
- **T3 は崩れが類型として公表されている**（CI ゲーミング）
- **P3 は機序まで判明した形で崩れている**（レビュアー感情の逆転、自動化バイアス）
- **T4 は充足率が不明**

つまり **14 前提のうち少なくとも 3 つは、多くの組織で既に崩れている蓋然性が高い**。これらを決裁ブロッカーにすれば、AI を使う開発は事実上どこも先へ進めない。**「止める」設計は運用開始と同時に無効化される（全員が例外申請するか、報告しなくなる）。**

---

## 5. 日本の組織文化における実態

**【未確認】** 日本企業における「前提の崩れの申告」に関する一次データは、本調査では発見できなかった。`135-role-boundary-2026-08.md` §6 および `109-110-autonomy-levels.md` §9.4 と同じ結論である。

**【本メモの解釈。実証されていない】** 間接的に接続できる材料は次のとおり。

- **稟議・承認印の文化と「充足している」という虚偽記録の親和性** — `135-role-boundary-2026-08.md` §6 が指摘する「確認印が実質を伴わないまま責任だけを配分する装置になりうる」構造は、前提充足のチェックリストにそのまま当てはまる。**チェックボックス形式で前提の充足を自己申告させる設計は、日本の組織文化では特に形骸化しやすい**と推定される
- **「前提が崩れている」を認めることの政治性** — 前提の崩れは、多くの場合**組織側の不備**（O1 決裁の滞留、O3 レビュー帯域の不足、T4 CI 基盤の不在）を意味する。現場が申告すると上位組織の問題を指摘することになる。**申告主体を現場に置く設計は、日本の組織では機能しにくい**と推定される。したがって**機械が観測して自動で記録する形式**（人が申告しない形式）を優先すべきである
- **例外申請の実務は既に存在する** — 日本の製造業・SI では「特採（特別採用）」「逸脱申請」の運用が定着している業界がある。NASA の waiver と同型の制度が既に理解されている土壌があるため、**「受容の決裁」という概念の導入障壁は低いと推定される**。ただしこの点は**本メモの推定であり、裏づけとなる調査を実施していない**

---

## 6. 考察（事実と分離）

### 6.1 14 前提は同じ種類のものではない

§2 の整理から、14 前提は**観測可能性という軸で 3 群に分かれる**。これが本 Issue の設計の中核になる。

| 群 | 前提 | 性質 |
|---|---|---|
| **群A: 機械が観測できる** | T4, O1, O2, K3, O3（部分） | 自組織のリポジトリ・体制図・CI・PR 統計を見れば判定できる。**外部の分布データを必要としない** |
| **群B: 測定できるが人間の手間を要する** | T3, P3, O3（帯域の実測） | 欠陥注入、CI ゲーミング検出、レビュー実績の集計。**既に本標準が個別対処を持つ** |
| **群C: 観測手段が確立していない** | T1, T2, P1, P2, P4, K1, K2 | 「能力があるか」「言語化できているか」を測る合意された手段がない |

**この分類が示す最も重要なこと: 群C を決裁ゲートの判定条件にしてはならない。** 判定できないものを判定条件に置くと、判定は主観になり、主観の判定は §4.2 の Goodhart 効果に直撃される。

### 6.2 本標準に欠けているのは shaping action ではなく signpost と hedging action

§3.1 で述べたとおり。オーナーの「個別対処は既にある、体系へ引き上げよ」という指示は、ABP の語彙で正確に表現できる。**既存の個別対処はすべて shaping action（崩れを防ぐ行動）である。** 本 Issue が足すべきは:

- **signpost** — 崩れの兆候を捉える先行指標（§3.7）
- **hedging action** — 崩れた状態で、どう進むかの規定

**hedging action がとくに重要である。** 本標準は現在「前提が崩れていたらどうするか」をほとんど書いていない。§4.3 が示すとおり多くの組織で既に崩れている以上、**hedging action こそが本標準の実用性を決める。**

### 6.3 T1〜T4 と T-0〜T-4 の記号衝突は既に実害の域にある

指示にあったとおり、本標準は既に次の 2 つを使っている。

- **T1〜T4** — 理想モデルの技術前提（本 Issue の対象）
- **T-0〜T-4** — 移行段階

ハイフンの有無だけが区別である。**これは記号設計として成立していない。** 理由は 3 つ。

1. **日本語文書では「T1」と「T-1」の書き分けが揺れる。** 執筆者・textlint・変換ツールのいずれの段階でもハイフンが落ちうる
2. **音声・口頭で区別できない。** 会議で「ティーワン」と言ったときどちらか分からない
3. **意味的にも紛らわしい。** どちらも「技術に関する段階／条件」に読める

さらに、**T-0 の前提条件7項目が T4（自動テストと CI 基盤）と内容的に重なっている**ことが、混同を実害に変える。すなわち「T-0 の前提条件」と「前提 T4」は別物なのに、記号も内容も近い。

**本メモの結論: 前提側の記号を改める必要がある。** 移行段階 T-0〜T-4 の方が本標準内での参照が多く、変更コストが高いと推定されるため、**前提側を改称するのが合理的**である。具体案は §7 の提言 5。

### 6.4 「崩れ」は二値ではない

§2.1（T2）で見たとおり、T2 は「エージェントが長期タスクを自律遂行できるか」ではなく「どの長さまでなら、どの成功率で成立するか」という連続量である。同様に O3 も「追随できる/できない」ではなく「どれだけの流量までなら追随できるか」である。

**前提を二値（充足/不充足）で扱う設計は、実態を表現できない。** 少なくとも 3 段階（充足／劣化／不成立）が要る。これは本標準が既に持つ Sev1-3 や CL0-CL3 と同じ作法である。

---

## 7. 本標準への提言

### 提言 1: 前提ごとの崩れやすさの評価

指示された 3 分類で整理する。**「崩れやすい」と断定できるものは 3 つしかない。**

| 前提 | 崩れやすさの評価 | 根拠 |
|---|---|---|
| **T1** 高品質なモデル | **データあり（崩れにくい方向）** ただし前提文の後半（人間の検証で吸収できる範囲）は O3 と不可分 | SWE-bench Verified 飽和、ただし Pro との 15pt 差（§2.1） |
| **T2** 長期タスクの自律遂行 | **データあり（連続量。二値評価は不適）** | METR TH1.1、倍加 88.6 日。要求成功率の関数（§2.1） |
| **T3** AI の自己検証 | **データあり。崩れやすい** | GitHub「CI ゲーミング」、判定器の独立性喪失（§2.1） |
| **T4** 自動テストと CI 基盤 | **評価不能（分布データなし）。ただし自組織では機械判定可能** | DORA に充足率分布なし（§2.1） |
| **P1** 価値判断能力 | **評価不能（実証なし）** | §2.2 |
| **P2** 言語化能力 | **評価不能（実証なし。流通数値は採用不可）** | CHAOS 数値は Eveleens & Verhoef により否定（§2.2） |
| **P3** 検証能力 | **データあり。崩れやすい。機序も判明** | 自動化バイアス、Bainbridge、MSR '26 レビュアー感情（§2.2） |
| **P4** 能力の非希少性 | **評価不能（実証なし）** | BairesDev 調査は方向性のみ（§2.2） |
| **O1** 決定権限の所在 | **評価不能（実証なし）。ただし D-0 で機械検査済み** | §2.3 |
| **O2** 説明責任の一意性 | **評価不能（実証なし）。ただし D-0 で機械検査済み** | arXiv 2606.31498 は「記述する語彙がない」ことを示す（§2.3） |
| **O3** 検証キャパシティ | **データあり。既定で崩れている** | Cisco 研究（200〜400 LOC／毎時 400 行）と AI 支援 PR 約 400 行の突合（§2.3） |
| **K1** ビジネス意図の言語化可能性 | **評価不能（測る枠組み自体が未成立）** | 知識管理研究の到達点は「ケース依存」（§2.4） |
| **K2** 暗黙知の表出化 | **評価不能（同上）** | §2.4 |
| **K3** ガードレールの符号化 | **評価不能（分布データなし）。ただし機械判定可能** | §2.4 |

**この表そのものを本標準へ載せることを推奨する。** 「証拠がある前提とない前提を区別して明示する」ことは、前提一覧の信頼性をむしろ高める。

### 提言 2: 「止める」か「可視化して受容を求める」か — 結論

**「可視化して受容の決裁を求める」を採る。「止める」は採らない。** 根拠は 4 つ。

1. **前例がそうなっている。** NASA は deviation / waiver として、要求を満たさないまま進むことを**承認つきで許す**制度を持つ（§4.1）。安全に最も厳格な組織が禁止していないものを、本標準が禁止する理由はない
2. **止めると測定が無効化される。** Goodhart 効果により、崩れの申告が決裁停止に直結すると、申告そのものが止まる（§4.2）。**測れなくなることは、崩れたまま進むことより悪い**
3. **既に多くの組織で崩れている。** 少なくとも O3・T3・P3 は既定で崩れている蓋然性が高い（§4.3）。止める設計は運用開始と同時に全件例外になる
4. **段階的解放という先例がある。** DDP は前提の検証状況に応じて**資金の解放量を変える**（§3.2）。二値の可否ではなく、進める範囲を変えるのが実務の作法である

**ただし「受容を求める」には 3 条件を課すべきである。**

- **(条件1) 受容の決裁者は、その前提に責任を負う者である**（NASA の「委任が文書化された承認権限」に倣う）。**上位職位ではなく責任の所在**に紐づける
- **(条件2) 受容には有効期限と再評価の契機を付す**（`135-role-boundary-2026-08.md` §4.2 が示す「周期より契機」の原則）
- **(条件3) 受容の記録は公開台帳に残す。** 記録が残らない受容は、承認なしに進んだのと同じである

**例外: 「止める」を採るべき唯一の場合。** 前提の崩れが、本標準の安全リスクアセスメント（Hz/Hs/Ex/Oc/Av）で SR3 以上に該当する工程に関わるとき。安全関連ソフトウェアでは、逸脱の受容そのものが規格適合の問題になるため、本標準の判断で受容してよい範囲を超える。この場合は「本標準が止める」のではなく「**適用規格の要求により受容できない**」と書くのが正確である。

### 提言 3: 崩れを観測可能な事象として定義する案

第4章の重大度（Sev1-3）と同じ作法、すなわち**判断ではなく観測された事象で定義する**。群A（機械が観測できる）を優先し、群C は定義しない。

**定義の書き方の原則:**

- 各前提について「**何が観測されたら劣化とみなすか**」を、リポジトリ・体制図・PR 統計・CI 実行ログから機械的に取れる事象で書く
- **人の自己申告を判定条件にしない**（§5 の日本文脈、§4.2 の Goodhart 効果）
- 群C の 7 前提は**判定条件を持たない。** 代わりに「この前提は測定手段が確立していない」と明記し、**測定手段が確立したら追加する**という将来拡張の口を開けておく

**具体案（群A のみ。数値は各組織が定める初期値であり、本メモが根拠を示せる値ではない）:**

| 前提 | 観測対象 | 劣化とみなす事象の例 |
|---|---|---|
| **T4** | CI 設定、テスト実行結果 | 対象リポジトリに CI 定義が存在しない／直近 N 回の既定ブランチのビルドが赤のまま／テストスイートの実行時間が閾値超で日常的にスキップされている |
| **O1** | D-0 体制図 | 決裁権限マトリクスに割当のない決裁事項が存在する／同一決裁事項に複数名が割り当てられている |
| **O2** | D-0 体制図 | 結果責任者が 1 名に定まっていない工程が存在する |
| **O3** | PR 統計、レビュー SLA 実績 | レビュー応答 SLA（1 営業日）または判定 SLA（2 営業日）の逸脱率が閾値超／1 人あたりの日次レビュー割当が上限（3〜4 件）を超えている／レビュー対象の変更行数が 400 行を超える PR の比率が閾値超 |
| **K3** | 指示資産、コンテキスト基盤 | 強制層のルールが CI から参照されていない／コンテキスト基盤の陳腐化検知が最終更新から N 日以上作動していない |
| **T3** | CI 履歴、PR 差分 | AI が関与した PR でテストの削除・カバレッジ閾値の引き下げ・ワークフロー条件の改変が検出された（GitHub の「CI ゲーミング」類型に対応） |

**とくに O3 の「400 行」は、本メモが唯一、外部の実証から直接導けた閾値である**（Cisco 研究の 200〜400 LOC 上限。§2.3）。ただし当該研究は 2000 年代のコードレビュー実務を対象としており、**現代の言語・PR 文化への外挿は検証されていない**。本標準に載せるなら「出典と外挿の限界を併記する」ことを条件とする。

**3 段階で表現する**（§6.4）。二値では実態を表せない。

### 提言 4: 既存の個別対処と重複を作らない体系化の方法

**方法: 前提の台帳を新設し、既存の対処をそこから参照する。台帳に対処の実体を書かない。**

具体的には次の構造をとる。

- 前提の台帳は、各前提について **(a) 前提文、(b) 観測対象と劣化の定義（提言3）、(c) 既存の shaping action への参照、(d) hedging action、(e) 現在の充足状態と最終観測日、(f) 受容の記録** の 6 欄を持つ
- **(c) は参照のみ。** 「O1・O2 → D-0 体制図」「O3 → レビュー SLA」「P3 → 欠陥注入」「K1〜K3 → 指示資産 3 層」「T4 → T-0 の前提条件7項目」と書くだけで、内容を再掲しない
- **既存の規定は一切書き換えない。** 台帳は既存規定の上に載る索引であり、既存規定を置き換えるものではない
- **リスクレジスタとは統合しない。** §3.3 のとおり、前提は「確率×影響」ではなく「成立しているか」で評価するものであり、評価軸が違う。R1〜R3 や安全リスクアセスメント（Hz/Hs/Ex/Oc/Av/SR1-4/RRS1-3）とは別台帳とする
- **ADR とも統合しない。** §3.5 のとおり、ADR は採用済み本文を書き換えない規約を持つが、前提の充足状態は変化する

**新設するのは (b) (d) (e) (f) の 4 欄だけである。** (a) は既にあり、(c) はすべて既存規定への参照である。これが「重複を作らない体系化」の具体形になる。

**決裁ゲートとの接続:** 既存の G-1〜G-8 に新しいゲートを足さない。**各ゲートの通過条件に「関係する前提の充足状態が台帳に記録されており、劣化・不成立のものについて受容の決裁が取られていること」を 1 項足す**。ゲートを増やすとゲート数が増え、それ自体が O3（検証キャパシティ）を圧迫する。

### 提言 5: 新しい記号の要否

**必要である。かつ、既存前提の記号 T1〜T4 の改称も必要である。**

**(5-1) 既存記号の衝突の解消（必須）**

§6.3 のとおり、**T1〜T4（技術前提）と T-0〜T-4（移行段階）はハイフンの有無だけで区別されており、記号設計として成立していない。** 前提側を改称する。

- **`A-T1`〜`A-T4` / `A-P1`〜`A-P4` / `A-O1`〜`A-O3` / `A-K1`〜`A-K3`**（A = Assumption）

`A-` 接頭辞は既存記号（S0-S2 / SG-0..2 / G-1..8 / H-1..3 / B-1..4 / D-0 / R1-R3 / L1-L3 / E1-E3 / Sev1-3 / Hz・Hs・Ex・Oc・Av・SR1-4・RRS1-3 / T-0..4 / TG-1..3 / EN-1..3 / CL0-CL3）のいずれとも衝突しない。**Av（回避可能性）とは接頭辞の形が違い、`A-` はハイフン付きで一貫させれば区別できる**が、この点は清書時に確認すること。

**(5-2) 新設する記号（3 系統）**

| 記号 | 意味 | 既存との衝突確認 |
|---|---|---|
| **`AC-0` / `AC-1` / `AC-2`** | 前提の充足状態。AC-0 = 充足、AC-1 = 劣化、AC-2 = 不成立 | `AC` は未使用。`CL0-CL3` とは桁数も意味も異なる |
| **`SP-<前提記号>-<連番>`**（例: `SP-A-O3-1`） | signpost。当該前提の劣化を検出する観測条件 | `SP` は未使用。`SR1-4`（安全要求水準）と接頭辞 2 文字目が異なる |
| **`AW-<連番>`** | assumption waiver。前提の劣化・不成立を受容した決裁の記録 | `AW` は未使用。`Av` とは大文字小文字と桁が異なる |

**(5-3) 記号を増やすことの是非（正直な留保）**

本標準は既に 15 系統以上の記号を持つ。**記号の追加は、それ自体が学習コストと誤用リスクを生む。** 本メモは 3 系統の追加を提案するが、次の代替案も成立する。

- **`AC-0/1/2` のみを新設し、`SP` と `AW` を新設しない案** — signpost は台帳の「観測対象」欄に自然文で書き、受容は既存の決裁記録の一種として扱う。記号は 1 系統の追加で済む
- 本メモは**この縮小案を推奨する。** 理由は、`SP` と `AW` に個別の識別子が要るのは「他文書から個別に参照する必要があるとき」だけであり、現時点でその必要は生じていないため。**識別子は参照の必要が生じてから足すのが正しい順序である。** ただし `A-` 接頭辞への改称（5-1）は、衝突が既に実害の域にあるため**先送りしない**ことを推奨する

---

## 8. 未確認事項・追加調査が必要な穴

**優先度: 高（提言の根拠に影響する）**

- **T4 の充足率分布。** 「どれだけの組織が包括的な自動テストと CI 基盤を持つか」を示すデータを発見できなかった。DORA レポート本体（PDF）にケイパビリティ別の充足率分布が載っている可能性があるが、本調査では本文を取得していない。**この穴が埋まらない限り、T4 の崩れやすさは「評価不能」のままである**
- **P1・P2・P4 の実証。** 「価値判断能力」「言語化能力」が希少資源であることの実証データは発見できなかった。**そもそもこれらを測る合意された尺度が存在しない可能性が高い**。存在しないことの確認（negative result）自体を、追加調査で確定させる価値がある
- **arXiv 2412.17618（Dynamic Safety Cases）の書誌情報。** 取得 PDF の日付表記（2023-12-23）と arXiv ID（2412 = 2024-12）が不整合。査読の有無も未確認。**この文献に依拠して「defeater」の語を本標準へ導入するなら、書誌の再確認が必要**
- **Cisco / SmartBear 研究の外挿可能性。** 「200〜400 LOC」「毎時 400 行」は 2000 年代の研究である。現代の言語・フレームワーク・PR 文化における再現研究があるかを確認していない。**提言 3 の O3 閾値の妥当性に直結する**

**優先度: 中**

- **HSE / OECD の先行指標ガイダンス一次文書**（HSG254 等）。§3.7 は OSHA と学術論文のみで構成しており、OECD ガイダンスは未取得
- **PMBOK 第7版本文における assumption log の定義**。§3.3 はすべて二次解説である
- **Yang, Liang, Avgeriou のマッピング研究本文**。要旨のみ確認。**とくに「assumption をどう定義しているか」の 21 件の内訳は、提言 3 の定義の書き方に直接効く**ため、優先度は高めである
- **ABP の原著（Dewar）本文**。Cambridge の章要約と RAND レポートの存在確認にとどまり、5 段階の詳細手順（とくに「load-bearing かつ vulnerable」の判定基準）は未読。**14 前提のうちどれが load-bearing かを決める作業に必要**
- **ISO/IEC TR 5469 の「10 の assurance の柱」の一次確認**。`123-safety-verification.md` の時点から二次のままである
- **日本の「特採」「逸脱申請」実務の一次資料**。§5 の推定を裏づけていない

**優先度: 低**

- Goodhart（1975）および Campbell（1979）の原典
- 知識管理研究（Foss & Pedersen ほか）の本文。要旨のみ確認

---

## 9. 調査枠の状況

本セッションの Web 検索枠は共有上限 200 回で、本タスク開始時点で約 170 回使用済みとの指示を受けた。**本タスクでは検索 12 回・ページ取得 2 回の計 14 回を使用した**（指示された「20 回程度」の範囲内）。枠の枯渇には至っていない。

**枠の制約により実施しなかった調査**は §8 に列挙したとおりである。とくに **T4 の充足率分布（DORA レポート本文の取得）** と **ABP 原著の load-bearing 判定基準** は、残枠があれば最優先で追加すべきである。

---

## 10. 出典一覧

### 一次情報（規格・原典・発行機関の公式文書）

- **ABP**: [Assumption-Based Planning and Force XXI（RAND / DTIC ADA324935）](https://apps.dtic.mil/sti/tr/pdf/ADA324935.pdf) / [Cambridge UP: Assumption-Based Planning, Ch.4 Step 2](https://www.cambridge.org/core/books/abs/assumptionbased-planning/step-2-identifying-loadbearing-vulnerable-assumptions/D46A29C69F2D06C05FF4DCF4ED8D697C) / [同 Ch.6 Step 4](https://www.cambridge.org/core/books/abs/assumptionbased-planning/step-4-developing-shaping-actions/F026A5D4C8AC99646EC9D2D8914A7B79) / [同 Preface](https://www.cambridge.org/core/books/abs/assumptionbased-planning/preface/9C3792402B4A58130EA60286B58B3341) / [書籍サンプル PDF](https://catdir.loc.gov/catdir/samples/cam033/2002073460.pdf)
- **DDP**: [McGrath & MacMillan, "Discovery-Driven Planning"（HBR 1995、PDF）](http://mengwong.com/school/HarvardBusinessReview/Discovery%20Driven%20Planning.pdf) / [HBR "A Refresher on Discovery-Driven Planning"（2017-02）](https://hbr.org/2017/02/a-refresher-on-discovery-driven-planning)
- **GSN**: [GSN Community Standard Version 1（FAA 掲載）](https://www.faa.gov/about/office_org/headquarters_offices/ang/redac/redac-sas-201503-gsn-community-standard-v1.pdf) / [GSN リファレンスカード（York HISE）](https://s3-eu-west-1.amazonaws.com/s3.spanglefish.com/s/22631/documents/safety-documents/gsn-reference-card.pdf) / [Applied R&M Manual Ch.26](https://www.sars.org.uk/BOK/Applied%20R&M%20Manual%20for%20Defence%20Systems%20(GR-77)/p3c26.pdf) / [ASEMS Online](https://www.asems.mod.uk/toolkit/goal-structuring-notation-and-claim-trees)
- **NASA**: [SWE-126 Waiver and Deviation Considerations](https://swehb.nasa.gov/spaces/7150/pages/16450524/SWE-126+-+Waiver+and+Deviation+Considerations) / [NPR 7120.5C Ch.3](https://nodis3.gsfc.nasa.gov/displayCA.cfm?Internal_ID=N_PR_7120_005C_&page_name=Chapter3) / [NPR 7150.2A Ch.6](https://nodis3.gsfc.nasa.gov/displayCA.cfm?Internal_ID=N_PR_7150_002A_&page_name=Chapter6) / [NPR 8715.3C](https://nodis3.gsfc.nasa.gov/displayAll.cfm?Internal_ID=N_PR_8715_003C_&page_name=ALL)
- **先行指標**: [OSHA Leading Indicators](https://www.osha.gov/leading-indicators)
- **DORA**: [Capabilities: Test automation](https://dora.dev/capabilities/test-automation/) / [Accelerate State of DevOps Report 2024](https://dora.dev/research/2024/dora-report/)
- **論文**: [Yang, Liang, Avgeriou "Assumptions and their management in software development: A systematic mapping study"（IST）](https://www.sciencedirect.com/science/article/abs/pii/S0950584916304189) / [Yang 博士論文（RUG 全文 PDF）](https://research.rug.nl/files/54372591/Complete_thesis.pdf) / [Eveleens & Verhoef "The Rise and Fall of the Chaos Report Figures"](https://www.researchgate.net/publication/220092178_The_Rise_and_Fall_of_the_Chaos_Report_Figures) / [Foss & Pedersen ほか "Codification and tacitness as knowledge management strategies"](https://www.sciencedirect.com/science/article/pii/S1047831000000432) / [Tacitness, codification of technological knowledge（Research Policy）](https://www.sciencedirect.com/science/article/abs/pii/S0048733301001135) / [Kambhampati "Polanyi's Revenge"（CACM）](https://cacm.acm.org/opinion/polanyis-revenge-and-ais-new-romance-with-tacit-knowledge/) / [Using leading and lagging indicators to select safe contractors（PMC6225369）](https://pmc.ncbi.nlm.nih.gov/articles/PMC6225369/) / [Dynamic Safety Cases for Frontier AI（arXiv 2412.17618。書誌に不整合あり）](https://arxiv.org/pdf/2412.17618)
- **コードレビュー研究（ベンダー研究だが標本・方法が明示）**: [Code Review at Cisco Systems（SmartBear PDF）](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf) / [11 Best Practices for Peer Code Review（PDF）](https://static1.smartbear.co/support/media/resources/cc/11_best_practices_for_peer_code_review_redirected.pdf) / [SmartBear Best Practices for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)

### 二次情報（解説・調査・実務者記事。裏取り未了を含む）

- [ProjInsights: Assumption Log](https://www.projinsights.com/what-is-assumption-log-and-its-importance-in-project-management/) / [PM Academy: Risk Register](https://projectmanagementacademy.net/resources/blog/risk-register-in-project-management/) / [TrustEd Institute: PMBOK 7 Logs and Registers](https://trustedinstitute.com/concept/pmp-pmbok7/models-methods-artifacts/logs-and-registers/)
- [Psych Safety: Goodhart's Law, Campbell's Law, and the Cobra Effect](https://psychsafety.com/goodharts-law-campbells-law-and-the-cobra-effect/) / [Splunk: What is Goodhart's Law?](https://www.splunk.com/en_us/blog/learn/goodharts-law/)
- [BairesDev Q2 2026 Dev Barometer（プレスリリース）](https://www.bairesdev.com/press/16-percent-of-juniors-fully-understand-ai-code/) / [GlobeNewswire 版](https://www.globenewswire.com/news-release/2026/06/11/3310571/0/en/only-16-of-senior-developers-say-junior-engineers-fully-understand-ai-generated-code-bairesdev-survey-finds.html)
- [adr.github.io](https://adr.github.io/) / [ReflectRally: Architecture Decision Logs](https://reflectrally.com/architecture-decision-logs/) / [Architecture Decision Records in Practice（ECSA 2024 PDF）](https://rebekkaa.github.io/files/2024_ECSA.pdf) / [One Size Fits All?（arXiv 2604.27333）](https://arxiv.org/html/2604.27333v1)
- [Polanyi's paradox（Wikipedia、書誌確認用）](https://en.wikipedia.org/wiki/Polanyi%27s_paradox) / [Discovery-driven planning（Wikipedia）](https://en.wikipedia.org/wiki/Discovery-driven_planning)

### 本プロジェクト内の既存調査メモ（再利用元）

- `research/phase2/20260804-agentic-development-update.md` — §2-1, §2-2, §3, §5, §5-3, §4-2
- `research/phase3-gap-analysis/135-role-boundary-2026-08.md` — §2.4, §2.5, §3.2, §3.4, §4.1, §4.2, §5.2, §6
- `research/phase4-standard/123-safety-verification.md` — §2.1, §5.2, §6.2
- `research/phase4-standard/109-110-autonomy-levels.md` — §5.4, §5.5, §10.3
