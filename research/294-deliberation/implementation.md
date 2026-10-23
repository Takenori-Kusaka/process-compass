# 反映の記録(Issue #294 次の改訂の入力 — 8 論点。裁定 K-1〜K-9)

- 日付: 2026-10-23
- 正とした文書: `research/294-deliberation/decision.md`(K-1〜K-9)
- 迷ったときに引いた材料: `council-01-drafter.md`(文の案)、`survey-294-1-internal.md`・`survey-294-2-external.md`(事実)
- 様式の手本: `research/293-deliberation/implementation.md`、`src/content/docs/adr/0077-*.md`

## 0. 次の担当へ引き継ぐこと

### 0.1 番号

この担当が使った番号: ADR-0078、EV-0139〜EV-0142、IMPL-0240〜IMPL-0256。**次に使える番号は、ADR-0079、EV-0143、IMPL-0257**。使う前に、既存の最大を自分で確かめること。

### 0.2 マージの前提(利用者へ伝えること)

`template/` のサブモジュールは pit-in-template の作業ブランチ `claude/process-compass-294`(60e3838、push 済み)を指す。#291〜#294 の積み重ねで、template の main には無い。**本リポジトリの変更を main へ入れる前に、テンプレート側を main へマージし、サブモジュールの指す先を template の main の上のコミットにする**。

### 0.3 利用者の了承が要るもの

- テンプレートの `CLAUDE.md`(「人へ戻す3つの場合」の (c) の行)を改めた。テンプレートの利用者が受け取る指示ファイルなので、テンプレート側の PR で変更点を明示して了承を得る

### 0.4 別 Issue として起票すること(裁定 7 章)

1. テンプレートの出荷の証跡の保管の設計(保持期間、G-7 の集約の保持切れの誤診、`ship-evidence` が coverage の結果を取り込まない件、「検証方法と結果」の文の写しと改変の検出)。IMPL-0243・0244 を `delivered` へ移す条件になる
2. 判定記録の整合の検査を PR の時点で走らせるか(#254 の残り)と、確定した版からの受入基準の書き換えを PR の時点で検出するか(IMPL-0241 の前倒し)
3. 原則4 の例示に取り消せない操作と統制の弱化が同じ列に並ぶこと、配備をマージで起動する構成での G-8(#329 と突き合わせる)
4. 却下の側の語彙(SARIF の抑止の理由などとの対応)と、ISO 9001 の改訂版への追随

あわせて、#330(未実施の長期化)へ、アダプタが G-5 基準3 を測らずに通す件(go・none・undetermined、`coverageSummary: null`)を足すこと。この変更では #330 に書き込んでいない。

## 1. 裁定ごとの記録

### K-1 確定した版を変える場合

- `gate-criteria.md` に `## 確定した版を変える場合` を新設した(「判定の範囲」の後)
  - 表: 受入基準・前提・スコープ外 → G-2(S0 では G-4)、判断記録 → G-3
  - 「変更の契機によって、受け直すゲートを変えてはなりません」を太字で置き、戻り幅は変わった成果物で決まり、提出者と担い手は選ばないと書いた
  - 受け直しは元の判定の取消ではない(ADR-0036)。後のゲートは変更後の版を判定する。新しいゲートは設けない。G-3 の受容拒否の差し戻し先と重ならない
  - 「技術検証」を作業の種別として設けない(様式・置き場・事業ステージのいずれも課さない)と明記した。1-C(前提の行に検証タスクを書かせ着手の前提条件にする)を採らないことも、理由(ADR-0036 決定3 の持ち越し)とともに書いた
  - IMPL-0240(`gate-skill`、delivered、presence): テンプレートの `/gate` の `gates/G-2.md`・`G-3.md`・`G-4.md` に受け直しの行を足した
  - IMPL-0241(`evidence-aggregation`、undelivered): 出荷の集約での検出はテンプレートに無い(IMPL-0107 の残り)
- G-2 前提条件1 の小節に、判定者が前提を引き受けない場合の段落を置いた: 閉じていない未確定事項として扱い、前提条件1 を満たさないため差し戻す。差し戻しの記録に引き受けない前提の ID を書く。IMPL-0242(`gate-skill`、delivered、presence。`gates/G-2.md` に行を足した)
- `lifecycle.md`(2.6 ステージによるループの回し方の変化)の S0 の段落: 探索の記録の置き場と様式は課さない。SG-0 の決断の記録の「確認した事項・確認していない事項」に依った探索の記録を挙げ、到達できるようにする。確認していない技術的な問いは S1 の前提か検証のタスクへ移す。S1 以降の技術検証は作業の種別ではない。IMPL-0252(`gate-record-template`、undelivered)
- `human-ai-boundary.md` 5.7.2 に「確定した版を変える場合」への参照を足した(既存の IMPL-0171 のまま)
- 附属書H(`assurance-case.md`)H.10 の ISO 9001 8.3.6 の行を、この節を対応先として足し、機械の検出が無いことを弱い点に書いた
- EV は付けていない(裁定どおり)

### K-2 取り消せない操作

- 5.5.1 に太字の定義を置いた: 取り消せない効果を、他の者の操作を介さずに生じさせる操作。後段の操作を人が行う上流の編集(5.5.5 項目4)は数えない。後段が人でない経路(委任のマージ・自動マージ・予約の公開・push を契機の配備)では上流の操作が当たり、委任(5.5.4)のマージの対象にしてはならない
- 「後段に人だけが通せる門が残ることを理由に、停止を省いてはなりません」を明記した(2-C・2-D の免除は置かない)
- 統制の弱化は、取り消せない操作とは別の停止の事由として残すと書いた([Label Mailbox 4.7] を引く)。範囲を狭めていない
- 5.5.1 の表の行から「確定した版を変える場合」へリンクした
- EV-0141(E2、見直し 2027-10)。差し替え条件は、上流で止めなかった変更のうち後段で操作した人が効果を知らずに操作した件数と、人の門が迂回された件数
- IMPL-0251(`claude-md`、delivered、presence): テンプレートの `CLAUDE.md` の (c) の行と `.claude/skills/pit/reference/handoff.md` に定義を置いた
- `label-mailbox.md`: 原則4 を「オーナー(事業決裁者)」へ直し、5.5.1 の定義を引き、免除しない文を足した。L34・L42 の戻す先を事業決裁者へ揃えた(`state:needs-owner`)。4.5.2 の表と 4.7.3 の「不可逆4操作」を「取り消せない操作(4.2 原則4)」へ改めた

### K-3・K-6 読者役と AI の指摘

- 附属書H H.4 に `### 確認側へ渡した入力の記録` を新設した: 渡した入力(自動で読み込まれる指示ファイル・道具の定義・起動の指示を含む)を列挙できない確認を、文脈を渡していない確認として記録してはならない。文脈ゼロの読者役は要求事項にしないと明記した。IMPL-0253(`ai-review-workflow`、undelivered。`ai-review.yml` は入力の記録を出さない)
- H.4「指摘の書式」の後に 2 段落を足した: 反対の理由の列挙・観点ごとの所見・確かめていない範囲を含める値として課さない(ADR-0075 決定7・10)。組織が指示資産に置くことは妨げず、効果は条件1 の検出率で確かめる。AI が申告した範囲を確認の範囲の根拠にしてはならず、範囲は渡した入力の記録で示す
- 附属書C(`review-guide.md`、参考)に `## 成果物だけを読む確認` を手引きとして置いた(渡すのは成果物だけ、指示ファイルを自動で読み込まない場所から起動する、読者役の感想は根拠にしない、重視するなら受入基準へ書く)

### K-4 スタック型 PR

- 第4章 `gate-criteria.md` に `### 積み重ねた変更とゲート`(「分割しすぎない」の後)を新設した。規範 4 つ:
  1. G-5 の起動を PR の基底ブランチで絞ってはならない — IMPL-0247(`gate-g5-workflow`、delivered、manual)
  2. G-5・G-6 は既定ブランチへ取り込む PR で成立する。既定ブランチ以外を基底とする PR をマージせず、下の層から順に取り込み、上の層の基底を付け替える — IMPL-0248(`rulesets`、undelivered)
  3. 基準値と例外承認の行は既定ブランチから読む — IMPL-0249(`pr-checks`、delivered、machine)
  4. 合わさった差分への承認を層ごとの確認に数えてはならない — IMPL-0250(`gate-skill-g6`、undelivered)
- `stacked-pr.md`
  - 前提表を 2026-10-23 時点へ更新し、ネイティブのスタック(2026-07-30 公開プレビュー、2026-10-06 一般提供)の行を足した。EV-0139(E1、見直し 2027-04)
  - 段階1 の前提条件、手順の箇条を第4章の 4 つに合わせて書き直した
  - 「必須チェックで中間層の先行マージを拒否する」(旧 L95・L176)を、成り立たない機構として書き直し、IMPL-0254・IMPL-0255(`rulesets`、undelivered)で表示した
  - 「導入しない判断」の下に、GitHub 標準機能を推す意見と推さない意見の両論を並べた(4-D)
- `ci-gates.md` の pr-rules の表と箇条: 「基底ブランチ」を「既定ブランチ」へ改め、スタックで基底から読むと禁止事項6 を層をまたいで抜けうることを書いた。`template-repository.md` の 2 か所、テンプレートの `task-size.md` の 1 か所も同じく改めた
- テンプレート(詳細は 3.2)
  - `check-pr.mjs` に `--policy-base` を足した。差分は PR の基底から取り、基準値・ロスター・riskFloor・`.gitattributes`・台帳の例外承認・出荷停止の記録・承認者の設定は `--policy-base` から読む
  - `gate-g5.yml` の pr-rules は `github.event.repository.default_branch` を取得し、`--policy-base "origin/${DEFAULT_BRANCH}"` を渡す
  - 試験 `test-check-pr.mjs` に、下の層で maxChangedLines を 5000 へ上げ、台帳に例外の行を足したスタックの場面を足した
- ルールセットを機能ブランチへ広げる案(4-B の原案)は採らなかった(裁定どおり)

### K-5 費用

- 3.12.7(`roles-responsibilities.md`): 上限には提供者が課す利用上限を含め、到達時の扱い(待つ・従量へ移る・止める)を G-1 で決める。提供者の上限を組織が設定した上限に数えてはならない。待つことで費用が増えることを、承認を急がせる理由にしてはならない(キャッシュの失効を含む)
- 3.12.2: 個人で契約した経路は、定額であっても正規の経路に当たらない。手元の記録の日次の複製は課さないと明記した(提供者の保持の仕様に依り、本標準の判定が読む記録ではない)
- 7.7.1(`exception-escalation.md`): AI 実行予算は課金形態を前提にしない統制の単位。定額では利用上限に対する割合として読み替える。実績が無ければ 0 でなく未測定と報告する。注記の枠でなく本文の段落にした
- `compute-strategy.md`(AI トークン予算の管理): キャッシュの費用構造(書き込みの割増、読み出しの割引、TTL、承認待ちが TTL を超えると割増が再発する)を数値なしで書き、診断用の使い方の箇条と 3.12.7 を引く箇条を足した。EV-0140(E1、見直し 2027-04)
- `metrics.md` のトークン効率の行: 診断用で 7.7.8 の評価の入力にしない。算出元が無ければ未測定

### K-7 証跡の置き場

- 第4章「判定の成立」の下に `### 判定が指す記録の保管` を新設した: 判定記録・出荷の証跡が指す記録は、組織が定める保管期間のあいだ到達できなければならない。CI 基盤の既定の保持を保管とみなしてはならない。添付と所在の記載は課さない。IMPL-0243(`ship-evidence-workflow`、undelivered)、IMPL-0244(`evidence-aggregation`、undelivered)
- `ci-gates.md` に `### 証跡の保管と CI 基盤の保持期間` を新設した: GitHub の成果物の既定の保持 90 日と 2026-10-01 以降のチェックの履歴の扱いの事実、テンプレートの現状(`ship-evidence.yml` は `retention-days` を指定しない。集約は保持切れを「必須チェックを経ずにマージされた可能性」と示す)
- `qms-document-control.md`: 設計・開発の変更の行と、保管の箇条を広げた
- `pr-workflow.md`: human-verify に添付と所在を求めない文を足した。既存の 3 要素の様式の降り先を IMPL-0256(`pr-template`、undelivered)で表示した

### K-8 規模の下限

- 第4章 G-5 基準3 に `#### カバレッジの測る範囲と規模(基準3)` を新設した: 規模の下限は課さない(厳しさはリスク区分と CL で変える)。基準値は測る範囲(全体か、変更で加えたコードか)を企画時に併せて決め、記録する。記録と保証の開示に割合・範囲・分母を出す。EV-0142(E1、見直し 2027-10)。IMPL-0245(`coverage-check`、undelivered。全体の行の割合しか測らない)、IMPL-0246(`evidence-aggregation`、undelivered。分母を記録しない)

### K-9 範囲の外

本 Issue で直す 5 件はすべて直した:

1. `label-mailbox.md` の「不可逆4操作」と戻す先の誤り(K-2 の項)
2. `stacked-pr.md` の成り立たない記述(K-4 の項)
3. 附属書H の ISO 9001 8.3.6 の行(K-1 の項)
4. `metrics.md` のトークン効率(K-5 の項)
5. 3.12.2 の個人契約の経路(K-5 の項)

別 Issue 4 件は 0.4 に挙げた。課さない 1 件(#274 の手元の記録の日次の複製)は 3.12.2 に明記した。

## 2. 番号の割り当て

| 番号 | 置き場 | 内容 |
| --- | --- | --- |
| ADR-0078 | `adr/0078-rejudge-on-change-and-irreversible-operation.md` | K-1・K-2・K-4・K-7 に K-3・K-5・K-6・K-8 を足した決定 1〜7 と、課さないと決めたこと(K-3 の読者役、K-6 の出力の値、K-8 の規模の下限、K-5 の手元の記録の複製、2-C・2-D の免除、1-C) |
| EV-0139 | `stacked-pr.md` 前提表 | ネイティブのスタックの CI・必須チェックの挙動(E1、2027-04) |
| EV-0140 | `compute-strategy.md` | キャッシュの費用構造(E1、2027-04) |
| EV-0141 | `human-ai-boundary.md` 5.5.1 | 取り消せない操作の定義(E2、2027-10) |
| EV-0142 | `gate-criteria.md` 基準3 | 規模の下限を置かないこと(E1、2027-10) |
| IMPL-0240〜0242 | `gate-criteria.md` | 受け直し・前提を引き受けない場合 |
| IMPL-0243〜0246 | `gate-criteria.md` | 保管・測る範囲 |
| IMPL-0247〜0250 | `gate-criteria.md` | 積み重ねた変更とゲート |
| IMPL-0251 | `human-ai-boundary.md` | 取り消せない操作の定義 |
| IMPL-0252 | `lifecycle.md` | SG-0 へ渡す探索の記録 |
| IMPL-0253 | `assurance-case.md` | 確認側へ渡した入力の記録 |
| IMPL-0254・0255 | `stacked-pr.md` | 中間層の先行マージの拒否 |
| IMPL-0256 | `pr-workflow.md` | human-verify の 3 要素 |

降ろし先として `src/data/impl-targets.yaml` に `rulesets`(`.github/rulesets/team.json`)、`ship-evidence-workflow`(`.github/workflows/ship-evidence.yml`)、`coverage-check`(`scripts/gate/coverage-check.mjs`)を足し、`pr-checks` の説明を `--policy-base` に合わせた。

## 3. 変更したファイル

### 3.1 本リポジトリ

- 第4章: `gate-criteria.md`、`human-ai-boundary.md`、`lifecycle.md`、`assurance-case.md`(附属書H)、`review-guide.md`(附属書C)、`roles-responsibilities.md`、`exception-escalation.md`
- フェーズ5・6: `stacked-pr.md`、`ci-gates.md`、`label-mailbox.md`、`pr-workflow.md`、`qms-document-control.md`、`compute-strategy.md`、`template-repository.md`、`metrics.md`
- ADR: `adr/0078-*.md`(新規)
- データ: `impl-targets.yaml`、`impl-inventory.yaml`(変えた節 31 件をすべて `issue: 294` で区分。`pending` は残していない。`stacked-pr` の旧キー「前提の確認(2026-08-05 時点)」とその子は 2026-10-23 のキーへ置き換えた)、`scope-exempt.yaml`(1 件)
- 台帳(自動生成): `evidence-ledger.md`、`implementation-ledger.md`。`scope-ledger.md` は変化なし
- `template` のサブモジュールの指す先

### 3.2 テンプレート(`claude/process-compass-294`)

- `scripts/gate/check-pr.mjs`: `--policy-base`。`analyzePr` は `policyBase` を受け、`git merge-base` で読む点を決める。解決できなければ「既定ブランチ … を解決できません」で失敗する。結果に `policy: { ref, sameAsBase }` を出し、基底と異なれば通知を出す。初期の閾値の検出・`process.config` の変更キー・3b の条件・規則の変更は、差分の比較なので PR の基底の設定のまま
- `scripts/gate/test-check-pr.mjs`: スタックの場面 5 件とワークフローの定義の確認 1 件
- `.github/workflows/gate-g5.yml`: pr-rules が既定ブランチを取得して渡す
- `CLAUDE.md`、`.claude/skills/pit/reference/handoff.md`: 取り消せない操作の定義
- `.claude/skills/gate/gates/G-2.md`・`G-3.md`・`G-4.md`: 受け直しと、前提を引き受けない場合
- `.claude/skills/implement/reference/task-size.md`: 「基底ブランチの台帳」を「既定ブランチの台帳」へ

## 4. 確かめたこと

- `npm run check`: 終了コード 0(コミットの直前)
- `npm run lint:impl`・`lint:scope`・`lint:evidence`: 指摘 0 件(台帳の再生成の後)
- テンプレート: `test-check-pr`(105 場面)、`verify-gate-contract`、`test-check-delegation`、`test-recalibration`、`test-roster-rules`、`test-g5-aggregate`、`test-plan-trace`、`test-init-g5`、`check-process-rules` が通る
- `actionlint`: テンプレートの `gate-g5.yml` に指摘 0 件
- スタックの試験: `--policy-base main` では、下の層で上げた基準値と下の層で足した台帳の行が効かず、`size:over` になる。`--policy-base` を渡さない対照では通る(穴が実在することの確認)。解決できない参照では失敗する
- テンプレートの事実: `ship-evidence.yml` は `upload-artifact` に `retention-days` を指定しない。`aggregate-evidence.mjs` は G-5 の結果が読めないと「必須チェックを経ずにマージされた可能性」を出す。`coverage-check.mjs` は `total.lines.pct` だけを読む。`ai-review.yml` は入力の記録を出さない。`team.json` のルールセットの対象は `~DEFAULT_BRANCH` だけ
- `template:kb` は走らせていない。規則データと第4章の基準の表を変えておらず、`check` の複製の検査が乖離を出さないことで確かめた。`check-gate-criteria.mjs --write` も同じ理由で走らせていない

## 5. 確かめていないこと

- ネイティブのスタックの実機での挙動(`github.base_ref` が直接の親を指すこと、`github.event.repository.default_branch` が中段の PR でも既定ブランチを返すこと)。一次文書の記述に依る(EV-0139)
- `gate-g5.yml` の変更を GitHub Actions の上で走らせていない。手元の試験は `check-pr.mjs` を直接呼ぶ
- GitHub の 2026-10-01 以降のチェックの履歴の保持の扱いは、一次文書の記述に依る。実際のリポジトリで保持切れを観測していない
- キャッシュの費用構造(EV-0140)は提供者の文書の記述に依り、数値を書いていない
- ISO 9001 8.3.6・ISO/IEC/IEEE 12207 の原典(有償)は読んでいない。裁定の二次の確認に依る
- 突合(裁定 8 章)は、この担当では行っていない。ADR-0028・0029・0033・0036・0051・0053・0056・0075・0077 との矛盾、語の整合は突合の担当が確かめる

## 6. 裁定と食い違った点

1. **K-1 の節の位置**: 裁定は「ゲートの共通ルールの後」とした。「判定の成立」「判定の範囲」が受け直しの前提(判定記録の版、元の判定を取り消さないこと)を定めるため、「判定の範囲」の後に置いた
2. **K-2 のテンプレートへの降ろし**: 裁定は降ろし先を定めていない。テンプレートの `CLAUDE.md` と `handoff.md` が (c) を定めているため、両方を改め `delivered`(IMPL-0251)にした。CLAUDE.md の了承は 0.3
3. **裁定に無い EV**: EV-0141(K-2 の定義。後段に人の門がある経路の実績が単一事例に依る)と EV-0142(K-8 の規模の下限を置かないこと。外部の規格は二次)を足した。K-1 は裁定どおり EV を付けていない
4. **G-2 で前提を引き受けない場合の置き場**: 判定チェックリストの表ではなく、前提条件1 の小節の段落に置いた。表の列(基準)を変えていないため、知識ベースと `check-gate-criteria` の対象は変わらない
5. **K-3・K-6 の入力の記録の置き場**: 裁定は「H.4 に 1 文」とした。条件の段落に混ぜると条件5 の語の定めと読めるため、H.4 の子の節として新設した
6. **K-4・K-5・K-7 の規範の置き場**: 裁定は `stacked-pr.md`・`compute-strategy.md`・`qms-document-control.md`・`ci-gates.md` を置き場に挙げた。フェーズ5 の頁は本文に従属し新しい要求を持てないため、規範の文は第4章(`gate-criteria.md` の「積み重ねた変更とゲート」「判定が指す記録の保管」)と第3章(3.12.7)に置き、フェーズ5 の頁はそれを引く形にした。キャッシュの失効を承認を急がせる理由にしない禁止も、`compute-strategy.md` でなく 3.12.7 に置いた
7. **K-7 の「添付を課さない」の位置**: 裁定は human-verify(`pr-workflow.md`)とした。第4章の「判定が指す記録の保管」にも書いた(規範の側に課さない判断を残すため)
8. **K-4 の降りていない部分**: 裁定は「中間層の先行マージの拒否」だけを `undelivered` とした。「合わさった差分への承認を層ごとの確認に数えない」(IMPL-0250)も、G-6 の補助ファイルに無いため `undelivered` にした
9. **裁定に無い実装マーク**: IMPL-0256(`pr-workflow.md` の既存の human-verify の 3 要素)。変えた節を登録簿で区分するため足した。様式の注記に「判断」の例が無いため `undelivered`
10. **テンプレートのほかの文書**: 裁定に無い `task-size.md` と `handoff.md` の「基底ブランチ」の語を、K-4 の既定ブランチから読む実装に合わせて改めた
11. **policy として読む範囲**: 裁定は「基準値」を既定ブランチから読むとした。同じ穴を持つロスター・riskFloor・`.gitattributes`・台帳の例外承認・出荷停止の記録・承認者の設定も、既定ブランチから読むようにした。差分の比較に使う設定(初期の閾値の検出、`process.config` の変更キー)は PR の基底のまま
12. **適用範囲の除外の登録**: 「確定した版を変える場合」で、実装マークの注記に含まれる「S0 では」を検査が拾った。限定は表の行の中にあるため、`scope-exempt.yaml` に理由付きで登録した
