# 118/119 一次調査: スタック型 PR と AI 協調タスク管理・レビュー SLA

- 調査日: 2026-08-05
- 対象 Issue: #118「GitHub Issues + Stack PR を用いた AI 協調タスク管理の運用標準」/ #119「AI エージェント向け機能分割・Micro-tasking 基準と人間レビュー SLA」
- 位置づけ: フェーズ4(標準策定)向けの一次情報収集メモ。清書前の素材
- ツール・エージェント関連の記述はすべて **2026-08-05 時点** の公開情報に基づく

> 重要な結論(先出し)
>
> - `gh stack submit` は GitHub CLI の公式コマンドとして **存在しない**(2026-08-05 時点、公式マニュアルのコマンド一覧に `stack` なし)
> - 下層 PR マージ時のベース自動リターゲットは **GitHub 本体の機能として存在する**。ただし発火条件は「マージ後のヘッドブランチ削除」であり、「マージ」そのものではない
> - 大きな変更を AI エージェントが依存関係付きの複数 PR へ自動分割する製品実装は **未確認**(2026-08-05 時点)

---

## 1. スタック型 PR(stacked pull requests)の実務

### 1.1 概念

- 定義: 1 本の大きな変更を、依存関係のある複数の小さなブランチ/PR の連鎖として積み上げる開発様式である
- GitHub 上での実現手段: PR のベースブランチに `main` ではなく直前のフィーチャーブランチを指定する
- GitHub 公式ドキュメントは PR 作成時に「base ブランチをドロップダウンで選ぶ」としか記述せず、**フィーチャーブランチをベースにする依存 PR(スタック)の運用は公式には解説していない**(2026-08-05 時点で該当記述を確認できず)
  - 出典: [Creating a pull request — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

### 1.2 ベース自動リターゲット(#118 の前提の検証)

- GitHub 公式ドキュメントの記述(一次確認済み):
  > "GitHub checks for any open pull requests in the same repository that specify the deleted branch as their base branch. GitHub automatically updates any such pull requests, changing their base branch to the merged pull request's base branch."
  - 出典: [Creating and deleting branches within your repository — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository)
- 判定: 自動リターゲットは **GitHub 本体(プラットフォーム)の機能** である。Graphite などのツール固有機能ではない
- ただし条件が限定的である
  - 発火契機は「PR がマージされた後にヘッドブランチを削除したとき」である。マージ単独では発火しない(削除しない運用では働かない)
  - 変わるのはベースブランチの **指定** のみである。上層ブランチのコミット列は書き換わらないため、リベースを行うまで差分に下層のコミットが混入したままになる(この因果は公式には明記されていないため、後述の考察として扱う)
- 一方、「マージ済み分を除去して残りのスタックを積み直す」動作はツール側の責務である
  - Graphite `gt sync`: 「main の最新を取り込み」「trunk へマージ済みのローカルブランチの削除を促し」「未マージの upstack を main へ restack する。コンフリクトがあれば解決を促す」
    - 出典: [Sync changes from a remote repository — Graphite Docs](https://graphite.com/docs/sync-with-a-remote-repo)

### 1.3 主要ツールの現況(2026-08-05 時点)

| ツール | 前提ホスティング | 中核コマンド | 特徴・制約 |
| --- | --- | --- | --- |
| Graphite (`gt`) | GitHub | `gt submit` / `gt sync` / `gt restack` / `gt split` | ブランチが変更単位。マージキュー、AI レビュー、Insights を持つ商用 SaaS |
| ghstack | GitHub | `ghstack` / `ghstack land` | コミット=PR。`gh/<user>/N/{base,head,orig}` の 3 ブランチ構成。**fork 非対応、upstream への write 権限必須**、GitHub の Merge ボタンを使えず `ghstack land` が必要 |
| Sapling (`sl`) | GitHub(+ Meta 内製) | `sl pr submit` | 「overlapping」な PR を作るため GitHub の PR UI では分かりにくく、レビューは ReviewStack 推奨。`workflow` スコープ付き PAT が必要な場合あり |
| git-branchless | Git 汎用 | `git submit` / `git sync` / `git move` | **alpha 表記のまま**。「破壊的変更を覚悟せよ」と明記。約 4.1k stars |
| spr (ejoffe) | GitHub / GHES | `git spr update` / `status` / `merge` / `amend` / `sync` | コミット=PR。外部サービス不要。スタック順にマージする必要あり。約 1.3k stars |

- 出典:
  - [Graphite Docs トップ(CLI)](https://graphite.com/docs/graphite-cli) / [gt split](https://graphite.com/docs/squash-fold-split) / [gt sync](https://graphite.com/docs/sync-with-a-remote-repo)
  - [ezyang/ghstack — GitHub](https://github.com/ezyang/ghstack)
  - [Using Sapling with GitHub — sapling-scm.com](https://sapling-scm.com/docs/git/github/)
  - [arxanas/git-branchless — GitHub](https://github.com/arxanas/git-branchless)
  - [ejoffe/spr — GitHub](https://github.com/ejoffe/spr)
- Phabricator 系(`arc diff`)は Phabricator 自体が 2021 年に開発終了しているため、現在の選択肢は GitHub ネイティブ + 上記ツール群である(Phabricator 終了の一次確認は本調査では未実施 = 未確認)

### 1.4 マージキューとの関係

- GitHub のマージキューは「独立した PR を順次検証してマージする」機構であり、公式ドキュメントは **依存 PR / スタックの扱いに言及していない**
  - 出典: [Managing a merge queue — GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- Graphite は独自マージキューに加えて「Mergeability status check(スタック中間の誤マージ防止)」を提供する
  - 出典: [Graphite Docs 索引(llms.txt)](https://graphite.com/docs/llms.txt)

---

## 2. `gh stack submit` の実在確認

- GitHub CLI 公式マニュアルのコマンド一覧(2026-08-05 時点)
  - Core: `auth` / `browse` / `codespace` / `discussion` / `gist` / `issue` / `org` / `pr` / `project` / `release` / `repo` / `skill`
  - Actions: `cache` / `run` / `workflow`
  - Additional: `agent-task` / `alias` / `api` / `attestation` / `completion` / `config` / `copilot` / `extension` / `gpg-key` / `label` / `licenses` / `preview` / `ruleset` / `search` / `secret` / `ssh-key` / `status` / `variable`
  - 出典: [GitHub CLI manual](https://cli.github.com/manual/gh)
- 判定: **`gh stack` および `gh stack submit` は存在しない**。Issue #118 の本文がこのコマンドを前提にしている場合、前提の修正が必要である
- 相当する実コマンド
  - Graphite: `gt submit`(スタック全体を PR として作成・更新)
  - ghstack: `ghstack`(コミット列を PR 群へ push)、`ghstack land`(マージ)
  - spr: `git spr update` / `git spr merge`
  - Sapling: `sl pr submit`
  - git-branchless: `git submit`
- GitHub CLI で同等のことを行う場合は `gh pr create --base <下層ブランチ>` を手動で連ねる形になる(公式に「スタック」概念は無い)

---

## 3. PR サイズとレビュー品質の実証(数値の原典)

### 3.1 「200〜400 行」「60 分」= SmartBear / Cisco 研究(2006 年)

- 調査条件: 「2500 reviews of 3.2 million lines of code written by 50 developers」、2006 年 5 月に終了した 10 か月間の調査である
- 主要な知見(原典の表現)
  - "most reviews are smaller than 200 lines of code" / 推奨は「100〜300 行を一度に」
  - "Reviewers are most effective at reviewing small amounts of code. Anything below 200 lines produces a relatively high rate of defects"
  - "no review larger than 250 lines produced more than 37 defects per 1000 lines of code"
  - "LOC under review should be under 200, not to exceed 400"
  - "Total review time should be less than 60 minutes, not to exceed 90"
  - 検査速度は 500 LOC/時未満が目安である
  - 出典: [Cisco case study(SmartBear, 2006 年調査)PDF](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf) / 要約版 [Best Practices for Peer Code Review — SmartBear](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)
- 注意: 対象は 2006 年の C 系プロダクトコードでのツール支援レビューである。現代の PR 運用や AI 生成コードに対する外的妥当性は検証されていない(= 未確認)

### 3.2 「100 行」= Google のエンジニアリング実践ガイド

- 原典の表現: "100 lines is usually a reasonable size for a CL, and 1000 lines is usually too large, but it's up to the judgment of your reviewer."
- ファイル数も基準に含む: "A 200-line change in one file might be okay, but spread across 50 files it would usually be too large."
- 例外: ファイル全体の削除、自動リファクタリングツールによる大規模変更
  - 出典: [Small CLs — Google Engineering Practices](https://google.github.io/eng-practices/review/developer/small-cls.html)
- 判定: 「100 行以内」を推奨する一次的根拠は、**実験研究ではなく Google の実務ガイドライン(judgment ベース)** である。実測に基づく根拠としては次項のベンチマークが近い

### 3.3 Google 大規模実測(ICSE-SEIP 2018)

- 手法: インタビュー 12 件、サーベイ 44 名、**約 900 万件のレビュー済み変更のログ分析**
- 数値(原典の表現)
  - "over 10% of changes modify only a single line of code, and the median number of lines modified is 24"
  - "over 35% of the changes under consideration modify only a single file and about 90% modify fewer than 10 files"
  - "fewer than 25% of changes have more than one reviewer, and over 99% have at most five reviewers with a median reviewer count of 1"
  - "developers have to wait for initial feedback on their change a median time of under an hour for small changes and about 5 hours for very large changes"
  - "The overall (all code sizes) median latency for the entire review process is under 4 hours"
  - "70% of changes are committed less than 24 hours after they are mailed out for an initial review"
  - 先行研究の総括として "the number of useful comments decreases and the review latency increases as the size of the change increases"
  - 出典: Sadowski, Söderberg, Church, Sipko, Bacchelli, "Modern Code Review: A Case Study at Google", ICSE-SEIP 2018 — [Google Research](https://research.google/pubs/modern-code-review-a-case-study-at-google/) / [PDF](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf)

### 3.4 Microsoft 系の研究

- Nudge(TOSEM 2022): 停滞 PR の自動リマインド。ランダム化試験で **PR 解決時間を 60% 短縮**、Microsoft 内 8,000 リポジトリ・21 万通の通知規模へ拡大、通知の 73% が好意的に解決された
  - 出典: [arXiv:2011.12468](https://arxiv.org/abs/2011.12468)(2020 年投稿、TOSEM 2022)
- Bacchelli & Bird "Expectations, Outcomes, and Challenges of Modern Code Review"(ICSE 2013, Microsoft)は現代コードレビュー研究の起点として広く引用されるが、本調査では本文の数値までは一次確認できていない(= 未確認)

### 3.5 業界ベンチマーク(2026 年版)

- LinearB「2026 Software Engineering Benchmarks」: **8.1M 超の PR / 4,800 チーム / 42 か国**
  - PR Pickup Time(レビュー着手までの待ち): Elite < 1h / Good 1–4h / Fair 5–16h / Needs Focus > 16h
  - PR Review Time: < 3h / 3–14h / 15–24h / > 24h
  - PR Size: < 100 / 100–155 / 156–228 / > 228(変更行数)
  - Cycle Time: < 25h / 25–72h / 73–161h / > 161h
  - 出典: [Engineering Benchmarks — LinearB](https://linearb.io/resources/engineering-benchmarks)
- 注意: LinearB の値は同社 SaaS 利用組織の分布に基づく。母集団の偏り(計測ツール導入企業に限る)がある

---

## 4. 小さい PR の効果と副作用

### 4.1 効果(出典あり)

- レビュー遅延はサイズとともに増大し、有用なコメント数は減少する(Sadowski et al. 2018 の先行研究総括)
- Google は小さい CL の利点として、レビューの速さ、バグの減少、却下時の手戻り削減、マージ容易性、設計品質、ロールバック容易性を挙げる([Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html))
- 初回フィードバック待ちは小さい変更で中央値 1 時間未満、非常に大きい変更で約 5 時間(Google 2018)

### 4.2 分割しすぎのコスト(出典あり)

- Google 自身が下限を設けている: "The CL is not so small that its implications are difficult to understand. If you add a new API, you should include a usage of the API in the same CL"(自己完結性の要件)
  - あわせて「一つのことだけを扱う最小の変更」を自己完結の定義としている
- レビュアー割り当ての形式が遅延に影響する: Meta の A/B テストでは、**グループ宛て割り当てより個人への明示的割り当てのほうがレビュー遅延を有意に減らした**(いわゆる傍観者効果)。また負荷分散型推薦の効果は混在(mixed)であった
  - 出典: Rigby et al., "Improving Code Reviewer Recommendation: Accuracy, Latency, Workload, and Bystanders" — [arXiv:2312.17169](https://arxiv.org/abs/2312.17169)(2023)
- 逆向きの証拠もある: Firefox の 66,000 リビジョン分析では、**グループ宛てレビュー依頼のほうが品質(リグレッションの少なさ)と作業分配の均衡に優れる**とされ、速度と品質のトレードオフが示された
  - 出典: Kucera, Castelluccio, Feitosa, Rastogi, "Group versus Individual Review Requests" — [arXiv:2601.01514](https://arxiv.org/abs/2601.01514)(2026-01-04)
- 「PR 数の増加そのものがレビュアーのボトルネックを悪化させる」ことを直接定量した一次研究は、本調査の範囲では **未確認** である。近い議論として、AI によるコード生産速度の向上がレビューをボトルネック化するという指摘がある
  - 出典: Kamalı, Tuna, Haratian, Tüzün, "Rethinking Code Review in the Age of AI" — [arXiv:2605.17548](https://arxiv.org/abs/2605.17548)(2026-05-17)
  - 出典: Zhong, Noei, Adams, Zou, "From Human-Centric to Agentic Code Review"(102 万 PR / 207 プロジェクト分析)— [arXiv:2607.13196](https://arxiv.org/abs/2607.13196)(2026-07-14)。エージェント関与は**判断を速くするが品質向上には結び付かなかった**

---

## 5. レビュー待ち時間(review latency)の実証

- Google(2018, 約 900 万変更): 初回応答の中央値は小変更で 1 時間未満、レビュー全体の中央値は 4 時間未満、70% が 24 時間以内にコミットされる
- LinearB(2026, 810 万 PR): Pickup Time の Elite は 1 時間未満、Needs Focus は 16 時間超。Cycle Time の Elite は 25 時間未満
- 待ち時間短縮施策の効果: Nudge(自動催促)で PR 解決時間 **-60%**(Microsoft, ランダム化試験)
- Atlassian の LLM レビュアー(RovoDev Code Reviewer)は **PR サイクルタイム -30.8%、人手コメント -35.6%** を報告
  - 出典: Tantithamthavorn et al., "RovoDev Code Reviewer: LLM-based Code Review at Atlassian" — [arXiv:2601.01129](https://arxiv.org/abs/2601.01129)(2026-01-03)
- 「待ち時間がリードタイム全体に占める割合」を直接示す一次統計は本調査では **未確認**。LinearB の Pickup Time と Cycle Time の閾値比(1h 対 25h)から間接的に推定できるのみである

---

## 6. レビュー SLA の実務

### 6.1 目標値の一次的根拠

- Google: "One business day is the maximum time it should take to respond to a code review request (i.e., first thing the next morning)."
  - 集中作業中の割り込みは推奨せず、作業の切れ目で対応する。全体の速さより **個々の応答が速いこと** を重視する
  - 出典: [Speed of Code Reviews — Google Engineering Practices](https://google.github.io/eng-practices/review/reviewer/speed.html)
- 「4 時間以内」に相当する一次的根拠は、Google の実測中央値(レビュー全体 4 時間未満)および LinearB の Good 帯(Pickup 1–4h)である。規範として 4 時間を掲げた公式ガイドは本調査では **未確認**
- 「1 営業日以内」は Google のガイドが明示的な原典である

### 6.2 自動エスカレーション・再割り当て

- GitHub 標準機能(Team の code review settings)
  - Round robin: "chooses reviewers based on who's received the least recent review request... regardless of the number of outstanding reviews they currently have"
  - Load balance: "considers the number of outstanding reviews for each member... tries to ensure that each team member reviews an equal number of pull requests in any 30 day period"
  - **機能しない条件が公式に明記されている**: "Any team members that have set their status to 'Busy' will not be selected for review. If all team members are busy, the pull request will remain assigned to the team itself."
  - 出典: [Managing code review settings for your team — GitHub Docs](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- 自動催促の実装例: Nudge(Microsoft)。停滞判定に完了時間予測モデルと活動検知を用い、作成者とレビュアーのどちらを突くかを決める
- SLA 超過時に別レビュアーへ機械的に再割り当てする運用の一次事例は、本調査では **未確認**(Nudge は再割り当てではなく催促である)

---

## 7. レビュアー推薦・自動割り当ての研究

- CODEOWNERS の仕様と限界(GitHub 公式)
  - 所有コードを変更する PR で自動的にレビュー依頼される
  - "Code owners are not automatically requested to review draft pull requests"(下書き PR は対象外)
  - "Order is important; the last matching pattern takes the most precedence"
  - gitignore 由来の 3 機能(`#` のエスケープ、`!` の否定、`[ ]` の文字範囲)は使えない
  - ファイルは 3MB 未満。所有者は write 権限が必要
  - 出典: [About code owners — GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
  - 限界の要点: CODEOWNERS は **静的な所有関係の写像であり、負荷・不在・専門性の変化を考慮しない**
- 負荷偏りとその対策(研究)
  - SofiaWL: 専門性・作業負荷・離職リスクを同時に扱う推薦。**作業負荷集中 -12%、リスクのあるファイル -28%、レビュー時の専門性 +3%**
    - 出典: Hajari, Malmir, Mirsaeedi, Rigby — [arXiv:2312.17236](https://arxiv.org/abs/2312.17236)(2023)
  - HGRec(ハイパーグラフ): 推薦の多様性により "core reviewers' workload congestion" の緩和を狙う — [arXiv:2204.09526](https://arxiv.org/abs/2204.09526)(2022)
  - CORAL(Microsoft, 大規模異種グラフ): 従来手法が取りこぼす適格レビュアーを発見 — [arXiv:2202.02385](https://arxiv.org/abs/2202.02385)(2022)
  - MIRRec: 10 OSS・48,374 PR で既存手法を上回る — [arXiv:2401.10755](https://arxiv.org/abs/2401.10755)(2024)
  - 公平性の問題: ML ベース推薦で "male reviewers getting 7.25% more recommendations" — [arXiv:2307.11298](https://arxiv.org/abs/2307.11298)(2023)
  - OSS のレビュアー選定における性別バイアスは 14 データセット中 11 で観測 — [arXiv:2210.00139](https://arxiv.org/abs/2210.00139)(2022)

---

## 8. AI エージェントによる自動分割(#119 の中核)

- 製品実装(2026-08-05 時点)
  - Graphite `gt split`: **人手による分割**(コミット単位 / hunk 単位 / ファイル単位)。AI 支援の記述なし
    - 出典: [Squash, fold, and split changes — Graphite Docs](https://graphite.com/docs/squash-fold-split)
  - Graphite Agents: Cursor Cloud Agents が「自然言語の指示から変更を生成し、下書き PR を 1 本開く」。**依存 PR スタックへの自動分割の記述なし**
    - 出典: [Agents — Graphite Docs](https://graphite.com/docs/agents)
  - 判定: 大きな変更をエージェントが依存関係付き複数 PR へ自動分割する製品機能は **未確認**
- 研究動向
  - コミット untangling 用データセット構築(PR 由来)。フィルタリングで「ideal PR」の比率を 9.5% → 55% に高め、従来比 5.7 倍規模のデータセットを構築
    - 出典: Ueno, Pârţachi, Kobayashi, "Tangling Pull Requests" — [arXiv:2607.26730](https://arxiv.org/abs/2607.26730)(2026-07-29)
  - Phoenix: 6 種の専門エージェントに作業を分解して Issue を解決し PR を生成(オラクル解決率 75%)。ただし分解の単位はエージェントの役割であり、PR スタックではない
    - 出典: [arXiv:2606.20243](https://arxiv.org/abs/2606.20243)(2026-06)
  - Runtime-Structured Task Decomposition: 実行時分解で再試行コスト -51.7% — [arXiv:2605.15425](https://arxiv.org/abs/2605.15425)(2026-05-14)
- まとめ: **タスク分解の研究は活発だが、「レビュー可能な依存 PR 列への自動分割」を実運用している事例は未確認である**

---

## 9. コンフリクト解消の自動化

### 9.1 既存の決定論的手段

- `git rerere`(reuse recorded resolution): 同一コンフリクトの解決を記録・再適用する。長命ブランチのリベースや繰り返しマージで有効である
  - 出典: [Pro Git — Rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere)
  - 注意: 記録した解決をそのまま再生するため、**誤った解決も再生される**(公式には警告として明記されていない = 解釈)
- 構文認識マージ(structured merge): Mergiraf は構文木を解析して行ベースでは競合する変更を統合する。行ベースで衝突しなければその結果を返し、疑わしい場合は "err on the side of caution and retain conflict markers" と明言している
  - 出典: [Introduction — Mergiraf](https://mergiraf.org/introduction.html)

### 9.2 LLM によるコンフリクト解消(2025〜2026 年)

| 研究 | 公表 | データ | 成功率 |
| --- | --- | --- | --- |
| Merge-Bench / LLMergeJ(Schesch, Ernst) | 2026-05-25 [arXiv:2605.25890](https://arxiv.org/abs/2605.25890) | 実世界のコンフリクト 7,938 件・多言語 | 「最良のモデルでも **60% 未満**」 |
| Can LLMs Resolve Real Java Merge Conflicts?(Shen) | 2026-07-30 [arXiv:2607.27674](https://arxiv.org/abs/2607.27674) | Java の実コンフリクト | 開発者の解決と一致 **約 55%**(AutoMerge は 36.7%) |
| LLM-based vs. Search-based(Campos Jr., Murta) | 2026-05-15 [arXiv:2605.16646](https://arxiv.org/abs/2605.16646) | 数千件の実コンフリクト | LLM は不均衡な内容に強く、探索ベースは汎化に強い |

- 含意: 2026 年時点で LLM の自動解消は **半数強** にとどまり、無人適用には耐えない水準である

### 9.3 自動解消が危険なケース(意味的競合)

- 定義: テキスト上は競合せずマージが成功するのに、統合結果の振る舞いが壊れる「dynamic semantic conflict / interference」である
  - 出典: de Jesus, Borba, Bonifácio, de Oliveira, "Detecting Semantic Conflicts using Static Analysis" — [arXiv:2310.04269](https://arxiv.org/abs/2310.04269)(2023)
- 検出の難しさ(重要)
  - 情報フロー解析では評価対象マージシナリオの **約 64% でフローを検出したが、手動確認した 35 件のうち実際の干渉は 15 件のみ**(過剰報告)
    - 出典: [arXiv:2404.08619](https://arxiv.org/abs/2404.08619)(2024)
  - ポインタ解析の導入はタイムアウトと誤検出を減らす一方で **見逃し(false negative)を増やす**。ハイブリッド化が必要と結論
    - 出典: [arXiv:2507.20081](https://arxiv.org/abs/2507.20081)(2025-07)
  - LLM 生成テストによる意味的競合検出は有望だが計算コストが課題
    - 出典: [arXiv:2507.06762](https://arxiv.org/abs/2507.06762)(2025-07)
- 結論(事実に基づく整理): **「構文的に解決可能だが意味的に競合する」領域は、静的解析でも誤検出・見逃しが大きく、自動解消の適用外とすべき領域である**

---

## 10. Git 初心者にとってのスタック運用の難度

- Git 公式の原則: **"Do not rebase commits that exist outside your repository and that people may have based work on."**
  - 他者がその履歴の上に作業していた場合、再マージが必要になり履歴に重複コミットが生じる
  - 推奨: 「push 前のローカル変更のリベースはよいが、push 済みのものはリベースしない」
  - 出典: [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- スタック運用はこの原則と正面から衝突する。上層ブランチは公開後も繰り返し force push されるためである
- `--force` の危険性と `--force-with-lease` の限界(Git 公式)
  - `--force`: "It can cause the remote repository to lose commits; use it with care."
  - `--force-with-lease`: リモート ref が期待値のときだけ更新する「リース」方式。ただし **エディタ等がバックグラウンドで `git fetch` していると保護が容易に無効化される**。さらに `<refname>:<expect>` を明示しない形式は "still experimental" と明記
  - 補助として `--force-if-includes` がある
  - 出典: [git push — Git Documentation](https://git-scm.com/docs/git-push)
- リベースを避ける代替
  - ghstack は「リベース時に force push ではなくマージコミットを追加する」設計で、PR 履歴を壊さない方針である(出典: [ezyang/ghstack](https://github.com/ezyang/ghstack))。代償として古いブランチが大量に残り、外部の掃除機構が必要である
  - GitHub ネイティブの「ベースをフィーチャーブランチにした PR + マージ後のブランチ削除による自動リターゲット」は、force push を必須としない運用である
- force push による作業消失の**発生頻度に関する実証データ**は、本調査では **未確認**

---

## 11. 調査フレームワーク観点での整理(#118 の運用標準向け素材)

### 11.1 ロールモデル(スタック運用で必要な役割)

- 変更の作成者(人間 / AI エージェント): スタック計画、各層 PR の自己完結性の担保
- レビュアー: CODEOWNERS による自動指名、または Team の round robin / load balance で個人に割り当て
  - 事実: グループ宛てのままだと着手が遅れる(Meta, 2023)一方、品質と分配は良化する(Firefox, 2026)というトレードオフが実証されている
- スタック所有者(統合責任): 下層マージ後の `sync` / restack、コンフリクト解消、マージ順序の維持
- エスカレーション先: 全員 Busy の場合に PR が Team 割り当てのまま滞留する仕様のため、**滞留を検知して人に落とす役割が別途必要である**(GitHub 標準機能では埋まらない)

### 11.2 ゲート・意思決定

- 各層 PR の承認(必要承認数、CODEOWNERS 必須レビュー)
- マージ順序ゲート: スタック中間の誤マージ防止(Graphite の mergeability status check)、または spr の「スタック順にマージ」制約
- マージキュー通過(GitHub Merge Queue は依存 PR を想定していない点に注意)
- SLA ゲート: 応答は 1 営業日以内(Google)、着手は 1〜4 時間が Good 帯(LinearB 2026)

### 11.3 成果物(インプット/アウトプット)

- インプット: Issue(受け入れ条件つき)、分割方針
- 中間成果物: スタック計画(層ごとの目的と依存)、各層 PR(1 論理変更 = 100 行程度を目安)
- アウトプット: マージ済みトランク、更新された Issue チェックボックス

### 11.4 階層構造(3 階層で図解する素材)

- 全体プロセス: Issue 起票 → 分割計画 → スタック生成 → 層ごとレビュー → 下から順にマージ → sync/restack → Issue クローズ
- フェーズ内ワークフロー(1 層の PR ライフサイクル): 作成 → レビュアー割り当て → 応答 SLA → 修正 → 承認 → マージ → ブランチ削除(自動リターゲット発火)
- 個別作業: `restack` / `sync` / コンフリクト解消 / force-with-lease による安全な push

---

## 12. 考察(事実からの解釈。一次情報ではない)

- 自動リターゲットは「ベース指定の付け替え」までしか行わないため、スタック運用の本質的コスト(上層ブランチの積み直しとコンフリクト再解決)は消えない。ツール(`gt sync` 等)が必須になるのはこのためだと考えられる
- #119 の「PR は 100 行以内」という基準を採るなら、根拠は SmartBear の 400 行ではなく **Google のガイドラインと LinearB 2026 の Elite 帯(< 100 変更行)** に置くのが妥当である。SmartBear の 200〜400 行は 2006 年の条件下の値であり、上限(これを超えると破綻する線)として引用するほうが誠実である
- AI エージェントが PR を量産する体制では、ボトルネックは実装ではなくレビュー側に移る。2026 年の実証(agentic code review は速いが品質は上がらない)を踏まえると、**PR を小さくするだけでは不十分で、レビュアー割り当てと SLA 超過時の再配分をセットで設計しないと総待ち時間は改善しない**と考えられる
- コンフリクト自動解消は 2026 年時点で 55〜60% 程度の一致率であり、**「提案は自動、確定は人間」以外の運用は現時点で正当化できない**。特に意味的競合の検出は誤検出・見逃しの両方が大きい
- 初心者を含むチームでは、rebase 前提のスタックより「GitHub ネイティブの依存 PR + マージ後のブランチ削除による自動リターゲット」から始めるほうが事故が少ないと考えられる

---

## 13. 未確認・追加調査が必要な穴

- 日本企業における運用実態(建前と実運用の乖離、多段承認によるレビュー滞留)に関する一次情報。今回は Web 検索予算を使い切ったため未収集
- Bacchelli & Bird (ICSE 2013, Microsoft) 本文の具体的数値
- 「PR 数の増加がレビュアーの総負荷・ボトルネックを悪化させる」ことの直接的な定量研究
- 「待ち時間がリードタイム全体に占める割合」の公開統計(DX / Jellyfish の 2026 年ベンチマーク本体)
- SLA 超過時に別レビュアーへ自動再割り当てする実装事例(Nudge は催促のみ)
- force push による作業消失事故の発生頻度データ
- Phabricator 系ツール(`arc diff`)の終了に関する一次確認
- git-branchless / spr / ghstack の最新リリース日(GitHub の README からは取得できず)

---

## 出典一覧

- [GitHub CLI manual](https://cli.github.com/manual/gh)
- [Creating and deleting branches within your repository — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-and-deleting-branches-within-your-repository)
- [Changing the base branch of a pull request — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-base-branch-of-a-pull-request)
- [Creating a pull request — GitHub Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [Managing a merge queue — GitHub Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- [Managing code review settings for your team — GitHub Docs](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [About code owners — GitHub Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Graphite Docs: CLI](https://graphite.com/docs/graphite-cli) / [sync](https://graphite.com/docs/sync-with-a-remote-repo) / [split](https://graphite.com/docs/squash-fold-split) / [agents](https://graphite.com/docs/agents) / [索引](https://graphite.com/docs/llms.txt)
- [ezyang/ghstack](https://github.com/ezyang/ghstack)
- [Using Sapling with GitHub](https://sapling-scm.com/docs/git/github/)
- [arxanas/git-branchless](https://github.com/arxanas/git-branchless)
- [ejoffe/spr](https://github.com/ejoffe/spr)
- [Small CLs — Google Engineering Practices](https://google.github.io/eng-practices/review/developer/small-cls.html)
- [Speed of Code Reviews — Google Engineering Practices](https://google.github.io/eng-practices/review/reviewer/speed.html)
- [Modern Code Review: A Case Study at Google (ICSE-SEIP 2018)](https://research.google/pubs/modern-code-review-a-case-study-at-google/) / [PDF](https://storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf)
- [Cisco case study (SmartBear, 2006)](https://static1.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf) / [Best Practices for Peer Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)
- [Engineering Benchmarks 2026 — LinearB](https://linearb.io/resources/engineering-benchmarks)
- [Nudge (arXiv:2011.12468, TOSEM 2022)](https://arxiv.org/abs/2011.12468)
- [Improving Code Reviewer Recommendation (arXiv:2312.17169)](https://arxiv.org/abs/2312.17169)
- [Factoring Expertise, Workload, and Turnover into Code Review Recommendation (arXiv:2312.17236)](https://arxiv.org/abs/2312.17236)
- [Group versus Individual Review Requests (arXiv:2601.01514)](https://arxiv.org/abs/2601.01514)
- [RovoDev Code Reviewer at Atlassian (arXiv:2601.01129)](https://arxiv.org/abs/2601.01129)
- [From Human-Centric to Agentic Code Review (arXiv:2607.13196)](https://arxiv.org/abs/2607.13196)
- [Rethinking Code Review in the Age of AI (arXiv:2605.17548)](https://arxiv.org/abs/2605.17548)
- [Tangling Pull Requests (arXiv:2607.26730)](https://arxiv.org/abs/2607.26730)
- [Phoenix (arXiv:2606.20243)](https://arxiv.org/abs/2606.20243)
- [Runtime-Structured Task Decomposition (arXiv:2605.15425)](https://arxiv.org/abs/2605.15425)
- [Merge-Bench (arXiv:2605.25890)](https://arxiv.org/abs/2605.25890)
- [Can LLMs Resolve Real Java Merge Conflicts? (arXiv:2607.27674)](https://arxiv.org/abs/2607.27674)
- [LLM-based vs. Search-based Merge Conflict Resolution (arXiv:2605.16646)](https://arxiv.org/abs/2605.16646)
- [Detecting Semantic Conflicts using Static Analysis (arXiv:2310.04269)](https://arxiv.org/abs/2310.04269)
- [Information Flow to estimate interference (arXiv:2404.08619)](https://arxiv.org/abs/2404.08619)
- [The Effect of Pointer Analysis on Semantic Conflict Detection (arXiv:2507.20081)](https://arxiv.org/abs/2507.20081)
- [Semantic conflict detection with LLM-generated tests (arXiv:2507.06762)](https://arxiv.org/abs/2507.06762)
- [Pro Git — Rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere)
- [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [git push — Git Documentation](https://git-scm.com/docs/git-push)
- [Mergiraf — Introduction](https://mergiraf.org/introduction.html)
- [MIRRec (arXiv:2401.10755)](https://arxiv.org/abs/2401.10755) / [HGRec (arXiv:2204.09526)](https://arxiv.org/abs/2204.09526) / [CORAL (arXiv:2202.02385)](https://arxiv.org/abs/2202.02385) / [Fairness of ML-based reviewer recommendation (arXiv:2307.11298)](https://arxiv.org/abs/2307.11298) / [Gender bias in code review (arXiv:2210.00139)](https://arxiv.org/abs/2210.00139)
