# Issue #439 独立の突合 1巡目の直し(2026-11-15)

所見 10 件(高 1・中 2・低 7)の対応。直した 9 件、直さない 1 件(L-7)。

## 所見ごとの対応

| 所見 | 対応 | 内容 |
| --- | --- | --- |
| H-1 高 | 直した | `scripts/check-impl-plan-issues.mjs` に `--issue <番号[,番号]>` を足した。状態に依らず、その番号を `issue=` に持つマークを列挙し、1 件以上で exit=1、0 件で exit=0、値が読めなければ exit=2。オフライン(gh を呼ばない)。規約(implementation-marking.md)と ADR-0130 決定4・決定5 の手順の文を `npm run impl:issues -- --issue <番号>` に合わせた。引数なしの `impl:issues` は「閉じた後の確認で、閉じる前には使えない」と明記した。EV-0259 の本文も合わせた |
| M-1 中 | 直した | ADR-0084 のステータスの節に「一部置き換え(→ ADR-0130 の決定1)」と置き換えた範囲を足した。本文は触っていない |
| M-2 中 | 直した | 下の「足した試験」のとおり。(a)(b)(c)のうち(c)は静的な結線の試験で足した(下記)。EV-0259 の「試験の範囲」の文も実態に合わせた |
| L-1 低 | 直した | 状態が open・closed 以外なら例外にして exit=2。`ghStateOf` と `planIssueFindings` の両方 |
| L-2 低 | 直した | 404 の判定を `\(HTTP 404\)` に限った。`ghStateOf` を lib へ出し、gh の実行関数を引数にした。番号に 404 を含む URL の失敗は実在しない扱いにならない。リポジトリ名の誤りなど、HTTP 404 を返す失敗が全件「実在しません」になる点は残る(失敗の側に倒れ、偽の合格にならない。最初にリポジトリを問う案は採らない: 呼び出しが増える割に、表示の原因が変わるだけである) |
| L-3 低 | 直した | `issue=` を持つマークが 0 件なら exit=2(置き場・書式の誤りを合格にしない) |
| L-4 低 | 直した | 試験の名前を「コメントは、機械が状態を変えないことを書き、責任者・承認者を書かない」に改めた |
| L-5 低 | 直した | ADR-0130 決定3 を「写しは ADR-0089 が定める。状態を書かないのは `scripts/issues-snapshot.mjs` の設計」と分けた |
| L-6 低 | 直した | EV-0260 の枠の閉じの後に空行を入れた |
| L-7 低 | 直さない | 検出とコメントが同じジョブで `issues: write` を持つ。裁定と ADR-0130 決定2 の文言(コメントするジョブに付ける。`evidence-review.yml` と同じ付け方)に合う。検出の手順は読み取りしかしない(gh の呼び出しは GET と、コメントの手順だけ)。ジョブを分けると成果物の受け渡しが増え、結線の誤りの面が広がる。権限を手順の単位で絞る利益は小さい。本件の本リポジトリ内部の道具に限る判断 |

## 足した試験(`scripts/test-plan-issues.mjs`、10 件から 20 件へ)

- `marksNaming` と `parseIssueList`
- `--issue` の違反(exit=1)・適合(exit=0)・値が読めない(exit=2)。スクリプト本体を、PATH を空にして spawn する(gh が呼ばれればここで落ちる。ネットワークへ出ない)。マークの置き場は環境変数 `IMPL_DOCS_DIR`(試験用)で一時のフィクスチャに向ける
- gh が無い(PATH が空)ときの exit=2
- `--closed-from` の違反・適合・読めない行(exit=1・0・2)
- マークが 1 件も無いとき exit=2
- `ghStateOf`: HTTP 404 だけを実在しないとし、401・403・ENOENT・404 を含む URL の失敗は例外。状態を読めない応答は例外
- 結線(静的): `check-impl.mjs` が `issueRefProblem` を `issue=` のマークに掛け、`errors.push` へ入れること。`check-impl.mjs` を実行する形にしなかったのは、リポジトリ全体を読む重い検査になるためである。静的な試験は、結線の文の形を変える編集には気付かない。限界として残る

## 流した結果

- test:plan-issues 20 件合格、test:impl 56 件合格、test:ci-wiring 38 件合格
- lint:impl・lint:refs・lint:evidence(250 件)・lint:ci・lint:scope 合格
- textlint(implementation-marking.md・ADR-0130・ADR-0084)違反なし
- `impl:write`・`evidence:write`: 変更なし(台帳に影響しない)
- 実機の確認: `node scripts/check-impl-plan-issues.mjs --issue 443` は exit=1、`--issue 99999` は exit=0、`--issue x` は exit=2
- `npm run check` の全量は流していない(議長の指示)
