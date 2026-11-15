# Issue #439 実装の記録(2026-11-15)

裁定は `decision.md`。作業は `draft.md` 7章の 1〜11。

## 起票とコメント

| 対象 | 内容 | 所在 |
| --- | --- | --- |
| 新規 #443(X) | #359 の残り。IMPL-0283・0374・0377・0500・0175・0174。IMPL-0174 の scheduled か adopter かを問いとして置き、IMPL-0175・0283 の review を 2027-05 へ延ばした結果を本文に書いた | https://github.com/Takenori-Kusaka/process-compass/issues/443 |
| 新規 #444(Y) | #358 の残り。IMPL-0207・0200・0506・0510 | https://github.com/Takenori-Kusaka/process-compass/issues/444 |
| #326 へコメント | IMPL-0145・0497 と受け入れ条件の案 | https://github.com/Takenori-Kusaka/process-compass/issues/326#issuecomment-6889598913 |
| #355 へコメント | IMPL-0132 と受け入れ条件の案 | https://github.com/Takenori-Kusaka/process-compass/issues/355#issuecomment-6889599219 |
| #361 へコメント | IMPL-0492 と record-copy の確認の 7 項目 | https://github.com/Takenori-Kusaka/process-compass/issues/361#issuecomment-6889599540 |

本文・コメントに責任者・承認者として AI の名義は書いていない。番号 #442 は別の担当が先に使っていた。

## 付け替え(14 件)

#326 ← 0145・0497 / #355 ← 0132 / #361 ← 0492 / #443 ← 0283・0374・0377・0500・0175・0174 / #444 ← 0207・0200・0506・0510。IMPL-0175・0283 の `review` は 2027-05。note は変えていない。付け替え後に `npm run impl:issues`(gh)で、閉じた Issue を名指すマークが 0 件であることを確かめた(74 件、番号 15 件)。

## 変えたファイル

- `scripts/lib/plan-issues.mjs`(新): 純粋な関数。マークの読み取り、所見(closed / notfound / pr)、コメントの本文と署名、`--closed-from` の読み取り、`lint:impl` 用の番号の突き合わせ
- `scripts/check-impl-plan-issues.mjs`(新): `--closed-from` / `--emit` / `--comment`、引数なしは gh。終了コード 0 / 1 / 2。Issue の状態を変える API を呼ばない(コメントの投稿のみ)
- `scripts/check-impl.mjs`: E(`issue=` が写しに在り種別が issue)を足した
- `scripts/test-plan-issues.mjs`(新)、`package.json`(`test:plan-issues`・`impl:issues` を足し、`check` に `test:plan-issues` を入れた)
- `.github/workflows/impl-plan-issues.yml`(新): 契機は issues closed・main への push(docs 等)・月次・手動。`issues: write` はこのジョブだけ。実行は直列。同じ署名のコメントは繰り返さない。所見があれば失敗
- `src/content/docs/adr/0130-detect-closed-issues-named-by-implementation-marks.md`(新): ADR-0084 決定4 の1項と R-4 の1行を置き換える
- `src/content/docs/community/implementation-marking.md`: 検出の項、閉じる者の手順、EV-0259・EV-0260、見本の番号の文(編集の指摘)
- 付け替えたマークのある 6 ファイル(phase4-process-design の assurance-case・exception-escalation・gate-criteria・human-ai-boundary・lifecycle・roles-responsibilities)
- 生成物: `community/implementation-ledger.md`・`community/evidence-ledger.md`・`src/data/issue-index.tsv`(#443・#444 を含む 444 件)

## 試験の結果

- `test:plan-issues` 10 件、`test:impl` 56 件、`test:ci-wiring` 38 件: 合格
- `lint:impl`・`lint:evidence`・`lint:refs`・`lint:tone`・`lint:text`・`lint:scope`・`lint:ci`: 合格
- 違反と適合の対(IMPL-PLAN:ng / ok): 閉じた番号・実在しない番号・PR の番号を名指す、open だけを名指す、コードブロックの見本を数えない、同じ所見のコメントを繰り返さない
- `npm run check` の全量は流していない(push の前に議長が1回)

## 仮の番号(push の前に付け直す可能性がある)

- ADR-0130(origin/main の最大は 0128。B1 が 0129 を使う見込み)
- EV-0259・EV-0260(origin/main の最大は EV-0258。B1 が 0259 以降を使う場合は付け直す。付け直すときは `implementation-marking.md`・ADR-0130 の本文・`evidence:write` を合わせる。ADR-0130 の本文は EV-0259 を名指す)
- IMPL の新設はなし

## 残り(やっていない)

- 7章12: main へ入った後、`workflow_dispatch` と試験用の Issue を閉じる試行で発火・コメント・重複の抑止を確かめる。確かめたら EV-0259 を差し替える
- 7章13: `review=2026-11` の 26 件(#355 の 11 件、#356 の 15 件)の知らせ(議長が行う)
- 独立の突合(実装を見ていない別の文脈)
- 付け替えた寄せ先の適否は manual(EV-0260)
