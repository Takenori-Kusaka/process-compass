# 束 B21 単位 P1〜P4 — 突合 1巡目の直しの記録(2026-11-18)

所見は `review-p1-p4-1.md`、裁定は `ruling-p1-p4-fix1.md`。template は 9d25a7e(`961eaac..b21` の bundle: `tmp/bundles/template-b21-15.bundle`)。触ったのは pre-review.mjs・review-order.mjs・enforcement-inventory.mjs・各試験・gate の SKILL.md だけ。`pre-review.yml`・sync-escalation.md・G-6.md は変えていない(直す所見が無い)。

## 所見ごと

| 所見 | 直した内容 | 試験 |
| --- | --- | --- |
| H-1 0830 | 公開の時点を GitHub の上の値で読む。資料の Issue は草案の印を外した時刻(履歴が無い非草案は作成の時刻。`withPublishedAt` が足す)。所在だけの上程は、上程の作成の時刻と所在の PR(同じリポジトリ)の作成の時刻の遅い方を下限とし、期日より遅ければ短縮として通知(本文に「下限」と根拠を書く)。外部の URL など読めない所在と、読めない資料は検出せず、「公開の時点を確かめていない」を注意に出す。`fetchIssues` に createdAt、`fetchPrCreated` を追加。note に検出できない経路を書いた | 新規 7 件(所在の上程が遅い・PR が遅い・下限が期日以前・外部 URL・資料あり・履歴なし・createdAt) |
| M-1 0217 | 「条文は有効。機械が止めない(止める強制の機械化は未決)。進めてよいかは決定者が確かめる」の形に改めた(記載と required-miss の両方) | 既存 2 件を更新 |
| M-2 0217 | 裁定(b)のとおり上程の Issue へのコメントのまま。記載に「判定資料(3.10.3)への転記は起案者が行う。本文は編集しない」を書き、note で「判定資料へ記載」に届かない部分を開示 | 新規 1 件 |
| M-3 0217 | `prRefOf(text, repo)` を追加。owner/repo が違う URL は番号を採らず、注意に出す。`readProposal` と `planNotify` に repo を渡す | 新規 2 件 |
| M-4 0175 | note で「並びだけを降ろし、表現・強調は降ろしていない。結線の後も check=machine にせず、表現・強調は undelivered として残す」と開示。SKILL.md と review-order.mjs の冒頭にも書いた。表現・強調の検査は作らない(裁定) | SKILL.md の既存の試験が通る |
| M-5 0175 | 起点(2000-01-03 の週)から順に決め、前の週と同じ並びになるときは、同じにならない最初の回転へ替える。決定的で、項目 2・3・4 個の 106 週で隣り合う週が同じになる週は 0。項目の集合が週の間で変わる間と、起点より前の日付は保証しない(出力の reason と note に書いた) | 新規 5 件 |
| M-6 0145 | 応答の `total_count` を読み、1,000 件に達した・総数より少ないときは「一部しか読めていない」と出して数は確定の値でないと書く。最も古い実行が窓の始まりより後なら、保持期間で欠けたか実行が無かったかを区別できないと出す。note の「保持期間」の言い方を実態に合わせた | 新規 4 件 |
| L-1 | 電子メールの所有者を `emails` に集め、注意に出す | 新規 1 件 |
| L-2 | 最後に当たった行に所有者が無いファイルを unowned に入れる | 新規 1 件 |
| L-3 | 印のキーに未指名の者の集合(`:missing=`)を足した。指名を直すと新しい記載が出る。記載に「指名レビュアの時点のもの」と書いた | 新規 1 件 |
| L-4 | main の PR 読み取りを target のある上程(OWNER・MEMBER・COLLABORATOR の起票)に限った。`readProposal` の関係の確かめの後に当たる | 純関数でなく main の経路。構文と既存の試験 |
| L-5 | 最後の改名を公開の時刻に採ることを、`publishedAtOf` の説明と note に書いた(最初を採る案は採らない: 草案へ戻して公開し直したのは、起案者が資料を作り直したと読むため) | note |
| L-6 | `nameIn`(前後が英数字・ハイフン・下線でない)で一致させる | 新規 1 件 |
| L-7 | ジョブの記録を読めなかった失敗の実行の件数を出す。再実行で成功した失敗(run_attempt が 2 以上)は数えないと注記に書く | 新規 1 件 |
| L-8 | SKILL.md に「項目は箇条書きか基準の名で書き、番号つきの一覧にしない」を足し、review-order.mjs の冒頭を「関数は時計を読まず、命令行で --date を省くと今日(UTC)を使う」に揃えた | 既存 |

## 直さなかったもの

- 所見の直しの案のうち、L-6 の「語の境界つき」では所見の反例(対象「製品の test データの改め」にジョブ名 test)は直らない(空白が境界になるため)。部分一致(latest・pre-test)だけが外れる。意味を読む検査は作らない(裁定)ため、note と注記(文字列の一致で意味は読まない)の開示に留めた。試験にも「当たる」と明記
- L-5 は直さず開示に留めた(読みとしてありうる)
- H-1 の読めない所在の検出(外部の URL でも上程の作成の時刻は下限として使える)は、裁定「読めない所在は検出せず確かめていないと出す」に従って採らなかった
- 所有者の決定待ちの規則は作っていない(0830 の短縮の経路・下限、0214 の必須チェック、0217 の判定へ進めない強制)。state は変えていない

## 試験(Windows、node 26.13.0)

test-pre-review・test-review-order・test-enforcement-inventory はすべて期待どおり。test-review-queue 54 件、test-flow-observation 22 件、test-adoption 69 件、test-context-refs 通過。本体は `lint:impl`・`impl:issues`・`test:fields` 通過(全量の check は流していない)。

## 結線の担当への申し送り(P1〜P4)

- gate-g5.yml の gate-contract へ結線するのは、test-pre-review・test-review-order・test-enforcement-inventory。0175・0145・0217・0830 は結線後も undelivered のまま(0175 の表現・強調、0217 の強制、0830 の下限と読めない所在、0145 の保持期間の区別が残る)。0231・0877 は delivered check=manual のまま
- `pre-review.mjs` の main は `repos/{repo}/pulls/{n}` と `issues/{n}/events` を新たに読む。`pre-review.yml` の権限(`pull-requests: read` が既にある)で足りるが、実物の GitHub では確かめていない
- 印のキーの形が変わった(`required:` に `:missing=`)。結線の前なので既存の印との互換は要らないが、実物で先に動かすなら重ねて出る
- 試験は時計と TZ に依らない(日付は引数)。review-order の連鎖は 2000-01-03 から現在の週まで毎回計算する(約 1,400 週。実測で十分速い)
