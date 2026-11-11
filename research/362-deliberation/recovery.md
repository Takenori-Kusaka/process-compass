# #362 失われた準拠テンプレートの変更の作り直し

- 日付: 2026-11-12
- 経緯: 前の担当の作業ツリーが消え、`template/` のブランチ `wip-362` の2コミット(`a0f5d2d`・`4d8b6b8`)が push の前に失われた。本体のコミット(`ffe8257`・`6e10f7e`)はブランチ `worktree-agent-a124676f330c51aac` に残っていた
- 基点: template `ef539dc`(origin/main)。失われたコミットの基点 `89d02d6` より2コミット新しい(#432 の `22eec16`・`ef539dc`)
- push はしていない。ブランチ `wip-362` は作業ツリーの `template/` にあり、写しを bundle(`origin/main..wip-362`)に残した

## 対応表

| 失われたもの | 作り直したもの | 中身 |
| --- | --- | --- |
| template `a0f5d2d` | template `b447b6d` | 契機を `gate-g5-push.yml` に分ける変更(implementation.md「変更したもの」の準拠テンプレートの 11 ファイル) |
| template `4d8b6b8` | template `2e22446` | 独立の突合への対応(implementation.md「独立の突合への対応」のテンプレートの2つ目のコミット) |
| 本体 `ffe8257` | 本体 `3a4aea8` | cherry-pick。submodule の参照だけが衝突し、`2e22446` へ付け替えた。コミットのメッセージの参照の番号を改めた |
| 本体 `6e10f7e` | 本体 `0be924f` | cherry-pick。衝突なし |

## 1つ目のコミット(a0f5d2d の作り直し)の材料と手順

- 材料: 一時リポジトリ `pit-in-trial-5534b5` のコミット `01b2392`(「chore: #362 の変更を持ち込む」)。親 `192a578`(Initial commit)の木は template `89d02d6` の木と一致した(`af784a2`)
- `192a578..01b2392` の差は 10 ファイルだけで、持ち込みのために足したもの(`note.txt`・試行の構成)は、このコミットに入っていなかった(`note.txt` は機能ブランチ `feat-d` の側)。差をそのまま採った
- `89d02d6..ef539dc` が触れる5ファイル(`accountable.md`・`aggregate-evidence.mjs`・`test-loosening-decider.mjs`・`generate-profile.mjs`・`00-d0-governance.md`)は、#362 の 10 ファイルと重ならない。差を `ef539dc` へ当てて衝突は無く、10 ファイルの blob は `01b2392` と一致した
- `scripts/vendor/tailoring-kb.json` は一時リポジトリに無い。`npm run template:kb` で再生成した(変わるのは本体のコミットの記録 `meta.commit` だけ)
- 一時リポジトリの写しからの変更: `test-push-trigger.mjs` の目印 `IMPL-0486:ok`・`IMPL-0486:ng` を除いた(下記)

## 2つ目のコミット(4d8b6b8 の作り直し)と、記録との対応

| 記録の対応(implementation.md・decision.md R-7) | 作り直した中身 |
| --- | --- |
| X-6: `push-trigger.mjs` にジョブの鍵と最上位の鍵の検査 | `PUSH_JOB_KEYS`(name・if・uses)と `PUSH_TOP_KEYS`(name・on・permissions・jobs)を置き、ほかの鍵を不備にする。冒頭に読まない書き方(4字下げのジョブ・流れ形・matrix や format で組んだ名・引用符つきの事象のキー)と、別の書き方は統制の設定の変更のレビューで確かめることを書いた。作り直した時点では、IMPL-0485 の注記(本体)は引用符つきの事象のキーを挙げておらず、列挙は一致していなかった(作り直しの確認 Z-5)。`f8a196e` で両方を同じ列挙にそろえた |
| `test-push-trigger.mjs` に変異 2 件 | 呼び出し側のジョブへ `secrets: inherit`、最上位へ `concurrency`(`cancel-in-progress: true`)。20 件から 22 件(記録の 22/22 と一致) |
| X-2: `test-env-check.mjs` の模擬に `--workflow gate-g5-push.yml` | push の実行(77)に成果物の模擬を持たせ、後退の経路の `--workflow gate-g5` は実行 88 を返して成果物の模擬を持たない。主の経路を通らなければ成果物が読めずに落ちる |
| X-4: `README.md` と `/process-init` の手順 | README の事前点検の段落(既定ブランチの名で止めない、項目 `push-trigger` で止める)。process-init の SKILL.md の止める項目の表の行(「既定ブランチの名」を「既定ブランチへの push の契機の形(`push-trigger`)」へ) |

## 再現できなかった点・記録と違う点

- **失われたコミットの本文そのもの**: 2つ目のコミットは記録の要約から書き直したため、文言・関数名・変異の書き方は元の `4d8b6b8` と一致する保証が無い。判定は記録の対応(上の表)と試験の件数(22 件)で行った
- **コミットの ID**: 作り直したコミットは ID が変わる。implementation.md・crosscheck.md・decision.md に残る `a0f5d2d`・`4d8b6b8`・`89d02d6` は、審議の時点の記録として書き換えない。上の対応表で読み替える
- **IMPL-0486 の目印**: 一時リポジトリの写し(`01b2392`)の `test-push-trigger.mjs` には、`/pit` の既定ブランチの読み方の試験に `IMPL-0486:ok`・`IMPL-0486:ng` の目印があり、本体の `lint:impl` が「標準本文の実装マークにありません」で落ちた。implementation.md「読み方を決めた点」1 は `/pit` の読み方に IMPL を付けないと決め、crosscheck.md は `a0f5d2d` で `check-impl.mjs` が終了コード 0 だったと書く。このため写しは `a0f5d2d` より前の状態を含んでいたと読み、目印を1つ目のコミットで除いた(注記に置き換えた)
- **README の2か所目**: 突合 X-4 が挙げたのは README 50 行だけだが、177 行の「既定ブランチ(`main`)への push でも契約検査を走らせ…(`gate-g5.yml`)」もコードと食い違うため、同じコミットで改めた。元の `4d8b6b8` がこの行を改めたかは確かめられない
- **tailoring-kb.json の `meta.commit`**: 本体のどのコミットの時点で再生成したかは元と違う(作り直しは本体 `4c03b68` の時点)。内容の差はこの値だけ
- **一時リポジトリの GitHub の実行(T1〜T6・T11)**: 作り直したコミットでは再実行していない。`a0f5d2d` の写しでの観測であり、2つ目のコミットの変更(鍵の検査・試験・文書)は GitHub 上の振る舞いを変えない

## 確かめた検査

本体 `0be924f`・template `2e22446` で流した。WSL は bundle から作った LF の写し(`core.autocrlf=false`)で、node v22.23.4(nvm)。

| 検査 | 結果 |
| --- | --- |
| `test-push-trigger.mjs` | 22/22(Windows・WSL) |
| `test-adoption.mjs` | 69 件一致(Windows・WSL) |
| `test-env-check.mjs` | 63 件一致(WSL。Windows では省かれる) |
| テンプレートの試験一式(`scripts/test-template-suite.mjs`。WSL) | 46 本が通った(`test-init-g5.mjs` を含む) |
| `npm run check` の各段(Windows) | `test:template-suite` と `test:regress` を除く 28 段が通過(`build` は 354 頁)。`test:template-suite` は `test-g5-aggregate.mjs`・`test-base-judge-workflow.mjs`・`test-discouraged-evidence.mjs` の3本が落ちる。どれも作業ツリーの CRLF(`i/lf w/crlf`)で試験の置換が空振りするもので、#378 の実装の記録 4.3 と同じ組。LF の写しでは通る。`test:regress` は既知(`test-run.mjs` の最初の試験で止まる) |
| 回帰スイート(WSL、29 本) | 実行役の試験 `test-run.mjs` 35 件合格。通常の時刻帯(JST)と `TZ=UTC` の両方で「すべて通った」(v3b 30 場面を含む) |
| 番号の衝突 | ADR-0123・EV-0245・IMPL-0485・SRC-0730 は main に無く、それぞれ1か所だけ。台帳の再生成(`evidence:write`・`impl:write`・`scope:write`・`sources:index`)で差は出なかった |

- WSL の既定の node(v18.19.1。nvm を読まない非ログインのシェル)では、テンプレートの試験一式の `test-init-g5.mjs` の1件(既知)に加え、回帰の r3-scen・r3-succession・r3-verify(#378)が、採用者の製品の試験の CommonJS の名前つきの取り込みで落ちた。本件に依らない環境の差であり、node 22 で通ることを確かめた

## 作り直しの確認(Z-1〜Z-5)への対応

裁定は `decision.md`「作り直しの確認への裁定」にある。

| 番号 | 対応 |
| --- | --- |
| Z-1 | template `f8a196e`: `push-trigger.mjs` はコメント(字下げが 0 の行、行末)を除いてから `jobsOf` へ渡す。`g5-aggregate.mjs` の `jobsOf` は改めていない。変異2件(`gate-g5-push.yml` の末尾のコメント行の後の条件なしの `gate-g5`、ほかのワークフローの `jobs: # x` の後の `gate-g5`) |
| Z-2 | 条件を残した。ADR-0123 の決定2 と第5章の表・箇条に「`workflow_call` か `pull_request` を持たない」を書き足した。変異1件(`pull_request` を外す)。テンプレートの README の止める条件にも足した |
| Z-3 | `preflight.mjs` の処理を、読み方が「現在のブランチ」のときに限った(232 行の注記と同じ条件)。ADR-0123 の決定2 の文言も R-2 にそろえた |
| Z-4 | ブロック形の `branches:` の列を流れ形と同じに読む。正当な構成1件(`- '**'`)と変異1件(`- main`) |
| Z-5 | `push-trigger.mjs` の冒頭と IMPL-0485 の注記を同じ列挙にそろえた。上の対応表の X-6 の行を事実に合わせて直した |

`test-push-trigger.mjs` は 27 件になった。

Z の対応の後の検査(template `f8a196e`。本体は `ea5e6ec` で流し、文の分割 `34fa6b8` の後に `lint:text` を流し直した):

| 検査 | 結果 |
| --- | --- |
| `test-push-trigger.mjs`・`test-adoption.mjs`・`test-env-check.mjs`(WSL、node v26.13.1) | 27/27、69 件一致、63 件一致 |
| テンプレートの試験一式(WSL、node v26.13.1) | 46 本が通った |
| `npm run check` の各段(Windows) | `test:template-suite` と `test:regress` を除いて通過(`build` を含む)。`lint:text` は Z-2 で足した文の長さで落ち、文を分けて通した。`test:template-suite` は CRLF による既知の3本(`test-g5-aggregate`・`test-base-judge-workflow`・`test-discouraged-evidence`)、`test:regress` は既知 |
| 回帰スイート(WSL、node v26.13.1、29 本) | `test-run.mjs` 合格。通常の時刻帯と `TZ=UTC` の両方で「すべて通った」 |
