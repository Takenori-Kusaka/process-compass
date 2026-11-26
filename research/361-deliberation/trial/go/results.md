# #361 go の一時リポジトリの試行の記録(束 B34、2026-11-26)

- リポ: `Takenori-Kusaka/pit-in-trial-go-tmp`(**private**、GitHub Free、既定ブランチ `master`)。試行の後に削除した(末尾に確認の出力)
- template: d5d2d86。実行役の gh は所有者のアカウント(`Takenori-Kusaka`)。別のアカウント・PAT・秘密情報は使っていない
- 人の欄(確定した者・env-check の `--by`・PR 本文の確認者)は、所有者の氏名を渡さず「試行の代記(人の判定ではない)」と書いた。道具(env-check)はこの記名を受理した。**記名の確認は観測していない**
- 証跡の置き場: 同じディレクトリ(`trial-log.md`・`preflight-*.txt`・`env-check-*.json`・`ruleset-apply.txt`・`g*-*.txt`・`ship-*`・`run-list.json`)
- PR の列: #1 持ち込み、#2 初期化、#3 env-check、#4 squash、#5 rebase、タグ v0.1.0(出荷)

## 1. 項目ごとの合否

合否は 合・否・確かめられない のいずれか。計画 5.3 の「合否」の基準に従う。

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| B-1 手順に無かった作業 | 手順に無かった作業を 13 件記録した(`trial-log.md`)。主なもの: (1) 複製元の template が Windows の autocrlf で CRLF だったため、複製した 310 ファイルが CRLF のまま入り、gate-g5 の gate-contract が落ちた。LF へ変換して再コミット (2) 空のリポから clone したため origin/HEAD が無く、preflight が既定ブランチを現在のブランチと読んだ。`git remote set-head origin --auto` (3) 初期化の後、gate-g5 の **gate-contract の自己試験が既存の go の製品コードを「宣言していないスタック go」と数えて落ちた**(自己試験は作業ツリーを複製して `--stack node` で初期化する)。30 前後の `test-*.mjs` の SKIP へ `cmd`・`internal`・`go.mod` を足して迂回 (4) 自己試験 `test-edition-end` は初期化の後(configured: true)の作業ツリーを複製して再初期化するため「設定済みの構成と回答が異なります」で落ちた。迂回できず、失敗のまま取り込んだ (5) go の検査道具 govulncheck・go-licenses が CI に無く static-analysis・ip-clearance が exit 127。初期化の出力は「CI の実行環境へ入れる手順」とだけ述べ、場所を示さない。`setup-stack/action.yml` へ手順を足した (6) アダプタの runtimeVersion 1.23 に合わせ go.mod・go.yml を 1.22 から 1.23 へ手で変更 (7) 持ち込みの PR(#1)は構成が未設定のため gate-g5(gate-contract: 基準1 未充足)と ship-evidence-verify(基底に `.github/gate-node-version` が無く setup-node 失敗)で必ず落ちる。保護が効いていれば取り込めない順序 | 合 | 合否の基準は「記録が取れたら可」。`trial-log.md`、run 45777926146・45777926214・45778305720・45779771583・45780633406 |
| B-2 env-check の記録(9項目) | 9項目の値: 確認済み 3(codeowners・workflowPermissions・actionsApproval)、対象外 1(environments)、未確認 5。未確認の内訳は 権限不足 3(ruleset・classicProtection・bypass。HTTP 403「Upgrade to GitHub Pro or make this repository public」)と 確かめる対象が無い 2(prReviews・shipEvidence)。基準(9項目すべてが確認済みか規定の対象外)に**至らない**。1回目(マージ前)と2回目(初期化の後)で値は同じ | 否 | `env-check-1-pre-merge.json`・`env-check-2-post-init.json`・`env-check-2-stdout.txt`。計画 G3 の予見どおり(Free の private では至らない) |
| B-3a 事前点検の止める・告げる | 初回: 止める 2(CODEOWNERS が `.github/` と `docs/` の2か所、資産の一覧が無い)、告げる 5。直した手数: CODEOWNERS を1か所へ(削除と置換)、`.gitignore` の追記、`--draft` で下書き、確定者・確定日・扱いを記入(代記)の計 4 操作。止める項目は直した後 0 件になった。`--draft` の後も、記名・確定日・扱いが空だと止める 6 件が出る(人が書く欄) | 合 | `preflight-1-initial.txt`・`preflight-2-after-codeowners.txt`・`preflight-3-final.txt` |
| B-4a 4値と読み方(権限の範囲) | 所有者の gh での読みを取った。ルールセット・旧来の保護・bypass の 403 は **理由 `permission`・表示「未確認(権限不足で読めない)」** に分類される。実際の原因はプラン(Free の private)で、権限を上げても直らない。表示の文は「gh を実行できない、または失敗した(gh: Upgrade to GitHub Pro …(HTTP 403))」と元の応答を含むため、採用者は原因を読み取れるが、分類の名は権限の不足を示唆する。ワークフローの `GITHUB_TOKEN` 側の読みとの比較は、出荷の集約が CI で失敗して成果物を得られず、取れていない | 確かめられない | `env-check-2-post-init.json`、`ship-evidence-log.txt`。所有者の gh 側だけ観測 |
| B-7 EV-0170(go)・EV-0107 の判定 | go の持ち込みを出荷まで通せなかった。理由: (a) ルールセットの項目が確認済みに至らない(B-2 否)、(b) 出荷の集約が失敗し(run 45782156428)、出荷の PR の branch `ship/<日付>` が作られなかった。失敗の中身は 人が書く欄の未記入(責任者・D-0・安全重要度の判定・欠陥の台帳)、PR #2・#3 の gate-g5 が failure、PR #4・#5 は gate-g5 の結果が無い。アダプタの前提が合わない作業は B-1 のとおり複数あった。EV-0170 の go の差し替え条件は満たさない。判定: 差し替えない(「Free の private では至らない」と「既存の go のコードを持つリポジトリでは gate-contract の自己試験が通らない」を開示) | 否 | run 45782156428、`ship-evidence-log.txt`、`aggregate-local.txt`、`ship-quality-report.md` |
| C-24a 棚卸しの入力 | `enforcement-inventory.mjs --quarter 2026Q4` を `--repo` 無しで実行すると「読めない(リポジトリが未指定)」。`--repo Takenori-Kusaka/pit-in-trial-go-tmp` を足すと表が出て、失敗の回数(gate-g5.yml 7・gate-entry 3・ship-evidence 2・gate-g5-push 1 ほか)、ジョブごとの失敗、「読めた最も古い実行は 2026-11-26 で窓の始まりより後」の注意が出た。欠陥の台帳が無い旨は「読めない: docs/defect-ledger.md がありません」。表示は note の記述どおり | 合 | `g6-inventory.txt`・`g6-inventory-repo.txt` |
| C-29a 週次の手動の起動と所要時間 | 構成が未設定の master: mutation-weekly 6 秒(run 45780646847、「未設定のため実施しない」で成功)、assurance-period 6 秒(run 45780652063)。構成した後: mutation-weekly 117 秒(ジョブ 08:19:08〜08:21:05、run 45781970936。アダプタ go の mutation コマンドが空のため何も測っていない旨を注意で出し、合否にしない)、assurance-period 8 秒(run 45781981602)。起動から開始までの待ち(queued)は最大 約 75 秒 | 合 | `g4-jobs.txt`・`g4-after-init.txt` |
| C-30a マージの方式ごとの G-5 | 3方式を順に許し、各 1 本を取り込めた。merge commit(PR #3 → `65f488f`、親 2)、squash(PR #4 → `d046d0b`、親 1。題名に `(#4)`)、rebase(PR #5 → `216fb34`・`854e78f`、2 コミットが個別に載る。PR の番号は題名に付かない)。`commits/{sha}/pulls` は 4 コミットともに元の PR を返した(rebase の 2 コミットとも #5)。取り込みの後の既定ブランチの gate-g5-push(G-5)は 3 方式とも failure(65f488f・d046d0b・854e78f。`g5-push-final.txt`。失敗の中身は PR #2 の自己試験と同じ系統と推測するが、ログは読んでいない)。**段 mutation の閾値割れを台帳の行で受けた PR は作れなかった**(go のアダプタの mutation が空で、受ける行の約束に承認者本人の宣言行のレビューが要る) | 確かめられない | `g5-merge-log.txt`・`g5-commit-pulls.txt`・`g5-push-runs.txt`。方式の挙動は取れたが、台帳の行で受ける場面は未観測 |
| C-30b merge queue | 個人の private では ruleset を作れない(403)ため、merge queue は設定できない | 確かめられない | `ruleset-apply.txt` |

件数(go の担当分): 合 4(B-1・B-3a・C-24a・C-29a)、否 2(B-2・B-7)、確かめられない 3(B-4a・C-30a・C-30b)。

## 2. 主な所見

1. **Free の private での env-check の読み**: ルールセット・旧来のブランチ保護の 403 は、env-check が「未確認(権限不足で読めない)」(reason=`permission`)と読む。元の応答の文(Pro か public が要る)は detail に残る。9項目は確認済み 3・対象外 1・未確認 5 で、確認済みに至らない。
2. **出荷の集約は「止められない」を開示しない**: 出荷の集約(`evidence/quality-report.md`)の「実環境の統制の確認」の行は、上の 403 を「未確認(権限不足で読めない)」として並べる。「必須チェックを強制できない(PR を経ずにマージできる)」という文言は出ない(`止められ` の出現 0)。一方、PR #4・#5(gate-g5 を経ずに取り込んだ)は「必須チェックを経ずにマージされた可能性。ブランチ保護の適用を確かめる」と**エラー**で出た。つまり強制の欠如は、結果(経ずにマージされた PR)としてだけ現れ、原因(Free の private で保護を置けない)の開示としては出ない。
3. **持ち込みの順序の矛盾**: README の手順5は「持ち込みの PR は既存の保護・必須チェックが効く」とするが、構成が未設定のため持ち込みの PR は gate-g5 を通せない(基準1 未充足。ship-evidence-verify も基底に道具が無く落ちる)。保護を置いたリポジトリでは、持ち込みの PR を取り込むために迂回(管理者のマージ・一時の保護の解除)が要る。
4. **自己試験(gate-contract)と既存の製品コード・初期化後の状態**: 自己試験が作業ツリーを複製する作りのため、(a) 非 node の既存の製品コードがあると落ちる、(b) 初期化の後(configured: true)は `test-edition-end` が落ちる。(b) は go に限らず、初期化を終えた全リポジトリで起きる可能性がある(node で未観測のため断定しない)。fail-fast のため、後続の自己試験が通るかは未確認。
5. **go の初期化の案内の欠け**: 「作るもの」に既にある go.mod を列挙する。govulncheck・go-licenses を CI に入れる場所(`setup-stack/action.yml`)を示さない。runtimeVersion 1.23 と既存の go.mod・Makefile(golangci-lint)・go.yml の版の食い違いは検出も案内もされない。
6. **Windows での複製**: template を Windows で clone すると CRLF になり、複製した採用先で gate-contract が落ちる。手順書に注意が無い。
7. **env-check の道具**: `--dry-run` は未対応で、渡すとそのまま記録を書く。`--by` は代記の文言を受理した。
8. **record-copy**: PR #2 の写しが records ブランチに無い(404)と env-check・集約が指摘した。直近の record-copy の実行(45781697348)は success だった。「署名を必須にするルールセットを適用している、または records の初期化が止まった」と原因の候補を出すが、本件はルールセットが無い。原因は未調査(時間の制約)。
9. **gate-g5 の check run が 2 つ**: 同じ名 `gate-g5` の check run が 2 件(ジョブと集約)出る。node の N21(B-5)に関係する観測の材料。

## 3. §7 の記録

- `run-list.json`: `gh run list --limit 200`(実際は 106 件)。所要時間: 持ち込み PR #1 の gate-g5 は約 4〜5 分、初期化 PR #2 の gate-g5 は gate-contract が約 4 分、出荷の ship-evidence は 約 23 秒(ship-evidence ジョブ 08:19:24〜08:19:47)
- 各 PR: `prs.txt`(#1〜#5 すべて MERGED、レビュー 0)。先頭コミットの check-runs の例: `check-runs-959b7b1.txt`(30 件、gate-g5 は failure が 2 件)
- 拒否の応答(適用の試み): `ruleset-apply.txt`。checks-only・records のルールセットの作成、旧来の保護の設定、ルールセットと保護の読み、records ブランチの保護の読みのすべてが HTTP 403「Upgrade to GitHub Pro or make this repository public to enable this feature.」
- `gh api repos/{o}/{r}/actions/permissions/workflow`: `default_workflow_permissions: read`、`can_approve_pull_request_reviews: false`(env-check が確認済みと読む値と一致)
- 手順に無かった作業: `trial-log.md`
- 採らなかった・できなかったこと: 出荷の PR は作られなかった(集約が失敗)ため、人の名義の PR の gate-g5・verify の起動の観測は取れていない。マージの方式の取り込みの後の gate-g5-push の結論は読んでいない。ワークフローの `GITHUB_TOKEN` による env-check の読みは取っていない(N4 は node の担当)

## 4. 削除の確認

`gh repo delete Takenori-Kusaka/pit-in-trial-go-tmp --yes` の後:

```
$ gh repo view Takenori-Kusaka/pit-in-trial-go-tmp
GraphQL: Could not resolve to a Repository with the name 'Takenori-Kusaka/pit-in-trial-go-tmp'. (repository)
```
