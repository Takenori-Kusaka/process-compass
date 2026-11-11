# #378 実装の記録

- 対象: 議長の裁定(`decision.md` の R-1〜R-7 と 6 節)
- 日付: 2026-11-12
- テンプレートは変えていない。ADR・EV・IMPL は新設していない(ADR-0089 のステータスの節に日付つきの注記を足しただけ)

## 1. 変えたもの

| 所在 | 変更 |
| --- | --- |
| `scripts/regress/suite/lib-r3.mjs`(新設) | 採用者のリポジトリの作成(`adopter()`。元の setup.mjs の clone・init・seats と、退避物に無い docs の段の作り直し)、導入前の検証の a〜g(`trialSteps()`)、元の連鎖で状態を変える段(`scenSteps()`・`verifySteps()`。判定するか、`quiet` で判定せずに再生する)、作り直した入力の出所(`INPUT_ORIGIN`)、欠陥注入の1か所の定義(`INJECTIONS`)、前提の段の確認(`pre()`。落ちたら止める)、置き換えの空振りの止め(`must()`) |
| `scripts/regress/suite/r3-scen.mjs`(新設) | scen.mjs の 27 場面。対照 t(育成の担当に名簿の氏名)・n(AI の担い手を置かない採用者)の 4 場面 |
| `scripts/regress/suite/r3-verify.mjs`(新設) | scen2.mjs の 11 場面。scen.mjs の i・q・j を判定せずに再生してから流す |
| `scripts/regress/suite/r3-succession.mjs`(新設) | scen3.mjs の 12 場面。scen.mjs の i・q・j と scen2.mjs の記録・記入を再生してから流す。対照 f(区分の下限の規則の無い採用者)の 1 場面 |
| `scripts/regress/fixtures/adopter-r3/`(新設) | 採用者の製品のコードの固定の本文(`src/inspection.js`・`src/auth/permission.js`・`tests/inspection.test.mjs`・`tests/README.md`・`specs/F-001/spec.md`) |
| `scripts/regress/expected/scenes/r3-*.txt`(新設) | 場面の一覧の宣言(`run.mjs --write-scenes` で書いた) |
| `scripts/regress/suite/lib.mjs` | 場面の記録に `inputs`(入力を改めた記録)を足した |
| `scripts/regress/run.mjs` | `inputs` の欄の検査と `inputs.md` の書き出し。前提の段(`kind: 'precondition'`)を決定の検査と `fixes.md` から除く。除外の歯止め(名前の「[前提] 」と kind の対応、決定を固定する場面が1つ以上) |
| `scripts/regress/test-run.mjs` | 上の振る舞いの試験(`inputsOk`・`inputsBad`・`precondition`・`preNoName`・`preOnly`) |
| `scripts/regress/changed-scenes.mjs` | 差の行に `inputs`・`precondition` を拾う。実行の結果から入力を改めた場面の表を出す |
| `scripts/regress/check-fixes.mjs` | 注記に `inputs` の `by` を足した(照合は元から拾っていた) |
| `scripts/regress/DISPOSITION.md` | fix288-r3 の行を「移さなかったもの」から「移したもの」へ移し、元のとおりではない点 (1)〜(7) を行の中に書いた |
| `src/content/docs/adr/0089-regression-suite-under-version-control.md` | ステータスの節に、50 場面を移したことと前提の段の除外の注記(2026-11-12)。本文の決定は変えていない |

## 2. 場面の数

| スクリプト | 元の場面 | 対照 | [前提] | [代役] | 計 |
| --- | --- | --- | --- | --- | --- |
| r3-scen | 27 | 4 | 51 | 4 | 86 |
| r3-verify | 11 | 0 | 29 | 0 | 40 |
| r3-succession | 12 | 1 | 43 | 5 | 61 |
| 計 | **50** | 5 | 123 | 9 | 187 |

[前提] の数は、各スクリプトが採用者のリポジトリ(対照の採用者を含む)を作り直す段の確認の和である。最終の数は 4 章の実行で確かめた。

## 3. 元のとおりではない点

| 種類 | 場面 | 記録の所在 |
| --- | --- | --- |
| 期待値を改めた(`changed`) | h2(同じ秒の分岐だけ)、i1・i8(測定の記録の置き場。補足 S26・S32)、i3(理由の文。補足 S35)、j1(元の式に、記録だけのコミットの識別子の照合を足した) | 場面の記録、生成物 `changed.md` |
| 入力を改めた(`inputs`) | i6・q3・q4・q5・j6・j7(開発者の席の AI の担い手)、A2(区分の下限の規則)、v4・v6(欄の名。ADR-0066 決定3) | 場面の記録、生成物 `inputs.md` |
| 名前を改めた | j2・B3(件数を外し、観測に残した)、h2(観測を外した) | DISPOSITION.md (5) |
| 作らない段 | 元の段0(テンプレートの更新の PR) | 各スクリプトの注記 |

## 4. 確かめた検査

### 4.1 回帰スイート(WSL、LF の写し)

作業ツリーの木(未追跡を含む)を一時の索引で `git write-tree` し、`git -c core.autocrlf=false archive` で LF に写した。`template/` は HEAD(`89d02d6`)を同じく写した。node v22.23.4。

結果は 4.4 に書く。

### 4.2 変異の確認(直した後)

WSL の写しのテンプレートにだけ欠陥を入れ、r3 の3本を流した。

| 変異 | 落ちた場面 |
| --- | --- |
| M1 予約の排他を外す | h1・**h2**(直す前の h2 は通っていた) |
| M2 代理者の名簿の照合を外す | j10・C1・C2・C3・C5 |
| M3 verify が不一致で失敗しない | A2・v5・v6・v7・v8 |

### 4.3 Windows の `npm run check` の各段

段を1つずつ流した。lint:ci〜test:criteria の 27 段と build は通過した(build は 353 頁)。落ちたのは次の2段である。

- test:template-suite: `test-g5-aggregate.mjs`(既知。CRLF の作業ツリー)に加え、`test-base-judge-workflow.mjs`・`test-discouraged-evidence.mjs` が落ちた。どれもテンプレート自身の試験で、本件はテンプレートを変えていない。WSL の LF の写しの結果は 4.4
- test:regress: 既知(Windows では gh の代役を `execFileSync('gh')` から呼べず、`test-run.mjs` の最初の試験で止まる)

### 4.4 最終の実行(WSL、突合を受けた直しの後)

- r3 の3本を `--write-scenes` で流し、場面の一覧を書いた: r3-scen 86・r3-verify 40・r3-succession 61 場面、落ちた 0(2 章の表)
- 実行役の試験 `test-run.mjs`: 35 件 合格(足した 7 件を含む)
- 回帰スイートの全体(29 本): 通常の時刻帯(WSL の既定 JST)と `TZ=UTC` の両方で「すべて通った」
- テンプレートの試験一式(`scripts/test-template-suite.mjs`。写しの `template/` を git の作業ツリーにして流した): 45 本が通った。Windows で落ちた `test-base-judge-workflow.mjs`・`test-discouraged-evidence.mjs`・`test-g5-aggregate.mjs` も、LF の写しでは通る。既知とされていた WSL の `test-init-g5.mjs` の1件も、この実行では落ちなかった

## 5. 未解決の点

- 元の仕組みの出力(当時の `out/`)が退避物に無いため、ADR-0089 決定1 の場面ごとの一致は確かめられない。比較の基準は元の判定の式である
- 逆算・推定した入力(区分の下限の規則のパスと下限、ほかの席の後継候補、表7 の「復旧の目安」)は、元の採用者の値と同じかを確かめられない。出所は `INPUT_ORIGIN` に書いた
- graphify の知識グラフは更新していない(CI の自動更新に委ねる)
