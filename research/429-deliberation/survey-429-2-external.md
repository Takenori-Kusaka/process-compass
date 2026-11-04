# #429 外部調査: AI エージェントを人の名義で動かすか、専用の名義で動かすか

- 調査日: 2026-11-05(以下の出典は、注記がない限りすべて同日に閲覧して確かめた)
- 範囲: 提供者の公式文書、GitHub の仕様、規格・公的指針(NIST・ISO/IEC・OWASP・CISA ほか Five Eyes・SLSA)
- 凡例
  - **[確認]** 原典(一次情報)を読み、文言を確かめた事実
  - **[二次]** 二次情報(フォーラム・解説記事・翻訳版)にだけ基づく記述
  - **[観測]** 本調査で API を叩いて得た実測(2026-11-05 時点)
  - **[推測]** 調査者の解釈。事実として引かないこと
  - **[未読]** 原典を読めなかったもの。条番号・文言を推測で補っていない

---

## 1. 提供者の公式の推奨と業界の実務

### 1.1 GitHub Copilot coding agent(2026-11 時点の名称は「Copilot cloud agent」)

| 論点 | 内容 | 根拠 |
|---|---|---|
| コミットの名義 | Copilot が作者(author)になる。課題を割り当てた人、または変更を依頼した人が共同作者(co-author)として記される | [確認] Risks and mitigations「Copilot cloud agent's commits are authored by Copilot, with the developer who assigned the issue or requested the change to the pull request marked as the co-author.」 |
| 署名 | Copilot のコミットは署名され「Verified」と表示される | [確認] 同上「Copilot cloud agent's commits are signed, so they appear as "Verified" on GitHub.」 |
| 依頼者の承認 | PR の作成を依頼した人は、その PR を承認できない(必須承認数に数えられない) | [確認] 同上「Prevents the user who asked Copilot cloud agent to create a pull request from approving it.」/ Review Copilot PRs「your approval of a Copilot pull request won't count」「Another reviewer must approve the pull request before it can be merged.」 |
| 最後の push と承認 | 「最新のレビュー可能な push の承認を要求」を有効にすると、最後の push は n+1 件の承認を要する | [二次] 独語版の旧ページの記述(検索結果の抜粋)。英語の現行版では未確認 |
| 起動できる人 | 書き込み権限を持つ人だけ。それ以外の人のコメントはエージェントへ渡らない | [確認] Risks and mitigations「Only users with write access to the repository can trigger Copilot cloud agent to work.」 |
| ブランチ | 新しい `copilot/` ブランチを作り、そこへだけ push できる | [確認] 同上 |
| ワークフロー | 書き込み権限を持つ人が承認するまで、Copilot の PR では Actions が走らない(既定) | [確認] 同上、Review Copilot PRs |
| 監査 | セッションログと監査ログのイベントを管理者が見られる。「auditable and traceable」と設計目標を掲げる | [確認] 同上 |
| PR の作者表示 | Copilot のアカウントで PR を作るかどうかを明記したページは見つからない。監査ログの PR 作成イベントでは、actor が Copilot、`user` が起動した人として記録される(→4.4) | [確認](監査ログ側のみ) |
| タイムライン | 「Copilot started work on behalf of …」の表示 | [二次] Microsoft Learn の画面写真の説明文。GitHub の公式ページでの文言は未確認 |

- [観測] REST `GET /users/copilot-swe-agent[bot]` は login `Copilot`、id `198982749`、type `Bot` を返す。`GET /users/Copilot` は 404。ログイン名で引くときは `[bot]` 付きの名前でしか引けず、返る login は `Copilot` である
- [二次] squash merge 後の main のコミット作者が Copilot になることに不満を述べる利用者の議論がある(GitHub Community #179983)

### 1.2 Claude Code の GitHub Actions 連携(anthropics/claude-code-action)

| 論点 | 内容 | 根拠 |
|---|---|---|
| 既定の名義 | `github_token` を渡さなければ、Claude GitHub App として認証する | [確認] Claude Code GitHub Actions「`github_token` … When omitted, the Claude Code GitHub Action authenticates as the Claude GitHub App」 |
| 独自 App | 権限を絞りたい組織は Contents・Issues・Pull requests だけの独自 GitHub App を作る | [確認] 同上 |
| トークンの寿命 | App は対象リポジトリに限った短命トークンを受け取る | [確認] security.md「The GitHub app receives only a short-lived token scoped specifically to the repository it's operating in」 |
| 個人のトークン | 「Do not use a personal access token」。理由は、ローテーションされず、プロンプトインジェクションで回収されうること | [確認] security.md(`allowed_non_write_users` の文脈) |
| 起動できる人 | 書き込み権限を持つ人。bot は既定で起動できない(`allowed_bots` で許可) | [確認] 同上 |
| 署名 | 既定では未署名。`use_commit_signing` で API 経由のコミットにすると App として Verified になる。`ssh_signing_key` を使うと鍵の所有アカウントへ帰属する | [確認] security.md |
| PR の作成 | 既定では Claude は PR を自動作成しない。利用者がリンクを押して自分で作る | [確認] security.md「The user must click the link and create the PR themselves.」 |
| 承認 | Claude が PR を承認できるかの記述はない | [確認](記述がないことを確認) |
| 推論側の認証 | 組織で共有する秘密には、個人のサブスクリプションに紐づく OAuth トークンでなく API キーを使う。長期の秘密を置かない手段として、OIDC から Claude Console のサービスアカウントへ交換する workload identity federation がある | [確認] Claude Code GitHub Actions「an OAuth token is tied to the subscription of the person who ran `claude setup-token`」 |

- [確認] ローカルの Claude Code は、既定でコミットへ `Co-Authored-By: <モデル名> <noreply@anthropic.com>` を付け、PR 本文へ帰属の文を書く。設定 `attribution`(旧 `includeCoAuthoredBy`)で変更・非表示にできる(Settings reference)。ローカル実行時に誰の git・GitHub 認証情報を使うかを定めた公式記述は、今回は見つけていない
  - [推測] ローカル実行では利用者の git 設定と `gh` の認証がそのまま使われる。このため、何も手当てしなければ「人の名義」で動く。既定の Co-Authored-By は、それを事後に区別するための自己申告の印にとどまる
- [観測] `claude[bot]` は id `209825114`、type `Bot`

### 1.3 Cursor(Cloud Agents / Background Agents)

- [確認] Cursor GitHub App は clone・ブランチ作成・PR 作成・レビューコメントの権限を持つ。「All permissions follow the principle of least privilege.」。公式ページには、コミット・PR の作者名義の記述がない(cursor.com/docs/integrations/github)
- [二次] Cursor フォーラム(2026-08-17、deanrie。社員らしい書きぶりだがバッジでは確認できない)
  - 利用者が対話で起動した Cloud Agent の PR は、利用者個人の GitHub OAuth 連携で作られ、**作者は利用者**。コミットは「Cursor Agent」が作者で、利用者が共同作者
  - Automations・サービスアカウント API の実行は App を通り、PR は `cursor[bot]` 名義
  - 「A PR opened by an agent you started is attributed to you for ownership and review governance.」(自分の起動した bot 名義の PR を自分で承認できないようにする意図、と説明)
- [観測] `cursor[bot]` は id `206951365`、type `Bot`

### 1.4 Devin(Cognition)

- [確認] 管理者の設定「Open PRs as」に3択がある(docs.devin.ai/integrations/gh)
  - **User**: 利用者の git アカウントが連携済みなら利用者として、未連携なら Devin として PR を開く
  - **Devin**: 常に Devin として開く
  - **User only**: 利用者として開く。未連携なら失敗する
- [確認] 利用者が個人の GitHub アカウントを連携すると「Devin can act under their identity」「pull requests Devin opens in their sessions are authored by them」
- [確認] 一部のコミット作成方式では利用者のメールアドレスを committer にする。GitHub は署名を push した者でなく committer に照らして検証する、と注記している
- [確認] main へのブランチ保護を推奨する
- [観測] `devin-ai-integration[bot]` は id `158243242`、type `Bot`(Devin の App の bot 名と推定。公式ページでの名称は未確認)

### 1.5 OpenAI Codex(クラウド版・GitHub 連携)

- [確認] Codex のレビューは `chatgpt-codex-connector` という bot アカウントの名義で投稿される(画面例)。権限があればブランチへ修正を push できる(learn.chatgpt.com/docs/third-party/github)。PR とコミットの作者名義は公式ページに記述がない
- [二次] 既定のコミット trailer `Co-authored-by: Codex <noreply@openai.com>` と、CLI で作者を環境変数で差し替える方法を紹介する個人ブログがある。公式の確認はできていない
- [観測] `chatgpt-codex-connector[bot]` は id `199175422`、type `Bot`

### 1.6 GitHub 自身の推奨(アカウントの種別)

- [確認] GitHub App は利用者に依らず動ける。OAuth App は利用者の代理でしか動けない。App は席(seat)を消費せず、導入した人が組織を去っても残る。個人アクセストークン(PAT)は個人に紐づくので、その人が権限を失うと自動化が壊れる(Deciding when to build a GitHub App)
- [確認] installation として認証すると活動は App に帰属し、user access token(利用者の代理)で認証すると活動は利用者に帰属する(About authentication with a GitHub App)
- [確認] deploy key より GitHub App を推奨する。machine user は「won't be used by a human」アカウントで、鍵がパスフレーズで保護されないことが多い、と短所を挙げる(Managing deploy keys)
- [確認] 利用規約: アカウントは人が作る。例外の machine account は「used exclusively for performing automated tasks」。「Multiple users may direct the actions of a machine account, but the owner of the Account is ultimately responsible for the machine's actions.」。無料の machine account は個人アカウントのほかに1つまで。「a single login may not be shared by multiple people」(GitHub Terms of Service)
  - [推測] 規約は「1つのログインを複数の**人**で共有すること」を禁じる。人とエージェントの共有を名指しした条文ではない。規約上の位置づけは、エージェントが人の代わりに操作する「自動化」として読むのが自然であり、責任はアカウント所有者に残る

### 1.7 実務の傾向のまとめ [推測]

- 提供者の選択は二系統に分かれる
  - **エージェント自身の名義(bot)で作者になり、人を共同作者に記す**: Copilot cloud agent、Claude Code Action(既定)、Cursor の Automations、Devin の「Devin」設定
  - **人の名義で PR を開く**: Cursor の対話起動、Devin の「User / User only」設定。理由として「所有と承認統制を人へ帰属させる」(Cursor)を挙げる
- 二系統とも、**起動した人がその PR の承認者として数えられない**ようにする方向で揃う。Copilot は仕様として明記する。Cursor は人の名義で PR を作ることで、GitHub の「作者は自分の PR を承認できない」規則に乗せる。名義の選択と、職務の分離を守る仕組みが対になっている
- ローカル実行のエージェント(Claude Code・Codex CLI・Cursor のエディタ内)は、利用者の認証情報をそのまま使うのが既定。区別は Co-authored-by などの自己申告の trailer に頼る

---

## 2. 規格・公的指針の記述

### 2.1 NIST SP 800-53 Rev. 5(OSCAL 版 5.2.0、2026-10-22 更新の正本 JSON から抽出)[確認]

| 管理策 | 関連する文言(原文) |
|---|---|
| AC-2 Account Management | a.「Define and document the types of accounts allowed and specifically prohibited」/ k.「Establish and implement a process for changing shared or group account authenticators (if deployed) when individuals are removed from the group」/ 解説: アカウント種別の例に individual, shared, group, system, … service を挙げ、「Types of accounts that organizations may wish to prohibit due to increased risk include shared, group, …」 |
| AC-2(9) Restrictions on Use of Shared and Group Accounts | 「Only permit the use of shared and group accounts that meet [組織が定める条件].」/ 解説「organizations consider the increased risk due to the lack of accountability with such accounts.」 |
| AC-5 Separation of Duties | a.「Identify and document [組織が定める職務]」b.「Define system access authorizations to support separation of duties.」/ 解説: 職務の分離は AC-2 のアカウント管理、AC-3、IA-2・IA-4・IA-12 の識別管理で強制する |
| IA-2 Identification and Authentication (Organizational Users) | 「Uniquely identify and authenticate organizational users and associate that unique identification with processes acting on behalf of those users.」/ 解説「organizations may require unique identification of individuals in group accounts or for detailed accountability of individual activity.」 |
| IA-4 Identifier Management | b.「Selecting an identifier that identifies an individual, group, role, service, or device」/ d.「Preventing reuse of identifiers for [組織が定める期間]」/ 解説「Preventing the reuse of identifiers implies preventing the assignment of previously used … identifiers to different individuals, groups, roles, services, or devices.」 |
| IA-9 Service Identification and Authentication | 「Uniquely identify and authenticate [組織が定めるサービス・アプリケーション] before establishing communications …」 |
| AU-10 Non-repudiation | 「Provide irrefutable evidence that an individual (or process acting on behalf of an individual) has performed [組織が定める操作].」/ 解説: 対象に「approving information」を含む |

- [推測] IA-2 は「人の識別を、その人の代理で動くプロセスに結びつける」ことを求める。エージェントを人の認証情報で動かすと、この結びつきは成り立つ。一方で、人の操作とプロセスの操作を区別する手段は IA-2 からは出てこない。区別の根拠は AC-2(アカウント種別の定義・service アカウント)、IA-9(サービスの識別)、AU-10(誰が承認したかの否認防止)に求めることになる
- [推測] AC-2(9) は共有アカウントを「説明責任を欠く」ものとして扱う。人とエージェントで1つの認証情報を共有する形がこの「shared account」に当たるかは、800-53 に直接の記述がない(800-53 の shared は人どうしの共有を想定した書きぶり)

### 2.2 NIST AI RMF 1.0(AI 100-1)と生成 AI プロファイル(AI 600-1)[確認]

- AI 100-1 GOVERN 2.1「Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization.」
- AI 100-1 GOVERN 3.2「Policies and procedures are in place to define and differentiate roles and responsibilities for human-AI configurations and oversight of AI systems.」
- AI 600-1 は全文を検索したが、認証情報・アカウント・職務の分離を扱う記述は見当たらない。**この論点について AI 600-1 は何も定めていない**と判断する(credential を含む語は調達時の要員の資格の意味でだけ出現)

### 2.3 NIST NCCoE「Accelerating the Adoption of Software and AI Agent Identity and Authorization」(概念文書・**DRAFT**、2026-02)[確認]

- 位置づけ: 実証プロジェクトの範囲を決めるための概念文書。意見募集は 2026-04-02 に締切(NIST の告知による)。規範ではない
- 関心領域(原文)
  - Identification:「access management systems can distinguish between agent and human identities」
  - Access Delegation:「Link specific user identities to AI agents or software systems to support effective delegation controls and maintain accountability for the actions of automated systems.」
  - Logging and Transparency:「Link specific AI agent and software systems actions to the identity of the non-human entity」
- 問い(原文): 「How do we handle delegation of authority for "on behalf of" scenarios?」「How do we bind agent identity with human identity to support "human-in-the-loop" authorizations?」「How do we ensure non-repudiation for agent actions and binding back to human authorization?」
- [推測] NIST は「エージェントを人と区別できる識別を持たせ、そのうえで委任元の人に結びつける」二層の構図を検討の前提に置いている。答えはまだ出していない

### 2.4 ISO/IEC 27001:2022 附属書A / ISO/IEC 27002:2022

- [確認] 管理策の番号と表題: ISO/IEC 27002:2022 の公開プレビュー(iTeh、仏語版の目次)で、5.3 職務の分離、5.16 識別情報の管理(Gestion des identités)、5.17 認証情報(Informations d'authentification)、5.18 アクセス権(Droits d'accès)、8.2 特権的アクセス権(Droits d'accès privilégiés)、8.5 セキュアな認証、8.15 ログ取得 を確かめた
- [未読] 27001:2022 附属書A の管理策本文、27002:2022 の 5.16〜5.18・8.2 の本文と手引き。公開プレビューは目次・用語の定義(3.1)までしか収録していない。**本文の文言は確認できていない**
  - [二次] 解説サイト(ISMS.online など)は 5.16 を「人と人以外の識別情報のライフサイクル管理」と説明する。共有の識別情報を例外的に認める条件を手引きに置いているとの説明も見かけるが、原典で確かめていない
- 27001 附属書A の番号が 27002 の番号と一致することは周知の対応関係だが、27001 本文側では今回確かめていない

### 2.5 ISO/IEC 42001:2023

- [未読] 本文・附属書A ともに読めていない。解説サイトは A.3.2「AI roles and responsibilities」を挙げるが、サイト間で番号と表題が食い違う(CertPro は A.3.2 を別名で呼ぶ)。**条番号を引かない**

### 2.6 OWASP Top 10 for Agentic Applications 2026(2025-12-09 公開)[確認]

ASI03「Identity and Privilege Abuse」の原文から。

- 「Without a distinct, governed identity of its own, an agent operates in an attribution gap that makes enforcing true least privilege impossible.」
- 識別の範囲に「delegated user sessions」を含む:「Identity in this context includes both the agent's assigned persona and any authentication material (API keys, OAuth tokens, delegated user sessions) that represent it.」
- 攻撃例7「Identity Sharing. An agent gains access to systems on behalf of a user, often their maker. It then allows other users to leverage that identity implicitly by invoking its tools as that identity.」
- 対策1「using per-agent identities and short-lived credentials」/ 対策4「Require human approval for high-privilege or irreversible actions」/ 対策6: エージェントを「managed non-human identities with scoped credentials, audit trails, and lifecycle controls」として IAM に組み込む
- ASI03 は LLM Top 10 の LLM06:2025 Excessive Agency の「agentic evolution」と位置づける
- [推測] 人の名義で動くエージェントは「attribution gap」の典型として読める。本調査の論点に最も直接に答える一次資料である

### 2.7 CISA ほか6機関「Careful Adoption of Agentic AI Services」(2026-05-01)

- 共著: CISA、NSA、ASD's ACSC、カナダ Cyber Centre、NCSC-NZ、NCSC-UK [確認](CISA の告知)
- [確認](カナダ Cyber Centre の HTML 版から。PDF の原本は ACSC のサーバーが応答せず未取得)
  - 「construct each agent as a distinct principal, a cryptographically anchored identity」
  - 秘密鍵・トークンを「keep them static, share them across multiple agents or protect them poorly」と盗まれる、と警告
  - 「Replace static, long-lived secrets with ephemeral credentials that expire when the job is complete」
  - 「Prohibit agents from modifying their own privileges」
  - 「Agentic system architecture can obscure what caused a particular action, making accountability hard to trace.」
  - 「Clearly assign responsibility and accountability for errors or adverse outcomes caused by the system」
  - 「Prevent agents from autonomously executing high impact actions or outputs without prior human approval」
  - 「Monitor and log identity and privilege changes and audit regularly for drift, impersonation or misconfiguration」
- [確認] NCSC-UK のブログ版: 「avoid long-lived credentials」「Insist on human accountability」
- [推測] 「人の認証情報をエージェントと共有するな」と名指しした一文は、取得できた範囲にはない。ただし「各エージェントを別個の主体として構成する」は、人の名義で動かす形と両立しにくい

### 2.8 SLSA v1.2 Source Track [確認]

- Source Control System(SCS)の要件: 「The SCS MUST provide an identity management system or some other means of identifying and authenticating actors.」「The SCS MUST document how actors are identified for the purposes of attribution.」「Activities conducted on the SCS SHOULD be attributed to authenticated identities.」
- Two-party review(Source L4): 「Changes in protected branches MUST be agreed to by two or more trusted persons prior to submission.」。成立する組み合わせは「Uploader and reviewer are two different trusted persons.」または「Two different reviewers are trusted persons.」
- 役割の定義: Trusted person は「A human who is authorized by the organization to propose and approve changes」。Trusted robot は「Automation authorized by the organization to act in explicitly defined contexts」で、「The robot's identity and codebase cannot be unilaterally influenced.」。組織は Trusted Robot に方針の恒久的な例外を与えてよい(例: import bot、Dependabot)
- AI・LLM への言及はない
- [推測] SLSA は「人」と「robot」を別の役割として定義する。人の名義で動くエージェントは、SCS 上で trusted person と区別できなくなる。そうなると、Two-party review の「二人の人」の勘定が崩れる(人 A がエージェントに書かせ、人 A の名義で uploader となると、人の関与は実質一人分なのに記録上は区別できない)

---

## 3. GitHub のアカウント識別子とログイン名

### 3.1 ログイン名の変更と再利用 [確認]

- 改名すると旧ログイン名は直ちに他人が取得できる:「your old username becomes available for anyone else to claim」
- リポジトリへの参照は転送されるが、旧名の新しい持ち主が同名リポジトリを作ると転送は止まる
- 「CODEOWNERS files that include your old username will need to be manually updated.」
- アカウントを削除すると、ログイン名は 90 日後に誰でも使える:「Your username will be available for anyone to use after 90 days.」。既存のコメントは `ghost` ユーザーへ付け替えられる(Personal account reference)
- 非活動を理由とするログイン名の解放要求は受け付けない(商標の申立てだけ審査)(Username policy)
- [推測] ログイン名は NIST IA-4 d. の「識別子の再利用の防止」を満たさない。改名なら即時、削除なら 90 日で、同じ文字列が別人を指しうる。記録の照合キーをログイン名にすると、時間をおいた照合で別人に当たる危険がある

### 3.2 数値の識別子と取り方 [確認・観測]

- REST: `GET /users/{username}` が `id`(int64)と `node_id` を返す。`GET /user/{account_id}` は「takes their durable user ID instead of their login, which can change over time」(REST Users)
- GraphQL: User の `databaseId`(「Identifies the primary key from the database.」)、`id`(「The Node ID of the User object.」)、`login`(「The username used to login.」)
- node_id: REST の `node_id` と GraphQL の `id` は同じ global node ID。「it's best practice to persist the global node ID」(Using global node IDs)
- [観測] node_id には新旧の形式が混在する。古いアカウントは `MDQ6VXNlcj…`(base64 の旧形式)、新しい bot は `BOT_kgDO…` の形式だった。**node_id の文字列の形を検査の前提にしてはならない**
- [観測] 取得コマンドの例
  - `gh api users/<login> --jq '.id'`
  - `gh api user/<id> --jq '.login'`(逆引き)
  - `gh api graphql -f query='{ user(login:"<login>"){ databaseId id } }'`
  - bot は `users/<name>%5Bbot%5D` で引く(例: `copilot-swe-agent%5Bbot%5D` → login `Copilot`, id 198982749)

### 3.3 監査ログでの識別 [確認]

- 企業の監査ログの共通フィールド: `actor`, `actor_id`, `actor_is_bot`, `user`, `user_id`, `hashed_token`, `token_id`, `token_scopes`, `programmatic_access_type`, `user_agent`, `org_id`, `repo_id` ほか(Audit log events for your enterprise)
- 監査ログの検索の `actor` 修飾子はログイン名で引く:「you can only use a GitHub username」。保持は 180 日(組織の監査ログ)
- トークンの特定: `hashed_token`(SHA-256)で、PAT・OAuth トークン・「GitHub Apps (authentication as an app installation or on behalf of a user)」の操作を追える(Identifying audit log events performed by an access token)

### 3.4 CODEOWNERS とルールセットの照合 [確認]

- CODEOWNERS は `@username`・`@org/team-name`・メールアドレスで所有者を書く。所有者は明示的な write 権限が要る。存在しない・権限不足の所有者は割り当てられない。コードオーナーの承認を要求すると、所有者のうち誰か1人の承認で足りる(About code owners)
  - [推測] CODEOWNERS は**ログイン名の文字列**で照合する(改名で手直しが要る、という仕様から導ける)。改名・削除後の再取得で、別人が所有者として解決されうる
- ルールセットの迂回者(bypass actors)は **数値の `actor_id`** と `actor_type`(Integration / OrganizationAdmin / RepositoryRole / Team / DeployKey / User)で指定する。`bypass_mode` は always / pull_request / exempt。exempt では迂回の監査記録が作られない(REST Repository rules)
  - UI の説明では迂回を認める対象を「roles, teams, or apps」と書く。REST では `User` も指定できる。UI と API で記述がずれている
  - Copilot はルールセットで PR の作成・更新を止められる。管理者は Copilot を迂回者に加えられる(About coding agent)

---

## 4. 人と bot・エージェントの操作を区別する仕組み

### 4.1 コミットの署名 [確認]

- Web UI のコミットは GitHub が署名して Verified になる。「Organizations and GitHub Apps that require commit signing can use bots to sign commits.」。bot の署名の検証は「the request is verified and authenticated as the GitHub App or bot」のときだけ働く(About commit signature verification)
- vigilant mode を有効にしないと、作者と committer が異なるときの「Partially verified」などの区別は現れない
- Devin の注記: 署名は committer の識別に照らして検証され、push した者の識別ではない
- [推測] 署名は「どの鍵で署名されたか」を示すだけで、「誰が中身を書いたか」は示さない。人の鍵で署名したエージェントのコミットは、人のコミットと区別がつかない

### 4.2 Co-authored-by [確認]

- 書式は `Co-authored-by: name <email>`。貢献として数えるには、相手の GitHub アカウントに紐づくメールアドレスを使う(Creating a commit with multiple authors)
- 共同作者の真正性を GitHub が検証するという記述はない
- [推測] Co-authored-by は自由記述の trailer なので誰でも書ける。区別の自己申告にはなるが、証拠にはならない

### 4.3 GitHub の「on behalf of」[確認]

- GitHub に二つの別の仕組みがあり、混同しやすい
  1. **コミットの `on-behalf-of:` trailer**: 署名済みコミットを**組織**へ帰属させる仕組み(`on-behalf-of: @org <name@organization.com>`)。組織の検証済みドメインのメールアドレスが要る。エージェントの代理操作とは関係がない
  2. **GitHub App の user access token**: 「API requests made by an app on behalf of a user will be attributed to that user.」。UI は利用者のアバターに App の identicon バッジを重ねて表示する。監査ログは利用者を actor として記録し、アクセス種別を user-to-server トークンとする
- [推測] 2 の方式では、記録上の主体は**人**になる。App のバッジと監査ログのアクセス種別でしか区別できない。Cursor の対話起動はこの形に近い(Cursor の説明では個人の OAuth 連携)

### 4.4 Copilot の「requested by」に当たる記録 [確認]

- 監査ログのエージェント用イベント(Audit log events for agents):
  - `actor_is_agent`:「Indicates whether the actor is an AI agent. This will always be `true` for agentic audit log events.」
  - `agent_session_id`:「A unique identifier linking to the specific agent session that generated the event.」
  - `user`:「The person who initiated the agentic event.」
  - `actor:Copilot` で絞り込める(180 日)
- 企業の監査ログの `pull_request.create`・`pull_request_review` 系のイベントは、追加フィールドに `actor_is_agent`・`agent_session_id`(PR 作成のみ)・`oauth_application_id`・`user_programmatic_access_name` を持つ
- 公式ページは対象を Copilot としてだけ書く。Agent HQ で動く第三者のエージェント(Claude・Codex、2026-02 に公開プレビュー)にも `actor_is_agent` が立つかは**未確認**
- [推測] GitHub は「actor = エージェント、user = 起動した人」の二項で記録する方向をとった。NCCoE の「エージェントを識別し、委任元の人に結びつける」構図と一致する

### 4.5 App の installation token の表示 [確認]

- installation として認証した操作は App に帰属し、`<app名>[bot]` の Bot アカウント(type `Bot`)として表示される
- 監査ログでは `actor_is_bot`、`programmatic_access_type`、`hashed_token` で区別・追跡できる
- [観測] 主要なエージェントの bot アカウントはいずれも type `Bot` で、固有の数値 id を持つ(1.1〜1.5 に記載)

---

## 5. 突合に向けた論点(すべて [推測]。会議体の材料であり、結論ではない)

1. **名義の選択は承認の勘定と一体で決まっている**。提供者は「bot 名義なら依頼者の承認を数えない」(Copilot)か、「人の名義にして作者の自己承認禁止に乗せる」(Cursor)かのどちらかで、職務の分離を守っている。名義だけを規定し、承認の勘定を規定しない条項は、どちらの方式でも穴が残る
2. **人の名義で動かす形は、規格・指針の多くと緊張関係にある**。OWASP ASI03(attribution gap、delegated user sessions)、CISA ほか(distinct principal)、NCCoE(agent と human を区別)、SLSA(trusted person と trusted robot の区別)は、いずれもエージェントに固有の識別を持たせる方向を向く。ただし、「人の認証情報の共有を禁ずる」と明文で書いた規範的な条文は、今回読めた範囲にない(NIST 800-53 の shared account は人どうしの共有を想定)
3. **ソロ開発で人の名義の運用を許すなら、区別の手段は自己申告になる**。Co-authored-by も署名も、人の名義で作られたコミットを人の操作と区別する証拠にはならない。区別を証拠で支えられるのは、App の installation token と、GitHub が付ける `actor_is_agent`・`user` の記録だけ
4. **記録の照合キーは数値の id にすべき根拠がある**。ログイン名は改名で即時、削除で 90 日後に再利用されうる(IA-4 d. を満たさない)。ルールセットは数値の id で、CODEOWNERS と監査ログの検索はログイン名で照合する。両者が混在する
5. node_id は形式が新旧で異なる。データベースの id(REST `id` = GraphQL `databaseId`)のほうが比較の前提を置きやすい

## 6. 未確認・読めなかったもの

- ISO/IEC 27001:2022 附属書A・27002:2022 の 5.16〜5.18・8.2 の本文(プレビューは目次と用語まで)
- ISO/IEC 42001:2023 の本文・附属書A(条番号を引かない)
- 「Careful Adoption of Agentic AI Services」の PDF 原本(ACSC のサーバーが応答せず、カナダ Cyber Centre の HTML 版で代替した。PDF との差は未確認)
- GitHub 公式ページ上の Copilot PR の作者表示・タイムライン文言(「on behalf of」の表示文言は Microsoft Learn の画像説明文でしか確認していない)
- Cursor・Codex のコミット・PR 作者名義についての公式文書(フォーラム・個人ブログのみ)
- Agent HQ の第三者エージェントの監査ログ上の扱い
- ローカルの Claude Code がどの git・GitHub 認証情報を使うかを定めた公式記述

## 7. 出典(すべて 2026-11-05 に閲覧)

### 提供者
- GitHub Docs, Risks and mitigations for GitHub Copilot cloud agent — https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations
- GitHub Docs, Review Copilot PRs — https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/review-copilot-prs
- GitHub Docs, About Copilot cloud agent — https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent
- GitHub Docs, Audit log events for agents — https://docs.github.com/en/copilot/reference/agentic-audit-log-events
- Microsoft Learn, Assigning, tracking, and troubleshooting Copilot coding agent tasks(二次) — https://learn.microsoft.com/en-us/training/modules/github-copilot-code-agent/3-assign-track-troubleshoot-copilot-code-agent-tasks
- GitHub Community Discussion #179983(二次) — https://github.com/orgs/community/discussions/179983
- Claude Code Docs, Claude Code GitHub Actions — https://code.claude.com/docs/en/github-actions
- anthropics/claude-code-action, docs/security.md — https://github.com/anthropics/claude-code-action/blob/main/docs/security.md
- Claude Code Docs, Settings reference(`attribution`) — https://code.claude.com/docs/en/settings-reference
- Cursor Docs, GitHub — https://cursor.com/docs/integrations/github
- Cursor Forum, Cloud agent PR attribution(2026-08-17、二次) — https://forum.cursor.com/t/cloud-agent-pr-attribution-gh-account-wide-app-vs-personal-oauth-confusion/168503
- Devin Docs, GitHub integration — https://docs.devin.ai/integrations/gh
- OpenAI(ChatGPT Learn), GitHub — https://learn.chatgpt.com/docs/third-party/github
- Codex CLI Commit Attribution(個人ブログ、二次) — https://codex.danielvaughan.com/2026/03/28/codex-cli-commit-attribution/

### GitHub の仕様
- Deciding when to build a GitHub App — https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/deciding-when-to-build-a-github-app
- About authentication with a GitHub App — https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/about-authentication-with-a-github-app
- Authenticating with a GitHub App on behalf of a user — https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user
- Managing deploy keys(machine users) — https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
- GitHub Terms of Service — https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- GitHub Username Policy — https://docs.github.com/en/site-policy/other-site-policies/github-username-policy
- Username changes — https://docs.github.com/en/account-and-profile/concepts/username-changes
- Personal account reference(削除の副作用) — https://docs.github.com/en/account-and-profile/reference/personal-account-reference
- REST API, Users — https://docs.github.com/en/rest/users/users
- GraphQL, Users — https://docs.github.com/en/graphql/reference/users
- Using global node IDs — https://docs.github.com/en/graphql/guides/using-global-node-ids
- Reviewing the audit log for your organization — https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization
- Audit log events for your enterprise — https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise
- Identifying audit log events performed by an access token — https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/identifying-audit-log-events-performed-by-an-access-token
- About code owners — https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- Creating rulesets for a repository — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
- REST API, Repository rules(bypass_actors) — https://docs.github.com/en/rest/repos/rules
- About commit signature verification — https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
- Creating a commit with multiple authors — https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-with-multiple-authors
- Creating a commit on behalf of an organization — https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/creating-a-commit-on-behalf-of-an-organization

### 規格・公的指針
- NIST SP 800-53 Rev. 5(OSCAL catalog 5.2.0) — https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json
- NIST AI 100-1(AI RMF 1.0) — https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
- NIST AI 600-1 — https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
- NIST NCCoE, Accelerating the Adoption of Software and AI Agent Identity and Authorization(DRAFT, 2026-02) — https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf / 告知 https://www.nist.gov/news-events/news/2026/02/new-concept-paper-identity-and-authority-software-agents
- ISO/IEC 27002:2022 公開プレビュー(iTeh、仏語版の目次) — https://cdn.standards.iteh.ai/samples/75652/9b0c626e1b1e4bda804fca1097e129db/ISO-IEC-27002-2022.pdf
- ISO/IEC 27001:2022 公開プレビュー(iTeh、附属書A は収録なし) — https://cdn.standards.iteh.ai/samples/82875/4d4c8d99950c4b39aaa39cf5cb9a0bf3/ISO-IEC-27001-2022.pdf
- OWASP Top 10 for Agentic Applications for 2026 — https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ (PDF: https://genai.owasp.org/download/52117/)
- CISA, Careful Adoption of Agentic AI Services(告知) — https://www.cisa.gov/resources-tools/resources/careful-adoption-agentic-ai-services / https://content.govdelivery.com/accounts/USDHSCISA/bulletins/41544ff
- Canadian Centre for Cyber Security, Careful adoption of agentic AI(HTML 版) — https://cyber.gc.ca/en/guidance/careful-adoption-agentic-ai
- NCSC-UK, Thinking carefully before adopting agentic AI — https://www.ncsc.gov.uk/sites/default/files/2026-06/Thinking-carefully-before-adopting-agentic-AI.pdf
- ACSC 版 PDF(未取得) — https://www.cyber.gov.au/sites/default/files/2026-05/careful_adoption_of_agentic_ai_services.pdf
- SLSA v1.2, Source requirements — https://slsa.dev/spec/v1.2/source-requirements
