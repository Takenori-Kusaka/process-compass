# #474 内部調査 2: 実装の実在を検査の条件にしている箇所と、過去の決定

- 日付: 2026-11-28
- 担当: 束 D7 内部調査(読むだけ。標準の本文・template・構成は変えていない)
- 制約: この作業ツリーでは `template/` が空(未初期化)だった。template 側の中身は、親の検査スクリプト・登録簿(`src/data/*.yaml`)・CI の定義から読んだ。template のファイルの実在そのものは確かめていない
- 数え方の注意: 実装マークの件数は本文の `<!-- impl IMPL-NNNN ...` を grep した値(2026-11-28 の作業ツリー)。台帳 `community/implementation-ledger.md` との照合はしていない

## 1. 検査(`npm run check`)の洗い出し

`package.json` の `check` は 30 個余りの npm script の連結で、最後が `build`(Astro)。以下は呼ばれる順。

| script | 実体 | 何を検査するか | template を要するか | 標準の本文だけで閉じるか | template の何を見るか |
| --- | --- | --- | --- | --- | --- |
| lint:ci | check-ci-wiring.mjs(+lib/ci-wiring.mjs) | ci.yml の結線(契機・check ジョブが `npm run check` だけを回す・publish/deploy が check に needs で繋がる) | 要らない(読むのは親の ci.yml) | 閉じる。ただし条件3「check ジョブが template の submodule を取得する」は template の存在が前提 | なし。取得の命令に「template」の語があることだけ |
| lint:text | textlint | 日本語の校正 | 不要 | 閉じる | なし |
| lint:tone | check-tone.mjs | 内部文脈語・主観表現・未完成の痕跡 | 不要 | 閉じる | なし |
| lint:evidence | check-evidence.mjs | 根拠水準マークの書式・重複・期限、台帳生成 | 不要 | 閉じる | なし |
| lint:impl | check-impl.mjs(632 行) | 実装マークの書式、降ろし先の実在、台帳生成、棚卸し(ADR-0076)、逆向きの追跡(ADR-0084 決定6)、スキルの文の件数、試験の結線 | **要る**(未初期化なら「実施しなかった検査」として失敗) | 閉じない | 降ろし先のファイル(`template/<path>`)の実在、`process.config.json` のキー(サンプル回答から構成を生成)、`scripts/gate/<checker>.mjs`、`scripts/gate`・`scripts/init`・`.claude/hooks`・`.github/workflows` の全ファイルが登録簿か `impl-untraced.yaml` に載るか、template 側の文書が引く IMPL 番号が標準本文に実在するか |
| lint:scope | check-scope.mjs + test-scope-exempt | 適用範囲の見出し注記、台帳(ADR-0039) | 不要(台帳の機械可読版を template へ運ぶのは build-template-kb) | 閉じる | なし |
| lint:refs | check-section-refs / regress/check-fixes / test-decision-refs / test-section-refs / check-adr-links / check-claim-terms / check-failure-projection(と各 test) | 附属書H・D が引く節・ゲート・基準・様式・ADR の実在、後継 ADR の参照、1.10.2 と H.8 の語、困りごと投影表の IMPL 実在 | 不要(`template` の語は章の頁名 `deliverable-templates` だけ) | 閉じる。ただし failure-projection は IMPL がマークとして実在することを見る(降ろし先の実在までは見ない) | なし |
| lint:provisions / test:provisions | check-provisions.mjs(541 行) | 規定の文末・升の語・附属書の種別(第1章 1.5・1.7) | 不要 | 閉じる(試験は空の `template/` を一時に作る。入力の存在検査を通すため) | なし |
| lint:dekimasu / test:dekimasu | check-dekimasu.mjs | 「できます」の登録簿 | 不要 | 閉じる | なし |
| lint:skills | check-skill-provisions.mjs(lib/skill-provisions.mjs) | template のスキル(`.claude/skills/*.md`)と `CLAUDE.md` の要求・禁止の文に、標準の所在か「テンプレート独自」の印があること(ADR-0064) | **要る** | 閉じない | スキルの文そのもの |
| lint:figures / brand:check | check-figures-svg / brand-sync --check | 図の SVG と PNG のハッシュ、ブランド資産の複製 | 不要 | 閉じる | なし |
| lint:sources / lint:citations / test:citations / test:edition | research-ledger / check-citations / test-edition | 出典台帳、1.3 の参照規格の版、標準の版の解決 | 不要 | 閉じる | なし |
| lint:registry / test:registry | check-recalibration-registry.mjs | 3.12.12 の登録簿の表と、template の機械可読版(`scripts/gate/recalibration-registry.json`)・`process.config.json` の ID・名称・前提・「能力に依るか」の一致 | **要る**(未初期化なら失敗) | 閉じない | 登録簿 JSON と process.config.json |
| lint:detection-values | check-detection-values.mjs + 試験 | 1.7.7 の例外が及ぶ値の列挙と、template の読み取り(`scripts/gate/detection-values.mjs`)の一致 | **要る** | 閉じない | 検知の値の読み取りスクリプト |
| test:engine | test-tailoring-engine.mjs | 規則の target 実在とペルソナ・限界ケースの結果(エンジンは `src/lib/`) | 不要 | 閉じる | なし |
| lint:stage-table | check-stage-table.mjs | 第8章 軸B の表とエンジン出力の突合 | 不要 | 閉じる | なし |
| test:impl | test-check-impl.mjs | check-impl の違反と適合の対(一時ディレクトリの偽 template を作る) | 不要 | 閉じる | なし(偽物) |
| test:plan-issues | test-plan-issues.mjs | 閉じた Issue を指す未達マークの検出の関数 | 不要 | 閉じる | なし |
| test:ci-wiring | test-check-ci-wiring.mjs | lint:ci の違反と適合の対 | 不要 | 閉じる | なし |
| test:template | check-template-drift.mjs(309 行) | 親の正本(エンジン・知識ベース・ゲート識別子など)と template の複製の乖離。未初期化(空を含む)なら失敗 | **要る** | 閉じない | `src/lib` の複製、`scripts/vendor/tailoring-kb.json` ほか |
| test:fields | check-template-fields.mjs + 試験 | `src/data/template-fields.yaml`(13 様式)による、標準 第6章と template 様式の 3 方向の検査(ADR-0040 / ADR-0087 決定4) | **要る**(方向1 は標準だけで実施し、方向2・3 を実施できないので失敗) | 方向1 だけ閉じる | `templates/*.md` の欄・見出し |
| test:criteria | check-gate-criteria / test-gate-criteria-yaml / test-kb-ancestry | 第4章の判定基準と、配布する知識ベース(`template/scripts/vendor/tailoring-kb.json`)の乖離。生成元のコミットが HEAD の祖先か(#332) | **要る**(既定は template の JSON。`--kb <path>` なら標準だけの生成物も検査できる) | 部分的に閉じる(`--kb` で) | 知識ベースの JSON |
| test:template-suite | test-template-suite.mjs(80 行) | template の `gate-g5.yml` のジョブ contract が並べる試験(`node scripts/gate/test-*.mjs`)を親から流す。一覧の漏れ(NOT_TESTS への理由つき登録)と、試験が template の作業ツリーを汚さないこと | **要る**(template の実行物そのものを走らせる) | 閉じない | template の試験スクリプト全部 |
| test:regress | regress/test-run.mjs + regress/run.mjs(395 行) | 決定を固定する回帰(後述 §4) | **要る**(template を一時リポジトリへ複製して走らせる) | 閉じない | template の `scripts/gate`・`.claude`・`templates` 全体を実行 |
| build | astro build | サイトの生成、リンク検査(starlight-links-validator) | 不要 | 閉じる | なし |

### 1.1 実装マークの降ろし先(`src/data/impl-targets.yaml`、114 件)

| kind | 件数 | 検査 | template との関係 |
| --- | --- | --- | --- |
| config-key | 8 | サンプル回答から `process.config.json` を生成し、キーの存在を確かめる | すべて template の init が生成する構成 |
| template-file | 89 | `template/<path>` の実在 | すべて template 配下。分布は `scripts/gate` 31 / `.claude/skills` 20 / `.github/workflows` 14 / `templates/*.md` 約 20 / `.github/rulesets` 3 / `.claude/hooks` 2 / `CLAUDE.md`・`PROCESS-PROFILE.md` ほか |
| planned | 17 | 実在を確かめない。`state=undelivered` のマークだけが使える | 予定の置き場(2 件は「採用者の AI 実行基盤」で template の外) |

- template の実在を条件にする target は 97 件(config-key 8 + template-file 89)。残り 17 件は planned
- 登録簿の外のもう 1 つの条件(逆向きの追跡): template の `scripts/gate`・`scripts/init`・`.claude/hooks`・`.github/workflows` の全ファイルが、登録簿の path・checker か `src/data/impl-untraced.yaml`(理由 library / infra / variant)に載る。載らないファイルがあれば落とす
- マークの件数: 1,072 個(識別子の一意)。state は delivered 955 / undelivered 119。target の多い順は evidence-aggregation 170、gate-skill 69、d0-template 54、claude-md-resident 54、pr-checks 54 など
- マークの `check` 属性は machine(試験のファイルを指す。`test=template/...` なら template の試験)・presence・manual。`plan` 属性は undelivered に scheduled(Issue 番号と見直しの月)か adopter(採用者が実装。`decision` で記録の所在)。**`plan=adopter` は、すでに標準が「実装は採用者の側」を宣言する受け皿である**(implementation-marking.md)

### 1.2 template を別物(実装の例)にしたとき

- `template:kb`(`build-template-kb.mjs`、278 行): 親の YAML(規則・判定基準・台帳)を JSON へ符号化し、template へ複製する。複製は template が持つ。「例」にすると、複製は例の側の都合になる。ただし生成器と YAML の正本は親にあり、「標準の機械可読版」という役割(標準の側)と「実装へ運ぶ道」という役割に分かれる
- `check-template-drift`: エンジン本体の複製と一致を強制。例に移すなら、検査の向きは「例が標準の版に追随しているか」へ変わる(任意)
- `.github/workflows/ci.yml`: check ジョブに `git submodule update --init --recursive template` がある。コメントに「template が無ければ検査は失敗する(#293 裁定 J-3)」。publish ジョブは dist/standard(標準の本文と知識ベースだけ)を配る。公開(deploy)と配布(publish)は check の通過に needs で繋がるので、**template の検査が落ちれば標準の公開も止まる**

## 2. 検査の 3 分け

(a) 3 分けの表は末尾の「まとめ (a)」に置く。

## 3. 過去の決定(原文の抜き書きと所在)

### 3.1 2026-11-16 の所有者の方針(正本の所在)

`research/sweep-orca-specs/common2.md` 19 行(依頼文に入れた方針。トリアージの原本 `research/sweep-2026-11-12-triage.md` には 200 行に「所有者の方針(2026-11-16: テンプレートは標準と連動、細かい定義を増やさない、受付の3つの問い、降ろし方の選び方)」と要約があるだけ。原文の会話は memory `template-embodies-standard.md`):

> 所有者の方針(2026-11-16): 準拠テンプレートは標準を体現し、連動させる(このテンプレートで始めれば準拠する)。ただし細かい定義を増やしてプロセスの柔軟性を失わない。受付と裁定で次の3つを問う。(1) 条文に書くのは満たすべき結果と残る証跡までで、手順は手引きへ回す (2) 珍しい構成や抜け道は、新しい条項を足さずに第7章の例外承認で受けられないか (3) 破られたとき誰が何を失うか。安全・取り消せない操作・適合の主張の信頼に響くものだけを細かく書く。テンプレートへの降ろし方は、機械の検査(決定可能な条件だけ)・様式の欄・手引きから選ぶ。採らないと決めた点は明記する

memory `template-embodies-standard.md`:

> pit-in-template はピットイン開発を体現したものであるべきで、標準と連動させる。このテンプレートで始めればプロセスに準拠する状態にしたい。「テンプレートは標準の全部を実装しなくてよい」という提案は採られなかった

> How to apply: テンプレートの範囲を狭める案は出さない。連動は保ち、降ろし方…と、条項の粒度…で重さを抑える案を出す。これは私(Claude)の解釈で、線引きの基準そのものは所有者が未決としている

前後の回答(`sweep-2026-11-12-triage.md` §4):

- 19・21・22(2026-11-17〜18): #447 は「常時の記録を案件側に課す」。新しい義務は重の審議
- 28(#355 IMPL-0584): 条文を保ち `plan=adopter`。「template は個人単位の集計を出さない」(実装を外す先例)
- 18(#355): 「個人の指標」を標準で定義する案は外す。理由「細かい定義を増やさない方針」
- 40(#446 K-4): 写像が本文に無いことは根拠水準マークで開示し、template は止める側へ倒す(標準が決めず、実装が決める先例)
- 41(#443 5.7.5): 表現は手引き、強調は `review-order.mjs` で降ろす(降ろし方を選ぶ先例)
- 45・47: 実環境の検証は private の一時リポジトリで行い、終わったら削除(試行リポジトリを別に持つ先例。ただし「例」としては残していない)
- #222・#226・#227・ADR-0040 が 11-16 の方針の前提(§3.3)

### 3.2 #473 と #468 と trim 方針

#473 所有者の回答 3(2026-11-28。問い 1)の後段(本件の起点。原文):

> ピットイン開発プロセスではその決め方やこういう準備をしておくといいよ、というテンプレートやその中に盛り込まれているべきものが規定されており、作るのは各社、各チームであるべきだと思います。他にもこういう風にどんなものを用意するべきかが規定されているのがピットイン開発プロセスであり、具体的な実装まで落とし込んだものはプロセス定義とは言わず実装になります。ピットインテンプレートですらやりすぎだと思います。根本的にプロセス定義とはどこまでが定義されているべきものでそのラインなのか、ってちゃんと基準を明確にできているのか不安になりました。

- ここで「テンプレート」は 2 つの意味がある。(1) 標準が規定する「準備物の様式(インセプションデッキに当たるもの)」(= 標準の第6章の成果物様式、標準の側)、(2) リポジトリ pit-in-template(実装)。所有者の「ピットインテンプレートですらやりすぎ」は (2) への評価と読めるが、原文は「具体的な実装まで落とし込んだものは…実装」「ピットインテンプレートですらやりすぎ」と並べており、(2) を実装と呼ぶかは原文から一意に読めない。後述の #474 本文の「方針もあり」は、実装を標準の外へ移し「実装の例」とする案
- 回答 3 問い 3: 「その判断根拠が空洞化することは品質リスクとして最も気にするべき憂慮です」(根拠が空洞になる例: 数だけ満たして中身が無い運用)
- 回答 4: 外部監査は「型」。AI の判断・レビュー・承認を統計的に抜き取って確かめる

#468(open):

> pit in template などピットイン開発プロセスを採用したチームに ADR としてピットイン開発プロセスルールを求めるのは間違っている

- 事実: template の 155 ファイルが標準の ADR 番号を引く(Markdown 86 か所、スクリプトとワークフロー 121 ファイル)。標準の本文も ADR を根拠に引き、読み手は約 180 件を辿る必要がある
- 本件との関係: 標準と実装の線を引くと、template の文が引く先は「条項(章・節)だけ」の規則に統一される。実装を別リポジトリへ移すかどうかと独立に、template の文面は #468 で直す

memory `trim-and-refine-phase.md`(2026-11-27〜):

- 足すより引く・まとめるを優先。IMPL 1,046・EV 345・ADR 約 180・phase4 約 16,400 行
- 「標準の役割の線引き(所有者、2026-11-27): 再発防止策は、そのときの AI と周辺の道具に依存する。標準(プロセス)は、見えるようにして警告し、行動を促すまでが役割で、決まった対処(自動で戻す・止める)を固定しない。検知の値も一律に課さず、各社が過去のトラブルとプロダクトの特性で決める」
- 本件は、この線引きの原則(止める・戻すを標準が固定しない)を、「標準が定める」と「実装が定める」の境へ一般化する件になる

CLAUDE.md 運営の規則のうち本件に触れるもの:

- 「準拠テンプレートを触る Issue は直列」「template の push の対(template を先に push すると並行の束の `test:fields` が落ちる)」: 標準と template が同時に動く前提の運用
- 「`template/` を初期化していないと失敗する」「検査の一覧の正本は package.json の check」

### 3.3 ADR と Issue の決定の要約と、本件の案との関係

案 = 「実装(検査・ワークフロー・設定)を標準の外(template か別のリポジトリ)へ移し、『実装の例』と位置付ける」。矛盾の判定は末尾「まとめ (b)」で行う。ここでは決定の要約だけ。

| 決定 | 1〜3 行の要約 | 所在 |
| --- | --- | --- |
| ADR-0026 根拠水準マーク | 実証を欠く値・前提を、識別子・水準・見直し期限つきの公開の構文でマークする。台帳は自動生成 | adr/0026-evidence-level-marking.md |
| ADR-0027 名称 | 通称「ピットイン方式」と正式名称「AI協調型ソフトウェア開発プロセス標準」の二層。自己参照は「本標準」 | adr/0027-process-name-pit-in.md |
| ADR-0028 未達と省略の区別 | G-6 などで目的を達成する構成を示せないとき、`omitted`(省略)でなく `unmet`(未達)として冒頭に出し続ける。契約検査は未達の記録の消去を失敗させる。コンテキストに「準拠テンプレートは軸 A〜E の回答からゲートの構成を導出する」とあり、決定の 5 は template の契約検査を指す | adr/0028-unmet-gate-distinct-from-omitted.md |
| ADR-0039 適用範囲 | 適用範囲は見出しへ。案件ごとの確定(CL)と変更ごとの判定(R)を分ける | adr/0039-scope-in-heading-and-unit-of-judgement.md |
| ADR-0040 様式 | template の様式は標準 第6章の**部分集合**。必須欄の存在だけを両方向で検査。欄を落とすときは `omit` へ理由つき。標準と逆の指示は omit で登録できない。手引きは降ろさない | adr/0040-template-forms-as-subset-of-standard.md |
| ADR-0033 決定2 / ADR-0077 | 検査器の入力の欠如を「対象なし」と名乗らせず、G-5 の判定で失敗に数える。ADR-0077: check の一覧の正本を package.json、公開・配布を check の通過に繋ぐ。template が無ければ失敗(#293 J-3) | adr/0077-repository-ci-wiring-and-distribution.md |
| ADR-0052 | 配る仕組みでなく配布物そのもの(判定基準の知識ベース)を検査する | adr/0052-delivery-is-verified-at-the-destination.md |
| ADR-0061 / ADR-0084 | 実装マークの `check`(machine/presence/manual)と `plan`(scheduled/adopter)。降りていない規定を残して表示。逆向きの追跡で、template の機械が実装する規定を登録簿に載せさせる | adr/0061・0084 |
| ADR-0063 / ADR-0064 | 附属書の種別を宣言し、文末の形で規定の強さを書き分ける。template のスキルの要求・禁止の文に標準の所在か「テンプレート独自」の印を必須にする | adr/0063・0064 |
| ADR-0076 | 本文の節を単位に棚卸し。台帳の件数を網羅の証明として読ませない | adr/0076 |
| ADR-0080 | 方式中立。定めるもの/定めないものを読み分ける。**「定めない」と書くことを標準の流儀とする** | adr/0080 + overview.md 1.2 |
| ADR-0089 | 決定を固定する回帰(`scripts/regress/`)を版管理の下へ。期待値の改めに決定の引用を要する。template を対象に走る | adr/0089 |
| ADR-0200(例) | 実装の約束(安全関連部の宣言の置き場、営業日の数え方)を template 側に決めた先例 | adr/0200 |
| #222(閉) | 規定 → 実行層のトレーサビリティ。対象は「実行主体の挙動を制約する規定」。実行層はテンプレートの `CLAUDE.md`・`process.config.json`・Label Mailbox 語彙・CI の検査 | `gh issue view 222`、community/implementation-marking.md |
| #226(閉) | 適用範囲を見出しへ。標準本文の書き方だけの決定 | `gh issue view 226`、community/scope-marking.md |
| #227(閉) | template の様式が標準の第6章と別物だった。位置づけを決め、検査を置いた(→ ADR-0040) | `gh issue view 227` |
| #293 / #319(閉) | CI の結線・入力欠如の失敗・回帰の移設。審議の記録は `research/293-deliberation/`・`research/319-deliberation/` | 各 research |
| 標準の第 1 章 1.10(適合の主張) | 準拠テンプレートでは、構成が設定済みになった最初のコミットを適用の開始とする(overview.md 168・564 行)。**標準の本文が準拠テンプレートの `process.config.json` の `configured: true` を適用開始の例として名指す** | phase4-process-design/overview.md |
| phase5-implementation/template-repository.md | 「新規プロダクトの立ち上げ時に、本標準へそのまま乗るためのテンプレートリポジトリを提供します」「採用されない標準は、実証もされません」。submodule `template/` | phase5-implementation/template-repository.md |

### 3.4 vision/

- `vision/01-goal.md` の最終ゴールの 4: 「プロセスの実装・運用方法まで落とし込む — Git戦略、CI/CDゲート、AI実行環境、運用作業」。`vision/02-roadmap.md` のフェーズ 5 は「プロセス実装」(Git 戦略、CI/CD ゲート、AI 実行環境、コンピューティングリソースなど、プロセスを動かす仕組みの設計)
- `vision/03-tool-concept.md`: 最終のツールは知識ベース(プロセス定義)を docs-as-code で管理し、ツールがそれを参照する。「提案をベースにチームが修正・採択し、具体的なプロセス運用の実装方法・運用方法を策定できる」(01-goal.md 37 行)
- 含意: ロードマップ上の「実装」は、フェーズ 5(手引き。標準の規範を持たない)と、標準の外に置かれたツール(知識ベースを参照)として初めから分けてある。標準が「実装を定める」という記述は vision には無い。実装まで落とすのはプロジェクトの目標であり、標準の条項ではない

## 4. 回帰のスイート(tpl2・r3 など)

- 所在: `scripts/regress/`(`run.mjs` 395 行・`test-run.mjs`・`check-fixes.mjs`・`changed-scenes.mjs`・`suite/*.mjs` 28 本・`fixtures/`・`expected/`・`DISPOSITION.md`)。元は利用者の端末にだけあった tpl2・r3(fix288-tpl2・fix288-r3)を `research/319-deliberation/legacy-suite/` へ退避してから移したもの(ADR-0089)
- 走らせ方: `run.mjs` が template の作業ツリー(または `--template-ref` の過去の版)を一時の git リポジトリへ複製し、知識ベースを標準から作り直して(`--kb rebuild`)、場面を流す。時計は凍結(09:00 固定、r3 は日付固定。memory `regression-suites-clock-dependence`)
- 何を守るか: 各場面に `fixes`(固定する決定。ADR の決定番号・標準の節・K 番号)が宣言され、期待値の改めには決定の引用を要する。代表: ADR-0054(席・責任者)・ADR-0055・ADR-0057(組織の QA)・ADR-0075・ADR-0079・標準 2.8・3.4.3・3.5.5・3.11.3・3.12.10・5.6.2・5.8.2・G-1〜G-8。つまり**標準の条項が template の実行で守られているかを、場面ごとに確かめる**
- 親の check との結線: `test:regress` は ci-wiring が許す文字列と完全一致を求める(`REGRESS_SCRIPTS`。禁止の形を列挙しない方式)。CI は結果を成果物として残し、「変わった場面」を PR の要約へ出す(合否には使わない)
- tpl2 / r3 は、**標準が template の実行物を通して「規定が実行主体に届いたか」を確かめる装置**であり、template を別物の例にしたとき、そのままでは意味を保てない

## 5. まとめ

### (a) 検査の 3 分け

| 区分 | 検査 | 数・内容 |
| --- | --- | --- |
| A. template が無いと落ちる(入力欠如を失敗に数える。ADR-0033 決定2・ADR-0077) | lint:impl / lint:skills / lint:registry / lint:detection-values / test:template / test:fields(方向2・3)/ test:criteria(既定の入力)/ test:template-suite / test:regress | 9 本。いずれも template 配下の実在・内容・実行を読む。CI の check ジョブは `git submodule update --init template` を持つ |
| B. template を別物(実装の例)にしたら意味を失う | A のうち、意味の中心が「標準 → 実装が降りた」にあるもの: lint:impl(降ろし先 97 件=config-key 8 + template-file 89 の実在、逆向きの追跡、template の試験の結線)、test:fields(ADR-0040: 様式は部分集合)、lint:skills(ADR-0064)、test:template-suite(template の試験を親が流す)、test:regress(標準の決定を template の実行で固定)、test:template・test:criteria の複製の乖離(ADR-0052) | 例にすると、検査は「標準が例の実在を求める」から「例が自分で標準へ追随する」へ向きが変わる。検査を例の側へ移すか、親に置いて例を必須の入力にし続けるかの二択になる(後者は現状の姿) |
| C. 標準だけで残せる | lint:text / lint:tone / lint:evidence / lint:scope / lint:refs(section-refs・fixes・decision-refs・adr-links・claim-terms・failure-projection)/ lint:provisions / lint:dekimasu / lint:figures / brand:check / lint:sources / lint:citations / test:edition / test:engine / lint:stage-table / test:impl / test:plan-issues / test:ci-wiring / lint:ci(読むのは ci.yml。条件3 の template 取得を除く)/ build | 約 20 本。標準の本文・登録簿・エンジン(`src/lib`)・出典台帳・サイトの生成。template を使うのは試験が作る一時の偽物だけ |

- 中間の区分: lint:registry・lint:detection-values・test:criteria は「標準の表や YAML」と「template の機械可読版」の一致を見る。機械可読版が標準側の生成物(`template:kb`)なら C に移せる。template 側の独自の読み取り(`scripts/gate/detection-values.mjs`)を見る部分は B
- 実装マークの `state=delivered`(955 件)は、template の実在を意味する。「例」に移すと、delivered の意味が「標準の外の例に実在する」へ変わる。**マークの件数(1,072)・台帳・棚卸し(ADR-0076)は、template を実装の代表と見る前提で数えている**
- 標準の本文が template を名指す箇所: overview.md 1.10.1(適用開始のコミット)・採用の手引き・附属書の IMPL 注記(約 400 か所以上と推定。数え直していない)

### (b) 本件の案と突き合わせるべき既存の決定

判定の凡例: 矛盾しない / 矛盾する / 置き換えが要る / 前提を確かめる

| 決定 | 判定 | 理由 |
| --- | --- | --- |
| 2026-11-16 所有者の方針「準拠テンプレートは標準を体現し連動させる(使えば準拠する)」 | **置き換えが要る可能性が最大** | 案は「体現」から「例」へ下げる。ただし 11-28 の所有者の回答(#473 回答 3)は「ピットインテンプレートですらやりすぎ」で、後の日付。11-16 を置き換えるか、二つを両立する読み(標準が決める範囲は結果と準備物までで、template は連動して使う実装の 1 つ)を所有者に確かめる要がある |
| memory `template-embodies-standard`「テンプレートの範囲を狭める案は出さない」 | 古い可能性(要確認) | これは Claude の解釈であって所有者の原文ではない。11-28 の原文が優先する |
| 2026-11-16 の受付の 3 つの問い・降ろし方(機械の検査・様式の欄・手引き) | 矛盾しない | 「何を降ろすか」の選び方であり、線引きの基準の素材になる。問 1(条文は満たすべき結果と証跡まで)は案と同じ向き |
| 所有者 2026-11-27 の線引き(標準は見えるようにして警告し行動を促すまで。対処を固定しない。検知の値は各社) | 矛盾しない | 案の根拠になる。「定めるのは結果・準備物・定義が無いときの扱い」へ一般化できる |
| ADR-0028 未達と省略の区別 | 矛盾しない(実装の部分は要整理) | 決定の本体(未達を省略と区別し、冒頭に出し続ける)は標準の要求。決定 5 の契約検査と表示は実装で、「例」へ移る側。標準の条項に「表示し続ける」結果が書かれていれば足りる |
| ADR-0040 / #227 様式は第6章の部分集合・必須欄の両方向検査 | **置き換えが要る** | 前提が「template の様式は標準の様式の簡略版であり、標準が欄の実在を検査する」。例に下げると、標準が検査する根拠は「例」ではなく、準備物の項目(標準側)になる。決定 1・3・4(部分集合・omit・逆の指示を書かない)は標準の様式を採用者が使う側の規則として残せるが、検査の置き場が変わる |
| #222 / 実装マーク(implementation-marking.md) | **置き換えが要る**(語の定義) | 「降ろし先」=案件の実行層=template。planned・adopter・presence の概念は既に「標準は条文、実装は別」の線を引いている。delivered の対象が例になると、delivered は実装の例で見つかったことを言い、適合の主張に使えない旨を明示する要がある |
| #226 / ADR-0039 適用範囲 | 矛盾しない | 本文の書き方。template に依らない |
| ADR-0033 決定2・ADR-0077 入力の欠如を失敗に数える | **前提を確かめる** | 「例」を任意の入力にすると、template が無い環境で A 区分の検査は「入力なし」になる。ADR-0033 は「対象なしと名乗らせない」ので、例を入力にしないなら、検査も外す(実施しない検査を通過に数えない)。外した検査を採用者に任せることを開示する |
| ADR-0052 配布物を検査する(知識ベースの複製) | 矛盾しない | 標準が配る知識ベース(`dist/standard`・`template:kb`)は標準の生成物。「標準の機械可読版」として標準側に残せる。template 内の複製との乖離検査は、例の側の義務になる |
| ADR-0061 / ADR-0084 `check`・`plan=adopter`・逆向きの追跡 | 部分的に置き換えが要る | `plan=adopter` と `check=manual` は、標準が実装を課さないと決める受け皿としてそのまま使える(案の足場)。逆向きの追跡(template の機械ファイルは登録簿に載る)は、template を標準の実装と見る前提 |
| ADR-0064 スキルの文に標準の所在か「テンプレート独自」の印 | 置き換えが要る | 「テンプレート独自」の印は、すでに「標準が定めない template の領分」を認める。例にすると、印の検査は例の側へ移る。なお #468(採用者に ADR を辿らせない)と同方向 |
| ADR-0089 回帰を親に置く | **置き換えが要る** | 場面は標準の決定を template の実行で守る。例にするなら、回帰は例のリポジトリへ移し、親は「どの標準の版でどの例の版が通ったか」の記録だけを持つ形になる。試験が通らない時の標準の公開の止め方(CI の needs)も決める |
| ADR-0026 根拠水準 / ADR-0027 名称 | 矛盾しない | 実証を欠く判断(線の置き所)は EV で開示する。名称は「通称=ピットイン方式」と「リポジトリ pit-in-template」の語を分ける注意が要る(例を「ピットイン方式」と呼ばない) |
| ADR-0080 方式中立・「定めない」の流儀 | 矛盾しない | 「定めないと決めた」と書く流儀が、案の「実装は標準の外」と同じ形 |
| ADR-0076 棚卸し | 前提を確かめる | 件数の数え方(delivered=template に実在)が変わる |
| 標準 1.10.1(適用の開始=`configured: true` の最初のコミット) | **置き換えが要る** | 標準の本文が template の構成ファイルを名指して適用開始を定義している。例にするなら、適用の開始は「テーラリングの宣言を記録に残した時点」(標準の側の定義)を正とし、template はその 1 例とする |
| phase5 `template-repository.md`(「本標準へそのまま乗る」) | 置き換えが要る(書き換えで足りる) | 手引きの頁。位置づけの文を例の書き方へ |
| #468(採用チームに ADR を辿らせない) | 矛盾しない(同方向) | template の文面は条項だけを引く。線引きの基準が決まれば、どの文を template へ残すかも決まる |
| #473 回答 3 問い 3「判断根拠の空洞化が最大の憂慮」 | 矛盾しない(最大の制約) | 線を引くと「数が合えば通る」実装に標準が依存しなくなる一方、標準が例を外すと、各社が空洞な実装で適合を名乗るリスクが残る。標準は「何を残すか」(証跡の存在と対応づけ)を課し、機械が中身まで閉じない部分は manual と adopter で開示する(CLAUDE.md の「統制の閉じ方」と同じ) |
| CLAUDE.md の運営規則(template を触る Issue は直列、push は対) | 前提が変わる | 実装を別リポジトリへ移すと、標準と実装の変更が分離し、直列と対の push の必要が緩む。一方、標準の改訂に実装が追随しているかを見る検査の置き場を決める要 |

### (c) 残りの Issue の分類

| Issue | 題と残っていること(2 行以内) | 分類 |
| --- | --- | --- |
| #457 | 通常の変更で「なぜそう作ったか」を残す範囲が狭い(G-6 基準3 はコア機能と規則に当たる変更だけ)。標準の範囲を広げるか、結果と証跡で足りるかを決める | 両方(主は標準の本文。降ろす先は template の PR 様式。#473 回答の「追える状態」と重なる) |
| #458 | 試行(T-1)を誰が何を承認すれば始められるかが一意でない(規程の改定かサンドボックスか、層1 の要否、署名の意味)。附属書D・第8章の記述の整合 | 標準の本文だけ |
| #460 | 既存の決裁(SAP などのワークフロー)の証跡を、判定の記録として受け入れる条件が無い。様式へ戻る構成になっている | 両方(主は標準の本文の受け入れ条件。PR の承認レビューの扱いは template) |
| #462 | 「検証を弱める変更」の一覧が `check-pr.mjs` の `.slice(0, 20)` で切れ、省いた行の所在が出ない。G-6 の必須の確認事項が見えなくなる | 準拠テンプレートの実装の件(標準は IMPL-0204 で既に求めている) |
| #463 | 附属書H H.10 の既存の枠組みとの対応が ISO 9001 だけ(ISMS・SOC 2・金融・医療が無い) | 標準の本文だけ |
| #464 | 読み手に合わせて整えるレビューパッケージが手引き(phase5)にとどまり、IMPL も template も無い | 両方(標準は手引き止まりにするか規定にするか。実装は template の機械の段)。線引きの典型 |
| #466 | 人がボトルネックになる既定(L1 ベースライン・狭い委任・「作るのを止める」)の見直し。ADR の原則に関わる(重) | 標準の本文(ADR の原則)。template は既定値の追随 |
| #468 | template の 155 ファイルと標準の本文が ADR 番号を根拠に引く。採用チームに辿らせない | 両方(template の文面が主、標準の本文の引き方も) |
| #469 | 取り込み=本番の組織で「出荷=客の目に触れる時点」と読み替えられるか(安全に関わる。重) | 標準の本文(出荷の定義)。確かめる条件は template の機械の段に降ろせるか |
| #361 | node・python・go の実環境での持ち込みと、G-8 ごとの実環境の読み取り(IMPL-0318) | 準拠テンプレートの実装の件(実証) |
| #452 | IMPL-0200(書き込みの既定の拒否 `guard-write`)の実測。採用事例か試行の履歴が得られるまで待つ | 準拠テンプレートの実装の件(待ち) |

分類の含意(主観を含む。審議で確かめる): 11 件のうち、標準の本文だけは #458・#463 の 2 件、実装だけは #462・#361・#452 の 3 件、残り 6 件(#457・#460・#464・#466・#468・#469)は両方に触れるか、標準が主で実装が追随する。**#474 の線が先に決まると、両方の 6 件は「どちらに書くか」が決まる**。順番を「#474 を先に」とした所有者の指示(ok)は妥当。

## 6. 調査で見つけた補足

1. 標準の本文が template を名指す箇所は 1.10.1 の適用の開始、phase5 の手引き、実装マークの注記(`note=` の文に「準拠テンプレートの ship-evidence」など)に及ぶ。線を引くなら、これらの書き方(「例の template では…」)の統一が要る
2. `plan=adopter` と `check=manual` は、標準が「実装は採用者の側」と宣言する既存の型である。#474 の案は、これを例外から原則へ広げる形に当たる。広げ方(全マークを adopter 既定にするか、条項ごとに選ぶか)は審議の論点
3. CI の check が template の検査で落ちると、標準の公開・配布も止まる(needs)。例へ移すなら、標準の公開が例の障害に引きずられない独立性を得る
4. この作業ツリーで template が空だったため、template の試験の数・登録簿に載るファイルの数・template 側の IMPL 引用の数は未確認。必要なら別担当が `git -c core.longpaths=true submodule update --init template` の後に数える
5. 外部の調査(標準と参照実装を別に持つ先例)は本調査の範囲外
