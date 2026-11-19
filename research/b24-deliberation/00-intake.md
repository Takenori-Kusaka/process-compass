# 束 B24 — 受付(2026-11-19)

担当: 受付と調査・裁定の案。対象は #446(降りていない実装マーク 15)と #325(同 5)。docs・template・src は変えていない。

入力: `npm run -s impl:issues -- --issue 446|325`、各マークの本文(下の行番号)、ADR-0220・0223・0225、`research/b22-deliberation/`(30・81・96)、`research/b21-deliberation/`(handover・ruling-deferred・ruling-deferred-draft §3)、`research/b18-deliberation/ruling-a1.md` §3.3・§3.5、#446・#325 の最新のコメント、template の作業ツリー(HEAD 795cbb7)。外部の調査は行っていない(どの項目も新しい義務を課さず、規格の引用も要らない)。

## 1. 審議の重さの判定

| 区分 | マーク | 判定 | 理由 |
| --- | --- | --- | --- |
| A. 重の裁定済み・実装だけ | 0830・0214・0217(#325)、1030(#446) | **審議を開かない**(B22 の裁定を実装する) | 経路・強制の有無・離脱の範囲は B22 の重の審議で決まった(ADR-0223・0225、`96-issue-comment-*.md` の項目)。残るのは決定可能な条件の実装と印の上げ。独立の突合は行う |
| B. 軽の裁定済み・実装だけ | 0597・0599・0636・0640・0643・0651・0664・0709・0772・0834・0900・0980(#446)と 0840 の依存の追加の部分、0225(#325) | **軽**(既存の裁定を保つ。会議体は開かない) | B21 の議長の裁定(`ruling-deferred.md` §2 が案 §3 を採った)と B18 の `ruling-a1.md` §3.5 で降ろし方が決まっている。条項を新設・改廃しない |
| C. 軽・裁定の案が要る | 0594、0216 の残り2指標、0840 の欄の部分 | **軽**(起案と反対の2委員。外部の調査なし) | 0840: B21 の裁定の `delegation.introducesPaths` が、既存の委任の規則の `excludePaths`(config.mjs 2284 行)と同じ範囲を二重に定める疑い(B21 §6 が突合に求めた点)。0594: `ruling-a1.md` §3.3 の条件(safetyRelated の R1 規則の宣言が無ければ止める)が、後の ADR-0220(案件の全体で止める。安全関連部の範囲を構成に持たせないと決めた)と食い違う。食い違いの解消で、新しい義務を課さない。0216: 3.10.8 の指標は既にある。残る2指標の降ろし方だけを決める |
| D. 編集の指摘 | 0636 の `check` の値 | 編集(議長が直し、突合1回) | B21 の裁定は `check=presence`。4席の外は欠けても注意だけで失敗にしないため、「規則を運ぶ単位の実在の確認」(implementation-marking.md「presence の単位」)に当たらない。中身は変えず、`check=manual` にして機械の出力を note に書く |
| — 重 | なし | — | 安全(0594)は ADR-0220 が既に決め、本束は条件を ADR-0220 に揃えるだけ。0834 は既存の採用者の委任を止めるが、4点目は本文 5.5.4 が既に課す(新しい義務ではない) |

重へ上げる条件: 2委員が割れた点が新しい義務・ADR の原則の変更・安全に当たる、または独立の突合で「高」が出る。

## 2. マークごとの現状(2026-11-19、本文の grep)

全 20 件とも `state=undelivered check=manual plan=scheduled`。

| IMPL | 所在(phase4-process-design/) | target | 決まっていること(出どころ) | まだ決まっていないこと |
| --- | --- | --- | --- | --- |
| 0594 | human-ai-boundary.md:122 | autonomy-derivation | ruling-a1 §3.3(a)。ただし安全関連部の部分は ADR-0220・IMPL-0919(delivered)が全体の停止で受けた | ruling-a1 の条件を ADR-0220 に揃えたときに足すもの(§30 の 0594) |
| 0597 | human-ai-boundary.md:560 | config-delegation | B21 案 §3.2: 条件6 の件数の表示、`delegation.sampling.perMonth`、合否に数えない | なし |
| 0599 | human-ai-boundary.md:689 | config-delegation | B21 案 §3.2: 手引き(process-change-skill)、manual | なし |
| 1030 | overview.md:740 | d0-template | B22 項目1〜4(ADR-0225): D-0 節12 の書き分け → delivered manual | template-fields.yaml の欄の扱いは実装で確かめる |
| 0636 | roles-responsibilities.md:115 | config-seats | B21 案 §3.2: 4席の外の competence を任意で、欠けは注意 | `check` の値(D) |
| 0640 | roles-responsibilities.md:249 | config-seats | B21 案 §3.2: `qualification.record` の実在、presence | なし |
| 0643 | roles-responsibilities.md:255 | config-seats | ruling-a1 §3.5: 席のモデルが導入の記録に在り問題が無い、machine | なし |
| 0900 | roles-responsibilities.md:641 | config-roles | B21 案 §3.3: G-7 の手引き、manual。target を gate-skill へ | 置き場が gates/G-7.md のため target の名(§30) |
| 0651 | roles-responsibilities.md:710 | process-profile | B21 案 §3.3: 生成区間の文字列の一致、machine | 非決定の値の扱い(実装で確かめる) |
| 0664 | roles-responsibilities.md:1075 | config-delegation | B21 案 §3.2: パターンの同一を登録で拒む、machine | なし |
| 0830 | roles-responsibilities.md:1306 | pre-review-automation | B22 項目1〜4(ADR-0223)。(a)〜(c) で machine | なし |
| 0214 | roles-responsibilities.md:1358 | pre-review-automation | B22 項目5・7(ADR-0223)。新しい検査、既定で必須にしない、machine | 実物の GitHub の確認の担い手(§30 問い) |
| 0216 | roles-responsibilities.md:1405 | pre-review-automation | 3指標+応答の比率は B21 単位11・12 で実装・結線済み | 残る2指標(C) |
| 0217 | roles-responsibilities.md:1428 | pre-review-automation | B22 項目6。検出・記載・通知は降りた。強制は 0214 が受ける | 上げる state(§30) |
| 0225 | roles-responsibilities.md:1582 | agent-settings | B21 案 §3.5: 読み込みの記録、実機の確認まで delivered にしない | 置き場(B20 の agent-run-record.mjs と同じ記録の所在に寄せる。§30) |
| 0709 | roles-responsibilities.md:1821 | config-change-log | B21 案 §3.3: 事例の識別の削除と承認の改め、target を pr-checks へ、machine | なし |
| 0834 | roles-responsibilities.md:1992 | autonomy-derivation | B21 案 §3.2: `CHANGE_TYPE_BASIS` に4点目、machine | なし(fixture の移行は実装) |
| 0980 | roles-responsibilities.md:2100 | process-change-skill | ruling-a1 §3.5: 「外す」でも移した先を求める、machine | なし |
| 0840 | tailoring-guide.md:436 | config-delegation | B21 案 §3.2: 依存の追加の行と `delegation.introducesPaths`、machine | `introducesPaths` を足すか(既存の `excludePaths` と二重の疑い。区分 C) |
| 0772 | tailoring-guide.md:1409 | config-deviations | B21 案 §3.3: ゲートの状態の弱めと宣言の対応、machine | なし |

## 3. Issue にあるマークの外の未決点

- #446 のコメント(2026-11-17、束 B17 が #340 から寄せた)K-4: 1名の体制で ADR-0081 の委任の停止(理解保持者1名以下)が第8章の 1〜2名への委任のどの種別を止めるか。マークを持たず、決めていない。#446 を閉じる前の扱いを所有者へ問う(§30 問い1)

## 4. template の現状で確かめたこと

- `autonomy.mjs` に safetyRelated の読みは無い。安全関連部は `safetyPartStop`(IMPL-0919、ADR-0220)が Q1 で案件の全体を止める
- `test-check-delegation.mjs` に「リスク区分が R2 → 条件2」の場面はあるが、R1 の場面は無い
- `config.mjs` の `CHANGE_TYPE_BASIS` は3点(detection・rollback・tests)
- `recalibration.mjs` 44 行は「移す」だけに移した先を求める
- `pre-review.mjs` 446・457 行に「止める強制の機械化は未決」、489 行に「EV-0281」が残る
- 読み込みの記録は無い。B20 の `agent-run-record.mjs`(SessionStart)が `.claude/agent-runs/<id>.json` に記録する
- `impl-targets.yaml` に gates/G-7.md の降ろし先は無い(G-6 は `gate-skill-g6` がある)
