# #337 準拠テンプレート項目1〜5 議長の裁定の案(束 B12・軽)

日付: 2026-11-17。担当: 反対委員(議長の裁定の案を兼ねる)。根拠: `b12-01-drafter.md`(起案)、`b12-02-opponent.md`(反対。§0 の P1〜P9 は実物で確かめた事実)、`decision.md`(本文側の裁定)。

**審議の重さ: 軽のまま。** 割れた点は項目2・4・5。項目2・5 は 1.7.7 と既存の表示の適用で、新しい義務を課さないので議長が裁定する。項目4 の「宣言の欠落として数えるか」は、数えると上限を置いていない全採用者の G-7 が落ちる(実質の新しい失敗)ため、本件では裁定せず**所有者へ上げる**(§3)。本件で入れるのは失敗にしない開示まで。

**第6章の企画書の様式に欄を足すか: 足さない(本件で扱わない)。** 範囲の行(IMPL-0262)が先例で、template の4様式にあり標準の第6章と `template-fields.yaml` の t6 には無い。両方向の検査は t6 に登録した欄にだけ働くので落ちない。基準値を企画時に記録する要求は本文 `gate-criteria.md:1059` と第6章の「安定性指標の閾値」の行が既に持ち、新しい行はその記録の構造化である。第6章へ欄を足すのは本文の変更で、decision.md §4.6(template だけを挙げた)の範囲の外になる。`template-fields.yaml` も変えない。

## 1. 項目ごとの裁定と作業の指示

作業は template の中で直列(1 → 2 → 5 → 4 → 3)。項目1・2 は `coverage-check.mjs` と `verify-gate-contract.mjs` で重なる。コミットのたびに bundle へ退避する。

### 項目1 企画書の基準値の欄と構成の一致 — 採る((b) 様式 + (a) 機械)

1. 様式(**4つとも**): `template/templates/06-project-brief.md:175-176`、`profiles/revenue/templates/06-project-brief.md:175-176`、`profiles/internal/templates/06-project-brief.md:170-171`、`profiles/oss/templates/06-project-brief.md:182-183`
   - 「安定性指標の閾値(変更失敗率・差し戻し率・カバレッジ)」の行名の括弧を「(変更失敗率・差し戻し率。カバレッジの基準値は下の行)」へ改める(二重の記録を作らない)。行名の先頭「安定性指標の閾値」は変えない(IMPL-0590 が引く)
   - 範囲の行の直後に足す: `| カバレッジの基準値(G-5 基準3) | <整数の %。構成の ci.coverageBaseline(無ければ ci.coverageThreshold)と揃える。未達の代償措置の下限(90)は基準値に含めない。基準値は組織が定める値で、示す値は参考の値(80%。G-5 を強める構成は 90%)> |`
2. `scripts/gate/coverage-check.mjs`: `BRIEF_BASELINE_ROW = 'カバレッジの基準値(G-5 基準3)'` と `briefCoverageBaseline(text)` を `briefCoverageScope` と同じ形で足す。行なし → `null`、未記入(`isFilledValue` が偽)→ `{ value: null, raw, blank: true }`、`(\d{1,3})\s*%?` の最初の整数が 0〜100 → `{ value, raw }`、読めない → `{ value: null, raw }`
3. `scripts/gate/check-g1.mjs:103` の `REQUIRED_ROWS` に `['指標の閾値と予算区分', BRIEF_BASELINE_ROW]` を足す。行が無い場合は範囲の行と同じく `g1Dependent`(G-1 の前は失敗、判定記録を読めなければ undecided)。**G-1 を通過済みの企画書に行が無い場合は、warn も gaps も出さずに飛ばす**(範囲の行の `gap` の扱いに倣わない。理由は §4)
4. `scripts/gate/verify-gate-contract.mjs` の 5.5 節、範囲の照合(781-789)の直後、同じ `if (brief !== null)` の中に足す:
   - 行が無い → notes「企画書に「カバレッジの基準値(G-5 基準3)」の行がありません。構成の基準値との一致を確かめていません」
   - 未記入 → notes(範囲の文に倣う)
   - 読めない → problems
   - `rec.value !== (config.ci.coverageBaseline ?? config.ci.coverageThreshold)` → problems「企画書に記録した基準値(N%)と、構成の基準値(M%)が一致しません。記録した基準値で測っていません。未達の代償措置の下限(90)は基準値に含めません(第4章 G-5)。企画書か構成(/process-change 種別 settings)を直してください」
   - 構成に値が無い場合は項目2 で problems になるので、ここでは比べない
5. 試験:
   - `test-coverage-scope.mjs`: `briefCoverageBaseline` の単体(`80%`・`80`・`<…>`・行なし・`abc`・`120`)
   - `test-init-g5.mjs`(278-286 の範囲の場面の隣): 一致で通る / 食い違いで落ちる / 代償措置の間(`coverageThreshold 90`・`coverageBaseline 80`・企画書 80)で通る / 同じ構成で企画書 90 は落ち、文に「基準値に含めません」が出る / 未記入で notes / 行なしで notes / 旧い構成(`coverageBaseline` なし・`coverageThreshold 85`・企画書 85)で通る。変異: 比較を外すと「食い違いで落ちる」が FAIL になることを1回確かめ、記録に書く
   - `test-brief-thresholds.mjs:65` の4様式の回しに、「カバレッジの基準値(G-5 基準3)」の行があることを足す
   - check-g1 の場面(G-1 の前に行なしで失敗・未記入で失敗・通過済みで行なしは失敗しない)は、`check-g1.mjs` を回す既存の試験(担当が `grep -ln "check-g1" scripts/gate/test-*.mjs` で選ぶ)へ
6. 標準側(同じコミットの流れで):
   - `gate-criteria.md:1059` の末文「企画書で定めた基準値と構成の下限の一致は、機械では確かめません。」を「企画書で定めた基準値と構成の基準値の一致は、契約検査が確かめます。基準値が適切かは確かめません。」へ改める。同じ段落の「未達の代償措置の間は代償措置の下限(90%)を重ねて」の後に「(重ねるのは導出の基準値に限ります。較正した値と由来の記録の無い値は、そのまま効かせます)」を足す(項目5。編集の指摘)
   - IMPL-0994: `target=gate-contract state=delivered check=machine test=template/scripts/gate/test-init-g5.mjs`。`plan`・`issue`・`review` を外す。note: 「契約検査が、企画書の「カバレッジの基準値(G-5 基準3)」の行の値と構成の基準値(ci.coverageBaseline。無ければ ci.coverageThreshold)を比べ、食い違えば失敗させる。行が無い・未記入は通知(G-1 の前の企画書では check-g1.mjs が行と記入を必須にする)。構成に ci.coverageThreshold が無ければ coverage-check と契約検査が失敗させ、参考の値を効かせない。準拠テンプレートは初期化の時点から導出値(80。G-5 を強める構成は 90)を基準値とし、未達の代償措置の間は導出の基準値に代償措置の下限(90)を重ねる。基準値が適切かは人の判断」
   - IMPL-0262 の note に「基準値の行(カバレッジの基準値)も同じ様式に置き、G-1 の前の企画書で必須」を1文。state は変えない
   - `npm run impl:write`

### 項目2 `?? 80` — 起案の「警告して 80 で判定」を採らない。失敗にする((a))

理由: 1.7.7 の表は、組織が定める値の記録が無いとき「当該の基準を満たさない。参考の値は効かない」と定める。警告を足しても参考の値が効くことは変わらない。起案の懸念(既存の構成が落ちる)は事実でない(template の `process.config.json:23` は初期化の前から 80 を持ち、生成器は初版から値を書く)。値の無い構成は手で消した場合だけで、新しい義務ではない。

1. `coverage-check.mjs:418`: `const threshold = config.ci?.coverageThreshold;` とし、数で 0〜100 でなければ `say('fail', '構成に ci.coverageThreshold(G-5 基準3 の基準値。組織が定める値)がありません。参考の値では判定しません(第1章 1.7.7)。/process-change(種別 settings)で値を書きます')`、`return { code: 1, result: { measured: false, reason: 'ci.coverageThreshold が無い', scope: null }, messages }`
2. `verify-gate-contract.mjs` の 5.5 節(g5 が omitted でないとき)に同じ条件で problems
3. `adapter.mjs:114`: 値は変えない。注「値の有無は coverage-check と契約検査が確かめて落とす。ここは子の検査器へ渡すだけ」を足す(子の検査器が空の値をどう読むかは確かめていないので、変えない)
4. 試験: `test-coverage-scope.mjs` に `ci` から値を消した構成で `code 1`・「参考の値では判定しません」の場面。`test-init-g5.mjs` に契約検査が落ちる場面
5. 実装マーク: 新設しない。IMPL-0994 の note(上)に含めた

### 項目3 RC-07 の configKey: null — 採らない(JSON・検査は変えない)。(c) 手引きに1文

1. `template/scripts/gate/recalibration-registry.json` と `scripts/check-recalibration-registry.mjs` は変えない。configKey は `process.config.json` の再導出の対象を指す欄で、`.claude/guard.json` へ広げると欄の意味が変わり、`recalibration.mjs` は configKey を使わないので何も働かない。**課さないと決めた**
2. `template/docs/calibration-register.md` の箇条の末に1文: 「RC-07 の分量の上限(組織が定める値。参考の値は 200行)は構成(process.config.json)ではなく `.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile` に置きます。6,000 トークンはテンプレートの CLAUDE.md の目標で、合否に使いません。どちらも構成のキーを持たないため、登録簿の configKey は null です」
3. 試験・実装マーク: 要らない

### 項目4 上限未設定の出力と宣言の欠落(IMPL-1001) — 文言と失敗にしない開示を採る。数えるかは所有者へ

1. `check-pr.mjs:2583` の文言を「**上限未設定**(`.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile`。値は組織が定める。未設定の間は判定せず、G-5 基準6 の分量の項を満たしたと記録しない)」へ。`test-check-pr.mjs:574` は `/上限未設定/` だけを見るので壊れない
2. `aggregate-evidence.mjs` の宣言の表(4008-4020、`config.guard.enabled === false` の行の直後)に、範囲の終点の版の `.claude/guard.json` の `instructionAssetLimit.maxLinesPerFile` が `null`・欠落のとき1行を足す:
   `{ label: '指示資産の分量の上限(G-5 基準6)', state: '未設定(組織が定める値)', why: ['未設定の間、基準6 の分量の項を満たしたと記録しない。未設定を G-5 の失敗にしない(ADR-0126)', '第1章 1.7.7 では記録の無い値はテーラリングの宣言の欠落に当たる。準拠テンプレートの集約は、欠落の件数に数えていない(IMPL-1001)'] }`
   - **gaps には入れない**(gaps は G-7 を失敗させ、主張の名を落とす。冒頭の注 29 行・5419・6663)。正の整数のときは行を出さない。不正な値は `check-pr.mjs:2101` が既に errors にするので、ここでは「不正(check-pr が失敗させる)」として行を出すだけにする
   - guard.json の読み方は、集約が構成を読むのと同じ版(範囲の終点)に合わせる
3. 試験: `test-tailoring-declaration.mjs` に、上限 null で行が出る / 200 で出ない / 欠落で出る、の3場面と、どの場面でも gaps の件数が変わらないこと
4. 実装マーク IMPL-1001: **undelivered のまま**(規定は「宣言の欠落として出す」で、B は数えていない)。note を「保証の開示 項目2 の宣言の表に、未設定の行を出す(数えない。G-7 を落とさない)。宣言の欠落として数えるか(G-7 と適合の主張に響く)は所有者の判断待ち(2026-11-17。#337 b12-03 §3)」へ改める。`issue=337` は、所有者の判断を扱う Issue が決まるまで残す(議長が、閉じる前に付け替える。閉じる前に計画のマークを確かめる規則)
5. 標準側: 本文は変えない(本文の 743 の段落は G-5 の帰結だけを書いている。G-7 の扱いは所有者の判断の後)

### 項目5 較正で 90 未満 — 現状の挙動は直さない。表示の食い違い2つを直す

1. 挙動(較正した値と由来の分からない値に代償措置の 90 を重ねない)は直さない。較正は記名を伴う変更で ADR-0065 の経路を通り、90 は参考の値(1.7.7)。90 を重ねると組織が定める値を機械が上書きする。**課さないと決めた**
2. 本文 `gate-criteria.md:1059` の無条件の文: 項目1 の 6 で直す(編集の指摘)
3. 保証の開示の未達の表(`aggregate-evidence.mjs:5562` の代償措置のセル): `u.compensationNote` があれば `ci-strict(${compensationNote})` の形で添える。外へ渡す形でも出す(値の事実で、自由記述ではない)。読み元の `unmet[]`(3506 で `compensation` を写す箇所)に `compensationNote` も写す
4. 試験: 較正 85・未達 ci-strict の構成で、開示の未達の行に「較正により 85% を適用」が出る。担当が `grep -ln "代償措置\|ci-strict" scripts/gate/test-*.mjs` で開示を回す既存の試験を選ぶ
5. IMPL-0346 の note に「較正した値と由来の分からない値には代償措置の下限を重ねない。下回るときは compensationNote を PROCESS-PROFILE.md と保証の開示の未達の表に出す」。test= に開示の試験を併記できる書式か `implementation-marking.md` で確かめ、できなければ note に試験の所在を書く。state は delivered のまま

## 2. 回帰と仕上げ

- 途中の巡: 触った試験だけ(`test-coverage-scope`・`test-init-g5`・`test-brief-thresholds`・check-g1 の試験・`test-check-pr`・`test-tailoring-declaration`・開示の未達の試験・`test-roster-rules`)
- 標準側: `npm run impl:write`、`npm run lint:registry && npm run test:registry`、push の前に `npm run check` を1回
- template の変更は `npm run template:kb` の対象ではない

## 3. 所有者へ上げる点

**上限が未設定の指示資産の分量(G-5 基準6)を、テーラリングの宣言の欠落として数えるか。**

- 事実: 第1章 1.7.7 は「定める者・時点・記録先の書かれていない組織が定める値は…記録の無い値は、テーラリングの宣言の欠落とする」と定め、3.11.4 要求事項1 は定める者・時点・記録先を書かない。1.10 は欠けた記載を記録の欠落として表示し、記録の欠落がある範囲では適合の主張を述べない。template の既定は `maxLinesPerFile: null`。decision.md §3.3(a) の「食い違いは無い」は G-5 の側についてだけ成り立つ
- 選択肢:
  - (A) 記録の欠落に数える(gaps): 1.7.7 に字義どおり合う。上限を置いていない全採用者の G-7 が落ち、適合の主張を述べられなくなる。ADR-0126 が G-5 で避けた帰結を G-7 で課す
  - (B) 宣言の表に出すだけ(本件で入れる): 新しい失敗を課さない。宣言の欠落があるのに「適合の主張」の名が出うる。表示の文で開示している
  - (C) 宣言の表に出し、主張の名だけを「適用の表明」へ落とす(G-7 は落とさない。`recordDepartures` と同じ形): 新しい仕組みになる
  - (D) 本文側で 3.11.4 要求事項1 の記録先と時点を定める(例: 強制層の設定に置き、置かない間は満たしたと記録しない)ことで 1.7.7 の箇条の外へ出す: 本文の変更
- 反対委員の見立て: A か C が 1.7.7 と整合する。A は採用者の負担が値を1つ置くことだけだが、全採用者の G-7 を一斉に落とす。C は新しい仕組み。いずれも採用者への影響が大きく、重の審議に当たりうる。本件では B を入れて開示し、判断を待つ

## 4. 採らない案

| 案 | 出した者 | 理由 |
| --- | --- | --- |
| 第6章の企画書の様式と `template-fields.yaml` に基準値の欄を足す | 起案の検討 | 範囲の行の先例どおり template の様式だけで足りる。本文の記録の要求は既にある。足せば本文の変更で、decision.md §4.6 の範囲の外 |
| 様式を `templates/06-project-brief.md` だけ直す | 起案 | 初期化は案件タイプの様式(`profiles/*/templates/`)を写す。revenue 以外で行が無くなる |
| 「安定性指標の閾値」の括弧に「カバレッジ」を残す | 起案 | 基準値が2か所に書かれ、機械は片方だけを比べる |
| 比較を check-g1.mjs に置く | 起案・反対とも | G-1 は行の存在と記入まで。範囲の比較は契約検査が先例 |
| G-1 を通過済みの企画書に基準値の行が無いことを gaps に入れる(範囲の行の先例) | 反対が検討 | 範囲は #296 で新しく記録を求めた事項。基準値は既に自由記述で記録されている。構造化のために既存の採用者の G-7 を落とさない |
| 構成に値が無いとき警告して参考の値 80 で判定する | 起案 | 1.7.7「参考の値は効かない」と逆。値の無い構成は手で消した場合だけ |
| adapter の環境変数を値の無いとき空にする | 反対が検討 | 子の検査器の読み方を確かめていない。先に落とす検査がある |
| 登録簿の configKey を `.claude/guard.json` へ広げる | Issue の項目3 | 欄の意味が変わり、何も働かない |
| 上限の未設定を gaps に入れて「失敗にしない」 | 起案 | gaps は G-7 を失敗させる。実装上成り立たない |
| 上限の未設定を本件で記録の欠落に数える(A) | 反対が検討 | 全採用者の G-7 を落とす。所有者へ(§3) |
| 上限の未設定を G-5 の失敗にする | (decision.md で既に却下) | ADR-0126 |
| 較正した値が 90 未満のとき代償措置の 90 を重ねる | Issue の項目5 | 組織が定める値(1.7.7)を機械が上書きする。較正は記名の経路(ADR-0065)を通る |
| 較正で 90 未満の表示を、実害が出てから保証の開示へ足す | 起案 | 未達の表が `ci-strict` とだけ出し、受け手が 90 と読む。表示と実態の食い違いで、決定可能なので今直す |

## 5. 統制の閉じ方

| 統制 | 閉じ方 |
| --- | --- |
| 企画書の基準値と構成の基準値の一致 | 機械(値の一致)。契約検査 |
| G-1 の前の企画書に基準値の行と記入がある | 機械(存在)。check-g1 |
| 基準値が適切か | manual(人の判断)。IMPL-0994 の note で開示 |
| 構成に基準値がある | 機械(存在・型)。coverage-check と契約検査 |
| 上限の未設定の開示 | 機械(値の有無)で宣言の表に出す。数えるかは未決で、IMPL-1001 undelivered で開示 |
| 較正で代償措置を下回る旨の開示 | 機械(compensationNote の有無)。PROCESS-PROFILE.md と保証の開示 |

## 6. 既存の決定との突合

| 相手 | 結果 |
| --- | --- |
| 1.7.7(ADR-0097) | 項目2 で整合させた(参考の値を効かせない)。項目4 は B で開示し、数え方は所有者へ |
| decision.md §3.3(a)・§4.6 | §4.6 の5項目の範囲で裁定。§3.3(a) の「食い違いは無い」は G-5 についてのみ成り立つと記録し、G-7 の側を所有者へ上げる |
| ADR-0126 | 整合。G-5 を失敗にしない |
| ADR-0065・ADR-0088 決定5・ADR-0028 決定6 | 整合。較正の値を動かさず、代償措置の下回りを開示する |
| ADR-0040・`template-fields.yaml` | 影響なし(t6 に登録しない。範囲の行の先例) |
| IMPL-0261・IMPL-0262 | 整合。同じ契約検査の節と同じ様式に置く |
| `implementation-marking.md` | IMPL-0994 は delivered で test= 実在(`test-init-g5.mjs`)、target `gate-contract` は `impl-targets.yaml:282` に登録済み。IMPL-1001 は undelivered のまま |
| 所有者の方針(細かい定義を増やさない) | 新しい語・条項なし。新しい欄は template の様式の1行だけ |

## 議長の裁定(2026-11-17)

- 所有者へ上げる点は、上げずに議長が裁定する: 本件では上限の未設定を宣言の表に出すだけにし、G-7 の記載の欠落には数えない。IMPL-1001 は undelivered のまま、note に「数えると全採用者の G-7 が落ちるため、準拠テンプレートは数えない。標準の 1.7.7 の扱い(宣言の欠落)は課したまま」と開示する。数える案は、既定の上限の値を template が持つか否かと一緒に決める必要があり、採用者への新しい差し戻しになるため本件(軽)の範囲外とする
- 項目2(`?? 80` を失敗にする)は反対委員の案を採る。1.7.7 の「参考の値は効かない」に揃える。値の無い構成は手で消した場合に限られ、出力に理由を出す
- 第6章の企画書の様式に欄は足さない(本文の変更は既存の裁定の範囲外)
- その他は本ファイルのとおり採る
