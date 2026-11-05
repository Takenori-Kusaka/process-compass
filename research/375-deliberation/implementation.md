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
