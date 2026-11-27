# #466 まとまり 2: 独立の突合 1 巡目(verify-03.md)の所見の直し

- 日付: 2026-11-28。裁定は `ruling.md` §16 に従った。V3-8 は変えていない
- 道具・試験・コミットは下記。push していない

## 1. 所見ごとの直し

| 所見 | 直した所 | 試験(足した・変えた) |
| --- | --- | --- |
| V3-1 | `check-pr.mjs` の `preReadRangeOf`: `process.config.json` に触れる変更は鍵を問わず統制の設定の行へ。集約の `deferredReviewOf` は同じ関数を呼ぶので同じ。本文 GC の表の行 4 と ADR-0275 の表へ追記 | `test-deferred-review.mjs`: 単体(構成のファイル・同名の別パス)と、PR の検査の 5 場面(範囲の宣言を狭める・判断記録の規則を空にする・名簿へ人を足す・回答を書き換える・鍵を足す)。いずれも承認なしで落ち、統制の設定の行に当たる |
| V3-2 | `deployOnPushFindings`: 起動の契機を読み直し(1 行・波括弧・リスト・ブロックの書き方)、手動の起動だけ、または pull_request 系だけを除いて起動する側へ。ジョブの `uses:` は、呼ばれる側がリポジトリの中にあり、読め、環境が無く、さらに別の workflow を呼ばないときだけ除く。GC「使えない構成」・ADR-0275 決定7・IMPL-1071 の note・EV-0391・附属書H 側の開示(assurance-case の行)・G-6.md・README を合わせた。集約の限界の行へ「配備の環境を指定せずに秘密情報で配備する workflow」と「workflows の外の配備」を書いた | 単体 19 場面(workflow_run・release・schedule・波括弧・リスト・手動と push の組・注釈つき on・pull_request 系・uses の各形・ステップの uses・拾えない形)と、PR の検査の 5 場面(workflow_run・release・schedule・読めない再利用の呼び出しで落ち、手動だけは落ちない) |
| V3-3 | G-6.md と `04-gate-record.md` から範囲の書き方を外し、変更ごとの番号を並べる書き方へ。GC の「読み方」行・ADR-0275 決定4・IMPL-1074・IMPL-1076 の note | 文書のみ(機械の検査の対象ではない) |
| V3-4 | G-6.md・様式・GC・ADR-0275・IMPL-1076 の「承認レビューでもよい」を外した。**集約は数えていた**(下の 3 節)。閉じた | `test-deferred-review.mjs` の集約の場面(Linux のみ)へ対照を 2 場面 |
| V3-5 | `analyzePr`: テストのパターンが無い・追跡ファイル(既定ブランチ・変更後)を読めない・テストの差分を読めない・トレーラの指す plan.md を読めない、を `unreadable` として範囲の行 `unevaluated`(範囲の中)へ倒し、`notEvaluated` に出す | PR の検査 4 場面(パターン無し・パターン無しでテストを消す・plan.md 無し・読めたときは出ない)と単体 2 |
| V3-6 | 集約の投影へ、範囲の外の変更のうち仕様のトレーラ(`Spec: F-NNN`)が無い件数を 1 行(`deferredReviewLines`、`hasSpecTrailer`) | 集約の場面 |
| V3-7 | `approvalByPreRead`: 事業ステージは `growth`・`stable` だけ | 単体(foo・S1・S2・Growth・空・null・0 は偽) |
| V3-9 | 積み重なりの前後を `Date.parse` で比べた | 集約の場面(`+09:00` と `Z` が混じる形。文字列比較では 0 件になる) |
| V3-10 | 範囲の行 6 の見出しを「削除・名前の変更・アサーションの行の削除」へ。スキップへの書き換えとテストの設定による除外を拾わないことを、集計の限界の行・GC の表の行 6・IMPL-1070 の note に書いた | 見出しの単体と、限界の行の文言の集約の場面 |

## 2. 議長へ上げる点(裁定の範囲を超えた判断)

1. **委任のマージのジョブの環境(`delegated-merge`)を、本番への反映の環境に数えない**。V3-2 を裁定どおりに直すと、準拠テンプレート自身の `delegation.yml`(`workflow_run` で動き、マージのトークンを置く環境 `delegated-merge` を持つ)が常に「起動する側」に当たり、S2 の形が準拠テンプレートでは常に使えなくなった(WSL の集約の場面が 4 件の PR すべて範囲の中になって落ちて分かった)。この環境名だけを数えない。値を読めない書き方(式・オブジェクト)と他の名前は数える。IMPL-1071 の note・EV-0391 の対象に書き、試験を足した。裁定の追認か、別の直し方の指示を要する
2. **集約の V3-4 の外し方は、出荷の前の確認の形(変更の親の版の構成が `approvalByPreRead`)の全 PR に当てた**(範囲の外に限らない)。範囲の中の PR は取り込む前の承認が要るため、取り込んだ後の承認を数えないことが整合する。取り込みの時刻を読めないときは外さない(読めないとき通る側へ倒れる点は残る)。まとまり 1 の挙動・S1・委任・通常の承認の数え方は変えていない
3. **手動の起動と pull_request の組(`workflow_dispatch` + `pull_request`)は、どちらか一方だけではないため起動する側へ倒した**(字義どおり。過剰に止める側)

## 3. V3-4 で集約が数えたか

- **数えた**。取り込んだ後(マージの時刻より後)に提出された承認レビューだけを持つ範囲の外の PR が、`independent.counted: true` になり、欠落に数えられなかった(WSL の集約の場面。対照の取り込む前の承認は数える)
- 閉じ方: `aggregate-evidence.mjs` で、変更の親の版の構成が `approvalByPreRead` の PR について、取り込みの時刻(REST の merged_at、無ければ写しの merged_at、無ければマージのコミットの日時)より後に提出された承認レビューを、`independentConfirmation` と承認者の集合の入力から外す。外した件数は `independent.lateApprovalsExcluded` に残す。閉じた後、後付けの承認だけの PR は欠落に数えられ、取り込む前の承認は数えられた

## 4. 流した試験(いずれも通過)

| 環境 | 試験 | 結果 |
| --- | --- | --- |
| Windows(node 26) | test-deferred-review | 120 件(集約の場面は読み飛ばし) |
| 同 | test-check-pr 338 場面・test-control-approval 74・test-roster-rules 237・test-aggregate-records 226 | 通過 |
| 同 | test-assurance-period・test-record-independence・test-material-attribution・test-check-delegation・test-direct-commit-rules・test-tailoring-declaration | 通過(assurance-period 31・record-independence 11・material-attribution 61・check-delegation 83・direct-commit-rules 11・tailoring-declaration 16) |
| WSL(名義あり) | test-deferred-review 144(集約の場面を含む)・test-record-independence 13・test-tailoring-declaration 39・test-aggregate-records 226・test-assurance-period 37・test-check-pr 338・test-control-approval 74・test-roster-rules 237・test-material-attribution 61・test-check-delegation 83・test-direct-commit-rules 11 | 通過 |
| WSL(`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null`) | test-deferred-review 144・test-record-independence 13・test-tailoring-declaration 39・test-aggregate-records 226・test-assurance-period 37 | 通過 |
| 本体 | textlint(変えた 3 本)・lint:refs・lint:evidence・lint:impl・lint:scope・lint:tone・lint:citations・test:fields・evidence:write・impl:write・scope:write | 通過 |

WSL の写しは `~/fix3-tpl`(試験のあとで消す)。`npm run check` の全量は流していない。

## 5. 直せなかった所・残り

- なし(V3-1〜V3-10 を直した。V3-8 は裁定どおり変えない)
- 見ていない所: ホスティング上の実機(IMPL-1072 の範囲)。テストの差分・追跡ファイルを読めない場面は、実際の失敗を作れないため `preReadRangeOf` の入力の単体だけで確かめた(`analyzePr` の分岐は plan.md 無しとパターン無しで通した)
- 集約の `deferredReviewOf` は、入力の読めなさ(V3-5)を照らし直さない(§15-6 のとおり)

## 6. 2 巡目の突合が見る差分の範囲

- template: `3dae878..d4-466`(4 コミット。`0f63432` 範囲と検出と手引き、`0226961` README、`5eb11a5` 委任のマージの環境、`81e1713` 集約の取り込み後の承認と試験の名簿)。bundle: `E:/Github/process-compass/tmp/466-recover/bundles/466-tpl-fix3-4.bundle`(`7642faa..d4-466`)
  - 見る所: `check-pr.mjs`(`deployOnPushFindings` 周辺・`preReadRangeOf`・`analyzePr` の範囲の段)、`aggregate-evidence.mjs`(`deferredReviewOf` は変更なし、`formAtParent` の段・`deferredReview` の投影・`deferredReviewLines`・`hasSpecTrailer`)、`config.mjs`(`approvalByPreRead`)、`.claude/skills/gate/gates/G-6.md`・`templates/04-gate-record.md`・`README.md`、`test-deferred-review.mjs`
- 本体: `203fbf2a`(`gate-criteria.md`・ADR-0275・`assurance-case.md`・台帳 2 本の再生成)。`git diff bb3cde1d..203fbf2a -- src`
- 重点: (a) 起動の契機の読み(波括弧・リスト・注釈・引用符つきの `on`)の見逃し、(b) `delegated-merge` の除外が抜け道にならないか、(c) 集約の取り込み後の承認の除外が、通常の取り込む前の承認・S1・委任を変えていないか
