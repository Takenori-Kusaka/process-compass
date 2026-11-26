# #361 python 3巡目(public)の結果(pit-in-trial-python-pub2-tmp、2026-11-26、template 616f039)

単一の試行・合成のリポ・同じ人が操る2つのアカウント(独立した人を示さない。観測はホスティングの振る舞いに限る)。人の名義の欄は「試行の代記(人の判定ではない)」。スカッシュは使わず、すべて merge commit。C-18(PAT)は作っていない。根拠の水準は E2 より上げない。

## 1. 項目ごとの結果

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| P1(B-3a 補)・team の重なり | public では既存のルールセット(承認1・必須 pytest)・旧来の保護(必須 lint・管理者にも適用)・team.json・records.json を置けた。持ち込み PR #1 は作成者のマージが「base branch policy prohibits」で拒否され、別アカウントの承認の後に成立 | 働いた | rulesets ruleset-*.json、protection-main.json、PR #1 |
| B-3a | 事前点検 1回目: 止める3(CODEOWNERS 2か所・@OWNER・資産一覧)・告げる7。直し後 止める0。**複製の元を CRLF で作ると**(README の archive の例)gate-contract が落ちる | 働いた(止めた)。手順の穴あり | preflight-1-before.txt、preflight-4-after-lf.txt |
| B-1 | 手順に無かった作業が 3 件、新しい欠陥 N-1(archive が CRLF)・N-3(`.githooks/commit-msg` の実行ビットが Windows の複製で落ち、test-agent-run-record が 12/34 NG)。持ち込み PR #1 の gate-contract は test-adoption も落ちる(初期化前の複製は「テンプレートの git ls-files」と一致しない)。ship-evidence-verify は D-4 のとおり基底に道具が無く落ちる | 観測した(再現+新規) | trial-log.md |
| N-1 | 再現: core.autocrlf=true の clone で `git -C template archive HEAD \| tar -x` → test-discouraged-evidence が 4 NG(表の正規表現が `\|\n`)。`git -c core.autocrlf=false ... archive` では 0 NG。D-1 の「原因未特定」は少なくとも Windows の複製では CRLF | 観測した | trial-log.md |
| EV-0170 | 初期化の出力が pip-audit・pip-licenses を「作るもの」と列挙。extras に足せば pytest・lint は通る。`requirements-dev.txt` と extras の二重管理は残る | 否(アダプタの前提と既存の形が合わない作業が生じた) | init-output.txt |
| ip-clearance の違反2件 | **テンプレートの欠陥(N-5)**。certifi(MPL-2.0)・defusedxml(PSF)は許可リストに有る。pip-licenses の自由文を SPDX 式として分割してしまい、対応表に届かない。合成アプリの依存ではなく、テンプレートが dev に要求する pip-audit の間接依存。`Python Software Foundation License`・`Mozilla Public License 2.0 (MPL 2.0)` だけが FAIL | 観測した(原因の確定) | ip-clearance-repro.txt、PR #2 の run |
| B-2(env-check 9項目) | 確認済み 6(旧来の保護の重なり・CODEOWNERS の所在・bypass・PR レビュー・Workflow permissions・Actions の承認不可)、対象外 1(Environment)、未確認(対象がまだ無い)1(ship-evidence の成果物。gate-g5 の成功が無い)、**不一致 1(ルールセット)**。records の保護は records.json の適用後に確認済み。基底から読む判定は「満たす」。9項目すべてが確認済みか対象外ではない | 観測した(EV-0169 の条件は未達) | env-check-1.json、env-check-2.json |
| N-6(env-check の重なりの読み) | 既存ルールセットと team の重なりを、env-check は不一致(dismiss_stale・last push 無効)と読んだが、実効は有効(PR #3: 内容変更の push で承認 DISMISSED、空コミットでは失効せず)。env-check が重なりを集約しない | 観測した(偽の不一致) | p8-pr3-states.txt、env-check-1.json |
| B-4a | 所有者の gh での読みのみ(ワークフロー側 GITHUB_TOKEN との比較は node の試行)。public では 403 は出ず、4値は読めた | 観測した | env-check-1.json |
| C-6b(承認の後の push での失効) | PR #3: 承認後の空コミットでは APPROVED のまま、内容を変える push で DISMISSED・REVIEW_REQUIRED | 働いた | p8-pr3-states.txt |
| C-4(別アカウントの承認で gate-g5-base が成立) | 統制の設定を変える PR #7 に別アカウントが承認しても gate-g5-base は失敗のまま。理由は「AI維持管理者の席の責任者が構成(seats)に無い」「陰性の確認が未記入」。名簿が空(人の欄を埋めない)ため、成立する側は確かめられない。止まり方は定義どおり | 確かめられない(成立の側)。止める側は働いた | c4-gate-g5-base.txt |
| C-5(E-7 基底の側の CODEOWNERS) | 基底 trial-target(コード所有者のレビュー必須)で、PR #5(/probe/ の所有者は別アカウント): 承認前 BLOCKED、所有者の承認の後に成立。PR #6(PR の側の CODEOWNERS で /probe/ を作成者のみに替える): 基底の側の所有者(別アカウント)の承認で成立 = 基底の側で評価された。組織の同意は未確認(個人のリポ) | 働いた(E-7)。組織の同意は確かめられない | c5-owner.txt、c5-base-side.txt |
| C-1(フォークの PR) | フォーク PR #4(題名にシェルの展開と `${{ secrets.* }}`): pull_request の probe で secret-length=0(合成の secret に届かない)、題名はデータのまま(展開されない)、書き込み API は 403。ai-review は「フォークからの PR のため AI の手順を動かしません」を出し、gate-g5-base の題名は env 経由で展開されない | 働いた | c1-fork-probe.txt、c1-fork-prt.txt |
| C-17(委任) | delegation.yml は既定のまま。PR #3 の delegation-eligibility は必須でないステータスで success、「該当しない(協働)」(トレーラから規則 ID が定まらない)。該当する側は、名簿・規則が空のため作れなかった | 観測した(該当しない側のみ) | pr3-statuses.txt |
| 出荷(B-7 / P10) | タグ v0.1.0 → ship-evidence が失敗。記録の欠落 12 件。PR #2 の別アカウントの承認は「名簿と対応づけられない」ため独立した確認に数えない。ship/ ブランチは出ず、出荷の PR は開けない。人の欄・名簿を埋めない限り止まるのは定義どおり | 観測した(正しく止まった。出荷の完走は確かめられない) | ship-summary.txt、ship-run.txt |
| gate-g5(team 適用後) | PR #3 は d0-check・g1-check・ip-clearance が赤(人の欄・N-5)。承認があっても BLOCKED(必須 gate-g5)。N-5 が無くても人の欄で止まる | 働いた(止めた) | p8-pr3-states.txt |
| C-18・C-27・C-6a | PAT を作らない(C-18)、public でスカッシュを使わない(C-27)、C-6a は 1巡目で観測済み。今回は実施しない | 確かめられない / 実施せず | — |

件数: 働いた 6(P1、B-3a、C-6b、C-5(E-7)、C-1、gate-g5 の停止)/ 観測した 7(B-1、N-1、ip-clearance の原因、B-2、N-6、B-4a、C-17、出荷の停止)/ 否 1(EV-0170)/ 確かめられない 3(C-4 の成立側、組織の同意、C-18)。新しい欠陥 6(N-1〜N-6、うち N-2 の dependabot は FAILURE が1回だけで再現せず所見止まり)。

## 2. メールの確認

マージのたびに author/committer を確かめた(email-check.txt、email-check-final.txt)。リポの全ブランチ(main・trial-target・records・作業ブランチ)とフォークの commit は、author が `22556919+Takenori-Kusaka@users.noreply.github.com` か `279162543+ganbariquestsupport-lab@users.noreply.github.com`、committer が同じ noreply か GitHub の `noreply@github.com` か github-actions[bot] の noreply のみ。実アドレスは無し。

## 3. 削除

(下記)

本体 `Takenori-Kusaka/pit-in-trial-python-pub2-tmp` は削除した。フォーク `ganbariquestsupport-lab/pit-in-trial-python-pub2-tmp` は、ganbariquestsupport-lab の gh のトークンに delete_repo の scope が無く(`This API operation needs the "delete_repo" scope`)削除できなかった。scope は足していない。フォークは親の削除の後も残っている(public)。中身は noreply のコミットだけで、実アドレス・秘密情報は無い。**所有者が ganbariquestsupport-lab で `gh auth refresh -s delete_repo` の後に `gh repo delete ganbariquestsupport-lab/pit-in-trial-python-pub2-tmp --yes` するか、画面で削除する必要がある**。

```
$ gh repo view Takenori-Kusaka/pit-in-trial-python-pub2-tmp
GraphQL: Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-python-pub2-tmp'. (repository)
$ gh repo view ganbariquestsupport-lab/pit-in-trial-python-pub2-tmp   (削除できていない)
name:	ganbariquestsupport-lab/pit-in-trial-python-pub2-tmp
```
