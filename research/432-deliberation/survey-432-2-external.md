# #432 論点2・#433(重の部分) 外部の調査 — 決定者の自己に関わる変更と職務の分離

- 調査時点: 2026-11-11
- 審議の重さ: 重
- 担当: 外部の調査(process-researcher)
- 対象: 体制の決定者(D-0 表1 の決定者)が、自分に関わる変更(自分が当事者になる兼務の決定/自分の名簿の行の表記の変更)を自分の記名で決められる点。1〜2名の体制では、ほかに決められる人がいないことがある

凡例

- 【原文確認】 = 一次情報の原文を、この調査で取得して読んだ
- 【二次】 = 解説・ベンダー記事など二次情報による。原文は未確認
- 【推測】 = 調査者の解釈。事実ではない

---

## 1. 出典ごとの記録

### S1. COSO『Internal Control — Integrated Framework, Executive Summary』(2013-05)【原文確認】

- URL: https://www.coso.org/_files/ugd/3059fc_1df7d5dd38074006bce8fdf621a942cf.pdf
- 取得日: 2026-11-11
- 原文の引用
  - p.2: "The Framework applies to all entities: large, mid-size, small, for-profit and not-for-profit, and government bodies. However, each organization may choose to implement internal control differently. For instance, a smaller entity's system of internal control may be less formal and less structured, yet still have effective internal control."
  - p.4(Control Activities): "Segregation of duties is typically built into the selection and development of control activities. Where segregation of duties is not practical, management selects and develops alternative control activities."
  - p.9(Limitations): "Ability of management to override internal control" / "Ability of management, other personnel, and/or third parties to circumvent controls through collusion"
  - p.1 脚注1: "The Framework uses the term "board of directors," which encompasses the governing body, including board, board of trustees, general partners, owner, or supervisory board."
- 示唆
  - 職務の分離が実際的でない場合に、分離を免除して終わりにせず「代わりの統制活動(alternative control activities)を選び、作る」ことを経営者に求める構造である
  - 経営者による無効化(management override)を、内部統制の固有の限界として明記している。決定者が自分に関わる変更を決める状況は、この限界そのものに当たる【推測】
  - 小規模の事業体でも「形式が少なくても有効」は認めるが、代わりの統制なしでよいとは書いていない
- 未確認: 本体(Framework and Appendices)の原則10 の着眼点(points of focus)にある "Addresses segregation of duties" の詳細文、および 2006 年の小規模公開企業向けガイダンス(Internal Control over Financial Reporting — Guidance for Smaller Public Companies)の原文は取得できていない(有償)

### S2. NIST SP 800-53 Rev.5 AC-5 Separation of Duties【原文確認(転載サイト経由)】

- URL: https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-5/ (NIST 原典: https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)
- 取得日: 2026-11-11
- 原文の引用
  - 統制: "a. Identify and document [Assignment: organization-defined duties of individuals]; and b. Define system access authorizations to support separation of duties."
  - 解説: "Separation of duties addresses the potential for abuse of authorized privileges and helps to reduce the risk of malevolent activity without collusion."
  - 解説: "ensuring that security personnel who administer access control functions do not also administer audit functions"
  - 解説: "Separation of duties is enforced through the account management activities in AC-2, access control mechanisms in AC-3, and identity management activities in IA-2, IA-4, and IA-12."
  - OT オーバーレイの補足: "Example compensating controls include providing increased personnel security and auditing." / "The organization carefully considers the appropriateness of a single individual performing multiple critical roles."
- 示唆
  - AC-5 は「誰のどの職務を分けるか」を組織が定義する形(organization-defined)で、人数の下限は定めない
  - 「アクセス制御を管理する者が監査機能も管理しない」という例は、権限を変える者とその記録を確かめる者を分ける考え方である。決定者が自分の名簿の行を変える場面に対応する【推測】
  - 単独者が複数の重要な役割を担うことは禁止ではなく「適切さを慎重に検討する」対象で、代償の統制の例として人的セキュリティの強化と監査を挙げる(OT オーバーレイ)
- 注意: 転載サイトの表示。原典 PDF との逐語一致は未照合。OT オーバーレイの文は SP 800-82 側の補足で、AC-5 本体の文ではない

### S3. Microsoft Learn『Approve or deny requests for Microsoft Entra roles in PIM』(ms.date 2026-04-23)【原文確認】

- URL: https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-approval-workflow
- 取得日: 2026-11-11
- 原文の引用
  - "Approvers aren't able to approve their own role activation requests. Additionally, service principals aren't allowed to approve requests."
  - "Requests are resolved by the first approver who approves or denies."
  - "Global Administrators and Privileged Role Administrators are notified when an approved user becomes active in their role."
  - "A Global Administrator or Privileged Role Admin who believes that an approved user shouldn't be active can remove the active role assignment in Privileged Identity Management."
- 示唆
  - 自己承認の禁止は設定項目ではなく、製品の仕様として固定されている(承認者が自分の要求を承認できない)
  - 例外の経路は「承認なしの設定にする」ことで、その場合も有効化は特権管理者へ通知され、事後に取り消せる。予防(自己承認の禁止)と発見(通知・事後の取消し)を組み合わせた型である
  - 二次情報(CIS Microsoft 365 Foundations Benchmark 5.3.4、Tenable 掲載)は Global Administrator の有効化に承認を要求し、承認者を複数置くことを推奨する。承認者が要求者だけだと要求が滞留する、という実務報告がある【二次】
    - https://www.tenable.com/audits/items/CIS_Microsoft_365_Foundations_v5.0.0_L1_E5.audit:326efd8556245699eac38da2642beb5b
    - https://learn.microsoft.com/en-us/answers/questions/5543697/error-request-doesnt-allow-self-approval-while-get

### S4. Okta Support『Access Request Expected Reviewer Self-Attestation Behavior』(Last Updated: 2025-09-18)【原文確認】

- URL: https://support.okta.com/help/s/article/access-request-expected-reviewer-self-attestation-behavior
- 取得日: 2026-11-11
- 原文の引用
  - 委任による承認者: "Self-attestation is blocked." / "If the delegated approver is the same as the requester, the approval task will be left unassigned."
  - 明示の承認者: "When using explicitly defined assignment options, self-attestation is allowed" ... "if the Requester and the defined user as the Approver are the same."
- 示唆
  - Okta では、承認者を委任(上長など)で決める場合は自己承認を止め、タスクを未割当てのまま残す(=通さず、別の人へ回す)。承認者を特定の利用者として明示した場合は、要求者と同一でも自己承認を許す
  - つまり「自己承認を許すか」は、承認者を誰と定めたかという設定側の選択に依存する。明示の指名は、組織が自己承認を受け入れたと読める設計である【推測】
  - コミュニティ投稿では、承認者を Group Owner とした場合に自己承認が起きることがセキュリティ上の懸念として挙がっており、Okta 側は仕様と回答したとされる【二次】
    - https://support.okta.com/help/s/question/0D54z0000A1C5HICQ0/access-requests-block-approving-your-own-access-when-approvers-are-set-to-group-owners

### S5. 金融庁『内部統制報告制度に関する事例集 〜中堅・中小上場企業等における効率的な内部統制報告実務に向けて〜』(平成23年3月策定・令和5年8月改訂)【原文確認】

- URL: https://www.fsa.go.jp/news/r5/sonota/20230831-2/03.pdf
- 取得日: 2026-11-11
- 原文の引用
  - 前文 p.1: 「事業規模が小規模で、比較的簡素な構造を有している組織等において、資源の制約等の下、様々な工夫を行い、内部統制の有効性を保ちつつも、効率的に内部統制の評価等が行われていた事例を企業、監査人等から収集し」
  - 事例3-10「規模の差異を考慮した直接的なモニタリングの実施」p.25: 「当社は、小規模な小売業であり、店舗数が少なく、従業員数も少ないため、経営者が日常の業務活動に広範に関与している。」「当社の経営者の誠実性及び倫理的価値観の保持、監査役会による監視活動、内部通報の仕組みといった全社的な内部統制は有効であり、経営者等が内部統制を無効化するリスクに対し、適切な対応がとられていると考えられる。このため、経営者による直接的なモニタリングを業務プロセスに係る内部統制の評価手続の中心としている。」「監査人とも協議を行い」
  - 同 【参考】に引かれた実施基準 Ⅲ.4.(2)①ロ.a: 「事業規模が小規模で、比較的簡素な構造を有している組織等においては、経営者が直接行った日常的モニタリングの結果や監査役が直接行った内部統制の検証結果(例えば、棚卸の立会などの往査の結果をまとめた報告書等)を内部統制の実施状況の検証として利用するなど、効率的な運用状況の検討が可能な場合があることに留意する。」
  - 事例2-1 p.7: 「親会社の経理部に信頼性のある財務報告の作成を支えるのに必要な能力を有した社員がいないことに対応するため、会計参与を置いている。」/ 引用された Q&A 問42: 「企業において、専門家が実施した業務結果について、依頼した基本的内容を満たしているかを確認することが求められる」
  - 事例5-1 / 実施基準 Ⅱ.3.(6) の抜粋 p.36: 「評価範囲の除外に関しては、その範囲及びその理由を内部統制報告書に記載することが必要であり」
  - 実施基準 Ⅱ.3.(7)① の抜粋 p.38: 「特に、事業規模が小規模で、比較的簡素な構造を有している組織等においては、様々な記録の形式・方法をとりうる。」
  - IT 全般統制チェック・リスト例 G10 p.29: 「情報システム部門内の規程等により、要員間の相互牽制の観点から、必要な職務分離(開発業務と運用業務の分離等)を定め、実施しているか」/ G4: 「ユーザ ID 及びアクセス権限の付与申請、承認、発行、一時停止、削除を適切に行うための対策を講じているか」
- 示唆
  - 日本の内部統制報告制度は、小規模・簡素な組織で「経営者自身が直接モニタリングする」ことを認める。ただし事例3-10 は、その前提として「経営者等が内部統制を無効化するリスク」への対応(監査役会の監視、内部通報の仕組み)が有効であることを置いている。経営者の直接関与は、経営者を見張る別の層があって初めて代わりになる、という構造である
  - 代わりの統制の型として、(a) 経営者の直接モニタリング、(b) 監査役(組織内だが執行から独立)の検証、(c) 外部の専門家(会計参与)の利用と、その結果の確認、(d) 制約の範囲と理由の開示(内部統制報告書への記載)、が事例で確かめられる
  - 監査人との協議が多くの事例に現れる。外部の者が、簡略化の妥当性を確かめる役を担っている
- 注意
  - 実施基準そのもの(令和5年改訂の意見書 別紙1、https://www.fsa.go.jp/news/r4/sonota/20230407/1.pdf)は PDF の文字を取り出せず、本文を通読していない。上の実施基準の文は、事例集の【参考】に金融庁が抜粋したものによる。実施基準本体の「職務分掌」「経営者による内部統制の無効化」の節の原文は未確認
  - 令和5年改訂の要点(内部統制の無効化が経営者以外の業務プロセスの責任者によっても行われうることの明示など)は、二次情報で確かめただけである【二次】
    - https://www.zeiken.co.jp/zeikenpress/press/0004pp20240209/

### S6. ISO/IEC 27001:2022 附属書A 5.3 / ISO/IEC 27002:2022 5.3 職務の分離【二次(規格本文は未確認)】

- URL
  - 規格の目次(公開プレビュー、ISO/IEC 27002:2022 redline): https://cdn.standards.iteh.ai/samples/75652/0430bd40787c42488cea9c48525b8fc2/ISO-IEC-27002-2022.pdf 【原文確認(目次と序文のみ)】
  - 解説: https://www.isms.online/iso-27001/annex-a-2022/5-3-segregation-of-duties-2022/ 、https://isms.online/iso-27002/control-5-3-segregation-of-duties 【二次】
  - 解説: https://advisera.com/27001academy/?p=10589 、https://hicomply.com/iso-27001/iso-27001-annex-a-5.3 【二次】
- 取得日: 2026-11-11
- 確かめたこと
  - 公開プレビューで読めたのは目次と序文までで、5.3 の本文(p.25)は含まれていない。目次から、2022 版の 5.3 は 2013 版の 6.1.2 を引き継ぐことだけを確かめた【原文確認】
  - 序文 0.1: "This document is designed for organizations of all types and sizes." 【原文確認】
- 二次情報が伝える内容【二次】
  - 統制の趣旨は "conflicting duties and conflicting areas of responsibility are separated"(isms.online の言い換え)
  - 小規模の組織について: "While smaller organisations may have difficulty with this, the principle should be applied as much as possible" / "activity monitoring, audit trails, and management supervision can be used"(isms.online)
  - 2013 版 6.1.2 の手引きの趣旨として「分離が実際的でない小規模の組織では、活動の監視、監査証跡、管理者の監督を行う」と紹介する解説が複数ある(hicomply ほか)
- 示唆
  - ISO 系の手引きは、小規模の組織での分離の困難を認め、「原則は可能な限り適用し、できない部分は監視・監査証跡・管理者の監督で補う」という型である【二次に基づく】
  - ただし「管理者の監督」は、決定者その人が当事者である場面(本論点)では、決定者より上位の者がいないと成り立たない。1〜2名の体制では、この補い方の一部が使えない【推測】
- 穴: ISO/IEC 27002:2022 5.3 の本文と「その他の情報」の原文、および 2013 版 6.1.2 の原文を確かめていない。ISO OBP(https://www.iso.org/obp)は用語の定義以外の本文を表示しない

### S7. GitHub Docs『About protected branches』【原文確認】

- URL: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- 取得日: 2026-11-11
- 原文の引用
  - "most recent reviewable push must be approved by someone other than the person who pushed it"
  - "the restrictions of a branch protection rule do not apply to people with admin permissions" (既定)
  - "You can enable this setting to apply the restrictions to admins"(Do not allow bypassing the above settings)
- 示唆
  - 開発の現場の基盤でも、最後の変更を押した者以外の承認を求める設定がある。一方で既定では管理者がこれを迂回できる。迂回を塞ぐかどうかは、別の設定で明示的に選ぶ
  - 本論点に当てはめると、「決定者」は GitHub の管理者に当たることが多く、既定のままでは技術的な錠が決定者に効かない【推測】

### S8. SLSA v1.2 Source Track『Source requirements』【原文確認】

- URL: https://slsa.dev/spec/v1.2/source-requirements
- 取得日: 2026-11-11
- 原文の引用
  - Level 4: "The SCS requires two trusted persons to review all changes to protected branches."
  - "Changes in protected branches MUST be agreed to by two or more trusted persons prior to submission."
  - 組合せ: "Uploader and reviewer are two different trusted persons." / "Two different reviewers are trusted persons."
  - 例外: "An organization MAY choose to grant a Trusted Robot a perpetual exception to a policy."
- 示唆
  - SLSA は二者の合意を最上位の水準(L4)だけに課し、下位の水準では課さない。人数が足りない場合の例外は設けず、満たせない体制は L4 を名乗れない、という扱いである(緊急時・小規模・単独の保守者についての記述はない)
  - 「例外を設けて同じ水準を名乗らせる」のではなく「到達できない水準を表示する」型として参照できる【推測】

---

## 2. 横断の整理(原文で確かめた事実だけで組む)

### 2.1 自己承認の扱いの3つの型

- 型A: 仕様として禁止し、例外の経路を持たない
  - Entra ID PIM: 承認者は自分の有効化要求を承認できない(S3)
  - SLSA L4: 二者の合意を必須とし、人数不足の例外を持たない(S8)
- 型B: 禁止を既定とし、組織の明示の選択で許す
  - Okta Access Requests: 委任による承認者では自己承認を止め、明示の指名では許す(S4)
  - GitHub: 既定では管理者が保護規則を迂回でき、迂回の禁止は別の設定で選ぶ(S7)
- 型C: 分離を原則とし、実際的でないときは代わりの統制で補う
  - COSO 2013(S1)、NIST AC-5(S2)、ISO/IEC 27002 5.3【二次】(S6)、J-SOX 事例集(S5)

### 2.2 代償の統制の型(出典の対応つき)

- 発見の統制(事後)
  - 事後のレビュー・監視
    - 経営者の直接モニタリング(S5 事例3-10)
    - 活動の監視・監査証跡(S6【二次】、S2 の auditing)
  - 通知と事後の取消し
    - PIM の有効化の通知と、特権管理者による取消し(S3)
- 独立した者の確認
  - 組織内で執行から独立した者: 監査役・監査役会、内部通報の仕組み(S5)
  - 外部の者: 監査人との協議、外部の専門家(会計参与)の利用と結果の確認(S5)
- 開示
  - 実施できなかった範囲とその理由を報告書に記載する(S5 事例5-1、実施基準 Ⅱ.3.(6))
  - 到達できない水準を名乗らない(S8)【推測を含む】
- 前提条件
  - 経営者の関与を代わりの統制にするには、経営者自身の無効化への対応が別に要る(S5 事例3-10、S1 Limitations)

---

## 3. 考察(調査者の解釈。事実ではない)

- 本論点の2つの場面は、性質が違う
  - 「自分が当事者になる兼務の決定」は、権限の付与を自分で承認する行為で、PIM が仕様で禁じる自己承認(S3)や、COSO の management override(S1)に当たる
  - 「自分の名簿の行の表記の変更」は、本人確認の記録(識別子)の変更で、AC-5 の解説が分けるべきとする「アクセス制御の管理」と「監査」の兼務(S2)に近い。表記の変更を装った別人への差し替えが起きうる点が、兼務の決定とは別の危険である
- どの枠組みも「小規模だから分離を免除する」とは書いていない。共通するのは「分離できない部分を特定し、代わりの統制を置き、その事実を記録する」ことである(S1・S5・S6)
- 1〜2名の体制では、ISO 系の「管理者の監督」や J-SOX の「経営者の直接モニタリング」は使えない(当事者が決定者その人だから)。残る型は、(1) 事後のレビューを別の時点・別の者が行う(1名でない限り、もう1名が事後に確かめる)、(2) 外部の者による確認、(3) 自己承認だった事実の開示(記録に残し、後から読める状態にする)である
- 採らない型の候補(会議体での検討用)
  - 「人数不足なら自己承認を認め、記録も残さない」: どの出典もこの型を支えない
  - 「自己承認を一律に禁止し、1名の体制ではその変更を不可能にする」: SLSA は水準を名乗らせない形でこれに近いが、プロセス標準として運用を止めることになる。採否は会議体で争うべき論点である
- 1名の体制での実効性は、いずれの出典でも実証されていない。条項にするなら根拠水準マーク(ADR-0026)の対象になる

---

## 4. 埋められなかった観点(追加の調査が要る穴)

- ISO/IEC 27002:2022 5.3 の本文と「その他の情報」の原文(小規模の組織の記述の有無と文言)。公開プレビューは目次と序文までで、5.3 に届かない。JIS Q 27002:2024 の閲覧(JISC の JIS 検索)で確かめる余地がある
- ISO/IEC 27001:2022 附属書A 5.3 の統制文の原文(二次情報の言い換えだけで確かめた)。適用宣言書での除外の扱い(箇条6.1.3 d)も未確認
- J-SOX 実施基準(令和5年改訂)本体の「職務分掌」と「経営者による内部統制の無効化」の節の原文。PDF の文字を取り出せなかった
- COSO 2013 本体の原則10 の着眼点、COSO 2006 年の小規模公開企業向けガイダンスの原文(有償)
- NIST SP 800-53 Rev.5 の原典 PDF との逐語照合(転載サイト経由で読んだ)
- 自分の名簿の行(氏名・アカウント)の変更、すなわち識別子の変更を自分で行うことに特化した規定(NIST IA-4 識別子の管理、SP 800-63 の本人確認の変更)を調べていない
- Okta の Group Owner での自己承認の挙動が 2026-11 時点で変わったか(コミュニティ投稿は 2024〜2025 年)
- 日本の小規模の企業(1〜2名の取締役の会社)での実運用の実態(建前と実運用の乖離)を示す一次情報は見つけられなかった
