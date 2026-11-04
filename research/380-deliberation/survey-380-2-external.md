# 外部調査 #380-2: 記録だけのパスを変える PR の承認を、GitHub で免除または別扱いにできるか

- 調査日: 2026-11-05(記述はすべてこの日の時点。GitHub のルールセットは 2025-09〜2026-02 に機能追加が続いた)
- 目的: 既定ブランチに「PR と承認1件」を強制するルールセットを置いたとき、記録だけのファイル(例: `docs/gates/**`、例外承認の台帳)を変える PR を別扱いにできるか、会議体の材料とする
- 凡例: 【確認】一次資料で確かめた事実 /【未確認】一次資料で確かめられなかったこと(コミュニティの報告のみを含む)/ 解釈は末尾の「考察」へ分離

---

## 1. GitHub のルールセット(repository rulesets)の現行機能

### 1.1 ルールセットの対象の取り方

- 【確認】branch / tag ルールセットの対象は**ref(ブランチ名・タグ名)だけ**。`conditions.ref_name.include / exclude`、`~DEFAULT_BRANCH`、`~ALL` を受け付ける。**ファイルパスを条件にルールセット全体を適用・非適用にする手段はない**
  - 出典: [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)(「You can use fnmatch syntax to define a pattern to target specific branches and tags」)、[REST: Repository rules](https://docs.github.com/en/rest/repos/rules)
- 【確認】複数のルールセットが同じブランチに掛かると、規則は集約され**最も厳しいものが適用**される。ルールセットに優先順位はない。classic のブランチ保護とも併存し、すべてが強制される
  - 出典: [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)(「the most restrictive version of the rule applies」)
  - 含意: 「緩いルールセットを別に置いて記録パスだけ緩める」ことは**できない**

### 1.2 `pull_request` 規則のパラメータ(REST の正式名)

- 【確認】`required_approving_review_count`(0〜10)は**ルールセット単位の一律の値**。パスごとに変えるパラメータはない
- 【確認】そのほかのパラメータ
  - `dismiss_stale_reviews_on_push`
  - `require_code_owner_review`
  - `require_last_push_approval`(最後に push した人以外の承認を要する)
  - `required_review_thread_resolution`
  - `allowed_merge_methods`(merge / squash / rebase)
  - `dismissal_restriction`
  - `require_extra_approval_for_unattributed_changes`(人に帰属しない Copilot の PR は承認を1件多く要する。public preview。承認数 0 なら効果なし)
  - `required_reviewers`(下記 1.3)
  - 出典: [REST: Repository rules](https://docs.github.com/en/rest/repos/rules)、[Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- 【確認】承認数 0 でも「PR を経由すること」自体は強制される(「The pull request doesn't necessarily have to be approved, but it must be opened.」)
  - 出典: [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- 【確認】数えられる承認は write 以上の権限を持つ人のもの。PR の作成者は自分の PR を承認できない
  - 出典: [Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews)(「Pull request authors cannot approve their own pull requests.」)

### 1.3 パスごとの必須レビュア `required_reviewers`(新機能)

- 【確認】経緯
  - 2025-11-03: public preview として告知(「Required review by specific teams now available as a preview feature in rulesets」)— [Community Discussion #178776](https://github.com/orgs/community/discussions/178776)
  - 2026-02-13 前後: 否定パターン `!` を追加(同スレッドの GitHub 職員 patrick-knight の発言「should be live now」)
  - 2026-02-17: GA — [Required reviewer rule is now generally available](https://github.blog/changelog/2026-02-17-required-reviewer-rule-is-now-generally-available/)
- 【確認】仕様
  - `pull_request` 規則の中のオプション。`required_reviewers[]` の各要素 = `reviewer`(**type は `Team` のみ**)+ `file_patterns`(パターン列)+ `minimum_approvals`(0〜10。0 は通知のみで任意)
  - 最大 15 チーム
  - パターンは `.gitignore` 風。`!` で否定でき、**順に評価されるので後の否定が先の一致を外す**(GA 告知の例は `*.sql` に対する `!test/*.sql`)
  - チームの承認が数えられるのは、チームが write 以上の権限を持つとき
  - **ユーザー所有のリポジトリでは使えない**(「This rule is not available on user-owned repositories as they do not contain teams.」)
  - CODEOWNERS を置き換えず補う(「augments CODEOWNERS files but doesn't replace them」)
  - 出典: [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)、[Enterprise Cloud 版の同ページ](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)、[REST: Repository rules](https://docs.github.com/en/rest/repos/rules)、[GA changelog](https://github.blog/changelog/2026-02-17-required-reviewer-rule-is-now-generally-available/)
- 【確認】複数チームの要求は AND(GitHub 職員の発言「The reviews for teams are ANDs unless you create a parent team」)— [Discussion #178776](https://github.com/orgs/community/discussions/178776)
- 【未確認】`required_reviewers` のチーム承認と `required_approving_review_count` の一律の値が**どう合成されるか**(加算か、同じ承認が両方を満たすか)。docs・changelog・REST のいずれにも記述がない
- 【未確認】ドキュメントは pattern 構文を「`.gitignore` 風」、REST は「fnmatch」と書いており、表記が揺れている
- 【未確認】コミュニティでは「1 チームあたりのパターン数が 15 まで」という報告がある(同スレッド)。docs で上限を確かめられなかった

### 1.4 バイパス(bypass_actors)

- 【確認】`actor_type` の値: `Integration`(GitHub App)、`OrganizationAdmin`、`RepositoryRole`、`Team`、`DeployKey`、`User`
- 【確認】`bypass_mode` の値(既定 `always`)
  - `always`: ルールセットのすべての規則をバイパスできる
  - `pull_request`: **PR の規則だけをバイパスできる**。PR を開くことは要る。branch ルールセットだけで有効。`DeployKey` には適用されない
  - `exempt`: そのアクターには規則を**評価せず、バイパスの監査記録も作らない**(2025-09-10 追加)
  - 出典: [REST: Repository rules](https://docs.github.com/en/rest/repos/rules)、[Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)、[GitHub ruleset exemptions(changelog 2025-09-10)](https://github.blog/changelog/2025-09-10-github-ruleset-exemptions-and-repository-insights-updates/)
- 【確認】exempt は「silently skips enforcement」で目に見える痕跡を残さない。通常のバイパスは break-glass の行為として監査記録を残す
  - 出典: [changelog 2025-09-10](https://github.blog/changelog/2025-09-10-github-ruleset-exemptions-and-repository-insights-updates/)
- 【確認】バイパスは**アクター単位**であり、パス単位ではない。どのパスを変えたかでバイパスの可否を変える指定はない(REST のスキーマに該当フィールドがない)
- 【未確認】ユーザー所有のリポジトリで bypass list に入れられるアクターの範囲(Team は存在しない。Repository admin ロール・GitHub App・Deploy key が入るか)を github.com の docs で明示的に確かめられなかった。classic のブランチ保護については「Actors may only be added to bypass lists when the repository belongs to an organization」と明記がある([About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches))

### 1.5 push ルールセットのファイルパス規則

- 【確認】`file_path_restriction`(`restricted_file_paths` + 例外 `ignored_file_paths`)は**指定パスを変えるコミットの push を拒否する**規則。承認を緩める規則ではない。200 件・各 200 字まで、fnmatch 構文
- 【確認】push ルールセットは**private / internal リポジトリとそのフォークネットワーク**が対象。ブランチを問わず全 push に掛かる
  - 出典: [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)、[About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- 含意(事実の範囲): 「記録パスを**守る**」方向(例: 特定アクター以外は `docs/gates/**` を変えられない)には使えるが、「記録パスの承認を**免除する**」方向には使えない

### 1.6 メタデータ制限

- 【確認】コミットメッセージ・作者メール・ブランチ名/タグ名の書式を制御できる。**GitHub Enterprise プランの組織だけ**。squash merge では、ブランチ上の全コミットが基底ブランチのメタデータ要件を満たす必要がある
  - 出典: [Available rules for rulesets(Enterprise Cloud 版)](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- 含意: パスによる承認の別扱いには関係しない

### 1.7 merge queue

- 【確認】merge queue は承認要件を変えない。PR が必須の保護要件を満たしてからキューへ入る。CI は `merge_group` イベントで走らせる必要がある
  - 出典: [Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- 【確認】ルールセットの「Require merge queue」は**組織レベルのルールセットでは使えない**(リポジトリレベルのみ)
  - 出典: [Available rules for rulesets(Enterprise Cloud 版)](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)

### 1.8 組織のルールセットとプラン

- 【確認】2025-06-16 から GitHub Team プランでも組織のルールセットを使える(それ以前は Enterprise のみ)
  - 出典: [Organization rulesets now available for GitHub Team plans](https://github.blog/changelog/2025-06-16-organization-rulesets-now-available-for-github-team-plans/)
- 【確認】リポジトリあたり 75、組織全体で 75 のルールセットまで
  - 出典: [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- 【確認】ルールセットは Free の public リポジトリ、Pro/Team/Enterprise Cloud の public・private リポジトリで使える(GHES 版 docs の記述)
  - 出典: [Managing rulesets for repositories in your organization](https://docs.github.com/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization)

## 2. CODEOWNERS と「Require review from Code Owners」

- 【確認】Code Owner のレビュー必須を有効にすると、所有者のあるファイルを変える PR はその所有者の承認を要する。**所有者のうち誰か1人の承認で足りる**
- 【確認】所有者を書かないパターン(例: `/apps/github` の行に所有者なし)は「所有者なし」となり、「write 権限を持つ誰かの承認」で変更できる
- 【確認】Code Owner は write 権限を要する。CODEOWNERS 自体にも所有者を定めるよう推奨されている
  - 出典: [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- 含意(事実の範囲): CODEOWNERS は「**誰の**承認が要るか」をパスごとに変える仕組み。「**何件**要るか」は `required_approving_review_count` が一律に決める。CODEOWNERS で承認件数を 0 にはできない
- 【未確認】GitHub App は Code Owner になれず、App の承認は Code Owner 要件を満たさない(コミュニティの issue の報告のみ。docs は「people/teams」としか書いていない)

## 3. classic のブランチ保護との違い

- 【確認】classic のブランチ保護も承認件数・Code Owner・最新 push の承認を持つが、**パス単位の選択肢はない**(docs に記述なし)
  - 出典: [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- 【確認】classic は1ブランチに1規則だけ。ルールセットは重ね掛けでき、最も厳しいものが勝つ(1.1)
- 【確認】classic のバイパスは「管理者は既定で縛られない」+「Do not allow bypassing the above settings」の切替。bypass list に actor を入れられるのは組織所有のリポジトリだけ
- 結論(事実の範囲): **パス単位で承認件数を変える公式の手段は、classic にもルールセットにもない**。唯一近いのは 1.3 の `required_reviewers`(パスごとにチームの承認を**足す**方向)で、それを否定パターンと承認数 0 の組み合わせで使う構成が理屈の上では考えられる(4.1 で詳述。動作は未確認)

## 4. 回避の実務

### 4.1 `required_approving_review_count = 0` + `required_reviewers` をパスで張る

- 構成案: 一律の承認数を 0 にし、`required_reviewers` に「`**` と `!docs/gates/**`」のパターンで最小承認 1 のチームを置く。記録パスだけを変える PR は承認なしで PR 経由のマージになり、それ以外は承認 1 件を要する
- 【確認】部品はすべて docs にある(承認数 0 が可、否定パターンが可、順序評価)
- 【未確認】この組み合わせで「記録パスだけの PR は承認ゼロでマージできる」ことを公式に示す記述・事例は見つからなかった。実機で確かめる必要がある
- 【確認】制約: ユーザー所有のリポジトリでは使えない。承認者はチームに限られ、チームは write 以上が要る
- 【確認】制約: このとき `require_last_push_approval` などの一律の要件も記録 PR に及ぶ。一律の承認数 0 なので Copilot の追加承認は効かない

### 4.2 GitHub App を `pull_request` モードでバイパスに入れ、記録 PR だけを App がマージする

- 【確認】`bypass_mode: pull_request` のアクターは PR を開いたうえで PR の規則(承認など)をバイパスしてマージできる
- 【確認】バイパスはアクター単位でありパスを見ない。**「記録パスだけを変えた PR に限る」という制約は App 側(または CI の検査)で実装するしかない**
- 【確認】バイパスは承認を「満たす」のではなく「飛ばす」。`always` / `pull_request` では監査記録(ルールセットのインサイト)が残る。`exempt` は残らない(1.4)
- 【確認】auto-merge はバイパスにならず、全要件を待つ。write 権限を持つ人が有効にできる
  - 出典: [Automatically merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)

### 4.3 GitHub Actions(GITHUB_TOKEN)や App で「承認」する

- 【確認】設定「Allow GitHub Actions to create and approve pull requests」(Actions > General > Workflow permissions)。個人アカウントのリポジトリでは既定で不許可、組織のリポジトリは組織の設定を継ぐ
  - 出典: [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- 【確認】この設定の起源: 2022-01-14 の changelog は、Actions の承認で「Required approvals」を満たし、他者が見ていない変更をマージする抜け道を塞ぐために設けたと説明している。導入時の既定は「Allow GitHub Actions reviews to count towards required approval」= 有効(既存ワークフローを壊さないため)。2022-05-03 に PR の作成も同じ設定の対象になった
  - 出典: [changelog 2022-01-14](https://github.blog/changelog/2022-01-14-github-actions-prevent-github-actions-from-approving-pull-requests)、[changelog 2022-05-03](https://github.blog/changelog/2022-05-03-github-actions-prevent-github-actions-from-creating-and-approving-pull-requests/)
  - 解釈上の注意: 2022 年の文言は「Actions の承認は承認数に数えられうる」ことを前提にしている
- 【未確認・報告が対立】2026 年時点で github-actions[bot] の承認が承認数に数えられるか
  - 2025-12-09 のコミュニティの質問では「設定を有効にしても数えられない」と報告され、GitHub 職員の回答はない — [Discussion #181487](https://github.com/orgs/community/discussions/181487)
  - 公式 docs([Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews))は「write 以上の人の承認が数えられる」としか書かず、bot と App に触れていない
- 【未確認・報告が対立】GitHub App の承認
  - 2026-10-29 のフィードバックでは、`pull_requests: write` + `contents: read` の App の承認は「approved with read-only permissions」と表示され、ルールセットの承認数に数えられないと報告。数えさせるには `contents: write` が要るとしている。職員の回答はない — [Discussion #211598](https://github.com/orgs/community/discussions/211598)
  - 他のリポジトリの issue には「contents: write の App の承認は数えられた」とする検証の報告がある(一次資料ではない)
- 【確認】PR の作成者は自分の PR を承認できない。Actions で PR を作り同じ ID で承認する形は成り立たない(1.2)
- 【確認】GITHUB_TOKEN が起こしたイベントは原則として新しいワークフロー実行を作らない(`workflow_dispatch` / `repository_dispatch` を除く)。2026-06-11 から、github-actions[bot] が作った PR は**書き込み権限を持つ人が承認すれば** CI を走らせられるようになった。人の承認なしで走らせるには App のトークンか PAT を使う
  - 出典: [GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)、[Bot-created pull requests can run workflows if approved(changelog 2026-06-11)](https://github.blog/changelog/2026-06-11-bot-created-pull-requests-can-run-workflows-if-approved/)
  - 含意: 「CI が記録 PR を作り CI が検査する」構成は、GITHUB_TOKEN だと検査が人の操作待ちになる

### 4.4 記録を別ブランチに置き、CI で取り込む

- 【確認】ルールセットの対象は ref で選ぶ(1.1)ので、記録用ブランチ(例: `records/*`)を既定ブランチのルールセットの対象外にすること自体は公式の機能の範囲でできる
- 【確認】ただし既定ブランチへ取り込む時点で、取り込みの PR は既定ブランチの規則(承認 1 件)を受ける。取り込みを承認なしで通すには 4.1 か 4.2 のどちらかが要る
- 【未確認】記録用ブランチや orphan ブランチ・git notes に記録を置く運用を、承認の免除の目的で公式に勧める資料は見つからなかった

### 4.5 「承認者を記名者に寄せる」CODEOWNERS

- 【確認】`docs/gates/**` の Code Owner を判定の記名者にすると、記録 PR の承認者を記名者へ寄せられる。誰か1人の承認で足りる(2 章)
- 【確認】ただし作成者は自分の PR を承認できない。記名者が自分で記録 PR を作ると、承認は別の Code Owner が要る
- 【確認】承認件数は減らない(2 章)

### 4.6 サードパーティのアクション

- 【確認(存在のみ)】設定ファイルでパスと承認者を対応づけ、必須チェックとして判定するアクションがある(例: [theoremlp/required-reviews](https://www.github.com/theoremlp/required-reviews)、Automattic 系の [action-required-review](https://github.com/pasqualesalza/action-required-review))。これは「承認を**足す**」方向の検査で、GitHub 側の承認数を減らすものではない
- 【未確認】この種のアクションの品質・保守状況は評価していない

## 5. 他プラットフォームとの比較

### 5.1 Azure DevOps(Azure Repos)

- 【確認】「Require a minimum number of reviewers」(一律の最小承認数)とは別に、「Automatically included reviewers」は**パス(ファイル・フォルダ)を指定し、Required にできる**。グループに最小人数も指定できる
- 【確認】パスフィルタは `/` かワイルドカードで始める。`;` で区切り、`!` で除外し、左から順に評価する
- 【確認】作成者の自己承認は既定で数えない(「Allow requestors to approve their own changes」で許可)。最後に push した人の承認を数えない設定もある。この設定はポリシーごとに独立している
- 【確認】バイパスは権限として2種(PR 完了時のバイパス / push 時のバイパス)。範囲はプロジェクト・リポジトリ・ブランチ単位。バイパスしてもポリシーは評価され、状態は助言として表示される
  - 出典: [Set and manage branch policies](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies)(ms.date 2026-07-15)
- 【未確認】最小承認数のポリシー自体にパスフィルタがあるか(docs のその節に記述がない。ビルド検証・状態チェック・自動レビュアにはパスフィルタがある)
- 含意(事実の範囲): 「最小承認数ポリシーを置かず、自動レビュアを `/*;!/docs/gates/*` の Required にする」構成で、パス単位の承認を表現できる。4 つの中では最も直接的

### 5.2 GitLab

- 【確認】マージリクエストの承認規則は**ブランチを対象に取る**(Target branch)。パスで規則を絞る記述はなく、パス単位は Code Owners と組み合わせて実現する
  - 出典: [Merge request approval rules](https://docs.gitlab.com/user/project/merge_requests/approvals/rules/)
- 【確認】CODEOWNERS のセクションは承認件数を持てる(`[Section name][2]`)。`^` を前置するとセクションごと任意になる(MR 経由のときだけ。保護ブランチへの直接の変更には依然として要る)。`!` でパスを Code Owner の承認から除外できる(セクション内で有効)
  - 出典: [Code Owners syntax and error handling](https://docs.gitlab.com/user/project/codeowners/reference/)
- 【確認】MR の作成者は既定で承認者に数えない。コミッターの承認を禁じる設定もある
- 含意(事実の範囲): Code Owner の承認はパス単位で免除できる(`!` / `^`)。一律の承認規則(All eligible users の件数)は残る

### 5.3 Gitea

- 【確認】ブランチ保護に「Required approvals」(件数)、承認を許可リストの利用者・チームに限る設定、「Protected file patterns」(該当ファイルを変えるコミットとマージを拒否)、「Unprotected file patterns」(**列挙したファイルだけを変えるコミットなら、write 権限を持つ利用者は直接 push できる**。docs はドキュメントの編集を例に挙げる)がある
  - 出典: [Gitea: Protected branches](https://docs.gitea.com/usage/access-control/protected-branches/)
- 【未確認】Unprotected file patterns が PR の承認件数に影響するか(docs は直接 push への効果しか書いていない)
- 含意(事実の範囲): 「記録パスだけの変更は PR も承認も経ずに直接 push」を公式の機能で持つのは、調べた中では Gitea だけ。ただしこれは「承認の免除」ではなく「PR の免除」である

## 6. 確かめられたこと / 確かめられなかったことの一覧

- 確かめられたこと
  - GitHub にはパス単位で `required_approving_review_count` を変える手段がない(ルールセット・classic とも)
  - ルールセットは ref でしか対象を選べない。重ね掛けでは最も厳しいものが勝つ
  - `required_reviewers`(2026-02-17 GA)はパスごとにチームの承認を足す。否定パターン `!` と最小承認 0 を持つ。ユーザー所有のリポジトリでは使えない
  - バイパスはアクター単位で、`always` / `pull_request` / `exempt` の3モード。exempt は監査記録を残さない
  - push ルールセットのファイルパス規則は禁止の方向だけ。private / internal のみ
  - CODEOWNERS は承認者を変えるが件数は変えない
  - auto-merge と merge queue は承認要件を変えない
  - 作成者は自分の PR を承認できない
  - Azure DevOps は Required の自動レビュアにパスフィルタ(除外 `!` つき)を持つ。GitLab は Code Owner のセクションで件数・任意・除外を持つ。Gitea は Unprotected file patterns で記録パスの直接 push を許せる
- 確かめられなかったこと(追加調査・実機検証が要る)
  - `required_reviewers` の承認と一律の承認数の合成規則
  - 「一律 0 + `required_reviewers` の否定パターン」で記録 PR が承認ゼロでマージできるか(実機検証が要る)
  - 2026 年時点で github-actions[bot] の承認が承認数に数えられるか(2022 年の changelog と 2025-12 の報告が食い違う)
  - GitHub App の承認が数えられる条件(`contents: write` の要否)
  - ユーザー所有のリポジトリのルールセットで bypass list に入れられるアクターの範囲
  - Azure DevOps の最小承認数ポリシーにパスフィルタがあるか
  - Gitea の Unprotected file patterns が PR の承認件数に効くか
  - 日本企業での実態(記録ファイルの承認をどう運用しているか)を示す資料は見つからなかった

---

## 考察(調査者の解釈。事実ではない)

- GitHub の設計思想は「承認の件数はブランチに属し、パスは承認者の選び方(CODEOWNERS / required_reviewers)にだけ効く」と読める。記録パスの承認免除は、GitHub の現行機能では**承認件数を下げる**のではなく、(a)一律の件数を 0 に下げ、パス単位で足し戻す(4.1)か、(b)特定アクターにバイパスさせ、パスの限定をそのアクター側で担保する(4.2)かの、どちらかの形でしか表現できない
- (a)はプラットフォームが強制する点で信頼性が高いが、チーム必須のため本リポジトリ(ユーザー所有)を含む個人所有のリポジトリでは使えず、動作も未検証である。(b)はユーザー所有でも構成しうるが、「記録だけ」の判定が App/CI の実装に移るため、その検査自体が統制点になる。exempt モードは監査記録を残さないので、記録の改ざん防止という目的と逆行する
- Actions/App による「承認」は、2022 年に GitHub 自身が抜け道として塞いだ経緯があり、承認に数えられるかどうかも 2026 年時点で報告が割れている。標準の条項で「機械の承認を承認件数に数える」形を前提にするのは危うい
- 記録 PR の性質(人の判断の写しであり、判断そのものは別の場所で人が行った)を踏まえると、「承認の免除」よりも「承認者を記名者へ寄せる」(4.5)か「記録の真正性を CI で検査する」方が、ゲートの意味を保ちやすいかもしれない。ただし自己承認の禁止と、記名者が PR を作る運用とが衝突する点は会議体で扱う必要がある
- Azure DevOps の自動レビュア+パスフィルタは、パス単位の承認を最も直接に表現できる。標準を特定プラットフォームに依存させないなら、「パス単位の承認規則を持つプラットフォーム」と「持たないプラットフォーム」で要求の満たし方が異なることを、条項側で前提にしておく必要がある
