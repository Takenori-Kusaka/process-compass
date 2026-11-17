# 束 B16 の受付の一覧(様式・手引きの降ろし)

- 作成: 2026-11-18(束 B16 受付。実装・審議はまだ行わない)
- 範囲: `template/templates/*.md` と、template の手引きの文書(`template/docs/`、`template/README.md`、`template/CLAUDE.md`、`template/AGENTS.md`、`template/.claude/skills/**/*.md`)だけ。`tailoring-kb.json`・`scripts/`・`.github/`・`process.config.json` は B15 の範囲で、本束は触れない
- 入力: `research/445-450-deliberation/decision.tsv`(最終が b・c の行)、`marks.tsv`、#445〜#450 の B13 のコメント、#329・#328・#347・#351・#355・#356・#348・#340・#440 の本文とコメント、`npm run impl:issues -- --issue <番号>`
- 判定の記号: 範囲 = `B16`(降ろし先が全て本束の範囲)、`B16+B15`(文面は本束、検査データは B15)、`B15のみ`、`未確定`

## 要約

- (b) 52 件・(c) 77 件。B13 のコメントの一覧と**件数・IMPL 番号とも一致**(食い違いなし。詳細は A の注記)
- 129 件の内訳: B16 のみ 115、B16+B15 7(常駐の指示 + `claude-md-resident.json`)、B15 のみ 4(0760・0839・0959・1004)、降ろし先未確定 3(0715・0718・0827)
- 他の9件から、様式・手引きの項目を 28 項目抜き出した(C)。うち 2 件(#329 の T-3・T-4)は、寄せ先が #445 と書かれているが `decision.tsv` に行が無い(F)
- 降ろし先が実在しないファイルは 1 件(IMPL-0708 の `skills/pit/reference/` 配下の所在が未確定)。ほかの降ろし先は全て実在。新設は「節の新設」(09 の F.7 など)が中心で、ファイルの新設は #355 の「類似の検知の実施記録」の様式だけが候補
- 実装は直列(7 単位)に分ける案を E に置いた


## (A) #445〜#450 の (b) 表(様式の欄。52 件)

注記: マークの所在は現行の `src/content/docs/` を grep した結果(`p4` = phase4-process-design)。全 129 件でマークは1つずつ実在し、state は全て undelivered、issue= は `decision.tsv` の issue と一致した。件数の突合: `decision.tsv` の最終 b は 52、B13 のコメントの (b) の IMPL を抜くと #445 12・#446 12・#447 1・#448 9・#449 1・#450 17 = 52 で、IMPL 番号の差もない。食い違いなし。

| IMPL | issue | 降ろし先(decision.tsv) | 範囲 | 実在 | マーク(所在・target・state・issue) | 理由(要約) |
|---|---|---|---|---|---|---|
| IMPL-0569 | #445 | templates/06-project-brief.md 閾値の行「AI 利用量の上限(単位と値、または未設定)」 | B16 | 有 | p4/exception-escalation.md:409 ・budget-escalation・undelivered・445 | 上限を G-1 で定めるのは企画書の仕事。測定は IMPL-0370(adopter・ADR-0096)のまま |
| IMPL-0570 | #445 | templates/06-project-brief.md 同じ行に「未設定・測れないときは未測定と報告し 7.7.4 の自動の上程が働かない」の一文 | B16 | 有 | p4/exception-escalation.md:410 ・budget-escalation・undelivered・445 | 0569 と同じ入力 |
| IMPL-0608 | #445 | templates/03-debt-ledger.md 欄 | B16 | 有 | p4/exception-escalation.md:169 ・pr-checks・undelivered・445 | 台帳の行の理由欄に種類と根拠を書かせる(証跡) |
| IMPL-0609 | #445 | templates/03-debt-ledger.md 欄 | B16 | 有 | p4/exception-escalation.md:199 ・pr-checks・undelivered・445 | 議長裁定T5で台帳の行と同じ入力に乗せる |
| IMPL-0621 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/exception-escalation.md:579 ・gate-record-template・undelivered・445 | 判定記録に残す証跡。4値の欄と畳む |
| IMPL-0623 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/exception-escalation.md:607 ・gate-record-template・undelivered・445 | 判定記録に残す証跡。4値の欄と畳む |
| IMPL-0657 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/roles-responsibilities.md:979 ・gate-record-template・undelivered・445 | 会議体の判定記録の語彙。判定記録の欄(IMPL-0825と同じ入力) |
| IMPL-0658 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/roles-responsibilities.md:983 ・gate-record-template・undelivered・445 | 判定記録の証跡。0621・0623と1つの欄群に畳む |
| IMPL-0668 | #445 | templates/04-gate-record.md 決裁の結果に3行(影響を受ける他の案件・移動元の責任者への通知の日と宛先・実施できなくなる事項) | B16 | 有 | p4/exception-escalation.md:386 ・gate-record-template・undelivered・445 | 条文は内容を規定し手段を組織に任せる。通知の事実も記録の欄で受けられるので分割しない |
| IMPL-0702 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/roles-responsibilities.md:1189 ・gate-record-template・undelivered・445 | 判定記録の証跡の欄 |
| IMPL-0705 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/roles-responsibilities.md:1228 ・gate-record-template・undelivered・445 | 決議方式の欄。R1×持ち回りの拒否は欄ができれば(a)で足せる |
| IMPL-0831 | #445 | templates/04-gate-record.md 欄 | B16 | 有 | p4/roles-responsibilities.md:639 ・gate-record-template・undelivered・445 | 判定記録の証跡の欄 |
| IMPL-0592 | #446 | templates/00-d0-governance.md 担当表 | B16 | 有 | p4/human-ai-boundary.md:30 ・config-roles・undelivered・446 | 担当表の欄(0635と同じ) |
| IMPL-0635 | #446 | templates/00-d0-governance.md 担当表 | B16 | 有 | p4/roles-responsibilities.md:45 ・d0-template・undelivered・446 | D-0 に担当表の欄を持たない |
| IMPL-0637 | #446 | templates/00-d0-governance.md 節9 | B16 | 有 | p4/roles-responsibilities.md:141 ・d0-template・undelivered・446 | D-0 節9の欄 |
| IMPL-0654 | #446 | templates/00-d0-governance.md 担当表 | B16 | 有 | p4/roles-responsibilities.md:912 ・d0-template・undelivered・446 | D-0 の担当表に委譲の欄(0635と同じ表) |
| IMPL-0659 | #446 | templates/00-d0-governance.md 節10 | B16 | 有 | p4/roles-responsibilities.md:1000 ・d0-template・undelivered・446 | D-0 節10の1つの表に4会議体を畳む |
| IMPL-0660 | #446 | templates/00-d0-governance.md 節10 | B16 | 有 | p4/roles-responsibilities.md:1015 ・d0-template・undelivered・446 | 同上 |
| IMPL-0661 | #446 | templates/00-d0-governance.md 節10 | B16 | 有 | p4/roles-responsibilities.md:1032 ・d0-template・undelivered・446 | 同上 |
| IMPL-0662 | #446 | templates/00-d0-governance.md 節10 | B16 | 有 | p4/roles-responsibilities.md:1071 ・d0-template・undelivered・446 | 同上 |
| IMPL-0701 | #446 | templates/00-d0-governance.md 節4 | B16 | 有 | p4/roles-responsibilities.md:1155 ・d0-template・undelivered・446 | 表は複製せず標準3.8.2への参照一文を節4へ(細かい定義を増やさない) |
| IMPL-0704 | #446 | templates/00-d0-governance.md 節5 | B16 | 有 | p4/roles-responsibilities.md:1218 ・d0-template・undelivered・446 | D-0 節5の起算点の欄 |
| IMPL-0714 | #446 | templates/00-d0-governance.md 節12 | B16 | 有 | p4/roles-responsibilities.md:1900 ・d0-template・undelivered・446 | D-0 節12の欄 |
| IMPL-0829 | #446 | templates/00-d0-governance.md 節12 | B16 | 有 | p4/roles-responsibilities.md:671 ・d0-template・undelivered・446 | D-0 節12の名義の欄(担い手どうしの共有) |
| IMPL-0901 | #447 | templates/00-d0-governance.md 体制に1欄「監査担当の充足方法」(置く/他部門へ委託/外部へ委託/相互/未実施) | B16 | 有 | p4/roles-responsibilities.md:97 ・internal-audit-record・undelivered・447 | 所見 0 件と未実施の取り違えは適合の主張の信頼に響く(Q3)。監査記録への転記は採用者の監査担当が確かめる |
| IMPL-0914 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:30 ・safety-verification-record・undelivered・448 | F.7の適用規格欄で規格ごとに1指標 |
| IMPL-0916 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:87 ・safety-verification-record・undelivered・448 | F.7の欄 |
| IMPL-0917 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:99 ・safety-verification-record・undelivered・448 | F.7の適用規格と水準の欄 |
| IMPL-0920 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:128 ・safety-verification-record・undelivered・448 | G-5・G-6が一部を運ぶ。残りは検証記録の欄 |
| IMPL-0923 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:143 ・safety-verification-record・undelivered・448 | F.7の欄 |
| IMPL-0924 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:175 ・safety-verification-record・undelivered・448 | F.7の欄 |
| IMPL-0926 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:219 ・safety-verification-record・undelivered・448 | F.7の欄 |
| IMPL-0928 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:224 ・safety-verification-record・undelivered・448 | F.7の欄 |
| IMPL-0933 | #448 | templates/09-safety-risk-assessment.md F.7節 | B16 | 有 | p4/safety-verification.md:289 ・safety-verification-record・undelivered・448 | 様式そのもの(1節)。04には所在だけ書く |
| IMPL-0942 | #449 | templates/01-feature-spec.md 受入基準節 | B16 | 有 | p4/ears-guide.md:88 ・feature-spec-template・undelivered・449 | 機能仕様の受入基準節に説明を足す |
| IMPL-0540 | #450 | templates/02-adr.md 欄の説明 | B16 | 有 | p4/gate-criteria.md:623 ・adr-template・undelivered・450 | 判断記録の欄の説明 |
| IMPL-0589 | #450 | templates/defect-ledger.md 列 | B16 | 有 | p4/gate-criteria.md:2586 ・defect-ledger-template・undelivered・450 | 台帳の列を足す。公開の経路は採用者 |
| IMPL-0605 | #450 | templates/06-project-brief.md 欄 | B16 | 有 | p4/exception-escalation.md:117 ・project-brief-template・undelivered・450 | 企画書の欄 |
| IMPL-0607 | #450 | templates/03-debt-ledger.md 欄 | B16 | 有 | p4/exception-escalation.md:150 ・debt-ledger-template・undelivered・450 | 台帳の欄 |
| IMPL-0611 | #450 | templates/06-project-brief.md 欄 | B16 | 有 | p4/exception-escalation.md:216 ・project-brief-template・undelivered・450 | 企画書の欄(0629と1行に畳む) |
| IMPL-0629 | #450 | templates/06-project-brief.md 欄 | B16 | 有 | p4/exception-escalation.md:832 ・project-brief-template・undelivered・450 | 企画書の欄(0611と1行に畳む) |
| IMPL-0633 | #450 | templates/11-quality-assurance-policy.md | B16 | 有 | p4/exception-escalation.md:680 ・qa-policy-template・undelivered・450 | 層1の方針の既存行(0632)へ文言を足す |
| IMPL-0673 | #450 | templates/10-assumption-ledger.md 列 | B16 | 有 | p4/exception-escalation.md:917 ・assumption-ledger-template・undelivered・450 | 台帳の列 |
| IMPL-0752 | #450 | templates/08-ai-sla.md 第7項 | B16 | 有 | p4/tailoring-guide.md:764 ・ai-sla-template・undelivered・450 | 第7項の欄(0957と同じ節) |
| IMPL-0753 | #450 | templates/08-ai-sla.md 欄 + templates/05-handover.md 節2 | B16 | 有 | p4/tailoring-guide.md:710 ・handover-template・undelivered・450 | 発注側の保持者は既存の節2。粒度は第7章でなく様式08の欄 |
| IMPL-0807 | #450 | templates/08-ai-sla.md 第9節 | B16 | 有 | p4/deliverable-templates.md:1559 ・ai-sla-template・undelivered・450 | 第9節の欄 |
| IMPL-0902 | #450 | templates/06-project-brief.md 閾値と予算区分 | B16 | 有 | p4/roles-responsibilities.md:1914 ・project-brief-template・undelivered・450 | 企画書の行 |
| IMPL-0946 | #450 | templates/11-quality-assurance-policy.md 欄 | B16 | 有 | p4/deliverable-templates.md:1666 ・qa-policy-template・undelivered・450 | 様式の欄(決定日・記名) |
| IMPL-0950 | #450 | templates/06-project-brief.md「稟議へ数値を出すとき」に「出所の成果物」の列と「写しを正本にせず判定の対象にしない」の一文 | B16 | 有 | p4/deliverable-templates.md:1265 ・project-brief-template・undelivered・450 | 置き場は既にある。出所の列は結果と証跡まで |
| IMPL-0957 | #450 | templates/08-ai-sla.md 第7項 | B16 | 有 | p4/deliverable-templates.md:1523 ・ai-sla-template・undelivered・450 | 様式の欄(template-fields.yaml の両方向) |
| IMPL-0969 | #450 | templates/06-project-brief.md 総費用内訳 | B16 | 有 | p4/exception-escalation.md:416 ・project-brief-template・undelivered・450 | 企画書の総費用の区分 |
| IMPL-0977 | #450 | templates/06-project-brief.md 安定性指標の閾値 | B16 | 有 | p4/gate-criteria.md:2683 ・project-brief-template・undelivered・450 | 企画書の行 |

## (B) 同 (c) 表(手引き・常駐の指示。77 件)

注記: (c) は `decision.tsv` 77、コメントの (c) は #445 17・#446 15・#447 19・#448 1・#449 20・#450 5 = 77 で一致(#445 のコメントは 0549 を G-5 と G-7 の両方に挙げており、IMPL としては1件)。#447 の 0715・0718・0827・0832 は突合1巡目で (d) から (c) へ戻した分で、コメントにも (c) として載る。

| IMPL | issue | 降ろし先(decision.tsv) | 範囲 | 実在 | マーク(所在・target・state・issue) | 理由(要約) |
|---|---|---|---|---|---|---|
| IMPL-0534 | #445 | skills/gate/SKILL.md 判定の原則 | B16 | 有 | p4/gate-criteria.md:47 ・gate-skill・undelivered・445 | 判定者の振る舞いで機械は閉じない。判定の原則へ一文 |
| IMPL-0536 | #445 | skills/gate/SKILL.md | B16 | 有 | p4/gate-criteria.md:59 ・gate-skill・undelivered・445 | 判定者の運用の規定。手順は手引きへ |
| IMPL-0547 | #445 | skills/gate/gates/G-5.md | B16 | 有 | p4/gate-criteria.md:1245 ・gate-skill・undelivered・445 | 取り消せない操作に近い。手順なので手引きへ置く |
| IMPL-0549 | #445 | skills/gate/gates/G-5.md と G-7.md | B16 | 有 | p4/gate-criteria.md:1227 ・gate-skill・undelivered・445 | 判定者の範囲の限定で文で足りる |
| IMPL-0576 | #445 | skills/gate/gates/G-6.md | B16 | 有 | p4/gate-criteria.md:2115 ・gate-skill-g6・undelivered・445 | 人が読んで判断する規定。手順で足りる |
| IMPL-0577 | #445 | skills/implement/reference/task-size.md | B16 | 有 | p4/gate-criteria.md:2187 ・pr-checks・undelivered・445 | 3点は判断。生成印による除外は降りている。残りは手順 |
| IMPL-0613 | #445 | skills/pit/reference/handoff.md | B16 | 有 | p4/exception-escalation.md:290 ・next-role・undelivered・445 | 運用規則。next.mjs 出力の文を手引きに揃える |
| IMPL-0618 | #445 | skills/pit/reference/handoff.md | B16 | 有 | p4/exception-escalation.md:374 ・handoff-reference・undelivered・445 | 手順・体裁。手引きへ |
| IMPL-0620 | #445 | skills/gate/gates/SG.md | B16 | 有 | p4/exception-escalation.md:517 ・gate-skill・undelivered・445 | 判定の運用。手引きへ |
| IMPL-0650 | #445 | skills/gate/gates/G-6.md 7確認の範囲 | B16 | 有 | p4/roles-responsibilities.md:686 ・gate-skill・undelivered・445 | 違反は振る舞いにしか現れない。手引きへ |
| IMPL-0652 | #445 | skills/gate/gates/G-6.md | B16 | 有 | p4/roles-responsibilities.md:790 ・gate-skill-g6・undelivered・445 | 記録の手順の文。手引きへ |
| IMPL-0745 | #445 | skills/gate/gates/G-1.md | B16 | 有 | p4/tailoring-guide.md:539 ・gate-skill・undelivered・445 | 判定の条件の文。手引きへ |
| IMPL-0835 | #445 | template/CLAUDE.md 常駐 + gates/G-6.md | B16 | 有 | p4/tailoring-guide.md:485 ・gate-skill-g6・undelivered・445 | 常駐の規則の文。手引きへ |
| IMPL-0838 | #445 | skills/gate/gates/G-7.md | B16 | 有 | p4/tailoring-guide.md:686 ・gate-skill・undelivered・445 | 手順を手引きへ |
| IMPL-0943 | #445 | skills/gate/gates/G-2.md | B16 | 有 | p4/ears-guide.md:89 ・gate-skill・undelivered・445 | 判定者の確認項目。手引きへ |
| IMPL-0953 | #445 | skills/gate/gates/SG.md | B16 | 有 | p4/lifecycle.md:121 ・gate-skill・undelivered・445 | 判定の材料の限定。手引きへ |
| IMPL-0958 | #445 | skills/gate/gates/G-7.md | B16 | 有 | p4/deliverable-templates.md:1352 ・gate-skill・undelivered・445 | 判定の観点。手引きへ |
| IMPL-0585 | #446 | skills/gate/gates/G-6.md | B16 | 有 | p4/gate-criteria.md:2522 ・config-delegation・undelivered・446 | 省略の経路は無い(否定の検索)。禁止の文を置く |
| IMPL-0595 | #446 | skills/process-change/kinds/mode.md | B16 | 有 | p4/human-ai-boundary.md:356 ・process-change-skill・undelivered・446 | 引き上げの手順の文 |
| IMPL-0598 | #446 | template/CLAUDE.md 常駐 + scripts/gate/claude-md-resident.json | B16+B15 | 有 | p4/human-ai-boundary.md:613 ・config-delegation・undelivered・446 | no-adopter 節(5.5.5)。常駐の指示に理解の確認の側を足す |
| IMPL-0624 | #446 | skills/process-change/kinds/mode.md | B16 | 有 | p4/exception-escalation.md:679 ・autonomy-derivation・undelivered・446 | 判断点で記録させる手順。指標のデータは採用者 |
| IMPL-0721 | #446 | skills/artifact/artifacts/00-d0-governance.md | B16 | 有 | p4/roles-responsibilities.md:2169 ・d0-template・undelivered・446 | 文脈オーナーの務め。手引きへ |
| IMPL-0732 | #446 | skills/process-change/kinds/accountable.md | B16 | 有 | p4/tailoring-guide.md:67 ・process-change-skill・undelivered・446 | 変化点の手順の文 |
| IMPL-0737 | #446 | skills/process-change/SKILL.md | B16 | 有 | p4/tailoring-guide.md:109 ・process-change-skill・undelivered・446 | 手順 |
| IMPL-0740 | #446 | skills/gate/gates/G-1.md + templates/03-debt-ledger.md の説明 | B16 | 有 | p4/tailoring-guide.md:314 ・config-unmet・undelivered・446 | ゲートでない決定の未達。新しい構造を足さず台帳の「未達」の書き方を手引きへ(境界) |
| IMPL-0768 | #446 | skills/artifact/artifacts/09-safety-risk-assessment.md | B16 | 有 | p4/tailoring-guide.md:1244 ・process-change-skill・undelivered・446 | 判断の限定。手引きへ |
| IMPL-0839 | #446 | scripts/init/generate-profile.mjs | B15のみ | - | p4/tailoring-guide.md:688 ・profile-generator・undelivered・446 | 規則データを構成生成の文として出す(0760と同じ) |
| IMPL-0841 | #446 | skills/process-change/kinds/mode.md(委任の節。delegation.md は無い) | B16 | 有 | p4/tailoring-guide.md:516 ・config-delegation・undelivered・446 | 意味の判断。手順の文で足りる(自己申告の属性で閉じない) |
| IMPL-0842 | #446 | skills/process-change/kinds/mode.md(委任の節。delegation.md は無い) | B16 | 有 | p4/tailoring-guide.md:451 ・config-delegation・undelivered・446 | 期ごとの違反の記録が無い。戻す操作は変化点の手順 |
| IMPL-0944 | #446 | skills/process-change/reference/dry-run.md | B16 | 有 | p4/deliverable-templates.md:216 ・process-change-skill・undelivered・446 | 旧名義の拒否は日付突合が要る。まず手順(境界) |
| IMPL-0959 | #446 | scripts/init/generate-profile.mjs が PROCESS-PROFILE.md に節「提案書へ写す調整の宣言」(外した項目・簡略化した項目・理由)を出す | B15のみ | - | p4/tailoring-guide.md:33 ・profile-generator・undelivered・446 | 宣言の中身は構成から導けテンプレートが持てる。提案書そのものは持たない。宣言せずに運用しないことの検査は IMPL-07 |
| IMPL-1004 | #446 | scripts/gate/aggregate-evidence.mjs が出す構成書の注記に「数えない項目として人が確かめる」を足す(IMPL-1003 と同じ型) | B15のみ | - | p4/overview.md:721 ・evidence-aggregation・undelivered・446 | 機械が数えない部分を機械の検査にすると対象を取り違える。1.10.2 と 3.5.3 の揃え方は #446 で先に決める |
| IMPL-0708 | #447 | template/CLAUDE.md 指示資産の節 + skills/pit/reference/ | B16 | 有/所在未確定 | p4/roles-responsibilities.md:1804 ・instruction-asset-inventory・undelivered・447 | 意味の識別。印の付け方と観点を手引きへ |
| IMPL-0715 | #447 | 着手の期限の欄(IMPL-0065 の拡張の余地)。#447 の範囲 | 未確定 | 未確定 | p4/roles-responsibilities.md:1901 ・deprecation-inventory・undelivered・447 | 突合 1巡目で (d) から外した。scheduled・issue=447 |
| IMPL-0718 | #447 | 全社の統制の更新の受け手の側(警告の段・昇格の日の表示)。#447 の範囲 | 未確定 | 未確定 | p4/roles-responsibilities.md:1949 ・control-rollout・undelivered・447 | 突合 1巡目で (d) から外した。CI 基盤は案件の外にない。決めるのは統制の更新と昇格の予定日 |
| IMPL-0827 | #447 | 通知を受けたら止める側(常駐の指示か手引き)。#447 の範囲 | 未確定 | 未確定 | p4/roles-responsibilities.md:1854 ・model-quality-monitor・undelivered・447 | 突合 1巡目で (d) から外した。scheduled・issue=447 |
| IMPL-0832 | #447 | skills/gate/SKILL.md(議題を判定資料の未解決の論点に限る) | B16 | 有 | p4/roles-responsibilities.md:1373 ・committee-agenda・undelivered・447 | 突合 1巡目で (d) から外した。黙読・読み上げの禁止・判定の後の実行は追わない(旧 note のまま) |
| IMPL-0882 | #447 | skills/gate/gates/SG.md(SG-1 の判定要件) | B16 | 有 | p4/lifecycle.md:289 ・context-transfer-record・undelivered・447 | 起案のまま |
| IMPL-0885 | #447 | skills/process-change/kinds/accountable.md(後続作業 H-1〜H-3) | B16 | 有 | p4/lifecycle.md:364 ・context-transfer-record・undelivered・447 | 起案のまま |
| IMPL-0886 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:372 ・context-transfer-record・undelivered・447 | 起案のまま(置き場を 05 の手引きに確定) |
| IMPL-0887 | #447 | skills/process-change/kinds/accountable.md(H-1〜H-3 の判定者と期限) | B16 | 有 | p4/lifecycle.md:390 ・context-transfer-record・undelivered・447 | 新様式を作らない。Q3 で安全・取り消せない操作・適合の主張に当たらない |
| IMPL-0888 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:401 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0889 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:428 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0892 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:442 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0893 | #447 | skills/artifact/artifacts/05-handover.md(予告期間別の期限と延長の4項目) | B16 | 有 | p4/lifecycle.md:468 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0894 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:483 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0895 | #447 | skills/artifact/artifacts/05-handover.md に H-1 の必須欄の点検表(機械の検査は足さない) | B16 | 有 | p4/lifecycle.md:498 ・context-transfer-record・undelivered・447 | 様式を作らないので機械の検査の入力が無い。決定可能だが降ろさない旨を note に残す |
| IMPL-0896 | #447 | skills/artifact/artifacts/05-handover.md(H-3 の4課題・評価者・結果の書き方) | B16 | 有 | p4/lifecycle.md:519 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0897 | #447 | skills/artifact/artifacts/05-handover.md | B16 | 有 | p4/lifecycle.md:530 ・context-transfer-record・undelivered・447 | 同上 |
| IMPL-0898 | #447 | skills/process-change/kinds/accountable.md(不合格時の延長・一時移管、A を空席のまま交代日を過ぎない) | B16 | 有 | p4/lifecycle.md:542 ・context-transfer-record・undelivered・447 | 同上。空席を作らないことの全般は IMPL-0721(c)と揃える |
| IMPL-0974 | #447 | skills/gate/gates/G-6.md と template/CLAUDE.md 常駐: AI は承認レビューの本文とその草案を書かない | B16 | 有 | p4/gate-criteria.md:1452 ・internal-audit-record・undelivered・447 | AI が書く側の指示はテンプレートが持てる。書き手の確認は採用者の内部監査の抜き取り(確かめる者) |
| IMPL-0760 | #448 | scripts/init/generate-profile.mjs が PROCESS-PROFILE.md・CLAUDE.md へ出す | B15のみ | - | p4/tailoring-guide.md:1178 ・profile-generator・undelivered・448 | 規則データを構成生成の文として出す。照合は manual |
| IMPL-0579 | #449 | skills/implement/reference/task-size.md | B16 | 有 | p4/gate-criteria.md:2236 ・implement-skill・undelivered・449 | 手順 |
| IMPL-0580 | #449 | skills/implement/reference/task-size.md | B16 | 有 | p4/gate-criteria.md:2307 ・implement-skill・undelivered・449 | 手順 |
| IMPL-0593 | #449 | template/CLAUDE.md 常駐 + claude-md-resident.json | B16+B15 | 有 | p4/human-ai-boundary.md:85 ・claude-md・undelivered・449 | no-adopter 節。常駐の指示に足す |
| IMPL-0646 | #449 | template/CLAUDE.md 常駐 + claude-md-resident.json | B16+B15 | 有 | p4/roles-responsibilities.md:555 ・claude-md-resident・undelivered・449 | 常駐の指示に置く(実装計画のスキルに一文はある) |
| IMPL-0711 | #449 | template/CLAUDE.md「判断の確定と委任」の IMPL-0404 の隣に1行 + scripts/gate/claude-md-resident.json | B16+B15 | 有 | p4/roles-responsibilities.md:1807 ・claude-md-resident・undelivered・449 | ADR-0104 決定9 が同じ 3.12.3 を常駐の指示で降ろした型。草案を作るのは案件の AI |
| IMPL-0749 | #449 | template/CLAUDE.md 常駐 + claude-md-resident.json | B16+B15 | 有 | p4/tailoring-guide.md:680 ・claude-md-resident・undelivered・449 | 常駐の規則 |
| IMPL-0819 | #449 | skills/implement/SKILL.md | B16 | 有 | p4/deliverable-templates.md:2205 ・implement-skill・undelivered・449 | スキルの手順の順序 |
| IMPL-0907 | #449 | template/CLAUDE.md 常駐 + claude-md-resident.json | B16+B15 | 有 | p4/assurance-case.md:378 ・claude-md-resident・undelivered・449 | 常駐の規則 |
| IMPL-0918 | #449 | template/CLAUDE.md 一律で委譲できない領域 | B16 | 有 | p4/safety-verification.md:112 ・claude-md-resident・undelivered・449 | 領域の限定。常駐の指示に名指す |
| IMPL-0921 | #449 | skills/implement/SKILL.md | B16 | 有 | p4/safety-verification.md:129 ・implement-skill・undelivered・449 | スキルの手順 |
| IMPL-0922 | #449 | skills/implement/SKILL.md | B16 | 有 | p4/safety-verification.md:139 ・implement-skill・undelivered・449 | スキルの手順 |
| IMPL-0929 | #449 | skills/implement/SKILL.md | B16 | 有 | p4/safety-verification.md:237 ・implement-skill・undelivered・449 | スキルの手順 |
| IMPL-0932 | #449 | skills/implement/SKILL.md | B16 | 有 | p4/safety-verification.md:274 ・implement-skill・undelivered・449 | スキルの手順 |
| IMPL-0936 | #449 | skills/spec-write/SKILL.md | B16 | 有 | p4/ears-guide.md:52 ・spec-write-skill・undelivered・449 | スキルの手順 |
| IMPL-0937 | #449 | skills/spec-write/SKILL.md | B16 | 有 | p4/ears-guide.md:53 ・spec-write-skill・undelivered・449 | スキルの手順 |
| IMPL-0938 | #449 | skills/spec-write/SKILL.md | B16 | 有 | p4/ears-guide.md:54 ・spec-write-skill・undelivered・449 | スキルの手順 |
| IMPL-0939 | #449 | skills/spec-write/SKILL.md | B16 | 有 | p4/ears-guide.md:55 ・spec-write-skill・undelivered・449 | スキルの手順 |
| IMPL-0941 | #449 | skills/spec-write/SKILL.md | B16 | 有 | p4/ears-guide.md:87 ・spec-write-skill・undelivered・449 | スキルの完了条件の文 |
| IMPL-0971 | #449 | template/CLAUDE.md 常駐 + claude-md-resident.json | B16+B15 | 有 | p4/lifecycle.md:613 ・claude-md-resident・undelivered・449 | 常駐の規則 |
| IMPL-0975 | #449 | template/CLAUDE.md 常駐 + gate/SKILL.md | B16 | 有 | p4/roles-responsibilities.md:819 ・claude-md-resident・undelivered・449 | 常駐の規則 |
| IMPL-0545 | #450 | skills/artifact/artifacts/defect-ledger.md(項目3) | B16 | 有 | p4/gate-criteria.md:931 ・defect-ledger-template・undelivered・450 | 判断を伴う。項目3の手引きへ |
| IMPL-0798 | #450 | skills/artifact/artifacts/06-project-brief.md | B16 | 有 | p4/deliverable-templates.md:1183 ・project-brief-template・undelivered・450 | 判断の限定。手引きへ |
| IMPL-0857 | #450 | skills/artifact/artifacts/08-ai-sla.md | B16 | 有 | p4/deliverable-templates.md:1350 ・ai-sla-guide・undelivered・450 | 手引き08の記述 |
| IMPL-0945 | #450 | skills/artifact/artifacts/11-quality-assurance-policy.md | B16 | 有 | p4/deliverable-templates.md:1674 ・qa-policy-template・undelivered・450 | 自由文の比較で機械は閉じない。手引きへ |
| IMPL-0948 | #450 | skills/artifact/artifacts/11-quality-assurance-policy.md | B16 | 有 | p4/deliverable-templates.md:1678 ・qa-policy-template・undelivered・450 | 周知は組織が行う。求める文を手引きへ |

## (C) 他の9件の様式・手引きの項目(降ろし先が B16 の範囲)

出典は各 Issue の最新のコメント(2026-11-15〜17)。「裁定の出所」は ADR とファイル。IMPL が無い項目は「なし」と書く。

| # | 項目 | 降ろし先 | 実在 | 裁定の出所 | IMPL |
|---|---|---|---|---|---|
| C-1 | #329 T-2: `README.md` の「未達として保証の開示へ記録する」を「列挙に無い離脱として記録する。7.3 の例外承認を経た場合を除く」へそろえる | `README.md` | 有(ただし該当文が現行に見当たらない。F-6) | ADR-0141、research/329-deliberation/21-ruling.md、#329 コメント 2026-11-17 | IMPL-0986(adopter) |
| C-2 | #329 T-3: `/gate G-8` の補助ファイルに、配備の環境の承認は成立に数えない・配備は判定記録の後・緊急の修正にも G-8 を経ない経路が無い、を書く | `.claude/skills/gate/gates/G-8.md` | 有 | ADR-0141、research/329-deliberation/21-ruling.md | IMPL-0985(adopter) |
| C-3 | #329 T-4: `exception-paths.md` に、構成の条件のうち G-8 の配備の統制だけが例外承認の対象であること、台帳の行の対象の書き方(配備のワークフローの所在と配備先)を書く | `.claude/skills/gate/reference/exception-paths.md` | 有 | ADR-0141 | IMPL-0603(delivered。同じ手引き) |
| C-4 | #328: `template/CLAUDE.md` の承認の範囲(指示資産の変更)を 3.11.2 へそろえるかの確認 | `CLAUDE.md` | 有 | ADR-0142、research/328-deliberation/04-ruling.md | なし |
| C-5 | #328: `CLAUDE.md`・`handoff.md` に、判定記録の無い `ready-to-merge` を `dev-done` へ戻す行があるかの確認 | `CLAUDE.md`、`.claude/skills/pit/reference/handoff.md` | 有(現行は `dev-done` の受け手の記述だけ。差し戻しの行は見当たらない) | ADR-0142 | IMPL-0331 系(#368)。本束では確認のみ |
| C-6 | #347: 09 の見出し「AIエージェント安全リスクアセスメント(適用: …)」へ、読み分けの語を足す(ADR-0142 決定3 の規則)。知識ベースの再生成は B15 | `templates/09-safety-risk-assessment.md`(見出し) | 有 | ADR-0142、research/347-deliberation/04-ruling.md | なし(manual の確認) |
| C-7 | #351 H-7: D-0 の名簿に、受託の発注側を載せる手引きの1文 | `templates/00-d0-governance.md`(人の名簿の説明)、または `.claude/skills/artifact/artifacts/00-d0-governance.md` | 有 | research/351-deliberation/04-ruling.md、#370 の審議 | なし |
| C-8 | #351 H-4: D-0 節2 のコメントに「変更履歴の行を指してよい」を足す。参照先の行の実在の検査の要否は B15 | `templates/00-d0-governance.md` 節2 | 有 | research/351-deliberation/04-ruling.md | なし |
| C-9 | #355: G-7 基準6 の手順(G-1 の閾値の記録と、AI 品質指標の比率を合否に用いていないことの確認) | `.claude/skills/gate/gates/G-7.md` | 有(基準6〜8 の手順は現行に無い) | ADR-0159、research/355-deliberation/b2-decision.md | IMPL-0044(scheduled) |
| C-10 | #355: G-7 基準7 の手順(D-0 表10 の F.2 の回答と CL から適用を読み、F.7 の6項目を判定) | `.claude/skills/gate/gates/G-7.md` | 有 | ADR-0159、ADR-0171 | IMPL-0045(scheduled)、IMPL-1007 は B15 |
| C-11 | #355: G-7 基準8 の手順(ライセンス検査の結果・類似の検知の実施記録・区分「類似検知」の行の判定) | `.claude/skills/gate/gates/G-7.md` | 有 | ADR-0159 | IMPL-0046、IMPL-1009、IMPL-0548、IMPL-1008 |
| C-12 | #355: 変異の一覧の扱い(出荷判定者に読解を求めず、差し戻しの判断は G-5・G-6 で終える) | `.claude/skills/gate/gates/G-7.md` | 有 | gate-criteria の IMPL-0560 | IMPL-0560(scheduled) |
| C-13 | #355: 技術負債台帳に区分「類似検知」と表の行を足す。区分の列挙が3つに限られ標準と逆の指示になっている点の是正、返却目安は日付、延長は区分「例外」の新しい行で「対象」に元の行の ID | `templates/03-debt-ledger.md` | 有 | ADR-0159、research/355-deliberation/b2-decision.md | IMPL-0548、IMPL-1008、IMPL-0787 |
| C-14 | #355: 類似の検知の実施記録(用いた手段・対象の範囲・実施日・結果)の置き場と様式 | 未定(`templates/03-debt-ledger.md` の節、または新様式) | 無し。新設の要否が未定(F-9) | ADR-0159 | IMPL-1009 |
| C-15 | #355: 5.6 項目5(Q1 を引き下げるときの記名)を template の束で決める | 未定(`templates/09-safety-risk-assessment.md` か D-0) | 未定 | ADR-0171、research/355-deliberation/b13-decision.md | なし |
| C-16 | #355(#353 分): 例外承認は期限を過ぎると効力を失う、延長は新しい行で承認し直す、の記述 | `.claude/skills/gate/reference/exception-paths.md` | 有 | ADR-0134 | IMPL-0575(delivered)。C-3 と同じ手引き |
| C-17 | #356 T-4: スキル・手引きの写しの手続1・2 を標準(5.6.2)に合わせる。`drill/` の例に注意書き | 所在未確定(`.claude/skills/artifact/artifacts/adoption-trial.md` が Seeded-Error を含むのみ。`seeded-error-safety.md` と `drill/` は template に無い) | 所在未確定(F-7) | ADR-0161、research/356-deliberation/b-decision.md | IMPL-0195、IMPL-0190(adopter) |
| C-18 | #348 T7: README・委任の手引き・05-handover に、強制は `start` を呼んだ単位だけである旨と移行の注記 | `README.md`、`.claude/skills/process-change/kinds/mode.md`(委任の節)、`templates/05-handover.md`、`.claude/skills/artifact/artifacts/05-handover.md` | 有 | ADR-0158、research/348-340-q-deliberation/decision.md | IMPL-0834(同じ項は #446 の B13 で B15 の autonomy.mjs へ) |
| C-19 | #348 T6・T9: 登録の根拠の4点目の欄(様式に置くかを決める)。構成の欄そのものは B15 | 未定(`templates/05-handover.md` / D-0 節12) | 有 | ADR-0158 | IMPL-0834・IMPL-0983 |
| C-20 | #340/#348(IMPL-1014): 09 の「記入時の注意」に、要求事項5 を L2 に当てる条件7 の項。欄は足さない | `templates/09-safety-risk-assessment.md`(記入時の注意) | 有 | ADR-0170、research/340-deliberation/decision.md | IMPL-1014(scheduled、issue=448)。`decision.tsv` に行なし(F-5) |
| C-21 | 同上: 手引き 09 に、低減策の行を実行の単位ごとに書く記入例 | `.claude/skills/artifact/artifacts/09-safety-risk-assessment.md` | 有 | ADR-0170 | IMPL-1014 |
| C-22 | #440 T-1〜T-3: 写しの「設けません」に主語を足す(04:183、04:242、手引き 10:16) | `templates/04-gate-record.md`、`.claude/skills/artifact/artifacts/10-assumption-ledger.md` | 有 | ADR-0155、research/440-deliberation/decision-heavy.md | なし |
| C-23 | #440 T-4: 04:124「再判定のために新しいゲートを設けません。会議体も設けません」。標準側に同じ文が無い。由来を確かめて主語を足す | `templates/04-gate-record.md` | 有 | ADR-0155 | なし |
| C-24 | #440 T-5: 09:142・171 を「低減後 SR の算定に RRS3 を数えない」へ。RRS1・RRS2 の欄の理由 | `templates/09-safety-risk-assessment.md` | 有 | ADR-0155 | IMPL-0998(scheduled、issue=440) |
| C-25 | #440 T-6: 06:71「欄も置きません」の語(任意) | `templates/06-project-brief.md` | 有 | ADR-0155 | なし |
| C-26 | #440 T-7: F.7 の記録の様式に「挿入した環境」を入れる | `templates/09-safety-risk-assessment.md`(F.7 節) | 有(節は新設) | ADR-0155 | IMPL-0933(B の (b) 表と同じ入力) |
| C-27 | #440 T-8: SG の判定の欄に「ステージ移行ゲートでは差し戻しを用いない」 | `templates/04-gate-record.md`(251 行付近) | 有 | ADR-0156 | IMPL-1000(scheduled、issue=440) |
| C-28 | #440 T-9: 第2項と手引き 08 の手順2 の語の確認 | `templates/08-ai-sla.md`、`.claude/skills/artifact/artifacts/08-ai-sla.md` | 有 | ADR-0155 | なし |

注記: C-9〜C-12 は同じ `gates/G-7.md`。C-13 と C-14 は #355 の同じ決定(ADR-0159)。C-20 と B 表の 09(F.7)は同じ節(同じ担当で)。

## (D) B15 の範囲で触れない項目

全て scripts・`tailoring-kb`・`.github`・`process.config.json`・`src/data/tailoring/` に降ろすもの。本束は触れない。

### D-1 (b)(c) 表のうち B15 側の部分

- `B15のみ`: IMPL-0760・0839・0959(`scripts/init/generate-profile.mjs` が PROCESS-PROFILE.md・CLAUDE.md へ出す生成文)、IMPL-1004(`scripts/gate/aggregate-evidence.mjs` の構成書の注記。1.10.2 と 3.5.3 の揃え方を先に決める)
- `B16+B15`(文面は本束、`scripts/gate/claude-md-resident.json` は B15): IMPL-0593・0598・0646・0711・0749・0907・0971。この7件は `template/CLAUDE.md` の常駐の文の追加が B16、`claude-md-resident.json` の更新が B15。両者の一致を検査が見る可能性があり、順序を合わせる(F-2)
- 降ろし先未確定(B15 に回る可能性): IMPL-0715(着手の期限の欄)・0718(受け手の側の警告の段・昇格の日の表示)・0827(通知を受けたら止める側。常駐の指示か手引き)

### D-2 (a) の項目(`decision.tsv` の最終 a、45 件。全て B15)

`scripts/gate/check-pr.mjs`、`exception-expiry.mjs`、`.github/workflows/review-queue-control.yml`(新規)、`aggregate-evidence.mjs`、`adapter.mjs`、`verify-gate-contract.mjs`、`check-g1.mjs`、`autonomy.mjs`、`config.mjs`、`model-adoption.mjs`、`generate-profile.mjs`、`spec-recheck.mjs`、`src/data/tailoring/` の兼務禁止の組、`recalibration.mjs`、`check-d0.mjs`、`check-safety-record.mjs`(新規)、`org-assurance.mjs`、`process.config.json` の projectId。

### D-3 他の9件のうち B15 の項目

| Issue | 項目 | 降ろし先 | IMPL |
|---|---|---|---|
| #329 | T-1 述べられる名が配備の資格情報の離脱を数える(構成に欄を新設) | `config.mjs` の `claimStatus` | IMPL-0986(#354。adopter) |
| #329 | T-7 PR を経ない起動の `gate-g5` を G-5 の通過に数えない。実機の確認 | `aggregate-evidence.mjs`、`gate-g5.yml` | IMPL-0987 |
| #329 | T-5 配備の実行記録と判定記録の突き合わせ / T-6 env-check | 採用者 / #361 | IMPL-0985・0303 |
| #351 | H-1 `questions.yaml` の help と `template:kb` の再生成。IMPL-0278(名簿が空のときの存在の検査)。IMPL-0988(`detectDeviations` を席の割り当てで分ける) | `src/data/tailoring/`、`generate-profile.mjs` | IMPL-0278・0988 |
| #355 | 基準7・8 の `criteria[7]`・`criteria[8]`、期限超過、実施記録の4事項の有無、`humanReconcile` | `aggregate-evidence.mjs` | IMPL-1007・1008・1009 |
| #355 | 集約 23 件(0963・0787・0612・0667・0622・0626・0628・0669・0631・0687・0584・0853・0638・0655・0710・0717・0719・0720・0738・0739・0837・0755・0498) | `aggregate-evidence.mjs`(target=evidence-aggregation) | 各 IMPL。全て undelivered、plan=scheduled |
| #355 | 判断記録の欠け・前の記録との一致 | `check-decisions.mjs`(target=decisions-check) | IMPL-0523・0990 |
| #355 | 台帳の行と基準値を判定記録の写しと同じ PR で変えない | `.github/`(target=pr-checks) | IMPL-0554 |
| #355 | 文書だけの変更の SLA、読まれずに通る散文の検知 | `review-queue-control.yml` | IMPL-0136(445 a)・1010 |
| #355 | Q1 の写しの設問・規則・stage-table・エンジンの試験・`cl-judgment.mjs` | `src/data/tailoring/questions.yaml`、`scripts/lib/stage-table.mjs`、`scripts/gate/cl-judgment.mjs` | IMPL-1015・1016(#448) |
| #356 | T-1 PR の検査(標識の行) / T-2 制限の記録の person / T-3 `blind: false` の表示 | `pr-checks`(`.github/`)、`aggregate-evidence.mjs`、`test-roster-conditions.mjs` | IMPL-0191・1011・1012・1003 |
| #348 | T1〜T5・T8・T10: 停止の導出、母数、試験、表示、`reworkBaseline`、fixture。T6 の構成の欄と `config.mjs` の検査 | `autonomy.mjs`、`config.mjs`、`test-check-delegation.mjs` | IMPL-0291・0287・0288・1006・0834・0983・0284 |
| #340 | 条件7 そのもの | adopter(準拠テンプレートが L2 を表せない間は降りない) | IMPL-1013 |
| #440 | なし(本束の範囲のみ) | | |
| #328 | 公式用語と異表記の一覧(`provision-forms.yaml` は標準側。template の範囲外) | | IMPL-0984 など |


## (E) 降ろし先のファイルごとの件数

(b)(c) の IMPL 番号を、降ろし先のファイルごとに数えた(B16 の範囲のファイルのみ。複数ファイルに跨る IMPL は各ファイルに数える)。

| 降ろし先 | 実在 | (b)(c) の件数 | IMPL |
|---|---|---|---|
| .claude/skills/artifact/artifacts/00-d0-governance.md | 有 | 1 | 0721 |
| .claude/skills/artifact/artifacts/05-handover.md | 有 | 9 | 0886 0888 0889 0892 0893 0894 0895 0896 0897 |
| .claude/skills/artifact/artifacts/06-project-brief.md | 有 | 1 | 0798 |
| .claude/skills/artifact/artifacts/08-ai-sla.md | 有 | 1 | 0857 |
| .claude/skills/artifact/artifacts/09-safety-risk-assessment.md | 有 | 1 | 0768 |
| .claude/skills/artifact/artifacts/11-quality-assurance-policy.md | 有 | 2 | 0945 0948 |
| .claude/skills/artifact/artifacts/defect-ledger.md | 有 | 1 | 0545 |
| .claude/skills/gate/SKILL.md | 有 | 4 | 0534 0536 0832 0975 |
| .claude/skills/gate/gates/G-1.md | 有 | 2 | 0745 0740 |
| .claude/skills/gate/gates/G-2.md | 有 | 1 | 0943 |
| .claude/skills/gate/gates/G-5.md | 有 | 2 | 0547 0549 |
| .claude/skills/gate/gates/G-6.md | 有 | 6 | 0576 0650 0652 0835 0585 0974 |
| .claude/skills/gate/gates/G-7.md | 有 | 3 | 0549 0838 0958 |
| .claude/skills/gate/gates/SG.md | 有 | 3 | 0620 0953 0882 |
| .claude/skills/implement/SKILL.md | 有 | 5 | 0819 0921 0922 0929 0932 |
| .claude/skills/implement/reference/task-size.md | 有 | 3 | 0577 0579 0580 |
| .claude/skills/pit/reference/(未確定) | 未確定 | 1 | 0708 |
| .claude/skills/pit/reference/handoff.md | 有 | 2 | 0613 0618 |
| .claude/skills/process-change/SKILL.md | 有 | 1 | 0737 |
| .claude/skills/process-change/kinds/accountable.md | 有 | 4 | 0732 0885 0887 0898 |
| .claude/skills/process-change/kinds/mode.md | 有 | 4 | 0595 0624 0841 0842 |
| .claude/skills/process-change/reference/dry-run.md | 有 | 1 | 0944 |
| .claude/skills/spec-write/SKILL.md | 有 | 5 | 0936 0937 0938 0939 0941 |
| CLAUDE.md | 有 | 12 | 0835 0598 0708 0974 0593 0646 0711 0749 0907 0918 0971 0975 |
| templates/00-d0-governance.md | 有 | 13 | 0592 0635 0637 0654 0659 0660 0661 0662 0701 0704 0714 0829 0901 |
| templates/01-feature-spec.md | 有 | 1 | 0942 |
| templates/02-adr.md | 有 | 1 | 0540 |
| templates/03-debt-ledger.md | 有 | 4 | 0608 0609 0740 0607 |
| templates/04-gate-record.md | 有 | 8 | 0621 0623 0657 0658 0668 0702 0705 0831 |
| templates/05-handover.md | 有 | 1 | 0753 |
| templates/06-project-brief.md | 有 | 9 | 0569 0570 0605 0611 0629 0902 0950 0969 0977 |
| templates/08-ai-sla.md | 有 | 4 | 0752 0753 0807 0957 |
| templates/09-safety-risk-assessment.md | 有 | 9 | 0914 0916 0917 0920 0923 0924 0926 0928 0933 |
| templates/10-assumption-ledger.md | 有 | 1 | 0673 |
| templates/11-quality-assurance-policy.md | 有 | 2 | 0633 0946 |
| templates/defect-ledger.md | 有 | 1 | 0589 |

### 実装の単位の案(直列。1担当 25 件前後を上限)

準拠テンプレートを触る作業は直列(CLAUDE.md の担当の回し方)。下の順は、ファイルの重なりが後の単位へ持ち越されない順にした。件数は (b)(c) の IMPL 数 + (C) の項目数。

| 単位 | ファイル | (b)(c) の IMPL | (C) の項目 | 計 |
|---|---|---|---|---|
| U1 ゲートの手引き | `skills/gate/SKILL.md`、`gates/G-1,G-2,G-5,G-6,G-7,G-8,SG.md`、`reference/exception-paths.md`(CLAUDE.md の一部は U7) | 0534 0536 0832 0745 0740 0943 0547 0549 0576 0650 0652 0585 0838 0958 0620 0953 0882(17) | C-2 C-3 C-9 C-10 C-11 C-12 C-16(7) | 24 |
| U2 様式 A | `templates/04-gate-record.md`、`03-debt-ledger.md`、`02-adr.md`、`05-handover.md`、`defect-ledger.md` | 0621 0623 0657 0658 0668 0702 0705 0831 / 0608 0609 0607 / 0540 / 0753 / 0589(17) | C-13 C-14 C-22 C-23 C-27(5) | 22 |
| U3 様式 B と対応する手引き | `templates/06,08,11,10,01`、`skills/artifact/artifacts/06,08,11,defect-ledger.md` | 0569 0570 0605 0611 0629 0902 0950 0969 0977 / 0752 0807 0957 / 0633 0946 / 0673 / 0942 / 0798 0857 0945 0948 0545(21) | C-25 C-28(2) | 23 |
| U4 D-0 と変更の手引き | `templates/00-d0-governance.md`、`skills/artifact/artifacts/00-d0-governance.md`、`skills/process-change/**` | 0592 0635 0637 0654 0659 0660 0661 0662 0701 0704 0714 0829 0901 / 0721 / 0595 0624 0841 0842 0732 0885 0887 0898 0737 0944(24) | C-7 C-8(2) | 26 |
| U5 引き継ぎ・安全 | `skills/artifact/artifacts/05-handover.md`、`templates/09-safety-risk-assessment.md`、`skills/artifact/artifacts/09-...md` | 0886 0888 0889 0892 0893 0894 0895 0896 0897 / 0914 0916 0917 0920 0923 0924 0926 0928 0933 / 0768(19) | C-6 C-15 C-20 C-21 C-24 C-26(6) | 25 |
| U6 実装・仕様の手引き | `skills/implement/**`、`skills/spec-write/SKILL.md`、`skills/pit/reference/handoff.md`(0708 の所在が決まれば同 `pit/reference/`) | 0819 0921 0922 0929 0932 0577 0579 0580 0936 0937 0938 0939 0941 0613 0618(15) | C-5(1) | 16 |
| U7 常駐の指示と README | `CLAUDE.md`、`README.md`(`AGENTS.md`・`docs/` は該当なし) | 0835 0974 0975 0598 0708 0593 0646 0711 0749 0907 0918 0971(12) | C-1 C-4 C-17 C-18 C-19(5) | 17 |

- 重なり: U2 の 0753 は `templates/05-handover.md` を、U5 の C-18 の一部も同じファイルを触る(U2 の後で U5)。0740 は U1 の `G-1.md` と U2 の `03-debt-ledger.md` に分かれる。0835・0974・0975 は U1 の `gates/G-6.md`・`SKILL.md` と U7 の `CLAUDE.md` に分かれる(同じ担当に回す案も可)
- U7 の7件(0593 0598 0646 0711 0749 0907 0971)は `claude-md-resident.json` が B15。U7 は B15 の更新と順序を合わせる(F-2)
- 7 単位の (b)(c) の IMPL は重複なしで 17+14+21+24+19+15+12 = 122 件。B16 の対象 122 件(B16 115 + B16+B15 7)と一致することを確かめた。0740・0835・0974・0975 は複数ファイルに跨るが、単位は主たるファイルの側に置いた
- 実装の前に各単位で `npm run check`(様式の必須欄の両方向検査: `src/data/template-fields.yaml`)を流す。新設・削除の欄は同ファイルの変更が要るが、これは本束の範囲外(標準側)。F-8

## (F) 不明・判断が要る点

1. **IMPL-0715・0718・0827(#447)の降ろし先が未確定**。`decision.tsv` の最終は c だが、降ろし先に具体的なファイルが無い(「区分の確定は着手のとき」)。0827 は「常駐の指示か手引き」で B16 になりうる。0715・0718 は欄・警告の段・昇格日の表示で B15 の可能性が高い。0827 の降ろし先 `target`、0832 の `committee-agenda` の path が実態と合っていない(B13 の開示。undelivered で表示)
2. **`CLAUDE.md` の常駐と `claude-md-resident.json` の対**(0593 0598 0646 0711 0749 0907 0971)。B16 が文を足し、B15 が json を更新する。検査が両者の一致を見るなら、片方だけでは `npm run check` が落ちうる。どちらを先にするか、または両者を同じ担当で扱うかを決める
3. **IMPL-0708 の `skills/pit/reference/` 配下の所在が未確定**(`boundaries.md` か `handoff.md` か新設か)。「印の付け方と観点を手引きへ」
4. **生成物の扱い**(0760・0839・0959)。`generate-profile.mjs` が `PROCESS-PROFILE.md`・`CLAUDE.md` へ出す文は B15。手書き部分(U7 の常駐)との境を、生成の区間として扱うか
5. **#329 の T-3・T-4(C-2・C-3)は、寄せ先が #445 とされているが、`decision.tsv` に行が無い**(B13 の (c) 一覧にも無い)。IMPL-0603 は delivered(手引き `exception-paths.md`)で、T-3 の `G-8.md` は IMPL-0985(adopter)に紐づく。C-20・C-21(IMPL-1014、#340 から #448 へ寄せた分)も `decision.tsv` に行が無い。受付で採るかを決める
6. **#329 T-2(C-1)の対象の文が現行の `template/README.md` に見当たらない**(「未達として保証の開示へ記録する」で検索して 0 件)。行番号は旧いまま。既に直っている可能性
7. **#356 T-4(C-17)の所在**。`seeded-error-safety.md` と `drill/` は template に無い。`adoption-trial.md` が Seeded-Error を含むだけ。標準側の手引きを指している可能性
8. **必須欄の変更は本束の外**。`src/data/template-fields.yaml`(両方向検査)は標準側。03 の区分の列挙の是正(C-13)や 09 の F.7 の欄で必須欄が増減するなら、標準側の更新が要る。B16 の範囲(template のみ)に収まるかを受付で確かめる
9. **C-14(類似の検知の実施記録の様式)は新設の要否が未定**。B13 は「移管記録の新様式は作らない。新様式は F.7 だけ」と決めている。同じ線で、03 の節に収めるか、新様式を認めるかは議長の裁定になる(新しい義務に当たれば重)
10. **C-15(5.6 項目5。Q1 を引き下げるときの記名)は降ろし先も内容も template の束で決める**とされ、裁定が無い。着手のとき軽の審議か
11. **C-19(4点目の欄を様式に置くか)も未決**。ADR-0158 は「様式に置く場合だけ必須欄を足す」としか決めていない
12. **IMPL-0668 の理由が途切れている**。`decision.tsv` の該当列に、条文は内容を規定し手段を任せる旨の続きがある。着手時に原文を読む
13. **#446 の IMPL-1004 は「1.10.2 と 3.5.3 の揃え方を先に決める」**(ADR-0147)とされ、B15 側の前提が未了
14. **IMPL-0978 は重の審議へ送られ #447 に残る**。本束の対象外
15. **行番号の古さ**。#440 の T-1〜T-8 の行番号(04:183・242・124・251、09:142・171、06:71、10:16)は 2026-11-17 時点。実装前に grep で再確認する(04:124・251、09:142 は現行も該当文あり)
