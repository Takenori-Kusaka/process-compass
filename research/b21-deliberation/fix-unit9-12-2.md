# 束 B21 単位9〜12 の突合 2巡目(最後の巡)の直し

作成 2026-11-18。所見 `review-unit9-10-2.md`・`review-unit11-12-2.md`、裁定 `ruling-unit9-10-fix2.md` と単位11・12 の議長の裁定(依頼文)。template のコミット b18299a(bundle `tmp/bundles/template-b21-10.bundle`)。

## 単位9・10

| 所見 | 直した内容 | 試験 | 開示で閉じたもの |
| --- | --- | --- | --- |
| 高 0212 の「既にあれば変えない」 | 0212 の note と `review-queue.mjs` 冒頭のコメントを「人が付けた risk/* があれば変えない。機械が付けたものは下限へ引き上げるだけで、下げない」へ | 台帳の再生成。`test-review-queue` 54 件 | |
| 中 M1 AI 名義の承認 | `isApproved` は種別 Bot と `[bot]` の login を既に除いている。名簿との照合は採らない(裁定) | | 0979 の note に「AI の担い手の名義の承認は除いていない。通知が止まるだけで G-6 の合否は G-5 が判定する」と開示 |
| 中 M2 条文の読み | 0979 の note を「PR では上程をレビュー依頼の時点と読む(第4章の定義)。3.9.1 の引用も同じ起点で、条文は割れていない」へ。D-0 節5 の引用範囲は編集の指摘として #445 へコメントで寄せる(議長が行う。ここでは寄せていない) | | |
| 中 M3 flow-observation の説明 | `impl-targets.yaml` の説明を「実装は flow-observation.mjs と flow-observation.yml にある(結線待ち)」へ。名前の「(予定)」は結線の担当が外す | `lint:impl` 通過 | |
| 低 L1 起点がドラフトの依頼を含む | 直さない | | 0979 の note に開示。ドラフトのまま依頼して後で ready にすると ready の直後に超過が出うる |
| 低 L5 起点が 0100 と別 | 直さない | | 0979 の note に「0100 は作成からの近似で別」と開示 |
| 低 L2 権限の実物未確認 | 直さない | | 下の申し送りの「実物で未確認」に足した(review-queue ジョブの issues 読み取り、flow ジョブの GraphQL とタイムライン) |
| 低 L3 読み取りの共用 | 直さない | | flow-observation の GraphQL は 100 件で打ち切る(超過は stdout の注意)。0283 の note の最小標本の開示のとおり。実物で未確認 |
| 低 L4 同じ秒のレビュー | 直さない | | 厳密な比較。実害が小さい |
| 低 L6 結線の時期 | 直さない | | 議長の線引き。7 項目は「B20 の push の後」で揃う。D-0 表3 と節6 の併記は指す先の違い |
| 低 L7 0682 と SKILL.md | 直さない(SKILL.md は並行の束の範囲。差し戻しの一文は入っていない) | | 申し送りに残す |

## 単位11・12

| 所見 | 直した内容 | 試験 | 開示で閉じたもの |
| --- | --- | --- | --- |
| 低 N1 T を少し改めると 2営業日前の通知が出ない | `sync-escalation.md` の文を実態に合わせた(「これから来る時点の通知が一度ずつ出る。欄を改めた時点で過ぎている時点の通知は出ない。出し直しは事前レビューの workflow による」)。挙動は変えない | | |
| 低 N2 dry-run でもラベルを作る | `pre-review.yml` のラベル作成の手順を `DRY_RUN=true` のとき何もせず抜けるようにした | 構文のみ(実物は未確認) | |
| 低 N3 0218 の note が自動化を事実として書く | 0218 の note を「実装済み・結線待ちの自動化 pre-review.mjs で、降りているのはこの手引きだけ。出し直しは IMPL-0219 が追う」へ。state は delivered check=manual のまま | | |
| 低 N4 `@bob_x` を `bob` と読む | `loginsOf` を、`@` の後ろの `[A-Za-z0-9_-]+` を1語として切り出し、login として成り立つ(英数字とハイフン、先頭は英数字、39 文字まで)ものだけを読む形に改めた。成り立たない綴りは起案者・指名レビュアの欄から外し、注意に出す。`@bob/` のようなチーム名は従来どおり読まない | `test-pre-review` に1件(`@bob_x @bob/ @carol` → carol だけ、注意に `@bob_x`)。全件通過 | |
| 低 N5 注意が Issue に出ない | 直さない | | 0213 の note に「注意は Actions の出力だけに出て Issue へ書かない(外部の者を記名で呼ぶ経路を増やさないため。採らないと決めた)」と開示。結線の確認で注意の出力を見ることを申し送りに含める |

## 試験の結果(Windows の node 26)

`test-review-queue` 54 件・`test-flow-observation` 22 件・`test-pre-review` すべて期待どおり・`test-adoption` 69 件・`test-context-refs` 通過。本体は `lint:impl`・`impl:issues`・`test:fields` が通過。全量の check は流していない。

## 結線の担当への申し送り(B20 の push の後。単位8〜12 をまとめる)

1. `gate-g5.yml` の gate-contract のジョブへ足す run の行(`|| true`・`if:`・`continue-on-error` を付けない):
   - `      - run: node scripts/gate/test-review-queue.mjs`
   - `      - run: node scripts/gate/test-flow-observation.mjs`(`next.mjs` を import する。gate-contract の環境で読めること)
   - `      - run: node scripts/gate/test-pre-review.mjs`
   - 単位8 の4項目は既存の結線済みの試験ファイルに場面を足したため、足す行は無い
2. 様式 04(判定記録)の「完了の条件」の欄: `src/data/template-fields.yaml` と標準側へ欄を足し、`flowSection`(`next.mjs`)が通過した SG の判定記録のその欄を読む処理を足す(いまは「算定できない」)
3. `/gate` の `SKILL.md` へ足す一文: 「レビューの指名先を確保できないとき: 新しい判定依頼を作らず、起案者へ差し戻す(同時保有の上限を超えた通知は `scripts/gate/review-queue.mjs`。標準 第4章「レビュー SLA と滞留の措置」)」。足した後、IMPL-0682 の note の「未記載」を改め、`review-queue.mjs` の同時保有の通知の文へ「(/gate の手引き)」の参照を戻す
4. delivered へ上げる項目:
   - 単位8: IMPL-0374・0377・0614(いまは undelivered check=manual issue=443)。上げる前に 3 を満たす。0614 は、外した Issue が更新の日の検索に入ることを実環境で1回確かめ、`fetchClosedUnits` の GitHub の読み出しの試験を足す
   - 単位9・10: IMPL-0680・0681・0682・0979・0136・0283・0212(review-queue-control・flow-observation。issue=445)。結線の後は `state=delivered check=machine test=...`。実機で未確認のため scheduled を保つかは結線の担当が裁定する。降ろし先 flow-observation の名前の「(予定)」を外す(review-queue-control も同じ)
   - 単位11・12: IMPL-0571・0210・0215・0213・0219・0216(pre-review-automation。issue=325)。0218 は delivered check=manual のまま(手引きが降りている)
5. `impl-untraced.yaml` から外す行: `scripts/gate/test-pre-review.mjs`・`scripts/gate/test-review-queue.mjs`・`scripts/gate/test-flow-observation.mjs` の試験の行(結線の後)
6. 実物の GitHub で確かめる点
   - 機械のコメントの `user.login` が `github-actions[bot]` で `type` が `Bot` であること、`author_association` の値、ラベルの作成、`--paginate --slurp` の応答の形、GraphQL の `closedByPullRequestsReferences`、ラベルの削除の API
   - review-queue のジョブに `issues` の権限が無いまま `issues/{n}/events`・`issues/{n}/comments` を読めるか、flow のジョブに `pull-requests` の権限が無いまま GraphQL とタイムラインを読めるか(私有のリポジトリで読めないと「算定できない」で黙る)
   - 試験用のリポジトリで pre-review.yml を dry-run で流し、注意の出力(起案者を読めない・欄の誤り・login として成り立たない綴り・T が営業日でない)を見る
7. 議長の裁定に残るもの: #445 へ、D-0 節5 の 3.9.1 の引用範囲を編集の指摘としてコメントで寄せる
