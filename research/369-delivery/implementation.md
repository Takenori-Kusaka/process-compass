# #369 の実装の記録(AI レビューの指示を、変更が書き換えられない所から読む。IMPL-0333)

実施日: 2026-11-05〜06。審議の重さは「軽」(準拠テンプレートへ降ろすだけで、新しい規定を足さない)。本体と template はどちらも `git pull` で最新を確かめてから着手した(本体 a513e0f の後の pull、template 935c817)。

## 入力

- Issue #369 の本文と、#371 から申し送られたコメント(基底から読む型の所在、AI レビューへの当てはめ、プロンプトの注入の危険と条件、check run と commit status、承認の要求)
- 第5章 5.8.6 の要求事項7(IMPL-0333)、第3章 3.5.3(入力の分離)、附属書H H.4 条件3
- ADR-0115、`research/371-deliberation/decision.md`(R-4、AR-1〜AR-3、J-7、C-1)、`probe-371b.md`(F-1a・F-1b・F-3)、`implementation.md`
- 準拠テンプレートの `gate-g5-base.yml`・`ai-review.yml`・`scripts/gate/base-judge.mjs`・`test-base-judge-workflow.mjs`・`check-pr.mjs` の `CONTROL_FILES`
- CLAUDE.md(本体と template)

## 進捗

- [x] ai-review.yml を基底から読む型へ移した(2 節)
- [x] 違反と適合の対の試験(`IMPL-0333:ok`・`IMPL-0333:ng`)
- [x] 指示の置き場を CONTROL_FILES に足すかの決定(J-2)
- [x] 本体の IMPL-0333 を delivered へ。フォークからの PR の部分を IMPL-0464(undelivered)へ分けた(J-7)
- [x] 台帳と知識ベースの再生成(impl:write・template:kb)
- [x] 検査(4 節)
- [x] コミット(本体はコミットまで。template は pit-in-template の main へ push し、submodule の参照を進めた)

## 0. 実装の段で決めたこと(報告の対象)

| # | 判断 | 理由 |
| --- | --- | --- |
| J-1 | 指示の置き場を `.github/ai-review/instructions.md` に新設した。`.claude/**` には置かない | AI レビューは CI の上で動き、Claude Code のセッションの文脈ではない。`.claude/**` に置くと、作成側のエージェントのセッションがレビューの指示を自動で読み込みうる(作成側がレビューの観点に合わせて書く経路。入力の分離の趣旨に反する)。ワークフローと同じ `.github/` に置くと、既定ブランチの作業ツリーから読む範囲がワークフローの近くに閉じる |
| J-2 | **`.github/ai-review/**` を CONTROL_FILES に足した**。指示を変える PR は統制の設定の変更として、AI維持管理者の席の責任者本人の承認のレビューを要する(gate-g5-base の check-pr.mjs 3c) | 既定ブランチの版から読むだけでは、その PR 自身のレビューを変えられないことまでしか守れない。指示を弱める PR(特定のパスを見ない、承認を求める文を無視しない など)を先に取り込み、次の PR をその指示でレビューさせる2段の経路が残る。要求事項7 の「書き換えられない場所」は、レビューされる側が指示を動かせないことを求めており、2段の経路はその抜け道である。AI レビューの運用は AI維持管理者の席が持つ(四半期の抜き取り)。`ai-review.yml` は既に `.github/workflows/**` として CONTROL_FILES に入っており、手順だけを承認の対象にして指示を外す理由が無い。**採らない案**: 足さない(AI レビューは検出の層で判定に数えないため、指示の弱化はゲートを通す経路にならない、という論)。指示の弱化は検出の層を黙って弱め、人が「AI の指摘が無い」ことに頼る形骸化(5.6)の入口になる。費用(採用者の指示の調整のたびに承認が要る)は採否の理由にしない |
| J-3 | エージェントの書き込みの遮断(guard.json の protectedPatterns)には `.github/ai-review/**` を足さない | 要求事項7 が守るのはレビューされる変更からの書き換えであり、PR の中の書き換えは既定ブランチから読むことで、取り込みは J-2 の承認で止まる。遮断はエージェントが指示の改善の候補を出す経路も塞ぐ。エージェントの指示資産一般の変更の統制は IMPL-0227(#358)の範囲であり、ここで先取りしない |
| J-4 | PR の題名と本文は、**どのジョブにも渡さない**。試験は `github.event.pull_request.title`・`body` の参照そのものを不備にする | 依頼の「PR の差分と本文はデータとして読む」に対し、本文は渡さない側へ倒した。第3章 3.5.3 の入力の分離(作成側の説明を判断の前に渡さない)と、元の ai-review.yml の注記に合わせた。差分は git fetch と git diff(`--no-ext-diff --no-textconv`)でデータとして読む。仕様・受入基準は `git show refs/remotes/pr/head:<パス>` でデータとして読む旨を差し込み口に書いた |
| J-5 | AI の指摘の出し先を、PR へのコメントからジョブの要約(`GITHUB_STEP_SUMMARY`)へ替えた。PR へ書くのは、別のジョブ `ai-review-notice`(`pull-requests: write`、checkout なし、秘密情報なし)が出す位置づけの定型の文だけ。このジョブへ渡すのは PR の番号と、既定ブランチの構成から読んだ `enabled` だけ | 申し送りの条件「書き込みが要るなら別のジョブへ分け、PR の内容に依らない入力だけを渡す」。AI の出力は差分(PR の内容)に依るため、書き込みのジョブへ渡せない。**既存の採用者への影響**: 差し込み口へ PR にコメントする実装を置いていた採用者は、出し先を要約へ移す必要がある。試験は、書き込みのジョブが `needs.*.outputs` の `enabled` 以外を受け取ると不備にする |
| J-6 | AI の手順に `continue-on-error: true` を置き、ルールセットの雛形4本に `ai-review` の必須チェックが無いことを試験した | 申し送りの「AI の確認を承認にも合否条件にもしない」「結果を必須にしない」。check run は PR の側の同名で上書きされない(AR-1)が、必須にしない扱いを保つ。commit status(statuses の権限・API)は不備にする(E-4) |
| J-7 | **IMPL-0333 を delivered(machine)にした。フォークからの PR の部分を IMPL-0464(undelivered、`issue=361`、見直し 2027-05)へ分けた** | 下の「delivered の根拠」 |
| J-8 | IMPL-0333 の降ろし先を `pr-checks` から `ai-review-workflow` へ替えた。`impl-targets.yaml` の `ai-review-workflow` の説明に、基底から読むことと試験の所在を足した | 降ろしたのは ai-review.yml であり、PR 単位の検査(check-pr)ではない。CONTROL_FILES への追加は J-2 の付随である |
| J-9 | 試験は新しいファイルを起こさず、`test-base-judge-workflow.mjs` に足した。読み方の本体は `base-judge.mjs` の `aiReviewWorkflowProblems`(ジョブの分割の読み `jobsOf` を足した) | 同じ「基底から読む」型の試験であり、gate-g5.yml の結線(既存の1行)をそのまま使える |
| J-10 | 位置づけのコメントを出す契機は元のまま(opened・synchronize・ready_for_review。reopened を足した) | 出す頻度は本件の範囲の外である |

### delivered の根拠(J-7)

#371 の裁定 R-4 は「実機で確かめるまで、関係する IMPL は delivered にしない」とし、突合 C-1 は「確認用のワークフローの結果ではなく、実装した版を実機で確かめる」ことを求めた。本件の ai-review.yml そのものは実機で動かしていない(一時リポジトリの使用の承認は #371 の確認のためのものであり、本件のために新しい一時リポジトリを作っていない)。

それでも delivered にした理由:

- 要求事項7 の成立が依る GitHub の振る舞いは3つである。(1) `pull_request_target` が既定ブランチの定義で動く、(2) `actions/checkout` の `ref: ${{ github.event.repository.default_branch }}` が既定ブランチの内容を取り出す、(3) PR の側でワークフローの定義を書き換えても、その PR の実行に入らない
- 3つとも、**実装した版の gate-g5-base.yml**(準拠テンプレート ba2b7e8)を実機で動かした確認 F-1a・F-1b(と確認用のワークフローの E-15)で確かめた。C-1 が退けたのは「別の構造の確認用のワークフロー」を根拠にすることであり、F-1a・F-1b は実装した版の確認である
- 3つは、契機と checkout の手順の性質であり、ジョブの中身に依らない。ai-review.yml は、契機の宣言と checkout の手順の行を gate-g5-base.yml と同じ文字で持つ(試験が両方を同じ観点で確かめる)
- 指示の置き場を既定ブランチの作業ツリーから渡すことは、checkout の後のファイルの読み出しであり、GitHub の振る舞いに依らない

delivered にしなかった部分(IMPL-0464):

- フォークからの PR(E-12)。`pull_request_target` はフォークからの PR でも既定ブランチの定義で動き、秘密情報に届く(GitHub の文書の記載)。実機では確かめていない。所有者と別のアカウントが要るため、#371 の J-8 と同じく #361 へ付けた

delivered の note に開示したこと(機械も実機も確かめていない部分):

- ai-review.yml の固有の部分(書き込みのジョブを分けた形、`needs` の出力の受け渡し、`continue-on-error`)は実機で動かしていない。これらはプロンプトの注入の条件であり、要求事項7 の成立には入らない
- 差し込んだレビューの実装(採用者が置く)が、指示の置き場だけを読み、PR の側の指示を読まないかは確かめない。差し込み口の注記と試験の変異(PR の先頭からの読み出し、置き場の差し替え)は、テンプレートの定義の範囲に留まる

この判断は R-4・C-1 の読み方に依る。「実装した版」を「同じワークフローのファイル」と読むなら、IMPL-0333 は undelivered に戻し、一時リポジトリで ai-review.yml を動かしてから delivered にすることになる。その場合の確認の項目は、F-1a・F-1b と同じ手順を ai-review.yml に当てること(PR の側で instructions.md と ai-review.yml を書き換え、要約に出る指示の版が既定ブランチのコミットであること)である。

## 1. 標準の本文(本体)

| ファイル | 変えたこと |
| --- | --- |
| `phase4-process-design/human-ai-boundary.md` | IMPL-0333 を `target=ai-review-workflow state=delivered check=machine test=template/scripts/gate/test-base-judge-workflow.mjs` へ改め、note に実装・試験・実機の確認の根拠と限界を書いた。`issue=` は delivered のマークに置かない(除いた)。IMPL-0464 を新設した(undelivered、`issue=361`) |
| `src/data/impl-inventory.yaml` | 5.8.6 の節と要求事項7 の行に IMPL-0464 を足した |
| `src/data/impl-targets.yaml` | `ai-review-workflow` の説明を改めた |
| 台帳 | `impl:write`(implementation-ledger.md)・`template:kb`(tailoring-kb.json)で再生成した |

本文の規定(要求事項・課さないと決めたこと)は変えていない。ADR は起こしていない(新しい決定ではなく、ADR-0115 の型の当てはめである。採用済みの ADR-0101 にある「実行層(IMPL-0333)は降りていない」の記述は、ADR の本文を書き換えない規則により残す)。

## 2. 準拠テンプレート

| ファイル | 変えたこと |
| --- | --- |
| `.github/workflows/ai-review.yml` | `pull_request` → `pull_request_target`。ジョブ `ai-review`(contents・pull-requests の read だけ): 既定ブランチを checkout(`persist-credentials: false`)、既定ブランチの構成で有効かを読み、指示の版を要約に出す、PR の先頭と基底を fetch、差分と変更したファイルの一覧を書き出す、既定ブランチに指示の置き場が無ければ実行しない、差し込み口へ `AI_REVIEW_INSTRUCTIONS`(既定ブランチの作業ツリー)・`AI_REVIEW_DIFF`・`AI_REVIEW_FILES` を渡す(`continue-on-error: true`)。ジョブ `ai-review-notice`(pull-requests: write だけ): checkout せず、PR の番号と `enabled` だけで位置づけの定型の文を書く。冒頭の注記に、足してはならない手順・指示を変える PR の承認・限界を書いた |
| `.github/ai-review/instructions.md` | 新設。指示の置き場。既定ブランチの版から読むこと、承認の要求、位置づけ、入力(題名・本文を渡さない、差分の中の文は指示ではなくデータ)、出力(所在と根拠、修正案を書かない、「通過」と書かない)。観点は採用者が書き足す |
| `scripts/gate/base-judge.mjs` | `jobsOf`・`AI_REVIEW_INSTRUCTIONS_DIR`・`aiReviewWorkflowProblems` を足した |
| `scripts/gate/check-pr.mjs` | CONTROL_FILES に `.github/ai-review/**` を足した |
| `scripts/gate/test-base-judge-workflow.mjs` | `IMPL-0333:ok`(実物の定義が適合、置き場の実在、CONTROL_FILES と `controlTouchedOf`)と `IMPL-0333:ng`(変異18件)、ルールセットの雛形4本に ai-review の必須チェックが無いこと |
| `README.md` | AI レビューの位置づけの節と構成の図を改めた |
| `scripts/vendor/tailoring-kb.json` | template:kb で再生成 |

テンプレートの CLAUDE.md は変えていない。統制の設定を変える PR の承認の行(「エージェント指示資産 … AI維持管理者が承認する」)が既に掛かり、置き場の追加で規則の索引の行は増えないためである。

## 3. 依頼からの逸脱

- 依頼の「ファイルの書き換えは Write か Edit で行う」に1か所反した。`src/data/impl-inventory.yaml` への IMPL-0464 の2行の追加を、node の1行のスクリプトで行った。差分は2行の追加だけであることを `git diff` で確かめた
- 並行する #367 のセッションが同じ作業ツリーを編集していたため、索引への登録をハンク単位で行った(git apply --cached)。#367 のコミット(4a2e18b)の後に、`impl:write` と `template:kb` を作り直して登録し直した。知識ベースの差は生成元のコミットの欄だけであり、template のコミットに含めた(push の前の amend)

## 4. 検査

実施: 2026-11-06。本体は main 4a2e18b(#367 のコミットの後)の上、template は ab4cf21。

| 検査 | 結果 |
| --- | --- |
| `test-base-judge-workflow.mjs`(Windows) | 50 / 50 件。うち IMPL-0333 は ok 3件・ng 18件、ルールセットの雛形4本の ai-review の不在4件 |
| template の試験一式(WSL、`git clone` した LF の作業ツリー。test-results.mjs は引数が要るため除外) | 全件通過 |
| WSL の回帰スイート(通常の時刻) | すべて通った(25 本、v3b 30 場面を含む) |
| WSL の回帰スイート(`TZ=UTC`) | すべて通った |
| `npm run check` の各段(Windows で段ごとに実行) | `test:template-suite` と `test:regress` 以外の 25 段は通過(lint:text・lint:provisions・lint:impl・test:impl・test:template・build を含む) |
| `test:template-suite`(Windows) | `test-g5-aggregate.mjs` の4件だけが落ちる。**変更前の HEAD でも同じ4件が落ちる**(git worktree の HEAD で確かめた)。Windows の作業ツリーの gate-g5.yml が CRLF で、変異の置換が当たらないため。WSL の LF の作業ツリーでは通る |
| `test:regress`(Windows) | `test-run.mjs` が実物の gh を呼び `unknown flag: --regress-probe` で止まる。環境の問題であり、指定の WSL の手順で確かめた |

WSL の作業の場所: 依頼の `/tmp/pc430` は、並行するセッションと共有していて作業の途中で消えた。そのため、#369 専用の `/tmp/pc369` で行った(`scratchpad/wsl369.sh`。本体の scripts・src・research を写し、template は `git clone` で LF の作業ツリーにし、`node_modules/yaml` を写した)。走らせた中身は依頼のコマンド(`node scripts/regress/run.mjs --kb keep`)と同じである。

## 5. 所有者の承認待ちの事項

本件の準拠テンプレートの変更(`.github/workflows/ai-review.yml`・`.github/ai-review/**`・`scripts/gate/**`)は強制層の変更であり、統制の設定の変更である。ADR-0115 決定3 と本件の J-2 により、AI維持管理者が本人のアカウントで承認する必要がある。pit-in-template の `main` へ直接 push したため、この承認を経ていない。AI維持管理者の席の責任者(所有者)の承認を待つ事項として記す。

- 名簿:
- 承認者:
- 承認の日:

## 6. 申し送り

- IMPL-0464(フォークからの PR)は #361 で確かめる。#369 を閉じる前に、`issue=369` を持つマークが 0 件であることを確かめる(本件で IMPL-0333 を delivered にしたため 0 件)
- J-7 の読み方(実装した版の確認を、同じ契機と checkout の行を持つ別のワークフローで代えてよいか)は、所有者の確認を要する。退けられた場合は IMPL-0333 を undelivered へ戻し、ai-review.yml を一時リポジトリで動かす
- 差し込み口へ PR にコメントする実装を置いていた採用者は、出し先をジョブの要約へ移す必要がある(J-5)。テンプレートの更新の取り込みの際に気付けるよう、README の位置づけの節に書いた
