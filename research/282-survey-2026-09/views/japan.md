# 日本の実務動向(出典一覧)

> 自動生成(`node scripts/research-ledger.mjs index`)。手で編集しない。注記は notes マーカーの内側にだけ書く。

region=jp のカード 123件を組織種別ごとに並べる。

## enterprise(26)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0097 | 2026-08-14 | techtekt(パーソルキャリア Developers Blog) | パーソルキャリアの IT コンサルタントが個人検証として、遅延タスク検知→配慮した催促文案生成→PM のワンタップ承認→Backlog 記録の PM 支援エージェントを構築。結果、AI に置き換えるつ | TH01 | [PM業務をAI化してみたら、人にしかできない価値が見えてきた話 #夏のAI技術発信祭](https://techtekt.persol-career.co.jp/entry/tech/260814_01) |
| SRC-0098 | 2026-08-26 | LINEヤフー Tech Blog | LINEヤフー プロダクト QA ユニットの報告。OpenAI Codex と組み合わせる組織共通テンプレートリポジトリ QA Agent Platform(QAAP)を整備し、QA 組織の AI 活 | TH01 TH03 TH07 | [AI活用率100％のQA組織をつくるまで](https://techblog.lycorp.co.jp/ja/20260826b) |
| SRC-0122 | 2026-06-09 | Zenn(GMOペパボ株式会社 Publication) | GMOペパボの技術者による ccusage 実測(2026-06-09)。累計 cacheRead 136 億トークン、API 従量換算 約 $10,168(Max プランのため仮想額)。ある 1 日 | TH04 | [Claude Code のトークン削減を実測した — semble 93%・cacheRead 1800倍の内訳](https://zenn.dev/pepabo/articles/claude-code-token-reduction-measured) |
| SRC-0126 | 2026-04-02 | iimon TECH BLOG(株式会社iimon) | 不動産テックの iimon 社エンジニアの記事(2026-04-02)。全エンジニアに Claude Code の Max プランを支給していると明記。金額や利用量の公開は無く、日本企業の定額プラン一 | TH04 | [Claude Code on the Webが個人的に良かった話と今後の期待](https://tech.iimon.co.jp/entry/2026/04/02/112148) |
| SRC-0150 | 2026-06-16 | LayerX (Zenn Publication) | LayerX のエンジニアによる長編エッセイ。2025 年末以降、実装力がコモディティ化し価値が「何を作るべきかを決めること」「ちゃんと動くかを確かめること」へ移ったと構造的に論じ、Michael J | TH09 TH08 TH01 | [AI の不時着 ~ コードの国を追われ、要求の国へ ~](https://zenn.dev/layerx/articles/947ce6d31701cf) |
| SRC-0207 | 2026-06-25 | DMM Developers Blog(合同会社DMM.com) | Anthropic 主催 Code w/ Claude Tokyo(2026-06-10)の DMM エンジニアによる参加記(2026-06-25)。Anthropic の「AI-native eng | TH05 TH01 TH03 TH02 TH11 | [Code w/ Claude Tokyo 参加レポート ── AIに業務をどう任せ、どう資産に繋げるか](https://developersblog.dmm.com/entry/2026/06/25/110000) |
| SRC-0258 | 2026-06-30 | メルカリエンジニアリング | メルペイ決済基盤チームに常駐する Claude Code ベースの自律エージェント(半年運用)の設計。CLAUDE.md は誘導、強制は決定的なフック・ACL・コンテナ隔離に置き、DX Core 4  | TH01 TH02 TH03 TH07 TH11 | [決済プラットフォームに常駐する自律AIエージェントの設計と運用](https://engineering.mercari.com/blog/entry/20260630-28a5eee688) |
| SRC-0260 | 2026-07-29 | Tabelog Tech Blog(カカクコム) | 全社でClaude Codeを導入したカカクコムのReactリプレースで、実装〜PR作成を1コマンド化し、繰り返すレビュー指摘を静的解析ルールへ自動変換する仕組みを作った報告。rules追記より静的解 | TH03 TH06 TH07 TH11 | [使いながら育てる Claude Code ― 開発フローの1コマンド化 × 繰り返し指摘の自動仕組み化](https://tech-blog.tabelog.com/entry/react-pipeline-review-digest-claude-code-quality-automation) |
| SRC-0261 | 2026-06-25 | LayerX(Zenn Publication) | LayerX入社直後のエンジニアの失敗談。Claude Codeに実装を任せ動作確認で担保したところ、仕様未達やデグレがQAで見つかり、理解が積み上がらなかった。AIの出力を評価できるかで作業方法を分 | TH01 TH06 | [AI 時代だからこそコードを読もう](https://zenn.dev/layerx/articles/6f510abfc3fa72) |
| SRC-0262 | 2026-08-19 | LINEヤフー Tech Blog | Yahoo!オークション・フリマの商品パトロールへのAI導入で、審査効率は約26〜50倍になったが人の業務時間は同様には減らなかった報告。人が最後に全件確認する構造(HITL)が制約と結論し、AIだけ | TH01 TH11 | [AIを入れても、なぜ業務量は思ったほど減らないのか](https://techblog.lycorp.co.jp/ja/20260819a) |
| SRC-0263 | 2026-09-02 | SmartHR Tech Blog | SmartHR社員の論考。PRD・PR説明・仕様書などAI生成文書の乱立で、作成者の時間短縮がレビュワー・読み手のコストに移っているのではないかと問題提起する。 | TH05 TH10 TH11 | [AI活用で生まれた別のコスト](https://tech.smarthr.jp/entry/2026/09/02/120000) |
| SRC-0264 | 2026-09-11 | Sansan Tech Blog | 認証SDKのRust移行で、実装(AI)・学習(人)・レビュー(観点別AI→人)に役割を分け、人の理解とレビューのボトルネックを解消した報告。ADRを前提変更に合わせて更新し続けた。 | TH01 TH05 TH06 | [AIで実装速度を高めながら、人間の理解を保つ — 認証基盤SDKのRust化で見直した開発フロー](https://buildersbox.corp-sansan.com/entry/2026/09/11/150000) |
| SRC-0265 | 2026-08-13 | freee Developers Hub | freee社員による認知科学(ワーキングメモリ4±1、分散認知、限定合理性)に基づく論考。AIエージェントはチームの理解を蓄積し判断の整合性を保てず、開発プロセス設計は人間集団の認知資源の最適化問題に | TH01 TH05 | [AI agentを活用した開発プロセスと人間の認知限界](https://developers.freee.co.jp/entry/ai-dev-and-cogsci) |
| SRC-0266 | 2026-08-04 | DeNA Engineering | DeNAのIT本部が、名前・アカウント・配属先を持つ「AI社員」を部署に配置し、参照→書き込みの段階的な権限付与と先行検証役(Berry)経由の段階展開で運用している報告。 | TH01 TH02 TH11 | [AIを「同僚」として組織に迎える ─ 果物の名を持つDeNAのAI社員たちと、その実装の裏側](https://engineering.dena.com/blog/2026/08/ai-employee-introduction/) |
| SRC-0267 | 2026-09-01 | ZOZO TECH BLOG | 異動で人数が減ったWEAR Webチームが、リスクに応じて必要Approve数を1/2件に動的判定し、低リスクPRはAIレビューで自動Approveする仕組みを入れた報告。AIのレビュー基準の変更には | TH02 TH06 TH07 TH10 | [チームの人数が減っても仕事を回す ── AIとGitHub Actionsによる開発ワークフロー改善](https://techblog.zozo.com/entry/wear-web-fe-adjust-workflow) |
| SRC-0268 | 2026-09-01 | エムスリーテックブログ | 定額プランの5時間枠・週次枠がバックグラウンドのエージェントに食われメインの作業が止まる問題に対し、セッションにタグを付けタグごとに使用率上限を設けるフックを作った報告。消費量の計算式は非公開と指摘。 | TH04 | [Claude Codeでトークンリミットが頻発したので、作業ごとにリミットを設定した](https://www.m3tech.blog/entry/claude-budget-tags) |
| SRC-0274 | 2026-07-10 | Zenn(gemcook Publication) | サブエージェント委任に完了条件ブロックを hook で強制したところ、形式だけ満たして中身が空虚になった事例と、Stop hook の検証ゲートが達成不能な条件で無限ループした事例の記録(企業の Ze | TH07 TH03 | [Claude Codeのループが回らないのは、プロンプトではなく完了条件の問題だった](https://zenn.dev/gemcook/articles/467b1233efe811) |
| SRC-0308 | 2026-07-31 | Tabelog Tech Blog(株式会社カカクコム) | AI DevEx Conference 2026 のブースで来場者約260名にシール投票で聞いた調査の報告。最も時間がかかる工程にコーディングを挙げた人はゼロで、要件定義・設計とコードレビューが上位を | TH11 TH06 TH09 | [【AI DevEx 2026 スポンサー参加レポート】コーディングがボトルネックではなくなった時代の、開発現場の新たな課題](https://tech-blog.tabelog.com/entry/ai-devex-conference-2026-report) |
| SRC-0318 | 2026-09-03 | 情報処理学会 ソフトウェアエンジニアリングシンポジウム2026(SES2026)論文集 | 出前館の実践論文(SES2026 最優秀論文賞)。LLM レビューを人のレビューの前工程に置く手法を12名規模の実開発チームに適用し、品質には補助的な効果、効率には明確な向上なしと報告した。本文 PD | TH06 TH11 | [大規模プロダクトにおけるLLMを用いたコードレビュー実践と評価](https://ipsj.ixsq.nii.ac.jp/records/2011757) |
| SRC-0336 | ? | OEM・EMSパートナーズ.com(日東電気グループ) | 製造受託企業(日東電気グループ)のサイトによる DRBFM 解説(掲載日は取得できず)。変化点レビューが「ワークシート提出のための作業」へ形骸化する典型と対策、設計を変えなくても環境変化を変化点に数え | TH02 TH07 | [DRBFMとは？FMEAとの違いと設計変更リスクを防ぐ進め方を解説](https://oem-ems-partners.com/column/2928) |
| SRC-0360 | 2026-04-21 | GMOペパボ株式会社(Zenn Publication) | 日本の Web 系事業会社の技術者が、2,000行近くに育った CLAUDE.md を CLAUDE.md / rules / skills の3層へ分け、起動時ロードを約83%削減した2か月の記録( | TH03 TH04 | [CLAUDE.md の肥大化を 3 層構造で 83% 軽くした — 実測と試行錯誤の記録](https://zenn.dev/pepabo/articles/claude-code-rules-skills-split) |
| SRC-0385 | 2026-05-08 | オーエムネットワーク株式会社(PR TIMES) | 新潟の業務システム開発会社 OMN のプレスリリース(2026-05-08)。Claude Code が Excel 設計書の階層を誤認したため、2026年4月までに主要設計書を Markdown に | TH05 TH04 | [「そもそも、ドキュメントをExcelで作成している理由って何ですか？」──AI活用を停滞させていた「慣習」を打破。(オーエムネットワーク プレスリリース)](https://prtimes.jp/main/html/rd/p/000000122.000092212.html) |
| SRC-0405 | 2026-04-11 | BACKSTAGE Tech Blog(Zenn) | 株式会社BACKSTAGE が Qodo pr-agent を GitHub Actions で 1 か月運用し、AI 指摘 760 件の採用を全件集計した記録。採用率 8.2%(人間 91.9%)で | TH06 TH11 | [AIコードレビューを1ヶ月回して、採用率8%だった話](https://zenn.dev/backstage/articles/7644135a8fb926) |
| SRC-0450 | 2026-08-05 | Findy Tech Blog(ファインディ株式会社) | 日本の事業会社が、Sub-issue をAIエージェントが並列実装する仕組みに GitHub のスタック型PRを組み込み、人のマージ待ちで生じていた同期待機を解消した運用報告。 | TH10 | [スタックプルリクエスト入門 — gh stackの使い方と、AIエージェントの並列実装での活用](https://tech.findy.co.jp/entry/2026/08/05/070000) |
| SRC-0629 | 2026-07-09 | ジモティー Tech Blog | コードレビューの判断を「AI管轄」と「人間管轄」に分け、人は diff ではなく AI の作るレポートで承認を判断する運用の開始報告。実績は本番影響のない PR 1件で、見落としやスループットは未検証 | TH01 TH06 TH10 | [「人間がdiffを読まないコードレビュー」をやってみた](https://jmty-tech.hatenablog.com/entry/2026/07/09/183949) |
| SRC-0630 | 2025-12-17 | CyberAgent Developers Blog | サイバーエージェントの1チームが、AI 導入でコミット数が約2倍になった後に組み直したレビューフローの報告。人の承認の後に AI の最終チェックを置き「最終ゲートキーパー」と呼ぶ。テスト行/コード行は | TH01 TH06 TH07 TH11 | [コミット数2倍でもレビュー品質を維持！AI時代のコードレビューフロー再設計](https://developers.cyberagent.co.jp/blog/archives/60882/) |

## startup(2)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0444 | 2026-03-25 | 株式会社TIMEWELL | 日本のスタートアップによる新規事業部門向けコラム。2026-03 版を 2026-09 に全面改稿し、SDD は『標準になった』と主張しつつ、厚い文書の罠と仕様の放置による逆戻りを警告する。実測データ | TH08 TH05 TH09 | [仕様駆動開発（SDD）の再注目と、文書がコードになる時代｜AIネイティブ新規事業開発③](https://timewell.jp/columns/ai-spec-driven-development) |
| SRC-0485 | 2026-01-21 | Findy Tools(株式会社Rehab for JAPAN によるレビュー) | Rehab for JAPAN(エンジニア11〜50名)の EM による Claude Code 導入事例。約3名のパイロットで自作ツールにより GitHub 活動量とトークン量を追跡し導入前後を比較 | TH11 TH01 TH06 | [Claude Code導入による開発効率化と全社展開までの段階的アプローチ](https://findy-tools.io/products/claudecode/1065/825) |

## sier(16)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0125 | 2026-06-15 | DevelopersIO(クラスメソッド株式会社) | Anthropic リセラーのクラスメソッドによる 2026-06-15 料金改定の整理。対話利用はサブスク枠、自動化(Agent SDK・claude -p・GitHub Actions)は月次クレ | TH04 | [2026/06/15以降に料金体系が変更されたClaudeをどう使うか考えてみた](https://dev.classmethod.jp/articles/claude-2026-pricing-reform-bucket-system) |
| SRC-0149 | 2026-01-17 | NCDC テックブログ (Zenn) | NCDC の非エンジニア IT コンサル 3 名が Gemini・NotebookLM・Figma Make・Firebase Studio で 2 日間 MVP リリースを試みた一次記録。企画〜設計 | TH09 | [ITコンサル3人でAI駆動開発を2日間やってみた](https://zenn.dev/ncdc/articles/e15a2bc6020b9c) |
| SRC-0247 | 2026-04-15 | APC 技術ブログ（株式会社エーピーコミュニケーションズ） | 日本の IT サービス企業のチームが Copilot の custom agents で PR レビューを運用した事例。AI 指摘の正誤判定が残って負荷が減らず、文脈（指示ファイル）を増やすほど指摘と | TH06 TH05 TH03 TH11 | [【GitHub Copilot】AI活用しても「減らないレビュー負荷」。打開策は「シフトレフト」](https://techblog.ap-com.co.jp/entry/2026/04/15/080000) |
| SRC-0254 | 2026-04-23 | NTTデータ DATA INSIGHT | NTTデータのホワイトペーパーの要約記事。スリーラインモデルで生成・品質担保・説明責任を切り分け、AI-Generated/AI-Verified/AI-Explainableの3段階で責務がAIへ移 | TH01 TH05 TH06 TH12 | [AI時代のシステム開発に必要な説明責任](https://www.nttdata.com/jp/ja/trends/data-insight/2026/0423) |
| SRC-0255 | 2026-05-28 | NTTデータ DATA INSIGHT | 公共分野のWebアプリ構築で要件定義から総合試験まで全工程にGitHub Copilotを使った事例(マイクロソフトとの対談)。V字を半年で10回以上回し、コード全量の人手レビューを省いたことを後に反 | TH06 TH07 TH08 TH10 | [AI-Native開発で広がるSIerの可能性 ～NTT DATAが向き合う、AI活用のこれから～](https://www.nttdata.com/jp/ja/trends/data-insight/2026/0528) |
| SRC-0256 | 2026-04-17 | NTT DATA TECH(Zenn) | NTTデータ第三公共事業本部の責任者による、社員3名が2025/10〜2026/3に成果物の全量をGitHub Copilotで作成した商用サブシステム開発の振り返り(個人のチームの取り組みと明記)。 | TH03 TH05 TH07 TH09 TH11 | [設計書・コード・テストを全部AIに書かせて半年間開発してみたよ](https://zenn.dev/nttdata_tech/articles/8a010aff542625) |
| SRC-0257 | 2026-02-17 | 富士通株式会社 | 富士通のプレスリリース。要件定義から結合テストまで複数AIエージェントが協調し人が介さず自動化すると主張。「生産性100倍」は約300件中1案件の結果である。 | TH01 TH11 | [大規模言語モデル「Takane」を活用し、ソフトウェアの要件定義から設計、実装、結合テストに渡る全工程をAIエージェントが協調し実行するAIドリブン開発基盤を開発し、運用開始](https://global.fujitsu/ja-JP/pr/news/2026/02/17-01) |
| SRC-0334 | 2022-05-20 | NECソリューションイノベータ | SIer による4M変更(変化点)管理の解説コラム。Man の変化点として担当者変更・増員・欠勤を挙げ、影響度・頻度・損失で優先順位を付けること、変化点を多発させない工程への改善、3H(初めて・変更・ | TH02 | [4Mとは？変更管理と分析方法の基本を解説](https://www.nec-solutioninnovators.co.jp/sp/contents/column/20220520_4m.html) |
| SRC-0335 | 2025-09-14 | Sky株式会社 Sky Tech Blog | トヨタ発の DRBFM(変更点・変化点に着目した設計レビュー)をソフトウェア開発へ適用する手順の解説。メモリ使用量や API 呼出頻度の変化を変化点として扱う例を示す。 | TH02 TH06 | [DRBFMを活用した設計品質の向上](https://www.skygroup.jp/tech-blog/article/1592) |
| SRC-0381 | 2026-08-15 | NCDC テックブログ(Zenn) | NCDC の考察記事(2026-08-15)。AI エージェントは ADR 形式の決定を他の文書より強く守るため、陳腐化した ADR にも従い続け、ADR は増える一方で減らない。削除ではなく、確信度 | TH05 TH03 | [ADRはAI駆動開発の武器になるが、負債にもなるかもしれない](https://zenn.dev/ncdc/articles/ad8bdc27c199b6) |
| SRC-0386 | 2026-08-01 | 合同会社小村ソフト | 受託開発の仕様書の納品形式を整理した記事の知識マップ(最終確認 2026-08-01)。開発側の原本は Markdown+Git とし Pandoc で顧客向け Word/PDF を生成する。合意版は | TH05 TH12 | [知識マップ: 受託開発の仕様書、Excelのままでいいのか ── 納品物としての形式の選び方](https://comcomponent.com/blog/deliverable-spec-documents-format-excel-word/knowledge) |
| SRC-0423 | 2025-07-10 | 豆蔵デベロッパーサイト(株式会社豆蔵) | 日本の SIer の PM が、チェックリストの形骸化と肥大化の原因と対策を実務経験から整理した記事。「改善＝項目追加」という誤解が肥大化を招くこと、意味の分からない項目にチェックだけ付ける実例を挙げ | TH07 | [チェックリストの形骸化を防ぐ｜デキるPMの再構築術と7つの改善策](https://developer.mamezou-tech.com/blogs/2025/07/10/pm_checklist_rebuild_and_improve) |
| SRC-0425 | 2025-10-16 | NTTデータ DATA INSIGHT | NTTデータ品質保証部による、生成 AI で開発したソフトウェアの品質保証の考え方。日本の SIer で品質ゲートの基準に使われてきたバグ検出密度などの規模依存指標は、AI 生成では比較基準が成り立ち | TH07 TH11 | [生成AIを使って開発したソフトウェアの品質保証](https://www.nttdata.com/jp/ja/trends/data-insight/2025/1016) |
| SRC-0445 | 2026-05 | パーソル＆サーバーワークス株式会社 | 日本の SIer 社員が、社内の約100名規模の Kiro ワークショップ(2026-04-16)に参加した所感。文書に立ち返れる安心感を利点とする一方、仕様駆動はバイブコーディングより完成に時間がか | TH08 | [【Kiro】仕様駆動開発って実際どんな感じ？](https://persol-serverworks.co.jp/blog/kiro/kiro-4.html) |
| SRC-0624 | 2026-05-15 | 野村総合研究所 | NRI の AI 担当役員による投資家向け説明資料。「NRI自身のAI変革」の部(p.14-19)を読んだ。AI 駆動開発を開発プロセスモデルへ段階的に組み込む計画と適用率目標を示すが、値は目標と試算 | TH12 TH01 TH11 TH02 | [企業のAX (AI変革) 動向とNRIの戦略・取り組み(中期経営計画フォローアップ説明会)](https://ir.nri.com/jp/ir/library/businessplan/main/011111110/teaserItems2/01119/linkList/01/link/260515pre_1.pdf) |
| SRC-0628 | 2026-06-20 | Zenn | 準委任中心の零細受託開発会社(デンキヤギ)の社長による営業実感の報告。Coding Agent を入れた事業会社が外注を止めたこと、準委任から請負へ移る必要を述べる。自社と周辺の観察で、件数などの数値 | TH12 TH02 TH01 | [AI以後の受託システム開発はどうなっていくのか（2026年6月版）](https://zenn.dev/terurou/articles/eb9e7a4ca7b364) |

## user-it(2)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0096 | 2026-05-19 | SOMPO Digital Lab 開発チームブログ | SOMPO Digital Lab の QA エンジニアが、Claude Code を PM/SE/PG/QA のエージェントに分業させ、人は PM エージェントにだけ指示する構成にしたら開発が安定し | TH01 TH06 TH03 | [【QAエンジニアの開発貢献を考える】Claude Codeに「PM/SE/PG/QA」を分業させたら開発が安定した話 〜QAエンジニアが行き着いたエージェント責務分離〜](https://tech.sompo.io/entry/2026/05/19/144219) |
| SRC-0253 | 2026-04-24 | 一般社団法人日本情報システム・ユーザー協会(JUAS) | 上場企業層のIT部門長を対象とする定点調査(957社、2025年9〜10月)。コード系生成AIの導入が+11.9pt伸びた一方、システム開発のQCDは10年傾向で悪化・横ばいでスキル不足が顕著化。 | TH11 TH12 | [企業IT動向調査報告書 2026(2025年度調査)](https://juas.or.jp/cms/media/2026/04/JUAS_IT2026.pdf) |

## government(20)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0094 | 2026-07-31 | 独立行政法人情報処理推進機構 産業サイバーセキュリティセンター 中核人材育成プログラム 9期生 | IPA 産業サイバーセキュリティセンター9期生の成果物(IPA の公式見解ではない旨を明記、有効期限2年)。対策を技術要件(T)・運用対策(O)・人的統制(H)に分け、人の承認は「業務リスクに基づき対 | TH01 TH12 TH07 | [生成 AI および AI エージェントを安全に活用するための手引書(第1版)](https://www.ipa.go.jp/jinzai/ics/core_human_resource/final_project/2026/rcu1hd0000018kkn-att/rcu1hd0000019kwj.pdf) |
| SRC-0095 | 2026-03-12 | 総務省・経済産業省 | AI事業者ガイドライン(第1.1版→更新)の令和7年度更新内容。AIエージェントを「特定の目標を達成するために、環境を感知し自律的に行動するAIシステム」と定義し、自律的に動作するため「人間の判断を介 | TH01 TH12 | [AI事業者ガイドラインの令和７年度更新内容(資料2)](https://www.soumu.go.jp/main_content/001059300.pdf) |
| SRC-0154 | 2026-07-16 | 独立行政法人情報処理推進機構(IPA) | IPA の年次 DX 動向調査(2026-04-17〜06-12、国内 1,799 社)の速報。AI 導入は大企業中心に広がるが効果は業務効率化・迅速化が中心で、期待どおり以上の効果は限定的。企業価値 | TH09 TH12 | [プレス発表 国内企業のDX動向・AI活用動向のポイントを公表(DX動向2026調査のポイント)](https://www.ipa.go.jp/pressrelease/2026/press20260716.html) |
| SRC-0249 | 2026-06-25 | デジタル庁(AWS Summit Japan 2026 講演資料) | デジタル庁クラウドエンジニアの講演資料。PO兼エンジニア1名+AIエージェントで小規模機能を実装した検証(見積720H→実績約120H)と、ボトルネックが実装から判断・承認へ移ることを示す。 | TH01 TH02 TH03 TH07 TH11 TH12 | [ガバメントクラウドでの AI 駆動開発の設計と実践(AWS Summit Japan 2026 AIM203)](https://pages.awscloud.com/rs/112-TZM-766/images/R11_0625_3_AIM203_v1.pdf) |
| SRC-0250 | 2026-06-12 | デジタル庁(デジタル社会推進会議幹事会決定) | 政府情報システムで遵守すべき Normative 文書。CAIO がユースケースのリスクレベルを判断し、出力結果の適切さを職員が判断せず利活用する設計を高リスク側に置く。 | TH01 TH12 | [デジタル社会推進標準ガイドライン DS-920 行政の進化と革新のための生成AIの調達・利活用に係るガイドライン(2026年6月12日改定)](https://www.digital.go.jp/assets/contents/node/information/field_ref_resources/decb64eb-f26e-41cb-8d37-f3dd173108b8/59054b35/20260612_resources_standard_guidelines_guideline_01.pdf) |
| SRC-0251 | 2026-07-21 | デジタル庁(閣議決定) | 2026年版重点計画の概要。政府調達に係るガイドライン群を「AI駆動開発」推進の方向で改定し、デジタル庁の開発工程でもAIを活用する方針を示す。 | TH12 | [令和8年「デジタル社会の実現に向けた重点計画」(概要)](https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/5ecac8cc-50f1-4168-b989-2bcaabffe870/e57711d5/20260721_policies_priority_outline_01.pdf) |
| SRC-0252 | 2026-07-30 | 独立行政法人情報処理推進機構(IPA) | IPAの定点調査(日本企業1,799社)。AI利活用は業務効率化中心で、プログラム・システム開発支援は効果が出ている割合が高い一方「効果が出ていない」も3割弱ある。 | TH11 TH12 | [DX動向2026 広がるAI導入、DXは変われるか](https://www.ipa.go.jp/digital/chousa/dx-trend/rcu1hd0000017uk8-att/dx-trend-2026.pdf) |
| SRC-0307 | 2026-09 | 経済産業省 商務情報政策局 サイバーセキュリティ課 | 経産省のワーキンググループ資料。AI エージェントを利用する企業向けの実務的なセキュリティ指針が無いとして策定方針を示す。自律性と行動範囲に応じた統制要求レベルを設け、リビングドキュメントとして運用す | TH12 TH01 TH07 | [AIエージェントを利用する事業者におけるセキュリティ対策の好事例の取りまとめに向けた検討方針(資料4)](https://www.meti.go.jp/shingikai/mono_info_service/sangyo_cyber/wg_seido/wg_ai_agent/pdf/001_04_00.pdf) |
| SRC-0443 | 2026-02-27 | 情報処理推進機構(IPA)委託調査 | IPA の依頼で実施された要件定義・モデリングの普及戦略調査(15頁)。自然言語ベースの要件定義にトレーサビリティ管理の課題があるとし、生成AIへの入力と成果物の妥当性検証の手段として、モデルベース要 | TH08 TH12 | [Software-Defined Societyに関する情報収集・分析等業務 調査報告書](https://www.ipa.go.jp/digital/kaihatsu/rcu1hd0000007vaz-att/sds-research-report-20260227.pdf) |
| SRC-0499 | 2026-07-14 | 内閣府(人工知能戦略本部) | AI 法(令和7年法律第53号)第18条に基づく法定計画の第2期。策定から約半年で改定し、当面は毎年変更すると明記した。人の責任の在り方として Human in the loop / on the l | TH12 TH01 | [人工知能基本計画(令和8年7月14日閣議決定)](https://www8.cao.go.jp/cstp/ai/ai_plan/aiplan_20260714.pdf) |
| SRC-0500 | 2026-03-31 | 総務省・経済産業省 | 法的拘束力のない日本の統一的な AI ガバナンス指針の第1.2版。本編から AI エージェントの定義、Living Document としての更新方針、人間の判断の介在と自動化バイアス対策の記述を読ん | TH12 TH01 TH06 | [AI事業者ガイドライン(第1.2版)](https://www.meti.go.jp/shingikai/mono_info_service/ai_shakai_jisso/pdf/20260331_1.pdf) |
| SRC-0501 | 2026-03-10 | デジタル庁 | DS-920 改定案を審議した会議の議事要旨(開催 2026-03-10)。人がガイドラインのルールを全量守る運用の負担と、ルールをシステム側で実装する方向が発言された。発言は個人の意見である。 | TH12 TH07 TH03 | [第3回先進的AI利活用アドバイザリーボード(議事要旨)](https://www.digital.go.jp/councils/ai-advisory-board/80174015-f73b-4d98-811e-c601c26c0ba5) |
| SRC-0502 | 2026-07-07 | AIセーフティ・インスティテュート(J-AISI) | J-AISI の AI セーフティ評価観点ガイド改訂版の概要。AI エージェント特有の観点として「観測と制御」を新設し、評価観点は網羅的でなく将来更新される前提と明記した。 | TH12 TH01 | [AIセーフティに関する評価観点ガイド(第1.20版)概要](https://aisi.go.jp/assets/pdf/ai_safety_eval_summary_v1.20_ja.pdf) |
| SRC-0503 | 2026-03-03 | 金融庁 | 金融庁の AI ディスカッションペーパー改訂版(規制文書ではない初期的な論点整理)。技術中立の姿勢を維持し、AI エージェントの管理態勢は金融機関が試行錯誤している段階と記述する。 | TH12 TH02 | [AIディスカッションペーパー(第1.1版)— 金融分野における AI の健全な利活用の促進に向けた初期的な論点整理](https://www.fsa.go.jp/news/r7/sonota/20260303/aidp_version1.1.pdf) |
| SRC-0537 | 2023-04-07 | 企業会計審議会(金融庁) | J-SOX の基準・実施基準の現行版(令和5年改訂)。職務分掌は「複数の者」「別の者」「担当者」の間の分担・分離として書かれ、PDF 全文を検索しても AI・人工知能の語は無い。内部統制の限界として費 | TH01 TH07 TH12 | [財務報告に係る内部統制の評価及び監査の基準並びに財務報告に係る内部統制の評価及び監査に関する実施基準の改訂について(意見書)](https://www.fsa.go.jp/news/r4/sonota/20230407/1.pdf) |
| SRC-0619 | 2025-06-04 | e-Gov 法令検索(デジタル庁) | AI 法の条文全文(全28条と附則)。事業者に直接掛かるのは第7条の活用努力と国・自治体施策への協力義務だけで、開発プロセス・体制・人の関与を定める条項も罰則も無い。 | TH12 | [人工知能関連技術の研究開発及び活用の推進に関する法律(令和七年法律第五十三号)](https://laws.e-gov.go.jp/law/507AC0000000053) |
| SRC-0620 | 2025-12-19 | 人工知能戦略本部(内閣府) | AI 法第13条に基づく指針(全9ページ)。活用事業者にライフサイクル全体の組織的なリスク管理プロセスを含む AI ガバナンスの構築・運用を求めるが、水準は各主体に委ね、人が占めるべき役割は定めていな | TH12 TH01 | [人工知能関連技術の研究開発及び活用の適正性確保に関する指針](https://www8.cao.go.jp/cstp/ai/ai_guideline/ai_gl_2025.pdf) |
| SRC-0621 | 2026-04-09 | 経済産業省(AI利活用における民事責任の在り方に関する研究会) | 不法行為責任を中心に AI 利用時の過失判断を整理した経産省の手引き。読んだのは 2.1、2.2、4.3(AI エージェントの補論)。契約責任は対象外で、請負の契約不適合責任には触れない。 | TH12 TH01 | [ＡＩ利活用における民事責任の解釈適用に関する手引き 第1.0版 ](https://www.meti.go.jp/shingikai/mono_info_service/ai_utilization_civil/pdf/20260409_1.pdf) |
| SRC-0622 | 2026-07-07 | AIセーフティ・インスティテュート(AISI) | J-AISI の評価観点ガイド改訂版の本文(概要版は台帳に既にある)。読んだのは 3.6、3.11 と巻末の AI エージェントシステムの分類・リスク表。自律性を3段階に分け、評価項目例に人の介入・停 | TH12 TH01 TH07 | [AIセーフティに関する評価観点ガイド(第1.20版)](https://aisi.go.jp/assets/pdf/ai_safety_eval_v1.20_ja.pdf) |
| SRC-0631 | 2026-09-07 | 独立行政法人情報処理推進機構(IPA)セキュリティセンター | IPA が 2026-06-08〜08-10 の AI セキュリティ事例を一次情報源から要約した定期刊行物(要約作成に AI を使用と明記)。読んだのはエグゼクティブサマリー(p.5-11)と 1.1 | TH12 TH07 TH06 | [AIセキュリティ短信 2026年8月号](https://www.ipa.go.jp/digital/ai/security/rcu1hd0000007gji-att/2026-2_0907.pdf) |

## academic(4)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0057 | 2026-01-29 | arXiv / MSR '26(23rd International Conference on Mining Software Repositories, Mining Challenge) | 前回メモが「レビュアー感情の逆転」として最重要視した MSR '26 論文の本文。AMR(意味的冗長性)は AI 0.2867 対人間 0.1532(1.87 倍、p<0.001)。感情はエージェント | TH06 TH10 | [More Code, Less Reuse: Investigating Code Quality and Reviewer Sentiment towards AI-genera](https://arxiv.org/abs/2601.21276) |
| SRC-0270 | 2025-09-18 | arXiv / PROFES 2025 | 奈良先端科学技術大学院大学(NAIST)らによる242リポジトリ・253件のClaude.mdの構造と内容の分析(PROFES 2025 採録)。浅い見出し構造で、ビルド・実行手順と実装詳細・アーキテ | TH01 TH03 | [On the Use of Agentic Coding Manifests: An Empirical Study of Claude Code](https://arxiv.org/abs/2509.14744) |
| SRC-0315 | 2026-04-13 | MSR '26 (ACM) / Waseda University, The University of Osaka, Ritsumeikan University ほか | 日本の大学群による MSR 2026 論文。AIDev の閉じたエージェント PR 11,048件(人のレビュー付き9,799件)から717件を手で読み、マージ/却下の理由を復元した。却下はエージェン | TH10 TH11 | [Why Are Agentic Pull Requests Merged or Rejected? An Empirical Study](https://arxiv.org/abs/2605.22534) |
| SRC-0319 | 2026-09-03 | 情報処理学会 ソフトウェアエンジニアリングシンポジウム2026(SES2026)論文集 pp.160–169 | 九州大学の単著の実践論文。LLM 支援の仕様駆動開発で、生成物やレビュー所見をどの仕様階層・責務・承認状態へ帰属させるかという判断を「裁定負荷」と定義した。三役レビュー(主役・敵対役・判定役)の所見1 | TH08 TH06 TH01 | [LLM支援仕様駆動開発における裁定負荷の実践的分析](https://ipsj.ixsq.nii.ac.jp/records/2011758) |

## consultancy(4)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0153 | 2025-05-20 | Goodpatch Blog | Goodpatch による日本企業の生成 AI 新規事業の失敗パターン整理。チャットボットを作ったが使われない、それらしいプロトタイプはできたが売れる目処がない、技術的ハードルで検討が止まる、の 3  | TH09 | [生成AIで新規事業を、と言われたあなたへ　技術先行で失敗しないために最初にやるべき「3つの設計」](https://goodpatch.com/blog/2025-05-ai-new-business) |
| SRC-0280 | 2026-07-22 | Speaker Deck(AIオブザーバビリティ スペシャル#2) | AI導入・コスト最適化支援の合同会社代表による登壇資料。同一ワンショットプロンプトでアプリ1本を、最上位モデル単独と役割別モデル出し分けで作り、トークン・時間・コスト・品質を比較した。 | TH04 TH11 | [そのタスク、Fableじゃなくていい。可視化して分かったムダをHaiku×サブエージェントへの委譲で削る](https://speakerdeck.com/irishkooky/sonotasuku-fableziyanakuteii-ke-shi-hua-sitefen-katutamudawohaikuxsabuezientohenowei-rang-dexue-ru) |
| SRC-0333 | ? | ものづくりドットコム(技法コラム。著者所属: 合同会社高崎ものづくり技術研究所) | 製造業に50年従事したコンサルタントによる4M変化点管理の解説(掲載日は取得できず。後半は会員限定)。人員交替直後などを管理対象に含め、管理範囲をモデル工程から段階的に広げ、半年〜1年周期で管理項目自 | TH02 | [4M変更管理（変化点管理）で不良発生を未然に防止](https://www.monodukuri.com/gihou/article/814) |
| SRC-0536 | 2026-01-28 | EY Japan(EY新日本有限責任監査法人)情報センサー 2026年2月号 | 監査法人(Big4)の公認会計士による、財務・会計領域の AI エージェント利用と監査への影響の論考。人は目標設定・結果レビュー・承認へ移ると述べ、Human in the Loop の厚さはリスクア | TH01 TH07 TH12 | [AIエージェントが切り開く会計・監査の未来 後編](https://www.ey.com/ja_jp/insights/digital/info-sensor-2026-02-06-digital-and-innovation) |

## media(4)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0155 | 2026-08-18 | 日経BP 一歩先への道しるべ ビズボヤージュ | 大塚商会の上席執行役員とフィラメント CEO が、生成 AI が人間へ段階的に質問して新規事業仮説を組み上げる「AI 起点」のプロンプトを実演。自社の強み分析→業界選定→課題→ソリューション→事業計画 | TH09 | [AIは新規事業を開発できるのか？(大塚商会×フィラメント 実演セッション)](https://project.nikkeibp.co.jp/onestep/feature/00048/081700005/) |
| SRC-0259 | 2026-08-13 | ＠IT(アイティメディア) | メルカリのセキュリティ・AI基盤担当へのインタビュー(会員限定記事だが本文を取得)。2026年5月からClaude Code/Coworkを全社展開し、MDMで職種別に設定を出し分け、PMが自らコード | TH01 TH04 TH12 | [メルカリが明かす「Claude Code全社展開」「シャドーAI対策」を支える仕組み：メルカリのAIエージェント活用＆AIガバナンス大解剖（2）](https://atmarkit.itmedia.co.jp/ait/articles/2608/04/news002.html) |
| SRC-0269 | 2026-08-31 | 株式会社キッカケクリエイション(KIKKAKE ITREND)/PR TIMES | システム開発に携わるITエンジニア321名へのインターネット調査(2026年5月)。AIツール普及後にストレスが増えたとする回答が36.1%で、非エンジニア職からの「もっと早くできるだろう」という期待 | TH08 TH11 | [【AIが生んだ「期待のズレ」】約半数が非エンジニア職から「AIがあるならもっと早くできるだろう」と言われた経験あり 約4割が「AIツール普及後、ストレスはむしろ増えた」と回答](https://prtimes.jp/main/html/rd/p/000000060.000068613.html) |
| SRC-0627 | 2026-06-30 | 日経クロステック(xTECH) | AWS Summit Japan 2026 の基調講演を報じた記名記事。無料で読める1ページ目だけを読んだ(2ページ目以降は有料会員限定)。損保大手が基幹系を含む本番案件で AI 駆動開発を検証する方 | TH12 TH02 | [東京海上日動火災保険がAI駆動開発を導入、10件以上の本番案件で検証](https://xtech.nikkei.com/atcl/nxt/column/18/03664/062900006/) |

## individual(38)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0123 | 2026-06-25 | Qiita | 個人の JSONL ログ全件(104 ファイル・97 セッション・応答 5,529 回)を input / cache_read / cache_creation / output に分解した実測(2 | TH04 | [Claude Code のトークン消費を実測したら、ほとんどは本当にキャッシュだった](https://qiita.com/leomarokun/items/1e299daebd089b26786d) |
| SRC-0124 | 2026-04-19 | Qiita | 800 時間超の自律運用ログ(21,770 往復)を持つ個人の記事(2026-04-19、更新 2026-09-14)。推定請求額の 70.1% がキャッシュ読み出し、出力 15.2%。#274 の  | TH04 TH02 | [Claude Codeのトークン消費を減らす5つの方法——Opus 4.7で+35%になった今やるべきこと](https://qiita.com/yurukusa/items/435810e1e8a046c99916) |
| SRC-0151 | 2026-03-14 | Zenn | 個人開発者が CLAUDE.md に秘書・CEO・商品企画・批判者・リサーチ・マーケの役割を定義して企画を回した一次記録。AI が同調しがちで批判が足りないため、内部データを使わず独自に一次情報を集め | TH09 TH06 TH01 TH02 | [Claude Codeで"AI仮想チーム"を作って個人開発を回してみた](https://zenn.dev/dinekt/articles/ai-virtual-team-with-claude-code) |
| SRC-0152 | 2026-04-28 | Zenn | 個人開発者が Claude Code で要件定義→設計→開発→テストを回した率直な記録。AI が自分の実力以上の設計書を出し、理解が曖昧なまま進んで結局自分で書き直した。型定義からではなく画面から作る | TH09 TH01 TH06 | [AIを活用して個人開発してみた](https://zenn.dev/ryo_hajime/articles/40fae3abf21862) |
| SRC-0271 | 2026-09-13 | Zenn | Claude Code の15並行セッションを役割分担で77日運用した個人が、ルールベース巡回の120回分を実測した記録。異常のほぼ全てが例外を出さない『沈黙』で、人の目もエージェントの自己申告も取り | TH01 TH02 TH07 TH11 | [AIエージェント運用、巡回120回で「異常なし」は9回](https://zenn.dev/selftailor/articles/a3897eac7d4603) |
| SRC-0272 | 2026-09-17 | Qiita | 個人開発(著者はKDDIアジャイル開発センター所属、個人アカウントでの投稿)で、常駐コンテキスト(CLAUDE.md・メモリ索引・Skills説明文)を索引化して削った前後を36日・238セッションで | TH03 TH04 TH05 | [常駐コンテキストを削りClaude Codeのコストを抑えてみた](https://qiita.com/ya-mizobuchi/items/6ae906dd28bf61b32329) |
| SRC-0273 | 2026-07-14 | Zenn | 一人開発で Claude Code の完了報告が『実行した』と『意図した状態になった』を取り違える事例(未push、空ファイル)を記録し、報告をコマンド出力で構成させる検収様式を示した記事。 | TH07 TH02 | [Claude Codeの「やりました」を信用してはいけない——完了報告に証拠を要求する運用](https://zenn.dev/miharu_tools/articles/cc-completion-report-evidence) |
| SRC-0275 | 2026-06-26 | Zenn | 個人開発者が4か月、失敗ログ→ルール化→hook 強制で Claude Code 環境を育てた記録。CLAUDE.md のルールは別セッションで忘れられ、hook へ移すと守られたこと、並列ワークフロ | TH03 TH04 TH07 | [Claude Code の harness を4ヶ月育てた記録](https://zenn.dev/hinapupil/articles/claude-code-harness-engineering-in-practice) |
| SRC-0276 | 2026-08-24 | Zenn | Claude Code の入れ子既定深さ3化(v2.1.219)を受け、個人の19サブエージェント構成を実測で棚卸しした記録。検品役に Edit を渡さず権限で不可能にする設計と、Bash がその保証 | TH01 TH03 TH07 | [サブエージェント階層設計の作法：深さ3が既定になっても、私の構成は1段のままだった](https://zenn.dev/haruhiro1020/articles/063a9add9d0d38) |
| SRC-0277 | 2026-07-27 | Zenn | Anthropic の Claude 5 世代向け指針を受けて、個人の自作ルール(CLAUDE.md/rules)を実セッションの system prompt・tool description と照合 | TH02 TH03 TH05 | [Opus 5 世代でルールの書き方は公式に変わった——自作ルールの棚卸し手順](https://zenn.dev/shimo4228/articles/claude5-rules-official-shift-audit) |
| SRC-0279 | 2026-07-11 | Zenn | 定額の安価プラン利用者が Codex のサブエージェントに軽量モデルを指定したが、隠しパラメータのため親モデルで動いて利用枠が急減した事例を、セッションログと公開 Issue・ソースで原因特定した記録 | TH02 TH04 TH07 | [CodexのサブエージェントにGPT-5.6 Lunaを指定したのに、実際はSolが動いていた件](https://zenn.dev/hayatosc/articles/codex-agent-issue) |
| SRC-0281 | 2026-09-20 | Qiita | 観点別並列レビュー+検証段のワークフローを Claude Code の Dynamic Workflow で実装し、同一モデル・同一文脈の検証段が全指摘を追認した失敗と、外部証拠・反証フレーミング・モ | TH06 TH01 TH04 | [エージェントを増やしても賢くならない — graph engineering を Claude Code の Dynamic Workflow だけで実装して分かったこと](https://qiita.com/banquet_kuma/items/f43a22ab24f219ed0569) |
| SRC-0282 | 2026-07-27 | Zenn | AIに批判役を与える敵対的レビューで返った指摘9件の採否を実ログで仕分けた記録。却下はゼロで、難所は『どの水準で受けるか』の選択にあり、選ばなかった水準を文書に残す運用を示す。 | TH06 TH05 | [AIレビューの指摘に、真正面から却下できるものはめったにない](https://zenn.dev/cotoha5108/articles/adversarial-review-triage) |
| SRC-0283 | 2026-06-15 | Zenn | 『あなたは世界一のマーケターです』型のロール付与は専門性の指定ではなく、平均化された一般論を役割風に言い直させるだけだと論じ、肩書きではなく必要な思考形態(何を見て何を疑い何を捨てるか)を指定すべきと | TH01 | [そのロールプロンプト、肩書き付きの一般論ではないですか？](https://zenn.dev/continuitymodel/articles/044e5a4a7d24ac) |
| SRC-0284 | 2026-08-01 | note | サブエージェントを大量に動かしても品質は保証されないとし、通常は単体エージェントを標準にして必要性を説明できる場合だけ調査役・レビュー役を足すべきと主張する個人開発者の論考(公式文書・公開事例の読解に | TH01 TH04 TH06 | [CodexとClaudeCodeのサブエージェントは多いほど強いのか？](https://note.com/gtminami/n/n112bdc18083c) |
| SRC-0285 | 2026-09-04 | Zenn | Rails 開発者が、ADR で丁寧に書いた経緯はほとんど読み返されず、前提が古くなると判断を誤らせることさえあると述べ、『決定・現状(SSoT)・経緯一行』の軽い様式を提案する論考。 | TH05 | [ADRは経緯より「決まったこと」だけでいい](https://zenn.dev/yamitake/articles/adr-decision-over-context) |
| SRC-0286 | 2026-07-20 | Zenn | Spec Kit/Kiro の要求ID(FR-001等)をコードとテストにタグ付けし、本文ハッシュで仕様・文書・コード・テストの片側変更を決定的に検出する自作CLIの紹介。個人開発で文書が30ファイル | TH08 TH05 TH07 | [仕様駆動開発で起こる「仕様とコードのズレ」をハッシュで決定的に検出するツールを作った](https://zenn.dev/mrmtsntr/articles/artgraph-spec-code-drift) |
| SRC-0287 | 2025-11-18 | Speaker Deck(Findy「仕様駆動開発〜新たな開発手法の可能性と実践〜」) | Kiro 方式の仕様駆動開発ツール cc-sdd の作者による登壇資料(2025/11/19)。SDD の利点を認めつつ、AI が作る Spec の巨大化、Spec の正確性を検証する手段の欠如、組織 | TH08 TH05 | [仕様駆動開発の理想と現実、そして向き合い方](https://speakerdeck.com/gotalab555/shi-yang-qu-dong-kai-fa-noli-xiang-toxian-shi-sositexiang-kihe-ifang) |
| SRC-0288 | 2026-09-21 | Qiita | GitHub アカウント100万件の一様標本から、稼働中リポジトリの AGENTS.md/CLAUDE.md 等の指示ファイルを全件収集し、普及率・内容・危険な指示を数えた個人の観察調査。 | TH03 TH12 | [GitHub のリポジトリ5件に1件が、AI エージェントへの指示ファイルを持っていた——100万人の GitHub アカウント調査から（第2弾）](https://qiita.com/hisashi-ito/items/62bdc1a983f3f7dc649a) |
| SRC-0289 | 2026-04-07 | Zenn | GitHub Copilot CLI 内に PM を含む7つのペルソナを作り、それぞれ別モデルを割り当てて会議室予約 MCP を自走させた実験の記録。テストは全通過したが第三者レビューで設計レベルの致 | TH01 TH06 TH07 | [GitHub Copilot CLIに7つのペルソナを演じさせる——仮想プロジェクトチームによるMCP開発の顛末（オトナの自由研究 #12）](https://zenn.dev/nnakapa/articles/lab-12-copilot-cli-day3) |
| SRC-0339 | 2026-09 | hidekazu-konishi.com | 日本の個人技術者による、4基盤のモデル廃止・退役日程と用語の横断カレンダー(二次情報)。ベンダーごとに通知期間と用語が異なることを整理している。 | TH02 | [AI Model Deprecation and Lifecycle Calendar - Anthropic, OpenAI, Google, Amazon Bedrock](https://hidekazu-konishi.com/entry/ai_model_deprecation_and_lifecycle_calendar.html) |
| SRC-0361 | 2026-09-23 | GitHub (gotalab) | 日本の個人開発者による Kiro 流の仕様駆動ワークフロー。v3 で旧 /kiro:* コマンド群を非推奨とし、17本の Agent Skills と入口ルーター(kiro-discovery)へ再編 | TH03 TH08 | [gotalab/cc-sdd (README)](https://github.com/gotalab/cc-sdd) |
| SRC-0382 | 2026-07-19 | Zenn | 30名規模の B2G GovTech スタートアップの EM による2年後の振り返り(2026-07-19)。ADR は事前レビューの関所ではなく継続検証される仮説の記録になり、最初の読者は AI に | TH05 TH09 | [ADR（Architecture Decision Record）、2026年 夏](https://zenn.dev/maman/articles/30717ac1c7d2b7) |
| SRC-0383 | 2026-03-02 | Zenn | ADR の形式選定と運用の国内ガイド(2026-03-02)。ADR を導入しない方が合理的な場合として、1〜2人の個人プロジェクト・廃棄前提の PoC・文書化文化ゼロのチームを挙げる。対象はアーキテ | TH05 TH02 | [ADR（Architecture Decision Records）完全ガイド — フォーマット選定から現場についた傷の話まで](https://zenn.dev/miyan/articles/adr-format-guide-for-and-against) |
| SRC-0406 | 2026-06-01 | Qiita | OWASP Top 10 / CWE Top 25 から選んだ実バグ 30 件を CodeRabbit・Claude Code Review・GitHub Copilot Review に投げた個人の | TH06 | [あなたのAIコードレビュー、本当にバグを見つけていますか？ — 30件の実バグで3ツールを実測した](https://qiita.com/kenimo49/items/7699e4d2289e48521e0f) |
| SRC-0461 | 2026-07-02 | DEV Community | 日本企業(ROUTE06)所属の筆者の個人的考察。リポジトリ境界より調整の境界が重要で、チームでは人の調整がエージェント並列度の上限を決めると整理し、大規模モノレポで全部見えることは逆効果になりうると | TH10 TH02 TH04 | [AI Agents Don't Need a Monorepo. They Need a Readable Codebase](https://dev.to/gyu07/ai-agents-dont-need-a-monorepo-they-need-a-readable-codebase-4c6f) |
| SRC-0464 | 2026-05-26 | Zenn | 個人開発者が Claude Code の worktree で並列作業した際の失敗モード(メインリポジトリへの直接書き込み、古いベースからの巨大差分、worktree 内コミットの権限問題)と、コミッ | TH10 | [AIに作品の感想を言わせたら、人と人の会話が増えた ― 福祉現場から生まれたAIアプリをAzureでリリースした話](https://zenn.dev/optimisuke/articles/ai-mediator-eeyan) |
| SRC-0465 | 2026-04-21 | Zenn(Microsoft 有志 Publication) | AIエージェントでスクラムを回したら虚偽の完了報告が頻発し、別モデルの監査役と git 差分の必須確認を入れて解消した個人の報告(日本マイクロソフト/米 Microsoft 社員の有志 Publica | TH07 TH10 TH06 | [AIスクラムチームは嘘をつく](https://zenn.dev/microsoft/articles/2a952ed44e3873) |
| SRC-0508 | 2026-09-11 | GitHub: Takenori-Kusaka/ganbari-quest | 実証案件 ganbari-quest の第22回統合 PR(develop→main)。Issue #273 が引く 181 本・1,368 ファイル・+246,316/−88,961 行・29 日・ | TH10 TH11 TH07 | [ 統合  第22回 (再cut) release/2026-09-11 → main (181 PR / QM が差し戻し 33 件 + severity 3 を閉じた devel](https://github.com/Takenori-Kusaka/ganbari-quest/pull/4892) |
| SRC-0509 | 2026-09-16 | Zenn(GitHub 連携元: Takenori-Kusaka/zenn-content) | Zenn 本『生成AIに実装を任せて商用サービスを作る』の該当章(zenn.dev/takenori_kusaka/books/ganbari-quest-design/viewer/stacked- | TH10 TH11 TH07 | [第Ⅶ部-3　機械が発行する統合プルリクエスト ― 含まれる変更を git から数え、署名して残す](https://github.com/Takenori-Kusaka/zenn-content/blob/70ba49944733e2fd9f0891388b8dfdedcbcb9d72/books/ganbari-quest-design/stacked-pr-integration.md) |
| SRC-0510 | 2026-07-30 | GitHub: Takenori-Kusaka/ganbari-quest | #270 / #267 が引く「装置 51,607 行・製品 67,687 行・検査 63 本・20 PR 中 12 本」の出所の Issue。2026-08-02 の再計測で 51,607 行と未参 | TH07 TH11 | [ EPIC  E5: 検証装置を 8 本に絞る — 証跡の真正性だけ機械で守り、書式 gate は撤去する](https://github.com/Takenori-Kusaka/ganbari-quest/issues/4121) |
| SRC-0511 | 2026-08-01 | GitHub: Takenori-Kusaka/ganbari-quest | ganbari-quest のロール憲章。§0(2026-08-05 追加)が装置の追加凍結と「80 点で止める」、その根拠の実測(56%、61 本、3.5 時間)を、§6 が未解決 4 点を記す。# | TH07 TH02 TH11 | [チーム憲章 — 誰が何を決め、誰に渡すか(docs/sessions/README.md)](https://github.com/Takenori-Kusaka/ganbari-quest/blob/053463794f117d7f79f961efc28be18fb7e4d43f/docs/sessions/README.md) |
| SRC-0512 | 2026-08-05 | GitHub: Takenori-Kusaka/ganbari-quest | #267 / #270 が「装置が本番を 3.5 時間止めた」と引く事象の Issue。バックアップの沈黙を防ぐために足した検査 step が deploy を失敗させ、セルフホスト本番のコンテナが停 | TH07 | [fix(infra): 2026-08-05 のリリースが本番 NUC に届いていない — deploy-nuc.yml の env 生成 step が PowerShell pa](https://github.com/Takenori-Kusaka/ganbari-quest/issues/4275) |
| SRC-0513 | 2026-04-09 | GitHub: Takenori-Kusaka/ganbari-quest | ganbari-quest の ADR 一覧と運用規則(上限 10 件、削除主義、archive、renumber)。#272 の出所。ADR の本数推移と追加・削除数を git 履歴で数え直した。 | TH05 TH07 | [Architecture Decision Records (ADR) — docs/decisions/README.md](https://github.com/Takenori-Kusaka/ganbari-quest/blob/053463794f117d7f79f961efc28be18fb7e4d43f/docs/decisions/README.md) |
| SRC-0514 | 2026-05-28 | GitHub: Takenori-Kusaka/ganbari-quest | #268 の「33 日で 42 回の drift」の出所の ADR(2026-08-13 に ADR-0068 で置き換え)。42 回の数え方と、構造化スキーマ導入後の観測を原文と git 履歴で確か | TH06 TH07 | [0056. QM Orchestrator role drift の構造的対処 (Adversarial Reviewer + PreToolUse Hook + JSON Sch](https://github.com/Takenori-Kusaka/ganbari-quest/blob/053463794f117d7f79f961efc28be18fb7e4d43f/docs/decisions/0056-qm-drift-prevention-by-structural-agent-constraint.md) |
| SRC-0515 | 2026-08-14 | GitHub: Takenori-Kusaka/Filetto | 本標準の実証案件 Filetto の、Issue #252 起票 23 分前の tree。実装 10 行・文書 21,116 行・ADR 20 本 3,618 行を数え直し、定義を変えた値と同日中の削 | TH11 TH05 TH07 | [Filetto(commit 8e64146、2026-08-14 時点のリポジトリ)](https://github.com/Takenori-Kusaka/Filetto/tree/8e641465ad465fd2cd1243e2036c0e53f991e5a0) |
| SRC-0516 | 2026-08-13 | GitHub: Takenori-Kusaka/Filetto | Issue #240 / #249 が引く「PR 70 件(マージ 64 件)、58% がプロセス整備」を、Filetto の PR と変更ファイルから数え直した。件数と総変更行数は一致、58% は分 | TH11 TH07 | [Filetto の Pull Request 一覧(2026-08-13T11:14Z までの 70 件)](https://github.com/Takenori-Kusaka/Filetto/pulls?q=is%3Apr+created%3A%3C2026-08-13T11%3A15%3A00Z) |
| SRC-0517 | 2026-08-14 | GitHub: Takenori-Kusaka/Filetto | Issue #254 が引く「直近 CI 100 実行の失敗 14 件の内訳」を、gate-g5 workflow の実行履歴(Actions API)から失敗ジョブ単位で数え直した。 | TH07 TH02 TH10 | [Filetto .github/workflows/gate-g5.yml(G-5 自動検証)と実行履歴](https://github.com/Takenori-Kusaka/Filetto/blob/71a2cde34f38f236440fdd0707afcf6174f54b98/.github/workflows/gate-g5.yml) |

## vendor(5)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0192 | 2026-09 | Anthropic | Claude Code 公式ドキュメント「メモリ/CLAUDE.md」の日本語版(英語原文の公式翻訳、2026-09-24 取得)。CLAUDE.md は強制ではなく文脈であり、200 行以下を目標と | TH03 TH04 TH07 | [Claude があなたのプロジェクトを記憶する方法](https://code.claude.com/docs/ja/memory) |
| SRC-0227 | 2026-09-01 | Amazon Web Services ブログ(アマゾン ウェブ サービス ジャパン) | AWS ジャパンの SA が、少人数・兼務・実質統合 1 か月で AWS Summit Japan 2026 のデモを Kiro で作った開発記録。要件・設計・タスクを形式的に分けず Design D | TH03 TH08 TH10 TH02 | [AWS Summit Japan 2026 Physical AI デモの裏側 Part 1: 企画からステージ制作、アプリケーション開発まで](https://aws.amazon.com/jp/blogs/news/physical-ai-autonomous-agent-demo-backstage-part1/) |
| SRC-0484 | 2026-09-16 | ファインディ株式会社 | ファインディがインテージに委託したインターネット調査(従業員300名以上の企業でAI予算に関与する課長級以上、n=435、2026年8月6〜10日、自社ユーザー調査ではない)。開発組織の35.9%がA | TH11 TH04 | [【AI投資の実態調査】AI投資は8割超の企業で増加も、最大費目は「AI利用・稼働させるためのコスト」に偏重──事業成果につながる投資は道半ば](https://findy.co.jp/4513) |
| SRC-0625 | 2026-06-18 | Amazon Web Services ブログ | 日立グループ3社が参加した AI-DLC ワークショップの報告と、日立の推進担当者への対談(AWS 執筆)。工数削減の値は参加者の体感で、品質保証工程を織り込んだ「日立版 AI-DLC」はこれから作る | TH12 TH01 TH11 TH02 | [日立グループ合同「AI-DLC Unicorn Gym」開催レポート ── 日立 AI駆動開発のキーマンに聞く、グループ展開への道筋](https://aws.amazon.com/jp/blogs/news/ai-dlc-unicorn-gym-htachi-group-2026/) |
| SRC-0626 | 2025-09-26 | Amazon Web Services ブログ | 損保系 IT 子会社が2025年8月に行った AI-DLC ワークショップの報告(AWS 執筆)。4チームが1.5日で初期版を作り、段階的な承認より現場判断が有効という所見を得たが、既存改修と大規模開 | TH12 TH09 TH11 | [東京海上日動システムズ株式会社様の AWS 生成 AI 事例：金融業界初 AI-DLC Unicorn Gym による開発変革への挑戦](https://aws.amazon.com/jp/blogs/news/tokio-marine-ai-dlc/) |

## nonprofit(2)

| ID | 公開日 | 発表元 | 要約 | テーマ | 出典 |
|---|---|---|---|---|---|
| SRC-0424 | 2026-09 | 一般財団法人日本科学技術連盟(SQiP) | SQiP 2026 の講演概要。単独開発者＋AI ペアの実践でテスト失敗のノイズが品質ゲートを壊す危険と、RCA・ポカ除けによる対策を報告する講演がある。大規模自治体案件で生成 AI を QA へ組み | TH07 TH02 TH01 | [ソフトウェア品質シンポジウム 2026 本会議1日目 講演テーマ・講演者紹介](https://www.juse.jp/sqip/symposium/detail/day1) |
| SRC-0483 | 2026-03-12 | 一般社団法人日本情報システム・ユーザー協会(JUAS) | JUAS「企業IT動向調査2026」(経産省監修、東証上場企業等4,500社の IT 部門長に依頼し957社が回答、2025年9〜10月)の AI 活用速報。言語系生成AIの導入済みは33.9%、コー | TH11 TH12 | [～「企業IT動向調査2026」速報～ 3社に1社が生成AIを「導入済み」、「検討中」を含むと5割超に、売上高1兆円以上の大企業では8割超が「導入済み」](https://prtimes.jp/main/html/rd/p/000000013.000160762.html) |

## 注記

<!-- notes:start -->
- 分布(region=jp 99件、2026-09-24 時点): individual 28、enterprise 24、sier 14、government 14、academic 4、consultancy 3、media 3、vendor 3、startup 2、user-it 2、nonprofit 2
- Web 系: enterprise 24件は LINEヤフー [SRC-0098][SRC-0262]、メルカリ [SRC-0258]、ZOZO [SRC-0267]、カカクコム [SRC-0260]、Sansan [SRC-0264] など Web 系事業会社の技術ブログが中心。運用設計を記した一次事例はこの層に集まる(自社による報告)
- SIer(14件): 一次事例は NTTデータの公共案件2件 [SRC-0255][SRC-0256]、APC の PR レビュー運用 [SRC-0247]、NCDC の2日間試行 [SRC-0149]、研修参加記 [SRC-0445] の5件。富士通はプレスリリースで、「生産性100倍」は約300件中1案件の結果 [SRC-0257]。残り8件は解説・白書・考察
- ユーザー企業 IT 部門(user-it 2件): 一次事例は SOMPO Digital Lab の1件のみ [SRC-0096]。もう1件は JUAS の質問紙調査 [SRC-0253](速報 [SRC-0483] は nonprofit に分類)
- 公的機関(government 14件): 指針・計画・調査が中心(DS-920 [SRC-0250]、AI事業者ガイドライン [SRC-0500]、人工知能基本計画 [SRC-0499]、IPA DX動向2026 [SRC-0252])。開発の一次事例はデジタル庁の検証1件(1機能、見積 720H → 実績約 120H)のみ [SRC-0249] [FND-0174]
- 個人(individual 28件、最多): Zenn・Qiita の実測ログと失敗記録が中心(トークン内訳 [SRC-0123][SRC-0124]、巡回120回 [SRC-0271]、完了報告の取り違え [SRC-0273])。挙げた4件はいずれも1名の環境での記録
- 海外との違い(観測1、研究デザイン): empirical.md に載る日本の出典は observational 23行・survey 23行・benchmark 2行で、rct と controlled-experiment は0行。LinearB・Faros のような複数組織のテレメトリ [FND-0136] に当たる日本の出典も束に無い
- 海外との違い(観測2、規制の拘束力): 日本は法的拘束力のない指針 [SRC-0500] と政府情報システム向けの規範 [SRC-0250] で、民間への直接の拘束は無い [FND-0173]。EU は AI Act 第14条・第26条が提供者・導入者へ義務を課す [FND-0003]。この2点以外の差は束から確認していない
- **一次事例が乏しい領域**: (a) ユーザー企業 IT 部門(1件)、(b) 稟議・検収・QA 部門との折り合いを記した事例(束に無い)[FND-0174]、(c) 車載・組込み・医療機器など安全重要度の高い領域の開発事例(99件に無い。医療分野は富士通のプレスリリースが業務ソフトの法改正対応を挙げるのみ [SRC-0257]、金融は金融庁が「試行錯誤している段階」と記述 [SRC-0503])、(d) スタートアップ(2件 [SRC-0444][SRC-0485])
- 体制変化の管理(4M・DRBFM)は解説4件 [SRC-0333][SRC-0334][SRC-0335][SRC-0336] のみで測定は無く、体制や AI 編成への転用例は束に無い [FND-0019][FND-0020]
<!-- notes:end -->

