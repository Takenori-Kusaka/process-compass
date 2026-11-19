# 束 B28 外部調査 1 — R1 の PR ごとのミューテーション試験段(増分・言語別の道具・外部結果の取り込み)

調査日: 2026-11-20(以下「2026-11 時点」)。取得は WebFetch/WebSearch の要約を介しており、引用は要約の範囲。原文照合が要る項目は「要照合」と付す。
既調査(`research/b22-deliberation/10-research-B.md` §2: Petrović ほか 2021、Stryker JS の thresholds 既定、閾値を合否にする批判)は繰り返さない。
出典台帳(`research/sources/`)へは未登録。登録の候補を各節末に並べる。

## 0. 要点

- 点1: PR 増分の所要時間の**公開の実測は見つからなかった**。見つかったのは (a) ツール公式が「増分は速いが網羅ではない」と述べる文言、(b) 実測でない数字(ブログの例示・第三者ページの主張)、(c) 全量実行の時間(Bitcoin Core 30 時間超、cargo-mutants 自身 約 15 分)だけ。
- 点2: 差分・履歴の増分対応は道具で大きく違う。合否を終了コードで返せるのは cargo-mutants・Stryker JS/.NET・PIT・cosmic-ray(cr-rate)。mutmut は終了コードの記述を確認できず、gremlins は版・経路で食い違う報告がある。
- 点3: 機械可読の共通形式は mutation-testing-report-schema(JSON)。スコア・生き残り・位置は決定可能に読めるが、**対象のコミットを持つ欄はスキーマに無い**。SonarQube へは Stryker の jq 変換で外部 issue として取り込む(生き残りのみ)。

## 1. PR ごとの増分(差分のみ)の所要時間・費用

### 1.1 事実

- 機能の位置づけ(公式の文言)
  - cargo-mutants `--in-diff`: 「diff の変更領域と重なる変異体だけを試験する」。PR 向けの CI 例では「ずっと速い反応を得られるが、全体を回せば見つかる問題を見逃しうる」(コメント)。時間の数値は書かれていない
    - https://mutants.rs/in-diff.html / https://mutants.rs/pr-diff.html
  - PIT FAQ: 「最も効果的な使い方は、通常、変更中のコードに分析を限ることだ」「PIT は他より速いが、それでも時間がかかりうる」
    - https://pitest.org/faq/
  - Stryker JS 増分モード(2022-09-06 の告知): PR では「main の最後の実行からの変更」だけ見れば足りる。ブログは時間の測定を載せず、**再利用した変異体数**(3965 件中 3731 件の結果を再利用)のみ。ドリフトのため定期の全量実行(`--force` かダッシュボード報告)を勧める
    - https://stryker-mutator.io/blog/announcing-incremental-mode/
- 実測に近い数字
  - cargo-mutants 自身に対する**全量**実行: 575 変異体で約 15 分(増分ビルドと並列化による)。diff 実行の数字ではない(LWN の記事。検索要約のみ、要照合)
    - https://lwn.net/Articles/995276/
  - Bitcoin Core: 週次の全量実行は「30 時間超」。機能試験が 1 分超のものがあり、20 変異体で最低 20 分。8 件の PR を増分で解析したが **PR ごとの所要時間の記載は無い**。1 PR あたり未殺変異体を最大 7 件だけ見せる運用案
    - https://delvingbitcoin.org/t/incremental-mutation-testing-in-the-bitcoin-core/2197
  - Google(既調査 B1): 差分・1 行あたりの件数を絞る運用。本調査で費用・時間の数値は見つけず(要旨のみ確認)
    - https://arxiv.org/abs/2102.11378
- 実測でない数字(信頼しない)
  - 「40 分の全量が 3 分の増分」: 実務ブログの**例示**であって測定でない(helpmetest.com の記事。検索要約のみ)
    - https://helpmetest.com/blog/mutation-testing-ci-pipelines/
  - 「10〜50 倍速」「PR ごとに 2 分未満」: 第三者のスキル紹介ページの主張。出典も測定もなし
- 差分機能の実務での使われ方(公式・公開例)
  - cargo-mutants: `git diff origin/<base>..` で diff を作り `--in-diff` に渡す。`fetch-depth: 0` が要る。`mutants.out` を artifact として保存。PR だけで実行、main への push は全量(サンプルの構成)
    - https://mutants.rs/pr-diff.html
  - cargo-mutants の落とし穴: diff はテストコードではなく**被試験コードにだけ**照合する。テストだけ変えた diff は変異体ゼロ。他領域の編集が別所の試験を弱めうる
    - https://mutants.rs/in-diff.html
  - Stryker JS: 結果ファイル `reports/stryker-incremental.json` を CI のキャッシュで持ち回る(キーに base ブランチを使い main へフォールバックする例が複数。第三者ガイド)。公式は「ソース管理に入れず build artifact として扱う」
    - https://stryker-mutator.io/docs/stryker-js/incremental/ / https://stryker-mutator.io/blog/announcing-incremental-mode/
  - Stryker JS の検出の穴: 変異対象ファイルとテストファイル以外の変更(依存更新・環境変数・.snap・README)は検出しない。テスト変更の検出は runner 依存(Jest/Vitest は位置まで、Mocha/Tap はファイル単位、Jasmine/Karma は名前のみ、command runner は検出なし)
    - https://stryker-mutator.io/docs/stryker-js/incremental/
  - PIT の増分: 実験的機能。「大きなコードベース向け」。依存の追跡は強い依存(スーパークラス・外側クラス)だけで、前提は「現時点で未実証」と公式が明記。生き残りの一括(メタ変異体)は未実装
    - https://pitest.org/quickstart/incremental_analysis/
  - PIT + Arcmutate(商用): `+GIT(from[HEAD~1])` と履歴で変更分に限る。PR へのコメント・注釈は生き残りのみ。**公式ブログに「公開リポジトリの fork の PR には不向き(API の権限の都合)」の記述**(古い記事、要照合)
    - https://pitest.org/quickstart/maven/ / https://blog.pitest.org/dont-let-your-code-dry
- 小さなチームの CI 分単位の公開の事例
  - Codeberg の個人リポジトリに Stryker 増分+CI キャッシュを入れた PR(#36)があるが、**前後の時間の記載なし**(確認済み)
    - https://codeberg.org/glueckauf/bergwerk/pulls/36

### 1.2 分からなかったこと

- 小さなチームの PR 増分の所要時間・CI 費用(分・円)の**公開の実測は見つからなかった**
- cargo-mutants `--in-diff`・Stryker 増分・PIT 増分のいずれも、公式が時間の数値を載せていない
- 増分での検出漏れ率(ドリフトの量)の公開の実測は見つからなかった。PIT 公式が「未実証」と書くのが現状
- Google の論文本文の費用・時間の数値は未読(要旨のみ)

### 登録候補

| URL | 題 | 著者/発行 | 年 | 抜き書き |
|---|---|---|---|---|
| https://mutants.rs/in-diff.html | Incremental tests of modified code | cargo-mutants 公式 | 2026 取得 | "they're not a substitute for a full test run" |
| https://mutants.rs/pr-diff.html | Incremental tests of pull requests | 同上 | 2026 取得 | "can miss some problems that would be found by running mutants on the whole codebase" |
| https://stryker-mutator.io/blog/announcing-incremental-mode/ | Announcing incremental mode | Stryker Team | 2022-09-06 | "ideal for Continuous Integration (CI) scenarios" |
| https://pitest.org/quickstart/incremental_analysis/ | Incremental Analysis | PIT 公式 | 2026 取得 | 依存変更が結果を変えないという前提は "currently unproven" |
| https://pitest.org/faq/ | FAQ | PIT 公式 | 2026 取得 | "limit analysis to the code that you are changing" |
| https://delvingbitcoin.org/t/incremental-mutation-testing-in-the-bitcoin-core/2197 | Incremental mutation testing in the Bitcoin Core | Delving Bitcoin 投稿 | 2025 頃(要照合) | 週次の全量は "over 30 hours" |

## 2. 言語ごとの道具(2026-11 時点)

凡例: 終了コード=合否を返せるか。報告=機械可読の出力。

### 2.1 事実の表

| 言語 | 道具 | 保守(確認できた範囲) | 増分(差分・履歴) | 終了コード・閾値 | 報告の形式 |
|---|---|---|---|---|---|
| Java | PIT (pitest) | 最新 1.30.2(Nov、年は要照合) | 履歴ファイルによる増分(実験的)。git 連携・PR 連携は商用 Arcmutate | Maven/CLI に `mutationThreshold`(0-100)、`coverageThreshold`、`failWhenNoMutations`(既定 true) | `outputFormats`: HTML/XML/CSV。既定 HTML |
| Python | mutmut | PyPI 集計で 3.5.0(2026-02-22 時点の記載) | 前回からの**関数単位**の変更だけ再試験。git は非 Python ファイルの変更検出に使う。diff で変異対象を絞る機能は記述なし。Windows 非対応(WSL 要) | **記述を確認できなかった** | `export-cicd-stats`(形式の記述なし)、`badge` で Shields JSON |
| Python | cosmic-ray | 8.4.6(2026-04-02、第三者の一覧) | 増分の記述なし。`cr-report --show-diff` は変異の diff 表示のみ | `cr-rate --fail-over <%>` が**生存率**が上なら非 0。`--estimate` で信頼区間にも適用 | `dump` が JSON(各行が WorkItem と WorkResult の組)。`cr-report` は文章。Stryker 形式への第三者変換器あり |
| JS/TS | StrykerJS | 公式文書あり | `--incremental`(結果ファイル)、`--force`、`--mutate file:lines`。**`--since` は文書に無い** | `thresholds.break` を下回れば終了コード 1(既定 null=落とさない。既調査) | `json` 等の reporter。形式は mutation-testing-report-schema |
| C# | Stryker.NET | 文書あり | `--since[:<committish>]`(git で変更分だけ報告)と `--with-baseline`(前回の完全な報告を更新して完全な報告を返す)。両者は別機能(メンテナの説明) | `thresholds.break`/`break-at`。下回れば終了コード 1 | `json` reporter |
| Scala | Stryker4s | **本調査では未確認** | 未確認 | 未確認 | 未確認 |
| Go | gremlins | 0.x。公式は「最新マイナーのみ保守」「後方互換を保証しない」 | 公式 README は diff/増分に言及せず。文書索引の要約は PR 向け増分に言及するが**未確認** | `--threshold-efficacy`/`--threshold-mcover`。**フラグ指定で終了コードが変わらない不具合の PR(#281)**(設定ファイルでは動作。#281 の反映は未確認)。v0.6.0 で閾値違反時も 1 を返す報告が単一の非公式ページにある | `--output` で JSON(スキーマの記述は未取得)。`test_efficacy` 欄を読む例 |
| Go | go-mutesting(zimmski → avito-tech → 多数の fork) | 上流の issue 対応は遅い(集計サイト)。fork は更新あり(v2 が 2026-05 公開と表示) | 未確認 | 未確認 | 未確認 |
| Go | mutest、gorgon | 新しめの小規模 | `-diff <git-ref>` で変更行に限る(検索要約) | 閾値フラグあり(要照合) | 未確認 |
| Rust | cargo-mutants | 27.1.0(2026-06-02) | `--in-diff <diff>`(変更領域と重なる変異体のみ)、`--iterate`(前回捕まえた分を除く) | 0=全捕捉、1=使用法誤り、2=未捕捉あり、3=タイムアウト、4=基準の試験が失敗、5=diff が木と不一致、6=diff 不正、70=内部エラー | `mutants.out/`: `outcomes.json`(26.0.0 で `start_time`・`end_time`・`cargo_mutants_version` を追加)、`mutants.json`、`caught.txt`・`missed.txt` 等 |

出典:
- PIT: https://pitest.org/quickstart/maven/ , https://pitest.org/quickstart/commandline/ , https://pitest.org/quickstart/incremental_analysis/ , https://github.com/hcoles/pitest/releases
- mutmut: https://mutmut.readthedocs.io/en/latest/ , https://github.com/boxed/mutmut , 版は https://depscope.dev/pkg/pypi/mutmut (集計サイト)
- cosmic-ray: https://cosmic-ray.readthedocs.io/en/latest/reference/cli.html , 変換器 https://pypi.org/project/cosmic-ray-to-mutation-elements-adapter/
- StrykerJS: https://stryker-mutator.io/docs/stryker-js/incremental/ , https://stryker-mutator.io/docs/stryker-js/configuration/ (既調査 B2)
- Stryker.NET: https://stryker-mutator.io/docs/stryker-net/configuration/ , https://www.github.com/stryker-mutator/stryker-net/discussions/2860
- gremlins: https://github.com/go-gremlins/gremlins , https://github.wyh1030873310.workers.dev/go-gremlins/gremlins/pull/281/ (ミラー。公式で要照合)
- go-mutesting 系: https://pkg.go.dev/github.com/jonbaldie/go-mutesting/v2 , https://awesome.ecosyste.ms/projects/github.com%2Fzimmski%2FGo-mutesting (集計サイト)
- cargo-mutants: https://mutants.rs/exit-codes.html , https://mutants.rs/mutants-out.html , https://github.com/sourcefrog/cargo-mutants/releases

### 2.2 補足の事実

- cargo-mutants の終了コード 2(未捕捉あり)は**閾値なしで**合否に使える。スコアの比率ではなく「未捕捉が 1 件でもあるか」。比率の閾値は終了コードに無い
- cargo-mutants の終了コード 5 は、diff が作業木の文面と合わないとき。PR の base とのずれで起きうる(CI の設計では checkout の深さ `fetch-depth: 0` が要る)
- PIT の `failWhenNoMutations` は既定 true。変更が変異対象を含まないとき(文書のみの PR など)に失敗しうる(推測を含む。要実行確認)
- cargo-mutants は、diff が Rust 以外だけ変えたとき「変異体なし」の明確なエラーを出す(v25.3.0)。差分実行は「変異体ゼロ」を例外として扱う点を各道具で確認する必要がある
- Stryker.NET の既知の不具合報告: テストを変えると差分機能が全変異体をリセットする(機能要望)、非 .cs ファイルの変更で全変異を走らせる(discussion #3013)。いずれも検索要約で、要照合

### 2.3 分からなかったこと

- Stryker4s(Scala)の増分・終了コード・報告
- mutmut の終了コードと `export-cicd-stats` の JSON の形(文書に記述なし)。ソース確認が要る
- gremlins の現行版の終了コードの実際、JSON のスキーマ、`--diff` の有無(公式文書の unleash の頁が取得できず)
- go-mutesting 系で標準的な fork がどれか、終了コード・増分の対応
- 上記以外の言語(Kotlin = PIT+Arcmutate か Stryker、PHP Infection、Ruby mutant、C/C++ Mull、.NET 以外)は**調べていない**
- PIT のリリース年(取得は "05 Nov" の表示のみ。2026 と推定されるが未確認)

## 3. 外部で実行した結果を CI で取り込む・照らす先例

### 3.1 mutation-testing-report-schema(Stryker の共通形式)

- 事実: トップレベル `schemaVersion`・`thresholds`・`files` が必須。他に `config`・`testFiles`・`projectRoot`・`performance`・`framework`・`system`
  - `thresholds`: `high`・`low` が必須
  - `files.<パス>`: `language`・`source`(ソース文面そのもの)・`mutants` が必須
  - 変異体: `id`・`mutatorName`・`location`・`status` が必須。`status` は `Killed`/`Survived`/`NoCoverage`/`CompileError`/`RuntimeError`/`Timeout`/`Ignored`/`Pending`
  - `performance`: `setup`・`initialRun`・`mutation`(時間)が必須
  - `framework.name`・`framework.version`(ツール版)・`system.ci`
  - **コミット・git の欄は無い**。最も近いのは `schemaVersion` と `framework.version`
  - https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/src/mutation-testing-report-schema.json
- 事実: 検証は AJV 等の JSON Schema 検証器で行える。非 JS 利用者はスキーマの JSON を直接取得する
  - https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/README.md
- 事実: 他の道具がこの形式へ出す例がある(cosmic-ray の変換器 https://pypi.org/project/cosmic-ray-to-mutation-elements-adapter/ )。道具の網羅は未調査
- 解釈(考察): スコアは `files[*].mutants[*].status` から**再計算**できる(決定可能)。生き残りの一覧・位置(`location`)も取れる。一方、**どのコミットで実行したか**は欄に無いため、`source` の文面と作業木の文面の一致(ハッシュの突合)か、外側(CI の artifact のメタデータ・別欄の台帳)で持つ必要がある。ただし `source` の一致は報告の改ざん防止にならない(報告自体を偽造できる)

### 3.2 Stryker Dashboard

- 事実: `PUT /api/reports/<gitProvider/organization/repository>/<version>` に `X-Api-Key` で送る。version は**ブランチ名・git タグ・git SHA**。完全な報告と、スコアだけの報告(`{ "mutationScore": 42 }`)の両方に対応。スコアだけだと詳細は保存されずバッジのみ
  - https://stryker-mutator.io/docs/General/dashboard/
- 事実: 取得 API・ベースライン比較は当該頁に記述なし(確認できず)
- 事実: ダッシュボードのバックエンドが対応する git プロバイダは github.com のみ(検索要約。要照合)
- 解釈: version に SHA を使えるので「対象のコミット」を載せる先例はある。ただし欄は報告本体でなく URL の側にある

### 3.3 SonarQube

- 事実: Stryker の公式文書の手順は、JSON の報告を **jq で SonarQube の汎用 issue 形式へ変換**し、`sonar.externalIssuesReportPaths` で取り込む。取り込むのは Survived と NoCoverage のみ。Code Smell・MAJOR・工数 10 分。SonarQube 上で False Positive にできない(規則は Stryker 側の設定で管理)
  - https://stryker-mutator.io/docs/mutation-testing-elements/sonarqube-integration/
- 事実: SonarQube Server は汎用 issue 形式(JSON)と SARIF で外部 issue を取り込める
  - https://docs.sonarsource.com/sonarqube-server/latest/analyzing-source-code/importing-external-issues/external-analyzer-reports/
- 事実: PIT 向けの旧 sonar-pitest-plugin(0.9.1)は SonarQube 7.6 で動かないとの報告があり、後継の mutation-analysis-plugin が PIT の `mutations.xml` を読んで変異ごとに issue を作る(コミュニティの投稿。現行の互換性は未確認)
  - https://community.sonarsource.com/t/sonar-pitest-plugin-0-9-1-is-not-working-with-sonarqube-7-6/7328 , https://community.sonarsource.com/t/take-over-mutation-testing-plugin/54930
- 事実: SonarCloud/SonarQube Cloud への取り込みは機能要望のスレッドが見える(検索要約)

### 3.4 PIT の XML 報告

- 事実: `outputFormats` に XML を指定できる(https://pitest.org/quickstart/maven/ )。**`mutations.xml` の属性(detected・status・sourceFile・lineNumber・mutator・killingTest 等)の公式の仕様頁は本調査で見つからなかった**。サードパーティの取り込み(上記プラグイン)が読む実態がある
- 解釈: 属性名は私の記憶に依るため、仕様として使うなら実ファイルか PIT のソースで要確認

### 3.5 cargo-mutants の出力

- 事実: `outcomes.json` は変異体ごとの結果・結果ごとの件数・ツール版(26.0.0 以降は開始・終了時刻も)。`missed.txt` 等で結果別の一覧。**git のコミット欄は文書に記述なし**(確認できず)
  - https://mutants.rs/mutants-out.html , https://github.com/sourcefrog/cargo-mutants/releases
- 事実: 終了コード 2 が「未捕捉あり」。外部で実行した結果を CI で受けるなら、`outcomes.json` の件数か `missed.txt` の空・非空を読む形になる(解釈)

### 3.6 「外部実行の記録を CI で照らす」先例の有無

- 事実: 結果を**別の場所で実行→報告ファイルを取り込む**形の先例は、上記の Stryker→SonarQube(jq 変換)、Stryker Dashboard(PUT)、PIT→Sonar プラグインの 3 系統。いずれも「取り込んで表示・集計」が目的で、**取り込んだ報告がその PR のコミットで実行されたかを機械で突き合わせる先例は、本調査では見つからなかった**
- 分からなかったこと
  - mutation-testing-report-schema で対象コミットを記録する慣行(欄が無いので慣行は別の層)
  - 報告の真正性(署名・証明)を扱う先例。SLSA/in-toto 等の証明に変異試験の結果を載せる先例の検索は**していない**
  - PIT `mutations.xml` の公式仕様
  - JUnit XML など試験報告の汎用形式で変異試験を扱う先例

### 登録候補

| URL | 題 | 著者/発行 | 年 | 抜き書き |
|---|---|---|---|---|
| https://github.com/stryker-mutator/mutation-testing-elements/blob/master/packages/report-schema/src/mutation-testing-report-schema.json | mutation-testing-report-schema | Stryker Mutator | 2026 取得 | required: `schemaVersion`, `thresholds`, `files`。status の列挙: Killed/Survived/NoCoverage/… |
| https://stryker-mutator.io/docs/General/dashboard/ | Stryker Dashboard | Stryker Mutator | 2026 取得 | version は "branch name, git tag or git sha" |
| https://stryker-mutator.io/docs/mutation-testing-elements/sonarqube-integration/ | SonarQube integration | Stryker Mutator | 2026 取得 | Survived/NoCoverage を汎用 issue 形式へ jq で変換、`sonar.externalIssuesReportPaths` |
| https://mutants.rs/exit-codes.html | Exit codes | cargo-mutants | 2026 取得 | "2: Found some mutants that were not covered by tests" |
| https://cosmic-ray.readthedocs.io/en/latest/reference/cli.html | Command Line Interface | Cosmic Ray | 2026 取得 | `cr-rate --fail-over`: 生存率が値を超えたら非 0 |
| https://stryker-mutator.io/docs/stryker-net/configuration/ | Stryker.NET configuration | Stryker Mutator | 2026 取得 | `since`: "test only code changes since the given target" |
| https://mutmut.readthedocs.io/en/latest/ | mutmut | mutmut | 2026 取得 | "only re-tests mutants in functions whose source changed" |

## 4. 考察(事実と分離)

- 「PR ごとの増分」を標準が要求する根拠として、時間の公開の実測は薄い。公式の言葉は一貫して「増分は速いが網羅ではない」「定期の全量実行を併用せよ」で、PR だけで全てを担保する前提を置く道具は無い(PIT は増分を実験的と書き、前提を未実証とする)
- 「コマンドが空なら失敗」は、機械で決定可能な統制(構文・存在)。ただし道具の終了コードが「合否」を意味する程度は道具ごとにばらつく: cargo-mutants は未捕捉 1 件でも 2、cosmic-ray は生存率の閾値、Stryker は break 閾値(既定 null)、PIT は mutationThreshold(既定の挙動は未確認)、mutmut は未確認、gremlins は版・経路で不安定の報告。**採用者が書いた「空でないコマンド」が合否を返す保証は、道具の側にない**(別途 manual/adopter の開示が要る)
- 「外部で実行した記録を照らすコマンド」は、スキーマ上 コミット欄が無いため、記録に結びつける欄(コミット SHA・実行時刻・対象 diff の識別子)は標準の側で定める必要がある。この点で参照できる確立した先例は本調査では見つからなかった
- 差分モードの「変異体ゼロ」(文書のみの PR・テストのみの PR)の扱いは、cargo-mutants(エラー化あり)と PIT(`failWhenNoMutations` 既定 true)で既定が異なりうる。「必須の段」が文書のみの PR で偽の失敗を生む可能性がある(推測。実行で確認すべき)

## 5. 未解決(追加調査の候補)

- 小さなチームの PR 増分の実測(自前の計測が最も確実。cargo-mutants `--in-diff`・Stryker 増分・PIT 履歴を代表リポジトリで)
- Stryker4s・Infection(PHP)・mutant(Ruby)・Mull(C/C++)の状況
- mutmut の終了コード、gremlins の現行の終了コードと JSON、PIT `mutations.xml` の仕様(いずれもソース・実行で確認)
- 変異試験の結果の証明(attestation)の先例
- Petrović ほか論文本文の費用・時間の数値
