# #355 束3 標準側の実装の記録(2026-11-15)

## 変えたファイル

- `src/content/docs/phase4-process-design/gate-criteria.md`
  - IMPL-0241 のマークを `delivered check=machine test=template/scripts/gate/test-spec-recheck.mjs` へ。直後に IMPL-0523(判断記録の2点。undelivered・scheduled・review=2027-02)と EV-0267 を新設
  - 表(出荷判定の右セル)の文、「出荷判定までの間」の項の末尾、見出しの定義の項(前方一致。「前提条件は読まない」を削る)と新しい箇条書き2つ
  - IMPL-0520 の note の見出しの定義
  - IMPL-0498 の直前に開示の1段落、note へ「数え方を変えない」の文(確かめる者の文の前)、直後に EV-0269
- `roles-responsibilities.md` 3.13.5: 起票は人が行うことの追記、箇条書き2つ(人数の上限向きだけ・部分一致の限界)、IMPL-0023 を `delivered check=machine test=template/scripts/gate/test-aggregate-drift.mjs` へ、IMPL-0524(delivered・manual)と EV-0268 を新設
- `assurance-case.md` の弱い点(1行)
- 新規 `src/content/docs/adr/0136-spec-recheck-by-string-match-and-human-filing-of-drift.md`(sidebar.order 135)
- `src/data/impl-inventory.yaml`: 登録簿の「確定した版を変える場合」に IMPL-0523 を足し、note を直した(検査が要求)
- 台帳 `implementation-ledger.md`・`evidence-ledger.md` を再生成(scope-ledger は変更なし)

## 付けた番号

IMPL-0523(NEW1)、IMPL-0524(NEW2)、EV-0267(NEW1)、EV-0268(NEW2)、EV-0269(NEW3)、ADR-0136。付ける前の最大は IMPL-0522・EV-0266。ADR は 0135 の次(0134 は欠番のまま)。

## 指示書と違えた点

- ADR の一覧(`adr/index.md`)は手書きの一覧が無く、足していない
- ADR-0136 の状態欄は ADR-0135 に倣い、「AI維持管理者の承認待ち・承認者と承認日は未記入」とした。人の記名は書いていない
- IMPL-0498 の note への追記は、「確かめる者」の定型文を末尾に保つため、その直前へ入れた
- EV-0267〜0269 の本文(採用の事例なし、未確認の点)は指示書の「対象」「差し替え条件」から起こした。EV-0269 の差し替え条件は指示書に文が無く、層ごとの承認の突合を抜けた件数と書いた(議長が確認してください)
- textlint の助詞の重複を避けるため、ADR と EV-0269 の文を言い換えた(意味は変えていない)

## 流した検査と結果

worktree に node_modules が無く、b3 の node_modules への junction を一時的に作って流し、終わって削除した。node v26。

- `lint:evidence` 257 件・期限到来 0、`lint:scope` 31 件、`lint:refs` 合格、`lint:tone` 違反なし、`lint:provisions`・`lint:dekimasu` 合格、`test:impl` 56 件合格
- textlint(ADR-0136 と phase4 の3ファイル)違反なし。編集 hook の textlint は「No rules found」と出たが、npx の実行では違反なしを確認した

## 落ちたまま残した検査

- `npm run impl:write`(lint:impl)が、次の2件で失敗する。template 側の担当が試験を作れば解消する
  - IMPL-0241: `template/scripts/gate/test-spec-recheck.mjs` がありません
  - IMPL-0023: `template/scripts/gate/test-aggregate-drift.mjs` がありません
- 上の失敗は台帳の再生成を妨げていない(ledger は更新された)

## 確かめていないこと

- `npm run check` の全量、`lint:sources`・`lint:ci`・template の回帰は流していない
- `template:kb` は流していない(規則データを変えていない)
- 実装の挙動(3値の比較、前方一致、squash 後のオブジェクトの取得)は template 側の実装と試験に依る。標準の文がそれと食い違わないかは、独立の突合で確かめる
- IMPL-0524 の note が言う「/process-change の種別と補助ファイルの所在を開示に出す」は template 側が実装する前提
