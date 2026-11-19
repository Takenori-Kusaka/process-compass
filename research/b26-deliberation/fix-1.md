# 束 B26 — 独立の突合(1巡目)の所見への直し(2026-11-19)

- 差分の範囲: template `aef21e3..9271757`(3 コミット)、本体 `19723c75..`(このファイルを含むコミット)
- 退避: `E:/Github/process-compass/tmp/bundles/template-b26-07.bundle`(beaedb3)・`-08`(89b3e7e)・`-09`(9271757)。いずれも `ad21a42..b26`
- 裁定: `ruling-fix1.md`。13 件すべて裁定のとおりに直した。直せなかった点は無い(下の「裁定との差」を除く)
- 流した試験(関係するものだけ): template の test-adoption 89 件・test-next-records 142 件・test-flow-observation 33 件・test-brief-estimates 38 件・test-review-order・test-enforcement-inventory・test-records 95 件、本体の lint:impl・lint:evidence・lint:sources・lint:refs・lint:scope・test:fields。すべて通過。textlint は変更した md で違反なし。回帰の全量(npm run check)は流していない

## 壊して落ちることの確認(すべて戻した。`cmp` と再実行で確認)

| 所見 | 壊し方 | 結果 |
| --- | --- | --- |
| 高-2 | next.mjs の `if (gapNote) result.notes.push(gapNote)` を外す(M2) | 落ちた(`IMPL-0497:ng 入口: …` の 1 件が NG) |
| 高-3 | flow-observation.mjs の main で `agreed = null`(M3) | 落ちた(`IMPL-0283:ng 入口: …` の 1 件が NG) |
| 低-5 | next.mjs `flowSection` から `adjustments:` の受け渡しを外す(M8) | 落ちた(`IMPL-0954:ok 入口の側: …` の 1 件が NG) |
| 中-1 | `percentile` を無条件に返す(直しを外す) | 落ちた(`IMPL-0283:ng 85パーセンタイルの語と数値・単位…` が FAIL) |

## 所見ごと

### 高-1 IMPL-0497 の部分一致(adoption-trial.mjs・test-adoption.mjs・gate-criteria.md)
- `numberCited(text, n, repo)`: `#N`(後ろに英数字・下線が続かない)、相対の `/issues/N`・`/pull/N`(直前が語の文字・`.`・`-`・`/` でない)、同じリポジトリの URL。`repo` が null か波括弧のままなら URL を数えない。`typeCited(text, ty)` を新設し、類型の名は区切り(行頭・行末・空白・句読点・括弧)で囲まれた一致に限る。`correctionGaps` に `repo` を足した
- 試験: 再現の4つのうち 3 つを ng で足した(「境界」×「境界値分析」、別のリポジトリの `/pull/12`、`#12a`)。4つ目(別の起点 #15 の行が「#12 と同じ類型」と書く)は裁定で残る偽陰性とされたので、「覆われる」ことを `ok` で固定し、限界の開示の試験とした
- note: 「残る誤りは偽陽性の側に限る」「安全側に倒れる」を消し、偽陽性・偽陰性の両方を書いた
- 実利用の注意: `next.mjs` は `repo` を渡していない(`gh api` は `{owner}/{repo}` を自分で解決する)ので、実運用では URL を数えず、`#N` か相対の形だけが対応になる。裁定の「リポジトリが分からないときは URL を数えない」のとおり。同じリポジトリの URL を書いた行は一覧に余分に出る(偽陽性の側)
- 副作用: 日本語の文へ区切りなしで類型の名を埋め込んだ行(「境界値の注入」)は対応に数えない。出力の文を「空白や括弧で区切った類型の名を書く」に改めた

### 高-2 IMPL-0497 の入口の試験(test-adoption.mjs)
- 一時の置き場へ scripts を複製し、最小の構成と注入の記録を置いて `next.mjs --offline` を通す ng/ok を足した。ng は台帳が無いとき注記に「是正の記録の欠け 1 件」と類型の名が出る、ok は行がそろえば出ない
- 直せなかった範囲: `gh` の側(events の読み出し)は入口を通していない。Windows の `execFileSync('gh')` は PATH 上の差し替えを実行できず、差し替え口を製品コードへ足さないと決めた。note に「関数と差し替えた gh まで」と書いた。マークは machine のまま(入口を通す試験を名指すという要件は、`/pit` の注記の結線について満たす)

### 高-3 IMPL-0283 の入口の試験(flow-observation.mjs・test-flow-observation.mjs)
- `main(argv, { gh, env, config, log })` を export し、既定は従来どおり(`ghCli`・`process.env`・`loadConfig()`・`console.log`)。`PIT_IN_BRIEF` に一時の企画書を置き、`gh` と出力を差し替えて main を通す試験を 3 件足した(合意した値 3日で通知 1 件、企画書なしで 0 件、欄が空で 0 件)

### 中-1 「85パーセンタイル」の語(brief-estimates.mjs・test-brief-estimates.mjs)
- 語と `\d+(日|週間|週)` の両方を含む値は `unreadable`(注意が出る)。語だけ・様式の例の文は `percentile` のまま。再現の値 3 つと「2週間か85パーセンタイル」を試験に足した

### 中-2 EV-0342・SRC-0768・出力の文
- EV-0342 の観測を「2026-10-01 より前に作られた実行が残っていた」に直し、新しい方針を試せていないことを開示した。process-compass の最も古い実行 134 日前(2026-07-08)と、もう一方のリポジトリの 142 日前(2026-06-30)を書き分けた(後者のリポジトリ名は intake-1.md が書かないので「もう一方」とした)
- 差し替え条件: 「2026-10-01 の後に作られ、90 日を超えた実行が読めるかを 2027-01 以降に観測する」。2027-01 より前の観測は条件を満たさないと明記した(2026-12-30 以降でないと試せない)
- SRC-0768: summary を「矛盾しない」に改め、c3 の text を引用が支える範囲(遡らない)に絞った(公開 1〜90 日・非公開 1〜400 日を削除)
- 採用者の出力(enforcement-inventory.mjs)から日付つきの観測の文を外し、「遡らない」とも書くと添えた。IMPL-0145 は undelivered のまま。note の昇格の条件も同じに直した

### 中-3 handoff.md の 2.10.6
- 「7.6 の段階に従い、事業決裁者または B-2 の判定に回します。手順3(基準)は、7.3 の例外承認の権限を持つ者が決めます」

### 中-4 events の読み出し
- 調べた結果、`--brief` はすでに `network:false` で `gh` を呼ばない(`main` の `local` が `--offline` と `--brief` に掛かる)。review-1 の「`--brief` を含む全実行で走る」は実装と合わない。コードは変えず、note に「通常の /pit だけで読む。15 秒の上限。`--brief` と `--offline` では読まない」と明記した
- 全件が返るか(古い事象の欠け・ページの上限)を実物で確かめていないことを note に残した。ラベルの検索への切り替えは採らない(裁定)

### 低-1 強調の崩れ(review-order.mjs・test-review-order.mjs)
- `- [ ]`・`- [x]` を先頭の目印に含めた(`stripEmphasis` も)。表の行(`|` で始まる)には付けない。`headOf` のコロンの探索を最初の空白より前に限った
- すでに `**` を含む項目は、様式 0・1 の週も行頭の印(▶)へ寄せる(項目の間で見た目が割れない)。旧い試験「すでに ** を含む項目には太字を足さない」はこの決定に合わせて書き換えた
- 試験: 箱(全様式)、表の行、コロンの探索、`**` の寄せを足した。IMPL-0175 の note に書いた

### 低-2 flow-observation.yml の冒頭
- 合意した値を先に使い、標本が 0 件でも通知することを書いた

### 低-3 「N週」
- 例の文は変えていない。実装が「N週」も読むことを IMPL-0283 の note に書いた

### 低-4 未来の日付(next.mjs・test-next-records.mjs)
- `adjustmentRecordCount` に `future` を足し、節の本文に「判定日時が今日より後の記録 N 件も窓の件数に入れていない」と出す。試験を足した

### 低-5 IMPL-0954 の結線
- `flowSection` を通す試験を足した(既定の窓 2 か月で 1 件・読めない記録 1 件が節の本文に出る)。M8 で落ちることを確認した。note に書いた

### 低-6 IMPL-0979
- note に、機械の側を別のマークに分けない理由を書き、3.9.3 の2つの例外を handoff.md に 1 行足した

## 裁定との差と、残る点
- 高-1 の再現の4つ目は、ng ではなく「覆われる」ことを固定する ok の試験にした(裁定が残る偽陰性として note へ書くとしたため)
- 高-2 の入口の試験は `gh` の側を通していない(上記)
- 変更していないファイル: 指定の別の束のファイル(verify-gate-contract.mjs ほか)には触れていない。新しい試験のファイルも作っていない
- 本体の台帳(implementation-ledger.md・evidence-ledger.md)は `impl:write`・`evidence:write` で再生成した
- 2巡目の独立の突合は、直した差分だけを見る(`ruling-fix1.md`)
