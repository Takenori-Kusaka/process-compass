# #459・#460 外部の出典の抜き書き(SRC 番号は未付番。議長が push 前に付ける)

取得日はすべて 2026-11-27。本文は該当箇所だけを読んだ。

## 仮S1 21 CFR Part 11(米国 FDA 電子記録・電子署名)

- 所在: https://www.law.cornell.edu/cfr/text/21/11.10 ・ /11.50 ・ /11.70(eCFR は自動取得を拒否したため LII の写しで読んだ)
- §11.10(閉じた系の統制)冒頭: "Persons who use closed systems to create, modify, maintain, or transmit electronic records shall employ procedures …"
- §11.10(d): "Limiting system access to authorized individuals."
- §11.10(e): "Use of secure, computer-generated, time-stamped audit trails to independently record the date and time of operator entries …"(以下は未取得。作成・変更・削除の操作の記録と、記録の保持を求める段)
- §11.50(a): "Signed electronic records shall contain information associated with the signing that clearly indicates all of the following: (1) The printed name of the signer; (2) The date and time when the signature was executed; and (3) The meaning (such as review, approval, responsibility, or authorship) associated with the signature."
- §11.50(b): (a)(1)〜(3) は電子記録と同じ統制に服し、人が読める形(表示・印刷)に含める。
- §11.70(要旨。全文は未取得): 署名は記録に結び付け、通常の手段で切り取り・複製・付け替えができないようにする("shall be linked to their respective electronic records to ensure that the signatures cannot be excised, copied …")。
- 本件への効き方: 承認の記録に要る性質を **媒体でなく性質**(本人に結び付く・日時・意味・記録への結び付き・監査証跡)で書く先例。「意味(review / approval …)」は、本標準の宣言行の事前の定義(ADR-0070 決定8)に当たる。規制が署名の様式(帳票の欄・押印)を指定しないことの裏づけ。ただし Part 11 は FDA 規制領域の要求であり、本標準の一般の条項の根拠にはしない(gate-criteria.md「電子署名との関係」の既存の扱いを保つ)。

## 仮S2 国税庁 電子帳簿保存法一問一答【電子取引関係】問9

- 所在: https://www.nta.go.jp/law/joho-zeikaishaku/sonota/jirei/07denshi/02.htm(取得した頁は文字化けがあり、原文の字句は確かめきれていない。下は文脈からの復元)
- 真実性の確保は次のいずれか(規則8条1項): (1) タイムスタンプが付された後に授受 (2) 授受後速やかにタイムスタンプを付す (3) 訂正・削除の記録が残るシステム、または訂正・削除ができないシステムを使う (4) 不正な訂正・削除の防止に関する事務処理規程を備え付ける
- 可視性: 見読可能装置の備付け 等
- 本件への効き方: 「後から改められない、または改めた履歴が残る」を、**特定のシステムでなく性質の選択肢**で書き、技術で満たせない組織には **規程(事務処理の統制)** で満たす経路を残す先例。本標準の「機械で閉じない統制は manual / adopter にする」の型と合う。税務の要件そのものは本標準の適用対象ではない。

## 既存の出典(台帳にあるもの)

- SRC-0537 J-SOX 基準・実施基準(令和5年改訂): 職務分掌を「複数の者」「別の者」の間の分担として書く。承認の記録の媒体を指定しない(PDF 全文の検索の結果は台帳の要約による)。IT 全般統制の承認の証跡の具体の手順は、経済産業省「2024年版 財務報告に係る IT 統制ガイダンス(追補版)」(https://www.meti.go.jp/policy/netsecurity/docs/secgov/2024_ZaimuHoukokuNiKakaruITTouseiGuidance.pdf)にあると見られるが、**今回は読んでいない**。条項にこのガイダンスを引くなら、規格の会議体の前に該当箇所を抜き書きする。
- SRC-0643 / SRC-0542 ISO 9001(2015 / 2026): 7.5(文書化した情報)の本文は台帳でも未読。二次の解説(検索結果)では、保持の期間と媒体を組織が決めるとされる。**規格の文言として引用しない**。引くなら公開プレビューで 7.5.3 を抜き書きする(MEMORY: 規格PDFの読み方)。
- SRC-0331 ISO 19011: 内部監査の抜き取りで客観性を補う考え方(外部の決裁の記録と写しの一致を抜き取りで確かめる案の参照)。
