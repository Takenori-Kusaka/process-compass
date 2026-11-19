# 束 B26 後半の実装 担当B(単位 U3)の記録

差分の範囲: template は afa73bc..1ca7be2(bundle: template-b26b-04.bundle)、本体は 7b56bd01..(この記録を含むコミット)

## 変えたもの

- template `scripts/gate/aggregate-evidence.mjs`
  - 新設 `agentRunModelIdGaps`(純関数。行A・行B)・`MODEL_ID_LIMITS`・`modelIdGapLines`。`generation.modelIdGaps` に値を持ち、末尾の警告(`warn`)で行A・行B を別々の行に出し、品質レポートの生成の条件にも同じ行を出す。0 件なら出さない。件数と先頭 5 件。説明の文に限界を書く
  - `declarationDrift` のコメントを実態に合わせた(判定と既存の固定は変えない)
  - 項目8: 「作成側の検証の記載」の説明に「有無だけを見ます。中身は確かめません」を足した
  - 項目9 e: 保証の開示の項目4 の「集約 gate-g5 が合否に使う検査」の行に、過去の時点の定義は読まない旨と、期間中の gate-g5.yml の変更は項目1 を見る旨を足した
- template `scripts/gate/test-aggregate-drift.mjs`: 固定 2 件(`Claude Opus 4`、1文字の名 `a`)、行A・行B の純関数の試験 8 件、集約の命令行を通した試験(行A・行B の別々の警告の行、限界の文、欠落に数えない、Agent-Run の無い実行では出ない、品質レポートの行、項目8・9 e の文)。43 件通過
- 本体: human-ai-boundary.md(IMPL-0177 の note、IMPL-1033・1034 を 5.8.2 に追加)、roles-responsibilities.md(3.13.5 の行、IMPL-0023 の note、IMPL-0145 の issue=326 を 361 へ)、impl-inventory.yaml(5.8.2 の登録に 1033・1034)、台帳(impl:write)

## 新しいマーク

- IMPL-1033(evidence-aggregation・delivered・machine・test=test-aggregate-drift.mjs。試験名に IMPL-1033:ng / :ok)
- IMPL-1034(agent-run-record・undelivered・manual・plan=scheduled・issue=361・review=2027-05。5.8.2 のモデルの識別の自動の記録。降ろす手段の確認が要る旨)
- IMPL-0145 は undelivered のまま issue=361 へ。IMPL-0147 の note(過去の時点の定義は読まない)は残した

## 試験

- test-aggregate-drift 43 件、test-aggregate-records 222 件、test-aggregate-wiring 61 件通過。本体は lint:impl・lint:refs・lint:scope・textlint(2 ファイル)通過
- `npm run impl:issues -- --issue 326`: 0 件
- 壊して落ちる確認(戻した): 行A の判定 `if (!cos.length)` を `if (false)` にすると 4 件落ちる。入口の結線(`warn(l)` の行)を外すと通しの 3 件が落ちる

## 裁定と違えた点

- 試験の「人の共著者だけ」: 裁定は限界の固定として「通る」。人の共著者の名に数字が無ければ行B に数える(裁定の限界の文のとおり)ため、「名に数字がある人(Taro2)なら通る」を固定にし、Agent-Run なしの人の共著者も数えない固定を置いた
- 項目8 の説明は PR の表(PR が在る実行)にだけ出るため、試験はソースの文の存在で確かめた。項目9 e は外部向けの開示への出力で確かめた
- 項目9 e の文は項目4 の表の行(集約が合否に使う検査)に足した(「項目4 の説明文」に当たる場所が他に無い)
- 5.8.2 の undelivered の note に「確かめる者」を書いた(書式の既定の文)。#361 への寄せのコメントは外部の操作のため行っていない(指揮役が行う)

## コミット・bundle

- template: 75be9f5 と 1ca7be2(試験名の目印)。bundle: tmp/bundles/template-b26b-03.bundle・template-b26b-04.bundle
- 本体: 次のコミット(template の参照の更新を含む)
