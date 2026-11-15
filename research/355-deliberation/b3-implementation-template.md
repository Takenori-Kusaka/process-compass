# #355 束3 template 側の実装の記録

- ブランチ: template の `b6-355-b3`。コミット 1 個: `5c317a5`(push していない)
- bundle: `E:/Github/process-compass/tmp/bundles/template-b6-355-b3-01.bundle`
- 実行は WSL の node v26.13.1

## 変えたファイル(すべて template/ の中)

- `scripts/gate/spec-sections.mjs`: `OTHER_HEADING` を前方一致にして export。`normalizeSpecText`・`compareSpecSections`(節ごとに match / mismatch / unreadable、fullMatch)を追加。`changedSpecSections`(表示用)は変えていない
- `scripts/gate/spec-recheck.mjs`(新設・純関数): `specRecheck`・`targetVersionOfForm`・`specRecheckGapText`・`specRecheckSummary`
- `scripts/gate/aggregate-evidence.mjs`: 効いている G-4 の通過(様式は既存の `supersededByLater` 条件、写しは `g4ByReview` と同じ条件)を集め、`git show <版>:specs/F-NNN/spec.md` で本文を読む。不一致は gaps へ。evidence.json に `specRecheck`(件数・未確認の理由・機能ごとの項目)。基準5 の要約文に3値の件数。`declarationDrift` を export し、集約本体はそれを呼ぶ。レポート見出しに「機械は起票しません。起票されたかは出荷判定者が確かめます」。直接コミットに `specFilesTouched` を追加
- `templates/04-gate-record.md` の例を `F-012 / 1a2b3c4` に。`.claude/skills/gate/gates/G-4.md` に集約の比べ方を1行
- `.github/workflows/gate-g5.yml`: 新設2試験を test-aggregate-records の直後に結線(`templateTestWired` の形)
- 試験: `test-spec-recheck.mjs`(50)、`test-aggregate-drift.mjs`(19)を新設。`test-check-pr.mjs` に前方一致の2場面と1確認を足した

## 試験の結果(node 26)

- test-spec-recheck: 50 件一致(4.1 の6 の全場面。実物の git の場面を含む)
- test-aggregate-drift: 19 件一致
- test-check-pr: 214 場面と付随の確認が一致
- test-aggregate-records 135、test-records 93、test-material-attribution 58、test-control-approval 48、test-direct-commit-rules 11、test-ship-evidence-steps・test-evidence-manifest・test-g5-missing: 通過

## 指示書と違えた点とその理由

- 既存の期待値の反転 1 件: `test-check-pr.mjs` の「見出しの語は完全一致(「前提条件」は数えない)」。1章7の前方一致の決定と逆の期待だったため、決定に合わせて「前方一致で数える」へ改めた。緩めたのではなく、裁定が置き換えた規定の固定である
- 「いずれか」の通過の収集は `g4Approved` の関数を再利用せず、同じ条件式を `specRecheckItems` に複写した(通過の記録そのものが要るため)。条件の二重定義になるので、独立の突合で見てほしい
- 範囲の先端 `to` は `--to`(既定は最新タグ)。期間指定(`--period`)では `HEAD`
- 4.1 の3「外部向けは件数だけ」: 基準5 の要約文に件数のみを入れた。外部向けの evidence.json の整形は確かめていない(items に機能 ID と記録の所在が入る)

## 実物の git の場面

一時リポジトリ2つ(作成側と、squash の1コミットだけを持つ集約側)を試験の中で作った。squash の後、集約側で判定の版 J のオブジェクトは取得できなかった(`git show J:...` が失敗 = null)。結果は未確認、不一致 0 件(欠落にならない)。対の適合(版が取得できて同一なら一致)と違反(取得できて先端と違えば不一致)も固定した。これは `git show` の挙動の確認で、ship-evidence.yml の checkout の深さ・実際の PR の履歴は確かめていない。

## 確かめていないこと

- 集約の本体(isMain 内)を、実リポジトリで通しで流していない。`node --check` と、関連する既存試験(上記)のみ
- `test-adoption.mjs` は一時リポジトリの `git merge` が add/add 競合で落ちる(process.config.json)。本変更の前から落ちるかは基線を取っていない。`test-g5-aggregate.mjs` は 4 件 NG(指示のとおり判定に使わない)
- `judgementsFromCopy` の `specs` の付け方、様式の「対象」の機械の併記の実際の形(解析は括弧・「。」以降を読まない前提)
- README に変えた挙動の記述は見当たらず、直していない(grep: 「宣言と実態のずれ」は個人情報の注意書きのみ)
- npm の lint / textlint は template では流していない
