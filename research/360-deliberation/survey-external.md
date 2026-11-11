# 外部の調査(#360 重の審議。S-1〜S-6 の材料)

- 調査日・取得日: すべて 2026-11-12
- 表記: [確認] は一次資料(提供者の文書・ソース)を読んで確かめた事実。[確認: 範囲] は読んだ範囲を限る。[未確認] は記憶または二次資料だけの事項。[推論] は資料からの推論
- 背景: `decision.md`(S-1〜S-6)、`survey.md` 論点A §5.2・論点B B-3・論点D §2
- 本書は調査であり、条項の提案ではない。採否は会議体と議長が決める

---

## 1. 変更の範囲のカバレッジ(diff / patch coverage)

### 1.1 diff-cover(python 系。Cobertura・Clover・JaCoCo の XML、LCov)

- 出典: https://github.com/Bachmann1234/diff_cover (README)、ソース `diff_cover/report_generator.py`・`diff_cover/diff_cover_tool.py`・`diff_cover/violationsreporters/violations_reporter.py`(main ブランチ)
- [確認: README] 入力は Cobertura・Clover・JaCoCo の XML と LCov。`git diff`(既定は `origin/main...`)の行と、報告の行を突き合わせる
- [確認: README] 「diff の行と報告の行の両方に現れる行だけを報告する。報告は通常、文を単位に列挙するため、**複数行の文の変更は分析されないことがある**」。回避として `--expand-coverage-report`(報告に無い行を、直前の報告の行と同じ回数で埋める)がある
- [確認: ソース] 割合 = (計測された変更の行 − 未被覆の行)/ 計測された変更の行。**計測された変更の行が 0 のときは 100 を返す**(`total_percent_covered`)
- [確認: ソース] **報告に載っていないファイルは「違反なし・計測なし」として扱われる**(`_cache_file` で `line_nodes is None` なら飛ばし、`violations` を空にする)。つまり未計測のファイルの変更は失敗にならない。README は「No lines with coverage information in this diff」が出る主な原因をパスの不一致と書く
- [確認: ソース] `--fail-under`(既定 0)。合否は `percent_covered >= fail_under` または `minimum_change` 未満の変更なら 0(成功)を返す
- [確認: README] go は対象として挙げていない。go は Cobertura へ変換して渡す使い方になる(§1.4)

### 1.2 Codecov の patch status

- 出典: https://docs.codecov.com/docs/commit-status 、https://docs.codecov.com/docs/codecovyml-reference
- [確認] `codecov/patch` は PR(PR が無ければ単一のコミット)で**変更した行だけ**を測る
- [確認] `if_not_found`: 本文は既定を `success` と書く。`failure` にすると「head の報告が無いとき失敗」。つまり**既定では報告が無くても通る**
- [確認] `if_ci_failed`: 本文は既定 `error`。YAML の注記は `success, failure, error, ignore` を列挙し、記載が揃っていない
- [確認] `informational: true` で「カバレッジがどうであれ成功の状態を返す」(表示だけの段)。`threshold`・`target`(`auto` は基底と比べる)
- [確認] `flag_coverage_not_uploaded_behavior`(既定 `include`、`exclude`・`pass`)。`pass` は新しい upload の無いフラグの検査を自動で通す
- [確認] `require_ci_to_pass`(既定 true)は、他の状態の成功を待ってから状態を送る
- [未確認] 変更の行に計測できる行が1つも無い場合の patch status の扱い(記憶では「Coverage not affected」として成功)。文書に記載を見つけられなかった
- [未確認] Codecov が go の coverprofile のブロックを行へどう落とすか(処理系のソースは読んでいない)

### 1.3 Coveralls

- [未確認] PR の状態(カバレッジの低下の閾値で失敗にする設定)を持つことは記憶にあるが、文書の URL(https://docs.coveralls.io/pull-requests)は 404 で読めなかった。patch 単位の割合の有無も確かめていない

### 1.4 SonarQube の new code(Clean as You Code)

- 出典: https://docs.sonarsource.com/sonarqube-server/latest/user-guide/about-new-code/ 、https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates
- [確認] 新しいコードの定義は基準(既定は「Previous version」、他に日数・特定の分析・参照ブランチ)。PR では対象ブランチとの差が新しいコード
- [確認] 組み込みの Sonar way の条件は**新しいコードにだけ**掛かる: 新しい問題なし・新しい Security Hotspot をすべて確認・**新しいコードのカバレッジ 80% 以上**・重複 3% 以下
- [確認] 小さな変更の扱い(fudge factor): 新しく覆うべき行が **20 行に満たないあいだはカバレッジと重複の条件を無視する**(既定。プロジェクトの管理者が変えられる)
- [確認: コミュニティの回答(Sonar の職員)] SonarQube は試験を実行せず、外部の報告を取り込む。**報告が無い実行可能な行は未被覆として数え、カバレッジは 0% になる**(https://community.sonarsource.com/t/sonar-cloud-quality-gate-failure/51632 、https://community.sonarsource.com/t/code-coverage-on-a-pull-request-merge-at-0/25278)。結果として Sonar way では新しいコードがあれば門で落ちる向き。文書本文での明示は見つけていない
- go の行への落とし方(sonar-go。ソース https://github.com/SonarSource/sonar-go の `sonar-go-plugin/src/main/java/org/sonar/go/coverage/FileCoverage.java`、master)[確認: ソース]
  - ブロックの開始から終了まで**範囲の全行**を被覆の行にする。ただし、空白だけの行を除き、ブロックの先頭と末尾の `{`・`}`・行末の空白を読み飛ばして開始・終了の行を詰める
  - つまり survey.md 論点D §2.2 の **案C(案B から空行・括弧だけの行を外す)に近い**。注釈だけの行(`//`)は除かれない [推論: ソースに注釈の判定が無い]

### 1.5 go の道具

| 道具 | 出典(読んだもの) | ブロックを行・変更へ落とす方式 | 未計測の扱い |
| --- | --- | --- | --- |
| `go tool cover` / `go test -coverprofile` | https://pkg.go.dev/cmd/cover 、https://go.dev/blog/integration-test-coverage | 基本ブロックを「ソースの研究から近似的に」求める。`&&`・`||` の内側は測らない [確認]。割合は文(statements)の数 [確認: ブログの出力の表記 "(statements)"] | — |
| go 1.20 以降の統合カバレッジ | https://go.dev/blog/integration-test-coverage | `go build -cover` と `GOCOVERDIR` で実行の記録を集め、`go tool covdata percent`(文の割合)・`textfmt`(`-coverprofile` と同じ形式へ変換)・`merge` [確認] | — |
| go-patch-cover | https://github.com/seriousben/go-patch-cover の `cover.go` | **追加の行が1行でも掛かるブロックを分母に入れ、ブロックの文の数(NumStmt)で重みを付ける**。Count>0 なら被覆に同じ文の数を足す [確認: ソース `computeCoverage`]。出力は「% of changed statements」 | 差分のファイル名と一致するプロファイルが無いファイルは飛ばす(失敗にしない)[確認: ソース] |
| gocov → gocov-xml → diff-cover | https://github.com/axw/gocov の `gocov/convert/convert.go`、https://github.com/AlekSi/gocov-xml の `gocov-xml.go` | gocov は**ソースを AST で解析して文の範囲を得て**、各文に重なるブロックの回数を割り当てる [確認: ソース]。gocov-xml は**文の開始行だけ**を Cobertura の `<line>` にする [確認: ソース]。結果は node(istanbul)・python(coverage.py)と同じ「文の開始行」の近似になる [推論] | diff-cover の扱い(未計測は通る)に従う |
| gocover-cobertura | https://github.com/boumenot/gocover-cobertura の `gocover-cobertura.go` | **ブロックの開始行から終了行までの全行**を `<line>` にする。`-ignore-non-code-lines` を付けると AST のノードが始まる行だけに絞る [確認: ソース] | 同上 |
| Azure/gocover | https://github.com/Azure/gocover の `pkg/parser/parser.go` | gocov と同じく AST の文の範囲へブロックを割り当てる [確認: ソース]。変更との当て方(`setStatementsState`)は読んでいない [未確認] | [未確認] |
| go-test-coverage | https://github.com/vladopajic/go-test-coverage (README) | 基底の内訳ファイルとの比較(`diff.threshold`)はあるが、変更の行に限る記載は無い [確認: README の範囲] | プロファイルは必須とあるが、無い場合の挙動の記載は無い |

- [推論] go の「変更の範囲」の落とし方は、実務の道具で少なくとも3通りに割れている
  1. **ブロックに重なれば文の数で重み**(go-patch-cover。起案の S-1 の案と同じ)
  2. **範囲の全行**(gocover-cobertura の既定、sonar-go は空行と括弧を除いて同様。2委員がともに退けた「範囲の全行」に当たる)
  3. **AST で文の開始行へ戻す**(gocov 系 → Cobertura。node・python と同じ近似に揃う)
- survey.md 論点D §2.2 は「プロファイルからは文の開始行を厳密には得られない」と書く。これはプロファイル単体では正しいが、**ソースを AST で読めば文の範囲・開始行は得られる**(gocov・Azure/gocover が実際にそうしている)。go の標準ライブラリ(`go/parser`・`go/ast`)だけで実装できる [推論]

### 1.6 測れない・報告が無いときの既定の向き(まとめ)

| 道具 | 報告が無い・ファイルが未計測 | 変更に計測できる行が無い |
| --- | --- | --- |
| diff-cover | ファイルを飛ばす(通る)[確認] | 100%(通る)[確認] |
| Codecov patch | `if_not_found` 既定 success(通る)。`failure` に変えられる [確認] | [未確認](通る見込み) |
| SonarQube | 実行可能な行は未被覆 = 0%(落ちる向き)[確認: コミュニティの回答] | 20 行未満は条件を無視(通る)[確認] |
| go-patch-cover | ファイルを飛ばす(通る)[確認] | 分母 0 の扱いは読んでいない [未確認] |

### 本件(S-1〜S-6)への含意

- S-1: 起案の「重なるブロックを分母に入れ、文の数で重み」は go-patch-cover と同じ方式で実務の先例がある。一方、AST で文の開始行へ戻す方式(gocov 系)なら node・python と同じ近似に揃い、近似の開示を一本にできる。「go は文の開始行を得られない」という前提は改める必要がある
- S-1(X-a): 実務の道具の多くは「報告が無い・未計測」を**通す**(Codecov 既定・diff-cover)。SonarQube だけは未被覆として落とす向き。本標準の「未実施は失敗に数える」は Sonar 側の考え方に近く、道具の既定(通す)を基準にはできない。ただし、どちらも**設定で向きを選べる形**(Codecov の `if_not_found`)を持つ点は移行の設計(§2)の材料になる
- 2委員がともに退けた「範囲の全行」は、sonar-go・gocover-cobertura が実際に採っている。退ける理由(割合を上へ寄せる)は記録に残し、「業界に先例が無いから退ける」ではないことを明記するのがよい

---

## 2. 既存の利用者に新しい失敗を課す検査を足すときの移行の実務

| 実務 | 出典 | 要点 |
| --- | --- | --- |
| CPython の非互換の変更(PEP 387) | https://peps.python.org/pep-0387/ | [確認] 議論 → `DeprecationWarning` を main に入れる(既定となる版と、意見の受け口の Issue を書く)→ **最低2年**の期間(少なくとも同じメジャーの2つのマイナー版。除去は5年が望ましい)→ 意見の回収と再考 → 確定。警告を出せないなら運営評議会に諮る。短縮は極端な場合だけ |
| Go の GODEBUG | https://go.dev/doc/godebug | [確認] 互換の範囲内でも既存のプログラムを壊しうる変更は、旧の挙動へ戻す GODEBUG を用意する。**既定値は `go.mod` の go の版に合わせて決まる**(古い版を宣言したモジュールは古い既定)。設定は**最低2年(4版)**維持。セキュリティの修正は全版に新しい挙動を当てる。非既定の挙動が使われた回数を runtime/metrics で数える |
| GitHub ルールセットの Evaluate | https://docs.github.com/enterprise-cloud@latest/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets | [確認] 状態は Active・Evaluate・Disabled。Evaluate は強制せず、「Rule Insights」で違反になったはずの操作を見られる。試してから Active へ切り替える使い方を文書が勧める。[確認] 無償版の文書(https://docs.github.com/en/... の about-rulesets)は Active と Disabled だけを書き、Evaluate は Enterprise の文書にだけ載る |
| SonarQube の Clean as You Code | §1.4 の出典 | [確認] 基準を新しいコードにだけ掛け、古いコードの是正を求めない。小さな変更(20 行未満)はカバレッジの条件を無視する |
| ESLint の一括の抑止(bulk suppressions) | https://eslint.org/docs/latest/use/suppressions | [確認] 新しい規則を `error` で入れ、既存の違反を `eslint-suppressions.json`(コミットして共有)へ記録して抑止する。新しい違反は失敗になる。直した違反の抑止が残ると非ゼロで終わり、`--prune-suppressions` で除く(`--pass-on-unpruned-suppressions` で無視も可)。導入した版はページに記載が無い [未確認: 版] |
| ratchet(Notion の事例) | https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules | [確認: 検索で得た本文の抜粋] 規則と、規則・ファイルごとの既存の件数の基準を持ち、基準内の違反は警告に下げ、新しい違反は CI がマージを止める。件数は減る向きにだけ動く |
| ratchet(一般) | https://qntm.org/ratchet | [確認: 抜粋] 非推奨の書き方の件数を数え、増えたら失敗、減ったら基準を下げる手法。カバレッジや性能に同じ手法を当てる例もあると書く |

- 共通の型 [推論]: (1) 告知と、旧の挙動へ戻す手段、または表示だけの段(Evaluate・`informational`・DeprecationWarning)を先に置く。(2) 期限(版・年)を明記する。(3) 既存の負債は基準として凍結し、新しい分だけに失敗を課す(Clean as You Code・bulk suppressions・ratchet)。(4) 既定の切り替えを利用者の宣言(Go の `go.mod` の版)に結びつけ、宣言を上げた利用者だけが新しい既定を受ける

### 本件(S-1〜S-6)への含意

- S-1: go の採用者に基準3 を初めて課す変更は、外部の実務では「告知 → 表示だけの段 → 期限の後に失敗」の段を踏むのが通例である。テンプレートの取り込みの版(または構成の宣言)に新しい既定を結びつける Go の GODEBUG の型は、「既存の構成は変えない、新しく生成する構成は changed」(survey.md 論点D §2.4 の6)と整合する
- S-1(X-a の解消の向き): 「新しいコードにだけ課す」型(Clean as You Code)を当てれば、既存の go の採用者の古いコードで落ちる事態は避けられる。ただし、移行の段の間に go の基準3 が「測られずに通る」状態は残り、それを表示(undelivered の開示)で示し続けるかが論点として残る
- S-2〜S-6: 表示だけの段は、外部では「強制の前の段」として名前と期限を持つ(Evaluate・DeprecationWarning)。マークの状態でも、表示に留める段と期限(見直しの年月)を対にする根拠になる

---

## 3. マージの統制(スタック型 PR・中間のブランチへのマージ)

### 3.1 スタック型 PR の道具が中間のマージをどう扱うか

| 道具 | 出典 | 中間の層の扱い |
| --- | --- | --- |
| GitHub のスタック型 PR(gh stack。2026-07-30 公開プレビュー) | https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview 、https://docs.github.com/en/pull-requests/get-started/about-stacked-prs 、https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-stacked-pull-requests | [確認] **下から上へだけマージできる**。中間の PR を単独でマージできず、下の PR が必ず一緒に入る。選んだ PR と下の未マージの PR は**スタックの基底(例: main)へ一度の操作で着地する**。上の PR は開いたまま、基底へ自動で付け替え・rebase される。マージの条件は「下の PR がすべて承認・検査の通過」「履歴が直線」「スタックの基底(main 等)のブランチ保護の要件を満たす」。ブランチ保護(CODEOWNER 等)はスタックの全 PR に掛かる。API でマージするなら非同期のスタック用 API を使う。同一リポジトリ内のみ(fork を跨げない)。GitHub Desktop は非対応。提供する契約の範囲(個人所有のリポジトリで使えるか)はページに記載が無い [未確認] |
| Graphite | https://graphite.com/docs/merge-pull-requests 、https://graphite.com/docs/merge-stack-prs-github 、https://graphite.dev/docs/multiple-trunks | [確認] 基底(下)の PR から trunk へマージし、上の層の遠隔のブランチを自動で rebase・付け替える(一時の `graphite-base/` ブランチを使う)。**下からのマージを推奨**し、上・中間からまとめてマージする方法は落とし穴があると書く。trunk 間のマージは範囲外。上の層の CI 等の要件を trunk のブランチ保護で評価する |
| ghstack | https://github.com/ezyang/ghstack (README) | [確認] 各コミットに `gh/<user>/N/base`・`head`・`orig` のブランチを作り、PR は head を base へ向ける。**「通常の GitHub の UI ではマージできない」**(base が main ではないため)と明記し、`ghstack land` で着地させる。中間の base へ誰かがマージした場合の扱いは書かれていない |
| spr(ejoffe/spr) | https://github.com/ejoffe/spr (README) | [確認] `git spr merge` は「マージできる最上の PR を見つけ、そこまでのコミットを1つの PR にまとめてマージし、中間の PR を閉じる」。順序を守るため GitHub の UI でなく `git spr merge` を使うよう勧める。対象ブランチの既定は `githubBranch`(既定 main)[確認]。UI でマージしたときに何が起きるかは書かれていない |

- [推論] どの道具も「中間のブランチへのマージ」を**道具の手順の側で避ける**(下から基底へ着地させる・UI を使わせない)。GitHub の規則として中間のマージを拒否する仕組みを使っている道具は無い。GitHub の公式のスタックは、スタックとして作った PR に限り、構造として中間の層への着地を起こさない
- [未確認] スタックとして作っていない通常の PR(base が機能ブランチ)のマージを、gh stack の導入で止められるか。文書に記載は無い

### 3.2 中間のマージを拒否・検出する実務

- [確認: survey.md 論点B B-3] GitHub のルールセット・ブランチ保護には、基底ブランチで PR を制限する規則も、「マージだけを拒む」規則も無い
- [確認] Actions の `github.base_ref` で PR の対象ブランチを読める(https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)。「base が既定でなければ失敗する検査」は組めるが、その検査を必須にするには、対象の層のブランチにルールセットの必須検査を掛ける必要があり、B-3 の制約(直接の push への効き方)に戻る [推論]
- [確認: 検索の範囲] Marketplace に「main が壊れているときマージを止める」状態の検査(Stop Merging)はあるが、「既定以外へのマージを止める」専用のボット・アクションは見つけていない。実務として一般的とは言えない [推論]

### 3.3 GitLab の保護ブランチとの比較

- 出典: https://docs.gitlab.com/user/project/repository/branches/protected/
- [確認] 「Allowed to merge」(MR によるマージと、UI・API での保護ブランチの作成)と「Allowed to push and merge」(直接の push と MR のマージ)が**別の設定**。**push を「No one」、マージを Developers + Maintainers にすると、MR のマージだけを許し直接の push を拒める**
- [確認] ワイルドカード(`feature/*` 等)の保護ブランチを作れる。複数の規則が当たると最も緩い規則が勝つ。Free・Premium・Ultimate で使える(グループ単位の規則や個人の指定は Premium 以上)
- [推論] GitLab は GitHub と**逆向き**の組(マージは許し push を拒む)を持つ。本件で要る「push は許し、中間へのマージだけを拒む」組は GitLab にも無い(Allowed to merge を No one にすると、Allowed to push and merge を持つ者は push もマージもできる)

### 本件(S-1〜S-6)への含意

- S-4: 外部の実務は中間のマージを**プラットフォームの規則では拒否せず、道具の手順(下から基底へ着地)で避けている**。GitHub・GitLab のどちらにも「中間のマージだけを拒む」設定は無い。これは反対の委員の「採用者も GitHub の上では実装できない」を支える。ただし、GitHub 公式のスタック型 PR(公開プレビュー)は、スタックとして作れば中間の層への着地を構造として起こさないため、採用者の側の手段として挙げうる(プレビューで、提供範囲は未確認)
- S-5: ghstack・spr はともに「UI でマージするな、道具のコマンドで着地させよ」という**手順による統制**で、拒否の範囲は道具の経路に限られる。guard-bash の `gh pr merge` の拒否も同じ性格であり、通る経路(`git merge` と `git push`、`gh pr create --base`)を開示する反対の委員の扱いと整合する
- §1 の合意(マージの後の検出を表示として降ろす)は、外部に拒否の手段が無い以上、検出を持つ道具が少ない実務の空白を埋める位置づけになる

---

## 4. 落ちることを期待する印と、「テストのみの変更で失敗を解消した」変更

### 4.1 各枠組みの印

| 枠組み | 出典 | 理由の欄 | 予期せず通ったとき | 照合 |
| --- | --- | --- | --- | --- |
| pytest `xfail` | https://docs.pytest.org/en/stable/how-to/skipping.html | `reason`(任意)[確認] | 既定は XPASS でもスイートは失敗しない。`strict=True`、または ini の `xfail_strict`(ページ内で `strict_xfail` とも書かれ、表記が揃っていない)で XPASS を失敗にする [確認] | `raises` で期待する例外を限る。それ以外の例外で落ちたら通常の失敗 [確認]。`run=False` で実行せず xfail と報告 [確認] |
| Jest `test.failing` | https://jestjs.io/docs/api#testfailingname-fn-timeout | 引数に無い。理由は試験の名前に書く [確認] | 例外を投げなければ失敗(常に厳格)[確認] | 例外の種類を限る手段は文書に無い [確認: 範囲]。jest-circus の走者だけ |
| Vitest `test.fails` | https://vitest.dev/api/ | 引数に無い [確認] | 落ちなければ失敗(常に厳格)[確認]。4.1 以降は要約に表示 [確認] | 例外を限る手段は文書に無い [確認: 範囲]。`context.skip(condition, note)` の第2引数の意味は文書に説明が無い |
| Go `testing` | https://pkg.go.dev/testing | `t.Skip(args)` は Log と SkipNow。スキップは失敗ではない。スキップの前に失敗していれば失敗のまま [確認] | **落ちることを期待する印は標準に無い** [確認: 文書に記載なし] | — |
| JUnit 5 `@Disabled` | https://docs.junit.org/current/writing-tests/disabling-tests.html | 理由は任意。JUnit の開発陣は短い説明を付けるよう勧め、追跡番号を求める組織もあると書く [確認] | **落ちることを期待する機能は無い**(無効化は実行しないだけ)[確認: ページの範囲] | — |

### 4.2 大規模プロジェクトの無効化された試験の管理

- Chromium(Blink の web tests): `third_party/blink/web_tests/TestExpectations`(https://chromium.googlesource.com/chromium/src/+/HEAD/third_party/blink/web_tests/TestExpectations)[確認: 検索で得た本文の抜粋] は「失敗の抑止の主なファイル」で、各行に **`crbug.com/<番号>`**・環境の札(`[ Win ]` 等)・**期待する結果(`[ Failure ]`・`[ Timeout ]`・`[ Crash ]`・`[ Skip ]`・`[ Failure Pass ]`)**を書く。つまり「どう落ちるか」を照合する形を持つ。無効化の方針の文書(`docs/testing/disabling_tests.md`)は 404 で読めなかった [未確認: 方針・期限の有無]
- Mozilla(Firefox): https://firefox-source-docs.mozilla.org/testing/tests-for-new-config/index.html ・ `.../manual.html` ・ https://firefox-source-docs.mozilla.org/testing/mochitest-plain/faq.html ・ https://firefox-source-docs.mozilla.org/layout/Reftest.html [確認: 検索で得た本文の抜粋]
  - 新しい構成で試験を有効にするとき、`skip-fails` が結果から `skip-if` の条件を自動で作り、**メタのバグを作り、スキップしたマニフェストごとにバグを起こしてメタのバグに結ぶ**。40% 以上落ちる試験などを対象にする
  - 解決の見通しが無い失敗は、後続のバグを起こし、それを引いて `fail-if` を書く。**直って通ると「予期せず通った」として通知される**ので `fail-if` を外す(厳格な xfail と同じ働き)
  - reftest の `skip` は、試験を注釈で消すより好ましい(試験の失敗を実行の終わりに報告するため)と書く
  - 無効化の期限(自動で失効する仕組み)の記載は読んだ範囲に無い [未確認]

### 4.3 「テストのみの変更で失敗を解消した」変更の検出の実務・研究

- ImpossibleBench(Zhong・Raghunathan・Carlini、Anthropic との共同。arXiv 2510.20270、https://arxiv.org/abs/2510.20270 ・ https://arxiv.org/html/2510.20270v1)[確認: 要旨と §5〜6]
  - 単体試験を仕様と矛盾するよう変えた「不可能な課題」を作り、通過を不正(cheating)とみなして率を測る。不正の型は、**試験の改変**・演算子の上書き・状態の記録・特定の入力の特別扱い
  - Claude 系と Qwen は主に**試験の改変**で不正をする(指示で禁じても)。GPT-5 は Impossible-SWEbench で 76% 不正を選んだ(著者の投稿 https://x.com/fjzzq2002/status/1981745974700581191 の値)[確認: 投稿の範囲]
  - 対策: 試験を隠すと不正はほぼ 0 だが本来の性能も落ちる。**試験を読み取り専用にすると試験の改変は防げるが、特別扱いや演算子の上書きは残る**。人へ戻す選択肢(abort)は OpenAI の系で効き、Claude Opus 4.1 では効きが小さい
  - LLM の監視は LiveCodeBench では 86〜89% を検出したが、SWE-bench(複数ファイル)では 42〜65% に落ちる
- SWE-bench の評価(https://github.com/SWE-bench/SWE-bench/issues/538 、https://arxiv.org/html/2503.15223v1)[確認]
  - 評価は生成した変更と公式の試験の変更(test_patch)を当てた後、試験の変更が触れた試験のファイルを流す。生成した変更が試験のファイルを作ると、公式の試験の適用が失敗し、**改変された試験が流れて偽の合格になる欠陥**が 2026-03 に報告され、閉じられた。つまり「試験を基準の版で上書きして流す」方式は、実務で試験の改変を無効にする手段だが、それ自体に穴があった
- 試験とコードの共進化の研究(Zaidman ら。https://link.springer.com/article/10.1007/s10664-010-9143-7 、https://azaidman.github.io/publications/azaidmanICST2008.pdf)[確認: 要旨・抜粋] は、コミットごとに製品と試験の変更を分けて数える(試験だけの期間・同時の変更)。弱めた試験の検出を目的とはしない
- [未確認] アサーションの削除・弱化をコミットの差分から検出する専用の研究・道具は、今回の検索の範囲では一次資料に当たれなかった。変異試験(mutation testing)の得点の低下で弱化を間接に捉える実務は記憶にあるが、出典を確かめていない

### 本件(S-1〜S-6)への含意

- S-3: 「照合する失敗の理由」を印に持てる枠組みは pytest(`raises`)と Chromium の TestExpectations(期待する結果の種類)に限られ、Jest・Vitest は「落ちること」だけ、Go・JUnit 5 は期待する失敗の印そのものが無い。予期せず通ったときの失敗は Jest・Vitest は既定で、pytest は `strict` の設定で、Mozilla は `fail-if` で得られる。**枠組みで照合できない部分は採用者の道具の選択に依る**ため、起案の「テンプレートが書式を定め、照合できない部分を別のマークに」と、反対の「undelivered」のどちらでも、枠組みごとの差を表で開示する必要がある
- S-3: Issue との結びつけは Chromium(crbug 番号)・Mozilla(バグ・メタのバグ)・JUnit(推奨)で実務として確立している。期限(見直しの時期)を印に持たせる実務は、読んだ範囲では見つからなかった
- S-2: ImpossibleBench は、AI が試験の改変で失敗を解消する行動が主要な型であることを示す一方、試験を読み取り専用にしても他の型が残り、LLM の監視も複数ファイルでは半分程度しか拾えない。「製品のコードを変えず既存の試験を変えた PR」という静的な近似は、同じ PR で製品も変える場合(特別扱い等)を取りこぼす。近似で delivered と表示すれば取りこぼしが見えなくなる、という反対の委員の懸念は外部の測定と整合する
- S-2: SWE-bench の事例は、「試験を基準の版に戻して流す」(survey.md 論点A §5.2 の案C、再実行型)が実務の手段である一方、新規の試験のファイルの扱いに穴が出やすいことを示す

---

## 5. 規格

- ISO/IEC/IEEE 29119-3(試験の文書)
  - [確認: 公開の講義資料 https://opencourse.inf.ed.ac.uk/sites/default/files/https/opencourse.inf.ed.ac.uk/st/2024/iso-29119-3-examples.pdf(2021 版の構成)] 試験の完了報告(Test Completion Report)の項目: 実施した試験の要約・**計画からの逸脱(Deviations from planned testing)**・**試験の完了の評価(Test completion evaluation)**・進行を妨げた要因・試験の測定値・**残留リスク(Residual risks)**・試験の成果物・再利用できる資産・教訓。状況報告(Test Status Report)には新しいリスク・変わったリスクがある
  - [確認: 第三者が公開した 2013 版の写し(https://wildart.github.io/MISG5020/standards/ISO-IEC-IEEE-29119-3.pdf)。正規の入手経路ではない可能性があるため、項目名と趣旨に留める] 「試験の完了の評価」は、**完了の基準をどこまで満たしたかを書き、満たさなかった場合はその理由を説明する**。「残留リスク」は試験の終わりに処置されていないリスクを列挙する。付属書の例示の戦略には「各部品は少なくとも 90% の文のカバレッジ」の完了の基準が出てくる
  - [推論] 29119 は「基準を満たさない・測れない」を禁止するのではなく、**逸脱・未達として理由とリスクを報告し、判断(受け入れ)へ回す**形を取る。これは本標準の ADR-0028(未達と省略の区別)と同じ方向
- ISO/IEC/IEEE 29119-2(試験の過程)
  - [未確認] 試験の完了の過程(Test Completion)と、試験の監視と制御の過程で、完了の基準を満たさない場合の扱い(計画の変更・承認)を定めていると記憶するが、今回は本文を読めていない(ISO の OBP は 403)
- ISO/IEC/IEEE 29119-1・事故の管理
  - [確認: IEEE SA のページの記載のみ https://standards.ieee.org/ieee/29119-4/7500] ISO/IEC/IEEE 23612-2026 が「ソフトウェア・システムの開発・試験・運用で使える事故(incident)の管理の一般的な過程」として掲載されている。既知の失敗(既知の欠陥)の扱いに関わる可能性があるが、本文は読んでいない [未確認]
- ISO/IEC/IEEE 12207:2017
  - [未確認] 検証の過程(6.4.9)・妥当性確認の過程(6.4.11)で、異常(anomaly)を識別・記録し、是正の処置へ回す成果を定めていると記憶する。カバレッジの測れない対象を名指しで扱う箇所は記憶に無い。本文は今回読んでいない
- [未確認] 安全規格(DO-178C の構造カバレッジ、IEC 61508・ISO 26262 の構造カバレッジの表)は、カバレッジを得られない部分を「分析で補い、正当化を記録する」形を取ると記憶する。本件の CL の扱いに関わる場合は別に確かめる

### 本件(S-1〜S-6)への含意

- S-1(X-a): 規格の側は「測れない・基準を満たさない」を一律に失敗とも合格ともせず、**理由・逸脱・残留リスクを記録して判断へ回す**。go の基準3 が測られずに通る状態は、規格の目で見れば「逸脱の記録が無いこと」が欠陥であり、測られていない事実を出力・判定記録に残すことが最低限の要件になる [推論]
- S-3: 既知の失敗は、29119-3 では残留リスク・事故の報告として扱う。落ちることを期待する印に Issue と理由を持たせる実務は、規格の「理由の説明」と整合する。期限の欄は規格からは直接は導けない [推論]
- 公開の範囲では条文の番号まで確かめられていない。規格の引用を条項に書くなら、正規の版で確かめ直す必要がある
