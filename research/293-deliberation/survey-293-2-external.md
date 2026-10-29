# #293 外部調査: 空の検査対象・手元と CI の境界・配布の保護・検査一覧の突合

- 調査日: 2026-10-23
- 調査者: survey-293-2(サブエージェント)
- 範囲: Issue #293 が束ねる #276・#277・#280・#281 の論点に対し、外部の製品仕様・規格・実務がどうなっているか
- 方法: まず `research/282-survey-2026-09/findings.yaml` を grep し(FND-0027・FND-0193・FND-0194 が該当)、不足分を WebSearch / WebFetch で補った。curl はプロキシで遮断
- この文書は何も決めない。選択肢と会議体への問いを並べる
- 出典の区分: 【一次】= 製品の公式文書・規格・ツールの本体、【二次】= ブログ・解説・コミュニティ・第三者のスキル登録簿。二次は傾向の例示であり、規範の根拠にしない

## 0. 要約(10 行)

1. 「検査対象が無い」ときの既定は製品で割れる。pytest(終了コード 5)・Jest(`--passWithNoTests` が無ければ失敗)・ESLint(一致なしでエラー)・coverage.py(NoDataError)は**失敗側**、go test(`[no test files]` で成功)・GitHub のジョブ条件スキップ(Success)・Codecov の `if_not_found`(既定 success)は**通過側**
2. 失敗側の製品はいずれも「対象なしで通す」ための**明示の指定**(フラグ・設定)を持つ。「明示しない限り通過ではない」は多数派の既定だが、普遍ではない
3. 本標準の G-5「検査対象が存在しない場合の扱い」(記録したうえで通過、実装後は禁止)は、失敗側の製品の「明示の指定」と同じ形に当たる。#277 の 1 文案はこれと整合させ方が問題になる
4. 手元のフックは強制手段にならない、という認識は Git 本体の文書(Pro Git)と pre-commit.ci が共有する。強制はサーバ側(CI・ルールセット)に置く
5. 安い検査を先に置き高い検査をその後に `needs` で繋ぐ順序づけは、二次の実務記事が共通して勧める。一方、独立した検査は並列で全部報告せよという反対の要請も同じ記事にある
6. 検査定義の陳腐化への製品の対策は「CI 側で基底の最新に対して検査する」(必須チェックの strict 既定、マージキュー)と「依存の固定+自動更新」(pre-commit autoupdate、Renovate、2026-10-14 公開の Actions ロックファイル)で、**手元の実行を拒否する**製品先例は見つからなかった
7. GitHub Environments は、ワークフローが参照した環境が存在しなければ**保護なしで自動作成**する。保護は管理者が設定画面で付けるしかない(#281 の「ワークフローの変更だけでは完結しない」を裏づける)
8. Environments の配布ブランチ規則は `GITHUB_REF` に照合されるため、`workflow_dispatch` の起動元ブランチ制限に使える。ルールセットの Restrict updates / Block force pushes は既定ブランチ以外にも掛けられ、バイパス対象に GitHub App を指定できる
9. 履歴を持たない配布ブランチへの強制 push(gh-pages の `force_orphan`)は広く使われる慣行。GitHub Pages 自体は Actions 経由の公開と `github-pages` 環境+「既定ブランチだけが配布できる」保護を推奨する
10. 必須チェック名とワークフローのジョブ名の乖離を検査する公式機能は無い。実務では「集約ジョブを1つだけ必須にする」「一覧文書と CI を突合するスクリプト」(二次)で対処している

## 2. 世の中がどうなっているか

### 2.1 検査対象が無いときの扱い(#277)

| 製品 | 対象が無いときの既定 | 通す手段 | 出典 |
| --- | --- | --- | --- |
| pytest | 終了コード 5「No tests were collected」(0 と別) | プラグイン pytest-custom_exit_code で変更 | 【一次】https://docs.pytest.org/en/stable/reference/exit-codes.html (2026-10-23 取得) |
| Jest | 失敗(フラグの説明から導出。既定の挙動を明記する文は頁に無い) | `--passWithNoTests`「Allows the test suite to pass when no files are found」 | 【一次】https://jestjs.io/docs/cli (2026-10-23 取得) |
| ESLint | `errorOnUnmatchedPattern` 既定 true。一致するファイルが無ければエラー | `--no-error-on-unmatched-pattern`、パターン自体が無いときは `--pass-on-no-patterns` | 【一次】https://eslint.org/docs/v9.x/use/command-line-interface (2026-10-23 取得)、Node.js API の写し【二次・ミラー】https://docs.w3cub.com/eslint/integrate/nodejs-api.html |
| coverage.py | データが無いと `NoDataError` を送出 | (未確認) | 【二次】API 解説の写し https://tessl.io/registry/tessl/pypi-coverage/files/docs/exceptions.md (2026-10-23 取得)。公式頁は未取得 |
| go test | テストファイルの無いパッケージは `[no test files]` を出して**成功**。Go 本体の回帰テストがこの挙動を固定している | — | 【一次】https://go.dev/src/cmd/go/testdata/script/test_no_tests.txt (2026-10-23 取得) |
| GitHub 必須ステータスチェック | ジョブが `if` でスキップ → Success。ワークフローがパス・ブランチ・コミットメッセージのフィルタでスキップ → Pending のままマージを止める。依存先の失敗でスキップされた依存ジョブはマージを止めないことがある(`always()` と `needs` の併用を推奨) | — | 【一次】https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks (2026-10-23 取得。SRC-0573、FND-0194 と同じ) |
| Codecov | head にカバレッジ報告が無いとき `if_not_found` の既定は success | informational、フラグ単位の exclude / pass | FND-0194(SRC-0572、2026-09-30 取得) |
| SonarQube | 新規行 20 行未満ではカバレッジ・重複条件を無視(fudge factor、既定有効)。カバレッジ 0% でも品質ゲートが通る事例の問い合わせが繰り返しある | — | FND-0193(2026-09-30)。【二次・コミュニティ】https://community.sonarsource.com/t/0-tests-but-quality-gate-passes-anyways/132454 (2024-12、2026-10-23 取得。公式回答は原因を説明していない) |
| OpenSSF Scorecard | Code-Review は bot の変更だけのとき「結論なし(inconclusive)」を返す | — | FND-0193(SRC-0574) |
| GitHub 秘匿情報規則 | head コミットの走査完了を条件に含め、未走査を通過にしない | — | FND-0027(SRC-0346) |

観察:

- 「対象なし」を失敗にする製品(pytest・Jest・ESLint・coverage.py)は、すべて**通すための明示の指定**を用意している。既定で失敗、明示すれば通過、という形は本標準の G-5「検査対象が存在しない場合の扱い」(`gate-criteria.md` L505 以降。記録したうえで通過、実装後は禁止)と同じ構造である
- 一方、go test と GitHub のジョブ条件スキップ、Codecov は既定で通過させる。「対象の不在は不合格」は**多数派の既定ではあるが、業界の共通規範とまでは言えない**
- 区別を記録として残す(未実施・対象なし・通過を別の値で残す)製品は、GitHub rulesets の状態記録と秘匿情報規則に限られる(FND-0027)。終了コードで区別する pytest も、CI 上では非 0 として失敗に丸められる
- 二次の実務記事は、パスフィルタをワークフロー単位に置くと必須チェックが抜け穴になる、選択器が空を返したら全件実行か失敗に倒す(fail closed)べきだと書く【二次】https://qaskills.sh/blog/ci-required-checks-branch-protection (Pramod Dutta, 2026-08-08、2026-10-23 取得)

### 2.2 手元の検査と CI の境界(#280)

権威の所在:

- Git 本体の文書は、クライアント側のフックは clone で複製されず、方針を強制したいならサーバ側で行え、と書く【一次】https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks (2026-10-23 取得)
- pre-commit.ci は同じ `.pre-commit-config.yaml` を CI で実行し、手元での利用を「各開発者の任意(opt-in)」と位置づける。CI 側だけで外すフック(`ci.skip`)と、`[skip ci]` による実行の省略も持つ【一次】https://pre-commit.ci/ (2026-10-23 取得)
- 二次の解説は、手元は速い検査の一次濾過、サーバ側が全体の適合を保証する二段モデルを描き、`--no-verify` による迂回は理由つきで記録・事後確認せよと書く【二次】https://edana.ch/en/2026/06/18/git-hooks-optimizing-automation-and-quality-in-your-devops-pipelines/ (Guillaume Girard, 2026-06-18、2026-10-23 取得。数値は出典不明の事例)
- 「CI が唯一の正(source of truth)」という言い回しそのものを、Google や GitHub の公式文書で確認することはできなかった(§5)

段の中の順序(fail-fast):

- 安い・決定的・信号の強い検査(構成の構文、生成物の一致、lint、型、ロックの検証)を先に置き、高い検査を `needs` で後ろに繋ぐことを勧める。同時に、独立した検査は並列に走らせて全件を報告し、往復を減らせとも書く(層ごとに選べ、という主張)。集約ジョブを必須にし、依存先の失敗や**想定外のスキップ**で失敗させよとも書く【二次】https://oneuptime.com/blog/post/2026-07-28-fail-fast-vs-run-every-check-ci/markdown (Nawaz Dhandala, 2026-07-28、2026-10-23 取得)
- 整形・lint を早く走らせよ、ただし速い検査が振る舞いの検証を置き換えてはならない【二次】https://www.joshka.net/practice/rules/testing/test-run-fast-format-and-lint-gates-early/ (Josh McKinney, 2026、2026-10-23 取得)
- Bazel の順序づけの実務は未確認(§5)

検査定義の陳腐化:

- CI 側の対策: 必須ステータスチェックは「Require branches to be up to date before merging」(strict)が**既定**【一次】https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets (2026-10-23 取得)。マージキューは「対象ブランチの最新版に適用したときに必須チェックが通る」ことを保証し、`merge_group` で起動しないと必須チェックが報告されずマージが失敗する【一次】https://docs.github.com/en/enterprise-server@3.20/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue (2026-10-23 取得)
- 依存の固定と自動更新: `pre-commit autoupdate` は既定で最新タグへ、`--freeze` でタグの代わりにコミットハッシュを `rev` に書く【一次・man ページの写し】https://www.mankier.com/1/pre-commit-autoupdate (2026-10-23 取得)。pre-commit.ci は週次(既定)で autoupdate の PR を出す(上掲)。Renovate は `helpers:pinGitHubActionDigests` でアクションをダイジェスト固定し、タグに合わせて更新、`.github/workflows/actions.lock` があれば再生成する【一次】https://docs.renovatebot.com/modules/manager/github-actions (2026-10-23 取得)
- GitHub Actions のワークフローロックファイル(推移的な依存と再利用ワークフローをコミットに固定、`gh actions-lock` で生成と陳腐化の検査、「Require lockfile」ポリシー)が 2026-10-14 に public preview【一次】https://github.blog/changelog/2026-10-14-github-actions-workflow-lockfiles-in-public-preview/ (2026-10-23 取得)。ポリシー側は「ロックファイルに固定されていない `uses:` を持つワークフローの実行を止める」【一次】https://docs.github.com/en/actions/how-tos/administer/control-workflow-execution (2026-10-23 取得)。これは**実行前に止める**製品機能だが、止める対象は依存の固定漏れであり「基底で検査定義が変わったか」ではない
- 基底のワークフローで検査する形: `pull_request_target` はワークフローを**基底の既定ブランチ**から読み、トークンと秘匿情報を持つ。PR の head を checkout して実行すると「pwn request」になる。GitHub は公開リポジトリで `pull_request_target` を既定で止めるポリシーを評価モードで導入し、2026-11-02 に強制予定【一次】https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target (2026-10-23 取得)。基底の定義で検査する仕組みは、信頼の境界を越えるため安全上の代償が大きい
- 手元の実行を、基底の検査定義が変わっていたら拒否する製品先例は見つからなかった。近い二次例は、push 前に main を取り込んで衝突時だけ止めるフック【二次】https://dev.to/pratiktalreja/keeping-branches-in-sync-in-a-monorepo-the-pre-push-hook-solution-3c0f (Pratik Talreja, 2025-09-24、2026-10-23 取得)。定義の変化に限って止める根拠は、起票側の 1 事例(がんばりクエスト)に留まる

### 2.3 配布・公開の保護(#281)

GitHub Environments:

- 参照された環境が存在しなければ、その名前で**自動作成**され、保護規則も秘匿情報も持たない(暗黙の Pages ビルドだけは配布元ブランチの規則が付く)。ワークフローを編集できる者は誰でもこの方法で環境を作れ、設定は管理者だけができる【一次】https://docs.github.com/en/enterprise-cloud@latest/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments (2026-10-23 取得)
- 配布ブランチの選択肢は「制限なし」「保護ブランチのみ」「選択したブランチとタグ」。規則はワークフロー実行の `GITHUB_REF` に照合される。「保護ブランチ」はブランチ保護規則が有効なブランチを指し、ルールセットへの言及は無い【一次】https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments (2026-10-23 取得)
- 必須レビュアは最大 6 名・チームで 1 名の承認で進む。起動者自身の承認を禁じる「Prevent self-review」がある。**既定では管理者が保護を迂回できる**ので、迂回不可は明示的に設定する(同上)
- 利用条件: 公開リポジトリは全プラン、非公開・内部リポジトリは Pro / Team / Enterprise(同上)
- `workflow_dispatch` の起動元ブランチを Environments で止められるかを、GitHub の文書は直接書いていない。`GITHUB_REF` 照合の一般規則から導ける(推論)

ルールセットと起動の統制:

- Restrict creations / updates / deletions はバイパス権限を持つ者だけに作成・push・削除を許す。Block force pushes と Restrict deletions は既定で有効。対象はパターンに一致するブランチ・タグで、既定ブランチに限らない。バイパス対象は役割・チーム・GitHub App(デプロイキーの記載は頁に無い)。必須ステータスチェックは発行元の GitHub App を指定でき、別の主体が状態を立てるとマージを止める【一次】rulesets の頁(§2.2 と同じ URL)
- ワークフロー実行の保護(Actions policies): 既定では書き込み権限を持つ全員がワークフローを起動できる。actor 規則で起動できる人・bot・チームを、event 規則で許す起動イベント(`workflow_dispatch` を含む)を限定でき、ワークフローのパス単位に絞れる。Evaluate モードは Enterprise Cloud のみ。**ブランチ・ref による制限はこの頁に無い**【一次】https://docs.github.com/en/actions/how-tos/administer/control-workflow-execution (2026-10-23 取得)
- コミュニティでは、`workflow_dispatch` の起動者を絞る手段としてルールセット(ブランチの作成・更新を制限)、CODEOWNERS による起動者確認、Issue 起動の特権ワークフローが挙がり、Actions policies は効かなかったという報告も混じる【二次・コミュニティ】https://github.com/orgs/community/discussions/49688 (2023-03〜2026-08、2026-10-23 取得)

来歴と外部評価:

- SLSA Provenance v1 は `externalParameters` に利用者が渡した値(例は `repository` と `ref`)、`resolvedDependencies` に解決したコミット(`gitCommit`)を置く例を示す。`externalParameters` は信頼できない入力で下流で検証しなければならず(MUST)、検証者は想定外の値を拒否すべき(SHOULD)とする。ただし ref の記録自体は必須と書かれていない【一次】https://slsa.dev/provenance/v1 (2026-10-23 取得)。範囲(来歴と完全性、コード品質は範囲外)は FND の SRC-0415
- OpenSSF Scorecard: Branch-Protection は**既定ブランチとリリースブランチ**を対象に、強制 push と削除の禁止を第 1 段(3/10 点)とする。Dangerous-Workflow は危険な起動イベントと PR の明示的 checkout の組合せ、および context 変数の実行コードへの流入を検出する。Token-Permissions は最上位を `read-all` か `contents: read` にし、書き込みはジョブ単位で必要な分だけと勧め、`contents` 書き込みを「レビューされないコードをコミットさせうる」と説明する。Pinned-Dependencies はワークフローのハッシュ固定を求める【一次】https://github.com/ossf/scorecard/blob/main/docs/checks.md (2026-10-23 取得。SRC-0574 と同じ)
- 配布ブランチが「リリースブランチ」に数えられるかは Scorecard の文書から判断できない(§5)

孤立した配布ブランチへの強制 push:

- peaceiris/actions-gh-pages の `force_orphan` は「最新のコミットだけを持つ公開ブランチを作る」。gh-pages 系の配布で履歴を捨てて強制 push する形は広く使われている【一次・ツールの説明】https://npmjs.org/package/actions-github-pages (2026-10-23 取得)。利用の広さは計測していない(推測)
- GitHub Pages の公式文書は、独自ビルドなら Actions のワークフローで公開することを勧め、テンプレートは `github-pages` 環境を使い(無ければ自動作成)、**既定ブランチだけがその環境へ配布できる保護規則を足すよう勧める**。ブランチ公開の配布元は「任意のブランチでよい」とし、強制 push には触れない【一次】https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site (2026-10-23 取得)
- つまり公式の方向は「ブランチへ強制 push して配る」から「環境の保護を伴う配布(アーティファクト)」へ寄っている。強制 push する配布ブランチ自体を守る公式の作法は見つからず、使えるのはルールセットの Restrict updates(バイパスを配布用の GitHub App 等に限る)と、Environments の配布ブランチ規則の組合せになる(推論)

### 2.4 CI の検査一覧を 1 か所に置く(#276)

- GitHub には、必須チェック名がワークフローのジョブ名と一致するかを検査する公式機能は見つからなかった。必須チェックは PR の head に実際に現れた名前と照合されるため、ジョブ名を変えると保護を更新するまでマージが止まる。同名のチェックとコミット状態が両方あると両方の通過が必要【一次】troubleshooting の頁(§2.1)
- 実務の対処(いずれも二次):
  - 常に走る集約ジョブを 1 つだけ必須にし、選択は集約の中で fail closed にする。文書に正規の名前を置き、ワークフローが必須ジョブ名を含むことを CI で表明する(ただし保護設定そのものは API で検査しない)【二次】https://qaskills.sh/blog/ci-required-checks-branch-protection (2026-08-08)
  - 必須チェックとワークフローの対応表を運用文書に置き、名前の変更時は文書を先に直し、保護の必須コンテキストと最新実行のジョブ名を比べる手順を持つ【二次・個別リポジトリ】https://git.polymech.info/polymech/zeroclaw/src/tag/v0.1.8/docs/operations/required-check-mapping.md (2026-10-23 取得)
  - ワークフロー・必須チェックの JSON・契約ファイル・文書の 4 者で必須チェック名を突合し、乖離報告を出すエージェント用スキル【二次・スキル登録簿】https://tessl.io/registry/skills/github/jscraik/diagram-cli/ci-check-name-parity (2026-10-23 取得)
- actionlint はワークフローの構文・式・型の静的検査で、ブランチ保護との突合は範囲外(公式の checks 文書は今回取得していない。§5)。zizmor はワークフローの安全性(危険な起動イベント、過剰な権限、固定されない `uses:`)を監査する静的解析(検索結果の要約のみ、本文未読)
- 本リポジトリのテンプレート側には、構成 ⇄ CI ⇄ ブランチ保護を突合する `verify-gate-contract.mjs` が既にある(`issues-context.md`)。外部の二次例と同じ型の検査であり、正本側に同じ型の検査が無いことが #276 の論点

## 3. 選択肢

決めない。各論点で、採りうる案を対立する形で並べる。

### 3.1 #277 検査対象の不在

- A1: 標準へ「検査の対象が存在しないとき、検査を通過として扱わない」と置き、G-5 の「対象なし」を**明示の記録による例外**として位置づけ直す(pytest・Jest・ESLint 型。既定で失敗、明示で通過)
- A2: 標準は G-5 の現行規定(記録したうえで通過、実装後は禁止)のままとし、新しい文は置かない。配布物の検査の欠落は実行層(`check-gate-criteria.mjs` の `existsSync` 分岐)の不備として直す
- A3: 「未実施・対象なし・通過」を記録上の別の値として残すことを要求する(GitHub rulesets・秘匿情報規則型)。合否は対象なしを通過に丸めてよいが、記録で区別する
- A4: 対象の不在は検査ごとに「通過側か失敗側か」を宣言させる(go test・Codecov の既定通過を排除しない)

### 3.2 #280 手元と CI の境界

- B1: 「手元の通過は公式判定ではない、判定は CI(サーバ側)」を標準の規範に置き、実装マークでテンプレートへ接続する(Pro Git、pre-commit.ci の立場)
- B2: 段内の順序(安い検査を先に)を規範にする / 手引きに留める / 書かない(二次の実務は「層ごとに選べ」で、一律の fail-fast を勧めてはいない)
- B3: 検査定義の陳腐化への対策を、(a) CI 側の strict・マージキューで担保すると書く、(b) 手元で基底の検査定義の変化を検知したら止める規律を書く、(c) 依存の固定と自動更新(ロックファイル、autoupdate、Renovate)を求める、のいずれか・組合せとする。(b) の製品先例は見つかっていない

### 3.3 #281 配布の保護

- C1: 実行層だけで閉じる(Environment の配布ブランチを main に限る、ジョブ先頭の ref 確認、ファイルの外で止めている事実の文書化)。標準へは書かない
- C2: 標準の `ci-gates.md`(デプロイゲート)か `risk-catalog.md` へ「配布の起動元を、起動元のワークフローのファイルの外で制限する」1 節を置く(EV マーク付き)
- C3: 配布の形そのものを、強制 push する配布ブランチから、環境保護を伴うアーティファクト配布(Pages の Actions 公開の型)へ寄せることを検討対象にする
- C4: 配布ブランチをルールセットで保護し(Restrict updates / Block force pushes のバイパスを配布用の主体だけに)、強制 push を「配布用の主体だけに許す」と明記する
- 各案に共通: 環境の自動作成(保護なし)と管理者の既定迂回をどう扱うか。来歴(SLSA)に起動元の ref と解決コミットを残すか

### 3.4 #276 検査一覧

- D1: 一覧文書を 1 か所に置き、スクリプトで `package.json` の `check`・`ci.yml`・`CLAUDE.md` と突合する(テンプレートの `verify-gate-contract.mjs` と同型)
- D2: 一覧文書を置かず、`package.json` の `check` を唯一の正とし、他の文書は参照だけにする(書き写しをやめて乖離の源を消す)
- D3: CI は集約ジョブ 1 本を必須にし、集約が含む検査の一覧を集約自体に出力させる(文書ではなく実行記録を正にする)

## 4. 会議体への問い

1. #277 の 1 文案「対象が存在しないとき通過として扱わない」と、G-5 の「対象なしとして記録したうえで通過させる」は、外部の「既定で失敗・明示で通過」型として両立させられるか。それとも別の規範として衝突するか
2. 配布物の検査の欠落(`existsSync` 分岐)は、標準の規範の欠落か、実行層の実装不備か。後者なら標準に文を足す理由は何か
3. go test・GitHub のジョブ条件スキップ・Codecov のように既定で通過させる製品を使う案件に、標準はどこまで追加の設定を求めるか
4. 「手元の通過は公式判定ではない」を規範にするとき、強制の主体(CI・ルールセット)を標準が名指すか、役割として抽象化するか
5. 段内の順序づけは信頼性に効く規範か、効率の手引きか。並列で全件を報告せよという反対の要請とどう折り合うか
6. 基底で検査定義が変わったときに手元の実行を止める規律は、製品先例が無く根拠が 1 事例である。CI 側の strict・マージキューで足りるのではないか。入れるなら EV マークの水準は
7. 配布の保護を標準の条項にする根拠は publishing-hub と本リポジトリだけである。GitHub Pages の公式推奨(既定ブランチだけが配布できる環境保護)を外部根拠として数えてよいか
8. 強制 push する孤立配布ブランチという形自体を許容するか。許容するなら、守る手段をルールセット・Environments・ジョブ内確認のどれに置くか(Environments は既定で管理者が迂回でき、存在しない環境は保護なしで作られる)
9. 来歴の記録(ADR-0052 決定2)に、起動元の ref と解決コミットを区別して残すことを求めるか(SLSA は ref を必須としない)
10. 検査一覧の「1 か所」は文書か、`package.json` か、実行記録か。乖離を検査する方向(文書 → CI、CI → 文書、保護設定まで)をどこまで求めるか

## 5. 確認できなかったこと

- 「CI が唯一の正(source of truth)」を明言する Google・GitHub の公式文書。今回は検索で見つけられなかった
- Bazel・大規模組織における段内の検査順序の公式な実務指針
- coverage.py の公式文書での `NoDataError` 時の終了コード(二次の写しで例外の存在だけ確認)
- Jest の頁に、既定(フラグ無し)で対象なしが失敗すると明記する文があるか(フラグの説明から導いた)
- SonarQube が解析対象の無いプロジェクトで品質ゲートをどう判定するかの公式記述(fudge factor 以外)
- Environments の「保護ブランチのみ」がルールセットで保護したブランチを含むか(文書はブランチ保護規則とだけ書く)
- `workflow_dispatch` の起動元ブランチが配布ブランチ規則で実際に拒否されることの公式明記(`GITHUB_REF` 照合からの推論)
- OpenSSF Scorecard が強制 push される配布ブランチを「リリースブランチ」として扱うか
- actionlint の公式 checks 文書、zizmor の公式文書の本文(検索結果の要約のみ)
- 手元の検査を、基底で検査定義が変わったことを理由に拒否する製品・OSS の先例(見つからなかった。不在の証明ではない)
- gh-pages 型の強制 push 配布がどの程度使われているかの計測
