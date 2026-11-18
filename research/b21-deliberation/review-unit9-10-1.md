# 束 B21 単位9・10 の独立の突合 1巡目

作成 2026-11-18。対象は template `9833089..4ed8e38`(b1414b0・4ed8e38)と本体 `410e6f43`。裁定は `research/b18-deliberation/ruling-a1.md` §2.1・§2.2・§2.4・§3.7・§3.8・§5・§7。写しは `git -C template archive 4ed8e38` で取り出した(作業物 `scratchpad/review9-1/`。反例の台本は `cx.mjs`)。実装の記録 `impl-unit9-10.md` は所見をまとめた後に読んだ。

件数: **高 2・中 6・低 9**

## 高

### H1 IMPL-0682 の note とコメントの文が、まだ無い手引きを有るものとして示す

- 根拠: `gate-criteria.md:2514` の note「差し戻しは手引き(人)」。`review-queue.mjs:179` のコメントの文「起案者へ差し戻します(/gate の手引き)」。裁定 §3.7 は「`/gate` の SKILL.md に一文」を求めた。`impl-unit9-10.md` の「結線で足す行」は、この一文を**未記載**とし、残作業に回している。写しの `.claude/skills/gate/` に該当の文は無い
- 再現: `grep -rn "差し戻" <写し>/.claude/skills/gate/SKILL.md` で該当が無い
- 食い違い: 台帳と PR のコメントは「手引きがある」と読ませるが、手引きの文は無い(過大な表示)
- 直しの案: note を「差し戻しの手引きの一文は未記載(B20 の後に `/gate` の SKILL.md へ足す)」に改める。コメントの文から「(/gate の手引き)」を外すか、一文を足すまで「手引きは未整備」と書く

### H2 6項目の note に、実装の前の「無い」「未実装」の文が残り、前置きの「実装済み」と食い違う

- 根拠: 前置き「実装済み・結線待ち」の後に、旧い文が残っている
  - `exception-escalation.md:245`(0979)「準拠テンプレートに期限超過の検出と宛先への通知を運ぶ仕組みは無い」
  - `gate-criteria.md:2477`(0681)「催促と通知の置き場は準拠テンプレートに無い」
  - `gate-criteria.md:2514`(0682)「同時保有数を数える置き場は無い」
  - `gate-criteria.md:2458`(0680)「レビュー依頼の宛先を読まない。合う降ろし先が無く」
  - `roles-responsibilities.md:1143`(0212)「未実装は、ラベルの自動付与だけである」
  - `gate-criteria.md:2236`(0136)「降りた部分: 識別と時計時間の分布の観測」(今回の検出を含めていない)
- 食い違い: `state=undelivered` 自体は正しい(結線の前で、要件3 を満たさない)。ただし台帳に出る note の本文は、同じ行で「実装済み」と「無い」を同時に述べる。降ろし先の種別も `template-file` へ改めたため、「置き場が無い」は事実と違う
- 直しの案: 旧い文を「2026-11-15 時点では無かった」と日付つきの経緯へ移すか、削る。0136 の「降りた部分」に review-queue.mjs の検出を足す

## 中

### M1 レビューの依頼の付け直しで、催促と同時保有数から外れる

- 根拠: `review-queue.mjs:161` の `respondedBy` は、依頼の時刻と比べずに「その者のレビューが1件でもあるか」を見る。`fetchSnapshot`(244〜246行)は最新の依頼の時刻を持つため、過去にレビューした者へ依頼し直すと、応答済みとみなされる
- 再現: `cx.mjs` の 2・2b。過去に COMMENTED のレビューがある者へ 11-09 に依頼し直すと、11-16 でも `nudge` が出ない。4件目の保有が数えられず `load:busy` が出ない
- 直しの案: 応答を「依頼の時刻より後のレビュー」に限る(`r.at > rq.at`)。付け直しの場面を試験へ足す

### M2 判定完了時間の起点と終点が、条文の定義からずれる

- 根拠: 第4章「2つの時刻を分ける」は、判定完了時間を「レビュー依頼から判定の確定まで」と定める。D-0 節5 は「上程の受理日から起算」とする。実装の起点は `readyAt ?? createdAt`(`review-queue.mjs:201`)。終点は、だれかの APPROVED が1件でもあること(199行)
- 再現: `cx.mjs` の 3a〜3c
  - 3a: APPROVED の後に CHANGES_REQUESTED が付いても、超過の通知が出ない
  - 3b: ボットの APPROVED で通知が止まる(`aggregate-evidence.mjs:299-300` は、書き込み権限の無い者の承認と古い commit の承認を数えない。この扱いと揃っていない)
  - 3c: 依頼が金曜の PR でも、作成の日から数えて月曜に超過が出る
- note(0979)は起点と終点を開示していない
- 直しの案: 起点は最初のレビュー依頼(無ければ ready の時点)とする。条文が二つあるため、どちらに寄せたかを note に書く。終点は「各レビュアの最新の状態が APPROVED で、ボットでない」などに寄せる。寄せない場合は、その近似を note で開示する

### M3 機械が付けた `risk/R3` が、後の push で下限が R1 に上がっても更新されない

- 根拠: `review-queue.mjs:220` は、`risk/*` が1つでもあれば何もしない。人が付けたラベルと、機械が自ら付けたラベルを区別しない
- 再現: `cx.mjs` の 8。`risk/R3` が付いた PR へ `src/auth/**` の変更を push すると、結果は `null`(R3 のまま)
- 影響: G-5 は本文の区分を照合するため、統制は外れない。ただしラベルが下限と食い違ったまま残り、レビュアを誤らせる
- 直しの案: 機械が付けたラベル(事象の actor が github-actions)だけを、下限へ引き上げる。下げる操作はしない。人が付けたラベルには触れない(§5 の「人の操作を覆さない」を保つ)

### M4 着手の時点の近似(cross-referenced)が、作業単位より前の時点を起点にしうる。note で開示していない

- 根拠: `flow-observation.mjs:37` は、言及元の PR の `created_at` を着手の時点に取る。言及した時刻ではない。`closes` で結び付いた PR かどうかも問わない。言及元が他のリポジトリの PR でも数える
- 再現: `cx.mjs` の 9。2026-01 に作られた PR が 11-10 に Issue を言及すると、着手の時点は 2026-01-01 になる。Issue が作られる前の日付で、即座に滞留の通知が出うる
- 裁定 §3.8 の定義は「作業単位を指す最初の PR が開かれた時点」である。「言及」は「指す」より広い。実装の記録はこの点を「要確認」としているが、IMPL-0283 の note(`lifecycle.md:644`)は「着手した時点はテンプレートの定義」とだけ書く
- 直しの案: 起点を `max(PR の作成, Issue の作成)` で下から抑える。同じリポジトリの PR に限る。可能なら `connected` の事象か、本文の closes キーワードに限る。近似を残す場合は note に「言及した PR を数える近似」と書く

### M5 観測の窓 90 日と最小標本 10 件が、新しい定義として根拠のマーク無しに入っている。単位8 の定義とも揃っていない

- 根拠: `flow-observation.mjs:21-22`。裁定 §3.8 の「観測の窓の中」は、単位8(`next.mjs` の `completionThroughput`)が企画書の欄から読む「観測の窓」と同じ語である。単位8 は「完了」を「既定ブランチへ取り込んだ PR が closes で結び付き、完了の理由で閉じた」と定める。flow-observation は `state_reason === 'completed'` だけを見る。同じテンプレートに、完了した作業単位の定義が二つできる
- note は 90・10 の値を開示していない(所有者の方針「細かい定義を増やさない」・ADR-0026)
- 直しの案: 窓は企画書の欄(`next.mjs` と同じ読み方)から取り、完了は単位8 の判定を共用する。値を持つなら、note に値と根拠水準(暫定)を書く

### M6 IMPL-0212 の降ろし先が、実装の所在と違う

- 根拠: `roles-responsibilities.md:1143` は `target=pre-review-automation`。この降ろし先は `kind: planned`・`path: scripts/pre-review/`(`impl-targets.yaml:351-355`)。実装は `review-queue-control.yml` の `risk-label` のジョブにある。裁定 §3.7 の表がこの降ろし先を指定しているため、裁定の段の不整合である
- 影響: 結線の後に `delivered` へ改めると、`planned` の降ろし先は検査が落とす(`implementation-marking.md:114`)。台帳の降ろし先の列は、実装の無い置き場を示す
- 直しの案: 降ろし先を `review-queue-control` へ改める。または `pre-review-automation` の path を改める。結線の担当への申し送りに明記する

## 低

- L1 `--paginate` の連結を `/\]\s*\[/g` の置換で解くため、本文の中の `][` も `,` に変わる(`review-queue.mjs:233-235`、`flow-observation.mjs:80-83`。`cx.mjs` の 6 で `[a][b]` が `[a,b]` になった)。印の照合には効かない。直しの案: `gh api --paginate --slurp` を使う
- L2 重複を防ぐ印を、だれのコメントでも受け付ける(`review-queue.mjs:138`、`flow-observation.mjs:67`)。印を書けば通知を止められる(`cx.mjs` の 4b)。直しの案: 印は github-actions[bot] のコメントに限る
- L3 暦の日への変換は、日本時間 +540 分の固定(`business-days.mjs:17`)。workflow は `--offset-minutes` を渡さず、夏時間にも対応しない。コードのコメントには書いてあるが、note には無い。直しの案: `vars` で差を渡せるようにし、note へ一言書く
- L4 「祝日を数えていない」は、実行の記録(stdout)には出るが、PR へのコメントには出ない(`review-queue.mjs:152,303`)。§2.4 の「出力」の読み方による。直しの案: 催促の文に一言足す
- L5 0680 の判定が、`requested_reviewers` ではなく事象から組んだ `requests` を見る(185行)。対応する事象が欠けると、チームだけと誤って出る(`cx.mjs` の 7)。直しの案: 0680 の判定は `requested_reviewers` が空であることで行う
- L6 schedule の concurrency は `run_id` の組で、手動の非 dry-run と時刻の起動が重なると、同じ通知が2回出うる。権限は workflow の全体で与えており、ジョブごとに絞れる(queue と risk-label は `pull-requests: write` で足り、flow は `issues: write` だけで足りる)
- L7 `context/decisions/` だけを変える PR は G-3 の時間だけで見て、G-6 の判定期限を見ない(`hoursGateOf`)。裁定 §3.7 の「G-6 は全ての PR」とずれる。G-3 のほうが短いので実害は小さい
- L8 note の語の混在: 0681・0979 は「D-0 表3」と「D-0 節6」を併記している。テンプレートでは節6、標準では表3。結線の時期は note が「B20 の push の後」、裁定 §7 が「B15 の push の後」と書く。§8 の移管の後の読みとして、どちらを指すか記録で揃える
- L9 0682 は「未応答の指名」を数える(裁定どおり)。条文の制御1 は「判定待ちとして同時に抱える件数」で、応答した後も判定待ちの PR は数えない。note で開示する

## 確かめて問題なし

- 試験: `test-review-queue.mjs` 39件、`test-flow-observation.mjs` 15件が通る(写し、node 26.13)。試験の子プロセスへの `TZ` の受け渡しが効くこと(America/New_York で getHours=19)を確かめ、TZ の試験が空振りでないことを見た。`cx.mjs` を TZ=UTC と America/New_York で流し、出力が一致した
- 営業日: 年末(12-31→01-01、祝日のファイルあり→01-04)、月末、土曜の起点、00:00 の前後(14:59:59Z と 15:00:00Z は JST で別の日)、0 件・空の D-0(既定と注意を出す)、取り下げ(`requested_reviewers` に無い依頼を外す)、ドラフトの除外、同じ状態の2回目の実行で通知が0件(冪等)
- workflow: `pull_request_target` は既定ブランチを checkout する。`persist-credentials: false`。PR の番号だけを env で渡し、`${{ }}` を run に直に埋めていない。`pull_request`・`pull_request_review` は使っていない。ジョブ名に gate-g5 は無い。`actions/checkout@v4`・`setup-node@v4` と `.github/gate-node-version` は既存の流儀に合う。fork の PR でも PR の側のコードは実行しない。GITHUB_TOKEN が付けたラベルは gate-g5 を起動しないため、循環は無い。必須チェックは変えていない
- 所有者の方針: 指名・ラベルの取り消し、再割り当て、自動承認は無い。ラベルは「無ければ付ける」だけ。機械の判断は日時の比較・件数・有無だけ
- 触ってはならないファイル: template の差分は新規 7 ファイルと `preflight.mjs` の `TEMPLATE_WORKFLOWS` の1行だけ(§2.2 が許す)。`gate-g5.yml`・`config.mjs`・`check-pr`・`check-g1`・`autonomy`・`aggregate-evidence`・様式・README・settings.json・`verify-gate-contract` は差分に無い
- 既存の検査: `test-adoption.mjs` 69件(ワークフローの一覧が `TEMPLATE_WORKFLOWS` と一致)、`test-push-trigger.mjs` 27件、`test-gate-node.mjs` 25件、`test-base-judge-workflow.mjs` 127件が通る。`verify-gate-contract.mjs` は終了コード 0(構成が未設定の注意だけ。構成を設定した状態では確かめていない)。本体の `lint:impl` は終了コード 0
- 規約: 降ろし先の種別 `planned`→`template-file` は、実在するファイルを指すため `implementation-marking.md:113-118` に合う。`impl-untraced.yaml` の library 3・infra 2 は、`delegation.mjs` の前例(library)と同じ扱い。`state=undelivered` は §7(結線の前は delivered にしない)に合う

## 実装の記録との突き合わせ

- 記録は、cross-referenced の近似を「要確認」と書く。ただし note へは移していない(M4)
- 記録は、0682 の手引きの一文を未記載の残作業とする。note とコメントの文は、有るものとして書く(H1)
- 記録は「承認済みは出ない」を試験で確かめたとするが、承認の後の差し戻しとボットの承認は確かめていない(M2)。依頼の付け直しも確かめていない(M1)
- 記録の「実物の GitHub で未確認」は、workflow の冒頭のコメントと note に開示されている。食い違いは無い
