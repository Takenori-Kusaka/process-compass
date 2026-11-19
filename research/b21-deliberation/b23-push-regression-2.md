# 束 B23 push の前の回帰の全量(2回目。担当の記録。コード・docs は直していない。commit/push していない)

## 条件
- WSL・node v26.13.1。LF の写し `~/b23r`(本体は bundle から clone し 38a40b7c、template は bundle から clone し 86e732b。autocrlf=false。流す前の git status は空。pit-crew 未初期化)。
- node_modules は前回の写しの複写(linux 用 rolldown の native binding 入り。package-lock は同一)。
- 通常 → TZ=UTC の順に直列で流した。check の連鎖 31 本は 1 本ずつ失敗しても続けて流した。
- 失敗した準備: `git archive` の写しは template が CRLF になり、偽の FAIL(test-g5-aggregate・test-adoption・test-discouraged-evidence)が出た。さらに履歴が無く criteria が履歴不在で落ちた。bundle の clone に作り直した(以下は作り直した写しの結果)。

## 結果(通常と TZ=UTC で同一)
| 検査 | 結果 |
|---|---|
| template の試験 74 本(scripts 配下の test-*.mjs と workflow が呼ぶもの) | 73 通過、NG 1(test-records) |
| 除外 | `scripts/check-decisions.mjs` は存在しない(一覧の機械生成の名残。落ちではない)。`scripts/gate/test-results.mjs` は引数が要る CLI(exit 2)で試験ではない |
| `npm run check` の連鎖 31 本 | 29 通過、**2 落ちた**: test:criteria、test:template-suite |
| test:regress | 通過(全場面 落ちた 0。stages も全場面実行)。lint:text・build・lint:refs ほか残りも通過 |

## 落ちたもの(いずれも真。時計・CRLF・TZ に依らない)
1. template `scripts/gate/test-records.mjs`「recordFromForm: 欄を揃えた記録」。template の `records.mjs` の recordFromForm が `doneCondition`・`unitPeriod` を返すようになった(649d290、6d122d2)のに、試験の期待値(`same(r, {...})`)にこの 2 欄が無い。試験の取り残し。test:template-suite の落ちはこの 1 本だけが原因。直し先は template の test-records.mjs の期待値(2 欄を null として足す)。
2. test:criteria(check-gate-criteria.mjs)。`src/data/tailoring/` 側の判定基準の複製が書く「生成元の版」3b278f5f は、書き換え前の旧コミット(同じ題の 443b817f に置き換わり、HEAD の祖先ではない。Windows の本体でも `merge-base --is-ancestor` が偽)。rebase / amend の後に `npm run template:kb` で知識ベースを再生成していない。直し先は template:kb の再実行(複製の更新)。

## 偽の判定
- 時計に依存する偽(tpl2 trial.mjs・r3 scen.mjs)は出ていない。通常と TZ=UTC で全結果が同一で、regress の日付は固定。置き換えは不要だった。
- CRLF 由来の偽(test-g5-aggregate)は LF の写しでは出ない。

## 判定
push してはならない(check が 2 本落ちる。いずれも 1 回の直しで閉じる見込み)。

## 確かめていないこと
Windows の node での check、push 後の CI、pit-crew を含む検査、直した後の再実行。

## 後始末
WSL の `~/b23r`・`~/b23-out-*`・`~/b23-run.*`・`/tmp/pit-regress-*` を削除した。Windows の作業ツリーと node_modules の junction には触れていない。
