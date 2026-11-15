# #329 外部調査の新出典(仮番号。台帳へは未登録)

取得日はすべて 2026-11-15。仮番号 SRC-T329-NN は台帳へ登録するときに付け直す。書式は `research/sources/SRC-NNNN.yaml` の要点(title・url・publisher・sourceType・accessed・claims の quote と locator)に倣う。
読みの水準: 【原】公式 HTML の本文を取得して読んだ / 【二】検索結果の要約・ベンダー解説 / 【抜】既存の台帳の抜き書きを引いた。

## SRC-T329-01 Deployments and environments (GitHub Docs)
- url: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- publisher: GitHub / sourceType: vendor-official / 読み: 【原】(HTML の本文を curl で再確認)
- quote 1: "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, required reviewers are only available for public repositories." (locator: Deployment protection rules > Required reviewers)
- quote 2: "If you are on a GitHub Free, GitHub Pro, or GitHub Team plan, wait timers are only available for public repositories."
- quote 3: "Custom deployment protection rules are only available for public repositories for users on GitHub Free, GitHub Pro, and GitHub Team plans."
- quote 4: "Allowing administrators to bypass protection rules is only available for public repositories for users on GitHub Free, GitHub Pro, and GitHub Team plans"(注記。管理者の迂回を許す設定の扱いが、私的リポジトリでは上位プランに限られる。どちらの向きの制約かは頁の文脈の読みが要る。確かめきれていない)
- quote 5: "Deployment branches and tags are available for all public repositories." / "For users on GitHub Pro or GitHub Team plans, deployment branches and tags are also available for private repositories."
- quote 6: "If you are using GitHub Free, environment secrets are only available in public repositories."
- quote 7: "You also have the option to prevent self-reviews for deployments to protected environments"

## SRC-T329-02 Managing environments for deployment (GitHub Docs)
- url: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- sourceType: vendor-official / 【原】(WebFetch の要約)
- quote: "Users with GitHub Free plans can only configure environments for public repositories." Organizations on GitHub Team and users on GitHub Pro can configure environments for private repositories.
- 設定項目: Prevent self-review / Allow administrators to bypass configured protection rules / Deployment branches and tags

## SRC-T329-03 Reviewing deployments (GitHub Docs)
- url: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments
- sourceType: vendor-official / 【原】
- quote: "To approve the job, click Approve and deploy." 自己承認の禁止を設定した環境では、起動した実行を承認できない(要約からの再構成。逐語は未確認)

## SRC-T329-04 About rulesets (GitHub Docs)
- url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets
- sourceType: vendor-official / 【原】(HTML の本文を curl で確認。WebFetch の要約は Team・Enterprise のみと誤っていたので原文で正した)
- quote: "Rulesets are available in public repositories with GitHub Free and GitHub Free for organizations, and in public and private repositories with GitHub Pro, GitHub Team, and GitHub Enterprise Cloud"
- quote: "you can allow certain users to bypass the rules in the ruleset"(バイパス対象はロール・チーム・GitHub App)
- 既存の SRC-0343 と同じ頁の別版(Enterprise Cloud 版)。台帳では SRC-0343 への追記で足りるかもしれない。

## SRC-T329-05 About protected branches (GitHub Docs)
- url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- sourceType: vendor-official / 【原】
- quote: "Protected branches are available in public repositories with GitHub Free and GitHub Free for organizations" / "Protected branches are also available in public and private repositories with GitHub Pro, GitHub Team, GitHub Enterprise Cloud, and GitHub Enterprise Server"
- quote: "You can enable branch restrictions in public repositories owned by a GitHub Free organization and in all repositories owned by an organization using GitHub Team or GitHub Enterprise Cloud"
- 注: 私的リポジトリの Free は、ブランチ保護もルールセットも使えない。

## SRC-T329-06 Events that trigger workflows(workflow_dispatch)(GitHub Docs)
- url: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- sourceType: vendor-official / 【原】(WebFetch)
- quote: "you can dispatch it against any branch or tag via the GitHub API or GitHub CLI" / "This event will only trigger a workflow run if the workflow file exists on the default branch." / GITHUB_REF: "Branch or tag that received dispatch"
- 起動者の資格(書き込み権限)は頁に明記が無かった。

## SRC-T329-07 About Actions policies / workflow execution protections (GitHub Docs)
- url: https://docs.github.com/en/actions/concepts/about-actions-policies
- sourceType: vendor-official / 【原】
- quote: "Actor rules control who can trigger workflows." / "Event rules control which events are permitted."(event に workflow_dispatch を含む。許されないイベントの実行はエラーで失敗する)/ 既定は書き込み権限を持つ全員が起動できる
- プラン別の提供は頁に無かった【未】。既存の調査(293)は Evaluate モードが Enterprise Cloud のみと記録。

## SRC-T329-08 Secure use reference (GitHub Docs)
- url: https://docs.github.com/en/actions/reference/security/secure-use
- sourceType: vendor-official / 【原】
- quote: "Any user with write access to your repository has read access to all secrets configured in your repository."
- quote: "You can use required reviewers to protect environment secrets." / "A workflow job cannot access environment secrets until approval is granted by a reviewer."
- quote: "You can use the CODEOWNERS feature to control how changes are made to your workflow files."

## SRC-T329-09 SLSA v1.2 Source track(既存 SRC-0416 の別の箇所)
- url: https://slsa.dev/spec/v1.2/source-requirements
- sourceType: standard / 【原】(WebFetch)。台帳には SRC-0416 として既にあるので、claims の追加で足りる。
- quote: "Technical Controls are only effective if they are used continuously in the history of a Branch." / "If there is a lapse in continuity for a specific control, continuity of that control MUST be re-established from a new revision."
- quote: "The organization MUST provide evidence of continuous enforcement via technical controls" / "Source Provenance MUST be created contemporaneously with the branch being updated"
- quote: Level 2 "Branch history is continuous, immutable, and retained"; Level 3 "Enforce organizational technical controls."; Level 4 "Require code review."

## SRC-T329-10 DORA capability: Streamlining change approval
- url: https://dora.dev/capabilities/streamlining-change-approval/
- publisher: DORA(Google Cloud) / sourceType: industry-report / 【原】(WebFetch)
- quote: "Use peer review to meet the goal of segregation of duties"(要約中の引用)/ "changes must be approved by someone other than the author"(同)
- 外部承認(CAB)は変更失敗率の低下と結びつかなかった。承認は開発基盤に記録する。

## SRC-T329-11 OpenSSF Scorecard checks(既存 SRC-0574 の別の箇所)
- url: https://github.com/ossf/scorecard/blob/main/docs/checks.md
- sourceType: repo / 【原】(WebFetch)
- quote: "If the provided token does not have admin access, the check will query the branch settings accessible to non-admins." / 管理者向けの項目は "can be safely ignored"
- quote: "Requiring reviews for all changes is infeasible for some projects, such as those with only one active participant."
- quote: Token-Permissions: "The highest score is awarded when the permissions definitions in each workflow's yaml file are set as read-only"

## SRC-T329-12 NIST SSDF(SP 800-218 v1.1、プロジェクト頁)
- url: https://csrc.nist.gov/projects/ssdf
- sourceType: standard / 【原】(WebFetch)
- 現行版は v1.1。頁に v1.2・2.0 の草案への言及は無かった。PO.5 "Implement and Maintain Secure Environments for Software Development"。PS.1 の名称は頁に無く、既存の SRC-0718 の抜き書きを使う。

## SRC-T329-13 SOC 2 CC5.1 / CC8.1 の解説群(二次)
- url(代表): https://oneuptime.com/blog/post/2026-08-03-soc-2-access-reviews-five-person-startup/markdown ほか(検索結果。個別に開いていない)
- sourceType: corp-techblog / 【二】
- 内容: CC5.1 の注目点「分離が実際的でない場合、経営者は代替の統制活動を選び整備する」(一次は既存 SRC-0538 の原文)。小さな体制の実務は検出型(通知・ログ・経営者の承認)を代替に置き、衝突・代替統制・受容した残余リスクを文書化する。検出型だけで足りるかは監査人しだい。予防の関門(ブランチ保護・必須レビュー)を併置して期待する、との解説もある。
- 注意: 規範の根拠にしない。AICPA の原文は SRC-0538 を使う。

## SRC-T329-14 ISO/IEC 27001:2022 附属書A 8.32 の解説群(二次)
- url(代表): https://iso27001security.com/ISO27k_ISMS_A8.32_skeleton_policy_on_change_management_2023.txt ほか
- sourceType: community / 【二】
- 内容: 8.32「情報処理施設・情報システムの変更は変更管理手順に従うべき」。固定のチェックリストは無く設計は組織に任される。5.3(職務の分離)の「困難な場合は監視・監査証跡・経営者の監督」は記憶に基づく記述で、原文は未確認【未】。
