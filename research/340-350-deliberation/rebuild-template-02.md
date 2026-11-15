# template の作り直し 02(#348 手戻り率の算出)

実施日: 2026-11-15。`implementation-348-340.md` の「#348 手戻り率の算出」の節と `decision.md` §4 から、事故で失われた template 側の変更を作り直した。審議はやり直していない。本体の文書は触っていない(台帳の再生成のみ)。

## template のコミット(ブランチ rebuild-b1。#349 の 49d49e7 の上。push していない)

| 順 | ハッシュ | 内容 | bundle |
| --- | --- | --- | --- |
| 4 | ab891be | 手戻り率の算出・基準値の欄・停止・表示・入口の検査・試験 | `E:/Github/process-compass/tmp/bundles/template-b1r-05.bundle` |
| 5 | 52c159e | 手引き(process-change)・実装計画の様式・D-0 の様式・README の文言 | `...template-b1r-06.bundle` |

bundle は `origin/main..rebuild-b1` の累積(06 が 01〜05 のすべてを含む)。

## 変えたファイル

- `scripts/gate/config.mjs`: `reworkBaselineAt`・`reworkBaselineInfo`・`reworkBaselineProblems`(`configIntegrityProblems` に接続)。構成の形 `reworkBaseline = { percent: 0〜100 | null, history: [{ percent, recordedAt, decidedBy, reason }] }`。既定値なし。効力日は観測の窓と同じ(記録した日 < 評価の日)
- `scripts/gate/autonomy.mjs`: `specTrailersOf`・`planReworkTasks`・`readReworkRecords`・`reworkText`、種別ごとの `rework`(母数・分子・内訳 trailer/plan/both・基準値・状態)。`REWORK_UNDELIVERED` → `REWORK_UNCOUNTED`(`state.reworkUncounted`)。評価の日 m は prevDay(m) 以前の記録だけで数える。母数 30 以上かつ超過で downgrade の停止。`check-pr.mjs` の `lastParagraph` を import
- `scripts/gate/aggregate-evidence.mjs`: 保証の開示の項目3 を種別ごとの `reworkText` にした
- `scripts/init/generate-profile.mjs`: settings の `reworkBaseline`(0〜100 または null・percent 以外の欄を拒否・変えるときは向きを問わず記名と理由・AI 名義を拒否)、履歴への追記と再生成での保持、差分の向き(上げる・外す = 緩める。未設定を最も緩い値として扱う)、D-0 の表の手戻り率の欄と本文の文
- `.claude/skills/process-change/kinds/settings.md`・`reference/input.md`、`templates/07-implementation-plan.md`・`templates/00-d0-governance.md`、`README.md`
- 試験: `test-check-delegation.mjs`(IMPL-0517:ng / IMPL-0517:ok の目印あり。実 git の試験を含む)、`test-loosening-decider.mjs`(IMPL-0517:ng / ok の目印あり)

## 試験の結果(関係するものだけ。全量の回帰・`npm run check` は流していない)

- `node template/scripts/gate/test-check-delegation.mjs`: NG 0(68 場面と付随の確認。手戻り率の追加は約 30 件)
- `node template/scripts/gate/test-loosening-decider.mjs`: NG 0(基準値の入口 11 件を追加)
- `test-aggregate-records.mjs`・`test-name-confirmation-timing.mjs`・`test-roster-rules.mjs`・`test-init-g5.mjs`: NG 0
- 本体 `scripts/check-impl.mjs`: exit 0(`npm run impl:write` で台帳を再生成してから)。`check-template-drift.mjs`・`check-template-fields.mjs`: 一致
- `node --check`: 変更した .mjs すべて通過

## 記録と違えた点

1. 既存の試験の期待の書き換えは申し送り3 の2か所に、D-0 の表の検査(「準拠テンプレートの外」を確かめていた正規表現。D-0 の表の手戻り率の欄の文言そのもの)を足した3か所。いずれも IMPL-0291 の降りた部分の文言で、窓 2 などの fixture が固定する決定は変えていない
2. 基準値を「外す」入力は `{ percent: null }` とした(記録には「外す = 緩める」とのみある)。履歴に `percent: null` の行を足し、効力日は同じ
3. 母数は「窓の中に種別の範囲の取り込みを持つタスク」。トレーラの2回以上の数えは、種別の範囲に依らず第1親の履歴の全体(評価の日の前日まで)で数える(記録の申し送り6 のとおり)
4. 記録にない追加: `README.md` の「手戻り率は集計しない」「窓と最小標本数は定数であり構成に持たない」(後者は #349 以来の食い違い)を改めた。表示と実態の食い違いを残さないため

## 本体の文との食い違い

- なし。5.4.6 の IMPL-0517・0291・0518・0287・0288、`gate-criteria.md` の IMPL-0516・0268、`template-repository.md`(610・623 行)と、作り直した template の挙動(月初の評価の日、遡らない、判定不能・未設定は発火しない、読めない、数えていない残りを常に表示)は一致する
- `reworkText` は、超過・以内・判定不能・基準値未設定・読めない・記録なしのどの状態でも、数えていない残り(不採用の後の再作成)を省かない(試験で状態ごとに確かめた)

## 残った点

- 申し送り7(トレーラ側で再作成があるのに計画表の履歴に「やり直し」が無いタスクの件数の任意表示)は実装していない
- `next.mjs` の `doneTasks` は本文の全行を読む別の実装のまま(`check-pr.mjs` の `lastParagraph` に揃えていない)
- 独立の突合(§7.4)は未実施
- 本体の `template` の参照は進めていない。本体の `node_modules` は共有のものへのジャンクションを張り、終了後に外した
