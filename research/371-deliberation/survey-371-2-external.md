# #371 外部調査 2: CI の定義・検査スクリプトを同じ PR で書き換えて検査を緩める問題への構成の実務

- 調査時点: 2026-11-05(全出典の取得日は 2026-11-05)
- 論点: `pull_request` で走る CI は PR 側(マージコミット)の `.github/workflows/` と検査スクリプトで走る。検査を緩める変更が、緩めた検査を通る。必須の状態チェックは名前(context)だけで指定され、送り手を縛らない
- 記法: 【事実】= 原文で確かめた内容(引用つき)/【推測】= 調査者の解釈
- 取得経路の注記: Web ページの引用は WebFetch の要約モデル経由で取得した(逐語性は高いが、条項へ引く前に原文の目視確認を推奨する)。NIST SP 800-218・SP 800-204D は PDF 全文を直接読んだ(逐語)

---

## 1. GitHub の機能

### 1.1 `pull_request` と `pull_request_target` の違い

- 出典: GitHub Docs "Events that trigger workflows" <https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows>(取得 2026-11-05)
- 【事実】`pull_request`
  - GITHUB_SHA: "Last merge commit on the `GITHUB_REF` branch"
  - GITHUB_REF: "PR merge branch `refs/pull/PULL_REQUEST_NUMBER/merge`"
  - "The `GITHUB_TOKEN` has read-only permissions in pull requests from forked repositories."
- 【事実】`pull_request_target`
  - GITHUB_SHA: "Last commit on default branch" / GITHUB_REF: "Default branch"
  - "This event runs in the context of the default branch of the base repository, rather than in the context of the merge commit, as the `pull_request` event does."
  - "This prevents execution of unsafe code from the head of the pull request"
  - "Avoid using this event if you need to build or run code from the pull request."
  - "Running untrusted code on the `pull_request_target` trigger may lead to security vulnerabilities." "These vulnerabilities include cache poisoning and granting unintended access to write privileges or secrets."
- 本件への示唆
  - 【事実から直接】`pull_request` はワークフロー定義そのものを PR 側(マージコミット)の版で読む。論点の前提(緩めた検査で走る)は仕様どおり
  - 【推測】`pull_request_target` に切り替えればワークフロー定義は既定ブランチの版になる。ただし検査の対象である PR のコードを checkout して、その中の検査スクリプトを実行した時点で、PR 側の検査スクリプトが書き込み権限・シークレットつきで走る。「定義もスクリプトも基底から、PR からは検査対象のデータだけを読む(実行しない)」という分離をしない限り、論点は解決せず危険が増える

### 1.2 GitHub Security Lab "Preventing pwn requests"

- 出典: <https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/>(取得 2026-11-05)
- 【事実】
  - "Workflows triggered via `pull_request_target` have write permission to the target repository." "They also have access to target repository secrets."
  - "GitHub's standard `pull_request` workflow trigger by default prevents write permissions and secrets access" to the target repository.
  - "`pull_request_target` runs in the context of the target repository of the PR, rather than in the merge commit."
  - "Combining `pull_request_target` workflow trigger with an explicit checkout of an untrusted PR is a dangerous practice"
  - シークレットがなくても危険: "a workflow triggered on `pull_request_target` still has the read/write repository token in memory"
- 本件への示唆
  - 【推測】基底の版で検査するために `pull_request_target` を使う案は、Security Lab が名指しで危険とする構成(信頼できない PR の checkout)に該当しやすい。採るなら「PR のコードを実行しない(静的に読むだけ)」「`permissions:` で権限を最小化」を条件にする必要がある
  - 【未確認】同記事が推奨する「権限のない `pull_request` で処理し、結果を `workflow_run` で受け渡す」二段構成の原文は、今回の取得範囲で引用できていない

### 1.3 必須の状態チェックの送り手の指定(expected source / integration_id)

- 出典 A: GitHub Docs "Available rules for rulesets" <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>(取得 2026-11-05)
  - 【事実】"When you add a required status check rule, you can select an app as the expected source of status updates." "The app must be installed in the repository with the `statuses:write` permission" "must have recently submitted a check run" "If the status is set by any other person or integration, merging won't be allowed."
- 出典 B: GitHub Docs "About protected branches" <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>(取得 2026-11-05)
  - 【事実】"you can select an app that has recently set this check as the expected source of status updates" / "If you select "any source", you can still manually verify the author of each status, listed in the merge box."
- 出典 C: GitHub REST API "Repository rules" <https://docs.github.com/en/rest/repos/rules>(取得 2026-11-05)
  - 【事実】`required_status_checks[].context`: "The status check context name that must be present on the commit." / `integration_id`: "The optional integration ID that this status check must originate from."
- 本件への示唆
  - 【事実から直接】既定は "any source"。送り手を縛るのは任意の設定
  - 【推測】送り手を "GitHub Actions" アプリに縛っても、**どのワークフロー(どのファイル・どの版)から送られたか**は縛れない。PR が同名のジョブを持つ別のワークフローを足す、あるいは既存のワークフローの中身を差し替えれば、同じアプリ・同じ context で成功を送れる。送り手の指定は「人や外部トークンによる偽の status」を止めるが、論点の「PR が検査そのものを書き換える」は止めない。原文はこの限界を明記していない(推測である旨を保つ)

### 1.4 ルールセットの「Require workflows to pass before merging」(ruleset workflows)

- 出典 A: GitHub Docs(Enterprise Cloud 版)"Available rules for rulesets" <https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>(取得 2026-11-05)
  - 【事実】"Ruleset workflows can be configured at the organization or enterprise level"
  - 【事実】"When you add this rule to a ruleset, in your organization settings, you specify the source repository and the workflow you want to enforce"
  - 【事実】"The workflow file needs to be in a repository that matches the visibility of the repositories you want to run it in." / "a public workflow can run on any repository in your organization" / "a private workflow can only run on private repositories."
  - 【事実】"Ruleset workflows support using the `pull_request`, `pull_request_target` and `merge_group` events."
  - 【事実】"Applying this rule will block direct pushes."
  - 【事実】"Ruleset workflows can't use most CodeQL actions."
  - 注: 同じページの github.com 一般版(Free/Pro/Team 向け表示)には、この節が現れなかった。版によって表示が出し分けられている
- 出典 B: GitHub Docs(Enterprise Cloud 版)"Troubleshooting rules" <https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules>(取得 2026-11-05)
  - 【事実】"Any filters you specify for the supported events are ignored" / "Ruleset workflows do not run on events triggered by the `GITHUB_TOKEN`."
- 出典 C: GitHub REST API "Repository rules" <https://docs.github.com/en/rest/repos/rules>(取得 2026-11-05)
  - 【事実】rule type `workflows` のパラメータ: `path` "The path to the workflow file" / `ref` "The ref (branch or tag) of the workflow file to use" / `repository_id` "The ID of the repository where the workflow is defined" / `sha` "The commit SHA of the workflow file to use"
- 出典 D: GitHub Docs "Required workflows"(旧機能) <https://docs.github.com/actions/using-workflows/required-workflows>(検索結果の要約で確認、取得 2026-11-05)
  - 【事実(検索要約・原文未確認)】旧 required workflows は廃止され、ルールセットへ移行した
- 出典 E: GitHub Docs "About rulesets" <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>(取得 2026-11-05)
  - 【事実】"For organizations on the GitHub Enterprise plan, you can set up rulesets at the organization level to target multiple repositories in your organization."
- 本件への示唆
  - 【事実から直接】ワークフローの定義は、組織が指定した**別のリポジトリ(source repository)の、指定した ref または SHA** から読まれる。PR は強制されるワークフローの定義を書き換えられない。論点の「定義の書き換え」に正面から効く GitHub 標準の機能はこれだけ
  - 【事実から直接】組織・Enterprise レベルの設定である。**個人所有のリポジトリでは使えない**(組織の設定画面で指定する機能のため)
  - 【推測を含む】プラン要件は、組織ルールセットが Enterprise プラン向けとする記述から、実質 GitHub Enterprise(Cloud)が要ると読める。料金表で明記された箇所は確認できなかった
  - 【推測】強制されるワークフローが `actions/checkout` で PR のコードを取得し、PR 側の検査スクリプト(例: `scripts/check-*.mjs`、`package.json` の `check`)を呼ぶ構成なら、スクリプトの書き換えは依然として効く。定義だけでなく**検査ロジックも source repository 側(または SHA 固定)に置く**必要がある
  - 【推測】`sha` 固定なら source repository 側の改変からも切り離せる。`ref` 指定ならその ref への push 権限者が検査を変えられる

### 1.5 CODEOWNERS による `.github/workflows/` の保護と code owner レビュー必須

- 出典: "Available rules for rulesets"(上掲)・"About protected branches"(上掲)・REST API(上掲)、取得 2026-11-05
- 【事実】"any pull request that modifies content with a code owner must be approved by that code owner" "before the pull request can be merged into the protected branch." / "an approval from *any* of the code owners will be sufficient to meet this requirement."
- 【事実】REST `require_code_owner_review`: "Require an approving review in pull requests that modify files that have a designated code owner."
- 本件への示唆
  - 【推測】`.github/workflows/` と検査スクリプト(`scripts/`、`package.json`)を CODEOWNERS で所有させ、code owner レビューを必須にすれば、検査を緩める変更には必ず所有者の承認が要る。「緩めた検査を通る」こと自体は止めないが、「緩めたことを人が見ずにマージされる」ことを止める。技術的な予防ではなく、人による統制
  - 【推測・原文未確認】CODEOWNERS ファイル自身も所有させないと、PR が CODEOWNERS を書き換えて回避できる。GitHub は基底ブランチの CODEOWNERS を使うとされるが、本調査では原文を確認していない
  - 【推測】ソロ運用では作成者が自分の PR を承認できないため、code owner が作成者本人だけなら要件を満たせない(または管理者のバイパスで抜ける)

### 1.6 「Require approval of the most recent reviewable push」

- 出典: "About protected branches"(上掲)、REST API(上掲)、取得 2026-11-05
- 【事実】"the most recent reviewable push must be approved by someone other than the person who pushed it" / REST `require_last_push_approval`: "Whether the most recent reviewable push must be approved by someone other than the person who pushed it."
- 本件への示唆
  - 【推測】承認の後に検査を緩めるコミットを足す「承認後のすり替え」を止める。code owner レビュー必須と組み合わせて初めて、検査の改変が別人の目を通ることを保証する
  - 【推測】「別人」が要件のため、ソロ運用では満たせない。AI エージェントが push し人が承認する構成なら「push した者と承認者が別」は成立しうる(本標準のロール分離と接続する論点)

### 1.7 プランと所有形態による利用可否

- 出典: GitHub Docs "GitHub's plans" <https://docs.github.com/en/get-started/learning-about-github/githubs-plans>(取得 2026-11-05)
  - 【事実】GitHub Free(個人・組織)は "unlimited public repositories with a full feature set"。private リポジトリの保護ブランチ・code owners 等は Pro / Team 以上
- 出典: "About protected branches"(上掲)
  - 【事実】"Actors may only be added to bypass lists when the repository belongs to an organization."
- 本件への示唆
  - 【推測】個人所有の public リポジトリ(本プロジェクト)で使えるのは、リポジトリ単位のルールセット/保護ブランチ(必須チェック・送り手アプリの指定・code owner レビュー・最新 push の承認)まで。ruleset workflows は使えない

---

## 2. 業界の実務

### 2.1 OpenSSF Scorecard: Dangerous-Workflow・Branch-Protection

- 出典: OpenSSF Scorecard "checks.md" <https://github.com/ossf/scorecard/blob/main/docs/checks.md>(取得 2026-11-05)
- 【事実】Dangerous-Workflow(Risk: Critical)
  - 検出する型 1: "`pull_request_target` or `workflow_run`" のトリガーと、PR の明示的な checkout の組み合わせ。checkout が安全に使われているか(ラベル付き PR に限る等)までは検証しない(要約)
  - 検出する型 2: GitHub のコンテキスト変数(例: `github.event.issue.title`)からのスクリプトインジェクション。"These values should not flow directly into executable code."
- 【事実】Branch-Protection(Risk: High)は段階制(要約)
  - Tier 1(3/10): force push 禁止、ブランチ削除禁止
  - Tier 2(6/10): レビュアー1名以上、管理者にも PR を要求、up to date の要求(またはマージキュー)、**最新の reviewable push の承認**
  - Tier 3(8/10): "Require branch to pass at least 1 status check before merging."
  - Tier 4(9/10): レビュアー2名以上、"Require review from code owners."
  - Tier 5(10/10): 新しいコミットで古い承認を取り消す、管理者にもレビュー要件を課す
  - 管理者トークンがない場合は、読める設定だけを評価する(要約)
- 本件への示唆
  - 【事実から直接】Scorecard は「必須の状態チェックが1つ以上ある」ことを点数にするが、**状態チェックの送り手やワークフローの版を検査しない**(検査項目に現れない)
  - 【推測】Scorecard の満点構成(code owner レビュー+最新 push の承認+古い承認の取り消し)は、論点を「人による承認」で塞ぐ型である。CI の定義を基底から読む型(1.4)は Scorecard の評価軸にない

### 2.2 SLSA Source track(v1.2)

- 出典: SLSA "Source requirements" v1.2 <https://slsa.dev/spec/v1.2/source-requirements>(取得 2026-11-05)。表が平坦化されて取得されたため、レベルの割り当ては原文の目視確認が要る
- 【事実】
  - L2〜L4: "The organization MUST configure access controls to restrict sensitive operations on the Source Repository."
  - L2〜L4: "the SCS MUST record all changes to Named References, including when they occurred, who made them"
  - L3〜L4: "The organization MUST provide evidence of continuous enforcement via technical controls for any claims"
  - L3〜L4: "The SCS MUST provide the ability for an organization to enforce customized technical controls for Named References."
  - L3〜L4: "For each technical control claimed in a VSA, continuity MUST be established and tracked from a specific start revision."
  - L4(Two-party review): "Changes in protected branches MUST be agreed to by two or more trusted persons prior to submission." / "if additional changes are made during the review process, those changes MUST be reviewed as well." / "An organization MAY choose to grant a Trusted Robot a perpetual exception to a policy"
- 【事実】要約モデルの報告では、SLSA Source は「CI の検査・統制の設定の変更をレビューすること」を個別には要求していない
- 本件への示唆
  - 【推測】SLSA は「技術的統制(technical controls)が継続して強制されていること」の証拠を L3 で求める。PR が自分の検査を緩められる構成では、検査という統制の「継続性」を主張しにくい。検査の定義を統制の対象(保護された参照・二者レビューの対象)へ含めることは、SLSA の要求から導ける解釈である(原文の明示はない)
  - 【推測】L4 の「レビュー中の追加変更もレビューする」は GitHub の「最新の push の承認」(1.6)に対応する

### 2.3 OpenSSF Source Code Management Platform Configuration Best Practices

- 出典: OpenSSF Best Practices WG "SCM Best Practices"(2023-08-29) <https://best.openssf.org/SCM-BestPractices/>(取得 2026-11-05)
- 【事実】方針の題目(抜粋): "Workflows Should Not Be Allowed To Approve Pull Requests" / "Default Workflow Token Permission Should Be Read Only" / "Default Branch Should Require All Checks To Pass Before Merge" / "Default Branch Should Require New Code Changes After Approval To Be Re-Approved" / "Default Branch Should Limit Code Review to Code-Owners" / "Default Branch Should Require Code Review By At Least Two Reviewers" / "Repository Should Not Allow Committer Approvals" / "Merge Request Authors Should Not Be Able To Override the Approvers List"(GitLab)
- 【事実】一覧の題目には「CI の定義ファイル(workflow files)の変更を保護する」「CODEOWNERS ファイルを保護する」「`pull_request_target`」を直接扱う方針は**現れない**(取得したのは題目の一覧。各方針の本文は未読)
- 本件への示唆
  - 【推測】依頼にあった「CI の設定の変更をレビューの対象にする」という OpenSSF の明示的なガイダンスは、今回確認できた範囲では見つからなかった。OpenSSF の実務は「全変更に code owner レビュー+再承認」で一般に覆う型であり、CI 定義を特別扱いする条項ではない

### 2.4 Kubernetes Prow: 検査の設定を中央(trusted)から読む構成

- 出典 A: KEP-2291 "Presubmit config inside the tested repo" <https://www.kubernetes.dev/resources/keps/2291/>(取得 2026-11-05)
  - 【事実】"all jobs for Prow are configured in a central `infra-config` repository."
  - 【事実】既存の攻撃経路として "a rogue pull requestor changing the scripts that are being executed during a test run"
  - 【事実】inrepoconfig を許すと "a pull requestor could additionally create new Jobs that use credentials" that were previously unavailable
  - 【事実】どちらの危険も "require the pull requestor to be an org member or to get an org member to approve the pull request"
  - 【事実】緩和策の候補: "Extend the configuration for `inrepoconfig` to allow/deny specific values for various job properties." / "Maintain an allow/deny list for users that are allowed to change job configs." / webhook による許否。ただし緩和策は "will not be part of its first iteration."
- 出典 B: Prow Docs "Inrepoconfig" <https://docs.prow.k8s.io/docs/inrepoconfig/>(取得 2026-11-05)
  - 【事実】"Inrepoconfig is a Prow feature that allows versioning Presubmit and Postsubmit jobs" / "If enabled, Prow will use both the centrally-defined jobs and the ones defined in the code repositories."
- 本件への示唆
  - 【事実から直接】Prow の既定は「ジョブの**定義**を中央のリポジトリに置く」構成。PR はジョブの定義を変えられない。ただし KEP 自身が認めるとおり、**ジョブが実行するスクリプトは PR 側のもの**であり、スクリプトの書き換えは既定でも効く(Prow は org member による `/ok-to-test` 等の承認でこれを統制する)
  - 【推測】Prow の型は GitHub の ruleset workflows(1.4)と同じ限界を持つ。「定義の中央化」は「スクリプトの中央化」を含まない。両者を区別して条項を書く必要がある

### 2.5 GitLab: Pipeline execution policy・Compliance pipelines

- 出典 A: GitLab Docs "Pipeline execution policies" <https://docs.gitlab.com/user/application_security/policies/pipeline_execution_policies/>(取得 2026-11-05)
  - 【事実】"Use pipeline execution policies to manage and enforce CI/CD jobs for multiple projects with a single configuration."
  - 【事実】`inject_policy`: "This strategy adds custom CI/CD configurations into the existing project pipeline." プロジェクトの設定は "cannot override any behavior defined in the policy pipelines."
  - 【事実】`override_project_ci`: "This strategy replaces the project's existing CI/CD configuration with a new one."
  - 【事実】"By default, the policy variables are enforced with the highest precedence and users cannot override them." `[skip ci]` 等は既定で無視され "This prevents developers from skipping the execution of jobs defined in the policy."
  - 【事実】"Make sure the pipeline execution policy CI/CD configuration is stored in a security policy project."
  - 【事実】"Tier: Ultimate"
- 出典 B: GitLab Docs "Compliance pipelines" <https://docs.gitlab.com/user/compliance/compliance_pipelines/>(取得 2026-11-05)
  - 【事実】"Group owners can configure a compliance pipeline in a project separate to other projects." "Jobs and variables defined in the compliance pipeline can't be changed by variables in the labeled project's" `.gitlab-ci.yml`
  - 【事実】"This feature was deprecated in GitLab 17.3 and is planned for removal in 20.0."(同じページの別の箇所は 19.0 と書く。版の記述が食い違う)
  - 【事実】"Tier: Ultimate"
- 本件への示唆
  - 【事実から直接】GitLab は「検査の定義を別のプロジェクト(security policy project)に置き、開発者が上書き・スキップできない」形を製品機能として持つ。GitHub の ruleset workflows と同じ型で、どちらも最上位の有償プランに限られる
  - 【推測】ここでも、ポリシーのジョブがプロジェクト側のスクリプトを呼ぶなら、スクリプトの書き換えは効く。ポリシーのジョブを自己完結させるかが要点

---

## 3. 規格

### 3.1 NIST SP 800-218(SSDF v1.1)PO.3・PS.1

- 出典: NIST SP 800-218 (Feb 2022) <https://doi.org/10.6028/NIST.SP.800-218>(PDF 全文を読んだ、取得 2026-11-05)
- 【事実】PO.3 "Implement Supporting Toolchains": "Use automation to reduce human effort and improve the accuracy, reproducibility, usability, and comprehensiveness of security practices throughout the SDLC, as well as provide a way to document and demonstrate the use of these practices. Toolchains and tools may be used at different levels of the organization, such as organization-wide or project-specific, and may address a particular part of the SDLC, like a build pipeline."
  - PO.3.1: "Specify which tools or tool types must or should be included in each toolchain to mitigate identified risks, as well as how the toolchain components are to be integrated with each other." Example 1: "Define categories of toolchains, and specify the mandatory tools or tool types to be used for each category."
  - PO.3.2: "Follow recommended security practices to deploy, operate, and maintain tools and toolchains." Example 3: "Use code-based configuration for toolchains (e.g., pipelines-as-code, toolchains-as-code)." Example 6: "Continuously monitor tools and tool logs for potential operational and security issues, including policy violations and anomalous behavior." Example 7: "Regularly verify the integrity and check the provenance of each tool to identify potential problems."
  - PO.3.3: "Configure tools to generate artifacts of their support of secure software development practices as defined by the organization."
- 【事実】PO.4.2 Example 4: "Only allow authorized personnel to access the gathered information, and prevent any alteration or deletion of the information."
- 【事実】PS.1 "Protect All Forms of Code from Unauthorized Access and Tampering": "Help prevent unauthorized changes to code, both inadvertent and intentional, which could circumvent or negate the intended security characteristics of the software."
  - PS.1.1: "Store all forms of code – including source code, executable code, and configuration-as-code – based on the principle of least privilege so that only authorized personnel, tools, services, etc. have access."
  - Example 4: "Have the code owner review and approve all changes made to the code by others."
- 【事実】PW.6.1 Example 2: "Follow change management processes when deploying or updating compiler, interpreter, and build tools, and audit all unexpected changes to tools."
- 【事実】冒頭の位置づけ: "The SSDF does not prescribe how to implement each practice."
- 本件への示唆
  - 【事実から直接】SSDF は configuration-as-code(パイプライン定義を含むと読める)を「コード」として PS.1 の保護対象に含め、code owner のレビューを例示する。PW.6.1 はビルドツールの更新に変更管理を求める
  - 【推測】「検査スクリプトとワークフロー定義の変更を、検査対象のコードと同じ以上の統制下に置く」は SSDF から導ける。ただし「基底の版で検査する」という実装は SSDF は指定しない(成果志向)

### 3.2 NIST SP 800-204D(2024-02)

- 出典: NIST SP 800-204D <https://doi.org/10.6028/NIST.SP.800-204D>(PDF 全文を読んだ、取得 2026-11-05)
- 【事実】3.1.5: "Checks, such as scanning and various types of tests (e.g., static, dynamic, or interactive), may have been bypassed in the CI/CD process."(信頼を失う原因の列挙)
- 【事実】5 の前提条件: "In general, the driver tools or build control plane execute at a higher level of trust than the individual functional steps, such as build."
- 【事実】5.1.1: 証拠は "signed by a trusted component of the build framework that is not under the control of the developers" / "the evidence generated should be enabled by a process with a higher level of trust or isolation than the build itself to protect against tampering."
- 【事実】5.1.2: "Developers with “merge approval” permissions cannot approve their own merges."
- 【事実】5.1.2 PULL-PUSH_REQ-1: "The project maintainer should run automated checks on all artifacts covered in the change being pushed, such as unit tests, linters, integrity tests, security checks, and more."
- 【事実】5.1.2 PULL-PUSH-REQ-3: SCM は "run CI workflows in sandboxed environments without access to the network, any privileged access, or the ability to read secrets or b) have built-in protection that incorporates a delay in CI workflow runs until they are approved by a maintainer with write access."
- 【事実】5.1.2 PULL-PUSH_REQ-4: 組み込みの保護がなければ外部ツール(例 "OpenSSF scorecard")で SCM の設定を評価する
- 【事実】5.1: "Although providing support for artifact testing (that generates tamper-proof records of test runs and associated results) is an important security goal, it is beyond the scope of this document."
- 本件への示唆
  - 【事実から直接】800-204D は「検査が CI の中で迂回されうる」ことを脅威として明記し、制御面(driver tools / build control plane)は個々のステップより高い信頼水準で動くべきとする。**検査を行う側(制御面)が、検査される側(開発者の変更)の管理下にあってはならない**という原則は、本件の論点に直接当たる
  - 【事実から直接】ただし「改ざん耐性のある検査記録」は範囲外と明言している。検査の版の固定までは規定しない

### 3.3 ISO/IEC 27001:2022 附属書A 8.32・8.4

- 【未達】ISO/IEC 27001:2022 および 27002:2022 の該当条項の原文は、今回取得できなかった(公開プレビューの探索まで手が回らなかった)
- 二次情報(参考のみ、条項へ引かない)
  - isms.online ほか <https://www.isms.online/iso-27001/annex-a-2022/8-4-access-to-source-code-2022/>(取得 2026-11-05、検索結果の要約): 8.4 は source code に加え **development tools と software libraries** への読み書きアクセスを対象とすると説明されている。27002:2014 の 9.4.5 を置き換えたとされる
- 【推測】8.4 が「開発ツール」を対象に含むなら、CI のワークフロー定義・検査スクリプトへの書き込みアクセスの統制は 8.4 の範囲に入りうる。8.32(変更管理)は情報処理設備の変更を統制の対象とするため、検査基盤の変更にも適用されうる。いずれも原文での確認が要る

---

## 4. 考察(調査者の解釈)

- 論点は2層に分かれる。原文の整理から、次の区別が必要と考える
  - 層 A「ワークフロー定義の書き換え」: GitHub ruleset workflows(組織・Enterprise)、GitLab pipeline execution policy(Ultimate)、Prow の中央ジョブ定義が正面から塞ぐ。いずれも「定義を別の場所(別リポジトリ・別プロジェクト)に置き、ref/SHA で固定する」型
  - 層 B「定義が呼ぶ検査スクリプトの書き換え」: 上の3つはいずれも、定義が PR 側のスクリプトを呼ぶ限り塞がない(Prow の KEP-2291 が明記)。塞ぐには検査ロジックそのものを信頼される側に置き、PR からはデータとして読むだけにする必要がある
- 送り手の指定(integration_id)は、層 A・B のどちらも塞がない。止めるのは「人・外部トークンによる偽の status」だけ(推測、原文は限界を明記しない)
- 個人所有のリポジトリで技術的に層 A・B を塞ぐ GitHub 標準の機能は見当たらない。使えるのは「人による統制」(CODEOWNERS+code owner レビュー+最新 push の承認)で、これは別人の存在を前提にする
  - 本標準のロール分離(AI エージェントが push、人が承認)なら「push した者 ≠ 承認者」は成立しうる。これは本件に固有の接続点であり、会議体で検討する価値がある
- 規格は「どう実装するか」を指定しない(SSDF の明言)。ただし SP 800-204D の「制御面は個々のステップより高い信頼水準」「検査は迂回されうる」、SSDF PS.1.1 の configuration-as-code の保護、SLSA L3 の「技術的統制の継続的強制の証拠」から、「検査の定義と検査ロジックの変更を、検査される変更と同じ経路で自己承認させない」という要求は導ける
- 日本企業の実態(建前と実運用の乖離)に触れる一次情報は、今回の範囲では見つからなかった

---

## 5. 追加調査が必要な穴

1. GitHub Security Lab 記事の `workflow_run` 二段構成の推奨の原文引用
2. GitHub が PR の CODEOWNERS を基底ブランチから読むことの原文確認(CODEOWNERS 自体の改ざんで回避できるか)
3. ruleset workflows のプラン要件(Enterprise 必須か Team でも可か)の料金表・changelog での確認
4. 2025 年後半の GitHub の `pull_request_target` の仕様変更(ワークフローの版を常に既定ブランチから読む、とされる changelog)の有無と内容。今回の Docs の記述は「default branch」で一致したが changelog は未確認
5. ISO/IEC 27001:2022 A.8.32・A.8.4 と 27002:2022 の該当の手引きの原文(公開プレビュー PDF の探索)
6. NIST SP 800-218 の改訂版(Rev.1 の草案の有無)の確認
7. OpenSSF SCM Best Practices の各方針の本文(題目しか読んでいない)
8. SLSA v1.2 Source のレベル割り当て表の目視確認
9. 日本の企業文化における実運用(CI の設定を誰が変えられるか、の実態)の情報
