# #374 の実装の記録

裁定 `decision.md` のとおりに実装した。実施日: 2026-11-05。番号は main の最大値(ADR-0111、EV-0229、IMPL-0446)から振った: ADR-0112、EV-0230、IMPL-0447。

## 1. 規則データとエンジンの試験

| ファイル | 変えたこと |
| --- | --- |
| `src/data/tailoring/rules-business-phase.yaml` | 規則 `r-b-mvp` から `g-ship` の `simplify` を外した。CL0 × S1 の G-7 は「適用」(エンジンの出力 `standard`)になる(裁定 R-1) |
| `src/data/tailoring/rules-quality.yaml` | `r-c-high`・`r-c-regulated` に、`g-ship` の `restore` を `strengthen` の前に足した(裁定 R-2) |
| `src/data/tailoring/rules-criticality.yaml` | `r-e-cl1` の `restore` の注記と注釈から「簡略(S1)」を外した。S1 の簡略が規則から無くなったため。操作は S0 の省略の取り消しとして残る |
| `scripts/test-tailoring-engine.mjs` | 全升の走査(IMPL-0345)を、品質の3種(標準・高・規制業)へ広げた。`expectG7` の S1 を `standard` に直した(旧 :367)。1〜2名の規制業は認めない組み合わせの注記を期待にした。確認者を置けない 1〜2名でも G-7 の判定者の方式を確かめる |
| 同上 | 否定の対(旧 :424「mvp・cl1: G-7 simplify」)を消さず、`r-b-mvp` に `g-ship` の `simplify` を戻した規則で検出する対に置き換えた: CL0・S1 の簡略を検出する / `r-e-cl1` の restore が CL1 以上の S1 の簡略を取り消す / 軸C の強化が S1 の簡略に優先する |
| 同上 | 否定の対を1つ足した: `r-c-high`・`r-c-regulated` から G-7 の `restore` を外すと、S0 の品質「高」・規制業で G-7 の判定者の方式が無いことを検出する |

### 実行で確かめたこと

- 規則の変更の前(stash した規則データ)で新しい試験を流すと、`quality-standard・mvp・cl0: G-7 simplify(期待 standard)` と `quality-high・poc・cl0: G-7 の判定者の方式が無い` の2件で落ちた。起案の委員の再現(council-01-drafter.md R-2 理由4)と一致する
- 変更の後は全件通過。品質「高」・規制業の S0 の G-7 は `strengthen` で、`approverMode` が体制の値(3〜9名は `named-concurrent`、1〜2名は `value-owner-merged`)で残る
- G-6 には `restore` を足していない。裁定 R-2 が名指すのは G-7 の判定者の方式の欠落である。S0 の品質「高」以上の G-6 は、`r-c-high` の `set coreReviewerCount`・`r-c-regulated` の `set reviewerCount` が省略を取り消し、無効化した設定を戻す(エンジンの `reinstate`)。設定の欠落は生じていない(上の走査の `G-6 のレビューの方式が無い` が出ない)。取り消しが別の目的の設定の副作用であることは残る(起案の委員の R-2 理由4 の前半)。升の表記とエンジンの出力の突合(IMPL-0447)が、この設定を外したときの升の食い違いを捉える

## 2. 升の表記とエンジンの出力の突合、中身の無い「簡略」の検査

| ファイル | 変えたこと |
| --- | --- |
| `scripts/lib/stage-table.mjs` | 新設。第8章 軸B の表を読み、升の状態の語(適用・簡略・統合・省略)を基準の構成(標準品質・CL0・3〜9名・内製)の出力と比べる。緩める升と範囲を限る升(「コア機能」)は、CL1・CL2・CL3・品質「高」・規制業の各値で出力が適用(または全変更)へ戻るかを見て、升の括弧の上書きの条件と突き合わせる(書き落とし・書いた条件で戻らない、の両向き)。`emptySimplified(cell)` は、括弧が無い、または括弧の中が上書きの条件だけの「簡略」を返す |
| `scripts/check-stage-table.mjs` | 新設(`npm run lint:stage-table`)。実行のたびに違反と適合の対を先に確かめる: IMPL-0447:ng 旧い升「簡略(CL1 以上は適用)」が食い違いと中身の無い簡略の両方で出る / 上書きの条件の書き落とし(S0 の G-7 の品質「高」以上)/ 戻らない条件の記載(S0 の G-1 に CL1 以上)/ 範囲の上書きの書き落とし(S1 の G-6)。IMPL-0447:ok 本物の表は一致し、「簡略(1枚企画書)」は通る |
| `package.json` | `lint:stage-table` を足し、`check` の `test:engine` の直後に入れた(`npm run <名>` の形。check-ci-wiring の条件11 に合う) |
| `scripts/check-provisions.mjs` | 検査3(表の升の語)に、規定の文書の表の中身の無い「簡略」の升を足した(`emptySimplified` を共有)。 |
| `src/content/docs/community/provision-forms.md` | 検査の一覧の3 の行に、中身の無い「簡略」の升と、限定の中身の適否を確かめない旨を足した |

- 変更前の表(S1 の G-7「簡略(CL1 以上は適用)」、S0 の G-6・G-7 に品質の条件なし)で流すと、6 件の食い違いが出た(S0 の G-6・G-7 で quality-high・quality-regulated の書き落とし 4 件、S1 の G-7 の語の食い違い、中身の無い簡略)。表を改めた後は 0 件
- 走査の上書きの値は CL1〜CL3 と品質の2値に限る。体制(軸A)の条件(「確認者を置けない体制は未達」)とゲート以外の行は確かめない。スクリプトの冒頭に書いた

## 3. 標準の本文

| ファイル | 変えたこと |
| --- | --- |
| `phase4-process-design/tailoring-guide.md` | 軸B の表: S1 の G-7 を「適用」に。S0 の G-6・G-7 の括弧に「品質『高』以上」を足した。表の直下に「軸の間の優先」(軸C・軸E の強化は本軸の緩和に優先、緩める升の括弧に取り消す条件を書く、最終の状態は導出の出力を正とする、升と出力の一致は機械で確かめる)と IMPL-0447 を置いた。G-1 の S0 の段落の後に、S1 の G-7 を適用することと S1 の軽さの所在(基準2 のトリアージの S1 の行、基準3 の負債台帳の S1 の運用、G-6 の範囲、どのステージでも記録と基準の突合に限ること)、項目2 に G-6 の範囲の限定を載せることを書き、EV-0230(見直し 2027-05)を置いた。IMPL-0345 の注記から「S1 の G-7 の簡略」を外し、品質の走査と r-c-high・r-c-regulated の restore を足した |
| `phase4-process-design/overview.md` | 1.7.3 に「簡略」の定義(適用の一種。判定基準を外さず、成果物の形・分量を升の括弧と本文で示した限定の範囲で減らす)と、中身の無い「簡略」を置かないことを書いた。1.7.4 の検査の列挙に中身の無い「簡略」の升を足した |
| `phase4-process-design/gate-criteria.md` | G-7 の表の後に、事業ステージを理由に判定基準を外さないこと、S1 の軽さの所在、S1 の G-6 の範囲の限定を項目2 に載せること。保証の開示の要求の箇条に、項目2 へ範囲を限ったゲートを載せることと、未適用の厳格化を載せること(CL0 では欠落に数えない) |
| `tool/knowledge-base-schema.md`・`tool/proposal-logic.md` | restore の例「MVP の簡略化を取り消す」が事実でなくなったため、「CL1 以上と品質『高』以上は PoC の出荷判定の省略を取り消す」へ直した(突合) |

- G-1 の S0 の「簡略(1枚企画書)」が定義に合うことを確かめた: 升の括弧に減らすもの(1枚企画書)があり、本文(tailoring-guide.md の S0 の段落)が「記述の分量を減らす調整であり、前節の宣言を外すものではない」「新しい様式を設けない」と境界を書く。G-1 の判定基準1〜4 にステージによる除外は無く、1枚企画書でも同じ基準で判定する。規則の注記も「1枚企画書に簡略化する」で、括弧の中身と一致する。検査(`emptySimplified`)も通る
- 項目2 の規定には、以前から実装マークが無い。本件でも IMPL を足していない(裁定が名指す新しい IMPL は IMPL-0447 だけ)。テンプレートの試験 `test-tailoring-declaration.mjs` が表示を固定する

## 4. 準拠テンプレート template/

| ファイル | 変えたこと |
| --- | --- |
| `scripts/vendor/tailoring-kb.json` | `npm run template:kb` で再生成 |
| `scripts/gate/aggregate-evidence.mjs` | 保証の開示の項目2: S1 で G-6 の範囲をコア機能に限る構成(状態 required・`params.scope: core-only`)を「範囲の限定(コア機能)」として理由つきで載せる。状態を変えたゲートに未適用の厳格化(`pendingTightenings`)があれば「。未適用の厳格化: 現行の規則の再導出では <状態>。欠落には数えない」(CL1 以上の G-6・G-7 は「欠落に数えた」)を添える。欠落の計上(blocking)は変えていない |
| `scripts/gate/test-roster-rules.mjs` | CL0・S1 の G-7 が required で G-6 がコア機能に限られること、旧い構成(G-7 simplified)が blocking でない未適用の厳格化になることを足した |
| `scripts/gate/test-tailoring-declaration.mjs` | 新設。集約を通しで実行し、項目2 に G-6 の範囲の限定が載る / S1 の G-7 は載らない / 旧い構成の G-7 は未適用の厳格化として載り、欠落に数えない / G-6 を全変更に適用する構成では G-6 の行を出さない、を確かめる。旧い集約のコード(stash)では 2 件が NG になることを確かめた |
| `.github/workflows/gate-g5.yml` | ジョブ contract に上の試験を足した |

### 集約の出力が項目2 の表示を除いて変わらないことの確認

スクラッチ(`agg-compare.mjs`。リポジトリの外)で、CL0・S1・3〜9名・内製の構成を同じ履歴(fixture のコミットと、PR を経ない変更のコミット1件)に置き、集約のコード(旧 = template の HEAD の aggregate-evidence.mjs と知識ベース / 新)と G-7 の状態(required / simplified)の4通りで実行し、`evidence/quality-report.md` と `evidence/evidence.json` を、コミットの識別子と時刻を伏せて比べた。終了コードはどれも 1(fixture の欠落による。4通りで同じ)。

| 比べたもの | 差 |
| --- | --- |
| 旧コード: required と simplified | 項目2 の G-7 の行(「簡略化」)と、構成のゲートの状態の表の g7 の値だけ。欠落(gaps)の行は同一。判定の挙動は simplified と required で同じ |
| 新コード: required と simplified | 項目2 の G-7 の行(「簡略化。未適用の厳格化: …欠落には数えない」)、項目1 の表の「未適用の厳格化 1 件: g7 simplified → required」(知識ベースの再生成で既存の `pendingTightenings` が出す。blocking でない)、構成の状態の表の g7 の値。欠落の行は同一 |
| 旧コードと新コード(どちらも required) | 項目2 の G-6 の行(範囲の限定)だけ |
| 旧コードと新コード(どちらも simplified) | 項目2 の G-6 の行と G-7 の行の文言、項目1 の未適用の厳格化の1行 |

- 項目2 の外に出る差は、構成の状態の表(入力の写し)と、項目1 の未適用の厳格化の1行(既存の仕組み。旧い構成に限り、blocking でない)だけである。欠落の件数と文、成立判定は4通りで変わらない

## 5. 副次の所見(集約が G-6 の範囲 core-only を読まない)と S0 の前提3 — 食い違いあり。直していない

スクラッチ(`core-only.mjs`。リポジトリの外)で実行して確かめた。構成は CL0・3〜9名・内製、コア機能のパスを `delegation.protectedPaths: ['src/core/**']` で宣言した。変更は PR を経ないコミット(トレーラ Risk: R3・Verification)で、独立した人の確認の記録は置いていない。

| 場面 | 集約の出力 |
| --- | --- |
| S1(G-6 は required・`scope: core-only`)。コア機能でない変更(`src/ui/b.js`)とコア機能の変更(`src/core/a.js`) | **どちらも**「PR を経ておらず、独立した人の確認を経ていません。G-6 を適用する体制では記録の欠落です」 |
| S0 で取り込んだ変更(コア機能でない・コア機能)を、S1 へ移した後に集約する | **どちらも**同じ欠落 |
| 対照: S0 のまま集約する | 欠落なし(G-6 は省略) |

- 集約(`template/scripts/gate/aggregate-evidence.mjs`)は G-6 の適用を状態だけで決め(`g6Applied`、`isActive('g6')`)、`gates.g6.params.scope` を読まない。読むのは未適用の厳格化の表示(`generate-profile.mjs` の `pendingTightenings`)と、本件で足した項目2 の表示だけである
- 事実1(S1 の G-6 の範囲): 本文の S1 の G-6 は「適用(コア機能。CL1 以上は全変更)」で、コア機能でない変更に G-6 を課さない。集約はコア機能でない変更の独立した確認の欠如も欠落に数える。**実装は本文より厳しい**。本件の S1 の軽さの段落と項目2 の表示は「S1 の軽さは G-6 の範囲にある」と書くが、その軽さは集約に降りていない
- 事実2(S0 の前提3 と S1 の G-6 の範囲): 前提3(tailoring-guide.md「S0 の省略が成立する前提」の表)は「S1 へ移ると G-6 は適用に戻る。S0 の期間に独立した人の確認を経なかった変更は、S1 以降の出荷の範囲に入ると、記録の欠落として扱う」と書き、コア機能に限らない。S1 の G-6 はコア機能に限る。本文の中で、S0 の期間のコア機能でない変更は欠落、S1 の期間のコア機能でない変更は G-6 の対象外、と扱いが分かれる。集約は前提3 の書き方(全変更)に合い、S1 の G-6 の範囲と食い違う
- 本件では本文も実装も直していない(依頼のとおり)。後継の Issue で、本文(S1 の G-6 の範囲・前提3)と実装のどちらを正とするかを決める必要がある
- 本件の本文で、S1 の軽さの所在に G-6 の範囲を挙げた箇条には、実装マーク(undelivered)を付けていない。裁定が名指していないため。後継の Issue で扱う

## 6. 回帰スイートの期待値

- 最初の実行(WSL、--kb keep)で、matrix-sweep の sweep の8行(1〜2名・S0・品質「高」・CL0 × 内製/受託 × 確認者あり/なし × 実装スタック node/未確定)が落ちた。観測は「逸脱 g7」、期待は「逸脱 -」
- 原因は R-2 の修正そのものである。`r-c-high` の G-7 の `restore` が、S0 の省略が無効化した判定者の方式(1〜2名は `value-owner-merged`)を戻すため、価値責任者が G-7 を兼ねることが逸脱として記録されるようになった。従来は方式が失われ、逸脱が記録されていなかった(同じ体制の S1 は以前から「逸脱 g7」)。厳しくする向きの変化である
- `scripts/regress/expected/matrix-sweep.json` の8行を「逸脱 g7」へ改め、`changed` に by「ADR-0112 決定2」・on 2026-11-05・from(旧い期待値)を残した。`_note` に改めた理由を足した。`check-fixes.mjs` は通る

## 7. 試験の結果

- エンジンの試験(test:engine)・升の突合(lint:stage-table)・lint:evidence・lint:impl・lint:scope・lint:refs・lint:provisions・lint:skills・lint:tone・lint:ci・lint:figures・brand:check・lint:sources・lint:citations・test:citations・test:edition・lint:registry・test:registry・test:impl・test:ci-wiring・test:template・test:fields・test:criteria: Windows で個別に実行し、すべて通過
- lint:text: 通過。build: 通過(343 ページ)
- 準拠テンプレートの試験一式(本体の test:template-suite。Windows): test-g5-aggregate.mjs(CRLF による既知の失敗)を除いてすべて通過。新しい test-tailoring-declaration.mjs も通過
- 回帰スイート(WSL、--kb keep): 期待値を改めた後、通常の時刻帯と TZ=UTC の両方で全本が通過(落ちた 0、印 0)
- 準拠テンプレートのコミット: cc27644(pit-in-template の main へ push 済み)
