# #354 項目2 独立の突合 1巡目の所見の直し(2026-11-17)

裁定の正本は `item2-fix-round1-ruling.md`。template の直しは bb9d67c(bundle: template-b8-354-03)。

| 所見 | 結果 |
| --- | --- |
| 高-1 | 実装を表示へ揃えた。`continuityState` が数えなかった名に kind(missing / lapsed / unresolved)を付け、`written`(書いた異なる名)と `potential`(数えた名 + unresolved)を返す。集約は potential が1名以下なら離脱、2名以上なら unverifiable(名を下げず、数えなかった理由を出す)。確認日なし・周期超過は missing / lapsed として離脱側に置いた(裁定の一覧に明示がない2点。要確認)。試験は表 A〜F・K と iv(1 名)で確かめた |
| 中-1 | (iv) に有効な層1 を置き「数えた 1 名」を確認。A の ok、B・C・D・K の unverifiable、E・F の離脱を足した |
| 中-2 | ADR-0147 決定2 の「解けない」を一覧で定め、非対称の文は注記を出す理由に書き直した |
| 中-3 | 範囲の終点のコミット(`git show`)の記録と構成で読む。autonomy.mjs と同じ一時ディレクトリの経路。終点が先頭でない過去の範囲の試験は無い(ADR の「確かめていないこと」に記載) |
| 中-4 | IMPL-1102(delivered check=manual。出荷判定者)を新設。IMPL-1101 は認証情報の2つに絞った。登録簿(impl-inventory.yaml)も更新 |
| 中-5 | generate-profile.mjs の 3744・4345 行を B-2 の語へ揃えた |
| 低-1 | 1201・3738 行と verify-gate-contract.mjs:374 の注釈を揃えた |
| 低-2 | 構成書の注記に、数える線と、氏名の表記・ホスティング外の認証情報を数えない旨を足した |
| 低-3 | `dedicatedIds` を配列にし、同じ id の全席との禁止の組を注記する。試験 認証情報(iv) |
| 低-4 | 試験を架空の規則(価値責任者 × 事業決裁者)に改め、名に「架空の規則」と明記 |
| 低-5 | 「この項目では名を下げません」に改めた |
| 低-6 | 番号は IMPL-1100〜1102 のまま。push の前に付け直す(未実施) |

ADR-0147 の影響に、委任の停止(ADR-0081 決定6)との読みの違いを書いた。

通した試験: test-edition-end(61)・test-performer-account(67)・test-roster-rules(186)・test-aggregate-drift(25)・test-aggregate-records(135)。test-g5-aggregate は 4 / 23 NG(workflow の検査。今回の変更と無関係の見込みだが、変更前との比較はしていない)。npm run: template:kb(commit 欄のみの差は戻した)・impl:write・evidence:write・scope:write・lint:refs・lint:impl・lint:evidence、textlint(ADR-0147)。
