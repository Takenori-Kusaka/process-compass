# 調査: S0 での独立レビュー(G-6)の扱い — Issue #302

- 調査日: 2026-10-12
- 位置づけ: コアポリシー「取り込みの前に議論する」の**調査**段階。採否は決めていない。推しは書いていない
- 実行したスクリプトと出力: `tmp/302-310/s302-matrix.mjs`、`s302-gates.mjs`、`s302-roster.mjs`(出力は同じ場所の `*.out`)。取得した外部文献の写し: `tmp/302-310/dl/`
- 前回の材料: `research/300-book-intake/survey-E-internal-consistency.md` U3、`council-03`・`council-05` の U3、`decision.md`

## 0. 要約(10 行)

1. **S0 の省略を決めた ADR は無い**。省略を固定しているのは、第8章 軸B の表(2026-07-15)、第2章 2.5、規則 `r-b-poc`、エンジンの試験ペルソナ1(どちらも 2026-07-23)の 4 箇所。ADR-0028 は `omitted` を「調整として成立している」と書くが、S0 の省略が要求事項 3 をどう満たすかは、どこにも書かれていない
2. **型の分岐は再現した**。S0・標準品質・CL0 で、確認者あり=`omitted`(CI 下限 80%)、確認者なし=`unmet`(CI 下限 90%、冒頭表示)。3 名以上は設問が無く常に `omitted`。原因は ADR-0028 決定1 にステージの条件が無いことと、規則の優先度(40 対 10)
3. **回答だけで未達が消える経路は再現した**。S0 では、名簿が空でも、名簿が本人 1 名でも、独立レビュアの席が本人でも、`reviewer-yes` なら `omitted`・未達なし。名簿と席による検出(`sameReviewer`・`noConfirmer`)は G-6 が有効な状態でしか働かない
4. **S1 以降にも同じ向きの穴が 1 つある**。`reviewer-yes` で名簿が空なら `required`・未達なし(ただし承認 1 件の強制は入る)。逆向き(`reviewer-no` なのに 2 人目がいる)だけが整合の検査に掛かる
5. 「省略可」「任意」は実行層で省略の一択。S0 で G-6 を残す入力は、品質=高以上か CL2 以上だけ。逆に第2章 2.5 が「省略可」と書く G-8 は、実行層では適用の一択
6. **外部は 4 つの型に分かれる**。(a) 用途の分類で外し、用途が変われば格上げする(NASA NPR 7150.2D Class E)、(b) 統制の開始点を定め、試作を製品と同一視するなと警告する(FDA 設計管理の手引き)、(c) 捨てる・公開しないを条件にする(GOV.UK alpha、XP の spike)、(d) 例外を置かず一律に課す(Google)。成熟度で課さない型(OSPS Baseline)もある
7. 外す型は、**成果物の使われ方**に条件を付け、条件が破れたときの扱いを持つ。本標準の S0 は自己申告の事業ステージに付き、G-8(リリース決裁)は適用のまま。S0 の成果物を実利用者へ出さないという規定は、検索した範囲で見つからなかった
8. テーラリングの正当化の記録は、読めた規範のすべてが求める(NASA: 根拠・リスク評価・権限者の承認、IEC 61508: 独立性を下げるなら理由、NIST SP 800-53B、12207 の調整適合は SEBoK 経由)。効果の測定はどれにも無い
9. 試作を省略した結果の害を測った資料は、今回も見つからなかった。あるのは 13 社の質的研究 1 件(試作がそのまま製品になり、負債が積まれる)と、自己申告の事例
10. 案は 7 つ立てた(現状を記録 / 省略へ統一 / S0 でも適用 / 選択にする / 条件つきの省略 / 経路だけ塞ぐ / 決めないと明記)。会議体への問いは 6 つ

## 1. 標準の現状(突合)

### 1.1 関係する記述(逐語)

| # | 所在 | 記述 | 日付・上書きの関係 |
| --- | --- | --- | --- |
| a | `src/content/docs/phase4-process-design/tailoring-guide.md`「調整は宣言を伴う」 | 「調整には次の3つを必ず伴わせます。いずれかを欠く省略は、本標準に基づく調整として扱いません。」「\| 1 \| 本章の調整軸に基づいて調整する(個別の判断で任意に省略しない) \|」「\| 2 \| **標準から外した項目、簡略化した項目を、理由とともに宣言する**(差分の一覧を残す) \|」「\| 3 \| 調整後の構成で、当該ゲートの目的が達成されることを示す \|」 | 現行 |
| b | 同「軸B: 事業ステージによる調整」の表 | 「\| 独立レビュー(G-6) \| 省略可 \| コア機能のみ \| 標準 \| 標準 \|」「\| 出荷判定(G-7) \| 省略可 \| 簡略化 \| 標準 \| 厳格(変更影響の確認強化) \|」「\| コア指定の範囲 \| なし(全部使い捨て前提) \| 最小限 \| 拡大していく \| 確定済みを維持 \|」 | 2026-07-15(`7fc58a2`。調査E による) |
| c | 同、表の直後 | 「PoC の本質は「捨てる前提で速く学ぶ」ことなので、ゲートを大胆に省略します。ただし **PoC がそのまま本番化する事故**が最頻の失敗パターンです。PoC→MVP の切り替え時に「省略したゲートを復活させ、コア指定をやり直す」ことを、企画承認(G-1)の条件に含めてください。」 | 同上 |
| d | 同「本軸が動かすもの、動かさないもの」 | 「**本軸が動かすのは、ゲートの有効・省略と、記録の厳格さです**。」「**本軸は、強制層に置くと決めた規則そのものを動かしません**。」 | ADR-0050(2026-08-14) |
| e | 同「軸A」 | 「1〜2名の場合も、**独立レビューだけは、作成を指示した本人以外の人に求めます**。」「\| 2名 \| 作成を指示していない側の人。**この相互の確認で G-6 は成立する**。相手も作成の指示に関与した変更は、外部へ依頼する。置けなければ未達 \|」「[ADR-0028] 決定1 の「外部のレビュア」は、「作成を指示した者以外の確認者」と読みます。」 | ADR-0054 決定7(2026-10-01)。**ステージに触れない** |
| f | 同「例1」(#300 で訂正済み) | 「独立レビュー(G-6)と出荷判定(G-7)は、軸B により省略として宣言」「作成を指示した本人以外の確認者を置けない体制では、G-6 を省略ではなく**未達として表示**(ADR-0028 決定1)。この場合に限り、CI 基準の厳格化(カバレッジ+静的解析)を代償措置として記録。」 | 2026-10-12(#300) |
| g | 同「再実行の時点と向き」 | 「\| ステージを前へ戻す変更(軸B を PoC へ戻すなど) \| 記名と理由だけでは足りない。ステージ移行ゲート(SG)の判定を要する \|」「\| 緩める向きの変更(人の確認を減らす、委任の範囲を広げる、ゲートを省略へ変える) \| 記名と理由を要する。… \|」 | ADR-0055 |
| h | 同「実装スタックが未確定でも構成を初期化してよい」 | 「未確定を未達として宣言しない。未達の宣言は、目的を達成する構成を示せていない場合に限る」 | ADR-0034 |
| i | 同「テーラリングの禁止事項」 | 9 項目に、S0 での G-6 の省略を禁じる項目は無い。掛かるのは「6. **標準から外した項目を宣言せずに運用する** — 宣言のない省略は追跡できない」 | 現行 |
| j | `lifecycle.md` 2.5 | 「\| G-6 独立レビュー \| 任意 \| コア機能に適用 \| 全件に適用 \|」「\| G-7 出荷判定 \| 省略可 \| 簡略 \| 適用 \|」「\| G-8 リリース決裁 \| 省略可 \| 適用 \| 適用 \|」「G-4 と G-5 はどのステージでも省略できません。」 | 現行 |
| k | `lifecycle.md` 2.6 | 「\| 独立レビュー \| 任意 \| コア機能に必須 \| 全件必須 \|」 | 現行 |
| l | `gate-criteria.md` G-5「検査対象が存在しない場合の扱い」 | 「\| 未達 \| 目的を達成する構成を示せていない状態 \|」「\| 省略 \| 適用しないと決めた状態 \|」 | 現行 |
| m | `gate-criteria.md` G-6 | 「独立した人の確認を経ていない変更の扱いは、体制によって分かれる。このゲートを適用する体制では、記録の欠落として差し戻す。このゲートが未達の体制では、件数として開示する」 | **省略の体制の扱いは本文に無い**(実装は 1.4 のとおり未達と同じ側へ倒す) |
| n | `gate-criteria.md`「帯域を理由に判定を省略しない」 | 「レビュア側の帯域が不足していることは、**独立レビュー(G-6)を省略する理由になりません**。」 | 現行。ステージによる省略には触れない |
| o | `tool/requirements.md` シナリオ1 | 「残すゲートは仕様承認とCIの2つだけ。独立レビューは省略し、代わりにCI基準を厳格化」 | **実行結果と合わない**(1.3)。ADR-0028 決定6「未達の解消として扱わない」とも語が合わない |

### 1.2 ADR-0028 の決定(逐語)

所在: `src/content/docs/adr/0028-unmet-gate-distinct-from-omitted.md`。ステータスは「採用(2026-08-08)」。

コンテキスト:

> 第8章 軸Aは、1〜2名の体制で独立レビュー(G-6)を外部へ依頼すると定めています。外部の依頼先がいない場合、テーラリングの規則は G-6 を省略へ倒します。
>
> しかしこの省略は、他の省略と性質が異なります。第8章の調整は3つの要求を同時に満たすことを条件としており、要求3は「調整後の構成で当該ゲートの目的が達成されることを示す」ことです。1人と AI で G-6 の目的が達成される構成は示せません。

決定の表:

> | `omitted` | 標準の規則により省略する。調整として成立している |
> | **`unmet`** | **目的を達成する構成を示せていない** |

決定1〜7 のうち、この論点に掛かるもの:

> 1. 1〜2名かつ外部のレビュアが不在の構成では、G-6 を `omitted` ではなく `unmet` にする
> 5. 契約検査は、`unmet` の記録がない状態への書き換えを失敗させる
> 6. 代償措置(CI 基準の厳格化、事後の抜き取り監査)は記録するが、**未達の解消として扱わない**

検討した選択肢のうち、S0 の省略と同じ形をしているもの:

> | 省略として扱い、テーラリング宣言に理由を書く | 宣言は差分の追跡手段であって、目的達成の代替ではない。要求3を満たさない調整は、本標準に基づく調整として扱われない |
> | G-6 を初期状態で外し、CI の厳格化だけで代替する | 何が欠けているかが構成から読み取れなくなる。「独立レビューのない構成」が既定の姿として定着する |

読み取れること(事実)と、読み取れないこと。

- 決定1 の条件は「1〜2名」と「外部のレビュアが不在」の 2 つだけである。**事業ステージの条件は無い**。したがって文字どおりには S0 にも掛かる
- ADR-0028 は、軸B による省略を論じていない。「この省略は、他の省略と性質が異なります」の「他の省略」が何を指すかは書かれていない
- `omitted` の説明「調整として成立している」は、**要求事項 3 を満たした省略である、という主張**として読める。満たし方の説明は無い
- 退けた案 1「省略として扱い、テーラリング宣言に理由を書く」の退け方(「要求3を満たさない調整は、本標準に基づく調整として扱われない」)は、理由が人の不在でもステージでも、同じ形で当たりうる。当たらないとする記述は無い

### 1.3 規則・エンジン・試験(実行して確かめた)

規則 `r-b-poc`(`src/data/tailoring/rules-business-phase.yaml`、優先度 10):

> `- target: { type: gate, id: g-indep-review }` / `action: omit` / `note: 独立レビューは省略する(捨てる前提のコードに人的レビューを投じない)`
>
> `reason: PoCの本質は捨てる前提で速く学ぶこと。ただし「PoCがそのまま本番化する事故」が最頻の失敗パターンのため、復活の条件をあらかじめ決めておく`

規則 `r-s-no-external-reviewer`(`rules-supplementary.yaml`、優先度 40。条件は `q-team-size: [size-1-2]` と `q-external-reviewer: [reviewer-no]`):

> `note: 作成を指示した本人以外の確認者を置けない。省略ではなく未達として表示する(ADR-0028)`

エンジンの試験(`scripts/test-tailoring-engine.mjs` ペルソナ1。回答は `'q-external-reviewer': 'reviewer-yes'`):

> `assert.equal(r.profile['gate:g-indep-review'].state, 'omit', 'PoC では独立レビュー省略');`

`npm run test:engine` は 2026-10-12 に合格した(「すべてのシナリオ検証に合格しました」)。規則の note とこの assert は、どちらも 2026-07-23 のコミット(`dd5c737`、`ccbc2b0`)で入っている(`git log -S` で確認)。

`node tmp/302-310/s302-matrix.mjs`(品質=標準、CL0、内製)の結果。調査E の表と一致した。

| 人数 | ステージ | 確認者 | エンジン | 当たった規則 | テンプレート `gates.g6.state` |
| --- | --- | --- | --- | --- | --- |
| 1〜2名 | S0 | あり | omit | `r-b-poc`:omit(`r-a-solo` の set は上書きされる) | `omitted` |
| 1〜2名 | S0 | なし | omit | `r-s-no-external-reviewer`:omit(`r-b-poc` を上書き) | `unmet` |
| 1〜2名 | S1・S2 | あり | standard | `r-a-solo`(S1 は `r-b-mvp` の core-only も) | `required` |
| 1〜2名 | S1・S2 | なし | omit | `r-s-no-external-reviewer` | `unmet` |
| 3〜9名・10名以上 | S0 | (設問なし) | omit | `r-b-poc` | `omitted` |
| 3〜9名・10名以上 | S1・S2 | (設問なし) | standard | `r-a-small` / `r-a-large` | `required` |

S0 で品質と CL を動かした結果(同スクリプトに `quality-standard,quality-high,quality-regulated cl0,cl1,cl2,cl3` を渡した)。

| 条件(S0) | G-6 |
| --- | --- |
| 標準品質・CL0 または CL1(3名以上) | `omitted`。警告 0 |
| 標準品質・CL2・CL3(3名以上) | `required`(`r-e-cl2` が省略を上書き。警告 1) |
| 品質=高(1〜2名・確認者あり・CL0、または 3名以上) | `required`(`r-c-high` が上書き。警告 1) |
| 品質=高・1〜2名・確認者なし・CL0 | `unmet` |
| 1〜2名で CL1 以上、1〜2名で規制業 | 構成を拒否 |

`node tmp/302-310/s302-gates.mjs` の結果(全ゲート)。

- 2名・S0・確認者あり: `g1=simplified g2=merged-into-g4 g3=required g4=required g5=required g6=omitted g7=omitted g8=required`、`requiredApprovals=0`、`ci.strengthened=false`
- 1〜2名・S0・確認者なし: 同じで `g6=unmet`、`ci.strengthened=true`
- 3〜9名・S0: 2名・確認者ありと同じ

ここから言えること。

- **「省略可」(軸B)と「任意」(第2章 2.5)は、実行層では省略の一択である**。標準品質・CL0〜CL1 の S0 で G-6 を残す回答の組み合わせは無い
- **第2章 2.5 が「省略可」と書く G-8 は、実行層では適用の一択である**(規則 `r-b-poc` は G-8 に触れない)。「省略可」という語が、G-6 では必ず省略、G-8 では必ず適用に落ちている
- **CL1 の S0 でも省略になる**(3名以上)。軸E の表は「独立レビューの人数」を CL1 で「1名」と書く。CL1 の規則が G-6 に何も置かないので、軸B の省略が残る。本文に優先関係の記述は無い

### 1.4 回答だけで未達の表示が消える経路(実行して再現した)

`node tmp/302-310/s302-roster.mjs`。準拠テンプレートの `buildConfig`(`template/scripts/init/generate-profile.mjs`)に、回答と、名簿(`people`)・席(`seats`)の組を渡した。1〜2名・標準品質・CL0。何も書き出さない。

| ステージ | 回答 | 名簿と席 | `gates.g6.state` | 未達の表示 | CI 厳格化 | カバレッジ下限 | 承認の強制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S0 | いる | 名簿が空(初期化の直後) | `omitted` | なし | false | 80 | 0 |
| S0 | いる | 名簿 1 名・開発者の席だけ | `omitted` | なし | false | 80 | 0 |
| S0 | いる | 名簿 1 名・開発者と独立レビュアの席が同一人物 | `omitted` | なし | false | 80 | 0 |
| S0 | いる | 名簿 2 名・独立レビュアの席は相手 | `omitted` | なし | false | 80 | 0 |
| S0 | いない | (名簿によらず 5 通りすべて) | `unmet` | あり | true | 90 | 0 |
| S1・S2 | いる | 名簿が空 | `required` | **なし** | false | 80 | 1 |
| S1・S2 | いる | 名簿 1 名・開発者の席だけ | `unmet` | あり | true | 90 | 0 |
| S1・S2 | いる | 名簿 1 名・両方の席が同一人物 | `unmet` | あり | true | 90 | 0 |
| S1・S2 | いる | 名簿 2 名(席は相手、または空) | `required` | なし | false | 80 | 1 |
| S1・S2 | いない | 名簿 2 名・独立レビュアの席は相手 | `unmet` | あり | true | 90 | 0 |

機構(`generate-profile.mjs` の `detectUnmet`、249〜262 行):

```js
const noReviewer = small && answers['q-external-reviewer'] === 'reviewer-no';
const sameReviewer = small && reviewerIsAuthor && isActiveState(gates.g6.state);
const noConfirmer = small && !sameReviewer && soleAuthor && isActiveState(gates.g6.state);
if ((noReviewer && gates.g6.state === 'omitted') || sameReviewer || noConfirmer) {
  gates.g6.state = 'unmet';
```

- 回答による判定(`noReviewer`)だけが、`omitted` を `unmet` へ変える
- **名簿と席による判定(`sameReviewer`・`noConfirmer`)は `isActiveState`(`required` か `simplified`)を条件に持つ**。S0 で G-6 が `omitted` のあいだは働かない
- したがって S0 では、設問に「いる」と答えれば、名簿に誰も書かなくても、名簿が本人だけでも、未達は出ない。**Issue の事象 3 は再現した**
- 「いる」と答えた側は、未達の表示が消えるほかに、カバレッジ下限が 90% から 80% へ下がる。正直に「いない」と答えた体制のほうが、表示も CI も重い
- 設問の文は「作成を指示した本人以外に、確認できる人はいる?」(`src/data/tailoring/questions.yaml` `q-external-reviewer`)。**S0 では、答えがどちらでも誰も確認しない**。答えが変えるのは表示と CI の下限だけである
- 名簿は初期化の時点で空である(同ファイルのコメント「人の名簿。初期化では空。人が /process-change で記入する」)

Issue に無いが、同じ向きの穴が S1 以降にもあった。

- S1・S2 で「いる」と答え、名簿が空のままなら、`required`・未達なしになる。開発者の席の責任者が名簿に居ないと `soleAuthor` が立たないためである。ただしこの構成では承認 1 件の強制(`requiredApprovals=1`、ruleset `team`)が入り、出荷の証跡の集約は「成立を確認できない(独立レビュアの席の責任者が未記入)」と出す(`aggregate-evidence.mjs` 1735 行。集約は実行していない。コードの読みによる)
- 回答と名簿の食い違いを検査する `answersRosterProblems`(`template/scripts/gate/config.mjs` 706 行)は、**「いない」と答えたのに別の人が独立レビュアの席にいる**向きだけを見る。「いる」と答えたのに 2 人目がいない向きは、この検査の対象に無い

### 1.5 省略の体制での開示(コードの読み。実行していない)

`template/scripts/gate/aggregate-evidence.mjs` による。

- 項目1 の G-6 の区分は、省略の体制では `省略(omitted。テーラリングの宣言による)` と出る(1724・1734 行)
- 独立した人の確認を経ていない変更の件数は、**ゲートの状態によらず数える**(`withoutIndependentHuman = changesTotal - confirmedUnits.length`、1834 行)。全件が未確認なら定型の文「本成果物は、作成を指示した者から独立した人による確認を経ていません。」を出す(1859〜1862 行)
- 欠落(差し戻し)にするかは体制で分かれる。コメント(1211〜1215 行):「G-6 を適用する体制: … 記録の欠落」「G-6 が未達・成立しない・省略の体制: R1 の変更だけ、例外承認の記録を要する」。**省略の体制は、未達の体制と同じ側に置かれている**。本文(1.1 の m)は未達の体制しか書いていない
- G-7 が省略の構成では、出荷の範囲に固有の検査(引き継ぎ文書、負債台帳、判定記録の有無)を行わない(1546 行)
- 集約が見る構成は**集約の時点の構成**である。S0 から S1 へ移した後の最初の出荷で、範囲に S0 の期間の変更が入れば、G-6 を適用する体制の規則(未確認は記録の欠落)で判定される読みになる。**これは実行して確かめていない**(1.8)

つまり、S0 の省略の体制でも「独立した人の確認を経ていない」事実は、集約を実行すれば件数と定型の文で出る。出ないのは、プロセス構成書の冒頭の未達の表示と、CI の厳格化である。S0 で集約が実行される保証(G-7 が省略のとき、誰がいつ集約するか)は、本文で確かめられなかった。

### 1.6 S0 を囲む規定

- ステージは設問への回答で決まる(`q-biz-phase`)。**S0 を名乗るための条件・期限・判定は無い**。S0 へ戻す変更だけが SG の判定を要する(1.1 の g。実装は `generate-profile.mjs` 948・1604 行)
- S0 の成果物を実利用者へ出さない、公開しない、という規定は、第2章と第8章を「S0」「PoC」「探索」と「本番」「実利用」「公開」で検索した範囲では見つからなかった。S0 のゴールは「事業仮説と技術的実現性を検証し、投資継続の可否を判断できる状態にする」(`lifecycle.md` 2.3)
- G-8(リリース決裁)は S0 でも適用になる(1.3)。S0 の成果物を外へ出す経路は、構成の上では開いている
- 「省略したゲートの復活」は G-1 の条件に「含めてください」と書かれ、プロセス構成書に「PoC から MVP へ移るときに戻すもの」のチェックリストとして出る(`generate-profile.mjs` 2703〜2715 行)。`template/scripts/gate/check-g1.mjs` に、この条件を確かめる処理は見つからなかった(「復活」「poc」で検索)
- S1 の「コア機能のみ」(`scope: core-only`)を読む処理は、`template/scripts/` の試験と fixture を除くスクリプトに見つからなかった(`core-only` で検索)。S1 の G-6 は実行層では全変更に掛かる読みになる。本 Issue の外だが、「S0 を S1 と同じ扱いにする」案の前提に関わる

### 1.7 fixture と回帰スイートが固定していること

- `scripts/test-tailoring-engine.mjs` ペルソナ1: 2名・S0・**確認者あり**で `omit`。`npm run check` に含まれる
- `tmp/fix288-tpl2/suite/matrix.mjs` 131・139 行のコメント:「G-6 を適用していない構成(PoC など)では、独立レビュアの席の移し替えは統制を下げないが、任免ではある」「独立レビューが下がらない構成(変更前から適用していない PoC、…)」。S0 の G-6 が適用されないことを前提に、席の移し替えの向きを判定している。**スイートは実行していない**(時計依存があるため。コメントを読んだ)
- エンジンの試験は、2名・S0・**確認者なし**の構成も持つ(「衝突3(#63)」)。assert しているのは G-7 の省略と警告の有無で、G-6 の状態は assert していない(エンジンは `omit` を返すだけで、`unmet` への変換はテンプレート側の `detectUnmet` が行う)
- テンプレートの `template/scripts/gate/test-init-g5.mjs` は、1〜2名・S0・確認者なしの回答を fixture(`ANSWERS[1]`)に持つ。このファイルに「unmet」「未達」の語は無く、G-6 が未達になることを期待値にはしていない(語の検索による。試験は実行していない)。**S0・確認者なし=未達を期待値として固定する試験は、探した範囲では見つからなかった**。ほかの `test-*.mjs` は開いていない

### 1.8 矛盾の一覧と、新旧

| # | 食い違い | どちらが新しいか | 上書きを示す記録 |
| --- | --- | --- | --- |
| 1 | 軸B「省略可」・2.5「任意」対 実行層の省略の一択 | 本文も規則も 2026-07。同時期 | なし。選べると書いた本文と、選ばせない規則が並立 |
| 2 | 2.5 の G-8「省略可」対 実行層の適用の一択 | 同上 | なし |
| 3 | ADR-0028 決定1(ステージの条件なし。2026-08-08)対 軸B の省略(2026-07-15) | ADR-0028 が新しい | ADR-0028 は軸B に触れない。実装は決定1 を優先(優先度 40 対 10) |
| 4 | ADR-0028 の退けた案「G-6 を初期状態で外し…既定の姿として定着する」対 S0 の既定の省略 | ADR-0028 が新しい | なし。ADR-0028 は軸B の省略を「成立している」側に置いたとも、論じ忘れたとも読める |
| 5 | 要求事項 3 対 `omitted`「調整として成立している」 | — | 満たし方の記述なし |
| 6 | 軸E「独立レビューの人数 CL1: 1名」対 CL1 の S0 の省略 | — | なし |
| 7 | `tool/requirements.md` シナリオ1「代わりにCI基準を厳格化」対 実行結果(`ci.strengthened=false`)と ADR-0028 決定6 | ADR-0028 が新しい | #300 は例1 だけを直した。シナリオ1 は残っている |
| 8 | G-6 本文「未達の体制では件数として開示」対 実装「未達・成立しない・省略の体制」 | 実装が広い | 本文に省略の体制の扱いが無い |

## 2. 世の中がどうなっているか

どの文献も 2026-10-12 に開いた。効果を測った資料は、2.6 の 1 件を除いて無い。規範は E1(間接)、意見は E0 として読む。

### 2.1 用途の分類で外し、用途が変われば格上げする型

**NASA NPR 7150.2D "NASA Software Engineering Requirements"**(発効 2022-03-08)。`https://nodis3.gsfc.nasa.gov/npg_img/N_PR_7150_002D_/N_PR_7150_002D_.pdf` を取得し、本文を読んだ。出典台帳に SRC-0560(§2.2)がある。

- ソフトウェアを Class A〜F に分類し、要求の適用を分類ごとの表(Appendix C)で決める。§2.2.4:「"X" – Indicates an invoked requirement by this directive consistent with software classification」「Blank – Optional/Not invoked by this directive.」
- Class E の定義(Appendix D):「Software developed to explore a design concept or hypothesis but not used to make decisions for an operational Class A, B, or C system or a to-be-built Class A, B, or C system.」「Class E software does not support ground tests, flight tests, or operations.」「Class E software cannot be safety-critical software.」
- 試作の扱い(同):「Class E can include prototypes of flight and ground systems, developed at minimal cost, in the spirit of "exploring a design concept." Once the design concept is demonstrated, and a program agrees to incorporate it for flight or ground operational use, or for an in-flight test of the technology, then the software should be upgraded to its appropriate classification, based on the operational (or in-flight test) use case.」
- 分類が変わったとき(§2.2.8、SWE-021):「If a system or subsystem development evolves to meet a higher or lower software classification as defined in Appendix D, then the project manager shall update their plan(s) and initiate modifications to any supplier contracts to fulfill the applicable requirements」
- 分類の記録(§3.5.2、SWE-176):「The project manager shall maintain records of each software classification determination, each software Requirements Mapping Matrix, and the results of each software independent classification assessments for the life of the project.」分類そのものにも独立の確認が掛かる(§3.5.1 の注記:「Software assurance may perform an independent software classification, or concur with engineering's software classification decision.」)
- ピアレビュー(§5.3.2、SWE-087)の適用分類: 取得した PDF から抽出したテキストでは、Appendix C の A〜E の列を読み取れなかった。NASA Software Engineering Handbook の SWE-087 のページ(`https://swehb.nasa.gov/`、WebFetch の要約経由)は、適用を Class A・B・C・F、適用外を Class D・E としている。**表そのものは自分の目で確かめられていない**

読み取り: 探索用のソフトウェアからピアレビューの要求を外す先例である。外す条件は**使われ方**(運用の判断に使わない、試験・運用を支えない、安全重要でない)に付き、条件が破れたら格上げする。分類の決定は記録され、独立の確認の対象になる。

### 2.2 統制の開始点を定める型

**FDA "Design Control Guidance for Medical Device Manufacturers"**(1997-03)。FDA の配布 URL(`https://www.fda.gov/media/116573/download`)は 404 を返し取得できなかった。全文の転載(`https://innolitics.com/articles/fda-guidance-design-control-guidance/`)を取得して読んだ。**FDA の原本との一字一句の一致は確かめていない**。

- Section C "Design Input" の "Research and Development":「Some manufacturers have difficulty in determining where research ends and development begins. Research activities may be undertaken in an effort to determine new business opportunities or basic characteristics for a new product. It may be reasonable to develop a rapid prototype to explore the feasibility of an idea or design approach, for example, prior to developing design input requirements. But manufacturers should avoid falling into the trap of equating the prototype design with a finished product design. Prototypes at this stage lack safety features and ancillary functions necessary for a finished product, and are developed under conditions which preclude adequate consideration of product variability due to manufacturing.」
- Introduction:「Design control begins with development and approval of design inputs」
- 規則の前文(1996 年の Quality System Regulation の preamble)が概念・実現可能性の検討へ設計管理を及ぼさないと述べている、という二次の記述は見つけたが、前文の原文は読めなかった

読み取り: 規制のある分野でも、実現可能性を探る試作は統制の前に置かれる。同じ文が、試作を完成品の設計と同一視することを「罠」と呼ぶ。開始点(設計インプットの作成と承認)が統制の境界である。

### 2.3 捨てる・公開しないを条件にする型

**GOV.UK Service Manual "How the alpha phase works"**(最終更新 2019-05-08)。`https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works` を取得して確かめた。

- 「Alpha services should not be available for the public to use.」
- 「With any online solutions you try out, build things that are just complex enough to let you test different ideas, not production quality code. Expect to throw away any code - and lots of the ideas you test - at the end of alpha.」

**Extreme Programming の規則 "Create a Spike Solution"**(J. Donovan Wells、1999)。本家(`extremeprogramming.org`)は証明書の不一致で取得できず、ジェノバ大学の写し(`https://person.dibris.unige.it/reggio-gianna/ISII03WWW/ExtremeProgramming/rules/spike.html`)で読んだ。

- 「A spike solution is a very simple program to explore potential solutions. Build a system which only addresses the problem under examination and ignore all other concerns. Most spikes are not good enough to keep, so expect to throw it away.」

`research/282-survey-2026-09/` の関連する知見。

- SAFe は Spike を、見積・実装・デモの対象となる独立した作業単位として置く [FND-0131](E1)
- コーディングエージェントのベンダーは、vibe coding で要求を発見した後に版管理された仕様へ形式化してから本番へ出す接続を示す。Torres は、使い捨てプロトタイプは実際に捨てる限りで安く有用だと述べる [FND-0134](E0。数値はベンダーの二次引用)

読み取り: 探索の段階で品質の統制を軽くする実務は、**「公開しない」「捨てる」という出口の条件**と対になっている。GOV.UK は公開しないことを段階の定義に含める。

### 2.4 成熟度・規模の段階で課さない型

**OSPS Baseline v2026.02.19**(OpenSSF)。出典台帳 SRC-0347 による(今回は開き直していない)。

- 作者以外の人による承認の必須化(OSPS-QA-07.01)は Maturity Level 3 にだけ適用される(SRC-0347#c2 の引用:「the project's version control system MUST require at least one non-author human approval of the changes before merging.」)。Level の区切りは保守者数と継続利用者の規模である(SRC-0347#c1)[FND-0018]

**ISO/IEC 29110**(25 名以下の極小組織向け)は、読めた範囲で実施者の独立性を規定せず、確認の担い手を顧客に置く [FND-0016](E1。規格本体は公開プレビューまで)。

読み取り: 小さい段階で独立した人の承認を**課さない**設計は実在する。区切りは事業ステージではなく、利用者の規模(OSPS)と組織の規模(29110)である。OSPS は OSS 向けで、企業内開発を対象にしない。

### 2.5 例外を置かず一律に課す型

**"Software Engineering at Google" 第9章 Code Review**(2020)。`https://abseil.io/resources/swe-book/html/ch09.html` を取得して確かめた。

- 「Code review, however, is a mandate, one of the few blanket processes in which all software engineers at Google must participate. Google requires code review for almost every code change to the codebase, no matter how small.」
- 脚注 4 の例外は文書と設定の一部の変更で、試作・実験用のコードを例外とする記述は、この章には無かった(章の外に実験用の置き場の扱いがあるかは確かめていない)

**GitHub のルールセット**(`https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`、WebFetch の要約経由)。承認の必須化は、対象のブランチを `fnmatch` の型で指定して掛ける。迂回できる者の一覧を持てる。製品の機能としては、承認を掛ける範囲はブランチと迂回の一覧で決まり、「段階」という概念は無い。

### 2.6 独立性の水準を下げる扱いと、理由の記録

- **IEC 61508-1**(機能安全アセスメントの独立性): `research/phase4-standard/254-verification-independence-levels.md` 3.1 が、規格の許諾転載(Ron Bell、2014)から引いている。「If a lower level of independence is adopted, then the rationale has to be specified.」。段階の最下位は「independent person」で、実施者本人に当たる水準は表に無い
- **ISO 26262-2** の I0(「実施は推奨。実施するなら別人」)と、**DO-178C** の Level E(目標なし)は、同メモと今回の検索のどちらでも二次情報だけである。原文は読めていない。今回の検索では、DO-178C の「独立をもって満たす目標」の数が資料によって食い違った(30・18・5・2 と 33・21・8・5)
- **IEC 62304** の安全クラス A でユニット検証(5.5.5)が要求されないという記述は、様式ベンダーの対応表(二次)でしか確かめられなかった。Table A.1 は読めていない
- これらは**危害の深刻度**で独立性を下げる枠組みである。事業ステージや試作で下げる枠組みではない。本標準では軸E(CL)に対応し、軸B には直接は当たらない

### 2.7 テーラリングの正当化の記録

- **NASA NPR 7150.2D §2.2.5 の注記**(原典で確認):「The request for relief from a requirement includes the rationale, a risk evaluation, and reference to all material that justifies supporting acceptance.」。§2.2.1:「The responsible program, project, or operations manager need to formally accept the tailoring risk.」。§2.2.7(SWE-150):「The engineering, CIO, and SMA authorities shall review and agree with any tailored NPR 7150.2 requirements」。Appendix C:「Requirements that are not applicable to a given project, such as the IV&V requirements, should be tailored out in the Requirements Mapping Matrix with justification.」
- ここで区別が要る。**分類の表が最初から課さない要求(空欄)は、テーラリングではない**。テーラリング(根拠・リスク評価・承認)が要るのは、分類が課した要求("X")を外すときである
- **ISO/IEC/IEEE 12207:2017**: 公開プレビュー(`vde-verlag.de` の目次)で、4.2 Full conformance、4.3 Tailored conformance、Annex A (normative) Tailoring process の存在を確かめた。本文は読めていない。SEBoK v2.14(2026-05-18、`https://sebokwiki.org/wiki/Application_of_Systems_Engineering_Standards`、取得して確認)は 15288 について次のとおり述べる:「Tailored conformance for processes uses the standard as a basis for establishing a set of processes and their requirements. However, the specific requirements are selected, excluded, or modified in accordance with the tailoring process. A clear statement is made regarding the scope of the claimed tailored conformance. The tailored text for which tailored conformance is claimed is declared. Tailored conformance is achieved by demonstrating that requirements for the processes, as tailored, have been satisfied using the outcomes as evidence.」。本標準の「調整は宣言を伴う」の 3 要求は、この構成に対応する。**調整後に残した要求の成果で実証する**構成であり、外した要求の目的の達成を示せとは、この引用は言っていない
- **NIST SP 800-53B §2.4**(SRC-0544#c5):「Provide a rationale for how compensating controls satisfy security or privacy requirements and why the baseline controls could not be implemented.」
- **ISO 9001:2015 4.3**(適用できないと決めた要求の正当性を示す)は、二次の解説でしか確かめられなかった。原文は読めていない
- NASA の手引き(SWE-150 のページ、WebFetch の要約経由)は、テーラリングの根拠は承認の時点の条件に結びつくので、範囲や計画が変われば見直すとしている。原文の逐語は確かめていない

### 2.8 実証

- **Giardino ほか "Software Development in Startup Companies: The Greenfield Startup Model"**(IEEE TSE 42(6), 2016。arXiv:2308.09438 を取得して読んだ)。13 社のスタートアップへの聞き取りによる質的研究(grounded theory)。「This allows startups to have a functioning but faulty product, that can be quickly introduced to the market, starting from a prototype implementation on day-one.」「The first version of the product is typically a prototype containing basic functionalities developed with the least possible effort」「This approach is possible also in view of a lack of systematic quality assurance activities」「Startups, which survive to subsequent phases will likely increase their user-base, product size, and number of developers. This will require the company to eventually pay the accumulated technical debt」。試作がそのまま最初の製品になる流れを、観察として記述する。独立レビューの有無の効果は測っていない。2016 年の研究で、AI による実装は対象外。E2(単一の質的研究)
- プロトタイプから本番品質までの工程は安くなっていないという自己申告の事例 [FND-0122](E2)。プロトタイプを本番へ持ち込む害を示す数値は一次未確認 [FND-0134](E0)
- **S0・試作の段階で独立した人の確認を省略した体制と、省略しなかった体制を比べた測定は、見つからなかった**

### 2.9 外部と本標準の対応

| 型 | 外す根拠 | 外すときの条件 | 条件が破れたとき | 本標準の S0 |
| --- | --- | --- | --- | --- |
| NASA Class E | 用途の分類 | 運用の判断に使わない、試験・運用を支えない、安全重要でない | 格上げし、計画を改める(SWE-021) | 根拠は事業ステージの回答。使われ方の条件は無い |
| FDA 設計管理 | 統制の開始点より前 | 設計インプットの前 | 試作を完成品と同一視しない | 開始点は SG-0。S0 の成果物の持ち越しの扱いは「ゲートを復活」「コア指定をやり直す」 |
| GOV.UK alpha | 段階の定義 | 公開しない、捨てる | (beta で作り直す) | 公開しない規定は見つからず。G-8 は適用 |
| OSPS Baseline | 成熟度の段階 | 利用者の規模が小さい | Level が上がれば課す | 区切りは事業ステージ |
| Google | 外さない | — | — | — |
| 安全規格 | 危害の深刻度 | 最下位の区分 | 区分を見直す | 軸E。CL2 以上は S0 でも適用(実行で確認) |

## 3. 選択肢

推しは書かない。案 F は「決めること」の 3 つ目だけに答える案で、A〜E のどれとも組み合わせられる。

| 案 | 内容 | 良くなること | 壊れること・残ること | 変える必要があるもの |
| --- | --- | --- | --- | --- |
| A. 現状を決定として記録する | S0・標準品質・CL0〜CL1 の省略を新 ADR に残す。確認者なしの S0 は未達のまま(ADR-0028 決定1 を文字どおり維持)。型が分かれることも「そう決めた」と書く | 「書かれていない」が消える。fixture・規則・回帰スイートは変えない | 置ける体制のほうが軽い逆転が残る。回答だけで未達が消える経路が残る(F を併せない限り)。要求事項 3 の満たし方を ADR で書く必要がある(書けなければ、この案は成立しない) | 新 ADR。軸B・2.5 の「省略可」「任意」を「省略する」へ改めるか、選べない旨を書く。`tool/requirements.md` シナリオ1 |
| B. S0 は省略へ統一する | S0 では、確認者の有無によらず G-6 は省略。ADR-0028 決定1 を「G-6 を適用するステージでは」と限定する新 ADR で置き換える。S0 では設問 `q-external-reviewer` が状態を変えない | 型は「課されているか」だけで決まる(監査役の案 X)。逆転と、回答で表示が変わる経路が S0 から消える | 1 名・S0 の体制から未達の表示と CI の厳格化が消える。ADR-0028 の「独立レビューのない構成が既定の姿として定着する」を、S0 について明示で受け入れることになる。S1 へ移った時点で未達が初めて現れる | 新 ADR(ADR-0028 決定1 の置き換え)。規則の優先度か `detectUnmet`。例1 の 3 行目。テンプレートの複製。S0・確認者なしを未達とする試験があれば、その期待値 |
| C. S0 でも適用する | 確認者を置ける体制は S0 でも G-6 を適用(2 名なら相互の確認)。置けなければ未達。軸B の G-6 の行を S1 以降と揃える | 逆転が消える。ADR-0028 の退けた案と整合する。「PoC がそのまま本番化」しても確認を経ている | 3 名以上の S0 の全変更に人の確認が掛かる。「捨てる前提のコードに人的レビューを投じない」という規則の理由を捨てる。S0 は「コア指定なし」で、S1 の「コア機能のみ」へは揃えられない(しかも core-only は実行層で読まれていない。1.6)。省略で起きた手戻りの資料は無い | 軸B の表、2.5、2.6、`r-b-poc`、ペルソナ1 の assert、`tool/requirements.md`、例1、テンプレートの複製、`tmp/fix288-tpl2/suite/matrix.mjs` の前提 |
| D. 「省略可」を本当の選択にする | S0 の G-6 を設問(または `/process-change` の設定)で選ばせる。省略を選んだ理由を宣言に残す。既定をどちらにするかは別に決める | 本文の「省略可」「任意」と実行層が一致する。要求事項 2 の「理由とともに宣言」が、選んだ者の記名を持つ | 設問が増える。既定が省略なら、現状との差は記名だけになる。選んだ理由の様式と、要求事項 3 の書き方を決める必要がある。G-7・G-8 の「省略可」も同じ扱いにするかが問われる | 設問、規則、エンジンの試験、軸B、テンプレートの初期化、複製 |
| E. 省略に成立条件を付ける | S0 の省略を、成果物の使われ方の条件つきにする(例: 実利用者へ出さない、S1 へ持ち越すコードは持ち越しの時点で G-6 を通す、など。NASA Class E・GOV.UK alpha の型)。条件を要求事項 3 の「示す」内容として定める。条件が破れたら未達、または格上げ | 要求事項 3 との関係が書ける。「捨てる前提」が破れたときの扱いができる。外部の先例と同じ形になる | 条件の検査手段が要る(S0 の成果物が外へ出たかを機械で確かめられるか。G-8 が S0 で適用のままであることと衝突する)。条件を何にするかの根拠は類推で、E1 どまり。条件が自己申告なら、回答で表示が変わる経路を 1 つ増やす | 新 ADR。軸B。2.3(S0 の定義)か 2.4(SG-0)。G-8 の S0 での扱い。集約の読み(1.5)の確認。暫定マーク |
| F. 経路だけを塞ぐ | 確認者の有無を、設問の回答ではなく名簿と席から導く。または、「いる」と答えて名簿に 2 人目がいない構成を「成立を確認できない」と表示し、整合の検査の対象にする。S0 でも働かせるかは A〜E による | 回答だけで表示と CI の下限が変わらなくなる。S1 以降の穴(名簿が空で `required`・未達なし)も同時に塞げる | 名簿は初期化の時点で空なので、初期化の直後は全ての 1〜2 名体制が「確認できない」になる。G-6 本文は「表5 の記載が正しいかは、機械で確かめない」と書いており、名簿に実在しない人を書く形は残る(内部監査の観点6) | `detectUnmet`、`answersRosterProblems`、初期化の流れ、試験。標準側では軸A か第4章 G-6 に、設問と名簿のどちらを正とするかの 1 文 |
| G. 決めない、と明記する | S0 の G-6 の扱いは現行のまま据え置き、「S0 での省略の成立条件は定めていない。根拠は E0」と暫定マークで開示する | 実証の無い状態で条項を固定しない。開示は ADR-0026 の使い方に合う | 逆転、経路、要求事項 3 の空白がすべて残る。採用組織は「標準が認めた省略」と読み続ける | 暫定マーク(EV)と台帳。軸B に 1 段落 |

案どうしの関係。

- A と B は、型の分岐を残すか消すかで割れる。どちらも S0 の省略を維持する
- B と C は、逆転を消す向きが逆である(軽いほうへ揃える / 重いほうへ揃える)
- E は A・B・D に重ねられる。C を採れば E は要らない
- どの案でも、`tool/requirements.md` シナリオ1(1.8 の 7)と、G-6 本文に省略の体制の扱いが無いこと(1.8 の 8)は、別に直す必要がある

## 4. 会議体への問い

1. **S0 の省略は、要求事項 3 を満たしているのか、要求事項 3 の例外なのか**。「捨てる前提のコードには G-6 の目的が当たらない」は、目的が達成されることを示したことになるのか。SEBoK が述べる調整適合は「調整後に残した要求を成果で実証する」構成で、外した要求の目的の達成までは求めていない。本標準の要求事項 3 は、それより強い要求として書かれている。強いまま保つなら、G-6・G-7 の省略はどう正当化されるのか。弱めるなら、ADR-0028 が 1 名体制の省略を未達へ改めた根拠はどうなるのか
2. **未達と省略を分けるのは、「課されているか」か、「確認できる人がいるか」か**。ADR-0028 決定1 は後者で書かれ、ステージの条件を持たない。前者で読み直すなら(案 B)、1 名・S0 の体制から未達の表示が消えることを、ADR-0028 の退けた案「独立レビューのない構成が既定の姿として定着する」とどう両立させるのか
3. **「捨てる前提」は、誰が、何で確かめるのか**。外部の外す型(NASA Class E、GOV.UK alpha)は、使われ方に条件を付け、破れたら格上げする。本標準の S0 は回答で決まり、期限が無く、G-8 は適用で、復活の条件は G-1 に「含めてください」と書かれるだけで検査されない。この状態で「捨てる前提」を省略の理由に使えるのか。使えないなら、条件を足すのか(案 E)、省略をやめるのか(案 C)
4. **S0 の期間に確認を経ずに入った変更は、S1 へ移った後、どう扱われるべきか**。実装は、集約の時点の構成で判定する読みになる(未確認は記録の欠落。未実行)。これは意図した扱いか。意図したなら、それが要求事項 3 の「示す」に当たるのか(監査役の案 X の成立条件)。意図していないなら、S0 の変更を数えない経路(pre-init に近い扱い)を作るのか
5. **確認者の有無は、回答と名簿のどちらが正か**。回答を正とする現行は、S0 では答えが表示と CI の下限だけを変え、S1 以降でも名簿が空なら未達が出ない。名簿を正とすると、初期化の直後は判定できない。G-6 本文は名簿の正しさを機械で確かめないと決めている。回答の正しさも同じ扱い(内部監査に委ねる)でよいのか、名簿との突合まで機械に持たせるのか
6. **「省略可」「任意」という語を、標準は何として定めるのか**。G-6 では必ず省略、G-8 では必ず適用に落ちている。選択なら選ぶ行為と記名が要る(案 D)。選択でないなら、本文を「省略する」「適用する」へ改める。CL1 の S0(軸E は「1名」、軸B は省略)でどちらが勝つかも、同じ問いの中で決まる

## 5. 確認できなかったこと

内部。

- 出荷の証跡の集約(`aggregate-evidence.mjs`)を、S0 の構成と、S0 から S1 へ移した構成で**実行していない**。1.5 と問い 4 の「S0 の変更が S1 の最初の出荷で欠落として判定される」は、コードの読みである。git の履歴を持つ試験用のリポジトリが要る
- `tmp/fix288-tpl2/suite/` の回帰スイートと、`template/scripts/gate/test-*.mjs` を実行していない。S0・確認者なし=未達を期待値に持つ試験があるかは確かめていない
- S0 の成果物を実利用者へ出さない規定の不在は、第2章・第8章の語の検索による。第1章・第7章・附属書は検索していない
- `check-g1.mjs` に復活の条件の検査が無いことは、「復活」「poc」の語の検索による。G-1 の判定基準(`gate-criteria.md` G-1)の本文は読んでいない
- ADR-0028 を書いたときに、軸B の省略を意図して「成立している」側へ置いたのか、論じなかったのかは、記録から読めない(#284 の会議体の記録は、調査E が語で当てた行以外を読んでいない)
- G-7 の省略の成立条件(監査役の意見書 5.6 の指摘)は、今回は調べていない

外部。

- ISO/IEC/IEEE 12207:2017 の 4.3 と Annex A の本文(目次だけを確認。内容は SEBoK 経由で 15288 についての記述)。JIS X 0160、IPA 共通フレーム 2013 の修整の節は開いていない
- ISO 9001:2015 4.3 の原文、CMMI のテーラリングの指針(有償。開いていない)
- ISO 26262-2 の I0〜I3 と調整(6.4.5)の原文、DO-178C の Annex A、IEC 62304 の Table A.1。いずれも二次情報だけで、二次どうしが食い違う箇所がある(DO-178C の目標の数)
- FDA の設計管理の手引きは、FDA の配布 URL が 404 で、転載で読んだ。1996 年の規則の前文は読めなかった
- NASA NPR 7150.2D の Appendix C で、ピアレビュー(SWE-087)が Class D・E に適用されないことは、ハンドブックのページの要約による。表を自分の目で確かめていない
- XP の規則は本家を取得できず、大学の写しで読んだ
- Google の実験用のコードの置き場の扱い(章の外)は確かめていない。GitHub のルールセットは要約経由で、迂回の記録の所在は確かめていない
- S0・試作の段階で独立した人の確認を省略した場合の手戻り・事故を測った資料は、見つからなかった。「省略しても害が無い」を示す資料も見つからなかった
