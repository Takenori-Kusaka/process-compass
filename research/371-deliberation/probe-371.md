# #371 実機の確認(E-1〜E-15)

- 実施日: 2026-11-05
- 根拠: 所有者の判断(2026-11-05、ダイアログで「public の一時リポジトリで行う」)。裁定 `decision.md` R-4
- 一時リポジトリ: `Takenori-Kusaka/pit-in-trial-371`(個人所有・public・無償のプラン)。確認の後に削除する
- 中身: 準拠テンプレート(`template/` の作業ツリーのうち git の追跡下のファイル、コミット e64ccbe)の写しだけ。秘密情報・`.env`・トークンは置かない
  - 除いたもの: `.github/dependabot.yml`(Dependabot を動かさないため)
  - 変えたもの: `CODEOWNERS` の `* @OWNER` を `* @Takenori-Kusaka` へ(事前点検が止めるため)
  - 構成: `generate-profile.mjs --answers`(size-1-2 / poc / quality-standard / cl0 / inhouse / reviewer-no / gates-none / ai-free)、D-0 を `templates/00-d0-governance.md` から複製
- 操作の主体: すべて所有者のアカウント `Takenori-Kusaka` の gh(1名)。別の人のアカウントは使わない

## 進捗

- [x] 手元で写しを作り、構成を生成した。手元の `g5-local.mjs` は pr-rules の「--base が無い」以外は通過(手元の実行で、PR の検査は実施されない)
- [x] リポジトリの作成と push(2026-11-05 17:25 頃。`gh repo create Takenori-Kusaka/pit-in-trial-371 --public`、`git push origin main`)
- [x] main にルールセット `checks-only`(雛形のまま。必須チェック `gate-g5`、`integration_id` なし)を適用(id 26597769)
- [x] E-1〜E-15(確かめていない: E-7 の本題・E-12・E-13。理由は各項目)

## 結果の一覧

| # | 判定 | 要点 |
| --- | --- | --- |
| E-1 | 前提と合う | 集約を `exit 0` にした PR で gate-g5 success、マージ可能 |
| E-2 | 前提と合う | `CONTROL_FILES=[]` の PR で陰性の確認が外れた(pr-rules success) |
| E-3 | 前提と合う | 本来の gate-g5.yml を消し、別のワークフローの同名ジョブで必須を満たした。送り手を Actions に固定しても区別されない |
| E-4 | 前提と合う+形の制約 | `pull_request_target` の check run は PR の先頭に付き必須に数えられ、PR の側の同名の成功で上書きされない。commit status の形は PR の側が後から上書きできる |
| E-5 | 前提と合う | マージ時は PR の変更を含む定義で動く。閉じただけの PR は PR の定義で動き、`if: merged` を消せば `contents: write` で動く(コメントは誤り) |
| E-6 | 前提と合う | verify の `ref:` を head に替えた定義で動いた |
| E-7 | 確かめていない | 別のコード所有者が要る。作成者が唯一の所有者だと、コード所有者のレビューは何も止めない |
| E-8 | 使えない | `required_reviewers` は「Repository must be in an organization」 |
| E-9 | 使えない | repo のルールセットで `workflows` 規則は 422。個人に組織のルールセットは無い |
| E-10 | 使えない | push のルールセットは「only org-owned repos」「public repos cannot」 |
| E-11 | 前提と合う(範囲つき) | fetch+diff だけの形で、PR の `.gitattributes`・`.gitmodules` は実行の経路にならなかった。gitlink は未確認 |
| E-12 | 確かめていない | フォークに別のアカウントが要る |
| E-13 | 確かめていない | 別のアカウントが要る。作成者本人の承認は拒否される |
| E-14 | 前提と合う | PR の側のワークフローが `statuses: write` で context gate-g5 を出し、送り手を固定しても通った。利用者のトークンの status は固定で止まった |
| E-15 | 一部を確かめた | `pull_request_target` は PR の基底(side)に依らず既定ブランチ(main)の定義で動く |

## 裁定への含意(実機の結果から)

- R-1・R-2 の前提(定義もスクリプトも PR の側で動く、同名・同送り手で結果を出せる、送り手の固定は Actions の内側を区別しない)は、すべて実機で裏づけられた。裁定を改める食い違いは無い
- 手段の例に `pull_request_target` を挙げる場合、基底の判定は **check run(ジョブの結果)で出し、commit status で出さない**ことを条件に書く必要がある(E-4)。commit status は同じ context の最新の値が効き、PR の側のワークフローが上書きできる
- 個人所有・public・無償のプランで使えたのは、`pull_request_target` の check run を必須にする形だけ。required workflows・パス単位の必須レビュアー・push のパスの制限は使えない(E-8〜E-10)。コード所有者のレビューは、1名の構成では何も止めない(E-7)
- `record-copy.yml` のコメント(60 行目)の誤りと、閉じただけの PR で PR の定義が `contents: write` で動く経路(E-5)を、本件の申し送りに加える

## 結果

### 準備で分かったこと(項目の外)

- 写しは作業ツリーから取ったため、ファイルは CRLF のまま(手元の `core.autocrlf=true` の取り出し)。ワークフローの実行には影響しなかった
- アダプタ `none` の `test`・`secretScan` が空だと gate-contract が止まる。確認のため、`adapters/none.json` の2つに何もしない `node -e` を書いた(main へ直接 push。ルールセットの適用の前)
- 構成した直後の main では、gate-contract の `test-edition-end.mjs` が「台帳・判定記録・D-0 節7 の空欄・席の未記入」等で失敗する(run 41994888893)。この失敗は PR でも出る。以降の項目では、この既存の失敗を「基準の失敗」として、書き換えで gate-g5 が通るかを見る
- 確認用に main へ `probe-prt.yml`(`pull_request_target`。基底の定義で PR の先頭を fetch して diff だけを読み、PR の先頭へ commit status `base-judge-status` を出す)を置いた。E-15 用に、`side` ブランチへ同じ定義の印だけ替えた版(`side-v1`)を置いた

### E-1 書き換えた gate-g5.yml で必須チェック gate-g5 が通るか

- 手順
  1. 基準: PR #1(`probe/e1-baseline`)— `scripts/gate/check-pr.mjs` の先頭にコメント1行を足すだけ(統制の設定の変更。陰性の確認の節なし)
  2. 書き換え: PR #2(`probe/e1-tamper`、#1 の上)— `gate-g5.yml` の集約ジョブの `needs` から `pr-rules` を外し、`run:` の先頭に `exit 0` を入れる
  3. `gh pr view N --json mergeStateStatus`、`gh api repos/.../commits/<head>/check-runs`
- 観測
  - PR #1: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995219516 — gate-contract failure、pr-rules failure(陰性の確認の節なし・リスク区分の節なし)、**gate-g5 failure**。`mergeStateStatus=BLOCKED`
  - PR #2: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995229002 — PR の側の定義で動いた。gate-contract failure(契約検査 IMPL-0142 が「pr-rules が集約の合否に使われていない」を検出)、pr-rules failure(陰性の確認の節なし)、**gate-g5 success**。`mergeStateStatus=UNSTABLE`(必須は満たし、必須でない失敗だけが残る = マージできる状態)
  - 必須チェック `gate-g5` の check run の送り手は `github-actions`(app id 15368)
- 判定: **裁定の前提と合う**。`pull_request` のワークフローは PR の側の定義で動き、集約を書き換えた PR は必須チェックを通ってマージ可能になる。契約検査は書き換えを検出したが、その結果も集約が読まなければ合否に効かない(契約検査そのものも PR の側で動く)

### E-2 CONTROL_FILES を空にした PR で、陰性の確認の検査が外れるか

- 手順
  1. 本文を揃える: PR #1 と PR #3 の本文を同じにした(`## 変更の概要` と `## リスク区分` R3 と `Spec: setup`。陰性の確認の節は無い)
  2. 基準: PR #1(`check-pr.mjs` へコメント1行)。本文の編集で gate-g5 が再実行された
  3. 書き換え: PR #3(`probe/e2-empty-control`)— `check-pr.mjs` の `export const CONTROL_FILES = [...]` を `[]` に替えただけ
- 観測
  - PR #1: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995535361 — **pr-rules failure**(「統制の設定(scripts/gate/check-pr.mjs)を変える PR です。PR の本文に「## 統制の設定の陰性の確認」の節がありません」)
  - PR #3: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995546036 — **pr-rules success**(陰性の確認を求めなかった)。gate-g5 は failure だが、原因は準備で述べた gate-contract の既存の失敗だけ
- 判定: **裁定の前提と合う**。判定のスクリプトは PR の側から読まれ、PR が自分の検査の対象を外せる。定義(yml)だけでなくスクリプトの層でも外せることを実機で確かめた(R-2「定義だけを外へ出す構成は要求を満たさない」の根拠)

### E-3 同名のジョブ gate-g5 で必須チェックを偽装できるか(送り手の固定を含む)

- 手順
  1. PR #4(`probe/e3-samename`)— 新しいワークフロー `fake-g5.yml`(`pull_request`、ジョブ名 `gate-g5`、`exit 0`)を足すだけ。本来の gate-g5 は既存の失敗で failure
  2. PR #6(`probe/e3b-samename-delete`、#4 の上)— さらに `gate-g5.yml` を削除する
  3. ルールセットの必須チェックを `{"context":"gate-g5"}` から `{"context":"gate-g5","integration_id":15368}`(GitHub Actions)へ替えて、空のコミットで PR #6 を再実行した
- 観測
  - PR #4: 同じ名前の check run が2つ(本来 failure https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995577102 、偽 success https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995577198)、いずれも app id 15368。`mergeStateStatus=BLOCKED`
  - PR #6(送り手を縛らない): 偽の check run だけ(success、run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995879035)。`mergeStateStatus=CLEAN`
  - PR #6(送り手を GitHub Actions に固定): 偽の check run(run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996013263 、app id 15368)で `mergeStateStatus=CLEAN`
- 判定: **裁定の前提と合う**(R-2)。同じ名前の失敗が1つでも残れば止まるが、本来のワークフローを消すか起動条件を外す PR では、別のワークフローの同名のジョブが必須チェックを満たす。送り手を GitHub Actions に固定しても区別されない(どちらも同じ app)。「送り手の固定は適合の手段に数えない」の根拠になる

### E-14 PR の側のワークフローが statuses: write で commit status gate-g5 を出せるか。送り手の固定で区別されるか

- 手順
  1. PR #5(`probe/e14-status`)— `fake-status.yml`(`pull_request`、`permissions: statuses: write`、`gh api repos/.../statuses/<head> -f context=gate-g5 -f state=success`)を足すだけ
  2. PR #7(`probe/e14b-status-delete`、#5 の上)— さらに `gate-g5.yml` を削除する
  3. 送り手の固定(15368)の有無で比べた。対照として PR #8(`probe/e14c-user-status`、`gate-g5.yml` の削除だけ)へ、所有者の gh のトークン(利用者のトークン)で commit status `gate-g5` success を出した
- 観測
  - 同じリポジトリのブランチからの `pull_request` のワークフローは、自分の定義で宣言した `statuses: write` を得て commit status を書けた(creator `github-actions[bot]`。run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41995585569)
  - PR #5: 本来の check run gate-g5 failure と、status gate-g5 success が並ぶ。`BLOCKED`
  - PR #7: status gate-g5 success だけ。固定なしで `CLEAN`。**固定(15368)ありでも `CLEAN`**(run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996011328)
  - PR #8(利用者のトークンの status): 固定ありで `BLOCKED`、固定なしで `CLEAN`
- 判定: **裁定の前提と合う**(R-2)。送り手の固定が止めるのは、Actions の外(人・外部のトークン)が出す偽の status だけ。PR の側のワークフローの `GITHUB_TOKEN` が出す status は GitHub Actions の送り手として数えられ、固定では区別されない。内部調査・外部調査の「推測」を実機で裏づけた
- 確認の後、ルールセットは固定なし(雛形のまま)へ戻した

### E-4 pull_request_target のジョブが出すチェックが PR の先頭に付き、必須チェックとして数えられるか(check run と commit status)

- 手順
  1. main の `probe-prt.yml` を v2 にした(PR の差分が `.github/workflows/gate-g5.yml` か `scripts/gate/` を含めば、ジョブ `base-judge` を失敗させ、commit status `base-judge-status` を failure で出す)。ルールセットを一時に無効にして main へ push し、すぐ有効へ戻した
  2. PR #9(`probe/e4-forge-base`)— `gate-g5.yml` を削除し、PR の側に偽装のワークフロー `forge-base.yml` を足す(同名のジョブ `base-judge` を success で出す。別のジョブが 120 秒待ってから `base-judge-status` を success で出し直す)。PR の側の `probe-prt.yml` の印も `PR-SIDE-v1` へ書き換えた
  3. PR #11(`probe/e4-harmless`)— 統制の設定に触れない変更(対照)
  4. ルールセットの必須チェックを、`base-judge-status` だけ / `base-judge` だけ / `base-judge`(送り手 15368)だけ、と順に替えて `mergeStateStatus` を見た
- 観測
  - `pull_request_target` の run は **基底(main)の定義**で動いた(印 `main-v2`。PR が書き換えた `PR-SIDE-v1` は使われない。`GITHUB_REF=refs/heads/main`)。run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996333978
  - check run `base-judge` の `head_sha` は PR の先頭のコミット(PR #11 で `9b031c0` と一致)。必須チェックとして数えられた: PR #11 は `base-judge` success で `UNSTABLE`(必須は満たす)、run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996781708
  - PR #9: 基底の `base-judge` failure と、PR の側の同名の `base-judge` success が並ぶ。必須を `base-judge`(固定なし・固定あり)にすると **`BLOCKED`**
  - PR #9: commit status は、基底の failure(08:40:55)の後に、PR の側が success(08:42:52)を出し直し、最新の値が success になった。必須を `base-judge-status` にすると **`UNSTABLE`(偽装が通る)**
- 判定: **裁定の前提と合う。加えて、形の制約が分かった**。基底の判定を check run(ジョブの結果)で出す形は、必須チェックとして数えられ、PR の側の同名の成功で上書きされない(失敗が1つ残る限り止まる)。commit status で出す形は、同じ context の最新の値だけが効くため、PR の側のワークフローが `statuses: write` で後から上書きできる。**手段の例に `pull_request_target` を挙げるときは、check run(ジョブの結果)で出す形に限り、commit status で出す形を採らない**旨を書き添える必要がある
- 注意: この確認は「基底の判定のジョブが失敗を出す場合」の振る舞いである。判定のジョブがまだ走っていない間(pending)の扱い、判定のジョブが起動しない構成(イベントの種類の漏れ)は確かめていない

### E-11 pull_request_target の判定で PR の先頭を fetch して git diff だけを読む構成が、PR のコードを実行しないか

- 手順: PR #9 に、`.gitattributes` へ `* filter=probepwn diff=probepwn`、`.gitmodules`(pit-in-template を指す)を足した。基底の `probe-prt.yml` は `actions/checkout@v4`(ref = 既定ブランチ、`persist-credentials: false`)の後に `git fetch origin +refs/pull/N/head:...` と `git diff --name-status` だけを行い、作業ツリーの状態・`/tmp` の印のファイル・`.git/modules`・`git config --local`・`.git/hooks` を出力する
- 観測(run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996333978)
  - fetch した先頭は PR の head SHA と一致。diff は `.gitattributes` M・`forge-base.yml` A・`gate-g5.yml` D・`probe-prt.yml` M・`.gitmodules` A を読めた
  - 作業ツリーは clean、印のファイルなし、`.git/modules` なし(submodule は取得されない。checkout の `submodules: false`、fetch は `--no-recurse-submodules`)、有効なフックなし。ローカルの git config に filter・diff の定義なし(PR の `.gitattributes` が名前を挙げても、定義は PR から入らない)
  - 判定の結果(`verdict=fail`)は基底の規則どおりに出た
- 判定: **裁定の前提と合う(範囲つき)**。fetch と diff だけの形では、PR の `.gitattributes`・`.gitmodules` は実行の経路にならなかった。ただし、gitlink(submodule のコミットの参照)は手元の `git add -A` で落ちて PR に入らず、gitlink を含む PR の fetch の振る舞いは確かめていない。また、判定のスクリプトが PR の差分の**内容**を `node` 等で評価する場合(例: PR の JSON を読む)は別の経路であり、確かめていない

### E-15 2025 年後半に告知された pull_request_target の仕様の変更の有無と内容

- 手順: `side` ブランチに印だけ替えた `probe-prt.yml`(`side-v1`)を置き、`side` を基底とする PR #10(`probe/e15-side-base`)を開いた
- 観測(run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41996344885): 印は `main-v2`、`GITHUB_REF=refs/heads/main`、`base_ref=side`。**PR の基底のブランチ(side)の定義ではなく、既定ブランチ(main)の定義**で動いた
- 判定: 変更の内容の一部を実機で確かめた。2026-11-05 時点の GitHub では、`pull_request_target` は PR の基底に依らず既定ブランチの定義で動く(以前の文書の「基底ブランチの文脈で動く」とは違う)。裁定の「基底(既定ブランチの先端)から読む」と向きは合う。スタック型 PR(基底が下の層のブランチ)でも、判定のコードは既定ブランチから読まれる。告知の文面そのもの(環境の保護の評価の変更などの他の項目)は本確認では読んでいない

### E-8 ルールセットの pull_request 規則のパス単位の必須レビュアー(required_reviewers)が個人のアカウントで使えるか

- 手順: `gh api repos/Takenori-Kusaka/pit-in-trial-371/rulesets` へ `pull_request` 規則の `required_reviewers`(`file_patterns: [".github/workflows/**"]`、`minimum_approvals: 1`)を、reviewer の type `User`(所有者の id 22556919)と `Team` の2通りで送った(enforcement は disabled)
- 観測
  - type `User`: 422「Invalid property /rules/0: data matches no possible input」(User は受け付ける型に無い)
  - type `Team`: 422「Invalid node ID format, Reviewer 22556919 not found, **Repository must be in an organization**」
- 判定: **使えない**(個人所有のリポジトリでは、パス単位の必須レビュアーは組織のチームを要する)。案(b2) は組織の条件つき

### E-9 ルールセットの workflows 規則(required workflows)がリポジトリ単位で使えるか

- 手順: 同じリポジトリのルールセットへ `{"type":"workflows","parameters":{"workflows":[{"path":...,"repository_id":1446732981,"ref"/"sha":...}]}}` を4通り(path に `probe-prt.yml`・`gate-g5.yml`、ref なし・`refs/heads/main`・`main`・sha)で送った。`gh api orgs/Takenori-Kusaka/rulesets` も引いた
- 観測: 4通りとも 422「Invalid rule 'workflows': Invalid parameter workflows: Workflow error at index 0: 」(理由の文は空)。`orgs/Takenori-Kusaka/rulesets` は 404(個人のアカウントには組織のルールセットが無い)
- 判定: **個人所有のリポジトリでは使えない**(裁定の「ruleset workflows を必須にしない。個人所有のリポジトリで使えない」と合う)。拒否の理由の文が空のため、「組織に限る」ことは応答からは直接読めない。組織のリポジトリで受け付けられるかは確かめていない(組織を持たない)

### E-10 push のルールセットのパスの制限(file_path_restriction)

- 手順: `target: "push"`、`file_path_restriction`(`.github/workflows/**`)のルールセットを送った
- 観測: 422「**Source public repos cannot have push rules**」「**Source only org-owned repos can have push rules**」
- 判定: **個人所有・public のリポジトリでは使えない**。案(g) は組織の所有が条件(内部調査の評価と合う)

### E-5 record-copy.yml(pull_request: closed)がどちらの定義で動くか

- 手順
  1. PR #12(`probe/e5a-merge`)— `record-copy.yml` の copy ジョブの先頭に印の手順(`PR-SIDE-e5a`)を足し、**マージした**(`gh pr merge 12 --merge`。マージのコミット 8b8a540)
  2. PR #13(`probe/e5b-close`)— 印(`PR-SIDE-e5b`)を足し、さらにジョブの `if: github.event.pull_request.merged == true` を消し、**マージせずに閉じた**
- 観測
  - PR #12: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997296988 — PR が足した印が出た。`GITHUB_SHA=8b8a540`(マージのコミット)、`GITHUB_REF=refs/heads/main`
  - PR #13: run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997300108 — マージしていない PR で、**PR が書き換えた定義**(merged の条件を消した版)でジョブが動いた。`GITHUB_REF=refs/pull/13/merge`、`merged=false`。`GITHUB_TOKEN` の権限は `Contents: write`
- 判定: **裁定の前提と合う。コメントの記述は半分だけ正しい**
  - マージした場合: 定義は「マージ後の基底ブランチ」(マージのコミット)から読まれる。コメントのとおりだが、そのコミットは**その PR の変更を含む**ため、PR が写しの手順を書き換えれば、書き換えた版がその PR 自身の写しに使われる(ADR-0109 の「写しの書き手を PR が変えられる」は成り立つ)
  - マージしない場合: `closed` は PR のマージの参照(`refs/pull/N/merge`)の定義で動く。`if: merged == true` の守りは PR の側の定義にあり、PR が消せる。消すと、マージされない PR が `contents: write` の権限で写しの手順(または任意の手順)を動かせる
  - `record-copy.yml` の 60 行目のコメント「既定ブランチの定義で動く(pull_request の closed は、マージ後の基底ブランチの定義を読む)」は、閉じただけの PR について誤り。直す対象として申し送る

### E-6 ship-evidence の verify の ref: を PR の中で head に替えたとき、その定義で動くか

- 手順: PR #14(`probe/e6-verify-head`)— `ship-evidence.yml` の verify の `ref:` を `${{ github.event.pull_request.head.sha }}` へ替え、印の手順を足し、起動のパスに当たる `docs/records/probe-e6.md` を足した
- 観測(run https://github.com/Takenori-Kusaka/pit-in-trial-371/actions/runs/41997122885): 印 `PR-SIDE-e6` が出た(`GITHUB_REF=refs/pull/14/merge`)。checkout は `ref: bfbc318`(PR の先頭のコミット)を取り出した。ジョブ ship-evidence-verify は success
- 判定: **裁定の前提と合う**。verify の「スクリプトは基底」は、定義が PR の側で動く限り名目であり、PR が自分の verify の読み元を替えられる(#379 P-6)

### E-7 コード所有者のレビューの判定に、基底の CODEOWNERS が使われるか(PR が所有者の行を消した場合)

- 手順
  1. ルールセット `probe-e7-codeowners`(id 26598876。`pull_request` 規則、`require_code_owner_review: true`)を足した。main の CODEOWNERS は `* @Takenori-Kusaka` の1行が有効
  2. PR #15(`probe/e7-keep`)— CODEOWNERS に触れない変更。PR #16(`probe/e7-remove-owner`)— CODEOWNERS の `*` の行を消す変更
  3. 必須の承認の数を 0 と 1 で比べた
- 観測
  - 承認の数 0: PR #15・#16 とも `UNSTABLE`(マージできる)、`reviewDecision` 空、レビューの依頼なし。PR の作成者が唯一のコード所有者のとき、コード所有者のレビューは求められなかった
  - 承認の数 1: PR #15・#16 とも `BLOCKED`、`REVIEW_REQUIRED`(承認の数で止まっており、コード所有者の効果とは切り分けられない)
- 判定: **確かめていない(基底か PR の側かの区別)**。区別には、PR の作成者と別のコード所有者(書き込みの権限を持つ別のアカウント)が要る。個人所有のリポジトリではチームを所有者にできず、本確認では別の人のアカウントを使っていない
  - 副次の観測: **作成者が唯一のコード所有者の1名の構成では、`require_code_owner_review` は何も止めない**(承認の数 0 のとき)。1名の体制でコード所有者のレビューを「外せない形」に数えることはできない(裁定 R-3 の「1名の体制では別の者の承認が得られない。自己申告として区別して開示する」と合う)

### E-13 専用の名義の AI の担い手が作った PR に、1名の体制の人が承認のレビューを出したとき、コード所有者のレビューと最新の push の承認が満たされるか

- 手順: 別のアカウント(AI の担い手の専用の名義)を使う必要がある。本確認では使っていない。代わりに、作成者本人による承認を試した: `gh pr review 15 --approve`
- 観測: `GraphQL: Review Can not approve your own pull request (addPullRequestReview)`。作成者本人の承認は拒否される
- 判定: **確かめていない**(本題)。理由: 専用の名義のアカウントの操作が要る。所有者の承認の範囲は「所有者のアカウントの下の一時リポジトリの作成と削除」で、別のアカウントの使用を含まない。手元の gh には所有者の別のアカウントも登録されているが、承認の範囲の外のため使っていない。分かったのは、AI の担い手が所有者と同じアカウントで PR を作る構成では、所有者の承認のレビューは出せない(したがって、承認のレビューを効力の要件にすると、名義を分けない1名の体制は必ず未達になる)ということだけ

### E-12 フォークからの PR で pull_request_target が受け取る GITHUB_TOKEN の権限と秘密情報

- 判定: **確かめていない**。理由: 所有者は自分のリポジトリをフォークできず、フォークからの PR には別のアカウントが要る(E-13 と同じ理由で使っていない)
- 参考の観測(同じリポジトリのブランチからの PR): `probe-prt.yml` は宣言どおり `statuses: write` を得て commit status を書けた(E-4)。秘密情報はリポジトリに置いていない

## 後始末

- 2026-11-05、`gh repo delete Takenori-Kusaka/pit-in-trial-371 --yes` で削除した(`gh repo view` が「Could not resolve to a Repository」を返すことを確かめた)。上の Actions の run の URL は、削除により参照できなくなる
- 手元の作業用の写し(scratchpad の `trial/`)はセッションの一時領域にあり、リポジトリには入れていない
- process-compass・pit-in-template の本体には何も操作していない。Dependabot には触れていない(写しから `dependabot.yml` を除いた)
