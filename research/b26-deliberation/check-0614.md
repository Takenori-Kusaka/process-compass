# IMPL-0614 実環境の確認(2026-11-19)

## 確かめたこと

IMPL-0614 の note が「実環境で確かめていない」とした前提: **Issue からラベルを外すと Issue の更新の日時が進み、`updated:>=` の検索に入る**(`fetchScMItems` が、外した Issue を2つ目の検索で拾う根拠)。

## 手順

1. 読むだけの確認を先に試した。process-compass と所有者の全リポジトリの Issue(検索の上限 1,000 件)に、最後の出来事がラベルの外しである Issue は無かった。PR に1件あったが、外しの後に別の更新があり、判断に使えなかった
2. 一時のリポジトリ `Takenori-Kusaka/pit-in-trial-0614-tmp`(private)を作り、確認の後に削除した(`gh repo delete`。削除を `gh repo view` が見つからないと返すことで確かめた)
3. WSL の一時ディレクトリ(`mktemp -d`)で node v26.13.1 を使い、template ad21a42 の `scripts/gate/next.mjs` の `fetchScMItems`・`scMChanges` を直接 import して実行した。台本は scratchpad の `t0614/trial.mjs`・`trial2.mjs`(リポジトリには入れない)
4. Issue を3件作った。A: SC-M を付けて作り、後で外す。B: SC-M を付けたまま。C: ラベルなし・触らない(対照)
5. 作成から約70秒後を T1 とし、その後に A のラベルを外した。検索 `repo:… is:issue updated:>=T1 -label:"SC-M"` を実行した(日付の代わりに時刻を渡し、作成と外しを分けた)

## 出力の要点

| 観測 | 値 |
| --- | --- |
| A の updated_at(外す前) | 2026-11-19T08:58:42Z |
| T1 | 2026-11-19T08:59:56Z |
| A の updated_at(外した後) | 2026-11-19T09:00:05Z(外した時刻の UnlabeledEvent と同じ秒) |
| 検索 `updated:>=T1 -label:SC-M` | A(#1)だけを返した。対照 C(#3。updated_at 08:58:45Z)は返さない。検索の索引の遅れは約20秒以内 |
| `fetchScMItems({confirmedOn: T1})` | B(hasLabel: true、labeled 1件)と A(hasLabel: false、labeled・unlabeled の2件)を返した。C は返さない |
| 閉じた Issue から外す(B を閉じた後に外す) | updated_at が 09:00:49Z → 09:01:02Z へ進んだ |
| ラベルそのものをリポジトリから削除する(Issue D) | Issue に UnlabeledEvent が記録され、updated_at が 09:01:04Z → 09:01:17Z へ進んだ。GraphQL の timelineItems にも UnlabeledEvent が出た |

前提は成り立った。外す・閉じた後に外す・ラベルの削除の3通りとも、更新の日時が進み、出来事の記録が残った。

## 確かめていないこと(note に残す)

- 観測は 2026-11-19 の1回。GitHub の挙動の変更は追わない
- 確定の日と同じ日の出来事は、確定時の状態に数える(`scMChanges` の日付の比較)。今回の `scMChanges(items, 当日)` は baseline 1・追加 0・削除 0 を返した。これは note の開示(手元の暦の日付に直して比べる)のとおりで、欠陥ではない
- 1件の Issue でラベルの出来事が 100 件を超える場合と、検索の上限は、固定の入力の試験(test-next-records.mjs)だけで確かめている

## マークへの反映(実装の担当へ)

- IMPL-0614 を `state=delivered check=machine test=template/scripts/gate/test-next-records.mjs` へ上げる(note の「delivered へ上げるときは」の文のとおり)
- note の「実環境で確かめていない」の文を、「2026-11-19 に一時のリポジトリで1回確かめた(外す・閉じた後に外す・ラベルの削除で更新の日時が進む。research/b26-deliberation/check-0614.md)」に改める。`plan=`・`review=` は外す
