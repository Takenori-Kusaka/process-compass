# 承認・判定の記録に規制・規格が求めるもの — 手入力帳票とシステム監査証跡の比較

- 調査日: 2026-10-23
- 問い: ソフトウェア開発の「承認・判定の記録」について、規制・規格は何を要件とし、何を要件としないか。「人が氏名と日時を手入力した文書」と「システムが自動で残す監査証跡(例: GitHub の PR 承認イベント)」のどちらが記録として強いか
- 位置づけ: 一次調査メモ。条項の新設・改廃の根拠に使う前に、会議体と突合(CLAUDE.md コアポリシー)を経ること
- 原文の引用は英語のまま載せています。和訳は要点のみです。有償規格で原文を確認できなかった箇所は「未確認」と明記しています

## 0. 先に結論

- 規格・規制が記録に求める中核は、**誰が(Who)・いつ(When)・何に対して(What)・どの判定を(Outcome)・なぜ(Reason)** を帰属させ、**後から気づかれずに変えられない**ことである。媒体(紙か電子か)は問わない
- 「人が氏名と日時を手入力した文書」は、Attributable(帰属)と Contemporaneous(同時性)を**本人の申告に依存**する。規制側は、紙でも電子でも「誰が・いつ」を**システムまたは独立の仕組みが記録する**ことを求めており、手入力の帳票はそれ単体では弱い
- 「システムの自動記録(PR 承認イベント)」は、Who/When/What/Outcome を**システムが独立に時刻印して残す**点で強い。ただし、**Reason(判定理由)は自動では残らず**、**保持期間・エクスポート・改変不能の担保**はプラットフォームの仕様と組織側の手順に依存する
- GitHub の PR 承認は、21 CFR Part 11 の「電子署名」の要件を**そのままでは満たさない**。欠けるのは主に、署名時の識別要素の再入力(11.200)、氏名(ハンドル名ではなく printed name)の表示(11.50)、署名の意味の表示(11.50)、署名と記録の恒久的リンク(11.70)の技術的担保、組織の方針・FDA への証明(11.10(j)、11.100(c))である。ただし **電子署名が要るかどうかは predicate rule(個別規制)が決める**。社内の判定記録に法令上の署名義務がなければ、Part 11 の電子署名要件は掛からない(FDA 2003 ガイダンス、厚労省 ER/ES 指針の解説)
- 規格は「文書(document)」を**求めていない**。ISO/IEC/IEEE 15289 は、情報項目がリポジトリ上にあり参照できれば適合と明記する。IEC 62304 の附属書は、変更要求の承認の証拠が「データベース上の記録」でよいと明記する。FDA の CSA ガイダンス(2026)は、紙やスクリーンショットではなく**システムのログ・監査証跡を記録として使うことを推奨**する

## 1. FDA 21 CFR Part 11(電子記録・電子署名)

### 1.1 条文の要点(原文は eCFR / LII)

出典: https://www.law.cornell.edu/cfr/text/21/part-11 (各節: `/11.3`, `/11.10`, `/11.50`, `/11.70`, `/11.100`, `/11.200`)

| 節 | 要点 | 原文の短い引用 |
| --- | --- | --- |
| 11.3(b)(6) | 電子記録の定義 | "any combination of text, graphics, data, audio, pictorial, or other information representation in digital form that is created, modified, maintained, archived, retrieved, or distributed by a computer system" |
| 11.3(b)(7) | 電子署名の定義 | "a computer data compilation of any symbol or series of symbols executed, adopted, or authorized by an individual to be the legally binding equivalent of the individual's handwritten signature" |
| 11.10 柱書 | 閉鎖系の管理目的 | "to ensure the authenticity, integrity, and, when appropriate, the confidentiality of electronic records, and to ensure that the signer cannot readily repudiate the signed record as not genuine" |
| 11.10(a) | システムのバリデーション | "Validation of systems to ensure accuracy, reliability, consistent intended performance, and the ability to discern invalid or altered records" |
| 11.10(e) | 監査証跡 | "Use of secure, computer-generated, time-stamped audit trails to independently record the date and time of operator entries and actions that create, modify, or delete electronic records. Record changes shall not obscure previously recorded information. Such audit trail documentation shall be retained for a period at least as long as that required for the subject electronic records and shall be available for agency review and copying." |
| 11.10(g) | 権限チェック | "only authorized individuals can use the system, electronically sign a record, access the operation or computer system input or output device, alter a record, or perform the operation at hand" |
| 11.10(j) | 署名者の責任を定める書面の方針 | "written policies that hold individuals accountable and responsible for actions initiated under their electronic signatures, in order to deter record and signature falsification" |
| 11.50(a) | 署名の表示 | "(1) The printed name of the signer; (2) The date and time when the signature was executed; and (3) The meaning (such as review, approval, responsibility, or authorship) associated with the signature" |
| 11.50(b) | 上記の表示は人が読める出力にも含める | "shall be included as part of any human readable form of the electronic record (such as electronic display or printout)" |
| 11.70 | 署名と記録のリンク | "linked to their respective electronic records to ensure that the signatures cannot be excised, copied, or otherwise transferred to falsify an electronic record by ordinary means" |
| 11.100(a) | 一意性 | "Each electronic signature shall be unique to one individual and shall not be reused by, or reassigned to, anyone else" |
| 11.100(c) | FDA への証明 | "certify to the agency that the electronic signatures in their system ... are intended to be the legally binding equivalent of traditional handwritten signatures" |
| 11.200(a)(1) | 2つの識別要素 | "Employ at least two distinct identification components such as an identification code and password" |
| 11.200(a)(1)(i) | 連続セッション内の署名 | "the first signing shall be executed using all electronic signature components; subsequent signings shall be executed using at least one electronic signature component that is only executable by, and designed to be used only by, the individual" |
| 11.200(a)(1)(ii) | 連続セッション外の署名 | "each signing shall be executed using all of the electronic signature components" |

### 1.2 適用範囲と執行裁量(FDA 2003 年ガイダンス "Part 11, Scope and Application")

出典: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application

- FDA は Part 11 の適用範囲を**狭く解釈**する。"This guidance explains that we will narrowly interpret the scope of part 11."
- バリデーション、監査証跡、記録保持、記録複製の要件については**執行裁量**(enforcement discretion)を行使する。"we do not intend to take enforcement action to enforce compliance with the validation, audit trail, record retention, and record copying requirements of part 11"
- ただし **predicate rule(基礎規則。例: 21 CFR 820、211)の要件は残る**。"Persons must still comply with all applicable predicate rule requirements related to documentation of, for example, date ..., time, or sequencing of events, as well as any requirements for ensuring that changes to records do not obscure previous entries."
- 含意: Part 11 の電子署名要件が掛かるのは、**基礎規則が署名を求める記録**を電子で済ませる場合である。社内の判定記録に法令上の署名義務がなければ、Part 11 の電子署名要件は直接には掛からない。これは日本の ER/ES 指針の解説(6 節)とも整合する

### 1.3 FDA の現在の立場(2018 年 データインテグリティ Q&A、2026 年 CSA ガイダンス)

出典(DI Q&A): https://www.fda.gov/media/119267/download

- 監査証跡の定義(Q1c): "audit trail means a secure, computer-generated, time-stamped electronic record that allows for reconstruction of the course of events relating to the creation, modification, or deletion of an electronic record."
- 誰がレビューするか(Q7): "Personnel responsible for record review under CGMP should review the audit trails that capture changes to data associated with the record as they review the rest of the record"。紙の訂正線(cross-outs)の確認と同じ位置づけ
- 頻度(Q8): 規則がデータのレビュー頻度を定めていればそれに従う。なければ "determine the review frequency for the audit trail using knowledge of your processes and risk assessment tools"

出典(CSA、2026-02 版。医療機器の製造・QMS ソフトウェア向け): https://www.fda.gov/media/188844/download

- 記録に含めるもの(V.A.(6) "Establishing the Appropriate Record"): 意図された用途、リスク分析の結果、実施した保証活動の記述、見つかった問題、受け入れの結論、"Record of who performed testing/assessment and date the testing/assessment was performed"、"Established review and approval when appropriate (e.g., when necessary, a signature and date of an individual with signatory authority)"
- **デジタル記録の推奨**: "FDA recommends incorporating the use of digital records, such as system logs, audit trails, and other data generated and maintained by the software, as opposed to paper documentation, screenshots, or duplicating results already digitally retained by the software"
- 条件: "When using digital records, FDA recommends manufacturers consider the intended use and the need for accuracy, reliability, integrity, availability, and authenticity of the record"
- 同ガイダンスの例示表(電子署名機能)では、署名実行の記録に「署名者の氏名、日付と時刻、署名の意味(review, approval, responsibility, authorship)を伴う役割」を含め、"The electronic signature execution record is stored as part of the audit trail" としている

### 1.4 GitHub の PR 承認は「電子署名」の要件を満たすか

GitHub の仕様(一次情報: GitHub Docs)を Part 11 の各要件と突き合わせた結果です。

GitHub 側の事実(出典: https://docs.github.com/en/rest/pulls/reviews 、https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/dismissing-a-pull-request-review 、https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule 、https://docs.github.com/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise 、https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

- レビューオブジェクトは `user`(ログイン名)、`state`(APPROVED / CHANGES_REQUESTED / COMMENTED / DISMISSED / PENDING)、`submitted_at`、`commit_id`(レビュー対象のコミット SHA)、`body` を持つ
- "Submitted reviews cannot be deleted." 提出済みレビューは削除できない。却下(dismiss)はできるが、"you must add a comment explaining why you dismissed it" と理由の記載が必須で、却下後も状態が DISMISSED のレビューとして残る
- ブランチ保護の "Dismiss stale pull request approvals when new commits are pushed" を有効にすると、承認後にコードを変更するコミットが来れば承認は失効する。"Require approval of the most recent reviewable push" で最後にプッシュした本人以外の承認を要求できる
- 監査ログには `pull_request_review.submit` / `pull_request_review.dismiss` が記録される(2021-04 以降)。**組織・企業の監査ログの保持は 180 日**(Git イベントは 7 日)。外部へストリーミングすれば保持期間は外部側の方針で決まる。"Keep your exported audit logs and Git events data as long as you need to."
- GitHub Actions などの自動化に PR の作成・承認を許すかは設定で制御できる(許すと "could be a security risk if the pull request is merged without proper oversight")
- 署名付きコミット(GPG/SSH/S-MIME)は "Verified" と表示され、ブランチ保護で "Require signed commits" を強制できる。ただしこれはコミットの署名であり、**レビュー承認の署名ではない**
- GitHub は Part 11 の電子署名(承認時の再認証)を提供していない。GitHub Community に機能要望が立っている(https://github.com/orgs/community/discussions/64212)。同種の要望は GitLab にもあり(https://gitlab.com/gitlab-org/gitlab/-/issues/367539)、そこでは「承認時にユーザー名とパスワードを再入力」「SDLC 上の役割を選択」「API で承認記録を全件エクスポート」が要件として挙げられている

Part 11 との突合:

| Part 11 の要件 | GitHub の PR 承認 | 判定 |
| --- | --- | --- |
| 11.10(e) 安全でシステム生成・時刻印の監査証跡 | `submitted_at` をシステムが付与。提出済みレビューは削除不可。却下は理由必須で痕跡が残る | 概ね満たす。ただし**保持期間 180 日**は 11.10(e) の「対象記録と同じ期間」に届かない。ストリーミングやエクスポートで補う必要がある |
| 11.10(d)(g) 権限者だけが操作 | ブランチ保護・CODEOWNERS・SSO で制御可能 | 設定次第で満たす |
| 11.10(a) バリデーション | SaaS。組織側の意図された用途の評価が要る | 組織側の作業 |
| 11.10(j) 署名者の責任を定める書面の方針 | GitHub には存在しない | **組織側の SOP が要る** |
| 11.50(a)(1) 署名者の **printed name** | 記録に残るのはログイン名。プロフィール名は任意で変更可 | **欠ける**。ログイン名と実名の対応表を組織側で保持する必要がある |
| 11.50(a)(2) 日時 | `submitted_at` | 満たす |
| 11.50(a)(3) 署名の意味 | `state = APPROVED` は「承認」を示すが、「何に対する承認か(レビュー/承認/責任/著作)」の意味は固定ではない | **部分的**。承認の意味は組織の SOP で定義し、PR 本文かテンプレートに残す必要がある |
| 11.70 署名と記録のリンク | `commit_id` で対象を特定。却下やコミット追加で失効する設定がある。ただし force-push の制限やブランチの削除はプラットフォームの設定に依存 | 設定次第で概ね満たす。**技術的に「通常の方法で切り離せない」ことの証明は組織側のバリデーションに依存** |
| 11.100(a) 一意性 | アカウントは一意。共有アカウントや bot の承認を禁じる設定が要る | 設定次第で満たす |
| 11.100(c) FDA への証明 | 不可能(組織の行為) | **組織側の作業** |
| 11.200(a)(1) 2つの識別要素 | ログイン時に ID+パスワード(+2FA)。**承認ボタンの押下時には何も再入力しない** | **欠ける**。11.200(a)(1)(i) の「後続の署名でも少なくとも1つの要素を実行」を満たさない |
| 11.200(a)(3) 他人の利用には2名以上の共謀が要る | 端末の放置で押せる | **欠ける** |

結論: GitHub の PR 承認は **Part 11 の「監査証跡」としては強い(11.10(e))が、「電子署名」(Subpart C)としては技術要件が欠ける**。電子署名が必要な記録(基礎規則が署名を求める記録)では、別の電子署名システムか、承認時の再認証を提供するツールが要る。電子署名が不要な記録(社内の判定記録)では、PR 承認は Part 11 の電子署名要件の対象外であり、監査証跡としての価値はそのまま使える

## 2. ALCOA+(データインテグリティ原則)

### 2.1 定義の所在

- PIC/S PI 041-1 (2021-07-01) 7.5 の表(出典: https://picscheme.org/docview/4234 )。MHRA 2018 は 3.10 で「ALCOA と ALCOA+ は期待に差がない」と述べる(出典: https://assets.publishing.service.gov.uk/media/5aa2b9ede5274a3e391e37f3/MHRA_GxP_data_integrity_guide_March_edited_Final.pdf )。WHO TRS 1033 Annex 4 (2021) は用語集と Appendix 1 で紙と電子の例を示す(出典: https://cdn.who.int/media/docs/default-source/medicines/norms-and-standards/guidelines/inspections/trs1033-annex4-guideline-on-data-integrity.pdf )
- 注意: MHRA 2018 は "the guidance document does not extend to medical devices." と明記している(2.4)。医療機器は ISO 13485 / IEC 62304 / FDA QMSR の側で読む

PIC/S 7.5 の要点(原文引用):

- Attributable: "It should be possible to identify the individual or computerised system that performed a recorded task and when the task was performed. This also applies to any changes made to records, such as corrections, deletions, and changes where it is important to know who made a change, when, and why."
- Contemporaneous: "The evidence of actions, events or decisions should be recorded as they take place. This documentation should serve as an accurate attestation of what was done, or what was decided and why, i.e. what influenced the decision at that time."
- Original: "The original record can be described as the first-capture of information, whether recorded on paper (static) or electronically (usually dynamic ...). Information that is originally captured in a dynamic state should remain available in that state."
- Enduring: "they need to remain intact and accessible as an indelible/durable record throughout the record retention period."
- Available: "Records should be available for review at any time during the required retention period, accessible in a readable format to all applicable personnel"

WHO Appendix 1 Example 6 (Attributable) の紙と電子の対比:

- 紙: "the use of initials, full handwritten signature or a controlled personal seal"
- 電子: "the use of unique user logons that link the user to actions that create, modify or delete data; or unique electronic signatures ... An audit trail should capture user identification (ID), date and time stamps and the electronic signature should be securely and permanently linked to the signed record."
- Example 7 (Contemporaneous): "In the case of electronic data, these should be automatically date- and time-stamped." 紙では、代筆(scribe)は例外的にしか認められず、代筆者と実施者の双方を記録する

### 2.2 手入力文書とシステム自動記録の比較

| 属性 | 手入力の帳票(氏名・日時を人が書く) | システム自動記録(PR 承認イベント) |
| --- | --- | --- |
| Attributable | 記名は本人の申告。なりすまし・代筆を検出する仕組みが帳票にない。WHO は紙では「氏名・署名・印の見本台帳」を別途求める | 一意のアカウントに紐づく。共有アカウント・bot を禁じれば帰属が機械的に決まる。ただしログイン名と実名の対応は組織が保持する |
| Legible | 判読性は筆記に依存。電子文書なら問題は小さい | 構造化データ。API でそのまま読める |
| Contemporaneous | 日時は本人の申告。後から書ける。規制側は「紙でも電子でも後付けを防ぐ」ことを要求 | `submitted_at` をシステムが付与。後付け不可 |
| Original | 文書は上書き・差し替えが可能。版管理がなければ「最初の記録」が分からない | 提出済みレビューは削除不可。却下しても理由付きで残る |
| Accurate | 手入力の転記ミス。Annex 11 §6 は「重要データの手入力には第二者か電子的手段による追加確認」を求める | 対象(commit_id)・判定(state)・日時はシステムが機械的に決める。**判定理由(Reason)はレビュー本文に人が書く**ため、ここは手入力と同じ弱さを持つ |
| Complete | 誰が何を見て決めたかが帳票に書かれていなければ再構成できない | コメント・差分・CI 結果・却下の履歴が同じ場所に残る。ただし**設計上の判断理由は自動では残らない** |
| Consistent | 日付形式・氏名表記のばらつき | 一定(ISO 8601、ログイン名) |
| Enduring | ファイルサーバ・紙の保管に依存 | **監査ログは 180 日**。レビュー自体はリポジトリが存在する限り残るが、リポジトリの削除・移管・ベンダの事業継続に依存する。保持期間の担保は組織側の仕組みが要る |
| Available | 検索性は保管方法に依存 | API・エクスポート・ストリーミングで取り出せる。**取り出した先の形式(PDF/JSON)が人に読めることを示す必要がある**(Part 11 11.10(b)、Annex 11 §8) |

含意: ALCOA+ の 9 属性のうち、システム自動記録は Attributable / Contemporaneous / Original / Consistent / Available で明確に優位。Enduring は条件付き(保持の仕組みが要る)。**Accurate と Complete のうち「判定理由」はどちらでも人が書く**ので、ここは記録の様式の問題であり媒体の問題ではない

## 3. ISO 13485 / IEC 62304 / ISO/IEC/IEEE 12207・15289

### 3.1 ISO 13485:2016(出典: https://dms.csoftintl.com/wp-content/uploads/2018/01/ISO-13485-2016-EN.pdf 、法定組み込み版 https://law.resource.org/pub/us/cfr/ibr/inc/iso/iso.13485.2016.pdf )

- 4.2.4 文書管理: 手順で "a) review and approve documents for adequacy prior to issue; b) review, update as necessary and re-approve documents; c) ensure that the current revision status of and changes to documents are identified; ... h) prevent the unintended use of obsolete documents" を定める
- 4.2.5 記録管理: "Records shall be maintained to provide evidence of conformity to requirements and of the effective operation of the quality management system." 管理対象は "identification, storage, security and integrity, retrieval, retention time and disposition of records"。**"Records shall remain legible, readily identifiable and retrievable. Changes to a record shall remain identifiable."** 保持は機器の寿命以上かつ出荷から 2 年以上
- 7.3.5 設計開発レビュー(依頼では 7.3.4 とあったが、2016 年版では **7.3.5** がレビュー。7.3.4 は設計開発アウトプット): "Records of the results of the reviews and any necessary actions shall be maintained and include **the identification of the design under review, the participants involved and the date of the review** (see 4.2.5)." 参加者は "representatives of functions concerned with the design and development stage being reviewed, as well as other specialist personnel"
- 7.3.9 設計開発変更: "Before implementation, the changes shall be: a) reviewed; b) verified; c) validated, as appropriate; d) approved." "Records of changes, their review and any necessary actions shall be maintained (see 4.2.5)."
- 7.3.10 設計開発ファイル: "This file shall include or reference records generated to demonstrate conformity"(include **or reference** = 参照でよい)
- 含意: ISO 13485 は、記録に「対象・参加者・日付・結果・処置」を求めるが、**記録の媒体や様式(帳票か、システムの記録か)は指定しない**。「変更が識別できること」(4.2.5)は、監査証跡を持つシステムのほうが満たしやすい。参考: FDA QSR 820.30(e) は「設計段階に直接責任を持たない者」をレビュー参加者に含めることと、設計履歴ファイルへの「設計の識別・日付・レビュー実施者」の記録を求めていた(FDA QMSR への移行後は ISO 13485 を引用。二次出典: https://www.designcontrolconsultant.com?page_id=1066 )

### 3.2 IEC 62304:2006+AMD1:2015(出典: 統合版 PDF https://po-files.ks3-cn-beijing.ksyun.com/5f445d6af346fb3c83c3de37_6a3c46d361fc.pdf )

- 8.2.1 変更要求の承認: "The MANUFACTURER shall change CONFIGURATION ITEMS identified to be controlled according to 8.1 only in response to an approved CHANGE REQUEST. [Class A, B, C]" NOTE 1: "This subclause only requires that approval of a change precede its implementation."
- 8.2.4 変更の追跡性: "maintain records of the relationships and dependencies between: a) CHANGE REQUEST; b) relevant PROBLEM REPORT; and c) approval of the CHANGE REQUEST"
- 8.3 構成状態の記録: "retain retrievable records of the history of controlled CONFIGURATION ITEMS including SYSTEM configuration."
- 9.5 記録の維持: "maintain records of PROBLEM REPORTS and their resolution including their VERIFICATION."
- **附属書 B.8.2(根拠説明)**: "CHANGE REQUESTS can be approved by a change control board or by a manager or technical lead according to the software configuration management plan. ... The requirement is that each actual change be linked to a CHANGE REQUEST and that documentation exists to show that the CHANGE REQUEST was approved. **The documentation might be change control board minutes, an approval signature, or a record in a database.**"
- B.8.3: 構成状態の記録は "necessary to determine when and why changes were made"
- 含意: IEC 62304 は「承認が実装に先行すること」「変更・問題報告・承認が相互に辿れること」を求め、**承認の証拠はデータベースの記録でよい**と明記する。PR(変更要求)→ Issue(問題報告)→ 承認レビューの連鎖は、この要求に対応する構造である。ただし「なぜ(why)」は 8.3 の趣旨に含まれる

### 3.3 ISO/IEC/IEEE 15289:2019 / 12207:2017(出典: 15289 プレビュー https://cdn.standards.iteh.ai/samples/74909/24359dd8f7184f7dbec19eed52a9e9ad/ISO-IEC-IEEE-15289-2019.pdf )

- 3.1.10 document: "uniquely identified unit of information for human use"
- 3.1.12 information item: "separately identifiable body of information that is produced, stored, and delivered for human use"
- 3.1.21 record: "set of related data items treated as a unit"
- 3.1.22 report: "information item that describes the results of activities such as investigations, observations, assessments, or tests"
- 適合の条件(5.1): "each information item is described as if it were published as a separate document. However, **information items shall be considered as conforming if they are unpublished but available in a repository for reference**, divided into separate documents or volumes, or combined with other information items into one document."
- 6.2 "Records compared to information items (documents)" と 6.3 "Management of life-cycle data (records)" の本文は**プレビュー外で未確認**(目次で存在は確認)
- 12207:2017 本文も未確認。15289 は 12207:2017 の各条項が求める記録を一覧化している(15289 の序文)
- 含意: ISO/IEC/IEEE 系の規格は、**「文書」を作ることを要求していない**。記録(record)はデータ項目の集合であり、リポジトリにあって参照できれば適合する

## 4. 機能安全規格の confirmation review / 独立評価の記録

### 4.1 IEC 61508-1(出典: 注釈付き版 https://www.alekvs.com/wp-content/uploads/2025/06/IEC_61508_Commented_Version.pdf 、1998 年版 https://law.resource.org/pub/in/bis/S05/is.iec.61508.1.1998.pdf )

- 文書要件(5.2): "5.2.9 The documents or set of information shall have a revision index (version numbers) to make it possible to identify different versions of the document." "5.2.10 ... It shall be possible to identify the latest revision (version) of a document or set of information." "5.2.11 All relevant documents shall be revised, amended, reviewed and approved under an appropriate document control scheme." NOTE: 自動ツールで文書を生成する場合は版管理の手順が要る
- 機能安全アセスメントの成果(8.2.10): "At the conclusion of the functional safety assessment, recommendations shall be produced for acceptance, qualified acceptance or rejection."
- 独立性(8.2.12 以降、Table 4・5): independent person / independent department / independent organization の 3 段階。結果の重大度(Table 4)または SIL(Table 5)が上がるほど高い独立性が要求される。SIL 1 は independent person、SIL 4 は independent organization が最低水準。各レベルの定義は IEC 61508-4 の 3.8.11〜3.8.13(本文未確認)
- 含意: 61508 は「記録」より「文書(document or set of information)」の語を使うが、**"set of information" を文書と同格に扱い**、版の識別と最新版の特定、承認を求める。評価の記録に求めるのは「受け入れ/条件付き受け入れ/却下」の判定である

### 4.2 ISO 26262:2018(原文は有償で **未確認**。以下は二次出典)

- 確認手段(confirmation measures)の独立性レベル(ISO 26262-2:2018 6.4.9 Table 1)は I0〜I3。二次出典 https://www.quidditytech.io/post/confirmation-vs-verification-review の引用: "I1: ... by a different person in relation to the person(s) responsible for the creation of the considered work product(s)" "I2: ... by a person who is independent from the team ..., i.e. by a person not reporting to the same direct superior" "I3: ... independent from the department"
- 検証レビュー(ISO 26262-8:2018 9 節)は作成者と別の人が行う(同上の二次出典は "9.4.3.2" を引く)。検証の成果物は verification plan / verification specification / verification report(目次で確認。本文は未確認)
- Phil Koopman は、I0〜I3 が「組織図上の独立」にとどまり、報酬・納期などの利害からの独立を扱っていないと指摘する(https://philkoopman.substack.com/p/independence-and-safety )
- 含意: 26262 が求めるのは「誰が(どの独立性レベルの人が)・どの成果物を・どう判定したか」である。記録の媒体は規定しない。独立性の証明には**レビュー者の所属・指揮系統**を記録に残す必要があり、これは GitHub のログイン名だけでは分からない

## 5. GAMP 5 第2版(2022)の critical thinking と記録の扱い

出典: ISPE Pharmaceutical Engineering 2023-01/02 "What You Need to Know About GAMP 5 Guide, 2nd Edition" https://ispe.org/pharmaceutical-engineering/january-february-2023/what-you-need-know-about-gampr-5-guide-2nd-edition 、ISPE 製品ページ https://ispe.org/publications/guidance-documents/gamp-5-guide-2nd-edition 。ガイド本文は有償で**未確認**

- 第2版は "encourages the maintenance of records and information in appropriate and effective software tools" と述べ、"moving from traditional paper formats to searchable tool-based information life cycles" を促す
- "records and information are maintained because they are valuable to the regulated company as their source of truth, and not necessarily for demonstrating to a third party"
- "Modern approaches may rely on records, information, and artifacts in automated tools in place of formal specification and test documentation"
- Appendix M12(Critical Thinking)は、テンプレート化されたチェックリストではなく SME の判断で保証活動を設計することを求める。Appendix D8(Agile)は "does not advocate modifying Agile for GxP"。Appendix D9(Software Tools)は開発・運用ツール(GxP 記録を直接は保持しないツール)のリスクベースの扱いを示す
- ISPE GAMP Records and Data Integrity Guide (2017) の Appendix M4 が "Data Audit Trail and Audit Trail Review" を扱う(出典: https://ispe.org/publications/guidance-documents/gamp-records-pharmaceutical-data-integrity 。本文未確認)
- 含意: GAMP 5 第2版の立場は「記録を文書(document)に書き起こす必要はなく、ツール上の記録(record)でよい」である。これは FDA CSA(1.3)と同じ方向である。ただし D9 の注記のとおり、**ツール自体が GxP 記録の保管庫になるなら、そのツールは GxP システムとして評価の対象になる**

## 6. MHRA / PIC/S / WHO / EU Annex 11 の監査証跡レビュー要件

### 6.1 MHRA GxP Data Integrity Guidance (2018-03)

- 6.13 監査証跡の定義: "An audit trail facilitates the reconstruction of the history of such events relating to the record regardless of its medium, including the **'who, what, when and why'** of the action."
- "It should be possible to associate all data and changes to data with the persons making those changes, and changes should be dated and time stamped (time and time zone where applicable). **The reason for any change, should also be recorded.**"
- "Users should not be able to amend or switch off the audit trail. Where a system administrator amends, or switches off the audit trail a record of that action should be retained."
- "It is not necessary for audit trail review to include every system activity (e.g. user log on/off, keystrokes etc.)."
- 6.14 電子署名: "E-signature systems must provide for 'signature manifestations' i.e. a display within the viewable record that defines who signed it, their title, and the date (and time, if significant) and the meaning of the signature (e.g. verified or approved)." "An inserted image of a signature or a footnote indicating that the document has been electronically signed ... is not adequate."
- 6.15 データレビューと承認: "Data review should be documented and the record should include **a positive statement regarding whether issues were found or not, the date that review was performed and the signature of the reviewer.**"
- 6.16: "shared logins or generic user access should not be used." "Increased data review is likely to be required for hybrid systems because they are vulnerable to non-attributable data changes."

### 6.2 PIC/S PI 041-1 (2021-07-01)

- 9.6 監査証跡: "Audit trail functionalities should be enabled and locked at all times and it should not be possible to deactivate, delete or modify the functionality." 監査証跡の項目: "details of the user that undertook the action; what action occurred, was changed, incl. old and new values; when the action was taken, incl. date and time; why the action was taken (reason); and in the case of changes or modifications to data, the name of any person authorising the change."
- "The system should be able to print and provide an electronic copy of the audit trail, and whether viewing in the system online or in a hardcopy, the audit trail should be available in a meaningful format."
- "Note: An audit trail should not be confused with a change control system where changes may needed to appropriately controlled and approved"(監査証跡と変更管理は別物)
- 重要な監査証跡は "independently reviewed with all other records related to the operation and prior to ... completion of the operation (e.g. prior to batch release)"。"This review should be performed by the originating department, and where necessary verified by the quality unit"
- 9.8 データレビュー: "The review of audit trails should be part of the routine data review within the approval process." "The audit trail review activity should be documented and recorded." "Audit trail reviews should be both random ... and targeted"
- 電子署名(9.5 項目 4): "Electronic signatures should be permanently linked to their respective record, i.e. if a later change is made to a signed record; the record should indicate the amendment and appear as unsigned." "electronic signature functionality should automatically log the date and time when a signature was applied." チェック項目: "Any changes to data after an electronic signature has been assigned should invalidate the signature until the data has been reviewed again and re-signed."
- 8.8 紙の記録の二次確認: 重要工程の記録は "reviewed/witnessed by independent and designated personnel at the time of operations occurring" かつ "signed or initialled and dated by the appropriate persons"
- 9.10 ハイブリッドシステム: "the use of hybrid systems is discouraged and such systems should be replaced whenever possible."

### 6.3 WHO TRS 1033 Annex 4 (2021)

- 11.10: 監査証跡は "users, dates, times, original data and results, changes and reasons for changes ..., and enabling and disenabling of audit trails" を反映する
- 11.13: 電子署名は "attributable to an individual; free from alteration and manipulation; be permanently linked to their respective record; and date- and time-stamped"
- 11.14: "An inserted image of a signature or a footnote indicating that the document has been electronically signed is not adequate unless it was created as part of the validated electronic signature process."
- 12.5〜12.6: "Evidence of the review should be maintained." "A conclusion, where required, following the review of original data, metadata and audit trail records should be documented, signed and dated."

### 6.4 EU GMP Annex 11 (2011)(出典: https://health.ec.europa.eu/system/files/2016-11/annex11_01-2011_en_0.pdf )

- 原則: "Where a computerised system replaces a manual operation, there should be no resultant decrease in product quality, process control or quality assurance."
- §9 監査証跡: "Consideration should be given, based on a risk assessment, to building into the system the creation of a record of all GMP-relevant changes and deletions (a system generated 'audit trail'). For change or deletion of GMP-relevant data the reason should be documented. Audit trails need to be available and convertible to a generally intelligible form and regularly reviewed."
- §12.4: "Management systems for data and for documents should be designed to record the identity of operators entering, changing, confirming or deleting data including date and time."
- §14 電子署名: "a. have the same impact as hand-written signatures within the boundaries of the company, b. be permanently linked to their respective record, c. include the time and date that they were applied."
- §8.2: "For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry."

### 6.5 日本: 厚生労働省 ER/ES 指針(薬食発第0401022号、2005-04-01)(出典: https://www.mhlw.go.jp/web/t_doc?dataId=00ta8216&dataType=1&pageNo=1 )

- 3.1.1 真正性: 「電磁的記録が完全、正確であり、かつ信頼できるとともに、作成、変更、削除の責任の所在が明確であること。」
- 監査証跡: 「保存情報の作成者が明確に識別できること。」「一旦保存された情報を変更する場合は、変更前の情報も保存されるとともに、変更者が明確に識別できること。」「監査証跡が自動的に記録され、記録された監査証跡は予め定められた手順で確認できることが望ましい。」用語定義: 「正確なタイム・スタンプ(コンピュータが自動的に刻印する日時)が付けられた一連の操作記録。」
- 4 電子署名: 署名された電磁的記録には「署名者の氏名」「署名が行われた日時」「署名の意味(作成、確認、承認等)」を明示する情報を含める。「通常の方法では削除・コピー等ができないように、対応する各々の電磁的記録とリンクしていること。」
- 適用範囲の解釈(製薬協「ER/ES 指針の解説」 https://www.jpma.or.jp/information/evaluation/results/allotment/lofurc000000b4lc-att/eres_concept_01.pdf ): 「単なる社内的記録に対する承認行為等、そもそも法令等の規定では署名等を求められていない行為については、たとえその行為に電子署名という名称が付けられていても、ER/ES 指針の対象ではない」。また「書面及び手書き署名を用いた作業プロセスを電磁的記録や電子署名を用いた作業プロセスに置き換える場合、当該作業プロセスにおける(真正性、見読性、保存性等に関する)品質や品質保証のレベルが低下しないこと」が判断基準

## 7. 結論

### 7.1 規格・規制が記録に求めるもの

- **Who**: 記録した個人(または計算機システム)が一意に識別できること。共有アカウントは不可(MHRA 6.16、Part 11 11.100(a)、ER/ES 3.1.1)
- **When**: 行為の時点で、**システムが自動で**日時を付けること(Part 11 11.10(e)、Annex 11 §12.4、WHO Example 7、ER/ES 用語定義)。紙でも「その場で記す」ことを求め、後付けを防ぐ仕組み(第二者の立会い、連番台帳)を要求する(PIC/S 8.8)
- **What**: 何に対する行為か。署名・承認は対象の記録と恒久的にリンクし、対象が変われば失効する(Part 11 11.70、PIC/S 9.5、Annex 11 §14b)
- **Outcome**: 判定の結果と意味。「レビュー・承認・責任・著作」のどれか(Part 11 11.50(a)(3)、MHRA 6.14、ER/ES 4(3))。機能安全では「受け入れ・条件付き受け入れ・却下」(61508-1 8.2.10)。データレビューでは「問題があったか否かの明示」(MHRA 6.15)
- **Reason**: 変更・削除の理由(MHRA 6.13、PIC/S 9.6、Annex 11 §9、WHO 11.10)。判定の根拠「何がその決定に影響したか」(PIC/S 7.5 Contemporaneous)
- **改変不能**: 変更は元の記録を覆い隠さない(Part 11 11.10(e))。変更は識別できる(ISO 13485 4.2.5)。監査証跡は利用者が止められない(MHRA 6.13、PIC/S 9.6)
- **保持と取り出し**: 対象記録と同じ期間保持し(Part 11 11.10(e))、人が読める形と電子形式の両方で取り出せる(11.10(b)、Annex 11 §8、PIC/S 9.6)
- **レビューの記録**: 監査証跡のレビュー自体を記録し、レビュー者の署名と日付、問題の有無を残す(MHRA 6.15、PIC/S 9.8、WHO 12.6)
- **独立性**: 安全重要度に応じて、作成者と別の人・別のチーム・別の組織(ISO 26262 I1〜I3、IEC 61508 Table 4・5)。ISO 13485 は「関係部門の代表と専門家」の参加を求める

### 7.2 規格・規制が求めていないもの

- **「文書(document)」という形式**。ISO/IEC/IEEE 15289 はリポジトリ上の情報項目で適合とし、IEC 62304 B.8.2 は承認の証拠として「データベースの記録」を許容し、GAMP 5 第2版と FDA CSA はツール上の記録を推奨する
- **手書き署名の電子的な模倣**。署名の画像の貼り付けや「電子署名済み」の脚注は不十分(MHRA 6.14、WHO 11.14)
- **すべての判定への電子署名**。Part 11 の電子署名要件は、基礎規則が署名を求める記録にだけ掛かる(FDA 2003、製薬協解説)
- **すべてのシステム活動のレビュー**。ログオン・キー操作などは不要(MHRA 6.13)。リスクに応じて対象を絞る(PIC/S 9.6、FDA Q8)
- **紙か電子かの指定**。ALCOA+ は両方に同じ期待を置く(PIC/S 7.5 表題、WHO 1.2)

### 7.3 手入力の帳票が保証しないもの

- **帰属(Attributable)**: 記名が本人によるものであることを帳票自体は示さない。規制側は紙でも「署名・印の見本台帳」や「独立の立会い」を別途求める(WHO Example 7、PIC/S 8.8)
- **同時性(Contemporaneous)**: 日時は申告値。後から書ける。「後付けでない」ことの証明は帳票の外にある
- **原本性(Original)・改変不能**: 版管理と監査証跡がなければ、差し替え・上書きを検出できない。「書き込み保護・版管理・監査証跡のないファイル」は ALCOA+ 違反として扱われる(PIC/S PI 041-1 の趣旨。二次出典 https://theentourage.us/en/expertise/data-integrity-assurance )
- **対象とのリンク**: 帳票に書かれた「対象」(例: コミット SHA)が実際に承認した対象と一致する保証がない。対象が変わっても帳票は失効しない
- **独立性**: 氏名だけでは、作成者と判定者の指揮系統の分離を示せない(これはシステム記録でも同じ)
- 一方で、帳票が優れるのは「判定理由・考慮した観点・採らなかった選択肢」を自由に書ける点だけであり、これはシステム記録のコメント欄でも同じことができる

### 7.4 システムの自動記録を「記録」と認める条件

- **保持期間**: 対象の記録(製品・案件)と同じ期間、取り出せる状態で残すこと(Part 11 11.10(e)、ISO 13485 4.2.5)。GitHub の監査ログは 180 日しか残らないため、**ストリーミングまたは定期エクスポートで組織側の保管庫へ移す**仕組みが要る。レビューイベント自体はリポジトリに残るが、リポジトリの削除・移管・ベンダの事業継続のリスクを扱う
- **エクスポート**: 人が読める形式と電子形式の両方で、監査証跡を含めて取り出せること(Part 11 11.10(b)、Annex 11 §8、PIC/S 9.6)。取り出した結果が「真正な複製」であること(MHRA 6.11.2 true copy)
- **改変不能**: 提出済みの承認は削除できず、却下は理由付きで残ること(GitHub は満たす)。force-push・ブランチ削除・履歴改変をブランチ保護で禁じること。管理者が保護を外した事実が監査ログに残ること
- **帰属**: 一意のアカウント、共有アカウント禁止、bot・自動化による承認の禁止または明示、SSO/2FA。**ログイン名と実名・所属の対応表**を組織側で保持すること(11.50 の printed name、ISO 26262 の独立性の証明)
- **署名の意味の表示**: 「承認」が何を意味するか(どのゲートの、どの観点の判定か)を SOP で定義し、PR テンプレートまたはレビュー本文に残すこと。`state = APPROVED` だけでは「意味」にならない
- **対象とのリンク**: `commit_id` で対象を固定し、承認後のコミット追加で承認を失効させる設定(Dismiss stale approvals)を有効にすること。最後にプッシュした本人の承認を無効にする設定(Require approval of the most recent reviewable push)
- **理由の記録**: 変更の理由(なぜ)と判定の根拠を、人が書く欄(PR 本文・レビュー本文)に残すこと。これは自動では残らない
- **レビューの記録**: 監査証跡そのもののレビュー(例: 保護の変更、bypass の発生、却下の理由)を定期的に行い、レビュー者・日付・問題の有無を記録すること(MHRA 6.15、PIC/S 9.8)
- **ツールの評価**: 記録の保管庫として使うなら、そのツールを意図された用途に対して評価すること(Part 11 11.10(a)、Annex 11 §4、GAMP 5 D9、FDA CSA)
- **電子署名が要る記録には別の手段**: 基礎規則が署名を求める記録(例: 設計アウトプットの承認、出荷判定)では、承認時の再認証・氏名・意味・リンクを備えた電子署名システムを用いるか、PR 承認を電子署名とみなす旨を SOP で定義した上で欠落要件を補う(GitLab の要望 #367539 が示す「承認時のパスワード再入力・役割の選択・API エクスポート」が最小の補完)

### 7.5 本標準への含意(議論の材料。採否は会議体で決める)

- 「帳票に氏名と日時を手で書く」様式は、規制の観点では**弱い側**である。本標準が帳票を求めるなら、その理由は「判定理由と観点を書く場所」としてであり、「誰がいつ」の証拠としてではない
- 「誰がいつ何を」はシステムの記録に任せ、「なぜ・何を見て・何を採らなかったか」を人が書く、という**役割分担**が、規制・規格の要求と最も整合する
- ただし、システムの記録を「記録」として認めるには 7.4 の条件(保持・取り出し・改変不能・帰属表・意味の定義)を本標準側で規定する必要がある。これがなければ「GitHub にある」は記録の証拠にならない
- 既存の `phase5-implementation/qms-document-control.md` は「署名済みコミットは規制領域の電子署名要件を自動的に満たさない」と述べており、本調査の結論と矛盾しない。PR 承認についても同じ注意書きが要る

## 8. 未確認事項

- ISO 26262-2:2018 6.4.9〜6.4.10、ISO 26262-8:2018 9 節の原文(有償。二次出典のみ)
- IEC 61508-4 3.8.11〜3.8.13(independent person / department / organization の定義)の原文
- ISO/IEC/IEEE 15289:2019 6.2「Records compared to information items (documents)」・6.3 の本文、ISO/IEC/IEEE 12207:2017 本文
- GAMP 5 第2版の本文(Appendix M12 / D8 / D9)、GAMP RDI Guide Appendix M4 の本文(ISPE の記事と製品ページからの要約にとどまる)
- FDA QMSR(2026-02-02 施行)下で、設計レビューの「設計段階に直接責任を持たない者」の参加要件(旧 820.30(e))がどう扱われるか
- GitHub のレビューオブジェクトの `state` 値の正式な列挙(REST API ページには値の一覧が載っていない。GraphQL の `PullRequestReviewState` で確認する必要がある)
- GitHub Enterprise Server(オンプレミス)での監査ログ保持期間(本調査は GitHub.com / Enterprise Cloud のドキュメントを参照した)

## 9. 出典一覧

一次資料:

- 21 CFR Part 11(LII eCFR): https://www.law.cornell.edu/cfr/text/21/part-11
- FDA, Part 11 Scope and Application (2003): https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application
- FDA, Data Integrity and Compliance With Drug CGMP: Q&A (2018-12): https://www.fda.gov/media/119267/download
- FDA, Computer Software Assurance for Production and Quality Management System Software (2026-02): https://www.fda.gov/media/188844/download
- MHRA, GxP Data Integrity Guidance and Definitions, Rev.1 (2018-03): https://assets.publishing.service.gov.uk/media/5aa2b9ede5274a3e391e37f3/MHRA_GxP_data_integrity_guide_March_edited_Final.pdf
- PIC/S PI 041-1, Good Practices for Data Management and Integrity in Regulated GMP/GDP Environments (2021-07-01): https://picscheme.org/docview/4234
- WHO TRS 1033 Annex 4, Guideline on data integrity (2021): https://cdn.who.int/media/docs/default-source/medicines/norms-and-standards/guidelines/inspections/trs1033-annex4-guideline-on-data-integrity.pdf
- EU GMP Annex 11 Computerised Systems (2011): https://health.ec.europa.eu/system/files/2016-11/annex11_01-2011_en_0.pdf
- ISO 13485:2016 本文(法定組み込み版): https://law.resource.org/pub/us/cfr/ibr/inc/iso/iso.13485.2016.pdf (テキスト抽出用: https://dms.csoftintl.com/wp-content/uploads/2018/01/ISO-13485-2016-EN.pdf )
- IEC 62304:2006+AMD1:2015 CSV: https://po-files.ks3-cn-beijing.ksyun.com/5f445d6af346fb3c83c3de37_6a3c46d361fc.pdf
- ISO/IEC/IEEE 15289:2019 プレビュー: https://cdn.standards.iteh.ai/samples/74909/24359dd8f7184f7dbec19eed52a9e9ad/ISO-IEC-IEEE-15289-2019.pdf
- IEC 61508-1 注釈付き版: https://www.alekvs.com/wp-content/uploads/2025/06/IEC_61508_Commented_Version.pdf 、IS/IEC 61508-1 (1998): https://law.resource.org/pub/in/bis/S05/is.iec.61508.1.1998.pdf
- 厚生労働省 ER/ES 指針(薬食発第0401022号): https://www.mhlw.go.jp/web/t_doc?dataId=00ta8216&dataType=1&pageNo=1
- GitHub Docs — Reviews REST API: https://docs.github.com/en/rest/pulls/reviews
- GitHub Docs — Dismissing a pull request review: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/dismissing-a-pull-request-review
- GitHub Docs — Managing a branch protection rule: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- GitHub Docs — Reviewing the audit log for your organization(180 日): https://docs.github.com/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization
- GitHub Docs — Streaming the audit log: https://docs.github.com/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/streaming-the-audit-log-for-your-enterprise
- GitHub Docs — Audit log events(pull_request_review.submit / dismiss): https://docs.github.com/github-ae@latest/admin/monitoring-activity-in-your-enterprise/reviewing-audit-logs-for-your-enterprise/audit-log-events-for-your-enterprise
- GitHub Changelog — Pull request events now included in the audit log (2021-04-21): https://github.blog/changelog/2021-04-21-pull-request-events-now-included-in-the-audit-log
- GitHub Docs — About commit signature verification: https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
- GitHub Docs — Secure use reference(Actions による PR 承認の制御): https://docs.github.com/en/enterprise-cloud@latest/actions/reference/security/secure-use
- ISPE, What You Need to Know About GAMP 5 Guide, 2nd Edition (2023): https://ispe.org/pharmaceutical-engineering/january-february-2023/what-you-need-know-about-gampr-5-guide-2nd-edition
- ISPE, GAMP 5 Guide 2nd Edition 製品ページ: https://ispe.org/publications/guidance-documents/gamp-5-guide-2nd-edition
- ISPE, GAMP Guide: Records and Data Integrity 製品ページ: https://ispe.org/publications/guidance-documents/gamp-records-pharmaceutical-data-integrity

二次資料・業界の議論:

- GitHub Community, "Provide mechanism to execute electronic signatures on approval": https://github.com/orgs/community/discussions/64212
- GitLab Issue #367539, "Regulated e-signature approvals for Merge Requests (CFR part 11)": https://gitlab.com/gitlab-org/gitlab/-/issues/367539
- IntuitionLabs, Git Version Control for FDA and IEC 62304 Compliance: https://intuitionlabs.ai/articles/git-workflows-fda-compliance
- Quiddity Tech, Difference between Confirmation and Verification Review(ISO 26262 I0〜I3 の引用): https://www.quidditytech.io/post/confirmation-vs-verification-review
- Phil Koopman, Independence and Safety: https://philkoopman.substack.com/p/independence-and-safety
- 日本製薬工業協会「ER/ES 指針の解説」(JPMA_EI_TF4 v4.0, 2020): https://www.jpma.or.jp/information/evaluation/results/allotment/lofurc000000b4lc-att/eres_concept_01.pdf
- 日本規格協会「第6章 医薬 GxP 分野における電子記録・電子署名」: https://www.jsa.or.jp/datas/media/10000/md_2508.pdf
- 日本 CRO 協会 改訂版「ER/ES 指針の解説」(2024): https://www.jcroa.or.jp/wp-content/uploads/2024/06/ER-ES_Rev1.pdf
- Design Control Consultant, FDA Design Controls 21 CFR 820.30 vs ISO 13485 7.3: https://www.designcontrolconsultant.com?page_id=1066
- Entourage, Data Integrity: ALCOA+ for Life Sciences: https://theentourage.us/en/expertise/data-integrity-assurance
