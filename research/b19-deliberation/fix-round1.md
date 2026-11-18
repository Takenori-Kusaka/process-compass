# 束 B19 直し 1巡目

作成 2026-11-18。対象: `review-round1.md` の所見 R1-1〜R1-7。

| 所見 | 扱い | 内容 |
| --- | --- | --- |
| R1-1 高 | 直した | `aiFreePracticeState` の早期 return から `policy.present === false` を外した。層1 が無いときは `freqNotice` だけを出さず、範囲ごとの `no-record` は D-0 から導いて出す。試験の対(頻度の表示は出ない / 記録が無いは出る / 記録があれば出ない)を足し、旧い固定の試験を改めた |
| R1-2 低 | 直した | IMPL-1022 の note に「表が『L3(停止中は L1)』と書く停止中の範囲も含める」を足し、`impl:write` で台帳を再生成した |
| R1-3 低 | 直した((b) 裁定の列挙へ狭める) | `PRACTICE_NUMERIC` を数字+日・週・か月・年、`PRACTICE_WORD` を半年・四半期・毎月・毎年(それぞれ「ごと」「に1回」)に絞った。`月` だけ・`ヶ月` 類・接尾の `毎`・`年に1回`・`月1回` は読めない値になる。note と様式の手引きはすでに裁定の列挙なので変更不要。試験に `3月`・`12月`・`年に1回`・`月1回`・`12か月毎`・`毎月毎`・`3ヶ月` の ng を足し、ok の `年に1回` は `1年に1回` に改めた |
| R1-4 低 | 直さない | 表示は不利な側(出る側)に倒れており食い違いではない。古い D-0 への写し方は様式(`00-d0-governance.md`)に書いてあり、表示の文を長くすると手引きが二重になる。案内を表示へ移すかは細かい定義の増加を避ける線引き(未決)に当たるので、本束では扱わない |
| R1-5 低 | 直さない | O-2 の文は「項目7 の表示に併記」で、字面に反しない。表示が無いときの基準日だけの行を足すと、表示が無いことが新しい種類の表示になる。表示が出ないことが技能の維持を示さない旨は標準 5.4.7 の本文にある。後続で必要なら別 Issue |
| R1-6 低 | 一部直した | (2) の行の日付を UTC の日からローカルの日へ、試験の名を実際の引数に合わせた。(1)(3) は直さない: (1) は新旧の導き方が論理として等しいことを突合が確認済みで、`test-init-g5` が通っている。(3) は表示が `gaps`・`cycleNotices`・`continuity` に入らないことをコードで確認済みで、既存の stdout の確かめが実害を捕まえる |
| R1-7 低 | 直さない(記録のみ) | CRLF の偽の FAIL は本束より前からある。別の束で、読み込み後に `\r\n` を `\n` へ置き換える形へ寄せる |

## コミット

- template: `fix: 層1 が無い案件でも「記録が無い」を出し…`(bundle `tmp/bundles/template-b19-03.bundle`)
- 本体: template の参照を進め、IMPL-1022 の note と台帳を更新

## 試験の結果

- template: test-ai-free-practice 67 件合格、test-roster-rules 212 件合格、test-init-g5 164 件合格。test-discouraged-evidence は作業ツリーの CRLF で 4 件 NG(R1-7。本束と無関係。前回の LF の写しで 10 件合格)
- 本体: lint:impl・test:impl 56 件・test:fields 11 件・test:template 一致・lint:evidence 307 件・impl:issues 126 件(すべて open)が通過

## 差分のファイル

- `template/scripts/gate/org-assurance.mjs`
- `template/scripts/gate/test-ai-free-practice.mjs`
- `src/content/docs/phase4-process-design/human-ai-boundary.md`
- `src/content/docs/community/implementation-ledger.md`(再生成)
- `template`(参照)
- `research/b19-deliberation/fix-round1.md`
