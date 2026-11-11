# #362 独立の突合(実装を見ていない別の文脈)

- 実施日: 2026-11-12
- 対象: 準拠テンプレート `template/` の commit `a0f5d2d`(親 `89d02d6`)、標準の本文の未コミットの変更(ADR-0123 新規、`phase5-implementation/template-repository.md`、`phase5-implementation/ci-gates.md`、`phase4-process-design/gate-criteria.md` の IMPL-0238・IMPL-0485、`src/data/impl-targets.yaml`、`src/data/impl-inventory.yaml`、自動生成の台帳)
- 照らす基準: `decision.md`(議長の裁定 R-1〜R-6)、`survey.md`、ADR-0084・ADR-0085・ADR-0115、`community/implementation-marking.md`、`community/evidence-marking.md`、`adr/index.md` の運用ルール
- 実装者の説明は受け取っていない。コードと文書と、手元での実行だけで判断した
- 実行で確かめたこと
  - `node scripts/gate/test-push-trigger.mjs`: 20/20 通過
  - `node scripts/gate/test-adoption.mjs`: 69 件一致
  - `node scripts/check-impl.mjs`・`node scripts/check-evidence.mjs`: 終了コード 0
  - `node scripts/gate/test-g5-aggregate.mjs`: 4 件が NG。作業ツリーの `gate-g5.yml` が CRLF(`git ls-files --eol` で `i/lf w/crlf`)で、試験の置換が空振りしたもの。本件の変更は `needs` の行に触れていないので、本件に帰さない
  - `test-env-check.mjs` は Windows で省かれた(模擬の gh を置けない)
  - `push-trigger.mjs` の `pushTriggerProblems` へ、書き方の揺れの写し 30 通りを入れた探り(結果は X-6)

## 観点1 必須チェック gate-g5 を PR の契機の外で満たす経路

テンプレートの定義のうえでは、新しい経路は見つからなかった。

- `gate-g5-push.yml` のジョブは ID・名とも `default-push` だけ。既定ブランチでない push では skipped の `default-push` だけが付き、既定ブランチでは `default-push / <ジョブ名>` になる(どちらも `gate-g5` と一致しない)
- 再実行: 呼び出し側の `if:` が再評価されるだけで、名は変わらない
- 同じコミットを指す複数のブランチ: `default-push / gate-g5` は既定ブランチの push のコミットに付くが、名が一致しない
- `delegation.yml` の `workflow_run: workflows: [gate-g5]`: 呼ばれた側(`workflow_call`)の完了では起動しない。旧来の push の実行で起動していた分は消えるが、判定のジョブは `workflow_run.event == 'pull_request'` で絞っていたので、振る舞いは変わらない
- 既定ブランチでないブランチでの `workflow_dispatch`(T11)は裁定どおり範囲の外。ADR-0123 と第5章に明記されている
- PR の側で `gate-g5-push.yml` を書き換えた場合、その push の実行は PR の側の定義で動く。ただし、これは「任意のワークフローを足せる」既存の弱さと同じで、`.github/workflows/**` は `CONTROL_FILES`(`check-pr.mjs` 349 行)に入るので、`gate-g5-base` の承認の要求が当たる(ADR-0115 と整合)。契約検査の `push-trigger` の検査は PR の側のコードで動くため、同じ PR で外せる。この点は ADR-0115 の扱いと同じで、新しい矛盾ではない

確かめていない GitHub の振る舞いは X-7 に挙げる。

## 観点2 workflow_call で呼ぶことで壊れるもの

指摘は X-2(成果物の取り込みの主経路を確かめていない)だけ。その他は次のとおりで、指摘なし。

- permissions: 呼び出し側が `gate-g5.yml` と同じ値(`contents: read`・`pull-requests: write`・`issues: read`)を与える。呼ばれた側は呼び出し側を超えられないが、同値なので欠けない
- secrets: `gate-g5.yml` は `secrets.*` を参照しない(`github.token` だけ)。`secrets: inherit` が無くても欠けない
- concurrency: どちらのファイルにも無い。変化なし
- `github.event_name`・`github.event.before`: 呼ばれた側でも呼び出し側の push を指す(GitHub の文書の挙動。EV-0245 で実機の観測を開示)。`contract` の push の分岐、`test` のカバレッジの比較の起点、`pr-rules`・`dependency-diff` の `pull_request` の条件は、旧来の push の実行と同じ値で評価される
- `aggregate-evidence.mjs` の `check_name=gate-g5` は PR の先頭のコミットだけを引く(1905 行)。既定ブランチのコミットの check run を名で読む箇所は無い
- 静的な試験(`test-check-pr.mjs`・`test-context-refs.mjs`・`test-init-g5.mjs`・`test-g5-aggregate.mjs`)は `gate-g5.yml` の `on:` の push を読まない。`base-judge.mjs` が契機を調べるのは `gate-g5-base.yml` だけ

## 観点3 push-trigger.mjs の検査と事前点検

X-6、X-9、X-10、X-12。

## 観点4 既存の ADR・条項・語彙との矛盾、文書とコードの食い違い

X-3、X-4、X-5、X-8、X-11。

## 観点5 裁定と実装の食い違い

X-1、X-2。そのほかの裁定の項目(R-1 の形、R-2 の止める項目と契約検査、R-3 の `/pit`・ship-evidence・env-check・`TEMPLATE_WORKFLOWS`・登録簿・第4章・第5章、R-4 の採らない案の表、常駐の規則の核の文言を改めないこと)は実装されている。裁定に無い変更は見つからなかった。

## 指摘

### X-1 実機の確認の記録が無い。裁定 R-5・R-6 の記録の要件を満たしていない(重大度: 中)

- 所在: `src/content/docs/adr/0123-default-branch-agnostic-push-trigger.md` 12 行・18 行、`template-repository.md` 129〜135 行(EV-0245)、`research/362-deliberation/`
- 根拠
  - ADR-0123 は、承認の記録と審議の記録の置き場として `research/362-deliberation/implementation.md` を挙げる。しかし、このファイルは存在しない(ディレクトリにあるのは `survey.md`・`council-01-drafter.md`・`council-02-opponent.md`・`decision.md` だけ)
  - `survey.md` の観測 O1〜O8 は「検証用の最小のもの…テンプレートの `gate-g5.yml` そのものではありません」と書いてある。一方、ADR-0123 の「確かめた事実」26・27 行と EV-0245 の補足は「テンプレートの実物の `gate-g5.yml`」での観測(T1・T2・T3・T6・T11)を事実として挙げる。それらの実行の番号・リポジトリ・出力は、どの記録にも無い
  - R-6 は「観測の日付と件数を書き」と定める。EV-0245 には日付(2026-11-11)はあるが、件数が無い
  - R-5 は、委員1 の T2・T5・T7〜T10 について、行ったか行わなかったかを実装の記録に明記するよう求める。EV-0245 の補足が触れるのは T2(再実行。行った)、T5(出荷の証跡の通し。行わなかった)、T8(改名への追随。行わなかった)、T10(旧来の保護。行わなかった)だけ。T7(委任)と T9(既定ブランチが main)は、どこにも書かれていない

### X-2 裁定 R-5 の T4 を行っていない。成果物の取り込みの新しい主経路は、試験でも確かめていない(重大度: 中)

- 所在: `ci-gates.md` 923 行、`template-repository.md` 134 行、`template/.github/workflows/ship-evidence.yml` 126〜131 行・351〜356 行、`template/scripts/gate/adoption-trial.mjs` 1851〜1852 行、`template/scripts/gate/test-env-check.mjs` 91 行
- 根拠
  - R-5 の実機の表は、T4「既定ブランチへの push で、`default-push / gate-g5` が完了し、成果物が呼び出し側の実行に付くこと」を確かめる項目に挙げる
  - `ci-gates.md` 923 行によると、実機の確認は「構成が未設定の一時リポジトリ」で行った。未設定では `test`・`ip-clearance` が `needs.config.outputs.configured == 'true'` で飛ぶため、`test-results`・`license-scan` は作られない。EV-0245 の補足も、成果物が呼び出し側の実行に付くことを「確かめていない」に挙げている。開示はされているが、裁定が必須とした確かめの項目を行っていない
  - ship-evidence と env-check は `gate-g5-push.yml` の実行を先に探す形に変わった。しかし、模擬の gh の試験(`test-env-check.mjs`)の鍵は旧来の `run list --repo … --workflow gate-g5 …` だけで、`--workflow gate-g5-push.yml` の呼び出しは 404 になる。このため試験は後退の経路を通って通過し、新しい主経路(push の実行が当たる場合)は一度も通らない。ship-evidence の変更に対応する試験は見当たらない

### X-3 ADR-0085 のステータスの節が後継を指していない。ADR-0123 は置き換える決定の番号を書いていない(重大度: 中)

- 所在: `src/content/docs/adr/0085-adoption-into-existing-repositories.md` 10 行(変更なし)、`adr/0123-…md` 10 行、`src/content/docs/adr/index.md` 20・22 行(運用ルール3・5)
- 根拠
  - 運用ルール5 は「同じ変更で、置き換えられた側のステータスの節に後継の番号を書き、両側が互いを指す状態にする」と定める。`git diff` に ADR-0085 は含まれず、そのステータスの節は「一部置き換え(→ ADR-0086 の決定1、→ ADR-0087 の決定2)」のままで、ADR-0123 を指していない
  - 運用ルール3 は「一部だけを置き換えた場合は、置き換えた決定の番号を書く」と定める。ADR-0123 のステータスは「事前点検の止める項目のうち『既定ブランチが `main` でない』」と書くだけで、ADR-0085 の決定の番号を書いていない。事前点検は ADR-0085 の決定2(78 行)で、止める項目は 83 行にある

### X-4 準拠テンプレートの利用者向けの文書が、コードと逆のことを述べている(重大度: 中)

- 所在: `template/README.md` 50 行、`template/.claude/skills/process-init/SKILL.md` 33 行
- 根拠
  - README.md 50 行は「既定ブランチが `main` でないリポジトリと、`gate-g5.yml` の無いリポジトリは、事前点検が止めます(push の契機が `main` 固定のため…)」と書く。`a0f5d2d` で `preflight.mjs` はこの項目を外した
  - process-init の SKILL.md 33 行は、止める項目に「既定ブランチの名」を挙げる。新しい止める項目 `push-trigger` は挙がっていない
  - どちらも commit `a0f5d2d` の変更の範囲に入っていない。R-3 は「標準の本文」の改めを列挙するが、テンプレートの手引きの改めを除外する定めは無い

### X-5 標準の本文の中で、push の契約検査を実機で確かめたかの記述が食い違う(重大度: 低)

- 所在: `template-repository.md` 987 行
- 根拠: 987 行「基底ブランチとの比較、既定ブランチへの push を契機とする契約検査、…は、実際の GitHub 上で実行していない」は改められていない。同じページの 134 行(EV-0245)と `ci-gates.md` 923 行は「2026-11-11 に…実行し、push の直前のコミットと比べる分岐が…働くことを確かめた」に改められている

### X-6 「どのワークフローにも、名か ID が gate-g5 のジョブが無い」の検査は、2字下げのブロック形の YAML しか読まない。標準の本文は限定なく書いている(重大度: 低)

- 所在: `template/scripts/gate/push-trigger.mjs` 54・66〜81・124〜129 行、`template/scripts/gate/g5-aggregate.mjs` 42〜60 行(`jobsOf`)、`template-repository.md` 80 行・108 行、`gate-criteria.md` の IMPL-0485
- 根拠: 手元の探りで、次の写しを入れても `pushTriggerProblems` は不備を出さなかった
  - 別のワークフローで名か ID が `gate-g5` のジョブ: 4字下げのジョブ、`jobs: # コメント`(`jobsOf` の `^jobs:\s*$` に当たらない)、流れ形 `gate-g5: {runs-on: …}`、ブロックスカラーの名(`name: >-` の次の行が `gate-g5`)、`matrix` から来る名、`format('gate-{0}', 'g5')` で組む名
  - `gate-g5.yml` へ引用符つきの事象のキー `"push":` で push を戻す写し(`eventsOf` の `^ {2}([A-Za-z_]+):` に当たらない)
  - `gate-g5.yml` へ `schedule`・`pull_request_target`・`merge_group`・`workflow_run` を足す写し。ただし、どれも check run が PR の先頭以外のコミットに付くため、影響は小さい
  - `gate-g5-push.yml` のジョブへ `secrets: inherit`・`with:`・`strategy`、ワークフローへ `concurrency`(`cancel-in-progress: true`)を足す写し。R-2 が挙げる形(契機・ジョブ・条件・呼び先)の外なので、裁定とは食い違わない。ただし、`secrets: inherit` を足すと呼ばれた側がリポジトリの秘密情報に届き、`cancel-in-progress` を足すと既定ブランチのコミットの実行が欠ける。どちらも検出されない
  - 読む対象は `.github/workflows/` のすべての YAML で、採用者の既存のワークフロー(テンプレートの書き方とは限らない)を含む。`push-trigger.mjs` の冒頭(14 行)は「このテンプレートの書き方(2 字下げのキー)だけを読む」と開示している。しかし、`template-repository.md` 80 行の表・108 行の箇条と IMPL-0485 の note は「どのワークフローにも」「いずれかで失敗する」と、限定を付けずに書いている

### X-7 確かめていない GitHub の振る舞いへの依存が、開示の対象から漏れている(重大度: 低)

- 所在: `ship-evidence.yml` 128〜131 行・353〜356 行、`adoption-trial.mjs` 1851 行、EV-0245
- 根拠
  - (a) 呼び出し側のジョブだけが skipped の実行の結論(conclusion)が `success` にならないこと。`--status success` で既定ブランチでない push の実行を除けることは、O8 で F の構成(呼び出しを持たない、ジョブが skipped の実行)についてしか観測していない。G の構成(skipped の呼び出し側のジョブ)では観測の記録が無い。もし `success` になる場合の動きは次のとおり。ship-evidence は `--limit 1` で1件だけを採り、`gh run download` が失敗しても次の実行を探さない。このため、出荷の対象と同じコミットを指す既定ブランチでないブランチ(`ship/*` を既定ブランチの先頭から切った場合など)の push の実行を採り、取り込みが欠ける。env-check は `--commit` を付けずに最新の1件を採るため、成果物の無い実行で不一致になる。どちらも欠落・不一致として表に出るので黙っては通らないが、EV-0245 の対象にこの前提は書かれていない
  - (b) 必須チェックの発行元(`integration_id`)をルールセットで固定していない(`template/.github/rulesets/*.json` に `integration_id` が無い)。名が `gate-g5` の commit status や他の発行元の check run は、push のワークフローの形と無関係に必須チェックを満たしうる。既存の開示(`.claude/skills/artifact/artifacts/adoption-trial.md` 35 行「必須チェックの発行元(`integration_id`)は確かめていない」)はある。ADR-0123 と EV-0245 は「名が `gate-g5` の check run が PR の契機の外で付く経路」を形で閉じたと述べるが、この前提の限りであることは書かれていない

### X-8 IMPL-0238 の降ろし先が push の契機を運ぶファイルを指していない。新しい降ろし先はどのマークからも使われていない(重大度: 低)

- 所在: `gate-criteria.md` 1440 行(IMPL-0238)、`src/data/impl-targets.yaml` 421 行(`gate-g5-push-workflow`)
- 根拠: IMPL-0238 の note は「gate-g5-push.yml が既定ブランチへの push を契機に」と改められた。しかし `target=gate-g5-workflow`(`gate-g5.yml`)のままで、既定ブランチへの push の契機を置くファイル `gate-g5-push.yml` を指していない。新しく登録した降ろし先 `gate-g5-push-workflow` を `target=` に持つマークは、標準の本文に1件も無い(`grep -rn gate-g5-push-workflow src/content/docs` は0件)。検査(`check-impl.mjs`)は通る

### X-9 既定ブランチの読み違いの注記がログにしか出ず、点検の結果に残らない。注記の試験も無い(重大度: 低)

- 所在: `template/scripts/gate/preflight.mjs` 234 行・359 行、`template/scripts/gate/test-adoption.mjs` 263〜275 行
- 根拠
  - R-2 は「既定ブランチの名と読み方は、事実として点検の結果に残す。読み方が『現在のブランチ』のときは、読み違いの可能性を告げる注記を出す」と定める。名と読み方は `facts.defaultBranch` に残る。しかし、注記は `printPreflight` の `log` だけで、`preflight()` の戻り値(stops・tells・facts)に入らない。初期化が点検の結果を記録しても、注記は残らない
  - 試験の場面(`trunk` に改名、origin なし)では、読み方は「現在のブランチ」になる。注記が出ることを確かめる検査は無い
  - 名で止めていたあいだは、「現在のブランチ」の読み方で `main` 以外の名(作業ブランチで点検した場合を含む)が出れば止まっていた。いまは止まらず、上の注記(記録に残らない)だけになる

### X-10 main を前提とした手順・既定値が残っている。事前点検が名で止めなくなったため、trunk などの案件で到達する(重大度: 低)

- 所在: `template/scripts/gate/verify-gate-contract.mjs` 107 行(`--delegation` の既定 `origin/main`)、`template/scripts/gate/dependency-diff.mjs` 36 行、`template/.claude/skills/gate/gates/G-6.md` 61 行、`gate/SKILL.md` 59 行、`gate/reference/recording.md` 81 行、`human-verify/SKILL.md` 59〜60 行、`implement/SKILL.md` 97 行、`gate/gates/G-5.md` 37 行、`README.md` 80 行
- 根拠: どれも `origin/main` を既定または例として書く。trunk の案件では git のエラーで止まる側に倒れる(`--delegation` は「判定できない変更は協働として人の判定へ渡す」)ので、黙っては外れない。R-3 が棚卸ししたのは `next.mjs` と `adoption-trial.mjs` だけで、これらは扱われていない。既知の食い違いとして記録したのは、常駐の規則の核の文言だけである

### X-11 EV-0245 の差し替え条件が、根拠水準の書式の規則に沿っていない(重大度: 低)

- 所在: `template-repository.md` 132 行(EV-0245 の差し替え条件)、`community/evidence-marking.md` の要素の表(差し替え条件の行)
- 根拠: 規則は「何が得られたら確定させるか。『見直す』ではなく、判断に使う材料を体言止めで書く」。EV-0245 は「観測の源は…です。名が `gate-g5` の check run が PR の契機の外で付いた件が1件でもあれば、形を見直します」と、ですます調の文で、見直しの条件を書いている。確定させる条件(何件の観測で E3 とするか)は無い。既存の EV-0167 も同じ書き方で、`check-evidence.mjs` は通る

### X-12 既定ブランチを出荷の系列にしない型が新たに持ち込める。出荷の系列のブランチに統制が掛からないことは書かれていない(重大度: 低)

- 所在: `template-repository.md` 124 行、`template/.github/rulesets/*.json`(対象 `~DEFAULT_BRANCH`)、`gate-g5-push.yml` 26 行
- 根拠
  - 旧来は、名が `main` でなければ止まった。そのため、`develop` を既定ブランチにして `main` などから出荷する型は、名の項目で偶然に止まっていた。いまは止まらない
  - ルールセット(必須チェック)と push の契約検査は、既定ブランチにしか掛からない。このため、この型の出荷の系列のブランチには、どちらも掛からない
  - 124 行は「出荷の範囲は既定ブランチの先頭までと読まれる」と読み方だけを書く。出荷の系列のブランチに必須チェックも push の契約検査も掛からないことは書かれていない
  - 裁定 R-2 は「名は、既定ブランチが出荷の系列かどうかの手がかりにならない(`main` を既定にして別のブランチから出荷する型も同じく止まらない)」として、名で止めることを退けた。このため、実装は裁定と食い違わない。読み手が「持ち込める」と「統制が掛かる」を区別できる記述になっているかを、指摘として残す

## 指摘の一覧

| 番号 | 重大度 | 要旨 |
| --- | --- | --- |
| X-1 | 中 | ADR-0123 が指す `implementation.md` が無い。テンプレートの実物での実機の確認(T1・T3・T6・T11)の実行の記録・件数が無く、T7・T9 の実施の有無も書かれていない |
| X-2 | 中 | 裁定が必須とした T4(成果物が呼び出し側の実行に付く)を、未設定の構成のため行っていない。ship-evidence・env-check の新しい主経路は試験でも通らない |
| X-3 | 中 | ADR-0085 のステータスが ADR-0123 を指していない。ADR-0123 は置き換える ADR-0085 の決定の番号(決定2)を書いていない(adr 運用ルール3・5) |
| X-4 | 中 | テンプレートの README.md 50 行と process-init SKILL.md 33 行が、「既定ブランチが main でなければ止める」と、コードと逆のことを書いている |
| X-5 | 低 | template-repository.md 987 行の「push の契約検査は実機で実行していない」が、同ページ 134 行・ci-gates.md 923 行と食い違う |
| X-6 | 低 | 名・ID が gate-g5 のジョブの検査が、2字下げのブロック形以外(4字下げ・コメント付きの jobs:・流れ形・matrix・format・引用符つきのキー)を見逃す。標準の本文は「どのワークフローにも」と限定なく書く |
| X-7 | 低 | 呼び出し側だけが skipped の実行の conclusion、および必須チェックの発行元を固定していない前提が、EV-0245 の開示の対象に入っていない |
| X-8 | 低 | IMPL-0238 の target が gate-g5.yml のまま。新しい降ろし先 gate-g5-push-workflow を使うマークが無い |
| X-9 | 低 | 既定ブランチの読み違いの注記がログだけで、点検の結果に残らない。試験も無い |
| X-10 | 低 | `origin/main` を前提とした既定値・手順(--delegation、dependency-diff、各スキル)が残る。止まる側に倒れるが、棚卸しされていない |
| X-11 | 低 | EV-0245 の差し替え条件が、「見直す」を避けて材料を体言止めで書く書式の規則に沿わない |
| X-12 | 低 | develop を既定にする型が新たに持ち込めるが、出荷の系列のブランチに必須チェックも push の契約検査も掛からないことが書かれていない |
