# 束 B29 — 単位 X の独立の突合(2巡目・直した差分だけ)(2026-11-20)

対象: 議長の裁定 `51-chair-x-r1.md`、直しの記録 `52-fix-x-r1.md`。差分は template `4bd0a8b..ba79fff`(6ファイル)と本体 `d6a95bf3`(`src`・`research/b27-deliberation`)。実装を見ていない別の文脈で見た。直しはしていない。

## 結論

- 高 0・中 0・低 2・編集 0
- 裁定の表の直し(#356 の R1-1〜R1-9、#348・#441・#450 の R1-1〜R1-8)は、すべて行われていた。裁定に無い変更は見つからなかった
- 実測(template の origin/main = 31e783a)は記録・README 18 の文と一致した

## 所見

### X2-1 低 — 済みの行の述語が2つの写しに分かれた

- 所在: template `scripts/gate/next.mjs` の `DONE_SPEC_LINE`(769 行付近)、`scripts/gate/autonomy.mjs` の `specTrailersOf`(431 行)
- 根拠: 直す前の `doneTasksOf` は `specTrailersOf` を呼んでいた。直した後は `doneSpecTasks(lastParagraph(body))` を使い、`specTrailersOf` と同じ正規表現をもう1つ書いている。裁定が求めたのは「`doneTasksOf` と段落の外の件数が1つの定義を共有する」ことで、この点は満たす(違反ではない)。ただし注記・README・コメントの「段落の読み方は手戻り率と同じ」を支える行の述語は、2つのファイルに写しがある。一致を押さえるのは試験の1件(`test-next-records.mjs` 472 行。3つの本文)だけ。今の挙動は等しい(Set で重複を除くので結果も同じ)
- 直しの案: 単位 Y か次にこの辺を触るときに、正規表現を `autonomy.mjs` から書き出して `next.mjs` が import する(または `specTrailersOf` が `doneSpecTasks` を使う)。今回の巡では直さなくてよい

### X2-2 低 — IMPL-1033 の確かめ方が、求めなくなった「設定」を読む

- 所在: `src/content/docs/phase4-process-design/human-ai-boundary.md` 922 行(IMPL-1033 の note の「確かめる者: …演習の記録と演習用ブランチの設定を読む。IMPL-0190 と同じ」)
- 根拠: ADR-0250 決定1 の表の2行目から「設定と、その記録を持つ」を外した(裁定 R1-1)。採用者に設定は求めなくなったが、確かめ方は設定を読む。裁定が「確かめ方の記述は残す」と明示しているので、裁定との矛盾ではない。設定が無い採用者では、確かめる者が読むものの片方が無い
- 直しの案: 現状維持でよい(裁定どおり)。次に note を書き直すとき(単位 Y など)に「演習の記録と、演習用ブランチの設定があればその設定」のように読めるよう揃えるかを議長が決める

## 確かめたこと

1. 裁定の各直しの実在
   - #356 R1-1: ADR-0250 決定1 の表の2行目が、条文 5.6.2 第2層(human-ai-boundary.md 911 行「演習用のブランチで、標識の失われる履歴の書き換えをしない」)の結果に戻った。rebase と「設定と、その記録を持つ」は無い。IMPL-1033 の note と矛盾しない(X2-2 は残る観察)
   - R1-2: `scan()` が `parseLog(log)` を使う。`parseLog` の区切り(0x1e・0x1f の実際の制御文字)と旧い分割は同じで、`commitsScanned`・`markerCommits` の作り方は変わらない。`test-seeded-error-scan.mjs` はすべて通った
   - R1-3: 冒頭のコメントが「まだ import していない」の文になった
   - R1-4: 採らない案に「ルールセットで…禁じる」の行がある。理由の「判定をブランチの名に依らせない(ADR-0161)」は ADR-0161 の 66 行(IMPL-0190 の行「流出を止める判定をブランチの名に依らせないため」)と合う。「実機の確認はしていない」を添えている
   - R1-5: `test-env-check.mjs` の2件に `/直接の push/` が足された
   - R1-6: `40-impl-356-x.md` の「指示書から外れた点」に決定4 の1行
   - R1-7: `grep -rn 仮番号 src/` は 0 件。ステータスの文が外れた
   - R1-8: EV-0345 の「止めません」の文が **対象** の行へ移った。書式(対象・根拠の水準・差し替え条件)は `evidence-marking.md` の例と同じ。台帳の行の文はマークと一致した
   - R1-9: コメントの1行が ⑦ の説明の後、① の前へ移った
   - #348 R1-1: `DONE_SPEC_LINE` を `doneTasksOf` と `specOutsideLastParagraph` が共有する。`Spec: setup` を数えない試験がある
   - R1-2: `doneTasks(branch, gitFn = git)` と `outsideSpecNote(outside)` が書き出された。`computeNext` は `doneTasks(branch)` のまま呼ぶので既定の挙動は変わらない。注記を出す条件(`outside > 0`)も同じ
   - R1-3・R1-4・R1-5・R1-6・R1-8: README 18・注記・`done` の reason の文を確かめた。R1-7 の記録の理由(`>` を含むと拒まれる)と単位 Y への回しも記録にある
2. 実測(template origin/main 31e783a、`doneTasks('origin/main', gitFn)` を一時のスクリプトで呼んだ)
   - `rev-list --count` 456。分割した配列の要素は 457(末尾の空)、空でない本文は 456
   - 済みのタスク 0・段落の外の件数 0・注記は null。README の「456 コミット」「0 件」と合う
   - 旧い述語 `^Spec:` の段落の外は 40 件(`Spec: setup` 39 件のコミット・`Process-Improvements / T…` の1件のコミット、行は2行)。`F-NNN / Task-N` の形の行を持つ本文は 0 件。記録の数と合う
3. 試験が実装を外すと落ちるか(作業ツリーの外の一時の写しで実施。写しは消した)
   - `doneTasks` が `gitFn` を無視して `git` を呼ぶ変異: `test-next-records.mjs` が 1 件不一致で落ちた
   - 段落の外の件数の述語を `^Spec:` へ戻す変異: 4 件が NG(`Spec: setup` の2件・結線・入口)
   - `adoption-trial.mjs` の空の一覧の詳細から「直接の push」を外す変異(WSL node 26.13.1、`/tmp/b29-r2-env`): `test-env-check.mjs` が 1 件不一致で落ちた
4. 関係する試験: `test-next-records.mjs` 153 件一致、`test-seeded-error-scan.mjs` すべて通過、`test-env-check.mjs`(WSL)66 件一致、`npm run lint:refs` exit 0、`npm run lint:evidence` 通過(325 件・期限到来 0)、ADR-0250・seeded-error-safety.md の textlint exit 0

## 確かめていないこと

- 回帰の全量(`npm run check`)。指示どおり流していない
- `npm run evidence:write` を流して台帳が差分ゼロになるか(作業ツリーを書き換えるため。行の文の目視の一致だけ)
- `lint:impl` と impl の台帳の同期(差分は IMPL の note を変えていない)
- GitHub のスカッシュの実際のメッセージの形、ルールセットでの禁止の実機(#361。記録も未確認と開示している)
- 差分の外(フェーズ5 の手引きの「演習用ブランチではスカッシュを禁じる」の箇条など)。2巡目の範囲外
