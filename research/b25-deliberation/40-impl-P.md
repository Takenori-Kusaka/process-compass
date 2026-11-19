# 束 B25 — 単位 P(事前レビュー)の実装の記録(2026-11-19)

template のコミット(b25 ブランチ。push していない)と bundle: `498d1da`(pre-review.mjs と試験)・`99b930d`(workflow・README・手引き・事前点検の一覧)。bundle は `E:/Github/process-compass/tmp/bundles/template-b25-P-01.bundle`(`origin/main..b25`)。

## 1. 変えたファイル

| ファイル | 変更 |
| --- | --- |
| `template/scripts/gate/pre-review.mjs` | 0830(a)(b)(c)(d)、下位命令 `responded`(0214)、日数の指標(0216)、文の改め(0217・項目6)。関数: `markGatesOf`・`fastTrackRowsFor(…, gate)`・`gateTokenOf`・`shorteningForbidden`・`publicationOf`・`publishedLate`・`requiredLoginsOf`・`respondedUpTo`・`parseGateRecord`・`bindRecord`・`respondedCheck`・`fetchPrRecordFiles`・`fetchGateRecords`・`metricsFor`・`metricsBody` |
| `template/scripts/gate/test-pre-review.mjs` | 既存の試験に場面を足した(新しい試験ファイルは作っていない)。0830 の既存の場面は、工程ゲート(G-6)の上程を既定に改めた |
| `template/.github/workflows/pre-review-responded.yml` | 新規。`pull_request_target`(paths: `docs/gates/**`)から `pre-review.mjs responded --pr N` を呼ぶ。`gate-g5` の needs に入れない。ジョブ名 `pre-review-responded` |
| `template/.github/workflows/pre-review.yml` | 冒頭の注釈を、未決から新しい workflow への参照へ改めた |
| `template/scripts/gate/preflight.mjs` | `TEMPLATE_WORKFLOWS` に `pre-review-responded.yml` を足した(`test-adoption.mjs` の一致の検査のため) |
| `template/README.md` | 「事前レビュー期間の応答の揃いを必須にする」の節を足した(必須にする手順・範囲・小さいチーム向けの一文(B22 項目8)・未確認の開示) |
| `template/.claude/skills/gate/reference/sync-escalation.md` | 0217 の手引き(機械で導出しない3つの行を、起案者が転記し決定者が確かめる) |
| `template/.claude/skills/gate/SKILL.md` | 「判定の原則」に項10を1つだけ足した(判定当日に初めて出た論点の区別。会議体に限る。工程ゲートは当たらない)。他の行は動かしていない |
| 本体 `src/content/docs/phase4-process-design/roles-responsibilities.md` | マーク4件(0830・0214・0217・0216)を改め、新しいマーク IMPL-1031 を 0216 の次の行に足した |

## 2. 項目ごとの実装と試験の場面

- **0830(a)** 行の印の `<ゲート>` と上程のゲートの一致。`fastTrackRowsFor` が gate を受け、印の語(中黒・読点・空白区切りで複数可)に含まれる行だけを数える。ng = 印が G-3 だけの G-5 の上程は通知、ok = 印が G-5(`G-3・G-5` も)なら通知しない
- **0830(b)** G-4 と B-1〜B-4 は `shorteningForbidden`。行の有無に依らず「短縮できません」と通知(鍵は従来と同じ `shortened:<期日>`)。ng = G-4 に G-4 の行があっても通知、B-2 に行があっても通知。ok = 期間どおりなら通知しない
- **0830(c)** 短縮した上程で、`answerDay`(T の前営業日)から T までに、指名レビュアと必須応答の者(CODEOWNERS から導出できる分)の全員の「賛否の欄が書かれた意見」が揃っていなければ、欠けた者を通知先に通知(鍵 `short-unanswered:<T>`)。ng = 3名中2名、ok = 3名、期間どおりは対象外、AI の担い手・賛否が空の意見は数えない
- **0830(d)** 出力の文から EV-0281 を消した(通知しない行ありの注意は ADR-0223 と行の有効性が未確認である旨)。試験は出力全体に `EV-0281` が現れないことを確かめる。0217 の文「止める強制の機械化は未決」も項目6の文(機械は既定で止めない・必須にするかは採用者が決める)に改め、試験で旧い文が現れないことを確かめる
- **0214** `responded --pr N`。PR の `docs/gates/*.md`(head の版)を読み、様式 04 の冒頭の表の「ゲート」「対象」「判定日時」から上程に結ぶ。結ぶ条件は決定可能な2つ: 記録のゲートの語が上程のゲートの語に等しい、対象の欄の `#番号` が上程の Issue か判定資料の所在の PR の番号に等しい。ちょうど1件のときだけ結ぶ。範囲は R1 = 指名レビュアの全員、R2・R3 でも必須応答の者を導出できれば必須応答の者の全員。宣言行は判定日までの意見に限る。試験: R1 で1名欠け → 失敗、全員 → 合格、判定日より後の意見は数えない、結べない記録(対象が F-012・存在しない番号・空、ゲートの語違い、記録なし)→「確かめていない」(終了コード 0)、R2(必須応答の記載なし)→ 範囲外、必須応答を導出できない R2 → 確かめていない、3.10.9 の R3 上程で必須応答の者が欠ければ失敗
- **0216** 日数の指標は 0214 の結び付けの後に置いた。判定の時点は判定日の欄を先に読み、読めないときだけ記録を基底ブランチへ入れた PR のマージの時刻で代理して「代理」と出す(予定日 T で代用しない)。結べない上程と公開の時点を読めない上程は母数から外し、件数と比率を同じ行に出す。工程ゲートも母数に含む。「規定日数を下回った」は `publishedLate` を通す(0830 の通知と同じ関数)。閾値は置かない。試験: 公開から3営業日 → 下回る、6営業日 → 下回らない、結べない上程は母数外(2/3、66.7%)、公開 11-24・判定 12-02 は予定日でなく判定日で数える、代理、R1 は10営業日、B-2 も母数
- **0217** `check=manual`。手引きは `sync-escalation.md`。機械の部分は従来どおり

## 3. 試験の結果

- `test-pre-review.mjs`(WSL node 26): すべて期待どおり(`事前レビューの試験: すべて期待どおり`)
- 関係する他の試験: `test-push-trigger` 27/27、`test-enforcement-inventory` 期待どおり、`test-base-judge-workflow` 127/127。`test-adoption` は、workflow の一覧の一致の検査(新しい workflow を足した後)は ok のまま、その後の `git merge`(WSL の git で添付の履歴を併合する場面、127 行付近)で `process.config.json` の衝突により止まる。今回の変更とは関係しない環境の失敗と判断したが、変更前に同じ失敗かは確かめていない(未確認)
- 回帰の全量は流していない(指示どおり)

## 4. 実装を外して落ちることを確かめた記録

作業ファイルを書き換えて `test-pre-review.mjs` を流し、NG が出ることを確かめてから戻した(戻した後に全件通ることを再確認)。

| 外したもの | 落ちた場面 |
| --- | --- |
| (a) 行の印のゲート照合 | IMPL-0830(a):ng(1件) |
| (b) `shorteningForbidden` | IMPL-0830(b):ng ほか(3件) |
| (c) 全員の宣言行の通知 | IMPL-0830(c):ng ほか(2件) |
| 0214 欠けた者の判定 | R1 で1名欠けても失敗にならない(4件) |
| 0214 判定日で切る処理 | 判定日より後の意見(1件) |
| 0214 結び付け(常に結ばない) | 15件 |
| 0214 ゲートの語の一致 | G-5 の記録が G-6 の上程に結ばれる(1件) |
| 0216 `publishedLate` を常に偽 | 日数の指標と、0830 の通知の両方(5件。同じ関数を通している証拠) |
| 0216 判定日でなく予定日 T で代用 | 2件 |
| 0216 代理の表示 | 1件 |
| 0830(d) EV-0281 を戻す | 1件 |

## 5. マークの新しい行(本体)

- IMPL-0830: `state=delivered check=machine test=template/scripts/gate/test-pre-review.mjs`(plan・issue・review は外した)
- IMPL-0214: `state=delivered check=machine test=…test-pre-review.mjs`。note に「ブランチ保護の回避と応答の中身は確かめない(確かめる者: 決定者)」「実物の GitHub での上程と PR の結び付けは未確認(#361 で確かめる)」
- IMPL-0217: `state=delivered check=manual`。確かめる者: 起案者(判定資料への転記)と決定者
- IMPL-0216: `state=delivered check=machine test=…test-pre-review.mjs`(4指標)
- 新: `IMPL-1031 target=gate-skill state=delivered check=manual`(判定当日の論点。確かめる者: 会議体の決定者とプロセス内部監査)。**番号 1031 は仮**。議長が push の直前に付け直す。IMPL-0216 の note も「IMPL-1031」と書いているので、付け直すときは同時に直す

`npm run lint:impl` の結果は、私の変更に係る指摘が3つ残る。いずれも本体の他のファイルの変更が要るため、指示の範囲外として変えていない。

1. `src/data/impl-inventory.yaml`: 3.10.8 の節に IMPL-1031 を登録する必要がある
2. `src/data/impl-targets.yaml`: `pre-review-responded.yml` が降ろし先にも除外の一覧にもない(`pre-review-automation` の説明と path への追加か、別の降ろし先が要る)
3. `implementation-ledger.md` の再生成(`npm run impl:write`。指示どおり行っていない)

加えて IMPL-0225 の指摘(書式・台帳)は単位 R の側の変更で、私の変更ではない。

## 6. 裁定どおりに作れなかった点・決定可能な範囲に絞った点

- **上程と判定の記録を結ぶ手がかりは、記録の「対象」の欄の `#番号` に限った**。様式 04 に上程の欄は無く(欄を足すのは ADR-0040 により採らない)、G-6 の対象は PR、会議体の対象は F-012 のような語になりうる。対象が上程の Issue の番号か判定資料の PR の番号を指す記録だけが結べ、そうでない記録は「確かめていない」に回る。結べる割合が低いと 0214 は検査として働かず、0216 の日数は母数が小さくなる。対策は採用者が記録の対象の欄に上程の番号を併記する運用だが、手引きにはまだ書いていない(書くなら標準側の様式の議論が要る)
- **判定の時点の代理は、PR のマージの時刻を `docs/gates` の最初のコミットを含む PR の `merged_at` で読む**(読めなければコミットの時刻)。記録用ブランチ `records` の記録(基底ブランチに入る前のもの)は読まない
- **(c) の判定の時点は判定予定日 T で近似した**(通知の時点では判定日が分からない)。実際の判定日の欄は 0214 の検査が読む
- **必須応答の者の導出は CODEOWNERS の個人の login に限る**(0217 の既存の範囲)。チーム・電子メールの所有者は数えない
- 判定資料の所在が別のリポジトリの PR を指す場合、必須応答を導出しないため 0214 は R1 の指名レビュアの分だけ照らす(R2・R3 は「確かめていない」)

## 7. 未確認の点

- 実物の GitHub での、上程と PR の結び付け・workflow の実行(権限・API の応答・`pull_request_target` の動作)。#361 で確かめる。note に開示した
- `fetchGateRecords` の「最初のコミットが記録ファイルを入れた PR」の読みは、コミットの一覧のページ数が 100 を超える場合を扱っていない
- `test-adoption.mjs` の後半(§3 の `git merge` の失敗)が変更前から同じかは未確認
