# 段 B 後半(B2)実装記録(2026-11-28)

台帳の再生成・commit はしていない。template/ は触っていない。

## 変えた箇所(ファイルごと)

- human-ai-boundary.md(6)
  - 5.5.4 の「合否条件にも用いない」に範囲を限る文を足した(人の判定・独立の確認には、どの行でも数えない)
  - 5.5.1 の表の前の文・要求事項の箇条・IMPL-1078 の note・EV-0394 の対象に、R-11(手元で成り立つ事項でも段5 を調べるかはチームが準備物に定める。書いていなければ調べない)
  - 5.8.2 に「AI のレビューへの指示資産」の節ではなく段落と箇条(仕分けの既定 3 項目・追記の由来・戻し・棚卸し・合意の場を新設しない)と EV-0403
- roles-responsibilities.md(5): 3.7.3 の継続の行と段落(行の中に「ステージ移行ゲートの継続では」)・IMPL-1094/3.10.12(要約を入口に辿る・抜き取りは原資料)/3.11.4(由来・棚卸しの候補)/3.5.3 入力の分離の段落
- lifecycle.md(1): 2.10.3 に 1 文
- deliverable-templates.md(2): 企画書の任意の節(項目 1〜11。項目 8 に名前の欄なし)/様式 04 の継続の 1 項目(ステージ移行ゲートの行の並びに置いた)
- review-guide.md(1)・proposal-template.md(2)・overview.md(1)・adoption-guide.md(7: 99 の取り違え・167〜172 の手続を H.4 参照へ・169 の 27.1%)
- template-repository.md(1)・process-audit.md(1)
- tailoring-guide.md(1): 「第5章 5.8」→「5.8.2」のアンカーの整合
- src/data/impl-inventory.yaml: IMPL-1094 を 3.7.3 の ids へ

## 使った番号

- EV-0403(R-7 の開示。E0)。新しい EV はこの 1 件。R-11 は EV-0394 の対象へ含めた
- IMPL-1094(R-8。undelivered・manual・adopter・ADR-0277)。IMPL-1078 の note を直した

## 確かめ

textlint(触った全ファイル): 無音。lint:refs・test:fields・test-provisions(101/101): 通過。lint:impl・lint:scope・evidence: 台帳が最新でない旨のみ。

## 裁定どおりに書けなかった点・食い違い

1. R-11 の adopter マーク: 5.5.1 の節は `impl-no-adopter.yaml` にあり、adopter の IMPL を置くと lint:impl が落ちた。置かず(足した IMPL-1095 は削除し、inventory も戻した)、IMPL-1078 の note と本文で受けた。裁定 16.4 は R-11 に adopter マークを明示していないが、impl-plan の「R-11 は adopter」とは食い違う
2. 裁定 16.2 の「指示資産の節(5.8.x)」: 該当する節の見出しが無いため、5.8.2 の「指示の保存」の直後に見出しなしの段落として置いた。B1 の前提 3 の参照も 5.8.2 へ直した
3. 様式 04 に「継続の行」に当たる表が標準の第6章には無い(表は template/ 側)。ステージ移行ゲートのみの項目の並びへ 1 項目を置いた
4. 3.5.3(roles)に「5 条件の確認」の記述が無く、入力の分離の段落に H.4 への 1 文を置いた
5. 裁定の R-7 の閉じ方(manual。AI維持管理者の四半期)は IMPL マークを置いていない(16.4 の 8 件に無い)

## 残った点

- 台帳 3 本の再生成(段 F)
- R-11 の adopter の開示を別の形で置くか(議長の判断)
