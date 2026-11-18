# 束 B21 単位8 突合 2巡目の直し(#443)

2026-11-18。template `898d7dd`(bundle `template-b21-05.bundle`)。裁定は `ruling-unit8-fix2.md`。

## 所見ごとの扱い

| 所見 | 扱い | 直した内容 | 試験 |
| --- | --- | --- | --- |
| 高 H-1(0374) | 直した | 0374 を `undelivered check=manual plan=scheduled issue=443 review=2027-05` へ下げた(0377・0614 と同じ属性)。note は「実装した部分(S0 の初回だけ。試験済み)」と「降りていない理由・B20 の後に上げる・確かめる者」に分けた。L-6(完全に一致と NFKC の差)も note に開示した | 台帳の再生成、lint:impl・impl:issues の通過 |
| 中 M-1(1000 件の上限) | 直した | `fetchScMItems`・`fetchClosedUnits` が 20 ページに達して続きがあれば例外にする。`issueCount` が 1000 超でも例外。2つ目の検索に `-label:"SC-M"` を足して範囲を狭めた。`flowSection` が理由を `changesError` に持ち、`flowReportText` が「変動率: 算定できない(SC-M の履歴を読めない: 理由)」と出す | 上限(件数・ページ)の ng 2件、文面の ng 1件 |
| 中 M-2(確定の前に閉じた Issue の整理) | **機械にした** | 理由: 日時の比較(`closedAt` の手元の日付 ≦ 確定の日)だけで決まる。該当する Issue のラベルの整理は追加にも削除にも数えない。確定の日の後に閉じた Issue の整理は、意味を読まないと除けないので数え、SKILL.md と 0614 の note で開示した | 整理の ng 1件(baseline 1・added 0・removed 0) |
| 低 L-1(UTC と手元の暦) | 直した | `scMChanges` が出来事と `closedAt` を手元の暦(`localDay`)へ直して比べる | 手元 10-01 08:30 の削除の ok |
| 低 L-3(出来事の無い Issue) | 直した | ラベルの検索で返った Issue は `hasLabel` を持ち、出来事が読めなくても開いていれば `remaining` に数える | ok 1件 |
| 低 L-4(試験の弱さ) | 直した | 常に真だった条件を実質のある条件へ置換。ページの上限・暦の試験を足した | 上記 |
| 低 L-5(手引きに SG の後が無い) | 直した | pit/SKILL.md に、SG の後は「算定できない」と出ることと、上限での扱いを書いた | — |
| 低 0500 の note | 直した | PR の番号の指定でも数えること、誰が書いた宣言行も数え偽造を防がないことを追記 | — |
| 低 L-2(外すと更新の日が進む前提) | 直さない | 実環境の確認が要る。0614 の note に未確認と明記し、降ろす単位で1回確かめて記録する | — |
| 低 L-7(JSDoc の節名) | 直さない | 読み手に出ない注釈。所見に数えない | — |

件数: 直した 9(高1・中2・低5と 0500 の note)、直さなかった 2(L-2・L-7)。

## 試験(Windows の node 26)

test-next-records 120 件、test-reach-forecast-record 21 件、test-brief-estimates 17 件がすべて通過。本体は `check-impl.mjs`(lint:impl)・impl:issues・test:fields が通過。全量の check は流していない。

## B20 の push の後の残り

1. 様式 04(判定記録)に「完了の条件」の欄を足す(`src/data/template-fields.yaml` と標準側)
2. `flowSection` が通過した SG の判定記録のその欄を読む処理を足す(いまは「算定できない」)
3. その後に IMPL-0374・0377・0614 を delivered へ上げる(0614 は外した Issue が更新の日の検索に入ることを実環境で1回確かめる。GitHub の読み出しの試験も足す)
