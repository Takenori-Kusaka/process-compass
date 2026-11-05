# #422 外部調査(2): 人のレビューを本質的な論点と長期的な決定へ絞り、残りを AI レビューで補う運用

- 調査日: 2026-11-04(以下の取得日はすべて 2026-11-04)
- 担当: survey-422-2-external(外部調査。ファイルの編集はせず、この調査メモ1枚だけを書く)
- 方法: WebSearch・WebFetch。WebFetch は要約モデルを通すため、引用は短い語句にとどめた。原文の全文照合が要る箇所は〔要照合〕と記す
- 表記: 〔一次〕= 当事者の公開資料・原論文、〔二次〕= 報道・ブログ・要約、〔未〕= 原典を読めていない、〔自社報告〕= 当事者が自分で測った数値(独立した検証がない)

## 0. 問いと前提の扱い

問い(Issue #422): 人の承認(approve)とマージを形だけにしないために、PR の本質的な論点と長期的な決定を抜き出して人のレビューをそこへ絞り、残りを AI レビューで補う運用は、実務でどう行われているか。

所有者の前提「Anthropic で行われていると聞いた」は**未確認の前提**として扱った。結論を先に書きます。

- 「AI レビューを全 PR に掛け、承認は人に残す」は、Anthropic の一次資料で確かめられた
- 「人のレビューを論点と長期的な決定へ絞る」は、**Anthropic の一次資料では確かめられなかった**。公開資料にあるのは、別の仕組みである。コードベースをリスクで層別し、低リスク層は自動承認にして人は抽出検査をし、規制対象・重要なコードにだけ人の承認を残す。さらに、アーキテクチャの詳細レビューは「以前ほど重要なゲートではない」と書いている。つまり所有者の聞いた話とは、**絞り込みの軸が違う**(論点で絞るのではなく、変更のリスク層で絞る)

## 1. Anthropic の公開一次資料で確かめられた範囲

### 1.1 Code Review 製品(2026-03-09 公開、研究プレビュー)

- 発表記事 "Bringing Code Review to Claude Code"(claude.com/blog/code-review、2026-03-09、著者名なし)〔一次・自社報告〕
  - "We run Code Review on nearly every PR at Anthropic."(社内のほぼ全 PR に掛けている)
  - "Code review has become a bottleneck"(レビューが律速になったという認識)
  - 実質的なレビューコメントが付く PR の割合: 16% → 54%
  - 指摘のうち技術者が「誤り」と付けたもの: 1% 未満
  - 1,000 行超の PR は 84% で指摘あり(平均 7.5 件)。50 行未満は 31%(平均 0.5 件)
  - "It won't approve PRs — that's still a human call"(承認しない。承認は人の判断)
  - **人のレビュアが何に注意を向けるべきかは書いていない**
- 製品文書 Code Review(https://code.claude.com/docs/en/code-review)〔一次〕
  - "A review never approves or blocks the pull request, so the decision to merge stays with your team."
  - チェックランは失敗で終わらない(neutral)。マージを止めたいなら利用者が自分の CI で重大度の件数を読んで落とす
  - 既定の観点は**正しさ**(本番を壊すバグ)。"not formatting preferences or missing test coverage"
  - 4段階: Find(複数エージェントが並列に探す)→ Verify(誤検出を落とす)→ Rank(重複除去・重大度順)→ Post
  - レビュー水準 Quick / Standard / Deep を**リポジトリごとに**変えられる(例: 定型のコードベースは Quick、重要なものは Deep)
  - 注記: "A review with no findings doesn't mean your code is error-free or secure."
- 製品文書 Customize Code Review(https://code.claude.com/docs/en/code-review-customize)〔一次〕
  - `REVIEW.md` で「Important の定義」「Nit の上限」「報告しないもの(CI が強制済みのもの、生成物)」「必ず確かめること」を指定する
  - 例示の Important: 振る舞いを壊す・データを漏らす・ロールバックを妨げるもの。後方互換でない migration を含む。例に "Treat any change under `migrations/` as Important." がある
  - `REVIEW.md` は**PR 自身の変更からは読まない**(基底ブランチ・保護された既定ブランチから読む)。レビュー指示を PR で書き換えて検査を緩める経路を塞いでいる
- 製品文書 Read and request reviews(https://code.claude.com/docs/en/code-review-pull-requests)〔一次〕
  - 重大度は 3 種: Important(マージ前に直すべきバグ)/ Nit(軽微・非阻止)/ Pre-existing(この PR が持ち込んだのではない既存のバグ)
  - "You can merge without responding to a finding, unless your repository's own rules require it."(指摘に応答しなくてもマージできる。止めるのは利用者側の規則)
- 製品文書 Best practices(https://code.claude.com/docs/en/best-practices)〔一次〕
  - 書いた本人でない者に見せる: `/code-review` は "a fresh subagent that never saw your conversation" でレビューし、"It isn't swayed by the reasoning that produced the code."
  - 仕様に照らすレビューの例で "skip style" を落とすなと注意: "A reviewer that's asked to find problems will always find *something*. If you fix every finding, you end up with extra abstraction layers and tests for cases that can't happen."(AI の指摘を全部直すと過剰設計になる、という当事者の警告)
  - 「リポジトリに書かれていない決定」の例に "what needs a migration review" を挙げる(=人が決めた「どの変更が特別なレビューを要するか」は文脈として与える必要がある)

### 1.2 社内の開発ライフサイクル(セキュリティ)

- Jason Clinton(Deputy CISO)"How Anthropic secures its AI-native software development lifecycle"(https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle 、2026-07-21)〔一次〕〔要照合: WebFetch の要約経由。全文の逐語照合はしていない〕
  - PR が開かれると、範囲を絞った複数のレビューエージェントが自動でレビューする。エージェントは指摘の妥当性を示す必要がある
  - "We tier our codebase by risk, and make deliberate decisions on what parts to automate."(リスクで層別し、何を自動化するかを意図して決める)
  - 人のレビューは "regulated or truly critical code" に取っておく。"Entire codebases have strict human approval processes."
  - 自動承認はシグナルと理由つきで記録し、**リスクで重み付けした標本を人が見る**("a risk-weighted sample")
  - 新しい AI レビュアは shadow mode で始め、信頼を得るまでコメントを人の承認に回す
  - 書くエージェントと承認する仕組みを分ける("Separating agents is critical as one (or multiple) agents act as checks on the other")。あるエージェントが別のエージェントに修正の push を頼んだ事例を、人のレビューのゲートが止めた
  - 試作が数時間でできるため、アーキテクチャの詳細レビューは "a less critical gate" になった
  - "human accountability is still central to our process."

### 1.3 社内のコード生成の割合と開発者の役割

- Marina Favaro, Jack Clark "When AI builds itself"(https://www.anthropic.com/institute/recursive-self-improvement 、2026-06 公開・本文に日付なし、9/18/2026 に更新)〔一次・自社報告〕
  - 2026-05 時点で、マージされるコードの 80% 超を Claude が書いた
  - マージ前に "an automated Claude reviewer that looks for bugs, security flaws, and other defects" が読む
  - "much of the code is written by Claude, with the engineer directing and reviewing"
  - "human review will become the bottleneck to AI development" という見通し
- Anthropic "How AI is transforming work at Anthropic"(https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic 、2025-12)〔一次・社内調査: 132 名の調査、53 名の面接〕
  - 完全に任せられるのは仕事の 0〜20%。任せるのは「容易に検証できる」「低リスク」「退屈」な作業。高リスクの作業では能動的な監督と検証を伴う
  - 研究の限界として、最先端の道具を早く使える特権的な立場であることを自ら挙げる
- "How Anthropic teams use Claude Code"(https://claude.com/blog/how-anthropic-teams-use-claude-code 、2025-07-24)〔一次〕: 検索結果の範囲では PR レビューの運用の記述を確認できなかった〔未: PDF 全文は読んでいない〕

### 1.4 二次資料にしかないもの

- Boris Cherny(Claude Code の責任者)の発言: 人格を変えた複数の Claude が PR をレビューし "pretty much every bug" を捕まえる、最終承認は人(Fortune 2026-06-11、https://fortune.com/2026/06/11/anthropic-claude-boris-cherny-doesnt-write-code-by-hand-anymore/)〔二次〕
- 社全体で 70〜90% を Claude が書く(Fortune 2026-01-29、広報の発言として)〔二次〕

### 1.5 確かめられなかった範囲(明記)

| 所有者の聞いた話の要素 | 一次資料での確認 |
|---|---|
| 全 PR に AI レビューを掛ける | **確認できた**(1.1、1.2) |
| 承認は人に残す | **一部確認**。Code Review 製品は承認しない。ただし社内の SDLC では低リスク層に**自動承認**があり、人は標本検査(1.2) |
| 人のレビューを「本質的な論点」へ絞る | **確認できなかった**。Code Review の記事は人が何を見るべきかを書いていない |
| 「長期的な決定」を人のレビューの対象として切り出す | **確認できなかった**。逆に、アーキテクチャの詳細レビューは重要度が下がったと書く(1.2)。`REVIEW.md` の例で migration を Important に上げる程度 |
| PR から論点を抜き出して人に提示する仕組み | **確認できなかった**(製品は指摘を重大度順に並べるが、「人が判断すべき論点」の抽出ではない) |

**判定**: 所有者の聞いた話は、Anthropic の公開資料では「AI が全 PR をレビュー + リスクで層別 + 重要層だけ人の承認 + 自動承認の標本検査」として確かめられる。「論点・長期的な決定で人のレビューを絞る」は Anthropic の公開資料にはなく、§2 の他社・OSS の作法(Google の設計重視、Kubernetes の API レビュー)に近い。混同して伝わった可能性があります。

## 2. 他社・OSS の実務

### 2.1 Google: 人のレビューは設計を最初に見る

- Google eng-practices "What to look for in a code review"(https://google.github.io/eng-practices/review/reviewer/looking-for.html)〔一次〕
  - 優先順: 設計 → 機能 → 複雑さ → テスト → 命名 → コメント → スタイル → 一貫性 → 文書 → コードの健全性
  - "The most important thing to cover in a review is the overall design of the CL."
  - スタイルだけの指摘は Nit と明示する。一部しか見ていないならどこを見たかを書く
  - 人が書いたコードは "every line" を見る(濃淡はつけてよい)
- Sadowski ほか "Modern Code Review: A Case Study at Google"(ICSE-SEIP 2018、https://research.google/pubs/modern-code-review-a-case-study-at-google/)〔一次・要旨のみ〕: 単独レビュア・小さな変更・速い反復が特徴。900 万件の変更を分析
- Vijayvergiya ほか "AI-Assisted Assessment of Coding Practices in Modern Code Review"(AutoCommenter、2024、https://arxiv.org/abs/2405.13565)〔一次・要旨〕: 人のレビュアが頻繁に引く「ベストプラクティス」の 68% を機械が指摘できた。=**規約で書ける指摘は機械へ移せる**という実証の一つ

### 2.2 Microsoft: AI は定型の検査、人は上位の関心へ

- "Enhancing Code Quality at Scale with AI-Powered Code Reviews"(Microsoft Engineering、2025-07-14、https://devblogs.microsoft.com/engineering-at-microsoft/enhancing-code-quality-at-scale-with-ai-powered-code-reviews/)〔一次・自社報告〕
  - 社内 PR の 90% 超(月 60 万件超)で AI がレビュアに入る。PR 完了時間の中央値 10〜20% 改善(5,000 リポジトリ)
  - 人のレビュアが構文へ寄りすぎ、重要な論理の問題を見落とすことを課題に挙げる
  - 目標: レビュアが "focus entirely on high-value feedback while AI handles major routine checks"
  - AI が PR の説明文(意図・主要な変更)を生成する
  - 承認の可否は記述なし〔未〕
- Bacchelli & Bird "Expectations, Outcomes, and Challenges of Modern Code Review"(ICSE 2013、https://www.microsoft.com/en-us/research/publication/expectations-outcomes-and-challenges-of-modern-code-review/)〔一次・要旨〕: 動機は欠陥発見だが、実際の成果は知識移転・チームの認識・代替案。中心の課題は**変更の理解**

### 2.3 Meta: 低リスクの変更を自動承認し、人の注意を移す

- "Automating Low-Risk Code Review at Meta: RADAR, Risk Calibration, and Review Efficiency"(arXiv:2605.30208、2026-05、Mockus・Rigby・Nagappan を含む)〔一次・自社データ〕
  - 適格性ゲート → 静的ヒューリスティック → 機械学習の Diff Risk Score → LLM レビュー → 決定的な検証。通れば人のレビューなしで承認
  - **除外**: オープンソース、SOX 対象、追加レビューを要するコード、WIP・RFC、却下歴、コードフリーズ中。設定・パスのブロックリスト。インターンは在籍 60 日以上
  - 落ちたものは通常の人のレビューへ。作者は人のレビューを待つことを選べる
  - 535,290 件をレビュー、331,720 件を着地。revert 率は非 RADAR の約 1/3、本番障害率は約 1/50〔要照合: PDF の数式が崩れており、要約経由〕
  - 限界: 無作為割付でない(低リスクのものを選んでいるので比較は交絡する)、観察研究で因果推定でない、単一モノレポ、データ非公開
  - 目的の記述: "shifting scarce human attention toward changes where judgment and accountability are most beneficial"。**レビュアの注意深さ自体は測っていない**
- "AI-Assisted Fixes to Code Review Comments at Scale"(MetaMateCR、arXiv:2507.13499、2025-07)〔一次〕: AI の修正案をレビュアに見せると**レビュー時間が 5% 超伸びた**ため、作者にだけ見せる UI に変えた。=AI の出力をレビュアの前に置く位置が注意配分を変える

### 2.4 GitHub Copilot code review

- GitHub Docs "About GitHub Copilot code review"(https://docs.github.com/en/copilot/concepts/agents/code-review)〔一次〕
  - 既定では必須承認の数に**数えない**。設定で承認を出させ、必須承認を満たすこともできる(push で無効化)
  - "Supplement Copilot's feedback with a human review."
  - カスタム指示は PR の head ブランチから読む(Anthropic の `REVIEW.md` は基底ブランチから読む。**指示の改ざん耐性について設計が逆**)

### 2.5 Kubernetes: 長期的な決定(API)をパスで切り出し、専任の承認者に回す

- Kubernetes SIG Architecture "API Review Process"(https://github.com/kubernetes/community/blob/master/sig-architecture/api-review-process.md)〔一次〕
  - API の変更は API レビュアの承認でブロックされる。`api-review` ラベルで依頼し、SIG Architecture のモデレータが滞留を管理。却下への不服申立ては1回まで
  - OWNERS ファイルで `types.go`・`register.go` に `kind/api-change` を自動で付ける(下流の写しで確認〔二次〕)
  - =**「長期的な決定」を変更の内容(パス・型)から機械的に検出し、通常のコードレビューと別の承認経路に乗せる**作法の代表例

### 2.6 ADR と PR レビューの結び付け

- 公開されているのは個別組織の運用だけで、規格化された作法は見つからなかった〔二次〕
  - ADR をシステム領域ごとのディレクトリに置き、CODEOWNERS で所有チームの承認を必須にする(eng.adaction.com の ADR-0001)
  - ADR を含む MR にラベルを付けて目立たせる、決定の議論を MR のコメントで非同期に行う(Shopware の ADR)
  - ADR を AI レビュアの指示ファイルに読ませ、PR を記録済みの決定と突き合わせる(個人ブログ、2026-03)
- Amazon の「一方通行の扉/双方向の扉」は、取り返しのつかない決定に重いレビューを掛ける考え方として広く引かれる〔未: 今回は一次資料を確認していない〕

### 2.7 ベンダの分担論(AI = 機械的な一次通過、人 = 設計・ドメイン・アーキテクチャ)

- Graphite の手引き(https://graphite.com/guides/integrate-ai-code-review-github)〔一次・ベンダ〕: AI が機械的な問題を先に捕まえ、人は高水準の設計・ドメインロジック・アーキテクチャを見る。Stacked PR で小さな PR に分ける。数値(肯定 96%、採用 67%)は自社報告
- CodeRabbit・Greptile・Copilot の検出性能(Martian Code Review Bench など、2026)〔二次・ベンダ関与〕: F1 は概ね 45〜51%、適合率 49〜66%、再現率 36〜54%。**どの道具も半分前後しか捕まえていない**。正解集合の作り方で順位が入れ替わり、利害関係のない第三者の測定はない

## 3. 研究

### 3.1 レビューで見つかる欠陥の種類

- Mäntylä & Lassenius "What Types of Defects Are Really Discovered in Code Reviews?"(IEEE TSE 35(3), 2009, DOI 10.1109/TSE.2008.71)〔一次・要旨〕: レビューで見つかる欠陥の 75% は目に見える機能に影響せず、**保守性(evolvability)**に関わる。寿命の長い製品ほどレビューの価値が高い
- Bacchelli & Bird 2013(§2.2): 実際の成果は知識移転・認識・代替案
- 含意: 人のレビューの価値の多くは、機能欠陥の発見ではなく**設計・保守性・理解の共有**にある。AI レビューの既定(Anthropic は正しさに絞る)と、人のレビューが実際に生む価値は、**もともと重なりが小さい**。分担の根拠になる一方、「機能欠陥は AI に任せた」としても人のレビューの主な価値は残る、という意味でもある

### 3.2 AI レビューが人の注意を変える(自動化バイアス・アンカリング)

- Tufano ほか "Deep Learning-based Code Reviews: A Paradigm Shift or a Double-Edged Sword?"(arXiv:2411.11401、2024-11、査読付き会議名は未確認)〔一次・要旨〕: 専門家 29 名の対照実験
  - LLM の自動レビューを起点にしたレビュアは、**低重大度の指摘は増えたが高重大度の指摘は増えなかった**。時間は短縮されず、確信度も上がらなかった
  - レビュアは "tend to focus on the code locations indicated by the LLM"(LLM が示した場所に注意が寄り、他を探さない)
  - =「AI の指摘を人に見せてから人がレビューする」順序は、**人の注意を AI の指摘箇所へ固定する**リスクがある
- MetaMateCR(§2.3): AI の修正案をレビュアに見せるとレビュー時間が伸びた
- Cihan ほか "Automated Code Review In Practice"(ICSE-SEIP 2025、arXiv:2412.18531、Beko)〔一次・要旨〕: 自動レビューのコメントの 73.8% が解決扱い(ただし解決の申告が必須の方針下)。PR のクローズは遅くなる傾向。誤った指摘・不要な修正・無関係なコメントが不満として挙がった
- Sun ほか "Does AI Code Review Lead to Code Changes? A Case Study of GitHub Actions"(arXiv:2508.18771、2025-08/2026-04 改訂)〔一次・要旨〕: 16 種・2.2 万件のコメント。短く、コード片を含み、手動で起動したコメントほど修正につながる
- Duma ほか "These Aren't the Reviews You're Looking For: How Humans Review AI-Generated Pull Requests"(arXiv:2605.02273、2026-05)〔一次・要旨〕: エージェントの PR の多くはレビューされずにマージされ、レビューがあっても AI エージェントが多くを担う。人の関与はエージェントの操縦として現れ、直接の評価ではない。**マイニング研究のレビュー指標は人の監督を示す指標として当てにならない**
- "On Autopilot? An Empirical Study of Human-AI Teaming and Review Practices in Open Source"〔二次: 要約のみ〕: 人+AI の PR の大半が外部のレビュー・コメントを受けていない

### 3.3 レビューの量と注意の限界

- SmartBear × Cisco(2006)〔二次: 原典は登録制で未読〕: 200〜400 行を超えると欠陥の検出密度が急落、60〜90 分で頭打ち、400〜500 行/時より速いと効果が落ちる。OpenStack の議論では行数を規則として強制することへの異論もある
- Faros AI "AI Productivity Paradox"(2025)〔二次・ベンダ〕: AI 採用の高いチームで PR レビュー時間 +91%、PR 数 +98%。組織水準の DORA 指標は改善せず。PR サイズの増加率は資料間で食い違う(154% / 51.3%)
- Anthropic 自身も「人のレビューが律速になる」と書く(§1.3)

## 4. 立場の対立

| 立場 | 主張 | 主な根拠 | 弱点 |
|---|---|---|---|
| A. 論点抽出型(所有者の案) | PR から本質的な論点・長期的な決定を抜き出し、人はそこだけを見る。残りは AI | Google の設計優先、Microsoft の「人は高価値の指摘に集中」、Graphite の分担論、Mäntylä の保守性欠陥 | **誰が論点を抜き出すか**。AI が抜き出せば、人の注意は AI の示した場所に固定される(Tufano)。抜き出しの漏れを人が検出する手段がない。Anthropic の一次資料に裏付けがない |
| B. リスク層別型(Anthropic・Meta の実態) | コードベース・変更をリスクで層別。低リスクは自動承認+標本検査、高リスク・規制対象は人の厳格な承認 | Anthropic SDLC、Meta RADAR(revert・障害率の低下)、Code Review の水準をリポジトリごとに変える設計 | 層の判定が誤ると高リスクが自動承認へ流れる。RADAR の効果は選択バイアスと交絡する。人の注意深さは測られていない |
| C. 経路分離型(Kubernetes) | 長期的な決定(API・データ形式)をパス・型から**機械的に**検出し、専任の承認者の別経路へ回す | Kubernetes API Review、CODEOWNERS+ADR | 検出規則に載らない長期的な決定(依存の追加の意味、暗黙の契約)は漏れる。承認者が律速になる |
| D. 全行人レビュー維持型 | 人は全行を見る。AI は補助にとどめる | Google の "every line"(人が書いたコードについて)、GitHub の「人のレビューで補え」、AI の再現率は半分前後 | AI 生成量の増加で形骸化が進む(Faros、Duma)。形だけの承認を生む当の原因 |
| E. 懐疑型 | 「絞る」ほど人は AI に依存し、検出できない領域が広がる。AI の指摘を人に先に見せない | Tufano のアンカリング、MetaMateCR の UI 変更、Best practices の「全部直すと過剰設計」 | 代替の運用を示さないと D に戻る |

主な対立軸は2つです。

1. **絞り込みの軸**: 論点(内容)で絞るのか(A)、変更のリスク層で絞るのか(B)、変更の種別(パス・型)で別経路にするのか(C)
2. **AI の出力を人より先に見せるか**: 見せると効率は上がるが注意が固定される(E)。見せないと重複作業が残る

## 5. 本標準が採りうる選択肢と根拠の強さ

根拠の強さ: 強 = 複数の一次資料・独立した実証あり、中 = 一次資料はあるが自社報告・単一組織、弱 = ベンダの主張・二次のみ。

| # | 選択肢 | 根拠の強さ | 備考 |
|---|---|---|---|
| S1 | AI レビューは**承認とみなさない**(必須承認の数に数えない)。承認は人が行う | 中〜強(Anthropic 製品・GitHub の既定が一致。社内では自動承認もあるので「業界の総意」ではない) | 既存のゲート・承認規定との突合が要る |
| S2 | 長期的な決定(公開インタフェース・データ形式・永続スキーマ・migration・依存の追加・アーキテクチャ)を**変更の内容から機械的に検出**し、ADR の有無と人の承認を求める別経路に乗せる(C 型) | 中(Kubernetes の長期運用。標準化された作法はない) | 検出規則の正本と、規則に載らない決定の扱いを決める必要あり。検出規則に載らない決定を「人が宣言する」欄を併置するのが自然 |
| S3 | 論点の抽出を **AI に任せない**、または AI が抽出した論点を人のレビュー範囲の上限にしない。人のレビューの記録に「自分で見た範囲」を書かせる(Google の「どこを見たか書く」) | 中(Tufano の対照実験は1件、29 名) | テンプレートの `/human-verify`(結論・評価・要約を生成しない)と方向が一致するか突合する |
| S4 | リスク層別で人のレビューの濃淡を変える(B 型)。低リスクの自動承認は**標本検査と記録**を条件にし、shadow mode から始める | 中(Anthropic・Meta の一次資料。効果の因果は未証明) | 本標準の R 区分(変更ごと)と CL(案件ごと)の区別(ADR-0039)に直接関わる。自動承認を許すかは大きな決定 |
| S5 | AI レビューの指示(`REVIEW.md` 相当)は**PR 自身の変更から読まない**(基底ブランチ・保護ブランチの正本から読む) | 中(Anthropic の設計。GitHub は逆) | 改ざん耐性の論点。小さいが具体的 |
| S6 | AI レビューの指摘を全部直すことを求めない。指摘の採否は人が決め、却下の理由を残す | 中(Anthropic の Best practices の警告、Beko の不満) | 「指摘ゼロ = 安全」と読まない旨の注記も(Anthropic の注記) |
| S7 | PR の規模の上限(行数)を規範にする | 弱(SmartBear は原典未読・2006 年・人のコードが対象) | 採るなら暫定マーク(ADR-0026)必須。採らない判断も明記 |
| S8 | AI レビューの検出率を前提にした配分(「AI が機能欠陥の X% を捕まえるので人は見なくてよい」) | **弱**。採るべきでない | 検出性能はベンダ測定で F1 約 50%。独立測定なし。採らない旨を明記する候補 |

## 6. 要点

1. Anthropic の一次資料で確かめられたのは「ほぼ全 PR に AI レビュー」「製品は承認・阻止しない、承認は人」「コードベースをリスクで層別し、重要・規制対象だけ人の厳格な承認、低リスク層は自動承認+リスク加重の標本検査」まで
2. 「人のレビューを本質的な論点と長期的な決定へ絞る」は Anthropic の公開資料では**確認できなかった**。むしろアーキテクチャの詳細レビューは「以前ほど重要なゲートではない」と書く。所有者の前提は、絞り込みの軸(論点 vs リスク層)が混同されている可能性が高い
3. 長期的な決定の切り出しの実例は Kubernetes の API レビュー(パス・型から自動検出 → 専任承認者の別経路)。ADR と CODEOWNERS の結び付けは個別組織の運用で、規格はない
4. Meta RADAR は低リスク差分の自動承認で revert・障害率が低いと報告するが、選択バイアス・単一組織・観察研究で、人の注意深さは測っていない
5. 最も警戒すべき実証は Tufano ほか(2024): AI のレビューを起点にすると人は AI が示した場所に注意を寄せ、高重大度の指摘は増えない。「AI が論点を抜き出して人がそこだけ見る」は、この失敗様式をそのまま制度化する恐れがある
6. 人のレビューの価値の多くは機能欠陥ではなく保守性・理解の共有(Mäntylä 75%、Bacchelli & Bird)。AI レビューの既定(正しさ)とは重なりが小さく、分担の根拠になる
7. AI レビューの検出性能は F1 約 50%(ベンダ関与の測定のみ)。検出率を前提に人の範囲を削る設計は根拠がない
8. 本標準の候補: S1(AI は承認でない)、S2(長期的な決定の機械検出+ADR+人の承認の別経路)、S3(論点抽出を AI に任せきらない・人が見た範囲を記録)、S5(レビュー指示を PR から読まない)。S4(リスク層別の自動承認)は大きな決定で、ADR-0039 との突合が先。S8 は却下候補として明記する
