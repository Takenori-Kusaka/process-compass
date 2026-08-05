# 調査メモ: エスカレーション・意思決定体制図(D-0)テンプレートと初期フェーズへの組み込み

- 調査日: 2026-08-05
- 対象 Issue: #125「エスカレーション・意思決定体制図(D-0成果物)テンプレート」/ #105「初期フェーズでの D-0 作成ステップの組み込み」
- 目的: 立ち上げ時に「誰が決めるか」「詰まったらどこへ上げるか」を1枚で合意し、以後の全ゲート判定の前提として機能させるための、様式・統制・監査要件の一次情報を集める
- 関連する既存メモ: `research/phase4-standard/104-escalation-criteria.md`(閾値と報告様式)、`research/phase4-standard/099-macro-lifecycle.md`、`research/phase1/20260710-jp-governance.md`

本メモは事実(節1〜7)と解釈(節8「考察」)を分離して記述します。断定できない点は「未確認」と明記します。

---

## 1. 立ち上げ時の体制合意文書の実務

### 1.1 PMBOK のプロジェクト憲章(Project Charter)

- 定義: 「プロジェクトの存在を正式に承認し、プロジェクトマネージャーに組織資源を投入する権限を与える、プロジェクト立ち上げ者またはスポンサーが発行する文書」である
- 発行者はプロジェクトマネージャーではなく**スポンサー(立ち上げ者)**である。すなわち憲章は「下から出す申請書」ではなく「上から与える権限委譲状」の性格を持つ
- 一般に記載される項目
  - 目的・正当化理由(なぜやるか)
  - 上位の目標と成功基準
  - 主要成果物と上位要求
  - 前提条件・制約条件
  - 上位リスク
  - 要約マイルストーンと要約予算
  - 主要ステークホルダー
  - **プロジェクトマネージャーの権限と責任**
- 立ち上げ時点では要求・日程・予算の詳細を確定できないため、概略値で足りるという注記がある

出典(公表年):
- <https://en.wikipedia.org/wiki/Project_charter>(PMBOK 定義の引用元として。二次情報)
- <https://www.projectengineer.net/the-pmboks-project-management-documents/>(2023 頃、二次情報)
- <https://www.projectmanagement.com/deliverables/318234/project-charter-template---i-pmbok-sup----sup--guide--i--aligned->(PMI 運営サイトのテンプレート。閲覧時に会員登録が必要で本文は未確認)
- PMI 公式ライブラリ <https://www.pmi.org/learning/library/charter-selling-project-7473> は 403 のため本文未確認

**未確認**: PMBOK Guide 第7版(2021)本文における「憲章の必須記載項目」の逐語的な列挙。第6版までは 4.1.3.1 で列挙されていたが、第7版は原則ベースへ改訂されており、逐語確認には原典が必要である。

### 1.2 PRINCE2 の Project Initiation Documentation(PID)

- PID は単一の文書ではなく、**プロジェクト開始に必要な情報を束ねた論理的な文書集合**である
- 主要な3つの用途
  - プロジェクトボードが大きなコミットを行う前に、プロジェクトの基盤が健全であることを保証する
  - ボードとプロジェクトマネージャーが進捗・課題・継続妥当性を評価する**基準文書(ベースライン)**となる
  - 途中参加者が「何をする案件で、どう管理されているか」を1か所で把握できる参照点となる
- 内容: プロジェクト定義、アプローチ、**チーム構成(体制)**、ビジネスケース、各種アプローチ文書(品質・リスク・変更・コミュニケーション)、プロジェクト計画、**プロジェクト統制(controls)**、および PRINCE2 のテーラリング方法

出典:
- PRINCE2 wiki(管理成果物) <https://prince2.wiki/management-products/baselines/project-initiation-documentation/>
- AXELOS 公式出版物 PRINCE2 Agile 2016 A.20 <https://publications.axelos.com/PRINCE2Agile2016/content.aspx?page=pra_199&showNav=true&expandNav=true>(2016、公式)
- <https://en.wikipedia.org/wiki/Project_initiation_documentation>

### 1.3 プロジェクトボードの3ロール

- 構成は **Executive(実行責任者)/ Senior User(s)/ Senior Supplier(s)** の3種である
- 「プロジェクトボードは民主的ではなく、多くの場合の最終決定は Executive に属する」と明記される。Senior User と Senior Supplier は主として Executive へ情報を提供する立場である
- ボードの集合的責任として、資金・要員・資源の確保、品質保証の提供、事業戦略との整合、ガバナンスの確立と運用が挙げられる
- Project Assurance(ボードから独立した保証機能)および Change Authority(変更決裁の委譲先)への言及はあるが、参照ページ本文では詳細が未記載

出典: <https://prince2.wiki/roles/project-board/>

**未確認**: Senior User = 「便益実現の説明責任」、Senior Supplier = 「成果物を作る側の資源提供責任」という一般的整理は、PRINCE2 公式マニュアル(PRINCE2 7、2023)の逐語では未確認である。

### 1.4 Management by Exception(例外による管理)とトレランス

- 定義: 「例外による管理は、プロジェクト階層の各レベルが**その1つ下のレベルを管理する**ために用いる概念」である
- トレランス(許容幅)を設定する対象領域として、Time / Cost / Quality / Scope / Risk / Benefit / **Sustainability** が列挙される(Sustainability は PRINCE2 7 で追加された領域)
- 動作: 「トレランスを超える課題が発生した場合、下位のレベルは上位のレベルへ通知しなければならない」
- 「例外が発生した場合、プロジェクトマネージャーは**例外報告(Exception Report)**をプロジェクトボードへ提出する」
- 効果: 上位マネジメントは些末な事象に忙殺されずに下位を統制できる
- 例外管理の手順は「予測 → 課題の起票 → エスカレーション → 選択肢の検討 → 例外計画(Exception Plan) → 実行」の6段階として整理される
- トレランスは、逸脱がその範囲内であればプロジェクトマネージャーが追加承認なしに動ける境界であり、超過時にのみボードが関与する

出典:
- <https://prince2.wiki/principles/manage-by-exception/>
- <https://prince2.wiki/management-products/reports/exception-report/>
- <https://www.knowledgetrain.co.uk/project-management/exception-management>(6段階手順、二次情報)
- <https://www.prince2.com/usa/blog/understanding-tolerances-in-prince2-project-management-prince2>(PeopleCert 運営の公式ブログ)

要点(体制図テンプレートへの含意):
- 体制図は「箱と線」ではなく、**各レベルの権限境界(トレランス)とその超過時の通知先**を書いた表と等価である
- エスカレーションは「困ったら相談する」ではなく「閾値超過の**予測時点**で自動的に発火する義務」である

---

## 2. エスカレーションパスの設計実務

### 2.1 機能的エスカレーションと階層的エスカレーション(ITIL)

- **機能的(水平)エスカレーション**: 役職の上下ではなく、**スキル・権限・システム知識**に基づいて、解決に最も適した担当・チームへ引き渡すこと
- **階層的(垂直)エスカレーション**: **経験や職位**に基づいて上位へ引き上げること。事業影響が大きい場合、または合意された SLA を超えて解決が長引く場合にマネジメントへ通知する
- 両者は排他ではなく、**同時に走ってよい**。階層的エスカレーションは機能的エスカレーションを置き換えない

出典:
- <https://www.atlassian.com/incident-management/on-call/escalation-policies>(Atlassian、Incident Management Handbook)
- <https://wiki.en.it-processmaps.com/index.php/Checklist_Incident_Escalation>(ITIL プロセスマップ)
- <https://www.novelvista.com/blogs/it-service-management/escalation-management-itil>(二次情報)

**未確認**: ITIL 4 の公式コア出版物(AXELOS/PeopleCert、2019〜)における「functional escalation」「hierarchical escalation」の逐語定義。ITIL 4 では用語体系が ITIL v3 から整理されており、v3 由来の用語である可能性がある。

### 2.2 Google の Incident Management(IMAG)

- 主要ロールは **Incident Commander(IC)/ Communications Lead(CL)/ Operations Lead(OL)** の3種
  - IC: インシデント対応全体を指揮・調整し、必要に応じてロールを委譲する。**委譲されていないロールは既定で IC が兼務する**
  - CL: ステークホルダーへ定期的に状況を更新し、外部からの問い合わせの窓口となる
  - OL: 事象の緩和・利用者影響の最小化・復旧に集中する
- 階層構造: IC が対応を率い、CL と OL は IC に報告する。リードはさらに他の対応者へタスクを委譲できる
- **重要な原則**: 「インシデント時のロールは通常の指揮命令系統(報告ライン)には従わず、知識とインシデントの文脈に基づいて割り当てられる」

出典:
- <https://sre.google/resources/practices-and-processes/incident-management-guide/>(Google、公開年はページ上に明記なし)
- <https://sre.google/static/pdf/IncidentManagementGuide.pdf>
- <https://sre.google/workbook/incident-response/>(The Site Reliability Workbook、2018)
- <https://sre.google/sre-book/managing-incidents/>(Site Reliability Engineering、2016)

### 2.3 PagerDuty のエスカレーションポリシー設計

- ポリシーは1度に1つの対象へ通知し、誰かが確認(acknowledge)するまで次のレベルへ上げる
- 第1レベルへの通知は遅延なしで即時に行われる
- **3階層構成が顧客の間で一般的**であり、Tier 1 サービスでは第4階層を足すこともある
  - 第1レベル: サービスを担当するチームのオンコールローテーション
  - 第2レベル: 第1レベルと**同じ人員プール**だが別スケジュール(例: 1週ずらしたローテーション)
  - 第3レベル: テックリード、エンジニアリングマネージャー、プロダクトオーナー
- 第1→第2の待ち時間を極端に短くしても信頼性は上がらず、担当者の心理的負担が増えるだけである
- 技術的制約として、1つのエスカレーションレベルに複数の人・スケジュールを置く場合、レベル間は**最低5分**空ける必要がある
- 新人にはシャドー用スケジュールを併置して育成する運用が推奨される

出典:
- <https://ownership.pagerduty.com/escalations/>(PagerDuty、Full-Service Ownership ドキュメント)
- <https://support.pagerduty.com/main/docs/escalation-policies>(公式サポート文書)
- <https://support.pagerduty.com/main/docs/escalation-policies-and-schedules>

---

## 3. 意思決定フレームワークの比較(RACI / RAPID / DACI)

### 3.1 RAPID(Bain & Company)

- 役割: **R**ecommend / **A**gree / **P**erform / **I**nput / **D**ecide
  - Recommend: プロセスを駆動し、入力を集めて意思決定者への提案をまとめる
  - Agree: 提案が実行可能で、自らの必須要件を満たすことを確認する(実質的な**限定的拒否権**)
  - Perform: 決定後の実行に説明責任を負う
  - Input: 提案を形づくる専門知識・経験・情報を提供する(拒否権なし)
  - Decide: 最終決定を下し、組織を行動にコミットさせる
- 原則: 「**各意思決定について Decide は1人であるべき**」。共有せざるを得ない場合は、合意形成の手順を事前に定める
- 実行順序は Recommend → Input → Agree → Decide → Perform

出典: <https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/>(2023-10-13)

### 3.2 DACI(Atlassian Team Playbook)

- 役割: **D**river / **A**pprover / **C**ontributor / **I**nformed
  - Driver: 関係者をまとめ、期限までに決定が下されることを保証する(決定者ではない)
  - Approver: 「決定を下す**唯一の**人物(そう、1人である)」
  - Contributor: 意見を出す専門家。投票権は持たない
  - Informed: 決定の影響を受け、結果を知る必要がある人
- 合意形成(コンセンサス)ではなく単一決定者を置くことで、際限のない審議を防ぐ

出典: <https://www.atlassian.com/team-playbook/plays/daci>

### 3.3 RACI と、体制図テンプレートでの役割分担

- RACI(Responsible / Accountable / Consulted / Informed)は**作業と責任の割り当て**の記述に向く。意思決定の順序や拒否権の粒度は表現しない
- RAPID は**意思決定の流れと拒否権**を表現できる。全社的・部門横断の重い意思決定に向く
- DACI は**個別の意思決定1件**を軽量に回すのに向く。Driver という「決めさせる役」が独立している点が特徴である
- 実務上の運用助言として、RACI を**ステージゲート・承認ワークフロー・カレンダーに紐づけ**、承認を Accountable ロールへ自動ルーティングすることで場当たり的承認を防ぐ、という整理がある

出典:
- <https://umbrex.com/resources/frameworks/organization-frameworks/raci-matrix-responsible-accountable-consulted-informed/>
- <https://umbrex.com/resources/frameworks/strategy-frameworks/rapid-decision-rights-framework/>
- <https://project-management.com/understanding-responsibility-assignment-matrix-raci-matrix/>(2026 更新)

---

## 4. 署名・合意の統制

### 4.1 ISO 9001:2015 の文書化した情報(7.5)

- 7.5.2「作成及び更新」では、文書化した情報の作成・更新に際して次を確実にすることが求められる
  - 適切な識別及び記述(表題、日付、作成者、参照番号など)
  - 適切な形式及び媒体
  - **適切性及び妥当性に関するレビュー及び承認**
- 7.5.3「文書化した情報の管理」では、必要なときに利用可能であること、および適切に保護されることが求められる
- 実務上の解説として、レビューと承認は**追跡可能(誰が行ったかが明らか)**であり、かつ**なりすまし防止(他人の名義で承認できない)**である必要があるとされる

出典:
- <https://www.thecoresolution.com/clause-7-5-2-iso-90012015-explained>
- <https://www.isms.online/iso-9001/clause-7-5-documented-information/>
- <https://preteshbiswas.com/2019/05/11/iso-90012015-clause-7-5-documented-information/>

**未確認**: ISO 9001:2015 原文の逐語(ISO は有償規格のため本調査では本文を参照していない)。

### 4.2 ISO/IEC 42001:2023(AI マネジメントシステム)

- 5.3「組織の役割、責任及び権限」: トップマネジメントは、AI ライフサイクルに関わる各ロールについて**責任と意思決定権限を割り当て、周知する**ことが求められる。特に、AIMS が規格要求に適合することを確実にする責任者と、その performance をトップマネジメントへ報告する権限を明示的に割り当てる
- 7.5「文書化した情報」: 文書化情報の作成・管理・維持を求める。要求される文書、実施の証拠となる記録、方針・手順、AI システム単位のライフサイクル文書の4カテゴリに整理する実務解説がある
- 実務上の含意として、モデル学習・閾値設定・性能監視といった**意思決定と行為を文書化**し、追跡可能・監査可能にすることが強調される

出典:
- ISO 公式ページ <https://www.iso.org/standard/42001>(2023)
- <https://watchdogsecurity.io/iso-42001/assign-ai-roles-responsibilities-and-authorities>
- <https://cyvitrix.com/iso-42001-clause-7-5-documented-information-requirements-for-ai-governance/>
- <https://www.hicomply.com/en-us/hub/documentation-requirements>
- 規格サンプル PDF <https://cdn.standards.iteh.ai/samples/81230/4c1911ebc9a641fcb6ee21aa09c28ad3/ISO-IEC-42001-2023.pdf>

**未確認**: ISO/IEC 42001:2023 の 5.3 / 7.5 / 9.2 の逐語。ISO OBP(<https://www.iso.org/obp/ui/>)は 403 で取得できなかった。

### 4.3 21 CFR Part 11(米国 FDA、電子記録・電子署名)

体制図の「承認記録」をどこまで固める必要があるかの参照モデルとして有用です。

- §11.10(e): 「オペレーターの入力および操作の日時を独立に記録する、**安全で、コンピュータが生成した、タイムスタンプ付きの監査証跡**の使用」。変更は先行情報を隠蔽してはならず、監査証跡は対象記録と同じ期間保存する
- §11.10(d): システムアクセスを権限保有者に限定する
- §11.10(g): 権限チェックにより、権限のある者だけがシステムの使用・記録への電子署名・操作を行えるようにする
- §11.10(k): システム文書の配布・アクセス・使用の管理と、改訂履歴の監査証跡
- §11.50(署名の表示): 署名済み電子記録には次を明確に示す情報を含める
  - 署名者の**印字された氏名**
  - 署名が実行された**日付および時刻**
  - 署名に関連づけられた**意味**(レビュー、承認、責任、著作のいずれか)
  - これらは人間が読める表示・印刷物にも表示され、他の電子記録と同等に保護される
- §11.70: 電子署名と電子記録の結合(切り離し・複製・転用の防止)

出典:
- <https://www.law.cornell.edu/cfr/text/21/11.10>
- <https://www.law.cornell.edu/cfr/text/21/11.50>
- (eCFR <https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11> はリダイレクトのため未取得)

### 4.4 日本の電子署名・記録保存の実務

- 電子署名法第3条は、本人による電子署名が付されている電子文書について、真正に成立したものと**推定**する旨を定める
- 実務上は「電子署名 + タイムスタンプ」を組にする。タイムスタンプは、その時刻以前に文書が存在したこと、およびその時刻以降に改ざんされていないことを証明する
- 電子帳簿保存法の条文からは 2015 年に「電子署名」の文言が削除されており、保存要件として電子署名が必須ではなくなった。ただし時刻の保証ができないため、実務では併用が基本とされる
- 社内の**稟議書・決裁記録**と締結記録を、案件番号・契約番号で紐づける運用が実務の基本とされる

出典:
- <https://www.gmosign.com/media/electronic-contract/denshikeiyaku-youken/>
- <https://www.nta.go.jp/law/joho-zeikaishaku/sonota/jirei/pdf/03-6.pdf>(国税庁、令和7年6月 = 2025-06、一次情報)
- <https://legal-gpt.com/electronic-contract-compliance-standard/>
- <https://www.mhlw.go.jp/file/05-Shingikai-12601000-Seisakutoukatsukan-Sanjikanshitsu_Shakaihoshoutantou/0000026083.pdf>(厚生労働省、記名押印の電子署名代替に関する検討資料)

---

## 5. 監査手順と監査証拠

### 5.1 ISO 19011:2018 の監査証拠

- 定義: 監査証拠とは「**関連性があり、かつ検証可能な、記録、事実の記述又はその他の情報**」である
- 収集: 監査目的・範囲・基準に関連する情報を、適切なサンプリングによって収集し、実行可能な範囲で**検証**する。機能・活動・プロセス間のインターフェースに関する情報も含める
- 採否: 「**ある程度の検証が可能な情報だけ**を監査証拠として受け入れる」。検証度が低い場合、監査員は職業的判断でどの程度依拠できるかを決める
- 収集手段: インタビュー、観察、記録のレビュー
- 実務上の評価軸として「4C(complete / correct / consistent / current)」を用いる整理がある

出典:
- <https://www.iso.org/obp/ui/#iso:std:iso:19011:ed-3:v1:en>(ISO OBP、2018。本調査では本文取得は未実施)
- <https://asq.org/quality-resources/iso-19011>
- <https://preteshbiswas.com/2023/12/05/6-4-7-collecting-and-verifying-information/>(6.4.7 情報の収集及び検証)
- <https://www.scribd.com/document/567141986/ISO-19011-2018-Terms-and-definitions>

### 5.2 「体制図が作成され合意されていること」を監査でどう検証するか(事実からの整理)

上記の一次要件を突き合わせると、監査で成立する証拠は次の条件を満たす必要があります。

- 記録として存在する(口頭の合意は監査証拠にならない。ISO 19011 の「記録・事実の記述」)
- 検証可能である(第三者が後から同じ結論に到達できる。ISO 19011 6.4.7)
- 承認者が同定できる(ISO 9001 7.5.2 のレビュー・承認、21 CFR §11.50 の署名者氏名)
- 承認日時が記録されている(21 CFR §11.50、電子帳簿保存法実務のタイムスタンプ)
- 承認の**意味**が記録されている(21 CFR §11.50: レビューか承認か責任か)
- 改ざん耐性がある(21 CFR §11.10(e) のタイムスタンプ付き監査証跡、先行情報を隠蔽しない)

### 5.3 Git / チケットを監査証跡として使う場合の充足状況(事実の対応づけ)

| 監査要件 | Git(コミット/PR) | Issue / チケット | 補強が必要な点 |
| --- | --- | --- | --- |
| 承認者の同定 | PR の Approve は GitHub アカウントに紐づく | コメント投稿者が記録される | アカウントと実在人物の対応表が別途必要 |
| 日時 | コミット日時・レビュー日時が記録される | コメント日時が記録される | コミット日時はクライアント側で改変可能である |
| 改ざん耐性 | 署名付きコミット(Require signed commits)で担保しうる | 編集履歴は残るが本文は編集可能 | 保護ブランチ/監査ログの設定が前提 |
| 承認の意味 | 「Approve」の意味は文脈依存 | ラベル・テンプレートで明示可能 | 様式側で「何を承認したか」を明記させる |

- GitHub のルールセットには「Require signed commits(署名され検証されたコミットのみ push 可)」がある

出典: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>

---

## 6. ゲート前提条件(entry criteria)の未充足でゲートをブロックする統制

### 6.1 Stage-Gate における entry / exit criteria

- **entry criteria(入場基準)**: ゲートに進む前に完了していなければならない作業とマイルストーンを規定する。評価をいつ開始できるかを定義する
- **exit criteria(退場基準)**: ゲート通過に必要な水準を規定する。ゲートで判定される項目そのものである
- ゲートの出力は Go / Kill / Hold / Recycle の判断と、次ステージの行動計画の承認である
- 各ゲートは **must-meet(必達)と should-meet(望ましい)**の基準を明示すべきである。基準が曖昧だと、証拠に基づく判断ではなく**政治的な判断**になる
- Stage-Gate は Robert G. Cooper により 1988 年に提示された

出典:
- <https://www.projectsmart.co.uk/lifecycle-and-methodology/the-phase-gates-cheat-sheet-4-steps-to-better-managed-projects.php>
- <https://www.hhs.gov/sites/default/files/ocio/eplc/EPLC%20Archive%20Documents/56%20-%20Stage%20Gate%20Reviews/eplc_stage_gate_reviews_practices_guide.pdf>(米国 HHS、EPLC Stage Gate Review Practices Guide。政府機関の一次資料)
- <https://cio-wiki.org/wiki/Stage-Gate>

### 6.2 GitHub による実装(ルールセット / 保護ブランチ)

- **Require status checks to pass**: 対象ブランチへの変更前に必須 CI チェックの合格を強制する。strict(base ブランチに追随していること)と loose の2種がある
- **Require a pull request before merging**: 変更を PR に紐づける。付随設定として
  - 必要承認数(write 権限保有者による承認)
  - **Require review from Code Owners**: code owner が所有する内容を変更する PR は、その code owner の承認を必須にする
  - Dismiss stale approvals: 差分を変える commit で既存承認を自動失効させる
  - 未解決コメントの解消要求、最後の push 者以外の承認要求
- **Require deployments to succeed**: 特定環境への配備成功をマージ条件にする
- **Require signed commits**: 署名・検証済みコミットのみ許可する
- CODEOWNERS ファイルは `.github/`、リポジトリ直下、`docs/` のいずれかに置く。複数ある場合はこの順で最初に見つかったものが使われる
- レビュー要求のトリガーには、**PR の base ブランチ側**の CODEOWNERS が使われる

出典:
- <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets>
- <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners>
- <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule>

---

## 7. 体制図の陳腐化防止

- RACI 等の責任分担表は「組織変更・方針変更・ツール変更の後」および「四半期ごと」にレビューすべきとされる
- **重大インシデントの後**にもレビューを行い、戦略やチーム編成の変化に追随させる整理がある
- 陳腐化した RACI は信頼を損なうため、四半期レビュー、**バージョン管理**、共有リポジトリでの公開をセットで行うことが推奨される
- 承認を場当たりにしないため、RACI をステージゲートと承認ワークフローに紐づけ、Accountable ロールへ承認を自動ルーティングする
- オンコール側では、PagerDuty のエスカレーションポリシーは第1・第2レベルを**ローテーション(スケジュール)**として定義するため、個人名ではなくスケジュール参照にしておくこと自体が陳腐化対策になる

出典:
- <https://umbrex.com/resources/frameworks/organization-frameworks/raci-matrix-responsible-accountable-consulted-informed/>
- <https://elevateconsult.com/insights/control-owner-raci-for-audit-readiness-across-security-and-ops/>
- <https://ownership.pagerduty.com/escalations/>

---

## 8. 日本の企業文化における実態(建前と運用の乖離)

- 日経コンピュータ「ITプロジェクト実態調査2018」では成功率 52.8% であり、約半数が失敗に終わっている
- PMI 日本支部 PMO 研究会の調査(上記記事内の引用)では、PMO 導入企業のうち
  - 約 53% が「教訓が次のプロジェクトに活かされていない」
  - 約 39% が「経営戦略とプロジェクト目標の整合を取る仕組みがない」
- 体制図の典型的な失敗として、**責任系統が2つに分かれ、最終意思決定者が1人でない**ために方針が決まらない/決まってもすぐ覆る、という指摘がある
- 日本企業では組織体制やマネジメントシステムの整備が後回しにされ、属人的管理に依存しやすいという指摘がある
- 改善の要点として、体制図に「重要な意思決定・課題のエスカレーション先として機能すること」を明記し、各役職の**責任範囲と権限レベル**を明確にすることが挙げられる

出典:
- <https://miraie-group.jp/sees/article/detail/PMO_system_chart>
- <https://www.oceanc.jp/column/project-management-structure/>
- <https://www.asckk.co.jp/archives/column/id105-project-structure>
- <https://note.com/suits_ceo/n/na26b7d712eb9>
- <https://pm-laboratory.com/m260223/>

**未確認**: PMI 日本支部・日経コンピュータの原典。上記数値は二次記事からの引用であり、原典 URL は本調査では特定できていない。

---

## 9. 考察(本プロジェクトへの設計提案)

ここからは調査者の解釈です。事実ではありません。

### 9.1 D-0 が満たすべき本質的な条件

調査を通して、体制図が機能するかどうかは「箱と線が描かれているか」ではなく、次の3点が書かれているかで決まると解釈します。

1. **単一の決定者が特定されている**(PRINCE2 Executive、RAPID の Decide、DACI の Approver がいずれも「1人」を強く要求している)
2. **各レベルの権限境界が数値で書かれている**(PRINCE2 のトレランス。#104 で定めた閾値がここに接続する)
3. **境界を超えたときの通知先と応答期限が書かれている**(PagerDuty の多段ポリシー、ITIL の機能的/階層的の区別)

### 9.2 D-0 テンプレートの構成案(6観点への対応)

| 調査観点 | D-0 に載せる欄 | 根拠となる一次情報 |
| --- | --- | --- |
| ロールモデル | 決定者(1名)、価値責任者、技術判断者、品質保証、セキュリティ代表、AI 運用責任者 | PRINCE2 Project Board、ISO/IEC 42001 5.3 |
| 組織的役割 | 独立レビュー担当(ライン外)、監査窓口 | PRINCE2 Project Assurance、ISO 19011 |
| ゲート・意思決定 | ゲートごとの決裁者・entry criteria・must-meet / should-meet | Stage-Gate、HHS EPLC |
| 成果物 | D-0 自身の版・承認日時・承認者・次回レビュー期日 | ISO 9001 7.5.2、21 CFR §11.50 |
| レビュープロセス | 誰が D-0 をレビューし、誰が承認するか(CODEOWNERS に写像) | GitHub CODEOWNERS |
| 階層構造 | 3層(経営/プロジェクト/チーム)のトレランス表 + 障害時の別系統(IC 系) | PRINCE2 manage by exception、Google IMAG |

**重要な設計上の分岐**: 平常時の意思決定階層(トレランス超過 → 上位へ)と、障害対応時の指揮系統(IC 系)は**別の図にすべき**と解釈します。Google IMAG が「インシデント時のロールは通常の報告ラインに従わない」と明記しているためです。1枚に混在させると、障害時に「まず上長へ報告」という平常時の作法が復活し、初動が遅れます。

### 9.3 テンプレートに含める推奨欄(草案)

- ヘッダ: 案件 ID / 版 / 承認日時 / 承認者(氏名・役職)/ 次回レビュー期日 / 変更履歴へのリンク
- 表1「意思決定の権限」: 決定事項の種類 × Decide / Agree(拒否権)/ Recommend / Input / Perform(RAPID)
- 表2「トレランス」: 領域(日程・費用・スコープ・品質・リスク・便益)× チーム層の許容幅 × プロジェクト層 × 経営層
- 表3「平常時エスカレーション」: 発火条件 → 通知先 → 応答期限 → 決裁権限(#104 の表と接続)
- 表4「障害時エスカレーション」: 深刻度 × IC 指名方法 × 一次オンコール → 二次 → 三次(役割名で書き、個人名を書かない)
- 表5「役職と個人の対応表」: 役割名 → 現任者 → 代理者(この表だけが人事異動で変わる)
- 欄外: 陳腐化防止(四半期/異動時/マイルストーン時/重大インシデント後にレビューする旨)

個人名を表5に隔離するのは、他の表を人事異動で書き換えずに済ませるためです(PagerDuty がスケジュール参照で個人名を持たないのと同じ発想)。

### 9.4 Issue #105(初期フェーズへの組み込み)の実装案

- D-0 は G-1(企画承認)の**入力**ではなく **entry criteria** に置く。すなわち「D-0 が承認済みでなければ G-1 の審議自体を開始しない」
- 承認記録は Git 上に置き、次で監査要件を満たす
  - D-0 を `docs/` 配下の Markdown として管理し、CODEOWNERS で決定者を code owner に指定して **Require review from Code Owners** を有効にする(承認者の同定)
  - PR のマージコミット日時を承認日時とする(日時)
  - Require signed commits で改ざん耐性を補強する(必要な統制水準の場合)
  - PR 本文のテンプレートに「本 PR は D-0 の**承認**である」と明記させる(21 CFR §11.50 の「署名の意味」に相当)
- ゲートのブロックは CI で機械化する。案としては「D-0 ファイルが存在し、frontmatter の `approved_at` と `approver` が空でなく、`next_review` が未来日であること」を必須ステータスチェックにする
- 期限切れ検知: `next_review` を過ぎた D-0 がある場合、CI を警告(またはゲート判定をブロック)にする。これが節7の陳腐化防止をプロセスに落とす唯一の実効手段である

### 9.5 日本の実態への手当て

- 「決定者1人」の原則は、事業部門と情報システム部門で責任が二重化する日本型体制と正面衝突します。D-0 では**二重化を禁止するのではなく、二重化している事実を書かせたうえで「最終決定者」を1人選ばせる**構成が現実的だと解釈します
- 押印文化への対応として、電子署名法第3条の推定効に依拠する電子署名までは通常不要であり、Git 上の承認記録 + 日時 + 承認者の同定で ISO 9001 7.5.2 相当は満たせると解釈します。ただし規制産業(医薬・医療機器)では 21 CFR Part 11 相当の統制が別途必要です

---

## 10. 追加調査が必要な穴(未確認事項の一覧)

- PMBOK Guide 第7版(2021)におけるプロジェクト憲章の記載項目の逐語。原典が必要
- PRINCE2 7(2023)公式マニュアルにおける Project Board 3ロールの逐語定義、および Sustainability トレランスの正式な扱い
- ITIL 4 公式出版物における functional / hierarchical escalation の逐語定義(ITIL v3 由来の用語である可能性)
- ISO 9001:2015 / ISO/IEC 42001:2023 / ISO 19011:2018 の条文逐語(いずれも有償規格。本メモは公式ページと解説記事に依拠)
- PMI 日本支部 PMO 研究会調査、日経コンピュータ「ITプロジェクト実態調査2018」の原典 URL
- 「体制図のレビュー周期」に関する規格・公的ガイドラインの明示的な要求(現時点で見つかったのはコンサルティング会社の実務助言のみであり、規格上の根拠は未確認)
- 電子署名の推定効に関する、社内決裁文書(契約書以外)への適用実務。判例・行政解釈の確認が未了
