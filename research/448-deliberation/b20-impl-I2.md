# 束 B20 実装 I2 の報告

- 範囲: 1 節(対立 3 の 0667・0523、対立 5 の 0638)、5 節 U4(0667・新 A・0622・新 B・0638・0523)、6 節 U5〜U8(0710・0717・0719・0720・0655・0853・0626・新 C・0963・0837・0584)。1010 は I3 が扱う(触っていない)
- template のコミット(ブランチ b20): f13aedf(機械の件)、その次のコミット(手引きの追記)。bundle は `E:/Github/process-compass/tmp/bundles/template-b20-I2-01.bundle`・`-02.bundle`
- template と本体は push していない

## 実装した内容

| 単位 | 内容 | 主なファイル |
| --- | --- | --- |
| 0667 | 必達基準2 の乙・丙の継続・保留を判定日時の順に数え、範囲の中の4回目以降と、欄「通算 N 回」が数えた回数より小さい記録を欠落にする。大きければ N から続ける。読めない記録は未確認の件数。項目7 に表示 | `judgement-records.mjs`(新)・`aggregate-evidence.mjs` |
| 新 A(IMPL-1026) | manual。様式 04 の「7.7.5 の回数」に「通算 N 回」、解消の期限の欄に必達基準の番号と回数を書く手引き | `templates/04-gate-record.md`、標準の第6章テンプレ4 |
| 0622 | S1 以降、棚卸しの最終の判定日と経過日数を項目7 に出す。記録なし・365 日超は注意で止めない | 同上 |
| 新 B(IMPL-1027) | manual。確かめる者は出荷判定者 | マークのみ |
| 0638 | 任意の欄「確認済みの者の併記」(様式 04・標準テンプレ4・`template-fields.yaml` に両方向)。D-0 節9 の期間の表で期間内の責任者・代理者の判定を対象にし、併記なし・名簿外・AI・本人を未達として項目1 に出す。G-6 は対象外。期間が読めない行は「確認できない」 | 同上・`04-gate-record.md` |
| 0523 | `decision-recheck.mjs`(新)。出荷の範囲で変わった判断記録を、状態の行を除く文字列の一致で3値に比べ、不一致と G-3 の通過の無い置き換えを欠落にする。旧い様式の「## ステータス」の最初の行も除く | `decision-recheck.mjs`・`aggregate-evidence.mjs`・`test-decisions.mjs` |
| 0710 | 確定者と導入承認者の同一を、単一障害点の項目「基準集合の確定者と導入承認者が同一人物」として項目5 と一覧に出す。D-0 節15 の期限つきの受容で受け、期限切れは既存の経路で欠落。受容者は層1 の「品質の残存リスク」の行で照らす | `model-adoption.mjs`(`separationItems`)・`org-assurance.mjs`・`aggregate-evidence.mjs` |
| 0717・0719・0655・0853・0626 | 手引きの追記(manual)。settings.md の `data`、SG.md・process-change/SKILL.md・handoff.md の再生成、G-4.md の委譲先の記名、G-7.md の署名の意味と全件突合、handoff.md の突合 | `template/.claude/skills/` |
| 0720 | ファイルの変更なし(manual) | — |
| 新 C(IMPL-1028)・0963・0837・0584 | undelivered / manual / plan=adopter / decision=ADR-0216 | ADR-0216 を新設 |

本体: マーク 14 件を更新、新マーク 3 件(IMPL-1026〜1028)を追加。`impl-inventory.yaml` に3件を足し、`impl-targets.yaml` に `judgement-records`・`decision-recheck` を登録した。台帳(impl・evidence)を再生成した。ADR-0217 に決定 9〜15 と EV-0328・EV-0329 を足した。ADR-0216 を起こした(EV-0330)。

## ng が実装の前に落ちることの確認(実行した)

方法は、新しい関数を空の結果だけを返す置き場(スタブ)にして、試験を先に書いて流した。

- 0667・0622・0638: `node scripts/gate/test-aggregate-records.mjs`(スタブの `judgement-records.mjs`)で 13 件が NG(ng 場面と ok 場面の両方)。実装後は 172/172 通過。出力は scratchpad の `pre-I2a.txt`
- 0523: `node scripts/gate/test-decisions.mjs`(スタブの `decision-recheck.mjs`)で 5 件が NG。「版を読めない記録は未確認」の ok 場面はスタブが空の配列を返すため空振りで通っていたので、件数の確認(2 件)を足して落ちるようにした(その後は 67/67 通過)
- 0710: `node scripts/gate/test-model-adoption.mjs`(`separationItems` と `separation` の戻り値が無い状態)で 3 件が NG。実装後は 30/30 通過

## 試験の結果

- template: `test-aggregate-records.mjs` 172/172、`test-decisions.mjs` 67/67、`test-model-adoption.mjs` 30/30、`test-roster-conditions.mjs` 54/54、`test-aggregate-drift.mjs` 25/25、`test-exception-expiry.mjs` 65/65
- 本体: `lint:impl`・`lint:evidence`・`lint:scope`・`lint:refs`・`lint:provisions`・`lint:tone`・`lint:skills`・`lint:registry`・`test:fields`・`test:impl`・`test:plan-issues`・`test:criteria` 通過。変更した md は textlint 通過。`lint:impl` が no-adopter の節に当たらないことを確認した(adopter の 4 件)
- 回帰の全量(`npm run check`・template の全試験・`test-check-pr.mjs`・`test-assurance-period.mjs`)は流していない(push の前に 1 回)

## 確かめなかったこと

- 0523 の集約への結線(範囲の `git diff --name-status`・G-3 の版の本文の取得・置き換えの欠落)は、実際の git の範囲での通しの実行をしていない。純関数の試験と構文の検査、`from` が空の範囲での集約の通しの実行(IMPL-0687 の場面)だけ。実リポジトリの範囲で動かす確認が残る
- 0667・0622・0638 の集約への結線も、必達基準の判定記録・暫定任命の期間を実際に置いた通しの場面は無い(純関数の試験のみ)。D-0 節9 の表は雛形の形を読む前提
- 0710 の項目5 の表示行と、受容の期限切れが欠落になる通し(`continuity.expired`)は、試験していない(既存の受容の経路に載せた)
- ng 場面の「実装前に落ちる」確認は、スタブへ置き換える方法による。実装前のコミットに戻しての再実行はしていない
- `graphify update .` は未実行

## 使った番号

- ADR-0216(新設)、ADR-0217(決定 9〜15 を追記)
- EV-0328(0667)、EV-0329(0523)、EV-0330(0963・0837・0584・1028。ADR-0216)
- IMPL-1026(0667 から分けた manual)、IMPL-1027(0622 から)、IMPL-1028(0626 から。plan=adopter)。**仮の番号**。重の件と衝突するなら push の直前に付け直す(`impl-inventory.yaml` と ADR-0217・ADR-0216 の本文・マークの note を合わせて直す)

## 裁定と合わない点・判断した点

- 0710 の受容者の照らし方: 層1 の受容の権限の段階に「分離が成り立たない」専用の行は無い。品質の残存リスクの行(`/品質の残存リスク/`)で照らした。条文の「層1 の受容の権限の段階で定めた権限者」の読みを、議長の裁定に無いまま選んだ。ADR-0217 決定13 に開示した。専用の行を層1 に足す案は、様式の必須欄が増えるので採っていない
- 0638 の判定を担う席は、ゲートの番号から `roles[].gatesOwned` を引いて D-0 の役割の欄(席の名または id)と比べた。D-0 の役割の欄が席の名と異なる表記なら対象にならない(確認できないにも出ない)
- 0667 の欄の値「通算 N 回」は、この判定を含めた通算とみなした(様式の説明は「この判定の変更の後の区分」を併記するので曖昧)。ADR-0217 決定9 の読みとして固定した
- 0622 の「S1 以降」は `stageOf(config)` が S0 でも空でもないことで判定した
- 0720 は決定 15 に分けた(決定 14 は5件の手引き)。マークの note もそれに合わせた

## 残った点

- 1010 は I3
- 重の件との IMPL・EV・ADR の番号の衝突の確認(採番の時)
- 上記「確かめなかったこと」のうち、0523 の実リポジトリでの通しの確認
