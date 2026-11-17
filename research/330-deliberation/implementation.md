# #330 実装の記録

日付: 2026-11-17。担当: 実装(段3)。根拠: decision.md(0ec39d2b)。template/ と pit-crew/ は変更していない。

## 変えた所在

| ファイル | 変更 |
| --- | --- |
| src/content/docs/phase4-process-design/gate-criteria.md | G-5「検査対象が存在しない場合の扱い」に構成で選んだ未実施の段落(EV-0293、IMPL-0992)。項目4 の行と箇条に継続期間(EV-0292、IMPL-0993)。IMPL-0234・0239・0476 の note |
| src/content/docs/phase4-process-design/assurance-case.md | H.6 の併記の表に項目4 の行。C3 の行と観点16 の確かめ方に継続期間 |
| src/content/docs/phase5-implementation/template-repository.md | 空コマンドの表のカバレッジを分け ADR-0124 に合わせた(編集)。caution の末尾に区別を足した |
| src/content/docs/phase5-implementation/ci-gates.md | 継続期間の併記と起点・回数の引き継ぎを項目4 へ広げた |
| src/content/docs/adr/0151-unselected-optional-check-not-failure-disclose-duration.md | ADR-0151 を新設 |
| src/data/impl-inventory.yaml | 節「検査対象が存在しない場合の扱い」に IMPL-0992、G-7「保証の開示」の節に IMPL-0993 |
| src/content/docs/community/evidence-ledger.md・implementation-ledger.md | 再生成 |

## 番号

- ADR-0151。EV-0292(決定2 の前提。decision の EV-TMP-330-1)、EV-0293(決定1 の判断。同 -2)。origin/main の最大は EV-0288・IMPL-0988。push の直前に付け直す
- IMPL-0992(delivered)、IMPL-0993(undelivered、issue=330、review=2027-05)

## 検査

lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・lint:dekimasu・lint:text・test:impl・test:criteria・test:fields・test:registry 系は通過。変更した md は textlint を通過。全量の check は流していない。

## 裁定から外れた点

1. IMPL-0992 は check=machine ではなく check=manual とした。lint:impl は machine に、試験(test-g5-aggregate.mjs)の中の IMPL-0992:ng・IMPL-0992:ok の目印を要する。template/ を触れないため付けられない。note に理由と確かめる者を書いた。T-4 で目印つきの試験を足したときに machine へ戻す
2. EV の書式が「根拠の水準」の欄に説明文を許さないため、説明は「対象」の欄へ移した。ADR-0151 は EV の重複を避け、caution を置かず本文で EV-0292・0290 を指す
3. IMPL-0993 は H.6 の節ではなく、マークのある G-7「保証の開示」の節に登録した(検査が節の中のマークを要する)
4. ADR の index には ADR の一覧が無く、更新箇所が無かった

## 残すもの

T-1〜T-7 は template を触らず #330 に残す。Issue は開いたままにする。

## 束 B12 での追随(2026-11-17。T-1〜T-8 の記録)

- template を変えた: T-8(6a7adf2。空のコマンド・対象なしのライセンス検査を実施と記録・表示しない)、T-1〜T-7(fce8273。未実施の継続期間を項目4 に出す、アダプタの空のコマンドの扱いを注釈と試験で固定、手引き)。突合の直し(X1・X3・X5〜X7)は template の次のコミット。経緯は b12-04-implementation.md・b12-05-crosscheck.md・b12-06-fix.md
- 標準の側で降ろした: IMPL-0995・0992・0993(91d1968c)。ADR-0151 の「影響」(L39・L65)は IMPL-0993・0995 を undelivered と書いたままである。ADR は書き換えない。降りたことは実装マークの台帳(community/implementation-ledger.md)で辿る
