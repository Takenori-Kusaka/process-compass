# #361 node の public 3巡目の結果(束 B34、2026-11-26)

- リポ: `Takenori-Kusaka/pit-in-trial-node-pub2-tmp`(public。削除済み)。準拠テンプレートは直した版 616f039(作業ツリーの template/。`git archive 616f039` の中身を複製)。pit-in-template へは push していない
- 別アカウント ganbariquestsupport-lab は一時リポの collaborator(write)だけで使った。**同じ人が操る2つのアカウントは独立した人を示さない**。観測はホスティングの振る舞いに限る。フォークは作っていない。PAT は作っていない
- 人の欄(資産一覧の確定者・env-check の `--by`)は「試行の代記(人の判定ではない)」。席の責任者・D-0・判定記録の人の欄は埋めていない。このため **gate-g5 は一度も成功せず**、実の checks-only の下では PR を取り込めなかった。ルールセットの「効き」の一部は、必須チェックだけを替えた**変種**で観測した(trial-log.md)
- 件数(22 行): **働いた 9 / 観測した 7 / 否 1 / 確かめられない 4 / 未実施 1**
- メール: 全コミット 42 件の作者・コミッターが noreply(実アドレス 0 件)。マージごとに確認(`merge-email-checks.txt`・`all-commit-emails.txt`)

## 項目ごと

| ID | 観測 | 判定 | 証跡 |
| --- | --- | --- | --- |
| B-1 | 手順に無い作業を trial-log に記録(coverage のスクリプト、D-0・project-brief・defect-ledger の複製、README の重なりの形、ルールセットの変種)。持ち込みの最初の PR の ship-evidence-verify は、基底に道具が無い旨を明示して赤(直しの確認) | 観測した | `trial-log.md` |
| B-2 | env-check(所有者の gh): 初回は確認済み 6・対象外 1・未確認(対象がまだ無い)2(PR のレビューの取得・ship-evidence の成果物の取得)。承認のある PR #11 を渡すと、レビューの取得は確認済みへ。成果物の取得は gate-g5 が成功した実行が無いため未確認のまま。変種のルールセットでは「ルールセットの適用」を不一致と検出。9項目が確認済みか対象外には至らない(原因は gate-g5 の未成功) | 観測した | `env-check-main-1.json`・`env-check-pr11.json`・`env-check-out-1.txt`・`env-check-out-2.txt` |
| B-4a | ワークフロー内の読みの比較は本巡で流していない(1巡目の記録のまま) | 未実施 | なし |
| B-5 | PR の側に名が gate-g5・gate-g5-base の成功ジョブを足した PR #5: 実の gate-g5 の失敗が残り BLOCKED。同名の成功が必須を満たすかは、実の gate-g5 が失敗するため切り分けられない。gate-g5-base は統制の設定の変更の検査で失敗した | 観測した(限定) | `prs.json`・trial-log |
| B-7 | タグ v0.1.0 の後の ship-evidence は失敗(38 秒)。理由は、席の責任者の未記入 9 席・安全関連部の記録なし・知財の検査記録なし・D-0 節7 の空欄・gate-g5 が失敗した PR(#3・#4・#11〜#19)・AI維持管理者の承認なしの統制変更(#12・#13)。ship ブランチ・出荷の PR は作られず、人の欄は埋めていない。止まり方は設計どおり。PR #4 は、変種の下で SHA を直接 push した PR だが、集約が gate-g5 の failure として検出した。EV-0107「出荷まで通した」は満たさない | 働いた(止める側) | `b7-ship-evidence-fail.txt`(run 45805150902) |
| B-8 | IMPL-0324 の実装マークは `issue=361` | 観測した | 台帳の読み |
| C-3 | ai-review の定義を、PR へコメントする模擬へ替えた(既定ブランチ)。同じリポの PR で、模擬は read で 403(Resource not accessible by integration)になり、`レビューの失敗を表示する` が実行され警告が出た。ジョブは成功のまま(continue-on-error)、`ai-review-notice` は成功し位置づけの文を PR に出した。PR へ模擬のコメントは付かなかった。フォークの判定・allowForks の経路はフォークを作らないため未実施。notice の always() は、ジョブ自体を落とす場面では確かめていない | 働いた(同じリポの PR) | `c3-ai-review-steps.txt`・`c3-failing-step.txt` |
| C-4 | 統制の設定(CODEOWNERS)を変える PR #12 に別アカウントが承認しても gate-g5-base は失敗(「AI維持管理者の席の責任者が構成に無い。承認する者を確かめられない」「陰性の確認の節が無い」)。席は人が任免するため埋めていない。成立する側は観測できない | 確かめられない | `codeowners-c1.txt` |
| C-5 | 基底の側の CODEOWNERS の評価(E-7)。作成者本人がコードオーナーのとき、コードオーナーの承認の要求が掛からず(対照 PR #14 が別アカウントの承認で取り込み可)、基底と PR の側の評価を切り分けられない。PR #13(基底=別アカウント・PR の側=作成者)も別アカウントの承認で取り込み可だった。組織の同意は個人のリポで作れない | 確かめられない | `codeowners-c2.txt` |
| C-6a | `next.mjs --pickup state:ready-to-merge '#20'` は、G-6 が未達の構成では `state:ready-to-merge` を使わないとして「判定できない」(終了 4)で止まった。PR のレビューの読み出しには至らない | 確かめられない(止める側は観測) | `c6a-pickup.txt` |
| C-6b | team の変種で、別アカウントの承認(reviewDecision=APPROVED)の後に同じ PR へ push すると承認が DISMISSED になり REVIEW_REQUIRED・BLOCKED へ戻った。再承認で取り込み可 | 働いた | `team-a-state.txt` |
| Q2(作成者のマージ・承認) | team の変種(承認 1・最後の push の後の承認・古い承認の失効)で、作成者本人の `gh pr merge` は「base branch policy prohibits the merge」で拒否、作成者の自己承認は「Can not approve your own pull request」で拒否。別アカウントの承認の後に取り込めた | 働いた | `team-a-author-merge-refusal.txt`・`team-a-self-approve-refusal.txt` |
| V(ルールセット・旧来の保護の効き) | public ではルールセット(checks-only・records・team 変種)と旧来の保護(必須 test・enforce_admins)を置けた。実の checks-only の下では、PR #4 は gate-g5 が失敗のため BLOCKED(`--admin` は使っていない)。旧来の保護は、ルールセットを disabled にした後も main への直接 push を拒否した | 働いた | `merge-refusal-pr4.txt`・`rulesets-final.json`・`protection-final.json` |
| C-16 | gate-g5.yml の手動の起動(workflow_dispatch)は、D-0 等の未記入のため失敗した。失敗の check run が head に gate-g5 の名で付き、PR は BLOCKED。手動の起動の成功を作れないため、成功が必須を満たすかは確かめられない | 確かめられない | `c16-dispatch-checkruns.txt` |
| C-19 | 上程の Issue #7(G-4・R1・指名レビュア 1名)と、対象 `#7` の判定記録の PR #8 が結べ、pre-review-responded は「応答の宣言行が揃っていない」で失敗した | 働いた | `c19-c20-responded.txt` |
| C-20 | 結べない記録(対象 `#999`)・壊れた記録の PR は、警告「事前レビューの上程と結べない…確かめていない」とジョブの要約を出し、ジョブは成功で終えた | 働いた | 同上 |
| C-21 | pre-review-responded だけを必須にした変種で、記録を含まない PR #6 は UNSTABLE(取り込み可)、結べない記録の PR #9・#10 も UNSTABLE、応答の揃わない記録の PR #8 だけ BLOCKED | 働いた | `c21-mergestate.txt` |
| C-22 | `pre-review.mjs metrics --month 2026-12` は上程 1・応答率 0%(0/1)・「結べず外した 1 件」を出し、日数の指標は「算定できない(結べた上程なし)」。注記に予定日 T で代用しない旨と祝日未計上が出た。「代理」の語の表示は、結べた上程が無く観測できていない | 観測した(限定) | `c22-metrics-2026-12.txt` |
| C-25 | 実の checks-only の下で、main への直接 push は「2 of 2 required status checks are expected」で拒否。通った SHA(gate-g5-base 成功・test 成功・gate-g5 失敗)の push は「Required status check gate-g5 is failing」で拒否。必須を gate-g5-base だけにした変種では、PR #4 の SHA の `git push origin <SHA>:main` が受理された。実の gate-g5 が成功した SHA での受理は、gate-g5 を成功させられず観測していない | 働いた(経路は実在。変種) | `c25-direct-push.txt`・`c25-sha-push-real-checks-only.txt`・`c25-sha-push-variant-gate-g5-base-only.txt` |
| C-26 | C-25 の結果が「できた」側(変種)のため、`pull_request` の規則を checks-only に足すかの議題起票の条件は成立。ただし実の gate-g5 での再現が無い限定を付ける。議題は重の審議へ(新しい義務に当たるため) | 観測した(条件付き) | 同上 |
| record-copy の連続マージ | 4〜5 秒間隔で PR #15〜#19 を rebase で連続マージ。run は 5 件とも success、cancelled 0。records ブランチに pr-15〜19.json が揃い、conflicts は 0 件。D-2 の直し(PR ごとの concurrency グループ)で取りこぼしは出なかった。単一の連続 5 件の観測 | 働いた | `rc-merge-times.txt`・`rc-runs.txt` |
| EV-0107(開いている PR) | 持ち込みの後の `feat/wip`(PR #1)は MERGEABLE・CLEAN(旧来の保護の必須は test だけ)。持ち込みの PR は旧来の保護の下で、gate-g5 等が赤でも取り込めた | 観測した | `ev0107-pr1.txt` |
| D-1(gate-contract) | 持ち込み(PR #2)・初期化(PR #3)の後とも、gate-contract が test-discouraged-evidence の4試験を NG にした。LF の複製でも同じ。1巡目と同じ4件で、直しの確認は否 | 否 | `gate-contract-pr2-ng.txt`・`gate-contract-pr3-ng.txt` |

## 新しい欠陥・所見
- D-1 の残り(否): 上記。再現の手順は trial-log.md の最後
- rebase マージのコミッター・作者のメールの露出は、所有者の「Keep my email private」と push の拒否の設定の後は起きなかった(F-10 の解消。42 件)
- 実の checks-only の下では、人の欄が埋まるまで PR が取り込めない。設計どおりの止まりで、採用者は初回の PR(持ち込み・初期化)を、規則の適用の前に取り込む順序になる(R-5 の事実として手引きに書く材料)

## 削除の確認
`gh repo delete Takenori-Kusaka/pit-in-trial-node-pub2-tmp --yes` の後、`gh repo view` の出力:

```
GraphQL: Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-node-pub2-tmp'. (repository)
```

ganbariquestsupport-lab の保留中の招待: 0 件。
