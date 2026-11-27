# #466 まとまり 1: 独立の突合 1 巡目(verify-01.md)の所見の直し

- 日付: 2026-11-28。裁定は `ruling.md` §13 に従った。L5・L6 は変えていない
- 実行: Windows・node 26。全量の `npm run check` と回帰の全量は流していない

## 1. 所見ごとの直し

| 所見 | 直した所 | 変えた試験の期待と理由 | マーク |
| --- | --- | --- | --- |
| H1 | `autonomy.mjs` の `parseDefectRows` が「状態」の列を読む(`status`。列が無い旧い台帳・それ以外の記入は未解決)。一般の案件の警告は状態が解決済みの行に出さず、登録し直しの分岐(`registeredAt > d.date`)は一般の案件で外した。CL1 以上・規制業・未記入は状態を見ず、現行のまま止める。本文 HAB 5.4.6 の定義・消える時、IMPL-0284 の note | `test-check-delegation` の「解決で消える」を状態の列で書き直した(AI 起因なしの場面は別の名で残した)。足した場面: 未解決のまま登録し直しても警告が消えない・状態の列の読み・線の内側は解決済みでも止まる | IMPL-0284 の note を改めた |
| H2 | `config.mjs`: 未定義は未定義(`observationWindowInfo` に `defined`)。下限は `OBSERVATION_WINDOW_MIN = 1`。「長くするだけ」の制約を外し、向きを問わず記名と理由を保つ。`OBSERVATION_WINDOW_DEFAULT` は名目の 2 か月に改め、定めていない間の表示と取得の長さにだけ使う。`generate-profile.mjs` の入口の検査・D-0 の窓の文・変化点のコメント、`kinds/settings.md`・`reference/input.md`・README。本体: ADR-0273 決定1(末の箇条・置き換えの表・課さないと決めたこと)、ADR-0129 の状態の節、HAB 5.4.6 の表 2 行目・EV-0146 の対象と本文・IMPL-0285・IMPL-0516(gate-criteria)の note | ADR-0129 決定2(窓の下限 2・長くするのは緩める向き)の置き換えに伴う。`test-check-delegation`: 下限の拒否の入力を 0 にし、1 の受理・短くする向きの受理を足した。窓の表示は「(既定)」「既定より長い」の文をやめ、定めていないときは「定めていない」と出す期待にした。履歴の固定の入力(h4・D-0 の表)へ初回の決定(2 か月)を足した(未定義の間は検知が働かないため)。`test-loosening-decider`: 拒否の入力を 1 から 0 へ | EV-0146 の対象を名目の 2 か月へ改めた(番号は再利用) |
| H3 | 本体: 第4章 G-6 の独立した人の確認の条件の箇条(適用を箇条の中に書いた)、IMPL-1068(delivered・machine。試験 `test-record-independence`。インベントリへ登録)、EV-0388(E0)、ADR-0272 に決定 8。template: `test-record-independence` に `IMPL-1068:ok`・`:ng` の目印 | — | IMPL-1068・EV-0388 |
| H4・M1・M5 | README(225・232・835-839・841)、`kinds/settings.md`(reworkBaseline・observationWindow)、`templates/00-d0-governance.md`(止める条件を全案件と CL1 以上・規制業・未記入に分けて書いた)、`autonomy.mjs` 冒頭のコメント、`config.mjs` の `windowLengthText`、`generate-profile.mjs` の生成文。直書きの 30 件・5 件・既定 2 か月を残していない | 窓の表示の期待(上の H2) | — |
| M2 | `detection-values.mjs`: `definedValue(field, day)`・`observationWindowDefined(config, day)` が、記録した日の実在・AI の名義でないこと・評価の日より前(`monthStart(asOf)`)を照らす。`detectionValueProblems` が `recordedAt`・日付の順・AI の名義を拒む。整数だけの形は通す | `test-check-delegation` に 2 場面を足した(履歴の検査・履歴の効力) | — |
| M3 | `next.mjs`: 委任の変更種別が無い構成でも `undefinedValueNotes`(定めていない値の行)を `/pit` に出す | `test-next-records` に 2 場面を足した | — |
| M4 | `config.mjs` の `approvalByCorePaths`: 安全重要度が `cl0` と記入されているときだけ緩める | `test-control-approval` に未記入の場面を足した(74 件) | — |
| L1〜L4 | L1: ADR-0273 の「のまま」を「これまでの既定値から、組織が定める値へ改める」へ。L2: ADR-0274 の影響を段 F1 の結果へ(確かめた・確かめられなかった・案 D へ退かない)。L3: 「人が触る場所」の見出しに規制業の除外を足し、HAB の表 1 行目の行の中に未記入の扱いを書いた。L4: process-audit の文 | — | — |

## 2. 流した試験(数だけ)

- template: test-check-delegation 83 場面・test-review-queue 64・test-aggregate-records 226・test-assurance-period 31・test-next-records 159・test-control-approval 74・test-roster-rules 232・test-tailoring-declaration 16・test-delegation-wiring 27・test-flow-observation 33・test-record-independence 9(PR の経路の 2 件は Windows で読み飛ばし)・test-adoption 123・test-init-g5 208・test-loosening-decider すべて通過
- test-g5-aggregate は 6 / 61 件が落ちる。ワークフローの目印の試験で、この直しはワークフローを触っていない。素の版との照合はしていない(Windows の環境の差と見る)
- 本体: lint:refs・lint:sources・lint:evidence(367 件)・lint:impl・lint:scope・lint:tone・lint:citations・test:fields・check-detection-values はすべて通過。textlint は触った md が通過。evidence:write・impl:write・scope:write で台帳を再生成した

## 3. 直せなかった所・残し

- `flow-observation.mjs` の `windowMonths = OBSERVATION_WINDOW_DEFAULT` は名目の値のまま(L5。変えない裁定)。
- 窓を定めていない構成で、`generate-profile.mjs` の変化点の向き(長くする = 緩める)の算出は、前の値を名目の 2 か月で比べる従来のまま残した。向きは記録の分類で、拒否には使わない
- 回帰の全量は流していない(push の前に 1 回)

## 4. 2 巡目の突合が見る差分の範囲

- template(`git -C template log c8d4e27..d4-466`): `af9321e`(本体の挙動・手引き・試験)、`f338497`(試験の目印・入口の試験)。`fa2f047` までは 1 巡目の対象。bundle: `466-tpl-fix1-1.bundle`・`466-tpl-fix1-2.bundle`
- 本体: `385238b8`(docs(standard): 独立の突合 1 巡目の所見を本文・ADR・マークへ反映する)
