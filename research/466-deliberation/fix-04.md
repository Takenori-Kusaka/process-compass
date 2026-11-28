# #466 まとまり 2: 独立の突合 2 巡目(verify-04.md)の所見の直し

- 日付: 2026-11-28。裁定は `ruling.md` §18 に従った。3 巡目は開かない。push していない

## 1. 所見ごとの直し

| 所見 | 直した所 | 足した試験 |
| --- | --- | --- |
| V4-1 | template `check-pr.mjs` の `workflowFires`。新設の `eventTypesOf` で、`pull_request`・`pull_request_target` の動く場面の指定を、ブロック・リスト・1 行・波括弧の書き方から読む。PR の検査にするのは、指定を読めて閉じた時を含まないときと、指定が無いときだけ。閉じた時を含む・指定があるのに読めないときは起動する側 | 検出する 6 件(ブロック・複数の場面・リスト・target・1 行・リストの中の波括弧・値の無い指定・push や手動との組)、検出しない 3 件(閉じた時を含まない指定・指定なし・組) |
| V4-2 | `deployOnPushFindings` の `hasEnvironment`。`delegation.yml` の `delegated-merge` を数えないのは、環境の指定の行が 1 つだけで、ほかのワークフローから呼ばれていない(ローカル・版つきの参照・1 行の書き方)ときに限る。残る限界を集約の限界の行(`deferredReviewLines`)・GC の行・ADR-0275 決定7・IMPL-1071 の note・EV-0391 へ書いた | 2 つ目の環境で検出・ほかが呼ぶと検出・呼ばれず 1 行なら検出しない・準拠テンプレートの実物の workflows で 0 件 |
| V4-3 | `analyzePr`: 既定ブランチのコミットを読めないとき `cannot(...)` で範囲の中へ倒す。IMPL-1069 の note へ追記 | 実際の失敗を作れないため、組み立ての書き方の確認 1 件のみ(動作の試験ではない) |
| V4-4 | 集約: この形の PR で、提出の時刻を読めない承認を候補から外す。IMPL-1070 の note へ追記 | 集約の場面 1 件(時刻の無い承認だけの PR は欠落に数える。Linux のみ) |
| V4-5 | `reusableCallsOf`: 1 行の書き方のジョブの `uses:` も読む | 検出 2 件・ステップの 1 行の uses は数えない 1 件 |
| V4-6 | 集約 `deferredReviewOf`: 親の版の追跡ファイル・変更の一覧を読めないときは、範囲の内(`unevaluated`)に識別し、照らせなかった旨を出す。IMPL-1070 の note へ追記 | なし(下の 3 節) |

## 2. 流した試験(いずれも通過)

| 環境 | 結果 |
| --- | --- |
| Windows(node 26。名義なし) | test-deferred-review 139(集約の場面は読み飛ばし)・test-check-pr 338・test-control-approval 74・test-roster-rules 237・test-aggregate-records 226・test-assurance-period 31・test-record-independence 11・test-check-delegation 83・test-direct-commit-rules 11・test-tailoring-declaration 16・test-material-attribution 61 |
| WSL(node 26.13.1。名義なし `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`。LF の写し) | test-deferred-review 164(集約の場面を含む)・test-check-pr 338・test-control-approval 74・test-roster-rules 237・test-aggregate-records 226・test-assurance-period 37・test-record-independence 13・test-check-delegation 83・test-direct-commit-rules 11・test-tailoring-declaration 39・test-material-attribution 61 |
| WSL(名義あり) | 流していない(名義なしの全通過で代えた) |
| 本体 | textlint(gate-criteria・ADR-0275)・impl:write・evidence:write・lint:refs・evidence・impl・scope・tone・citations・test:fields 通過。`npm run check` の全量は流していない |

WSL の写しは削除済み。

## 3. 直せなかった所・残り

- V4-3 の動作の試験: 既定ブランチのコミットの一覧の読み取りを失敗させる場面を作れないため、組み立ての確認だけ
- V4-6 の試験: 追跡ファイル・変更の一覧の読み取りを失敗させる場面を作れないため、試験なし(コードの読みと既存の集約の場面の通過のみ)
- 入力が整った場面の挙動は、既存の 164 件が変わらず通ることで確かめた

## 4. コミット

- template: `ed6da36`(`d4-466`)。bundle: `E:/Github/process-compass/tmp/466-recover/bundles/466-tpl-fix4-1.bundle`(`7642faa..d4-466`)
- 本体: `1ac2e682`(`gate-criteria.md`・ADR-0275・台帳 2 本)
