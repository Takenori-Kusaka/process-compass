# #363 調査(内部の調査と実行での確認)

- 対象: Issue #363「python アダプタの前提と、複数のスタックを持つリポジトリ」
- 調査日: 2026-11-11
- 読んだ版: 準拠テンプレート 71a64b7(調査中に a15584f へ進んだ。差分は `scripts/vendor/tailoring-kb.json` の1行だけで、本調査の対象のファイルに変更は無い)
- 実行での確認の台本と出力: スクラッチパッド `p363/`(`scripts/mkbase.sh`・`mkrepos.sh`・`run-adapter.sh`・`threshold-trial.sh`・`mixed-trial.sh` と、各 `*.txt`)。リポジトリは書き換えていない
- 外部の調査は行っていない。案(d)の業界の実務(差分の網羅率の道具)は、名前を挙げるだけにとどめ、確かめていない

Issue の本文は第三者の意見として読みました。本文の「#315(ADR-0084)」は誤りです。#315 の決定は ADR-0085 です(ADR-0084 は実装マークの検査の強さの決定で、#315 を引いていない)。

---

## 0. 要約

実行で確かめた事実のうち、判定に効くものは次の5つです。

| 番号 | 事実 | 当たる規定 | 黙って外れるか |
| --- | --- | --- | --- |
| D-1 | アダプタがプロジェクトの対象を見つけないと、`secretScan` も「実施しない」で通る。node・python・go・undetermined の4つで再現した | 第4章 G-5「検査対象が存在しない場合の扱い」の表(基準7 は対象なしを**認めない**)、ADR-0033 決定3 | **黙って外れる**(notice だけで終了コード 0) |
| D-2 | python アダプタの対象の検出(`hasTarget`)はリポジトリの直下だけを見る。`services/api/pyproject.toml` のような下の階層の python では、install・test・coverage・lint・secretScan のすべてが「対象なし」で通る | G-5「実装が存在する段階で、この扱いを用いてはなりません」、ADR-0033 決定6 | **黙って外れる** |
| D-3 | node と python の混在で node アダプタを選ぶと、python のテストは実行されない。わざと落ちる python のテストを置いても G-5 の test は通る。変更の範囲のカバレッジは、python のファイルを警告1行で分母から外し 100% で通す | G-5 基準1「全テストが GREEN」 | **黙って外れる**(警告だけ) |
| D-4 | uv の既定の形(build-system なし)と、平らな配置の python は、`pip install -e ".[dev]"` で失敗する。原因はテンプレート自身のディレクトリ(`specs`・`context`・`adapters`・`profiles`・`templates`)を setuptools が最上位のパッケージとして拾うこと | — | 外れない(install が失敗する) |
| D-5 | `pyproject.toml` の中で除外を広げても(`[tool.ruff] extend-exclude`・`[tool.coverage.run] omit`)、製品のコードとの同時変更の検査に掛からない。`.coveragerc` に同じ変更を書くと掛かる | G-5「基準値と除外設定の変更」 | **黙って外れる**(限界として ci-gates.md 171 行に開示済み) |

poetry の形は、install が警告だけで終了コード 0 になり、次の test で `pytest` が無いとして失敗します。黙っては外れませんが、失敗の原因の表示が install の段に出ません。poetry.lock と uv.lock はどの段でも読まれません。

判定の材料の要点(8節に詳述)は次のとおりです。

- D-1・D-2・D-3 は、既存の条項(G-5 基準1・7、ADR-0033 決定3・6)に対する準拠テンプレートの欠陥である。直すために新しい義務は要らない
- 複数のスタックの扱いを閉じるには、「採用者に宣言させる・止める」(新しい義務)か、「基準1 の未充足を開示して受け入れる」(ADR-0085 決定2 の理由の改め)のどちらかを選ぶ必要がある。どちらも重に当たる
- 差分の網羅率(案 d)は基準3 しか受けない。D-3 の基準1 の欠けを受けられないため、複数のスタックの受け皿にはならない

---

## 1. 準拠テンプレートのアダプタの仕組み

### 1.1 構成の adapter の欄と読み込み

- 構成は `"adapters": { "stack": "<id>" }` の1値だけを持つ(`process.config.json` 6 行)。`config.mjs` の `loadAdapter` が `adapters/<stack>.json` を1つ読む(21〜28 行)。配列や複数の値を受ける経路は無い
- 同梱のアダプタは `node`・`python`・`go`・`none`・`undetermined` の5つ(README は「4種」と書くが、`undetermined` を数えていない)
- スタックを変える経路は `/process-change` の種別 `settings` の `stack` だけで、判断記録(ADR)を要する(`kinds/settings.md` 11 行)
- `adapters/**` は委任の範囲に入らない(`NEVER_DELEGATED`)。強制層の要約値の範囲に入る(`ENFORCEMENT_DIGEST_GLOBS`。乖離は表示だけ)。`check-pr.mjs` は `adapters/<stack>.json` の変更を閾値の変更として扱う。採用者がアダプタのコマンドを書き換えることは、統制の設定の変更として扱われる経路であり、禁止はされていない。ただし、書き換えてよいことと書き換え方を案内する文書は見つからなかった(`none.json` の note だけが「コマンドをここへ書く」と書く)

### 1.2 python アダプタ(`adapters/python.json`)

| 段 | コマンド | 前提 |
| --- | --- | --- |
| install | `python -m pip install --upgrade pip && pip install -e ".[dev]"` | 直下に PEP 517 で組めるプロジェクトがあり、extras `dev` に開発用の依存がある |
| test | `pytest` | install で pytest が入る |
| coverage | `pytest --cov --cov-report=json:coverage.json` | pytest-cov が入る |
| lint | `ruff check .` | ruff が入る。範囲は ruff の設定(`pyproject.toml` の `[tool.ruff]` を含む)に従う |
| audit | `pip-audit` | 入った環境を監査する。ロックファイルは読まない |
| licenses | `pip-licenses --format=json \| node scripts/gate/ip-clearance-python.mjs` | — |
| secretScan | `npx ... secretlint "**/*"` | node と npx(言語に依らない) |

- `coverageSummary: "coverage.json"`。`coverageDetail` を持たない。このため、変更の範囲のカバレッジ(`ci.coverageScope: changed`)を測れず、新しく生成する構成は `whole` になる(`generate-profile.mjs` 957 行)。`changed` を書くと `coverage-check.mjs` が失敗させる(IMPL-0259。#360 の範囲)
- `thresholdFiles`: `.coveragerc`・`pytest.ini`・`.flake8`・`.pylintrc`・`pylintrc`・`ruff.toml`・`.ruff.toml`・`mypy.ini`・`.mypy.ini`・`.bandit`。`pyproject.toml`・`setup.cfg`・`tox.ini` は含まない。`pyproject.toml` は `SETUP_FILES` に入り、「依存と設定を兼ねるファイルの中の閾値は、閾値のファイルとして扱わない」(`check-pr.mjs` 107 行、`ci-gates.md` 171 行)
- 初期化の基盤(`scaffoldStack`)は python では `.secretlintrc.json` だけを作り、`pyproject.toml` の extras `dev` を todo に挙げる

### 1.3 対象の検出(`hasTarget`。`config.mjs` 2456 行)

- node: 直下の `package.json`。python: 直下の `pyproject.toml`・`setup.py`・`setup.cfg`・`requirements.txt`・`Pipfile`。go: 直下の `go.mod`
- 下の階層は見ない。`requirements-dev.txt` のような派生の名も見ない(事前点検の目印 `requirements[^/]*\.txt` とずれる)

### 1.4 `adapter.mjs` の順序

1. `runtime` は1つの実行環境(`runtime`・`runtimeVersion`)を JSON で出す
2. `hasTarget` が偽なら、**段を問わず**「プロジェクト対象が存在しないため実施しません」を notice で出して終了コード 0
3. 任意の段(lint・audit・licenses・coverage・install)はコマンドが空なら notice で通す。test と secretScan は空なら失敗

手順2 が手順3 より前にあるため、必須の段(test・secretScan)も対象なしで通ります。D-1 の原因です。

### 1.5 setup-stack(`.github/actions/setup-stack/action.yml`)

- `adapter.mjs runtime` の1値で、`setup-node`・`setup-python`・`setup-go` のどれか1つだけを用意する。複数の実行環境を用意する経路は無い
- 依存の取得は `adapter.mjs run install` の1回
- `secret-scan` のジョブは `install: 'false'` で setup-stack を呼び、`adapter.mjs run secretScan` を実行する

### 1.6 カバレッジ(`coverage-check.mjs`)

- `whole`: `coverageSummary` の `total.lines.pct`(istanbul)か `totals.percent_covered`(pytest-cov)を読む。薄まりを開示する
- `changed`: `coverageDetail`(istanbul の `coverage-final.json`)と `git diff -U0` から追加行の被覆を出す。行単位で測れる拡張子は `NODE_MEASURABLE`(js・ts 系)に固定。測れない拡張子の製品のファイルは、`notMeasurable` として**警告で数えるだけ**で、失敗させない(被覆の記録に無い測れるファイルは失敗させる)
- pytest-cov の `coverage.json`(coverage.py の JSON 形式 3)は、ファイルごとに `executed_lines`・`missing_lines` を持つ(実行で確かめた)。行単位の被覆の材料は、python では既にある。キーは Windows では `src\poetryapp\core.py` のように逆斜線になる

---

## 2. 事前点検(preflight.mjs)の言語の目印の告げ方

- 目印の表 `STACK_MARKERS`(56〜66 行)で、追跡しているファイルと無視されていない未追跡のファイルを、階層を問わず走査する。python は `pyproject.toml`・`setup.py`・`setup.cfg`・`Pipfile`・`requirements*.txt`
- 告げる文は3通り: 「`<stack>` の目印」、「(アダプタの外の言語)」、「(複数のスタック: node・python。構成のアダプタは1つ)」。資産「使う言語とアダプタ」として一覧へ載せることを求める(載っていなければ止める)
- カバレッジの測定の穴として告げるのは、node の `package.json` に `scripts.coverage` が無いこと、python の `pyproject.toml` の本文に文字列 `pytest-cov` が無いこと、go であることの3つ
- 告げないもの(アダプタの前提との突き合わせが無いもの)
  - ロックファイル(`poetry.lock`・`uv.lock`・`Pipfile.lock`・`pdm.lock`)の存在。アダプタはどれも読まない
  - build-system の有無と種類、extras `dev` の有無。poetry の依存の群(`[tool.poetry.group.dev.dependencies]`)と PEP 735 の `[dependency-groups]` は extras ではない
  - 目印が直下に無いこと(`hasTarget` が偽になること)
  - 複数のスタックのとき、アダプタに入らない側のテスト・静的解析が G-5 で走らないこと
- `pytest-cov` の検出は文字列の一致なので、poetry の依存の群や `[dependency-groups]` に書いてあれば告げない。実行では、そのどちらも `pip install -e ".[dev]"` で入らなかった(5節)。偽陰性である
- 点検は「事実を読むだけで、設問の回答を検出の結果で埋めない」(preflight.mjs 12 行、ADR-0085 決定2)。スタックの選択は人の回答に残る

---

## 3. #330 の本文と、範囲の重なり

### 3.1 #330 の範囲

- 本文: アダプタのコマンドが空の任意の検査は「未実施として証跡へ残し、通過させる」。実装の開始後もアダプタが `none` のままなら未実施が続く。ADR-0033 決定6 は「対象なし」の実装の開始後の使用を禁じるが、未実施には同じ歯止めが無い。問いは、内部監査 観点16 を未実施にも当てるか
- コメント(#294 K-8): go・none・undetermined(`coverageSummary: null`)が基準3 を測らずに通す件を足した
- 実装マーク: IMPL-0234(依存の取得に失敗したときに検査器が失敗で終わるか)と IMPL-0239(対象なしの記録の3項目と、実装の開始後に用いないこと)が `issue=330`

### 3.2 #363 との重なりと分け方の案

| 論点 | 重なり | 分け方の案 |
| --- | --- | --- |
| 複数のスタックを `none` に手で書いて回す | 実行では test は両方走ったが、カバレッジは `coverageSummary: null` で「実施しない」になった(5.4)。#330 の未実施の長期化そのもの | #363 は「手で書く形を正規の経路として案内するか」まで。未実施の歯止めは #330 |
| D-2(下の階層の python が対象なしで通る) | 実装の開始後の対象なしは、#330 の IMPL-0239 と観点16 の対象 | 検出の誤り(`hasTarget` が直下だけを見る)は #363。対象なしが続くことへの歯止めは #330 |
| D-1(secretScan が対象なしで通る) | IMPL-0239 は基準1・2・3・5・8 だけを対象なしの範囲とし、基準7 を含めない。#330 の問い(未実施の歯止め)とも、#363 の問い(アダプタの前提)とも別 | どちらにも含めず、実行で確かめた欠陥として別に起票する案を推す(9節) |
| poetry で install が警告だけで通り、test で落ちる | IMPL-0234(入力が欠けたときに検査器が失敗で終わるか)の python の場合の観測になる。今回は失敗で終わった | 観測を #330 の IMPL-0234 へ渡す。前提の不一致そのものは #363 |

### 3.3 #360 との重なり

- 案(d)の python の変更の範囲のカバレッジは、IMPL-0259(node 以外のアダプタで変更の範囲を測ること)に当たり、計画は #360 にある
- #360 の本文の表は、この件を IMPL-0253 と書いている。IMPL-0253 は AI レビューの入力の記録で、カバレッジの件は IMPL-0259 である(本文の番号の誤り)
- #363 で案(d)を採るなら、#360 と範囲を分ける必要がある

---

## 4. ADR-0085 と research/315-deliberation の案3

### 4.1 案3(`implementation.md` 135〜139 行)

- 背景・論点・受入基準は Issue #363 の本文とほぼ同じ文である。受入基準は「#330 と範囲を分け、事前点検で前提の不一致を告げるか、アダプタを改めるかを決める」
- 315 の現場の委員(F-5)は、poetry・uv・requirements.txt の既存の形との不一致を予見していた。品質保証の委員は「未試行の言語で『通った』を作らない」とした。内部調査(`survey-315-1-internal.md` 91 行)は「extras・pytest-cov が無ければ install で落ちうる(未試行)」と書いた。本調査で初めて実行した

### 4.2 ADR-0085 のうち、#363 に効く決定

- 決定2: 言語の目印とカバレッジの測定の穴は「告げる」(止めない)。理由は「node では G-5 の test ジョブが失敗し、go では G-5 基準3 を『実施しない』と記録するため、黙っては外れない」
- 決定2: 点検は事実を読むだけで、設問の回答を検出の結果で埋めない
- 決定4・EV-0170: python・go の既存のリポジトリへの試行は無い(E0)。差し替え条件に「アダプタの前提(`pip install -e ".[dev]"` と、リポジトリ全体への静的解析)が合わず、手順に無い作業が要れば、アダプタの前提を手順へ書く向きで見直す」とある
- 決定5: 構成の形式の版(`formatVersion`)と種別 `migrate`。構成の形を変える案(c)は、ここに掛かる
- 決定6: 既存の採用者を落とす変更を出す保守者の義務(`community/standard-editions.md`)。`hasTarget` を広げる変更は、いま「対象なし」で通っている採用者を落としうる

---

## 5. 実行での確認

### 5.1 作ったリポジトリ

いずれも、準拠テンプレートの追跡しているファイルを複製した `main` の上に、製品のコードを足したものです。CODEOWNERS の `@OWNER` は置き換えました(言語の点検と切り分けるため)。実行環境は Windows・Python 3.14・Node 22 系です。CI(ubuntu・Python 3.12)では動かしていません。

| 名 | 形 |
| --- | --- |
| poetry | `[tool.poetry]`、src 配置、`packages = [{ include = "poetryapp", from = "src" }]`、開発用の依存は `[tool.poetry.group.dev.dependencies]`(pytest・pytest-cov・ruff)、`[tool.ruff] extend-exclude = ["legacy"]`、`[tool.coverage.run] source = ["src"]`、build-system は poetry-core、`poetry.lock` あり。`legacy/old.py` に ruff の違反 |
| uv | `[project]`、build-system なし(uv のアプリの既定)、平らな配置 `uvapp/`、開発用の依存は PEP 735 の `[dependency-groups] dev`、`uv.lock` あり |
| mixed | 直下に node(`package.json`、c8 によるカバレッジ、`package-lock.json`)、`services/api/` に python(setuptools、extras `dev`)。python のテストは**わざと落ちる**。`ci.coverageScope: changed` |

### 5.2 事前点検

3つとも、止める項目は資産の一覧の欠け(`docs/adoption-inventory.md`)だけでした。

- poetry: 告げる「`pyproject.toml`: python の目印」。カバレッジの穴は告げない(`pytest-cov` の文字列が依存の群にあるため)。`poetry.lock` には触れない
- uv: 同じ。`uv.lock`・build-system の欠けには触れない
- mixed: 告げる「`package.json`: node の目印(複数のスタック: node・python。構成のアダプタは1つ)」と、`services/api/pyproject.toml` の同じ文。python のテストが G-5 で走らないこと、python アダプタを選ぶと対象なしになることには触れない

### 5.3 python アダプタの各段

**poetry**(`run-poetry.txt`)

- install: `WARNING: poetryapp 0.1.0 does not provide the extra 'dev'` を出して**終了コード 0**。製品だけが editable で入り、pytest・pytest-cov・ruff は入らない。`poetry.lock` は読まれない
- test・coverage・lint: `pytest`・`ruff` が見つからず終了コード 1。coverage-check は `coverage.json` が無いとして失敗
- 開発用の依存を手で入れた後(`run-poetry-2.txt`): test・coverage・lint は通る。lint は `extend-exclude` に従い、`legacy/` の違反を見ない。カバレッジは `source = ["src"]` に従い `legacy/` を分母に入れない。範囲の制御は `pyproject.toml` にある

**uv**(`run-uv.txt`)

- install: `error: Multiple top-level packages discovered in a flat-layout: ['specs', 'uvapp', 'context', 'adapters', 'profiles', 'templates']` で終了コード 1。build-system が無いと pip は setuptools へ倒れ、setuptools の自動の検出がテンプレートのディレクトリを拾う。uv に固有ではなく、平らな配置で `packages` を書かない python の形の全部に当たる
- 代わりの手段の確認: `pip install --group dev`(pip 25.1 以降)は終了コード 0 で開発用の依存を入れた。`uv sync --locked` もロックどおりに入れた

**requirements.txt だけの形**(補足)

- `pip install -e ".[dev]"` は `does not appear to be a Python project: neither 'setup.py' nor 'pyproject.toml' found` で失敗。`hasTarget` は `requirements.txt` で真になる

### 5.4 混在のリポジトリ(`mixed-trial.txt`)

node と python の両方を変える変更(`src/index.mjs` に関数を足し、`services/api/api/handler.py` にテストの無い関数を足す)で動かしました。

| アダプタ | 結果 |
| --- | --- |
| node | install・test・coverage は通る。落ちる python のテストは**実行されない**。coverage-check は「`services/api/api/handler.py` は行単位の被覆を測れない拡張子」と警告し、`カバレッジ 100%(範囲: 変更で加えた・変えたコード、分母 1 行)` で終了コード 0 |
| python | 直下に目印が無いため、install・test・coverage・lint・secretScan のすべてが「プロジェクト対象が存在しないため実施しません」で終了コード 0。coverage-check も「未実施として記録」で 0 |
| none(手で `npm test && (cd services/api && pytest)` を書く) | test は python の失敗を捉えて終了コード 1。coverage-check は「`coverageSummary` を持たない。判定を実施しない」で 0(#330 の未実施) |

### 5.5 secretScan と対象なし(D-1)

テンプレートだけの複製(製品のコード無し)で、アダプタを node・python・go・undetermined に切り替えて `adapter.mjs run secretScan` を実行しました。4つとも「プロジェクト対象が存在しないため、"secretScan" は実施しません」で終了コード 0 でした。G-5 の表は基準7 の対象なしを認めず、ADR-0033 決定3 は基準7 を免除しないと決めています。mixed で python アダプタを選んだ場合も同じです(製品のコードがあるのに秘匿情報の検査が走らない)。

保証の開示 項目4 の表示(`g5-aggregate.mjs` の `machineCheckStatus`)は、`hasTarget` が偽なら「未実施(検査対象が存在しない)」と出します。開示には出ますが、G-5 の合否には効きません。

### 5.6 `pyproject.toml` の中の除外の拡大(D-5。`threshold-trial.txt`)

| 場合 | 同じ PR の変更 | `check-pr.mjs` の判定 |
| --- | --- | --- |
| A | 製品のコード + `pyproject.toml` の `omit` と `extend-exclude = ["legacy", "src"]` | `thresholds.changed: []`、誤りなし。統制の設定の陰性の確認の対象にもならない |
| B | 製品のコード + `.coveragerc` の `omit` | `閾値・除外設定と製品のコードが同じ PR で変わっています` で失敗 |

場合 A の後、`ruff check .` は `src` を見ずに「All checks passed!」を出しました。カバレッジは、対象のファイルが1つで分母が0行になったため、#286 の歯止め(製品のコードがあるのに0行)で失敗しました。ファイルが複数あり一部だけを外す場合は、この歯止めに掛からず通ると読めます(実行していない)。

poetry・uv・最近の setuptools の形は、ruff・coverage・pytest の設定を `pyproject.toml` に集めるのが通例です。開示済みの限界ですが、python の既存のリポジトリでは、同時変更の検査がほぼ効かないことになります。

### 5.7 副次の観測

- pytest-cov のデータファイル `.coverage` は、テンプレートの `.gitignore` に無い。誤って追跡すると、`coverage-check.mjs` は製品のファイルとして数える(実行で、製品のファイルの一覧に `.coverage` が出た)
- `README.md` は同梱のアダプタを「4種」と書くが、`adapters/` には `undetermined` を含めて5つある

---

## 6. 既存の決定との突合

| 突合の相手 | 食い違い | どちらが誤りか(調査者の見立て) |
| --- | --- | --- |
| G-5 の表(基準7 は対象なしを認めない)・ADR-0033 決定3 | `adapter.mjs` が `hasTarget` を必須の段より先に見るため、secretScan が対象なしで通る(D-1) | テンプレートが誤り。条項は明確である |
| G-5「実装が存在する段階で、この扱いを用いてはなりません」・ADR-0033 決定6 | 下の階層の python で、実装があるのに対象なしになる(D-2) | テンプレートの検出が誤り |
| G-5 基準1「全テストが GREEN」・G-5「集約から検査を外すことで、判定基準を外してはなりません」 | 混在のとき、アダプタに入らないスタックのテストは集約に入らない(D-3) | テンプレートが条項を満たしていない。ただし、「全テスト」が全スタックを指すと本文に書かれてはいない。読み方を決める必要がある |
| ADR-0085 決定2 の理由「node では test ジョブが失敗し…黙っては外れない」 | 単一スタックを前提にした理由で、混在では成り立たない(D-3)。告げる扱いの根拠が崩れる | ADR-0085 の理由の前提が狭い。決定を改めるか、理由を補う新しい ADR が要る |
| ADR-0085 決定2「点検は設問の回答を検出の結果で埋めない」、/process-init「ファイルから技術スタックを推測しない」 | 案(b)のうち、実行時にロックファイルを見て install のコマンドを選ぶ形は、検出で挙動を変える。設問の回答は埋めないが、精神に触れる | 案の側で避けられる。人が選ぶアダプタを増やす形(`python-poetry`・`python-uv`)なら食い違わない |
| ADR-0085 決定5(形式の版と `migrate`) | 案(c)は構成の形を変えるため、形式の版の繰り上げと移行の変換が要る | 食い違いではなく、案(c)の費用として掛かる |
| ADR-0085 決定6(既存の採用者を落とす変更の保守者の義務) | D-1・D-2 の修正は、いま対象なしで通っている採用者を落とす | 義務に従って、落ちうる検査と直し方を列挙して出す |
| ADR-0078 決定6・ADR-0079 決定1(範囲を選べる。全体なら薄まりを開示) | 案(d)は python で `changed` を測れるようにする。既定を変えることにはならない | 食い違わない |
| `ci-gates.md` 171 行(依存と設定を兼ねるファイルの閾値は対象外) | D-5 は開示済みの限界の中にある | 誤りではない。python では限界の範囲が広すぎる、という評価の問題 |
| EV-0170 | 差し替え条件の「アダプタの前提が合わない」が、本調査で起きた(poetry・uv・requirements.txt) | マークの見直しの材料。マークは消さず、観測を書き足す向き |
| Issue #363 本文の「ADR-0084」 | #315 の決定は ADR-0085 | Issue の本文が誤り |
| Issue #360 本文の「IMPL-0253」 | カバレッジの件は IMPL-0259 | Issue の本文が誤り |

---

## 7. 案の整理

「新しい義務」は、採用者に新しく課す記録・宣言・作業、または止める条件の追加を指します。テンプレートの欠陥を直して既存の条項に合わせることは、新しい義務に数えません。

### (a) 事前点検で前提の不一致を告げる

- 内容: 次を告げる項目に足す。ロックファイルがあるがアダプタが読まない。build-system が無い・平らな配置で `packages` が無い(D-4)。extras `dev` が無く、開発用の依存が群(poetry・PEP 735)にある。目印が直下に無い(D-2)。複数のスタックで、アダプタに入らない側のテストが G-5 に入らない(D-3)。`pytest-cov` の検出を、extras にあるかで見る(偽陰性の解消)
- 効くもの: 持ち込みの時点で人が気づく。一覧の行に扱いが残る
- 効かないもの: 開始の後にスタックが増えた場合。告げても G-5 は通り続ける(D-3 は黙ったまま残る)
- 新しい義務: 告げる項目を足すと、一覧の行が増え、人が扱いを記名で確定する作業が増える。1.10.1 の既存の義務(機械が検出した資産を一覧に載せる)の範囲が広がるだけで、種類の新しい義務ではない。ADR-0085 決定2 の告げる項目の列挙を補う ADR は要る。**止める項目にする場合は新しい義務**(重)

### (b) アダプタを改める

- (b-1) `hasTarget` と必須の段の順序を直す: secretScan(と test)は対象なしで通さない。D-1 を直す。新しい義務なし(既存の条項への適合)。既存の採用者を落としうる(ADR-0085 決定6 の手続)
- (b-2) python の対象の検出を広げる、またはアダプタに作業の場所(例: `workingDirectory`)を持たせる: D-2 を直す。アダプタの JSON の形は増えるが、構成の形は変わらない。新しい義務なし
- (b-3) install を形に合わせる: 人が選ぶアダプタを増やす(`python-poetry`: `poetry install --with dev --sync`、`python-uv`: `uv sync --locked`、群を使う pip: `pip install --group dev`)。実行時の検出で選ばない。ロックファイルどおりに入るため、監査の対象と出荷する依存が一致する。新しい義務なし。ADR-0085 決定2 の「推測しない」と両立する
- (b-4) 実行時にロックファイルを検出して install を切り替える: ADR-0085 決定2 の精神と食い違う(6節)。採らない向きを推す
- (b-5) `thresholdFiles` に `pyproject.toml` を足す: D-5 を塞ぐが、依存の更新(製品のコードと同じ PR で起きやすい)まで閾値の変更として止める。`pyproject.toml` の中の `[tool.ruff]`・`[tool.coverage]`・`[tool.pytest]` の節だけを比べる形なら、誤検出を避けられる。新しい義務なし(既存の「基準値と除外設定の変更」の分離の適用範囲が実態に合う)。`ci-gates.md` 171 行の限界の記述を改める
- 効かないもの: (b) だけでは、複数のスタック(D-3)は閉じない

### (c) 複数のアダプタを持てる構成にする

- 内容: `adapters.stack` を配列(またはスタックごとの作業の場所つき)にする。setup-stack で複数の実行環境を用意し、各段を各アダプタで回し、結果を束ねる
- 効くもの: D-3 を閉じる唯一の案。基準1・2・3・5 をすべてのスタックに当てられる
- 費用: 構成の形式の版の繰り上げと `migrate`(ADR-0085 決定5)、証跡のキー構造(ゲート契約として固定する `evidence/evidence.json`)のうち、カバレッジの結果・保証の開示 項目4 の表示を複数へ広げる変更、`coverage-check.mjs`・`aggregate-evidence.mjs`・`g5-aggregate.mjs` の単一のアダプタの前提の改め。変更量は採否の理由にしない(コアポリシー)が、ゲート契約の変更は ADR の原則に近い
- 新しい義務: 構成の形を変えるだけなら採用者の新しい義務ではない。ただし「全スタックを構成に宣言しなければならない」「宣言の無いスタックの目印があれば止める」を置くなら新しい義務(重)。「基準1 の全テストは製品のすべてのスタックのテストを指す」と本文に書くなら、既存の条項の読み方の確定だが、採用者に効く範囲が広がる(重とみる)

### (d) 差分の網羅率(言語を跨ぐ共通の報告形式)を受け皿にする

- 内容: 行単位の被覆を言語に依らない形(候補: LCOV、Cobertura XML、または coverage.py の JSON と istanbul の JSON をテンプレートの内部で同じ形へ寄せる)で読み、`changed` を python でも測る
- 効くもの: G-5 基準3 の変更の範囲を python で測れる(IMPL-0259)。混在のとき、python のファイルを「測れない拡張子」の警告で外す扱い(5.4)を、測る扱いへ変えられる
- 効かないもの: 基準1(テストの実行)・基準2(静的解析)は受けない。D-3 の主な欠け(落ちるテストが走らない)は残る。**複数のスタックの受け皿にはならない**
- 材料: python は `coverage.json` が既に `executed_lines`・`missing_lines` を持つ(5節で確かめた)。業界の実務として diff-cover(Cobertura・LCOV と git の差分)、Codecov の patch coverage、SonarQube の new code の条件がある(名前だけで、本調査では確かめていない。採るなら外部の調査が要る)
- 新しい義務: なし(範囲を選べることは保たれ、既定も変わらない)。新しく生成する python の構成の範囲が `whole` から `changed` へ変わる
- 範囲: IMPL-0259 の計画は #360。#363 で採るなら #360 と範囲を分ける

### (e) その他

- (e-1) `none` に手で書く形を、複数のスタックの正規の経路として案内する: 実行では test は両方走った。カバレッジは `coverageSummary: null` で未実施になる(#330 の未実施)。新しい義務なし。ただし未実施の長期化の歯止め(#330)に依存する
- (e-2) 開示で受ける: 混在のとき、アダプタに入らないスタックを保証の開示 項目4 に「未実施(構成のアダプタの外)」として出す。黙っては外れなくなるが、G-5 は通り続ける。新しい義務なし。基準1 の未充足を受け入れる判断になり、ADR-0085 決定2 の理由の改めが要る(重とみる)
- (e-3) 複数のスタックを事前点検で止める: 混在のリポジトリは持ち込めなくなる。新しい義務(重)。315 の決定(古い併合を止めない理由)と同じく、止めると持ち込みそのものができなくなる型である
- (e-4) 何もせず、EV-0170 の観測だけを書き足す: 本調査の D-1〜D-3 は既存の条項に対する欠陥なので、この案は条項と実装の食い違いを放置することになる。推さない

---

## 8. 審議の重さの判定の材料

| 判定の観点(CLAUDE.md) | 材料 | 見立て |
| --- | --- | --- |
| 安全・法令 | D-1 は秘匿情報の検査が走らない欠陥。資格情報の混入の検出に効く | 修正そのものは既存の条項への適合だが、セキュリティの統制に関わる |
| 採用者への新しい義務 | (a) の告げる項目の追加は既存の義務の範囲の拡大。止める項目、(c) の宣言の義務、基準1 の読み方の確定は新しい義務 | 複数のスタックを閉じる案のどれを採っても、新しい義務か ADR の理由の改めのどちらかに当たる |
| ADR の原則の変更 | ADR-0085 決定2 の理由(黙っては外れない)の前提が混在で崩れる。(c) はゲート契約(証跡のキー構造)に触れる | 改めが要る |
| 回帰・食い違いの解消 | D-1・D-2・D-5 の一部(b-1・b-2・b-5)は、既存の条項との食い違いの解消で、軽に当たる | 単独なら軽 |

調査者の見立ては次のとおりです。

- #363 の範囲を「python アダプタの前提」((a) の告げる項目と (b))に限るなら、軽で足りる。ただし D-1 を含めるなら、独立の突合で重大度「高」が出る見込みが高く、規則により重へ上がる
- 複数のスタック(D-3)を #363 で閉じるなら、重。(c)・(e-2)・(e-3) のどれを採っても、新しい義務か ADR の理由の改めが要る
- 分けるなら、D-1 は別の Issue(実行で確かめた欠陥)へ切り出し、#363 は重で扱う案を推す。複数のスタックを先送りにする場合も、先送りの間に D-3 が黙って外れることを、採らないことの記録と開示(EV-0170 の書き足し、保証の開示 項目4)で見える形にする必要がある

---

## 9. 範囲の外の発見(扱いの提案)

| 発見 | 確かめ方 | 扱いの提案 |
| --- | --- | --- |
| D-1: 対象なしで secretScan が通る(全アダプタ) | 実行で確かめた | 新規に起票する。#330(未実施)とも #363(アダプタの前提)とも問いが違う。IMPL-0239 の note は基準7 を対象なしの範囲に含めていないため、条項と実装の食い違いとして扱える |
| poetry で install が警告だけで終了コード 0 | 実行で確かめた | #330 の IMPL-0234 の観測として足す(今回は次の段で失敗で終わった) |
| `.coverage` がテンプレートの `.gitignore` に無い | 実行で観測 | #363 の (b) に含めてよい(python アダプタの前提の一部) |
| README の「4種」(`undetermined` を数えない) | 読解 | 軽微。#363 の実装のときに直す |
| #360 本文の IMPL-0253(正しくは IMPL-0259) | 読解 | #360 へコメントで足す |
| #363 本文の ADR-0084(正しくは ADR-0085) | 読解 | 審議の記録に書く |

---

## 10. 確かめていないこと

- CI(GitHub Actions の ubuntu・Python 3.12・setup-stack)での実行。本調査は Windows の手元で `adapter.mjs` を直接動かした。setup-stack は読解だけ
- audit(`pip-audit`)と licenses の段。ロックファイルと入った環境の食い違いが監査の結果に効くかは、推論にとどまる
- 一部のファイルだけを `omit` で外した場合に、カバレッジの判定が通ること(5.6 の推論)
- poetry で `poetry install` を使う形のアダプタで、`pytest` を `poetry run` なしで呼べるか(仮想環境の作り方による)
- go の既存のリポジトリ(Issue の範囲の外)
- 案(d)の業界の実務と、LCOV・Cobertura を共通の形にする場合の言語ごとの出し方
