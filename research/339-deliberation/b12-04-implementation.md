# #339 実装の記録(束 B12、実装の担当)

## template(コミット a4e8ea6、bundle: template-b12-339-01.bundle)
- `scripts/gate/config.mjs`: `detectionFilled` を export し、`missingBasis` が使う(挙動は不変)
- `scripts/gate/autonomy.mjs`: `DETECTION_UNVERIFIED`・`detectionBasisText` を追加。`reworkText` は本体(`reworkTextBody`)に1か所で付ける。`REWORK_UNCOUNTED` の2文目を改めた。type に `detectionFilled` を持たせた
- `scripts/init/generate-profile.mjs`: `reworkMeasured` を `detectionFilled` の判定に変え、D-0 の表の記入ありの枝に `DETECTION_UNVERIFIED` を出す
- `templates/00-d0-governance.md`(節12 の箇条)、`README.md`: 指示書の文を足した
- 試験 `test-check-delegation.mjs`: IMPL-0983:ok / :ng / 判定の一致 / 文言の4 check を追加

## 本体
- `human-ai-boundary.md` の IMPL-0983 を指示書の文へ(state=delivered)。`npm run impl:write` で台帳を再生成。template の参照を進めた

## 試験
- test-check-delegation: 68 場面通過。test-assurance-period: 31 件通過。test-init-g5 は通過(警告のみ)
- lint:impl・lint:refs: 通過

## 指示書と違えた点
- 行番号が実在と違った(README 494-500 は 516-520、IMPL-0983 は 521 でなく 556)。内容で位置を特定した。README の既存の段落(機械が確かめるのは検知条件ごとの記入の有無だけ)と一文が一部重なる(指示書どおり足した)
- 試験で表(`renderAutonomyTable`)は配列を返すため join して検査した。ng の check で「reworkRate を名指さない」は、REWORK_UNCOUNTED が basis.detection.reworkRate を含むため、「手戻り率 reworkRate」の名指しで判定した

## impl:issues --issue 339
0件にならない。issue=339 を持つ別のマークが2つ残る: IMPL-0026(human-ai-boundary.md:526)・IMPL-0235(同:527)。いずれも state=undelivered・plan=scheduled。指示書の範囲外のため触っていない。閉じる前に議長が付け替えるか裁定する
