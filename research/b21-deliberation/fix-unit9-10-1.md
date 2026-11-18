# 束 B21 単位9・10 の突合 1巡目の直し

作成 2026-11-18。所見 `review-unit9-10-1.md`、裁定 `ruling-unit9-10-fix1.md`。template のコミット 48ac51a(bundle `tmp/bundles/template-b21-08.bundle`)。7項目は `state=undelivered` のまま。

## 所見ごと

| 所見 | 直した内容 | 試験 |
| --- | --- | --- |
| H1 | 0682 の note を「手引きの一文は未記載(B20 の push の後に足す)」へ。PR へのコメントから「/gate の手引き」を外した | note は台帳で確認 |
| H2 | 6項目の旧い「無い」「未実装」を日付つき(2026-11-15 時点)の経緯へ移した。0136 の「降りた部分」に review-queue の検出を足した。`impl-targets.yaml` の review-queue-control の説明も同様に改めた | `lint:impl` 通過 |
| M1 | 応答は「その依頼の時刻より後のレビュー」に限る(0681・0682 の双方) | 付け直しの催促・同時保有の2件、依頼後のレビューは応答の1件 |
| M2 | 起点は最初のレビュー依頼(無ければ ready、無ければ作成)。終点は `isApproved`(レビュアごとの最新の判定が承認、ボットでない、書き込み権限(author_association)、最新の commit)。近似であることを note に開示 | 差し戻し・ボット・権限なし・古い commit・起点の5件 |
| M3 | 機械(github-actions)が付けた risk ラベルだけ、下限が厳しくなれば引き上げる(旧ラベルを外す)。下げない。人のラベルに触れない。事象の actor から機械のラベルを求める | 引き上げ・下げない・人のラベルの3件 |
| M4 | 着手の時点は同じリポジトリの PR に限り、PR と Issue の作成の遅い方。残る近似(言及を数える)は note に開示 | 3件 |
| M5 | 窓は config の `observationWindow`(月数。単位8 と同じ `observationWindowAt`)。完了の判定は `next.mjs` に足した `isCompletedUnit`(export のみ。`fetchClosedUnits` が同じ関数を使う。挙動は変えない)を共用。閉じた作業単位は GraphQL で `closedByPullRequestsReferences` を読む | 窓の月数・完了の判定・`test-next-records` 120件 |
| M6 | 0212 の降ろし先を `review-queue-control` へ。説明に risk-label を足した | `lint:impl` |
| L1 | `--paginate --slurp` に改め、平らにする | 本文の `[a][b]` が壊れない・引数の確認 |
| L2 | 印は github-actions[bot] のコメントに限る(review-queue・flow-observation) | 人の印では止まらない2件 |
| L3 | 変数 `REVIEW_UTC_OFFSET_MINUTES`(空なら 540)。note に固定の差・夏時間非対応を開示 | 既存の TZ 試験 |
| L4 | 催促・通知の文に、祝日を数えていない旨を足す | 1件 |
| L5 | 0680 は `requested_reviewers` が空かで判定 | 1件 |
| L6 | 権限をジョブごとに絞った(queue と risk-label は pull-requests: write、flow は issues: write)。concurrency の run_id を固定の 'queue' にした | workflow の構文のみ。実機は未確認 |
| L7 | G-3 の時間の判定の後も、G-6 の営業日を全ての PR で見る | 既存の試験が通る |
| L8 | note の「D-0 表3」と「節6」の併記を直す余地は残した(下記) | — |
| L9 | 0682 は未応答の指名を数える旨と、第4章制御1より狭い近似であることを note に開示 | — |

## 直さなかったもの

- L8 の「結線の時期(B20 か B15)」: 議長の裁定 §7 の書きぶりの食い違いで、実装の側では決められない。note は B20 のまま。0681 の「D-0 表3」の語も標準側の表記として残した
- L3 の夏時間: 裁定のとおり、開示で閉じた

## 条文の読みの割れ(議長が #445 へ寄せる)

- 判定完了時間の起点: `gate-criteria.md` 第4章「2つの時刻を分ける」(2438〜2443 行)は「レビュー依頼から判定の確定まで」。`roles-responsibilities.md` 3.9.1(1216 行)と `exception-escalation.md` 550 行、D-0 節5 は「上程の受理日から起算」。後者は会議体の上程の期限として読み、PR の判定には第4章の定義を使った。割れた事実を note に書いた(IMPL-0979)

## M5 で残した値

- 最小の標本数 10(`DEFAULT_MIN_SAMPLE`)。標準に値が無く、実証もない暫定の既定値。`--min-sample` で変える。note(IMPL-0283)に開示。標準の本文へは足していない
- 観測の窓の 90 日は廃止し、config の月数(既定 2)に揃えた

## 結線の担当への申し送り

- `gate-g5.yml` の gate-contract のジョブへ(`|| true`・`if:`・`continue-on-error` を付けない):
  - `      - run: node scripts/gate/test-review-queue.mjs`
  - `      - run: node scripts/gate/test-flow-observation.mjs`
- test-flow-observation は `next.mjs` を import する(`isCompletedUnit`)。gate-contract の環境で読めること
- `/gate` の SKILL.md へ足す一文: 「指名先を確保できないときは、新しい判定依頼を作らず、起案者へ差し戻す」。足した後、0682 の note の「未記載」を改め、`review-queue.mjs` の同時保有の通知の文へ「(/gate の手引き)」の参照を戻す
- 結線の後は `state=delivered check=machine test=...` へ。実機で未確認のため scheduled を保つかは結線の担当が裁定する
- 実物の GitHub で未確認の点(追加): `--paginate --slurp` の応答の形、GraphQL の `closedByPullRequestsReferences`、ラベルの削除の API
