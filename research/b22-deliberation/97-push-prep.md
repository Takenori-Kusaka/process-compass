# 97 push の準備(載せ直し)

## 結果

- origin/main(a1066248)の上へ rebase した。載せ直し前の 23 コミットは全て載り、この文書を含むコミットを足して 24 コミットになる。template(submodule)は origin/main と同じ 795cbb7 で、作業ツリーに変更は無い。pit-crew は取得していない
- push はしていない

## 衝突と解き方

| ファイル | 解き方 |
| --- | --- |
| evidence-ledger.md・implementation-ledger.md(複数のコミットで繰り返した) | origin/main 側を採り、最後に `npm run evidence:write`・`impl:write` で再生成した |
| phase4-process-design/tailoring-guide.md(IMPL-0761〜0764 の 4 マーク。2 コミットで同じ箇所) | B23 の変更を保った。IMPL-0761 の「欄の検査は IMPL-1007」、IMPL-0762 の「安全関連部は F.3 で L1 固定(IMPL-0919)」、IMPL-0764 の delivered 化(machine・test 付き)。B22 の IMPL-0763 の文言(ADR-0224、ミューテーション試験の段)だけを採った |
| phase4-process-design/safety-verification.md(F.7 の表の 2 行) | 「適用した手法」は B23 の「手法ごとに推奨度と出典を書く」に B22 の「F.4 の注の案件のミューテーション試験を除く。理由で省けない」を足した。「故障挿入の結果」は B22 が変えていないため B23 の「実行前の挿入では、その旨」を採った |

## B23 と意味が衝突した箇所(同じ節を両方が直した箇所)

- tailoring-guide.md の IMPL-0761〜0764 のマーク群(上の表)。IMPL-0764 は B22 側が undelivered(issue=448)のままだったが、B23 が delivered にしたため B23 を採った。B22 の本文はこの行を変えていない
- safety-verification.md F.7 の「適用した手法」の行(上の表)
- 上記以外の本文は自動で合流した(exception-escalation.md・roles-responsibilities.md・impl-targets.yaml は自動結合)。意味の突合は独立の突合の担当に委ねる

## 番号の確認

| 種別 | origin/main の最大 | B22 の番号 | 重なり |
| --- | --- | --- | --- |
| EV | EV-0336 | EV-0337〜0341 | なし(連番) |
| IMPL | IMPL-1028 | IMPL-1029・1030 | なし(連番) |
| SRC | SRC-0765 | SRC-0766・0767 | なし |
| ADR | 0222 | 0223〜0225 | なし |

付け直しは不要だった。95-renumber.md と 96 のコメント下書きは変更していない。

## 検査(1行ずつ)

- lint:evidence 通過(321件、期限到来 0)
- lint:impl 通過(降りていない IMPL-1029・1030 は scheduled で表示)
- lint:scope 通過
- lint:refs 通過
- lint:sources 通過
- lint:provisions 通過(違反なし)
- test:plan-issues 通過(22件)
- impl:issues 通過(計画の Issue は全て open)
- textlint: 変更した md に違反なし
- 台帳は evidence:write・impl:write・scope:write で再生成(scope は変更なし)。template:kb と npm run check の全量は流していない
