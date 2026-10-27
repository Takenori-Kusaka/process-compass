# #346 外部調査: ジョブの権限で発行される短命のトークンと、配備の統制

- 調査日: 2026-10-27
- 担当: 外部調査(サブエージェント)。リポジトリは編集していない(本メモの新規作成のみ)
- 範囲: GitHub Actions の GITHUB_TOKEN と配備の統制、業界の指針、規格
- 読み方: 「事実」は一次資料の記述。「推論」は記述からの導出で、一次資料が直接は述べていない。読めなかった資料は「読めていない」と書く

## 0. 結論の先取り(推論を含む)

1. **GITHUB_TOKEN の書き込み権限は、参照(ブランチ・タグ)に結び付かない**。権限はリポジトリ等の既定を出発点に、ワークフローのファイルの `permissions` で増減する。ファイルは起動元のブランチのものが使われるため、リポジトリへの書き込み権限を持つ者(人・AI エージェント)は、任意のブランチで `contents: write` を持つジョブを書いて走らせられる(事実 1.1〜1.3、GitHub 社員の発言 1.6)
2. **Environment は GITHUB_TOKEN の権限を限らない**。Environment が参照で限るのは「その Environment を参照するジョブ」の実行・秘密情報・変数・OIDC の `sub` クレームであり、`environment:` を書かないジョブには何も効かない(事実 1.4。GitHub の文書は GITHUB_TOKEN との関係に触れていない = 限るという記述が無い)
3. 参照に結び付いた資格情報を GitHub の標準機能だけで作る経路は、(a) **Environment の秘密情報**(長期の鍵か App の秘密鍵を置くことになる。所有者の指示で不採用)、(b) **OIDC の `sub` クレームを検証する受け手**(受け手側が検証する場合に限る。GitHub Pages の配備は GitHub 自身がこれを行う)の2つ。GITHUB_TOKEN で同一リポジトリのブランチへ push する形には、(b) の受け手が存在しない
4. 書き込み先のブランチをルールセットの「Restrict updates」で守ると、GITHUB_TOKEN(github-actions)をバイパス主体に加える公式の手段は確認できなかった。加えられたとしても、GitHub 社員の言う通り「Actions のユーザーはブランチ固有ではない」ため、どのブランチのワークフローにもバイパスが及ぶ(事実 1.6)
5. 業界の指針(OWASP CICD-SEC-4/1/5/6、SLSA Source、CISA/NSA、GitHub の Secure use)は、**短命の資格情報を優先**しつつ、**未レビューのコードを走らせるパイプラインに資格情報を渡さない**ことと、**パイプラインの定義の変更をレビューの後にだけ走らせる/別の保護されたブランチへ置く**ことを、別々の要求として並べる。短命であることは後者の代わりにならない

## 1. GitHub Actions の GITHUB_TOKEN

### 1.1 発行と有効期間(事実)

- 出典: GitHub Docs「GITHUB_TOKEN」(概念) https://docs.github.com/en/actions/concepts/security/github_token (GitHub, 2026 版、閲覧 2026-10-27)
  - 「The `GITHUB_TOKEN` secret is a GitHub App installation access token」。Actions を有効にすると GitHub App がリポジトリへ導入される
  - ジョブの開始前にジョブごとに新しく発行される。ジョブの終了時、または実効の最大寿命で失効。GitHub ホストのランナーではジョブの上限 6 時間に従い最大 6 時間。セルフホストではリフレッシュの上限 24 時間
  - 権限は「limited to the repository that contains your workflow」
  - GITHUB_TOKEN による操作が起こすイベントは原則として新しいワークフローを起動しない(例外 `workflow_dispatch`・`repository_dispatch`)。GITHUB_TOKEN で作成・更新した PR の `pull_request` 実行は承認待ちになる

### 1.2 権限の決まり方(事実)

- 出典: GitHub Docs「Workflow syntax for GitHub Actions」`permissions` https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (閲覧 2026-10-27)
  - 「The permissions for the GITHUB_TOKEN are initially set to the default setting for the enterprise, organization, or repository」「The permissions are then adjusted based on any configuration within the workflow file」
  - 一つでも指定すると、指定しなかった権限は `none`
  - ワークフロー全体(トップレベル)にもジョブ単位にも書ける
  - fork からの PR: 書き込みは読み取りへ落とされる(「typically you can't grant write access」)。管理者が write トークンを送る設定をした場合を除く
  - `pull_request_target`: fork からでも read/write の権限が付く
  - Dependabot の実行は fork と同じ扱いで秘密情報に触れない
  - `id-token: write` は OIDC トークンの取得に要る
- 出典: GitHub Docs「Managing GitHub Actions settings for a repository」 https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository (閲覧 2026-10-27)
  - 「Workflow permissions」: permissive(全権限 read/write)か restricted(`contents` と `packages` の read)を**既定**として選ぶ
  - 書き込み権限を持つ者は「by editing the `permissions` key in the workflow file」で権限を足し引きできる、と記述
  - 組織が restricted を選ぶと、リポジトリでは permissive を選べない
  - 「Allow GitHub Actions to create and approve pull requests」は別の設定
  - private リポジトリの fork PR 向けに「Send write tokens to workflows from pull requests」「Send secrets…」がある
- 出典: GitHub Changelog 2023-02-02「Updating the default GITHUB_TOKEN permissions to read-only」 https://github.blog/changelog/2023-02-02-github-actions-updating-the-default-github_token-permissions-to-read-only/
  - 新規の enterprise・組織・個人所有のリポジトリは既定 read-only。既存は変わらない
- **推論**: 文書は「既定(default)」と「ワークフローで調整」と書き、既定を上限とする記述は無い。本リポジトリの ci.yml の publish ジョブ(`permissions: contents: write`)が実際に書き込めていることと合わせ、**リポジトリ/組織の「Workflow permissions」は上限ではなく出発点**であり、ブランチ上のワークフローからの昇格を止めない。組織レベルの restricted も「permissive を選べない」とあるだけで、`permissions` キーでの昇格を禁ずるとの記述は見つからなかった(未確認として扱う)

### 1.3 起動元のブランチのファイルが使われる(事実と推論)

- `push` 等のイベントでは、イベントの参照(push されたブランチ)にあるワークフローのファイルが実行される(GitHub Docs の Events の記述。今回の調査では該当頁を本文まで読んでいない。一般に知られた挙動として扱う)
- 2025-12-08 以降、`pull_request_target` は常に既定ブランチのワークフローのファイルと参照を使う(GitHub Changelog 2025-11-07 https://github.blog/changelog/2025-11-07-actions-pull_request_target-and-environment-branch-protections-changes/ )
- **推論**: したがって「書き込み権限を持つ者がブランチへ push する」= 「そのブランチのワークフローのファイルで宣言した権限の GITHUB_TOKEN を得る」。ジョブの `if:` やステップ内の起動元の確認も、同じファイルの中にあるため外せる(ci.yml の注記が既に認めている通り)

### 1.4 Environment(配備の環境)と GITHUB_TOKEN(事実)

- 出典: GitHub Docs「Deployments and environments」 https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments (閲覧 2026-10-27)
  - 保護規則: required reviewers(最大6の利用者・チーム、1人の承認で進む、自己承認の防止を選べる)、wait timer(1〜43,200 分)、カスタム規則。1環境につき保護規則は最大6
  - 配備のブランチとタグ: 制限なし / 保護されたブランチのみ(保護規則が1つも無ければ全ブランチ可) / 選んだブランチとタグ
  - 「Secrets stored in an environment are only available to workflow jobs that reference the environment」。承認が要る場合は承認までジョブが環境の秘密情報に触れない
  - 既定では管理者は保護規則をバイパスできる。バイパスを禁じる設定がある
  - Free/Pro/Team では required reviewers・wait timer・管理者バイパスの設定は public リポジトリに限る。Free の環境の秘密情報も public に限る
  - **GITHUB_TOKEN の権限を Environment が限るという記述は無い**
- 出典: Workflow syntax `jobs.<job_id>.environment`: 「All deployment protection rules must pass before a job referencing the environment is sent to a runner」
- 2025-12-08 以降、PR 系イベントでの環境のブランチ規則は実行の参照(`refs/pull/N/merge`)で評価する(上記 Changelog 2025-11-07)
- **推論**: Environment が参照で限るのは「`environment:` を書いたジョブ」だけ。ブランチ上で `environment:` を削った同じジョブは、Environment の規則を一切通らずに `permissions` 由来の `contents: write` を得る。**`environment` を参照するジョブだけが得るもの**は、環境の秘密情報・環境の変数・OIDC の `sub` に入る環境名・配備の記録(deployment)であり、GITHUB_TOKEN の権限ではない
- 本リポジトリの publish ジョブは `environment: dist-standard` を参照しているが、上記により書き込み権限の経路は止めていない(リポジトリの調査は担当外。ci.yml の 123〜146 行を確認しただけ)

### 1.5 ルールセットとブランチ保護(事実)

- 出典: GitHub Docs「Available rules for rulesets」 https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets と Enterprise Cloud 版 https://docs.github.com/en/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets (閲覧 2026-10-27)
  - Restrict creations / updates / deletions: バイパス権限を持つ者だけがパターンに合うブランチ・タグを作成・push・削除できる
  - バイパス主体: 「users with certain roles, specific teams, or GitHub Apps」。github-actions(GITHUB_TOKEN)を指定できるとの記述は無い
  - 「Require workflows to pass before merging」: 組織・enterprise のルールセットで設定。ソースのリポジトリとワークフローを組織側で指定。`pull_request`・`pull_request_target`・`merge_group` で走る。直接の push を塞ぐため全ブランチには掛けるなと注意。**これはマージの関門であり、ブランチ上の別のワークフローが書き込み権限を得ることは止めない**(推論)
  - 「Restrict file paths」(push ルールセット): 指定パスを含むコミットの push を拒む。Enterprise Cloud の internal/private リポジトリに限る。`.github/workflows/**` を指定すれば書き込み者によるワークフローの変更の push 自体を止められる(推論。ただし本リポジトリは public で、この規則は使えない)
  - 「Require deployments to succeed before merging」: マージ前に指定環境への配備の成功を要求
- 出典: SLSA Source Requirements v1.2 は保護対象の参照の例として GitHub rulesets を挙げる(2.2 参照)

### 1.6 GITHUB_TOKEN と保護されたブランチへの push(実務・GitHub 社員の発言)

- 出典: GitHub Community Discussion #25305 https://github.com/orgs/community/discussions/25305 (2019〜2026、閲覧 2026-10-27)
  - GitHub 社員(chrispat)2019-10-11: Actions に保護されたブランチへの push を許すと「any collaborator in your repo could push any code to any branch they wanted」
  - 同 2022-01-06: **Actions のユーザーはブランチ固有ではない**ため、バイパスを許すとどのブランチのワークフローからもバイパスできる。Actions のユーザーを必須レビュー者に数えないようにしている
  - 利用者の報告: GitHub App のトークンや deploy key をルールセットのバイパスへ加える回避が使われている(deploy key はバイパスへ加えられる、2024-08 の報告)。2026 時点でも公式の GITHUB_TOKEN バイパスは無いとの声
- **推論**: 書き込み先のブランチを「Actions だけが push できる」形に閉じる手段は GITHUB_TOKEN では存在せず、ブランチ固有でない主体へ広げるか、参照に結び付く別の資格情報(Environment の秘密情報に置く App の鍵・deploy key)へ移るかの二択になる。所有者が述べた「ルールセット緩和でいくしかない」はこの構造の帰結と整合する

### 1.7 新機能: ワークフロー実行の保護(Workflow execution protections)

- 出典: GitHub Changelog 2026-06-18(public preview) https://github.blog/changelog/2026-06-18-control-who-and-what-triggers-github-actions-workflows/ 、2026-09-17(GA) https://github.blog/changelog/2026-09-17-workflow-execution-protections-in-github-actions-generally-available/
  - ルールセットの枠組みで「誰が(actors: 利用者・リポジトリのロール・GitHub App・Copilot・Dependabot)」「どのイベントで(push・pull_request・pull_request_target・workflow_dispatch 等)」ワークフローを起動できるかを許可リストで決める。enterprise・組織・リポジトリで設定。ワークフローのファイルを対象に絞れる。評価モードあり
  - **ブランチ・参照の条件、トークンの権限の制限は記述に無い**。public リポジトリでは 2026-12-02 から `pull_request_target` を既定で無効化する規則を適用予定
  - **推論**: 「AI エージェントの主体(GitHub App や Copilot)による起動を止める」用途には効き得る。ただしブランチで新しいファイル名のワークフローを作ればファイル単位の対象から外れるかは文書から読めない。参照で書き込みを限る手段にはならない
- 出典: GitHub Blog「What's coming to our GitHub Actions 2026 security roadmap」(2026-03-26) https://github.blog/news-insights/product-news/whats-coming-to-our-github-actions-2026-security-roadmap/
  - 予定: 秘密情報をブランチ・環境・ワークフローの識別・パスへ限る(scoped secrets)、書き込み権限から秘密情報の管理権限を分離、依存の SHA 固定(`dependencies:`)。**GITHUB_TOKEN の参照への束縛は予定に挙がっていない**。scoped secrets の提供状況は 2026-10-27 時点で確認できていない

### 1.8 比較: GITHUB_TOKEN・GitHub App のトークン・OIDC・長期の鍵

| 方式 | 寿命 | 長期の秘密 | 参照への束縛 | ブランチ上の書き換えで得られるか |
| --- | --- | --- | --- | --- |
| GITHUB_TOKEN(`permissions`) | ジョブ終了まで(GitHub ホストで最大6時間) | 無し | **無し** | 得られる(ファイルの `permissions` を書けば) |
| GitHub App のインストールトークン(`actions/create-github-app-token`) | 1時間。既定で post で失効 | App の秘密鍵(Environment の秘密情報に置けば参照で限れる) | 鍵の置き場で決まる | 鍵を Environment に置き、配備のブランチを限れば得られない |
| deploy key / PAT | 長期 | 鍵そのもの | 置き場で決まる | 同上 |
| OIDC(`id-token: write`) | 短命の JWT。受け手が短命の資格情報を発行 | 無し | `sub` に `environment:名` または `ref:refs/heads/…`。**受け手が検証すれば**束縛できる | 受け手の信頼条件が環境・参照で絞られていれば得られない |

- 出典: actions/create-github-app-token README https://github.com/actions/create-github-app-token (秘密鍵が必須、トークンは1時間で失効、リポジトリ・権限で絞れる)
- 出典: GitHub Docs「OpenID Connect reference」 https://docs.github.com/en/actions/reference/security/oidc (`sub` の書式。環境を参照すると `repo:ORG/REPO:environment:NAME`。`id-token: write` は「does not grant write access to other resources」。`job_workflow_ref` で再利用ワークフローを要求できる)
- 出典: actions/deploy-pages README https://github.com/actions/deploy-pages — GitHub Pages の配備 API は OIDC トークンの参照のクレームを検証し、`github-pages` 環境が保護されていれば環境の保護規則が優先、と記述。**GitHub 自身が OIDC + Environment で参照に束縛している先例**(本リポジトリの deploy ジョブはこの経路)
- **推論**: GITHUB_TOKEN で同一リポジトリへ `git push` する経路には、OIDC のクレームを検証する受け手が無い。GitHub に「OIDC で認証して特定ブランチへ push する」公式の受け手は見つからなかった

## 2. 業界の指針

### 2.1 OWASP Top 10 CI/CD Security Risks

- 出典: https://owasp.org/www-project-top-10-ci-cd-security-risks/ (詳細頁は owasp.github.io へ転送。日付の表示無し、© 2026)。CICD-SEC-1〜10: 不十分なフローの統制 / 不十分な ID とアクセス管理 / 依存の連鎖の悪用 / PPE / 不十分な PBAC / 不十分な資格情報の衛生 / 安全でない構成 / 統制されない第三者サービス / 成果物の完全性の検証の不備 / 不十分なログと可視性
- CICD-SEC-4 PPE: 「source control へのアクセスを持ち、ビルド環境へのアクセスを持たない攻撃者」が悪性コードをパイプラインで実行する。Direct PPE は保護されていないブランチへの push または PR で CI 設定を直接書き換える。実行は「the same abilities and level of access as the build job」。推奨: 未レビューのコードを走らせるパイプラインは秘密情報から隔離したノードで / 機微なパイプラインを起動するブランチに保護規則 / **CI 設定の変更は走らせる前にレビューするか、別の保護されたブランチに置く** / パイプラインごとに必要最小の資格情報
- CICD-SEC-1: 推奨に「未レビューのコードを push できるアカウントは、そのリポジトリにつながる配備のパイプラインを起動する権限を持たない」「追加の承認なしに本番のビルド・配備を起動させない」
- CICD-SEC-5 PBAC: 「each pipeline and step to have access to only the secrets it requires」、機微度の異なるパイプラインでノードを共有しない
- CICD-SEC-6: 「Prefer using temporary credentials over static credentials」、送信元 IP や ID への範囲限定、最小権限、静的な資格情報の定期ローテーション。OIDC や保護ブランチへの限定は明記されていない
- **推論**: OWASP は「短命」(SEC-6)と「未レビューのコードに資格情報を渡さない」(SEC-4・SEC-1・SEC-5)を別の要求として立てる。GITHUB_TOKEN の `contents: write` は前者を満たし、後者を満たさない。CICD-SEC-1 の推奨は、本リポジトリの「ブランチへ push できる者 = 配布を起動できる者」の状態にそのまま当たる

### 2.2 SLSA

- 出典: SLSA v1.0 Build requirements https://slsa.dev/spec/v1.0/requirements (頁は「Retired」表示。現行は v1.2)
  - Build L2: ホストされたビルド基盤、真正性を検証できる provenance。L3: ビルドから基盤の秘密(provenance の署名鍵等)に触れられない、ビルド間の相互影響の禁止、利用者のステップが provenance を改変できない
  - 「It does not require that a build platform prevents a producer from performing a risky or insecure build」。ビルド定義を誰が変えられるかは Build トラックの範囲外
- 出典: SLSA v1.2 Source requirements https://slsa.dev/spec/v1.2/source-requirements (Approved、日付表示無し)
  - Source L1 版管理 / L2 履歴と provenance / L3 継続的な技術的統制(保護する Named Reference を組織が指定し、SCS が強制。例に GitHub rulesets) / L4 二者レビュー(「The SCS requires two trusted persons to review all changes to protected branches」)
  - Trusted Robot: 「Automation authorized by the organization to act in explicitly defined contexts」「**The robot's identity and codebase cannot be unilaterally influenced**」。二者レビューの恒久的な例外を受けられる(例: 移行ボット、Dependabot)
  - **推論**: ブランチで書き換えたワークフローの GITHUB_TOKEN は「codebase を一者で左右できる」主体であり、SLSA の Trusted Robot の定義を満たさない。保護された参照(`dist/standard`)を更新する主体として例外を受ける根拠にならない
- 補足: GitHub の artifact attestations(`attestations: write` + OIDC)は provenance に `job_workflow_ref` 等を記録するため、配布物の受け手が「main のワークフローで作られたか」を検証する経路になり得る(推論。今回は該当文書を読んでいない)

### 2.3 CISA/NSA

- 出典: NSA・CISA「Defending Continuous Integration/Continuous Delivery (CI/CD) Environments」CSI、2023-06、v1.0 https://media.defense.gov/2023/Jun/28/2003249466/-1/-1/0/CSI_DEFENDING_CI_CD_ENVIRONMENTS.PDF
  - 「avoid using software-based long-term credentials as much as possible」、クラウドの一時資格情報を使う
  - 二者規則: 「No single developer should be able to check in code without another developer reviewing and approving the changes」
  - 「Developers should only have access to the pipelines they are tasking…」、職務の分離(ソースの開発者にビルド環境の特権を要さない)
  - 「The CI/CD pipeline should not be accessible by everyone in the organization」、CI/CD の構成に署名し検証する
  - OIDC への言及は無い

### 2.4 GitHub「Secure use reference」(旧 Security hardening for GitHub Actions)

- 出典: https://docs.github.com/en/actions/reference/security/secure-use (閲覧 2026-10-27)
  - GITHUB_TOKEN の既定を contents の read に、ジョブ単位で必要な分だけ上げる
  - 「Any user with write access to your repository has read access to all secrets configured in your repository」
  - CODEOWNERS に `.github/workflows` を加え、変更に指定レビュー者の承認を要求
  - クラウドへの配備は OIDC で「short-lived, well-scoped access tokens」。長期の秘密情報をやめられる
  - 環境の秘密情報はレビュー者の承認まで触れられない
  - `pull_request_target` を不要なら避ける。public リポジトリでセルフホストのランナーをほぼ使わない
  - **推論**: CODEOWNERS はマージの関門であり、ブランチへの push で走るワークフローの実行は止めない。GitHub 自身の指針も、ブランチ上の実行による書き込み権限の取得に対する直接の答えは示していない

### 2.5 OpenSSF Scorecard

- 出典: https://github.com/ossf/scorecard/blob/main/docs/checks.md (閲覧 2026-10-27)
  - Token-Permissions: トップレベルを read-only にし、書き込みはジョブ単位で宣言する形を最高点とする。`contents` 等の書き込みは警告。認識された配布アクションを使うジョブは減点しない。「The check cannot detect if the 'read-only' GitHub permission setting is enabled」
  - Dangerous-Workflow: `pull_request_target`/`workflow_run` での PR コードのチェックアウト、信頼できないコンテキストのスクリプト注入
  - **推論**: Scorecard は本リポジトリの形(トップ read、publish ジョブだけ `contents: write`)を良い形として評価する側に立つ。ブランチ上の昇格は評価の対象外

### 2.6 短命の資格情報と長期の鍵(各指針の整理)

- 一致: 短命 > 長期(OWASP SEC-6、CISA/NSA、GitHub Secure use、SSDF には明記無し)
- 一致: 資格情報はパイプライン・ステップの必要最小に限る(OWASP SEC-5、GitHub)
- 一致: 未レビューのコード・設定を走らせる文脈に、配備の資格情報を渡さない(OWASP SEC-4・SEC-1、GitHub の環境の秘密情報)
- **推論**: 「短命」は漏洩後の悪用の期間を縮めるが、「誰が発行させられるか」は変えない。GITHUB_TOKEN は前者に強く後者に弱い。長期の鍵を Environment に置く形は逆(後者を参照で限れるが、前者で劣る)。両方を満たすのは「OIDC + 受け手の参照・環境の検証」だけで、同一リポジトリへの push には受け手が無い

## 3. 「ワークフローのファイルを書き換えられる者は、その権限を持つ」問題への実務の答え

| 手段 | 何を止めるか | 何を止めないか | 本リポジトリ(public、個人所有、ソロ期)での可否 |
| --- | --- | --- | --- |
| CODEOWNERS + 既定ブランチの必須レビュー | 未レビューのワークフローの変更が main へ入ること | ブランチ上での実行 | 可(ソロでは自己承認の問題が残る) |
| 「Workflow permissions」を read に | 権限を書かないワークフローの書き込み | `permissions` で明示した昇格 | 可。効果は限定 |
| Push ルールセット「Restrict file paths」で `.github/workflows/**` | 書き込み者のワークフロー変更の push そのもの | バイパス主体 | **不可**(Enterprise Cloud の internal/private のみ) |
| 書き込み先のブランチ・タグを Restrict updates | GITHUB_TOKEN を含む全ての書き込み(バイパス以外) | バイパス主体 | 可。ただし GITHUB_TOKEN をバイパスに入れられないため配布が止まる |
| Environment(配備のブランチ限定・required reviewers)+ 環境の秘密情報 | 秘密情報への到達(参照・承認で限定) | GITHUB_TOKEN の `permissions` | 可(required reviewers は public なら Free でも可)。鍵を要するため所有者の指示で不採用 |
| OIDC + 受け手の検証 | 受け手の信頼条件外の参照からの取得 | 受け手の無い操作 | Pages の deploy は既に該当。`dist/standard` への push には受け手が無い |
| 配備を別リポジトリ・別の起動へ分ける(配布先リポジトリ側のワークフローが main の成果物を取りに行く、`workflow_run`・`repository_dispatch`) | 元リポジトリのブランチから配布先への書き込み | 配布先リポジトリへ書ける者 | 構成上は可。別リポジトリへ書くには結局資格情報が要る(App の鍵等)か、配布先で取得する設計が要る(推論) |
| ワークフロー実行の保護(2026-09 GA) | 指定の主体・イベントによる起動 | 参照による限定(記述無し) | 可(提供範囲の確認は要)。AI の主体による起動を止める用途に検討余地 |
| provenance/attestation を受け手が検証 | 「main のワークフローで作られていない」配布物の受け入れ | 書き込みそのもの | 受け手(テンプレートの利用者)の手順次第(推論) |

- 出典: 上記 1.4〜1.7、2.1、2.4 の各頁。「配備を別リポジトリへ分ける」は OWASP SEC-4 の「store the config on a separate protected branch」「isolated nodes」の推奨と同じ向き。具体の GitHub 上の手順を述べた一次資料は今回読めていない
- tag の保護: 旧「tag protection rules」はルールセットへ移行している(GitHub Docs の Available rules は branch と tag の両方に Restrict creations/updates/deletions を適用できると記述)。リリースのタグを配備の参照とする場合、タグの作成をバイパス主体に限れば、Environment の「選んだタグ」と組み合わせて秘密情報の到達を限れる。ただし GITHUB_TOKEN の権限は限れない(1.4 と同じ)

## 4. 規格

### 4.1 ISO/IEC 27001:2022 附属書A

- **本文は読めていない**(有償)。ISO/IEC 27002:2022 の手引きも読めていない。以下は管理策の名称のみ(公知)
  - 5.17 認証情報(Authentication information)
  - 8.2 特権的アクセス権 / 8.3 情報へのアクセス制限
  - 8.4 ソースコードへのアクセス(Access to source code)
  - 8.25 セキュリティに配慮した開発のライフサイクル / 8.26 アプリケーションのセキュリティの要求事項 / 8.27 セキュリティに配慮したシステムアーキテクチャ及びシステム構築の原則 / 8.28 セキュリティに配慮したコーディング / 8.29 開発及び受入れにおけるセキュリティテスト / 8.30 外部委託による開発 / 8.31 開発環境、テスト環境及び本番環境の分離 / 8.32 変更管理
- **推論**: 本件の論点は 8.4(ワークフローのファイル = ソースへの書き込みが配備権限を伴う)、8.31(開発の文脈と本番配備の文脈の分離)、8.32(配備に至る変更の統制)、5.17(認証情報の置き場)に掛かる。条項の文言で裏付けるには 27002 の本文の確認が要る

### 4.2 NIST SP 800-218 SSDF v1.1(2022-02-03)

- 出典: https://csrc.nist.gov/pubs/sp/800/218/final 、PDF https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-218.pdf
  - PO.5.1「Separate and protect each environment involved in software development」。例: 環境ごとの多要素・条件付きアクセス、環境間のネットワーク分離とアクセス制御、「Minimize direct human access to toolchain systems, such as build services」、環境間の信頼関係を記録・監視・監査
  - PS.1.1「Store all forms of code – including source code, executable code, and configuration-as-code –」を最小権限で保護。例: 構成のコードもリポジトリに置きアクセスを制限、変更を個人の識別に結び付けて追跡、コミット署名、「Have the code owner review and approve all changes made to the code by others」
  - PO.3.2: ツールチェーンは pipelines-as-code で構成し、推奨の安全な実務で運用
  - 「資格情報の置き場」「配備の資格情報」に直接触れる記述は見当たらない
- SP 800-218 Rev.1(SSDF 1.2)初期公開草案 2025-12-17(意見募集 2026-01-30 締切、草案のまま) https://csrc.nist.gov/pubs/sp/800/218/r1/ipd — **本文は読めていない**
- **推論**: PS.1 は「configuration-as-code」= ワークフローのファイルを保護対象のコードと明示する。PO.5.1 の「各環境の分離と保護」は、開発の文脈(ブランチ)と配備の文脈の分離として読める

### 4.3 NIST SP 800-204D(2024-02、Chandramouli・Kautz・Torres-Arias)

- 出典: https://csrc.nist.gov/pubs/sp/800/204/d/final 、PDF https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-204D.pdf
  - 3.2.2「write access to the SCM should be considered a high risk and tightly controlled」、マージ前に第二の開発者がレビュー
  - 5.1.2: マージ承認の権限を持つ者は自分のマージを承認できない。外部貢献者の CI 実行は保守者の承認まで保留(PULL-PUSH-REQ-3)
  - 5: ドライバーツール・ビルドの制御面は「execute at a higher level of trust than the individual functional steps」
  - 5.2 DEPLOY-REQ-3: 配備するのは安全なビルド工程が生成した成果物に限る。5.2.1 GitOps-REQ-3: 実行時の変更を手作業で入れない
  - 5.1.4・5.2: 秘密情報をコミットに入れない、リポジトリを走査
  - 短命の資格情報・OIDC・秘密情報の管理基盤、CD から配備先への認証方式の具体は**記述が無い**(読めた範囲)
- **推論**: 「制御面はステップより高い信頼で動く」は、配備の統制(制御面)を、ステップと同じファイル(ブランチで書き換えられるワークフロー)に置かないことの根拠として引ける

## 5. 論点への示唆(推論。会議体の材料)

1. **短命のトークンを条項がどう扱うか**: 外部の指針は「短命」と「参照・レビューへの束縛」を独立の要求として扱う。前者で後者を代替する根拠は見つからない。条項の目的(起動元のブランチで配備に届かせない)に照らせば、GITHUB_TOKEN の `permissions` は「ワークフローのファイルの中だけに置いた統制」そのもの
2. **認める場合に経路を止めるもの**: GitHub の標準機能では、GITHUB_TOKEN の書き込みを参照で限る手段は確認できなかった(Workflow permissions は既定、Environment はトークンを限らない、ルールセットは GITHUB_TOKEN をバイパスに入れられない、Restrict file paths は public で使えない)。止める候補は「書き込み者の範囲を限る」(ソロ期・AI の主体の push 権限・ワークフロー実行の保護)という**主体側**の統制か、「受け手が provenance を検証する」という**下流側**の統制
3. **本リポジトリ**: 鍵を置かない前提では、条項の要求(参照に限った実行環境の秘密情報)を満たす経路は無い。開示を続ける場合、止まらない経路(書き込み権限を持つ主体のブランチ上の実行)と、残る緩和(Environment による実行の記録、ルールセットでの削除・強制 push 禁止、CODEOWNERS、ワークフロー実行の保護の可否)を併記するのが外部の指針と整合する
4. 未確認事項: 組織レベルの restricted 既定が `permissions` キーの昇格を禁ずるか / ワークフロー実行の保護のファイル単位の対象が新規ファイルに及ぶか・個人所有の public リポジトリで使えるか / scoped secrets の提供状況 / ISO/IEC 27002・SSDF 1.2 の本文
