# #362 内部の調査と実行での確認: 既定ブランチが main でないリポジトリへの持ち込み

- 実行日: 2026-11-11〜12
- 対象: 標準の本文(main `af7bbf2`)と準拠テンプレート `template/`(`89d02d6`)
- 審議の重さ: 軽(受付の理由は `decision.md` の冒頭)。外部の調査は、GitHub の公式文書の確認に限った(新しい義務を課さず、規格を引かないため)
- 表記: 「観測」は実行の出力そのもの。「読解」はコードと本文を読んだ結果。「推測」は観測と読解からの解釈
- 起点: Issue #362 の本文、`research/315-deliberation/implementation.md` 5 の案2、`decision.md`(#315)の R-2、ADR-0085 の「検討した選択肢」

## 0. 結論の要約

| 論点 | 見つかったこと |
| --- | --- |
| `on.push.branches` に式を書けるか | **書けない**。公式文書のコンテキストの使える場所の表に `on.push.branches` は無い(SRC-0730 c1)。実機で `branches: ['${{ github.event.repository.default_branch }}']` は「Invalid workflow file … Unrecognized named-value: 'github'」になり、ジョブを1つも持たない失敗の実行が、**どのブランチへの push でも**出た(観測 O1) |
| push の絞りを外し、ジョブの `if:` で既定ブランチに絞る | **そのままでは必須チェックを迂回する経路を作る**。既定ブランチでないブランチへの push で、集約のジョブが `gate-g5` の名のまま skipped の check run を PR の先頭のコミットに残す。PR の `gate-g5` が終わる前に、この skipped が必須チェックを満たし、**PR の検査が失敗する変更をマージできた**(観測 O3・O4) |
| 集約のジョブの名を、既定ブランチでない push で別の名にする | 迂回は消えた。skipped のジョブの check run の名は、式を評価しないまま式の文字列になり、`gate-g5` と一致しない。PR の `gate-g5` を待って止まった(観測 O5・O6) |
| 再利用のワークフロー(呼び出し側で `if:`) | 迂回は生じない。呼び出し側のジョブの名が check run の名になる(観測 O7)。ただし、出荷の証跡のワークフローが既定ブランチの実行をワークフローの名 `gate-g5` で探すため、取り込みの経路を変える必要がある |
| ルールセットの対象 `~DEFAULT_BRANCH` | すでにテンプレートのすべてのルールセット(records を除く)が使っている。既定ブランチの名に依らない。今回の論点はワークフローの契機だけである |
| 事前点検 | 方式を採れば、既定ブランチの名で止める理由が無くなる。止める項目から外せる |
| 付随 | `/pit`(`next.mjs`)の既定ブランチの読み方が `main`・`master` しか知らず、`trunk` などでは済んだタスクを数えない(読解 §5.6) |

## 1. 規定と実装の所在

| 所在 | 内容 |
| --- | --- |
| `template/.github/workflows/gate-g5.yml` 29〜31 行 | `push: branches: [main]`。注記「既定ブランチの名前が main でない場合は、ここを改める(このファイルは強制層であり、変更は AI維持管理者の承認を要する)」 |
| 同 75〜92 行 | ジョブ `contract` は、`push` では `github.event.before` の構成と比べる(標準 第3章 3.13.5) |
| 同 466 行 | 集約 `gate-g5` は `if: always()`。構成が未設定なら警告で通す |
| `template/scripts/gate/preflight.mjs` 225〜227 行 | 既定ブランチが `main` でなければ `default-branch` で止める。直し方は「既定ブランチを main にしてから初期化する(push の契機を書き換える経路は、準拠テンプレートに置いていない)」 |
| `template/scripts/gate/test-adoption.mjs` 263〜266 行 | 「既定ブランチが main でなければ止める」の試験 |
| `template/.github/rulesets/*.json` | `checks-only`・`team`・`regulated`・`safety` は対象 `~DEFAULT_BRANCH`。`records`・`records-signed` は `refs/heads/records` |
| `template/.github/workflows/ship-evidence.yml` 125 行 | `gh run list --workflow gate-g5 --commit "$target" --status success` で、出荷の対象のコミットに対する gate-g5 の成功した実行から license-scan と test-results を取る。既定ブランチへの push の実行に依る |
| `template/scripts/gate/aggregate-evidence.mjs` 1283〜1291 行 | PR の記録の rollup に gate-g5 が無いとき、PR の先頭のコミットの check-runs から `check_name=gate-g5` を引き、**完了の時刻が最も新しいもの**を採る |
| `template/scripts/gate/delegation.mjs` 252〜259 行 | 委任のマージの条件3。先頭のコミットの check run のうち名が `gate-g5` の**すべて**が success であることを求める |
| `template/scripts/gate/next.mjs` 682〜685 行 | 既定ブランチを `main`・`master` の順に手元の参照から探す。無ければ null |
| `template/scripts/gate/adoption-trial.mjs` 1606〜1607 行 | `gh repo view --json defaultBranchRef` で読み、読めなければ `main`・`master` |
| 標準 第4章 `gate-criteria.md` IMPL-0238 | 1名の体制の行。`gate-g5.yml` が、PR に加えて既定ブランチへの push を契機に、契約検査を含む G-5 の検査を実行する |
| 標準 第5章 `template-repository.md` 事前点検の表 | 「止める | 既定ブランチが `main` でない」。本文末尾「push の契機を案件ごとに変える案は採りませんでした」。EV-0167 の対象に「既定ブランチが `main` でないリポジトリを止めること」 |
| ADR-0085 33 行・172 行 | 事実の表と、採らなかった案「既定ブランチの名を初期化が書き換え、push の契機を変える」(後継の Issue で検討する) |
| 標準 第5章 `ci-gates.md` 922〜923 行 | 出荷の対象のコミットに gate-g5 の成功した実行が無い場合の扱い。「既定ブランチへの push を契機とする契約検査は、実際の GitHub 上で実行していない」 |

## 2. 公式文書

| 確かめた点 | 出典 | 内容 |
| --- | --- | --- |
| `on` の下で式を使えるか | SRC-0730 c1(Contexts reference、節 Context availability) | 表はキーごとに使えるコンテキストを挙げる。`on` の下で挙がるのは `on.workflow_call.inputs.<inputs_id>.default` と `on.workflow_call.outputs.<output_id>.value` だけで、`on.push.branches` は無い |
| ジョブの `if:` と `name:` で使えるコンテキスト | SRC-0730 c2 | `jobs.<job_id>.if` は `github, needs, vars, inputs`。`jobs.<job_id>.name` は `github, needs, strategy, matrix, vars, inputs` |
| `ref_name` の意味 | SRC-0730 c3 | 「branch or tag」の短い名。タグと区別しない |
| 絞りの形 | SRC-0701(Workflow syntax) | `on.push.<branches\|tags\|...>` は glob の型を取る(本件では引用だけ。式を許す記述は無い) |
| 条件で skipped のジョブ | SRC-0573 c1・c2 | 必須チェックの成功は success・skipped・neutral。条件で skipped のジョブは「Success」と報告される |
| 絞りで起動しなかったワークフロー | SRC-0573 c3 | 関連する check は Pending のまま残り、マージを止める |

読解: 公式文書の表は「使える場所」を挙げる形で、`on.push.branches` で使えないとは明記しません。不記載と実機の観測(O1)の2つを合わせて「書けない」とします。

## 3. 実機の確認

一時のリポジトリ `Takenori-Kusaka/pit-in-trial-73fbe93c`(public。既定ブランチを `trunk` に改名した)で確かめました。ローカルの git を使わず、内容の API(contents)と参照の API でファイルとブランチを作りました。ルールセットは `checks-only.json` から `gate-g5-base` を除いた写し(対象 `~DEFAULT_BRANCH`、必須チェック `gate-g5`)です。ワークフローは検証用の最小のもの(`work` と集約 `gate-g5` の2ジョブ。PR で `FAIL` のファイルがあれば `work` が失敗する)で、テンプレートの `gate-g5.yml` そのものではありません。

| 番号 | 試したこと | 観測 |
| --- | --- | --- |
| O1 | `on.push.branches: ['${{ github.event.repository.default_branch }}']` | 実行 43042942468 ほか。名がファイルのパスの実行が `failure` で、ジョブは 0 件、check run も 0 件。注記は「Invalid workflow file … (Line: 4, Col: 16): Unrecognized named-value: 'github'. Located at position 1 within expression: github.event.repository.default_branch」。`trunk` への push だけでなく、`feat` ブランチの作成と push でも同じ失敗の実行が出た |
| O1' | 対照: `on.push.branches: [trunk]` | `trunk` への push で `success` |
| O2 | `on: push`(絞りなし)+ 各ジョブ `if: github.event_name != 'push' \|\| github.ref_name == github.event.repository.default_branch`。集約も同じ条件(`if: always() && (...)`) | `feat` への push(6a388c0)で、check run `gate-g5` が `skipped`、`work` が `skipped`。`trunk` への push では両方 `success` |
| O3 | O2 の構成で、`feat` から PR #1 を開く(PR では `work` が失敗する) | PR の `work` の実行中、PR の `gate-g5` の check run がまだ作られていない間は `mergeStateStatus` が `UNSTABLE`(マージ可)。PR の `gate-g5` が作られた後は `BLOCKED`。push の実行を再実行して skipped の `gate-g5` を最新にしても `BLOCKED` のまま |
| O4 | 同じ構成で、`feat2` へ push → skipped の `gate-g5` が付いた後に PR #2 を開き、直ちに `gh pr merge --merge` | **マージされた**(`state: MERGED`)。PR の `work` は `QUEUED` のままだった。必須チェック `gate-g5` を満たしたのは、push の実行の skipped の check run である |
| O5 | 集約の名を `name: ${{ (github.event_name == 'push' && github.ref_name != github.event.repository.default_branch) && 'gate-g5-not-default' \|\| 'gate-g5' }}` とする(ジョブ ID は `gate-g5` のまま) | `featg` への push(91521f1)で、check run の名は式の文字列そのもの(`(github.event_name == 'push' && …) && 'gate-g5-not-default' \|\| 'gate-g5'`)で `skipped`。`trunk` への push では `gate-g5` で実行された |
| O6 | O5 の構成で、`featg` から PR #3 を開き、直ちにマージを試みる | 拒否された(「Required status check "gate-g5" is expected.」)。PR の `gate-g5` が失敗した後も拒否された(`OPEN` のまま) |
| O7 | 再利用のワークフロー: `caller.yml`(`on: push`、ジョブ `default-push` が `if: github.ref_name == github.event.repository.default_branch` で `uses: ./.github/workflows/callee.yml`)、`callee.yml`(`on: workflow_call`、ジョブ `gate-g5`) | `feate` への push で check run `default-push` が `skipped`。`trunk` への push で `default-push / gate-g5` が `success`。どちらも `gate-g5` とは一致しない |
| O8 | 出荷の証跡の探し方を O5 の構成で試す: `gh run list --workflow ifgate --commit 9fec7d3 --json …` | 同じコミットに `trunk` の push(success)と、同じコミットから作った `feate` の push(skipped)の2つの実行があった。`--status success` で探せば `trunk` の実行だけが当たる |

推測: O3 と O4 の差は時間の窓です。PR の `gate-g5` の check run は、`needs` のジョブが終わるまで作られません。テンプレートの `gate-g5.yml` は集約の前に 9 つのジョブを待つため、窓は数分に及びます。O2 の構成を採ると、**既定ブランチでないブランチへ push してから PR を開く通常の手順で、その窓のあいだ必須チェックが効かない**ことになります。集約が `if: always()` のまま(テンプレートの現状の書き方)なら、push の実行で集約が成功して残るため、窓に依らず効かない可能性があります(実機では確かめていない)。

推測: O5 の名は、skipped のジョブでは式を評価しないまま表示されています。この振る舞いは文書にありません。GitHub が skipped のジョブの名を評価するように変えても、評価の結果は `gate-g5-not-default` で、`gate-g5` と一致しません。ジョブ ID(`gate-g5`)へ戻す振る舞いに変われば、O4 の迂回が戻ります。この依存は根拠水準のマークで開示し、実環境の確認(env-check)か試行で見張る必要があります。

## 4. 方式の比較

| 案 | 内容 | 迂回(O4) | 強制層を案件ごとに変えるか | 他の部品への影響 |
| --- | --- | --- | --- | --- |
| A 現状 | `branches: [main]`。事前点検が止める | 無し | 変えない | 持ち込めない(Issue の問題) |
| B 式で書く | `branches: ['${{ … }}']` | — | 変えない | 不正なワークフローになる(O1)。採れない |
| C 構成から生成 | 初期化が既定ブランチの名を `branches:` へ書く | 無し | **変える**(案件ごとに強制層の定義が違う) | 重へ上げる条件に当たる。改名のたびに強制層の変更が要る |
| D 名の列挙 | `branches: [main, master, trunk, develop]` など | 無し | 変えない | 列挙の外の名を持ち込めない。既定ブランチでない `develop` へ push で契約検査が走り、`github.event.before` の構成との比較が既定ブランチの履歴でない比較になる |
| E 絞りを外し、ジョブの `if:` で絞る | O2 | **有り**(O3・O4) | 変えない | 集約・委任の条件3・出荷の集約の後退経路が、push の skipped の `gate-g5` を読む(§5) |
| F E + 集約の名を既定ブランチでない push で替える | O5 | 無し(O6) | 変えない | 文書に無い振る舞い(skipped のジョブの名)に依る。集約の名は既定ブランチと PR では `gate-g5` のまま |
| G 別のワークフロー(再利用) | push の契機を別のファイルへ移し、`gate-g5.yml` を `workflow_call` で呼ぶ | 無し(O7) | 変えない | 既定ブランチの実行の名が `default-push / gate-g5` に変わる。出荷の証跡の取り込み(`--workflow gate-g5`)、静的な試験、テンプレートのワークフローの一覧(`TEMPLATE_WORKFLOWS`)、逆向きの追跡の登録を改める。強制層のファイルが1つ増える |
| H 改名を求め続け、改名できない場合の手引きだけを書く | 事前点検は止めたまま | 無し | 変えない | Issue の問題が残る |

## 5. 既存の部品との組み合わせ

### 5.1 生成(`/process-init`・`generate-profile.mjs`)

`gate-g5.yml` は生成の対象ではなく、テンプレートの定義がそのまま使われます。E・F・G のどれも、生成を変えません。C だけが生成を変えます。

### 5.2 ルールセット・旧来のブランチ保護

ルールセットの対象は `~DEFAULT_BRANCH` で、既定ブランチの名に依りません。旧来のブランチ保護は名を指しますが、テンプレートの手段はルールセットで、env-check が旧来の保護を読むときもブランチの名を `gh repo view` から取ります(`adoption-trial.mjs` 1606 行)。O4 の迂回はルールセットの必須チェックの評価で生じたので、旧来の保護でも同じ評価になると推測します(確かめていない)。

### 5.3 事前点検

E・F・G のどれでも、既定ブランチへの push で契約検査が走ります。名が `main` でないことは、統制が黙って外れる状態ではなくなります。事前点検の止める項目から外せます。既定ブランチを読めない場合(`origin` の HEAD も `main` も無い)は、点検は現在のブランチを既定ブランチとみなします(`preflight.mjs` 83〜89 行)。この読み方は止める理由に使わなくなるので、事実として記録するだけで足ります。

### 5.4 出荷の証跡

ship-evidence は、出荷の対象のコミットに対する `gate-g5` の成功した実行を、ワークフローの名で探します。F は名を変えないので、既定ブランチの実行がそのまま当たります(O8。既定ブランチでない push の実行は skipped で、`--status success` に当たらない)。G は呼び出し側のワークフローを探すよう改める必要があります。

### 5.5 委任のマージと出荷の集約の後退経路

E では、既定ブランチでないブランチへの push のたびに、名が `gate-g5` の skipped の check run が先頭のコミットに付きます。委任の条件3(`delegation.mjs`)はすべての `gate-g5` に success を求めるので、委任のマージがすべて止まります(安全側の故障)。出荷の集約の後退経路(`g5FromCheckRuns`)は最も新しい check run を採るので、PR の `gate-g5` が失敗していても、後から再実行した push の skipped を採る場合があります(O3 の再実行の後の並び)。F・G では、名が `gate-g5` でないので、どちらも影響を受けません。

### 5.6 `/pit` の既定ブランチ

`next.mjs` の `defaultBranch()` は手元の `main`・`master` だけを見ます。既定ブランチが `trunk` のリポジトリでは null を返し、`doneTasks` が済んだタスクを集めません。事前点検が `main` 以外を止めていた間は表に出なかった欠けです。事前点検を外すなら、同じ変更で `origin` の HEAD を先に読む形へ直す必要があります(`preflight.mjs` の `defaultBranch` と同じ読み方)。

### 5.7 タグの push

`on.push` に `branches` を書かないと、タグの push でも起動します。`github.ref_name` はタグの名でもあるため、既定ブランチと同じ名のタグ(例: `trunk`)の push が条件を満たします(SRC-0730 c3 からの推測。確かめていない)。`branches: ['**']` でブランチに限り、条件を `github.ref == format('refs/heads/{0}', github.event.repository.default_branch)` で書けば、どちらの経路も塞げます。

### 5.8 常駐の規則の文言

テンプレートの `CLAUDE.md` の「ブランチとコミット」の核の文言は「トランクベース。main は常にリリース可能に保つ」です(`claude-md-resident.json` 457 行)。核の文言の変更は標準の規定の書き換えに当たります(ADR-0084 決定2)。本件の範囲の外とし、裁定で扱いを決めます。

## 6. 重へ上げるかの判定の材料

E・F・G は、テンプレートの1つの定義をすべての案件で同じに使います。強制層のワークフローを案件ごとに変える経路は生じません。C だけが生じます。C を採らない限り、軽のまま進められます。
