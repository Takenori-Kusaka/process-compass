# #472 外部の調査の照合(external.md の値と規格の前提)

- 照合日: 2026-11-28。新しい主張は足していない。`external.md` は書き換えていない
- 判定語: **照合済み(一次)** / **照合済み(二次のみ: どの二次か)** / **値が食い違う** / **開けない**
- **照合できなかった値は「引かない」**(各行に明記)。逐語は原語のまま、50 語以内
- 台帳 SRC を経由した値は、台帳が `verified`(人の確認はいずれも `humanChecked: false`)である。今回の再開封の有無を各行に書いた

## 1. 表 B・「人でも同じ」の値

| # | 値 | 判定 | 根拠(一次の所在・逐語) | 引くときの注意 |
|---|---|---|---|---|
| 1 | 実質的な人のレビューを受けた merge 済み PR 約48% → 約21%(SRC-0455) | 照合済み(一次、台帳経由)。今回は arXiv abstract(arxiv.org/abs/2607.01904)だけ再開封し、**abstract に 48/21 も 21.2/44.3 も無かった**(abstract は「load per reviewer doubled」のみ)。数値の逐語は台帳が本文で照合済み | 台帳 SRC-0455#c2「substantive-review coverage among merged pull requests drops from a pre-mandate peak of ∼48% to ∼21%」。#c1「mean PRs per active developer rose from 21.2 … to 44.3」 | 1社の強制施策(2x mandate)の縦断。因果でなく観察。再開封していないので、裁定で決定的に引くなら本文の該当図を一度開く |
| 2 | AI(エージェント型)PR のレビュー着手待ち 17.6 時間 対 3.4 時間(LinearB) | 照合済み(一次、台帳経由)。今回は LinearB の blog 頁を再開封したが、その頁に時間の値は無かった | 台帳 SRC-0044(linearb.io/library/engineering-benchmarks-and-research)の表「Agentic AI 89 293 17.6 0.17」「Unassisted 26 157 3.4 0.37」(p75、時間)。8,109,244 PR | 倍率は頁ごとに違う: blog 頁は「4.6x」と「5.3x」の両方を載せ、表の値からの計算は 5.2 倍。**倍率は引かず、17.6 と 3.4 を p75 と明記して引く**。報告は「相関」と自己限定。AI 支援 PR のレビュー自体は 3.2 時間(人手 4.2 時間)で速い。着手待ちだけが遅い |
| 3 | 人の承認が慣れで緩む(阻止率 約17% → 約5%) | 照合済み(一次、台帳経由)。今回 claude.com の頁を再開封し逐語を確認 | 「The testers caught the dangerous command just 13.6% of the time (143 of 1,053)」「they blocked about 17% of dangerous commands early in a session, dropping to about 5% after 50 or more prior prompts」(SRC-0290) | 1,053 は「paid testers」の数で、1人1回の試行(各人が1回、危険なコマンドを差し込まれた)。Anthropic 自社の実験で、自社の auto mode を宣伝する頁。「慣れ」の因果の検定は頁に無い |
| 4 | AI 同士が同じ誤答を選ぶ率 約60%(偶然水準 33%) | 照合済み(一次、台帳経由)。今回は再開封せず | 台帳 SRC-0387「on Helm, pairs of models agree on average about 60% of the time when both models are incorrect」。§3.2 が 1/3 を「各問に誤答選択肢が3つ」と説明。HELM は 71 LLM・14,042 問(MMLU) | 設問は選択式の分類で、コードレビューではない。偶然水準 33% は4択という前提つき |
| 5 | 使う人の理解の低下(小テスト 50% 対 67%) | 照合済み(一次)。ただし**数の出所が頁と本文で違う** | Anthropic の頁(逐語):「the AI group averaged 50% on the quiz, compared to 67% in the hand-coding group」「We recruited 52 (mostly junior) software engineers」。arXiv 2601.20245 §5.2.2 本文(pdftotext):「For a 27-point quiz, this translates into a 15.4% score difference or 2 grade points」(Cohen d=0.738, p=0.010) | 本文に「50%」「67%」の表現を見つけられなかった。**主に本文の 15.4%(d=0.738)を引き、50/67 は「Anthropic の頁の表現」と断る**。完了時間の短縮「約2分」は頁の逐語で有意でない。本文は 26 名ずつの割付。小標本・短期・単一ライブラリ |
| 5b | METR: 完了時間 +19%、予測 24% 短縮、事後 20% 短縮、16名・246 タスク | 照合済み(一次)。arXiv 2507.09089 の abstract で逐語を確認 | 「allowing AI actually increases completion time by 19%」「developers forecast that allowing AI will reduce completion time by 24%」「estimate that allowing AI reduced completion time by 20%」「16 developers with moderate AI experience complete 246 tasks」 | abstract は「moderate AI experience」。「経験ある」は題名(Experienced Open-Source Developer)に基づく。yaml の url を arXiv に直した |
| 6 | 人のレビューの欠陥検出率 約半数(Capers Jones) | 照合済み(一次)。原文 PDF を開いて確認 | Jones 白書(Copyright 2011)Table 2(最小/平均/最大): Informal peer reviews 35/50/60、Formal code inspections 60/85/96、Desk checking 25/45/55、Pair programming 40/55/65、Static analysis 65/85/95 | 白書は標本数・測定法を示さない。「約半数」は**非公式ピアレビューの平均**で、正式の検査は 85%。「検査 93%・机上 27%」は今回未照合なので**引かない**。draft-07 は二次経由でなく原文を開いた |
| 7a | Bacchelli & Bird 2013: 成果は知識の共有ほか | 照合済み(一次)。Microsoft Research の出版頁で abstract を逐語確認 | 「finding defects remains the main motivation for review」「reviews are less about defects than expected and instead provide additional benefits such as knowledge transfer, increased team awareness, and creation of alternative solutions」「code and change understanding is the key aspect」 | **abstract は「成果の中心が知識の共有」とは書かない**。動機は欠陥発見のまま、成果に追加の恩恵がある、と読む。本文の数は未読(引かない) |
| 7b | Sadowski 2018(Google)の該当の文 | 照合済み(一次)。PDF(storage.googleapis.com/gweb-research2023-media/pubtools/4476.pdf)を pdftotext で逐語確認 | 「developers have to wait for initial feedback on their change a median time of under an hour for small changes and about 5 hours for very large changes」。「the median number of lines modified is 24」。「knowledge transfer is part of the educational motivation for code review」。要旨:「corroboration for the importance of code review as an educational tool」 | 欠陥発見の率の測定ではない。変更は小さいほど速く、「小さい変更を勧める」(「strongly encouraged to make small, incremental changes」)とだけ読む。**200〜400 行の出所ではない** |
| 8 | レビューの速さと量の上限(200〜400 行、毎時 500 行以下) | 照合済み(一次の頁)。ただし**yaml の数が食い違っていた**ので直した | SmartBear の頁(逐語):「developers should review no more than 200 to 400 lines of code (LOC) at a time」「Inspection rates should under 500 LOC per hour」「performance starts dropping off after about 60 minutes」 | **「毎時 300〜500 行」は頁に無い(食い違い。500 行/時の未満だけ)**。「約2,500件・320万行」の Cisco の標本もこの頁に無く未照合なので**引かない**。ベンダー自社報告で独立の再現は見つからない |
| 9 | CodeRabbit: 指摘 10.83 対 6.45(約 1.7 倍)・470 PR | 照合済み(一次の頁) | 「AI-authored changes produced 10.83 issues per PR, compared to 6.45 for human-only PRs」「we cannot guarantee all the PRs we labelled as human authored were actually authored only by humans」 | 自社報告。論理 1.75 倍・保守性 1.64 倍は未照合なので引かない |
| 10 | Veracode: 約 45% | **値が食い違う(言い方)** | 頁(逐語):「45% of code samples failed security tests and introduced OWASP Top 10 security vulnerabilities」「we tested over 100 large language models」 | draft-06 の「80 課題」「選択肢のある課題で脆弱な選択」は**頁に無い。引かない**。直した言い方は「コード標本の 45% が試験に落ちた」 |
| 11 | 思考の連鎖がヒントの使用を明かす率 20% 未満 | 照合済み(一次)。arXiv 2505.05410 abstract | 「CoTs reveal their usage of hints in at least 1% of examples where they use the hint, but the reveal rate is often below 20%」 | モデル名(Claude 3.7 Sonnet・DeepSeek R1)と MMLU 28%・GPQA 20% は今回未照合なので**引かない**。推論ベンチの設定であり、コード変更の問い返しではない |

### 引かない値(まとめ)

- SmartBear の「毎時 300〜500 行」「約 2,500 件・320 万行」(頁に無い)
- LinearB の「5.3 倍」「4.6 倍」(頁ごとに食い違う。17.6/3.4 を引く)
- Veracode の「80 課題」「脆弱な選択を選んだ」
- Capers Jones の別の版「検査 93%・机上 27%」
- CodeRabbit の「論理 1.75 倍・保守性 1.64 倍」
- CoT 研究のモデル名と MMLU/GPQA の頭打ちの値
- Bacchelli & Bird の「成果の中心は知識の共有」という言い方(abstract は「追加の恩恵」)
- SRC-0455 の 48%/21%・21.2/44.3 は台帳では verified だが、今回は本文を再開封していない。決定的に引くなら一度開く

## 2. 規格・法令の前提

| 項目 | 判定 | 逐語と所在 | 既存の台帳 | 読めなかった点 |
|---|---|---|---|---|
| ISO 9001:2015 7.2(力量) | 照合済み(二次のみ: Wilkshire Consulting の頁が ISO 本文を転載。auditortrainingonline も同文) | 「The organization shall: a) determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system; b) ensure that these persons are competent on the basis of appropriate education, training, or experience; c) … evaluate the effectiveness of the actions taken; d) retain appropriate documented information as evidence of competence.」 | SRC-0643(目録)、SRC-0648(JIS Q 9001 の表紙)、SRC-0902(JSA プレビューは序文のみ) | 一次の本文は有償。ISO OBP は 403(開けない)。公式の第三者の参考: ISO/IAF の APG「Auditing competence」(committee.iso.org)は 7.2 を引くが逐語は未読 |
| 同 8.4(外部提供) | 照合済み(二次のみ: Wilkshire Consulting、auditortrainingonline) | 8.4.1「The organization shall ensure that externally provided processes, products and services conform to requirements.」。8.4.3 は外部提供者へ伝える事項に「the approval of … the release of products and services」「competence, including any required qualification of persons」を挙げる | 同上。SRC-0542 は 2026 版の 6.3 のみ | 一次の本文は有償。**8.4 を読むと、検収そのものでなく「適合の確保と管理の程度」を求める条項**。契約の検収の根拠にするなら別に引く |
| 同 8.6(リリース) | 照合済み(二次のみ: Wilkshire Consulting) | 「The organization shall implement planned arrangements, at appropriate stages, to verify that the product and service requirements have been met.」「The release … to the customer shall not proceed until the planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer.」「…documented information … evidence of conformity with the acceptance criteria」。iso9001help は 2026 版でも 8.6 は不変と書く(二次) | 同上 | 一次の本文は有償。8.6 は自組織のリリースの関門で、**検証者が作り手と別人であることは要求しない**(上の引用に独立の語なし) |
| ISO/IEC/IEEE 12207:2017 取得・供給、検証・妥当性確認 | 照合済み(一次のプレビューは序文・適用範囲のみ)。**各プロセスの purpose は読めていない(開けない)** | SIST プレビュー(第1版 2017): 「It provides the processes for acquiring and supplying systems.」「By an acquirer and a supplier -- to help develop an agreement concerning processes and activities.」目次の条番号: 6.1.1 取得、6.1.2 供給、6.4.9 検証、6.4.11 妥当性確認(第1版)。ISO の頁: 第1版は withdrawn、12207:2026 に改訂 | SRC-0642・SRC-0731(第1版プレビュー)、SRC-0491(第2版、2026-04。目次では 6.1.1/6.1.2 が第2版で p.33) | 取得・供給・検証・妥当性確認の purpose / outcomes の逐語。**これらの条の逐語は引かない**。第2版の条番号は第1版と違いうる(第2版の目次では取得 6.1.1・p.33) |
| ISO/IEC 20246:2017 レビューの役割・独立性 | 照合済み(一次のプレビュー、iTeh 版 15 頁)。**独立の要求は読めていない(読んだ範囲に無い)** | 「3.3 buddy check: informal review performed independently by a colleague of the author」「3.2 author check: informal review performed by the author of the work product」。役割: 「The review leader shall communicate the roles, responsibilities and focus to each review participant.」「The author (or a suitably qualified person) may describe the work product under review.」「Tasks in this activity can be performed by an individual (such as the author of the work product under review), a reviewer, …」 | 台帳に 20246 の抜き書き無し(SRC 付与前) | 20246 は、レビューの類型により作者本人のレビュー(author check)も定義に含める。**レビューが常に作者と別人であることを要求する文は、読めたプレビューの範囲に無い**。本文の役割の条(5 章)は未読 |
| IEEE 1028-2008 レビューの役割・独立性 | 照合済み(二次のみ)+**external.md A6 の引用の出所が 1028 ではない**。標準自体は開けない | 「examined by individuals other than the original author」は IEEE Technology Navigator(technav.ieee.org/topic/software-reviews)の一般の説明文で、1028 の条文ではない。1028 の公式頁: 5種(管理レビュー・技術レビュー・検査・ウォークスルー・監査)、状態は **Inactive-Reserved(2019-11-07)** | 1028 の台帳は無し | 本文は有償。非公式の写し(dokumen.pub)は保守中で開けない。1997 版の写し(IPOL の ML)から「(other than the author) verifies rework」。**1028 の独立性の条文は引かない**。1028 は現役の規格ではない点を併記する |
| IEC 61508 の独立の水準 | 照合済み(二次のみ: 初版の写し+解説。ed2 の本文は有償) | 3 水準: 独立した人・独立した部署・独立した組織。表(ed1 の Table 4/5): 「Independent person HR HR1 NR NR」「Independent department – HR2 HR1 NR」「Independent organization – – HR2 HR」(帰結 A〜D または SIL 1〜4)。「HR: … highly recommended … If a lower level of independence is adopted then the rationale … should be detailed」(ed2 の注釈版) | SRC-0677(ESC)・SRC-0763(ANSI 共有の注釈版)・SRC-0678(exida)・SRC-0528(第3版 CDV の preview)・SRC-0649(目録) | 出所: law.resource.org の IS/IEC 61508-1:1998、exida、ESC。**独立が要るのは機能安全の評価(FSA)であり、日常のコードレビューではない**。ed2 の逐語(8.2.12〜8.2.14)は有償で未読 |
| 民法 559 条・562 条〜・請負の担保責任 | 照合済み(一次)。e-Gov 法令 API v2 の全文(改正施行 2026-06-24 版)で確認 | 559「この節の規定は、売買以外の有償契約について準用する。ただし、その有償契約の性質がこれを許さないときは、この限りでない。」562「引き渡された目的物が種類、品質又は数量に関して契約の内容に適合しないものであるときは、買主は、売主に対し、目的物の修補、代替物の引渡し又は不足分の引渡しによる履行の追完を請求することができる。」563 代金減額、564 損害賠償・解除、566 期間制限(知った時から1年以内の通知) | SRC-0639(632 条の逐語のみ検証済み。562 条以下は未登録) | **請負は 559 条の準用で 562〜564 条が及び、請負に固有の規定は 636 条(注文者の供した材料・指図による不適合は追及できない)と 637 条** |
| 民法 636 条・637 条(請負の期間制限)・633 条(報酬) | 照合済み(一次) | 637 条 1項「注文者がその不適合を知った時から一年以内にその旨を請負人に通知しないときは、…履行の追完の請求、報酬の減額の請求、損害賠償の請求及び契約の解除をすることができない。」2項: 請負人が悪意・重過失なら適用しない。633 条「報酬は、仕事の目的物の引渡しと同時に、支払わなければならない。」 | 同上 | **民法に「検収」「検査」の語・手続の条は無い**(参照した条の本文に出ない)。検収は契約(IPA モデル契約 28 条4項。SRC-0637)で定める。external.md の「562条・637条の条文は取得できなかった」は、今回の取得で解消 |

## 3. yaml の直した点(sources-draft/)

- draft-01: abstract の逐語を3文足し、status を partial へ。「成果の中心は知識の共有」は abstract に無いと note に記した
- draft-02: **「毎時 300〜500 行」を削除**(頁は「500 行/時未満」のみ)。Cisco の「約2,500件・320万行」はこの頁に無いと注記。逐語を3文足した
- draft-03: 逐語の 15.4%(本文 §5.2.2)を c4 に足し、50/67 は頁の表現と注記。status は verified
- draft-04: url を arXiv に直し、abstract の逐語 4 文を足した。「moderate AI experience」を注記
- draft-05: 一次の頁で逐語を照合し c1〜c3 を入れた(verified)
- draft-06: **「80 課題」「脆弱な選択を選んだ」を削除**(頁に無い)。逐語の「45% of code samples failed security tests」へ。status は partial
- draft-07: 原文 PDF の Table 2 を逐語で入れ、二次経由の記述を削除。status は verified
- draft-08: url を arXiv に直し、abstract の逐語を入れた。モデル名・頭打ちの値は未照合と注記

## 4. 読めなかったもの(裁定で引かない)

- ISO 9001:2015 の一次の本文、12207 の各プロセスの purpose、IEEE 1028 の本文、IEC 61508 ed2 の 8.2.12〜8.2.14 の逐語、20246 の 5 章
- 民法・規格以外: IPA 共通フレームの該当節(今回の照合の対象外。未当たり)
- SRC-0455 の本文の数値(台帳以外の再開封なし)

## 5. 裁定に効く 3 点

1. 独立の要求の根拠は、規格では 61508(機能安全の評価に限る)と 1028 の監査の定義(1997 版の二次)が主で、20246 と 9001 8.6 には「作り手と別人」の文が読めた範囲に無い。external.md A6 の「別の目」を規格の一般の要求と書くのは強すぎる
2. 民法に検収の手続は無く、請負の不適合責任は 559 条の準用+636・637 条。検収の合格での確定は契約の定め(A1)であって法の自動の効果ではない
3. 約半数(Jones)は非公式ピアレビューの平均で、1社・複数年の測定法は白書に無い。人のレビューの「約半数」と AI の見逃し(F1 28.6% など)を並べるときは、母集団と測定が別と断る
