# #375 の実装の記録

裁定 `decision.md` のとおりに実装した。実施日: 2026-11-05。

## 1. 準拠テンプレート template/

### 変えたファイル

| ファイル | 変えたこと |
| --- | --- |
| `scripts/init/generate-profile.mjs` | `pendingNameConfirmations(before, after)` を置き、`diffConfig` の `nameConfirmItems` と、変化点の記録の `nameConfirmations` をこの1つの関数から作る。`/process-change` は、この変化点の記録のうち氏名の確認に関わる部分 `thisRecord`(`decidedBy` と `nameConfirmations`)を1回だけ作り、類A の検査の評価と、記録の書き出しの両方に使う。差分の `nameConfirmItems` と食い違えば内部の誤りとして止める |
| 同上 | 類A(この変化点の記録を足した後の構成 `withThis` で照らす): `namingProblems`(名簿・席の責任者・適合性確認の承認者)、この変化点で出された適合性確認の `qualificationAuthorityProblems`、担い手の識別の変更と同時の再確認の `qualificationAuthorityProblems`、出力の `[上書き]`、記録の `nameOverrides`、`clampSeats` の席の責任者・適合性確認の実施者と承認者の名義 |
| 同上 | 類B(変化点の前の構成で照らす。変えていない箇所を含む): 決定した者の記名(`nameProblems(config, decidedBy)`)、確認の記名者の資格、任免の決定者(`deciderProblems`)、`clampSeats` の規則の決定者・承認者(`ruleStanding` に前の記録だけを渡す) |
| 同上 | 確認の記名者が、この変化点で名簿へ足した人なら拒否する(類B)。変化点の前の名簿に体制の内の人がいない場合は、前の名簿に記名できる人がいないため、この変化点の名簿で照らす |
| 同上 | `clampSeats(seats, delegation, people, governance, { changeLog, priorChangeLog })`。`buildConfig` は `opts.pendingRecord`(構成へは書かない)を受け、`changeLog` に前の記録と `pendingRecord`、`priorChangeLog` に前の記録を渡す(裁定 R-3) |
| `scripts/gate/config.mjs` | `nameProblems` の AI の名義の拒否の文を、原因(名簿に無い / 確認の旨が無い / 確認の旨に有効な記録が無い)ごとに分けた(`aiNameHint`)。確認の記名者の要件と、確認はその人を席に置くのと同じ変化点で出せることを案内する |
| `scripts/gate/test-name-confirmation-timing.mjs` | 新設。IMPL-0446:ok(同じ変化点で確認して任命、記録と出力の上書き、契約検査の名義の行)、IMPL-0446:ng(本人・AI の名義・名簿に無い人・記名なし・AI 名どうしの相互の確認・同じ変化点で足した人による確認)、拒否の文、委任の席(前の変化点の確認・同じ変化点の確認で委任にできる、記名なしには緩まない)。日付は 2026-10-01(過去) |
| `.github/workflows/gate-g5.yml` | ジョブ contract に上の試験を足した(本体の test:template-suite はこの一覧を読む) |
| `.claude/skills/process-change/kinds/accountable.md` | 名義の検査の行に、記名者の要件(AI の名義でない、前から名簿にいる人)と、確認と任命を同じ変化点で出せることを足した |

### 判断したこと

- `namingProblems` の中(名簿・席の責任者・適合性確認の承認者)は、すべて類A だった。類A と類B が混じっていたのは `clampSeats` の ctx(席の責任者の名義と規則の決定者・承認者の資格)であり、ここを `ctx`(類A)と `ctxPrior`(類B)に分けた(裁定 R-2 の「呼び出しを分ける」)
- 適合性確認の実施者の名義は、承認者と同じく類A とした。実施者は AI維持管理者の席の責任者に置かれる人であり、席に置かれる人の名義だからである。`qualificationAuthorityProblems` は1回の呼び出しのまま `withThis` で照らす
- 担い手の識別の変更と同時の再確認(`qualificationAuthorityProblems(ctxNow, …)`)も、同じ検査の別の呼び出し箇所であり、類A として `thisRecord` を足した記録で照らした
- `clampSeats` の類B は「変化点の前の構成」を、前の変化点までの記録で照らす形にした。以前の ctx は記録を持たず、前の変化点の確認も数えなかった
- 確認の記名者の資格(類B)の例外: 変化点の前の名簿に体制の内の人がいない場合(名簿を初めて記入する変化点)は、この変化点の名簿で照らす。例外を置かないと、1名の体制の自己申告の確認(ADR-0079 追加の裁定)と初回の記入が成り立たない(probe の O-1)。任免の決定者の初回の記入の例外(第3章 3.13.3)と同じ形である
- 旧い実装では、同じ変化点で名簿へ足した人が他の人の氏名を確認すると受け付けていた(新しい試験を旧いコードで流して確かめた: 「同じ変化点で名簿へ足した人による確認」が NG)。本件の類B の検査でこの経路を塞いだ

- 準拠テンプレートのコミット: 65465dd(pit-in-template の main へ push 済み)

## 2. 標準の本文

| ファイル | 変えたこと |
| --- | --- |
| `src/content/docs/phase4-process-design/gate-criteria.md` | G-6 の氏名の確認の規定の後に箇条を1つ足した(同じ変化点で記録してよい、変化点を分けることは求めない、確認の記名の要件を先に照らし満たした確認だけを数える、確認の記名者の資格は変化点の前の構成で照らす、同じ変化点で足した人の確認は数えない、名簿を初めて記入する変化点の例外)。IMPL-0266 の注記に同じ変化点の確認を数える旨を足し、IMPL-0446(target=config-change-log、state=delivered、check=machine)と EV-0229(見直し 2027-05)を付けた |
| `src/content/docs/phase4-process-design/deliverable-templates.md` | 第6章 表5 の欄「氏名の確認」の説明に、確認した者の要件と、確認と任命を同じ変化点でよいことを書いた |
| `src/content/docs/adr/0111-name-confirmation-in-same-change-point.md` | 新設。決定1(同じ変化点の確認を数える。回帰)、決定2(類A・類B の原則と検査ごとの表、拒否の文)、決定3(clampSeats)、決定4(区別の欄を足さない、帰属は時間の前後を保証しない)、採らなかった案、影響 |
| `src/content/docs/adr/0079-coverage-scope-approval-binding-self-heal.md` | ステータスの節に、決定7 を ADR-0111 が補った旨を足した(本文は変えていない) |
| `src/data/impl-inventory.yaml` | G-6 の登録に IMPL-0446 を足した(impl:write が登録の漏れを出したため) |
| 台帳 | `evidence:write`・`impl:write`・`scope:write`(変更なし)・`template:kb` を実行した |

- 第3章 3.13 は氏名の確認を扱っておらず、揃える箇所は無かった
- G-6 の既存の文「記録を求めるAI の担い手の判断で」の句点の欠けは、裁定の外のため直していない

## 3. 回帰スイート scripts/regress/

| ファイル | 変えたこと |
| --- | --- |
| `suite/scenarios.mjs` | 「F. 名義の機械検査の上書き」の根の場面の `knownFailure`(#375)と、連鎖の2場面の `dependsOn` を外した。外す根拠として、場面の `fixes` に ADR-0111 決定1・決定2 を引き、注記に ADR-0111 決定1 で解いた旨を書いた。期待値は改めていない(`changed` なし) |
| 同上 | 拒否されたままの経路の6場面を足した(本人・AI の名義・名簿に無い人・記名なし・AI を示す語を含む名義どうしの相互の確認・同じ変化点で名簿へ足した人の記名)。`fixes` は ADR-0111 決定2・ADR-0079 決定7 |
| `expected/scenes/scenarios.txt` | `--write-scenes` で書き出した(6 場面の追加) |

## 4. 試験の結果

- 新しい試験 test-name-confirmation-timing.mjs: 新しいコードで全 15 件通過。旧いコード(template の HEAD)で流すと、IMPL-0446:ok・確認だけの変化点の上書き・同じ変化点で足した人による確認・拒否の文・委任の席の2件の 6 件が NG(直す対象を捉えていることを確かめた)。WSL の TZ=UTC でも通過
- 準拠テンプレートの試験一式(本体の test:template-suite。Windows): test-g5-aggregate.mjs(CRLF による既知の失敗)を除いてすべて通過
- 回帰スイート(WSL、--kb keep): 通常の時刻帯と TZ=UTC の両方で全本が通過。scenarios は 185 場面、印 0
- 本体の npm run check の各段(Windows で個別に実行。test:regress は上の WSL で実行): 落ちたのは test:template-suite(同じ CRLF の既知の失敗)だけ。lint:provisions は最初、試験の fixture の廃した言い回し(basis.detection の duplicationRate)を拒否したため、fixture から外して通過を確かめた。lint:text は通過。build は通過

## 突合の指摘と追加の裁定への対応

入力: `crosscheck.md`(X-1〜X-6)と、`decision.md` 末尾の追加の裁定(AR-1〜AR-3)。本体のコミットは 3a3c3cf の上に積んだ(rebase していない)。

| 指摘・裁定 | 対応 | 変えたファイル |
| --- | --- | --- |
| AR-1・X-2 例外の範囲 | 確認の記名者の資格(類B)の例外を、第3章 3.13.3 の初回の記入に限った。判定は任免の決定者の初回の例外と同じで、どの席にも責任者が記入されたことのない状態(`allBlankBefore`)で、この変化点で D-0 表1 の決定者の席に記入する人が記名する場合である。「前の名簿の体制の内が0名」の条件は廃した。G-6・表5・accountable.md の書き方を「第3章 3.13.3 の初回の記入を除く」に揃えた(G-6 には初回の記入の中身を括弧で書いた) | `generate-profile.mjs`、`gate-criteria.md`、`deliverable-templates.md`、`accountable.md`、`config.mjs`(案内の文) |
| AR-2・X-1 1名から2名への移行 | `awaitingSelfConfirmations(before, after)` を置いた。体制の内が1名から2名以上へ移る変化点で、前の名簿で効いていた本人の自己申告(`self`・`unrecorded`)の確認の id を返す。この変化点では、その確認を記名を要する項目にせず(`pendingNameConfirmations` から除く)、評価用の構成に `nameConfirmPending` を載せて、類A・類B の両方で `pending`(確認待ち)として効かせる。構成と記録へは書かない。出力に `[確認待ち]` と次の手順を出す。書き出した構成では `invalid` になり、契約検査(`nameConfirmationProblems`)が確認待ちとして落とす。出荷の証跡の集約の `configIntegrityProblems` にも `nameConfirmationProblems` を足した。拒否・注意の文に、確認待ちと次の変化点で本人以外が確認する手順(同じ PR でよい)を書いた | `config.mjs`(`nameConfirmationState` の `pending`、`nameConfirmedValid`、`nameConfirmationProblems` の文、`configIntegrityProblems`)、`generate-profile.mjs`(類B の呼び出しを評価用の構成 `cfgB` へ替えた。決定した者・規則の決定者・変更種別・規則の承認者・通知先・確認の記名者・任免の決定者)、G-6 の箇条、表5、ADR-0111 決定5、IMPL-0266・IMPL-0446 の注記、accountable.md |
| AR-3・X-3 試験と場面 | 試験に、初回の記入の例外(数える・本人の記名は拒否・AI 名どうしは拒否)、AR-1 の境界(外部の人だけが前の名簿にいる初回でない変化点では拒否)、AR-2 の経路(足す変化点は通る・確認待ちのままでは契約検査と集約が落とす・次の変化点で2人目が確認すれば解ける・構成へ印を書かない)を足した。回帰スイートに `suite/name-confirmation.mjs`(17 場面)を新設し、同じ経路を固定した | `test-name-confirmation-timing.mjs`、`scripts/regress/suite/name-confirmation.mjs`、`expected/scenes/name-confirmation.txt` |
| AR-2 に伴う既存の試験 | test-roster-rules.mjs の「2人目が加わると、本人の記名だけの確認は本人以外の記名を要する項目になる」は、2人目を足す変化点そのものの差分を見ていた。AR-2 により、その変化点では確認待ちとして項目にせず、2名以上になった後の変化点で項目になる形に分けた(2件) | `test-roster-rules.mjs` |
| X-4 表の記名者の行 | ADR-0111 決定2 の表の「決定した者の記名」を2行に分けた。AI の名義の判定は変化点の前の記録(確認待ちを効かせる)、名簿の人かの照合はこの変化点の名簿(初回の記入の決定者が同じ変化点で記入されるため。任免の決定者の要件は前の構成で別に照らす) | `adr/0111-...md` |
| X-5 アカウント名の確認 | ADR-0111 決定2 に、アカウント名の確認の記名者は類B の「前から名簿にいる」の照合の対象外であり、#375 では審議しておらず、本 ADR は課さないと書いた | `adr/0111-...md` |
| X-6 空振りの試験 | 2件目を、規則の承認待ちで委任の宣言を保持して協働に留まった席(宣言の保持を確かめる)が、記名の無い後の変化点(規則の承認を含まない名簿の変更)を受け付けても委任へ変わらない形に改めた | `test-name-confirmation-timing.mjs` |
| EV-0229 の範囲 | 対象に、例外を初回の記入に限ることで足りるという判断と、確認待ちの扱いを足した。差し替え条件に、確認待ちの件数と解けるまでの変化点の数、確認待ちを経て置いた名義の事象を足した | `gate-criteria.md` |
| ADR-0111 の本文 | ステータスの節に、公開の前に突合と追加の裁定で改めた旨を足した。決定2 の例外と境界、決定5、採らなかった案3件(例外を体制の内0名とする案、移行の場合に限り同じ変化点で足した人の確認を数える案、確認待ちを欠落に数えない案)、影響を改めた。ADR-0079 のステータスの段落に確認待ちを足した | `adr/0111-...md`、`adr/0079-...md` |

### 気づいたこと(直していない)

- 確認待ちを解く変化点(2人目が本人の氏名を確認する変化点)では、委任の規則の決定者の資格(類B)を変化点の前の構成で照らす。前の構成では本人の氏名が確認待ち(効かない)のため、本人が決定した委任の規則は成立せず、本人が責任者の委任の席は協働へ下がる(コードを読んだ範囲。実行では確かめていない)。1名の体制で AI を示す語を含む氏名の本人が委任の席を持つ場合に限る。裁定 R-3 のとおり類B は前の構成で照らすため、本件では変えていない。委任へ戻すには、確認の後に緩める向きの手続による

### 試験の結果(突合の後)

- 準拠テンプレートのコミット(突合の後): 4c5d6dd(pit-in-template の main へ push 済み)
- test-name-confirmation-timing.mjs: 25 件すべて通過(Windows、WSL の TZ=UTC)
- 準拠テンプレートの試験一式(本体の test:template-suite。Windows): test-g5-aggregate.mjs(CRLF。既知)を除いてすべて通過
- 回帰スイート(WSL、--kb keep): 通常と TZ=UTC の両方で全本が通過。name-confirmation は 17 場面。WSL の /tmp が消えていたため、作業の写し /tmp/pc430 を作り直した(リポジトリの写しと yaml、research/phase4-standard)
- 本体の npm run check の各段(Windows): 落ちたのは test:template-suite(同じ既知の失敗)だけ。lint:provisions は G-6 の追記の文末「できない」を拒否したため「取り込んではならず、出荷してはならない」へ改めて通過を確かめた。lint:text・build は通過
