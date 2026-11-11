# #363 外部調査: 複数言語のリポジトリにおける PR の必須検査と、検査対象外のスタックの扱い

- 調査時点: 2026-11-11(全出典の取得日も 2026-11-11)
- 審議の重さ: 重
- 論点: 準拠テンプレートの G-5 は構成あたり1アダプタ(node・python・go)。混在リポジトリで1つを選ぶと、他言語のテストが走らないまま通る。候補は (c1) 複数アダプタ (c2) 混在を止める (c3) 混在を告げて開示する
- 表記: 「事実」= 原文で確かめた内容。「示唆」= 本件への当てはめ(調査者の解釈)。原文を取得できなかったものは「未確認」と明記する

## 1. GitHub の必須チェックと「飛ばされた」検査

### SRC-A1 GitHub Docs「Troubleshooting required status checks」

- URL: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks
- 取得日: 2026-11-11
- 事実(原文の引用)
  - パスの絞り込み・ブランチの絞り込みでワークフローが起動しない場合: "Associated checks stay in a "Pending" state and block merging"。推奨: "Avoid requiring workflows that can be skipped."
  - 条件(`if:`)で飛ばされたジョブ: "The job reports "Success""
  - 失敗したジョブに依存するジョブ: "The dependent job is skipped and may not block merging"。推奨: "Use `always()` with `needs` for required checks that depend on other jobs."
  - "Successful check statuses are `success`, `skipped`, and `neutral`."
- 示唆
  - GitHub の必須チェックは、`skipped` を**成功として数える**。条件で飛ばしたジョブは緑になる。プラットフォームは「走らなかった検査」と「通った検査」を区別しない
  - 本件の欠陥(python のテストが走らずに通る)と同じ形の穴を、GitHub 自身が既知の挙動として文書化している。GitHub が示す対策は「飛ばされうるワークフローを必須にしない」「`needs` と `always()` で集約する」であり、穴を塞ぐ責任は利用者側の構成にある

### SRC-A2 GitHub Docs「Using conditions to control job execution」

- URL: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions
- 取得日: 2026-11-11
- 事実(原文の引用)
  - "A job that is skipped will report its status as "Success"."
  - "It will not prevent a pull request from merging, even if it is a required check."
- 示唆
  - 必須に指定したジョブであっても、飛ばされれば合流を止めない。「必須チェックに登録した」ことは「その検査が走った」ことを保証しない。G-5 の通過の記録が「走った検査の一覧」を持たないなら、同じ穴を持つ(解釈)

### SRC-A3 GitHub Docs「Workflow syntax for GitHub Actions」(on.<event>.paths)

- URL: https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- 取得日: 2026-11-11
- 事実(原文の引用)
  - "When using the `push` and `pull_request` events, you can configure a workflow to run based on what file paths are changed."
  - パスの絞り込みでワークフローが飛ばされた場合: "then checks associated with that workflow will remain in a "Pending" state." "A pull request that requires those checks to be successful will be blocked from merging."
- 示唆
  - ワークフロー単位の paths は「止まる側」(Pending で詰まる)へ倒れ、ジョブ単位の `if:` は「通る側」(skipped = 成功)へ倒れる。実務では、前者の詰まりを避けるためにジョブ単位の条件へ移し、その結果として走らない検査が緑になる。この移行が本件の穴の典型的な入口である(解釈)

### SRC-A4 re-actors/alls-green(集約ジョブの実務例)

- URL: https://github.com/re-actors/alls-green
- 取得日: 2026-11-11
- 事実(README の原文の引用)
  - 単一の `check` ジョブの `needs` に他の全ジョブを並べ、分岐保護にはそれ1つだけを登録する形を提案する
  - 失敗時に "the `check` job's result is set to `skipped` and not `failed` as one would expect."、文脈によっては "`skipped` is interpreted as `success`"
  - 入力 `allowed-skips` は、列挙したジョブが飛ばされた場合に結果へ影響させない(走った場合は結果に数える)
- 示唆
  - 実務では「どのジョブなら飛ばしてよいか」を**名指しで宣言**し、それ以外の飛ばしを失敗として扱う集約の型が使われている。(c3) の「開示」を、宣言した例外以外は止める形で機械化した例に当たる
  - 第三者のアクションであり、規格・公式の推奨ではない。実務の一例として扱う

## 2. 変更の範囲に応じて全スタックの検査を走らせる仕組み

### SRC-B1 Nx「affected」

- URL: https://nx.dev/docs/features/ci-features/affected
- 取得日: 2026-11-11
- 事実(原文の引用)
  - "Nx selects a task when your change touches one of its inputs, not by the task hierarchy in the task graph."
  - Nx は "Uses Git to find the files your branch changed"
  - "The default `base` is your `main` branch, and the default `head` is your current file system."(CI では main の最後の成功コミットを base にすることを推奨)
  - Nx 23 以前の旧挙動はプロジェクト単位で、変更のあったプロジェクトとそれに依存するプロジェクトの全タスクを走らせた(`affected.legacy`)
- 示唆
  - モノレポの道具は、言語ではなく「プロジェクト(またはタスク)と、その入力ファイル」の単位で検査を選ぶ。1つの PR で複数のスタックの検査が同時に走るのが前提であり、「構成あたり1言語」という形は取らない。(c1) の方向と整合する
  - 選択の正しさは、各タスクの入力の宣言に依存する。宣言から漏れたファイルは検査されない。選択型の仕組みも「何を走らせなかったか」の穴を別の形で持つ(解釈)
  - 本頁は JS 以外の言語に触れていない(多言語対応は未確認)

### SRC-B2 Pants「Advanced target selection」

- URL: https://www.pantsbuild.org/stable/docs/using-pants/advanced-target-selection
- 取得日: 2026-11-11
- 事実(原文の引用)
  - Pants "can find which files have changed since a certain commit through the `--changed-since` option." "By default, `--changed-since` will only run over files directly changed."
  - 依存元も対象にするには "Use `--changed-dependents=direct` or `--changed-dependents=transitive` for this."
  - PR では "often teams will want to run only tests affected by that particular pull request."
  - 注意: "Pants does not understand transitive third-party dependencies in this context."
- 示唆
  - 1つの `test` ゴールが、変更の影響を受けたターゲットのテストを、ターゲットの種類に応じて走らせる。言語の選択は構成の1値ではなく、ターゲットから決まる(Pants が python・go 等を扱う多言語ビルドであることは一般に知られるが、本頁では言語横断の記述を確認していない)
  - 選択型の仕組みでも、外部依存の変化を見落とす既知の限界を公式に開示している。限界の開示は (c3) の実務例になる

### SRC-B3 Turborepo「run」リファレンス

- URL: https://turborepo.dev/docs/reference/run(旧 turborepo.com から 301)
- 取得日: 2026-11-11
- 事実(原文の引用)
  - `--affected`: "Filter to only packages that are affected by changes on the current branch."
  - `--filter` の Git 範囲: "Select a range using `[<from commit>]...[<to commit>]`."
- 示唆
  - Turborepo は `package.json` を単位とする JS 生態系の道具で、本頁は JS 以外のパッケージに触れていない。python・go の検査を含めるには、package.json のスクリプトから呼ぶ等の工夫が要る(解釈・未確認)。JS 中心の道具に寄せると、他言語は「仕組みの外」に落ちやすい

### SRC-B4 Bazel「Commands and options」(user manual)

- URL: https://bazel.build/docs/user-manual
- 取得日: 2026-11-11
- 事実(原文の引用)
  - "To build and run tests with bazel, type `bazel test` followed by the name of the test targets."
  - `--test_lang_filters`: "Specifies a comma-separated list of strings referring to names of test rule classes."
  - キャッシュ: 既定の 'auto' では、入力が変わったときだけテストを再実行する("Bazel will only rerun a test if any of the" ... の節)
- 示唆
  - Bazel のテストは「規則の種類」(言語ごとの test rule)の集合として扱われ、`bazel test //...` 系の対象指定で全言語のテストを1つのコマンドで走らせる設計である。言語で**絞る**のは明示のフラグ(`--test_lang_filters`)で行う。つまり既定は全言語で、除外は宣言的に行う(解釈)
  - 本頁では `//...` の意味そのもの・多言語の公式な位置づけの原文を確かめていない(未確認)

## 3. 第三者の評価: OpenSSF Scorecard と SLSA

### SRC-C1 OpenSSF Scorecard「Checks」(CI-Tests・SAST)

- URL: https://github.com/ossf/scorecard/blob/main/docs/checks.md(本文は raw.githubusercontent.com から取得)
- 取得日: 2026-11-11
- 事実(原文の引用・要約)
  - CI-Tests: "This check tries to determine if the project runs tests before pull requests are merged." 直近約30コミットの GitHub `CheckRuns` と `Statuses` から CI の名前(appveyor・buildkite・circleci・e2e・github-actions・jenkins・mergeable・test・travis-ci・woodpecker を含む名前)を探す。成功した検査だけを数える
  - CI-Tests の是正: リポジトリの**すべての**テストを走らせるスクリプトを置き、PR ごとに CI で走らせること(要約。原文の逐語は未取得)
  - SAST: CodeQL・SonarCloud 等の既知のアプリを直近約30の合流済み PR から探すか、`github/codeql-action` の使用を探す
  - どちらも、他の道具を使う事業は低い点になりうると注記する。言語の網羅には触れない
- 示唆
  - Scorecard は「PR に何らかのテスト系の検査が付いたか」だけを見る。**言語の網羅を見ない**。node のテストだけが走る混在リポジトリでも満点になりうる。外部の評価は本件の穴を検出しない。したがって「外部の評価に頼れば足りる」は採れない根拠になる
  - 是正の文が「すべてのテスト」を求めている点は、網羅の期待が意図としては存在することを示す(要約からの解釈。逐語を確かめること)

### SRC-C2 SLSA v1.0「Requirements」(Build track)

- URL: https://slsa.dev/spec/v1.0/requirements
- 取得日: 2026-11-11
- 事実(原文の引用)
  - Build L1: "The build process MUST generate provenance that unambiguously identifies the output package by cryptographic digest"
  - Build L2: "Consumers MUST be able to validate the authenticity of the provenance attestation"、"All build steps ran using a hosted build platform on shared or dedicated infrastructure"
  - Build L3: "Provenance MUST be strongly resistant to forgery by tenants."、"The build platform ensured that the build steps ran in an isolated environment, free of unintended external influence."
  - "There are no sub-requirements on the build itself."
  - 試験・試験の網羅への要求は、本頁にない
- 示唆
  - SLSA の Build track は来歴(provenance)と構築基盤の隔離を求め、テストの有無・網羅は求めない。本件の判断の根拠には使えない。ただし来歴に「どの検査を走らせたか」を載せる考え方(検査の事実を改ざんしにくい記録に残す)は、(c3) の開示の記録の形の参考になる(解釈)

### SRC-C3 SLSA v1.0「About SLSA」(対象外の範囲)

- URL: https://slsa.dev/spec/v1.0/about
- 取得日: 2026-11-11
- 事実(原文の引用)
  - "SLSA does not tell you whether the developers writing the source code followed secure coding practices."
  - "SLSA is only one part of a thorough approach to supply chain security."
- 示唆
  - SLSA は品質の検査を明示的に対象外とする。SLSA の水準を満たすことは、混在リポジトリの全スタックが試験されたことを何も意味しない

## 4. 規格の要求

### SRC-D1 ISO/IEC/IEEE 29119-2:2021(iTeh の公開プレビュー)

- URL: https://cdn.standards.iteh.ai/samples/79428/d2457e67b9db443b9504d2ef49a8724a/ISO-IEC-IEEE-29119-2-2021.pdf(目録: https://standards.iteh.ai/catalog/standards/iso/73fff262-e1d4-40f7-8011-c733c462a3b6/iso-iec-ieee-29119-2-2021)
- 取得日: 2026-11-11
- 読めた範囲: 表紙〜4.1.2.1(p.9)。7.2(計画)・7.4(完了)の本文はプレビューの外で**未確認**
- 事実(原文の引用)
  - 3.2 completion criteria: "conditions under which the testing activities are considered complete"
  - 3.28 test coverage: "degree, expressed as a percentage, to which specified test coverage items have been exercised by a test case or test cases"
  - 3.43 test level Note 1: "It is not always necessary for a test item to be tested at all test levels"
  - 3.59 test strategy Note 1: 試験戦略は通常 "the test levels and test types to be implemented; ... the test design techniques and corresponding test completion criteria to be used" 等を記述する
  - 序文: "This document follows a risk-based approach to testing."
  - 4.1.1: "implementation of this document typically involves selecting and declaring a set of processes suitable to the organization or project." "The organization shall assert whether it is claiming full or tailored conformance to this document"
- 示唆
  - 29119-2 は「すべてを試験せよ」とは言わない。試験の範囲・完了基準を**計画(試験戦略)で決めて記述する**ことを求める、リスクベースの枠組みである。したがって、ある試験項目(python 側)を試験しないこと自体は規格違反ではない。違反になりうるのは、戦略に書かれず、決めた者もいないまま試験されないこと(解釈)
  - 適合の主張でも、選んだ範囲を**宣言する**ことを要求している(4.1.1)。宣言なき省略を許さない考え方は、(c3) の開示、または (c2) の明示の禁止と整合し、無言で通る現状とは整合しない

### SRC-D2 IEC 62304(原文は未取得。二次資料のみ)

- 試みた一次: IEC Webstore・ANSI のプレビュー PDF(https://webstore.ansi.org/preview-pages/IEC/preview_iec62304%7Bed1.1%7Den.pdf は 403。https://webstore.iec.ch/preview/info_iec62304%7bed1.0%7den_d.pdf は製品頁のみ)
- 二次資料 1: Johner Institute「Segregation from software components」 https://blog.johner-institute.com/iec-62304-medical-software/segregation-from-software-components/ (取得日 2026-11-11)
  - 記事中の 62304 の引用(5.3.5): "The MANUFACTURER shall identify any segregation between SOFTWARE ITEMS that is necessary for RISK CONTROL," "and state how to ensure that such segregation is effective."
  - 4.3 については逐語の引用はなく、言い換えのみ: 安全クラスの異なる構成要素へ分けるときは、分離の有効性を示す必要がある。著者の言: "For auditors and reviewers, the rule is that if it's not documented, it doesn't exist."
- 二次資料 2: 検索結果の要約(チェックリスト類)による 5.7 の構成: 5.7.1 ソフトウェア要求事項に対する試験の確立、5.7.2 問題解決プロセスの使用、5.7.3 変更後の再試験、5.7.4 システム試験の評価、5.7.5 記録の内容。資料間で番号が食い違っており、**原文で確かめていない**
- 示唆(すべて解釈)
  - 62304 は、構成要素ごとに要求を変えること(安全クラスの差)を許すが、その前提として**分離の根拠と有効性の文書化**を求める。言い換えると「一部を厳しく検査しない」は、文書化された分離の決定がある場合にだけ成り立つ
  - 混在リポジトリで python 側を検査しないことを、62304 の型に寄せれば「python 側を別の構成要素として識別し、検査の程度の差の根拠を記録する」になる。無言の省略は、この型にない

### SRC-D3 DO-178C(原文は有償で未取得。二次資料のみ)

- 試みた一次: FAA の DO-178B/C 差分資料(https://www.faa.gov/sites/faa.gov/files/aircraft/air_cert/design_approvals/air_software/differences_tool.pdf)と AC 20-115C(https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115C.pdf)は 403 で取得できなかった
- 二次資料: Rapita Systems の解説 https://www.rapitasystems.com/node/130 (取得日 2026-11-11。DO-178B を対象とした記事)
  - "If you don't get 100% structural coverage, it means one of four things and each requires action on your part."
  - 死んだコード: "The code that hasn't been covered is not traceable to any requirement and isn't needed by the application." → "remove the code"
  - 無効化コード(deactivated code): "isn't traceable to any requirements for the current system, but is intended to be executed in certain configurations." → "show that a configuration exists in which the code will execute"
- 検索結果の要約(未確認): DO-178C では §6.4.4.3「Structural Coverage Analysis Resolution」が網羅の不足の解消を扱う
- 示唆(解釈)
  - 航空の型では、検証で触れられなかったコードは**必ず分類し、それぞれに処置を決める**(除去する・構成を示す・試験を足す)。「触れなかったまま残す」選択肢がない。本件に当てはめると、走らなかったスタックは「除去(c2)」「走らせる(c1)」「理由つきで識別する(c3)」のいずれかへ必ず振り分けられ、無言の通過は許されない

### SRC-D4 ISO 9001:2015 8.6(原文は有償で未取得。二次資料のみ)

- 二次資料: ECESIS「Production and Service Provision」 https://www.ecesis.net/ISO-9001/Production-and-Service-Provision.aspx (取得日 2026-11-11)
  - 原文の引用(同頁): "Implement planned arrangements to verify product and service requirements have been met."
  - 同頁の要約: 計画した検証が満足に完了するまでリリースしない。ただし関係する権限者と顧客が承認した場合を除く。適合の証拠と、リリースを承認した者への追跡可能性を記録として残す
- 注意: 検索で目にした "shall not proceed until the planned arrangements have been satisfactorily completed" の言い回しは ISO 13485 8.2.6 の文言に近いという指摘があった。9001 の逐語は**未確認**
- 示唆(解釈)
  - 8.6 の型は「計画した検証の完了」をリリースの条件とし、計画どおりでない場合は**権限者の承認とその記録**で例外を通す。G-5 を「計画した検証」と見るなら、python 側の未検査は計画からの逸脱であり、例外の承認者と記録が要る。(c3) を採る場合も、告げるだけでなく「誰が受け入れたか」の記録までを含めないと 8.6 の型と合わない

## 5. 考察(調査者の解釈。事実ではない)

- 共通の型
  - プラットフォーム(GitHub)は「走らなかった検査」を成功と区別しない(SRC-A1・A2)。外部の評価(Scorecard)は言語の網羅を見ない(SRC-C1)。サプライチェーンの枠組み(SLSA)は試験を対象外とする(SRC-C2・C3)。つまり、この穴を塞ぐ層は**利用者側のプロセスの中にしかない**
  - 規格(29119-2・62304・DO-178C・9001)はどれも「全部を試験せよ」とは言わない。共通するのは「試験しない部分を**識別し、理由を決め、記録し、権限者が受け入れる**」ことである。無言の省略を許す規格は見つからなかった
- 候補との対応
  - (c1) 複数アダプタ: 実務の道具(Nx・Pants・Bazel)はいずれも1つの PR で複数スタックの検査を走らせる前提で設計されている。実務との整合はもっとも高い。ただし選択型の仕組みにも「入力の宣言から漏れたものは走らない」穴があり、(c1) 単独では「走らなかったものの開示」を不要にしない
  - (c2) 混在を止める: DO-178C の「除去」に近い。ただし実務のモノレポが多言語を当然とする以上、準拠テンプレートの採用者の範囲を狭める。止める場合も、止めたことを検出する仕組みが要る
  - (c3) 告げて開示する: 29119-2 の宣言、62304 の分離の文書化、9001 の例外の承認、alls-green の `allowed-skips` に近い。ただし規格の型は「告げる」で終わらず、**誰が受け入れたかの記録**を伴う。開示だけで承認の記録がない形は、規格の型の半分にとどまる
  - 組み合わせ: 外部の型を素直に読むと、(c1) で走らせられるものは走らせ、走らせないものは (c3) の宣言と承認の記録で通し、宣言のない未検査は止める、という組み合わせが最も多くの出典と整合する。採否は会議体の判断に委ねる
- 日本の現場の実態: 本調査では、混在リポジトリの検査の省略に関する日本語の一次・事例資料を見つけていない(穴として残す)

## 6. 埋められなかった穴(追加調査が必要)

- 29119-2 の 7.2(試験戦略と計画)・7.4(試験完了)の本文。試験しない項目の記録(29119-3 の試験計画の「範囲・除外」)の逐語
- IEC 62304 4.3・5.7 の逐語(IEC 62304:2006+AMD1:2015)。JIS T 2304 の対応箇所
- DO-178C §6.4.4.3 の逐語、および FAA 資料(403 で取得不可)
- ISO 9001:2015 8.6(JIS Q 9001 8.6)の逐語
- Scorecard の CI-Tests の是正文の逐語と、採点の算式(PR あたりの割合か)
- Bazel の `//...` と多言語の公式な記述、Turborepo の非 JS パッケージの扱い
- 日本企業の実態(建前と運用の乖離)を示す資料
