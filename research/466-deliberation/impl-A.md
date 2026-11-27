# 段 A(template): 確認の記録の独立性 — 実装の結果

- 日付: 2026-11-27。template のブランチ `d4-466`(基点 c8d4e27)。本体・submodule の参照は触っていない。push していない

## 変えた関数と要点(`template/scripts/gate/aggregate-evidence.mjs`)

- 新: `recordPlaceOf`(記録を足したコミット。記録用ブランチの様式があればその `added`、無ければ基底の `recordCommitOf`)・`addedBefore`(G-6 が G-7 より前か。祖先の関係)・`recordAdderMatches`(足し手と判定者の照合)・`recordNotCounted`(数えない理由)
- `independentConfirmation`: `g6RecordsFor(refers)` を `recordNotCounted` で濾す。数えない記録は候補に入れず `about.excludedRecords` に理由を残す。候補が無いときの理由に `recordAfterShipment`・`recordAdderMismatch` を足した(AI・bot だけの承認のときは従来どおり `aiOrBot`)
- (e) 制限の照合: 取り込む前の版の時刻(従来)と、記録を足したコミットの日付の両方で `restrictionHit` を引き、どちらかが当たれば 2 名を要する
- 直接コミットの欠落の文に「数えなかった G-6 の判定記録: …」と、人数不足の文を足した(PR の経路は従来の `reasonText` にそのまま載る)
- 集約の出力: `unconfirmed.recordAfterShipment`・`recordAdderMismatch`、`changes.recordAdderByAuthor`・`recordAdderBySignature`、`notCountedReason` の識別子 `record-after-shipment`・`record-adder-mismatch`
- 1874 行の注記を更新(2人目の承認者の記名は足し手と照らさないことを明記)

## 足した出力の文(全文)

- 理由(UNCONFIRMED): 「当該の変更を含む出荷判定(G-7)の記録より後に足された G-6 の判定記録は、独立した人の確認に数えない(前後を読めない場合も数えない)」
- 理由: 「G-6 の判定記録を足したコミットのアカウントが、判定者の欄の人と対応づかない(署名を要する構成は署名者、署名の無い構成は作成者の名義で照らす)」
- 個別: 「記録 <file> は、当該の変更を含む出荷判定(G-7)の記録 <file> より後に足されている」/「…の前後、または変更との関係を、履歴から読めない」/「記録を足したコミット <sha8> の作成者(<名>)が、判定者 <名> と対応づかない」/「…の署名を、ホスティングの検証で確かめられない」/「…の署名者が、判定者 <名> のアカウントでない」
- 開示の行(保証の開示 項目1。数えた変更があるときだけ): 「独立した人の確認に数えた変更のうち、G-6 の判定記録を足したコミットのアカウントを判定者と照らしたもの(署名を要する構成は署名者、署名の無い構成は作成者の名義。作成者の名義は書き手が設定できるため、署名の無い構成の一致は他人の名義を使った書き込みを防がない。判定記録の2人目の承認者の記名は、足し手と照らしていない)| 署名者 N 件 / 作成者の名義 M 件」
- 内訳の 2 行(「出荷判定(G-7)の記録より後に足された…だけである」「…足したコミットのアカウントが、判定者と対応づかない」)

## (a)〜(e) の所在と、閉じた範囲・開示で受けた範囲

- (a) 追記のみ: 既存(`recordsHistoryGaps`・`scanRecordsHistory`。書き換えを欠落に数える)。新設なし。機械で閉じるのは検出まで(書き込みの防止ではない。既存の開示のとおり)
- (b) 前後: `addedBefore`/`recordNotCounted`。両方が記録用ブランチにあれば記録用ブランチの祖先、無ければ基底の祖先。日付は使わない(試験で日付を逆にして確認)。読めなければ数えない側。**機械で閉じた**。開示で受けた範囲: (1)「当該の変更を含む G-7」は、基底ブランチに複製のある G-7 だけで引く(記録用ブランチにだけある G-7 は引かない)、(2) 変更のコミットを持たない層の判定(`at: null`)は前後を照らさない、(3) 取り込んだ後の記録が G-7 より前で、G-7 の後に出荷した次の版の材料にする使い方は、G-7 ごとの前後で見る
- (c) 足し手: `recordAdderMatches`。署名を要する構成(`recordsSignatureRequired`)はホスティングの `commitOf`(検証済み・author と committer の数値の ID が判定者)、無ければ author の名義(名簿の氏名・アカウント)。**開示で受けた範囲**: 署名の無い構成の作成者の名義は偽れる(開示の行に全文)。判定記録の 2 人目の承認者は足し手と照らさない(開示の行に書いた)
- (d) 対象の一致: 既存の対応づけ(`refers`)のまま。変更なし
- (e) 制限: 取り込み時点と記録を足した時点の両方。記録を足した時点はコミットの日付(書き手が設定できる。制限の照合にだけ使い、前後の判定には使わない)。**開示で受けた範囲**: 日付の偽りで制限を外れる余地

## 試験(分類つき)

- 足した: `scripts/gate/test-record-independence.mjs`(11 件。`.github/workflows/gate-g5.yml` に結線)。G-7 の前は数える(日付が後でも)/G-7 の後は数えない(日付が前でも)/足し手 ≠ 判定者/署名を要する構成で確かめられない/制限(記録の時点)/記録用ブランチの前後(同じ複製コミットでも)/署名なしの注記/PR の経路 2 件(偽の gh。Windows は読み飛ばし)
- 直した既存の期待: なし(穴の塞ぎ・決定の置き換えとも、既存の期待の書き換えは出ていない)

## 流した試験(数だけ)

- test-record-independence: Windows 9 件通過(PR の経路 2 件は skip)。WSL(node 22)で 11 件通過
- test-direct-commit-rules 11・test-aggregate-records 223・test-assurance-period 31・test-aggregate-drift 46・test-aggregate-wiring 65・test-discouraged-evidence 13・test-defect-stages 13: すべて通過。全量は流していない

## 未確認の点(実機で確かめる必要があるもの)

- 署名を要する構成で、実際のホスティングの `commitOf` が返す値で足し手が判定者と一致する経路(偽の gh でも未試験。試験は「確かめられない」側だけ)。F1 で確かめる
- records 用ブランチの記録を出荷の PR が複製する実際の履歴(機械の複製のコミットの形)。試験は機械の複製を 1 コミットにした形だけ
- `/gate` のスキルと様式の文に、順序(G-6 の記録は出荷判定より前)と足し手の条件を書く文は未追加(人の記入欄は増やしていない)。段 E1 の本文と合わせて足す
- node 26 では未実行(WSL は node 22)

## 次の段(B: 委任の経路)へ渡すこと

- 同じ `aggregate-evidence.mjs` の `samplingMonthly` を触る。`recordNotCounted` は `g6RecordsFor` の下流で、委任の抜き取りの記録(確定の形態が委任)は `g6RecordsFor` が元から除く。抜き取りの記録を読む経路には今回の濾しを掛けていない(段 B で、事後の記録の足し手と前後の扱いを決める)
- `independentConfirmation` の `about` に `excludedRecords`・`recordAdderChecked` が増えた。委任の判定が `independent` を読むなら、数えなかった理由が増えたことに注意

## template のコミット

- aaa320e fix(gate): 取り込んだ後に作った G-6 の判定記録を、出荷判定の後と足し手が判定者と違う場合に数えない(bundle: `tmp/466-tpl-A-1.bundle`)
