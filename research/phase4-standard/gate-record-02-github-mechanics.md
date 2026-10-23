# ゲート判定の記録としての GitHub PR 承認: 永続性・改変可能性・既定ブランチへの固定

- 調査日: 2026-10-23
- 問い: GitHub の PR 承認レビュー(APPROVED)を「ゲート判定の記録」として扱うとき、記録としてどの程度信頼でき、どんな場合に消えるか。保護されたブランチ上のファイルを Bot が更新する手続のコストを下げる仕組みは何か
- 方法: GitHub 公式ドキュメント(docs.github.com、github.blog changelog)を一次資料とし、公式に書かれていない点は community discussion・第三者資料で補い、その旨を明記しました。一部は `gh api` で公開リポジトリ(cli/cli)に対して実機確認しました
- 表記: 「未確認」は、公式資料で裏が取れなかった事項です。推測を事実として書かないよう、根拠の水準を各項で分けています

## 0. 要約

- PR レビューは **削除できない記録**(提出済みレビューは API で削除不可、PR 自体も削除不可)である。ただし「残る」と「正しい」は別で、本文は編集でき、状態は dismiss で変わり、所有者の退会で ghost 化する
- レビューは `commit_id`(レビュー時点の head SHA)に紐づく。force-push や squash merge のあとも、GitHub 上ではその SHA は到達可能(`refs/pull/N/head` が残る)。ただしこれは GitHub の実装挙動で、保証として文書化されていない
- Free/Team では監査ログ API・ストリーミングが使えない。長期の証跡は、GitHub の外へ自分で複製するしかない
- GitHub の承認要件は「write 権限を持つ人の承認」を数える。Bot(GitHub App)の承認が数えられるかは公式に明記がなく、`GITHUB_TOKEN` の承認は組織設定に依存する
- 既定ブランチへ Bot が記録を固定する現実的な方式は、「GitHub App をルールセットの bypass(pull_request モードか exempt)に置き、`createCommitOnBranch` で署名付きコミットを作る」である。穴は「その App が書けるものは記録に限らない(パス単位の bypass は不可)」こと

## 1. PR レビュー(APPROVED)の永続性

### 1.1 dismiss されたレビュー

- GitHub は dismiss を「レビューの状態をレビューコメントに変える」操作として説明している。dismiss には理由コメントが必須で、PR の会話に追加される([dismissing-a-pull-request-review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/dismissing-a-pull-request-review))
- GraphQL の `PullRequestReviewState` enum は `APPROVED / CHANGES_REQUESTED / COMMENTED / DISMISSED / PENDING` を持ち、`DISMISSED` は "A review that has been dismissed" と定義されている([GraphQL Pull requests reference](https://docs.github.com/en/graphql/reference/pulls))
- タイムライン(Issue events)には `review_dismissed` イベントが残り、`dismissed_review` オブジェクトに `state`(dismiss 時点の状態: `approved` 等)、`review_id`、`dismissal_message`、`dismissal_commit_id` が入る([issue-event-types](https://docs.github.com/en/rest/using-the-rest-api/issue-event-types))
- 組織の監査ログにも `pull_request_review.dismiss` が記録される([audit-log-events-for-your-organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization))
- 結論: dismiss されたレビューは消えず、`state=DISMISSED` に変わって残り、dismiss の理由と実行者がタイムラインに残る。ただし「元の状態が APPROVED だった」ことは `review_dismissed` イベントの `dismissed_review.state` からしか読めない
- 未確認: REST `GET /pulls/{n}/reviews` が dismiss 後に `state: "DISMISSED"` を返すことの実物確認。公開リポジトリ(cli/cli、kubernetes/kubernetes、microsoft/vscode)の直近イベントに該当がなく、実機で確かめられなかった。GraphQL enum と dismiss 手順の記述からの推定

### 1.2 レビューの削除

- REST の Delete review は「提出されていないレビュー(pending)を削除する。提出済みレビューは削除できない」と明記されている([REST pulls/reviews](https://docs.github.com/en/rest/pulls/reviews))
- 監査ログの `pull_request_review.delete` は、この pending レビュー削除に対応すると考えられる(未確認)
- PR 自体を利用者が削除する手段は公式ドキュメントに存在しない。Issue の削除は admin に許可されているが、PR の削除手順はない([Deleting an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/deleting-an-issue))。PR の本文(initial comment)は削除できず編集のみ([Managing disruptive comments](https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments))
- 機密情報の除去のために PR を参照解除・削除するのは GitHub Support の作業であり、利用者の操作ではない([Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository))

### 1.3 PR を閉じた・ブランチを削除した場合

- PR の close は状態の変化であり、レビューは残る。監査ログに `pull_request.close` が記録される
- head ブランチの削除は PR が closed/merged のときだけ可能で、閉じた PR の head ブランチは復元できる([deleting-and-restoring-branches-in-a-pull-request](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request))。復元できるということは、コミットが GitHub 側に残っていることを意味する(1.5、8 節の実機確認も参照)

### 1.4 リポジトリの移管・削除・アーカイブ

- 移管: 「issues, pull requests, wiki, stars, watchers も移管される」「コミットの Git 情報は保持される」([Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository))。レビューは PR の一部として移る(明記はないが、PR が移る以上レビューも移ると読むのが自然。未確認)
- 移管でルールセット・ブランチ保護がどうなるかは、同ページに記載がない(未確認)。GitHub Enterprise Importer による製品間移行では Rulesets は「移行されない」一覧にある([About migrations between GitHub products](https://docs.github.com/en/migrations/using-github-enterprise-importer/migrating-between-github-products/about-migrations-between-github-products))。つまり移行後は保護の設定からやり直しになる
- 削除: 「一部の削除済みリポジトリは 90 日以内なら復元できる」。private を削除すると fork も全て消え、public の fork は残る([Deleting a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository))。削除後はレビュー記録も参照できなくなる
- アーカイブ: issues、PR、コメント等が読み取り専用になる([Archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories))。記録の凍結としては最も安全な状態

### 1.5 レビュー本文の編集と編集履歴

- Webhook `pull_request_review` に `edited` アクションがあり、「レビュー本文が編集された」ことを通知する。`changes` オブジェクトを伴う([Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads))
- 2019-01-10 の changelog: 「Pull request review summary comments now support reactions, edit history, quote replies, and copying URLs」([changelog](https://github.blog/changelog/2019-01-10-improvements-to-pull-request-reviews/))。レビューの要約コメント(= レビュー本文)は編集履歴を持つ
- 編集履歴は read 権限があれば誰でも見られる。ただし「コメントの作者と write 権限者」は履歴から内容を削除できる。削除しても編集者と編集時刻は残り、内容だけ消える([Tracking changes in a comment](https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment))
- 結論: 本文は書き換えられるが「書き換えた事実」は消せない。ただし「元の文面」は消せる。承認の `state` と `commit_id` は本文編集で変わらない(REST Update review は本文のみ更新)
- 未確認: 編集履歴の UI 表示がレビュー本文(summary comment)で inline comment と同じかどうか

### 1.6 ユーザーの退会・アカウント削除

- 「他のユーザーが所有するリポジトリで作成した issue・PR・コメントは削除されない。リソースとコメントは ghost ユーザーに紐づく」([Personal account management](https://docs.github.com/en/account-and-profile/concepts/account-management))
- 影響: レビューは残るが `user` が `ghost` になり、「誰が承認したか」をレビュー単体からは復元できなくなる。承認者の同定を GitHub の login に頼る記録は、退会で同定力を失う
- 対策の方向: 承認時点で `user.id`(数値)と login を外部へ写す。login は 90 日後に他人が取得できる(同ページ)ので、login 単独は識別子として弱い

## 2. レビューと commit SHA の紐づけ

- レビューの `commit_id` は「レビューが必要なコミットの SHA」で、指定しなければ PR の最新コミットになる([REST pulls/reviews](https://docs.github.com/en/rest/pulls/reviews))。`gh api repos/cli/cli/pulls/9000/reviews` の実機出力でも、各レビューに `commit_id` が入り、同一 PR 内で異なる SHA を指していた(レビュー 1 件目 `2d91040…`、3 件目 `cc36d32…`)
- `dismiss_stale_reviews_on_push`: 「新しいレビュー可能なコミットが push されると、以前の承認は dismiss される」([REST repos/rules](https://docs.github.com/en/rest/repos/rules))。差分が変われば承認は `DISMISSED` に落ちる。merge base の変化でも dismiss され得る([available-rules-for-rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets))
- `require_last_push_approval`: 「最新のレビュー可能な push を、push した本人以外が承認しなければならない」(同上)。stale を dismiss せずに「最後に push した人の自己承認」だけを塞ぐ中間策として説明されている([about-protected-branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches))
- 「reviewable push」の厳密な定義(merge base の更新や GitHub 生成のマージコミットが含まれるか)は、公式ページに明文がない(未確認)
- force-push 後の旧 SHA: 「書き換えて force-push しても、コミットは GitHub 上のキャッシュされたビューから SHA で直接到達でき、それを参照する PR からも到達できる」([Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository))。この記述は「消したいのに消えない」文脈だが、裏返せば「レビューが指す SHA は force-push 後も GitHub 上で読める」ことを意味する。ただし GC や Support の操作で消え得るので、保証ではない

## 3. 監査ログ

- 組織の監査ログは「直近 180 日のデータ」を持つ。閲覧は owner のみ([Reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization))
- Git イベント(push、clone 等)の保持は 7 日([About the audit log for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/about-the-audit-log-for-your-enterprise)、[Investigation tools](https://docs.github.com/en/enterprise-server@3.20/code-security/reference/security-incident-response/investigation-tools))
- API(REST/GraphQL)での取得は GitHub Enterprise Cloud の組織のみ。エクスポート(JSON/CSV)は UI から可能で、100 MB または 10 分の上限がある(同 Reviewing ページ)
- ストリーミング(S3、Azure Blob、Event Hubs、Datadog、GCS、Splunk、Purview)は enterprise 単位で設定し、監査イベントと Git イベントの両方を含む。保持期間は送り先次第([Streaming the audit log](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise))。プラン一覧でも「audit log streaming」は Enterprise の項目([GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans))
- 関連イベント: `pull_request_review.submit / dismiss / delete`、`pull_request.create_review_request / remove_review_request / merge / close`、`protected_branch.policy_override`(admin による保護の上書き)、`repository_ruleset.create / update / destroy`([audit-log-events-for-your-organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization))
- Free プランで取れないもの: 監査ログ API、ストリーミング、Git イベント(7 日で消え、API もない)。180 日を超える証跡は、UI エクスポートを定期的に行う運用以外にない
- 未確認: Free for organizations で監査ログ UI 自体が使えるかどうか。公式ページはプラン制限を書いておらず、プラン比較表にも記載がない
- 補足: ルールセットの変更履歴(ruleset history)は 180 日保持され、エクスポート JSON に bypass リストは含まれない([Managing rulesets for repositories in your organization](https://docs.github.com/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization))

## 4. GitHub App / Bot とルールセット

### 4.1 bypass actors

- REST の `bypass_actors.actor_type` は `Integration`(GitHub App)、`OrganizationAdmin`、`RepositoryRole`、`Team`、`DeployKey`、`User`。`bypass_mode` は `always`(既定)、`pull_request`(PR 経由でのみ bypass)、`exempt`(規則が走らず、bypass の監査記録も作られない)([REST repos/rules](https://docs.github.com/en/rest/repos/rules))
- UI 側の説明では bypass に置けるのは「Repository admins, organization owners, enterprise owners」「maintain/write ロール、write ベースのカスタムロール」「Teams(secret team を除く)」「GitHub Apps」「Dependabot」で、モードは「Always allow」と「For pull requests only」([Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository))。Deploy keys は REST にあり UI 説明にない(未確認: UI 上の表示)
- `exempt` は 2025-09-10 に追加。「信頼できる大量の自動化・移行向け」で、標準の bypass が「break glass で目立つ監査信号を出す」のに対し、exempt は「黙って enforcement をスキップする」([changelog 2025-09-10](https://github.blog/changelog/2025-09-10-github-ruleset-exemptions-and-repository-insights-updates/))
- Rule insights は「通過した操作」「失敗した操作」「bypass された操作」の時系列を持つ(上記 Managing rulesets ページ)。exempt は、ここに bypass として出ない
- `GITHUB_TOKEN`(github-actions[bot])は bypass actor に選べない。これは公式ドキュメントに明文がなく、community の報告による([Conduction issue #27](https://zff.dev/Conduction/.github/issues/27)、[community #136531](https://github.com/orgs/community/discussions/136531))。公式には「`GITHUB_TOKEN` は GitHub App installation access token」とだけ書かれている([GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token))

### 4.2 Bot の承認は required approving review に数えられるか

- 公式: 「承認は write または admin 権限を持つ人から」([Approving a PR with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews))。Copilot のレビューは「要件に数えない」と明記。GitHub App 一般については明記がない
- `GITHUB_TOKEN` の承認: 2022-01-13 に組織設定「Allow GitHub Actions reviews to count towards required approval」が追加され、既定は有効(既存ワークフローを壊さないため)。組織 admin が無効化できる([changelog 2022-01-13](https://github.blog/changelog/2022-01-13-github-actions-prevent-github-actions-from-approving-pull-requests/))
- community では「github-actions[bot] の承認は数えられず、専用 GitHub App や machine user の PAT なら数えられる」という回答がある。GitHub スタッフの回答ではなく、未解決のまま閉じられている([community #181487](https://github.com/orgs/community/discussions/181487))
- 結論: `GITHUB_TOKEN` の承認は組織設定次第、GitHub App の承認は公式に未定義で、実運用前に対象リポジトリで検証が要る(未確認)。本標準の立場では「Bot の承認を人の承認として数えない」と決めるのが安全で、数える場合は「Bot の承認は PR サイドバーで『counts toward merge requirements』側に表示されるか」で検証する
- Copilot が開いた、人に帰属しない PR には「設定した数 +1」の承認を要求する既定(public preview)がある([available-rules-for-rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets))

### 4.3 CODEOWNERS で記録の置き場の承認者を固定する

- CODEOWNERS は `.github/`、ルート、`docs/` のいずれかに置き、gitignore 風のパスパターンで所有者を割り当てる。否定(`!`)は使えない。パスは大文字小文字を区別する([About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners))
- 所有者は write 権限が必須。team の場合は team 自体に明示的な write 権限が要る
- 「Require review from Code Owners」を有効にすると、所有者のいるファイルを変更する PR はその所有者の承認を要する。複数所有者がいるときは「いずれか 1 人」で足りる
- 使われる CODEOWNERS は PR の **base ブランチ** のもの。head 側で書き換えても効かない
- 結論: `docs/gates/**` に所有者を割り当てれば、記録の変更を特定の人の承認に縛れる。穴は 3 つ。(a) 所有者の誰か 1 人で足りる、(b) bypass actor は素通りする、(c) CODEOWNERS 自体を守るには CODEOWNERS にも所有者を書く必要がある

## 5. 既定ブランチのファイルを Bot が更新する選択肢

### 5.1 GitHub App の installation token でコミットする

- GitHub App として認証し、「author/committer/署名のカスタム指定がない」API 呼び出しでコミットすると、GitHub が Bot の鍵で署名し Verified になる([About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification))
- GraphQL `createCommitOnBranch` はトークン種別によらず署名付きコミットを作る。`GITHUB_TOKEN` なら github-actions[bot]、App token なら App の署名になる(第三者資料: [DataDog commit-headless](https://github.com/DataDog/commit-headless)、[actionutils/commit-or-rewrite](https://github.com/actionutils/commit-or-rewrite)、[dev.to 記事](https://dev.to/0xdbe/github-signing-commit-in-a-workflow-98p))。ファイルモードは保持されない(全て 100644)
- ワークフロー内で App token を作るには `actions/create-github-app-token` を使い、App の private key を secret に置く(community の定型。[Conduction issue #27](https://zff.dev/Conduction/.github/issues/27))

### 5.2 `GITHUB_TOKEN` で push する

- `GITHUB_TOKEN` で起こしたイベントは、原則として新しいワークフロー実行を起こさない([GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token))。記録コミットが CI を再起動しない点は利点
- ルールセットが「PR 必須」を課す既定ブランチには、`GITHUB_TOKEN` は bypass actor に置けないため直接 push できない(4.1、community 報告)。したがって `GITHUB_TOKEN` 単独での既定ブランチ更新は、PR を開く経路に限られる

### 5.3 bypass の種類ごとの効果

- `Repository admin` / `OrganizationAdmin` を bypass に置く: 人のロールへの無条件 bypass はルールセットの意味を失わせる(第三者の検出器の警告: [Xygeni](https://detectors.xygeni.io/xydocs/misconfigurations/detectors/github_rulesets.html))。記録固定の目的には不適
- `Deploy keys` を bypass に置く: REST に `DeployKey` がある。鍵を持つ CI から直接 push できるが、deploy key のコミットは App 署名にならず、誰のコミットかが鍵の管理に依存する(署名の扱いは未確認)
- GitHub App を bypass に置く: 最も筋が良い。`pull_request` モードなら「PR を経由すれば承認なしで merge できる」、`always` なら直接 push もできる、`exempt` なら監査にも出ない。記録固定なら `pull_request` モード + 自動マージが、監査痕跡を残しつつ人の承認を省く組み合わせになる
- 注意: bypass はアクター単位で全規則に効き、パス単位には絞れない(community 報告)。App が書けるのは記録ファイルに限らない

### 5.4 merge queue

- public リポジトリ(組織所有)と Enterprise Cloud の private リポジトリで使える([Merging a PR with a merge queue](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request-with-a-merge-queue)、[changelog 2023-07-12](https://github.blog/changelog/2023-07-12-pull-request-merge-queue-is-now-generally-available/))
- 役割は「必須チェックを満たした順にマージする」ことで、承認要件を緩める仕組みではない。記録固定のコスト削減には直接寄与しない

### 5.5 署名要件との関係

- 「Require signed commits」は「contributors and bots は署名・検証済みコミットだけを push できる」。squash merge では head ブランチの未署名コミットが原因で merge がブロックされ得る([available-rules-for-rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets))
- 5.1 の API 経由コミットなら Bot の署名が付くので、署名要件と両立する

## 6. PR 承認を外部から検証可能にする仕組み

### 6.1 GitHub API の出力

- `gh api repos/{o}/{r}/pulls/{n}/reviews` は各レビューの `id`、`state`、`commit_id`、`submitted_at`、`user.login`、`body`、`author_association` を返す。cli/cli#9000 での実機出力(抜粋):
  - `{"state":"APPROVED","commit_id":"2d910406…","submitted_at":"2024-04-25T19:55:42Z","user":"steiza"}`
  - `{"state":"APPROVED","commit_id":"cc36d32a…","submitted_at":"2024-04-29T16:07:45Z","user":"williammartin"}`
- 時刻は GitHub のサーバ時刻で、利用者が改変できない。`id` は全体で一意
- これをそのまま保存しても GitHub の署名は付かない。外部保存した JSON の真正性は、保存側の仕組み(保存先の改変防止、保存時刻)に依存する

### 6.2 GitHub artifact attestations

- ビルド成果物の出所(ワークフロー、リポジトリ、組織、環境、commit SHA、トリガーイベント)を Sigstore で署名した証跡。単体で SLSA v1.0 Build Level 2、reusable workflow での隔離で Level 3([Artifact attestations concept](https://docs.github.com/en/actions/concepts/security/artifact-attestations))
- public リポジトリは Sigstore Public Good Instance(公開の透明性ログに書かれる)、private は GitHub の Sigstore インスタンス(透明性ログなし、GitHub Actions の ID のみ)。private/internal での利用は Enterprise Cloud が要る([enterprise-cloud 版](https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/security/artifact-attestations))
- 検証は `gh attestation verify PATH -R OWNER/REPO`([Using artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds))
- 用途への当てはめ: attestation の subject は成果物のダイジェストであり、「承認があった」ことを直接は証明しない。ただし「承認判定を行うワークフローが、承認レビュー JSON を subject として attest する」設計なら、「このワークフローが、この commit で、この JSON を生成した」ことは Sigstore で検証できる。承認そのものの真正性は GitHub API の応答を信用する前提に留まる
- `slsa-verifier` と `slsa-github-generator` は保守終了が宣言され、GitHub artifact attestations への移行が案内されている([slsa-verifier](https://github.com/slsa-framework/slsa-verifier))

### 6.3 SLSA Source Track(レビュー要件の規格側の扱い)

- SLSA Source Level 4 は「保護ブランチへの変更は、提出前に 2 人以上の信頼できる人が合意しなければならない(Two-party review)」「最終リビジョンに対して適用される」と定める([SLSA Source requirements (draft)](https://slsa.dev/spec/draft/source-requirements)、[v1.2-rc2](https://slsa.dev/spec/v1.2-rc2/source-requirements))
- Level 2 以上では SCS(GitHub 等)が Source Provenance attestation を発行し、「誰が・いつ名前付き参照を変えたか」を記録する。Source Provenance の形式は SCS 任せで、GitHub がこれを発行しているかは未確認
- 本標準への示唆: 「承認が最終リビジョンに対するものであること」(= `commit_id` が merge 時の head と一致すること)は、規格側でも要件とされている

### 6.4 sigstore gitsign とコミット署名

- gitsign は OIDC の ID(GitHub ログイン等)で鍵なし署名し、Rekor 透明性ログに記録する。GitHub は現時点で gitsign 署名を Verified と認識しない([sigstore/gitsign](https://github.com/sigstore/gitsign))
- 通常の GPG/SSH 署名は「Verified」バッジになる。vigilant mode を有効にすると、未署名コミットは「Unverified」と明示される([About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification))
- コミット署名は「誰がコミットを作ったか」の証跡であり、「誰が承認したか」の証跡ではない。承認者が自ら署名するのは、記録ファイルを承認者本人が署名コミットする方式(7 節の案 C)でのみ成立する

### 6.5 既存ツールの承認記録方式

- Kubernetes prow `approve` プラグイン: OWNERS ファイルを単位に `/approve` で承認し、全ファイルが承認されると `approved` ラベルが付く。Bot が「This pull-request has been approved by: …」のコメントで承認者一覧を更新する。`lgtm` は新コミットで自動取り消しされる([Reviewers and Approvers](https://docs.prow.k8s.io/docs/components/plugins/approve/approvers/)、[k8s.dev OWNERS](https://www.k8s.dev/docs/guide/owners/))。`approved` が新コミットで取り消されるかは未確認
- Gerrit: Code-Review +2 が「Looks good to me, approved」。投票は新しい patch set へ copy condition に従って引き継がれ、引き継がれない投票は outdated になる([config-labels](https://gerrit-review.googlesource.com/Documentation/config-labels.html))。`change.addChangeReviewFootersToCommitMessage`(既定 true)により、`REBASE_ALWAYS`/`CHERRY_PICK` の submit で `Reviewed-by`、`Tested-by` 等がコミットメッセージの footer に書かれる([config-gerrit](https://gerrit-review.googlesource.com/Documentation/config-gerrit.html))。承認がコミット本体に焼き込まれるので、Gerrit が消えても承認の記録はクローンに残る
- Linux kernel: `Signed-off-by` は DCO への証明、`Reviewed-by` は「技術的なレビューを行い、適切性と準備状態を評価した」という意見表明、`Acked-by` はより非公式な受理の記録([submitting-patches](https://www.kernel.org/doc/html/latest/process/submitting-patches.html))。全て commit trailer で、ホスティングに依存しない
- Chromium: Gerrit の Code-Review +1 が LGTM。OWNERS の各ディレクトリから 1 人の承認が要る。clean revert / cherry-pick は Rubber Stamper Bot が `Bot-Commit +1` を入れて人のレビューなしで submit できるが、OWNERS 承認は代替しない([code_reviews.md](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md))
- 共通点: 承認を「ホスティングサービスの状態」ではなく「コミットメッセージの trailer」か「Bot が集計して書き戻すコメント/ラベル」に写している。GitHub の squash merge で `Co-authored-by` 以外の trailer が自動で付くことはなく、`Reviewed-by` を付けるなら自前の Bot かマージ前の手作業になる

## 7. rubber stamp(中身を見ない承認)の検出

- GitHub にレビュー本文を必須にする設定は見つからなかった。REST では `body` が必須になるのは `REQUEST_CHANGES` と `COMMENT` のときで、`APPROVE` では省略できる([REST pulls/reviews](https://docs.github.com/en/rest/pulls/reviews))。UI でも「要約コメントを書く」は手順として示されるだけで強制ではない(未確認: UI 上で空の approve がブロックされないことの実機確認)
- 計測できる値:
  - `review_requested` イベントの `created_at` から、レビューの `submitted_at` までの時間(タイムライン API)
  - レビューに紐づく review comment の数(`GET /pulls/{n}/reviews/{id}/comments`)
  - 差分の大きさ(PR の `additions`、`deletions`、`changed_files`)に対する上記の比
  - `commit_id` が最終 head と一致するか(最終リビジョンへの承認か)
- 第三者の経験則: 「PR が開いて数分以内の承認」「中身のない LGTM の繰り返し」を警告サインとする([minware](https://www.minware.com/guide/anti-patterns/rubber-stamp-reviews)、[SSW](https://www.ssw.com.au/rules/rubber-stamp-prs))。Waydev は「rubber-stamped PR 率 10% 未満を健全、25% 超を崩壊」とする閾値を置くが、実証に基づく値ではなく製品の目安([Waydev](https://docs.waydev.co/docs/rubber-stamped-prs))
- 査読済み研究で「rubber stamp の検出指標」を定義したものは、この調査では見つからなかった(未確認)。時間だけの閾値は、自明な変更を誤検出する
- 結論: GitHub 単体では rubber stamp を止められない。できるのは「時間・コメント数・差分量・最終リビジョン一致」を Bot が計算して記録に添え、閾値を下回るものを人が抜き取り検査する運用までである

## 8. Linear history / squash merge と、承認が参照する SHA

- squash merge は「PR の全コミットを base 上の 1 コミットにまとめる」、rebase merge は「committer 情報を常に更新し、新しい SHA を作る」([About pull request merges](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges))。いずれも base ブランチ上には、レビューが指した `commit_id` は残らない
- 実機確認(cli/cli#9000、squash merge、head ブランチ削除済み):
  - `GET /repos/cli/cli/commits/cc36d32a…` → 200。レビューが指した head SHA は、ブランチ削除後も SHA 指定で読める
  - `git ls-remote https://github.com/cli/cli.git 'refs/pull/9000/*'` → `cc36d32a… refs/pull/9000/head`。`refs/pull/N/head` が残り、クローンからも fetch できる
  - `GET /repos/cli/cli/branches/andyfeller/flag-level-disableauth` → 404(ブランチは消えている)
- PR 番号から到達する経路: PR → `head.sha`(API)または `refs/pull/N/head`(git)→ コミット。`merge_commit_sha` は squash 後の base 上のコミットを指す。承認した SHA と merge 後の SHA の対応は、PR 番号を介してしか辿れない
- 保証の有無: `refs/pull/N/head` の保持は公式ドキュメントに明文がない(未確認)。機密除去の文脈で「PR が参照するコミットは到達可能」と書かれていること、Support の作業として「PR の参照解除」があることから、残るのが既定の挙動と読める。GitLab では MR 削除後に ref が残る/消えるの揺れが報告されており([GitLab issue 577259](https://gitlab.com/gitlab-org/gitlab/-/issues/577259))、他のホスティングでは同じ前提を置けない
- rebase merge では GitHub が新しい SHA を作るため、「署名済みコミットが rebase で署名を失う」問題もある(公式ページは署名の扱いを書いていない。未確認)

## 9. 結論

### 9.1 承認イベントを「ゲート判定の記録」として認めるための前提条件

- 記録に含める最小の組: レビュー `id`、`state`、`commit_id`、`submitted_at`、`user.id`(数値)と `user.login`、PR 番号、merge 時の `merge_commit_sha`。login だけでは退会・再取得で同定力を失う
- 承認が **最終リビジョン** を指すこと: `commit_id == PR head SHA at merge` を検証し、`dismiss_stale_reviews_on_push` と `require_last_push_approval` の両方を有効にする。SLSA Source L4 も「最終リビジョンへの合意」を要件とする
- 承認者が人であり、write 権限を持つこと: Bot・Copilot・`GITHUB_TOKEN` の承認は数に入れない。GitHub App の承認が数えられるかは未定義なので、設計に組み込まない
- bypass の経路が閉じていること: 承認を省ける actor(admin、bypass actor、exempt)が存在する限り、「承認があった」は「承認なしで merge されなかった」を意味しない。`protected_branch.policy_override` と Rule insights の bypass 履歴を併せて読む必要がある。exempt は Rule insights に出ない
- 記録が GitHub の外にも存在すること: 監査ログは 180 日(Git イベント 7 日)、API/ストリーミングは Enterprise 限定。レビュー JSON の外部保存を、承認と同じ時間帯に自動で行う
- 記録の保存先が、承認した人以外にも書き換えられないこと: 保存先ファイルを CODEOWNERS で縛り、保存先への書き込みは Bot のみとする。ただし Bot の bypass はパス単位に絞れない(9.3)

### 9.2 消える・改変できるケース一覧

| ケース | 起きること | 記録への影響 | 検知手段 |
|---|---|---|---|
| dismiss | `state` が `DISMISSED` に変わる | 承認は無効になるが行は残る | `review_dismissed` イベント、監査ログ `pull_request_review.dismiss` |
| 本文の編集 | `body` が変わる。編集履歴が付く | 承認の `state`/`commit_id` は不変 | Webhook `edited`、編集履歴(内容は作者/write 権限者が消せる) |
| 新コミットの push | stale 承認が dismiss される(設定時) | 旧承認は `DISMISSED` で残る | `commit_id` と head SHA の不一致 |
| force-push | head が書き換わる | 旧 SHA は GitHub 上で到達可能(保証なし) | `head_ref_force_pushed` イベント |
| PR close / head ブランチ削除 | ブランチが消える | `refs/pull/N/head` は残る(実機確認、保証なし) | `head_ref_deleted` |
| squash / rebase merge | base 上に承認した SHA が残らない | PR 番号経由でのみ対応づく | `merge_commit_sha` と PR 番号を併記 |
| 承認者の退会 | `user` が `ghost` になる | 承認者の同定不能 | `user.id` を事前に外部保存 |
| リポジトリ移管 | PR・レビューは移る。ルールセットの扱いは未確認 | 保護が外れる期間が生じ得る | 移管後の `repository_ruleset.*` 監査 |
| リポジトリ削除 | 90 日以内は復元の可能性 | 復元できなければ全損 | 外部複製の有無 |
| 監査ログの期限 | 180 日(Git イベント 7 日)で消える | bypass・override の証跡が消える | ストリーミング(Enterprise)または定期エクスポート |
| admin の bypass / policy_override | 承認なしで merge | 「承認あり」と「承認不要だった」が区別できない | 監査ログ `protected_branch.policy_override`、Rule insights |
| exempt actor | 規則が走らず監査にも出ない | 検知不能 | ルールセット設定の定期点検 |
| GitHub Support による除去 | PR の参照解除・キャッシュ削除・GC | 旧 SHA へ到達不能になる | 外部複製の有無 |

### 9.3 Bot による既定ブランチへの記録固定: 現実的な方式(複数案と穴)

- 案 A: GitHub App を bypass(`pull_request` モード)に置き、App token で記録ファイルの PR を作り、App 自身が auto-merge する
  - 仕組み: `actions/create-github-app-token` で installation token を取得 → `createCommitOnBranch` で署名付きコミット → PR 作成 → App が merge(bypass により承認不要)
  - 利点: コミットは Verified(App 署名)。bypass は Rule insights と監査ログに残る。人の承認要件は人の PR に対して維持される。merge queue と併用できる
  - 穴: bypass はパス単位に絞れないので、App token が漏れれば既定ブランチの任意ファイルを書ける。App の private key の保護が記録の信頼性の上限になる。`pull_request` モードでも「PR を作れば何でも通る」ことに変わりはない
- 案 B: 案 A の bypass を `exempt` にする
  - 利点: 大量の記録コミットで Rule insights が埋まらない。設定が単純
  - 穴: 監査痕跡が消える。記録の固定に使う actor が「監査に出ない」のは目的と矛盾する。採らないのが妥当
- 案 C: Bot は PR を開くだけにし、記録ファイルの CODEOWNERS を判定者に割り当て、判定者本人が承認・merge する
  - 利点: bypass が不要。記録の確定が人の署名(承認レビュー + Verified な merge)で裏付く。CODEOWNERS により記録の置き場の承認者が固定される
  - 穴: 判定ごとに PR が 1 本増え、判定者の作業が 2 度(ゲート判定 + 記録 PR の承認)になる。CODEOWNERS は「所有者の誰か 1 人」で足りる。承認の遅延で記録と判定の時刻がずれる
- 案 D: 記録を既定ブランチのファイルではなく、専用ブランチ(例: `gate-records`)か別リポジトリに置き、そこだけ App を `always` bypass にする
  - 利点: 既定ブランチの保護に穴を開けない。記録リポジトリをアーカイブすれば読み取り専用で凍結できる
  - 穴: 「記録はコードと同じ履歴にある」という性質を失う。記録リポジトリの削除・移管は別の管理になる。参照は PR 番号 + SHA で結ぶしかない
- 案 E: 記録を Git に書かず、承認レビュー JSON を artifact attestation の subject として attest し、GitHub の attestation API に保存する
  - 利点: 「どのワークフローが、どの commit で、この JSON を作った」が Sigstore で検証できる。public なら透明性ログに残る
  - 穴: private は Enterprise Cloud が要り、透明性ログもない。attestation は削除できる(ライフサイクル管理の対象)。JSON の内容が GitHub API の応答どおりかは attestation では証明されない
- 全案に共通する穴: 「承認があった」の真正性は GitHub の API 応答の信用に依存する。GitHub の外に出した時点で GitHub の署名はなく、以後の改変防止は保存側の責任になる。これを超えるには、承認者本人が記録へ署名コミットする(案 C の変形)しかない
- 推奨の組み合わせ(調査者の意見、実証なし): 案 A を基本とし、記録ファイルを CODEOWNERS で判定者に割り当て、App の bypass を `pull_request` モードに限定し、Rule insights の bypass 履歴を定期的にエクスポートする。exempt は使わない。Enterprise でないならレビュー JSON の外部複製を同じワークフローで行う

## 10. 未確認事項の一覧

- REST が dismiss 後に `state: "DISMISSED"` を返すことの実物確認(GraphQL enum からの推定)
- `refs/pull/N/head` の保持が GitHub の保証であるか(実機では残っていたが、文書上の保証はない)
- GitHub App の承認レビューが required approving review に数えられるか(community の肯定回答のみ。スタッフ回答なし)
- `GITHUB_TOKEN` が bypass actor に置けないことの公式記述(community 報告のみ)
- UI 上で deploy key を bypass actor として選べるか(REST には `DeployKey` がある)
- 「reviewable push」の厳密な定義
- Free for organizations で監査ログ UI が使えるか
- リポジトリ移管でルールセットが引き継がれるか
- rebase merge で GitHub が付け直す署名の有無
- 空の本文で APPROVE が UI でブロックされないことの実機確認
- `pull_request_review.delete` 監査イベントが pending レビューの削除に対応するか
- prow の `approved` ラベルが新コミットで取り消されるか

## 出典

- GitHub Docs: [REST pulls/reviews](https://docs.github.com/en/rest/pulls/reviews)、[Dismissing a PR review](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/dismissing-a-pull-request-review)、[GraphQL Pull requests](https://docs.github.com/en/graphql/reference/pulls)、[Issue event types](https://docs.github.com/en/rest/using-the-rest-api/issue-event-types)、[Timeline events](https://docs.github.com/en/rest/issues/timeline)、[Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads)、[Tracking changes in a comment](https://docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment)、[Managing disruptive comments](https://docs.github.com/en/communities/moderating-comments-and-conversations/managing-disruptive-comments)、[Personal account management](https://docs.github.com/en/account-and-profile/concepts/account-management)、[Personal account reference](https://docs.github.com/en/account-and-profile/reference/personal-account-reference)、[Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)、[Deleting a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository)、[Archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories)、[About migrations between GitHub products](https://docs.github.com/en/migrations/using-github-enterprise-importer/migrating-between-github-products/about-migrations-between-github-products)、[Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)、[About pull request merges](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges)、[Deleting and restoring branches in a PR](https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request)
- GitHub Docs(ルールセット・保護): [Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)、[Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)、[About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)、[Managing rulesets for repositories in your organization](https://docs.github.com/enterprise-cloud@latest/organizations/managing-organization-settings/managing-rulesets-for-repositories-in-your-organization)、[REST repos/rules](https://docs.github.com/en/rest/repos/rules)、[About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)、[About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)、[Approving a PR with required reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews)、[Merging a PR with a merge queue](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request-with-a-merge-queue)
- GitHub Docs(監査・署名・証跡): [Reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)、[Audit log events for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/audit-log-events-for-your-organization)、[About the audit log for your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/about-the-audit-log-for-your-enterprise)、[Streaming the audit log](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise)、[Investigation tools](https://docs.github.com/en/enterprise-server@3.20/code-security/reference/security-incident-response/investigation-tools)、[GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)、[About commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)、[GITHUB_TOKEN concept](https://docs.github.com/en/actions/concepts/security/github_token)、[Artifact attestations concept](https://docs.github.com/en/actions/concepts/security/artifact-attestations)、[Artifact attestations (Enterprise Cloud)](https://docs.github.com/en/enterprise-cloud@latest/actions/concepts/security/artifact-attestations)、[Using artifact attestations](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds)
- GitHub changelog: [2022-01-13 Prevent GitHub Actions from approving PRs](https://github.blog/changelog/2022-01-13-github-actions-prevent-github-actions-from-approving-pull-requests/)、[2025-09-10 Ruleset exemptions](https://github.blog/changelog/2025-09-10-github-ruleset-exemptions-and-repository-insights-updates/)、[2023-07-12 Merge queue GA](https://github.blog/changelog/2023-07-12-pull-request-merge-queue-is-now-generally-available/)、[2019-01-10 Improvements to PR reviews](https://github.blog/changelog/2019-01-10-improvements-to-pull-request-reviews/)
- community・第三者(公式でない): [community #181487](https://github.com/orgs/community/discussions/181487)、[community #167357](https://github.com/orgs/community/discussions/167357)、[community #136531](https://github.com/orgs/community/discussions/136531)、[Conduction issue #27](https://zff.dev/Conduction/.github/issues/27)、[Xygeni ruleset detector](https://detectors.xygeni.io/xydocs/misconfigurations/detectors/github_rulesets.html)、[DataDog commit-headless](https://github.com/DataDog/commit-headless)、[actionutils/commit-or-rewrite](https://github.com/actionutils/commit-or-rewrite)、[dev.to: Signing commit in a workflow](https://dev.to/0xdbe/github-signing-commit-in-a-workflow-98p)、[minware: Rubber-Stamp Reviews](https://www.minware.com/guide/anti-patterns/rubber-stamp-reviews)、[SSW: rubber stamp PRs](https://www.ssw.com.au/rules/rubber-stamp-prs)、[Waydev: Rubber-Stamped PRs](https://docs.waydev.co/docs/rubber-stamped-prs)、[GitLab issue 577259](https://gitlab.com/gitlab-org/gitlab/-/issues/577259)
- 他の規格・ツール: [SLSA Source requirements (draft)](https://slsa.dev/spec/draft/source-requirements)、[SLSA Source requirements v1.2-rc2](https://slsa.dev/spec/v1.2-rc2/source-requirements)、[SLSA Verifying source](https://slsa.dev/spec/draft/verifying-source)、[slsa-verifier](https://github.com/slsa-framework/slsa-verifier)、[sigstore/gitsign](https://github.com/sigstore/gitsign)、[prow Reviewers and Approvers](https://docs.prow.k8s.io/docs/components/plugins/approve/approvers/)、[k8s.dev OWNERS](https://www.k8s.dev/docs/guide/owners/)、[Gerrit config-labels](https://gerrit-review.googlesource.com/Documentation/config-labels.html)、[Gerrit config-gerrit](https://gerrit-review.googlesource.com/Documentation/config-gerrit.html)、[Linux submitting-patches](https://www.kernel.org/doc/html/latest/process/submitting-patches.html)、[Chromium code_reviews.md](https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md)
- 実機確認(2026-10-23): `gh api repos/cli/cli/pulls/9000/reviews`、`gh api repos/cli/cli/commits/cc36d32a212a2b8b6611fb73549fe6d04fb6ec38`、`git ls-remote https://github.com/cli/cli.git 'refs/pull/9000/*'`、`gh api repos/cli/cli/branches/andyfeller/flag-level-disableauth`(404)
