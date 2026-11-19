# 束 B26 独立の突合(1巡目・全体)

- 日付: 2026-11-19
- 見た差分: template `ad21a42..aef21e3`(6 コミット)、本体 `0abee9b9~3..1f8fedf8`(`src/`・`research/sources/`・`template`)
- 突き合わせた相手: 2.10.4〜2.10.6(lifecycle.md)、3.9.3(roles-responsibilities.md)、5.7.5(human-ai-boundary.md)、7.6、第6章 様式 06、implementation-marking.md、evidence-marking.md。裁定(ruling-1・2)は最後に読んだ
- 件数: **高 3・中 4・低 6**

## 流した試験

| 試験 | 結果 |
| --- | --- |
| test-flow-observation.mjs | 30 件一致 |
| test-brief-estimates.mjs | 37 passed, 0 failed |
| test-review-order.mjs | すべて期待どおり |
| test-adoption.mjs | 83 件一致 |
| test-next-records.mjs | 140 件一致 |
| test-enforcement-inventory.mjs | すべて期待どおり |
| test-records.mjs | 95 件一致 |
| 本体 lint:evidence・lint:impl・lint:sources・test:fields・lint:scope | すべて通過 |

### 実装を一時的に壊して落ちるかの抜き取り(すべて戻した。最後に `git -C template status` が空)

| # | 壊した箇所 | 落ちたか |
| --- | --- | --- |
| M1 | adoption-trial.mjs `numberCited` の `(?![0-9])` を外す | 落ちた(IMPL-0497:ng 番号の境界) |
| M2 | next.mjs の `if (gapNote) result.notes.push(gapNote)` を外す(/pit へ出さない) | **落ちない**(test-next-records・test-adoption とも全件一致) |
| M3 | flow-observation.mjs の main で `agreed = null`(企画書を読まない) | **落ちない**(30 件一致) |
| M4 | 合意した値を標本が足りるときだけ使う | 落ちた(IMPL-0283:ok 標本 0 件) |
| M5 | 強調の様式を常に 0 | 落ちた(IMPL-0175:ok 隣り合う週) |
| M6 | `adjustmentRecordCount` の `undated++` を外す | 落ちた(IMPL-0954:ng) |
| M7 | `readMissedTypes` の目隠しの絞り込みを外す | 落ちた(IMPL-0497:ok 3 件) |
| M8 | next.mjs `flowSection` から `adjustments:` の受け渡しを外す | **落ちない**(140 件一致) |

## 所見

### 高-1 IMPL-0497 の note の「残る誤りは偽陽性の側」が実装と合わない(表示と実態)

- 所在: `src/content/docs/phase4-process-design/gate-criteria.md` の IMPL-0497 のマーク(「残る誤りは一覧に余分に出る側(偽陽性)である…安全側に倒れる」)、`template/scripts/gate/adoption-trial.mjs` の `correctionGaps`(`t.includes(ty)`)と `numberCited`
- 再現(関数へ直接入れた):
  - 見逃した類型「境界」に対し、対象の欄「境界値分析」の行 → 欠け 0 件(類型の名は採用者が自由に書く文字列で、部分一致で覆われる)
  - 起点 #12 に対し、別のリポジトリの `https://github.com/other/repo/pull/12` の行 → 欠け 0 件
  - 起点 #12 に対し `#12a` の行 → 欠け 0 件
  - 別の起点(#15)の行が「#12 と同じ類型」と書けば、#12 の行が無くても欠け 0 件
- 偽陰性(欠けがあるのに出ない)が実在するので、「安全側に倒れる」という主張は誤り。裁定 2.5 の「完全一致の包含」とも、部分一致の実装は食い違う
- 直しの案: (a) 類型の名は区切り(行頭・行末・空白・句読点・括弧)で囲まれた一致にし、`/pull/N` は同じリポジトリの URL に限る。(b) それでも残る偽陰性(別の起点の行が番号を言及しただけ)は note に書き、「偽陽性の側に限る」を消す

### 高-2 IMPL-0497 の `check=machine` は、入口(/pit)への結線を試験していない(表示と実態)

- 所在: 同マーク(`check=machine test=template/scripts/gate/test-adoption.mjs`)、`template/scripts/gate/next.mjs` の `computeNext` の IMPL-0497 の段
- 根拠: 規定は「/pit が品質保証の担当の次の一手として出す」で、入口についての規定である。implementation-marking.md の `machine` の要件の箇条は「規定が入口(コマンド・スキル)についてのものなら、関数を直接呼ぶ試験では足りない。入口を通す試験を名指す」と書く。試験は `correctionGapNote` を直接呼ぶだけで、抜き取り M2(next.mjs の注記への push を外す)で全試験が通った
- 直しの案: `computeNext`(または `next.mjs` の命令行)を一時の作業領域で通し、欠陥の台帳が無く注入の記録に見逃しがある場合に注記が出る ng と、そろった場合に出ない ok を足す。足すまでは `check=manual` に下げ、機械の部分の試験は関数までと note に書く

### 高-3 IMPL-0283 の `check=machine` は、企画書を読む経路を試験していない(表示と実態)

- 所在: `src/content/docs/phase4-process-design/lifecycle.md` 644 行の IMPL-0283(「企画書(docs/project-brief.md)の欄…があればそれを使い」)、`template/scripts/gate/flow-observation.mjs` の `main`(`process.env.PIT_IN_BRIEF ?? 'docs/project-brief.md'` を読み `stagnationThresholdOf` へ渡す)
- 根拠: 試験は `flowActions` に `agreed` の値を直接渡し、`stagnationThresholdOf` を別に試すだけで、両者を結ぶ main を通らない。抜き取り M3(main で `agreed = null` にする)で 30 件すべて通った。企画書を読まなくなる退行を試験が拾わない。高-2 と同じ要件(入口を通す試験)に当たる
- 直しの案: `PIT_IN_BRIEF` に一時の企画書を置き、`gh` を差し替えて(または `--dry-run` の出力で)main を通す ok/ng を足す。足すまでは `check=manual` に下げる

### 中-1 欄の値に「85パーセンタイル」の語があると、合意した値を注意なしに捨てる

- 所在: `template/scripts/gate/brief-estimates.mjs` の `stagnationThresholdOf`(`/85\s*パーセンタイル/` を数値より先に見る)
- 再現: 「5日、または85パーセンタイル」「85パーセンタイル、または 5日」→ `percentile`(注意なし)。様式の例の文を一部だけ書き換えた「3日(実測サイクルタイムの85パーセンタイルではなく合意した値)」のような書き方も `percentile` になる。一方「3日(G-1 で合意)」は `unreadable` で注意が出る。同じ「合意した値が読めない」状況で、注意の有無が語の有無で割れる
- 害: 合意した短い値が使われず、その値と85パーセンタイルの間の項目に通知が出ない。注意も出ないので価値責任者は気づけない
- 直しの案: 語を含み、かつ数値と単位(日・週)も含む値は `unreadable` にして注意を出す。`percentile` は値が語と様式の例の文だけのときに限る

### 中-2 EV-0342・SRC-0768 の「観測は予告と合いません」は、文書の読み違えの可能性が高い

- 所在: `src/content/docs/phase4-process-design/roles-responsibilities.md` の EV-0342 の本文、`research/sources/SRC-0768.yaml` の `summary`、`template/scripts/gate/enforcement-inventory.mjs` の「注意:」の文
- 根拠: SRC-0768 の c3 の引用は「保持期間の変更は新しい対象にだけ適用され、既存の対象には遡らない」。2026-11-19 に読めた 134〜142 日前の実行は 2026-06〜07 の作成で、2026-10-01 の前に作られている。予告(c2)が新しい実行にだけ掛かるなら、観測は文書と矛盾しない。2026-10-01 の後に作られた実行が 90 日を超えるのは 2026-12-30 以降で、それまでの観測は新しい方針を試せない
- 差し替え条件の欠陥: 「2026-10-01 の後の観測が続いたら delivered に上げる」は、上の理由で 2026-12-30 より前の観測では成り立たない。そのまま運用すると、保持期間の削除が始まる前に delivered へ上がりうる。もう一方の枝(「出力の既定の注意を『欠けを区別できない』に改め」)は、出力がすでにそう書いており、条件として働かない
- 文の食い違い: EV-0342 の本文「最も古い実行は 134 日前で、142 日前の失敗の実行…」は自己矛盾(note の「134〜142 日前」と合わせ、2リポジトリのどちらかを書き分ける)。SRC-0768 c3 の text の「公開 1〜90 日、非公開 1〜400 日」は、quote が支えていない
- 採用者の出力(enforcement-inventory.mjs)に「2026-11-19 の観測では、それより古い実行とジョブの記録も残っていました」を固定の文として出すと、採用者が「90 日より古い記録も残る」と読む恐れがある
- 直しの案: 観測を「2026-10-01 より前に作られた実行が残っていた」と書き、方針の適用の有無を試せないことを開示する。差し替え条件は「2026-10-01 の後に作られ、90 日を超えた実行が読めるか」を 2027-01 以降に観測することにする。出力の文から日付つきの観測を外す

### 中-3 handoff.md の 2.10.6 の手引きが、手順2 の判定者を事業決裁者だけに絞る

- 所在: `template/.claude/skills/pit/reference/handoff.md` の小節「期日に間に合わない見込みのとき」(「手順2(期日)と SC-M の変更は、価値責任者が決めません。事業決裁者の判断に回します。」)
- 根拠: 条文 2.10.6(lifecycle.md 681 行)は「第7章 7.6 の段階に従い、事業決裁者または B-2 が判定します」。B-2 を置く体制では段階3 の判定者は B-2 で、手引きどおりに回すと宛先を誤る。手順3 を決める者(7.3 の例外承認の権限を持つ者)も書かれていない
- 直しの案: 「7.6 の段階に従い、事業決裁者または B-2 の判定に回します。手順3 は 7.3 の例外承認の権限を持つ者が決めます」に改める(編集の指摘)

### 中-4 IMPL-0497 の GitHub の読み出しが、/pit の全実行(セッション開始の `--brief` を含む)で走る

- 所在: `template/scripts/gate/next.mjs` の IMPL-0497 の段(`network` が真なら `gh api --paginate --slurp repos/{owner}/{repo}/issues/events?per_page=100`、timeout 15 秒)、`.claude/settings.json` の `node scripts/gate/next.mjs --brief`
- 根拠: リポジトリの全 Issue の事象を毎回ページ送りで読む。事象の多いリポジトリでは 15 秒の上限に当たり、「読めない」の注記が毎回出る(0 件と読み違えさせない点は正しい)。events の一覧が全件を返すか(古い事象の欠け・ページの上限)は実物で確かめていない(note は「実物の GitHub では未確認」と開示している)
- 直しの案: `state:needs-platform` の付いた Issue を検索(`label:` の検索、または timeline)で絞って読むか、`--brief` では読まない。全件を返さない場合の表示を note に書く

### 低-1 強調の様式が、タスクリスト・表の行・コロンを含む項目で崩れる

- 所在: `template/scripts/gate/review-order.mjs` の `emphasizeItem`・`headOf`
- 再現: `- [ ] 基準1` → 様式0 `- **[** ] 基準1`、様式1 `- **[ ] 基準1**`、様式2 `- ▶ [ ] 基準1`(どれもタスクリストとして表示されない)。`| 基準1 | 受入 |` → `▶ | 基準1 |…`(表が崩れる)。`- 基準1 文 (参照: ADR-1)` の様式0 は最初のコロンまで(`基準1 文 (参照`)を太字にし、「先頭の識別」にならない。すでに `**` を含む項目は様式0・1 の週だけ印が付かず、その週は1項目だけ見た目が違う
- /gate の SKILL.md は項目を箇条書きか基準の名で書くと定め、`[ ]` を使う手順は無い。PR の様式(PULL_REQUEST_TEMPLATE.md)はチェックボックスを持つので、写して渡すと崩れる
- 直しの案: `- [ ]`・`- [x]` を先頭の目印として BULLET に含める。表の行(`|` で始まる行)には付けない。`headOf` のコロンの探索を最初の空白より前に限る

### 低-2 flow-observation.yml の冒頭の説明が古い

- 所在: `template/.github/workflows/flow-observation.yml` 3〜4 行(「85パーセンタイルを超えたら…標本が足りないときは『算定できない』として通知しません」)
- 合意した値があれば標本 0 件でも通知する今の挙動と食い違う。直しの案: 合意した値を先に使うことを書き足す

### 低-3 様式 06 の例の文と読む書式の幅が違う

- 所在: `templates/06-project-brief.md`(と profiles 3 件)・第6章 deliverable-templates.md の例の文「合意した値は N日・N週間 で書く」、実装は「N週」も読む
- 害は小さい(余分に受けるだけ)。第6章の例の文に書式を足したことは、細かい定義の増加にあたる可能性がある(線引きは未決)。直しの案: 例の文に「N週」を足すか、実装の受け入れを note だけに書く

### 低-4 判定日時が未来の調整の記録を黙って落とす

- 所在: `template/scripts/gate/next.mjs` の `adjustmentRecordCount`
- 再現: 判定日時 2026-11-20(today 2026-11-19)の記録は、窓の件数にも「読めない」にも入らない。「黙って落とさない」(試験の名)の趣旨と合わない。直しの案: 未来の日付も別に数える

### 低-5 IMPL-0954 の /pit への結線(`flowSection` → `flowReportText`)を試験が拾わない

- 所在: `template/scripts/gate/next.mjs` の `flowSection`、`scripts/gate/test-next-records.mjs` の IMPL-0954
- 抜き取り M8 で、`adjustments:` の受け渡しを外しても 140 件すべて通った。マークは undelivered・manual なので表示との食い違いは無いが、note の「/pit の節『フロー』の側も降りた」は関数までの確認である。直しの案: note に「関数まで試験」と書くか、`flowSection` を通す試験を足す

### 低-6 IMPL-0979 の target と 3.9.3 の手引きの省略

- 所在: exception-escalation.md の IMPL-0979(target=handoff-reference だけ)、handoff.md の小節「判定・決定の期限を過ぎたとき」
- 裁定 2.4 は「併記する」と書くが、マークは1つの target しか持たず、機械の側は note の中の文でしか辿れない(review-queue-control の他のマークは別の規定)。手引きは、期限を超えた決定者が宛先と同じ人のとき組織上の任命権者が指名すること、会議体では規程の代決によることを書かない(D-0 節6 の行が運ぶので害は小さい)。直しの案: 機械の側を別のマーク(review-queue-control・machine)に分けるか、note に分けない理由を書く。手引きに 3.9.3 の2つの例外を1行足す

## 観点ごとの所見の有無

1. 表示と実態の食い違い: 高-1・高-2・高-3、中-2
2. 実装の欠陥(境界の入力): 中-1・中-4・低-1・低-4。「3日」「3 日」「1週間」「0日」(unreadable)、空欄(none)、全角の「８５パーセンタイル」、`#12`/`#123`、全角の「＃１２」、ISO 週の年の境目(2026-12-28 と 2027-01-03 が同じ様式、前後の週で変わる)、R3(強調なし)は期待どおり
3. 試験の質: 抜き取り 8 件のうち 5 件は落ちた。入口・結線の 3 件(M2・M3・M8)は落ちない(高-2・高-3・低-5)
4. 既存の決定・語彙との矛盾: 中-3・低-3・低-6。/gate の SKILL.md の強調と表現の手引きは、5.7.5 と裁定 2 に合う。判定基準の文を変えないことも書かれている
5. B25 のファイルに触れていないこと: **所見なし**(template・本体の差分の一覧に B25 のファイルは無い)
6. IMPL-0145: undelivered・manual のままで表示は正しい。EV-0342・SRC-0768 の文は中-2
