# #363 実装の記録(準拠テンプレートの不具合の修正。審議の重さ: 軽)

- 対象: 欠陥①(秘匿情報の検査が対象なしで通る)、欠陥②(下の階層の python が対象なしで通る)、案(b)(python の形の不一致)
- 範囲の外: 欠陥③(混在のリポジトリ)。重の審議の裁定(`decision.md`)を受けて、別の作業で実装する
- 新しい規定は足さない。既存の規定(第4章 G-5「検査対象が存在しない場合の扱い」の表の基準7、「実装が存在する段階で、この扱いを用いてはなりません」、「基準値と除外設定の変更」、ADR-0033 決定3・決定6)への回帰の修正
- 作業の前に、本体と template を pull した(template は a15584f 以降の main)

## 進み具合

| 項目 | 状態 |
| --- | --- |
| 欠陥①: secretScan を対象の有無に依らず実行する | 実装済み・試験済み(Windows) |
| 欠陥②: 下の階層の目印を対象なしにしない、projectDir | 実装済み・試験済み(Windows) |
| 案(b): python-poetry・python-uv、python の install の修正、ロックファイル、thresholdFiles の表 | 実装済み・試験済み(Windows)。WSL で実物の確認済み(下記) |
| 本文(IMPL の印・ci-gates.md の限界の記述ほか) | 済み(下記)。lint:impl 通過 |
| 回帰スイート(WSL 通常・TZ=UTC)、npm run check の各段 | 済み(下記の「確認の結果」) |
| コミット・push・submodule | template はコミット済み(5877531)。**push は拒否された**(下記)。本体はコミットまで(push しない) |

## 準拠テンプレートの変更(作業中の内容)

### 欠陥①

- `scripts/gate/adapter.mjs`: secretScan(`ALWAYS_PHASES`)は `hasTarget` より先に判定し、製品のコードの有無に依らずリポジトリの直下で実行する。修正の前は、node・python・go・undetermined で「プロジェクト対象が存在しないため実施しません」として終了コード 0 で通っていた
- `adapters/undetermined.json`・`adapters/none.json`: secretScan に secretlint(言語に依らない)を既定で書いた。空のままでは段が失敗するため。ADR-0033 の帰結「基準7・基準6 を通す構成を持たないテンプレートは、標準に反する」に合わせた
- `scripts/gate/verify-gate-contract.mjs`: secretScan が空なら、undetermined でも契約検査で落とす(従来は undetermined を除いていた)
- `scripts/init/generate-profile.mjs`(scaffoldStack): `.secretlintrc.json` を全スタック(none・undetermined を含む)で作る。secretlint は設定が無いと終了コード 2 で落ちる(手元で確かめた)
- `scripts/gate/g5-aggregate.mjs`(machineCheckStatus): 保証の開示 項目4 で、秘匿情報の検査を「検査対象が存在しない」と出さない
- none の対象の判定(`targetState`)は、secretScan のコマンドを対象の有無の根拠に数えない(従来の挙動を保つ)

### 欠陥②

- `scripts/gate/config.mjs`: `hasTarget` を `targetState` に置き換えた(互換のため `hasTarget` は残す)。系統は adapter の runtime(node・python・go)で決める。目印が所在(`projectDir`)に無いとき、追跡しているファイルと無視されていない未追跡のファイルから下の階層の目印を探し(依存の置き場を除く)、見つかれば `nestedTargetProblem` の文で失敗させる。python の目印は事前点検と同じ `requirements[^/]*\.txt` を含む
- アダプタに `projectDir`(製品のコードの所在。直下からの相対のパス。既定は直下)を足した。構成(process.config.json)の形は変えない(形式の版と migrate を要さない)。secretScan 以外のコマンドはそこで実行する。直下の外を指すパスは失敗させる(契約検査も落とす)
- `scripts/gate/coverage-check.mjs`: 下の階層だけに目印があれば未実施にせず失敗させる。集計ファイルは所在の下から読む
- コマンドの `{root}` をリポジトリの直下の絶対パスに置き換える(所在の下から `ip-clearance-python.mjs` を呼ぶため)。`ip-clearance-python.mjs` は `PIT_IN_PROJECT_DIR` の pyproject.toml を読む

### 案(b)

- `adapters/python-poetry.json`(新): `poetry check --lock && poetry sync`、`poetry run ...`
- `adapters/python-uv.json`(新): `uv sync --locked`、`uv run --locked ...`。audit は uv.lock から書き出したハッシュつきの一覧を pip-audit で、licenses はロックどおりの仮想環境を pip-licenses で読む(道具は uvx)
- 人が選ぶアダプタであり、実行時にロックファイルを検出して切り替えない(ADR-0085 決定2・/process-init「推測しない」と両立。調査の案 b-4 は採らない)
- `adapters/python.json`: install を `scripts/gate/python-install.mjs`(新)へ。pyproject.toml を tomllib で読み、`[build-system]` があれば editable、無ければ組まずに宣言した依存と extras dev・PEP 735 の群 dev を入れる。開発用の依存が無ければ install で失敗させる(従来は警告で通り、test で落ちていた)。poetry の群だけなら python-poetry を案内する。requirements*.txt だけの形は推測せず失敗させる。test・coverage は `python -m pytest`(所在が sys.path に入る。build-system の無い形で製品を import できるようにするため。WSL で `uv run pytest` は ModuleNotFoundError、`python -m pytest` は通過を確かめた)
- thresholdFiles に「ファイル#表」の形を足した(`pyproject.toml#tool.ruff`・`#tool.coverage`・`#tool.pytest`・`#tool.mypy`・`#tool.pylint`・`#tool.bandit`・`#tool.flake8`、`setup.cfg#coverage` ほか、`tox.ini#coverage` ほか)。`check-pr.mjs` が表の中身だけを比べ、変わったときに閾値の変更に数える。依存だけの変更は数えない。そのファイルは同時変更の検査で製品のコードに数えない。統制の設定の変更の承認の範囲(controlTouchedBetween)も同じ
- `.gitignore` に `.coverage`・`.coverage.*`(調査 5.7)

### 試験

- `scripts/gate/test-adapter.mjs`(新。gate-g5.yml の contract に結線): 46 件。7つのアダプタで secretScan が対象なしで通らないこと、下の階層の目印で失敗すること、projectDir、python-install の入れ方、項目4。修正の前のコードでは 29 件が NG になる(陰性の確認)
- `scripts/gate/test-check-pr.mjs`: 表の読み取りと、pyproject.toml の除外の拡大 + 製品のコードで落ちる場面、依存だけの変更で通る場面ほか 8 件。修正の前の check-pr.mjs では 8 件が NG になる
- 実物の確認(WSL、/tmp/pc363): uv の形で `uv sync --locked` → `uv run --locked python -m pytest` が通過。export + pip-audit が通過。poetry の形で `poetry check --lock`・`poetry sync`・`poetry run python -m pytest`・`poetry run ruff check .` が通過。製品の仮想環境へ poetry を入れると `poetry sync` が poetry 自身を除くことを観測した(アダプタの note に書いた)

### 実物の確認(WSL、/tmp/pc363/run。台本はスクラッチパッド p363/impl/wsl-adapters.sh、出力は wsl-adapters.txt)

調査の試行のリポジトリ(uv・poetry・mixed)に改めたテンプレートを写し、`adapter.mjs` を実物の python 3.12・uv・poetry 2 系で動かした。setup-python の代わりに pip を持つ仮想環境を PATH の先頭に置いた。

| 形 × アダプタ | 結果 |
| --- | --- |
| uv の形 × python(pip) | install(組まずに依存と群 dev を入れる)・test・coverage・coverage-check・lint が通過。調査の D-4(setuptools がテンプレートのディレクトリを拾う)は起きない |
| uv の形 × python-uv | install・test・coverage・coverage-check・lint・audit(No known vulnerabilities)・licenses(8 件すべて許可)が通過。pyproject.toml の依存を変えてロックと食い違わせると install が終了コード 1 |
| poetry の形 × python-poetry | install・test・coverage・coverage-check・lint が通過。lint は `[tool.ruff] extend-exclude` に従う。依存を変えてロックと食い違わせると install が終了コード 1 |
| poetry の形 × python(pip) | install が終了コード 1 で、python-poetry を選ぶよう出す(調査では警告だけで 0 になり、test で落ちていた) |
| mixed × python | test が終了コード 1(下の階層の目印を対象なしにしない)。secretScan は実物の secretlint で実行され通過。projectDir に services/api を書くと install が通り、わざと落ちる python のテストで test が終了コード 1 |

### 本文

- `gate-criteria.md`: IMPL-0474(基準7 は対象なしを認めない。delivered・machine・test-adapter.mjs)と IMPL-0475(目印が下の階層にある実装を対象なしにしない。delivered・machine)を足した。IMPL-0239(#330。降りていない)の note に、下の階層の場合は IMPL-0475 の範囲であることを書き足した。IMPL-0202 の note に「ファイル#表」の比較を書き足した
- `src/data/impl-inventory.yaml`: 節の登録に IMPL-0474・IMPL-0475 を足した。`src/data/impl-untraced.yaml`: `python-install.mjs` を g5-adapter の variant として登録した
- `ci-gates.md` 171 行の限界の記述と、`template-repository.md` の対応の表の行を、pyproject.toml・setup.cfg・tox.ini の表を見る形へ改めた(package.json の中は従来どおり見ない)
- template: `CLAUDE.md` の禁止事項の表の行、`README.md`(アダプタは7種。調査 5.7 の「4種」の誤りも直した)、`.claude/skills/process-init/SKILL.md` の選択肢と基盤の表

## 既存の採用者を落としうる変更(ADR-0085 決定6)

| 落ちうる検査 | 条件 | 直し方 |
| --- | --- | --- |
| secret-scan | 製品のコードが無く、`.secretlintrc.json` が無い(undetermined・none、または対象なしで通っていた案件) | `node scripts/init/generate-profile.mjs --scaffold` で作るか、`.secretlintrc.json` を置く |
| secret-scan | 対象なしで通っていた間に混入した秘匿情報 | 検出された箇所を除く |
| install・test・coverage・lint | 目印が下の階層にだけある | アダプタの projectDir に所在を書く(統制の設定の変更) |
| install(python) | 開発用の依存が extras dev にも PEP 735 の群にも無い | どちらかへ書く。poetry の群なら python-poetry を選ぶ |
| install(python) | `[build-system]` が無く、暗黙の setuptools で製品を組んでいた | `[build-system]` を書く |
| pr-rules | pyproject.toml・setup.cfg・tox.ini の閾値の表と製品のコードを同じ PR で変える | 閾値の表の変更を別の PR に分ける |

## 確認の結果

| 対象 | 結果 |
| --- | --- |
| template の試験一式(test:template-suite) | WSL で 44 本すべて通過。Windows では test-g5-aggregate.mjs だけが落ちる(作業ツリーの CRLF。変更の前の版でも同じ 4 件が落ちることを確かめた。既知) |
| 回帰スイート(WSL、/tmp/pc363/repo、--kb keep) | 実行役の試験 30 件合格。通常の時刻帯と TZ=UTC の両方で「すべて通った」 |
| npm run check の各段(Windows で個別に実行) | lint:ci〜test:criteria の 26 段が通過。lint:text は ci-gates.md 171 行の文の長さ(179 字)で一度落ち、文を分けて通過。lint:provisions・build(348 頁)も通過。test:template-suite と test:regress は上の WSL で実行 |
| 陰性の確認 | 修正の前のコードで、test-adapter.mjs は 29 件、test-check-pr.mjs の追加の場面は 8 件が NG になる |

回帰スイートの最初の実行では trial・t288・t288b が「場面の外で中断」した。原因は、Windows で取り出した template の作業ツリーを WSL へ写したため、様式(templates/05-handover.md)が CRLF になり、スイートの文字列の置き換えが空振りしたこと。template を LF で取り出し直し(コミット a15584f の上に変更の差分を当てた)、全本の通過を確かめた。変更の側の問題ではない。

## コミットと承認の記録

- template: コミット 5877531(トレーラ `Spec: setup`・`Co-Authored-By: Claude Opus 5.5`)
- **push は拒否された**: `refusing to allow an OAuth App to create or update workflow .github/workflows/gate-g5.yml without workflow scope`。gh のトークンの権限が gist・read:org・repo で、workflow を持たない。gate-g5.yml(test-adapter.mjs の結線)を含むため、権限を持つ者の push か、所有者による `gh auth refresh -s workflow` の後の push を要する。AI は権限を広げない
- 本体の submodule の参照は 5877531 へ進めてコミットする。**template の push の前に本体を push してはならない**(参照先が遠隔に無い)
- 強制層(scripts/gate・adapters・.github/workflows)の変更であり、AI維持管理者の承認待ちとして記録する

| 欄 | 値 |
| --- | --- |
| 変更 | pit-in-template 5877531・608505d |
| 承認の状態 | 承認待ち |
| 名簿 | |
| 承認者(AI維持管理者) | |
| 承認の日 | |

## 採らなかったこと

- 実行時にロックファイル(poetry.lock・uv.lock)を検出して install を切り替えること(調査の案 b-4)。ADR-0085 決定2 と /process-init の「推測しない」に反する。人が選ぶアダプタを足した
- python アダプタで requirements*.txt だけの形を入れること。どのファイルを入れるかを推測しないため、失敗させて書き換えを案内する
- thresholdFiles に pyproject.toml の全体を足すこと(調査の案 b-5 の前半)。依存の更新まで閾値の変更として止める。表の単位で比べる
- package.json の中の閾値(c8・jest・eslintConfig の鍵)。今回の範囲(python の形)の外。従来どおり見ないことを ci-gates.md に残した
- 構成(process.config.json)に製品のコードの所在を置くこと。形式の版の繰り上げと migrate を要する(ADR-0085 決定5)。アダプタの欄で足りる
- poetry・uv の版の固定。下限だけを置き、固定はアダプタの書き換え(統制の設定の変更)で行う旨を note に書いた
- 欠陥③(混在のリポジトリ)と、事前点検が混在を告げること。重の審議の裁定(decision.md)に従い、別の作業で行う

## 独立の突合(crosscheck-fix.md)への対応

入力: `crosscheck-fix.md`(重大度 中が X-1〜X-3、低が X-4〜X-6。高は無い)。議長の指示に従い、6件とも直した。template のコミットは 5877531 の上に積んだ 608505d(push は所有者の権限の更新を待つ。試していない)。

| 指摘 | 対応 |
| --- | --- |
| X-1 projectDir の書き誤りで対象なしになる | `config.mjs` に `assertProjectDirExists` を足した。projectDir が無いディレクトリを指せば、目印が直下にあっても adapter.mjs(secretScan を含むすべての段)・coverage-check.mjs・契約検査で失敗させる。所在が直下でないときは、直下の目印も所在の外の目印に数える(従来は `/` を含むパスだけを見ていた)。IMPL-0475 の note に書いた |
| X-2 既存のファイルへの表の新設が「初回の設定」で通る | 案(a)を採った。初回の設定は、ファイルそのものが基底に無い場合に限る。基底に在るファイルへ表を新しく足す変更は、閾値の変更(表示に「表を新しく足した」)として同時変更の検査と統制の設定の変更の承認の範囲に入れる。IMPL-0202 の note、ci-gates.md の限界の記述、template-repository.md の表の行に書いた。案(b)(表にも初回の免除を及ぼす)は採らない。表の新設は除外の追加に近く、緩める経路が残るため |
| X-3 旧い S0 の採用者で、secretlint の英語の失敗だけが出る | 落ちる向きは変えない。adapter.mjs は secretScan の前に `.secretlintrc*` の有無を確かめ、無ければ日本語で `--scaffold` で作れることを出して失敗させる。契約検査は、undetermined・none の空の secretScan に、取り込んだ版のアダプタから写す手順を出す。template の README に旧い採用者への影響を書いた |
| X-4 python-uv が runtimeVersion の python を使うとは限らない | adapter.mjs が、runtime が python のアダプタで `UV_PYTHON` に runtimeVersion を渡す(既に指定があれば変えない)。python-uv の note に書いた。WSL の実物の確認で、カバレッジの出力が python 3.12.3 であることを見た |
| X-5 文書の取り残し | /process-init の SKILL.md 240 行と generate-profile.mjs 528 行のスタックの列挙に python-poetry・python-uv を足した |
| X-6 行末の注記の変更で閾値の変更に数える | TOML のファイルに限り、文字列の外の行末の注記を除いて比べる(`stripTomlComment`。基本の文字列・リテラルの文字列・複数行の文字列を区別する)。INI(setup.cfg・tox.ini)は値の中の `#` を値として読むため、行の全体の注記だけを除く従来のままとした |

試験: test-adapter.mjs は 54 件(X-1・X-3・X-4 を足した)、test-check-pr.mjs は 147 場面(X-2・X-6 を足した)、test-init-g5.mjs は 138 件(契約検査が無い projectDir で落ちること)。前のコミット(5877531)の check-pr.mjs・config.mjs・adapter.mjs では、足した場面のうち 13 件が NG になる(陰性の確認)。

確認(608505d): WSL の回帰スイートは実行役の試験と、通常の時刻帯・TZ=UTC の両方で「すべて通った」。WSL の template の試験一式は 44 本すべて通過。Windows の npm run check の各段(lint:ci〜test:criteria・lint:text・lint:provisions・build)はすべて通過し、test:template-suite は既知の test-g5-aggregate.mjs(CRLF)だけが落ちる。WSL の実物の確認(p363/impl/wsl-adapters-2.txt)は前回と同じ結果で、python-uv のカバレッジの出力は python 3.12.3 だった。

本体の submodule の参照は 608505d へ進める。template の push は未了のままであり、template の push の前に本体を push してはならない。
