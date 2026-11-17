# #337 準拠テンプレート項目1〜5 実装の記録(束 B12)

日付: 2026-11-17。担当: 実装。指示書: `b12-03-ruling-proposal.md`(議長の裁定が優先)。

## コミット

- template `b99335c`(項目1・2)、bundle `template-b12-337-01`
- template `258cf41`(項目3〜5)、bundle `template-b12-337-02`
- 本体: gate-criteria.md のマーク・本文、台帳、template の参照(議長がコミット前の確認のうえ、まとめてコミット)

## 変えたもの

- 項目1: 4つの企画書様式に「カバレッジの基準値(G-5 基準3)」の行を足し、安定性指標の行名の括弧を改めた。`coverage-check.mjs` に `BRIEF_BASELINE_ROW`・`briefCoverageBaseline`。`check-g1.mjs` の必須の行に足した(G-1 の前は行と記入が必須、通過済みで行なしは warn も gaps も出さず飛ばす)。`verify-gate-contract.mjs` に比較(行なし・未記入は notes、読めない・不一致は problems。「基準値に含めません」を出す)
- 項目2: `coverage-check.mjs` の `?? 80` を失敗に改めた(理由を出力)。契約検査も problems。`adapter.mjs` は値を変えず注のみ
- 項目3: `docs/calibration-register.md` に1文。JSON・検査は変えない
- 項目4: `check-pr.mjs` の文言。`aggregate-evidence.mjs` の宣言の表に、`.claude/guard.json` の上限が未設定・欠落・不正のとき1行を出す(gaps に入れない)。IMPL-1001 は undelivered のまま、note に議長の裁定を開示
- 項目5: 本文 gate-criteria の無条件の文を改め、未達の表の代償措置に `compensationNote` を添えた。IMPL-0346 の note に追記。IMPL-0994 を delivered・machine へ、IMPL-0262 の note に1文

## 試験

- `test-coverage-scope`(75)・`test-brief-thresholds`(47)・`test-init-g5`(164)・`test-tailoring-declaration`(16)・`test-check-pr`(218)・`test-roster-rules`(186)・`test-recalibration`(15)が通過
- 変異: `verify-gate-contract.mjs` の比較を外すと、test-init-g5 の「食い違えば落ちる」「企画書 90 なら落ち、基準値に含めませんを出す」が両方の構成で FAIL になることを確認し、戻した

## 指示書と違えた点

- 項目1・2を同じコミットにした(同じファイルを触るため)
- test-init-g5 の構成を書き換える場面は、変化点の連鎖の要約値の検査に当たるため `sealChangeLog` で要約値を書き直す
- 項目4の宣言の表は、集約が読む構成と同じく作業ツリーの `.claude/guard.json` を読む(範囲の終点の版を別に読む仕組みが集約に無い)。要注意: 範囲の終点以外の版は読まない
- 項目5の IMPL-0346 は `test=` に複数を書けないため、note に開示の試験の所在を書いた
- 外へ渡す形の未達の表は集約に別の経路が無く、同じ表で足りた
