# 束 B20 直しの段 2(F2 安全と実行の記録)の報告

- 日付: 2026-11-18。範囲: 裁定 4 節・5 節の R1-01・02・03・06・07・08・09・10・11・12・14・15・16・17(WSL2 の再確認は範囲の外)
- 新しい ADR・EV・IMPL は使っていない
- R1-02 の対象の照合は、所有者の回答待ちのため実装していない。裁定 7 節の開示の文を IMPL-0927 の note と EV-0334 へ置いた(回答が違えば後の段で改める)

## 実装した内容と、ng が直す前に落ちた確認

試験は `template/scripts/gate/` に置いた。コマンドは `node scripts/gate/<試験>.mjs`。

| ID | 直し | 直す前の結果 | 直した後 |
| --- | --- | --- | --- |
| R1-03・16 | `agent-run-record.mjs`: `assetsUncommitted` を足し、`assetsTrailerValue` が(1) コミットに入らない指示資産の変更、(2) 開始の要約値との差、のどちらかで `dirty` にし、(2) のとき `start=` を付ける。`assetsDirty` は失敗時に `null`。状態を読めなければ `unknown(assets-unreadable)`。記録の `assets` に `unknown` を許す | `test-agent-run-record.mjs` の NG 3 件(途中で変えてコミットに含める、未コミットで残す、リポジトリの外) | 20 件通過 |
| R1-01 | `check-safety-record.mjs` の `envProblem`: 識別を括弧を含まない文字列に限る(丸括弧の形・コロンの形の両方) | `test-safety-record.mjs` の NG 2 件(`模擬環境(HIL-2)(本番)`、`模擬環境: HIL-2(本番機)`) | 76 件通過 |
| R1-02 | `resultProblem` に `isValidApprover`。承認者の空欄・名簿の外・AI の名義を拒む。照合の手段が渡されなければ通さない。`checkSafetyRecord` が `resolveSigner` と `aiNameBlocked` で作る | 同 NG 7 件(承認者が空・AI の名義・名簿の外、照合の手段なし、実物の名簿での 3 件) | 76 件通過 |
| R1-11 | `cl-judgment.mjs` の `f2Q1Of`: 並記・判定が定まっていない記入・語の直後が区切りでない記入は null。`parseClRecord` は HTML の注釈とコードの囲みを除き、F.2 の行が複数で値が違うと `conflicts.f2`。`readF2Q1Text` は null | `test-cl-judgment.mjs` の NG 8 件 | 132 件通過 |
| R1-17 | `componentClasses` の見出しの探索を、次の `## ` の手前までに限る | 同 NG 1 件 | 同上 |
| R1-07 | `.githooks/**` を `CONTROL_FILES`・`ENFORCEMENT_DIGEST_GLOBS`・走査の先頭の一覧・`standardCategoryC`(`Edit(./.githooks/**)`)・`.claude/settings.json` の deny に足す | `controlTouchedOf([{ path: '.githooks/commit-msg' }])` が `[]`(直す前に実行して確認)。`test-init-g5.mjs` の `MUST_DENY` へ `Edit(./.githooks/**)` を足した(直す前の生成は、この行を持たない) | `test-check-pr.mjs` 265 場面通過(IMPL-0207:ng・ok 各 1 件) |
| R1-12 | `d0SectionProblems` の食い違いの文に再生成の案内。`kinds/intake.md` に節「B20 を取り込むとき」。旧い生成区間を一致として受け付ける形は採っていない | `test-roster-rules.mjs` の NG 1 件 | 213 件通過 |
| R1-15 | `aggregate-evidence.mjs` の確認範囲の表: 基準7 の 3 列目を「内容の妥当性は機械では確かめていない。…」へ | 該当の試験の文字列は無い(対の試験を置いていない。段 3 の結線の場面へ回す) | `lint:refs` 通過 |
| R1-06 | `human-ai-boundary.md` の文末を「引き当てる手段がありません」へ | `npm run lint:provisions` が 1 件の違反 | 違反なし |
| R1-08 | `research/444-verification/README.md` に裁定の節。EV-0319 の差し替え条件に「ネイティブの Windows」を足した | — | — |
| R1-09 | ADR-0222 決定17 と「影響」を裁定の文へ。IMPL-0506 の note に通信の経路の未確認を足した | — | `lint:refs`・`lint:impl` 通過 |
| R1-10 | IMPL-0927 の note と EV-0334 に結果の欄の限界を足した(機械で閉じない) | — | — |
| R1-14 | ADR-0220 の 2 件、ADR-0222 の 1 件のリンクを実在の slug へ | — | `lint:refs` 通過 |

ほかに、裁定の文を IMPL-0207・1019・0743・0925・0919・0510・0759 の note、ADR-0221 決定4、ADR-0222 の決定9・10・13、軽の裁定(`b20-decision-light.md`)の `dirty` の定義へ反映した。トレーラの真正さは manual と開示で受ける(決定13、IMPL-0207・1019・0743 の note、EV-0319)。

## 完了の条件の結果

`test-safety-record`(76)・`test-agent-run-record`(20)・`test-cl-judgment`(132)・`test-check-pr`(265 場面)・`test-roster-rules`(213)が通過。`npm run lint:provisions`・`lint:impl`・`lint:evidence`・`lint:refs` が exit 0。`impl:write`・`evidence:write`・`scope:write` で台帳を再生成した。textlint は指摘なし。回帰の全量は流していない。

## WSL2 の再確認に必要な変更点(別の担当が行う)

- T1〜T3: `agent-run-record.mjs` の `assetsTrailerValue` が変わった。トレーラ `Agent-Assets` の `sha256:` はコミットの時点の要約値になり、実行の途中で指示資産を変えたときは `start=sha256:<開始の要約値>` が付き、`assets=dirty` になる。T2 の期待「`Agent-Assets` が `assets <id>` の出力と一致」は維持される(同じ関数)。T3 は「再開の前に `CLAUDE.md` を変えても記録のファイルは変わらない」は維持。トレーラは記録の値ではなく、コミットの時点の値を出す
- T4(下位の担当): 期待は「`unknown` か、親の識別子と親の要約値」(裁定 5.3)
- S3: 生成した `.claude/settings.json` の deny に `Edit(./.githooks/**)` が加わった(Edit と Write の合計 11 行。`test-init-g5.mjs` の `MUST_DENY` も 11 行)。`.githooks/commit-msg` を隔離のもとのシェルから書き換えられないことと、ファイルの要約値が前後で同一であることを確かめる
- IMPL-0510 の note は「deny の全パス(11行。.githooks を足した)」と書き、S3 の再確認の記録を `research/444-verification/` に置くとした。再確認の結果で note の文を改める

## 残った点・裁定と合わない点

- R1-15 の対の試験は置いていない(集約の出力を読む場面が要る)。段 3 の結線の場面へ回す
- R1-12 の `kinds/intake.md` の手順は、D-0 節16 の記入と生成区間の作り直しを人が行う前提で書いた。実行して確かめていない
- `.githooks/**` を `ENFORCEMENT_DIGEST_GLOBS` に足したため、既存の採用者の強制層の要約値が変わる(取り込みで要約値の取り直しが要る)。`kinds/intake.md` の既存の手順(種別 `intake`)が要約値を取り直す
- 回帰の全量は流していない。関係する試験の結果は上のとおり
