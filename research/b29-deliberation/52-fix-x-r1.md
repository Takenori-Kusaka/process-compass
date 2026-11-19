# 束 B29 — 単位 X の突合(1巡目)の直し(2026-11-20)

裁定: `51-chair-x-r1.md`。所見: `50-reconcile-356-x-r1.md`・`50-reconcile-348-441-450-x-r1.md`。template コミット ba79fff(bundle `tmp/bundles/template-b29-x-fix-01.bundle`)。

## 直しの所在

### #356

| 所見 | 直し | 所在 |
| --- | --- | --- |
| R1-1 | 表の2行目を条文の結果へ戻した。rebase と「設定と、その記録を持つ」を外した | ADR-0250 決定1 の表 |
| R1-2 | `scan()` が `parseLog(log)` を使う。記録の文も実態に合った | template `scripts/gate/seeded-error-scan.mjs` の `scan()` |
| R1-3 | 冒頭のコメントを「まだ import されていない」と分かる文にした | 同 16 行付近 |
| R1-4 | 採らない案の表に、ルールセットで演習用ブランチを禁じる案を足した(実機は未確認と明記) | ADR-0250 の表の末尾 |
| R1-5 | 空の一覧の試験と `none` の試験に `/直接の push/` を足した | template `scripts/gate/test-env-check.mjs` |
| R1-6 | 決定4 は残し、記録の「指示書から外れた点」へ1行足した | `research/b27-deliberation/40-impl-356-x.md` |
| R1-7 | ADR の番号は 0250 で確定。ステータスの文と「(仮番号)」を外した。`grep -rn "仮番号" src/` は 0 件(research の b27 の指示書・裁定の記述は履歴として残した) | ADR-0250、記録 |
| R1-8 | 「止めません」の文を **対象** の行へ移した。`evidence:write` で台帳を再生成 | `seeded-error-safety.md` の EV-0345 |
| R1-9 | コメントの1行を ① の直前(⑦ の説明の後)へ移した | template `adoption-trial.mjs` |

### #348・#441・#450

| 所見 | 直し | 所在 |
| --- | --- | --- |
| R1-1 | 述語 `DONE_SPEC_LINE`(`Spec: F-NNN / Task-N`)を `doneTasksOf` と `specOutsideLastParagraph` が共有する | template `scripts/gate/next.mjs` |
| R1-2 | `doneTasks(branch, gitFn = git)` と `outsideSpecNote(outside)` を書き出した。試験を足した(下記) | `next.mjs`、`test-next-records.mjs` |
| R1-3 | README 18 にスカッシュの既定・空行入りの形で数えられない旨と #361 を足した | template `README.md` 18 |
| R1-4 | 注記と README を「段落の読み方は手戻り率と同じ」に限った。挙動は不変 | `next.mjs`、README |
| R1-5 | 件数を測り直し、「2026-11-20 時点」と添えた | README 18、記録 |
| R1-6 | README の見出しから「単位 X」を外した。記録の「指示書から外れた点」に IMPL-0645 の項などを挙げた | README、`40-impl-348-441-450-x.md` |
| R1-7 | 記録の理由を「`>` を含むと拒まれる」へ直した。note の書き直しは単位 Y へ回すと記録した | `40-impl-348-441-450-x.md` |
| R1-8 | 「実装済み」の理由に「本文の末尾の段落に」を足した | `next.mjs`(「実装済み」の reason) |

## 測り直した件数(template の origin/main、2026-11-20)

- 総コミット数 456(`rev-list --count`。457 は分割した配列の要素数で、末尾の空の要素を含んでいた)
- 段落の外の件数(直した述語): 0 件。旧い述語 `^Spec:` では 40 件だった(`Spec: setup` 39・`Process-Improvements / Task-N` 1)
- 旧い読み(本文全体)と新しい読みで済みのタスクが変わるコミット: 0 件(失う 0・得る 0)。この template の履歴には `F-NNN / Task-N` の形の行が無い

## 試験

- `node template/scripts/gate/test-next-records.mjs`: 153 件一致(151 + 入口の2件。直す前は146)
- `node template/scripts/gate/test-seeded-error-scan.mjs`: すべて通った
- `test-env-check.mjs`(WSL node 26.13.1、写しを /tmp/b29-fix-x に LF で置いた): 66 件一致。写しは削除した
- 本体: `lint:refs` exit 0、`lint:impl` 通過(IMPL-1033 は adopter の降りていない規定として出続ける)、`evidence:write`・`impl:write` 実行、ADR-0250・seeded-error-safety.md の textlint exit 0

## mutation(一時の写しで実施。作業ツリーには残していない)

| 変異 | 結果 |
| --- | --- |
| M3 `computeNext` の注記の push を消す | 落ちる(入口の場面) |
| M4 `doneTasks` の中身を旧い読みへ戻す(outside を 0) | 落ちる(結線の場面) |
| 述語を `^Spec:` へ戻す | 落ちる(Spec: setup の場面) |
| M5 空の一覧の経路から直接の push の文を丸ごと外す | 1 件不一致で落ちる |
| `none` の経路(不一致の詳細)から prGap を外す | 2 件不一致で落ちる |

最初に試した M5(文の一部だけを置換)は、後ろの文にも「直接の push」が残るため生き残った。変異が弱かっただけで、文を丸ごと外すと落ちる。

## 残した点

- 集約の側(単位 Y)のトレーラの述語は、§1.7 のとおり別で、触れていない
- IMPL-0645 の note の書き直しは単位 Y(delivered にするとき)へ回した
- GitHub のスカッシュの実際のメッセージの形、ルールセットでの書き換えの禁止の実機は未確認(#361)
- b27 の指示書・裁定(`30-ruling-*`・`31-chair-*`)にある「仮番号」の語は、当時の記録なので直していない
- 作業中の事故: 共有の一時ファイルを誤って読み込み、test-next-records.mjs に他の担当の断片が入った。`git show HEAD:` から作り直して復旧した(最終の差分に他の断片は無い)
