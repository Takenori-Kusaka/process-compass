# #337 実装の記録

日付: 2026-11-17。裁定: `decision.md` §4。template/ と pit-crew/ は変更していない。

## 変えた所在

- `src/content/docs/phase4-process-design/gate-criteria.md`
  - 表の前の段落: 基準6 の分量の上限は組織が定める値で、未設定の間は満たしたと記録しない(§4.1-1)
  - 基準6 の値の欄: 組織が定めた上限を超えるファイル 0 件、要求事項1 を引く(§4.1-2)
  - 準拠テンプレートの段落: 未設定の間、G-5 の集約は分量の項を満たさないまま通る。ADR-0126 を引く(§4.1-3)
  - 「L0 の既定値」の節: RC-01 についてであり 3.11.4 には掛からない(§4.1-4)
  - 「カバレッジの測る範囲と規模(基準3)」: 導出値の開示と、一致を機械で確かめない旨。IMPL-0991(§4.3)
  - EV-0143: 下限を満たして出荷された変更に限る旨の1文(§4.4)。新しい EV は置いていない
- `src/content/docs/phase4-process-design/roles-responsibilities.md`
  - 3.12.12 の登録簿に列「超過・未達のときの扱い」(RC-01〜12)と、列は要約で正本は引いた条項である旨の注(§4.2)
  - IMPL-0222 の note に、未設定の間 G-5 の集約が通る旨(§4.3)
- `scripts/check-recalibration-registry.mjs`・`scripts/test-check-recalibration-registry.mjs`: 能力に「依る」行で新しい列が空なら失敗(存在のみ)。変異試験を1件足した
- `src/data/impl-inventory.yaml`: カバレッジの節の登録へ IMPL-0991 を足した
- `src/content/docs/community/implementation-ledger.md`: 再生成

## 番号

- IMPL-0991(裁定の IMPL-TMP-337-1)。直前の最大は IMPL-0990(#330)。`issue=450`(#324 の残り: 様式(企画書ほか)が準拠テンプレートに降りていない)に寄せた。push の前に衝突があれば付け直す
- EV: 追加なし(最大は EV-0290 のまま)

## 検査と結果

lint:impl・lint:evidence・lint:refs・lint:scope・lint:sources・lint:provisions・lint:registry は 0 で通過。test:registry(16 件)・test:provisions 通過。textlint(2 ファイル)は指摘なし。`npm run check` の全量は流していない。

## 裁定から外れた点

なし。後継の Issue は既存の #450 へ寄せたので、#450 へのコメント(§4.6 の template 5 項目の引き継ぎ)と、#337 のコメント(所有者の引用の誤りの訂正。§4.7)は未投稿。議長か次の担当が行う。

## 追記(2巡目の直し。2026-11-17)

- 運び手を #450 から #337 へ変えた(chair-on-crosscheck-1 中3)。IMPL-0991 は `issue=337`。#337 への template の項目の一覧(IMPL-0991、§4.6 の1〜4、IMPL-0998、RC-06 の論点)のコメントは、push の後に議長が書く。上の「#450 へのコメント」は、この追記で置き換える
- IMPL-0998 を足した(上限が未設定の状態を、準拠テンプレートが宣言の欠落として出さないこと。undelivered、issue=337)
