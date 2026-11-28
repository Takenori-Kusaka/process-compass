# #473 外部調査の照合(2026-11-28)

指揮役の 4 本のメモ(`E:/Github/process-compass/tmp/deep-research/research_notes/AIレビューの位置付け 2026年11月/`)が挙げる出典を、一次の所在で開いて逐語で照合した。調査はやり直していない。取得日はすべて 2026-11-28。出典台帳へは未登録で、下書きを `sources-draft/draft-NN-*.yaml` に置いた(SRC 番号は議長が振る)。

判定の凡例: 照合済み(一次) / 照合済み(二次のみ) / 食い違う / 開けない / メモ自身が未確認。**照合できなかった値は引かない**。

## 1. 最も重要な発見(議長向け)

1. **arXiv:2603.12123 の改訂(主張 5)を「優位の取り下げ」と一括りにできない**。v2 でも「CCR は同一セッションの 2 回目(SR2)に頑健に優る」は残る(3 回平均 p=0.004)。取り下げられたのは、1 回のレビュー(SR)と文脈つきサブエージェント(SA)に対する優位(1 回目だけのもの。SR に対し p=0.26)。第8章の理由 3 が「同一セッションでの再レビューは効かない」を言うなら、v2 でも成り立つ。「別の文脈の AI が一番良い」を言うなら、成り立たない。
2. **「約 73% 見逃し」は論文の文ではない**。表 2 の CCR の再現率 27.1%(v1・v2 で同じ行)からの 100−27.1 の算術で、CCR 条件の値、単一模型・注入欠陥 150 件・単著の preprint。論文に見逃しの割合を書いた文は無い。引くなら「再現率 27.1%(CCR、注入欠陥)」と書く。
3. **「33 件中 32 件」(主張 11)は、PR の説明文を LLM で練り直した攻撃が、CVE の再混入(セキュリティの判定)に対して成功した率**。定型文の攻撃は効かなかった(メモの記述)。AI のレビュー全般の誘導率ではない。Claude Approvals の文書は同じ弱点を自ら明記しており、こちらは一次で確かめた。
4. **「適合率 3〜17%」は、CRBugBench など最近の測定に当てはまらない場合がある**。SWR-Bench(2025-09)の適合率 2.79〜16.65% が出所で、CR-Bench(Nutanix、2026-03)の 3.56% も同じ水準。一方、Martian のオンライン版(開発者がその後に変えた箇所との一致で測る)は適合率 64.9〜76.2%(メモ。Greptile の記事経由で一次未確認)。**定義が違う**ので、引くなら定義を併記する。CRBugBench は適合率を報告していない。
5. **Intercom は「承認は AI、マージは人」の型ではない**。本文は AI の承認システムが「reviewing, approving, and shipping to production」とし、マージの操作を人が行うとは書いていない。人が操作する型に当たるのは Ona(「a person always clicks the merge button」)と Rewind(SRC-0248 既存)。Customer.io と Intercom は本文に明記なし。

## 2. 主張ごとの照合表

| # | 主張 | メモの所在 | 一次の URL | 逐語(原語) | 判定 | 引いてよい値 |
|---|---|---|---|---|---|---|
| 1 | Copilot の承認が 2026-10-28 に GA、必須承認に数える、既定オフ | industry_practice.md L13・L199 | github.blog/changelog/2026-10-28-copilot-code-review-merge-with-confidence-with-max-and-approvals | "Copilot approvals, previously available in public preview, are now generally available." / "that approval counts toward your repository’s required approvals." / "Approvals are off by default. Admins can turn them on at the enterprise, organization, or repository level" | 照合済み(一次)。draft-03 | GA 2026-10-28、数える、既定オフ(管理者が各水準で有効化)。補足: 2026-09-01 の preview 時点の "An approval assessment alone does not count toward merge requirements." は SRC-0179 |
| 2 | Claude Approvals が 2026-11-23 に beta。1 承認に数えられる。PR の説明文による誘導の弱点を明記 | industry_practice.md L29〜31・L201 | code.claude.com/docs/en/approvals-github-rules / claude.com/resources/articles/introducing-claude-ship | "Claude’s approving review can meet a GitHub branch rule that requires one approval." / "A pull request’s author’s text can steer a classifier’s answer." / "With Approvals on, a pull request can merge with no person but its author looking at it, or with no person at all if a bot wrote it." / "PR Steward and Claude Approvals are in beta."(ship 記事、要約経由) | 照合済み(一次)。ただし beta の逐語は WebFetch の要約で弱い(draft-05)。日付 2026-11-23 は ship 記事の日付 | 2026-11-23 beta、承認が GitHub の必須承認を満たしうる、分類器の答えを PR の本文が誘導しうると製品文書が明記。**数えるのは方針ファイルの設定しだい**(チェックは必須に指定した場合だけマージを止める) |
| 3 | 低リスクを AI に承認させる組織(Cloudflare・Intercom・Customer.io ほか)。絞り込みの軸。承認は AI・マージは人の型 | industry_practice.md L105〜150 | blog.cloudflare.com/ai-code-review/ ほか(draft-12〜15) | Cloudflare "The system classifies every MR into one of three risk tiers based on the size and nature of the diff." / "This isn't a replacement for human code review, at least not yet with today’s models." Intercom "And over 19% are auto-approved with no human reviewer in the loop." Customer.io "The AI is approving over 60% of all PRs." Ona "Fewer than 1,000 lines changed"(6 条件)/ "a person always clicks the merge button" Rewind "Around 40% of PRs come back as auto-approve."(2026-06-01) | 照合済み(一次、すべて自社報告)。**食い違い**: Intercom は人がマージするとは書かない(発見 5)。Cloudflare の公開日はページの JSON-LD の 2026-04-20(メモと一致) | 公開日: Ona 2026-04-09、Cloudflare 2026-04-20、Intercom 2026-04-21(メモは未確認だった)、Rewind 2026-06-01。絞り込みの軸はリスク層・大きさ・領域(認証・インフラ・秘密など)。数値は自社報告。第三者の測定は無い |
| 4 | CRBugBench 47.7→71.9%、人約 5 割、和集合 82.1%、結論、社内で 25.5% 低下 | empirical_evidence.md L19・L36・L140〜142 | arxiv.org/abs/2610.13668(html で本文) | "the review agents have gone from catching 47.7% to 71.9%" / "humans alone only catch 50% of the bugs, while best agent alone catches 71.9%." / "If they were to collaborate together and combine their findings, this can catch 82.1% of the bugs." / "we have seen a significant (up to 25.5%) performance decrease when we apply the same agent on our internal repositories." / "supports “lights-off” operation only for narrowly scoped, low-consequence PRs." | 照合済み(一次)。draft-02。本文の末尾 6,492 字は未読 | 47.7→71.9%(上位 5 件、事前・事後の平均、opus-4.6→opus-5、約 5 か月)、人は約 50%(構成上 49.7%)、和集合 82.1%、社内で最大 25.5% 低下、著者の結論(lights-off は範囲が狭く影響の小さい PR のみ)。**適合率は未報告**。「人 約 5 割」は論文の構成による値で、レビューの質の一般値ではない |
| 5 | arXiv:2603.12123 の 2026-10-01 改訂 | empirical_evidence.md L58〜60 | arxiv.org/abs/2603.12123v1 と v2、html v1・v2 | v1 "The ranking CCR > SR ≈ SA > SR2 holds in all three runs." / v1 "The benefit comes from context separation itself." / v2 "the first version’s advantages over these two baselines came from run 1." / v2 "CCR ranks first in run 1 only" / v2 "Reviewing again in the same session (SR2) is worse than reviewing in a fresh session (CCR)" / v2 "CCR (F1 28.6%) outperforms a second review in the same session (SR2, 21.7%) robustly." / 表 2(v1・v2 とも)"\| CCR \| 4.5 \| 1.4 \| 3.1 \| 3.6 \| 31.5 \| 27.1 \| 28.6 \|" | 照合済み(一次)。draft-01。**食い違い**: 発見 1・2 | v1→v2 で変わったこと: (a) 順位が全回で保たれたとの記述を訂正(1 回目のみ)、(b) SR の 3 回目を除外(記録を確かめられない)、(c) SR に対する CCR の優位が消える(v1 F1 24.6%・p=0.008 → v2 SR 27.1%・p=0.26)、(d) 引用の訂正。変わらないこと: CCR の適合率 31.5%・再現率 27.1%・F1 28.6%、SR2 に対する優位。メモの p 値(SR2 p=0.004、SA p=0.057、SR p=0.26)は v2 の本文で一部のみ確認(SR p=0.26 は abstract で確認。SR2 p=0.004・SA p=0.057 は本照合では逐語を取っていない)。**「約 73%」は引かない**(算術値)。 |
| 6a | SOC 2 CC8.1 | standards_and_regulation.md L50 | SRC-0538(既存。TSC PDF の写し) | "The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its objectives." | 照合済み(一次の写し。AICPA 公式の 2022 年改訂版は未読) | 主語は組織。承認者の属性は条文に無い(SRC-0538 の検証記録) |
| 6b | ISO/IEC 27001 A.8.25〜8.32 | 同 L56〜58 | iso.org の頁は 403。SRC-0938(Advisera、既存) | 本調べでは逐語を取っていない | 照合済み(二次のみ)、A.8.32 のみ SRC-0938。A.8.25〜8.31 は**開けない**(有償・403) | 「担い手を書かない」は**引かない**(一次未確認)。引くなら SRC-0938 の A.8.32 の範囲に限る |
| 6c | NIST SSDF PW.7.1 | 同 L44 | nvlpubs.nist.gov/…/NIST.SP.800-218A.pdf(pdftotext で抽出) | "Determine whether code review (a person looks directly at the code to find issues) and/or code analysis (tools are used to find issues in code, either in a fully automated way or in conjunction with a person) should be used, as defined by the organization." | 照合済み(一次)。draft-10 | and/or、組織が定める、が確認できた。注意: SP 800-218A は生成 AI・基盤モデルの**開発**向けの附属で、文言は SSDF 1.1(SP 800-218、SRC-0718)由来 |
| 6d | PCI DSS 6.2.3 | 同 L33〜36 | PCI-DSS-v4_0_1.pdf(大学サイトの写し、p.139〜140) | "Code reviews may be performed using either manual or automated processes, or a combination of both." / 6.2.3.1 "If manual code reviews are performed for bespoke and custom software prior to release to production, code changes are:" | 照合済み(一次の写し)。draft-09 | 自動のレビューを明文で許す(6.2.3 の適用注記)。6.2.3 の目的欄は「管理者による正式なレビューと承認」を要る理由に挙げる(逐語は未取得)。6.2.3.1 は手動の場合だけの条件 |
| 7a | SLSA v1.2 Source L4 | L21 | SRC-0416(既存) | "Changes in protected branches MUST be agreed to by two or more trusted persons prior to submission." / "Trusted person A human who is authorized by the organization to propose and approve changes to the source." | 照合済み(一次、台帳の既存の検証) | 人(human)を定義に書く |
| 7b | OpenSSF Scorecard はボットのレビューを数えない | L28 | github.com/ossf/scorecard の docs/checks.md(raw) | "Review by bots, including bots powered by artificial intelligence / machine learning (AI/ML), do not count as code review." | 照合済み(一次)。draft-11。SRC-0574 は同頁だが別の主張のみ | AI/ML の bot を数えない、と明文 |
| 7c | ISO 9001 8.5.6 | L60〜63 | iso.org/iso/documented_information.pdf は 403 | 取れず | **開けない**(403)。二次のみ(iso9001expert.com はメモの記述) | **引かない**。既存 SRC は 8.5.6 の本文を持たない(SRC-0643 は目録のみ) |
| 8 | 安全の規格の道具の認定(DO-330、ISO 26262-8 箇条 11、IEC 61508-3、EN 50716) | L88〜121 | Kealu、embedded.com(二次)。SRC-0529(AC 20-115D)、SRC-0528(61508-3 CDV の iTeh 抜粋)、SRC-0679(EN 50716、二次) | Kealu "we found no public record of a language-model coding tool qualified under DO-330" / embedded.com "For most teams today, though, the realistic route is TCL1 through error detection." | **照合済み(二次のみ)**。DO-330・ISO 26262-8・IEC 61508-3 7.4.4・EN 50716 の本文は有償で、本調べでは開いていない。draft-16・17 | 「ツールが功績を取る条件は別手段の検証か認定」は規格本文では**引かない**。二次の記述として引く。LLM の認定の公開例は見つからなかった(Kealu 2026-11-08 の記述。「無い」の主張なので探した範囲の記述) |
| 9 | 複数 AI の一致は独立でない(5.7 倍) | records_and_oversight.md L134 | neurips.cc/virtual/2026/171491 | "a cross-model trio fails together on 17.0% of candidates" / "5.7 times the 3.0% rate" / "cross-model joint failure is 19.2%" | 照合済み(一次、abstract のみ)。draft-06。**注意**: NeurIPS 2026 のワークショップ(AI for Verifiable Coding)のポスター、単著。「検証」は形式化・証明の文脈の候補を含み、コードレビューに限らない(abstract から確認できる範囲では、47 の Python リポジトリの 141 件でも 19.2%) | 17.0% / 3.0% = 5.7 倍、リポジトリ 141 件で 19.2%。**ワークショップ・単著・abstract のみ**と併記 |
| 10 | 適合率 3〜17% | empirical_evidence.md L14・L15・L40 | arxiv.org/html/2509.01494v1 の表 III・IV | "the top-performing combination, PR-Review leveraged with Gemini-2.5-Pro, achieved an F1 score of only 19.38%." / 適合率: 最良 16.65%、5 ツールの平均 2.79〜15.39%(表の読み取り。本文の 1 文ではない) | 照合済み(一次)、**範囲は SWR-Bench のもの**。CR-Bench の 3.56%・Reflexion 5.10% は abstract に値が無く**未照合**(abstract は "low signal-to-noise ratio" とだけ書く)。draft-08 | 「2.79〜16.65%(SWR-Bench、2025-09、Python 12 プロジェクト、PR 1,000 件)」。「3〜17%」は SWR-Bench の丸め。**CRBugBench には当てはまらない**(未報告)。発見 4 |
| 11 | PR の説明文で AI のレビューを誘導(33 件中 32 件) | records_and_oversight.md L84 | arxiv.org/abs/2603.18740(既存 SRC-0394) | "crafting PR metadata to bias ACR security judgments." / "is successful in 32/33 (97%) cases." | 照合済み(一次)。ICSE 2027 採録予定、v5(2026-10-27 改訂)。SRC-0394 は v3 の記録なので版の更新が要る | 33 CVE・20 プロジェクト・2 パイプライン(Claude Code と CodeRabbit)、LLM で練った攻撃が 32/33(97%)。**セキュリティの判定**に対する値。説明文を除くと 32 件中 16 件で検出が戻る(SRC-0394 の c3。abstract には無い。本照合では未取得) |
| 12 | AI のレビューを先に見た人の注意が寄る(統制実験 29 名) | empirical_evidence.md L115 | arxiv.org/abs/2411.11401 | "We run a controlled experiment with 29 experts who reviewed different programs" / "Reviewers tend to focus on the code locations indicated by the LLM" | 照合済み(一次、abstract のみ)。draft-07。本文の値(中央値 50%、72 レビュー、89%)は未取得 | 29 名、LLM の指した箇所に集中する傾向。注入欠陥・2024 年の模型。**数値の中身は引かない**(本文未確認) |

## 3. Issue の要約と一次の文が食い違った点

| Issue の記述 | 一次 | 扱い |
|---|---|---|
| 文脈の分離の優位は取り下げられた(見逃しの値は変わらない) | 取り下げは SR・SA に対する優位のみ。SR2(同一セッションの 2 回目)に対する優位は p=0.004 で残る。「約 73%」は論文の文でなく CCR の再現率 27.1% からの算術 | 第8章の理由 3 と FND-0087 の読み直しは「どの比較に依るか」で分ける |
| 33 件中 32 件を誤らせた研究(PR の説明文で AI のレビューの判定を誘導) | セキュリティの判定(CVE 再混入)で、LLM で練った説明文の場合。定型文は効かなかった(メモの記述) | 「セキュリティ判定で、練った説明文により」と範囲を付ける |
| 適合率は低い(独立の測定で 3〜17%) | SWR-Bench 2025-09 の値。Martian のオンライン版は適合率 64.9〜76.2%(定義が違う。Greptile の記事経由、一次未確認) | 定義を併記。CRBugBench は未報告 |
| 承認は AI、マージの操作は人、と分ける型もある | Ona と Rewind は人。Intercom・Customer.io は本文に明記なし | Intercom は型に入れない |
| OpenSSF Scorecard は AI を含むボットのレビューをコードレビューに数えない | 一致(逐語あり) | 追加の食い違いなし |
| 人のレビューも約 5 割 | 論文の構成上の値(レビュー前に見つかった欠陥 49.7%、マージ後に直された欠陥 50.3%)。"humans alone only catch 50%" | 人の検出率の一般値にはしない |
| 上位 5 件の再現率 47.7%→71.9% | 事前・事後の欠陥の平均、opus-4.6→opus-5(copilot-cli)。事前のみは 79.6%、事後のみは 64.2%(メモ。本照合では未取得) | 「平均」と併記 |
| Claude Approvals の承認が 1 承認に数えられる | 方針ファイルの設定しだい。チェックを必須にした場合だけ止める。推奨は観察(observe)から始める | 既定ではなく選択機能 |
| 規格の多くは担い手を書かない(ISO/IEC 27001 A.8.25〜8.32) | 本調べでは一次を取れていない | 引かない |

## 4. 4 本のメモから審議に要る分の写し

### industry_practice.md

- 主要製品の多くが「AI の承認を必須承認に数える」機能を既定オフの選択機能として持つ(Copilot GA、CodeRabbit、Greptile、Cursor、Claude Approvals)。例外は GitLab Duo(承認はするが必須承認に数えない)と OpenAI Codex(代替しないと書く)。どのベンダも一律の全 PR への適用を勧めず、低リスクへの限定・リスク上限・パス除外・人の必須承認を Git ホスト側で課すことを勧める(L13)。**本照合では Copilot と Claude のみ一次で確認。ほかの製品は未照合**。
- 低リスクで AI に承認させる 2026 年の公開事例は、ツールを売る側か小〜中規模の SaaS が大半で、数値は自社報告。Google・Microsoft・Uber・OpenAI・Amazon は AI を助言または追加の層に置き、人の承認を残す(L105)。「AI に承認させる運用の一次資料を見つけられなかった」組織の列挙あり(Shopify・Stripe・Atlassian ほか)。
- 人に残す領域は事例で共通: 認証・認可、決済、DB スキーマ、インフラ・CI、秘密・暗号、公開 API、依存、**誰が承認できるかを決めるファイル自体**(L161)。
- 自作の事例が持っていたガードレール(決定的な評決エンジン、shadow mode、四半期レビュー)は、設定ひとつで有効にする製品の利用者に引き継がれる保証が無い(L222)。
- レビュー設定をどのブランチから読むかは改ざん耐性の要点。Anthropic(既定ブランチ)・Cursor(base)は PR から変えられない。CodeRabbit は既定で PR ブランチ側、Copilot の指示は head から読む(L91。メモ。本照合では未取得)。
- 未読・未確認: Copilot の承認と CODEOWNERS・「最新の push の承認を要求」の相互作用は一次文書に記述が無い。Claude Approvals の setup・classifiers・pull-requests の各頁は未読(L95〜97)。

### records_and_oversight.md

- PR の説明文は AI のレビューの判定を動かす攻撃面(L84。照合済み)。別モデル 3 つの同時の誤りは独立の仮定の 5.7 倍(L134。照合済み)。
- 公開の標準の様式は無い。SLSA はレビューの証明の形式を未定義とする(Issue「分かっていないこと」に同じ。本照合では SLSA の該当文を未取得。メモの記述)。
- 基準の項目ごとに「確かめた・確かめなかった」を残す公開の実例は見つからなかった(メモの探索の記述)。

### standards_and_regulation.md

- 枠組みは 3 型に割れる: 型1 人を明記(SLSA L4、Scorecard、PCI 6.2.3.1 手動の場合、IEEE 1028、ISO 9001 8.5.6、EU AI Act 14 条、EASA NPA 2025-07)、型2 担い手を書かない(SOC 2 CC8.1、ISO 27001 A.8.25〜8.32、NIST SSDF PW.7、PCI 6.2.3、ISO 9001 8.3.4)、型3 ツールが検証の功績を取る条件を定める(DO-178C/DO-330、ISO 26262-8 箇条 11、IEC 61508-3 7.4.4、EN 50716)(L8〜10)。本照合で一次を確かめたのは SLSA、Scorecard、SSDF、PCI、SOC 2 の一部。
- 「人を求めるか」は枠組みの目的で分かれる。内部者の単独の改変を防ぐ枠組み(SLSA L4、Scorecard)は人を定義に入れる。欠陥の発見を目的にする条項(SSDF PW.7、PCI 6.2.3)は自動を許す(L76)。この整理はメモの読みで、規格の文ではない。
- PCI SSC は 2025-09 の指針で、パイプライン全体の完全自動化と承認の責任を AI に負わせることを「すべきでない」とした(L15)。**本照合では未取得。引かない**(一次を開いていない)。
- LLM の検証ツールを認定した公開例は見つからない(Kealu の記述。上記)。

### empirical_evidence.md

- 測り方で再現率が大きく変わる(実在の欠陥 2〜4 割、開発者がレビュー後に直した変更 約 5 割・適合率 7 割前後、1 PR に既知欠陥 1 件 4〜8 割)。合否の根拠に引くなら定義を併記(Inferences)。
- 本番での成果の測定(すり抜け欠陥・障害の減少)は、Google・Microsoft・Meta・Uber・Atlassian・Ericsson のいずれも見つからなかった(Gaps。メモの探索の記述)。
- 無言の承認の率の一次の値は得られなかった。人が AI の要約を先に見たときの見逃し率を実在の欠陥で測った研究は Tufano の 1 件(注入欠陥、29 名)のみ(Gaps)。
- 二次・未検証のため**引かない**: Fagan 1976 の 82%、Capers Jones、SmartBear、Czerwonka 約 15%、DORA 2024/2026 の係数、Faros・LinearB の値、CR-Bench-v2 の約 33%(abstract のみ)。
- 欠陥の型で AI の強弱が分かれる(局所の論理・堅牢性は強く、設計意図・保守性・要求との一致は弱い)。「特定の型で AI が人を上回る」ことを直接示した査読済みの測定は見つからなかった(Inferences)。

## 5. 分かっていないこと(メモの探索の記述。「無い」の照合はしていない)

- 本番へすり抜ける欠陥が減ったかを測った公開の測定(メモの探索範囲: 上記 6 社)。
- 自動承認の誤り率の第三者の測定。数値は自社報告(本照合の事例 5 件も自社報告)。
- 人が要約だけを見て承認する害を測った対照実験。
- AI のレビューの記録の標準の様式。
- 監査人が AI だけの承認を統制として認めた、名前つきの事例。

## 6. 照合の集計と限界

- 照合済み(一次): 主張 1・2・4・5・6c・6d・7a・7b・9・10(SWR-Bench の範囲のみ)・11・12、事例 3(Cloudflare・Intercom・Customer.io・Ona の逐語。Rewind は SRC-0248 と本調べ)。
- 照合済み(一次の写し): 6a(SRC-0538)、6d(大学サイト)。
- 照合済み(二次のみ): 6b の A.8.32(SRC-0938)、8(Kealu・embedded.com)。
- 開けない・引かない: 6b の A.8.25〜8.31(iso.org 403)、7c ISO 9001 8.5.6(iso.org 403)、8 の規格本文(有償)、CR-Bench の適合率 3.56%・5.10%、PCI SSC の 2025-09 の指針、Martian の適合率(Greptile の記事経由)。
- 本照合の取得は abstract・html の抜粋で、WebFetch の要約モデルを経る。逐語は取得ページの文だが、機械照合(`npm run lint:sources`)と目隠し抽出は未実施。下書き yaml の verification は partial とした。
- 製品の名は記録にのみ書いた。条項へは書かない。
- 下書き 17 件(`sources-draft/`)。既存の台帳と重複するもの: draft-01 は SRC-0009 の版の更新、draft-11 は SRC-0574 への主張の追加、SRC-0394(2603.18740)・SRC-0416(SLSA)・SRC-0538(SOC 2)・SRC-0248(Rewind)・SRC-0938(A.8.32)・SRC-0179(Copilot の preview)は既存のため下書きを作っていない。
