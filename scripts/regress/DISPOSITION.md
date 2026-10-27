# 回帰の試験の処置の表(#319 裁定 R-1.1)

元のスイートは `research/319-deliberation/legacy-suite/`(退避物を手を加えずに写したもの。`SHA256SUMS` 付き)にあります。この表は、元のスイートの各ファイルを移したか、移さなかったかと、その理由を記録します。移さなかった場面について、固定していた決定がほかの試験で覆われているかを書きます。覆われていないものは、この表に載せたまま表示し続けます。

一致の確認(p302 との場面ごとの照合)と、いま落ちる場面の一覧は `research/319-deliberation/port-results.md` にあります。

## 移したもの

| 元のファイル | 移した先 | 固定する決定(宣言の fixes。節ごとの fixes と場面の名前の K 番号が加わる) |
| --- | --- | --- |
| `fix288-tpl2/suite/v3.mjs`(組A の直しを当てた版) | `suite/v3.mjs` | #284・#285。節ごとに K50・K51・K55・K60・K61・K63・K65・K12・K15・K42 |
| `fix288-tpl2/suite/v3b.mjs` | `suite/v3b.mjs` | #284・#285。K3・K37・K50・K51・K62 |
| `fix288-tpl2/suite/scenarios.mjs` | `suite/scenarios.mjs` | #284・#285。ADR-0028、K5・K12・K13・K15・K32・K37・K39・K40・K50・K51・K60・K61・K62・K67・K74 |
| `fix288-tpl2/suite/new.mjs`(組A の直しを当てた版) | `suite/new.mjs` | #284・#285。K3・K16・K33・K37〜K40・K42・K60・K62・K65・K70 |
| `fix288-tpl2/suite/replay.mjs` と `reverify-scenarios/in/` の 24 件 | `suite/replay.mjs`、`fixtures/replay-in/` | #284・#285。ADR-0066、K37・K38・K42・K55・K60・K62・K65・K70 |
| `fix288-tpl2/suite/tz.mjs`(組A の直しを当てた版) | `suite/tz.mjs` | #284・#285。K60・K65 |
| `fix288-tpl2/suite/acquire.mjs` | `suite/acquire.mjs` | #284・#285。K42・K75 |
| `302-310/implC/tpl2-new/suite/unit.mjs`(組C の版) | `suite/unit.mjs` | #284・#285。K55・K62・K65 |
| `fix288-tpl2/suite/matrix-sweep.mjs` | `suite/matrix-sweep.mjs`(期待値 `expected/matrix-sweep.json` を足した) | #284・#285。K60・K62・K65 |
| `fix288-tpl2/suite/stages.mjs` | `suite/stages.mjs` | #286 |
| `fix288-tpl2/suite/s5-init-pr.mjs` | `suite/s5-init-pr.mjs` | #286。K64 |
| `fix288-tpl2/suite/verify-n.mjs`(N7 を除く) | `suite/verify-n.mjs` | #286 |
| `fix288-tpl2/suite/t288.mjs` | `suite/t288.mjs` | #288。ADR-0057 |
| `fix288-tpl2/suite/t288b.mjs` と `fix288-tpl2/probe-policy.mjs` | `suite/t288b.mjs`、`fixtures/probe-policy.mjs` | #288。ADR-0057 |
| `fix288-tpl2/suite/trial.mjs` | `suite/trial.mjs` | #288。ADR-0057 |
| `fix288-tpl2/suite/lib288.mjs` | `suite/lib288.mjs` | (補助) |
| `302-310/implC/tpl2-new/suite/lib.mjs`(組C の版) | `suite/lib.mjs` | (補助。場面の記録・fixes・落ちることを期待する印・拒否の理由の照合を足した) |
| `fix288-tpl2/fakebin/gh`、`fix288-tpl2/suite/mockgh-prs.mjs` | `lib/bin/gh`(Node の代役 1 つにまとめた) | (補助) |
| `fix288-tpl2/runsuite.sh`・`runall2.sh`・`suite/fresh.sh`(組C の版)・`302-310/implA/tpl2-setup.sh`・`fix288-tpl2/sync.sh` | `run.mjs` | (補助。Node へ置き換えた) |

新設: `suite/clock.mjs`(時刻を明示した場面。裁定 R-3)、`suite/adjust.mjs`(事前点検への調整を外すと初期化が止まること。裁定 7.5 J-4)、`lib/clock.mjs`(時計の先読み)、`lib/unfrozen-clock.mjs`(止まらない時計の検出)、`check-fixes.mjs`(決定の実在の検査。`npm run lint:refs` から呼ぶ)、`test-run.mjs`(実行役の振る舞いの試験。`npm run test:regress` が先に流す)。

第2段(#319 裁定 7.5)で、落ちていた 47 場面の直しを当てました。入力を直したスクリプト(replay・s5-init-pr・stages・t288・t288b・lib288・trial が使う lib288)は、いまのテンプレートの様式と決定に合わせてあります。t288・t288b・trial は、#312 より前のテンプレート(p302 など)では、D-0 の非推奨の兼務の記録の表が無いため、置き換えの確認で止まります(黙って空振りさせないための確認です)。直しの一覧と引いた決定は `research/319-deliberation/implementation.md` にあります。

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
