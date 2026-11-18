# 束 B21 単位8 実装の記録 (IMPL-0374・0377・0614・0500。Issue #443)

2026-11-18。裁定は `research/b18-deliberation/ruling-a1.md` の §3.6。template のコミットは ce995de(ブランチ b21、基点 961eaac。退避 `tmp/bundles/template-b21-01.bundle`)。

## 試験の結線

4項目とも、既に `gate-g5.yml` へ結線済みの試験ファイルへ場面を足した(新規の試験ファイルは作っていない)。このため `state=delivered` にした。
- `test-next-records.mjs`(110 行): 0374・0614・0500
- `test-reach-forecast-record.mjs`(149 行): 0377
- `test-brief-estimates.mjs`(135 行): 企画書の欄の読み(0374 の補助)

## 項目ごと

### IMPL-0374 実測スループットの集計 — delivered / check=machine
- 作ったもの: `brief-estimates.mjs` に既定の文(`DEFAULT_DONE_CONDITION`)と、欄の読み(`doneConditionOf`・`isDefaultDoneCondition`・`unitPeriodDaysOf`)。`next.mjs` に `completionThroughput`(純関数)と GitHub から閉じた Issue を読む `fetchClosedUnits`。様式 06 の欄「作業単位の完了の条件」に既定の文を例として置いた(本体と3つのプロファイルの4枚。プロファイルは `generate-profile.mjs` が複製元にするため)。
- 試験: test-next-records 110 件・test-brief-estimates 17 件が通過。ng: 完了の条件が違う・欄なし・単位期間を読めない → 算定できない。ok: 一致 → 期ごとの個数(完了 0 の期も除かない)・完了に当たらない個数。
- 採らなかった点: ステージ移行ゲートの判定記録の完了の条件の欄を読むこと。様式 04 に欄が無く、04 は B20 が触る。通過した SG の記録がある案件は「算定できない」と出す(移行後に企画書の欄が古い条件のまま使われるのを防ぐ)。作業単位は「閉じた Issue」で数え、「1件の作業単位の定義」の意味は読まない(意味を読む検査になるため)。
- B20 の後へ回した点: 04 への完了の条件の欄の追加と、それを読む処理。
- 試験で確かめていない点: `fetchClosedUnits` の GitHub の読み出し(gh api graphql)。

### IMPL-0377 到達の見込みの算定 — delivered / check=machine
- 作ったもの: `reachForecast`(純関数)。未完了の SC-M の個数・最小/最大スループットから、期間の組の両端と区分(甲・乙・丙・算定できない・対象外)を出す。0374 で算定できない案件と入力の無い組は算定できない。未完了の SC-M はラベル `SC-M` の open Issue で数える(`fetchScMItems`)。
- 試験: test-reach-forecast-record 21 件が通過(甲乙丙の境、完了 0 の期、窓が3期未満、対象外、入力なし)。
- 採らなかった点: 「比べる残り」の期間を記録の自由な文から読むこと(意味を読む検査になる)。`--remaining-periods N` の入力とし、無ければ区分は算定できない(端は出す)。SG で記名した SC-M の一覧とラベルの照合も機械にしない(人が行う)。費用の組は IMPL-0499(採用者)。
- 試験で確かめていない点: `fetchScMItems` の GitHub の読み出し。

### IMPL-0614 発火条件の材料 — delivered / check=machine
- 作ったもの: `scMChanges`・`scMVariationRate`・`flowReportText`。残る作業単位・実測スループット・残る期間・SC-M の変動率((確定後の追加 + 削除)の累計 ÷ 確定時の個数。ラベルを外すことを削除に数える)を /pit の節「フロー」に出す。変動率には `--confirmed YYYY-MM-DD` が要る。
- 試験: test-next-records(確定時 3・追加 1・削除 1・未完了 2、変動率 66.7%、確定時 0 件は算定できない、評価と発火の判断を書かない)。
- 採らなかった点: 見込みの報告の Issue への書き込み(Issue の同定と書く権限が決定可能でない)。貼る材料を出すところまで。評価と発火の判断は書かない。

### IMPL-0500 --pickup が止めた件数 — delivered / check=machine
- 作ったもの: `--pickup` が判定できないで止めたとき、`pit-in: pickup-undecided <日付> <ラベル>` を作業単位の Issue へ1行コメント(`recordPickupUndecided`)。書けない(権限なし・F-NNN など Issue を導けない・--offline)ときは `evidence/pickup-undecided-unwritten.jsonl` に数える。/pit が宣言行を作業単位ごとに数え、書けなかった件数を別に出す。`.claude/skills/pit/SKILL.md` に使い方を足した。
- 試験: test-next-records(宣言行 2 件 → #77: 2、0 件 → 0 件、形の違うコメントは数えない、書けない → 別に数える)。
- 採らなかった点: 止め方が妥当かの確認(合否に使わない)。書けなかった件数の共有(手元の記録は端末ごと。`.gitignore` は B20 の範囲で触っていない。evidence/ は既に除外されている想定)。
- 試験で確かめていない点: gh による実際のコメントの書き込みと、コメントの読み出し(`fetchPickupComments`)。

## 流した検査
- template: test-next-records 110 件・test-reach-forecast-record 21 件・test-brief-estimates 17 件・test-brief-thresholds 50 件・test-adoption 69 件 すべて通過。test-check-pr は時間切れで流していない(本件の変更と関係が薄い。push の前の全量で流す)。
- 本体: `npm run impl:write`・`lint:impl`・`impl:issues`・`test:fields` が通過。全量の `npm run check` は流していない。
