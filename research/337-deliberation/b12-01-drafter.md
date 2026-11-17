# #337 準拠テンプレート項目1〜5 起案(束 B12・軽)

日付: 2026-11-17。担当: 起案委員。読んだもの: `decision.md`、`tmp/b12/brief-common.md`、IMPL-0994(gate-criteria.md:1061)・IMPL-1001(同:766)・IMPL-0261(同:1117)・IMPL-0346、template の該当ファイル。template は読むだけで、何も変えていない。試験は走らせていない(実行は実装の担当)。

## 0. 前提の確認(実装の担当が先に知ること)

1. 標準の側は入っている。gate-criteria.md:1059 に「企画書で定めた基準値と構成の下限の一致は、機械では確かめません」とあり、IMPL-0994 は `target=g1-check state=undelivered`。**ただし範囲の一致(IMPL-0261)は check-g1.mjs ではなく `verify-gate-contract.mjs:781-789`(契約検査、target=gate-contract)が比べている**。値の一致も同じ場所に置くのが先例に沿う。`check-g1.mjs` は行の存在・未記入だけを見る(`BRIEF_SCOPE_ROW` が `check-g1.mjs:103` の必須行の表に入っている)。decision.md §4.6 の「`check-g1.mjs` が構成と比べる」は、契約検査に読み替える。IMPL-0994 の target も `gate-contract` へ改める(`src/data/impl-targets.yaml:285` に登録済み)
2. IMPL-0994 の note は「未達の代償措置の間は代償措置の下限(90)を重ねて効かせる」と書き、`standard §4.3` の文(基準値 `ci.coverageBaseline`)と同じ内容。比べる相手は **`ci.coverageBaseline`(無ければ `ci.coverageThreshold`)**。`coverageThreshold` と比べると、代償措置の間は 90 と企画書の 80 が常に食い違う(`generate-profile.mjs:966-968`)
3. 試験の走らせ方(template のルートで): `node scripts/gate/test-coverage-scope.mjs`、`node scripts/gate/test-init-g5.mjs`(契約検査の企画書の照合)、`node scripts/gate/test-brief-thresholds.mjs`、`node scripts/gate/test-roster-rules.mjs`(186 件。下限の由来)、`node scripts/gate/test-recalibration.mjs`、`node scripts/gate/test-check-pr.mjs`。標準側は `npm run lint:registry && npm run test:registry`。WSL では node 26。全量は push の前に1回。template の `package.json` は無い(個別に node で走らせる)。template の様式の必須欄は `src/data/template-fields.yaml`(`file: templates/06-project-brief.md` の節、622 行付近)

## 1. 共通の方針の3問

1. 結果と証跡: 項目1・4 は、残る証跡(企画書の値と構成の値の一致・上限の未設定の開示)。項目2・3 は表示の食い違い。手順は要らない
2. 例外承認で受けられるか: 項目1 の値の食い違いは「企画書を直す」か「構成を変える(記名)」で解ける。新しい条項は要らない
3. 破られたとき誰が何を失うか: 項目1 は、適合の主張の受け手が「企画書の基準値を満たした」を読み違える。項目2 は構成が壊れた場合だけ。項目3 は登録簿の記録の範囲の表記だけ。項目4 は上限の未設定が見えず、基準6 の分量の項を満たしたと読まれる(安全には響かない)。項目5 は実害が無い(下記)

## 2. 項目ごとの案

### 項目1 企画書の基準値の欄と一致の検査 — 降ろし方 (b)+(a)

実在: `template/templates/06-project-brief.md:175`(「安定性指標の閾値(変更失敗率・差し戻し率・カバレッジ)」の1行。「ここで定める」だけ)、176 行(範囲の行)。`coverage-check.mjs:94-129` に `BRIEF_SCOPE_ROW`・`briefCoverageScope`・`briefScopeRowState`。

変える内容:
1. 様式 `templates/06-project-brief.md`: 176 行の次に独立の行を足す。
   `| カバレッジの基準値(G-5 基準3) | <整数の %。構成 ci.coverageBaseline(無ければ ci.coverageThreshold)と揃える。参考の値は 80%。G-5 を強める構成と未達の代償措置の間は 90%。基準値は組織が定める値> |`
   175 行の括弧から「カバレッジ」は消さない(率の3つのうち2つは自由記述のまま)。
2. `coverage-check.mjs`: `BRIEF_BASELINE_ROW`・`briefCoverageBaseline(text)`(行を探し、`isFilledValue` で未記入を除き、`(\d{1,3})\s*%?` の最初の整数を返す。読み取れなければ `{ value: null, raw }`)を足す。`briefCoverageScope` と同じ形にする。
3. `verify-gate-contract.mjs` の 781 行の `if (brief !== null)` の節(範囲の照合の直後)に足す。決定可能な条件だけ:
   - 行が無い: notes(「構成との一致を確かめていません」)。遡って失敗にしない(範囲の行の先例 X-4)
   - 未記入(`blank`): notes
   - 値を読めない: problems
   - 値が `config.ci.coverageBaseline ?? config.ci.coverageThreshold` と違う: problems(「企画書に記録した基準値(N%)と、構成の下限の基準値(M%)が一致しません。記録した基準値で測っていません」)
   - 構成に値が無い(ci.coverageThreshold が undefined): notes(項目2 と合わせる)
4. `src/data/template-fields.yaml`: 追加は **要らないが、足すなら**(622 行の節)`standard: カバレッジの基準値(G-5 基準3)` / `template: カバレッジの基準値(G-5 基準3)`。標準の第6章(様式)に同じ行が無ければ `omit` ではなく**標準側にも同じ行を足す**必要が出る。標準の第6章の企画書の様式を `grep` で確かめ、無いなら template-fields へは足さない(部分集合。必須欄の存在検査は両方向なので、片側だけ足すと `npm run check` が落ちる)。担当は先に `grep -n "カバレッジの測る範囲" src/content/docs/phase6-operation/*.md src/content/docs/phase4-process-design/*.md` で標準の様式の側を確かめること
5. 試験: `test-init-g5.mjs` に、企画書の値が構成の基準値と一致で通る・食い違いで失敗・代償措置の間(`coverageThreshold 90`, `coverageBaseline 80`, 企画書 80)で通る・未記入で notes・行が無いで notes、の5場面。`test-coverage-scope.mjs` に `briefCoverageBaseline` の読み取りの単体(`80%`・`80`・`<…>`・行なし)。変異: 比較の `!==` を外すと失敗する場面を1つ
6. 初期化が書く企画書(`scripts/init/` の企画書を生成する箇所があれば、構成の導出値を欄へ入れる)は**入れない**。人が書く欄を機械が埋めない(採用者の定める値)。生成物が企画書を持つか `grep -rn "project-brief" scripts/init` で確かめる
7. 実装マーク: IMPL-0994 を `target=gate-contract state=delivered check=machine test=template/scripts/gate/test-init-g5.mjs` へ。note を「契約検査が企画書の「カバレッジの基準値」の行と構成の基準値(ci.coverageBaseline。無ければ ci.coverageThreshold)を比べ、食い違えば失敗させる。行が無い・未記入は通知。基準値が適切かは人の判断」に改める。standard gate-criteria.md:1059 の末尾「機械では確かめません」を、「値の一致は契約検査が確かめます。基準値が適切かは確かめません」へ改める(同じコミットで。食い違いを残さない)。`issue=` `plan=` `review=` は state=delivered なら外す(`community/implementation-marking.md` の書式で確かめる)。`npm run impl:write`

採らない: check-g1.mjs で比べる案(G-1 は行の存在の判定。範囲の先例は契約検査。G-1 の失敗は承認を止めるので、構成との食い違いを G-1 で落とすと企画書の承認が構成の状態に縛られる)。基準値の適否の機械判定(自由な文の意味。manual)。

### 項目2 `?? 80` — 降ろし方 (a)、ただし最小

実在: `coverage-check.mjs:418`(`config.ci?.coverageThreshold ?? 80`)、`adapter.mjs:114`(`PIT_IN_COVERAGE_THRESHOLD: String(config.ci?.coverageThreshold ?? 80)`)。初期化は必ず値を書く(`generate-profile.mjs:931-970`、IMPL-0346)ので、通常は効かない。効くのは構成の手書きの欠落だけ。

案: **失敗にしない。由来の無い値として出す**。
- `coverage-check.mjs`: `evaluateCoverage` で `config.ci?.coverageThreshold` が数でないとき、`say('warn', '構成に ci.coverageThreshold がありません。参考の値 80 で判定します(由来の無い値)')` を足し、`result` に `thresholdFromDefault: true` を持たせる(`result` の形は集約が読むので、既存の欄の意味を変えない)。
- `adapter.mjs:114`: 値を変えない(環境変数は子プロセスへの引き渡しで、出力が無い)。コメントに「構成に無いときは coverage-check.mjs が由来の無い値として出す」と足すだけ。
- 試験: `test-coverage-scope.mjs`(または `evaluateCoverage` を呼ぶ既存の試験)に、`ci` が空の構成で 80 を使い警告が出る場面を1つ。
- 理由: 失敗にすると初期化済みでない構成が突然落ちる(厳しくする向きだが採用者への新しい失敗)。ADR-0084 は「値は組織が定める」。表示だけで足りる。契約検査(`verify-gate-contract.mjs`)で `ci.coverageThreshold` の存在を problems にする案は、項目1 の「構成に値が無い」を notes とする判断と合わせて**採らない**(既存の構成を落とさない)。
- 実装マーク: 新しい規定ではない。IMPL-0994 の note へ「構成に値が無いとき、coverage-check は参考の値 80 を由来の無い値として出す」と1文足すだけでよい。マークを新設しない。

### 項目3 RC-07 の `configKey: null` — 降ろし方 (d) 降ろさない + (c) 手引き

実在: `template/scripts/gate/recalibration-registry.json:59-65`。`scripts/check-recalibration-registry.mjs:107-113` は configKey を `a.b` 形で `process.config.json` に実在することを検査する。上限は `.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile`(`check-pr.mjs:2097`)で、**この検査の対象外のファイル**。RC-08 の `null` と同じく、構成のキーを持たない定数は `null` が正しい読み。

案: **JSON は変えない**。
- 検査を `.claude/guard.json` へ広げる案は採らない。configKey の意味(`process.config.json` の再導出の対象)を変え、`recalibration.mjs`(configKey を使わない。確かめた)に何も働かない欄のために検査と標準の表(3.12.12 の列)を揃え直すことになる。得るものが無い
- 手引き: `template/docs/calibration-register.md`(11 行。再評価の記録の表だけ)に、1文の注を足す。「RC-07 の上限(200行)は `.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile` にある(構成 process.config.json のキーではないため、登録簿の configKey は null)。組織が定めるまで未設定」。この文は様式ではない(`template-fields.yaml` に 3.12.12 の欄は無い。F6)
- 試験・実装マーク: 不要。標準側の登録簿(3.12.12)の RC-07 の行は、decision.md §4.2 の新しい列が「組織が上限を定めた場合…」を既に言う。重複させない
- 「書かれていない」と「課さないと決めた」の区別: この項目は「課さない」。理由は上のとおり。後継の Issue も起こさない

### 項目4 `pr-rules` の「上限未設定」と宣言の欠落(IMPL-1001) — 降ろし方 (a)+(b-)、2段

実在: `check-pr.mjs:2094-2098`(未設定なら `maxLines === null`)、`:2583`(出力「**上限未設定**…上限内とは記録しない」)、`test-check-pr.mjs:573-574`(IMPL-0501:ok の場面)。記載の欠落を出す先例: `aggregate-evidence.mjs:4312`(`briefScopeRowState(...) === 'gap'`)と `check-g1.mjs:119` の `warn`、`next.mjs:1060` の `result.notes`。

案(2点):
1. 文言: `check-pr.mjs:2583` を「**上限未設定**(…値は組織が定める。未設定の間は判定せず、G-5 基準6 の分量の項を満たしたと記録しない)」へ。標準 gate-criteria.md:728・737 の文言(decision §4.1)と揃える。意味は変わらない。`test-check-pr.mjs:574` は `/上限未設定/` だけ見るので壊れない
2. 経路: `aggregate-evidence.mjs` の記載の欠落の節(4312 行の近く)に、`.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile` が null(または欠落)のとき、「指示資産の分量の上限(基準6): 未設定。組織が定めるまで、分量の項を満たしたと記録しません(失敗にはしません。ADR-0126)」を1行足す。次の `next.mjs` の `notes` も同じ文を出すが、**足さない**(出力の重複)。失敗にしない。G-5 の集約の合否に影響させない
   - 決定可能性: 値の有無(null か数)。機械にしてよい
   - 試験: `test-g5-aggregate.mjs`(集約の試験。IMPL-0992 が参照)に、上限 null で行が出る・数値で出ない・不正値(数でも null でもない)では出さない(不正は `check-pr.mjs:2101` が既に errors にする)の3場面。`guard.json` を読む箇所は `aggregate-evidence.mjs` に無いので、`config.mjs` 経由かファイル読みかを実装の担当が既存の読み方に合わせる(`git grep -n "guard.json" template/scripts/gate`)
   - 実装マーク IMPL-1001: 上の2が入れば `state=delivered check=machine test=template/scripts/gate/test-g5-aggregate.mjs`。note を「上限が未設定の間、保証の開示の記載の欠落に出す。失敗にしない」に改め、`issue=337 plan=scheduled review=` は外す。**入れないなら** state=undelivered のまま、note へ「pr-rules は『上限内とは記録しない』と出す(文言を 1 で改めた)。集約への経路は無い」と書く
- 議長への判断依頼(簡潔): 2 は「新しい義務を課さず、開示を足す」だけで、ADR-0126 を覆さない。1 だけでも IMPL-1001 の核(宣言の欠落として出る経路)は満たさないので、IMPL-1001 は undelivered のまま残る。推奨は 1+2。2 を採らない場合も 1 は入れる

### 項目5 較正した値が 90% 未満のとき代償措置の 90% を重ねない — 結論: 標準の下限と合う。直さない。ただし開示の経路を1つ確かめる

事実:
- `generate-profile.mjs:950-952, 964-968`: 由来が `calibrated` のとき、`coverageThreshold = coverageBaseline`(較正の値)で、代償措置の 90 を重ねない。理由は ADR-0088 決定5 の「較正した値は未達の解消で動かない」と IMPL-0346 の note(「較正した値は未達の解消で動かない」)。`test-roster-rules.mjs:446-455`(85 の較正が未達の解消で動かない)が固定している
- 重ねない場合でも、`:978-980` が `unmet[].compensationNote`(「ci-strict の導出値はカバレッジ下限 90% だが、較正により N% を適用している」)を作り、`generate-profile.mjs:3689` が未達の表に出す
- 標準: G-5 基準3 は「参考の値を 90%」(gate-criteria.md:1059)、**基準値は組織が定める値**(1.7.7)。標準 3.12.12 の RC-06 も「80%・90% は参考の値」。90 を下限として課す条項は標準に無い(decision.md §2 も「90 を引き上げる・義務化する案は両委員とも採らない」)。ADR-0028 決定6(代償措置は未達の代わりにならない)は、代償措置があるから未達が解消するのではないという意味で、代償措置の値を較正で下回らせることを禁じていない
- ADR-0065 決定は「下限 90% は…下げるには、記名と理由を伴う変更を要する」。較正は記名の変更(`calibrated` の由来は種別 settings の数値で、記名を伴う)なので、この経路を通っている
- 結論: 現状は標準の下限と矛盾しない。「代償措置の 90% を重ねるべき」とする条項は標準に無く、重ねると**組織が定める値を機械が上書きする**ことになる(1.7.7 の型に反する)。直さない。採らない理由として記録する
- 残る確認(担当): 較正で 90 未満にした構成で、保証の開示に「代償措置の下限を適用していない」旨が出るか。`compensationNote` は未達の表(PROCESS-PROFILE.md)に出るだけで、`aggregate-evidence.mjs` の保証の開示に出るかは確かめていない。`git grep -n "compensationNote\|coverageOrigin" template/scripts/gate/aggregate-evidence.mjs` で確かめ、無ければ **新しい義務ではなく既存の表示の欠け**として、後継ではなく IMPL-0346 の note に「較正で 90 未満のときの表示は PROCESS-PROFILE.md の未達の表だけ」と1文足して開示する(state は delivered のまま。新しい経路は課さない)。足す経路(保証の開示への出力)を作るのは、実害(受け手が代償措置の適用を読み違えた)が出てからでよい

## 3. 順序・直列

全項目が template の別々のファイルを触る。項目1・2 は `coverage-check.mjs` で重なるので**直列**(1 → 2)。項目4 は `check-pr.mjs`・`aggregate-evidence.mjs`、項目3 は `docs/calibration-register.md` だけで、本文だけの項目3 は並行してよいが template は1つのコミットの流れに入れる(CLAUDE.md: 準拠テンプレートを触る Issue は直列)。コミットのたびに bundle へ退避する。標準側の同時の変更: gate-criteria.md:1059、IMPL-0994/1001 のマーク(`npm run impl:write`)、`npm run check`。template の変更は `npm run template:kb` の対象(規則データ)ではない。

## 4. 実装マークの state の変え方(要約)

| マーク | 現在 | 案 |
| --- | --- | --- |
| IMPL-0994 | g1-check / undelivered / manual / plan=scheduled issue=337 | gate-contract / delivered / machine / test=test-init-g5.mjs。note と gate-criteria.md:1059 を同時に改める |
| IMPL-1001 | evidence-aggregation / undelivered / manual / issue=337 | 項目4 の 1+2 を入れれば delivered / machine / test=test-g5-aggregate.mjs。入れなければ undelivered のまま note を直す |
| IMPL-0346 | delivered | 項目5 の表示の欠けがあれば note に1文だけ足す(state は変えない) |

## 5. 採らない案(記録)

- 値の比較を check-g1.mjs に置く(契約検査が先例)
- 基準値の適否を機械で判定する(自由な文の意味)
- 構成に ci.coverageThreshold が無いことを失敗にする(既存の構成を落とす)
- 登録簿の configKey を `.claude/guard.json` へ広げる(検査の意味が変わる)
- 較正した値が 90 未満のとき代償措置の 90 を重ねる(1.7.7 の組織が定める値を上書きする。標準に条項が無い)
- 上限未設定を G-5 の失敗にする(ADR-0126)

## 6. 未確認(担当が実行で確かめる)

標準の第6章の企画書の様式に「カバレッジの基準値」の行を同時に足す必要があるか(項目1-4)。`aggregate-evidence.mjs` の guard.json の読み方(項目4)。保証の開示に compensationNote が出るか(項目5)。`initialize` が企画書を生成するか(項目1-6)。
