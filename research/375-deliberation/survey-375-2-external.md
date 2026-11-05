# #375 外部調査: 本人確認と権限の付与の順序、同じ取引の中の確認と行使

- 調査日: 2026-11-05(取得日はすべて同日)
- 範囲: 既存規格と業界の実務。リポジトリは読むだけで、この文書のほかは書き換えていない
- 前提: 内部調査 `survey-375-1-internal.md` を読んだうえで行った。案(a) = 同じ変化点の確認を数える、案(b) = 前の変化点での確認を要求する
- 表記: 「原文」は取得したページで確かめた引用。「事実」は原文から直接言えること。「示唆」は本件への当てはめで、筆者の解釈である。推測は「推測」と明記する
- 二次資料(規格の要約サイト)から引いたものは、その旨を明記し、規格の原文として扱わない

## 1. 本人確認と権限の付与の順序

### 1.1 21 CFR Part 11 §11.100(電子署名の一般要件)

- URL: https://www.law.cornell.edu/cfr/text/21/11.100 (eCFR は取得時に転送で読めず、LII の写しで確かめた)
- 原文:
  - (a) "Each electronic signature shall be unique to one individual and shall not be reused by, or reassigned to, anyone else."
  - (b) "Before an organization establishes, assigns, certifies, or otherwise sanctions an individual's electronic signature, or any element of such electronic signature, the organization shall verify the identity of the individual."
  - (c) "Persons using electronic signatures shall, prior to or at the time of such use, certify to the agency that the electronic signatures in their system ... are intended to be the legally binding equivalent of traditional handwritten signatures."
- 事実:
  - (b) は身元の確認を、署名を「確立・割当・認証・承認する」**前**(Before)に置く
  - 同じ条の (c) は、署名の効力の宣言を「使用の前**または使用の時点**」(prior to or at the time of such use)で認める。同じ条の中で、「前」と「同時でもよい」を書き分けている
  - (b) の確認の主体は「組織」であり、確認者を署名者本人以外にする旨や、確認と割当を別の者が行う旨は書かれていない
- 示唆:
  - (b) の「前」は、**確認が完了する前に署名が効力を持ってはならない**という前後の要求である。確認と割当を**別の取引(別の変化点)に分ける**ことまでは文言から読めない。1つの手続の中で、確認を済ませてから割当てる順序で足りる、と読むのが文言に沿う(解釈)
  - 本件に当てはめると、要求の芯は「確認の記録が効く前に、その氏名で席の責任者を確定してはならない」である。案(a) でも、同じ変化点の中で「確認の記名の検査 → 確認を数える → 任命の検査」の順に評価するなら、この前後は守られる(解釈)
  - (c) の書き分けは「同時でよい場合は明示する」という起草の作法を示すとも読める。その読みを採ると、(b) は「同時」を明示していないので、少なくとも確認の完了が割当に論理的に先行することを要する。ただし「別の機会」を要するとまでは読めない(解釈)
  - 1997 年の最終規則の前文(62 FR 13430)の §11.100(b) への注釈は取得できなかった(穴)

### 1.2 NIST SP 800-53 Rev.5 AC-2(アカウントの管理)

- URL: https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-2/ (NIST の CPRT は動的ページで取得できず、本文の写しで確かめた)
- 原文:
  - c. "Require [Assignment: organization-defined prerequisites and criteria] for group and role membership;"
  - e. "Require approvals by [Assignment: organization-defined personnel or roles] for requests to create accounts;"
  - f. "Create, enable, modify, disable, and remove accounts in accordance with [Assignment: organization-defined policy, procedures, prerequisites, and criteria];"
  - i. "Authorize access to the system based on: A valid access authorization; Intended system usage; ..."
  - 補足の説明: "emergency account activation may bypass normal account authorization processes."
- 事実:
  - 役割の所属(group and role membership)に「前提条件」(prerequisites)を課すよう求める。前提条件の中身と、それを満たす時点は組織が定める
  - アカウントの作成の「申請」に承認を要する。申請・承認・作成が別の取引であることは要求していない
- 示唆:
  - 本件の「氏名の確認」は、席への任命(役割の所属)の前提条件に当たる。AC-2 c は前提条件を課すことを求めるが、「前提条件は前の取引で満たされていなければならない」とは言わない。時点の定めは組織に委ねられている(解釈)。すなわち本標準が自分で決めるべき事項であり、外部規格からは一意に導けない

### 1.3 NIST SP 800-53 Rev.5 IA-12(本人確認)

- URL: https://csf.tools/reference/nist-sp-800-53/r5/ia/ia-12/
- 原文:
  - a. "Identity proof users that require accounts for logical access to systems based on appropriate identity assurance level requirements ..."
  - 補足の説明: "Identity proofing is the process of collecting, validating, and verifying a user's identity information for the purposes of establishing credentials for accessing a system." / "Identity proofing is intended to mitigate threats to the registration of users and the establishment of their accounts."
  - IA-12(1) Supervisor Authorization: "Require that the registration process to receive an account for logical access includes supervisor or sponsor authorization."
- 事実:
  - IA-12(1) は、本人確認と上長・スポンサーの承認を「登録の手続」(the registration process)の**中に含める**形で書いている。確認と承認を同じ手続の構成要素として扱う
  - 確認は、登録とアカウントの確立への脅威を減らすために行う。確認と確立は目的と手段の関係で書かれ、取引の分割は書かれていない
- 示唆:
  - 「確認」「承認」「アカウントの確立」を1つの登録の手続にまとめることは、NIST の統制の書き方と整合する。案(a) の形(1つの変化点の中に確認の記名と任命が並ぶ)は、IA-12(1) の「登録の手続が承認を含む」と同じ構造である(解釈)

### 1.4 NIST SP 800-63A-4(本人確認と加入、2025-08 版)

- URL: https://pages.nist.gov/800-63-4/sp800-63a.html
- 原文:
  - 2.1.1(流れの4): "the applicant can be enrolled into a subscriber account with the CSP" / "one or more authenticators are bound to the proven identity in the subscriber account"
  - IAL1: "Upon the successful completion of identity proofing, the applicant is enrolled into a subscriber account"
  - IAL3: "The successful on-site identity proofing session concludes with the enrollment of the applicant into a subscriber account"
  - 第4章の使い勝手の指針: "These steps may occur in a single session, or there could be a significant amount of time between each one"
  - 継続コード: "CSPs MAY use continuation codes when an applicant is unable to complete all of the steps necessary to be successfully identity-proofed and enrolled ... in a single session"
  - 第5章: "The CSP SHALL establish and maintain a unique subscriber account for each active subscriber in its identity system from the time of enrollment to the time of account closure." / "The CSP may enroll and establish a subscriber account for applicants who have not been identity-proofed (e.g., pseudonymous accounts) and record such status in the subscriber account."
  - 第5章(アカウントに含める情報): "Maximum IAL successfully achieved for the identity proofing of the subscriber" / "A record of the identity proofing steps completed for the subscriber"
  - 3.2.1(不正の管理 13): "Collusion is possible whenever CSP representatives are directly involved in proofing processes or decisions." / "CSPs SHALL implement insider threat controls to detect and prevent collusion"
- 事実:
  - 順序は「確認の成功 → 加入(enrollment) → 認証器の結び付け」。前後は求めるが、**1つのセッションで完了する形を基本の形として扱い**(IAL3 は1つのセッションの終わりに加入する)、分かれる場合のために継続コードを用意している
  - 確認していない申請者のアカウントも作れるが、その状態をアカウントに記録する。達成した IAL と確認の手順の記録をアカウントに持たせる
  - 確認の担当者と申請者の分離は、名指しの職務分離ではなく「共謀を検出・防止する内部脅威の統制」として求める
- 示唆:
  - 800-63A の考え方は「確認の成功を先に、その結果に依存する行使を後に」という**論理の前後**であり、取引を分けることではない。1つのセッションの中での確認 → 加入が基本形である(解釈)
  - 「確認の状態をアカウントに記録する」は、本件の「確認の旨を名簿の変更として記録する」と対応する。記録が同じ変化点に載るか前の変化点に載るかを、800-63A は区別しない(解釈)
  - 共謀の統制は、確認者と申請者(本件では確認者と任命される本人)の関係に向けられる。案(a)・(b) のいずれでも、確認者が本人以外であることの検査は変わらない(内部調査 5.2)

### 1.5 ISO/IEC 29115:2013(実体認証の保証の枠組み)

- URL: https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiec29115%7Bed1.0%7Den.pdf (公開プレビュー。目次・序文・図1まで)
- 原文(序文の図1 "Overview of the Entity Authentication Assurance Framework"):
  - Enrolment phase: "Application and initiation" / "Identity proofing and identity information verification" / "Record-keeping/recording" / "Registration"
  - Credential management phase: "Credential creation" / "Credential pre-processing" / "Credential issuance" / "Credential activation" / "Credential storage" / ...
  - 目次: "8.1 Enrolment phase" / "8.2 Credential management phase" / "10.1 Threats to, and controls for, the enrolment phase"
  - 前書き: "A similar text is published as ITU-T Recommendation X.1254."
- 事実:
  - 加入の段階(確認 → 記録 → 登録)と、資格情報の管理の段階(発行 → 有効化)を**別の段階**として並べる
  - 8.1・10.1 の本文はプレビューに含まれず、段階が別の取引であることを要するのか、論理の区分にとどまるのかは確かめられなかった
- 示唆:
  - 段階の区分は「確認と記録が、資格情報の発行・有効化より先」という論理の前後を示す。本件では「確認の記録 → 任命(資格の行使)」の順に当たる(解釈)
  - 区分が取引の分割を要するかは不明(穴)。ITU-T X.1254 は無償で入手できる見込みがあり、8.1 の本文の確認に使える(推測)

### 1.6 ISO/IEC 27001:2022 附属書A 5.16・5.18、ISO/IEC 27002:2022(二次資料のみ)

- URL: https://www.isms.online/iso-27001/annex-a-2022/5-18-access-rights-2022/ (コンサルティング会社の解説。ページ自身が AI で作成した旨を書いている)
- 二次資料の記載(規格の原文ではない):
  - "Authorisation from the owner of the information system or service"
  - "should consider requesting separate approval from management before granting access rights"
  - "protection against provisioning occurring before authorisation has been obtained"
  - "access rights are activated once the appropriate authorisation process has been completed."
- 事実として言えること:
  - 27002:2013 の 9.2.2 に相当する「認可の手続が完了する前に権利を有効にしない」趣旨が、2022 年版 5.18 の指針にも引き継がれていると、複数の二次資料が述べる。規格の原文では確かめていない
  - 27002:2013 の 9.2.1(利用者の登録と抹消)が 2022 年版で 5.16(識別情報の管理)へ移った、と二次資料が述べる
- 示唆:
  - 「有効化は認可の完了の後」は、800-63A・Part 11 と同じく**完了と行使の前後**を求める。同じ取引か別の取引かは問わない書き方である(二次資料に基づく解釈)
  - JIS Q 27001:2023 は ISO/IEC 27001:2022 の一致規格であるとされるが、本調査では JIS の本文を確かめていない(穴)

## 2. 職務の分離のもとでの、申請者・確認者・承認者の要件

### 2.1 NIST SP 800-53 Rev.5 AC-5(職務の分離)

- URL: https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-5/
- 原文: "Identify and document [Assignment: organization-defined duties of individuals]; and" / "Define system access authorizations to support separation of duties."
  - 例: "dividing mission or business functions and support functions among different individuals or roles" / "ensuring that security personnel who administer access control functions do not also administer audit functions"
  - OT の説明: "The organization carefully considers the appropriateness of a single individual performing multiple critical roles."
- 事実: 分離は「どの職務を別の者に持たせるか」で定める。職務を同じ取引に置くか別の取引に置くかは扱わない
- 示唆: 本件で分離が意味を持つのは「確認者 ≠ 任命される本人」であり、これは案(a)・(b) で変わらない。確認と任命を同じ山田が記名することは、AC-5 の分離の対象(別の者に持たせる職務)として定められていない限り、分離の違反にならない(解釈)

### 2.2 Microsoft Entra ID Governance(エンタイトルメント管理)

- URL: https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-approval-policy (更新 2026-04-09)
  - 原文: "Each access package must have one or more access package assignment policies, before an identity can be assigned access."
  - 原文: "Note: Approvers aren't able to approve their own access package requests."
  - 原文: "Only one of the selected approvers from each stage needs to approve a request for multi-stage approval for the request to progress to the next stage."
  - 原文: "Ensure that you list different sets of people to be the first, second, and alternate approvers."
- URL: https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-verified-id-settings (更新 2026-04-09)
  - 原文: "Sometimes you might want users to present extra identity proofs during the request process such as a training certification, work authorization, or citizenship status."
  - 原文: "Approvers can then quickly view if a user's verifiable credentials were validated at the time that the user presented their credentials and submitted the access package request."
  - 原文: "After you share your credentials, My Access will automatically take you to the next step of the request process."
- 事実:
  - Entra は、**身元の証明(Verified ID・Face Check)を同じ申請の中で行い、その結果を見て承認者が同じ申請を承認する**流れを製品の標準機能として持つ。確認と承認を別の申請に分けることを求めていない
  - 自己承認は製品が禁じる(承認者は自分の申請を承認できない)。多段の承認では、段ごとに別の人の集合を置くよう勧める
- 示唆:
  - 業界の実務の主流は「1つの申請の中で、確認 → 承認 → 付与 の順に段を進める」形である。独立は**段の順序と、段を担う人の分離**で担保し、取引の分割では担保しない(解釈)
  - 本件では、確認(山田の記名、本人以外)→ 任命(山田の記名)を1つの変化点で行う案(a) は、Entra の1申請の多段と同じ構造である。Entra なら、確認と承認を同じ人に持たせるかは方針の設定であり、自己承認だけが製品として禁じられる(解釈)

### 2.3 Okta Identity Governance(アクセスの申請)

- URL: https://help.okta.com/oie/en-us/content/topics/identity-governance/access-requests/ar-overview.htm
- 原文: "An approval sequence is a linear series of steps like questions, Okta Workflows, approvals, and tasks." / 申請の種類は "These flows are made of steps like questions, tasks, and timers."
- 事実: 確認の作業(task)と承認(approval)を、1つの申請の中の直列の段として並べる。自己承認の扱いと、申請の中での身元の確認は、このページでは確かめられなかった
- 示唆: Entra と同じく、確認と承認を「1申請・直列の段」として扱うのが製品の設計である(解釈)

### 2.4 GitHub(ブランチの保護・CODEOWNERS)

- URL: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - 原文: "the most recent reviewable push must be approved by someone other than the person who pushed it."
  - 原文: "dismiss stale pull request approvals when commits are pushed that affect the diff in the pull request."
- URL: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
  - 原文: "To trigger review requests, pull requests use the version of `CODEOWNERS` from the base branch of the pull request."
  - 原文: "For code owners to receive review requests, the CODEOWNERS file must be on the base branch of the pull request."
- 事実:
  - GitHub は、PR の審査者(コードオーナー)を決める規則を、**PR が変える前の構成(基底ブランチの CODEOWNERS)**から読む。PR の中で自分をコードオーナーに足しても、その PR の審査の要求には効かない
  - 承認を、変更を最後に push した者以外に求める設定がある。承認の後に差分が変われば承認を外せる
- 示唆:
  - これは案(b) を支える最も近い先例である。**統制の構成そのもの(誰が審査者か)を変える変更は、変更前の構成で評価する**、という設計である。本件の「名簿・席の任命」は、本標準で統制の構成そのもの(誰が責任者か)に当たる(解釈)
  - ただし、CODEOWNERS の例が防ぐのは「変更者が自分を審査者にして自分で通す」経路である。本件では、確認者(山田)が自分ではなく Dupont を確認して任命する。CODEOWNERS の先例が直接に塞ぐ経路(自己の権限の付与)は、本件では内部調査 5.2 の `self` の判定と L5228 がすでに塞いでいる。先例の趣旨を本件へ当てはめると、「Dupont の氏名の確認が、Dupont を責任者にする同じ変更の評価に効く」ことが、変更が自分の評価の前提を自分で作る形に当たるかが論点になる(解釈)

### 2.5 Kubernetes RBAC(権限の昇格の防止)

- URL: https://kubernetes.io/docs/reference/access-authn-authz/rbac/#privilege-escalation-prevention-and-bootstrapping
- 原文:
  - "The RBAC API prevents users from escalating privileges by editing roles or role bindings."
  - "You can only create/update a role binding if you already have all the permissions contained in the referenced role (at the same scope as the role binding) or if you have been authorized to perform the `bind` verb on the referenced role."
  - "When bootstrapping the first roles and role bindings, it is necessary for the initial user to grant permissions they do not yet have."
- 事実:
  - 役割の結び付けの可否を、**要求の時点で既に持っている権限**("already have")で判定する。同じ要求で作る権限は判定に数えない
  - 最初の構成(bootstrapping)は、この規則の外の特別な資格で行う
- 示唆:
  - 「権限を付与する操作の可否は、付与の前の状態で判定する」という設計の先例である。ただし判定の対象は**操作者(付与する者)の権限**であって、**付与される者の前提条件**ではない。本件の氏名の確認は、付与される者(Dupont)の前提条件であり、付与する者(山田)の権限ではない。この先例は案(b) を直接には支えない(解釈)
  - bootstrapping の扱いは、本標準の「初回の記入」「1名の体制」の例外(内部調査 1.2 L1994)と同じ形の設計である(解釈)

## 3. 規制業の記録の規則で、署名の前に身元の確認を要するもの

- 21 CFR Part 11 §11.100(b) は 1.1 のとおり。「確認 → 署名の確立・割当」の前後を要し、同じ手続の中かを問わない
- 他の規則(EU GMP Annex 11、PIC/S PI 041 など)の該当箇所は、時間の範囲で確かめられなかった(穴)
- 製品の実装の例(二次資料): Rockwell Automation の FactoryTalk Optix の説明は、§11.100(b) を、署名を承認する前に身元を確かめることを利用者側の責任とする、と解説する(https://www.rockwellautomation.com/en-us/docs/factorytalk-optix/1-5-7/contents-ditamap/additional-user-assistance/complying-with-the-part-11-regulation/electronic-signatures.html 、検索結果の要約で見たのみで、本文は取得していない)

## 4. 確認と行使を同じ取引で行うと、確認の独立が損なわれるか

### 4.1 四眼原則・maker-checker

- URL: https://en.wikipedia.org/wiki/Maker-checker 、https://openriskmanual.org/wiki/Four_Eyes_Principle (いずれも標準文書ではない。検索結果の要約で見たのみ)
- 要約で確かめた内容: maker-checker は、取引を作る者(maker)と、それが効力を持つ前に審査・承認する者(checker)を別の者にする統制。製品の実装では「入力した者は確認者になれない」と定める例がある。権限のある者が入力した場合に第2の確認を要しない、という実装の例外もある
- 事実(原文で確かめた範囲では未確認): 四眼原則は**人の分離**(作る者 ≠ 承認する者)を求める原則であり、取引の分割(作ると承認するを別の取引にする)を本質として求める定義は、見た範囲では無い
- 示唆:
  - 本件の確認の独立は「確認する者 ≠ 確認される本人」で決まる。確認と任命を同じ変化点に置いても、2つに分けても、記名するのが同じ山田なら、独立の度合いは変わらない。これは #319 の擁護者の見解(内部調査 3.2、council-05-defender.md L70〜71)と一致する(解釈)
  - 四眼原則に照らして本件で問題になりうるのは、「確認」と「任命の決定」を同じ1人(山田)が担うことのほうである。これを分けるのは内部調査 5.4 の案(d) に当たり、案(a)・(b) のいずれも、この点では差を生まない(解釈)

### 4.2 原子的な変更(atomic change)の扱い

- 原文で確かめた先例は 2.4(GitHub CODEOWNERS)と 2.5(Kubernetes RBAC)である
- 事実:
  - どちらも、統制の構成を変える変更を、**変更前の状態で判定する**
  - 一方、IAM 製品(2.2・2.3)は、1つの申請の中で、前の段(確認)の結果を後の段(承認・付与)の判定に使う。申請の中の段は順序を持ち、段の結果は同じ申請の後の段から見える
- 示唆(2つの設計の違い):
  - 「変更前の状態で判定する」設計は、**判定の規則そのもの**(誰が審査者か、誰が何の権限を持つか)が変更の対象になるときに使われる。変更が自分の判定の規則を書き換えて自分を通すことを防ぐためである(解釈)
  - 「同じ申請の前の段を後の段で数える」設計は、**付与の前提条件**(本人確認・資格の提示)が申請の中で満たされるときに使われる(解釈)
  - 本件の氏名の確認は、どちらに当たるか。氏名の確認は「その名義の人を名簿に置き、記名の欄に使えるか」の前提条件であり、判定の規則(誰が確認できるか、本人の記名は効かない)を変えるものではない。この区分に従うなら、案(a)(同じ変化点の前の段として数える)が IAM の実務に近い(解釈)
  - 反対の読み: 名簿は本標準の統制の構成の一部であり、席の責任者は緩める向きの決定の記名者になりうる(ADR-0055)。統制の構成を変える変化点を、変化点の前の構成で判定するという GitHub 型の原則を一般に採るなら、案(b) が首尾一貫する。ただしその場合、名簿へ人を足して同じ変化点で任命すること一般(AI を示す語を含まない氏名でも)を変化点の前の構成で判定するか、という範囲の問題が生じる。氏名の確認だけを GitHub 型で判定すると、同じ変化点の中で、名簿の追加と任命は後の構成で、氏名の確認だけは前の構成で判定する、という混在になる(解釈)

## 5. 考察(筆者の解釈。事実と分けて記す)

- 外部の規格(Part 11 §11.100(b)、800-63A、IA-12、27002 5.18 の二次資料、29115 の段階の区分)は、そろって「**確認の完了 → それに依存する付与・行使**」の**論理の前後**を求める。いずれも、確認と付与を**別の取引に分けること**を、見た範囲の原文では要求していない。800-63A は1つのセッションでの完了を基本の形とし、IA-12(1) は承認を登録の手続の中に含める
- 業界の IAM の実務(Entra・Okta)は、確認と承認を1つの申請の直列の段として扱う。独立は、段の順序と、段を担う人の分離(自己承認の禁止)で担保する
- 案(b) を支える先例は、GitHub の CODEOWNERS(基底ブランチの構成で判定)と Kubernetes の RBAC(既に持つ権限で判定)である。いずれも「判定の規則・操作者の権限」を変更前の状態で読む設計であり、「付与される者の前提条件」を前の取引で満たすことを要する先例ではない
- 以上から、外部の規格と実務に照らす限り、同じ変化点で確認して任命することを拒否する根拠(案(b))は、規格の要求としては見当たらない。要求されるのは、変化点の中で「確認の記名の検査 → 確認を数える → 任命の検査」の順を守ることである。これは案(a) の形で満たせる
- ただし、案(b) を採る理由として「統制の構成を変える変化点は、変化点の前の構成で判定する」という一般原則を本標準が採るかどうかは、外部規格からは決まらない。AC-2 c が前提条件と時点を組織に委ねているとおり、本標準が自分で決める事項である。この原則を採るなら、氏名の確認に限らず、名簿の追加と任命の判定の全体に及ぼすかを決める必要がある
- 監査の観点: 800-63A 第5章は、確認の状態と手順をアカウントの記録に持たせる。本件では1件の変化点の記録に `nameConfirmations` と `decidedBy` と任命の差分が並ぶため、記録から順序と確認者が読める。前の変化点に分けないと監査の追跡が損なわれる、という主張を支える外部の規定は見当たらない
- 日本の企業文化の実態(建前と実運用の乖離)に触れる資料は、本件の範囲では見つからなかった

## 6. 埋められなかった穴

| # | 穴 | 次の手 |
| --- | --- | --- |
| 1 | Part 11 の前文(62 FR 13430、1997-03-20)の §11.100(b) への注釈 | Federal Register の原本を引く。「同時」を許すかの FDA の見解があるか |
| 2 | ISO/IEC 27002:2022 5.16・5.18 の原文 | 規格の本文、または JIS Q 27002:2024 の本文。二次資料の「認可の完了の後に有効化」を確かめる |
| 3 | ISO/IEC 29115 8.1・10.1 の本文 | ITU-T X.1254(同等の本文、無償)の 8.1 |
| 4 | JIS Q 27001:2023 の附属書A 5.16・5.18 の文言 | JISC の閲覧 |
| 5 | EU GMP Annex 11、PIC/S PI 041 の署名者の身元の確認 | 原文 |
| 6 | 四眼原則の標準文書での定義(取引の分割を含むか) | BCBS・ECB・ISO 37301 等での定義 |
| 7 | GitHub の PR 作成者が自分の PR を承認できない旨の原文 | GitHub Docs の pull request reviews の頁 |
| 8 | 日本企業の実務で、ID 申請の同一稟議内での本人確認と承認の扱い | 国内の J-SOX・IT 全般統制の解説 |

## 出典

- https://www.law.cornell.edu/cfr/text/21/11.100
- https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-2/
- https://csf.tools/reference/nist-sp-800-53/r5/ia/ia-12/
- https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-5/
- https://pages.nist.gov/800-63-4/sp800-63a.html
- https://assets.vde-verlag.de/iec-normen/preview-pdf/info_isoiec29115%7Bed1.0%7Den.pdf
- https://www.isms.online/iso-27001/annex-a-2022/5-18-access-rights-2022/ (二次資料)
- https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-approval-policy
- https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-verified-id-settings
- https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-approve
- https://help.okta.com/oie/en-us/content/topics/identity-governance/access-requests/ar-overview.htm
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- https://kubernetes.io/docs/reference/access-authn-authz/rbac/#privilege-escalation-prevention-and-bootstrapping
- https://en.wikipedia.org/wiki/Maker-checker (検索結果の要約のみ)
- https://openriskmanual.org/wiki/Four_Eyes_Principle (検索結果の要約のみ)
