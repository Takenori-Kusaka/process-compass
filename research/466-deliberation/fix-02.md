# #466 まとまり 1: 独立の突合 2 巡目(verify-02.md)の所見の直し

- 日付: 2026-11-28。裁定は `ruling.md` §14 に従った。L-a・L-e・L-f は変えていない。3 巡目は開かない
- 実行: Windows・node 26。全量の `npm run check` と回帰の全量は流していない(push の前に 1 回)

## 1. 所見ごとの直し

| 所見 | 直した所 | 変えた試験の期待と理由 |
| --- | --- | --- |
| N1 | template `generate-profile.mjs`: 観測の窓の変化点を向きなし(`push(..., 0, 0, M)`)にし、前の値が無ければ「定めていない」と出す(名目の 2 か月で比べない)。初めて定める記録は変化点の行を作る。不要になった `WINDOW_MONTHS` の import を外した。`autonomy.mjs` 482 の文から「緩める向きの」を外した。決定した者と理由の記録・AI の名義の拒否は入口の検査のまま。ほかの値の向きは変えていない | `test-loosening-decider`: 「長くする変更は緩める向きとして変化点に残る」を、「変化点に残り、向きを付けず、定めていない前の値は『定めていない』と出す」へ。ADR-0129 決定2(長くするのは緩める向き)の置き換えに伴う |
| N2 | 本体 `template-repository.md` 656 の「下限2」を「下限は月で数える構造の1か月」へ | — |
| N3 | `undefinedValues(config, day)` に評価の日を渡す(`autonomyState` は当月1日、`/pit` は当月1日、`review-queue` は当日と、`queueActions` の既定)。`priorWindowExists` は月ごとに `minSampleOf(config, m)`。`autonomyState` の `window.minSample` も評価の日で読む | 足した場面: `test-check-delegation`(未来の日付の記録は一覧に「定めていない」と出る・`loadLimitOf` が効かない)、`test-review-queue` 2 件(上限が評価の日より前なら効く・未来の日付なら効かない) |
| N4 | 本体 GC 1442 の箇条の対象を「G-6 の判定記録の様式の記録(承認レビューの本文と、委任の事後の抜き取りの記録を除く)」へ改め、足し手の条件は取り込みの前後を分けず当てる、取り込んだ後に作る記録はさらに出荷判定の前の追加を要する、と書いた(限定は箇条の中)。IMPL-1068 の note と template `G-6.md` の行を揃えた。実装は変えていない | — |
| N5 | template `aggregate-evidence.mjs` の `recordNotCounted`: 合格した G-7 の記録が HEAD にあるのにコミットを引けないときは、数えない側(`recordAfterShipment`、既存の「履歴から読めない」の文)へ倒す。作業ツリーにだけある(HEAD に無い)G-7 は従来どおり飛ばし、コメントに書いた。ヘルパ `committedInHead` を足した | `test-record-independence` に 2 場面: 統合のコミットだけが足した G-7(足したコミットを引けない)で G-6 を数えない・未コミットの G-7 があっても G-6 の数え方は従来どおり |
| L-b | HAB 5.4.6 の「下限は置かず」を「値の下限は置かず(月で数える構造の1か月だけが下限です)」へ | — |
| L-c | `generate-profile.mjs` の reworkBaseline のコメントを、止めない挙動(手戻り率の検知が働かない・全件を事後に確認)へ | — |
| L-d | `next.mjs` の JSDoc を、`autonomyNotes` の直上へ戻した(`undefinedValueNotes` の注記は別に付けた) | — |
| L-g | README の autonomy.mjs の行に「事後の確認の記録を読めないときは、適用の条件の欠落として止まる」を足した | — |

## 2. 流した試験(数だけ)

- template: test-check-delegation 83 場面・test-review-queue 66・test-next-records 159・test-record-independence 11・test-aggregate-records 226・test-assurance-period 31・test-direct-commit-rules 11・test-roster-conditions 77・test-control-approval 74・test-roster-rules 232・test-aggregate-drift 46・test-aggregate-wiring 65・test-loosening-decider すべて通過。落ちた試験は無い
- 本体: textlint(触った 3 md)・lint:impl・lint:evidence(367 件)・lint:scope・lint:refs・lint:tone・test:fields はすべて通過。impl:write と scope:write で台帳を再生成した

## 3. 直せなかった所・残し

- なし。N5 の既存の集約の試験はすべて通ったので、実装は戻していない
- N5 の「引けない」場面は、統合のコミットだけが足した記録で再現した。浅い取得での挙動は確かめていない(HEAD に無く作業ツリーにもある場合は従来どおり)
- 回帰の全量は流していない

## 4. コミット

- template: `932af0c`(ブランチ d4-466)。bundle: `466-tpl-fix2-1.bundle`
- 本体: 次のコミット(`docs(standard)`。`template` の参照は含めない)
