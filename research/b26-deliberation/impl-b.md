# 束 B26 — 実装の記録 担当B(2026-11-19)

裁定: `ruling-2.md` §2(0175)、`ruling-1.md` §2.2(0283)・§2.5(0497)、`intake-1.md` §3.3・3.4・3.7・3.8。template は `template/` のブランチ b26(push していない)。回帰の全量(`npm run check`)は流していない。

## B26-3 IMPL-0283(滞留の合意した値)

- template: `scripts/gate/brief-estimates.mjs` に `stagnationThresholdOf`(欄「滞留と判定する経過時間」を none / percentile / agreed(N日・N週間・N週)/ unreadable に分ける)。`scripts/gate/flow-observation.mjs` の `flowActions` が `agreed` を受け、合意した値があれば閾値にする(最小の標本数を求めない)。85パーセンタイルも算定できるときは、出力(notes)と通知の文に両方を並べる。unreadable は注意を出して85パーセンタイルへ戻る。通知の文に出所を書く。`main` が `docs/project-brief.md`(環境変数 `PIT_IN_BRIEF` で差し替え可)を読む
- 様式: `templates/06-project-brief.md` と `profiles/{internal,oss,revenue}/templates/06-project-brief.md` の欄に例文を置いた。標準 `deliverable-templates.md` 1180 行の例文も同じに揃えた(ruling は「第6章と同じ例」とするが、第6章には合意した値の書式の句が無かったため)
- 試験: `test-flow-observation.mjs`(30 件通過。ng/ok を8件)、`test-brief-estimates.mjs`(37 件通過。3件)
- 本体: `lifecycle.md` の IMPL-0283 を `delivered check=machine test=...test-flow-observation.mjs` へ。note に「または」の読み、G-1 の後の書き換えを機械は区別しないこと、実物の GitHub で未確認を開示
- 検査: lint:impl・lint:refs・test:fields・textlint 通過
- コミット: template e6a9f1e(bundle `template-b26-03.bundle`)、本体 545ac3ba

## B26-5 IMPL-0175(強調の様式と表現の手引き)

- template: `scripts/gate/review-order.mjs` に `emphasisStyleOf`・`emphasizeItem`・`emphasizeItems`・`stripEmphasis`・`EMPHASIS_STYLES`。様式は4つ(先頭の識別を太字 / 1行目を太字 / 行頭に ▶ / 行頭に ◆)。番号は「種(ゲート・対象)から決めた起点 + 起点の週からの週の数」を4で割った余りで、ISO 週で変わり、**隣り合う週では必ず変わる**。全部の項目へ同じ様式。R3 は付けない。項目がすでに `**` を含むときは太字を足さない。`orderItems` は変えない(並びは強調と独立)。命令行は並べた後に強調を付けて出す
- `.claude/skills/gate/SKILL.md` 74 行: 「表現・強調は回さない」を改め、強調は機械・表現は手引きとした。手引きの項を1つ足した(前置きの文の言い回しは起案者が週ごとに変えてよい、基準の文・欄の見出し・機械が読む欄は変えない、確かめる者: G-6 の判定者)
- 試験: `test-review-order.mjs` 10件追加(同じ種で同じ出力、隣り合う週で様式が変わる、強調の印を除けば文と番号は同じ、R3 は変わらない など)。命令行の期待を、強調の印を除いて比べる形に改めた(過去の決定の固定ではなく、強調の追加に伴う更新)。全通過
- 本体: `human-ai-boundary.md` 5.7.5 の近くに EV-0343(E1、見直し 2027-05)。`implementation-ledger.md`・`evidence-ledger.md` を再生成
- **裁定と違えた点(形)**: ruling-2 は「機械と手引きの両方を書式の許す形で表示」とする。属性 `test` は `check=machine` だけに書けるため、マークは `check=manual`(規定の全体は機械で閉じない。手引きの部分がある)とし、機械の部分の試験 `test-review-order.mjs` と確かめる者(G-6 の判定者)を note に書いた。台帳の検査の欄には test が出ない。machine にして note に手引きを書く形も許すが、「迷ったら弱い値」(書式)に従った
- 検査: lint:impl・lint:evidence・lint:refs・test:fields・textlint 通過
- コミット: template 208deeb(bundle `template-b26-04.bundle`)、本体 e6380474

## B26-6 IMPL-0497(是正の記録の欠け)

- template: `scripts/gate/adoption-trial.mjs` に純関数 `correctionGaps`・`numberCited`、読み出し `readMissedTypes`(注入の記録のうち目隠しを確かめられた層)・`needsPlatformNumbers`(gh は差し替え可。issues/events の labeled)、注記の文 `correctionGapNote`。対応の判定は、対象の欄が `#N`・`/issues/N`・`/pull/N`(後ろに数字が続かない)か、見逃した類型の名(部分文字列)を含む行。`next.mjs` が注記(段階を止めない)として品質保証の席(qa-gatekeeper)の次の一手に出す。`--offline` では GitHub の履歴を読まず、欠けがあれば読んでいないことを添える。読めないときは読めない旨を出す
- `templates/defect-ledger.md` 41 行の文を改めた
- 試験: `test-adoption.mjs`(83 件通過。IMPL-0497 の ng/ok 14 件。GitHub は差し替え、網に出ない)。ほか test-next-records・test-enforcement-inventory・test-env-check・test-env-findings・test-seeded-error-scan・test-context-refs・test-claude-md-resident 通過。`next.mjs --offline` の実行で例外が出ないことを確かめた
- 本体: `gate-criteria.md` の IMPL-0497 を `delivered check=machine test=...test-adoption.mjs` へ。note に残る誤り(言葉だけで指した行は一覧に出る側の偽陽性)、events の読み出しが実物で未確認であることを開示
- 注: `test-adoption.mjs` は「持ち込み」(preflight・init)の試験で、adoption-trial.mjs の試験は別にあるが、intake §3.7 の指定どおり `test-adoption.mjs` に置いた
- コミット: template f0d705b(bundle `template-b26-05.bundle`)、本体 2df9dadc

## B26-7 IMPL-0954 の /pit の側

- template: `scripts/gate/next.mjs` に `adjustmentRecordCount`(ゲート欄が「価値責任者の調整」の記録を、判定日時が観測の窓にあるものだけ数える。日時を読めない記録は別に数える。同じ所在は1件)。`flowReportText` が節「フロー」に件数と「種別は本文に書かれ、機械は読まない」を出す。`records.mjs` は変えていない(ゲート欄は任意の語を受ける。試験で確かめた)
- 試験: `test-next-records.mjs` に5件追加(140 件通過)
- 本体: `lifecycle.md` の IMPL-0954 は `undelivered` のまま。note の降りていない部分を「集約(aggregate-evidence.mjs)が調整の記録を欠落に数えないこと」だけに改めた
- コミット: template aef21e3(bundle `template-b26-06.bundle`)、本体 c1a71552(この記録を含む)

## 触れていないもの

B25 のファイル(verify-gate-contract.mjs ほか指示の一覧)は触れていない。新しい試験のファイルは作っていない。外部への操作はしていない。

## 残った点

- 実物の GitHub での確認(0283 の workflow の契機、0497 の issues/events の読み出し)は未確認
- 0954 の集約の側(aggregate-evidence.mjs。B25 の範囲)
- 回帰の全量は未実行(指揮役が push の前に1回)
- template の行末が CRLF の作業木のファイルに、LF の行を足した箇所がある(git が正規化する)
