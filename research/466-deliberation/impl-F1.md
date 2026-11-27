# 段 F1(試験用リポジトリでの実機の確認)— 実装の結果

- 日付: 2026-11-28。template は `d4-466`(段 D1 の 40bf76e まで)を `git archive` で scratch へ取り出して使った。template・本体のファイルは変えていない。作業は scratch の `trial-466/`(`t/` が取り出し、`repo/` が試験用の複製)

## 1. 許しの条件を守った記録

| 条件 | 結果 |
| --- | --- |
| 1 名前・private | `Takenori-Kusaka/pit-in-trial-466-tmp`。作る前に 404 を確認。作成後 `private: true`(PRIVATE)を確認 |
| 2 秘密情報 | secrets 0 件・variables 0 件(API で確認)。コミットの作者は `22556919+Takenori-Kusaka@users.noreply.github.com` だけ(全コミットの一意の作者を API で確認)。名簿の人名は架空(試験 甲・乙・丙)。甲だけが所有者のアカウント(ログイン名・数値 ID)、乙・丙は存在しない架空のログイン名 |
| 3 ほかへ触れない | 触れたのは試験用リポジトリの中だけ(push・PR・レビュー・workflow_dispatch)。ほかのリポジトリ・アカウントの設定は読み取りも含め触れていない(自分の一覧の読み取りを除く) |
| 4 削除 | `gh auth status` で `delete_repo` を確認してから作成。終了時に `gh repo delete --yes`。その後 `gh repo view` が「Could not resolve to a Repository」、`gh api repos/...` が 404 Not Found、アカウントの一覧に名が無いことを確認。**消えた** |
| 5 scratch | 手元の作業は scratch のみ |

使った Actions の実行: ワークフローの実行 57 件(ai-review 5・delegation 14・gate-g5 7・gate-g5-base 7・gate-g5-push 11・pre-review-responded 5・review-queue-control 8)。1 実行は数秒〜十数秒のジョブの集まり。うち手動の起動は 1 回(review-queue-control の dry-run)。

## 2. 構成の作り方(再現の手順)

1. 取り出した template を複製し、`git init`。`.github/CODEOWNERS` の `@OWNER` を所有者のログイン名へ置換(初期化の事前点検が止める)
2. `generate-profile.mjs --answers`(q-team-size=size-3-9・q-biz-phase=mvp・標準品質・cl0・inhouse・gates-none・ai-free、`--stack node`)。結果: ルールセット `team-core`、`review.requiredApprovals` 0、G-6 は core-only
3. 名簿と席を `--change`(kind accountable)で置く。**D-0 を先に `templates/` から写す**ことと、**席の兼務禁止を避けるため 3 名が要る**ことが要った。初回の記名は D-0 表1 の決定者の席(事業決裁者)の責任者(乙)
4. コア機能のパスを `--change`(kind mode、`delegation.protectedPaths: ["src/core/**"]`)で宣言。手で `process.config.json` を書き換えると「変化点の記録を経ずに書き換えられています」で止まる(統制が効いている。副産物)
5. パスは追跡中のファイルに当たる必要がある(`src/core/core.js` を main へ足すまで「未宣言」と同じ扱いになった。これは §3 の項目 1c の確認を兼ねた)

## 3. 項目ごとの結果

| # | 確かめたこと | 結果 | 証拠の要点 | template の所在 |
| --- | --- | --- | --- | --- |
| 1a | team-core ルールセット(承認数 0+必須チェック)を GitHub が受け付けるか | **確かめられなかった** | `POST rulesets` が 403「Upgrade to GitHub Pro or make this repository public」。ブランチ保護の `PUT` も同じ 403。private かつ無償のプランでは、ルールセットもブランチ保護も使えない。公開は許しの条件(private)に反するため行っていない | `.github/rulesets/team-core.json` |
| 1b | 非コアの PR が承認なしで通る(必須の検査 gate-g5-base が成功) | **動いた(検査の側だけ)** | PR #3(`src/app/other.js` のみ)の gate-g5-base 成功。ログ: 「G-6 の承認者 0 名 / 要求 0 名。コア機能に触れない変更のため、取り込む前の承認は求めない」。pr-rules も成功。**ルールセットを当てていないため、マージまで通したわけではない**。また gate-g5 のほかのジョブ(test・static-analysis・gate-contract)は試験用の中身が空のため落ちた(試験の足場の事情。gate-contract は `git merge` の失敗で、この変更とは無関係の環境差の疑い) | `check-pr.mjs`・`gate-g5-base.yml` |
| 1c | コア機能に触れる PR が承認なしで止まる | **動いた** | PR #2(`src/core/core.js`)の gate-g5-base 失敗。ログ: 「コア機能に触れる変更の承認: …独立した人の承認 0 名 / 要求 1 名」「当たったパス: src/core/core.js」 | 同上 |
| 1d | 別の人の承認で通る側 | **確かめられなかった** | 所有者のアカウント 1 つ。自分の PR への承認は GitHub が拒む(「Review Can not approve your own pull request」)。名簿の乙・丙は実在しない | — |
| 1e | 本人の意見のレビュー(COMMENTED)を付けて再実行しても通らない | **動いた** | PR #2 に本人の COMMENTED(挙動要約つき)を付け、gate-g5-base を再実行(attempt 2)。PR_REVIEWS に入ったが「独立した人の承認 0 名」のまま失敗 | `check-pr.mjs` |
| 1f | コア機能のパスが未宣言の構成で全 PR に承認を求める | **動いた** | PR #1(宣言の `src/core/**` が当たる追跡ファイルが無い時点。非コアのファイルを足す PR)。ログ: 「コア機能のパスが未宣言のため、全 PR に承認を求めます」。D1 の「当たる追跡ファイルが無い宣言は未宣言扱い」と一致 | `config.mjs` `corePathsOf` |
| 1g | 品質「高」の 2 名・PR_REVIEWS の取得 | **確かめなかった** | 構成を作り直す必要があり、実行の上限と、1 名のアカウントでは 2 名の側を確かめられないため。PR_REVIEWS の取得そのものは 1e で動いた | — |
| 2a | 委任の判定(delegation.yml)が既定の GITHUB_TOKEN で動く | **動いた** | 全 PR で delegation-check 成功。コミットステータス `delegation-eligibility` が success で投稿された(権限 statuses: write)。判定は「該当しない(協働)」で、表が PR の要約に出た | `.github/workflows/delegation.yml` |
| 2b | 事故の後の警告・「働いていない検知」の名が注記に出る | **確かめられなかった** | 警告は変更種別と規則が登録された PR(`autonomyType` が導かれる PR)でしか出ない(`delegation.mjs` 376 行)。登録を試みたが、`--change` が「開発者の席を委任にできません: 適合性確認の記録がない」「D-0 表10 の F.2 の Q1 を「いいえ」と読めない」で拒んだ。前提の整備(適合性確認の記録・D-0 表10)が別に要り、この段では行わなかった | — |
| 2c | 記録用ブランチの判定記録を、権限と checkout の設定で読める | **確かめられなかった** | 2b と同じ理由で、記録を読む経路が動かなかった。`fetch-depth: 0`・`persist-credentials: false` で他ブランチが取れるかは未確認(checkout 自体は成功) | `delegation.yml` |
| 3a | review-queue の `queue` ジョブが `commits/<sha>/statuses` を既定の権限で読める | **動いた** | dry-run(workflow_dispatch)成功。GITHUB_TOKEN の権限に `Statuses: read`。PR #1 に delegation-eligibility のステータスがある状態で例外なく完了。出力: 「注意: 同時保有の上限を定めていない…」「通知 0 件」 | `review-queue-control.yml` の `queue` ジョブ |
| 3b | `risk-label` ジョブが動く | **動かなかった(不具合)** | PR を開く・編集するたびに risk-label が失敗。§4-1 | `review-queue-control.yml` の `risk-label` ジョブ |
| 3c | 同時保有数からの除外 | **確かめなかった** | 既定(`DELEGATED_MERGE_ENABLED` が空)では除かない設計。`DELEGATED_MERGE_ENABLED` は未設定のまま。除外の側は委任の PR が「該当」にならず確かめられない | — |
| 4 | 委任のマージの経路・署名を要する構成 | **確かめない(ruling §12)** | 実行していない | — |

## 4. 動かなかった点・template の不具合

1. **review-queue-control の `risk-label` ジョブが毎回 403 で失敗する**
   - 所在: `.github/workflows/review-queue-control.yml` の `risk-label` ジョブ(権限は `contents: read` と `pull-requests: write` だけ)。同じファイルの `queue` ジョブには `statuses: read` がある
   - 原因: `scripts/gate/review-queue.mjs` の `fetchSnapshot`(309 行)が `repos/<repo>/commits/<sha>/statuses` を読む。`risk` モードもこの関数を通るため、`statuses: read` が無い `risk-label` では `gh: Resource not accessible by integration (HTTP 403)` で落ちる。ログ: `Error: Command failed: gh api --paginate --slurp repos/.../commits/<sha>/statuses?per_page=100`
   - 再現: 試験用リポジトリへ template を入れて PR を 1 件開く(実行 46036816322 など)。必須チェックではないので PR は止まらないが、リスク区分の一次判定のラベルが付かない(IMPL の「一次判定」が実機で働かない)
   - 直し方の見立て: `risk-label` の permissions に `statuses: read` を足す。または `risk` モードでは statuses を読まない(`fetchSnapshot` の `only` で分ける)。後者のほうが最小権限に沿う
   - 段の位置づけ: 段 B(委任の経路)で `fetchSnapshot` に statuses の読み取りを足した変更の取りこぼし。impl-B.md の「statuses: read で読めること(固定の応答でだけ確認)」の未確認の点が実機で顕在化した
2. 初期化の事前点検は、`.github/CODEOWNERS` の雛形 `@OWNER` が残ると初期化を止める。試験用リポジトリでは所有者のログイン名へ置換した。不具合ではなく仕様(README の手順どおり)だが、`/process-init` の案内を読まずに非対話で通すと最初に当たる
3. gate-g5 の `gate-contract` ジョブが、試験の実行中の `git merge -q --no-ff` で落ちる(`Merge pull request #7 from o/feat`)。CI 環境の git の設定(user.name 等)が無い疑い。**この段の変更に起因するかは未調査**(段 A〜C・D1 の前から同じ可能性。c8d4e27 の素の版では確かめていない)。議長が調べるか判断する

## 5. 実装マークを undelivered のまま残すべき規定(実機で確かめられなかったもの)

- S1 の承認数 0 のルールセット(team-core)を GitHub が受け付ける点 — プラン制約(private+無償)で確かめられていない。IMPL(承認数 0 の開示)は `state=undelivered` を維持する(D1 §7 の指示どおり)
- 別の人の承認の後の再実行で通る側、承認後の push での承認の失効(`require_last_push_approval` 側を含む) — 1 アカウントで確かめられない
- 事故の警告・働いていない検知の注記が `delegation-eligibility` の PR の注記に出ること — 登録の前提の整備が要る
- 記録用ブランチの判定記録の読み取り(delegation.yml の checkout の設定) — 同上
- 品質「高」の 2 名
- 委任のマージの経路・署名を要する構成(ruling §12 で確かめない)

実機で確かめられた(マークを進めてよいか議長が判断)もの: 非コアの PR の gate-g5-base 成功(要求 0)、コア機能の PR の失敗(要求 1)、未宣言で全 PR に承認、本人の意見のレビューは数えない、委任の判定が既定の権限で動く、review-queue の `queue` ジョブが statuses を読める。ただし「PR がマージできる/できない」はルールセットが無いため、検査の結論の段階までである。

## 6. 案D へ退くべきかの見立て(ruling §12 の条件)

- 条件「承認数 0 と必須の検査の組み合わせが、非コアの変更を通し、コア機能の変更を止める」のうち、**検査の側(必須にする gate-g5-base が非コアで成功し、コアで失敗する)は実機で確かめられた**。**ルールセットの側(承認数 0 と必須チェックの組み合わせを GitHub が受け付けるか、PR を実際にマージできる/できないか)は確かめられていない**。原因は試験用リポジトリが private で無償のプランであること(ルールセットもブランチ保護も 403)で、許しの条件(private)の範囲では確かめる手段が無い
- 見立て: 案D へ退く根拠は出ていない(動かなかった点は検査の側ではなく、確かめる手段の側)。一方で、組み合わせの受理は GitHub の仕様に依るため、採用者が private・無償のプランでは**そもそもルールセットを適用できず**、ルールセットに頼る強制(S1 の承認数 0 も案D の承認数 1 も同様)が使えない点は、案の優劣と別に議長へ上げる価値がある(template/README の前提の確認)
- 確かめるには、所有者が公開の試験用リポジトリ(秘密情報なし)の使用を許すか、GitHub Pro のアカウントの許しが要る。議長が決める

## 7. 議長へ渡すこと

- §4-1 の不具合(risk-label の権限)。template を直す段が要る(最小の直しは `statuses: read` の追加か、risk モードの statuses 読み取りの除外)
- §4-3 の gate-contract の失敗の原因の調査
- §6 のルールセットの受理の確認の手段(公開リポジトリか Pro か)の決定
- 試験用リポジトリは削除済み。scratch の `trial-466/` は手元に残っている(`repo/` は GitHub への参照を持たない複製)
