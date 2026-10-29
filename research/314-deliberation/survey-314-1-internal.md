# #314 内部調査 1: 実装マークの検査の手段と、降りていない規定

- 調査日: 2026-10-24(ブランチ `work/314`。コミットせず、本ファイル以外を変えていない)
- 対象: `src/content/docs/` の全 `<!-- impl ... -->`、`scripts/check-impl.mjs`・`scripts/lib/impl-inventory.mjs`・`scripts/check-skill-provisions.mjs`、`src/data/impl-targets.yaml`、`template/`(準拠テンプレート)
- 集計の方法: 作業領域の node スクリプトで全 `.md`/`.mdx` を読み、`<!-- impl IMPL-NNNN ... -->` を属性ごとに分解した(コードブロック内と規約の見本 `community/implementation-marking.md:42` は除外)。結果は台帳の自動生成値(`community/implementation-ledger.md:50-55`)と一致した
- 本書は事実と選択肢を並べる。推奨はしない

---

## 1. 実装マークの規約と ADR-0061

### 1.1 属性と `check` の値

- 属性の規則: `community/implementation-marking.md:47-53`。`check` は「`machine`・`presence`・`manual` のいずれか。新しく付けるマークには必ず書く」(同:51)
- 値と意味(同:60-65、ADR-0061 `adr/0061-check-means-on-implementation-marks.md:31-34`)

| 値 | 台帳の表示 | 意味 |
| --- | --- | --- |
| `machine` | 機械が確かめる | 機械が規定の中身を検査し、違反を止めるか件数で出す |
| `presence` | 実在だけ確かめる | 記録・欄・ファイル・キーの有無まで |
| `manual` | 人が確かめる | 機械は確かめない。確かめる者と時点を `note` に書く |
| (なし) | 未分類 | 検査の手段を棚卸ししていない |

- 付随の規則(implementation-marking.md:67-69): `state` の値は増やさない/`check` 欠落で検査を落とさない(件数を出す)/`machine` は「違反を検出することを実行して確かめた規定に限る」
- ADR-0061 決定3(同:44-46): 既存のマーク(2026-10-13 時点で 103 件)の棚卸しは「今回行わない」。規約の注記も同旨(implementation-marking.md:71-73)
- ADR-0061 影響(同:61): `check=machine` の真偽を機械は確かめない。(同:62): 台帳の「降りていない規定」の定型文は変えておらず、一部だけ降りた規定を `undelivered` と書いた既存マークと「合っていないまま。棚卸しの中で扱う」→ 8章

### 1.2 マークを検査するスクリプト

| スクリプト | 所在 | 確かめること |
| --- | --- | --- |
| `scripts/check-impl.mjs`(`npm run lint:impl` / `impl:write`。`package.json:18-19`) | `collect` 101-150 | 書式、`target`・`state`・`note` の欠落、`state` の値、`check` の値(129-131。**値が3つ以外なら失敗。欠落は失敗にしない**)、`target` の登録、`planned` を `delivered` で使うこと(`plannedProblem`) |
| 同 | `verifyTargets` 160-214 | `config-key` はサンプル回答(176-186)から構成を生成してキーの存在を確かめる。`template-file` はファイルの存在だけ(200-203)。`planned` は確かめない(204-205)。登録簿の `check`(検査のスクリプト名)が `template/scripts/gate/` に在るかだけ(210-212) |
| 同 | `countChecks` 217- | 手段ごとの件数(未分類を含む)を台帳へ |
| `scripts/lib/impl-inventory.mjs` | `renderUndelivered` 368-384 | 台帳の「降りていない規定」の節と定型文(379) |
| `scripts/test-check-impl.mjs`(`npm run test:impl`。`package.json:27`) | — | 陽性対照。棚卸しの区分の不正などを試す。**`check` の値が不正なマークで落ちることの陽性対照は見当たらない**(`check=` の出現は見本の2行 39・48 だけ) |

- 要点: `check-impl.mjs` は「降ろし先の実在」までを機械で確かめる。降ろし先の**中身**が規定を実現しているかは見ない(規約の「限界」の表 implementation-marking.md:186-192 の右列「降ろし先の中身が規定を実現していること(`check` で開示する)」)

### 1.3 `impl-targets.yaml` の種別

規約が定める種別は3つ(implementation-marking.md:79-83、`check-impl.mjs:196-208`)。登録数は `src/data/impl-targets.yaml` から数えた。

| 種別 | 意味 | 機械の確認 | 登録数 |
| --- | --- | --- | --- |
| `config-key` | 生成する `process.config.json` のキー | サンプル回答で生成しキーの存在 | 8 |
| `template-file` | テンプレートのファイル | ファイルの存在 | 46 |
| `planned` | まだ無い実装 | 確かめない(`undelivered` 専用) | 6(pre-review-automation, seeded-error-isolation, seeded-error-scan, seeded-error-drill, agent-run-record, deploy-workflow) |

- 計 60 件。登録に任意の `check`(検査のスクリプト名)を持つのは 19 件。台帳の「検査のスクリプト」列はこの値で、**マークの `check` 属性とは別物**(同じ語で2つの意味がある)

---

## 2. 定量の棚卸し

### 2.1 全体(マーク 304 件。識別子は IMPL-0001〜0311、欠番は 0104 だけ)

| state \ check | machine | presence | manual | 未分類 | 計 |
| --- | --- | --- | --- | --- | --- |
| delivered | 54 | 46 | 19 | 90 | 209 |
| undelivered | 0 | 1 | 84 | 10 | 95 |
| 計 | 54 | 47 | 103 | **100** | 304 |

- 台帳の表示(implementation-ledger.md:50-55、59)と一致
- 降ろし先の種別ごと: `template-file` 250、`config-key` 29、`planned` 25。`undelivered` 95 件のうち、`planned` を指すのは 25 件。残る **70 件は実在する降ろし先を指す**(その降ろし先に規定が無い、または一部だけある)

### 2.2 降ろし先 × state/check(d=delivered, u=undelivered, -=未分類)

| target | 件数の内訳 |
| --- | --- |
| evidence-aggregation | d/- 26, d/machine 8, d/presence 2, d/manual 1, u/manual 12, u/- 7(計 56) |
| claude-md | d/- 13, d/presence 6, d/manual 2, u/manual 10(計 31) |
| pr-checks | d/- 6, d/machine 6, d/presence 3, u/manual 3, u/- 1 |
| gate-record-template | d/- 8, d/presence 3, d/manual 1, u/manual 2 |
| pre-review-automation(planned) | u/manual 11 |
| adoption-trial | d/machine 1, d/presence 3, d/manual 2, d/- 2, u/manual 3 |
| config-change-log | d/machine 3, d/- 5, u/manual 1 |
| next-role | d/machine 5, d/- 4, u/manual 1 |
| d0-template | d/machine 1, d/presence 2, d/- 5 |
| gate-skill | d/presence 4, d/manual 2, d/- 1, u/manual 2 |
| seeded-error-drill(planned) | u/manual 7 |
| config-seats | d/- 4, u/manual 2 |
| process-change-skill | d/machine 1, d/- 4 |
| claude-md-resident | d/presence 4, d/machine 1 |
| self-heal | d/machine 4, u/manual 1 |
| spec-lint / gate-contract | d/machine 4 / d/machine 4 |
| config-roles | d/machine 2, d/- 1, u/manual 1, u/- 1 |
| autonomy-derivation | d/machine 3, u/manual 1 |
| agent-settings | d/presence 3, u/manual 3 |
| defect-ledger-template | d/manual 2, d/presence 1, u/manual 1 |
| その他(各 1〜3 件) | rulesets u/manual 3, seeded-error-isolation u/manual 3, implement-skill d/manual 3, ai-review-workflow u/manual 3, profile-generator d/machine 2・d/presence 1・u/manual 1, decisions-check d/machine 2・u/manual 1, coverage-check d/machine 2・u/manual 1, gate-g5-workflow d/manual 1・d/presence 1・u/manual 1, config-delegation d/presence 1・d/- 1・u/- 1, debt-ledger-template d/- 2, project-brief-template d/- 2・d/presence 1・u/manual 1, process-profile d/manual 2, guard-write-hook d/presence 2, ai-sla-template d/presence 2, g5-adapter u/manual 2, deploy-workflow u/manual 2, pr-template d/presence 1・u/manual 1, incident-artifact d/presence 1・d/manual 1, delegation-workflow d/presence 1・u/presence 1, config-unmet d/machine 1・d/- 1, gate-skill-g6 d/- 1・u/manual 1, 以下1件ずつ: handover-template d/-, qa-policy-template d/-, templates-index d/-, principles-template d/presence, adr-template d/presence, feature-spec-template d/presence, task-breakdown-skill d/presence, size-observation d/machine, config-standard d/machine, config-gates d/machine 2, config-deviations d/-, context-drift-workflow d/manual, g5-local d/manual, ship-evidence-workflow u/manual, agent-run-record u/manual, seeded-error-scan u/manual |

### 2.3 `check` の無いマーク(未分類 100 件)

識別子の下4桁。`u` は `undelivered`。

| target | 識別子 |
| --- | --- |
| evidence-aggregation(33) | 0032,0039,0040,0041,0050,0051,0054,0055,0061,0063,0064,0065,0071,0072,0073,0075,0077,0083,0084,0088,0091,0093,0094,0095,0096,0100,0023u,0042u,0043u,0044u,0045u,0046u,0048u |
| claude-md(13) | 0004,0007,0012,0014,0015,0017,0019,0021,0024,0030,0031,0074,0085 |
| gate-record-template(8) | 0008,0009,0011,0016,0052,0068,0079,0080 |
| pr-checks(7) | 0049,0059,0062,0078,0092,0099,0102u |
| d0-template(5) | 0029,0053,0056,0060,0067 |
| config-change-log(5) | 0022,0033,0034,0036,0037 |
| next-role(4) / process-change-skill(4) / config-seats(4) | 0003,0005,0087,0090 / 0028,0097,0101,0103 / 0020,0025,0082,0089 |
| project-brief-template(2) / debt-ledger-template(2) / adoption-trial(2) / config-delegation(2) / config-roles(2) | 0057,0069 / 0018,0038 / 0076,0081 / 0098,0026u / 0001,0086u |
| 各1件 | handover-template 0066, qa-policy-template 0070, templates-index 0058, gate-skill 0010, gate-skill-g6 0027, config-deviations 0002, config-unmet 0006 |

- 範囲: IMPL-0001〜0103 にほぼ集中(ADR-0061 採用前のマーク)。採用後の最大番号の未分類は 0103
- 降ろし先の登録の検査スクリプトで分けた内訳: `aggregate-evidence` 45、`check-process-rules` 15(claude-md 13 + config-key 2)、`verify-gate-contract` 17(config-key 13 + template-file 4)、`check-d0` 5、検査スクリプトの登録なし 18
- 未分類の `undelivered` 10 件(0023, 0026, 0042〜0046, 0048, 0086, 0102)は、`state` で既に「降りていない」と表示しており、`check` の欠落は台帳の件数だけに効く
- `check` の値が3つ以外のマーク: 0 件(検査が落とすため)

### 2.4 `delivered` かつ `manual`(19 件)

| 識別子 | target | 所在 | 機械が確かめないこと(note の要旨) |
| --- | --- | --- | --- |
| 0107 | gate-record-template | gate-criteria.md:219 | 受入基準の版の識別子と確定後の変更 |
| 0152 | gate-skill | gate-criteria.md:429 | G-4 基準6 の判定(一覧は出す) |
| 0232 | g5-local | gate-criteria.md:472 | 手元の結果を判定記録へ貼る運用 |
| 0263 | evidence-aggregation | gate-criteria.md:812 | (承認の版の照合。note は機械の処理を述べる。`manual` の根拠は gh の制約) |
| 0265 | adoption-trial | gate-criteria.md:814 | env-check を採用者が実環境で実行 |
| 0247 | gate-g5-workflow | gate-criteria.md:1456 | `pull_request` を branches で絞る変更 |
| 0294 / 0295 | defect-ledger-template | human-ai-boundary.md:200/214 | 記録を書いたか(内部監査 観点23) |
| 0165 | adoption-trial | human-ai-boundary.md:688 | 個人単位の率を算出していないこと |
| 0172 / 0176 | claude-md | human-ai-boundary.md:787/872 | 記入者、モデルの版を書いたか |
| 0173 | gate-skill | human-ai-boundary.md:797 | 検査を足す側が守る規定 |
| 0181〜0183 | implement-skill | human-ai-boundary.md:905-907 | 文脈を分けたこと、テストに実装を渡さないこと、十分性の判定 |
| 0105 / 0108 | process-profile | roles-responsibilities.md:575 / tailoring-guide.md:480 | 草案を作らないこと、S0 の省略の前提 |
| 0226 | context-drift-workflow | roles-responsibilities.md:1243 | 必須チェックへ加えられていないか |
| 0292 | incident-artifact | incident-response.md:123 | 欠陥の台帳へ写したか |

- いずれも「降ろし先に文がある」ことで `delivered`、「中身を人が確かめる」ことで `manual`。規約上は矛盾しない(state と check は独立。implementation-marking.md:67)
- 逆に `undelivered` かつ `presence` が 1 件: IMPL-0235(ci-gates.md:825。委任のワークフロー。note は「要求事項1〜6 を delegation.yml と check-delegation.mjs が実装する」で始まり、実環境での確認が無いことが `undelivered` の理由)

### 2.5 `machine` のうち note に実行の裏づけを書いていないもの

- `machine` 54 件のうち、note に試験(`test-*`・「固定」・「実行して」)を書くのは 35 件。書いていない 19 件: 0106, 0131, 0139, 0140, 0147, 0157, 0233, 0260, 0261, 0273, 0275, 0276, 0284〜0289, 0293
- 規約(implementation-marking.md:69)は「実行して確かめた」ことを要件とするが、その記録の置き場を定めていない。上の 19 件は記録が無いことを意味しない(調査では試験の所在まで追っていない)

### 2.6 note と降ろし先の食い違い(10 件を抽出して確かめた)

| # | 識別子 | note の主張 | 降ろし先で確かめた事実 | 判定 |
| --- | --- | --- | --- | --- |
| 1 | 0007(claude-md, d/-) | 受信箱の限定を CLAUDE.md に置く | `template/CLAUDE.md:98`「自分のロールの受信箱だけを見る」 | 一致 |
| 2 | 0085(claude-md, d/-) | 構成依存部分と next.mjs に dedicated-qa の規則 | `generate-profile.mjs:3168-3174`(生成区間)、`next.mjs:823-835` | 一致 |
| 3 | 0176(claude-md, d/manual) | Co-Authored-By にモデルの名称と版 | `template/CLAUDE.md:151-` の「ブランチとコミット」に記載 | 一致 |
| 4 | 0232(g5-local, d/manual) | 出力に証跡にならない旨 | `g5-local.mjs:16` 冒頭注記に記載(出力文は未確認) | 概ね一致 |
| 5 | 0247(gate-g5-workflow, d/manual) | `pull_request` を branches で絞らない | `gate-g5.yml:12-17` に branches なし | 一致 |
| 6 | 0292(incident-artifact, d/manual) | AI 起因などを欠陥の台帳へ写すと書く | `.claude/skills/artifact/artifacts/incident.md:34,45,50` | 一致 |
| 7 | 0105(process-profile, d/manual) | 草案を作らない文を PROCESS-PROFILE.md に出す | `generate-profile.mjs:2731` | 一致 |
| 8 | **0209**(claude-md, u/manual) | 「拒否が0件だから安全」の禁止が CLAUDE.md とスキルに**無い** | `.claude/skills/human-verify/SKILL.md:71`「『拒否が0件だから安全である』と記録してはなりません」(テンプレート独自の印つき)、同:20 の表。テンプレート初版(2026-08-08)から在る。マークの追加は 2026-10-23(#292) | **食い違い**(スキルには在る。CLAUDE.md には無い) |
| 9 | 0206(claude-md, u/manual) | 操作の要約を AI に生成させない規則が CLAUDE.md とスキルに無い | `human-verify/SKILL.md:3,10,18,21`「結論・評価・要約は生成しない」「『想定内の操作でした』という所見」を出さない | 一部食い違い(スキルに近い規則が在る。射程が同じかは要確認) |
| 10 | 0222(claude-md, u/manual) | 指示資産の分量の上限の規則も検査も無い | `scripts/gate/recalibration-registry.json:59` に「RC-07 コンテキストの目安(CLAUDE.md 200行・6,000トークン)」の登録は在る。規則・検査は無い | 一致(定数の再評価の登録だけ在る) |
| 11 | 0120(evidence-aggregation, u/manual) | 表明の様式の出力は無い。件数は構成と集約から読める | `aggregate-evidence.mjs:3082-3083`「文そのものは出さない(IMPL-0120)」。#313 で述べられる名・版・逸脱の一覧は出力に加わった(同:3099-3113、3633-3637) | 一致。ただし note(#306 時点)は 1.10.2 の現行の併記事項(版・逸脱と列挙に無い離脱の一覧)に触れていない |

- 抽出外の補足: 未分類の `undelivered` のうち note が「一部だけ実装」を述べるもの(語「だけを確かめ」「一部」「留まり」等で拾った)は少なくとも 12 件: 0023, 0026, 0042, 0043, 0046, 0209, 0212, 0235, 0246, 0252, 0256, 0283

---

## 3. 降ろし先 `claude-md` の検査

### 3.1 仕組み

- 登録: `impl-targets.yaml:73-78`(`claude-md`。path `CLAUDE.md`、check `check-process-rules`)、`impl-targets.yaml:190-195`(`claude-md-resident`。「節の中の個々の行の有無は確かめない」と明記)
- `template/scripts/gate/check-process-rules.mjs`(CI: `template/.github/workflows/gate-entry.yml:36-37`)
  - 生成区間(`<!-- generated:process-rules start -->` 〜 end。`generate-profile.mjs:3033`)は、`renderProcessRules(config)`(`generate-profile.mjs:3104`)の出力と**全文一致**で比べる(`check-process-rules.mjs:52-55`)
  - 区間の外(常駐の規則)は `missingResident`(`check-process-rules.mjs:78`)だけ
- `template/scripts/gate/claude-md-resident.mjs`
  - `parseSections`(25-45): `##`・`###` の見出しごとに `hasBody` を持つ。**空行でもコメントだけでもない行が1行でもあれば `hasBody = true`**(42)
  - `missingResident`(66-80): 一覧(`claude-md-resident.json`。2・3 段の見出し 16 節)の各節について、見出しが無い → `absent`、本文が無い → `empty`。**行の内容は比べない**
  - 冒頭注記(8-9)「節の中の個々の行(1行が1つの規則)の有無は確かめません」。成功時の出力も同旨(`check-process-rules.mjs:100`)

### 3.2 節の中の行を消しても通ること(コードからの推論。リポジトリは変えていない)

- 例: `template/CLAUDE.md:54-` の「### 行ってはならない作業」の表から、行「| 3 | テストの失敗を、テスト側の変更で解消する | …」を削除する
  1. 見出し `### 行ってはならない作業` は残る → `found` に `3:行ってはならない作業` がある(`claude-md-resident.mjs:67-71`)
  2. 表の見出し行・他の行が残る → `hasBody = true`(同:42)
  3. `absent`・`empty` とも空 → `check-process-rules.mjs:79` の分岐に入らず、exit 0(同:96-101)
- 極端な場合、節の本文を任意の1行(例: `x`)に置き換えても通る
- 生成区間は全文一致なので、区間の中の行の削除は検出される

### 3.3 未分類の claude-md 13 件の置き場所

| 識別子 | 規則の所在(`template/CLAUDE.md`) | 区間 |
| --- | --- | --- |
| 0024 / 0014・0015 | 45 / 47(人へ戻す3つの場合) | 常駐 |
| 0019, 0030, 0031, 0021 | 81, 86, 88, 90(判断の確定と委任) | 常駐 |
| 0007, 0012, 0004 | 98, 101, 104(受信箱とラベル) | 常駐 |
| 0074 | 116(停止の申し立て) | 常駐 |
| 0017 | 127(標準の条項を課すとき) | 常駐 |
| 0085 | 生成区間(`generate-profile.mjs:3168-3174`) | 生成(全文一致で検査) |

- 12 件は常駐の規則で、機械の確認は「節の見出しと1行以上の本文」まで。0085 だけが生成区間で、構成との全文一致を検査される
- 同じ降ろし先で既に `presence` と書かれたもの(0146, 0153, 0154, 0158, 0185, 0251)も、検査の実態は上と同じ(行そのものの存在は確かめていない)。規約の `presence` の定義「記録・欄・ファイル・キーの有無」(implementation-marking.md:63)に照らすと、「行の有無」も確かめていない点で定義より弱い

### 3.4 選択肢(列挙のみ)

- A. 常駐の規則の行ごとに識別(行の鍵や IMPL 番号)を持たせ、行の存在を検査する
- B. 検査は節の単位のままとし、常駐の規則のマークを `presence` より弱い区分として開示する(新しい値を足すか、`manual` とする)
- C. 規則を生成区間へ移し、全文一致の検査の下に置く(案件が CLAUDE.md を編集する余地とのかね合い)
- D. 現状を維持し、note と台帳で「節の単位」と開示する

---

## 4. 第4章 G-5 基準6

### 4.1 本文

- `phase4-process-design/gate-criteria.md:454` 「| 6 | 文脈ファイルの形式検査 | リポジトリ内の参照切れ 0 件。1ファイルの分量の上限超過 0 件(第3章 3.11.4) |」
- 同:458 基準6 にコードと文脈の乖離を含めない(四半期の棚卸しで扱う)
- 同:460 「基準6 の分量の上限は、準拠テンプレートへ降りていません」(上限の規定 3.11.4 要求事項1 = IMPL-0222 と G-5 のジョブの両方が無い)。**参照切れの側には触れていない**
- 同:468 判定基準を実装する検査を必須の集約から外して基準を外してはならない(第8章の調整による場合だけ)。同:569 文書のみの変更でも基準6 の省略を「認めない」
- 上限の規定: `roles-responsibilities.md:1178`(3.11.4)、IMPL-0222(同:1190, claude-md, u/manual)

### 4.2 Issue の記述との差

- Issue(2026-10-12 起票)は「実装も実装マークも無い」とする。その後 #296 のコミット dde0335(2026-10-23)で **IMPL-0269** が付いた(`gate-criteria.md:462`。target `gate-g5-workflow`、u/manual)。note: 基準6 のジョブは無く、契約検査は注意として出す(IMPL-0142)
- 出どころは `research/302-310-deliberation/implementation-C.md:330,433`(スキル G-5.md に行を足し、実装マークは C-5 の棚卸しへ送った)

### 4.3 テンプレートに在るもの

| 所在 | 内容 |
| --- | --- |
| `template/.github/workflows/gate-g5.yml` | ジョブ: config, contract, test, static-analysis, spec-lint, ip-clearance, secret-scan, dependency-diff, pr-rules, gate-g5(集約)。基準6 のジョブは無い |
| `template/scripts/gate/g5-aggregate.mjs:21,124` | 基準とジョブの対応から基準6 を外し、「基準6 を実装するジョブは、このテンプレートにありません。採用者が足し、集約の needs へ入れます」を注意として出す |
| `template/scripts/gate/test-g5-aggregate.mjs:31` | 上の注意が出ることを試す |
| `template/.claude/skills/gate/gates/G-5.md:15` | 基準6 の行「このテンプレートの CI は検査しない。…採用者が足す」 |
| `template/evidence/quality-report.md:112` 等 | 集約の出力に「基準6 はこのテンプレートの CI に無い」 |
| `template/.github/workflows/context-drift.yml` | 週次で更新の止まった文脈ファイルを Issue へ記録するだけ。必須チェックではない(冒頭 1-5)。参照切れ・分量は見ない |
| `template/scripts/gate/recalibration-registry.json:59` | RC-07「コンテキストの目安(CLAUDE.md 200行・6,000トークン)」の登録(能力依存の定数の再評価。検査ではない) |

- 参照切れ(リポジトリ内のリンク)の検査はテンプレートに見当たらない(`参照切れ` の検索で G-5.md の行以外に該当なし)。本リポジトリ側のリンク検査(PR #322、lychee)は外部リンクで、テンプレートの基準6 ではない

### 4.4 選択肢(列挙のみ)

- A. 参照切れの検査(リポジトリ内のリンク)と分量の上限の検査をテンプレートの G-5 に足し、集約の needs へ入れる(上限の値は 3.11.4 の決定が要る。IMPL-0222 と連動)
- B. 参照切れだけを先に降ろし、分量は 3.11.4 の決定を待つ
- C. 降ろさず、テンプレートが G-5 基準6 を満たさない事実を開示し続ける(現状)。その場合、gate-criteria.md:460 の文が参照切れを書いていない点の扱い
- D. 基準6 そのものを見直す(条項の改廃。調査・会議体を要する)

---

## 5. 降りていない規定の現状

### 5.1 Issue が挙げた5件

| 識別子 | 現状 | 必要なもの |
| --- | --- | --- |
| IMPL-0104 | **削除済み**(欠番)。#311 で 0284〜0289・0291 へ分割(`research/311-deliberation/implementation.md:29`)。0284〜0289 は d/machine、0291(手戻り率の集計と自動の引き下げ。human-ai-boundary.md:267)だけ u/manual。0290・0292・0293 は分割ではなく新規 | 0291: 手戻り率の算出。#348(テンプレートが手戻り率を算出しない)、#349(窓と最小標本を構成で定められない)、#350 と重なる |
| IMPL-0116 | u/manual(roles-responsibilities.md:407, config-seats)。外部の確認者を席の責任者に置く条件のうち力量の確認と書面の合意。構成に欄が無く、任免の決定者の記名だけを機械が求める | 構成または D-0 に記録の欄、契約検査での欄の確認。書面の合意は機械で中身を確かめられない(presence が上限) |
| IMPL-0117 | u/manual(roles-responsibilities.md:131, evidence-aggregation)。席の責任者でない確認者の力量の確認の記録の欄が無く、件数と「依頼した本人による確認」の区別を出さない | 名簿の人ごとの確認の記録(既存の `seats[].competence` は 3.4.3 の別物。implementation-A.md の A-13)、集約の項目1 への件数の出力 |
| IMPL-0118 | u/manual(exception-escalation.md:455)。7.9.2 の2名必須の制限は変化点の通知(`event: restriction`)の記録だけで、構成は制限中の範囲を持たず、集約は承認者の数を上げない | 制限中の範囲の構成上の表現、集約での要求承認者数の引き上げ |
| IMPL-0120 | u/manual(overview.md:417)。#313 で 1.10.2 が改まり(表の併記事項に版・逸脱と列挙に無い離脱の一覧が加わった。overview.md:399-415)、集約は述べられる名・版・逸脱の一覧を出すようになった(IMPL-0308, d/machine)。表明の文そのものは出さない(`aggregate-evidence.mjs:3083`)。#313 は IMPL-0120 を #314 へ送った(`research/313-deliberation/decision.md:7`、`implementation.md:182`) | 表明の様式(版・未達の件数・記録の欠落の件数・逸脱の一覧)を1か所にまとめた出力。note(#306 時点)の更新の要否 |

### 5.2 降りていない 95 件の全件(領域ごと)

難しさの目安: **低** = 文・様式の欄を足す程度/**中** = 既存スクリプトの拡張/**高** = 新しい仕組み・外部の基盤/**外** = テンプレートの外(採用者の基盤・社内手続)に依る。目安は note の記述からの推定で、検証していない。

| 領域 | 識別子(所在) | 目安 | 必要なもの |
| --- | --- | --- | --- |
| G-7 の集約(ci-gates.md:388-392, 746) | 0042, 0043, 0044, 0045, 0046, 0048 | 中〜高 | 負債の記録漏れの突合、引き継ぎ文書3項目の読み取り、AI 品質指標・安全適合性・類似の検知の記録の取り込み、期間の開示の実環境確認 |
| 集約・その他(evidence-aggregation) | 0023(宣言と実態), 0117, 0118, 0120, 0136(文書変更の SLA), 0145(検査の棚卸しの入力), 0159(承認時間と規模の比), 0192(第4層の走査記録), 0230(劣化の4指標), 0241(版の変わった受入基準の G-4), 0244(保持期間切れの G-5), 0246(カバレッジの取り込み), 0268(窓と最小標本) | 中〜高 | 0244・0246 は #333(証跡の保管)。0268 は #349。0230・0159 は計測の新設 |
| CLAUDE.md・指示資産(claude-md) | 0206, 0208, 0209, 0257, 0282 | 低 | 規則の文を CLAUDE.md かスキルへ置く(0206・0209 はスキルに近い文が既に在る。2.6) |
| 同(3.11.4) | 0221, 0222, 0223, 0224, 0229 | 低〜中 | 規則の文。0222・0224 は検査を伴うなら G-5 基準6(IMPL-0269)と連動 |
| 事前レビュー(planned: pre-review-automation) | 0210〜0219, 0231 | 高 | 通知・起票・所有者定義・必須ステータス・集計の仕組み一式。#325 と同じ論点 |
| 欠陥注入(planned: seeded-error-drill / -isolation / -scan) | 0161, 0164, 0168, 0193〜0195, 0197 / 0169, 0190, 0191 / 0047 | 高 | 演習ブランチ・標識の拒否・走査・停止条件。ルールセットと CI の新設 |
| 欠陥注入(adoption-trial) | 0160, 0163, 0196 | 中〜外 | 導入前の検証の設計の制約。用途の制限は機械で確かめにくい |
| PR の検査(pr-checks) | 0102(L2 の採点の稼働), 0204(検証の弱体化のラベル), 0205(計画と実変更のパス突合), 0227(指示資産の変更のレビュー) | 中 | 0102 は「検査できる条件が定まっていない」(条項側の論点)。0204・0205 は check-pr.mjs の拡張 |
| AI レビュー(ai-review-workflow) | 0155, 0253, 0279 | 中〜外 | 確認側への入力の書き出し、指摘の所在、往復の停止条件(基盤に依る) |
| エージェントの設定・記録 | 0200, 0225, 0228(agent-settings), 0207(planned: agent-run-record) | 高〜外 | 読み込みの記録(#325 後半)、既定拒否の権限、実行の識別の記録 |
| ルールセット・配備 | 0248, 0254, 0255(rulesets), 0237, 0303(planned: deploy-workflow), 0243(ship-evidence-workflow) | 中〜外 | 既定ブランチ以外へのマージの拒否、配備の資格情報、証跡の保管(#329・#333・#346) |
| G-5 | 0269(gate-g5-workflow), 0234, 0239(g5-adapter), 0259(coverage-check) | 中 | 4章参照。アダプタの入力欠落時の失敗、node 以外のカバレッジ範囲 |
| 判定の様式・スキル | 0174, 0220(gate-skill), 0175, 0252(gate-record-template), 0250(gate-skill-g6), 0256(pr-template), 0280(project-brief-template), 0135(defect-ledger-template), 0132(decisions-check) | 低〜中 | 欄・注記の追加。0175(項目の並びを周期的に変える)は様式の固定と相反 |
| 構成・体制 | 0086, 0299(config-roles), 0116, 0184(config-seats), 0026(config-delegation), 0278(profile-generator), 0309(config-change-log) | 中 | 0278 は #351。0026 は実環境の未確認。0184 は所属の欄 |
| 進行・自己修正・自律 | 0283(next-role), 0277(self-heal), 0291(autonomy-derivation) | 中〜外 | 滞留の観測と通知、消費量の計測(基盤に依る)、手戻り率(#348) |
| 委任のワークフロー | 0235(delegation-workflow, u/presence) | 外 | 実 GitHub での確認 |

### 5.3 選択肢(列挙のみ)

- 順序の軸の候補: (i) 実行主体の挙動を直接縛る規定(claude-md の 10 件)を先に、(ii) 出荷判定の根拠に効くもの(G-7 の集約)を先に、(iii) 既存スクリプトの拡張で済むもの(中)を先に、(iv) 他の Issue に既に論点があるもの(#325・#333・#348・#349・#351)はその Issue へ委ねる
- 降ろさないと決める候補: 実行の基盤に依るもの(0277, 0279, 0200, 0225 など「外」)、条項側の条件が定まっていないもの(0102)。決めた場合、`state=undelivered` を残すか、note に「課さない/降ろさない」の理由を書くか、の書き方の決定が要る(規約 implementation-marking.md:89-95 は削除しないことだけを定める)

---

## 6. ADR-0064 スキルの文の検査

### 6.1 対象と仕組み

- 規約: implementation-marking.md:211-250。ADR-0064 決定1・2(`adr/0064-skill-provisions-trace-to-standard.md:30-41`)
- 検査: `scripts/check-skill-provisions.mjs`(`npm run lint:skills`。`package.json:24`、`check` に含む)
  - 文末の正規表現 `RE_SHALL`(118-119): 「なければなりません/なければならない/[てで]はなりません/[てで]はならない」+ 文末(`。`・行末・`|`・閉じ括弧)
  - 禁止の節 `RE_PROHIBITION_HEADING`(120): 見出しに「[てで]はならない」「禁止事項」。その節の箇条書きと番号つきの表の行(181-183)
  - 印 `RE_SOURCE`(116)/`RE_LOCAL`(117)。所在の実在を `locatorProblem`(77-114)が確かめる
- 実行結果(2026-10-24): 「スキルの文: 59 ファイル、要求・禁止の文 41 件(本標準の所在つき 22 件、テンプレート独自 19 件)」。Issue の「40 件」から1件増えている

### 6.2 対象の外(規約の「検査の限界」implementation-marking.md:239-244、ADR-0064:60)

対象の外の規則の例(`template/.claude/skills/`)。

| 形 | 例 |
| --- | --- |
| 依頼の形「〜しないでください」(9 行) | `process-change/SKILL.md:10`「`process.config.json` を手で編集しないでください」、`process-change/reference/dry-run.md:21`「拒否されたら入力を書き換えて回避しないでください」、`pit/reference/handoff.md:30`「引き渡し先が分からないことを、自分で決める理由にしないでください」、`process-init/SKILL.md:101`、`pit/SKILL.md:39` |
| 平叙の否定(太字を含む) | `graft/SKILL.md:35`「`graft init` は実行しない」、`process-change/kinds/end.md:15`・`edition.md:11`「AI の名義を書かない」、`process-change/kinds/accountable.md:12`「技術判断者と AI運用担当者を同じ人にしない」、同:30「手で書かない」 |
| 平叙の肯定の手続 | `pit/reference/handoff.md:15,21`(統制の弱化は差分の一致までを確認し、許容を判断しない) |

- 太字で否定語を含み印の無い行は 48 行(grep による概数。説明文を含む)
- CLAUDE.md の禁止事項 1〜9 のうち、#5(挙動要約を AI に生成させない)は `human-verify/SKILL.md:80` で「てはなりません」形・所在つき。#7・#8・#9 はテンプレート独自
- 様式(`template/templates/`)とスクリプトの文は対象外(必須欄は `test:fields`)

### 6.3 選択肢(列挙のみ)

- A. 対象の文末を広げる(「〜しないでください」「〜しない」「〜ない。」等)。文末だけで説明文と規則を分けられない問題(implementation-marking.md:126 の「文末で作る一覧は閉じず」)
- B. スキルの規則の文を要求・禁止の文末へ書き換え、現行の検査の対象に入れる(ADR-0063 の言語形式との整合)
- C. 太字・箇条書きなど構造で拾う(誤検出の登録簿が要る)
- D. 現状を維持し、限界を開示する(規約 implementation-marking.md:243 は「手段は無い。人が突き合わせる」)

---

## 7. A-11(緩める向きの決定権の拒否)

### 7.1 在るもの

- 決定: `research/302-310-deliberation/decision.md:44`(独立レビュアの席の責任者に置いた外部の確認者に、統制を緩める向きの決定権を与えない)
- 実装: `template/scripts/gate/config.mjs:730-743` `allowedDeciders`(席が `independent-reviewer` で責任者が名簿の `external` なら、その席の責任者を決定者から外す。737)。呼び出し: `ruleDeciderProblems`(同:754)、`generate-profile.mjs:1921`(`deciderProblems` の中)、`3971`(承認待ちの宣言の保持)、`4198`(委任の宣言)、`4566`(`--change` の処理で `deciderProblems` を呼ぶ)
- 試験: `template/scripts/gate/test-roster-rules.mjs:145-160`。`allowedDeciders` を直接呼ぶ2件と、組み立てた `report` で `deciderProblems` を直接呼ぶ3件
- マーク: IMPL-0115(`roles-responsibilities.md:406`, config-change-log, **d/machine**)。note は「test-roster-rules.mjs が固定する」

### 7.2 欠けている端から端までの確認

- `/process-change` の経路は `node scripts/init/generate-profile.mjs --change <file> [--dry-run]`(`.claude/skills/process-change/SKILL.md:49,56`)。この入口から、外部の確認者の記名で独立レビュアの席を委任へ変える変化点を出し、拒否されることを確かめた試験は無い(`research/302-310-deliberation/implementation-A.md:241,383`。理由は「委任の入力一式の用意が要る」)
- 既に在る土台: `template/scripts/gate/test-edition-end.mjs:103-136` は一時の git リポジトリで `generate-profile.mjs --change change.json` を `spawnSync` で実行している(#313 の版・終了の試験)。同じ形で A-11 の入力を流せる可能性がある(未検証)
- 規約上の論点: `check=machine` の要件「実行して確かめた」(implementation-marking.md:69)を、関数の直接呼び出しで満たすと読むか

### 7.3 選択肢(列挙のみ)

- A. `test-edition-end.mjs` と同じ形の端から端までの試験を足す
- B. 関数の試験で足りると判断し、IMPL-0115 の note に「入口を通した試験は無い」と開示する
- C. `machine` の要件(関数か入口か)を規約で定める

---

## 8. 台帳の定型文と IMPL-0042・0043

- 定型文: `scripts/lib/impl-inventory.mjs:379`「次の規定は、実行層に対応する記述がありません。**案件からは『規定がない』ものとして扱われます**」。列見出しは「降ろし先(予定)」(同:381)。台帳 implementation-ledger.md:63-65
- IMPL-0042(ci-gates.md:388)「G-7 基準3。受容した負債の記録漏れの検出。台帳の有無だけを確かめており、変更との突合が降りていない」
- IMPL-0043(ci-gates.md:389)「G-7 基準4。運用引き継ぎ文書の3項目の記載の確認。文書の有無だけを確かめている」
- 実態: ci-gates.md の対応表で基準3・4 は「一部」(`debt.ledgerPresent`、`handover.updated` で有無だけ確かめる)。集約(`aggregate-evidence.mjs`)は台帳・文書の有無を出す。つまり実行層に**対応する記述はあり**、中身の検査が無い。降ろし先 `evidence-aggregation` は実在する(`planned` ではない)ので「(予定)」とも合わない
- 同じ形のマーク: 未分類の 0023, 0026, 0046, 0048、`manual` の 0120, 0209, 0246 など(2.6 の末尾の 12 件)。降りていない 95 件のうち 70 件が実在する降ろし先を指す(2.1)
- ADR-0061:62 はこの不一致を認め、棚卸しへ送っている

### 選択肢(列挙のみ)

- A. 定型文を「対応する記述が無いか、規定の一部だけがある」に改め、列見出しを「降ろし先(予定または一部)」にする(生成器の変更だけ)
- B. 一部だけ降りた規定を「降りている部分」と「降りていない部分」の2つのマークに分ける(0042: 有無 = d/presence、突合 = u)
- C. `state` に値を足す(規約 implementation-marking.md:67「`state` の値は増やさない」と ADR-0061 の改定が要る)
- D. 定型文を `planned` の行と実在する降ろし先の行で書き分ける

---

## 9. 未解決の Issue #315〜#354 との重なり(`gh api` で取得。#321・#323 は closed、#322 は PR)

| Issue | 重なる点 |
| --- | --- |
| #324 実装マークの節の棚卸し(残り 857 節) | 本 Issue の「既存マークの棚卸し」と隣接。#324 は**マークを要する節**の仕分け、本 Issue は**既存マークの `check`**。仕分けの手順(2 名の独立の分類を課すか)の論点が共通 |
| #325 事前レビューの検査と読み込みの記録 | IMPL-0210〜0219・0231(pre-review-automation)と 0225(読み込みの記録)。「実装するか、降ろさないと決めて表示を続けるか」が本 Issue の論点2と同形 |
| #326 検査スクリプトの検出漏れ | IMPL-0145(検査の棚卸しの入力)。Co-Authored-By の版の欠落の非検出は IMPL-0176(d/manual)と関係 |
| #333 出荷の証跡の保管 | IMPL-0243, 0244, 0246。受け入れ条件に「関係する実装マークを delivered にするか、undelivered のまま理由を書く」 |
| #348 / #349 / #350 手戻り率・窓と最小標本・差し戻しの数え方 | IMPL-0291, 0268(0104 の分割の残り) |
| #351 体制の人数の数え方 | IMPL-0278 の残り(10名以上の回答で名簿が空) |
| #329 G-8 の成立条件と配備の統制 / #346 配備の資格情報 | IMPL-0237, 0303(deploy-workflow) |
| #339 委任の basis.detection | IMPL-0026・0235(委任) の検査の実質 |
| #354 #313 の残り(構成が持たない離脱の欄) | IMPL-0120(表明の様式)、1.10.2 の併記事項 |
| #352 / #353 列挙に無い離脱・例外承認の開示 | 表明の併記事項(IMPL-0120)の中身 |
| #316 規定の表現形式の残り | スキルの文の検査の範囲(平叙・依頼の形)。本文側で「〜できない」約114件・平叙「〜します」約370件が未読。禁止事項の番号の重なり(テンプレート独自 7〜9 と第8章) |
| #319 回帰の fixture をリポジトリの検査へ | `machine` の「実行して確かめた」の記録の置き場(2.5)、A-11 の試験(7章)と関係 |
| #340 自己修正の始め忘れ | IMPL-0273〜0277(self-heal) |
| #317 委託の残り(指示資産の持ち主、判定の結果を受け取る者が CLAUDE.md に出ない) | claude-md の降ろし先の範囲 |
| #330 「未実施」の歯止め | IMPL-0234, 0239(g5-adapter) |
| #322(PR)リンク切れの 4xx | 本リポジトリの外部リンク検査。テンプレートの G-5 基準6(参照切れ)とは別 |
| #315, #318, #320, #327, #328, #331, #332, #334〜#338, #341〜#345, #347 | 実装マークの検査の手段とは直接の重なりを見つけていない |

---

## まとめ

1. マークは 304 件(欠番 0104)。`check` は machine 54・presence 47・manual 103・**未分類 100**。未分類はほぼ IMPL-0001〜0103(ADR-0061 採用前)で、降ろし先の検査スクリプト別に aggregate-evidence 45・verify-gate-contract 17・check-process-rules 15・check-d0 5・なし 18。`check` の値が不正なときに落ちることの陽性対照は無い
2. `check-impl.mjs` が機械で確かめるのは降ろし先の実在(ファイルの存在・キーの存在)まで。中身は見ない。登録簿の「検査のスクリプト」(19 件)とマークの `check` 属性は別物なのに同じ語を使っている
3. `claude-md` の常駐の規則は、節の見出しと1行以上の本文しか確かめない(`claude-md-resident.mjs:42,66-80`)。行を消しても、本文を1行に置き換えても通る。未分類 13 件のうち 12 件が常駐の規則、0085 だけが全文一致で検査される生成区間。`presence` と書かれた claude-md の 6 件も実態は同じ
4. G-5 基準6 は、Issue の起票後(2026-10-23、#296)に IMPL-0269 が付いた。テンプレートは基準6 のジョブを持たず、集約が注意を出すだけ。参照切れの検査はどこにも無い。本文(gate-criteria.md:460)は分量の上限だけを「降りていない」と書き、参照切れに触れていない
5. 降りていない規定は 95 件。そのうち 70 件は実在する降ろし先を指し、一部だけ降りているものを含む。Issue の5件: 0104 は削除・分割済み(残るのは 0291)、0116・0117・0118 は構成の欄と集約の拡張が要る、0120 は #313 の後に述べられる名・版・逸脱の一覧が出力に加わったが、表明の様式としての出力は無い
6. note と実態の食い違いを、抽出した 11 件のうち 1 件で確認した(IMPL-0209: スキル `human-verify` に禁止の文が初版から在る)。IMPL-0206 も一部食い違う
7. スキルの文の検査の対象は現在 41 件(Issue の時点は 40 件)。依頼の形(9 行)と平叙の否定(太字だけで 48 行)は対象の外
8. A-11 の機械の確認は関数の直接の呼び出し(`test-roster-rules.mjs:145-160`)に限られ、`generate-profile.mjs --change` の入口を通した試験は無い。`test-edition-end.mjs:103-136` に入口を通す試験の土台がある。IMPL-0115 は `machine` と書かれている
9. 台帳の定型文(`impl-inventory.mjs:379`「実行層に対応する記述がありません」)は、IMPL-0042・0043 のように有無だけは確かめている規定と合わない。ADR-0061:62 がこれを認め、棚卸しへ送っている
10. #324・#325・#333・#348・#349・#351・#354 には、本 Issue の降ろす順序と棚卸しの論点と同じ形の論点がある。どの Issue でどの IMPL を扱うかの割り振りを決める必要がある
