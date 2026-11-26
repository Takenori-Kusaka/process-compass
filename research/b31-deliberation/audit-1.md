# 束 B33(B31 の続き)独立の突合 1巡目 — U6a・U6b・U7 の全体

突合 2026-11-26。担当: 実装を見ていない別の文脈。対象: template `git diff b5f406f HEAD`(5145d6b・e68b20f。ブランチ wip/b33)、本体 `git diff e45c6140 HEAD`(research・graphify-out を除く)。基準: `ruling-1.md`(最優先)・`ruling-2-u6a-returns.md`・`ruling-draft-1.md`。ファイルは直していない。

## 実行で確かめたこと

- LF の写し(`git -c core.autocrlf=false archive`。`tmp/audit1/pos`。注: 既定の `git archive` は Windows で CRLF の写しになる。実装の記録の「LF の複製」がどちらで作られたかは未確認)で、test-adapter 225/225・test-exception-expiry 108/108(node 26.13.0、Windows)
- 陰性の確認(判定を1つずつ外した複製 `tmp/audit1/n_*`・`m_*`):

| 外した判定 | 結果 |
| --- | --- |
| 状態の値(exception-expiry.mjs の ACTIVE_EXCEPTION_STATES) | adapter 1件・expiry 1件が落ちた(ただし落ちた理由は「期限を過ぎている」の文。下の低2) |
| 受容した理由の記入 | adapter 1件が落ちた |
| 承認した者が AI の名義 | adapter 1件・expiry 1件が落ちた(段では名簿の照合が先に退ける) |
| 名簿に対応づかない指示者 | adapter 1件・expiry 1件が落ちた |
| `@` の指示者を受けない側へ倒す | adapter 1件が落ちた |
| 基底の ID を基底の内容で読む | adapter 1件・expiry 1件が落ちた |
| 区分「例外」 | adapter 1件が落ちた |
| PR の記録の経路と起動の経路の一致 | adapter 1件が落ちた |
| push のマージの照合の `merge_commit_sha` | adapter 1件が落ちた |
| 起動の経路(pull_request・push 以外を受けない) | **落ちない**(経路の一致の判定と取得側の problem が重ねて退ける。低3) |
| 基底の構成(`PIT_IN_BASE_CONFIG`)から名簿・AI の名義を読む | **落ちない**(中2) |
| `PIT_IN_POLICY_BASE` の欠如を受けない | **落ちない**(中2) |

- 本体: `npm run lint:impl`・`lint:evidence` は通過。`issue=445` の降りていないマークは IMPL-0931・1029(undelivered のまま)。IMPL-1036 は delivered・manual
- 責任者・承認者の欄の AI の名義: 差分に無い

## 所見

### 高1 手引きと README が、効かない回避の手順を案内している(表示と実態の食い違い)

- 所在: `template/.claude/skills/gate/reference/exception-paths.md:38`、`template/README.md:840`(「表示名で書くか、7.3 の例外承認を既定ブランチの台帳に先に入れる」)
- 実態: `mutation-stage.mjs` の `breachExceptionOf` は、PR の本文の `@` の指示者を**行に依らず** `instructorUnresolved` に入れる。`exception-expiry.mjs` の `mutationBreachExceptionFor` は、候補の行ごとに `if (instructorUnresolved.length) why.push(...)` で退ける。基底(既定ブランチ)の台帳にある行も同じに退けられる
- 入力: 本文に `## 作成を指示した者` `- @alice` を持つ PR-12。既定ブランチの台帳に先に入れた行 D-012(G-5 PR-12・印・未返却・期限内・承認した者は名簿の人)、承認した者本人の宣言行のレビュー(先頭一致)→ 段は「作成を指示した者 @alice(段は @アカウントを識別子で確かめられない)を名簿と対応づけられない」で失敗する。案内のとおりにしても通らない
- 由来: `ruling-2-u6a-returns.md` の2 が指定した文。裁定の文そのものがコードと食い違う
- 直し方の案: 案内から「7.3 の例外承認を既定ブランチの台帳に先に入れる」を削り、「表示名(名簿の記載の名)で書き直して、失敗したジョブを再実行する」だけにする(本文の編集で `edited` の起動が走る)。基底の行で受ける道を残したいなら、それは新しい挙動で、議長の裁定を要する

### 高2 ADR-0243 決定2 の4 が、状態の値を「未返却」だけと書くが、機械は「未回収」「有効」も受ける

- 所在: `src/content/docs/adr/0243-g5-mutation-breach-accepted-by-ledger-row-and-weekly-run.md:27`(「状態が有効を指す値(未返却)と完全一致する」)。コードは `exception-expiry.mjs` の `ACTIVE_EXCEPTION_STATES`(`['未返却', '未回収', '有効']`)
- 入力: 状態「有効」の行 → 段は受ける。ADR を読んだ者は受けないと読む。ADR の表示が機械より強い
- 裁定・案(`ruling-draft-1.md` §1.2 の5「ACTIVE_EXCEPTION_STATES のどれかと完全一致」)とコードは合っている。誤りは ADR の文
- 直し方の案(編集の指摘。意味を裁定に揃える): 「状態が有効を指す値(未返却・未回収・有効)のどれかと完全一致する」。手引きの「状態『未返却』」は書き方の勧めなので、そのままでよい

### 中1 IMPL-0996(delivered・machine)の note が、降りていない挙動を現在形で書き、裁定が採らなかった理由づけを残している

- 所在: `src/content/docs/phase4-process-design/exception-escalation.md:106` の note「…段 mutation が台帳の行で受けて gate-g5 を通す(…)ので、集約もこの行を常には欠落にしない。この集約の改め(…束 U6c)は降りていない。U6c の前は、G-5 の行は印の有無によらず常に欠落のままである」
- 起きること: 1文目が「集約はこの行を欠落にしない」と言い、次の文が打ち消す。delivered・machine の行の note の前半だけを読むと、実態(常に欠落)より弱い統制と読める。`ruling-1.md` §1.5 は、案 §2 の「段が行を結ぶので当たらない」を採らないとした。「段が受けて通すので、集約も欠落にしない」は同じ理由づけである
- 直し方の案: 前半を「段 mutation の閾値割れの行(…ADR-0243)は、出荷の集約の改め(束 U6c)の後に、常には欠落にしない行へ移す。U6c の前は…常に欠落のままである」と、予定の形へ書き換える。理由づけは §1.5 の「G-7 が見るのは行の形と帰属・期限だけ…(manual)」だけを残す
- 関連(低): ADR-0243 決定2 の「段と集約が…同じ関数で読む」(23 行)も、集約の側が U6c の前で未実装。決定5 が開示しているので低。直すなら「段が読む。集約は U6c で同じ関数へ寄せる」

### 中2 基底から読む2つの入力が、試験で固定されていない。取れないときに作業ツリーの側へ倒れる経路がある

- 所在: `template/scripts/gate/mutation-stage.mjs:189`(`let baseConfig = config;` で、`PIT_IN_BASE_CONFIG` が無ければ作業ツリーの構成)、`:187`(`PIT_IN_POLICY_BASE` の欠如)、`:211`(`git show` の失敗で `baseLedgerText` が null)
- 陰性の確認: `PIT_IN_BASE_CONFIG` を読む分岐を外しても、`PIT_IN_POLICY_BASE` の欠如の判定を外しても、225 件はすべて通った。冒頭のコメントと ADR-0243 決定3 は「規則は基底の構成から」「基底にある ID は基底の内容で読む」と言うが、どの試験もそれを固定しない
- 起きること: (a) 基底の構成を取り出せない実行(gate-g5.yml 465 行の `git show` が失敗。基底に process.config.json が無い取り込みの PR など)では、PR の側で書き換えた名簿・AI の名義で承認した者とレビューの書き手を照らす。(b) 基底の台帳を読めないと、基底の行もすべて「PR の中で足した行」として PR の側の内容で読む(期限・状態の書き換えが効く)。(A) のレビューは要るので、承認した者の目の前で起きる。ただし「取れない入力はすべて受けない側」(`breachExceptionOf` の冒頭のコメント)と食い違う
- 直し方の案: `PIT_IN_BASE_CONFIG` が無い・読めないとき、および `git show` が失敗したとき(台帳が基底に無いのか読めないのかを区別し、読めないとき)は `none(...)` で受けない。PR の側の構成に名簿の人を足した場面・基底の行の期限を書き換えて `PIT_IN_POLICY_BASE` を渡さない場面の ng を試験に足し、陰性の確認で落ちることを確かめる

### 中3 「GH_TOKEN を段のコマンドへ渡さない」の表示が実態より強い。受否の材料を、PR のコードを走らせた後に、PR のコードが書ける場所から読む

- 所在: `template/.github/workflows/gate-g5.yml:420`(「段のコマンド(PR 側のテスト)のステップへは渡さない」)、README 項目23(「GH_TOKEN を付けるのはこのステップだけ」)、`template/scripts/gate/adapter.mjs:190・199`
- 起きること: (a) `actions/checkout@v4` は既定で `persist-credentials: true` で、同じジョブのトークンを `.git/config` に残す。段のコマンド(PR の側の試験)はそこから読める。環境変数で渡さないことは事実だが、「渡さない」はそれより強く読める。(b) `mutation-pr-context.mjs` は PR の側のファイルで、トークンを持って走る。(c) `adapter.mjs` は段のコマンドを走らせた後(190 行)に `breachExceptionOf` を呼び(199 行)、`${RUNNER_TEMP}/pr-context.json`・`base-process.config.json`・作業ツリーの台帳を読む。PR の側の試験はこれらを書き換えられる(偽のレビューを持つ記録を書く)
- 程度: 段の出力の行自体を PR の側の試験が偽れる(EV-0339 の manual)ので、受否の偽りは既存の信頼の水準を下げない。新しい抜け道ではない。ただし、ADR-0115 決定1(変更のコードを実行しない判定は判定のコードと構成を基底から読み、変更の側の出力は信頼しないデータとする)との突合が ADR-0243 に無い。受否の判定(帰属の照合)は変更のコードを実行しない判定に当たる
- 直し方の案: (1) コメントと README を「環境変数としては渡さない。checkout が残す資格情報は段のコマンドからも読める」へ。または取得のステップの前の checkout に `persist-credentials: false` を付け、その試験を足す。(2) `breachExceptionOf` の入力(PR の記録・基底の構成・台帳)の読み込みを、段のコマンドを走らせる前へ移す(結果だけ後で使う)。(3) ADR-0243 の課さないと決めたことに「受否の判定は段のジョブ(変更の側)の中で行う。段の出力と同じ信頼の水準で、ADR-0115 決定1 の基底から読む判定には当たらない(EV-0339)」を1行足す

### 低1 実装の記録の「LF の複製」の作り方が残っていない

- `impl-u6a.md`・`impl-u6b-u7.md` は「LF の複製」で流したと書く。Windows の既定の `git archive` は CRLF の写しを作る(本突合で `file` が CRLF を示した)。結果は変わらなかったが、写しの作り方(`-c core.autocrlf=false`)を記録に残す

### 低2 状態が返却済みの行に、「期限を過ぎている」の誤った理由も出る

- 所在: `template/scripts/gate/exception-expiry.mjs:508`。`exceptionStanding` が closed を返すと `!== 'active'` で「期限(2099-01-01)を過ぎている」を足す
- 入力: 状態「返却済み」・期限 2099-01-01 → 理由に「状態が有効を示す値でない」と「期限を過ぎている」の両方。受否は正しいが、理由の文が誤り
- 直し方の案: 期限の文は `exceptionStanding(...) === 'overdue'` のときだけ出す

### 低3 起動の経路の判定(pull_request・push 以外を受けない)を単独で固定する試験が無い

- 所在: `mutation-stage.mjs` の `breachExceptionOf` の先頭。外しても経路の一致の判定と、取得の側の problem が重ねて退けるため落ちない(多重の防御)
- 直し方の案: `PIT_IN_EVENT=workflow_dispatch` と、`route: 'workflow_dispatch'` の整った記録の組の ng を1件足す。または、多重であることを impl の記録に開示する(作成者の排除と同じ扱い)

## 裁定との突合(食い違いなし)

- 印は固定語だけで、下限の書式・比較は無い(§1.2)。行の約束は8条件(区分・対象・印・状態・期限・承認した者・理由・帰属)
- `exceptionFor` は使わず、帰属は `exceptionReviewBacking`(§1.3)。`unjudgedGateExceptions` は変えていない(§1.1)
- push の照合は merged・`merge_commit_sha`・`base.ref` で、ちょうど1件(§1.3)。基底は `github.event.before`。(A) の先頭・作成者・本文は PR の記録から読む
- 週次は終了 0・比較の起点なし・schedule と workflow_dispatch だけ(§1.4)。IMPL-1036 は delivered・manual で、note に4点がある
- ADR-0243 は決定6 を「置き換える」と書き、ADR-0224 決定7 の原文を引く(§1.5)。返却の目安に上限が無いことを README に開示した
- IMPL-0931・1029 は undelivered のまま。EV-0347・0348 は別のマーク
- 既存の ADR との突合: ADR-0224 決定7(規制要件の段・空の段は受けない)・ADR-0151(未実施は 7.3 の対象外)・ADR-0200(印の読み方。ファストトラックの印と別)と矛盾しない。ADR-0115 決定1 は中3

## 件数

高 2・中 3・低 3。高はどちらも文の直し(コードは変えない)。重へ上げる条件(安全・新しい義務)には当たらない。高1 は裁定の文に由来するので、直し方は議長が決める。
