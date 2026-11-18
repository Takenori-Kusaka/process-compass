# 束 B21 結線 — 突合の所見の直し(fix-wiring-1)

裁定は `ruling-wiring-fix1.md`。template は触っていない(392ff93 のまま)。

## 所見ごとの直し

| 所見 | 直し |
| --- | --- |
| R-1 高 IMPL-0216 | `undelivered`・`check=manual`・`plan=scheduled issue=325 review=2027-05`。test= は外した(0217 と同じ書き方)。note に降りた3指標と降りていない2指標(判定当日に初めて出た論点の比率、資料公開から判定までの日数)を分けて書き、確かめる者を足した |
| R-2 高 IMPL-0979 | `undelivered`・`check=manual`・`plan=scheduled issue=445`。降りている部分(PR のゲート G-6・G-3・G-2/G-4 の超過の通知)と降りていない部分(PR を持たないゲート G-1・G-5・G-7・G-8・SG、会議体の決定の期限の超過)を分けて書いた |
| R-3 高 IMPL-0210 | `check=manual`(delivered は保つ)。test= は外した。機械が確かめるのは起票の時点と見出しの欄の存在までで、5項目の充足は決定者が判定の当日に確かめる旨と、確かめる者を書いた |
| R-4 中 IMPL-0283 | 「または G-1 で合意した値」の側が条項の要求の一部で降りていない(様式に欄も読む処理も無い)ので、`undelivered`・`check=manual`・`plan=scheduled issue=443` へ下げた。漏れの向き(短い値を合意した案件で通知が出ない)を note に書いた |
| R-5 中 IMPL-0681 | 「追うマークが無い」を、7.5 の措置を求める通知は IMPL-0979 が追う(PR を持たないゲートと会議体の期限は降りていない)に改めた。再割り当ての処理を持たないことで満たす(試験の場面なし)と一句足した。state は delivered のまま |
| R-6 中 12 項目 | 開示で閉じた。0680・0681・0682・0979・0136・0283・0571・0210・0213・0215・0216・0219 の note に「workflow の契機と呼び出しは試験で確かめていない(実物の GitHub で未確認)」を足した(既にあれば足さない)。静的な試験(契機と run の行を読む)は template を動かすため足さない。後の束の候補として、test-push-trigger.mjs の型で3本の yml を読む試験を記録する |
| R-7 低 IMPL-0682 | 検出が漏れる向き(応答後も判定待ちの PR は数えないので、上限を超えても知らせない場合がある)を note に足した |
| R-8 低 /gate の SKILL.md の語 | template の文言のため今回は直さない。編集の指摘として、次に template を動かす束で「実装計画へ差し戻します(起案者が計画を改める)」に揃える |
| R-9 低 IMPL-0283 の古い句 | 「降ろし先は #345 で予定の置き場とし、束 B21 で template の実物になった」に改めた |

## 流した検査

impl:write・scope:write(台帳の差分は implementation-ledger.md のみ)、lint:impl・impl:issues・lint:scope・lint:refs・lint:evidence・test:fields はすべて通過。変えた4ファイルへの textlint は違反なし。途中、lint:impl が IMPL-0210 の check=manual に確かめる者が無いと落としたため、足して通した。

## Issue ごとの残りの降りていないマーク(state=undelivered の件数)

#445: 11 / #446: 15 / #450: 1 / #441: 1 / #443: 7 / #325: 5 / #326: 2 / #348: 2 / #356: 3
(ほか #355: 29、#448: 10、#361: 10、#444: 7、#447: 4、#123: 1)
