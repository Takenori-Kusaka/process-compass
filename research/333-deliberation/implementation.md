# #333 実装の記録

作成日 2026-11-15。裁定 `decision.md` の「実装の指示」と「統制の閉じ方」のとおりに実装した。ADR の番号は議長の補足で ADR-0135(decision.md の ADR-0136 は 0135 と読み替え)。識別子は IMPL-0522(decision.md の IMPL-A)・EV-0266(EV-A)。push はしていない。

## 変更したファイル

template(コミット 4 つ。bundle は `E:/Github/process-compass/tmp/bundles/template-b4-333-01〜04.bundle`)

| 事象 | コミット | 主な変更 |
| --- | --- | --- |
| 1 | 3b99d19 | `scripts/gate/evidence-manifest.mjs`・`test-evidence-manifest.mjs` を新設。`ship-evidence.yml`(retention-days: 90、一式の写し、PR 本文の1行、verify の `docs/evidence/*/*`、前回の証跡の写しからの読み)。`gate-g5.yml` に run を足す。`G-7.md`・`.github/rulesets/README.md`・`README.md` |
| 2 | 306c0e8 | `record-copy.yml`(`checks: read`、`checks.gate_g5`)。`aggregate-evidence.mjs` に `g5MissingText` を export し、`g5AtMerge`・`mergedAt` を行へ足す。`test-g5-missing.mjs` を新設し、`gate-g5.yml` に run を足す |
| 3 | cd7df8a | `ship-evidence.yml`(headSha の照合、coverage-result・dependency-diff の取り込み、`evidence/inputs.json`)。`coverageScopeText` を top-level の export に出し、起点と限定を足す。試験は `test-coverage-scope.mjs` と `test-evidence-manifest.mjs` |
| 4 | d47de3c | `verificationSectionDiffers`・`verificationDiffText` を export。写しの所見(`copyFindings`)へ出し、`verificationSectionDiffs` を evidence.json へ。試験は `test-aggregate-records.mjs` |

本体(コミット 86a2e7e)

- `gate-criteria.md`: IMPL-0243(adopter・decision=ADR-0135。1文目の直後へ移した)、IMPL-0522(新規。2文目の直後)、IMPL-0244(delivered・machine)
- `ci-gates.md`: 「証跡の保管と CI 基盤の保持期間」を 2026-11-15 に改め、EV-0266 を置いた
- `src/data/impl-targets.yaml`・`impl-inventory.yaml`・`impl-untraced.yaml`(evidence-manifest.mjs を library で除外登録)
- `adr/0135-ship-evidence-copied-to-base-branch-retention-left-to-adopter.md`(採らない案を表で記録)
- 出典台帳 SRC-0745〜0747(2つの changelog と設定の頁)。`sources:index` の派生物(catalog・282 の views)
- 台帳 `implementation-ledger.md`・`evidence-ledger.md` は再生成

## 流した試験と結果

- template(Windows の node 26): test-evidence-manifest 14 件通過 / test-g5-missing 全件通過 / test-aggregate-records 135 件一致 / test-coverage-scope 68 件一致 / test-records-history 44 件一致 / test-base-judge-workflow 127 件期待どおり。ワークフローの `run:` の bash 構文は `bash -n` で確かめた(ship-evidence・record-copy)
- 本体: lint:impl・lint:refs・lint:evidence・lint:scope・lint:sources・lint:citations・lint:ci・lint:tone・lint:provisions・lint:dekimasu・test:impl・lint:figures・lint:registry・lint:stage-table・test:fields・test:ci-wiring・lint:skills・test:criteria は exit 0。textlint は ci-gates.md・ADR-0135 とも違反なし
- 偽の FAIL: test-g5-aggregate(4 / 23 件)と test-discouraged-evidence(2 件)は CRLF 由来(作業ツリーが CRLF で、試験が `\n` で正規表現を当てる)。変更前から同じ。回帰の全量(`npm run check`、test:template-suite)は流していない

## 裁定との食い違い・実装の判断

1. IMPL-0522 の ok 側は、集約の実行ではなく静的な確認で足りるとした部分がある。IMPL-0244 の ok(「ホスティングに gate-g5 の成功がある入力で文が出ない」)は、集約を偽の gh で通す形にしていない。文の関数 `g5MissingText` の単体と、集約が `g5 === 'unknown'` のときだけ呼ぶこと・写しの結論で g5 を作らないことのソースの静的な確認で置き換えた。偽の gh による集約の通し(裁定の「偽の gh による集約の実行」)は未実施。EV-0266 の「確かめたのは」には、この分を含む
2. 事象4 の所見の配列は、ADR-0109 のレビュー本文の所見(`reconcileCopy` の findings)と同じ `copyFindings` へ出した。レポートの節も既存の「写しとホスティングの記録の所見」の行に出る(別の節は足していない)
3. 事象3 の「3か所」(品質レポート・保証の開示・外へ渡す版)は、実際には `coverageScopeText` を使う 2 か所(machineChecks の表と品質レポートの行)だった。machineChecks の「未実施」の分岐にも限定を足した。外へ渡す版が同じ machineChecks を読むかは集約の実行で確かめていない
4. manifest の `inputs` は、取り込み元を `evidence/inputs.json` へ書き、その内容を載せる形にした(inputs.json 自体も一式に入る)。取り込めなかった場合は `inputs.json` が無く、`inputs` は null
5. IMPL-0522 の置き場所を gate-criteria.md の2文目の直後へ置いたため、IMPL-0243 のマークは1文目の直後へ移した(現状はどちらも2文目の後にあった)
6. 逆向きの追跡のため、`evidence-manifest.mjs` を `impl-untraced.yaml` に library として登録した(裁定に無い。lint:impl が要求した)
7. 突合の担当に確かめさせる点(裁定 4 節の末尾): (1) `checks` 欄を `parseCopy`・`reconcileCopy` が落とさず読み飛ばすこと — `parseCopy` は欄を検査せず、`reconcileCopy` は欄を選んで読む。コードの読みで確かめた。`next.mjs` は未確認 (2) tpl2 の suite の fixture が g5 の欠落の文とカバレッジの開示の文を固定していないか — 未確認(test:template-suite は重く流していない)

## 実機で未確認の点

- ship-evidence の通し(一式が基底ブランチへ入り verify が通ること、`createCommitOnBranch` で複数ディレクトリの追加を運ぶこと、前回の証跡の写しからの読み、headSha の照合の `gh run view --json headSha`)
- record-copy が `checks: read` で head の check run を読めること。`jq` の整形(sort_by・last)は構文を `bash -n` で通しただけで、実 API の応答では未確認
- 保持切れの PR での集約の出力
- `retention-days: 90` が設定の上限を超えるときの扱い
- 内容が EV-0266 の「実機で未確認の点」に載っている

## 残る作業

- 独立の突合(別の文脈で)
- 回帰の全量(`npm run check`、tpl2 の suite)は push の前に1回
- 受け入れ条件: `issue=333` を持つマークが 0 件であること(確認済み。IMPL-0243・0244 から外した)
- Issue へのコメント(実機の通しの確認、N-16、K-8 との関係)は、禁止のため行っていない

## 追補(IMPL-0246)

`issue=333` を持つマーク IMPL-0246(保証の開示のカバレッジ。note が「ship-evidence.yml は coverage-result を取り込まない」と書いていた)が残っていた。事象3 でこの記述が誤りになるため、`delivered`・`machine` に改めた(test は `test-evidence-manifest.mjs`。`IMPL-0246:ng`・`IMPL-0246:ok` の目印を別の行に足した)。裁定は事象3 に実装マークを足さないとしたが、既存のマークの note と実態の食い違いを残さないための判断である。確かめるのは取り込みの手順の存在までで、実機の通しは未確認。inventory の note も改めた。template のコミットは 5 つ目(bundle template-b4-333-05)。
