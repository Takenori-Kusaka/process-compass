# 束 B31 U6a の実装の記録

実装 2026-11-20。template のブランチ `b31`、コミット 5145d6b(push しない)。bundle: `E:/Github/process-compass/tmp/bundles/template-b31-01.bundle`。裁定 `ruling-1.md` に従った。

## 変えた挙動

- 段 mutation は、閾値割れ(終了コード 0・行の構文が正しい・スコア < 基底の閾値)のときだけ、台帳の行で受ける。受けたときは終了 0 で、出力に `閾値割れを第7章 7.3 の例外承認 D-NNN で受けた(score・閾値・承認した者・返却の目安・survivors)` の1行を出す。受けないときは従来どおり失敗で、候補の行ごとの理由・案内(行が無い場合は行の書き方の所在)・「失敗したジョブの再実行」の案内を足す。最初の1行(`スコア X が閾値 Y に届きません`)は従来と同じ文。
- 受けない(従来のまま失敗): 段が空・閾値未設定・出力の行なし/壊れ・コマンドの終了コードが 0 でない・workflow_dispatch / schedule・PR の記録が無い/取得失敗。規制要件の段は触っていない。
- `unjudgedGateExceptions` は変えていない(試験で G-5 PR-12 の行も欠落になることを固定)。

## 関数の名と所在(template/scripts/gate/)

- `exception-expiry.mjs`: `MUTATION_BREACH_MARK`、`mutationBreachMarkOf`(NFKC・`*` `` ` `` `_` を除いて先頭一致)、`mutationBreachExceptionFor`(8 条件。日付は引数。帰属は `exceptionReviewBacking` の (A) だけ。基底にある ID は基底の内容で読み、PR の中で足した行は (A) が要る)。
- `mutation-stage.mjs`: `breachExceptionOf`(環境・PR の記録・台帳を読んで上を呼ぶ。取れない入力はすべて受けない側)、`evaluateMutation` に `exceptionOf` を追加。`adapter.mjs` は `localDay()` を渡す。
- `mutation-pr-context.mjs`(新規): `buildContext`・`fetchReviews`・`pickMergedPr`。`REVIEWS_JQ` は gate-g5.yml の pr-rules と同じ式(試験が一致を確かめる)。

## workflow の入力(gate-g5.yml の mutation ジョブ。gate-g5.yml は workflow_call でも使うので push の workflow は触っていない)

- 新ステップ「PR の記録の取得」(setup-stack の前): `GH_TOKEN`・EVENT_NAME・REPO・SHA・DEFAULT_BRANCH・PR_* を持つのはこのステップだけ。出力の所在を `PIT_IN_PR_CONTEXT` に入れる。失敗しても終了 0(problem を書いた JSON)。
- 既存ステップに `PIT_IN_POLICY_BASE` を足した(PR は `origin/<既定ブランチ>`、push は `github.event.before`)。
- 権限: top-level の `contents: read / pull-requests: write / issues: read` のままで足りる(読むのは `pulls/N/reviews`・GraphQL の reviews.editor・`commits/{sha}/pulls`・`pulls/N`。いずれも PR・contents の読み取り)。権限の追加なし。実 GitHub の応答では確かめていない。
- push の照合: 先頭をマージのコミットとし、merged、base.ref が既定ブランチの PR がちょうど1件。一覧に merged の欄が無い場合に備え、PR 1件の記録で確かめ直す。

## 試験(LF の複製 tmp/b31/tplcopy で Windows の node 26.0 により実行)

- test-adapter 198 件通過(うち新規 約 50 件: 段の実行の ok 7 / ng 約 27、pickMergedPr・buildContext・fetchReviews・workflow の形)。ok: CL3・R1・PR の中で足した行・強調の印・下限なし・閾値を変える PR で基底の閾値 80 で読む・push で PR の先頭が HEAD と異なる。ng: レビューなし/先頭不一致/作成者/空欄/名簿外/AI/返却済み/期限切れ/読めない期限/別の PR・PR-120・PR #12・G-6/区分違い/印が先頭でない/理由空/指示者/@指示者/基底の期限の書き換え/レビュー読めない/編集済み/別 ID/終了コード 1/段が空/行なし/PR の記録なし・problem・経路不一致。push の 0件・2件・base.ref 不一致・取得失敗。
- test-exception-expiry 108/108(新規 17)。
- 関係する検査: test-g5-aggregate 61、test-aggregate-wiring 全65、test-push-trigger 27/27、test-init-g5(208 ok・NG 0)、test-g5-missing・test-control-approval 48/48・test-enforcement-inventory・test-handover-items・test-context-refs すべて通過。verify-gate-contract は構成が未設定のため形を判定しない(notice)。回帰の全量は流していない。

## 陰性の確認(tmp/b31/neg/ に複製)

- 期限の判定を外す: 3 件の ng が落ちた(期限が過去・翌日・基底の期限の書き換え)。
- 先頭一致を `includes` にする: 「印が先頭でない」が落ちた。
- 印の判定を外す: 「印が先頭でない」が落ちた。
- 作成者の排除を外す: **落ちなかった**。(A) の `exceptionReviewBacking` が同じアカウントのレビューを「PR の作成者」として先に退けるため(多重の防御)。行の側の排除は理由の文言を早く出すだけで、単独では ng の試験で観測できない。外した複製では落ちない事実を開示する。

## 議長へ返す点

1. 作成者の排除は上のとおり (A) と重複する。行の側の判定は残したが、残す価値(文言のため)か削る(重複した定義を持たない)かは議長の判断。
2. `@アカウント` で書かれた作成を指示した者は、段がトークンを持たず識別子で確かめられないので、対応づかないものとして受けない側へ倒した(drafter の点)。`@` の指示者を書いた PR では閾値割れを台帳の行で受けられない。手引き(U6b)に書く必要がある。
3. 台帳の行の約束は `exceptionFor`(check-pr)と別の関数として持つ(check-pr は B30 の範囲で触れない)。状態・理由・指示者の読みは同じ部品だが二重の定義である。drafter が挙げた「両関数の ng の理由の集合の一致の試験」は足していない(`exceptionFor` は `PR #N` 形式のみで入力の形が違う)。
4. gate-g5.yml の既存コメントの「最後の実行を再実行する」は全体の再実行の案内のまま、段 mutation の行は「失敗したジョブの再実行」で足りる旨を括弧で足した。

## 未確認

- 実 GitHub での応答(`commits/{sha}/pulls` の merged 欄・merge_commit_sha・merge commit/rebase/merge queue の挙動)、`gh api --paginate` の出力の継ぎ目(`][`)の扱い、権限が足りること。いずれも新しい根拠水準マークで開示する(U6b の担当)。
- WSL の node では流していない。CRLF の作業ツリーのため、LF の複製で流した。
- mutation-stage.mjs の冒頭コメント(機械が見る範囲)は未更新。
