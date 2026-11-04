# #380 内部調査: 記録だけの PR に残る承認 1 件(IMPL-0124)

調査日 2026-11-05。対象は main(236b5bf)と準拠テンプレート `template/`(submodule の現物)。出典は `path:line`。外部(GitHub の仕様)に関わる記述は「外部で確かめる」と明記した。

## 0. 要点

1. 条項は「判定記録だけのコミットを基底ブランチへ入れる操作に、記名者以外の承認を課さない」で、裏づけは記名者本人の操作(署名コミットまたは記名者の承認レビュー)。裏づけが無ければ自己申告として開示し、他者の承認は「取り込みの事務」とする(`src/content/docs/phase4-process-design/gate-criteria.md:107`)
2. 準拠テンプレートは、様式と写しを記録用ブランチ `records` へ出すことで、**記録の大半**についてこの条項を満たしている。基底ブランチへ PR で入れなければならないのは3つ: (i) 出荷の PR(`ship/<日付>`)、(ii) 例外承認の台帳 `docs/debt-ledger.md`、(iii) 停止の申し立ての解除の記録(および前倒しの SG 記録)
3. (ii)(iii) は `check-pr.mjs` が**既定ブランチの先端**から読む(ADR-0078)ので、records ブランチへ移せない。現状の「残る承認 1 件」は、自己の例外・自己の解除を差し込む経路を塞ぐ**事実上の統制**として働いている。条項を字義どおり強制層へ降ろすと(承認を外すと)、この統制が消える。これが本件の核心
4. 新たに見つけた穴: **出荷の PR は出荷判定者が開き、出荷判定者が承認する**と書いているが、GitHub では PR の作成者は自分の PR を承認できない(外部で確かめる)。手順どおりでは「記名者本人の承認」が成立しない(§6 H-1)
5. 1名+外部確認者の体制(`team.json`)では、AI の担い手が本人のアカウントで動く限り、台帳・解除・出荷の PR はすべて外部確認者の承認を要する。ADR-0070 が解消したはずの「中身を見ない承認」の構造(`adr/0070…:53`)が、これらの PR で残る

## 1. 条項・ADR・EV・フェーズ5

### 1.1 第4章「判定の成立」

- 成立要件と事務の区別。承認の操作そのものは事務(`gate-criteria.md:61-67`)。欄を運ばない承認の操作は事務(`:82`)
- 人が書く欄の受け皿は2つに限る。例外承認・停止の解除は**様式**(`:99`)。レビューの本文を受け皿にできるのは、対象が PR として存在する G-6・G-2・G-3・G-4 だけ
- 「判定記録を基底ブランチへ入れる操作」(`:105-110`)
  - `:107` 記名者以外の承認を課さない。帰属の裏づけ = 記名者本人の操作。裏づけ無し → 保証の開示(G-7)へ自己申告として出す。残る他者の承認 = 取り込みの事務
  - `:108` 写しは承認と同じ時期に機械が取り出し、書き換えられない場所へ。records ブランチでは満たされていない(EV-0185、IMPL-0353 未達)
  - `:109` 遅くとも G-7 で基底へ入れる。**停止の解除と例外承認の台帳は基底ブランチへ先に入れる**
  - `:110` 既定ブランチの強制層を写しのために縮小しない。置き場の形は準拠テンプレートが定める
- EV-0111(`:115-121`): E2。差し替え条件は「記名者以外の者が記録を書き換えた事象の件数」。支えは ADR-0057 の先例(決定であり実証でない)と、記録 PR に判定者以外の承認者を課した構成で承認者が中身を見ずに承認した1件の訴え。台帳の行は `src/content/docs/community/evidence-ledger.md:96`
- EV-0185(`:123-129`): records ブランチは追記・既存ファイルの変更が可能。#379 で扱う
- 実装マーク: IMPL-0355(`:112`、delivered)、IMPL-0356(`:113`、delivered)、IMPL-0353(`:131`、undelivered #379)、**IMPL-0124(`:132`、`state=undelivered check=manual plan=scheduled issue=380 review=2027-01`)**、IMPL-0128(`:133`、delivered presence)
- G-7 基準5 の突合は「基底ブランチにある判定記録と写し」が対象(`:1090`、`:1001`)

### 1.2 ADR-0070

- 表題に「記録だけのコミットに記名者以外の承認を課さない」(`src/content/docs/adr/0070-gate-record-medium-and-field-sources.md:2-3`)
- 背景: 旧 `/gate` は判定1件ごとに記録 PR を立て判定者以外の承認者を課していた。ADR-0057(層1 の改版に PR を課さない)、ADR-0058(PR 2本・承認2回の却下)、ADR-0067(2名の目的は変更の取り込みの統制)と食い違う(`:41-47`)。2名体制で中身を見ない承認を制度が生んでいた(`:53`)
- 事実確認: `check-pr.mjs` が基底ブランチから読むのは停止の解除と例外承認に限られる(`:35`)
- 受け皿: 例外承認・停止の解除は様式(`:77`)
- 決定6(`:93-98`): 遅くとも G-7、記名者以外の承認を課さない(ADR-0057・第5章 CI/CD・ADR-0067 の一般化)、他者の承認は事務と明記、停止の解除と台帳は基底へ先に
- 決定7(`:100-104`): 既定ブランチに bypass actor を足さない・`exempt` を用いない。Bot bypass は強制層の縮小(ADR-0038)。組織が bypass 構成を選ぶことは禁じないが `state:needs-platform` で統制の弱化として記録し、既定にしない
- 却下: Bot の bypass(`:142`)、記録 PR の承認者 ≠ 記名者を欠落に数える(`:149`。欄の揃った記録を欠落と扱い ADR-0036 決定1 と矛盾)
- `:181` IMPL-0124 は GitHub がパス単位の免除を持たないため undelivered で表示し続ける
- EV-0115(`:203-208`): 記録 PR の第三者承認の廃止が形骸化の抑止になるという判断。E1
- 先例 ADR-0057 の却下行: 「層1 の改版にも PR を課す」を却下(`src/content/docs/adr/0057-organizational-quality-assurance.md:509`)

### 1.3 フェーズ5・第5章の対応箇所

- `src/content/docs/phase5-implementation/ci-gates.md:636`(節 `:634`): 条項の再掲。PR と承認を課した既定ブランチでは記録だけの PR にも承認 1 件が残る。強制層へ降りていない。IMPL-0124 が表示し続ける
- `ci-gates.md:153`: 基準値と**台帳の例外承認の行は既定ブランチの先端から読む**。理由は「PR の中で…台帳へ自分の例外を足す、という形で検査を通せないようにするため」「判定の材料を、判定される側が同じ変更で用意できない形にする」
- `ci-gates.md:169`: PR の時点で確かめる例外承認の欄 = 状態・承認した者(名簿の人、AI の名義でない、PR の作成者でない)・理由・期限。照合は**名前**で行う
- `ci-gates.md:652`: 実機確認(2026-10-23)は「PR の作成者本人によるコメントの状態のレビューの提出」。作成者の承認は確かめていない(作成者は COMMENT でしか出せないことの内部の傍証。`template/.claude/skills/gate/gates/G-4.md:22` も「判定者が PR の作成者本人なら COMMENT で提出する」)
- `ci-gates.md:885`: PR の作成者が AI・bot のアカウントのとき、`require_last_push_approval` は指示者の承認を止めない
- `src/content/docs/phase5-implementation/qms-document-control.md:40`(G-7 の行)・`:47`: 入れる操作は事務。残る記録 PR の他者の承認は取り込みの事務

## 2. 記録用ブランチ records と record-copy.yml — どの記録がどこへ行くか

| 記録 | 置き場(初出) | 基底へ入る経路 | 承認の要否(team/safety/regulated) | 出典 |
| --- | --- | --- | --- | --- |
| 承認レビューの写し `records/reviews/pr-<n>.json` | records(`record-copy.yml` がマージ契機で `GITHUB_TOKEN` push) | 出荷の PR が `docs/records/reviews/` へ複製 | 出荷の PR で 1 件(regulated 2 件) | `template/.github/workflows/record-copy.yml:1-30,34-40`、`template/.github/rulesets/README.md:38-39` |
| 様式 G-1・G-7・G-8・SG・PR でない判定 `records/gates/*.md` | records(判定者本人が直接 push。PR 無し・承認無し) | 出荷の PR が `docs/gates/` へ複製 | 同上 | `template/.claude/skills/gate/reference/recording.md:75-92`、README `:38` |
| G-2・G-3・G-4・G-6 のレビューの本文 | ホスティングのレビュー(写しは上の行) | 写しとして | 本体 PR の承認(G-6 そのもの) | `recording.md:67-73` |
| **例外承認の台帳 `docs/debt-ledger.md`** | 基底ブランチ(先に) | 記録だけの PR | **1 件残る** | `recording.md:94-103`、README `:87` |
| **停止の申し立ての解除の記録(様式、`docs/gates/`)** | 基底ブランチ(先に) | 記録だけの PR | **1 件残る** | 同上、`template/scripts/gate/check-pr.mjs:7,59-61,478-485,527-530` |
| 前倒しが要る SG の記録 | 基底(`/process-change` が要する場合) | 記録だけの PR | 1 件残る | `recording.md:96` |
| 出荷の PR `ship/<日付>`(複製+保証の開示 `docs/evidence/`) | `ship-evidence.yml` が push、出荷判定者が開く | — | **1 件残る**(regulated 2 件) | README `:71-83`、`template/.github/workflows/ship-evidence.yml:20-43,245,252-257` |

基底ブランチに無いと効かない記録(records へ移せないもの):

- 例外承認の台帳: `check-pr.mjs:981`(`exceptionFor(atPolicy('docs/debt-ledger.md'), …)`)、`:440-449`。`atPolicy` は `--policy-base`(既定ブランチの先端)を読む(`:882-893`)。理由は ADR-0078 / `ci-gates.md:153`(スタックの下の層で緩めた材料を読ませない、判定される側が同じ変更で材料を用意できないようにする)
- 停止の解除: `check-pr.mjs:7`(既定ブランチの先端から読む)、`:478-485`(層1 の項目4 の権限者、AI の名義を受け付けない、ラベルを付けた日より前の解除は数えない)、`:529`(同じ PR で足した記録は数えない)。層1 自体も `${base}:docs/quality-assurance-policy.md` から読む(`:499`)
- 集約は records ブランチを自分で fetch して読むので、様式と写しは基底に無くても G-7 の集約で効く(`ship-evidence.yml:22-23`)。基底に要るのは、PR の時点で G-5 が読む材料だけ

## 3. 準拠テンプレートのルールセットの現状

| ファイル | 対象 | required_approving_review_count | require_code_owner_review | dismiss_stale_reviews_on_push | require_last_push_approval | その他 | bypass_actors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `team.json` | 既定 | 1(`:12`) | **false**(`:14`) | true(`:13`) | true(`:15`) | gate-g5 必須(`:20`) | キー無し(=なし) |
| `safety.json` | 既定 | 1(`:12`) | true(`:14`) | true(`:13`) | true(`:15`) | gate-g5・d0-check、required_signatures(`:26`) | なし |
| `regulated.json` | 既定 | 2(`:12`) | true(`:14`) | true(`:13`) | true(`:15`) | 同上(`:26`) | なし |
| `checks-only.json` | 既定 | (pull_request 規則なし) | — | — | — | gate-g5 必須(`:10`)。直接の push も止まる(README `:23`) | なし |
| `records.json` | `refs/heads/records` | (なし) | — | — | — | non_fast_forward・deletion(`:9-10`) | なし |
| `records-signed.json` | 同上 | (なし) | — | — | — | + required_signatures | なし |

- 適用の選択: G-6 の状態で決める。1〜2名で本人以外の確認者を名簿から確かめられないときは G-6 未達 → `checks-only.json`(README `:12-21`)。「1名。外部の確認者を置いた」「2名・相互」は `team.json`(`:17-18`)
- 契約検査 `template/scripts/gate/verify-gate-contract.mjs:768-797`: G-6 required のとき、`require_last_push_approval === true`(`:781`)、`dismiss_stale_reviews_on_push === true`(`:788`。IMPL-0264、`implementation-ledger.md:462`、試験 `template/scripts/gate/test-init-g5.mjs:216,243`)、承認の数(`enforcedApprovalFindings`)、必須チェック gate-g5 を確かめる。**bypass_actors・require_code_owner_review は確かめない**
- env-check `template/scripts/gate/adoption-trial.mjs:1605-1630`: 実環境の `rules/branches/<branch>` から、承認数 ≥ 構成、`dismiss_stale_reviews_on_push`(`:1623`)、`require_last_push_approval`(`:1624`)、`ownerReview` のとき `require_code_owner_review`(`:1625`)、gate-g5 を確かめる(IMPL-0265、`implementation-ledger.md:463`)。Actions が PR を承認できる設定は mismatch(`:1844`)。既定ブランチの bypass actor は所見だけで合否にしない(README `:107`、IMPL-0356)
- README は「記録だけの PR にも承認 1 件が残る(降りていない規定)」の節を持ち、IMPL-0124 を消さずに表示している(README `:85-93`)

## 4. 承認者と記名者の照合(IMPL-0128)と CODEOWNERS

- IMPL-0128(`gate-criteria.md:133`、delivered presence): 実装は `template/scripts/gate/aggregate-evidence.mjs:486-507`(`formAttribution`)と `:2198-2220`
  - 裏づけの強さ: 記名者本人の承認レビュー > 署名コミット > author の login / email(「弱い裏づけ」だが `backed: true`) > 名前だけ(自己申告)(`template/scripts/gate/records.mjs:301-312`)
  - 記名者以外の承認者は `clerical`(取り込みの事務)として開示。欠落に数えない
  - 照合の対象は**様式(`docs/gates/` と records/gates)だけ**(`aggregate-evidence.mjs:2213-2219`)。**例外承認の台帳の行は IMPL-0128 の照合の対象外**(台帳の行は様式でない)
- 記録だけの PR の識別: `RECORD_PATHS`(`aggregate-evidence.mjs:1278`)に `docs/gates/**`・`docs/records/**`・`docs/debt-ledger.md` に加えて `docs/D-0-governance.md`・`docs/quality-assurance-policy.md`・`PROCESS-PROFILE.md` などが入る。記録だけの PR は変更の単位に数えず、IMPL-0128 と G-5 だけを見る(`:1335-1337,1388-1412`)
- CODEOWNERS(`template/.github/CODEOWNERS:44-59`): `docs/gates/`・`docs/records/`・`docs/evidence/` → `@ship-judge`、`docs/debt-ledger.md` → `@value-owner` の行は**コメントアウトの雛形**。`/process-init` は書き換えず、`PROCESS-PROFILE.md` の案を人が写す(README `:109`)
  - 誘導層であり遮断に数えない。所有者の誰か1人で足り、bypass actor は素通りする(CODEOWNERS `:44-46`、README `:93`)
  - `team.json` は `require_code_owner_review: false` なので、所有者は**承認者の候補として表示されるだけ**(CODEOWNERS `:46`)。どの書き込み権限者の承認でも 1 件を満たす
  - 1パスに1席。`docs/gates/` には出荷判定者の記録・停止の解除・SG が同居し(`:49-50`)、解除の権限者(層1 項目4)や SG の判定者は出荷判定者と限らない
- 手順(誘導層): `recording.md:98-101`。(1) 記名者は push しない。AI の担い手が push して PR を開く。(2) 記名者は人が書く欄を PR 上の自分のレビューのコメントで書き、AI が一字も変えずに写す。(3) 記名者が承認・マージ。(4) 認証情報の共有・承認者2名・checks-only では他者の承認が付くか承認が無く、事務として開示

## 5. 1〜2名の体制で起きること

GitHub の前提(外部で確かめる): PR の作成者は自分の PR を承認できない。`require_last_push_approval` の下では最後に push した者の承認は数えない。`required_approving_review_count` はパスで変わらない。

| 体制 | ルールセット | 記録だけの PR の承認 | 起きること |
| --- | --- | --- | --- |
| 1名(G-6 未達) | checks-only | 不要 | 条項は事実上満たされる。ただし直接の push も止まるため、記録も PR を経る(README `:23`)。帰属は author の login(弱い裏づけ)か署名 |
| 1名+外部確認者 | team | 1件 | AI の担い手が本人のアカウントで動く(認証情報の共有)と、PR の作成者 = 記名者 → 本人は承認できない → **外部確認者の承認が要る**。台帳・停止の解除・出荷の PR のすべて。外部確認者は記録の中身の判定材料を持たない(ADR-0070 `:53` と同じ構造)。停止の解除の取り込みが外部確認者の応答待ちになる(第7章 7.11 の解除の時点が他者の都合に依る) |
| 1名+外部確認者で AI 専用のアカウントを持つ | team | 1件 | AI のアカウントが PR を開けば本人が承認できる(`recording.md:98` の想定)。ただしテンプレートは AI 専用アカウントを前提にした構成の手順を持たず、認証情報の共有の場合を「事務として開示」で受けるだけ(`recording.md:101`、README `:92`) |
| 2名・相互 | team | 1件 | 記名者 A の AI が A のアカウントで PR を開くと、承認は B。B は A の例外承認・解除の対象の作成者(判定される側)であることが多い。逆に B が「承認した者: A」と書いた台帳の行を B のアカウントで出すと、A の承認が要る。**この残る承認が、自己の例外の差し込みを止める唯一の人の門になっている** |
| 規制業 | regulated | 2件 | 必ず1名以上は記名者以外。条項を降ろす手段がテンプレートの側に無い |

## 6. 穴・矛盾

### H-1【高】出荷の PR の「出荷判定者本人の承認」が GitHub で成立しない

- README `:79`「承認者: 出荷判定者本人」、`:81`「PR は出荷判定者が開きます」。`ship-evidence.yml:29,245,257-259` も、出荷判定者が quick_pull の URL から PR を開き、出荷判定者が承認すると案内する。`template/README.md:142` も「出荷判定者本人が承認してマージします」
- PR の作成者は自分の PR を承認できない(外部で確かめる。内部の傍証は `ci-gates.md:652`、`G-4.md:22` の COMMENT の扱い)。`team.json` 以上では、出荷判定者以外の承認が必ず要る
- 結果: 手順どおりに進めると、出荷の PR は常に「記名者以外の承認(事務)」になるか、マージできない。IMPL-0128 の照合では、出荷判定者の G-7 の様式は records ブランチの push で裏づけられるため欠落にならないが、文書は成立しない手順を「記名者本人の操作」として書いている。#380 の議論の前に事実として確かめ、文言を直す必要がある
- 回避の候補(議論の材料): 出荷判定者以外(例: ship-evidence を起動した人、AI 専用アカウント)が PR を開く。ただし `GITHUB_TOKEN` では PR を作れず、作れても検査が起動しない(`ship-evidence.yml:37-43`)。PAT は採らない(同 `:42`)

### H-2【高】条項を字義どおり降ろすと、台帳と停止の解除の統制が消える

- `ci-gates.md:153` の理由(判定される側が台帳へ自分の例外を足せないように)と `check-pr.mjs:529`(同じ PR で足した記録は数えない)は、**基底ブランチへ入る前に誰かの承認がある**ことを暗に前提にしている。PR の時点の照合は名前だけ(`ci-gates.md:169`、`check-pr.mjs:464`)で、記名者本人の操作を確かめない
- 条項(`gate-criteria.md:107`)が求める裏づけ(記名者本人の操作)は、G-7 の集約で事後に開示されるだけ(IMPL-0128)。しかも台帳の行は IMPL-0128 の照合の対象外(§4)
- したがって、承認の要件だけを外す解決(パス単位の免除、bypass、records への移設)は、PR の時点で「判定される側が自分の例外・解除を書いて自分の PR を通す」経路を開く。条項の停止の申し立ては `impl-no-adopter.yaml:20` の登録簿(7.11)に当たり、採用者任せにもできない型の統制である
- 条項の「課さない」は ADR-0057・ADR-0067 の一般化として置かれたが(ADR-0070 `:96`)、層1 の改版や判定の様式と、**PR の合否を左右する材料(台帳・解除)**とでは、記録の機能が違う。ADR-0070 は後者を「現行どおり基底へ先に」(`:98`)として残しただけで、残る承認の役割を論じていない

### H-3【中】IMPL-0124 の降ろし先と、undelivered の意味がずれている

- IMPL-0124 の降ろし先は `rulesets`(`gate-criteria.md:132`)。現行の README は「残る承認の承認者は記名者本人」と誘導しており(README `:91`)、注記も「/gate と CODEOWNERS で降ろす」とする。しかし `team.json` は `require_code_owner_review: false` で、CODEOWNERS の行は雛形のまま無効(CODEOWNERS `:56-59`)。誘導層も既定では効いていない
- plan の扱い: `plan=adopter` は形式上可能(第4章「判定の成立」は `src/data/impl-no-adopter.yaml:12-22` の登録簿に無い)。ただし突合 F-9 の裁定は「採用者にも手段が無い」として adopter を退けた(`research/integration-321/crosscheck.md:186`)。`adopter` には `decision=` の記録が要る(`src/content/docs/community/implementation-marking.md:57,129,134`)

### H-4【中】ADR-0057 の先例(層1 の改版に PR を課さない)と、直接の push を止めるルールセットの組

- ADR-0057 `:509` は層1 の改版を「記録だけのコミット」として PR を課さない。CLAUDE.md の索引も「PR を経ずにコミットする場合…記録だけのコミットには要らない」とする(`template/CLAUDE.md` のブランチとコミットの節)
- ところが `checks-only.json` を含むすべての既定ブランチのルールセットが直接の push を止める(README `:23`)。準拠テンプレートでは、層1(`docs/quality-assurance-policy.md`)・D-0・台帳の改版も必ず PR を経て、`team.json` 以上では承認 1 件が要る。IMPL-0124 の「残る承認」は記録 PR に限らず、`RECORD_PATHS` 全体(`aggregate-evidence.mjs:1278`)に及ぶ。README `:87` の列挙(出荷の PR、停止の解除、台帳)は狭い

### H-5【中】「記録だけ」の範囲が条項と集約でずれている

- 条項の対象は「判定記録だけのコミット」(`gate-criteria.md:107`)。集約の「記録だけの PR」は `RECORD_PATHS` で、層1・D-0・構成書・導入前の検証の記録・`PROCESS-PROFILE.md` まで含む(`aggregate-evidence.mjs:1266-1278`)。層1 の改版や D-0 は判定記録ではない(層1 は記名による文書、D-0 は体制図)
- パス単位の免除がもし作れたとしても、どの範囲を免除するかの定義が標準とテンプレートで一致していない。免除の範囲を `RECORD_PATHS` に合わせると、層1 の改版(統制の弱化になりうる)も承認無しで入る

### H-6【低】EV-0111 の差し替え条件が、この Issue の論点を測らない

- 差し替え条件は「記名者以外の者が記録を書き換えた事象の件数」(`gate-criteria.md:118`)。#380 の論点は、承認を外したことで記名者以外が**新たに記録を足した**(自己の例外・解除)かどうかであり、書き換えではない。追記は git の履歴で「書き換え」として検出されない
- EV-0115(ADR-0070 `:203-208`)の「第三者承認の廃止が形骸化の抑止になる」も、台帳・解除の PR では第三者承認は廃止されていないため、測りようがない

### H-7【低】AI の担い手のアカウントの前提が、構成に無い

- `recording.md:98` の手順は「AI の担い手が push し PR を開く」ことで記名者が承認できる形を作るが、それが成り立つのは AI の担い手が記名者と別のアカウントを持つときだけ。`/process-init` の8問に、AI の担い手のアカウントを別にするかの問いがあるかは未確認(本調査の範囲外)。認証情報の共有は「事務として開示」で受ける(`recording.md:101`)ため、既定の利用(Claude Code が本人の gh 認証で動く)では常に開示側に落ちる可能性が高い

## 7. 選択肢の材料(決めること a〜c への対応)

議論の材料であり、採否はしない。

### (a) テンプレートで解消する手段

| 案 | 内部の制約 | 突合 |
| --- | --- | --- |
| a1 台帳・解除を records ブランチへ移し、check-pr が records を読む | records は書き込み権限者と `GITHUB_TOKEN` が追記できる(EV-0185、IMPL-0353 未達)。PR の時点で記名者本人の操作を確かめない限り、H-2 の経路が開く。ADR-0078 / `ci-gates.md:153` の理由と衝突 | #379 の結論に依存 |
| a2 a1 + check-pr が記名者本人の署名コミット(アカウントに結び付いた検証)を PR の時点で確かめる | `records.mjs:307` の署名の検証が、署名の鍵と名簿のアカウントの結び付きまで確かめるかは未確認。`records-signed.json` は規制業・CL2 以上だけ。署名の普及が1〜2名で現実的か | IMPL-0128 の「弱い裏づけ」(`records.mjs:309-310`)を PR の時点の合否に使えるかが論点 |
| a3 例外承認・停止の解除の受け皿を、**対象の PR 上の記名者本人のレビュー**(宣言行つき)へ広げ、check-pr が API で読む | 第4章 `:99` と ADR-0070 `:77` が例外承認・解除の受け皿を様式に限る → **条項の見直し(c)を伴う**。作成者本人でも COMMENT は出せる(`G-4.md:22`、`ci-gates.md:652`)ので1名でも成立する。レビューの本文は編集できるが、record-copy がマージ時に写す(`record-copy.yml:4-6`)。記録だけの PR が台帳・解除について消える | ADR-0070 決定3 の受け皿の限定、7.3 の台帳への記録の要求との整合が要る |
| a4 Bot / App の bypass で記録だけの PR を通す | ADR-0070 決定7(`:100-102`)・README `:37` が既定として退けた。組織の選択としては `state:needs-platform` で可 | 既定にはできない |
| a5 出荷の PR を出荷判定者以外が開く(H-1 の是正) | `GITHUB_TOKEN` は不可、PAT は不採用(`ship-evidence.yml:37-42`)。AI 専用アカウントなら可 | 条項に触れない是正 |

### (b) 採用者の実装(plan=adopter)

- 形式上は可能(§6 H-3)。ただし crosscheck の裁定は「採用者にも手段が無い」(`crosscheck.md:186`)。採用者が取れる手段は a4(bypass)だけで、これは統制の弱化として記録する経路(ADR-0070 決定7)。adopter にすると「既定ではない構成を採用者に勧める」形になる

### (c) 条項の見直し

- 論点1: 条項の対象を、判定の成立に関わらない記録(様式・写し)に限り、**PR の合否の材料になる記録(台帳・停止の解除)は対象外**と明記するか(H-2)。現行は「現行どおり基底へ先に」とだけあり、残る承認の役割を書いていない
- 論点2: 残る承認を「事務」と呼び続けるか、「材料の取り込みの統制」と位置づけるか。後者なら IMPL-0124 は台帳・解除について undelivered ではなく、意図した状態になる
- 論点3: 「記録だけ」の範囲を標準と `RECORD_PATHS` で揃える(H-5)
- 論点4: EV-0111 の差し替え条件に「記名者以外による追記」を足すか(H-6)

## 8. research/integration-321 の該当箇所

- `research/integration-321/conflicts.md:103`: main が足した節(EV-0111、IMPL-0124・0125・0128)を保った
- `conflicts.md:120`: IMPL-0124〜0129 を #314 の規約に合わせた
- `conflicts.md:129`: 「判定記録を基底ブランチへ入れる操作」の「遅くとも G-7」「強制層を縮小しない」に独立のマークが無かった(後に IMPL-0355・0356 で補った。`src/data/impl-inventory.yaml:541-550`)
- `conflicts.md:130`: IMPL-0124 を `plan=scheduled issue=360` とした。「準拠テンプレートでは解消できない可能性があり、`adopter` か条項の見直しが正しいかもしれない」
- `research/integration-321/crosscheck.md:110-113`(F-9【低】): #360 はテンプレートの欠けの一覧で、GitHub の機能の欠けを降ろす計画として適切か要確認
- `crosscheck.md:186`(未解決2 の推奨): records ブランチで記録の大半は満たしている。残るのは台帳・停止の解除と出荷の PR の承認 1 件。#360 では解消できず、`adopter` も当たらない(採用者にも手段が無い)。専用 Issue を起こし、条項の見直し(残る承認を事務として開示する現行の文で足りるか)を会議体の論点にする
- `research/integration-321/decision.md:21`: IMPL-0124 を #360 に付けず、後継の Issue へ付ける。`:39-40` 後継の Issue の一覧
- 付け替えの記録: `research/triage-370-401.md:33-35`(IMPL-0124 は #380 へ付け替え済み、関連 ADR-0070・EV-0111・ADR-0090・#360)

## 9. 外部で確かめる事項(survey-github へ)

1. PR の作成者が自分の PR を承認できないこと(H-1 の前提)。ルールセットの `required_reviewers`(ファイルのパターンごとの必須レビュアー)などの新しい規則が、免除ではなく追加の要件しか作れないこと
2. `bypass_mode: pull_request` の bypass actor が、PR を経たマージだけを素通りさせる挙動と、それを記録だけの PR に限れるか
3. 署名コミットの検証結果(`verification.verified`)が、署名者のアカウントを API で返すか(a2 の成否)
