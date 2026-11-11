# 調査(#360。内部の調査と実行での確認)

- 調査日: 2026-11-12。4つの論点を並列の調査で確かめ、各節に調査の記録をそのまま収めた(書き写していない)
- 表記: [確認] は読んだか実行して確かめた事実、[推測] は確かめていない見込み、[外部未確認] は提供者の仕様の記憶
- 外部の調査は行っていない(受付の判断)。論点B の GitHub の規則だけは提供者の文書で確かめた
- 試行の素材は作業者の一時の置き場にあり、リポジトリへは入れていない
- 論点B の節は論点E(IMPL-0102)も含む

---

## 論点A: #360 論点A 内部調査と実行での確認(IMPL-0204・IMPL-0205)

- 調査日: 2026-11-12
- 対象: worktree `agent-ac3554bff57c26e92`(HEAD 4c03b68)、submodule `template/`
- 表記: **[確認]** は、ファイルを読んだか実行して確かめた事実。**[推測]** は確かめていない見込み。パスは worktree からの相対パス

### 0. 対象の条項と実装マーク [確認]

- 条項(IMPL-0204 の対象): `src/content/docs/phase4-process-design/human-ai-boundary.md:1046`(検証を弱める変更を差分から機械で検出し、G-6 の必須の確認事項として示す。**G-5 の合否に使ってはならない**)、`:1048`(期待値を改めるときは根拠の決定を引く。改めた期待値の一覧(旧・新・引いた根拠)を、その変更で改めたものに限って G-6 の確認事項として示す)、`:1049`(落ちることを期待する印は skip 相当と同じく扱う。印には Issue・照合する失敗の理由・見直しの時期を持たせる。予期せず通った場合と別の理由で落ちた場合は試験の失敗)、`:1050`(印の件数の上限と、期待値の差分による機械の阻止は課さない)
- マーク: IMPL-0203 は `:1060`(delivered、test=test-check-pr.mjs)。IMPL-0204 は `:1061`(undelivered、issue=360、review=2026-11)。IMPL-0205 は `:1094`(5.8.6 要求事項10 `:1079` の「実装計画の対象のパスと、実際に変更されたパスの差を、機械で突き合わせて出す」。undelivered、issue=360)
- 関連の本文: `:1083` は「人が確かめるのは、拒否の記録(要求事項5)、**機械の検出が付けたラベル**(5.8.5 の後の段落)、パスの差(要求事項10)の3つ」と書く。`:1072` の要求事項3 は書き込みの許可を「実装計画のタスクの対象のパス」に限る(IMPL-0200。#358 で undelivered)。IMPL-0205 と同じ「対象のパス」の欄を読む

### 1. IMPL-0203 の実装の所在と出力の形 [確認]

| 項目 | 所在 | 内容 |
| --- | --- | --- |
| 検査の説明 | `template/scripts/gate/check-pr.mjs:53-54` | 「4. 既存のテストの変更」。基底にあるテストの削除・名前の変更・行の削除を一覧にする。合否に使わない。`--comment` で PR へ出す |
| アサーションの正規表現 | `check-pr.mjs:284` | `ASSERTION = /\b(expect\|assert\w*\|should\|toBe\|toEqual\|toMatch\w*\|toStrictEqual\|toHaveBeenCalled\w*\|Equal\|Equals\|require\.\w+\|t\.(Error\|Fatal)\w*)\b/` |
| 本体 | `check-pr.mjs:1944-1964`(`analyzePr` の末尾) | テストの判定は `.claude/guard.json` の `testPatterns`(基底の版を優先し、無ければ先頭の版)を `matchGlob` で照らす `isTest`(`:1945-1947`)。**基底に存在するファイル**だけを対象にする(`:1950`)。削除・名前の変更は種別だけ。それ以外は **`e.removed` が 0 なら飛ばす**(`:1957`)。`git diff -U0 -M mergeBase HEAD` の削除行(`-`)から ASSERTION に当たる行を「期待値の変更の候補」として採る(`:1959-1961`) |
| 結果 | `result.testChanges`(`:1401` で初期化) | `{ file, kind, removed, assertions[] }`。**errors にも warnings にも入れない**(合否に使わない仕組みはこれ。exit code は `r.errors.length` だけで決まる `:2095`) |
| Markdown | `renderTestChanges` `:1967-1980` | 印 `<!-- pit-in:g6-test-changes -->`、見出し「既存のテストの変更(G-6 の材料。合否には使わない)」、表(テスト・変更・削除した行・期待値の変更の候補 3 件まで) |
| PR への出力 | `upsertComment` `:1999-2014`、`:2091-2094` | `gh api` で issue のコメントを印で探して PATCH、無ければ POST。失敗したら warn だけ |
| その他の出力 | `:2082`(`::warning::` で件数)、`:2088-2090`(`--report evidence/pr-checks.md` と `GITHUB_STEP_SUMMARY`) | |
| テストのパスの判定(別系統) | `check-pr.mjs:209` `TEST_PATTERNS`(規模の別集計用。fixtures・snapshot を含む)、`:1474` `isTestPath`。`verification-trace.mjs:150` `testFiles`(guard.json の testPatterns + 文書・データの拡張子を除く) | IMPL-0203 は guard.json の testPatterns を使う。規模の別集計は TEST_PATTERNS を使う。**同じ「テスト」でも2つの定義が並ぶ** |

ワークフロー [確認]:
- `template/.github/workflows/gate-g5.yml:453`(ジョブ pr-rules、`pull_request`、`permissions: pull-requests: write`・`issues: read` `:34-37`)が `check-pr.mjs ... --report evidence/pr-checks.md --comment` を流す。**PR の側の定義・スクリプトで動く**
- `template/.github/workflows/gate-g5-base.yml:148`(`pull_request_target`、既定ブランチのコードで判定、`permissions` は read だけ `:42-46`)は `--comment` を付けない。冒頭 `:16` は「書き込みの権限と秘密情報を足してはならない」と定める

test-check-pr.mjs の形 [確認]:
- `check-pr.mjs` の関数(`analyzePr`・`renderTestChanges` ほか)を **import して呼ぶ**(`test-check-pr.mjs:14`)。fixture のファイルは持たない
- `os.tmpdir()` に一時の git リポジトリを作り(`:16-71`)、基底 main を1つ作って、場面ごとに `pr-N` ブランチを切り、変更を積んで `analyzePr({ root: TMP, base: 'main', pr })` を呼ぶ(`scenario` `:78-94`)。期待は `passes(...)`・`failsWith(re)`・`testListed(count)`(`:96-98`)
- IMPL-0203 の場面は `:378-393`(期待値の書き換え、テストの削除、Markdown の印)。`// IMPL-0203:ng` の印を付ける(違反と適合の対の印。#314)
- GitHub へ問い合わせない。`--comment` と実際の GitHub 上の動作は試験の外(`:6-7`)

### 2. ラベルを PR に付ける仕組みと、G-6 の材料の経路

#### 2.1 PR へラベルを付ける仕組みは無い [確認]

- `template/` の `.yml`・`.mjs`・`.md` を `add-label`・`/labels`・`pr edit`・`issue edit` で検索して、該当なし
- `size:over` は **GitHub のラベルではない**。`check-pr.mjs` の結果の文字列(notices・`renderReport` の `**size:over**` `:1990`)と、区分の下限の規則の識別子(`:1719-1721`)である
- ラベルを**読む**仕組みはある: 停止の申し立て `state:stop-requested`(`check-pr.mjs:754-` の `stopFindings`、ワークフローは `PR_LABELS` と issue の events の付け外しの履歴を渡す `gate-g5.yml:401-412`・`:447-448`)。「ラベルを外しただけでは解除にならない」型(付けた履歴で判定)がある
- ラベルを**作って付ける**前例は Issue にだけある: `context-drift.yml:56-57`・`gate-entry.yml:58-59`(schedule、`issues: write`、`gh label create ... || true` の後に `gh issue create --label`)
- 書き込みのジョブを判定のジョブから分ける前例: `ai-review.yml:59-61`(全体は read)・`:180-186`(`ai-review-notice` だけ `pull-requests: write`。PR の内容に依らない入力だけで書く。IMPL-0333)

#### 2.2 G-6 の材料として出す既存の経路 [確認]

- `/human-verify`(`template/.claude/skills/human-verify/SKILL.md:28-34`)の検証の順序の順4 は「実行トレース: 拒否された操作と、**機械判定が付けたラベル**」。**ラベルを付ける機械判定はテンプレートに無い**ため、この行は現状、指す先の無い記述である(`:1083` の標準本文も同じ)
- 同 `SKILL.md:52`: IMPL-0203 の一覧(pr-rules が PR のコメントへ出すもの)を順1 の材料にそのまま並べる
- `/gate G-6`(`template/.claude/skills/gate/gates/G-6.md:12`): 「既存のテストの変更」の一覧を読み、削除・期待値の変更の候補ごとに受入基準の変更に対応しているかを確かめる。一覧は合否を決めない。理由の欄の記載も担保にしない
- `/gate G-5`(`gates/G-5.md:26`): 一覧を PR のコメントへ出す。失敗にはしない
- `aggregate-evidence.mjs`(出荷の証跡の集約): `testChanges`・`g6-test-changes`・`pr-checks` を**読まない**(grep で該当なし)。G-6 で一覧を見たかを事後に照らす経路は無い
- 「必須の確認事項」を機械で担保する仕組み(承認レビューの本文に該当の項目への言及を求める等)は無い。現状の「必須」は G-6.md の手順の文と /human-verify の順序だけ

### 3. 実装計画の「対象のパス」と、PR とタスクの結び付け [確認]

- 様式: `template/templates/07-implementation-plan.md` の「## タスク」の表 `| ID | 内容 | 対応する受入基準 | 変更の対象パス | 依存 | 並列可 | 状態 |`。例の値は `` `src/invite/**` ``・`` `src/api/invite.ts` ``(バッククォートで囲んだ glob またはパス)。同ファイルに「『変更の対象パス』は実行環境の書き込み範囲の設定に使う。範囲外のファイルを変更する必要が出たら計画の誤りとして差し戻す。エージェントが自分で範囲を広げてはならない」
- `/task-breakdown`(`template/.claude/skills/task-breakdown/SKILL.md:24`): 欄「変更の対象パス — 実行環境の書き込み範囲の設定に使う」。`:76` のチェック項目「変更の対象パスが書かれている」(人の確認)
- **「変更の対象パス」の列を読むコードは無い**。`scripts/` と `.claude/hooks/` を「対象パス」「対象のパス」で検索して、該当は別の意味(`config.mjs` の規則の paths、`generate-profile.mjs` の規則の表)だけ。`guard-write.mjs` も計画を読まない(読むのは guard.json の testPatterns・protectedPatterns)
- 表を読む部品はある: `verification-trace.mjs:212-222` `readPlanMappings(feature)` が「タスク」見出しの下の最初の表を読み、`Task-N` の行の「対応する受入基準」の升を `criterionNumbers` で読む(読めない書き方は 0 件として一覧に出す方針、`:182-210`)。同じ型で「変更の対象パス」の列を読む関数を足せる。試験は `test-plan-trace.mjs`(一時の置き場で spec・plan を書き、関数を import して呼ぶ型。`PLAN` の見出しの既定は「変更の対象パス」を含む `:37`)
- PR とタスクの結び付け: トレーラ `Spec: F-NNN / Task-N`(`check-pr.mjs:281` `SPEC_LINE`)。`specFindings`(`:644-680`)が PR 本文の**末尾の段落**から読み、`specs/F-NNN/spec.md` の実在と、`specs/F-NNN/plan.md` の表に `| Task-N |` の行があることを確かめる(`:674` は正規表現で行の存在だけを見る。列は読まない)。複数の Spec 行を許す。`Spec: setup` の PR と bot の PR はタスクを持たない
- glob の照合: `config.mjs:2012` `matchGlob`(`**/`・`**`・`*`。`{a,b}`・`?` は無い)
- **対象パスの突合の部品は無い**(パスを読む関数も、変更されたパスとの差を出す関数も無い)

### 4. 落ちることを期待する印・期待値の改めの記録の形

#### 4.1 標準の定め [確認]

- 標準本文 `:1048-1049` は、印に「結びつける Issue・照合する失敗の理由・見直しの時期」を持たせることと、期待値の改めに根拠の決定を引くこと、改めた一覧(旧・新・根拠)を G-6 へ示すことを定める。**欄の書き方(どこに、どの書式で)は定めない**。EV-0182(`:1052-1056`、E1、見直し 2027-10)
- ADR-0089(`src/content/docs/adr/0089-regression-suite-under-version-control.md`)
  - 決定3(`:62-70`): 決定を固定する場面の期待値を改めるには ADR の決定・K 番号・標準の条項を引く。**Issue だけは認めない**。記録 `changed` に引いた決定・日付・旧い期待値。**自由記述の理由の欄は求めない(AI が埋められる)**。改めた場面の一覧を `scripts/regress/changed-scenes.mjs` が基底との差分から作る。**機械が合否に使うのは形の検査(`fixes`・`changed` の欄と決定の実在)だけ**。期待値の差分そのものでは失敗にしない
  - 決定4(`:72-77`): 印は自前で実装(CI の Node 22 では `expectFailure` が黙って無視される)。印は Issue・照合する拒否の理由・付けた日・見直しの時期を持つ。予期せず通った・別の理由で落ちた・見直しの時期を過ぎた・欄が欠けたら失敗。見直しの時期は付けた月から 6 か月以内(EV-0183)
  - ただし、これは **process-compass 自身の回帰の試験(`scripts/regress/`)の形**である。実装は `scripts/regress/suite/lib.mjs:178-187`(`knownFailure: { issue: '#NNN', match, on, review }`)、`:317` `KF_REVIEW_MONTHS = 6`、`:324-336` の欄の検査
- `research/319-deliberation/decision.md`: R-4(`:52-59`)期待値を変える手続(自由記述の理由を求めない、形の検査だけを合否に使う)。`:90-93` 第5章の段落へ足すもの(「落ちることを期待する」印は skip と同じ扱いとし G-6 の確認の項目に載せる。**既存の段落と IMPL-0204 に乗せる**)。`:155` X-1(根拠は決定に限り、Issue だけを認めない)。`:224` 後継の(3)「検証を弱める変更の検出(IMPL-0204。既存の #360)へ、落ちることを期待する印と期待値の改めを含める」

#### 4.2 準拠テンプレートの側 [確認]

- `template/` に `xfail`・`expectFailure`・`落ちることを期待`・`it.skip`・`.skip(` の語は**1つも無い**(md・mjs・json を検索)。採用者の製品のテストについて、印の欄の書式も、期待値の改めの根拠の書き方も、テンプレートは何も示していない
- 採用者のスタックはアダプタで決まる: `adapters/node.json`(`npm test`)・`python*.json`(pytest)・`go.json`(`go test ./...`)・`none`・`undetermined`
- [推測] 枠組みごとの印の欄の対応: pytest の `xfail` は `reason=`・`strict=True` を持つ(Issue と見直しの時期の欄は無い)。Jest の `test.failing`・Vitest の `test.fails` は理由の欄を持たない。Go に標準の印は無い。標準 `:1049` の3つの欄は、多くの枠組みで注釈か PR 本文に書く形になる

### 5. 実装の案の見積もり

#### 5.1 実行での試行(一時の置き場。リポジトリは変えていない)[確認]

試行のスクリプトと出力:
- `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\770ecf3d-4ce9-4896-b267-c7e0a80da58f\scratchpad\360a\trial-analyze.mjs` → `...\360a\trial-analyze.out.txt`(現行の `analyzePr` を一時のリポジトリで呼ぶ)
- `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\770ecf3d-4ce9-4896-b267-c7e0a80da58f\scratchpad\360a\trial-patterns.mjs` → `...\360a\trial-patterns.out.txt`(差分の行の正規表現の案を作った例で試す)

**現行の IMPL-0203 が一覧に出さない弱体化(trial-analyze の結果)**:

| 場面 | testChanges |
| --- | --- |
| JS: `test('b'` → `test.skip('b'`(書き換え) | 出る(削除 1 行、**期待値の変更の候補 0**。skip であることは示されない) |
| JS: 既存のテストへ `return;` の行を足すだけ | **出ない** |
| Py: 既存のテストへ `@pytest.mark.skip(...)` の行を足すだけ | **出ない** |
| Py: 既存のテストへ `@pytest.mark.xfail(...)` の行を足すだけ | **出ない** |
| JS: skip つきの新しいテストのファイルを足す | 出ない(基底に無いファイルは対象外) |
| JS: テストだけを変えて期待値を書き換える(製品のコードは変えない) | 出る(候補 1)。「テストだけの変更」であることは示されない |
| 実装計画の対象パスの外(`src/b.js`)を変える(plan の対象は `` `src/a.js` ``) | 何も出ない(errors 0。IMPL-0205 は未実装) |

原因は `check-pr.mjs:1957` の `if (!e.removed) continue;` と、削除行だけを見る設計(`:1959`)。**skip・xfail の付与は多くの枠組みで「行の追加だけ」で書けるため、現行では素通りする**。IMPL-0204 は削除行の検査を広げるだけでは足りず、追加行の検査が要る

**正規表現の案の試行(trial-patterns。37 例、作った例であり実在の分布ではない)**: TP 27 / FP 2 / FN 7 / TN 1

- 案: 追加行の skip(`it|test|describe|context|suite` の `.skip(`・`.todo(`、`xit(`・`xdescribe(`・`xtest(`、`.only(`、`pytest.skip(`、`@pytest.mark.skip`/`skipif`、`@unittest.skip*`、`t.Skip(`/`Skipf`/`SkipNow`、`@Disabled`、`@Ignore`、`{ skip: true }`)、追加行の xfail(`@pytest.mark.xfail`、`pytest.xfail(`、`test|it.fails(`、`test|it.failing(`、`expectFailure`、`@unittest.expectedFailure`、`{ todo: ... }`)、削除行のアサーション(現行の ASSERTION)
- 誤検出(FP): 削除行の注釈の `should`(`// this should never happen`)、試験の名前の `should`(`it('should return 0'` の名前だけの変更)。現行の ASSERTION の `should`・`Equal` は語として広い。加えて、条件つきの skip(`skipif(sys.platform...)`、`if testing.Short() { t.Skip() }`)は**形としては当たるが正当な場合が多い**(誤検出ではなく「正当な変更と区別できない」= 標準 `:1046` が合否に使わない理由そのもの)。移動・整形(行を消して別の位置に足す)も削除行のアサーションとして出る [推測: 整形の PR では件数が膨らむ]
- 取りこぼし(FN): `XCTAssertEqual`(語頭でないため `\bassert` に当たらない)、自前の検証(`throw new Error`)、別名経由の skip(`const run = CI ? it : it.skip`)、早期の `return`、試験の注釈化(`// it(...)`。削除行と組で見れば拾える)、設定による除外(`testPathIgnorePatterns`・`--deselect`・`-k`。閾値・除外設定の検査 3 の範囲だが、設定ファイルが `thresholdFiles` に入っているかに依る)、自前の印(process-compass の `knownFailure` のような採用者独自の印)
- そのほかの構造的な取りこぼし [推測を含む]: (a) 基底に無い新しいテストのファイルの skip(現行の対象外)、(b) testPatterns に当たらない場所のテスト(guard.json の testPatterns は `**/test/**`・`**/tests/**`・`**/__tests__/**`・`**/spec/**`・`*.test.*`・`*.spec.*`・`*_test.go`・`test_*.py`・`*_test.py`・`conftest.py`。Java の `src/test/java/**` は `**/test/**` で当たる)、(c) 製品のコードの側で検証を無効にする変更(フィーチャーフラグ、`if (process.env.NODE_ENV === 'test') return`)、(d) テストの補助関数(`helpers/`)の中の `expect` を消す変更は、補助のファイルが testPatterns に当たる場合だけ拾う

#### 5.2 「テストのみの変更で失敗が解消した変更」の機械判定

- [確認] 現行のテンプレートは、PR のコミット列も、チェックの履歴(check runs)も読まない。`check-pr.mjs` が GitHub から読むのはラベル・ラベルの events・レビュー・コミットの作成者(`gate-g5.yml:401-435`)
- [推測] 厳密な判定は機械ではできない。理由: (1) 自己修正のループはローカルで回り、失敗した実行は push されない(push された先頭にしか CI は走らず、1回の push に積んだ中間のコミットに結果は無い)。(2) force-push で前の先頭は PR のコミットの一覧から消える(timeline の `head_ref_force_pushed` の before/after は残る)。(3) 失敗の原因がテストと製品のどちらにあったかは結果からは分からない(不安定な試験の再実行で通る場合もある)
- 近似の候補 [推測。いずれも未実装・未試行]:
  - (A) 履歴型: PR の先頭が更新された各時点(synchronize)の `test` ジョブの結論を check runs から引き、「直前の先頭で失敗 → 次の先頭で成功、かつ2つの先頭の差分がテストのパスだけ」の組をラベルにする。取りこぼし: ローカルで解消した失敗、同じ push で製品とテストを両方変えた場合。誤検出: 不安定な試験の修正、テストの側の本当の誤りの修正(正当)
  - (B) 静的な近似: PR 全体で製品のコードを変えず(規模の算定の `counted` が 0)、基底にあるテストの削除行がある(IMPL-0203 の一覧が空でない)PR に「テストだけの変更」として印を付ける。取りこぼし: 製品とテストを同じ PR で変えた場合(ほとんどの自己修正はこれ)
  - (C) 再実行型: PR の先頭の製品のコードに対して、基底の版のテスト(PR が書き換えたテストの旧版)を流し、旧版が落ちて新版が通るファイルを出す。「期待を変えないと通らなかった」ことを実行で示せる。製品のコードを実行するため gate-g5(PR の側)でしか流せず、統制の設定を変える PR では信頼しないデータになる(`gate-g5.yml:9-13`)。実行の費用は試験の2倍。仕様変更に伴う正当な改めも同じく出る
  - 自己修正ループの内側は、IMPL-0187 のフック(ロック中のテストへの書き込みの遮断と拒否の記録 `.claude/denied.log`)が受け持つ。CI の側の近似は、ロックの外を補うものと位置づけられる

#### 5.3 「根拠の決定を引かずに改めた期待値」を機械で判定できる条件 [推測。条件の整理]

機械が判定できるのは、次の3つが揃うときに限る。
1. 改めた期待値を差分から特定できる: 同じ hunk の中で、削除行のアサーションと追加行のアサーションが対になっている(現行は削除行だけを候補に出し、新しい期待値を示さない。標準 `:1048` は旧・新・根拠の一覧を求める)
2. 根拠を書く場所が構造で決まっている: 例 PR 本文の節(「## 期待値の改め」に `ファイル:行 | 旧 | 新 | 根拠`)、またはテストのコードの注釈(`// basis: ADR-0012 決定2` / `F-001/AC-3`)。ADR-0089 決定3 に倣うなら自由記述の理由ではなく識別子
3. 引いた識別子が解決できる: `context/decisions/ADR-NNNN*.md` の実在、`specs/F-NNN/spec.md` の受入基準の表の `#` の実在(`readAcceptanceCriteria` で引ける)、規程・本標準の条項の番号(書式の検査だけ)。Issue 番号だけは根拠に数えない(`:1048`)

判定できないもの: 引いた決定が、改めた挙動を本当に定めているか。EV-0182 の根拠の事例(`:1058`。#319 の突合で、引いた決定がその挙動を定めていなかった事例)は、まさにこの機械で閉じない部分である。したがって機械が出せるのは「根拠の欄が無い / 解決できない識別子を引いた」改めのラベルまでで、それ以上は G-6 の人の確認になる。

緊張点(会議体で扱うべきもの)[確認した条文どうしの関係]: ADR-0089 決定3 は回帰の試験について「形の検査(欄と決定の実在)を合否に使う」とした。一方、標準 `:1046` は検証を弱める変更の検出を G-5 の合否に使ってはならないとし、`:1050` は期待値の差分による機械の阻止を課さないとする。採用者の製品のテストで根拠の欄の欠けを G-5 の失敗にすると `:1046` と衝突しうる。ラベル(合否に使わない)に留めるか、欄の欠けだけを形の検査として失敗にするかは、決める必要がある

#### 5.4 IMPL-0205(対象のパスの突合)の実装の案 [推測]

- 入力: トレーラ `Spec:` の各タスク(`specFindings` の `specs`)の、`specs/F-NNN/plan.md` の「変更の対象パス」の升。`readPlanMappings` と同じ型で列を読み、バッククォートの中身を glob として `matchGlob` で照らす
- 出力: (a) どのタスクの対象パスにも当たらない変更されたパスの一覧、(b) 変更が1件も無い対象パス(任意)。合否に使わない材料として PR へ出す(標準 `:1079` は「出す」だけを求め、止めることは求めていない)
- 決めることの候補: (1) **計画を基底から読むか先頭から読むか**。先頭から読むと、同じ PR で対象パスを広げれば差は消える(テンプレ7 の「エージェントが自分で範囲を広げてはならない」を素通りする)。基底から読むか、計画の対象パスの列の変更自体を一覧に出す。(2) テスト・fixture のパスを対象パスに含めるか。様式の「テストの方針」の表の「どこに置くか」を読むか、テストのパスを別枠で出すか。含めないと、ほぼ全 PR でテストのパスが差に出る。(3) 読めない升(バッククォート無し、文章)の扱い。readPlanMappings の方針(読めなければ 0 件として示す)に倣うなら「対象パスを読めない」を出す。(4) `Spec: setup`・bot の PR・文書だけの PR は対象外とし、その旨を出す。(5) IMPL-0200(#358、実行時の書き込み範囲を対象パスに限る)と同じ列を読むため、読む関数を1つにする

#### 5.5 ラベルの付与の案と制約

- [確認] PR の側の gate-g5(pr-rules)は `pull-requests: write` を持ち、コメントは既に書いている。ここでラベルを付けるのが最小の経路だが、**PR の側のスクリプトで動く**ため、`check-pr.mjs` を書き換えた PR は検出を消せる。ただし `check-pr.mjs`(`scripts/gate/`)は統制の設定(CONTROL_FILES)であり、gate-g5-base の 3c が AI維持管理者本人の承認を求める(`check-pr.mjs:47-52`)。消すこと自体は止めないが、承認なしには取り込めない
- [確認] 既定ブランチのコードで動く gate-g5-base は、書き込みの権限を足してはならない(`gate-g5-base.yml:16`)。既定ブランチの判定でラベルを付けるなら、ai-review.yml と同じく「判定のジョブ(read)」と「書き込みのジョブ(`pull-requests: write`。入力は判定の出力と PR 番号だけ)」を分ける型になる
- [推測] GitHub の仕様の未確認の点: (a) PR へのラベルの付与(`POST /repos/{o}/{r}/issues/{n}/labels` / `gh pr edit --add-label`)に要る権限が `pull-requests: write` で足りるか `issues: write` が要るか。(b) 存在しないラベルを付けると自動で作られるか(テンプレートの前例は `gh label create ... || true` で先に作る)。(c) GITHUB_TOKEN で付けたラベルは `labeled` の契機で新しいワークフローを起動しない(GitHub の既知の仕様。gate-g5 は `labeled` で起動するため、起動しないなら再帰は起きない)。(d) フォークからの PR の `pull_request` の GITHUB_TOKEN は read だけになり、ラベルもコメントも書けない(現行のコメントも同じく warn に落ちる)
- [推測] ラベルは誰でも外せる。外しても G-6 の確認事項から消えないようにするには、停止の申し立てと同じく付け外しの履歴で判定するか、ラベルではなくコメント・ジョブの要約を正とする必要がある。標準 `:1046`・`:1083` は「ラベル」を名指すが、`:1046` 自体は「必須の確認事項として示す」だけで手段を固定していない(`:1083` と IMPL-0204 の note はラベルを名指す)

### 6. 実行での確認 [確認]

- コマンド: worktree の根で `node template/scripts/gate/test-check-pr.mjs`(Windows 11、Git Bash)
- 結果: **exit 0**。出力 180 行、`ok` 178 行、`NG` 0 行。末尾「PR の検査の試験: 149 場面と付随の確認が、期待と一致しました」
- IMPL-0203 の場面: `ok 既存のテストの期待値を書き換える(一覧に出る。失敗にはしない)`、`ok 既存のテストを削除する(一覧に出る)`、`ok 一覧の Markdown に印とファイルが出る`
- ログ: `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\770ecf3d-4ce9-4896-b267-c7e0a80da58f\scratchpad\360a\run-test-check-pr.log`
- 補足: 絶対パス(`E:/Github/...`)で node を起動するコマンドは、worktree の分離のフックが「git の形を確かめられない」として拒否した。worktree の根からの相対パスで起動して通した(試験そのものの失敗ではない)

### 7. 要点

1. IMPL-0203 は削除行だけを見るため、**行の追加だけで書ける skip・xfail の付与を一覧に出さない**(実行で確認)。IMPL-0204 には追加行の検査が要る
2. PR へラベルを付ける仕組みはテンプレートに無い。`/human-verify` 順4 と標準 `:1083` の「機械判定が付けたラベル」は指す先が無い
3. 実装計画の「変更の対象パス」の列を読むコードは無い。`readPlanMappings`・`specFindings`・`matchGlob` の組み合わせで IMPL-0205 を組める。計画を基底から読むかが要の決定
4. 印の欄・期待値の根拠の書式は process-compass の回帰の試験(ADR-0089)にしかなく、採用者の製品のテスト向けの書式はテンプレートに無い
5. 「テストのみで失敗が解消」は厳密には機械で判定できない。履歴型・静的な近似・再実行型の近似があり、いずれも取りこぼしと「正当な変更と区別できない」出力を持つ
6. 「根拠を引かない期待値の改め」を機械が判定できるのは、根拠の欄が構造で決まり、識別子の実在を確かめられる範囲まで。引いた決定が挙動を定めているかは人の確認(EV-0182 の事例そのもの)
7. 根拠の欄の欠けを G-5 の失敗にするかは、標準 `:1046`・`:1050` と ADR-0089 決定3 の間で決める必要がある

---

## 論点B: #360 論点B・論点E の内部調査(2026-11-12)

凡例: 【確認】= ファイルを読んだ・node で実行して確かめた事実 /【文書】= 提供者の公開文書で確かめた(実機は未確認)/【推論】= 確認した事実からの推論で、文書にも実機にも明示が無い。
所在の行番号はワークツリー agent-ac3554bff57c26e92 の現時点のもの。

---

### 論点B: 中間の層へのマージの拒否(IMPL-0248・0254・0255)

#### B-1 条項とマークの現状【確認】

- 条項: `src/content/docs/phase4-process-design/gate-criteria.md:2061`「取り込み先が既定ブランチになるマージだけを行わなければならない。既定ブランチ以外へ取り込むマージ(手動のスタックの中間の層のマージ)をしてはならない」。説明の段落は同 :2065〜2067
- マーク: 同 :2071(IMPL-0248)・:2072(IMPL-0254)・:2073(IMPL-0255)。3件とも target=rulesets, state=undelivered, issue=360, review=2026-11。依頼文の「2069〜2071 行」から2行ずれている(前に IMPL-0247 が :2069)
- 3件の note は「AI の担い手のマージは .claude/settings.json の ask(gh pr merge)で人へ戻る」と書く。後述 B-4 のとおり、現行のテンプレートではフック guard-bash.mjs が `gh pr merge` を**拒否**しており、note の記述(ask)は実装より弱く書かれている(食い違い。強度は実装の方が強い)
- 本体の頁 `src/content/docs/phase5-implementation/stacked-pr.md:106`(事故の型の表「中間層の先行マージ … 手段は未確定」)、:109(「ルールセットの対象を機能ブランチへ広げる案は、直接の push の扱いを実機で確かめていないため採っていません。拒否の手段は、準拠テンプレートに実装がありません」)、:131(手順の禁止)、:190(AI への指示の表「強制層 … 準拠テンプレートに無い。AI の担い手のマージは、権限設定でマージの前に人へ戻る」)
- EV-0139(`stacked-pr.md:26`〜、見直し 2027-04): ネイティブのスタックの挙動(基底の保護規則での評価、一括の取り込み、github.base_ref)。E1、実機未確認。中間層の拒否の手段そのものは EV-0139 の対象外
- ADR: `src/content/docs/adr/0078-rejudge-on-change-and-irreversible-operation.md:58〜64`(決定3 / K-4)。:62「中間層の先行マージを拒否する設定はテンプレートに無く、undelivered で表示します(IMPL-0248・0254・0255)」、**:64「ルールセットの対象を機能ブランチへ広げる案は採りません。直接の push の扱いを実機で確かめておらず、着地の保護で足りるためです」**。:24 は旧記述(CI の必須チェックで拒否)の誤りの記録。ほかに grep「スタック|中間」で当たった ADR は 0013(頁の索引の追加だけ)
  - 突合上の注意: 対象を既定以外へ広げる案は ADR-0078 で「採らない」と既に決まっている。これを採る場合は、採用済み ADR の記載を新 ADR で置き換える必要がある
- 受付: `research/360-deliberation/intake.md` の振り分け表は B を「テンプレートへ降ろす(降ろせない場合は降ろさない理由を ADR へ)」、手段の成立は GitHub の文書で確かめるとする

#### B-2 テンプレートのルールセットと降ろし先の定義【確認】

- `template/.github/rulesets/` = team / safety / regulated / checks-only(4本とも `ref_name.include: ["~DEFAULT_BRANCH"]`, exclude 空)、records / records-signed(`refs/heads/records`)。例 `template/.github/rulesets/team.json:6`
- 規則: pull_request(承認・last push 承認など)、required_status_checks(gate-g5・gate-g5-base、strict)、non_fast_forward、deletion。bypass actor なし(README が「bypass actor を足さない・exempt を使わない」を明記)
- 適用の手段: 人が `gh api repos/{owner}/{repo}/rulesets --input .github/rulesets/team.json`(`template/.github/rulesets/README.md`「適用のしかた」)。私有リポジトリで無料プランはルールセット不可 → 集約の事後検出だけ(同 README)
- `src/data/impl-targets.yaml`:
  - :140 `pr-checks` = scripts/gate/check-pr.mjs
  - :216 `rulesets` = .github/rulesets/README.md
  - :415 `gate-g5-workflow` = .github/workflows/gate-g5.yml
  - **:427 `rulesets` が重複**(path .github/rulesets/team.json、description「既定ブランチ以外を基底とする PR のマージは対象の外(Issue #294)」)。`scripts/check-impl.mjs:108` は `Object.fromEntries` で読むため後勝ちで team.json が有効。node で重複を確認(`dups ['rulesets']`、有効な path = .github/rulesets/team.json)。本件の範囲外の欠陥だが、IMPL-0248 等の降ろし先の実在検査はこの後勝ちの値で行われる
  - 関連: :319 guard-write-hook、:325 guard-bash-hook(.claude/hooks/guard-bash.mjs)

#### B-3 GitHub のルールセットで「既定以外へのマージだけを拒否し、作業ブランチへの直接の push は許す」が成り立つか

取得日はすべて 2026-11-12。

【文書】各規則の定義
- Available rules for rulesets — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
  - Restrict updates: "only users with bypass permissions can push to branches or tags whose name matches the pattern"
  - Require a pull request before merging: "You can require that all changes to the target branch be associated with a pull request"
  - Require status checks: "...before collaborators can make changes to a branch or tag targeted by your ruleset"
  - 基底ブランチで PR を制限する規則は無い(記載なし)
- REST API(Repository rules)— https://docs.github.com/en/rest/repos/rules
  - `pull_request`: "Require all commits be made to a non-target branch and submitted via a pull request before they can be merged." → 対象ブランチへの直接の push を止める
  - `update`: "Only allow users with bypass permission to update matching refs." → マージも ref の更新であり止まる(【推論】マージが update に数えられることの明示は文書に無い)
  - `merge_queue`: "Merges must be performed via a merge queue."
  - bypass_mode: `always` / `pull_request`("an actor can only bypass rules on pull requests")/ `exempt`。**「push は迂回できるが PR のマージは迂回できない」形の値は無い**(pull_request はその逆)
  - ref_name.include の特別値 `~DEFAULT_BRANCH`・`~ALL`、exclude を併用可
- About protected branches — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - 必須レビュー: "collaborators can only push changes to a protected branch via a pull request"
  - Restrict who can push: 許可された者だけが push でき、PR を要する設定はその者にも残る
  - 基底ブランチで PR を制限する設定は無い
- Merge queue の提供範囲 — https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request-with-a-merge-queue および managing-a-merge-queue: "available in any public repository owned by an organization, or in private repositories owned by organizations using GitHub Enterprise Cloud"。個人所有のリポジトリでは使えない

【推論】結論: ルールセット(とブランチ保護)だけでは**成り立たない**
- 規則は「対象の ref の更新」に掛かり、更新の経路(直接の push か PR のマージか)を区別して「マージだけを拒む」規則は無い。区別できるのは bypass_mode=pull_request だけで、向きが逆(PR 経由なら迂回を許す)
- 対象を `~ALL` から `~DEFAULT_BRANCH` を exclude した形(または `feature/**` 等)にした場合:
  - `update` を置く → 層のブランチへの直接の push も止まる(bypass に開発者を入れると、マージも迂回できる)
  - `pull_request` を置く → 層のブランチへの直接の push が止まる(文書の定義どおり)。PR で層を更新する運用は、層の上にさらに層の PR を要し、手動のスタックが成り立たない。しかも中間の層の PR のマージは止まらない(PR を要する規則は PR のマージを許す)
  - `required_status_checks` に「基底が既定でなければ失敗する検査」を置く → 中間の層の PR のマージは止まる。ただし、直接の push は検査を通っていないコミットとして拒否されると考えられる(文書は "before collaborators can make changes to a branch" とだけ書く。直接の push への効き方は文書で明示を得られなかった。未確認)。さらに `strict`・新規作成時の扱い(`do_not_enforce_on_create`)の設計が要る
  - `merge_queue` を置き、キューの必須検査を常に失敗させる → 中間のマージは止まるが、組織所有の公開リポジトリか Enterprise Cloud の私有に限られ、採用者の多く(個人所有・無償)で使えない。直接の push への効き方は文書に無い(未確認)
- よって「直接の push は許し、中間の層のマージだけを拒否」は、手動のスタックの運用(層のブランチへ push を重ねる)と両立する形では、文書の範囲では組めない。ADR-0078:64 の「直接の push の扱いを実機で確かめていない」は、文書の範囲では「止まる」側に寄る(実機は未確認のまま)

#### B-4 テンプレートの AI 向けの統制の現状【確認】

- `template/.claude/settings.json`: `Bash(gh pr merge:*)` は **ask**(:67)。`gh pr review` は deny(:34)、`gh api -X PUT/POST/PATCH/DELETE` は deny(:36〜43)、`gh api repos/*/rulesets` と `gh api graphql` は ask
- `template/.claude/hooks/guard-bash.mjs`(PreToolUse Bash に登録。settings.json の hooks)は `gh pr merge` を**拒否**(:182。exit 2、`.claude/denied.log` へ記録)。冒頭のコメントは「guard.enabled に依らず有効」。したがって AI の担い手の `gh pr merge` は ask ではなく拒否される。node で `hostingWriteOf` を呼び確かめた結果:
  - `gh pr merge 12 --squash` → 拒否 / `gh pr merge --auto 3` → 拒否 / `gh api -X PUT repos/o/r/pulls/5/merge` → 拒否
  - `gh pr create --base feature/a ...` → 通す / `gh pr edit 5 --base feature/a` → 通す
  - **`git merge feature/b && git push origin feature/a` → 通す**(手元で上の層を下の層へ併合して push する経路。PR のマージではないが、効果は中間の層への取り込みと同じ)
  - 補記: 実行確認の際、フックを標準入力で起動した1回目が `template/.claude/denied.log`(.gitignore の `*.log` で無視されるファイル)を新規に作った。直後に削除し、元の状態(ファイルなし)へ戻した
- `gh pr merge` の基底を見られるか: `gh pr merge` は基底を引数に取らない(基底は PR の属性)。フックが基底を知るには `gh pr view <n> --json baseRefName` 等の問い合わせが要る。現状はマージを一律に拒否しているため、基底で分ける必要は無い(AI の PR のマージ自体が強制層で止まる)
- CLAUDE.md(テンプレート)の索引の行は「権限設定(guard.enabled の構成では拒否。それ以外は確認つき)・フック(guard-bash.mjs)」と書く。フックは guard.enabled に依らず拒否するため、IMPL-0248・0255 の note・stacked-pr.md:190 の「ask で人へ戻る」は現行の実装を弱く書いている

#### B-5 ワークフロー・集約の現状【確認】

- `template/.github/workflows/gate-g5.yml:18` の `pull_request` は基底で絞らない(IMPL-0247 delivered)。`gate-g5-base.yml:39` は `pull_request_target`(opened 等)。どちらも基底が既定ブランチでない PR でも走る
- check-pr.mjs は基準値などを `--policy-base`(既定ブランチ)から読む(IMPL-0249)。**基底が既定でない PR を失敗させる検査は無い**(grep で該当なし)
- `record-copy.yml:47〜62` は `pull_request_target: closed` かつ `merged == true` で動き、基底を問わない。写しに `base.ref` を残す(:92・:142)。→ 中間の層のマージも写しとして記録用ブランチに残る
- `aggregate-evidence.mjs` は写しの `base.ref` を読まない(grep `base.ref|baseRef` の当たりは check-delegation.mjs:251 だけ)。中間のマージを欠落として数える処理は無い

#### B-6 代わりに取れる手段と強度(案)

| # | 手段 | 効き方 | 人のマージ | AI のマージ | 限界 |
| --- | --- | --- | --- | --- | --- |
| 1 | 現行のフック guard-bash.mjs(gh pr merge の一律拒否) | 拒否(抑止の層) | 効かない | 効く(既存) | `git merge`+`git push` の経路、担い手が書いたスクリプトから API を呼ぶ経路は止めない(フック自身が抑止の層と開示) |
| 2 | ルールセットを既定以外へ広げ、必須チェック「基底が既定ブランチ」を置く | 拒否 | 効く | 効く | 層のブランチへの直接の push が止まる見込み(未確認)。ADR-0078:64 の不採用と衝突。手動のスタック自体が成り立たなくなる可能性 |
| 3 | ルールセットを既定以外へ広げ、`update` / `pull_request` | 拒否 | 効く | 効く | 直接の push も止まる(文書)。手動のスタックと両立しない |
| 4 | merge_queue で既定以外のマージを止める | 拒否 | 効く | 効く | 組織所有の公開か Enterprise Cloud の私有だけ。直接の push への効き方は未確認 |
| 5 | check-pr / gate-g5-base に「基底が既定でない」を出す検査(失敗または注記) | 表示(マージは止めない) | 効かない(基底のブランチに保護が無ければ必須にならない) | 効かない | 失敗にすると、正当に開いている上の層の PR が常に赤になる。ネイティブのスタックでは `stack.base.ref` を見ないと誤判定(EV-0139: 上の層の base_ref の値は未確認) |
| 6 | マージの後の検出: record-copy の写しの `base.ref` が既定ブランチでない PR を、出荷の集約が記載の欠落に数える(+ 必要なら pull_request_target closed で Issue・コメントへ通知) | 検出(事後) | 効く | 効く | 止めない。検出は出荷時(通知を足せばマージ直後)。写しが届かない構成(records 未初期化・無料プランの私有)では、API の PR 一覧から `base.ref` を引く代替が要る。ネイティブのスタックで基底が既定のものは除外する判定が要る |
| 7 | ネイティブのスタックへ寄せる(手動のスタックを使わない) | 機構による(各層を基底の規則で評価、一括取り込み) | — | — | スタックの基底を既定以外にできる(stacked-pr.md:20)。EV-0139 で実機未確認。手動のスタック・外部ツールの採用者には効かない |

所見(推論):
- 「拒否」をホスティングで得る形(2〜4)は、いずれも手動のスタックの直接の push と両立しないか、提供範囲が狭い。文書の範囲では、マーク(target=rulesets)が想定した「中間の層へのマージを拒否する設定」は、手動のスタックを残したままでは降ろせない
- 実効のある組は「AI は現行のフックで拒否(既存)+人のマージは事後の検出(6)」。これは条項の「してはならない」に対し、人については拒否でなく検出であり、state=delivered にできるのは AI の側(と検出)まで。人の側は「降ろさない理由」を ADR に残す対象になる
- 中間の層のマージの実害は、ADR-0078 と gate-criteria.md:2065 のとおり「層ごとの確認の粒度の喪失」で、既定ブランチへの着地では G-5・G-6 が掛かる。検出(6)は IMPL-0250(層の合わさった差分への1件の承認を層ごとの確認に数えない。issue=359)の材料にもなる
- 実機の確認が要る点: (a) 既定以外を対象にした required_status_checks が直接の push を拒否するか、(b) ネイティブのスタックの上の層の `github.base_ref`、(c) `update` 規則が PR のマージを止めるか

---

### 論点E: L2 の採点の稼働の機械の検証(IMPL-0102)

#### E-1 条項と根拠水準【確認】

- 担保水準の表: `gate-criteria.md:1837〜1854`。L2 の条件 :1852「変更のリスクを機械的に採点し、閾値で審査深度を変える運用が稼働している。かつ、取り消し可能性が担保されている」→「行数上限を規範から外す。リスクスコアと結果指標で管理する」
- :1854「**水準は自己申告ではなく、条件の充足を記録で示します**。示せない場合の既定は L0 です」
- EV-0006(:1856〜、見直し 2027-08、E2 単一事例): L2 で行数上限を外せる判断。一次事例の限界は :1864〜1870
- 基準値を超えた変更の扱い :1931〜: 要求事項4(:1937)「L1 以上の宣言に、リポジトリ内で実在する根拠がある場合、規模の確認は保証の所在の記入だけでよい。宣言は記録であり、緩和を自動で与えない。根拠の実在と、見直し日を過ぎていないことだけを機械で確かめる」、要求事項7(:1940)「基準なし(null)は、L2 の宣言と実在する根拠、確約範囲・コア指定のパスの宣言(追跡中のファイルに当たるもの)、R1・R2 でなく、そのパスに触れない変更だけに効く」
- 限界の開示 :1955「担保水準 L1・L2 の宣言は、根拠のパスの実在と見直し日だけを確かめる。根拠の中身(条件の充足)は確かめない」
- マーク: :1966 IMPL-0099(delivered)、:1968 IMPL-0101(process-change-skill, delivered)、:1969 IMPL-0102(undelivered, issue=360)
- EV-0084(:1971〜、見直し 2027-04、E0): 超過の扱いと task.assurance の宣言
- 対応づけ: :1245「リスクの採点で審査の深さを変える運用は、担保水準 L2 が受ける」。ADR-0101:46 も同じ(2つ目の経路を新設しない)
- ADR-0058 決定5(`src/content/docs/adr/0058-size-over-is-confirmed-not-blocked.md:81〜85`): 機械が確かめるのは根拠のパスの実在と見直し日だけ。L2 の稼働の機械の検証は「検査できる条件が定まっていない」ため undelivered。同 :69(null の条件、委任の規模条件は null でも既定値で縛る)。不採用の表 :114「L1・L2 の宣言を自己申告のまま降ろす → 形骸化する。そのため宣言は記録とし、緩和は根拠の実在と区分の条件の範囲に限った」、:108「UCL・モジュール数の導出 → 機械で検査できる条件が定まらず、自己申告・偽装の余地が大きい」
- ADR-0079 は「担保水準」で当たらない(gate-criteria.md :1958 からの参照は規模の超過の「課さないこと」)

#### E-2 テンプレートでの扱い【確認】

- `template/scripts/gate/config.mjs:2135 assuranceOf`: level が L0 以外なら、L0〜L2 か・basis の記入と実在・reviewAt の形式と期限を確かめ、満たさなければ L0。中身は読まない
- `check-pr.mjs:1286 effectiveSizeLimits`: null が効くのは L2 成立・コアのパスが追跡中のファイルに当たる・記載 R3・下限 R3・コアに触れない、のすべて。`check-pr.mjs:1478` は既定ブランチ(atPolicy)の構成と根拠の実在で判定(PR の側で根拠を足しても効かない)
- `check-pr.mjs` で assurance を使うのは規模の判定だけ(:1264 sizeAttestationProblems、:1286、:1384、:1478〜1548)。**L2 は G-6・承認・委任の扱いを変えない**(grep の範囲で確認)。テンプレートはリスクスコアを入力として受け取らない
- 宣言の変更の経路: `/process-change` 種別 settings(`template/.claude/skills/process-change/kinds/settings.md:17・42〜50`)。L0→L1・L2 は緩める向き(記名と理由)。basis が実在しなければ書き込みを拒否。settings.md:48 が「L2 の機械の検証はテンプレートに降ろしていない(undelivered)」と開示
- 構成の `task` は統制の設定の鍵(`check-pr.mjs:507 CONTROL_CONFIG_KEYS = ['ci','task','guard','aiReview']`)。宣言を変える PR は統制の設定の変更として AI維持管理者本人の承認のレビュー(gate-g5-base)と出荷の集約の対象(aggregate-evidence.mjs:1939)
- node で確認: basis に無関係な既存ファイル `README.md` を指した L2 の宣言が `valid: true` になり、R3・コア外の変更で `maxLines: null`(基準なし)が効く。R2 と書けば既定値へ戻る
- 補足: R3 の記載は作成側が書ける(R1・R2 の `確定した者:` は指示した者以外の人を要するが、R3 には無い)。null の効く範囲は、区分の下限の規則(riskFloor)とコアのパスで機械が下支えする

#### E-3 「採点の稼働」を機械で検査できる条件の候補(案)と、自己申告を超えるか

| # | 候補 | 何を確かめるか | 自己申告を超えるか(推論) |
| --- | --- | --- | --- |
| 1 | 採点のワークフローの実在(例 `.github/workflows/` に採点のジョブ、必須チェックに採点の check run) | 仕組みの存在 | 一部。ファイルの実在は確かめられるが、採点の中身(モデル・閾値の妥当性)は確かめない。常に低スコアを返すジョブでも通る。必須チェックへの登録はルールセットの適用(人)と env-check に依る |
| 2 | PR ごとの採点の出力の記録(check run の出力・PR のラベル・記録用ブランチの写し) | 稼働の事実(全 PR に採点があるか) | 超える(ホスティングの記録で照合できる)。ただし採点の正しさは超えない。出荷の集約が「採点の無いマージ」を欠落に数える形は作れる |
| 3 | 閾値と審査深度の対応の記録(スコア帯 → 必要な承認数・読む範囲)と、マージ済みの PR で実際の承認がその対応に一致するか | 「閾値で審査深度を変える」の実行 | 超える(承認の記録と照合)。ただし対応表そのものは採用者の申告で、現行テンプレートは審査深度を変えない(L2 は規模の null だけ)。照合の対象となる「深度の差」がテンプレート側に存在しない |
| 4 | 結果指標(取り消し率・インシデント)の観測とスコア帯ごとの比較 | 採点が効いているか | 観測は出せるが、EV-0006 の限界(選択の効果)により採点の妥当性の判定には使えない。差し替え条件の材料に留まる |
| 5 | 取り消し可能性の担保(段階的ロールアウト・本番監視)の実在 | L2 の第2条件 | 置き場がリポジトリの外(配備基盤)にあることが多く、機械で確かめにくい。impl-targets の deploy.yml は planned |

- 所見(推論): 2 と 3 は記録の照合として自己申告を超えうるが、3 はテンプレートが審査深度を変える機構を持たない限り照合の相手が無い。L2 の緩和を規模の null に限っている現状では、採点の稼働を検査しても、緩和の範囲(R3・下限 R3・コア外)は変わらない
- 条件を条項で定める場合は採用者への新しい義務(受付 intake.md の「重へ上げる」の条件)。定める候補は 2(採点の出力の記録の存在を出荷の集約で確かめる)が最も検査可能

#### E-4 条件を条項で定めない場合に残る統制【確認】

- 根拠のパスの実在(既定ブランチの先端で)と見直し日(過ぎれば L0。G-5 が通知)— config.mjs:2135、check-pr.mjs:1478・1506
- 緩和の範囲の機械の限定: null は L2 成立 + コアのパスの宣言(追跡中のファイルに当たる)+ R3 + 下限 R3 + コアに触れない、だけに効く(check-pr.mjs:1286)。委任の規模条件は null でも既定値(ADR-0058:69)
- 宣言の変更は統制の設定の変更(task 鍵)で、AI維持管理者本人の承認と、/process-change の記名・理由(緩める向き)を要する
- 開示: gate-criteria.md:1955 の限界、settings.md:48、実装台帳の undelivered(IMPL-0102)、EV-0006・EV-0084
- 残る隙(推論): 根拠の中身は誰も機械では読まない(無関係なファイルで成立する。node で確認)。「水準は自己申告ではなく、条件の充足を記録で示します」(:1854)と、機械が実在だけを見ることの間は、変化点の決定者と AI維持管理者の人の確認に依る。条件を定めない決定を採るなら、:1854 の「記録で示す」の確かめ手を誰にするか(現状 IMPL-0101 の「変化点の決定者」)を明記するのが整合的

---

## 論点C: #360 論点C 内部調査と実行での確認(IMPL-0253・IMPL-0155)

- 調査日: 2026-11-12
- 対象: worktree `agent-ac3554bff57c26e92`(HEAD 4c03b68)、submodule `template/`(初期化済みの版)
- 表記: **[確認]** = ファイルを読んだか node で実行して確かめた事実。**[推測]** = 確かめていない見込み。**[外部未確認]** = 外部の道具・GitHub の仕様についての記憶で、本調査では一次資料を確かめていない

### 0. 結論の要旨

1. [確認] 現行の `ai-review.yml` は、決まった手順を**許す形の一覧**(`template/scripts/gate/base-judge.mjs` の `AI_REVIEW_FIXED`・`aiReviewAllowlistProblems`)で固定している。採用者が足せる手順は `actions/setup-*` だけ。差し込みの `run:` の env に足せるのは `secrets.*` の行だけ。このため、**入力の記録・指摘の欠落の表示を、決まった手順として足すには、許す形の一覧そのものの改修が要る**。差し込みの `run:` の中に書く形なら、今の一覧のままでも通る(下の 4.2 の試行 B・C)。ただし、その形では採用者の任意の実装になり、テンプレートが降ろしたことにならない
2. [確認] 出力の置き場は、ジョブの要約(`GITHUB_STEP_SUMMARY`)だけ。成果物(artifact)のアップロードは無い。一覧は `actions/upload-artifact` を拒む(試行 E)
3. 入力のうち、ワークフローが機械で列挙できるものと、差し込む道具にしか分からないものは分かれる(2章)。前者の記録は、決まった手順として降ろせる。後者は差し込み口の契約(道具の実行の記録を決まったパスへ書かせる)でしか届かない。契約を守らなかった実行は、「列挙できない確認」と機械が表示できる。ただし、契約に沿った記録が道具の実際の受け取りと一致するかまでは、機械では確かめられない
4. 指摘の構造を差し込み口の契約で定めることは、標準の「書式を定めない」と両立しうる。標準は「組織が欄の欠落を検査するために構造を定めることは妨げない」としているからである。両立の条件は4つ。散文の出力を拒まない。欠落は表示するだけで、指摘を消さない。合否・必須チェックにしない。構造を満たしたことを内容の根拠と表示しない(3章)
5. [確認] template の試験 `test-base-judge-workflow.mjs` は、Windows の作業ツリーのままでは 87/89 になる。原因は CRLF。`record-copy.yml` の読み込みで改行を揃えていない。LF へ揃えた写しでは 89/89 で通過した。`test-check-pr.mjs` は 149 場面が期待と一致した(4章)

### 1. ai-review.yml の構造 [確認]

所在: `template/.github/workflows/ai-review.yml`(207 行、CRLF で取り出されている)

| 項目 | 内容 |
| --- | --- |
| 契機 | `pull_request_target`(opened・synchronize・reopened・ready_for_review)。ADR-0115 の「基底から読む」型。gate-g5-base.yml と同じ |
| トップの権限 | `contents: read`、`pull-requests: read` |
| ジョブ1 `ai-review` | 権限は read だけ。outputs は `enabled` だけ。手順は決まった順で6つ。checkout(既定ブランチ、`persist-credentials: false`、`fetch-depth: 0`、submodule なし)→ 有効かどうか(`process.config.json` の `aiReview.enabled`・`allowForks`、指示の版 `git rev-parse HEAD` を要約へ)→ PR の先頭の取得(`refs/remotes/pr/head` へ fetch。取り出さない)→ 差分の書き出し(`$RUNNER_TEMP/ai-review/diff.patch`・`files.txt`。`instructions.md` の有無)→ **レビューの実行(差し込み口)**(`continue-on-error: true`。env は `AI_REVIEW_INSTRUCTIONS`・`AI_REVIEW_DIFF`・`AI_REVIEW_FILES` と secrets の行)→ 失敗の表示 |
| ジョブ2 `ai-review-notice` | `needs: ai-review`、`always() && enabled == 'yes'`、`pull-requests: write`。checkout せず、秘密情報も AI の出力も受け取らない。定型の文を `gh pr comment` で書く |
| 指示の渡し方 | 既定ブランチの作業ツリーの `.github/ai-review/instructions.md` のパスを env で渡す。PR の側の指示は読まない。指示の置き場は `CONTROL_FILES` に入る |
| 出力の置き場 | 差し込みの実装が、ジョブの要約へコードブロックの中に書く(注記による指示)。PR へのコメントにはしない(read の権限のため 403) |
| artifact | アップロードは無い。一覧が拒む |
| 所在・根拠の注記 | 差し込み口の直前のコメントに、IMPL-0155 の文をそのまま置いている。「このワークフローは、差し込んだレビューの出力がこれらを満たすかを確かめません(AI維持管理者が四半期に抜き取ります)」 |
| 自動で読み込む指示ファイル | コメントに「作業ツリーの CLAUDE.md・AGENTS.md・.claude/** などを自動で読み込む道具は、その読み込みを止める。指示は AI_REVIEW_INSTRUCTIONS だけから与える(機械は確かめない)」とある |
| 許す形の一覧で拒む書き方 | 差し込みの run: で、PR の先頭の参照・`GITHUB_EVENT_PATH`・`gh pr|api|…`・GitHub の API・作業ツリーへ木を展開する git の操作(`show`・`cat-file` を含む)・`GITHUB_ENV`/`GITHUB_PATH`・承認を拒む |

関連の記録:

- IMPL-0333(`human-ai-boundary.md:1098`、delivered、check=machine、test=test-base-judge-workflow.mjs): 指示を、変更が書き換えられない場所に置く。注入の条件(権限の分割、AI の出力を書き込みのジョブへ渡さない、など)も含む
- IMPL-0464(同 1099、undelivered、issue=361): 実機で確かめていない部分。(a) フォークからの PR、(b) **実際のモデルの実行とプロンプトの注入への耐性**(probe-369 は API の鍵を置かず、差し込みを読み出しの模擬に替えた)、(c) 確認の後に入れた定義の変更(許す形の一覧など)の実機の振る舞い
  - → **IMPL-0253・0155 の実装は、実際のモデルを差し込んだ実機の確認を伴わない限り、IMPL-0464(b) と同じ限界を持つ**
- ADR-0048 決定3: 降りないものを、降りたように見せない。IMPL-0155 の note は、これを「注記を置いたまで」の根拠に引いている
- ADR-0115 決定1・2: 変更のコードを実行しない判定は、基底から読む。結果は check run で出し、commit status では出さない。→ 入力の記録・欠落の表示を足す場合も、既定ブランチのスクリプトで動かす必要がある(PR の側のスクリプトを実行しない)
- ADR-0075 決定7・8・10: 決定7 は所在と根拠。決定8 は、欠く指摘を採否の記録で不採用にしてよいこと(「機械は欠落を示すだけで、指摘を消さない」)。決定10 は、書式を定めず、組織が構造を定めることは妨げず、構造を満たしたことを内容の根拠にしないこと
- `src/data/impl-targets.yaml:307` に `ai-review-workflow`(kind: template-file、path: `.github/workflows/ai-review.yml`)がある

### 2. 確認側へ渡した入力の区別(論点2)

#### 2.1 ワークフローが機械で列挙できるもの [確認: 置き場の存在] / [推測: 列挙の方式]

| 入力 | 所在 | 機械での列挙 |
| --- | --- | --- |
| 指示ファイル | `.github/ai-review/instructions.md`(既定ブランチ) | パスと sha256、既定ブランチのコミット(`git rev-parse HEAD`。版は既に要約へ書いている) |
| 差分 | `$RUNNER_TEMP/ai-review/diff.patch` | sha256 とバイト数 |
| 変更したファイルの一覧 | `$RUNNER_TEMP/ai-review/files.txt` | sha256 と行数 |
| PR の先頭・基底のコミット | `refs/remotes/pr/head`・`origin/<base>` | SHA。ただし、差し込みの run: からの参照は一覧が拒む。決まった手順の側で取る必要がある |
| 作業ツリーにあって、道具が自動で読み込みうるファイル | template の既定ブランチには `CLAUDE.md`・`AGENTS.md`・`.claude/`(guard.json・settings.json・hooks・skills。65 ファイル)がある。`.github/copilot-instructions.md`・`.mcp.json`・`GEMINI.md` は無い | パスと sha256 の一覧を出せる。**ただし、これは「読み込まれうるもの」の上限であり、実際に読み込まれたものではない** |
| 作業ツリーの全体 | 既定ブランチ全体を checkout している | 道具に読み取りの道具を与えた場合、確認が見られた範囲の上限は作業ツリー全体になる。ワークフローの注記が禁じるのは、コマンドの実行・書き込み・ネットワークの道具だけ。読み取りは禁じていない [確認] |

自動で読み込みうるファイルの名前の一覧は、道具ごとに違う。例は Claude Code の `CLAUDE.md`・`.claude/settings.json`、Codex 系の `AGENTS.md`、Copilot の `.github/copilot-instructions.md`。[外部未確認] 一覧を固定すると、新しい道具で漏れる。このため「既知の名前の一覧で列挙し、一覧が網羅でないことを表示する」形になる(ADR-0041 の「一覧を網羅の主張として読ませない」と同じ作法)。[推測]

#### 2.2 差し込む道具にしか分からないもの

| 入力 | 理由 |
| --- | --- |
| 実際の起動の指示(システムプロンプト、指示ファイルと差分を組み立てた最終の文) | 組み立ては差し込みの run: の中で行う |
| 道具の定義(モデルへ与えたツールの一覧と定義、MCP サーバ) | 道具の設定と版に依る |
| 実際に自動で読み込まれた指示ファイル | 道具の設定に依る(例: 読み込みを止める設定の有無)。[外部未確認] Claude Code の CLI は既定で `CLAUDE.md` を読み込み、Agent SDK は設定の読み込み元を明示しない限り読まない、と記憶しているが、確かめていない |
| 渡した成果物(仕様・受入基準を、作業ツリーのどのファイルから渡したか) | 差し込みの実装の選択 |

[外部未確認] 道具の多くは、実行の記録(会話の全文、初期化の通知にあるツールの一覧など)を JSON で出せる。例は claude-code-action の実行ファイルの出力、CLI の stream-json。これを読めば、2.2 の大半を「実行の記録から機械が書く」形にできる見込みがある。ただし、出力の形式は道具と版ごとに違う。

#### 2.3 差し込み口の契約として、入力の一覧(パスと sha256)を書き出す方式の実現性

案:

1. **決まった手順「入力を記録する」**を、差分の書き出しの後、レビューの実行の前に置く。既定ブランチのスクリプト(例: `scripts/gate/ai-review-inputs.mjs`)が、2.1 の入力を `$RUNNER_TEMP/ai-review/inputs.json` と要約へ書く(パス・sha256・既定ブランチと PR の先頭の SHA・自動で読み込みうるファイルの候補)
2. **差し込み口の契約**: 差し込みの実装は、道具の実行の記録から、2.2 の入力を `$RUNNER_TEMP/ai-review/tool-inputs.json` へ書く(起動の指示の sha256 と本文または所在、道具の定義、実際に読み込んだ指示ファイル)。パスは `RUNNER_TEMP` から決まるため、env の行を足さなくても渡せる。足す場合は `reviewHead` の改修が要る(試行 F)
3. **決まった手順「入力の記録を照合する」**を、レビューの実行の後に置く。`tool-inputs.json` が無い、または必須の欄を欠く実行には、要約へ「確認側へ渡した入力を列挙できない。文脈を渡していない確認として記録してはならない」と出す(標準 378 行〜の禁止に対応)。候補にあるのに、道具の申告で「読み込みを止めた」とも「読み込んだ」とも言っていないファイルも表示する

実現性の評価:

- [確認] 決まった手順を足すには `AI_REVIEW_FIXED`・手順の並びの検査(`checkout,gate,fetch,input,review,failure`)・試験の変異を改める必要がある。今の一覧では、試行 A(手順の追加)が拒まれる
- [推測] 1 は確実に降ろせる。2 は採用者の実装に依る契約。テンプレートが確かめられるのは「契約のファイルがあり、欄が揃う」ことまで。3 の表示は機械の出力として降ろせる
- [推測] 2 の中身(道具の申告が実際の受け取りと一致するか)は機械で確かめられない。標準は「機械が実行の記録から書いてよい」としており、道具の実行の記録は担い手の自己申告とは別のものとして扱える。一方、差し込みの実装が記録を加工できる点は残る。この限界は、四半期の抜き取りに残す
- 選択肢: 2.2 の部分を `plan=adopter`(採用者が自ら実装する)に分け、1・3 をテンプレートの `delivered` にする形もありうる(`implementation-marking.md:55`)。IMPL-0253 を2つのマークへ分けるかどうかは、会議体の論点になる

### 3. 所在と根拠の欠落を機械で示す方式(論点3)

#### 3.1 標準との両立 [確認: 条項の文] / [推測: 解釈]

条項(`assurance-case.md` 「#### 指摘の書式」): 「本標準は、AI の指摘の書式を定めません。定めるのは含める値です。組織が欄の欠落を検査するために構造(JSON など)を定めることは妨げません。構造を満たしたことを、内容が成り立っている根拠にしてはなりません」。「#### 所在か根拠を欠く指摘」: 「機械は欠落を示すだけで、指摘を消さない」。提出の時点で不成立とすることは課さない。

準拠テンプレートが差し込み口の契約で構造を定めるのは、「組織が構造を定める」の側に当たる。テンプレートは標準ではなく、採用者が取り込む実装の雛形だからである。[推測] 両立の条件:

1. 構造の無い出力(散文)を拒まない。「構造が無いため欠落を検査していない」と表示するだけにする(未達と省略の区別。ADR-0028)
2. 欠落の表示は指摘を消さず、並べ替えず、件数を減らさない。原文はそのまま要約に残す
3. 合否条件・必須チェックにしない。欠落があっても、ジョブを失敗にしない(`continue-on-error` と同じ扱い。H.4 条件4、ADR-0075 決定9)
4. 「構造を満たした」「欠落なし」を、内容が成り立っていることとして表示しない。表示の文に「所在が正しい箇所を指すか、根拠が成り立つかは確かめていない」を定型で添える
5. 標準が「書式を定めない」とした向きに沿うよう、テンプレートの指示(`instructions.md` の「出力」)では構造を**勧める**にとどめる。採用者が契約を捨てる経路を残すかは論点になる(捨てた場合は1の表示になる)

#### 3.2 構造の案 [推測]

`$RUNNER_TEMP/ai-review/findings.json`:

```json
{ "findings": [
  { "id": "1", "location": "src/a.ts:42 | AC-003", "basis": { "criterion": "AC-003", "observed": "…" },
    "claimsExecution": false, "runRecord": null, "text": "…" } ] }
```

- 機械で示せる欠落: `location` の空、`basis.criterion` または `basis.observed` の空、`claimsExecution: true` で `runRecord` が空
- **機械で示せないもの**: 実行の結果を述べているのに `claimsExecution` を偽にした指摘(本文の意味の判定が要る)、`location` が実在の箇所を指すか(差分の範囲との突合はできるが、指す内容の正しさは確かめられない)、`runRecord` の所在が実在し、述べた結果を含むか(所在の形式は確かめられるが、中身の照合は実行の記録の形式に依る)
- `location` が差分(`files.txt`)の外や実在しないファイルを指す場合は、表示の対象にできる(欠落ではなく、所在の不一致として)

#### 3.3 欠落を示す検査の置き場 [確認: 制約] / [推測: 案]

- **ジョブ `ai-review` の後段の決まった手順**(失敗の表示の前後)に置き、要約へ書く。既定ブランチのスクリプトで動かす(ADR-0115 決定1)。試行 D のとおり、今の一覧では拒まれるため、一覧の改修が要る
- **PR へのコメント(ジョブ `ai-review-notice`)には置かない**。IMPL-0333 の注入の条件「AI の出力を書き込みのジョブへ渡さない」と、一覧の「outputs は enabled だけ」に反するため。欠落の件数だけを渡す形も、AI の出力から導いた値を書き込みのジョブへ渡すことになる。差分に誘導された出力で件数を操作できる。採らない方向が妥当と見る
- check run・commit status で出す形も採らない(ADR-0115 決定2。合否条件と誤読される)

#### 3.4 記録の保存期間の問題 [外部未確認]

要約と artifact は、Actions の実行の記録の保存期間に従う(既定 90 日。リポジトリで変えられると記憶)。四半期の抜き取りの間隔(約 92 日)と同じか、それより短い。抜き取りの時点で、記録が消えている実行がありうる。入力の記録を「抜き取りで確かめる」前提にするなら、保存の置き場は論点になる。例は artifact の保存期間の明示、records ブランチへの写し(書き込みの権限が要り、ジョブの分離と衝突する)。

### 4. 実行での確認

#### 4.1 template の試験 [確認]

| 試験 | 結果 | 備考 |
| --- | --- | --- |
| `node scripts/gate/test-base-judge-workflow.mjs`(作業ツリーのまま) | exit=1、**87/89** | NG は「record-copy.yml の変異(pull_request の closed で動く)を検出する」と、それに連鎖した「ai-review.yml を消した構成(aiReview.enabled = false)で、この試験が対象外として通る」(子の実行が同じ NG で落ちる) |
| 同(scripts・.github・adapters・process.config.json を LF に揃えた写しで実行) | exit=0、**89/89** | → 原因は Windows の CRLF での取り出し。試験の 79 行は `read('.github/workflows/record-copy.yml')` を改行を揃えずに使い、84 行の `replace('  pull_request_target:\n    types: [closed]', …)` が当たらない(`m1 !== rc` が偽)。ai-review.yml の側は 105 行で `\r\n` を揃えている。**CI(LF)では起きない見込み** [推測]。論点C の範囲外の欠陥(試験の頑健さ)で、既存の Issue へ寄せる候補 |
| `node scripts/gate/test-check-pr.mjs` | exit=0、149 場面が期待と一致 | `CONTROL_FILES` に `.github/ai-review/**` が入ることなどを含む |

ai-review.yml に関わる試験の中身 [確認]: 対象の判定(無効の構成で消した場合は対象外)、`CONTROL_FILES` と `CONTROL_CONFIG_KEYS`、許す形と否定のリストの変異(約 30)、許す書き換え、ルールセットの雛形に ai-review が無いこと。**所在・根拠と入力の記録を確かめる試験は無い**(IMPL-0253・0155 が undelivered であることと一致する)。

#### 4.2 許す形の一覧への試行 [確認]

スクリプト: `C:\Users\kokor\AppData\Local\Temp\claude\21c0f3064b1f6424\770ecf3d-4ce9-4896-b267-c7e0a80da58f\scratchpad\360c\probe-allowlist.mjs`(現行の `aiReviewWorkflowProblems` に、写しの変異を与えた)

| 試行 | 結果 |
| --- | --- |
| 基準(現行のまま) | 許す |
| A. 差分の書き出しの後に、入力の記録の手順を足す | **拒む**(許していない手順) |
| B. 差し込みの run: の中で、入力の sha256 と CLAUDE.md などの有無を要約へ書く | 許す |
| C. 差し込みの run: の中で、findings.json を `$RUNNER_TEMP` へ書く | 許す |
| D. 失敗の表示の後に、欠落を示す手順を足す | **拒む** |
| E. `actions/upload-artifact` で入力の記録を残す | **拒む** |
| F. 差し込みの env に `AI_REVIEW_INPUT_RECORD` を足す | **拒む**(env に足せるのは secrets の行だけ) |

→ テンプレートとして降ろすには、`AI_REVIEW_FIXED` に決まった手順(record・lint、必要なら upload)を足し、並びの期待を改め、変異の試験を足す必要がある。B・C は採用者の任意の実装としては今でもできるが、テンプレートが降ろしたことにはならない。

### 5. 実装の案・限界・規模

#### 5.1 案(推奨の骨子) [推測]

1. 決まった手順「入力を記録する」(レビューの前)。既定ブランチの `scripts/gate/ai-review-inputs.mjs` が、指示・差分・ファイル一覧・SHA・自動で読み込みうるファイルの候補(既知の名前の一覧。網羅でないことを表示)の、パスと sha256 を書く
2. 差し込み口の契約(`instructions.md` の「出力」とワークフローの注記): `tool-inputs.json`(起動の指示・道具の定義・実際に読み込んだ指示ファイル。道具の実行の記録から書く)と、`findings.json`(勧める構造)
3. 決まった手順「入力の記録と指摘の欠落を示す」(レビューの後)。`ai-review-findings-lint.mjs` が要約へ表示する。表示は、契約のファイルが無い実行の「列挙できない」と「構造が無いため欠落を検査していない」、指摘ごとの所在・根拠・実行の記録の所在の欠落、所在の差分外。ジョブを失敗にせず、指摘を消さず、内容を確かめていない旨を定型で添える
4. (論点)保存: `actions/upload-artifact` を一覧に足し、保存期間を明示するか
5. 実機の確認: 実際のモデルを差し込んだ実行で、契約のファイルが出ること、表示が出ること、注入された差分で表示が偽装されうるか。IMPL-0464(b)・#361 と重なる

#### 5.2 機械で確かめられること / 四半期の抜き取りに残ること

| 機械で確かめられる | 四半期の抜き取り(または実機の確認)に残る |
| --- | --- |
| ワークフローが列挙できる入力(指示・差分・ファイル一覧・SHA・自動で読み込みうるファイルの候補)のパスと sha256 | 道具が実際に受け取った入力(起動の指示・道具の定義・実際に読み込んだファイル)が、契約の記録と一致するか |
| 契約のファイルの有無と欄の揃い。無ければ「列挙できない確認」と表示する | 「文脈を渡していない確認」と記録したもの(人が書く採否・監査の記録の側)に、入力の列挙が付いているか。記録の置き場は ai-review.yml の外 |
| 指摘ごとの所在・根拠の欄の空。`claimsExecution` が真で実行の記録の所在が空 | 実行の結果を述べているのに、そう申告していない指摘 |
| 所在が差分・作業ツリーの外を指すこと | 所在が正しい箇所を指すか、根拠が成り立つか、実行の記録の所在が述べた結果を含むか |
| 散文の出力で、構造を検査していないこと | 散文の出力の所在・根拠 |
| — | 差し込みの実装が記録を加工していないか(実行の記録の真正性) |

#### 5.3 規模の見積もり [推測]

| 部分 | 規模の目安 |
| --- | --- |
| `base-judge.mjs`(`AI_REVIEW_FIXED` に2〜3手順、並びの期待、式の一覧) | 40〜60 行 |
| 新しいスクリプト2つ(入力の記録、欠落の表示) | 計 150〜250 行 |
| 試験(許す形の変異 8〜12、スクリプトの単体の違反と適合の対) | 150〜250 行 |
| `ai-review.yml`(決まった手順と注記)、`instructions.md`(出力の契約)、README(取り込む側の作業) | 60〜100 行 |
| 標準の側: IMPL-0253・0155 の note と state(分割するなら新しいマーク)、台帳の再生成、`template:kb` | 数行と再生成 |
| 実機の確認(一時リポジトリ、モデルの API の鍵) | #361 と合わせて別に見積もる |

合計で 400〜650 行、8〜10 ファイル。実機の確認を除く。

### 6. 会議体へ渡す論点 [推測]

1. IMPL-0253 を「ワークフローが列挙できる部分(delivered にしうる)」と「道具にしか分からない部分(adopter または契約)」に分けるか
2. テンプレートが指摘の構造(JSON)を契約として**課す**か、**勧める**にとどめるか。「書式を定めない」(ADR-0075 決定10)との距離
3. `claimsExecution` のような自己申告の欄を置くか。置かない場合、IMPL-0155 の「実行の結果を述べる指摘」は機械では識別できない
4. 保存期間(既定 90 日 [外部未確認])と四半期の抜き取りの整合
5. 実機の確認を IMPL-0464 と一緒に行うか。モデルの API の鍵が要る
6. 範囲外の発見: `test-base-judge-workflow.mjs` の record-copy.yml の読み込みが改行を揃えていない(Windows で 87/89)。既存の open Issue へコメントで寄せる候補

---

## 論点D: #360 論点D 内部調査と実行での確認(IMPL-0259・IMPL-0479)

調査日 2026-11-12。対象の worktree は `E:\Github\process-compass\.claude\worktrees\agent-ac3554bff57c26e92`(以下、`template/` は submodule の準拠テンプレート)。ファイルは変えていない。試行は scratchpad の `360d/`(py/、go/、proto.mjs、pyshow.py)で行った。

記号の意味: **[確認]** はコードを読んだ、または実行して確かめた事実。**[推測]** は確かめていない見込み。

---

### 1. coverage-check.mjs の構造(node の変更の範囲)

#### 1.1 流れ [確認]

| 段 | 所在 | 内容 |
| --- | --- | --- |
| 範囲の決定 | `template/scripts/gate/coverage-check.mjs:44-48` `coverageScopeOf` | `ci.coverageScope` が changed / whole ならそれを使う。無ければ whole(defaulted)。不正な値は失敗(239-242) |
| 測れるか | `:35` `canMeasureChanged` | アダプタに `coverageDetail`(文字列)があるか、だけで決める。形式は見ない |
| 手書きの要素 | `:255-257` → `:409-456` `evaluateHandwrittenStacks` | none の `stacks` は要素ごとに `coverageSummary` を読む。範囲は常に whole。合算せず、最も低い割合を `pct` に出す |
| 集計の無いアダプタ | `:259-263` | `coverageSummary` が null なら **code 0(通過)**、`measured:false`、警告だけ |
| 集計ファイル | `:265-271` | `projectDir` の下の `coverageSummary` を読む |
| 0 行 | `:276-288` | `total.lines.total`(istanbul)か `totals.num_statements`(coverage.py)が 0 で、製品のコードがあれば失敗 |
| 全体の割合 | `:291-294` | istanbul の `total.lines.pct`、または coverage.py の `totals.percent_covered` |
| 行単位の記録 | `:296-298` | `coverageDetail` があれば読み、`indexCoverage`(`:148-155`)でキーを `root` からの相対パスへ寄せる |
| 測れない拡張子 | `:300-301` | `NODE_MEASURABLE`(`:32`)を**固定で使う**。アダプタに依らない |
| whole の判定 | `:303-331` | `dilution:true`。測っていない製品のファイルは、行単位の記録が無ければ null |
| changed: 測れない | `:334-337` | `coverageDetail` が無いアダプタは失敗させ、whole にするよう求める(**IMPL-0259 の現状の文言の実装**) |
| changed: 記録が無い | `:338-341` | 失敗。案内の文は c8 の `--reporter=json`(node 専用の文言) |
| 起点 | `:342-348` | `--base` か `origin/$GITHUB_BASE_REF` の merge-base。解けなければ失敗 |
| 差分 | `:350` `parseAddedLines`(`:114-133`) | `git -c core.quotePath=false diff -U0 --diff-filter=AMR <merge-base> --`。`+++` の行と `@@ ... +start,count @@` から、変更後の側の追加行の集合を作る |
| 数える | `:351` `changedScopeCoverage`(`:162-191`) | 下記 1.2 |
| 結果 | `:352-394` | `pct・denominator・covered・unmeasuredProductFiles・notMeasurable・approximation・uncovered・whole` |

#### 1.2 分母の数え方 [確認]

- `lineHits`(`:136-145`): istanbul の `statementMap[k].start.line` ごとに、`s[k]` の最大値を取る。つまり「文の開始行」だけが行として現れる(istanbul-lib-coverage の `getLineCoverage` と同じ)
- `changedScopeCoverage`: 製品のファイル(`productFilter` `:212-228`。check-pr と同じ分類から、`.claude/guard.json` の `testPatterns` を除く)の追加行のうち、`lineHits` に載る行だけを分母に入れる。カウント > 0 なら被覆
- 測れる拡張子なのに被覆の記録に無いファイルは `unmeasured` → **失敗**(`:370-377`)。測れない拡張子は `notMeasurable` → 警告と件数(`:378-380`)
- 複数行の文の2行目以降だけの変更は分母に入らない。結果の `approximation` に書く(`:365`)

#### 1.3 `coverageDetail` の意味 [確認]

- 行単位の被覆の置き場(アダプタの所在からの相対パス)。node では `coverage/coverage-final.json`(istanbul。c8 の `--reporter=json`)
- 使う場所: `canMeasureChanged`(coverage-check `:35`)、`generate-profile.mjs:198-205` `adapterMeasuresChanged`(新しく生成する構成の既定の範囲。`:978-981`)、`verify-gate-contract.mjs:770-776`(範囲が changed なのに測れないアダプタなら契約検査の失敗)
- **形式の宣言は無い**。`coverageDetail` があれば istanbul の FileCoverage と見なして読む

#### 1.4 アダプタのカバレッジ [確認]

| アダプタ | coverage のコマンド | coverageSummary | coverageDetail |
| --- | --- | --- | --- |
| node | `npm run coverage --if-present` | `coverage/coverage-summary.json` | `coverage/coverage-final.json` |
| python / python-uv / python-poetry | `python -m pytest --cov --cov-report=json:coverage.json`(uv・poetry は `uv run --locked` / `poetry run` を前置) | `coverage.json` | なし |
| go | `go test ./... -coverprofile=coverage.out && go tool cover -func=coverage.out` | **null** | なし |
| none / undetermined | 空 | null(none は `stacks[].coverageSummary`) | なし |

- go.json の note は「カバレッジ判定はワークフロー側の go tool cover の出力で行ってください」と書くが、`gate-g5.yml` にその段は無い [確認]
- adapter.mjs(`template/scripts/gate/adapter.mjs`)は単一のアダプタを `loadAdapter(config)`(config.mjs `:21-28`、`config.adapters?.stack ?? 'none'`)で読み、`projectDir` で `spawnSync(shell)` する。coverage は OPTIONAL(`:69`)で、空なら通知して通す

#### 1.5 試験の形(test-coverage-scope.mjs)[確認]

- 一時の git リポジトリに基底と変更のコミットを作り、istanbul 形式の `coverage-final.json`・`coverage-summary.json` を手で置いて `evaluateCoverage` を呼ぶ。純関数(`parseAddedLines`・`lineHits`・`changedScopeCoverage`・`briefCoverageScope`)も直接試す
- アダプタは試験の中の定数 `NODE`・`PY`(`:32-33`。`PY.coverageDetail: null`)
- **過去の決定を固定している fixture**: `:62`「新しく生成する構成の既定: node は changed、python は whole」、`:134` PY で changed を選ぶと失敗。IMPL-0259 を降ろせば、この2つは決定の変更として書き換えが要る(メモリ「suite の fixture は過去の決定を固定している」に当たる)

---

### 2. node 以外で変更の範囲を測れるか(実行で確認)

環境 [確認]: Python 3.14.6、coverage 7.16.2、pytest 9.1.1、pytest-cov あり。go 1.26.0 windows/386。act は無い。actionlint はある(`C:\Users\kokor\go\bin\actionlint`)。

#### 2.1 python(coverage.py の `coverage json`)

試行の素材: `360d/py/pkg/mod.py`(複数行の return、`# pragma: no cover`、行継続の代入、複数行の引数)、`pkg/unused.py`(テストから import しない)、`tests/test_mod.py`。アダプタと同じ `python -m pytest --cov --cov-report=json:coverage2.json` を実行した。

結果 [確認]:

```
meta {'format': 3, 'version': '7.16.2', ..., 'branch_coverage': False}
pkg\__init__.py exec [] miss [] excl []
pkg\mod.py exec [1, 2, 3, 15, 17, 19] miss [8] excl [11, 12]
tests\test_mod.py exec [1, 2, 3, 4, 5] miss [] excl []
totals 91.67 12 91.67
```

- `files.<path>.executed_lines ∪ missing_lines` が「文の行」の集合になる。複数行の文は**最初の行だけ**(`return (\n x\n + 1\n )` は 3 行目だけ、行継続の代入は 17 行目だけ、複数行の def は 15 行目だけ)。**node(istanbul の文の開始行)と同じ近似**であり、既存の `approximation` の開示がそのまま当てはまる
- `excluded_lines`(`# pragma: no cover` の 11・12 行目)は分母に入らない。istanbul の ignore の注記と同じ扱いになる。行内の pragma は `thresholdFiles` の同時変更の検査に掛からない(node の `/* istanbul ignore */`・`/* c8 ignore */` も同じ)。限界として開示の要否を決める論点
- キーは **pytest を実行した所在(projectDir)からの相対パス**で、区切りは OS のもの(Windows では `\`)。CI(ubuntu)では `/` の見込み [推測]。現行の `indexCoverage` は `root` からの相対として読むため、`projectDir` が `.` でなければずれる。python 用には所在で連結し、区切りを `/` に寄せる必要がある
- `--cov` に source を書かないと、**import されなかった製品のファイル(unused.py)は記録に載らない** [確認]。changed の範囲では、そのファイルを変えた PR は `unmeasured` で失敗する(向きは正しい。案内の文は「`[tool.coverage.run] source` を製品の置き場に合わせる」になる)
- 既存の whole への副次の発見 [確認]: source を書かない既定の構成では、**テストのファイル(tests/test_mod.py)が totals に入る**。whole の割合はテストの行で押し上げられる(この例で 12 文中 5 文がテスト)。IMPL-0259 の範囲外だが、whole の python の採用者の割合の意味に掛かる
- branch を有効にすると(`--cov-branch`、試行の coverage.json)、`totals.percent_covered` は文と分岐を合わせた値になる(77.78%。文だけは 85.71%)[確認]。現行の whole は `percent_covered` を読むため、.coveragerc の `branch = True` の有無で値の意味が変わる。行の範囲に揃えるなら `percent_statements_covered` を読む論点がある

変換の試行(`360d/proto.mjs`)[確認]: `executed_lines` を count 1、`missing_lines` を count 0 の文として FileCoverage の形へ写し、**既存の `changedScopeCoverage` をそのまま**呼んだ。変更の行を `mod.py` 3〜8・15〜19 行目と `unused.py` 1〜2 行目とした結果:

```
python: {"denominator":5,"covered":4,"pct":80,"unmeasured":["pkg/unused.py"],"uncovered":[{"file":"pkg/mod.py","lines":[8]}]}
```

分母 5(3・8・15・17・19)、継続行 4・5・16・18 は分母の外、unused.py は未計測。期待どおり。**python は coverage.json 1つで summary と detail を兼ねられ、追加の道具は要らない**。

#### 2.2 go(`go test -coverprofile`)

試行の素材: `360d/go/`(module `example.com/demo`。`calc/calc.go` に複数行の式・複数行の引数・1行の for、`calc_test.go` は F だけを試す。`other/other.go` はテストの無いパッケージ)。

結果 [確認]:

```
mode: set
example.com/demo/calc/calc.go:3.19,4.11 1 1
example.com/demo/calc/calc.go:4.11,7.3 1 1
example.com/demo/calc/calc.go:8.2,8.11 1 0
example.com/demo/calc/calc.go:12.13,14.25 2 0
example.com/demo/calc/calc.go:14.25,14.36 1 0
example.com/demo/calc/calc.go:15.2,15.14 1 0
example.com/demo/other/other.go:3.14,5.2 1 0
total: (statements) 25.0%
```

- 単位は**基本ブロック**(`file:開始行.列,終了行.列 文の数 回数`)。ブロックの中の文ごとの行は出ない(`12.13,14.25 2 0` は 2 文だが、どの行かは分からない)。**文の開始行を厳密には得られない**。node・python と同じ近似にはならない
- パスは**import のパス**(module のパス + 相対)。`projectDir` の `go.mod` の `module` 行を読んで、ファイルのパスへ戻す必要がある。go.work の複数 module、replace は扱いが別になる [推測]
- go 1.22 以降、テストの無いパッケージも 0 として載る(other.go)[確認。1.26 で]。アダプタの runtimeVersion は 1.23 なので当たる見込み [推測]
- 全体の割合は、プロファイルから `Σ(count>0 の numStmt) / Σ numStmt` で出せる。2/8 = 25.0% で `go tool cover -func` の total と一致 [確認]。つまり **go は coverageSummary の代わりに coverage.out 1つで全体も変更も測れる**
- 同じ行に複数のブロックが掛かる(4 行目は 3.19-4.11 と 4.11-7.3、14 行目は 12.13-14.25 と 14.25-14.36)。行の値は istanbul と同じく最大値で決めるのが一貫する

行への落とし方の試行(proto.mjs)[確認]。変更の行を calc.go の 3〜16、other.go の 3〜5 とした:

| 案 | 行の決め方 | 分母 | 被覆 | 割合 |
| --- | --- | --- | --- | --- |
| A | ブロックの開始行だけ | 7 | 2 | 28.57% |
| B | ブロックの範囲の全行(重なりは最大値) | 13 | 5 | 38.46% |
| (参考)go の文の割合 | — | 8 文 | 2 文 | 25.0% |

- 案A は、ブロックの中の 2 文目以降の行(13 行目の `total := a + b` は 12.13 で始まるブロックの中)を落とす。分母の取りこぼしが node より大きい
- 案B は、ブロックの中の空行・注釈の行・閉じ括弧の行も分母に入れる。被覆したブロックの継続行(5・6 行目)も被覆に数えるため、割合が上がる向きに寄る。`go tool cover -html` の色分けと同じ見え方
- 案C(案B から、ソースを読んで空行・`//` だけの行・括弧だけの行を外す)は、案B の水増しを減らすが、発見的な規則を足す [推測。試していない]
- どの案でも、ブロックの開始は関数の `{`(シグネチャの行)に掛かるため、シグネチャだけの変更が分母に入る

#### 2.3 現状の go の判定 [確認。proto.mjs で evaluateCoverage を呼んだ]

```
go scope=undefined → code=0 measured:false reason:"coverageSummary が null"
go scope=whole     → code=0 measured:false
go scope=changed   → code=0 measured:false
```

- **go のアダプタでは、基準3 は範囲に依らず測られずに通る**(coverage-check `:259-263`)。changed は契約検査(`verify-gate-contract.mjs:773-775`)が別に止めるが、whole と範囲の無い構成は止まらない
- coverage-check の冒頭(`:19-20`)は「#330 の範囲」と書く。本文(gate-criteria.md)に go の基準3 が判定されない旨の開示は見当たらない(`go のアダプタ` 等で検索して該当なし)。第4章 G-5 の「未実施は失敗に数える」と、手書きの要素(none の stacks)では未実施を失敗にする扱い(`:417-425`)との**食い違い**として、突合へ出す候補
- IMPL-0259 で go に被覆を足せば、既存の go の採用者は、テンプレートの取り込みで基準3 が初めて判定され、落ちる場合がある(締める向き。告知が要る)[推測]

#### 2.4 IMPL-0259 の実装の案と規模

案(推奨の候補。会議体で比べる材料):

1. アダプタに `coverageFormat`(`istanbul` / `coverage-py` / `go-coverprofile`)を足し、`coverageDetail` を python の3つは `coverage.json`、go は `coverage.out` にする。go は `coverageSummary` も `coverage.out` にする(全体もプロファイルから出す)。go.json の coverage コマンドの `go tool cover -func` は表示として残せる
2. coverage-check.mjs に、形式ごとの読み手(行の実行回数の Map を返す)を置く。python は所在で連結して `/` に寄せる。go は `go.mod` の module で戻す。`changedScopeCoverage` は `lineHits` の代わりに読み手の結果を受ける形へ一般化する
3. `NODE_MEASURABLE` の固定(`:32`・`:162`・`:300-301`)をアダプタごとの拡張子へ替える(python `.py`、go `.go`。`stack-coverage.mjs` の `STACK_EXTENSIONS` を流用できる)
4. 失敗・警告の文の node 専用の案内(`:248`・`:339`・`:282`・`:374`)をアダプタごとにする
5. go の行の決め方(案A / B / C)と、python の `excluded_lines`・テストのファイルの算入・branch の扱いを決め、結果の `approximation` に形式ごとの近似を書く
6. generate-profile は `coverageDetail` を読むだけなので、新しく生成する python・go の構成の既定が自動で changed になる。既存の構成(whole・範囲なし)は変えない。test-coverage-scope `:62`・`:134` を決定の変更として改める
7. 本文: IMPL-0259 を delivered へ。go のブロック単位の近似を、既存の「文の開始行」の近似と別に開示する文が要る。根拠水準のマーク(EV)の要否

規模の見積もり [推測]: coverage-check.mjs +150〜200 行、アダプタ 4 ファイル(各数行と note)、test-coverage-scope.mjs +150〜250 行(python の coverage.json と go のプロファイルの固定の写し、projectDir が直下でない場合、未計測、近似)、generate-profile は試験の期待の変更のみ、本文の数段落。**中規模(合計 400〜600 行)。ワークフローの変更は要らない**(coverage の段と coverage-check の段はアダプタに依らず同じ)。CI の実機に依らず、手元の node・python・go で通しの試験を作れる(本調査で素材を作れた)。

---

### 3. ワークフローと第2段(IMPL-0479)

#### 3.1 現状の段の構成 [確認]

- `template/.github/workflows/gate-g5.yml`: ジョブ `config`(`configured` を出す)、`contract`(契約検査と試験の群。`:63-189`)、`test`(`:192-243`。setup-stack → `adapter.mjs run test` → test-results → `adapter.mjs run coverage` → `coverage-check.mjs --base ...` → 成果物 `coverage-result`)、`static-analysis`(lint・audit)、`spec-lint`、`context-format`、`ip-clearance`(licenses → 成果物 `license-scan`)、`secret-scan`、`dependency-diff`、`pr-rules`、集約 `gate-g5`(`:462-487`。`needs.*.result` に failure・cancelled があれば失敗)
- `test`・`static-analysis`・`ip-clearance`・`secret-scan`・`pr-rules` はジョブの `if: needs.config.outputs.configured == 'true'` を持つ(構成が未設定の間だけ飛ばす。既存の if)
- `template/.github/actions/setup-stack/action.yml`: `adapter.mjs runtime` の JSON の `runtime` で、setup-node・setup-python・setup-go のどれかを**手順の if** で選ぶ。単一のアダプタ前提
- `gate-g5-base.yml` はジョブ `base-judge` 1つで、アダプタのコマンドを回さない(`grep adapter|coverage` で該当なし)。第2段の影響は無い見込み [推測]
- `g5-aggregate.mjs`: 基準とジョブの対応 `G5_CRITERION_JOBS`(基準1・3 → `test`、2 → `static-analysis`、5 → `ip-clearance`)と、集約の needs の読み方。ジョブ名の単位で読み、matrix は読まない
- `stack-coverage.mjs`(第1段): `declaredStacks`(`:100-`)が、言語のアダプタ1つのスタック × projectDir、または none の stacks を宣言として読み、検出と除外の一覧と突き合わせる。冒頭 `:15-16` で第2段が無いことを明記
- `ship-evidence.yml:127-132・348-349`: `gh run download --name license-scan` / `--name test-results` で成果物の名前を固定で取る(coverage-result は取り込まない。IMPL-0246)
- `loadAdapter` の利用者(単一のアダプタを前提とする箇所): adapter.mjs、aggregate-evidence.mjs `:3645`、coverage-check.mjs `:466`、verify-gate-contract.mjs `:716`、g5-local.mjs(`config.adapters?.stack` `:78`)、check-pr.mjs(thresholdFiles)、generate-profile.mjs、test-init-g5.mjs

#### 3.2 第2段を足すときの変更箇所 [推測。設計の見込み]

| 箇所 | 変更 |
| --- | --- |
| 構成 | `adapters.stack` を残し、追加の欄(例 `adapters.additional: [{ stack, projectDir }]`)。**projectDir は今はアダプタのファイル側にある**ため、同じスタックを2か所で回す形(python を services/a と services/b)は、欄を構成側へ移すか、アダプタのファイルを複製するかを決める必要がある |
| config.mjs | `loadAdapters(config)`(主 + 追加)。`targetState`・`nestedTargetProblem` を要素ごとに。「宣言したアダプタが作業の場所に対象を見つけなければ失敗」は、追加の要素では `present:false` を対象なしにしない分岐が要る(主のアダプタの現行の扱いと分ける) |
| adapter.mjs | `--stack <id>`(または要素の番号)で要素を選ぶ。`runtime` も要素ごと |
| setup-stack | 入力 `stack` を受ける |
| gate-g5.yml | `config` ジョブがスタックの一覧を JSON で出し、`test`・`static-analysis`・`ip-clearance` を `strategy.matrix` の `fromJSON` で回す。`fail-fast: false`。成果物の名前を `coverage-result-<stack>` 等へ(upload-artifact v4 は同じ名前を複数のジョブから上げられない)。matrix の脚は「段を if: で飛ばさない」を満たす(脚ごとの if を書かない) |
| coverage-check.mjs | 要素ごとに判定し、`perStack` を結果に出す(手書きの要素の形 `:443-455` と揃える)。合算しない |
| stack-coverage.mjs | `declaredStacks` に追加の要素を入れる |
| g5-aggregate.mjs / verify-gate-contract.mjs | matrix の値の出所が構成であること(固定の一覧に書き換えていないこと)を確かめる検査。範囲 changed と測れるかを要素ごとに |
| check-pr.mjs | `thresholdFiles` を全要素の和集合に |
| aggregate-evidence.mjs・ship-evidence.yml | 成果物の名前の変更、スタックごとのカバレッジの開示 |
| generate-profile.mjs・/process-init・/process-change | 追加のスタックの問い、`settings` の種別、要素を外すことを緩める向きとして記名に掛ける、PROCESS-PROFILE.md と CLAUDE.md の生成 |
| g5-local.mjs | 要素ごとに順に回す |
| 試験 | test-adapter・test-stack-coverage・test-coverage-scope・test-g5-aggregate・test-init-g5・test-base-judge-workflow ほか |
| 本文・ADR | IMPL-0479 を delivered へ。EV-0238(CI の時間)の見直し(ADR-0121 `:100`) |

規模の見積もり [推測]: スクリプト 10〜14 ファイル、ワークフロー2(gate-g5.yml・ship-evidence.yml)と composite action 1、スキル・様式の文書。**合計 1,000〜1,800 行**。IMPL-0259 の数倍。

#### 3.3 0479 を本件で降ろす場合の危険

- **ワークフローの実行時の挙動を手元で確かめられない** [確認: act は無い]。actionlint で構文と式の型は検査できるが、次は実機でしか確かめられない [推測]
  - `fromJSON` の動的な matrix が空の配列のときのジョブの結果(失敗か、飛ばしか)。飛ばしになれば集約が Success と読む。ADR-0121 `:29` の「`if:` で飛ばしたジョブを Success と報告する」と同じ穴
  - matrix のジョブの `needs.<job>.result` が、1つの脚の失敗で failure になること(公式の説明はそうだが、本リポジトリでは未確認)
  - 成果物の名前の衝突と、ship-evidence の取り込みの名前の追随
  - 必須ステータスチェックは `gate-g5` だけなので、脚のチェックの名前(`test (python)` 等)の変化はブランチ保護に響かない見込み
- 実機の確認には一時のリポジトリ(pit-in-trial。削除済み。手順で作り直す)が要り、GITHUB_TOKEN の制約(PR を作れない・rollup を読めない)がある(メモリの記録)。所有者の操作を要する
- 構成の形式の変更(追加の欄)は、/process-init・/process-change・契約検査・変化点の差分の向き・旧い構成の読み方に波及する。fixture が過去の決定を固定している箇所が多い
- 第1段の現状(混在は none の手書きの要素で受け、要素ごとに whole で報告。未報告は失敗)で、宣言の外を通す穴は既に塞がっている。第2段の欠如が生むのは**利便と、手書きの要素では changed で測れないこと**であり、通過してはならない変更が通る穴ではない(ADR-0121 決定)[確認: test-stack-coverage の「合算しない」「集計ファイルが無ければ失敗」]
- IMPL-0259 を先に降ろせば、第2段で要る「スタックごとの変更の範囲」の部品が先にそろう。順序は 0259 → 0479 が自然 [推測]

---

### 4. 既存の試験の実行 [確認]

worktree の直下から実行(node v26.13.0)。

| 試験 | 結果 | 終了コード |
| --- | --- | --- |
| `node template/scripts/gate/test-coverage-scope.mjs` | 36 件が期待と一致 | 0 |
| `node template/scripts/gate/test-stack-coverage.mjs` | 47 件すべて期待と一致 | 0 |
| `node template/scripts/gate/test-adapter.mjs` | 54 件が期待と一致 | 0 |

---

### 5. まとめ(論点D への材料)

1. **python は実現できる**(確認済み)。coverage.json の `executed_lines`/`missing_lines` は文の開始行の集合で、node と同じ近似。既存の `changedScopeCoverage` へ写すだけで数えられた。要る手当ては、所在からの相対パスと区切り、形式の判別、拡張子の固定の撤去、案内の文
2. **go は近似を変えれば実現できる**(確認済み)。プロファイルはブロック単位で、文の行が出ない。行への落とし方(開始行 / 範囲の全行 / 範囲から空行等を外す)で割合が変わる(試行で 28.57% / 38.46%。文の割合は 25%)。node と同じ近似とは言えず、別の開示が要る。import のパスを go.mod で戻す処理が要る
3. **現状の go は基準3 を測らずに通す**(確認済み)。本文の「未実施は失敗に数える」と、手書きの要素の扱いとの食い違いとして突合へ出す候補。IMPL-0259 の実装は、この解消を兼ねうる(既存の go の採用者には締める向き)
4. 副次の発見: python の既定(`--cov` に source なし)は全体の割合にテストのファイルを含み、branch の設定で `percent_covered` の意味が変わる(確認済み)。範囲外だが whole の値の意味に掛かる
5. IMPL-0259 は中規模(400〜600 行の見込み)で、ワークフローを変えず、手元で通しの試験を作れる。IMPL-0479 は大規模(1,000〜1,800 行の見込み)で、動的な matrix の空の場合など、実機の GitHub Actions でしか確かめられない挙動を含む。本件で 0479 を降ろすなら、一時のリポジトリでの実機の確認を受け入れ条件に含めないと、未検証のワークフローを出荷する
