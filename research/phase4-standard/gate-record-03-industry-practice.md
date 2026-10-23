# ゲート記録 調査03: 業界実務と docs-as-code の記録方式

- 調査日: 2026-10-23
- 問い: 規制対象(医療機器・自動車・金融)と大規模 OSS は、コードレビュー承認・設計レビュー・リリース判定の「記録」を Git/GitHub 上でどう残しているか。手入力の帳票を使うか、ツールのイベントを記録として扱うか。「中身を見ずに承認する」問題をどう抑止しているか
- 位置づけ: 一次調査メモ。標準の条項に反映する前に、会議体での議論と既存 ADR との突合を要する(CLAUDE.md コアポリシー)
- 調べ方: WebSearch / tavily で一次資料(公式ドキュメント・規格本文・査読論文・ベンダー文書)を優先して取得した。取得できなかった資料、二次情報しかない事項は「未確認」と明記する

## 0. 先に結論(要約)

本文は長いので、結論だけ先に置きます。根拠は各節と出典一覧を参照してください。

- 業界が「記録」として受け入れている最小の形は、**ツールが自動生成する承認イベント(誰が・何に対して(コミット SHA)・いつ・どの規則で)**に、**承認者が起案者と別人であること**と**承認が最終版に紐づくこと**を機械で保証したもの。ただし監査人は「そのイベントの母集団が完全か」を別途検査する
- 電子署名規制(FDA 21 CFR Part 11)が掛かる領域では、ツールのイベントだけでは足りない。**再認証・署名の意味・役割・氏名・時刻を記録本体に残す**ことが求められ、GitHub は未対応、GitLab は部分対応(再認証のみ)
- 手入力の帳票が残っているのは、**設計レビュー(独立したレビュアー・審査対象・決定・処置を記録する)**、**リリース判定**、**電子署名の意味と役割**の 3 領域。理由は、規制が「イベント」ではなく「内容(誰が独立に、何を審査し、何を決めたか)」を求めるから
- 「属性は機械、判断は人」の分離は OSS で最も明確。Linux kernel のトレーラ、Gerrit の Verified(機械)/Code-Review(人)、Kubernetes の OWNERS(機械が資格を検査)と `/lgtm`・`/approve`(人の宣言)、Chromium の Rubber Stamper(機械が承認できる範囲を限定)
- 形骸化を抑える手段で実証があるのは、**変更の小ささ**、**読む速度の上限**、**起案者の事前注記**、**レビュアーの当該コード経験**、**コメント(議論)を伴う承認**。承認に「何を見たか」の宣言を添える方式(kernel の Reviewer's statement、rdm の定型コメント)は、この実証と整合する
- AI エージェント時代(2025〜2026)の収束点は、**AI は助言し、承認は人が行い、承認者は AI に指示した人を含めて起案者と別人**。ただし OpenAI は社内で「人のレビューは任意」へ振っており、業界は一枚岩ではない

## 1. 医療機器ソフトウェア(FDA 21 CFR Part 11 / 820.30 / IEC 62304)

### 1.1 何が記録として要求されるか

- 21 CFR 820.30(e) の設計レビューは「独立したレビュアー」の参加を求める。ISO 13485 7.3.5 は、参加者と役割、審査結果、処置の記録を求める [S1-07][S1-08]
- IEC 62304 は Part 11 を要求しない。OpenRegulatory は「IEC 62304 はこれ(eQMS と開発ツールの統合)を要求していない。読んで反証してほしい」と明言する [S1-05]
- 21 CFR Part 11 は、電子記録の監査証跡と電子署名(署名者の印字名・日時・署名の意味、再認証)を求める。Ketryx は 11.10(a) の「システムは検証(validate)されていなければならない」を核心に挙げる [S1-01]

### 1.2 docs-as-code の実践例

- **Innolitics rdm**(OSS): 規制文書を Markdown/YAML でリポジトリに置き、「コード変更と並行して GitHub の PR で文書を更新・レビューする」。`rdm pull` で GitHub(Issue を変更要求として扱う)から履歴を YAML に落とし、文書を生成する。README は「PR はレビューされなければならず、**検証を確認する定型コメント**をレビューに置く」と述べ、`reviews_required` 設定でレビューが無い PR に警告する [S1-02]。PR 承認そのものを設計レビュー記録として扱うかは記載がない(未確認)
- **Innolitics の AI 時代の論点**: 「コンプライアンスはコードの性質ではなく、コードを取り巻く証拠と来歴の性質」「レビューは任意の磨き上げから、**定義された受け入れステップ**へ格上げ」[S1-03]
- **OpenRegulatory の IEC 62304 対応表**: 5.5.1(ユニット実装)・5.5.5(ユニット検証)・5.6.x(統合)を「GitHub PR / GitLab MR、CI/CD、merge」に割り付ける。検証記事では「成功したレビュー(= 承認)は検証が成功したことを意味する。レビュアーは『このコードは仕様どおりに見える』と言っている」と、**PR 承認をユニット検証記録として扱う**立場を取る。ただしレビュー基準を事前に(開発計画で)定めることを条件にしている [S1-04][S1-06]
- **OpenRegulatory の警告(Google Drive を QMS にする場合)**: 「タイプした名前、コメント、Drive の承認は、自動的に電子署名になるわけではない。署名が必要か、各署名が何を意味するか、本人確認の方法、署名が記録に結び付き続ける方法、監査証跡に何が入るかを定義せよ」[S1-09]。これは GitHub の Approve ボタンにもそのまま当てはまる
- **Tidepool**(FDA クリア済み Tidepool Loop、GitHub 公開): 2025-04 に自社の OSS QMS「qmsOS」が TÜV SÜD America から ISO 13485:2016 認証を受けた。qmsOS は Google Workspace・Jira・Confluence・Slack の上に築かれ、「Jira の中でリスク評価と承認をワークフローに組み込み、自動テストと反復開発を文書化した」と述べる。コードは GitHub で公開 [S1-10][S1-11][S1-12]。設計開発・リリース SOP(Google Docs)は公開されているが、本文の取得に失敗したため、**PR 承認をどの記録として扱っているかは未確認**
- **Medtronic**: GitHub 上の設計レビュー記録に関する公開資料は見つからず。**未確認**

### 1.3 ツールがイベントを記録へ変換する例

- **Ketryx**: Jira・GitHub・GitLab などの上に重ね、「Jira と GitHub のトランザクションを記録し、FDA 準拠の文書へ自動変換する」。Part 11 署名は Jira のフロントエンドで二段階目の資格情報を入力して行い、署名するとチケットは不変になる。2.6 で「全ての PR が Jira の設計管理項目に紐づくまでリリースをゲートする」機能を追加し、「数千行のコミット表計算」を置き換えると述べる [S1-01][S1-13][S1-14]。**PR の Approve 自体を電子署名として扱うかは未確認**
- Ketryx のインタビューは、コンサルタントの一般的な助言が「完成した記録のスクリーンショットを撮れ」であることを批判する。手作業のスクリーンショットは検証不要だが、API で抽出すると抽出処理の検証が要る、という構図 [S1-01]
- **Greenlight Guru**: 設計レビューは eQMS 内の「Digital Design Reviews」で行い、Part 11 準拠の電子署名で承認する。Jira/GitHub は設計管理項目の生成元として連携するが、**レビュー記録は eQMS 側**にある [S1-15][S1-16]
- **GitHub 自身への要望**: 2025-10 の Community Discussion #176303 は、Part 11 準拠の PR 承認に欠けるものとして「**承認時のパスワード再入力(署名)**、**承認理由の入力**、**監査証跡**」を挙げる。GitHub からの回答はなく未回答のまま [S1-17]
- **GitLab**: 承認設定「Require user re-authentication to approve」(パスワードまたは SAML)は、公式ドキュメントが「CFR Part 11 に定義されるような電子署名を可能にする」と明記する [S1-18]。一方、GitLab 自身の Issue #367539 は「現在の実装は、規制対象の顧客が連邦機関へ証拠を提出する際の要件を完全には満たさない」とし、不足として **SDLC 上の役割(Design/Dev/QA/独立テスター)の選択、MR ごとの署名者指定、ユーザー名とパスワードの再入力、MR 内の個別署名記録、API/PDF での書き出し**を挙げる [S1-19]。Issue の現在の状態(open/closed)は未確認
- **IntuitionLabs の整理**: 「PR 承認は変更集合に対する電子署名と見なせる。Part 11 準拠には、個人への帰属(固有ログイン)、署名の意味の表示(『Approved by Jane Doe on 2025-08-08』)、記録への不可逆な結び付きが要る」。同記事の「PharmaCo」事例(統計解析スクリプトの 1 行変更にも第二の統計家と QA の 2 名承認を要し、PR 記録を承認記録とした)は匿名の二次情報で、**一次資料は未確認** [S1-20]
- **FDA 査察で PR 承認を Design Review 記録として提示し受理された事例**: 一次資料は見つからず。**未確認**。見つかったのは、Bitbucket 向け署名アドオン(Workzone)のベンダー事例のみ [S1-21]

### 1.4 小括(医療機器)

- PR/MR の承認イベントは、**変更管理(820.30(i)/ISO 13485 7.3.9)とユニット検証(62304 5.5.5)の記録**として使われている
- **設計レビュー(7.3.5)の記録は PR では代替されていない**。独立したレビュアー、審査対象、決定、処置の記録を要するため、eQMS か文書で残す。Momentum の解説は「Slack スレッドのメモでは要件を満たさない」と述べる [S1-08]
- Part 11 の電子署名としては、GitHub の Approve は「再認証・意味・役割」を欠く。GitLab は再認証のみ対応

## 2. 自動車(ISO 26262 ツール認定 / Automotive SPICE)

### 2.1 ツールの信頼性(ISO 26262-8 第11節)

- ツールは Tool Impact(TI1/TI2)と Tool error Detection(TD1〜TD3)で分類し、Tool Confidence Level(TCL1〜3)を決める。TCL1 は認定不要、TCL2/3 は認定(使用実績、開発プロセス評価、検証、安全規格準拠開発のいずれか)が要る [S2-01][S2-02]
- TCL1 の意味は「ツールを信頼する」ではなく「**後続工程でツールの誤りが検出されるから、ツール自体への信頼は要らない**」。BTC Embedded は「TCL1 とは『このツールを信用するな』という意味」と説明する [S2-03]
- GitHub 自身の例: CodeQL Coding Standards を「TI2(クエリの誤りで欠陥が見逃される)、TD2(他の検証で検出される中程度の確信)→ TCL2」と自己分類し、認定を支援する文書を公開している [S2-04]
- **Git/GitLab/GitHub を記録システムとして使うときの TCL 分類の公開例は見つからず(未確認)**。GitLab は「GitLab 自体は車両内で動作しないため ISO 26262 認証の対象にはならない。GitLab の上に実装する開発プロセスが準拠を支援する」と述べるにとどまる [S2-05]。ツール分類の原則から言えば、承認記録の欠落・改竄が後続工程(監査・リリース判定)で検出されるなら TD1、されないなら認定対象になる、というのが筋だが、これは本メモの推論であり規格の明文ではない

### 2.2 Automotive SPICE 4.0

- SUP.10(変更要求管理)の基本プラクティス BP1 は「各変更要求を一意に識別し、**起案者と理由を含めて**記録する」。成果 3)「変更要求は実装前に承認される」、4)「変更要求と影響を受ける作業成果物の間に双方向のトレーサビリティ」[S2-06]
- 評価で「口頭の承認」「メールのみの非公式な承認」が典型的な失敗として挙げられる(二次情報) [S2-07]
- **GitLab/GitHub の MR 承認を SUP.10 の承認証拠として提示した評価事例は見つからず(未確認)**

### 2.3 GitLab の「規制証跡」としての売り方

- GitLab は FinServ 向けに、MR 承認ポリシー・保護ブランチ/環境・ロール・コンプライアンスフレームワーク・監査イベントを「職務分離(SoD)」として束ねて説明する。「MR は起案者以外の独立したレビューを要する」「デプロイ担当はデプロイできるがソースは変更できない」[S2-08][S2-09]
- 監査イベントはストリーミングで外部へ送れる。承認ルールの変更(必要承認数を 1 → 0 にする等)も監査イベントになる [S2-10]
- **Release evidence**: リリース作成時に JSON スナップショット(リリース詳細、マイルストーン、パッケージ、最終パイプラインのレポート成果物の URL)を生成し、「外部監査のような内部プロセスに役立つ」と述べる。不変性の明記はない [S2-11]
- 承認ポリシーの迂回は監査イベントとして記録され、`bypass_reason` を持つ [S2-12]

## 3. 金融(SOX IT 全般統制: 変更管理)

### 3.1 監査法人の視点

- KPMG(2026 年 SOX ウェビナー資料)[S3-01]
  - 「現代の DevOps ツールセットでは、どのツールを ITGC の範囲に入れるかを評価しなければならない。もはや承認チケットだけを見るわけにはいかない」
  - 監査の失敗例: 「レビュープロセスについてマネージャーの説明に頼り、レビューの実際の証拠を検査しなかった」「開発者が自分の変更をテストしていないか確認しなかった」。教訓は「**問い合わせ(inquiry)だけに頼るのは繰り返される監査の失敗。変更承認は直接の証拠で検証せよ**」
  - 保険会社の例: 「Azure DevOps に組み込まれた**自動の SoD ワークフロー統制**ではなく、手作業の SoD プロセスをテストした」のが誤り。「自動化が進むほど、監査人は構成された自動統制をテストしなければならない」
  - 証拠の質: 「証拠がシステム生成(レポート、抽出、ログ)なら、監査人はその正確性・完全性・精度をテストするか、それらの属性に対する統制をテストしなければならない」(PCAOB AS 1105)
- 「監査人は本番変更の母集団を、チケットツールではなくシステムから直接引き、標本を完全な記録へ遡る。文書化されていない変更はこうして見つかる」[S3-02]
- 二次情報(実務者の解説動画)だが、監査の赤旗として「開発者が自分の変更を承認」「『looks good』のような一般的な承認で、明確な権限・時刻・承認者の識別がない」「テストが本番適用後」が列挙される [S3-03]

### 3.2 PR 承認を SOX 証跡にするときの実装要件

- systemshardening の整理 [S3-04]
  - 紙の上だけの統制の例: 「マージ権を持つ開発者が自分の PR を承認できる、または**相互に承認し合う**」「開発者とデプロイ担当が同一」「CI システムのログは削除・編集・失効し得るので、**CI ログは不変の監査証拠ではない**」
  - 対応: CODEOWNERS、**SoD 検査ジョブが『承認者 ≠ 起案者』と承認者数を検証**、Environment の承認者を別チームに、`evidence.json` に `author_is_approver: false` と承認者一覧とパイプライン実行 URL を残す
- Liquibase(DB 変更): 全ての承認・デプロイ・アクセス事象を「時刻・ユーザー識別・環境」付きで記録し、監査人向けに「各リリース・環境ごとの職務分離を示す承認記録」を書き出す [S3-05]

### 3.3 Vanta / Drata の自動収集

- **Vanta の GitHub 連携** [S3-06]
  - 「Application changes reviewed」テスト: ブランチ保護と Rulesets の必要承認数を読み、既定/本番ブランチに 1 以上の承認が必要かを検査する
  - 「GitHub code changes were approved or provided justification for exception」テスト: **マージ済み PR を 1 件ずつ評価し、起案者以外の承認があるか、または承認なしでマージした正当化理由が文書化されているか**を確認する
  - bot が起案した PR(Dependabot, Renovate)も**人間の PR と同じ承認要件**で評価する
  - 収集しないもの: GitHub Actions のログ、コミット履歴
  - つまり Vanta は「承認イベント(属性)」を機械で集め、「例外の理由(判断)」を人に書かせる
- **Drata**: GitHub 連携で SDLC 統制の証拠を自動収集する。Drata bot が作る修正 PR は「ブランチへ入る前にレビューと承認を要する」。テストの細目は**未確認** [S3-07][S3-08]

## 4. 大規模 OSS: 属性は機械、判断は人

### 4.1 Linux kernel のトレーラ

- **Signed-off-by**: 「自分が書いたか、OSS パッチとして渡す権利があることを証明する」= Developer's Certificate of Origin 1.1 への同意。「署名者がパッチの開発に関与したか、**配送経路にいた**ことを示す」[S4-01]
- **Reviewed-by** は「Reviewer's statement of oversight」への宣言である。原文 [S4-01]
  - (a) メインラインへの適切性と準備状況を評価する技術レビューを行った
  - (b) 問題・懸念・疑問は投稿者へ伝え、回答に満足している
  - (c) 改善余地はあっても、現時点で (1) 価値ある変更であり (2) 取り込みに反する既知の問題がないと信じる
  - (d) **健全だと信じるが、特定の状況で目的どおり動作する保証はしない**(明示の免責)
- 「Reviewed-by タグは、主題を理解し徹底したレビューを行うことで知られるレビュアーから供給されたとき、取り込まれる可能性を通常高める」= タグの重みは**誰が付けたか**に依存し、機械的には等価ではない [S4-01][S4-02]
- **Acked-by**: 「影響を受けるコードの責任者」が使う。「パッチ全体の承認を必ずしも意味しない」。複数サブシステムに跨る場合は自分の範囲だけの承認 [S4-01]
- **Tested-by**: 「ある環境で」テストした事実のみ。レビューの主張ではない [S4-01]
- **タグ付けには本人の明示の許可が要る**(Cc, Reported-by, Suggested-by を除く)[S4-01]
- **Assisted-by**(AI 時代の追加): 「高度なコーディングツールを使ったら Assisted-by タグで明示しなければならない。怠ると受け入れが妨げられ得る」。別文書は「**AI エージェントは Signed-off-by を付けてはならない。DCO を法的に証明できるのは人間だけ**」とし、人間の投稿者の責務として「AI 生成コードを全てレビュー」「自分の Signed-off-by を付けて DCO を証明」「**貢献の全責任を負う**」を列挙する [S4-01][S4-03]
- 統計(LWN): 7.1 で Reviewed-by は約 51%、Tested-by は約 8% で「最近のリリースと比べて相対的に低い」。7.2 で Reviewed-by は 48% と「緩やかな下降傾向」だが「実際にレビュー量が減ったかは不明」。Assisted-by は 7.1 で 301、7.2 で 1,111(7% 未満)だが「実際の数はもっと多いはず。多くの開発者がタグを付けず、メンテナは尋ねず、少なくとも 1 人のメンテナはタグを剥がしている」[S4-04][S4-05]
- Corbet の MAINTAINERS 分析は、Signed-off-by が必須のメンテナは別途 Reviewed-by を付けないため、**git のトレーラはレビューを過少記録する**と指摘する [S4-06]

### 4.2 Gerrit のラベル

- Code-Review ラベルの値(公式) [S4-07]
  - +2「Looks good to me, approved」: 「+1 と基本的に同じだが、**プロジェクトの方向に最終決定権を持つ者**のためのもの」。1 つの +2 で submit 可能
  - +1「Looks good to me, but someone else must approve」: 「コードは正しく見えるが、このレビュアーは +2 の権限を持たない」
  - 0: 「レビューを試みなかった、または一瞥したが情報に基づく意見を持たない」
  - -2「This shall not be submitted」: 全パッチセットに有効で、レビュアーが能動的に変えない限り submit を阻む
  - **+1 を 2 つ集めても +2 にはならない**(数値は累積しない)[S4-08]
  - ラベルは Android Open Source Project が「**私はコードを読み、おおむね正しいように見える**」の意味で発明した
- Verified ラベルは CI が付ける(+1 Verified / -1 Fails)。「コンパイルしテストが通った」という**機械の事実**を、人の Code-Review と別ラベルに分離する [S4-07]
- 承認権限(+2)はプロジェクト設定で制限でき、「メンテナのみ」が一般的 [S4-09]

### 4.3 Kubernetes: OWNERS と `/lgtm` / `/approve`

- OWNERS ファイルは `reviewers`(`/lgtm` の候補)と `approvers`(`/approve` できる者)を分ける。Prow が「コメントした人が当該ファイルの OWNERS にいるか」を検査し、該当しなければラベルを付けない [S4-10][S4-11]
- 役割の意味(公式コントリビューターガイド) [S4-10]
  - レビュアー: 「より徹底したコードレビューを担当し、実装の詳細とスタイルを議論する」。`/lgtm` は「**PR が変わるたびに更新しなければならない**」
  - 承認者: 「**全体的な受け入れ基準**(他機能との依存、前方/後方互換性、API とフラグの定義など)を見る」
  - 「承認者の `/lgtm` は同時に `/approve` と解釈される」が、「同じコマンドが誰が打つかで二通りに解釈されるのは意外であり得る」「**少なくとも二組の目で見るという考えに反する**」と注意される
  - 「OWNERS に載っていれば、**PR を開いた本人も承認者として振る舞える**」(起案者と承認者の分離は保証しない)
- kubernetes/website では「`/lgtm` = 技術的承認、`/approve` = 執筆面の承認」という慣習を作ったが、「この慣習は合意した内輪にしか知られていない秘密」と Issue #6589 で問題提起された [S4-12]
- `lgtm` と `approved` の両ラベルが揃うと、bot(Tide)がマージする。マージの実行も機械 [S4-11]
- 外部分析(UptrustHQ)は「`/approve` は OWNERS で門限された承認、`/lgtm` は組織メンバーなら誰でも出せるレビュー信号で、**別の権限**」とし、「Prow の `/approve` は明示的で機械が要求する行為なので、kernel のトレーラのような過少記録の交絡を持たない」と述べる [S4-13]

### 4.4 Chromium: 必須レビューと Rubber Stamper

- 2021-03-24 から、committer はコードレビューと OWNERS 承認を迂回できなくなった。「以前は自己レビューで迂回でき、強制は presubmit で行われていた。**今は Gerrit が両方の迂回を拒否する**」[S4-14]
- 「どの committer もレビューできるが、触る各ディレクトリの owner が 1 人はレビューしなければならない」。非 committer の投稿は committer 2 名の +1 が要る [S4-15]
- 「全てのレビューコメントは解決済みにしなければ commit できない。解決できない場合は、コミットメッセージの `Unresolved-Comment-Reason:` 節で理由を書く」[S4-16]
- **Rubber Stamper bot**: 「翻訳ファイル、クリーンな revert、クリーンな cherry-pick のような**検証可能に安全な変更**」に `Bot-Commit +1` を付け、人のレビューなしで submit を許す。「Rubber Stamper は**設計上 OWNERS 承認を決して与えない**。両方を与えると、revert や cherry-pick を作れる誰でも他者の関与なしに着地できてしまう(例: セキュリティパッチの黙った revert)という悪用経路になる」[S4-14][S4-16]
- `Owners-Override`(大規模リファクタリング用)でも「**第二の人間**(+1 権限を持つ committer)の投票が要る」。「Owners-Override を設定するとき、**パッチの全ファイル(全行)が適切にレビューされたことを確認するのはあなたの責任**」[S4-14][S4-16]
- OWNERS は「その領域のセキュリティ問題の割り当て先にもなる。できないなら OWNERS から外れよ」= 承認権限と責任を結び付ける [S4-14]

### 4.5 Google 社内(Critique)

- レビューは創業初期から必須。「ownership と readability」の二概念。「全ての変更は、使用言語の readability 認定を持つ者が**書くかレビューするか**しなければならない」。「通常、ownership と readability の要件を満たすには**レビュアー 1 名で足りる**」[S4-17]
- 変更の中央値は 24 行、90% が 10 ファイル未満。初回フィードバックの中央値は小さな変更で 1 時間未満、全体のレビュー完了の中央値は 4 時間未満。「変更の 25% 未満しか複数のレビュアーを持たず、中央値は 1 名」(他社・OSS の収束値 2 名と対照) [S4-17]
- 「変更サイズとレビュー品質の相関は Google も認めており、開発者は小さな増分の変更を強く推奨される(大規模削除と自動リファクタリングを除く)」[S4-17]
- レビュアーの基準(公式 eng-practices): 「**CL が全体のコードの健全性を確実に改善する状態になったら、完璧でなくても承認を優先する**」「レビュアーは、レビューするコードに対して ownership と責任を持つ」[S4-18]
- GitHub の CODEOWNERS は Chromium の OWNERS に着想を得た(GitHub の 2017 年発表の脚注) [S4-19]

## 5. 「中身を見ずに承認する」の実証研究

### 5.1 期待と実態の乖離

- Bacchelli & Bird(Microsoft, ICSE 2013)[S5-01]
  - 動機の 1 位は欠陥発見(44% が第一動機)。しかし実際のコメントのうち欠陥に関するものは **14%(9 分類中 4 位)**。欠陥コメントの多くは低水準の論理的問題
  - 「文脈と変更の理解があらゆるレビューの鍵」であり、「理解のニーズの多くは現在のツールでは満たされていない」
- Czerwonka ら(Microsoft, ICSE 2015)「Code Reviews Do Not Find Bugs」: 「レビュアーのコメントのうち欠陥の可能性を示すのは約 15%、ブロックすべき欠陥はさらに少ない」。コメントの有用性は**レビュアーの当該コード経験**と相関し、初見では 33%、3 回目で約 67% [S5-02]
- Bosu ら(MSR 2015): 150 万コメントの分析。「変更に含まれる**ファイル数が多いほど**、起案者にとって価値あるコメントの割合は下がる」[S5-03]

### 5.2 レビューの規模・速度・参加と欠陥

- SmartBear/Cisco 研究(2,500 レビュー、320 万行)[S5-04]
  - 「レビュー対象は 200 行未満、400 行を超えない。それ以上はレビュアーを圧倒し欠陥は見つからない」
  - 「300 LOC/時未満が最良。500 未満ならまだ良い。**それより速いと相当割合の欠陥を見逃す**」。450 LOC/時より速いと 87% のケースで欠陥密度が平均以下
  - 総レビュー時間は 60 分未満、90 分を超えない
  - 「**起案者が注記と説明でレビューを準備すると、欠陥がはるかに少ない**」。起案者の事前注記があるレビューでは欠陥密度が 30 を超えず、最頻値は欠陥ゼロ
- McIntosh ら(MSR 2014 / EMSE 2016, Qt・VTK・ITK)[S5-05]
  - 「**議論のない変更**の割合が高いコンポーネントは欠陥を持ちやすい」
  - 「200 LOC/時より速く承認された変更(hastily reviewed)」を指標にする(Kemerer & Paulk 2009 を根拠に)
  - 「議論に関するレビュー参加指標は、全リリースの欠陥モデルに有意な説明力を加える」。レビューのカバレッジだけでは不十分
- LinearB の 610 万 PR 分析(2025、ベンダー): エリートチームの PR は平均 219 行未満(二次情報、方法論未確認) [S5-06]

### 5.3 LGTM スメルの定量

- Doğan & Tüzün(IST 2022)「Towards a taxonomy of code review smells」[S5-07]
  - 7 つのスメル: レビューなし、Review Buddies(いつも同じ相手)、ping-pong、**LGTM reviews**(「レビュアーが緩いレビューを行い、変更をそのまま承認する」)、放置レビュー、文脈欠如、大きな変更集合
  - 8 つの OSS プロジェクトの 283,354 レビューで、**72.2% が少なくとも 1 つのスメルを持つ**(Gerrit 71.1%、GitHub 81.4%)。最良は Qt の 53.1% で、著者は「包括的なレビューガイドライン」を理由の候補に挙げる
  - 開発者調査(32 名)で LGTM reviews の深刻度は 4.31/5。ただし **LGTM reviews だけは検出方法を提案できず**、実験から除外された(「正確に検出できるかに深刻な懸念」)
- Gön ら(ICSME 2024)「Towards Unmasking LGTM Smells」[S5-08]
  - 5 つの大規模プロジェクトで **64.7% の PR がコメントなしレビュー**
  - 手動分析で、コメントなしレビューは LGTM スメルを **3.5 倍**多く示す
  - コメントなしレビューの PR は「**承認後のコミット(late commit)**」が有意に多い(承認が最終版を見ていない)。Issue の再オープン率には有意差なし
- Microsoft 開発者ブログ(Doğan が引用): 「LGTM は最も安易で時間のかからない応答だが、コードベースに有害。『あなたのレビューでブロックされている』という圧力で署名させたなら…」[S5-07]
- 二次情報(Pyor): 「レビュアーがその変更を第三者に説明できるかが rubber stamp の見分け方」「数週間にわたり承認ばかりで修正ゼロ、が劇場化の典型的な徴候」[S5-09]

### 5.4 対策の実証

- **チェックリスト**: Rong ら(2012)は未経験レビュアーに対するチェックリストの効果を実験で検証(詳細未確認)。「チェックリスト駆動で欠陥検出が 66.7% 増」という数字はベンダー記事に見られるが**一次出典を確認できず**(未確認) [S5-10][S5-11]
- **テスト駆動レビュー(TDR)**: 93 名の統制実験で、テストを先に読む群は本番コードの欠陥発見率は同じ、テストコードの欠陥はより多く見つけ、本番コードの保守性問題は少なく見つけた [S5-12]
- **レビュー不安への介入**: 単回の認知行動ワークショップが不安を下げる(無作為化待機リスト対照)。論文は不安の結果として「レビュアーが変更を rubber stamp する」回避行動を挙げる [S5-13]
- Google の研究(Finding 5): 「長年の改良にもかかわらず、Google のコードレビューはなお破綻に直面する」。理解の困難が主要な障害 [S4-17]

## 6. AI エージェント時代(2025〜2026)のレビュー記録

### 6.1 GitHub Copilot coding agent

- Copilot が起案した PR では、「**Copilot をその Issue に割り当てた本人の承認は必要承認数に数えない**。別のレビュアーが承認しなければマージできない」[S6-01]
- 「Require approval of the most recent reviewable push」を有効にすると、最後に Copilot が push した版には n+1 の承認が要り、Copilot に指示した人は数えられない。Community では「通常 1 承認の PR が 2 承認(+ 指示者で 3 名)になる」と不満が出ている [S6-02]
- Actions ワークフローは「Copilot が push しても自動では走らず、書き込み権限を持つ人が『Approve and run workflows』を押すまで待つ」。2026-03 にリポジトリ設定でこの承認を省略できるようになった(既定は要承認) [S6-03][S6-04]
- Rulesets「**Require an additional approval for unattributed Copilot pull requests**」(公開プレビュー、既定で有効): 「Copilot が人に帰属しない PR を開くと、設定した承認数より 1 つ多く要求する」。根拠として「**1 承認は通常『書いた人』と『承認した人』の 2 名の関与を意味する。Copilot が自身のアプリ識別で PR を開くと、その前提が崩れる**」と説明する。「必要承認数が 0 のルールには効果がない。**PR を承認のゲートではなく変更の記録として使う**リポジトリには影響しない」[S6-05]
- **Copilot code review の承認**(2026-09): 既定では承認しない。管理者が有効化すると、Copilot の承認が必要承認数に数えられ、新しいコミットで無効化される。承認を許すファイルパスを限定できる。「承認評価(assessment)だけではマージ要件に数えない」[S6-06]。解説記事は「Copilot 承認と CODEOWNERS 要件の相互作用は文書化されておらず、Copilot は code owner ではないと仮定するのが安全」と注意する [S6-07]
- Community Discussion #197170(2026): 「規制要件で**人間 2 名の関与**が要る。2 名チームは『1 名承認 + 起案者の暗黙承認』で満たしてきたが、AI が起案すると人間は 1 名になる」として、「起案者の明示的自己承認」トグルを要望している。AI 時代に**承認の意味(誰が人間として責任を負うか)を明示する必要**が、現場で露わになった例 [S6-08]
- projen の auto-approve: 「ラベルはセキュリティ統制ではない。ラベルを付けられる誰でも付けられる」「借用された識別のシナリオ」を文書化し、bot 承認の限界を明示する [S6-09]

### 6.2 Anthropic / OpenAI / Google

- **Anthropic**
  - Claude Code の Code Review は「**PR を決して承認もブロックもしない。マージの決定はチームに残る**」[S6-10]
  - 「テレメトリでは、ユーザーは**権限プロンプトの約 93% を承認**していた。承認を見るほど一つ一つへの注意は減る(承認疲れ)」。対策として OS レベルのサンドボックス(権限プロンプト 84% 減)と auto mode を導入。「どんな確率的防御も見逃し率はゼロではない」[S6-11][S6-12]
  - 示唆: **承認の回数を増やすことは監督を強めない**。境界を機械で引き、人の承認を高リスク行為に絞る方向
- **OpenAI**(Harness engineering, 社内実践): 「**人間は PR をレビューしてもよいが、必須ではない**。レビューの労力のほぼ全てをエージェント間へ移した」「エージェントはしばしば自分の PR を squash and merge する」「最小限のブロッキングマージゲート」。「低スループット環境では無責任だが、ここでは正しいトレードオフであることが多い」[S6-13]。Codex code review は GitHub 上で「P0/P1 のみ指摘する」[S6-14]
  - 業界が一枚岩ではないことの証左。規制対象には適用できない立場
- **Google**: エージェント運用ガイドで「人の承認の記録」を推奨する一次資料は見つからず(未確認)。見つかったのは二次情報のみ
- **Linux kernel**: 4.1 のとおり、AI は Signed-off-by を付けられず、人間が全責任を負う [S4-03]
- **実務者の ADR 例**(Kalamuna, 2026-07): 「全 PR に AI レビューを先に走らせる。AI レビューは助言であり、人のレビュー要件を満たさず、短縮も置換もしない」「アーキテクトまたはテックリードが権威あるレビューを行い、承認とマージ権限を持つ」「AI 関与は git トレーラ(`AI-assisted: true`, `AI-tools: claude-code`)と PR 本文の開示欄で開示する」[S6-15]
- Cortex のリスクベースレビュー: 「bot は変更要求はできるが、**決して承認しない**」[S6-16]
- Innolitics: 「レビューを任意の磨き上げから定義された受け入れステップへ」[S1-03]

## 7. ADR/設計判断を PR 承認で代替する実践と批判

### 7.1 実践

- 一般的なワークフロー: ADR を `Status: Proposed` で PR として開き、レビュアーがインラインで議論し、合意したら同じ PR で `Accepted` に変えてマージ。却下は PR をクローズ。大きな決定は PR の前に同期レビュー会議を置く [S7-01]
- picodata: 「**ADR は関係するステークホルダーが MR を承認したときに accepted になる**」[S7-02]
- AWS Prescriptive Guidance の ADR プロセス: PR マージを採用の記録にしていない。**レビュー会議**(10〜15 分の読む時間 → オーナーがコメントを読み上げて議論)で採否を決め、「承認されたら、オーナーがタイムスタンプ・バージョン・ステークホルダー一覧を追加して Accepted にする」。却下時は「同じ議論の再発を防ぐため理由を書く」。採用後は不変で、変更は新 ADR で supersede [S7-03]

### 7.2 批判・失敗例

- IBM Watson Discovery の経験報告(Agile Alliance)[S7-04]
  - 「多くの ADR がレビューと修正のサイクルで詰まった」
  - 「誰とも話さずにアイデアを ADR として記録し始める人がいた」→ 「ホワイトボードで先に探索し、**決定が実際になされてから記録する**」規則を追加
  - 「初期の ADR の多くはアーキテクチャの決定でも設計の決定でもなかった」「分析が薄く、帰結が 1 つだけ」
  - 「チームの約半分しか ADR を日常の実践として記録しなかった」「ADR には書いてあったが忘れていた」
  - 最も問題の多いサービスは ADR が 2 つしかなく、同年代の健全なサービスは十数個あった
- Zimmermann「ADR の 10 の典型的誤り」(2026-09): 文脈が不足、評価基準が明示されない、テンプレートの不統一、「**AI が書いた出力を品質確認せずに使う**」[S7-05]
- Catio(2026): 「オーナーのない決定は静かに書き換えられる」「RFC(可変)・ADR(採用後不変)・設計書(更新し続ける)を混同すると『200 個の ADR があって誰も読まない』になる」[S7-06]
- 本メモの整理(推論): PR 承認で ADR を採用する方式の弱点は、(1) 「文章として問題ない」と「責任者として採用する」が同じ Approve ボタンに畳まれること、(2) 承認者が OWNERS/CODEOWNERS で機械的に決まり、決定の責任者と一致する保証がないこと、(3) 決定前の探索と決定後の記録が区別されないこと。AWS が会議と明示的なステークホルダー一覧を要するのは (1)(2) への対処、IBM の「決めてから書く」規則は (3) への対処と読める

## 8. 結論

### 8.1 業界が「記録」として受け入れている最小の形

- ツールが自動生成する承認イベント: 承認者の識別(固有アカウント)、対象(コミット SHA または変更集合)、時刻、適用された規則(必要承認数・CODEOWNERS)。GitHub Rulesets、GitLab 承認ルール、Gerrit ラベル、Prow ラベルがこれに当たる
- 承認者 ≠ 起案者の機械的保証。GitHub は自己承認を禁止し、Copilot 起案 PR では指示者も除外。GitLab は「作成者の承認を禁止」「コミットを足した者の承認を禁止」。SOX 実装では SoD 検査ジョブが `author_is_approver: false` を証拠に残す
- 承認が最終版に紐づく保証。GitHub「stale approval の却下」「最新 push の承認」、Prow「`/lgtm` は PR が変わるたびに更新」、Gerrit「+2 は最新パッチセットに必要」。Gön らの「承認後コミット」の多さは、この保証がないときの実害
- 監査では、イベントの**母集団の完全性**を別途示す(システムから直接引く、IPE の正確性・完全性をテストする)。承認ルール自体の変更も監査イベントとして残す(GitLab)
- Vanta の方式が示す分担: **承認イベントは機械が集め、例外の正当化理由は人が書く**

### 8.2 手入力帳票が残っている領域とその理由

- **設計レビュー記録**(820.30(e)、ISO 13485 7.3.5): 独立したレビュアー、審査対象、決定、処置、参加者と役割。PR にはこれらの構造化された置き場がない。eQMS(Greenlight Guru)か文書で残す
- **Part 11 電子署名**: 再認証、署名の意味、署名者の役割、印字名と時刻を記録本体に残す。GitHub は未対応(Community 要望は未回答)、GitLab は再認証のみ対応で、GitLab 自身が不足を Issue 化している
- **リリース判定**: 承認者・時刻・既知の異常・ベースラインを一体で残す。GitLab の release evidence は材料(マイルストーン・パイプライン成果物)を束ねるが、判定者の署名は含まない。ASPICE SUP.10 は「起案者と理由」を変更要求の記録に求める
- 理由の整理: 規制は「イベントが起きた」ではなく「**誰が、どの立場で、何を審査し、何を決めたか**」を求める。ツールの Approve は前者しか持たない。また、記録はツールの寿命を超えて提出可能でなければならず(エクスポート、PDF)、ツール自体の検証(Part 11 11.10(a))も要る
- AI 時代に新たに手で明示が要るもの: AI 関与の開示(kernel の Assisted-by、Kalamuna のトレーラ)、人間として責任を負う者の明示(GitHub #197170 の要望)

### 8.3 属性を機械、判断を人、と分けている実例

- Linux kernel: git がトレーラを運び、`b4` 等が収集するが、Reviewed-by の内容は人の宣言(a)〜(d)であり、AI は Signed-off-by を付けられない。タグの重みは「誰が付けたか」に依存し、機械的に等価ではない
- Gerrit: Verified(+1)は CI の事実、Code-Review(+2)は最終決定権者の判断。+1 を何個集めても +2 にならない。「一瞥したが意見を持たない」ための 0 がある
- Kubernetes: OWNERS ファイルで「誰が `/approve` できるか」を Prow が機械検査し、マージも Tide が機械実行。`/lgtm`(実装の徹底レビュー)と `/approve`(全体的な受け入れ)は人の宣言で意味が異なる。ただし起案者が承認者を兼ねられる抜けがある
- Chromium: Gerrit が OWNERS 承認とレビューの迂回を拒否。Rubber Stamper は「検証可能に安全な変更」だけに機械承認を与え、OWNERS 承認は設計上与えない。Owners-Override を使う人に「全行が適切にレビューされたことを確認する責任」を明文で負わせる
- GitHub: Rulesets が承認数・CODEOWNERS・最新 push・会話解決を機械検査。Copilot の承認は既定で数えず、有効化しても経路を限定。「PR を承認のゲートとして使う」か「変更の記録として使う」かを GitHub 自身が区別している
- SOX/Vanta: 承認イベントの収集と検査は機械、例外理由は人

### 8.4 形骸化を抑える実証のある手段

- **変更を小さくする**: 200〜400 行以内(Cisco)、Google の中央値 24 行、ファイル数が増えると有用コメント率が下がる(Bosu)。AI 生成 PR の 1,000 行は構造的に人のレビュー能力を超える
- **読む速度と時間の上限**: 500 LOC/時未満(Cisco)、200 LOC/時超を「性急」とみなす指標(Kemerer & Paulk、McIntosh)、1 回 60〜90 分以内
- **起案者の事前注記**: 注記のあるレビューは欠陥密度が低く安定(Cisco)。PR 本文の説明責任を起案者に置く根拠
- **レビュアーの当該コード経験**: 初見 33% → 3 回目 67%(Czerwonka)。OWNERS/CODEOWNERS で経験者を割り当てる根拠。ただし Review Buddies(いつも同じ相手)のスメルとトレードオフ
- **議論を伴う承認**: 議論のない変更は欠陥を持ちやすい(McIntosh)。コメントなしレビューは LGTM スメル 3.5 倍、承認後コミットが多い(Gön)。承認に「何を見たか」の宣言を添える方式(kernel の statement、rdm の定型コメント、Chromium の未解決コメント理由)は、この実証と整合する。ただし「LGTM スメルの自動検出」は研究上も未解決
- **承認の意味の段階化**: Gerrit +1/+2、Prow lgtm/approve。「見たが責任は取らない」と「責任を取る」を区別する語彙があると、rubber stamp は「見たが責任は取らない」側へ流れ、記録として読める
- **承認の失効**: 変更後に承認を自動で外す(GitHub、GitLab、Prow、Gerrit)。承認後コミットの実害(Gön)への直接の対策
- **承認回数を増やさない**: 93% 承認(Anthropic)は、承認が多いほど一つ一つが軽くなることを示す。高リスク行為に絞り、他は境界で機械的に防ぐ
- **bot の承認を限定する**: 「bot は承認しない」(Cortex、Claude Code)、または「検証可能に安全な変更だけ」(Rubber Stamper)。bot に OWNERS 承認を与えない理由は「他者の関与なしに着地できる悪用経路」
- **チェックリストと TDR**: 効果は条件付き(未経験者、テストコードの欠陥)。万能ではない

### 8.5 未確認事項(断定を避けたもの)

- FDA 査察または Notified Body 監査で、GitHub の PR 承認を設計レビュー記録として提示し受理された一次事例
- Medtronic の GitHub 上の設計レビュー実践
- Tidepool の設計開発・リリース SOP の本文(PR 承認の位置づけ)
- Ketryx が PR の Approve 自体を Part 11 署名として扱うか
- Drata の GitHub テストの細目
- Git/GitLab/GitHub を記録システムとして ISO 26262 のツール分類にかけた公開例
- GitLab Issue #367539(Part 11 e-signature)の現在の状態
- 「チェックリストで欠陥検出 66.7% 増」の一次出典
- Google のエージェント運用ガイドにおける「人の承認の記録」の推奨

## 出典一覧

### 1. 医療機器

- [S1-01] Ketryx, "21 CFR Part 11 Compliance Guide for Jira (Atlassian)" — https://www.ketryx.com/blog/21-cfr-part-11-compliance-guide-for-jira-atlassian
- [S1-02] Innolitics, rdm README — https://github.com/innolitics/rdm
- [S1-03] Innolitics, "How to Get Your AI-Generated, Vibe-Coded Medical Device FDA-Cleared"(2026-04-27) — https://innolitics.com/articles/ai-generated-code-fda-clearance
- [S1-04] OpenRegulatory, "Software Verification For Medical Device Software (IEC 62304)" — https://openregulatory.com/articles/software-verification-medical-software-iec-62304
- [S1-05] OpenRegulatory, "Can We Integrate Our eQMS With Jira, GitHub, Sharepoint, etc.?" — https://openregulatory.com/questions/can-we-integrate-our-eqms-with-jira-github-sharepoint-etc
- [S1-06] OpenRegulatory, "IEC 62304:2006 Mapping of Requirements to Documents" — https://openregulatory.com/document_templates/iec-623042006-mapping-of-requirements-to-documents
- [S1-07] Greenlight Guru, "Best Practices for Effective Medical Device Design Reviews" — https://www.greenlight.guru/blog/design-reviews-best-practices-for-medical-device
- [S1-08] Momentum, "Design Controls for Medical Device Software" — https://www.themomentum.ai/blog/design-controls-medical-device-software
- [S1-09] OpenRegulatory, "Google Drive as a QMS: 2026 Review & Setup Risks" — https://openregulatory.com/qms_software/google-drive
- [S1-10] Tidepool, "Tidepool's Open Source QMS Gets ISO 13485 Certified" — https://www.tidepool.org/blog/tidepools-open-source-qms-gets-iso-13485-certified
- [S1-11] Tidepool, "Open and transparent"(SOP 等の公開リンク) — https://www.tidepool.org/open
- [S1-12] Drug Delivery Business, "Tidepool achieves new certification for open-source quality management system" — https://www.drugdeliverybusiness.com/tidepool-certification-open-source-quality-management
- [S1-13] Ketryx, "Ketryx 2.6"(PR と Jira 項目の紐づけでリリースをゲート) — https://www.ketryx.com/blog/ketryx-2-6
- [S1-14] Ketryx, "Document Generation with Ketryx" — https://www.ketryx.com/videos/document-generation-video
- [S1-15] Greenlight Guru, "Why Flexible Design Reviews Matter" — https://www.greenlight.guru/blog/why-flexible-design-reviews-matter-for-medical-device-product-development
- [S1-16] Greenlight Guru, "IEC 62304 and the software DDF" — https://www.greenlight.guru/blog/iec-62304-software-dhf
- [S1-17] GitHub Community Discussion #176303, "Approval of Pull Request in a FDA 21 CFR Part 11 compliant way"(2025-10) — https://github.com/orgs/community/discussions/176303
- [S1-18] GitLab Docs, "Merge request approval settings"(Require user re-authentication to approve) — https://docs.gitlab.com/user/project/merge_requests/approvals/settings/
- [S1-19] GitLab Issue #367539, "Regulated e-signature approvals for Merge Requests (CFR part 11)" — https://gitlab.com/gitlab-org/gitlab/-/issues/367539
- [S1-20] IntuitionLabs, "Git Version Control for FDA and IEC 62304 Compliance" — https://intuitionlabs.ai/articles/git-workflows-fda-compliance
- [S1-21] Izymes, "How digital signature approvals create a SOC/FDA/ISO compliant pull request review process"(ベンダー事例) — https://izymes.com/2023/01/17/how-digital-signature-approvals-create-a-soc-fda-iso-compliant-pull-request-review-process

### 2. 自動車

- [S2-01] Embitel, "Software Tool Qualification in ISO 26262 Development" — https://www.embitel.com/blog/embedded-blog/why-is-software-tool-qualification-indispensable-in-iso-26262-based-software-development
- [S2-02] MathWorks, "Qualifying Software Tools According to ISO 26262" — https://www.mathworks.com/content/dam/mathworks/tag-team/Objects/m/61793_CMR10-16.pdf
- [S2-03] BTC Embedded, "ISO 26262 tool qualification - When and how to perform it" — https://www.btc-embedded.com/when-and-how-to-qualify-tools-according-to-iso-26262
- [S2-04] GitHub, codeql-coding-standards "ISO 26262 tool qualification" — https://github.com/github/codeql-coding-standards/blob/main/docs/iso_26262_tool_qualification.md
- [S2-05] GitLab, "Using GitLab for ISO 26262-6:2018" — https://about.gitlab.com/solutions/iso-26262
- [S2-06] VDA QMC, Automotive SPICE PAM v4.0(SUP.10) — https://vda-qmc.de/wp-content/uploads/2023/12/Automotive-SPICE-PAM-v40.pdf
- [S2-07] The Art of Service, "Automotive SPICE (ASPICE) v4.0 - Process Assessment Model"(二次情報) — https://theartofservice.com/evidence/automotive-spice-aspice-v4-0-process-assessment-model
- [S2-08] GitLab Blog, "FinServ: How to implement GitLab's separation of duties features" — https://about.gitlab.com/blog/finserv-how-to-implement-gitlabs-separation-of-duties-features
- [S2-09] GitLab Docs, "GitLab Tutorial Guide on Separation of Duties" — https://docs.gitlab.com/solutions/components/guide_on_sod
- [S2-10] GitLab Docs, "Audit event development guidelines" — https://docs.gitlab.com/development/audit_event_guide
- [S2-11] GitLab Docs, "Release evidence" — https://docs.gitlab.com/user/project/releases/release_evidence/
- [S2-12] GitLab Docs, "Merge request approval policies" — https://docs.gitlab.com/user/application_security/policies/merge_request_approval_policies

### 3. 金融(SOX)

- [S3-01] KPMG, "IT Scoping for SOX Compliance"(2026 ウェビナー資料) — https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2026/future-sox-webcast-slides.pdf
- [S3-02] BD Emerson, "IT General Controls (ITGC) Explained" — https://www.bdemerson.com/article/itgc
- [S3-03] "Change Management in ITGC Explained"(実務者の解説動画、二次情報) — https://www.youtube.com/watch?v=MN5_ttbauBA
- [S3-04] Systems Hardening, "SOX-Compliant Deployment Pipelines: Segregation of Duties and Immutable Change Evidence" — https://www.systemshardening.com/articles/cicd/sox-compliant-deployment-pipeline
- [S3-05] Liquibase, "SOX Compliance for Database Change Management" — https://www.liquibase.com/resources/guides/sox-compliance-for-database-change-management-best-practices
- [S3-06] Vanta Help Center, "GitHub: Integration Guide" — https://help.vanta.com/en/articles/14845240-github-integration-guide
- [S3-07] Drata Docs, "Connecting GitHub Code to Drata" — https://docs.drata.com/drata-compliance-as-code/connecting-github-code-to-drata
- [S3-08] Drata Help, "GitHub Integration Guide" — https://help.drata.com/en/articles/4663377-github-integration-guide

### 4. OSS

- [S4-01] Linux kernel, "Submitting patches"(DCO、Reviewer's statement of oversight、Acked-by、Assisted-by、タグ付けの許可) — https://docs.kernel.org/process/submitting-patches.html
- [S4-02] 同 v4.17 版(Reviewed-by の重みの記述) — https://www.kernel.org/doc/html/v4.17/process/submitting-patches.html
- [S4-03] Linux kernel, "AI Coding Assistants"(Assisted-by、AI は Signed-off-by 不可) — https://docs.kernel.org/process/coding-assistants.html
- [S4-04] LWN, "Development statistics for the 7.1 kernel"(2026-06-15) — https://lwn.net/Articles/1077425
- [S4-05] LWN Weekly Edition 2026-08-20(7.2 統計、Assisted-by 1,111) — https://lwn.net/Articles/1088565
- [S4-06] LWN, "MAINTAINERS truth and fiction"(2021-01-14) — https://lwn.net/Articles/842415
- [S4-07] Gerrit, "Review Labels"(Code-Review / Verified の定義) — https://gerrit-review.googlesource.com/Documentation/config-labels.html
- [S4-08] Gerrit, "Working with Gerrit: An example"(+1 は累積しない) — https://gerrit-review.googlesource.com/Documentation/intro-gerrit-walkthrough.html
- [S4-09] Gerrit, "Basic Gerrit Walkthrough — For GitHub Users" — https://vlab.noaa.gov/code-review/Documentation/intro-gerrit-walkthrough-github.html
- [S4-10] Kubernetes Contributors, "OWNERS Files" — https://www.kubernetes.dev/docs/guide/owners
- [S4-11] Prow, "Reviewers and Approvers"(approve plugin) — https://docs.prow.k8s.io/docs/components/plugins/approve/approvers
- [S4-12] kubernetes/test-infra Issue #6589, "Allow /lgtm to not also mean /approve" — https://github.com/kubernetes/test-infra/issues/6589
- [S4-13] UptrustHQ, "Who Can Approve Kubernetes"(外部分析) — https://uptrusthq.com/writings/org-chart-vs-merge-log
- [S4-14] Chromium, "Mandatory Code-Review and Native OWNERS"(Rubber Stamper の設計理由) — https://chromium.googlesource.com/chromium/src/+/main/docs/code_review_owners.md
- [S4-15] Chromium, "Code Reviews"(policy) — https://chromium.googlesource.com/chromium/src/+/main/docs/code_reviews.md
- [S4-16] Chromium, "Contributing to Chromium"(Unresolved-Comment-Reason) — https://chromium.googlesource.com/chromium/src/+/main/docs/contributing.md
- [S4-17] Sadowski, Söderberg, Church, Sipko, Bacchelli, "Modern Code Review: A Case Study at Google"(ICSE-SEIP 2018) — https://sback.it/publications/icse2018seip.pdf
- [S4-18] Google eng-practices, "The Standard of Code Review" — https://google.github.io/eng-practices/review/reviewer/standard.html
- [S4-19] Graphite, "How Google does code review"(CODEOWNERS の由来) — https://graphite.com/blog/how-google-does-code-review

### 5. 実証研究

- [S5-01] Bacchelli, Bird, "Expectations, Outcomes, and Challenges of Modern Code Review"(ICSE 2013) — https://sback.it/publications/icse2013.pdf
- [S5-02] Czerwonka, Greiler, Tilford, "Code Reviews Do Not Find Bugs"(ICSE 2015) — https://www.researchgate.net/publication/308810818_Code_Reviews_Do_Not_Find_Bugs_How_the_Current_Code_Review_Best_Practice_Slows_Us_Down (要約: https://entropicthoughts.com/code-reviews-do-find-bugs)
- [S5-03] Bosu, Greiler, Bird, "Characteristics of Useful Code Reviews: An Empirical Study at Microsoft"(MSR 2015) — https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/bosu2015useful.pdf
- [S5-04] SmartBear, "Code Review at Cisco Systems" — https://static0.smartbear.co/support/media/resources/cc/book/code-review-cisco-case-study.pdf (要約: https://smartbear.com/learn/code-review/best-practices-for-peer-code-review)
- [S5-05] McIntosh, Kamei, Adams, Hassan, "The Impact of Code Review Coverage and Code Review Participation on Software Quality"(MSR 2014) — https://posl.ait.kyushu-u.ac.jp/~kamei/publications/McIntosh_MSR2014.pdf / EMSE 2016 拡張版 — https://rebels.cs.uwaterloo.ca/papers/emse2016_mcintosh.pdf
- [S5-06] Rishi Baldawa, "The Cognitive Load Cliff in Code Review"(LinearB 2025 分析の引用) — https://rishi.baldawa.com/posts/pr-throughput/cognitive-load-cliff
- [S5-07] Doğan, Tüzün, "Towards a taxonomy of code review smells"(IST 2022、Bilkent 学位論文版) — https://repository.bilkent.edu.tr/bitstreams/d41704d1-a85f-431c-93ad-d7829f0ae73c/download / 論文: https://www.sciencedirect.com/science/article/abs/pii/S0950584921001877
- [S5-08] Gön, Yetiştiren, Tüzün, "Towards Unmasking LGTM Smells in Code Reviews"(ICSME 2024) — https://repository.bilkent.edu.tr/server/api/core/bitstreams/b438e043-7d22-42c3-ae89-37b1d12eaaaf/content
- [S5-09] Pyor, "LGTM Code Review: When Approval Becomes Theatre"(ベンダー記事) — https://pyor.review/blog/lgtm-culture-code-review-theatre
- [S5-10] Rong et al., "The Effect of Checklist in Code Review for Inexperienced Students"(2012) — https://ieeexplore.ieee.org/document/6245021
- [S5-11] Graphite, "Empirically supported code review best practices"(66.7% の出典不明) — https://graphite.com/blog/code-review-best-practices
- [S5-12] Spadini et al., "Test-Driven Code Review: An Empirical Study"(ICSE 2019) — https://sback.it/publications/icse2019a.pdf
- [S5-13] "Understanding and effectively mitigating code review anxiety"(EMSE 2024) — https://link.springer.com/article/10.1007/s10664-024-10550-9

### 6. AI エージェント時代

- [S6-01] GitHub Docs, "Approving a pull request with required reviews"(Copilot を割り当てた人は承認不可) — https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews
- [S6-02] GitHub Community Discussion #172019(most recent reviewable push と n+1) — https://github.com/orgs/community/discussions/172019
- [S6-03] GitHub Docs, "Reviewing a pull request created by Copilot" — https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/review-copilot-prs
- [S6-04] GitHub Changelog, "Optionally skip approval for Copilot coding agent Actions workflows"(2026-03-13) — https://github.blog/changelog/2026-03-13-optionally-skip-approval-for-copilot-coding-agent-actions-workflows
- [S6-05] GitHub Docs, "Available rules for rulesets"(Require an additional approval for unattributed Copilot pull requests) — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- [S6-06] GitHub Changelog, "Copilot code review can now approve pull requests"(2026-09-01) — https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests
- [S6-07] General Analysis, "GitHub Copilot PR Approvals: Keep Human Review Required" — https://generalanalysis.com/guides/github-copilot-pull-request-approvals
- [S6-08] GitHub Community Discussion #197170, "Author Self-Approval Toggle for Branch Rulesets" — https://github.com/orgs/community/discussions/197170
- [S6-09] projen, "Auto-approving Pull Requests"(ラベルはセキュリティ統制ではない) — https://projen.io/docs/integrations/github/auto-approve
- [S6-10] Claude Code Docs, "Code Review"(承認もブロックもしない) — https://code.claude.com/docs/en/code-review
- [S6-11] Anthropic, "How we contain Claude across products"(93% 承認、承認疲れ) — https://www.anthropic.com/engineering/how-we-contain-claude
- [S6-12] Anthropic, "How we built Claude Code auto mode" — https://www.anthropic.com/research/claude-code-auto-mode
- [S6-13] OpenAI, "Harness engineering: leveraging Codex in an agent-first world" — https://openai.com/index/harness-engineering
- [S6-14] OpenAI, "Review GitHub pull requests with Codex" — https://developers.openai.com/codex/third-party/github
- [S6-15] Kalamuna ADR, "Every pull request gets an AI review pass before human review and approval"(2026-07-08) — https://architecture.kalamuna.com/general/2026-07-08-every-pull-request-gets-an-ai-review-pass-before-human-review-and-approval
- [S6-16] Cortex, "A Practical Guide to Risk-Based Code Review" — https://www.cortex.io/post/risk-based-code-review

### 7. ADR

- [S7-01] hidekazu-konishi.com, "Architecture Decision Records: Templates and Operational Patterns" — https://hidekazu-konishi.com/entry/architecture_decision_records_templates_and_operations.html
- [S7-02] picodata, doc/adr README — https://git.picodata.io/core/picodata/-/tree/711236046eec8005453dcef544c4e629986137b7/doc/adr
- [S7-03] AWS Prescriptive Guidance, "Architectural decision record process" — https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html
- [S7-04] Keeling, Runde et al., "Distribute Design Authority with Architecture Decision Records"(Agile Alliance 経験報告) — https://agilealliance.org/resources/experience-reports/distribute-design-authority-with-architecture-decision-records
- [S7-05] Zimmermann, "Ten Common Mistakes in Architectural Decision Records (ADRs)"(2026-09-12) — https://ozimmer.ch/practices/2026/09/12/ADRMistakes.html
- [S7-06] Catio, "Architecture Decision Records (ADRs): The 2026 Guide" — https://www.catio.tech/blog/architecture-decision-record
