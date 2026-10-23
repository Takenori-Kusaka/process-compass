# #296 外部調査 2: 固定定数の外部規格・業界実務

- 調査日: 2026-10-23(全 URL の取得日も同日)
- 区分: 一次 = 規格本文・ベンダー公式文書・査読論文/プレプリント本体、二次 = 解説記事・ブログ・要約
- 注意: 規格本文(ISO 19011, 29119, IEC 62304, DO-178C, ISO 2859-1)は有償で本文を直接取得できず、二次資料経由の箇所を明示する

---

## 1. カバレッジゲート(全体閾値 / 差分カバレッジ / ラチェット)

### 知見

- **SonarQube「Sonar way」品質ゲート**(一次: https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates )
  - 条件は**新規コード**に対してのみ掛かる。「New code test coverage is greater than or equal to 80.0%」「Duplication in the new code is less than or equal to 3.0%」
  - **fudge factor**: 新規の被覆対象行が 20 行未満なら coverage・重複条件を無視する。理由は「小さな変更では軽微な問題が不釣り合いにゲートを左右する」。既定有効、管理者が上書き可
  - 旧コードの修繕に労力を割かず「新規コードの品質を高く保つ」という設計思想(Clean as You Code)
- **SonarSource のラチェット(低下禁止)への立場**(二次寄り。公式コミュニティでの社員発言: https://community.sonarsource.com/t/ratcheting-quality-gate-conditions-fail-quality-gate-if-coverage-decreases-from-last-analysis/15317 )
  - ラチェット条件は未提供。「生産的か疑問」とし、代替に「新規コードのカバレッジ閾値を段階的に引き上げる」を提案(2019)。2022 時点で未実装のまま
- **Codecov**(一次: https://docs.codecov.com/docs/commit-status )
  - `project`(全体を base と比較)と `patch`(PR で変更した行のみ)の 2 種類のステータス
  - `target: auto` = base コミットのカバレッジを基準にする(実質ラチェット)。`threshold` で許容低下幅を指定可能
  - 変更行ゼロ時の patch の挙動・ゲーミングへの言及は同ページに記載なし
- **Google のカバレッジ実務**(一次・査読: Ivanković et al., "Code Coverage at Google", ESEC/FSE 2019, https://homes.cs.washington.edu/~rjust/publ/google_coverage_fse_2019.pdf )
  - 全社でのカバレッジ閾値の**強制なし**。プロジェクトがオプトインし、自ら閾値を設定
  - 任意参加の 5 段階アラート。Level 3: 全体 60% / 変更 70%、Level 4: 75% / 80%、Level 5: 90% / 90%。**変更(changelist)単位の閾値を全体より高く置く**構成
  - 開発者調査(n=512)は changelist カバレッジのみを対象。作成時 45%、レビュー時 40% が「よく使う」
  - 安全重要プロジェクトはより厳しい要件と mutation testing を併用
  - 論文はゲーミングを論じていない
- **カバレッジと欠陥検出力の関係**(一次・査読: Inozemtseva & Holmes, ICSE 2014, https://cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf 。2024 年 ICSE Most Influential Paper)
  - テストスイートの規模を制御すると、カバレッジと有効性(mutation 検出)の相関は弱〜中程度。カバレッジを品質目標とすることへの代表的な反証
- **DO-178C**(二次: AdaCore 論文 https://www.adacore.com/uploads/techPapers/couverture_ertss2010.pdf )
  - Level A = MC/DC、B = decision、C = statement、D/E = 要求なし。**ソフトウェアレベル(危険度)で基準の種類を変える**
  - 目的は「要求ベーステストの不足・要求に由来しないコードの検出」。パーセント閾値ではなく、未被覆箇所を解消または正当化する構造
- **IEC 62304**(二次: Johner Institute https://blog.johner-institute.com/iec-62304-medical-software/unit-testing-iec-62304/ )
  - カバレッジ率の数値要求なし。ユニット検証の**受入基準を事前に定めて評価**することを要求。クラス A は省略可、B は静的解析/レビューで可、C は単体テスト必須
  - 100% branch coverage は FDA ガイダンス文脈で言及されるのみ
- **ISO/IEC/IEEE 29119-4**: 技法ごとにカバレッジ測定項目を定義するが閾値を課さない、と理解しているが本文未確認(→確認できなかったこと)
- **ラチェット実務**(二次: 各種ブログ、例 https://dev.to/mnvasil/how-a-test-coverage-ratchet-finally-fixed-the-codebase-everyone-was-afraid-to-touch-2pb5 )
  - レガシー改善の手段として普及。ただし削除による見かけ上の上昇・閾値境界での停滞など運用論のみ

### 実務の幅と対立点

- 全体閾値派(古典的 80%)/ 新規コード閾値派(Sonar)/ ラチェット派(Codecov auto)/ 閾値を強制しない派(Google)
- 小差分の扱いで対立: Sonar は「20 行未満は無視」(小差分 100% 問題を回避する代わりに小差分は素通り)。patch coverage を厳格適用すると 1〜2 行の変更が 0% または 100% の二値になりノイズ化
- 規格系(DO-178C, IEC 62304)は**閾値ではなく「未被覆の説明責任」**を求める

### 標準への含意・選択肢

- 選択肢 A: 全体閾値(固定 %) — 根拠が乏しく、規格系に前例なし
- 選択肢 B: 差分カバレッジ閾値+最小行数(Sonar 型) — 業界の既定に近い。小差分の素通りを別手段(レビュー観点)で補う必要
- 選択肢 C: 低下禁止(ラチェット)+未被覆の理由記録 — 規格系の「説明責任」と整合
- 選択肢 D: 閾値は案件のリスク区分/安全重要度で変える(DO-178C 型) — 本標準の R/CL 区分と親和
- 数値(80%、20 行)はいずれも実証ではなくベンダー既定値。採るなら根拠水準マーク必須

---

## 2. push 時の承認の失効(stale approval)

### 知見

- **GitHub**(一次: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches )
  - `Dismiss stale pull request approvals when new commits are pushed`: PR の**差分が変わる** push で承認を取り消す。Update branch や、merge base に新しい変更が入った場合も失効対象
  - `Require approval of the most recent reviewable push`: 最新の push は**push した本人以外**の承認が必要。既存レビュアーの再承認で充足
  - 失効の粒度はリポジトリ(ルール)単位の on/off のみ。ファイル単位・変更種別単位の選択肢なし
- **GitLab**(一次: https://docs.gitlab.com/user/project/merge_requests/approvals/settings/ )
  - 3 択: 「Keep approvals」/「Remove all approvals when commits are added」/「Remove approvals by Code Owners if their files changed」
  - **コードオーナー単位・ファイル単位**の部分失効が可能(GitHub より細かい)
  - 作成者による承認は既定で禁止。コミッター(rebase した者を含む)を承認者から除外する設定あり
- **Gerrit**(一次: https://asterix-gerrit.ics.uci.edu/Documentation/config-labels.html 。Gerrit 公式ドキュメントのミラー)
  - ラベルごとの `copyCondition`(クエリ式)で承認の持ち越しを宣言
  - `changekind:{REWORK, TRIVIAL_REBASE, MERGE_FIRST_PARENT_UPDATE, NO_CODE_CHANGE, NO_CHANGE}`、`is:MIN/MAX`、`approverin:<group>`、`uploaderin:<group>`、`has:unchanged-files`
  - Code-Review ラベルは既定で trivial rebase と no-change 時に持ち越し。**変更の種類 × 誰が上げたか × 票の値**で持ち越しを決められる最も細かい設計
  - `uploaderin` により「特定グループ(例: ボット)が上げたパッチセットでは持ち越さない/持ち越す」を表現可能
- **Copilot cloud agent**(一次: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/review-copilot-prs )
  - 依頼者自身の承認は必須承認数に**数えない**。別のレビュアーの承認が必要
  - エージェントの push では既定で Actions ワークフローが走らず、人が「Approve and run workflows」を押す
  - 同責任利用ページ(一次: https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent ): 「マージ前に全出力を精査せよ」

### 実務の幅と対立点

- 厳格(全失効)↔ 部分失効(コードオーナー/ファイル)↔ 意味的持ち越し(Gerrit の trivial rebase)
- AI エージェントは push 頻度が高く、全失効だと再承認コストが線形に増える。一方で持ち越しは「承認後に差分を差し込む」攻撃・事故の経路(GitHub の most recent push 承認はこれへの対策)
- Datadog がこの設定の無効化をセキュリティ検知ルールにしている(二次: https://docs.datadoghq.com/security/default_rules/def-000-a0l/ )= 業界では「失効させない」は監視対象の逸脱扱い

### 標準への含意・選択肢

- 規範は「承認の対象 = 承認時点の差分」と定義し、持ち越し条件を**変更の種類**で列挙する形が Gerrit 型で最も表現力が高い
- 選択肢: (a) 差分変化で全失効(GitHub 既定に近い)、(b) 対象ファイルの責任者のみ失効(GitLab 型)、(c) trivial rebase/no-code-change のみ持ち越し(Gerrit 型)
- 「最後の push をした主体(AI を含む)以外の承認」要件はプラットフォーム機能として既存。AI を push 主体として扱う整理が必要
- 失効の頻度コストに関する定量研究は見当たらず(→確認できなかったこと)

---

## 3. AI コーディングエージェントの自己修復・再試行ループの停止条件

### 知見

- **Claude Agent SDK**(一次: https://code.claude.com/docs/en/agent-sdk/agent-loop )
  - 停止条件は `max_turns`(ツール使用往復数)と `max_budget_usd`(費用)。既定は**どちらも無制限**
  - 上限到達時は `error_max_turns` / `error_max_budget_usd` を返す。構造化出力の再試行上限 `error_max_structured_output_retries` あり
  - 「本番エージェントには予算設定が良い既定」。サンプルは `max_turns=30`(根拠の記載なし)
  - 同一失敗の検出機能は文書化なし。hooks(Stop, PostToolUse)で利用者が実装する前提
- **OpenHands Stuck Detector**(一次: https://docs.openhands.dev/sdk/guides/agent-stuck-detector )
  - **同一失敗パターン検出型**。同一 action→同一 observation が 4 回以上、同一 action→エラーが 3 回以上、独白 3 メッセージ以上、2 パターンの交互 6 サイクル以上、context window エラーの反復
- **Devin**(一次: https://docs.devin.ai/essential-guidelines/when-to-use-devin )
  - 再試行回数の記載なし。「使用上限に繰り返し達するならタスクが複雑すぎる」「人が 3 時間以内でできるタスクが目安。長いものは分割」
  - **停止条件ではなくタスク分割と人の介入**で制御
- **GitHub Copilot cloud agent**(一次: https://docs.github.com/en/copilot/responsible-use/copilot-coding-agent )
  - フィードバック/レビューに基づき反復可能。試行回数・時間上限は取得部分に記載なし
- **SWE-agent**: インスタンスあたり費用上限(per_instance_cost_limit)型の設定が知られるが、公式文書の該当箇所は今回取得できず(→確認できなかったこと)
- **研究**
  - Olausson et al., "Is Self-Repair a Silver Bullet for Code Generation?", ICLR 2024(一次: https://arxiv.org/abs/2306.09896 ): 修復の費用を勘定に入れると利得は小さく不安定、時に無し。ボトルネックは**自己批評の質**。強いモデル/人のフィードバックで大きく改善
  - Debugging Decay Index(一次・プレプリント: https://arxiv.org/pdf/2506.18403 ): 多くのモデルが **2〜3 回の試行で修正能力の 60〜80% を失う**(指数減衰)。減衰点で文脈を捨てて**やり直す(fresh start)**と精度改善。HumanEval のみ、本文と表に不一致あり
  - Arimbur, "How Many Tries Does It Take?"(一次・プレプリント 2026-04: https://arxiv.org/pdf/2604.10508 ): 利得は**最初の 2 ラウンドに集中**し、達成可能改善の 76〜95% を占める。論理(assertion)エラーの修復率は約 45% で構文エラー約 66% より低い。単一実行・greedy
  - いずれも関数単位ベンチマークで、リポジトリ規模のエージェント作業への外挿は未検証

### 実務の幅と対立点

- 回数/費用上限型(Claude SDK, SWE-agent)↔ 同一失敗検出型(OpenHands)↔ タスク分割と人の介入型(Devin)
- 研究は「回数を重ねるほど効く」を否定し、少数回+やり直し+外部フィードバックを支持。ただしベンチマーク外挿の限界

### 標準への含意・選択肢

- 固定回数(例 3 回)は研究上「2〜3 回で頭打ち」と整合するが、根拠はベンチマーク限定 → 暫定マーク必須
- 停止条件を「回数上限」と「同一失敗の反復検出」の**両方**で定める案が実務の両系統を包含
- 停止後の扱い(人へのエスカレーション、文脈リセット後の再挑戦)を規定する方が研究知見と整合

---

## 4. 手戻り・チャーン指標

### 知見

- **DORA**(一次: https://dora.dev/guides/dora-metrics/history/ )
  - 2024 年に第 5 指標 **deployment rework rate** を追加。定義「バグ修正のための計画外デプロイの割合」。change failure rate が手戻りの代理指標かを検証する目的で追加
  - 現行区分: Throughput(change lead time, deployment frequency, failed deployment recovery time)/ Instability(change fail rate, deployment rework rate)
  - 同ページは目標化・チーム比較への指針を示さず、「経時の把握」として記述
- **DORA 2025 報告**(二次: RedMonk https://redmonk.com/rstephens/2025/12/18/dora2025/ )
  - AI 採用は**不安定性の増加と関連**。throughput との関係は 2024 の負から 2025 で正に転じた
  - 「記述モデルを処方的スコアカードとして扱った組織が多い」との批判。DORA はクラスター分析で年ごとに階層が変わる
- **GitClear**(二次: https://visualstudiomagazine.com/articles/2024/01/25/copilot-research 、https://www.i-programmer.info/news/105-artificial-intelligence/17871-gitclear-reveals-ais-negative-impact-on-code-quality.html 。原報告はベンダー白書)
  - churn 定義「作成後 **2 週間未満**に revert または更新された行の割合」
  - 2024 報告: 1.53 億変更行(2020–2023)、churn は 2021 比で 2024 に倍増と**予測**
  - 2025 報告: 2.11 億変更行(2020–2024)。copy/paste 行が moved(リファクタリング)行を初めて上回った
  - ベンダー白書で査読なし、AI 生成かどうかを行単位で識別していない(時期による相関)
- **分母**: AI 生成行を分母とする公的定義は見当たらず。LinearB は PR を Agentic AI / AI-Assisted / Unassisted に分けて扱う(一次: https://linearb.io/library/engineering-benchmarks-and-research )。「三種を混ぜずに分けよ」と推奨
- **目標化への警告**
  - SPACE(一次: Forsgren et al., ACM Queue 2021, https://queue.acm.org/detail.cfm?id=3454124 ): 活動指標を「単独で報酬・罰に使ってはならない」、「どの指標も完全な代理ではない」
  - DORA 誤用批判(二次: https://www.infoq.com/articles/dora-metrics-anti-patterns ほか)

### 実務の幅と対立点

- 窓の長さ: GitClear 2 週間、DORA はデプロイ単位(窓なし)。窓の根拠となる実証は未確認
- 合否ゲート化への支持は見当たらない。一次資料(SPACE)は明確に否定、DORA は記述的利用を想定

### 標準への含意・選択肢

- 手戻り指標は**観測・傾向監視**に留め、合否ゲートにしない案が一次資料と整合
- 採るなら定義を DORA rework rate(デプロイ単位)に寄せるか、行単位 churn(窓付き)にするかを明示選択。窓の日数は暫定マーク
- AI 生成/人手の区分は分母に使うより**層別**として持つ方が業界(LinearB)と整合

---

## 5. 監査のサンプリング

### 知見

- **ISO 19011:2018 附属書 A.6**(二次: https://theotherconsultants.substack.com/p/medical-device-auditing-sampling )
  - 判断に基づくサンプリング(監査チームの力量・過去の監査経験による。統計的な不確かさの推定は得られない)と統計的サンプリング(属性/変数)の 2 系統を併記
  - 件数の表は持たない。母集団・抽出基準・方法・件数・結果を記録せよ
- **PCAOB AS 2315**(一次: https://pcaobus.org/oversight/standards/auditing-standards/details/AS2315 )
  - 母集団の大きさは「母集団がごく小さい場合を除き、サンプルサイズに**ほとんど影響しない**」(付録の表、詳細テスト)
  - 統制テストの件数を決めるのは**許容逸脱率・予想逸脱率・統制リスクを過小評価するリスク**
- **AICPA Audit Sampling Guide 準拠の頻度別表**(二次: https://linfordco.com/blog/audit-sampling/ )
  - 統制の実施頻度(年次/四半期/月次/週次/日次/1 日複数回)別に件数を決める表が SOC 監査で慣行。母集団 250 以上で 90% 信頼の最小件数。表の数値は画像のため本文取得できず(慣行値 25/40/60 等は未確認)
- **IAF MD 1(複数サイト認証)**(一次: https://www.iasonline.org/wp-content/uploads/2021/02/2.-IAF-MD1.pdf )
  - サンプルサイト数 y = √x(初回)、0.6√x(サーベイランス)、0.8√x(有効性実証後の再認証)。切り上げ。**少なくとも 25% は無作為抽出**、残りは差異を最大化するよう選択
  - 平方根則 = **劣比例**(母集団比例ではない)
- **ISO 2859-1**(二次: https://qualityinspection.org/aql-2-5-samples )
  - ロットサイズ帯 → サンプル文字 → 件数。例: 3,201〜10,000 個・検査水準 II で 200 個。ロットサイズの増加に対し件数は段階的・劣比例に増える
  - 製造ロットの受入検査向け。監査への転用は一部コンサル(二次)が推奨するのみ
- **FDA QSIT サンプリング表**: 95% 信頼・0 不良で 59 件等が知られるが、FDA 公式ページは取得失敗(→確認できなかったこと)

### 実務の幅と対立点

- 固定件数(判断/頻度表)↔ 劣比例(√x, 2859)↔ 統計的(信頼度・許容逸脱率から算出、母集団にほぼ非依存)
- **母集団に比例させる流儀は主要規格に見当たらない**。統計的には母集団が大きいほど比率は下がる

### 標準への含意・選択肢

- 「母集団の X%」型は統計的根拠に欠け、主要規格と不整合
- 選択肢: (a) 固定件数+頻度別表(SOC 型)、(b) √x 型(IAF 型、無作為枠 25%)、(c) 信頼度・許容逸脱率から算出(AS 2315 型)、(d) 判断抽出+抽出根拠の記録(19011 型)
- どの型でも「抽出方法・件数・根拠の記録」は共通要求として採れる

---

## 6. チーム規模の境界(例: 10 人)

### 知見

- **Scrum Guide 2020**: 「typically 10 or fewer people」。2017 版の開発者 3〜9 人から変更(一次本文は今回取得失敗。scrum.org フォーラム検索結果での確認に留まる)
- **Amazon 二枚のピザ**(一次: AWS whitepaper https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/communication-collaboration.html ): 「2 枚のピザで足りる以下の規模」。人数の明示なし
- **Team Topologies**: 5〜9 人、Dunbar の 15/50/150 を組織単位の境界として援用(書籍。今回は二次資料のみ: https://www.appunite.com/blog/team-topologies-optimizing-software-team は 8〜10 人・15 人の深い信頼圏に言及)
- **Dunbar 数の反証**(一次: Lindenfors et al., Biology Letters 2021。大学発表 https://www.su.se/english/news/articles/2021-05-05-new-study-deconstructs-dunbars-number---yes-you-can-have-more-than-150-friends ): 95% 信頼区間が **2〜520 人**。「既存の方法とデータでは精度ある推定は不可能」
- **Brooks の法則の実証**(一次: Gote et al., "Big Data = Big Insights? Operationalising Brooks' Law...", arXiv 2201.04588 / ETH): GitHub 大規模データで、チーム規模の倍増で 1 人当たり生産性が **22〜30% 低下**。最適規模のピーク(7 人・19 人)は 8 指標中 2 指標のみで、著者は「最適規模として読むな」と注意
- **ISO/IEC 29110**(二次: https://www.iapp.co.th/blog/what-is-iso-29110-complete-guide ): VSE = **25 人以下**の組織・部門・プロジェクト。ただし各プロファイル(Entry/Basic/Intermediate/Advanced)は人数ではなく**工数(Entry は 6 人月以下)や範囲(単一/複数チーム・プロジェクト)**で区分

### 実務の幅と対立点

- 「10 人」は Scrum Guide 由来の慣行値として最も広く通用するが、実証的境界ではない
- 学術的には規模と生産性の負の関係は頑健だが、**閾値(境界値)は支持されない**
- 規格(29110)は人数の上限で適用対象を定めるが、プロセスの重さの切替は人数でなく工数・範囲

### 標準への含意・選択肢

- 人数境界を置くなら「慣行値」と明示し暫定マーク。連続的な影響に段差を置く理由を書く必要
- 代替: 人数ではなく、チーム数・プロジェクト数・並行作業の数(29110 型)や、レビュー可能な人の数で切り替える
- AI エージェントを「人数」に数えるかの規定が必要(既存の境界はすべて人間前提)

---

## 7. PR サイズの分布・レビュー品質との関係・測り方

### 知見

- **SmartBear/Cisco**(一次寄りのベンダー資料: https://smartbear.com/learn/code-review/best-practices-for-peer-code-review ): 1 回のレビューは 200〜400 LOC 以下。400 LOC 超で欠陥発見能力が低下。500 LOC/時より速いと欠陥密度が大きく低下。60〜90 分。研究は 2006 年頃の Cisco 単一チーム、査読なし
- **Google**(一次・査読: Sadowski et al., "Modern Code Review: A Case Study at Google", ICSE-SEIP 2018。二次要約 https://plg.uwaterloo.ca/~migod/846/current/summaries/10-Youssef-GoogleCodeReview-slides.pdf ): 変更の中央値は**約 24 行**、約 90% が 10 ファイル未満、承認者中央値 1 人、承認までの中央値 4 時間未満
- **Google eng-practices**(一次: 公開ガイドの翻訳ミラー https://eng-practices.gh.miniasp.com/review/developer/small-cls.html ): 「100 行は通常妥当、1000 行は通常大きすぎる、ただしレビュアーの判断」。50 ファイルに散る 200 行は大きすぎ。**関連テストは同じ CL に含めよ**。信頼できる自動リファクタリングの大きな CL は例外。ファイル削除は約 1 行扱い
- **Rigby & Bird**, "Convergent Contemporary Software Peer Review Practices", FSE 2013(一次: https://users.ece.utexas.edu/~miryung/teaching/EE379K-Spring2014/Papers/Paper%204.pdf ): OSS の変更中央値 11〜32 行、Android/AMD 44 行、Lucent(旧来の inspection)263 行。参加レビュアー中央値 2 人、間隔は中央値約 1 日
- **Graphite**(二次・ベンダー: https://graphite.com/blog/the-ideal-pr-is-50-lines-long ): 50 行が「最適」、25〜100 行の範囲を推奨。10 行未満は blind approval が多く revert も多い。行の数え方・生成ファイル除外の記載なし。自社ユーザー偏り
- **LinearB 2026 ベンチマーク**(一次・ベンダー: https://linearb.io/library/engineering-benchmarks-and-research 、810 万 PR): PR サイズ P75 で Elite <100 行、Good 100〜155、Fair 156〜228、要改善 >228
  - AI 別: 中央値 Agentic AI 89 行 / AI-Assisted 96 行 / 非支援 26 行。P75 で AI-Assisted 408 行は非支援 157 行の約 2.6 倍
  - AI PR の受理率(30 日以内マージ)32.7%、手動 84.4%
  - **測り方**(一次: https://linearb.helpdocs.io/article/oxqqb67fbf-pr-size-metric ): 追加+変更+削除 − 除外ファイル。lock・ビルド成果物・自動生成・非コード(.csv/.log)を除外規則で除く。組織/リポジトリ単位で設定、正規表現可
- **実装/テストの区分**(一次・プレプリント: "Do Autonomous Agents Contribute Test Code?", arXiv 2601.03556 https://arxiv.org/html/2601.03556v1 )
  - パス/ファイル名の正規表現(test/tests/testing/cypress ディレクトリ、test/spec トークン、Test/Spec 接尾辞)でテストファイルを判定。.md/.json/.yaml は除外
  - エージェント PR のテスト同梱率は 2025-01 の 31% から 2025-07 の 52% へ。test-to-code churn 比の中央値は 0.42〜0.87(本文と表に不一致あり)
  - テストを含む PR は churn 中央値が大きい(Claude: 183 → 1,736 LOC)= **テスト込みの行数で上限を課すとテスト同梱を罰する**

### 実務の幅と対立点

- 推奨値の幅: 50 行(Graphite)〜100 行(Google、LinearB Elite)〜200〜400 LOC(SmartBear)
- 計測定義(追加のみ/追加+削除、テスト・生成物・fixture の扱い)がベンダー間で統一されていない。fixture を区別する公開定義は見当たらず
- 小さすぎる PR にも負の兆候(blind approval、revert 増)という報告(Graphite)

### 標準への含意・選択肢

- 行数上限を規定するなら**数え方(除外対象・テストの扱い)を同時に規定**しなければ比較不能
- テストを分母/上限から除外する、または実装行とテスト行を別に測る案が Google の「テストは同じ CL へ」方針と両立
- 数値は Google の「判断に委ねる」型と、ベンダーのパーセンタイル型に分かれる。固定の合否より分布の監視+超過時の理由記録が実務に近い

---

## 8. コード/ドキュメントの拡張子分類

### 知見

- **GitHub Linguist**(一次: リポジトリ docs のフォーク https://github.com/bobis19/linguist/blob/master/docs/how-linguist-works.md 、https://github.com/Ferruslogic/linguist/blob/master/docs/overrides.md )
  - 判定順: Vim/Emacs modeline → 既知ファイル名 → **shebang** → 拡張子 → XML ヘッダ → man ページ節 → ヒューリスティック → ナイーブベイズ分類器
  - 事前除外: バイナリ・vendored(`vendor.yml`)・generated・documentation(`documentation.yml`)
  - 言語に type(programming / markup / data / prose)を持ち、統計に入るのは programming のみ。**data/prose は既定で除外**(denylist 的な既定+型による分類)
  - `.gitattributes` の `linguist-vendored` / `linguist-generated` / `linguist-documentation` / `linguist-detectable` / `linguist-language` で上書き
- **LinearB**(上記 7): 除外規則(denylist)と包含規則(allowlist)を併用し、**除外を先に適用**
- **研究**(上記 7 の arXiv 2601.03556): 拡張子 denylist(.md/.json/.yaml)+パス正規表現

### 実務の幅と対立点

- allowlist(コード拡張子を列挙)は未知拡張子・拡張子なしスクリプトを取りこぼす。denylist(文書拡張子を列挙)は新種の生成物・データを取り込む
- Linguist は両者の折衷: 言語データベース(実質 allowlist)+ shebang/内容判定+パス denylist+利用者の上書き

### 標準への含意・選択肢

- 規範は「分類の方法を記録し、上書き手段を持つ」ことを要求し、拡張子リスト自体は実装(降ろし先)側に置く案
- 拡張子なしファイルは shebang で判定する、が業界標準の手筋
- Linguist の type 分類(programming/markup/data/prose)を借用すれば独自リストの保守を避けられる

---

## 9. 運用指標の数(KPI 上限)と対の指標

### 知見

- **SPACE**(一次: https://queue.acm.org/detail.cfm?id=3454124 ): 「少数(a handful)の指標を、**少なくとも 3 つの次元**にわたって」。「多すぎる指標は混乱と意欲低下を招く」。多次元にすると**指標間の緊張**が生まれ、それが意図された効果
- **DORA**: 4 指標 → 2024 年に 5 指標(一次: 上記 4)。指標数の上限論ではなく研究構成上の数
- **Grove の対の指標**(二次: High Output Management の要約 https://mooncamp.com/blog/high-output-management-book-summary ): 「指標は監視対象へ注意を向ける」。効果と反作用を対で測る(在庫 ↔ 欠品、処理件数 ↔ 品質、ユニット完了日 ↔ 機能)
- **Balanced Scorecard**(二次: Gallup https://news.gallup.com/businessjournal/12208/making-balanced-scorecard-work-part.aspx ): 1 部署 15〜20 指標は焦点を失うとの批判。Kaplan & Norton 自身の推奨数(20〜25 と広く引用)は一次で未確認
- **ISO/IEC/IEEE 15939**: 情報ニーズから測定量を選ぶ構造で、数の上限を定めないと理解しているが本文未確認

### 実務の幅と対立点

- 上限数を明示する一次資料は見当たらない。「少数」「少なくとも 3 次元」という**下限・構成**の指示が主流
- 対の指標(counter-metric)は Grove、SPACE の「緊張」、DORA の throughput/instability の二区分として広く共有

### 標準への含意・選択肢

- 指標数の固定上限より「各指標に対の指標を必須とする」「次元の被覆を要求する」構成の方が一次資料と整合
- バックログ増加 ↔ スループットのような対を例示として示し、具体の対は組織が選ぶ形

---

## 横断の所見

- 9 論点の多くで、外部の数値(80%・20 行・10 人・100 行・3 回・2 週間)は**ベンダー既定値か慣行値**であり、規格はほぼ数値を置かず「事前に基準を定め、逸脱を説明・記録せよ」型を取る(DO-178C, IEC 62304, ISO 19011, 29110)
- 数値を固定するなら根拠水準マーク(ADR-0026)が必須。数値の代わりに「決め方と記録」を規範化する選択肢が規格系と整合
- AI エージェント固有の論点(push 頻度、AI を人数・承認主体に数えるか、AI PR の層別)は既存規格に前例がなく、ベンダー文書(Copilot の依頼者承認除外、OpenHands の stuck 検出)が先行

## 確認できなかったこと

- ISO/IEC/IEEE 29119-4 の本文で、カバレッジ閾値を課さないことの確認(有償本文未取得)
- DO-178C 本文の該当条項(6.4.4.2 等)の直接確認(二次資料経由のみ)
- IEC 62304 の 5.5.3〜5.5.5 の条文そのもの
- ISO 19011:2018 附属書 A.6 の原文(二次資料の引用経由)
- AICPA Audit Sampling Guide の頻度別件数表の具体値(25/40/60 等)
- FDA QSIT サンプリング表(公式ページ取得失敗)。59 件(95%・0 不良)の出典確認
- ISO 2859-1 の全ロットサイズ帯の件数表(一例のみ確認)
- Scrum Guide 2020 原文の「10 or fewer」の直接取得(scrumguides.org 未取得)
- Team Topologies 書籍原文の 5〜9 人・Dunbar 援用箇所
- Kaplan & Norton の推奨指標数の一次出典
- ISO/IEC/IEEE 15939 が指標数に言及するか
- SWE-agent・Copilot cloud agent の再試行回数/時間上限の公式記述
- 承認失効の頻度とレビューコスト(特に AI エージェントの多頻度 push 下)の定量研究
- コードチャーンの窓(2 週間等)の妥当性を実証した研究
- AI 生成行を分母とする手戻り指標の公的・学術的定義
- 小差分の 100% patch coverage によるゲーミングの実証研究
- fixture 行を実装/テストと区別して数える公開定義
- Google "Modern Code Review" 論文本体の数値(二次スライド経由)
