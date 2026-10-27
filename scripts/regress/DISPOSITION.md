# 回帰の試験の処置の表(#319 裁定 R-1.1)

元のスイートは `research/319-deliberation/legacy-suite/`(退避物を手を加えずに写したもの。`SHA256SUMS` 付き)にあります。この表は、元のスイートの各ファイルを移したか、移さなかったかと、その理由を記録します。移さなかった場面について、固定していた決定がほかの試験で覆われているかを書きます。覆われていないものは、この表に載せたまま表示し続けます。

一致の確認(p302 との場面ごとの照合)と、いま落ちる場面の一覧は `research/319-deliberation/port-results.md` にあります。

## 移したもの

| 元のファイル | 移した先 | 固定する決定(宣言の fixes。節ごとの fixes と場面の名前の K 番号が加わる) |
| --- | --- | --- |
| `fix288-tpl2/suite/v3.mjs`(組A の直しを当てた版) | `suite/v3.mjs` | #284・#285。節ごとに K50・K51・K55・K60・K61・K63・K65・K12・K15・K42 |
| `fix288-tpl2/suite/v3b.mjs` | `suite/v3b.mjs` | #284・#285。K3・K37・K50・K51・K62 |
| `fix288-tpl2/suite/scenarios.mjs` | `suite/scenarios.mjs` | #284・#285。ADR-0054 決定1・ADR-0055 決定3・ADR-0079 決定7・#296(§8 X-5 で ADR-0028 から改めた)、K5・K12・K13・K15・K32・K37・K39・K40・K50・K51・K60・K61・K62・K67・K74 |
| `fix288-tpl2/suite/new.mjs`(組A の直しを当てた版) | `suite/new.mjs` | #284・#285。K3・K16・K33・K37〜K40・K42・K60・K62・K65・K70 |
| `fix288-tpl2/suite/replay.mjs` と `reverify-scenarios/in/` の 24 件(23 件は手を加えずに写した。`s4-acc3.json` は ADR-0066 決定1 により独立レビュアを c から a へ改めた。§8 X-15) | `suite/replay.mjs`、`fixtures/replay-in/` | #284・#285。ADR-0066 決定1(§8 X-5 で ADR-0066 の全体から改めた)、K37・K38・K42・K55・K60・K62・K65・K70 |
| `fix288-tpl2/suite/tz.mjs`(組A の直しを当てた版) | `suite/tz.mjs` | #284・#285。K60・K65 |
| `fix288-tpl2/suite/acquire.mjs` | `suite/acquire.mjs` | #284・#285。K42・K75 |
| `302-310/implC/tpl2-new/suite/unit.mjs`(組C の版) | `suite/unit.mjs` | #284・#285。K55・K62・K65 |
| `fix288-tpl2/suite/matrix-sweep.mjs` | `suite/matrix-sweep.mjs`(期待値 `expected/matrix-sweep.json` を足した) | #284・#285。K60・K62・K65 |
| `fix288-tpl2/suite/stages.mjs` | `suite/stages.mjs` | #286。§8 X-5 で節ごとに決定を足した: 標準 2.8・3.5.5・3.11.4・3.12.10・G-1・G-2・G-4・G-7・G-8、ADR-0018、ADR-0075 決定4、ADR-0079 決定3、K42・K60 |
| `fix288-tpl2/suite/s5-init-pr.mjs` | `suite/s5-init-pr.mjs` | #286。K64 |
| `fix288-tpl2/suite/verify-n.mjs`(N7 を除く) | `suite/verify-n.mjs` | #286。§8 X-5 で節ごとに決定を足した: 標準 2.8・3.11.3・5.8.2・7.3・G-1・G-7、ADR-0018、ADR-0036 決定1・決定2、ADR-0054 決定9、ADR-0055 決定4、ADR-0078 決定1、K42・K60 |
| `fix288-tpl2/suite/t288.mjs` | `suite/t288.mjs` | #288。ADR-0057 決定3・8・9・10・12(§8 X-5 で ADR-0057 の全体から改めた)、標準 3.4.3・3.12.11・7.11・G-1、K60 |
| `fix288-tpl2/suite/t288b.mjs` と `fix288-tpl2/probe-policy.mjs` | `suite/t288b.mjs`、`fixtures/probe-policy.mjs` | #288。ADR-0057 決定9・12、ADR-0054 決定5・9(§8 X-5 で改めた)、標準 3.4.2・3.4.3・3.8.1・3.12.11・7.7.8・7.11・G-1・G-7 |
| `fix288-tpl2/suite/trial.mjs` | `suite/trial.mjs` | #288。ADR-0057 決定9・11・12(§8 X-5 で改めた)、標準 5.6.2 |
| `fix288-tpl2/suite/lib288.mjs` | `suite/lib288.mjs` | (補助) |
| `302-310/implC/tpl2-new/suite/lib.mjs`(組C の版) | `suite/lib.mjs` | (補助。場面の記録・fixes・落ちることを期待する印・拒否の理由の照合を足した) |
| `fix288-tpl2/fakebin/gh`、`fix288-tpl2/suite/mockgh-prs.mjs` | `lib/bin/gh`(Node の代役 1 つにまとめた) | (補助) |
| `fix288-tpl2/runsuite.sh`・`runall2.sh`・`suite/fresh.sh`(組C の版)・`302-310/implA/tpl2-setup.sh`・`fix288-tpl2/sync.sh` | `run.mjs` | (補助。Node へ置き換えた) |

新設: `suite/clock.mjs`(時刻を明示した場面。裁定 R-3。時計の場面は ADR-0089 決定5、next_review の場面は標準 2.8 を固定する)、`suite/adjust.mjs`(事前点検への調整を外すと初期化が止まること。裁定 7.5 J-4)、`lib/clock.mjs`(時計の先読み)、`lib/unfrozen-clock.mjs`(止まらない時計の検出)、`check-fixes.mjs`(決定の実在の検査。`npm run lint:refs` から呼ぶ)、`test-run.mjs`(実行役の振る舞いの試験。`npm run test:regress` が先に流す)。

第2段(#319 裁定 7.5)で、落ちていた 47 場面の直しを当てました。入力を直したスクリプト(replay・s5-init-pr・stages・t288・t288b・lib288・trial が使う lib288)は、いまのテンプレートの様式と決定に合わせてあります。t288・t288b・trial は、#312 より前のテンプレート(p302 など)では、D-0 の非推奨の兼務の記録の表が無いため、置き換えの確認で止まります(黙って空振りさせないための確認です)。直しの一覧と引いた決定は `research/319-deliberation/implementation.md` にあります。

## 宣言した決定の監査(§8 X-5)

第2段までの `fixes` には、決定の中身を持たない引用が混じっていました。§8 X-5 に従い、すべての `fixes` を監査しました。

- `scenarios.mjs` の節3 と節F が引いていた ADR-0028 は、テンプレートの未達と省略の区別の ADR であり、引いた場面(兼務の扱い・人の名簿の確認)を定めていない。節3 は ADR-0054 決定1・ADR-0055 決定3、節F は ADR-0054 決定1・ADR-0079 決定7・#296 へ改めた
- 決定を番号で分けた ADR の全体(ADR-0057・ADR-0066)の引用は、決定の番号へ改めた
- Issue だけを引いていたスクリプト(stages・verify-n・clock・t288・t288b・trial)は、節ごとに ADR の決定・K 番号・標準の条項を足した。Issue は追記としてだけ残す
- K 番号の対応は、`research/phase4-standard/284-285-fix-spec*.md` の見出しの中身と照らした。検査(`check-fixes.mjs`・`run.mjs`)は、場面ごとに決定に当たる識別子が1件以上あることと、その実在(ADR は決定の節の見出し、Issue は `src/data/issue-index.tsv`)を確かめる

## 文言の有無を確かめる場面の棚卸し(裁定 R-1.1、§8 X-7)

テンプレートの源の文(指示文・様式・ワークフロー)に、ある文字列があるかだけを確かめる場面を棚卸ししました。決定の中身が挙動として確かめられる場面は、挙動を確かめる形へ改めました。決定そのものが「誘導層に基準の文がある」ことである場面は、文言の確認が決定の中身に当たるため、文言の確認のまま残します。生成物(初期化・`/process-change` が書く `CLAUDE.md` の生成区間・構成書・D-0・CODEOWNERS)を読む場面は、生成の振る舞いの観測であり、棚卸しの対象に含めません。

| 場面(スクリプト) | 以前の確かめ方 | 処置 | 理由 |
| --- | --- | --- | --- |
| K62 の push の契約検査(v3b) | `gate-g5.yml` の本文に `push: branches: [main]` と `--base "$BEFORE"` の文字列があるか | **挙動へ改めた**。YAML として読み、push で起動し push のときだけ走る手順があることを確かめ、その手順を `bash -c` で `BEFORE=HEAD~1` として流し、変化点を経ない書き換えを検出して落ちることを確かめる | 決定(K62)の中身は、push の後に契約検査が書き換えを検出することであり、流して確かめられる |
| N9 の D-0 節3 の手で書く行と版(verify-n) | 様式 `templates/00-d0-governance.md` に「ほかの行は手で書きます」「`version` は上げません」の文があるか | **挙動へ改めた**。生成した D-0 の「例外承認」の行を記入しても版を上げずに D-0 の検査が通り、空欄の数が1減ること、版だけを手で上げると検査が落ちることを確かめる。最後に D-0 を戻す | 決定の中身は、手で書く行の記入が版と検査に及ぼす振る舞いであり、流して確かめられる |
| K65 の取り消せない操作の定義(v3) | `CLAUDE.md` に「取り消せない時間帯」の語があるか | **文言の確認のまま残し、強めた**。`CLAUDE.md` と `.claude/**/*.md` の定義の行をすべて集め、どの行も基準の2文を伴うことを確かめる(ADR-0053 決定1・ADR-0078 決定2) | 決定そのものが、誘導層の定義に効果の判定の基準を置くことである。挙動(AI の担い手が止まるか)は試験で観測できない。集め方を広げた結果、`handoff.md` の2行の欠けが見つかり、テンプレートの側を直した |
| K65 の「不可逆4操作」の不在(v3) | `CLAUDE.md` に「不可逆4操作」の語が無いか | **文言の確認のまま残す**。決定を ADR-0053 決定2 へ分けた | 決定そのものが、列挙による定義を誘導層から外すことである |
| N8 の結果欄の2値(verify-n) | `.claude/skills/gate/reference/recording.md` に「結果欄には2値の語だけを書く」の節と注記の置き場の文があるか | **文言の確認のまま残す** | 結果欄の値の読み方(「通過」「差し戻し」の完全一致。注記を足した値は通過に数えない)は、テンプレートの `next.mjs` と出荷の証跡の集約(`aggregate-evidence.mjs`)が挙動として持ち、同じスクリプトの N8 のほかの場面が確かめる。この場面が固定するのは、記録を書く AI の担い手への指示文の存在であり、指示に従うかは試験で観測できない |
| N9 の企画書の様式を写させない(verify-n) | `.claude/skills/process-init/SKILL.md` に「企画書の様式(…)をここへ写さない」の文があるか | **文言の確認のまま残す** | 決定の中身は、初期化のスキル(AI の担い手への指示)が写さないことである。初期化の機械の部分は企画書を書かないため、挙動として観測する対象が無い |
| SessionStart のフックの保持(stages) | 初期化の後の `.claude/settings.json` に `hooks.SessionStart` があるか | 対象外(挙動) | 初期化が設定を書き換えた後の出力の観測である |

## 移さなかったもの

| 元のファイル(場面の数) | 理由 | 固定していた決定 | ほかの試験で覆われているか |
| --- | --- | --- | --- |
| `fix288-r3/`(`setup.mjs`・`trial.mjs`・`scen.mjs` 27・`scen2.mjs` 11・`scen3.mjs` 12) | 前の段の状態を引き継ぐ連鎖で、単独で流せない。採用者の製品のコード `adopter/src/inspection.js` を作るスクリプトが退避物に無く、再現できない | #288 第3巡の指摘 1〜10(導入前の検証の記録の目隠し・tally の人の層・類型E の転記・記録の要約値と verify・記録だけのコミットの欠落・外部向けの伏せ方・代理者の候補の数え方)。ADR-0057 | **一部だけ**。`suite/trial.mjs` が導入前の検証の run・seal・tally・基準の改変を、テンプレートの `test-adoption.mjs`・`test-env-check.mjs` が一部を確かめる。scen2・scen3 の verify(記録の要約値)と、外部向けの伏せ方・代理者の候補の数え方は、場面ごとの突合をしていない。**覆われていない可能性がある 50 場面として表示し続ける** |
| `fix288-tpl2/suite/ta.mjs`(13 で中断) | p302 でも同じ箇所で中断する(`seeded.human` が無い)。`trial.mjs` が後継 | #288 第2巡(導入前の検証) | はい(`suite/trial.mjs`) |
| `fix288-tpl2/suite/trial-r7.mjs`(35) | `trial.mjs` との差は、合否の基準の記入日時の時刻(09:00 / 00:00)の 3 行だけ。時計を宣言した時刻(12:00)に止めると、同じ確認になる。p302 の結果は 35 場面とも同じ | #288 第2巡 | はい(`suite/trial.mjs`) |
| `fix288-tpl2/suite/tok.mjs` | 合否を持たない計測(CLAUDE.md の容量とトークンの推定) | なし | 対象外 |
| `fix288-tpl2/suite/matrix.mjs`(30) | `matrix-sweep.mjs` と本文が同じ(作業用の複製の名だけが違う)。matrix-sweep へ統合した | K60・K62・K65 | はい(`suite/matrix-sweep.mjs`。期待値つき) |
| `verify-n.mjs` の N7(3) | 入力 `tmp/eval286-novice2/harness/p/a-pr*.md` が退避物に無い。p302 でも「本文がある」の場面で落ちていた | #286 N7(文書だけの PR のリスク区分) | はい(テンプレートの `test-check-pr.mjs` の「落ちる場面(リスク区分。#286 N7)」。ただし log-A の本文そのものではない) |
| `runall2.sh` が流したテンプレートの試験 3 本(`test-check-delegation`・`test-check-pr`・`test-init-g5`) | テンプレート自身の試験。テンプレートの `gate-g5.yml` が流す | — | 親の `npm run check` から流す結線は裁定 R-6(第2段) |
| `fix288-tpl2/mockgh.mjs`(MOCK_G5) | スイートのどのスクリプトも読まない | — | 対象外 |
| `fix288-tpl2/patch-agg.cjs`・`patch-t288.cjs` | 試行のパッチ。試験ではない | — | 対象外 |
| `fix288-tpl2/*.log`・`fix288-r3/setup.log`・`302-310/**/run*.log` | 過去の実行の記録 | — | 対象外 |
| `302-310/implA/suite-A/*`・`fix-suite.py`・`run-some.sh` | 組A の作業の写し。`fix-suite.py` の直しは、移した v3・new・tz に当ててある | ADR-0066(決定 A-4) | 移した版に含む |
| `reverify-scenarios/in/` の残り 54 件・`lib.sh`・`details.md`・`report.md` | replay が読まない(再検証の当時の入力と記録) | — | 対象外 |
