# 束 B21 単位9・10 の実装の記録

作成 2026-11-18。裁定は `research/b18-deliberation/ruling-a1.md` §2.1・§2.4・§3.7・§3.8・§4・§5・§7。実装は template のブランチ b21(単位9 = b1414b0、単位10 = 4ed8e38。bundle は `tmp/bundles/template-b21-03.bundle`・`-04.bundle`)。

## 全体の state

**全項目 `state=undelivered` のまま**(`check=manual plan=scheduled`)。新しい試験を `gate-g5.yml` へ結線できない(B20 の領域)ため、`check=machine` の要件3 を満たせない(§7)。マークの note の先頭に「実装済み・結線待ち」と事実を書いた。降ろし先 `review-queue-control`・`flow-observation` の種別は `planned` から `template-file` へ改めた(§2.7)。

## 項目ごと

| IMPL | 作ったもの | 試験(結果) | state | 採らなかった点 |
| --- | --- | --- | --- | --- |
| 0680 | `review-queue.mjs` の `queueActions`(key=`team-only`) | `test-review-queue.mjs` ng/ok | undelivered | 指名の自動の取り消し |
| 0681 | 同(`nudge`・`nudge2`)。応答N営業日の超過で記名の催促、2倍で D-0 節6 の宛先へ記名 | 同 ng/ok(期限内・応答済み・祝日・ドラフト・重複の印) | undelivered | 自動の再割り当て・自動承認。代理の指名の適用(人) |
| 0682 | 同(`load:<login>`)。未応答の指名が上限(既定3、`REVIEW_LOAD_LIMIT`)を超える分を PR で知らせる | 同(4件目で出る・3件目まで出ない・上限の変更) | undelivered | 指名を外す操作。差し戻しの手引きの一文(`/gate` の SKILL.md は B20 の領域のため未記載。下に残作業) |
| 0979 | 同(`judge-overdue`)。G-6 は営業日、G-3(`context/decisions/` だけ)・G-2/G-4(`specs/` だけ)は時間で判定期限を見る。宛先は節6 → 節3 → 席 → 名簿 → login | 同(宛先の解決・G-3 の時間・混在は G-6・承認済みは出ない) | undelivered | PR を持たないゲート(G-1・G-7・G-8・SG)は確かめない |
| 0136 | 検出に散文を外す分岐を持たない | 同(`isProseDocument` の前提を確かめた上で、散文だけの PR でも催促が出る) | undelivered | — |
| 0212 | `riskLabelAction` と `review-queue-control.yml` の `pull_request_target` のジョブ(`risk-label`) | 同(R1 規則 → risk/R1、当たらなければ risk/R3、既存の `risk/*` は上書きしない) | undelivered | 既存ラベルの引き下げ・取り消し |
| 0283 | `flow-observation.mjs`(`flowActions`・`startOf`・`fetchUnits`)と `flow-observation.yml`(日次) | `test-flow-observation.mjs` 15件(超過で記名の通知・標本不足で算定できない・2回目は出さない・窓・着手の時点の定義・TZ) | undelivered | G-1 で合意した値(様式に欄が無い)。ラベルの遷移 |

共通: `business-days.mjs`(土日と任意の `.github/business-holidays.txt`。無ければ出力に「祝日を数えていない」)。日付は UTC の暦、時刻から日への変換は明示の差(既定 +540 分)。時計を読まない。試験は子プロセスで `TZ=UTC` と `TZ=Asia/Tokyo` の結果が一致することを確かめる。

## 試験の結果(Windows、node 26)

`test-review-queue.mjs` 39件、`test-flow-observation.mjs` 15件、`test-adoption.mjs` 69件、`test-push-trigger.mjs` 27件、`test-gate-node.mjs` 25件、すべて期待と一致。本体: `npm run impl:write`・`lint:impl`・`impl:issues`・`test:fields` が通る。`verify-gate-contract.mjs` はテンプレートが未設定のため「構成が未設定」の注意だけで通る(新しい workflow での落ち方は、構成を設定した状態では確かめていない。落ちる場合は後回しの群で扱う)。全量の `npm run check` は流していない。

## 判断した点

- 営業日の期限は「N営業日後の日の末まで」。超過は「今日が期限の翌営業日以後」(日単位)。時間で見るもの(G-3 など)は時計時間。
- specs/ だけを変える PR は G-2 と G-4 を見分けられないため、長い方の期限(既定 48 時間)で見る(誤った催促を減らす側。開示済み)。
- D-0 節6 の宛先が節3「体制と運用形態」の決定者を指すとき、節3 の行が空なら既定の事業決裁者を使う(テンプレートの既定)。宛先が解決できなければ記名なしで出し、注意に書く。
- 期限を超えた者が宛先と同じ人のときの「組織上の任命権者」は、構成に持つ欄が無く、文面で触れるだけにした(本文は D-0 節6 の注記)。機械は解決しない。
- 台帳 `impl-untraced.yaml` に 5 ファイルを足した(library 3、試験 2 は infra)。**結線の後は試験 2 行を外してよい**。

## 結線で足す行(B20 の push の後)

- `.github/workflows/gate-g5.yml` の gate-contract のジョブへ(`|| true`・`if:`・`continue-on-error` を付けない):
  - `      - run: node scripts/gate/test-review-queue.mjs`
  - `      - run: node scripts/gate/test-flow-observation.mjs`
- 結線の後、`state=delivered check=machine test=template/scripts/gate/test-review-queue.mjs`(0283 は `test-flow-observation.mjs`)へ改め、`plan`・`issue`・`review` を外し、試験に `IMPL-NNNN:ng`・`:ok` の別の行があることを確かめる(現在の試験名は「IMPL-0680:ng …」の形で入っている)。ただし 0680・0681・0682・0979・0136・0212 はいずれも実物の GitHub で未確認のため、ADR-0126 決定5 のとおり「実機で確かめるまで scheduled」とするかを結線の担当が裁定する。
- `scripts/gate/config.mjs`: 休日の設定は足さなかった(祝日はファイル `.github/business-holidays.txt` を読む)。config への追加は不要。
- `/gate` の `SKILL.md`(`gate/gates` 配下ではなく入口)へ 0682 の差し戻しの手引き一文: 「指名先を確保できないときは、新しい判定依頼を作らず、起案者へ差し戻す」。B20 が `.claude/skills` の gate/gates を触るため、その後に足す。
- `.github/business-holidays.txt` の雛形は置いていない(任意のファイル)。採用者が置く。
- CHANGELOG・移行の注意: ワークフロー 2 本は既定で `schedule` により有効になる。採用者は不要なら削除する。

## 実物で確かめていない点

- GitHub 上での 2 つの workflow の実行(`gh api` の応答の形、`--paginate` の連結、権限 `issues: write`・`pull-requests: write` での書き込み、`pull_request_target` のラベル付与)。応答は固定の入力で確かめただけ。
- `risk/R1〜R3` のラベルがリポジトリに既にあるか。テンプレートに `risk/` のラベルの定義は無く、無ければ API が作る(色・説明は付かない)。
- `workflow_dispatch` は選んだブランチの定義で動く。dry-run を既定にした。
- タイムラインの `cross-referenced` で「作業単位を指す最初の PR」を近似した。`closes #N` の結び付きだけを見ているわけではない(言及した PR も数える)。要確認。
- 閉じた作業単位は窓の中の最新 100 件までに限る(API 呼び出しの数)。
