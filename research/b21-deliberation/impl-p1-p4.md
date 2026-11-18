# 束 B21 単位 P1〜P4 の実装の記録

作成 2026-11-18。裁定は `ruling-deferred-draft.md` の §2・§3.5(0231・0877)・§3.7(0175)・§3.2/§4.2(0217・0830 の共通の部分)・§3.1(0145)・§6・§7.1・§9。審議の重さは軽。template のブランチ b21(P1 = 6d33d69、P2 = c3a6773、P3 = 1678ef7、P4 = a9e542d。bundle は `tmp/bundles/template-b21-11.bundle` 〜 `-14.bundle`)。

## 全体の state

- 0231・0877: **`state=delivered check=manual`**(手引きの所在と確かめる者を note に書いた。降ろし先は `gate-skill`)
- 0175・0145・0217・0830: **`state=undelivered` のまま**(`check=manual plan=scheduled`)。新しい試験(`test-review-order.mjs`・`test-enforcement-inventory.mjs`)を `gate-g5.yml` へ結線できず、`test-pre-review.mjs` も未結線のため。note の先頭近くに「実装済み・結線待ち」と事実を書いた。0217・0830 は未決の部分(強制・経路と下限)も note に残した
- 降ろし先を追加: `review-order`(0175)・`enforcement-inventory`(0145)。`pre-review-automation` の description に必須応答・短縮の通知を足した。`impl-untraced.yaml` に新しい試験2件を足した(結線の後は外してよい)

## 項目ごと

| IMPL | 作ったもの | 試験(結果) | state | 採らなかった点 |
| --- | --- | --- | --- | --- |
| 0231 | `reference/sync-escalation.md` に節を足した。起案者が応答の宣言行の同じ行へ「意見として扱わない(理由: …)」を添える書き方と、決定者が判定の当日に上程の Issue で読み、判定記録の既存の欄(工程ゲートは「確認した項目」、会議体は「意見を述べた者と賛否・理由」)で確かめる書き方、理由を妥当と読めないときの扱い | 手引きのみ。`test-context-refs`・`test-claude-md-resident` 通過 | delivered | 様式 04 への欄の新設(第6章に無い) |
| 0877 | `gates/G-6.md` の手順13。反映の義務は無い・不採用は一言の理由を返信に残す・機械が数えるのは事前レビュー期間の宣言行(0216)だけ・AI の指摘の採否は README の採否の欄に従う。`.github/ai-review/README.md` は読んで確かめただけで変えていない | 同上 | delivered | 全ての PR コメントへの応答の集計 |
| 0175 | `scripts/gate/review-order.mjs`(ゲート・対象・リスク区分・ISO 週から項目を決定的に並べ替える。R3 は回さない。項目の文と番号は変えない。標準入力と引数の命令行)と、`/gate` の SKILL.md への手順の一文 | `test-review-order.mjs` 全通過(同じ種で同じ並び・同じ週は同じ・週が変われば変わる・項目の集合不変・R3 不変・TZ=UTC と Asia/Tokyo で同一・命令行) | undelivered | `/human-verify` の検証の順序を回す案。見出し・欄の行を並べ替えの入力にすること |
| 0217(軽の部分) | `pre-review.mjs` に `requiredOwners`(CODEOWNERS をファイルごとに最後に当たった行で引く)と、判定資料の所在が PR を指すとき(`.../pull/N` か `PR #N`)の必須応答の記載、指名レビュアに含まれない者の表示、締切で記名の応答が無い者を D-0 節6 の宛先へ通知。PR の変更ファイルは `fetchPrFiles`(読み取りだけ)で読む。workflow に `pull-requests: read` を足した | `test-pre-review.mjs` 103 件全通過(うち新規: 導出・不在・読めない・冪等・締切前後・AI と起案者の除外) | undelivered | 条件 → ロールの対応表の新設。SC-M(`protectedPaths`)・CL2 以上の行(`safetyRelated`)の導出(下の「変えた点」) |
| 0830(共通の部分) | 判定資料の公開が T の5営業日前(R1 は10)より遅い場合を短縮として検出(公開済みは題名の改めの履歴 `publishedAt`、未公開は期日を過ぎたこと)。対象を当該の Issue か判定資料の PR とするファストトラックの行(ADR-0200 の印)が台帳に無ければ、起案者と節6 の宛先へ通知。行があれば注意に「短縮の経路と下限は未決(EV-0281)。通知しない・合格ともしない」だけ | 同上(新規: 通知・期間どおり・行あり・別対象の行・印の無い行・草案のまま・台帳なし・R1・冪等・履歴の読み) | undelivered | 経路と下限(Q2)の実装。行の有効性・限定列挙・制約の照合(7.4 の IMPL-0608〜0610) |
| 0145 | `scripts/gate/enforcement-inventory.mjs --quarter YYYYQn`(窓の中の、検査装置を対象とする是正の記録の行と、Actions のワークフロー・ジョブごとの失敗の回数・最後の失敗の日。対応は文字列の一致。読めないときは「読めない」) | `test-enforcement-inventory.mjs` 全通過(失敗 3 件のジョブが出る・是正の行が対応づく・窓の外と製品の行を除く・日付を読めない行・読めない場合・TZ 同一) | undelivered | 集約への組み込み、削除の候補の選定、合否への使用 |

## 判断した点・裁定の案から変えた点

- **0217: SC-M・CL2 以上の構成要素の行を導出しなかった**。案は「`protectedPaths`・`safetyRelated` の規則を同じく使う」としたが、これらは対象パスを示しても、どの人・ロールが必須応答かを定めていない。ロールを決めるには条件 → ロールの対応表が要り、それは案自身が採らない案に挙げている。よって CODEOWNERS の行だけを導出し、残りは手引き(起案者と決定者)に残すと note に書いた
- **0217: 記載の置き場は上程の Issue へのコメント**。案の「判定資料へ記載」は、判定資料(人が書く)の本文を機械が編集しない形にするため、機械のコメントとした。判定資料の所在が PR のとき、判定資料の Issue の草案は機械が起票するが、必須応答の記載はそこへ入れない
- **0217: 締切の通知は `required-miss`**。記名の応答は上程の Issue のコメントの賛否の欄だけを数え、PR 上のレビューは読まない(コメントと note に書いた)。通知の文に「判定を止めません」と書いた
- **0830: 期日の超過の検出は、公開済みなら題名の改めの履歴、未公開なら現在の日付で行う**。案は「公開が T の5営業日前より遅いか、締切が T−2 より遅い」とした。締切は機械が T から導くため、T を直さない限り遅れず、観測できるのは公開の遅れだけと判断し、締切の遅れの検出は作らなかった。判定資料の所在(外部の URL など)で公開された場合は時刻を知れず、遡っての検出はしない
- **0830: 行の照合は有効性を問わない**。案は「対象を当該の Issue か PR とする印の行が台帳に無ければ」。返却済みの行などの有効性は 7.4 の別の項目が追うため、ここでは見ない。行があれば当否は人に残る

## 試験の結果(Windows、node 26)

`test-review-order.mjs`・`test-enforcement-inventory.mjs`・`test-pre-review.mjs`(103 件)・`test-adoption.mjs`(69 件)・`test-push-trigger.mjs`(27 件)・`test-review-queue.mjs`(54 件)・`test-flow-observation.mjs`(22 件)・`test-gate-node.mjs`・`test-context-refs.mjs`・`test-claude-md-resident.mjs` すべて期待と一致。本体: `npm run impl:write`・`lint:impl`・`impl:issues`・`test:fields` が通る。全量の `npm run check` は流していない。

## 結線で足す行(B20 の push の後)

- `.github/workflows/gate-g5.yml` の gate-contract のジョブへ(`|| true`・`if:`・`continue-on-error` を付けない):
  - `      - run: node scripts/gate/test-review-order.mjs`
  - `      - run: node scripts/gate/test-enforcement-inventory.mjs`
  - (`test-pre-review.mjs` の行は単位11・12 の記録のとおり)
- 結線の後、0175(`target=review-order`)・0145(`target=enforcement-inventory`)を `state=delivered check=machine test=template/scripts/gate/test-review-order.mjs`(0145 は `test-enforcement-inventory.mjs`)へ改め、`plan`・`issue`・`review` を外す。note の「実装済み・結線待ち」を事実に改める。0217・0830 は結線の後も undelivered のまま(強制・経路と下限は所有者の決定待ち)で、note の「結線が B20 の push の後」を外す
- `impl-untraced.yaml` の新しい試験2件の行を外す
- CHANGELOG・移行の注意: `pre-review.yml` の権限に `pull-requests: read` を足した(必須応答の導出のため)。`/gate` の SKILL.md に提示の並びの手順を足した。`review-order.mjs`・`enforcement-inventory.mjs` は新規の道具で、既存の判定を変えない
- 週ごとの棚卸し: `enforcement-inventory.mjs` を四半期の運用カタログ(棚卸しの行)から呼ぶ案内は、運用カタログ側の編集になるためこの単位では足していない

## 実物で確かめていない点

- GitHub 上での `pre-review.yml` の実行(PR の変更ファイルの取得、`issues/N/events` の `renamed` の形、`pull-requests: read` で足りるか)。応答は固定の入力で確かめただけ
- `enforcement-inventory.mjs` の `actions/runs?created=…` の応答の形、保持期間・権限の外のときの失敗の形(例外を「読めない」に包んだだけ)、実行数が多いリポジトリでの呼び出しの量(失敗した実行ごとにジョブの記録を読む)
- `/gate` の SKILL.md の一文に従って人が `review-order.mjs` を使うかどうか(運用)
- CODEOWNERS の型の解釈は `roster-ids.mjs` の `codeownersMatch`(既存。GitHub の仕様との完全一致は未確認)

## 突合

- ADR-0040(様式に欄を足さない): 0231 は既存の欄で受け、様式 04 を変えていない
- ADR-0200(印の再利用): 0830 は既存のファストトラックの印を読み、新しい印を足していない
- ADR-0126 決定5: 実物で確かめていない新しい検査(0175・0145・0217・0830)は delivered にしていない
- 未決の規則を固めていないか(0830): 行の無い短縮の通知は A・B どちらの読みでも違反に当たる部分に限り、行がある場合は通知も合格もしない。経路と下限を決める分岐を持たない
