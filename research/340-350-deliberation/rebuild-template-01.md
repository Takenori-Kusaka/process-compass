# template の作り直し 01(#354 低-1・#350・#349)

実施日: 2026-11-15。template(submodule)の事故で失われたコミットを、`implementation-350-349.md` と `decision.md` から作り直した。審議はやり直していない。#348 は含まない(次の担当)。

## template のコミット(ブランチ rebuild-b1、origin/main = 85ae3d2 の上。push していない)

| 順 | ハッシュ | 内容 | bundle |
| --- | --- | --- | --- |
| 1 | 7029809 | #354 低-1: `generate-profile.mjs`・`verify-gate-contract.mjs` の逸脱の注釈を ADR-0083(第1章 1.10.2 の閉じた列挙、いまは D-1 の G-7 の兼務)に揃える。コメントのみ | `E:/Github/process-compass/tmp/bundles/template-b1r-01.bundle` |
| 2 | e505091 | #350: 宣言行の無い CHANGES_REQUESTED の件数表示 | `...template-b1r-02.bundle` |
| 3 | 4d34e09 | #349: 観測の窓を構成の欄にする | `...template-b1r-03.bundle` |

bundle は `origin/main..HEAD` の累積(03 が3コミットすべてを含む)。

## 変えたファイル

- #354: `scripts/init/generate-profile.mjs`、`scripts/gate/verify-gate-contract.mjs`
- #350: `scripts/gate/autonomy.mjs`(`undeclaredChangeRequests`・`undeclaredText`、`readRejectionRecords` の返り値 `undeclared`、`autonomyState` の窓ごとの件数 `rejection.undeclared`、`rejectionText` と 0% の停止の理由への表示、`readAutonomyRecords` の `undeclared`)、`scripts/gate/test-check-delegation.mjs`
- #349:
  - `scripts/gate/config.mjs`: `OBSERVATION_WINDOW_DEFAULT`、`observationWindowAt`、`observationWindowInfo`、`windowLengthText`、`observationWindowProblems`(`configIntegrityProblems` に接続)
  - `scripts/gate/autonomy.mjs`: `windowOf(m, months)`、評価の日ごとに `observationWindowAt(config, m)`、現在の状態は `observationWindowAt(config, asOf)`、履歴の読み出しの起点を記録した最長の窓から導く、`rejectionText` と /pit の注記に窓の長さ(既定より長いときは決定者と日付)
  - `scripts/init/generate-profile.mjs`: settings の `observationWindow` の入力検査(整数・下限2・`months` 以外の欄を拒否・値を変えるときは向きを問わず記名と理由・AI 名義を拒否)、履歴への追記、再生成での保持、差分の向き(長くする = 緩める)、PROCESS-PROFILE の窓の文(月数は構成から)
  - `.claude/skills/process-change/kinds/settings.md`・`reference/input.md`
  - 試験: `test-check-delegation.mjs`、`test-loosening-decider.mjs`
- 構成の形: `observationWindow = { months, history: [{ months, recordedAt, decidedBy, reason }] }`。既定 2、下限 2、最小標本数の欄なし。効力日は「記録した日 < 評価の日」で、遡って当てない。既定のままなら欄を持たない。

## 試験の結果(関係するものだけ。全量の回帰・`npm run check` は流していない)

- `node template/scripts/gate/test-check-delegation.mjs`: NG 0。既存の68場面は期待を変えずに通る。IMPL-0285:ng/ok と IMPL-0516:ng/ok の目印あり
- `node template/scripts/gate/test-loosening-decider.mjs`: NG 0(窓の入口の試験: 窓1・2.5・minSample の拒否、記名・理由なしと AI 名義の拒否、4への変更と履歴、ほかの設定での保持、短くする向きの記名要求と受理)
- `node template/scripts/gate/verify-gate-contract.mjs`: 構成が未設定のため通知のみ(構成の妥当性は判定しない)。`node --check` は変更した .mjs すべてで通過
- 本体 `node scripts/check-template-drift.mjs`・`check-template-fields.mjs`: 一致
- 本体 `node scripts/check-impl.mjs`: IMPL-0285・0287・0288・0516 は問題なし。残る指摘は2種で、いずれも本件の範囲外(下記)

## 記録と違えた点

1. 前回の試験の件数(#350 の5件、#349 の12件前後)とは試験の分け方が異なる(#350 は5検査、#349 は delegation 側10検査 + decider 側11検査)。期待の内容は記録のとおり
2. 記録の「`windowOf(m, months)`」は引数を省くと既定(2)になる形にした(`WINDOW_MONTHS` は `generate-profile.mjs` が import しているため、`OBSERVATION_WINDOW_DEFAULT` の別名として残した)
3. `undeclared` を渡さない records(旧い fixture)は「読めない」と表示する(0 件と出さない)。既存の期待は固定の文字列を比べていないため影響しない
4. 記録にない追加: 窓の長さは `rejection.windowText` に載せ、`rejectionText` が `autonomyNoteLines` と保証の開示(aggregate-evidence.mjs)の両方で使うため、後者のコードは変えていない

## 本体の文との食い違い

- IMPL-0285・0287・0288・0516 の note と 5.4.6 の文は、作り直した template と食い違わない(件数表示・「読めない」・窓の既定2・下限2・記名と理由・遡らない・履歴の起点・常時表示と決定者の併記)
- 残る check-impl の指摘(本件の範囲外):
  - `human-ai-boundary.md:285` IMPL-0517(#348 の手戻り率)の IMPL-0517:ng/ok の目印が試験に無い。次の担当(#348)が足す
  - `implementation-ledger.md` が最新でない。`npm run impl:write` が要る(本体側の作業。この記録では触らない)
- IMPL-0516 の note は適用する比率に「手戻り率(IMPL-0517)」を含む。手戻り率の実装は #348 の担当で、`observationWindowAt(config, m)` と `MIN_SAMPLE` を使うこと

## 残った点

- #348 の template 側の作り直し(次の担当)。本ブランチ `rebuild-b1` の上に積む
- 本体の submodule 参照(`template`)は進めていない
- 本体の `node_modules` は存在しなかったため、検査のあいだだけ共有の node_modules へジャンクションを張り、終了後に外した
