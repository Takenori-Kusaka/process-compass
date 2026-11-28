# 段 F2(試験用リポジトリでの実機の確認。まとまり 2)— 実装の結果

- 日付: 2026-11-28。template は `d4-466` の e0a5b34 を `git archive` で scratch へ取り出して使った。template・本体の本文は変えていない。作業は scratch の `f2/`(`repo/` が試験用の複製)
- 結論: 検査の結論の段階(gate-g5-base・集約)は、項目 2〜7 のうち確かめた範囲で動いた。**ルールセットの受理(項目 1)は前回と同じ 403 で確かめられなかった**。「PR がマージできる/できない」の強制は、private・無償のプランでは確かめる手段がない

## 1. 許しの条件を守った記録

| 条件 | 結果 |
| --- | --- |
| 1 名前・private | `Takenori-Kusaka/pit-in-trial-466f2-tmp`。作る前に GraphQL が「Could not resolve」(同名なし)。作成後 `visibility: PRIVATE` を確認。public にしていない |
| 2 秘密情報 | secrets 0 件・variables 0 件(API で確認)。`.env` は読み書きなし。全コミットの作者は `22556919+Takenori-Kusaka@users.noreply.github.com` の 1 種だけ。名簿は架空(試験 甲=所有者のログイン、乙・丙=存在しない架空のログイン名) |
| 3 ほかへ触れない | 触れたのは試験用リポジトリの中と、自分のリポジトリ一覧の確認だけ。ほかのリポジトリ・アカウント・組織の設定へは触れていない。`E:/Github/process-compass` へも触れていない |
| 4 削除 | 作成前に `gh auth status` で `delete_repo` を確認。`gh repo delete --yes` の後、`gh repo view` が「Could not resolve to a Repository」、`gh api repos/...` が 404 Not Found、一覧に名なし(0 件)。**消えた** |
| 5 手元の作業 | scratch のみ。作業ツリーで書いたのはこのファイルだけ |
| 6 Actions の実行 | **目安の 60 を超えた(合計 130 実行)**。内訳: delegation 40・gate-g5 20・gate-g5-base 20・review-queue-control 20・gate-g5-push 14・ai-review 7・pre-review-responded 7・fake-deploy 1・record-copy 1。理由は §4-1 の足場の不備(トレーラの形式・仕様の置き場)で PR の本文を何度か直したこと。1 PR を 1 つ編集するたびに 5 つの workflow が動き、delegation と review-queue-control が 2 回ずつ数えられる。この点は議長へ報告する |

## 2. 構成の作り方(再現の手順)

1. 取り出した template を複製し `git init`。`.github/CODEOWNERS` の `@OWNER` を所有者のログイン名へ置換
2. `generate-profile.mjs --answers`(q-team-size=size-3-9・q-biz-phase=**growth**・quality-standard・cl0・inhouse・gates-none・ai-free。q-external-reviewer は 3〜9 名では聞かれない)、`--stack node --template-commit e0a5b34`。結果: `ruleset: team-core`、`review.requiredApprovals: 0`、`review.mode: internal-separated`、`delegation.rules: []`。出力に「ブランチ保護: `gh api repos/{owner}/{repo}/rulesets --input .github/rulesets/team-core.json`」が出て、`team-core.json` は承認数 0・必須チェック gate-g5 と gate-g5-base・`require_last_push_approval: true`。**この点は動いた**(構成からの導出)
3. D-0 を `templates/00-d0-governance.md` から `docs/D-0-governance.md` へ先に写す。`--change`(kind accountable、`seatsByPerson`)で名簿 3 名と席を置く(甲=価値責任者・技術判断者・開発者・コンテキストオーナー・事業決裁者、乙=独立レビュア・AI維持管理者、丙=出荷判定者・AI運用担当者。`decidedBy` は甲)。受け付けられた
4. `--change`(kind mode)で `delegation.protectedPaths: ["src/core/**"]`(`src/core/core.js` を追跡済みにしてから)
5. 足場の追加(§4-1): 仕様 `specs/F-001/spec.md` と計画 `specs/F-001/plan.md`(Task-1 依存なし・Task-2 依存 Task-1・Task-3 依存なし)を main へ。PR は branch を main から切る(PR の側に spec.md が要る)。PR 本文の末尾の段落にトレーラ `Spec: F-001 / Task-N`

## 3. 項目ごとの結果

| # | 確かめたこと | 結果 | 証拠の要点 |
| --- | --- | --- | --- |
| 構成 | S2・CL0・標準・委任なしで team-core・承認 0 | **動いた** | 上の §2 の 2。`process.config.json` の `ruleset: team-core`・`review.requiredApprovals: 0` |
| 1 | ルールセット(承認 0+必須チェック)の受理 | **確かめられなかった** | `POST rulesets` が 403「Upgrade to GitHub Pro or make this repository public」(前回と同じ)。private・無償のプランの制約 |
| 2 | 範囲の外の R2(`src/app/other.js` のみ)で gate-g5-base 成功。確定者の記名なしで落ちない | **動いた** | PR #1 の run 46089232219 が success。ログ: 「G-6 の承認者 0 名 / 要求 0 名。取り込む前に人が読む範囲の外の変更のため、取り込む前の承認は求めない(出荷判定までに…欠落に数える)」。注意: 「リスク区分の確定者: …確定者の記名は取り込む前には求めない」。確定者の欄は空のまま。PR #6(Task-2)の run 46089367469 も success |
| 3 | 範囲の中の PR で失敗し、当たった行が出る | **動いた(4 種)** | コア機能(PR #2): 「…コア機能・確約範囲のパス: src/core/core.js のため、取り込む前の承認を求める…独立した人の承認 0 名 / 要求 1 名」/ 仕様(PR #3): 「機能仕様(specs/**): specs/F-001/spec.md」/ 依存の宣言(PR #4): 「依存の宣言・ロックファイル・.gitmodules: package.json」/ R1(PR #5): 「リスク区分が R1(記載または区分の下限)」。すべて error で gate-g5-base 失敗。warning に「マージの前に、名簿の別人が自分の挙動要約を付けて承認する」。**確かめなかった**: `process.config.json` の変更(範囲の中の行)・統制の設定の 5 種の個別 |
| 4a | 取り込みが本番を起動する workflow(push・`environment: production`・echo だけ)を main へ入れた後、範囲の外の PR が承認を求める側へ倒れる | **動いた** | PR #6 の run 46089457997。error: 「取り込みが本番への反映を直接起動する workflow がある(.github/workflows/fake-deploy.yml)ため、すべての変更を取り込む前に読む(承認を求める)」。範囲の外の非コア PR が、直前の run(46089367469)の success から失敗へ変わった |
| 4b | 閉じた時に動く形(`pull_request: types: [closed]`・`environment`)でも倒れる | **動いた** | 同じ PR の PR 本文の編集で再実行。同じ error(fake-deploy.yml)。最新の run を読んで確認 |
| 4c | 外した後に戻る | **確かめなかった** | workflow を外した後の再実行をしていない(実行の上限を超えていたため)。外した main の push の gate-g5-push は動いた |
| 5 | 範囲の外を取り込んだ後、出荷の証跡の集約が「出荷の前の確認が済んでいない」欠落として出し、取り込みの日時から経過日数を出す | **動いた** | PR #1 を squash で取り込み(mergedAt 2026-11-28T00:42:55Z)、`aggregate-evidence.mjs --from 17499a6 --to main --exception-day …` を手元で実行。欠落: 「PR #1: 独立した人の確認を経ていません…(取り込む前に人が読む範囲の外の変更…出荷の前の確認が済んでいない)」と「PR #1: リスク区分 R2 の確定者の記名がありません…」。投影: 「出荷の前の確認が済んでいない変更…: 1 件(#1)。最も古い変更の取り込みからの経過 0 日」。`--exception-day 2026-12-10` では「経過 12 日」(mergedAt を起点にすることを確認)。項目 2 の宣言の表は「適用(事業ステージ S2。…)」。なお実行自体は終了コード 1(欠落があるため) |
| 6 | 取り込んだ後に本人が付けたレビュー(COMMENTED)が数えられない | **動いた** | PR #1 取り込みの後、本人の COMMENTED(2026-11-28T00:43:05Z)を付けた。集約は「独立した人の確認あり 0 件」「人のアカウントによる承認がない」のまま。別の人の承認の側は、アカウント 1 つのため**確かめられなかった** |
| 7 | squash 本文の末尾のトレーラ `Spec:` を基底の履歴から読む | **動いた(読めた側)** | PR #1(Task-1)を squash 取り込み。本文の末尾の段落に `Spec: F-001 / Task-1`。直後に走った PR #6(Task-2、plan.md の依存が Task-1)の gate-g5-base が success で、依存の未取り込みの行は出なかった。**確かめなかった**: 取り込む前(Task-1 が基底に無い)に Task-2 の PR が範囲の中へ倒れる側(試験 test-deferred-review の場面では確認済み。実機では実行の上限で省いた) |
| 付 | `review-queue-control` の `risk-label`(前回 403) | **通った** | 全 PR で成功(`gh pr checks` の risk-label pass)。template は `statuses: read` を持つ(48 行)。前回の不具合は直っている |
| 付 | `gate-g5` の `gate-contract` の git 名義の失敗 | **出なかった。別の原因で落ちた** | 落ちた理由は `test-g5-aggregate.mjs` の 6 件(「needs にあるジョブを消すと…」ほか)。原因は足場: 取り出した template の作業ツリーが CRLF で、試験の正規表現 `\n {2}secret-scan:\n…` が CRLF の `gate-g5.yml` に当たらない。**手元の Windows でも同じ 6 件が落ちた**。LF の clone では落ちない見込み(本体の記録では WSL の LF で全通過)。足場の事情と区別する |
| 付 | test・static-analysis・mutation・ip-clearance・regulatory の失敗 | **足場の事情** | `npm ci` が package-lock.json 無しで EUSAGE。製品のコードが空のため。gate-g5 の失敗はこれらによる |

## 4. 動かなかった点・template の不具合

1. **試験の足場の不備で実行を超えた(template の不具合ではない)**。最初の PR 本文でトレーラ `Spec: setup` を本文の中ほどに書いたこと、`specs/F-001/spec.md` と plan.md を main に置かなかったこと、PR の branch を spec 追加前の main から切ったことで、gate-g5-base が「Spec の形式が違います」「末尾の段落にありません」「指す仕様 specs/F-001/spec.md がありません」で落ちた。いずれも gate-g5-base の出力は意図どおりで、**PR の側の head に spec.md が要る**こと(`origin/main` に置くだけでは足りず、PR の branch へ main を取り込む)が、採用者が最初に当たる落とし穴である。template の README か `/gate` の案内に、初回の PR の準備(仕様と計画を先に取り込んでから PR の branch を切る)を書く価値はあるが、不具合とは断定しない
2. **再実行(Re-run)は「古い版」で判定する**。`gh run rerun` で gate-g5-base を再実行すると、定義とスクリプトが既定ブランチの違う版になり、ログに「定義(…)とスクリプト(…)が既定ブランチの違う版です(再実行の間に既定ブランチが進んだ)。新しい版で判定し直すには PR の本文を編集するか push する」が出る。これは template の意図された注意の出力で、動いた。範囲の中で承認が足りないとき「承認の後に gate-g5-base の最後の実行を再実行する」という案内と、既定ブランチが進んだ場合の挙動(古い版で再判定される)の間に、採用者が混乱する余地がある。**不具合とは断定しない**(議長が判断)
3. 本体の項目で、`process.config.json` を触る PR・統制の設定 5 種を個別に当てる確認は行っていない
4. 実行の件数が 130(目安 60 の 2 倍超)。PR 本文の編集 1 回で 5 つの workflow が動く構造のため、確認の組み立て(本文を直さずに済む足場を先に作る)を改めれば減る

## 5. 実装マークの扱い(IMPL-1069〜1072)

実機で確かめられた(マークを `delivered` に進めてよいか議長が判断):

- IMPL-1069(範囲の判定・範囲の外に取り込む前の承認を求めない・範囲の中に求める・範囲の外の R2 の確定者の記名を取り込む前に求めない): 範囲の外(PR #1・#6 の success、確定者なし)、範囲の中(コア・仕様・依存・R1 の失敗と当たった行)。**確かめていない**: 範囲の他の行(統制の設定・テストの削除・依存タスク未取り込みの側・規則のパス)、別の人の承認で通る側、承認後の push での失効
- IMPL-1070(集約が範囲の外の変更を識別し、欠落・経過日数・確定者の欠落を出す): PR #1 で欠落 3 件・経過日数 0/12 日・項目 2 の宣言の表。mergedAt が起点であることを確認。**確かめていない**: 「集約が範囲の内を別に数える」「例外承認の対応づけ」「積み重なり」
- IMPL-1071(取り込みが本番を起動する構成の構文の検出を、起動する側へ倒す): push 形と `pull_request: [closed]` 形の両方で実機に倒れた。**確かめていない**: 手動の起動だけ・`delegation.yml` の `delegated-merge` を数えない側・ほかから呼ばれる再利用の workflow
- IMPL-1072(この段で対応させる内容を本体の台帳で確かめていない。議長が突合する): 該当する挙動が上の「確かめていない」に当たるものは `undelivered` を維持する

`undelivered` のまま残すもの(実機で確かめられなかった):

- team-core ルールセット(承認数 0+必須チェック)の GitHub による受理と、PR を実際にマージできる/できない(403)。ルールセットに頼る強制全般
- 別の人の承認の後の再実行で通る側・`require_last_push_approval` の挙動(アカウント 1 つ)
- 取り込む前(Task-1 が基底に無い)の依存タスク未取り込みの側(実機)
- 閉じた時の workflow を外した後に承認なしへ戻る側
- `process.config.json` の変更が範囲の中に当たる行(実機)

## 6. 議長へ渡すこと

- §1 の条件 6(実行 130 件)が目安を超えた
- ルールセットの受理は前回に続き確かめられていない。private・無償のプランでは確かめる手段がない(public か Pro が要る)。許しは所有者が決める
- 前回の `risk-label`(403)は template で直っていることを実機で確認した
- 前回の `gate-contract` の git 名義の失敗は出なかった。今回の失敗は CRLF の足場に起因し、template の不具合ではない見込み(LF の clone では確かめていない)
- 試験用リポジトリは削除済み。scratch の `f2/` は手元に残る(`repo/` は GitHub への参照を持つが、リモートは消えている)
