# #355 束3 1巡目の所見の直し(標準の担当)

日付 2026-11-15。指示は `b3-fix-round1-ruling.md`。template/ は触っていない。コミットなし。

## 所見ごとの直し
- R1-01: 裁定の式(1〜5)を同じ語で、`gate-criteria.md` の表の右のセル・新しい箇条書き・IMPL-0241 の note、ADR-0136 の決定1と影響へ書いた。「基準5 の欠落がそのまま当たる」は削り、裁定4 の文へ置換。ADR-0136 の「採らなかった案」へ (a) と理由を追加
- R1-03: 集約は `spec.md` の変更に限る(経路は問わない)と、note・箇条書き・ADR に明記
- R1-04: `src/data/impl-untraced.yaml` へ `scripts/gate/spec-recheck.mjs` を `reason: library` で登録(`spec-sections.mjs` と同じ形。逆向きの追跡の指摘は解消)
- R1-05: 「3節のうち両側で取り出せない節が在る機能仕様は、不一致が無くても、全文が一致する場合を除き未確認」へ(箇条書き・note・ADR)
- R1-06: note・箇条書き・ADR に、品質レポートへ機能・記録の所在・理由を出し、外部向けは件数だけと明記
- R1-07: 限界3点(様式での差し戻し・合流・削除/改名)を note・箇条書き・ADR へ。(a) は EV-0267 の対象へ
- R1-09: IMPL-0524 の note・3.13.5 本文・ADR を「人数と担い手の識別のずれごとに」へ。D-0 の版の不一致は記録の欠落で、種別は併記しないと追記
- R1-10: 受入基準だけが spec-lint と同じ定義、「前提知識」等も前提の節として合否に効くことを箇条書き・IMPL-0520 と IMPL-0241 の note・ADR へ
- R1-12: EV-0267 の本文を「履歴に無い版が未確認になることは試験で確かめた。実環境の先頭コミット取得は未確認」へ。EV-0269 の差し替え条件へ観測の源(プロセス内部監査の所見・是正の記録)
- 台帳: impl:write・evidence:write・scope:write で再生成(implementation-ledger.md・evidence-ledger.md が更新)

## 流した検査(node_modules は b3 への junction。終了後に junction だけ外した)
- textlint(ADR-0136・gate-criteria.md・roles-responsibilities.md): 違反 0(途中の助詞・文長の違反は直した)
- lint:refs・lint:evidence・lint:scope・lint:tone: 通過
- lint:impl: 落ちたまま。残りは IMPL-0241 の `:ng`・`:ok` が `template/scripts/gate/test-spec-recheck.mjs` に無い2件(IMPL-0023 の2件は、再生成の後の実行で消えている)。template 側の担当が目印を足すまで残る。note の test= の所在は、目印を足すファイルが変わる場合に直す必要がある

## 指示と違えた点
- 「基準5 の欠落がそのまま当たる」の置換に加え、ADR の影響の節の文(欠落の条件)も式に合わせて直した
- 式の (1) の「効いている」の定義を1つの関数にする旨(R1-08)を、ADR の決定1へ1文足した(実装は template 側)

## 確かめていないこと
- `npm run check` の全量、lint:impl の template 側の目印が付いた後の通過
- note の文が template の実装・理由の文と語で一致するか(template 側の担当の成果との突合は未実施)
