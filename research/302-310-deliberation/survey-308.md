# 調査: 規則と検査の食い違い(Issue #308)

- 調査日: 2026-10-12
- 対象: Issue #308 の「決めること」3 件(`sep-self-approval` の対象・単位・1 名体制、未検査の表示、曖昧語の一覧の正本と一致の検査)
- 立場: 採否は決めない。会議体が案を競わせるための材料だけを置く
- 引用の表記: 「」と `>` の中は原文のまま。機械の挙動は、`tmp/302-310/` に置いた小さなスクリプトで実行して確かめた(6 章に所在)

## 0. 要約(論点ごと)

1. **`sep-self-approval` の由来**: 2026-08-12 のコミット `71a0dc8`(ADR-0035)で、`roles: null`・`exception: none`・`gate: null` のまま足された。以後、変更は無い。図の「同一ゲートで:起案者 × 判定者」は 2026-07-15 の `4c64709` からあり、表の行は最初から無い
2. **機械の挙動(実行して確認)**: この規則は構成(`process.config.json` の `separations`)と PROCESS-PROFILE.md の文には出るが、席の兼務の検査(`seatSeparationFindings`)と、ロールの「担ってはならない工程」の導出(`buildRoles`)は、どちらも `roles` が 2 つ揃わない組を読み飛ばす。全ロールに `selfApproval: 'forbidden'` が出るが、この値を読む処理はテンプレートに 1 つも無い。判定記録の様式に「起案した者」の欄が無く、起案者と判定者を突き合わせる検査も無い
3. **Issue に無い事実**: 標準の既定の割り当てでは、G-2・G-3・G-4・G-7 は**体制の人数によらず**、判定の対象の成果物に結果責任(A)を負う席と、判定者の席が同じである(第3章 3.3 の RACI、第5章 5.5.6、`integrated.yaml` の `approverRole`)。「起案した主体」を責任者と読むと、1 名体制だけでなく 3 名以上の体制でも抵触する。担い手(AI の実行主体の文脈)と読むと、どの体制でも抵触しない。どちらの読みかを決めた記録は無い
4. **1 名体制の規定**: G-6(未達)、G-7(代償措置つきの逸脱)、G-8 の異議と受容(逸脱)、AI維持管理者 × AI運用担当者(逸脱)には扱いがある。G-2・G-4 の判定者については、第8章 軸A の「機能仕様承認の委譲 … 不要(全部自分)」があるだけで、「起案者 × 判定者」との関係を書いた条項は無い
5. **実装マーク**: 3.5 の末尾の `IMPL-0001`(「兼務を禁止する組み合わせ」)は `state=delivered` で、図の X3 を含む節全体に掛かる。検査は「構成に `roles` のキーがあるか」までである。規約の `state` は `delivered` と `undelivered` の 2 値で、「文は降りているが検査は無い」を表す値が無い。`undelivered` は現在 11 件の前例がある。曖昧語の禁止(G-2 基準2・G-5 基準4)には実装マークが 1 つも無い
6. **曖昧語の一覧**: 12 か所に 6 通りの書き方がある(4.1 の差分表。うち 2 つは「等」「など」で省いた再掲)。本文は 6 語(第4章 G-2・附属書E・第6章 テンプレ1)、附属書B は「なるべく」「高速に」を挙げ、機械は 10 語で部分一致で落とす。「高速に」は機械が検出しない。テンプレートは「語の一覧の正本は `scripts/gate/spec-lint.mjs`」と 4 か所に書き、ADR-0010 決定1(判定基準の内容の正本は第4章)と向きが逆である。語を選んだ根拠を記した ADR・根拠水準マークは無い
7. **既存の検査**: `test:criteria`(ADR-0048)は第4章の判定基準**表**だけを本文から抽出する。曖昧語の一覧は表の外の段落にあり、降りない。`test:fields`・`test:template`・`lint:refs`・`lint:impl` のどれも、曖昧語の一覧の一致は見ない
8. **外部(曖昧語)**: ISO/IEC/IEEE 29148:2011(JIS X 0166:2014 で確認)・INCOSE GtWR V3.1・NASA SE Handbook 附属書 C は、いずれも**類を規則にし、語は例示**として挙げる(「…など」"such as" "e.g."、末尾を開く)。EARS は語の一覧を持たない。辞書による検出の実測は、適合率が平均約 59%(Femmer ら 2017)、234 件中 72 件が偽陽性(QuARS、SEI 2005)。29148:2018 と JIS X 0166:2021 の 5.2.7 の本文は読めなかった
9. **外部(本文と検査の一致)**: 型は 2 つ。本文が正本で機械が使う部分を抜き出す型(IETF の rfcstrip、W3C の webref、doctest)と、構造化データが正本で本文と検査の両方を出す型(NIST OSCAL、Kubernetes の OpenAPI)。検査の有無を規則ごとに表示する先例は、MISRA(decidable / undecidable と検査手段の表)、CIS(Automated / Manual)、XCCDF(`notchecked`)にある
10. **外部(自己承認)**: GitHub は作成者の自己承認を外せない仕様として止め、GitLab は既定で止め、Azure DevOps は票を数えない。いずれも PR(変更)の単位であり、要求や設計の承認の単位ではない。少人数で分離できない場合について、NIST SP 800-53B と PCAOB 職員見解は、代わりの統制と、根拠の記録・リスクの受容を求める

## 1. 論点A: `sep-self-approval`(起案者が自分の起案を判定しない)

以下、`RR` は `src/content/docs/phase4-process-design/roles-responsibilities.md`(第3章)、`GC` は同 `gate-criteria.md`(第4章)、`HB` は同 `human-ai-boundary.md`(第5章)、`TG` は同 `tailoring-guide.md`(第8章)、`IY` は `src/data/processes/integrated.yaml`、`GP` は `template/scripts/init/generate-profile.mjs` を指します。

### 1.1 規則の全文と由来

`IY` 66〜74 行(逐語)。

```yaml
# 兼務を禁止する組み合わせ(第3章 3.5)。人と実行主体の文脈の両方で判定する(ADR-0035)。
# 「担ってはならない工程」はここから導出する。手で書かせない
separations:
  - id: sep-self-approval
    roles: null
    scope: same-work-product
    reason: 起案した主体が判定すれば、判定は自己申告になる。役割の組み合わせによらず成立しない
    exception: none
    gate: null
```

- 由来: `git log -S"sep-self-approval"` は 1 件だけを返す。コミット `71a0dc8`(2026-08-12)「docs(standard): 兼務の禁止を実行主体の文脈で定義し、ロールを機械可読構成へ載せる(ADR-0035)」。このコミットで `separations[]` が新設され、4 組が入った。`sep-self-approval` の 6 行は、その後 1 度も変わっていない(`git log -L69,75`)。ほかの組は、のちに `exception` と `reason` が改められている(`sep-maintainer-ops` の `exception` は当初 `none`)
- コミットの本文(逐語):「案件 P-001 で、ロール別ディレクトリを分離しラベルも仕様どおり運用しながら、PO のセッションが Dev の仕事を拾って実装し、自らの成果物を判定する寸前まで進んだ(#216)。」
- 根拠の ADR は ADR-0035(採用 2026-08-12)。決定1(逐語):

> 同一の成果物について、作成を指示した主体は、その成果物の判定者になりません。この原則は体制の規模、自律の水準、実行主体が人か AI かによって変わりません。本 ADR をこの原則の参照先とします。

- 同 ADR 決定2 は、判定の単位を「人」と「実行主体の文脈」の 2 つとし、「いずれか一方でも同一であれば、分離は成立していません」と定める。決定1 の「主体」が人を指すのか、文脈を指すのか、両方かを、決定1 の文は書いていない
- 同 ADR の根拠水準マーク EV-0020 は「E2(単一事例)」で、対象は「文脈の同一性によって分離が崩れるという診断、および分離の成立条件3項目」。決定1 の原則そのものには掛かっていない
- 図の「同一ゲートで:起案者 × 判定者」は、ADR-0035 より前からある。`git log -S'起案者 × 判定者'` は `4c64709`(2026-07-15「Phase 4: detailed roles/RACI and gate criteria (#44 #45)」)を返す。この時点から、図に X3 があり、表に行が無い
- ADR-0054(採用 2026-09-30)のステータス欄は、ADR-0035 を「維持します」と書く。ADR-0035 決定1 と、第5章 5.5.6(価値責任者が AI の起案した受入基準を確定し、G-2・G-4 を判定する)との関係を述べた箇所は、ADR-0054 に無い。`src/content/docs/` で ADR-0035 の番号を含むファイルは、`RR`、`HB`、ADR-0036・0049・0054 と、2 つの台帳だけである

### 1.2 図・表・データ・検査の突合

`RR` 3.5 の図(271〜279 行、逐語)。

```
  subgraph 禁止の原則
    X1["同一成果物で:作成指示者 × 独立レビュア"]
    X2["同一案件で:開発ライン × 出荷判定者"]
    X3["同一ゲートで:起案者 × 判定者"]
    X4["同一案件で:異議を書く者 × 受容する者"]
  end
```

| 禁止 | 図(`RR` 3.5) | 表(`RR` 3.5) | データ(`IY` separations) | 3 名未満の扱いの記述 | 席の兼務の検査(`GP` `seatSeparationFindings`) |
| --- | --- | --- | --- | --- | --- |
| 作成指示者 × 独立レビュア | X1 | 行あり「**禁止**」 | `sep-author-reviewer`(`exception: none`) | あり(未達。3.5・3.5.2・ADR-0028) | 検査する。1〜2 名は「独立が成立しない」、3 名以上は拒否 |
| 開発ライン × 出荷判定者 | X2 | 行あり「**禁止**(3名未満は例外あり。3.5.2)」 | `sep-dev-shipping` | あり(代償措置つきの逸脱。3.5.2・ADR-0029) | 検査する |
| **起案者 × 判定者** | **X3** | **行なし** | `sep-self-approval`(`roles: null`、`exception: none`、`gate: null`) | **なし** | **読み飛ばす**(1.3) |
| 出荷判定者 × 事業決裁者 | X4 | 行あり | `sep-shipping-business` | あり(逸脱として記録。3.5・ADR-0056 決定5) | 検査する |
| AI維持管理者 × AI運用担当者 | なし | 行あり「**禁止**」 | `sep-maintainer-ops` | あり(逸脱として記録。3.5) | 検査する |
| 移行支援担当 × 出荷判定者 | なし | 行あり「**禁止**」 | **なし** | なし | しない(席に無い役割) |
| 標準所管 × 適合性監査の判定者 | なし | 行あり「**禁止**」 | **なし** | なし | しない(席に無い役割) |
| 価値責任者 × 技術判断者 | なし | 行あり「△(避けたい)」 | なし(10 名以上は `GP` の `sizeSeparations` が足す) | あり(`TG` 軸A) | 10 名以上で検査する |

- 図と表とデータの 3 つが揃っているのは 3 組(X1・X2・X4)である。X3 は図とデータにだけあり、表に無い。表の 2 行(移行支援担当、標準所管)はデータに無い
- 語の違い。図は「同一**ゲート**で」、データは `scope: same-work-product`(同一**成果物**)で `gate: null`、ADR-0035 決定1 は「同一の**成果物**について」。図は「起案者」、データは「起案した主体」、ADR は「作成を指示した主体」。3 つは同じ語で書かれていない
- 「起案」の語は、`RR` では別の 2 つの文脈でも使われる。3.8.3「起案・意見・決定の分離」は決裁の役割で、「各決定について、次の3つの役割を分けて記録します」と書き、起案 1 名・決定 1 名とする(別人であることは求めていない)。3.10 の「起案者」は、事前レビュー期間で判定資料を公開する者を指す

### 1.3 機械の挙動(実行して確かめた)

**読み飛ばしの箇所**(逐語)。

`GP` 780〜782 行(`seatSeparationFindings`)。

```js
  for (const sep of config.separations ?? []) {
    const [a, b] = sep.roles ?? [];
    if (!a || !b || !who[a] || who[a] !== who[b]) continue;
```

`GP` 369 行(`buildRoles`。「担ってはならない工程」の導出)。

```js
    const pairs = separations.filter((s) => (s.roles ?? []).includes(r.id));
```

`GP` 395 行(同関数の戻り値。全ロールに固定で出す)。

```js
      selfApproval: 'forbidden',
```

**実行結果**(`tmp/302-310/s308i-run1.mjs`。`buildConfig` に、人の名簿と席の責任者を渡して呼んだ)。

| 構成 | `config.separations` | `seatSeparationFindings` の結果 | `roles[].mustNotAlso` に `sep-self-approval` | `roles[].selfApproval` |
| --- | --- | --- | --- | --- |
| 1〜2 名(`size-1-2`)、9 席すべての責任者が同一人物 | `sep-self-approval` を含む 5 組 | `violations: []`、`excepted: [開発者 × 出荷判定者]`、`notIndependent: [開発者 × 独立レビュア]`、`deviated: [sep-shipping-business, sep-maintainer-ops]`。**`sep-self-approval` はどの区分にも現れない** | どのロールにも無い | 全 10 ロールで `forbidden` |
| 3〜9 名(`size-3-9`)、価値責任者・技術判断者・開発者の席が同一人物、独立レビュア・出荷判定者は別人 | 同じ 5 組 | すべて空 | どのロールにも無い | 全 10 ロールで `forbidden` |

- 1 名体制の構成で、価値責任者の席は `gatesOwned=g2,g4,g7`、`mustNotJudge=`(空)になる。ロールの詳細(`renderRoleCard`)は「判定してはならないゲート: —」と出す
- `selfApproval` を読む処理は無い。`template/` を検索して、現れるのは `GP` 395 行の 1 か所だけだった
- PROCESS-PROFILE.md(`renderProfileMd`)には、次の文が出る(`GP` 2473 行、逐語):「**起案した主体は、その成果物の判定者になりません**。役割の組み合わせによらず成立しない禁止です。分離は、作業領域・セッション・認証情報の3つがすべて分かれている場合にのみ成立します。」 つまり、**文は実行層へ降りている**。検査が無い
- CLAUDE.md の構成依存部分(`renderProcessRules`)には、この禁止の文は出ない(出力に「起案」「自己」を含む行は無かった)
- 判定記録の様式(`template/templates/04-gate-record.md`)の欄は「ゲート・対象・判定者・判定日時・結果・確定の形態・参照した D-0 の版・変更のリスク区分・リスク区分を確定した者・期限内か」である。**「起案した者」の欄は無い**。出荷の証跡の集約(`aggregate-evidence.mjs`)で「判定者」を扱う箇所を読んだ範囲では、確かめているのは、名簿の人への対応づけ、G-6 の作成指示者との別人性、2 人目の判定者・安全性の評価者との別人性、出荷判定者と事業決裁者の同一性である。G-1〜G-4 の起案者と判定者を突き合わせる処理は見つからなかった(同ファイルは約 4,000 行あり、全行は読んでいない。「判定者」「起案」の語で検索した範囲の確認である)
- 回帰の fixture。`template/scripts/gate/` の `test-*.mjs` と `adoption-trial.mjs` に `sep-` を参照する箇所は無い(検索で 0 件)。`sep-self-approval` の挙動を固定している fixture は、見つからなかった

**AI についてだけは、別の経路で降りている**。`GP` 377 行は `ai-agent` のロールに全ゲートを `mustNotJudge` として足す(コメントの逐語:「AI はどのゲートの判定者にもなれない(第5章 役割境界。提案はするが承認しない)」)。実行結果でも `role ai-agent: mustNotJudge=g1,g2,g3,g4,g5,g6,g7,g8` だった。「起案した担い手(AI)が判定しない」は、この経路で構成に出ている。ただし、これは `sep-self-approval` からの導出ではない。

### 1.4 ゲートごとの「成果物の結果責任者」と「判定者」(標準の既定)

`IY` の `workProducts[].producedBy` と `gates[].approverRole`、`RR` 3.3 の RACI、`HB` 5.5.6 を並べた。

| ゲート | 判定の対象(`IY` deliverables) | `producedBy`(`IY`) | RACI の A(`RR` 3.3) | 判定者(`IY` approverRole) | A の席と判定者の席 |
| --- | --- | --- | --- | --- | --- |
| G-1 | 企画書、D-0 | value-owner | 価値責任者(事業意図の言語化 **A**/R) | biz-approver | **別** |
| G-2 | 機能仕様書(受入基準付き) | ai-agent | 価値責任者(協働仕様化・受入基準 **A**) | value-owner | **同じ** |
| G-3 | 設計案、判断記録(ADR)案 | tech-lead | 技術判断者(技術設計(ADR) **A**/R) | tech-lead | **同じ** |
| G-4 | 機能単位の仕様(AI起案)、実装計画 | ai-agent | 価値責任者(機能仕様サイクル **A**) | value-owner | **同じ** |
| G-6 | PR | ai-agent | 開発者(実装・テスト生成 **A**/R) | independent-reviewer | **別** |
| G-7 | 品質レポート、技術負債台帳、全ゲート通過記録 | qa-gatekeeper(品質レポート) | QA(出荷判定 **A**/R) | qa-gatekeeper | **同じ** |
| G-8 | 出荷判定結果、事業影響評価 | —(データに対応する `workProducts` が無い) | 事業決裁者(リリース決裁 **A**/R) | biz-approver | 出荷判定結果は別、決裁は同じ |

- `HB` 5.5.6 の価値責任者の行(逐語):「協働で AI が起案できるもの … 受入基準の草案、機能仕様承認(G-4)の判定の草案、優先順位の案」「委任せず、人が確定する判断 … 要件合意(G-2)と G-4 の判定、確約範囲(SC-M)に触れる変更、R1 の決定」
- `HB` 5.5.2 の協働の行(逐語):「AI が行うこと … 判断の案と根拠を起案する」「人が行うこと … 変更ごとに確認し、確定する」
- `IY` の価値責任者(逐語):「What/Why の決定と価値の説明責任を単独で持つ。要件合意・仕様承認の判定者。」同 `jpNote`:「『1つの成果物に責任者は1人』の原則(ギャップG2対応)。… 判定は単独で行い合議体にしない」
- `GC`「ゲート運用の共通ルール」1(逐語):「**単独判定**: 判定者は1人。」

**ここから言えること**。標準の既定では、G-2・G-3・G-4・G-7 は、判定の対象に結果責任を負う席の責任者が、そのまま判定者である。これは 1 名体制に限らない。3 名以上の体制でも同じである。したがって、`sep-self-approval` の「起案した主体」をどちらに読むかで、帰結が変わる。

| 読み | 「起案した主体」 | 1 名体制の G-2・G-4 | 3 名以上の体制の G-2・G-3・G-4・G-7 | 支える条項 | 合わない条項 |
| --- | --- | --- | --- | --- | --- |
| a | 担い手(AI の実行主体の文脈。セッション) | 抵触しない(AI が起案し、人が確定する) | 抵触しない | ADR-0035 のコンテキスト(P-001 は 1 つのセッションが起案と判定を担いかけた事象)、同 決定2 の「実行主体の文脈」、`HB` 5.5.2・5.5.6、`GP` の `ai-agent` の全ゲート `mustNotJudge` | 人が AI を使わず自分で仕様を書いて自分で G-2 を判定する場合を、この規則は扱わなくなる。データの `reason` の「役割の組み合わせによらず成立しない」は、文脈に限るとは書いていない |
| b | 責任者(人)。作成を指示した者を含む | 抵触する(G-1〜G-4・G-7・G-8 のすべて) | G-2・G-3・G-4・G-7 で抵触する | ADR-0035 決定1「体制の規模 … によって変わりません」、`RR` 3.5.4「責任者が同一人物なら、AI を何体に分けても独立は成立しない」、データの `exception: none` | `RR` 3.3 の RACI、`HB` 5.5.6、`GC` の単独判定、`IY` の `approverRole`、`TG` 軸A「不要(全部自分)」、`RR` 3.5「それ以外の兼務は許可です」 |

- `RR` 3.5.4 の「独立」の定義は、「確認する席の責任者が、作成を指示した者と別の自然人である」である。これは確認(G-6)について書かれた定義である。G-2〜G-4 の判定を「確認」と呼ぶ条項は、見つからなかった
- `RR` 3.5 は冒頭で「**禁止する組み合わせを最小限に絞って**明示します。それ以外の兼務は許可です」と書く。X3 は図に掲げられているが、表には無い

### 1.5 1 名体制の G-2・G-4 の判定者に関する規定

| 所在 | 逐語 | G-2・G-4 の判定者について言っていること |
| --- | --- | --- |
| `TG` 軸A の表 | 「機能仕様承認の委譲」の行。1〜2名「不要(全部自分)」、3〜9名「必要に応じて」、10名以上「機能責任者へ積極委譲」 | 1〜2 名では、価値責任者が自分で G-4 を判定する |
| `TG` 軸A | 「最小体制(3名)未満では、作成指示者・レビュア・判定者の兼務禁止が成立しません。1〜2名の場合も、**独立レビューだけは、作成を指示した本人以外の人に求めます**。」 | 兼務禁止が成立しないことを認め、人に求めるのは独立レビュー「だけ」と書く |
| `RR` 3.5 | 「**最小体制は3名**です(作成指示者・独立レビュア・出荷判定者の兼務禁止を満たす下限)。」 | 最小体制の根拠に挙がるのは 3 つの席で、起案者 × 判定者は挙がらない |
| `RR` 3.5 | 「3名未満の体制でも禁止する案は、採りませんでした。1名体制を宣言できなくなり、未達と逸脱を隠さずに表示するという ADR-0028 の方針に合わないためです。」 | 出荷判定者 × 事業決裁者についての記述。起案者 × 判定者については書かれていない |
| `TG` 軸A | 「**1名の体制であることを理由に、協働や委任の範囲を広げてはなりません**。」 | 運用形態の上限は人数で変わらない |
| `GC` G-4 見出し | 「G-4 機能仕様承認(価値責任者または委譲先・24時間)」 | 判定者は価値責任者 |
| `IY` `sep-self-approval` | 「exception: none」 | 1 名体制の扱いを持たない |

- 実行結果(1.3)のとおり、1 名体制の構成では G-2・G-4 は `required` で、`unmet` は G-6 だけ、逸脱は G-7 と 2 組の兼務である。G-2・G-4 について、未達・逸脱・表示のどれも出ない
- 1 名体制の G-2・G-4 が「起案者 × 判定者」に当たるかどうかを定めた条項は、**見つからなかった**。読み a なら当たらず、読み b なら当たる

### 1.6 記録の新旧と上書きの関係

| 記録 | 日付 | 内容 | 上書きの関係 |
| --- | --- | --- | --- |
| `RR` 3.5 の図 X3 | 2026-07-15(`4c64709`) | 「同一ゲートで:起案者 × 判定者」 | 以後、変更なし |
| `RR` 3.3 の RACI、G-2・G-4 の判定者 = 価値責任者 | 2026-07-15(同コミット) | 受入基準の A と判定者が同じ席 | 図 X3 と同じコミットで入っている |
| ADR-0035 決定1、`IY` `sep-self-approval` | 2026-08-12 | 「作成を指示した主体は、その成果物の判定者になりません」「体制の規模 … によって変わりません」 | 図 X3 を根拠づける位置にある。ADR は「3.5 の兼務禁止表は変更せず、判定の単位を追加します」と書く |
| ADR-0054 決定1〜7、`HB` 5.5.2・5.5.6 | 2026-09-30 | 席・責任者・担い手を分ける。協働では AI が起案し、責任者が確定する。独立は人の単位 | ステータス欄は ADR-0035 を「維持します」と書く。決定1 との関係は述べていない |
| ADR-0056 決定5、`RR` 3.5 の X4 | 2026-09-30 採用(2026-10-03 に一部置き換え) | 出荷判定者 × 事業決裁者。3 名未満は逸脱 | X3 には触れていない |

- もっとも新しい体系的な記録(ADR-0054)は、起案と確定の分担を「担い手が起案し、責任者が確定する」と定めた。この記録は読み a と合う。ただし、ADR-0035 決定1 を読み a に限ると書いた記録は無い
- どちらかが誤りだと決めた記録も無い

## 2. 論点B: 検査していないことを実装マークで表示するか

### 2.1 実装マークの規約が定めていること

`src/content/docs/community/implementation-marking.md`(逐語)。

- 対象:「対象は『実行主体の挙動を制約する規定』です。全条項を対象にしません。維持できない台帳は、それ自体が降りていない規定になります。」
- `state` の値:「`delivered`(降りている)または `undelivered`(降りていない)」
- 検査の内容。`config-key` は「サンプル回答から構成を生成し、キーの存在を確かめる」、`template-file` は「存在を確かめる」
- 降りていない規定の扱い:「`state=undelivered` は削除の対象ではありません。**降りていない事実を表示し続けます**。未達のゲートと同じ扱いです。」
- 限界:「**マークの付いていない規定は検出できません**。本規約が保証するのは、マークを付けた規定について降ろし先が実在することだけです。網羅性は保証しません。」
- 逆流:「本規約が見るのは『規定 → 降ろし先』の一方向だけです。**逆向き、すなわち実行層にしか存在しない規定を検出できません**。」「逆流は、ADR-0010 が定める正本の向きを崩します。テンプレートは案件が改変できるため、統制の根拠になりません。」

つまり、規約が機械で確かめるのは**降ろし先の実在**(キーがあるか、ファイルがあるか)である。**降ろした規定が検査されているか**は、規約の対象ではない。

### 2.2 `sep-self-approval` に関わる現在のマーク

| マーク | 所在 | 逐語 | この論点との関係 |
| --- | --- | --- | --- |
| IMPL-0001 | `RR` 3.5 の末尾(339 行) | `<!-- impl IMPL-0001 target=config-roles state=delivered note="兼務を禁止する組み合わせ" -->` | 図 X3 を含む 3.5 全体の直後に置かれ、`delivered` である。検査(`scripts/check-impl.mjs`)が確かめるのは、サンプル回答(1〜2 名)から生成した構成に `roles` のキーがあることまで |
| IMPL-0003 | `RR` 3.5.3 の末尾 | `target=next-role state=delivered note="実行主体が起動時に参照する内容(判定するゲート・担ってはならない工程・引き渡し先)"` | 「担ってはならない工程」は兼務禁止表から導出する。`sep-self-approval` は導出に寄与しない(1.3) |

- 降ろし先の登録簿 `src/data/impl-targets.yaml` の `config-roles`(逐語):「description: ロールごとの判定ゲート・担ってはならない工程・兼務の禁止(ADR-0035)」「check: check-process-rules」。`check-process-rules.mjs` は、CLAUDE.md の構成依存部分が構成と一致するかを検査する。兼務の禁止の中身は検査しない
- X3 だけを指すマークは無い

### 2.3 `undelivered` の前例

台帳(`community/implementation-ledger.md`)の「降りていない規定」は 11 件である(IMPL-0023・0026・0042〜0048・0086・0102)。全体は 102 件(`node scripts/check-impl.mjs` の出力「実装マーク: 102件(降りていない規定: 11件)」)。前例の書き方は 3 通りある。

| 型 | 例(逐語) |
| --- | --- |
| まったく降りていない | IMPL-0044「G-7 基準6。AI 品質指標の確認の記録を集約へ取り込む」 |
| **一部だけ降りている**(有無は確かめるが、中身は確かめない) | IMPL-0042「G-7 基準3。受容した負債の記録漏れの検出。台帳の有無だけを確かめており、変更との突合が降りていない」、IMPL-0043「G-7 基準4。運用引き継ぎ文書の3項目の記載の確認。文書の有無だけを確かめている」 |
| 機械では確かめないと決めたもの | IMPL-0086「10名以上の規則『機能責任者へ仕様承認を積極委譲する』。機能責任者の席も委譲の記録も構成に無く、G-4 の判定者は価値責任者の席のまま。機械では確かめない。採用者は委譲の有無と判定者を社内の手順で定め…」、IMPL-0102「…自己申告を超えて検査できる条件が定まっていないため、テンプレートへ降ろしていない」 |

- 「一部だけ降りている」状態を `undelivered` で表した前例がある(IMPL-0042・0043)。「機械では確かめない」と決めた事項を `undelivered` で表した前例もある(IMPL-0086)
- 台帳の「降りていない規定」の節は、冒頭に次の定型文を出す(`scripts/check-impl.mjs` の `renderLedger`、逐語):「次の規定は、実行層に対応する記述がありません。**案件からは『規定がない』ものとして扱われます**。」 `sep-self-approval` は、PROCESS-PROFILE.md に文が出ている(1.3)。この定型文は、`sep-self-approval` の状態(文はあり、検査が無い)を正確には表さない。IMPL-0042・0043 も同じずれを持つ
- 曖昧語の禁止(`GC` G-2 基準2、G-5 基準4)には、実装マークが 1 つも無い(台帳を「spec-lint」「曖昧語」で検索して 0 件)。機械が検査しているのに、台帳には現れない

## 3. 論点C: 曖昧語の一覧

### 3.1 一覧の所在と差分

標準とテンプレートを「曖昧語」「禁止語」で検索し、語を挙げている箇所をすべて拾った。12 か所ある。

| # | 所在 | 性格 | 逐語 |
| --- | --- | --- | --- |
| 1 | `GC` G-2(170 行) | 本文(第4章)。判定基準2 の「確認方法」が指す先 | 「**曖昧語の禁止リスト(初期値)**: 『適切に』『柔軟に』『可能な限り』『〜など』『必要に応じて』『基本的に』。これらは受入基準に使用不可とし、AI によるチェックを CI に組み込みます(フェーズ5)。」 |
| 2 | 附属書E E.3(`developer-guide.md` 42 行) | 附属書(手引き) | 「曖昧語(『適切に』『柔軟に』『可能な限り』『〜など』『必要に応じて』『基本的に』)を使用しない」 |
| 3 | 第6章 テンプレ1(`deliverable-templates.md` 356 行) | 様式の中のコメント | 「<!-- 『適切に』『柔軟に』『可能な限り』『〜など』『必要に応じて』『基本的に』は使用不可 -->」 |
| 4 | 附属書B 冒頭(`ears-guide.md` 12 行) | 附属書(手引き) | 「『適切に』『柔軟に』『なるべく』で書かれた基準は、**AI もテストに変換できず、人も合否を判定できない**。」 |
| 5 | 附属書B チェックリスト(同 66 行) | 附属書の点検表 | 「- [ ] 『適切に』『柔軟に』『なるべく』『高速に』等の曖昧語がゼロ」 |
| 6 | `IY` 434 行(タスクの説明) | 規則データ | 「『適切に』『柔軟に』『なるべく』等の曖昧語をゼロにする」 |
| 7 | フェーズ5 CI ゲート(`ci-gates.md` 93 行) | 本文(フェーズ5) | 「**曖昧語検査は textlint で実装できる**。ゲート基準 G-2 の禁止語リスト(『適切に』『柔軟に』等)をカスタムルール化し、仕様書を機械検査する」 |
| 8 | `template/scripts/gate/spec-lint.mjs` 16〜28 行 | 機械(G-5 基準4 の実装) | 「/** 第4章 G-2 の禁止語(初期値)。組織で追加してよい */」に続けて `'適切に', '柔軟に', '可能な限り', 'など', '必要に応じて', '基本的に', '原則として', '速やかに', '十分に', 'なるべく'` |
| 9 | `template/.claude/skills/spec-write/SKILL.md` 30〜37 行 | テンプレートのスキル | 「次の語は使えません。CI の `spec-lint` が検出し、G-5 を失敗させます。」に続けて 8 と同じ 10 語 |
| 10 | `template/specs/README.md` 19〜26 行 | テンプレートの案内 | 「次の語は `spec-lint` が検出し、G-5 を失敗させる。」に続けて同じ 10 語 |
| 11 | `template/.github/ISSUE_TEMPLATE/feature.yml` 9〜10 行 | テンプレートの Issue の様式 | 「曖昧語(適切に / 柔軟に / 可能な限り / など / 必要に応じて / 基本的に)は CI で検出されます。」 |
| 12 | `template/templates/g2-sample-gate-record.md` 44 行 | テンプレートの記入例 | 「適切に/柔軟に/可能な限りなどの『曖昧語』がすべて排除されている(spec-lint適合)」 |

語ごとの差分(○ = 挙げている、— = 挙げていない)。

| 語 | 1 `GC` G-2 | 2 附属書E | 3 テンプレ1 | 4 附属書B 冒頭 | 5 附属書B 点検表 | 6 `IY` | 8 spec-lint(機械) | 9・10 テンプレートの文書 | 11 feature.yml |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 適切に | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 柔軟に | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 可能な限り | ○ | ○ | ○ | — | — | — | ○ | ○ | ○ |
| 〜など / など | ○(「〜など」) | ○ | ○ | — | — | — | ○(「など」) | ○ | ○ |
| 必要に応じて | ○ | ○ | ○ | — | — | — | ○ | ○ | ○ |
| 基本的に | ○ | ○ | ○ | — | — | — | ○ | ○ | ○ |
| 原則として | — | — | — | — | — | — | ○ | ○ | — |
| 速やかに | — | — | — | — | — | — | ○ | ○ | — |
| 十分に | — | — | — | — | — | — | ○ | ○ | — |
| なるべく | — | — | — | ○ | ○ | ○ | ○ | ○ | — |
| 高速に | — | — | — | — | ○ | — | **—** | — | — |
| 語数 | 6 | 6 | 6 | 3 | 4(「等」つき) | 3(「等」つき) | 10 | 10 | 6 |

- 本文(1)の 6 語は、機械(8)の 10 語の部分集合である。機械だけが持つ語は 4 つ(原則として・速やかに・十分に・なるべく)
- 附属書B の点検表(5)が挙げる「高速に」は、機械も本文(1)も挙げていない
- テンプレートの中でも揃っていない。`feature.yml`(11)は 6 語を挙げて「CI で検出されます」と書くが、CI は 10 語で落とす
- Issue #308 は「第4章 G-2(6 語)、附属書B、`spec-lint.mjs`(10 語)」の 3 か所を挙げる。実際には、標準の側だけで 7 か所、テンプレートの側に 5 か所ある

### 3.2 由来

| 一覧 | 入ったコミット | 語を選んだ理由の記録 |
| --- | --- | --- |
| `GC` G-2 の 6 語 | `4c64709`(2026-07-15「Phase 4: detailed roles/RACI and gate criteria (#44 #45)」)。`git log -S'曖昧語の禁止リスト'` はこの 1 件だけを返す | 見つからなかった。`src/content/docs/adr/` に「曖昧語」「spec-lint」を含む ADR は無い |
| 附属書B の「なるべく」「高速に」 | `4b5779b`(2026-08-04「M8: EARS 記法ガイドを新設 (#86)」) | 見つからなかった |
| `spec-lint.mjs` の 10 語 | テンプレートの初版 `90f0f08`(2026-08-08「feat: ピットイン方式準拠テンプレートの初版」)。`git log -L16,28` はこの 1 件だけを返す。初版から 10 語で、以後変わっていない | コードのコメントは「第4章 G-2 の禁止語(初期値)。組織で追加してよい」と書く。4 語を足した理由の記録は見つからなかった |

- 本文の一覧は「初期値」と書かれているが、根拠水準マーク(ADR-0026)は付いていない。`GC` の G-2 の節に `:::caution[暫定 EV-…]` は無い
- 本文(1)は「AI によるチェックを CI に組み込みます」と書く。実装(8)は語の部分一致であり、AI を使っていない。`ci-gates.md`(7)は「textlint で実装できる」と書くが、実装は textlint ではなく独自のスクリプトである
- 「組織で追加してよい」は、機械のコメント(8)にだけある。本文(1)は「初期値」と書くだけで、誰が・どの手続で足すかを定めていない

### 3.3 機械の挙動(実行して確かめた)

`spec-lint.mjs` と `config.mjs` を `tmp/302-310/s308i-lint/scripts/gate/` へ複製し、同じ場所に試験用の `specs/F-001/spec.md`・`specs/F-002/plan.md`・`docs/note.md` を置いて、引数なしで実行した(テンプレートは変えていない)。結果は「2 ファイルを検査、13 件検出」、終了コード 1。

| 入力(受入基準の行) | 結果 | 分かったこと |
| --- | --- | --- |
| 10 語をそれぞれ 1 行ずつ | 10 件とも検出 | 機械は 10 語で落とす。本文に無い 4 語(原則として・速やかに・十分に・なるべく)でも G-5 が失敗する |
| 「高速に応答しなければならない」 | **検出しない** | 附属書B の点検表が挙げる語を、機械は見ない |
| 「迅速に、ユーザーフレンドリーに、できるだけ早く、適宜、通常は、場合によっては応答する」 | **検出しない** | 一覧の外の語は通る |
| 「適切な権限を持つ利用者にだけ表示しなければならない」 | **検出しない** | 形容詞の形(適切な)は通る。副詞の形(適切に)だけを見る |
| 「不適切にならないようにする」 | **検出する**(「適切に」として) | 部分一致のため、別の語の一部を拾う |
| 「スコープ外」の節の「帳票の PDF 出力など(次の版で扱う)」 | **検出する** | 検査は受入基準の節に限らない。機能仕様のファイル全体を見る |
| `specs/F-002/plan.md`(実装計画)の「ライブラリの更新などを含める」 | **検出する** | 実装計画も対象になる(`specs/F-NNN/` の下の `.md` すべて) |
| 行末に `<!-- spec-lint-ok -->` を付けた「原則として」 | **検出しない** | 行ごとの除外の印がある。この印は `spec-lint.mjs` の 71 行にだけあり、標準の本文にもテンプレートの文書にも記述が無い(検索で 1 件) |
| コードブロックの中の「適切に」 | 検出しない | コードブロックは除く |
| `docs/note.md` の「適切に」 | 検出しない(対象外) | 既定の対象は `specs/F-NNN/` だけ(`ci-gates.md` 94・847 行の記述と合う) |

本文との突合。

- `GC` G-2 は「これらは**受入基準に**使用不可」と書く。機械は、機能仕様の置き場のファイル全体(スコープ外・背景・実装計画を含む)で落とす。範囲が本文より広い
- `GC` G-5 基準4 は「曖昧語チェック(仕様変更を含むPRの場合) … 禁止語 0 件」と書く。テンプレートの CI は「構成に依存しないため常に走らせる」(`gate-g5.yml` 132 行のコメント)。仕様変更を含まない PR でも走る
- 除外の印(`spec-lint-ok`)は、「禁止語 0 件」を機械の上で 0 件にする手段である。誰が・どの条件で使ってよいかを定めた条項は無い
- 回帰の fixture。`template/scripts/gate/test-init-g5.mjs` 113〜115 行は、「入力が空の場合など、エラーを返す」の行を足して spec-lint が落ちることを確かめる。使う語は「など」だけである。「など」を含む一覧であれば、この fixture は通る。様式から起こした直後の機能仕様・実装計画が通ること(111〜112 行)も確かめている。一覧へ語を足す場合は、様式(`templates/01-feature-spec.md`、`07-implementation-plan.md`)にその語が無いことが条件になる

### 3.4 正本の向きについての既存の決定と、現状

| 記録 | 逐語 | この論点への当てはめ |
| --- | --- | --- |
| ADR-0010 決定1 | 「判定基準の内容・閾値・期限・様式・例外の扱いの正本はフェーズ4の各章」 | 曖昧語の一覧は、G-2 基準2 の「確認方法」が指す内容である。この決定に従えば、正本は第4章になる |
| ADR-0048 決定1・2 | 「判定基準の正本を、第4章の判定基準表とする」「`scripts/check-gate-criteria.mjs` が第4章の判定基準表から抽出し、`--write` で書き戻します。」「**既存の3系統(実装マーク・適用範囲・根拠水準)と同じ作法です**。本文が正本、複製は自動生成、手で編集しない。」 | 本文から機械可読の複製を生成する作法は、すでに 4 系統ある |
| ADR-0048 決定3 | 「第4章の G-3 には判定基準表の後に3節、G-5 には8節、G-7 には4節があります。**これらは表の外にあり、表の機械抽出では降りません**。**降りないものを、降りたように見せてはなりません**。」 | 曖昧語の一覧は G-2 の表の外の段落にある。この決定の「降りない」側に当たる。知識ベースは `criteriaNote` で「表の外にある規範(手続・禁止・注記)は含まない」と明示している(`scripts/build-template-kb.mjs` 148〜149 行) |
| ADR-0040 決定1・4 | 「テンプレートの様式を、標準の様式の部分集合と定める」「簡略化は**欄を落とすこと**に限ります。」 | 対象は様式(`template/templates/*.md`)である。検査スクリプトの語の一覧は、この決定の対象として書かれていない。前回の意見書(`research/300-book-intake/council-03-qa-audit.md` N9)は「テンプレートのほうが広い状態は向きが逆です」と述べたが、ADR-0040 の文言が検査スクリプトに及ぶかは、決定の本文からは読めない |
| 実装マークの規約「逆流を検出できない」 | 「実行層にしかない … テンプレートが正本になる … 検出: **手段がない**」 | テンプレートは 4 か所で、スクリプトを正本と書いている(下) |
| CLAUDE.md(本リポジトリ)「準拠テンプレート」 | 「テーラリングエンジン(`src/lib/tailoring-engine.mjs`)と規則データ(`src/data/tailoring/`)を複製して使う。**正本はこちら側**」 | 複製の検査(`test:template`)の対象は、エンジンと知識ベースである。`spec-lint.mjs` は複製ではなく、テンプレートにだけある |

テンプレートが「正本はスクリプト」と書く 4 か所(逐語)。

- `template/CLAUDE.md` 128 行:「語の一覧の正本は `scripts/gate/spec-lint.mjs`(10語)。」
- `template/templates/01-feature-spec.md` 21 行:「語の一覧は `scripts/gate/spec-lint.mjs`(正本)と `specs/README.md` にあります。」
- `template/.claude/skills/artifact/artifacts/01-feature-spec.md` 33 行と `template/.claude/skills/gate/gates/G-2.md` 30 行:「# 曖昧語(語の一覧の正本はスクリプト)」

現状をまとめると、次のとおりである。

- 本文(第4章)は、自分の一覧を正本とも初期値の出どころとも書く(「初期値」)。テンプレートは、スクリプトを正本と書く。2 つの「正本」が並んでいる
- 機械のコメントは「第4章 G-2 の禁止語(初期値)」と出どころを本文に置きながら、本文に無い 4 語を持つ
- 機械で落ちた仕様のうち、4 語(原則として・速やかに・十分に・なるべく)による失敗は、根拠の条項を本文から示せない。逆に、附属書B が挙げる「高速に」を使った受入基準は、機械を通る

### 3.5 本文と機械の一致を検査する既存の仕組み

`npm run check` が呼ぶ検査のうち、本文と機械(またはテンプレート)の対応を見るものを、スクリプトの冒頭の説明から整理した。

| 検査 | スクリプト | 正本 | 見ているもの | 曖昧語の一覧 | `sep-self-approval` |
| --- | --- | --- | --- | --- | --- |
| `test:criteria` | `scripts/check-gate-criteria.mjs` | 第4章の判定基準**表**(ADR-0048) | 表の「判定基準」の列と、`IY` の `gates[].criteria` の一致。`--write` で書き戻す。「表の外にある規範 … は降りません」 | 見ない(表の外) | 見ない |
| `test:fields` | `scripts/check-template-fields.mjs` | 第6章の様式(ADR-0040) | 対応表 `src/data/template-fields.yaml` の必須欄が、標準の本文に実在するか(方向1)、テンプレートの様式に存在するか(方向2) | 見ない。テンプレ1 の登録は欄の見出し「## 受入基準(検証可能な形式で。曖昧語禁止)」まで | 見ない |
| `test:template` | `scripts/check-template-drift.mjs` | 本リポジトリの `src/` | (1) エンジンの本文の一致、(2) 知識ベースが最新の YAML から生成されたか、(3) ゲートの識別子の一致、(4) 様式の番号・ゲートとの対応・「両側に現れなければならない項目名」 | 見ない(`spec-lint.mjs` は複製ではない) | 複製の一致だけを見る(`roles: null` のまま複製される) |
| `lint:refs` | `scripts/check-section-refs.mjs` | 参照先のページ | 附属書H ほかが引く節番号・ゲート・基準・様式・ADR 番号の**実在**。「参照先の内容が、引いた側の記述と合っているか」は検査しないと明記 | 見ない | 見ない |
| `lint:impl` | `scripts/check-impl.mjs` | 実装マーク | 降ろし先の実在(構成のキー、ファイル、検査スクリプトのファイル) | マークが無いので現れない | IMPL-0001 は `roles` のキーの存在で通る |
| `test:engine` | `scripts/test-tailoring-engine.mjs` | 規則データ | 規則の参照先の id の実在と、ペルソナのシナリオ | 見ない | 見ない |
| `lint:scope` / `lint:evidence` | `check-scope.mjs` / `check-evidence.mjs` | 本文のマーク | 適用範囲の注記と根拠水準マークの書式・台帳の鮮度 | 見ない | 見ない |

- 語の一覧のように「本文の段落の中の列挙」と「機械の配列」を突き合わせる検査は、現在 1 つも無い
- 「本文の表から抽出して複製を生成する」(`test:criteria`)と、「対応表を介して両方向の実在を確かめる」(`test:fields`)という 2 つの作法が、すでに運用されている。`check-template-drift.mjs` の 4-c(「両側で同一の語で規定すると決めた項目だけを列挙します。乖離が判明して両側へ揃えたときに、再発防止として追記してください」)は、3 つ目の作法(判明した乖離を 1 件ずつ登録する)である
- 前回の意見書(`council-03-qa-audit.md` 5 章 2)は、数の記述の揺れ(U2・N6・N3・U1)について「個別の訂正だけでは、次の改訂で再発します」と述べ、突合の検査を提案している。曖昧語の一覧の揺れは、同じ型(同じ内容を複数の箇所に手で書く)である

## 4. 世の中がどうなっているか

確認日はすべて 2026-10-12。原典の取得は、私の指示で動かした調査用のサブエージェントが `curl` で行い、PDF は本文化して該当箇所を読んだ。取得物は `tmp/302-310/dl308/`、項目ごとの詳しい逐語は `tmp/302-310/survey-308-external.md`(614 行)にある。私は、下に引いた逐語のうち 17 件を、取得した原本の本文と突き合わせて一致を確かめた(JIS X 0166:2014 の 5.2.7、INCOSE R8 と自動化の段落、Femmer らの再現率の注記、QuARS の偽陽性、XCCDF の `notchecked`、MISRA の GEP、CIS の定義、RFC 8407、Kubernetes、GitHub・GitLab・Azure DevOps の各 1 文、SP 800-53B の脚注、PCAOB の用語)。残りは、サブエージェントの報告のままである。`research/282-survey-2026-09/by-issue.md` に #308 の項は無い。既存の出典台帳に当たるものは SRC 番号を添えた。

### 4.1 要求仕様の曖昧語の一覧

| 文献 | 語の一覧の性格 | 逐語(該当箇所) |
| --- | --- | --- |
| ISO/IEC/IEEE 29148:2011 の 5.2.7(翻訳 JIS X 0166:2014 で確認。https://kikakurui.com/x0/X0166-2014-01.html ) | **類を規範で禁じ、語は例示**。9 つのタイプに 2〜3 語ずつ「…など」で挙げる。例外を注記で書く。5.2.7 は完全適合の対象に名指しされている | 「曖昧な用語及び一般的な用語は，避けなければならない。これらは，検証が多分に難しいか若しくは不可能ですらあるような要求事項，又は複数解釈を許すような要求事項をもたらす。定義範囲がはっきりしない又は曖昧な表現のタイプを次に示す。」「− 抜け穴(“可能ならば”，“必要に応じて”，“適宜”など)」「− 曖昧な副詞及び形容詞(“ほとんどいつも”，“相当な”，“最小限の”など)」「− 無制限の検証不可能な用語(“支援する”，“〜に限らない”，“最低でも”など)」「注記1 要求事項の定義に必要な最上級表現(例えば，“最高の金額提示者に落札する”)を禁止するものではない。」 適合性(同 JIS 箇条 2):「この規格への完全適合性を主張することは，次の全ての事項への適合性を主張することと等価である。− 5.2.4，5.2.5，5.2.6及び5.2.7に含まれる規定」 |
| INCOSE Guide to Writing Requirements V3.1(2022。SRC-0575。FND-0243 が R8・R9 を引く) | **規則は類、語は "such as" の例示**。R7 は一覧のあとに一般則を置く。階層による例外を規則の中に書く | R7:「Avoid the use of vague terms.」「Avoid vague adjectives such as "ancillary", "relevant", "routine", "common", "generic", "significant", "flexible", "expandable", "typical", "sufficient", "adequate", "appropriate", "efficient", "effective", "proficient", "reasonable" and "customary."」「As a general rule, words that end in "-ly" often result in ambiguity.」 R8:「Avoid escape clauses.」「…using phrases such as "so far as is possible", "as little as possible", "where possible", "as much as possible", "if it should prove necessary", "if necessary", "to the extent necessary", "as appropriate", "as required", "to the extent practical", and "if practicable."」 R9:「Avoid non-specific phrases such as "including but not limited to", "etc." and "and so on."」 |
| 同上(ツールとの関係) | **ツールは規則の部分集合しか検査しない**ことを前提に書く | 「Many of these tools use a subset of the rules defined in this Guide as a basis for assessing the quality of the need and requirement statements」「Given these applications do not address all the rules within this Guide, the project team will still need to address defects associated with the other rules not addressed by the NLP/AI applications within their toolset.」 |
| NASA Systems Engineering Handbook 附属書 C(SRC-0563。https://www.nasa.gov/reference/appendix-c-how-to-write-a-good-requirement/ ) | **問いの形の点検項目。語は "e.g." の例示で、末尾を開く** | 「Are the requirements free of unverifiable terms (e.g., flexible, easy, sufficient, safe, ad hoc, adequate, accommodate, user-friendly, usable, when required, if required, appropriate, fast, portable, light-weight, small, large, maximize, minimize, sufficient, robust, quickly, easily, clearly, other “ly” words, other “ize” words)?」 |
| EARS(公式サイト https://alistairmavin.com/ears/ 。SRC-0442) | **語の一覧を持たない**。定めるのは節の順序とキーワード | 「The EARS ruleset states that a requirement must have: Zero or many preconditions; Zero or one trigger; One system name; One or many system responses.」 2009 年の原論文は抄録まで:「A small set of structural rules was developed to address eight common requirement problems including ambiguity, complexity and vagueness.」 |
| NASA ARM(Wilson "Writing Effective Requirements Specifications" 1997。https://www.csc.kth.se/utbildning/kth/kurser/DD1363/NASARequirements.html ) | **ツールが独自の一覧を持つ**(NASA の SRS 50 件超から選んだ語)。規格の一覧の写しではない | 「The weak phrases reported by the ARM tool are: adequate / as a minimum / as applicable / easy / as appropriate / be able to / be capable / but not limited to / capability of / capability to / effective / if practical / normal / provide for / timely / tbd」 |
| QuARS(Lami, CMU/SEI-2005-TR-014) | **辞書はツールの外のテキストファイルで、利用者が編集する** | 「The number and the content of these dictionaries may vary according to the application domain and user needs.」「it is possible to permanently modify dictionaries, create new dictionaries, and delete existing ones」 |
| IPA『ユーザのための要件定義ガイド 第2版』(https://www.ipa.go.jp/archive/publish/qv6pgp0000000wrt-att/000079352.pdf ) | **語の一覧は無い**。品詞・構文の類で書く。規約はプロジェクトで決めることを勧める | 「11 形容詞や副詞を使用した場合は、補足説明が必要である [形容詞] 大量のハードディスク容量 →ハードディスク容量≧100GB [副詞] 高速で動作する →入力後1 秒以内に応答がある」「要件定義文章の記述規約をあらかじめ決めておき、周知した上で要件定義書を作成すると、文書のあいまい性を排除するのに効果がある。」 |

**本標準の 11 語と、外部の例示語との対応**(対応づけは私が行ったもので、どの文献もこの対応を述べていない)。

| 本標準の語 | 外部の例示語のうち近いもの |
| --- | --- |
| 必要に応じて | JIS X 0166:2014「必要に応じて」(抜け穴。同じ語)、INCOSE R8 "if necessary" "as required" |
| 可能な限り | INCOSE R8 "so far as is possible" "as much as possible"、JIS「可能ならば」(語は違う) |
| なるべく | INCOSE R8 "where possible" |
| 〜など | INCOSE R9 "etc." "and so on"、NASA "etc."、JIS「〜に限らない」 |
| 適切に | INCOSE R7 "appropriate"、R8 "as appropriate"、NASA "as appropriate" "appropriate" |
| 柔軟に | INCOSE R7 "flexible"、NASA "flexible" |
| 十分に | INCOSE R7 "sufficient" "sufficiently"、NASA "sufficient" |
| 速やかに / 高速に | NASA "fast" "quickly"、ARM "timely"、IPA の例「高速で動作する」 |
| 基本的に / 原則として | INCOSE R7 "usually" "typically"(曖昧な副詞) |

- 本標準の語は、どれも外部の例示語のいずれかの類に入る。逆に、外部の類のうち、本標準のどの一覧にも対応する語が無いものがある(最上級、比較級、主観的な語法「使いやすい」、曖昧な代名詞、否定的表現、不完全な参照)
- 29148・INCOSE・NASA は、文と文脈で例外を認める書き方をする(注記1・注記2、R7 の Exceptions、"such as")。本標準の機械は、部分一致で例外なく落とす(行ごとの `spec-lint-ok` を除く)

**辞書による検出の実測**。

| 文献 | 測ったもの | 逐語 |
| --- | --- | --- |
| Femmer, Méndez Fernández, Wagner, Eder "Rapid quality assurance with Requirements Smells"(JSS 2017。https://arxiv.org/pdf/1611.08847 ) | 29148:2011 の 5.2.7 から作った辞書と品詞解析による検出 | 「the precision is on average around 59%, with an average recall of 82%, but both vary between smells.」「Non-verifiable words, loophole, and ambiguous adverbs and adjectives smells range between 0.70 and 0.81, hence leading to roughly one mistake in four suggestions.」 |
| 同上(再現率の読み方) | **辞書に無い語による見逃しは、再現率の計算から外している** | 「One common cause for false negatives for dictionary-based smells can be that an ambiguous phrase is not part of the dictionary. Since we developed the dictionaries based on existing dictionaries, such as the standard, these dictionaries are not yet complete and must be further developed. However, since this is an issue that is not a problem of the smell detection approach in general, but rather a configuration task, we did not take these findings into consideration for the recall.」 |
| QuARS(同上の SEI 報告。保険会社の文書での試行) | 偽陽性の件数と原因 | 「Of 234 defects, 72 were identified as false positives.」「The first type was the result of a specific business usage of a word that was also found in one of the QuARS lexicons.」 |

- 2 件とも英語の仕様書での測定である。日本語の要求仕様で、曖昧語の辞書の適合率・再現率を測った研究は、見つけられなかった
- 2 件とも、検出結果を人が見て棄却する使い方を前提にしている(Femmer ら:「users can reject findings」)。辞書の検出をそのまま合否にした運用の測定は、読んだ範囲に無い

### 4.2 規格の本文と検査ツールの一致を保つ実務

型は 2 つに分かれる。

| 型 | 先例 | 逐語 |
| --- | --- | --- |
| **本文が正本。機械が使う部分を本文から抜き出して検証する** | IETF RFC 8407(https://www.rfc-editor.org/rfc/rfc8407.txt ) | 「A version of 'rfcstrip' that will extract YANG modules from an I-D or RFC is available.」「All modules need to be validated before submission in an I-D.」「Example modules MUST be validated.」 |
| 同上 | W3C webref と web-platform-tests(https://web-platform-tests.org/writing-tests/idlharness.html 、w3c/webref の README) | 「Web IDL is automatically scraped from specifications and added to the /interfaces/ directory.」「The `main` branch of this repository contains automatically-generated raw extracts from web browser specifications. These extracts come with no guarantee on validity or consistency.」「Curated extracts are generated from raw extracts … by applying manually-maintained patches」 |
| 同上 | Python doctest、Rust の documentation tests | 「To check that a module’s docstrings are up-to-date by verifying that all interactive examples still work as documented.」「rustdoc supports executing your documentation examples as tests. This makes sure that examples within your documentation are up to date and working.」 |
| **構造化データが正本。本文と検査の両方をそこから出す** | NIST OSCAL と SP 800-53 のカタログ(https://pages.nist.gov/OSCAL/about/ ) | 「In many cases they are written in prose documents that are imprecise, lead to differences in interpretation, and are not machine-readable」「We need formats that can be generated by machines for communicating with other machines, but can also be easily reformatted so humans can read the information.」 カタログの実物では、1 つの統制の下に規定文(`statement`)と評価目標・評価方法(`assessment-objective`、`assessment-method`)が並ぶ。ただし評価方法は対象の列挙であり、実行できる検査コードではない |
| 同上 | Kubernetes の API リファレンス(https://kubernetes.io/docs/contribute/generate-ref-docs/kubernetes-api/ 。私が取得し直して確認) | 「The Kubernetes API reference documentation is built from the Kubernetes OpenAPI spec using the kubernetes-sigs/reference-docs generation code.」「If you find bugs in the generated documentation, you need to fix them upstream.」 |
| 検査の定義の中に、人が読む文と条番号を持たせる | Chef InSpec、ComplianceAsCode | InSpec の control は `title`・`desc`・`ref`(「A reference to an external document」)を持つ。ComplianceAsCode は 1 規則 = 1 つの `rule.yml` に説明・根拠・参照と手で確かめる方法を持たせ、機械の検査を同じ規則の下に置く |

- HashiCorp Sentinel・Open Policy Agent・NIST SP 800-204C の読んだ範囲に、「文章で書いた方針」と「コードの方針」が食い違ったときにどちらを正とするかを定めた文は、見つからなかった
- 本標準の既存の作法に当てはめると、`test:criteria`(ADR-0048)は「本文から抜き出す」型、知識ベース(`IY` から `tailoring-kb.json` を生成)は「データから出す」型である。両方の型が、すでに使われている

**検査できる規則と、人が判定する規則の区別。検査していないことの表示**。

| 先例 | 区別の付け方 | 逐語 |
| --- | --- | --- |
| MISRA Compliance:2020(https://misra.org.uk/app/uploads/2021/06/MISRA-Compliance-2020.pdf ) | 規則ごとに decidable / undecidable。指針ごとの検査手段の表を、利用者に作らせる。ツールが検出できる証拠と設定を記録させる | 「A rule is undecidable if an analysis tool cannot guarantee to respond to the compliance question with a "Yes" or a "No" in every situation.」「A guideline enforcement plan (GEP) listing each guideline within The Guidelines shall be produced to indicate how compliance with the guidelines is to be checked.」「A manual review process may be required where a guideline cannot be completely checked by a tool.」「1.4 Evidence proving that the tool is able to detect violations of the guidelines for which it is to check compliance.」 |
| CIS Benchmarks(定義の節と、CIS のブログ) | **すべての推奨事項に Automated / Manual を付ける**。Manual は点数から外すが、報告には出す | 「An assessment status is included for every recommendation.」「Manual — Represents recommendations for which assessment of a technical control cannot be fully automated and requires all or some manual steps to validate that the configured state is set as expected.」「Manual recommendations are equally important to automated.」「“Manual” recommendations will continue to be excluded from the overall score of the report」 |
| XCCDF 1.2(NISTIR 7275 Rev.4) | 検査結果に `notchecked` を持つ。`notselected`(選ばれていない)・`notapplicable`(当てはまらない)と**別の値** | 「The <xccdf:Rule> was not evaluated by the checking engine. This status is designed for <xccdf:Rule> elements that have no <xccdf:check> elements or that correspond to an unsupported checking system.」 点数の分母からは外す:「if the rule-result's result is not a member of the set {notapplicable, notchecked, informational, notselected}, then add 1 to rule_count.」 |

- 3 つとも、「規則はあるが機械は検査しない」を、**規則を消さずに、規則ごとの属性または結果の値として**表示している。本標準の未達と省略の区別(ADR-0028)、実装マークの `undelivered` と同じ向きである
- 3 つとも、値は 2 値より多い。CIS は Automated / Manual、XCCDF は 6 種、MISRA は検査手段を指針ごとに書く。本標準の実装マークは `delivered` / `undelivered` の 2 値である

### 4.3 自己承認の禁止の機械検査

| 製品・規格 | 内容 | 逐語 |
| --- | --- | --- |
| GitHub(SRC-0176。2026-10-12 に取り直して同じ文言を確認) | 作成者の自己承認は、**設定で外せない仕様** | 「Pull request authors cannot approve their own pull requests. You will also not be able to approve a pull request that was raised by GitHub Copilot if it was you who assigned Copilot to the issue to which the pull request relates.」 |
| GitHub(rulesets の説明) | 承認数 0 で PR を記録として使う運用を想定している | 「This setting has no effect if the ruleset requires zero approvals, so repositories that use pull requests as a record of changes rather than to gate on approvals are unaffected.」 |
| GitLab(https://docs.gitlab.com/user/project/merge_requests/approvals/settings/ ) | 既定で有効。外せる設定 | 「Prevent approval by merge request creator: Prevents the author of a merge request from approving it.」「By default, the creator of a merge request (author) cannot approve it.」 |
| Azure DevOps(https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies ) | 投票は止めず、必要数に数えない | 「Otherwise, the creator can still vote Approve on the PR, but their vote doesn't count toward the minimum number of reviewers.」「Select Prohibit the most recent pusher from approving their own changes to enforce segregation of duties.」 |
| NIST SP 800-53B(ベースラインの修整。https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53B.pdf ) | 少人数で職務分離ができないときは、**代わりの統制**と、根拠の記録・リスクの受容 | 脚注 33:「In a small organization, more frequent auditing, targeted role-based training, or stronger personnel screening may be implemented in lieu of separation of duties.」 本文:「Provide a rationale for how compensating controls satisfy security or privacy requirements and why the baseline controls could not be implemented.」「Assess and accept the security and privacy risks associated with implementing compensating controls.」 脚注 34:「Compensating controls are not used to avoid the need to comply with requirements.」 |
| PCAOB 職員見解(2009。小規模公開会社の監査の手引き。https://assets.pcaobus.org/pcaob-dev/docs/default-source/standards/auditing/documents/as5/guidance.pdf ) | 分離できないことを前提に最初から設計した統制を alternative controls と呼び、不備の埋め合わせ(compensating controls)と区別する | 「By their nature, smaller, less complex companies have fewer employees, which limits their opportunities to implement segregation of duties.」「use the term "alternative controls" to apply to situations in which management has designed and implemented controls that achieve the same objectives as segregation of duties.」 |

- 3 製品が機械で止めているのは、**変更(PR)の作成者による承認**である。本標準では、これは X1(作成指示者 × 独立レビュア)と G-6 に当たり、X3(起案者 × 判定者)ではない。要求仕様や設計の承認について「起案者は判定できない」を機械で止める製品の仕様は、今回の調査では見つけていない(探した範囲は上の 3 製品の文書だけである)
- GitHub の Copilot についての文は、「AI に作らせた PR を、割り当てた本人が承認できない」を製品が止める例である。本標準の「作成を指示した者」の考え方と同じ向きである
- SP 800-53B と PCAOB は、少人数で分離できない場合に、分離の要求を外すのではなく、代わりの統制と、その根拠・受容の記録を求める。本標準の代償措置つきの逸脱(`RR` 3.5.2)と同じ型である。PCAOB の用語の区別(最初から設計した代わりの統制と、不備の埋め合わせ)は、本標準の「代償措置」の語に対応する区別を持つかどうかの確認の材料になる

## 5. 選択肢

案ごとに、良くなること、壊れること、変える必要のある記録を書く。推しは書かない。論点の順は Issue の「決めること」に合わせる。

### 5.1 `sep-self-approval` の対象のゲートと判定の単位。1 名体制での扱い

| 案 | 内容 | 良くなること | 壊れること・残る穴 | 変える必要のあるもの |
| --- | --- | --- | --- | --- |
| A1 文脈の単位に限る | 「起案した主体」を、担い手(実行主体の文脈)と定める。起案した担い手は、同じ成果物の判定の確定に関与しない。人の単位の禁止は、表にある組(X1・X2・X4 ほか)だけとする。図 X3 は 3.5.3 の側へ移すか、語を改める | ADR-0054(担い手が起案し、責任者が確定する)と合う。1 名体制でも 3 名以上でも、G-2〜G-4 は抵触しない。ADR-0035 のコンテキスト(P-001)が止めたかった事象を指す | 人が自分で書いた仕様を自分で判定する場合を、禁止の外へ出すことになる。文脈の同一性は、機械で観測する手段が今は無い(1.3)。ADR-0035 決定1「実行主体が人か AI かによって変わりません」を、文脈に限ると読み替えることになる | 新しい ADR(ADR-0035 決定1 の読みの補足または置き換え)、`RR` 3.5 の図、`IY` の `sep-self-approval`(`scope`・`reason`)、PROCESS-PROFILE.md の文(`GP` 2473 行) |
| A2 人の単位で全ゲートに課す | 「起案した主体」を責任者(作成を指示した者)と定め、G-1〜G-4・G-7・G-8 に課す。成果物の A と判定者を別の席にする | ADR-0035 決定1 と `exception: none` を文字どおり守る。判定が自己申告になる構造を、要求と設計にも及ぼす | `RR` 3.3 の RACI、`HB` 5.5.6、`GC` の単独判定(判定者 1 人)、「1つの成果物に責任者は1人」と衝突する。3 名以上でも G-2・G-3・G-4・G-7 の判定者を替える必要がある。1 名体制では G-1〜G-4 がすべて成立しない | RACI、`IY` の `approverRole`、第4章の各ゲートの見出し、ADR-0054 との関係を定める新しい ADR、`TG` 軸A、テンプレートの席と判定記録の様式、1 名体制の表示(未達か逸脱か) |
| A3 対象外と明記する(総称として残す) | X3 は独立の禁止ではなく、X1・X2・X4 の総称であると明記する。G-2・G-3・G-4・G-7 で、成果物の結果責任者が判定者を兼ねることは、**課さないと決めた**と書く。`sep-self-approval` はデータから外すか、検査しない原則として印を付ける | 図・表・データ・機械が揃う。監査人が適合を判定できる。「書かれていない」と「課さないと決めた」が区別できる | ADR-0035 決定1 の普遍の言明(「体制の規模 … によって変わりません」)を、G-6・G-7・G-8 の組に限ることになる。要求の誤りへの歯止めが無いという既知の限界は残る(附属書H のリスクの表、逐語:「仕様の誤り … 歯止めは無い。仕様の正しさを判定できるのは利用者である」) | 新しい ADR、`RR` 3.5 の図と表、`IY`、PROCESS-PROFILE.md の文 |
| A4 禁止ではなく、記録と開示にする | 判定記録に「起案した者(担い手を含む)」の欄を置く。判定者と同一の場合は、禁止せず、保証の開示へ件数で出す。1 名体制では出続ける | 機械で検査できる(欄の有無、名簿への対応づけ、同一性)。1 名体制を宣言できる。未達と逸脱を隠さず表示する ADR-0028 の作法と合う。`RR` 3.8.3「分けて記録します」と同じ型 | 「禁止」ではなくなる。図とデータの「例外なし」を改めることになる。G-2〜G-4 では既定で同一になるため、全件が表示され、情報としての区別がつかないおそれがある。判定記録の欄が増える | 第6章 テンプレ4、`src/data/template-fields.yaml`、テンプレートの様式と `aggregate-evidence.mjs`、附属書H の保証の開示、`RR` 3.5 の図 |
| A5 少人数の扱いだけを足す | 禁止はそのまま(読みは決めない)。1〜2 名体制では、逸脱または未達として表示すると定める | 既存の 3 名未満の扱い(X2・X4)と同じ作法になる | 読みが決まらないので、3 名以上の体制の G-2〜G-4 が抵触するかどうかが残る。機械は、何を逸脱として数えるかを決められない | `RR` 3.5、`IY` の `exception`、`GP` |
| A6 決めない | 現状のまま | 変更が無い | 図は禁止を掲げ、データは「例外なし」と書き、PROCESS-PROFILE.md は全案件に禁止の文を出し、機械は検査しない。監査人は適合も不適合も判定できない(`council-03-qa-audit.md` N10 の指摘) | なし |

- A1 と A3 は両立する(文脈の単位では課し、人の単位では課さないと明記する)。A2 と A4 は両立しない(禁止か、開示か)
- どの案でも、図の「同一ゲートで」・データの `same-work-product`・ADR の「同一の成果物について」の語を 1 つに揃える必要がある

### 5.2 検査していないことを、実装マークで表示するか

| 案 | 内容 | 良くなること | 壊れること・残る穴 | 変える必要のあるもの |
| --- | --- | --- | --- | --- |
| B1 `undelivered` のマークを X3 に付ける | 図 X3 の直後に、新しい番号で `state=undelivered` を置く。`note` に「文は PROCESS-PROFILE.md に出るが、検査は無い」と書く。IMPL-0001 の `note` は、検査している組に絞る | 規約を変えずに済む。前例(IMPL-0042・0043・0086)と同じ書き方。台帳の冒頭に出る | 台帳の定型文「実行層に対応する記述がありません」は、X3 の状態(文はある)と合わない。5.1 で対象と単位が決まらないまま付けると、何が降りれば `delivered` になるかを書けない。IMPL-0001 は採用済みのマークで、`note` を変えると台帳の見出しが変わる | `RR` 3.5、実装台帳(再生成)。降ろし先は登録済みの `config-roles` か `evidence-aggregation` |
| B2 `state` の値を増やす | 「文は降りているが機械は検査しない(人が確かめる)」を表す値を足す。CIS の Manual、XCCDF の `notchecked`、MISRA の検査手段の表に当たる | 「降りていない」と「検査していない」を区別できる。IMPL-0042・0043・0086 の実態も正確に書ける。曖昧語のように「機械が検査している」規定も、同じ台帳で表せる | 規約・検査スクリプト・台帳の様式が変わる。既存 102 件のマークを見直す範囲が生じる。規約は「全条項を対象にしません。維持できない台帳は、それ自体が降りていない規定になります」と書いており、台帳の役割が広がる | `community/implementation-marking.md`、`scripts/check-impl.mjs`、実装台帳、CLAUDE.md の「規定を実行層へ届ける」の節。新しい ADR の要否(規約は ADR ではなく community の文書である) |
| B3 規則データの側に検査の有無を持たせる | `IY` の `separations[]` に、検査の所在(席の検査・出荷の集約・なし)を書く欄を足す。テンプレートが PROCESS-PROFILE.md と D-0 に「機械は検査しない。内部監査で確かめる」と表示する | 表示が案件の実行層まで届く(案件の側で見える)。`roles: null` のような「読み飛ばされる」規則が、データの上で分かる | 実装マークの台帳とは別の系統が 1 つ増える。`separations` 以外の規則(ゲートの基準、様式)には及ばない | `IY` のスキーマ、`scripts/build-template-kb.mjs`、`GP`、テンプレートの様式 |
| B4 表示しない(5.1 の結論で消える場合) | 5.1 で A3(課さないと明記)を採れば、検査しない禁止そのものが無くなる。マークは要らない | 台帳が増えない | 5.1 が A1・A2・A4・A5 の場合は使えない。「データにあって検査されない規則」という型への手当ては残らない(`council-03-qa-audit.md` 5 章 3 の棚卸しの提案) | なし |
| B5 決めない | 現状のまま | 変更が無い | IMPL-0001 が「降りている」と表示し続ける。図 X3 を含む節全体について、台帳は検査されていると読める | なし |

- 5.2 は 5.1 の結論に依存する。5.1 が決まらない場合に取れるのは、B1(暫定の表示)か B5 である
- B2 は、X3 だけでなく、台帳全体の値の定義を変える。今回の Issue の範囲を超えるかどうかも、会議体の判断になる

### 5.3 曖昧語の一覧の正本をどこに置くか。本文と機械の一致を検査するか

論点は 4 つに分かれる(正本の所在、語の集合、一致の検査、機械の結果の扱い)。案は正本の所在で分け、ほかの 3 点は案ごとに書く。

| 案 | 内容 | 良くなること | 壊れること・残る穴 | 変える必要のあるもの |
| --- | --- | --- | --- | --- |
| C1 本文(第4章 G-2)を正本にし、機械は本文から抜き出す | G-2 の一覧を、抽出できる形(表など)で書く。`check-gate-criteria.mjs` と同じ作法で知識ベースへ降ろし、`spec-lint.mjs` は知識ベースを読む。附属書B・附属書E・テンプレ1・テンプレートの文書は再掲をやめて G-2 を指す | ADR-0010 決定1・ADR-0048 と同じ向き。IETF・W3C の型。機械で落ちた仕様の根拠を本文から示せる。5 系統目を既存と同じ作法で作れる | 語の集合を 6 語にするか 10 語にするか(「高速に」を含めるか)を、別に決める必要がある。組織が語を足す経路(本文は「初期値」、機械は「組織で追加してよい」)を、知識ベースの生成と両立させる設計が要る。テンプレートは今「正本はスクリプト」と 4 か所に書いている | `GC` G-2、附属書B・E、第6章 テンプレ1、`IY` 434 行、`scripts/check-gate-criteria.mjs`(または新しい検査)、`scripts/build-template-kb.mjs`、`template/` の `spec-lint.mjs` と 5 つの文書、ADR(ADR-0048 決定3 は「表の外は降りない」と定めており、範囲を広げる記録が要る) |
| C2 構造化データを正本にし、本文と機械の両方を生成する | `src/data/` に語の一覧(語・類・理由・例外・出典)を置き、G-2 の一覧と知識ベースを生成する | OSCAL・Kubernetes の型。語ごとに類と理由を持てる。29148 の 9 つのタイプとの対応を書ける。本文の再掲を生成に置き換えられる | ADR-0010 決定1(判定基準の内容の正本は第4章)と向きが逆になる。同 決定4「データ側の判定基準に閾値・数値・期限を書かない … 組織ごとに変わるため」との関係も問われる(語の一覧は組織ごとに変わりうる)。本文の一部を生成物にする前例は台帳だけで、規範の段落には無い | 新しい ADR(ADR-0010 の一部を置き換える)、`src/data/` の新しいファイル、生成の仕組み、`GC` G-2、テンプレート |
| C3 本文は類を規範にし、語は例示にする。機械の一覧は実行層が持つ | G-2 基準2 を「検証できない語・逃げ道の句・開いた列挙を残さない」のように類で書き、語は「例」と明示する(29148・INCOSE・NASA の型)。機械の一覧は「最低限含む語」と「組織が足す語」に分け、本文の語が機械の一覧に含まれること(本文 ⊆ 機械)を検査する | 外部の 3 文献の書き方と合う。一覧の外の語(「高速に」「迅速に」)で書かれた曖昧な基準を、人の判定(G-2)で差し戻す根拠ができる。機械が本文より広いことを、欠陥ではなく仕様にできる | G-5 基準4「禁止語 0 件」の「禁止語」が何を指すかを定め直す必要がある。類の判定は人が行うので、G-2 の判定者の負荷と、判定のばらつきが増える。機械で落ちた語のうち本文の例に無いものは、根拠が「類」になり、争いが残る。「テンプレートが正本」を一部認めることになり、実装マークの規約の「逆流」の記述と向き合う必要がある | `GC` G-2 と G-5 基準4、附属書B、ADR(一覧の性格を決める記録)、対応表または新しい検査、テンプレートの文書 |
| C4 正本は本文のまま、対応表で両方向の一致を検査する | `src/data/template-fields.yaml` と同じ作法で、本文の語と機械の語の対応を登録し、両方向の実在を確かめる。機械だけが持つ語は、`omit` に当たる登録で理由を書く | 既存の検査(`test:fields`、ADR-0040)の拡張で済む。機械だけが持つ 4 語に、理由の記録を強制できる | 一覧は手で 2 か所以上に書いたままになる。附属書B・E、テンプレ1、テンプレートの 5 つの文書の再掲は、対応表に載せない限り検査されない。ADR-0040 は様式の決定で、検査スクリプトの語に及ぶかは決まっていない(3.4) | `src/data/` の対応表、`scripts/check-template-fields.mjs` または新しい検査、ADR(ADR-0040 の適用範囲の補足) |
| C5 機械の検出を合否から外す(警告にする) | `spec-lint` の結果を G-5 の失敗にせず、G-2 の判定者への材料にする。一覧の所在は C1〜C4 のどれかと組み合わせる | 部分一致の誤検出(「不適切に」)、スコープ外や実装計画の「など」による失敗が、作業を止めなくなる。辞書の検出は人が棄却する前提、という実測の使い方(Femmer ら、QuARS)と合う | `GC` G-5 基準4「禁止語 0 件」を改めることになる。G-5 の原則「合意済みルールはすべて機械化して載せる」と逆の向き。警告は読まれなくなるおそれがある(本標準にこの点の実測は無い) | `GC` G-5 基準4 と「検査対象が存在しない場合の扱い」の表、`ci-gates.md`、テンプレートの `gate-g5.yml`、`test-init-g5.mjs` の fixture(「落ちる」を確かめている) |
| C6 決めない | 現状のまま | 変更が無い | 2 つの「正本」が並ぶ。機械は本文に無い 4 語で落とし、附属書B の語を通す。次に語を足すとき、どこを直せばよいかが決まらない | なし |

語の集合について、どの案でも決める必要のあること。

| 決めること | 現状 | 選べる向き |
| --- | --- | --- |
| 本文の語を機械に合わせて増やすか、機械を本文に合わせて減らすか | 本文 6、機械 10 | 増やす(前回の `council-03` N9 の提案)、減らす、どちらも変えずに「機械は広くてよい」と定める(C3) |
| 「高速に」(附属書B)を一覧に入れるか | 本文にも機械にも無い | 入れる、附属書B から落とす、例示のままにする(C3) |
| 検査の範囲 | 本文は「受入基準に使用不可」、機械は機能仕様の置き場のファイル全体 | 機械を受入基準の節に絞る、本文を機械に合わせる |
| 一致の方式 | 部分一致(「不適切に」を拾い、「適切な」を通す) | 現状のまま、語の境界を見る、形態素で見る(日本語での精度の実測は見つかっていない) |
| 除外の印 `spec-lint-ok` | スクリプトにだけある。条項なし | 本文に条件を書く、廃止する、判定記録へ件数を出す |
| 組織が語を足す手続 | 本文「初期値」、機械のコメント「組織で追加してよい」。手続なし | 構成(`process.config.json`)に足す欄を置く、変化点の手続に載せる、定めない |
| 根拠水準マーク | 一覧に付いていない | ADR-0026 のマークを付ける(語の選定に実証が無いことの開示)、付けない |

## 6. 会議体への問い

1. **「起案した主体」は誰か**。責任者(作成を指示した人)か、担い手(実行主体の文脈)か。ADR-0035 決定1 は「体制の規模、自律の水準、実行主体が人か AI かによって変わりません」と書き、ADR-0054 は「担い手が起案し、責任者が確定する」と定めた。2 つを両立させる読みは 1 つに決まるか。決まらないなら、どちらを新しい ADR で置き換えるか
2. **G-2・G-3・G-4・G-7 で、成果物の結果責任者が判定者を兼ねる既定は、禁止の例外か、対象外か、標準の欠陥か**。RACI と単独判定(「1つの成果物に責任者は1人」)は、承認の滞留を防ぐための設計である。要求と設計の判定に、別の人の目を課さないと決めるなら、その旨と、残るリスク(仕様の誤りに歯止めが無い)をどこに書くか
3. **1 名体制で、「例外なし」の禁止を掲げ続けてよいか**。3 名未満でも禁止すれば 1 名体制を宣言できなくなる、という理由で、X4 は逸脱の表示にした(ADR-0056 決定5)。X3 に同じ理由が当てはまるか。当てはまるなら、表示するのは逸脱か、未達か、何も表示しない(対象外)か
4. **「文は降りているが、検査は無い」を、`delivered` / `undelivered` の 2 値で表せるか**。前例(IMPL-0042・0043・0086)は `undelivered` で書いた。台帳の定型文は「実行層に対応する記述がありません」である。値を増やすなら、既存 102 件の見直しを誰が・いつ行うか
5. **曖昧語の禁止で規範なのは、語の一覧か、類か**。29148・INCOSE・NASA は類を規則にし、語を例示にする。本標準は語の一覧を「禁止リスト」と呼び、機械は一覧の語だけを落とす。一覧に無い語(「高速に」「迅速に」)で書かれた受入基準は、G-2 で差し戻せるか。差し戻せるなら、根拠の条項は何か
6. **機械が本文より広く落とすことを、認めるか**。認めないなら、4 語を本文へ上げるか、機械から落とすか。認めるなら、機械で落ちた仕様の根拠をどこに書くか。テンプレートが「正本はスクリプト」と書く現状は、実装マークの規約が「検出の手段がない」とした逆流に当たるか
7. **辞書の検出を、そのまま G-5 の合否にしてよいか**。実測は適合率が平均約 59%(英語、辞書と品詞解析)で、検出結果を人が棄却する使い方が前提だった。本標準の機械は部分一致で、誤検出(「不適切に」)と、条項の無い除外の印を持つ。合否に残すなら、誤検出の扱いをどこに定めるか

## 7. 確認できなかったこと

**標準の内部**。

- ADR-0035 決定1 の「主体」を、起案の時点でどちらの意味で書いたか。コミットの本文と ADR のコンテキストは P-001 のセッションの事象を挙げるが、決定1 の文は単位を限定していない。起案時の意図を記した記録は見つからなかった
- `aggregate-evidence.mjs`(約 4,000 行)の全行は読んでいない。「判定者」「起案」「selfApproval」で検索した範囲で、G-1〜G-4 の起案者と判定者を突き合わせる処理が無いことを確かめた
- 本リポジトリの外に置かれた回帰スイート(メモリにある tpl2 の suite、r3 の scen)が、1 名体制の逸脱の件数や `separations` の内容を固定しているかは、確かめていない。`template/scripts/gate/` の試験に `sep-` の参照が無いことだけを確かめた
- `spec-lint.mjs` の 10 語のうち、本文に無い 4 語を足した理由。テンプレートの初版のコミットから入っており、理由の記録は見つからなかった
- 「高速に」「なるべく」を附属書B に入れた理由。コミット `4b5779b` の本文までは確かめていない
- 語の一覧を使った検査で、実際の案件(P-001 など)で何件が落ち、うち何件が誤検出だったか。記録は探していない
- 実装マークの台帳の、ほかの `delivered` 90 件のうち、「キーまたはファイルは実在するが、規定の中身は検査されていない」ものが何件あるか。IMPL-0001 以外は確かめていない

**外部の文献**(読めなかったもの。詳しい状況は `tmp/302-310/survey-308-external.md` の末尾の表)。

- ISO/IEC/IEEE 29148:2018 の 5.2.7 の本文。ISO OBP は HTTP 403、3 つの公開プレビューは箇条 3 までだった。2011 年版(JIS X 0166:2014)との差は、見出しが "Requirements language criteria" から "Requirement language criteria" に変わったことしか確かめられていない。2018 年版でも「避けなければならない」が要求のままか、5.2.7 が適合性の対象かは**確認できなかった**
- JIS X 0166:2021 の 5.2.7(日本語の例示語が 2014 年版から変わったか)
- ISO/IEC/IEEE 29148:2011 の英語の原文(JIS の翻訳と、Femmer らの部分引用で代えた)。JIS の注記1・注記2 が ISO の原文にあるか、JIS で足されたかは判別できなかった
- INCOSE Guide to Writing Requirements V4(2023)と Summary Sheet。R7〜R10 が V4 でも同じ番号・文言かは未確認
- EARS の原論文(Mavin ら 2009)の本文。抄録だけを読んだ
- NASA ARM の ICSE 1997 の論文の本文。同じ筆頭著者の同年の別論文(全文)と、再実装論文の抄録で代えた。初版で利用者が語を編集できたかは未確認
- Rosadini ら(REFSQ 2017)、Ferrari ら(EMSE 2018)の鉄道信号での検出の研究。数字は 1 つも確認していない
- Krisch と Houdek の弱い語の検出(適合率 12%)。Femmer らの紹介文で読んだだけで、原典は読んでいない。本文では数字を使っていない
- IPA『機能要件の合意形成ガイド』『非機能要求グレード』に、曖昧語の一覧があるかどうか
- 日本語の要求仕様で、曖昧語の辞書の適合率・再現率を測った研究
- ISO/IEC 27001:2022 附属書 A 5.3、ISO/IEC 27002:2022 5.3 の原典。二次的な解説しか読めなかったので、本文では引いていない
- PCAOB AS 2201 の本文、SEC Release 33-8810、COSO の小規模公開企業向けガイダンス
- MISRA C の本体と、静的解析ツール各社の対応表。MISRA Compliance:2020 だけを読んだ
- GitHub で、1 名のリポジトリに必須の承認を掛けたときの挙動。Docs に名指しの記述は無く、実機でも確かめていない
- 要求仕様・設計の承認について、起案者による承認を機械で止める製品(要求管理ツールなど)の仕様。調べたのは GitHub・GitLab・Azure DevOps の PR の承認だけである
- 文章の方針とコードの方針が食い違ったときの扱いを定めた文献。Sentinel・OPA・SP 800-204C の読んだ範囲には無かった

## 8. 実行したスクリプトと作業物

リポジトリの状態を変える実行はしていない。標準本文・`template/`・ほかの research のファイルは編集していない。

| ファイル | 内容 |
| --- | --- |
| `tmp/302-310/s308i-run1.mjs` | `template/scripts/init/generate-profile.mjs` の `buildConfig`・`seatSeparationFindings`・`renderProcessRules`・`renderRoleCard`・`renderProfileMd` を、1〜2 名(全席が同一人物)と 3〜9 名の 2 つの構成で呼ぶ(1.3) |
| `tmp/302-310/s308i-gates.mjs` | 知識ベース(`template/scripts/vendor/tailoring-kb.json`)のゲートと `separations` を一覧にする(1.4) |
| `tmp/302-310/s308i-lint/` | `spec-lint.mjs` と `config.mjs` の複製と、試験用の機能仕様。引数なしで実行した(3.3) |
| `tmp/302-310/survey-308-external.md` | 外部文献の項目ごとの逐語と、読めなかった文献の一覧(サブエージェントの出力) |
| `tmp/302-310/dl308/` | 取得した原典(`.raw` が原本、`.txt` が本文化したもの) |
| `tmp/302-310/s308i-part1.md`〜`s308i-part3.md` | 本書の下書きの部品 |
