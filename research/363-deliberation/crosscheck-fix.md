# #363 修正の独立の突合(欠陥①②・python の形・閾値の表)

- 日付: 2026-11-11
- 対象: process-compass `7198443`、準拠テンプレート `5877531`(未 push。手元のコミットを読んだ)
- 入力の分離: `implementation.md` と実装した側の説明は、判断を終えるまで読んでいない。読んだのは `survey-363.md`、再現の台本(スクラッチパッド `p363/scripts/`)、2つのコミットの差分
- 実行の場所: スクラッチパッド `p363x/repos/`(現行のテンプレートから `mkbase.sh` で作り直した複製)。リポジトリは書き換えていない
- 環境: Windows 11、Git Bash、node、Python 3.14.6、poetry 2 系、uv

## 結論

| 確かめること | 結果 |
| --- | --- |
| 1. 欠陥①(秘匿情報の検査が対象なしで通る) | **直っている**。node・python・go・undetermined・none・python-poetry・python-uv の7つで、製品のコードの無い複製でも secretScan が走る |
| 2. 欠陥②(下の階層の python が対象なし) | **直っている**。ただし projectDir の書き誤りで同じ「黙って外れる」が再び起きる(指摘 X-1、重大度 中) |
| 3. python-poetry・python-uv | **ロックどおりに入り、食い違うと落ちる** |
| 4. 「ファイル#表」の閾値 | 表の中の変更だけに掛かり、依存・メタデータの変更では誤検出しない。ただし既存のファイルに表を新しく足す緩めは「初回」として通る(指摘 X-2、重大度 中) |
| 5. 既存の採用者の構成 | 旧い構成の読み込みと adapter の値は互換。S0(undetermined)の採用者は、更新の後に G-5 が落ちる(指摘 X-3、重大度 中。向きは正しい) |
| 6. 欠陥③(混在) | 手を付けていない |
| 7. IMPL-0469・0470 の印と、IMPL-0239・0202 の note | 書式は `lint:impl` を通る。記述は実物と合う。X-1・X-2 の開示が欠ける |

重大度「高」の指摘はありません。

## 実行での確認

### 1. 欠陥①

テンプレートだけの複製(製品のコード無し)で、`adapter.mjs run secretScan` を7つのアダプタで実行しました。

| 条件 | 結果 |
| --- | --- |
| `.secretlintrc.json` 無し | 7つとも「製品のコードの有無に依らず実施する検査です」と出して secretlint を実行し、secretlint の `config is not found` で終了コード 2。対象なしの notice は出ない |
| `.secretlintrc.json` あり、秘匿情報なし | 終了コード 0 |
| `deep/x/creds.txt` に AWS の鍵を置く(undetermined・python) | 両方で検出し、終了コード 1 |

- `verify-gate-contract.mjs` の空の secretScan の検査は、`if (adapter.runtime …)` の外へ出ており、undetermined でも落とす(差分で確認)
- `g5-aggregate.mjs` の `machineCheckStatus` は、secretScan だけを「検査対象が存在しない」から外す。`test-adapter.mjs` の項目4 の2件が通る
- 台本の当初の観測(4つのアダプタで「実施しません」・終了コード 0)は再現しない

### 2. 欠陥②

`services/api/pyproject.toml` だけを持つ複製(python アダプタ、projectDir 既定)で確かめました。

| 条件 | 結果 |
| --- | --- |
| projectDir 既定(`.`) | install・test・lint・coverage-check の全部が「直下に目印のファイルが無く、下の階層にあります(services/api/pyproject.toml)」で終了コード 1。projectDir の書き方を出す |
| projectDir を `services/api` | install(editable)・test・coverage・lint・coverage-check(分母 5 行で 100%)が所在で走り、終了コード 0。生成物(`coverage.json`・`.coverage`)は `.gitignore` に当たる |
| projectDir を存在しない `srv`、目印は直下の `pyproject.toml` | **test は「対象が存在しないため実施しません」で 0、coverage-check も「未実施として記録」で 0**(X-1) |
| 追跡していない `build/app/pyproject.toml` だけ | 対象なしで 0(`build/` は `.gitignore` と `TARGET_SKIP_DIRS` の両方で外れる。低い) |

- テンプレートの追跡しているファイルに、目印(`package.json`・`pyproject.toml` など)は1つも無い。製品のコードの無い採用者が、テンプレート自身の目印で偽の失敗になることは無い

### 3. python-poetry・python-uv

台本の poetry・uv の製品を、現行のテンプレートの複製へ載せて動かしました(setup-python の代わりに、リポジトリの外の venv を PATH の先頭に置いた)。

| アダプタ | 一致するとき | `pyproject.toml` だけに依存を足したとき |
| --- | --- | --- |
| python-poetry | install(`poetry check --lock && poetry sync`)・test・coverage・lint が 0 | install が `pyproject.toml changed significantly since poetry.lock was last generated` で 1 |
| python-uv | install(`uv sync --locked`)・test・coverage・lint が 0 | install も test も `The lockfile at uv.lock needs to be updated, but --locked was provided` で 1 |

- `python-install.mjs`(素の python)の `planInstall` は、`[build-system]` の無い形で依存だけを入れ、`.[dev]` の editable を避ける。D-4 の setuptools がテンプレートのディレクトリを拾う失敗の原因に当たっている(projectDir の確認の install で、build-system ありの editable が通ることを見た。build-system 無しは `test-adapter.mjs` の試験に任せ、実行では確かめていない)

### 4. 「ファイル#表」の閾値

poetry の複製で、製品のコード(`src/poetryapp/core.py`)と `pyproject.toml` を同じ変更で変え、`analyzePr` を呼びました。

| 場面 | 閾値の変更 | 同時変更の誤り |
| --- | --- | --- |
| A: `[tool.ruff]` の `extend-exclude` に `src` を足す | `pyproject.toml([tool.ruff])` | あり |
| B: 依存(`requests`)だけを足す | なし | なし |
| C: `description` の変更と、ファイルの末尾の注記 | なし | なし |
| D: `[tool.coverage.run]` に `omit` を足す | `pyproject.toml([tool.coverage])` | あり |
| E: 新しい下位の表 `[tool.ruff.lint]` を足す | `pyproject.toml([tool.ruff])` | あり |
| F: 見出しの空白(`[ tool . coverage . run ]`)と行末の注記だけ | `pyproject.toml([tool.coverage])` | あり(行末の注記で数える。安全側の誤検出。低い) |
| G: 表の中に空行と行の全体の注記だけ | なし | なし |
| H: `[tool]` の下の `mypy = { ignore_errors = true }` | なし | なし(開示済みの限界) |
| N: projectDir の下の `services/api/pyproject.toml` に `[tool.ruff]` を足す(基底の表は無い)と、`services/api/.coveragerc` を新しく作る | `initial` に2件 | **なし**(notice だけ。X-2) |

- 下の階層の `pyproject.toml` も基本名で当たる(N で `initial` に載る)
- `controlTouchedBetween` は `changed` と `initial` の両方を統制の設定の変更の承認の範囲に入れる

### 5. 試験

テンプレートの `test-adapter.mjs`(46 件)・`test-check-pr.mjs`(144 場面)・`test-init-g5.mjs`(136 件)・`test-coverage-scope.mjs`(36 件)は Windows で全件が通りました。本体の `lint:impl`・`lint:scope` と、変更した3ページの textlint も通りました。

## 指摘

### X-1 projectDir の書き誤りで、製品のコードが「対象なし」になる(重大度 中)

- 所在: `template/scripts/gate/config.mjs` の `targetState`(下の階層の目印を集める `.filter((f) => f.includes('/') …)`)と `adapterProjectDir`
- 根拠: projectDir を存在しない `srv` にし、目印を直下に置くと、test と coverage-check が対象なしで 0 になった(上の表)。下の階層の探索は、直下のファイル(`/` を含まない)を外すため、所在が直下以外のときに直下の目印を見落とす。存在しない所在も、契約検査(`verify-gate-contract.mjs`)は落とさない(形の検査だけ)。G-5「実装が存在する段階で、この扱いを用いてはなりません」に当たり、D-2 と同じ「黙って外れる」の形が、別の入口から残る。書き誤りは統制の設定の変更の承認を経るため、起きる場面は限られる。このため「高」にはしない
- 直し方の向き
  - 所在が直下でないときは、直下の目印も「所在の外の目印」に数える
  - projectDir が指すディレクトリが無ければ、契約検査と adapter.mjs で失敗させる
  - 足りない場合に限り、IMPL-0470 の note で開示する

### X-2 既存の依存と設定を兼ねるファイルに、閾値の表を新しく足す緩めが「初回の設定」として通る(重大度 中)

- 所在: `template/scripts/gate/check-pr.mjs` の `keyedThresholdChanges`(`if (b === null || !sb) initial.push(…)`)
- 根拠: 場面 N。基底の `pyproject.toml` は在り、`[tool.ruff]` の表だけが無いとき、`exclude = ["api"]` を製品のコードと同じ PR で足しても、notice「初回の設定(同時変更の検査の対象外)」だけで通る。poetry・uv の既存のリポジトリは `[tool.coverage]` を持たないことが多いため、最初の `omit` が素通りする。単独のファイル(`.coveragerc` の新設)の初回の免除は既存の決定である。一方、ファイルが基底に在る場合まで免除へ含めるかは決められていない。`template-repository.md` の「初回の設定は通す」は、ファイルの初回とも表の初回とも読める
- 直し方の向き(どちらかを議長が決める)
  - (a) ファイルが基底に在るときの表の新設は `changed` に数える(緩めの経路を閉じる)
  - (b) 初回の免除を表にも及ぼすと決め、`ci-gates.md` の限界の記述と IMPL-0202 の note に書く
  - 判断軸は信頼性である。(a) を推す。表の新設は、初回の導入より「除外の追加」に近いため

### X-3 S0(undetermined)の既存の採用者は、更新の後に G-5 の secret-scan と contract が落ちる(重大度 中。向きは正しい)

- 所在: `template/adapters/undetermined.json`・`none.json`、`verify-gate-contract.mjs`、`scripts/init/generate-profile.mjs` の `scaffoldStack`
- 根拠: 旧い初期化は undetermined・none で `.secretlintrc.json` を作らなかった。新しい secretScan は、それが無いと secretlint の英語の `config is not found` だけで終了コード 2 になる(実行で確認)。採用者が自分の `adapters/undetermined.json` を旧いまま持つ場合は、契約検査が「secretScan が空」で落ちる。基準7 の対象なしを認めないという向きは標準どおりで、落ちることそのものは正しい。欠けているのは、何をすればよいかを出す文と移行の手順である
- 直し方の向き
  - adapter.mjs(secretScan)か契約検査で `.secretlintrc*` の有無を先に確かめ、`node scripts/init/generate-profile.mjs --scaffold` で作れることを出す
  - 版の切り替えの手順(process-change)か README の変更点に、S0 の採用者への影響を書く

### X-4 python-uv が runtimeVersion の python を使うとは限らない(重大度 低)

- 所在: `template/adapters/python-uv.json` の install・test
- 根拠: PATH の先頭に Python 3.14 の venv を置いても、`uv sync --locked` は 3.13.7 の環境を作った(coverage の出力の `python 3.13.7-final-0`)。CI では setup-python の 3.12 と、uv が選ぶ版がずれうる。ロックファイルとの一致には影響しない
- 直し方の向き: `UV_PYTHON` に runtimeVersion を渡すか、note で開示する

### X-5 文書の取り残し(重大度 低)

- 所在: `template/.claude/skills/process-init/SKILL.md` 240 行、`scripts/init/generate-profile.mjs` 528 行
- 根拠: スタックの選択肢を「node, python, go, none」と書いたままで、python-poetry・python-uv が無い(表の側の 89〜90 行は直してある)
- 直し方の向き: 列挙を表に合わせる

### X-6 行末の注記の変更だけで閾値の変更に数える(重大度 低。安全側)

- 所在: `check-pr.mjs` の `tableSection`(行の全体の注記だけを除く)
- 根拠: 場面 F
- 直し方の向き: 直さなくてもよい。直すなら、文字列の外の行末の `#` 以降を除く。TOML の文字列の中の `#` を取り違えないよう注意が要る

## 7. 印と note の突合

- IMPL-0469: `target=g5-adapter state=delivered check=machine test=template/scripts/gate/test-adapter.mjs`。note の4点(直下で全体へ実行・undetermined と none へコマンドを置く・契約検査が空を落とす・項目4)は、差分と実行で確かめた。基準7 の段落の直後で、置き場は適切
- IMPL-0470: 同じ形。note の「adapter.mjs と coverage-check.mjs は対象なしにせず失敗させ、所在を projectDir に書くよう出す」は実行で確かめた。目印の無い実装と、実装の開始後の対象なしを IMPL-0239 へ残す切り分けは適切。X-1 の書き誤りの経路は note に無い
- IMPL-0239: undelivered のまま、IMPL-0470 への参照だけを足した。降ろしたと偽っていない
- IMPL-0202: 「ファイル#表」の中身だけを比べることと、package.json の中を見ないことを足した。X-2 の表の初回の扱いは書かれていない
- `impl-inventory.yaml` に 0469・0470 を載せ、`impl-untraced.yaml` に `python-install.mjs` を variant(of: g5-adapter)で載せた。`lint:impl` は通る

## 6. 欠陥③に手を付けていないこと

- node のアダプタで直下に `package.json` があれば、`targetState` は直下の目印で `present` を返し、下の階層の python を見ない。混在の振る舞いは変わらない
- `coverage-check.mjs` の差分は集計ファイルの所在(projectDir)だけで、測れない拡張子を警告で外す扱い(`NODE_MEASURABLE`)は変えていない
- `preflight.mjs` と `setup-stack` は変えていない
- python のアダプタを選んだ混在のリポジトリは、対象なしで通らず失敗するようになる。これは欠陥②の修正の効果で、欠陥③の扱い(両方を走らせる)には踏み込んでいない
