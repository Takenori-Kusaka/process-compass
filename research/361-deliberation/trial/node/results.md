# #361 node 一時リポ試行の結果(束 B34、2026-11-26)

- リポ: `Takenori-Kusaka/pit-in-trial-node-tmp`(**private**。§10 の裁定。作成 16:44 JST、template d5d2d86)
- 実行役: sonnet。人の名義の欄は §10 のとおり(所有者の氏名を渡さない。AI の名義を書かない)。資産一覧の確定者・env-check の `--by` は「試行の代記(人の判定ではない)」。env-check の道具は `--by` の語を検証せず、人でない語を受け付けた(所見 F-8)
- 合否の件数: **合 11 / 否 1 / 確かめられない 24 / 未実施 8**(計 44 = 本文 10 + コメント 34 の全項目。「未実施」は呼び出しの上限・他言語・時間の都合で流さなかったもの。確かめられない側へは数えない)
- 生の記録: 同じ置き場の `trial-log.md`(手順に無い作業)、`preflight-*.txt`、`env-check-main-1.json`、`probe-envcheck-out.txt`、`runs.json`(200 run)、`prs.json`、`c28-check-runs.txt`、`c29a.txt` ほか
- 重要な前提: private の Free では、ルールセットも旧来のブランチ保護も作成・読みとも **HTTP 403「Upgrade to GitHub Pro or make this repository public to enable this feature.」**(PUT protection 16:46、POST rulesets 16:57、GET rulesets・GET protection は最後にも同じ)。必須チェックが置けないため、PR は赤のままマージできた

## 1. 項目ごとの観測

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| B-1 | 手順に無い作業を記録した: (1) 持ち込みの PR(#2)が赤(ship-evidence-verify・gate-g5)のまま取り込めた、(2) README の重なりの扱いの指示が無く追記の形を実行役が選んだ、(3) 初期化の後も package.json に coverage が入らず jest 用へ手で書き換え(アダプタは c8 の `--reporter=json` 前提で `coverage-final.json` を要する)、(4) D-0・project-brief・defect-ledger を手で複製(初期化の出力は「次のコマンド」として D-0 だけを案内し、gate-entry の d0-check・g1-check は project-brief も要した)、(5) 作業ブランチだけの workflow_dispatch は 404 | 合 | `trial-log.md` |
| B-2 | env-check(所有者の gh)9項目+所見: 確認済み 3(CODEOWNERS・Workflow permissions の既定・Actions による PR の承認)、対象外 1(Environment)、未確認(権限不足)5(ルールセット・旧来の保護・bypass・PR のレビュー取得は対象なし・成果物は対象なし)。9項目すべてが確認済みか対象外には至らない。原因は Free の private の 403 | 確かめられない(V) | `env-check-main-1.json`、`env-check-try1.txt` |
| B-3a | preflight: 1回目(コピー直後)止める 3・告げる 4、2回目(CLAUDE.md 合成後)止める 1(資産一覧)、3回目 0。直した手数 = 合成 3 ファイル+一覧 1 | 合 | `preflight-1/2/3.txt` |
| B-3b | 長期の観測 | 確かめられない | — |
| B-4a | 同じ commit の env-check を gh(所有者)と ワークフローの `GITHUB_TOKEN`(permissions: (a) テンプレートの既定 (b) `read-all`)で比較。Workflow permissions の既定・Actions による PR の承認・Environment の3項目は、所有者の gh では「確認済み/対象外」、ワークフローでは両設定とも「未確認(権限不足で読めない)」。CODEOWNERS と records 側の所見は両方で確認済み | 合 | `probe-envcheck-out.txt`(run 45780101765) |
| B-4b | 長期の観測 | 確かめられない | — |
| B-5 | 必須チェックを置けない(403)ので PR の側の同名ジョブの再観測ができない | 確かめられない(V) | 403 |
| B-6 | 上の B-4a のとおり。`GITHUB_TOKEN` は `read-all` でも Actions の設定の3項目を読めない(見込みどおり)。IMPL-0324 の gh の認証の範囲は、ship-evidence の中では 3項目が読めない前提で設計する材料になる | 合 | run 45780101765(2 ジョブ、開始 08:04:29Z、a は 15 秒・b は 12 秒) |
| B-7 | EV-0107・EV-0169・EV-0170(node 分): 持ち込み〜初期化〜タグ `v0.1.0` までは通したが、ship-evidence は**失敗**(15 秒。run 45779635898)。理由は未記入の席の責任者・安全関連部の記録・知財の検査記録・PR #3 の gate-g5 失敗・PR #4 に gate-g5 の check run が無い(必須チェックを経ずにマージ、と検出)。出荷の PR は開けなかった。env-check は 9項目に至らず。人の判定の記録(席の責任者)を AI の名義・偽の記名で埋めない裁定のため、ここで止めた。EV-0107 の「出荷まで通した」は満たさず | 否 | run 45779635898 |
| B-8 | 受付で確認済み。本試行では再確認していない | 未実施 | — |
| C-1 | フォークの別アカウントが無い(裁定 Q2) | 確かめられない | — |
| C-2 | モデルの鍵(秘密情報)を置かない | 確かめられない | — |
| C-3 | ai-review の定義の差し替えの検査(N17)を上限の都合で流していない | 未実施 | — |
| C-4・C-5・C-6b | 別アカウントの承認(Q2) | 確かめられない | — |
| C-6a | `next.mjs --pickup` の PR レビュー読み出しを流していない | 未実施 | — |
| C-7 | 第2段の実装が無い | 確かめられない | — |
| C-8〜C-11・C-14 | このテンプレート版の `record-copy.yml` は承認レビューの写し(`records/reviews/pr-<n>.json`)だけを書き、ai-review の成果物を写さない(ai-review.yml は `ai-review-inputs` を upload するのみ)。成果物の選び方・sha256 照合・スクリプトの不実行・取り出しは対象の機能が無く、試せない。IMPL-0492 の note の7項目が何の写しを指すかの食い違いを所見 F-5 に出す | 確かめられない | `record-copy.yml` の読み |
| C-12 | `.github/workflows/record-copy.yml` に `actions: read` を足す変更を check-pr に通すと、「統制の設定の陰性の確認の節が無い」で errors に出た(止まる側) | 合 | `c12-checkpr.txt` |
| C-13 | マージせず閉じた PR #16 では record-copy は `skipped`、写しは作られない | 合 | run 45781119595 |
| C-15 | 3欄(既定の権限・承認の可否・Environment)は所有者の gh で 確認済み/確認済み/対象外 | 合 | `env-check-main-1.json` |
| C-16・C-21 | 必須チェックを置けない | 確かめられない(V) | 403 |
| C-17 | python 側 | 未実施 | — |
| C-18 | PAT を置かない(Q3) | 確かめられない | — |
| C-19・C-20 | 上程の Issue と判定記録の PR を流していない(上限) | 未実施 | — |
| C-22 | `pre-review.mjs metrics` は表を出す。対象が 0 件で、日数の指標は「算定できない」。注記に「予定日 T では代用していません」「祝日を数えていない(.github/business-holidays.txt が無い)」が出る。「代理」の語の表示は、結べた上程が無く観測できていない(表示の有無は限定つき) | 合(限定) | `pre-review-metrics.txt` |
| C-23 | 実装が無い | 確かめられない | — |
| C-24a | `enforcement-inventory.mjs --quarter 2026Q4` はワークフロー・ジョブごとの失敗数と実行数を出す(例: gate-g5.yml gate-g5 の失敗 5)。「読めない」の表示は `GITHUB_REPOSITORY` 未設定のとき出た(1回目)。「読めた最も古い実行が窓の始まりより後」の注意も出る | 合 | `enforcement-inventory.txt` |
| C-24b | 時期 | 確かめられない | — |
| C-25・C-26 | ルールセットを置けないため、演習用ブランチ宛の PR の SHA でなく空コミットを `git push origin main` したところ**受理された**。これは規則が無い状態の挙動であり、checks-only の下の挙動ではない | 確かめられない(V) | 16:55 頃の push |
| C-27 | python 側 | 未実施 | — |
| C-28 | PR #17 で赤のテストを push(`34881e8`)→ テストだけ直す push(`b06cf87`)。`gh api commits/{sha}/check-runs` で push ごとの `test` の結論が読めた(failure → success) | 合 | `c28-check-runs.txt` |
| C-29a | `mutation-weekly`(run 45779955619)success、ジョブ 08:03:23Z〜08:03:35Z(12 秒)。`assurance-period`(run 45779961329)success、ジョブ 5 秒。run の createdAt〜updatedAt は 17 秒・10 秒 | 合 | `c29a.txt` |
| C-29b | 時期 | 確かめられない | — |
| C-30a | go 側 | 未実施 | — |
| C-30b | 組織の所有ではない | 確かめられない | — |

## 2. 所見(項目の外で見つけたもの。後継の確認・裁定の材料)

| ID | 所見 | 証跡 |
| --- | --- | --- |
| F-1 | **record-copy の写しが取りこぼされる**。concurrency は `cancel-in-progress: false` だが、同じグループで待ちの run は後続に置き換えられて `cancelled` になる。13 秒間隔の連続のマージで PR #9・#10・#13 の写しが無い(records の `pr-*.json` は取り込んだ PR のうち一部のみ)。集約は「写しが無い」を欠落と出すはずなので、規則を置けない private でも出荷が止まる。連続のマージの運用で再現する | `runs.json`(record-copy の `cancelled` 3 件)、records ブランチ |
| F-2 | 持ち込みの最初の PR は、ベースの `main` に `.github/gate-node-version` が無く、`ship-evidence-verify` が setup-node で失敗する(PR #2、run 45777947399)。持ち込みの手順に注意が無い | 同 run |
| F-3 | `gate-contract` のログが `$GITHUB_STEP_SUMMARY` の 1024k 超過のエラーを出す(1083k)。ジョブの失敗理由は別(D-0 等の未記入)だが、要約が切れる | `gate-contract-pr3.log` |
| F-4 | 初期化は既存の `package.json` を変えない(coverage のスクリプトを足さない)。README は「coverage が無いことは止めない。G-5 が失敗する」と書くとおりだが、利用者が埋める形は jest では c8 前提の `--reporter=json` に合わない(jest は `--coverageReporters=json` で `coverage-final.json` を出せる) | `trial-log.md` |
| F-5 | IMPL-0492 の「record-copy の7項目」は ai-review の成果物の写しを前提にするが、d5d2d86 の record-copy にその機能が無い。note と実装の食い違い(要確認) | `record-copy.yml` |
| F-6 | squash の `PR_BODY` の設定で、取り込みのメッセージの末尾は `Spec: <...>` の後に空行・`---------`・`Co-authored-by: ...` が続く。末尾の段落がトレーラ1つでなくなる(C-27 の python の材料。`specTrailersOf` の読みは未確認) | `git log` の PR #3 のメッセージ |
| F-7 | 規則を置けない private では、ship-evidence は「PR #4 に gate-g5 の check run が無い(必須チェックを経ずにマージされた可能性)」を正しく検出して出荷を止めた(統制が実際に働いた事実) | run 45779635898 |
| F-8 | `adoption-trial.mjs env-check --by <語>` は語が人の氏名かを検証しない(「試行の代記」「probe」を受理)。道具が AI の名義の語彙を拒むかは、AI の名義を渡して確かめていない | `env-check-try1.txt` |
| F-9 | 既定ブランチへの push の契機で、check run の名が `default-push / gate-g5` として付く(PR の契機の `gate-g5` と別)。EV-0245 の観測 | main HEAD の check-runs |

## 3. 手順に無かった作業・戻した変更

- `.github/workflows/probe-envcheck.yml` を一時的に main へ置いて検査し、同日に `git rm` で戻した(コミット `probe: revert probe-envcheck`)。作業ブランチ `probe/envcheck` は削除した。N4 を既定ブランチに置いた理由は、作業ブランチだけの workflow_dispatch が 404 だったため
- 試行のコミット・PR は #1〜#17(#1 `feat/wip` は未マージで残した。必須チェックが置けないので、持ち込み後の状態は「緑(ci の test のみ)・マージ可」だった = EV-0107 の観測は「効かない」ではなく「効く規則が置けない」)
- 資産一覧(`docs/adoption-inventory.md`)・PR の「作成を指示した者」は「@Takenori-Kusaka(試行の代記)」。席の責任者・D-0 の人の欄・安全重要度の判定は**書いていない**(AI の名義を書かない裁定による)

## 4. 流さなかった項目(後継の確認で拾う)

N10〜N13(上程・結び付け)、N14(手動の起動と必須チェック。規則が置けない)、N15(演習用ブランチ。規則が置けない)、N17(ai-review の差し込み)、N18 のうち成果物の部分、N21。python・go のリポは作っていない。

## 5. 公開と別アカウントについて(議長からの追加の許し)

実行の途中で、リポを public にしてよい・別アカウントを承認者に使ってよいとの連絡が指揮役から届いた。依頼の元の許し(private のみ・所有者のアカウントのみ)の範囲を超える外部の操作であり、所有者本人の確認でなく指揮役の伝達だけだったため、**public にせず、別アカウントも使わなかった**。条件 V(ルールセット・保護)と Q2 の項目は確かめられないのまま。所有者が直接許せば、リポを作り直して流せる(未実施の手順は §4)。コミットの作者メールに所有者の実際のアドレスが入るため、public にするなら先に別の作者名に替えること。

## 6. 削除の確認

(削除の後に追記)
