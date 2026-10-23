# 反映の記録(Issue #296 固定定数の棚卸し(#295)の後継。裁定 L-1〜L-11)

- 日付: 2026-10-23
- 正とした文書: `research/296-deliberation/decision.md`(L-1〜L-11)
- 迷ったときに引いた材料: `council-01-drafter.md`(文の案)、`survey-296-1-internal.md`・`survey-296-2-external.md`(事実)
- 様式の手本: `research/294-deliberation/implementation.md`、`src/content/docs/adr/0078-*.md`
- 再審議はしていない。裁定と食い違えた点は 4 章にまとめた

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号は ADR-0079、EV-0143〜EV-0148、IMPL-0259〜IMPL-0278 です。**次に使える番号は ADR-0080、EV-0149、IMPL-0279** です。使う前に、既存の最大を自分で確かめてください。

IMPL-0279 は、作業の途中で一度 tailoring-guide に付け、IMPL-0278 の欠番を埋めるため 0278 へ付け替えました。公開した版はありません。

### 0.2 マージの前提(利用者へ伝えること)

`template/` のサブモジュールは、pit-in-template の作業ブランチ `claude/process-compass-296` の上のコミットを指します。#291〜#296 の積み重ねで、template の main には入っていません。**本リポジトリの変更を main へ入れる前に、テンプレート側を main へマージし、サブモジュールの指す先を template の main の上のコミットにしてください**。

### 0.3 利用者の了承が要るもの

- テンプレートの `CLAUDE.md` の「自己修正ループ」の節を改めた(停止条件を「連続失敗の上限と無進捗」に、保留の解除を名簿の人の名義に)。テンプレートの利用者が受け取る指示ファイルのため、テンプレート側の PR で変更点を明示して了承を得る
- テンプレートの `process.config.json` に `task.selfHealNoProgressLimit` を足した(無ければ 2 回で読む)。`ci.coverageScope` はテンプレートの `process.config.json` には足しておらず、`generate-profile.mjs` が新しく生成する構成に書く。構成に無い既存の採用者は、従来どおり全体で測る(突合の後の修正。X-4。当初この行は「`ci.coverageScope` を足した」「アダプタの既定で読む」と誤って書いていた)

### 0.4 別 Issue として起票すること(裁定 6 章)

1. 能力依存の定数を遮断に使う扱いの不揃い(200 行の上限は遮断し、PR の規模は遮断しない)と、ADR-0065 の代償措置の妥当性
2. 採用者から規模のデータを受け取る経路と、チームの数を境界の軸にする案
3. 委任の `basis.detection` が所在の文字列だけで通る件
4. 5.4.6 の第 2 区分が小さいチームで発火しない件の表示と、`start` を呼ばない自己修正の検知(IMPL-0272 の注記に「検知しない(別 Issue)」と書いた)

記録のみ: #295 の独立検証の記録と棚卸しの全表は、リポジトリにありません。この変更でも補っていません。

あわせて、#294 の申し送り(出荷の証跡の保管の設計)へ次の 2 点を足すことを勧めます。この変更では Issue に書き込んでいません。

- `ship-evidence` が coverage の結果を取り込まない件(IMPL-0246 は undelivered のまま)
- IMPL-0263(承認の失効)を実機の gh で確かめる件

## 1. 裁定ごとの記録

### L-1 カバレッジの範囲

標準(`gate-criteria.md`)では次の点を改めました。

- G-5 の表の基準3 の行と、`### 基準3` の小節を書き直した
  - 範囲の選択(ADR-0078 決定6)は保った。既定は「変更で加えた・変えたコード」とした
  - 全体で判定する場合は、変更の未被覆が全体の被覆で薄まる旨を保証の開示に記録する
  - 結果に範囲・分母・測っていない製品のファイルの数を出す
  - 記録した範囲と構成の範囲の一致を、契約検査で確かめる
- 80%・90% に EV-0143(E0、見直し 2027-10)を付けた。90% は例示として書いている
- 「新規に変更した範囲へ限定する」節は、基準3 を除く定量条件に限ると見出しへ併記した(`(適用: G-5 基準3 以外の定量条件)`)。L1603・L1615-1617 の食い違いは、これで基準3 の記録した範囲に従う
- (突合の後の注記)当初、上位の「AI 品質指標の扱い」の適用範囲は見出しへ移していなかった(X-1)。6 章で直した
- **ratchet(下限を下げない仕組み)は課さない**と明記した

実装マークは次のとおりです。

| マーク | 降ろし先 | 状態 | 内容 |
| --- | --- | --- | --- |
| IMPL-0245 | coverage-check | undelivered → delivered | 変更の範囲の測定 |
| IMPL-0246 | — | undelivered(更新) | ship-evidence が結果を取り込まない |
| IMPL-0259 | coverage-check | undelivered | node 以外のアダプタ |
| IMPL-0260 | coverage-check | delivered | 薄まりの開示・分母・未測定の数 |
| IMPL-0261 | gate-contract | delivered | 企画書の記録と構成の一致 |
| IMPL-0262 | project-brief-template | delivered | 企画書の行と G-1 の検査 |

テンプレートでは次の変更を入れました。

- `coverage-check.mjs` を書き直した。node のアダプタの `coverageDetail` で、行単位の被覆を `git diff --base` の追加・変更行に限って数える
- `ci.coverageScope` を構成に足した。node の既定は `changed`
- `gate-g5.yml` を `fetch-depth: 0` と `--base` に改めた
- `verify-gate-contract.mjs` が、企画書の「カバレッジの測る範囲(G-5 基準3)」の行と構成を比べる
- 企画書の様式(`templates/` と `profiles/{internal,oss,revenue}/templates/`)に行を足した。`check-g1.mjs` が必須の行として確かめる
- `test-coverage-scope.mjs` を新設した(23 件)

### L-2 承認の失効

標準(`gate-criteria.md`)の G-6 では次の点を改めました。

- 箇条書きに次の文を置いた。4 条件の数は変えていない
  > 承認は承認した差分に対して数える。差分を変える更新の後は数えない。同一と機械で確かめられない更新は、差分を変える更新として扱う
- **申告による持ち越しの緩和は課さない**と明記した
- アカウント名の確認済みの上書き(L-9)、語彙を AI 名の形に限らないこと(L-9)、`nameConfirmed` の手続き、追跡中のパスの規則(L-9)を同じ G-6 の箇条に置いた

実装マークは次のとおりです。

| マーク | 降ろし先 | 状態 | 確かめ方 |
| --- | --- | --- | --- |
| IMPL-0263 | evidence-aggregation | delivered | manual(実機の gh を確かめていない) |
| IMPL-0264 | gate-contract | delivered | machine |
| IMPL-0265 | adoption-trial | delivered | manual |

関連ページの直しは次のとおりです。

- `pr-workflow.md` L196 と `git-strategy.md` L84 を、承認の失効の文に揃えた
- 要件⑦の 2 つの一覧(`adoption-guide.md` と `template-repository.md`)を揃えた

テンプレートでは次の変更を入れました。

- `config.mjs` の `approvalBinding` を変えた
- `aggregate-evidence.mjs` が `headRefOid` とレビューの commit を比べる。承認の後に更新された承認と、版を確かめられない承認を数えず、件数を開示する
- `verify-gate-contract.mjs` と `delegation.mjs` が、適用するすべてのルールセットで `dismiss_stale_reviews_on_push` を確かめる
- `adoption-trial.mjs` の env-check が `dismiss_stale_reviews_on_push` と `require_last_push_approval` を確かめる
- 試験は `test-roster-rules.mjs`(82 件)と `test-init-g5.mjs`(110 件)に置いた

### L-3 自己修正の停止

標準では次の点を改めました。

- 第3章 3.12.10(`roles-responsibilities.md`)を正本に据えた
  - 段落で、準拠テンプレートとの対応と E.7 からの参照を明示した
  - 要求事項ごとに IMPL-0272〜0277 を付けた
  - **総数の上限(連続失敗の上限)の廃止は課さない**と明記した。費用の歯止めとして保つ
  - 記録の置き場(追跡する置き場)と、人による解除を箇条に置いた
- 附属書E E.7(`developer-guide.md`)を、3.12.10 を引く手引きへ書き直した
  - 経験則の文(「3 回」の根拠を経験に置く文)を外した
  - 7.7.2 への誤った参照を直した(L-11 の 2)
- 附属書H(`assurance-case.md`)の「AI どうしの往復」の参照を 3.12.10 へ改めた
- RC-05 の名称を「自己修正の停止条件の初期値(連続失敗3回・無進捗2回。第3章 3.12.10)」へ改め、configKey を 2 つにした
- 廃語に「自己修復の反復上限」を登録した(ADR-0079)

テンプレートでは次の変更を入れました。

- `self-heal.mjs` を書き直した
  - `iterate` がテストを自ら実行して結果を判定する。担い手の申告は使わない
  - 失敗したテストの識別を記録する(node --test・pytest・go test・jest の出力から読む)
  - 同じ集合が `task.selfHealNoProgressLimit`(既定 2)続いたら保留にする
  - 反復が `task.selfHealMaxIterations`(既定 3)に達したら保留にする
  - 保留・解除・解除の拒否を `docs/self-heal-log.tsv`(追跡する置き場)へ残す
  - `release` は名簿の人の名義に限り、AI の名義と名簿外の名義を拒否する
- 構成と変更の手続きを改めた
  - `generate-profile.mjs`・`process.config.json`・`next.mjs` に `selfHealNoProgressLimit` を足した
  - `/process-change` の種別 settings で値を変える。上げる向きは緩める向きとして記名を要する
- 指示文を改めた: `implement/SKILL.md`、`CLAUDE.md`、`aggregate-evidence.mjs` の記録の置き場
- `test-self-heal.mjs` を新設した(27 件)

### L-4 手戻り率

標準では次の点を改めました。

- 第4章の量を「AI 生成行の短期書き換え率」と改め、合否条件にしてはならないとした
  - 「AI 品質指標の扱い」の合否の表を直した
  - 適用範囲を見出しへ移した(L-11 の 1)。**この記載は当初の事実と異なっていた**。当初移したのは下位の節だけで、上位の節は突合の後に移した(6 章、X-1)
  - EV-0144(E0)を付けた
- 第4章の「閾値の設定と較正」の要求事項3 に、観測の窓と窓の中の最小標本数を置いた。EV-0145(14 日・30 件・四半期、E0)と IMPL-0268(evidence-aggregation、undelivered)を付けた
- 5.4.6(`human-ai-boundary.md`)を改めた
  - 手戻り率は運用メトリクスの手戻り率(タスクの単位)と名指しした
  - 「AI 生成行の短期書き換え率を指さない」と書いた
  - 要求事項3 の「または」を、窓と最小標本の規則に置き換えた(L-11 の 9)
- 運用メトリクス(`metrics.md`)の手戻り率の行を定義し直した。タスクの単位とし、差し戻し率を含めない
- 三識の「短期の手戻り率」の参照を直した(L-11 の 5)
- 廃語に「AI起因の手戻り率」と「短期の手戻り率」を登録した(ADR-0079)
- 手戻り率の名の全出現を確かめた(4 章の 4.3)

### L-5 内部監査の抽出

標準(`process-audit.md`)に `### 2段の抽出` を新設しました。

- 案件 → 案件の中の変更の 2 段で抽出し、段ごとに母集団・方法・件数・結果・再現の手段を記録する
- 「少ない」を母集団 5 件未満と定義した。この場合は全数とする
- **比例(母集団に比例した抽出数)は課さない**と明記した
- 委任の事後監査の「5 件」は変更の件数だと書き分けた。`tailoring-guide.md` の側も「変更」へ揃えた
- EV-0010 の対象の文を更新した
- RC-11 を「監査の周期と抽出数」へ改めた

### L-6 10 名の境界

標準(`tailoring-guide.md`)では次の点を改めました。

- 10 名の境界と 10 名以上の列の規則に EV-0148(E0。Scrum Guide の 10 名以下を参照)を付けた
- 人数は D-0 の表5 の人で数え、AI の担い手と外部の確認者を数えないと書いた
- 次の 2 点は**課さない**と明記した
  - 組織が境界を定める形
  - 能力依存の定数の登録簿への掲載
- IMPL-0278(profile-generator、undelivered)を付けた。テンプレートは人数を設問の回答で受け、名簿から数えない
- ADR-0044 へのリンクを直した

### L-7 登録簿の運用と食い違い

標準では次の点を改めました。

- `metrics.md`: 登録簿の運用は採用組織の記録とし、標準の値は EV の見直し日で扱うと書いた。**起草者による再評価は課さない**と明記した
- 5.4.6 の「差し戻し率 0% が 2 か月」を RC-12(能力に依らない)として登録し、EV-0146 を付けた。あわせて 5.4.5 の 3 か月に EV-0147 を付けた(RC-09。4 章の 4.4)
- 要求事項4 の「能力に依らない」周期・窓を RC-09〜RC-12 とした
- G-5 基準6 の行数の上限に、未達の段落と IMPL-0269(gate-g5-workflow、undelivered)を置いた(L-11 の 6)
- `context-base.md` L98 に、IMPL-0222・0269 が未達である旨を書いた

テンプレートでは次の変更を入れました。

- `recalibration-registry.json` に RC-12 を足し、RC-05・RC-11 を改めた
- `docs/calibration-register.md` と `test-recalibration.mjs`(14 件)を更新した

### L-8 規模の観測と算定

標準(`gate-criteria.md` のタスクの分割基準)では次の点を改めました。

- 要求事項の行 7・9・10、観測の箇条、限界の開示を改めた(L-11 の 7)
- 5 倍は据え置いた
- 次の 2 点は**課さない**と明記した
  - ファイル数だけの超過の軽減
  - `/pit` の注記
- IMPL-0270(size-observation、delivered)と IMPL-0271(pr-checks、delivered)を付けた

テンプレートでは次の変更を入れました。

- `size-observation.mjs` を新設した
  - 超過の理由の内訳(行・ファイル・別集計・ファイル数だけ・理由不明)を出す
  - 別集計の倍率の分布(1 倍・2 倍・5 倍超)を出す
  - 前回との比較は出さない
- `aggregate-evidence.mjs` から呼ぶようにした
- `check-pr.mjs` の算定を改めた
  - 文書の置き場では、文書・データの拡張子(`DOC_DATA_EXTENSIONS`)以外を製品として数える
  - 拡張子なしのファイルは、変更後の先頭の行が `#!` なら製品として数える
  - 超過の理由と倍率(`overReasons`・`testRatio`)を出す
- 試験は次のとおり
  - `test-size-observation.mjs` を新設した(9 件。決定性・前回比が無いことを確かめる)
  - `test-check-pr.mjs` に文書の置き場の 4 件を足した(全 115 件)

### L-9 名義・追跡パス・登録簿の検査

アカウント名の確認済みの上書きを置きました(IMPL-0266、config-change-log、delivered、machine)。

- 効くのは、本人以外が記名した名簿の変更(`changeLog` の `accountConfirmations` と `decidedBy`)がある場合だけにした
- 本人・AI の名義の記名と、記録の無い確認は、契約検査が落とす
- `[bot]` とホスティングの bot は上書きしない
- 集約が、上書きで数えた承認の件数を出す

`riskFloor`・`protectedPaths` のパスが追跡中のファイルに当たらなければ、未宣言として扱います(IMPL-0267、pr-checks、delivered)。

- `config.mjs` に `trackedFiles`・`unmatchedCoreText` を足し、`corePathsOf`・`touchesCore` に `tracked` を渡せるようにした
- `check-pr.mjs`・`aggregate-evidence.mjs`・`next.mjs`・`generate-profile.mjs` が、当たらないパスを開示する
- `test-check-pr.mjs` に `src/authz/**` の場合を足した

登録簿の整合検査(本リポジトリ)を改めました。

- `scripts/check-recalibration-registry.mjs` を、純関数 `checkRegistry` を持つ形に改めた
- 要求事項4 の ID と `capabilityDependent: false`・`noRelaxByCapability: true` を照合する
- `configKey` が template の `process.config.json` に実在するかを確かめる
- 変異試験 `scripts/test-check-recalibration-registry.mjs`(15 件)を新設し、`npm run test:registry` として `check` に組み込んだ

その他の扱いは次のとおりです。

- `sizeObservation` の試験は決定性だけを足した(L-8 の試験)。**前回比は課さない**
- **語彙を AI 名の形に限る案は採らない**と G-6 に書いた

### L-10 運用メトリクスの区分

標準(`metrics.md`)では次の点を改めました。

- 本章の表は候補の一覧であり、正式指標は採用組織が手続1〜4 を経て採ったもので、上限 20 はそれに掛かると定義した
- L69・L303 の誤りを直した
- 完了スループットの対の指標を滞留期間と書いた
- **バックログの純増は課さない**と、理由とともに書いた
- 第4章の「ゲートの健全性」の表を、運用メトリクスを参照する形にした

### L-11 範囲の外

本 Issue で直す 9 件は、上の各裁定の中で直しました。対応は次のとおりです。

| 項目 | 直した場所 |
| --- | --- |
| 1 | L-4 |
| 2 | L-3 |
| 3・4 | L-2 |
| 5 | L-4 |
| 6 | L-7 |
| 7 | L-8 |
| 8 | L-3 |
| 9 | L-4 |

別 Issue の 4 件と記録のみの 1 件は 0.4 に置きました。

### ADR-0079

`src/content/docs/adr/0079-coverage-scope-approval-binding-self-heal.md` を新設しました。

- ADR-0078 決定6 を補足する。置き換えではない
- 決定1〜7、「課さないと決めたこと」の表、検討した選択肢、既存の決定との関係を書いた

## 2. 使った番号

| 種類 | 番号 | 所在 |
| --- | --- | --- |
| ADR | 0079 | adr/0079-*.md |
| EV | 0143 | 第4章 基準3 の 80%・90% |
| EV | 0144 | 第4章 AI 生成行の短期書き換え率 |
| EV | 0145 | 第4章 要求事項3 の窓と最小標本(14 日・30 件・四半期) |
| EV | 0146 | 5.4.6 差し戻し率 0% が 2 か月(RC-12) |
| EV | 0147 | 5.4.5 の 3 か月(RC-09) |
| EV | 0148 | テーラリング 10 名の境界 |
| IMPL | 0259〜0262 | 第4章 基準3(L-1) |
| IMPL | 0263〜0267 | 第4章 G-6(L-2・L-9) |
| IMPL | 0268 | 第4章 閾値の設定と較正 要求事項3(L-4) |
| IMPL | 0269 | 第4章 G-5 基準6(L-7) |
| IMPL | 0270・0271 | 第4章 タスクの分割基準(L-8) |
| IMPL | 0272〜0277 | 第3章 3.12.10(L-3) |
| IMPL | 0278 | テーラリング 軸A の人数(L-6) |
| impl target | self-heal・size-observation・g1-check | `src/data/impl-targets.yaml` に新設 |
| RC | RC-12 | 登録簿に新設 |

## 3. 変えたファイル

### 3.1 本リポジトリ

- 標準:
  - `phase4-process-design/` の `gate-criteria.md`、`roles-responsibilities.md`、`developer-guide.md`、`assurance-case.md`、`human-ai-boundary.md`、`tailoring-guide.md`、`adoption-guide.md`
  - `phase5-implementation/` の `ci-gates.md`、`context-base.md`、`git-strategy.md`、`pr-workflow.md`、`template-repository.md`
  - `phase6-operation/` の `metrics.md`、`process-audit.md`
- ADR: `adr/0079-coverage-scope-approval-binding-self-heal.md`(新設)
- 台帳(自動生成): `community/evidence-ledger.md`、`implementation-ledger.md`、`scope-ledger.md`
- データ:
  - `src/data/impl-inventory.yaml`(変えた 34 節を `issue: 296` で再分類し、「2段の抽出」を足した。pending は無い)
  - `src/data/impl-targets.yaml`
  - `src/data/provision-forms.yaml`(廃語 3 件)
- 検査: `scripts/check-recalibration-registry.mjs`、`scripts/test-check-recalibration-registry.mjs`(新設)、`package.json`(`test:registry`)
- サブモジュール `template` の指す先

### 3.2 テンプレート(pit-in-template)

- 検査のスクリプト(`scripts/gate/`):
  - 改めたもの: `coverage-check.mjs`、`check-pr.mjs`、`check-g1.mjs`、`config.mjs`、`aggregate-evidence.mjs`、`delegation.mjs`、`adoption-trial.mjs`、`self-heal.mjs`、`next.mjs`、`verify-gate-contract.mjs`、`recalibration-registry.json`
  - 新設したもの: `size-observation.mjs`
- 試験(`scripts/gate/`):
  - 新設したもの: `test-coverage-scope.mjs`、`test-self-heal.mjs`、`test-size-observation.mjs`
  - 改めたもの: `test-check-pr.mjs`、`test-init-g5.mjs`、`test-roster-rules.mjs`、`test-recalibration.mjs`
- 生成: `scripts/init/generate-profile.mjs`、`scripts/vendor/tailoring-kb.json`(`npm run template:kb` で再生成)
- 構成・アダプタ: `process.config.json`、`adapters/node.json`
- ワークフロー: `.github/workflows/gate-g5.yml`(fetch-depth 0、`--base`、新しい試験 3 本)
- 様式:
  - 企画書: `templates/06-project-brief.md`、`profiles/{internal,oss,revenue}/templates/06-project-brief.md`
  - D-0: `templates/00-d0-governance.md`
- 指示文と記録:
  - `CLAUDE.md`
  - `.claude/skills/implement/SKILL.md`
  - `.claude/skills/process-change/kinds/accountable.md`、`.claude/skills/process-change/reference/input.md`
  - `docs/calibration-register.md`

## 4. 確かめたこと・確かめられなかったこと

### 4.1 確かめたこと

`npm run check` は終了コード 0 で通りました。lint・textlint・refs・sources・impl・evidence・scope・template-fields・registry とその変異試験・KB の乖離・build と内部リンクを含みます。

テンプレートの試験はすべて通りました。

| 試験 | 件数 |
| --- | --- |
| verify-gate-contract | — |
| test-check-delegation | 39 |
| test-check-pr | 115 |
| test-recalibration | 14 |
| test-roster-rules | 82 |
| check-decisions | — |
| test-decisions | 22 |
| test-g5-aggregate | 23 |
| test-plan-trace | 30 |
| test-init-g5 | 110 |
| test-coverage-scope | 23 |
| test-self-heal | 27 |
| test-size-observation | 9 |
| check-process-rules | — |

ほかに次の点を確かめました。

- actionlint を通した(gate-g5.yml)
- `aggregate-evidence.mjs` を手元で実行し、落ちないことを確かめた
- `check-gate-criteria` は一致した(`--write` は要らなかった)

### 4.2 確かめられなかったこと

- IMPL-0263: gh が返すレビューの `commit.oid` を実機で確かめていない(check=manual)。集約の `lastReviewStates` の端から端までの試験も無い。判定の関数(`approvalBinding`)だけを試験している
- IMPL-0265: env-check の `dismiss_stale_reviews_on_push` と `require_last_push_approval` の読み取りを実環境で動かしていない
- IMPL-0246: `ship-evidence` は coverage の結果を取り込まない(undelivered のまま)
- node 以外のアダプタでの変更の範囲の測定(IMPL-0259、undelivered)。範囲を変更にした構成は契約検査が失敗させる
- 累積消費(IMPL-0277)、窓と最小標本(IMPL-0268)、基準6(IMPL-0269)、人数の数え方(IMPL-0278)は、テンプレートに降りていない

### 4.3 突合(裁定 7 章)

- ADR-0026・0044・0058・0063・0065・0067・0073・0074・0076 決定7・0078 決定6 と読み合わせた。ADR-0079 は ADR-0078 決定6 を補足し、範囲の選択そのものを保つ。採用済み ADR の本文は書き換えていない
- 3.12.10・E.7・附属書H・RC-05 は、3.12.10 を正本として揃えた
- G-6 の新しい文は 4 条件の数を変えていない。第3章と ADR-0067 の「4条件」の参照はそのまま成り立つ
- 手戻り率の名の全出現を確かめた
  - 本文の残りは運用メトリクスの手戻り率(タスクの単位)を指す
  - テンプレートの `reworkRate`(5.4.6 の検知条件。README・config.mjs・D-0・process-change)も同じ指標を指すため、そのまま残した
  - 「AI起因の手戻り率」「短期の手戻り率」は廃語の検査が止める
- 実装マーク・EV・適用範囲の注記を確かめた
  - `npm run impl:write`・`evidence:write`・`scope:write` で台帳を再生成し、`check` が通った
  - `impl-inventory.yaml` の変えた節に pending は無い

## 5. 裁定と食い違った点

1. **3.12.10 の用語**
   - 裁定 L-3 は、同じ失敗の連続を「連続失敗」と呼び、「無進捗は未達」としている
   - 3.12.10 の本文の定義は、連続失敗 = 回数の上限、無進捗 = 同じ失敗の反復である
   - 正本は 3.12.10 と裁定しているので、3.12.10 の定義に従った。無進捗(同じ失敗したテストの集合の反復)と連続失敗(反復の上限)は delivered、累積消費は undelivered とした
   - 中身は裁定の「同じ失敗の連続で保留にする」「総数の上限を保つ」と一致する
2. **G-6 の承認の文の文体**
   - 裁定は「ですます」で文を示している
   - 置いた先が箇条書きのため、執筆規約に従い「である調」にした
   - 意味は変えていない
3. **EV の追加**
   - 裁定が挙げていない EV-0147(5.4.5 の 3 か月、RC-09)を足した
   - RC-09〜RC-12 を「能力に依らない」と並べる以上、同じ扱いにしないと根拠水準の開示が欠けるためである
4. **実装マークの追加**
   - 裁定が名指ししない IMPL-0262・0265・0267・0268・0278 を足した
   - いずれも裁定が採った規定を実行層へ降ろす(または降りていないことを示す)ためのマークである
5. **附属書F の相互参照を戻した**
   - 作業の途中で `safety-verification.md` に入れた参照は、裁定に無いため戻した
6. **G-5・G-6 の棚卸しの区分**
   - 節に基準の表があり、すべてのマークを `ids` に列挙できるため、`impl-inventory.yaml` で `kb` に分類した
7. **登録簿の整合検査**
   - 本リポジトリの検査(`check-recalibration-registry`)として実装し、実装マークは付けていない
   - 標準の規定を採用者の実行層へ降ろすものではなく、標準とテンプレートの整合の検査だからである
8. **`nameConfirmed`**
   - 手続きの文だけを置き、本人以外の記名の強制は付けていない
   - 本人以外の記名の強制は `accountsConfirmed`(IMPL-0266)の側にある
9. **RC-06 の名称**
   - 裁定は触れていないため、改めていない

## 6. 突合の後の修正(`crosscheck.md` X-1〜X-14、裁定 8 章)

突合の指摘と裁定(`decision.md` 8 章。`nameConfirmed` の付記を含む)を、すべて反映しました。再審議はしていません。

### 6.1 番号

この修正で使った番号は IMPL-0279・IMPL-0280・IMPL-0281 です。EV と ADR の番号は新しく使っていません。**次に使える番号は ADR-0080、EV-0149、IMPL-0282** です。

### 6.2 指摘ごとの記録

| ID | 直したこと |
| --- | --- |
| X-1 | `gate-criteria.md` の見出しを `## AI 品質指標の扱い(適用: AI が関与した成果物の品質を比率で扱う場合。傾向の確認と第5章 5.4.6 の検知条件を含む)` にし、前文の限定を外した。前文は、本節の比率を合否条件として用いないこと、閾値が傾向の確認と 5.4.6 の検知条件に用いる値であること、出荷判定・委託契約の報告でも傾向の確認として示すことを書く。要求事項1 を「傾向の確認と第5章 5.4.6 の検知条件に用いる閾値は」と改めた。ADR-0079 決定1・決定4 と本記録 L-1・L-4 の記載を事実に合わせた |
| X-2 | 要求事項3 を「母数は、各指標の定義の単位(変更・タスク)で数える」に改めた。5.4.6 に「差し戻し率と重複率は変更、手戻り率はタスク」と書いた。運用メトリクスの手戻り率の算出方法を、分子・分母とも「期間内に完了した、AI が実装したタスク」に揃え、AI が実装したタスクの判定(タスクを指すコミットのトレーラ `Spec:` と `Co-Authored-By:`)を書いた |
| X-3 | テンプレートの `self-heal.mjs` に `failureSignatures` を足した。失敗したテストの識別と、失敗の理由の要約(TAP の error、pytest の FAILED の後ろ、go の `file.go:N:` の行、jest の Expected・Received など。所要時間・位置・アドレスを落として正規化し、ハッシュの先頭 8 桁)の組で比べる。理由が変われば進捗とみなす。理由を読めないテストは識別だけで比べ、その旨を出力と記録に出す。jest の `● Console` を失敗のテストとして読まない。IMPL-0276 の注記に比較の範囲と向きを書いた |
| X-4 | 既存の採用者を壊さないよう、`ci.coverageScope` の無い構成は従来どおり `whole` で測り、範囲を既定から補った旨(`scopeDefaulted`)を結果・警告・保証の開示に出す。新しく生成する構成は `changed` を書く(`derivedCoverageScope`)。範囲の変更の向きは、値の無い構成を `whole` として比べる(`changed` → 値なしは緩める向き、値なし → `whole` は緩める向きでない)。`check-g1.mjs` の範囲の行は、G-1 を通過済みの企画書に無ければ遡って失敗させず、`/pit`(`next.mjs`)と出荷の証跡の集約に記載の欠落として出す。G-1 を通過する前の企画書では必須のまま。テンプレートの README に移行の節(「process-compass #296 の更新を取り込むとき」)を足した。標準(G-5 基準3)に「範囲を記録していない構成を、変更の範囲へ黙って読み替えてはならない」を置いた。0.3 の誤りを直した |
| X-5 | 差分を `git -c core.quotePath=false diff` で取り、`parseAddedLines` が引用符つきのパス(8進のエスケープ)も戻す(`unquoteGitPath`)。行単位の被覆を測れない拡張子の製品のファイルを、変更の範囲・全体の両方で「測っていない製品のファイルの数」に入れ、警告を出す。複数行の文の継続行が分母に入らない近似を結果(`approximation`)、IMPL-0245 の注記、G-5 基準3 の本文に書いた |
| X-6 | IMPL-0274 を要求事項4 のうち値を定めることに限り、G-1 の時点の記録を IMPL-0280(`project-brief-template`、undelivered)として分けた。企画書の行は足していない(下の 6.4) |
| X-7 | cli/cli の確認(v2.30.0 以降で `commit.oid` を返す)を IMPL-0263 の注記と ADR-0079 決定2・影響に書いた。`config.mjs` に `GH_MIN_REVIEW_COMMIT`・`parseGhVersion`・`versionBelow`・`unboundCauseText` を足し、集約が確かめられない承認のあるとき gh の版と原因を保証の開示の行に出す。`env-check` が gh の版を記録し、古い版なら警告を出す |
| X-8 | 自己修正の記録をタスクごとのファイル(`docs/self-heal/F-NNN-Task-N.tsv` の形)に分けた。`implement/SKILL.md` と `CLAUDE.md` に「記録は同じ PR でコミットする」を書いた。書き込みの失敗は警告を出す。集約の記録の置き場に `docs/self-heal/**` を足し、旧い `docs/self-heal-log.tsv` も残した |
| X-9 | 3.12.10 の段落を「AI の実行の単位の停止条件の正本。実行の単位には、自己修正のループと、AI の確認側と作成側の往復を含む」に改めた。IMPL-0279(`ai-review-workflow`、undelivered)を要求事項1 に足した。附属書H の箇条に、準拠テンプレートは往復の停止を強制しない旨を足した |
| X-10 | `process-audit.md` の観点6 の表の機械の列に上書きの記録と件数、監査の列に上書きしたアカウント・氏名が実在の人のものかを足した |
| X-11 | `improvement-cycle.md` を「手戻り率(運用メトリクス。タスクの単位)が高い」に、EV-0091 の差し替え条件を「自己修正のループが停止条件(第3章 3.12.10)で止まったタスクの記録」に改め、台帳を再生成した |
| X-12 | `gate-criteria.md` の G-6(申告による持ち越し)と規模の「課しません」、`metrics.md` の起草者の再評価、`process-audit.md` の比例、3.12.10 の総数の上限の廃止の引用を「ADR-0079『課さないと決めたこと』」へ改めた。G-5 基準3 の薄まりの開示(決定1)はそのまま |
| X-13 | 棚卸しの行7 に IMPL-0099 と新しい IMPL-0281 を挙げた(下の 6.4) |
| X-14 | 降ろし先 `g1-check` の名を「G-1 の企画書の様式の検査(check-g1.mjs)」に改め、基準3 の行は説明に残した |
| 付記 | `nameConfirmed` を本人以外の記名に限った。`config.mjs` に `confirmedNames`・`nameConfirmedValid`・`nameConfirmationProblems` を足し、`aiNameBlocked`・`nameOverrides` は有効な記録(`changeLog[].nameConfirmations` と `decidedBy`。本人と AI の名義を除く)がある確認だけを通す。`/process-change` は、記録の無い確認(新しく足したものと、#296 より前に書いたもの)を本人以外の記名を要する項目にし、記録を変化点に書く。契約検査が記録の無い確認を落とす。G-6 の箇条・IMPL-0266 の注記・D-0 の様式・README・`accountable.md` を合わせた |

### 6.3 確かめたこと

`npm run check` は終了コード 0 で通りました。テンプレートの試験もすべて通りました。

| 試験 | 件数 | 前回からの増分 |
| --- | --- | --- |
| test-check-pr | 115 | 0 |
| test-coverage-scope | 35 | +12(既存の構成の範囲、新しい構成の既定、引用符つきのパス、測れない拡張子、近似、企画書の行の扱い、範囲の変更の向き) |
| test-self-heal | 42 | +15(理由の要約、`● Console`、理由の変化と同一、タスクごとの記録、書き込みの失敗の警告、記録の無い `nameConfirmed`) |
| test-roster-rules | 94 | +12(氏名の確認、gh の版) |
| test-init-g5 | 110 | 0 |
| test-size-observation | 9 | 0 |
| test-recalibration | 14 | 0 |
| test-check-delegation | 39 | 0 |
| test-g5-aggregate | 23 | 0 |
| test-plan-trace | 30 | 0 |
| test-decisions | 22 | 0 |

ほかに次の点を確かめました。

- `verify-gate-contract`・`check-decisions`・`check-process-rules`・actionlint を通した
- `next.mjs` と `check-g1.mjs` を手元で実行し、落ちないことを確かめた
- `aggregate-evidence.mjs` は、変更の前と同じく記録の欠落で終了コード 1 を返す。例外では落ちない

### 6.4 裁定と食い違った点・確かめられなかったこと

1. **X-13 の直し方**: 突合の修正案は「行7 の ids に IMPL-0267 を足す」だった。棚卸しの検査は、節の中に無い識別子を ids に挙げることを認めない(他の節の規定は所在で示す)。そこで、規模の節に同じ実装を指す IMPL-0281(`pr-checks`、delivered)を置き、行7 の ids に挙げた。所在(G-6 の節)は外した。同じ関数を2つのマークが指す
2. **X-6 は「未達の表示」を選んだ**: 裁定は「実装するか、`undelivered` に直す」。企画書の様式に停止条件の行を足すと、X-4 と同じ既存の企画書の互換の扱いが要る。このため、G-1 の時点の記録を IMPL-0280(undelivered)として分けた
3. **X-4 の互換の判定**: G-1 を通過済みかは、`docs/gates/` の判定記録のうち、ゲートが G-1 で結果が「通過」のものの有無で判定する。結果欄を読めない記録は通過に数えない(`next.mjs` と同じ安全側)
4. **X-8 の限界**: 同じ PR でコミットしたかは機械で確かめない(IMPL-0273 の注記)
5. **X-7 の限界**: gh の版は、集約・env-check を実行した端末の gh の版である。gate-g5 の実行環境の gh の版は読まない
6. **`nameConfirmed` の互換**: 記録の無い既存の確認は効かなくなる。1人の体制で本人の氏名が AI を示す語を含む場合、本人以外の名簿の人が記名するまで、その人の記名は拒否される。README と ADR-0079 の影響に書いた
7. 実機の gh での承認の版の取得(IMPL-0263)と、env-check の実環境での実行(IMPL-0265)は、引き続き確かめていない

