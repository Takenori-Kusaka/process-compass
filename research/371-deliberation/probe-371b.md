# #371 実装の実機の確認(F-1〜F-4。gate-g5-base・統制の設定の変更の承認・record-copy)

- 実施日: 2026-11-05
- 根拠: 所有者の承認(2026-11-05、#371 の実機の確認)。所有者のアカウント `Takenori-Kusaka` の下に public の一時リポジトリを gh で作り、確認の後に削除する
- 一時リポジトリ: `Takenori-Kusaka/pit-in-trial-371b`(個人所有・public・無償のプラン)
- 中身: 準拠テンプレートのコミット ba2b7e8(`template/` の作業ツリーと差分なし。`git archive HEAD` で取り出し、改行は LF)の写しだけ。秘密情報・`.env`・トークンは置かない
  - 除いたもの: `.github/dependabot.yml`
  - 変えたもの: `.github/CODEOWNERS` の `@OWNER` を `@Takenori-Kusaka` へ
  - 構成: `generate-profile.mjs --answers`(size-1-2 / poc / quality-standard / cl0 / inhouse / reviewer-no / gates-none / ai-free)、D-0 を `templates/00-d0-governance.md` から複製
  - 名簿(手で記入。確認のための構成): `people` = p1「日下 剛徳」(`Takenori-Kusaka`、id 22556919)と p2「確認者 架空」(存在しないログイン `pit-in-probe-nobody-371b`、架空の id。操作には使わない)。全席の責任者を p1 にした。AI維持管理者 = p1 = PR の作成者で、名簿に席の責任者以外の人(p2)がいるため、統制の設定の変更は「p2 の承認(帰属の確認)」を要する形になる(`controlApprovalBacking`)
  - `adapters/none.json` の `test`・`secretScan` に何もしない `node -e ""` を書いた(前回と同じ)
- ルールセット: main に雛形の `checks-only`(必須チェック `gate-g5` と `gate-g5-base`、`integration_id` なし)を適用(id 26616203)
- 操作の主体: すべて所有者のアカウント `Takenori-Kusaka` の gh。別のアカウントは使わない(手元の gh に別のアカウントも登録されているが、承認の範囲の外のため使わない)

## 進捗

- [x] 写しの作成・構成・リポジトリの作成と push(2026-11-05 13:24 UTC)・ルールセットの適用
- [x] F-1a・F-1b・F-2・F-3・F-4・F-5
- [x] 一時リポジトリの削除(後始末)

## 結果の一覧

| # | 判定 | 要点 |
| --- | --- | --- |
| F-1a | 設計どおり | `pull_request_target` で既定ブランチの定義・判定のコード・構成が動き、`ref: main` だけを checkout。結果は PR の先頭の check run(app 15368)で出る |
| F-1b | 設計どおり | PR の側の gate-g5-base.yml・check-pr.mjs の書き換えは実行に入らない。同名の check run と commit status を後から足しても BLOCKED |
| F-2 | 落ちる(範囲つき) | 承認のレビューなし・本文の記名だけ・意見のレビューで failure。本人の承認は GitHub が拒否。別のアカウントの承認で通るかは確かめていない |
| F-3 | 設計どおり | 閉じただけの PR は既定ブランチの定義で評価され、PR の側の `if: merged` の削除は効かない(skipped)。マージした PR では写しが動く。PR が書き換えた手順はその PR 自身の写しに使われる |
| F-4 | 止まる(名簿に別の人がいる構成) | 前回 E-1・E-2 の書き換えで gate-g5 は通るが、gate-g5-base が既定ブランチの CONTROL_FILES で止める |
| F-5 | 1名の体制では止めない(AR-3 の設計どおり) | 名簿が1名なら承認は自己申告で通り、E-1・E-2 の書き換えは本文の記名だけで両方の必須チェックを満たしてマージできる |

## 確かめていないこと(別のアカウントが要る、または範囲の外)

- 名簿の別の人(p2)・AI維持管理者が作成者でない構成での本人の承認のレビューで gate-g5-base が通るか。承認の後の push で承認が外れるか
- フォークからの PR(前回 E-12)
- 判定のジョブが pending の間・起動の契機の漏れの扱い(前回 E-4 の注意のまま)
- 出荷の証跡の集約が、F-5 の自己申告を区別して数えるか(集約は動かしていない)

## 結果

### 準備で分かったこと(項目の外)

- 構成した直後の main では、gate-g5 の gate-contract が失敗する(push の run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035541211。前回の「基準の失敗」と同じ)。以降、PR の gate-g5 の failure はこの既存の失敗による。gate-g5-base は gate-contract を走らせない(check-pr.mjs だけ)
- 手元の写しで、一度だけ CRLF のファイルを PR #2 の最初のコミットへ入れた(手元の git の `core.autocrlf` による)。PR #2 の2つ目のコミットで LF へ戻し、PR #2 の差分は意図した2か所だけになった。判定は2つ目のコミット(先頭)の run で行った

### F-1a 統制の設定に触れない PR で、gate-g5-base が基底の定義で動き、check run で出るか(対照)

- 手順: PR #1(`probe/f1a-harmless`)— `docs/probe-f1a.md` を足すだけ。本文は `## 変更の概要`・`## リスク区分` R3・`Spec: setup`
- 観測(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035726789)
  - イベント `pull_request_target`。checkout は `ref: main`、`git checkout --progress --force -B main refs/remotes/origin/main`(PR の ref を取り出していない)。PR の先頭は `git fetch ... +refs/pull/1/head:refs/remotes/pr/head` で取得だけされた
  - 構成は既定ブランチから読まれ(configured=true)、`check-pr.mjs --base origin/main --policy-base origin/main --head refs/remotes/pr/head --require-control-approval` が走った。注記2件だけで誤りなし
  - check run `gate-g5-base` success、送り手 app id 15368(GitHub Actions)、`head_sha` は PR の先頭(a74da26)と一致
  - `mergeStateStatus=BLOCKED`(gate-g5 が既存の gate-contract の失敗で failure のため。gate-g5-base 自体は満たした)
- 判定: **設計どおり**。基底の定義で動き、PR の ref を checkout せず、結果は PR の先頭の check run で出る

### F-4 前回の E-1・E-2 の経路(集約の `exit 0`、CONTROL_FILES を空)が gate-g5-base で止まるか

- 手順: PR #2(`probe/f4-tamper-g5`)— `gate-g5.yml` の集約ジョブの `run:` の先頭に `echo PR-SIDE-F4; exit 0`、`check-pr.mjs` の `CONTROL_FILES` を `[]` に替えた。本文は F-1a と同じ(陰性の確認の節なし)
- 観測(先頭 a6f7a7c)
  - PR の側の gate-g5(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035944191): gate-contract failure のまま、pr-rules success(陰性の確認を求めない)、**gate-g5 success**。前回の E-1・E-2 と同じく、PR の側の書き換えで必須チェック gate-g5 を通せた
  - gate-g5-base(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42035940584): **failure**。既定ブランチの CONTROL_FILES で `.github/workflows/gate-g5.yml`・`scripts/gate/check-pr.mjs` を統制の設定の変更と判定し、誤り2件「統制の設定の陰性の確認: … 節がありません」「統制の設定の変更の承認: … PR の作成者が AI維持管理者 日下 剛徳 本人であり、本人は自分の PR を承認できない。席の責任者以外名簿の人の承認(帰属の確認)が PR の先頭に無い」
  - `mergeStateStatus=BLOCKED`
- 判定: **止まる**。前回 E-1・E-2 で必須チェックを通した書き換えは、gate-g5 は通すが、必須チェック gate-g5-base(既定ブランチの CONTROL_FILES と判定のコード)で止まる

### F-2 統制の設定を変える PR で、承認のレビューが無いとき・本文の記名だけのときに gate-g5-base が落ちるか

- 手順
  1. PR #4(`probe/f2-control-signed`)— `scripts/gate/check-pr.mjs` の先頭にコメント1行を足すだけ。本文に `## 統制の設定の陰性の確認`(場面・結果「止まった」・確かめた者 日下 剛徳)と、`## 統制の設定の変更の承認`「承認した者: 日下 剛徳(AI維持管理者)。本文の記名による承認」を書いた
  2. 所有者本人の承認を試した: `gh pr review 4 --approve`
  3. 代わりに意見のレビュー(COMMENTED。本文「日下 剛徳(AI維持管理者)として承認します」)を出し、gate-g5-base の最後の実行を再実行した(`gh run rerun`)
- 観測
  - 1回目(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036084540 、attempt 1): **failure**。陰性の確認は「記録あり」の注記で通り、誤りは「統制の設定の変更の承認: 統制の設定(scripts/gate/check-pr.mjs)を変える PR です。… PR の作成者が AI維持管理者 日下 剛徳 本人であり、本人は自分の PR を承認できない。席の責任者以外名簿の人の承認(帰属の確認)が PR の先頭に無い。… (本文の記名は承認に数えない)」の1件だけ。本文の記名は数えられなかった
  - 本人の承認: `GraphQL: Review Can not approve your own pull request (addPullRequestReview)`(前回の E-13 と同じ)
  - 再実行(同じ run の attempt 2): **failure**、同じ誤り。`PR_REVIEWS` に意見のレビュー(state COMMENTED、author id 22556919)が読まれていたが、承認に数えられなかった
  - `mergeStateStatus=BLOCKED`
- 判定: **落ちる**(承認のレビューが無いとき、本文の記名だけのとき、意見のレビューのとき)。この構成(AI維持管理者 = 作成者、名簿に別の人 p2 がいる)で通すには p2 の承認のレビューが要る
- 確かめていないこと: **別のアカウント(名簿の p2 に当たる人)の承認のレビューで gate-g5-base が通るか**、AI維持管理者が作成者でない構成で本人の承認が数えられるか、承認の後の push(先頭の変更)で承認が外れるか。いずれも別のアカウントの操作が要り、承認の範囲の外のため行っていない

### F-3 record-copy(pull_request_target: closed)が、マージせずに閉じた PR で基底の定義で動き、PR の側の書き換えが効かないか

- 手順: PR #5(`probe/f3-close`)— `record-copy.yml` の copy ジョブから `if: github.event.pull_request.merged == true` を消し、ステップの先頭に印 `echo PR-SIDE-F3-MARKER` を足した。**マージせずに閉じた**(`gh pr close 5`)
- 観測(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036606377)
  - イベント `pull_request_target`、ワークフロー `.github/workflows/record-copy.yml`。run の `head_sha` は PR の先頭(fe5f2ed)を表示する
  - ジョブ record-copy は **skipped**(ステップ 0)。PR の側の定義(条件を消した版)なら動くはずのジョブが、既定ブランチの定義の `if: merged == true` で飛ばされた。印のステップは動いていない
  - 前回の E-5 では、同じ書き換え(`pull_request: closed` の版)で、閉じただけの PR が PR の定義のまま `contents: write` で動いた
- 判定: **設計どおり**。閉じただけの PR は既定ブランチの定義で評価され、PR の側の `if` の削除は効かない。前回 E-5 の経路は塞がれた

### F-1b PR の側で gate-g5-base を書き換え・同名のジョブと commit status を出しても、基底の判定が上書きされないか

- 手順: PR #3(`probe/f1b-forge`)
  1. PR の側の `gate-g5-base.yml` の判定の手順を `echo PR-SIDE-BASEWF-MARKER; exit 0` に替えた。`check-pr.mjs` の先頭に `console.log('PR-SIDE-CHECKPR-MARKER'); process.exit(0);` を足した
  2. 新しいワークフロー `forge-base.yml`(`pull_request`、`permissions: statuses: write`)を足した。ジョブ名 `gate-g5-base` を success で出すジョブと、90 秒待ってから PR の先頭へ commit status `gate-g5-base` success を出すジョブ
  3. 2つ目のコミットで、`gate-g5.yml` の集約にも `exit 0` を入れ、必須チェック gate-g5 を通した(gate-g5-base だけが止める状態にするため)
- 観測(先頭 d0eb364)
  - 基底の gate-g5-base(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036467080。1つ目のコミットでは https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036048745): `pull_request_target`、`ref: main` の checkout。ログに `PR-SIDE-` の印は0件(PR の側の gate-g5-base.yml も check-pr.mjs も使われていない)。**failure**(陰性の確認の節なし、統制の設定の変更の承認なし。統制の設定に `forge-base.yml` の追加を数えた)
  - PR の側の同名の check run `gate-g5-base`(ワークフロー forge-base、run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036470581): success。送り手はどちらも app id 15368
  - commit status `gate-g5-base` success(creator `github-actions[bot]`、13:32:49、description `forged-by-pr-side`)。基底の check run の後に出た
  - PR の側の gate-g5(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036470590): 印 `PR-SIDE-F1B` が出て success
  - `statusCheckRollup` は gate-g5-base を3つ(check run FAILURE〔gate-g5-base〕・check run SUCCESS〔forge-base〕・status SUCCESS)、gate-g5 SUCCESS。**`mergeStateStatus=BLOCKED`**
- 判定: **設計どおり(上書きされない)**。PR の側の定義・スクリプトの書き換えは基底の実行に入らず、同名の check run と同名の commit status を後から足しても、基底の check run の失敗が1つ残る限り必須チェックは満たされない。前回 E-4 の「check run の形なら上書きされない」を、実装したワークフローで確かめた
- 対照(マージした PR): ルールセットを一時に無効にして PR #1(F-1a)をマージし(マージのコミット 021170e)、すぐ有効へ戻した。record-copy(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036875378)は `pull_request_target` で動き、`GITHUB_TOKEN` は `Contents: write`、checkout は `ref: main`。記録用ブランチ `records` を初期化し、`records/reviews/pr-1.json` を置いた(records の先頭 73040a0)。マージした PR では写しの手順が動くことを確かめた
- 対照(マージした PR が record-copy.yml を書き換える): PR #6(`probe/f3b-merge-marker`)— `record-copy.yml` のステップの先頭に印 `echo PR-SIDE-F3B-MARKER` を足し、ルールセットを一時に無効にしてマージした(マージのコミット 8ebe102。直後に有効へ戻した)。record-copy(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037026805)は **PR が足した印を出した**(`contents: write`)。マージした PR では、既定ブランチの先端がその PR の変更を含むため、PR が書き換えた写しの手順がその PR 自身の写しに使われる。`record-copy.yml` の冒頭のコメント(「マージした PR では、既定ブランチの先端はその PR の変更を含みます。…取り込む前に AI維持管理者本人の承認を要します」)のとおりで、この経路を止めるのはマージの前の gate-g5-base(統制の設定の変更の承認)だけである。本確認ではルールセットを無効にしてマージしたため、その止め方は通していない

### F-5 名簿が1名の体制(席の責任者以外の人がいない)での、統制の設定の変更の承認(F-2・F-4 の対照)

- 手順
  1. ルールセットを一時に無効にして、main の `process.config.json` の名簿から p2 を外した(main 11e1d34。PR #6 のマージと同じ無効の間に push し、直後に有効へ戻した)。AI維持管理者 = 作成者 = 名簿の唯一の人、になる
  2. PR #4(F-2。本文の記名あり、承認のレビューなし)の gate-g5-base を再実行した(attempt 3)
  3. PR #2(F-4。集約の `exit 0` と CONTROL_FILES の空)の本文を、F-2 と同じ本文(陰性の確認の節と記名)へ替えた(`edited` で再実行)
- 観測
  - PR #4(run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42036084540 、attempt 3): **success**。注記「統制の設定の変更の承認: PR の作成者が AI維持管理者 日下 剛徳 本人で、名簿に席の責任者以外の人がいない。作成者は自分の PR を承認できず、別の者の承認を得られないため、承認が自己申告である … 自己申告として出荷の証跡の集約が区別して数える」。PR の側は何も変えず、既定ブランチの名簿の変更だけで判定が変わった(名簿は PR の基底でなく既定ブランチの先端から読まれる)
  - PR #2(gate-g5-base run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037058036 、gate-g5 run https://github.com/Takenori-Kusaka/pit-in-trial-371b/actions/runs/42037057564): gate-g5-base **success**(陰性の確認は記録あり、承認は自己申告)、gate-g5 success(集約の `exit 0`)。注記「基準値・名簿・… は、PR の基底(origin/main)でなく既定ブランチ(origin/main)の先端から読む」
  - PR #2 の `statusCheckRollup` には、同じワークフロー gate-g5-base の古い run の FAILURE と新しい run の SUCCESS が並び、**`mergeStateStatus=UNSTABLE`(必須を満たし、マージできる)**。同じワークフローの再実行・再起動では新しい run の結果が効く(F-1b の「別のワークフローの同名の成功」では止まったままだったことと対照)
- 判定: **裁定 AR-3 の設計どおり(1名の体制では止めない)**。名簿に席の責任者以外の人がいない体制では、統制の設定の変更の承認は自己申告として通り、gate-g5-base は止めない。したがって 1名の体制では、前回 E-1・E-2 の書き換え(集約の `exit 0`・CONTROL_FILES の空)は、本文に陰性の確認の節と記名を書けば、必須チェック gate-g5 と gate-g5-base の両方を満たしてマージできる。止める役は、出荷の証跡の集約での自己申告の区別(開示)に移る。この集約の数え方は本確認では動かしていない
- 含意: F-4 の「止まる」は、名簿に席の責任者以外の人がいる構成に限る。必須チェックとして数えられることは、PR #2 の BLOCKED(gate-g5-base failure)→ UNSTABLE(gate-g5-base success)の切り替わりでも確かめた

## 後始末

- 2026-11-05、`gh repo delete Takenori-Kusaka/pit-in-trial-371b --yes` で削除した(`gh repo view` が「Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-371b'」を返すことを確かめた)。上の Actions の run の URL は、削除により参照できなくなる
- ルールセットの一時の無効化は2回(PR #1 のマージ、main の名簿の変更と PR #6 のマージ)。いずれも直後に有効へ戻した
- 手元の作業用の写し(scratchpad の `trial371b/`)はセッションの一時領域にあり、リポジトリには入れていない
- process-compass・pit-in-template の本体には、この記録の追加のほか何も操作していない。所有者以外のアカウントは使っていない。push にフラグは付けていない
