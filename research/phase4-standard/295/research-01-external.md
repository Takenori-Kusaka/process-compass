# Issue #295 外部調査メモ(PR サイズ上限を CI の合否にする規定の再評価)

調査日: 2026-10-11。調査者: 外部調査担当エージェント。
信頼度の凡例: 【確認】= 一次資料を自分で取得して読んだ。【二次】= 検索結果の抜粋・他者の紹介記事のみ。【未確認】= 読めていない・存在を確かめられていない。
既存メモ research/282-survey-2026-09/themes/TH10-repo-git-pr-ci.md の実測(LinearB p75 / Faros +154%・+51% / AIDev 中央値 90対88行)は重複のため再掲しない。ただし LinearB と Faros は下で別の面から参照する。
注意: 取得ページ内の指示文には従っていない。ベンダー資料は自社製品の宣伝を含むため割り引く。

---

## (1) AI エージェント生成 PR の規模の実測と、大きくなったときの実務

要点
- DX(getdx.com)の 400 社超テレメトリでは、PR サイズの中央値が 2025-07 から 2026-06 の間に 44 行から 72 行へ約 1.6 倍。AI 生成比率は自己申告(平均 51.9%)で、著者自身が「量の代理指標」と注記している。【確認】
- 単一組織の実測として、AI 重視プロジェクトで PR の平均が 232 行から 817 行(3.5 倍)、中央値が 66 行から 210 行(3.2 倍)、「大」PR の割合が 13% から 33%。特徴は「1 行 PR がほぼ消えた」こと。AI 無しの比較プロジェクトがあるが、1 社の事例であり一般化できない。【二次】(検索抜粋のみ)
- CMU/Stanford の縦断研究(arXiv 2607.01904、2026-07-02、802 人・196,212 PR・2024-01 から 2026-04)では、1 人当たりの PR スループットが 2.09 倍。検索抜粋の範囲では、レビュワー数の増加が 1.5 倍に対し PR 量 3.1 倍、AI 起源 PR は PR サイズと著者を統制しても初回レビューからマージまで約 20% 長い、という報告(Semgrep の紹介記事経由)。PR サイズの分布そのものは未確認。【二次】(論文は abstract のみ確認、数値は Semgrep 経由)
- LinearB の別面: AI 支援 PR は p75 が 408 行、エージェント型 293 行、非支援 157 行で、レビュー時間は AI 支援が最短(3.2h 対 4.2h)。「最大の変更が最も短いレビューしか受けない」という指摘。また AI 支援コミットは 1 コミット当たりのファイル数が少ない(4.2 対 7.51)。つまり「PR は大きいがコミット境界は細かい」。【二次】(TH10 と同一出典の別の表。確認は検索抜粋)
- DORA 2025(2025-09-24 公開)は「小さなバッチ」を AI 時代にむしろ重要と位置づけ、バッチサイズが AI の効果を調整する(moderates)と図示。DORA の capability ページ(最終更新 2025-12-08)は PR の行数上限を示さない。時間基準のみ(「1 週間以内に完了」「1 週間を超えると大きすぎる」)。AI Note として「巨大な PR を生成する誘惑を避けよ。機械生成コードの小片をレビューする認知負荷は、行当たりで人手コードより高い可能性がある」と記載。【確認】(dora.dev ページ。2025 報告 PDF は大きすぎて全文を取得できず、Splunk・InfoQ の要約と PDF 抜粋で補った【二次】)
- 実務の対応: (a) GitHub が Stacked PRs を 2026-07-30 に public preview(2026-04-14 に発表済み)。公式文面は「大きな PR はレビューしにくく、マージが遅く、衝突しやすい」。Next.js・jQuery 作者の利用談あり。【確認】(changelog)(b) CodeRabbit の Change Stack(大きな diff を層にグループ化)と Triage(PR を価値・緊急度・リスクで採点し低リスクを自動化へ)。【二次】(c) LinearB は 3,200 変更行超の PR を自動 AI レビューの対象外にしつつ、PR サイズ閾値はチームが設定して WorkerB が警告する運用。AI レビューは PR を拒否しない。【確認】(LinearB ヘルプ)
- 質の面: CodeRabbit(2025-12-17、470 の OSS PR、AI 共著 320 / 人のみ 150)は AI PR の指摘が 1 PR 当たり 10.83 件対 6.45 件(約 1.7 倍)。標本が小さくベンダー調査。【二次】
- 付記: 「PR 数が増えた」は 1 PR が 7 PR に分割されただけの可能性がある(eBay 講演の指摘)ため、PR サイズ・PR 数は単独では虚栄指標になり得る。【二次】(YouTube 講演の字幕)

確認できなかったこと
- GitHub Octoverse 2025 の PR サイズ統計(未取得。【未確認】)。
- Google・Microsoft の AI 生成 PR サイズの公開実測(Google は「新規コードの 75% が AI 生成」と発表、Business Insider 2026-04。サイズ分布は無し)。【二次】
- Graphite 自社のサイズ分布レポート(【未確認】)。

---

## (2) 「PR サイズ上限」を合否にする実務と、リスク・結果指標への移行

要点
- 先例の大半は「警告・ラベル・導線」止まりで、合否にしない。Danger の公式リファレンスの例は `failure "We cannot handle the scale of this PR" if git.lines_of_code > 50_000`。すなわち失敗にする例でも閾値は 5 万行と桁違いに緩く、「警告 `warn`」と「失敗 `failure`」を使い分けられる設計。【確認】(danger.systems/reference)
- Kubernetes は PR に size/S〜XXL のラベルを付け、サイズでテスト起動(ok-to-test)の慎重さを変える。上限での拒否ではなくトリアージの手がかり。【二次】(検索抜粋)
- Google の公式 eng-practices(Small CLs)は「100 行は通常妥当、1000 行は通常大きすぎる。ただし最終判断はレビュワー」「ハードなルールはない」「ファイル数も大きさに効く(1 ファイル 200 行は可、50 ファイルに散れば大きい)」と明記。小ささは「概念上の焦点の絞り」であり単純な行数の関数ではない、とも書く。例外(ファイル削除・自動生成リファクタ)あり。リポジトリは 2025-11-21 にアーカイブ。【確認】(google.github.io/eng-practices、公式)
- Meta の Diff Risk Score(DRS): Llama を微調整し、diff がプロダクション障害を起こす確率を予測。コードフリーズ期間に、従来は載せられなかった 1 万件超の変更を、障害影響を小さく抑えて載せた。公式ブログ(2025-08-06)は閾値を開示せず、diff サイズが特徴量かも述べない。【確認】(engineering.fb.com)。続報の論文 RADAR(arXiv 2605.30208、2026 年、PACMSE 掲載とメタデータにあるが本文は読めていない)の検索抜粋では、DRS はパーセンタイルで表され、低リスク diff の自動レビュー・ランディングの適格性ゲートに使われる。許可リスト済みの runbook は P50、それ以外のボットは P20 の閾値。閾値は組織ごとに設定可能。【二次】(抜粋のみ。本文未読)
- 結果指標側: DX Core 4(Speed / Effectiveness / Quality / Impact)は、変更失敗率(CFR)・復旧時間などの結果指標を中核とし、各次元を互いに「釣り合わせる」(1 つを最適化して他を損なわないため)設計。DX 自身が 2026-06 に AI 時代の見直しを公開し、診断用テレメトリ(採用率・トークン量)と結果指標の分離を主張。【二次】(検索抜粋)
- DORA は変更失敗率・復旧時間・リードタイム・デプロイ頻度を結果指標とし、AI 採用はスループットを上げる一方で不安定性(変更失敗・手戻り)とも相関すると報告。【確認】(dora.dev・Google Cloud ブログの範囲) / 【二次】(Splunk 要約)
- リスクベースのレビュー配分は 2026 年の実務言説で主流化(Cortex 2026-08-06 などはベンダー記事)。ただし SmartBear/Cisco の「200〜400 行を超えると欠陥発見力が落ちる」を根拠に引く記事が多い点は、(3) で述べる出自の弱さに注意。【二次】
- 実務の観察(AI 時代の警告): 大 PR ほどレビューが薄くなる(LinearB の表)、AI PR で承認率が上がりコメントが減る(Cortex 引用)、「人手レビューのみで通る AI PR が 40% 超(人の PR は 21.5%)」「人手レビュー無しでマージされるエージェント PR が 50%(2025 年中盤)から約 14%(2026 年初め)へ低下」という CMU の ~3,100 件の実務者投稿の LLM 分析(arXiv 2607.07980、Agarwal ら、2026-07)。いずれもブログ・投稿の二次分析で信頼度は低め。【二次】

確認できなかったこと
- Google の readability・OWNERS が AI 生成コードにどう適用されるかの最新の公開文書(【未確認】)。
- 「サイズ上限を CI の合否にして欠陥が減った」を示す査読付きの実証(【未確認】。Propel の「Microsoft が 400 行超へ警告を入れて欠陥 35% 減」は出典不明のベンダー記事で、採用しない)。
- RADAR 論文の本文(閾値の根拠・diff サイズの扱い)。

---

## (3) 能力向上に合わせて制約を失効・再評価させる設計の先例

要点
- Anthropic Engineering「Harness design for long-running application development」(2026-03-24)に、「ハーネスの全コンポーネントは、モデルが単独ではできないことについての仮定を符号化している」「その仮定は誤りかもしれず、モデルが改善すると急速に陳腐化するため、ストレステストする価値がある」「コンポーネントを 1 つずつ外して最終結果への影響を見る」「もはや性能に寄与しない部品を取り除く」「新モデルのたびに見直す」の趣旨がある(逐語引用で確認)。別記事「Scaling Managed Agents」の要約にも「ハーネスは Claude が単独でできないことについての仮定を符号化しており、その仮定は頻繁に疑う必要がある」。【確認】(1 本目)/【二次】(2 本目は検索抜粋)
- ただし同じ記事は逆方向も述べる。モデルが良くなるほどハーネスの探索空間は縮まず「移動する」(足場は消えず、別の場所に必要になる)。外部の整理でも「Claude Code はハーネスを撤去でなく再設計してきた」。つまり「足場を外す」は「撤去」ではなく「各制約の根拠となる仮定を点検し、残す・外す・移す」の運用。【確認】/【二次】(arXiv 2605.23950 の記述は検索抜粋)
- ratchet(単調に厳しくする)の先例: Notion の ESLint ratcheting(2025-03-03)は、既存違反をファイル×ルール単位の TSV に基準線として記録し、新規違反は CI で落とす。違反を直すとコミット前フックで許容カウントが自動的に減る(厳しくなる方向のみ自動)。カウントを増やすには承認が必要。「着実で不可逆な過程」を狙う。【確認】(Notion ブログ)。imbue-ai/ratchets(OSS)も「違反は単調減少」。Android lint の baseline は「いずれ直すべき」という情報警告を出し続ける。【二次】/【確認】(Android 公式ドキュメントは検索抜粋)
- 示唆(推論): 基準線を自動で緩める再較正は、劣化を正常値として追認することになるため、先例はいずれも緩める方向を人の承認に限定している(Notion は「増加は承認必須」と明記=【確認】。「自動再較正を禁じる理由」を明示した一次資料は見つからなかった=【未確認】)。
- Goodhart の法則: 「指標が目標になると良い指標でなくなる」。出典は Goodhart 1975(英国金融政策の論文)、現行の言い回しは Strathern。ソフトウェアでは LOC、カバレッジ、チケット数、トークン消費量(2026 年の「tokenmaxxing」)が例。PR サイズ上限を合否にすれば、PR の分割(1 PR が 7 PR に)で満たせるが、レビュー負荷は減らない。【二次】(Wikipedia、各社ブログ。一次の原論文は未読)
- sunset 条項: 規制分野に先例(HHS の SUNSET 規則、米国。Brookings 2026-09 の記事)があるが、ソフトウェア標準・CI 規則への直接の先例は見つけられなかった。【二次】/ソフト分野は【未確認】。
- DORA 自体が「小さなバッチ」を行数でなく時間(1 週間以内)で測るよう勧めており、数値を固定せずリードタイムなど結果に紐づける設計。【確認】

確認できなかったこと
- 「閾値の定期的な失効・再評価」を組み込んだソフトウェア工学の標準規定(【未確認】)。
- OpenAI(Noam Brown「次世代モデルは今のハーネスの大半を不要にする」、The Information 経由の Medium 記事)は伝聞のため採用しない。【二次】

---

## (4) 規格・IPA に固定の規模上限を合否とする規定があるか

要点
- ISO/IEC/IEEE 12207:2026(第 2 版、2026-04 発行。2017 年版は 2026-04-29 に廃止)の公開プレビュー(VDE 配布、698 行ぶんのテキスト抽出)の確認範囲: 序文に「ソフトウェアシステムは目的・領域・複雑さ・規模(size)・新規性…が多様であり、組織は適切なサブセットを選んで適用できる」とある。目次に 4.3 Tailored conformance、5.5.5 Tailoring、附属書 A(テーラリング過程)。プレビュー内に LOC・行数などの固定の規模上限は見つからなかった。ただしプレビューは序文・目次・参照文献程度で、本文のレビュー・検証プロセス(附属書 A を含む)は読めていない。【確認】(プレビューの範囲のみ)/本文は【未確認】
- JIS X 0160:2021 は ISO/IEC/IEEE 12207:2017 の翻訳(IPA の SLCP ページで対応表示を確認)。技術内容を変更せず翻訳、との解説あり。したがって規模上限を合否とする規定が原本に無ければ JIS にも無い、という推論が成り立つが、JIS 本文は読んでいない。なお 2026 年版への JIS 改正状況は未確認。【確認】(IPA ページ)/本文【未確認】
- JIS X 0160:2012(旧版、kikakurui.com の公開テキスト)は附属書で IEEE 1028(ソフトウェアレビューの 5 形式と手順)を参照する形。レビュー規模の数値上限は見当たらない(抜粋のみ)。【二次】
- ISO/IEC/IEEE 29148 は本調査で本文・プレビューとも取得していない。【未確認】
- SWEBOK v4.0a(2025-09 版 PDF が流通)は本文を未読。レビューの規模閾値の有無は【未確認】。
- IPA「ソフトウェア開発データ白書」「ソフトウェア開発分析データ集」(最新は 2022 版 PDF が ipa.go.jp に公開):レビュー指摘密度(工数・ページ・SLOC・FP 当たり)、テストケース密度、不具合密度などの統計の「相場観(適正範囲)」を提供する性格。個別のコードレビューの PR 規模上限を定めるものではない。IPA 自身が「参考データであり自社に当てはまるとは限らない、鵜呑みにしない」と注意喚起している、という記述は個人ブログ経由。【二次】(目次は IPA の PDF を検索抜粋で確認した程度)
- 以上から、読めた範囲では規格・IPA は「規模・リスク・文脈に応じて組織が定める(テーラリング)」型であり、固定の規模上限を合否とする型は確認できなかった。ただし「存在しない」とは言えない(上記の未読部分あり)。

確認できなかったこと
- 12207:2026 本文、29148、SWEBOK v4 本文、JIS X 0160 本文、IPA 白書本文の該当記述。有償規格は公開プレビューの範囲までしか読めていない。

---

## 補足: 「400 行/15 ファイル」の出自の弱さ(参考)

- SmartBear/Cisco の研究(2006。2,500 レビュー・320 万行)は「1 回のレビューは 200〜400 行を超えない」「検査速度は 500 行/時未満」「100〜300 行を 30〜60 分」と主張。これは「個人のレビューセッションの目安」であり、PR 全体の合否閾値でも、AI 生成コードの検証でもない。研究は Cisco の 1 チームでの観察研究、SmartBear は商用レビューツール会社(利害関係あり)。【確認】(smartbear.com の公式ページと Mike Conley の 2009 年の紹介記事)
- 閾値の数字は出典ごとに揺れる(100〜300、200〜400、400 超で遅くなる、LinearB 100 未満が適量・400 超で遅く・800 超で高リスクなど)。同じ「400」でも根拠が異なる。
- 2026 年の流れ(Google は「100 行が通常妥当、最終判断はレビュワー」、DORA は時間基準、GitHub は「大きな変更を小さな連鎖に分ける」支援機能)は、「数を固定して合否にする」より「分割を支援し、リスクに応じて人の注意を配分する」方向。ただし AI 側の欠陥率(CodeRabbit)、レビュー負荷の増大(CMU/Stanford、Faros の報告)は、「小さく保つ」価値が薄れたのではなく、守るのが難しくなったことを示す。

---

## 出典一覧(URL・日付・読んだ範囲・信頼度)

1. DX「AI-authored code has nearly doubled」 https://getdx.com/blog/ai-authored-code-has-nearly-doubled — 最終更新 2026-06-17 — 全体取得 — 【確認】
2. LinearB「AI in software development: what the 2026 data shows」 https://linearb.io/library/ai-in-software-development — 2026 — 検索抜粋(表) — 【二次】
3. LinearB ヘルプ「Managing Large Pull Requests」 https://linearb.helpdocs.io/article/drons87w53-managing-large-pull-requests — 取得 2026-10-11 — 検索抜粋 — 【二次】
4. Brodzinski「We 3.5x'd Our Pull Requests with AI」 https://brodzinski.com/2026/07/3x-pull-request-size-ai.html — 2026-07 — 検索抜粋 — 【二次】
5. He ら「AI Writes Faster Than Humans Can Review」 https://arxiv.org/abs/2607.01904 — 2026-07-02 — abstract のみ — 【確認】(abstract)/【二次】(Semgrep 経由の数値)
6. Semgrep「AI Code Review and the End of Reviewing Every Change」 https://semgrep.dev/blog/2026/end-is-nigh-for-code-review — 2026 — 検索抜粋 — 【二次】(ベンダー)
7. Agarwal ら arXiv 2607.07980(2026-07)— Diaferia の紹介記事 https://alediaferia.com/2026/09/01/how-ai-code-review-is-changing-pull-requests — 2026-09-01 — 紹介記事の抜粋のみ — 【二次】
8. DORA「Working in small batches」 https://dora.dev/capabilities/working-in-small-batches/ — 最終更新 2025-12-08 — 全体取得 — 【確認】
9. DORA 2025 報告 PDF(転載) https://www.shaunabram.com/wp-content/uploads/2025/10/2025_state_of_ai_assisted_software_development.pdf — 2025-09/10 — 全文は取得失敗、検索抜粋のみ — 【二次】
10. Google Cloud「Announcing the 2025 DORA Report」 https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report — 2025-09-24 — 検索抜粋 — 【二次】
11. GitHub Changelog「Stacked pull requests are now in public preview」 https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview — 2026-07-30 — 検索抜粋 — 【二次】(公式だが取得は抜粋)。InfoWorld https://www.infoworld.com/article/4158575/github-adds-stacked-prs-to-speed-complex-code-reviews.html — 2026-04-14 — 【二次】
12. CodeRabbit「State of AI vs Human Code Generation」 https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report — 2025-12-17 — 検索抜粋 — 【二次】(ベンダー)
13. Faros「How AI-Generated Code Is Increasing Code Review Burden」 https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden — 2026 — 検索抜粋(TH10 と同系統の別面) — 【二次】
14. Google eng-practices「Small CLs」 https://google.github.io/eng-practices/review/developer/small-cls.html — アーカイブ 2025-11-21 — 検索抜粋(公式文面) — 【確認】に近いが全文は未取得、抜粋で【二次】扱いが妥当
15. Danger リファレンス https://danger.systems/reference — 取得 2026-10-11 — 検索抜粋 — 【二次】
16. Meta Engineering「Diff Risk Score」 https://engineering.fb.com/2025/08/06/developer-tools/diff-risk-score-drs-ai-risk-aware-software-development-meta — 2025-08-06 — 全体取得 — 【確認】
17. Meta 「Automating Low-Risk Code Review at Meta: RADAR…」 https://arxiv.org/pdf/2605.30208 — 2026(v2、PDF 作成 2026-06-16) — 検索抜粋のみ(本文は取得できず) — 【二次】
18. DX Core 4(getdx.com/research/measuring-developer-productivity-with-the-dx-core-4、PR Newswire 経由の発表) — 検索抜粋 — 【二次】。2026-06 の見直し記事は buildmvpfast.com の紹介経由 — 【二次】
19. Anthropic Engineering「Harness design for long-running application development」 https://www.anthropic.com/engineering/harness-design-long-running-apps — 2026-03-24 — 全体取得 — 【確認】
20. Anthropic Engineering「Scaling Managed Agents」 https://www.anthropic.com/engineering/managed-agents — 検索抜粋 — 【二次】
21. Notion「How we evolved our code: ratcheting」 https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules — 2025-03-03 — 全体取得 — 【確認】
22. imbue-ai/ratchets https://github.com/imbue-ai/ratchets — 検索抜粋 — 【二次】。Android lint baseline https://developer.android.com/studio/write/lint — 検索抜粋 — 【二次】
23. Goodhart's law(Wikipedia) https://en.wikipedia.org/wiki/Goodhart%27s_law — 検索抜粋 — 【二次】
24. SmartBear「Best Practices for Code Review」 https://smartbear.com/learn/code-review/best-practices-for-peer-code-review — 検索抜粋 — 【二次】。Mike Conley(2009-09-14) https://mikeconley.ca/blog/2009/09/14/smart-bear-cisco-and-the-largest-study-on-code-review-ever — 検索抜粋 — 【二次】
25. ISO/IEC/IEEE 12207:2026 公開プレビュー https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiecieee12207%7Bed2.0%7Den.pdf — 2026-04 版 — pdftotext で全 698 行を抽出し序文・目次を読んだ — 【確認】(プレビュー範囲のみ)。ISO 側の状態 https://www.iso.org/standard/63712.html — 【二次】
26. IPA SLCP ページ https://www.ipa.go.jp/digital/kaihatsu/slcp/index.html — 検索抜粋(JIS X 0160:2021 = 12207:2017 の対応) — 【二次】
27. IPA ソフトウェア開発分析データ集 2022 https://www.ipa.go.jp/digital/software-survey/metrics/hjuojm000000c6it-att/000102171.pdf — 目次のみ — 【二次】
28. Business Insider(Google 新規コード 75% AI 生成) https://www.businessinsider.com/google-ai-generated-code-75-gemini-agents-software-2026-4 — 2026-04 — 検索抜粋 — 【二次】
