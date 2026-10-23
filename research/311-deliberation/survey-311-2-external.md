# #311 外部調査 2: 自律レベルの自動引き下げ(規格と業界の実務)

- 調査日: 2026-10-23。WebSearch / WebFetch による。本リポジトリのファイルは本書以外を変更していない
- 対象: 第5章 5.4.6(検知した時点の自動の引き下げ)を、準拠テンプレートの実行層へ降ろすか。措置の強さと、閾値の根拠の開示をどうするか
- 内部の現状は `survey-311-1-internal.md` を参照。本書は外部だけを扱う

## 0. 読み方

### 0.1 検証の区分

| 記号 | 意味 |
| --- | --- |
| **[原文]** | 一次資料の本文を取得し、引用を原文で確かめた。引用は原文のまま(英語) |
| **[原文・部分]** | 一次資料の一部(プレビュー・目次・抜粋)だけを確かめた。本文の規定内容は未確認 |
| **[二次]** | 解説サイト・要約・他者の言い換えでしか確かめていない |
| **[未確認]** | 記憶・一般的な知識に依る。取得して確かめられなかった。条項の根拠にしない |

取得には要約を返すツール(WebFetch)を使った。**[原文]の引用も、ツールが抜き出した文字列である**。条項に引くときは、出典台帳(`research/sources/`)へ登録する段階で再取得して照合すること。

### 0.2 4つの判断(本書が想定する論点)

Issue の依頼文から、次の4つとして整理した。会議体の論点の名前と異なる場合は読み替える。

- **D1 降ろし先**: 検知と引き下げを、準拠テンプレートの実行層(自動の集計・自動の引き下げ)へ降ろすか
- **D2 措置の強さ**: 検知条件ごとに、自動で発火させるか、「検討する」(人の判断)に留めるか
- **D3 閾値の根拠の開示**: 「1件」「2か月継続」「組織が定めた値」の根拠をどう開示するか
- **D4 検知条件の設計**: どの量を、どの母数・窓・最小標本で測るか(指標の妥当性、小標本、ゲーミング)

### 0.3 既存の出典台帳との対応

次は台帳に既にある。新規の出典は、条項に引くときに登録する。

| 本書の項 | 既存の SRC |
| --- | --- |
| EU AI Act 第14条 | SRC-0487、SRC-0087 |
| Claude Code auto mode | SRC-0072 |
| Feng ら「Levels of Autonomy for AI Agents」 | SRC-0063 |
| Anthropic「Measuring AI agent autonomy in practice」 | SRC-0067 |
| ISO/IEC 42105(FDIS。TS 8200 を拡張する人間の監視の指針) | SRC-0490 |
| Google SRE 本 第3章 | SRC-0418 |
| NIST AI RMF と ISO/IEC 42001 の対応表 | SRC-0521 |

---

## 1. 規格

### F-01 ISO/IEC TS 8200:2024(自動化された AI システムの制御可能性)は、状態遷移と制御の移譲を扱うが、移譲の発火条件を公開部分では定めていない

- **出典**: ISO/IEC TS 8200:2024 *Information technology — Artificial intelligence — Controllability of automated artificial intelligence systems*. ISO/IEC JTC 1/SC 42, 2024. https://www.iso.org/standard/83012.html 。プレビュー: https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiects8200%7Bed1.0%7Den.pdf
- **検証**: [原文・部分](規格ページの概要と、VDE のプレビュー PDF の序文・目次)。本文の条項は有償のため未確認
- **確かめた内容**:
  - 範囲の4項目: "state observability and state transition" / "control transfer process and cost" / "reaction to uncertainty during control transfer" / "verification and validation approaches"
  - 序文: "Ideally, the transfer of control for an intervention occurs within reasonable time, space, energy and complexity limits"
  - 制御する主体について: 制御可能性の特徴を述べるが "does not presuppose who or what is in charge of the controlling"。制御者は "a human or another external agent"
  - 目次に 5.3(状態遷移の目標・基準・過程)、6.5 Transfer of control、6.6 Engagement of control、6.7 Disengagement of control、7.3 Controllability levels of AI systems がある
- **確かめられなかったこと**: 移譲を起こす発火条件(閾値)、劣化した状態・安全な状態の扱い、7.3 の制御可能性の水準の中身。プレビューには無い
- **関連**:
  - D1: TS 8200 は、移譲の主体を人に限らない(外部の機械でもよい)。**自動の引き下げそのものは、TS 8200 の枠組みと矛盾しない**と読める(本文未確認のため推定)
  - D2: 移譲には「費用」と「不確実性への反応」があるという枠組み。引き下げを、費用ゼロの操作として扱わない根拠になりうる
  - D3: 数値の閾値を与える資料ではない

### F-02 EU AI Act 第14条は、監督の手段の比例と停止の手段を求めるが、自律の自動の引き下げは求めていない

- **出典**: Regulation (EU) 2024/1689, Article 14 Human oversight. European Commission AI Act Service Desk, 2024. https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-14
- **検証**: [原文]
- **引用**:
  - 14(3): "The oversight measures shall be commensurate with the risks, level of autonomy and context of use of the high-risk AI system"
  - 14(4)(a): "... be able to duly monitor its operation, including in view of detecting and addressing anomalies, dysfunctions and unexpected performance"
  - 14(4)(b): "to remain aware of the possible tendency of automatically relying or over-relying on the output ... (automation bias)"
  - 14(4)(e): "to intervene in the operation of the high-risk AI system or interrupt the system through a 'stop' button or a similar procedure that allows the system to come to a halt in a safe state"
- **関連**:
  - D1・D2: 求めるのは「監督する人が、異常を検知して対処**できる**こと」と「止める手段」。**検知の後の措置を自動にすることも、人に委ねることも、条文は指定しない**
  - D4: 14(4)(b) の自動化バイアスへの意識は、本標準 5.4.6 の「監督の劣化は静かに進む」と同じ問題を指す。ただし条文は、これを比率で検知せよとは言わない
  - 開発プロセスの AI エージェントが高リスク AI システムに当たるとは限らない。**直接の適用ではなく、類比として使う**

### F-03 NIST AI RMF MANAGE 2.4 は、置き換え・切り離し・停止の仕組みと、発動の閾値を組織が定めることを求める。値は示さない

- **出典**: NIST AI 100-1 *AI Risk Management Framework 1.0*, MANAGE 2.4, NIST, 2023。取得先: https://www.stigviewer.com/controls/ai-rmf/MANAGE%202.4 (Playbook の推奨行動を併載)
- **検証**: 条文は [原文](転載サイト経由。NIST の PDF とは未照合)。Playbook の推奨行動は [二次](転載サイト)
- **引用**:
  - MANAGE 2.4: "Mechanisms are in place and applied, responsibilities are assigned and understood to supersede, disengage, or deactivate AI systems that demonstrate performance or outcomes inconsistent with intended use."
  - Playbook: "Regularly review Identify system incident thresholds for activating bypass or deactivation responses."(原文の文法の乱れを含め、そのまま)
  - Playbook: "Establish criteria for redeploying updated system components, in consideration of trustworthy characteristics."
- **未確認**: NIST AI 600-1(生成 AI プロファイル)の MG-2.4-004 は「リスク許容度に照らして、停止を正当化する具体的な基準を定め、定期的に見直す」趣旨と記憶するが、本文を取得できなかった([未確認])
- **関連**:
  - D2: 閾値の**存在**と**定期的な見直し**を求め、値は組織に委ねる。本標準の「組織が定めた値」と同型
  - D3: 値の根拠の開示までは求めていない
  - 「再配備の基準」(redeploying)は、本標準 5.4.5 の「引き下げた範囲は条件を再度満たすまで戻さない」と対応する

### F-04 ISO/IEC 42001 附属書A A.9 は、人間の監督の基準を文書化させるが、閾値や自律の調整は定めない

- **出典**: ISO/IEC 42001:2023 Annex A, A.9 Use of AI systems。取得先: ISMS.online の解説 https://isms.online/iso-42001/annex-a-controls/a-9-use-of-ai-systems
- **検証**: [二次](解説サイトの言い換え。規格の本文ではない)
- **内容**: A.9.3 が "mechanisms for human oversight and performance monitoring" を目的に含め、A.9.4 が "criteria for human oversight" を文書化の内容に挙げる(いずれも解説サイトの文)
- **関連**: D2・D3 に対して、**管理システム規格は「基準を定めて記録せよ」までで、値も発火の自動化も課さない**。本標準が自動を課すなら、それは 42001 より踏み込んだ要求になる

### F-05 SAE J3016 は、移譲の要求とフォールバックを定義するが、運用実績で水準を上げ下げする仕組みではない

- **出典**: SAE J3016_202104 *Taxonomy and Definitions for Terms Related to Driving Automation Systems for On-Road Motor Vehicles*. SAE International, 2021。取得先: ANSI Blog https://blog.ansi.org/sae-levels-driving-automation-j-3016-2021/
- **検証**: [二次](ANSI の解説)。規格本文は未取得
- **引用(ANSI の解説)**: レベル3 は "with the expectation that the human driver will be ready to respond to a request to intervene when issued by the ADS"。レベル4 は "without any expectation that a user will respond to a request to intervene"
- **[未確認]**: J3016 は「レベルは測定ではなく設計意図で割り当てる(assigned rather than measured)」と述べ、ODD を外れたときの最小リスク状態(minimal risk condition)への移行を定義する、と記憶する。検索で原文を確かめられなかった
- **関連**:
  - D1・D2: J3016 の移譲・フォールバックは**その場の状況(ODD の逸脱・故障)への反応**であり、**期間の集計(差し戻し率など)で水準を変える仕組みではない**。5.4.1 が J3016 と同型と述べる3変数の枠組みは、5.4.6 の「比率で引き下げる」部分の先例にはならない
  - 自動の移譲の先例として引けるのは、記録の存在で判定できる事象(5.4.6 第1区分: Sev1/Sev2 の発生)に近い

### F-06 ISO 26262 の「劣化(degradation)」は、故障の後に安全を保つ設計上の戦略であり、統計的な発火ではない

- **出典**: ISO 26262-1:2018 の定義(Ansys medini analyze のヘルプが転載)。https://ansyshelp.ansys.com/public/Views/Secured/medini/v26101/en/medini_analyze_process/ch01s03.html
- **検証**: [二次](ツールのヘルプに転載された定義)
- **引用**: degradation = "Strategy for providing safety by design after the occurrence of failures."、safe state = "Operating mode of an item without an unreasonable level of risk."
- **[未確認]**: IEC 61508 の劣化モード、DO-178C のツール適格性は今回取得していない
- **関連**: D2 に対して、**機能安全の自動の劣化は、検出した故障(単発の事象)に対する事前設計の反応**。比率の継続で発火させる設計の先例ではない。F-05 と同じ結論

---

## 2. 業界の実務(AI コーディングエージェント、2025〜2026)

### F-07 Claude Code の auto mode は、拒否が「連続3回または累計20回」で人へ戻す自動の引き下げを実装している。値の根拠は示されていない

- **出典**: Anthropic Engineering, "How we built Claude Code auto mode: a safer way to skip permissions", 2026. https://anthropic.com/engineering/claude-code-auto-mode (SRC-0072)
- **検証**: [原文]
- **引用**:
  - "If a session accumulates 3 consecutive denials or 20 total, we stop the model and escalate to the human."
  - 非対話(`claude -p`)では "we instead terminate the process."
  - 分類器の性能(実トラフィック n=10,000 の偽陽性率 0.4%、過剰な行動 n=52 の偽陰性率 17% など)は公開されている
- **確かめられなかったこと**: 3 と 20 の由来。記事は理由を述べず、"a compromised or overeager agent" への最後の防壁と位置づけるだけ
- **関連**:
  - D1: **自動の引き下げ(自律→人の確認)を製品に実装した、現時点で最も具体的な先例**。ただし単位は1セッション、窓はセッションの中、対象は個々の操作。本標準の「範囲」「2か月」の単位とは桁が違う
  - D2: 発火は自動、解除は人(セッションを人が再開する)。5.4.5/5.4.6 の非対称と同じ形
  - D3: 定数を公開し、根拠は示していない。**業界の先例も、閾値の根拠を開示していない**

### F-08 Anthropic の観測では、自律の度合いは利用者・モデル・製品が共同で作るもので、全操作の承認を課すことに安全上の利点は示されていない

- **出典**: Anthropic, "Measuring AI agent autonomy in practice", 2026. https://www.anthropic.com/research/measuring-agent-autonomy (SRC-0067)
- **検証**: [原文]
- **引用**:
  - "by 750 sessions, this increases to over 40% of sessions"(全自動承認を使うセッションの比率。新しい利用者は約20%)
  - "more experienced users interrupt in around 9% of turns"(新しい利用者は約5%)
  - "the autonomy agents exercise in practice is co-constructed by the model, the user, and the product"
  - "effective oversight doesn't require approving every action but being in a position to intervene when it matters"
- **関連**:
  - D4: 承認の比率は経験とともに動き、介入の比率は経験とともに**上がる**。比率が「監督の劣化」だけを映さない実例。**ADR-0059(承認の比率を検知条件にしない)を支持する**
  - 差し戻し率0%の継続を形骸化とみなす 5.4.6 の行にも、同じ注意が掛かる。0% は形骸化でも、品質の向上でも、母数の不足でも起こる

### F-09 GitHub Copilot のクラウドエージェントは、固定の設計上の制約で統制し、指標による権限の自動縮小は持たない

- **出典**: GitHub Docs, "Risks and mitigations for GitHub Copilot cloud agent", 2026 時点. https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations
- **検証**: [原文]
- **引用**: "Copilot cloud agent cannot mark its pull requests as "Ready for review" and cannot approve or merge a pull request." / "By default, workflows are not triggered until Copilot cloud agent's code is reviewed" / "Copilot cloud agent only has the ability to push to a single branch."
- **否定の確認**: 指標・事象に基づく権限の自動縮小の記述は無い。管理者が手で設定を変えるだけ
- **関連**: D1 に対して、**主要なプラットフォームの統制は「固定の上限」型であり、「実績で上げ下げ」型ではない**。準拠テンプレートが既に持つ固定の上限(人確定・ブランチ保護・マージ権限)と同じ型

### F-10 自律の水準の枠組み(Feng ら)は、自律を能力から分けた設計判断とし、認証の失効は「変更」で起こす。運用の指標による引き下げは扱わない

- **出典**: K. J. K. Feng, D. W. McDonald, A. X. Zhang, "Levels of Autonomy for AI Agents", arXiv:2506.12469, 2025(Knight First Amendment Institute の論集). https://arxiv.org/html/2506.12469v1 (SRC-0063)
- **検証**: [原文]
- **引用**:
  - "an agent's level of autonomy can be treated as a deliberate design decision, separate from its capability"
  - 自律の認証: "a digital document that prescribes the maximum level of autonomy an agent can operate at"
  - 失効: "Changes to either can alter the agent's interactive behaviors and thus invalidate the certificate."
- **否定の確認**: 認証の水準を運用中の指標で引き下げる記述は無い(要約サイト aigl.blog も同じ結論。[二次])
- **関連**: D1・D2 に対して、**学術の枠組みは「上限を事前に認証し、変更で失効させる」型**。本標準の 5.4.4(リスク区分による上限の固定)と同型で、5.4.6 の比率による引き下げの先例ではない

### F-11 OpenAI の「エージェント型 AI の統治の実務」は、閾値による自動停止を「望ましいかもしれない」と未解決のまま置く

- **出典**: Y. Shavit ほか, "Practices for Governing Agentic AI Systems", OpenAI, 2023(12月). https://cdn.openai.com/papers/practices-for-governing-agentic-ai-systems.pdf
- **検証**: [原文]
- **引用**:
  - 4.7: "It may even be desirable to automatically trigger such shutdowns if risk indicators cross a certain threshold"
  - 4.7 の未解決の問い: 停止の手段が "to prevent them from being abused to police harmless or low-stakes usage of agents"
  - 4.2 の未解決の問い: "How should a user or system deployer determine and enforce which interactions need human approval" / "as a function of a model's empirical reliability on that task and other factors"
  - 4.5: 監視用の AI について "if an input causes the primary agent to malfunction, it may cause the monitoring system to malfunction, too"
- **関連**:
  - D2: 自動の発火を**提案の段階**で挙げ、閾値の決め方は未解決とする
  - D4: 4.5 の「監視側も同じ入力で壊れる」は、5.4.6 の「点検する側が同じ劣化の当事者である構成では非対称は成立しない」と同じ論理。**ただし向きが逆**で、自動の監視にも同じ弱点があることを示す

### F-12 業界団体・実務家の提案には、指標による自動の引き下げがある。値はいずれも検証されていない

| 出典 | 検証 | 内容 | 値の根拠 |
| --- | --- | --- | --- |
| J. Reavis, "Leveling Up Autonomy in Agentic AI", Cloud Security Alliance, 2026-01-28. https://cloudsecurityalliance.org/blog/2026/01/28/levels-of-autonomy | [原文](WebFetch の抜粋) | "automatically drop to Level 1 if anomalies are detected, if a security incident is underway"。CSA 自身が未解決の問いとして提示 | 値なし |
| tianpan.co, "Earned Autonomy: How to Graduate AI Agents from Supervised to Independent Operation", 2026-04-17. https://tianpan.co/blog/2026/04/17/earned-autonomy-ai-agents-progressive-supervision | [原文](無料部分のみ) | "Rollback should be automatic for predictable failure modes and manual-reviewed for ambiguous ones." 自動の引き下げ: 誤り率 5% 超(1時間)、人の上書き率が基準の2倍(4時間)、単一取引の上限超過 | 由来の記載なし。「経験的な失敗率から」と言うが測定を示さない |
| Monte Carlo, "Agentic Autonomy Is A Trust Score", 2026. https://montecarlo.ai/blog-agentic-autonomy-is-a-trust-score/ | [原文] | "Autonomy is not a configuration decision that's decided once. Rather, it is more like a score that goes up or down." 自社の監視エージェントの自動モードを**人が**引き戻した事例 | 値なし |
| Y. Roy, "The Kitchen Loop", arXiv:2603.25697, 2026-03. https://arxiv.org/html/2603.25697v1 | [原文] | 連続3回の回帰の失敗で一時停止、未処理 PR 10件で縮退(5件未満で復帰)。ドリフトと canary は警告だけ | 既定値として置くだけ。実地で発火を観測したのは停滞の遮断(11回)だけ |
| H. Zheng ほか(ExxonMobil), "Separating Capability from Permission", arXiv:2607.23438, 2026 | [原文](alphaxiv の抜粋) | 許可する自律を組織が上げ下げできる枠組み。引き下げは組織の判断 | 値なし |

- **関連**:
  - D2: tianpan の「予測できる失敗は自動、曖昧なものは人の確認」という切り分けは、5.4.6 の第1区分(記録の存在で判定)と第2区分(比率の集計)の切り分けとほぼ一致する
  - D3: **値を示す提案は、どれも根拠を示していない**

### F-13 エージェントの PR の不採用は、品質より手順・調整の要因が多い

- **出典**: R. Ehsani ほか, "Where Do AI Coding Agents Fail? An Empirical Study of Failed Agentic Pull Requests in GitHub", arXiv:2601.15195, 2026(MSR '26). https://arxiv.org/html/2601.15195v1
- **検証**: [原文](数値は論文の表から WebFetch が抜き出したもの)
- **内容**: 33,596 件のエージェント作成 PR のうち 71.48% がマージ。不採用 562 件の分類: レビュアの放置 228、重複 142、CI・テストの失敗 99、望まれない機能 24、誤った実装 19 など。著者: "Failures of agentic PRs can also be socio-technical rather than purely technical."
- **関連**:
  - D4: 不採用・差し戻しの比率は、**エージェントの品質だけでなく、レビュアの関与・作業の重複・リポジトリの慣行で動く**。差し戻し率を自律の検知条件に使うなら、母数と分類(差し戻しの理由)を定めないと、別の要因で発火する
  - 「重複」が独立の主要な理由として現れることは、5.4.6 の重複率を検知条件に置くことと整合する。ただし重複は調整の失敗(人の側の割り当て)でも起こる

### F-14 DORA の変更失敗率は、群の間で単調でなく、AI の採用と安定性の関係も単純ではない

- **出典**: R. Stephens, "DORA 2024", RedMonk, 2024-11-26. https://redmonk.com/rstephens/2024/11/26/dora2024/ (DORA *Accelerate State of DevOps Report 2024* の解説)
- **検証**: [二次](一次の報告書は未取得)
- **内容**: 2024 年は中位群の変更失敗率が上位群より低い("It's lower than the change failure rate for the high performance group")。AI の採用が 25% 増えると、配信の安定性が 7.2% 下がると推定("estimated delivery stability is expected to decrease by 7.2%")
- **関連**:
  - D3: **変更失敗率に、業界共通の閾値は無い**。群の境界は年ごとの調査で動き、群の順序すら逆転する。本標準 5.4.5 条件3 が「組織が G-1 で定めた値」とするのは妥当
  - D2: 個々の組織の失敗率で自律を自動に動かすことを正当化する、業界の基準値は存在しない

---

## 3. 指標で統制を自動に変えることの証拠

### F-15 SRE のエラーバジェット方針: 発火の条件は機械的に書くが、凍結の実行と解除は人の合意による

- **出典 1**: Google, *The Site Reliability Workbook*, "Example Error Budget Policy". https://sre.google/workbook/error-budget-policy/
- **出典 2**: Google, *Site Reliability Engineering*, Chapter 3 "Embracing Risk". https://sre.google/sre-book/embracing-risk/ (SRC-0418)
- **出典 3**: Google Cloud Blog, "An example escalation policy — CRE life lessons". https://cloud.google.com/blog/products/gcp/an-example-escalation-policy-cre-life-lessons
- **検証**: いずれも [原文]
- **引用**:
  - 方針の例: "we will halt all changes and releases other than P0 issues or security fixes until the service is back within its SLO."
  - 方針の例: "If a single incident consumes more than 20% of error budget over four weeks, then the team must conduct a postmortem."(単一の事象への規定)
  - 方針の例: 算定に争いがあれば "the issue should be escalated to the CTO to make a decision."
  - SRE 本: 予算は "provides a clear, objective metric that determines how unreliable the service is allowed to be"、"This metric removes the politics from negotiations between the SREs and the product developers"
  - CRE: "SREs are expected to make judgement calls"、方針は完全に規範的ではない。凍結は SRE が「してよい(may)」措置。自動で働くのは**検知(警報・チケットの起票)だけ**
- **関連**:
  - D2: 本標準 5.4.6 の「自動の引き下げ」に最も近い産業の先例。**ただし Google の実務で自動なのは検知であり、措置(凍結)は事前に合意した方針を人が実行する**。「事前に合意した規則なので交渉の余地が無い」ことと「機械が実行する」ことは別である
  - D2: SRE 本の「政治を取り除く」は、5.4.6 の「人間の点検を挟むと引き下げは判定になる」の動機と同じ。**事前合意の規則で目的は達するのか、機械の実行が要るのか**が会議体の論点になる
  - D3: 単一事象の規定(予算の 20% を消費 → 事後検証)は、5.4.6 の「1件」の行と同じ型。ただし措置は事後検証であり、引き下げではない。20% という値の根拠は示されていない
  - D4: 窓は4週間・30日・90日と明示し、警報は消費速度(burn rate)で掛ける

### F-16 段階的デリバリーの道具は、指標の閾値で自動に切り戻す。判定できない場合は人へ戻す

- **出典**: Argo Rollouts documentation, "Analysis & Progressive Delivery"(release-1.4). https://argo-rollouts.readthedocs.io/en/release-1.4/features/analysis/
- **検証**: [原文]
- **引用**: "`failureLimit` is the maximum number of failed run an analysis is allowed." / "The failed analysis causes the Rollout to abort, setting the canary weight back to zero." / 判定不能(Inconclusive)は "neither successful, nor failed" で、ロールアウトを一時停止し、人が再開か中止を選ぶ
- **関連**:
  - D1: **指標による自動の縮退は、配備の単位(分〜時間の窓)では成熟した実務**。準拠テンプレートの実行層でも、窓が短く母数が多い量なら実装の先例がある
  - D2: 「失敗 → 自動、判定不能 → 人」の3値。5.4.6 の「最小標本数に満たない窓では発火させない」は、この判定不能に当たる。**判定不能をどの席へ返すか**を定める必要がある
  - 対象は配備であり、エージェントの自律ではない。類比として使う

### F-17 Goodhart の法則: 代理指標で選ぶと雑音も選び、指標の操作で関係が崩れる

- **出典**: D. Manheim, S. Garrabrant, "Categorizing Variants of Goodhart's Law", arXiv:1803.04585, 2018. https://arxiv.org/html/1803.04585
- **検証**: [原文]
- **引用**: 回帰型 "selection for an imperfect proxy necessarily also selects for noise"、極端型 "selection for the metric pushes the state distribution into a region where old relationships no longer hold"、因果型 "an action on the part of the regulator causes the collapse"、敵対型 "an agent with different goals than the regulator causes the collapse"
- **関連**:
  - D4: 差し戻し率で自律を自動に下げると、(a) 差し戻しを1件起こせば0%の継続を避けられる(形だけの差し戻し)、(b) 差し戻しを避けるために変更を小さく分ける、といった操作の誘因が生まれる。いずれも敵対型・因果型に当たる。本標準の CLAUDE.md が既に「判定を通すために変更を分割しない」と禁じていることと整合する
  - D2: 指標が自動で措置を起こすほど、操作の誘因は強くなる。**自動化の強さと、操作への耐性の設計はセットで決める**

### F-18 稀な事象の計数は、管理図で信号になりにくい。「1件」で発火させるのは統計的な判定ではなく規則である

- **出典**: B. McNeese, "Rare Events and X-mR Charts", SPC for Excel(BPI Consulting). https://www.spcforexcel.com/knowledge/variable-control-charts/rare-events-and-x-mr-charts/
- **検証**: [原文]
- **内容**: 月平均 0.25 件の事象では c 管理図の上方管理限界が 1.75 になり、"It would take two injuries for the chart to show a special cause of variation."。稀な事象は "the data are converted to rates or time between events" とし、事象間の時間を X-mR 図に描くことを勧める
- **[未確認]**: Wheeler の稀な事象の扱い(事象間の時間の管理図)を一次資料では確かめていない
- **関連**:
  - D3: **「Sev1/Sev2 が1件で引き下げる」は、統計的に有意な劣化の検知ではなく、事象そのものを理由とする規則**として書くのが正確。根拠の水準の開示では「統計的根拠は無いが、事象の重大さで発火させる設計判断」と区別して書ける
  - D4: 「差し戻し率0%が2か月」も、母数が小さければ偶然に起こる。小規模チームで月の変更数が少ないと、0% の継続は形骸化と区別できない。5.4.6 が既に「最小標本数に満たない窓は継続の期間に数えない」と定めていることは、この問題への対処として外部の実務と整合する

### F-19 偽の警報が多いと、受け手は警報を無視する(警報疲労)

- **出典**: Anesthesia Patient Safety Foundation, "Alarm Fatigue and Patient Safety", *APSF Newsletter* Vol. 34 No. 1, 2019-06. https://www.apsf.org/article/alarm-fatigue-and-patient-safety/
- **検証**: [原文]
- **引用**: "Alarm fatigue refers to an increase in a health care provider's response time or a decrease in his or her response rate to an alarm as a result of experiencing excessive alarms." / "The cry-wolf effect may lead users to mistrust and possibly ignore subsequent alarms from the same or similar devices."
- **関連**:
  - D2: 自動の引き下げが誤って頻発すると、引き下げそのものが軽んじられ、迂回・解除の慣行が生まれる。**自動にするなら、誤発火の率を観測し開示する仕組みが要る**(Claude Code auto mode は分類器の偽陽性率を公開している。F-07)
  - 分野は医療機器であり、開発プロセスへの転用は類比

---

## 4. 見つからなかったもの

| 探したもの | 結果 |
| --- | --- |
| AI エージェントの自律を、差し戻し率・重複率・手戻り率で自動に引き下げる規格の条項 | **見つからない**。ISO/IEC TS 8200(公開部分)、EU AI Act 第14条、NIST AI RMF、ISO/IEC 42001、SAE J3016 のいずれも、検知の後の措置を自動にせよとは求めない |
| 「1件」「2か月」「連続3回」などの値を実証で導いた研究 | **見つからない**。Claude Code の 3/20、tianpan の 5%/2倍、Kitchen Loop の 3/10 はいずれも根拠を示さない |
| 差し戻し率0%の継続とレビューの形骸化の関係を測った研究 | **見つからない**(内部の EV-0146 の記述と一致) |
| 指標による自律の自動の引き下げを運用し、効果(誤発火率・見逃し率)を報告した事例 | **見つからない**。Claude Code auto mode は分類器の性能を報告するが、拒否の上限 3/20 の発火の頻度・効果は報告しない |
| ISO/IEC TS 8200 の 7.3「制御可能性の水準」の中身と、移譲の発火条件 | 本文が有償で未確認 |
| NIST AI 600-1 MG-2.4 の推奨行動の原文 | 取得できず([未確認]) |
| SAE J3016 の「設計意図で割り当てる」の原文 | 取得できず([未確認]) |
| DORA 2024 の変更失敗率の群ごとの数値 | 二次資料が図の数値を転記しておらず未確認 |

---

## 5. 示唆のまとめ(会議体への材料。結論ではない)

### D1 降ろし先(実行層へ降ろすか)

- 自動の引き下げを**製品に実装した先例はある**が、単位はセッション内の操作(Claude Code の 3/20)か配備の窓(Argo Rollouts)であり、どちらも窓が短く母数が多い(F-07、F-16)
- 月単位の比率で、範囲ごとの自律を自動に下げる実装の先例は**見つからない**。主要なプラットフォームは固定の上限型(F-09、F-10)
- 規格は、検知と停止の**手段を持つこと**を求め、措置の自動化は求めない(F-02、F-03、F-04)
- したがって、降ろすなら第1区分(記録の存在で判定できる事象)と、集計の表示(検知まで)が先例に支えられる。第2区分の自動の措置まで降ろすことは、外部の先例の外に出る

### D2 措置の強さ(自動か「検討する」か)

- 産業で最も近い先例(SRE のエラーバジェット)は、**検知は自動、措置は事前に合意した規則を人が実行**(F-15)。「人の判断を挟まない」ことと「機械が実行する」ことを分けて議論できる
- 自動の措置は、予測できる失敗・判定できる事象に限り、曖昧なものは人へ戻す、という切り分けが複数の資料に共通する(F-12 tianpan、F-16 Argo の判定不能、F-05/F-06 の機能安全)
- 自動にするほど、操作の誘因(F-17)と警報疲労(F-19)が強まる。自動にする行には、誤発火の観測と開示を併せて求めるのが外部の実務と整合する
- 現行の「検討する」(重複率・手戻り率の行)は、指標が品質以外の要因で動く(F-13)ことを踏まえると、外部と矛盾しない。ただし「検討する」は 5.4.6 冒頭の「引き下げは自動」と同じ節の中で食い違う。**どちらが誤りかは本書では決めない**

### D3 閾値の根拠の開示

- 外部の値(3/20、5%、2倍、20%、3/10)は、**どれも根拠を開示していない**。本標準が EV マークで E0 を開示することは、業界より透明性が高い(F-07、F-12、F-15)
- 「1件」は統計的な検知ではなく、事象の重大さによる規則として書くのが正確(F-18)。EV マークの「根拠の水準」と「差し替え条件」は、その性質に合わせて書ける(例: 統計の根拠ではなく、誤発火の件数と見逃しの件数の観測で差し替える)
- 変更失敗率など業界の指標にも共通の閾値は無い(F-14)。「組織が定めた値」とする箇所は、値ではなく**値の決め方と見直しの周期**を開示の対象にするのが NIST の型(F-03)

### D4 検知条件の設計

- 差し戻し率・不採用率は、レビュアの関与・重複・慣行で動く(F-13)。承認の比率は経験で動く(F-08)。**ADR-0059 が承認の比率を外した理由は、差し戻し率にも一部当てはまる**。差し戻しの理由の分類を母数の定義に含めるかが論点になる
- 小標本の窓で発火させない現行の規定(5.4.6 の最小標本数)は、SPC の実務と整合する(F-18)。判定不能の窓を誰へ返すかを定めていない点は、Argo の判定不能と比べて欠けている可能性がある(F-16)
- 監視する側も同じ入力で壊れうる(F-11 の 4.5)。自動の検知を、人の点検の代替として無条件に信頼する根拠も無い

### 根拠水準マーク(ADR-0026)への影響

- 本調査で、**5.4.6 の各値(1件、2か月継続、組織が定めた値)を外部の実証で支える資料は見つからなかった**。EV-0146 の「測定は見つかっていない」は外部調査でも維持される
- 「1件」に EV マークを付ける場合、根拠の水準は E0 だが、性質は「統計の閾値」ではなく「事象の重大さによる規則」である旨を書き分けることを提案材料とする
