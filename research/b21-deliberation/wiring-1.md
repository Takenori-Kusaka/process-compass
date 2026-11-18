# 束 B21 結線(gate-g5.yml の contract へ新しい試験5本)

作成 2026-11-18。指揮役の決定: gate-g5.yml の contract へ run の行を5本だけ足す。workflow_dispatch の部分とそれ以外の行は触らない。

## 足した行

`template/.github/workflows/gate-g5.yml` のジョブ contract の末尾(`test-push-trigger.mjs` の後、`test` ジョブの前)へ、コメント2行と run の行5本。`if`・`|| true`・`continue-on-error` は付けない。

`test-review-queue.mjs`・`test-flow-observation.mjs`・`test-pre-review.mjs`・`test-review-order.mjs`・`test-enforcement-inventory.mjs`

確かめた: `node scripts/test-template-suite.mjs --list` に5本が出る。5本は template の中から単体で通る(Windows、node 26)。`test-adoption`・`test-push-trigger`・`test-gate-node`・`test-context-refs`・`test-claude-md-resident`・`verify-gate-contract` も通る。

## template の他の変更

- `/gate` の SKILL.md「期限を超えたとき」へ差し戻しの手引きの一文(IMPL-0682)。`review-queue.mjs` の同時保有の通知の文へ「(/gate の手引き)」を戻した。試験の期待は文を固定しておらず、54 件のまま通る
- `test-review-queue.mjs` へ `IMPL-0136:ok` を1件足した(0136 の `:ok` は別の試験にしか無く、`check=machine` の要件2を満たさなかったため)。55 件

## 項目ごとの結果

`check=machine` の要件: 1 `test=` のファイルの実在、2 同じ試験に `IMPL-NNNN:ng` と `:ok` が別の行にある、3 contract の run から実行される(`||true`・`if`・`continue-on-error` なし)。`lint:impl`(check-impl)が3つを確かめて通った。「試験の中身が規定を正しく確かめているか」は検査が示さず、各 note に実物の GitHub で未確認である旨を残した。

| IMPL | 結果 | 試験の目印(ng/ok) | 機械で閉じない部分の開示(note) |
| --- | --- | --- | --- |
| 0680 | 上げた(machine) | 2/1 | 個人の指名を行うのは人。実物は未確認 |
| 0681 | 上げた | 4/8 | 代理判定者の指名の適用は人。7.5 の節が未決で追うマークが無い |
| 0682 | 上げた | 2/2 | 差し戻しの実行は人。手引きは SKILL.md に一文。数えるのは未応答の指名のみの近似 |
| 0979 | 上げた | 6/4 | AI 名義の承認を除かない・ドラフト起点・0100 との起点の差を開示済み |
| 0136 | 上げた | 1/1(ok を足した) | 実物は未確認 |
| 0212 | 上げた | 2/4 | 区分の確定は人(下限だけ機械)。人が付けた risk/* は変えない |
| 0283 | 上げた | 2/7 | 最小標本 10 は実証のない暫定値。cross-referenced の近似。実物は未確認 |
| 0571 | 上げた | 3/3 | 実物は未確認。外部の起票は対象外 |
| 0210 | 上げた | 1/7 | 内容の確定は人。実物は未確認 |
| 0215 | 上げた | 1/3 | 注意の喚起に限る。意味は読まない |
| 0213 | 上げた | 4/7 | 同じ権限者の改ざん・コメント削除は機械で閉じず、決定者が一覧で確かめる。注意は Issue へ書かない(採らない) |
| 0219 | 上げた | 3/9 | 措置そのものは人。T を改めた場合の通知の出方を開示済み |
| 0216 | 上げた | 2/7 | 判定当日の論点の比率と公開から判定までの日数は集計していない。警戒の解釈は人 |
| 0175 | 上げなかった | 3/8 | 並びだけが降りた。表現・強調は人が変え、降りていない。一部だけ降りた規定は降りていない側に置く。note の「結線待ち」だけ改めた |
| 0145 | 上げなかった | 6/8 | 保持期間で欠けた期間と実行が無かった期間を区別できない(P4 M-6 の開示)。note を改めた |
| 0217 | 上げなかった | | 判定へ進めない強制と必須応答の機械化が重の審議待ち。note の「結線待ち」を改めた |
| 0830 | 上げなかった | | 短縮の経路と下限が重の審議待ち。読めない所在は検出しない。note を改めた |
| 0374・0377・0614 | 上げなかった(note は変えていない) | | 様式 04 の「完了の条件」の欄と読む処理が要る。様式 04 は並行の束が触る。note の「結線待ち」の語は元から無く、残りは様式 04 の欄と読む処理 |

0175 と 0145 は指揮役の候補に挙がっていたが、前の担当の申し送り(fix-p1-p4-1)と裁定が「結線後も undelivered」と定めており、要件を確かめた結果も一部しか降りていないため、上げなかった。

## 本体の変更

- 13 件のマークを `state=delivered check=machine test=template/scripts/gate/...` に変え、`plan`・`issue`・`review` を外し、「確かめる者」の定型文と「結線待ち」「B20 の push の後」を外した。0218 の note の「結線待ち」も改めた
- `src/data/impl-untraced.yaml` から5本の試験の行を外した(contract から実行される試験は逆向きの追跡の対象外)
- `src/data/impl-targets.yaml` の flow-observation と review-queue-control の名前から「(予定)」を外し、説明の「結線待ち」を実態に改めた
- 台帳3本を再生成

## 検査の結果

`lint:impl`・`impl:issues`・`test:fields`・`lint:scope`・`lint:refs` すべて通過。変えた5つの md の textlint は指摘なし。全量の `npm run check` は流していない(push の前に指揮役が1回流す)。

## Issue ごとの残る降りていないマーク(state=undelivered)

| Issue | 件数 |
| --- | --- |
| #445 | 10 |
| #446 | 15 |
| #450 | 1 |
| #441 | 1 |
| #443 | 6 |
| #325 | 4 |
| #326 | 2 |
| #348 | 2 |
| #356 | 3 |

## まだ残る結線(B20 の push の後)

- 様式 04(判定記録)の「完了の条件」の欄と、`flowSection`(next.mjs)がその欄を読む処理。`template-fields.yaml` と標準側にも欄を足す。その後に IMPL-0374・0377・0614 を上げる。0614 は、外した Issue が更新の日の検索に入ることを実環境で1回確かめ、`fetchClosedUnits` の読み出しの試験を足す
- 単位4・5・7 ほかの結線(本スレッドの対象外)
- 実物の GitHub で確かめる点(fix-unit9-12-2 の申し送り6): 機械のコメントの `user.login`・`type`、`author_association`、ラベルの作成、`--paginate --slurp` の応答の形、GraphQL の `closedByPullRequestsReferences`、review-queue ジョブの `issues` 権限、flow ジョブの `pull-requests` 権限、pre-review.yml の dry-run の注意の出力
- IMPL-0217 の強制・0830 の短縮の経路と下限・0175 の表現と強調・0145 の保持期間の区別
- #445 へ、D-0 節5 の 3.9.1 の引用範囲を編集の指摘としてコメントで寄せる(議長)
