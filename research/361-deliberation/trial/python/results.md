# #361 python 試行の結果(pit-in-trial-python-tmp、private、2026-11-26、template d5d2d86)

実行役の記録。単一の試行・合成のリポ・同じ人の操作。根拠の水準は E2(単一事例)。人の名義の欄は「試行の代記(人の判定ではない)」で埋めた(所有者の氏名・AI の名義は書いていない)。

## 1. 項目ごとの結果

| ID | 観測 | 合否 | 証跡 |
| --- | --- | --- | --- |
| B-1 | 手順に無かった作業 8件(trial-log.md)。主なもの: 持ち込み PR #1 は、ベース側(main)にテンプレートの道具が無いため ship-evidence-verify が `.github/gate-node-version does not exist` で必ず落ちる。dev 依存の追記。D-0 の複製 | 合 | trial-log.md、run 45777903941 |
| B-3a | 事前点検: 1回目 止める5件(CLAUDE.md の目印・規則138件欠落、CODEOWNERS 2か所、@OWNER、資産一覧)・告げる7件 → 手動の直し(CLAUDE.md・README・.gitignore の連結、直下 CODEOWNERS の削除、@OWNER の置換、`--draft` で一覧)で2回目 止める0件。直下の CODEOWNERS と scripts/CLAUDE.md は期待どおり止める・告げるに出た | 合 | preflight-1-before.txt、preflight-2-after-fix.txt、adoption-inventory.md |
| P1(B-3a 補) | 既存のルールセット(承認1・必須 pytest)と旧来の保護(必須 lint)を置けない。持ち込み PR を止める挙動は観測できない | 確かめられない | rulesets-response.txt(HTTP 403「Upgrade to GitHub Pro or make this repository public」) |
| EV-0170(python のアダプタの前提) | 既存の dev extras(pytest・pytest-cov・ruff)に pip-audit・pip-licenses が無く、初期化の出力が「作るもの」として列挙。追記後も gate-g5 の ip-clearance が「ライセンス違反 2件」で失敗(中身は未調査)。`requirements-dev.txt` と extras の二重管理が残る | 否(アダプタの前提が合わない作業が生じた) | init-output.txt、run 45778327340(ip-clearance) |
| B-2 | env-check 9項目: 確認済み 3(CODEOWNERS の所在・Workflow permissions 既定・Actions の PR 承認不可)、対象外 1(Environment なし)、未確認(権限不足で読めない)4(ルールセット・旧来の保護との重なり・bypass・records の保護)、未確認(対象がまだ無い)2(PR レビューの取得・成果物の取得)。9項目すべて確認済みか対象外ではない | 確かめられない(403) | env-check.json |
| B-4a | gh は所有者の名義だが、403 は権限ではなくプラン(Free の private)の制約。env-check はこれを「未確認(権限不足で読めない)」と表示し、権限の不足と区別しない。ワークフロー側(`GITHUB_TOKEN`)との比較は node の試行で行う | 確かめられない | env-check.json、rulesets-response.txt |
| B-7(EV-0107・EV-0170 python) | 既存のワークフローとの併存(test・lint が gate と並走し通過)は確認。ルールセットとの重なり・出荷までは確認できない | 確かめられない(一部は合) | runs-summary.txt |
| 所見(env-check) | `record-copy.yml` の直近の実行を「一致しない」と読んだ(読んだ時点で run 45778610014 が実行中、後に success)。実行中の run を不一致と誤読する | (記録のみ。参考) | env-check.json、run 45778610014 |
| C-17 | delegation.yml は既定(無効)のまま。PR #3・#6 で delegation-eligibility は必須でないステータスとして success、説明は「該当しない(協働。人の確定を受ける)」。理由は `delegation.protectedPaths` が構成に未登録(条件5を判定できない)。承認は付かず、delegation-merge は skipped。「該当になる」PR は、初期化の構成では委任の範囲が空のため作れなかった | 合(該当しない側のみ。該当する側は未確認) | PR #6 のステータス、run 一覧 |
| C-18 | PAT・Environment を置けない(Q3) | 確かめられない | 計画 §10 |
| C-27 | 設定A(COMMIT_OR_PR_TITLE+COMMIT_MESSAGES)で PR #4(2コミット、PR 本文の末尾に `Spec: F-001 / Task-1`)をスカッシュ: メッセージは「feat: add sub (#4)」+ コミットの箇条のみ。PR 本文のトレーラは入らない。設定B(PR_TITLE+PR_BODY)で PR #5(`Spec: F-001 / Task-2`): メッセージに `Spec: F-001 / Task-2` が入るが、その後に GitHub が `---------` と `Co-authored-by: …` を付け、末尾の段落が Co-authored-by になる。`specTrailersOf` は両方とも `[]`。`next.mjs` は pr-1〜3 の写しを機能へ対応づけられないと出し、F-001 の済みのタスクは出ない。Co-authored-by が付く条件(コミットのメール・PR のコミットが2つ)は未切り分け | 合(2設定の結果は記録した)。所見: B でも末尾の段落が `Spec:` にならず、数えられない | 既定ブランチのコミット a369ae7・6ae143c、runs-summary.txt |
| C-6a | `state:ready-to-merge` の PR #6 に本人のコメントのレビューを付け、`next.mjs --pickup state:ready-to-merge 6`。PR のレビューを読み、「G-6 の通過(承認者本人の挙動要約つきの承認)が無い」として「着手しない」と出した。コメントのレビューは承認に数えない | 合 | pickup-out.txt |
| C-4・C-5・C-6b・C-1 | 別のアカウントを使わない(Q2) | 確かめられない | 計画 §10 |
| P10 / B-7(出荷) | タグ v0.1.0 → ship-evidence が失敗(PR #2・#4・#5・#6 に「独立した人の承認が無い」、PR #4・#5 に「作成側の検証の記載が無い」)。`ship/` ブランチが出ず、出荷の PR を開けない。承認は別のアカウントが要る | 確かめられない(出荷まで通らず) | run 45779434316 |

件数: 合 5(B-1・B-3a・C-17(一部)・C-27・C-6a)/ 否 1(EV-0170 のアダプタの前提)/ 確かめられない 9(P1・B-2・B-4a・B-7・C-18・C-4・C-5・C-6b・C-1。出荷を B-7 に含める)。

## 2. 所要時間(gh run の updatedAt − createdAt。runs-summary.txt、runs.json)

- gate-g5(PR の契機)98〜151 秒(失敗: D-0・project-brief・ip-clearance が人の記入・欠落)。gate-g5-base 12〜33 秒。test・lint(既存)10〜45 秒。ship-evidence 11〜27 秒。run は 101 件。
- 持ち込み PR #1 から初期化 PR #2 のマージまで約 10 分。

## 3. §7 の記録

- 応答(403): rulesets-response.txt。PR: prs.txt。run: runs.json・runs-summary.txt・run-gate-g5-pr2-jobs.json。env-check.json、preflight-*.txt、adoption-inventory.md、init-output.txt、pickup-out.txt。
- rulesets・branch protection の適用後の応答は、適用が 403 のため取れない。

## 4. 手順に無い・前提が合わない所見(後段の材料)

1. 持ち込みの最初の PR は、ベース側にテンプレートの道具が無いため pull_request_target 系が落ちる(手順書に無い)。
2. gate-g5-push が main への push で 4 回 failure(D-0 の人の欄の欠落)。保護が無いと、落ちた main のまま次の PR が続く。
3. env-check が「403 = プラン制限」を「権限不足」と表示する。実行中の run を「一致しない」と読む。
4. C-27: 両設定とも `specTrailersOf` が `[]`。

## 5. 削除

(下記)
