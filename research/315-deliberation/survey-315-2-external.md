# #315 外部調査 2: 既存リポジトリへの導入・実プラットフォームでの検証・旧い版の構成の移行

- 調査日(参照日): 2026-10-24(全出典共通)
- 調査者: サブエージェント(WebSearch / WebFetch / 公式文書の生テキストの取得)。**人の確認は未了**
- 読みの水準: 規格類は**プレビュー・目録だけ**(本文は未読)。ツール類は公式文書を直接読んだ。WebFetch は要約モデルを経由するため、引用は原文で確かめていない箇所がある(「要約経由」と注記)
- 既存の出典台帳と重なるもの: SRC-0343(About rulesets)、SRC-0344(rule insights)、SRC-0350(Claude Code memory)、SRC-0416(SLSA source)、SRC-0491(12207:2026)、SRC-0573(required status checks)、SRC-0574(Scorecard checks)、SRC-0642(12207:2017)、SRC-0212 / SRC-0352(Codex の AGENTS.md)。新規の候補は末尾に SRC-0650 以降として並べる

## 0. 要約

1. **規格は「既存の環境への持ち込み」を手順として書いていない**。12207 は適用の2つの様態(組織・プロジェクト)とテーラリング(附属書A、規定)を持つが、導入の移行手順は無い。2026 年の第2版は旧版との対応の附属書を持たない(2017 年版は 2008 年版との対応を附属書I に置いていた)。移行の手順は、規格ではなく**採用者側の改善の手順**(CMMI Adoption Guidance、ISO/IEC 33000 系)に置かれている
2. **既存の実務を写してから差を取る**のが、CMMI の導入手引きの一貫した順序である。「存在するか」だけでなく「使われているか」を確かめよと書く
3. **テンプレートの道具は「生成時の版と回答」を記録するファイル**(`.copier-answers.yml` の `_commit`、`.cruft.json` の commit)を持ち、それを手で書き換えることを禁じる。既存のプロジェクトへ後から結び付ける手段は cruft の `link` だけが明示的に持つ。GitHub のテンプレートリポジトリは単一コミット・無関係な履歴で始まり、上流との結び付きを持たない
4. **構成の版の移行**は3型に分かれる: (a) 内部で読み替えて旧い構成を動かし続ける(Renovate)、(b) 版を跨ぐ移行スクリプトを宣言して更新時に走らせる(Copier `_migrations`、Terraform の state upgrader)、(c) 廃止の猶予期間を定め、往復変換を保証する(Kubernetes)。いずれも**移行は PR として人に見せる**か、**機械が直接の変換を保証する**
5. **実プラットフォームでの検証**では、設定の宣言と実際の状態が一致しない事例が一次資料に多い: 権限不足でルールの一部が読めない(Scorecard、terraform の bypass_actors)、スキップされた必須チェックが永久に待ち状態になる、CODEOWNERS の不正な行は黙って飛ばされる。**ルールセットの Evaluate は GitHub Enterprise Cloud の文書にだけ載る**(無料の文書の作成手順には Active / Disabled しか無い)
6. **履歴の連続性**: SLSA Source v1.2 は、技術的統制の主張は「特定の開始リビジョンから連続して」でなければならず、それより前のリビジョンには**主張をしない**と定める。持ち込み前の履歴を準拠の証跡に数えない根拠になる

## 1. 規格: 既存のプロジェクトへのテーラリングと移行

| # | 出典 | 言っていること | 含意 |
| --- | --- | --- | --- |
| S1 | ISO/IEC/IEEE 12207:2017 プレビュー(VDE、IEC 版)https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed1.0%7Den.pdf(SRC-0642 と同一文書の別プレビュー) | 序論で2つの適用様態を置く。組織の様態は「宣言され確立された環境の適合を評価する」、プロジェクトの様態は「宣言され確立された環境へのプロジェクトの適合を評価する」。1.2「附属書A はテーラリングの規定の指示を与える」。1.3 附属書I が 2008 年版との対応を与える。まえがきの目的に「後方互換を許しつつ調和した規格へ移行できるようにする」。箇条4(完全適合・テーラリングした適合)と附属書A の本文はプレビューに無い(要約経由) | 規格は「既存の環境」を**評価の対象**として扱い、導入の手順は書かない。旧版との対応表を置く形が前例としてある |
| S2 | ISO/IEC/IEEE 12207:2026 プレビュー(SRC-0491) | 5.3.2「組織とプロジェクトの水準での採用」、5.5.5「テーラリング」、附属書A(規定)「テーラリングプロセス」は見出しだけ。附属書は A〜E で**旧版との対応の附属書は無い**。「第2版は第1版を取り消し置き換える(技術的に改訂)」(要約経由) | 採用の節が見出しとして独立した。旧版からの移行の対応表は廃された。**移行の対応を規格の本体に置かない**選択が、上位規格の最新版の形である(本文未読のため推定。EV マーク要) |
| S3 | ISO/IEC 33001:2015(iso.org)https://www.iso.org/standard/54175.html / ISO/IEC 33000 family(JTC1/SC7)https://committee.iso.org/sites/jtc1sc7/home/projects/flagship-standards/isoiec-33000-family.html | 33001 は第1版 2015-03、2026-01-08 に確認(現行)。33000 系は 15504 を改訂し、プロセスの質特性(能力等)と組織の成熟度の評価の枠組みを与える。結果は改善・ベンチマーク・適用のリスクの特定に使う | 既存の実務の**評価**は独立した規格群の役割。導入前の現状把握を「評価」と呼ぶなら 33000 系の語彙と衝突しない用語を選ぶ必要がある |
| S4 | CMMI Adoption Guidance v4.0(CMMI Institute、2026-07-07)https://www.cmmiinstitute.com/getattachment/3cc3e8d1-72a1-4f6d-b1da-c5df8c9ad87d/CMMI-Adoption-Guidance.pdf | 手順3: 現行の業務プロセスを CMMI の実践へ写し、差を特定する(公式・非公式いずれも可)。既存の認証があればクロスウォークで写しを速められる。「よく作られたプロセスも使われなければ価値は小さい」— 使われ、継続し、習慣化しているかを確かめる。手順4: 差を業務価値で優先付けした行動計画へ。「プロセスは行われている通りに記録する」。手順5: 段階的に展開し、パイロットで拡張できるかを確かめる。部分ごとに異なる時期に展開してよい。手順6: 内部評価、または Benchmark Appraisal で正式な認定(要約経由) | **現状の写し → 差 → 優先付け → 段階的展開 → 確認**が業界の導入手順の型。「存在」と「使用」を分けて確かめる点は、本標準の「未達と省略の区別」(ADR-0028)と同じ向き |
| S5 | IPA SEC BOOKS「共通フレーム2013」(2013-03-04)https://www.ipa.go.jp/publish/secbooks20130304.html | 目次に「第4部 プロセス解説及び適用とテーラリング(修整)」。図表の注記で、時間軸へのマッピングは一例であり特定の工程と作業の対応を推奨しない、と書く。導入の手順の記述は頁に無い(要約経由) | 国内の参照枠もテーラリングを「修整」として持つが、既存組織への持ち込み手順は書いていない。本文(書籍)未読 |
| S6 | IPA「国際規格SLCPの進化とそのポイント」(公開 2025-09-30、更新 2026-09-11)https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html | 共通フレーム2013 は ISO/IEC 12207:2008(JIS X 0160:2012)を含み、国内で必要なプロセスを追加したもの、とだけ書く | 国内でも 12207 第2版への追随の解説が進行中。移行手順の記述は見当たらない |
| S7 | SWEBOK v4.0a(IEEE Computer Society)https://www.computer.org/education/bodies-of-knowledge/software-engineering / v3 系の第8章(swebokwiki)https://swebokwiki.org/Chapter_8:_Software_Engineering_Process | v4.0 は 2024、2025-09-25 に v4.0a へ小改訂。第10章が「Software Engineering Process」。v3 系の第8章は、プロセスの基盤(定義・解釈の方針・道具・教育)、PDCA の「Do」を「改善の導入(変更管理と教育を含む)」とし、成功要因に「パイロットと道具の試行」を挙げる。v4 の本文は未読 | 導入は**変更管理と教育を伴う改善**として扱われる。パイロットは成功要因の1つに過ぎず、手順としては書かれていない |

**規格の側の結論**: 既存の環境への持ち込みを、規格の本体の手順として定めた例は見つからなかった。規格は「適合の主張の型(完全・テーラリング)」と「テーラリングの過程」を規定し、**持ち込みの具体手順は採用者側の改善計画**(CMMI の手引き、33000 系の評価)に委ねている。

## 2. 業界の実務: テンプレートの持ち込みと追従

| # | 出典 | 言っていること | 含意 |
| --- | --- | --- | --- |
| T1 | Copier「Updating a project」https://copier.readthedocs.io/en/stable/updating/ | 更新の前提は3つ: 有効な `.copier-answers.yml`、テンプレートが Git のタグで版付け(PEP 440 で比較し最新を取る)、生成先が Git 管理で `git status` が清浄。更新は「現行版で新規生成 → 差分 → 事前移行 → 最新の変更の適用 → 先の差分の再適用 → 事後移行」。衝突は `inline`(既定、衝突マーカー)か `rej`。「`.copier-answers.yml` を手で更新してはならない」— 異なる回答で生成されたと誤認し、差分が予測不能になる。`copier recopy` は初回適用として再生成(局所の変更を上書き) | 回答ファイル=**生成時の版と入力の記録**を手で書かないという規則は、本テンプレートの「`process.config.json` を手で編集しない」と同型。更新の前提に**作業木の清浄**を課す |
| T2 | Copier「Configuring a template」https://copier.readthedocs.io/en/stable/configuring/ | `_migrations` は `version` を持つ項目の列。「新しい版 >= 宣言した版 > 古い版」のときだけ走る。`before` / `after` の段階、`$VERSION_FROM` / `$VERSION_TO` を渡す。初回の複製では走らない。`_min_copier_version` 未満の道具では生成・更新を中止しエラーを出す。`_commit` は回答ファイルへ自動で記録される | **版を跨ぐ移行を宣言的に列挙**し、跨いだ版の移行だけを走らせる。道具側の最低版を構成が宣言できる |
| T3 | cruft 2.14.0(PyPI)https://pypi.org/project/cruft/2.14.0/ | `.cruft.json` にテンプレートの URL・生成元のコミット・パラメータを記録。`cruft check` は遅れていれば終了コード1で CI 向け(「意図しない乖離を防ぐ」)。`cruft link TEMPLATE` で、Cookiecutter で直接作った**既存のプロジェクトを後からテンプレートへ結び付ける**(結び付けるコミットを選べる、既定は最新)。`diff --exit-code`。`skip` で更新対象から外すファイルを glob で指定 | 既存プロジェクトへの**後付けの結び付け**を明示の操作として持つ唯一の例。結び付けの時点のコミットを記録する。除外の一覧を構成の側に持つ |
| T4 | GitHub Docs「Creating a repository from a template」https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template | テンプレートから作ったリポジトリは単一コミットで始まる(フォークは全履歴を持つ)。テンプレートからのブランチは無関係な履歴を持ち、PR もマージもできない。上流との結び付きの記述は無い。設定・ルールセットの複製の記述も無い | GitHub のテンプレート機能は**一回限りの複製**。更新の追従も、ブランチ保護・ルールセットの持ち込みも、テンプレート機能の外で行う必要がある |
| T5 | Backstage「Software Templates」https://backstage.io/docs/features/software-templates/ | 各実行は固有 ID の独立したタスク。再実行は新規の実行。既存リポジトリへの適用・テンプレート変更の追従の記述は無い | 社内ポータル型の雛形も**一回限り**が既定。追従は別の仕組み |
| T6 | projen README(0.103.27)https://cdn.jsdelivr.net/npm/projen@0.103.27/README.md | 「合成したファイルは手で編集してはならない(projen が強制する)」。多くは読み取り専用。CI の改竄防止検査が、合成ファイルの手での変更で失敗する。変更は `.projenrc` を編集して再合成。既存プロジェクトへの導入は記述なし | **生成物を手で触らせず、CI で乖離を落とす**型。持ち込みの手順は無い |
| T7 | Renovate「Config migration」https://docs.renovatebot.com/config-migration/ | 旧い構成は使用前に**内部で移行**され、デバッグログ以外に見えない。`configMigration: true` で構成ファイルを新名へ書き換える PR を作る(既定は無効だが有効化を推奨)。無効時は Dependency Dashboard にオンデマンドのチェックボックス。旧い構成は「正しく行えば無期限に動き続ける」。構成の版の欄は無い | 版の欄を持たず、**旧名の読み替えを無期限に保証**し、書き換えは PR として人へ出す |
| T8 | Renovate「Installing & Onboarding」https://docs.renovatebot.com/getting-started/installing-onboarding/ | 既存リポジトリでは「Configure Renovate」の onboarding PR を作り、`renovate.json` の推奨既定値と検出した上書き(例: 既存のコミット規約)を入れる。**マージまでリポジトリに変更を加えない**。PR を閉じれば不参加。既知のパッケージファイルの無いリポジトリは無視 | 既存リポジトリへの持ち込みを**既存の慣行を検出した提案 PR**として出し、マージを導入の開始とする型。本標準の「適用の開始」(ADR-0083、configured: true の最初のコミット)と対応する |
| T9 | ESLint v9 Migration Guide https://eslint.org/docs/v9.x/use/configure/migration-guide | `@eslint/migrate-config` は出発点を作るが「さらなる修正なしで動く保証は無い」。`.eslintrc.js` は評価済みの値だけを写し、関数・条件分岐は落ちる。v9 から flat config が既定、v8 では `ESLINT_USE_FLAT_CONFIG` で先行採用。v9 は 2026-08-06 に EOL | 自動移行器は**ロジックを持つ構成を写せない**。移行器の出力を検証なしに確定させない。先行採用のスイッチ→既定化→旧形式の廃止、の段階を踏む |
| T10 | ESLint「Bulk Suppressions」https://eslint.org/docs/latest/use/suppressions | 違反の多い既存コードで新規則を error にする困難への対処。`--suppress-all` で既存の違反を `eslint-suppressions.json` に記録しコミット。**新しい違反は通常どおり報告**。直した違反の記録が残ると非ゼロ終了、`--prune-suppressions` で整理 | 既存コードの**基準線(ベースライン)を記録して、新規分だけを止める**型。既存の負債を台帳化して減らす方向だけを許す |
| T11 | diff-cover 10.5.1(PyPI、2026-08-16)https://pypi.org/project/diff-cover/ | 差分の行のうちテストで覆われない行を見つける。Cobertura / Clover / JaCoCo の XML と LCov を受ける(coverage.py・JSCover・lcov)。`--fail-under`、`--compare-branch`(既定 origin/main) | 既存コードの網羅率が低い・測定器が無いリポジトリでも、**差分の網羅率**なら言語を跨いで(共通の報告形式で)課せる。polyglot の受け皿 |

### 構成の版の移行の型(T1〜T10、§3 の K1〜K2 を合わせて)

| 型 | 例 | 版の識別 | 旧い構成の扱い | 人の関与 |
| --- | --- | --- | --- | --- |
| 内部の読み替え | Renovate | 無し | 無期限に読み替え | 書き換えは PR(任意) |
| 宣言した移行の実行 | Copier `_migrations` | テンプレートの Git タグ(PEP 440)、回答ファイルの `_commit` | 跨いだ版の移行だけ実行 | 更新は手元で実行し、衝突を人が解く |
| 直接の変換関数 | Terraform state upgrader | 整数の schema version | 旧版ごとに現行版への変換を1つずつ用意(連鎖しない) | なし(機械が保証) |
| 猶予期間と往復変換 | Kubernetes API | API の版(v1beta1 → v1) | 廃止予告から一定期間は提供、往復で情報を失わない | 利用者が期間内に移行 |
| 自動移行器 + 段階的既定化 | ESLint flat config | ファイル名で形式を識別 | 移行器で出発点を作り、手で直す | 必須 |

## 3. 実プラットフォームでの検証と履歴の来歴

| # | 出典 | 言っていること | 含意 |
| --- | --- | --- | --- |
| K1 | Kubernetes「Deprecation Policy」https://kubernetes.io/docs/reference/using-api/deprecation-policy/(原文は kubernetes/website の `content/en/docs/reference/deprecation-policy.md`) | 規則1: API の要素は API グループの版を上げることでしか除けない。規則2: 同じリリース内で API の版の間を**情報を失わず往復できなければならない**。規則4a: GA は主版の中で除かない。beta は導入から 9 か月または3つの小リリース以内に廃止予告、予告から 9 か月または3リリース後に提供を止める。規則4b: 新旧両方を支えるリリースを出すまで優先版・保存版を進めない(更新して戻せる)。保存済みの版は読み戻せ続けなければならない | **猶予期間・往復変換・巻き戻し可能性**を規則として明文化した例。構成の契約検査で「旧い版は落ちる」を許すなら、その期間と告知の規則が要る |
| K2 | Terraform Plugin Framework「State upgrade」https://developer.hashicorp.com/terraform/plugin/framework/resources/state-upgrade | schema の `Version` は 0 より大きく、慣例で変更ごとに1増やす。`UpgradeState` は旧版→upgrader の写像。該当が無ければエラー。「フレームワークは中間の版を順に辿らない」— 各 upgrader は旧版から現行版へ全面的に上げる | **版の欄 + 版ごとの直接の変換**。未知の版は黙って通さずエラー |
| K3 | GitHub Docs「Creating rulesets for repositories in your organization」(GHEC)https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization / 「Creating rulesets for a repository」(無料版の文書)https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository | GHEC の文書は Active / **Evaluate**(強制せず Rule Insights で違反を観測)/ Disabled の3状態。無料版の文書の作成手順の状態は Active / Disabled の2つだけ(Evaluate はメタデータ制限の試験の文脈にしか出ない)。ルールセット一般は Free の公開リポジトリと Pro / Team / Enterprise Cloud で使える。Rule Insights のダッシュボードは Team と Enterprise Cloud(要約経由) | **Evaluate による事前の試行は Enterprise 前提と読むべき**(推定。明文の制限は見つけていない)。小規模の採用者に「Evaluate で試してから有効化」を求められない。SRC-0343 の「3状態」の記述は GHEC の文書であることに注意 |
| K4 | GitHub Docs「About rulesets」(SRC-0343、生テキスト確認) | 複数のルールセットとブランチ保護は**重なり、最も厳しい版が適用**される。優先度は無い | 既存のブランチ保護が残ったままテンプレートのルールセットを足すと、**意図より厳しい合成**になる。検証は合成後の実効値で行う |
| K5 | OpenSSF Scorecard「Branch-Protection」(SRC-0574、生テキスト確認) | `DismissStaleReviews`・`EnforceAdmins`・`RequireLastPushApproval`・`RequiresStatusChecks`・`UpToDateBeforeMerge` は**管理者トークンが要る**。無ければ非管理者に読める設定だけで採点し、「管理者向け」の要件は満たしたものとして扱う。いずれも Repo Rules(ルールセット)経由なら読める。バイパス主体が1つでもあれば `EnforceAdmins` は false。段階付き採点(段階を満たさないと次の段階の点は得られない) | **読めない設定を「満たした」と扱う検査器が実在する**。本標準の env-check は、権限不足で読めなかった項目を「確認済み」に数えない規則が要る。ルールセットを使えば非管理者でも読める、は検証設計の手掛かり |
| K6 | terraform-provider-github issue #3687(2026-10-19 起票)https://github.com/integrations/terraform-provider-github/issues/3687 | 読めるが管理できないトークンでは、ルールセットの GET 応答から `bypass_actors` の鍵が**欠落**する(管理者には空配列)。プロバイダは欠落と空を区別せず、plan が永久に差分を出す。保守者は「プロバイダのバグではなく読み取り専用の応答の問題」とコメント | **欠落と空の区別**は、実環境の確認(env-check)の記録の設計に直結する。「バイパス主体なし」と「読めなかった」を同じ値にしない |
| K7 | github/safe-settings README(main-enterprise)https://github.com/github/safe-settings | 設定は admin リポジトリの既定ブランチのものを適用。非既定ブランチで PR を出すと `nop`(no-operation)の dry-run で、**基底ブランチの構成との差分だけ**を check run と PR コメントで報告。エラーがあれば check を失敗に。Webhook は届く保証が無いため、スケジュールの全同期で乖離を是正。Bot が送った事象は無視(乖離の是正の試験は人の PAT で行う) | **宣言 → dry-run の差分を PR に出す → マージで適用 → 定期の全同期で乖離を検出**の型。実環境の検証を一度の確認で終えず、**継続的な乖離検出**とする |
| K8 | OpenSSF Allstar README https://github.com/ossf/allstar | 方針ごとに `log`(既定、運用者だけが見られる)/ `issue`(方針ごとに1件の Issue、24時間ごとに催促、解消で自動クローズ)/ `fix`(設定を直す、方針依存)。`block`(必須チェックで PR を止める)は提案段階で未実装。不要な Issue は opt-out | **段階的な強制(記録 → 通知 → 修正)**を方針ごとに選ばせる。持ち込み直後から遮断せず、記録と通知から始める前例 |
| K9 | GitHub Docs「Troubleshooting required status checks」https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks(SRC-0573 の移転先) | パス・ブランチ・コミットメッセージのフィルタで**スキップされた必須チェックは保留のまま**マージを止める(「スキップされうるワークフローを必須にしない」)。条件でスキップされたジョブは Success を報告し、止めない。同名のチェックとコミットステータスは両方の通過が要る。「期待した GitHub App が設定していない」警告 | 既存リポジトリの CI(パスフィルタ付き)に必須チェックを足すと、**通らない PR が出る**、あるいは**条件スキップで素通り**する。必須チェックの名前と発行元を実環境で確かめる必要 |
| K10 | GitHub Docs「About code owners」(github/docs の原文)https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners | `.github/`・ルート・`docs/` の順に探し**最初の1つだけ**を使う。所有者は明示の write 権限が要る(チームは可視かつ write)。**不正な構文の行は飛ばされる**(画面で強調、API で誤りの一覧を取得可)。最後に一致した規則が優先。CODEOWNERS 自体の所有者を定めるのが最も安全 | 既存の CODEOWNERS が別の場所にあれば、テンプレートの CODEOWNERS は**黙って無効**になりうる。誤りは失敗ではなく行の無視。`codeowners/errors` の API で確かめる必要 |
| K11 | git-merge 文書 https://git-scm.com/docs/git-merge / GitHub Docs「About Git subtree merges」https://docs.github.com/en/get-started/using-git/about-git-subtree-merges | `--allow-unrelated-histories`: 既定で共通の祖先の無い履歴の併合を拒む。独立に始まった2つのプロジェクトの併合のための安全装置の解除で、既定で有効にする設定は無く今後も追加しない。subtree 併合は `merge -s ours --no-commit --allow-unrelated-histories` + `read-tree --prefix`、上流の変更は自動で追従しない | テンプレートの履歴を既存リポジトリへ併合すると、**テンプレート由来のコミット(トレーラ・作者・日付)が既存の履歴に混ざる**。証跡の集約がそれを準拠の証跡と誤認しうる |
| K12 | SLSA「Source: Requirements for producing source」v1.2(SRC-0416) | 「技術的統制はブランチの履歴で連続して使われて初めて有効」。主張する統制ごとに**特定の開始リビジョンから連続性を確立・追跡しなければならない**。途切れたら新しいリビジョンから再確立。ブランチを Source Track に載せるとき、主張は**そのリビジョン以降**であり「前のリビジョンには主張をしない」。統制は同時期に作る証明(attestation)に記録する。移行・取込のボットは信頼できるロボットとして例外を受けうる(要約経由) | **持ち込みの時点を開始リビジョンとし、それ以前の履歴(併合したテンプレートの履歴を含む)には準拠を主張しない**、が一次資料で支えられる。ADR-0083 の「適用の開始」と整合 |
| K13 | git-interpret-trailers https://git-scm.com/docs/git-interpret-trailers | トレーラはコミットメッセージ末尾の `key: value` の段落(検索結果の確認のみ。本文は今回読んでいない) | トレーラは**誰でも書ける文字列**であり来歴の証明ではない。テンプレート由来のコミットのトレーラは、出所の識別に使えても準拠の証明にはならない |

## 4. 既存リポジトリへの持ち込みで報告されている落とし穴

| # | 出典 | 言っていること | 含意 |
| --- | --- | --- | --- |
| P1 | Claude Code Docs「How Claude remembers your project」(SRC-0350、2026-10-24 再読) | CLAUDE.md は「強制される構成ではなく文脈」。行為を止めるには PreToolUse フックを使う。2つの指示が矛盾すると「どちらかを任意に選ぶことがある」。`/doctor prompt-audit` が古い指示・存在しないファイル参照・矛盾を報告し、許可まで変更しない。既定では作業ディレクトリ以上に CLAUDE.md / `.claude/CLAUDE.md` / CLAUDE.local.md が1つでもあれば **AGENTS.md は読まない**(CLAUDE.local.md を足すだけで AGENTS.md の読み込みが止まる)。設定 `claude-md-and-agents-md` で両方。ユーザーの規則とプロジェクトの規則は互いに上書きせず、矛盾すればどちらに従うか不定 | 既存の CLAUDE.md・AGENTS.md・ユーザー側の規則とテンプレートの CLAUDE.md の**矛盾は黙って片方が選ばれる**。初期化は既存の指示ファイルを検出して止め、人に統合させる必要。強制が要る規則は指示文でなくフックへ(本テンプレートの `[機械]` と同じ方向) |
| P2 | AGENTS.md(agents.md)https://agents.md/ | 「最も近いファイルが優先」、「明示のチャットの指示がすべてに優先」。標準の Markdown で必須の欄は無い | サブディレクトリの既存 AGENTS.md がテンプレートの規則より優先されうる。**入れ子の指示ファイルの走査**が初期化に要る |
| P3 | GitHub CODEOWNERS(K10) | 3つの場所の最初の1つだけ、不正な行は無視 | 既存の CODEOWNERS との競合は**失敗せず無効化**として現れる |
| P4 | 必須チェック(K9)・ルールの重なり(K4) | パスフィルタ付きの既存 CI、既存のブランチ保護との合成 | 持ち込み前の CI 構成の棚卸しが要る |
| P5 | 網羅率の測定器が無い / 多言語(T10・T11) | 既存の違反の基準線化、差分の網羅率は共通報告形式で言語を跨ぐ | 「coverage が無い」を初期化が告げ、全体の閾値ではなく**差分の網羅率**や基準線で始める選択肢を示す |
| P6 | Renovate onboarding(T8) | 既知のパッケージファイルが無いリポジトリは対象外として無視 | 検出できない言語・構成を**黙って対象外にする**のは道具の常道だが、準拠の主張では「対象外」を明示しなければならない(本標準の「書かれていない」と「課さないと決めた」の区別) |

python・go のリポジトリにテンプレートを持ち込んだ実例の報告は、今回の検索では一次資料として見つからなかった(実務の報告の不在は、調査の不足の可能性を含む)。

## 5. 標準への含意(議論の材料。採否は会議体で決める)

1. **持ち込みの手順の置き場所**: 上位規格(12207 第1版・第2版、共通フレーム)は既存環境への持ち込みを手順として規定せず、採用者の改善計画(CMMI Adoption Guidance)に委ねている。本標準の本体には「持ち込みで満たすべき要件(何を確かめるか)」だけを置き、手順はテンプレートの文書に置く案に先例がある。逆に、本標準が「他組織が従う規格」である以上、要件を欠けば採用者ごとに検証が漏れる。要件と手順を分けることが論点
2. **現状の写しを先に取る**: CMMI は「現行プロセスの写し → 差 → 使用の確認」を最初に置く。初期化の前に、既存の CI・必須チェック・ブランチ保護・ルールセット・CODEOWNERS・指示ファイル(CLAUDE.md / AGENTS.md / 入れ子)・網羅率の測定器・言語を**棚卸しして記録**する工程を置く根拠になる
3. **開始リビジョン以前に主張しない**: SLSA Source v1.2 の連続性の規定は、ADR-0083(適用の開始)を補強する。併合したテンプレートの履歴・持ち込み前の履歴は**証跡の集約の対象外**と明示し、テンプレート由来のコミットを識別する(トレーラは来歴の証明にならない点に注意)
4. **実環境の検証は一度で終わらない**: safe-settings・Allstar は宣言と実状態の乖離を**定期的に**検出する。env-check を持ち込み時の1回で済ませるか、定期の再確認(乖離の検出)を課すかが論点
5. **読めなかったことを満たしたことにしない**: Scorecard は管理者権限の無い読み取りで「管理者向け要件は満たした」と扱い、terraform は欠落と空を混同した。env-check の記録は「確認済み / 未達 / **権限不足で未確認**」を区別しなければならない(ADR-0028 の未達と省略の区別の延長)
6. **Evaluate を前提にしない**: ルールセットの Evaluate は GHEC の文書にしか状態として現れない。小規模の採用者に試行モードを求める手順は書けない。代替は、試験用リポジトリでの試行か、Allstar 型の「記録 → 通知 → 強制」の段階化
7. **構成の版の移行の型を選ぶ**: 「旧い版で生成した構成で契約検査が落ちる」(A-3 の帰結)には、(a) 読み替えて動かし続ける(Renovate)、(b) 版ごとの移行を宣言し `/process-change` 経由で PR として出す(Copier・Terraform)、(c) 猶予期間を定め、期間内は旧版も検査を通す(Kubernetes)の3案がある。いずれの前例も、**未知の版を黙って通さない**(Terraform はエラー、Copier は最低版で中止)。構成ファイルに版の欄(schemaVersion)を持たせるか、生成時のテンプレートの版(Copier の `_commit` 相当)を記録するかが論点。「手で編集しない」規則は Copier・projen と一致する
8. **自動移行器の出力を検証なしに確定させない**: ESLint の移行器は「修正なしで動く保証は無い」と自ら書く。移行は人の確認を経る PR とするのが Renovate・safe-settings と同じ型
9. **既存の負債は基準線で受ける**: 網羅率・静的解析の既存違反は ESLint の bulk suppressions・diff-cover の型(基準線の記録 + 新規分だけを止める + 減る方向だけを許す)で受けられる。本標準の技術負債台帳・前提の受容の経路との対応を検討する。ただし基準線は「閾値の緩和」(禁止事項6)と見分けがつかないため、**持ち込み時の基準線の記録を誰が確定するか**(人)を定める必要
10. **既存の指示ファイルとの矛盾は黙って解決される**: Claude Code は矛盾をどちらか任意に選び、CLAUDE.md があれば AGENTS.md を読まない。初期化は目印の無い既存の CLAUDE.md・AGENTS.md・入れ子の指示ファイルを検出したら**止めて人へ返す**(ADR-0084 の目印の照合の延長)のが前例と整合する
11. **黙って無効になる設定を検査する**: CODEOWNERS の場所の重複と不正行、スキップされる必須チェック、ルールの重なりは、いずれも**失敗ではなく無効化・保留として現れる**。持ち込みの検査は「ファイルがあるか」ではなく「実環境で効いているか」(API の codeowners/errors、ルールの実効値)を確かめる必要
12. **根拠水準**: 規格は全て本文未読(プレビュー・目録・要約経由)。この調査を根拠に条項を置く場合は EV マークを付ける

## 6. 出典カードの候補(SRC-0650 以降。カードは未作成)

| 候補 ID | 題名 | 発行者 | URL | 日付 |
| --- | --- | --- | --- | --- |
| SRC-0650 | Updating a project - copier | Copier(copier-org) | https://copier.readthedocs.io/en/stable/updating/ | 不明(stable) / 参照 2026-10-24 |
| SRC-0651 | Configuring a template - copier(`_migrations`, `_min_copier_version`) | Copier(copier-org) | https://copier.readthedocs.io/en/stable/configuring/ | 不明(stable) / 参照 2026-10-24 |
| SRC-0652 | cruft 2.14.0 | cruft(PyPI) | https://pypi.org/project/cruft/2.14.0/ | 版 2.14.0 / 参照 2026-10-24 |
| SRC-0653 | Config Migration - Renovate Docs | Mend / Renovate | https://docs.renovatebot.com/config-migration/ | 参照 2026-10-24 |
| SRC-0654 | Installing and onboarding - Renovate Docs | Mend / Renovate | https://docs.renovatebot.com/getting-started/installing-onboarding/ | 参照 2026-10-24 |
| SRC-0655 | Configuration Migration Guide (ESLint v9.x) | OpenJS Foundation / ESLint | https://eslint.org/docs/v9.x/use/configure/migration-guide | v9.x(EOL 2026-08-06) / 参照 2026-10-24 |
| SRC-0656 | Bulk Suppressions - ESLint | OpenJS Foundation / ESLint | https://eslint.org/docs/latest/use/suppressions | 導入 2025-04(v9.24.0) / 参照 2026-10-24 |
| SRC-0657 | projen README (v0.103.27) | projen | https://cdn.jsdelivr.net/npm/projen@0.103.27/README.md | 版 0.103.27 / 参照 2026-10-24 |
| SRC-0658 | Creating a repository from a template - GitHub Docs | GitHub | https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template | 参照 2026-10-24 |
| SRC-0659 | About Git subtree merges - GitHub Docs | GitHub | https://docs.github.com/en/get-started/using-git/about-git-subtree-merges | 参照 2026-10-24 |
| SRC-0660 | git-merge Documentation(`--allow-unrelated-histories`) | Git project | https://git-scm.com/docs/git-merge | 参照 2026-10-24 |
| SRC-0661 | Kubernetes Deprecation Policy | Kubernetes(CNCF) | https://kubernetes.io/docs/reference/using-api/deprecation-policy/ | 参照 2026-10-24 |
| SRC-0662 | State upgrade - Terraform Plugin Framework | HashiCorp | https://developer.hashicorp.com/terraform/plugin/framework/resources/state-upgrade | 参照 2026-10-24 |
| SRC-0663 | [BUG]: Ruleset bypass_actors drift on every plan when the token cannot administer the ruleset (#3687) | integrations/terraform-provider-github | https://github.com/integrations/terraform-provider-github/issues/3687 | 2026-10-19 / 参照 2026-10-24 |
| SRC-0664 | safe-settings README | GitHub(github/safe-settings) | https://github.com/github/safe-settings | 参照 2026-10-24(main-enterprise ブランチ) |
| SRC-0665 | Allstar README | OpenSSF | https://github.com/ossf/allstar | 参照 2026-10-24 |
| SRC-0666 | About code owners - GitHub Docs | GitHub | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners | 参照 2026-10-24 |
| SRC-0667 | Creating rulesets for repositories in your organization - GitHub Enterprise Cloud Docs | GitHub | https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization | 参照 2026-10-24 |
| SRC-0668 | Creating rulesets for a repository - GitHub Docs(無料版の文書。状態は Active / Disabled) | GitHub | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository | 参照 2026-10-24 |
| SRC-0669 | CMMI Adoption Guidance (Version 4.0) | CMMI Institute(ISACA) | https://www.cmmiinstitute.com/getattachment/3cc3e8d1-72a1-4f6d-b1da-c5df8c9ad87d/CMMI-Adoption-Guidance.pdf | 2026-07-07 / 参照 2026-10-24 |
| SRC-0670 | ISO/IEC 33001:2015 Process assessment — Concepts and terminology(目録) | ISO/IEC JTC 1/SC 7 | https://www.iso.org/standard/54175.html | 2015-03(2026-01 確認) / 参照 2026-10-24 |
| SRC-0671 | ISO/IEC 33000 family(JTC1/SC7 flagship standards) | ISO/IEC JTC 1/SC 7 | https://committee.iso.org/sites/jtc1sc7/home/projects/flagship-standards/isoiec-33000-family.html | 参照 2026-10-24 |
| SRC-0672 | SEC BOOKS: 共通フレーム2013 | IPA | https://www.ipa.go.jp/publish/secbooks20130304.html | 2013-03-04 / 参照 2026-10-24 |
| SRC-0673 | 国際規格SLCPの進化とそのポイント | IPA | https://www.ipa.go.jp/digital/kaihatsu/slcp/slcp-evolution-keypoints.html | 公開 2025-09-30・更新 2026-09-11 / 参照 2026-10-24 |
| SRC-0674 | Software Engineering Body of Knowledge (SWEBOK) v4.0a | IEEE Computer Society | https://www.computer.org/education/bodies-of-knowledge/software-engineering | v4.0 2024、v4.0a 2025-09-25 / 参照 2026-10-24 |
| SRC-0675 | Backstage Software Templates | Backstage(CNCF) | https://backstage.io/docs/features/software-templates/ | 参照 2026-10-24 |
| SRC-0676 | diff-cover 10.5.1 | diff-cover(PyPI) | https://pypi.org/project/diff-cover/ | 2026-08-16 / 参照 2026-10-24 |
| SRC-0677 | AGENTS.md | agents.md(AAIF) | https://agents.md/ | 参照 2026-10-24 |

既存カードへの追記の候補(新規カードにしない):

- SRC-0642(12207:2017): 別プレビュー(https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed1.0%7Den.pdf)で、序論の適用様態・1.2(附属書A は規定)・1.3(附属書I が 2008 年版との対応)を確認した claim
- SRC-0491(12207:2026): 5.3.2「Organization and project-level adoption」の見出し、附属書 A〜E に旧版との対応の附属書が無いことの claim
- SRC-0573: URL の移転(`/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks`)
- SRC-0343: 3状態の記述は GHEC の文書。無料版の作成手順の文書(SRC-0668 候補)には Evaluate が無い旨の注記
- SRC-0350: AGENTS.md の読み込み条件(CLAUDE.md があれば読まない)と「矛盾すれば任意に選ぶ」、`/doctor prompt-audit` の claim
- SRC-0574: 管理者トークンが無い場合に「管理者向け要件は満たしたものとして」採点する claim
