# #361・#452 一時リポジトリの検証計画(束 B34、2026-11-26)

受付は `00-intake.md`(項目の ID は同じ)。#452 の測るものは `research/452-deliberation/00-intake.md`。この計画は、実行役が手順どおりに動ける粒度で書く。**実行役は §0 の答えを得てから着手する**。

## 0. 着手の前に所有者に問うこと

| # | 問い | 理由 | 答えが否のとき |
| --- | --- | --- | --- |
| Q1 | 一時リポを **public** で作ってよいか(または一時に Pro へ上げるか) | 所有者は GitHub Free。private ではルールセット・旧来のブランチ保護が 403 で使えない(2026-11-26 に既存の private 2件で確かめた)。#371 の前例は `--public`。公開でも秘密情報は置かず、中身は合成の小さなアプリだけ。公開なら Actions の分も無償 | 全部 private で作り、条件 V の8件(`00-intake.md` §5.3)を不可として開示する。README の「ルールセットを使えない場合」の経路の観測に切り替える |
| Q2 | gh に登録済みの別のアカウント `ganbariquestsupport-lab` を、承認者・フォークの持ち主として使ってよいか | C-1・C-4・C-5(E-7)・C-6b は PR の作成者と別のアカウントが要る。同じ人が操る2つのアカウントは「別の人」の独立性を示さないが、ホスティングの振る舞い(別のアカウントの承認を受け付けるか、フォークの PR で秘密情報に届かないか)の確認には足りる。その旨を記録に書く | 4件を不可のまま開示する(現状どおり) |
| Q3 | 委任のマージ(C-18)のため、一時リポだけに範囲を限った fine-grained PAT を `delegated-merge` の Environment の秘密情報に置き、削除の前に失効させてよいか | 許しは「秘密情報なし」。マージの実行には `DELEGATED_MERGE_TOKEN` が要る | C-18 を不可のまま開示する |

推奨: Q1 は public(go だけ private にして Free の private の経路を観測する。§1)。Q2・Q3 は所有者の判断。

## 1. 一時リポの割り当て

| リポ | 公開 | 体制の回答 | ルールセット | 主に確かめる項目 | #452 |
| --- | --- | --- | --- | --- | --- |
| `pit-in-trial-node-tmp` | public(Q1) | 1〜2名・確認者なし(`size-1-2`・`reviewer-no`) | checks-only | B-1〜B-7(node)、C-16、C-19〜C-22、C-25・C-26、C-28、C-8〜C-14(record-copy)、C-3 | **兼ねる**(主) |
| `pit-in-trial-python-tmp` | public(Q1) | 3〜9名・G-6 を適用(team) | team | B-1・B-2・B-7(python)、旧来の保護とルールセットの重なり、C-17・C-18、C-27(スカッシュ)、C-6a・C-6b、C-4・C-5(Q2) | 兼ねない |
| `pit-in-trial-go-tmp` | **private**(Free の経路の観測) | 1〜2名・確認者なし | 適用を試みて 403 を記録 | B-1・B-2・B-7(go)、Free の private での env-check の読み、C-29a、C-30a、C-24a | 補助(置き場の比較に使ってよい) |

go を private に置く理由: 採用者の多くが個人の private で始める。env-check が 403 をどの値に読むか(未確認(権限不足)か、ほかか)と、出荷の集約が「止められない」を開示するかを実機で見られるのは、この形だけである。go で public が要る項目(C-30a のマージの方式は private でも設定できる)は置いていない。Q1 が「全部 private」なら、node と python のルールセットの項目を不可にする。

## 2. 持ち込みの前の既存の状態(実行役が作る)

各リポは、テンプレートからでなく**空のリポに既存のアプリを置いて**作る(`gh repo create Takenori-Kusaka/<名> --public|--private --clone`)。既存の履歴は5コミット以上に分ける(初期・機能・CI・CODEOWNERS・修正)。秘密情報・実在の個人の情報は置かない。

### 2.1 node

- `package.json`(name・`test: jest`・`lint: eslint .`。`coverage` のスクリプトは**置かない**: 定め3 の観測)、`package-lock.json`、`src/sum.js`・`src/cli.js`、`__tests__/sum.test.js`、`.eslintrc.json`
- 既存の CI `.github/workflows/ci.yml`(`on: [push, pull_request]`、ジョブ名 `test`、`npm ci && npm test`)
- `.github/CODEOWNERS`(`* @Takenori-Kusaka`)
- 既存の `CLAUDE.md`(区間の目印なし。数行の独自の規則)・`README.md`・`.gitignore`
- **旧来のブランチ保護**を main に置く(`gh api -X PUT repos/{o}/{r}/branches/main/protection`、必須チェック `test`、`enforce_admins: true`、レビューは要さない)
- 開いている PR を1本残す(`feat/wip`。持ち込みの後に必須チェックがどう効くかを見る: EV-0107)

### 2.2 python

- `pyproject.toml`(setuptools、`[project.optional-dependencies] dev = [pytest, pytest-cov, ruff]`)、`src/calc/__init__.py`・`src/calc/core.py`、`tests/test_core.py`。`requirements-dev.txt` も置く(アダプタの `pip install -e ".[dev]"` と既存の形の食い違いの観測: EV-0170)
- 既存の CI `.github/workflows/test.yml`(ジョブ名 `pytest`。`pip install -r requirements-dev.txt && pytest`)と `lint.yml`(ruff)
- `CODEOWNERS` をリポの**直下**に置く(テンプレートの置き場と違う: 告げる項目の観測)
- `scripts/CLAUDE.md`(入れ子の指示ファイル: 止める項目の観測)
- **既存のルールセット**を main に置く(必須チェック `pytest`、承認1、bypass なし)。旧来の保護も1つ置く(必須チェック `lint`)。重なりの読み方を見る

### 2.3 go

- `go.mod`(module `example.com/trialgo`)、`cmd/trialgo/main.go`、`internal/calc/calc.go`・`calc_test.go`、`Makefile`(`test`・`lint`)、`.golangci.yml`
- 既存の CI `.github/workflows/go.yml`(ジョブ名 `build`。`go test ./...`、golangci-lint)
- `docs/CODEOWNERS` と `.github/CODEOWNERS` の**2か所**(止める項目の観測)。既定ブランチを `master` にする(既定ブランチの名を問わない契機の再観測: EV-0245)
- ルールセット・保護の適用を試み、403 の応答を記録する(private の Free)

## 3. 持ち込みの手順(README「既存のリポジトリへ持ち込む場合」と `template-repository.md` の手順の表のとおり)

各リポで次を行う。**手順に無い操作をしたら、その都度 `trial-log.md`(リポの外、§7 の記録の置き場)へ「いつ・何を・なぜ」を1行ずつ書く**(B-1 の材料)。

1. ブランチ `chore/adopt-pit-in` で、template d5d2d86 の追跡ファイルを既存のファイルを上書きせずに複製する(`git -C template ls-files` の一覧を、存在しないものだけ写す)。履歴は併合しない
2. 名前の重なるファイル(`CLAUDE.md`・`CODEOWNERS`・`.gitignore`・`README.md` など)へ、既存の内容を残してテンプレートの側を含める。`CODEOWNERS` は1か所に置き、`@OWNER` を `@Takenori-Kusaka` に置き換える
3. `node scripts/gate/preflight.mjs` を実行し、出力を保存する。止める項目を直し、直した手数を数える。フックの登録が無ければ `node scripts/init/generate-profile.mjs --merge-hooks`
4. 資産があれば `node scripts/gate/preflight.mjs --draft > docs/adoption-inventory.md`。扱い・確定した者・確定日は**所有者が書く**(実行役は下書きまで。所有者が不在なら「試行の代記(所有者の許し 2026-11-26。技術判断者の記名ではない)」と明記して埋め、記録にそう書く)
5. 持ち込みの PR を開いて取り込む(既存の保護・ルールセットの必須チェックが効く。node では開いている PR `feat/wip` の状態も記録する)
6. ブランチ `chore/process-init` で `/process-init` の道具を回答のファイルで実行する(`generate-profile.mjs --answers answers.json --stack <node|python|go> --template-commit d5d2d86`)。node は `npm install` でロックファイルを更新。PR 本文は `.github/PULL_REQUEST_TEMPLATE.md` から作り、末尾の段落に `Spec: setup`
7. 初期化の出力のとおりにルールセットを人の操作として適用する(`gh api repos/{o}/{r}/rulesets --input .github/rulesets/<checks-only|team>.json`)。スカッシュのメッセージの設定(README)と `records.json` も適用する。旧来の保護は消さない(重なりの観測)
8. `node scripts/gate/adoption-trial.mjs env-check --by <記名>` を実行し、`docs/adoption-trial/env-check.json` を PR でコミットする。記名は §4 の扱いに従う

## 4. 人が要る操作の扱い

| 操作 | 本試行での扱い | 記録に書くこと |
| --- | --- | --- |
| 資産の一覧の扱いと記名、G-1〜G-8 の判定の記録 | 所有者が書く。不在なら実行役が「試行の代記」と明記して埋める | 実運用の任免・判定ではない(pit-in-trial-54 と同じ) |
| env-check の `--by` | 所有者の氏名で所有者が実行するのが本来。実行役が回すときは、道具が AI の名義を拒むため、所有者の許しの下で所有者の氏名を渡し、「試行の代記」と記録する | env-check の**機械の読み**(9項目の値)を観測の対象とし、記名の確認は観測していないと書く |
| ルールセットの適用 | 実行役が所有者のアカウントの gh で行う(所有者の許しの範囲内) | 適用のコマンドと応答 |
| 出荷の PR を開く | `GITHUB_TOKEN` は PR を作れない(既知)。ship-evidence が出した URL の内容で、所有者のアカウントの gh で `gh pr create` する | 人の名義で開いたが操作は実行役。人が開いた PR で gate-g5 と verify が起動したか |
| 出荷の PR の承認(作成者以外) | checks-only(node・go)は承認を要さないので、そのままマージする。team(python)は Q2 が可なら別のアカウントで承認、否なら**マージしない**で「承認の要る操作は再現できない」と記録する | ルールセットが止めた事実(マージの拒否の応答) |
| コード所有者の承認・フォーク | Q2 による | — |

## 5. 流す PR の列(出荷まで)と項目の対応

番号は各リポの PR の順。`Spec:` はすべて PR 本文の末尾の段落に置く。

### 5.1 node(`pit-in-trial-node-tmp`)

| # | PR / 操作 | 観測すること | 合否 | 項目 |
| --- | --- | --- | --- | --- |
| N1 | 持ち込み(§3 の1〜5) | preflight の止める・告げる、手順に無い作業、`feat/wip` の必須チェックの状態 | 記録が取れたら可 | B-1・B-3a・EV-0107 |
| N2 | 初期化(`Spec: setup`) | G-5 の結果、`coverage` のスクリプトが無いことの扱い(定め3) | 記録が取れたら可 | B-1 |
| N3 | ルールセット適用 → env-check の PR | env-check の9項目の値。旧来の保護との重なりの読み | 9項目が確認済みか規定の対象外なら EV-0169 を満たす | B-2・B-4a・B-7・C-15 |
| N4 | ship-evidence の実行の中で読める範囲の測定(一時の作業ブランチで `ship-evidence.yml` に env-check の読みの手順を足し、`permissions` を (a) テンプレートの既定 (b) `read-all` に変えて(`GITHUB_TOKEN` には管理の権限の範囲が無いため、Actions の設定の読みは 403 になると見込む。見込みを確かめる) `workflow_dispatch`。マージしない) | 9項目のうち `GITHUB_TOKEN` で読めた項目・403 の項目 | 表が取れたら可 | B-6・B-4a |
| N5 | `/spec-write` → F-001 の spec.md・plan.md(G-2・G-4 の判定記録を records ブランチへ) | #452 の材料。計画の「変更の対象パス」 | — | #452 |
| N6〜N9 | F-001 の Task-1〜3 の実装(`Spec: F-001 / Task-N`)、F-002 の spec・plan と Task-1〜2 | #452 の材料。check-pr のパスの差(IMPL-0205)の出力 | — | #452 |
| N10 | 上程の Issue(様式 `pre-review.yml`)と、「対象」欄に `#Issue` を書いた判定記録の PR | pre-review-responded の結び付け、権限 read、要約 | 結べたら EV-0338 を満たす | C-19・C-20 |
| N11 | 結べない記録の PR・壊れた記録の PR(各1本) | 警告とジョブの要約 | 警告が出れば可 | C-20 |
| N12 | pre-review-responded を必須チェックへ足し、記録を含まない PR を1本 | マージ可否 | 止まらなければ可 | C-21 |
| N13 | `pre-review.mjs metrics` の実行 | 日数の指標の「代理」の表示 | 出れば可 | C-22 |
| N14 | 手動の起動の検査: 新しいブランチ `probe/dispatch` を push し、PR を開く**前に** `gh workflow run gate-g5.yml --ref probe/dispatch`。成功の後に PR を開き、PR の契機の gate-g5 が走る**前に** `gh pr merge --squash` を試す。次に PR の契機の実行を取り消した状態でも試す | マージの可否と、check run の契機(`event`) | 手動の起動の成功だけで必須チェックが満たされたか(満たされたなら EV-0325・0285 の事実を「満たす」に差し替え、外すかの決定へ) | C-16 |
| N15 | 演習用ブランチ `drill/seed` を作り、そこ宛の PR で gate-g5 と gate-g5-base を通したコミットの SHA を `git push origin <SHA>:main` | push の受理か拒否か(拒否の応答の文) | 結果を記録すれば可。受理なら C-26 を重の議題へ | C-25・C-26・EV-0345 |
| N16 | 落ちるテストの push → テストのファイルだけを直す push(同じ PR) | `gh api repos/{o}/{r}/commits/{sha}/check-runs` で push ごとの結論を読めるか | 2つの push の結論が読めれば前提は成り立つ | C-28 |
| N17 | ai-review の差し込みの手順を読み出しの模擬に替えた PR(probe-369 と同じ。一時の作業ブランチで既定ブランチの定義を替えてから) | フォークの判定・失敗の表示・notice の always()・許す形の一覧 | 定義どおりなら可 | C-3 |
| N18 | record-copy: N17 の PR を2回 push、ai-review を再実行して成果物を2つにしてからマージ。成果物に痕跡を残すスクリプトを含める。別の PR をマージせずに閉じる。`permissions` に `actions: read` を足す PR を1本(マージしない) | C-8〜C-13 の各点。records ブランチの `records/reviews/pr-<n>.json` | 各点が note の記述どおりなら可 | C-8〜C-13 |
| N19 | 削除の前に records ブランチから写しを取り出し、sha256 を元の成果物と照合 | 一致 | 一致すれば可 | C-10・C-14 |
| N20 | タグ `v0.1.0` の push → ship-evidence → `ship/<日付>` → 所有者の gh で出荷の PR → verify → マージ | 集約の結論、保証の開示、PR で gate-g5 と verify が起動したか、所要時間 | 出荷の PR が取り込めれば「出荷まで通した」 | B-1・B-7・EV-0107 |
| N21 | B-5 の再観測: PR の側のワークフローに名が `gate-g5` のジョブを足した PR(マージしない) | 必須チェックが満たされるか | 2026-11-05 の事実と同じなら閉じる | B-5 |

### 5.2 python(`pit-in-trial-python-tmp`)

| # | PR / 操作 | 観測すること | 合否 | 項目 |
| --- | --- | --- | --- | --- |
| P1 | 持ち込み | 直下の CODEOWNERS・入れ子の `scripts/CLAUDE.md` の止める・告げる、既存のルールセット(承認1)が持ち込みの PR を止めること | 記録が取れたら可 | B-1・B-3a |
| P2 | 初期化(team の回答) | アダプタの前提(`pip install -e ".[dev]"`・ruff のリポ全体)と `requirements-dev.txt` の食い違い。手順に無い作業 | 記録が取れたら可 | B-1・EV-0170 |
| P3 | team.json の適用 → env-check | 既存のルールセット+旧来の保護+team の重なりの読み。9項目 | EV-0170(python)の判定 | B-2・B-4a・B-7 |
| P4 | 委任: `delegation.yml` を既定(無効)のまま、委任の該当になる PR と、ならない PR を各1本 | 必須でないステータス、承認を付けない記録、判定した時点のコミット | 要求事項1〜6 のうち判定と記録が定義どおりなら可 | C-17 |
| P5 | (Q3 が可のとき)Environment `delegated-merge` と変数 `DELEGATED_MERGE_ENABLED=true`、PAT を置き、P4 の該当の PR で判定の後に1コミット push | 判定した時点のコミットに固定したマージか、push の後に止まるか | 固定が効けば可 | C-18 |
| P6 | スカッシュの設定A(既定のコミットの箇条)で、末尾の段落に `Spec: F-001 / Task-1` を置いた PR を取り込む。設定B(PR の題名と本文)へ切り替えて同じ形の PR を取り込む | 既定ブランチに作られたコミットのメッセージ。`specTrailersOf`(手戻り率)・`next.mjs` の済みのタスク・`aggregate-evidence` の `specs` の数え | 2つの設定の結果を記録すれば可 | C-27 |
| P7 | `state:ready-to-merge` の PR に本人のコメントのレビュー → `next.mjs --pickup` | PR のレビューの読み出しと挙動要約 | 写しと同じ形で読めれば可 | C-6a |
| P8 | (Q2 が可のとき)別のアカウントで承認 → gate-g5-base・集約の成立。承認の後の push で失効。CODEOWNERS の基底の側の評価(基底と PR の側で CODEOWNERS を違えた PR) | E-13・F-2・E-7・C-6b | 各点が note どおりなら可 | C-4・C-5・C-6b |
| P9 | (Q2 が可のとき)別のアカウントでフォークし、題名・本文にシェルの展開を誘う文字列を入れた PR | AI レビューの手順が既定で動かないこと、秘密情報に届かないこと、展開されないこと | 定義どおりなら可 | C-1 |
| P10 | 出荷(タグ → ship-evidence → 出荷の PR)。承認は Q2 による。否ならマージせずに拒否の応答を記録 | §4 | — | B-7 |

### 5.3 go(`pit-in-trial-go-tmp`、private)

| # | PR / 操作 | 観測すること | 合否 | 項目 |
| --- | --- | --- | --- | --- |
| G1 | 持ち込み(既定ブランチ `master`、CODEOWNERS 2か所) | 止める項目(CODEOWNERS の2か所)、push の契機の形の検査、手順に無い作業 | 記録が取れたら可 | B-1・B-3a |
| G2 | 初期化 | go のアダプタ(coverage.out・`_go-stmt-lines` の `go run`)と既存の Makefile・golangci の食い違い | 記録が取れたら可 | B-1・EV-0170 |
| G3 | ルールセットの適用を試みる → env-check | 403 の応答と、env-check がそれを何と読むか。集約の保証の開示に「止められない」が出るか | 記録が取れたら可(EV-0170 の go は、ルールセットの項目が確認済みに至らないため「Free の private では至らない」と判定) | B-2・B-4a・B-7 |
| G4 | `gh workflow run mutation-weekly.yml`・`assurance-period.yml` を各1回 | 結論と所要時間(`gh run view --json jobs`) | 記録が取れたら可 | C-29a |
| G5 | マージの方式: squash・merge commit・rebase を順に許し、段 mutation の閾値割れを台帳の行で受けた PR を各1本取り込む。merge queue の設定の可否を確かめる | 取り込みの後の既定ブランチの G-5、`commits/{sha}/pulls` の応答 | 3方式の結果を記録すれば可。merge queue は設定できなければ不可のまま | C-30a・C-30b |
| G6 | 失敗させた run を含めた状態で `enforcement-inventory.mjs --quarter 2026Q4` | 失敗の回数・読めない・一部しか読めないの表示 | 表示が note どおりなら可 | C-24a |
| G7 | 出荷(タグ → ship-evidence → 出荷の PR → マージ) | 集約の結論 | 出荷まで通れば可 | B-7 |

## 6. 確かめられない項目の手引きに残す手順(案)

| 項目 | 手引きに残す確かめる手順の案 |
| --- | --- |
| B-3b・B-4b(統制の外れ) | 採用者が強制層の変化点ごとに env-check を実行し、前回の記録との差を数える。差のうち変化点の記録に無いものを外れとする |
| C-1・C-4・C-5・C-6b | 2つの人のアカウントを使える採用者が、P8・P9 の手順を流す。組織の同意(IMPL-0340)は組織の所有のリポで、所有する組織が指名した者のレビューを要するルールセットを置いて流す |
| C-2 | モデルの鍵を置ける採用者が、注入の文字列を含む PR で AI レビューを流し、書き込みのジョブ以外が PR へ書けないことを見る |
| C-7 | IMPL-0479 の第2段を実装した後、node と go の混在のリポで、片方の対象を空にした PR・片方の脚を落とす PR を流す |
| C-18 | Q3 が否なら、Environment に秘密情報を置ける採用者が P5 を流す |
| C-23 | 提供者の文書でフックの入力にモデルの識別子が載るかを確かめた後、担い手の実行の記録と照合する |
| C-24b | 2026-10-01 の後に作った実行を 90 日の後(2027-01 以降)に読む(EV-0343) |
| C-29b | 採用者の週次の実行の履歴から、起動の間隔・所要時間の中央値と最大を数える |
| C-30b | 組織の所有のリポで merge queue を有効にし、G5 と同じ PR を流す |

## 7. 記録として取るもの(リポの削除の前に取る)

置き場: process-compass の `research/361-deliberation/trial/<言語>/`(結果の要約と抜き書き。生の JSON は大きければ要約だけ)。#452 の分は `research/452-deliberation/trial/`。

- `trial-log.md`: 手順に無かった作業の一覧(時刻・操作・理由)
- `preflight.txt`・`adoption-inventory.md`・`env-check.json`(各段)
- `gh run list --limit 200 --json databaseId,workflowName,event,headBranch,headSha,conclusion,createdAt,updatedAt` と、主な run の `gh run view <id> --json jobs`(ジョブごとの開始・終了・結論)。所要時間は updatedAt − createdAt とジョブの合計の両方
- 各 PR の `gh pr view <n> --json number,title,state,mergeCommit,commits,reviews` と、先頭のコミットの `gh api repos/{o}/{r}/commits/{sha}/check-runs`(`statusCheckRollup` は GITHUB_TOKEN で読めないことがある: pit-in-trial-54 の教訓。実行役の gh は所有者の名義なので読めるが、ワークフローの中では check-runs を使う)
- 拒否の応答(マージ・push・ルールセットの適用)の文をそのまま
- `gh api repos/{o}/{r}/rulesets`・`/branches/<既定>/protection` の応答(適用の後)
- #452: 既定ブランチの第1親の各コミットの変更のパスと、その時点の計画の対象のパスの和(`research/452-deliberation/00-intake.md` §3 の測定の台本の出力)

## 8. 進め方の段と担当

1. 実行の担当(sonnet): §0 の答えを受け、§2〜§5 を1リポずつ直列に流す。1リポの記録を §7 へ書いてから次へ進む。呼び出しは1リポで 150 回前後を上限とし、超えるならリポごとに担当を分ける
2. 削除: 記録を取った後、`gh repo delete Takenori-Kusaka/<名> --yes`。`gh repo view` が見つからないと返すことで確かめる。Q3 の PAT は削除の前に失効させる。削除は指揮役が確かめる
3. 裁定の案(既定の模型): 記録から、各項目の合否・IMPL の state と note・EV の差し替えの案を作る(`10-ruling-draft.md`)。2委員(起案・反対)の意見を取り、議長が裁定する
4. 実装(sonnet): 本文の note・EV・README の手引きの改め。template を触るので直列
5. 独立の突合(既定の模型): 実装を見ていない文脈で1巡、直した差分で2巡目まで

## 9. 守ること

- 外部の操作は §0 の答えと所有者の許しの範囲だけで行う。範囲の外の操作(他のリポ・組織・アカウントの設定)は行わない
- リポは public でも秘密情報・実在の個人の情報を置かない。public の間は Actions の設定「外部の協力者からのフォークの PR のワークフローは承認を要する」を所有者の既定のまま確かめ、変えない(env-check の9項目に掛からない)
- 一時リポの中のワークフローを替える検査(N4・N17)は、作業ブランチか、検査の後に元へ戻すコミットで行い、戻したことを記録する
- 試行の記録は単一の試行・合成のリポ・同じ人の操作である。EV を差し替えるときも、根拠の水準は E2(単一事例)より上げない

## 10. §0 の問いの裁定(議長、2026-11-26)

指揮役は回答せずに止まり、議長が決めるよう求めた。議長は所有者の許し(triage §4 の 45・47)の範囲の外へ出ない側で決める。

- Q1: **全部 private で作る**。公開は外部への公開に当たり、許しは private に限られる。条件 V の8件(`00-intake.md` §5.3)は「確かめられない(Free の private ではルールセット・保護が 403)」として開示し、README の「ルールセットを使えない場合」の経路の観測へ切り替える。node・python でもルールセットの適用を試み、403 の応答を記録する
- Q2: **使わない**。別のアカウントの使用は許しの範囲にない。C-1・C-4・C-5・C-6b は確かめられないとして開示する
- Q3: **置かない**。許しは「秘密情報なし」。C-18 は確かめられないとして開示する
- env-check の `--by` など人の名義が要る欄: 実行役は所有者の氏名を渡さない。道具が拒めば、拒んだ事実と機械の読みの値だけを記録する。人が書く欄は「試行の代記(人の判定ではない)」と明記し、責任者・承認者の欄へ AI の名義を書かない
- 所有者が後で Q1〜Q3 を許せば、確かめられない側へ移した項目は #361 の後継の確認で拾う(Issue へ書く)

## 11. 所有者の回答による改め(2026-11-26、triage §4 の 49〜51)

§10 の Q1・Q2 の裁定を、所有者の回答で次のとおり改める。Q3 は §10 のまま。

- Q1: node・python の一時リポは **public** にしてよい。秘密情報を置かず、終わったら削除する。go は private のまま
- Q2: 別のアカウント `ganbariquestsupport-lab` を、**一時リポの中だけで**承認者・フォークの持ち主として使ってよい。作ったフォークも終わったら削除する。同じ人が操る2つのアカウントは独立した人を示さないので、観測はホスティングの振る舞いに限ると記録する
- Q3: PAT は作らない。C-18(委任のマージ)は確かめられないとして開示し、#361 に残す
- python は private で1巡目を流して削除済み(`trial/python/`)。public の2巡目を `pit-in-trial-python-pub-tmp` で流し、`trial/python-public/` へ記録する
- 削除したリポとフォークの名前は、指揮役へ status で知らせる

## 12. public の試行を閉じる(議長、2026-11-26、triage §4 の 52)

- public の2巡目(python・node)で、GitHub のサーバ側のマージがマージする人のアカウントのメールを作者(スカッシュ)・コミッター(rebase)に入れ、所有者の実アドレスが public の main に載った(`trial/python-public/`・`trial/node-public/` の F-10)。両リポとも数分で削除した
- 所有者の回答: GitHub の設定は変えない。public ではスカッシュを使わない。C-27 は private の1巡目の記録だけで判定し、保護と組み合わせた確認が要る分は開示する
- 議長の裁定: 設定を変えない限り、public でサーバ側のマージを行う試行は(方式に関わらず)実アドレスを載せる。保護の下では手元のマージの push も通らない。よって **public の試行はこれ以上行わない**。条件 V と Q2 の項目のうち public の2巡目で観測できなかったものは「確かめられない(所有者のアカウントで public のマージを行うとメールが露出するため)」として開示する。public の2巡目で得た観測(ルールセット・旧来の保護を置けたこと、作成者のマージの拒否と別アカウントの承認での取り込み、必須でない検査が赤でも取り込めたこと)は記録として使う
